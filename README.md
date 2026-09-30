# Browser UserScripts

A collection of user scripts for Greasemonkey that automate and enhance web browsing on popular Japanese e-commerce and social media sites. These scripts add useful features like bookmarks, point collection automation, URL translation, and site-specific enhancements.

## 🛠️ Project Structure

```plaintext
src/
├── modules/  # Reusable utility functions
└── scripts/  # User scripts (Greasemonkey-compatible)
dist/            # Built user scripts (generated)
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
  - Built user scripts ready for Greasemonkey installation
- `bin/Greasemonkey.zip`
  - Zip archive for bulk installation

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
