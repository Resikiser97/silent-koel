# Stage F 循環依賴審計報告
基準版本：v0.1.18.3
更新日期：2026-06-14

## 一、完整 import 關係表

> 掃描範圍：`main.js`、`lang.js`、`config/`、`lang/`、`map/`、`storage/`、`stats/`、`systems/`。
> 排除：`dist/`、`node_modules/`、`tests/`。
> 只列本地 `.js` import，不列 npm 套件。

- `config/characters.js` -> 無
- `config/compendium_data.js` -> 無
- `config/creatures.js` -> 無
- `config/evolution.js` -> 無
- `config/gameConfig.js` -> 無
- `config/organs.js` -> 無
- `config/patchnotes.js` -> 無
- `config/supabase.js` -> `stats/index.js`
- `lang.js` -> `config/creatures.js`, `config/evolution.js`, `config/organs.js`
- `lang/en.js` -> `lang.js`
- `lang/zh-TW.js` -> `lang.js`
- `main.js` -> `config/characters.js`, `config/gameConfig.js`, `config/organs.js`, `lang/en.js`, `lang/zh-TW.js`, `map/easymap.js`, `map/hardmap.js`, `map/normalmap.js`, `stats/index.js`, `storage/index.js`, `systems/audio.js`, `systems/boss.js`, `systems/camera.js`, `systems/chat.js`, `systems/combat.js`, `systems/creatures.js`, `systems/daynight.js`, `systems/elite.js`, `systems/evolution.js`, `systems/gameState.js`, `systems/hud.js`, `systems/input.js`, `systems/map.js`, `systems/mobile.js`, `systems/mutation.js`, `systems/organs.js`, `systems/player.js`, `systems/spawning.js`, `systems/tutorial.js`, `systems/ui.js`
- `map/easymap.js` -> 無
- `map/hardmap.js` -> 無
- `map/normalmap.js` -> 無
- `stats/index.js` -> `systems/gameState.js`
- `storage/index.js` -> 無
- `systems/audio.js` -> `config/gameConfig.js`, `storage/index.js`, `systems/gameState.js`
- `systems/boss.js` -> `config/creatures.js`, `config/gameConfig.js`, `lang.js`, `main.js`, `storage/index.js`, `systems/audio.js`, `systems/camera.js`, `systems/chat.js`, `systems/combat.js`, `systems/creatures.js`, `systems/evolution.js`, `systems/gameState.js`, `systems/leaderboard.js`, `systems/map.js`, `systems/player.js`, `systems/spawning.js`, `systems/ui.js`, `systems/utils.js`
- `systems/camera.js` -> `systems/gameState.js`, `systems/map.js`
- `systems/chat.js` -> `config/gameConfig.js`, `config/supabase.js`, `storage/index.js`, `systems/gameState.js`, `systems/mobile.js`
- `systems/combat.js` -> `config/evolution.js`, `config/gameConfig.js`, `config/organs.js`, `lang.js`, `stats/index.js`, `systems/audio.js`, `systems/boss.js`, `systems/camera.js`, `systems/evolution.js`, `systems/gameState.js`, `systems/map.js`, `systems/mutation.js`, `systems/organs.js`, `systems/player.js`, `systems/tutorial.js`, `systems/utils.js`
- `systems/creatures.js` -> `config/gameConfig.js`, `lang.js`, `systems/camera.js`, `systems/combat.js`, `systems/gameState.js`, `systems/map.js`, `systems/spawning.js`, `systems/ui.js`, `systems/utils.js`
- `systems/daynight.js` -> `lang.js`, `systems/audio.js`, `systems/boss.js`, `systems/elite.js`, `systems/gameState.js`
- `systems/elite.js` -> `config/creatures.js`, `config/gameConfig.js`, `lang.js`, `storage/index.js`, `systems/audio.js`, `systems/camera.js`, `systems/combat.js`, `systems/creatures.js`, `systems/gameState.js`, `systems/map.js`, `systems/spawning.js`, `systems/utils.js`
- `systems/evolution.js` -> `config/evolution.js`, `config/gameConfig.js`, `config/organs.js`, `lang.js`, `main.js`, `storage/index.js`, `systems/audio.js`, `systems/chat.js`, `systems/combat.js`, `systems/gameState.js`, `systems/leaderboard.js`, `systems/mobile.js`, `systems/mutation.js`, `systems/organs.js`, `systems/player.js`, `systems/ui.js`
- `systems/gameState.js` -> 無
- `systems/hud.js` -> `config/creatures.js`, `config/gameConfig.js`, `lang.js`, `systems/boss.js`, `systems/camera.js`, `systems/combat.js`, `systems/creatures.js`, `systems/elite.js`, `systems/gameState.js`, `systems/map.js`, `systems/mobile.js`, `systems/mutation.js`, `systems/organs.js`, `systems/player.js`, `systems/ui.js`, `systems/utils.js`
- `systems/input.js` -> `systems/audio.js`, `systems/chat.js`, `systems/combat.js`, `systems/gameState.js`, `systems/map.js`, `systems/player.js`, `systems/ui.js`
- `systems/leaderboard.js` -> `config/gameConfig.js`, `config/supabase.js`, `lang.js`, `stats/index.js`, `storage/index.js`, `systems/chat.js`, `systems/gameState.js`, `systems/mobile.js`, `systems/utils.js`
- `systems/map.js` -> `systems/gameState.js`
- `systems/mobile.js` -> `lang.js`, `systems/audio.js`, `systems/combat.js`, `systems/gameState.js`, `systems/map.js`, `systems/organs.js`, `systems/player.js`, `systems/ui.js`
- `systems/mutation.js` -> `lang.js`, `storage/index.js`, `systems/combat.js`, `systems/gameState.js`
- `systems/organs.js` -> `config/evolution.js`, `config/organs.js`, `lang.js`, `main.js`, `storage/index.js`, `systems/combat.js`, `systems/daynight.js`, `systems/elite.js`, `systems/evolution.js`, `systems/gameState.js`, `systems/map.js`, `systems/mutation.js`, `systems/player.js`, `systems/tutorial.js`, `systems/ui.js`, `systems/utils.js`
- `systems/player.js` -> `config/evolution.js`, `config/gameConfig.js`, `config/organs.js`, `lang.js`, `stats/index.js`, `systems/audio.js`, `systems/boss.js`, `systems/camera.js`, `systems/combat.js`, `systems/gameState.js`, `systems/map.js`, `systems/mobile.js`, `systems/organs.js`, `systems/spawning.js`, `systems/tutorial.js`, `systems/utils.js`
- `systems/spawning.js` -> `config/creatures.js`, `systems/gameState.js`, `systems/map.js`
- `systems/tutorial.js` -> `main.js`, `storage/index.js`, `systems/camera.js`, `systems/gameState.js`, `systems/map.js`
- `systems/ui.js` -> `config/characters.js`, `config/compendium_data.js`, `config/evolution.js`, `config/gameConfig.js`, `config/organs.js`, `config/patchnotes.js`, `config/supabase.js`, `lang.js`, `main.js`, `map/easymap.js`, `map/hardmap.js`, `map/normalmap.js`, `storage/index.js`, `systems/audio.js`, `systems/camera.js`, `systems/chat.js`, `systems/daynight.js`, `systems/evolution.js`, `systems/gameState.js`, `systems/leaderboard.js`, `systems/map.js`, `systems/mobile.js`, `systems/player.js`, `systems/spawning.js`, `systems/utils.js`
- `systems/utils.js` -> `systems/camera.js`, `systems/combat.js`, `systems/gameState.js`

## 二、發現的循環依賴

本次掃描發現 1 個大型 strongly connected component，包含 18 個檔案：

`main.js`, `systems/boss.js`, `systems/chat.js`, `systems/combat.js`, `systems/creatures.js`, `systems/daynight.js`, `systems/elite.js`, `systems/evolution.js`, `systems/hud.js`, `systems/input.js`, `systems/leaderboard.js`, `systems/mobile.js`, `systems/mutation.js`, `systems/organs.js`, `systems/player.js`, `systems/tutorial.js`, `systems/ui.js`, `systems/utils.js`

代表這 18 個模組之間存在多條可互相抵達的循環路徑。若展開全部 simple cycles，數量會非常大；Stage F 應以「打斷循環入口」為主，而不是逐條處理所有排列路徑。

循環 #1：

`main.js` -> `systems/boss.js` -> `main.js`

嚴重程度：高

說明：`boss.js` 從 `main.js` import `pausePlayTimer`，而 `main.js` 又在啟動時 import `boss.js`。這是頂層入口被下層系統反向依賴，初始化順序風險最高。

循環 #2：

`main.js` -> `systems/evolution.js` -> `main.js`

嚴重程度：高

說明：`evolution.js` 從 `main.js` import `pausePlayTimer`、`resumePlayTimer`、`startGameWithLoading`，同時 `main.js` import `evolution.js`。技能樹、死亡後流程、重開流程都可能碰到初始化與流程耦合風險。

循環 #3：

`main.js` -> `systems/organs.js` -> `main.js`

嚴重程度：高

說明：`organs.js` 從 `main.js` import `resumePlayTimer`、`pausePlayTimer`，而器官選擇又是升級流程核心。這是 ARCH.md 已標註的嚴重循環，仍存在。

循環 #4：

`main.js` -> `systems/tutorial.js` -> `main.js`

嚴重程度：高

說明：`tutorial.js` 也反向 import `pausePlayTimer`、`resumePlayTimer`。雖然教學流程不是每局核心戰鬥都會觸發，但它直接依賴入口模組，仍屬高嚴重度。

循環 #5：

`main.js` -> `systems/ui.js` -> `main.js`

嚴重程度：高

說明：`ui.js` 從 `main.js` import `startGameWithLoading`，而 `main.js` import `ui.js`。首頁、設定、地圖選擇、結算畫面都會牽涉 UI 初始化，因此這條循環影響面大。

循環 #6：

`systems/combat.js` -> `systems/player.js` -> `systems/combat.js`

嚴重程度：中

說明：ARCH.md 已知循環仍存在。`combat.js` 需要 `addXP`、`showXPPopup`、`_archerAttack`，`player.js` 需要 `applyDamageToPlayer`、`handleKill`、`showFloatingText`。目前可能靠 ESM live binding 正常運作，但戰鬥與玩家系統彼此初始化耦合。

循環 #7：

`systems/organs.js` -> `systems/player.js` -> `systems/organs.js`

嚴重程度：中

說明：ARCH.md 已知循環仍存在。`organs.js` 需要玩家 XP/UI popup，`player.js` 需要器官效果與精英擊殺處理。這是核心角色成長邏輯，風險中等偏高。

循環 #8：

`systems/combat.js` -> `systems/organs.js` -> `systems/combat.js`

嚴重程度：中

說明：`combat.js` 需要器官等級、精英擊殺與器官效果；`organs.js` 需要浮動文字。兩者都屬核心戰鬥/成長系統，循環容易讓後續抽取更困難。

循環 #9：

`systems/combat.js` -> `systems/evolution.js` -> `systems/combat.js`

嚴重程度：中

說明：戰鬥死亡/擊殺流程與技能樹顯示互相依賴。`combat.js` 需要 `showSkillTree`，`evolution.js` 需要 `showFloatingText`，屬核心流程耦合。

循環 #10：

`systems/evolution.js` -> `systems/organs.js` -> `systems/evolution.js`

嚴重程度：中

說明：進化與器官系統彼此 import。這反映「器官槽位、進化解鎖、隱藏器官」職責交疊，未來拆 Stage F 時應一起整理。

循環 #11：

`systems/boss.js` -> `systems/combat.js` -> `systems/boss.js`

嚴重程度：中

說明：Boss 需要戰鬥傷害與浮動文字，戰鬥需要 Boss kill handler。Boss 是核心遊戲流程與勝利判定的一部分，循環有實際風險。

循環 #12：

`systems/boss.js` -> `systems/player.js` -> `systems/boss.js`

嚴重程度：中

說明：Boss 需要 `addXP`，玩家需要 `handleBossKill`。這是擊殺獎勵與勝利流程耦合，適合拆成事件或獎勵服務。

循環 #13：

`systems/combat.js` -> `systems/mutation.js` -> `systems/combat.js`

嚴重程度：中

說明：`combat.js` 需要 `addMutationPoints`，`mutation.js` 需要 `showFloatingText`。這類「獎勵通知」不應讓 mutation 回頭依賴 combat 的 UI helper。

循環 #14：

`systems/combat.js` -> `systems/utils.js` -> `systems/combat.js`

嚴重程度：中

說明：`combat.js` 使用 `utils.js`，但 `utils.js` 又 import `_spawnBone`。工具模組反向依賴戰鬥系統會擴大耦合，且 `utils` 通常應保持低層。

循環 #15：

`systems/mobile.js` -> `systems/player.js` -> `systems/mobile.js`

嚴重程度：低

說明：手機控制需要玩家 dash，玩家移動需要 `_joyPaused`。涉及輸入與裝置狀態，暫無已知症狀，但可用參數注入或 shared input state 拆開。

循環 #16：

`systems/mobile.js` -> `systems/ui.js` -> `systems/mobile.js`

嚴重程度：低

說明：手機模式與 UI tooltip / device mode 互相依賴。這比較偏 UI/裝置輔助系統，風險低，但會讓 UI 初始化路徑更複雜。

循環 #17：

`systems/evolution.js` -> `systems/ui.js` -> `systems/evolution.js`

嚴重程度：低

說明：技能樹 overlay 與 UI tooltip/end game builder 互相 import。雖然牽涉死亡後流程，但主要是 UI 組裝耦合，沒有直接碰 `main.js` 時可列低；目前因兩者也各自牽入 `main.js`，實際修復時會被高嚴重度批次一併影響。

## 三、與 ARCH.md 已知循環比對

1. `player.js` <-> `combat.js`：仍存在。
2. `player.js` <-> `organs.js`：仍存在。
3. `organs.js` -> `main.js`：仍存在，而且 `main.js` -> `systems/organs.js` 形成明確雙向循環。

新增循環：

- 新增或至少 ARCH.md 未列出的 `main.js` 反向循環：`boss.js`、`evolution.js`、`tutorial.js`、`ui.js` 都 import `main.js`。
- 新增或至少 ARCH.md 未列出的核心系統雙向循環：`combat.js` <-> `boss.js`、`boss.js` <-> `player.js`、`combat.js` <-> `evolution.js`、`combat.js` <-> `mutation.js`、`combat.js` <-> `utils.js`、`evolution.js` <-> `organs.js`。
- 新增或至少 ARCH.md 未列出的 UI/裝置循環：`mobile.js` <-> `player.js`、`mobile.js` <-> `ui.js`、`evolution.js` <-> `ui.js`。

已消失循環：

- 以本次掃描結果看，ARCH.md 列出的三個循環都沒有消失。
- Stage C/D 的純函式化與參數注入有降低部分函式測試成本，但尚未打破既有核心循環依賴群。

## 四、修復策略分析

循環 #1 `main.js` <-> `boss.js`：

建議策略：策略 C + 策略 B。

理由：`boss.js` 只需要暫停計時與流程收尾能力，不應 import 入口。可先把 timer control 抽到獨立 `systems/playTimer.js` 或由 `main.js` 初始化時注入 `pausePlayTimer`。

循環 #2 `main.js` <-> `evolution.js`：

建議策略：策略 B + 策略 C。

理由：`pausePlayTimer`、`resumePlayTimer`、`startGameWithLoading` 是流程控制，不屬於 evolution。建議抽出 game flow/timer controller；若只需少量 callback，則由 UI 或 main 初始化時注入。

循環 #3 `main.js` <-> `organs.js`：

建議策略：策略 B。

理由：ARCH.md 已標註嚴重。`organs.js` import `main.js` 只為 timer control，最適合把 timer 狀態與操作抽到共用低層模組，讓 `main.js` 與 `organs.js` 都依賴它。

循環 #4 `main.js` <-> `tutorial.js`：

建議策略：策略 C。

理由：教學只需要暫停/恢復 timer，可用 callback 注入，或復用抽出的 timer module。

循環 #5 `main.js` <-> `ui.js`：

建議策略：策略 A + 策略 C。

理由：UI 啟動遊戲可以改成 dispatch `CustomEvent`，由 `main.js` 監聽後呼叫 `startGameWithLoading`；若要更保守，也可在 UI 初始化時注入 `startGameWithLoading` callback。

循環 #6 `combat.js` <-> `player.js`：

建議策略：策略 B。

理由：`addXP`、`showXPPopup`、`handleKill`、`showFloatingText` 是獎勵/浮動文字/擊殺流程混在兩邊。可抽出 `systems/rewards.js` 或 `systems/feedback.js`，先把浮動文字與 XP popup 這類共用工具拆出。

循環 #7 `organs.js` <-> `player.js`：

建議策略：策略 B + 策略 C。

理由：器官效果與玩家 XP/屬性應拆清楚。可把器官查詢與效果計算抽成純 helper，玩家只接收計算結果；器官選擇完成後透過參數或事件通知玩家更新。

循環 #8 `combat.js` <-> `organs.js`：

建議策略：策略 B。

理由：戰鬥需要器官數值，器官需要浮動文字。器官數值查詢可留在低層 pure module，浮動文字應移到獨立 feedback module，避免 organs 回頭依賴 combat。

循環 #9 `combat.js` <-> `evolution.js`：

建議策略：策略 A + 策略 B。

理由：死亡或 timeout 後顯示技能樹屬於流程事件，適合由 combat dispatch event，由 UI/evolution flow 接手；浮動文字可抽到 feedback module。

循環 #10 `evolution.js` <-> `organs.js`：

建議策略：策略 B。

理由：進化解鎖、器官槽位、隱藏器官選擇有共享規則。建議抽出 `organRules` / `evolutionRules` 類低層純函式模組。

循環 #11 `boss.js` <-> `combat.js`：

建議策略：策略 A + 策略 B。

理由：Boss kill handler 可改成 combat 發出 boss killed event，Boss/flow 模組處理勝利；浮動文字也應抽出，避免 Boss 直接拉戰鬥模組。

循環 #12 `boss.js` <-> `player.js`：

建議策略：策略 B。

理由：擊殺 Boss 給 XP 是 reward concern。抽出 reward helper 後，Boss 不必 import player 的 `addXP`，player 也不必回頭 import Boss kill handler。

循環 #13 `combat.js` <-> `mutation.js`：

建議策略：策略 B。

理由：mutation 增點與顯示提示應拆開。`addMutationPoints` 可保留在 mutation，浮動文字改依賴 feedback module，或由呼叫端負責顯示。

循環 #14 `combat.js` <-> `utils.js`：

建議策略：策略 B。

理由：`utils.js` 是低層工具，不能 import combat。`_spawnBone` 應搬到 bone/combat helper，或把 `spawnLootCircle` 與 `applyTenacity` 等工具拆到更小的低層檔案。

循環 #15 `mobile.js` <-> `player.js`：

建議策略：策略 C。

理由：玩家只需要 `_joyPaused` 狀態，mobile 只需要觸發 dash。可把輸入狀態放入 `gameState.mobileInput`，或把 dash callback 在初始化時注入 mobile。

循環 #16 `mobile.js` <-> `ui.js`：

建議策略：策略 A。

理由：裝置模式改變與 tooltip 顯示多數是通知型，不需要同步回傳值。mobile 可發出 device mode changed event，UI 接收後更新。

循環 #17 `evolution.js` <-> `ui.js`：

建議策略：策略 B + 策略 C。

理由：tooltip/end game overlay 屬 UI builder，技能樹屬 evolution flow。可把共用 overlay builder 抽出，或由 UI 將 tooltip callbacks 注入 evolution overlay 建構函式。

## 五、修復優先順序

批次 1（先做，風險低收益高）：

- 抽出 timer / flow control，移除 `boss.js`、`organs.js`、`evolution.js`、`tutorial.js` 對 `main.js` 的 import。
- 將 `ui.js` 啟動遊戲流程改成 callback 注入或 `CustomEvent`，移除 `ui.js` 對 `main.js` 的 import。

理由：這批可直接解除所有 `main.js` 反向依賴，是收益最大的高嚴重度修復。做法集中，風險比直接拆 combat/player/organs 低。

批次 2：

- 抽出 feedback / reward 低層模組，優先處理 `showFloatingText`、`showXPPopup`、`addXP`、mutation points、Boss kill reward。
- 目標循環：`combat.js` <-> `player.js`、`combat.js` <-> `organs.js`、`combat.js` <-> `evolution.js`、`combat.js` <-> `mutation.js`、`boss.js` <-> `player.js`、`boss.js` <-> `combat.js`。

理由：這批會拆核心戰鬥與成長耦合，一次能解開最多中嚴重度循環，但需要比較完整的回歸測試。

批次 3（最後做，風險高或收益較局部）：

- 拆 `utils.js` 對 combat 的反向依賴。
- 整理 `mobile.js` <-> `player.js`、`mobile.js` <-> `ui.js`、`evolution.js` <-> `ui.js`。

理由：這批多半是 UI/工具/輸入耦合，單點風險較低，但容易牽涉互動細節。等主循環群縮小後再處理會更穩。

## 六、總結

循環總數：17 個直接雙向循環；另有 1 個 18 檔案大型循環群

高嚴重度：5 個

中嚴重度：9 個

低嚴重度：3 個

預估修復批次：3 批

非預期嚴重問題：

- `main.js` 反向依賴不只 ARCH.md 記錄的 `organs.js`，目前還包含 `boss.js`、`evolution.js`、`tutorial.js`、`ui.js`。
- 目前核心循環已不是獨立的三條，而是一個 18 檔案大型 SCC。Stage F 若只修 `player/combat/organs`，仍無法解除整體循環群。
