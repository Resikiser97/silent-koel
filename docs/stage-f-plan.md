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

## Stage F 3a：✅ 已完成（v0.1.21.0）

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

## Stage F 3b：暫緩

目標範圍：

- #10 `systems/evolution.js` ↔ `systems/organs.js`
- #17 `systems/evolution.js` ↔ `systems/ui.js`

建議拆分方向：

- 抽 `systems/organEffects.js`
- 抽 `systems/evolutionRules.js`
- 抽 `systems/tooltip.js` 或 `systems/overlayUi.js`
- 將器官效果、進化規則、UI overlay 分開

暫緩理由：

- 涉及器官選擇、進化解鎖、技能樹、死亡結算，牽動面大。
- 玩家短期感知低。
- 適合等 3a 穩定後再做。

## Stage F 3c：暫緩

目標範圍：

- #15 `systems/mobile.js` ↔ `systems/player.js`
- #16 `systems/mobile.js` ↔ `systems/ui.js`

建議拆分方向：

- `_joyPaused` 改成 `gameState.mobileInput` 狀態
- 手機 dash 改事件或 callback
- 手機 tooltip 改事件
- `ui.js` 讀手機狀態改走 `gameState` 或初始化層

暫緩理由：

- 屬低嚴重度。
- 主要是 UI / input 耦合，不是核心戰鬥功能。
- 建議等核心戰鬥依賴拆穩後再整理。

## Claude Code 執行建議

若要求 Claude Code 執行此計劃，建議指令：

```text
請先讀取 DOC_INTEGRITY.md、ARCH.md、QUICKREF.md、CHANGELOG.md、VERSION_RULES.md，
再讀取 docs/stage-f-plan.md、docs/dependency-rules.md、docs/events.md、docs/post-update-checklist.md、
docs/stage-f-batch3-audit.md。

只執行 Stage F 3a，不處理 3b/3c。
修改前先提出具體拆分方案、受影響檔案、事件名稱、測試方案，等我確認後再改。
```

## 暫停條件

遇到以下情況應暫停並回報：

- 需要新增超過 3 個新核心模組。
- 需要同時重寫 Boss、combat、player 三者的大量邏輯。
- 需要更動玩家可感知數值或玩法。
- 測試無法維持通過。
- 發現新 SCC 比原本更大。

