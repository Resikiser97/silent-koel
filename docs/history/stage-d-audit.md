# Stage D 靜態審計報告
更新日期：2026-06-14

## systems/spawning.js
### A. 外部依賴
- import：`gameState` from `./gameState.js`；`MAP_WIDTH`、`MAP_HEIGHT`、`getBiome` from `./map.js`；`BIOME_CREATURES` from `../config/creatures.js`
- `gameState` 欄位：`fruits`、`trees`、`neutralCreatures`、`hostileCreatures`、`treasures`、`currentPhaseIndex`、`currentMap`、`spawnProtectUntil`、`timeRemaining`、`creatureStrengthMultiplier`、`spawnTimers`
- Web / global API：`Math.random`、`Math.floor`、`Math.round`、`Math.pow`、`Math.min`、`Math.max`、`Math.sqrt`、`Math.cos`、`Math.sin`、`Date.now`、`console.log`
- 其他模組函式：`getBiome()`

### B. 依賴注入候選
函式名：`moveCreature(entity, newX, newY)`

目前依賴：`MAP_WIDTH` / `MAP_HEIGHT`

建議注入方式：把 map 尺寸改為可選參數，例如 `moveCreature(entity, newX, newY, bounds = { width: MAP_WIDTH, height: MAP_HEIGHT })`；呼叫點不傳時維持現行行為，測試可傳固定尺寸。

影響呼叫點：`systems/creatures.js` 多處 AI 移動；`systems/elite.js`；`systems/boss.js`

風險評估：低

函式名：`_randomPointInBiome(biome)`

目前依賴：`Math.random`、`MAP_WIDTH`、`MAP_HEIGHT`、`getBiome()`

建議注入方式：改為 `_randomPointInBiome(biome, deps = { random: Math.random, getBiome, width: MAP_WIDTH, height: MAP_HEIGHT })`。先保持 private，供 `_make...` 與生成函式使用。

影響呼叫點：`spawnBiomeCreatures()`、`spawnCreatureAtEdgeBiome()`

風險評估：低

函式名：`_makeHerbCreature(x, y, biome, spec, strength)`

目前依賴：`Math.random`、`Date.now`

建議注入方式：改為 `_makeHerbCreature(..., deps = { random: Math.random, now: Date.now })`，把 `canFight`、`_moveAngle`、`_nextBehaviorTime` 的來源固定化。

影響呼叫點：`spawnBiomeCreatures()`、`spawnCreatureAtEdgeBiome()`

風險評估：低

函式名：`_makeCarnCreature(x, y, biome, spec, strength, mapConfig)`

目前依賴：`Math.random`、`Date.now`、`gameState.currentPhaseIndex`

建議注入方式：改為 `_makeCarnCreature(..., deps = { random: Math.random, now: Date.now, phaseIndex: gameState.currentPhaseIndex })`，避免生成測試必須整包 mock `gameState`。

影響呼叫點：`spawnBiomeCreatures()`、`spawnCreatureAtEdgeBiome()`

風險評估：中；肉食怪數值公式曾在 v0.1.16.x 修過，測試要鎖住 `scaledBaseHp` / `scaledBaseDamage` / `scaledBaseSpeed`。

函式名：`spawnFruitFromTree(tree)`

目前依賴：`Math.random`、`gameState.fruits`、`MAP_WIDTH`、`MAP_HEIGHT`、`getBiome()`

建議注入方式：改為 `spawnFruitFromTree(tree, deps = { random, fruits: gameState.fruits, getBiome, width, height })`。呼叫點仍可不傳 deps；測試傳固定 fruits 陣列。

影響呼叫點：`main.js` 初始果子生成；`systems/player.js` 樹木產果；`spawnFruit()`

風險評估：中；此函式會直接 push 到 `gameState.fruits`，改動時需保留回傳 fruit/null 行為。

函式名：`spawnTreasure()`

目前依賴：`Math.random`、`gameState.treasures`、`MAP_WIDTH`、`MAP_HEIGHT`

建議注入方式：改為 `spawnTreasure(deps = { random, treasures: gameState.treasures, width, height })`。

影響呼叫點：目前只在本檔 export，未看到主要呼叫點。

風險評估：低

### C. 不適合注入
- `spawnBiomeCreatures()`：會重置 `gameState.neutralCreatures` / `hostileCreatures`，讀 `currentMap`，設定出生保護，還包含初始化數量與 console log；Stage D 可讓它呼叫已注入的小函式，但不建議整個函式改成純函式。
- `updateCreatureSpawning()`：直接操作 `spawnTimers`、`creatureStrengthMultiplier`，並依場上數量決定補怪。這是中層 orchestration，建議 Stage F/G 再拆「計算是否補怪」與「實際 push」。

### D. 測試建議
1. `moveCreature()`：給定負座標與超過地圖尺寸座標時，應正確 wrap 到 `[0, width/height)`。
2. `_makeCarnCreature()`：固定 `phaseIndex`、`random`、`strength` 後，驗證 `scaledBaseHp`、`scaledBaseDamage`、`scaledBaseSpeed` 與 cap 行為。
3. `spawnFruitFromTree()`：固定 random 與既有 fruits，驗證太靠近既有果子時 retry，成功時 push 並依 biome 給正確 color。

## systems/creatures.js
### A. 外部依賴
- import：`gameState`、`ctx` from `./gameState.js`；`MAP_WIDTH`、`MAP_HEIGHT`、`VIEW_W`、`VIEW_H`、`getBiome` from `./map.js`；`worldToScreen`、`wrappedDistance`、`wrappedDelta` from `./camera.js`；`FIXED_DELTA` from `../config/gameConfig.js`；`moveCreature` from `./spawning.js`；`applyDamageToPlayer`、`handleKill`、`showFloatingText` from `./combat.js`；`applyTenacity`、`getGameFont` from `./utils.js`；`showAlphaAnnouncement` from `./ui.js`；`t` from `../lang.js`
- `gameState` 欄位：`neutralCreatures`、`hostileCreatures`、`fruits`、`corpses`、`player`、`currentMap`、`alphaCreature`、`topBarTarget`、`topBarFadeTimer`、`cameraZoom`、`settings`、`devShowHP`、`devShowAI`、`_pendingAlphaInherit`
- Web / global API：`Math.random`、`Math.floor`、`Math.round`、`Math.min`、`Math.max`、`Math.sqrt`、`Math.cos`、`Math.sin`、`Math.atan2`、`Date.now`
- Canvas API：`ctx.save()`、`ctx.restore()`、`ctx.setTransform()`、`ctx.font`、`ctx.fillStyle`、`ctx.strokeStyle`、`ctx.beginPath()`、`ctx.arc()`、`ctx.ellipse()`、`ctx.fillRect()`、`ctx.fillText()`、`ctx.strokeText()`、`ctx.measureText()` 等
- 其他模組函式：`getBiome()`、`worldToScreen()`、`wrappedDistance()`、`wrappedDelta()`、`moveCreature()`、`applyDamageToPlayer()`、`handleKill()`、`showFloatingText()`、`applyTenacity()`、`getGameFont()`、`showAlphaAnnouncement()`、`t()`

### B. 依賴注入候選
函式名：`_effSpeed(c)`

目前依賴：`Date.now`

建議注入方式：改為 `_effSpeed(c, now = Date.now())`。現有呼叫點可不改，測試與外部模組可傳固定時間。

影響呼叫點：`systems/creatures.js` 多處；`systems/elite.js`；`systems/boss.js`

風險評估：低

函式名：`_getCreatureDisplayName(creature)`

目前依賴：無明顯外部依賴

建議注入方式：此函式已接近純函式；建議先補測試，不一定需要注入。

影響呼叫點：`systems/creatures.js`；`systems/hud.js`

風險評估：低

函式名：`_shouldFleeFromGiant(creature, target)`

目前依賴：無明顯外部依賴

建議注入方式：可直接 export 或移到純 helper 檔；不需要注入。

影響呼叫點：`updateHostileCreatures()`

風險評估：低

函式名：`_getHyenaPackBonus(hyena)`

目前依賴：只讀 `hyena.packMates`

建議注入方式：不需要注入，可先補純函式測試。

影響呼叫點：`_applyHyenaBiomeBonus()`

風險評估：低

函式名：`_findNearestBiomePoint(biome, x, y)`

目前依賴：`Math.random`、`MAP_WIDTH`、`MAP_HEIGHT`、`getBiome()`、`wrappedDistance()`

建議注入方式：改為 `_findNearestBiomePoint(biome, x, y, deps = { random, getBiome, wrappedDistance, width, height })`。

影響呼叫點：`updateHostileCreatures()`

風險評估：中；會影響離開生態區後的回歸目標，需要固定 random 測試。

函式名：`_assignHyenaPackName()`

目前依賴：`Math.random`、模組層 `_HYENA_PACK_NAMES`、`_usedHyenaPackNames`、`_hyenaPackNameMap`

建議注入方式：把 random 先注入即可；名稱池狀態仍維持模組層，或另行傳入 `{ usedNames, nameMap }` 但那會提高改動範圍。

影響呼叫點：`_updateHyenaPack()`

風險評估：中

函式名：`_hyenaWheelPosition(hyena, pack, target)`

目前依賴：`Date.now`

建議注入方式：改為 `_hyenaWheelPosition(hyena, pack, target, now = Date.now())`。

影響呼叫點：`updateHostileCreatures()`

風險評估：低

函式名：`_applyLynxBiomeBonus(lynx)` / `_applyCrocBiomeBonus(croc)` / `_applyHyenaBiomeBonus(hyena)`

目前依賴：`Date.now`、`_isInHomeBiome()`、`t()`（猞猁暴擊文字）

建議注入方式：先注入 `now`，例如 `_applyLynxBiomeBonus(lynx, now = Date.now())`；`t()` 可留到 Stage F/G，避免語言系統一起動。

影響呼叫點：`updateHostileCreatures()` 多處

風險評估：中

### C. 不適合注入
- `updateNeutralCreatures()`：同時處理玩家碰撞、草食 AI、巨人化、Alpha 繼承、隊伍、果子、回血、死亡清理，依賴 `gameState` 太深。Stage D 不建議整體注入；最多先抽上面的小 helper。
- `updateHostileCreatures()`：混合屍體清理、吃屍體、追擊目標、殺手戰術、鬣狗輪替、物種加成、攻擊玩家/中立生物。應留到 Stage F/G 分段重構。
- `drawNeutralCreatures()`、`drawHostileCreatures()`、`drawCorpses()`、`drawCreatureShape()` 與各 `_draw...()`：Canvas 繪圖高度依賴 `ctx`、`gameState.cameraZoom`、`worldToScreen`，本次目標是中層系統邏輯，不建議在 Stage D 處理。
- `_carnivoreEatCorpse()`、`_triggerAlpha()`、`_checkGuardianRange()`、`_updateGiantFlee()`：雖可測，但會改動 `gameState` 或跨系統呼叫 `showAlphaAnnouncement()` / `handleKill()`，建議等 AI 行為拆分時一起整理。

### D. 測試建議
1. `_effSpeed()`：固定 `now`，驗證 slow 未過期時乘上 `_slowMult`，過期時回原速度。
2. `_shouldFleeFromGiant()`：殺手永不逃、非殺手遇 Alpha 必逃、普通巨人 HP 大於肉食者 3 倍才逃。
3. `_hyenaWheelPosition()`：固定 `now` 與 pack index，驗證不同鬣狗取得不同 orbit 位置，且距離 target 至少大於攻擊範圍。

## systems/audio.js
### A. 外部依賴
- import：`AUDIO_FILES` from `../config/gameConfig.js`；`gameState` from `./gameState.js`；`getSettings`、`saveSettingsToStorage` from `../storage/index.js`
- `gameState` 欄位：`isMobile`、`settings`、`settings.volume`
- Web / global API：`Audio`、`window.AudioContext`、`window.webkitAudioContext`、`fetch()`、`Date.now`、`Math.random`、`Math.max`、`Math.min`、`setInterval()`、`clearInterval()`、`Promise.all()`、`console.warn`
- Web Audio API：`AudioContext.resume()`、`createGain()`、`createMediaElementSource()`、`createBufferSource()`、`decodeAudioData()`、`AudioBufferSourceNode.start()`、GainNode `gain.value` / `linearRampToValueAtTime()`
- HTMLAudio API：`play()`、`pause()`、`loop`、`currentTime`、`volume`、`preload`、`paused`、`ended`
- 其他模組函式：`saveSettingsToStorage()`；`getSettings` 目前 import 但本檔未使用

### B. 依賴注入候選
函式名：`playIntroTheme()`

目前依賴：`new Audio()`、`AUDIO_FILES.introTheme`、`AudioManager`、模組層 `_introThemeAudio`

建議注入方式：先抽成 `_createIntroThemeAudio(src, audioFactory = src => new Audio(src))` 或讓 `playIntroTheme(deps = { AudioCtor: Audio })`；保留外層 `_introThemeAudio` 狀態。

影響呼叫點：`systems/ui.js`；`main.js` 透過 `stopIntroTheme()` 停止首頁音樂

風險評估：中；瀏覽器 autoplay / unlock 行為敏感，改動後需手測首頁音樂。

函式名：`AudioManager.unlock()`

目前依賴：`window.AudioContext` / `webkitAudioContext`、`Date.now`、`gameState.isMobile`、`_introThemeAudio`

建議注入方式：不建議整個函式注入；可先把「建立 AudioContext」抽成 `_createAudioContext(win = window)`，讓測試 mock context。

影響呼叫點：`AudioManager.init()`；`systems/mobile.js`；`systems/ui.js`；`systems/evolution.js`

風險評估：高；iOS 音效曾修過，不能大幅重排流程。

函式名：`AudioManager._loadSfxBuffer(key)`

目前依賴：`AUDIO_FILES`、`fetch()`、`this._audioCtx.decodeAudioData()`

建議注入方式：把 `fetch` 與 `AUDIO_FILES` 改為 manager 內可覆寫 deps，例如 `_fetch = fetch`、`_audioFiles = AUDIO_FILES`；或參數注入 `_loadSfxBuffer(key, deps = { fetch, audioFiles: AUDIO_FILES })`。

影響呼叫點：`AudioManager.init()`、`preloadAllSfxBuffers()`、`play()`

風險評估：中

函式名：`AudioManager._playSfxBuffer(key)`

目前依賴：`Math.random`、`AudioContext.createBufferSource()`、`this._sfxBuffers`

建議注入方式：注入 `random`，讓多音效變體選擇可測；Web Audio context 可透過 manager state mock。

影響呼叫點：`AudioManager.play()`

風險評估：低

函式名：`AudioManager._mobileFadeScale()`

目前依賴：`gameState.isMobile`、`Date.now`、manager fade timestamps

建議注入方式：改為 `_mobileFadeScale(now = Date.now(), isMobile = gameState.isMobile)`。

影響呼叫點：`AudioManager._sfxVol()`

風險評估：低

函式名：`AudioManager._getPooledAudio(key)`

目前依賴：`AUDIO_FILES`、`new Audio()`、`this._sfxPools`

建議注入方式：注入 `AudioCtor` 與 `audioFiles`，例如 manager 層 `_deps`。

影響呼叫點：`AudioManager.play()`

風險評估：中

### C. 不適合注入
- `AudioManager.playMusic()`：混合 cross-fade、HTMLAudio 狀態、設定保存、`setInterval()`；Stage D 不建議深改。
- `AudioManager.refreshMusicVolume()`：會 pause/play 目前音樂與 intro theme，與瀏覽器播放策略相關，建議保守。
- `initAudio()` / `preloadAllSfxBuffers()` wrapper：本身只是門面，不需要為了注入而改。

### D. 測試建議
1. `_mobileFadeScale()`：固定 mobile 與時間，驗證 fade 前為 0、中途為比例、結束後為 1。
2. `_playSfxBuffer()`：給定兩個 buffer 與固定 random，驗證會選到預期 buffer 並呼叫 `createBufferSource().start(0)`。
3. `_loadSfxBuffer()`：mock `fetch` 與 `decodeAudioData`，驗證陣列音效會過濾失敗項，全部失敗時回傳 null。

## systems/input.js
### A. 外部依賴
- import：`gameState` from `./gameState.js`；`MAP_WIDTH`、`MAP_HEIGHT` from `./map.js`；`AudioManager` from `./audio.js`；`playerAttack` from `./combat.js`；`playerDash`、`_getArcherShootDir` from `./player.js`；`saveSettings`、`toggleDevMode`、`showSettings`、`hideSettings` from `./ui.js`；`_chatExpanded`、`_collapseChat` from `./chat.js`
- `gameState` 欄位：`settingsOpen`、`gameOver`、`_rebindTarget`、`settings.keys`、`settings.autoAttack`、`keys`、`organSelectionActive`、`player`、`skillTreeOpen`、`victory`、`mutationPanelOpen`、`tutorialOpen`、`devInput`、`projectiles`、`camera`、`mouseWorld`、`mouseScreen`
- Web / global API：`document.activeElement`、`document.getElementById()`、DOM event `preventDefault()`、`Date.now`、`Math.max`、`Math.round`
- DOM / Canvas API：`canvas.getBoundingClientRect()`、`canvas.width`、`canvas.height`
- 其他模組函式：`AudioManager.play()`、`playerAttack()`、`playerDash()`、`_getArcherShootDir()`、`saveSettings()`、`toggleDevMode()`、`showSettings()`、`hideSettings()`、`_collapseChat()`

### B. 依賴注入候選
函式名：`_updateMouseWorld(clientX, clientY)`

目前依賴：`document.getElementById('gameCanvas')`、canvas rect/size、`gameState.camera`、`MAP_WIDTH`、`MAP_HEIGHT`、`gameState.mouseWorld`、`gameState.mouseScreen`

建議注入方式：改為 `_updateMouseWorld(clientX, clientY, deps = { canvasEl: document.getElementById('gameCanvas'), state: gameState, width: MAP_WIDTH, height: MAP_HEIGHT })`。計算結果可先抽成純函式 `_calcMouseWorld(clientX, clientY, rect, canvasSize, camera, bounds)`。

影響呼叫點：`main.js` canvas `mousemove` listener

風險評估：低

函式名：`handleKeyDown(e)`

目前依賴：`document.activeElement`、`gameState` 多個 UI 狀態、`playerAttack()`、`playerDash()`、`saveSettings()`、`toggleDevMode()`、`showSettings()`、`hideSettings()`、chat 狀態

建議注入方式：不建議整個函式一次注入；可先抽純判斷 helper，例如 `_isBlockingAction(state)`、`_isMoveKey(key, settingsKeys)`，或讓 `document` 作為可選 deps。

影響呼叫點：`main.js` `document.addEventListener('keydown', handleKeyDown)`

風險評估：中

函式名：`handleKeyUp(e)`

目前依賴：`gameState`、`_getArcherShootDir()`、`AudioManager.play()`、`Date.now`

建議注入方式：只建議先注入 `now` 與 `audio`，例如內部發射 projectile 的區塊抽成 `_releaseArcherCharge(state, getDir, audio, now)`。

影響呼叫點：`main.js` `document.addEventListener('keyup', handleKeyUp)`

風險評估：中；阿奇爾手動蓄力與滑鼠發射也在 `main.js` canvas mouseup 有相似邏輯，改動時需避免兩邊行為分岔。

### C. 不適合注入
- `handleKeyDown()` 整體：它是輸入 orchestration，直接觸發 UI、戰鬥、dash、dev mode、設定保存，Stage D 只適合抽小 helper。
- `handleKeyUp()` 整體：目前混合移動 key release 與阿奇爾發射；建議 Stage D 只抽 projectile 計算，完整輸入重構留到 Stage F/G。
- `_settingsKeyHandler`、`_settingsMouseHandler`、`_rebindBlink`、`_rebindTimeout`：本檔 export 但實際設定 handler 狀態在 `systems/ui.js` 也有同名模組變數；這是架構不一致，不建議在本次順手修。

### D. 測試建議
1. `_calcMouseWorld()`：固定 canvas rect、canvas size、camera、map bounds，驗證 client 座標轉 world 座標與 wrap。
2. `handleKeyDown()` 抽出的 `_isMoveKey()`：驗證自訂 WASD 與 arrow keys 都會被視為移動鍵。
3. `handleKeyUp()` 抽出的 `_releaseArcherCharge()`：固定 dir 與 chargeConsumed，驗證 projectile damage、velocity、range、`reloadCharges`、音效 key。

## 總結
優先實作順序建議：1. `spawning.js` 的 `moveCreature()` / `_randomPointInBiome()` / `_makeHerbCreature()`  2. `input.js` 的 `_calcMouseWorld()`  3. `creatures.js` 的 `_effSpeed()` / `_shouldFleeFromGiant()` / `_hyenaWheelPosition()`  4. `audio.js` 的 `_mobileFadeScale()` / `_playSfxBuffer()`  5. `spawning.js` 的 `_makeCarnCreature()` / `spawnFruitFromTree()`

預估測試數量：12 個

非預期架構問題：
- `systems/input.js` export `_settingsKeyHandler` / `_settingsMouseHandler`，但 `systems/ui.js` 也有同名模組層變數並自行管理 listener；目前看起來 input 端 export 可能是殘留或未使用狀態，建議 Stage F/G 檢查。
- `systems/audio.js` import `getSettings` 但本檔未使用，可能是 dead import。
- `dist/index.js` 仍在工作樹內且內容顯示版本 `v0.1.16.3`，與文件最新 `v0.1.17.1` 不一致；如果 `dist/` 是 build artifact，建議不要以它作為審計依據。
- 已知循環依賴主要仍是 `player.js` / `combat.js` / `organs.js` / `main.js` 叢集；本次四個目標中沒有新增明顯循環依賴，但 `creatures.js` 透過 `combat.js`、`ui.js` 進行跨層呼叫，重構時需避免把 AI helper 再往 UI/Combat 方向耦合。
