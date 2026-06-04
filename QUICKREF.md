## v0.1.3.4

# QUICKREF — Claude Code 快速參考索引

> 此檔案是 Claude Code 每次啟動的快查手冊。
> 需要函式細節請查 MAIN.md；需要設計決策請查 project_summary.md。

---

## 當前狀態
- 版本：**v0.1.3.4**
- SAVE_VERSION：`"1.1"`

---

## 技術架構
```
語言：純 HTML + JavaScript + CSS，無框架
渲染：HTML5 Canvas 2D（遊戲世界）+ HTML div overlay（UI）
FPS：Fixed Timestep 60FPS（FIXED_DELTA = 1000/60）

邏輯解析度：
  桌機：1600×900
  手機橫向：960×540
  手機直向：540×960

手機縮放：CSS transform: scale()
  MOBILE_GAME_SCALE = 0.6（定義在 _applyMobileScale() 上方）
  調整此值可統一縮放，不需改其他系統

模組載入：傳統 <script src> 標籤，不使用 ES Modules
手機判斷：gameState.isMobile / gameState.orientation
```

---

## 部署資訊
| 環境 | 網址 |
|------|------|
| GitHub | https://github.com/Resikiser97/silent-koel |
| Vercel Master（測試） | silent-koel.vercel.app |
| Vercel Stable（穩定） | silent-koel-git-stable-goblinnest-s-projects.vercel.app |
| CC 推送指令（Windows） | `"C:\AI\Git\bin\git.exe" -C "c:\AI\VS CODE" push origin master` |

---

## 檔案地圖

### 根目錄
| 檔案 | 職責 |
|------|------|
| `index.html` | HTML 結構 + CSS + script 載入順序 |
| `main.js` | isGamePaused / gameLoop / initializeGame / window.onload |
| `lang.js` | LANG_LIST、LANG 字典、applyLanguage()、t(key, params?) |
| `MAIN.md` | 完整模組架構、函式列表、跨模組依賴 |
| `CHANGELOG.md` | 所有版本紀錄（最新在最上方） |
| `VERSION_RULES.md` | 版本號更新規則 |
| `.claude/instructions.md` | Claude Code 行為規則與 SOP |

### config/
| 檔案 | 職責 |
|------|------|
| `gameConfig.js` | GAME_INFO（版本號、SAVE_VERSION）、AUDIO_FILES |
| `characters.js` | CHARACTERS（角色定義常數） |
| `organs.js` | ORGANS（15種普通）+ HIDDEN_ORGANS（4種）+ poisonSac |
| `creatures.js` | CREATURE_CONFIG、ELITE_CONFIG、BOSS_CONFIG |
| `evolution.js` | EVOLUTION_PATHS（各路線 Lv1~5）、SKILLS（9種）、COMBOS（5種） |
| `patchnotes.js` | PATCH_NOTES（版本更新公告，最新置頂） |
| `supabase.js` | Supabase API（排行榜、雲端存檔） |

### lang/
| 檔案 | 職責 |
|------|------|
| `zh-TW.js` | 繁體中文語言包 |
| `en.js` | 英文語言包（fallback） |

### systems/
| 檔案 | 職責 |
|------|------|
| `gameState.js` | DEFAULT_SETTINGS、gameState 物件、canvas/ctx、MAP 常數 |
| `utils.js` | drawArrow / drawHealthBar / drawNameTag / drawGlowEffect / applyTenacity |
| `audio.js` | AudioManager（playMusic / playSfx / refreshMusicVolume） |
| `camera.js` | updateCamera / worldToScreen / _updateMobileCameraZoom |
| `input.js` | handleKeyDown / handleKeyUp（含 Z 鍵自動攻擊 toggle） |
| `map.js` | generateTerrain / buildTerrainCanvas / drawTerrain |
| `spawning.js` | 生物／果子／樹木生成 |
| `player.js` | updatePlayerMovement / checkFruitCollision / 靈敏知覺算法 |
| `tutorial.js` | showTutorial / spawnTutorialStump / handleTutorialStumpKill |
| `combat.js` | playerAttack / applyDamageToPlayer / updateStatusEffects / 白骨系統 |
| `organs.js` | showOrganSelection / handleEliteKill / applyOrganEffects |
| `evolution.js` | buildSkillTreeOverlay / upgradeSkill / applyEvolutionEffects |
| `creatures.js` | updateNeutralCreatures / updateHostileCreatures |
| `elite.js` | spawnEliteCreature / updateEliteCreature |
| `boss.js` | spawnBoss / updateBoss / showVictory |
| `mutation.js` | initMutationData / applyMutationEffects / showMutationPanel |
| `daynight.js` | getDayNightPhaseIndex / updateDayNightCycle / showGameOver |
| `chat.js` | 聊天室系統（帳號登入 / Realtime / GM指令 / 彩色字 / 置頂訊息） |
| `leaderboard.js` | 排行榜面板 / 分數提交 / 難度狀態管理 |
| `mobile.js` | 裝置偵測 / 手機縮放 / 搖桿 / 攻擊區 / 觸控疊加層 |
| `hud.js` | drawGame 主渲染 / HUD 更新 / 小地圖 / 上方血條 |
| `ui.js` | 面板系統（首頁/設定/地圖選擇/圖鑑/故事書/版本公告）/ Tooltip / 語言切換 |

### map/
| 檔案 | 職責 |
|------|------|
| `map.md` | 地形設計文件 |
| `easymap.js` | EASY_MAP（簡單難度；dogElites 三犬精英怪開啟） |
| `normalmap.js` | NORMAL_MAP（普通難度：生物×1.5、aggroRange 400、巨人化/殺手化/Boss回血/dogElites 開啟） |
| `hardmap.js` | HARD_MAP（困難難度：生物×2.5、aggroRange 600、三隼精英怪/黑色獵人 Boss 開啟） |

---

## localStorage Key 一覽
| Key | 說明 |
|-----|------|
| `playerSkills` | 技能樹等級（各技能 0~5） |
| `skillPoints` | 可用技能點 |
| `savedOrgans` | 死後保留的普通器官 |
| `savedHiddenOrgans` | 死後保留的隱藏器官 |
| `lastRunOrgans` | 上局所有器官記錄（首頁補選用） |
| `gameSettings` | `{ language, volume, keys, deviceMode, autoAttack }` |
| `SAVE_VERSION` | 目前 `"1.1"`（不一致時清除技能/器官存檔） |
| `mutationData` | 突變器官等級和點數（永久保留，不受 SAVE_VERSION 清除） |
| `lastDifficulty` | 上一局難度（`'easy'`/`'normal'`） |
| `tutorialCompleted` | 移動教學是否完成 |
| `tutorialCombatDone` | 戰鬥教學是否完成 |
| `hasPlayedBefore` | 是否曾遊玩過（控制初次進入流程） |
| `mutationSkills` | 變異技能樹等級與技能點（跨局永久，v0.0.69.0） |
| `chapter2Unlocked` | 故事書第二章是否解鎖（普通難度通關後 = `'true'`） |
| `clearCount_easy` / `clearCount_normal` / `clearCount_hard` | 各難度通關次數 |
| `clearCount_char_*` | 各角色通關次數（v0.0.69.0） |
| `killCount_bear` / `killCount_shark` / `killCount_scorpion` / `killCount_hunter` | Boss 擊殺次數 |
| `hunterSlayerUnlocked` | 是否曾擊殺黑色獵人（`'true'`，v0.1.0.0） |

---

## 關鍵技術陷阱
| 陷阱 | 規則 |
|------|------|
| `MOBILE_GAME_SCALE` | 固定為 0.6，不要寫死數值 |
| `realPlayTime` | 單位是毫秒，上傳排行榜用 `Math.floor(realPlayTime / 1000)` 轉秒 |
| `resumePlayTimer()` | 無條件啟動 |
| `pausePlayTimer()` | 有檢查 `_playTimerStart !== null` 才暫停 |
| `autoAttack` | 任何版本更新都不重置，不受 `SAVE_VERSION` 控制 |
| 毒傷 tick | 用 `c.lastPoisonTick += 1000`，不是 `= now`，避免累積誤差 |
| 器官選擇順序 | `showHiddenOrganSelection()` 必須在 `addXP()` 之前呼叫，否則界面疊層 |
| organSelectionActive | `gameState.organSelectionActive = false` 必須在 `showOrganSelection()` 之前設定 |
| 開發者模式 | 暗號 `77777778`，使用後 `gameState.devModeUsed = true`，禁止上傳排行榜 |
| CC 效果新增 | 必須同步更新 4 個位置：`updateNeutralCreatures`、`updateHostileCreatures`、`updateEliteCreature`（elite.js）、`updateBoss`（boss.js） |
| 數值修改 | 只能在 `config/` 資料夾修改，不要在 systems/ 寫死數值 |
| gameLoop | 絕對不能出現字面上的 `\n` 字符 |
| 版本號格式 | 四段 `v0.x.y.z`；排行榜 `version_order` 取第二段 x，同一個 x 的記錄互相競爭（x 升版時排行榜重置） |
