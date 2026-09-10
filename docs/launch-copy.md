# Launch copy: Reddit posts and directory listings

Ready-to-paste copy for the first two steps of the distribution plan. The X (Twitter) plan, with its own post templates and calendar, is in `x-strategy.md`. Every link goes to a page that exists today. Replace nothing except where marked `[…]`.

Ground rules that apply to all of the Reddit posts:

- **Post the image, not a link.** Image posts get the reach. Upload the file itself (or a gallery of two to four).
- **Wallpaper subs are giveaways, not launches.** r/iphonewallpapers, r/wallpapers, r/MacOS and r/wallpaperdump all forbid promoting or selling your designs. So: no link in the post, no link in the first comment, no mention of a tool or a site. Put `gradients.studio` in your Reddit profile bio once, and only share a link when someone asks in the comments. A reply to a genuine question is allowed everywhere; an unprompted link is what gets removed.
- **r/Notion allows links only inside its pinned Self-promo & Showcase thread.** The web-dev subs allow write-ups with a link at the end.
- **One sub per day, different palettes.** The same image across five subs on the same day reads as spam and gets reported. Rotate palettes.
- **Read the sidebar before each post.** Most wallpaper subs require the resolution in the title and an "OC" flair. Some require the exact pixel size in brackets. The titles below already follow that convention.
- **Reply to every comment for the first two hours.** That is what pushes a post up.
- Download the files from the palette pages under `/wallpapers/[slug]`. Mac 5K is 5120×2880, Desktop 4K is 3840×2160, Phone is 1290×2796.

---

## Reddit

### r/iphonewallpapers

Flair: OC. Upload a gallery of the four phone files for Sunset, Midnight, Aurora and Ember.

**Title**
`I made four grainy gradient wallpapers for iPhone (1290×2796) [OC]`

**First comment** (no link, no product mention)
> Made these myself. The grain is rendered into the image at full size, so they don't band on OLED. If anyone wants a different color, say which and I'll render it.

**If someone asks where they're from or for more:** reply with the wallpapers page and nothing else.
> All twelve are free here, no sign-up: https://www.gradients.studio/wallpapers

### r/wallpapers

Flair: OC or Original Content. Titles here must carry the resolution.

**Title**
`Grainy gradient wallpapers in 4K (3840×2160), made with real film grain so they don't band [OC]`

Upload: Deep Sea, Storm, Blue Sky, Lavender Haze desktop files.

**First comment** (no link, no product mention)
> Rendered at 3840×2160 with the grain drawn in at that size, so it stays real at 100% instead of turning to mush when scaled. Happy to do other palettes if there's interest.

**If asked for more:**
> Twelve of them, free at 4K and 5K, no sign-up: https://www.gradients.studio/wallpapers

### r/MacOS

Flair: Wallpaper (if the sub has it; otherwise Discussion). This sub likes macOS-style gradients.

**Title**
`Made some 5K gradient wallpapers for MacBook and Studio Display (5120×2880)`

Upload: Blue Sky, Peach Fuzz, Ice Fiber, Midnight Mac files.

**First comment** (no link, no product mention)
> These are rendered at 5120×2880 specifically, not upscaled from 4K, so the soft parts stay smooth on the Retina panel. Say if you'd like a different color and I'll render it.

**If asked for more:**
> There's a set of twelve, free, no sign-up: https://www.gradients.studio/wallpapers/style/clouds

### r/wallpaperdump

This sub is for batches. Post all twelve desktop files as one gallery.

**Title**
`12 grainy gradient wallpapers, 4K, three styles (blobs, stripes, clouds) [OC]`

**First comment** (no link, no product mention)
> Three styles in here: soft blobs, silk-like stripes, and clouds with real depth. The grain is what stops the dark ones from banding. All 4K.

**If asked for phone or Mac sizes:**
> 5K Mac and phone versions of every one are here, free, no sign-up: https://www.gradients.studio/wallpapers

### r/Notion

**Not a standalone post.** r/Notion's Rule 4 sends all showcase and self-promo content to the fortnightly pinned "Self-promo & Showcase" thread; a normal post gets removed. Find the pinned thread (post early in a fresh one) and leave the copy below as a comment with the four 5:2 covers attached. Export them from the studio first (Ember, Lavender Haze, Blue Sky, Storm) at the Notion cover size.

**Comment in the showcase thread**
> I made these with my gradient tool, which has a 5:2 "Notion cover" size built in. Grain keeps them from banding behind the page title.
>
> Make your own in any color here, five free exports a month, no watermark: https://www.gradients.studio/app?aspect=5:2
>
> Ready-made wallpapers in other sizes: https://www.gradients.studio/wallpapers

### r/web_design and r/webdev (the write-up)

Post this as a text post, not an image. Developers on these subs are hostile to PNG-only hero backgrounds, so lead with the technique and mention the CSS embed. Wait until the wallpaper posts have run.

**Title**
`How I recreated the Linear-style grainy hero gradient (and why CSS noise wasn't enough)`

**Body**
> I kept trying to get that Linear / Raycast hero look with CSS: a few radial gradients, a `feTurbulence` SVG filter for grain, mix-blend-mode. It looks fine on a laptop and bands badly on a 4K monitor, and the SVG noise is heavy on mobile.
>
> What actually worked was rendering the gradient as an image with the grain drawn in at export resolution, then using it as a background with the text in the DOM on top:
>
> ```css
> .hero {
>   background: #1a1b1d url("/hero-4k.jpg") center / cover no-repeat;
> }
> ```
>
> Things I learned:
>
> - Grain has to be rendered at the final size. A noise layer scaled with the image turns into blur.
> - Dark palettes band the most. Around 15 to 25 percent grain removes the bands without reading as texture.
> - Keep some structure behind the headline. A fully even blur looks like a placeholder.
> - A 3840-wide JPEG at quality 92 is about 2 MB. Serve a 1920 version to phones with `image-set()` or `<picture>`.
>
> I ended up building a small tool for this so I could tune color, blur and grain and export 4K: https://www.gradients.studio. Free tier is five exports a month, no watermark, and I'm genuinely after feedback on the stripes and clouds styles from people who do this for a living.

---

## Directory listings

Use the same core copy everywhere and trim to each site's limit. Category is "Design tools" or "Color / Gradients" wherever offered. Pricing is "Freemium".

### Core copy

**Name**
Gradients Studio

**URL**
https://www.gradients.studio

**Tagline (under 60 characters)**
Mesh gradient generator with real grain, 4K export

**Short description (under 160 characters)**
Make mesh gradients in three styles with real grain, blur and color controls. Export 4K wallpapers and backgrounds with no watermark. Free to start.

**Medium description (about 60 words)**
Gradients Studio makes mesh gradients that look designed rather than generated. Pick blobs, stripes or clouds, tune the colors, blur and grain, and export at 4K with no watermark. The grain is rendered into the image, so nothing bands on large screens or in print. Five free exports a month, then a one-time pass. No subscription.

**Long description (about 180 words)**
Most gradient generators produce the same smooth blur, and it falls apart on a 4K monitor: color bands, muddy centers, a texture designers spot from across the room. Gradients Studio was built to fix that.

Three styles share one set of controls. Blobs are the classic mesh look. Stripes are flowing fibers with a silk sheen that reads as aurora in the right palette. Clouds are billowing volumes with real depth. Color, blur, contrast, saturation and grain work the same way in each, and each style adds its own dials. Pixel and Dither finishes turn any gradient into a dot matrix or a palette-quantized pattern.

The grain is drawn at export resolution, so it survives compression, scaling and print. Exports are 3840 pixels wide in nine aspect ratios, from 16:9 desktop and 16:10 Mac to 9:16 phone, 1.91:1 social cards and 5:2 Notion covers.

Free accounts get five 4K exports a month and three saved palettes, with no watermark. Pro is $39 for twelve months, or a $9 week pass, and neither renews. Twelve free wallpapers are available without an account.

**Features (bullet form for sites that ask)**
- Three styles: blobs, stripes, clouds
- Real grain rendered at export resolution
- 4K export, nine aspect ratios, no watermark
- Pixel and Dither finishes
- Saved palettes, twelve curated presets
- Free tier, one-time pricing, no subscription
- Twelve free wallpapers in 4K, 5K and phone sizes

**Maker**
Anusandhan, https://anusandhanpokhrel.com

**Tags**
gradient, mesh gradient, background generator, wallpaper, design tool, color, grain, 4K

**Screenshots to prepare (once, reuse everywhere)**
1. The studio with the Aurora stripes preset open, desktop layout.
2. The landing page hero with the live canvas.
3. A 4K export crop showing the grain at 100 percent (the "grain on" image from the landing page works).
4. The wallpapers index.

### Per-site notes

| Site | Submit at | What they ask for | Notes |
|---|---|---|---|
| toools.design | https://www.toools.design/suggest-a-tool | Name, URL, category, short description | Volunteer-reviewed, days to weeks. Category: Colors & Gradients. |
| Good Design Tools | https://tally.so/r/mBbA8N | Name, URL, one-line description, your email | Goes out in a weekly newsletter; the one-liner is the tagline. |
| Supertools | https://www.supertools.design/submit | Name, URL, description, category | Use the short description. |
| Usetools | https://www.usetools.design/submit | Name, URL, description, pricing | Freemium. |
| The Design Tools | https://thedesigntools.site/submit-tool | Name, URL, description | Medium description fits. |
| Godly | https://godly.design/submit | URL, category | Godly is a curation of good landing pages; submit the home page, not the app. Category: Tool. |
| Toolfolio | https://toolfolio.com/list-your-tool | Name, URL, description, logo, screenshots | Nofollow link but real traffic. Upload the logo at 512×512 and the four screenshots. |
| Uneed | https://www.uneed.best/submit-a-tool | Full listing with screenshots and maker profile | Free queue is months long. The $14.99 fast track is worth it: dofollow link and a launch day with votes. Pick a Tuesday. |

### Product Hunt (for later, day 21)

Not yet. When you are ready, the tagline and long description above are the "Tagline" and "Description" fields, the four screenshots are the gallery, and the first comment should be the maker's story: the banding problem, the grain fix, one-time pricing. I will draft that when you set a date.
