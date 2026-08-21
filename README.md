# Browser UserScripts

A collection of user scripts for Greasemonkey that automate and enhance web browsing on popular Japanese e-commerce and social media sites. These scripts add useful features like bookmarks, point collection automation, URL translation, and site-specific enhancements.

## 📦 Features

### Shopping & Points Automation

- Booklog utilities - Edit dates and hide reviews on Booklog
- Honto tools - Add footmarks and gacha automation
- Rakuten Point automation - Lucky draws, janken games, point mall gacha, treasure bingo, omikuji
- Rakuten Card rewards - Auto click for card point bonuses
- Point tracking - Automatic point collection from various point systems

### Content Tools

- ISBN lookup - Convert ISBNs to URLs for booklog.jp, bookmeter.com, calil.jp, and hanmoto.com
- Structured data logging - Extract and log JSON-LD, Microdata, and RDFa Lite
- URL redirection - Smart redirects for Amazon and Pixiv
- URL replacement - Custom URL pattern matching and replacement

## 🛠️ Project Structure

```plaintext
src/
├── modules/                     # Reusable utility functions
│   ├── DocumentExtensions.js   # DOM manipulation helpers
│   ├── HtmlExtensions.js       # HTML utilities
│   ├── JsonExtensions.js       # JSON utilities
│   ├── NavigatorExtensions.js  # Navigator API extensions
│   └── WindowExtensions.js     # Window utility functions
└── scripts/                     # User scripts (Greasemonkey-compatible)
    ├── *.user.js                # Individual user scripts
dist/                               # Built user scripts (generated)
```

## 🚀 Development

### Prerequisites

- Node.js with npm
- Greasemonkey browser extension installed

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

This generates:

- `npm run build:gm` - Builds individual user scripts for Greasemonkey
- `npm run build:zip` - Creates a zip archive of all scripts

### Output

- `dist/`
  - - Built user scripts ready for Greasemonkey installation
- `bin/Greasemonkey.zip`
  - - Zip archive for bulk installation

## 📝 User Script Format

All scripts follow Greasemonkey's user script metadata format:

```javascript
// ==UserScript==
// @name         Script Name
// @namespace    https://github.com/takumi-kasahara
// @version      1.0
// @description  Brief description
// @author       takumi-kasahara
// @match        https://example.com/*
// @icon         data:image/gif;base64,...
// @grant        none
// ==/UserScript==
```

## ⚙️ Compatibility

- Target Environment: Latest Firefox with Greasemonkey
- JavaScript: Latest ECMAScript features
- Browser APIs: No deprecated APIs
- Target Sites: Japanese e-commerce (Booklog, Honto, Rakuten, Amazon, Pixiv)

## 📄 License

See [LICENSE](LICENSE)
