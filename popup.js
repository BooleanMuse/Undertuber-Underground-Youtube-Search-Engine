// ── UNDERTUBER POPUP JS v1.0 ────────────────────────────────────────────────

const CAMERA_PREFIXES = ['IMG_','MVI_','DSC_','DSCN','MOV0','PIC_','WP_','VID_','CIMG','P10','100_','PICT','SDV_','MOV_','DVC_','CAM_','P00','P_20','GOPR','GH01','clip_','video_','capture_','rec_','take_'];
const DEFAULT_TITLES = ['untitled video','my video','test upload','video (2)','video (1)','untitled project 1','my movie','new video','first video','test','untitled','video0001','home video','birthday video','vacation video','funny video','upload','vid0001','untitled1','movie','video clip'];
const EMOJI_RANGES = [ [0x1F300, 0x1F5FF], [0x1F600, 0x1F64F], [0x1F680, 0x1F6FF], [0x1F900, 0x1F9FF], [0x1FA70, 0x1FAFF] ];
const UNICODE_RANGES = [[0x0370,0x05FF],[0x0600,0x06FF],[0x0900,0x097F],[0x10A0,0x10FF],[0x16A0,0x16FF]];
const SORT_SP = { date:'CAI%253D', viewCount_asc:'CAASAhAB', viewCount:'CAM%253D', rating:'CAE%253D', live:'EgJAAQ%253D%253D' };
const SOURCE_MAP = { any:'', mobile:' ".3gp"', camcorder:' ".mts"', pc:' ".avi"', dvd:' ".vob"', console:' "PS4 Share"', meeting:' "Zoom meeting"' };

const LEGACY_TERMS = ['.rmvb', '.flv', '.lbm', 'MiniDV', 'Game Boy camera', 'Amiga 500', 'capture.avi', 'DVCPRO', 'webcam.wmv'];
const AUTOTAG_TERMS = ['"Sent from my BlackBerry"', '"Uploaded via Pixelpipe"', '"Kinect Video"', '"IP Camera"', '"Record by webcam"', '"Uploaded from my mobile phone"'];
const TESTLOG_TERMS = ['audio sync test', 'render test', 'webcam test', 'do not watch', 'test 00', 'test upload', 'mic test'];

const rnd = a => a[Math.floor(Math.random() * a.length)];
const randDigits = n => Array.from({length:n}, () => Math.floor(Math.random()*10)).join('');
const randChars  = n => Array.from({length:n}, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');

function randUnicode(n) { let s=''; for(let i=0;i<n;i++){ const r=rnd(UNICODE_RANGES); s+=String.fromCodePoint(Math.floor(Math.random()*(r[1]-r[0]+1))+r[0]); } return s; }
function randEmoji(n) { let s=''; for(let i=0;i<n;i++){ const r=rnd(EMOJI_RANGES); s+=String.fromCodePoint(Math.floor(Math.random()*(r[1]-r[0]+1))+r[0]); } return s; }
function doTypo(word) { if(word.length<4) return word; const i=Math.floor(Math.random()*(word.length-1)); return word.slice(0,i)+word[i+1]+word[i]+word.slice(i+2); }

function randDateStr() {
  const y = 2005 + Math.floor(Math.random() * (new Date().getFullYear() - 2004));
  const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const yy = String(y).slice(-2);
  const formats = [`${y}${m}${d}`, `${y}-${m}-${d}`, `${d}-${m}-${y}`, `${m}/${d}/${y}`, `${m}/${d}/${yy}`, `${y}_${m}_${d}`, `${d}_${m}_${y}`, `${y} ${m} ${d}`];
  return rnd(formats);
}

function randCodeStr() {
  return rnd([
    () => Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 6),
             () => '0x' + Math.random().toString(16).substring(2, 10).toUpperCase(),
             () => btoa(Math.random().toString()).substring(0, 10).replace(/[^a-zA-Z0-9]/g, '')
  ])();
}

function randGeo() {
  const lat = (Math.random() * 180 - 90).toFixed(4);
  const lon = (Math.random() * 360 - 180).toFixed(4);
  return rnd([`${lat}, ${lon}`, `Lat ${lat}`, `GPS ${randDigits(4)}`]);
}

function buildDateStr(era) {
  if (!era || era === 'any') return '';
  if (era === '2005-2009') return ' after:2005-01-01 before:2010-01-01';
  if (era === '2010-2013') return ' after:2010-01-01 before:2014-01-01';
  if (era === '2014-2016') return ' after:2014-01-01 before:2017-01-01';
  if (era === '2017-2019') return ' after:2017-01-01 before:2020-01-01';
  if (era === '2020-2023') return ' after:2020-01-01 before:2024-01-01';
  if (era === '2024-2026') return ' after:2024-01-01 before:2027-01-01';

  const currentYear = new Date().getFullYear();
  if (era === 'random') {
    const y = 2005 + Math.floor(Math.random() * (currentYear - 2004));
    return ` after:${y}-01-01 before:${y+1}-01-01`;
  }

  if (/^\d{4}$/.test(era)) {
    return ` after:${era}-01-01 before:${parseInt(era)+1}-01-01`;
  }
  return '';
}

function buildSP(era, sort, live) {
  if (live || sort === 'live') return '&sp=' + SORT_SP.live;
  if (era === 'today') return '&sp=EgIIAg%253D%253D';
  if (SORT_SP[sort]) return '&sp=' + SORT_SP[sort];
  return '';
}

function setOutput(text) { document.getElementById('output-text').textContent = text; }
function updateStatus(on) {
  document.getElementById('status-dot').classList.toggle('on', !!on);
  document.getElementById('status-label').textContent = on ? 'ACTIVE' : 'INACTIVE';
}
function switchTab(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.querySelector(`.tab[data-tab="${name}"]`).classList.add('active');
}

let customVocabData = [];
let currentOverrideSp = null;

function getSettings() {
  const v  = id => document.getElementById(id).value;
  const cb = id => document.getElementById(id).checked;
  return {
    enabled:            cb('master-toggle'),
    interceptSearch:    cb('intercept-toggle'),
    replaceLogo:        cb('logo-toggle'),
    replaceHome:        cb('home-toggle'),
    replaceSidebar:     cb('sidebar-toggle'),
    sidebarAutoRefresh: cb('sidebar-autorefresh'),
    imageThumbs:        cb('image-thumbs-toggle'),
    imagePool:          parseInt(v('image-pool-size')) || 200,
    feedEraToggle:      cb('feed-era-toggle'),
    applyEra:           cb('apply-era-toggle'),
    vocabQuotes:        cb('vocab-quotes-toggle'),
    sidebarEra:         v('sidebar-era'),
    region:             v('region-select'),
    era:                v('era-select'),
    category:           v('category-select'),
    source:             v('source-select'),
    sort:               v('sort-select'),
    exact:              cb('exact-toggle'),
    entropy:            cb('entropy-toggle'),
    typo:               cb('typo-toggle'),
    defaultTitle:       cb('default-toggle'),
      singleChar:         cb('single-toggle'),
      live:               cb('live-toggle')
  };
}

function applySettings(s) {
  if (!s) return;
  const cb = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
  const sv = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
  cb('master-toggle',       s.enabled);
  cb('intercept-toggle',    s.interceptSearch);
  cb('logo-toggle',         s.replaceLogo);
  cb('home-toggle',         s.replaceHome);
  cb('sidebar-toggle',      s.replaceSidebar);
  cb('sidebar-autorefresh', s.sidebarAutoRefresh);
  cb('image-thumbs-toggle', s.imageThumbs);
  sv('image-pool-size',     s.imagePool || 200);
  cb('feed-era-toggle',     s.feedEraToggle !== false);
  cb('apply-era-toggle',    s.applyEra !== false);
  cb('vocab-quotes-toggle', s.vocabQuotes !== false);
  cb('exact-toggle',        s.exact);
  cb('entropy-toggle',      s.entropy);
  cb('typo-toggle',         s.typo);
  cb('default-toggle',      s.defaultTitle);
  cb('single-toggle',       s.singleChar);
  cb('live-toggle',         s.live);
  sv('region-select',       s.region);
  sv('era-select',          s.era);
  sv('category-select',     s.category);
  sv('source-select',       s.source);
  sv('sort-select',         s.sort);
  sv('sidebar-era',         s.sidebarEra);
  updateStatus(s.enabled);
}

function saveSettings() {
  const s = getSettings();
  chrome.storage.sync.set({ undertube: s }, () => {
    const label = document.getElementById('status-label');
    label.textContent = 'SAVED';
    label.style.color = 'var(--red)';
    setTimeout(() => { label.textContent = s.enabled ? 'ACTIVE' : 'INACTIVE'; label.style.color = ''; }, 800);
  });

  updateStatus(s.enabled);
  chrome.tabs.query({ url: 'https://www.youtube.com/*' }, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED' }, () => { void chrome.runtime.lastError; });
    });
  });
}

async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang.startsWith('en')) return text;
  try {
    const langCode = targetLang.split('-')[0];
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map(x => x[0]).join('');
  } catch (e) {
    return text;
  }
}

async function execSearch(forceQuery = null, overrideSp = null) {
  const input = document.getElementById('keyword-input');
  let keyword = forceQuery !== null ? forceQuery : input.value.trim();
  if (!keyword && forceQuery === null) { keyword = rnd(DEFAULT_TITLES); input.value = keyword; }
  const s = getSettings();
  const [lang, country] = (s.region || 'en-US').split('-');

  setOutput('translating & building...');
  let w = keyword;

  if (forceQuery === null) {
    w = await translateText(w, s.region);

    if (s.typo)         w = w.split(' ').map(t => t.length > 3 ? doTypo(t) : t).join(' ');
    if (s.exact)        w = `"${w}"`;
    if (s.defaultTitle) w += ' ' + rnd(DEFAULT_TITLES);
    if (s.entropy)      w += ' ' + randChars(3);
    if (s.category && s.category !== 'any') w += ` "${s.category}"`;
    w += SOURCE_MAP[s.source] || '';
  }

  if (s.applyEra !== false) {
    w += buildDateStr(s.era);
  }
  w = w.replace(/\s+/g, ' ').trim();

  const sp = overrideSp ? `&sp=${overrideSp}` : buildSP(s.era, s.sort, s.live);
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(w)}&hl=${lang}&gl=${country}${sp}`;

  setOutput('> ' + w);
  setTimeout(() => chrome.tabs.create({ url }), 250);
}

function runVoidSearch(method) {
  const currentInput = document.getElementById('keyword-input').value.trim();
  let q = '';
  let overrideSp = null;

  if (method === 'date')    q = randDateStr();
  else if (method === 'code')    q = randCodeStr();
  else if (method === 'geo')     q = randGeo();
  else if (method === 'legacy')  q = rnd(LEGACY_TERMS);
  else if (method === 'autotag') q = rnd(AUTOTAG_TERMS);
  else if (method === 'testlog') q = rnd(TESTLOG_TERMS) + ' ' + randDigits(2);
  else if (method === 'channel') {
    q = currentInput || rnd(['personal vlog', 'test channel', 'amateur radio', 'home lab', 'first video']);
    overrideSp = 'EgIQAg%253D%253D';
  }
  else if (method === 'rawfile') q = rnd(CAMERA_PREFIXES) + randDigits(4);
  else if (method === 'unicode') q = randUnicode(Math.floor(Math.random()*4)+2);
  else if (method === 'emoji')   q = randEmoji(Math.floor(Math.random()*4)+2);
  else if (method === 'default') q = rnd(DEFAULT_TITLES);
  else if (method === 'typo')    q = doTypo(rnd(DEFAULT_TITLES).split(' ')[0]);
  else if (method === 'number')  q = randDigits(4);

  document.getElementById('keyword-input').value = q;
  execSearch(q, overrideSp);
}

document.addEventListener('DOMContentLoaded', () => {

  const currentYear = new Date().getFullYear();
  ['era-select', 'sidebar-era'].forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      const optgroup = document.createElement('option');
      optgroup.disabled = true;
      optgroup.textContent = '── Years ──';
      select.appendChild(optgroup);

      for (let y = 2005; y <= currentYear; y++) {
        const opt = document.createElement('option');
        opt.value = y.toString();
        opt.textContent = y.toString();
        select.appendChild(opt);
      }
    }
  });

  chrome.storage.sync.get('undertube', data => { applySettings(data.undertube || {}); });

  chrome.storage.local.get(['ut_custom_vocab'], d => {
    if (d.ut_custom_vocab && d.ut_custom_vocab.length > 0) {
      customVocabData = d.ut_custom_vocab;
      document.getElementById('vocab-text').value = customVocabData.join('\n');
      document.getElementById('vocab-count').textContent = customVocabData.length + ' WORDS';
    }
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.undertube) applySettings(changes.undertube.newValue);
  });

    document.querySelectorAll('.tab[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('master-toggle').addEventListener('change', saveSettings);
    document.getElementById('clear-btn').addEventListener('click', () => { document.getElementById('keyword-input').value = ''; });

    document.getElementById('btn-save-vocab').addEventListener('click', (e) => {
      e.preventDefault();
      const text = document.getElementById('vocab-text').value;
      let words = text.split(/\r?\n/).map(w => w.trim()).filter(w => w.length > 0);

      if (words.length > 1000) {
        words = words.slice(0, 1000);
        alert("La lista es muy grande. Se guardarán las primeras 1000 palabras por seguridad.");
      }

      chrome.storage.local.set({ut_custom_vocab: words}, () => {
        customVocabData = words;
        document.getElementById('vocab-count').textContent = words.length + ' WORDS';
        document.getElementById('vocab-text').value = words.join('\n');

        const btn = document.getElementById('btn-save-vocab');
        btn.textContent = 'SAVED!';
        btn.style.color = '#ff3333';
        setTimeout(() => { btn.textContent = 'SAVE VOCAB'; btn.style.color = '#aaa'; }, 1500);

        saveSettings();
      });
    });

    document.querySelectorAll('.vbtn[data-method]').forEach(btn => {
      btn.addEventListener('click', () => runVoidSearch(btn.dataset.method));
    });

    document.getElementById('exec-btn').addEventListener('click', () => execSearch());
    document.getElementById('keyword-input').addEventListener('keypress', e => { if (e.key === 'Enter') execSearch(); });

    document.querySelectorAll('select, input[type="checkbox"], input[type="number"]').forEach(el => {
      if (el.id !== 'master-toggle') el.addEventListener('change', saveSettings);
    });
});
