> ⚠️ 此文件已歸檔（ESM 遷移於 v0.1.5.0 完成）。僅供歷史參考，不需執行。

# ESM 遷移進度追蹤
# 只吃不叫的噪鵑（The Silent Koel）
#
# ⚠️ 三方注意事項：
#   Claude Chat / Claude Code / Codex 每次開始工作前【必須先讀這份文件】
#   每個步驟完成後【必須立即更新這份文件】
#   這份文件是三方的共同記憶，不更新等於讓隊友瞎眼工作

---

## 當前狀態快照

```
所在 Stage   : Stage 4 — Branch 對調（進行中）
目前批次     : esm-refactor 正在 merge 進 master
分支狀態     : master（merge 進行中）
最後更新     : 2026-06-06
最後操作者   : Claude Code（Stage 4 Branch 對調）
```

---

## 各 Stage 完成狀態

### Stage 0 — 準備工作
- [x] S0-1：確認 5 個版本號檔案全部一致
- [x] S0-2：建立 `esm-refactor` 分支
- [x] S0-3：確認所有 ESM 文件套件存在
- [x] S0-4：初始 commit 完成

### Stage 1 — Codex 依賴審計
- [x] S1-1：Codex 執行依賴審計
- [x] S1-2：`docs/dependency_map.md` 產出
- [ ] S1-3：你 + Claude Chat 人工確認內容
- [ ] S1-4：確認批次分工清單正確（更新 ESM_MIGRATION_PLAN.md 附錄）

### Stage 2A — ESM 遷移 批次1（config/ + lang/ + map/）
- [x] S2A-1：Claude Code 執行批次1遷移
- [x] S2A-2：Codex 靜態語法檢查
- [x] S2A-3：你開瀏覽器人工測試
- [x] S2A-4：commit 批次1

### Stage 2B — ESM 遷移 批次2（systems/ 基礎層）
- [x] S2B-1：Claude Code 執行批次2遷移
- [x] S2B-2：Codex 靜態語法檢查
- [x] S2B-3：你開瀏覽器人工測試
- [x] S2B-4：commit 批次2

### Stage 2C — ESM 遷移 批次3（systems/ 核心層 + main.js）
- [x] S2C-1：Claude Code 執行批次3遷移
- [x] S2C-2：Codex Playwright smoke test（無 ESM runtime error）
- [x] S2C-3：你開瀏覽器人工測試（完整測試：完成一局遊戲）
- [x] S2C-4：commit 批次3

### Stage 3 — 架構重構
- [x] Phase 1：TODO-06 Step A localStorage key 定義與 helper 建立
- [x] Phase 1：TODO-06 Step B 逐檔替換直接 localStorage 呼叫
- [x] Phase 1：TODO-04 AudioManager 統一
- [x] Phase 2：TODO-01 buildSkillTreeOverlay 拆模組
- [x] Phase 2：TODO-03 變異技能面板統一
- [x] Phase 3：TODO-02 結算畫面統一
- [x] Phase 3：TODO-05 設定面板 fromHome 移除
- [x] Phase 3：TODO-07 gameState 存取控制（Stage 3 範圍：settings helper）
- [x] Phase 4：TODO-08/09/10 收尾清理

### Stage 4 — Branch 對調
- [x] esm-refactor merge 進 master
- [ ] master merge 進 stable
- [ ] Vercel Production Branch 確認

---

## 事件紀錄（最新在最上方）

### 2026-06-06（Stage C Slice 2 + 3 完成）
- 狀態：Stage C gameState 存取控制完成（sessionStats + mutationSkills）
- 操作者：Claude Code
- 完成項目：
  - Slice 3：建立 `stats/index.js`，提供 `resetSessionStats` / `getSessionStats` / `incrementStat` / `updateStatMax`；`main.js` / `combat.js` / `player.js` / `supabase.js` / `leaderboard.js` 全部改用 stats 入口
  - Slice 2：`evolution.js` fromHome/forceStart 與 postGame 的 mutationSkills 載入改呼叫 `initMutationSkills()`，移除兩段直接 `Object.assign` 寫入
  - 測試：新增 `tests/stats/stats.test.js`（9 tests），修正 `vi.hoisted` hoisting 問題；總計 64/64 通過
  - 版本 bump：v0.1.5.2 → v0.1.6.0
- 發現問題：stats.test.js 初版的 `vi.mock` factory 因 hoisting 無法存取 `mockGameState`，已改用 `vi.hoisted()` 修復
- 下一步：Stage D 中層系統重構

### 2026-06-06（Codex 靜態審計）
- 狀態：stable 同步完成，ESM import 靜態審計完成
- 操作者：Codex
- 完成項目：master merge 進 stable，import 路徑全部驗證
- 發現問題：無；38 個 JS 檔案檢查完成，0 個失敗，ESM import audit PASSED
- 下一步：Vercel 確認部署

### 2026-06-06（Stage 4 完成）
- 狀態：esm-refactor merge 進 master，Stage 4 完成
- 操作者：Claude Code
- 完成項目：merge 成功，版本 bump 至 v0.1.5.0，ESM 遷移全部完成
- 發現問題：無
- 下一步：Codex 靜態檢查，Vercel 確認部署

### 2026-06-06（Stage 3 Phase 4 TODO-08/09/10 收尾清理完成）
- 狀態：Stage 3 Phase 4 TODO-08/09/10 完成
- 操作者：Codex
- 完成項目：
  - `systems/mutation.js` 移除 `_checkAndRepairMutationSkills()`、`initMutationSkills()` 呼叫點與 `window._checkAndRepairMutationSkills` 掛載
  - `systems/evolution.js` 移除無 dispatch 來源的 `mutationRepaired` event listener
  - `systems/evolution.js` 將 `_skillTreeMode` 改為模組私有狀態，並補上模組內部狀態註解
  - TODO-09 已由 TODO-01 的 `buildSkillTreeOverlay()` coordinator 拆分自然完成
- 發現問題：`systems/ui.js` 仍 import `_skillTreeFromHome`，因此本次依 TODO-10 安全規則保留 `_skillTreeFromHome` export，僅清理 `_skillTreeMode` export
- 下一步：Stage 4 branch 對調準備

### 2026-06-06（Stage 3 TODO-07 gameState 存取控制 Stage 3 範圍完成）
- 狀態：Stage 3 Phase 3 TODO-07（settings helper）完成
- 操作者：Codex
- 完成項目：
  - `storage/index.js` 新增 `getSettings()` 與 `saveSettingsToStorage(settings)`，集中 `gameSettings` 的 localStorage 讀寫入口
  - `systems/ui.js` 的 `loadSettings()` / `saveSettings()` 改用 settings helper
  - `systems/audio.js` 的 `AudioManager.playMusic()` 在音樂開始播放時自動儲存目前 settings，避免音量調整因重新整理遺失
  - `docs/ESM_TODO.md` 記錄 TODO-07 Stage 3 完成範圍，並將 `mutationSkills` / `sessionStats` 存取控制列為 v0.2.x 待辦
- 發現問題：無
- 下一步：Phase 4 TODO-08/09/10 收尾清理

### 2026-06-05（Stage 3 TODO-05 設定面板 fromHome 移除完成）
- 狀態：Stage 3 Phase 3 TODO-05 完成
- 操作者：Codex
- 完成項目：
  - `systems/ui.js` 的 `showSettings()` 移除 `fromHome` 參數
  - `showSettings()` 內部改用 `!!document.getElementById('start-screen')` 自動偵測首頁狀態
  - `switchLanguage()` 重建 settings overlay 與首頁設定按鈕呼叫點改為無參數 `showSettings()`
  - 修正重設預設值後從首頁開啟設定時會被當成遊戲中設定的潛在問題
- 發現問題：無
- 下一步：Phase 3 TODO-07 gameState 存取控制

### 2026-06-05（Stage 3 TODO-02 結算畫面統一完成）
- 狀態：Stage 3 Phase 3 TODO-02 完成
- 操作者：Codex
- 完成項目：
  - `systems/ui.js` 新增 `buildEndGameOverlay()` 共用死亡/勝利結算畫面外殼
  - `systems/evolution.js` 的 `showDeathSettlement` 改用 `buildEndGameOverlay()`，保留原 overlay id、按鈕排列與回首頁二段警告
  - `systems/boss.js` 的 `doShowVictory` 改用 `buildEndGameOverlay()`，保留原勝利資料、結算副作用與雲端保存流程
  - `systems/daynight.js` 刪除無呼叫點的 `showGameOver()` dead code
  - `MAIN.md` / `QUICKREF.md` 同步移除 `showGameOver` 索引並補上結算 builder 說明
- 發現問題：附件範例 builder 的 `confirm()` 與現有二段警告行為不一致，已依確認採用保留原行為的方案 A
- 下一步：Phase 3 TODO-05 設定面板 fromHome 移除

### 2026-06-05（Stage 3 TODO-03 打破 mutation/evolution 循環依賴完成）
- 狀態：Stage 3 Phase 2 TODO-03 完成
- 操作者：Codex
- 完成項目：
  - 打破 `mutation.js` ↔ `evolution.js` 循環依賴
  - `mutation.js` 改用 `CustomEvent` 通知，不再直接 import `evolution.js`
  - `evolution.js` 監聽 `mutationRepaired` 事件，在技能樹 overlay 存在時重建 UI
- 發現問題：無
- 下一步：Phase 3 TODO-02

### 2026-06-05（Stage 3 TODO-01 buildSkillTreeOverlay 拆模組完成）
- 狀態：Stage 3 Phase 2 TODO-01 完成
- 操作者：Codex
- 完成項目：
  - `systems/evolution.js` 將 `buildSkillTreeOverlay()` 拆成 coordinator 與 4 個 private sub-functions
  - 新增 `_resolveSkillTreeState()` 處理模式判定、狀態同步、storage reload 與 `applyDeviceMode()`
  - 新增 `_createSkillTreeShell()` 建立 overlay 外殼、標題列、切換按鈕與主內容容器
  - 新增 `_buildOrganInheritanceSections()` 建立 postGame 本局器官保留區
  - 新增 `_buildSkillTreeMainContent()` 保留技能點、技能卡、lastRun 繼承/顯示、底部按鈕與變異面板切換流程
- 發現問題：無
- 下一步：Stage 3 Phase 2 TODO-03 變異技能面板統一

### 2026-06-05（Stage 3 TODO-04 AudioManager 統一完成）
- 狀態：Stage 3 Phase 1 TODO-04 完成
- 操作者：Codex
- 完成項目：
  - `systems/audio.js` 新增 AudioManager 內部 `_vol` 狀態，統一管理 master/music/sfx 音量與開關
  - 新增 `loadVolume()`、`setVolume()`、`serializeVolume()`，由 AudioManager 掌握音量狀態並同步 `gameState.settings.volume`
  - `_sfxVol()`、`_musicVol()` 與 `playIntroTheme()` 改由 AudioManager 內部音量計算
  - `systems/ui.js` 的 load/save/toggle/slider/reset 音量流程改用 AudioManager API
- 發現問題：無
- 下一步：Stage 3 Phase 2 TODO-01 buildSkillTreeOverlay 拆模組

### 2026-06-05（Stage 3 TODO-06 Step B Batch 3 / Final 完成）
- 狀態：Stage 3 Phase 1 TODO-06 全部完成
- 操作者：Codex
- 完成項目：
  - `systems/evolution.js` 改用 `storage/index.js` helper 存取 localStorage
  - `systems/boss.js` 改用 `storage/index.js` helper，並用 `storageKey` 產生通關與 Boss 擊殺統計 dynamic key
  - `systems/chat.js` 改用 `storage/index.js` helper，`_applyRemoteData()` 保留 dynamic key 行為並跳過 `STORAGE_KEYS.SAVE_VERSION`
  - 清除 `systems/ui.js` 先前批次保留的 `savedOrgans` direct localStorage 呼叫
  - TODO-06 Step A + Step B 全批次完成，9 個目標檔案已無 direct localStorage 呼叫
- 發現問題：Batch 1 保留的 `systems/ui.js` `savedOrgans` 呼叫需於 Final 一併清理，已完成
- 下一步：Stage 3 Phase 1 TODO-04 AudioManager 統一

### 2026-06-05（Stage 3 TODO-06 Step B Batch 2 完成）
- 狀態：Stage 3 Phase 1 TODO-06 Step B Batch 2 完成
- 操作者：Codex
- 完成項目：
  - `main.js` 改用 `storage/index.js` helper 存取 localStorage
  - `systems/mutation.js` 改用 `storage/index.js` helper 存取 `mutationData` / `mutationSkills` / `skillPoints`
  - `systems/organs.js` 改用 `storage/index.js` helper 存取 `tutorialCompleted` / `tutorialCombatDone` / `skillPoints`
  - `systems/elite.js` 改用 `storage/index.js` helper 存取 `skillPoints`
- 發現問題：無
- 下一步：TODO-06 Step B 下一批，繼續逐檔替換直接 localStorage 呼叫

### 2026-06-05（Stage 3 TODO-06 Step B Batch 1 完成）
- 狀態：Stage 3 Phase 1 TODO-06 Step B Batch 1 完成
- 操作者：Codex
- 完成項目：
  - `systems/tutorial.js` 改用 `storage/index.js` helper 存取 `tutorialCompleted` / `tutorialCombatDone`
  - `systems/ui.js` 指定 key 改用 `storage/index.js` helper，保留本批不處理的 `savedOrgans`
- 發現問題：無
- 下一步：TODO-06 Step B 下一批，繼續逐檔替換直接 localStorage 呼叫

### 2026-06-05（Stage 3 TODO-06 Step A 完成）
- 狀態：Stage 3 Phase 1 TODO-06 Step A 完成
- 操作者：Codex
- 完成項目：
  - 建立 `storage/index.js`，定義所有 localStorage key 常數和統一讀寫函式
  - 修正 saveVersion/SAVE_VERSION 命名不一致 bug
- 發現問題：`hunterSlayerUnlocked` 目前已寫入但未讀取，保留於 `STORAGE_KEYS` 備用
- 下一步：TODO-06 Step B，逐檔替換直接 localStorage 呼叫

### 2026-06-05（Stage 2 全部完成）
- 狀態：Stage 2A / 2B / 2C 三批次遷移全部通過人工測試，Stage 2 正式收尾
- 操作者：你（人工測試）+ Claude Code（文件更新）
- 完成項目：
  - 簡單難度勝利測試通過
  - 簡單難度失敗測試通過
  - 普通難度勝利測試通過
  - S2C-3 / S2C-4 標記完成
  - Stage 2A / 2B 全部勾選完成
- 發現問題：無
- 下一步：Stage 3 架構重構（Phase 1：TODO-06 localStorage 統一 / TODO-04 AudioManager 統一）

### 2026-06-05（Stage 2C S2C-1/S2C-2 完成）
- 狀態：批次3遷移完成，Playwright smoke test 通過，等待人工完整測試
- 操作者：Claude Code + Codex
- 完成項目：
  - config/gameConfig.js：export FIXED_FPS / FIXED_DELTA
  - systems/map.js：新增 export setViewSize(w, h)（VIEW_W/VIEW_H live binding 修正）
  - systems/mobile.js：import setViewSize，_setViewSize 改呼叫 setter；export _joyPaused
  - systems/input.js：加 imports + export handleKeyDown/handleKeyUp/_updateMouseWorld
  - systems/spawning.js：加 imports + export 7 個函式
  - systems/tutorial.js：IIFE → module scope，export 3 個公開函式
  - systems/hud.js：加 imports + export drawGame/updateUI/updateMinimapFog
  - systems/player.js：加 imports + export 11 個函式（含 _archerAttack/_getArcherShootDir）
  - systems/combat.js：DUPLICATE 備註加在 addMutationPoints stub；加 imports + export 9 個函式
  - systems/organs.js：移動 _organHitRegions/_compendiumBtnRegion 宣告至此並 export；加 imports + export 7 個函式
  - systems/evolution.js：新增 let _skillTreeMode/_skillTreeFromHome 模組級；移除 window.loadSavedOrgans；加 imports + export 眾多函式
  - systems/mutation.js：addMutationPoints 為正確版本（export function）
  - systems/creatures.js：加 imports（FIXED_DELTA 改從 gameConfig）+ export 函式
  - systems/elite.js / boss.js / daynight.js / leaderboard.js / ui.js：同樣加 imports + exports
  - main.js：加齊所有系統 imports；export pausePlayTimer/resumePlayTimer 供循環依賴模組使用
  - index.html：所有 <script> 改為單一 <script type="module" src="./main.js">
  - Codex Playwright smoke test：console/page errors = 0，ESM runtime 無報錯，通過到教學畫面
- 發現問題：main.js 仍有本地 const FIXED_FPS/FIXED_DELTA（未影響運作，Stage 3 再清理）
- 下一步：S2C-3 人工完整測試（完成一局遊戲：移動、吃果子、戰鬥、死亡/通關）

### 2026-06-04（Stage 2B/2C Codex 接續收尾）
- 狀態：Stage 2B/2C ESM import/export 收尾完成，等待瀏覽器驗證
- 操作者：Codex
- 完成項目：
  - 確認 `config/gameConfig.js` 已 export `FIXED_FPS` / `FIXED_DELTA`
  - 確認 `systems/map.js` 已 export `setViewSize(w, h)`
  - 確認 `systems/mobile.js` 已 import `setViewSize`，且 `_setViewSize()` 改為呼叫 setter
  - 移除 `window.loadSavedOrgans = loadSavedOrgans`，改由 `main.js` named import
  - 補齊 Stage 2B/2C 目標檔案的 import/export wiring
  - `index.html` 改為單一 `<script type="module" src="./main.js"></script>` 入口
- 發現問題：
  - 核心系統仍存在多組循環依賴，需要瀏覽器實測確認是否有 TDZ/runtime error
  - Live Server 尚未在 `127.0.0.1:5500` / `5501` 監聽，瀏覽器驗證待補
- 下一步：啟動 Live Server 後進行瀏覽器 console 驗證，通過後再進入人工測試/commit

### 2026-06-04（Stage 2B S2B-1 完成）
- 狀態：批次2遷移完成，等待 Codex 靜態檢查
- 操作者：Claude Code
- 完成項目：7 個 systems/ 基礎層檔案加入 export/import
  - gameState.js：export DEFAULT_SETTINGS, gameState, canvas, ctx
  - utils.js：import gameState/ctx/wrappedDelta；export 7 個函式
  - audio.js：import AUDIO_FILES/DEFAULT_SETTINGS/gameState；export 4 個
  - camera.js：import gameState/MAP_WIDTH/MAP_HEIGHT/VIEW_W/VIEW_H；export 5 個
  - map.js：import gameState/ctx；export 9 個常數 + 8 個函式
  - mobile.js：import gameState；export 8 個
  - chat.js：import SUPABASE_URL/SUPABASE_KEY/supabaseQuery/GAME_INFO/gameState；export 10 個
- 發現問題：VIEW_W/VIEW_H 為 mutable let，mobile.js 的 _setViewSize 直接賦值（已知問題，Stage 3 修正）
- 下一步：S2B-2 Codex 靜態語法檢查，S2B-3 瀏覽器人工測試

### 2026-06-04（Stage 2A S2A-1 完成）
- 狀態：批次1遷移完成，等待 Codex 靜態檢查
- 操作者：Claude Code
- 完成項目：13 個檔案加入 export/import（config/ + lang/ + map/）
- 發現問題：無
- 下一步：S2A-2 Codex 靜態語法檢查，S2A-3 瀏覽器人工測試

### 2026-06-04（Stage 1 依賴審計）
- 狀態：Stage 1 S1-1 / S1-2 完成
- 操作者：Codex
- 完成項目：分析 37 個本地 JS 檔案，產出 `docs/dependency_map.md`
- 發現問題：實際 JS 清單包含 `config/compendium_data.js`、`systems/mobile.js`、`systems/hud.js`、`systems/chat.js`；另發現多組循環/複雜互依與 `addMutationPoints` 重複定義
- 下一步：S1-3 由你 + Claude Chat 人工確認依賴圖內容

### 2026-06-04（Stage 0 完成）
- 狀態：Stage 0 完成
- 操作者：Claude Code
- 完成項目：建立 esm-refactor 分支、加入 ESM 文件套件
- 發現問題：無
- 下一步：執行 Stage 1 Codex 依賴審計

### 2026-06-04
- 狀態：ESM 遷移計劃完成，準備進入 Stage 0
- 操作者：Claude Chat
- 完成項目：產出 5 份 ESM 文件套件
  - docs/ESM_MIGRATION_PLAN.md
  - docs/ESM_PROJECT_CONTEXT.md
  - docs/ESM_PROGRESS.md（本文件）
  - docs/ESM_CHECKLIST.md
  - .codex/AGENTS.md
- 發現問題：無
- 下一步：把這 5 份檔案加入專案，執行 Stage 0

---

## 回滾紀錄（如果有發生過）

目前無回滾紀錄。

---

## 更新格式範本（每次更新複製這段填寫）

```
### YYYY-MM-DD
- 狀態：[目前在哪個 Stage / 步驟]
- 操作者：[你 / Claude Code / Codex]
- 完成項目：[做了什麼]
- 發現問題：[有沒有遇到問題，沒有就寫「無」]
- 下一步：[下一個要做的事]
```
