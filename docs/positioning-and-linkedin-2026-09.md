# Positioning shift and LinkedIn plan (September 2026)

Context: the LinkedIn video ("Humanity needs more craft") brought page views,
new sign-ups, and four users who reached the upgrade dialog. Reddit brought
10k views and roughly nothing. The proposal is to market Gradients Studio to
designers making gradient backgrounds for their designs, with modern AI
startups (who lean on grainy, dithered and pixel-effect backgrounds) as the
sharpest example of that buyer, and to make LinkedIn the main channel.

## 1. The positioning call

Yes, with one caveat: change the audience and the use cases, not the search
keywords.

Why it is the right audience:

- It matches the proof already on the page. The Nasdaq graphic was made by a
  design team at a company, not by a wallpaper hobbyist.
- It matches the product's real differentiators. Every free mesh tool makes
  a smooth blob. Rendered grain, pixel and dither are exactly the finish on
  Linear, Vercel, Cursor, Perplexity, Lovable and Dia marketing sites.
  Wallpaper users do not care about dither. Product designers do.
- It matches who pays. A designer at a funded startup expenses $39 without
  thinking. A wallpaper downloader never will. Four upgrade-dialog opens from
  one LinkedIn video is more purchase intent than every Reddit thread combined.
- It matches the channel. LinkedIn is where startup designers, founders and
  design leads actually are, and they post launches constantly, each one a
  natural place to show up with a background.

The caveat: "mesh gradient generator" and the wallpaper, grainy, blurry and
aurora pages are the organic traffic. Keep the H1 keyword and keep every SEO
page. The shift happens in the subline, the use cases, the hero demo and the
proof, not in the pages Google already indexed.

Avoid saying "for AI startups" literally. It dates fast and excludes the
agency designer making the same thing for a fintech. Say what the work is
(product sites, launch posts, decks, app screenshots) and let AI startups be
the named example in copy and posts.

### What to change on the landing page

1. Subline under the H1: "Backgrounds for product sites, launch posts and
   decks. Grain, pixel and dither finishes, exported at 4K, ready for Figma."
2. Hero demo: add an Effect pill row (None, Pixel, Dither) so the first
   thing a visitor touches is the finish that no other tool has.
3. Use cases: lead with website hero, launch post and OG image, product
   video backdrop, pitch deck and App Store shots. Wallpaper moves to last.
4. Proof line: "Used by design teams at reAlpha" beside the Nasdaq polaroid,
   then add every startup that lets you name them.
5. Surface the "Inspired by" palettes (Lovable, Dia, Raycast, Stripe, Arc,
   Comet, Devin) on the landing page as a strip: "Start from the palettes
   behind sites you already admire." Names only, no logos.
6. New SEO pages that this audience searches for: /pixel-gradient,
   /dither-gradient, /gradient-background. Same template as /grainy-gradient.

### Product gaps this audience will hit

- Figma: designers paste the JPG into Figma today. A Figma plugin is the
  single biggest distribution lever for this audience and belongs on the
  roadmap once the positioning is proven.
- PNG export for people who want lossless. Keep JPG as the default.
- Sizes: add 1920x1080 hero, 1200x630 OG and 1080x1350 LinkedIn portrait as
  named presets. LinkedIn portrait posts get the most feed space.

### Read the four upgrade-dialog opens before touching pricing

In PostHog, break down `upgrade_dialog_opened` by the `reason` property.
`exports` means they hit the free cap: real intent, and the dialog or the
price is what stopped them. `browse` means they clicked the hearts meter:
curiosity. `presets` means they tried to save a fourth palette. Only
`exports` opens with no `checkout_started` are a pricing signal. Watch the
session replays for those four before changing anything.

## 2. LinkedIn: how the feed works

- Personal profile is the engine. A company page exists so you can tag it
  and so the product has a home, but it will get a tenth of the reach.
- The first two lines are the post. LinkedIn truncates at roughly 210
  characters behind "see more". The hook must land before that.
- Dwell time is the main ranking signal. Native video, document carousels
  (PDF uploads) and images people zoom into all hold attention. Text-only
  posts about a visual product waste the product.
- External links in the body cut reach. Put the link in the first comment,
  or write "link in profile", or post a native video and let the profile
  carry the URL. Native uploads beat YouTube embeds every time.
- The first hour decides distribution. Reply to every comment fast, and be
  active in other people's comments right before you post.
- Three to four posts a week is the ceiling before quality drops. Two good
  ones beat five weak ones.
- Hashtags are nearly worthless now. Three at most, or none.
- Comments on other people's launch posts are free distribution. A thoughtful
  comment with a background you made for their launch is a post in disguise.

## 3. Content pillars

1. Craft. Why grain matters, why smooth blurs band, why dither reads as
   intentional. This is the pillar that already worked.
2. Teardowns. "Why every AI startup site looks like this." Pick a site
   (Linear, Vercel, Cursor, Perplexity), show the background, rebuild it in
   30 seconds, show the export. Recorded screen, no talking needed.
3. Give first. Make a background for someone's launch and post it as a
   reply. Free packs: "12 launch backgrounds, free, no sign-up."
4. Build in public. Sign-ups, the Nasdaq story, what four people did in the
   upgrade dialog, what you changed. Numbers get comments.
5. Tutorials. One effect, one outcome: dither for a launch post, pixel for
   an OG image, stripes for a deck cover.

## 4. Post templates

Each post: hook in line one, a native visual, no link in the body, link in
the first comment with a UTM.

### A. The Nasdaq story (build in public)

> A gradient I helped make ended up on the Nasdaq tower.
>
> reAlpha's design team used Gradients Studio for the graphic behind their
> acquisition announcement. At the size of a building, a smooth blur bands.
> Rendered grain is what kept it clean.
>
> I did not know until I saw the photo.
>
> If you are making a launch graphic this week, the studio is free to try.
> Link in the comments.

Visual: the polaroid photo. Comment: link with utm_campaign=nasdaq.

### B. The teardown (native video, 30 to 45 seconds)

> Every AI startup site has the same background. Here is how to make it in
> 30 seconds.
>
> Grainy gradient, a little dither, dark palette. Linear, Cursor, Perplexity
> all do a version of it. It looks expensive because the grain is rendered,
> not pasted on.
>
> Screen recording below. Palette and settings in the comments.

Visual: screen recording of the studio, pick palette, toggle dither, export.
Comment: deep link to the exact state (buildStudioUrl carries style,
colors, seed, grain and effect).

### C. Give first (reply, not a post)

Find a launch post from a designer or founder. Make a background in their
palette. Reply:

> Congrats on the launch. Made you a backdrop in your colors in case it is
> useful for the follow-up posts. Free to use, no strings.

Attach the image. Do not link. If they ask, tell them where it came from.

### D. Free pack (document carousel)

> 12 backgrounds for your next launch post. Free, no sign-up.
>
> Dark, grainy, dithered. Sized for LinkedIn and X. Swipe through, save the
> ones you like, download links in the comments.

Visual: a PDF carousel, one background per page, last page "Made in
Gradients Studio". Comment: link to /wallpapers with a utm.

### E. Before and after (image)

> Left: what most gradient tools export. Right: the same gradient with
> rendered grain.
>
> Zoom in on the left. Those steps are color banding, and they show up on
> every large monitor. Grain scatters the steps into texture. Same render,
> same tones, no bands.

Visual: the two crops from the landing page side by side.

### F. Numbers post (build in public)

> One LinkedIn video did more for Gradients Studio than 10k Reddit views.
>
> Reddit: 10k views, zero sign-ups (no links allowed in wallpaper subs).
> LinkedIn: one video, new sign-ups, four people at the upgrade screen.
>
> The lesson for me: sell to people who make things for work. Wallpaper
> downloaders do not pay. Designers shipping a product site do.

No visual needed, or a simple screenshot of the PostHog funnel.

### G. Ask (engagement)

> Designers: what is the one background style you keep reaching for on
> product sites right now?
>
> I am adding presets to Gradients Studio and want the next batch to be the
> ones people actually use. Drop a site you like and I will rebuild its
> background and reply with the file.

Then actually do it for every reply. Each reply is a mini post B.

## 5. Four-week calendar

Week 1: A (Nasdaq story) Tuesday. E (before and after) Thursday. Two C
replies a day on launch posts.

Week 2: B (Linear-style teardown) Tuesday. G (ask) Thursday. Fulfil every
reply to G with a rebuilt background.

Week 3: D (free pack carousel) Tuesday. F (numbers) Thursday. Keep C going.

Week 4: B again with a different site (Cursor or Perplexity). Tutorial:
dither for a launch post. Review PostHog by utm_campaign and double down on
whichever post sent people who exported.

## 6. Measurement

PostHog stores the first-touch UTM parameters on the person automatically
(`$initial_utm_source`, `$initial_utm_campaign`). Every link in a LinkedIn
comment or profile gets:

    https://www.gradients.studio/?utm_source=linkedin&utm_medium=post&utm_campaign=<post-name>

Then in the existing funnel (landing to export to upgrade dialog to
checkout) add a breakdown by `$initial_utm_campaign`. That answers which post
type produces exporters, not just visitors.

## 7. Who to engage

- Designers and design leads at AI startups who post launches and site
  redesigns. Their launch posts are where post C happens.
- Founders announcing rounds and launches. Same move.
- Design-tool accounts and design educators who share resources. The free
  pack (D) is what they reshare.
- People who comment on your posts. Reply to every one within the hour.

## 8. Pitfalls

- Do not put the product link in the post body. Comment or profile.
- Do not post the YouTube link. Upload the video natively.
- Do not use company logos in "inspired by" material. Names in text are
  fine; logos invite takedowns.
- Do not run the same post on X and LinkedIn unchanged. LinkedIn wants a
  story and a visual; X wants one line and the image.
- Do not chase reach with hashtags or engagement pods. Comments from real
  designers are the only signal that compounds.
