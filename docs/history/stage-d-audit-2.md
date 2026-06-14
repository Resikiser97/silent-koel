# Stage D 深度預審計報告（Round 2）
更新日期：2026-06-14

## systems/creatures.js
### Q1 _effSpeed 呼叫點

函式位置：`systems/creatures.js:85`

目前簽名：

```js
export function _effSpeed(c)
```

目前邏輯：
- 內部直接呼叫 `Date.now()`
- 若 `c._slowUntil` 存在且 `now < c._slowUntil`，回傳 `c.speed * (c._slowMult || 1.0)`
- 否則回傳 `c.speed`

`systems/creatures.js` 內呼叫點：
- `systems/creatures.js:628`
- `systems/creatures.js:629`
- `systems/creatures.js:1010`（同一行呼叫 2 次）
- `systems/creatures.js:1021`（同一行呼叫 2 次）
- `systems/creatures.js:1164`
- `systems/creatures.js:1165`
- `systems/creatures.js:1233`
- `systems/creatures.js:1234`
- `systems/creatures.js:1264`
- `systems/creatures.js:1265`
- `systems/creatures.js:1358`
- `systems/creatures.js:1359`
- `systems/creatures.js:1368`
- `systems/creatures.js:1369`
- `systems/creatures.js:1390`
- `systems/creatures.js:1391`
- `systems/creatures.js:1404`
- `systems/creatures.js:1405`
- `systems/creatures.js:1426`（同一行呼叫 2 次）
- `systems/creatures.js:1748`
- `systems/creatures.js:1749`
- `systems/creatures.js:1929`
- `systems/creatures.js:1930`
- `systems/creatures.js:1971`（同一行呼叫 2 次）

其他 JS 檔呼叫點（不含 `dist/`）：
- `systems/boss.js:15` import `_effSpeed`
- `systems/boss.js:1326`
- `systems/boss.js:1437`
- `systems/boss.js:1450`
- `systems/elite.js:16` import `_effSpeed`
- `systems/elite.js:420`
- `systems/elite.js:434`
- `systems/elite.js:461`
- `systems/elite.js:515`
- `systems/elite.js:517`

改成 `_effSpeed(c, now = Date.now())` 後，既有呼叫點不需要同步修改，因為 `now` 有預設值。只有新增測試或想讓同一個 update loop 內完全共用固定時間時，才需要在呼叫點傳入 `now`。Stage D 建議先只改簽名與測試，不批量調整所有現有呼叫點，降低風險。

### Q2 _shouldFleeFromGiant 測試 case

函式位置：`systems/creatures.js:676`

目前沒有 export。

實際內容：

```js
function _shouldFleeFromGiant(creature, target) {
    if (creature.isKiller) return false;
    if (target.isAlpha) return true;
    return target.hp > creature.hp * 3;
}
```

純函式性質確認：是純函式。只讀取 `creature.isKiller`、`creature.hp`、`target.isAlpha`、`target.hp`，不讀 `gameState`，不呼叫其他模組，不修改輸入物件。

代表性測試 case：
- 殺手不逃：`creature = { isKiller: true, hp: 10 }`，`target = { isAlpha: true, hp: 999 }` → `false`
- 非殺手遇 Alpha 必逃：`creature = { isKiller: false, hp: 100 }`，`target = { isAlpha: true, hp: 1 }` → `true`
- 普通巨人 HP 大於肉食者 3 倍才逃：`creature = { isKiller: false, hp: 100 }`，`target = { isAlpha: false, hp: 301 }` → `true`；若 `target.hp = 300` → `false`，因為條件是 `>` 不是 `>=`

### Q3 _hyenaWheelPosition 回傳結構與測試 case

函式位置：`systems/creatures.js:947`

目前沒有 export。

目前簽名：

```js
function _hyenaWheelPosition(hyena, pack, target)
```

內部依賴：
- `Date.now()`
- `Math.max`
- `Math.cos`
- `Math.sin`
- `Math.PI`
- `pack.indexOf(hyena)`

回傳結構：

```js
{
    x: number,
    y: number
}
```

計算方式：
- `index = Math.max(0, pack.indexOf(hyena))`
- `spacing = hyena.radius * 2 + 15`
- `orbit = Math.max(target.radius + hyena.attackRange + spacing, spacing * pack.length / Math.PI)`
- `angle = (Math.PI * 2 / Math.max(1, pack.length)) * index + (Date.now() / ((hyena.hyenaAttackInterval || 1000) * 0.9))`
- `x = target.x + Math.cos(angle) * orbit`
- `y = target.y + Math.sin(angle) * orbit`

建議改成：

```js
export function _hyenaWheelPosition(hyena, pack, target, now = Date.now())
```

測試 case 1：固定 `now = 0`，pack 長度 2，不同鬣狗在 target 左右兩側
- `hyenaA = { radius: 10, attackRange: 30, hyenaAttackInterval: 1000 }`
- `hyenaB = { radius: 10, attackRange: 30, hyenaAttackInterval: 1000 }`
- `pack = [hyenaA, hyenaB]`
- `target = { x: 100, y: 100, radius: 20 }`
- `spacing = 35`
- `orbit = Math.max(20 + 30 + 35, 35 * 2 / Math.PI) = 85`
- 呼叫 `_hyenaWheelPosition(hyenaA, pack, target, 0)` → 約 `{ x: 185, y: 100 }`
- 呼叫 `_hyenaWheelPosition(hyenaB, pack, target, 0)` → 約 `{ x: 15, y: 100 }`
- 預期：兩者 `x` 不同，且都在距離 target 約 `85` 的 orbit 上

測試 case 2：固定 `now = 450`，pack 長度 3，不同 index 角度相差 120 度
- `hyenaA/B/C = { radius: 8, attackRange: 25, hyenaAttackInterval: 1000 }`
- `pack = [hyenaA, hyenaB, hyenaC]`
- `target = { x: 0, y: 0, radius: 12 }`
- `spacing = 31`
- `orbit = Math.max(12 + 25 + 31, 31 * 3 / Math.PI) = 68`
- `now / (interval * 0.9) = 450 / 900 = 0.5`
- 預期：三個回傳點都在半徑約 `68` 的圓上，且座標彼此不同；可用 `Math.hypot(x, y)` 近似等於 `68` 驗證 orbit，用座標不相等驗證不同鬣狗位置不同

### Q4 _getHyenaPackBonus 測試 case

函式位置：`systems/creatures.js:876`

目前沒有 export。

實際內容：

```js
function _getHyenaPackBonus(hyena) {
    const count = (hyena.packMates || []).filter(m => m.hp > 0).length;
    return {
        atkMult:   1.0 + count * 0.2,
        speedMult: 1.0 + count * 0.05,
    };
}
```

純函式性質確認：是純函式。只讀取 `hyena.packMates` 與 pack mate 的 `hp`，不讀外部狀態，不修改輸入。

測試 case：
- 無隊友或 `packMates` 缺省：`hyena = {}` → `{ atkMult: 1.0, speedMult: 1.0 }`
- 只計算存活隊友：`hyena = { packMates: [{ hp: 10 }, { hp: 0 }, { hp: -5 }, { hp: 3 }] }` → 存活數 `2` → `{ atkMult: 1.4, speedMult: 1.1 }`

### Q5 export 建議

目前 export 狀況：
- `_effSpeed(c)`：已 export，位置 `systems/creatures.js:85`
- `_shouldFleeFromGiant(creature, target)`：未 export，位置 `systems/creatures.js:676`
- `_hyenaWheelPosition(hyena, pack, target)`：未 export，位置 `systems/creatures.js:947`
- `_getHyenaPackBonus(hyena)`：未 export，位置 `systems/creatures.js:876`

建議 export 方式：
- 直接在原函式前加 `export`，維持同檔案 helper 測試模式。
- 不建議另建 test helper 檔，因為這三個函式已經是小型純函式或接近純函式；另建 helper 會增加 Stage D 的檔案拆分範圍。
- `_hyenaWheelPosition` 建議同時加入 `now = Date.now()` 參數，讓測試可固定時間。
- `_shouldFleeFromGiant` 與 `_getHyenaPackBonus` 不需要依賴注入，只需要 export。

## systems/audio.js
### Q1 _mobileFadeScale 簽名與測試 case

位置：`systems/audio.js:279`

它是 `AudioManager` 物件上的 method，不是模組層私有函式。

目前簽名：

```js
_mobileFadeScale()
```

完整邏輯：

```js
_mobileFadeScale() {
    if (!gameState.isMobile || !this._mobileMasterFadeEndMs) return 1;
    const now = Date.now();
    if (now >= this._mobileMasterFadeEndMs) return 1;
    if (now <= this._mobileMasterFadeStartMs) return 0;
    return Math.max(0, Math.min(1, (now - this._mobileMasterFadeStartMs) / 300));
}
```

內部依賴：
- `gameState.isMobile`
- `Date.now()`
- `this._mobileMasterFadeStartMs`
- `this._mobileMasterFadeEndMs`
- `Math.max`
- `Math.min`

回傳值範圍：`0` 到 `1`。

建議改成：

```js
_mobileFadeScale(now = Date.now(), isMobile = gameState.isMobile)
```

測試 case：
- fade 前：`isMobile = true`，`_mobileMasterFadeStartMs = 1000`，`_mobileMasterFadeEndMs = 1300`，`now = 1000` → `0`
- fade 中途：同上，`now = 1150` → `0.5`
- fade 結束後：同上，`now = 1300` 或 `1400` → `1`

補充 case：`isMobile = false` 或 `_mobileMasterFadeEndMs` 未設定時，直接回傳 `1`。

### Q2 _playSfxBuffer 選擇邏輯與測試 case

位置：`systems/audio.js:218`

它是 `AudioManager` 物件上的 method，不是模組層私有函式。

目前簽名：

```js
_playSfxBuffer(key)
```

前置條件：
- `this.getContext()` 必須回傳 AudioContext-like 物件
- `this.getSfxGain()` 必須回傳 gain node
- `this._unlocked` 必須是 truthy
- `this._sfxBuffers[key]` 必須存在

buffer 選擇邏輯：

```js
const buffer = Array.isArray(bufferOrArr)
    ? bufferOrArr[Math.floor(Math.random() * bufferOrArr.length)]
    : bufferOrArr;
```

選到 buffer 後：
- `ctx.createBufferSource()`
- `source.buffer = buffer`
- `source.connect(gainNode)`
- `source.start(0)`
- 成功回傳 `true`
- 缺 context / gain / unlocked / buffer，或播放過程 throw，回傳 `false`

建議改成：

```js
_playSfxBuffer(key, random = Math.random)
```

測試 case：
- 固定 random 選第一個：`_sfxBuffers.test = ['a', 'b', 'c']`，`random = () => 0` → index `0` → `source.buffer === 'a'`，回傳 `true`
- 固定 random 選最後一個：`_sfxBuffers.test = ['a', 'b', 'c']`，`random = () => 0.999` → `Math.floor(0.999 * 3) = 2` → `source.buffer === 'c'`，回傳 `true`

測試 mock 需要提供：
- `AudioManager._unlocked = true`
- `AudioManager.getContext = () => ({ createBufferSource: () => sourceMock })`
- `AudioManager.getSfxGain = () => gainMock`
- `sourceMock = { buffer: null, connect: fn, start: fn }`

### Q3 getSettings dead import

`systems/audio.js:7`

```js
import { getSettings, saveSettingsToStorage } from '../storage/index.js';
```

全專案排除 `dist/` 搜尋後，`systems/audio.js` 內只有 import 這一處出現 `getSettings`，沒有任何實際呼叫。`saveSettingsToStorage` 則在 `systems/audio.js:384` 使用。

確認：`getSettings` 是 dead import。

可安全移除的行號：
- 修改 `systems/audio.js:7`
- 從 `import { getSettings, saveSettingsToStorage } from '../storage/index.js';`
- 改為 `import { saveSettingsToStorage } from '../storage/index.js';`

### Q4 private method 存取方式

`_mobileFadeScale` 與 `_playSfxBuffer` 都是 `AudioManager` export 物件上的 method：

```js
export const AudioManager = {
    ...
    _playSfxBuffer(key) { ... },
    ...
    _mobileFadeScale() { ... },
    ...
}
```

因此測試可直接：

```js
import { AudioManager } from '../../systems/audio.js';

AudioManager._mobileFadeScale(...);
AudioManager._playSfxBuffer(...);
```

不需要額外 export 這兩個 method。只需要改 method 簽名以注入 `now` / `isMobile` / `random`，測試前後要還原被 mock 的 `AudioManager` state 與 method，避免污染其他測試。

### Q5 iOS 敏感區域

`AudioManager.unlock()` 位置：`systems/audio.js:110`

敏感依賴與流程：
- 建立 `window.AudioContext || window.webkitAudioContext`：`systems/audio.js:113-115`
- 建立 `_masterGain` / `_musicGain` / `_sfxGain` 並接到 destination：`systems/audio.js:116-127`
- 重新連接目前音樂與 intro theme：`systems/audio.js:128-129`
- 呼叫 `this._audioCtx.resume()`：`systems/audio.js:131`
- unlock 成功後設定 `this._unlocked = true`：`systems/audio.js:132`
- 若尚未 preload，呼叫 `preloadAllSfxBuffers()`：`systems/audio.js:133-135`
- 手機版 master fade：`systems/audio.js:136-153`
- unlock 失敗時不能讓流程炸掉：`systems/audio.js:154-160`

`playMusic()` 位置：`systems/audio.js:332`

敏感依賴與流程：
- 同 key 重播時只刷新音量並 return：`systems/audio.js:333-336`
- 從 `this._sounds[key]` 取音樂來源：`systems/audio.js:337-339`
- 舊音樂 fade out：`systems/audio.js:341-350`
- 設定 `_currentMusicKey`、`_music`、loop、currentTime、volume：`systems/audio.js:352-356`
- 呼叫 `_connectMusicElement(newAudio)`：`systems/audio.js:357`
- 音樂音量為 0 時不呼叫 `play()`：`systems/audio.js:359`
- fade-in 每 tick 重讀 `_musicVol()`：`systems/audio.js:363-379`
- 開始播放後保存設定：`systems/audio.js:381-390`

`refreshMusicVolume()` 位置：`systems/audio.js:404`

敏感依賴與流程：
- 依 `_musicVol()` 更新目前音樂 volume：`systems/audio.js:405-410`
- volume 變 0 時 pause；volume 恢復且有 `_currentMusicKey` 時 play：`systems/audio.js:410-414`
- intro theme 也同步套用 `0.4 * vol`，並依音量 pause/play：`systems/audio.js:418-425`
- 最後呼叫 `_applyGainVolumes()`：`systems/audio.js:430`

CC 必須完全不動或只做最小必要修改的區域：
- `unlock()` 的 AudioContext 建立、`resume()`、gain node 建立與手機版 fade 流程
- `unlock()` 裡成功後 preload buffer 的流程
- `playMusic()` 的「音量 0 不呼叫 play」與 fade-in 重新讀 `_musicVol()` 行為
- `refreshMusicVolume()` 對目前音樂與 intro theme 的 pause/play 行為
- `_connectMusicElement()` 相關連接流程，尤其是 unlock 前後重接 audio element 的設計

這些區域曾在 iOS 音效修復中被特別處理。Stage D 若只是補 `_mobileFadeScale()` 與 `_playSfxBuffer()` 測試，不應重排 `unlock()`、`playMusic()`、`refreshMusicVolume()` 的控制流程。

## CC 實作建議摘要

建議改動：
- `systems/creatures.js`
  - `_effSpeed(c)` 改成 `_effSpeed(c, now = Date.now())`
  - `_shouldFleeFromGiant` 直接加 `export`
  - `_getHyenaPackBonus` 直接加 `export`
  - `_hyenaWheelPosition` 直接加 `export`，並改成 `_hyenaWheelPosition(hyena, pack, target, now = Date.now())`
- `systems/audio.js`
  - `_mobileFadeScale()` 改成 `_mobileFadeScale(now = Date.now(), isMobile = gameState.isMobile)`
  - `_playSfxBuffer(key)` 改成 `_playSfxBuffer(key, random = Math.random)`
  - 移除 `getSettings` dead import，只保留 `saveSettingsToStorage`

建議測試：
- `_effSpeed`：未減速、減速中、減速過期
- `_shouldFleeFromGiant`：殺手不逃、Alpha 必逃、普通巨人 HP 邊界 `>` / `=`
- `_hyenaWheelPosition`：固定 `now` 與 pack index，驗證不同鬣狗 orbit 位置不同
- `_getHyenaPackBonus`：無隊友、只計算 hp > 0 的隊友
- `AudioManager._mobileFadeScale`：fade 前、中途、結束後
- `AudioManager._playSfxBuffer`：固定 random 選第一個 / 最後一個 buffer

碰不得：
- 不要重排 `AudioManager.unlock()` 的 AudioContext / gain / resume / preload / mobile fade 流程
- 不要改 `playMusic()` 的 fade-in、音量 0 不播放、設定保存流程
- 不要改 `refreshMusicVolume()` 對目前音樂與 intro theme 的 pause/play 行為
- 不要以 `dist/` 作為審計或測試依據

