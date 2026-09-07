# X (Twitter) strategy

Written 2026-09-07 from X's open-sourced ranking code (updated August 2026), X's own product statements, Buffer's 18.8M-post dataset, and launch reports from indie design-tool makers. Companion to `launch-copy.md`.

Confidence tags: **[High]** primary source, **[Medium]** credible data or a maker's own numbers, **[Low]** widely repeated but unverified.

---

## 1. What the ranking actually rewards

Most "X algorithm" guides still quote 2023 weights. The current code says something different, and the strategy below is built on it.

| Signal | Weight | What it means for us |
|---|---|---|
| Like | 0.5 | Nearly worthless. Do not optimise for likes. |
| Repost | 1.0 | Fine, not the goal. |
| Reply | 5.0 | One reply is worth ten likes. Posts that make people answer win. |
| Quote | 5.0 | Same. Renders people want to show off get quoted. |
| Follow the author | 4.0 | A post that earns a follow ranks. |
| Share by copying the link | 20.0 | The single strongest positive signal. Wallpaper drops people send to friends are built for this. |
| Not interested | −43 | |
| Mute | −59 | Repetitive plugs under big accounts earn mutes. |
| Report | −234 | One report cancels about 47 replies. Never bait. |

Sources: `home-mixer/params/param.rs` in github.com/xai-org/x-algorithm. **[High]**

Rules that follow from the code and the data:

1. **Links in the post are allowed again.** X's head of product said in April 2026 that links were never de-boosted, the card just covered the engagement buttons, and in July that link-in-reply is no longer needed. Put the link in the post when the media is strong, and make sure the preview card shows a great render. **[High]**
2. **Replies are the currency.** Every post should give someone a reason to answer: a colour to request, a device to name, a choice to make. **[High]**
3. **Mutuals are boosted since July 2026.** Follow back every designer who engages. Their feeds will show your replies more. **[High]**
4. **Space posts three hours apart.** A second post from the same author in one feed is halved. Two posts a day, morning and afternoon, beats four in an hour. **[High]**
5. **Premium is effectively required for a launch account.** Free accounts average under 100 impressions a post with a median engagement of zero; Premium averages around 600. Budget it for at least the launch quarter. **[High for the effect, Medium for why]**
6. **Native MP4 for motion, a single crisp image for stills, no GIFs.** GIFs are re-encoded, look muddy on gradients, and carry no watch-time signal. Text and video have the best engagement rates in Buffer's 2026 data. **[Medium]**
7. **Zero to two hashtags, and only real ones.** Ranking is embedding-based; hashtags are not a feature in the code. **[Medium]**
8. **Post Tuesday to Thursday, 9 to 11am in your audience's morning.** Design Twitter is US-Pacific plus Europe. 9am Eastern, which is 3pm CET, is the single best daily slot; 10am Pacific is a good second. Weekends and 6 to 11pm are the measured lows. **[High]**
9. **The first hour decides.** Visibility roughly halves every six hours. Be at the keyboard to answer every reply for 60 minutes after posting. Your own replies trigger the reply and mutual boosts. **[Medium]**
10. **Communities are gone** (shut May 2026). Do not plan around them. **[High]**
11. **New accounts get a structural boost, and out-of-network reach is discounted 25 percent.** You do not need a big following to reach strangers, but each post has to earn it on its own. **[High]**

---

## 2. Account setup, before the first post

- **Two accounts.** Your personal account tells the story and does the replying. A product account, `@gradientsstudio`, posts only renders and wallpapers. Unicorn Studio's product account out-followed its founder five to one; renders travel further than a person does.
- **Premium on the personal account** for the launch quarter. Unlocks long posts for the "how grain is rendered" explainer.
- **Bio:** "Making Gradients Studio, a mesh gradient tool with real grain. Free wallpapers every week." Link to `gradients.studio/wallpapers`, since a free page converts cold profile visits better than the app.
- **Pinned post:** the launch thread once it exists; until then, the best before/after grain post.
- **Header image:** a 4K crop of Ember at 100 percent, grain visible.
- **Assets to make once, reuse for weeks:** a 10-second screen recording of the studio making one gradient from blank to export (record it in Screen Studio or similar, cursor visible, no audio), a 100-percent crop of a grain-on versus grain-off pair, one render each of Pixel and Dither, and the twelve wallpapers in phone frame.

---

## 3. Post templates

Every template below names the media to attach and the reply hook. Copy is ready to paste; adjust numbers in brackets.

### T1. Launch thread (Tuesday or Wednesday, 9am ET, Premium account)

**Post 1.** Media: the 10-second clip, blank canvas to 4K export, style flipping blobs to stripes to clouds, grain slider going up.
> I built a mesh gradient tool because every generator I tried faked the grain.
>
> Gradients Studio renders it into the image at 4K, so it doesn't band on a big screen.
>
> Free to use, 5 exports a month, no watermark. gradients.studio

**Post 2.** Media: the grain-off versus grain-on crop at 100 percent.
> Left is a smooth blur. Right is the same colours with grain rendered at export size. Zoom in. That's the whole reason it exists.

**Post 3.** Media: two images, Pixel and Dither of the same gradient.
> Two finishes on top: Pixel turns it into a dot matrix, Dither snaps it to the palette and fills the edges with symbols. Both export at 4K.

**Post 4.** Media: three renders, same palette, blobs, stripes, clouds.
> Three styles, one set of controls. Same four colours in each.

**Post 5.** Text only.
> Pricing: free is 5 exports a month. Pro is $39 once for 12 months. A Week Pass is $9. Nothing auto-renews. I priced it against what I'd pay for a tool I open twice a week.

**Post 6.** Text only. This is the reply engine.
> Reply with a hex code or a colour word and I'll render your gradient at 4K today.

Pin the thread. Reply to every comment for two hours. Render every colour request as a reply with the image, tagging the requester.

### T2. Wallpaper drop (weekly, product account, one image)

Media: one wallpaper in a phone frame, or the desktop file on its own.
> Wallpaper [07], "[Ember]". Free at 5K for Mac, 4K desktop and phone size, no sign-up.
> gradients.studio/wallpapers/[ember]
>
> Which device do you want next week's for?

Add alt text naming the palette. The goal here is copy-link shares, so the landing page must stay fast and sign-up free.

### T3. Process clip (twice a week, native video under 20 seconds, no audio, captions baked in)

Media: screen recording, cursor visible, one gradient from blank to the exported file shown at 100 percent.
> Clouds style, 35% grain, Dither on top. Start to export in 18 seconds.

One line of what changed. Nothing else.

### T4. Before and after (weekly, image pair or a 6-second crossfade)

> Same colours. The only difference is whether the grain is rendered or overlaid.
>
> Which one would you ship?

Poll variant: attach a two-option poll, "Smooth" and "Grain".

### T5. Reply with a colour (every two weeks, text only)

> Drop a hex or a colour word. I'll turn the first 20 into 4K gradients and post them in this thread.

Render each as a reply with the image, tag the person. This is the highest-value format the ranking code allows: replies, follows, and shares in one post. It is what Xnapper's "drop a wave for a beta code" posts did before its launch.

### T6. Pixel and Dither reveal (feature post)

Media: one gradient in both finishes, plus a zoomed crop.
> Two finishes nobody else renders at 4K. Dither snaps every cell to the palette; Pixel is a dot matrix on the background colour. Both are in the free tier.

### T7. One-time pricing (text first, long post optional)

> $39 once for 12 months of Pro. Not $39 a month.
>
> A gradient tool is something you open in bursts. A subscription for that felt wrong, so there isn't one.

Follow with a reply carrying a 4K export. If you write the long version, tell the story of the banding problem, the grain fix, and why the price is a pass rather than a plan.

### T8. Product Hunt day (runs alongside T1)

| Time (Pacific) | Post |
|---|---|
| 12:01am | Launch on Product Hunt. First comment there is the backstory: banding, rendered grain, one-time price. |
| 6:00am | X launch thread (T1). Put the Product Hunt link in a reply with "feedback welcome", never "please upvote"; Product Hunt suppresses vote asks. |
| 10:00am | Numbers post with a fresh render: "6 hours in: [N] gradients exported, [N] wallpapers downloaded." |
| 1:00pm | Quote-post the best render someone made, with credit. |
| 5:00pm | "Reply with a colour" thread (T5). |
| Next morning | Results post with real numbers, win or lose. Xnapper's honest launch report is the model. |

---

## 4. Four-week calendar

Two posts on weekdays, spaced at least three hours apart, one on weekends, plus ten to fifteen replies a day on other people's posts. The week-three launch assumes Product Hunt on the Tuesday.

| Week | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|---|---|---|---|---|---|---|---|
| 1, warm-up | Process clip, blobs | Wallpaper 1 | Before and after grain | Reply with a colour 1 | Pixel and Dither reveal | Quote a designer's palette with a render | DM the 20 people who replied Thursday |
| 2, anticipation | "Launching next Tuesday" teaser, stripes clip | Wallpaper 2 | Long post: how grain is rendered | Reply with a colour 2 | Pricing post | Timelapse of a wallpaper set | Schedule launch assets, DM the list |
| 3, launch | Final teaser | Product Hunt plus launch thread (T8) | Results post plus Wallpaper 3 | Reply with a colour 3, the big one | "What people made" round-up | Dither wallpaper drop | Thank-you post, follow back every mutual |
| 4, compound | Feature clip, clouds | Wallpaper 4 | Before and after, Pixel | Reply with a colour 4 | Numbers post: exports, sign-ups, Pro sales | Directory submissions post | Plan next month's wallpapers |

**One render, a week of posts.** From a single 4K master: a 100-percent grain crop, the phone wallpaper, the desktop wallpaper, an 8-second zoom-out video, a before-and-after pair, Pixel and Dither variants, and a text post with the hex codes behind it.

---

## 5. Who to engage, and how

Reply within the first hour with something specific. A render that responds to their post beats text. Never drop your URL in someone else's thread unless asked. One reply per thread. Follow back mutuals. Quote-post users' renders with credit. Never ask for likes, follows or upvotes.

**Curators and directories.** Submit once, then tag when you post.
- toools.design and its X account, 2,200 curated tools.
- recent.design, where Godly's submissions now go.
- Refero, UI reference library that designers repost from.
- Land-book, Minimal Gallery, siteInspire, once the wallpaper pages are polished; their accounts repost featured sites.
- Best Designs on X, hand-picked design posts from X every hour; being picked is a direct amplifier.
- Product Hunt's account reposts strong launches.
- Sidebar and Craftwork have both shared mesh gradient tools before.
- Codrops got Unicorn Studio a feature. Pitch "rendering real grain in the browser" as a technical article.

**Makers to engage as peers.** Reply to their work, quote with credit, propose swaps.
- Adam Pietrasiak, Screen Studio. Reply with clips recorded in his tool; he reposts good demos.
- Tony Dinh, Xnapper. Posts build-in-public numbers and replies to honest launch reports.
- George Hastings, Unicorn Studio. Shader and gradient adjacent; recreate one of his demos with your grain.
- Jim Raptis, MagicPattern. Pattern and gradient tool maker; a natural cross-promotion.
- Grainient. A direct competitor on the grain angle. Do not attack; reply with genuinely different results, real rendered grain and Dither.
- Haikei, Shots, Pika. Mockup and asset tools that need backgrounds; offer them a free background pack.
- Basic Apple Guy. Owns the wallpaper audience; reply to his drops with your own take, credited, never as a plug.

**Design voices worth replying to with substance, not pitches.** Amelia Wattenberger, Ammaar Reshi, Karina Nguyen, Fabricio Teixeira, and the UI-snippet accounts that share resources. Also the Framer, Figma and Vercel community managers when they ask "show us what you built".

---

## 6. Pitfalls

1. **Building on 2023 weights.** "Replies 13.5x, links penalised 1,700 percent" are stale. Current code: reply 5, like 0.5, copy-link share 20, report −234.
2. **Links in replies out of habit.** No longer needed since July 2026. It only costs clicks. Do make the preview card show your best render.
3. **Running without Premium.** Under 100 impressions a post on a free account, median engagement zero.
4. **Burst posting.** The second post in a feed is halved. Space posts three hours apart.
5. **Engagement bait and hashtag stuffing.** Mute and report weights dwarf any upside.
6. **GIFs for motion.** No watch-time signal, muddy on gradients. Short MP4 only.
7. **A cold Product Hunt launch.** Every case that worked had a warm list first: Xnapper had 45,000 followers, Screen Studio went viral before launch. Weeks one and two exist to build that list.
8. **Weekend and evening posting.** The measured lows.
9. **Chasing likes.** Optimise for replies, copy-link shares and follows; that is what the scorer pays.
10. **Pricing whiplash.** Screen Studio publicly regretted a jump to $229. Say "$39 once" plainly and keep it.

---

## 7. Sources

X ranking code: github.com/xai-org/x-algorithm, `home-mixer/params/param.rs` and `home-mixer/scorers/ranking_scorer.rs`. X product statements on links: x.com/nikitabier/status/2041911302541730237 and the July 2026 exchange. Mutuals update: techcrunch.com, 13 July 2026. Communities shutdown: xcommunies.com/x-communities-shutdown. Buffer: x-premium-review, links-on-x, state-of-social-media-engagement, best-time-to-post-on-twitter. Sprout Social: best-times-to-post-on-twitter, twitter-algorithm. Maker reports: solounicorn.club Screen Studio day 40, indiehackers.com Xnapper launch report, supabird.io on Tony Dinh's tactics, draper.chat solo founders' first 100 customers, tympanus.net Codrops feature on Unicorn Studio, basicappleguy.com gradient drops. Cadence and Product Hunt: teract.ai indie-hacker X strategy, producthunt.com/launch, dev.to Product Hunt playbook. Curators: toools.design/submit, uxcel.com best accounts, shamanth.dev designer list.

Gaps: X's help-centre spam policy pages were unreachable; no public X metrics exist for Shots, Haikei or Coolors; the Premium mechanism is measured but not visible in the open code.
