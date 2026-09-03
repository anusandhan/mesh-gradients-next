# Landing page plan (September 2026)

Research synthesis and build plan for turning `www.gradients.studio` into a page that ranks and converts. Companion to `pricing-research-2026-09.md`. Three research passes fed this: search demand and competitor page anatomy, conversion patterns across 16 indie design-tool sites, and audience use cases with distribution channels.

Evidence tags: **[strong]** large-sample or peer-reviewed, **[medium]** vendor data or single A/B test, **[weak]** practitioner heuristic.

---

## 1. What the research says, in six findings

1. **Search demand is real but split.** "Gradient generator" and "gradient wallpaper 4K" are the big clusters (tens of thousands of monthly searches each, estimated). "Mesh gradient generator" is mid-size and contested by 20+ free tools. The long-tails a small site can win in months are wallpaper terms (grainy gradient wallpaper 4K, mesh gradient wallpaper iPhone, macOS gradient wallpaper), style terms (grainy, blurry, aurora gradient generator), and use-case terms (gradient background for presentation, Notion cover, Zoom background) where only Gumroad packs rank today.

2. **Every page that ranks puts the tool above the fold.** Exact-match title and H1 with modifiers ("free", "no sign-up", "4K", "grain"), a live editor or preview in the first viewport, a named preset gallery with individual URLs, a "what is a mesh gradient" block, a FAQ with schema, and 800 to 1,700 words. The current page has about 290 words and a static image. Pages that hide the tool behind a CTA (meshgradient.com, Haikei) rank on backlinks we do not have.

3. **The conversion literature agrees with the SEO pages.** The first 10 seconds decide [strong, NN/g]. Ungated interactive demos above the fold get 3.5x the engagement of below-fold ones and beat product videos [medium, Navattic]. Freemium sign-up rates are roughly double trial sign-up rates [strong, ChartMogul and Lenny]. Simple copy at a 5th to 7th grade level correlates with 5x higher SaaS landing conversion [strong correlation, Unbounce, 41k pages].

4. **Social proof is the biggest gap.** All 16 teardown sites carry a real number, a logo row, or named quotes, and place them between features and pricing. We have none. Small numbers backfire [medium, NN/g], so counters wait until they are four digits and testimonials must be collected.

5. **The audience has five concrete jobs.** Website hero backgrounds in the Linear and Stripe look, desktop and phone wallpapers (the largest consumer pool, with 245 to 292 upvote precedents on wallpaper subreddits for free packs), App Store screenshot backdrops, slides and Zoom, and Notion covers and podcast art. Their vocabulary: grainy, aurora, Apple-style, OLED, Linear-style, film grain, no banding.

6. **Their complaints map to our strengths.** Banding without grain, watermarks, sign-up walls, subscriptions, no saved palettes, exports that fail on iOS. The page should say each of these out loud. One counter-signal: developers want CSS, not PNG, for hero backgrounds. Do not pitch PNG-only heroes to developers; pitch wallpapers, OG images, screenshots and slides instead.

---

## 2. Positioning

**Category line:** Mesh gradient generator with real grain.
**Promise:** Gradients that look designed, not generated. Export 4K, free to start, nothing to subscribe to.
**Against free tools:** no banding, three styles with proper controls, saved palettes, mobile editing that actually exports, and the free tier is watermark-free 4K.
**Against paid libraries:** you make your own instead of downloading someone else's, and you pay once.

Title tag: `Mesh Gradient Generator with Real Grain — Free 4K Export | Gradients Studio`
H1: `Mesh gradient generator with real grain`
Subhead: `Blobs, stripes and clouds that look designed, not generated. Tune colour, blur and texture, then export a 4K wallpaper or background. Free to start, nothing to subscribe to.`

Alternative H1s to test later: "Make a wallpaper-grade mesh gradient in 30 seconds" and "Gradients with grain, depth and taste."

---

## 3. Page outline

| # | Section | Job | Notes |
|---|---|---|---|
| 0 | Nav | Persistent product link | Logo, Wallpapers, Pricing, Sign in, "Open the studio". 80% of top demo CTAs sit above the fold or in the nav [medium]. |
| 1 | Hero with live canvas | Value in 10 seconds, first taste without sign-up | Left: H1, subhead, CTA, free line. Right: a real canvas using the app renderer with Blobs/Stripes/Clouds tabs, Shuffle, 4 palette chips, grain toggle. "Open in studio" carries state to `/app` via URL params. Falls back to a static render on low-end phones. |
| 2 | Proof strip | Reduce uncertainty at the conversion point | One named testimonial with role. Add a live export counter only once it passes 1,000. Product Hunt badge after launch. |
| 3 | Gallery | Desire, range, and SEO seed | 12 named presets across the three styles, each tile deep-links into `/app` and has its own URL under `/gradients/[slug]`. |
| 4 | Three styles | Show the controls | Upgrade current cards with the real dial names (density, waviness, sheen; coverage, softness, detail) and hover previews. |
| 5 | Made for how you use it | Self-identification | Five cards with export sizes: hero and OG image 2400x1260, wallpaper 3840x2160 and 1290x2796, App Store 1290x2796, slides and Zoom 1920x1080, Notion cover 1500x600. |
| 6 | Why it looks designed | Handle objections | Grain that kills banding (before/after at 4K crop), blur that stays clean, no watermark on free. 250 to 400 words, this is the "grainy gradient" SEO block too. |
| 7 | Pricing | Convert | Keep on page. Order Free, Pro highlighted, Week Pass. Add "commercial use included" and a refund line ("refund within 14 days if you have not exported"). CTAs deep-link to `/app?plan=year` so the dialog opens on arrival. |
| 8 | Testimonials | Answer doubts | 4 to 6, named, one per audience. Collect first (see section 6). |
| 9 | FAQ | SEO and objections | 8 questions with FAQPage schema: what is a mesh gradient, is it free, resolution and formats, commercial use, subscription, what happens when time ends, SVG/CSS (honest no, link to explainer), where palettes are saved. |
| 10 | Closing CTA | Last push | Full-bleed gradient behind "Open the studio" and the free line. |
| 11 | Footer | SEO surface and trust | Studio, Wallpapers, Gradients, Pricing, Changelog, Licence, Terms, Privacy, Contact, "Made by". |

Target length: 900 to 1,200 words of real copy, 5th to 7th grade reading level.

Do not add: countdown timers, fake scarcity, carousels, autoplay video with audio, third-party social widgets, sign-up before the first gradient, unattributed quotes, strikethrough anchors on the $39 price.

---

## 4. Supporting pages (the part that brings traffic)

| Priority | Page | Target queries | Shape |
|---|---|---|---|
| P1 | `/wallpapers` and `/wallpapers/[slug]` | gradient wallpaper 4K, grainy gradient wallpaper, mesh gradient wallpaper iPhone, macOS gradient wallpaper | Free downloads at 3840x2160, 5120x2880 and 1290x2796 with "Customise in the studio". Tag pages by colour, style, device. ImageObject and FAQPage schema. The backgrounds.supply model. |
| P1 | `/gradients/[slug]` | long-tail palette names | Server-rendered image, hex codes, style, "Open in studio". 24 to 40 entries. Cheap indexable variety. |
| P1 | `/grainy-gradient` | grainy gradient generator, noise gradient generator | Thin wrapper over `/app` with a high-grain preset, 500 to 800 words, FAQ. |
| P2 | `/blurry-gradient`, `/aurora-gradient` | blurry gradient generator, aurora gradient generator | Same shape as above. |
| P2 | `/use-cases/*` | gradient background for website, presentation, Zoom, Notion cover, App Store screenshots | Six downloads at the exact aspect ratio plus CTA. Near-zero competition. |
| P3 | Blog | best mesh gradient generators, how to make a mesh gradient in Figma, recreate the Linear/Stripe hero gradient, CSS mesh gradient explainer | Link-earning editorial. |
| P3 | `/compare/vs-magicpattern` | magicpattern alternative | Nobody in the niche runs comparison pages. |

Also: give `/app` a unique title, an H1 and a short paragraph in the DOM, and links back to the marketing pages so it is not a dead end. Add `/about` and `/contact` (every top single-tool site has them). Add SoftwareApplication schema on `/` with the three offers.

---

## 5. Build phases

**Phase 1, the page itself (this sprint).**
1. Live hero canvas component reusing the renderer, with state passed to `/app`.
2. Rewrite title, H1, subhead and section copy to the positioning above.
3. Gallery of 12 presets with deep links (URL-param support in `/app`).
4. Use-case section with export sizes, and matching aspect presets in the studio if missing.
5. "Why it looks designed" block with a real 4K crop before/after.
6. Expanded FAQ with schema, SoftwareApplication schema, full footer, `/about` and `/contact`.
7. Pricing CTAs deep-link to the upgrade dialog.
8. Analytics: `landing_hero_interacted`, gallery clicks, scroll depth via PostHog's built-in.

**Phase 2, traffic pages (next two weeks).**
1. `/wallpapers` with three free packs (Mac 5K, iPhone, desktop 4K) and per-item pages.
2. `/gradients/[slug]` preset pages.
3. `/grainy-gradient`, `/blurry-gradient`, `/aurora-gradient`.
4. Sitemap covering everything, Search Console submission.

**Phase 3, proof and launch (weeks three to four).**
1. Collect 4 to 6 testimonials (see below), add the proof strip.
2. Directory submissions, Reddit wallpaper packs, Figma Community file, Product Hunt launch, per the 30-day checklist in section 7.

---

## 6. Getting social proof from zero

- Comp Pro to 10 to 15 designers you know or admire, ask for one sentence and permission to use name and role. One per audience: web designer, indie developer, wallpaper enthusiast, Notion creator, marketer.
- Post the free wallpaper packs first; quote the best Reddit comments with usernames (ask permission).
- Show a counter only when real: exports this month, once it exceeds 1,000.
- Product Hunt badge after launch; a 4.0 to 4.7 rating reads more credible than a perfect 5 [medium, Spiegel].

---

## 7. 30-day distribution checklist

| Days | Action | Where |
|---|---|---|
| 1 to 3 | Build three free packs (Mac 5K, iPhone, Notion 1500x600) | rendered with the export renderer |
| 3 to 7 | Post packs as "I made these", tool link in comments only | r/iphonewallpapers, r/wallpapers, r/MacOS, r/wallpaperdump, r/Notion |
| 5 to 10 | Submit to directories | toools.design/suggest-a-tool, tally.so/r/mBbA8N (Good Design Tools), supertools.design/submit, usetools.design/submit, thedesigntools.site/submit-tool, godly.design/submit, toolfolio.com/list-your-tool, uneed.best/submit-a-tool (pay the $14.99 fast track) |
| 7 to 14 | Publish a free Figma Community file of 50 gradients that links to the studio | Figma desktop app, Community, Publish |
| 10 to 20 | Ship Phase 2 pages; post a "how I made the Linear-style hero" write-up with a CSS embed tip | r/web_design, r/webdev |
| 21 (Tue or Wed, 12:01 AM PT) | Product Hunt launch, reply to every comment within 15 minutes | producthunt.com/posts/new |
| 22 | Show HN, low expectations | news.ycombinator.com/submit |
| 23 to 30 | One short video "grainy gradient in 30 seconds", Pinterest board of wallpapers linking to SEO pages, Gumroad free pack listing | YouTube, Pinterest, Gumroad |

Benchmarks: comparable Product Hunt launches drew 100 to 445 upvotes (Mesh·y 445, Haikei 430, Gradient Hunt 321). Gradient-tool Show HNs in 2025 mostly got 1 to 2 points unless open source or novel.

---

## 8. Hypotheses to test once traffic exists

| # | Test | Metric | Guardrail |
|---|---|---|---|
| 1 | Live canvas hero vs static image | landing to `/app` click-through, first export in session | page load time on mobile |
| 2 | CTA copy: "Start for free" vs "Make a gradient" vs "Open the studio" | hero CTA click rate | |
| 3 | Pricing on page vs link to `/pricing` | paid conversions per landing visitor | `/app` first-export rate |
| 4 | Proof strip present vs absent | scroll depth past hero, CTA click rate | |
| 5 | Gallery tiles deep-linking presets vs static | first-export rate, time to first export | |
| 6 | Refund line under pricing | checkout completion | refund rate |
| 7 | Grade-6 copy vs current | hero CTA click rate, bounce | |

Instrument first: landing to `/app` click-through, `/app` first-export rate, export to pricing view, pricing to checkout, checkout to paid, split by device and source. Most tests need weeks at current traffic; run 1, 3 and 5 first because they touch the largest funnel step.

---

## 9. Sources

Search and competitors: meshgradientgenerator.com, meshsvg.com, magicpattern.design/mesh-gradients, colorffy.com/mesh-gradient-generator, learnui.design gradient tools, cssgradient.io, coolors.co/gradient-maker, haikei.app, meshgradient.com, mshr.app, csshero.org/mesher, fffuel.co/gggrain, auroragradient.com, grainient.supply, gradientora.com, unicorn.studio, backgrounds.supply/gradients, 4kwallpapers.com/gradients, basicappleguy.com gradients posts, Google and DuckDuckGo autocomplete.

Conversion evidence: julian.com/guide/growth/landing-pages, landingpagehottips.com, unbounce.com/conversion-benchmark-report, chartmogul.com/reports/saas-conversion-report, lennysnewsletter.com free-to-paid conversion, nngroup.com page-fold-manifesto, how-long-do-users-stay, social-proof-ux, baymard.com homepage UX, spiegel.medill.northwestern.edu online reviews, navattic.com state of the interactive product demo 2025 and 2026, buttondown.com/blog/ab-test-pricing, instapage.com pricing page A/B. Teardowns: screen.studio, shots.so, pika.style, cleanshot.com, xnapper.com, unicorn.studio, haikei.app, mobbin.com, lummi.ai, spline.design, rive.app, coolors.co, magicpattern.design, grainient.supply, shapefest.com, framer.com/marketplace, cursorful.com, sketch.com/pricing.

Audience and channels: Reddit threads in r/webdev (necccl), r/web_design (pnbrkj, xxnxej), r/iphonewallpapers (z8p605, 1kn2fi2), r/wallpaperdump (11g9hbm), r/graphic_design (o4uigi, u1a7qh), r/Design (ozzhqk), r/Notion (yvq74b, xfm96j); Hacker News 29368552, 44896690, 45102715; css-tricks.com/grainy-gradients; Product Hunt pages for Mesh·y, Mesh Gradient, Haikei; splitmetrics.com App Store screenshot guide; widgetsfornotion.com/covers; slidesgo.com/gradient; Gumroad gradient packs; directory submission pages listed in section 7.

Known gaps: no paid keyword-volume tool was used, so volumes are estimates; no primary A/B data on pricing-on-homepage or money-back guarantees; interactive-demo numbers are vendor-published and B2B-skewed; X and YouTube evidence was not retrievable.
