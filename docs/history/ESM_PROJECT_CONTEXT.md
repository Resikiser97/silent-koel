# 專案背景說明（給 Codex 讀）
# 只吃不叫的噪鵑（The Silent Koel）
# 版本：v0.1.3.3 | 更新日期：2026-06-04
#
# 這份文件的目的：讓 Codex 在完全不了解此專案的情況下，
# 能夠準確執行靜態審計和檢查任務，不會因為不懂專案背景而誤判。

---

## 一、這是什麼專案？

這是一款**單人獨立開發的瀏覽器 Roguelike 生存遊戲**。
技術棧：純 HTML + JavaScript + CSS，**沒有使用任何框架或打包工具**。
渲染：HTML5 Canvas 2D（遊戲世界）+ HTML div overlay（UI 介面）
部署：GitHub → Vercel，Supabase 處理排行榜和雲端存檔。

**重要：目前的代碼完全不使用 ES Modules。**
所有 JS 檔案都透過 `index.html` 裡的 `<script src="...">` 標籤依序載入，
函式和常數透過全域變數（`window.*`）互相溝通，沒有 `import`/`export`。

這次的任務是**把這套舊系統遷移到 ES Modules**，讓代碼更現代化、更容易維護。

---

## 二、檔案結構

```
根目錄/
  index.html          ← 遊戲入口，HTML 結構 + 所有 <script> 載入順序
  main.js             ← 遊戲主迴圈（gameLoop）、初始化（initializeGame）
  lang.js             ← 多語系工具（LANG_LIST、t() 函式）

config/               ← 純靜態資料，不含任何遊戲邏輯
  gameConfig.js       ← GAME_INFO（版本號）、AUDIO_FILES（音效設定）
  characters.js       ← CHARACTERS（可選角色定義）
  organs.js           ← ORGANS（15種器官）、HIDDEN_ORGANS、poisonSac
  creatures.js        ← CREATURE_CONFIG、ELITE_CONFIG、BOSS_CONFIG
  evolution.js        ← EVOLUTION_PATHS（進化路線）、SKILLS（9種技能）、COMBOS（5種組合）
  patchnotes.js       ← PATCH_NOTES（版本更新公告）
  supabase.js         ← Supabase API 函式（排行榜、雲端存檔）

lang/                 ← 多語系語言包
  zh-TW.js            ← 繁體中文（主語言）
  en.js               ← 英文（備用）

map/                  ← 難度地圖配置
  easymap.js          ← EASY_MAP 常數（簡單難度參數）
  normalmap.js        ← NORMAL_MAP 常數
  hardmap.js          ← HARD_MAP 常數（含困難難度 Boss 設定）

systems/              ← 遊戲系統邏輯（核心）
  gameState.js        ← gameState 全域物件、DEFAULT_SETTINGS、Canvas/ctx
  utils.js            ← 共用繪圖工具（drawArrow、drawHealthBar 等）
  audio.js            ← AudioManager（音樂/音效播放）
  camera.js           ← 攝影機更新、座標轉換（worldToScreen）
  input.js            ← 鍵盤/觸控輸入處理
  map.js              ← 地形生成（generateTerrain）、Tileable Noise 算法
  spawning.js         ← 生物/果子/樹木生成邏輯
  player.js           ← 玩家移動、碰撞檢測
  tutorial.js         ← 新手教學流程
  combat.js           ← 攻擊/傷害/狀態效果（毒、流血）、白骨系統
  organs.js           ← 器官系統邏輯
  evolution.js        ← 進化/變異系統邏輯
  creatures.js        ← 生物 AI（中立、敵意、巨人化、殺手化）
  elite.js            ← 精英怪邏輯
  boss.js             ← Boss 邏輯（黑熊/大白鯊/沙漠蠍王/黑色獵人）
  daynight.js         ← 日夜循環（每75秒切換，共8時段）
  ui.js               ← 所有 UI 介面（首頁、排行榜、設定、器官選擇等）
  leaderboard.js      ← 排行榜資料查詢
  mutation.js         ← 變異技能樹系統
```

---

## 三、目前代碼的全域變數溝通方式

由於沒有 ES Modules，所有檔案之間靠以下方式溝通：

**方式 1：直接存取全域常數**
```javascript
// config/creatures.js 定義：
const CREATURE_CONFIG = { ... };

// systems/spawning.js 直接使用（沒有 import）：
const cfg = CREATURE_CONFIG[type];
```

**方式 2：透過 gameState 物件傳遞狀態**
```javascript
// systems/gameState.js 定義：
let gameState = { player: {...}, creatures: [], ... };

// 幾乎所有 systems/ 都直接讀寫 gameState
gameState.player.hp -= damage;
```

**方式 3：直接呼叫全域函式**
```javascript
// systems/camera.js 定義：
function worldToScreen(wx, wy) { ... }

// systems/player.js 直接呼叫（沒有 import）：
const { sx, sy } = worldToScreen(x, y);
```

---

## 四、index.html 的載入順序（重要！）

目前 `<script>` 的載入順序決定了哪個檔案能用哪個檔案的函式。
**順序不對遊戲就會壞掉**，這是遷移到 ESM 最需要小心的地方。

目前順序（從先到後）：
```
1. config/gameConfig.js     ← GAME_INFO、AUDIO_FILES
2. config/characters.js     ← CHARACTERS
3. config/organs.js         ← ORGANS、HIDDEN_ORGANS
4. config/creatures.js      ← CREATURE_CONFIG、ELITE_CONFIG、BOSS_CONFIG
5. config/evolution.js      ← EVOLUTION_PATHS、SKILLS、COMBOS
6. config/patchnotes.js     ← PATCH_NOTES
7. map/easymap.js           ← EASY_MAP
8. map/normalmap.js         ← NORMAL_MAP
9. map/hardmap.js           ← HARD_MAP
10. lang/zh-TW.js           ← LANG['zh-TW']
11. lang/en.js              ← LANG['en']
12. lang.js                 ← LANG_LIST、t()、applyLanguage()
13. config/supabase.js      ← Supabase 函式
14. systems/gameState.js    ← gameState 物件
15. systems/utils.js        ← drawArrow 等工具
16. systems/audio.js        ← AudioManager
17. systems/camera.js       ← updateCamera、worldToScreen
18. systems/input.js        ← handleKeyDown 等
19. systems/map.js          ← generateTerrain
20. systems/spawning.js     ← spawnCreatures 等
21. systems/player.js       ← updatePlayerMovement 等
22. systems/tutorial.js     ← showTutorial 等
23. systems/combat.js       ← playerAttack 等
24. systems/organs.js       ← 器官系統函式
25. systems/evolution.js    ← 進化系統函式
26. systems/creatures.js    ← 生物 AI 函式
27. systems/elite.js        ← 精英怪函式
28. systems/boss.js         ← Boss 函式
29. systems/daynight.js     ← 日夜系統函式
30. systems/ui.js           ← 所有 UI 函式
31. systems/leaderboard.js  ← 排行榜函式
32. systems/mutation.js     ← 變異技能樹函式
33. main.js                 ← gameLoop、initializeGame、window.onload
```

**ESM 遷移後，這個順序要轉換成 `import` 語句的依賴鏈。**

---

## 五、你（Codex）在這個專案的任務

你的工作是**靜態分析**，不是修改代碼。

### 任務類型 A：依賴審計
分析所有 JS 檔案，產出全域變數/函式的依賴地圖。
格式：`docs/dependency_map.md`（格式規範見 ESM_MIGRATION_PLAN.md Stage 1）

### 任務類型 B：語法檢查
ESM 遷移後，驗證以下項目：
1. 所有 `import` 語句的路徑是否指向實際存在的檔案
2. 所有被 `import` 的名稱是否確實在來源檔案中被 `export`
3. 是否有循環依賴（A import B，B import A）
4. 是否有任何檔案忘記加 `export`

### 任務類型 C：進度確認
讀取 `docs/ESM_PROGRESS.md`，報告目前進度狀態。

---

## 六、你必須知道的特殊規則

1. **不要修改任何遊戲邏輯**，你只做分析和報告
2. **不要猜測依賴關係**，只報告你在代碼裡實際看到的
3. **發現問題只報告，不自動修復**，等開發者確認後才執行
4. **每次開始工作前先讀 `docs/ESM_PROGRESS.md`**，了解目前進度

---

## 七、遊戲核心概念（幫助你理解代碼語意）

- **噪鵑（Koel）**：玩家角色，一隻黑色小鳥
- **器官（Organ）**：裝備系統，類似 RPG 的裝備槽
- **進化（Evolution）**：草食性/肉食性/雜食性三條路線
- **精英怪（Elite）**：每個夜晚出現的強化怪物
- **Boss**：第四個夜晚出現的最終敵人
- **黑色獵人（Black Hunter）**：困難難度的 Boss，人類輪廓造型
- **gameState**：整個遊戲的狀態物件，幾乎所有系統都會讀寫它
- **日夜循環**：每 75 秒切換一個時段，共 8 時段（4 白天 4 夜晚）
