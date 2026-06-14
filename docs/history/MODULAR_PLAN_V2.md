# 全模組化第二階段計劃書
# 只吃不叫的噪鵑（The Silent Koel）
# 建立日期：2026-06-06 | 基準版本：v0.1.5.0
#
# 目標：
#   1. 每個系統模組可以獨立測試（不需要啟動整個遊戲）
#   2. iOS Safari 效能優化（吃果子掉幀問題）
#   3. 修復已知 Bug（BUG-01、TODO-UI-01）
#
# 執行者分工：
#   Claude Chat  → 計劃、審查、撰寫 Prompt
#   Claude Code  → 代碼修改、git 操作
#   Codex        → 靜態審計、語法檢查、腳本執行

---

## 一、現狀說明（v0.1.5.0 基準）

### 已完成
- 37 個 JS 檔案全部使用 import/export（ESM 語法遷移完成）
- index.html 只剩一個 `<script type="module" src="./main.js">`
- storage/index.js 集中 localStorage 讀寫
- AudioManager 統一音量管理
- mutation ↔ evolution 循環依賴已打破（CustomEvent）

### 尚未解決（Codex 審計結果）
- **17 個檔案的大型循環依賴**（核心系統互相 import）
- **lang/en.js、lang/zh-TW.js 沒有 export**（side-effect module，可接受但不乾淨）
- **main.js 有 window.dev\* 掛載**（10 個 dev 工具，刻意保留）
- **gameState 仍是 god-object**，任何檔案都能隨意讀寫

### 已知 Bug（本計劃一併處理）
- **BUG-01**：選擇阿奇爾角色時播放噪鵑音效（兩個角色音效相同）
- **TODO-UI-01**：精英怪全圖公告在手機版被截斷

---

## 二、目標定義

### 「可獨立測試」的具體意義

```javascript
// 目標：可以這樣寫測試，不需要啟動遊戲
import { updateCamera } from './systems/camera.js';

const fakeGameState = { camera: { x: 0, y: 0 }, player: { x: 100, y: 100 } };
const result = updateCamera(fakeGameState);
assert(result.camera.x === expectedValue);
```

現在做不到的原因：`camera.js` import 了 `gameState`，
`gameState` 又 import 了 `canvas`，`canvas` 需要 DOM，
所以你一 import `camera.js`，整個遊戲就要跑起來。

### iOS Safari 掉幀的根本原因假說

根據症狀（吃果子立刻掉到 40fps，多個後卡到 2-9fps）：

1. **同一幀觸發太多事**：吃果子 → XP 計算 → 等級檢查 → 器官更新 → UI 重繪 → localStorage 寫入 → 音效播放，全部同步執行
2. **GC 壓力**：每幀產生臨時物件，Safari GC 比 Chrome 激進
3. **Canvas + DOM 混用觸發 reflow**：UI overlay 更新時觸發瀏覽器重排

模組化之後可以用測試精確定位哪一層最慢。

---

## 三、全局排程

| Stage | 名稱 | 核心內容 | 難度 | 風險 | 版本目標 |
|-------|------|----------|------|------|----------|
| A | 測試基礎建設 | 建立測試框架，先測能測的 | ⭐⭐ | 低 | v0.1.6.0 |
| B | Bug 修復 | BUG-01 + TODO-UI-01 | ⭐⭐ | 低 | v0.1.6.x |
| C | gameState 存取控制 | 三個高風險 slice 加護欄 | ⭐⭐⭐ | 中 | v0.1.7.0 |
| D | 中層系統重構 | 第二類系統可獨立測試 | ⭐⭐⭐ | 中 | v0.1.8.0 |
| E | iOS 效能診斷與優化 | 找出掉幀根本原因並修復 | ⭐⭐⭐⭐ | 中高 | v0.1.9.0 |
| F | 核心循環依賴打破 | 17 個檔案的循環依賴 | ⭐⭐⭐⭐ | 高 | v0.2.0 |
| G | 核心系統可測試化 | combat/player/boss 獨立測試 | ⭐⭐⭐⭐⭐ | 高 | v0.2.x |

> 每個 Stage 完成、測試穩定後才進入下一個。
> E（iOS 優化）是第一優先，只要 A-C 完成就可以開始。

---

## 四、Stage A — 測試基礎建設

### 目標
建立測試框架，讓第一類模組（純資料、純函式）可以開始被測試。

### 測試框架選擇
**推薦：Vitest**
理由：
- 原生支援 ES Modules（不需要額外設定）
- 語法和 Jest 相同，學習成本低
- 在 Node.js 環境執行，不需要瀏覽器

```bash
# 安裝指令
npm init -y
npm install -D vitest
```

### 第一批測試目標（不需要修改任何遊戲代碼）

| 檔案 | 測試內容 | 需要 mock |
|------|----------|-----------|
| `config/gameConfig.js` | GAME_INFO 格式正確、版本號符合格式 | 無 |
| `config/organs.js` | ORGANS 陣列結構完整、每個器官有必要欄位 | 無 |
| `config/creatures.js` | CREATURE_CONFIG 每個物種有必要欄位 | 無 |
| `storage/index.js` | getSettings/saveSettings 讀寫正確 | mock localStorage |
| `systems/camera.js` | worldToScreen 座標換算正確、wrappedDelta 計算正確 | mock gameState |
| `systems/map.js` | getBiome 回傳正確 biome、getBgColor 格式正確 | mock gameState + ctx |

### 目錄結構
```
tests/
  config/
    gameConfig.test.js
    organs.test.js
    creatures.test.js
  storage/
    storage.test.js
  systems/
    camera.test.js
    map.test.js
  helpers/
    mockGameState.js    ← 共用的假 gameState fixture
    mockStorage.js      ← mock localStorage
    mockCanvas.js       ← mock Canvas context
```

### 驗收條件
- `npm test` 可以執行
- 第一批 6 個測試檔案全部通過
- CI 基礎（可選）：GitHub Actions 每次 push 自動跑測試

---

## 五、Stage B — Bug 修復

### BUG-01：阿奇爾角色音效誤植

**診斷方向：**
查 `config/gameConfig.js` 的 `AUDIO_FILES` 和 `systems/audio.js` 的角色音效選擇邏輯，
確認阿奇爾的音效 key 是否正確指向阿奇爾專屬音效檔案。

patchnotes.js 有記錄「阿奇爾音效整合：新增完整音效 key（普攻/暴擊/衝能/受傷/死亡）」，
所以音效檔案存在，問題可能是 audio.js 的讀取邏輯沒有正確區分角色。

**修復後測試：**
Stage A 的測試框架建立後，可以為音效選擇邏輯補上測試。

### TODO-UI-01：精英怪全圖公告手機版截斷

**診斷方向：**
查 `systems/elite.js` 或 `systems/hud.js` 的公告顯示函式，
確認文字容器有沒有做手機版的 max-width 或 font-size 自適應。

### 驗收條件
- 選阿奇爾開始遊戲，攻擊/受傷音效與噪鵑不同
- 手機版精英怪公告完整顯示，不被截斷

---

## 六、Stage C — gameState 存取控制

### 目標
不消滅 gameState，但為最容易出問題的三個 slice 加上「護欄」，
讓這些 slice 只能透過指定入口讀寫。

### 三個目標 Slice

**Slice 1：`gameState.settings`**
現狀：`loadSettings()`、`applyDeviceMode()`、`initializeGame()` 各自修改
目標：只能透過 `Storage.getSettings()` / `Storage.saveSettings()` 讀寫
影響檔案：`systems/audio.js`、`systems/input.js`、`systems/mobile.js`、`main.js`

**Slice 2：`gameState.mutationSkills`**
現狀：多個地方直接讀寫，偶爾和 localStorage 不同步
目標：只能透過 `mutation/index.js` 的 export 函式讀寫
影響檔案：`systems/evolution.js`、`systems/ui.js`、`systems/organs.js`

**Slice 3：`gameState.sessionStats`**
現狀：戰鬥統計散落在 combat/player/creatures 各處直接寫入
目標：建立 `stats/index.js`，統一 sessionStats 的讀寫介面
影響檔案：`systems/combat.js`、`systems/player.js`、`systems/creatures.js`

### 執行順序
Slice 1 → Slice 2 → Slice 3，每個 Slice 完成後測試穩定再繼續。

### 驗收條件
- 三個 slice 的讀寫路徑各自只有一個入口
- Stage A 的測試可以對這三個 slice 做獨立測試
- 遊戲功能不受影響

---

## 七、Stage D — 中層系統重構

### 目標
讓以下系統可以在不啟動遊戲的情況下被獨立測試。

| 系統 | 主要依賴 | 重構方式 |
|------|----------|----------|
| `systems/audio.js` | AudioContext、gameState.settings | 把 AudioContext 改為注入（inject） |
| `systems/input.js` | document.addEventListener、gameState.settings | 把 document 改為注入 |
| `systems/spawning.js` | gameState、Math.random | 把 random 改為可替換的函式參數 |
| `systems/daynight.js` | gameState、時間計算 | 純函式抽取 |
| `systems/creatures.js` | gameState、AI 邏輯 | 純函式抽取（AI 決策部分） |

### 重構原則：依賴注入（Dependency Injection）

```javascript
// 現在：直接依賴全域
import { gameState } from './gameState.js';
export function updateCamera() {
    // 直接讀 gameState
    const x = gameState.player.x;
}

// 重構後：接受參數
export function updateCamera(state) {
    // 從參數讀
    const x = state.player.x;
}

// 測試時：
import { updateCamera } from './systems/camera.js';
const result = updateCamera({ player: { x: 100, y: 100 } });
```

不需要一次改完所有函式，每個函式獨立處理，改完就補測試。

### 驗收條件
- 五個系統各有至少 3 個單元測試通過
- 遊戲功能不受影響

---

## 八、Stage E — iOS Safari 效能診斷與優化（第一優先）

> 注意：Stage A-C 完成後即可開始此 Stage，不需要等 D、F、G。

### 診斷策略

**Step 1：建立效能測試基準**
在 `tests/performance/` 建立效能測試，測量以下操作的執行時間：
- 吃一個果子的完整流程（從碰撞偵測到 UI 更新）
- 一幀的 gameLoop 執行時間
- localStorage 寫入頻率

**Step 2：用 Safari 的 Instruments 定位瓶頸**
在真實 iPhone 上用 Safari Web Inspector 的 Timeline 錄製：
- 找出吃果子時哪個函式佔用最多時間
- 確認是 GC、reflow 還是 JavaScript 計算

**Step 3：根據診斷結果執行優化**

已知候選優化點（根據症狀推測）：

| 問題 | 候選原因 | 解法 |
|------|----------|------|
| 吃果子瞬間掉幀 | 同幀觸發太多同步操作 | 把非關鍵操作（UI 更新、localStorage）延遲到下一幀 |
| 多個果子後卡死 | GC 壓力累積 | 物件池（已有部分，需要擴大） |
| Safari 特別嚴重 | Canvas + DOM 混用 reflow | UI overlay 更新加入 dirty check（已有部分） |
| 音效播放卡頓 | 音效物件沒有複用 | 音效池擴大（已有部分） |

**Step 4：優化後驗證**
在真實 iPhone 上測試，確認 FPS 在吃果子後維持在 55+ fps。

### 優化工具箱（可選用）

```javascript
// 工具 1：requestIdleCallback 延遲非關鍵操作
function eatFruit(fruit) {
    // 關鍵：立即執行
    removeFromWorld(fruit);
    addXP(fruit.xp);
    
    // 非關鍵：延遲到空閒時
    requestIdleCallback(() => {
        updateLeaderboardCache();
        saveProgressToStorage();
    });
}

// 工具 2：批次 DOM 更新
let pendingUIUpdate = false;
function scheduleUIUpdate() {
    if (pendingUIUpdate) return;
    pendingUIUpdate = true;
    requestAnimationFrame(() => {
        doUIUpdate();
        pendingUIUpdate = false;
    });
}

// 工具 3：物件池擴大
const vecPool = [];
function getVec(x, y) {
    const v = vecPool.pop() || { x: 0, y: 0 };
    v.x = x; v.y = y;
    return v;
}
function releaseVec(v) { vecPool.push(v); }
```

### 驗收條件
- iPhone Safari 吃果子後 FPS 維持 55+
- 連續吃 10 個果子不卡死
- 效能測試有基準數字記錄（方便未來對比）

---

## 九、Stage F — 核心循環依賴打破

### 目標
解決 17 個檔案的大型循環依賴群組。

### 循環依賴地圖（Codex 審計結果）

直接雙向循環對：
```
systems/mobile.js   ↔ systems/player.js
systems/mobile.js   ↔ systems/ui.js
systems/combat.js   ↔ systems/utils.js
systems/combat.js   ↔ systems/player.js
systems/combat.js   ↔ systems/organs.js
systems/combat.js   ↔ systems/evolution.js
main.js             ↔ systems/organs.js
main.js             ↔ systems/evolution.js
main.js             ↔ systems/boss.js
main.js             ↔ systems/ui.js
main.js             ↔ systems/tutorial.js
systems/boss.js     ↔ systems/combat.js
systems/boss.js     ↔ systems/player.js
systems/organs.js   ↔ systems/player.js
systems/evolution.js ↔ systems/organs.js
systems/evolution.js ↔ systems/ui.js
```

### 處理策略（按難度排序）

**第一批：CustomEvent 解法（難度 ⭐⭐）**
適用於「A 需要通知 B，但不需要 B 的回傳值」的情況：
- `systems/mobile.js` ↔ `systems/ui.js`
- `systems/mobile.js` ↔ `systems/player.js`
- `systems/evolution.js` ↔ `systems/ui.js`

範例（已在 TODO-03 用過）：
```javascript
// 原本：ui.js import mobile.js，mobile.js import ui.js
// 改後：mobile.js 發事件，ui.js 監聽

// mobile.js
dispatchEvent(new CustomEvent('deviceModeChanged', { detail: { mode } }));

// ui.js
window.addEventListener('deviceModeChanged', ({ detail }) => {
    updateUIForDevice(detail.mode);
});
```

**第二批：共用介面抽取（難度 ⭐⭐⭐）**
適用於「A 和 B 都需要 C 的東西，所以都 import C，C 也 import 它們」：
- `systems/combat.js` ↔ `systems/utils.js`
- `systems/combat.js` ↔ `systems/player.js`

解法：把共用的型別定義或工具函式抽到第三個檔案，
A 和 B 都 import 這個新檔案，不再互相 import。

**第三批：main.js 瘦身（難度 ⭐⭐⭐⭐）**
main.js 現在同時負責：gameLoop、initializeGame、window.onload、dev 工具
這讓它和幾乎所有系統都有雙向依賴。

拆分目標：
```
main.js         ← 只剩 gameLoop 和 window.onload 入口
init.js         ← initializeGame 邏輯
dev.js          ← window.dev* 掛載（10 個 dev 工具）
```

### 驗收條件
- Codex 重跑循環依賴審計，大型 SCC 群組從 17 個縮小到 5 個以下
- 遊戲功能不受影響
- 測試全部通過

---

## 十、Stage G — 核心系統可測試化

### 目標
讓最複雜的核心系統也能獨立測試。

| 系統 | 測試目標 | 挑戰 |
|------|----------|------|
| `systems/combat.js` | 傷害計算、狀態效果（毒/流血）正確 | 依賴 gameState、player、organs |
| `systems/player.js` | 移動碰撞、吃果子流程 | 依賴 Canvas、gameState |
| `systems/organs.js` | 器官效果套用正確 | 依賴 gameState.player |
| `systems/evolution.js` | 進化條件判斷正確 | 依賴 gameState、organs |
| `systems/boss.js` | Boss 狀態機轉換正確 | 依賴 gameState、Canvas、AudioManager |

這些系統需要 Stage F 的循環依賴打破之後才比較容易測試。

### 驗收條件
- 每個核心系統至少 5 個單元測試
- 傷害計算公式有測試覆蓋
- Boss 狀態機有測試覆蓋

---

## 十一、已知 Bug 與技術債彙整

### 待修 Bug
| ID | 問題 | 優先度 | 處理 Stage |
|----|------|--------|-----------|
| BUG-01 | 阿奇爾角色音效誤植為噪鵑音效 | 中 | Stage B |
| TODO-UI-01 | 精英怪全圖公告手機版截斷 | 低 | Stage B |

### 技術債（來自 ESM_TODO.md，已完成項目不列）
| ID | 問題 | 處理 Stage |
|----|------|-----------|
| 循環依賴 | 17 個檔案大型 SCC | Stage F |
| gameState settings | 存取控制 | Stage C |
| gameState mutationSkills | 存取控制 | Stage C |
| gameState sessionStats | 存取控制 | Stage C |
| lang side-effect | en.js / zh-TW.js 無 export | Stage D（順帶處理） |

---

## 十二、執行原則

1. **每個 Stage 完成、測試通過才進入下一個**
2. **E（iOS 優化）是第一優先**，A-C 完成就可以開始，不需要等 D
3. **代碼修改工作給 Claude Code**，靜態審計給 Codex
4. **每次 Stage 完成更新 docs/ESM_PROGRESS.md**
5. **重大改動前先建分支**，測試穩定後 merge 回 master
6. **版本號規則**：bug fix → z+1，新功能/重構 → y+1，不自行決定

---

## 十三、重要文件位置

| 文件 | 位置 | 用途 |
|------|------|------|
| 本計劃書 | `docs/MODULAR_PLAN_V2.md` | 本文件 |
| 技術債清單 | `docs/ESM_TODO.md` | 原有待辦（部分已完成） |
| 進度追蹤 | `docs/ESM_PROGRESS.md` | 三方同步狀態 |
| 專案快速參考 | `QUICKREF.md` | 版本號、檔案地圖 |
| 詳細技術文件 | `MAIN.md` | 函式說明、模組架構 |
| 版本歷史 | `CHANGELOG.md` | 權威版本紀錄 |

---

## 附錄：Vitest 快速設定

```json
// package.json（加入這段）
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

```javascript
// tests/helpers/mockGameState.js
export function createMockGameState(overrides = {}) {
    return {
        player: {
            x: 2000, y: 2000,
            hp: 100, maxHp: 100,
            organs: [],
            ...overrides.player
        },
        camera: { x: 2000, y: 2000, ...overrides.camera },
        settings: {
            volume: { master: 1, music: 0.7, sfx: 1 },
            keys: {},
            ...overrides.settings
        },
        creatures: [],
        fruits: [],
        ...overrides
    };
}
```

```javascript
// tests/helpers/mockStorage.js
export function createMockStorage() {
    const store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
}
```
