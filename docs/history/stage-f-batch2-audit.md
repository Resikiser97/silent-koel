# Stage F 批次 2 深度審計
基準版本：v0.1.19.0
更新日期：2026-06-14

## Q1 showFloatingText
定義位置：`systems/combat.js:26`

被 import 的模組：`systems/boss.js`、`systems/creatures.js`、`systems/elite.js`、`systems/evolution.js`、`systems/hud.js`、`systems/mutation.js`、`systems/organs.js`、`systems/player.js`

實際內容：把世界座標轉成螢幕座標，檢查是否在 `VIEW_W / VIEW_H` 周邊可視範圍內，依手機/桌機限制 `gameState.floatTexts` 上限，並在 50px / 100ms / 同色條件下合併數字文字，最後 push 到 `gameState.floatTexts`。繪製端仍在 `hud.js`。

搬到 `feedback.js` 後的依賴：`systems/gameState.js`、`systems/map.js` 的 `VIEW_W / VIEW_H`、`systems/camera.js` 的 `worldToScreen`。

可行性：✅。它不需要 combat 狀態，也不呼叫戰鬥函式；搬出後可直接解除多個「只為浮動文字而 import combat.js」的反向依賴。

## Q2 showXPPopup / addXP
定義位置：`showXPPopup` 在 `systems/player.js:563`；`addXP` 在 `systems/player.js:631`。

被 import 的模組：`showXPPopup` 被 `systems/combat.js`、`systems/organs.js` import；`addXP` 被 `systems/boss.js`、`systems/combat.js`、`systems/evolution.js`、`systems/organs.js`、`systems/ui.js` import。

內部依賴：`showXPPopup` 只是包一層 `showFloatingText(wx, wy, '+' + amount, '#FFD700', 13)`。`addXP` 會讀 `gameState.player.mutationXpBonus`，增加 `gameState.stats.xpCurrent` 與 `player.levelXP`，再呼叫內部 `checkLevelUp()`；`checkLevelUp()` 會播放 `AudioManager.play('levelUp')`、寫入 `gameState.levelUpMessage`，並呼叫 `showOrganSelection()`。

是否可和 showFloatingText 一起放進 feedback.js：`showXPPopup` 可以，因為它是純顯示 helper。`addXP` 不建議放入 feedback，因為它是數值與升級流程。

建議拆法：⚠️ 拆成兩層。`feedback.js` 放 `showFloatingText` / `showXPPopup`；`reward.js` 放 `addXP` 與 XP 相關獎勵入口，但 `reward.js` 不應直接 import `organs.js`。升級觸發 `showOrganSelection()` 應改為 `CustomEvent`、callback 注入，或由呼叫端/flow 層處理，否則會把 `reward.js -> organs.js` 的新循環帶回來。

## Q3 addMutationPoints 循環解法
定義位置：`systems/mutation.js:94`。`systems/combat.js` import 它，用於巨人化、Alpha、殺手化擊殺後給變異點。

mutation.js 的 showFloatingText 呼叫點：`systems/mutation.js:109`，在 `addMutationPoints(amount)` 儲存變異資料後，對玩家位置顯示 `✦ +N 變異點`。

目前循環：`combat.js -> mutation.js -> combat.js`。`mutation.js` 回頭 import `combat.js` 的唯一原因是 `showFloatingText`。

解法：若 `showFloatingText` 搬到 `systems/feedback.js`，`mutation.js` 改 import `feedback.js`，循環 #13 可解除。`mutation.js` 仍會 import `gameState`、`lang.js`、`storage/index.js`，不需要 import combat。

可行性：✅。

## Q4 utils.js ↔ combat.js
具體問題：`systems/utils.js:7` import `combat.js` 的 `_spawnBone`。`systems/combat.js:15` 又 import `utils.js` 的 `getGameFont`、`spawnLootCircle`、`applyTenacity`，形成 `combat.js <-> utils.js`。

`_spawnBone` 定義位置：`systems/combat.js:475`，內容只把 bone 物件 push 到 `gameState.bones`。

utils.js 使用位置：`systems/utils.js:117`，`spawnLootCircle()` 遇到 `item.type === 'bone'` 時呼叫 `_spawnBone(x, y, 8)`。

最小改動：把 `_spawnBone` 從 `combat.js` 搬到更低層的 bone/helper 模組，或直接讓 `spawnLootCircle()` 自己 push `gameState.bones`。較乾淨做法是新建 `systems/loot.js` 或 `systems/bone.js`，放 `_spawnBone` 與 `spawnLootCircle`，讓 `combat.js`、`organs.js` 依賴它，`utils.js` 回歸純繪圖/小工具。若只為解除 #14，最小可先把 `_spawnBone` 改到 `utils.js` 內部，但語意上 `utils.js` 會繼續混入掉落邏輯。

可行性：✅，但這一項不屬於 feedback/reward 主線，建議獨立小步做。

## Q5 boss.js ↔ player.js
boss.js import player.js 的內容：`systems/boss.js:16` import `addXP`。使用點在 `handleBossKill()` 的獵人死亡 +1000 XP、獵人血管擊破 +300 XP，以及 `showVictory()` 的通關 +500 XP。

player.js import boss.js 的內容：`systems/player.js:21` import `handleBossKill`。使用於投射物命中、dash 傷害等玩家側攻擊路徑，在 Boss HP 歸零時進入 Boss kill / victory 流程。

如果 addXP 搬到 reward.js：`boss.js` 可改 import `reward.js`，不再 import `player.js`，循環 #12 的一側會解除。但 `player.js` 仍 import `boss.js` 的 `handleBossKill`，所以若要完整解除 `boss.js <-> player.js`，還需要把 Boss 死亡處理改成事件、flow handler，或把 `handleBossKill` 移到不依賴 player 的 Boss/reward/flow 低層入口。

結論：⚠️ `addXP -> reward.js` 可解除 Boss 對 player 的反向依賴，但不足以單獨讓 player 不 import boss。`handleBossKill` 的方向也要拆。

## Q6 evolution.js 的循環解法
combat.js import evolution.js 的內容：`systems/combat.js:20` import `showSkillTree`，在 `applyDamageToPlayer()` 玩家死亡且沒有 tenacity 時呼叫。

evolution.js import combat.js 的內容：`systems/evolution.js:14` import `showFloatingText`。目前掃描到這個 import 存在，但在 `evolution.js` 內沒有實際呼叫點，屬於 dead import；移除或改到 `feedback.js` 都可解除 `evolution.js -> combat.js` 這一側。

showSkillTree CustomEvent 可行性：✅。`combat.js` 可在玩家死亡時 dispatch 例如 `CustomEvent('showSkillTree', { detail: { cause: 'death' } })`，由 `main.js` 或 flow/UI 初始化層監聽並呼叫 `showSkillTree()`。這和批次 1 用 `CustomEvent('startGame')` 解掉 `startGameWithLoading` 反向 import 的模式一致。

organs ↔ evolution 具體內容：`systems/organs.js` import `applyEvolutionLevelEffect`、`checkEvolutionUnlock`；`systems/evolution.js` import `applyOrganEffects`、`applyHiddenOrganEffects`、`showOrganSelection`、`showHiddenOrganSelection`、`getOrganSlotsUsed`。這不是單純 feedback/reward 問題，而是器官槽位、進化解鎖、器官效果套用與 UI 選擇流程互相纏在一起。

建議：批次 2 若只做 feedback/reward，可降低 #9，但 #10 需要額外拆 `organ/evolution rules` 或 flow 層，否則 `organs.js <-> evolution.js` 仍存在。

## Q7 feedback.js / reward.js 依賴清單
feedback.js 需要 import：`systems/gameState.js`、`systems/map.js`、`systems/camera.js`。可 export `showFloatingText`、`showXPPopup`。

reward.js 需要 import：`systems/gameState.js`、`systems/audio.js`、`lang.js`。若要儲存技能點或通關獎勵，可能還會需要 `storage/index.js`，但建議先只承接 XP：`addXP`、`checkLevelUp`。`reward.js` 不應 import `organs.js`、`combat.js`、`boss.js`、`player.js`。

新循環風險：有，但可避免。風險點是 `addXP()` 現在會直接 `showOrganSelection()`；如果 reward.js import organs.js，就會新增 `reward.js -> organs.js`，而 `organs.js` 又會 import reward.js，循環仍在。安全做法是 `reward.js` 在升級時 dispatch `CustomEvent('levelUp')` 或接受 callback，由 flow/UI 層呼叫 `showOrganSelection()`。

## 建議執行順序
Step 1：新增 `systems/feedback.js`，搬 `showFloatingText` 與 `showXPPopup`；更新 boss/creatures/elite/evolution/hud/mutation/organs/player/combat 的浮動文字 import。

Step 2：移除 `evolution.js` 對 `combat.js` 的 dead import；把 `combat.js` 死亡時的 `showSkillTree()` 改成 CustomEvent，由初始化層監聽。

Step 3：新增 `systems/reward.js`，搬 `addXP` 與 XP 顯示入口；升級後不要直接 import organs，而是事件或 callback 觸發器官選擇。

Step 4：把 `boss.js`、`combat.js`、`organs.js`、`evolution.js`、`ui.js` 對 player.js 的 `addXP` import 改到 reward.js。

Step 5：處理 Boss kill 方向：玩家/戰鬥側不要直接 import `handleBossKill`，改發 Boss killed event 或抽到 flow handler。

Step 6：處理 `utils.js -> combat.js`：把 `_spawnBone` / `spawnLootCircle` 移到低層 loot/bone 模組，或先將 `_spawnBone` 移出 combat。

Step 7：最後處理 `organs.js <-> evolution.js`：抽出純規則或 flow 層，將器官效果套用、進化解鎖、選單顯示分開。

## 預估解除循環數
本批次可解除：7 到 9 個循環。

高信心可解除：#8（combat.js ↔ organs.js 的 showFloatingText 側）、#9（combat.js ↔ evolution.js）、#13（combat.js ↔ mutation.js）、#14（combat.js ↔ utils.js）。

需同步事件化/flow 化才可完整解除：#6（combat.js ↔ player.js）、#7（organs.js ↔ player.js）、#10（evolution.js ↔ organs.js）、#11（boss.js ↔ combat.js）、#12（boss.js ↔ player.js）。

若本批次只做 feedback/reward 而不處理 Boss kill、showSkillTree、organ/evolution flow，實際解除數會低於 9。

剩餘循環：批次 3 預期處理低嚴重度與 UI/裝置耦合，包括 #15 `mobile.js ↔ player.js`、#16 `mobile.js ↔ ui.js`、#17 `evolution.js ↔ ui.js`；若 #10 或 Boss kill flow 未在批次 2 完成，也會順延到批次 3。
