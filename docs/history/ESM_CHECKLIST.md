# ESM 遷移操作手冊
# 只吃不叫的噪鵑（The Silent Koel）
#
# 這份文件是給你（開發者 Goblinnest）看的操作指南。
# 每個步驟都寫清楚：現在要做什麼、找誰做、Prompt 貼哪裡、怎麼確認完成。
# 你不需要自己想怎麼跟 AI 說話，Prompt 都已經預先寫好。

---

# ══════════════════════════════════════
# STAGE 0 — 準備工作
# ══════════════════════════════════════

## S0-1：確認版本號一致

**找誰：Claude Code（VS Code terminal）**

把以下 Prompt 貼給 Claude Code：

```
請讀取以下 5 個檔案的第一行，確認版本號是否全部一致：
- CHANGELOG.md
- MAIN.md
- project_summary.md
- QUICKREF.md
- config/gameConfig.js

列出每個檔案的版本號，如果不一致請告訴我哪個落後了。
```

**完成條件：** Claude Code 回報 5 個版本號全部一致。
如果有不一致，先請 Claude Code 修正，修正完再繼續。

---

## S0-2：建立 esm-refactor 分支

**找誰：Claude Code（VS Code terminal）**

把以下 Prompt 貼給 Claude Code：

```
請執行以下 Git 指令，建立 ESM 工作分支：

1. git checkout -b esm-refactor
2. 確認目前在 esm-refactor 分支
3. 回報目前分支名稱

不要 push，不要做任何其他操作。
```

**完成條件：** Claude Code 回報目前在 `esm-refactor` 分支。

---

## S0-3：把 ESM 文件加入專案

**找誰：你自己**

把以下 5 個檔案複製到你的專案資料夾：
- `docs/ESM_MIGRATION_PLAN.md`
- `docs/ESM_PROJECT_CONTEXT.md`
- `docs/ESM_PROGRESS.md`（本文件）
- `docs/ESM_CHECKLIST.md`
- `.codex/AGENTS.md`

如果 `docs/` 資料夾不存在就建立它。
如果 `.codex/` 資料夾不存在就建立它。

---

## S0-4：初始 Commit

**找誰：Claude Code（VS Code terminal）**

把以下 Prompt 貼給 Claude Code：

```
請執行以下操作：
1. git add docs/ .codex/
2. git commit -m "docs: 建立 ESM 遷移文件套件 (Stage 0)"
3. 更新 docs/ESM_PROGRESS.md，在事件紀錄加入今天的條目：
   - 狀態：Stage 0 完成
   - 完成項目：建立 esm-refactor 分支、加入 ESM 文件套件
   - 下一步：執行 Stage 1 Codex 依賴審計
4. git add docs/ESM_PROGRESS.md
5. git commit -m "docs: Stage 0 完成，更新進度追蹤"

完成後回報「Stage 0 完成」。
```

**完成條件：** Claude Code 回報「Stage 0 完成」，兩個 commit 都成功。

---

## ✅ Stage 0 完成後，回報 Claude Chat

把 Claude Code 的回覆截圖或貼文字給我（Claude Chat），
我確認沒問題後告訴你進入 Stage 1。

---

# ══════════════════════════════════════
# STAGE 1 — Codex 依賴審計
# ══════════════════════════════════════

> ⚠️ 你需要先訂閱 ChatGPT Pro 才能使用 Codex。
> 如果還沒訂閱，先跳過 Stage 1，回來告訴 Claude Chat，
> 我們會調整流程讓 Claude Code 代替執行這個步驟。

---

## S1-1：把專案給 Codex 審計

**找誰：Codex（ChatGPT Pro 介面）**

先把整個專案資料夾連結給 Codex，然後把以下 Prompt 貼給它：

```
Please read docs/ESM_PROJECT_CONTEXT.md and docs/ESM_MIGRATION_PLAN.md first.
Then read docs/ESM_PROGRESS.md to understand the current status.

Your task is Stage 1: Dependency Audit.

Analyze ALL JavaScript files in this project (listed in ESM_PROJECT_CONTEXT.md section 二).
For each file, identify:
1. What global variables/functions/constants it DEFINES
2. What global variables/functions/constants it USES (from other files)

Then produce a file: docs/dependency_map.md with the following format:

## 全域變數依賴表
| 名稱 | 類型 | 定義在 | 被哪些檔案使用 |
|------|------|--------|--------------|
| gameState | object | systems/gameState.js | 幾乎所有 systems/ |
...（所有全域變數/函式/常數）

## 高風險依賴（循環依賴或複雜互依）
（列出任何你發現的循環依賴或複雜依賴關係）

## 建議的 ESM import 順序
（根據依賴關係，建議正確的 import 順序）

After producing the file, update docs/ESM_PROGRESS.md:
- Mark S1-1 and S1-2 as complete
- Add an entry to the event log

Do NOT modify any game logic files. Analysis only.
```

**完成條件：** Codex 產出了 `docs/dependency_map.md`。

---

## S1-2：把 Codex 的輸出貼給 Claude Chat 確認

**找誰：Claude Chat（這裡）**

把 `docs/dependency_map.md` 的內容貼給我（Claude Chat），
我會幫你確認：
1. 有沒有遺漏的依賴
2. 有沒有奇怪的循環依賴需要特別處理
3. 批次分工清單是否需要調整

我確認沒問題後，告訴你進入 Stage 2A。

---

# ══════════════════════════════════════
# STAGE 2A — ESM 遷移 批次1
# config/ + lang/ + map/
# ══════════════════════════════════════

## S2A-1：Claude Code 執行批次1遷移

**找誰：Claude Code（VS Code terminal）**

把以下 Prompt 貼給 Claude Code：

```
請先讀取以下文件：
- docs/ESM_MIGRATION_PLAN.md
- docs/ESM_PROGRESS.md
- docs/dependency_map.md（如果存在）

任務：執行 ESM 遷移 批次1。

目標檔案（共 13 個）：
- config/gameConfig.js
- config/characters.js
- config/organs.js
- config/creatures.js
- config/evolution.js
- config/patchnotes.js
- config/supabase.js
- lang.js
- lang/zh-TW.js
- lang/en.js
- map/easymap.js
- map/normalmap.js
- map/hardmap.js

遷移規則（嚴格遵守）：
✅ 允許：在檔案頂部加 import 語句
✅ 允許：在函式/常數前加 export 關鍵字
❌ 禁止：修改任何函式的內部邏輯
❌ 禁止：修改任何數值或條件判斷
❌ 禁止：重新命名任何函式或變數
❌ 禁止：合併或拆分任何檔案
❌ 禁止：修改 index.html（批次1還不動它）

完成後：
1. 列出每個檔案做了什麼修改（加了哪些 export/import）
2. 更新 docs/ESM_PROGRESS.md 標記 S2A-1 完成
3. git add + git commit -m "refactor: ESM 遷移 批次1 (config/ + lang/ + map/)"
4. 回報「批次1遷移完成，請進行靜態檢查和人工測試」

不要自動進行批次2。等我確認後才繼續。
```

---

## S2A-2：Codex 靜態語法檢查

**找誰：Codex（ChatGPT Pro 介面）**

把以下 Prompt 貼給 Codex：

```
Please read docs/ESM_PROGRESS.md to understand the current status.

Your task: Static syntax check for Batch 1 ESM migration.

Check the following 13 files:
config/gameConfig.js, config/characters.js, config/organs.js,
config/creatures.js, config/evolution.js, config/patchnotes.js,
config/supabase.js, lang.js, lang/zh-TW.js, lang/en.js,
map/easymap.js, map/normalmap.js, map/hardmap.js

For each file, verify:
1. All import paths point to files that actually exist
2. All imported names are actually exported from their source files
3. No circular dependencies exist within these 13 files
4. No syntax errors in the import/export statements

Output a report:
✅ PASS: [filename] - no issues
❌ FAIL: [filename] - [describe the issue]

If there are failures, describe exactly what needs to be fixed.
Do NOT fix anything yourself. Report only.

Update docs/ESM_PROGRESS.md: mark S2A-2 complete.
```

---

## S2A-3：你開瀏覽器人工測試

**找誰：你自己**

打開瀏覽器，進入遊戲網址（Vercel 測試環境：silent-koel.vercel.app）

測試項目：
- [ ] 首頁正常顯示
- [ ] 點「開始遊戲」能進入難度選擇畫面
- [ ] 選擇難度後能開始遊戲
- [ ] 角色能移動
- [ ] 吃果子有反應
- [ ] 瀏覽器 console（F12）沒有紅色錯誤

測試完後，把結果告訴 Claude Chat。
如果有任何錯誤，把 console 的錯誤訊息完整貼給我。

---

## S2A-4：確認完成，進入批次2

**找誰：Claude Chat（這裡）**

把測試結果告訴我，我確認沒問題後告訴你進入 Stage 2B。

---

# ══════════════════════════════════════
# STAGE 2B — ESM 遷移 批次2
# systems/ 基礎層
# ══════════════════════════════════════

## S2B-1：Claude Code 執行批次2遷移

**找誰：Claude Code（VS Code terminal）**

把以下 Prompt 貼給 Claude Code：

```
請先讀取以下文件：
- docs/ESM_MIGRATION_PLAN.md
- docs/ESM_PROGRESS.md

確認 S2A 全部完成後再繼續。

任務：執行 ESM 遷移 批次2。

目標檔案（共 8 個）：
- systems/gameState.js
- systems/utils.js
- systems/audio.js
- systems/camera.js
- systems/input.js
- systems/map.js
- systems/spawning.js
- systems/tutorial.js

遷移規則（同批次1，嚴格遵守）：
✅ 允許：加 import/export
❌ 禁止：修改任何邏輯、數值、命名
❌ 禁止：修改 index.html

完成後：
1. 列出每個檔案做了什麼修改
2. 更新 docs/ESM_PROGRESS.md 標記 S2B-1 完成
3. git commit -m "refactor: ESM 遷移 批次2 (systems/ 基礎層)"
4. 回報「批次2遷移完成，請進行靜態檢查和人工測試」

不要自動進行批次3。
```

## S2B-2 到 S2B-4：同批次1流程
（Codex 靜態檢查 → 你開瀏覽器測試 → 告訴 Claude Chat）

---

# ══════════════════════════════════════
# STAGE 2C — ESM 遷移 批次3
# systems/ 核心層 + main.js + index.html
# ══════════════════════════════════════

> ⚠️ 批次3是風險最高的部分，index.html 也在這裡改。
> 進入批次3之前，確保批次1和批次2都穩定通過測試。

## S2C-1：Claude Code 執行批次3遷移

**找誰：Claude Code（VS Code terminal）**

把以下 Prompt 貼給 Claude Code：

```
請先讀取以下文件：
- docs/ESM_MIGRATION_PLAN.md
- docs/ESM_PROGRESS.md

確認 S2A 和 S2B 全部完成後再繼續。

任務：執行 ESM 遷移 批次3（最終批次）。

目標檔案：
- systems/player.js
- systems/combat.js
- systems/organs.js
- systems/evolution.js
- systems/creatures.js
- systems/elite.js
- systems/boss.js
- systems/daynight.js
- systems/ui.js
- systems/leaderboard.js
- systems/mutation.js
- main.js
- index.html（最後處理：把所有 <script src> 改為 <script type="module" src>，
  只保留一個 main.js 的入口，其他透過 import 鏈載入）

遷移規則（同前，嚴格遵守）：
✅ 允許：加 import/export，修改 index.html 的 script 標籤
❌ 禁止：修改任何邏輯、數值、命名

完成後：
1. 列出每個檔案做了什麼修改
2. 特別說明 index.html 的修改方式
3. 更新 docs/ESM_PROGRESS.md 標記 S2C-1 完成
4. git commit -m "refactor: ESM 遷移 批次3 (systems/ 核心層 + main.js + index.html)"
5. 回報「批次3遷移完成，請進行完整測試」
```

## S2C-3：完整測試（比前兩批次更仔細）

**找誰：你自己**

這次要測試更多東西：
- [ ] 首頁正常顯示
- [ ] 開始遊戲，完整玩一局（或玩到死亡）
- [ ] 器官選擇畫面正常
- [ ] 技能樹畫面正常
- [ ] 排行榜能開啟（不一定要提交）
- [ ] 設定畫面正常
- [ ] 音效有聲音
- [ ] 手機模式正常（如果有手機可以測）
- [ ] console 沒有紅色錯誤

---

# ══════════════════════════════════════
# STAGE 3 — 架構重構
# ══════════════════════════════════════

> Stage 3 的每個 TODO 都是獨立工作。
> 每個 TODO 開始前，告訴我（Claude Chat）你要開始哪個，
> 我會幫你寫對應的 Prompt。

這裡先列出觸發語句，等你需要時再展開：

- 開始 TODO-06 → 告訴 Claude Chat「我要開始 TODO-06」
- 開始 TODO-04 → 告訴 Claude Chat「我要開始 TODO-04」
- 開始 TODO-01 → 告訴 Claude Chat「我要開始 TODO-01」
（以此類推）

---

# ══════════════════════════════════════
# 緊急回滾
# ══════════════════════════════════════

## 任何時候出現嚴重 Bug

**第一步：先告訴 Claude Chat 發生了什麼**
把錯誤訊息、console 報錯、問題描述告訴我，我幫你判斷是否需要回滾。

**如果確認需要回滾，把以下 Prompt 貼給 Claude Code：**

```
遊戲出現嚴重問題，需要回滾。

請執行：
1. git log --oneline -10
   列出最近 10 個 commit，告訴我每個 commit 的 hash 和說明

2. 等我確認要回滾到哪個 commit 後再繼續

不要自動執行回滾。
```

等 Claude Chat 告訴你要回滾到哪個 commit 後，再請 Claude Code 執行。
