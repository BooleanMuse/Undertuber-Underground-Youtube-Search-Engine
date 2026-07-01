// ── UNDERTUBER CONTENT SCRIPT v1.1 (NATIVE World) ──────────────────────────
//
// FIXED: Dropdown menu closing unexpectedly when clicking select options.
// SECURED: Added composedPath() and event propagation blockers for YT Shadow DOM.

(function () {
  'use strict';

  const CAMERA_PREFIXES = ['IMG_','MVI_','DSC_','DSCN','MOV0','PIC_','WP_','VID_',
  'CIMG','P10','100_','PICT','SDV_','MOV_','DVC_','CAM_','P00','P_20','GOPR',
  'GH01','GX01','clip_','video_','capture_','rec_','take_'];
  const DEFAULT_TITLES = ['untitled video','my video','test upload','video (2)',
 'video (1)','untitled project 1','my movie','new video','first video','test',
 'untitled','video0001','home video','birthday video','vacation video',
 'funny video','upload','vid0001','untitled1','movie','video clip',
 'new recording','untitled movie','personal video','family video'];

 const EMOJI_RANGES = [ [0x1F300, 0x1F5FF], [0x1F600, 0x1F64F], [0x1F680, 0x1F6FF], [0x1F900, 0x1F9FF], [0x1FA70, 0x1FAFF] ];
 const UNICODE_RANGES = [[0x0370,0x05FF],[0x0600,0x06FF],[0x0900,0x097F],[0x10A0,0x10FF],[0x16A0,0x16FF]];
 const SOURCE_MAP = { any:'', mobile:' ".3gp"', camcorder:' ".mts"', pc:' ".avi"', dvd:' ".vob"', console:' "PS4 Share"', meeting:' "Zoom meeting"' };
 const SORT_SP = { date:'CAI%253D', viewCount_asc:'CAASAhAB', viewCount:'CAM%253D', rating:'CAE%253D', live:'EgJAAQ%253D%253D' };
 const VOID_ICONS = ['📼', '📡', '👾', '📟', '🔌', '💾', '🧿', '👺', '🌀', '📻', '🖥️', '🕳️'];

 const LEGACY_TERMS = ['.rmvb', '.flv', '.lbm', 'MiniDV', 'Game Boy camera', 'Amiga 500', 'capture.avi', 'DVCPRO', 'webcam.wmv'];
 const AUTOTAG_TERMS = ['"Sent from my BlackBerry"', '"Uploaded via Pixelpipe"', '"Kinect Video"', '"IP Camera"', '"Record by webcam"', '"Uploaded from my mobile phone"'];
 const TESTLOG_TERMS = ['audio sync test', 'render test', 'webcam test', 'do not watch', 'test 00', 'test upload', 'mic test'];

 let S = null; // Carga nativa de configuración

 const rnd = a => a[Math.floor(Math.random() * a.length)];
 const randDigits = n => Array.from({length:n}, () => Math.floor(Math.random()*10)).join('');
 const randChars  = n => Array.from({length:n}, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random()*36)]).join('');

 function randUnicode(n) { let s=''; for(let i=0;i<n;i++) { const r=rnd(UNICODE_RANGES); s+=String.fromCodePoint(Math.floor(Math.random()*(r[1]-r[0]+1))+r[0]); } return s; }
 function randEmoji(n) { let s=''; for(let i=0;i<n;i++) { const r=rnd(EMOJI_RANGES); s+=String.fromCodePoint(Math.floor(Math.random()*(r[1]-r[0]+1))+r[0]); } return s; }

 function injectTypo(word) {
   if (word.length < 4) return word;
   const i = Math.floor(Math.random() * (word.length - 1));
   return word.slice(0,i) + word[i+1] + word[i] + word.slice(i+2);
 }

 function randDateStr() {
   const y = 2005 + Math.floor(Math.random() * (new Date().getFullYear() - 2004));
   const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
   const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
   const yy = String(y).slice(-2);
   const formats = [
     `${y}${m}${d}`, `${y}-${m}-${d}`, `${d}-${m}-${y}`,
     `${m}/${d}/${y}`, `${m}/${d}/${yy}`,
     `${y}_${m}_${d}`, `${d}_${m}_${y}`, `${y} ${m} ${d}`
   ];
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

 function randomVoidQuery(singleChar) {
   const safeS = S || {};
   if (safeS.customVocab && safeS.customVocab.length > 0 && Math.random() < 0.40) {
     const base = rnd(safeS.customVocab);
     const formattedBase = safeS.vocabQuotes === false ? base : `"${base}"`;
     return Math.random() < 0.5 ? formattedBase : `${formattedBase} ${randDigits(4)}`;
   }

   const method = rnd(['date','code','geo','legacy','autotag','testlog','rawfile','unicode','emoji','default','typo','number']);
   
   if (method === 'date')    return randDateStr();
   if (method === 'code')    return randCodeStr();
   if (method === 'geo')     return randGeo();
   if (method === 'legacy')  return rnd(LEGACY_TERMS);
   if (method === 'autotag') return rnd(AUTOTAG_TERMS);
   if (method === 'testlog') return rnd(TESTLOG_TERMS) + ' ' + randDigits(2);
   if (method === 'rawfile') return rnd(CAMERA_PREFIXES) + randDigits(4);
   if (method === 'unicode') return randUnicode(singleChar ? 1 : Math.floor(Math.random()*4)+2);
   if (method === 'emoji')   return randEmoji(singleChar ? 1 : Math.floor(Math.random()*4)+2);
   if (method === 'default') return rnd(DEFAULT_TITLES);
   if (method === 'typo')    return injectTypo(rnd(DEFAULT_TITLES).split(' ')[0]);

   return rnd([ () => randDigits(4), () => randDigits(3)+' '+randDigits(3), () => '0'+randDigits(3), () => randChars(2)+randDigits(4) ])();
 }

 function getPageContext() {
   const urlParams = new URLSearchParams(window.location.search);
   if (urlParams.has('search_query')) {
     let q = decodeURIComponent(urlParams.get('search_query'));
     q = q.replace(/after:\S+/g, '').replace(/before:\S+/g, '');
     q = q.replace(/".3gp"|".mts"|".avi"|".vob"/g, '');
     CAMERA_PREFIXES.forEach(p => { q = q.replace(new RegExp(p + '\\d+', 'g'), ''); });
     return q.replace(/["']/g, '').trim() || "untitled";
   } else {
     let title = document.title.replace(/^\(\d+\)\s/, '').replace(' - YouTube', '');
     let words = title.split(' ').filter(w => w.length > 3);
     if (words.length === 0) return "untitled";
     return words.slice(0, 3).join(' ').replace(/["']/g, '');
   }
 }

 function contextualVoidQuery(baseText) {
   const safeS = S || {};
   if (Math.random() < 0.85 || !baseText || baseText === "untitled") {
     return randomVoidQuery(safeS.singleChar);
   }

   if (safeS.customVocab && safeS.customVocab.length > 0 && Math.random() < 0.5) {
     const base = rnd(safeS.customVocab);
     const formattedBase = safeS.vocabQuotes === false ? base : `"${base}"`;
     return `${formattedBase} ${baseText}`;
   }

   const method = rnd(['append_raw', 'append_emoji', 'typo_base', 'quotes_only']);
   if (method === 'append_raw') return `"${baseText}" ${rnd(CAMERA_PREFIXES)}${randDigits(2)}`;
   else if (method === 'append_emoji') return `"${baseText}" ${randEmoji(safeS.singleChar ? 1 : Math.floor(Math.random()*2)+1)}`;
   else if (method === 'typo_base') return baseText.split(' ').map(w => w.length > 4 ? injectTypo(w) : w).join(' ');
   else if (method === 'quotes_only') return `"${baseText}" ${randChars(2)}`;
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
   if (era === 'today')         return '&sp=EgIIAg%253D%253D';
   if (SORT_SP[sort])           return '&sp=' + SORT_SP[sort];
   return '';
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

 async function applyModifiers(query, safeS) {
   let w = query;
   w = await translateText(w, safeS.region || 'en-US');

   if (safeS.typo)  w = w.split(' ').map(t => t.length > 3 ? injectTypo(t) : t).join(' ');
   if (safeS.exact) w = `"${w}"`;
   if (safeS.defaultTitle) w += ' ' + rnd(DEFAULT_TITLES);
   if (safeS.entropy)      w += ' ' + randChars(3);
   
   if (safeS.applyEra !== false) {
     w += buildDateStr(safeS.era);
   }
   
   return w.replace(/\s+/g, ' ').trim();
 }

 // ── CARGA NATIVA DE AJUSTES (A PRUEBA DE FALLOS DE URLS) ──
 function loadExtensionData(callback) {
   if (typeof chrome === 'undefined' || !chrome.storage) return;
   
   chrome.storage.sync.get('undertube', data => {
     chrome.storage.local.get(['ut_custom_vocab'], localData => {
       S = data.undertube || { enabled: false };
       S.customVocab = localData.ut_custom_vocab || [];
       S.defaultLogoUrl = chrome.runtime.getURL('logo.png');
       S.archiveLogoUrl = chrome.runtime.getURL('logo_archive.png');
       S.imgFolderUrl = chrome.runtime.getURL('img/');
       
       if (callback) callback();
     });
   });
 }

 loadExtensionData(() => {
   if (!S.enabled) {
     restoreSearchBar(); restoreSidebar(); restoreHome(); removeInPageUI(); restoreLogo(); 
   } else {
     handlePage();
   }
 });

 if (typeof chrome !== 'undefined' && chrome.storage) {
   chrome.storage.onChanged.addListener((changes, namespace) => {
     if (changes.undertube || changes.ut_custom_vocab) {
       loadExtensionData(() => handlePage());
     }
   });
 }

 let sidebarInjected = false;
 let pollInterval = null;

 hookNavigation();
 setTimeout(handlePage, 500);

 function isWatch() { return location.pathname === '/watch'; }
 function isHome() { return location.pathname === '/'; }

 function hookNavigation() {
   document.addEventListener('yt-navigate-start', async (e) => {
     const safeS = S || {};
     if (isWatch() && safeS.sidebarAutoRefresh) {
       const cards = document.getElementById('_ut_cards');
       if (cards) cards.replaceChildren();
       sidebarInjected = false;
     }

     if (isHome() && safeS.sidebarAutoRefresh) {
       const homeGrid = document.getElementById('_ut_home_cards');
       if (homeGrid) homeGrid.replaceChildren();
     }

     if (!safeS.enabled || !safeS.interceptSearch) return;

     let url = e.detail?.url || '';
     if (url.includes('/results?search_query=')) {
       if (url.includes('&ut=1')) return;

       const match = url.match(/search_query=([^&]+)/);
       let rawQuery = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
       if (!rawQuery) rawQuery = rnd(DEFAULT_TITLES);

       const modifiedQuery = await applyModifiers(rawQuery, safeS);
       const [lang, country] = (safeS.region || 'en-US').split('-');
       
       const spStr = safeS.tempSp ? `&sp=${safeS.tempSp}` : buildSP(safeS.era, safeS.sort, safeS.live);
       if(S) S.tempSp = null;

       const finalUrl = `/results?search_query=${encodeURIComponent(modifiedQuery)}&hl=${lang}&gl=${country}${spStr}&ut=1`;

       try { e.detail.url = finalUrl; } catch(err) {}

       setTimeout(() => {
         if (!location.href.includes('ut=1')) { location.href = finalUrl; }
         const input = document.querySelector('ytd-searchbox input, input#search, .ytSearchboxComponentInputBox');
         if (input) input.value = modifiedQuery;
       }, 50);
     }
   });

   document.addEventListener('yt-navigate-finish', () => { setTimeout(handlePage, 200); });
   if (!pollInterval) { pollInterval = setInterval(handlePage, 1000); }
 }

 function handlePage() {
   if (!S || !S.enabled || !S.defaultLogoUrl) return; 
   styleSearchBar();
   styleLogo();
   injectInPageUI();

   if (isWatch() && S.replaceSidebar) setupSidebar();
   else if (!isWatch() || !S.replaceSidebar) restoreSidebar();

   if (isHome() && S.replaceHome) setupHome();
   else if (!isHome() || !S.replaceHome) restoreHome();
 }

 function styleLogo() {
   const mastheadStart = document.querySelector('ytd-masthead #start');
   const nativeLogoContainer = document.querySelector('ytd-topbar-logo-renderer');
   if (!mastheadStart || !nativeLogoContainer) return;

   let customContainer = document.getElementById('_ut_logo_container');

   if (S && S.replaceLogo && S.enabled) {
     nativeLogoContainer.style.display = 'none';

     if (!customContainer) {
       customContainer = document.createElement('a');
       customContainer.id = '_ut_logo_container';
       customContainer.href = '/';
       customContainer.title = 'Undertuber Home';
       customContainer.style.cssText = 'display: flex; align-items: center; justify-content: flex-start; padding: 0 16px 0 0; height: 56px; text-decoration: none;';

       const customImg = document.createElement('img');
       customImg.id = '_ut_logo_img';
       customImg.style.cssText = 'max-height: 35px; width: auto; max-width: 250px; object-fit: contain; display: block;';
       customImg.src = S.defaultLogoUrl;
       
       customImg.onerror = () => { customImg.style.display = 'none'; }; 

       customContainer.appendChild(customImg);
       mastheadStart.insertBefore(customContainer, nativeLogoContainer);
     } else {
       const imgEl = customContainer.querySelector('#_ut_logo_img');
       if (imgEl && imgEl.src !== S.defaultLogoUrl) {
           imgEl.src = S.defaultLogoUrl;
           imgEl.style.display = 'block';
       }
     }
     customContainer.style.display = 'flex';
   } else {
     restoreLogo();
   }
 }

 function restoreLogo() {
   const nativeLogoContainer = document.querySelector('ytd-topbar-logo-renderer');
   if (nativeLogoContainer) nativeLogoContainer.style.display = '';
   const customContainer = document.getElementById('_ut_logo_container');
   if (customContainer) customContainer.style.display = 'none';
 }

 function injectInPageUI() {
   if (!S.interceptSearch) { removeInPageUI(); return; }
   if (document.getElementById('_ut_search_btn_wrapper')) return;

   const searchForm = document.querySelector('ytd-searchbox #search-form, .ytSearchboxComponentSearchForm, ytd-searchbox');
   if (!searchForm) return;

   searchForm.style.position = 'relative';

   const container = document.createElement('div');
   container.id = '_ut_search_btn_wrapper';
   container.style.cssText = 'position:relative; display:flex; align-items:center; z-index:99; margin-right: 8px;';

   const btn = document.createElement('div');
   btn.id = '_ut_search_btn';
   btn.textContent = 'UT';
   btn.title = 'Undertuber Search Modifiers';
   btn.style.cssText = 'background:#1a0000; color:#ff3333; border:1px solid #ff3333; cursor:pointer; padding:6px 10px; font-family:monospace; font-size:12px; font-weight:bold; border-radius:4px; transition:background 0.2s; user-select:none; height:max-content; margin-left:8px;';

   btn.onmouseenter = () => btn.style.background = '#3a0000';
   btn.onmouseleave = () => btn.style.background = '#1a0000';

   const dropdown = document.createElement('div');
   dropdown.id = '_ut_search_dropdown';
   dropdown.style.cssText = 'display:none; position:absolute; top:calc(100% + 10px); left:0; width:280px; background:#0e0e0e; border:1px solid #ff3333; padding:12px; box-shadow:0 10px 30px rgba(0,0,0,0.9); flex-direction:column; gap:8px; font-family:monospace; font-size:11px; color:#e0e0e0; text-align:left; border-radius: 4px;';

   const titleEl = document.createElement('div');
   titleEl.style.cssText = 'color:#ff3333; font-weight:bold; margin-bottom:4px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #333; padding-bottom:6px;';
   titleEl.textContent = 'Undertuber Modifiers';
   dropdown.appendChild(titleEl);

   const makeDropdownRow = (labelText, key, inputType, options) => {
     const row = document.createElement('label');
     row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:4px 0;';
     const span = document.createElement('span');
     span.style.color = '#aaa';
     span.textContent = labelText;
     row.appendChild(span);

     let input;
     if (inputType === 'select') {
       input = document.createElement('select');
       input.id = '_ut_in_' + key;
       input.style.cssText = 'background:#000; color:#fff; border:1px solid #333; padding:2px; max-width:140px; font-family:monospace; outline:none;';
       options.forEach(opt => {
         const o = document.createElement('option');
         if (opt.val === '') { o.disabled = true; }
         else { o.value = opt.val; }
         o.textContent = opt.txt;
         input.appendChild(o);
       });
       input.value = S[key] || 'any';
     } else {
       input = document.createElement('input');
       input.type = 'checkbox';
       input.id = '_ut_in_' + key;
       input.className = '_ut_in_sw';
       input.checked = !!S[key];
     }

     input.onchange = () => {
       if (inputType === 'select') S[key] = input.value;
       else S[key] = input.checked;
       try { chrome.storage.sync.set({ undertube: S }); } catch(err){}
     };
     
     // Bloquear propagación en los inputs para que YT no los intercepte
     input.addEventListener('click', e => e.stopPropagation());
     input.addEventListener('mousedown', e => e.stopPropagation());
     
     row.appendChild(input);
     dropdown.appendChild(row);
   };

   let eraOpts = [
     {val:'any', txt:'Any Era'}, {val:'today', txt:'Last 24h'}, {val:'random', txt:'Random Year'},
     {val:'', txt:'── Eras ──'},
     {val:'2005-2009', txt:'2005-09'}, {val:'2010-2013', txt:'2010-13'},
     {val:'2014-2016', txt:'2014-16'}, {val:'2017-2019', txt:'2017-19'}, {val:'2020-2023', txt:'2020-23'},
     {val:'2024-2026', txt:'2024-26'},
     {val:'', txt:'── Years ──'}
   ];
   const currentYear = new Date().getFullYear();
   for(let i=2005; i<=currentYear; i++) {
     eraOpts.push({val: i.toString(), txt: i.toString()});
   }

   const langOpts = [
     {val:'en-US', txt:'English'}, {val:'es-MX', txt:'Spanish'},
     {val:'pt-BR', txt:'Portuguese'}, {val:'ru-RU', txt:'Russian'},
     {val:'ja-JP', txt:'Japanese'}, {val:'ko-KR', txt:'Korean'},
     {val:'zh-TW', txt:'Chinese (Trad)'}, {val:'ar-SA', txt:'Arabic'},
     {val:'hi-IN', txt:'Hindi'}, {val:'th-TH', txt:'Thai'},
     {val:'vi-VN', txt:'Vietnamese'}, {val:'el-GR', txt:'Greek'},
     {val:'he-IL', txt:'Hebrew'}, {val:'uk-UA', txt:'Ukrainian'},
     {val:'fa-IR', txt:'Persian'}, {val:'ka-GE', txt:'Georgian'},
     {val:'am-ET', txt:'Amharic'}, {val:'mn-MN', txt:'Mongolian'}
   ];

   makeDropdownRow('Language', 'region', 'select', langOpts);
   makeDropdownRow('Upload Era', 'era', 'select', eraOpts);
   makeDropdownRow('Apply Era Filter', 'applyEra', 'checkbox');
   makeDropdownRow('Exact Match', 'exact', 'checkbox');
   makeDropdownRow('Entropy', 'entropy', 'checkbox');

   // ── SOLUCIÓN DE SEGURIDAD PARA EL DESPLEGABLE ──
   // Evita que los clics internos cierren el menú
   dropdown.addEventListener('click', (e) => e.stopPropagation());
   dropdown.addEventListener('mousedown', (e) => e.stopPropagation());

   btn.addEventListener('click', (e) => {
     e.preventDefault(); e.stopPropagation();
     dropdown.style.display = dropdown.style.display === 'none' ? 'flex' : 'none';
     if (dropdown.style.display === 'flex') syncInPageUI();
   });

   // Cierra el menú sólo si haces clic totalmente afuera
   document.addEventListener('click', (e) => {
     const path = e.composedPath();
     if (!path.includes(container)) {
       dropdown.style.display = 'none';
     }
   });

   container.appendChild(btn);
   container.appendChild(dropdown);
   searchForm.prepend(container);
 }

 function removeInPageUI() {
   const wrapper = document.getElementById('_ut_search_btn_wrapper');
   if (wrapper) wrapper.remove();
 }

 function syncInPageUI() {
   if (!S) return;
   const setCb = (id, key) => { const el = document.getElementById('_ut_in_' + id); if (el) el.checked = !!S[key]; };
   const setSel = (id, key) => { const el = document.getElementById('_ut_in_' + id); if (el && S[key]) el.value = S[key]; };

   setSel('era', 'era');
   setSel('region', 'region');
   setCb('applyEra', 'applyEra');
   setCb('exact', 'exact');
   setCb('entropy', 'entropy');
 }

 function styleSearchBar() {
   const input = document.querySelector('ytd-searchbox input, input#search, .ytSearchboxComponentInputBox');
   if (!input) return;

   if (S && S.interceptSearch) {
     input.placeholder = "[ UNDERTUBER ACTIVE ]";
     if (!document.getElementById('ut-search-styles')) {
       const style = document.createElement('style');
       style.id = 'ut-search-styles';
       style.textContent = `
       ytd-searchbox input, .ytSearchboxComponentInputBox { color: #ff3333 !important; font-family: monospace !important; }
       ytd-searchbox #container, .ytSearchboxComponentSearchForm { border: 1px solid #ff3333 !important; }
       ._ut_in_sw { appearance:none; width:28px; height:14px; background:#222; border-radius:14px; position:relative; cursor:pointer; outline:none; border:1px solid #444; transition:background 0.2s; }
       ._ut_in_sw::after { content:''; position:absolute; top:1px; left:1px; width:10px; height:10px; background:#666; border-radius:50%; transition:transform 0.2s, background 0.2s; }
       ._ut_in_sw:checked { background:#2a0000; border-color:#7a1515; }
       ._ut_in_sw:checked::after { transform:translateX(14px); background:#ff3333; }
       `;
       document.head.appendChild(style);
     }
   } else {
     restoreSearchBar();
   }
 }

 function restoreSearchBar() {
   const input = document.querySelector('ytd-searchbox input, input#search, .ytSearchboxComponentInputBox');
   if (input) input.placeholder = "Search";
   const style = document.getElementById('ut-search-styles');
   if (style) style.remove();
 }

 // ── SIDEBAR REPLACEMENT ───────────────────────────────
 function setupSidebar() {
   const nativeRelated = document.querySelector('#related');
   if (nativeRelated) nativeRelated.style.display = 'none';

   const secondaryInner = document.querySelector('#secondary-inner') || document.querySelector('#secondary');
   if (!secondaryInner) return;

   let utContainer = document.getElementById('_ut_sidebar');
   if (!utContainer) {
     utContainer = document.createElement('div');
     utContainer.id = '_ut_sidebar';
     utContainer.style.cssText = 'width:100%; margin-top:24px; margin-bottom:24px; display:flex; flex-direction:column; gap:12px;';

     const headerDiv = document.createElement('div');
     headerDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid #333;';

     const titleWrapper = document.createElement('div');
     titleWrapper.style.cssText = 'display:flex; align-items:center; gap:8px;';

     const archiveLogo = document.createElement('img');
     archiveLogo.className = 'ut-archive-logo';
     if(S && S.archiveLogoUrl) archiveLogo.src = S.archiveLogoUrl;
     archiveLogo.style.cssText = 'height:20px; width:auto; object-fit:contain; display:block;';
     archiveLogo.onerror = () => { archiveLogo.style.display = 'none'; };

     const span = document.createElement('span');
     span.style.cssText = 'color:#ff3333; font-family:monospace; font-size:14px; font-weight:bold; letter-spacing:2px; text-transform:uppercase;';
     span.textContent = 'UNDERTUBER RECOMMENDATIONS';

     titleWrapper.appendChild(archiveLogo);
     titleWrapper.appendChild(span);

     const refreshBtn = document.createElement('button');
     refreshBtn.id = '_ut_refresh_btn';
     refreshBtn.style.cssText = 'background:#1a0000; border:1px solid #ff3333; color:#ff3333; font-family:monospace; font-size:10px; cursor:pointer; padding:6px 10px; border-radius:2px; letter-spacing:1px; transition: background 0.2s;';
     refreshBtn.textContent = 'REFRESH VOID';

     headerDiv.appendChild(titleWrapper);
     headerDiv.appendChild(refreshBtn);

     const cardsContainer = document.createElement('div');
     cardsContainer.id = '_ut_cards';
     cardsContainer.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

     utContainer.appendChild(headerDiv);
     utContainer.appendChild(cardsContainer);
     secondaryInner.prepend(utContainer);

     refreshBtn.addEventListener('click', () => {
       refreshBtn.style.background = '#ff3333';
       refreshBtn.style.color = '#000';
       setTimeout(() => { refreshBtn.style.background = '#1a0000'; refreshBtn.style.color = '#ff3333'; }, 200);
       generateSidebarCards();
     });
   } else {
     const existingLogo = utContainer.querySelector('.ut-archive-logo');
     if (existingLogo && S && S.archiveLogoUrl && existingLogo.src !== S.archiveLogoUrl) {
         existingLogo.src = S.archiveLogoUrl;
         existingLogo.style.display = 'block';
     }
   }

   const cardsContainer = document.getElementById('_ut_cards');
   if (cardsContainer && cardsContainer.children.length === 0) {
     generateSidebarCards();
     sidebarInjected = true;
   }
 }

 function generateSidebarCards() {
   const cardsContainer = document.getElementById('_ut_cards');
   if (!cardsContainer) return;

   cardsContainer.replaceChildren();
   const contextText = getPageContext();

   for (let i = 0; i < 15; i++) {
     cardsContainer.appendChild(makeVoidCard(contextText, false));
   }
 }

 function restoreSidebar() {
   const nativeRelated = document.querySelector('#related');
   if (nativeRelated) nativeRelated.style.display = '';
   const utContainer = document.getElementById('_ut_sidebar');
   if (utContainer) utContainer.remove();
   sidebarInjected = false;
 }

 // ── HOME PAGE REPLACEMENT ───────────────────────────────
 function setupHome() {
   const nativeGrid = document.querySelector('ytd-rich-grid-renderer');
   if (nativeGrid) nativeGrid.style.display = 'none';

   const primary = document.querySelector('ytd-browse[page-subtype="home"] #primary');
   if (!primary) return;

   let utHome = document.getElementById('_ut_home_wrapper');
   if (!utHome) {
     utHome = document.createElement('div');
     utHome.id = '_ut_home_wrapper';
     utHome.style.cssText = 'width: 100%; padding: 24px; box-sizing: border-box;';

     const headerDiv = document.createElement('div');
     headerDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding-bottom:16px; border-bottom:1px solid #333; margin-bottom: 24px;';

     const titleWrapper = document.createElement('div');
     titleWrapper.style.cssText = 'display:flex; align-items:center; gap:12px;';

     const archiveLogo = document.createElement('img');
     archiveLogo.className = 'ut-archive-logo';
     if(S && S.archiveLogoUrl) archiveLogo.src = S.archiveLogoUrl;
     archiveLogo.style.cssText = 'height:28px; width:auto; object-fit:contain; display:block;';
     archiveLogo.onerror = () => { archiveLogo.style.display = 'none'; };

     const span = document.createElement('span');
     span.style.cssText = 'color:#ff3333; font-family:monospace; font-size:20px; font-weight:bold; letter-spacing:4px; text-transform: uppercase;';
     span.textContent = 'UNDERTUBER FEED';

     titleWrapper.appendChild(archiveLogo);
     titleWrapper.appendChild(span);

     const refreshBtn = document.createElement('button');
     refreshBtn.id = '_ut_home_refresh_btn';
     refreshBtn.style.cssText = 'background:#1a0000; border:1px solid #ff3333; color:#ff3333; font-family:monospace; font-size:12px; cursor:pointer; padding:8px 16px; border-radius:2px; letter-spacing:2px; font-weight: bold; transition: background 0.2s;';
     refreshBtn.textContent = 'GENERATE NEW CHAOS';

     headerDiv.appendChild(titleWrapper);
     headerDiv.appendChild(refreshBtn);

     const cardsContainer = document.createElement('div');
     cardsContainer.id = '_ut_home_cards';
     cardsContainer.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px; width:100%;';

     utHome.appendChild(headerDiv);
     utHome.appendChild(cardsContainer);

     if (nativeGrid) {
       nativeGrid.parentNode.insertBefore(utHome, nativeGrid);
     } else {
       primary.prepend(utHome);
     }

     refreshBtn.addEventListener('click', () => {
       refreshBtn.style.background = '#ff3333';
       refreshBtn.style.color = '#000';
       setTimeout(() => { refreshBtn.style.background = '#1a0000'; refreshBtn.style.color = '#ff3333'; }, 200);
       generateHomeCards();
     });

   } else {
     const existingLogo = utHome.querySelector('.ut-archive-logo');
     if (existingLogo && S && S.archiveLogoUrl && existingLogo.src !== S.archiveLogoUrl) {
         existingLogo.src = S.archiveLogoUrl;
         existingLogo.style.display = 'block';
     }
   }

   const cardsContainer = document.getElementById('_ut_home_cards');
   if (cardsContainer && cardsContainer.children.length === 0) {
     generateHomeCards();
   }
 }

 function generateHomeCards() {
   const cardsContainer = document.getElementById('_ut_home_cards');
   if (!cardsContainer) return;

   cardsContainer.replaceChildren();

   for (let i = 0; i < 24; i++) {
     cardsContainer.appendChild(makeVoidCard("", true));
   }
 }

 function restoreHome() {
   const nativeGrid = document.querySelector('ytd-rich-grid-renderer');
   if (nativeGrid) nativeGrid.style.display = '';
   const utHome = document.getElementById('_ut_home_wrapper');
   if (utHome) utHome.remove();
 }

 // ── DUAL CARD GENERATOR (BULLETPROOF FALLBACK SYSTEM) ─────────
 function makeVoidCard(contextText, isHome) {
   const safeS = S || {};
   const q = isHome ? randomVoidQuery(safeS.singleChar) : contextualVoidQuery(contextText);
   let dateStr = '';
   
   if (safeS.feedEraToggle !== false) {
     const eraToUse = (safeS.sidebarEra === 'any' || !safeS.sidebarEra) ? 'random' : safeS.sidebarEra;
     dateStr = buildDateStr(eraToUse);
   }

   const finalQ = (q + dateStr).replace(/\s+/g, ' ').trim();
   const sp = buildSP(safeS.sidebarEra, '', false);
   const url = `/results?search_query=${encodeURIComponent(finalQ)}${sp}&ut=1`;
   const hue = Math.floor(Math.random() * 360);
   const icons = ['📼','📡','🕳️','👾','📟','🔌','💾','🧿','👺','🌀','📻','🖥️'];

   const el = document.createElement('a');
   el.className = '_ut_card';
   el.href = url;

   const useLocalImage = safeS.imageThumbs && safeS.imgFolderUrl;
   const poolSize = parseInt(safeS.imagePool) || 200;

   const thumb = document.createElement('div');
   const pattern = document.createElement('div');
   const iconSpan = document.createElement('span');
   const textContainer = document.createElement('div');
   const title = document.createElement('div');

   if (isHome) {
     el.style.cssText = `display:flex; flex-direction:column; gap:12px; text-decoration:none; color:inherit; cursor:pointer; transition:transform 0.2s;`;
     el.onmouseenter = () => el.style.transform = 'scale(1.02)';
     el.onmouseleave = () => el.style.transform = 'scale(1)';

     thumb.style.cssText = `width:100%; aspect-ratio:16/9; border-radius:12px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.1); background:linear-gradient(135deg,hsl(${hue},20%,7%),hsl(${hue},10%,4%));`;
     iconSpan.style.cssText = 'font-size:48px; position:absolute; z-index:2; opacity:0.5;';
     
     textContainer.style.cssText = 'display:flex; flex-direction:column; gap:4px; padding:0 4px;';
     title.style.cssText = 'font-size:16px; color:#f1f1f1; line-height:1.4; font-family:monospace; word-break:break-all; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-weight:bold;';
   } else {
     el.style.cssText = `display:flex;gap:8px;padding:8px;text-decoration:none;color:inherit;border-radius:4px;cursor:pointer;transition:background 0.15s;box-sizing:border-box;width:100%;`;
     el.onmouseenter = () => el.style.background = 'rgba(255,255,255,0.05)';
     el.onmouseleave = () => el.style.background = 'transparent';

     thumb.style.cssText = `width:168px;min-width:168px;height:94px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,0.1); background:linear-gradient(135deg,hsl(${hue},20%,7%),hsl(${hue},10%,4%));`;
     iconSpan.style.cssText = 'font-size:26px;position:absolute; z-index:2; opacity:0.5;';

     textContainer.style.cssText = 'flex:1;min-width:0;padding-top:2px;';
     title.style.cssText = 'font-size:14px;color:#f1f1f1;line-height:1.4;font-family:monospace;word-break:break-all;margin-bottom:5px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;';
   }

   pattern.style.cssText = 'position:absolute; inset:0; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.2) 2px,rgba(0,0,0,0.2) 3px); z-index:3; pointer-events:none;';
   iconSpan.textContent = rnd(icons);

   if (useLocalImage) {
     const randImgNum = Math.floor(Math.random() * poolSize) + 1;
     const imgEl = document.createElement('img');
     imgEl.style.cssText = 'width:100%; height:100%; object-fit:cover; position:absolute; inset:0; z-index:1; display:block;';
     imgEl.src = `${safeS.imgFolderUrl}${randImgNum}.png`;
     
     iconSpan.style.display = 'none';

     imgEl.onerror = () => {
       imgEl.style.display = 'none';
       iconSpan.style.display = 'block'; 
     };

     thumb.appendChild(imgEl);
   }

   thumb.appendChild(iconSpan);
   thumb.appendChild(pattern);

   title.textContent = q;
   textContainer.appendChild(title);
   el.appendChild(thumb);
   el.appendChild(textContainer);

   return el;
 }

})();