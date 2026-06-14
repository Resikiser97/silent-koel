# 依賴規則
基準版本：v0.1.20.1
更新日期：2026-06-14

## 目的

本文件定義本專案的 import 依賴規則。目標不是要求所有循環立刻歸零，而是讓每次更新後的依賴關係可見、可維護、可審計。

任何新增功能、重構、修復，只要涉及 JS import，都應遵守本文件。

## 核心原則

1. 低層模組不可 import 高層流程模組。
2. 工具模組不可 import 戰鬥、UI、Boss、玩家等高層模組。
3. `main.js` 是入口層，不應被任何 `systems/` 模組 import。
4. 新增流程通知時，優先考慮事件、低層 service、callback 注入、shared state。
5. 允許短期存在已記錄的循環，但禁止新增未記錄循環。
6. 每次更新後若 import 關係有變，必須更新相關文件或審計報告。

## 模組分層

### Layer 0：資料與純設定

例：

- `config/*.js`
- `map/*.js`
- `storage/index.js`
- `stats/index.js`
- `lang.js`
- `lang/*.js`

規則：

- 應避免 import `systems/` 高層模組。
- 可被任何上層模組讀取。
- 不應觸發遊戲流程或 DOM 操作。

### Layer 1：低層狀態與工具

例：

- `systems/gameState.js`
- `systems/map.js`
- `systems/camera.js`
- `systems/audio.js`
- `systems/gameFlow.js`
- `systems/feedback.js`
- `systems/reward.js`
- `systems/loot.js`

規則：

- 不可 import `boss.js`、`combat.js`、`player.js`、`organs.js`、`evolution.js`、`ui.js`、`mobile.js`。
- 可提供共用 helper。
- 若需要通知高層流程，使用事件，不直接 import 高層。

### Layer 2：核心系統

例：

- `systems/player.js`
- `systems/combat.js`
- `systems/boss.js`
- `systems/organs.js`
- `systems/evolution.js`
- `systems/creatures.js`
- `systems/elite.js`
- `systems/daynight.js`
- `systems/spawning.js`

規則：

- 可 import Layer 0 / Layer 1。
- 核心系統之間若互相 import，必須確認是否會形成循環。
- 若是流程通知，優先用事件。
- 若是共用計算，抽到 Layer 1 或新的低層 rules/service 模組。

### Layer 3：UI / 裝置 / 線上功能

例：

- `systems/ui.js`
- `systems/mobile.js`
- `systems/chat.js`
- `systems/leaderboard.js`
- `systems/hud.js`

規則：

- 可依賴 Layer 0 / Layer 1。
- 對核心系統的呼叫應盡量走事件或 flow 層。
- UI helper 若被多個模組使用，應抽出 `tooltip.js`、`overlayUi.js` 之類低層 UI helper，避免 `evolution.js -> ui.js -> evolution.js`。

### Layer 4：入口與組裝

例：

- `main.js`

規則：

- 可以 import 各系統並組裝流程。
- 可以 listen 全域事件。
- 不應被任何系統模組 import。

## 禁止規則

### 禁止 main.js 反向依賴

禁止：

```js
import { something } from '../main.js';
```

替代：

- 抽到低層 module
- dispatch CustomEvent
- 在 `main.js` 中監聽事件

### 禁止工具模組依賴高層

禁止：

```js
// systems/utils.js
import { handleKill } from './combat.js';
```

替代：

- 抽到專門 service
- 呼叫方傳入 callback
- dispatch event

### 禁止為了顯示效果反向 import 流程模組

禁止：

```js
import { showFloatingText } from './combat.js';
```

替代：

```js
import { showFloatingText } from './feedback.js';
```

## 事件使用規則

適合用事件：

- UI 要通知 main/flow 開始遊戲
- 戰鬥結果通知 Boss kill
- reward 通知升級
- combat 通知顯示技能樹
- mobile 通知 dash request / tooltip request

不適合用事件：

- 純計算函式
- 需要同步 return 值的規則判斷
- 每幀大量呼叫的高頻邏輯
- 簡單低層 helper

事件必須記錄於 `docs/events.md`。

## 抽低層模組規則

當兩個高層模組互相 import，只是為了共用某個 helper，應抽低層模組。

常見候選：

- `damage.js`：玩家受傷、傷害計算
- `defeat.js`：普通擊殺、巨人擊殺、擊殺獎勵入口
- `attack.js`：玩家攻擊分派、遠程攻擊分派
- `organEffects.js`：器官效果套用
- `evolutionRules.js`：進化解鎖判斷
- `tooltip.js`：tooltip 顯示/隱藏
- `overlayUi.js`：共用 overlay builder

新增低層模組時需確認：

- 不 import 高層模組。
- 不直接操作不屬於自己責任的 UI/flow。
- 若需要觸發流程，使用事件。

## 允許暫存循環的條件

允許短期保留循環，但必須同時滿足：

- 已在 `ARCH.md` 或 Stage F audit 文件記錄。
- 有明確原因。
- 有未來拆分方向。
- 沒有造成測試失敗。
- 沒有讓 `main.js` 或 Layer 1 低層模組重新進入 SCC。

## 每次更新後的依賴檢查

若本次修改涉及 JS import，必須檢查：

1. 是否新增 `main.js` 反向 import。
2. 是否讓 Layer 1 低層模組 import Layer 2 / Layer 3。
3. 是否新增直接雙向 import。
4. SCC 是否變大。
5. 新增事件是否記錄於 `docs/events.md`。
6. 新增模組是否更新 `ARCH.md` / `QUICKREF.md` / `MAIN.md`。

## Claude Code 判斷準則

當 Claude Code 要新增 import 時，先回答：

1. 這個 import 是資料、helper、流程通知，還是 UI 組裝？
2. 被 import 的模組是否比目前模組更高層？
3. 是否可能造成雙向 import？
4. 是否應改用事件？
5. 是否應抽低層 service？
6. 若必須新增循環，是否已回報使用者並取得確認？

沒有回答清楚前，不應直接修改。

