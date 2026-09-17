# The logo that only showed up in the inspector

*September 2026*

I spent an evening this week on a bug that made me feel like the browser was
gaslighting me. I want to write it down while the embarrassment is still
fresh, because the lesson is small and I will forget it otherwise.

## Where this started

Gradients Studio began as a mesh gradient toy. Over the last month I have
been pushing it toward the thing I actually use it for: backgrounds for
product sites, launch posts and decks. The grainy, dithered look that half
the AI startups have on their marketing pages right now.

The newest piece of that is an Overlay section. You pick a shape, a circle
or a squircle or a star, and the studio draws concentric outlines of it
across the gradient, spaced evenly, like ripples. It is the effect you see
behind a lot of hero sections, and it took real effort to make the rings
expand the way Illustrator's Offset Path does rather than like a scaled
copy. A scaled star gets pointier as it grows. An offset star gets rounder.
Nobody consciously notices, but everybody feels it.

Then I added the feature I wanted most: upload your own SVG. Your logo,
outlined in white, rippling out across the background. That is a launch
graphic in ten seconds.

## Problem one: the lag

The first version worked and was unusable. The moment I uploaded a logo,
every slider in the app turned to syrup.

The reason was honest and dumb. To grow a shape outward by 40 pixels, I was
filling it and then stroking it with an 80 pixel wide line with round joins.
That is a legitimate way to build an offset path on a canvas, and for a
circle or a heart it costs nothing. But a logo exported from Figma is
hundreds of curve segments, and I was stroking it twice per ring, for
thirty or forty rings, on every frame. Measured: about 900 milliseconds a
frame for a 600 segment path. A circle took 60.

The fix was to stop thinking in strokes. Fill the shape once, then ask a
different question of every pixel: how far am I from the shape? That is a
distance transform, and there is a lovely two pass algorithm from
Felzenszwalb and Huttenlocher that computes exact Euclidean distances for
the whole image in linear time. Once you have the distance, a ring is just
"pixels whose distance falls between 40k and 40k plus the stroke width".
The path complexity stops mattering entirely.

| Overlay at preview size | Before | After |
|---|---|---|
| Circle | 60ms | 57ms |
| 600 segment logo | 900ms | 56ms |
| Same logo, tight spacing | 2600ms | 54ms |

I was pleased with myself for roughly twenty minutes.

## Problem two: nothing

Then I uploaded the logo again and nothing appeared. No error, no toast.
The little thumbnail in the shape picker showed my logo's outline
perfectly. The canvas showed the plain gradient.

So I did what you do. I right clicked, hit Inspect, and the responsive
toolbar happened to be set to iPad Pro. The preview re-laid out at the iPad
size and there was my logo, rings and all, looking great.

I closed the inspector. Gone again.

I opened it, nudged the opacity slider, closed it. Now it showed in the
normal preview too, and stayed.

If you have written software for any length of time you know this feeling.
It is the feeling of a bug that depends on something you cannot see. And
the console offered a helpful distraction: a Chrome warning that my
`getImageData` calls would be faster with `willReadFrequently` set. I spent
a while convinced that was related. It was not. It was a performance hint
sitting next to a correctness bug, the way a smoke detector chirping about
its battery sits next to an actual fire.

## What was actually happening

The preview renderer uses scratch canvases. Blur pyramids, effect layers,
the overlay layer. Creating a canvas every frame is wasteful, so I keep a
small pool of them keyed by size. Ask for a 1024 by 576 canvas and you get
the same one you got last frame.

That is fine, as long as you remember that a canvas is not just pixels. It
comes with a drawing context, and the context has state. Fill color. Line
width. And the compositing mode.

The built in shapes draw their rings from the outside in: paint the outer
edge of a ring in `source-over`, then knock out the inside in
`destination-out`, then paint the next ring inward into the hole. When that
loop finishes, the context is left sitting in `destination-out`.

My new distance field code for custom shapes started by filling the logo
onto that same pooled canvas. In `destination-out`, filling a shape onto an
empty layer erases nothing from nothing. The mask was empty. The distance
transform saw no shape, every pixel was infinitely far away, and it dutifully
drew no rings.

Now the inspector behaviour makes perfect sense. Changing the viewport size
changed the canvas size, which fetched a different canvas from the pool,
one nobody had drawn on, with a clean context in `source-over`. Of course it
worked at iPad size. And when I nudged opacity and closed the inspector, the
sequence of re-renders happened to leave the original canvas in a good state
too.

The fix is one line. Reset the composite mode when you take the layer out of
the pool. The lesson is bigger than the line.

## What I am taking from it

**Pooled objects remember.** Any time you reuse something for performance,
you have inherited the job of resetting it. Canvases, contexts, buffers,
connections. Whatever the last user did to it is now your starting state.

**Tests with fresh objects cannot catch pooling bugs.** I had a decent test
suite for the renderer, and every test created its own canvas. Every test
passed. The fix came with a new test that renders a circle and then a custom
shape through a shared pool, and that one failed before the fix and passes
after. It is the only test in the file that would have caught this.

**A strange reproduction is a gift, not a curse.** "It only works when the
inspector is open at iPad size" sounds like nonsense. It is actually a very
precise statement: the bug depends on canvas dimensions. There was exactly
one thing in the renderer keyed on dimensions, and it was the pool. I should
have gone there first instead of chasing the console warning.

**The warning was not the bug.** Chrome's `willReadFrequently` note was
correct and unrelated. I did add the attribute, so the warning is gone, but
fixing it changed nothing about the logo. Warnings tell you where the
browser is uncomfortable, not where your logic is wrong.

The overlay ships in the studio now. Upload a logo, drag it around the
placement grid, and it ripples across whatever gradient you have built. It
renders in about the same time as a circle. And every time I open the
inspector I think about that canvas quietly sitting in `destination-out`,
waiting for me.
