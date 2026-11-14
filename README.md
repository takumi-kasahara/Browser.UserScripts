# Browser UserScripts

A collection of user scripts for [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) that automate and enhance web browsing.

## 🛠️ Project Structure

```plaintext
src/
├── modules/  # Reusable utility functions
└── scripts/  # User scripts
dist/            # Built user scripts (generated)
pages/           # Installation and distribution pages
```

## 📝 Installation

1. Direct installation
   - Copy the JavaScript content and paste into Greasemonkey
2. Repository from [Installation page](./index.html)

## 🚀 Development

```bash
npm install
```

### Build

```bash
npm run build
```

### Output

- `dist/`
  - Built user scripts ready for Greasemonkey installation
- `bin/Greasemonkey.zip`
  - Zip archive for bulk installation
- `pages/UserScripts.html`
  - Installation page with download links to each user script

## ⚙️ Compatibility

- Target Environment: Latest Firefox with Greasemonkey
- JavaScript: Latest ECMAScript features
- Browser APIs: No deprecated APIs
- Target Sites: Japanese e-commerce (Booklog, Honto, Rakuten, Amazon, Pixiv)

## 📄 License

See [LICENSE](LICENSE)
