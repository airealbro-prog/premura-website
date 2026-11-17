/* ═══════════════════════════════════════════════════════════════════
   PREMURA — 20-POINT SALES AUDIT
   Self-contained. No network calls. Nothing leaves the browser.

   CAPTURE IS OFF. See submitAudit() near the bottom of this file — it
   is the single, deliberately inert stub where a GoHighLevel write
   would go. Nothing is sent anywhere while CAPTURE_ENABLED is false,
   and the email block on the results view stays hidden.
   ═══════════════════════════════════════════════════════════════════ */

/* ── CAPTURE FLAG — the one switch ──────────────────────────────────
   false  → no email field, no network call, nothing captured.
   true   → shows the email block and calls submitAudit().
   Leave this false until the capture route is built and every workflow
   armed on the target has been enumerated and shown to Ryan.         */
const CAPTURE_ENABLED = false;

const DK_LABEL = 'Don’t know / we don’t track it';

/* ── THE AUDIT ──────────────────────────────────────────────────────
   20 questions in 5 sections, fixed order. Each question has four
   scored options, worst to best, scoring 0 / 1 / 2 / 3 by index, plus
   a "don't know" that always scores 0.                               */
const SECTIONS = [
  {
    name: 'Where your appointments come from',
    short: 'Sources',
    questions: [
      { q: 'What share of your appointments come from a single source?',
        opts: ['Almost all of them',
               'Most — around three-quarters',
               'Roughly half',
               'Spread across three or more sources'] },
      { q: 'Do you know what one appointment costs you, all in?',
        opts: ['No — we have never worked it out',
               'A ballpark, not from the numbers',
               'Yes for our main channel, not the others',
               'Yes — all in, by channel'] },
      { q: 'When the weather turns or it is January, does your appointment volume drop?',
        opts: ['It falls off a cliff',
               'Noticeably, every year',
               'A little — we ride it out',
               'No — volume holds through the season'] },
      { q: 'If your top two reps quit tomorrow, how long until volume recovers?',
        opts: ['Months',
               'Six to eight weeks',
               'A few weeks',
               'Barely a dent — volume is not tied to individuals'] },
      { q: 'Have you bought appointments or run paid ads in the last 12 months?',
        opts: ['Yes — it is where most appointments come from',
               'Yes — a meaningful share of volume',
               'We tried it; it is a small part now',
               'No — none in the last 12 months'] }
    ]
  },
  {
    name: 'Appointment quality',
    short: 'Quality',
    questions: [
      { q: 'Is homeowner status confirmed before an appointment is booked?',
        opts: ['No — the closer finds out at the door',
               'Sometimes, if the setter remembers',
               'Usually — it is on the script',
               'Always — no booking without it'] },
      { q: 'Is the utility bill holder’s name confirmed before booking?',
        opts: ['No — we do not ask',
               'Sometimes',
               'Usually — it is on the script',
               'Always — required before booking'] },
      { q: 'Is credit screened before a closer is sent out?',
        opts: ['No — credit comes up at the kitchen table',
               'Sometimes, on bigger jobs',
               'A soft screen on most appointments',
               'Always — before anyone is dispatched'] },
      { q: 'What is your sit rate — appointments booked that actually get sat?',
        opts: ['Under 50%',
               '50 to 65%',
               '65 to 80%',
               'Over 80%'] },
      { q: 'What share of appointments turn out to be renters or otherwise unqualified?',
        opts: ['More than 1 in 4',
               'About 1 in 5',
               'About 1 in 10',
               'Fewer than 1 in 20'] }
    ]
  },
  {
    name: 'Your closers',
    short: 'Closers',
    questions: [
      { q: 'How many appointments does a closer sit in a typical week?',
        opts: ['Fewer than 5',
               '5 to 8',
               '9 to 12',
               'More than 12'] },
      { q: 'What share of their week goes to generating their own appointments?',
        opts: ['More than half',
               'About a third',
               'A small part of the week',
               'None — they close, we feed them'] },
      { q: 'Do you know your close rate on preset appointments vs self-generated?',
        opts: ['No — we do not split it out',
               'A sense of it, not numbers',
               'Yes for one, not the other',
               'Yes — both, tracked separately'] },
      { q: 'Are your closers ever idle because the calendar is empty?',
        opts: ['Often — gaps most weeks',
               'Some weeks, yes',
               'Rarely',
               'Never — the calendar stays full'] }
    ]
  },
  {
    name: 'Your team',
    short: 'Team',
    questions: [
      { q: 'How many reps have you lost in the last 90 days?',
        opts: ['Four or more',
               'Two or three',
               'One',
               'None'] },
      { q: 'Hours a week you or your managers spend training reps?',
        opts: ['15 or more',
               '8 to 15',
               '4 to 8',
               'Under 4 — someone else carries it'] },
      { q: 'How long before a new rep is productive?',
        opts: ['Three months or more',
               'About two months',
               'Three to four weeks',
               'Inside two weeks'] }
    ]
  },
  {
    name: 'What you can actually see',
    short: 'Visibility',
    questions: [
      { q: 'Can you trace every install back to the source that produced it?',
        opts: ['No — we could not say',
               'For some, if we dig',
               'For most of them',
               'Every one — it is in the CRM'] },
      { q: 'Do you track sit rate, close rate and cost per acquisition separately?',
        opts: ['None of the three',
               'One of them',
               'Two of them',
               'All three, separately'] },
      { q: 'Does every appointment land in one CRM automatically?',
        opts: ['No — they live in a few places',
               'Someone enters them by hand',
               'Most arrive automatically, some do not',
               'Yes — every one, automatically'] }
    ]
  }
];

/* ── TIERS — off the total out of 60 ─────────────────────────────── */
const TIERS = [
  { min: 45, max: 60, name: 'Your gap is volume, not process',
    read: 'Your process holds together. Qualification happens before anyone drives out, you can see your numbers, and your closers spend their week closing. What you are short of is appointments to run it on — and of everything on this sheet, that is the most straightforward thing to fix.' },
  { min: 30, max: 44, name: 'A working engine with specific leaks',
    read: 'The engine runs. The breakdown below points at the specific places it loses pressure, and it is usually one or two sections rather than everything. Those are worth fixing before anything gets rebuilt, because the rest of the machine is already there.' },
  { min: 15, max: 29, name: 'Heavy single-channel dependency',
    read: 'Most of what you have rests on one source and a handful of people. That works until the weather turns, the season changes or a rep leaves. The sections below show where the weight is sitting right now.' },
  { min: 0,  max: 14, name: 'Flying blind',
    read: 'Not much here is tracked tightly enough to act on yet — either the numbers do not exist or they are all pointing the same way. That is a visibility problem before it is a sales problem, and the sections below are in the order worth fixing.' }
];

/* ── PER-SECTION READS — four bands per section ─────────────────── */
const SECTION_READS = [
  { strong: 'Volume comes from more than one place and you know what it costs. A slow season will not take you out.',
    mixed:  'More than one source, but the mix leans. A slow January would still be felt.',
    thin:   'Most volume comes from one place, and the cost of an appointment is not pinned down.',
    weak:   'One source carries almost everything, at a cost nobody has worked out. This is the biggest exposure on the sheet.' },
  { strong: 'Qualification happens before a closer drives anywhere, and your sit rate reflects it.',
    mixed:  'Qualification happens, but not on every booking. The gaps show up as drive time.',
    thin:   'The checks are inconsistent, so your closers are absorbing the misses.',
    weak:   'Appointments are being booked before anyone confirms they can be sold to. Everything downstream pays for that.' },
  { strong: 'Your closers close, and they are not building their own pipeline to do it.',
    mixed:  'Your closers sit a reasonable week, but part of it goes to generating their own appointments.',
    thin:   'A meaningful share of closer time is not spent in front of homeowners.',
    weak:   'Your closers are doing setter work and sitting idle between it. That is the most expensive hour in the business.' },
  { strong: 'Reps stay, they ramp quickly, and training is not eating your managers’ week.',
    mixed:  'Churn and ramp time are manageable, but they are costing you weeks.',
    thin:   'You are replacing and retraining often enough that it has become a line item.',
    weak:   'Hiring, training and churn are consuming the time that should be going into selling.' },
  { strong: 'You can see where installs come from and what each stage costs. Decisions can be made on this.',
    mixed:  'You can see most of it. The gaps are in the numbers that decide where spend goes.',
    thin:   'Attribution and the three core rates are not separated, so spend decisions are partly guesswork.',
    weak:   'Right now an install cannot be traced back to its source. Worth fixing first — it is what makes everything else measurable.' }
];

/* ── FLATTEN ─────────────────────────────────────────────────────── */
const QUESTIONS = [];
SECTIONS.forEach(function (sec, si) {
  sec.questions.forEach(function (q) {
    QUESTIONS.push({ q: q.q, opts: q.opts, sec: si });
  });
});
const TOTAL_Q = QUESTIONS.length;                                        // 20
const SECTION_MAX = SECTIONS.map(function (s) { return s.questions.length * 3; }); // [15,15,12,9,9]
const MAX_SCORE = SECTION_MAX.reduce(function (a, b) { return a + b; }, 0);        // 60

/* ── STATE ───────────────────────────────────────────────────────── */
const answers = new Array(TOTAL_Q).fill(null);   // 0..3, or 'dk'
let current = 0;

/* ── SCORING ─────────────────────────────────────────────────────── */
function valueOf(a) { return (a === 'dk' || a === null) ? 0 : a; }

function score() {
  const bySection = SECTIONS.map(function () { return 0; });
  let total = 0, dk = 0, answered = 0;
  answers.forEach(function (a, i) {
    if (a !== null) answered++;
    if (a === 'dk') dk++;
    const v = valueOf(a);
    total += v;
    bySection[QUESTIONS[i].sec] += v;
  });
  return { total: total, bySection: bySection, dk: dk, answered: answered };
}

function tierFor(total) {
  for (let i = 0; i < TIERS.length; i++) {
    if (total >= TIERS[i].min && total <= TIERS[i].max) return TIERS[i];
  }
  return TIERS[TIERS.length - 1];
}

function bandFor(got, max) {
  const pct = max === 0 ? 0 : got / max;
  if (pct >= 0.75) return 'strong';
  if (pct >= 0.5)  return 'mixed';
  if (pct >= 0.25) return 'thin';
  return 'weak';
}

/* Exposed so the scoring can be tested at the tier boundaries rather
   than assumed. See the PR description for the exact checks run.     */
window.PremuraAudit = {
  SECTIONS: SECTIONS, QUESTIONS: QUESTIONS, TIERS: TIERS,
  MAX_SCORE: MAX_SCORE, SECTION_MAX: SECTION_MAX,
  answers: answers, score: score, tierFor: tierFor, bandFor: bandFor,
  setAnswers: function (arr) {
    for (let i = 0; i < TOTAL_Q; i++) answers[i] = arr[i];
  },
  showResults: function () { showResults(); },
  resultsAsText: function () { return resultsAsText(); }
};

/* ── DOM ─────────────────────────────────────────────────────────── */
const elIntro    = document.getElementById('saIntro');
const elQuiz     = document.getElementById('saQuiz');
const elResults  = document.getElementById('saResults');
const elQNum     = document.getElementById('saQNum');
const elQSection = document.getElementById('saQSection');
const elQText    = document.getElementById('saQText');
const elOpts     = document.getElementById('saOpts');
const elBar      = document.getElementById('saBarFill');
const elBack     = document.getElementById('saBack');
const elRail     = document.getElementById('saRail');
const elStage    = document.getElementById('saStage');

function pad2(n) { return n < 10 ? '0' + n : String(n); }

function buildRail() {
  if (!elRail) return;
  elRail.innerHTML = '';
  SECTIONS.forEach(function (s, i) {
    const d = document.createElement('div');
    d.className = 'sa-rail-stop';
    const num = document.createElement('span');
    num.textContent = pad2(i + 1);
    const lbl = document.createElement('label');
    lbl.textContent = s.short;
    d.appendChild(num);
    d.appendChild(lbl);
    elRail.appendChild(d);
  });
}

function renderQuestion() {
  const item = QUESTIONS[current];
  elQNum.textContent = 'Point ' + pad2(current + 1) + ' / ' + TOTAL_Q;
  elQSection.textContent = SECTIONS[item.sec].name;
  elQText.textContent = item.q;
  elBar.style.width = ((current / TOTAL_Q) * 100) + '%';
  elBack.hidden = (current === 0);

  if (elRail) {
    Array.prototype.forEach.call(elRail.children, function (c, i) {
      c.classList.toggle('active', i === item.sec);
      c.classList.toggle('done', i < item.sec);
    });
  }

  elOpts.innerHTML = '';
  const labels = item.opts.concat([DK_LABEL]);
  labels.forEach(function (label, i) {
    const isDK = (i === item.opts.length);
    const value = isDK ? 'dk' : i;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sa-opt' + (isDK ? ' sa-opt-dk' : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(answers[current] === value));
    if (answers[current] === value) btn.classList.add('selected');
    const key = document.createElement('span');
    key.className = 'sa-opt-key';
    key.setAttribute('aria-hidden', 'true');
    key.textContent = String(i + 1);
    const text = document.createElement('span');
    text.className = 'sa-opt-label';
    text.textContent = label;
    btn.appendChild(key);
    btn.appendChild(text);
    btn.addEventListener('click', function () { choose(value); });
    elOpts.appendChild(btn);
  });

  elStage.classList.remove('sa-in');
  void elStage.offsetWidth;          // restart the transition
  elStage.classList.add('sa-in');
}

function choose(value) {
  answers[current] = value;
  if (current < TOTAL_Q - 1) {
    current++;
    renderQuestion();
  } else {
    showResults();
  }
}

function goBack() {
  if (current > 0) { current--; renderQuestion(); }
}

/* ── RESULTS ─────────────────────────────────────────────────────── */
function showResults() {
  const s = score();
  const tier = tierFor(s.total);

  elQuiz.hidden = true;
  elResults.hidden = false;
  document.body.classList.remove('sa-running');
  elBar.style.width = '100%';

  document.getElementById('saScoreNum').textContent = s.total;
  document.getElementById('saScoreMax').textContent = '/ ' + MAX_SCORE;
  document.getElementById('saTierName').textContent = tier.name;
  document.getElementById('saTierRead').textContent = tier.read;

  const dkEl = document.getElementById('saDk');
  if (s.dk > 0) {
    dkEl.hidden = false;
    document.getElementById('saDkCount').textContent =
      s.dk + ' of ' + TOTAL_Q + (s.dk === 1 ? ' answer was' : ' answers were') +
      ' “don’t know”';
  } else {
    dkEl.hidden = true;
  }

  const grid = document.getElementById('saBreakdown');
  grid.innerHTML = '';
  SECTIONS.forEach(function (sec, i) {
    const got = s.bySection[i], max = SECTION_MAX[i];
    const band = bandFor(got, max);
    const pct = Math.round((got / max) * 100);
    const row = document.createElement('div');
    row.className = 'sa-bd-row sa-band-' + band;
    row.innerHTML =
      '<div class="sa-bd-head">' +
        '<span class="sa-bd-name"></span>' +
        '<span class="sa-bd-score"><b></b><i></i></span>' +
      '</div>' +
      '<div class="sa-bd-track"><div class="sa-bd-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="sa-bd-read"></p>';
    row.querySelector('.sa-bd-name').textContent = sec.name;
    row.querySelector('.sa-bd-score b').textContent = String(got);
    row.querySelector('.sa-bd-score i').textContent = '/' + max;
    row.querySelector('.sa-bd-read').textContent = SECTION_READS[i][band];
    grid.appendChild(row);
  });

  if (CAPTURE_ENABLED) {
    const cap = document.getElementById('saCapture');
    if (cap) cap.hidden = false;
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
  const h = document.getElementById('saResultsHeading');
  if (h) h.focus();
}

/* ── PLAIN-TEXT COPY ─────────────────────────────────────────────────
   With capture off, this is how a respondent gets the sheet to a
   human: copy it and paste it into a reply. No network, no storage. */
function resultsAsText() {
  const s = score();
  const tier = tierFor(s.total);
  const lines = [];
  lines.push('PREMURA 20-POINT SALES AUDIT');
  lines.push('Score: ' + s.total + ' / ' + MAX_SCORE + '  —  ' + tier.name);
  if (s.dk > 0) lines.push('"Don’t know" answers: ' + s.dk + ' of ' + TOTAL_Q);
  lines.push('');
  SECTIONS.forEach(function (sec, i) {
    lines.push(sec.name + ': ' + s.bySection[i] + '/' + SECTION_MAX[i]);
  });
  lines.push('');
  QUESTIONS.forEach(function (item, i) {
    const a = answers[i];
    const label = (a === 'dk' || a === null) ? DK_LABEL : item.opts[a];
    lines.push(pad2(i + 1) + '. ' + item.q);
    lines.push('    ' + label + '  (' + valueOf(a) + '/3)');
  });
  return lines.join('\n');
}

function copyResults(btn) {
  const text = resultsAsText();
  const was = btn.getAttribute('data-label') || btn.textContent;
  btn.setAttribute('data-label', was);
  const done = function () {
    btn.textContent = 'Copied to clipboard';
    setTimeout(function () { btn.textContent = was; }, 2000);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { /* no-op */ }
  document.body.removeChild(ta);
}

/* ═══════════════════════════════════════════════════════════════════
   THE ONLY SUBMIT PATH — DELIBERATELY INERT
   ───────────────────────────────────────────────────────────────────
   Ryan chose capture route (B): this static page POSTs results into
   GoHighLevel. That wiring is NOT in this PR, and nothing has been
   written to GHL.

   Before this function is ever implemented:
     1. Enumerate every workflow, trigger and automation armed on the
        contact field / custom object / form it would write to, and
        show Ryan the list first. This account has a history of config
        changes cascading into mass SMS and email.
     2. Resolve the contact live — the ghl_contacts mirror is roughly
        24% stale.
     3. Keep the agreed behaviour: a note on the GHL contact only, and
        no notification to anyone.
     4. Never put a contact id or an email address in the page URL.

   Then set CAPTURE_ENABLED = true at the top of this file.
   ═══════════════════════════════════════════════════════════════════ */
function submitAudit(payload) {   // eslint-disable-line no-unused-vars
  // INTENTIONALLY EMPTY. No fetch, no beacon, no third party.
  return Promise.reject(new Error('Capture is not configured yet.'));
}

/* ── WIRING ──────────────────────────────────────────────────────── */
(function init() {
  if (!elIntro || !elQuiz || !elResults) return;

  buildRail();

  document.getElementById('saStart').addEventListener('click', function () {
    elIntro.hidden = true;
    elQuiz.hidden = false;
    document.body.classList.add('sa-running');
    current = 0;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'auto' });
    elQText.focus();
  });

  elBack.addEventListener('click', goBack);

  const copyBtn = document.getElementById('saCopy');
  if (copyBtn) copyBtn.addEventListener('click', function () { copyResults(copyBtn); });

  const restart = document.getElementById('saRestart');
  if (restart) restart.addEventListener('click', function () {
    for (let i = 0; i < TOTAL_Q; i++) answers[i] = null;
    current = 0;
    elResults.hidden = true;
    elQuiz.hidden = false;
    document.body.classList.add('sa-running');
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'auto' });
  });

  const capForm = document.getElementById('saCaptureForm');
  if (capForm) capForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const note = document.getElementById('saCaptureNote');
    submitAudit({ email: document.getElementById('saEmail').value, results: resultsAsText() })
      .then(function () {
        if (note) note.textContent = 'Sent. Christian will have this before your call.';
      })
      .catch(function () {
        if (note) note.textContent = 'Could not send that just now. Your results are on screen above — use "Copy my results" and reply to the email instead.';
      });
  });

  // Keyboard: 1-5 answers, Backspace / ArrowLeft steps back.
  document.addEventListener('keydown', function (e) {
    if (elQuiz.hidden) return;
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key >= '1' && e.key <= '5') {
      const n = parseInt(e.key, 10) - 1;
      const max = QUESTIONS[current].opts.length;
      choose(n === max ? 'dk' : n);
      e.preventDefault();
    } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
      goBack();
      e.preventDefault();
    }
  });
})();
