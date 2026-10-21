
## 2026-10-10 — Pre-call UX batch (PR #56)
- Graceful hover-fade: FAQ hover-to-play now waits 140ms (hover-intent) then fades the muted preview in/out over 0.5s instead of snapping on. (pre-call.html + pre-call-b.html wistiaHover; pre-call.css .pc-hoverframe opacity transition)
- White-page palette simplified to white/purple/black: --pc-green & --pc-red fold into purple on pre-call-b; hard-coded pink ring on .pc-know-btn → purple. (pre-call-light.css) Dark variant untouched.
- Moved 👇 from "…2 steps" headline to end of "1. Watch this". (both HTML)
- Verified on Netlify deploy-preview-56: white variant (purple-only accents, 👇 placed, hover fade-in AND fade-out), dark variant (palette unchanged, 👇 placed), mobile 375px layout holds.
- FLAGGED to Ryan: (1) heading edit conflicts with open Step-3 PR #54 — will resolve on merge; (2) ✅ emoji in "You're booked" keeps its green (emoji, not CSS) — awaiting his call on swap.
- PR: https://github.com/airealbro-prog/premura-website/pull/56

## 2026-10-10 — Two more pre-call PRs (one session)
- **PR #57** (branch feat/precall-step3-and-emoji): Step 3 "Add to calendar" (brought over from stale #54, reconciled onto main's hover/palette work) + removed the green ✅ emoji from the "You're booked" eyebrow. Heading now "3 steps". Verified on deploy-preview-57 (both variants): Step 3 with-time state shows real local time + Google/Apple/Outlook links; no-time state falls back to "Open your email". Supersedes #54 (ask Ryan to close #54).
- **PR #58** (branch feat/precall-faq-scroll-label): sliding "click to play video" label on FAQ thumbnails. Desktop: slides in on hover (CSS, hover:hover). Mobile/touch: hover:none-only IntersectionObserver shows the label on the single most in-view tile (one-at-a-time) as you scroll; slides out when it leaves. Videos still tap-to-play (no autoplay on mobile scroll — flagged to Ryan as a choice). Verified on deploy-preview-58: desktop hover slide confirmed, mobile showingCount==1 at all scroll positions, 0 videos auto-played.
- Dropped a local .claude/launch.json that got swept into #57 by git add -A.
- PRs: https://github.com/airealbro-prog/premura-website/pull/57 , https://github.com/airealbro-prog/premura-website/pull/58

## 2026-10-11 — Testimonials bigger + rename Reviews → Testimonials (PR #59)
- /reviews #rv-videos: 3-up grid → one big testimonial per screen (card sized off viewport height; 1067x736 at 1440x900, up to 1320w). PR #7 click-to-play facade unchanged.
- Ortega poster: Wistia 100x56 swatch (3rd-party on load, blurry) → local assets/review-ortega.jpg 1280x720.
- "Reviews" → "Testimonials" label in nav/mobile nav/footer on all 53 pages (162 swaps) + reviews.html title/meta/eyebrow/section label/a11y. URL kept at /reviews (no redirect needed).
- Left as-is (flagged to Ryan): inline "reviews page" prose links on SEO pages, footer reputation links, JSON-LD names; duplicate "Testimonials" footer label (/reviews vs /premura-testimonials).
- Verified on Vercel preview (premuraorg-website, SSO-protected, via OIDC header): files byte-identical, desktop+mobile no h-scroll, in-place Vimeo iframe on click, only Google Fonts on load. Screenshots: pr-screenshots/reviews-embed/pr59/.
- PR: https://github.com/airealbro-prog/premura-website/pull/59

## 2026-10-11 — /reviews → /testimonials route move (PR #60)
- reviews.html → testimonials.html (canonical updated); vercel.json 308 /reviews → /testimonials (query string kept). Dropped a /reviews.html rule — cleanUrls already sends it to /reviews (2 hops, lands fine).
- 263 internal href="/reviews" across 55 pages + sitemap.xml + llms.txt → /testimonials; 2 "/reviews" link labels + 1 meta description fixed.
- Verified on Vercel preview: /testimonials 200; /reviews 308→/testimonials (UTMs kept); /reviews.html 2 hops→200; /Reviews 404 same as live. Page renders identically desktop+mobile, in-place Vimeo, only Google Fonts on load.
- PR: https://github.com/airealbro-prog/premura-website/pull/60

## 2026-10-11 — Six new client video testimonials (PR #61)
- New Wistia testimonials: Micah Eagler (California Energy Builders), Thomas Higgs (7H Solar), Mike, Eric Fox, Anthony, Ryan. Stats/quotes verbatim from Wistia captions; local 1280x720 posters.
- /testimonials: 6 cards in the one-per-screen layout + "In Their Words" quote section (6 cards, each links to its video) + VideoObject JSON-LD. Heading → "Fourteen video testimonials".
- Homepage carousel: +6; posters instead of eager iframes (24 → 0 on load; the #59 flag); loop-clone cards now play; Enter/Escape; card step measured from DOM so mobile (240px cards) no longer drifts.
- /premura-testimonials: 5 new before/after stories (11 total). sales-data.js: +6 (CA geo-match still Rafa, in sync with api/poster.js).
- Branch was rebuilt from a ZIP export (base f1f8be9) and rebased onto main after #59/#60: reviews.html → testimonials.html, reviews.css mobile block, review-ortega.jpg (kept main's).
- Verified: headless Edge desktop 1440x900 + mobile 390x844, 134/134 checks. Not yet checked on the Vercel preview (SSO).
- FLAGGED to Ryan: client permission; "7H Solar"/"Eagler" spellings; Mike may be Michael Velardi; Eric Fox stats read by interviewer; testimonials/bryan.mp4 has no embed code yet; assets/proof-discord.png contains homeowner PII (publicly reachable, recommend removal).
- PR: https://github.com/airealbro-prog/premura-website/pull/61

## 2026-10-13 — Pre-call FAQ: remove hover/scroll autoplay (PR #62)
- Per Ryan: FAQ videos must NOT auto-play on hover (desktop) or scroll-to (mobile). Stripped the muted-preview machinery from wistiaHover (build/fadeIn/play/stop, pointerenter/leave/focus/blur, prewarm _pcw) in both pre-call.html + pre-call-b.html. Tiles are now static thumbnails; click/tap plays with sound.
- Kept: the "click to play video" label (slides in on hover desktop / one-at-a-time on mobile scroll) and click-to-play. Testimonials + main video untouched.
- Verified on deploy-preview-62: simulated hover 900ms -> no .pc-hoverframe, no _pcw; click -> frame with autoPlay=true & NOT muted; label present on all 8 tiles.
- PR: https://github.com/airealbro-prog/premura-website/pull/62

## 2026-10-13 — Pre-call: remove Step 3 (PR #63)
- Per Ryan: dropped the "3. Add it to your calendar" step entirely. Removed section markup, .pc-cal* CSS, and the calendar <script> from both pre-call.html + pre-call-b.html. Heading reverted "3 steps" -> "2 steps". Kept the ✅-emoji removal + 👇 on "Watch this".
- Net: 152 deletions, 2 heading edits. Verified on deploy-preview-63 (white page, even with ?start/?end params): heading "2 steps", only steps 1 & 2, no #pc-cal element, no JS errors, 8 FAQ tiles + 7 testimonials intact.
- PR: https://github.com/airealbro-prog/premura-website/pull/63

## 2026-10-14 — Pre-call FAQ: paused 3s -> thumbnail slow-fades back (PR #64)
- Per Ryan: when a playing FAQ answer video is paused for 3s, slow-fade (1.6s) the thumbnail back in; resuming reverses it. FAQ (Wistia) only.
- Impl: FAQ click now embeds the Wistia iframe with ?web_component=true + class/name "wistia_embed"; player.js loaded lazily; once iframe.wistiaApi is ready, bind 'pause' (3s timer -> .pc-thumb-return) and 'play' (cancel/reverse). CSS: .pc-thumb-return fades .pc-hoverframe to opacity 0 over 1.6s and un-hides .pc-poster (is-playing had hidden it). Clicking the returned thumbnail resumes the paused player (fires 'play' -> fades back).
- Verified API via Context7 (Wistia player.js embed API; 'pause' is a bindable event). State-gated preview test on deploy-preview-64: pauseFired=true, thumb-return added ~2900ms after pause, settled frameOpacity=0 + posterOpacity=1, resume -> frameOpacity=1.
- PR: https://github.com/airealbro-prog/premura-website/pull/64

## 2026-10-14 — Pre-call: Meta Pixel to match original GHL page (PR #65)
- Found both original GHL pages (callcenter.premura.org/precallpage-page + /home) use ONLY Meta Pixel 2139803833202789 (no GTM/GA/TikTok). Precall fires init+PageView+Schedule; home fires init+PageView.
- Added the FB pixel to our rebuilt pre-call.html + pre-call-b.html (base code + PageView + Schedule, high in <head>, with noscript). Our page is GHL's post-booking redirect target, so Schedule/booking conversions now fire from it.
- Verified on deploy-preview-65: fbq v2.9.419 loaded, beacons sent to facebook.com/tr for id=2139803833202789 ev=PageView AND ev=Schedule.
- STILL TODO (other half of Ryan's ask): the callcenter.premura.org GHL clone — ensure it has the same pixel. Couldn't verify directly (clone is domainless + my Chrome GHL session lands on a different agency without this sub-account). It was cloned from /home which carries the pixel, so it likely already has it.
- PR: https://github.com/airealbro-prog/premura-website/pull/65

## 2026-10-20 — Pre-call FAQ: translucent play button on thumbnails (PR #72)
- Per Ryan: FAQ thumbnails looked like plain images. Added a see-through centered play button (frosted circle, rgba(255,255,255,.18) fill + .72 ring + play triangle, 58px) to each FAQ tile so they read as videos without hiding the thumbnail text. Re-shows on paused thumbnail return; hidden while playing (existing .is-playing rule). Testimonials keep their solid purple button. Added pc-play span to wistiaHover markup (both HTML) + restyled .pc-q-list .pc-play (was display:none from PR #53).
- Verified on deploy-preview-72 desktop + mobile: buttons centered, translucent, thumbnail text ("What's the cost?" etc.) readable through them; testimonials' purple button unchanged.
- PR: https://github.com/airealbro-prog/premura-website/pull/72

## 2026-10-21 — Pre-call FAQ play button: premium purple glass (PR #74)
- Christian felt the white frosted play button (PR #72) looked cheap. Restyled .pc-q-list .pc-play to purple glass: two-tone purple gradient fill (rgba 169,53,255 .44 -> 123,31,214 .26), thin light ring, purple glow box-shadow + inner top highlight, backdrop blur+saturate. Kept translucent so thumbnail text still shows. FAQ only; testimonials' solid purple button unchanged.
- Verified on deploy-preview-74 (desktop): purple glass buttons centered on FAQ thumbnails, text readable through them.
- PR: https://github.com/airealbro-prog/premura-website/pull/74
