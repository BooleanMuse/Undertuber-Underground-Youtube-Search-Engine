<div align="center">
  <!-- Reemplaza la ruta de abajo con tu logo principal -->
  <img src="logo.png" alt="Undertuber Logo" width="350"/>

  <p><em>The YouTube Underground Search Engine</em></p>
</div>

---


Undertuber is an extension and website I created to bypass the youtube constant algorithm videos (influencers and video essays, you know what I mean) and search cool underground videos on the platform.

This tool strips away algorithmic recommendations to uncover forgotten home videos, raw camera dumps, obscure test logs, and the truly weird side of the internet.

## Key Features

* **Search Bar Hijack:** Intercepts native YouTube searches and injects modifiers (dates, entropy, exact match) before the query is processed.
* **Feed & Sidebar Replacement:** Destroys YouTube's highly-curated homepage and related videos, replacing them with generative "Void Cards" that refresh with every click.
* **13 Button Generators:** One-click automated search queries designed to find specific types of obscure media.
* **Era Enforcement:** Force searches and feeds to only pull videos from specific timeframes (e.g., 2005-2009, 2010-2013).
* **Custom Vocabulary Integration:** Inject your own custom word lists with optional "Exact Quotes" enforcement to guide the void.
* **Local Image Pool:** Option to use up to 9,999 local images (`/img/1.png`, etc.) for feed thumbnails to maintain immersion, complete with an emoji-gradient fallback system.

---

## The Void Generators Buttons

Undertuber has 13 buttons to pull specific data structures from YouTube.

<div align="center">
  <!-- Reemplaza esta ruta con tu imagen de la cuadrícula de botones -->
  <img src="generators_preview.png" alt="Void Generator Buttons" width="400"/>
</div>

*  **Raw File:** `IMG_`, `MVI_`, `DSCN` followed by sequential digits.
*  **Unicode:** Random obscure unicode blocks to find untagged foreign media.
*  **Emoji:** Completely random emoji combinations.
*  **Default:** "Untitled video", "test", "my movie".
*  **Date:** Randomly generated past upload dates (`YYYYMMDD`, `MM/DD/YY`).
*  **Code:** Random Hex, Base64 strings, or memory addresses.
*  **Geo-Data:** Random GPS coordinates and Lat/Lon tags.
*  **Dead Tech:** Legacy formats and hardware (`.rmvb`, `Amiga 500`, `MiniDV`).
*  **Auto-Tag:** "Uploaded via Pixelpipe", "Sent from my BlackBerry".
*  **Test Logs:** "Audio sync test", "webcam test 00", "render test".
*  **Typo:** Generates deliberate misspellings of common words.
*  **Number:** Sequential and random 4-digit strings.
*  **Micro Ch.:** Targets extreme amateur channels ("personal vlog", "home lab").

---

##  Installation

Undertuber can be run directly inside YouTube via the Chrome Extension, or remotely via the Mobile-Friendly Website.

### Method 1: Chrome Extension (Desktop)
1. Download or clone this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** in the top right corner.
4. Click **"Load unpacked"** and select the folder containing the extension files (`manifest.json`, `content.js`, etc.).
5. Open YouTube. Click the Undertuber (UT) icon in your browser toolbar to access the control panel.

### Method 2: Web Terminal (Mobile & Desktop)
1. Go to undertuber.neocities.org in any web browser.
2. Configure your modifiers, select a generator, and click **"OPEN IN YOUTUBE"**.
3. *Mobile Users:* Make sure the "Open in Mobile App" toggle is active to cast searches directly into the native YouTube app on iOS or Android.

---

##  Project Structure

* `manifest.json` - Chrome extension configuration (Manifest V3).
* `content.js` - The core engine. Runs natively in the YouTube DOM to handle UI injection, feed replacement, and event interception.
* `popup.html` & `popup.js` - The extension control panel.
* `index.html` - The standalone web app terminal.
* `/img/` - Folder for custom local thumbnails (e.g., `1.png`, `2.png`... up to the limit set in the UI).

---

##  Privacy & Execution

Undertuber runs **100% locally**. There are no external servers, no tracking, and no data collection. All custom vocabulary lists and settings are stored locally in your browser's memory (`chrome.storage.local`). The application interacts strictly with YouTube's public search URL parameters.
