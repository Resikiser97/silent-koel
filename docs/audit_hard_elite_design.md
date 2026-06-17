# 困難難度「靜音獵隊」精英怪審查報告（唯讀，未修改任何代碼）

審查日期：2026-06-17
審查範圍：`systems/elite.js`、`config/gameConfig.js`、`map/hardmap.js`、`map/easymap.js`、`docs/history/HARD_MAP_DESIGN.md`
審查目的：確認困難難度精英怪「星級」與「身份（幽靈/暗影/毒霧、犬/隼）」是否綁死，以及現行代碼是否符合原始設計文件。

---

## 一、結論（先講重點）

1. **現行代碼：星級與身份是分開決定的兩個隨機結果，彼此沒有固定對應關係。**
   - 星級（★/★★/★★★）只代表「第幾夜」，純粹是夜晚編號的顯示符號。
   - 身份（幽靈/暗影/毒霧）落在哪一夜，是開局時用 `mapSeed` 洗牌決定的，每局都可能不同。
   - 結果：同一個名字（例如「幽靈犬」）在不同局可能對應到 ★、★★ 或 ★★★ 中的任何一個；同一個星級在不同局也可能對應到任何一個身份。**這代表遊戲內實際顯示出來的招牌（例如「★★ 幽靈犬」）本身就可能出現，並不是固定「幽靈=★」。**

2. **困難難度的 HP／傷害是綁在身份上的固定值，完全沒有使用夜晚倍率（`hpMultiplier`/`damageMultiplier`）。** 這些倍率資料雖然還寫在 `map/hardmap.js` 裡，但對困難難度的靜音獵隊精英怪而言是死代碼（從未被讀取）。

3. **比對 `docs/history/HARD_MAP_DESIGN.md` 原始設計文件，現行代碼至少有三處偏離原始設計**，方向都是「身份固定數值」，而非原案的「星級／夜晚決定強度，身份只是外觀」。詳見第三節。

4. **連帶發現一個獨立的數值 bug**：困難難度精英怪的速度永遠是固定值 3.9，`map/hardmap.js` 裡 `speedBonus: 0.5/1.0/2.0` 完全沒被套用（欄位名稱寫錯，詳見第四節）。

---

## 二、現行代碼實際運作方式（含行號）

### 2.1 星級＝夜晚編號，與身份無關

`systems/elite.js`：

```js
const _HUNTER_ELITE_STARS = ['★', '★★', '★★★'];   // 第34行，純粹依夜晚索引
...
const star = _HUNTER_ELITE_STARS[nightNum - 1] || _HUNTER_ELITE_STARS[0];  // 第83行
...
label: star + ' ' + meta.label,   // 第121行：遊戲內實際顯示的招牌文字
```

`star` 只由 `nightNum`（第幾夜）決定，跟 `eliteType`（幽靈/暗影/毒霧、犬/隼）完全無關。

### 2.2 身份落在哪一夜，是開局種子洗牌決定的

`systems/elite.js`，`initEliteOrder()`（第37–72行）：

```js
const types = ['specter', 'shadow', 'venom'];
let s = seed;
function seededRand() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
for (let i = types.length - 1; i > 0; i--) {           // Fisher-Yates 洗牌
    const j = Math.floor(seededRand() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
}
...
let usesFalcon = false;
if (isHard) { usesFalcon = seededRand() < 0.5; }        // 整局只決定一次：犬隊或隼隊

if (isHard) {
    gameState.eliteOrder = types.map(type => type + (usesFalcon ? 'Falcon' : 'Dog'));
} else {
    gameState.eliteOrder = types.map(type => type + 'Dog');  // Easy/Normal 不洗牌身份，但也不用身份決定數值
}
```

`types` 陣列本身先被洗牌，所以 `eliteOrder[0]`（第1夜）可能是 `specter`、`shadow`、`venom` 中任何一個——這代表**第1夜（★）不保證是幽靈系**。

### 2.3 HP／傷害：困難難度完全綁定身份，無視夜晚倍率

`systems/elite.js`，`_spawnHunterElite()`（第78–98行）：

```js
const cfg  = HARD_ELITE_CONFIG[eliteType];     // 第79行：依「身份」查表
const tier = map.elites[nightNum - 1];          // 第81行：依「夜晚」查表（困難難度沒用到）
...
const hp = isHardMap
    ? cfg.hp                                                          // 困難：固定值，來自身份
    : Math.round(ELITE_CONFIG.base.hp * tier.hpMultiplier * strengthMult);  // 簡單/普通：夜晚倍率計算
const damage = isHardMap
    ? cfg.damage                                                      // 困難：固定值，來自身份
    : Math.round(ELITE_CONFIG.base.damage * tier.damageMultiplier);   // 簡單/普通：夜晚倍率計算
```

`HARD_ELITE_CONFIG`（`config/gameConfig.js` 第27–39行）固定值：

| 身份 | HP | 傷害 |
|---|---|---|
| 幽靈犬 specterDog | 480 | 20 |
| 暗影犬 shadowDog | 900 | 30 |
| 毒霧犬 venomDog | 1500 | 45 |
| 幽靈隼 specterFalcon | 336 | 26 |
| 暗影隼 shadowFalcon | 630 | 39 |
| 毒霧隼 venomFalcon | 1050 | 58 |

這些數字永遠跟著身份名稱走，不管該身份這局被洗牌到第幾夜。

---

## 三、與原始設計文件的對比

`docs/history/HARD_MAP_DESIGN.md` 第386–398行（5.1 精英怪類型總覽）：

```
| 族群 | 名稱   | 星級  | 攻擊類型    |
| 隼族 | 幽靈隼 | ★    | Sniper遠程  |
| 隼族 | 暗影隼 | ★★   | Shotgun遠程 |
| 隼族 | 毒霧隼 | ★★★  | 毒霧炮      |
| 犬族 | 幽靈犬 | ★    | 近戰        |
| 犬族 | 暗影犬 | ★★   | 近戰        |
| 犬族 | 毒霧犬 | ★★★  | 近戰+毒     |

出現規則：
- 第一夜（★）：隨機出現幽靈隼 或 幽靈犬
- 第二夜（★★）：隨機出現暗影隼 或 暗影犬
- 第三夜（★★★）：隨機出現毒霧隼 或 毒霧犬
```

以及第8節「待定數值」（第542–552行）寫明：「各精英怪基礎血量｜參考 HARD_MAP elites 倍率計算」。

**原始設計意圖很明確：**
- 星級與身份的對應是**固定**的（幽靈=★、暗影=★★、毒霧=★★★），每夜只隨機決定「這夜是犬還是隼」。
- HP 應該透過 `HARD_MAP.elites[].hpMultiplier` 這種夜晚倍率計算，跟簡單/普通難度走同一套機制，身份只決定外觀/技能，不決定數值。

**現行代碼偏離了這個設計，共三處：**

| 項目 | 原始設計 | 現行代碼 |
|---|---|---|
| 星級↔身份對應 | 固定（幽靈=★、暗影=★★、毒霧=★★★） | 隨機洗牌，每局不同 |
| 犬／隼決定方式 | 每夜各自隨機 | 整局只決定一次（全犬或全隼，不混搭） |
| HP／傷害來源 | 夜晚倍率（`HARD_MAP.elites[].hpMultiplier`），與簡單/普通同機制 | 身份固定值（`HARD_ELITE_CONFIG`），完全不用夜晚倍率 |

這與你描述的原意「跟簡單普通一樣以星級決定強度，類型元素套用強度而已」完全吻合——目前的程式碼並沒有照這個設計實作，比較像是實作過程中的邏輯偏移，而非刻意改設計（但無法100%排除中途刻意改版的可能，只是目前找不到任何文件記錄這個改動）。

---

## 四、附帶發現：困難精英怪速度 bug

`systems/elite.js` 第96–98行：

```js
const speed  = isHardMap
    ? (tier.speed || 3.9)              // tier 物件裡沒有 speed 這個欄位
    : (ELITE_CONFIG.base.speed + tier.speedBonus);
```

`map/hardmap.js` 的 `elites` 陣列（第27–30行）欄位名稱是 `speedBonus`，不是 `speed`：

```js
elites: [
    { night: 1, hpMultiplier:  8, speedBonus: 0.5, damageMultiplier: 2.0 },
    { night: 2, hpMultiplier: 15, speedBonus: 1.0, damageMultiplier: 3.0 },
    { night: 3, hpMultiplier: 25, speedBonus: 2.0, damageMultiplier: 4.0 },
],
```

`tier.speed` 永遠是 `undefined`，所以困難難度精英怪的速度永遠 fallback 到 `3.9`，不分第幾夜，完全沒有隨夜晚變快。

---

## 五、這份審查跟「圖鑑文案」的關係（未處理，需要你決定方向）

目前圖鑑文案卡住的根本原因就是這份審查的結論：**現行代碼裡，星級＝夜晚編號，身份＝獨立隨機，兩者沒有固定對應**。所以：

- 如果圖鑑要用「★／★★／★★★ + 固定數值」的格式（你要求的方向），代碼必須先改成原始設計那樣——身份固定對應星級，HP 改用夜晚倍率算——這樣★才會有唯一、可預期的數值。
- 如果不改代碼，圖鑑只能誠實描述「★對應到哪個身份是開局隨機決定的，本局可能是以下三者之一」，無法用單一固定數值標在★後面。

這是一個需要你決定方向的設計選擇，不在「直接修文案」的授權範圍內，**本報告不涉及任何代碼修改**。
