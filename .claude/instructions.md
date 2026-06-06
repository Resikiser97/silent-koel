## v0.0.65.0

# Claude Code 自動讀取指引

---

## 每次對話開始前必須依序讀取

1. `QUICKREF.md` ← 版本號、檔案地圖、技術陷阱（每次必讀）
2. `CHANGELOG.md` ← 最新版本與近期變更（每次必讀）
3. `VERSION_RULES.md` ← 版本號規則（每次必讀）
4. `MAIN.md` ← 只在需要查詢特定函式或系統細節時才讀取

---

## 開發規則（每次必須遵守）

- `gameLoop` 裡絕對不能出現字面上的 `\n` 字符
- 數值只能在 `config/` 資料夾修改，不在 `systems/` 寫死數值
- 不使用 ES Modules，全部用傳統 `<script>` 標籤
- 新增任何函式或功能必須更新 `MAIN.md` 對應模組說明
- 函式如果已被移除或合併，必須從 `MAIN.md` 對應區塊刪除
- 新增任何 JS 檔案時，必須同時在該檔案加上 File Header（格式見 SKILL_FILEHEADER.md）

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
gameConfig.js       ← 第九行
```

格式統一為：
```markdown
## v0.0.X.0
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

### Step 2.5 — 更新 CHANGELOG.md 頂部版本號
將 `gameConfig.js` version 改為當前版本號。

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
| 系統行為或設計決策改變 | 第二節對應章節 |
| 新增系統 | 第二節新增對應說明區塊 |
| 待辦功能完成 | 第三節待辦清單打勾或移至已完成 |

### Step 6 — 輸出 sync 報告

每次執行完畢，輸出以下格式：

```
── sync-docs 完成 ──
版本：v0.0.X.0
CHANGELOG.md    ：[已更新｜無需變動] → （一句話說明）
QUICKREF.md     ：[已更新｜無需變動] → （一句話說明）
MAIN.md         ：[已更新｜無需變動] → （一句話說明）
project_summary ：[已更新｜無需變動] → （一句話說明）
gameConfig      ：[已更新｜無需變動] → （一句話說明）
版本號同步       ：✅ 5 個檔案頂部一致
────────────────────
```

---

## 手動觸發 sync-docs

用戶輸入「sync-docs」時，執行相同的 Step 1～6。

---

## 修改完成後的固定順序

1. sync-docs（Step 1～6）
2. `git commit`
3. `git push`（指令見下方）
4. 回覆確認「已推送到 GitHub」

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
6. 回報確認「stable 已同步至 v0.0.X.0」

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

## 圖鑑維護 SOP

### 指令一：「更新圖鑑」

當用戶說「更新圖鑑」時，執行以下步驟：

1. 讀取以下檔案取得最新資料：
   - `config/patchnotes.js`（找出上次圖鑑更新後的新版本條目）
   - `config/organs.js`、`config/creatures.js`、`config/evolution.js`（取得最新數值）
   - `config/compendium_data.js`（取得現有內容）

2. 比對新 patchnotes 的 `added[]` 和 `changed[]` 欄位，判斷哪些變動需要反映在圖鑑中。
   判斷標準：會影響玩家理解遊戲的功能、數值、機制變動才需要更新。純技術修復（fix）不需要。

3. 針對需要更新的條目，修改 `config/compendium_data.js` 對應 entry 的 content（繁中和英文都更新）。
   若是全新功能，判斷應歸屬哪個 section，新增對應 entry。

4. 完成後報告：更新了哪些條目、新增了哪些條目，並列出內容摘要讓用戶確認。

5. 用戶確認無誤後才寫入檔案。

---

### 指令二：「檢查圖鑑」

當用戶說「檢查圖鑑」時，執行以下步驟：

1. 讀取以下檔案：
   - `config/compendium_data.js`（現有圖鑑內容）
   - `config/organs.js`、`config/creatures.js`、`config/evolution.js`、`config/patchnotes.js`（最新資料）
   - `project_summary.md`（設計說明）

2. 逐一比對，找出以下問題：
   - A. **遺漏條目**：config 裡有資料但圖鑑完全沒提到的功能或生物
   - B. **數值過時**：圖鑑內文提到的數值與 config 現有數值不符
   - C. **描述過時**：patchnotes 有 `changed[]` 記錄但圖鑑內文未反映
   - D. **建議新增**：根據玩家理解需求，判斷應該補充說明但目前缺少的主題

3. 輸出一份清單，格式如下：
   ```
   【遺漏】條目名稱 — 說明為何需要新增
   【數值過時】條目名稱 — 舊數值 vs 新數值
   【描述過時】條目名稱 — 說明哪裡需要更新
   【建議新增】主題名稱 — 說明對新玩家的幫助
   ```

4. 詢問用戶：「是否要我現在執行更新？」，等待用戶確認後才進行修改。