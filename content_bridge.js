// ── UNDERTUBER BRIDGE — runs in ISOLATED world ─────────────────────────────────

function sendSettings(s) {
  window.dispatchEvent(new CustomEvent('__ut_settings', { detail: s || {} }));
}

function loadAndSend() {
  if (!chrome.runtime?.id) return;

  try {
    chrome.storage.sync.get('undertube', d => {
      if (!chrome.runtime?.id) return;

      chrome.storage.local.get(['ut_custom_vocab'], l => {
        const s = d.undertube || {};
        s.customVocab = l.ut_custom_vocab || [];
        s.defaultLogoUrl = chrome.runtime.getURL('logo.png');
        s.archiveLogoUrl = chrome.runtime.getURL('logo_archive.png');
        s.imgFolderUrl = chrome.runtime.getURL('img/');
        sendSettings(s);
      });
    });
  } catch (err) {
    console.warn("Undertuber: Context invalidated. Please refresh the page.");
  }
}

if (chrome.runtime?.id) {
  loadAndSend();
}

if (chrome.runtime?.id) {
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'SETTINGS_UPDATED') {
      loadAndSend();
    }
  });
}

window.addEventListener('__ut_save_settings', e => {
  if (!chrome.runtime?.id) {
    console.warn("Undertuber: Cannot save. Extension was reloaded. Please refresh the YouTube tab.");
    return;
  }

  const s = { ...e.detail };
  delete s.customVocab;
  delete s.defaultLogoUrl;
  delete s.archiveLogoUrl;
  delete s.imgFolderUrl;

  try {
    chrome.storage.sync.set({ undertube: s });
  } catch (err) {
    console.warn("Undertuber: Error saving settings.", err);
  }
});
