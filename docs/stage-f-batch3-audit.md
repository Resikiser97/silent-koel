# Stage F 批次 3 深度審計
基準版本：v0.1.20.1
更新日期：2026-06-14

## Q1 evolution.js ↔ organs.js（#10）

### evolution.js import organs.js

`systems/evolution.js:12` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `applyOrganEffects` | `systems/evolution.js:140`, `147`, `165` | `loadSavedOrgans()` 載入已保存普通器官、補發 fang 器官時，重新套用器官效果。 |
| `applyHiddenOrganEffects` | `systems/evolution.js:176` | `loadSavedOrgans()` 載入已保存隱藏器官時，重新套用隱藏器官效果。 |
| `showOrganSelection` | 目前只在 import 行出現 | v0.1.20.1 掃描未找到實際呼叫點，疑似 dead import。 |
| `showHiddenOrganSelection` | 目前只在 import 行出現 | v0.1.20.1 掃描未找到實際呼叫點，疑似 dead import。 |
| `getOrganSlotsUsed` | 目前只在 import 行出現 | v0.1.20.1 掃描未找到實際呼叫點，疑似 dead import。 |

### organs.js import evolution.js

`systems/organs.js:16` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `checkEvolutionUnlock` | `systems/organs.js:175` | 器官選擇 overlay 中，器官槽滿時查詢可進化選項。 |
| `applyEvolutionLevelEffect` | `systems/organs.js:320` | 玩家在器官選擇 overlay 點選進化選項後，套用對應進化等級效果。 |

### 根本原因分析

這組雙向依賴的根本原因不是單一 UI 呼叫，而是「器官系統」與「進化系統」同時承擔了成長流程的不同片段：

- `evolution.js` 負責讀取永久/上局保存資料，但需要 `organs.js` 的器官效果套用函式來恢復玩家狀態。
- `organs.js` 負責升級時的器官選擇 UI，但在器官槽滿時需要 `evolution.js` 判斷進化解鎖，並直接套用進化效果。
- 因此耦合點是「保存器官效果套用」加上「器官槽滿後觸發進化選項」，不是純粹的 tooltip 或顯示問題。

### 建議拆法

首選：抽共用規則/效果模組。

- 新增低層 `systems/organEffects.js` 或 `systems/growthEffects.js`，承載 `applyOrganEffects`、`applyHiddenOrganEffects` 這類純效果套用函式。
- `evolution.js` 載入保存器官時改 import 低層效果模組，不再 import `organs.js`。
- `organs.js` 可以暫時保留 UI 選擇與進化選項，但應逐步把 `checkEvolutionUnlock` 的純判斷抽到低層 `systems/evolutionRules.js`。

第二步：把器官選擇 overlay 中「點選進化」改成事件或 callback。

- `organs.js` 在點選進化選項時 dispatch `CustomEvent('evolutionLevelSelected', { detail: { type, nextLevel } })`。
- 由 `main.js` 或 flow 層監聽後呼叫 `applyEvolutionLevelEffect()`。
- 這樣可移除 `organs.js -> evolution.js` 的流程依賴。

不建議只用 callback 注入硬塞，因為這裡含有規則判斷、效果套用、UI 選擇三種責任；先抽低層規則模組會比較穩。

## Q2 boss.js ↔ combat.js（#11）

### boss.js import combat.js

`systems/boss.js:14` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `applyDamageToPlayer` | `systems/boss.js:1309` | 熊 Boss 狂暴攻擊命中玩家時造成傷害。 |
| `applyDamageToPlayer` | `systems/boss.js:1386` | 毒霧 puddle 對玩家造成每秒傷害。 |
| `applyDamageToPlayer` | `systems/boss.js:1425` | Boss 技能命中玩家時計算傷害。 |

### combat.js import boss.js

`systems/combat.js:21` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `handleBossKill` | `systems/combat.js:48` | 反傷造成 Boss 死亡時，進入 Boss 擊殺流程。 |
| `handleBossKill` | `systems/combat.js:355` | 玩家攻擊 Boss 後若 Boss 死亡，進入 Boss 擊殺流程。 |
| `handleBossKill` | `systems/combat.js:375` | 範圍/特殊攻擊判定 Boss 死亡後，進入 Boss 擊殺流程。 |
| `handleBossKill` | `systems/combat.js:394` | 另一段攻擊判定 Boss 死亡後，進入 Boss 擊殺流程。 |

### 根本原因分析

`boss.js` 需要「對玩家造成傷害」能力；`combat.js` 需要「Boss 死亡流程」能力。兩邊都是流程入口，所以形成直接雙向。

`showFloatingText` 已在批次 2 搬到 `feedback.js`，所以目前 #11 的重點不是浮動文字，而是：

- `applyDamageToPlayer` 是玩家受傷入口，但放在 `combat.js`。
- `handleBossKill` 是 Boss 死亡/勝利流程入口，但放在 `boss.js`。

### 建議拆法

比較容易先改成 CustomEvent 的是 `combat.js -> boss.js` 這一側。

- `combat.js` 不直接 import `handleBossKill`。
- Boss 死亡時 dispatch `CustomEvent('bossKilled', { detail: { boss } })`。
- `main.js` 或 flow 層監聽後呼叫 `handleBossKill(boss)`。

`boss.js -> combat.js` 的 `applyDamageToPlayer` 比較像共用傷害服務，建議第二步抽到低層：

- 新增 `systems/playerDamage.js` 或 `systems/damage.js` 放 `applyDamageToPlayer`。
- `boss.js`、`combat.js`、`player.js` 都 import 該低層模組。
- 需要注意 `applyDamageToPlayer` 內目前也會呼叫 `handleKill`、`handleEliteKill`、Boss kill 流程，抽出時應搭配事件化，否則只是把循環搬家。

## Q3 combat.js ↔ player.js 殘留（#6）

### combat.js import player.js

`systems/combat.js:23` import：

| 函式 | 使用位置 | 用途 | 最小解法 |
|------|----------|------|----------|
| `_archerAttack` | `systems/combat.js:167` | `playerAttack()` 偵測遠程角色時，分派到阿奇爾射水攻擊。 | 把 `playerAttack()` 移回/拆到 `player.js`，或抽 `systems/attack.js` 放近戰與遠程攻擊分派；短期可用 callback/event `requestRangedAttack`。 |

### player.js import combat.js

`systems/player.js:19` import：

| 函式 | 使用位置 | 用途 | 最小解法 |
|------|----------|------|----------|
| `applyDamageToPlayer` | `systems/player.js:78` | 玩家與 Boss 接觸/碰撞時承受 Boss 傷害。 | 與 Q2 一起抽 `playerDamage.js` / `damage.js`，或讓碰撞端 dispatch `playerDamaged` 事件。 |
| `handleKill` | `systems/player.js:148`, `439`, `598` | 投射物、dash、其他玩家側攻擊擊殺普通/敵對生物時，走擊殺獎勵流程。 | 抽 `killService.js` / `defeat.js`，或由玩家側 dispatch `creatureKilled`，flow 層呼叫擊殺處理。 |
| `handleGiantKill` | `systems/player.js:143`, `438` | 投射物或 dash 擊殺巨人化生物時，走巨人擊殺流程。 | 與 `handleKill` 一起抽到 `defeat.js`，或事件化 `giantKilled`。 |

### 根本原因分析

批次 2 已拆掉 XP 與浮動文字，但 `combat.js` 仍同時是「攻擊分派」、「受傷處理」、「擊殺處理」三種服務。`player.js` 的移動/碰撞/投射物邏輯需要擊殺服務，`combat.js` 的攻擊入口又需要玩家專屬遠程攻擊，形成殘留直接雙向。

### 建議拆法

先拆 `_archerAttack` 方向最小：

- 將 ranged attack 分派放到 `player.js` 或新 `attack.js`，避免 `combat.js` import `player.js`。

再拆擊殺/受傷服務：

- `applyDamageToPlayer` 抽成 `playerDamage.js`，但內部 Boss/elite/normal kill 不要直接 import 高層模組，改事件化。
- `handleKill`、`handleGiantKill` 抽成 `defeat.js` / `killService.js`，由 combat 與 player 共用。

## Q4 mobile.js ↔ player.js（#15）

### mobile.js import player.js

`systems/mobile.js:29` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `playerDash` | `systems/mobile.js:418` | 手機觸控 dash 區被點擊時觸發玩家 dash。 |

### player.js import mobile.js

`systems/player.js:26` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `_joyPaused` | `systems/player.js:321` | 玩家 dash 前檢查搖桿是否暫停，避免觸控輸入衝突。 |

### 建議解法

最小且低風險：使用 `gameState.mobileInput` 共用狀態。

- `_joyPaused()` 的結果可改成由 `mobile.js` 寫入 `gameState.mobileInput.joyPaused`。
- `player.js` 直接讀 `gameState.mobileInput.joyPaused`，不再 import `mobile.js`。

`mobile.js -> player.js` 的 dash 方向可用事件：

- 手機 dash 區觸發 `CustomEvent('playerDashRequested')`。
- `main.js` 或 input/flow 初始化層監聽後呼叫 `playerDash()`。

若想更保守，可先只拆 `player.js -> mobile.js`，因為 `_joyPaused` 是狀態查詢，最適合搬進 `gameState`。

## Q5 mobile.js ↔ ui.js（#16）

### mobile.js import ui.js

`systems/mobile.js:31` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `showTooltip` | `systems/mobile.js:405` | 手機觸控器官 hit region 時顯示 tooltip。 |
| `hideTooltip` | `systems/mobile.js:406` | 500ms 後隱藏該 tooltip。 |

### ui.js import mobile.js

`systems/ui.js:31` import：

| 函式/值 | 使用位置 | 用途 |
|---------|----------|------|
| `applyDeviceMode` | `systems/ui.js:185`, `263`, `754`, `787`, `1033`, `1277`, `1866`, `2008`, `2376`, `2581` | UI 初始化、設定切換、角色/地圖/技能樹等流程後重新套用裝置模式。 |
| `_effectiveMobile` | `systems/ui.js:1087`, `2659` | UI 判斷目前是否為有效手機模式，切換手機版呈現。 |
| `_letterboxScale` | `systems/ui.js:885` | tooltip / UI 定位時使用目前 letterbox 縮放值。 |

### 建議解法

先拆 `mobile.js -> ui.js`：

- 手機觸控器官區不要直接呼叫 `showTooltip` / `hideTooltip`。
- 改 dispatch `CustomEvent('tooltipRequested', { detail })` 與 `CustomEvent('tooltipHideRequested')`，由 `ui.js` 監聽。

再拆 `ui.js -> mobile.js`：

- `applyDeviceMode` 更像裝置服務，可保留在 `mobile.js`，但由 `main.js`/初始化層統一呼叫，UI 不直接 import。
- `_effectiveMobile` 與 `_letterboxScale` 可改成讀 `gameState.isMobile`、`gameState.forceMode`、`gameState._letterboxScale` 這類共享狀態。

這組屬低嚴重度，但目前呼叫點多，建議放在 3b 或 3c，不要和核心 combat/boss 同批混做。

## Q6 evolution.js ↔ ui.js（#17）

### evolution.js import ui.js

`systems/evolution.js:14` 與 `systems/evolution.js:18` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `showTooltip` | `systems/evolution.js:391`, `447`, `523`, `573`, `629` | 技能樹/器官繼承卡片 hover 時顯示 tooltip。 |
| `hideTooltip` | `systems/evolution.js:392`, `448`, `524`, `574`, `630`, `706`, `713`, `722`, `729` | 卡片離開、開始遊戲、返回首頁、切換 overlay 時隱藏 tooltip。 |
| `buildEndGameOverlay` | `systems/evolution.js:236` | `showSkillTree()` 中建立死亡結算 overlay。 |
| `saveSettings` | `systems/evolution.js:213` | `showSkillTree()` 開啟時保存設定。 |

### ui.js import evolution.js

`systems/ui.js:35` import：

| 函式 | 使用位置 | 用途 |
|------|----------|------|
| `buildSkillTreeOverlay` | `systems/ui.js:228`, `1998`, `2069` | UI 恢復技能樹面板、首頁技能按鈕、結算/面板入口建立技能樹 overlay。 |
| `showSkillTree` | `systems/ui.js:836` | 倒數歸零時顯示技能樹/死亡結算流程。 |
| `saveLastRunOrgans` | `systems/ui.js:771` | 開始遊戲前保存上一局器官，供首頁補選/繼承使用。 |

### 根本原因分析

`evolution.js` 不只是進化規則，還包含技能樹 overlay 與死亡結算 UI；`ui.js` 也不只是通用面板，還直接啟動技能樹與結算流程。這是 UI builder 與 progression flow 互相組裝造成的低嚴重度雙向依賴。

### 建議解法

建議抽 UI 共用 builder，而不是先碰進化規則：

- 新增 `systems/overlayUi.js` 或 `systems/tooltip.js`，放 `showTooltip`、`hideTooltip`、`buildEndGameOverlay`。
- `evolution.js` 改 import 低層 UI helper，不再 import `ui.js`。

`ui.js -> evolution.js` 可保留到第二步處理：

- `showSkillTree('timeout')` 可改成 dispatch `CustomEvent('showSkillTree', { detail: { cause: 'timeout' } })`。
- `buildSkillTreeOverlay` 可由 `main.js` 或 flow 層注入/監聽，不讓 `ui.js` 直接依賴 `evolution.js`。
- `saveLastRunOrgans` 可抽到低層 `organPersistence.js`，因為它不是技能樹 UI 本身。

## Q7 預估 SCC 縮小結果

目前 SCC：1 個，12 檔案：

`boss.js`, `chat.js`, `combat.js`, `creatures.js`, `daynight.js`, `elite.js`, `evolution.js`, `leaderboard.js`, `mobile.js`, `organs.js`, `player.js`, `ui.js`

若只解除本批列出的 6 組「直接雙向」：

- #10 `evolution.js ↔ organs.js`
- #11 `boss.js ↔ combat.js`
- #6 `combat.js ↔ player.js`
- #15 `mobile.js ↔ player.js`
- #16 `mobile.js ↔ ui.js`
- #17 `evolution.js ↔ ui.js`

依目前 import 圖模擬，SCC 可能仍剩 1 個、約 11 檔案：

`boss.js`, `chat.js`, `combat.js`, `creatures.js`, `daynight.js`, `elite.js`, `evolution.js`, `leaderboard.js`, `mobile.js`, `organs.js`, `ui.js`

原因是還有多條間接回路，例如：

- `boss.js -> chat.js -> mobile.js -> combat.js -> boss.js`
- `ui.js -> daynight.js -> boss.js -> ui.js`
- `organs.js -> elite.js -> creatures.js -> ui.js -> daynight.js -> boss.js -> combat.js -> organs.js`
- `leaderboard.js -> chat.js -> mobile.js -> ui.js -> leaderboard.js`

若批次 3 不只解除直接雙向，而是同步把事件/flow 邊界放好，理想結果是：

- `player.js` 可先離開 SCC（拆掉 combat/mobile/organs 對玩家狀態與擊殺流程的直接回路後）。
- `combat.js`、`boss.js` 仍可能因 creatures/elite/daynight/ui/chat 間接路徑留在 SCC，除非 Boss kill、player damage、daynight/Boss spawn、UI/chat/mobile 也逐步事件化。
- `mobile.js`、`ui.js`、`chat.js`、`leaderboard.js` 可能形成另一個 UI/線上功能 SCC，需要後續批次處理。

## 建議執行批次

批次 3a（先做）：

- #11：`combat.js -> boss.js` 改 Boss killed event；同時評估 `applyDamageToPlayer` 抽成低層 damage service。
- #6：把 `_archerAttack` / `playerAttack` 分派移到 `attack.js` 或 player 側；把 `handleKill` / `handleGiantKill` 朝 `defeat.js` 抽出。

批次 3b（後做）：

- #10：抽 `organEffects.js` / `evolutionRules.js`，先移除 `evolution.js -> organs.js` 的效果套用依賴，再事件化 `organs.js -> evolution.js` 的點選進化流程。
- #17：抽 `tooltip.js` / `overlayUi.js`，解除 evolution 與 ui 的 overlay/tooltip 耦合。

批次 3c（低嚴重度收尾）：

- #15：`_joyPaused` 改由 `gameState.mobileInput` 共享，手機 dash 改事件或 callback。
- #16：手機 tooltip 改事件，UI 讀取裝置狀態改走 `gameState` 或由初始化層統一呼叫 mobile service。
