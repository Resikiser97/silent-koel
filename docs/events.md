# 事件清單
基準版本：v0.1.20.1
更新日期：2026-06-14

## 目的

本文件記錄專案內用來降低直接 import 依賴的事件。新增、修改、移除事件時，必須同步更新本文件。

事件的目標是降低模組循環，不是隱藏流程。每個事件都必須清楚記錄：

- 事件名稱
- dispatch 來源
- listen 位置
- payload 格式
- 用途
- 注意事項

## 事件命名規則

使用 lower camel case 字串：

```js
window.dispatchEvent(new CustomEvent('eventName', { detail: { ... } }));
```

若未來事件變多，建議新增：

```js
// systems/events.js
export const GAME_EVENTS = {
  START_GAME: 'startGame',
  SHOW_SKILL_TREE: 'showSkillTree',
  LEVEL_UP: 'levelUp',
  BOSS_KILLED: 'bossKilled',
};
```

目前尚未建立集中常數檔，事件名稱先以本文件為準。

## 現有事件

### startGame

用途：

通知入口層開始遊戲，避免 `ui.js` / `evolution.js` 直接 import `main.js`。

dispatch 來源：

- `systems/ui.js`
- `systems/evolution.js`

listen 位置：

- `main.js`

payload：

目前無固定 payload。

建議 payload：

```js
{
  source: 'ui' | 'evolution',
  difficulty?: 'easy' | 'normal' | 'hard',
  characterId?: string
}
```

注意事項：

- 不應由低層工具模組 dispatch。
- 不應在事件 listener 中新增多條分散流程，保持 `main.js` 作為組裝入口。

### showSkillTree

用途：

通知顯示技能樹或死亡結算，避免 `combat.js` 直接 import `evolution.js`。

dispatch 來源：

- `systems/combat.js`

listen 位置：

- `main.js`

payload：

目前應至少包含原因。

建議格式：

```js
{
  cause: 'death' | 'timeout' | string
}
```

注意事項：

- 若是時間歸零由 UI 或 flow 觸發，也應使用同一事件或集中 flow handler。
- 不建議讓多個不同模組各自 listen 並建立 overlay，避免重複開啟。

### levelUp

用途：

`reward.js` 升級後通知高層顯示器官選擇，避免 `reward.js` import `organs.js`。

dispatch 來源：

- `systems/reward.js`

listen 位置：

- `main.js`

payload：

建議格式：

```js
{
  level: number,
  pendingOrganSelections?: number
}
```

注意事項：

- `reward.js` 不應 import `organs.js`。
- 器官選擇順序仍需遵守 `showHiddenOrganSelection()` 與 `showOrganSelection()` 的既有規則。

### bossKilled

用途：

通知 Boss 死亡，避免 `player.js` 直接 import `boss.js`，並作為 Stage F 3a 繼續解除 `combat.js -> boss.js` 的目標事件。

dispatch 來源：

- `systems/player.js`（玩家接觸 Boss 觸發死亡）
- `systems/combat.js`（攻擊/毒傷/流血等 combat 路徑觸發 Boss 死亡，Stage F 3a 完成）
- `systems/damage.js`（刺甲反傷觸發 Boss 死亡，Stage F 3a 完成）

listen 位置：

- `main.js`

payload：

建議格式：

```js
{
  boss: object,
  source: 'player' | 'combat' | 'damage' | string
}
```

注意事項：

- listener 應集中呼叫 `handleBossKill(boss)`。
- 不要在多處 listener 同時加 XP / 勝利 / 存檔，避免 Boss kill 流程被重複執行。
- Boss kill handler 本身仍需防重入。

## 建議新增事件

### playerDamaged

用途：

解除 `boss.js -> combat.js` 對 `applyDamageToPlayer` 的直接依賴，或作為抽出 `damage.js` 前的過渡。

建議 dispatch 來源：

- `systems/boss.js`
- `systems/creatures.js`
- `systems/elite.js`

建議 listen 位置：

- `main.js`
- 或未來 `systems/playerDamage.js`

建議 payload：

```js
{
  amount: number,
  attacker?: object,
  damageType?: string
}
```

注意事項：

- 高頻傷害事件可能有成本，毒霧 tick 類事件要避免每幀大量 dispatch。
- 若需要同步 return 值，不適合事件，應抽 `damage.js`。

### creatureKilled

用途：

解除 `player.js -> combat.js` 對 `handleKill` 的直接依賴。

建議 dispatch 來源：

- `systems/player.js`
- `systems/combat.js`

建議 listen 位置：

- 未來 `systems/defeat.js`
- 或 `main.js` flow handler

建議 payload：

```js
{
  creature: object,
  isHostile: boolean,
  source: 'player' | 'combat' | string
}
```

注意事項：

- 擊殺流程通常需要同步處理 XP、屍體、統計，因此長期更建議抽 `defeat.js`，事件可作為流程通知。

### giantKilled

用途：

解除 `player.js -> combat.js` 對 `handleGiantKill` 的直接依賴。

建議 payload：

```js
{
  creature: object,
  source: 'player' | 'combat' | string
}
```

注意事項：

- 可和 `creatureKilled` 合併，用 `creature.isGiantized` 判斷。

### playerDashRequested

用途：

解除 `mobile.js -> player.js` 對 `playerDash` 的直接依賴。

建議 dispatch 來源：

- `systems/mobile.js`

建議 listen 位置：

- `main.js`
- 或 input/flow 初始化層

payload：

```js
{
  source: 'mobile'
}
```

注意事項：

- dash 是否可用仍應由 player/dash 邏輯判斷，不要在 mobile 中複製規則。

### tooltipRequested

用途：

解除 `mobile.js -> ui.js` 或其他模組對 `showTooltip` 的直接依賴。

建議 dispatch 來源：

- `systems/mobile.js`
- `systems/evolution.js`
- `systems/organs.js`

建議 listen 位置：

- `systems/ui.js`
- 或未來 `systems/tooltip.js`

payload：

```js
{
  data: object,
  x: number,
  y: number,
  durationMs?: number
}
```

注意事項：

- 若 tooltip 被大量 hover 觸發，直接抽 `tooltip.js` 可能比事件更清楚。

### tooltipHideRequested

用途：

集中隱藏 tooltip。

payload：

```js
{
  reason?: string
}
```

## 事件使用警告

事件能解除 import cycle，但會增加隱性依賴。

因此禁止：

- 新增事件但不寫入本文件。
- 多個 listener 同時修改同一批核心狀態。
- 在事件 listener 裡偷偷呼叫大量無文件記錄的流程。
- 對每幀高頻邏輯濫用 DOM CustomEvent。

若事件開始變多，必須新增 `systems/events.js` 統一管理事件名稱。

