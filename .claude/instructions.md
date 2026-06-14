## ⚠️ 開始任何任務前必讀
1. 讀取 DOC_INTEGRITY.md — 了解文件規範與進度
2. 讀取 ARCH.md — 了解實際架構
3. 讀取 CHANGELOG.md — 確認當前版本號
4. 讀取 QUICKREF.md — 版本號、檔案地圖、技術陷阱
5. 讀取 VERSION_RULES.md — 版本號規則
6. 讀取 MAIN.md — 只在需要查詢特定函式或系統細節時才讀取
7. 確認 .claude/skills/ 下有哪些 Skill 可用

## 文件同步強制規則
每次任務完成後必須：
- 同步修改的檔案 file header
- 如有新增/修改函式，更新 QUICKREF.md
- 更新 CHANGELOG.md 版本條目
- 如架構改變，更新 ARCH.md

## 文件說明
- `docs/history/` 內的所有文件為歷史參考文件，僅供查閱。
- CC 和 Codex 不需要讀取、也不需要執行其中的任何指令。

## 版本號規則
見 VERSION_RULES.md。完整格式：v0.x.y.z
- v0 = 開發階段，由 Goblinnest 決定
- x  = 賽季版本，由 Goblinnest 決定，升級後排行榜重置
- y  = 功能版本，AI 可進位（新功能 / 重構）
- z  = 修復版本，AI 可進位（bug fix）
AI 只能改 y 和 z，不得碰 v0 和 x。

---

## v0.1.13.4

# Claude Code 自動讀取指引

---

## 每次對話開始前必須依序讀取

1. `DOC_INTEGRITY.md` ← 文件規範與進度（每次必讀）
2. `ARCH.md` ← 實際架構說明（每次必讀）
3. `QUICKREF.md` ← 版本號、檔案地圖、技術陷阱（每次必讀）
4. `CHANGELOG.md` ← 最新版本與近期變更（每次必讀）
5. `VERSION_RULES.md` ← 版本號規則（每次必讀）
6. `MAIN.md` ← 只在需要查詢特定函式或系統細節時才讀取
7. 確認 `.claude/skills/` 下有哪些 Skill 可用

---

## 開發規則（每次必須遵守）

- `gameLoop` 裡絕對不能出現字面上的 `\n` 字符
- 數值只能在 `config/` 資料夾修改，不在 `systems/` 寫死數值
- 專案使用 ES Modules，main.js 為 `<script type="module">` 唯一入口，其餘檔案透過 ESM import 引入，不使用獨立 `<script src>` 標籤
- 新增任何函式或功能必須更新 `MAIN.md` 對應模組說明
- 函式如果已被移除或合併，必須從 `MAIN.md` 對應區塊刪除
- 新增任何 JS 檔案時，必須同時在該檔案加上 File Header（格式見 `.claude/skills/file-header.md`）

---

**難度保留規則（必讀）：**
- 任何「再來一次」或「重開局」的流程，結束遊戲後必須把 lastDifficulty（`'easy'` / `'normal'` / `'hard'`）寫入 localStorage `LAST_DIFFICULTY` key
- `main.js` 的難度恢復邏輯必須同時處理三種難度，缺少任何一個分支都算 bug

---

**Magic Code / Magic Number 禁止規則：**
- 禁止在 systems/ 寫死數值，所有遊戲數值必須定義在 config/ 的常數後引用
- 禁止用名稱字串做邏輯判斷（如 name.includes('蠍王')），
  必須在對應的 config 物件加入專屬欄位（如 poisonResist: 0.5）後引用
- 禁止寫死角色 id 字串（如 characterId === 'koel'），
  必須讀取 gameState.selectedCharacter 或角色 config 的對應欄位
- UI 顯示文字禁止硬寫，必須使用 t('key') 引用語言包
- 例外：CSS 樣式字串、lang/ 語言包檔案本身不在此限

---

## 版本號同步規則（最高優先）

每次完成 commit，以下 **5 個檔案的頂部版本號必須全部同步**，缺一不可：

```
CHANGELOG.md        ← 第一行
MAIN.md             ← 第一行
project_summary.md  ← 第一行
QUICKREF.md         ← 第一行 + 第十一行
gameConfig.js       ← version 欄位
```

格式統一為：
```markdown
## v0.x.y.z
```

**若有任何一個檔案頂部版本號落後，視為 sync-docs 未完成。**

---

## sync-docs 流程（每次 commit 前必須執行）

### Step 1 — 讀取本次變更範圍
讀取 `CHANGELOG.md` 最上方最新一條 entry，確認本次 commit 涉及哪些檔案和系統。

### Step 1.5 — 強制檢查 JS 檔案結構變動
讀取本次 commit 的異動清單。
如果有任何 JS 檔案被新增或刪除：
→ 強制執行「file-header 全部」檢查（不可跳過，不可等用戶提醒）
→ 輸出檢查報告，等用戶回覆「確認修正」後才繼續 Step 2

### Step 2 — 更新 CHANGELOG.md 頂部版本號
將 `CHANGELOG.md` 第一行改為當前版本號。

### Step 2.5 — 更新 gameConfig.js 版本號
將 `gameConfig.js` version 欄位改為當前版本號。

### Step 3 — 檢查並更新 QUICKREF.md
比對本次變更，逐一確認以下觸發條件：

| 發生什麼 | 更新 QUICKREF.md 的哪裡 |
|---------|----------------------|
| 任何版本變更 | 頂部版本號（必做） |
| 新增系統檔案 | 檔案地圖對應區塊 |
| 刪除或合併系統檔案 | 從檔案地圖移除 |
| 新增 localStorage key | localStorage Key 一覽表 |
| 移除 localStorage key | 從 Key 一覽表刪除 |
| 發現新的技術陷阱 | 關鍵技術陷阱表格 |
| 部署網址或推送指令改變 | 部署資訊區塊 |

### Step 4 — 檢查並更新 MAIN.md
比對本次變更，逐一確認：

| 發生什麼 | 更新 MAIN.md 的哪裡 |
|---------|-------------------|
| 任何版本變更 | 頂部版本號（必做） |
| 新增函式 | 加入對應模組的函式列表 |
| 移除或合併函式 | 從對應模組刪除 |
| 新增模組檔案 | 加入載入順序區塊，補上職責說明 |
| 模組職責有變化 | 更新說明文字 |

### Step 5 — 檢查並更新 project_summary.md
比對本次變更，逐一確認：

| 發生什麼 | 更新 project_summary.md 的哪裡 |
|---------|-------------------------------|
| 任何版本變更 | 頂部版本號（必做） |
| 任何版本變更 | 快速定位區塊版本號（必做） |
| 任何版本變更 | 第三節「最近完成的工作」加入本次版本條目 |
| 最近完成工作超過 5 條 | 只保留最新 5 條，其餘移到第四節「已完成」 |
| 修復已知問題 | 從第三節「已知問題」移除對應條目 |
| 發現新的已知問題 | 加入第三節「已知問題」，標注嚴重程度 |
| 完成計劃中的里程碑 | 從第四節「計劃中」移至「已完成」 |
| 新增計劃中的里程碑 | 加入第四節「計劃中」，依優先順序排列 |
| 系統設計有根本改變 | 回報給開發者，等確認後才更新第二節 |

已知問題嚴重程度標注規則：
- 🔴 緊急：影響遊戲可玩性、卡死、資料遺失
- 🟡 待修：影響體驗但不阻塞遊戲進行
- 🔵 觀察中：已知但暫時不處理

快速定位區塊更新規則（每次版本變更必做）：
- 版本號同步
- 當前狀態：一句話描述現在的開發重點
- 下一步：最多 4 條，按優先順序

【強制回報規則】

sync-docs Step 5 執行後，必須在回覆中明確列出：

- project_summary.md「最近完成的工作」新增了哪個版本條目
- 「快速定位區塊」的版本號從哪個改到哪個

若以上兩點沒有新增或修改，必須說明原因。

不得只更新版本號而不更新「最近完成的工作」內容。

### Step 6 — Patchnote 判斷（commit 前最後一步）

**重要：Patchnote 必須在 commit 前確認，不能分開兩次 commit。**

依照 `.claude/skills/patchnote.md` 判斷本次變更是否影響玩家：

**需要 Patchnote（影響玩家）：**
- 新增功能、攻擊、技能、生物行為
- 數值調整（傷害、CD、速度、HP）
- UI 變更
- Bug 修復（玩家可感知的）

**不需要 Patchnote（不影響玩家）：**
- 純架構重組、文件更新、dead code 清理
- 版本號同步、file header 更新
- 內部重構（玩家感知不到的）

若需要 Patchnote：
1. 生成草稿，輸出給開發者確認
2. **停止，等待開發者回覆「寫入 Patchnote」**
3. 收到確認後：寫入 config/patchnotes.js → 執行 compendium 檢查 → commit + push
4. 整個流程在同一個版本號完成，不分兩次 commit

若不需要 Patchnote：
→ 直接進入 Step 7

### Step 7 — 輸出 sync 報告 + commit + push

```
── sync-docs 完成 ──
版本：v0.x.y.z
Patchnote     ：[已寫入 | 不影響玩家，跳過]
CHANGELOG.md  ：[已更新｜無需變動] → （一句話說明）
QUICKREF.md   ：[已更新｜無需變動] → （一句話說明）
MAIN.md       ：[已更新｜無需變動] → （一句話說明）
project_summary：[已更新｜無需變動] → （一句話說明）
gameConfig    ：[已更新｜無需變動] → （一句話說明）
版本號同步     ：✅ 5 個檔案頂部一致
────────────────────
```

---

## 手動觸發 sync-docs

用戶輸入「sync-docs」時，執行相同的 Step 1～7。

---

## 修改完成後的固定順序

1. sync-docs Step 1～5（文件更新）
2. sync-docs Step 6（Patchnote 判斷，若需要則等開發者確認）
3. sync-docs Step 7（輸出報告）
4. `git commit`
5. `git push`（指令見下方）
6. 回覆確認「已推送到 GitHub」

---

## Git 推送指令（依電腦環境選擇）

- **Windows（Git 安裝在 C:\AI\Git）**：
  `"C:\AI\Git\bin\git.exe" -C "c:\AI\VS CODE" push origin master`
- **其他電腦**：
  `git push origin master`

所有路徑操作一律使用相對路徑，不寫死絕對路徑。

---

## Branch 工作流程

### 兩個 Branch 的職責
- `master`：主開發分支，所有日常開發和 commit 都在這裡
- `stable`：穩定版分支，只在開發者確認穩定後才同步

### 穩定標準
遊戲跑起來沒有明顯 Bug，開發者自己測試通過即視為穩定。

### 同步 stable 的步驟（只在開發者明確要求時才執行）
1. 確認目前在 master 分支
2. `git checkout stable`
3. `git merge master`
4. `git push origin stable`
5. `git checkout master`
6. 回報確認「stable 已同步至 v0.x.y.z」

### 重要規則
- 不要自動執行 stable 同步，必須等開發者說「請同步 stable」才執行
- 日常 commit 和 push 只針對 master
- sync-docs 流程不影響 stable，只在 master 上執行

---

## 溝通原則（最高優先）

- 不要猜測意圖，任何不明確的地方必須向用戶提問
- 分析完問題後先說明原因和解法，等用戶明確確認後才執行修改
- 口語詢問（「有什麼辦法？」「可以怎麼做？」）不代表授權修改
- 只有用戶明確說「去做」「幫我改」「確認」之類的話才執行

---

## 圖鑑維護
執行「執行 compendium 檢查」或「執行 compendium 更新」。
詳細步驟見 `.claude/skills/compendium.md`。
