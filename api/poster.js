// Per-recipient email thumbnail: /api/poster?state={{contact.state}}
// 302s to the play-button poster of the testimonial nearest the prospect,
// so the image in the appointment email matches the testimonial the link opens.
// Keep the client list in sync with project/sales-data.js.
const CLIENTS = [
  { id: 'scott',   state: 'MA' },
  { id: 'leicer',  state: 'FL' },
  { id: 'caesar',  state: 'FL' },
  { id: 'rafa',    state: 'CA' },
  { id: 'rossey',  state: 'PA' },
  { id: 'velardi', state: 'NY' },
];
const DEFAULT_ID = 'leicer';
const CENTROID = {AL:[32.8,-86.8],AK:[64.7,-152.3],AZ:[34.3,-111.7],AR:[34.9,-92.4],CA:[37.2,-119.5],
CO:[39.0,-105.5],CT:[41.6,-72.7],DE:[39.0,-75.5],DC:[38.9,-77.0],FL:[28.6,-82.4],GA:[32.6,-83.4],
HI:[20.3,-156.4],ID:[44.4,-114.6],IL:[40.0,-89.2],IN:[39.9,-86.3],IA:[42.1,-93.5],KS:[38.5,-98.4],
KY:[37.5,-85.3],LA:[31.0,-92.0],ME:[45.4,-69.2],MD:[39.0,-76.8],MA:[42.3,-71.8],MI:[44.3,-85.4],
MN:[46.3,-94.3],MS:[32.7,-89.7],MO:[38.4,-92.5],MT:[47.0,-109.6],NE:[41.5,-99.8],NV:[39.3,-116.6],
NH:[43.7,-71.6],NJ:[40.2,-74.7],NM:[34.4,-106.1],NY:[42.9,-75.5],NC:[35.5,-79.4],ND:[47.4,-100.5],
OH:[40.3,-82.8],OK:[35.6,-97.5],OR:[43.9,-120.6],PA:[40.9,-77.8],RI:[41.7,-71.6],SC:[33.9,-80.9],
SD:[44.4,-100.2],TN:[35.9,-86.4],TX:[31.5,-99.4],UT:[39.3,-111.7],VT:[44.1,-72.7],VA:[37.5,-78.9],
WA:[47.4,-120.4],WV:[38.6,-80.6],WI:[44.6,-90.0],WY:[43.0,-107.6]};
const NAMES = {alabama:'AL',alaska:'AK',arizona:'AZ',arkansas:'AR',california:'CA',colorado:'CO',
connecticut:'CT',delaware:'DE','district of columbia':'DC',florida:'FL',georgia:'GA',hawaii:'HI',
idaho:'ID',illinois:'IL',indiana:'IN',iowa:'IA',kansas:'KS',kentucky:'KY',louisiana:'LA',maine:'ME',
maryland:'MD',massachusetts:'MA',michigan:'MI',minnesota:'MN',mississippi:'MS',missouri:'MO',
montana:'MT',nebraska:'NE',nevada:'NV','new hampshire':'NH','new jersey':'NJ','new mexico':'NM',
'new york':'NY','north carolina':'NC','north dakota':'ND',ohio:'OH',oklahoma:'OK',oregon:'OR',
pennsylvania:'PA','rhode island':'RI','south carolina':'SC','south dakota':'SD',tennessee:'TN',
texas:'TX',utah:'UT',vermont:'VT',virginia:'VA',washington:'WA','west virginia':'WV',
wisconsin:'WI',wyoming:'WY'};

function stateCode(s) {
  if (!s) return null;
  s = String(s).trim();
  if (/^[A-Za-z]{2}$/.test(s) && CENTROID[s.toUpperCase()]) return s.toUpperCase();
  return NAMES[s.toLowerCase()] || null;
}
function nearestId(state) {
  const code = stateCode(state);
  if (!code) return DEFAULT_ID;
  const p = CENTROID[code];
  let best = DEFAULT_ID, bestD = Infinity;
  for (const c of CLIENTS) {
    const q = CENTROID[c.state];
    const d = (p[0]-q[0])**2 + ((p[1]-q[1]) * Math.cos(p[0]*Math.PI/180))**2;
    if (d < bestD) { bestD = d; best = c.id; }
  }
  return best;
}

module.exports = (req, res) => {
  const id = nearestId(req.query.state || req.query.loc);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.redirect(302, `https://www.premura.org/assets/email-poster-${id}.jpg`);
};
