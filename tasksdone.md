
## 2026-10-10 — Pre-call UX batch (PR #56)
- Graceful hover-fade: FAQ hover-to-play now waits 140ms (hover-intent) then fades the muted preview in/out over 0.5s instead of snapping on. (pre-call.html + pre-call-b.html wistiaHover; pre-call.css .pc-hoverframe opacity transition)
- White-page palette simplified to white/purple/black: --pc-green & --pc-red fold into purple on pre-call-b; hard-coded pink ring on .pc-know-btn → purple. (pre-call-light.css) Dark variant untouched.
- Moved 👇 from "…2 steps" headline to end of "1. Watch this". (both HTML)
- Verified on Netlify deploy-preview-56: white variant (purple-only accents, 👇 placed, hover fade-in AND fade-out), dark variant (palette unchanged, 👇 placed), mobile 375px layout holds.
- FLAGGED to Ryan: (1) heading edit conflicts with open Step-3 PR #54 — will resolve on merge; (2) ✅ emoji in "You're booked" keeps its green (emoji, not CSS) — awaiting his call on swap.
- PR: https://github.com/airealbro-prog/premura-website/pull/56
