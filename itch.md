# itch.io 部署 SOP — Silent Koel

> 本文記錄將 ESM 模組化 HTML5 遊戲部署到 itch.io 的完整流程與踩坑紀錄。
> 適用對象：Claude Chat / Claude Code 參考用。

---

## 背景：為什麼需要 Vite 打包

本遊戲使用 ESM 全模組化（`type="module"` + 30+ 個 import），在 Vercel 正常運作。
但上傳 itch.io 後，**itch.io CDN 對子目錄的 JS 模組請求回傳 403**（缺少 CORS headers），
導致遊戲完全無法啟動。

**根本原因**：itch.io 的 CDN（`html-classic.itch.zone`）不允許 ES module import 從子目錄載入檔案。
`main.js` 在根目錄可以載入，但 `import './systems/gameState.js'` 等子目錄 import 全部 403。

**解法**：用 Vite 打包成單一 `index.js`，消除所有 runtime import。

---

## itch.io CDN 已知限制（踩坑記錄）

| 問題 | 症狀 | 解法 |
|------|------|------|
| ESM 子目錄 import | 所有 `systems/`、`config/`、`map/` 的 JS 全部 403 | Vite 打包成單一 bundle |
| 目錄名含空格 | `Sound MP3/`、`New sound/` 下的所有 mp3 全部 403 | 改名為 `sounds/`、`new/`（無空格）|
| `assets/` 子目錄 | bundle 輸出到 `assets/index-xxx.js` 也 403 | Rollup output 設為根目錄 `index.js` |

**結論：itch.io 對子目錄路徑有嚴格限制，所有資源應盡量放根目錄或簡單無空格的子目錄。**

---

## 部署流程

### 前置（只需一次）

已設定完畢，專案根目錄有：
- `vite.config.js` — Vite 設定
- `scripts/pack-itch.js` — 打包腳本

### 每次發布步驟

```bash
# 1. 在 VS Code 終端機執行：
npm run build:itch

# 2. 產出 silent-koel-itch.zip（根目錄）
# 3. 到 itch.io > Edit game > Uploads > 上傳該 zip
# 4. 勾選 "This file will be played in the browser"
# 5. 設定 Frame size：1600 x 900（或更小的縮放尺寸）
# 6. Save
```

### zip 內容結構（正確的）

```
silent-koel-itch.zip
├── index.html       ← 遊戲 HTML
├── index.js         ← 所有 JS 合併 bundle（Vite 產出）
└── sounds/          ← 音效資料夾（無空格路徑）
    ├── *.mp3
    └── new/
        └── *.mp3
```

---

## Vite 設定說明

```js
// vite.config.js
export default defineConfig({
  base: './',                    // itch.io 需要相對路徑，不能是 /
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: '[name].js',   // 輸出到根目錄（非 assets/）
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    assetsInlineLimit: 0,             // 不把音效 inline 成 base64
  },
  publicDir: false,                   // 音效由 pack-itch.js 手動複製
});
```

---

## 音效資料夾規則

- 資料夾和檔案名稱**不能有空格**，否則 itch.io CDN 回傳 403
- 本專案路徑：`sounds/` 和 `sounds/new/`（對應 `config/gameConfig.js` 的 `AUDIO_FILES`）
- Vercel 部署同樣使用這個路徑，兩個平台共用一份路徑設定

---

## 兩個部署管道（互不干擾）

| 管道 | 指令 | 用途 |
|------|------|------|
| Vercel | `git push origin master` | 開發測試、分享給玩家測試 |
| itch.io | `npm run build:itch` 後上傳 zip | 正式上架 |

Vercel serve 根目錄原始碼（ESM 直接運作），不受 Vite build 影響。
`dist/` 只是 Vite 輸出，不會被推到 Vercel。

---

## 常見問題排查

**Q: build:itch 後遊戲跑不起來（空白畫面）**
- 開 DevTools console 看 403 的是什麼路徑
- 如果是 `sounds/xxx.mp3` → 確認 zip 內有 `sounds/` 資料夾
- 如果是 `index.js` → 確認 zip 根目錄有 `index.js`

**Q: 有聲音但某些音效 403**
- 檢查 `sounds/` 下的檔案名稱是否有空格
- 若有空格，需同步改名 + 更新 `config/gameConfig.js`

**Q: Vercel 正常但 itch.io 沒聲音**
- itch.io 對空格目錄名 403，Vercel 不受影響
- 確認 `sounds/` 目錄名無空格

**Q: zip 打包失敗（PowerShell 檔案鎖定錯誤）**
- `pack-itch.js` 使用 `archiver` 套件（Node.js 原生）
- 不要改回 PowerShell Compress-Archive，Windows 媒體索引服務會鎖定 mp3 檔案

---

*最後更新：v0.1.15.1 / 2026-06-13*
