# ESM 重構技術債 TODO
# 建立日期：配合 v0.1.3.x → ESM 重構版本
# 目的：記錄所有需要在 ESM 重構時一併解決的技術債，避免遷移後繼續累積
 
---
 
## 一、最高優先：重複路徑統一
 
### TODO-01：`buildSkillTreeOverlay` 三條路徑合併
 
**問題：**
同一個函式內用 `effectiveMode` 區分 `fromHome` / `postGame` / `forceStart`，
導致隱藏器官選擇、普通器官選擇、mutationSkills 讀取各自有獨立副本。
每次改 bug 只修其中一條，另外兩條繼續有問題。
 
**歷史 bug 記錄：**
- 回憶器官 Lv1 後首頁只能選 1 個隱藏器官（fromHome 沒讀 hiddenOrganLimit）
- postGame mutationSkills 讀取不同步（Prompt G 修復）
- 每次修一條路徑另一條不同步
**解法：**
拆成獨立模組，資料來源在入口統一，UI 渲染邏輯完全共用：
 
```
skillTree/
  index.js                ← 入口：判斷 mode，呼叫 dataResolver，再呼叫 render
  dataResolver.js         ← 統一資料來源
                             fromHome：從 localStorage lastRunOrgans 讀
                             postGame：從 gameState.player.organs 讀
                             輸出統一格式：{ organs, hiddenOrgans, skillPoints, mutationSkills }
  organSection.js         ← 普通器官繼承 UI（共用，不分 mode）
  hiddenOrganSection.js   ← 隱藏器官繼承 UI（共用，hiddenOrganLimit 在這裡）
  skillPointSection.js    ← 技能點分配 UI（共用）
  mutationSection.js      ← 變異技能樹 UI（共用）
  buttonRow.js            ← 底部按鈕（fromHome 顯示「關閉」，postGame 顯示「回首頁」「再來一場」）
```
 
**驗收條件：**
- `hiddenOrganLimit` 只在 `hiddenOrganSection.js` 一個地方計算
- 新增功能只需改一個檔案，不需要判斷 mode
---
 
### TODO-02：`showVictory` vs `showDeathSettlement` 結算按鈕重複
 
**問題：**
勝利和死亡的結算畫面各自獨立建立「前往技能樹」「回首頁」「再來一場」按鈕，
邏輯幾乎相同但互不共用，改一個另一個容易漏掉。
 
**解法：**
```
settlement/
  index.js          ← 統一入口，接受 { result: 'victory'|'defeat', cause, stats }
  headerSection.js  ← 勝利/死亡標題（結果不同但結構相同）
  statsSection.js   ← 本局統計（XP、等級、技能點明細）
  buttonRow.js      ← 三個按鈕（共用邏輯，result 只影響標題顏色）
```
 
**驗收條件：**
- 按鈕邏輯只寫一次
- 勝利/死亡畫面共用同一套按鈕模組
---
 
### TODO-03：變異技能面板三種情境統一
 
**問題：**
`_buildMutationSkillContent` 在 fromHome / postGame / 遊戲中三種情境各有判斷，
加新功能容易漏掉某個情境。
 
**解法：**
```
mutation/
  index.js          ← 入口，統一讀取 mutationSkills（永遠從 localStorage 讀，不依賴記憶體）
  skillList.js      ← 技能列表 UI（共用）
  pointDisplay.js   ← 點數顯示（共用）
  upgradeHandler.js ← 升級邏輯（共用）
```
 
**重要原則：**
`mutationSkills` 永遠從 localStorage 讀取，不依賴 gameState 記憶體狀態，
從根本上消滅「遊戲期間記憶體和 localStorage 不同步」的問題。
 
**驗收條件：**
- 任何情境下讀到的 `recallOrgan.level` 都一致
- 不再需要 Prompt G 那種「postGame 強制重載」的補丁
---
 
## 二、音量與設定路徑統一
 
### TODO-04：音量設定多路徑統一
 
**問題：**
- `playIntroTheme()` 一次性快照音量（已在 Prompt G 修復為即時讀取，但根本問題是架構）
- `refreshMusicVolume()` 只更新 `AudioManager._music`，不更新 `_introThemeAudio`（Prompt C 修復）
- `loadSettings()` 只在 `initializeGame()` 內呼叫，`window.onload` 沒呼叫（Prompt G 修復）
- 以上三個修復都是補丁，根本問題是音量來源不統一
**解法：**
```
audio/
  AudioManager.js   ← 唯一的音量控制入口
                       所有音頻物件（背景音樂、遊戲音效、introTheme）統一由此管理
                       volume 永遠從 gameState.settings.volume 即時讀取
                       不再有「一次性快照」的設計
  settings.js       ← 設定讀寫，loadSettings() 獨立於 initializeGame()
                       window.onload 時自動呼叫，不依賴遊戲初始化
```
 
**驗收條件：**
- 調整任何音量滑桿，所有正在播放的音頻立即更新
- 刷新頁面後音量與設定一致，不需要任何補丁
---
 
### TODO-05：設定面板 fromHome 判斷移除
 
**問題：**
`showSettings(fromHome)` 用 `fromHome` 參數決定「儲存並返回」vs「關閉」按鈕文字，
以及 z-index 不同，其餘邏輯完全相同。
 
**解法：**
設定面板不需要知道自己是從哪裡開啟的，只需要：
- 關閉時呼叫 `onClose` callback（由呼叫方傳入）
- z-index 由呼叫方決定（傳入參數）
```javascript
// 新設計
showSettings({ zIndex: 250, onClose: () => showStartScreen() });
showSettings({ zIndex: 160, onClose: () => resumeGame() });
```
 
---
 
## 三、localStorage 讀寫統一
 
### TODO-06：localStorage 讀寫分散問題
 
**問題：**
目前 localStorage 讀寫分散在 `evolution.js`、`ui.js`、`mutation.js`、`boss.js`、`main.js` 等多個檔案，
key 名稱（`mutationSkills`、`savedOrgans`、`gameSettings` 等）硬寫在各處，
沒有統一的讀寫介面，容易 typo 或讀寫格式不一致。
 
**解法：**
```
storage/
  index.js          ← 唯一的 localStorage 讀寫入口
                       export const Storage = {
                           getSettings(), saveSettings(),
                           getMutationSkills(), saveMutationSkills(),
                           getSavedOrgans(), saveSavedOrgans(),
                           getLastRunOrgans(), saveLastRunOrgans(),
                           ... 等
                       }
```
 
**驗收條件：**
- 所有 `localStorage.getItem` / `setItem` 集中在 `storage/index.js`
- key 名稱只在一個地方定義，不會 typo
---
 
## 四、gameState 污染問題
 
### TODO-07：gameState 被當作全域變數使用
 
**問題：**
`gameState` 目前承載了遊戲狀態、UI 狀態、設定、統計等所有資料，
任何檔案都可以直接讀寫，沒有存取控制，容易產生意外覆蓋。
 
例如：
- `gameState.settings` 被 `loadSettings()` / `applyDeviceMode()` / `initializeGame()` 各自修改
- `gameState.mutationSkills` 被多個地方讀寫，導致同步問題
**解法（ESM 漸進式）：**
不需要一次全改，優先處理最容易出問題的幾個：
1. `gameState.settings` → 只透過 `Storage.getSettings()` / `Storage.saveSettings()` 讀寫
2. `gameState.mutationSkills` → 只透過 `mutation/index.js` 讀寫
3. `gameState.sessionStats` → 只透過 `stats/index.js` 讀寫
---
 
## 五、已知技術債（較低優先）
 
### TODO-08：`_checkAndRepairMutationSkills` 的侵入性
 
**問題：**
此函式在偵測到異常時會重置所有技能等級，行為太激進。
根本原因（TODO-03）解決後，此函式的存在意義消失，可以移除。
 
**解法：**
TODO-03 完成後，確認 `mutationSkills` 讀寫路徑統一且可靠，
然後移除 `_checkAndRepairMutationSkills`，改為更溫和的 log + 警告。
 
---
 
### TODO-09：`buildSkillTreeOverlay` 函式長度
 
**問題：**
目前是整個代碼庫最長的函式（估計 400+ 行），包含 UI 建立、資料讀取、事件處理全部混在一起。
 
**解法：**
TODO-01 完成後自然解決，不需要單獨處理。
 
---
 
### TODO-10：`effectiveMode` 參數傳遞鏈
 
**問題：**
`mode` 參數在 `buildSkillTreeOverlay` → `upgradeSkill` → `buildSkillTreeOverlay` 之間傳遞，
靠 `_skillTreeMode` 全域變數維持狀態，容易在 reset 時丟失。
 
**解法：**
TODO-01 拆模組後，mode 狀態由模組內部管理，不需要全域變數。
 
---
 
## 執行優先順序建議
 
```
Phase 1（ESM 基礎建設）
  └─ TODO-06：localStorage 統一讀寫入口
  └─ TODO-04：AudioManager 統一音量管理
 
Phase 2（最高價值重構）
  └─ TODO-01：buildSkillTreeOverlay 拆模組（消滅最多 bug 來源）
  └─ TODO-03：變異技能面板統一
 
Phase 3（清理）
  └─ TODO-02：結算畫面統一
  └─ TODO-05：設定面板 fromHome 移除
  └─ TODO-07：gameState 存取控制
 
Phase 4（收尾）
  └─ TODO-08：移除 _checkAndRepairMutationSkills
  └─ TODO-09/10：自然解決，不需單獨處理
```
 
---
 
## 備註
 
- 每個 TODO 完成後在此標記 ✅ 和完成版本號
- 新發現的技術債直接追加到對應章節
- ESM 重構不需要一次完成，按 Phase 順序漸進執行

---

## 待修 Bug

### BUG-01：阿奇爾角色音效誤植
**問題：** 選擇阿奇爾（Archerfish）角色時，
音效播放的是噪鵑（Koel）的音效，不是阿奇爾專屬音效。
**影響：** 兩個角色的音效體驗相同，阿奇爾角色特色不明顯。
**重現方式：** 選擇阿奇爾角色開始遊戲，聽攻擊/受傷音效。
**確認範圍：** master 和 esm-refactor 都有此問題，非 ESM 遷移引入。
**預計處理時間：** Stage 3 完成後。
**相關檔案：** 推測在 systems/audio.js 或 config/gameConfig.js 的音效設定。