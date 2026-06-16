請先讀取 DOC_INTEGRITY.md、ARCH.md、CHANGELOG.md、QUICKREF.md、VERSION_RULES.md。
確認 .claude/skills/ 下有哪些 Skill 可用。

## 背景

v0.1.25.0 新增的「成就 Bonus 系統」經 Codex 靜態審查，發現 5 個實際行為問題（已由 Claude Chat 對照目前代碼逐條核實，確認屬實，非誤報）。本次任務只修這 5 個 bug，不做其他重構或新增功能。

## 待修復項目

### 1. 特殊技能 CD 加成沒生效
檔案：`systems/player.js`（`playerDash()` 函式，阿奇爾分支與噪鵑分支各一處）

現狀：`systems/achievementBonus.js` 的 `applyAchievementStatBonuses()` 會把折扣寫進 `p._achSpecialCdReduction`，但 `playerDash()` 設定 `dashCooldown` 時直接用：
```js
p.dashCooldown = _archerSC.dashCD;
```
和
```js
p.dashCooldown = _koelSC.dashCD;
```
完全沒讀 `_achSpecialCdReduction`，導致 `no_damage_clear`、`mutation_500` 等成就的「特殊技能 CD -10%」不生效。

修復：兩處都改成套用折扣，例如：
```js
p.dashCooldown = Math.round(_archerSC.dashCD * (1 - (p._achSpecialCdReduction || 0)));
```
（噪鵑那處同理用 `_koelSC.dashCD`）

### 2. 面板公式的成就加成套用順序跟 runtime 不一致
檔案：`config/playerStatsFormula.js`（約 196 行起的 `atkFinal`，206 行 `hpFinal`，214 行 `spdFinal`，以及 261~284 行的成就加成區塊）

現狀：runtime 實際套用順序是 `applyEvolutionEffects() → applyAchievementStatBonuses() → applyAllMutationBonuses()`（見 `main.js` 623~625 行），也就是成就的 flat/percent 加成要先套用，最後才乘變異倍率。

但 `playerStatsFormula.js` 裡：
```js
const atkFinal = Math.round((atkBase + tfSkillAdd + terribleFangBonus + atkOrganAdd + atkEvoAdd) * atkMut);
...
let achAtkFinal = atkFinal + ach.attackAdd;
if (ach.attackPercent) achAtkFinal += Math.round(achAtkFinal * ach.attackPercent);
```
mutation 倍率（`atkMut`/`hpMut`/`spdMut`）在成就加成**之前**就已經乘進 `atkFinal/hpFinal/spdFinal`，跟 runtime 順序相反。結果：有變異等級時，面板顯示的攻擊/HP/速度數值跟實戰不一致（成就加成在面板裡少吃了一次 mutation 倍率）。

修復：把攻擊/HP/速度的計算拆成「先算不含 mutation 的基礎值 → 套成就 flat+percent → 最後統一乘 mutation 倍率」，順序對齊 runtime。注意要保留現有 return 物件裡 `organAdd`、`achAdd`、`achPercent` 等既有欄位語義，不要破壞呼叫端（成就面板 UI）讀取的欄位結構。

### 3. 精英怪擊殺 XP 沒套用 killXpPercent
檔案：`systems/organs.js`，`handleEliteKill()` 函式內兩個 `addXP()` 呼叫（約 525 行 `addXP(hunterXP)`，約 555 行 `const actualXP = addXP(xp)`）

現狀：`systems/damage.js`（68、112、155 行）和 `systems/boss.js`（1061、1079、1481 行）的擊殺 XP 都有手動套用：
```js
if (p._achKillXpPercent) xp = Math.round(xp * (1 + p._achKillXpPercent));
```
但 `organs.js` 的 `handleEliteKill()`（一般精英怪擊殺 + Hunter 精英怪擊殺兩個分支）都是直接把原始值丟進 `addXP()`，沒有套用這段邏輯，導致成就的擊殺 XP 加成對精英怪不生效。

修復：在兩個 `addXP()` 呼叫前都補上同樣的套用邏輯（風格與 `damage.js` 一致），例如：
```js
const p = gameState.player;
if (p._achKillXpPercent) hunterXP = Math.round(hunterXP * (1 + p._achKillXpPercent));
addXP(hunterXP);
```
另一處 `xp`/`actualXP` 同理。

### 4. 首頁變異面板的折扣判斷依賴 runtime 暫存欄位，可能讀到舊值或 undefined
檔案：`systems/evolution.js`（約 871 行 `_buildMutLeftColContent`），`systems/mutation.js`（約 382 行，同樣邏輯，請一併修正以保持一致）

現狀：
```js
const _discount = gameState.player._achMutationExchangeDiscount || 0;
```
`_achMutationExchangeDiscount` 只在 `initializeGame()` 跑 `applyAchievementStatBonuses()`（`systems/achievementBonus.js`）時才會寫進 `gameState.player`。首頁/遊戲外開啟的技能樹面板，這個欄位可能是 undefined 或上一局殘留的舊值，導致 `skill_master` 解鎖後的折扣在首頁路徑可能不生效或不準確。

修復：改成不依賴 player 暫存欄位，直接從成就解鎖狀態現算，例如：
```js
import { getAchievementBonusTotals } from './achievementBonus.js';
import { STORAGE_KEYS, storageGetJSON } from '../storage/index.js';
...
const _unlocked = storageGetJSON(STORAGE_KEYS.ACHIEVEMENTS) || {};
const _discount = getAchievementBonusTotals(Object.keys(_unlocked)).mutationExchangeDiscountPercent || 0;
```
`systems/evolution.js` 和 `systems/mutation.js` 兩處都改成這個讀法。匯入路徑請依各檔案實際相對路徑調整，注意避免循環 import（`achievementBonus.js` 目前只 import `gameState.js` / `config/achievements.js` / `storage/index.js`，應該不會跟 `evolution.js`/`mutation.js` 形成循環，但請實際確認後再下手）。

### 5. forceEvoOnly 時標題仍顯示「選擇器官」
檔案：`systems/organs.js`（約 226 行，`showOrganSelection` 內）

現狀：
```js
title.textContent = slotsFull ? t('chooseEvo') : t('chooseOrgan');
```
只看 `slotsFull`，沒考慮 `forceEvoOnly`。`evo_5star` 成就觸發的強制進化選擇（`forceEvoOnly = true`）時，標題可能仍顯示「選擇器官」，UX 不一致（功能本身不壞，純粹文字顯示錯誤）。

修復：
```js
title.textContent = (forceEvoOnly || slotsFull) ? t('chooseEvo') : t('chooseOrgan');
```

## 不在本次範圍內
- Codex 提到的測試環境問題（`npm.ps1` 被 PowerShell policy 擋、`npm.cmd` 後 vitest not recognized）是開發者本機環境問題，不是代碼問題，本次不處理。如果你的執行環境可以跑測試，請順手跑一次現有測試確認沒有 regression，並回報結果；跑不起來就照實回報，不要猜測結果。

## 版本與文件規範
- 這 5 項全部是 bug fix，沒有新功能，依 `VERSION_RULES.md`：`z` +1，`y` 不變 → **v0.1.25.0 → v0.1.25.1**
- 更新 `config/gameConfig.js` 的 `GAME_INFO.version`
- 在 `CHANGELOG.md` 最上方新增 v0.1.25.1 條目（### 修復 小節，5 條對應上面 1~5）
- 更新 `patchnotes.js` 最上方新增本次版本公告
- 同步修改檔案的 file header（如有）；若函式簽名有變動（例如 evolution.js/mutation.js 新增 import），同步 `QUICKREF.md`
- Patchnote 必須跟代碼在同一個 commit，不能分開 push

## 重要：完成後不要自行 commit / push
修改完成後，**先整理一份修改總結給開發者看**（改了哪些檔案、每個檔案改了什麼、版本號改成多少），**等開發者確認後才 commit**。不要自己決定 commit 訊息並推上去。
