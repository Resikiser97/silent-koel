# Stage F 重構計劃
基準版本：v0.1.21.0
更新日期：2026-06-14

## 目標

Stage F 的長期目標不是短期追求「SCC 歸零」，而是建立可持續維護的模組邊界，降低新增遊戲內容時改一處牽動多處的風險。

目前策略修正為：

1. 先執行 Stage F 3a，處理最常被未來功能碰到的 `combat / player / boss` 核心戰鬥依賴。
2. 其他 SCC 先納入依賴規則與事件文件管理，不急著一次全拆。
3. 每次功能更新後執行依賴檢查，確保沒有新增高風險反向依賴。
4. 待核心內容穩定後，再視需要執行 3b / 3c。

## 已完成成果

### 批次 1：main.js 反向依賴解除

版本：v0.1.19.0

已解除：

- #1 `main.js` ↔ `systems/boss.js`
- #2 `main.js` ↔ `systems/evolution.js`
- #3 `main.js` ↔ `systems/organs.js`
- #4 `main.js` ↔ `systems/tutorial.js`
- #5 `main.js` ↔ `systems/ui.js`

成果：

- 新增 `systems/gameFlow.js`
- `pausePlayTimer` / `resumePlayTimer` 從 `main.js` 抽出
- `ui.js` / `evolution.js` 改用 `CustomEvent('startGame')`
- `main.js` 已離開大型 SCC

### 批次 2：feedback / reward / loot 拆分

版本：v0.1.20.0 ~ v0.1.20.1

已建立低層模組：

- `systems/feedback.js`
- `systems/reward.js`
- `systems/loot.js`

已完全解除：

- #13 `systems/combat.js` ↔ `systems/mutation.js`
- #14 `systems/combat.js` ↔ `systems/utils.js`

部分解除：

- #6 `systems/combat.js` ↔ `systems/player.js`
- #7 `systems/organs.js` ↔ `systems/player.js`
- #8 `systems/combat.js` ↔ `systems/organs.js`
- #9 `systems/combat.js` ↔ `systems/evolution.js`
- #12 `systems/boss.js` ↔ `systems/player.js`

## 目前現狀

目前大型 SCC：1 個，12 檔案。

包含：

- `systems/boss.js`
- `systems/chat.js`
- `systems/combat.js`
- `systems/creatures.js`
- `systems/daynight.js`
- `systems/elite.js`
- `systems/evolution.js`
- `systems/leaderboard.js`
- `systems/mobile.js`
- `systems/organs.js`
- `systems/player.js`
- `systems/ui.js`

已離開大型 SCC 的重要模組：

- `main.js`
- `systems/hud.js`
- `systems/input.js`
- `systems/mutation.js`
- `systems/tutorial.js`
- `systems/utils.js`
- `systems/gameFlow.js`
- `systems/feedback.js`
- `systems/reward.js`
- `systems/loot.js`

## 新策略

Stage F 不再以「一次消滅所有 SCC」為短期目標。

改為：

- 核心戰鬥依賴先拆。
- UI / mobile / leaderboard / chat 的低嚴重度依賴先文件化管理。
- 每次更新後重掃依賴，避免新功能把低層模組重新拉回高層 SCC。
- 允許短期存在已記錄、可解釋、低風險的循環。
- 禁止新增未記錄、未分析、無必要的循環。

## Stage F 3a：✅ 已完成（v0.1.21.0 ~ v0.1.21.3）

目標範圍：

- #11 `systems/boss.js` ↔ `systems/combat.js` ✅ 解除
- #6 `systems/combat.js` ↔ `systems/player.js` ✅ 解除

建議拆分方向：

1. Boss kill 流程事件化
   - `combat.js` 不直接 import `handleBossKill`
   - 改 dispatch `CustomEvent('bossKilled')`
   - flow 層或 `main.js` 監聽後呼叫 Boss kill handler

2. 玩家傷害入口抽離
   - 評估新增 `systems/playerDamage.js` 或 `systems/damage.js`
   - `applyDamageToPlayer` 不應繼續放在高耦合的 `combat.js`
   - 若內部仍需觸發 Boss / elite / normal kill，應搭配事件化

3. 擊殺流程抽離
   - 評估新增 `systems/defeat.js` 或 `systems/killService.js`
   - 承載 `handleKill`、`handleGiantKill` 等擊殺處理
   - `player.js` 與 `combat.js` 共同依賴低層擊殺服務

4. 攻擊分派整理
   - `_archerAttack` 不應讓 `combat.js` 反向 import `player.js`
   - 可評估新增 `systems/attack.js`
   - 或把 ranged attack 分派留在 `player.js`，由 input/flow 呼叫

成功標準：

- `combat.js` 不再 import `boss.js`
- `combat.js` 不再 import `player.js`
- `player.js` 盡量不再 import `combat.js`
- Boss kill、玩家受傷、普通擊殺仍保持行為一致
- `npm test` 通過
- 手動回歸：普通擊殺、精英擊殺、Boss 擊殺、死亡、勝利、阿奇爾攻擊

最終狀態（v0.1.21.3）：

- 新增 `systems/damage.js`，承載 `applyDamageToPlayer`、`handleKill`、`handleGiantKill`。
- `bossKilled`、`eliteKilled`、`showSkillTree` 等跨模組流程改用 CustomEvent 邊界。
- `setRangedAttackCallback()` 取代 `combat.js -> player.js` 直接 import。
- `damage.js` 已移除 `organs.js` import，不進入 SCC。
- `tests/systems/damage.test.js` 成為永久回歸測試，保護 handleKill / eliteKilled / bossKilled / applyDamageToPlayer / showSkillTree dispatch / setRangedAttackCallback。
- `npm test`：114/114 通過（含原有 103 個 regression）。

## Stage F 3b：暫緩

目標範圍：

- #10 `systems/evolution.js` ↔ `systems/organs.js`
- #17 `systems/evolution.js` ↔ `systems/ui.js`

建議拆分方向：

### 3b-1：`evolution.js -> organs.js` 效果依賴

現況：

- `evolution.js` 的 `loadSavedOrgans()` 需要 `applyOrganEffects` / `applyHiddenOrganEffects` 來恢復上局保留器官效果。
- 這些函式目前在 `organs.js`，導致 `evolution.js` 需要 import `organs.js`。

建議：

- 新增低層 `systems/organEffects.js` 或 `systems/growthEffects.js`。
- 將 `applyOrganEffects` / `applyHiddenOrganEffects` 一類「套用器官效果」的邏輯抽出。
- `evolution.js` 載入保存器官時改 import 低層效果模組，不再 import `organs.js`。
- `organs.js` 可繼續負責器官選擇 UI，但效果套用改由低層模組提供。

### 3b-2：`organs.js -> evolution.js` 進化解鎖 / 點選依賴

現況：

- `organs.js` 的器官選擇 overlay 在槽位滿時需要 `checkEvolutionUnlock()`。
- 玩家點選進化選項後，`organs.js` 直接呼叫 `applyEvolutionLevelEffect()`。

建議：

- 先把 `checkEvolutionUnlock` 的純規則判斷抽到 `systems/evolutionRules.js`。
- `organs.js` 只 import `evolutionRules.js`，不 import `evolution.js`。
- 玩家在器官選擇 overlay 點選進化時，改 dispatch `CustomEvent('evolutionLevelSelected', { detail: { type, nextLevel } })`。
- 由 `main.js` 或 flow 層監聽後呼叫 `applyEvolutionLevelEffect()`。

### 3b-3：`evolution.js <-> ui.js` overlay / tooltip 耦合

現況：

- `evolution.js` 在技能樹 / 器官繼承卡片 hover 時直接 import `showTooltip` / `hideTooltip`。
- `evolution.js` 的 `showSkillTree()` 使用 `buildEndGameOverlay`、`saveSettings` 等 UI 側函式。
- `ui.js` 又 import `buildSkillTreeOverlay`、`showSkillTree`、`saveLastRunOrgans`。

建議：

- 新增 `systems/tooltip.js` 或 `systems/overlayUi.js`，放 `showTooltip`、`hideTooltip`、`buildEndGameOverlay` 等共用 UI helper。
- `evolution.js` 改 import 低層 UI helper，不再 import `ui.js`。
- `showSkillTree('timeout')` 可逐步改為 dispatch `CustomEvent('showSkillTree', { detail: { cause: 'timeout' } })`。
- `saveLastRunOrgans` 可評估抽到 `systems/organPersistence.js`，因為它是資料保存，不是技能樹 UI 本身。

暫緩理由：

- 涉及器官選擇、進化解鎖、技能樹、死亡結算，牽動面大。
- 玩家短期感知低。
- 適合等核心內容穩定後，放到 v0.2.x 再做。

## Stage F 3c：暫緩

目標範圍：

- #15 `systems/mobile.js` ↔ `systems/player.js`
- #16 `systems/mobile.js` ↔ `systems/ui.js`

建議拆分方向：

### 3c-1：`mobile.js -> player.js` dash 依賴

現況：

- `mobile.js` 在手機 dash 區被點擊時直接呼叫 `playerDash()`。

建議：

- 手機 dash 區改 dispatch `CustomEvent('playerDashRequested')`。
- `main.js` 或 input/flow 初始化層監聽後呼叫 `playerDash()`。

### 3c-2：`player.js -> mobile.js` 搖桿暫停依賴

現況：

- `player.js` dash 前會 import `_joyPaused()`，確認手機搖桿是否暫停。

建議：

- `mobile.js` 將 `_joyPaused()` 結果寫入 `gameState.mobileInput.joyPaused`。
- `player.js` 改為讀 `gameState.mobileInput.joyPaused`，不再 import `mobile.js`。
- 如想更保守，可先只拆這一側，因為它是純狀態查詢。

### 3c-3：`mobile.js <-> ui.js` tooltip / device mode 耦合

現況：

- `mobile.js` 在手機觸控器官 hit region 時直接呼叫 `showTooltip` / `hideTooltip`。
- `ui.js` 多處 import `applyDeviceMode`、`_effectiveMobile`、`_letterboxScale`。

建議：

- 手機 tooltip 改 dispatch `CustomEvent('tooltipRequested', { detail })` 與 `CustomEvent('tooltipHideRequested')`，由 UI 層監聽。
- `applyDeviceMode` 留在 mobile service，但由 `main.js` / 初始化層統一呼叫，UI 不直接 import。
- `_effectiveMobile` / `_letterboxScale` 的讀取改由 `gameState.isMobile`、`gameState.forceMode`、`gameState._letterboxScale` 這類共享狀態提供。

暫緩理由：

- 屬低嚴重度。
- 主要是 UI / input 耦合，不是核心戰鬥功能。
- 建議等核心戰鬥依賴拆穩後，放到 v0.2.x 再整理。

## Claude Code 執行建議

若要求 Claude Code 執行此計劃，建議指令：

```text
請先讀取 DOC_INTEGRITY.md、ARCH.md、QUICKREF.md、CHANGELOG.md、VERSION_RULES.md，
再讀取 docs/stage-f-plan.md、docs/dependency-rules.md、docs/events.md、docs/post-update-checklist.md。

Stage F 3a 已完成。3b/3c 目前暫緩到 v0.2.x，若要執行，必須先根據 stage-f-plan.md 的分段方案提出細部計畫。
修改前先提出具體拆分方案、受影響檔案、事件名稱、測試方案，等我確認後再改。
```

## 暫停條件

遇到以下情況應暫停並回報：

- 需要新增超過 3 個新核心模組。
- 需要同時重寫 Boss、combat、player 三者的大量邏輯。
- 需要更動玩家可感知數值或玩法。
- 測試無法維持通過。
- 發現新 SCC 比原本更大。
