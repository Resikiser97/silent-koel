# Phase 5 — 變異器官系統（localStorage + UI + 補償機制）

## 開始前必讀
請先讀取 `MAIN.md` 和 `CHANGELOG.md`，確認Phase 1、2、3、4已完成後再開始。

---

## 本次改動範圍

### 1. 新增：mutationData localStorage系統

**檔案：** 新增 `systems/mutation.js`

**localStorage key：** `mutationData`（獨立於 `SAVE_VERSION`，永遠不清除）

**資料結構：**
```javascript
const DEFAULT_MUTATION_DATA = {
    levels: { fang: 0, tail: 0, wing: 0, eye: 0 },
    points: 0,                  // 當前可用變異點
    totalPointsEarned: 0,       // 歷史總獲得（用於補償計算）
    compensationVersion: '0',   // 已執行補償的版本號
    skillPointsCompensated: 0,  // 已收到的技能點補償（記錄用）
};
```

**初始化：**
```javascript
function initMutationData() {
    try {
        const raw = localStorage.getItem('mutationData');
        if (raw) {
            gameState.mutationData = JSON.parse(raw);
            // 確保所有欄位都存在（舊存檔相容）
            gameState.mutationData = Object.assign({}, DEFAULT_MUTATION_DATA, gameState.mutationData);
        } else {
            gameState.mutationData = { ...DEFAULT_MUTATION_DATA };
        }
    } catch(e) {
        gameState.mutationData = { ...DEFAULT_MUTATION_DATA };
    }
}

function saveMutationData() {
    try {
        localStorage.setItem('mutationData', JSON.stringify(gameState.mutationData));
    } catch(e) {
        console.error('Failed to save mutation data:', e);
    }
}
```

在 `window.onload` 裡呼叫 `initMutationData()`（在其他初始化之後）。

---

### 2. 新增：變異點獲得函式

**檔案：** `systems/mutation.js`

```javascript
function addMutationPoints(amount) {
    if (!gameState.mutationData) return;
    gameState.mutationData.points += amount;
    gameState.mutationData.totalPointsEarned += amount;
    gameState.mutationData.hasNewPoints = true;  // 觸發紅點提示
    saveMutationData();
    // 顯示浮動文字
    const p = gameState.player;
    showFloatingText(p.x, p.y - 50, '✦ +' + amount + ' 變異點', '#FFD700');
}
```

---

### 3. 變異器官升級費用計算

**檔案：** `systems/mutation.js`

```javascript
function getMutationUpgradeCost(currentLevel) {
    // 每5級+1費，起始1費
    // Lv0→1: 1點, Lv5→6: 2點, Lv10→11: 3點
    return Math.floor(currentLevel / 5) + 1;
}

function upgradeMutation(organId) {
    const data = gameState.mutationData;
    if (!data) return;
    const currentLv = data.levels[organId] || 0;
    const cost = getMutationUpgradeCost(currentLv);
    if (data.points < cost) return;
    data.points -= cost;
    data.levels[organId] = currentLv + 1;
    data.hasNewPoints = false;
    saveMutationData();
    applyMutationEffects();  // 即時套用效果
}
```

---

### 4. 變異效果套用

**檔案：** `systems/mutation.js`

```javascript
function applyMutationEffects() {
    const p = gameState.player;
    const data = gameState.mutationData;
    if (!data || !p) return;

    // 效果套用在 applyOrganEffects() 之後，Final值的百分比加成
    // 這裡記錄multiplier，由 applyOrganEffects() 或 updatePlayerStats() 讀取
    p.mutationAttackBonus  = 1 + (data.levels.fang || 0) * 0.01;   // 每級+1%攻擊
    p.mutationHpBonus      = 1 + (data.levels.tail || 0) * 0.01;   // 每級+1%HP
    p.mutationSpeedBonus   = 1 + (data.levels.wing || 0) * 0.01;   // 每級+1%速度
    p.mutationXpBonus      = 1 + (data.levels.eye  || 0) * 0.01;   // 每級+1%XP倍數
}
```

**套用時機：**
在 `systems/organs.js` 的 `applyOrganEffects()` 最後，呼叫 `applyMutationEffects()` 套用Final值加成：
```javascript
// 在 applyOrganEffects() 末尾
if (gameState.mutationData) {
    p.attack    = Math.round(p.attack  * p.mutationAttackBonus);
    gameState.stats.hpMax = Math.round(gameState.stats.hpMax * p.mutationHpBonus);
    p.speed     = p.speed  * p.mutationSpeedBonus;
    // XP bonus在 addXP() 裡套用
}
```

在 `systems/player.js` 的 `addXP()` 裡套用XP加成：
```javascript
function addXP(amount) {
    const xpMult = (gameState.player.mutationXpBonus || 1);
    const finalAmount = Math.round(amount * xpMult);
    gameState.stats.xpCurrent += finalAmount;
    gameState.player.levelXP += finalAmount;
    checkLevelUp();
}
```

---

### 5. 補償機制

**檔案：** `systems/mutation.js`

```javascript
// 開發者設定：修改這裡觸發補償
const MUTATION_COMPENSATION_VERSION = '0';  // 改為 '1' 觸發第一次補償，'2' 觸發第二次，以此類推

const MUTATION_COMPENSATION_CONFIG = {
    '1': {
        description: '封測平衡調整補償',
        mutationPointsRate: 0.10,   // 返還totalPointsEarned的10%
        skillPointsRate:    0.10,   // 返還totalSkillPointsEarned的10%（需有此記錄）
    },
    // 之後版本在這裡新增
};

function checkMutationCompensation() {
    const data = gameState.mutationData;
    if (!data) return;
    if (data.compensationVersion === MUTATION_COMPENSATION_VERSION) return;

    // 找出所有未執行的補償版本
    const currentVer = parseInt(data.compensationVersion) || 0;
    const targetVer  = parseInt(MUTATION_COMPENSATION_VERSION) || 0;

    for (let v = currentVer + 1; v <= targetVer; v++) {
        const config = MUTATION_COMPENSATION_CONFIG[String(v)];
        if (!config) continue;

        // 返還變異點
        const mutPoints = Math.floor(data.totalPointsEarned * config.mutationPointsRate);
        if (mutPoints > 0) {
            data.points += mutPoints;
            data.totalPointsEarned += mutPoints;
        }

        // 返還技能點
        const totalSkillPts = gameState.playerSkills ?
            Object.values(gameState.playerSkills).reduce((a, b) => a + b, 0) : 0;
        const skillPts = Math.floor(totalSkillPts * config.skillPointsRate);
        if (skillPts > 0) {
            const current = parseInt(localStorage.getItem('skillPoints')) || 0;
            localStorage.setItem('skillPoints', String(current + skillPts));
            data.skillPointsCompensated += skillPts;
        }
    }

    data.compensationVersion = MUTATION_COMPENSATION_VERSION;
    saveMutationData();
    console.log('[Mutation] Compensation applied to version', MUTATION_COMPENSATION_VERSION);
}
```

在 `initMutationData()` 末尾呼叫 `checkMutationCompensation()`。

---

### 6. 新增：變異器官UI

**檔案：** `systems/ui.js`

#### 6a. 血條旁的變異圖標

在 `updateUI()` 的HP條旁邊，新增變異圖標區域：
- 位置：HP條右側，約20px間距
- 內容：⚗️ 圖標 + 總等級數字（四個器官等級加總）
- 紅點提示：`gameState.mutationData.hasNewPoints === true` 時顯示右下角紅點
- 點擊：呼叫 `showMutationPanel()`

#### 6b. 變異升級面板

```javascript
function showMutationPanel() {
    // 類似技能樹的面板，遊戲暫停
    // 面板內容：
    // - 標題：「⚗️ 變異器官」
    // - 可用變異點顯示
    // - 四個變異器官各一行：
    //   圖標 | 名稱 | 等級 | 效果描述 | 升級費用 | 升級按鈕
    // - 關閉按鈕
}
```

**四個器官顯示：**

| organId | 圖標 | 名稱 | 效果描述 |
|---|---|---|---|
| fang | 🦷 | 變異-憤怒的獠牙 | 每級+1%攻擊力（目前+X%） |
| tail | 🐾 | 變異-懦弱的尾巴 | 每級+1%HP（目前+X%） |
| wing | 🪶 | 變異-勇敢的翅膀 | 每級+1%速度（目前+X%） |
| eye  | 👁️ | 變異-好奇的眼睛 | 每級+1%XP倍數（目前+X%） |

升級費用顯示：`升級（費N點）`，點數不足時按鈕灰色。

**面板開啟時暫停遊戲：**
```javascript
gameState.mutationPanelOpen = true;  // isGamePaused() 需讀取此旗標
```

在 `isGamePaused()` 裡加入 `gameState.mutationPanelOpen` 的判斷。

#### 6c. 紅點清除

玩家打開面板時清除紅點：
```javascript
gameState.mutationData.hasNewPoints = false;
saveMutationData();
```

---

### 7. 更新：gameState

**檔案：** `systems/gameState.js`

新增欄位：
```javascript
mutationData: null,         // 由 initMutationData() 初始化
mutationPanelOpen: false,   // 變異面板是否開啟
```

在 `initializeGame()` 的重置區塊加入：
```javascript
gameState.mutationPanelOpen = false;
// mutationData 不重置（跨局永久保存）
```

---

### 8. index.html更新

新增 `systems/mutation.js` 的 script 標籤（在 `systems/organs.js` 之後）。

---

## MAIN.md 更新要求

新增以下區塊：

```
## 變異器官系統（v0.39.0）

### 儲存
- localStorage key：mutationData（獨立，不受SAVE_VERSION清除）
- 結構：levels{fang/tail/wing/eye}, points, totalPointsEarned, compensationVersion, skillPointsCompensated

### 四種變異器官
| organId | 名稱           | 效果（Final值）    |
|---------|---------------|------------------|
| fang    | 變異-憤怒的獠牙 | 每級+1%攻擊力     |
| tail    | 變異-懦弱的尾巴 | 每級+1%HP         |
| wing    | 變異-勇敢的翅膀 | 每級+1%速度       |
| eye     | 變異-好奇的眼睛 | 每級+1%XP倍數     |

### 升級費用
每5級+1費，起始1費：Lv0→1=1點，Lv5→6=2點，Lv10→11=3點
getMutationUpgradeCost(currentLevel) = Math.floor(currentLevel/5)+1

### 效果套用
- applyOrganEffects() 末尾套用Final值百分比加成
- XP加成在 addXP() 裡套用

### 獲得方式
- 擊殺巨人化：100%+1，10%額外1~3
- 擊殺Alpha：100%+1，20%額外1~6
- 擊殺殺手化：100%+1，killerCorpseEaten=N → N%機率額外1~N（死亡時結算）

### 補償機制
- MUTATION_COMPENSATION_VERSION 控制版本
- MUTATION_COMPENSATION_CONFIG 設定各版本補償比例
- 返還變異點（totalPointsEarned×rate）和技能點
- 執行一次後記錄compensationVersion避免重複

### UI
- HP條右側圖標，點擊開啟升級面板
- 新獲得變異點時右下角紅點提示（hasNewPoints=true）
- 面板開啟時遊戲暫停（mutationPanelOpen=true）
- gameState.mutationPanelOpen 加入 isGamePaused() 判斷
```

---

## CHANGELOG.md 更新要求

```
## v0.39.0 - [日期]

### 新增
- **變異器官系統**（`systems/mutation.js`）：四種永久跨局器官（憤怒的獠牙/懦弱的尾巴/勇敢的翅膀/好奇的眼睛），各+1%攻擊/HP/速度/XP倍數（Final值）；升級費用每5級+1費；獨立localStorage key mutationData，不受SAVE_VERSION清除
- **變異點獲得**（`systems/mutation.js`）：addMutationPoints()；擊殺巨人化/Alpha/殺手化掉落；即時顯示浮動文字
- **變異器官UI**（`systems/ui.js`）：HP條右側圖標+總等級，新點數紅點提示，點擊彈出升級面板（類似技能樹，遊戲暫停）
- **補償機制**（`systems/mutation.js`）：MUTATION_COMPENSATION_VERSION控制，可返還變異點和技能點，執行一次後記錄

### 調整
- `addXP()` 套用 mutationXpBonus 乘數
- `applyOrganEffects()` 末尾套用變異Final值加成
- `isGamePaused()` 加入 mutationPanelOpen 判斷
```

---

## 完成後檢查清單

- [ ] `localStorage.getItem('mutationData')` 有正確的JSON結構
- [ ] 擊殺巨人化後有浮動文字「✦ +1 變異點」
- [ ] HP條右側有⚗️圖標和總等級數字
- [ ] 獲得新變異點後圖標右下角有紅點
- [ ] 點擊圖標暫停遊戲並彈出升級面板
- [ ] 面板顯示4個器官和各自等級/費用
- [ ] 點數不足時按鈕灰色
- [ ] 升級後效果即時生效（攻擊/HP/速度/XP加成）
- [ ] 重新遊戲後變異等級和點數保留
- [ ] MUTATION_COMPENSATION_VERSION改為'1'後，下次啟動自動補償並記錄
- [ ] MAIN.md已更新
- [ ] CHANGELOG.md已更新
- [ ] 版本號已更新
