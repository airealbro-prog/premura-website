
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
