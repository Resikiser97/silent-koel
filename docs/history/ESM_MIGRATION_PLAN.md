> ⚠️ 此文件已歸檔（ESM 遷移於 v0.1.5.0 完成）。僅供歷史參考，不需執行。

# ESM 遷移計劃書
# 只吃不叫的噪鵑（The Silent Koel）
# 建立日期：2026-06-04 | 當前版本：v0.1.3.3
#
# 讀者說明：
#   你（開發者 Goblinnest）→ 看 ESM_CHECKLIST.md，你只需要照步驟操作
#   Claude Chat            → 監督進度、撰寫 Prompt、判斷結果
#   Claude Code（CC）      → 執行代碼修改，每次開始前必讀本文件
#   Codex                  → 靜態審計與檢查腳本，每次開始前必讀本文件 + ESM_PROJECT_CONTEXT.md

---

## 一、全局排程總覽

| Stage | 名稱 | 執行者 | 預計風險 | 狀態 |
|-------|------|--------|----------|------|
| Stage 0 | 準備工作 | 你 + Claude Chat | 無 | ⬜ 未開始 |
| Stage 1 | Codex 依賴審計 | Codex | 低 | ⬜ 未開始 |
| Stage 2A | ESM 遷移 批次1（config/ + lang/） | Claude Code | 中 | ⬜ 未開始 |
| Stage 2B | ESM 遷移 批次2（systems/ 上半） | Claude Code | 中 | ⬜ 未開始 |
| Stage 2C | ESM 遷移 批次3（systems/ 下半 + main.js） | Claude Code | 中高 | ⬜ 未開始 |
| Stage 3 | 架構重構（按 ESM_TODO.md Phase 1→4） | Claude Code | 高 | ⬜ 未開始 |
| Stage 4 | Branch 對調（stable 變主線） | 你 + Claude Code | 低 | ⬜ 未開始 |

> 進度即時狀態請看 ESM_PROGRESS.md

---

## 二、重要原則（所有執行者必須遵守）

1. **每個 Stage 完成前不進入下一個 Stage**，無例外
2. **Stage 2 期間不做任何功能修改**，只換語法，不動邏輯
3. **每個批次完成後必須人工開瀏覽器測試**，確認遊戲可正常執行
4. **出現任何無法解釋的 Bug，立即停止並回滾**，不要繼續往下做
5. **ESM_PROGRESS.md 必須在每個步驟完成後立即更新**

---

## 三、Stage 0 — 準備工作

### 目標
在動任何代碼之前，確保環境、文件、分支都處於正確狀態。

### 執行步驟

**S0-1：確認所有文件版本號一致**
檢查以下 5 個檔案頂部版本號是否全部一致：
- `CHANGELOG.md`
- `MAIN.md`
- `project_summary.md`
- `QUICKREF.md`
- `config/gameConfig.js`

**S0-2：建立 ESM 工作分支**
```bash
git checkout -b esm-refactor
```
所有 ESM 工作都在 `esm-refactor` 分支進行，不動 `master`。
ESM 全部完成、測試通過後，才 merge 回 master。

**S0-3：建立 docs/ 資料夾並加入本套文件**
確認以下檔案存在：
- `docs/ESM_MIGRATION_PLAN.md`（本文件）
- `docs/ESM_PROJECT_CONTEXT.md`
- `docs/ESM_PROGRESS.md`
- `docs/ESM_CHECKLIST.md`
- `.codex/AGENTS.md`

**S0-4：commit 初始狀態**
```bash
git add .
git commit -m "docs: 建立 ESM 遷移文件套件 (Stage 0)"
```

### 驗收條件
- [ ] 5 個版本號檔案全部一致
- [ ] `esm-refactor` 分支已建立
- [ ] 所有文件檔案存在
- [ ] 初始 commit 完成

---

## 四、Stage 1 — Codex 依賴審計

### 目標
在不動任何代碼的情況下，產出整個專案的依賴地圖，讓後續遷移有精確的參考依據。

### 執行者
Codex（你把 Prompt 貼給它，等它回傳結果）

### Codex 要產出的文件
`docs/dependency_map.md`，內容格式如下：

```
## 全域變數依賴表
| 變數/函式名稱 | 定義在 | 被哪些檔案使用 |
|-------------|--------|--------------|
| gameState   | systems/gameState.js | 幾乎所有 systems/ |
| GAME_INFO   | config/gameConfig.js | main.js, systems/ui.js |
...

## 載入順序（目前 index.html 的 <script> 順序）
1. config/gameConfig.js
2. config/characters.js
...

## 高風險依賴（需要特別注意的循環或複雜依賴）
...
```

### 驗收條件
- [ ] `docs/dependency_map.md` 存在
- [ ] 覆蓋全部 57 個 JS 檔案
- [ ] 你和 Claude Chat 人工確認內容合理後才進入 Stage 2

---

## 五、Stage 2 — 純 ESM 語法遷移

### 核心規則（Claude Code 必須嚴格遵守）

```
✅ 允許做的事：
  - 在檔案頂部加 import 語句
  - 在函式/常數前加 export 關鍵字
  - 修改 index.html 的 <script> 改為 <script type="module">

❌ 絕對不能做的事：
  - 修改任何函式的內部邏輯
  - 修改任何數值或條件判斷
  - 重新命名任何函式或變數
  - 合併或拆分任何檔案
  - 修改 config/ 的任何數值
```

### 三批次分工

**批次 1（風險最低）：靜態資料層**
```
config/gameConfig.js
config/characters.js
config/organs.js
config/creatures.js
config/evolution.js
config/patchnotes.js
config/supabase.js
lang.js
lang/zh-TW.js
lang/en.js
map/easymap.js
map/normalmap.js
map/hardmap.js
```
這些檔案大多是純資料常數，沒有複雜的跨檔案呼叫，最安全。

**批次 2（風險中等）：基礎系統層**
```
systems/gameState.js
systems/utils.js
systems/audio.js
systems/camera.js
systems/input.js
systems/map.js
systems/spawning.js
systems/tutorial.js
```
這些是基礎工具，被其他 systems/ 依賴，必須先完成。

**批次 3（風險最高）：核心遊戲層**
```
systems/player.js
systems/combat.js
systems/organs.js
systems/evolution.js
systems/creatures.js
systems/elite.js
systems/boss.js
systems/daynight.js
systems/ui.js
systems/leaderboard.js
systems/mutation.js
main.js
index.html（最後處理）
```
這些是核心遊戲邏輯，互相依賴最複雜，每個檔案完成後都要確認。

### 每批次驗收流程
1. Codex 跑靜態檢查腳本（語法正確性、import 路徑存在）
2. 你開瀏覽器，確認遊戲畫面正常載入
3. 快速測試：開始一局遊戲、移動角色、吃果子、確認沒有 console error
4. 三項全部通過才算完成這個批次

---

## 六、Stage 3 — 架構重構

按 `ESM_TODO.md` 的 Phase 順序執行，每個 TODO 是一個獨立的工作單元。

```
Phase 1：ESM 基礎建設
  TODO-06：localStorage 統一讀寫入口（storage/index.js）
  TODO-04：AudioManager 統一音量管理（audio/AudioManager.js）

Phase 2：最高價值重構
  TODO-01：buildSkillTreeOverlay 拆模組（消滅最多 bug 來源）
  TODO-03：變異技能面板統一

Phase 3：清理
  TODO-02：結算畫面統一
  TODO-05：設定面板 fromHome 移除
  TODO-07：gameState 存取控制

Phase 4：收尾
  TODO-08：移除 _checkAndRepairMutationSkills
  TODO-09/10：自然解決
```

**重要：** Phase 1 完成、測試穩定後，才進入 Phase 2。以此類推。
每個 TODO 完成後在 `ESM_TODO.md` 標記 ✅ 和完成版本號。

---

## 七、Stage 4 — Branch 對調

Stage 3 全部完成、測試穩定後執行。

```bash
# 把 esm-refactor merge 進 master
git checkout master
git merge esm-refactor

# 把 master 的內容同步到 stable（stable 變成玩家看到的主線）
git checkout stable
git merge master
git push origin stable

# 回到 master 繼續開發
git checkout master
```

Vercel 設定：將 Production Branch 從 `stable` 改為指向正確分支（到時 Claude Chat 會給詳細步驟）。

---

## 八、緊急回滾程序

任何 Stage 出現無法解釋的 Bug，立即執行：

```bash
# 回到上一個穩定的 commit
git checkout master          # 回到主分支（未動過）

# 或者在 esm-refactor 分支內回滾
git log --oneline -10        # 找到上一個正常的 commit hash
git reset --hard <hash>      # 回到那個時間點
```

**回滾後必須做的事：**
1. 在 ESM_PROGRESS.md 記錄「回滾原因」和「回滾到哪個 commit」
2. 回報 Claude Chat，說明發生了什麼 Bug
3. 等 Claude Chat 分析原因後，才重新開始這個批次

---

## 附錄：三批次檔案完整清單

批次 1：13 個檔案（config/ + lang/ + map/）
批次 2：8 個檔案（systems/ 基礎層）
批次 3：12 個檔案 + index.html（systems/ 核心層 + main.js）
共計：約 34 個 JS 檔案 + 1 個 HTML 檔案

> 注意：實際檔案數量以 Stage 1 Codex 審計結果為準，
> 若發現有遺漏的檔案，Claude Chat 會在開始 Stage 2 前更新此清單。
