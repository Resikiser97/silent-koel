## v0.0.66.0

# SKILL — Magic Code 掃描與修正 SOP

> 呼叫方式：
> - 「執行 magic-code 全部」→ 掃描所有 systems/ 檔案
> - 「執行 magic-code systems/」→ 只掃 systems/ 資料夾
> - 「執行 magic-code [檔名]」→ 只掃單一檔案

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
ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.12) + ')';

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
// config/ 定義：boss.poisonResist = 0.5
// config/ 定義：char.specialType = 'ranged'
if (c.poisonResist) poisonResist = c.poisonResist;
if (char.isRanged) { ... }
```

### 類型 C：硬寫 UI 文字
UI 文字沒有使用 t('key')。

```javascript
// ❌ 問題
btn.textContent = '開始遊戲';
el.innerText = 'Back';

// ✅ 正確做法
btn.textContent = t('btnStart');
```

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

輸出以下格式，不要自動修改：
```
── Magic Code 掃描報告 ──
掃描範圍：[X 個檔案]
✅ 無問題：[檔案列表]
⚠️ 需要修正：
[檔名] — X 個問題
[行號] 類型A：200 → 建議定義 ATTACK_VISUAL_DURATION = 200 在 config/gameConfig.js
[行號] 類型B：name.includes('蠍王') → 建議在 BOSS_CONFIG 加 poisonResist 欄位
[行號] 類型C：'開始遊戲' → 建議改為 t('btnStart')
待修正共 X 個問題，涉及 X 個檔案
────────────────────────────────
是否要我現在修正？（請回覆「確認修正」才執行）
```

### Step 4 — 等用戶回覆「確認修正」後才執行

修正時：
- 類型 A：在 `config/gameConfig.js` 新增常數，systems/ 改為引用
- 類型 B：在對應 config 物件加入欄位，systems/ 改為讀取欄位
- 類型 C：確認語言包已有對應 key 才修改，沒有則先問用戶

---

## 觸發時機

以下情況建議執行：
- 新增功能完成後
- 新增角色或 Boss 後
- 大型重構完成後
- 定期維護（每 5 個版本一次）
