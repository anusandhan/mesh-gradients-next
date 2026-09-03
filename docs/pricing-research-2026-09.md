# Gradients Studio pricing research (September 2026)

Prepared 2026-09-03 to decide whether to keep Pro at **$38 one-time for 6 months**.

**Decision: move to $39 one-time for 12 months (non-renewing) as the headline, add a $9 seven-day Week Pass beside it, keep the 5-exports-per-month free gate, let free accounts save 3 palettes, and enable Stripe Adaptive Pricing.**

---

## 1. Starting point

| Item | State on 2026-09-03 |
|---|---|
| Free tier | Full editor, 5 exports per UTC month at 4K, all aspect ratios, no saved palettes |
| Pro | $38 one-time, 6 months, unlimited 4K exports, up to 50 saved palettes |
| Where pricing is shown | Only in the dialog that appears after a free user runs out of exports |
| Launch | First users August 2026 |
| Database | 3 users, 3 entitlements (1 paid, 2 comped), 10 exports total, 2 users hit the cap |
| Analytics | Vercel Web Analytics not enabled; Stripe account not connected to this workspace |

There is no conversion data, so the decision rests on market benchmarks and published pricing evidence.

## 2. Direct competitor landscape

Legend: **V** verified on the vendor's page this session; **S** from search snippets or third-party roundups; **NF** not found.

### 2.1 Mesh and blur gradient generators

| Tool | Free limits | Paid price | Model | Src |
|---|---|---|---|---|
| Better Gradient, visualy MeshGradient, meshgradientgenerator.com, Aurora Gradient, ColorFlow (ls.graphics), MESH (meshgradient.com), MSHR, CSS Hero Mesher, Mesh-y, Photogradient, fffuel | Everything free: 4K to 8K, no watermark, several need no signup | none | Free | V |
| Instant Gradient | 5 saved palettes, 1x PNG, all 7 styles | $29 | Lifetime one-time (4K, WebP, MP4, API) | S |
| MagicPattern (30+ tools) | Watermark + low-res | $10/mo Basic, $20/mo Pro; passes $49 / 3 months, $79 / 6 months | Subscription + one-time passes | V |
| Grainient (asset library) | Freebies only | $59/yr (list $149); $299 lifetime (list $759) | Subscription + lifetime | V |
| Gradientora (asset library) | Free category | $49/yr Starter, $99/yr Pro; $199 lifetime | Subscription + lifetime | V |
| Unicorn Studio | 8 publishes with branding, non-commercial | $20/mo or $168/yr | Subscription | V |
| Haikei | Unlimited SVG + medium-res PNG | Pro "coming soon", price TBD (for years) | Resolution gate | V |
| Colorffy | Unlimited tools, palettes, gradients | $40/yr (~$5/mo) | Subscription | V/S |
| Coolors | Ads, 5-colour palettes, 10 saved | $36/yr (~$3/mo) | Subscription | V |
| Paper Shaders | Open source npm library | Paper Pro $16–20/mo (design tool, not gradients) | Free / OSS | V |
| BGJar | CC BY attribution | $5.99 Basic, $35.99 Pro | Lifetime one-time | V |
| Figma: Mesh gradients (oodesign) | 7-day trial | $9.99/yr per designer, $39.99/yr team | Subscription | V |
| Figma: Mesh Gradient (Gautham), Free Mesh Gradient Generator (Onload) | Free, 190k+ users | none | Free | V/S |
| App Store: Mesh Gradient (Taleb) | none | $0.99 | One-time, 8K export | V |
| App Store: Mesh Gradients Ultimate | Free tier | $1.99/mo or $11.99 one-time | Either | V |
| App Store: Meshing | Free tier | $9.99/yr or $29.99 lifetime | Either | V |
| Gumroad gradient packs | often free | $1–15 | Static asset | S |
| Creative Market packs | none | $14–25 | Static asset | V |
| Lummi, Recraft, Freepik, Envato Elements | Limited free | $10–48/mo | Subscription bundles | V/S |

Not found or dead: a "Mesh Gradient by Kumar" tool, gradient.art (DNS fails), Ghost Gradient, Gradienta paid tier (site parked), the Figma "Mesh Gradient Generator" Pro price.

### 2.2 What the direct market says

1. **The free floor is unlimited 4K with no watermark.** At least eight direct competitors give this away, and several market "no paywall" as the feature. Pro cannot be sold on 4K access alone. It sells on the styles (blobs, stripes, clouds), grain and blur control, saved palettes, mobile editing, and taste.
2. **Nobody sells a 6-month term.** MagicPattern's $79 six-month pass is the only one, and it bundles 30+ tools. Consumer apps that use 6-month tiers (Babbel, Tinder) auto-renew and use them as a middle anchor.
3. **Pure generators go free or cheap one-time** ($0.99 to $29 lifetime). Asset libraries go subscription plus lifetime ($49–99/yr, $199–299 lifetime). Suites go $10–20/mo.
4. **Gating is by resolution, watermark, saved-item count, or commercial licence.** A monthly export count has no direct peer in this niche. The closest analogues are Instant Gradient's 5 saved palettes and Coolors' 10.
5. **$38 per 6 months annualises to about $76/yr.** That is above Coolors ($36), Colorffy ($40), Grainient ($59), and Simplified ($72), and just under MagicPattern Basic ($120). It is priced like a suite and scoped like a single generator, and it is above Instant Gradient's $29 lifetime for a near-identical feature set.
6. **Buyers who pay once expect to own it** (Instant Gradient, BGJar, Meshing, Mesh Gradients Ultimate). A one-time pass that expires needs explicit "one year, no auto-renew" framing to read as fair.

## 3. Adjacent indie design tools

### 3.1 Price-per-month distribution (cheapest term)

| Band | Tools |
|---|---|
| $0 | Realtime Colors, Huemint, Khroma, Haikei, Fontshare, Phosphor, Iconify |
| $3–5/mo (utility cluster) | Coolors $3, Cleanup.pictures $3, Noun Project $3.33, Unsplash+ $4, Photopea ~$4, Grainient ~$5 |
| $8–16/mo (creation-tool cluster) | Shots $8, Rive $9, Screen Studio $9, Mobbin $10, Lummi $10, CleanShot Pro $10, Spline $12, Iconscout $12, Pika $12.50, Unicorn $14, Jitter ~$16 |
| One-time with a 1-year window | Xnapper $30–80, CleanShot $35, Cursorful $79, Sketch $120 |
| Lifetime | Shapefest $299, Grainient $299, Typewolf $399 |

Gradients Studio at $38 per 6 months is $6.33/mo-equivalent, in the gap between clusters. A gradient generator belongs functionally in the utility cluster.

### 3.2 Gating frequency across ~30 tools

| Lever | Count | Examples |
|---|---|---|
| Watermark on output | 5 | Xnapper, Pika, Spline, Unicorn, Jitter |
| Resolution cap, unlimited count | 6–7 | Cleanup 720p, Jitter 720p, remove.bg 0.25 MP, Haikei medium PNG, Shapefest 512px, Pika and Jitter gate 4K |
| Saved-object count | 5 | Coolors 10 palettes, Unicorn 8 publishes, Rive 3 files, Jitter 3 files, Mobbin 3 collections |
| Format or code export | 4 | Shots WebP, Pika SVG, Haikei JSX, Jitter ProRes |
| Commercial licence | 4 | Cursorful, Unicorn, Noun Project, Pika |
| Credits | 3 | remove.bg, Removal.ai, Noun Studio |
| Monthly export quota | 0 | none |

### 3.3 Founder-reported outcomes (unaudited)

- **Xnapper** (one-time, $30–80): ~$4–6K/mo; founder says most revenue is one-time purchases; sold for $150K.
- **Screen Studio**: $30K first month on one-time pricing, 8,000 customers in 9 months; later moved to subscription to fund a team; founder publicly regrets the $229 one-time price.
- **Mobbin**: ~$1.6M ARR, bootstrapped (getlatka, unverified).
- **Coolors**: "35K+ happy customers" on the Pro page, no revenue disclosed.
- **Pinterest-for-Miro** (dev.to): $11.99/mo had "zero retention" for a use-once tool; switched to $49 lifetime.
- **Lifetime deals**: every acquirer asked one founder to quantify the LTD liability; a counter-view says LTDs work for solo cash flow when priced above monthly LTV.

## 4. Pricing evidence

Tags: **[strong]** peer-reviewed or large-N platform data; **[medium]** vendor or analyst data with method; **[weak]** anecdote or unverified secondary claim.

### 4.1 Price points

- **$39 outsold $34 and $44** in Anderson and Simester's catalogue field experiments (16, 21, 17 units), strongest for products the buyer has no price reference for. [strong]
- **Left-digit effect only fires when the left digit changes** ($39 vs $40), not $38 vs $39 (Thomas and Morwitz 2005). [strong]
- **Precise prices are judged smaller** but a 2026 preregistered replication (N=729) found no reliable effect on purchase intent. [medium]
- **Round prices suit feeling-driven purchases, precise prices suit cognition-driven ones** (Wadhwa and Zhang 2015). [medium]
- Third-party Gumroad scrape: $30–49 digital products convert ~28% better than sub-$10. [weak]

Net: nothing supports $38 specifically. $39 has the best field evidence. $40 is the weakest for an unfamiliar product.

### 4.2 Term length

- Annual subscribers churn at roughly one third the monthly rate; monthly retains ~11% at 12 months, annual ~28% (RevenueCat, 10k+ apps). [strong]
- The annual discount norm is ~17%, framed as "2 months free". [medium]
- **72% of year-one annual subscribers switch off auto-renew, 35% in month one** (RevenueCat 2026). Prepaid terms have high non-renewal. [strong]
- **No benchmark dataset isolates 6-month plans.** [unmeasured]
- Cheap annual plans retain best but expensive ones earn 3.3x more per payer. [strong]

### 4.3 Passes, one-time, lifetime

- JetBrains (perpetual fallback after 12 months), Sketch ($99 + one year of updates), Affinity ($49.99 one-time, £31M revenue, 53% margins) show one-time works in design software. [medium]
- Setapp pays devs from a usage pool; small tools report under 5% of revenue from it. [medium]
- Lifetime deal heuristic: price at 14–16x monthly, cap the count. [medium/weak]
- Time-boxed passes in the wild: Photopea $5/30 days, $12/90 days, $50/365 days; MagicPattern $49/3mo, $79/6mo; Shots.so $6 for 10 clean exports over 7 days. [medium]

### 4.4 Credits and bursty usage

- remove.bg sells both never-expiring credits and subscriptions; packs win for occasional users. [medium]
- Figma-plugin makers sell non-expiring credit packs because designers dislike recurring fees for occasional tools. [weak]
- "Two intense weeks a quarter on a subscription means paying for the ten quiet ones" (Growth Unhinged on usage pricing). [medium]
- Usage gating (meter volume) is a stronger lever than feature gating (Kyle Poyar). [medium]

### 4.5 Conversion benchmarks

- Freemium self-serve: 3–5% free-to-paid is good, 6–8% great; a fifth of products convert under 2.5% (Lenny/OpenView survey). Design and creative tools benchmark at 1–3%. [strong]
- Hard paywall converts 10.7% vs freemium 2.1% at day 35, with identical 1-year retention (RevenueCat 2026). [strong]
- Impulse zone is under $5; $10–20 triggers comparison; $20–40/yr is still a "no-brainer" annual. [weak]
- Jason Cohen's 1,500-sale experiment: a $12.99 option beside a $5.99 one outsold it (758 vs 718). [medium]

### 4.6 Purchasing-power parity and localisation

- lightGallery: PPP raised total revenue ~15%, low-PPP-country revenue +800% (confounded by a release). [medium]
- Local-currency display alone lifts checkout 5–15%; local payment methods took Paddle checkout from 4.3% to 6.5%. [medium]
- Vendor claims of +20–70% in low-PPP regions; VPN abuse under 5%. [weak]

### 4.7 Options and anchoring

- The decoy effect largely fails to replicate with realistic stimuli (11 of 91 attempts). [strong]
- Two options beat one, three, or four in an Alibaba experiment on 1.6M consumers. [strong]
- Groove went from a multi-option page (1.11%) to a single plan (4.15%). [medium]
- Anchoring works without a decoy when the higher option is obviously better value (Cohen). [medium]

## 5. Recommendation

| Element | Before | After | Why |
|---|---|---|---|
| Headline | $38 / 6 months | **$39 / 12 months**, one-time, never auto-renews | $39 has field evidence; 12 months matches the utility cluster and the "one year of access" convention; prepaid renewals are low so the shorter term mostly lowered conversion |
| Second option | none | **$9 Week Pass**, 7 days unlimited exports | Bursty demand; Shots.so's $6 pass is the direct comp; two options beat one; makes $39 the obvious value |
| Free exports | 5 / month | 5 / month, unchanged | Meters the value moment, controls render CPU, converts the casual sixth-export user; resolution gating would only convert people who need 4K, which is free elsewhere |
| Free palettes | 0 | **3** | Coolors, Mobbin, Rive, Jitter all allow a small free cap; builds switching cost |
| Aspect ratios | listed as Pro | removed from the dialog | The export route never gated them |
| Pricing visibility | out-of-exports dialog only | plus a "Go Pro" entry point for signed-in free users | Nobody could see the price before hitting the wall |
| Localisation | none | enable Stripe Adaptive Pricing | 5–15% checkout lift from local currency alone |
| Lifetime tier | none | none for now | Each export costs CPU; LTDs hurt acquisition value; if ever added, 5–8x annual and capped |
| Subscription | none | none | Billing and churn overhead; "no subscription" is a differentiator; checkout is one-time mode |
| Existing paid buyer | 6 months | extend to 12 months | Costs nothing, keeps the promise consistent |

### Expected economics

At the 1–3% free-to-paid benchmark for creative tools, revenue is decided by free-user volume. With no landing page and no analytics, distribution and measurement matter more than the price point right now.

### First experiments once there is traffic

1. $39 vs $49 headline with identical copy (needs a few hundred signed-in users per month to read).
2. Week Pass on vs off, measuring revenue per signed-in user, to check cannibalisation.
3. Reverse trial: 7 days of full access for new sign-ups, then downgrade.

## 6. Implementation (done in this repo)

- `lib/plans.ts`: plan table (`year` $39/365 days, `week` $9/7 days), `FREE_PRESET_LIMIT = 3`, `parsePlanId`.
- `lib/db.ts`: `grantPro` takes a plan and stacks its duration in days.
- `app/api/checkout/route.ts`: accepts `{ plan }`, picks `STRIPE_PRICE_ID` or `STRIPE_WEEK_PASS_PRICE_ID`, stamps `metadata.plan`.
- `app/api/webhooks/stripe/route.ts`: reads `metadata.plan`, defaults to `year`.
- `app/api/presets/route.ts`: free accounts can save 3 palettes; Pro 50.
- `app/GradientGenerator.tsx`: two-option upgrade dialog with reason-specific headline, "Go Pro" entry points on desktop and mobile, free users can start saving palettes.
- `lib/plans.test.ts`: plan invariants.

## 7. Sources

Direct competitors: meshgradient.com · instantgradient.com · csshero.org/mesher · grainient.supply/pricing · gradientora.com/pricing · unicorn.studio/docs/pricing · paper.design/pricing · shaders.paper.design · haikei.app/pricing · mshr.app · magicpattern.design/pricing · colorffy.com/about/pricing · coolors.co/pricing · better-gradient.com · gradient-generator.visualy.at · meshgradientgenerator.com · auroragradient.com · colorflow.ls.graphics · fffuel.co · bgjar.com · figma.com/community (oodesign, Gautham, Onload plugins) · apps.apple.com (Mesh Gradient, Mesh Gradients Ultimate, Meshing) · recraft.ai/docs · lummi.ai/pro · magnific.com/pricing · elements.envato.com/pricing · creativemarket.com/tags/gradient-backgrounds · gumroad.com (various packs)

Adjacent tools: xnapper.com/pricing · cleanshot.com/pricing · screen.studio · cursorful.com · pika.style/pricing · makerstack.co (Shots.so, Iconscout) · joinsecret.com/mobbin · unsplash.com/plus · thenounproject.com/pricing · home.streamlinehq.com/pricing · shapefest.com/all-access · spline.design/pricing · rive.app/pricing · jitter.video/pricing · cleanup.pictures · costbench.com (remove.bg, Photopea) · sketch.com/pricing · news.tonydinh.com · starterstory.com/screen-studio-breakdown · getlatka.com/companies/mobbin

Evidence: Anderson & Simester, Quantitative Marketing and Economics 2003 · Thomas & Morwitz, JCR 2005 · Thomas, Simon & Kadiyali, Marketing Science 2010 · Frontiers in Behavioral Economics 2026 precision replication · Wadhwa & Zhang 2015 · revenuecat.com (State of Subscription Apps 2024, 2025, 2026; one-year retention) · profitwell.com annual plans · baremetrics.com annual vs monthly · subscriptionindex.com · lennysnewsletter.com free-to-paid conversion · knowledgelib.io conversion benchmarks · blog.asmartbear.com/perfect-pricing · kylepoyar.substack.com · growthunhinged.com usage-based pricing · paritydeals.com lightGallery case · productphilosophy.com currency localisation · dodopayments.com PPP and billing posts · anderson-review.ucla.edu (Alibaba options experiment) · atticusli.com decoy replication · overthinkgroup.com (Groove case) · thebootstrappedfounder.com (LTDs, PPP) · sales.jetbrains.com perpetual fallback · macstories.net Sketch pricing · en.wikipedia.org/wiki/Affinity_(app) · docs.setapp.com revenue distribution

Weakest links: the Gumroad "$30–49 converts 28% better" figure (third-party scrape), ParityDeals lift claims (vendor), Price Intelligently tier-revenue claims (method not public), impulse-threshold dollar bands (practitioner heuristics), and both Screen Studio tweets (search snippets only).
