# Launch copy: Reddit posts and directory listings

Ready-to-paste copy for the first two steps of the distribution plan. Every link goes to a page that exists today. Replace nothing except where marked `[…]`.

Ground rules that apply to all of the Reddit posts:

- **Post the image, not a link.** Image posts get the reach. Upload the file itself (or a gallery of two to four), then put the tool link in your first comment. Posting a link to your own site as the post body gets removed as self-promotion on every one of these subs.
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

**First comment**
> Rendered these with a small gradient tool I've been building. The grain is drawn into the image at full size, so they don't band on OLED, which was the whole reason I started making my own.
>
> Full-size downloads and eight more palettes here, no sign-up: https://www.gradients.studio/wallpapers
>
> If you want different colours, each one has a "Customise" button that opens the same scene in the editor.

### r/wallpapers

Flair: OC or Original Content. Titles here must carry the resolution.

**Title**
`Grainy gradient wallpapers in 4K (3840×2160), made with real film grain so they don't band [OC]`

Upload: Deep Sea, Storm, Blue Sky, Lavender Haze desktop files.

**First comment**
> All four plus eight more, free at 4K and 5K, no sign-up: https://www.gradients.studio/wallpapers
>
> The grain isn't a noise layer on top. It's rendered into the gradient at 3840 wide, so the texture is real at 100% instead of turning to mush when it's scaled.

### r/MacOS

Flair: Wallpaper (if the sub has it; otherwise Discussion). This sub likes macOS-style gradients.

**Title**
`Made some 5K gradient wallpapers for MacBook and Studio Display (5120×2880)`

Upload: Blue Sky, Peach Fuzz, Ice Fibre, Midnight Mac files.

**First comment**
> These are rendered at 5120×2880 specifically, not upscaled from 4K. Grain is baked in so the soft parts stay smooth on the Retina panel.
>
> Twelve palettes, free, no sign-up: https://www.gradients.studio/wallpapers/style/clouds
>
> Happy to render other colours if there's a look people want.

### r/wallpaperdump

This sub is for batches. Post all twelve desktop files as one gallery.

**Title**
`12 grainy gradient wallpapers, 4K, three styles (blobs, stripes, clouds) [OC]`

**First comment**
> 5K Mac and phone versions of every one of these are here, free, no sign-up: https://www.gradients.studio/wallpapers
>
> Made with a gradient tool I built. The three styles are soft blobs, silk-like stripes, and clouds with real depth. The grain is what stops the dark ones from banding.

### r/Notion

Flair: Showcase or Resources. Notion covers are 1500×600; the studio's 5:2 aspect matches. Export four covers at 5:2 from the studio first (Ember, Lavender Haze, Blue Sky, Storm) and upload those.

**Title**
`Free grainy gradient covers for Notion (5:2, dark-mode safe)`

**First comment**
> I made these with my gradient tool, which has a 5:2 "Notion cover" size built in. Grain keeps them from banding behind the page title.
>
> Make your own in any colour here, five free exports a month, no watermark: https://www.gradients.studio/app?aspect=5:2
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
> I ended up building a small tool for this so I could tune colour, blur and grain and export 4K: https://www.gradients.studio. Free tier is five exports a month, no watermark, and I'm genuinely after feedback on the stripes and clouds styles from people who do this for a living.

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
Make mesh gradients in three styles with real grain, blur and colour controls. Export 4K wallpapers and backgrounds with no watermark. Free to start.

**Medium description (about 60 words)**
Gradients Studio makes mesh gradients that look designed rather than generated. Pick blobs, stripes or clouds, tune the colours, blur and grain, and export at 4K with no watermark. The grain is rendered into the image, so nothing bands on large screens or in print. Five free exports a month, then a one-time pass. No subscription.

**Long description (about 180 words)**
Most gradient generators produce the same smooth blur, and it falls apart on a 4K monitor: colour bands, muddy centres, a texture designers spot from across the room. Gradients Studio was built to fix that.

Three styles share one set of controls. Blobs are the classic mesh look. Stripes are flowing fibres with a silk sheen that reads as aurora in the right palette. Clouds are billowing volumes with real depth. Colour, blur, contrast, saturation and grain work the same way in each, and each style adds its own dials. Pixel and Dither finishes turn any gradient into a dot matrix or a palette-quantised pattern.

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
