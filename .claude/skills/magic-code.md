---
name: magic-code
description: Scan silent-koel systems/*.js for magic numbers, magic names, and hardcoded UI text; report findings with severity and wait for explicit confirmation before editing.
---

# SKILL — Magic Code 掃描與修正 SOP

> 呼叫方式：
> - 「執行 magic-code 全部」→ 掃描所有 systems/ 檔案
> - 「執行 magic-code systems/」→ 只掃 systems/ 資料夾
> - 「執行 magic-code [檔名]」→ 只掃單一檔案

---

## 執行前必讀
1. DOC_INTEGRITY.md（了解文件規範）
2. ARCH.md（了解模組結構與 config 位置）

本 Skill 採四階段審查：讀文件確認範圍 → 高層分類（模組類型）→ 逐行掃描三類問題 → 輸出報告等待確認。

---

## 掃描範圍

**掃描：**
- systems/*.js

**不掃描：**
- config/（這裡是資料來源，不是問題所在）
- lang/（語言包本身是正確做法）
- CSS 樣式字串

---

## 三類問題定義

### 類型 A：Magic Number
systems/ 裡出現的裸數值，且該數值屬於遊戲邏輯（不是 CSS 樣式）。

```javascript
// ❌ 問題
if (Date.now() - p.attackVisual < 200) { ... }

// ✅ 正確做法
// config/ 定義：ATTACK_VISUAL_DURATION = 200
if (Date.now() - p.attackVisual < ATTACK_VISUAL_DURATION) { ... }
```

### 類型 B：Magic Name
用名稱字串做邏輯判斷，而非讀取 config 欄位。

```javascript
// ❌ 問題
if (c.name.includes('蠍王')) poisonResist = 0.5;
if (gameState.player.characterId === 'koel') { ... }

// ✅ 正確做法
if (c.poisonResist) poisonResist = c.poisonResist;
if (char.isRanged) { ... }
```

### 類型 C：硬寫 UI 文字
UI 文字沒有使用 t('key')。

```javascript
// ❌ 問題
btn.textContent = '開始遊戲';

// ✅ 正確做法
btn.textContent = t('btnStart');
```

---

## Severity 定義

- [blocking]：硬寫 UI 文字破壞 i18n；或硬寫應由 config 管理的核心遊戲規則
- [important]：magic name（角色/Boss 名稱判斷）、會影響新增角色/新 Boss 擴充的 magic number
- [nit]：低風險視覺微調數字，不影響邏輯正確性
- [suggestion]：可整理但目前不急

## What Not To Review

- 不掃描 config/（這裡是資料來源，不是問題所在）
- 不掃描 lang/（語言包本身是正確做法）
- 不掃 CSS 樣式字串，除非該數字實際控制遊戲邏輯
- 不把 0、1、-1、array index、boolean flag、簡單百分比基準自動視為 magic number
- 不處理 formatter / lint
- 不重構無關邏輯
- 不確定就標記「需確認」，不要猜
- 修改前必須先報告，等待使用者明確說「確認修正」才執行

---

## 執行步驟

### Step 1 — 確認掃描範圍
依照呼叫方式決定要處理的檔案清單。

### Step 2 — 掃描三類問題
對範圍內每個檔案逐一掃描，記錄：
- 問題類型（A / B / C）
- 所在行號
- 原始代碼片段
- 建議修法

### Step 3 — 輸出報告，等待確認

```
── Magic Code 掃描報告 ──
掃描範圍：[X 個檔案]

✅ 無問題：[檔案列表]

⚠️ 需要修正：
[severity][類型] [檔名]:行號
  原始：[代碼片段]
  原因：[說明]
  建議：[修法]
  風險：[低 / 中 / 高，需確認事項]

範例：
  [important][類型A] systems/player.js:123
    原始：Date.now() - p.attackVisual < 200
    原因：攻擊視覺持續時間屬於遊戲邏輯，不應硬寫在 systems/
    建議：新增 ATTACK_VISUAL_DURATION 到 config/gameConfig.js
    風險：低，需確認現有 config 命名風格

  [blocking][類型C] systems/ui.js:45
    原始：btn.textContent = '開始遊戲'
    原因：硬寫 UI 文字破壞 i18n
    建議：改為 t('btnStart')，確認 lang/ 已有對應 key
    風險：中，需先確認語言包

待修正共 X 個問題，涉及 X 個檔案
────────────────────
是否要我現在修正？（請回覆「確認修正」才執行）
```

### Step 4 — 等用戶回覆「確認修正」後才執行

修正時：
- 類型 A：新增常數到最接近的 config 資料來源（依數值語意判斷，例如生物相關放 config/creatures.js、器官相關放 config/organs.js）；若無明確歸屬，才考慮 config/gameConfig.js。
- 類型 B：在對應 config 物件加入欄位，systems/ 改為讀取欄位
- 類型 C：確認語言包已有對應 key 才修改，沒有則先問用戶

---

## 觸發時機

以下情況建議執行：
- 新增功能完成後
- 新增角色或 Boss 後
- 大型重構完成後
- 定期維護（每 5 個 y 版本一次）