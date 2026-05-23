# 只吃不叫的噪鵑（The Silent Koel）— 專案核心背景與進度文檔

## 一、專案目標與核心定位

### 遊戲簡介
一款以 HTML + JavaScript 製作的瀏覽器 Roguelike 生態遊戲。
玩家扮演噪鵑（小黑鳥），在森林／海洋／沙漠三種地形的 8000×8000 無縫循環世界中生存，
透過收集器官進化，擊敗每個夜晚的精英怪，最終在第四個夜晚擊敗 Boss 獲得勝利。

### 核心遊戲循環
```
出生（草食性小鳥）→ 吃果子獲得XP → 選擇器官升級
→ 躲避/攻擊敵意生物 → 夜晚精英怪出現
→ 選擇進化路線 → Boss夜決戰 → 勝利/死亡 → 技能樹繼承
```

### 商業目標
- 第一步：itch.io 免費上架測試市場
- 第二步：投稿 CrazyGames／Poki 廣告分潤
- 第三步：根據反饋決定手機版或 Steam

### 開發者
Goblinnest（單人獨立開發，AI 輔助）

---

## 二、已達成的關鍵共識與結論

### 遊戲設定
- 遊戲時間：10 分鐘一局（`timeRemaining = 600`）
- 日夜循環：每 75 秒切換一個時段，共 8 時段（4 白天 4 夜晚）
- 第四個夜晚（phaseIndex 7）：Boss 夜，Boss 在剩餘 150 秒時生成
- 地圖：8000×8000，Tileable Noise 無縫循環，開局固定森林中心（4000, 4000）

### 器官系統（v0.31.0 大改後）
- 初始 5 個槽位，每個器官（含升級）各佔 1 格
- 累積達到槽位上限後觸發進化路線選擇，每次進化後槽位 +3
- 普通器官 12 種（攻擊⚔️／防禦🛡️／靈力🔮各類），各有 Lv1~3
- 隱藏器官 4 種（擊敗精英怪 50% 機率掉落，不佔普通槽位）：強大的心臟、強大的大腿、強大的手臂、強大的眼睛
- 特殊器官：毒囊（`noSelection: true`、`noInherit: true`，雜食性 Lv1 自動給予，白骨素自動升級，共 10 級，門檻：5/10/20/40/60/100/120/140/160/200）
- 死亡後可保留器官數：依「記憶器官」技能等級，預設 0 個（Lv1=1，Lv2=2，Lv3=3）
- 組合效果：雙方器官都達 Lv3 才觸發，共 5 種（蟹鉗+毒刺+毒囊、龜殼+刺甲、大腦+真視之眼、厚皮+超自然回復、真視之眼+獠牙）

### 進化系統（各路線 Lv1~5）
- 🌿 草食性：HP 加強、果子 XP、中立生物友善（Lv4/5 狂暴狀態也不攻擊）；初始已解鎖 Lv1
- 🥩 肉食性：可吃屍體（各等級固定值覆蓋，非累計；攻擊加成 2/5/9/14/20，吃屍 XP 5/8/12/15/20，吃屍時間 3/2.5/2/1.5/1 秒）、Lv3+ 攻速 +5%/+10%/+15%；無前置條件
- ⚖️ 雜食性：需草食≥1 且肉食≥1 解鎖；速度加強；可吞噬白骨獲得白骨素；Lv1 自動給予毒囊
- 進化路線等級每局重置

### 白骨系統（v0.31.0 新增）
- 屍體被吃完 → 立刻變成白骨；屍體 60 秒到期 → 變成白骨
- 白骨在地面存在 180 秒後消失
- 雜食性玩家可吞噬白骨獲得白骨素（`boneMaterial`）
- 白骨素累積達門檻自動升級毒囊

### 毒傷機制
- 毒刺和毒囊共用同一個毒 debuff
- `finalPoisonDmg = poisonStingerDmg + poisonSacDmg`
- `finalPoisonDur = Math.max(poisonStingerDur, poisonSacDur)`
- 重複攻擊只重置持續時間（`poisonEndTime`），不重置 tick 計時器（`lastPoisonTick`，以 `+= 1000` 累加避免誤差）

### 精英怪與 Boss
- 每個夜晚生成 1 隻精英怪（第1夜 5倍／第2夜 7.5倍／第3夜 10倍數值）
- 擊殺精英怪後立刻跳到下一個白天
- Boss：黑熊（森林）／大白鯊（海洋）／沙漠蠍王（沙漠），全圖追擊，剩餘 150 秒生成

### 技能樹（v0.32.0 調整後）
共 9 種技能：強壯體魄、敏捷身手、採集專家、獵人本能、頑強意志、記憶器官、幸運重選、收集成癮、恐怖之牙

**技能費用（階梯制）**：Lv1=1點，Lv2=2點，Lv3=3點，Lv4=4點，Lv5=5點；全滿需 63 點

**技能點來源（v0.32.0 重整，死亡不再直接給點）**：
- 精英怪擊殺：第1夜+1，第2夜+1，第3夜+2（v0.47.0 調整）
- Boss 擊殺：+3（v0.47.0 調整，原為+5）
- 時間獎勵（死亡/勝利時結算）：`Math.floor((600 - timeRemaining) / 180)`
- 等級獎勵（死亡/勝利時結算）：`Math.floor(player.level / 6)`

**重要技能備注**：
- 記憶器官：預設保留 0 個，Lv1=1，Lv2=2，Lv3=3
- 恐怖之牙：每級攻擊+2；Lv3 開局強制獠牙 Lv1；Lv5 開局強制獠牙 Lv2（技能永遠覆蓋繼承）
- 收集成癮：果子、屍體和白骨收集範圍各 +10px（每級）

### 結算畫面流程（v0.31.1 重整後，勝利／死亡相同）
1. 分數提交彈窗
2. 結算畫面 3 個按鈕：「前往技能樹」／「🏠 回到首頁」／「⚔️ 再來一場」
3. 「前往技能樹」→ 技能樹（`mode='postGame'`）→ 底部「回首頁」+「再來一場」（無警告）
4. 「🏠 回首頁」（直接）→ warn-once → 回首頁（`lastRunOrgans` 保留，首頁可補選）
5. 「⚔️ 再來一場」（直接）→ 強制進技能樹（`mode='forceStart'`）→ 底部只有「開始遊戲」

### 圖鑑系統（v0.31.0 新增）
- 主選單「📖 圖鑑」取代原「遊戲說明」；遊戲內左下角 📖 按鈕（預設開器官圖鑑 Tab）
- 書本翻頁樣式，三個 Tab：操作說明／器官圖鑑／進化圖鑑
- 操作說明頁（v0.30.0 更新）：電腦版含自動攻擊 Z 鍵說明；手機版左欄含全螢幕移動/攻擊區/自動攻擊說明，右欄為 SVG 手機示意圖（移動區 + 右下角攻擊區，中英文支援）
- 器官圖鑑／進化圖鑑直接引用 `config/organs.js` + `config/evolution.js`，數值改動自動反映

### 手機操控架構（v0.30.0 大改後）

#### 移動區域
- 自動攻擊**關閉**時：非攻擊區的全螢幕任意位置拖動 = 搖桿（虛擬搖桿模式，按下位置為動態基準點）
- 自動攻擊**開啟**時：整個螢幕（含原本攻擊區）都是移動區，攻擊區不再偵測 tap

#### 攻擊區域（矩形，無邊框，⚔️ 置中透明度 0.2）
- 直向：右下角，底部往上 25% 高度 × 右側往左 50% 寬度
- 橫向：右下角，底部往上 50% 高度 × 右側往左 25% 寬度
- `_getAttackBtnPos()` 回傳矩形正中心座標

#### 自動攻擊指示器
- 手機版：攻擊區正中心顯示「⚔️ 自動」，32px，透明度 0.2
- 電腦版：畫布正中央顯示「⚔️ 自動」，100px，透明度 0.2

#### 事件攔截機制（v0.30.1 / v0.30.2 修復）
- `onStart` handler：`elementFromPoint` 偵測，觸點落在非 `gameCanvas` / `joystick-canvas` 的 HTML 元素上時直接 `continue`，不啟動搖桿也不 `preventDefault()`
- 器官 tooltip：換算 canvas 內部座標命中 `_organHitRegions` 時觸發 tooltip + 500ms 後 `hideTooltip()`，然後 `continue` 不啟動搖桿

### 自動攻擊功能（v0.30.0 新增）
- 儲存：`gameSettings.autoAttack`（boolean），任何版本更新**不重置**
- 觸發條件：`autoAttack === true` + 玩家有 `ORGANS[o.id].type === 'attack'` 的器官 + `_joyPaused() === false`
- 頻率：沿用 `playerAttack()` 原有 cooldown 邏輯（受 `attackSpeed` 控制）
- 電腦版：Z 鍵 toggle，toggle 後即時 `saveSettings()`
- Z 鍵不在以下狀態觸發：`organSelectionActive`、`settingsOpen`、`skillTreeOpen`、`gameOver`、`victory`

### 大腦 UI
- 角色正下方藍色充能條（`#4488FF`），寬度隨體型縮放
- 觸發 AoE 時播放衝擊波視覺效果，觸發後立刻歸零重新計時

### 靈敏知覺
- 算法：角度滑動窗口 + 效率值，支援環形地圖（`wrappedDistance`／`wrappedDelta`）
- 紅線從玩家連到最佳終點，路徑上果子顯示閃爍紅點，每幀更新

### 排行榜系統
- 後端：Supabase（免費，超出額度自動暫停不收費）
- 表欄位：`id, name, score, level, play_time, is_victory, boss_kill_time, created_at, version, version_order, difficulty`
- `fetchVictoryRecords(difficulty)`：勝利記錄，含難度篩選，排序 `version_order.desc → play_time.asc → boss_kill_time.asc`
- `fetchDefeatRecords(limit, difficulty)`：失敗記錄，含難度篩選，排序 `version_order.desc → play_time.desc → score.desc`
- `fetchAvailableDifficulties()`：查詢有資料的難度陣列（前端去重），供切換按鈕使用
- 分數上傳含 `difficulty` 欄位（`gameState.lastDifficulty || 'easy'`）
- 使用開發者模式的記錄不上傳（`gameState.devModeUsed = true`）
- 首頁右側 TOP10 浮窗（v0.40.0 起支援難度切換按鈕，`_top10Difficulty` 模組變數）
- 排行榜面板（`showLeaderboard()`）亦支援難度切換，`_lbDifficulty` 模組變數；兩者保持同步
- 趣味排行榜（v0.47.0）：`showFunLeaderboard(difficulty)`，5 類排名（最速通關、最速死亡、巨人獵人、殺手獵人、殺手克星）
  - `sessionStats` 新增欄位：`giantKills`（巨人獵人）、`killerKills`（殺手獵人）、`killerMaxLevel`（殺手克星）
  - 「🎲 種類」按鈕（`showLeaderboard()` 標題列）→ `showFunLeaderboard()`
  - 新增 Supabase 查詢：`fetchFunSpeedVictory`、`fetchFunSpeedDeath`、`fetchFunGiantKills`、`fetchFunKillerKills`、`fetchFunKillerMaxLevel`

### 真實遊玩時間（realPlayTime）
- `gameState.realPlayTime`：累積毫秒數，上傳時 `Math.floor(realPlayTime / 1000)` 轉秒
- `pausePlayTimer()` / `resumePlayTimer()`：累積式計時，只在真正遊玩時累加
- 技能點時間獎勵使用 `gameState.timeRemaining`（倒數計時），不使用 `realPlayTime`

### 版本更新公告系統（v0.42.0 新增）
- `config/patchnotes.js`：全域常數 `PATCH_NOTES`（陣列），最新版本置頂；欄位 `{ version, date, added[], fixed[], changed[] }`
- 首頁左上角 📋 更新按鈕（`#patch-notes-btn`，故事書按鈕正下方）→ `showPatchNotes()`
- 未讀標記：`lastSeenPatchVersion !== PATCH_NOTES[0].version` 時首頁 400ms 後自動彈出（新玩家跳過）
- `checkPatchNotesPopup()`：在 `showStartScreen()` 末尾呼叫

### 新手教學系統（v0.43.0 / v0.44.0 / v0.45.0 新增）

**第一階段（移動教學，v0.43.0）**
- `systems/tutorial.js`（IIFE 模組）；`showTutorial()` 公開入口
- 觸發：`initializeGame()` 結束後，無 `localStorage.tutorialCompleted` 時啟動
- 三步驟：①凍結+歡迎介面 → ②解凍+引導吃果子（金色光暈+虛線引導） → ③凍結+日夜說明
- 完成後寫入 `localStorage.tutorialCompleted`

**設定開關（v0.44.0）**
- `showSettings()` 輔助功能區塊新增「新手教學」開關，讀寫 `localStorage.tutorialCompleted`

**第二階段（戰鬥教學，v0.45.0）**
- 觸發：玩家第一次升級且 `tutorialCompleted` 存在、`tutorialCombatDone` 不存在
- `showOrganSelection()` 鎖定第一張攻擊器官（`tutorialOrganPhase = true`）
- 選完 → `spawnTutorialStump()`：玩家正前方 150px 生成棕色木樁（HP 30）
- `playerAttack()` 將木樁加入攻擊目標；死亡 → `handleTutorialStumpKill()`
- 完成後寫入 `localStorage.tutorialCombatDone`

**新增 gameState 旗標**（均在 `initializeGame()` 重置）：
`tutorialOpen`（整合至 `isGamePaused()`）、`tutorialOrganPhase`、`tutorialCombatActive`、`tutorialStump`

### 突變系統（v0.39.0 新增，systems/mutation.js）
- 突變面板：`showMutationPanel()`，開啟時暫停遊戲（`mutationPanelOpen = true`）
- `isGamePaused()` 和 `_joyPaused()` 均已加入 `mutationPanelOpen` 判斷
- 四個突變器官，等級總和顯示於左上角 ⚗️ 圖標（`#mutation-icon-row`），click → `showMutationPanel()`
- 紅點提示：`#mutation-red-dot`，有可升級時顯示
- 升級費用：`getMutationUpgradeCost()`
- 補償機制：`MUTATION_COMPENSATION_VERSION` 控制版本；`checkMutationCompensation()` 在 `initMutationData()` 末尾執行，執行一次後記錄避免重複
- 突變點數來源：擊殺生物累積；`corpseEaten=N` 時 N% 機率額外獲得 1~N 點（死亡時結算）
- 兌換按鈕（v0.47.0）：100 技能點 → 10 突變點（`showMutationPanel()` 底部按鈕）
- 初始化流程：`window.onload → initMutationData() → applyMutationEffects()`
- 套用順序：`initializeGame() → applySkillBonuses() → applyEvolutionEffects() → applyAllMutationBonuses()`

---

## 三、技術堆疊與風格規範

### 技術架構
```
語言：純 HTML + JavaScript + CSS，無框架
渲染：HTML5 Canvas 2D（遊戲世界）+ HTML div overlay（UI）

邏輯解析度：
  桌機：1600×900
  手機橫向：960×540（= 1600×900 × MOBILE_GAME_SCALE 0.6）
  手機直向：540×960（= 900×1600 × MOBILE_GAME_SCALE 0.6）

手機縮放：CSS transform: scale()，scale = vw / logicW
          MOBILE_GAME_SCALE = 0.6（定義在 _applyMobileScale() 上方）
          調整此值可統一縮放手機畫面，不需改其他系統

模組載入：傳統 <script src> 標籤，不使用 ES Modules
FPS：Fixed Timestep 60FPS（FIXED_DELTA = 1000/60）
速度數值：所有速度已乘以 3.0（180Hz 螢幕校正歷史遺留）
```

### 專案結構
```
index.html            → HTML 結構 + CSS + script 載入順序（205 行）
main.js               → isGamePaused / gameLoop / initializeGame / window.onload
                        pausePlayTimer / resumePlayTimer
VERSION_RULES.md      → 版本號更新規則
MAIN.md               → 完整模組架構、函式列表、跨模組依賴
CHANGELOG.md          → 所有版本紀錄（最新在最上方）
.claude/instructions.md → Claude Code 自動讀取規則

config/
  gameConfig.js       → GAME_INFO（版本號、SAVE_VERSION）、AUDIO_FILES
  organs.js           → ORGANS（12種普通）+ HIDDEN_ORGANS（4種隱藏）+ poisonSac 毒囊
  creatures.js        → CREATURE_CONFIG、ELITE_CONFIG、BOSS_CONFIG（生物/精英/Boss 數值）
  evolution.js        → EVOLUTION_PATHS（各路線 Lv1~5）、SKILLS（9種）、COMBOS（5種）
  patchnotes.js       → PATCH_NOTES（版本更新公告資料，最新版本置頂）
  supabase.js         → Supabase API（fetchVictoryRecords / fetchDefeatRecords / submitScore）
                        fetchFunSpeedVictory / fetchFunSpeedDeath / fetchFunGiantKills /
                        fetchFunKillerKills / fetchFunKillerMaxLevel（v0.47.0）

lang/
  zh-TW.js            → 繁體中文語言包
  en.js               → 英文語言包（fallback）
lang.js               → LANG_LIST、LANG 字典、applyLanguage()、t(key, params?)

systems/
  gameState.js        → DEFAULT_SETTINGS、gameState 物件、canvas/ctx、MAP 常數（MAP_WIDTH/HEIGHT/TILE_SIZE）
  utils.js            → drawArrow / drawHealthBar / drawNameTag / drawGlowEffect
  audio.js            → AudioManager（playMusic / playSfx / refreshMusicVolume）
  camera.js           → updateCamera / worldToScreen
  input.js            → handleKeyDown / handleKeyUp（含 Z 鍵自動攻擊 toggle）
  map.js              → generateTerrain / buildTerrainCanvas / drawTerrain（4D Tileable Noise）
  spawning.js         → 生物/果子/樹木生成
  player.js           → updatePlayerMovement / checkFruitCollision / 靈敏知覺算法
  tutorial.js         → showTutorial / spawnTutorialStump / handleTutorialStumpKill（新手教學 IIFE）
  combat.js           → playerAttack / applyDamageToPlayer / updateStatusEffects / 白骨系統
  organs.js           → showOrganSelection / handleEliteKill / applyOrganEffects
  evolution.js        → buildSkillTreeOverlay / upgradeSkill / applyEvolutionEffects / updateCorpseEating
  creatures.js        → updateNeutralCreatures / updateHostileCreatures
  elite.js            → spawnEliteCreature / updateEliteCreature / drawEliteArrow
  boss.js             → spawnBoss / updateBoss / showVictory
  mutation.js         → initMutationData / applyMutationEffects / applyAllMutationBonuses / showMutationPanel / getMutationUpgradeCost / checkMutationCompensation
  daynight.js         → getDayNightPhaseIndex / updateDayNightCycle / showGameOver
  leaderboard.js      → 排行榜面板 / 分數提交 / 難度狀態管理
  mobile.js           → 裝置偵測 / 手機縮放 / 搖桿 / 攻擊區 / 觸控疊加層
  hud.js              → drawGame 主渲染 / HUD 更新 / 小地圖 / 上方血條
  ui.js               → 面板系統（首頁 / 設定 / 地圖選擇 / 圖鑑 / 故事書 / 版本公告）
                        Tooltip / 語言切換 / 開發者模式

map/
  map.md              → 地形設計文件
  easymap.js          → EASY_MAP（簡單難度地形參數、生物倍率、精英怪配置）
```

### localStorage 已定義的 key
| Key | 說明 |
|-----|------|
| `playerSkills` | 技能樹等級（各技能 0~5） |
| `skillPoints` | 可用技能點 |
| `savedOrgans` | 死後保留的普通器官 |
| `savedHiddenOrgans` | 死後保留的隱藏器官 |
| `lastRunOrgans` | 上局所有器官記錄（首頁補選用） |
| `gameSettings` | `{ language, volume, keys, deviceMode, autoAttack }` |
| `SAVE_VERSION` | 目前為 `"1.1"`（不一致時清除 playerSkills / skillPoints / savedOrgans / savedHiddenOrgans） |
| `mutationData` | 突變器官等級和點數（不受 `SAVE_VERSION` 清除，永久保留） |
| `lastDifficulty` | 上一局選擇的難度（`'easy'`/`'normal'`），供頁面重整後恢復（v0.47.0 B1）|

### 開發規則
- `gameLoop` 裡絕對不能出現字面上的 `\n` 字符
- 每次修改完必須更新 `CHANGELOG.md` 和版本號（見 VERSION_RULES.md）
- 新增函式必須更新 `MAIN.md`
- 數值只在 `config/` 資料夾修改
- 不使用 ES Modules，全部用傳統 script 標籤
- 每次 commit 後必須執行 git push origin master

### 版本與部署
- 目前版本：**v0.47.0**

### Branch 工作流程
- `master`：主開發分支，所有日常開發在此進行
- `stable`：穩定版分支，測試通過無明顯 Bug 後由開發者手動要求同步
- 同步條件：開發者自行測試確認穩定，說「請同步 stable」才執行
- 日常 push 只推 master，不自動動 stable

- SAVE_VERSION：`"1.1"`
- GitHub：https://github.com/Resikiser97/silent-koel
- Vercel Master（測試）：silent-koel.vercel.app
- Vercel Stable（穩定）：silent-koel-git-stable-goblinnest-s-projects.vercel.app
- Claude Code 推送指令：`"C:\AI\Git\bin\git.exe" -C "c:\AI\VS CODE" push origin master`

### 重要提醒給接手的 AI
1. **開始任何工作前先讀取** `MAIN.md` 和 `CHANGELOG.md`（`.claude/instructions.md` 會自動觸發）
2. 所有速度數值已乘以 3.0（歷史補丁，Fixed Timestep 加入前為修正高刷新率螢幕速度偏快問題；現已基於此基準調整完畢，×3.0 不得移除，lang/zh-TW.js 速度描述與實際數值已一致，✅ 文案 Fixed，無需再處理）
3. 手機邏輯解析度由 `MOBILE_GAME_SCALE = 0.6` 控制，不是固定值，不要寫死
4. 手機版用 `gameState.isMobile` 和 `gameState.orientation` 判斷裝置和方向
5. 排行榜使用 Supabase，API 設定在 `config/supabase.js`
6. 開發者模式暗號：`77777778`，使用後 `gameState.devModeUsed = true` 禁止上傳排行榜
7. `realPlayTime` 是毫秒，上傳時用 `Math.floor(realPlayTime / 1000)` 轉秒
8. `resumePlayTimer()` 無條件啟動；`pausePlayTimer()` 有檢查 `_playTimerStart !== null`
9. 手機版 `onStart` handler 邏輯：HTML UI 元素觸點 → `continue`；器官 tooltip 命中 → 顯示 tooltip（若 `showOrganTooltip` 開啟）→ **繼續執行搖桿啟動邏輯**（v0.41.2 起移除 continue，不造成死區）；其他 gameCanvas 觸點 → 搖桿啟動
10. `gameSettings.autoAttack` 任何版本更新都**不重置**（不受 `SAVE_VERSION` 控制）
11. 毒傷 tick 使用 `c.lastPoisonTick += 1000`（不是 `= now`），避免累積誤差

---

## 四、接下來的下一步行動

### 未來待開發功能
- [x] 新手教學系統（v0.43.0 移動教學 / v0.44.0 設定開關 / v0.45.0 戰鬥教學，共三版完成）
- [ ] 海洋和沙漠專屬生物差異化（目前只有顏色不同）
- [ ] 角色美術素材替換（目前用圓形代替）
- [ ] 遊戲封面圖（itch.io 上架需要）
- [ ] itch.io 上架
- [ ] 普通／困難／地獄難度地圖