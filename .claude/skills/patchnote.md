# SKILL — Patchnote 生成 SOP

> 呼叫方式：
> - sync-docs Step 6 自動觸發（每次 commit 前）
> - 「執行 patchnote」→ 手動觸發

**重要原則：Patchnote 必須與代碼修改在同一個 commit，不能分開兩次 push。**

---

## 執行前必讀
1. DOC_INTEGRITY.md（了解文件規範）
2. CHANGELOG.md（確認本次版本號與變更內容）
3. config/patchnotes.js（確認現有格式）

---

## 觸發條件

判斷本次變更是否影響玩家：

**需要生成 Patchnote（影響玩家）：**
- 新增功能、攻擊、技能、生物行為
- 數值調整（傷害、CD、速度、HP）
- UI 變更
- Bug 修復（玩家可感知的）

**不需要生成 Patchnote（不影響玩家）：**
- 純架構重組、文件更新、dead code 清理
- 版本號同步、file header 更新
- 內部重構（玩家感知不到的）

---

## 執行步驟

### Step 1 — 讀取本次變更
從 CHANGELOG.md 最新條目確認本次所有變更。

### Step 2 — 判斷是否需要 Patchnote
依照觸發條件判斷。
若不需要，輸出「本次變更不影響玩家，跳過 Patchnote」並結束。

### Step 3 — 生成草稿
依照 config/patchnotes.js 現有格式生成新條目草稿：

```javascript
{
  version: 'v0.x.y.z',
  date: 'YYYY-MM-DD',
  added: [
    // 新增功能，玩家語言描述
  ],
  changed: [
    // 數值調整、機制改變
  ],
  fixed: [
    // Bug 修復
  ]
}
```

規則：
- 用玩家看得懂的語言，不用技術術語
- 繁體中文
- 每條一句話，簡潔
- 純技術修復不列入
- 空的陣列（added/changed/fixed）可省略

### Step 4 — 輸出草稿，停止等待確認

```
── Patchnote 草稿 v0.x.y.z ──

added:
  - [新增內容描述]

changed:
  - [變更內容描述]

fixed:
  - [修復內容描述]

────────────────────
⚠️ 確認後回覆「寫入 Patchnote」才執行寫入與 commit。
在此之前不執行任何 commit 或 push。
```

### Step 5 — 等開發者回覆「寫入 Patchnote」後才執行

收到確認後，依序執行：
1. 寫入 config/patchnotes.js（插入陣列頂部）
2. 執行「執行 compendium 檢查」（見 compendium.md）
3. 繼續 sync-docs Step 7（輸出報告 + commit + push）

整個流程在**同一個版本號**完成。

---

## 觸發時機
- sync-docs Step 6（每次 commit 前自動判斷）
- 手動輸入「執行 patchnote」