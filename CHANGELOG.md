# CHANGELOG — 只吃不叫的噪鵑

---

## v0.24.2 - 2026-05-17

### 修復
- **小地圖日月圖示四角顏色異常**（`systems/ui.js`）：移除 `_drawSunMoonIndicator()` 中對整個 24×24 畫布的 `rgba(0,0,0,0.7)` 背景填色；圓形圖示以外的四角現在保持透明，由父容器 `#minimap-info` 的背景自然穿透，消除雙層疊加導致四角顏色偏暗的問題

---

## v0.24.1 - 2026-05-17

### 修復
- **手機小地圖縮小至 200×200**（`systems/ui.js`）：新增 `_mmSize()` 回傳 `isMobile ? 200 : 300`；`drawMinimap()` 每幀比對並動態調整 `minimapCanvas.width/height`；`_drawMinimapFog()` 的暫存畫布 RC 改為 `mm+30`，最終 drawImage 輸出至 mm×mm；`_drawMinimapEntities()` scale 改為 `mm/MAP_WIDTH`（手機 1/40，桌機 1/26.7）；`#minimap-info` 資訊列寬度跟隨 canvas 自動縮小；桌機維持 300×300 不受影響
- **設定按鈕每幀重建 DOM 導致 click 失效**（`systems/ui.js`）：左上角 UI 改為 `_initTopLeftUI()` 一次建立穩定結構，`addEventListener` 綁定設定按鈕，`updateUI()` 僅更新 `#tl-xp-text`、`#tl-xp-bar` 數值及 hearts canvas

---

## v0.24.0 - 2026-05-17

### 新增
- **心形血量 UI**（`systems/ui.js`）：移除 HP 數字，改以心形 Canvas 顯示；每顆心代表 20HP，填充比例 `clamp((hp - i*20)/20, 0, 1)`，紅色從左側填充，空心部分黑色半透明；最多 10 顆一行，超過換行；`_heartPath()` 用 Bezier 曲線繪製 24×24 心形
- **左上角 UI 重構**（`systems/ui.js`、`index.html`）：改為 `inline-flex` 縱向容器；第一行並排 ⚙️ 按鈕、🐦 圖示（28px）、Lv/XP 文字＋進度條；第二行心形血條；整體包覆 `rgba(0,0,0,0.6)` 半透明背景；XP 進度條寬度自動跟隨心條寬度（`width:100%`）
- **⚙️ 設定按鈕**（`systems/ui.js`）：嵌入左上角 UI，`pointer-events:all` 穿透 overlay，點擊觸發 `showSettings()`；電腦版 Esc 鍵維持原有開啟邏輯（`systems/input.js`）
- **直向手機 1000×900 邏輯解析度**（`systems/ui.js`、`systems/map.js`）：直向模式下 canvas 及容器改為 1000×900，`scale = vw/1000` 填滿螢幕寬度；`VIEW_W/VIEW_H` 由 `const` 改為 `let`，`_setViewSize()` 統一管理；橫向/桌機維持 1600×900 不受影響；camera 邊界自動更新（VIEW_W×0.25 = 250px），直向提示條停用
- **橫向手機攻擊區和搖桿精確化**（`systems/ui.js`）：攻擊區縮至左側 30%（水平）× 中間 60%（垂直，20%~80%）；搖桿區縮至右側 30% × 中間 60%；搖桿底環固定顯示於右側中央（`vw×0.85, vh×0.5`），啟動後 base 鎖定中央、knob 隨觸點偏移；⚔️ 提示移至攻擊區正中央

---

## v0.23.0 - 2026-05-17

### 新增
- **手機觸控支援系統**（`systems/ui.js`、`systems/gameState.js`、`systems/player.js`、`index.html`）：
  - **裝置偵測**：`detectMobile()`（ontouchstart 或 vw ≤ 768）、`getOrientation()`、`applyDeviceMode()`
  - **設定介面「裝置模式」區塊**：三顆按鈕（自動偵測 / 📱 手機模式 / 🖥️ 電腦模式），即時套用並存入 `localStorage`
  - **畫面自動縮放**：`_applyMobileScale()` 用 `CSS transform: scale()` 縮放 `#game-container`，橫向填滿寬度，豎向保留下方 40% 給操控區，不改變遊戲內部座標
  - **方向提示條**：豎向手機時在頂部顯示黃色可關閉提示條，旋轉橫向後自動隱藏
  - **虛擬搖桿**：右半螢幕（橫向）或右半下 40%（豎向），外圈 60px／內圈 25px，浮動式，`mobileInput.dx/dy` 驅動玩家移動
  - **攻擊區域**：橫向為左半螢幕整區（⚔️ opacity 0.2 提示），豎向為左半下 40% 中央圓形按鈕（⚔️，r=40px），tap 觸發 `playerAttack()`，沿用既有冷卻邏輯
  - `viewport` meta 標籤防止手機瀏覽器自動縮放

### 修復
- **手機模式全螢幕綠色遮罩**：`canvas { background-color }` 改為 `#gameCanvas { background-color: #549954 }`，避免 `#joystick-canvas` 繼承綠色蓋住所有 overlay

---

## v0.22.0 - 2026-05-17

### 新增
- **小地圖 UI 系統**（`systems/ui.js`、`index.html`）：
  - **地形底圖**：將 400×400 `terrainMap` 預渲染為離屏 canvas，縮放至 300×300 顯示，種子不變時快取復用
  - **太陽月亮指示器**（`sunmoonCanvas` 24×24）：依日夜週期進度繪製球體旋轉動畫（橢圓邊界算法），與時間並排於小地圖資訊列右側
  - **迷霧系統**（`_drawMinimapFog`）：400×400 `fogMap` 布林陣列驅動，每幀清除 camera 視野對應格（含環形包裝）；採用 330×330 超尺寸暫存畫布解決 blur kernel 邊緣稀釋問題，最終裁切中央 300×300 輸出；白天疊加雲霧材質（70 個固定種子徑向漸層圓，`source-atop` 合成）
  - **生物與玩家標記**（`_drawMinimapEntities`）：玩家白/綠閃爍點（永遠顯示）、中立生物橘點、敵意生物紅點、精英怪金點、Boss 深紅帶橘描邊（後四者僅在已揭開迷霧區域顯示）
  - 移除舊版右上角文字 UI（時間、日夜、地形標示），整合至 `#minimap-info` 資訊列

---

## v0.21.0 - 2026-05-16

### 修復
- **地圖邊界地形不連續**（`systems/map.js`）：
  - `labelBiomeRegions` flood fill 改為環形：`nr/nc` 改用模運算（`% gridH / % gridW`）取代邊界排除，使上下左右邊界的同生態格正確連通成同一 region
  - `mergeSmallRegions` 鄰接圖建立改為環形：以 `ADJ_DIRS` 四方向 + 模運算取代只往右往下的雙向掃描，確保左右邊界/上下邊界的不同 region 正確建立鄰接關係
  - `buildTerrainCanvas` 邊界白線改為環形：以 `(gx+1)%cols`、`(gy+1)%rows` 取代 `gx+1 < cols`、`gy+1 < rows`，使最後一欄/最後一列與第一欄/第一列在地形不同時也能畫出邊界線

---

## v0.20.0 - 2026-05-16

### 新增
- **地形生成規則文件**（`map/map.md`）：新增地形生成規則三條（Tileable Noise、MIN_BIOME_TILES 同化算法、REQUIRED_BIOMES 完整性）、保護區規則、變量位置規範
- **4D Tileable Noise**（`systems/map.js`）：
  - `_SimplexNoise` 新增 `grad4`（32個4D梯度向量）、`dot4`、`noise4d`、`tileableNoise`
  - `tileableNoise(perm, x, y, W, H)`：把格子座標投影到 4D 圓柱面（cos/sin），使地圖左右、上下邊界 Noise 值完全連續
  - `generateTerrain()` 改用 `tileableNoise` 取代原本 `noise2d`
- **孤島同化算法**（`systems/map.js`）：
  - `MAP_RULES = { MIN_BIOME_TILES: 250 }`：全域預設最小生態格數
  - `labelBiomeRegions(terrainMap, gridW, gridH)`：flood fill（DFS + stack），回傳 `regionId` 二維陣列和 `regions` 陣列，每個 region 含 `{ id, biome, cells, size, minRow, minCol }`
  - `mergeSmallRegions(terrainMap, gridW, gridH, minTiles)`：建立鄰接圖後逐一同化 `size < minTiles` 的孤島，valid 選項選最小、tie 選最靠左上；無 valid 時合併最大相鄰孤島後重新判斷
  - `ensureRequiredBiomes(terrainMap, gridW, gridH, requiredBiomes)`：確認所有必要生態存在，回傳 bool
- **`generateTerrain()` 完整流程更新**：Tileable Noise → 保護區 → `mergeSmallRegions` → `ensureRequiredBiomes`（最多 10 次新 seed 重試；超過則 minTiles/2 再試一次）
- **`map/easymap.js`**：`terrain` 區塊新增 `minBiomeTiles: 250` 和 `requiredBiomes: ['forest', 'ocean', 'desert']`

---

## v0.19.0 - 2026-05-16

### 新增
- **地圖系統重構**（`systems/map.js`）：
  - 從 `camera.js` 移入 `getBiome`、`getBgColor`；從 `spawning.js` 移入 `generateTrees`；從 `gameState.js` 移入 `MAP_WIDTH/HEIGHT/VIEW_W/VIEW_H`
  - 新增 `TILE_SIZE = 20`、`NOISE_SCALE = 0.003`、`BIOME_COLOR`
  - 新增純 JS Simplex Noise 實作（`_SimplexNoise.buildPerm` + `noise2d`，不依賴外部函式庫）
  - 新增 `generateTerrain()`：每局隨機 seed，生成 400×400 格 terrainMap（中心 400px 強制森林，noise > 0.2 森林，< -0.2 海洋，其餘沙漠）
  - 新增 `buildTerrainCanvas()`：把 terrainMap 預渲染至 8000×8000 離屏 Canvas，含地形邊界線（相鄰格不同時畫 2px 半透明白線）
  - 新增 `drawTerrain()`：支援地圖環繞的離屏 Canvas blit（最多 4 次 drawImage），夜晚疊加 `rgba(0,0,0,0.4)` 遮罩；取代原本 `getBgColor` 純色背景
  - `getBiome(x, y)` 改為讀取 `gameState.terrainMap`，未就緒時 fallback 舊公式
  - `generateTerrain()` 讀取 `gameState.currentMap.terrain` 參數，fallback 至常數預設值
- **`map/` 資料夾**：
  - `map/map.md`：地圖設計文件
  - `map/easymap.js`（`EASY_MAP`）：簡單難度配置（地形參數、生物倍率、精英怪 3 夜配置、Boss 預留結構）
- **難度與角色選擇介面**（`systems/ui.js`）：
  - 新增 `showMapSelect()`：點「開始遊戲」後顯示選擇頁，難度（簡單可選 / 普通困難地獄🔒）+ 角色（噪鵑可選 / 即將推出🔒）雙欄佈局，選中高亮金框，支援中英雙語
  - 選擇後 `gameState.currentMap = EASY_MAP`，回首頁按鈕恢復 `showStartScreen`
  - `showStartScreen` 的「開始遊戲」改為呼叫 `showMapSelect()`
- **語言鍵**（`zh-TW.js` / `en.js`）：新增 `selectTitle` / `difficultyLabel` / `characterLabel` / `diffEasy~Hell` / `charKoel` / `charSoon` / `btnBack` / `btnStart`
- **`gameState`**：新增 `currentMap: null`、`terrainMap: null`、`mapSeed: 0`

### 調整
- `systems/camera.js`：移除 `getBiome`、`getBgColor`（已移至 `map.js`）
- `systems/spawning.js`：移除 `generateTrees`（已移至 `map.js`）
- `systems/gameState.js`：移除 `MAP_WIDTH/HEIGHT/VIEW_W/VIEW_H`（已移至 `map.js`）
- `systems/ui.js`：`drawGame()` 背景改為 `drawTerrain()` 取代舊 `getBgColor` 填色

---

## v0.18.1 - 2026-05-16

### 文件
- **新增 `.claude/instructions.md`**：每次對話前自動讀取的開發規則，包含 MAIN.md / CHANGELOG.md / VERSION_RULES.md 讀取順序、必守開發規則（`gameLoop` 禁止字面 `\n`、模組化規範等）與修改完成後的固定流程
- **更新 `MAIN.md`**：
  - `systems/elite.js` 區塊移除 `drawEliteArrow`（已合併至 utils.js），新增備註說明
  - `systems/boss.js` 區塊移除 `drawBossArrow`（已合併至 utils.js），新增備註說明
  - 新增 `systems/utils.js` 完整函式說明區塊，含各函式參數與用途、繪製順序規範（名字→血條→本體，各層 4px 間距）

---

## v0.18.0 - 2026-05-16

### 新增
- **`systems/utils.js`**：新增 4 個共用繪圖工具函式，供精英怪與 Boss 系統共享
  - `drawArrow(px, py, targetWorldX, targetWorldY, color, playerRadius)`：統一箭頭繪製，距離固定為 `playerRadius + 20px`，每 0.5 秒在透明度 0.6↔1.0 之間閃爍
  - `drawHealthBar(sx, sy, hp, maxHp, width, fillColor, bgColor, height)`：血條繪製
  - `drawNameTag(sx, sy, name, color, font)`：名字標籤繪製
  - `drawGlowEffect(sx, sy, radius, fillColor, glowColor, glowBlur)`：帶光暈的圓形繪製

### 修復
- **精英怪繪製順序**（`systems/elite.js`）：修正顯示層次為「名字在上、血條在中、本體在下」，各層間距 4px；改用 `drawGlowEffect`、`drawHealthBar`、`drawNameTag`
- **精英怪箭頭優先權**（`systems/elite.js`）：當精英怪與 Boss 同時在螢幕外時，只顯示 Boss 箭頭；改用 `drawArrow`
- **箭頭距離統一**：精英怪與 Boss 箭頭距離統一為 `playerRadius + 20px`（原精英怪為固定偏移、原 Boss 為 `30px`）
- **`systems/boss.js`**：`drawBossArrow` 改用 `drawArrow`

---

## v0.17.0 - 2026-05-16

### 重構
- **完整模組化**：將 `index.html` 內嵌的 ~4000 行 JavaScript 全數拆分為 19 個獨立 JS 模組，index.html 精簡至純 HTML + CSS + `<script>` 標籤（205 行）
  - `config/`：`gameConfig.js` / `organs.js` / `creatures.js` / `evolution.js`（靜態資料常數）
  - `lang.js` + `lang/zh-TW.js` + `lang/en.js`（多語系）
  - `systems/`：`gameState` / `audio` / `camera` / `input` / `spawning` / `player` / `combat` / `organs` / `evolution` / `creatures` / `elite` / `boss` / `daynight` / `ui`（共 14 個系統模組）
  - `main.js`：`isGamePaused` / `gameLoop` / `initializeGame` / `window.onload`
- **新增 `MAIN.md`**：記錄完整模組架構、載入順序、跨模組依賴關係與重要設計注意事項

---

## v0.16.0 - 2026-05-15

### 新增
- **多語系系統**：新增繁體中文 / English 切換，所有 UI、器官、技能、進化、組合、Boss、精英、Guide 內容皆支援雙語
  - 新增 `lang.js` 獨立檔案，集中收納 `LANG_LIST`、`LANG` 字典與 `applyLanguage()`、`t(key, params?)` 工具；可外包給譯者直接編輯
  - `applyLanguage(lang)` 把當前語言寫回 `ORGANS / HIDDEN_ORGANS / SKILLS / EVOLUTION_PATHS / COMBOS / ELITE_CONFIG / BOSS_CONFIG`，既有 `.name`/`.desc` 讀取自動跟著切換
  - `t(key, params?)` 提供 UI 字串查找，支援 `{token}` 替換（如 `bossAppeared` 的 `{name}`、`rerollBtn` 的 `{n}`）
  - 缺鍵時自動 fallback 回 zh-TW，避免新增 key 卻忘記翻其他語言時整段空白
- **語言設定**：設定面板最上方新增「語言設定」區塊，提供「繁體中文 / English」按鈕；當前語言以金色高亮
  - 切換後即時刷新所有開啟中的介面（首頁 / 設定 / Guide / 技能樹），無需重整
  - 語言寫入 `gameSettings.language`，下次啟動自動載入
- **遊戲說明 (Guide) 介面**：首頁「📖 遊戲說明」按鈕進入，半透明黑色遮罩、3 頁分頁
  - 上方顯示「{cur} / {total}」頁碼與頁面副標題；左右箭頭切換頁面（首尾自動禁用）；底部「關閉」回首頁
  - 第 1 頁「基本操作」、第 2 頁「器官系統」、第 3 頁「進化系統」內容雙語

### 調整
- **首頁按鈕順序**：開始遊戲 → 技能樹 → 遊戲說明 → 設定（新增 Guide 入口）
- **`gameState`** 新增 `language` 欄位，預設 `zh-TW`；`DEFAULT_SETTINGS` 同步加入 `language`
- **`loadSettings()`** 載入語言並呼叫 `applyLanguage()`，確保資料表初始化即為使用者選的語言
- **`updateUI()` HUD 文字**改用 `t()`：時間、日夜狀態、地形、開發者統計
- **設定 / 技能樹 / 器官選擇 / 隱藏器官選擇 / 勝利 / 死亡 / 時間耗盡 / Day-Night 切換 / 精英 / Boss / 升級 / 重選 / Tooltip / HUD 器官框** 等所有可見文字全面改用 `t()` 與 `LANG` 字典
- **`_keyDisplay()`** 「滑鼠左鍵」改用 `t('mouseLeft')`，跟隨語言顯示

### 文件
- **`lang.js` 開頭加入翻譯外包說明**：步驟、{token} 規則、必須維持 key 結構、不可改動底部工具函式
- **`gameConfig.js` 開頭加入多語系說明**：資料表保留中文預設值，切換語言時由 `applyLanguage()` 覆寫

---

## v0.15.3 - 2026-05-14

### 修復
- **隱藏器官選完後遊戲卡死、未跳出排隊中的普通器官選擇**：v0.15.1 將 `showHiddenOrganSelection` 的 `closeOverlay` 改為在 `pending > 0` 時保留 `organSelectionActive = true` 並直接呼叫 `showOrganSelection()`，但 `showOrganSelection` 入口會檢查 `organSelectionActive`，看到 true 便再次 `pendingOrganSelections++` 並 return，導致 active=true 但無 overlay 而卡死。修正為先設 `organSelectionActive = false` 並重置 `lastTimeTick`，再呼叫 `showOrganSelection()` 開啟下一個 overlay（整段同步執行，無畫面幀空隙讓遊戲意外恢復跑）

---

## v0.15.2 - 2026-05-14

### 修復
- **精英擊殺時隱藏器官與升級選擇疊層**：`handleEliteKill` 原本先呼叫 `addXP()`，若此時觸發升級會直接開啟器官選擇畫面（`organSelectionActive` 此時為 false），再呼叫 `showHiddenOrganSelection()` 便造成兩個 overlay 同時存在、`pendingOrganSelections` 未正確遞增的問題。修正為：先計算並呼叫 `showHiddenOrganSelection()`（設 `organSelectionActive = true`），之後 `addXP()` 若觸發升級會正確走 `pendingOrganSelections++` 排隊，確保兩者依序顯示而非疊層

---

## v0.15.1 - 2026-05-14

### 修復
- **隱藏器官選擇後遊戲短暫恢復**：`showHiddenOrganSelection` 的 `closeOverlay` 原本先將 `organSelectionActive = false` 再檢查 `pendingOrganSelections`，導致有一幀空隙讓遊戲繼續運行。修正為：有 pending 時直接 `pendingOrganSelections--` 並呼叫 `showOrganSelection()`，保持 `organSelectionActive = true` 不中斷；無 pending 時才設 `organSelectionActive = false` 並重置 `lastTimeTick`

---

## v0.15.0 - 2026-05-14

### 新增
- **Tooltip 工具提示系統**：滑鼠移到器官/技能/進化選項上時，顯示半透明深色浮動提示框（`position:fixed`，跟隨滑鼠，靠近右邊界自動翻至左側）
  - **左下角 HUD 器官清單（canvas）**：透過 `_organHitRegions` 陣列每幀記錄各列範圍，canvas `mousemove` 命中後顯示器官名稱、當前等級/最大等級、基礎效果說明；隱藏器官標示「✨ 隱藏器官」；若已與組合搭擋同時裝備則顯示「⚡ 組合效果」；進化路線同樣顯示當前等級說明
  - **器官選擇畫面**：懸停普通器官/升級選項時顯示本次升級說明與組合效果提示；懸停進化路線時顯示該等級說明
  - **隱藏器官掉落選擇畫面**：懸停選項時顯示隱藏器官名稱與效果說明
  - **技能樹介面**：懸停技能卡片時顯示技能說明；懸停死亡後/首頁的器官保留卡片時顯示器官效果說明；懸停隱藏器官卡片時顯示金色「✨ 隱藏器官」標示
  - 關閉所有 overlay 時自動呼叫 `hideTooltip()` 防止殘留

---

## v0.14.1 - 2026-05-14

### 調整
- **首頁技能樹上局器官區塊**：由純參考顯示改為完整互動選擇介面；從 `lastRunOrgans` 載入上局器官，普通器官依 `organMemory` 技能等級限制可選數量，隱藏器官最多選1個；選中顯示金色高亮，即時寫入 `savedOrgans`/`savedHiddenOrgans`；標題改為「📦 選擇繼承上局器官（最多 N 個）」；首頁開啟技能樹時同步從 localStorage 載入正確的技能等級與技能點數
- **設定「重啟遊戲」保留器官記錄**：中途重啟前呼叫 `saveLastRunOrgans()` 存入 `lastRunOrgans`，並確保 `skillPoints` 已寫入 localStorage，防止中途結束損失記錄

---

## v0.14.0 - 2026-05-14

### 調整
- **首頁移除鍵盤進入**：首頁不再監聽 keydown 事件，只有點擊「▶ 開始遊戲」按鈕才能進入遊戲
- **首頁三按鈕選單**：「▶ 開始遊戲」、「🌿 技能樹」、「⚙️ 設定」由上到下排列

### 新增
- **首頁技能樹**：點擊「🌿 技能樹」呼叫 `buildSkillTreeOverlay(null, true)`；fromHome 模式下隱藏器官保留區塊、顯示「🌿 技能樹」標題、底部改為「關閉」按鈕（點擊後移除 overlay 回到首頁）；overlay z-index 210，疊在首頁之上；升級和重置按鈕透過 `_skillTreeFromHome` 全域旗標保留語境
- **首頁設定**：點擊「⚙️ 設定」呼叫 `showSettings(true)`；fromHome 模式下 overlay z-index 210，底部按鈕文字改為「關閉」（功能相同：儲存並關閉 overlay）；關閉後回到首頁

---

## v0.13.9 - 2026-05-14

### 新增
- **上局器官自動儲存**：玩家死亡或勝利時，透過 `saveLastRunOrgans()` 把本局所有普通器官（含等級）和隱藏器官存入 `localStorage.lastRunOrgans`；不受 `SAVE_VERSION` 清除影響，永久保留
- **技能樹「上局遺留器官」區塊**：技能樹介面最下方新增灰色純閱讀區塊，列出上局所有器官名稱與等級；無記錄時顯示「尚無記錄」
- **「🏠 回到首頁」+「⚔️ 再來一場」雙按鈕**：死亡技能樹和勝利畫面底部的「重新開始」均換成兩個並排按鈕；「回到首頁」返回起始畫面，「再來一場」透過 `sessionStorage` 標記後 reload 自動跳過首頁直接開始新一局

---

## v0.13.8 - 2026-05-14

### 調整
- **精英怪偵測範圍**：`aggroRange` 250 → 1000
- **Boss 全圖追擊**：三個 Boss 的 `aggroRange` 統一改為 `99999`（等同全地圖追擊），定義於 `gameConfig.js` 的 `BOSS_CONFIG`，新增 Boss 自動繼承

### 新增
- **Boss 方向箭頭**：Boss 不在視野時，玩家周圍 30px 處顯示指向 Boss 的閃爍箭頭（500ms 間隔 0.6↔1.0 透明度）；進入視野後自動消失。各 Boss 箭頭顏色沿用 `glowColor`：黑熊 `#8B4513`、大白鯊 `#1a3a5c`、沙漠蠍王 `#8B6914`

---

## v0.13.7 - 2026-05-14

### 修復
- **隱藏器官選擇後遊戲未暫停**：`showHiddenOrganSelection` 的 `closeOverlay` 補上 `pendingOrganSelections` 檢查——關閉隱藏器官畫面後若有待處理的升級選擇，立刻呼叫 `showOrganSelection()`（同步執行，不會有任何一幀讓遊戲繼續運行）

---

## v0.13.6 - 2026-05-14

### 調整
- **遊戲視窗放大**：畫布從 800×600 擴大至 1600×900；`#game-container` CSS、`<canvas>` 屬性、`gameState.canvasWidth/Height`、`VIEW_W/VIEW_H` 常數同步更新
- **視角觸發邊界更新**：水平邊界 25% = 400px，垂直邊界 25% = 225px（由 `VIEW_W/VIEW_H` 自動計算，無需手動修改 `updateCamera`）
- **相機初始位置更新**：`camera.x` 3600 → 3200（4000 - 1600/2），`camera.y` 3700 → 3550（4000 - 900/2），確保玩家出生於地圖正中央

---

## v0.13.5 - 2026-05-14

### 修復
- **Bug 1 — 設定介面開啟期間時間繼續倒數**：`hideSettings()` 關閉設定時重置 `gameState.lastTimeTick`，防止關閉後補算暫停期間的時間
- **Bug 2 — 按鍵重新綁定無反應**：完全重寫綁定系統：handler 以全域變數（`_settingsKeyHandler`、`_settingsMouseHandler`）儲存確保可清除；捕獲階段攔截 Esc 以取消綁定而非關閉設定；新增 350ms 閃爍動畫（`_rebindBlink`）；5 秒無操作自動取消（`_rebindTimeout`）；成功綁定播放確認音效
- **Bug 3 — 選擇畫面開啟時遊戲未完全暫停**：新增 `isGamePaused()` 統一暫停判斷，`gameLoop` 改用此函式；`showSkillTree()` 設定 `gameState.skillTreeOpen = true`，`showVictory()` 設定 `gameState.victory = true`，確保技能樹與勝利畫面開啟時遊戲邏輯完全停止

---

## v0.13.4 - 2026-05-14

### 新增
- **音效系統**：新增 `AudioManager` 物件，統一管理所有音效與背景音樂；音效檔案路徑定義於 `gameConfig.js` 的 `AUDIO_FILES` 常數
- **背景音樂**：白天/無精英怪夜晚播放 `Morning Theme`，精英怪夜晚與 Boss 出現後切換 `Boss Theme`，切換時淡出淡入 0.5 秒
- **Boss 出現前鈴聲**：距 Boss 出現約 5 秒前（timeRemaining ≤ 80）播放 `Boss_bell1.mp3`
- **音效觸發**：攻擊（普通/暴擊各自音效，多目標任一暴擊=暴擊音效）、受傷、死亡、升級、吃果子、勝利
- **設定介面**：按 `Esc` 開啟/關閉，遊戲暫停；半透明遮罩覆蓋畫面
  - **音量設定**：總音量、音樂音量、音效音量各有滑桿（0-100，步進10）與開關 Toggle，即時生效
  - **按鍵設定**：移動上/下/左/右、攻擊鍵各可點擊重新綁定（鍵盤或滑鼠左鍵），箭頭鍵/滑鼠左鍵為常駐備用
  - **其他設定**：重啟遊戲按鈕（確認對話框）、恢復原廠設定按鈕
  - **底部**：「儲存並返回」關閉介面繼續遊戲
- **設定持久化**：音量與按鍵設定存於 `localStorage.gameSettings`，不受 `SAVE_VERSION` 清除影響
- **按鍵系統**：移動按鍵改為讀取 `gameState.settings.keys`，支援使用者自訂主要按鍵

---

## v0.13.3 - 2026-05-12

### 調整
- **精英怪箭頭距離**：箭頭從玩家中心距離 20px → 50px；玩家半徑每超出基礎值（10）1px，箭頭距離額外 +1px，確保永遠顯示在玩家圓圈外側

### 新增
- **存檔版本號系統**：`GAME_INFO` 新增 `SAVE_VERSION: "1.0"`；遊戲啟動時比對 localStorage 存檔版本，版本不一致或不存在時自動清除所有存檔（`playerSkills`、`skillPoints`、`savedOrgans`、`savedHiddenOrgans`），並寫入當前版本號

---

## v0.13.2 - 2026-05-12

### 修復
- **Bug1 隱藏器官繼承改為主動選擇**：遊戲結束後不再自動繼承全部隱藏器官；技能樹介面新增「✨ 選擇保留一個隱藏器官（可不選）」區塊，玩家點擊選定 1 個或跳過；普通器官與隱藏器官各自獨立選擇

### 調整
- **相機觸發距離**：邊界觸發比例 20% → 25%，視角跟隨更積極
- **生物名稱顯示**：所有帶有 `name` 屬性的生物（含 Boss）在血條正上方以 12px 白色文字 + 黑色陰影顯示名稱
- **Boss 發光效果**：Boss 繪製改用 `shadowBlur` 閃爍發光，各地形 Boss 專屬發光顏色（黑熊 `#8B4513`、大白鯊 `#1a3a5c`、蠍王 `#8B6914`）；`BOSS_CONFIG` 新增 `glowColor` 欄位
- **體型與攻擊範圍 1:1 同步**：修正 `applyOrganEffects` 和 `applyHiddenOrganEffects` 的 `radiusAdd` 公式，改為先以舊半徑計算比例增量再加半徑，確保攻擊範圍與體型等比例增加
- **厚皮 Lv2/Lv3**：`radiusAdd` 由 1 改為 2（對應體型+20%），同時更新描述文字
- **強大的心臟**：移除 `attackRangeAdd: 5` 額外加成，攻擊範圍改由 `radiusAdd` 等比例公式計算；更新描述
- **強大的手臂**：移除 `attackRangeAdd: 5` 額外加成，攻擊範圍改由 `radiusAdd` 等比例公式計算；更新描述

---

## v0.13.1 - 2026-05-12

### 修復
- **Bug1 技能樹滾輪**：技能樹 overlay 加入 `wheel` 事件 `stopPropagation`，並改用 `overflow-y:scroll` 確保捲動不外溢至頁面
- **Bug2 幸運重選次數**：重選次數改為全局計數 `gameState.player.rerollsRemaining`，整場遊戲共用（而非每次選擇畫面重置）；次數耗盡後按鈕變灰不可點擊
- **Bug3 隱藏器官繼承顯示**：技能樹介面新增「✨ 以下隱藏器官將自動繼承」區塊，以金色邊框列出所有持有的隱藏器官，讓玩家看到繼承清單
- **Bug4 記憶器官保留數量**：移除保留數上限 `Math.min(3,…)`，Lv3 現可正確保留 4 個器官（0級=1個，1級=2個，2級=3個，3級=4個）；更新 `gameConfig.js` 說明文字

---

## v0.13.0 - 2026-05-12

### 修復
- **器官升級槽位計算**：`organSlotsUsed` 改為所有器官等級總和（Lv.3 佔3槽、Lv.2 佔2槽、Lv.1 佔1槽），進化觸發條件改為 `organSlotsUsed >= organSlots`

### 新增
- **技能樹重置按鈕**：技能樹介面新增「重置技能點」按鈕，彈出確認對話框後歸零全部技能，返還已花費點數
- **技能：幸運重選**（Max 3 級）：器官選擇畫面新增「重新隨機」按鈕，每局每次選擇可用次數=技能等級
- **技能：收集成癮**（Max 3 級）：每級增加 10px 收集範圍（果子和屍體）
- **技能：恐怖之牙**（Max 5 級）：每級增加 2 點攻擊力；第 5 級時開局直接獲得獠牙 Lv.1
- **毒刺主動攻擊**：毒刺 Lv.1 新增基礎攻擊力 +1，可觸發玩家主動攻擊，攻擊時附加中毒效果；新手保護邏輯視為攻擊器官（原本就是 attack 類型）
- **隱藏器官系統**：擊敗精英怪後每個隱藏器官有 50% 機率掉落，以金色邊框選擇介面呈現（標題「✨ 隱藏器官掉落！」）；多個同時掉落只能選 1 個；不佔普通器官槽位；死亡後自動繼承至下一局
- **隱藏器官 - 強大的心臟**：移速+0.2、攻擊+5、HP上限+100、體型+20%、攻擊範圍+10%
- **隱藏器官 - 強大的大腿**：移速+1、體型+20%
- **隱藏器官 - 強大的手臂**：收集範圍+15px、攻擊範圍+10%、體型+20%
- `gameConfig.js` 新增 `HIDDEN_ORGANS` 常數定義三個隱藏器官
- 器官清單左下角最底部以金色文字顯示已持有的隱藏器官（「✨ 器官名稱」）

---

## v0.12.0 - 2026-05-11

### 新增
- 無縫循環地圖（環形世界）：玩家走到邊界自動從對側出現
- `wrappedDistance(x1,y1,x2,y2)` — 計算環繞世界中的最短距離
- `wrappedDelta(ax,ay,bx,by)` — 回傳最短路徑方向向量（dx/dy）
- `worldToScreen` 加入環繞修正，跨邊界物件正確顯示於螢幕

### 調整
- 玩家移動改為環繞（模運算），不再被邊界阻擋
- `moveCreature` 改為環繞，所有生物（中立/敵意/精英/Boss）都能穿越邊界
- 相機追蹤改為環繞感知，跨邊界時平滑過渡
- 所有 AI 的距離偵測（aggro、攻擊範圍、逃跑）改用 `wrappedDistance`
- 所有 AI 移動方向改用 `wrappedDelta` 取最短路徑
- 果子拾取、寶物碰撞、大腦波、吃屍體等玩家行動改用 `wrappedDistance`
- 精英怪方向箭頭改用 `wrappedDelta` 計算正確方向

---

## v0.11.1 - 2026-05-11

### 新增
- 精英怪方向指示箭頭：精英怪在螢幕外時，於玩家圓形外圍 20px 處顯示朝向箭頭
- 箭頭顏色：草食性精英金色（#FFD700），肉食性精英紫色（#9B59B6）
- 箭頭每 0.5 秒在透明度 0.6↔1.0 之間閃爍，精英進入螢幕範圍後自動消失
- 精英怪生成時隨機分配 `diet`（herbivore / carnivore）欄位

---

## v0.11.0 - 2026-05-11

### 修復
- Bug 1：器官槽位改用 `organs.length` 計算，升級器官不再佔用額外槽位
- Bug 2：海洋敵意生物顏色改為 `#CC4466`（粉紅）、沙漠改為 `#CC8800`（橙黃），避免與背景混色
- Bug 3：移除全域果子數量上限（原 80 顆），每棵樹僅受自身上限（大樹5/小樹3）控制；每幀動態掃描附近果子數

### 新增
- 開發者模式面板頂部新增即時統計：果子總數、中立/敵意生物數量與上限，每幀更新
- `gameConfig.js` 新增 `GAME_TIMING` 常數記錄時段邊界

### 調整
- 遊戲時間從 20 分鐘縮短為 **10 分鐘**（1200 秒 → 600 秒）
- 日夜循環：每段從 150 秒縮短為 **75 秒**（1 分 15 秒），共 8 段
- 生物強化倍率計算週期對應更新（每 150 秒一級）

---

## v0.10.2 - 2026-05-11

### 修復
- 樹木果子計時器改為 `deltaTime` 累加（`tree.fruitTimer += dt`），生產後重置為 0，避免跳幀誤差
- Dev 模式於每棵樹上方顯示「附近果子數/最大上限」（金色文字）
- `initializeGame` 確保 `fruitTimer: 0` 與 `treeSize: 'large'/'small'` 正確初始化

### 調整
- 生物分散格從 4×4（每格 2000px）擴大為 **5×5（每格 1600px）**，覆蓋 8000×8000 全圖
- 初始生成：中立生物 50 隻（25 格 × 2）、敵意生物 25 隻（25 格 × 1）
- 最大上限：中立生物 **50 隻**（原 30）、敵意生物 **35 隻**（原 20）
- `spawnCreatureAtEdge()` 加權格選機制同步更新為 5×5 配置

---

## v0.10.1 - 2026-05-11

### 新增
- 樹木分大/小兩種：大樹（半徑 25–35px，佔 40%）和小樹（12–20px，佔 60%）
- 每棵樹獨立管理附近果子生產（`tree.fruitTimer` / `tree.fruitCount`），取代全域 `manageFruitSpawning`
- 大樹：附近 80px 最多 5 顆，小樹：60px 最多 3 顆；果子間隔 9s/19.5s/30s（依附近 0/1/2+顆決定）
- `spawnFruitFromTree(tree)` 函式：在樹半徑+20px 範圍內生成果子
- 生物初始生成採用 4×4 格（每格 2000×2000px）分散機制，每格至少 1 隻
- `spawnCreatureAtEdge()` 改為加權隨機選格繁殖：存活越少的格子被選中機率越高

### 調整
- 初始生成：樹木 150 棵、果子 80 顆（從各棵樹分散生成）、中立生物 20 隻（4×4 格）、敵意生物 10 隻
- 最大上限：中立生物 30 隻、敵意生物 20 隻

---

## v0.10.0 - 2026-05-11

### 新增
- 大地圖第二階段：地圖從 2400×1800 擴大至 8000×8000，視窗仍維持 800×600
- 三種地形區域：森林（中央 2000px 半徑）、海洋（x>5000 或 y>5000）、沙漠（其餘）
- `getBiome(x, y)` 函式：根據世界座標回傳地形 'forest' / 'ocean' / 'desert'
- `getBgColor()` 函式：依玩家位置計算背景顏色，地形邊界 200px 過渡漸變
- 地形視覺：森林綠、海洋藍、沙漠沙色，夜晚各有對應深色版本
- 地形專屬樹木顏色：森林深綠、海洋深藍（珊瑚）、沙漠橄欖色（仙人掌）
- 地形專屬果子顏色：森林紅、海洋藍（藻類）、沙漠橙
- 地形專屬生物顏色：中立/敵意生物依所在地形套用藍/黃色調
- 三種地形 Boss（由玩家所在地形決定）：森林黑熊（現有）、海洋大白鯊（HP 600、速度 1.3、傷害 18）、沙漠蠍王（HP 550、速度 1.2、傷害 20）；Boss 配置移至 `BOSS_CONFIG`（`gameConfig.js`）
- 右上角新增地形顯示：「🌲 森林」/「🌊 海洋」/「🏜️ 沙漠」

### 調整
- 玩家出生點改為地圖中央 (4000, 4000)，初始攝影機對齊 (3600, 3700)
- 樹木增至 100 棵；初始果子 50 顆，MAX_FRUITS 80
- 初始中立生物 8 隻（最多 20），初始敵意生物 5 隻（最多 15）
- 勝利畫面 Boss 名稱動態顯示（依擊殺的 Boss 種類）

### 修復
- `updateNeutralCreatures()` 攻擊型生物追擊/漫遊和逃跑移動邊界仍使用舊的 800×600 限制，改為 MAP_WIDTH/MAP_HEIGHT
- `devSpawnNeutral/devSpawnHostile` 生成邊界同步修正為 MAP_WIDTH/MAP_HEIGHT

---

## v0.9.4 - 2026-05-11

### 新增
- 大地圖第一階段：地圖實際尺寸從 800×600 擴大至 2400×1800，視窗顯示維持 800×600
- 新增 `MAP_WIDTH / MAP_HEIGHT / VIEW_W / VIEW_H` 常數，`gameState.camera { x, y }` 視角偏移
- `worldToScreen(wx, wy)` 函式：繪製時統一換算世界→螢幕座標
- `updateCamera()` 平滑視角跟隨：玩家進入視窗邊界 20%（160px / 120px）才開始移動，Lerp 係數 0.15，視角夾在地圖邊界內
- 玩家出生點改為地圖中央 (1200, 900)，初始攝影機對齊玩家 (800, 600)

### 調整
- 所有 draw 函式（樹木、果子、屍體、生物、寶物、Boss、精英怪、玩家）套用 worldToScreen + culling，螢幕外 ±50px 不繪製
- `showFloatingText` / `showXPPopup` 改為傳入世界座標，轉換後貼到 DOM
- 所有生物生成、wander target 改用 MAP_WIDTH/HEIGHT；樹木增至 60 棵，MAX_FRUITS 增至 60
- `gameLoop` 加入 `updateCamera()` 呼叫（在 `updatePlayerMovement` 之後）
- UI（HP/XP 列、時間欄、器官清單、訊息提示）固定螢幕座標，不跟隨 camera

---

## v0.9.3 - 2026-05-10

### 調整
- 玩家角色輪廓：移除白天輪廓，夜晚維持螢光綠（#00ff88，半徑+3px，透明度 0.9）

---

## v0.9.2 - 2026-05-10

### 新增
- 玩家角色輪廓：白天顯示白色輪廓（半徑+2px，透明度 0.8），夜晚顯示螢光綠輪廓（#00ff88，半徑+3px，透明度 0.9），提升夜間可見度

---

## v0.9.1 - 2026-05-10

### 修復
- 精英怪擊殺後未跳到白天：`handleEliteKill()` 依當前夜晚相位計算下一個白天時間點（`1200 - (phaseIndex + 1) * 150`），設定 `timeRemaining` 後立即呼叫 `updateDayNightCycle()`，再覆寫訊息為「☀️ 精英已滅！黎明提前到來！」

### 新增
- 左下角器官清單頂部新增槽位行「器官：X / Y」，槽位已滿時以金色顯示「✨可進化」；器官框高度固定包含此行（即使器官清單為空也顯示）

---

## v0.9.0 - 2026-05-10

### 新增
- 精英怪系統：每晚（第 1～3 夜）黑夜開始時從地圖邊緣生成一隻精英怪，共三個等級（★/★★/★★★），數值隨夜晚遞增（HP×5/7.5/10、速度 1.3/1.5/1.7、傷害 12/15/18）
- 擊殺精英怪：給予 150/225/300 XP 和 1 個技能點，螢幕訊息提示；死亡由 `handleEliteKill()` 統一處理（支援直接攻擊、刺甲反傷、流血、中毒四條路徑）
- 精英怪存活至黎明時自動撤退，訊息顯示「精英怪撤退了」
- 視覺：金色光暈（shadowBlur）、紫色 HP 條、金色星號標籤
- `ELITE_CONFIG` 加入 `gameConfig.js`，統一管理三個等級的數值與標籤

---

## v0.8.6 - 2026-05-10

### 調整
- 左下角進化狀態改為顯示所有已解鎖路線（每條各佔一行），格式為「🌿 草食性 Lv.X」，未解鎖的路線（等級 0）不顯示；進化框高度動態隨解鎖數量調整，與器官框和版本資訊不重疊

---

## v0.8.5 - 2026-05-10

### 修復
- HP 顯示小數點：`updateUI()` 改用 `Math.round()` 取整
- 連續升多級導致器官重複：新增 `pendingOrganSelections` 計數器，選擇畫面開啟中時排隊等待，關閉後依序顯示下一個
- 時間耗盡無法進入技能樹：`updateTimer()` 改呼叫 `showSkillTree('timeout')`，走與死亡相同的器官保留→技能樹流程；技能樹標題動態顯示「⏰ 時間耗盡」或「💀 你死了」
- 刺甲反彈傷害致死不給經驗：`applyDamageToPlayer()` 的反彈傷害後加入死亡判定，呼叫 `handleKill()` 給予 XP；Boss 被反傷擊殺同樣觸發勝利畫面

---

## v0.8.4 - 2026-05-10

### 修復
- 左下角 UI 重疊：器官框底部邊界改為動態計算，固定為版本資訊區域（46px）上方，由上到下順序為進化狀態→器官清單→空行→© Goblinnest→v0.8.4

---

## v0.8.3 - 2026-05-10

### 新增
- Boss 系統：剩餘 150 秒時地圖邊緣生成黑熊（HP 500，傷害 15），擊敗後顯示勝利畫面並給予 500 XP 和 1 個技能點
- 開始畫面：遊戲載入後先顯示標題畫面，按任意鍵或點擊按鈕進入遊戲
- 作者與版本資訊：畫布左下角、遊戲結束畫面、勝利畫面均顯示 © Goblinnest 和版本號
- `GAME_INFO` 常數加入 `gameConfig.js`，統一管理標題、副標題、作者、版本號

### 修復
- 器官選擇期間時間繼續流逝（關閉選擇畫面後補算暫停時長）
- 遊戲結束重新開始按鈕無法點擊（`#ui-overlay` 有 `pointer-events:none` 導致）
- 大腦器官拾取範圍未套用至屍體進食距離判斷
- 毒傷與流血致死的生物不給予擊殺 XP 及 `showXPPopup` 視覺提示
- 肉食高等級加快進食但總 XP 與回血同步減少（改為固定總量，僅速度隨等級提升）

### 調整
- 提取共用 `handleKill()` 函式，統一直接攻擊、流血、中毒三條死亡路徑的擊殺邏輯

---

## v0.8.2 - 2026-05-10

### 新增
- 分段吃屍體系統：每 0.5 秒一個 tick，進度條從橙色漸變深紅，離開範圍進度保留
- 浮動文字提示：屍體進食顯示 +XP（綠）和 +HP（粉）；流血顯示「血 -X」（深紅 11px）；中毒顯示「毒 -X」（紫 11px）
- 敵意生物與果子生成速度加速邏輯：場上數量為 0 時間隔縮短 70%
- 中立生物吃果子後成長：每顆 hp/maxHp +3、速度 +0.05，吃滿 5 顆後轉為攻擊型（橙紅色）
- 新手保護：等級 1–3 且無攻擊器官時，強制至少一個器官選項為攻擊類

### 修復
- 中立生物缺少 `diet` 屬性導致從未觸發草食行為
- 敵意生物擊殺中立生物後未正確回到巡邏狀態

---

## v0.8.1 - 2026-05-10

### 新增
- 器官升級系統：每個器官最多升至 3 級，升級佔用器官槽位，效果為增量疊加
- 組合效果提示：選擇器官時若已持有組合所需夥伴，顯示組合效果提示文字
- `gameConfig.js` 外部配置檔：將所有生物數值、器官資料、組合效果、技能、進化路線提取至獨立檔案
- 五種器官組合效果：蟹鉗+毒刺、龜殼+刺甲、大腦+真視之眼、厚皮+超自然回復、真視之眼+獠牙

### 修復
- XP 門檻與等級升級使用兩套獨立計數器，合併為以等級升級觸發器官選擇
- 敵意生物速度與傷害未套用上限（速度上限 2.5、傷害上限 20）
- 進化選項不出現：`organSlots += 3` 位置錯誤，移至 `applyEvolutionLevelEffect()`

---

## v0.8.0 - 2026-05-10

### 新增
- 技能樹系統：死亡後顯示技能樹，可升級六種永久技能（強壯體魄、敏捷身手、採集專家、獵人本能、頑強意志、記憶器官）
- 技能點數系統：每次死亡獲得 1 點，技能點數跨局保存至 localStorage
- 死亡保留器官：死亡後可選擇最多 1 個器官帶入下一局（記憶器官技能可增加上限至 3 個）
- 進化系統：草食性 / 肉食性 / 雜食性三條路線，各 3 級，器官槽位滿時觸發進化選擇
- 頑強意志：每局觸發一次，死亡時保留 10%×等級的 HP

---

## v0.7.0 - 2026-05-10

### 新增
- 日夜循環：每 150 秒交替白天/夜晚，夜晚敵意生物速度與傷害提升
- 倒數計時：20 分鐘遊戲時限，時間耗盡顯示遊戲結束畫面
- 生物繁殖系統：中立和敵意生物依時間間隔在地圖邊緣補充生成
- 生物強度隨時間提升（`creatureStrengthMultiplier`）

---

## v0.6.0 - 2026-05-10

### 新增
- 玩家攻擊系統：點擊攻擊，範圍內所有生物受到傷害；支援攻速、暴擊、流血、中毒、暈眩效果
- 刺甲反傷機制
- 念力波（大腦器官）範圍傷害
- 寶物系統：擊殺生物有機率掉落寶物，玩家接觸後獲得 XP
- 開發者模式：隱藏面板，可快速生成果子、生物，快進時間、補充 HP/XP

---

## v0.5.0 - 2026-05-10

### 新增
- 器官系統：升級時提供三個隨機器官選項（攻擊 / 防禦 / 靈力三類共 12 種）
- 器官效果即時套用至玩家屬性（攻擊力、速度、HP上限、傷害減免等）
- 器官清單顯示於畫布左下角

---

## v0.4.0 - 2026-05-10

### 新增
- 敵意生物 AI：巡邏、追擊、攻擊玩家和中立生物三種狀態
- 敵意生物感知範圍（`aggroRange`）、攻擊範圍、攻擊冷卻
- 擊殺生物掉落屍體，肉食型敵意生物會食用屍體強化屬性
- `applyDamageToPlayer()` 傷害計算（含傷害減免與反傷）
- 玩家死亡後進入死亡畫面（前期版本為空白頁）

---

## v0.3.0 - 2026-05-10

### 新增
- 中立生物 AI：草食性與雜食性，依據食性在地圖上尋找果子
- 中立生物逃跑與反擊行為（`fleeRange`、`fightBackRange`、`canFight`）
- 中立生物血條顯示

---

## v0.2.0 - 2026-05-10

### 新增
- 果子系統：地圖隨機生成果子，玩家接觸後獲得 XP
- 果子定時補充（白天 8 秒、夜晚 16 秒）
- XP 達到門檻後升級，顯示升級提示文字

---

## v0.1.0 - 2026-05-10

### 新增
- 800×600 畫布地圖，隨機生成樹木作為裝飾
- 玩家角色（黑色圓形），WASD 鍵盤移動
- 畫面 UI：HP 條、XP 條、時間顯示、日夜狀態
- `gameState` 全局狀態管理物件
- `requestAnimationFrame` 主遊戲循環
