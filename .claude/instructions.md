# Claude Code 自動讀取指引

## 每次對話開始前必須依序讀取（相對路徑，跨電腦通用）
1. `MAIN.md`
2. `CHANGELOG.md`
3. `VERSION_RULES.md`

## 開發規則（每次必須遵守）
- `gameLoop` 裡絕對不能出現字面上的 `\n` 字符
- 每次修改完必須更新 `CHANGELOG.md` 和版本號
- 新增任何函式或功能必須更新 `MAIN.md` 對應模組說明
- 函式如果已被移除或合併，必須從 `MAIN.md` 對應區塊刪除
- 數值只能在 `config/` 資料夾修改
- 不使用 ES Modules，全部用傳統 script 標籤

## 關鍵技術陷阱（必須記住，高頻犯錯）
- 所有速度數值已乘以 3.0（180Hz 螢幕校正歷史遺留，不要動）
- `MOBILE_GAME_SCALE = 0.7` 控制手機縮放，不要寫死數值
- 手機版用 `gameState.isMobile` 和 `gameState.orientation` 判斷
- `realPlayTime` 是毫秒，上傳排行榜時用 `Math.floor(realPlayTime / 1000)` 轉秒
- `resumePlayTimer()` 無條件啟動；`pausePlayTimer()` 有檢查 `_playTimerStart !== null`
- `gameSettings.autoAttack` 任何版本更新都不重置（不受 `SAVE_VERSION` 控制）
- 毒傷 tick 使用 `c.lastPoisonTick += 1000`（不是 `= now`），避免累積誤差
- `showHiddenOrganSelection()` 必須在 `addXP()` 之前呼叫，否則界面疊層
- `gameState.organSelectionActive = false` 必須在 `showOrganSelection()` 之前設定
- 開發者模式暗號：`77777778`，使用後 `gameState.devModeUsed = true` 禁止上傳排行榜
- `lang/zh-TW.js` 速度描述與實際數值不一致（180Hz 歷史遺留），未來統一大改前不要動

## commit 後自動執行：sync-docs 流程

每次完成 git commit 之後，不需要等用戶提醒，立刻執行以下四個步驟：

### Step 1 — 確認本次變更範圍
讀取 `CHANGELOG.md` 最上方最新一條 entry，
確認這次 commit 涉及哪些檔案和系統。

### Step 2 — 檢查並更新 MAIN.md
比對本次變更，逐一確認：
- 新增函式 → 加入對應模組的函式列表
- 移除或合併函式 → 從對應模組刪除
- 新增模組檔案 → 加入載入順序區塊，補上職責說明
- 模組職責有變化 → 更新說明文字

### Step 3 — 檢查並更新 project_summary.md
比對本次變更，逐一確認：
- 系統行為改變（數值、機制、流程）→ 更新對應章節
- 新增系統 → 在第二節新增對應說明區塊
- 功能從待辦變成完成 → 更新第四節待辦清單，打勾或刪除
- 版本號 → 同步更新「版本與部署」區塊的版本號

### Step 4 — 輸出 sync 報告
每次執行完畢，輸出以下格式的報告：
── sync-docs 完成 ──
版本：vX.XX.X
MAIN.md：[已更新｜無需變動] → （一句話說明）
project_summary.md：[已更新｜無需變動] → （一句話說明）
────────────────────

## 手動觸發 sync-docs
用戶輸入「sync-docs」時，執行相同的 Step 1～4。

## 修改完成後的固定順序
1. sync-docs（Step 1～4）
2. git commit
3. git push（指令見下方，依當前電腦環境執行）
4. 回覆確認「已推送到 GitHub」

## Git 推送指令（依電腦環境選擇）
- Windows（Git 安裝在 C:\AI\Git）：
  `"C:\AI\Git\bin\git.exe" -C . push origin master`
- 其他電腦：
  `git push origin master`

所有路徑操作一律使用相對路徑，不寫死絕對路徑。