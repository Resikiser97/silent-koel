## v0.2.0.0

# CHANGELOG — 只吃不叫的噪鵑

---

## v0.2.0.0 - 2026-06-07

### 新增/重寫
- systems/creatures.js 巨人/Alpha 系統完整重寫：
  - 巨人化後不再強制成為隊長，改為「無隊伍獨立巨人」
  - 兩隻無隊伍獨立巨人（同族同生態）距離 ≤ 300px 相遇 → HP 較高者升格 Alpha（每3秒掃描）
  - Alpha 死後掃描全圖：隊伍 ≥ 2 隻的巨人隊長中 HP 最高者繼承為新 Alpha
  - 只有「隊伍 ≥ 2 隻（含隊長）的巨人隊長」才能被選為 Alpha（單人隊伍不觸發）
- systems/creatures.js 巨人卡死修復：
  - _seekingFruit 吃到果子後若 hp > maxHp * 0.5 立刻退出，不繼續找果子
  - _seekingFruit 開始計時 _seekingFruitStart，超過 5 秒強制退出
  - 不同隊伍巨人距離 < (radius + 對方radius + 20) 時施加推開力 2px

---

## v0.1.9.0 - 2026-06-07

### 新增
- main.js 新增 Loading 畫面啟動流程，遊戲正式初始化前顯示全黑載入畫面、版本號、作者與音效預載進度條
- systems/audio.js 新增 `preloadAllSfxBuffers(onProgress)`，在 AudioContext 可用時預載所有非音樂音效 AudioBuffer，完成後才淡出 Loading 並啟動遊戲
- systems/ui.js / systems/evolution.js 的開始遊戲入口改走 `startGameWithLoading()`，確保首頁、故事導引、技能樹開始都會先顯示 Loading

---

## v0.1.8.2 - 2026-06-07

### 修復
- systems/daynight.js 白天精英怪消散時同步清除上方血條追蹤狀態，避免 UI 殘留
- systems/hud.js 上方血條位置改為同時避開左上角 UI 與右上角小地圖，修正手機版血條卡在兩者中間
- systems/hud.js 上方血條名稱優先使用 target.label，修正精英怪死亡淡出期間顯示「未知」

---

## v0.1.8.1 - 2026-06-07

### 修復
- systems/creatures.js 鬣狗隊名位置移到生物圓圈下方（+14px），修正隊名與名字視覺重疊導致的名字偏移問題

---

## v0.1.8.0 - 2026-06-07

### 新增
- config/patchnotes.js 補充 v0.1.3.3 ~ v0.1.7.2 所有版本的玩家公告，合併為 v0.1.8.0 公告條目

### 版本管理
- GAME_INFO.version 升至 v0.1.8.0

---

## v0.1.7.2 - 2026-06-07

### 修復
- 毒霧隼攻擊 3 次後卡死：puddle 過期時遞減 `_venomPuddleCount`，elite.js 加入獨立 puddle 傷害 tick + 過期清理，不再依賴 boss.js desert 路徑
- 幽靈隼不攻擊：aggroRange 擴大（specterFalcon 1400 / shadowFalcon 900 / venomFalcon 1050），提供追擊緩衝區
- 幽靈隼蓄力中玩家跑出射程後 falcon 凍結：蓄力進行中（`_aimTarget` 存在）允許跨越 attackRange 完成射擊；子彈 maxRange 改為 `attackRange × 2`
- 黑色獵人 Phase 1/3 蓄力後不開槍：`aiming` state 加入 chasing/strafing 條件，確保後續幀繼續執行蓄力完成邏輯
- 黑色獵人不攻擊：Phase 1 triggerRange 1500→1800，Phase 2 攻擊觸發距離 800→1000

### 重構（Codex）
- elite.js `initEliteOrder()`：改用 mapSeed 決定性亂序，三隼/三犬同局統一（不再每夜隨機）
- boss.js 黑色獵人血條：顯示當前 HP 數字 + 下一管預覽色彩
- hud.js 精英怪上方血條名稱：改用 `elite.label` 顯示正確名稱

---

## v0.1.7.1 - 2026-06-07

### 修復
- boss.js `_screenPos is not defined`：
  `_drawHunterAimingWarning()` 改用 `worldToScreen()` 取得螢幕座標
  （與 elite.js 同類問題，ESM 遷移遺漏）

---

## v0.1.7.0 - 2026-06-07

### 重構
- Web Audio API 完整遷移（audio-refactor 分支）：
  - AudioContext + masterGain / musicGain / sfxGain 架構
  - 音樂系統接 GainNode（introTheme + playMusic）
  - 音效改用 AudioBuffer + AudioBufferSourceNode
  - iOS unlock：user gesture 時 audioContext.resume()
  - 保留 HTMLAudio pool 作為 fallback

### 修復
- elite.js `_screenPos is not defined`：
  `_drawHunterElite()` 改用 `worldToScreen()` 取得螢幕座標

---

## v0.1.6.3 - 2026-06-07

### 重構
- Web Audio API 遷移（方案二，audio-refactor 分支）：
  - Part A：建立 AudioContext + masterGain / musicGain / sfxGain
  - Part B：音樂系統接 GainNode（introTheme + playMusic）
  - Part C：音效改用 AudioBuffer + AudioBufferSourceNode
  - iOS unlock：user gesture 時呼叫 audioContext.resume()
  - 保留 HTMLAudio pool 作為 AudioBuffer 未就緒時的 fallback

---

## v0.1.6.2 - 2026-06-07

### 修復
- iOS Safari 音樂開關修復（方案 1）：
  `refreshMusicVolume()` 改用 pause/play 控制，不依賴 volume = 0
  `playMusic()` fade-in 每 tick 重新讀取音量目標
  音樂關閉狀態下 `playMusic()` 不呼叫 play()，等開啟時恢復

---

## v0.1.6.1 - 2026-06-06

### 效能優化
- Stage E：移除生物名稱標籤 shadowBlur，改用 strokeText 描邊
- Stage E：名稱標籤改用 viewport culling，移除 300px 距離剔除

### 調整
- getGameFont() 強制大字粗體（size + 8px，永遠 bold）
- 浮動文字永遠大字 + strokeText 描邊
- fontBoldLarge 開關改為「無字天書/Greek」，開啟後隱藏所有遊戲文字（保留血條）
- 移除 fontBoldLargeHint 和相關 DOM 元素

---

## v0.1.6.0 - 2026-06-06

### 重構
- Stage C Slice 3：建立 `stats/index.js`，sessionStats 讀寫統一（`resetSessionStats` / `getSessionStats` / `incrementStat` / `updateStatMax`）；`main.js`、`systems/combat.js`、`systems/player.js`、`config/supabase.js`、`systems/leaderboard.js` 全部改用 stats 入口
- Stage C Slice 2：`systems/evolution.js` fromHome/forceStart 與 postGame 的 mutationSkills 載入改呼叫 `initMutationSkills()`，不再直接 `Object.assign` 寫入 `gameState.mutationSkills`
- 測試：新增 `tests/stats/stats.test.js`（9 tests），修正 `vi.hoisted` hoisting 問題；總計 64/64 通過

---

## v0.1.5.2 - 2026-06-06

### 修復
- **阿奇爾 Charge Attack 音效**：第三格充能（chargeConsumed >= 3）播放 `archerAttackCrit`，其他充能階段播放 `archerAttackNormal`（`main.js` mouseup 事件）
- **阿奇爾死亡音效**：死亡時播放 `archerDeath` 而非通用 `death`（`systems/evolution.js` showSkillTree）
- **再來一局角色重置**：autostart 路徑補上從 localStorage 還原 `lastCharacter`，修復再來一局後角色永遠顯示噪鵑的問題（`main.js` window.onload）

---

## v0.1.5.1 - 2026-06-06

### 修復
- **BUG-01**：阿奇爾角色音效誤植修復，4 個呼叫點加入角色判斷（`selectedCharacter === 'archerfish'`）
  - `systems/combat.js`：受傷音效路由（`hurt` → `archerHurt`）
  - `systems/combat.js`：攻擊/暴擊音效路由（`attackNormal/attackCrit` → `archerAttackNormal/archerAttackCrit`）
  - `systems/player.js`：遠程攻擊音效路由（`attackNormal` → `archerAttackNormal`）
  - `main.js`：滑鼠點擊攻擊音效路由（`attackNormal` → `archerAttackNormal`）
- **TODO-UI-01**：精英怪公告文字手機版截斷修復（`systems/hud.js`）
  - `VIEW_W < 700` 時字體從 36px 縮小為 22px
  - `ctx.fillText` 加入 `maxWidth = VIEW_W * 0.9` 防止畫布邊緣截斷

---

## v0.1.5.0 - 2026-06-06

### 架構
- ESM 全模組化完成（Stage 0–3）：37 個 JS 檔案從全域 `<script src>` 改為 `import`/`export`
- `index.html` 改為單一 `<script type="module" src="./main.js">` 入口
- `storage/index.js`：集中所有 `localStorage` key 定義與讀寫 helper
- `systems/audio.js`：AudioManager 統一音量狀態（`_vol`、`loadVolume`、`setVolume`、`serializeVolume`）
- `systems/evolution.js`：`buildSkillTreeOverlay` 拆成 coordinator + 4 個 private sub-functions
- `mutation.js` ↔ `evolution.js` 循環依賴改用 `CustomEvent` 解耦
- `systems/ui.js`：`showSettings()` 移除 `fromHome` 參數，改用 DOM 自動偵測
- 結算畫面統一：新增 `buildEndGameOverlay()` 共用勝利/死亡外殼

---

## v0.1.4.3 - 2026-06-05

### 效能
- `showXPPopup` 改為呼叫 Canvas `showFloatingText`，移除 DOM XP popup pool
  - 完全移除 `_XP_POOL_SIZE`、`_xpPopupPool`、`_xpPoolReady`、`_initXpPool()`
  - `showXPPopup` 直接呼叫 `showFloatingText`，吃果子浮字納入 Canvas 批次繪製
  - 移除 `main.js` 中的 `_initXpPool()` 呼叫
- AudioManager 音效節流：一般音效 100ms，hurt/attack/playerAttack 150ms
  - 新增 `_sfxLastPlayed` 快取記錄上次播放時間
  - `play()` 開頭加入節流判斷，避免多隻生物同幀同時播放音效造成手機音訊壓力

---

## v0.1.4.2 - 2026-06-05

### 效能
- `showFloatingText` 從 DOM pool 改為 Canvas 批次繪製
  - 完全移除 `_FLOAT_POOL_SIZE`、`_floatPool`、`_floatPoolReady`、`_initFloatPool()`、`resetFloatPool()` 及 `.float-text-animate` CSS
  - `gameState.floatTexts` 陣列統一收集浮字，`drawGame()` 末段一次批次繪製，無多層 text-shadow
  - 手機上限 12 個，桌機 20 個；100ms 內同位置同顏色數字自動合併
  - 字大又粗模式：+8px + 簡單黑色描邊一次（取代 4 層 CSS shadow）

---

## v0.1.4.1 - 2026-06-05

### 效能
- `updateTreeFruitProduction` 節流改為累積時間補給：節流前累積 `elapsed`，觸發時一次把 elapsed 補給 `tree.fruitTimer`，果子生產速度恢復正常（修復節流導致速度變 1/30 的副作用）
- `showFloatingText` 移除 `void el.offsetWidth` 強制 reflow，改用 `requestAnimationFrame` + CSS class `.float-text-animate` 切換觸發 animation，改善 iOS Safari 連續浮字時的 spike
- AudioManager 預熱清單修正：移除不存在的 `'attacked'`，補上實際播放的 `'hurt'`，避免第一次被打時 lazy 建立 pool 造成卡頓

---

## v0.1.4.0 - 2026-06-05

### 效能
- `showFloatingText` 改用 DOM 物件池（pool size 20），避免每次 `createElement` + CSS animation + `remove`，大幅改善手機卡頓
  - 新增模組頂部 `_FLOAT_POOL_SIZE`、`_floatPool`、`_floatPoolReady` 三個常數/變數
  - 新增 `_initFloatPool()`：第一次呼叫 `showFloatingText` 時 lazy init，預建 20 個 `div` 並 append 至 `#ui-overlay`
  - `showFloatingText` 改為從 pool 取閒置 slot，重置 animation 後重複使用，pool 滿時直接跳過不卡主執行緒
  - 新增 `resetFloatPool()`，在 `initializeGame()` 每局開始時清除所有 timer 並重置 pool 狀態

---

## v0.1.3.9 - 2026-06-05

### 效能
- AudioManager 音效改用物件池，避免 iOS Safari cloneNode 卡頓
  - 新增 `_sfxPools`（每個音效 4 個實例）與 `_getPooledAudio(key)`
  - `play()` 改為從池取閒置實例，不再每次 `cloneNode()`；音量為 0 時直接跳過
  - `init()` 預熱 `eatFruit`、`levelUp`、`attacked` 三個常用音效池
- `updateTreeFruitProduction` 改為每 500ms 執行一次（約每 30 幀）
  - 新增模組頂部 `_treeProductionTimer` 計時器
  - 新增 `resetTreeProductionTimer()`，在 `initializeGame()` 每局開始時重置
- `updateMinimapFog` 改為每 3 幀更新一次
  - 新增模組頂部 `_fogFrameCount` 計數器
  - 新增 `resetFogFrameCount()`，在 `initializeGame()` 每局開始時重置

---

## v0.1.3.8 - 2026-06-05

### 效能
- `worldToScreen` 和 `wrappedDelta` 改為物件重用，大幅減少每幀 GC allocation，改善手機 spike lag
  - `camera.js` 頂部新增 `_screenPos` 和 `_delta` 重用物件
  - `worldToScreen` 直接寫入 `_screenPos` 並回傳同一物件，不再每次 `return { x, y }`
  - `wrappedDelta` 直接寫入 `_delta` 並回傳同一物件，不再每次 `return { dx, dy }`
  - 修正所有「連續呼叫後同時使用兩個結果」的呼叫點（共 5 處），立即萃取數值防止物件被覆蓋：
    - `boss.js` `_drawSharkChargeArrow`：`fromSx/fromSy` + `toSx/toSy`
    - `boss.js` `_drawHunterAimingWarning`：`bsx/bsy` + `tsx/tsy`
    - `elite.js` `_drawHunterElite`：簽名改為傳入數值 `(sx, sy)`，內部瞄準線改用 `tsx/tsy`
    - `hud.js` `_drawArcherLockOn`：`psx/psy` + `tsx/tsy`
    - `hud.js` `drawGame` 中 `ps`：新增 `psx/psy` 快取，閃現特效改用 `sax/say/sbx/sby`

---

## v0.1.3.7 - 2026-06-05

### 修復
- 靈敏知覺三等級改用快取，限制重算頻率，大幅減少手機 spike lag
  - Lv1 果子路徑（`findBestPerceptionPath`）：距上次計算 >500ms、果子數量改變、或玩家移動 >50px 才重算
  - Lv2 最近屍體：距上次計算 >300ms 或屍體數量改變才重算
  - Lv3 最近白骨：距上次計算 >300ms 或白骨數量改變才重算
  - 新增模組頂部 `_perceptionCache` 快取物件
  - 新增 `resetPerceptionCache()`，在 `initializeGame()` 每局開始時重置快取

---

## v0.1.3.6 - 2026-06-05

### 修復
- `tutorial.js` `_highlightDayNight` setTimeout 記憶體洩漏：改用可清除的 timer ID（`_dnFlashTimer`），停止條件時正確 clearTimeout，不再永久在背景跑
- 新增 `_clearDnFlash()` 統一清除 timer 與 DOM 樣式，在 `_endTutorial()`、`showTutorial()` 頭部呼叫
- 新增 `resetTutorial()`：`initializeGame()` 每局開始時強制重置教學狀態，防止跨局 timer 殘留導致手機越來越卡

---

## v0.1.3.5 - 2026-06-05

### 修復
- `updateUI` dirty check：每幀 DOM 操作從 6~9 次降為只在值改變時更新，減少手機卡頓
  - 新增模組頂部 `_uiCache` 快取物件，記錄上次寫入的 xp 文字、xp 條寬、HP、生態圈、時間、遊玩時間、變異等級、紅點
  - `_drawHpHearts` 只在 `player.hp` 或 `player.maxHp` 改變時重繪
  - 新增 `resetUICache()`，在 `initializeGame()` 每局開始時重置快取

---

## v0.1.3.4 - 2026-06-04

### 修復
- 首頁技能樹的隱藏器官繼承選擇永遠只能選一個（`homeSelHidden` 單選邏輯）
  - 改為陣列多選，正確讀取 `hiddenOrganLimit`（回憶器官等級 + 1）
  - 標題動態顯示可繼承數量（上限 > 1 時顯示「選擇繼承最多 N 個」）
  - 與 postGame 路徑的選擇邏輯保持一致

---

## v0.1.3.3 - 2026-06-04

### 修復
- 回憶器官升級後 postGame 技能樹強大器官選擇上限未更新
  - `buildSkillTreeOverlay` postGame 模式加入 localStorage 強制重載 `mutationSkills`
  - 移除 `_checkAndRepairMutationSkills` 在每次開啟變異面板時的誤呼叫（保留 `initMutationSkills` 載入時的驗算）
  - 移除 v0.1.2.0 遺留的 `[Debug]` console.log
- 音量設定刷新後歸回預設值
  - `window.onload` 補上 `loadSettings()`，確保頁面載入時立即讀取已存設定
  - `loadSettings()` volume 改為深度合併（`Object.assign` 防禦性寫法）
  - `playIntroTheme()` 改為即時讀取 `gameState.settings.volume`，不再使用一次性快照

---

## v0.1.3.1 - 2026-06-04

### 修復
- **變異技能點異常**：升級回憶器官後技能點歸零且等級未保存（出了點數拿不到效果）
  - `_syncMutationSkillPoints()` 防止 `earned - spent` 為負時強制覆蓋現有點數
  - `initMutationSkills()` 正確還原 localStorage 的 `_points` 快照，避免每次重算
  - 新增 `_checkAndRepairMutationSkills()`：啟動時及開啟變異面板時自動驗算，發現異常自動退還所有技能點並顯示 ⚠️ 提示

### 新增（合併自 v0.1.3.0）
- 趣味排行榜：🍎 最佳果王（單局吃果子數最多）
- 趣味排行榜：🏹 最強獵戶（單局普通生物擊殺數最多，不含精英/Boss/巨人/殺手）
- `sessionStats` 新增 `fruitsEaten` 和 `normalKills` 計數（每局重置）
- Supabase leaderboard 表新增 `fruits_eaten` / `normal_kills` 欄位對應

---

## v0.1.3.0 - 2026-06-04

### 新增
- 趣味排行榜：🍎 最佳果王（單局吃果子數最多）
- 趣味排行榜：🏹 最強獵戶（單局普通生物擊殺數最多，不含精英/Boss/巨人/殺手）
- `sessionStats` 新增 `fruitsEaten` 和 `normalKills` 計數（每局重置）
- `submitScore` 自動補填 `fruits_eaten` / `normal_kills` 至 Supabase leaderboard 資料表

---

## v0.1.2.0 - 2026-06-04

### 修復
- **精英怪 UI 名字標籤**：確認 `drawEliteCreature()` 已正確讀取 `elite.label`（Hunter Elite 顯示「★ 幽靈犬」等正確名稱），無需修改
- **玩家毒傷 tick 未處理**：`updateStatusEffects()` 末尾新增玩家毒傷 tick，毒霧犬咬中後毒效果現可正常生效
- **輔助功能設定在遊戲結束時未儲存**：`showSkillTree()` 與 `showVictory()` 開頭加入 `saveSettings()`，確保死亡/勝利前所有設定存入 localStorage
- **回憶器官等級在 postGame 未正確讀取**：`showSkillTree()` 加入 `initMutationSkills` 保障，`buildSkillTreeOverlay` 加入 `[Debug]` log 供確認

### 調整
- **肉食性生物進食時 Aggro 範圍從 ×1.5 改為 ×0.5**：讓生物能順利進食觸發殺手化
- **草食性進化 Lv4**：巨人化生物（含 Alpha）對玩家傷害 -15%
- **草食性進化 Lv5**：巨人化生物（含 Alpha）對玩家傷害 -30%

---

## v0.1.1.3 - 2026-06-04

## v0.1.1.3 - 2026-06-04

### 修復
- **黑色獵人三形態攻擊完全失效（aggroRange 覆蓋 Bug）**
  - Phase 1/3 的 `'aiming'` 和 Phase 2 的 `'pumping'` 每幀被 `if (dist < aggroRange)` 覆蓋為 `'chasing'` → Boss 永遠不開槍、Phase 2 音效每幀播放
  - 修正：各 Phase 加入 `state !== 'aiming'` / `state !== 'pumping'` 保護
- **黑色獵人 Phase 1/3 瞄準線在螢幕外不可見**
  - Boss 在 1350px 繞圈超出螢幕，drawBoss cull 把雷射線一起過濾掉
  - 修正：新增 `_drawHunterAimingWarning()` 在 cull 前呼叫，玩家頭上加準心鎖定環
- **幽靈隼蓄力時繼續 kiting 可能跑出攻擊範圍**
  - 設計應為「0.3 秒站立蓄力」，現實是邊蓄力邊後退
  - 修正：蓄力中（`_aimTarget` 存在）提前 return，凍結移動
- **幽靈隼瞄準線太細幾乎不可見**
  - `lineWidth 1.5` 無 shadow → 難以察覺
  - 修正：強化為紅色虛線 + glow + 目標準心，與 Boss 雷射同等視覺強度
- **精英怪箭頭在 Boss 螢幕外時被抑制**
  - `drawEliteArrow` 當 Boss off-screen 時也不畫精英箭頭，Phase 1 期間玩家找不到隼
  - 修正：移除 Boss off-screen 抑制，精英箭頭獨立顯示

### 新增
- `docs/BOSS_RANGED_DESIGN_TRAPS.md`：記錄 6 種 Boss / 遠程怪設計陷阱及解法，含設計 Checklist

---

## v0.1.1.2 - 2026-06-04

### 修復
- **黑色獵人三形態攻擊完全失效**（根本原因：`aggroRange` 覆蓋 Bug）
  - 每幀 `if (dist < aggroRange) boss.state = 'chasing'` 無條件覆蓋戰鬥中間狀態，導致 `aiming`（Phase 1/3）被打斷每幀重置、`pumping`（Phase 2）`_pumpUntil` 每幀重設永遠不觸發開槍
  - 修正：各 Phase aggroRange 判斷加入 `boss.state !== 'aiming'` / `boss.state !== 'pumping'` 防護
- **黑色獵人 Phase 1/3 雷射瞄準線螢幕外不可見**
  - Boss 以 idealDist 1350px 繞圈，超出螢幕可視範圍，`drawBoss` cull 後雷射線不被繪製
  - 修正：新增 `_drawHunterAimingWarning()` 在 cull 前呼叫，含：紅色虛線從 Boss 指向玩家（螢幕外也畫）＋玩家頭上脈動準心鎖定環
  - 移除重複的 `_drawHunter` 內舊版雷射線代碼

---

## v0.1.1.1 - 2026-06-04

### 修復
- 毒霧隼達到 3 個毒霧上限後，`attackCooldown` 未重置導致每幀觸發攻擊判斷，kiting 無停頓連續後退（逃跑不攻擊）
- 毒霧隼達上限後補設 `_postShotTimer`，防止毫無停頓的後退循環
- 毒霧飛行毒球改用 `_venomFirePos`（發射瞬間位置）作為插值起點，避免隨 elite 移動而抖動
- 毒霧飛行毒球視覺強化：外層光暈半徑 14px + 內核亮綠半徑 7px，`#00FF66` 強光暈（原為暗色 8px）
- 腐蝕液體視覺強化：透明度由 0.35 → 最高 0.55 + 淡入淡出，加上亮綠色邊框 glow

---

## v0.1.1.0 - 2026-06-04

### 修復
- 黑色獵人血管標記顯示錯誤（x5 顯示為 x4，已修正為正確管數）
- 黑色獵人第一形態及第三形態 Sniper 紅色雷射瞄準線不顯示（重寫為從 Boss 中心至目標的精確線段）
- 三隼子彈缺少 type 欄位：幽靈隼（單發）現正確標記為 `sniper`，暗影隼散彈保持 `shotgun_pellet`
- 毒霧隼攻擊飛行軌跡視覺缺失（補上暗綠色插值毒球，帶霧氣光暈）
- 毒霧隼落地腐蝕液體在困難地圖未繪製（在 hud.js 補上 venomFalcon puddle 獨立繪製邏輯）
- 第三形態融合技瞄準時補上 5 條橘色隨機方向散射預警線

---

## v0.1.0.3 - 2026-06-03

### 修復

#### 平衡性修復

- **擊殺 XP 公式修正**（`systems/combat.js`）：`handleKill()` 的 hostile 擊殺 XP 公式從 `Math.min(80, 30 + Math.round((maxHp/50) * 50))` 改為 `Math.min(80, 30 + Math.round((maxHp/50) * 10))`，移除舊公式導致幾乎所有難度肉食怪都觸發 cap 80 的問題，XP 現在隨 HP 動態變化（簡單約 40、普通約 45、困難約 55）

- **肉食性怪物夜晚增強**（`systems/spawning.js`）：`_makeCarnCreature()` 新增夜晚倍率計算，補充生成的肉食怪依當前夜晚數套用 HP/攻擊 `×1.2^夜`、速度 `×1.1^夜`，第1夜約 +20%/+10%、第3夜約 +73%/+33%；草食性生物不受影響

- **簡單難度 Boss 速度修正**（`map/easymap.js`）：三隻 Boss 速度從地圖設定的過低值（1.0/1.3/1.2）修正為與 `BOSS_CONFIG` 一致的正確值（黑熊 3.0、大白鯊 3.9、蠍王 3.6）

- **精英怪 HP 套用地圖難度倍率**（`systems/elite.js`）：Easy/Normal 地圖的三犬/三隼精英怪 HP 計算新增乘上 `creatureStrength.hostile.hpMultiplier`，修正普通難度精英 HP 與簡單難度相同的問題（普通第1夜 250 → 375、第3夜 500 → 1500）；困難地圖維持固定數值不變

- **隱藏器官掉落 Bug 修復**（`systems/organs.js`）：`handleEliteKill()` 的 Hunter 精英怪分支（`isHunterElite`）在呼叫 `_handleHunterEliteKill()` 後補上隱藏器官掉落判斷，修復 v0.1.0.2 起三犬/三隼擊殺後完全不掉落隱藏器官的問題

---

## v0.1.0.2 - 2026-06-03

### 新增
- **變異面板左欄整合**（`systems/evolution.js`）：`_buildMutationSkillContent()` 左欄頂部新增可用變異點顯示（`可用變異點：N`）；底部新增兌換按鈕（100 技能點 → 10 變異點），兌換後即時 replaceChild 重建面板

### 修復
- **變異技能點 NaN 完整修復**（`systems/mutation.js`、`systems/evolution.js`）：`_syncMutationSkillPoints()` 在 `mutationData` 尚未初始化時補設預設值 0；`buildSkillTreeOverlay()` 開頭強制呼叫 `_syncMutationSkillPoints()`；技能點數顯示加入防呆（`?? 0`）；器官升級按鈕改為 replaceChild 方式重建面板確保點數即時刷新
- **首頁路徑變異點顯示修復**（`systems/evolution.js`）：`buildSkillTreeOverlay(fromHome)` 的 localStorage 同步區塊補讀 `mutationData` 和 `mutationSkills`，確保首頁進入與 postGame 路徑讀取相同資料；`getMutationUpgradeCost` 參數由錯誤的 `def.id`（字串）改為 `lv`（等級數字），消除升級費用 NaN 顯示
- **返回技能樹按鈕重複 🌿 修復**（`systems/evolution.js`）：切換至變異技能樹時，按鈕文字從 `🌿 🌿 技能樹` 改為 `🌿 技能`
- **Easy/Normal 三犬精英怪血量修復**（`systems/elite.js`）：`_spawnHunterElite()` 改依地圖 `elites` 倍率動態計算 HP/傷害/速度（Easy 第一夜 HP 從固定 480 → 正確的 250）
- **黑色獵人 Boss 數值補入**（`map/hardmap.js`）：`hp: 800`、`speed: 4.0`、`damage: 45`（原為 null）
- **困難地圖草食性生物傷害倍率修復**（`systems/spawning.js`）：`_makeHerbCreature()` 的 damage 補乘 `str.damageMultiplier`，與 HP/速度計算一致

---

## v0.1.0.1 - 2026-06-03

### 新增
- **GOBLIN NEST Splash 畫面**（`systems/ui.js`、`main.js`）：啟動時顯示開發者品牌頁，點擊後播放 Intro Theme 並進入首頁
- **首頁背景音樂**（`config/gameConfig.js`、`systems/audio.js`）：`playIntroTheme()` / `stopIntroTheme()`；進入遊戲時自動停止
- **首頁公告標籤**（`systems/ui.js`）：標題右上側旋轉印章，交替顯示「巨人覺醒！」「獵人入侵！」

### 調整
- 變異技能樹按鈕移至技能樹 Header 右側；面板改為左右兩欄（左：變異器官、右：技能點/技能）
- Splash 標題改為立體陰影樣式

### 修復
- TOP10 難度切換順序固定為 簡單→普通→困難，不再依賴 DB 查詢
- 技能樹 Header 重複 🌿 emoji 修復
- 變異技能點升級費用 NaN 修復（`sk.level` 空值防呆）
- 切換變異面板後返回技能樹佈局還原修復（`display:flex` 明確設定）

---

## v0.1.0.0 - 2026-06-03

### 新增
- **困難難度地圖**（`map/hardmap.js`）：生物強度 ×2.5、侵略距離 600、精英怪與 Boss 不回血
- **黑色獵人 Boss**（`systems/boss.js`）：困難地圖專屬，5管血條制；三形態（狙擊/散彈/融合技）；牛仔帽+槍 Canvas 外觀；台詞字幕系統；死亡獎勵 +1000XP / +5技能點 / +5變異點；每管擊破 +30 秒遊戲時間（最多 +120 秒）
- **靜音獵隊精英怪**（`systems/elite.js`）：困難地圖三隼（幽靈隼★/暗影隼★★/毒霧隼★★★）；普通/簡單地圖三犬（幽靈犬/暗影犬/毒霧犬）；出場廣播字幕 + 警報音效
- **趣味榜「🎯 獵人終結者」**（`config/supabase.js`、`systems/leaderboard.js`）：困難地圖最快擊殺黑色獵人
- **音效系統擴充**（`config/gameConfig.js`）：黑色獵人（18 組）、三隼（15 組）、三犬（8 組）、阿奇爾（5 組）音效

### 調整
- 地圖選擇困難難度正式接入 `HARD_MAP`（`systems/ui.js`）
- 黑色獵人使用獨立主題曲 `Super boss.mp3`
- 所有 Boss 死亡路由改為統一 `handleBossKill()`，支援多管血條（`systems/combat.js`、`systems/player.js`）

---

## v0.0.69.0 - 2026-06-03

### 新增
- **變異技能樹**（`systems/evolution.js`、`systems/mutation.js`、`systems/gameState.js`、`lang/`）：技能樹面板右上角新增「⚗️ 變異」按鈕；`_showMutationSkillPanel()` 子面板；「回憶器官」技能（0/3，每等 +1 隱藏器官保留）；`_upgradeMutationSkill()`；技能點每 50 變異總等級 +1；`DEFAULT_MUTATION_SKILLS`、`initMutationSkills()`、`_saveMutationSkills()`、`_syncMutationSkillPoints()`；隱藏器官選擇改為多選（上限依 recallOrgan 等級）
- **困難難度解鎖**（`systems/ui.js`）：`showMapSelect()` 中 hard locked 改為 false
- **第二章劇情**（`systems/ui.js`）：`showGuideStory()` 加入章節 Tab 導航；`_getGuideStoryPages()` 新增 4 頁（第三章獵人的足跡 × 3 + Coming Soon 動態頁）；`renderPage()` 支援 `customRender` 回呼；`chapter2Unlocked` localStorage 控制解鎖
- **通關解鎖記錄**（`systems/boss.js`）：普通難度通關寫入 `chapter2Unlocked: 'true'`
- **localStorage 通關統計**（`systems/boss.js`）：`_recordClearStats()`、`_recordBossKill()`；通關時記錄難度 / 角色 / Boss 擊殺次數

---

## v0.0.68.0 - 2026-06-03

### 修復
- **生物體型隨視野縮放修復**（`systems/creatures.js`、`systems/boss.js`、`systems/hud.js`）：`drawCreatureShape`、`_drawCreatureGlow`、`drawNeutralCreatures`、`drawHostileCreatures`、`drawBoss`、`drawBossShape` 及玩家繪製均改為 `radius * cameraZoom`；血條 Y 偏移、名字/隊伍標籤 Y 偏移同步修正；攻擊範圍圈縮放正常（v0.0.66.0 已修，本次未重複套用）
- **排行榜舊版本號壓制新版修復**（`systems/leaderboard.js`）：三碼舊格式（如 v0.65.0）`version_order` 強制回傳 0，不再覆蓋四碼新版排名

### 新增
- **首頁按鈕 Hover 效果**（`systems/ui.js`）：開始遊戲、技能樹、圖鑑、排行榜、設定五個按鈕加入 scale/顏色/陰影 hover 動畫；手機版改為 touch 縮放回饋；新增 `_addMenuHover()` helper
- **聊天室 `[c=crim]` 深紅色**（`systems/chat.js`）：新增 `crim`（`#C62828`）至一般玩家可用色；顏色面板加入「深紅字」按鈕；加入 `_COLOR_MAP` 統一管理色碼
- **巨人跨物種組隊**（`systems/creatures.js`）：招募條件改為「雙方 diet === 'herbivore'」，不再限同物種同生態；上限/Alpha 觸發機制不變
- **鬣狗隊名標籤**（`systems/creatures.js`、`main.js`）：新增三國武將名稱池（20名）`_HYENA_PACK_NAMES`；每個 packGroup 首次組隊時分配隊名；名字下方顯示 `曹操(2/3)` 格式標籤；遊戲重置時清空已用名稱

### 調整
- **巨人隊名改為仿製詞**（`systems/creatures.js`）：`_PACK_NAMES` 全部改為仿製詞（如 SKT→SK-Tea、T1→T-One），避免侵權
- **巨人擊殺獎勵上調**（`systems/combat.js`）：普通巨人 XP 60→100；Alpha XP 200→300；Alpha 變異點保底 +1→+2；額外掉落機率 10%→20%、數量 1~3→2~6

---

## v0.0.67.1 - 2026-06-02

### 調整
- **圖鑑生物百科重新排序**（`config/compendium_data.js`）：精英怪移至最前（特殊生物優先），一般生物改依地區排列（森林→海洋→沙漠）
- **圖鑑遊戲機制新增「變異器官」條目**（`config/compendium_data.js`）：說明四種變異器官、獲得與升級方式
- **器官圖鑑與進化系統分頁改為雙欄版面**（`systems/ui.js`）：移除舊式翻頁按鈕，改為桌機左側目錄 + 右側內容、手機橫向 Tab 切換，與遊戲說明分頁風格統一；新增 `_renderOrgans()`、`_renderEvo()` 函式，移除 `buildOrganPages()`、`buildEvoPages()`、`getPages()`

---

## v0.0.67.0 - 2026-06-02

### 新增
- **遊戲圖鑑系統**（`config/compendium_data.js`、`systems/ui.js`、`index.html`）：新增 `COMPENDIUM_DATA` 全域常數，定義四大分類（遊戲機制 9 條、Biome 3 條、Boss 3 條、生物百科 7 條），共 22 個條目，繁中／英文雙語，數值動態引用 config，不寫死
- **圖鑑 Guide 分頁重設計**（`systems/ui.js`）：桌機版改為左側 160px 目錄欄 + 右側內容區雙欄版面；手機版改為橫向可滑動 Tab 列 + 下方內容區；各分類用 section color 標色；語言切換即時重繪
- **圖鑑維護 SOP**（`.claude/instructions.md`）：新增「更新圖鑑」與「檢查圖鑑」兩個 AI 指令步驟說明

---

## v0.0.66.3 - 2026-06-01

### 修復 / 效能
- **getGameFont cache**（`systems/utils.js`）：新增字體字串快取，相同設定下直接回傳快取值，避免每幀對所有生物重複建立新字串物件；以數字 key 取代字串 key 加快查詢
- **字大又粗合併 Toggle**（`systems/gameState.js`、`systems/ui.js`、`lang/`）：移除獨立的「字體加大」與「字體加粗」兩個選項，合併為單一「字大又粗」Toggle（+7px + bold），並保留舊 localStorage 自動遷移
- **showXPPopup DOM 物件池**（`systems/player.js`、`main.js`）：預建 10 個可重複使用的 DOM 元素，吃果子時從池取得而非每次 createElement；池滿時直接跳過，不建立新元素
- **_checkGuardianRange 節流**（`systems/creatures.js`）：加入 200ms 節流，避免每幀對每隻巨人執行 O(中立×敵意) 雙重迴圈距離計算
- **視野縮放公式調整**（`systems/camera.js`、`systems/ui.js`）：手機版改用 `0.48 + level × 0.04`（10格=0.84），電腦版改用 `0.80 + level × 0.04`（6格=1.00）；v0.0.66.3 一次性強制覆蓋玩家存檔預設值

---

## v0.0.66.2 - 2026-06-01

### 新增
- **出生保護區**（`systems/spawning.js`、`systems/gameState.js`、`main.js`）：遊戲開始後 3 秒內不補充生成肉食怪；初始生成時，距地圖中心 forestCenterRadius 以內的位置也不生成肉食怪
- **巨人 guardianRange 縮小**（`systems/creatures.js`）：`_triggerGiantization()` 中巨人保護範圍由 1000px 縮小為 500px（Alpha 的 1500px 不變）
- **殺手悄悄獵殺**（`systems/creatures.js`）：殺手化生物在巨人 guardianRange（500px）以外攻擊草食性時，不觸發巨人的 guardianTarget 保護，讓殺手可在外圍悄悄捕獵
- **隊伍名稱標籤**（`systems/creatures.js`）：巨人化隊長自動分配隊伍名稱（SKT、T1、Fnatic 等，共 26 組）；隊員繼承名稱；名字下方顯示隊伍標籤與成員比（如 `T1(3/6)`）

---

## v0.0.66.1 - 2026-06-01

### 新增
- **GM 標籤改靛藍色**（`systems/chat.js`）：`_parseName()` 中 GM 的【GM】標籤由彩虹漸層改為固定靛藍色 `#4B9CD3`，移除 `-webkit-background-clip` 等漸層 CSS
- **聊天顏色按鈕**（`systems/chat.js`）：聊天輸入框新增 🎨 按鈕，點擊彈出面板可插入 `[c=red]`、`[c=blue]`、`[c=green]` 彩色字標籤，游標自動置於兩 tag 中間
- **角色居中更名**（`lang/zh-TW.js`、`lang/en.js`、`systems/ui.js`）：設定面板「永遠居中」改名為「角色居中」（英文 Center Camera），並刪除底部 hint 提示文字
- **地圖透明開關**（`systems/gameState.js`、`systems/ui.js`、`systems/hud.js`、`lang/`）：輔助功能新增「地圖透明」Toggle；開啟後移動時小地圖每 0.5 秒降低 0.15 透明度（最低 0.5），停止後緩慢回復至 1.0
- **器官選擇防誤觸**（`systems/organs.js`）：器官選擇面板開啟後 0.5 秒內點擊無效，防止升級/選擇器官介面一開即誤觸
- **字體輔助功能**（`systems/gameState.js`、`systems/ui.js`、`systems/utils.js`、`lang/`）：輔助功能新增「字體加大」（+2px）與「字體加粗」兩個 Toggle；新增全域 `getGameFont(baseSize, baseBold)` 函式，套用至 `hud.js`、`creatures.js` 所有 canvas ctx.font 設定

---

## v0.0.66.0 - 2026-05-29

### 修復
- **攻擊範圍圈縮放修正**（`systems/hud.js`）：攻擊範圍圈半徑乘上 `cameraZoom`，修復縮放不為 1 時圈圈大小錯誤的問題
- **置頂訊息自動過期**（`systems/chat.js`）：`renderChat()` 開頭新增 `_pinnedMessage.pinUntil` 過期檢查；過期後清除本地置頂狀態並同步清除訊息陣列中的 `is_pinned`

### 新增
- **排行榜賽季版本制**（`config/gameConfig.js`、`systems/leaderboard.js`）：版本號格式改為四段 `v0.x.y.z`；`version_order` 改取第二段 x，同一個 x 的記錄互相競爭（x=0 為初始賽季）
- **`/unpin` 指令**（`systems/chat.js`）：GM 可輸入 `/unpin` 取消當前置頂訊息（`_handleUnpinCommand()`），同步更新資料庫與本地狀態
- **等級顏色辨識系統**（`systems/chat.js`）：變異等級顯示獨立放大（13px, bold）並依等級套色（0 白/50 綠/100 藍/150 紫/200 粉/250 金/300 紅/350 橘/400+ 彩虹漸層）；`_lvColor(lvNum)` 函式
- **GM 彩虹【GM】標籤 + 金色說話內容**（`systems/chat.js`）：GM 的【GM】標籤改為彩虹漸層色，說話內容以金色 `#FFD700` 顯示
- **彩色字標籤系統**（`systems/chat.js`）：支援 `[c=red]文字[/c]` 語法，一般玩家限 red/green/blue 三色；`_parseColorTags(escapedContent, isVIP)` 函式
- **先驅者 VIP TODO 索引**（`systems/chat.js`）：新增 `isVipPlayer(msg)` 函式（目前回傳 false），作為未來先驅者解鎖任意顏色彩色字的交接點

### 調整
- **聊天訊息移除版本號顯示**（`systems/chat.js`）：`_buildMsgHTML()` 和置頂展開版均移除 `[版本號]` 欄位，介面更簡潔

---

## v0.64.0 - 2026-05-28

### 新增
- **聊天室可拖拽移動**（`systems/chat.js`）：新增 `_makeDraggable(handle, panels)` 函式，以 `#chat-settings-btn` 為拖拽把手，同步移動 `#chat-history-panel` 與 `#chat-input-panel`；超過 5px 才判定為拖拽，滑動過程以邊界夾住防止拖出畫面外
- **記住最後位置**（`systems/chat.js`）：拖拽結束後呼叫 `_saveChatPosition()` 存入 `localStorage`；`buildChatUI()` 建立手機版面板後以 `_loadChatPosition()` 還原上次位置
- **拖拽後不誤觸齒輪**（`systems/chat.js`）：`_chatDragState.wasDragging` 旗標確保拖拽結束後的 click 事件不會開啟設定面板
- **視窗調整邊界保護**（`systems/chat.js`）：`window.resize` 監聽器確保轉屏後面板不跑出畫面外

---

## v0.63.1 - 2026-05-28

### 新增
- **聊天室首頁專屬顯示**（`systems/chat.js`、`systems/ui.js`、`systems/evolution.js`、`systems/leaderboard.js`）：新增 `showChat()` / `hideChat()` 工具函式；首頁 7 個按鈕（開始遊戲、技能樹、圖鑑、排行榜、設定、故事、更新）點擊時呼叫 `hideChat()`；`closeCompendium()`、`hideSettings()`、`closeLb()`、故事關閉、更新日誌關閉、技能樹 fromHome 關閉時若仍在首頁則呼叫 `showChat()`；`showStartScreen()` 末尾改用 `showChat()` 取代原本手動顯示 `#chat-panel`

---

## v0.63.0 - 2026-05-28

### 重構
- **手機版聊天室 UI 重新設計**（`systems/chat.js`）：拆分為兩個獨立 fixed 元素 — `#chat-history-panel`（bottom:23vh, height:18vh，可捲動歷史區，含 sticky 齒輪與置頂訊息）與 `#chat-input-panel`（bottom:5vh, height:5vh，獨立輸入列）；移除舊版 `#chat-panel` 手機分支與 `_adjustMobileChatHeight()`
- **renderChat() 雙路徑**（`systems/chat.js`）：偵測 `#chat-history-panel` 存在時走手機版路徑（訊息以 `<p>` 直接 append），否則走桌機版路徑（行為不變）
- **_isAtBottom() 更新**（`systems/chat.js`）：優先抓取 `#chat-history-panel`，桌機版 fallback 至 `#chat-messages`

---

## v0.62.2 - 2026-05-28

### 修復
- **手機版聊天室底部留空**（`systems/chat.js`）：`#chat-panel` 手機版 `bottom:0` 改為 `bottom:5vh`、`height:25vh` 改為 `height:20vh`，避免與畫面最底部操作區重疊；`border-radius` 改為四角圓（不再貼底）
- **手機版 flex 佈局補強**（`systems/chat.js`）：手機版專屬補丁補上 `#chat-messages` 的 `box-sizing:border-box`、`#chat-input-row` 的 `height:36px`、`#chat-settings-btn` 的 `flex-shrink:0`，確保輸入列固定底部且不被內容撐出

---

## v0.62.1 - 2026-05-28

### 修復
- **聊天室移至 body fixed 定位**（`systems/chat.js`）：`#chat-panel` 從 `#game-container` 移至 `document.body`，`position` 改為 `fixed`（桌機 left:10px bottom:10px，手機 bottom:0 left:5% right:5%），完全脫離遊戲容器 CSS 遮蔽，修復滾動與輸入被攔截的問題
- **設定面板不再被裁切**（`systems/chat.js`）：`#chat-settings-panel` 移至 `document.body`，`position:fixed`、`z-index:9999`；齒輪按鈕 onclick 改用 `getBoundingClientRect()` 動態計算位置，對齊 `#chat-panel` 右上角，解決 `overflow:hidden` 裁切問題

---

## v0.62.0 - 2026-05-28

### 修復
- **聊天室滾動修復**（`systems/chat.js`）：`#chat-messages` 改用 `overflow-y:scroll` 強制顯示滾動條，補上 `overflow-x:hidden`、`scrollbar-width:thin`；`#chat-input-row` 補 `width:100%`，確保輸入框永遠固定於面板底部不被推出

### 新增
- **GM 名字金色**（`systems/chat.js`）：`_parseName()` 中 GM 發言的名字欄位套用 `#FFD700` 金色，與【GM】標籤一致
- **稱號系統**（`systems/chat.js`）：`player_name` 格式擴充為 `lv{N}|{name}|{title}`（稱號選填）；登入時從 `chat_users.title` 讀取並存入 `chatSettings`；訊息格式新增 `[稱號]`（淡藍色 `#88CCFF`），顯示於【GM】後、名字前

---

## v0.61.0 - 2026-05-28

### 新增
- **聊天室訊息時間戳**（`systems/chat.js`）：每則訊息最左欄新增相對時間顯示（剛剛 / N分鐘前 / N小時前 / 昨天 HH:MM），置頂訊息同步顯示
- **聊天室往下按鈕**（`systems/chat.js`）：向上捲動後右下角出現 ↓ 按鈕，點擊跳回最新訊息；自動在底部時隱藏

### 修復
- **輸入框固定底部**（`systems/chat.js`）：`#chat-messages` 補上 `min-height:0`，防止 flex 子元素撐破容器，確保輸入列始終固定於面板底部

---

## v0.60.2 - 2026-05-28

### 修復
- **聊天室設定面板補上關閉按鈕**（`systems/chat.js`）：`_renderChatSettingsPanel()` 頂部新增 ✕ 按鈕，點擊後隱藏面板，解決設定面板開啟後無法關閉的問題

---

## v0.60.1 - 2026-05-28

### 修復
- **同步資料不覆蓋本地 SAVE_VERSION**（`systems/chat.js`）：`_applyRemoteData()` 寫回 localStorage 時排除 `SAVE_VERSION`，防止雲端舊版本號覆蓋本地，避免存檔格式判斷錯誤

---

## v0.60.0 - 2026-05-28

### 新增
- **聊天室帳號系統**（`systems/chat.js`）：⚙️ 設定面板改版為登入/已登入兩狀態；新增 `chatLogin`（查帳/自動註冊/密碼 SHA-256 驗證/進度比較同步）、`chatSaveProgress`、`chatSyncData`、`chatLogout`（清除本地所有遊戲進度）
- **遊戲結束自動保存**（`systems/boss.js`、`systems/daynight.js`）：死亡與勝利結算前，若已登入則自動呼叫 `chatSaveProgress()` 並顯示 2 秒提示

### 注意
- ⚠️ 帳號與密碼綁定，忘記密碼請聯絡開發者 Kiser；登出前請先手動保存進度

---

## v0.59.0 - 2026-05-28

### 新增
- **首頁即時聊天室**（`systems/chat.js`、`systems/ui.js`、`main.js`、`index.html`）：首頁顯示 Supabase Realtime 聊天室面板（桌機 320×220px，手機 25vh）；支援 GM 驗證、置頂訊息（`/pin 1H`）、1 小時閒置自動斷線、24 小時舊訊息自動清理；無 JS Client 時自動降級為 8 秒輪詢

---

## v0.58.0 - 2026-05-25

### 新增
- **小地圖大小調整**（`systems/gameState.js`、`systems/hud.js`、`systems/ui.js`）：設定面板新增小地圖大小區塊（0~10 格色塊），OFF 時隱藏 minimapCanvas 並將 minimap-info 移至 top-left 同高；數值以 `minimapSize` 儲存於 localStorage，版本更新不重置
- **視野智能/手動模式**（`systems/gameState.js`、`systems/camera.js`、`systems/ui.js`）：`_updateMobileCameraZoom()` 重構為 `_updateCameraZoom()`，支援桌機與手機；新增 `cameraMode`（smart/manual）與 `cameraZoomLevel`（1~10）設定；`worldToScreen()` 與 `drawTerrain()` 的 zoom 條件移除 `isMobile` 限制；設定面板新增 10 格縮放刻度調整器與智能/手動切換按鈕

---

## v0.57.7 - 2026-05-25

### 修復
- **技能樹 forceStart 路徑未讀 localStorage**（`systems/evolution.js`）：`buildSkillTreeOverlay(forceStart)` 現在與 `fromHome` 走相同流程——開啟時讀取 `skillPoints` / `playerSkills`，器官繼承列表改讀 `lastRunOrgans`；原本讀記憶體 `gameState.player.organs` 的邏輯限縮至 `postGame` 模式（遊戲剛結束記憶體仍完整的情況）；修復了刷新後進入技能樹看不到技能點與可繼承器官的問題

---

## v0.57.6 - 2026-05-25

### 調整
- **無草食性時果子 XP 降為 1**（`systems/player.js`）：`_collectFruit()` 新增草食性等級判斷；`ev.herbivore >= 1` 維持原計算（基礎5 + forager + 草食bonus），未達草食性 Lv1 則只給 1 XP；避免刷巨人時玩家靠吃果子觸發升級回血

---

## v0.57.5 - 2026-05-25

### 修復
- **阿奇爾子彈穿透教學木樁**（`systems/player.js`）：`_checkProjectileHit()` 的 targets 陣列補入 `gameState.tutorialStump`，並確認死亡路由包含 `isTutorialStump` 判斷
- **開始遊戲跳過技能樹導致所有屬性丟失**（`main.js`、`systems/evolution.js`）：`loadSavedOrgans()` 抽出為獨立函式並在 `initializeGame()` 步驟 8 的 `applySkillBonuses()` 之前呼叫，確保器官效果不依賴技能樹面板開啟；`buildSkillTreeOverlay()` 的 `fromHome` 路徑移除重複的器官載入呼叫

### 新增
- **輔助功能「永遠居中」選項**（`systems/gameState.js`、`systems/camera.js`、`systems/ui.js`）：設定面板輔助功能區塊新增 Toggle；開啟後視角邊界閾值從 30% 改為 50%，角色永遠固定於畫面正中央；預設關閉，玩家自由選擇

### 調整
- **手機攻擊蓄力改為 touchstart 即開始計時**（`systems/mobile.js`）：攻擊按鈕 touchstart 瞬間開始蓄力計時，touchend 時依蓄力時間（≥500ms）發動蓄力攻擊（傷害 ×2），否則普通攻擊；touchcancel 重置蓄力狀態；`initializeGame()` 補齊三個蓄力旗標的重置

---

## v0.57.4 - 2026-05-25

### 修復
- **趣味排行榜角色欄**（`systems/leaderboard.js`）：角色從名字下小字獨立為第三欄，表格結構改為「排名｜名字｜角色｜數值｜版本｜日期」（6 欄）
- **阿奇爾夜晚光圈**（`systems/hud.js`）：夜晚外圈從圓形 `arc` 改為三角形，與角色外型一致
- **阿奇爾 F技視覺效果**（`systems/hud.js`）：F技衝刺（`archerDashActive`）期間在角色外圍顯示紅色三角形邊框，含紅色光暈

---

## v0.57.3 - 2026-05-25

### 修復
- **TOP 10 角色欄位全顯示「噪鵑」**（`config/supabase.js`）：`fetchTop10` 的 select 缺少 `character` 欄位，導致 `row.character` 永遠為 `undefined` 而 fallback 到 `koel`；已補上
- **趣味排行榜無角色顯示**（`config/supabase.js`、`systems/leaderboard.js`）：所有 `fetchFun*` 查詢的 select 補上 `character`；`loadFunRows` 顯示邏輯在名字下方加角色小字

---

## v0.57.2 - 2026-05-25

### 修復
- **角色選擇畫面**（`systems/ui.js`）：角色按鈕標籤改用 `t('charXxx')` 語言包顯示，隨語言切換同步更新（原本硬寫 `c.name + '（' + c.nameEn + '）'`）

---

## v0.57.1 - 2026-05-25

### 修復
- **角色名稱語言包**（`lang/zh-TW.js`、`lang/en.js`）：中文改為「噪鵑」／「阿奇爾」，英文改為「Koel」／「Archerfish」，排行榜與 TOP 10 顯示更簡潔

---

## v0.57.0 - 2026-05-25

### 新增
- **排行榜角色欄位**（`systems/leaderboard.js`、`systems/ui.js`、`lang/zh-TW.js`、`lang/en.js`）：全屏排行榜表格在「名字」後新增「角色」欄位；TOP 10 浮窗名字下方顯示小字角色標籤；分數上傳 data 物件加入 `character` 欄位，自動記錄本局選用角色

---

## v0.56.0 - 2026-05-25

### 新增
- **角色選擇系統**（`config/characters.js`、`systems/ui.js`）：難度選擇後出現角色選擇畫面；噪鵑/阿奇爾可選，「？即將推出🔒」格子預留；`CHARACTERS` 常數定義各角色屬性、起始器官、起始進化
- **阿奇爾（Archerfish）**（`config/characters.js`、`systems/player.js`、`systems/combat.js`）：首個遠程攻擊角色；HP60/速度2.0（水中+50%）/攻擊範圍120px/暴擊1.25x/攻速1500ms；三角形外觀（神仙魚藍 #4FC3F7），左右翻轉朝向移動方向
- **Reload 充能系統**（`systems/player.js`）：不攻擊時每1.0秒（受攻速影響）+1格，上限3格；任何攻擊後計時器重置消耗1格；頭上3格指示+周圍藍色泡泡視覺
- **子彈系統**（`systems/player.js`、`systems/combat.js`）：`gameState.projectiles[]` 管理；速度9px/幀，超出攻擊範圍120%消失；藍色半透明水晶bubble視覺
- **自動/手動攻擊模式**（`systems/player.js`、`systems/input.js`）：自動=移動方向±45°扇形內最近目標優先，無目標→全場最近；手動電腦=滑鼠方向+按住蓄力（最多3格），放開發射；手動手機=攻擊區變方向鈕，拖動決定方向
- **阿奇爾 F 技衝刺**（`systems/player.js`）：陸地+3速/水中+5速，持續3秒，衝刺期間撞怪暈眩0.5秒+附加傷害，冷卻15秒
- **新器官：嘴器**（`config/organs.js`）：攻擊類 Lv1~3，累計攻擊+10，Lv3 命中使目標移動速度-20%持續2秒；阿奇爾起始 Lv3
- **新器官：魚鱗**（`config/organs.js`）：防禦類 Lv1~3，累計韌性+30%（Lv1=5%/Lv2=15%/Lv3=30%）
- **新器官：鯊魚嗅葉**（`config/organs.js`）：靈力類 Lv1~3，覆蓋效果，對低血量目標傷害+10/15/20%（閾值15/30/50%）
- **韌性屬性系統**（`systems/utils.js`、`systems/organs.js`、`systems/combat.js`）：減少被控制持續時間，不影響減速幅度；`applyTenacity(durationMs, target)` 通用函式；適用暈眩/硬控/減速；已套用至猞猁暴擊緩速、鱷魚死亡翻滾
- **嘴器 Lv3 減速**（`systems/player.js`、`systems/combat.js`、`systems/creatures.js`）：近戰及遠程命中均可施加 -20% 速度、2秒（受目標韌性縮短）；`_effSpeed(c)` 統一管理有效速度，已套用至 neutral/hostile/elite/boss 所有移動路徑
- **鯊魚嗅葉處決加成**（`systems/player.js`、`systems/combat.js`）：近戰及遠程攻擊中，若目標血量低於閾值則額外加成傷害
- **手機視野縮放**（`systems/camera.js`、`main.js`）：`_updateMobileCameraZoom()` 依玩家體型動態調整 `cameraZoom`（體型每+20%縮小5%，最小0.6）；`worldToScreen()` 以螢幕中心為基準縮放，桌機不受影響
- **Boss 血條 Debuff 圖示**（`systems/boss.js`）：血條下方正方形圖示列；毒傷綠/流血紅/減速藍/暈眩黃；逆時針縮減進度邊框；最多4個同時顯示
- **Debuff StartTime 追蹤**（`systems/combat.js`、`systems/player.js`）：施加毒/流血/減速/暈眩時同步記錄 `_[type]StartTime`，供 Debuff 圖示弧度進度計算

### 修復
- **器官名稱顯示 undefined**（`config/organs.js`）：`mouthOrgan`/`fishScale`/`sharkLeaf` 補上 `name` 欄位
- **精英怪/Boss 嘴器減速無效**（`systems/elite.js`、`systems/boss.js`）：移動呼叫改用 `_effSpeed()`，減速現在正確生效
- **滑鼠拖曳產生文字選取**（`index.html`）：`#game-container` 套用 `user-select: none`，禁止文字選取和右鍵選單
- **手機返回鍵/左滑退出遊戲**（`main.js`）：`history.pushState` + `popstate` 全程攔截瀏覽器返回行為

---

## v0.55.0 - 2026-05-24

### 新增（Phase C）

- **新器官 × 3**（`config/organs.js`、`lang/zh-TW.js`、`lang/en.js`）：
  - `mouthOrgan`（攻擊型，3 級）：攻擊+4 → +4 → +2，Lv3 命中使目標移速 -20% / 2 秒
  - `fishScale`（防禦型，3 級）：韌性 +5% → +10% → +15%（累計 30%），減少玩家被控制時間
  - `sharkLeaf`（精神型，3 級）：對低血量目標（15%/30%/50%）傷害加成 10%/15%/20%

- **韌性屬性系統**（`systems/utils.js`）：
  `applyTenacity(durationMs, target)` 根據目標自身 `tenacity`（0~1）縮短 CC 效果持續時間；
  已套用至玩家被猞猁緩速（`_lynxSlowUntil`）及鱷魚死亡翻滾（`_stunUntil`）

- **嘴器 Lv3 減速**（`systems/player.js`、`systems/combat.js`、`systems/creatures.js`）：
  近戰命中（`playerAttack`）與遠程命中（`_checkProjectileHit`）均可對目標施加 -20% 速度、
  持續 2 秒（受目標韌性縮短）；新增 `_effSpeed(c)` 函式統一處理生物有效移動速度，
  已套用至 `updateNeutralCreatures`、`updateHostileCreatures` 全部移動路徑

- **鯊魚葉執行加成**（`systems/player.js`、`systems/combat.js`）：
  近戰及遠程攻擊中，若目標血量低於當前等級閾值則額外加成傷害；
  `sharkLeaf` 等級直接讀取 `ORGANS.sharkLeaf.levels[lv-1].effects.executeBonus`

- **手機視野縮放**（`systems/camera.js`、`main.js`）：
  `_updateMobileCameraZoom()` 依玩家體型（radius）計算縮放比（體型增加 20% → 縮小 5%，最小 0.6）；
  `worldToScreen()` 加入縮放邏輯（以螢幕中心為基準），僅在 `gameState.isMobile` 時啟用

- **Boss 血條 Debuff 圖示**（`systems/boss.js`）：
  `_drawBossDebuffIcons()` 在 Boss 血條正下方顯示最多 4 個 Debuff 圖示（毒/流血/減速/暈眩），
  每個圖示含深色背景、彩色邊框、縮寫標籤、以及逆時針剩餘時間弧；
  各 Debuff 施加點（`combat.js`、`player.js`）同步記錄 `_poisonStartTime`、`_bleedStartTime`、
  `_slowStartTime`、`_stunStartTime`，供弧度計算使用

---

## v0.54.1 - 2026-05-24

### 新增

- **Submit 前名次預覽**（`systems/leaderboard.js`）：
  `showScoreSubmitPopup()` 面板開啟時立即並行查詢一般榜名次與所有趣味榜（`Promise.all`），
  顯示「⏳ 計算中...」；查詢完成後在輸入框上方顯示預計排名與命中的趣味榜 TOP3；
  斷線時顯示連線異常提示；`funCategories` 陣列集中管理所有趣味榜查詢邏輯，
  新增趣味榜分類時需同步更新（已記錄至 `MAIN.md`）

---

## 文件修正 - 2026-05-24（不更新版本號）

### 修復

- **XP Popup 顯示數值未反映變異 XP 倍率**（`systems/player.js`、`systems/combat.js`、`systems/organs.js`）：
  `addXP()` 改為回傳實際加入的 XP 值（已乘 `mutationXpBonus`）；
  `handleGiantKill`、`handleKillerKill`、`handleKill`、`checkTreasureCollision`、`_collectFruit`、`handleEliteKill`
  所有 `showXPPopup` 呼叫點統一改用回傳值，確保 popup 顯示與實際獲得 XP 一致；
  `updateCorpseEating` 的 `showFloatingText` XP 浮動文字同步修正

---

## v0.54.0 - 2026-05-24

### 新增

- **閃現視覺特效**（`systems/hud.js`、`systems/player.js`）：
  閃現觸發後播放 150ms 三段特效：出發點金色煙霧（0~100ms 擴散消散）、到達點白色光球（50ms~結束 漸淡）、A→B 光線掃過（頭部 t=0→1，尾巴延遲 0.35 出發，線性漸層）
- **閃現直線果子吸收**（`systems/player.js`）：
  閃現路徑 A→B 直線上（寬度 = radius + pickupRange）的果子全部吸收，給予正常 XP；複用 `_collectFruit()` 函式，不重複 XP 邏輯
- **特殊技能鍵可自訂**（`systems/gameState.js`、`systems/ui.js`、`systems/input.js`）：
  `DEFAULT_SETTINGS.keys.dash = 'f'`；設定介面按鍵設定區塊新增「特殊技能鍵」一欄，玩家可任意重綁

### 調整

- 提取 `_collectFruit(p, fruit)` 函式（`systems/player.js`）：原 `checkFruitCollision` 的吸收邏輯改由此函式處理，`playerDash` 也共用

---

## v0.53.1 - 2026-05-24

### 調整

- **手機版 💨 閃現按鈕縮小**（`systems/mobile.js`）：偵測範圍（`_dashZone()`）和視覺尺寸縮小為原攻擊區的 50%，中心點位置不變；攻擊區完全不受影響
- **桌機版指示器位置對應更新**（`systems/hud.js`）：`💨 F` 繪製矩形改為縮小後的尺寸（`dashW × dashH`），位置與手機直向閃現區對應

---

## v0.53.0 - 2026-05-24

### 新增

- **閃現技能（💨）**（`systems/player.js`、`systems/combat.js`、`systems/input.js`、`systems/mobile.js`、`systems/hud.js`）：
  - 觸發：桌機版按 `F` 鍵；手機版點擊攻擊區正上方 💨 按鈕
  - 效果：瞬間位移至最後移動方向 `speed × 50`（最遠 500px）
  - 無敵：觸發後 **0.5 秒** 內豁免所有外部傷害（`applyDamageToPlayer` 開頭判斷 `dashInvincible`）
  - 冷卻：**15 秒**（`dashCooldown`，每幀固定遞減）
  - 方向邏輯：手機版優先用搖桿方向（`mobileInput`）；桌機版用 `lastMoveDir`（最後移動方向，初始朝上）
  - `gameState.player` 新增欄位：`dashCooldown`、`dashInvincible`、`dashInvincibleEnd`、`lastMoveDir`
  - 桌機版右下角繪製冷卻指示器（`💨 F`），冷卻中顯示灰色進度條 + 倒數秒數
  - 手機版 `_dashZone()` 定義按鈕矩形；冷卻中顯示灰色進度條 + 倒數秒數
- **語言包新增** `dashSkill` / `dashCooldownLabel` 鍵值（`lang/zh-TW.js`、`lang/en.js`）

---

## v0.52.0 - 2026-05-24

### 新增

- **大白鯊衝刺箭頭重設計**（`systems/boss.js`）：警告 600ms 顯示黃色閃爍箭頭，寬度＝Boss 直徑，**長度現在對應實際衝刺距離**（`speed×4×0.8×60px`）而非 Boss 到玩家的直線距離；衝刺期間改為紅色；方向在 warning 瞬間鎖定
- **蠍王毒霧改為定點投擲**（`systems/boss.js`）：每5秒鎖定玩家**當前位置**投擲毒液，600ms 黃色虛線圓圈警告後在目標位置生成綠色毒霧（半徑 150px，持續 4 秒，每秒傷害 `boss.damage×0.3`）；玩家可跑出範圍完全躲開；多個毒霧可同時存在（`gameState.venomPuddles[]`）；觸發不再需要靠近 Boss，解決玩家無法近戰的問題
- **蠍王沙暴限定沙漠生態區**（`systems/boss.js`）：玩家離開沙漠生態區時立即解除移速 -40% 和螢幕遮罩效果，跑出沙漠即可脫離沙暴
- **黑熊暴擊浮動文字位置修正**（`systems/boss.js`）：「X熊爪！」文字改顯示在玩家位置（原本在 Boss 頭上）

### 調整

- 蠍王毒霧觸發條件從「玩家在 300px 內才觸發」改為「每5秒無距離限制投擲」，解決玩家因拉開距離而毒霧永不觸發的問題

---

## v0.51.0 - 2026-05-24

### 修復

- **遊戲卡死（負數 radius）**（`systems/organs.js`、`systems/evolution.js`、`systems/hud.js`）：
  `applyOrganEffects` / `applyHiddenOrganEffects` 的 `radiusAdd` 加入 `Math.max(5, ...)` 保護，
  同時確保 `rangeIncrease` 計算使用 `Math.max(p.radius, 1)` 避免除以零；
  `applyEvolutionLevelEffect` / `applyEvolutionEffects` 同樣加入下限保護；
  `drawGame` 繪製玩家前加入 `const drawRadius = Math.max(1, p.radius)` 防呆，
  確保 `ctx.arc()` 永遠不會收到負數或零 radius
- **initializeGame 再來一局殘留舊資料**（`main.js`）：
  補齊 `fruits`、`corpses`、`bones`、`treasures`、`brainShockwaves`
  五個陣列的清空重置，避免多局累積導致異常
- **Alpha 死亡清除路徑補齊**（`systems/creatures.js`、`systems/combat.js`）：
  確認並補齊四條死亡路徑（`handleGiantKill`、毒傷/流血、
  `updateNeutralCreatures`、`updateHostileCreatures`）全部正確清除
  `gameState.alphaCreature = null`
- **殺手 100% 迴避巨人**（`systems/creatures.js`）：
  `_shouldFleeFromGiant` 對殺手化生物直接返回 `false`；
  新增殺手戰術邏輯：正常攻擊巨人，自身血量 < 70% 且巨人血量 > 70%
  時優先轉移攻擊落單草食性，找不到才暫時撤退
- **變異器官文本未顯示實際數值**（`systems/mutation.js`）：
  面板四個器官描述改為動態讀取實際倍率，
  顯示「當前 +N%（Lv.N，每級 +1%）」格式；等級為 0 時顯示尚未解鎖提示

### 新增

- **趣味排行榜「👑 最高等級」分類**（`config/supabase.js`、`systems/leaderboard.js`）：
  新增 `fetchFunMaxLevel()` 查詢 `level` 欄位最高值，TOP10 顯示格式 `Lv.N`

---

## v0.50.0 - 2026-05-24

### 新增

- **大白鯊衝刺警告箭頭**（`systems/boss.js`）：警告 600ms 顯示黃色閃爍箭頭（寬度＝Boss 直徑），衝刺 800ms 改為紅色實心箭頭；箭頭從 Boss 起點指向鎖定的玩家位置（進入 warning 瞬間記錄），玩家可在警告期間側移躲開衝刺傷害
- **蠍王毒霧視覺特效**（`systems/boss.js`）：毒霧以綠色半透明圓形從 Boss 向外擴散至 300px，持續 4 秒，透明度隨時間漸淡；毒傷判定改為動態半徑，玩家跑出擴散圓範圍可完全躲開傷害
- **蠍王沙暴螢幕遮罩**（`systems/boss.js`、`systems/hud.js`）：沙暴觸發時螢幕外圈 30% 被沙色半透明 radialGradient 覆蓋（alpha 最高 0.3），持續 6 秒，淡入淡出各 500ms；純視覺效果
- **黑熊暴擊浮動文字**（`systems/boss.js`）：25% 暴擊命中玩家時顯示橙色浮動文字「X熊爪！」

---

## v0.49.0 - 2026-05-23

### 新增

- **黑熊 Boss 動畫重製**（`systems/boss.js`）：
  - 手臂三狀態動畫：閒置垂下 / 追擊高舉（雙臂外展至 ±69°，延伸出身體橢圓外側可見） / 攻擊橫掃
  - 普攻依踏步腳判斷揮砍臂（左腳踩地→右臂"/"掃；右腳踩地→左臂"\"掃）；25% 機率暴擊→雙臂同時揮砍形成"X"
  - 攻擊殘影：揮砍臂前繪製 2 層半透明舊位置（alpha 0.10 / 0.22），強化高速感
  - 爪痕特效：攻擊 450ms 內繪製深紅（普攻）或橙紅（暴擊）漸長斜線，確保無論手臂位置均清晰可見
  - 踏步速度連動：追擊時 period 縮短（×1.9），奔跑感更強
- **大白鯊 Boss 面向翻轉**（`systems/boss.js`）：以 `player.x < boss.x` 判斷方向，`ctx.scale(-1,1)` 讓頭部永遠朝向玩家，不依賴 moveAngle
- **蠍王三腳步法**（`systems/boss.js`）：6 條腿重新設計為 Tripod Gait（群 A/B 交替，組內 10% 相位差），腿動畫改為末端 y 位移（抬腳細線/落地粗線），夾鉗靜止待機、攻擊後 700ms 內弧線向內夾（最大 37°）
- **動畫實作指南**（`docs/ANIMATION_GUIDE.md`）：完整記錄踏步、面向翻轉、三腳步法、攻擊計時原理、爪痕特效、殘影、眼睛脈動參數，含可複製的樣板程式碼供精英怪 / 普通生物使用

### 修復

- **黑熊手臂完全不可見**：原因為 `BOSS_COLORS.bear.limbs` 與 `body` 顏色相同（均為 `#2a1808`），且手臂橢圓位置落在 rx=r×1.2 的超寬身體橢圓內部。修正：`limbs` 改為 `#7a3d0c`（明顯較淺），追擊時手臂角度調整為 ±1.20 rad 使臂中心落在身體外側

---

## v0.48.0 - 2026-05-23

### 新增

- **生物視覺差異化**（`systems/creatures.js`）：六種生態生物各有獨立幾何形狀，moose/beetle/croc 完整旋轉（跟隨 `_moveAngle`），camel/lynx 只左右翻轉（`ctx.scale(-1,1)`），hyena 永遠朝上不旋轉
- **生物顏色固定**（`systems/creatures.js`）：新增 `CREATURE_COLORS` 常數，各物種使用固定辨識色（駝鹿深棕 `#8B4513`、甲蟲青綠 `#1ABC9C`、駱駝淺沙 `#E8C87A`、猞猁灰褐 `#A0826D`、鱷魚橄欖綠 `#6B8E23`、鬣狗深咖 `#8B6914`）
- **特殊狀態光暈**（`systems/creatures.js`）：Alpha 金色、巨人化橙色、殺手化依 killerLevel 漸層深紅；光暈以世界座標繪製，不跟旋轉
- **繪圖規格文件**（`docs/creature_shapes.md`）：記錄所有物種旋轉模式、顏色常數、形狀函式完整程式碼與設計備注

### 修復

- **追擊狀態下 `_moveAngle` 未更新**（`systems/creatures.js`）：aggressive 追擊、giant 追擊、biome flee、非 biome flee/跟隨果子、hostile 主追擊等 6 處移動邏輯均補上 `creature._moveAngle = angle`，確保旋轉方向即時正確

---

## 功能新增 - 2026-05-23（不更新版本號）

### 新增

- **趣味排行榜新增「⚔️ 最快擊殺Boss」分類**（`config/supabase.js`、`systems/leaderboard.js`）：引用現有 `boss_kill_time` 欄位（Boss 出現到被擊殺的秒數），排序 asc 越小越快；只顯示勝利記錄（`is_victory=true`）

---

## 文件修正 - 2026-05-23（不更新版本號）

### 修復

- **趣味排行榜最速通關欄位引用錯誤**（`config/supabase.js`、`systems/leaderboard.js`）：`fetchFunSpeedVictory` 查詢欄位從 `boss_kill_time` 改為 `play_time`，顯示欄位標籤同步更新為「遊玩時間(秒)」；舊資料不受影響，直接引用正確欄位即可

---

## v0.47.1 - 2026-05-23

### 修復

- **公告紅點未及時消除**（`systems/ui.js`）：`showPatchNotes()` 改為建立 `readInSession` Set 追蹤本次已讀的版本 Tab，不再在面板開啟時立即寫入 `lastSeenPatchVersion`；所有比 `lastSeenPatchVersion` 新的版本 Tab 都點開後才消除紅點並更新 localStorage，徹底解決殘留問題

### 調整

- **進化圖鑑改為固定值動態描述**（`systems/ui.js`）：新增全域函式 `buildEvoLevelDesc(pathId, upToLevel)`，從 `config/evolution.js` 的 `effects` 動態計算累計值（草食性 HP/果子XP/體型累計，雜食性速度累計；肉食性攻擊和雜食性白骨素為固定值），圖鑑數值自動與 config 同步，不再手寫固定文字

### 新增

- **圖鑑 Boss 介紹頁**（`systems/ui.js`）：圖鑑遊戲說明分頁新增「Boss 圖鑑」頁，動態引用 `EASY_MAP`/`NORMAL_MAP` bosses 數值，顯示簡單/普通兩套 HP/速度/傷害、普通難度技能說明（黑熊狂暴化/大白鯊衝鋒撕咬/蠍王毒霧）、通用回血說明、弱點提示
- **圖鑑難度介紹頁**（`systems/ui.js`）：圖鑑遊戲說明分頁新增「難度介紹」頁，動態引用 `EASY_MAP`/`NORMAL_MAP` config，顯示生物強度倍率、精英/Boss 獎勵、特殊機制開關（巨人化/殺手化/精英回血/Boss 回血），兼顧硬核與休閒玩家說明風格

---

## v0.47.0 - 2026-05-23

### 修正（Bug Fix）
- **B1：再來一局保留難度** — `showMapSelect()` 選完難度後存入 `localStorage('lastDifficulty')`；`initializeGame()` 若 `currentMap` 為 null（頁面重整後）從 localStorage 恢復難度與地圖物件
- **B8：技能樹防呆** — `buildSkillTreeOverlay()` 入口加入 `if (!gameState.player || !gameState.playerSkills) return;` 防止空白畫面

### 調整
- **攻速公式改為加法**（`systems/combat.js`、`systems/organs.js`、`systems/evolution.js`、`config/organs.js`）：
  - 新公式 `interval = 1000ms / (1 + totalBonus)`；玩家新增 `attackSpeedBonus: 0` 欄位累積加法加成
  - `boxingGloves` effects 改為 `attackSpeedBonus: 0.10/0.15/0.15`（原為乘法 `attackSpeedMult`）
  - 肉食性進化 `attackSpeedBonus` 累積至 `p.attackSpeedBonus`（原為 `p.attackSpeed *=`）
- **怪物命中判定擴大**（`systems/combat.js`）：攻擊命中條件改為 `distance < attackRange + radius * 0.5`，大型敵人更易被擊中
- **精英獎勵調整**（`systems/organs.js`）：夜晚技能點 `[1, 1, 2]`（原為 `Math.round((phase+1)/2)`，即 1/2/3）
- **Boss 獎勵調整**（`systems/boss.js`）：擊殺 Boss 獎勵 +3 技能點（原 +5）
- **生態 Emoji 前綴**（`config/creatures.js`、`map/normalmap.js`、`map/easymap.js`、`lang/zh-TW.js`、`lang/en.js`）：
  - 所有生物名稱加入 🌿（森林）🌊（海洋）🏜️（沙漠）前綴
  - Boss 名稱同步更新，毒傷免疫判斷改為 `c.name.includes('蠍王')`

### 新增
- **普通 Boss 平衡改版**（`systems/boss.js`、`map/normalmap.js`）：
  - 普通難度 Boss 速度翻倍（黑熊 9.0、大白鯊 11.7、蠍王 10.8）
  - 通用回血：每 3 秒回復最大HP 2%（原 10 秒 10%）
  - 黑熊：<40% HP 觸發狂暴（速度×1.5、傷害×1.3、發光提示）
  - 大白鯊：每 4 秒對 500px 內玩家發動衝刺攻擊（0.6 秒警告 → 0.8 秒衝刺，造成 1.5 倍傷害）
  - 沙漠蠍王：每 5 秒在 300px 內釋放毒霧（4 秒每秒毒傷）；<40% HP 觸發沙暴（玩家移速 -40% 持續 6 秒）
  - 簡單模式 Boss 新增 radius/attackRange 欄位
- **變異器官 UI 改版**（`systems/hud.js`、`index.html`）：
  - 文字改為「變異器官 ⚗️ Lv.X」
  - 有可升級點數時 `#mutation-icon-row` 套用 `mutation-pulse` CSS 動畫（0.8s 彈跳）
- **小地圖難度標籤**（`systems/hud.js`、`index.html`）：小地圖下方新增 `#minimap-difficulty` 顯示 `⚔️ 普通`/`🌿 簡單`
- **趣味排行榜**（`systems/leaderboard.js`、`config/supabase.js`、`systems/gameState.js`、`systems/combat.js`）：
  - 新增 5 種趣味統計：🏃最速通關 / 💀最速死亡 / 👾巨人獵人 / 🔪殺手獵人 / ⭐殺手克星
  - 全屏排行榜新增「🎲 種類」切換按鈕
  - 新增 Supabase 查詢函式：`fetchFunSpeedVictory/Death/GiantKills/KillerKills/KillerMaxLevel`
  - `sessionStats.giantKills/killerKills/killerMaxLevel` 即時追蹤；`submitScore()` 自動帶入
- **Alpha 小地圖標記**（`systems/hud.js`）：Alpha 怪在小地圖上顯示金色閃爍圓點 + α 文字
- **隊伍滿員擴張**（`systems/creatures.js`）：巨人化隊伍達 8 人時，果子搜索半徑從 800px 擴展至 2000px
- **變異商店技能點兌換**（`systems/mutation.js`、`lang/zh-TW.js`、`lang/en.js`）：
  - 變異面板下方新增「100 技能點 → 10 變異點」兌換按鈕
  - 新增語言 key：`mutationExchange`、`mutationExchangeHint`
- **公告紅點**（`systems/ui.js`）：首頁公告按鈕有未讀版本時顯示紅點；開啟公告後消失
- **沙暴玩家減速**（`systems/player.js`）：蠍王沙暴期間玩家移速 -40%（`p._inSandstorm` 旗標）
- **語言新增**（`lang/zh-TW.js`、`lang/en.js`）：`venomFloat`（毒霧浮動文字）

---

## v0.46.0 - 2026-05-22

### 新增

- **生態特性系統**（`systems/creatures.js`、`systems/player.js`、`systems/spawning.js`）：
  - **猞猁（森林）**：在森林內 50% 暴擊機率（×2 baseDmg，對玩家施加 -30% 速度 3 秒）；離開森林 ≥3 秒後降為 25% / ×1.5 / -15% 1.5 秒；移動速度森林內 ×1.2
  - **鱷魚（水潭）**：水潭內攻擊 ×1.2、移動 ×1.3、20% 機率觸發「死亡翻滾」（對玩家施加 1 秒暈眩，`p._stunUntil`）；離水潭後加成歸零
  - **鬣狗（沙漠）**：生成時隨機分配 packGroup（1~3）；每 2 秒掃描同組存活 packMates（600px 內）；每隻 packMate +20% 攻擊、+5% 速度；鎖定目標時警報同組出動（`_alertHyenaPack`）；離沙漠 ≥3 秒攻擊/速度均 ×0.5
  - **玩家暈眩**：`updatePlayerMovement()` 加入 `p._stunUntil` 判斷，暈眩期間無法移動
  - **玩家減速**：`updatePlayerMovement()` 加入 `p._lynxSlowUntil` / `p._lynxSlowAmt` 減速效果
  - **肉食者逃離巨人**（`_shouldFleeFromGiant`）：目標為 Alpha 一律逃；普通巨人 HP > 肉食者 HP×3 → 逃；`fleeing_giant` 狀態持續 3 秒後尋找非巨人化草食性
  - **生態區回歸**：肉食者離開自身生態區時，以 1.3 倍速朝最近生態區點回歸；`_leftBiomeTime` 同時作為各物種加成失效計時

- **殺手 killerLevel 計數器**（`systems/creatures.js`、`systems/combat.js`、`systems/ui.js`）：
  - 殺手化後每吃一具屍體 `killerLevel++`；頭上顯示「[物種名] 殺手Lv[N]」（橙色粗體）
  - 擊殺XP公式改為 `100 + killerLevel×5 + 獵人本能×10`（原為 `baseDamage×2×1.1^n`）
  - 擊殺掉落屍體數：3 份 → 2 份

### 調整

- **巨人化 aggroRange**：150 → 400（`_triggerGiantization`）
- **巨人化 guardianRange**：新增 1000px — 偵測 guardianRange 內組員被敵意生物威脅時，切換為 guardianTarget 優先攻擊
- **巨人化 HP 低血逃跑**：HP ≤ 30% 時逃往最近果子；每吃一顆 +10% maxHP（`_updateGiantFlee`）
- **巨人化隊伍上限動態化**：`base 5 + 隊伍內已巨人化成員數`，上限 8 隻（`_getPackLimit`）
- **Alpha aggroRange**：300 → 600（`_triggerAlpha`）
- **Alpha guardianRange**：新增 1500px
- **Alpha HP 分享回血**：HP ≥ 80% → 每秒分享 1% maxHP 給最低血量組員；HP < 80% → 自回 2%（不分享）
- **肉食性進化固定值覆蓋**（`config/evolution.js`、`systems/evolution.js`）：改為固定值覆蓋（非累計），各等級攻擊加成 2/5/9/14/20，吃屍體 XP 5/8/12/15/20，吃屍體時間 3/2.5/2/1.5/1 秒，Lv3+ 攻速 +5%/+10%/+15%
- **草食性連吃機率**：吃完一顆果子有 70%（普通）/ 90%（有同族巨人在 500px 內）機率繼續吃附近果子（原為每次獨立觸發）

---

## v0.45.1 - 2026-05-23

### 重構
- **模組化拆分**（`systems/ui.js`）：將 ui.js 拆分為三個獨立模組
  - `systems/leaderboard.js`：排行榜面板、分數提交彈窗、難度狀態管理
  - `systems/mobile.js`：裝置偵測、手機縮放、搖桿、攻擊區、觸控疊加層
  - `systems/hud.js`：drawGame 主渲染、HUD 更新、小地圖、上方血條
  - ui.js 保留：面板系統（首頁/設定/地圖選擇/圖鑑/故事書/版本公告）、Tooltip、語言切換、開發者模式

---

## v0.45.0 - 2026-05-22

### 新增
- **新手教學第二階段：戰鬥教學**（`systems/tutorial.js`、`systems/organs.js`、`systems/combat.js`、`systems/ui.js`、`systems/gameState.js`、`main.js`、`index.html`）：
  繼第一階段（移動、吃果子、日夜說明）之後，在玩家第一次升級時自動觸發戰鬥教學。
  - **器官鎖定**：`showOrganSelection()` 偵測到 `tutorialCompleted` 存在且 `tutorialCombatDone` 不存在時，設定 `tutorialOrganPhase = true`；畫面只有第一張攻擊器官卡片可選（金色閃爍邊框 + 「👆 選擇你的第一個攻擊器官！」提示），其他卡片灰暗禁用、幸運重抽按鈕隱藏。
  - **教學木樁**：選完攻擊器官後，在玩家正前方 150 像素生成一根棕色木樁（HP 30、不移動、不攻擊），並顯示左上角戰鬥提示框（手機版顯示攻擊區提示）。木樁有血條與名稱標籤，繪製於 `drawGame()` 7c 步驟。
  - **攻擊整合**：`playerAttack()` 將教學木樁加入攻擊目標陣列，死亡時呼叫 `handleTutorialStumpKill()` 而非一般 `handleKill()`。
  - **完成流程**：擊殺木樁 → 凍結 0.5 秒 → 顯示「⚔️ 攻擊學會了！」小框（玩家頭頂，2 秒自動消失）→ 寫入 `localStorage.tutorialCombatDone` → 解凍繼續遊戲。
  - **`index.html` 載入順序調整**：`tutorial.js` 移至 `combat.js` / `organs.js` 之前，確保兩者可呼叫教學函式。
  - 新增 `gameState` 旗標：`tutorialOrganPhase`、`tutorialCombatActive`、`tutorialStump`，均在 `initializeGame()` 重置。

---

## v0.44.0 - 2026-05-22

### 新增
- **設定面板 → 輔助功能 → 新手教學開關**（`systems/ui.js`）：
  可手動切換下一場遊戲是否顯示新手教學。
  開啟（綠色）= 移除 `tutorialCompleted` 標記，下一場進入遊戲後會自動出現三步驟教學；
  關閉（灰色）= 寫入 `tutorialCompleted`，教學不再觸發。
  開關狀態即時反映 `localStorage` 現況，不需要重新整理頁面。

---

## v0.43.0 - 2026-05-22

### 新增
- **新手教學系統**（`systems/tutorial.js`、`main.js`、`systems/gameState.js`、`index.html`）：
  首次遊玩自動觸發三步驟教學，完成後寫入 `localStorage.tutorialCompleted` 不再重複顯示。
  - **步驟一（凍結）**：全螢幕暗色遮罩 + 玩家白色光圈脈衝動畫 + 歡迎提示框（「🐦 你是噪鵑……」），按鈕進入下一步。
  - **步驟二（解凍）**：遊戲恢復運行；找到最近果子並標記金色脈衝光暈與閃爍 ↓ 箭頭；提示框移至左上角（手機版為上方置中）；15 秒防呆自動繪製從玩家到果子的紅色虛線引導線；XP 增加即觸發金色閃光並進入下一步。
  - **步驟三（凍結）**：遮罩重新出現；右上角日夜指示器金色邊框閃爍高亮；中央提示框說明日夜機制與勝利條件，按鈕結束教學。
  - `gameState.tutorialOpen`：新增狀態旗標，已整合至 `isGamePaused()` 使教學期間暫停遊戲邏輯。

---

## 文件修正 - 2026-05-22（不更新版本號）

### 調整
- **MOBILE_GAME_SCALE 文件衝突修正**（`project_summary.md`、`.claude/instructions.md`）：
  v0.34.0 已將 `MOBILE_GAME_SCALE` 從 0.7 調整為 0.6，但三處文件未同步更新。
  本次修正技術架構區塊邏輯解析度數值（橫向 1120×630 → 960×540，直向 630×1120 → 540×960）、
  重要提醒第 3 條、`.claude/instructions.md` 技術陷阱說明，統一對齊實際程式碼與 CHANGELOG。

---

## 文件修正 - 2026-05-22（不更新版本號）

### 調整
- **速度 ×3.0 歷史補丁文案 Fixed**（`project_summary.md`、`.claude/instructions.md`）：
  早期無 Fixed Timestep 時，為修正 180Hz 螢幕速度偏快問題對所有速度數值乘以 3.0；
  Fixed Timestep 加入後補丁已無必要但數值基準保留，`lang/zh-TW.js` 速度描述在 v0.34.0
  數值調整時已同步與實際 `speedAdd` 一致。移除過時的「描述不一致」note 與待辦項目，
  更新說明為「✅ 文案 Fixed，無需再處理」，後續 AI 不需要繼續處理此問題。

---

## v0.42.0 - 2026-05-22

### 新增
- **版本更新公告系統**（`config/patchnotes.js`、`systems/ui.js`、`index.html`）：首頁左上角故事書按鈕下方新增「📋 更新」按鈕；新增 `showPatchNotes()` 面板（垂直 Tab 列顯示所有版本，未讀版本紅點 highlight，內容依「新增/修復/調整」分類顯示）；新增 `checkPatchNotesPopup()` 在首頁自動彈出未讀公告（新玩家跳過）；新增 `config/patchnotes.js` 統一管理所有版本公告資料（`PATCH_NOTES` 陣列，最新版本置頂）

### 修復
- **手機版 Boss/精英血條與玩家血條重疊**（`systems/ui.js`）：`drawTopBarUI()` 的 `y = 10` 改為動態偵測 `#top-left` DOM 元素高度並換算 Canvas 邏輯座標，手機/桌機自動適應
- **Boss 死亡後血條 UI 殘留**（`systems/boss.js`）：`showVictory()` 開頭加入 `gameState.topBarTarget = null; gameState.topBarFadeTimer = 0;`，確保勝利時血條立即清除

### 調整
- **草食性中立生物探索果子行為**（`systems/creatures.js`）：探索果子機率 30% → 60%，搜尋範圍 400px → 800px，休息機率 30% → 20%，隨機漫遊機率 40% → 20%

---

## v0.41.2 - 2026-05-22

### 修正
- **器官區域觸碰造成移動死區**（`systems/ui.js`）：`_attachJoystickListeners` `onStart` handler 中，命中 `_organHitRegions` 時移除 `continue`，讓觸碰在顯示（或略過）tooltip 後繼續執行搖桿啟動邏輯；`showOrganTooltip` 關閉時左下角器官區域不再成為無法移動的死區

---

## v0.41.1 - 2026-05-22

### 修正
- **器官提示開關同時管控桌機版**（`main.js`）：`mousemove` 事件在 `showTooltip` 呼叫前加入 `showOrganTooltip` 判斷，開關關閉時立即呼叫 `hideTooltip()` 並返回
- **隱藏器官 tooltip 無法點擊**（`systems/organs.js`）：`_organHitRegions` 隱藏器官的 y 座標從 `(sepBase + 2 + j) * lineH` 修正為 `(sepBase + 1 + j) * lineH`，使 hit region 與畫面上實際文字位置對齊（與普通器官公式一致）
- **器官提示開關在桌機版不顯示**（`systems/ui.js`）：移除 `showSettings()` 中包住 organTooltip toggle 的 `if (gameState.isMobile)` 條件，桌機版與手機版均可操作

---

## v0.41.0 - 2026-05-22

### 新增
- **手機版器官提示開關**（`systems/ui.js`、`systems/gameState.js`）：新增 `DEFAULT_SETTINGS.showOrganTooltip: true`；手機版設定面板「輔助功能」區塊新增「器官提示」ON/OFF toggle（桌機版隱藏）；關閉後點觸器官區域不顯示 tooltip，仍阻擋搖桿啟動
- **語言包**（`lang/zh-TW.js`、`lang/en.js`）：新增 `organTooltip` key

---

## v0.40.1 - 2026-05-22

### 修正
- **TOP10 浮窗縮放**（`systems/ui.js`）：桌機版 transform 恢復 `translateY(-50%)`（移除多餘的 `scale(0.65)`）；手機版改為 `scale(0.65)`（原為 `scale(0.55)`）

---

## v0.40.0 - 2026-05-22

### 新增
- **排行榜難度切換**（`config/supabase.js`、`systems/ui.js`）：`fetchVictoryRecords`、`fetchDefeatRecords`、`fetchTop10` 新增 `difficulty` 篩選參數；新增 `fetchAvailableDifficulties()` 查詢有資料的難度陣列（前端去重）
- **排行榜難度切換按鈕**（`systems/ui.js` `showLeaderboard()`）：標題列旁加入切換按鈕，點擊循環切換有資料的難度，顯示語言包文字（`diffEasy`/`diffNormal`等）；切換時同步更新 `_top10Difficulty`
- **TOP10 難度切換按鈕**（`systems/ui.js` `showStartScreen()`）：標題右側加入小切換按鈕，透過 `fetchAvailableDifficulties()` 循環切換；切換時同步更新 `_lbDifficulty`
- **模組級難度狀態**（`systems/ui.js`）：`_lbDifficulty`、`_top10Difficulty` 兩個模組變數保持同步；`_diffKey()` 輔助函式轉換語言包 key
- **分數上傳含難度欄位**（`systems/ui.js` `showScoreSubmitPopup()`）：上傳資料加入 `difficulty: gameState.lastDifficulty || 'easy'`
- **index.html fallback 更新**：`fetchVictoryRecords`/`fetchDefeatRecords`/`fetchTop10` 簽名同步；新增 `fetchAvailableDifficulties` fallback（回傳空陣列）

### 調整
- **TOP10 浮窗縮放**（`systems/ui.js`）：桌機版 transform 從 `translateY(-50%)` 改為 `translateY(-50%) scale(0.65)`，縮小版面不遮擋主選單；手機版維持 `scale(0.55)`

---

## v0.39.0 - 2026-05-22

### 新增
- **變異器官系統**（`systems/mutation.js`）：四種永久跨局器官（憤怒的獠牙/懦弱的尾巴/勇敢的翅膀/好奇的眼睛），各對 Final 值 +1%攻擊/最大HP/速度/XP倍數；升級費用每5級+1費（Lv0→1=1點）；獨立 localStorage key `mutationData`，不受 SAVE_VERSION 清除
- **變異點獲得**（`addMutationPoints`）：擊殺巨人化/Alpha/殺手化掉落變異點（Phase 3-4 已實作），即時顯示浮動文字 `✦ +N 變異點`
- **變異器官 UI**（`systems/ui.js`）：頂左 UI 第三行加入 ⚗️ 圖標 + 總等級，獲得新變異點時顯示紅點；點擊彈出升級面板（z-index 120，遊戲暫停）
- **補償機制**（`mutation.js`）：`MUTATION_COMPENSATION_VERSION` 控制，可按比例返還變異點和技能點，執行一次後記錄版本避免重複
- **applyAllMutationBonuses**（`mutation.js`）：遊戲初始化一次性套用，在所有器官效果之後；mid-game 升級用 delta 比值套用，避免複利誤算

### 調整
- `addXP()`（`systems/player.js`）：動態套用 `mutationXpBonus` 乘數
- `applyOrganEffects()`（`systems/organs.js`）：末尾呼叫 `applyMutationEffects()` 刷新倍率
- `isGamePaused()`（`main.js`）：加入 `mutationPanelOpen` 判斷
- `_joyPaused()`（`systems/ui.js`）：加入 `mutationPanelOpen` 判斷
- `initializeGame()`（`main.js`）：重置 `mutationPanelOpen = false`；呼叫 `applyAllMutationBonuses()`
- `window.onload`（`main.js`）：先呼叫 `initMutationData()` 載入變異資料
- **普通地圖 aggroRange**（`map/normalmap.js`）：`aggroRangeOverride: 2000 → 400`（原值等於全地圖鎖定，玩家完全無法躲避）

---

## v0.38.0 - 2026-05-22

### 新增
- **肉系吃屍體系統**（`systems/creatures.js`）：普通地圖肉系生物在漫遊/休息時偵測 60px 內屍體進入 `eating` 狀態，每 0.5s tick / 6 ticks（3秒）完成，期間 aggroRange×1.5，有生物進入則中斷；完成後 `_carnivoreEatCorpse` 成長（每具 +10% 基礎值，不累乘）+ 回血 5%
- **殺手化系統**（`systems/creatures.js`）：`corpseEaten >= 5` 觸發 `_triggerKiller`，aggroRange 翻倍、攻擊 +50%+之前10%累計、速度 +30%+之前10%累計；每5秒回血1%；繼續吃屍體每具再 +10% 基礎值；`handleKillerKill`（`systems/combat.js`）：XP×2（累乘 1.1^killerCorpseEaten）+ 3份屍體 + 變異點
- **精英怪回血**（`systems/elite.js`）：普通地圖 `eliteRegen`，第1/2/3夜每5秒回復 1%/2%/3% maxHP；`elite.tierIndex` 記錄夜晚等級
- **Boss回血**（`systems/boss.js`）：普通地圖 `bossRegen`，每10秒回復 10% maxHP
- **精英怪死亡掉落**（`systems/organs.js`）：`handleEliteKill` 呼叫 `spawnLootCircle`，散落 1 個 1 倍屍體 + 4 具白骨
- **`baseRadius`**（`systems/spawning.js`）：`_makeCarnCreature` 新增 `baseRadius: 10` 欄位，供吃屍體成長計算使用

### 調整
- `handleKill`（`systems/combat.js`）：開頭新增 `isKiller` 判斷，路由至 `handleKillerKill`
- 舊肉系即時吃屍體邏輯（舊 Phase 1 簡易版）完全替換為新 tick-based `eating` 狀態系統

---

## v0.37.0 - 2026-05-22

### 新增
- **巨人化系統**（`systems/creatures.js`）：草系生物吃滿5顆果子觸發（普通地圖限定），攻擊力+20、血量×10、體積×1.5、aggroRange 150、每秒回復1%血；組隊系統（同族上限5隻，跟隨範圍800px，隊員等待機制）；`_triggerGiantization()` 輔助函式
- **Alpha系統**（`systems/creatures.js`）：隊伍出現第2隻巨人化時，隊長升格Alpha，全圖唯一（`gameState.alphaCreature`），攻擊力翻倍/血量×3/體積×1.5/aggroRange 300/每秒回復2%血；`_triggerAlpha()` 輔助函式；`showAlphaAnnouncement()` 全屏3秒公告
- **上方血條UI**（`systems/ui.js`）：`drawTopBarUI()` 函式，玩家2000px內有特殊目標時頂部顯示血條（寬400px），追蹤最後被普通攻擊命中的目標，目標死亡/超出範圍後0.5秒淡出
- **handleGiantKill**（`systems/combat.js`）：巨人化/Alpha專屬擊殺獎勵，包含XP（60/200）、`spawnLootCircle` 掉落、變異點（預留Phase 5）
- **addMutationPoints**（`systems/combat.js`）：Phase 5 預留空函式

### 調整
- 移除草系生物的激進化邏輯（`diet=aggressive`），由巨人化系統取代
- `playerAttack()`：命中精英/Boss/巨人化時設定 `gameState.topBarTarget`；巨人化擊殺路由至 `handleGiantKill`
- `updateStatusEffects()`：狀態異常（毒/流血）擊殺巨人化生物時正確路由至 `handleGiantKill`
- `gameState` 新增三個欄位：`alphaCreature`、`topBarTarget`、`topBarFadeTimer`
- `initializeGame()` 再來一場重置時清空上述三個欄位

---

## v0.36.0 - 2026-05-22

### 新增
- **`map/normalmap.js`**：普通難度地圖配置，含地形參數（中心森林 400px）、生物強度 ×1.5、aggroRange 2000、移除速度/傷害 cap（`removeHostileCap`）、精英/Boss 強化數值、專屬 features 開關
- **普通難度解鎖**（`systems/ui.js`）：難度選擇頁面普通難度從 🔒 改為可選，寫入 `NORMAL_MAP`
- **`BIOME_CREATURES`**（`config/creatures.js`）：六種命名生物（駝鹿/猞猁/巨型甲虫/鱷魚/駱駝/鬣狗），各自對應生態區
- **生態生物生成系統**（`systems/spawning.js`）：`spawnBiomeCreatures()` 替換舊 grid 生成；草系初始 10 隻 × 3 區、肉系 8 隻 × 3 區；`_randomPointInBiome` 拒絕採樣確保在正確生態區；6 個獨立計時器（各生態區各草/肉系）；少於 3 隻時間隔 ×0.3 加速
- **生物三態移動**（`systems/creatures.js`）：`creature.biome` 標記的生物使用 wandering（Perlin Noise 平滑）/ resting（1.5 秒，可被中斷）/ attacking 三態；草系偶爾探索果子、肉系偶爾探索獵物

### 調整
- **簡單地圖肉系限制**（`systems/creatures.js`）：肉系吃屍體成長邏輯由 `features.hostileEatMeat` 控制，EASY_MAP 無此 feature → 預設不執行
- **`gameState.spawnTimers`**（`systems/gameState.js`）：由 `{ neutral, hostile }` 改為 `{ forest_herb, forest_carn, ocean_herb, ocean_carn, desert_herb, desert_carn }`

---

## v0.35.0 - 2026-05-22

### 修復
- **Boss毒傷未生效**（`systems/combat.js`）：`updateStatusEffects()` 的生物 loop 新增 `bossArr`，使 Boss 正常接受毒傷 tick；Boss 死亡時走 `showVictory()`，不走 `handleKill()`
- **念力波擊殺XP寫死**（`systems/player.js`）：`updatePassiveOrgans()` 的念力波擊殺改為統一走 `handleKill(c, true)`，移除寫死的 `addXP(30)` 和手動 `corpses.push`；補齊獵人本能加成、屍體生成、XP 浮動文字

### 新增
- **毒傷減免系統**（`systems/combat.js`）：精英怪 20%、Boss 通用 30%、沙漠蠍王 50%；`updateStatusEffects()` 毒傷 tick 依目標類型計算減免後實際傷害，浮動數字顯示實際扣血值
- **圓形散落全局函式 `spawnLootCircle`**（`systems/utils.js`）：圓形平均角度散落掉落物，距中點 10~25px 隨機；單個物品隨機角度；支援 type：`corpse`（含 multiplier 縮放）、`bone`；易擴充設計供後續 Phase 使用

---

## v0.34.1 - 2026-05-21

### 修復

#### UI 修復
- **圖鑑組合效果器官名稱顯示**（`systems/ui.js`）：`showCompendium` 的器官圖鑑頁，組合效果（COMBOS）標題原本直接使用 `combo.ids.join(' + ')` 顯示 id 字串（如 `poisonStinger + poisonSac`）；新增 `getOrganDisplayName(id)` helper（優先從 `ORGANS` 取名，其次 `HIDDEN_ORGANS`，fallback 回 id），組合標題改為 `combo.ids.map(id => getOrganDisplayName(id)).join(' + ')`，正確顯示中文名稱（如「毒刺 + 毒囊」）

### 調整

#### 手機 UI
- **手機版首頁 TOP10 排行榜縮小為 55%**（`systems/ui.js`）：手機裝置下 TOP10 浮窗套用 `scale(0.55)` CSS 縮放（原 `scale(0.7)`），`transform-origin` 改為 `top right`，`top` 改為 `16px`，確保浮窗從右上角縮放不超出畫面

---

## v0.34.0 - 2026-05-21

### 修復

#### Bug 修復
- **毒囊繼承 Bug**（`systems/evolution.js`）：`buildSkillTreeOverlay` 的器官繼承選單現在正確過濾 `noInherit: true` 的器官（毒囊），使其不再出現於繼承選擇清單
- **再來一場→技能樹→開始遊戲 無法移動 Bug**（`main.js`）：`initializeGame()` 開頭新增完整狀態重設區塊，確保 `gameState.gameOver`、`skillTreeOpen`、`organSelectionActive` 等旗標在重新遊戲時歸零，修復 `isGamePaused()` 誤回傳 `true` 導致玩家無法移動的問題

#### UI 修復
- **左下角隱藏器官清單跑版**（`systems/organs.js`）：重構 `drawOrganUI()` 的隱藏器官繪製邏輯；分隔行（`sepBase+1`）專門繪製分隔線，器官名稱從 `sepBase+2` 開始，hit region 同步修正，確保所有文字在背景方塊內正確顯示

### 調整

#### 器官數值
- **大長腿**（`config/organs.js`、`lang/zh-TW.js`、`lang/en.js`）：各級移動速度 +1.5 → +1
- **強大的心臟**（`config/organs.js`、`lang/zh-TW.js`、`lang/en.js`）：HP上限+100 → HP上限+60

#### 組合效果調整（`config/organs.js`、`systems/organs.js`、`systems/combat.js`）
- **移除**原有三器官組合（蟹鉗+毒刺+毒囊）
- **新增** `comboCrabPoison`：毒刺Lv3 + 擁有毒囊即觸發 → 毒傷翻倍
- **新增** `comboCrabGloves`：蟹鉗+搏擊拳套各達Lv3 → 流血傷害翻倍、命中施加回復量-50%
- `gameState.player` 新增 `comboCrabGloves` 旗標；`checkComboEffects()` 對 `comboCrabPoison` 採用特殊判斷邏輯

#### 靈敏知覺重設計（`config/organs.js`、`systems/ui.js`、`lang/zh-TW.js`、`lang/en.js`）
- Lv1：維持顯示果子最佳路徑（紅線，1000px 偵測範圍）
- Lv2：新增追蹤最近屍體（黃線），使用 `wrappedDistance` 計算最近目標
- Lv3：新增追蹤最近白骨（白線），同上邏輯
- 三條線可累積同時顯示；`perceptionRange` 維持 1000px 不再隨等級增加

#### 鏡頭與縮放（`systems/camera.js`、`systems/ui.js`）
- 鏡頭邊界觸發距離：25% → 30%（`marginX/Y = VIEW_W/H * 0.30`）
- 手機遊戲縮放比例：`MOBILE_GAME_SCALE` 0.7 → 0.6

### 新增

#### 結算畫面技能點明細（`systems/evolution.js`、`systems/boss.js`、`systems/gameState.js`）
- `gameState.sessionSkillPoints = { elite: 0, boss: 0 }` 追蹤本局各來源技能點
- `handleEliteKill` 在擊殺精英後累加 `sessionSkillPoints.elite`
- 死亡/超時結算畫面：顯示精英獎勵（`skillPtElite`）、時間獎勵、等級獎勵明細
- 勝利結算畫面：顯示 Boss 獎勵（+5）、精英獎勵、時間獎勵、等級獎勵明細；`sessionSkillPoints.boss = 5` 在勝利時記錄

#### 手機首頁 TOP10 面板縮放（`systems/ui.js`）
- 手機裝置下 TOP10 排行榜面板套用 `scale(0.7)` CSS 縮放，`transform-origin: right center`

### 語言檔更新（`lang/zh-TW.js`、`lang/en.js`）
- 大長腿速度描述 +1.5 → +1
- 靈敏知覺 Lv2/Lv3 描述更新（屍體黃線 / 白骨白線）
- 強大的心臟描述 HP+100 → HP+60
- `comboCrabPoison` 描述更新（條件從三器官改為毒刺Lv3+毒囊）
- 新增 `comboCrabGloves` 描述

---

## v0.33.0 - 2026-05-21

### 新增

#### 首頁童書故事系統（`systems/ui.js`、`main.js`）
- **首頁童書故事按鈕**：首頁左上角新增 📖 圖示按鈕，暖黃色半透明設計，hover 輕微放大，點擊觸發 `showGuideStory()`
- **噪鹃生存記 Guide Story 系統**：新增 `showGuideStory()` 和 `_getGuideStoryPages()`；童書風格 UI（米黃紙質背景、深棕文字），4 頁故事各附 SVG 動畫插畫（破曉 / 孤兒 / 蛻變 / 試煉），翻頁進度點導航，關閉按鈕，手機版插畫縮小至 140px
- **First Time Player 判斷**：`window.onload` 改為檢查 `localStorage.hasPlayedBefore`；首次玩家自動彈出 Guide Story；`initializeGame()` 開頭與 Guide 最後一頁「開始冒險」均寫入標記

---

## v0.32.1 - 2026-05-20

### 修復

#### 毒刺 Bug 修復（`systems/combat.js`）
- **Bug 1 — 毒計時器被重置**：`playerAttack()` 的毒刺邏輯改為只在敵人未中毒時才初始化 `lastPoisonTick`；重複攻擊不重置計時器，確保毒傷每秒正常 tick
- **`updateStatusEffects()` 毒傷 tick**：`c.lastPoisonTick = now` 改為 `c.lastPoisonTick += 1000`，避免誤差累積導致毒傷中斷
- **Bug 2 — 只有毒刺沒有攻擊力時無法攻擊**：攔截條件改為同時判斷 `p.attack <= 0 && !hasPoison`（`poisonStinger > 0` 或 `poisonSac.level > 0`），有毒性器官時可正常觸發攻擊

### 調整

#### 技能樹平衡（`config/evolution.js`、`systems/evolution.js`）
- **記憶器官**：死亡保留器官數改為預設 0 個（原預設 1 個）；Lv1=1個，Lv2=2個，Lv3=3個；`organsToKeep` 公式改為 `gameState.playerSkills.organMemory || 0`
- **恐怖之牙**：Lv3 開局強制設定獠牙 Lv1；Lv5 開局強制設定獠牙 Lv2（覆蓋 Lv3 效果）；新增 `_setFangLevel(targetLv)` 工具函式，支援升級已繼承的獠牙器官
- **收集成癮**：描述更新為「收集範圍+10px（果子、屍體和白骨，每級）」（白骨吞噬距離已使用 `p.pickupRange`，此為描述修正）

#### 語言包更新（`lang/zh-TW.js`、`lang/en.js`）
- 同步更新 `organMemory`、`terribleFang`、`collectionAddiction` 的技能描述文字

---

## v0.32.0 - 2026-05-20

### 新增 / 修改

#### 技能點系統重整

- **移除** 死亡/勝利後固定給 1 技能點的邏輯（`showSkillTree`、`showVictory`）
- **精英怪擊殺**（`systems/organs.js` `handleEliteKill`）：依夜晚編號給點：第1夜 +1、第2夜 +2、第3夜 +3
- **Boss擊殺**（`systems/boss.js` `showVictory`）：+5技能點
- **時間獎勵**（死亡/勝利結算時）：`Math.floor((600 - timeRemaining) / 180)`，最多3點
- **等級獎勵**（死亡/勝利結算時）：`Math.floor(player.level / 6)`
- 結算畫面顯示本局技能點明細（時間/等級/Boss獎勵）

#### 技能升級費用改為階梯式（`systems/evolution.js` `upgradeSkill`）
- Lv1費1點、Lv2費2點、Lv3費3點、Lv4費4點、Lv5費5點
- 技能樹按鈕動態顯示「升級（費N點）」，點數不足時按鈕變灰

#### 其他
- `SAVE_VERSION` 1.0 → 1.1（自動清除舊技能點存檔）
- 語言 key：`upgradeCost1` → `upgradeCostN`（含 `{n}` 占位符）；新增 `skillPtTime`、`skillPtLevel`、`skillPtElite`、`skillPtBoss`

---

## v0.31.1 - 2026-05-20

### 修復

- **重整結算畫面按鈕流程**（`systems/boss.js`、`systems/evolution.js`）
  - 勝利和死亡結算畫面統一顯示 3 個按鈕：「前往技能樹」「🏠 回到首頁」「⚔️ 再來一場」
  - 「前往技能樹」→ `buildSkillTreeOverlay(mode='postGame')`，底部顯示「🏠 回到首頁」+「⚔️ 再來一場」，直接執行無警告
  - 「🏠 回到首頁」（從結算畫面）→ warn-once 提示，再按一次確認返回首頁
  - 「⚔️ 再來一場」（從結算畫面）→ 強制進入 `buildSkillTreeOverlay(mode='forceStart')`，底部只顯示「▶ 開始遊戲」
  - `buildSkillTreeOverlay` 新增 `mode` 參數（`postGame` / `forceStart` / `fromHome`），透過 `_skillTreeMode` 全域變數在 reset / upgrade 時正確保留模式
  - 移除 `gameState.homeWarned`、`gameState.playAgainWarned`（改為結算 overlay 內的 local 變數）
  - 移除 `btnSaveAndHome`、`warnNoOrganLine1`、`warnNoOrganLine2`、`warnNoOrganPlay` 語言 key

---

## v0.31.0 - 2026-05-20

### 新增

#### 進化系統擴展至 Lv5（`config/evolution.js`、`systems/evolution.js`）
- 草食性、肉食性、雜食性三條路線各從 Lv3 擴展至 Lv5
- 草食性 Lv4/5：增加體型（`radiusPercent`）+ 中立生物完全友善（`friendly: true`）
- 肉食性 Lv4/5：攻擊力持續增加，攻速累積加成（`attackSpeedBonusAdd` 最高 +30%）
- 雜食性 Lv1~5：改為速度加成 + 白骨系統整合，移除舊版果子/屍體 XP 加成
- 肉食性不再需要草食性前置；雜食性需草食 ≥1 且肉食 ≥1
- 雜食性 Lv1 自動授予毒囊器官（`_grantPoisonSac`）

#### 器官系統大改（`config/organs.js`、`systems/organs.js`）
- 重寫所有器官數值以符合實際平衡設計
  - 蟹鉗：流血持續時間 10 秒、每秒傷提升
  - 搏擊拳套：攻速改為 10%/15%/15%（非累乘）
  - 毒刺：移除 Lv1 攻擊加成，改為純中毒傷害
  - 大長腿：每級 +1.5 速度（原 +0.5）
  - 龜殼：每級 -10% 傷害 -1 速度（統一）
  - 厚皮：HP 20/30/50，半徑加成只在 Lv2/3
  - 刺甲：改為「反彈最大HP百分比」，每級 +5%（最高 15%）
  - 真視之眼：Lv1 只加暴擊率，不加暴擊倍數
  - 靈敏知覺：完全改版為「偵測範圍內果子並顯示最佳採集路徑」
  - 超自然回復：Lv2/3 新增回復最大HP 0.5%
- 新增特殊器官 **毒囊**（`poisonSac`）：`noSelection: true, noInherit: true`，10 個等級，透過白骨素門檻自動升級
- 新增隱藏器官 **強大的眼睛**（`strongEye`）：暴擊率+10%、暴擊傷害+0.25、體型+20%
- 所有組合效果（COMBOS）改為「兩/三方器官各達 Lv3 才觸發」
- 蟹毒組合改為三方：蟹鉗 + 毒刺 + 毒囊

#### 白骨系統（`systems/combat.js`、`systems/ui.js`）
- 屍體超過 60 秒自動轉化為白骨；被吃掉的屍體也生成白骨
- 雜食性玩家可吞噬白骨（有時間進度條），吞噬後增加白骨素（`boneMaterial`）
- 白骨素累積達門檻時自動升級毒囊（10 個門檻：5/10/20/40/60/100/120/140/160/200）
- 白骨以白色圓形顯示在地圖上，帶吞噬進度條

#### 靈敏知覺算法（`systems/player.js`）
- 新函式 `findBestPerceptionPath(player, fruits, detectionRange)`
- 以候選角度 ±5° 容差窗口篩選果子，計算效率（距離/數量），返回最佳路徑端點
- 繪製紅色虛線指向最佳目標 + 目標果子閃爍點

#### 大腦充能條與衝擊波（`systems/ui.js`）
- 大腦激活時在玩家下方繪製 4px 藍色充能條（`#4488FF`）
- 大腦觸發時推入 `gameState.brainShockwaves[]`，繪製擴張衝擊波圓環（600ms，淡出）

#### 圖鑑系統（`systems/ui.js`、`main.js`）
- 首頁「遊戲說明」按鈕改為「📖 圖鑑」，呼叫 `showCompendium('guide')`
- 遊戲內右上角新增 📖 圖鑑按鈕（`_drawCompendiumBtn`），點擊開啟器官頁
- `showCompendium(startTab)` 三分頁：遊戲說明 / 器官圖鑑 / 進化系統
- 器官頁列出所有普通器官 + 隱藏器官 + 毒囊說明 + 組合效果
- 進化頁列出三條路線 Lv1~5 詳細說明
- 開啟時暫停遊戲（`organSelectionActive = true`），關閉時恢復

#### gameState 更新（`systems/gameState.js`）
- `critMultiplier` 初始值改為 `1.5`
- 新增 `player.boneMaterial: 0`、`player.perceptionRange: 0`、`player.naturalRegenHpMaxPercent: 0`
- 新增陣列 `gameState.bones: []`、`gameState.brainShockwaves: []`

#### 語言包更新（`lang/zh-TW.js`、`lang/en.js`）
- 新增 `compendium`、`compendiumTitle`、`compendiumTabGuide/Organs/Evo`
- 新增 `compendiumSacHint`、`compendiumHiddenOrgans`、`compendiumCombos`
- 新增 `boneMaterialFloat` 浮動文字
- 更新所有器官描述以反映新數值
- 更新進化路線描述，加入 Lv4/5
- 更新 `guideEvo4`：每條路線最高 5 級
- 更新進化系統說明頁，加入白骨系統介紹
- 新增隱藏器官 `strongEye` 描述

---

## v0.30.2 - 2026-05-20

### 修復
- **手機版器官 tooltip 無法觸發**（`systems/ui.js`）：`onStart` handler 在確認觸點落在 `gameCanvas` 後，換算 canvas 內部座標並比對 `_organHitRegions`，命中時呼叫 `showTooltip()` 並以 `setTimeout 500ms` 自動 `hideTooltip()`，然後 `continue` 不啟動搖桿，修復全螢幕模式下左下角器官區域觸碰無法顯示 tooltip 的問題

---

## v0.30.1 - 2026-05-20

### 修復
- **全螢幕搖桿攔截 HTML UI 點擊**（`systems/ui.js`）：`_attachJoystickListeners()` 的 `onStart` handler 在 for 迴圈開頭以 `document.elementFromPoint()` 判斷觸點目標，若不是 `gameCanvas` 或 `joystick-canvas` 則 `continue`，確保齒輪、小地圖、overlay 按鈕等 HTML UI 元素的 touch 事件不被搖桿邏輯攔截，修復全螢幕模式下按鈕無法點擊的問題

---

## v0.30.0 - 2026-05-19

### 新增
- **全螢幕移動區域**（`systems/ui.js`）：`_joyZone()` 改為 `!_attackZone(x, y)`，手機版非攻擊區的任意位置均可作為搖桿起始點
- **攻擊區重構為右下角矩形**（`systems/ui.js`）：直向為右50%×下25%、橫向為右25%×下50%；`_getAttackBtnPos()` 回傳矩形正中心；視覺改為 ⚔️ 置中、透明度 0.2、無邊框
- **自動攻擊功能**（`systems/gameState.js`、`systems/ui.js`、`main.js`、`systems/input.js`）：`DEFAULT_SETTINGS` 新增 `autoAttack: false`；遊戲主迴圈每幀偵測條件自動呼叫 `playerAttack()`；`Z` 鍵可即時切換並存檔
- **設定介面輔助功能區塊**（`systems/ui.js`）：按鍵設定縮至65%寬，旁邊新增35%「輔助功能」區塊，內含自動攻擊 ON/OFF toggle；電腦版顯示「Z 鍵切換」提示
- **⚔️ 自動指示器**（`systems/ui.js`）：自動攻擊開啟時，手機版在攻擊區中心顯示「⚔️ 自動」32px；電腦版在畫布正中央顯示「⚔️ 自動」100px；透明度均為 0.2
- **遊戲說明第一頁更新**（`systems/ui.js`）：電腦版加入自動攻擊說明；手機版左欄更新移動/攻擊說明並加入自動攻擊，右欄改為 SVG 手機示意圖（移動區/攻擊區，支援中英文）
- **語言 key 新增**（`lang/zh-TW.js`、`lang/en.js`）：`sectionAccessibility`、`autoAttack`、`autoAttackHint`、`guideAutoAttack`、`guideMobileMove2`、`guideMobileAttackZone`

---

## v0.29.5 - 2026-05-19

### 修復
- **minimap-playtime 改為緊貼生態顯示**（`index.html`）：`#minimap-info` 的 `justify-content` 從 `space-between` 改為 `flex-start`，使生態系與遊玩時間緊靠左側；右側時間 span 加上 `margin-left:auto` 維持靠右對齊

---

## v0.29.4 - 2026-05-19

### 修復
- **minimap 遊玩時間顯示改為即時累加**（`systems/ui.js`）：`rpt` 計算從純讀 `gameState.realPlayTime` 改為加上 `Date.now() - _playTimerStart` 的當前區段時間，使小地圖計時器每幀即時更新而非只在暫停/繼續時才跳動

---

## v0.29.3 - 2026-05-19

### 修復
- **resumePlayTimer 初始條件導致計時器未啟動**（`main.js`）：移除 `if (gameState._playTimerPaused)` 條件判斷，改為無條件設定 `_playTimerStart`，修復遊戲開始時計時器因 `_playTimerPaused` 初始值為 `false` 而未啟動的問題

---

## v0.29.2 - 2026-05-19

### 新增
- **小地圖真實遊玩時間顯示**（`index.html`、`systems/ui.js`）：在小地圖 `#minimap-info` 的生態系 span 後新增 `#minimap-playtime`，每幀將 `gameState.realPlayTime`（毫秒）換算為 `mm:ss` 格式即時顯示於小地圖資訊欄

---

## v0.29.1 - 2026-05-19

### 修改
- **排行榜查詢與分頁重構**（`config/supabase.js`、`systems/ui.js`、`index.html`）：拆分原本 `fetchLeaderboard` 為 `fetchVictoryRecords()`（勝利，最多 100 筆，按 version_order.desc / play_time.asc / boss_kill_time.asc 排序）與 `fetchDefeatRecords(limit)`（失敗，按 version_order.desc / play_time.desc / score.desc 排序）；排行榜開啟時先抓勝利記錄，計算剩餘名額再抓失敗記錄，合併後存入 `allRows`；`loadPage` 改為純前端切片分頁，無翻頁 network request；`index.html` fallback 同步更新

---

## v0.29.0 - 2026-05-19

### 新增
- **真實遊玩時間計時系統**（`main.js`、`systems/gameState.js`、`systems/organs.js`、`systems/evolution.js`、`systems/boss.js`、`systems/ui.js`）：新增 `realPlayTime`、`_playTimerStart`、`_playTimerPaused` 三個欄位至 `gameState`；新增全域函式 `pausePlayTimer()` / `resumePlayTimer()`；`gameLoop` 每幀透過 `_wasPaused` 偵測暫停狀態切換並自動呼叫對應函式；`handleEliteKill` 開頭/結尾各呼叫 `pausePlayTimer()` / `resumePlayTimer()` 以排除精英怪擊殺跳天的時間；`showSkillTree` 與 `showVictory` 結束時呼叫 `pausePlayTimer()` 定格最終時間；排行榜上傳的 `play_time` 改用 `realPlayTime / 1000`（秒），排除所有暫停介面與跳天時間

---

## v0.28.5 - 2026-05-19

### 重構
- **手機端遊戲畫面縮放系統重構**（`systems/ui.js`）：新增 `MOBILE_GAME_SCALE = 0.7` 常數；手機橫向邏輯解析度改為 `1120×630`（1600×900 × 0.7），手機直向改為 `630×1120`（長短邊對調），scale 皆以 `vw / logicW` 填滿螢幕寬度；修正 `_setViewSize` 呼叫從寫死 `900` 改為正確傳入 `logicH`

---

## v0.28.4 - 2026-05-18

### 修復
- **死亡後無器官卻被強制進入器官保留畫面**（`systems/evolution.js`）：`buildSkillTreeOverlay` 新增器官判斷，當 `playerOrgans.length === 0 && hiddenOrgans.length === 0` 時直接跳過器官保留區塊，不顯示該 section；同時修正「回首頁」按鈕從永遠封鎖改為 warn-once（首次點擊顯示確認警告，再按一次才跳轉），並新增 `gameState.homeWarned` 旗標；「再玩一局」按鈕同步加入 `noOrgansToSelect` 判斷，無器官時不觸發警告直接繼續；新增語言 key `warnNoOrganHome`（中英文）

---

## v0.28.3 - 2026-05-18

### 修復
- **分數上傳 400 錯誤**（`systems/ui.js`）：`submitScore` 傳入的 `score`、`level`、`play_time`、`boss_kill_time`、`version_order` 全部套用 `Math.floor()`，確保傳送整數而非浮點數，避免 Supabase 型別驗證回傳 400

---

## v0.28.2 - 2026-05-18

### 修復
- **死亡後不出現分數上傳彈窗**（`systems/evolution.js`）：`showSkillTree()` 原本直接呼叫 `buildSkillTreeOverlay(cause)`，完全跳過了分數提交流程；修復為先呼叫 `showScoreSubmitPopup(false, null, () => buildSkillTreeOverlay(cause))`，與勝利畫面的流程一致；開發者模式下仍直接跳過

---

## v0.28.1 - 2026-05-18

### 修復
- **橫向手機排行榜按鈕被導航列遮住**（`systems/ui.js`）：排行榜 overlay 在開啟時動態計算高度（讀取 game-container 的 scale 值，以 `window.innerHeight / scale` 為上限），確保 overlay 不超出視窗；pagingBar 改用 `padding-bottom: max(20px, env(safe-area-inset-bottom))`，兼顧 iOS 安全區域，並加入 `flex-shrink:0` 防止被壓縮

---

## v0.28.0 - 2026-05-18

### 修復
- **豎向手機模式開始畫面未縮放**（`systems/ui.js`、`systems/evolution.js`）：`showStartScreen()`、`showMapSelect()`、`showSettings()`、`showGuide()`、`showLeaderboard()`、`buildSkillTreeOverlay(fromHome/startAfter)` 開頭均加入 `applyDeviceMode()`，確保所有畫面都正確套用手機縮放
- **非遊戲畫面出現虛擬搖桿**（`systems/gameState.js`、`main.js`、`systems/ui.js`）：新增 `gameState.gameStarted` 旗標（預設 `false`），`initializeGame()` 時設為 `true`；`_joyPaused()` 加入 `!gameState.gameStarted` 判斷，首頁/技能樹/設定等畫面搖桿不再出現
- **排行榜被搖桿層遮住無法點擊**（`systems/ui.js`）：排行榜 overlay z-index 從 300 提升至 500，關閉按鈕加上 `pointer-events:all`

### 新增
- **開始流程加入技能樹前置**（`systems/ui.js`、`systems/evolution.js`）：難度與角色選擇頁的「開始遊戲 →」按鈕，若 `savedOrgans` 為空則強制先進入技能樹；技能樹此模式底部僅顯示「開始遊戲 →」按鈕，點擊後才真正啟動遊戲；有器官資料則直接開始
- **結算畫面兩顆按鈕**（`systems/evolution.js`、`systems/boss.js`、`lang/zh-TW.js`、`lang/en.js`）：死亡/逾時技能樹畫面與勝利畫面底部改為「💾 保存並返回首頁」+「⚔️ 再來一場」；未選器官點「保存並返回」時顯示 3 秒警告橫幅；「再來一場」第一次點擊在未選器官時顯示確認提示，第二次才真正開始（透過 `gameState.playAgainWarned` 追蹤）
- 新增 `gameState.lastDifficulty` 記錄上局難度、`gameState.playAgainWarned` 追蹤是否已提醒
- 新增語言 key：`btnSaveAndHome`、`warnNoOrganLine1`、`warnNoOrganLine2`、`warnNoOrganPlay`（中英文）

---

## v0.27.1 - 2026-05-18

### 新增
- **排行榜防作弊機制**（`systems/gameState.js`、`systems/ui.js`、`systems/boss.js`、`systems/daynight.js`、`main.js`）：新增 `gameState.devModeUsed` 旗標，啟動開發者模式時設為 `true` 且本局不可重置；遊戲結束時若偵測到旗標，完全跳過分數上傳彈窗並於結束畫面顯示「⚠️ 本局使用了開發者模式，分數不計入排行榜」；`initializeGame()` 重新開局時重置為 `false`

---

## v0.27.0 - 2026-05-18

### 新增
- **Supabase 全球排行榜系統**（`config/supabase.js`、`systems/ui.js`、`systems/boss.js`、`systems/daynight.js`、`lang/zh-TW.js`、`lang/en.js`、`index.html`）：串接 Supabase REST API，實作完整排行榜功能
- **首頁 TOP 10 浮窗**（`systems/ui.js`）：首頁右側新增固定浮窗，自動讀取前10名，顯示排名圖示、名字、遊玩時間、勝負結果
- **完整排行榜介面**（`systems/ui.js`）：點「🏆 排行榜」開啟全屏排行榜，表格含排名/版本/日期/名字/遊玩時間/分數/等級/結果，前三名有金銀銅底色；支援鍵盤 A/←→/D 翻頁，每頁20筆分頁讀取
- **分數提交彈窗**（`systems/ui.js`）：遊戲結束（死亡/勝利）前彈出名字輸入視窗，提交或跳過後進入結束畫面；上傳欄位含 name/score/level/play_time/is_victory/boss_kill_time/version/version_order
- **皇冠排名圖示**（`index.html`）：CSS 繪製金銀銅三色皇冠（`buildCrown()`），4–10名🎖️，11名後顯示數字
- **Boss 生成時間記錄**（`systems/boss.js`）：`spawnBoss()` 記錄 `gameState.bossSpawnTime`，擊殺後計算 `boss_kill_time` 秒數上傳
- **首頁新增排行榜按鈕**（`systems/ui.js`）：按鈕順序調整為開始遊戲 / 技能樹 / 遊戲說明 / 排行榜 / 設定
- **雙語支援**（`lang/zh-TW.js`、`lang/en.js`）：新增21個排行榜相關 lang key

---

## v0.26.1 - 2026-05-17

### 修復
- **手機版說明第1頁左半缺少兩項**（`systems/ui.js`）：`buildPage0()` 手機分支左欄補上 `guideFruit`（吃果子）與 `guideGoal`（目標），與桌機版5項一致

---

## v0.26.0 - 2026-05-17

### 新增
- **遊戲說明系統全面重構**（`lang/zh-TW.js`、`lang/en.js`、`lang.js`、`systems/ui.js`、`index.html`）：說明介面由舊版 `guidePages` 陣列改為扁平 lang key 架構，支援逐 key fallback（當前語言 → en → zh-TW）
- **說明頁擴充至4頁**（`systems/ui.js`）：第1頁基本操作（桌機）或左右分欄觸控操作（手機）、第2頁器官系統、第3頁進化系統、第4頁小地圖說明；桌機手機頁數統一
- **手機第1頁觸控示意圖**（`systems/ui.js`）：右半欄新增橫向模式示意圖（144×80px，左30%攻擊區/右30%搖桿區）與直向模式示意圖（90×108px，上60%遊戲畫面/下40%攻擊+搖桿），使用絕對定位 HTML div 繪製
- **說明介面鍵盤換頁**（`systems/ui.js`）：開啟說明時監聽 `D/→`（下一頁）、`A/←`（上一頁）；`hideGuide()` 自動移除監聽器（`_guideKeyHandler`），防止殘留
- **小地圖圖例動畫**（`index.html`、`systems/ui.js`）：新增 `@keyframes dotBlink`（opacity 閃爍，玩家/草食精英/肉食精英）與 `@keyframes dotGlow`（box-shadow 光暈，三種Boss），霧區改用方形色塊（rgba(255,255,255,0.3)）
- **大量新增 lang key**（`lang/zh-TW.js`、`lang/en.js`）：新增 `guideTitle/guidePage/guideClose/guidePrev/guideNext`、第1頁桌機5條、手機6條、觸控2條、第2頁器官7條、第3頁進化5條、第4頁地圖10條，共新增40+ keys

---

## v0.25.0 - 2026-05-17

### 新增
- **橫向手機搖桿動態定位**（`systems/ui.js`）：移除橫向模式固定底環（`vw×0.85, vh×0.5`），改為玩家在搖桿區任意位置按下時，以該觸點為搖桿中心動態生成；`onStart` 移除 `orientation === 'landscape'` 分支，兩個方向統一使用 `_joyBaseX = x; _joyBaseY = y`
- **攻擊區點擊視覺回饋**（`systems/ui.js`）：新增 `_atkFeedbackTime / _atkFeedbackX / _atkFeedbackY` 三個狀態變數；攻擊區 `touchstart` 觸發時記錄座標與時間；`_renderMobileOverlay` 每幀在點擊位置繪製半透明 ⚔️，300ms 內線性淡出
- **橫向手機觸控區域視覺提示重繪**（`systems/ui.js`）：攻擊區與搖桿區各以 `rgba(255,255,255,0.1)` 細邊框標示範圍；攻擊區中央 ⚔️ 透明度降至 0.1；搖桿區改為 0.1 透明度的外環 + 內圈提示圓，替代原本 0.2 透明度固定底環
- **`_renderMobileOverlay` 每幀刷新**（`systems/ui.js`、`main.js`）：在 `drawGame()` 末尾加入 `if (gameState.isMobile) _renderMobileOverlay()`，確保攻擊點擊淡出動畫於每幀正確渲染；原觸控事件內的呼叫保留以維持即時反應

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
