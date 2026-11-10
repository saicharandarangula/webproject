# TrackQR – QR-Based Inventory Tracker

A modern, responsive, QR-powered inventory and asset tracking web application built with HTML5, CSS3, and vanilla JavaScript. Features real camera QR code scanning, dynamic unique QR generation, asset lifecycle management, maintenance scheduling, activity audit logs, and customizable categories.

---

## 🚀 Quick Run Instructions

The frontend is completely self-contained with offline-ready libraries (`frontend/libs/qrcode.min.js` and `frontend/libs/html5-qrcode.min.js`) and CDN fallbacks.

### Option 1: Run with any local HTTP server (Recommended for Camera Access)
Modern browsers require a **secure context** (`https://` or `localhost` / `127.0.0.1`) to access the device webcam via `navigator.mediaDevices.getUserMedia`.

**Using Python:**
```bash
# In the project root:
cd frontend
python -m http.server 3000
```
Then open: **`http://localhost:3000`** in your browser.

**Using Node.js (npx serve or http-server):**
```bash
npx serve frontend -p 3000
```
Then open: **`http://localhost:3000`** in your browser.

**Using VS Code Live Server extension:**
- Right-click `frontend/index.html` and choose **"Open with Live Server"**.

---

### Option 2: Direct File Opening
- Double click or open `frontend/index.html` directly in your browser (`file:///.../frontend/index.html`).
- **All features work offline**, including:
  - Dashboard analytics & auto-updating counts
  - Asset CRUD (Add, Edit, Delete)
  - QR Code generation & live preview
  - High-resolution QR PNG download
  - Printable asset tags (`window.print()`)
  - QR Image file scanning (drag-and-drop or file upload)
  - Manual Asset ID lookup
  - Maintenance records & status sync
  - Activity audit logs & CSV export
  - Categories management
  - Settings, theme toggle, and JSON backup/restore
- *Note:* Browser security policies restrict live webcam access under `file://` URLs in some browsers. To use the live webcam feed, run via `localhost` (Option 1).

---

## 📁 Project Structure

```
qr_inventory_tracker/
├── frontend/
│   ├── index.html          # Semantic layout, 7 functional tab views, modals, SVG icons
│   ├── style.css           # SaaS design system, light/dark themes, scanner laser, print CSS
│   ├── script.js           # StorageService, QrController, ScannerController, App logic
│   └── libs/
│       ├── qrcode.min.js       # Local David Shim QRCode generator (offline-first)
│       └── html5-qrcode.min.js # Local Html5Qrcode camera & file scanner (offline-first)
└── README.md
```

---

## ✨ Features Implemented & Tested

| Feature | Description | Status |
| :--- | :--- | :---: |
| **Dashboard** | Total Assets, Available, In Use, Under Maintenance, Category distribution bars, recent activity, quick actions | Verified ✅ |
| **Inventory CRUD** | Add, edit, delete assets with validation and category-prefixed sequential IDs (e.g. `LAP-001`) | Verified ✅ |
| **Search & Filtering** | Real-time multi-attribute search (name, ID, serial, location), category filter, status filter, and sorting | Verified ✅ |
| **CSV Export** | Clean CSV export for inventory assets and activity logs with proper quote escaping | Verified ✅ |
| **QR Code Generation** | Real unique QR codes generated with QRCode.js encoding the Asset ID | Verified ✅ |
| **QR PNG Download** | High-resolution canvas PNG export (600x750) branded with Org name, Asset ID, Name, and QR | Verified ✅ |
| **Print Asset Tags** | Formatted sticker tag view optimized for label printers via `@media print` | Verified ✅ |
| **Camera QR Scanner** | Real camera stream via `Html5Qrcode`, camera selector, Start/Stop controls, duplicate cooldown | Verified ✅ |
| **Scanner Safeguards** | Scanner automatically stops when switching tabs to prevent background camera lock | Verified ✅ |
| **Scan Fallbacks** | QR image upload/dropzone decoder + manual Asset ID lookup with quick-paste sample tags | Verified ✅ |
| **Maintenance** | Work orders, scheduled/completed tracking, expense calculator, automatic asset status sync | Verified ✅ |
| **Activity Audit Logs** | Comprehensive audit trail of all asset modifications, scans, and system operations | Verified ✅ |
| **Category Management** | Custom category prefix definitions, descriptions, asset count tracking, and delete protection | Verified ✅ |
| **Settings & Data Backup** | Organization branding, currency, sound effects, JSON full backup export & restore, demo data reset | Verified ✅ |
| **Responsive UI & Themes** | Mobile drawer navigation, dark/light mode toggle, custom modals, and toast alerts | Verified ✅ |

---

## 🛠️ Preparing for Node.js & MongoDB Backend (Future Step)

The frontend is architected using a clean **Storage Service abstraction pattern** in `script.js`.
All CRUD operations flow through `StorageService`:
- `StorageService.getAssets()`
- `StorageService.saveAsset(data)`
- `StorageService.updateAssetStatus(id, status)`
- `StorageService.deleteAsset(id)`

When connecting a Node/Express backend with MongoDB later, you will simply replace the `localStorage` calls inside `StorageService` with standard asynchronous `fetch('/api/assets', ...)` API endpoints without rewriting the UI or QR controllers!
