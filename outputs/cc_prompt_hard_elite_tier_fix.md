請先讀取 DOC_INTEGRITY.md、ARCH.md、CHANGELOG.md、QUICKREF.md、VERSION_RULES.md。
確認 .claude/skills/ 下有哪些 Skill 可用。

---

# 任務：困難難度靜音獵隊精英怪 HP/傷害/速度計算邏輯修正

## 背景

困難難度精英怪（幽靈犬/暗影犬/毒霧犬、幽靈隼/暗影隼/毒霧隼）目前的 HP/傷害是「綁在身份」上的固定值（`HARD_ELITE_CONFIG[eliteType].hp/damage`），但身份落在第幾夜是開局隨機洗牌決定的，導致星級（★/★★/★★★）跟數值之間沒有固定對應關係。簡單/普通難度的精英怪則是依「第幾夜」用倍率算出來的，星級永遠對應固定數值。

開發者已確認修正方向：困難難度也改成跟簡單/普通同一套「依夜晚倍率計算」公式，身份只決定打法/技能/外觀，不再決定強弱。身份落在哪一夜維持現有開局隨機洗牌不變。

## 需要修改的地方

### 1. `systems/elite.js` — `_spawnHunterElite()` 函式（目前約第78–98行）

把現有的：

```js
const strengthMult = (!isHardMap && gameState.currentMap && gameState.currentMap.creatureStrength)
    ? (gameState.currentMap.creatureStrength.hostile.hpMultiplier || 1)
    : 1;
const hp = isHardMap
    ? cfg.hp
    : Math.round(ELITE_CONFIG.base.hp * tier.hpMultiplier * strengthMult);
const damage = isHardMap
    ? cfg.damage
    : Math.round(ELITE_CONFIG.base.damage * tier.damageMultiplier);
const speed  = isHardMap
    ? (tier.speed || 3.9)
    : (ELITE_CONFIG.base.speed + tier.speedBonus);
```

改成所有難度統一公式（移除 `isHardMap` 分支，困難難度不再讀 `cfg.hp`/`cfg.damage`）：

```js
const strengthMult = (gameState.currentMap && gameState.currentMap.creatureStrength)
    ? (gameState.currentMap.creatureStrength.hostile.hpMultiplier || 1)
    : 1;
const hp = Math.round(ELITE_CONFIG.base.hp * tier.hpMultiplier * strengthMult);
const damage = Math.round(ELITE_CONFIG.base.damage * tier.damageMultiplier);
const speed = ELITE_CONFIG.base.speed + tier.speedBonus;
```

確認後新數值（困難地圖 `map/hardmap.js` 的 `elites` 倍率：night1 hpMultiplier8/damageMultiplier2.0/speedBonus0.5，night2 15/3.0/1.0，night3 25/4.0/2.0；`creatureStrength.hostile.hpMultiplier` = 2.5；`ELITE_CONFIG.base` = hp50/damage8/speed1.0）：

| 夜晚 | 舊HP（固定值，依身份不同） | 新HP | 舊傷害 | 新傷害 |
|---|---|---|---|---|
| 第1夜（★） | 480/336（幽靈犬/隼） | 1000 | 20/26 | 16 |
| 第2夜（★★） | 900/630（暗影犬/隼） | 1875 | 30/39 | 24 |
| 第3夜（★★★） | 1500/1050（毒霧犬/隼） | 3125 | 45/58 | 32 |

這個數值變動（尤其HP明顯提高、傷害降低）已經跟開發者確認過，請直接套用，不需要再額外調整係數。

**`cfg`（`HARD_ELITE_CONFIG[eliteType]`）其餘欄位維持原樣使用，不要更動**：`radius`、`attackCooldown`、`type`（melee/ranged）、`range`、`bulletSpeed`、`pellets`、`spreadAngle`、毒霧相關參數（`poisonDps`、`puddleRadius` 等）——這些是身份決定的打法/技能，跟強度無關，繼續保留。

`gameState.currentMap.elites[nightNum - 1]`（即程式碼裡的 `tier`）困難地圖 `map/hardmap.js` 已經有完整的 `elites` 陣列（含 `hpMultiplier`/`damageMultiplier`/`speedBonus`），不需要新增。

### 2. `config/gameConfig.js` — `HARD_ELITE_CONFIG`（約第27–39行）

`hp` 和 `damage` 這兩個欄位修改後不再被 `_spawnHunterElite()` 讀取。**不要整個刪除這個物件**（其餘欄位還在用），但請在 `hp`/`damage` 欄位旁加上註解說明「已不用於戰鬥數值計算，僅供歷史參考，實際強度依 `map.elites[].hpMultiplier`/`damageMultiplier` 計算」，避免未來有人誤改這兩個數字以為會生效。

### 3. 修改前請先搜尋確認

請搜尋整個專案是否有其他地方讀取 `HARD_ELITE_CONFIG[xxx].hp` 或 `.damage`（例如 UI 顯示、測試檔案），若有請一併確認是否需要同步調整，不要假設只有 `elite.js` 用到。

### 4. 不要修改的部分

- `initEliteOrder()`（身份出現順序的開局隨機洗牌邏輯）完全不要動。
- `config/compendium_data.js` 的精英怪圖鑑文案**不要動**，開發者會自己另外處理。

## 版本與文件同步

- 版本號：v0.1.25.8 → **v0.1.25.9**（z+1，bug fix 類別，已確認）。
- 同步更新 `CHANGELOG.md`、`project_summary.md`、`QUICKREF.md`、`config/gameConfig.js`（若有版本常數）等慣例上會記錄版本號的檔案。
- `CHANGELOG.md` 開發者向條目請清楚寫明：困難難度靜音獵隊精英怪 HP/傷害/速度計算方式從「身份固定值」改為「依出場夜晚倍率計算」（跟簡單/普通同公式），並附上修正前後數值對照；同時記錄速度欄位名稱 bug 修正（`tier.speed` → `tier.speedBonus`）。
- `config/patchnotes.js` 玩家向條目請用平易語氣描述（**不要出現 seed / mapSeed 等技術字眼**），例如類似：「修正困難難度靜音獵隊精英怪數值機制：強度改為依出場夜晚決定，跟簡單/普通難度精英怪採用相同規則，身份只影響打法與技能；同步修正精英怪移動速度未隨夜晚遞增的問題。」可依實際修改潤飾文字，但語氣需跟現有 patchnotes 風格一致。
- Patchnote 必須與代碼在同一個 commit。

## 重要：不要 commit / push

代碼與文件修改完成後，**不要執行 git commit 或 push**。請完成修改、跑一次基本檢查（語法、有無其他地方引用到改動的欄位）後，把修改摘要回報給開發者，等開發者親自審查後才會下指令 commit。
