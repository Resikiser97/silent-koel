# SKILL — 圖鑑維護 SOP

> 呼叫方式：
> - 「執行 compendium 檢查」→ 檢查圖鑑是否需要更新
> - 「執行 compendium 更新」→ 更新圖鑑內容
> - patchnote.md Skill 寫入後自動觸發「執行 compendium 檢查」

---

## 執行前必讀
1. DOC_INTEGRITY.md（了解文件規範）
2. config/patchnotes.js（最新版本條目）
3. config/compendium_data.js（現有圖鑑內容）

---

## 指令一：「執行 compendium 檢查」

### Step 1 — 讀取資料
- `config/patchnotes.js`（找出上次圖鑑更新後的新版本條目）
- `config/organs.js`、`config/creatures.js`、`config/evolution.js`（最新數值）
- `config/compendium_data.js`（現有內容）
- `project_summary.md`（設計說明）

### Step 2 — 比對，找出問題

| 類型 | 說明 |
|------|------|
| 【遺漏】 | config 裡有資料但圖鑑完全沒提到 |
| 【數值過時】 | 圖鑑數值與 config 現有數值不符 |
| 【描述過時】 | patchnotes changed[] 有記錄但圖鑑未反映 |
| 【建議新增】 | 對玩家理解有幫助但目前缺少的主題 |

判斷標準：影響玩家理解遊戲的功能、數值、機制才需要更新。純技術修復不需要。

### Step 3 — 輸出報告

```
── 圖鑑檢查報告 ──

✅ 無需更新

或

⚠️ 需要更新：
【遺漏】條目名稱 — 說明為何需要新增
【數值過時】條目名稱 — 舊數值 vs 新數值
【描述過時】條目名稱 — 說明哪裡需要更新
【建議新增】主題名稱 — 說明對新玩家的幫助

────────────────────
是否要我現在執行更新？（請回覆「執行 compendium 更新」才執行）
```

---

## 指令二：「執行 compendium 更新」

### Step 1 — 確認更新範圍
依照檢查報告或用戶指定範圍執行。

### Step 2 — 修改 config/compendium_data.js
- 修改對應 entry 的 content（繁中和英文都更新）
- 若是全新功能，判斷歸屬哪個 section，新增對應 entry

### Step 3 — 輸出更新摘要，等待確認

```
── 圖鑑更新摘要 ──
更新條目：[列表]
新增條目：[列表]
內容摘要：[每條一句話]
────────────────────
確認後回覆「確認圖鑑更新」才寫入。
```

### Step 4 — 等用戶回覆「確認圖鑑更新」後才寫入

---

## 觸發時機
- patchnote.md Skill 寫入後自動觸發「執行 compendium 檢查」
- 手動輸入「執行 compendium 檢查」或「執行 compendium 更新」
- 每 5 個 y 版本定期執行一次
