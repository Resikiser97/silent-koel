## v0.1.26.0 - 2026-06-17

### 新增
- `config/creatures.js` / `systems/creatures.js`：新增生物 AI 手感第一版設定與共用近戰攻擊節奏，所有近戰生物攻擊改為前搖、命中、後搖三段式，並在 Canvas 上顯示攻擊提示圈（前搖紅圈、命中白圈、後搖灰圈）
- `systems/creatures.js`：新增通用生物分離邏輯，肉食性敵人與鬣狗會保持體積距離避免重疊，草食性生物允許較近距離抱團，巨人/Alpha 使用更高推開權重
- `config/creatures.js` / `systems/creatures.js`：新增鬣狗第二階段隊伍行為，1~3 隻維持試探輪流，4 隻以上改以玩家移動方向為基準包圍左右/後方並保留前方缺口；包圍型低血鬣狗優先不當攻擊者
- `config/creatures.js` / `systems/creatures.js`：新增巨人/Alpha 隊伍 regroup 行為，低血或離隊太遠的巨人隊伍成員會往 Alpha 或隊伍中血量較穩定的核心靠攏
- `config/creatures.js` / `systems/elite.js`：三犬精英近戰接入前搖、命中窗、後搖三段式提示，並改用體型計算的近戰命中範圍；傷害沿用主線精英數值公式

### 調整
- `systems/creatures.js`：鬣狗 4 隻以上包圍時改為依目前位置重新分配角色，最適合目前攻擊角度且非低血/退回中的鬣狗會成為 Attacker；非攻擊者選最近的外圈 slot，不再因玩家突然轉向而強制穿過玩家中心換位
- `systems/player.js` / `systems/input.js` / `systems/mobile.js` / `main.js`：阿奇爾子彈半徑改隨玩家體型等比例縮放，3 格充能發射時子彈半徑額外 ×2；手動/手機/自動發射統一使用同一套充能傷害、暴擊、射程與子彈半徑公式
- `systems/creatures.js`：近戰前搖期間會以慢速追蹤目標，命中瞬間仍重新檢查距離；目標離太遠會取消攻擊，避免紅圈無限維持或隔空命中
- `systems/creatures.js`：命中階段改為真正的 Strike window，白圈期間不會立刻扣血，時間跑完時才做最終距離判定並閃一下出手光，之後進入後搖 CD
- `config/creatures.js`：套用新前中後搖數據（普通肉食 150/100/1150ms、鬣狗 100/100/1300ms、草食 300/200/1000ms、巨人 350/150/1000ms、Alpha 200/150/1150ms）
- `systems/creatures.js`：攻擊提示灰圈到達 recovery 結束時間會立即清除，避免怪物已恢復卻仍顯示後搖圈造成誤導
- `systems/creatures.js`：草食生物反擊時只在玩家位於攻擊距離內出手；玩家離開攻擊距離後回到原本行為，不再追著玩家打
- `systems/creatures.js`：生物分離改為比例制，草食可壓到約 50% 體積距離抱團，肉食同類維持約 100% 體積距離避免重疊
- `systems/creatures.js`：肉食攻擊草食時改用生物擊殺清理流程，會正確移除草食並生成屍體供肉食進食，不會誤發玩家擊殺 XP
- `systems/creatures.js`：鬣狗 pack range / keep range / leave grace / attack turn cooldown 改讀 `CREATURE_AI_CONFIG.hyena`，不再在系統檔硬寫數值

---

## v0.1.25.9 - 2026-06-17

### ä¿®å¾©
- `map/normalmap.js`ï¼šç²¾è‹±æ€ª hpMultiplier èª¿æ•´ï¼ˆç¬¬1å¤œ 5â†’6ã€ç¬¬2å¤œ 10â†’12ã€ç¬¬3å¤œ 20â†’18ï¼‰ï¼Œä½¿æ™®é€šé›£åº¦ä¸‰å¤œ HP å°é½Šå…¬å¼ï¼ˆ450/900/1350ï¼‰
- `map/hardmap.js`ï¼šç²¾è‹±æ€ª hpMultiplier èª¿æ•´ï¼ˆç¬¬1å¤œ 8â†’7ã€ç¬¬2å¤œ 15â†’14ã€ç¬¬3å¤œ 25â†’21ï¼‰ï¼Œä½¿å›°é›£é›£åº¦ä¸‰å¤œ HP å°é½Šå…¬å¼ï¼ˆçŠ¬ 875/1750/2625ã€éš¼ 613/1225/1838ï¼‰
- `systems/elite.js`ï¼š`_spawnHunterElite()` ç§»é™¤å›°é›£åœ°åœ–å›ºå®šæ•¸å€¼åˆ†æ”¯ï¼ˆ`isHardMap` åˆ¤æ–·ï¼‰ï¼Œä¸‰é›£åº¦çµ±ä¸€ä½¿ç”¨ã€Œä¾å¤œæ™šå€çŽ‡ï¼‹åœ°åœ–é›£åº¦å€çŽ‡ã€å…¬å¼è¨ˆç®— HP/å‚·å®³/é€Ÿåº¦ï¼›é€Ÿåº¦å…¬å¼ç”± `base.speed + speedBonus` æ”¹ç‚º `base.speed * 3 * speedMult + speedBonus`ï¼Œå›°é›£é›£åº¦ç¾åœ¨æ­£ç¢ºå¥—ç”¨åœ°åœ– speedMultiplier
- `systems/elite.js`ï¼šæ–°å¢žçŠ¬ï¼éš¼å·®ç•°åŒ–å€çŽ‡ï¼ˆéš¼æ— HP Ã—0.7ã€å‚·å®³ Ã—1.3ï¼ŒçŠ¬æ—ä¸è®Šï¼‰ï¼Œé€éŽ `eliteType.includes('Falcon')` åˆ¤æ–·ç‰©ç¨®ï¼Œä¸å¯«æ­» id å­—ä¸²
- `systems/elite.js`ï¼š`_updateHunterEliteChase()` çŠ¬æ—è¿‘æˆ°æ”»æ“Šç”± `cfg.damage`ï¼ˆå›ºå®šå€¼ï¼‰æ”¹ç‚º `elite.damage`ï¼ˆå…¬å¼è¨ˆç®—å€¼ï¼‰ï¼Œç¢ºä¿å¯¦éš›å‚·å®³èˆ‡ç”Ÿæˆæ•¸å€¼ä¸€è‡´
- `systems/elite.js`ï¼š`_handleHunterEliteKill()` çŽå‹µæŸ¥è¡¨å¾žå–®å±¤ `HUNTER_ELITE_REWARDS[starTier]` æ”¹ç‚ºä¾ `gameState.currentMap.difficulty` æŸ¥ä¸‰å¼µå­è¡¨
- `config/creatures.js`ï¼š`HUNTER_ELITE_REWARDS` å¾žå–®å±¤æ˜Ÿç´šè¡¨é‡æ§‹ç‚ºä¸‰é›£åº¦å­è¡¨ï¼ˆeasy/normal/hardï¼‰ï¼Œç°¡å–®é›£åº¦ä¸çµ¦è®Šç•°é»žï¼ˆmutPts: 0ï¼‰
- `config/gameConfig.js`ï¼š`HARD_ELITE_CONFIG` çš„ `hp`/`damage` æ¬„ä½åŠ ä¸Šå»¢æ£„èªªæ˜Žï¼Œæ¨™è¨»å¯¦éš›å¼·åº¦ç”±å…¬å¼æ±ºå®š
- `config/compendium_data.js`ï¼šã€Œâ­ç²¾è‹±æ€ªã€æ¢ç›®å…¨é¢åŒæ­¥â€”â€”çµæ§‹å¼•ç”¨ç”± `HUNTER_ELITE_REWARDS[n]` æ”¹ç‚ºä¸‰é›£åº¦å­è¡¨ï¼ˆeasy/normal/hardï¼‰ï¼›æ–°å¢žå‚·å®³æ¬„ä½é¡¯ç¤ºï¼›å›°é›£é›£åº¦æ”¹ç‚ºå‹•æ…‹è¨ˆç®—å…¬å¼å€¼ï¼ˆ`hDogHp/hDogDmg/hFalconHp/hFalconDmg`ï¼‰å–ä»£èˆŠçš„ `hc.specterDog.hp` ç­‰å›ºå®šå€¼å¼•ç”¨ï¼›ä¸‰æ®µï¼ˆç°¡å–®/æ™®é€š/å›°é›£ï¼‰æ“Šæ®ºçŽå‹µåˆ†é–‹é¡¯ç¤º

### æ•¸å€¼å°ç…§ï¼ˆä¿®æ­£å¾Œï¼‰
| é›£åº¦ | å¤œæ™š | HP | å‚·å®³ | é€Ÿåº¦ |
|---|---|---|---|---|
| ç°¡å–® | â˜… | 250 | 12 | 3.3 |
| ç°¡å–® | â˜…â˜… | 375 | 14 | 3.5 |
| ç°¡å–® | â˜…â˜…â˜… | 500 | 16 | 3.7 |
| æ™®é€š | â˜… | 450 | 12 | 4.8 |
| æ™®é€š | â˜…â˜… | 900 | 17 | 5.2 |
| æ™®é€š | â˜…â˜…â˜… | 1350 | 23 | 6.0 |
| å›°é›£ï¼ˆçŠ¬ï¼‰ | â˜… | 875 | 16 | 6.5 |
| å›°é›£ï¼ˆçŠ¬ï¼‰ | â˜…â˜… | 1750 | 24 | 7.0 |
| å›°é›£ï¼ˆçŠ¬ï¼‰ | â˜…â˜…â˜… | 2625 | 32 | 8.0 |
| å›°é›£ï¼ˆéš¼ï¼‰ | â˜… | 613 | 21 | 6.5 |
| å›°é›£ï¼ˆéš¼ï¼‰ | â˜…â˜… | 1225 | 31 | 7.0 |
| å›°é›£ï¼ˆéš¼ï¼‰ | â˜…â˜…â˜… | 1838 | 42 | 8.0 |

---

## v0.1.25.8 - 2026-06-17

### æ–°å¢ž
- `config/compendium_data.js`ï¼šåœ–é‘‘æ–°å¢žã€Œè§’è‰²ã€æ¢ç›®ï¼ˆå™ªéµ‘ / é˜¿å¥‡çˆ¾ï¼šèµ·å§‹é€²åŒ–ã€èµ·å§‹å™¨å®˜ã€æ”»é€Ÿã€FæŠ€ï¼‰
- `config/compendium_data.js`ï¼šåœ–é‘‘æ–°å¢žã€Œæˆå°±èˆ‡æ°¸ä¹…åŠ æˆã€æ¢ç›®ï¼ˆ36æˆå°±ã€è·¨å±€åŠ æˆç¨®é¡žã€ç´…é»žæ©Ÿåˆ¶ã€å…¥å£ï¼‰
- `config/compendium_data.js`ï¼šåœ–é‘‘æ–°å¢žã€ŒæŽ’è¡Œæ¦œèˆ‡åäººå ‚ã€æ¢ç›®ï¼ˆæŽ’è¡Œæ¦œã€è¶£å‘³æ¦œã€åäººå ‚ã€TOP5å´æ¬„ï¼‰
- `config/compendium_data.js`ï¼šåœ–é‘‘æ–°å¢žã€ŒBoss å‡ºç¾æ©Ÿåˆ¶ã€æ¢ç›®ï¼ˆEasy/Normal ç¬¬å››å¤œ Boss é–‹å±€éš¨æ©Ÿï¼‰
- `config/compendium_data.js`ï¼šã€Œå™¨å®˜ç³»çµ±ã€è£œæŽ¡é›†ç¯„åœèªªæ˜Žï¼›ã€ŒæŠ€èƒ½æ¨¹ã€è£œå…¨ 9 ç¨®æŠ€èƒ½åç¨±ï¼›ã€ŒåŸºæœ¬æ“ä½œã€Féµæ”¹ç‚ºä¾è§’è‰²èªªæ˜Ž

### ä¿®å¾©
- `config/compendium_data.js`ï¼šç§»é™¤ `typeof X !== 'undefined'` å…¨åŸŸåµæ¸¬å¯«æ³•ï¼Œæ”¹ç‚ºæ˜Žç¢º ESM importï¼ˆ`BOSS_CONFIG` / `ELITE_CONFIG` / `EVOLUTION_PATHS` / `EASY_MAP` / `NORMAL_MAP` / `HARD_MAP`ï¼‰ï¼Œä¿®æ­£ Boss / ç²¾è‹±æ€ªæ•¸å€¼é¡¯ç¤º undefined / NaN
- `config/compendium_data.js`ï¼šç²¾è‹±æ€ªæ¢ç›®ï¼ˆ`id: 'elite'`ï¼‰å…¨é¢é‡å¯«ï¼šä¿®æ­£æ¯’æŠ—ï¼ˆ20%â†’0%ï¼‰ã€ä¿®æ­£å‡ºå ´æ©Ÿåˆ¶ï¼ˆä¸‰çŠ¬é †åºé–‹å±€éš¨æ©Ÿï¼Œéžå›ºå®šï¼‰ã€ä¿®æ­£æ“Šæ®ºçŽå‹µæ•¸å­—ã€è£œå……å›°é›£é›£åº¦çŠ¬éš¼å„è‡ªå›ºå®šæ•¸å€¼èˆ‡æŠ€èƒ½èªªæ˜Ž
- `config/creatures.js`ï¼šæ–°å¢ž `HUNTER_ELITE_REWARDS`ã€`HUNTER_ELITE_POISON_RESIST` exportï¼Œä¾›åœ–é‘‘å‹•æ…‹å¼•ç”¨
- `systems/elite.js`ï¼šç§»é™¤æœ¬åœ° `_HUNTER_ELITE_REWARDS` å¸¸æ•¸ï¼Œæ”¹ import `HUNTER_ELITE_REWARDS`ï¼›`poisonResist` æ”¹ç”¨ `HUNTER_ELITE_POISON_RESIST`
---

## v0.1.25.7 - 2026-06-17

### ä¿®å¾©
- `systems/ui.js`ï¼šåœ–é‘‘ï¼ˆéŠæˆ²èªªæ˜Žï¼å™¨å®˜åœ–é‘‘ï¼é€²åŒ–ç³»çµ±ï¼‰æ¡Œæ©Ÿç‰ˆå·¦å´ç›®éŒ„é»žæ“Šæ¢ç›®æ™‚ï¼ŒåŽŸæœ¬å› æ•´å€‹å®¹å™¨ `innerHTML` æ¸…ç©ºé‡å»ºå°Žè‡´æ²å‹•ä½ç½®æ­¸é›¶ã€ç•«é¢å¾€ä¸Šå½ˆï¼Œæ–°å¢ž `_captureSidebarScroll` / `_restoreSidebarScroll` åœ¨é‡ç¹ªå‰å¾Œä¿å­˜èˆ‡é‚„åŽŸ `scrollTop`ï¼Œä¸‰å€‹åˆ†é çš„ `_renderGuide` / `_renderOrgans` / `_renderEvo` åŒæ­¥å¥—ç”¨ï¼›å·²ç”¨ Chrome å¯¦æ©Ÿæ¸¬è©¦ç¢ºèªä¸‰å€‹åˆ†é çš†ä¸å†å›žå½ˆ
- `systems/mutation.js`ï¼š`showMutationPanel()` ç”±ã€Œæ¯æ¬¡å‡ç´š/å…Œæ›éƒ½æ•´å€‹æ‘§æ¯€é‡å»ºé¢æ¿ã€æ”¹ç‚ºã€Œé¢æ¿éª¨æž¶åªå»ºç«‹ä¸€æ¬¡ï¼Œå…§éƒ¨ç”¨ `refresh()` å‡½å¼å°±åœ°æ›´æ–°æ•¸å€¼èˆ‡æŒ‰éˆ•ç‹€æ…‹ã€ï¼Œæ¶ˆé™¤åŒæ¨£çš„æ²å‹•æ­¸é›¶å•é¡Œï¼Œä¸¦é¿å…ä¸å¿…è¦çš„ DOM é‡å»º
- `systems/ui.js`ï¼šåœ–é‘‘æ¡Œæ©Ÿç‰ˆé¢æ¿å°ºå¯¸æ”¹ç‚º isMobile æ„ŸçŸ¥ï¼ˆ`width:82%; max-width:1040px; height:86%; max-height:86vh`ï¼‰ï¼Œä¸å†æ²¿ç”¨æ‰‹æ©Ÿç‰ˆå°ºå¯¸é€ æˆæ¡Œæ©Ÿé¡¯ç¤ºéŽå°/æ¯”ä¾‹ä¸å”èª¿
- `systems/ui.js`ï¼š`_getGuideStoryPages()` æ•…äº‹é é¢å…§éƒ¨ä¸»æ¨™é¡Œä¿®æ­£ â€” ç¬¬ä¸€ç« å››å€‹åˆ†é ï¼ˆç ´æ›‰ï¼å­¤å…’ï¼è›»è®Šï¼è©¦ç…‰ï¼‰åŽŸæœ¬åˆ†åˆ¥èª¤æ¨™ç‚ºç¬¬ä¸€ï½žå››ç« ï¼Œçµ±ä¸€ä¿®æ­£ç‚ºã€Œç¬¬ä¸€ç« ã€ï¼›ç¬¬äºŒç« ä¸‰å€‹åˆ†é åŽŸæœ¬èª¤æ¨™ç‚ºã€Œç¬¬ä¸‰ç« ã€ï¼Œä¿®æ­£ç‚ºã€Œç¬¬äºŒç« ã€

---

## v0.1.25.6 - 2026-06-17

### ä¿®å¾©
- `systems/chat.js`ï¼šèŠå¤©è¨Šæ¯é–“è·å¾®èª¿ï¼Œæ™‚é–“ï¼lvï¼ã€GMã€‘æ”¹ç‚º margin-right:0pxï¼Œç¨±è™Ÿä¿ç•™ 5px èˆ‡åå­—ä¿æŒè·é›¢
- `systems/chat.js`ï¼š`syncTitleToServer()` å°‡ `saveChatSettings` ç§»åˆ° try å€å¡Šä¹‹å‰ï¼Œç¢ºä¿ Supabase å¤±æ•—æ™‚æœ¬åœ°ä»èƒ½æ­£ç¢ºå„²å­˜ç¨±è™Ÿï¼›query æ”¹ç”¨ `.toLowerCase()` é¿å…å¸³è™Ÿå¤§å°å¯«ä¸ç¬¦å°Žè‡´ Supabase æ›´æ–°é›¶ç­†è³‡æ–™
- `systems/boss.js`ï¼šEasy / Normal åœ°åœ– Boss ç”Ÿæ…‹ä¸å†ç”±çŽ©å®¶ç•¶ä¸‹è…³ä¸‹ç”Ÿæ…‹æ±ºå®šï¼Œæ”¹ç‚ºåœ¨éŠæˆ²é–‹å§‹æ™‚ä»¥ Seedï¼ˆ`mapSeed + 12345` åç§»ï¼Œé¿å…èˆ‡ç²¾è‹±æ€ªåºåˆ—é‡ç–Šï¼‰éš¨æ©Ÿé¸å®šä¸¦å­˜å…¥ `gameState.bossBiome`ï¼ŒHard åœ°åœ–ä¸å—å½±éŸ¿

### æ–°å¢ž
- `config/playerStatsFormula.js` / `systems/achievements.js`ï¼šPlayer Stats é¢æ¿ XP åˆ†é¡žåŠ å…¥ã€ŒæŽ¡é›†ç¯„åœã€æ¬„ä½ï¼Œé¡¯ç¤º body sizeï¼ˆé«”åž‹ï¼‰ï¼‹å™¨å®˜åŠ æˆï¼‹æŠ€èƒ½åŠ æˆçš„åˆè¨ˆæœ‰æ•ˆæŽ¡é›†è·é›¢
- `systems/hud.js` / `systems/mobile.js`ï¼šç‰¹æ®ŠæŠ€èƒ½ï¼ˆé–ƒç¾ï¼‰æŒ‰éˆ•åŠ å…¥åœ“è§’ + é»‘è‰²å¤–æ¡†ï¼›Ready ç‹€æ…‹èƒŒæ™¯åŠ æ·±ï¼ˆrgba 0.55ï¼‰ï¼Œå†·å»ä¸­èƒŒæ™¯æ·¡åŒ–ï¼ˆrgba 0.15ï¼‰ï¼Œæ˜“æ–¼è¾¨è­˜æ˜¯å¦å¯ç”¨

---

## v0.1.25.5 - 2026-06-16

### ä¿®å¾©
- `systems/chat.js`ï¼šä¿®æ­£èŠå¤©è¨Šæ¯ä¸­æ™‚é–“ï¼lv æ¨™ç±¤ï¼ã€GMã€‘ï¼ç¨±è™Ÿï¼æš±ç¨±é–“è·ä¸ä¸€è‡´å•é¡Œï¼Œçµ±ä¸€ç”¨ margin-right:3px æŽ§åˆ¶é–“è·ï¼Œç§»é™¤æ‰‹å‹•æ’å…¥ç©ºç™½å­—å…ƒï¼ˆ_buildMsgHTMLã€renderChat å±•é–‹ç‰ˆç½®é ‚è¨Šæ¯ã€_parseNameï¼‰
- `systems/chat.js`ï¼š`syncTitleToServer()` è£œä¸Š `saveChatSettings()`ï¼Œç¨±è™Ÿæ›´æ–°ä¼ºæœå™¨æˆåŠŸå¾ŒåŒæ­¥å¯«å›žæœ¬åœ° localStorageï¼Œé¸æ“‡ç¨±è™Ÿå¾Œç«‹å³ç”Ÿæ•ˆï¼Œä¸éœ€é‡æ–°ç™»å…¥

---

## v0.1.25.3

# CHANGELOG â€” åªåƒä¸å«çš„å™ªéµ‘

---

## v0.1.25.4 - 2026-06-16

### ä¿®å¾©
- `systems/achievements.js`ï¼šæˆå°±é¢æ¿æ‰‹æ©Ÿç‰ˆæ”¹ç‚ºç›´å‘å †ç–Šï¼ˆæ ¼å­åœ¨ä¸Šã€å±¬æ€§/è©³æƒ…èªªæ˜Žåœ¨ä¸‹ï¼‰ï¼Œç§»é™¤ leftCol å¯«æ­»çš„ `min-width:340px` èˆ‡æ‰‹æ©Ÿç‰ˆ `zoom:1.18`ï¼Œä¿®å¾©æ‰‹æ©Ÿç‰ˆå®Œå…¨ç„¡æ³•é–±è®€çš„å•é¡Œ
- `systems/ui.js`ï¼šæ›´æ–°å…¬å‘Š popup æ–‡å­—æ‰‹æ©Ÿç‰ˆé€€å›ž v0.1.25.3 æ”¾å¤§å‰çš„åŽŸå§‹å­—ç´šï¼Œæ¡Œæ©Ÿç¶­æŒç›®å‰æ”¾å¤§ç‰ˆä¸è®Š

### èª¿æ•´
- `config/supabase.js`ã€`systems/ui.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼šé¦–é æŽ’è¡Œæ¦œå´æ¬„ç”± TOP10 æ”¹ç‚º TOP5ï¼Œæ‰‹æ©Ÿèˆ‡æ¡Œæ©Ÿè¡Œç‚ºä¸€è‡´

---

## v0.1.25.3 - 2026-06-16

### èª¿æ•´
- `systems/ui.js`ï¼šæ›´æ–°å…¬å‘Š popup æ–‡å­—æ•´é«”æé«˜ç´„ 20%ï¼Œè®“ Patchnote é–±è®€æ¯”ä¾‹æŽ¥è¿‘æˆå°±é 
- `config/patchnotes.js`ï¼šçŽ©å®¶å…¬å‘Šåªä¿ç•™ `v0.1.22.1` ä»¥ä¸Šç‰ˆæœ¬ï¼Œç§»é™¤æ›´æ—©æœŸèˆŠå…¬å‘Šï¼Œé™ä½Žå…¬å‘Šæ¸…å–®é•·åº¦
- `.codex/config.toml`ï¼šåŠ å…¥ `powershell_utf8 = true` è¨­å®šï¼Œå”åŠ©é™ä½Ž PowerShell ä¸­æ–‡è¼¸å‡ºäº‚ç¢¼

---

## v0.1.25.2 - 2026-06-16

### ä¿®å¾©
- `config/playerStatsFormula.js`ï¼š`corpseXP` æ”¹ç‚ºå®Œæ•´è¨ˆç®—æ¬„ä½ï¼ˆé è¨­è‚‰é£Ÿæ€§ Lv1 æ¼”ç¤ºï¼‰ï¼Œå›žå‚³ `final/base/evoLevel/mutMultiplier/achPercent`ï¼Œæˆå°±é¢æ¿å¯é¡¯ç¤ºå±é«” XP æ•¸å€¼
- `config/playerStatsFormula.js` / `systems/achievements.js`ï¼šPlayer Stats æ–°å¢žæ”»é€Ÿæ¬„ä½ï¼Œä¾è§’è‰² `stats.attackSpeed` é¡¯ç¤ºå™ªéµ‘/é˜¿å¥‡çˆ¾ä¸åŒæ”»æ“Šé–“éš”ï¼Œä¸¦åœ¨ breakdown ä¸­æ‹†å‡ºæˆå°±åŠ æˆ
- `systems/player.js`ï¼šé˜¿å¥‡çˆ¾æ”»æ“Šå†·å»ç§»é™¤å¯«æ­» `1500`ï¼Œæ”¹è®€è§’è‰²è¨­å®šçš„ `stats.attackSpeed`
- `systems/achievements.js`ï¼šæˆå°±é æ–°å¢žæœªè®€ç´…é»žï¼›å·²è§£éŽ–æˆå°±éœ€é€æ ¼é»žé–‹å¾Œæ‰æ¨™è¨˜å·²è®€ï¼Œé¦–é æˆå°±æŒ‰éˆ•ç´…é»žæœƒåœ¨å…¨éƒ¨å·²è®€å¾Œæ¶ˆå¤±
- `systems/achievements.js`ï¼šæˆå°±è©³æƒ…æ–°å¢žçŽå‹µé¡¯ç¤ºï¼›æœªè§£éŽ–èˆ‡ hidden é¡¯ç¤º `???` çš„æˆå°±ä¹Ÿæœƒé¡¯ç¤ºå¯å–å¾—çš„æ•¸å€¼çŽå‹µ
- `systems/ui.js`ï¼šæ›´æ–°å…¬å‘Šç´…é»žæ”¹ç‚ºé€ç‰ˆæœ¬æ¸…é™¤ï¼Œé»žé–‹å“ªå€‹ç‰ˆæœ¬å°±æ¸…é™¤è©²ç‰ˆæœ¬ç´…é»žï¼Œä¸å†è¦æ±‚ä¸€æ¬¡é»žå®Œå…¨éƒ¨æœªè®€ç‰ˆæœ¬
- `systems/achievements.js` / `systems/ui.js`ï¼šæˆå°±é é—œé–‰å¾Œæœƒåœ¨é¦–é æ¢å¾©èŠå¤©å®¤ï¼Œé¿å…é–‹æˆå°±å¾ŒèŠå¤©å®¤æ¶ˆå¤±
- æˆå°±é èˆ‡æ›´æ–°å…¬å‘Š popup æ”¾å¤§è‡³ç´„ 80% èž¢å¹•ï¼›æˆå°±é å…§å®¹ç­‰æ¯”ä¾‹æ”¾å¤§ï¼Œ3Ã—3 æ ¼å­é–“è·èª¿æ•´ç‚ºä¸Šä¸‹å·¦å³å°ç¨±ï¼Œå³å´å±¬æ€§å­—ç´šé™ä½Žä»¥æ¸›å°‘æ²å‹•

### æ–‡ä»¶åŒæ­¥
- æ–°å¢ž `readAchievements` / `readPatchNotes` localStorage key èªªæ˜Žï¼›åŒæ­¥ `calcPlayerStats` çš„ `attackSpeed` èˆ‡ `corpseXP` å®Œæ•´å›žå‚³æ¬„ä½

---

## v0.1.25.1 - 2026-06-16

### ä¿®å¾©
- `systems/player.js`ï¼šç‰¹æ®ŠæŠ€èƒ½ CD åŠ æˆè£œä¸Š `_achSpecialCdReduction` å¥—ç”¨ï¼ˆé˜¿å¥‡çˆ¾è¡åˆº + å™ªéµ‘é–ƒç¾å„ä¸€è™•ï¼‰
- `config/playerStatsFormula.js`ï¼šæ”»æ“Š/HP/é€Ÿåº¦é¢æ¿å…¬å¼æ”¹ç‚ºã€Œå…ˆå¥—æˆå°± flat+percent â†’ æœ€å¾Œæ‰ä¹˜ mutation å€çŽ‡ã€ï¼Œå°é½Š runtime å¥—ç”¨é †åº
- `systems/organs.js`ï¼šç²¾è‹±æ€ªæ“Šæ®º XPï¼ˆHunter ç²¾è‹± + ä¸€èˆ¬ç²¾è‹±å…©å€‹åˆ†æ”¯ï¼‰è£œä¸Š `_achKillXpPercent` åŠ æˆå¥—ç”¨
- `systems/evolution.js` / `systems/mutation.js`ï¼šé¦–é è®Šç•°é¢æ¿æŠ˜æ‰£æ”¹å¾ž `storageGetJSON(ACHIEVEMENTS)` ç¾ç®—ï¼Œä¸å†ä¾è³´å¯èƒ½éŽæœŸçš„ `player._achMutationExchangeDiscount`
- `systems/organs.js`ï¼š`forceEvoOnly` æ™‚æ¨™é¡Œæ­£ç¢ºé¡¯ç¤ºã€Œé¸æ“‡é€²åŒ–ã€è€Œéžã€Œé¸æ“‡å™¨å®˜ã€

### æ¸…ç†
- å…¨é¢ç§»é™¤èˆŠå¯¶ç®±ç³»çµ±æ­»ç¢¼ï¼š`systems/spawning.js` çš„ `spawnTreasure()`ã€`systems/hud.js` çš„ `drawTreasures()`ã€`systems/gameState.js` çš„ `treasures: []`ã€`main.js` åˆå§‹åŒ–çš„å…©è™• `gameState.treasures = []`ï¼›æ¸¬è©¦ mock èˆ‡ ui.js èˆŠæ³¨é‡‹ä¸€ä½µæ¸…é™¤

### æ–‡ä»¶åŒæ­¥
- ç‰ˆæœ¬è™ŸåŒæ­¥è‡³ v0.1.25.1ï¼š`CHANGELOG.md` / `MAIN.md` / `project_summary.md` / `QUICKREF.md` / `config/gameConfig.js` 5 å€‹ä¾†æºå°é½Šï¼ˆåŽŸå…ˆåœåœ¨ v0.1.24.5~v0.1.25.0ï¼‰
- `calcPlayerStats` å‡½å¼ç°½åæ›´æ–°ç‚º 6 åƒæ•¸ï¼Œæ–°å¢ž `unlockedAchievements` èªªæ˜Žï¼›å›žå‚³ç‰©ä»¶è£œè¨˜ `corpseXP` æ¬„ä½ï¼›åŒæ­¥æ›´æ–° `MAIN.md`ã€`QUICKREF.md`ã€`ARCH.md`ã€`config/playerStatsFormula.js` file header

---

## v0.1.25.0 - 2026-06-16

### æ–°å¢ž
- æˆå°± Bonus ç³»çµ±ï¼š36 å€‹æˆå°±å…¨éƒ¨å¡«å…¥ `bonus` æ¬„ä½ï¼Œè§£éŽ–å¾Œæ°¸ä¹…åŠ æˆçŽ©å®¶æ•¸å€¼
- æ–°å¢ž `systems/achievementBonus.js`ï¼š`applyAchievementStatBonuses()` / `getAchievementBonusTotals()`ï¼Œå¥—ç”¨ç®¡ç·šæ’å…¥ `applyEvolutionEffects()` ä¹‹å¾Œã€`applyAllMutationBonuses()` ä¹‹å‰
- åŠ æˆå¥—ç”¨é †åºï¼šflat addï¼ˆæ”»æ“Š/HP/é€Ÿåº¦/æš´æ“Š/å™¨å®˜æ§½/æ”»é€Ÿï¼‰â†’ percentï¼ˆæ”»æ“Š/HP/é€Ÿåº¦/æ”»æ“Šç¯„åœ/é«”åž‹ï¼‰â†’ è®Šç•°å€çŽ‡
- XP ä¸‰åˆ†é¡žåŠ æˆï¼ˆfruitXP / killXP / corpseXPï¼‰ï¼šæ³¨å…¥è‡³ player.js / damage.js / boss.js / combat.js å„ XP å‘¼å«é»žï¼Œåœ¨ `addXP()` å‰å¥—ç”¨
- evo_5star æˆå°±ï¼šè§£éŽ–å¾Œé–‹å±€å¼·åˆ¶ä¸€æ¬¡é€²åŒ–é¸æ“‡ï¼ˆ`showOrganSelection(forceEvoOnly=true)`ï¼‰
- æ–°å¢ž `config/mutationConfig.js`ï¼šé›†ä¸­å®šç¾©æŠ€èƒ½é»žæ›è®Šç•°é»žå¸¸æ•¸ï¼ˆæ¨™æº–100/æŠ˜æ‰£å¾Œ90ï¼‰ï¼Œskill_master æˆå°±è§£éŽ–å¾Œç”Ÿæ•ˆ
- `config/playerStatsFormula.js` åŠ å…¥ç¬¬6åƒæ•¸ `unlockedAchievements`ï¼Œé¢æ¿é¡¯ç¤ºæ•¸å€¼èˆ‡ runtime åŒæ­¥ï¼Œæ–°å¢ž `corpseXP` è¿”å›žæ¬„ä½
- æˆå°±é¢æ¿å±¬æ€§é ã€Œæˆå°±åŠ æˆã€æ¬„ä½æ”¹ç‚ºå³æ™‚é¡¯ç¤ºå¯¦éš›åŠ æˆæ˜Žç´°

### ä¿®æ­£
- `config/achievements.js` `mutation_500` description ç”±ã€Œç´¯ç©ä½¿ç”¨500æ¬¡è®Šç•°æŠ€èƒ½ã€æ”¹ç‚ºã€Œè®Šç•°ç­‰ç´šé”åˆ°500ã€ï¼ˆèˆ‡å¯¦éš› condition ä¸€è‡´ï¼‰

---

## v0.1.24.6 - 2026-06-16

### é‡æ§‹
- `config/xpConfig.js`ï¼š`XP_CONFIG.kill` æ–°å¢ž `hostile` å­ç‰©ä»¶ï¼ˆ`base=30 / hpDivisor=50 / hpScale=10 / cap=80 / defaultHp=50`ï¼‰ï¼Œé›†ä¸­å®šç¾© hostile æ“Šæ®º XP å…¬å¼æ‰€æœ‰å¸¸æ•¸
- `systems/damage.js`ï¼š`handleKill` hostile XP å…¬å¼è£¸æ•¸å€¼ï¼ˆ80ã€30ã€50ã€10ï¼‰æ”¹è®€ `XP_CONFIG.kill.hostile.*`ï¼›ä¸æ”¹è®Šä»»ä½• XP æ•¸å€¼çµæžœ

---

## v0.1.24.5 - 2026-06-16

### é‡æ§‹
- æ–°å¢ž `config/xpConfig.js`ï¼š`XP_CONFIG`ï¼Œé›†ä¸­å®šç¾©æŽ¡é›† XPï¼ˆ`fruit.base / foragerPerLevel / noHerbivoreBase`ï¼‰èˆ‡æ“Šæ®º XPï¼ˆ`kill.minCreatureBaseXP / hunterPerLevel`ï¼‰æ‰€æœ‰å¸¸æ•¸
- `config/playerStatsFormula.js`ï¼š`fruitBase / fruitSkill / killBase / killSkill` æ”¹è®€ `XP_CONFIG`
- `systems/player.js`ï¼š`_collectFruit` æŽ¡é›† XP è¨ˆç®—æ”¹è®€ `XP_CONFIG.fruit.*`
- `systems/damage.js`ï¼š`handleKill / handleGiantKill / handleKillerKill` hunter åŠ æˆèˆ‡ä¸­ç«‹æ€ªåŸºæº–å€¼æ”¹è®€ `XP_CONFIG.kill.*`
- `config/creatures.js`ï¼šåˆªé™¤ `HUNTER_BONUS_CONFIG`ï¼Œç§»é™¤ `GIANT_CONFIG / KILLER_CONFIG` çš„ `hunterBonus` æ¬„ä½ï¼ˆhunter åŠ æˆçµ±ä¸€ç”± `XP_CONFIG` ç®¡ç†ï¼‰
- `systems/achievements.js`ï¼šæ“Šæ®º XP é¢æ¿æ¨™é¡Œæ”¹ç‚º `statKillXpBonus`ï¼ˆæœ€ä½Žæ“Šæ®º XPï¼‰ï¼Œbreakdown åŠ æ³¨ `statKillXpBaseNote`ï¼ˆæœ€ä½Žç”Ÿç‰©åŸºç¤Žï¼‰
- `lang/zh-TW.js` + `lang/en.js`ï¼šæ–°å¢ž `statKillXpBonus / statKillXpBaseNote` i18n key
- `tests/config/playerStatsFormula.test.js`ï¼š`killXP.final` æœŸæœ›å€¼æ›´æ–°ç‚º `30`ï¼ˆ`killBase` 20 Ã— `xpMut` 1.5ï¼‰
- ä¸æ”¹è®Šä»»ä½•éŠæˆ² XP æ•¸å€¼èˆ‡è¡Œç‚º

---

## v0.1.24.4 - 2026-06-16

### é‡æ§‹
- `config/achievements.js`ï¼š16 å€‹æˆå°±æ–°å¢ž `condition` æ¬„ä½ï¼ˆ`type` / `threshold`ï¼‰ï¼Œçµ±ä¸€å®šç¾©è§¸ç™¼æ¢ä»¶ï¼›type å‘½åè¦å‰‡ï¼š`*Max` å¾Œç¶´è¡¨ç¤º `<= threshold`ï¼Œ`nightOwlHour` è¡¨ç¤º `hour >= 0 && hour < threshold`ï¼Œå…¶é¤˜ç‚º `>= threshold`
- `systems/achievementTriggers.js`ï¼šæ–°å¢ž `_getThreshold(id)` helperï¼Œæ‰€æœ‰ listener è£¡çš„è£¸æ•¸å€¼æ”¹è®€ `_getThreshold(id)`ï¼ˆæ¶µè“‹ 16 å€‹æˆå°±è§¸ç™¼é»žï¼‰
- æ–°å¢ž `config/combatConfig.js`ï¼š`COMBAT_CONFIG.baseAttackIntervalMs = 1000`ï¼Œé›†ä¸­å®šç¾©æ”»æ“Šé–“éš”å…¬å¼åŸºåº•
- `systems/combat.js`ï¼šæ”»æ“Šé–“éš”è¨ˆç®—æ”¹è®€ `COMBAT_CONFIG.baseAttackIntervalMs`ï¼Œæ–°å¢ž `import { COMBAT_CONFIG }`
- ä¸æ”¹è®Šä»»ä½•éŠæˆ²æ•¸å€¼èˆ‡è¡Œç‚º

---

## v0.1.24.3 - 2026-06-16

### é‡æ§‹
- `config/organs.js` COMBOS `comboCrabGloves` æ–°å¢ž `effects: { bleedMultiplier: 2, healReduction: 0.5 }`
- `config/characters.js` koel æ–°å¢ž `specialSkillConfig`ï¼ˆdashDistMultiplier / dashDistMax / dashCD / dashInvincible / dashEffectDurationï¼‰
- `config/characters.js` archerfish æ–°å¢ž `specialSkillConfig`ï¼ˆdashSpeedAdd / dashDuration / dashCD / dashStunDuration / chargeMax / chargeInterval / chargeConsumeIntervalï¼‰ã€`projectile`ï¼ˆradius / rangeMultiplier / minShootDistanceï¼‰ã€`waterSpeedMultiplier`
- `systems/combat.js`ï¼šmouthOrgan slow å€çŽ‡/duration æ”¹è®€ `ORGANS.mouthOrgan.levels[2].effects.onHitSlow`ï¼›comboCrabGloves bleedMultiplier / healReduction æ”¹è®€ COMBOS effectsï¼›poisonSac sacDur æ”¹è®€ `ORGANS.poisonSac.levels[0].effects.poisonSacDur`
- `systems/player.js`ï¼šåŒæ­¥ mouthOrgan slow config åŒ–ï¼›é˜¿å¥‡çˆ¾æ‰€æœ‰ dash/charge/projectile/waterSpeed è£¸æ•¸å€¼æ”¹è®€ `CHARACTERS[id]`ï¼›å™ªéµ‘ dash è£¸æ•¸å€¼æ”¹è®€ `CHARACTERS[id].specialSkillConfig`
- ä¸æ”¹è®Šä»»ä½•éŠæˆ²æ•¸å€¼èˆ‡è¡Œç‚º

---

## v0.1.24.2 - 2026-06-16

### é‡æ§‹
- `config/creatures.js`ï¼šæ–°å¢ž `HUNTER_BONUS_CONFIG`ã€`GIANT_CONFIG`ã€`KILLER_CONFIG` ä¸‰å€‹ exportï¼Œé›†ä¸­å®šç¾©å·¨äºº / Alpha / æ®ºæ‰‹åŒ–ç³»çµ±çš„ XPã€lootã€è®Šç•°é»žèˆ‡æ©ŸçŽ‡æ•¸å€¼
- `systems/damage.js`ï¼š`handleGiantKill` / `handleKillerKill` ä¸­æ‰€æœ‰è£¸æ•¸å€¼æ”¹è®€ä¸Šè¿° configï¼›ä¸æ”¹è®Šä»»ä½•éŠæˆ²è¡Œç‚º
- æ–°å¢ž `import { GIANT_CONFIG, KILLER_CONFIG } from '../config/creatures.js'`

---

## v0.1.24.1

# CHANGELOG â€” åªåƒä¸å«çš„å™ªéµ‘

---

## v0.1.24.1 - 2026-06-15

### é‡æ§‹
- `config/achievements.js`ï¼š`koel_50` / `archer_50` æ–°å¢ž `condition` æ¬„ä½ï¼ˆ`type: 'characterClearCount'`, `characterId`, `threshold`ï¼‰
- `systems/achievementTriggers.js`ï¼šç§»é™¤è§’è‰² id ç¡¬å¯«åˆ¤æ–·ï¼Œæ”¹ç‚ºé€šç”¨è¿´åœˆæŽƒæ `ACHIEVEMENTS` ä¸­æ‰€æœ‰ `condition.type === 'characterClearCount'` æˆå°±ï¼›æ–°å¢ž `import { ACHIEVEMENTS } from '../config/achievements.js'`
- æ–°å¢žè§’è‰²æˆå°±åªéœ€åœ¨ `config/achievements.js` åŠ  `condition` æ¬„ä½ï¼Œä¸éœ€æ”¹ `systems/`

---

## v0.1.24.0

# CHANGELOG â€” åªåƒä¸å«çš„å™ªéµ‘

---

## v0.1.24.0 - 2026-06-15

### é‡æ§‹
- `config/characters.js`ï¼škoel / archerfish æ–°å¢ž `sfx` æ¬„ä½ï¼ˆhurt / attackNormal / attackCritï¼‰
- `systems/damage.js`ï¼šç§»é™¤ `archerfish` id ç¡¬å¯«åˆ¤æ–·ï¼Œæ”¹è®€ `CHARACTERS[id].sfx.hurt`
- `systems/combat.js`ï¼šç§»é™¤ `archerfish` id ç¡¬å¯«åˆ¤æ–·ï¼Œæ”¹è®€ `CHARACTERS[id].sfx.attackCrit / .attackNormal`
- `systems/player.js`ï¼šç§»é™¤ `archerfish` id ç¡¬å¯«åˆ¤æ–·ï¼Œæ”¹è®€ `CHARACTERS[id].sfx.attackNormal`

---

## v0.1.23.2 - 2026-06-15

### ä¿®å¾©
- `systems/achievements.js`ï¼šUI ç¡¬å¯«ä¸­æ–‡æ–‡å­—å…¨æ•¸æ”¹ç‚º `t('key')` å¼•ç”¨ï¼ˆå…± 25 å€‹ lang keyï¼‰
- `lang/zh-TW.js` / `lang/en.js`ï¼šæ–°å¢ž stat*ï¼ˆ16 å€‹ï¼‰ã€achievementHidden/PageFmt/CountFmt/ProgressFmt/DaysFmt/DetailTitleï¼ˆ6 å€‹ï¼‰ã€statPanelTitle/unitPerFruit/unitPerKillï¼ˆ3 å€‹ï¼‰ï¼Œå…± 25 å€‹ key

---

## v0.1.23.1 - 2026-06-15

### ä¿®å¾©
- `config/playerStatsFormula.js`ï¼šFix C â€” savedOrgans å·²å« fang æ™‚ terribleFang fangBonus ä¸å†é›™ç®—ï¼ˆåŽŸæœ¬åªæŽ’é™¤ startOrgansï¼‰
- `config/playerStatsFormula.js`ï¼šFix D â€” speed è¨ˆç®—è£œå…¥ `_startEvoEffect(char, 'speedBonus')`ï¼ˆomnivore startEvolution é€Ÿåº¦åŠ æˆåŽŸæœ¬æœªå¥—ç”¨ï¼‰

### æ–°å¢ž
- `docs/PLAYER_STATS_FORMULA.md`ï¼š`calcPlayerStats` å®Œæ•´åƒè€ƒæ‰‹å†Šï¼ˆæ¦‚è¦½ã€è³‡æ–™ä¾†æºå°ç…§è¡¨ã€è¨ˆç®—é †åºã€å·²çŸ¥é™åˆ¶ã€å¼•ç”¨ç¯„ä¾‹ï¼‰

### æ¸¬è©¦
- `tests/config/playerStatsFormula.test.js`ï¼šæ–°å¢ž Fix C / Fix D æ¸¬è©¦ï¼Œå…± 165 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.23.0 - 2026-06-15

### æ–°å¢ž
- `systems/achievementTriggers.js`ï¼šPhase D æˆå°±è§¸ç™¼æŽ¥å…¥ï¼Œ`initAchievementTriggers()` ç›£è½ 20+ å€‹ CustomEventï¼Œä¸ import ä»»ä½• SCC æ¨¡çµ„
- `storage/index.js`ï¼šæ–°å¢ž `WIN_STREAK` / `KILL_TOTAL` / `KILL_KILLER_TOTAL` / `KILL_GIANT_TOTAL` å››å€‹ localStorage key
- `systems/damage.js`ï¼šæ–°å¢ž `playerDamaged` / `gameOver` / `killCountUpdated`ï¼ˆnormal / killer / giantï¼‰dispatchï¼›æ–°å¢ž storage import ä»¥ç´¯ç©æ“Šæ®ºè¨ˆæ•¸
- `systems/tutorial.js`ï¼šæ•™å­¸å®Œæˆå¾Œ dispatch `tutorialCompleted`
- `systems/boss.js`ï¼š`showVictory()` dispatch `gameVictory`ï¼ˆå« difficulty / playTime / bossKillTime / character / bossType / tookDamage / regenedThisRunï¼‰
- `systems/player.js`ï¼šå›žè¡€æ™‚ dispatch `playerRegen`ï¼›æžœå¯¦è¨ˆæ•¸éžå¢žå¾Œ dispatch `fruitCollected`
- `systems/evolution.js`ï¼šé€²åŒ–å‡ç­‰ dispatch `evolutionLevelUp`ï¼›æŠ€èƒ½å‡ç´š dispatch `skillUpgraded`ï¼›è®Šç•°å‡ç´š dispatch `mutationLevelChanged`
- `systems/organs.js`ï¼š`applyOrganEffects()` æœ«å°¾ dispatch `organUnlocked`
- `systems/combat.js`ï¼š`_addBoneMaterial()` dispatch `boneMaterialUpdated`
- `systems/chat.js`ï¼šç™»å…¥æˆåŠŸä¸” `is_pioneer=true` æ™‚ dispatch `pioneerConfirmed`
- `systems/achievements.js`ï¼š`unlockAchievement()` æœ«å°¾è‡ªå‹•æª¢æŸ¥ `all_achievements`ï¼›`showAchievements()` é–‹å•Ÿæ™‚è‡ªå‹•åˆ¤æ–· `veteran_days`
- `main.js`ï¼šimport `initAchievementTriggers` / `unlockAchievement`ï¼›é¦–æ¬¡éŠçŽ©å¯«å…¥ `first_play`ï¼›æ¯å±€é‡ç½® `tookDamageThisRun` / `regenedThisRun`ï¼›ç›£è½ `playerDamaged` / `playerRegen` è¨­å®š flagï¼›dispatch `gameStarted`

### æ¸¬è©¦
- æ–°å¢ž `tests/systems/achievementTriggers.test.js`ï¼š14 å€‹æ¸¬è©¦ï¼ˆinitAchievementTriggers / gameVictory / levelUp / mutationLevelChanged / killCountUpdated / win_streakï¼‰
- `npm test`ï¼š18 å€‹æ¸¬è©¦æª”ã€146 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.22.1 - 2026-06-14

### æ–°å¢ž
- `systems/achievements.js`ï¼šæ–°å¢ž `showAchievements(opts)` æˆå°± Overlay UIï¼ˆ3Ã—3 æ ¼å­ã€4 é ç¿»é ã€å³å´èªªæ˜Žæ¬„ã€hidden æˆå°±æœªè§£éŽ–é¡¯ç¤º ???ï¼‰
- `systems/ui.js`ï¼šé¦–é å·¦å´æ–°å¢žã€Œæˆå°±ã€å°ŽèˆªæŒ‰éˆ•ï¼ˆDiscord æŒ‰éˆ•ä¸‹æ–¹ï¼Œé¢¨æ ¼ä¸€è‡´ï¼‰ï¼Œé»žæ“Šå‘¼å« `showAchievements()`
- `systems/chat.js`ï¼šæ–°å¢ž `openChatLogin()` / `syncTitleToServer(title)` å…©å€‹ exportï¼ˆç¨±è™Ÿ UI ä½¿ç”¨ï¼‰
- `lang/zh-TW.js` / `lang/en.js`ï¼šæ–°å¢ž achievementTitle / achievementBtn / achievementUnlocked / achievementHowTo / achievementDaysPlayed / achievementProgress ç­‰ 11 å€‹ lang key
- æˆå°± Overlay å³ä¸Šè§’ [ç¨±è™Ÿ â–¾] æŒ‰éˆ•ï¼šå·²ç™»å…¥å¯é¸æ“‡ç¨±è™Ÿï¼ˆactive é¡¯ç¤º âœ“ï¼Œå†é»žå–æ¶ˆï¼‰ï¼Œæœªç™»å…¥é¡¯ç¤ºç™»å…¥æç¤ºï¼›é¸æ“‡å¾ŒåŒæ­¥è‡³ Supabase `chat_users.title`

---

## v0.1.22.0 - 2026-06-14

### æ–°å¢ž
- `config/achievements.js`ï¼š36 å€‹æˆå°±å®šç¾©ï¼ˆbeginner / clear / boss / collect / character / growth / hidden ä¸ƒé¡žï¼‰ï¼Œç´”è³‡æ–™ export
- `systems/achievements.js`ï¼šæˆå°±ç³»çµ±è®€å¯«å…¥å£ï¼ˆunlockAchievement / isUnlocked / getUnlockedAchievements / getActiveTitle / setActiveTitleï¼‰
- `config/attributes.js`ï¼š5 å€‹ Attribute ç´”è³‡æ–™å®šç¾©ï¼ˆvenom / specter / shadow / sniper / shotgunï¼‰ï¼Œå°æ‡‰ docs/MODULAR_ATTRIBUTE_DESIGN.md Phase B
- `storage/index.js`ï¼šæ–°å¢ž `ACHIEVEMENTS` / `FIRST_PLAY_DATE` å…©å€‹ localStorage key
- `main.js`ï¼šé¦–æ¬¡éŠçŽ©æ™‚å¯«å…¥ `FIRST_PLAY_DATE`ï¼ˆISO date stringï¼‰
- `systems/chat.js`ï¼šæ–°å¢ž `_validateUsername()`ï¼ˆé•·åº¦ 1~20ã€è‹±æ•¸å­—é™åˆ¶ã€leet-speak GOBLINNEST éŽæ¿¾ï¼‰ï¼›chatLogin æ‰€æœ‰è·¯å¾‘ username ä¸€å¾‹ toLowerCase æ­£è¦åŒ–ï¼›_collectLocalData åŠ å…¥ ACHIEVEMENTS / FIRST_PLAY_DATE

### æ¸¬è©¦
- æ–°å¢ž `tests/systems/achievements.test.js`ï¼š17 å€‹æ¸¬è©¦ï¼ˆunlock / idempotent / isUnlocked / getActiveTitle / setActiveTitle / id ä¸é‡è¤‡ / title æ•¸é‡ï¼‰
- æ–°å¢ž `tests/config/attributes.test.js`ï¼š7 å€‹æ¸¬è©¦ï¼ˆid ä¸é‡è¤‡ / ability id ä¸é‡è¤‡ / å¿…å¡«æ¬„ä½ / appliesTo ä¸ç‚ºç©ºï¼‰
- `npm test`ï¼š17 å€‹æ¸¬è©¦æª”ã€132 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.21.3 - 2026-06-14

### ä¿®å¾©
- `systems/damage.js`ï¼š`handleKill()` ç¾åœ¨æœƒå¾ž `hostileCreatures` / `neutralCreatures` ç§»é™¤å·²æ“Šæ®ºç”Ÿç‰©ï¼Œä¸¦ä¿ç•™åŠ å…¥ `corpses` çš„æ—¢æœ‰æµç¨‹
- `systems/damage.js`ï¼š`handleKill()` æ“Šæ®º `isElite` ç”Ÿç‰©æ™‚ dispatch `CustomEvent('eliteKilled', { detail: { killer } })`

### æ¸¬è©¦
- æ–°å¢ž `tests/systems/damage.test.js`ï¼šæ°¸ä¹…å›žæ­¸ä¿è­· `handleKill`ã€`eliteKilled`ã€`bossKilled`ã€`applyDamageToPlayer`ã€`showSkillTree` dispatchã€`setRangedAttackCallback`
- `npm test`ï¼š15 å€‹æ¸¬è©¦æª”ã€114 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽï¼ˆå«åŽŸæœ‰ 103 å€‹ regressionï¼‰

---

## v0.1.21.2 - 2026-06-14

### æ¸…ç†
- `systems/boss.js`ï¼šç§»é™¤ dead import `storageGetJSON`
- `systems/combat.js`ï¼šç§»é™¤ dead import `getGameFont`ã€`spawnLootCircle`ã€`showXPPopup`ã€`incrementStat`ã€`addMutationPoints`
- `systems/elite.js`ï¼šç§»é™¤ dead import `storageGet`ã€`storageRemove`ã€`storageGetJSON`ã€`storageSetJSON`
- `systems/evolution.js`ï¼šç§»é™¤ dead import `showOrganSelection`ã€`showHiddenOrganSelection`ã€`getOrganSlotsUsed`ã€`applyMutationEffects`ã€`resumePlayTimer`
- `systems/hud.js`ï¼šç§»é™¤ dead import `drawArrow`ã€`showFloatingText`
- `systems/leaderboard.js`ï¼šç§»é™¤ dead import `fetchTop10`
- `systems/mutation.js`ï¼šç§»é™¤ dead import `storageRemove`
- `systems/organs.js`ï¼šç§»é™¤ dead import `SKILLS`ã€`showFloatingText`ã€`getGameFont`ã€`storageRemove`ã€`storageGetJSON`ã€`storageSetJSON`
- `systems/player.js`ï¼šç§»é™¤ dead import `VIEW_W`ã€`VIEW_H`ã€`getOrganCumulative`ã€`applyOrganEffects`
- `systems/tutorial.js`ï¼šç§»é™¤ dead import `storageGet`ã€`storageRemove`ã€`storageGetJSON`ã€`storageSetJSON`

### æ¸¬è©¦
- `npm test`ï¼š103/103 é€šéŽ

---

## v0.1.21.1 - 2026-06-14

### ä¿®å¾©
- `systems/damage.js`ï¼šç§»é™¤ `import { handleEliteKill } from './organs.js'`ï¼Œè§£é™¤ Layer 1 â†’ Layer 2 é•è¦
- `systems/damage.js`ï¼šåˆºç”²åå‚·æ“Šæ®ºç²¾è‹±æ€ªæ”¹ dispatch `CustomEvent('eliteKilled', { detail: { killer } })`
- `main.js`ï¼šæ–°å¢ž `eliteKilled` event listenerï¼ˆâ†’ `handleEliteKill(e.detail.killer)`ï¼‰ï¼›`handleEliteKill` åŠ å…¥ organs.js import æ¸…å–®

### æ–‡ä»¶
- `MAIN.md`ï¼šç‰ˆæœ¬è™Ÿ + æ–°å¢ž feedback.js / reward.js / loot.js / damage.js æ¨¡çµ„æ®µè½ï¼›ä¿®æ­£ combat.js / player.js æ®µè½
- `QUICKREF.md`ï¼šç‰ˆæœ¬è™Ÿ + è£œ feedback.js / reward.js / loot.js æ¢ç›®
- `ARCH.md`ï¼šç‰ˆæœ¬è™Ÿ + damage.js ä¾è³´è¡¨ç§»é™¤ organs.js + æ¨¡çµ„æ¸…å–®è£œé½Š
- `docs/events.md`ï¼šæ–°å¢ž eliteKilled äº‹ä»¶è¨˜éŒ„

### æ¸¬è©¦
- `npm test`ï¼š14 å€‹æ¸¬è©¦æª”ã€103 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.21.0 - 2026-06-14

### é‡æ§‹
- Stage F 3aï¼šæ–°å»º `systems/damage.js`ï¼Œæ‰¿è¼‰ `applyDamageToPlayer`ã€`handleKill`ã€`handleGiantKill`ã€`handleKillerKill`ï¼ˆprivateï¼‰
- `boss.js`ã€`player.js`ã€`elite.js`ã€`creatures.js` çš„ `applyDamageToPlayer`/`handleKill`/`handleGiantKill` import æ”¹ç‚º `damage.js`
- `combat.js` ç§»é™¤ `import { handleBossKill } from './boss.js'`ï¼Œ4 å€‹ Boss æ­»äº¡å‘¼å«é»žæ”¹ dispatch `CustomEvent('bossKilled')`
- `combat.js` ç§»é™¤ `import { _archerAttack } from './player.js'`ï¼Œæ”¹ç”¨ callback injectionï¼ˆ`setRangedAttackCallback`ï¼‰
- `main.js` æ–°å¢ž `setRangedAttackCallback(_archerAttack)` åˆå§‹åŒ–å‘¼å«
- `tests/systems/creatures.test.js` mock ç”± `combat.js` æ”¹ç‚º `damage.js`
- è§£é™¤å¾ªç’°ä¾è³´ #11ï¼ˆboss â†” combatï¼‰ã€#6ï¼ˆcombat â†” playerï¼‰ç›´æŽ¥é›™å‘ import

### æ¸¬è©¦
- `npm test`ï¼š14 å€‹æ¸¬è©¦æª”ã€103 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.20.1 - 2026-06-14

### é‡æ§‹
- Stage F æ‰¹æ¬¡ 2 ç¬¬äºŒæ³¢ï¼šæ–°å»º `systems/reward.js`ï¼Œå°‡ `addXP` / `checkLevelUp` å¾ž `player.js` æ¬å‡º
- æ–°å»º `systems/loot.js`ï¼Œå°‡ `_spawnBone` å¾ž `combat.js` æ¬å‡º
- `boss.js`ã€`combat.js`ã€`organs.js`ã€`ui.js` çš„ `addXP` import æ”¹ç‚º `reward.js`
- `evolution.js`ï¼šç§»é™¤ `addXP` dead importï¼ˆfrom player.jsï¼‰
- `player.js`ï¼šç§»é™¤ `addXP` / `checkLevelUp` å®šç¾©ï¼Œç§»é™¤ `handleBossKill` importï¼›Boss æ­»äº¡æ”¹ dispatch `CustomEvent('bossKilled')`
- `reward.js`ï¼šå‡ç´šå¾Œæ”¹ dispatch `CustomEvent('levelUp')` å–ä»£ç›´æŽ¥å‘¼å« `showOrganSelection()`
- `utils.js`ï¼š`_spawnBone` import æ”¹ç‚º `loot.js`ï¼ˆç§»é™¤ combat.js åå‘ä¾è³´ï¼‰
- `combat.js`ï¼š`_spawnBone` import æ”¹ç‚º `loot.js`ï¼Œç§»é™¤æœ¬åœ°å®šç¾©
- `main.js`ï¼šæ–°å¢ž `levelUp`ï¼ˆâ†’ showOrganSelectionï¼‰ã€`bossKilled`ï¼ˆâ†’ handleBossKillï¼‰event listener
- è§£é™¤å¾ªç’°ä¾è³´ #6ï¼ˆcombat â†” playerï¼ŒaddXP å´ï¼‰ã€#7ï¼ˆorgans â†” playerï¼ŒaddXP å´ï¼‰ã€#12ï¼ˆboss â†” playerï¼‰ã€#14ï¼ˆcombat â†” utilsï¼‰

### æ¸¬è©¦
- `npm test`ï¼š14 å€‹æ¸¬è©¦æª”ã€103 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.20.0 - 2026-06-14

### é‡æ§‹
- Stage F æ‰¹æ¬¡ 2 ç¬¬ä¸€æ³¢ï¼šæ–°å»º `systems/feedback.js`ï¼Œå°‡ `showFloatingText`ï¼ˆfrom `combat.js`ï¼‰èˆ‡ `showXPPopup`ï¼ˆfrom `player.js`ï¼‰æ¬ç§»è‡³æ­¤
- `boss.js`ã€`creatures.js`ã€`elite.js`ã€`hud.js`ã€`mutation.js`ã€`organs.js`ã€`player.js`ã€`combat.js` çš„æµ®å‹•æ–‡å­— import æ”¹ç‚º `feedback.js`
- `evolution.js`ï¼šç§»é™¤ `showFloatingText` dead importï¼ˆfrom combatï¼‰
- `combat.js`ï¼šçŽ©å®¶æ­»äº¡æ™‚ `showSkillTree()` æ”¹ç‚º `CustomEvent('showSkillTree')` dispatch
- `main.js`ï¼šæ–°å¢ž `showSkillTree` event listener
- è§£é™¤å¾ªç’°ä¾è³´ #9ï¼ˆcombat â†” evolutionï¼‰ã€#13ï¼ˆcombat â†” mutation çš„ feedback å´ï¼‰

### æ¸¬è©¦
- `npm test`ï¼š14 å€‹æ¸¬è©¦æª”ã€103 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.19.0 - 2026-06-14

### é‡æ§‹
- Stage F æ‰¹æ¬¡ 1ï¼šæ–°å¢ž `systems/gameFlow.js`ï¼Œå°‡ `pausePlayTimer` / `resumePlayTimer` å¾ž `main.js` æŠ½å‡ºä¸¦ç”± `main.js` re-export
- `boss.js`ã€`organs.js`ã€`evolution.js`ã€`tutorial.js` æ”¹ç”± `systems/gameFlow.js` import timer æŽ§åˆ¶å‡½å¼
- `ui.js` / `evolution.js` æ”¹ç”¨ `CustomEvent('startGame')` é€šçŸ¥ `main.js` å•Ÿå‹•éŠæˆ²ï¼Œç§»é™¤å° `main.js` çš„åå‘ import
- è§£é™¤ Stage F å¯©è¨ˆä¸­ 5 å€‹é«˜åš´é‡åº¦ `main.js` åå‘å¾ªç’°ä¾è³´
- `docs/stage-d-audit*.md` å·²å®Œæˆä¸¦æ­¸æª”è‡³ `docs/history/`

### æ¸¬è©¦
- `npm.cmd test`ï¼š14 å€‹æ¸¬è©¦æª”ã€103 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.18.3 - 2026-06-14

### æ¸¬è©¦
- tests/systems/audio.test.jsï¼šè£œå…… _mobileFadeScale fade çµæŸé‚Šç•Œ caseï¼ˆnow >= end â†’ 1ï¼‰ï¼Œå…± 103 å€‹æ¸¬è©¦å…¨æ•¸é€šéŽ

---

## v0.1.18.2 - 2026-06-14

### é‡æ§‹
- Stage Dï¼šsystems/creatures.js â€” `_effSpeed(c)` åŠ å…¥ `now = Date.now()` åƒæ•¸ï¼›`_shouldFleeFromGiant`ã€`_getHyenaPackBonus`ã€`_hyenaWheelPosition` åŠ  `export`ï¼›`_hyenaWheelPosition` åŠ å…¥ `now = Date.now()` åƒæ•¸
- Stage Dï¼šsystems/audio.js â€” ç§»é™¤ dead import `getSettings`ï¼›`_mobileFadeScale()` åŠ å…¥ `now = Date.now(), isMobile = gameState.isMobile` åƒæ•¸ï¼›`_playSfxBuffer(key)` åŠ å…¥ `random = Math.random` åƒæ•¸

### æ¸¬è©¦
- tests/systems/creatures.test.jsï¼šæ–°å¢ž 9 å€‹å–®å…ƒæ¸¬è©¦ï¼ˆ_effSpeed Ã— 3ã€_shouldFleeFromGiant Ã— 3ã€_getHyenaPackBonus Ã— 2ã€_hyenaWheelPosition Ã— 1ï¼‰
- tests/systems/audio.test.jsï¼šæ–°å¢ž 6 å€‹å–®å…ƒæ¸¬è©¦ï¼ˆ_mobileFadeScale Ã— 4ã€_playSfxBuffer Ã— 2ï¼‰

---

## v0.1.18.1

# CHANGELOG â€” åªåƒä¸å«çš„å™ªéµ‘

---

## v0.1.18.1 - 2026-06-14

### é‡æ§‹
- Stage Dï¼šsystems/spawning.js â€” `moveCreature` åŠ å…¥ `bounds` å¯é¸åƒæ•¸ï¼›`_randomPointInBiome` / `_makeHerbCreature` åŠ å…¥ `deps` å¯é¸åƒæ•¸ï¼ˆrandomã€nowã€getBiomeã€width/heightï¼‰ï¼Œå‘¼å«é»žè¡Œç‚ºä¸è®Š
- Stage Dï¼šsystems/input.js â€” æŠ½å‡ºç´”å‡½å¼ `_calcMouseWorld(clientX, clientY, rect, canvasSize, camera, bounds)` ä¸¦ exportï¼›`_updateMouseWorld` æ”¹ç‚ºå‘¼å«æ­¤ç´”å‡½å¼

### æ¸¬è©¦
- tests/systems/spawning.test.jsï¼šæ–°å¢ž 5 å€‹å–®å…ƒæ¸¬è©¦ï¼ˆmoveCreature wrap é‚Šç•Œï¼šæ­£å¸¸åº§æ¨™ã€è² åº§æ¨™ã€è¶…å‡ºå³é‚Šç•Œã€å‰›å¥½ç­‰æ–¼é‚Šç•Œã€é è¨­å°ºå¯¸ï¼‰
- tests/systems/input.test.jsï¼šæ–°å¢ž 4 å€‹å–®å…ƒæ¸¬è©¦ï¼ˆ_calcMouseWorld åº§æ¨™è½‰æ›ã€å³é‚Šç•Œ wrapã€è²  world wrapï¼‰

---

## v0.1.18.0 - 2026-06-14

### æ–°å¢ž
- Stage Dï¼šsystems/daynight.js â€” å°‡ `getDayNightPhaseIndex()` é‡æ§‹ç‚ºç´”å‡½å¼ï¼ˆåƒæ•¸æ³¨å…¥ `timeRemaining`ï¼‰ï¼Œå‘¼å«é»ž `updateDayNightCycle()` èˆ‡ `devToggleDayNight()` åŒæ­¥æ›´æ–°
- tests/systems/daynight.test.jsï¼šæ–°å¢ž 8 å€‹å–®å…ƒæ¸¬è©¦ï¼Œæ¶µè“‹å„ phase è‡¨ç•Œé»žã€é‚Šç•Œå€¼ï¼ˆ0/600/è¶…é™ï¼‰èˆ‡å›žå‚³åž‹åˆ¥

---

## v0.1.17.1 - 2026-06-14

### ä¿®å¾©
- systems/hud.jsï¼šä¿®å¾©æ¯’ debuff åœ–ç¤ºæ°¸ä¸é¡¯ç¤ºå•é¡Œï¼Œæ”¹å¾ž `poisonStacks[]` åˆ¤æ–·æ˜¯å¦æœ‰æ¯’ç‹€æ…‹ï¼ˆåŽŸæœ¬è®€å»¢æ£„çš„ `poisonEndTime`ï¼‰
- systems/boss.jsï¼šåŒä¸Šï¼ŒBoss è¡€æ¢ä¸‹æ–¹æ¯’åœ–ç¤ºæ”¹ç”¨ `poisonStacks[]` åˆ¤æ–·
- config/supabase.jsï¼š`fetchHallOfFameMyRank` æ”¹ç‚ºå…©æ¬¡é«˜æ•ˆ queryï¼ˆå…ˆå–è‡ªå·±åˆ†æ•¸ï¼Œå† HEAD count è¨ˆç®—æŽ’åï¼‰ï¼Œé¿å…æ‹‰æ•´å¼µ table

### æ–°å¢ž
- systems/leaderboard.js + config/supabase.jsï¼šè¶£å‘³æŽ’è¡Œæ¦œæ–°å¢žã€ŒðŸ¦´ ç™½éª¨ç²¾ã€é¡žåˆ¥ï¼ˆbone_count æœ€å¤šï¼‰

### èª¿æ•´
- systems/leaderboard.jsï¼šæŽ’è¡Œæ¦œé–‹å•Ÿé è¨­é¡¯ç¤ºåäººå ‚ Showcase
- systems/leaderboard.jsï¼š[é›£åº¦][ç¨®é¡ž][åäººå ‚] ä¸‰å€‹æŒ‰éˆ•åœ¨æ‰€æœ‰ view æ°¸é é¡¯ç¤ºï¼Œå°Žèˆªé‚è¼¯çµ±ä¸€ï¼ˆcurrentView: leaderboard / fun / hofï¼‰
- systems/leaderboard.jsï¼šè¶£å‘³æŽ’è¡Œæ¦œåµŒå…¥ä¸»æŽ’è¡Œæ¦œ overlayï¼Œä¸å†è·³æ–°è¦–çª—

---

## v0.1.17.0 - 2026-06-14

### æ–°å¢ž
- systems/leaderboard.jsï¼šæäº¤åˆ†æ•¸æ™‚æ–°å¢ž `bone_count`ï¼ˆç™½éª¨ç´ ï¼‰æ¬„ä½åˆ° `leaderboard` table
- systems/leaderboard.js + config/supabase.jsï¼šæ–°å¢žåäººå ‚ï¼ˆhall_of_fameï¼‰ç³»çµ±
  - ç™»å…¥çŽ©å®¶æäº¤åˆ†æ•¸å¾Œè‡ªå‹• upsert åäººå ‚è³‡æ–™ï¼ˆç´¯è¨ˆé€šé—œæ¬¡æ•¸ Ã— é›£åº¦ã€è§’è‰²ï¼Œè®Šç•°ç­‰ç´šï¼‰
  - `supabaseUpsert()` â€” REST resolution=merge-duplicates è¼”åŠ©å‡½å¼
  - `fetchHallOfFameShowcase()` â€” å„é¡žåˆ¥ Top1ï¼ˆShowcase 2Ã—3 ç”¨ï¼‰
  - `fetchHallOfFameTop10(category)` â€” æŸé¡žåˆ¥ Top 10
  - `fetchHallOfFameMyRank(username, category)` â€” ç™»å…¥çŽ©å®¶æŽ’å
- systems/leaderboard.jsï¼šæŽ’è¡Œæ¦œåŠ å…¥ã€ŒðŸ›ï¸ åäººå ‚ã€Tab
  - Showcase 2Ã—3ï¼šå›°é›£é€šé—œ / è®Šç•°ç­‰ç´š / æ™®é€šé€šé—œ / ç°¡å–®é€šé—œ / å™ªéµ‘é€šé—œ / é˜¿å¥‡çˆ¾é€šé—œ
  - é»žæ“Šæ ¼å­å±•é–‹ Top 10 è©³ç´°æ¸…å–®ï¼Œé¡¯ç¤ºæŽ’å / çŽ©å®¶åç¨± / æ•¸å€¼ / ç‰ˆæœ¬ / æ—¥æœŸ
  - ç™»å…¥çŽ©å®¶åº•éƒ¨é¡¯ç¤ºå€‹äººæŽ’åï¼Œæœªç™»å…¥æç¤ºç™»å…¥

### èª¿æ•´
- systems/leaderboard.jsï¼šä¸€èˆ¬æŽ’è¡Œæ¦œæ”¹ç‚º Top 100 å¯æ²å‹•åˆ—è¡¨ï¼Œç§»é™¤ç¿»é æŒ‰éˆ•

---

## v0.1.16.3 - 2026-06-14

### ä¿®å¾©
- package.json / scripts / vercel.json: ä¿®å¾© Vercel Vite build åªéƒ¨ç½² `dist/` å°Žè‡´ç·šä¸Š `sounds/*.mp3` 404ã€æ‰‹æ©Ÿç‰ˆç„¡éŸ³æ•ˆçš„å•é¡Œï¼›`npm run build` ç¾åœ¨æœƒè¤‡è£½ `sounds/` åˆ° `dist/sounds/`ï¼ŒVercel å’Œ itch.io å…±ç”¨åŒä¸€å¥—éŸ³æ•ˆè·¯å¾‘ã€‚

---

## v0.1.16.2 - 2026-06-14

### ä¿®å¾©
- systems/audio.jsï¼šä¿®å¾© iOS æ‰‹æ©Ÿç‰ˆå®Œå…¨ç„¡éŸ³æ•ˆå•é¡Œä¸‰å€‹æ ¹æœ¬åŽŸå› ï¼špreloadAllSfxBuffers åœ¨ AudioContext å»ºç«‹å‰è·³éŽé è¼‰ã€unlock() éŒ¯èª¤å®Œå…¨éœé»˜ã€Intro éŸ³æ¨‚ä¸ç­‰ unlock å°±æ’­æ”¾
- systems/mutation.jsï¼šä¿®å¾©è®Šç•°å™¨å®˜å‡ç´šç´…é»žåœ¨é»žæ•¸ä¸è¶³æ™‚ä»ç„¶äº®èµ·çš„å•é¡Œï¼ˆaddMutationPoints åˆ¤æ–·æ”¹ç‚º total Ã— 10.01 + spï¼‰
- systems/chat.jsï¼šä¿®å¾©é›²ç«¯å­˜æª”åŒæ­¥åˆ¤æ–·å…¬å¼éŒ¯èª¤ï¼ˆ_calcProgressScore æ”¹ç‚º total Ã— 10.01 + spï¼‰
- systems/combat.js / player.jsï¼šä¿®å¾©æ”»æ“Šå¤šéš»ç›¸é„°æ€ªç‰©æ™‚å‚·å®³æ•¸å­—è¢«åˆä½µé¡¯ç¤ºçš„å•é¡Œï¼ˆåŠ å…¥ noMerge æ©Ÿåˆ¶ï¼‰
- systems/creatures.js / spawning.jsï¼šä¿®å¾©è‚‰é£Ÿæ€ªæ®ºæ‰‹åŒ–å¾Œç¹¼çºŒåƒå±é«” HP è¢«é‡ç®—ç‚ºéŒ¯èª¤å€¼çš„å•é¡Œï¼ˆçµ±ä¸€æˆé•·å…¬å¼ï¼Œå¼•å…¥ scaledBase èˆ‡ killerHpBonusï¼‰

### èª¿æ•´
- systems/combat.jsï¼šæµ®å‹•æ–‡å­—æŒçºŒæ™‚é–“å¾ž 700ms å»¶é•·è‡³ 1200ms

### æ–°å¢žï¼ˆé–‹ç™¼å·¥å…·ï¼‰
- systems/gameState.js / ui.js / main.js / index.html / creatures.js / elite.js / boss.jsï¼šDev Mode æ–°å¢ž â¤ï¸ HP æ•¸å­—é¡¯ç¤ºèˆ‡ ðŸ§  AI ç‹€æ…‹é¡¯ç¤ºé–‹é—œ

---

## v0.1.16.1 - 2026-06-14

### ä¿®å¾©
- systems/mobile.jsï¼šä¿®å¾© iOS æ‰‹æ©Ÿç‰ˆå®Œå…¨ç„¡éŸ³æ•ˆå•é¡Œï¼Œtouchstart handler é ‚éƒ¨è£œä¸Š AudioManager.unlock()
- systems/hud.jsï¼šä¿®å¾© Boss ä¸Šæ–¹è¡€æ¢çš„ debuff åœ–ç¤ºé å·¦å°é½Šï¼ˆix æ”¹ç‚ºå›ºå®š x+8ï¼‰
- systems/mutation.jsï¼šä¿®å¾©è®Šç•°å™¨å®˜ç´…é»žåœ¨å¾ž localStorage è¼‰å…¥èˆŠå­˜æª”å¾Œä»æ®˜ç•™é¡¯ç¤ºçš„å•é¡Œ
- systems/creatures.jsï¼šä¿®å¾©é¬£ç‹—åœåœˆæŠ–å‹•ï¼Œæ”¹ç‚ºè·é›¢é æ™‚è¡å‘ç›®æ¨™é»žã€è·é›¢è¿‘æ™‚æ²¿åˆ‡ç·šç¹žåœˆ
- systems/hud.jsï¼šä¿®å¾©æ‰‹æ©Ÿç‰ˆå…¬å‘Šä½ç½®ï¼ˆæ”¹ç‚º VIEW_H * 0.45ï¼‰
- systems/hud.jsï¼šæ‰‹æ©Ÿç‰ˆ GameInfo å¼·åˆ¶å…©è¡Œé¡¯ç¤ºï¼ˆè¡Œ1ï¼šç”Ÿæ…‹+æ™‚é–“ï¼Œè¡Œ2ï¼šé›£åº¦+æ—¥å¤œï¼‰
- systems/hud.jsï¼šæ‰‹æ©Ÿç‰ˆ Boss HP Bar æœ€å¯¬é™åˆ¶ç‚ºç•«é¢å¯¬åº¦ 55%

---

## v0.1.16.0 - 2026-06-13

### ä¿®å¾©
- systems/elite.js (A1)ï¼šä¿®å¾©æ¯’éœ§éš¼ puddle è¨ˆæ•¸ä¸åŒæ­¥å•é¡Œï¼Œé”ä¸Šé™å¾Œæ¯’éœ§ç‚®ç¾åœ¨èƒ½æ­£å¸¸ç™¼å°„
- systems/mutation.js (A3)ï¼šè®Šç•°å™¨å®˜ç´…é»žæç¤ºæ”¹ç‚ºé»žæ•¸è¶³å¤ å‡ç´šè‡³å°‘ä¸€å€‹æŠ€èƒ½æ™‚æ‰é¡¯ç¤º

### èª¿æ•´
- systems/creatures.js (A4)ï¼šé¬£ç‹—åœæ”»ç§»é™¤ `wheelDist > 4` åœæ­¢æ¢ä»¶ï¼ŒæŒçºŒç¹žåœˆç§»å‹•
- systems/creatures.js (A4)ï¼šé¬£ç‹—æ”»æ“Šå†·å»èˆ‡è»Œé“æ—‹è½‰é€Ÿåº¦ä¾é›£åº¦ speedMultiplier å‹•æ…‹è¨ˆç®—ï¼ˆEasy 1000ms / Normal ~667ms / Hard 500msï¼‰
- systems/creatures.js (A5a)ï¼šå·¨äººéšŠå“¡è·Ÿéš¨é–¾å€¼æ”¹ç‚º `packFollowRange Ã— 0.75`ï¼Œé–¾å€¼ä»¥å…§è‡ªç”±æ¼«éŠï¼›ç§»é™¤éšŠé•·ç­‰å¾…é‚è¼¯ï¼›åŠ å…¥æˆå“¡éš¨æ©Ÿåç§»é‡
- systems/creatures.js (A5b)ï¼šå·¨äººå¡ä½åµæ¸¬ï¼šé€£çºŒ 1 ç§’ä½ç§» < 0.5px å¼·åˆ¶åˆ‡å›ž wandering ä¸¦è¨­æ–°éš¨æ©Ÿæ–¹å‘
- systems/creatures.js (A5c)ï¼šAlpha `packFollowRange` å¾ž 1000 å‡è‡³ 1500
- systems/hud.js / boss.js (A6)ï¼šBoss è¡€æ¢é¡è‰²å…±ç”¨å¸¸æ•¸ï¼Œçµ±ä¸€å„ Boss è¦–è¦ºé¢¨æ ¼
- systems/hud.js / ui.js (A7+B4)ï¼šç²¾è‹±æ€ªèˆ‡ Boss å‡ºç¾å…¬å‘ŠåŠ å…¥ç‰©ç¨®ä»£è¡¨è‰²ï¼›æ‰‹æ©Ÿç‰ˆå…¬å‘Šä½ç½®æ”¹è‡³ç•«é¢ä¸Šæ–¹
- systems/hud.js (B1)ï¼šBoss æŽ§åˆ¶ç‹€æ…‹æŒ‡ç¤ºæ”¹ç‚ºé å·¦å°é½Šè¡€æ¢
- systems/hud.js / mobile.js (B2)ï¼šæ‰‹æ©Ÿç‰ˆå°åœ°åœ–é è¨­ç¸®å°ï¼›GameInfo æ¬„ä½éŽé•·æ™‚è‡ªå‹•æ›è¡Œ
- systems/hud.js (B3)ï¼šé»‘è‰²çµäººå°è©žå­—å¹•ä½ç½®èª¿æ•´è‡³ç•«é¢ä¸­å¤®åä¸‹

---

## v0.1.15.1 - 2026-06-13

### æ–°å¢ž
- Vite æ‰“åŒ… pipelineï¼š`npm run build:itch` ç”¢å‡º `silent-koel-itch.zip` ä¾› itch.io ä¸Šå‚³
- `vite.config.js`ï¼š`base: './'`ï¼Œbundle è¼¸å‡ºåˆ°æ ¹ç›®éŒ„ `index.js`ï¼ˆéž `assets/` å­ç›®éŒ„ï¼‰
- `scripts/pack-itch.js`ï¼šè¤‡è£½éŸ³æ•ˆè³‡æ–™å¤¾ + ç”¨ archiver ç”¢ç”Ÿ zip
- `itch.md`ï¼šitch.io éƒ¨ç½² SOP èˆ‡ CDN è¸©å‘ç´€éŒ„ï¼ˆä¾› Claude Chat åƒè€ƒï¼‰

### èª¿æ•´
- éŸ³æ•ˆè³‡æ–™å¤¾ `Sound MP3/` æ”¹åç‚º `sounds/`ï¼Œå­ç›®éŒ„ `New sound/` æ”¹åç‚º `new/`
- `config/gameConfig.js` çš„ `AUDIO_FILES` æ‰€æœ‰è·¯å¾‘åŒæ­¥æ›´æ–°ï¼ˆ`Sound MP3/New sound/` â†’ `sounds/new/`ï¼‰
- åˆªé™¤èˆŠçš„ `Sound MP3/` è³‡æ–™å¤¾ï¼ˆitch.io CDN å°å«ç©ºæ ¼ç›®éŒ„åå›žå‚³ 403ï¼‰

---

## v0.1.15.0 - 2026-06-09

### æ–°å¢ž
- å„åœ°åœ–é…ç½®åŠ å…¥ `difficulty` æ¬„ä½ï¼ˆ'easy' / 'normal' / 'hard'ï¼‰ï¼Œä¾›ç³»çµ±åˆ¤æ–·é›£åº¦ä½¿ç”¨

### èª¿æ•´
- æ®ºæ‰‹åŒ–å…¬å¼å¸¶å…¥é›£åº¦å€çŽ‡ï¼šè¡€é‡ = baseHp Ã— é›£åº¦å€çŽ‡ Ã— 2ï¼Œæ”»æ“Š = baseDamage Ã— é›£åº¦å€çŽ‡ Ã— 1.5ï¼Œé€Ÿåº¦ä¸è®Šï¼ˆä¿ç•™ç”Ÿæˆæ™‚çš„é›£åº¦é€Ÿåº¦ï¼Œé æ®ºæ‰‹ç­‰ç´šè‡ªç„¶ç´¯åŠ ï¼‰
- æ®ºæ‰‹åŒ–å¾Œæ¯ç´šæˆé•·ï¼ˆkillerCorpseEatenï¼‰ä¹Ÿå¸¶å…¥é›£åº¦å€çŽ‡ï¼Œé¿å…æ™®é€š/å›°é›£æˆé•·é€Ÿåº¦ç›¸åŒ
- æ“Šæ®ºæ®ºæ‰‹è®Šç•°é»žçŽå‹µï¼šæ™®é€š +1ï¼Œå›°é›£ +2
- æ“Šæ®ºæ™®é€šå·¨äººè®Šç•°é»žçŽå‹µï¼šæ™®é€šæ¨¡å¼ +1ï¼Œå›°é›£æ¨¡å¼ +3
- æ“Šæ®º Alpha è®Šç•°é»žçŽå‹µï¼šæ™®é€šæ¨¡å¼ +2ï¼Œå›°é›£æ¨¡å¼ +5ï¼ˆé¡å¤– 20% æ©ŸçŽ‡ +2~6 ç¶­æŒä¸è®Šï¼‰

---

## v0.1.14.4 - 2026-06-08

### ä¿®å¾©
- main.jsï¼šè£œä¸Š HARD_MAP importï¼Œä¿®å¾©å›°é›£æ¨¡å¼ postGame reload å¾Œé›£åº¦é‚„åŽŸé‚è¼¯å¤±æ•ˆ
- systems/hud.jsï¼šå°åœ°åœ–é›£åº¦æ¨™ç±¤è£œä¸Šå›°é›£åˆ†æ”¯ï¼ˆðŸ’€ å›°é›£ï¼‰ï¼Œä¹‹å‰å›°é›£åœ°åœ–ä¸€å¾‹é¡¯ç¤ºã€ŒðŸŒ¿ ç°¡å–®ã€

---

## v0.1.14.3 - 2026-06-08

### ä¿®å¾©
- systems/boss.jsï¼šä¿®å¾©é»‘è‰²çµäººæ¯ç®¡æ“Šç ´å¾Œ +30 ç§’å°Žè‡´ phaseIndex é€€å›žå¶æ•¸ã€è§¸ç™¼æ—¥å¤œåˆ‡æ›çš„å•é¡Œï¼›åŠ æ™‚å¾Œçš„ timeRemaining ä¸Šé™å¤¾åœ¨ phase 7 å¤©èŠ±æ¿ï¼ˆ75 ç§’ï¼‰
- systems/hud.jsï¼šè£œä¸Šé»‘è‰²çµäººé ‚éƒ¨ HUD è¡€æ¢çš„ Hunter å°ˆå±¬é¡¯ç¤ºâ€”â€”ä¾ barsRemaining é¡¯ç¤ºå°æ‡‰éšŽæ®µé¡è‰²ã€ä¸‹ä¸€ç®¡é è¦½ï¼ˆ20% é€æ˜Žï¼‰ã€å‰©é¤˜ç®¡æ•¸ xN æ¨™ç±¤

---

## v0.1.14.2 - 2026-06-08

### ä¿®å¾©
- systems/creatures.jsï¼šç§»é™¤è‰é£Ÿæ€§ Lv4/Lv5 å·¨äººä¸æ”»æ“ŠçŽ©å®¶çš„éŒ¯èª¤æ¢ä»¶ï¼ˆgiantHerbLv < 4ï¼‰ï¼Œå·¨äººæ°¸é å°‡çŽ©å®¶åˆ—ç‚ºå¯é¸ç›®æ¨™
- systems/creatures.jsï¼šä¿®å¾©å·¨äººåˆ°é”æžœå­æ—å¾Œå¡æ­»éœ‡å‹•çš„å•é¡Œï¼›è£œä¸Šåƒæžœå­ç¢°æ’žåˆ¤æ–·ï¼Œåˆ°é”å¾Œç«‹åˆ»ç§»é™¤æžœå­ä¸¦æ¸…é™¤ç›®æ¨™
- systems/utils.jsï¼šdrawArrow() åŠ ä¸Šé»‘è‰²åè‰² outlineï¼ˆstroke åœ¨ fill å‰ï¼‰ï¼Œé¿å…ç®­é ­åœ¨ç›¸ä¼¼åœ°å½¢é¡è‰²ä¸‹éš±æ²’
- main.jsï¼šä¿®å¾©ã€Œå†ä¾†ä¸€æ¬¡ã€é›£åº¦æ¢å¾©é‚è¼¯ç¼ºå°‘ hard åˆ†æ”¯çš„å•é¡Œï¼›è£œä¸Šä¸‰ç¨®é›£åº¦å®Œæ•´åˆ¤æ–·
- .claude/instructions.mdï¼šåŠ å…¥é›£åº¦ä¿ç•™è¦å‰‡ï¼Œè¦æ±‚å†ä¾†ä¸€æ¬¡æµç¨‹å¿…é ˆå¯«å…¥ LAST_DIFFICULTYï¼Œä¸”é›£åº¦æ¢å¾©å¿…é ˆè¦†è“‹ä¸‰å€‹åˆ†æ”¯

---

## v0.1.14.1 - 2026-06-08

### æ–‡ä»¶
- config/compendium_data.jsï¼šè£œä¸Šè‰é£Ÿæ€§ Lv4/5 å·¨äººåŒ–å‚·å®³ -15%/-30% æç¤ºï¼Œä¸¦è£œå…… Lv2 èµ·æžœå­ XP å¢žåŠ èªªæ˜Ž

### ä¿®å¾©
- systems/mobile.jsï¼šä¿®å¾©æ‰‹æ©Ÿç‰ˆ Letterbox ç¸®æ”¾å°Žè‡´ç•«é¢éŽå°çš„å•é¡Œï¼›æ¢å¾© isMobile åˆ†æ”¯â€”â€”æ‰‹æ©Ÿç‰ˆä»ä½¿ç”¨å¡«æ»¿èž¢å¹•é‚è¼¯ï¼ˆMOBILE_GAME_SCALE Ã— viewportï¼‰ï¼Œé›»è…¦ç‰ˆä¿ç•™ Letterboxï¼ˆMath.minï¼‰
- systems/evolution.jsï¼šä¿®å¾©å¾žé¦–é é€²å…¥æŠ€èƒ½æ¨¹ã€åˆ‡åˆ°è®Šç•°é å¾ŒæŒ‰é—œé–‰ï¼ŒèŠå¤©å®¤æ²’æœ‰æ¢å¾©é¡¯ç¤ºçš„å•é¡Œ
- index.html / systems/ui.jsï¼šé–‹ç™¼è€…å·¥å…·é¢æ¿æ”¹ç‚ºéŠæˆ²å®¹å™¨å…§å¯æ‹–æ‹½é¢æ¿ï¼Œé è¨­é¡¯ç¤ºåœ¨å°åœ°åœ–è³‡è¨Šä¸‹æ–¹ï¼Œä¸¦é™åˆ¶ä¸è¶…å‡º 1600Ã—900 éŠæˆ²å®¹å™¨

---

## v0.1.14.0 - 2026-06-07

### æ–°å¢ž
- systems/mobile.jsï¼šçµ±ä¸€ Letterbox ç¸®æ”¾ï¼ˆé›»è…¦ç‰ˆ + æ‰‹æ©Ÿç‰ˆå…±ç”¨ï¼‰ï¼Œscale = Math.min(vw/1600, vh/900)ï¼›ç§»é™¤ isMobile åˆ†æ”¯ï¼Œä¸å†å‘¼å« _setViewSize æ”¹è®Šé‚è¼¯è§£æžåº¦ï¼›export _letterboxScale ä¾›å…¶ä»–æ¨¡çµ„ä½¿ç”¨ï¼›MOBILE_GAME_SCALE æ¨™è¨˜ç‚º deprecated ä¿ç•™
- systems/chat.jsï¼šæ‰€æœ‰ chat panels å¾ž document.body ç§»å…¥ #game-containerï¼Œposition:fixed æ”¹ç‚º position:absoluteï¼Œåº§æ¨™ä»¥ 1600Ã—900 é‚è¼¯ç©ºé–“ç‚ºåŸºæº–ï¼›drag bounds æ”¹ç”¨ 1600/900ï¼›settings panel å®šä½æ”¹ç”¨ offsetLeft/offsetTopï¼›æ‰‹æ©Ÿç‰ˆç™¾åˆ†æ¯” layout æ”¹ç‚ºé‚è¼¯åƒç´ ï¼ˆleft:80px, right:80px, bottom:45/89pxï¼‰ï¼›éµç›¤é«˜åº¦åµæ¸¬é™¤ä»¥ _letterboxScale

---

## v0.1.13.7 - 2026-06-07

### ä¿®å¾©
- index.htmlï¼šè£œä¸Š mobile viewport ç¸®æ”¾é™åˆ¶èˆ‡ viewport-fit=coverï¼Œä¸¦åŠ å…¥ 100dvh fallbackã€Safe Area paddingã€touch-action:noneã€overflow:hiddenï¼Œé¿å…æ‰‹æ©Ÿç€è¦½å™¨å·¥å…·åˆ—èˆ‡ç³»çµ±å®‰å…¨å€é®æ“‹éŠæˆ²ç•«é¢
- systems/mobile.jsï¼šæ‰‹æ©Ÿç¸®æ”¾ã€æ”»æ“Šå€ã€é–ƒç¾å€èˆ‡æ–æ¡¿ canvas æ”¹ç”¨ visualViewport å‹•æ…‹å°ºå¯¸ï¼Œä¸¦ç›£è½ visualViewport resizeï¼Œè®“ç€è¦½å™¨å·¥å…·åˆ—æ”¶åˆæ™‚è§¸æŽ§å€åŸŸä¿æŒå°é½Š

---

## v0.1.13.6 - 2026-06-07

### ä¿®å¾©
- systems/evolution.jsï¼šè£œä¸Šéºæ¼çš„ _saveMutationSkills importï¼Œä¿®å¾©è®Šç•°æŠ€èƒ½å‡ç´šå¾Œæœªå¯«å…¥ localStorage çš„å•é¡Œ
- systems/evolution.jsï¼šç§»é™¤ typeof _saveMutationSkills å®ˆè¡›ï¼Œæ”¹ç‚ºç›´æŽ¥å‘¼å«

---

## v0.1.13.5 - 2026-06-07

### èª¿æ•´
- .claude/instructions.mdï¼šPatchnote åˆ¤æ–·ç§»è‡³ Step 6ï¼Œä¿®æ­£ commit å‰å¿…é ˆç­‰ç¢ºèªçš„æµç¨‹
- .claude/skills/patchnote.mdï¼šStep 4 åŠ å…¥æ˜Žç¢ºåœæ­¢ç­‰å¾…è¦å‰‡ï¼Œç¢ºä¿ Patchnote èˆ‡ä»£ç¢¼åŒä¸€ commit

---

## v0.1.13.4 - 2026-06-07

### èª¿æ•´
- config/patchnotes.jsï¼šæ–°å¢ž v0.1.13.3 çŽ©å®¶å…¬å‘Šæ¢ç›®ï¼ˆå‡ç´šå¡æ­»ã€forceStart å¡æ­»ã€æ‰‹æ©Ÿè§¸æŽ§ä¿®å¾©ï¼‰

---

## v0.1.13.3 - 2026-06-07

### ä¿®å¾©
- systems/evolution.jsï¼šå‡ç´šå›žæ†¶å™¨å®˜å¾Œä¸å†é‡å»ºæ•´å€‹ overlay è·³å›žä¸»æŠ€èƒ½æ¨¹ï¼Œæ”¹ç‚ºåªåˆ·æ–°è®Šç•°é¢æ¿å·¦å³æ¬„
- systems/evolution.jsï¼šforceStart è·¯å¾‘é—œé–‰è®Šç•°æŠ€èƒ½æ¨¹å¾Œä¸å†ç§»é™¤ overlayï¼ˆæ”¹ç‚ºåˆ‡å›žä¸»æŠ€èƒ½æ¨¹ï¼Œè®“çŽ©å®¶å¾žã€Œé–‹å§‹éŠæˆ²ã€æŒ‰éˆ•æ­£å¸¸é€²å…¥ï¼Œè§£æ±ºå¡æ­»å•é¡Œï¼‰
- systems/evolution.jsï¼šè®Šç•°æŠ€èƒ½å‡ç´šæŒ‰éˆ•åŠ å…¥ touchstart äº‹ä»¶ï¼Œä¿®å¾©æ‰‹æ©Ÿç‰ˆè§¸æŽ§å‡ç´šç„¡æ•ˆ

---

## v0.1.13.2 - 2026-06-07

### èª¿æ•´
- DOC_INTEGRITY.mdï¼šé€²åº¦æ›´æ–°ï¼ˆproject_summary æ›´æ–°å®Œæˆç§»è‡³å·²å®Œæˆï¼‰ã€æ¸…é™¤éŽæœŸå·²çŸ¥å•é¡Œæ¢ç›®
- project_summary.mdï¼šæ¯’å‚·æ©Ÿåˆ¶ã€ç²¾è‹±æ€ªç³»çµ±ã€å·¨äºº/Alphaã€é¬£ç‹—ç¾¤é«”ç³»çµ±æè¿°æ›´æ–°è‡³ç¾è¡Œå¯¦ä½œ

---

## v0.1.13.1 - 2026-06-07

### èª¿æ•´
- åˆªé™¤æ ¹ç›®éŒ„ SKILL_FILEHEADER.mdã€SKILL_MAGICCODE.mdï¼ˆå…§å®¹å·²ç§»è‡³ .claude/skills/ï¼‰
- æ–°å»º .claude/skills/ ä¸‹äº”å€‹ Skill æª”æ¡ˆï¼šdoc-auditã€file-headerã€magic-codeã€patchnoteã€compendium
- .claude/instructions.mdï¼šsync-docs æ–°å¢ž Step 1.2ï¼ˆPatchnote åˆ¤æ–·ï¼‰ã€åœ–é‘‘ç¶­è­· SOP ç²¾ç°¡ç‚º 3 è¡Œã€è®€å–æ¸…å–®åŠ å…¥ç¬¬ 7 æ¢ï¼ˆç¢ºèªå¯ç”¨ Skillï¼‰

---

## v0.1.13.0 - 2026-06-07

### æ–°å¢ž/ä¿®å¾©
- systems/combat.js `addMutationPoints` æ”¹ç‚ºæ­£å¼å‘¼å« mutation.js å¯¦ä½œï¼Œç§»é™¤ stubï¼›å·¨äººåŒ–/Alpha/æ®ºæ‰‹åŒ–æ“Šæ®ºç¾åœ¨æ‰çœŸæ­£çµ¦äºˆè®Šç•°é»ž

### èª¿æ•´
- QUICKREF.mdï¼šä¿®æ­£ 11 è™•éŽæœŸæè¿°ï¼ˆESM è¼‰å…¥ã€localStorage key è£œé½Šï¼‰
- systems/hud.jsï¼šç§»é™¤ `console.log && false` dead code
- systems/creatures.jsï¼šç§»é™¤ç„¡å‘¼å«ç«¯çš„ `_drawDirectionArrow()` æ¸¬è©¦å‡½å¼

---

## v0.1.12.0 - 2026-06-07

### æ–°å¢ž
- æ–°å»º DOC_INTEGRITY.mdï¼šæ–‡ä»¶å®Œæ•´æ€§è¦ç¯„èˆ‡é€²åº¦ï¼Œå«å„ªå…ˆç´šè¡¨ã€å¼·åˆ¶è¦å‰‡ã€å·²çŸ¥éŽæœŸæ¸…å–®
- æ–°å»º ARCH.mdï¼šæž¶æ§‹èªªæ˜Žï¼ˆä»£ç¢¼å„ªå…ˆï¼‰ï¼Œå«æ¨¡çµ„æ¸…å–®ã€ESM çµæ§‹ã€gameState æ¬„ä½è¡¨ã€å¾ªç’°ä¾è³´æ¸…å–®
- æ–°å»º .claude/skills/doc-audit.mdï¼šdoc-audit Skillï¼Œå«åŸ·è¡Œæ­¥é©Ÿèˆ‡è¼¸å‡ºæ ¼å¼

### èª¿æ•´
- .claude/instructions.mdï¼šåŠ å…¥é–‹å§‹ä»»å‹™å‰å¿…è®€å€å¡Šã€æ–‡ä»¶åŒæ­¥å¼·åˆ¶è¦å‰‡ã€ç‰ˆæœ¬è™Ÿè¦å‰‡ï¼›ESM è¦å‰‡ä¿®æ­£ï¼ˆç§»é™¤ã€Œä¸ä½¿ç”¨ ES Modulesã€èˆŠæè¿°ï¼‰ï¼›è®€å–æ¸…å–®æ›´æ–°åŠ å…¥ DOC_INTEGRITY.md å’Œ ARCH.md
- MAIN.mdï¼šä¿®æ­£ 6 è™•éŽæœŸ ESM æè¿°ï¼ˆã€Œå…¨åŸŸä½œç”¨åŸŸã€â†’ ESM import/exportï¼›ã€Œå‚³çµ± script æ¨™ç±¤ã€â†’ type="module"ï¼›ã€Œå…¨åŸŸå¸¸æ•¸ã€â†’ ESM åŒ¯å‡ºå¸¸æ•¸ï¼‰

---

## v0.1.11.0 - 2026-06-07

### æ–°å¢ž
- systems/elite.js æ¯’éœ§éš¼æ–°å¢žé›™æŠ€èƒ½ç³»çµ±ï¼š
  - æ”»æ“Šä¸€ï¼ˆæ¯’ç‰†ä¸‰é€£ç‚®ï¼‰ï¼šåŒæ™‚ç™¼å°„ 3 é¡†æ¯’éœ§å½ˆï¼Œè½é»žå½¢æˆåž‚ç›´å°è·¯ç‰†ï¼ˆçŽ©å®¶æ­£å¾Œæ–¹ + å·¦å³å„ 200pxï¼‰
  - æ”»æ“ŠäºŒï¼ˆæ¯’ç‰™å›žæ—‹ï¼‰ï¼šç™¼å°„ 3 æ ¹å›žæ—‹æ¯’ç‰™ï¼ˆä¸­Â±25Â°ï¼‰ï¼Œåˆ°æœ€å¤§å°„ç¨‹å¾ŒæŠ˜è¿”ï¼Œå‘½ä¸­æ–½æ¯’ç–Šå±¤
  - é›™ CD ç³»çµ±ï¼šæ¯’ç‰† 3000+500msã€æ¯’ç‰™ 2500+500msï¼›åŒæ™‚ ready æ¯’ç‰†å„ªå…ˆï¼›å…±ç”¨æ‡²ç½° +200msï¼›èµ·æ‰‹å¿…ç™¼æ¯’ç‰†
- systems/combat.js æ¯’å‚·æ”¹ç‚º poisonStacks ç–ŠåŠ ç³»çµ±ï¼šæ¯å±¤ç¨ç«‹è¨ˆæ™‚ã€æ¯ç§’ç¨ç«‹é¡¯ç¤º -N æµ®å‹•æ–‡å­—ï¼›æ–°æ¯’ä¸è¦†è“‹èˆŠæ¯’
- systems/elite.js æ¯’éœ§çŠ¬å’¬å‚·ã€æ¯’éœ§è½åœ°å‡æ”¹ç”¨ poisonStacks ç–ŠåŠ æ–½æ¯’

### ä¿®å¾©
- systems/elite.js å¹½éˆéš¼è“„åŠ›æœŸé–“æ¯å¹€è¿½è¹¤çŽ©å®¶å³æ™‚ä½ç½®ï¼Œç´…ç·šæº–å¿ƒè·Ÿè‘—ç§»å‹•
- systems/elite.js å¹½éˆéš¼è§’åº¦è¨ˆç®—æ”¹ç”¨ wrappedDeltaï¼Œä¿®æ­£è·‘å‡ºé‚Šç•Œæ™‚æ–¹å‘åç§»
- systems/elite.js æ¯’ç‰†ä¸‰ç‚®è½é»žä¿®æ­£ï¼šä»¥çŽ©å®¶ç‚ºåœ“å¿ƒå±•é–‹ï¼Œä¸å†ä»¥éš¼ç‚ºåœ“å¿ƒ

### å…¶ä»–æ”¹å‹•ï¼ˆé¬£ç‹—è»Šè¼ªæˆ°ã€BossUIé‡å¯«ã€è¿·éœ§ä¿®å¾©ã€éŸ³çˆ†ä¿®å¾©ã€è®Šç•°å™¨å®˜å­˜æª”ä¿®å¾©ï¼‰
- systems/creatures.js é¬£ç‹—è»Šè¼ªæˆ° AI èª¿æ•´
- systems/hud.js Boss è¡€æ¢ UI é‡å¯«
- systems/spawning.js è¿·éœ§ç”Ÿæˆä¿®å¾©
- systems/audio.js éŸ³çˆ†ä¿®å¾©
- systems/mutation.js è®Šç•°å™¨å®˜å­˜æª”ä¿®å¾©
- systems/ui.js è¨­å®šè¼”åŠ©åŠŸèƒ½ç§»é™¤æ–°æ‰‹æ•™å­¸ Hint èªªæ˜Žæ–‡å­—

---

## v0.1.10.0 - 2026-06-07

### æ–°å¢ž/é‡å¯«
- systems/creatures.js å·¨äºº/Alpha ç³»çµ±å®Œæ•´é‡å¯«ï¼š
  - å·¨äººåŒ–å¾Œä¸å†å¼·åˆ¶æˆç‚ºéšŠé•·ï¼Œæ”¹ç‚ºã€Œç„¡éšŠä¼ç¨ç«‹å·¨äººã€
  - å…©éš»ç„¡éšŠä¼ç¨ç«‹å·¨äººï¼ˆåŒæ—åŒç”Ÿæ…‹ï¼‰è·é›¢ â‰¤ 300px ç›¸é‡ â†’ HP è¼ƒé«˜è€…å‡æ ¼ Alphaï¼ˆæ¯3ç§’æŽƒæï¼‰
  - Alpha æ­»å¾ŒæŽƒæå…¨åœ–ï¼šéšŠä¼ â‰¥ 2 éš»çš„å·¨äººéšŠé•·ä¸­ HP æœ€é«˜è€…ç¹¼æ‰¿ç‚ºæ–° Alpha
  - åªæœ‰ã€ŒéšŠä¼ â‰¥ 2 éš»ï¼ˆå«éšŠé•·ï¼‰çš„å·¨äººéšŠé•·ã€æ‰èƒ½è¢«é¸ç‚º Alphaï¼ˆå–®äººéšŠä¼ä¸è§¸ç™¼ï¼‰
- systems/creatures.js å·¨äººå¡æ­»ä¿®å¾©ï¼š
  - _seekingFruit åƒåˆ°æžœå­å¾Œè‹¥ hp > maxHp * 0.5 ç«‹åˆ»é€€å‡ºï¼Œä¸ç¹¼çºŒæ‰¾æžœå­
  - _seekingFruit é–‹å§‹è¨ˆæ™‚ _seekingFruitStartï¼Œè¶…éŽ 5 ç§’å¼·åˆ¶é€€å‡º
  - ä¸åŒéšŠä¼å·¨äººè·é›¢ < (radius + å°æ–¹radius + 20) æ™‚æ–½åŠ æŽ¨é–‹åŠ› 2px

---

## v0.1.9.0 - 2026-06-07

### æ–°å¢ž
- main.js æ–°å¢ž Loading ç•«é¢å•Ÿå‹•æµç¨‹ï¼ŒéŠæˆ²æ­£å¼åˆå§‹åŒ–å‰é¡¯ç¤ºå…¨é»‘è¼‰å…¥ç•«é¢ã€ç‰ˆæœ¬è™Ÿã€ä½œè€…èˆ‡éŸ³æ•ˆé è¼‰é€²åº¦æ¢
- systems/audio.js æ–°å¢ž `preloadAllSfxBuffers(onProgress)`ï¼Œåœ¨ AudioContext å¯ç”¨æ™‚é è¼‰æ‰€æœ‰éžéŸ³æ¨‚éŸ³æ•ˆ AudioBufferï¼Œå®Œæˆå¾Œæ‰æ·¡å‡º Loading ä¸¦å•Ÿå‹•éŠæˆ²
- systems/ui.js / systems/evolution.js çš„é–‹å§‹éŠæˆ²å…¥å£æ”¹èµ° `startGameWithLoading()`ï¼Œç¢ºä¿é¦–é ã€æ•…äº‹å°Žå¼•ã€æŠ€èƒ½æ¨¹é–‹å§‹éƒ½æœƒå…ˆé¡¯ç¤º Loading

---

## v0.1.8.2 - 2026-06-07

### ä¿®å¾©
- systems/daynight.js ç™½å¤©ç²¾è‹±æ€ªæ¶ˆæ•£æ™‚åŒæ­¥æ¸…é™¤ä¸Šæ–¹è¡€æ¢è¿½è¹¤ç‹€æ…‹ï¼Œé¿å… UI æ®˜ç•™
- systems/hud.js ä¸Šæ–¹è¡€æ¢ä½ç½®æ”¹ç‚ºåŒæ™‚é¿é–‹å·¦ä¸Šè§’ UI èˆ‡å³ä¸Šè§’å°åœ°åœ–ï¼Œä¿®æ­£æ‰‹æ©Ÿç‰ˆè¡€æ¢å¡åœ¨å…©è€…ä¸­é–“
- systems/hud.js ä¸Šæ–¹è¡€æ¢åç¨±å„ªå…ˆä½¿ç”¨ target.labelï¼Œä¿®æ­£ç²¾è‹±æ€ªæ­»äº¡æ·¡å‡ºæœŸé–“é¡¯ç¤ºã€ŒæœªçŸ¥ã€

---

## v0.1.8.1 - 2026-06-07

### ä¿®å¾©
- systems/creatures.js é¬£ç‹—éšŠåä½ç½®ç§»åˆ°ç”Ÿç‰©åœ“åœˆä¸‹æ–¹ï¼ˆ+14pxï¼‰ï¼Œä¿®æ­£éšŠåèˆ‡åå­—è¦–è¦ºé‡ç–Šå°Žè‡´çš„åå­—åç§»å•é¡Œ

---

## v0.1.8.0 - 2026-06-07

### æ–°å¢ž
- config/patchnotes.js è£œå…… v0.1.3.3 ~ v0.1.7.2 æ‰€æœ‰ç‰ˆæœ¬çš„çŽ©å®¶å…¬å‘Šï¼Œåˆä½µç‚º v0.1.8.0 å…¬å‘Šæ¢ç›®

### ç‰ˆæœ¬ç®¡ç†
- GAME_INFO.version å‡è‡³ v0.1.8.0

---

## v0.1.7.2 - 2026-06-07

### ä¿®å¾©
- æ¯’éœ§éš¼æ”»æ“Š 3 æ¬¡å¾Œå¡æ­»ï¼špuddle éŽæœŸæ™‚éžæ¸› `_venomPuddleCount`ï¼Œelite.js åŠ å…¥ç¨ç«‹ puddle å‚·å®³ tick + éŽæœŸæ¸…ç†ï¼Œä¸å†ä¾è³´ boss.js desert è·¯å¾‘
- å¹½éˆéš¼ä¸æ”»æ“Šï¼šaggroRange æ“´å¤§ï¼ˆspecterFalcon 1400 / shadowFalcon 900 / venomFalcon 1050ï¼‰ï¼Œæä¾›è¿½æ“Šç·©è¡å€
- å¹½éˆéš¼è“„åŠ›ä¸­çŽ©å®¶è·‘å‡ºå°„ç¨‹å¾Œ falcon å‡çµï¼šè“„åŠ›é€²è¡Œä¸­ï¼ˆ`_aimTarget` å­˜åœ¨ï¼‰å…è¨±è·¨è¶Š attackRange å®Œæˆå°„æ“Šï¼›å­å½ˆ maxRange æ”¹ç‚º `attackRange Ã— 2`
- é»‘è‰²çµäºº Phase 1/3 è“„åŠ›å¾Œä¸é–‹æ§ï¼š`aiming` state åŠ å…¥ chasing/strafing æ¢ä»¶ï¼Œç¢ºä¿å¾ŒçºŒå¹€ç¹¼çºŒåŸ·è¡Œè“„åŠ›å®Œæˆé‚è¼¯
- é»‘è‰²çµäººä¸æ”»æ“Šï¼šPhase 1 triggerRange 1500â†’1800ï¼ŒPhase 2 æ”»æ“Šè§¸ç™¼è·é›¢ 800â†’1000

### é‡æ§‹ï¼ˆCodexï¼‰
- elite.js `initEliteOrder()`ï¼šæ”¹ç”¨ mapSeed æ±ºå®šæ€§äº‚åºï¼Œä¸‰éš¼/ä¸‰çŠ¬åŒå±€çµ±ä¸€ï¼ˆä¸å†æ¯å¤œéš¨æ©Ÿï¼‰
- boss.js é»‘è‰²çµäººè¡€æ¢ï¼šé¡¯ç¤ºç•¶å‰ HP æ•¸å­— + ä¸‹ä¸€ç®¡é è¦½è‰²å½©
- hud.js ç²¾è‹±æ€ªä¸Šæ–¹è¡€æ¢åç¨±ï¼šæ”¹ç”¨ `elite.label` é¡¯ç¤ºæ­£ç¢ºåç¨±

---

## v0.1.7.1 - 2026-06-07

### ä¿®å¾©
- boss.js `_screenPos is not defined`ï¼š
  `_drawHunterAimingWarning()` æ”¹ç”¨ `worldToScreen()` å–å¾—èž¢å¹•åº§æ¨™
  ï¼ˆèˆ‡ elite.js åŒé¡žå•é¡Œï¼ŒESM é·ç§»éºæ¼ï¼‰

---

## v0.1.7.0 - 2026-06-07

### é‡æ§‹
- Web Audio API å®Œæ•´é·ç§»ï¼ˆaudio-refactor åˆ†æ”¯ï¼‰ï¼š
  - AudioContext + masterGain / musicGain / sfxGain æž¶æ§‹
  - éŸ³æ¨‚ç³»çµ±æŽ¥ GainNodeï¼ˆintroTheme + playMusicï¼‰
  - éŸ³æ•ˆæ”¹ç”¨ AudioBuffer + AudioBufferSourceNode
  - iOS unlockï¼šuser gesture æ™‚ audioContext.resume()
  - ä¿ç•™ HTMLAudio pool ä½œç‚º fallback

### ä¿®å¾©
- elite.js `_screenPos is not defined`ï¼š
  `_drawHunterElite()` æ”¹ç”¨ `worldToScreen()` å–å¾—èž¢å¹•åº§æ¨™

---

## v0.1.6.3 - 2026-06-07

### é‡æ§‹
- Web Audio API é·ç§»ï¼ˆæ–¹æ¡ˆäºŒï¼Œaudio-refactor åˆ†æ”¯ï¼‰ï¼š
  - Part Aï¼šå»ºç«‹ AudioContext + masterGain / musicGain / sfxGain
  - Part Bï¼šéŸ³æ¨‚ç³»çµ±æŽ¥ GainNodeï¼ˆintroTheme + playMusicï¼‰
  - Part Cï¼šéŸ³æ•ˆæ”¹ç”¨ AudioBuffer + AudioBufferSourceNode
  - iOS unlockï¼šuser gesture æ™‚å‘¼å« audioContext.resume()
  - ä¿ç•™ HTMLAudio pool ä½œç‚º AudioBuffer æœªå°±ç·’æ™‚çš„ fallback

---

## v0.1.6.2 - 2026-06-07

### ä¿®å¾©
- iOS Safari éŸ³æ¨‚é–‹é—œä¿®å¾©ï¼ˆæ–¹æ¡ˆ 1ï¼‰ï¼š
  `refreshMusicVolume()` æ”¹ç”¨ pause/play æŽ§åˆ¶ï¼Œä¸ä¾è³´ volume = 0
  `playMusic()` fade-in æ¯ tick é‡æ–°è®€å–éŸ³é‡ç›®æ¨™
  éŸ³æ¨‚é—œé–‰ç‹€æ…‹ä¸‹ `playMusic()` ä¸å‘¼å« play()ï¼Œç­‰é–‹å•Ÿæ™‚æ¢å¾©

---

## v0.1.6.1 - 2026-06-06

### æ•ˆèƒ½å„ªåŒ–
- Stage Eï¼šç§»é™¤ç”Ÿç‰©åç¨±æ¨™ç±¤ shadowBlurï¼Œæ”¹ç”¨ strokeText æé‚Š
- Stage Eï¼šåç¨±æ¨™ç±¤æ”¹ç”¨ viewport cullingï¼Œç§»é™¤ 300px è·é›¢å‰”é™¤

### èª¿æ•´
- getGameFont() å¼·åˆ¶å¤§å­—ç²—é«”ï¼ˆsize + 8pxï¼Œæ°¸é  boldï¼‰
- æµ®å‹•æ–‡å­—æ°¸é å¤§å­— + strokeText æé‚Š
- fontBoldLarge é–‹é—œæ”¹ç‚ºã€Œç„¡å­—å¤©æ›¸/Greekã€ï¼Œé–‹å•Ÿå¾Œéš±è—æ‰€æœ‰éŠæˆ²æ–‡å­—ï¼ˆä¿ç•™è¡€æ¢ï¼‰
- ç§»é™¤ fontBoldLargeHint å’Œç›¸é—œ DOM å…ƒç´ 

---

## v0.1.6.0 - 2026-06-06

### é‡æ§‹
- Stage C Slice 3ï¼šå»ºç«‹ `stats/index.js`ï¼ŒsessionStats è®€å¯«çµ±ä¸€ï¼ˆ`resetSessionStats` / `getSessionStats` / `incrementStat` / `updateStatMax`ï¼‰ï¼›`main.js`ã€`systems/combat.js`ã€`systems/player.js`ã€`config/supabase.js`ã€`systems/leaderboard.js` å…¨éƒ¨æ”¹ç”¨ stats å…¥å£
- Stage C Slice 2ï¼š`systems/evolution.js` fromHome/forceStart èˆ‡ postGame çš„ mutationSkills è¼‰å…¥æ”¹å‘¼å« `initMutationSkills()`ï¼Œä¸å†ç›´æŽ¥ `Object.assign` å¯«å…¥ `gameState.mutationSkills`
- æ¸¬è©¦ï¼šæ–°å¢ž `tests/stats/stats.test.js`ï¼ˆ9 testsï¼‰ï¼Œä¿®æ­£ `vi.hoisted` hoisting å•é¡Œï¼›ç¸½è¨ˆ 64/64 é€šéŽ

---

## v0.1.5.2 - 2026-06-06

### ä¿®å¾©
- **é˜¿å¥‡çˆ¾ Charge Attack éŸ³æ•ˆ**ï¼šç¬¬ä¸‰æ ¼å……èƒ½ï¼ˆchargeConsumed >= 3ï¼‰æ’­æ”¾ `archerAttackCrit`ï¼Œå…¶ä»–å……èƒ½éšŽæ®µæ’­æ”¾ `archerAttackNormal`ï¼ˆ`main.js` mouseup äº‹ä»¶ï¼‰
- **é˜¿å¥‡çˆ¾æ­»äº¡éŸ³æ•ˆ**ï¼šæ­»äº¡æ™‚æ’­æ”¾ `archerDeath` è€Œéžé€šç”¨ `death`ï¼ˆ`systems/evolution.js` showSkillTreeï¼‰
- **å†ä¾†ä¸€å±€è§’è‰²é‡ç½®**ï¼šautostart è·¯å¾‘è£œä¸Šå¾ž localStorage é‚„åŽŸ `lastCharacter`ï¼Œä¿®å¾©å†ä¾†ä¸€å±€å¾Œè§’è‰²æ°¸é é¡¯ç¤ºå™ªéµ‘çš„å•é¡Œï¼ˆ`main.js` window.onloadï¼‰

---

## v0.1.5.1 - 2026-06-06

### ä¿®å¾©
- **BUG-01**ï¼šé˜¿å¥‡çˆ¾è§’è‰²éŸ³æ•ˆèª¤æ¤ä¿®å¾©ï¼Œ4 å€‹å‘¼å«é»žåŠ å…¥è§’è‰²åˆ¤æ–·ï¼ˆ`selectedCharacter === 'archerfish'`ï¼‰
  - `systems/combat.js`ï¼šå—å‚·éŸ³æ•ˆè·¯ç”±ï¼ˆ`hurt` â†’ `archerHurt`ï¼‰
  - `systems/combat.js`ï¼šæ”»æ“Š/æš´æ“ŠéŸ³æ•ˆè·¯ç”±ï¼ˆ`attackNormal/attackCrit` â†’ `archerAttackNormal/archerAttackCrit`ï¼‰
  - `systems/player.js`ï¼šé ç¨‹æ”»æ“ŠéŸ³æ•ˆè·¯ç”±ï¼ˆ`attackNormal` â†’ `archerAttackNormal`ï¼‰
  - `main.js`ï¼šæ»‘é¼ é»žæ“Šæ”»æ“ŠéŸ³æ•ˆè·¯ç”±ï¼ˆ`attackNormal` â†’ `archerAttackNormal`ï¼‰
- **TODO-UI-01**ï¼šç²¾è‹±æ€ªå…¬å‘Šæ–‡å­—æ‰‹æ©Ÿç‰ˆæˆªæ–·ä¿®å¾©ï¼ˆ`systems/hud.js`ï¼‰
  - `VIEW_W < 700` æ™‚å­—é«”å¾ž 36px ç¸®å°ç‚º 22px
  - `ctx.fillText` åŠ å…¥ `maxWidth = VIEW_W * 0.9` é˜²æ­¢ç•«å¸ƒé‚Šç·£æˆªæ–·

---

## v0.1.5.0 - 2026-06-06

### æž¶æ§‹
- ESM å…¨æ¨¡çµ„åŒ–å®Œæˆï¼ˆStage 0â€“3ï¼‰ï¼š37 å€‹ JS æª”æ¡ˆå¾žå…¨åŸŸ `<script src>` æ”¹ç‚º `import`/`export`
- `index.html` æ”¹ç‚ºå–®ä¸€ `<script type="module" src="./main.js">` å…¥å£
- `storage/index.js`ï¼šé›†ä¸­æ‰€æœ‰ `localStorage` key å®šç¾©èˆ‡è®€å¯« helper
- `systems/audio.js`ï¼šAudioManager çµ±ä¸€éŸ³é‡ç‹€æ…‹ï¼ˆ`_vol`ã€`loadVolume`ã€`setVolume`ã€`serializeVolume`ï¼‰
- `systems/evolution.js`ï¼š`buildSkillTreeOverlay` æ‹†æˆ coordinator + 4 å€‹ private sub-functions
- `mutation.js` â†” `evolution.js` å¾ªç’°ä¾è³´æ”¹ç”¨ `CustomEvent` è§£è€¦
- `systems/ui.js`ï¼š`showSettings()` ç§»é™¤ `fromHome` åƒæ•¸ï¼Œæ”¹ç”¨ DOM è‡ªå‹•åµæ¸¬
- çµç®—ç•«é¢çµ±ä¸€ï¼šæ–°å¢ž `buildEndGameOverlay()` å…±ç”¨å‹åˆ©/æ­»äº¡å¤–æ®¼

---

## v0.1.4.3 - 2026-06-05

### æ•ˆèƒ½
- `showXPPopup` æ”¹ç‚ºå‘¼å« Canvas `showFloatingText`ï¼Œç§»é™¤ DOM XP popup pool
  - å®Œå…¨ç§»é™¤ `_XP_POOL_SIZE`ã€`_xpPopupPool`ã€`_xpPoolReady`ã€`_initXpPool()`
  - `showXPPopup` ç›´æŽ¥å‘¼å« `showFloatingText`ï¼Œåƒæžœå­æµ®å­—ç´å…¥ Canvas æ‰¹æ¬¡ç¹ªè£½
  - ç§»é™¤ `main.js` ä¸­çš„ `_initXpPool()` å‘¼å«
- AudioManager éŸ³æ•ˆç¯€æµï¼šä¸€èˆ¬éŸ³æ•ˆ 100msï¼Œhurt/attack/playerAttack 150ms
  - æ–°å¢ž `_sfxLastPlayed` å¿«å–è¨˜éŒ„ä¸Šæ¬¡æ’­æ”¾æ™‚é–“
  - `play()` é–‹é ­åŠ å…¥ç¯€æµåˆ¤æ–·ï¼Œé¿å…å¤šéš»ç”Ÿç‰©åŒå¹€åŒæ™‚æ’­æ”¾éŸ³æ•ˆé€ æˆæ‰‹æ©ŸéŸ³è¨Šå£“åŠ›

---

## v0.1.4.2 - 2026-06-05

### æ•ˆèƒ½
- `showFloatingText` å¾ž DOM pool æ”¹ç‚º Canvas æ‰¹æ¬¡ç¹ªè£½
  - å®Œå…¨ç§»é™¤ `_FLOAT_POOL_SIZE`ã€`_floatPool`ã€`_floatPoolReady`ã€`_initFloatPool()`ã€`resetFloatPool()` åŠ `.float-text-animate` CSS
  - `gameState.floatTexts` é™£åˆ—çµ±ä¸€æ”¶é›†æµ®å­—ï¼Œ`drawGame()` æœ«æ®µä¸€æ¬¡æ‰¹æ¬¡ç¹ªè£½ï¼Œç„¡å¤šå±¤ text-shadow
  - æ‰‹æ©Ÿä¸Šé™ 12 å€‹ï¼Œæ¡Œæ©Ÿ 20 å€‹ï¼›100ms å…§åŒä½ç½®åŒé¡è‰²æ•¸å­—è‡ªå‹•åˆä½µ
  - å­—å¤§åˆç²—æ¨¡å¼ï¼š+8px + ç°¡å–®é»‘è‰²æé‚Šä¸€æ¬¡ï¼ˆå–ä»£ 4 å±¤ CSS shadowï¼‰

---

## v0.1.4.1 - 2026-06-05

### æ•ˆèƒ½
- `updateTreeFruitProduction` ç¯€æµæ”¹ç‚ºç´¯ç©æ™‚é–“è£œçµ¦ï¼šç¯€æµå‰ç´¯ç© `elapsed`ï¼Œè§¸ç™¼æ™‚ä¸€æ¬¡æŠŠ elapsed è£œçµ¦ `tree.fruitTimer`ï¼Œæžœå­ç”Ÿç”¢é€Ÿåº¦æ¢å¾©æ­£å¸¸ï¼ˆä¿®å¾©ç¯€æµå°Žè‡´é€Ÿåº¦è®Š 1/30 çš„å‰¯ä½œç”¨ï¼‰
- `showFloatingText` ç§»é™¤ `void el.offsetWidth` å¼·åˆ¶ reflowï¼Œæ”¹ç”¨ `requestAnimationFrame` + CSS class `.float-text-animate` åˆ‡æ›è§¸ç™¼ animationï¼Œæ”¹å–„ iOS Safari é€£çºŒæµ®å­—æ™‚çš„ spike
- AudioManager é ç†±æ¸…å–®ä¿®æ­£ï¼šç§»é™¤ä¸å­˜åœ¨çš„ `'attacked'`ï¼Œè£œä¸Šå¯¦éš›æ’­æ”¾çš„ `'hurt'`ï¼Œé¿å…ç¬¬ä¸€æ¬¡è¢«æ‰“æ™‚ lazy å»ºç«‹ pool é€ æˆå¡é “

---

## v0.1.4.0 - 2026-06-05

### æ•ˆèƒ½
- `showFloatingText` æ”¹ç”¨ DOM ç‰©ä»¶æ± ï¼ˆpool size 20ï¼‰ï¼Œé¿å…æ¯æ¬¡ `createElement` + CSS animation + `remove`ï¼Œå¤§å¹…æ”¹å–„æ‰‹æ©Ÿå¡é “
  - æ–°å¢žæ¨¡çµ„é ‚éƒ¨ `_FLOAT_POOL_SIZE`ã€`_floatPool`ã€`_floatPoolReady` ä¸‰å€‹å¸¸æ•¸/è®Šæ•¸
  - æ–°å¢ž `_initFloatPool()`ï¼šç¬¬ä¸€æ¬¡å‘¼å« `showFloatingText` æ™‚ lazy initï¼Œé å»º 20 å€‹ `div` ä¸¦ append è‡³ `#ui-overlay`
  - `showFloatingText` æ”¹ç‚ºå¾ž pool å–é–’ç½® slotï¼Œé‡ç½® animation å¾Œé‡è¤‡ä½¿ç”¨ï¼Œpool æ»¿æ™‚ç›´æŽ¥è·³éŽä¸å¡ä¸»åŸ·è¡Œç·’
  - æ–°å¢ž `resetFloatPool()`ï¼Œåœ¨ `initializeGame()` æ¯å±€é–‹å§‹æ™‚æ¸…é™¤æ‰€æœ‰ timer ä¸¦é‡ç½® pool ç‹€æ…‹

---

## v0.1.3.9 - 2026-06-05

### æ•ˆèƒ½
- AudioManager éŸ³æ•ˆæ”¹ç”¨ç‰©ä»¶æ± ï¼Œé¿å… iOS Safari cloneNode å¡é “
  - æ–°å¢ž `_sfxPools`ï¼ˆæ¯å€‹éŸ³æ•ˆ 4 å€‹å¯¦ä¾‹ï¼‰èˆ‡ `_getPooledAudio(key)`
  - `play()` æ”¹ç‚ºå¾žæ± å–é–’ç½®å¯¦ä¾‹ï¼Œä¸å†æ¯æ¬¡ `cloneNode()`ï¼›éŸ³é‡ç‚º 0 æ™‚ç›´æŽ¥è·³éŽ
  - `init()` é ç†± `eatFruit`ã€`levelUp`ã€`attacked` ä¸‰å€‹å¸¸ç”¨éŸ³æ•ˆæ± 
- `updateTreeFruitProduction` æ”¹ç‚ºæ¯ 500ms åŸ·è¡Œä¸€æ¬¡ï¼ˆç´„æ¯ 30 å¹€ï¼‰
  - æ–°å¢žæ¨¡çµ„é ‚éƒ¨ `_treeProductionTimer` è¨ˆæ™‚å™¨
  - æ–°å¢ž `resetTreeProductionTimer()`ï¼Œåœ¨ `initializeGame()` æ¯å±€é–‹å§‹æ™‚é‡ç½®
- `updateMinimapFog` æ”¹ç‚ºæ¯ 3 å¹€æ›´æ–°ä¸€æ¬¡
  - æ–°å¢žæ¨¡çµ„é ‚éƒ¨ `_fogFrameCount` è¨ˆæ•¸å™¨
  - æ–°å¢ž `resetFogFrameCount()`ï¼Œåœ¨ `initializeGame()` æ¯å±€é–‹å§‹æ™‚é‡ç½®

---

## v0.1.3.8 - 2026-06-05

### æ•ˆèƒ½
- `worldToScreen` å’Œ `wrappedDelta` æ”¹ç‚ºç‰©ä»¶é‡ç”¨ï¼Œå¤§å¹…æ¸›å°‘æ¯å¹€ GC allocationï¼Œæ”¹å–„æ‰‹æ©Ÿ spike lag
  - `camera.js` é ‚éƒ¨æ–°å¢ž `_screenPos` å’Œ `_delta` é‡ç”¨ç‰©ä»¶
  - `worldToScreen` ç›´æŽ¥å¯«å…¥ `_screenPos` ä¸¦å›žå‚³åŒä¸€ç‰©ä»¶ï¼Œä¸å†æ¯æ¬¡ `return { x, y }`
  - `wrappedDelta` ç›´æŽ¥å¯«å…¥ `_delta` ä¸¦å›žå‚³åŒä¸€ç‰©ä»¶ï¼Œä¸å†æ¯æ¬¡ `return { dx, dy }`
  - ä¿®æ­£æ‰€æœ‰ã€Œé€£çºŒå‘¼å«å¾ŒåŒæ™‚ä½¿ç”¨å…©å€‹çµæžœã€çš„å‘¼å«é»žï¼ˆå…± 5 è™•ï¼‰ï¼Œç«‹å³èƒå–æ•¸å€¼é˜²æ­¢ç‰©ä»¶è¢«è¦†è“‹ï¼š
    - `boss.js` `_drawSharkChargeArrow`ï¼š`fromSx/fromSy` + `toSx/toSy`
    - `boss.js` `_drawHunterAimingWarning`ï¼š`bsx/bsy` + `tsx/tsy`
    - `elite.js` `_drawHunterElite`ï¼šç°½åæ”¹ç‚ºå‚³å…¥æ•¸å€¼ `(sx, sy)`ï¼Œå…§éƒ¨çž„æº–ç·šæ”¹ç”¨ `tsx/tsy`
    - `hud.js` `_drawArcherLockOn`ï¼š`psx/psy` + `tsx/tsy`
    - `hud.js` `drawGame` ä¸­ `ps`ï¼šæ–°å¢ž `psx/psy` å¿«å–ï¼Œé–ƒç¾ç‰¹æ•ˆæ”¹ç”¨ `sax/say/sbx/sby`

---

## v0.1.3.7 - 2026-06-05

### ä¿®å¾©
- éˆæ•çŸ¥è¦ºä¸‰ç­‰ç´šæ”¹ç”¨å¿«å–ï¼Œé™åˆ¶é‡ç®—é »çŽ‡ï¼Œå¤§å¹…æ¸›å°‘æ‰‹æ©Ÿ spike lag
  - Lv1 æžœå­è·¯å¾‘ï¼ˆ`findBestPerceptionPath`ï¼‰ï¼šè·ä¸Šæ¬¡è¨ˆç®— >500msã€æžœå­æ•¸é‡æ”¹è®Šã€æˆ–çŽ©å®¶ç§»å‹• >50px æ‰é‡ç®—
  - Lv2 æœ€è¿‘å±é«”ï¼šè·ä¸Šæ¬¡è¨ˆç®— >300ms æˆ–å±é«”æ•¸é‡æ”¹è®Šæ‰é‡ç®—
  - Lv3 æœ€è¿‘ç™½éª¨ï¼šè·ä¸Šæ¬¡è¨ˆç®— >300ms æˆ–ç™½éª¨æ•¸é‡æ”¹è®Šæ‰é‡ç®—
  - æ–°å¢žæ¨¡çµ„é ‚éƒ¨ `_perceptionCache` å¿«å–ç‰©ä»¶
  - æ–°å¢ž `resetPerceptionCache()`ï¼Œåœ¨ `initializeGame()` æ¯å±€é–‹å§‹æ™‚é‡ç½®å¿«å–

---

## v0.1.3.6 - 2026-06-05

### ä¿®å¾©
- `tutorial.js` `_highlightDayNight` setTimeout è¨˜æ†¶é«”æ´©æ¼ï¼šæ”¹ç”¨å¯æ¸…é™¤çš„ timer IDï¼ˆ`_dnFlashTimer`ï¼‰ï¼Œåœæ­¢æ¢ä»¶æ™‚æ­£ç¢º clearTimeoutï¼Œä¸å†æ°¸ä¹…åœ¨èƒŒæ™¯è·‘
- æ–°å¢ž `_clearDnFlash()` çµ±ä¸€æ¸…é™¤ timer èˆ‡ DOM æ¨£å¼ï¼Œåœ¨ `_endTutorial()`ã€`showTutorial()` é ­éƒ¨å‘¼å«
- æ–°å¢ž `resetTutorial()`ï¼š`initializeGame()` æ¯å±€é–‹å§‹æ™‚å¼·åˆ¶é‡ç½®æ•™å­¸ç‹€æ…‹ï¼Œé˜²æ­¢è·¨å±€ timer æ®˜ç•™å°Žè‡´æ‰‹æ©Ÿè¶Šä¾†è¶Šå¡

---

## v0.1.3.5 - 2026-06-05

### ä¿®å¾©
- `updateUI` dirty checkï¼šæ¯å¹€ DOM æ“ä½œå¾ž 6~9 æ¬¡é™ç‚ºåªåœ¨å€¼æ”¹è®Šæ™‚æ›´æ–°ï¼Œæ¸›å°‘æ‰‹æ©Ÿå¡é “
  - æ–°å¢žæ¨¡çµ„é ‚éƒ¨ `_uiCache` å¿«å–ç‰©ä»¶ï¼Œè¨˜éŒ„ä¸Šæ¬¡å¯«å…¥çš„ xp æ–‡å­—ã€xp æ¢å¯¬ã€HPã€ç”Ÿæ…‹åœˆã€æ™‚é–“ã€éŠçŽ©æ™‚é–“ã€è®Šç•°ç­‰ç´šã€ç´…é»ž
  - `_drawHpHearts` åªåœ¨ `player.hp` æˆ– `player.maxHp` æ”¹è®Šæ™‚é‡ç¹ª
  - æ–°å¢ž `resetUICache()`ï¼Œåœ¨ `initializeGame()` æ¯å±€é–‹å§‹æ™‚é‡ç½®å¿«å–

---

## v0.1.3.4 - 2026-06-04

### ä¿®å¾©
- é¦–é æŠ€èƒ½æ¨¹çš„éš±è—å™¨å®˜ç¹¼æ‰¿é¸æ“‡æ°¸é åªèƒ½é¸ä¸€å€‹ï¼ˆ`homeSelHidden` å–®é¸é‚è¼¯ï¼‰
  - æ”¹ç‚ºé™£åˆ—å¤šé¸ï¼Œæ­£ç¢ºè®€å– `hiddenOrganLimit`ï¼ˆå›žæ†¶å™¨å®˜ç­‰ç´š + 1ï¼‰
  - æ¨™é¡Œå‹•æ…‹é¡¯ç¤ºå¯ç¹¼æ‰¿æ•¸é‡ï¼ˆä¸Šé™ > 1 æ™‚é¡¯ç¤ºã€Œé¸æ“‡ç¹¼æ‰¿æœ€å¤š N å€‹ã€ï¼‰
  - èˆ‡ postGame è·¯å¾‘çš„é¸æ“‡é‚è¼¯ä¿æŒä¸€è‡´

---

## v0.1.3.3 - 2026-06-04

### ä¿®å¾©
- å›žæ†¶å™¨å®˜å‡ç´šå¾Œ postGame æŠ€èƒ½æ¨¹å¼·å¤§å™¨å®˜é¸æ“‡ä¸Šé™æœªæ›´æ–°
  - `buildSkillTreeOverlay` postGame æ¨¡å¼åŠ å…¥ localStorage å¼·åˆ¶é‡è¼‰ `mutationSkills`
  - ç§»é™¤ `_checkAndRepairMutationSkills` åœ¨æ¯æ¬¡é–‹å•Ÿè®Šç•°é¢æ¿æ™‚çš„èª¤å‘¼å«ï¼ˆä¿ç•™ `initMutationSkills` è¼‰å…¥æ™‚çš„é©—ç®—ï¼‰
  - ç§»é™¤ v0.1.2.0 éºç•™çš„ `[Debug]` console.log
- éŸ³é‡è¨­å®šåˆ·æ–°å¾Œæ­¸å›žé è¨­å€¼
  - `window.onload` è£œä¸Š `loadSettings()`ï¼Œç¢ºä¿é é¢è¼‰å…¥æ™‚ç«‹å³è®€å–å·²å­˜è¨­å®š
  - `loadSettings()` volume æ”¹ç‚ºæ·±åº¦åˆä½µï¼ˆ`Object.assign` é˜²ç¦¦æ€§å¯«æ³•ï¼‰
  - `playIntroTheme()` æ”¹ç‚ºå³æ™‚è®€å– `gameState.settings.volume`ï¼Œä¸å†ä½¿ç”¨ä¸€æ¬¡æ€§å¿«ç…§

---

## v0.1.3.1 - 2026-06-04

### ä¿®å¾©
- **è®Šç•°æŠ€èƒ½é»žç•°å¸¸**ï¼šå‡ç´šå›žæ†¶å™¨å®˜å¾ŒæŠ€èƒ½é»žæ­¸é›¶ä¸”ç­‰ç´šæœªä¿å­˜ï¼ˆå‡ºäº†é»žæ•¸æ‹¿ä¸åˆ°æ•ˆæžœï¼‰
  - `_syncMutationSkillPoints()` é˜²æ­¢ `earned - spent` ç‚ºè² æ™‚å¼·åˆ¶è¦†è“‹ç¾æœ‰é»žæ•¸
  - `initMutationSkills()` æ­£ç¢ºé‚„åŽŸ localStorage çš„ `_points` å¿«ç…§ï¼Œé¿å…æ¯æ¬¡é‡ç®—
  - æ–°å¢ž `_checkAndRepairMutationSkills()`ï¼šå•Ÿå‹•æ™‚åŠé–‹å•Ÿè®Šç•°é¢æ¿æ™‚è‡ªå‹•é©—ç®—ï¼Œç™¼ç¾ç•°å¸¸è‡ªå‹•é€€é‚„æ‰€æœ‰æŠ€èƒ½é»žä¸¦é¡¯ç¤º âš ï¸ æç¤º

### æ–°å¢žï¼ˆåˆä½µè‡ª v0.1.3.0ï¼‰
- è¶£å‘³æŽ’è¡Œæ¦œï¼šðŸŽ æœ€ä½³æžœçŽ‹ï¼ˆå–®å±€åƒæžœå­æ•¸æœ€å¤šï¼‰
- è¶£å‘³æŽ’è¡Œæ¦œï¼šðŸ¹ æœ€å¼·çµæˆ¶ï¼ˆå–®å±€æ™®é€šç”Ÿç‰©æ“Šæ®ºæ•¸æœ€å¤šï¼Œä¸å«ç²¾è‹±/Boss/å·¨äºº/æ®ºæ‰‹ï¼‰
- `sessionStats` æ–°å¢ž `fruitsEaten` å’Œ `normalKills` è¨ˆæ•¸ï¼ˆæ¯å±€é‡ç½®ï¼‰
- Supabase leaderboard è¡¨æ–°å¢ž `fruits_eaten` / `normal_kills` æ¬„ä½å°æ‡‰

---

## v0.1.3.0 - 2026-06-04

### æ–°å¢ž
- è¶£å‘³æŽ’è¡Œæ¦œï¼šðŸŽ æœ€ä½³æžœçŽ‹ï¼ˆå–®å±€åƒæžœå­æ•¸æœ€å¤šï¼‰
- è¶£å‘³æŽ’è¡Œæ¦œï¼šðŸ¹ æœ€å¼·çµæˆ¶ï¼ˆå–®å±€æ™®é€šç”Ÿç‰©æ“Šæ®ºæ•¸æœ€å¤šï¼Œä¸å«ç²¾è‹±/Boss/å·¨äºº/æ®ºæ‰‹ï¼‰
- `sessionStats` æ–°å¢ž `fruitsEaten` å’Œ `normalKills` è¨ˆæ•¸ï¼ˆæ¯å±€é‡ç½®ï¼‰
- `submitScore` è‡ªå‹•è£œå¡« `fruits_eaten` / `normal_kills` è‡³ Supabase leaderboard è³‡æ–™è¡¨

---

## v0.1.2.0 - 2026-06-04

### ä¿®å¾©
- **ç²¾è‹±æ€ª UI åå­—æ¨™ç±¤**ï¼šç¢ºèª `drawEliteCreature()` å·²æ­£ç¢ºè®€å– `elite.label`ï¼ˆHunter Elite é¡¯ç¤ºã€Œâ˜… å¹½éˆçŠ¬ã€ç­‰æ­£ç¢ºåç¨±ï¼‰ï¼Œç„¡éœ€ä¿®æ”¹
- **çŽ©å®¶æ¯’å‚· tick æœªè™•ç†**ï¼š`updateStatusEffects()` æœ«å°¾æ–°å¢žçŽ©å®¶æ¯’å‚· tickï¼Œæ¯’éœ§çŠ¬å’¬ä¸­å¾Œæ¯’æ•ˆæžœç¾å¯æ­£å¸¸ç”Ÿæ•ˆ
- **è¼”åŠ©åŠŸèƒ½è¨­å®šåœ¨éŠæˆ²çµæŸæ™‚æœªå„²å­˜**ï¼š`showSkillTree()` èˆ‡ `showVictory()` é–‹é ­åŠ å…¥ `saveSettings()`ï¼Œç¢ºä¿æ­»äº¡/å‹åˆ©å‰æ‰€æœ‰è¨­å®šå­˜å…¥ localStorage
- **å›žæ†¶å™¨å®˜ç­‰ç´šåœ¨ postGame æœªæ­£ç¢ºè®€å–**ï¼š`showSkillTree()` åŠ å…¥ `initMutationSkills` ä¿éšœï¼Œ`buildSkillTreeOverlay` åŠ å…¥ `[Debug]` log ä¾›ç¢ºèª

### èª¿æ•´
- **è‚‰é£Ÿæ€§ç”Ÿç‰©é€²é£Ÿæ™‚ Aggro ç¯„åœå¾ž Ã—1.5 æ”¹ç‚º Ã—0.5**ï¼šè®“ç”Ÿç‰©èƒ½é †åˆ©é€²é£Ÿè§¸ç™¼æ®ºæ‰‹åŒ–
- **è‰é£Ÿæ€§é€²åŒ– Lv4**ï¼šå·¨äººåŒ–ç”Ÿç‰©ï¼ˆå« Alphaï¼‰å°çŽ©å®¶å‚·å®³ -15%
- **è‰é£Ÿæ€§é€²åŒ– Lv5**ï¼šå·¨äººåŒ–ç”Ÿç‰©ï¼ˆå« Alphaï¼‰å°çŽ©å®¶å‚·å®³ -30%

---

## v0.1.1.3 - 2026-06-04

## v0.1.1.3 - 2026-06-04

### ä¿®å¾©
- **é»‘è‰²çµäººä¸‰å½¢æ…‹æ”»æ“Šå®Œå…¨å¤±æ•ˆï¼ˆaggroRange è¦†è“‹ Bugï¼‰**
  - Phase 1/3 çš„ `'aiming'` å’Œ Phase 2 çš„ `'pumping'` æ¯å¹€è¢« `if (dist < aggroRange)` è¦†è“‹ç‚º `'chasing'` â†’ Boss æ°¸é ä¸é–‹æ§ã€Phase 2 éŸ³æ•ˆæ¯å¹€æ’­æ”¾
  - ä¿®æ­£ï¼šå„ Phase åŠ å…¥ `state !== 'aiming'` / `state !== 'pumping'` ä¿è­·
- **é»‘è‰²çµäºº Phase 1/3 çž„æº–ç·šåœ¨èž¢å¹•å¤–ä¸å¯è¦‹**
  - Boss åœ¨ 1350px ç¹žåœˆè¶…å‡ºèž¢å¹•ï¼ŒdrawBoss cull æŠŠé›·å°„ç·šä¸€èµ·éŽæ¿¾æŽ‰
  - ä¿®æ­£ï¼šæ–°å¢ž `_drawHunterAimingWarning()` åœ¨ cull å‰å‘¼å«ï¼ŒçŽ©å®¶é ­ä¸ŠåŠ æº–å¿ƒéŽ–å®šç’°
- **å¹½éˆéš¼è“„åŠ›æ™‚ç¹¼çºŒ kiting å¯èƒ½è·‘å‡ºæ”»æ“Šç¯„åœ**
  - è¨­è¨ˆæ‡‰ç‚ºã€Œ0.3 ç§’ç«™ç«‹è“„åŠ›ã€ï¼Œç¾å¯¦æ˜¯é‚Šè“„åŠ›é‚Šå¾Œé€€
  - ä¿®æ­£ï¼šè“„åŠ›ä¸­ï¼ˆ`_aimTarget` å­˜åœ¨ï¼‰æå‰ returnï¼Œå‡çµç§»å‹•
- **å¹½éˆéš¼çž„æº–ç·šå¤ªç´°å¹¾ä¹Žä¸å¯è¦‹**
  - `lineWidth 1.5` ç„¡ shadow â†’ é›£ä»¥å¯Ÿè¦º
  - ä¿®æ­£ï¼šå¼·åŒ–ç‚ºç´…è‰²è™›ç·š + glow + ç›®æ¨™æº–å¿ƒï¼Œèˆ‡ Boss é›·å°„åŒç­‰è¦–è¦ºå¼·åº¦
- **ç²¾è‹±æ€ªç®­é ­åœ¨ Boss èž¢å¹•å¤–æ™‚è¢«æŠ‘åˆ¶**
  - `drawEliteArrow` ç•¶ Boss off-screen æ™‚ä¹Ÿä¸ç•«ç²¾è‹±ç®­é ­ï¼ŒPhase 1 æœŸé–“çŽ©å®¶æ‰¾ä¸åˆ°éš¼
  - ä¿®æ­£ï¼šç§»é™¤ Boss off-screen æŠ‘åˆ¶ï¼Œç²¾è‹±ç®­é ­ç¨ç«‹é¡¯ç¤º

### æ–°å¢ž
- `docs/BOSS_RANGED_DESIGN_TRAPS.md`ï¼šè¨˜éŒ„ 6 ç¨® Boss / é ç¨‹æ€ªè¨­è¨ˆé™·é˜±åŠè§£æ³•ï¼Œå«è¨­è¨ˆ Checklist

---

## v0.1.1.2 - 2026-06-04

### ä¿®å¾©
- **é»‘è‰²çµäººä¸‰å½¢æ…‹æ”»æ“Šå®Œå…¨å¤±æ•ˆ**ï¼ˆæ ¹æœ¬åŽŸå› ï¼š`aggroRange` è¦†è“‹ Bugï¼‰
  - æ¯å¹€ `if (dist < aggroRange) boss.state = 'chasing'` ç„¡æ¢ä»¶è¦†è“‹æˆ°é¬¥ä¸­é–“ç‹€æ…‹ï¼Œå°Žè‡´ `aiming`ï¼ˆPhase 1/3ï¼‰è¢«æ‰“æ–·æ¯å¹€é‡ç½®ã€`pumping`ï¼ˆPhase 2ï¼‰`_pumpUntil` æ¯å¹€é‡è¨­æ°¸é ä¸è§¸ç™¼é–‹æ§
  - ä¿®æ­£ï¼šå„ Phase aggroRange åˆ¤æ–·åŠ å…¥ `boss.state !== 'aiming'` / `boss.state !== 'pumping'` é˜²è­·
- **é»‘è‰²çµäºº Phase 1/3 é›·å°„çž„æº–ç·šèž¢å¹•å¤–ä¸å¯è¦‹**
  - Boss ä»¥ idealDist 1350px ç¹žåœˆï¼Œè¶…å‡ºèž¢å¹•å¯è¦–ç¯„åœï¼Œ`drawBoss` cull å¾Œé›·å°„ç·šä¸è¢«ç¹ªè£½
  - ä¿®æ­£ï¼šæ–°å¢ž `_drawHunterAimingWarning()` åœ¨ cull å‰å‘¼å«ï¼Œå«ï¼šç´…è‰²è™›ç·šå¾ž Boss æŒ‡å‘çŽ©å®¶ï¼ˆèž¢å¹•å¤–ä¹Ÿç•«ï¼‰ï¼‹çŽ©å®¶é ­ä¸Šè„ˆå‹•æº–å¿ƒéŽ–å®šç’°
  - ç§»é™¤é‡è¤‡çš„ `_drawHunter` å…§èˆŠç‰ˆé›·å°„ç·šä»£ç¢¼

---

## v0.1.1.1 - 2026-06-04

### ä¿®å¾©
- æ¯’éœ§éš¼é”åˆ° 3 å€‹æ¯’éœ§ä¸Šé™å¾Œï¼Œ`attackCooldown` æœªé‡ç½®å°Žè‡´æ¯å¹€è§¸ç™¼æ”»æ“Šåˆ¤æ–·ï¼Œkiting ç„¡åœé “é€£çºŒå¾Œé€€ï¼ˆé€ƒè·‘ä¸æ”»æ“Šï¼‰
- æ¯’éœ§éš¼é”ä¸Šé™å¾Œè£œè¨­ `_postShotTimer`ï¼Œé˜²æ­¢æ¯«ç„¡åœé “çš„å¾Œé€€å¾ªç’°
- æ¯’éœ§é£›è¡Œæ¯’çƒæ”¹ç”¨ `_venomFirePos`ï¼ˆç™¼å°„çž¬é–“ä½ç½®ï¼‰ä½œç‚ºæ’å€¼èµ·é»žï¼Œé¿å…éš¨ elite ç§»å‹•è€ŒæŠ–å‹•
- æ¯’éœ§é£›è¡Œæ¯’çƒè¦–è¦ºå¼·åŒ–ï¼šå¤–å±¤å…‰æšˆåŠå¾‘ 14px + å…§æ ¸äº®ç¶ åŠå¾‘ 7pxï¼Œ`#00FF66` å¼·å…‰æšˆï¼ˆåŽŸç‚ºæš—è‰² 8pxï¼‰
- è…è•æ¶²é«”è¦–è¦ºå¼·åŒ–ï¼šé€æ˜Žåº¦ç”± 0.35 â†’ æœ€é«˜ 0.55 + æ·¡å…¥æ·¡å‡ºï¼ŒåŠ ä¸Šäº®ç¶ è‰²é‚Šæ¡† glow

---

## v0.1.1.0 - 2026-06-04

### ä¿®å¾©
- é»‘è‰²çµäººè¡€ç®¡æ¨™è¨˜é¡¯ç¤ºéŒ¯èª¤ï¼ˆx5 é¡¯ç¤ºç‚º x4ï¼Œå·²ä¿®æ­£ç‚ºæ­£ç¢ºç®¡æ•¸ï¼‰
- é»‘è‰²çµäººç¬¬ä¸€å½¢æ…‹åŠç¬¬ä¸‰å½¢æ…‹ Sniper ç´…è‰²é›·å°„çž„æº–ç·šä¸é¡¯ç¤ºï¼ˆé‡å¯«ç‚ºå¾ž Boss ä¸­å¿ƒè‡³ç›®æ¨™çš„ç²¾ç¢ºç·šæ®µï¼‰
- ä¸‰éš¼å­å½ˆç¼ºå°‘ type æ¬„ä½ï¼šå¹½éˆéš¼ï¼ˆå–®ç™¼ï¼‰ç¾æ­£ç¢ºæ¨™è¨˜ç‚º `sniper`ï¼Œæš—å½±éš¼æ•£å½ˆä¿æŒ `shotgun_pellet`
- æ¯’éœ§éš¼æ”»æ“Šé£›è¡Œè»Œè·¡è¦–è¦ºç¼ºå¤±ï¼ˆè£œä¸Šæš—ç¶ è‰²æ’å€¼æ¯’çƒï¼Œå¸¶éœ§æ°£å…‰æšˆï¼‰
- æ¯’éœ§éš¼è½åœ°è…è•æ¶²é«”åœ¨å›°é›£åœ°åœ–æœªç¹ªè£½ï¼ˆåœ¨ hud.js è£œä¸Š venomFalcon puddle ç¨ç«‹ç¹ªè£½é‚è¼¯ï¼‰
- ç¬¬ä¸‰å½¢æ…‹èžåˆæŠ€çž„æº–æ™‚è£œä¸Š 5 æ¢æ©˜è‰²éš¨æ©Ÿæ–¹å‘æ•£å°„é è­¦ç·š

---

## v0.1.0.3 - 2026-06-03

### ä¿®å¾©

#### å¹³è¡¡æ€§ä¿®å¾©

- **æ“Šæ®º XP å…¬å¼ä¿®æ­£**ï¼ˆ`systems/combat.js`ï¼‰ï¼š`handleKill()` çš„ hostile æ“Šæ®º XP å…¬å¼å¾ž `Math.min(80, 30 + Math.round((maxHp/50) * 50))` æ”¹ç‚º `Math.min(80, 30 + Math.round((maxHp/50) * 10))`ï¼Œç§»é™¤èˆŠå…¬å¼å°Žè‡´å¹¾ä¹Žæ‰€æœ‰é›£åº¦è‚‰é£Ÿæ€ªéƒ½è§¸ç™¼ cap 80 çš„å•é¡Œï¼ŒXP ç¾åœ¨éš¨ HP å‹•æ…‹è®ŠåŒ–ï¼ˆç°¡å–®ç´„ 40ã€æ™®é€šç´„ 45ã€å›°é›£ç´„ 55ï¼‰

- **è‚‰é£Ÿæ€§æ€ªç‰©å¤œæ™šå¢žå¼·**ï¼ˆ`systems/spawning.js`ï¼‰ï¼š`_makeCarnCreature()` æ–°å¢žå¤œæ™šå€çŽ‡è¨ˆç®—ï¼Œè£œå……ç”Ÿæˆçš„è‚‰é£Ÿæ€ªä¾ç•¶å‰å¤œæ™šæ•¸å¥—ç”¨ HP/æ”»æ“Š `Ã—1.2^å¤œ`ã€é€Ÿåº¦ `Ã—1.1^å¤œ`ï¼Œç¬¬1å¤œç´„ +20%/+10%ã€ç¬¬3å¤œç´„ +73%/+33%ï¼›è‰é£Ÿæ€§ç”Ÿç‰©ä¸å—å½±éŸ¿

- **ç°¡å–®é›£åº¦ Boss é€Ÿåº¦ä¿®æ­£**ï¼ˆ`map/easymap.js`ï¼‰ï¼šä¸‰éš» Boss é€Ÿåº¦å¾žåœ°åœ–è¨­å®šçš„éŽä½Žå€¼ï¼ˆ1.0/1.3/1.2ï¼‰ä¿®æ­£ç‚ºèˆ‡ `BOSS_CONFIG` ä¸€è‡´çš„æ­£ç¢ºå€¼ï¼ˆé»‘ç†Š 3.0ã€å¤§ç™½é¯Š 3.9ã€è çŽ‹ 3.6ï¼‰

- **ç²¾è‹±æ€ª HP å¥—ç”¨åœ°åœ–é›£åº¦å€çŽ‡**ï¼ˆ`systems/elite.js`ï¼‰ï¼šEasy/Normal åœ°åœ–çš„ä¸‰çŠ¬/ä¸‰éš¼ç²¾è‹±æ€ª HP è¨ˆç®—æ–°å¢žä¹˜ä¸Š `creatureStrength.hostile.hpMultiplier`ï¼Œä¿®æ­£æ™®é€šé›£åº¦ç²¾è‹± HP èˆ‡ç°¡å–®é›£åº¦ç›¸åŒçš„å•é¡Œï¼ˆæ™®é€šç¬¬1å¤œ 250 â†’ 375ã€ç¬¬3å¤œ 500 â†’ 1500ï¼‰ï¼›å›°é›£åœ°åœ–ç¶­æŒå›ºå®šæ•¸å€¼ä¸è®Š

- **éš±è—å™¨å®˜æŽ‰è½ Bug ä¿®å¾©**ï¼ˆ`systems/organs.js`ï¼‰ï¼š`handleEliteKill()` çš„ Hunter ç²¾è‹±æ€ªåˆ†æ”¯ï¼ˆ`isHunterElite`ï¼‰åœ¨å‘¼å« `_handleHunterEliteKill()` å¾Œè£œä¸Šéš±è—å™¨å®˜æŽ‰è½åˆ¤æ–·ï¼Œä¿®å¾© v0.1.0.2 èµ·ä¸‰çŠ¬/ä¸‰éš¼æ“Šæ®ºå¾Œå®Œå…¨ä¸æŽ‰è½éš±è—å™¨å®˜çš„å•é¡Œ

---

## v0.1.0.2 - 2026-06-03

### æ–°å¢ž
- **è®Šç•°é¢æ¿å·¦æ¬„æ•´åˆ**ï¼ˆ`systems/evolution.js`ï¼‰ï¼š`_buildMutationSkillContent()` å·¦æ¬„é ‚éƒ¨æ–°å¢žå¯ç”¨è®Šç•°é»žé¡¯ç¤ºï¼ˆ`å¯ç”¨è®Šç•°é»žï¼šN`ï¼‰ï¼›åº•éƒ¨æ–°å¢žå…Œæ›æŒ‰éˆ•ï¼ˆ100 æŠ€èƒ½é»ž â†’ 10 è®Šç•°é»žï¼‰ï¼Œå…Œæ›å¾Œå³æ™‚ replaceChild é‡å»ºé¢æ¿

### ä¿®å¾©
- **è®Šç•°æŠ€èƒ½é»ž NaN å®Œæ•´ä¿®å¾©**ï¼ˆ`systems/mutation.js`ã€`systems/evolution.js`ï¼‰ï¼š`_syncMutationSkillPoints()` åœ¨ `mutationData` å°šæœªåˆå§‹åŒ–æ™‚è£œè¨­é è¨­å€¼ 0ï¼›`buildSkillTreeOverlay()` é–‹é ­å¼·åˆ¶å‘¼å« `_syncMutationSkillPoints()`ï¼›æŠ€èƒ½é»žæ•¸é¡¯ç¤ºåŠ å…¥é˜²å‘†ï¼ˆ`?? 0`ï¼‰ï¼›å™¨å®˜å‡ç´šæŒ‰éˆ•æ”¹ç‚º replaceChild æ–¹å¼é‡å»ºé¢æ¿ç¢ºä¿é»žæ•¸å³æ™‚åˆ·æ–°
- **é¦–é è·¯å¾‘è®Šç•°é»žé¡¯ç¤ºä¿®å¾©**ï¼ˆ`systems/evolution.js`ï¼‰ï¼š`buildSkillTreeOverlay(fromHome)` çš„ localStorage åŒæ­¥å€å¡Šè£œè®€ `mutationData` å’Œ `mutationSkills`ï¼Œç¢ºä¿é¦–é é€²å…¥èˆ‡ postGame è·¯å¾‘è®€å–ç›¸åŒè³‡æ–™ï¼›`getMutationUpgradeCost` åƒæ•¸ç”±éŒ¯èª¤çš„ `def.id`ï¼ˆå­—ä¸²ï¼‰æ”¹ç‚º `lv`ï¼ˆç­‰ç´šæ•¸å­—ï¼‰ï¼Œæ¶ˆé™¤å‡ç´šè²»ç”¨ NaN é¡¯ç¤º
- **è¿”å›žæŠ€èƒ½æ¨¹æŒ‰éˆ•é‡è¤‡ ðŸŒ¿ ä¿®å¾©**ï¼ˆ`systems/evolution.js`ï¼‰ï¼šåˆ‡æ›è‡³è®Šç•°æŠ€èƒ½æ¨¹æ™‚ï¼ŒæŒ‰éˆ•æ–‡å­—å¾ž `ðŸŒ¿ ðŸŒ¿ æŠ€èƒ½æ¨¹` æ”¹ç‚º `ðŸŒ¿ æŠ€èƒ½`
- **Easy/Normal ä¸‰çŠ¬ç²¾è‹±æ€ªè¡€é‡ä¿®å¾©**ï¼ˆ`systems/elite.js`ï¼‰ï¼š`_spawnHunterElite()` æ”¹ä¾åœ°åœ– `elites` å€çŽ‡å‹•æ…‹è¨ˆç®— HP/å‚·å®³/é€Ÿåº¦ï¼ˆEasy ç¬¬ä¸€å¤œ HP å¾žå›ºå®š 480 â†’ æ­£ç¢ºçš„ 250ï¼‰
- **é»‘è‰²çµäºº Boss æ•¸å€¼è£œå…¥**ï¼ˆ`map/hardmap.js`ï¼‰ï¼š`hp: 800`ã€`speed: 4.0`ã€`damage: 45`ï¼ˆåŽŸç‚º nullï¼‰
- **å›°é›£åœ°åœ–è‰é£Ÿæ€§ç”Ÿç‰©å‚·å®³å€çŽ‡ä¿®å¾©**ï¼ˆ`systems/spawning.js`ï¼‰ï¼š`_makeHerbCreature()` çš„ damage è£œä¹˜ `str.damageMultiplier`ï¼Œèˆ‡ HP/é€Ÿåº¦è¨ˆç®—ä¸€è‡´

---

## v0.1.0.1 - 2026-06-03

### æ–°å¢ž
- **GOBLIN NEST Splash ç•«é¢**ï¼ˆ`systems/ui.js`ã€`main.js`ï¼‰ï¼šå•Ÿå‹•æ™‚é¡¯ç¤ºé–‹ç™¼è€…å“ç‰Œé ï¼Œé»žæ“Šå¾Œæ’­æ”¾ Intro Theme ä¸¦é€²å…¥é¦–é 
- **é¦–é èƒŒæ™¯éŸ³æ¨‚**ï¼ˆ`config/gameConfig.js`ã€`systems/audio.js`ï¼‰ï¼š`playIntroTheme()` / `stopIntroTheme()`ï¼›é€²å…¥éŠæˆ²æ™‚è‡ªå‹•åœæ­¢
- **é¦–é å…¬å‘Šæ¨™ç±¤**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ¨™é¡Œå³ä¸Šå´æ—‹è½‰å°ç« ï¼Œäº¤æ›¿é¡¯ç¤ºã€Œå·¨äººè¦ºé†’ï¼ã€ã€Œçµäººå…¥ä¾µï¼ã€

### èª¿æ•´
- è®Šç•°æŠ€èƒ½æ¨¹æŒ‰éˆ•ç§»è‡³æŠ€èƒ½æ¨¹ Header å³å´ï¼›é¢æ¿æ”¹ç‚ºå·¦å³å…©æ¬„ï¼ˆå·¦ï¼šè®Šç•°å™¨å®˜ã€å³ï¼šæŠ€èƒ½é»ž/æŠ€èƒ½ï¼‰
- Splash æ¨™é¡Œæ”¹ç‚ºç«‹é«”é™°å½±æ¨£å¼

### ä¿®å¾©
- TOP10 é›£åº¦åˆ‡æ›é †åºå›ºå®šç‚º ç°¡å–®â†’æ™®é€šâ†’å›°é›£ï¼Œä¸å†ä¾è³´ DB æŸ¥è©¢
- æŠ€èƒ½æ¨¹ Header é‡è¤‡ ðŸŒ¿ emoji ä¿®å¾©
- è®Šç•°æŠ€èƒ½é»žå‡ç´šè²»ç”¨ NaN ä¿®å¾©ï¼ˆ`sk.level` ç©ºå€¼é˜²å‘†ï¼‰
- åˆ‡æ›è®Šç•°é¢æ¿å¾Œè¿”å›žæŠ€èƒ½æ¨¹ä½ˆå±€é‚„åŽŸä¿®å¾©ï¼ˆ`display:flex` æ˜Žç¢ºè¨­å®šï¼‰

---

## v0.1.0.0 - 2026-06-03

### æ–°å¢ž
- **å›°é›£é›£åº¦åœ°åœ–**ï¼ˆ`map/hardmap.js`ï¼‰ï¼šç”Ÿç‰©å¼·åº¦ Ã—2.5ã€ä¾µç•¥è·é›¢ 600ã€ç²¾è‹±æ€ªèˆ‡ Boss ä¸å›žè¡€
- **é»‘è‰²çµäºº Boss**ï¼ˆ`systems/boss.js`ï¼‰ï¼šå›°é›£åœ°åœ–å°ˆå±¬ï¼Œ5ç®¡è¡€æ¢åˆ¶ï¼›ä¸‰å½¢æ…‹ï¼ˆç‹™æ“Š/æ•£å½ˆ/èžåˆæŠ€ï¼‰ï¼›ç‰›ä»”å¸½+æ§ Canvas å¤–è§€ï¼›å°è©žå­—å¹•ç³»çµ±ï¼›æ­»äº¡çŽå‹µ +1000XP / +5æŠ€èƒ½é»ž / +5è®Šç•°é»žï¼›æ¯ç®¡æ“Šç ´ +30 ç§’éŠæˆ²æ™‚é–“ï¼ˆæœ€å¤š +120 ç§’ï¼‰
- **éœéŸ³çµéšŠç²¾è‹±æ€ª**ï¼ˆ`systems/elite.js`ï¼‰ï¼šå›°é›£åœ°åœ–ä¸‰éš¼ï¼ˆå¹½éˆéš¼â˜…/æš—å½±éš¼â˜…â˜…/æ¯’éœ§éš¼â˜…â˜…â˜…ï¼‰ï¼›æ™®é€š/ç°¡å–®åœ°åœ–ä¸‰çŠ¬ï¼ˆå¹½éˆçŠ¬/æš—å½±çŠ¬/æ¯’éœ§çŠ¬ï¼‰ï¼›å‡ºå ´å»£æ’­å­—å¹• + è­¦å ±éŸ³æ•ˆ
- **è¶£å‘³æ¦œã€ŒðŸŽ¯ çµäººçµ‚çµè€…ã€**ï¼ˆ`config/supabase.js`ã€`systems/leaderboard.js`ï¼‰ï¼šå›°é›£åœ°åœ–æœ€å¿«æ“Šæ®ºé»‘è‰²çµäºº
- **éŸ³æ•ˆç³»çµ±æ“´å……**ï¼ˆ`config/gameConfig.js`ï¼‰ï¼šé»‘è‰²çµäººï¼ˆ18 çµ„ï¼‰ã€ä¸‰éš¼ï¼ˆ15 çµ„ï¼‰ã€ä¸‰çŠ¬ï¼ˆ8 çµ„ï¼‰ã€é˜¿å¥‡çˆ¾ï¼ˆ5 çµ„ï¼‰éŸ³æ•ˆ

### èª¿æ•´
- åœ°åœ–é¸æ“‡å›°é›£é›£åº¦æ­£å¼æŽ¥å…¥ `HARD_MAP`ï¼ˆ`systems/ui.js`ï¼‰
- é»‘è‰²çµäººä½¿ç”¨ç¨ç«‹ä¸»é¡Œæ›² `Super boss.mp3`
- æ‰€æœ‰ Boss æ­»äº¡è·¯ç”±æ”¹ç‚ºçµ±ä¸€ `handleBossKill()`ï¼Œæ”¯æ´å¤šç®¡è¡€æ¢ï¼ˆ`systems/combat.js`ã€`systems/player.js`ï¼‰

---

## v0.0.69.0 - 2026-06-03

### æ–°å¢ž
- **è®Šç•°æŠ€èƒ½æ¨¹**ï¼ˆ`systems/evolution.js`ã€`systems/mutation.js`ã€`systems/gameState.js`ã€`lang/`ï¼‰ï¼šæŠ€èƒ½æ¨¹é¢æ¿å³ä¸Šè§’æ–°å¢žã€Œâš—ï¸ è®Šç•°ã€æŒ‰éˆ•ï¼›`_showMutationSkillPanel()` å­é¢æ¿ï¼›ã€Œå›žæ†¶å™¨å®˜ã€æŠ€èƒ½ï¼ˆ0/3ï¼Œæ¯ç­‰ +1 éš±è—å™¨å®˜ä¿ç•™ï¼‰ï¼›`_upgradeMutationSkill()`ï¼›æŠ€èƒ½é»žæ¯ 50 è®Šç•°ç¸½ç­‰ç´š +1ï¼›`DEFAULT_MUTATION_SKILLS`ã€`initMutationSkills()`ã€`_saveMutationSkills()`ã€`_syncMutationSkillPoints()`ï¼›éš±è—å™¨å®˜é¸æ“‡æ”¹ç‚ºå¤šé¸ï¼ˆä¸Šé™ä¾ recallOrgan ç­‰ç´šï¼‰
- **å›°é›£é›£åº¦è§£éŽ–**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`showMapSelect()` ä¸­ hard locked æ”¹ç‚º false
- **ç¬¬äºŒç« åŠ‡æƒ…**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`showGuideStory()` åŠ å…¥ç« ç¯€ Tab å°Žèˆªï¼›`_getGuideStoryPages()` æ–°å¢ž 4 é ï¼ˆç¬¬ä¸‰ç« çµäººçš„è¶³è·¡ Ã— 3 + Coming Soon å‹•æ…‹é ï¼‰ï¼›`renderPage()` æ”¯æ´ `customRender` å›žå‘¼ï¼›`chapter2Unlocked` localStorage æŽ§åˆ¶è§£éŽ–
- **é€šé—œè§£éŽ–è¨˜éŒ„**ï¼ˆ`systems/boss.js`ï¼‰ï¼šæ™®é€šé›£åº¦é€šé—œå¯«å…¥ `chapter2Unlocked: 'true'`
- **localStorage é€šé—œçµ±è¨ˆ**ï¼ˆ`systems/boss.js`ï¼‰ï¼š`_recordClearStats()`ã€`_recordBossKill()`ï¼›é€šé—œæ™‚è¨˜éŒ„é›£åº¦ / è§’è‰² / Boss æ“Šæ®ºæ¬¡æ•¸

---

## v0.0.68.0 - 2026-06-03

### ä¿®å¾©
- **ç”Ÿç‰©é«”åž‹éš¨è¦–é‡Žç¸®æ”¾ä¿®å¾©**ï¼ˆ`systems/creatures.js`ã€`systems/boss.js`ã€`systems/hud.js`ï¼‰ï¼š`drawCreatureShape`ã€`_drawCreatureGlow`ã€`drawNeutralCreatures`ã€`drawHostileCreatures`ã€`drawBoss`ã€`drawBossShape` åŠçŽ©å®¶ç¹ªè£½å‡æ”¹ç‚º `radius * cameraZoom`ï¼›è¡€æ¢ Y åç§»ã€åå­—/éšŠä¼æ¨™ç±¤ Y åç§»åŒæ­¥ä¿®æ­£ï¼›æ”»æ“Šç¯„åœåœˆç¸®æ”¾æ­£å¸¸ï¼ˆv0.0.66.0 å·²ä¿®ï¼Œæœ¬æ¬¡æœªé‡è¤‡å¥—ç”¨ï¼‰
- **æŽ’è¡Œæ¦œèˆŠç‰ˆæœ¬è™Ÿå£“åˆ¶æ–°ç‰ˆä¿®å¾©**ï¼ˆ`systems/leaderboard.js`ï¼‰ï¼šä¸‰ç¢¼èˆŠæ ¼å¼ï¼ˆå¦‚ v0.65.0ï¼‰`version_order` å¼·åˆ¶å›žå‚³ 0ï¼Œä¸å†è¦†è“‹å››ç¢¼æ–°ç‰ˆæŽ’å

### æ–°å¢ž
- **é¦–é æŒ‰éˆ• Hover æ•ˆæžœ**ï¼ˆ`systems/ui.js`ï¼‰ï¼šé–‹å§‹éŠæˆ²ã€æŠ€èƒ½æ¨¹ã€åœ–é‘‘ã€æŽ’è¡Œæ¦œã€è¨­å®šäº”å€‹æŒ‰éˆ•åŠ å…¥ scale/é¡è‰²/é™°å½± hover å‹•ç•«ï¼›æ‰‹æ©Ÿç‰ˆæ”¹ç‚º touch ç¸®æ”¾å›žé¥‹ï¼›æ–°å¢ž `_addMenuHover()` helper
- **èŠå¤©å®¤ `[c=crim]` æ·±ç´…è‰²**ï¼ˆ`systems/chat.js`ï¼‰ï¼šæ–°å¢ž `crim`ï¼ˆ`#C62828`ï¼‰è‡³ä¸€èˆ¬çŽ©å®¶å¯ç”¨è‰²ï¼›é¡è‰²é¢æ¿åŠ å…¥ã€Œæ·±ç´…å­—ã€æŒ‰éˆ•ï¼›åŠ å…¥ `_COLOR_MAP` çµ±ä¸€ç®¡ç†è‰²ç¢¼
- **å·¨äººè·¨ç‰©ç¨®çµ„éšŠ**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šæ‹›å‹Ÿæ¢ä»¶æ”¹ç‚ºã€Œé›™æ–¹ diet === 'herbivore'ã€ï¼Œä¸å†é™åŒç‰©ç¨®åŒç”Ÿæ…‹ï¼›ä¸Šé™/Alpha è§¸ç™¼æ©Ÿåˆ¶ä¸è®Š
- **é¬£ç‹—éšŠåæ¨™ç±¤**ï¼ˆ`systems/creatures.js`ã€`main.js`ï¼‰ï¼šæ–°å¢žä¸‰åœ‹æ­¦å°‡åç¨±æ± ï¼ˆ20åï¼‰`_HYENA_PACK_NAMES`ï¼›æ¯å€‹ packGroup é¦–æ¬¡çµ„éšŠæ™‚åˆ†é…éšŠåï¼›åå­—ä¸‹æ–¹é¡¯ç¤º `æ›¹æ“(2/3)` æ ¼å¼æ¨™ç±¤ï¼›éŠæˆ²é‡ç½®æ™‚æ¸…ç©ºå·²ç”¨åç¨±

### èª¿æ•´
- **å·¨äººéšŠåæ”¹ç‚ºä»¿è£½è©ž**ï¼ˆ`systems/creatures.js`ï¼‰ï¼š`_PACK_NAMES` å…¨éƒ¨æ”¹ç‚ºä»¿è£½è©žï¼ˆå¦‚ SKTâ†’SK-Teaã€T1â†’T-Oneï¼‰ï¼Œé¿å…ä¾µæ¬Š
- **å·¨äººæ“Šæ®ºçŽå‹µä¸Šèª¿**ï¼ˆ`systems/combat.js`ï¼‰ï¼šæ™®é€šå·¨äºº XP 60â†’100ï¼›Alpha XP 200â†’300ï¼›Alpha è®Šç•°é»žä¿åº• +1â†’+2ï¼›é¡å¤–æŽ‰è½æ©ŸçŽ‡ 10%â†’20%ã€æ•¸é‡ 1~3â†’2~6

---

## v0.0.67.1 - 2026-06-02

### èª¿æ•´
- **åœ–é‘‘ç”Ÿç‰©ç™¾ç§‘é‡æ–°æŽ’åº**ï¼ˆ`config/compendium_data.js`ï¼‰ï¼šç²¾è‹±æ€ªç§»è‡³æœ€å‰ï¼ˆç‰¹æ®Šç”Ÿç‰©å„ªå…ˆï¼‰ï¼Œä¸€èˆ¬ç”Ÿç‰©æ”¹ä¾åœ°å€æŽ’åˆ—ï¼ˆæ£®æž—â†’æµ·æ´‹â†’æ²™æ¼ ï¼‰
- **åœ–é‘‘éŠæˆ²æ©Ÿåˆ¶æ–°å¢žã€Œè®Šç•°å™¨å®˜ã€æ¢ç›®**ï¼ˆ`config/compendium_data.js`ï¼‰ï¼šèªªæ˜Žå››ç¨®è®Šç•°å™¨å®˜ã€ç²å¾—èˆ‡å‡ç´šæ–¹å¼
- **å™¨å®˜åœ–é‘‘èˆ‡é€²åŒ–ç³»çµ±åˆ†é æ”¹ç‚ºé›™æ¬„ç‰ˆé¢**ï¼ˆ`systems/ui.js`ï¼‰ï¼šç§»é™¤èˆŠå¼ç¿»é æŒ‰éˆ•ï¼Œæ”¹ç‚ºæ¡Œæ©Ÿå·¦å´ç›®éŒ„ + å³å´å…§å®¹ã€æ‰‹æ©Ÿæ©«å‘ Tab åˆ‡æ›ï¼Œèˆ‡éŠæˆ²èªªæ˜Žåˆ†é é¢¨æ ¼çµ±ä¸€ï¼›æ–°å¢ž `_renderOrgans()`ã€`_renderEvo()` å‡½å¼ï¼Œç§»é™¤ `buildOrganPages()`ã€`buildEvoPages()`ã€`getPages()`

---

## v0.0.67.0 - 2026-06-02

### æ–°å¢ž
- **éŠæˆ²åœ–é‘‘ç³»çµ±**ï¼ˆ`config/compendium_data.js`ã€`systems/ui.js`ã€`index.html`ï¼‰ï¼šæ–°å¢ž `COMPENDIUM_DATA` å…¨åŸŸå¸¸æ•¸ï¼Œå®šç¾©å››å¤§åˆ†é¡žï¼ˆéŠæˆ²æ©Ÿåˆ¶ 9 æ¢ã€Biome 3 æ¢ã€Boss 3 æ¢ã€ç”Ÿç‰©ç™¾ç§‘ 7 æ¢ï¼‰ï¼Œå…± 22 å€‹æ¢ç›®ï¼Œç¹ä¸­ï¼è‹±æ–‡é›™èªžï¼Œæ•¸å€¼å‹•æ…‹å¼•ç”¨ configï¼Œä¸å¯«æ­»
- **åœ–é‘‘ Guide åˆ†é é‡è¨­è¨ˆ**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ¡Œæ©Ÿç‰ˆæ”¹ç‚ºå·¦å´ 160px ç›®éŒ„æ¬„ + å³å´å…§å®¹å€é›™æ¬„ç‰ˆé¢ï¼›æ‰‹æ©Ÿç‰ˆæ”¹ç‚ºæ©«å‘å¯æ»‘å‹• Tab åˆ— + ä¸‹æ–¹å…§å®¹å€ï¼›å„åˆ†é¡žç”¨ section color æ¨™è‰²ï¼›èªžè¨€åˆ‡æ›å³æ™‚é‡ç¹ª
- **åœ–é‘‘ç¶­è­· SOP**ï¼ˆ`.claude/instructions.md`ï¼‰ï¼šæ–°å¢žã€Œæ›´æ–°åœ–é‘‘ã€èˆ‡ã€Œæª¢æŸ¥åœ–é‘‘ã€å…©å€‹ AI æŒ‡ä»¤æ­¥é©Ÿèªªæ˜Ž

---

## v0.0.66.3 - 2026-06-01

### ä¿®å¾© / æ•ˆèƒ½
- **getGameFont cache**ï¼ˆ`systems/utils.js`ï¼‰ï¼šæ–°å¢žå­—é«”å­—ä¸²å¿«å–ï¼Œç›¸åŒè¨­å®šä¸‹ç›´æŽ¥å›žå‚³å¿«å–å€¼ï¼Œé¿å…æ¯å¹€å°æ‰€æœ‰ç”Ÿç‰©é‡è¤‡å»ºç«‹æ–°å­—ä¸²ç‰©ä»¶ï¼›ä»¥æ•¸å­— key å–ä»£å­—ä¸² key åŠ å¿«æŸ¥è©¢
- **å­—å¤§åˆç²—åˆä½µ Toggle**ï¼ˆ`systems/gameState.js`ã€`systems/ui.js`ã€`lang/`ï¼‰ï¼šç§»é™¤ç¨ç«‹çš„ã€Œå­—é«”åŠ å¤§ã€èˆ‡ã€Œå­—é«”åŠ ç²—ã€å…©å€‹é¸é …ï¼Œåˆä½µç‚ºå–®ä¸€ã€Œå­—å¤§åˆç²—ã€Toggleï¼ˆ+7px + boldï¼‰ï¼Œä¸¦ä¿ç•™èˆŠ localStorage è‡ªå‹•é·ç§»
- **showXPPopup DOM ç‰©ä»¶æ± **ï¼ˆ`systems/player.js`ã€`main.js`ï¼‰ï¼šé å»º 10 å€‹å¯é‡è¤‡ä½¿ç”¨çš„ DOM å…ƒç´ ï¼Œåƒæžœå­æ™‚å¾žæ± å–å¾—è€Œéžæ¯æ¬¡ createElementï¼›æ± æ»¿æ™‚ç›´æŽ¥è·³éŽï¼Œä¸å»ºç«‹æ–°å…ƒç´ 
- **_checkGuardianRange ç¯€æµ**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šåŠ å…¥ 200ms ç¯€æµï¼Œé¿å…æ¯å¹€å°æ¯éš»å·¨äººåŸ·è¡Œ O(ä¸­ç«‹Ã—æ•µæ„) é›™é‡è¿´åœˆè·é›¢è¨ˆç®—
- **è¦–é‡Žç¸®æ”¾å…¬å¼èª¿æ•´**ï¼ˆ`systems/camera.js`ã€`systems/ui.js`ï¼‰ï¼šæ‰‹æ©Ÿç‰ˆæ”¹ç”¨ `0.48 + level Ã— 0.04`ï¼ˆ10æ ¼=0.84ï¼‰ï¼Œé›»è…¦ç‰ˆæ”¹ç”¨ `0.80 + level Ã— 0.04`ï¼ˆ6æ ¼=1.00ï¼‰ï¼›v0.0.66.3 ä¸€æ¬¡æ€§å¼·åˆ¶è¦†è“‹çŽ©å®¶å­˜æª”é è¨­å€¼

---

## v0.0.66.2 - 2026-06-01

### æ–°å¢ž
- **å‡ºç”Ÿä¿è­·å€**ï¼ˆ`systems/spawning.js`ã€`systems/gameState.js`ã€`main.js`ï¼‰ï¼šéŠæˆ²é–‹å§‹å¾Œ 3 ç§’å…§ä¸è£œå……ç”Ÿæˆè‚‰é£Ÿæ€ªï¼›åˆå§‹ç”Ÿæˆæ™‚ï¼Œè·åœ°åœ–ä¸­å¿ƒ forestCenterRadius ä»¥å…§çš„ä½ç½®ä¹Ÿä¸ç”Ÿæˆè‚‰é£Ÿæ€ª
- **å·¨äºº guardianRange ç¸®å°**ï¼ˆ`systems/creatures.js`ï¼‰ï¼š`_triggerGiantization()` ä¸­å·¨äººä¿è­·ç¯„åœç”± 1000px ç¸®å°ç‚º 500pxï¼ˆAlpha çš„ 1500px ä¸è®Šï¼‰
- **æ®ºæ‰‹æ‚„æ‚„çµæ®º**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šæ®ºæ‰‹åŒ–ç”Ÿç‰©åœ¨å·¨äºº guardianRangeï¼ˆ500pxï¼‰ä»¥å¤–æ”»æ“Šè‰é£Ÿæ€§æ™‚ï¼Œä¸è§¸ç™¼å·¨äººçš„ guardianTarget ä¿è­·ï¼Œè®“æ®ºæ‰‹å¯åœ¨å¤–åœæ‚„æ‚„æ•çµ
- **éšŠä¼åç¨±æ¨™ç±¤**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šå·¨äººåŒ–éšŠé•·è‡ªå‹•åˆ†é…éšŠä¼åç¨±ï¼ˆSKTã€T1ã€Fnatic ç­‰ï¼Œå…± 26 çµ„ï¼‰ï¼›éšŠå“¡ç¹¼æ‰¿åç¨±ï¼›åå­—ä¸‹æ–¹é¡¯ç¤ºéšŠä¼æ¨™ç±¤èˆ‡æˆå“¡æ¯”ï¼ˆå¦‚ `T1(3/6)`ï¼‰

---

## v0.0.66.1 - 2026-06-01

### æ–°å¢ž
- **GM æ¨™ç±¤æ”¹é›è—è‰²**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`_parseName()` ä¸­ GM çš„ã€GMã€‘æ¨™ç±¤ç”±å½©è™¹æ¼¸å±¤æ”¹ç‚ºå›ºå®šé›è—è‰² `#4B9CD3`ï¼Œç§»é™¤ `-webkit-background-clip` ç­‰æ¼¸å±¤ CSS
- **èŠå¤©é¡è‰²æŒ‰éˆ•**ï¼ˆ`systems/chat.js`ï¼‰ï¼šèŠå¤©è¼¸å…¥æ¡†æ–°å¢ž ðŸŽ¨ æŒ‰éˆ•ï¼Œé»žæ“Šå½ˆå‡ºé¢æ¿å¯æ’å…¥ `[c=red]`ã€`[c=blue]`ã€`[c=green]` å½©è‰²å­—æ¨™ç±¤ï¼Œæ¸¸æ¨™è‡ªå‹•ç½®æ–¼å…© tag ä¸­é–“
- **è§’è‰²å±…ä¸­æ›´å**ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ã€`systems/ui.js`ï¼‰ï¼šè¨­å®šé¢æ¿ã€Œæ°¸é å±…ä¸­ã€æ”¹åç‚ºã€Œè§’è‰²å±…ä¸­ã€ï¼ˆè‹±æ–‡ Center Cameraï¼‰ï¼Œä¸¦åˆªé™¤åº•éƒ¨ hint æç¤ºæ–‡å­—
- **åœ°åœ–é€æ˜Žé–‹é—œ**ï¼ˆ`systems/gameState.js`ã€`systems/ui.js`ã€`systems/hud.js`ã€`lang/`ï¼‰ï¼šè¼”åŠ©åŠŸèƒ½æ–°å¢žã€Œåœ°åœ–é€æ˜Žã€Toggleï¼›é–‹å•Ÿå¾Œç§»å‹•æ™‚å°åœ°åœ–æ¯ 0.5 ç§’é™ä½Ž 0.15 é€æ˜Žåº¦ï¼ˆæœ€ä½Ž 0.5ï¼‰ï¼Œåœæ­¢å¾Œç·©æ…¢å›žå¾©è‡³ 1.0
- **å™¨å®˜é¸æ“‡é˜²èª¤è§¸**ï¼ˆ`systems/organs.js`ï¼‰ï¼šå™¨å®˜é¸æ“‡é¢æ¿é–‹å•Ÿå¾Œ 0.5 ç§’å…§é»žæ“Šç„¡æ•ˆï¼Œé˜²æ­¢å‡ç´š/é¸æ“‡å™¨å®˜ä»‹é¢ä¸€é–‹å³èª¤è§¸
- **å­—é«”è¼”åŠ©åŠŸèƒ½**ï¼ˆ`systems/gameState.js`ã€`systems/ui.js`ã€`systems/utils.js`ã€`lang/`ï¼‰ï¼šè¼”åŠ©åŠŸèƒ½æ–°å¢žã€Œå­—é«”åŠ å¤§ã€ï¼ˆ+2pxï¼‰èˆ‡ã€Œå­—é«”åŠ ç²—ã€å…©å€‹ Toggleï¼›æ–°å¢žå…¨åŸŸ `getGameFont(baseSize, baseBold)` å‡½å¼ï¼Œå¥—ç”¨è‡³ `hud.js`ã€`creatures.js` æ‰€æœ‰ canvas ctx.font è¨­å®š

---

## v0.0.66.0 - 2026-05-29

### ä¿®å¾©
- **æ”»æ“Šç¯„åœåœˆç¸®æ”¾ä¿®æ­£**ï¼ˆ`systems/hud.js`ï¼‰ï¼šæ”»æ“Šç¯„åœåœˆåŠå¾‘ä¹˜ä¸Š `cameraZoom`ï¼Œä¿®å¾©ç¸®æ”¾ä¸ç‚º 1 æ™‚åœˆåœˆå¤§å°éŒ¯èª¤çš„å•é¡Œ
- **ç½®é ‚è¨Šæ¯è‡ªå‹•éŽæœŸ**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`renderChat()` é–‹é ­æ–°å¢ž `_pinnedMessage.pinUntil` éŽæœŸæª¢æŸ¥ï¼›éŽæœŸå¾Œæ¸…é™¤æœ¬åœ°ç½®é ‚ç‹€æ…‹ä¸¦åŒæ­¥æ¸…é™¤è¨Šæ¯é™£åˆ—ä¸­çš„ `is_pinned`

### æ–°å¢ž
- **æŽ’è¡Œæ¦œè³½å­£ç‰ˆæœ¬åˆ¶**ï¼ˆ`config/gameConfig.js`ã€`systems/leaderboard.js`ï¼‰ï¼šç‰ˆæœ¬è™Ÿæ ¼å¼æ”¹ç‚ºå››æ®µ `v0.x.y.z`ï¼›`version_order` æ”¹å–ç¬¬äºŒæ®µ xï¼ŒåŒä¸€å€‹ x çš„è¨˜éŒ„äº’ç›¸ç«¶çˆ­ï¼ˆx=0 ç‚ºåˆå§‹è³½å­£ï¼‰
- **`/unpin` æŒ‡ä»¤**ï¼ˆ`systems/chat.js`ï¼‰ï¼šGM å¯è¼¸å…¥ `/unpin` å–æ¶ˆç•¶å‰ç½®é ‚è¨Šæ¯ï¼ˆ`_handleUnpinCommand()`ï¼‰ï¼ŒåŒæ­¥æ›´æ–°è³‡æ–™åº«èˆ‡æœ¬åœ°ç‹€æ…‹
- **ç­‰ç´šé¡è‰²è¾¨è­˜ç³»çµ±**ï¼ˆ`systems/chat.js`ï¼‰ï¼šè®Šç•°ç­‰ç´šé¡¯ç¤ºç¨ç«‹æ”¾å¤§ï¼ˆ13px, boldï¼‰ä¸¦ä¾ç­‰ç´šå¥—è‰²ï¼ˆ0 ç™½/50 ç¶ /100 è—/150 ç´«/200 ç²‰/250 é‡‘/300 ç´…/350 æ©˜/400+ å½©è™¹æ¼¸å±¤ï¼‰ï¼›`_lvColor(lvNum)` å‡½å¼
- **GM å½©è™¹ã€GMã€‘æ¨™ç±¤ + é‡‘è‰²èªªè©±å…§å®¹**ï¼ˆ`systems/chat.js`ï¼‰ï¼šGM çš„ã€GMã€‘æ¨™ç±¤æ”¹ç‚ºå½©è™¹æ¼¸å±¤è‰²ï¼Œèªªè©±å…§å®¹ä»¥é‡‘è‰² `#FFD700` é¡¯ç¤º
- **å½©è‰²å­—æ¨™ç±¤ç³»çµ±**ï¼ˆ`systems/chat.js`ï¼‰ï¼šæ”¯æ´ `[c=red]æ–‡å­—[/c]` èªžæ³•ï¼Œä¸€èˆ¬çŽ©å®¶é™ red/green/blue ä¸‰è‰²ï¼›`_parseColorTags(escapedContent, isVIP)` å‡½å¼
- **å…ˆé©…è€… VIP TODO ç´¢å¼•**ï¼ˆ`systems/chat.js`ï¼‰ï¼šæ–°å¢ž `isVipPlayer(msg)` å‡½å¼ï¼ˆç›®å‰å›žå‚³ falseï¼‰ï¼Œä½œç‚ºæœªä¾†å…ˆé©…è€…è§£éŽ–ä»»æ„é¡è‰²å½©è‰²å­—çš„äº¤æŽ¥é»ž

### èª¿æ•´
- **èŠå¤©è¨Šæ¯ç§»é™¤ç‰ˆæœ¬è™Ÿé¡¯ç¤º**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`_buildMsgHTML()` å’Œç½®é ‚å±•é–‹ç‰ˆå‡ç§»é™¤ `[ç‰ˆæœ¬è™Ÿ]` æ¬„ä½ï¼Œä»‹é¢æ›´ç°¡æ½”

---

## v0.64.0 - 2026-05-28

### æ–°å¢ž
- **èŠå¤©å®¤å¯æ‹–æ‹½ç§»å‹•**ï¼ˆ`systems/chat.js`ï¼‰ï¼šæ–°å¢ž `_makeDraggable(handle, panels)` å‡½å¼ï¼Œä»¥ `#chat-settings-btn` ç‚ºæ‹–æ‹½æŠŠæ‰‹ï¼ŒåŒæ­¥ç§»å‹• `#chat-history-panel` èˆ‡ `#chat-input-panel`ï¼›è¶…éŽ 5px æ‰åˆ¤å®šç‚ºæ‹–æ‹½ï¼Œæ»‘å‹•éŽç¨‹ä»¥é‚Šç•Œå¤¾ä½é˜²æ­¢æ‹–å‡ºç•«é¢å¤–
- **è¨˜ä½æœ€å¾Œä½ç½®**ï¼ˆ`systems/chat.js`ï¼‰ï¼šæ‹–æ‹½çµæŸå¾Œå‘¼å« `_saveChatPosition()` å­˜å…¥ `localStorage`ï¼›`buildChatUI()` å»ºç«‹æ‰‹æ©Ÿç‰ˆé¢æ¿å¾Œä»¥ `_loadChatPosition()` é‚„åŽŸä¸Šæ¬¡ä½ç½®
- **æ‹–æ‹½å¾Œä¸èª¤è§¸é½’è¼ª**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`_chatDragState.wasDragging` æ——æ¨™ç¢ºä¿æ‹–æ‹½çµæŸå¾Œçš„ click äº‹ä»¶ä¸æœƒé–‹å•Ÿè¨­å®šé¢æ¿
- **è¦–çª—èª¿æ•´é‚Šç•Œä¿è­·**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`window.resize` ç›£è½å™¨ç¢ºä¿è½‰å±å¾Œé¢æ¿ä¸è·‘å‡ºç•«é¢å¤–

---

## v0.63.1 - 2026-05-28

### æ–°å¢ž
- **èŠå¤©å®¤é¦–é å°ˆå±¬é¡¯ç¤º**ï¼ˆ`systems/chat.js`ã€`systems/ui.js`ã€`systems/evolution.js`ã€`systems/leaderboard.js`ï¼‰ï¼šæ–°å¢ž `showChat()` / `hideChat()` å·¥å…·å‡½å¼ï¼›é¦–é  7 å€‹æŒ‰éˆ•ï¼ˆé–‹å§‹éŠæˆ²ã€æŠ€èƒ½æ¨¹ã€åœ–é‘‘ã€æŽ’è¡Œæ¦œã€è¨­å®šã€æ•…äº‹ã€æ›´æ–°ï¼‰é»žæ“Šæ™‚å‘¼å« `hideChat()`ï¼›`closeCompendium()`ã€`hideSettings()`ã€`closeLb()`ã€æ•…äº‹é—œé–‰ã€æ›´æ–°æ—¥èªŒé—œé–‰ã€æŠ€èƒ½æ¨¹ fromHome é—œé–‰æ™‚è‹¥ä»åœ¨é¦–é å‰‡å‘¼å« `showChat()`ï¼›`showStartScreen()` æœ«å°¾æ”¹ç”¨ `showChat()` å–ä»£åŽŸæœ¬æ‰‹å‹•é¡¯ç¤º `#chat-panel`

---

## v0.63.0 - 2026-05-28

### é‡æ§‹
- **æ‰‹æ©Ÿç‰ˆèŠå¤©å®¤ UI é‡æ–°è¨­è¨ˆ**ï¼ˆ`systems/chat.js`ï¼‰ï¼šæ‹†åˆ†ç‚ºå…©å€‹ç¨ç«‹ fixed å…ƒç´  â€” `#chat-history-panel`ï¼ˆbottom:23vh, height:18vhï¼Œå¯æ²å‹•æ­·å²å€ï¼Œå« sticky é½’è¼ªèˆ‡ç½®é ‚è¨Šæ¯ï¼‰èˆ‡ `#chat-input-panel`ï¼ˆbottom:5vh, height:5vhï¼Œç¨ç«‹è¼¸å…¥åˆ—ï¼‰ï¼›ç§»é™¤èˆŠç‰ˆ `#chat-panel` æ‰‹æ©Ÿåˆ†æ”¯èˆ‡ `_adjustMobileChatHeight()`
- **renderChat() é›™è·¯å¾‘**ï¼ˆ`systems/chat.js`ï¼‰ï¼šåµæ¸¬ `#chat-history-panel` å­˜åœ¨æ™‚èµ°æ‰‹æ©Ÿç‰ˆè·¯å¾‘ï¼ˆè¨Šæ¯ä»¥ `<p>` ç›´æŽ¥ appendï¼‰ï¼Œå¦å‰‡èµ°æ¡Œæ©Ÿç‰ˆè·¯å¾‘ï¼ˆè¡Œç‚ºä¸è®Šï¼‰
- **_isAtBottom() æ›´æ–°**ï¼ˆ`systems/chat.js`ï¼‰ï¼šå„ªå…ˆæŠ“å– `#chat-history-panel`ï¼Œæ¡Œæ©Ÿç‰ˆ fallback è‡³ `#chat-messages`

---

## v0.62.2 - 2026-05-28

### ä¿®å¾©
- **æ‰‹æ©Ÿç‰ˆèŠå¤©å®¤åº•éƒ¨ç•™ç©º**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`#chat-panel` æ‰‹æ©Ÿç‰ˆ `bottom:0` æ”¹ç‚º `bottom:5vh`ã€`height:25vh` æ”¹ç‚º `height:20vh`ï¼Œé¿å…èˆ‡ç•«é¢æœ€åº•éƒ¨æ“ä½œå€é‡ç–Šï¼›`border-radius` æ”¹ç‚ºå››è§’åœ“ï¼ˆä¸å†è²¼åº•ï¼‰
- **æ‰‹æ©Ÿç‰ˆ flex ä½ˆå±€è£œå¼·**ï¼ˆ`systems/chat.js`ï¼‰ï¼šæ‰‹æ©Ÿç‰ˆå°ˆå±¬è£œä¸è£œä¸Š `#chat-messages` çš„ `box-sizing:border-box`ã€`#chat-input-row` çš„ `height:36px`ã€`#chat-settings-btn` çš„ `flex-shrink:0`ï¼Œç¢ºä¿è¼¸å…¥åˆ—å›ºå®šåº•éƒ¨ä¸”ä¸è¢«å…§å®¹æ’å‡º

---

## v0.62.1 - 2026-05-28

### ä¿®å¾©
- **èŠå¤©å®¤ç§»è‡³ body fixed å®šä½**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`#chat-panel` å¾ž `#game-container` ç§»è‡³ `document.body`ï¼Œ`position` æ”¹ç‚º `fixed`ï¼ˆæ¡Œæ©Ÿ left:10px bottom:10pxï¼Œæ‰‹æ©Ÿ bottom:0 left:5% right:5%ï¼‰ï¼Œå®Œå…¨è„«é›¢éŠæˆ²å®¹å™¨ CSS é®è”½ï¼Œä¿®å¾©æ»¾å‹•èˆ‡è¼¸å…¥è¢«æ””æˆªçš„å•é¡Œ
- **è¨­å®šé¢æ¿ä¸å†è¢«è£åˆ‡**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`#chat-settings-panel` ç§»è‡³ `document.body`ï¼Œ`position:fixed`ã€`z-index:9999`ï¼›é½’è¼ªæŒ‰éˆ• onclick æ”¹ç”¨ `getBoundingClientRect()` å‹•æ…‹è¨ˆç®—ä½ç½®ï¼Œå°é½Š `#chat-panel` å³ä¸Šè§’ï¼Œè§£æ±º `overflow:hidden` è£åˆ‡å•é¡Œ

---

## v0.62.0 - 2026-05-28

### ä¿®å¾©
- **èŠå¤©å®¤æ»¾å‹•ä¿®å¾©**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`#chat-messages` æ”¹ç”¨ `overflow-y:scroll` å¼·åˆ¶é¡¯ç¤ºæ»¾å‹•æ¢ï¼Œè£œä¸Š `overflow-x:hidden`ã€`scrollbar-width:thin`ï¼›`#chat-input-row` è£œ `width:100%`ï¼Œç¢ºä¿è¼¸å…¥æ¡†æ°¸é å›ºå®šæ–¼é¢æ¿åº•éƒ¨ä¸è¢«æŽ¨å‡º

### æ–°å¢ž
- **GM åå­—é‡‘è‰²**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`_parseName()` ä¸­ GM ç™¼è¨€çš„åå­—æ¬„ä½å¥—ç”¨ `#FFD700` é‡‘è‰²ï¼Œèˆ‡ã€GMã€‘æ¨™ç±¤ä¸€è‡´
- **ç¨±è™Ÿç³»çµ±**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`player_name` æ ¼å¼æ“´å……ç‚º `lv{N}|{name}|{title}`ï¼ˆç¨±è™Ÿé¸å¡«ï¼‰ï¼›ç™»å…¥æ™‚å¾ž `chat_users.title` è®€å–ä¸¦å­˜å…¥ `chatSettings`ï¼›è¨Šæ¯æ ¼å¼æ–°å¢ž `[ç¨±è™Ÿ]`ï¼ˆæ·¡è—è‰² `#88CCFF`ï¼‰ï¼Œé¡¯ç¤ºæ–¼ã€GMã€‘å¾Œã€åå­—å‰

---

## v0.61.0 - 2026-05-28

### æ–°å¢ž
- **èŠå¤©å®¤è¨Šæ¯æ™‚é–“æˆ³**ï¼ˆ`systems/chat.js`ï¼‰ï¼šæ¯å‰‡è¨Šæ¯æœ€å·¦æ¬„æ–°å¢žç›¸å°æ™‚é–“é¡¯ç¤ºï¼ˆå‰›å‰› / Nåˆ†é˜å‰ / Nå°æ™‚å‰ / æ˜¨å¤© HH:MMï¼‰ï¼Œç½®é ‚è¨Šæ¯åŒæ­¥é¡¯ç¤º
- **èŠå¤©å®¤å¾€ä¸‹æŒ‰éˆ•**ï¼ˆ`systems/chat.js`ï¼‰ï¼šå‘ä¸Šæ²å‹•å¾Œå³ä¸‹è§’å‡ºç¾ â†“ æŒ‰éˆ•ï¼Œé»žæ“Šè·³å›žæœ€æ–°è¨Šæ¯ï¼›è‡ªå‹•åœ¨åº•éƒ¨æ™‚éš±è—

### ä¿®å¾©
- **è¼¸å…¥æ¡†å›ºå®šåº•éƒ¨**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`#chat-messages` è£œä¸Š `min-height:0`ï¼Œé˜²æ­¢ flex å­å…ƒç´ æ’ç ´å®¹å™¨ï¼Œç¢ºä¿è¼¸å…¥åˆ—å§‹çµ‚å›ºå®šæ–¼é¢æ¿åº•éƒ¨

---

## v0.60.2 - 2026-05-28

### ä¿®å¾©
- **èŠå¤©å®¤è¨­å®šé¢æ¿è£œä¸Šé—œé–‰æŒ‰éˆ•**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`_renderChatSettingsPanel()` é ‚éƒ¨æ–°å¢ž âœ• æŒ‰éˆ•ï¼Œé»žæ“Šå¾Œéš±è—é¢æ¿ï¼Œè§£æ±ºè¨­å®šé¢æ¿é–‹å•Ÿå¾Œç„¡æ³•é—œé–‰çš„å•é¡Œ

---

## v0.60.1 - 2026-05-28

### ä¿®å¾©
- **åŒæ­¥è³‡æ–™ä¸è¦†è“‹æœ¬åœ° SAVE_VERSION**ï¼ˆ`systems/chat.js`ï¼‰ï¼š`_applyRemoteData()` å¯«å›ž localStorage æ™‚æŽ’é™¤ `SAVE_VERSION`ï¼Œé˜²æ­¢é›²ç«¯èˆŠç‰ˆæœ¬è™Ÿè¦†è“‹æœ¬åœ°ï¼Œé¿å…å­˜æª”æ ¼å¼åˆ¤æ–·éŒ¯èª¤

---

## v0.60.0 - 2026-05-28

### æ–°å¢ž
- **èŠå¤©å®¤å¸³è™Ÿç³»çµ±**ï¼ˆ`systems/chat.js`ï¼‰ï¼šâš™ï¸ è¨­å®šé¢æ¿æ”¹ç‰ˆç‚ºç™»å…¥/å·²ç™»å…¥å…©ç‹€æ…‹ï¼›æ–°å¢ž `chatLogin`ï¼ˆæŸ¥å¸³/è‡ªå‹•è¨»å†Š/å¯†ç¢¼ SHA-256 é©—è­‰/é€²åº¦æ¯”è¼ƒåŒæ­¥ï¼‰ã€`chatSaveProgress`ã€`chatSyncData`ã€`chatLogout`ï¼ˆæ¸…é™¤æœ¬åœ°æ‰€æœ‰éŠæˆ²é€²åº¦ï¼‰
- **éŠæˆ²çµæŸè‡ªå‹•ä¿å­˜**ï¼ˆ`systems/boss.js`ã€`systems/daynight.js`ï¼‰ï¼šæ­»äº¡èˆ‡å‹åˆ©çµç®—å‰ï¼Œè‹¥å·²ç™»å…¥å‰‡è‡ªå‹•å‘¼å« `chatSaveProgress()` ä¸¦é¡¯ç¤º 2 ç§’æç¤º

### æ³¨æ„
- âš ï¸ å¸³è™Ÿèˆ‡å¯†ç¢¼ç¶å®šï¼Œå¿˜è¨˜å¯†ç¢¼è«‹è¯çµ¡é–‹ç™¼è€… Kiserï¼›ç™»å‡ºå‰è«‹å…ˆæ‰‹å‹•ä¿å­˜é€²åº¦

---

## v0.59.0 - 2026-05-28

### æ–°å¢ž
- **é¦–é å³æ™‚èŠå¤©å®¤**ï¼ˆ`systems/chat.js`ã€`systems/ui.js`ã€`main.js`ã€`index.html`ï¼‰ï¼šé¦–é é¡¯ç¤º Supabase Realtime èŠå¤©å®¤é¢æ¿ï¼ˆæ¡Œæ©Ÿ 320Ã—220pxï¼Œæ‰‹æ©Ÿ 25vhï¼‰ï¼›æ”¯æ´ GM é©—è­‰ã€ç½®é ‚è¨Šæ¯ï¼ˆ`/pin 1H`ï¼‰ã€1 å°æ™‚é–’ç½®è‡ªå‹•æ–·ç·šã€24 å°æ™‚èˆŠè¨Šæ¯è‡ªå‹•æ¸…ç†ï¼›ç„¡ JS Client æ™‚è‡ªå‹•é™ç´šç‚º 8 ç§’è¼ªè©¢

---

## v0.58.0 - 2026-05-25

### æ–°å¢ž
- **å°åœ°åœ–å¤§å°èª¿æ•´**ï¼ˆ`systems/gameState.js`ã€`systems/hud.js`ã€`systems/ui.js`ï¼‰ï¼šè¨­å®šé¢æ¿æ–°å¢žå°åœ°åœ–å¤§å°å€å¡Šï¼ˆ0~10 æ ¼è‰²å¡Šï¼‰ï¼ŒOFF æ™‚éš±è— minimapCanvas ä¸¦å°‡ minimap-info ç§»è‡³ top-left åŒé«˜ï¼›æ•¸å€¼ä»¥ `minimapSize` å„²å­˜æ–¼ localStorageï¼Œç‰ˆæœ¬æ›´æ–°ä¸é‡ç½®
- **è¦–é‡Žæ™ºèƒ½/æ‰‹å‹•æ¨¡å¼**ï¼ˆ`systems/gameState.js`ã€`systems/camera.js`ã€`systems/ui.js`ï¼‰ï¼š`_updateMobileCameraZoom()` é‡æ§‹ç‚º `_updateCameraZoom()`ï¼Œæ”¯æ´æ¡Œæ©Ÿèˆ‡æ‰‹æ©Ÿï¼›æ–°å¢ž `cameraMode`ï¼ˆsmart/manualï¼‰èˆ‡ `cameraZoomLevel`ï¼ˆ1~10ï¼‰è¨­å®šï¼›`worldToScreen()` èˆ‡ `drawTerrain()` çš„ zoom æ¢ä»¶ç§»é™¤ `isMobile` é™åˆ¶ï¼›è¨­å®šé¢æ¿æ–°å¢ž 10 æ ¼ç¸®æ”¾åˆ»åº¦èª¿æ•´å™¨èˆ‡æ™ºèƒ½/æ‰‹å‹•åˆ‡æ›æŒ‰éˆ•

---

## v0.57.7 - 2026-05-25

### ä¿®å¾©
- **æŠ€èƒ½æ¨¹ forceStart è·¯å¾‘æœªè®€ localStorage**ï¼ˆ`systems/evolution.js`ï¼‰ï¼š`buildSkillTreeOverlay(forceStart)` ç¾åœ¨èˆ‡ `fromHome` èµ°ç›¸åŒæµç¨‹â€”â€”é–‹å•Ÿæ™‚è®€å– `skillPoints` / `playerSkills`ï¼Œå™¨å®˜ç¹¼æ‰¿åˆ—è¡¨æ”¹è®€ `lastRunOrgans`ï¼›åŽŸæœ¬è®€è¨˜æ†¶é«” `gameState.player.organs` çš„é‚è¼¯é™ç¸®è‡³ `postGame` æ¨¡å¼ï¼ˆéŠæˆ²å‰›çµæŸè¨˜æ†¶é«”ä»å®Œæ•´çš„æƒ…æ³ï¼‰ï¼›ä¿®å¾©äº†åˆ·æ–°å¾Œé€²å…¥æŠ€èƒ½æ¨¹çœ‹ä¸åˆ°æŠ€èƒ½é»žèˆ‡å¯ç¹¼æ‰¿å™¨å®˜çš„å•é¡Œ

---

## v0.57.6 - 2026-05-25

### èª¿æ•´
- **ç„¡è‰é£Ÿæ€§æ™‚æžœå­ XP é™ç‚º 1**ï¼ˆ`systems/player.js`ï¼‰ï¼š`_collectFruit()` æ–°å¢žè‰é£Ÿæ€§ç­‰ç´šåˆ¤æ–·ï¼›`ev.herbivore >= 1` ç¶­æŒåŽŸè¨ˆç®—ï¼ˆåŸºç¤Ž5 + forager + è‰é£Ÿbonusï¼‰ï¼Œæœªé”è‰é£Ÿæ€§ Lv1 å‰‡åªçµ¦ 1 XPï¼›é¿å…åˆ·å·¨äººæ™‚çŽ©å®¶é åƒæžœå­è§¸ç™¼å‡ç´šå›žè¡€

---

## v0.57.5 - 2026-05-25

### ä¿®å¾©
- **é˜¿å¥‡çˆ¾å­å½ˆç©¿é€æ•™å­¸æœ¨æ¨**ï¼ˆ`systems/player.js`ï¼‰ï¼š`_checkProjectileHit()` çš„ targets é™£åˆ—è£œå…¥ `gameState.tutorialStump`ï¼Œä¸¦ç¢ºèªæ­»äº¡è·¯ç”±åŒ…å« `isTutorialStump` åˆ¤æ–·
- **é–‹å§‹éŠæˆ²è·³éŽæŠ€èƒ½æ¨¹å°Žè‡´æ‰€æœ‰å±¬æ€§ä¸Ÿå¤±**ï¼ˆ`main.js`ã€`systems/evolution.js`ï¼‰ï¼š`loadSavedOrgans()` æŠ½å‡ºç‚ºç¨ç«‹å‡½å¼ä¸¦åœ¨ `initializeGame()` æ­¥é©Ÿ 8 çš„ `applySkillBonuses()` ä¹‹å‰å‘¼å«ï¼Œç¢ºä¿å™¨å®˜æ•ˆæžœä¸ä¾è³´æŠ€èƒ½æ¨¹é¢æ¿é–‹å•Ÿï¼›`buildSkillTreeOverlay()` çš„ `fromHome` è·¯å¾‘ç§»é™¤é‡è¤‡çš„å™¨å®˜è¼‰å…¥å‘¼å«

### æ–°å¢ž
- **è¼”åŠ©åŠŸèƒ½ã€Œæ°¸é å±…ä¸­ã€é¸é …**ï¼ˆ`systems/gameState.js`ã€`systems/camera.js`ã€`systems/ui.js`ï¼‰ï¼šè¨­å®šé¢æ¿è¼”åŠ©åŠŸèƒ½å€å¡Šæ–°å¢ž Toggleï¼›é–‹å•Ÿå¾Œè¦–è§’é‚Šç•Œé–¾å€¼å¾ž 30% æ”¹ç‚º 50%ï¼Œè§’è‰²æ°¸é å›ºå®šæ–¼ç•«é¢æ­£ä¸­å¤®ï¼›é è¨­é—œé–‰ï¼ŒçŽ©å®¶è‡ªç”±é¸æ“‡

### èª¿æ•´
- **æ‰‹æ©Ÿæ”»æ“Šè“„åŠ›æ”¹ç‚º touchstart å³é–‹å§‹è¨ˆæ™‚**ï¼ˆ`systems/mobile.js`ï¼‰ï¼šæ”»æ“ŠæŒ‰éˆ• touchstart çž¬é–“é–‹å§‹è“„åŠ›è¨ˆæ™‚ï¼Œtouchend æ™‚ä¾è“„åŠ›æ™‚é–“ï¼ˆâ‰¥500msï¼‰ç™¼å‹•è“„åŠ›æ”»æ“Šï¼ˆå‚·å®³ Ã—2ï¼‰ï¼Œå¦å‰‡æ™®é€šæ”»æ“Šï¼›touchcancel é‡ç½®è“„åŠ›ç‹€æ…‹ï¼›`initializeGame()` è£œé½Šä¸‰å€‹è“„åŠ›æ——æ¨™çš„é‡ç½®

---

## v0.57.4 - 2026-05-25

### ä¿®å¾©
- **è¶£å‘³æŽ’è¡Œæ¦œè§’è‰²æ¬„**ï¼ˆ`systems/leaderboard.js`ï¼‰ï¼šè§’è‰²å¾žåå­—ä¸‹å°å­—ç¨ç«‹ç‚ºç¬¬ä¸‰æ¬„ï¼Œè¡¨æ ¼çµæ§‹æ”¹ç‚ºã€ŒæŽ’åï½œåå­—ï½œè§’è‰²ï½œæ•¸å€¼ï½œç‰ˆæœ¬ï½œæ—¥æœŸã€ï¼ˆ6 æ¬„ï¼‰
- **é˜¿å¥‡çˆ¾å¤œæ™šå…‰åœˆ**ï¼ˆ`systems/hud.js`ï¼‰ï¼šå¤œæ™šå¤–åœˆå¾žåœ“å½¢ `arc` æ”¹ç‚ºä¸‰è§’å½¢ï¼Œèˆ‡è§’è‰²å¤–åž‹ä¸€è‡´
- **é˜¿å¥‡çˆ¾ FæŠ€è¦–è¦ºæ•ˆæžœ**ï¼ˆ`systems/hud.js`ï¼‰ï¼šFæŠ€è¡åˆºï¼ˆ`archerDashActive`ï¼‰æœŸé–“åœ¨è§’è‰²å¤–åœé¡¯ç¤ºç´…è‰²ä¸‰è§’å½¢é‚Šæ¡†ï¼Œå«ç´…è‰²å…‰æšˆ

---

## v0.57.3 - 2026-05-25

### ä¿®å¾©
- **TOP 10 è§’è‰²æ¬„ä½å…¨é¡¯ç¤ºã€Œå™ªéµ‘ã€**ï¼ˆ`config/supabase.js`ï¼‰ï¼š`fetchTop10` çš„ select ç¼ºå°‘ `character` æ¬„ä½ï¼Œå°Žè‡´ `row.character` æ°¸é ç‚º `undefined` è€Œ fallback åˆ° `koel`ï¼›å·²è£œä¸Š
- **è¶£å‘³æŽ’è¡Œæ¦œç„¡è§’è‰²é¡¯ç¤º**ï¼ˆ`config/supabase.js`ã€`systems/leaderboard.js`ï¼‰ï¼šæ‰€æœ‰ `fetchFun*` æŸ¥è©¢çš„ select è£œä¸Š `character`ï¼›`loadFunRows` é¡¯ç¤ºé‚è¼¯åœ¨åå­—ä¸‹æ–¹åŠ è§’è‰²å°å­—

---

## v0.57.2 - 2026-05-25

### ä¿®å¾©
- **è§’è‰²é¸æ“‡ç•«é¢**ï¼ˆ`systems/ui.js`ï¼‰ï¼šè§’è‰²æŒ‰éˆ•æ¨™ç±¤æ”¹ç”¨ `t('charXxx')` èªžè¨€åŒ…é¡¯ç¤ºï¼Œéš¨èªžè¨€åˆ‡æ›åŒæ­¥æ›´æ–°ï¼ˆåŽŸæœ¬ç¡¬å¯« `c.name + 'ï¼ˆ' + c.nameEn + 'ï¼‰'`ï¼‰

---

## v0.57.1 - 2026-05-25

### ä¿®å¾©
- **è§’è‰²åç¨±èªžè¨€åŒ…**ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼šä¸­æ–‡æ”¹ç‚ºã€Œå™ªéµ‘ã€ï¼ã€Œé˜¿å¥‡çˆ¾ã€ï¼Œè‹±æ–‡æ”¹ç‚ºã€ŒKoelã€ï¼ã€ŒArcherfishã€ï¼ŒæŽ’è¡Œæ¦œèˆ‡ TOP 10 é¡¯ç¤ºæ›´ç°¡æ½”

---

## v0.57.0 - 2026-05-25

### æ–°å¢ž
- **æŽ’è¡Œæ¦œè§’è‰²æ¬„ä½**ï¼ˆ`systems/leaderboard.js`ã€`systems/ui.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼šå…¨å±æŽ’è¡Œæ¦œè¡¨æ ¼åœ¨ã€Œåå­—ã€å¾Œæ–°å¢žã€Œè§’è‰²ã€æ¬„ä½ï¼›TOP 10 æµ®çª—åå­—ä¸‹æ–¹é¡¯ç¤ºå°å­—è§’è‰²æ¨™ç±¤ï¼›åˆ†æ•¸ä¸Šå‚³ data ç‰©ä»¶åŠ å…¥ `character` æ¬„ä½ï¼Œè‡ªå‹•è¨˜éŒ„æœ¬å±€é¸ç”¨è§’è‰²

---

## v0.56.0 - 2026-05-25

### æ–°å¢ž
- **è§’è‰²é¸æ“‡ç³»çµ±**ï¼ˆ`config/characters.js`ã€`systems/ui.js`ï¼‰ï¼šé›£åº¦é¸æ“‡å¾Œå‡ºç¾è§’è‰²é¸æ“‡ç•«é¢ï¼›å™ªéµ‘/é˜¿å¥‡çˆ¾å¯é¸ï¼Œã€Œï¼Ÿå³å°‡æŽ¨å‡ºðŸ”’ã€æ ¼å­é ç•™ï¼›`CHARACTERS` å¸¸æ•¸å®šç¾©å„è§’è‰²å±¬æ€§ã€èµ·å§‹å™¨å®˜ã€èµ·å§‹é€²åŒ–
- **é˜¿å¥‡çˆ¾ï¼ˆArcherfishï¼‰**ï¼ˆ`config/characters.js`ã€`systems/player.js`ã€`systems/combat.js`ï¼‰ï¼šé¦–å€‹é ç¨‹æ”»æ“Šè§’è‰²ï¼›HP60/é€Ÿåº¦2.0ï¼ˆæ°´ä¸­+50%ï¼‰/æ”»æ“Šç¯„åœ120px/æš´æ“Š1.25x/æ”»é€Ÿ1500msï¼›ä¸‰è§’å½¢å¤–è§€ï¼ˆç¥žä»™é­šè— #4FC3F7ï¼‰ï¼Œå·¦å³ç¿»è½‰æœå‘ç§»å‹•æ–¹å‘
- **Reload å……èƒ½ç³»çµ±**ï¼ˆ`systems/player.js`ï¼‰ï¼šä¸æ”»æ“Šæ™‚æ¯1.0ç§’ï¼ˆå—æ”»é€Ÿå½±éŸ¿ï¼‰+1æ ¼ï¼Œä¸Šé™3æ ¼ï¼›ä»»ä½•æ”»æ“Šå¾Œè¨ˆæ™‚å™¨é‡ç½®æ¶ˆè€—1æ ¼ï¼›é ­ä¸Š3æ ¼æŒ‡ç¤º+å‘¨åœè—è‰²æ³¡æ³¡è¦–è¦º
- **å­å½ˆç³»çµ±**ï¼ˆ`systems/player.js`ã€`systems/combat.js`ï¼‰ï¼š`gameState.projectiles[]` ç®¡ç†ï¼›é€Ÿåº¦9px/å¹€ï¼Œè¶…å‡ºæ”»æ“Šç¯„åœ120%æ¶ˆå¤±ï¼›è—è‰²åŠé€æ˜Žæ°´æ™¶bubbleè¦–è¦º
- **è‡ªå‹•/æ‰‹å‹•æ”»æ“Šæ¨¡å¼**ï¼ˆ`systems/player.js`ã€`systems/input.js`ï¼‰ï¼šè‡ªå‹•=ç§»å‹•æ–¹å‘Â±45Â°æ‰‡å½¢å…§æœ€è¿‘ç›®æ¨™å„ªå…ˆï¼Œç„¡ç›®æ¨™â†’å…¨å ´æœ€è¿‘ï¼›æ‰‹å‹•é›»è…¦=æ»‘é¼ æ–¹å‘+æŒ‰ä½è“„åŠ›ï¼ˆæœ€å¤š3æ ¼ï¼‰ï¼Œæ”¾é–‹ç™¼å°„ï¼›æ‰‹å‹•æ‰‹æ©Ÿ=æ”»æ“Šå€è®Šæ–¹å‘éˆ•ï¼Œæ‹–å‹•æ±ºå®šæ–¹å‘
- **é˜¿å¥‡çˆ¾ F æŠ€è¡åˆº**ï¼ˆ`systems/player.js`ï¼‰ï¼šé™¸åœ°+3é€Ÿ/æ°´ä¸­+5é€Ÿï¼ŒæŒçºŒ3ç§’ï¼Œè¡åˆºæœŸé–“æ’žæ€ªæšˆçœ©0.5ç§’+é™„åŠ å‚·å®³ï¼Œå†·å»15ç§’
- **æ–°å™¨å®˜ï¼šå˜´å™¨**ï¼ˆ`config/organs.js`ï¼‰ï¼šæ”»æ“Šé¡ž Lv1~3ï¼Œç´¯è¨ˆæ”»æ“Š+10ï¼ŒLv3 å‘½ä¸­ä½¿ç›®æ¨™ç§»å‹•é€Ÿåº¦-20%æŒçºŒ2ç§’ï¼›é˜¿å¥‡çˆ¾èµ·å§‹ Lv3
- **æ–°å™¨å®˜ï¼šé­šé±—**ï¼ˆ`config/organs.js`ï¼‰ï¼šé˜²ç¦¦é¡ž Lv1~3ï¼Œç´¯è¨ˆéŸŒæ€§+30%ï¼ˆLv1=5%/Lv2=15%/Lv3=30%ï¼‰
- **æ–°å™¨å®˜ï¼šé¯Šé­šå—…è‘‰**ï¼ˆ`config/organs.js`ï¼‰ï¼šéˆåŠ›é¡ž Lv1~3ï¼Œè¦†è“‹æ•ˆæžœï¼Œå°ä½Žè¡€é‡ç›®æ¨™å‚·å®³+10/15/20%ï¼ˆé–¾å€¼15/30/50%ï¼‰
- **éŸŒæ€§å±¬æ€§ç³»çµ±**ï¼ˆ`systems/utils.js`ã€`systems/organs.js`ã€`systems/combat.js`ï¼‰ï¼šæ¸›å°‘è¢«æŽ§åˆ¶æŒçºŒæ™‚é–“ï¼Œä¸å½±éŸ¿æ¸›é€Ÿå¹…åº¦ï¼›`applyTenacity(durationMs, target)` é€šç”¨å‡½å¼ï¼›é©ç”¨æšˆçœ©/ç¡¬æŽ§/æ¸›é€Ÿï¼›å·²å¥—ç”¨è‡³çŒžçŒæš´æ“Šç·©é€Ÿã€é±·é­šæ­»äº¡ç¿»æ»¾
- **å˜´å™¨ Lv3 æ¸›é€Ÿ**ï¼ˆ`systems/player.js`ã€`systems/combat.js`ã€`systems/creatures.js`ï¼‰ï¼šè¿‘æˆ°åŠé ç¨‹å‘½ä¸­å‡å¯æ–½åŠ  -20% é€Ÿåº¦ã€2ç§’ï¼ˆå—ç›®æ¨™éŸŒæ€§ç¸®çŸ­ï¼‰ï¼›`_effSpeed(c)` çµ±ä¸€ç®¡ç†æœ‰æ•ˆé€Ÿåº¦ï¼Œå·²å¥—ç”¨è‡³ neutral/hostile/elite/boss æ‰€æœ‰ç§»å‹•è·¯å¾‘
- **é¯Šé­šå—…è‘‰è™•æ±ºåŠ æˆ**ï¼ˆ`systems/player.js`ã€`systems/combat.js`ï¼‰ï¼šè¿‘æˆ°åŠé ç¨‹æ”»æ“Šä¸­ï¼Œè‹¥ç›®æ¨™è¡€é‡ä½Žæ–¼é–¾å€¼å‰‡é¡å¤–åŠ æˆå‚·å®³
- **æ‰‹æ©Ÿè¦–é‡Žç¸®æ”¾**ï¼ˆ`systems/camera.js`ã€`main.js`ï¼‰ï¼š`_updateMobileCameraZoom()` ä¾çŽ©å®¶é«”åž‹å‹•æ…‹èª¿æ•´ `cameraZoom`ï¼ˆé«”åž‹æ¯+20%ç¸®å°5%ï¼Œæœ€å°0.6ï¼‰ï¼›`worldToScreen()` ä»¥èž¢å¹•ä¸­å¿ƒç‚ºåŸºæº–ç¸®æ”¾ï¼Œæ¡Œæ©Ÿä¸å—å½±éŸ¿
- **Boss è¡€æ¢ Debuff åœ–ç¤º**ï¼ˆ`systems/boss.js`ï¼‰ï¼šè¡€æ¢ä¸‹æ–¹æ­£æ–¹å½¢åœ–ç¤ºåˆ—ï¼›æ¯’å‚·ç¶ /æµè¡€ç´…/æ¸›é€Ÿè—/æšˆçœ©é»ƒï¼›é€†æ™‚é‡ç¸®æ¸›é€²åº¦é‚Šæ¡†ï¼›æœ€å¤š4å€‹åŒæ™‚é¡¯ç¤º
- **Debuff StartTime è¿½è¹¤**ï¼ˆ`systems/combat.js`ã€`systems/player.js`ï¼‰ï¼šæ–½åŠ æ¯’/æµè¡€/æ¸›é€Ÿ/æšˆçœ©æ™‚åŒæ­¥è¨˜éŒ„ `_[type]StartTime`ï¼Œä¾› Debuff åœ–ç¤ºå¼§åº¦é€²åº¦è¨ˆç®—

### ä¿®å¾©
- **å™¨å®˜åç¨±é¡¯ç¤º undefined**ï¼ˆ`config/organs.js`ï¼‰ï¼š`mouthOrgan`/`fishScale`/`sharkLeaf` è£œä¸Š `name` æ¬„ä½
- **ç²¾è‹±æ€ª/Boss å˜´å™¨æ¸›é€Ÿç„¡æ•ˆ**ï¼ˆ`systems/elite.js`ã€`systems/boss.js`ï¼‰ï¼šç§»å‹•å‘¼å«æ”¹ç”¨ `_effSpeed()`ï¼Œæ¸›é€Ÿç¾åœ¨æ­£ç¢ºç”Ÿæ•ˆ
- **æ»‘é¼ æ‹–æ›³ç”¢ç”Ÿæ–‡å­—é¸å–**ï¼ˆ`index.html`ï¼‰ï¼š`#game-container` å¥—ç”¨ `user-select: none`ï¼Œç¦æ­¢æ–‡å­—é¸å–å’Œå³éµé¸å–®
- **æ‰‹æ©Ÿè¿”å›žéµ/å·¦æ»‘é€€å‡ºéŠæˆ²**ï¼ˆ`main.js`ï¼‰ï¼š`history.pushState` + `popstate` å…¨ç¨‹æ””æˆªç€è¦½å™¨è¿”å›žè¡Œç‚º

---

## v0.55.0 - 2026-05-24

### æ–°å¢žï¼ˆPhase Cï¼‰

- **æ–°å™¨å®˜ Ã— 3**ï¼ˆ`config/organs.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼š
  - `mouthOrgan`ï¼ˆæ”»æ“Šåž‹ï¼Œ3 ç´šï¼‰ï¼šæ”»æ“Š+4 â†’ +4 â†’ +2ï¼ŒLv3 å‘½ä¸­ä½¿ç›®æ¨™ç§»é€Ÿ -20% / 2 ç§’
  - `fishScale`ï¼ˆé˜²ç¦¦åž‹ï¼Œ3 ç´šï¼‰ï¼šéŸŒæ€§ +5% â†’ +10% â†’ +15%ï¼ˆç´¯è¨ˆ 30%ï¼‰ï¼Œæ¸›å°‘çŽ©å®¶è¢«æŽ§åˆ¶æ™‚é–“
  - `sharkLeaf`ï¼ˆç²¾ç¥žåž‹ï¼Œ3 ç´šï¼‰ï¼šå°ä½Žè¡€é‡ç›®æ¨™ï¼ˆ15%/30%/50%ï¼‰å‚·å®³åŠ æˆ 10%/15%/20%

- **éŸŒæ€§å±¬æ€§ç³»çµ±**ï¼ˆ`systems/utils.js`ï¼‰ï¼š
  `applyTenacity(durationMs, target)` æ ¹æ“šç›®æ¨™è‡ªèº« `tenacity`ï¼ˆ0~1ï¼‰ç¸®çŸ­ CC æ•ˆæžœæŒçºŒæ™‚é–“ï¼›
  å·²å¥—ç”¨è‡³çŽ©å®¶è¢«çŒžçŒç·©é€Ÿï¼ˆ`_lynxSlowUntil`ï¼‰åŠé±·é­šæ­»äº¡ç¿»æ»¾ï¼ˆ`_stunUntil`ï¼‰

- **å˜´å™¨ Lv3 æ¸›é€Ÿ**ï¼ˆ`systems/player.js`ã€`systems/combat.js`ã€`systems/creatures.js`ï¼‰ï¼š
  è¿‘æˆ°å‘½ä¸­ï¼ˆ`playerAttack`ï¼‰èˆ‡é ç¨‹å‘½ä¸­ï¼ˆ`_checkProjectileHit`ï¼‰å‡å¯å°ç›®æ¨™æ–½åŠ  -20% é€Ÿåº¦ã€
  æŒçºŒ 2 ç§’ï¼ˆå—ç›®æ¨™éŸŒæ€§ç¸®çŸ­ï¼‰ï¼›æ–°å¢ž `_effSpeed(c)` å‡½å¼çµ±ä¸€è™•ç†ç”Ÿç‰©æœ‰æ•ˆç§»å‹•é€Ÿåº¦ï¼Œ
  å·²å¥—ç”¨è‡³ `updateNeutralCreatures`ã€`updateHostileCreatures` å…¨éƒ¨ç§»å‹•è·¯å¾‘

- **é¯Šé­šè‘‰åŸ·è¡ŒåŠ æˆ**ï¼ˆ`systems/player.js`ã€`systems/combat.js`ï¼‰ï¼š
  è¿‘æˆ°åŠé ç¨‹æ”»æ“Šä¸­ï¼Œè‹¥ç›®æ¨™è¡€é‡ä½Žæ–¼ç•¶å‰ç­‰ç´šé–¾å€¼å‰‡é¡å¤–åŠ æˆå‚·å®³ï¼›
  `sharkLeaf` ç­‰ç´šç›´æŽ¥è®€å– `ORGANS.sharkLeaf.levels[lv-1].effects.executeBonus`

- **æ‰‹æ©Ÿè¦–é‡Žç¸®æ”¾**ï¼ˆ`systems/camera.js`ã€`main.js`ï¼‰ï¼š
  `_updateMobileCameraZoom()` ä¾çŽ©å®¶é«”åž‹ï¼ˆradiusï¼‰è¨ˆç®—ç¸®æ”¾æ¯”ï¼ˆé«”åž‹å¢žåŠ  20% â†’ ç¸®å° 5%ï¼Œæœ€å° 0.6ï¼‰ï¼›
  `worldToScreen()` åŠ å…¥ç¸®æ”¾é‚è¼¯ï¼ˆä»¥èž¢å¹•ä¸­å¿ƒç‚ºåŸºæº–ï¼‰ï¼Œåƒ…åœ¨ `gameState.isMobile` æ™‚å•Ÿç”¨

- **Boss è¡€æ¢ Debuff åœ–ç¤º**ï¼ˆ`systems/boss.js`ï¼‰ï¼š
  `_drawBossDebuffIcons()` åœ¨ Boss è¡€æ¢æ­£ä¸‹æ–¹é¡¯ç¤ºæœ€å¤š 4 å€‹ Debuff åœ–ç¤ºï¼ˆæ¯’/æµè¡€/æ¸›é€Ÿ/æšˆçœ©ï¼‰ï¼Œ
  æ¯å€‹åœ–ç¤ºå«æ·±è‰²èƒŒæ™¯ã€å½©è‰²é‚Šæ¡†ã€ç¸®å¯«æ¨™ç±¤ã€ä»¥åŠé€†æ™‚é‡å‰©é¤˜æ™‚é–“å¼§ï¼›
  å„ Debuff æ–½åŠ é»žï¼ˆ`combat.js`ã€`player.js`ï¼‰åŒæ­¥è¨˜éŒ„ `_poisonStartTime`ã€`_bleedStartTime`ã€
  `_slowStartTime`ã€`_stunStartTime`ï¼Œä¾›å¼§åº¦è¨ˆç®—ä½¿ç”¨

---

## v0.54.1 - 2026-05-24

### æ–°å¢ž

- **Submit å‰åæ¬¡é è¦½**ï¼ˆ`systems/leaderboard.js`ï¼‰ï¼š
  `showScoreSubmitPopup()` é¢æ¿é–‹å•Ÿæ™‚ç«‹å³ä¸¦è¡ŒæŸ¥è©¢ä¸€èˆ¬æ¦œåæ¬¡èˆ‡æ‰€æœ‰è¶£å‘³æ¦œï¼ˆ`Promise.all`ï¼‰ï¼Œ
  é¡¯ç¤ºã€Œâ³ è¨ˆç®—ä¸­...ã€ï¼›æŸ¥è©¢å®Œæˆå¾Œåœ¨è¼¸å…¥æ¡†ä¸Šæ–¹é¡¯ç¤ºé è¨ˆæŽ’åèˆ‡å‘½ä¸­çš„è¶£å‘³æ¦œ TOP3ï¼›
  æ–·ç·šæ™‚é¡¯ç¤ºé€£ç·šç•°å¸¸æç¤ºï¼›`funCategories` é™£åˆ—é›†ä¸­ç®¡ç†æ‰€æœ‰è¶£å‘³æ¦œæŸ¥è©¢é‚è¼¯ï¼Œ
  æ–°å¢žè¶£å‘³æ¦œåˆ†é¡žæ™‚éœ€åŒæ­¥æ›´æ–°ï¼ˆå·²è¨˜éŒ„è‡³ `MAIN.md`ï¼‰

---

## æ–‡ä»¶ä¿®æ­£ - 2026-05-24ï¼ˆä¸æ›´æ–°ç‰ˆæœ¬è™Ÿï¼‰

### ä¿®å¾©

- **XP Popup é¡¯ç¤ºæ•¸å€¼æœªåæ˜ è®Šç•° XP å€çŽ‡**ï¼ˆ`systems/player.js`ã€`systems/combat.js`ã€`systems/organs.js`ï¼‰ï¼š
  `addXP()` æ”¹ç‚ºå›žå‚³å¯¦éš›åŠ å…¥çš„ XP å€¼ï¼ˆå·²ä¹˜ `mutationXpBonus`ï¼‰ï¼›
  `handleGiantKill`ã€`handleKillerKill`ã€`handleKill`ã€`checkTreasureCollision`ã€`_collectFruit`ã€`handleEliteKill`
  æ‰€æœ‰ `showXPPopup` å‘¼å«é»žçµ±ä¸€æ”¹ç”¨å›žå‚³å€¼ï¼Œç¢ºä¿ popup é¡¯ç¤ºèˆ‡å¯¦éš›ç²å¾— XP ä¸€è‡´ï¼›
  `updateCorpseEating` çš„ `showFloatingText` XP æµ®å‹•æ–‡å­—åŒæ­¥ä¿®æ­£

---

## v0.54.0 - 2026-05-24

### æ–°å¢ž

- **é–ƒç¾è¦–è¦ºç‰¹æ•ˆ**ï¼ˆ`systems/hud.js`ã€`systems/player.js`ï¼‰ï¼š
  é–ƒç¾è§¸ç™¼å¾Œæ’­æ”¾ 150ms ä¸‰æ®µç‰¹æ•ˆï¼šå‡ºç™¼é»žé‡‘è‰²ç…™éœ§ï¼ˆ0~100ms æ“´æ•£æ¶ˆæ•£ï¼‰ã€åˆ°é”é»žç™½è‰²å…‰çƒï¼ˆ50ms~çµæŸ æ¼¸æ·¡ï¼‰ã€Aâ†’B å…‰ç·šæŽƒéŽï¼ˆé ­éƒ¨ t=0â†’1ï¼Œå°¾å·´å»¶é² 0.35 å‡ºç™¼ï¼Œç·šæ€§æ¼¸å±¤ï¼‰
- **é–ƒç¾ç›´ç·šæžœå­å¸æ”¶**ï¼ˆ`systems/player.js`ï¼‰ï¼š
  é–ƒç¾è·¯å¾‘ Aâ†’B ç›´ç·šä¸Šï¼ˆå¯¬åº¦ = radius + pickupRangeï¼‰çš„æžœå­å…¨éƒ¨å¸æ”¶ï¼Œçµ¦äºˆæ­£å¸¸ XPï¼›è¤‡ç”¨ `_collectFruit()` å‡½å¼ï¼Œä¸é‡è¤‡ XP é‚è¼¯
- **ç‰¹æ®ŠæŠ€èƒ½éµå¯è‡ªè¨‚**ï¼ˆ`systems/gameState.js`ã€`systems/ui.js`ã€`systems/input.js`ï¼‰ï¼š
  `DEFAULT_SETTINGS.keys.dash = 'f'`ï¼›è¨­å®šä»‹é¢æŒ‰éµè¨­å®šå€å¡Šæ–°å¢žã€Œç‰¹æ®ŠæŠ€èƒ½éµã€ä¸€æ¬„ï¼ŒçŽ©å®¶å¯ä»»æ„é‡ç¶

### èª¿æ•´

- æå– `_collectFruit(p, fruit)` å‡½å¼ï¼ˆ`systems/player.js`ï¼‰ï¼šåŽŸ `checkFruitCollision` çš„å¸æ”¶é‚è¼¯æ”¹ç”±æ­¤å‡½å¼è™•ç†ï¼Œ`playerDash` ä¹Ÿå…±ç”¨

---

## v0.53.1 - 2026-05-24

### èª¿æ•´

- **æ‰‹æ©Ÿç‰ˆ ðŸ’¨ é–ƒç¾æŒ‰éˆ•ç¸®å°**ï¼ˆ`systems/mobile.js`ï¼‰ï¼šåµæ¸¬ç¯„åœï¼ˆ`_dashZone()`ï¼‰å’Œè¦–è¦ºå°ºå¯¸ç¸®å°ç‚ºåŽŸæ”»æ“Šå€çš„ 50%ï¼Œä¸­å¿ƒé»žä½ç½®ä¸è®Šï¼›æ”»æ“Šå€å®Œå…¨ä¸å—å½±éŸ¿
- **æ¡Œæ©Ÿç‰ˆæŒ‡ç¤ºå™¨ä½ç½®å°æ‡‰æ›´æ–°**ï¼ˆ`systems/hud.js`ï¼‰ï¼š`ðŸ’¨ F` ç¹ªè£½çŸ©å½¢æ”¹ç‚ºç¸®å°å¾Œçš„å°ºå¯¸ï¼ˆ`dashW Ã— dashH`ï¼‰ï¼Œä½ç½®èˆ‡æ‰‹æ©Ÿç›´å‘é–ƒç¾å€å°æ‡‰

---

## v0.53.0 - 2026-05-24

### æ–°å¢ž

- **é–ƒç¾æŠ€èƒ½ï¼ˆðŸ’¨ï¼‰**ï¼ˆ`systems/player.js`ã€`systems/combat.js`ã€`systems/input.js`ã€`systems/mobile.js`ã€`systems/hud.js`ï¼‰ï¼š
  - è§¸ç™¼ï¼šæ¡Œæ©Ÿç‰ˆæŒ‰ `F` éµï¼›æ‰‹æ©Ÿç‰ˆé»žæ“Šæ”»æ“Šå€æ­£ä¸Šæ–¹ ðŸ’¨ æŒ‰éˆ•
  - æ•ˆæžœï¼šçž¬é–“ä½ç§»è‡³æœ€å¾Œç§»å‹•æ–¹å‘ `speed Ã— 50`ï¼ˆæœ€é  500pxï¼‰
  - ç„¡æ•µï¼šè§¸ç™¼å¾Œ **0.5 ç§’** å…§è±å…æ‰€æœ‰å¤–éƒ¨å‚·å®³ï¼ˆ`applyDamageToPlayer` é–‹é ­åˆ¤æ–· `dashInvincible`ï¼‰
  - å†·å»ï¼š**15 ç§’**ï¼ˆ`dashCooldown`ï¼Œæ¯å¹€å›ºå®šéžæ¸›ï¼‰
  - æ–¹å‘é‚è¼¯ï¼šæ‰‹æ©Ÿç‰ˆå„ªå…ˆç”¨æ–æ¡¿æ–¹å‘ï¼ˆ`mobileInput`ï¼‰ï¼›æ¡Œæ©Ÿç‰ˆç”¨ `lastMoveDir`ï¼ˆæœ€å¾Œç§»å‹•æ–¹å‘ï¼Œåˆå§‹æœä¸Šï¼‰
  - `gameState.player` æ–°å¢žæ¬„ä½ï¼š`dashCooldown`ã€`dashInvincible`ã€`dashInvincibleEnd`ã€`lastMoveDir`
  - æ¡Œæ©Ÿç‰ˆå³ä¸‹è§’ç¹ªè£½å†·å»æŒ‡ç¤ºå™¨ï¼ˆ`ðŸ’¨ F`ï¼‰ï¼Œå†·å»ä¸­é¡¯ç¤ºç°è‰²é€²åº¦æ¢ + å€’æ•¸ç§’æ•¸
  - æ‰‹æ©Ÿç‰ˆ `_dashZone()` å®šç¾©æŒ‰éˆ•çŸ©å½¢ï¼›å†·å»ä¸­é¡¯ç¤ºç°è‰²é€²åº¦æ¢ + å€’æ•¸ç§’æ•¸
- **èªžè¨€åŒ…æ–°å¢ž** `dashSkill` / `dashCooldownLabel` éµå€¼ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰

---

## v0.52.0 - 2026-05-24

### æ–°å¢ž

- **å¤§ç™½é¯Šè¡åˆºç®­é ­é‡è¨­è¨ˆ**ï¼ˆ`systems/boss.js`ï¼‰ï¼šè­¦å‘Š 600ms é¡¯ç¤ºé»ƒè‰²é–ƒçˆç®­é ­ï¼Œå¯¬åº¦ï¼Boss ç›´å¾‘ï¼Œ**é•·åº¦ç¾åœ¨å°æ‡‰å¯¦éš›è¡åˆºè·é›¢**ï¼ˆ`speedÃ—4Ã—0.8Ã—60px`ï¼‰è€Œéž Boss åˆ°çŽ©å®¶çš„ç›´ç·šè·é›¢ï¼›è¡åˆºæœŸé–“æ”¹ç‚ºç´…è‰²ï¼›æ–¹å‘åœ¨ warning çž¬é–“éŽ–å®š
- **è çŽ‹æ¯’éœ§æ”¹ç‚ºå®šé»žæŠ•æ“²**ï¼ˆ`systems/boss.js`ï¼‰ï¼šæ¯5ç§’éŽ–å®šçŽ©å®¶**ç•¶å‰ä½ç½®**æŠ•æ“²æ¯’æ¶²ï¼Œ600ms é»ƒè‰²è™›ç·šåœ“åœˆè­¦å‘Šå¾Œåœ¨ç›®æ¨™ä½ç½®ç”Ÿæˆç¶ è‰²æ¯’éœ§ï¼ˆåŠå¾‘ 150pxï¼ŒæŒçºŒ 4 ç§’ï¼Œæ¯ç§’å‚·å®³ `boss.damageÃ—0.3`ï¼‰ï¼›çŽ©å®¶å¯è·‘å‡ºç¯„åœå®Œå…¨èº²é–‹ï¼›å¤šå€‹æ¯’éœ§å¯åŒæ™‚å­˜åœ¨ï¼ˆ`gameState.venomPuddles[]`ï¼‰ï¼›è§¸ç™¼ä¸å†éœ€è¦é è¿‘ Bossï¼Œè§£æ±ºçŽ©å®¶ç„¡æ³•è¿‘æˆ°çš„å•é¡Œ
- **è çŽ‹æ²™æš´é™å®šæ²™æ¼ ç”Ÿæ…‹å€**ï¼ˆ`systems/boss.js`ï¼‰ï¼šçŽ©å®¶é›¢é–‹æ²™æ¼ ç”Ÿæ…‹å€æ™‚ç«‹å³è§£é™¤ç§»é€Ÿ -40% å’Œèž¢å¹•é®ç½©æ•ˆæžœï¼Œè·‘å‡ºæ²™æ¼ å³å¯è„«é›¢æ²™æš´
- **é»‘ç†Šæš´æ“Šæµ®å‹•æ–‡å­—ä½ç½®ä¿®æ­£**ï¼ˆ`systems/boss.js`ï¼‰ï¼šã€ŒXç†Šçˆªï¼ã€æ–‡å­—æ”¹é¡¯ç¤ºåœ¨çŽ©å®¶ä½ç½®ï¼ˆåŽŸæœ¬åœ¨ Boss é ­ä¸Šï¼‰

### èª¿æ•´

- è çŽ‹æ¯’éœ§è§¸ç™¼æ¢ä»¶å¾žã€ŒçŽ©å®¶åœ¨ 300px å…§æ‰è§¸ç™¼ã€æ”¹ç‚ºã€Œæ¯5ç§’ç„¡è·é›¢é™åˆ¶æŠ•æ“²ã€ï¼Œè§£æ±ºçŽ©å®¶å› æ‹‰é–‹è·é›¢è€Œæ¯’éœ§æ°¸ä¸è§¸ç™¼çš„å•é¡Œ

---

## v0.51.0 - 2026-05-24

### ä¿®å¾©

- **éŠæˆ²å¡æ­»ï¼ˆè² æ•¸ radiusï¼‰**ï¼ˆ`systems/organs.js`ã€`systems/evolution.js`ã€`systems/hud.js`ï¼‰ï¼š
  `applyOrganEffects` / `applyHiddenOrganEffects` çš„ `radiusAdd` åŠ å…¥ `Math.max(5, ...)` ä¿è­·ï¼Œ
  åŒæ™‚ç¢ºä¿ `rangeIncrease` è¨ˆç®—ä½¿ç”¨ `Math.max(p.radius, 1)` é¿å…é™¤ä»¥é›¶ï¼›
  `applyEvolutionLevelEffect` / `applyEvolutionEffects` åŒæ¨£åŠ å…¥ä¸‹é™ä¿è­·ï¼›
  `drawGame` ç¹ªè£½çŽ©å®¶å‰åŠ å…¥ `const drawRadius = Math.max(1, p.radius)` é˜²å‘†ï¼Œ
  ç¢ºä¿ `ctx.arc()` æ°¸é ä¸æœƒæ”¶åˆ°è² æ•¸æˆ–é›¶ radius
- **initializeGame å†ä¾†ä¸€å±€æ®˜ç•™èˆŠè³‡æ–™**ï¼ˆ`main.js`ï¼‰ï¼š
  è£œé½Š `fruits`ã€`corpses`ã€`bones`ã€`treasures`ã€`brainShockwaves`
  äº”å€‹é™£åˆ—çš„æ¸…ç©ºé‡ç½®ï¼Œé¿å…å¤šå±€ç´¯ç©å°Žè‡´ç•°å¸¸
- **Alpha æ­»äº¡æ¸…é™¤è·¯å¾‘è£œé½Š**ï¼ˆ`systems/creatures.js`ã€`systems/combat.js`ï¼‰ï¼š
  ç¢ºèªä¸¦è£œé½Šå››æ¢æ­»äº¡è·¯å¾‘ï¼ˆ`handleGiantKill`ã€æ¯’å‚·/æµè¡€ã€
  `updateNeutralCreatures`ã€`updateHostileCreatures`ï¼‰å…¨éƒ¨æ­£ç¢ºæ¸…é™¤
  `gameState.alphaCreature = null`
- **æ®ºæ‰‹ 100% è¿´é¿å·¨äºº**ï¼ˆ`systems/creatures.js`ï¼‰ï¼š
  `_shouldFleeFromGiant` å°æ®ºæ‰‹åŒ–ç”Ÿç‰©ç›´æŽ¥è¿”å›ž `false`ï¼›
  æ–°å¢žæ®ºæ‰‹æˆ°è¡“é‚è¼¯ï¼šæ­£å¸¸æ”»æ“Šå·¨äººï¼Œè‡ªèº«è¡€é‡ < 70% ä¸”å·¨äººè¡€é‡ > 70%
  æ™‚å„ªå…ˆè½‰ç§»æ”»æ“Šè½å–®è‰é£Ÿæ€§ï¼Œæ‰¾ä¸åˆ°æ‰æš«æ™‚æ’¤é€€
- **è®Šç•°å™¨å®˜æ–‡æœ¬æœªé¡¯ç¤ºå¯¦éš›æ•¸å€¼**ï¼ˆ`systems/mutation.js`ï¼‰ï¼š
  é¢æ¿å››å€‹å™¨å®˜æè¿°æ”¹ç‚ºå‹•æ…‹è®€å–å¯¦éš›å€çŽ‡ï¼Œ
  é¡¯ç¤ºã€Œç•¶å‰ +N%ï¼ˆLv.Nï¼Œæ¯ç´š +1%ï¼‰ã€æ ¼å¼ï¼›ç­‰ç´šç‚º 0 æ™‚é¡¯ç¤ºå°šæœªè§£éŽ–æç¤º

### æ–°å¢ž

- **è¶£å‘³æŽ’è¡Œæ¦œã€ŒðŸ‘‘ æœ€é«˜ç­‰ç´šã€åˆ†é¡ž**ï¼ˆ`config/supabase.js`ã€`systems/leaderboard.js`ï¼‰ï¼š
  æ–°å¢ž `fetchFunMaxLevel()` æŸ¥è©¢ `level` æ¬„ä½æœ€é«˜å€¼ï¼ŒTOP10 é¡¯ç¤ºæ ¼å¼ `Lv.N`

---

## v0.50.0 - 2026-05-24

### æ–°å¢ž

- **å¤§ç™½é¯Šè¡åˆºè­¦å‘Šç®­é ­**ï¼ˆ`systems/boss.js`ï¼‰ï¼šè­¦å‘Š 600ms é¡¯ç¤ºé»ƒè‰²é–ƒçˆç®­é ­ï¼ˆå¯¬åº¦ï¼Boss ç›´å¾‘ï¼‰ï¼Œè¡åˆº 800ms æ”¹ç‚ºç´…è‰²å¯¦å¿ƒç®­é ­ï¼›ç®­é ­å¾ž Boss èµ·é»žæŒ‡å‘éŽ–å®šçš„çŽ©å®¶ä½ç½®ï¼ˆé€²å…¥ warning çž¬é–“è¨˜éŒ„ï¼‰ï¼ŒçŽ©å®¶å¯åœ¨è­¦å‘ŠæœŸé–“å´ç§»èº²é–‹è¡åˆºå‚·å®³
- **è çŽ‹æ¯’éœ§è¦–è¦ºç‰¹æ•ˆ**ï¼ˆ`systems/boss.js`ï¼‰ï¼šæ¯’éœ§ä»¥ç¶ è‰²åŠé€æ˜Žåœ“å½¢å¾ž Boss å‘å¤–æ“´æ•£è‡³ 300pxï¼ŒæŒçºŒ 4 ç§’ï¼Œé€æ˜Žåº¦éš¨æ™‚é–“æ¼¸æ·¡ï¼›æ¯’å‚·åˆ¤å®šæ”¹ç‚ºå‹•æ…‹åŠå¾‘ï¼ŒçŽ©å®¶è·‘å‡ºæ“´æ•£åœ“ç¯„åœå¯å®Œå…¨èº²é–‹å‚·å®³
- **è çŽ‹æ²™æš´èž¢å¹•é®ç½©**ï¼ˆ`systems/boss.js`ã€`systems/hud.js`ï¼‰ï¼šæ²™æš´è§¸ç™¼æ™‚èž¢å¹•å¤–åœˆ 30% è¢«æ²™è‰²åŠé€æ˜Ž radialGradient è¦†è“‹ï¼ˆalpha æœ€é«˜ 0.3ï¼‰ï¼ŒæŒçºŒ 6 ç§’ï¼Œæ·¡å…¥æ·¡å‡ºå„ 500msï¼›ç´”è¦–è¦ºæ•ˆæžœ
- **é»‘ç†Šæš´æ“Šæµ®å‹•æ–‡å­—**ï¼ˆ`systems/boss.js`ï¼‰ï¼š25% æš´æ“Šå‘½ä¸­çŽ©å®¶æ™‚é¡¯ç¤ºæ©™è‰²æµ®å‹•æ–‡å­—ã€ŒXç†Šçˆªï¼ã€

---

## v0.49.0 - 2026-05-23

### æ–°å¢ž

- **é»‘ç†Š Boss å‹•ç•«é‡è£½**ï¼ˆ`systems/boss.js`ï¼‰ï¼š
  - æ‰‹è‡‚ä¸‰ç‹€æ…‹å‹•ç•«ï¼šé–’ç½®åž‚ä¸‹ / è¿½æ“Šé«˜èˆ‰ï¼ˆé›™è‡‚å¤–å±•è‡³ Â±69Â°ï¼Œå»¶ä¼¸å‡ºèº«é«”æ©¢åœ“å¤–å´å¯è¦‹ï¼‰ / æ”»æ“Šæ©«æŽƒ
  - æ™®æ”»ä¾è¸æ­¥è…³åˆ¤æ–·æ®ç è‡‚ï¼ˆå·¦è…³è¸©åœ°â†’å³è‡‚"/"æŽƒï¼›å³è…³è¸©åœ°â†’å·¦è‡‚"\"æŽƒï¼‰ï¼›25% æ©ŸçŽ‡æš´æ“Šâ†’é›™è‡‚åŒæ™‚æ®ç å½¢æˆ"X"
  - æ”»æ“Šæ®˜å½±ï¼šæ®ç è‡‚å‰ç¹ªè£½ 2 å±¤åŠé€æ˜ŽèˆŠä½ç½®ï¼ˆalpha 0.10 / 0.22ï¼‰ï¼Œå¼·åŒ–é«˜é€Ÿæ„Ÿ
  - çˆªç—•ç‰¹æ•ˆï¼šæ”»æ“Š 450ms å…§ç¹ªè£½æ·±ç´…ï¼ˆæ™®æ”»ï¼‰æˆ–æ©™ç´…ï¼ˆæš´æ“Šï¼‰æ¼¸é•·æ–œç·šï¼Œç¢ºä¿ç„¡è«–æ‰‹è‡‚ä½ç½®å‡æ¸…æ™°å¯è¦‹
  - è¸æ­¥é€Ÿåº¦é€£å‹•ï¼šè¿½æ“Šæ™‚ period ç¸®çŸ­ï¼ˆÃ—1.9ï¼‰ï¼Œå¥”è·‘æ„Ÿæ›´å¼·
- **å¤§ç™½é¯Š Boss é¢å‘ç¿»è½‰**ï¼ˆ`systems/boss.js`ï¼‰ï¼šä»¥ `player.x < boss.x` åˆ¤æ–·æ–¹å‘ï¼Œ`ctx.scale(-1,1)` è®“é ­éƒ¨æ°¸é æœå‘çŽ©å®¶ï¼Œä¸ä¾è³´ moveAngle
- **è çŽ‹ä¸‰è…³æ­¥æ³•**ï¼ˆ`systems/boss.js`ï¼‰ï¼š6 æ¢è…¿é‡æ–°è¨­è¨ˆç‚º Tripod Gaitï¼ˆç¾¤ A/B äº¤æ›¿ï¼Œçµ„å…§ 10% ç›¸ä½å·®ï¼‰ï¼Œè…¿å‹•ç•«æ”¹ç‚ºæœ«ç«¯ y ä½ç§»ï¼ˆæŠ¬è…³ç´°ç·š/è½åœ°ç²—ç·šï¼‰ï¼Œå¤¾é‰—éœæ­¢å¾…æ©Ÿã€æ”»æ“Šå¾Œ 700ms å…§å¼§ç·šå‘å…§å¤¾ï¼ˆæœ€å¤§ 37Â°ï¼‰
- **å‹•ç•«å¯¦ä½œæŒ‡å—**ï¼ˆ`docs/ANIMATION_GUIDE.md`ï¼‰ï¼šå®Œæ•´è¨˜éŒ„è¸æ­¥ã€é¢å‘ç¿»è½‰ã€ä¸‰è…³æ­¥æ³•ã€æ”»æ“Šè¨ˆæ™‚åŽŸç†ã€çˆªç—•ç‰¹æ•ˆã€æ®˜å½±ã€çœ¼ç›è„ˆå‹•åƒæ•¸ï¼Œå«å¯è¤‡è£½çš„æ¨£æ¿ç¨‹å¼ç¢¼ä¾›ç²¾è‹±æ€ª / æ™®é€šç”Ÿç‰©ä½¿ç”¨

### ä¿®å¾©

- **é»‘ç†Šæ‰‹è‡‚å®Œå…¨ä¸å¯è¦‹**ï¼šåŽŸå› ç‚º `BOSS_COLORS.bear.limbs` èˆ‡ `body` é¡è‰²ç›¸åŒï¼ˆå‡ç‚º `#2a1808`ï¼‰ï¼Œä¸”æ‰‹è‡‚æ©¢åœ“ä½ç½®è½åœ¨ rx=rÃ—1.2 çš„è¶…å¯¬èº«é«”æ©¢åœ“å…§éƒ¨ã€‚ä¿®æ­£ï¼š`limbs` æ”¹ç‚º `#7a3d0c`ï¼ˆæ˜Žé¡¯è¼ƒæ·ºï¼‰ï¼Œè¿½æ“Šæ™‚æ‰‹è‡‚è§’åº¦èª¿æ•´ç‚º Â±1.20 rad ä½¿è‡‚ä¸­å¿ƒè½åœ¨èº«é«”å¤–å´

---

## v0.48.0 - 2026-05-23

### æ–°å¢ž

- **ç”Ÿç‰©è¦–è¦ºå·®ç•°åŒ–**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šå…­ç¨®ç”Ÿæ…‹ç”Ÿç‰©å„æœ‰ç¨ç«‹å¹¾ä½•å½¢ç‹€ï¼Œmoose/beetle/croc å®Œæ•´æ—‹è½‰ï¼ˆè·Ÿéš¨ `_moveAngle`ï¼‰ï¼Œcamel/lynx åªå·¦å³ç¿»è½‰ï¼ˆ`ctx.scale(-1,1)`ï¼‰ï¼Œhyena æ°¸é æœä¸Šä¸æ—‹è½‰
- **ç”Ÿç‰©é¡è‰²å›ºå®š**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šæ–°å¢ž `CREATURE_COLORS` å¸¸æ•¸ï¼Œå„ç‰©ç¨®ä½¿ç”¨å›ºå®šè¾¨è­˜è‰²ï¼ˆé§é¹¿æ·±æ£• `#8B4513`ã€ç”²èŸ²é’ç¶  `#1ABC9C`ã€é§±é§æ·ºæ²™ `#E8C87A`ã€çŒžçŒç°è¤ `#A0826D`ã€é±·é­šæ©„æ¬–ç¶  `#6B8E23`ã€é¬£ç‹—æ·±å’– `#8B6914`ï¼‰
- **ç‰¹æ®Šç‹€æ…‹å…‰æšˆ**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šAlpha é‡‘è‰²ã€å·¨äººåŒ–æ©™è‰²ã€æ®ºæ‰‹åŒ–ä¾ killerLevel æ¼¸å±¤æ·±ç´…ï¼›å…‰æšˆä»¥ä¸–ç•Œåº§æ¨™ç¹ªè£½ï¼Œä¸è·Ÿæ—‹è½‰
- **ç¹ªåœ–è¦æ ¼æ–‡ä»¶**ï¼ˆ`docs/creature_shapes.md`ï¼‰ï¼šè¨˜éŒ„æ‰€æœ‰ç‰©ç¨®æ—‹è½‰æ¨¡å¼ã€é¡è‰²å¸¸æ•¸ã€å½¢ç‹€å‡½å¼å®Œæ•´ç¨‹å¼ç¢¼èˆ‡è¨­è¨ˆå‚™æ³¨

### ä¿®å¾©

- **è¿½æ“Šç‹€æ…‹ä¸‹ `_moveAngle` æœªæ›´æ–°**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šaggressive è¿½æ“Šã€giant è¿½æ“Šã€biome fleeã€éž biome flee/è·Ÿéš¨æžœå­ã€hostile ä¸»è¿½æ“Šç­‰ 6 è™•ç§»å‹•é‚è¼¯å‡è£œä¸Š `creature._moveAngle = angle`ï¼Œç¢ºä¿æ—‹è½‰æ–¹å‘å³æ™‚æ­£ç¢º

---

## åŠŸèƒ½æ–°å¢ž - 2026-05-23ï¼ˆä¸æ›´æ–°ç‰ˆæœ¬è™Ÿï¼‰

### æ–°å¢ž

- **è¶£å‘³æŽ’è¡Œæ¦œæ–°å¢žã€Œâš”ï¸ æœ€å¿«æ“Šæ®ºBossã€åˆ†é¡ž**ï¼ˆ`config/supabase.js`ã€`systems/leaderboard.js`ï¼‰ï¼šå¼•ç”¨ç¾æœ‰ `boss_kill_time` æ¬„ä½ï¼ˆBoss å‡ºç¾åˆ°è¢«æ“Šæ®ºçš„ç§’æ•¸ï¼‰ï¼ŒæŽ’åº asc è¶Šå°è¶Šå¿«ï¼›åªé¡¯ç¤ºå‹åˆ©è¨˜éŒ„ï¼ˆ`is_victory=true`ï¼‰

---

## æ–‡ä»¶ä¿®æ­£ - 2026-05-23ï¼ˆä¸æ›´æ–°ç‰ˆæœ¬è™Ÿï¼‰

### ä¿®å¾©

- **è¶£å‘³æŽ’è¡Œæ¦œæœ€é€Ÿé€šé—œæ¬„ä½å¼•ç”¨éŒ¯èª¤**ï¼ˆ`config/supabase.js`ã€`systems/leaderboard.js`ï¼‰ï¼š`fetchFunSpeedVictory` æŸ¥è©¢æ¬„ä½å¾ž `boss_kill_time` æ”¹ç‚º `play_time`ï¼Œé¡¯ç¤ºæ¬„ä½æ¨™ç±¤åŒæ­¥æ›´æ–°ç‚ºã€ŒéŠçŽ©æ™‚é–“(ç§’)ã€ï¼›èˆŠè³‡æ–™ä¸å—å½±éŸ¿ï¼Œç›´æŽ¥å¼•ç”¨æ­£ç¢ºæ¬„ä½å³å¯

---

## v0.47.1 - 2026-05-23

### ä¿®å¾©

- **å…¬å‘Šç´…é»žæœªåŠæ™‚æ¶ˆé™¤**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`showPatchNotes()` æ”¹ç‚ºå»ºç«‹ `readInSession` Set è¿½è¹¤æœ¬æ¬¡å·²è®€çš„ç‰ˆæœ¬ Tabï¼Œä¸å†åœ¨é¢æ¿é–‹å•Ÿæ™‚ç«‹å³å¯«å…¥ `lastSeenPatchVersion`ï¼›æ‰€æœ‰æ¯” `lastSeenPatchVersion` æ–°çš„ç‰ˆæœ¬ Tab éƒ½é»žé–‹å¾Œæ‰æ¶ˆé™¤ç´…é»žä¸¦æ›´æ–° localStorageï¼Œå¾¹åº•è§£æ±ºæ®˜ç•™å•é¡Œ

### èª¿æ•´

- **é€²åŒ–åœ–é‘‘æ”¹ç‚ºå›ºå®šå€¼å‹•æ…‹æè¿°**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ–°å¢žå…¨åŸŸå‡½å¼ `buildEvoLevelDesc(pathId, upToLevel)`ï¼Œå¾ž `config/evolution.js` çš„ `effects` å‹•æ…‹è¨ˆç®—ç´¯è¨ˆå€¼ï¼ˆè‰é£Ÿæ€§ HP/æžœå­XP/é«”åž‹ç´¯è¨ˆï¼Œé›œé£Ÿæ€§é€Ÿåº¦ç´¯è¨ˆï¼›è‚‰é£Ÿæ€§æ”»æ“Šå’Œé›œé£Ÿæ€§ç™½éª¨ç´ ç‚ºå›ºå®šå€¼ï¼‰ï¼Œåœ–é‘‘æ•¸å€¼è‡ªå‹•èˆ‡ config åŒæ­¥ï¼Œä¸å†æ‰‹å¯«å›ºå®šæ–‡å­—

### æ–°å¢ž

- **åœ–é‘‘ Boss ä»‹ç´¹é **ï¼ˆ`systems/ui.js`ï¼‰ï¼šåœ–é‘‘éŠæˆ²èªªæ˜Žåˆ†é æ–°å¢žã€ŒBoss åœ–é‘‘ã€é ï¼Œå‹•æ…‹å¼•ç”¨ `EASY_MAP`/`NORMAL_MAP` bosses æ•¸å€¼ï¼Œé¡¯ç¤ºç°¡å–®/æ™®é€šå…©å¥— HP/é€Ÿåº¦/å‚·å®³ã€æ™®é€šé›£åº¦æŠ€èƒ½èªªæ˜Žï¼ˆé»‘ç†Šç‹‚æš´åŒ–/å¤§ç™½é¯Šè¡é‹’æ’•å’¬/è çŽ‹æ¯’éœ§ï¼‰ã€é€šç”¨å›žè¡€èªªæ˜Žã€å¼±é»žæç¤º
- **åœ–é‘‘é›£åº¦ä»‹ç´¹é **ï¼ˆ`systems/ui.js`ï¼‰ï¼šåœ–é‘‘éŠæˆ²èªªæ˜Žåˆ†é æ–°å¢žã€Œé›£åº¦ä»‹ç´¹ã€é ï¼Œå‹•æ…‹å¼•ç”¨ `EASY_MAP`/`NORMAL_MAP` configï¼Œé¡¯ç¤ºç”Ÿç‰©å¼·åº¦å€çŽ‡ã€ç²¾è‹±/Boss çŽå‹µã€ç‰¹æ®Šæ©Ÿåˆ¶é–‹é—œï¼ˆå·¨äººåŒ–/æ®ºæ‰‹åŒ–/ç²¾è‹±å›žè¡€/Boss å›žè¡€ï¼‰ï¼Œå…¼é¡§ç¡¬æ ¸èˆ‡ä¼‘é–’çŽ©å®¶èªªæ˜Žé¢¨æ ¼

---

## v0.47.0 - 2026-05-23

### ä¿®æ­£ï¼ˆBug Fixï¼‰
- **B1ï¼šå†ä¾†ä¸€å±€ä¿ç•™é›£åº¦** â€” `showMapSelect()` é¸å®Œé›£åº¦å¾Œå­˜å…¥ `localStorage('lastDifficulty')`ï¼›`initializeGame()` è‹¥ `currentMap` ç‚º nullï¼ˆé é¢é‡æ•´å¾Œï¼‰å¾ž localStorage æ¢å¾©é›£åº¦èˆ‡åœ°åœ–ç‰©ä»¶
- **B8ï¼šæŠ€èƒ½æ¨¹é˜²å‘†** â€” `buildSkillTreeOverlay()` å…¥å£åŠ å…¥ `if (!gameState.player || !gameState.playerSkills) return;` é˜²æ­¢ç©ºç™½ç•«é¢

### èª¿æ•´
- **æ”»é€Ÿå…¬å¼æ”¹ç‚ºåŠ æ³•**ï¼ˆ`systems/combat.js`ã€`systems/organs.js`ã€`systems/evolution.js`ã€`config/organs.js`ï¼‰ï¼š
  - æ–°å…¬å¼ `interval = 1000ms / (1 + totalBonus)`ï¼›çŽ©å®¶æ–°å¢ž `attackSpeedBonus: 0` æ¬„ä½ç´¯ç©åŠ æ³•åŠ æˆ
  - `boxingGloves` effects æ”¹ç‚º `attackSpeedBonus: 0.10/0.15/0.15`ï¼ˆåŽŸç‚ºä¹˜æ³• `attackSpeedMult`ï¼‰
  - è‚‰é£Ÿæ€§é€²åŒ– `attackSpeedBonus` ç´¯ç©è‡³ `p.attackSpeedBonus`ï¼ˆåŽŸç‚º `p.attackSpeed *=`ï¼‰
- **æ€ªç‰©å‘½ä¸­åˆ¤å®šæ“´å¤§**ï¼ˆ`systems/combat.js`ï¼‰ï¼šæ”»æ“Šå‘½ä¸­æ¢ä»¶æ”¹ç‚º `distance < attackRange + radius * 0.5`ï¼Œå¤§åž‹æ•µäººæ›´æ˜“è¢«æ“Šä¸­
- **ç²¾è‹±çŽå‹µèª¿æ•´**ï¼ˆ`systems/organs.js`ï¼‰ï¼šå¤œæ™šæŠ€èƒ½é»ž `[1, 1, 2]`ï¼ˆåŽŸç‚º `Math.round((phase+1)/2)`ï¼Œå³ 1/2/3ï¼‰
- **Boss çŽå‹µèª¿æ•´**ï¼ˆ`systems/boss.js`ï¼‰ï¼šæ“Šæ®º Boss çŽå‹µ +3 æŠ€èƒ½é»žï¼ˆåŽŸ +5ï¼‰
- **ç”Ÿæ…‹ Emoji å‰ç¶´**ï¼ˆ`config/creatures.js`ã€`map/normalmap.js`ã€`map/easymap.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼š
  - æ‰€æœ‰ç”Ÿç‰©åç¨±åŠ å…¥ ðŸŒ¿ï¼ˆæ£®æž—ï¼‰ðŸŒŠï¼ˆæµ·æ´‹ï¼‰ðŸœï¸ï¼ˆæ²™æ¼ ï¼‰å‰ç¶´
  - Boss åç¨±åŒæ­¥æ›´æ–°ï¼Œæ¯’å‚·å…ç–«åˆ¤æ–·æ”¹ç‚º `c.name.includes('è çŽ‹')`

### æ–°å¢ž
- **æ™®é€š Boss å¹³è¡¡æ”¹ç‰ˆ**ï¼ˆ`systems/boss.js`ã€`map/normalmap.js`ï¼‰ï¼š
  - æ™®é€šé›£åº¦ Boss é€Ÿåº¦ç¿»å€ï¼ˆé»‘ç†Š 9.0ã€å¤§ç™½é¯Š 11.7ã€è çŽ‹ 10.8ï¼‰
  - é€šç”¨å›žè¡€ï¼šæ¯ 3 ç§’å›žå¾©æœ€å¤§HP 2%ï¼ˆåŽŸ 10 ç§’ 10%ï¼‰
  - é»‘ç†Šï¼š<40% HP è§¸ç™¼ç‹‚æš´ï¼ˆé€Ÿåº¦Ã—1.5ã€å‚·å®³Ã—1.3ã€ç™¼å…‰æç¤ºï¼‰
  - å¤§ç™½é¯Šï¼šæ¯ 4 ç§’å° 500px å…§çŽ©å®¶ç™¼å‹•è¡åˆºæ”»æ“Šï¼ˆ0.6 ç§’è­¦å‘Š â†’ 0.8 ç§’è¡åˆºï¼Œé€ æˆ 1.5 å€å‚·å®³ï¼‰
  - æ²™æ¼ è çŽ‹ï¼šæ¯ 5 ç§’åœ¨ 300px å…§é‡‹æ”¾æ¯’éœ§ï¼ˆ4 ç§’æ¯ç§’æ¯’å‚·ï¼‰ï¼›<40% HP è§¸ç™¼æ²™æš´ï¼ˆçŽ©å®¶ç§»é€Ÿ -40% æŒçºŒ 6 ç§’ï¼‰
  - ç°¡å–®æ¨¡å¼ Boss æ–°å¢ž radius/attackRange æ¬„ä½
- **è®Šç•°å™¨å®˜ UI æ”¹ç‰ˆ**ï¼ˆ`systems/hud.js`ã€`index.html`ï¼‰ï¼š
  - æ–‡å­—æ”¹ç‚ºã€Œè®Šç•°å™¨å®˜ âš—ï¸ Lv.Xã€
  - æœ‰å¯å‡ç´šé»žæ•¸æ™‚ `#mutation-icon-row` å¥—ç”¨ `mutation-pulse` CSS å‹•ç•«ï¼ˆ0.8s å½ˆè·³ï¼‰
- **å°åœ°åœ–é›£åº¦æ¨™ç±¤**ï¼ˆ`systems/hud.js`ã€`index.html`ï¼‰ï¼šå°åœ°åœ–ä¸‹æ–¹æ–°å¢ž `#minimap-difficulty` é¡¯ç¤º `âš”ï¸ æ™®é€š`/`ðŸŒ¿ ç°¡å–®`
- **è¶£å‘³æŽ’è¡Œæ¦œ**ï¼ˆ`systems/leaderboard.js`ã€`config/supabase.js`ã€`systems/gameState.js`ã€`systems/combat.js`ï¼‰ï¼š
  - æ–°å¢ž 5 ç¨®è¶£å‘³çµ±è¨ˆï¼šðŸƒæœ€é€Ÿé€šé—œ / ðŸ’€æœ€é€Ÿæ­»äº¡ / ðŸ‘¾å·¨äººçµäºº / ðŸ”ªæ®ºæ‰‹çµäºº / â­æ®ºæ‰‹å…‹æ˜Ÿ
  - å…¨å±æŽ’è¡Œæ¦œæ–°å¢žã€ŒðŸŽ² ç¨®é¡žã€åˆ‡æ›æŒ‰éˆ•
  - æ–°å¢ž Supabase æŸ¥è©¢å‡½å¼ï¼š`fetchFunSpeedVictory/Death/GiantKills/KillerKills/KillerMaxLevel`
  - `sessionStats.giantKills/killerKills/killerMaxLevel` å³æ™‚è¿½è¹¤ï¼›`submitScore()` è‡ªå‹•å¸¶å…¥
- **Alpha å°åœ°åœ–æ¨™è¨˜**ï¼ˆ`systems/hud.js`ï¼‰ï¼šAlpha æ€ªåœ¨å°åœ°åœ–ä¸Šé¡¯ç¤ºé‡‘è‰²é–ƒçˆåœ“é»ž + Î± æ–‡å­—
- **éšŠä¼æ»¿å“¡æ“´å¼µ**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šå·¨äººåŒ–éšŠä¼é” 8 äººæ™‚ï¼Œæžœå­æœç´¢åŠå¾‘å¾ž 800px æ“´å±•è‡³ 2000px
- **è®Šç•°å•†åº—æŠ€èƒ½é»žå…Œæ›**ï¼ˆ`systems/mutation.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼š
  - è®Šç•°é¢æ¿ä¸‹æ–¹æ–°å¢žã€Œ100 æŠ€èƒ½é»ž â†’ 10 è®Šç•°é»žã€å…Œæ›æŒ‰éˆ•
  - æ–°å¢žèªžè¨€ keyï¼š`mutationExchange`ã€`mutationExchangeHint`
- **å…¬å‘Šç´…é»ž**ï¼ˆ`systems/ui.js`ï¼‰ï¼šé¦–é å…¬å‘ŠæŒ‰éˆ•æœ‰æœªè®€ç‰ˆæœ¬æ™‚é¡¯ç¤ºç´…é»žï¼›é–‹å•Ÿå…¬å‘Šå¾Œæ¶ˆå¤±
- **æ²™æš´çŽ©å®¶æ¸›é€Ÿ**ï¼ˆ`systems/player.js`ï¼‰ï¼šè çŽ‹æ²™æš´æœŸé–“çŽ©å®¶ç§»é€Ÿ -40%ï¼ˆ`p._inSandstorm` æ——æ¨™ï¼‰
- **èªžè¨€æ–°å¢ž**ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼š`venomFloat`ï¼ˆæ¯’éœ§æµ®å‹•æ–‡å­—ï¼‰

---

## v0.46.0 - 2026-05-22

### æ–°å¢ž

- **ç”Ÿæ…‹ç‰¹æ€§ç³»çµ±**ï¼ˆ`systems/creatures.js`ã€`systems/player.js`ã€`systems/spawning.js`ï¼‰ï¼š
  - **çŒžçŒï¼ˆæ£®æž—ï¼‰**ï¼šåœ¨æ£®æž—å…§ 50% æš´æ“Šæ©ŸçŽ‡ï¼ˆÃ—2 baseDmgï¼Œå°çŽ©å®¶æ–½åŠ  -30% é€Ÿåº¦ 3 ç§’ï¼‰ï¼›é›¢é–‹æ£®æž— â‰¥3 ç§’å¾Œé™ç‚º 25% / Ã—1.5 / -15% 1.5 ç§’ï¼›ç§»å‹•é€Ÿåº¦æ£®æž—å…§ Ã—1.2
  - **é±·é­šï¼ˆæ°´æ½­ï¼‰**ï¼šæ°´æ½­å…§æ”»æ“Š Ã—1.2ã€ç§»å‹• Ã—1.3ã€20% æ©ŸçŽ‡è§¸ç™¼ã€Œæ­»äº¡ç¿»æ»¾ã€ï¼ˆå°çŽ©å®¶æ–½åŠ  1 ç§’æšˆçœ©ï¼Œ`p._stunUntil`ï¼‰ï¼›é›¢æ°´æ½­å¾ŒåŠ æˆæ­¸é›¶
  - **é¬£ç‹—ï¼ˆæ²™æ¼ ï¼‰**ï¼šç”Ÿæˆæ™‚éš¨æ©Ÿåˆ†é… packGroupï¼ˆ1~3ï¼‰ï¼›æ¯ 2 ç§’æŽƒæåŒçµ„å­˜æ´» packMatesï¼ˆ600px å…§ï¼‰ï¼›æ¯éš» packMate +20% æ”»æ“Šã€+5% é€Ÿåº¦ï¼›éŽ–å®šç›®æ¨™æ™‚è­¦å ±åŒçµ„å‡ºå‹•ï¼ˆ`_alertHyenaPack`ï¼‰ï¼›é›¢æ²™æ¼  â‰¥3 ç§’æ”»æ“Š/é€Ÿåº¦å‡ Ã—0.5
  - **çŽ©å®¶æšˆçœ©**ï¼š`updatePlayerMovement()` åŠ å…¥ `p._stunUntil` åˆ¤æ–·ï¼Œæšˆçœ©æœŸé–“ç„¡æ³•ç§»å‹•
  - **çŽ©å®¶æ¸›é€Ÿ**ï¼š`updatePlayerMovement()` åŠ å…¥ `p._lynxSlowUntil` / `p._lynxSlowAmt` æ¸›é€Ÿæ•ˆæžœ
  - **è‚‰é£Ÿè€…é€ƒé›¢å·¨äºº**ï¼ˆ`_shouldFleeFromGiant`ï¼‰ï¼šç›®æ¨™ç‚º Alpha ä¸€å¾‹é€ƒï¼›æ™®é€šå·¨äºº HP > è‚‰é£Ÿè€… HPÃ—3 â†’ é€ƒï¼›`fleeing_giant` ç‹€æ…‹æŒçºŒ 3 ç§’å¾Œå°‹æ‰¾éžå·¨äººåŒ–è‰é£Ÿæ€§
  - **ç”Ÿæ…‹å€å›žæ­¸**ï¼šè‚‰é£Ÿè€…é›¢é–‹è‡ªèº«ç”Ÿæ…‹å€æ™‚ï¼Œä»¥ 1.3 å€é€Ÿæœæœ€è¿‘ç”Ÿæ…‹å€é»žå›žæ­¸ï¼›`_leftBiomeTime` åŒæ™‚ä½œç‚ºå„ç‰©ç¨®åŠ æˆå¤±æ•ˆè¨ˆæ™‚

- **æ®ºæ‰‹ killerLevel è¨ˆæ•¸å™¨**ï¼ˆ`systems/creatures.js`ã€`systems/combat.js`ã€`systems/ui.js`ï¼‰ï¼š
  - æ®ºæ‰‹åŒ–å¾Œæ¯åƒä¸€å…·å±é«” `killerLevel++`ï¼›é ­ä¸Šé¡¯ç¤ºã€Œ[ç‰©ç¨®å] æ®ºæ‰‹Lv[N]ã€ï¼ˆæ©™è‰²ç²—é«”ï¼‰
  - æ“Šæ®ºXPå…¬å¼æ”¹ç‚º `100 + killerLevelÃ—5 + çµäººæœ¬èƒ½Ã—10`ï¼ˆåŽŸç‚º `baseDamageÃ—2Ã—1.1^n`ï¼‰
  - æ“Šæ®ºæŽ‰è½å±é«”æ•¸ï¼š3 ä»½ â†’ 2 ä»½

### èª¿æ•´

- **å·¨äººåŒ– aggroRange**ï¼š150 â†’ 400ï¼ˆ`_triggerGiantization`ï¼‰
- **å·¨äººåŒ– guardianRange**ï¼šæ–°å¢ž 1000px â€” åµæ¸¬ guardianRange å…§çµ„å“¡è¢«æ•µæ„ç”Ÿç‰©å¨è„…æ™‚ï¼Œåˆ‡æ›ç‚º guardianTarget å„ªå…ˆæ”»æ“Š
- **å·¨äººåŒ– HP ä½Žè¡€é€ƒè·‘**ï¼šHP â‰¤ 30% æ™‚é€ƒå¾€æœ€è¿‘æžœå­ï¼›æ¯åƒä¸€é¡† +10% maxHPï¼ˆ`_updateGiantFlee`ï¼‰
- **å·¨äººåŒ–éšŠä¼ä¸Šé™å‹•æ…‹åŒ–**ï¼š`base 5 + éšŠä¼å…§å·²å·¨äººåŒ–æˆå“¡æ•¸`ï¼Œä¸Šé™ 8 éš»ï¼ˆ`_getPackLimit`ï¼‰
- **Alpha aggroRange**ï¼š300 â†’ 600ï¼ˆ`_triggerAlpha`ï¼‰
- **Alpha guardianRange**ï¼šæ–°å¢ž 1500px
- **Alpha HP åˆ†äº«å›žè¡€**ï¼šHP â‰¥ 80% â†’ æ¯ç§’åˆ†äº« 1% maxHP çµ¦æœ€ä½Žè¡€é‡çµ„å“¡ï¼›HP < 80% â†’ è‡ªå›ž 2%ï¼ˆä¸åˆ†äº«ï¼‰
- **è‚‰é£Ÿæ€§é€²åŒ–å›ºå®šå€¼è¦†è“‹**ï¼ˆ`config/evolution.js`ã€`systems/evolution.js`ï¼‰ï¼šæ”¹ç‚ºå›ºå®šå€¼è¦†è“‹ï¼ˆéžç´¯è¨ˆï¼‰ï¼Œå„ç­‰ç´šæ”»æ“ŠåŠ æˆ 2/5/9/14/20ï¼Œåƒå±é«” XP 5/8/12/15/20ï¼Œåƒå±é«”æ™‚é–“ 3/2.5/2/1.5/1 ç§’ï¼ŒLv3+ æ”»é€Ÿ +5%/+10%/+15%
- **è‰é£Ÿæ€§é€£åƒæ©ŸçŽ‡**ï¼šåƒå®Œä¸€é¡†æžœå­æœ‰ 70%ï¼ˆæ™®é€šï¼‰/ 90%ï¼ˆæœ‰åŒæ—å·¨äººåœ¨ 500px å…§ï¼‰æ©ŸçŽ‡ç¹¼çºŒåƒé™„è¿‘æžœå­ï¼ˆåŽŸç‚ºæ¯æ¬¡ç¨ç«‹è§¸ç™¼ï¼‰

---

## v0.45.1 - 2026-05-23

### é‡æ§‹
- **æ¨¡çµ„åŒ–æ‹†åˆ†**ï¼ˆ`systems/ui.js`ï¼‰ï¼šå°‡ ui.js æ‹†åˆ†ç‚ºä¸‰å€‹ç¨ç«‹æ¨¡çµ„
  - `systems/leaderboard.js`ï¼šæŽ’è¡Œæ¦œé¢æ¿ã€åˆ†æ•¸æäº¤å½ˆçª—ã€é›£åº¦ç‹€æ…‹ç®¡ç†
  - `systems/mobile.js`ï¼šè£ç½®åµæ¸¬ã€æ‰‹æ©Ÿç¸®æ”¾ã€æ–æ¡¿ã€æ”»æ“Šå€ã€è§¸æŽ§ç–ŠåŠ å±¤
  - `systems/hud.js`ï¼šdrawGame ä¸»æ¸²æŸ“ã€HUD æ›´æ–°ã€å°åœ°åœ–ã€ä¸Šæ–¹è¡€æ¢
  - ui.js ä¿ç•™ï¼šé¢æ¿ç³»çµ±ï¼ˆé¦–é /è¨­å®š/åœ°åœ–é¸æ“‡/åœ–é‘‘/æ•…äº‹æ›¸/ç‰ˆæœ¬å…¬å‘Šï¼‰ã€Tooltipã€èªžè¨€åˆ‡æ›ã€é–‹ç™¼è€…æ¨¡å¼

---

## v0.45.0 - 2026-05-22

### æ–°å¢ž
- **æ–°æ‰‹æ•™å­¸ç¬¬äºŒéšŽæ®µï¼šæˆ°é¬¥æ•™å­¸**ï¼ˆ`systems/tutorial.js`ã€`systems/organs.js`ã€`systems/combat.js`ã€`systems/ui.js`ã€`systems/gameState.js`ã€`main.js`ã€`index.html`ï¼‰ï¼š
  ç¹¼ç¬¬ä¸€éšŽæ®µï¼ˆç§»å‹•ã€åƒæžœå­ã€æ—¥å¤œèªªæ˜Žï¼‰ä¹‹å¾Œï¼Œåœ¨çŽ©å®¶ç¬¬ä¸€æ¬¡å‡ç´šæ™‚è‡ªå‹•è§¸ç™¼æˆ°é¬¥æ•™å­¸ã€‚
  - **å™¨å®˜éŽ–å®š**ï¼š`showOrganSelection()` åµæ¸¬åˆ° `tutorialCompleted` å­˜åœ¨ä¸” `tutorialCombatDone` ä¸å­˜åœ¨æ™‚ï¼Œè¨­å®š `tutorialOrganPhase = true`ï¼›ç•«é¢åªæœ‰ç¬¬ä¸€å¼µæ”»æ“Šå™¨å®˜å¡ç‰‡å¯é¸ï¼ˆé‡‘è‰²é–ƒçˆé‚Šæ¡† + ã€ŒðŸ‘† é¸æ“‡ä½ çš„ç¬¬ä¸€å€‹æ”»æ“Šå™¨å®˜ï¼ã€æç¤ºï¼‰ï¼Œå…¶ä»–å¡ç‰‡ç°æš—ç¦ç”¨ã€å¹¸é‹é‡æŠ½æŒ‰éˆ•éš±è—ã€‚
  - **æ•™å­¸æœ¨æ¨**ï¼šé¸å®Œæ”»æ“Šå™¨å®˜å¾Œï¼Œåœ¨çŽ©å®¶æ­£å‰æ–¹ 150 åƒç´ ç”Ÿæˆä¸€æ ¹æ£•è‰²æœ¨æ¨ï¼ˆHP 30ã€ä¸ç§»å‹•ã€ä¸æ”»æ“Šï¼‰ï¼Œä¸¦é¡¯ç¤ºå·¦ä¸Šè§’æˆ°é¬¥æç¤ºæ¡†ï¼ˆæ‰‹æ©Ÿç‰ˆé¡¯ç¤ºæ”»æ“Šå€æç¤ºï¼‰ã€‚æœ¨æ¨æœ‰è¡€æ¢èˆ‡åç¨±æ¨™ç±¤ï¼Œç¹ªè£½æ–¼ `drawGame()` 7c æ­¥é©Ÿã€‚
  - **æ”»æ“Šæ•´åˆ**ï¼š`playerAttack()` å°‡æ•™å­¸æœ¨æ¨åŠ å…¥æ”»æ“Šç›®æ¨™é™£åˆ—ï¼Œæ­»äº¡æ™‚å‘¼å« `handleTutorialStumpKill()` è€Œéžä¸€èˆ¬ `handleKill()`ã€‚
  - **å®Œæˆæµç¨‹**ï¼šæ“Šæ®ºæœ¨æ¨ â†’ å‡çµ 0.5 ç§’ â†’ é¡¯ç¤ºã€Œâš”ï¸ æ”»æ“Šå­¸æœƒäº†ï¼ã€å°æ¡†ï¼ˆçŽ©å®¶é ­é ‚ï¼Œ2 ç§’è‡ªå‹•æ¶ˆå¤±ï¼‰â†’ å¯«å…¥ `localStorage.tutorialCombatDone` â†’ è§£å‡ç¹¼çºŒéŠæˆ²ã€‚
  - **`index.html` è¼‰å…¥é †åºèª¿æ•´**ï¼š`tutorial.js` ç§»è‡³ `combat.js` / `organs.js` ä¹‹å‰ï¼Œç¢ºä¿å…©è€…å¯å‘¼å«æ•™å­¸å‡½å¼ã€‚
  - æ–°å¢ž `gameState` æ——æ¨™ï¼š`tutorialOrganPhase`ã€`tutorialCombatActive`ã€`tutorialStump`ï¼Œå‡åœ¨ `initializeGame()` é‡ç½®ã€‚

---

## v0.44.0 - 2026-05-22

### æ–°å¢ž
- **è¨­å®šé¢æ¿ â†’ è¼”åŠ©åŠŸèƒ½ â†’ æ–°æ‰‹æ•™å­¸é–‹é—œ**ï¼ˆ`systems/ui.js`ï¼‰ï¼š
  å¯æ‰‹å‹•åˆ‡æ›ä¸‹ä¸€å ´éŠæˆ²æ˜¯å¦é¡¯ç¤ºæ–°æ‰‹æ•™å­¸ã€‚
  é–‹å•Ÿï¼ˆç¶ è‰²ï¼‰= ç§»é™¤ `tutorialCompleted` æ¨™è¨˜ï¼Œä¸‹ä¸€å ´é€²å…¥éŠæˆ²å¾Œæœƒè‡ªå‹•å‡ºç¾ä¸‰æ­¥é©Ÿæ•™å­¸ï¼›
  é—œé–‰ï¼ˆç°è‰²ï¼‰= å¯«å…¥ `tutorialCompleted`ï¼Œæ•™å­¸ä¸å†è§¸ç™¼ã€‚
  é–‹é—œç‹€æ…‹å³æ™‚åæ˜  `localStorage` ç¾æ³ï¼Œä¸éœ€è¦é‡æ–°æ•´ç†é é¢ã€‚

---

## v0.43.0 - 2026-05-22

### æ–°å¢ž
- **æ–°æ‰‹æ•™å­¸ç³»çµ±**ï¼ˆ`systems/tutorial.js`ã€`main.js`ã€`systems/gameState.js`ã€`index.html`ï¼‰ï¼š
  é¦–æ¬¡éŠçŽ©è‡ªå‹•è§¸ç™¼ä¸‰æ­¥é©Ÿæ•™å­¸ï¼Œå®Œæˆå¾Œå¯«å…¥ `localStorage.tutorialCompleted` ä¸å†é‡è¤‡é¡¯ç¤ºã€‚
  - **æ­¥é©Ÿä¸€ï¼ˆå‡çµï¼‰**ï¼šå…¨èž¢å¹•æš—è‰²é®ç½© + çŽ©å®¶ç™½è‰²å…‰åœˆè„ˆè¡å‹•ç•« + æ­¡è¿Žæç¤ºæ¡†ï¼ˆã€ŒðŸ¦ ä½ æ˜¯å™ªéµ‘â€¦â€¦ã€ï¼‰ï¼ŒæŒ‰éˆ•é€²å…¥ä¸‹ä¸€æ­¥ã€‚
  - **æ­¥é©ŸäºŒï¼ˆè§£å‡ï¼‰**ï¼šéŠæˆ²æ¢å¾©é‹è¡Œï¼›æ‰¾åˆ°æœ€è¿‘æžœå­ä¸¦æ¨™è¨˜é‡‘è‰²è„ˆè¡å…‰æšˆèˆ‡é–ƒçˆ â†“ ç®­é ­ï¼›æç¤ºæ¡†ç§»è‡³å·¦ä¸Šè§’ï¼ˆæ‰‹æ©Ÿç‰ˆç‚ºä¸Šæ–¹ç½®ä¸­ï¼‰ï¼›15 ç§’é˜²å‘†è‡ªå‹•ç¹ªè£½å¾žçŽ©å®¶åˆ°æžœå­çš„ç´…è‰²è™›ç·šå¼•å°Žç·šï¼›XP å¢žåŠ å³è§¸ç™¼é‡‘è‰²é–ƒå…‰ä¸¦é€²å…¥ä¸‹ä¸€æ­¥ã€‚
  - **æ­¥é©Ÿä¸‰ï¼ˆå‡çµï¼‰**ï¼šé®ç½©é‡æ–°å‡ºç¾ï¼›å³ä¸Šè§’æ—¥å¤œæŒ‡ç¤ºå™¨é‡‘è‰²é‚Šæ¡†é–ƒçˆé«˜äº®ï¼›ä¸­å¤®æç¤ºæ¡†èªªæ˜Žæ—¥å¤œæ©Ÿåˆ¶èˆ‡å‹åˆ©æ¢ä»¶ï¼ŒæŒ‰éˆ•çµæŸæ•™å­¸ã€‚
  - `gameState.tutorialOpen`ï¼šæ–°å¢žç‹€æ…‹æ——æ¨™ï¼Œå·²æ•´åˆè‡³ `isGamePaused()` ä½¿æ•™å­¸æœŸé–“æš«åœéŠæˆ²é‚è¼¯ã€‚

---

## æ–‡ä»¶ä¿®æ­£ - 2026-05-22ï¼ˆä¸æ›´æ–°ç‰ˆæœ¬è™Ÿï¼‰

### èª¿æ•´
- **MOBILE_GAME_SCALE æ–‡ä»¶è¡çªä¿®æ­£**ï¼ˆ`project_summary.md`ã€`.claude/instructions.md`ï¼‰ï¼š
  v0.34.0 å·²å°‡ `MOBILE_GAME_SCALE` å¾ž 0.7 èª¿æ•´ç‚º 0.6ï¼Œä½†ä¸‰è™•æ–‡ä»¶æœªåŒæ­¥æ›´æ–°ã€‚
  æœ¬æ¬¡ä¿®æ­£æŠ€è¡“æž¶æ§‹å€å¡Šé‚è¼¯è§£æžåº¦æ•¸å€¼ï¼ˆæ©«å‘ 1120Ã—630 â†’ 960Ã—540ï¼Œç›´å‘ 630Ã—1120 â†’ 540Ã—960ï¼‰ã€
  é‡è¦æé†’ç¬¬ 3 æ¢ã€`.claude/instructions.md` æŠ€è¡“é™·é˜±èªªæ˜Žï¼Œçµ±ä¸€å°é½Šå¯¦éš›ç¨‹å¼ç¢¼èˆ‡ CHANGELOGã€‚

---

## æ–‡ä»¶ä¿®æ­£ - 2026-05-22ï¼ˆä¸æ›´æ–°ç‰ˆæœ¬è™Ÿï¼‰

### èª¿æ•´
- **é€Ÿåº¦ Ã—3.0 æ­·å²è£œä¸æ–‡æ¡ˆ Fixed**ï¼ˆ`project_summary.md`ã€`.claude/instructions.md`ï¼‰ï¼š
  æ—©æœŸç„¡ Fixed Timestep æ™‚ï¼Œç‚ºä¿®æ­£ 180Hz èž¢å¹•é€Ÿåº¦åå¿«å•é¡Œå°æ‰€æœ‰é€Ÿåº¦æ•¸å€¼ä¹˜ä»¥ 3.0ï¼›
  Fixed Timestep åŠ å…¥å¾Œè£œä¸å·²ç„¡å¿…è¦ä½†æ•¸å€¼åŸºæº–ä¿ç•™ï¼Œ`lang/zh-TW.js` é€Ÿåº¦æè¿°åœ¨ v0.34.0
  æ•¸å€¼èª¿æ•´æ™‚å·²åŒæ­¥èˆ‡å¯¦éš› `speedAdd` ä¸€è‡´ã€‚ç§»é™¤éŽæ™‚çš„ã€Œæè¿°ä¸ä¸€è‡´ã€note èˆ‡å¾…è¾¦é …ç›®ï¼Œ
  æ›´æ–°èªªæ˜Žç‚ºã€Œâœ… æ–‡æ¡ˆ Fixedï¼Œç„¡éœ€å†è™•ç†ã€ï¼Œå¾ŒçºŒ AI ä¸éœ€è¦ç¹¼çºŒè™•ç†æ­¤å•é¡Œã€‚

---

## v0.42.0 - 2026-05-22

### æ–°å¢ž
- **ç‰ˆæœ¬æ›´æ–°å…¬å‘Šç³»çµ±**ï¼ˆ`config/patchnotes.js`ã€`systems/ui.js`ã€`index.html`ï¼‰ï¼šé¦–é å·¦ä¸Šè§’æ•…äº‹æ›¸æŒ‰éˆ•ä¸‹æ–¹æ–°å¢žã€ŒðŸ“‹ æ›´æ–°ã€æŒ‰éˆ•ï¼›æ–°å¢ž `showPatchNotes()` é¢æ¿ï¼ˆåž‚ç›´ Tab åˆ—é¡¯ç¤ºæ‰€æœ‰ç‰ˆæœ¬ï¼Œæœªè®€ç‰ˆæœ¬ç´…é»ž highlightï¼Œå…§å®¹ä¾ã€Œæ–°å¢ž/ä¿®å¾©/èª¿æ•´ã€åˆ†é¡žé¡¯ç¤ºï¼‰ï¼›æ–°å¢ž `checkPatchNotesPopup()` åœ¨é¦–é è‡ªå‹•å½ˆå‡ºæœªè®€å…¬å‘Šï¼ˆæ–°çŽ©å®¶è·³éŽï¼‰ï¼›æ–°å¢ž `config/patchnotes.js` çµ±ä¸€ç®¡ç†æ‰€æœ‰ç‰ˆæœ¬å…¬å‘Šè³‡æ–™ï¼ˆ`PATCH_NOTES` é™£åˆ—ï¼Œæœ€æ–°ç‰ˆæœ¬ç½®é ‚ï¼‰

### ä¿®å¾©
- **æ‰‹æ©Ÿç‰ˆ Boss/ç²¾è‹±è¡€æ¢èˆ‡çŽ©å®¶è¡€æ¢é‡ç–Š**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`drawTopBarUI()` çš„ `y = 10` æ”¹ç‚ºå‹•æ…‹åµæ¸¬ `#top-left` DOM å…ƒç´ é«˜åº¦ä¸¦æ›ç®— Canvas é‚è¼¯åº§æ¨™ï¼Œæ‰‹æ©Ÿ/æ¡Œæ©Ÿè‡ªå‹•é©æ‡‰
- **Boss æ­»äº¡å¾Œè¡€æ¢ UI æ®˜ç•™**ï¼ˆ`systems/boss.js`ï¼‰ï¼š`showVictory()` é–‹é ­åŠ å…¥ `gameState.topBarTarget = null; gameState.topBarFadeTimer = 0;`ï¼Œç¢ºä¿å‹åˆ©æ™‚è¡€æ¢ç«‹å³æ¸…é™¤

### èª¿æ•´
- **è‰é£Ÿæ€§ä¸­ç«‹ç”Ÿç‰©æŽ¢ç´¢æžœå­è¡Œç‚º**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šæŽ¢ç´¢æžœå­æ©ŸçŽ‡ 30% â†’ 60%ï¼Œæœå°‹ç¯„åœ 400px â†’ 800pxï¼Œä¼‘æ¯æ©ŸçŽ‡ 30% â†’ 20%ï¼Œéš¨æ©Ÿæ¼«éŠæ©ŸçŽ‡ 40% â†’ 20%

---

## v0.41.2 - 2026-05-22

### ä¿®æ­£
- **å™¨å®˜å€åŸŸè§¸ç¢°é€ æˆç§»å‹•æ­»å€**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`_attachJoystickListeners` `onStart` handler ä¸­ï¼Œå‘½ä¸­ `_organHitRegions` æ™‚ç§»é™¤ `continue`ï¼Œè®“è§¸ç¢°åœ¨é¡¯ç¤ºï¼ˆæˆ–ç•¥éŽï¼‰tooltip å¾Œç¹¼çºŒåŸ·è¡Œæ–æ¡¿å•Ÿå‹•é‚è¼¯ï¼›`showOrganTooltip` é—œé–‰æ™‚å·¦ä¸‹è§’å™¨å®˜å€åŸŸä¸å†æˆç‚ºç„¡æ³•ç§»å‹•çš„æ­»å€

---

## v0.41.1 - 2026-05-22

### ä¿®æ­£
- **å™¨å®˜æç¤ºé–‹é—œåŒæ™‚ç®¡æŽ§æ¡Œæ©Ÿç‰ˆ**ï¼ˆ`main.js`ï¼‰ï¼š`mousemove` äº‹ä»¶åœ¨ `showTooltip` å‘¼å«å‰åŠ å…¥ `showOrganTooltip` åˆ¤æ–·ï¼Œé–‹é—œé—œé–‰æ™‚ç«‹å³å‘¼å« `hideTooltip()` ä¸¦è¿”å›ž
- **éš±è—å™¨å®˜ tooltip ç„¡æ³•é»žæ“Š**ï¼ˆ`systems/organs.js`ï¼‰ï¼š`_organHitRegions` éš±è—å™¨å®˜çš„ y åº§æ¨™å¾ž `(sepBase + 2 + j) * lineH` ä¿®æ­£ç‚º `(sepBase + 1 + j) * lineH`ï¼Œä½¿ hit region èˆ‡ç•«é¢ä¸Šå¯¦éš›æ–‡å­—ä½ç½®å°é½Šï¼ˆèˆ‡æ™®é€šå™¨å®˜å…¬å¼ä¸€è‡´ï¼‰
- **å™¨å®˜æç¤ºé–‹é—œåœ¨æ¡Œæ©Ÿç‰ˆä¸é¡¯ç¤º**ï¼ˆ`systems/ui.js`ï¼‰ï¼šç§»é™¤ `showSettings()` ä¸­åŒ…ä½ organTooltip toggle çš„ `if (gameState.isMobile)` æ¢ä»¶ï¼Œæ¡Œæ©Ÿç‰ˆèˆ‡æ‰‹æ©Ÿç‰ˆå‡å¯æ“ä½œ

---

## v0.41.0 - 2026-05-22

### æ–°å¢ž
- **æ‰‹æ©Ÿç‰ˆå™¨å®˜æç¤ºé–‹é—œ**ï¼ˆ`systems/ui.js`ã€`systems/gameState.js`ï¼‰ï¼šæ–°å¢ž `DEFAULT_SETTINGS.showOrganTooltip: true`ï¼›æ‰‹æ©Ÿç‰ˆè¨­å®šé¢æ¿ã€Œè¼”åŠ©åŠŸèƒ½ã€å€å¡Šæ–°å¢žã€Œå™¨å®˜æç¤ºã€ON/OFF toggleï¼ˆæ¡Œæ©Ÿç‰ˆéš±è—ï¼‰ï¼›é—œé–‰å¾Œé»žè§¸å™¨å®˜å€åŸŸä¸é¡¯ç¤º tooltipï¼Œä»é˜»æ“‹æ–æ¡¿å•Ÿå‹•
- **èªžè¨€åŒ…**ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼šæ–°å¢ž `organTooltip` key

---

## v0.40.1 - 2026-05-22

### ä¿®æ­£
- **TOP10 æµ®çª—ç¸®æ”¾**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ¡Œæ©Ÿç‰ˆ transform æ¢å¾© `translateY(-50%)`ï¼ˆç§»é™¤å¤šé¤˜çš„ `scale(0.65)`ï¼‰ï¼›æ‰‹æ©Ÿç‰ˆæ”¹ç‚º `scale(0.65)`ï¼ˆåŽŸç‚º `scale(0.55)`ï¼‰

---

## v0.40.0 - 2026-05-22

### æ–°å¢ž
- **æŽ’è¡Œæ¦œé›£åº¦åˆ‡æ›**ï¼ˆ`config/supabase.js`ã€`systems/ui.js`ï¼‰ï¼š`fetchVictoryRecords`ã€`fetchDefeatRecords`ã€`fetchTop10` æ–°å¢ž `difficulty` ç¯©é¸åƒæ•¸ï¼›æ–°å¢ž `fetchAvailableDifficulties()` æŸ¥è©¢æœ‰è³‡æ–™çš„é›£åº¦é™£åˆ—ï¼ˆå‰ç«¯åŽ»é‡ï¼‰
- **æŽ’è¡Œæ¦œé›£åº¦åˆ‡æ›æŒ‰éˆ•**ï¼ˆ`systems/ui.js` `showLeaderboard()`ï¼‰ï¼šæ¨™é¡Œåˆ—æ—åŠ å…¥åˆ‡æ›æŒ‰éˆ•ï¼Œé»žæ“Šå¾ªç’°åˆ‡æ›æœ‰è³‡æ–™çš„é›£åº¦ï¼Œé¡¯ç¤ºèªžè¨€åŒ…æ–‡å­—ï¼ˆ`diffEasy`/`diffNormal`ç­‰ï¼‰ï¼›åˆ‡æ›æ™‚åŒæ­¥æ›´æ–° `_top10Difficulty`
- **TOP10 é›£åº¦åˆ‡æ›æŒ‰éˆ•**ï¼ˆ`systems/ui.js` `showStartScreen()`ï¼‰ï¼šæ¨™é¡Œå³å´åŠ å…¥å°åˆ‡æ›æŒ‰éˆ•ï¼Œé€éŽ `fetchAvailableDifficulties()` å¾ªç’°åˆ‡æ›ï¼›åˆ‡æ›æ™‚åŒæ­¥æ›´æ–° `_lbDifficulty`
- **æ¨¡çµ„ç´šé›£åº¦ç‹€æ…‹**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`_lbDifficulty`ã€`_top10Difficulty` å…©å€‹æ¨¡çµ„è®Šæ•¸ä¿æŒåŒæ­¥ï¼›`_diffKey()` è¼”åŠ©å‡½å¼è½‰æ›èªžè¨€åŒ… key
- **åˆ†æ•¸ä¸Šå‚³å«é›£åº¦æ¬„ä½**ï¼ˆ`systems/ui.js` `showScoreSubmitPopup()`ï¼‰ï¼šä¸Šå‚³è³‡æ–™åŠ å…¥ `difficulty: gameState.lastDifficulty || 'easy'`
- **index.html fallback æ›´æ–°**ï¼š`fetchVictoryRecords`/`fetchDefeatRecords`/`fetchTop10` ç°½ååŒæ­¥ï¼›æ–°å¢ž `fetchAvailableDifficulties` fallbackï¼ˆå›žå‚³ç©ºé™£åˆ—ï¼‰

### èª¿æ•´
- **TOP10 æµ®çª—ç¸®æ”¾**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ¡Œæ©Ÿç‰ˆ transform å¾ž `translateY(-50%)` æ”¹ç‚º `translateY(-50%) scale(0.65)`ï¼Œç¸®å°ç‰ˆé¢ä¸é®æ“‹ä¸»é¸å–®ï¼›æ‰‹æ©Ÿç‰ˆç¶­æŒ `scale(0.55)`

---

## v0.39.0 - 2026-05-22

### æ–°å¢ž
- **è®Šç•°å™¨å®˜ç³»çµ±**ï¼ˆ`systems/mutation.js`ï¼‰ï¼šå››ç¨®æ°¸ä¹…è·¨å±€å™¨å®˜ï¼ˆæ†¤æ€’çš„ç ç‰™/æ‡¦å¼±çš„å°¾å·´/å‹‡æ•¢çš„ç¿…è†€/å¥½å¥‡çš„çœ¼ç›ï¼‰ï¼Œå„å° Final å€¼ +1%æ”»æ“Š/æœ€å¤§HP/é€Ÿåº¦/XPå€æ•¸ï¼›å‡ç´šè²»ç”¨æ¯5ç´š+1è²»ï¼ˆLv0â†’1=1é»žï¼‰ï¼›ç¨ç«‹ localStorage key `mutationData`ï¼Œä¸å— SAVE_VERSION æ¸…é™¤
- **è®Šç•°é»žç²å¾—**ï¼ˆ`addMutationPoints`ï¼‰ï¼šæ“Šæ®ºå·¨äººåŒ–/Alpha/æ®ºæ‰‹åŒ–æŽ‰è½è®Šç•°é»žï¼ˆPhase 3-4 å·²å¯¦ä½œï¼‰ï¼Œå³æ™‚é¡¯ç¤ºæµ®å‹•æ–‡å­— `âœ¦ +N è®Šç•°é»ž`
- **è®Šç•°å™¨å®˜ UI**ï¼ˆ`systems/ui.js`ï¼‰ï¼šé ‚å·¦ UI ç¬¬ä¸‰è¡ŒåŠ å…¥ âš—ï¸ åœ–æ¨™ + ç¸½ç­‰ç´šï¼Œç²å¾—æ–°è®Šç•°é»žæ™‚é¡¯ç¤ºç´…é»žï¼›é»žæ“Šå½ˆå‡ºå‡ç´šé¢æ¿ï¼ˆz-index 120ï¼ŒéŠæˆ²æš«åœï¼‰
- **è£œå„Ÿæ©Ÿåˆ¶**ï¼ˆ`mutation.js`ï¼‰ï¼š`MUTATION_COMPENSATION_VERSION` æŽ§åˆ¶ï¼Œå¯æŒ‰æ¯”ä¾‹è¿”é‚„è®Šç•°é»žå’ŒæŠ€èƒ½é»žï¼ŒåŸ·è¡Œä¸€æ¬¡å¾Œè¨˜éŒ„ç‰ˆæœ¬é¿å…é‡è¤‡
- **applyAllMutationBonuses**ï¼ˆ`mutation.js`ï¼‰ï¼šéŠæˆ²åˆå§‹åŒ–ä¸€æ¬¡æ€§å¥—ç”¨ï¼Œåœ¨æ‰€æœ‰å™¨å®˜æ•ˆæžœä¹‹å¾Œï¼›mid-game å‡ç´šç”¨ delta æ¯”å€¼å¥—ç”¨ï¼Œé¿å…è¤‡åˆ©èª¤ç®—

### èª¿æ•´
- `addXP()`ï¼ˆ`systems/player.js`ï¼‰ï¼šå‹•æ…‹å¥—ç”¨ `mutationXpBonus` ä¹˜æ•¸
- `applyOrganEffects()`ï¼ˆ`systems/organs.js`ï¼‰ï¼šæœ«å°¾å‘¼å« `applyMutationEffects()` åˆ·æ–°å€çŽ‡
- `isGamePaused()`ï¼ˆ`main.js`ï¼‰ï¼šåŠ å…¥ `mutationPanelOpen` åˆ¤æ–·
- `_joyPaused()`ï¼ˆ`systems/ui.js`ï¼‰ï¼šåŠ å…¥ `mutationPanelOpen` åˆ¤æ–·
- `initializeGame()`ï¼ˆ`main.js`ï¼‰ï¼šé‡ç½® `mutationPanelOpen = false`ï¼›å‘¼å« `applyAllMutationBonuses()`
- `window.onload`ï¼ˆ`main.js`ï¼‰ï¼šå…ˆå‘¼å« `initMutationData()` è¼‰å…¥è®Šç•°è³‡æ–™
- **æ™®é€šåœ°åœ– aggroRange**ï¼ˆ`map/normalmap.js`ï¼‰ï¼š`aggroRangeOverride: 2000 â†’ 400`ï¼ˆåŽŸå€¼ç­‰æ–¼å…¨åœ°åœ–éŽ–å®šï¼ŒçŽ©å®¶å®Œå…¨ç„¡æ³•èº²é¿ï¼‰

---

## v0.38.0 - 2026-05-22

### æ–°å¢ž
- **è‚‰ç³»åƒå±é«”ç³»çµ±**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šæ™®é€šåœ°åœ–è‚‰ç³»ç”Ÿç‰©åœ¨æ¼«éŠ/ä¼‘æ¯æ™‚åµæ¸¬ 60px å…§å±é«”é€²å…¥ `eating` ç‹€æ…‹ï¼Œæ¯ 0.5s tick / 6 ticksï¼ˆ3ç§’ï¼‰å®Œæˆï¼ŒæœŸé–“ aggroRangeÃ—1.5ï¼Œæœ‰ç”Ÿç‰©é€²å…¥å‰‡ä¸­æ–·ï¼›å®Œæˆå¾Œ `_carnivoreEatCorpse` æˆé•·ï¼ˆæ¯å…· +10% åŸºç¤Žå€¼ï¼Œä¸ç´¯ä¹˜ï¼‰+ å›žè¡€ 5%
- **æ®ºæ‰‹åŒ–ç³»çµ±**ï¼ˆ`systems/creatures.js`ï¼‰ï¼š`corpseEaten >= 5` è§¸ç™¼ `_triggerKiller`ï¼ŒaggroRange ç¿»å€ã€æ”»æ“Š +50%+ä¹‹å‰10%ç´¯è¨ˆã€é€Ÿåº¦ +30%+ä¹‹å‰10%ç´¯è¨ˆï¼›æ¯5ç§’å›žè¡€1%ï¼›ç¹¼çºŒåƒå±é«”æ¯å…·å† +10% åŸºç¤Žå€¼ï¼›`handleKillerKill`ï¼ˆ`systems/combat.js`ï¼‰ï¼šXPÃ—2ï¼ˆç´¯ä¹˜ 1.1^killerCorpseEatenï¼‰+ 3ä»½å±é«” + è®Šç•°é»ž
- **ç²¾è‹±æ€ªå›žè¡€**ï¼ˆ`systems/elite.js`ï¼‰ï¼šæ™®é€šåœ°åœ– `eliteRegen`ï¼Œç¬¬1/2/3å¤œæ¯5ç§’å›žå¾© 1%/2%/3% maxHPï¼›`elite.tierIndex` è¨˜éŒ„å¤œæ™šç­‰ç´š
- **Bosså›žè¡€**ï¼ˆ`systems/boss.js`ï¼‰ï¼šæ™®é€šåœ°åœ– `bossRegen`ï¼Œæ¯10ç§’å›žå¾© 10% maxHP
- **ç²¾è‹±æ€ªæ­»äº¡æŽ‰è½**ï¼ˆ`systems/organs.js`ï¼‰ï¼š`handleEliteKill` å‘¼å« `spawnLootCircle`ï¼Œæ•£è½ 1 å€‹ 1 å€å±é«” + 4 å…·ç™½éª¨
- **`baseRadius`**ï¼ˆ`systems/spawning.js`ï¼‰ï¼š`_makeCarnCreature` æ–°å¢ž `baseRadius: 10` æ¬„ä½ï¼Œä¾›åƒå±é«”æˆé•·è¨ˆç®—ä½¿ç”¨

### èª¿æ•´
- `handleKill`ï¼ˆ`systems/combat.js`ï¼‰ï¼šé–‹é ­æ–°å¢ž `isKiller` åˆ¤æ–·ï¼Œè·¯ç”±è‡³ `handleKillerKill`
- èˆŠè‚‰ç³»å³æ™‚åƒå±é«”é‚è¼¯ï¼ˆèˆŠ Phase 1 ç°¡æ˜“ç‰ˆï¼‰å®Œå…¨æ›¿æ›ç‚ºæ–° tick-based `eating` ç‹€æ…‹ç³»çµ±

---

## v0.37.0 - 2026-05-22

### æ–°å¢ž
- **å·¨äººåŒ–ç³»çµ±**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šè‰ç³»ç”Ÿç‰©åƒæ»¿5é¡†æžœå­è§¸ç™¼ï¼ˆæ™®é€šåœ°åœ–é™å®šï¼‰ï¼Œæ”»æ“ŠåŠ›+20ã€è¡€é‡Ã—10ã€é«”ç©Ã—1.5ã€aggroRange 150ã€æ¯ç§’å›žå¾©1%è¡€ï¼›çµ„éšŠç³»çµ±ï¼ˆåŒæ—ä¸Šé™5éš»ï¼Œè·Ÿéš¨ç¯„åœ800pxï¼ŒéšŠå“¡ç­‰å¾…æ©Ÿåˆ¶ï¼‰ï¼›`_triggerGiantization()` è¼”åŠ©å‡½å¼
- **Alphaç³»çµ±**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šéšŠä¼å‡ºç¾ç¬¬2éš»å·¨äººåŒ–æ™‚ï¼ŒéšŠé•·å‡æ ¼Alphaï¼Œå…¨åœ–å”¯ä¸€ï¼ˆ`gameState.alphaCreature`ï¼‰ï¼Œæ”»æ“ŠåŠ›ç¿»å€/è¡€é‡Ã—3/é«”ç©Ã—1.5/aggroRange 300/æ¯ç§’å›žå¾©2%è¡€ï¼›`_triggerAlpha()` è¼”åŠ©å‡½å¼ï¼›`showAlphaAnnouncement()` å…¨å±3ç§’å…¬å‘Š
- **ä¸Šæ–¹è¡€æ¢UI**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`drawTopBarUI()` å‡½å¼ï¼ŒçŽ©å®¶2000pxå…§æœ‰ç‰¹æ®Šç›®æ¨™æ™‚é ‚éƒ¨é¡¯ç¤ºè¡€æ¢ï¼ˆå¯¬400pxï¼‰ï¼Œè¿½è¹¤æœ€å¾Œè¢«æ™®é€šæ”»æ“Šå‘½ä¸­çš„ç›®æ¨™ï¼Œç›®æ¨™æ­»äº¡/è¶…å‡ºç¯„åœå¾Œ0.5ç§’æ·¡å‡º
- **handleGiantKill**ï¼ˆ`systems/combat.js`ï¼‰ï¼šå·¨äººåŒ–/Alphaå°ˆå±¬æ“Šæ®ºçŽå‹µï¼ŒåŒ…å«XPï¼ˆ60/200ï¼‰ã€`spawnLootCircle` æŽ‰è½ã€è®Šç•°é»žï¼ˆé ç•™Phase 5ï¼‰
- **addMutationPoints**ï¼ˆ`systems/combat.js`ï¼‰ï¼šPhase 5 é ç•™ç©ºå‡½å¼

### èª¿æ•´
- ç§»é™¤è‰ç³»ç”Ÿç‰©çš„æ¿€é€²åŒ–é‚è¼¯ï¼ˆ`diet=aggressive`ï¼‰ï¼Œç”±å·¨äººåŒ–ç³»çµ±å–ä»£
- `playerAttack()`ï¼šå‘½ä¸­ç²¾è‹±/Boss/å·¨äººåŒ–æ™‚è¨­å®š `gameState.topBarTarget`ï¼›å·¨äººåŒ–æ“Šæ®ºè·¯ç”±è‡³ `handleGiantKill`
- `updateStatusEffects()`ï¼šç‹€æ…‹ç•°å¸¸ï¼ˆæ¯’/æµè¡€ï¼‰æ“Šæ®ºå·¨äººåŒ–ç”Ÿç‰©æ™‚æ­£ç¢ºè·¯ç”±è‡³ `handleGiantKill`
- `gameState` æ–°å¢žä¸‰å€‹æ¬„ä½ï¼š`alphaCreature`ã€`topBarTarget`ã€`topBarFadeTimer`
- `initializeGame()` å†ä¾†ä¸€å ´é‡ç½®æ™‚æ¸…ç©ºä¸Šè¿°ä¸‰å€‹æ¬„ä½

---

## v0.36.0 - 2026-05-22

### æ–°å¢ž
- **`map/normalmap.js`**ï¼šæ™®é€šé›£åº¦åœ°åœ–é…ç½®ï¼Œå«åœ°å½¢åƒæ•¸ï¼ˆä¸­å¿ƒæ£®æž— 400pxï¼‰ã€ç”Ÿç‰©å¼·åº¦ Ã—1.5ã€aggroRange 2000ã€ç§»é™¤é€Ÿåº¦/å‚·å®³ capï¼ˆ`removeHostileCap`ï¼‰ã€ç²¾è‹±/Boss å¼·åŒ–æ•¸å€¼ã€å°ˆå±¬ features é–‹é—œ
- **æ™®é€šé›£åº¦è§£éŽ–**ï¼ˆ`systems/ui.js`ï¼‰ï¼šé›£åº¦é¸æ“‡é é¢æ™®é€šé›£åº¦å¾ž ðŸ”’ æ”¹ç‚ºå¯é¸ï¼Œå¯«å…¥ `NORMAL_MAP`
- **`BIOME_CREATURES`**ï¼ˆ`config/creatures.js`ï¼‰ï¼šå…­ç¨®å‘½åç”Ÿç‰©ï¼ˆé§é¹¿/çŒžçŒ/å·¨åž‹ç”²è™«/é±·é­š/é§±é§/é¬£ç‹—ï¼‰ï¼Œå„è‡ªå°æ‡‰ç”Ÿæ…‹å€
- **ç”Ÿæ…‹ç”Ÿç‰©ç”Ÿæˆç³»çµ±**ï¼ˆ`systems/spawning.js`ï¼‰ï¼š`spawnBiomeCreatures()` æ›¿æ›èˆŠ grid ç”Ÿæˆï¼›è‰ç³»åˆå§‹ 10 éš» Ã— 3 å€ã€è‚‰ç³» 8 éš» Ã— 3 å€ï¼›`_randomPointInBiome` æ‹’çµ•æŽ¡æ¨£ç¢ºä¿åœ¨æ­£ç¢ºç”Ÿæ…‹å€ï¼›6 å€‹ç¨ç«‹è¨ˆæ™‚å™¨ï¼ˆå„ç”Ÿæ…‹å€å„è‰/è‚‰ç³»ï¼‰ï¼›å°‘æ–¼ 3 éš»æ™‚é–“éš” Ã—0.3 åŠ é€Ÿ
- **ç”Ÿç‰©ä¸‰æ…‹ç§»å‹•**ï¼ˆ`systems/creatures.js`ï¼‰ï¼š`creature.biome` æ¨™è¨˜çš„ç”Ÿç‰©ä½¿ç”¨ wanderingï¼ˆPerlin Noise å¹³æ»‘ï¼‰/ restingï¼ˆ1.5 ç§’ï¼Œå¯è¢«ä¸­æ–·ï¼‰/ attacking ä¸‰æ…‹ï¼›è‰ç³»å¶çˆ¾æŽ¢ç´¢æžœå­ã€è‚‰ç³»å¶çˆ¾æŽ¢ç´¢çµç‰©

### èª¿æ•´
- **ç°¡å–®åœ°åœ–è‚‰ç³»é™åˆ¶**ï¼ˆ`systems/creatures.js`ï¼‰ï¼šè‚‰ç³»åƒå±é«”æˆé•·é‚è¼¯ç”± `features.hostileEatMeat` æŽ§åˆ¶ï¼ŒEASY_MAP ç„¡æ­¤ feature â†’ é è¨­ä¸åŸ·è¡Œ
- **`gameState.spawnTimers`**ï¼ˆ`systems/gameState.js`ï¼‰ï¼šç”± `{ neutral, hostile }` æ”¹ç‚º `{ forest_herb, forest_carn, ocean_herb, ocean_carn, desert_herb, desert_carn }`

---

## v0.35.0 - 2026-05-22

### ä¿®å¾©
- **Bossæ¯’å‚·æœªç”Ÿæ•ˆ**ï¼ˆ`systems/combat.js`ï¼‰ï¼š`updateStatusEffects()` çš„ç”Ÿç‰© loop æ–°å¢ž `bossArr`ï¼Œä½¿ Boss æ­£å¸¸æŽ¥å—æ¯’å‚· tickï¼›Boss æ­»äº¡æ™‚èµ° `showVictory()`ï¼Œä¸èµ° `handleKill()`
- **å¿µåŠ›æ³¢æ“Šæ®ºXPå¯«æ­»**ï¼ˆ`systems/player.js`ï¼‰ï¼š`updatePassiveOrgans()` çš„å¿µåŠ›æ³¢æ“Šæ®ºæ”¹ç‚ºçµ±ä¸€èµ° `handleKill(c, true)`ï¼Œç§»é™¤å¯«æ­»çš„ `addXP(30)` å’Œæ‰‹å‹• `corpses.push`ï¼›è£œé½Šçµäººæœ¬èƒ½åŠ æˆã€å±é«”ç”Ÿæˆã€XP æµ®å‹•æ–‡å­—

### æ–°å¢ž
- **æ¯’å‚·æ¸›å…ç³»çµ±**ï¼ˆ`systems/combat.js`ï¼‰ï¼šç²¾è‹±æ€ª 20%ã€Boss é€šç”¨ 30%ã€æ²™æ¼ è çŽ‹ 50%ï¼›`updateStatusEffects()` æ¯’å‚· tick ä¾ç›®æ¨™é¡žåž‹è¨ˆç®—æ¸›å…å¾Œå¯¦éš›å‚·å®³ï¼Œæµ®å‹•æ•¸å­—é¡¯ç¤ºå¯¦éš›æ‰£è¡€å€¼
- **åœ“å½¢æ•£è½å…¨å±€å‡½å¼ `spawnLootCircle`**ï¼ˆ`systems/utils.js`ï¼‰ï¼šåœ“å½¢å¹³å‡è§’åº¦æ•£è½æŽ‰è½ç‰©ï¼Œè·ä¸­é»ž 10~25px éš¨æ©Ÿï¼›å–®å€‹ç‰©å“éš¨æ©Ÿè§’åº¦ï¼›æ”¯æ´ typeï¼š`corpse`ï¼ˆå« multiplier ç¸®æ”¾ï¼‰ã€`bone`ï¼›æ˜“æ“´å……è¨­è¨ˆä¾›å¾ŒçºŒ Phase ä½¿ç”¨

---

## v0.34.1 - 2026-05-21

### ä¿®å¾©

#### UI ä¿®å¾©
- **åœ–é‘‘çµ„åˆæ•ˆæžœå™¨å®˜åç¨±é¡¯ç¤º**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`showCompendium` çš„å™¨å®˜åœ–é‘‘é ï¼Œçµ„åˆæ•ˆæžœï¼ˆCOMBOSï¼‰æ¨™é¡ŒåŽŸæœ¬ç›´æŽ¥ä½¿ç”¨ `combo.ids.join(' + ')` é¡¯ç¤º id å­—ä¸²ï¼ˆå¦‚ `poisonStinger + poisonSac`ï¼‰ï¼›æ–°å¢ž `getOrganDisplayName(id)` helperï¼ˆå„ªå…ˆå¾ž `ORGANS` å–åï¼Œå…¶æ¬¡ `HIDDEN_ORGANS`ï¼Œfallback å›ž idï¼‰ï¼Œçµ„åˆæ¨™é¡Œæ”¹ç‚º `combo.ids.map(id => getOrganDisplayName(id)).join(' + ')`ï¼Œæ­£ç¢ºé¡¯ç¤ºä¸­æ–‡åç¨±ï¼ˆå¦‚ã€Œæ¯’åˆº + æ¯’å›Šã€ï¼‰

### èª¿æ•´

#### æ‰‹æ©Ÿ UI
- **æ‰‹æ©Ÿç‰ˆé¦–é  TOP10 æŽ’è¡Œæ¦œç¸®å°ç‚º 55%**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ‰‹æ©Ÿè£ç½®ä¸‹ TOP10 æµ®çª—å¥—ç”¨ `scale(0.55)` CSS ç¸®æ”¾ï¼ˆåŽŸ `scale(0.7)`ï¼‰ï¼Œ`transform-origin` æ”¹ç‚º `top right`ï¼Œ`top` æ”¹ç‚º `16px`ï¼Œç¢ºä¿æµ®çª—å¾žå³ä¸Šè§’ç¸®æ”¾ä¸è¶…å‡ºç•«é¢

---

## v0.34.0 - 2026-05-21

### ä¿®å¾©

#### Bug ä¿®å¾©
- **æ¯’å›Šç¹¼æ‰¿ Bug**ï¼ˆ`systems/evolution.js`ï¼‰ï¼š`buildSkillTreeOverlay` çš„å™¨å®˜ç¹¼æ‰¿é¸å–®ç¾åœ¨æ­£ç¢ºéŽæ¿¾ `noInherit: true` çš„å™¨å®˜ï¼ˆæ¯’å›Šï¼‰ï¼Œä½¿å…¶ä¸å†å‡ºç¾æ–¼ç¹¼æ‰¿é¸æ“‡æ¸…å–®
- **å†ä¾†ä¸€å ´â†’æŠ€èƒ½æ¨¹â†’é–‹å§‹éŠæˆ² ç„¡æ³•ç§»å‹• Bug**ï¼ˆ`main.js`ï¼‰ï¼š`initializeGame()` é–‹é ­æ–°å¢žå®Œæ•´ç‹€æ…‹é‡è¨­å€å¡Šï¼Œç¢ºä¿ `gameState.gameOver`ã€`skillTreeOpen`ã€`organSelectionActive` ç­‰æ——æ¨™åœ¨é‡æ–°éŠæˆ²æ™‚æ­¸é›¶ï¼Œä¿®å¾© `isGamePaused()` èª¤å›žå‚³ `true` å°Žè‡´çŽ©å®¶ç„¡æ³•ç§»å‹•çš„å•é¡Œ

#### UI ä¿®å¾©
- **å·¦ä¸‹è§’éš±è—å™¨å®˜æ¸…å–®è·‘ç‰ˆ**ï¼ˆ`systems/organs.js`ï¼‰ï¼šé‡æ§‹ `drawOrganUI()` çš„éš±è—å™¨å®˜ç¹ªè£½é‚è¼¯ï¼›åˆ†éš”è¡Œï¼ˆ`sepBase+1`ï¼‰å°ˆé–€ç¹ªè£½åˆ†éš”ç·šï¼Œå™¨å®˜åç¨±å¾ž `sepBase+2` é–‹å§‹ï¼Œhit region åŒæ­¥ä¿®æ­£ï¼Œç¢ºä¿æ‰€æœ‰æ–‡å­—åœ¨èƒŒæ™¯æ–¹å¡Šå…§æ­£ç¢ºé¡¯ç¤º

### èª¿æ•´

#### å™¨å®˜æ•¸å€¼
- **å¤§é•·è…¿**ï¼ˆ`config/organs.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼šå„ç´šç§»å‹•é€Ÿåº¦ +1.5 â†’ +1
- **å¼·å¤§çš„å¿ƒè‡Ÿ**ï¼ˆ`config/organs.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼šHPä¸Šé™+100 â†’ HPä¸Šé™+60

#### çµ„åˆæ•ˆæžœèª¿æ•´ï¼ˆ`config/organs.js`ã€`systems/organs.js`ã€`systems/combat.js`ï¼‰
- **ç§»é™¤**åŽŸæœ‰ä¸‰å™¨å®˜çµ„åˆï¼ˆèŸ¹é‰—+æ¯’åˆº+æ¯’å›Šï¼‰
- **æ–°å¢ž** `comboCrabPoison`ï¼šæ¯’åˆºLv3 + æ“æœ‰æ¯’å›Šå³è§¸ç™¼ â†’ æ¯’å‚·ç¿»å€
- **æ–°å¢ž** `comboCrabGloves`ï¼šèŸ¹é‰—+ææ“Šæ‹³å¥—å„é”Lv3 â†’ æµè¡€å‚·å®³ç¿»å€ã€å‘½ä¸­æ–½åŠ å›žå¾©é‡-50%
- `gameState.player` æ–°å¢ž `comboCrabGloves` æ——æ¨™ï¼›`checkComboEffects()` å° `comboCrabPoison` æŽ¡ç”¨ç‰¹æ®Šåˆ¤æ–·é‚è¼¯

#### éˆæ•çŸ¥è¦ºé‡è¨­è¨ˆï¼ˆ`config/organs.js`ã€`systems/ui.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼‰
- Lv1ï¼šç¶­æŒé¡¯ç¤ºæžœå­æœ€ä½³è·¯å¾‘ï¼ˆç´…ç·šï¼Œ1000px åµæ¸¬ç¯„åœï¼‰
- Lv2ï¼šæ–°å¢žè¿½è¹¤æœ€è¿‘å±é«”ï¼ˆé»ƒç·šï¼‰ï¼Œä½¿ç”¨ `wrappedDistance` è¨ˆç®—æœ€è¿‘ç›®æ¨™
- Lv3ï¼šæ–°å¢žè¿½è¹¤æœ€è¿‘ç™½éª¨ï¼ˆç™½ç·šï¼‰ï¼ŒåŒä¸Šé‚è¼¯
- ä¸‰æ¢ç·šå¯ç´¯ç©åŒæ™‚é¡¯ç¤ºï¼›`perceptionRange` ç¶­æŒ 1000px ä¸å†éš¨ç­‰ç´šå¢žåŠ 

#### é¡é ­èˆ‡ç¸®æ”¾ï¼ˆ`systems/camera.js`ã€`systems/ui.js`ï¼‰
- é¡é ­é‚Šç•Œè§¸ç™¼è·é›¢ï¼š25% â†’ 30%ï¼ˆ`marginX/Y = VIEW_W/H * 0.30`ï¼‰
- æ‰‹æ©ŸéŠæˆ²ç¸®æ”¾æ¯”ä¾‹ï¼š`MOBILE_GAME_SCALE` 0.7 â†’ 0.6

### æ–°å¢ž

#### çµç®—ç•«é¢æŠ€èƒ½é»žæ˜Žç´°ï¼ˆ`systems/evolution.js`ã€`systems/boss.js`ã€`systems/gameState.js`ï¼‰
- `gameState.sessionSkillPoints = { elite: 0, boss: 0 }` è¿½è¹¤æœ¬å±€å„ä¾†æºæŠ€èƒ½é»ž
- `handleEliteKill` åœ¨æ“Šæ®ºç²¾è‹±å¾Œç´¯åŠ  `sessionSkillPoints.elite`
- æ­»äº¡/è¶…æ™‚çµç®—ç•«é¢ï¼šé¡¯ç¤ºç²¾è‹±çŽå‹µï¼ˆ`skillPtElite`ï¼‰ã€æ™‚é–“çŽå‹µã€ç­‰ç´šçŽå‹µæ˜Žç´°
- å‹åˆ©çµç®—ç•«é¢ï¼šé¡¯ç¤º Boss çŽå‹µï¼ˆ+5ï¼‰ã€ç²¾è‹±çŽå‹µã€æ™‚é–“çŽå‹µã€ç­‰ç´šçŽå‹µæ˜Žç´°ï¼›`sessionSkillPoints.boss = 5` åœ¨å‹åˆ©æ™‚è¨˜éŒ„

#### æ‰‹æ©Ÿé¦–é  TOP10 é¢æ¿ç¸®æ”¾ï¼ˆ`systems/ui.js`ï¼‰
- æ‰‹æ©Ÿè£ç½®ä¸‹ TOP10 æŽ’è¡Œæ¦œé¢æ¿å¥—ç”¨ `scale(0.7)` CSS ç¸®æ”¾ï¼Œ`transform-origin: right center`

### èªžè¨€æª”æ›´æ–°ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰
- å¤§é•·è…¿é€Ÿåº¦æè¿° +1.5 â†’ +1
- éˆæ•çŸ¥è¦º Lv2/Lv3 æè¿°æ›´æ–°ï¼ˆå±é«”é»ƒç·š / ç™½éª¨ç™½ç·šï¼‰
- å¼·å¤§çš„å¿ƒè‡Ÿæè¿° HP+100 â†’ HP+60
- `comboCrabPoison` æè¿°æ›´æ–°ï¼ˆæ¢ä»¶å¾žä¸‰å™¨å®˜æ”¹ç‚ºæ¯’åˆºLv3+æ¯’å›Šï¼‰
- æ–°å¢ž `comboCrabGloves` æè¿°

---

## v0.33.0 - 2026-05-21

### æ–°å¢ž

#### é¦–é ç«¥æ›¸æ•…äº‹ç³»çµ±ï¼ˆ`systems/ui.js`ã€`main.js`ï¼‰
- **é¦–é ç«¥æ›¸æ•…äº‹æŒ‰éˆ•**ï¼šé¦–é å·¦ä¸Šè§’æ–°å¢ž ðŸ“– åœ–ç¤ºæŒ‰éˆ•ï¼Œæš–é»ƒè‰²åŠé€æ˜Žè¨­è¨ˆï¼Œhover è¼•å¾®æ”¾å¤§ï¼Œé»žæ“Šè§¸ç™¼ `showGuideStory()`
- **å™ªé¹ƒç”Ÿå­˜è¨˜ Guide Story ç³»çµ±**ï¼šæ–°å¢ž `showGuideStory()` å’Œ `_getGuideStoryPages()`ï¼›ç«¥æ›¸é¢¨æ ¼ UIï¼ˆç±³é»ƒç´™è³ªèƒŒæ™¯ã€æ·±æ£•æ–‡å­—ï¼‰ï¼Œ4 é æ•…äº‹å„é™„ SVG å‹•ç•«æ’ç•«ï¼ˆç ´æ›‰ / å­¤å…’ / è›»è®Š / è©¦ç…‰ï¼‰ï¼Œç¿»é é€²åº¦é»žå°Žèˆªï¼Œé—œé–‰æŒ‰éˆ•ï¼Œæ‰‹æ©Ÿç‰ˆæ’ç•«ç¸®å°è‡³ 140px
- **First Time Player åˆ¤æ–·**ï¼š`window.onload` æ”¹ç‚ºæª¢æŸ¥ `localStorage.hasPlayedBefore`ï¼›é¦–æ¬¡çŽ©å®¶è‡ªå‹•å½ˆå‡º Guide Storyï¼›`initializeGame()` é–‹é ­èˆ‡ Guide æœ€å¾Œä¸€é ã€Œé–‹å§‹å†’éšªã€å‡å¯«å…¥æ¨™è¨˜

---

## v0.32.1 - 2026-05-20

### ä¿®å¾©

#### æ¯’åˆº Bug ä¿®å¾©ï¼ˆ`systems/combat.js`ï¼‰
- **Bug 1 â€” æ¯’è¨ˆæ™‚å™¨è¢«é‡ç½®**ï¼š`playerAttack()` çš„æ¯’åˆºé‚è¼¯æ”¹ç‚ºåªåœ¨æ•µäººæœªä¸­æ¯’æ™‚æ‰åˆå§‹åŒ– `lastPoisonTick`ï¼›é‡è¤‡æ”»æ“Šä¸é‡ç½®è¨ˆæ™‚å™¨ï¼Œç¢ºä¿æ¯’å‚·æ¯ç§’æ­£å¸¸ tick
- **`updateStatusEffects()` æ¯’å‚· tick**ï¼š`c.lastPoisonTick = now` æ”¹ç‚º `c.lastPoisonTick += 1000`ï¼Œé¿å…èª¤å·®ç´¯ç©å°Žè‡´æ¯’å‚·ä¸­æ–·
- **Bug 2 â€” åªæœ‰æ¯’åˆºæ²’æœ‰æ”»æ“ŠåŠ›æ™‚ç„¡æ³•æ”»æ“Š**ï¼šæ””æˆªæ¢ä»¶æ”¹ç‚ºåŒæ™‚åˆ¤æ–· `p.attack <= 0 && !hasPoison`ï¼ˆ`poisonStinger > 0` æˆ– `poisonSac.level > 0`ï¼‰ï¼Œæœ‰æ¯’æ€§å™¨å®˜æ™‚å¯æ­£å¸¸è§¸ç™¼æ”»æ“Š

### èª¿æ•´

#### æŠ€èƒ½æ¨¹å¹³è¡¡ï¼ˆ`config/evolution.js`ã€`systems/evolution.js`ï¼‰
- **è¨˜æ†¶å™¨å®˜**ï¼šæ­»äº¡ä¿ç•™å™¨å®˜æ•¸æ”¹ç‚ºé è¨­ 0 å€‹ï¼ˆåŽŸé è¨­ 1 å€‹ï¼‰ï¼›Lv1=1å€‹ï¼ŒLv2=2å€‹ï¼ŒLv3=3å€‹ï¼›`organsToKeep` å…¬å¼æ”¹ç‚º `gameState.playerSkills.organMemory || 0`
- **ææ€–ä¹‹ç‰™**ï¼šLv3 é–‹å±€å¼·åˆ¶è¨­å®šç ç‰™ Lv1ï¼›Lv5 é–‹å±€å¼·åˆ¶è¨­å®šç ç‰™ Lv2ï¼ˆè¦†è“‹ Lv3 æ•ˆæžœï¼‰ï¼›æ–°å¢ž `_setFangLevel(targetLv)` å·¥å…·å‡½å¼ï¼Œæ”¯æ´å‡ç´šå·²ç¹¼æ‰¿çš„ç ç‰™å™¨å®˜
- **æ”¶é›†æˆç™®**ï¼šæè¿°æ›´æ–°ç‚ºã€Œæ”¶é›†ç¯„åœ+10pxï¼ˆæžœå­ã€å±é«”å’Œç™½éª¨ï¼Œæ¯ç´šï¼‰ã€ï¼ˆç™½éª¨åžå™¬è·é›¢å·²ä½¿ç”¨ `p.pickupRange`ï¼Œæ­¤ç‚ºæè¿°ä¿®æ­£ï¼‰

#### èªžè¨€åŒ…æ›´æ–°ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰
- åŒæ­¥æ›´æ–° `organMemory`ã€`terribleFang`ã€`collectionAddiction` çš„æŠ€èƒ½æè¿°æ–‡å­—

---

## v0.32.0 - 2026-05-20

### æ–°å¢ž / ä¿®æ”¹

#### æŠ€èƒ½é»žç³»çµ±é‡æ•´

- **ç§»é™¤** æ­»äº¡/å‹åˆ©å¾Œå›ºå®šçµ¦ 1 æŠ€èƒ½é»žçš„é‚è¼¯ï¼ˆ`showSkillTree`ã€`showVictory`ï¼‰
- **ç²¾è‹±æ€ªæ“Šæ®º**ï¼ˆ`systems/organs.js` `handleEliteKill`ï¼‰ï¼šä¾å¤œæ™šç·¨è™Ÿçµ¦é»žï¼šç¬¬1å¤œ +1ã€ç¬¬2å¤œ +2ã€ç¬¬3å¤œ +3
- **Bossæ“Šæ®º**ï¼ˆ`systems/boss.js` `showVictory`ï¼‰ï¼š+5æŠ€èƒ½é»ž
- **æ™‚é–“çŽå‹µ**ï¼ˆæ­»äº¡/å‹åˆ©çµç®—æ™‚ï¼‰ï¼š`Math.floor((600 - timeRemaining) / 180)`ï¼Œæœ€å¤š3é»ž
- **ç­‰ç´šçŽå‹µ**ï¼ˆæ­»äº¡/å‹åˆ©çµç®—æ™‚ï¼‰ï¼š`Math.floor(player.level / 6)`
- çµç®—ç•«é¢é¡¯ç¤ºæœ¬å±€æŠ€èƒ½é»žæ˜Žç´°ï¼ˆæ™‚é–“/ç­‰ç´š/BossçŽå‹µï¼‰

#### æŠ€èƒ½å‡ç´šè²»ç”¨æ”¹ç‚ºéšŽæ¢¯å¼ï¼ˆ`systems/evolution.js` `upgradeSkill`ï¼‰
- Lv1è²»1é»žã€Lv2è²»2é»žã€Lv3è²»3é»žã€Lv4è²»4é»žã€Lv5è²»5é»ž
- æŠ€èƒ½æ¨¹æŒ‰éˆ•å‹•æ…‹é¡¯ç¤ºã€Œå‡ç´šï¼ˆè²»Né»žï¼‰ã€ï¼Œé»žæ•¸ä¸è¶³æ™‚æŒ‰éˆ•è®Šç°

#### å…¶ä»–
- `SAVE_VERSION` 1.0 â†’ 1.1ï¼ˆè‡ªå‹•æ¸…é™¤èˆŠæŠ€èƒ½é»žå­˜æª”ï¼‰
- èªžè¨€ keyï¼š`upgradeCost1` â†’ `upgradeCostN`ï¼ˆå« `{n}` å ä½ç¬¦ï¼‰ï¼›æ–°å¢ž `skillPtTime`ã€`skillPtLevel`ã€`skillPtElite`ã€`skillPtBoss`

---

## v0.31.1 - 2026-05-20

### ä¿®å¾©

- **é‡æ•´çµç®—ç•«é¢æŒ‰éˆ•æµç¨‹**ï¼ˆ`systems/boss.js`ã€`systems/evolution.js`ï¼‰
  - å‹åˆ©å’Œæ­»äº¡çµç®—ç•«é¢çµ±ä¸€é¡¯ç¤º 3 å€‹æŒ‰éˆ•ï¼šã€Œå‰å¾€æŠ€èƒ½æ¨¹ã€ã€ŒðŸ  å›žåˆ°é¦–é ã€ã€Œâš”ï¸ å†ä¾†ä¸€å ´ã€
  - ã€Œå‰å¾€æŠ€èƒ½æ¨¹ã€â†’ `buildSkillTreeOverlay(mode='postGame')`ï¼Œåº•éƒ¨é¡¯ç¤ºã€ŒðŸ  å›žåˆ°é¦–é ã€+ã€Œâš”ï¸ å†ä¾†ä¸€å ´ã€ï¼Œç›´æŽ¥åŸ·è¡Œç„¡è­¦å‘Š
  - ã€ŒðŸ  å›žåˆ°é¦–é ã€ï¼ˆå¾žçµç®—ç•«é¢ï¼‰â†’ warn-once æç¤ºï¼Œå†æŒ‰ä¸€æ¬¡ç¢ºèªè¿”å›žé¦–é 
  - ã€Œâš”ï¸ å†ä¾†ä¸€å ´ã€ï¼ˆå¾žçµç®—ç•«é¢ï¼‰â†’ å¼·åˆ¶é€²å…¥ `buildSkillTreeOverlay(mode='forceStart')`ï¼Œåº•éƒ¨åªé¡¯ç¤ºã€Œâ–¶ é–‹å§‹éŠæˆ²ã€
  - `buildSkillTreeOverlay` æ–°å¢ž `mode` åƒæ•¸ï¼ˆ`postGame` / `forceStart` / `fromHome`ï¼‰ï¼Œé€éŽ `_skillTreeMode` å…¨åŸŸè®Šæ•¸åœ¨ reset / upgrade æ™‚æ­£ç¢ºä¿ç•™æ¨¡å¼
  - ç§»é™¤ `gameState.homeWarned`ã€`gameState.playAgainWarned`ï¼ˆæ”¹ç‚ºçµç®— overlay å…§çš„ local è®Šæ•¸ï¼‰
  - ç§»é™¤ `btnSaveAndHome`ã€`warnNoOrganLine1`ã€`warnNoOrganLine2`ã€`warnNoOrganPlay` èªžè¨€ key

---

## v0.31.0 - 2026-05-20

### æ–°å¢ž

#### é€²åŒ–ç³»çµ±æ“´å±•è‡³ Lv5ï¼ˆ`config/evolution.js`ã€`systems/evolution.js`ï¼‰
- è‰é£Ÿæ€§ã€è‚‰é£Ÿæ€§ã€é›œé£Ÿæ€§ä¸‰æ¢è·¯ç·šå„å¾ž Lv3 æ“´å±•è‡³ Lv5
- è‰é£Ÿæ€§ Lv4/5ï¼šå¢žåŠ é«”åž‹ï¼ˆ`radiusPercent`ï¼‰+ ä¸­ç«‹ç”Ÿç‰©å®Œå…¨å‹å–„ï¼ˆ`friendly: true`ï¼‰
- è‚‰é£Ÿæ€§ Lv4/5ï¼šæ”»æ“ŠåŠ›æŒçºŒå¢žåŠ ï¼Œæ”»é€Ÿç´¯ç©åŠ æˆï¼ˆ`attackSpeedBonusAdd` æœ€é«˜ +30%ï¼‰
- é›œé£Ÿæ€§ Lv1~5ï¼šæ”¹ç‚ºé€Ÿåº¦åŠ æˆ + ç™½éª¨ç³»çµ±æ•´åˆï¼Œç§»é™¤èˆŠç‰ˆæžœå­/å±é«” XP åŠ æˆ
- è‚‰é£Ÿæ€§ä¸å†éœ€è¦è‰é£Ÿæ€§å‰ç½®ï¼›é›œé£Ÿæ€§éœ€è‰é£Ÿ â‰¥1 ä¸”è‚‰é£Ÿ â‰¥1
- é›œé£Ÿæ€§ Lv1 è‡ªå‹•æŽˆäºˆæ¯’å›Šå™¨å®˜ï¼ˆ`_grantPoisonSac`ï¼‰

#### å™¨å®˜ç³»çµ±å¤§æ”¹ï¼ˆ`config/organs.js`ã€`systems/organs.js`ï¼‰
- é‡å¯«æ‰€æœ‰å™¨å®˜æ•¸å€¼ä»¥ç¬¦åˆå¯¦éš›å¹³è¡¡è¨­è¨ˆ
  - èŸ¹é‰—ï¼šæµè¡€æŒçºŒæ™‚é–“ 10 ç§’ã€æ¯ç§’å‚·æå‡
  - ææ“Šæ‹³å¥—ï¼šæ”»é€Ÿæ”¹ç‚º 10%/15%/15%ï¼ˆéžç´¯ä¹˜ï¼‰
  - æ¯’åˆºï¼šç§»é™¤ Lv1 æ”»æ“ŠåŠ æˆï¼Œæ”¹ç‚ºç´”ä¸­æ¯’å‚·å®³
  - å¤§é•·è…¿ï¼šæ¯ç´š +1.5 é€Ÿåº¦ï¼ˆåŽŸ +0.5ï¼‰
  - é¾œæ®¼ï¼šæ¯ç´š -10% å‚·å®³ -1 é€Ÿåº¦ï¼ˆçµ±ä¸€ï¼‰
  - åŽšçš®ï¼šHP 20/30/50ï¼ŒåŠå¾‘åŠ æˆåªåœ¨ Lv2/3
  - åˆºç”²ï¼šæ”¹ç‚ºã€Œåå½ˆæœ€å¤§HPç™¾åˆ†æ¯”ã€ï¼Œæ¯ç´š +5%ï¼ˆæœ€é«˜ 15%ï¼‰
  - çœŸè¦–ä¹‹çœ¼ï¼šLv1 åªåŠ æš´æ“ŠçŽ‡ï¼Œä¸åŠ æš´æ“Šå€æ•¸
  - éˆæ•çŸ¥è¦ºï¼šå®Œå…¨æ”¹ç‰ˆç‚ºã€Œåµæ¸¬ç¯„åœå…§æžœå­ä¸¦é¡¯ç¤ºæœ€ä½³æŽ¡é›†è·¯å¾‘ã€
  - è¶…è‡ªç„¶å›žå¾©ï¼šLv2/3 æ–°å¢žå›žå¾©æœ€å¤§HP 0.5%
- æ–°å¢žç‰¹æ®Šå™¨å®˜ **æ¯’å›Š**ï¼ˆ`poisonSac`ï¼‰ï¼š`noSelection: true, noInherit: true`ï¼Œ10 å€‹ç­‰ç´šï¼Œé€éŽç™½éª¨ç´ é–€æª»è‡ªå‹•å‡ç´š
- æ–°å¢žéš±è—å™¨å®˜ **å¼·å¤§çš„çœ¼ç›**ï¼ˆ`strongEye`ï¼‰ï¼šæš´æ“ŠçŽ‡+10%ã€æš´æ“Šå‚·å®³+0.25ã€é«”åž‹+20%
- æ‰€æœ‰çµ„åˆæ•ˆæžœï¼ˆCOMBOSï¼‰æ”¹ç‚ºã€Œå…©/ä¸‰æ–¹å™¨å®˜å„é” Lv3 æ‰è§¸ç™¼ã€
- èŸ¹æ¯’çµ„åˆæ”¹ç‚ºä¸‰æ–¹ï¼šèŸ¹é‰— + æ¯’åˆº + æ¯’å›Š

#### ç™½éª¨ç³»çµ±ï¼ˆ`systems/combat.js`ã€`systems/ui.js`ï¼‰
- å±é«”è¶…éŽ 60 ç§’è‡ªå‹•è½‰åŒ–ç‚ºç™½éª¨ï¼›è¢«åƒæŽ‰çš„å±é«”ä¹Ÿç”Ÿæˆç™½éª¨
- é›œé£Ÿæ€§çŽ©å®¶å¯åžå™¬ç™½éª¨ï¼ˆæœ‰æ™‚é–“é€²åº¦æ¢ï¼‰ï¼Œåžå™¬å¾Œå¢žåŠ ç™½éª¨ç´ ï¼ˆ`boneMaterial`ï¼‰
- ç™½éª¨ç´ ç´¯ç©é”é–€æª»æ™‚è‡ªå‹•å‡ç´šæ¯’å›Šï¼ˆ10 å€‹é–€æª»ï¼š5/10/20/40/60/100/120/140/160/200ï¼‰
- ç™½éª¨ä»¥ç™½è‰²åœ“å½¢é¡¯ç¤ºåœ¨åœ°åœ–ä¸Šï¼Œå¸¶åžå™¬é€²åº¦æ¢

#### éˆæ•çŸ¥è¦ºç®—æ³•ï¼ˆ`systems/player.js`ï¼‰
- æ–°å‡½å¼ `findBestPerceptionPath(player, fruits, detectionRange)`
- ä»¥å€™é¸è§’åº¦ Â±5Â° å®¹å·®çª—å£ç¯©é¸æžœå­ï¼Œè¨ˆç®—æ•ˆçŽ‡ï¼ˆè·é›¢/æ•¸é‡ï¼‰ï¼Œè¿”å›žæœ€ä½³è·¯å¾‘ç«¯é»ž
- ç¹ªè£½ç´…è‰²è™›ç·šæŒ‡å‘æœ€ä½³ç›®æ¨™ + ç›®æ¨™æžœå­é–ƒçˆé»ž

#### å¤§è…¦å……èƒ½æ¢èˆ‡è¡æ“Šæ³¢ï¼ˆ`systems/ui.js`ï¼‰
- å¤§è…¦æ¿€æ´»æ™‚åœ¨çŽ©å®¶ä¸‹æ–¹ç¹ªè£½ 4px è—è‰²å……èƒ½æ¢ï¼ˆ`#4488FF`ï¼‰
- å¤§è…¦è§¸ç™¼æ™‚æŽ¨å…¥ `gameState.brainShockwaves[]`ï¼Œç¹ªè£½æ“´å¼µè¡æ“Šæ³¢åœ“ç’°ï¼ˆ600msï¼Œæ·¡å‡ºï¼‰

#### åœ–é‘‘ç³»çµ±ï¼ˆ`systems/ui.js`ã€`main.js`ï¼‰
- é¦–é ã€ŒéŠæˆ²èªªæ˜Žã€æŒ‰éˆ•æ”¹ç‚ºã€ŒðŸ“– åœ–é‘‘ã€ï¼Œå‘¼å« `showCompendium('guide')`
- éŠæˆ²å…§å³ä¸Šè§’æ–°å¢ž ðŸ“– åœ–é‘‘æŒ‰éˆ•ï¼ˆ`_drawCompendiumBtn`ï¼‰ï¼Œé»žæ“Šé–‹å•Ÿå™¨å®˜é 
- `showCompendium(startTab)` ä¸‰åˆ†é ï¼šéŠæˆ²èªªæ˜Ž / å™¨å®˜åœ–é‘‘ / é€²åŒ–ç³»çµ±
- å™¨å®˜é åˆ—å‡ºæ‰€æœ‰æ™®é€šå™¨å®˜ + éš±è—å™¨å®˜ + æ¯’å›Šèªªæ˜Ž + çµ„åˆæ•ˆæžœ
- é€²åŒ–é åˆ—å‡ºä¸‰æ¢è·¯ç·š Lv1~5 è©³ç´°èªªæ˜Ž
- é–‹å•Ÿæ™‚æš«åœéŠæˆ²ï¼ˆ`organSelectionActive = true`ï¼‰ï¼Œé—œé–‰æ™‚æ¢å¾©

#### gameState æ›´æ–°ï¼ˆ`systems/gameState.js`ï¼‰
- `critMultiplier` åˆå§‹å€¼æ”¹ç‚º `1.5`
- æ–°å¢ž `player.boneMaterial: 0`ã€`player.perceptionRange: 0`ã€`player.naturalRegenHpMaxPercent: 0`
- æ–°å¢žé™£åˆ— `gameState.bones: []`ã€`gameState.brainShockwaves: []`

#### èªžè¨€åŒ…æ›´æ–°ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰
- æ–°å¢ž `compendium`ã€`compendiumTitle`ã€`compendiumTabGuide/Organs/Evo`
- æ–°å¢ž `compendiumSacHint`ã€`compendiumHiddenOrgans`ã€`compendiumCombos`
- æ–°å¢ž `boneMaterialFloat` æµ®å‹•æ–‡å­—
- æ›´æ–°æ‰€æœ‰å™¨å®˜æè¿°ä»¥åæ˜ æ–°æ•¸å€¼
- æ›´æ–°é€²åŒ–è·¯ç·šæè¿°ï¼ŒåŠ å…¥ Lv4/5
- æ›´æ–° `guideEvo4`ï¼šæ¯æ¢è·¯ç·šæœ€é«˜ 5 ç´š
- æ›´æ–°é€²åŒ–ç³»çµ±èªªæ˜Žé ï¼ŒåŠ å…¥ç™½éª¨ç³»çµ±ä»‹ç´¹
- æ–°å¢žéš±è—å™¨å®˜ `strongEye` æè¿°

---

## v0.30.2 - 2026-05-20

### ä¿®å¾©
- **æ‰‹æ©Ÿç‰ˆå™¨å®˜ tooltip ç„¡æ³•è§¸ç™¼**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`onStart` handler åœ¨ç¢ºèªè§¸é»žè½åœ¨ `gameCanvas` å¾Œï¼Œæ›ç®— canvas å…§éƒ¨åº§æ¨™ä¸¦æ¯”å° `_organHitRegions`ï¼Œå‘½ä¸­æ™‚å‘¼å« `showTooltip()` ä¸¦ä»¥ `setTimeout 500ms` è‡ªå‹• `hideTooltip()`ï¼Œç„¶å¾Œ `continue` ä¸å•Ÿå‹•æ–æ¡¿ï¼Œä¿®å¾©å…¨èž¢å¹•æ¨¡å¼ä¸‹å·¦ä¸‹è§’å™¨å®˜å€åŸŸè§¸ç¢°ç„¡æ³•é¡¯ç¤º tooltip çš„å•é¡Œ

---

## v0.30.1 - 2026-05-20

### ä¿®å¾©
- **å…¨èž¢å¹•æ–æ¡¿æ””æˆª HTML UI é»žæ“Š**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`_attachJoystickListeners()` çš„ `onStart` handler åœ¨ for è¿´åœˆé–‹é ­ä»¥ `document.elementFromPoint()` åˆ¤æ–·è§¸é»žç›®æ¨™ï¼Œè‹¥ä¸æ˜¯ `gameCanvas` æˆ– `joystick-canvas` å‰‡ `continue`ï¼Œç¢ºä¿é½’è¼ªã€å°åœ°åœ–ã€overlay æŒ‰éˆ•ç­‰ HTML UI å…ƒç´ çš„ touch äº‹ä»¶ä¸è¢«æ–æ¡¿é‚è¼¯æ””æˆªï¼Œä¿®å¾©å…¨èž¢å¹•æ¨¡å¼ä¸‹æŒ‰éˆ•ç„¡æ³•é»žæ“Šçš„å•é¡Œ

---

## v0.30.0 - 2026-05-19

### æ–°å¢ž
- **å…¨èž¢å¹•ç§»å‹•å€åŸŸ**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`_joyZone()` æ”¹ç‚º `!_attackZone(x, y)`ï¼Œæ‰‹æ©Ÿç‰ˆéžæ”»æ“Šå€çš„ä»»æ„ä½ç½®å‡å¯ä½œç‚ºæ–æ¡¿èµ·å§‹é»ž
- **æ”»æ“Šå€é‡æ§‹ç‚ºå³ä¸‹è§’çŸ©å½¢**ï¼ˆ`systems/ui.js`ï¼‰ï¼šç›´å‘ç‚ºå³50%Ã—ä¸‹25%ã€æ©«å‘ç‚ºå³25%Ã—ä¸‹50%ï¼›`_getAttackBtnPos()` å›žå‚³çŸ©å½¢æ­£ä¸­å¿ƒï¼›è¦–è¦ºæ”¹ç‚º âš”ï¸ ç½®ä¸­ã€é€æ˜Žåº¦ 0.2ã€ç„¡é‚Šæ¡†
- **è‡ªå‹•æ”»æ“ŠåŠŸèƒ½**ï¼ˆ`systems/gameState.js`ã€`systems/ui.js`ã€`main.js`ã€`systems/input.js`ï¼‰ï¼š`DEFAULT_SETTINGS` æ–°å¢ž `autoAttack: false`ï¼›éŠæˆ²ä¸»è¿´åœˆæ¯å¹€åµæ¸¬æ¢ä»¶è‡ªå‹•å‘¼å« `playerAttack()`ï¼›`Z` éµå¯å³æ™‚åˆ‡æ›ä¸¦å­˜æª”
- **è¨­å®šä»‹é¢è¼”åŠ©åŠŸèƒ½å€å¡Š**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæŒ‰éµè¨­å®šç¸®è‡³65%å¯¬ï¼Œæ—é‚Šæ–°å¢ž35%ã€Œè¼”åŠ©åŠŸèƒ½ã€å€å¡Šï¼Œå…§å«è‡ªå‹•æ”»æ“Š ON/OFF toggleï¼›é›»è…¦ç‰ˆé¡¯ç¤ºã€ŒZ éµåˆ‡æ›ã€æç¤º
- **âš”ï¸ è‡ªå‹•æŒ‡ç¤ºå™¨**ï¼ˆ`systems/ui.js`ï¼‰ï¼šè‡ªå‹•æ”»æ“Šé–‹å•Ÿæ™‚ï¼Œæ‰‹æ©Ÿç‰ˆåœ¨æ”»æ“Šå€ä¸­å¿ƒé¡¯ç¤ºã€Œâš”ï¸ è‡ªå‹•ã€32pxï¼›é›»è…¦ç‰ˆåœ¨ç•«å¸ƒæ­£ä¸­å¤®é¡¯ç¤ºã€Œâš”ï¸ è‡ªå‹•ã€100pxï¼›é€æ˜Žåº¦å‡ç‚º 0.2
- **éŠæˆ²èªªæ˜Žç¬¬ä¸€é æ›´æ–°**ï¼ˆ`systems/ui.js`ï¼‰ï¼šé›»è…¦ç‰ˆåŠ å…¥è‡ªå‹•æ”»æ“Šèªªæ˜Žï¼›æ‰‹æ©Ÿç‰ˆå·¦æ¬„æ›´æ–°ç§»å‹•/æ”»æ“Šèªªæ˜Žä¸¦åŠ å…¥è‡ªå‹•æ”»æ“Šï¼Œå³æ¬„æ”¹ç‚º SVG æ‰‹æ©Ÿç¤ºæ„åœ–ï¼ˆç§»å‹•å€/æ”»æ“Šå€ï¼Œæ”¯æ´ä¸­è‹±æ–‡ï¼‰
- **èªžè¨€ key æ–°å¢ž**ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼š`sectionAccessibility`ã€`autoAttack`ã€`autoAttackHint`ã€`guideAutoAttack`ã€`guideMobileMove2`ã€`guideMobileAttackZone`

---

## v0.29.5 - 2026-05-19

### ä¿®å¾©
- **minimap-playtime æ”¹ç‚ºç·Šè²¼ç”Ÿæ…‹é¡¯ç¤º**ï¼ˆ`index.html`ï¼‰ï¼š`#minimap-info` çš„ `justify-content` å¾ž `space-between` æ”¹ç‚º `flex-start`ï¼Œä½¿ç”Ÿæ…‹ç³»èˆ‡éŠçŽ©æ™‚é–“ç·Šé å·¦å´ï¼›å³å´æ™‚é–“ span åŠ ä¸Š `margin-left:auto` ç¶­æŒé å³å°é½Š

---

## v0.29.4 - 2026-05-19

### ä¿®å¾©
- **minimap éŠçŽ©æ™‚é–“é¡¯ç¤ºæ”¹ç‚ºå³æ™‚ç´¯åŠ **ï¼ˆ`systems/ui.js`ï¼‰ï¼š`rpt` è¨ˆç®—å¾žç´”è®€ `gameState.realPlayTime` æ”¹ç‚ºåŠ ä¸Š `Date.now() - _playTimerStart` çš„ç•¶å‰å€æ®µæ™‚é–“ï¼Œä½¿å°åœ°åœ–è¨ˆæ™‚å™¨æ¯å¹€å³æ™‚æ›´æ–°è€Œéžåªåœ¨æš«åœ/ç¹¼çºŒæ™‚æ‰è·³å‹•

---

## v0.29.3 - 2026-05-19

### ä¿®å¾©
- **resumePlayTimer åˆå§‹æ¢ä»¶å°Žè‡´è¨ˆæ™‚å™¨æœªå•Ÿå‹•**ï¼ˆ`main.js`ï¼‰ï¼šç§»é™¤ `if (gameState._playTimerPaused)` æ¢ä»¶åˆ¤æ–·ï¼Œæ”¹ç‚ºç„¡æ¢ä»¶è¨­å®š `_playTimerStart`ï¼Œä¿®å¾©éŠæˆ²é–‹å§‹æ™‚è¨ˆæ™‚å™¨å›  `_playTimerPaused` åˆå§‹å€¼ç‚º `false` è€Œæœªå•Ÿå‹•çš„å•é¡Œ

---

## v0.29.2 - 2026-05-19

### æ–°å¢ž
- **å°åœ°åœ–çœŸå¯¦éŠçŽ©æ™‚é–“é¡¯ç¤º**ï¼ˆ`index.html`ã€`systems/ui.js`ï¼‰ï¼šåœ¨å°åœ°åœ– `#minimap-info` çš„ç”Ÿæ…‹ç³» span å¾Œæ–°å¢ž `#minimap-playtime`ï¼Œæ¯å¹€å°‡ `gameState.realPlayTime`ï¼ˆæ¯«ç§’ï¼‰æ›ç®—ç‚º `mm:ss` æ ¼å¼å³æ™‚é¡¯ç¤ºæ–¼å°åœ°åœ–è³‡è¨Šæ¬„

---

## v0.29.1 - 2026-05-19

### ä¿®æ”¹
- **æŽ’è¡Œæ¦œæŸ¥è©¢èˆ‡åˆ†é é‡æ§‹**ï¼ˆ`config/supabase.js`ã€`systems/ui.js`ã€`index.html`ï¼‰ï¼šæ‹†åˆ†åŽŸæœ¬ `fetchLeaderboard` ç‚º `fetchVictoryRecords()`ï¼ˆå‹åˆ©ï¼Œæœ€å¤š 100 ç­†ï¼ŒæŒ‰ version_order.desc / play_time.asc / boss_kill_time.asc æŽ’åºï¼‰èˆ‡ `fetchDefeatRecords(limit)`ï¼ˆå¤±æ•—ï¼ŒæŒ‰ version_order.desc / play_time.desc / score.desc æŽ’åºï¼‰ï¼›æŽ’è¡Œæ¦œé–‹å•Ÿæ™‚å…ˆæŠ“å‹åˆ©è¨˜éŒ„ï¼Œè¨ˆç®—å‰©é¤˜åé¡å†æŠ“å¤±æ•—è¨˜éŒ„ï¼Œåˆä½µå¾Œå­˜å…¥ `allRows`ï¼›`loadPage` æ”¹ç‚ºç´”å‰ç«¯åˆ‡ç‰‡åˆ†é ï¼Œç„¡ç¿»é  network requestï¼›`index.html` fallback åŒæ­¥æ›´æ–°

---

## v0.29.0 - 2026-05-19

### æ–°å¢ž
- **çœŸå¯¦éŠçŽ©æ™‚é–“è¨ˆæ™‚ç³»çµ±**ï¼ˆ`main.js`ã€`systems/gameState.js`ã€`systems/organs.js`ã€`systems/evolution.js`ã€`systems/boss.js`ã€`systems/ui.js`ï¼‰ï¼šæ–°å¢ž `realPlayTime`ã€`_playTimerStart`ã€`_playTimerPaused` ä¸‰å€‹æ¬„ä½è‡³ `gameState`ï¼›æ–°å¢žå…¨åŸŸå‡½å¼ `pausePlayTimer()` / `resumePlayTimer()`ï¼›`gameLoop` æ¯å¹€é€éŽ `_wasPaused` åµæ¸¬æš«åœç‹€æ…‹åˆ‡æ›ä¸¦è‡ªå‹•å‘¼å«å°æ‡‰å‡½å¼ï¼›`handleEliteKill` é–‹é ­/çµå°¾å„å‘¼å« `pausePlayTimer()` / `resumePlayTimer()` ä»¥æŽ’é™¤ç²¾è‹±æ€ªæ“Šæ®ºè·³å¤©çš„æ™‚é–“ï¼›`showSkillTree` èˆ‡ `showVictory` çµæŸæ™‚å‘¼å« `pausePlayTimer()` å®šæ ¼æœ€çµ‚æ™‚é–“ï¼›æŽ’è¡Œæ¦œä¸Šå‚³çš„ `play_time` æ”¹ç”¨ `realPlayTime / 1000`ï¼ˆç§’ï¼‰ï¼ŒæŽ’é™¤æ‰€æœ‰æš«åœä»‹é¢èˆ‡è·³å¤©æ™‚é–“

---

## v0.28.5 - 2026-05-19

### é‡æ§‹
- **æ‰‹æ©Ÿç«¯éŠæˆ²ç•«é¢ç¸®æ”¾ç³»çµ±é‡æ§‹**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ–°å¢ž `MOBILE_GAME_SCALE = 0.7` å¸¸æ•¸ï¼›æ‰‹æ©Ÿæ©«å‘é‚è¼¯è§£æžåº¦æ”¹ç‚º `1120Ã—630`ï¼ˆ1600Ã—900 Ã— 0.7ï¼‰ï¼Œæ‰‹æ©Ÿç›´å‘æ”¹ç‚º `630Ã—1120`ï¼ˆé•·çŸ­é‚Šå°èª¿ï¼‰ï¼Œscale çš†ä»¥ `vw / logicW` å¡«æ»¿èž¢å¹•å¯¬åº¦ï¼›ä¿®æ­£ `_setViewSize` å‘¼å«å¾žå¯«æ­» `900` æ”¹ç‚ºæ­£ç¢ºå‚³å…¥ `logicH`

---

## v0.28.4 - 2026-05-18

### ä¿®å¾©
- **æ­»äº¡å¾Œç„¡å™¨å®˜å»è¢«å¼·åˆ¶é€²å…¥å™¨å®˜ä¿ç•™ç•«é¢**ï¼ˆ`systems/evolution.js`ï¼‰ï¼š`buildSkillTreeOverlay` æ–°å¢žå™¨å®˜åˆ¤æ–·ï¼Œç•¶ `playerOrgans.length === 0 && hiddenOrgans.length === 0` æ™‚ç›´æŽ¥è·³éŽå™¨å®˜ä¿ç•™å€å¡Šï¼Œä¸é¡¯ç¤ºè©² sectionï¼›åŒæ™‚ä¿®æ­£ã€Œå›žé¦–é ã€æŒ‰éˆ•å¾žæ°¸é å°éŽ–æ”¹ç‚º warn-onceï¼ˆé¦–æ¬¡é»žæ“Šé¡¯ç¤ºç¢ºèªè­¦å‘Šï¼Œå†æŒ‰ä¸€æ¬¡æ‰è·³è½‰ï¼‰ï¼Œä¸¦æ–°å¢ž `gameState.homeWarned` æ——æ¨™ï¼›ã€Œå†çŽ©ä¸€å±€ã€æŒ‰éˆ•åŒæ­¥åŠ å…¥ `noOrgansToSelect` åˆ¤æ–·ï¼Œç„¡å™¨å®˜æ™‚ä¸è§¸ç™¼è­¦å‘Šç›´æŽ¥ç¹¼çºŒï¼›æ–°å¢žèªžè¨€ key `warnNoOrganHome`ï¼ˆä¸­è‹±æ–‡ï¼‰

---

## v0.28.3 - 2026-05-18

### ä¿®å¾©
- **åˆ†æ•¸ä¸Šå‚³ 400 éŒ¯èª¤**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`submitScore` å‚³å…¥çš„ `score`ã€`level`ã€`play_time`ã€`boss_kill_time`ã€`version_order` å…¨éƒ¨å¥—ç”¨ `Math.floor()`ï¼Œç¢ºä¿å‚³é€æ•´æ•¸è€Œéžæµ®é»žæ•¸ï¼Œé¿å… Supabase åž‹åˆ¥é©—è­‰å›žå‚³ 400

---

## v0.28.2 - 2026-05-18

### ä¿®å¾©
- **æ­»äº¡å¾Œä¸å‡ºç¾åˆ†æ•¸ä¸Šå‚³å½ˆçª—**ï¼ˆ`systems/evolution.js`ï¼‰ï¼š`showSkillTree()` åŽŸæœ¬ç›´æŽ¥å‘¼å« `buildSkillTreeOverlay(cause)`ï¼Œå®Œå…¨è·³éŽäº†åˆ†æ•¸æäº¤æµç¨‹ï¼›ä¿®å¾©ç‚ºå…ˆå‘¼å« `showScoreSubmitPopup(false, null, () => buildSkillTreeOverlay(cause))`ï¼Œèˆ‡å‹åˆ©ç•«é¢çš„æµç¨‹ä¸€è‡´ï¼›é–‹ç™¼è€…æ¨¡å¼ä¸‹ä»ç›´æŽ¥è·³éŽ

---

## v0.28.1 - 2026-05-18

### ä¿®å¾©
- **æ©«å‘æ‰‹æ©ŸæŽ’è¡Œæ¦œæŒ‰éˆ•è¢«å°Žèˆªåˆ—é®ä½**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæŽ’è¡Œæ¦œ overlay åœ¨é–‹å•Ÿæ™‚å‹•æ…‹è¨ˆç®—é«˜åº¦ï¼ˆè®€å– game-container çš„ scale å€¼ï¼Œä»¥ `window.innerHeight / scale` ç‚ºä¸Šé™ï¼‰ï¼Œç¢ºä¿ overlay ä¸è¶…å‡ºè¦–çª—ï¼›pagingBar æ”¹ç”¨ `padding-bottom: max(20px, env(safe-area-inset-bottom))`ï¼Œå…¼é¡§ iOS å®‰å…¨å€åŸŸï¼Œä¸¦åŠ å…¥ `flex-shrink:0` é˜²æ­¢è¢«å£“ç¸®

---

## v0.28.0 - 2026-05-18

### ä¿®å¾©
- **è±Žå‘æ‰‹æ©Ÿæ¨¡å¼é–‹å§‹ç•«é¢æœªç¸®æ”¾**ï¼ˆ`systems/ui.js`ã€`systems/evolution.js`ï¼‰ï¼š`showStartScreen()`ã€`showMapSelect()`ã€`showSettings()`ã€`showGuide()`ã€`showLeaderboard()`ã€`buildSkillTreeOverlay(fromHome/startAfter)` é–‹é ­å‡åŠ å…¥ `applyDeviceMode()`ï¼Œç¢ºä¿æ‰€æœ‰ç•«é¢éƒ½æ­£ç¢ºå¥—ç”¨æ‰‹æ©Ÿç¸®æ”¾
- **éžéŠæˆ²ç•«é¢å‡ºç¾è™›æ“¬æ–æ¡¿**ï¼ˆ`systems/gameState.js`ã€`main.js`ã€`systems/ui.js`ï¼‰ï¼šæ–°å¢ž `gameState.gameStarted` æ——æ¨™ï¼ˆé è¨­ `false`ï¼‰ï¼Œ`initializeGame()` æ™‚è¨­ç‚º `true`ï¼›`_joyPaused()` åŠ å…¥ `!gameState.gameStarted` åˆ¤æ–·ï¼Œé¦–é /æŠ€èƒ½æ¨¹/è¨­å®šç­‰ç•«é¢æ–æ¡¿ä¸å†å‡ºç¾
- **æŽ’è¡Œæ¦œè¢«æ–æ¡¿å±¤é®ä½ç„¡æ³•é»žæ“Š**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæŽ’è¡Œæ¦œ overlay z-index å¾ž 300 æå‡è‡³ 500ï¼Œé—œé–‰æŒ‰éˆ•åŠ ä¸Š `pointer-events:all`

### æ–°å¢ž
- **é–‹å§‹æµç¨‹åŠ å…¥æŠ€èƒ½æ¨¹å‰ç½®**ï¼ˆ`systems/ui.js`ã€`systems/evolution.js`ï¼‰ï¼šé›£åº¦èˆ‡è§’è‰²é¸æ“‡é çš„ã€Œé–‹å§‹éŠæˆ² â†’ã€æŒ‰éˆ•ï¼Œè‹¥ `savedOrgans` ç‚ºç©ºå‰‡å¼·åˆ¶å…ˆé€²å…¥æŠ€èƒ½æ¨¹ï¼›æŠ€èƒ½æ¨¹æ­¤æ¨¡å¼åº•éƒ¨åƒ…é¡¯ç¤ºã€Œé–‹å§‹éŠæˆ² â†’ã€æŒ‰éˆ•ï¼Œé»žæ“Šå¾Œæ‰çœŸæ­£å•Ÿå‹•éŠæˆ²ï¼›æœ‰å™¨å®˜è³‡æ–™å‰‡ç›´æŽ¥é–‹å§‹
- **çµç®—ç•«é¢å…©é¡†æŒ‰éˆ•**ï¼ˆ`systems/evolution.js`ã€`systems/boss.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼šæ­»äº¡/é€¾æ™‚æŠ€èƒ½æ¨¹ç•«é¢èˆ‡å‹åˆ©ç•«é¢åº•éƒ¨æ”¹ç‚ºã€ŒðŸ’¾ ä¿å­˜ä¸¦è¿”å›žé¦–é ã€+ã€Œâš”ï¸ å†ä¾†ä¸€å ´ã€ï¼›æœªé¸å™¨å®˜é»žã€Œä¿å­˜ä¸¦è¿”å›žã€æ™‚é¡¯ç¤º 3 ç§’è­¦å‘Šæ©«å¹…ï¼›ã€Œå†ä¾†ä¸€å ´ã€ç¬¬ä¸€æ¬¡é»žæ“Šåœ¨æœªé¸å™¨å®˜æ™‚é¡¯ç¤ºç¢ºèªæç¤ºï¼Œç¬¬äºŒæ¬¡æ‰çœŸæ­£é–‹å§‹ï¼ˆé€éŽ `gameState.playAgainWarned` è¿½è¹¤ï¼‰
- æ–°å¢ž `gameState.lastDifficulty` è¨˜éŒ„ä¸Šå±€é›£åº¦ã€`gameState.playAgainWarned` è¿½è¹¤æ˜¯å¦å·²æé†’
- æ–°å¢žèªžè¨€ keyï¼š`btnSaveAndHome`ã€`warnNoOrganLine1`ã€`warnNoOrganLine2`ã€`warnNoOrganPlay`ï¼ˆä¸­è‹±æ–‡ï¼‰

---

## v0.27.1 - 2026-05-18

### æ–°å¢ž
- **æŽ’è¡Œæ¦œé˜²ä½œå¼Šæ©Ÿåˆ¶**ï¼ˆ`systems/gameState.js`ã€`systems/ui.js`ã€`systems/boss.js`ã€`systems/daynight.js`ã€`main.js`ï¼‰ï¼šæ–°å¢ž `gameState.devModeUsed` æ——æ¨™ï¼Œå•Ÿå‹•é–‹ç™¼è€…æ¨¡å¼æ™‚è¨­ç‚º `true` ä¸”æœ¬å±€ä¸å¯é‡ç½®ï¼›éŠæˆ²çµæŸæ™‚è‹¥åµæ¸¬åˆ°æ——æ¨™ï¼Œå®Œå…¨è·³éŽåˆ†æ•¸ä¸Šå‚³å½ˆçª—ä¸¦æ–¼çµæŸç•«é¢é¡¯ç¤ºã€Œâš ï¸ æœ¬å±€ä½¿ç”¨äº†é–‹ç™¼è€…æ¨¡å¼ï¼Œåˆ†æ•¸ä¸è¨ˆå…¥æŽ’è¡Œæ¦œã€ï¼›`initializeGame()` é‡æ–°é–‹å±€æ™‚é‡ç½®ç‚º `false`

---

## v0.27.0 - 2026-05-18

### æ–°å¢ž
- **Supabase å…¨çƒæŽ’è¡Œæ¦œç³»çµ±**ï¼ˆ`config/supabase.js`ã€`systems/ui.js`ã€`systems/boss.js`ã€`systems/daynight.js`ã€`lang/zh-TW.js`ã€`lang/en.js`ã€`index.html`ï¼‰ï¼šä¸²æŽ¥ Supabase REST APIï¼Œå¯¦ä½œå®Œæ•´æŽ’è¡Œæ¦œåŠŸèƒ½
- **é¦–é  TOP 10 æµ®çª—**ï¼ˆ`systems/ui.js`ï¼‰ï¼šé¦–é å³å´æ–°å¢žå›ºå®šæµ®çª—ï¼Œè‡ªå‹•è®€å–å‰10åï¼Œé¡¯ç¤ºæŽ’ååœ–ç¤ºã€åå­—ã€éŠçŽ©æ™‚é–“ã€å‹è² çµæžœ
- **å®Œæ•´æŽ’è¡Œæ¦œä»‹é¢**ï¼ˆ`systems/ui.js`ï¼‰ï¼šé»žã€ŒðŸ† æŽ’è¡Œæ¦œã€é–‹å•Ÿå…¨å±æŽ’è¡Œæ¦œï¼Œè¡¨æ ¼å«æŽ’å/ç‰ˆæœ¬/æ—¥æœŸ/åå­—/éŠçŽ©æ™‚é–“/åˆ†æ•¸/ç­‰ç´š/çµæžœï¼Œå‰ä¸‰åæœ‰é‡‘éŠ€éŠ…åº•è‰²ï¼›æ”¯æ´éµç›¤ A/â†â†’/D ç¿»é ï¼Œæ¯é 20ç­†åˆ†é è®€å–
- **åˆ†æ•¸æäº¤å½ˆçª—**ï¼ˆ`systems/ui.js`ï¼‰ï¼šéŠæˆ²çµæŸï¼ˆæ­»äº¡/å‹åˆ©ï¼‰å‰å½ˆå‡ºåå­—è¼¸å…¥è¦–çª—ï¼Œæäº¤æˆ–è·³éŽå¾Œé€²å…¥çµæŸç•«é¢ï¼›ä¸Šå‚³æ¬„ä½å« name/score/level/play_time/is_victory/boss_kill_time/version/version_order
- **çš‡å† æŽ’ååœ–ç¤º**ï¼ˆ`index.html`ï¼‰ï¼šCSS ç¹ªè£½é‡‘éŠ€éŠ…ä¸‰è‰²çš‡å† ï¼ˆ`buildCrown()`ï¼‰ï¼Œ4â€“10åðŸŽ–ï¸ï¼Œ11åå¾Œé¡¯ç¤ºæ•¸å­—
- **Boss ç”Ÿæˆæ™‚é–“è¨˜éŒ„**ï¼ˆ`systems/boss.js`ï¼‰ï¼š`spawnBoss()` è¨˜éŒ„ `gameState.bossSpawnTime`ï¼Œæ“Šæ®ºå¾Œè¨ˆç®— `boss_kill_time` ç§’æ•¸ä¸Šå‚³
- **é¦–é æ–°å¢žæŽ’è¡Œæ¦œæŒ‰éˆ•**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæŒ‰éˆ•é †åºèª¿æ•´ç‚ºé–‹å§‹éŠæˆ² / æŠ€èƒ½æ¨¹ / éŠæˆ²èªªæ˜Ž / æŽ’è¡Œæ¦œ / è¨­å®š
- **é›™èªžæ”¯æ´**ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼šæ–°å¢ž21å€‹æŽ’è¡Œæ¦œç›¸é—œ lang key

---

## v0.26.1 - 2026-05-17

### ä¿®å¾©
- **æ‰‹æ©Ÿç‰ˆèªªæ˜Žç¬¬1é å·¦åŠç¼ºå°‘å…©é …**ï¼ˆ`systems/ui.js`ï¼‰ï¼š`buildPage0()` æ‰‹æ©Ÿåˆ†æ”¯å·¦æ¬„è£œä¸Š `guideFruit`ï¼ˆåƒæžœå­ï¼‰èˆ‡ `guideGoal`ï¼ˆç›®æ¨™ï¼‰ï¼Œèˆ‡æ¡Œæ©Ÿç‰ˆ5é …ä¸€è‡´

---

## v0.26.0 - 2026-05-17

### æ–°å¢ž
- **éŠæˆ²èªªæ˜Žç³»çµ±å…¨é¢é‡æ§‹**ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ã€`lang.js`ã€`systems/ui.js`ã€`index.html`ï¼‰ï¼šèªªæ˜Žä»‹é¢ç”±èˆŠç‰ˆ `guidePages` é™£åˆ—æ”¹ç‚ºæ‰å¹³ lang key æž¶æ§‹ï¼Œæ”¯æ´é€ key fallbackï¼ˆç•¶å‰èªžè¨€ â†’ en â†’ zh-TWï¼‰
- **èªªæ˜Žé æ“´å……è‡³4é **ï¼ˆ`systems/ui.js`ï¼‰ï¼šç¬¬1é åŸºæœ¬æ“ä½œï¼ˆæ¡Œæ©Ÿï¼‰æˆ–å·¦å³åˆ†æ¬„è§¸æŽ§æ“ä½œï¼ˆæ‰‹æ©Ÿï¼‰ã€ç¬¬2é å™¨å®˜ç³»çµ±ã€ç¬¬3é é€²åŒ–ç³»çµ±ã€ç¬¬4é å°åœ°åœ–èªªæ˜Žï¼›æ¡Œæ©Ÿæ‰‹æ©Ÿé æ•¸çµ±ä¸€
- **æ‰‹æ©Ÿç¬¬1é è§¸æŽ§ç¤ºæ„åœ–**ï¼ˆ`systems/ui.js`ï¼‰ï¼šå³åŠæ¬„æ–°å¢žæ©«å‘æ¨¡å¼ç¤ºæ„åœ–ï¼ˆ144Ã—80pxï¼Œå·¦30%æ”»æ“Šå€/å³30%æ–æ¡¿å€ï¼‰èˆ‡ç›´å‘æ¨¡å¼ç¤ºæ„åœ–ï¼ˆ90Ã—108pxï¼Œä¸Š60%éŠæˆ²ç•«é¢/ä¸‹40%æ”»æ“Š+æ–æ¡¿ï¼‰ï¼Œä½¿ç”¨çµ•å°å®šä½ HTML div ç¹ªè£½
- **èªªæ˜Žä»‹é¢éµç›¤æ›é **ï¼ˆ`systems/ui.js`ï¼‰ï¼šé–‹å•Ÿèªªæ˜Žæ™‚ç›£è½ `D/â†’`ï¼ˆä¸‹ä¸€é ï¼‰ã€`A/â†`ï¼ˆä¸Šä¸€é ï¼‰ï¼›`hideGuide()` è‡ªå‹•ç§»é™¤ç›£è½å™¨ï¼ˆ`_guideKeyHandler`ï¼‰ï¼Œé˜²æ­¢æ®˜ç•™
- **å°åœ°åœ–åœ–ä¾‹å‹•ç•«**ï¼ˆ`index.html`ã€`systems/ui.js`ï¼‰ï¼šæ–°å¢ž `@keyframes dotBlink`ï¼ˆopacity é–ƒçˆï¼ŒçŽ©å®¶/è‰é£Ÿç²¾è‹±/è‚‰é£Ÿç²¾è‹±ï¼‰èˆ‡ `@keyframes dotGlow`ï¼ˆbox-shadow å…‰æšˆï¼Œä¸‰ç¨®Bossï¼‰ï¼Œéœ§å€æ”¹ç”¨æ–¹å½¢è‰²å¡Šï¼ˆrgba(255,255,255,0.3)ï¼‰
- **å¤§é‡æ–°å¢ž lang key**ï¼ˆ`lang/zh-TW.js`ã€`lang/en.js`ï¼‰ï¼šæ–°å¢ž `guideTitle/guidePage/guideClose/guidePrev/guideNext`ã€ç¬¬1é æ¡Œæ©Ÿ5æ¢ã€æ‰‹æ©Ÿ6æ¢ã€è§¸æŽ§2æ¢ã€ç¬¬2é å™¨å®˜7æ¢ã€ç¬¬3é é€²åŒ–5æ¢ã€ç¬¬4é åœ°åœ–10æ¢ï¼Œå…±æ–°å¢ž40+ keys

---

## v0.25.0 - 2026-05-17

### æ–°å¢ž
- **æ©«å‘æ‰‹æ©Ÿæ–æ¡¿å‹•æ…‹å®šä½**ï¼ˆ`systems/ui.js`ï¼‰ï¼šç§»é™¤æ©«å‘æ¨¡å¼å›ºå®šåº•ç’°ï¼ˆ`vwÃ—0.85, vhÃ—0.5`ï¼‰ï¼Œæ”¹ç‚ºçŽ©å®¶åœ¨æ–æ¡¿å€ä»»æ„ä½ç½®æŒ‰ä¸‹æ™‚ï¼Œä»¥è©²è§¸é»žç‚ºæ–æ¡¿ä¸­å¿ƒå‹•æ…‹ç”Ÿæˆï¼›`onStart` ç§»é™¤ `orientation === 'landscape'` åˆ†æ”¯ï¼Œå…©å€‹æ–¹å‘çµ±ä¸€ä½¿ç”¨ `_joyBaseX = x; _joyBaseY = y`
- **æ”»æ“Šå€é»žæ“Šè¦–è¦ºå›žé¥‹**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ–°å¢ž `_atkFeedbackTime / _atkFeedbackX / _atkFeedbackY` ä¸‰å€‹ç‹€æ…‹è®Šæ•¸ï¼›æ”»æ“Šå€ `touchstart` è§¸ç™¼æ™‚è¨˜éŒ„åº§æ¨™èˆ‡æ™‚é–“ï¼›`_renderMobileOverlay` æ¯å¹€åœ¨é»žæ“Šä½ç½®ç¹ªè£½åŠé€æ˜Ž âš”ï¸ï¼Œ300ms å…§ç·šæ€§æ·¡å‡º
- **æ©«å‘æ‰‹æ©Ÿè§¸æŽ§å€åŸŸè¦–è¦ºæç¤ºé‡ç¹ª**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ”»æ“Šå€èˆ‡æ–æ¡¿å€å„ä»¥ `rgba(255,255,255,0.1)` ç´°é‚Šæ¡†æ¨™ç¤ºç¯„åœï¼›æ”»æ“Šå€ä¸­å¤® âš”ï¸ é€æ˜Žåº¦é™è‡³ 0.1ï¼›æ–æ¡¿å€æ”¹ç‚º 0.1 é€æ˜Žåº¦çš„å¤–ç’° + å…§åœˆæç¤ºåœ“ï¼Œæ›¿ä»£åŽŸæœ¬ 0.2 é€æ˜Žåº¦å›ºå®šåº•ç’°
- **`_renderMobileOverlay` æ¯å¹€åˆ·æ–°**ï¼ˆ`systems/ui.js`ã€`main.js`ï¼‰ï¼šåœ¨ `drawGame()` æœ«å°¾åŠ å…¥ `if (gameState.isMobile) _renderMobileOverlay()`ï¼Œç¢ºä¿æ”»æ“Šé»žæ“Šæ·¡å‡ºå‹•ç•«æ–¼æ¯å¹€æ­£ç¢ºæ¸²æŸ“ï¼›åŽŸè§¸æŽ§äº‹ä»¶å…§çš„å‘¼å«ä¿ç•™ä»¥ç¶­æŒå³æ™‚åæ‡‰

---

## v0.24.2 - 2026-05-17

### ä¿®å¾©
- **å°åœ°åœ–æ—¥æœˆåœ–ç¤ºå››è§’é¡è‰²ç•°å¸¸**ï¼ˆ`systems/ui.js`ï¼‰ï¼šç§»é™¤ `_drawSunMoonIndicator()` ä¸­å°æ•´å€‹ 24Ã—24 ç•«å¸ƒçš„ `rgba(0,0,0,0.7)` èƒŒæ™¯å¡«è‰²ï¼›åœ“å½¢åœ–ç¤ºä»¥å¤–çš„å››è§’ç¾åœ¨ä¿æŒé€æ˜Žï¼Œç”±çˆ¶å®¹å™¨ `#minimap-info` çš„èƒŒæ™¯è‡ªç„¶ç©¿é€ï¼Œæ¶ˆé™¤é›™å±¤ç–ŠåŠ å°Žè‡´å››è§’é¡è‰²åæš—çš„å•é¡Œ

---

## v0.24.1 - 2026-05-17

### ä¿®å¾©
- **æ‰‹æ©Ÿå°åœ°åœ–ç¸®å°è‡³ 200Ã—200**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ–°å¢ž `_mmSize()` å›žå‚³ `isMobile ? 200 : 300`ï¼›`drawMinimap()` æ¯å¹€æ¯”å°ä¸¦å‹•æ…‹èª¿æ•´ `minimapCanvas.width/height`ï¼›`_drawMinimapFog()` çš„æš«å­˜ç•«å¸ƒ RC æ”¹ç‚º `mm+30`ï¼Œæœ€çµ‚ drawImage è¼¸å‡ºè‡³ mmÃ—mmï¼›`_drawMinimapEntities()` scale æ”¹ç‚º `mm/MAP_WIDTH`ï¼ˆæ‰‹æ©Ÿ 1/40ï¼Œæ¡Œæ©Ÿ 1/26.7ï¼‰ï¼›`#minimap-info` è³‡è¨Šåˆ—å¯¬åº¦è·Ÿéš¨ canvas è‡ªå‹•ç¸®å°ï¼›æ¡Œæ©Ÿç¶­æŒ 300Ã—300 ä¸å—å½±éŸ¿
- **è¨­å®šæŒ‰éˆ•æ¯å¹€é‡å»º DOM å°Žè‡´ click å¤±æ•ˆ**ï¼ˆ`systems/ui.js`ï¼‰ï¼šå·¦ä¸Šè§’ UI æ”¹ç‚º `_initTopLeftUI()` ä¸€æ¬¡å»ºç«‹ç©©å®šçµæ§‹ï¼Œ`addEventListener` ç¶å®šè¨­å®šæŒ‰éˆ•ï¼Œ`updateUI()` åƒ…æ›´æ–° `#tl-xp-text`ã€`#tl-xp-bar` æ•¸å€¼åŠ hearts canvas

---

## v0.24.0 - 2026-05-17

### æ–°å¢ž
- **å¿ƒå½¢è¡€é‡ UI**ï¼ˆ`systems/ui.js`ï¼‰ï¼šç§»é™¤ HP æ•¸å­—ï¼Œæ”¹ä»¥å¿ƒå½¢ Canvas é¡¯ç¤ºï¼›æ¯é¡†å¿ƒä»£è¡¨ 20HPï¼Œå¡«å……æ¯”ä¾‹ `clamp((hp - i*20)/20, 0, 1)`ï¼Œç´…è‰²å¾žå·¦å´å¡«å……ï¼Œç©ºå¿ƒéƒ¨åˆ†é»‘è‰²åŠé€æ˜Žï¼›æœ€å¤š 10 é¡†ä¸€è¡Œï¼Œè¶…éŽæ›è¡Œï¼›`_heartPath()` ç”¨ Bezier æ›²ç·šç¹ªè£½ 24Ã—24 å¿ƒå½¢
- **å·¦ä¸Šè§’ UI é‡æ§‹**ï¼ˆ`systems/ui.js`ã€`index.html`ï¼‰ï¼šæ”¹ç‚º `inline-flex` ç¸±å‘å®¹å™¨ï¼›ç¬¬ä¸€è¡Œä¸¦æŽ’ âš™ï¸ æŒ‰éˆ•ã€ðŸ¦ åœ–ç¤ºï¼ˆ28pxï¼‰ã€Lv/XP æ–‡å­—ï¼‹é€²åº¦æ¢ï¼›ç¬¬äºŒè¡Œå¿ƒå½¢è¡€æ¢ï¼›æ•´é«”åŒ…è¦† `rgba(0,0,0,0.6)` åŠé€æ˜ŽèƒŒæ™¯ï¼›XP é€²åº¦æ¢å¯¬åº¦è‡ªå‹•è·Ÿéš¨å¿ƒæ¢å¯¬åº¦ï¼ˆ`width:100%`ï¼‰
- **âš™ï¸ è¨­å®šæŒ‰éˆ•**ï¼ˆ`systems/ui.js`ï¼‰ï¼šåµŒå…¥å·¦ä¸Šè§’ UIï¼Œ`pointer-events:all` ç©¿é€ overlayï¼Œé»žæ“Šè§¸ç™¼ `showSettings()`ï¼›é›»è…¦ç‰ˆ Esc éµç¶­æŒåŽŸæœ‰é–‹å•Ÿé‚è¼¯ï¼ˆ`systems/input.js`ï¼‰
- **ç›´å‘æ‰‹æ©Ÿ 1000Ã—900 é‚è¼¯è§£æžåº¦**ï¼ˆ`systems/ui.js`ã€`systems/map.js`ï¼‰ï¼šç›´å‘æ¨¡å¼ä¸‹ canvas åŠå®¹å™¨æ”¹ç‚º 1000Ã—900ï¼Œ`scale = vw/1000` å¡«æ»¿èž¢å¹•å¯¬åº¦ï¼›`VIEW_W/VIEW_H` ç”± `const` æ”¹ç‚º `let`ï¼Œ`_setViewSize()` çµ±ä¸€ç®¡ç†ï¼›æ©«å‘/æ¡Œæ©Ÿç¶­æŒ 1600Ã—900 ä¸å—å½±éŸ¿ï¼›camera é‚Šç•Œè‡ªå‹•æ›´æ–°ï¼ˆVIEW_WÃ—0.25 = 250pxï¼‰ï¼Œç›´å‘æç¤ºæ¢åœç”¨
- **æ©«å‘æ‰‹æ©Ÿæ”»æ“Šå€å’Œæ–æ¡¿ç²¾ç¢ºåŒ–**ï¼ˆ`systems/ui.js`ï¼‰ï¼šæ”»æ“Šå€ç¸®è‡³å·¦å´ 30%ï¼ˆæ°´å¹³ï¼‰Ã— ä¸­é–“ 60%ï¼ˆåž‚ç›´ï¼Œ20%~80%ï¼‰ï¼›æ–æ¡¿å€ç¸®è‡³å³å´ 30% Ã— ä¸­é–“ 60%ï¼›æ–æ¡¿åº•ç’°å›ºå®šé¡¯ç¤ºæ–¼å³å´ä¸­å¤®ï¼ˆ`vwÃ—0.85, vhÃ—0.5`ï¼‰ï¼Œå•Ÿå‹•å¾Œ base éŽ–å®šä¸­å¤®ã€knob éš¨è§¸é»žåç§»ï¼›âš”ï¸ æç¤ºç§»è‡³æ”»æ“Šå€æ­£ä¸­å¤®

---

## v0.23.0 - 2026-05-17

### æ–°å¢ž
- **æ‰‹æ©Ÿè§¸æŽ§æ”¯æ´ç³»çµ±**ï¼ˆ`systems/ui.js`ã€`systems/gameState.js`ã€`systems/player.js`ã€`index.html`ï¼‰ï¼š
  - **è£ç½®åµæ¸¬**ï¼š`detectMobile()`ï¼ˆontouchstart æˆ– vw â‰¤ 768ï¼‰ã€`getOrientation()`ã€`applyDeviceMode()`
  - **è¨­å®šä»‹é¢ã€Œè£ç½®æ¨¡å¼ã€å€å¡Š**ï¼šä¸‰é¡†æŒ‰éˆ•ï¼ˆè‡ªå‹•åµæ¸¬ / ðŸ“± æ‰‹æ©Ÿæ¨¡å¼ / ðŸ–¥ï¸ é›»è…¦æ¨¡å¼ï¼‰ï¼Œå³æ™‚å¥—ç”¨ä¸¦å­˜å…¥ `localStorage`
  - **ç•«é¢è‡ªå‹•ç¸®æ”¾**ï¼š`_applyMobileScale()` ç”¨ `CSS transform: scale()` ç¸®æ”¾ `#game-container`ï¼Œæ©«å‘å¡«æ»¿å¯¬åº¦ï¼Œè±Žå‘ä¿ç•™ä¸‹æ–¹ 40% çµ¦æ“æŽ§å€ï¼Œä¸æ”¹è®ŠéŠæˆ²å…§éƒ¨åº§æ¨™
  - **æ–¹å‘æç¤ºæ¢**ï¼šè±Žå‘æ‰‹æ©Ÿæ™‚åœ¨é ‚éƒ¨é¡¯ç¤ºé»ƒè‰²å¯é—œé–‰æç¤ºæ¢ï¼Œæ—‹è½‰æ©«å‘å¾Œè‡ªå‹•éš±è—
  - **è™›æ“¬æ–æ¡¿**ï¼šå³åŠèž¢å¹•ï¼ˆæ©«å‘ï¼‰æˆ–å³åŠä¸‹ 40%ï¼ˆè±Žå‘ï¼‰ï¼Œå¤–åœˆ 60pxï¼å…§åœˆ 25pxï¼Œæµ®å‹•å¼ï¼Œ`mobileInput.dx/dy` é©…å‹•çŽ©å®¶ç§»å‹•
  - **æ”»æ“Šå€åŸŸ**ï¼šæ©«å‘ç‚ºå·¦åŠèž¢å¹•æ•´å€ï¼ˆâš”ï¸ opacity 0.2 æç¤ºï¼‰ï¼Œè±Žå‘ç‚ºå·¦åŠä¸‹ 40% ä¸­å¤®åœ“å½¢æŒ‰éˆ•ï¼ˆâš”ï¸ï¼Œr=40pxï¼‰ï¼Œtap è§¸ç™¼ `playerAttack()`ï¼Œæ²¿ç”¨æ—¢æœ‰å†·å»é‚è¼¯
  - `viewport` meta æ¨™ç±¤é˜²æ­¢æ‰‹æ©Ÿç€è¦½å™¨è‡ªå‹•ç¸®æ”¾

### ä¿®å¾©
- **æ‰‹æ©Ÿæ¨¡å¼å…¨èž¢å¹•ç¶ è‰²é®ç½©**ï¼š`canvas { background-color }` æ”¹ç‚º `#gameCanvas { background-color: #549954 }`ï¼Œé¿å… `#joystick-canvas` ç¹¼æ‰¿ç¶ è‰²è“‹ä½æ‰€æœ‰ overlay

---

## v0.22.0 - 2026-05-17

### æ–°å¢ž
- **å°åœ°åœ– UI ç³»çµ±**ï¼ˆ`systems/ui.js`ã€`index.html`ï¼‰ï¼š
  - **åœ°å½¢åº•åœ–**ï¼šå°‡ 400Ã—400 `terrainMap` é æ¸²æŸ“ç‚ºé›¢å± canvasï¼Œç¸®æ”¾è‡³ 300Ã—300 é¡¯ç¤ºï¼Œç¨®å­ä¸è®Šæ™‚å¿«å–å¾©ç”¨
  - **å¤ªé™½æœˆäº®æŒ‡ç¤ºå™¨**ï¼ˆ`sunmoonCanvas` 24Ã—24ï¼‰ï¼šä¾æ—¥å¤œé€±æœŸé€²åº¦ç¹ªè£½çƒé«”æ—‹è½‰å‹•ç•«ï¼ˆæ©¢åœ“é‚Šç•Œç®—æ³•ï¼‰ï¼Œèˆ‡æ™‚é–“ä¸¦æŽ’æ–¼å°åœ°åœ–è³‡è¨Šåˆ—å³å´
  - **è¿·éœ§ç³»çµ±**ï¼ˆ`_drawMinimapFog`ï¼‰ï¼š400Ã—400 `fogMap` å¸ƒæž—é™£åˆ—é©…å‹•ï¼Œæ¯å¹€æ¸…é™¤ camera è¦–é‡Žå°æ‡‰æ ¼ï¼ˆå«ç’°å½¢åŒ…è£ï¼‰ï¼›æŽ¡ç”¨ 330Ã—330 è¶…å°ºå¯¸æš«å­˜ç•«å¸ƒè§£æ±º blur kernel é‚Šç·£ç¨€é‡‹å•é¡Œï¼Œæœ€çµ‚è£åˆ‡ä¸­å¤® 300Ã—300 è¼¸å‡ºï¼›ç™½å¤©ç–ŠåŠ é›²éœ§æè³ªï¼ˆ70 å€‹å›ºå®šç¨®å­å¾‘å‘æ¼¸å±¤åœ“ï¼Œ`source-atop` åˆæˆï¼‰
  - **ç”Ÿç‰©èˆ‡çŽ©å®¶æ¨™è¨˜**ï¼ˆ`_drawMinimapEntities`ï¼‰ï¼šçŽ©å®¶ç™½/ç¶ é–ƒçˆé»žï¼ˆæ°¸é é¡¯ç¤ºï¼‰ã€ä¸­ç«‹ç”Ÿç‰©æ©˜é»žã€æ•µæ„ç”Ÿç‰©ç´…é»žã€ç²¾è‹±æ€ªé‡‘é»žã€Boss æ·±ç´…å¸¶æ©˜æé‚Šï¼ˆå¾Œå››è€…åƒ…åœ¨å·²æ­é–‹è¿·éœ§å€åŸŸé¡¯ç¤ºï¼‰
  - ç§»é™¤èˆŠç‰ˆå³ä¸Šè§’æ–‡å­— UIï¼ˆæ™‚é–“ã€æ—¥å¤œã€åœ°å½¢æ¨™ç¤ºï¼‰ï¼Œæ•´åˆè‡³ `#minimap-info` è³‡è¨Šåˆ—

---

## v0.21.0 - 2026-05-16

### ä¿®å¾©
- **åœ°åœ–é‚Šç•Œåœ°å½¢ä¸é€£çºŒ**ï¼ˆ`systems/map.js`ï¼‰ï¼š
  - `labelBiomeRegions` flood fill æ”¹ç‚ºç’°å½¢ï¼š`nr/nc` æ”¹ç”¨æ¨¡é‹ç®—ï¼ˆ`% gridH / % gridW`ï¼‰å–ä»£é‚Šç•ŒæŽ’é™¤ï¼Œä½¿ä¸Šä¸‹å·¦å³é‚Šç•Œçš„åŒç”Ÿæ…‹æ ¼æ­£ç¢ºé€£é€šæˆåŒä¸€ region
  - `mergeSmallRegions` é„°æŽ¥åœ–å»ºç«‹æ”¹ç‚ºç’°å½¢ï¼šä»¥ `ADJ_DIRS` å››æ–¹å‘ + æ¨¡é‹ç®—å–ä»£åªå¾€å³å¾€ä¸‹çš„é›™å‘æŽƒæï¼Œç¢ºä¿å·¦å³é‚Šç•Œ/ä¸Šä¸‹é‚Šç•Œçš„ä¸åŒ region æ­£ç¢ºå»ºç«‹é„°æŽ¥é—œä¿‚
  - `buildTerrainCanvas` é‚Šç•Œç™½ç·šæ”¹ç‚ºç’°å½¢ï¼šä»¥ `(gx+1)%cols`ã€`(gy+1)%rows` å–ä»£ `gx+1 < cols`ã€`gy+1 < rows`ï¼Œä½¿æœ€å¾Œä¸€æ¬„/æœ€å¾Œä¸€åˆ—èˆ‡ç¬¬ä¸€æ¬„/ç¬¬ä¸€åˆ—åœ¨åœ°å½¢ä¸åŒæ™‚ä¹Ÿèƒ½ç•«å‡ºé‚Šç•Œç·š

---

## v0.20.0 - 2026-05-16

### æ–°å¢ž
- **åœ°å½¢ç”Ÿæˆè¦å‰‡æ–‡ä»¶**ï¼ˆ`map/map.md`ï¼‰ï¼šæ–°å¢žåœ°å½¢ç”Ÿæˆè¦å‰‡ä¸‰æ¢ï¼ˆTileable Noiseã€MIN_BIOME_TILES åŒåŒ–ç®—æ³•ã€REQUIRED_BIOMES å®Œæ•´æ€§ï¼‰ã€ä¿è­·å€è¦å‰‡ã€è®Šé‡ä½ç½®è¦ç¯„
- **4D Tileable Noise**ï¼ˆ`systems/map.js`ï¼‰ï¼š
  - `_SimplexNoise` æ–°å¢ž `grad4`ï¼ˆ32å€‹4Dæ¢¯åº¦å‘é‡ï¼‰ã€`dot4`ã€`noise4d`ã€`tileableNoise`
  - `tileableNoise(perm, x, y, W, H)`ï¼šæŠŠæ ¼å­åº§æ¨™æŠ•å½±åˆ° 4D åœ“æŸ±é¢ï¼ˆcos/sinï¼‰ï¼Œä½¿åœ°åœ–å·¦å³ã€ä¸Šä¸‹é‚Šç•Œ Noise å€¼å®Œå…¨é€£çºŒ
  - `generateTerrain()` æ”¹ç”¨ `tileableNoise` å–ä»£åŽŸæœ¬ `noise2d`
- **å­¤å³¶åŒåŒ–ç®—æ³•**ï¼ˆ`systems/map.js`ï¼‰ï¼š
  - `MAP_RULES = { MIN_BIOME_TILES: 250 }`ï¼šå…¨åŸŸé è¨­æœ€å°ç”Ÿæ…‹æ ¼æ•¸
  - `labelBiomeRegions(terrainMap, gridW, gridH)`ï¼šflood fillï¼ˆDFS + stackï¼‰ï¼Œå›žå‚³ `regionId` äºŒç¶­é™£åˆ—å’Œ `regions` é™£åˆ—ï¼Œæ¯å€‹ region å« `{ id, biome, cells, size, minRow, minCol }`
  - `mergeSmallRegions(terrainMap, gridW, gridH, minTiles)`ï¼šå»ºç«‹é„°æŽ¥åœ–å¾Œé€ä¸€åŒåŒ– `size < minTiles` çš„å­¤å³¶ï¼Œvalid é¸é …é¸æœ€å°ã€tie é¸æœ€é å·¦ä¸Šï¼›ç„¡ valid æ™‚åˆä½µæœ€å¤§ç›¸é„°å­¤å³¶å¾Œé‡æ–°åˆ¤æ–·
  - `ensureRequiredBiomes(terrainMap, gridW, gridH, requiredBiomes)`ï¼šç¢ºèªæ‰€æœ‰å¿…è¦ç”Ÿæ…‹å­˜åœ¨ï¼Œå›žå‚³ bool
- **`generateTerrain()` å®Œæ•´æµç¨‹æ›´æ–°**ï¼šTileable Noise â†’ ä¿è­·å€ â†’ `mergeSmallRegions` â†’ `ensureRequiredBiomes`ï¼ˆæœ€å¤š 10 æ¬¡æ–° seed é‡è©¦ï¼›è¶…éŽå‰‡ minTiles/2 å†è©¦ä¸€æ¬¡ï¼‰
- **`map/easymap.js`**ï¼š`terrain` å€å¡Šæ–°å¢ž `minBiomeTiles: 250` å’Œ `requiredBiomes: ['forest', 'ocean', 'desert']`

---

## v0.19.0 - 2026-05-16

### æ–°å¢ž
- **åœ°åœ–ç³»çµ±é‡æ§‹**ï¼ˆ`systems/map.js`ï¼‰ï¼š
  - å¾ž `camera.js` ç§»å…¥ `getBiome`ã€`getBgColor`ï¼›å¾ž `spawning.js` ç§»å…¥ `generateTrees`ï¼›å¾ž `gameState.js` ç§»å…¥ `MAP_WIDTH/HEIGHT/VIEW_W/VIEW_H`
  - æ–°å¢ž `TILE_SIZE = 20`ã€`NOISE_SCALE = 0.003`ã€`BIOME_COLOR`
  - æ–°å¢žç´” JS Simplex Noise å¯¦ä½œï¼ˆ`_SimplexNoise.buildPerm` + `noise2d`ï¼Œä¸ä¾è³´å¤–éƒ¨å‡½å¼åº«ï¼‰
  - æ–°å¢ž `generateTerrain()`ï¼šæ¯å±€éš¨æ©Ÿ seedï¼Œç”Ÿæˆ 400Ã—400 æ ¼ terrainMapï¼ˆä¸­å¿ƒ 400px å¼·åˆ¶æ£®æž—ï¼Œnoise > 0.2 æ£®æž—ï¼Œ< -0.2 æµ·æ´‹ï¼Œå…¶é¤˜æ²™æ¼ ï¼‰
  - æ–°å¢ž `buildTerrainCanvas()`ï¼šæŠŠ terrainMap é æ¸²æŸ“è‡³ 8000Ã—8000 é›¢å± Canvasï¼Œå«åœ°å½¢é‚Šç•Œç·šï¼ˆç›¸é„°æ ¼ä¸åŒæ™‚ç•« 2px åŠé€æ˜Žç™½ç·šï¼‰
  - æ–°å¢ž `drawTerrain()`ï¼šæ”¯æ´åœ°åœ–ç’°ç¹žçš„é›¢å± Canvas blitï¼ˆæœ€å¤š 4 æ¬¡ drawImageï¼‰ï¼Œå¤œæ™šç–ŠåŠ  `rgba(0,0,0,0.4)` é®ç½©ï¼›å–ä»£åŽŸæœ¬ `getBgColor` ç´”è‰²èƒŒæ™¯
  - `getBiome(x, y)` æ”¹ç‚ºè®€å– `gameState.terrainMap`ï¼Œæœªå°±ç·’æ™‚ fallback èˆŠå…¬å¼
  - `generateTerrain()` è®€å– `gameState.currentMap.terrain` åƒæ•¸ï¼Œfallback è‡³å¸¸æ•¸é è¨­å€¼
- **`map/` è³‡æ–™å¤¾**ï¼š
  - `map/map.md`ï¼šåœ°åœ–è¨­è¨ˆæ–‡ä»¶
  - `map/easymap.js`ï¼ˆ`EASY_MAP`ï¼‰ï¼šç°¡å–®é›£åº¦é…ç½®ï¼ˆåœ°å½¢åƒæ•¸ã€ç”Ÿç‰©å€çŽ‡ã€ç²¾è‹±æ€ª 3 å¤œé…ç½®ã€Boss é ç•™çµæ§‹ï¼‰
- **é›£åº¦èˆ‡è§’è‰²é¸æ“‡ä»‹é¢**ï¼ˆ`systems/ui.js`ï¼‰ï¼š
  - æ–°å¢ž `showMapSelect()`ï¼šé»žã€Œé–‹å§‹éŠæˆ²ã€å¾Œé¡¯ç¤ºé¸æ“‡é ï¼Œé›£åº¦ï¼ˆç°¡å–®å¯é¸ / æ™®é€šå›°é›£åœ°ç„ðŸ”’ï¼‰+ è§’è‰²ï¼ˆå™ªéµ‘å¯é¸ / å³å°‡æŽ¨å‡ºðŸ”’ï¼‰é›™æ¬„ä½ˆå±€ï¼Œé¸ä¸­é«˜äº®é‡‘æ¡†ï¼Œæ”¯æ´ä¸­è‹±é›™èªž
  - é¸æ“‡å¾Œ `gameState.currentMap = EASY_MAP`ï¼Œå›žé¦–é æŒ‰éˆ•æ¢å¾© `showStartScreen`
  - `showStartScreen` çš„ã€Œé–‹å§‹éŠæˆ²ã€æ”¹ç‚ºå‘¼å« `showMapSelect()`
- **èªžè¨€éµ**ï¼ˆ`zh-TW.js` / `en.js`ï¼‰ï¼šæ–°å¢ž `selectTitle` / `difficultyLabel` / `characterLabel` / `diffEasy~Hell` / `charKoel` / `charSoon` / `btnBack` / `btnStart`
- **`gameState`**ï¼šæ–°å¢ž `currentMap: null`ã€`terrainMap: null`ã€`mapSeed: 0`

### èª¿æ•´
- `systems/camera.js`ï¼šç§»é™¤ `getBiome`ã€`getBgColor`ï¼ˆå·²ç§»è‡³ `map.js`ï¼‰
- `systems/spawning.js`ï¼šç§»é™¤ `generateTrees`ï¼ˆå·²ç§»è‡³ `map.js`ï¼‰
- `systems/gameState.js`ï¼šç§»é™¤ `MAP_WIDTH/HEIGHT/VIEW_W/VIEW_H`ï¼ˆå·²ç§»è‡³ `map.js`ï¼‰
- `systems/ui.js`ï¼š`drawGame()` èƒŒæ™¯æ”¹ç‚º `drawTerrain()` å–ä»£èˆŠ `getBgColor` å¡«è‰²

---

## v0.18.1 - 2026-05-16

### æ–‡ä»¶
- **æ–°å¢ž `.claude/instructions.md`**ï¼šæ¯æ¬¡å°è©±å‰è‡ªå‹•è®€å–çš„é–‹ç™¼è¦å‰‡ï¼ŒåŒ…å« MAIN.md / CHANGELOG.md / VERSION_RULES.md è®€å–é †åºã€å¿…å®ˆé–‹ç™¼è¦å‰‡ï¼ˆ`gameLoop` ç¦æ­¢å­—é¢ `\n`ã€æ¨¡çµ„åŒ–è¦ç¯„ç­‰ï¼‰èˆ‡ä¿®æ”¹å®Œæˆå¾Œçš„å›ºå®šæµç¨‹
- **æ›´æ–° `MAIN.md`**ï¼š
  - `systems/elite.js` å€å¡Šç§»é™¤ `drawEliteArrow`ï¼ˆå·²åˆä½µè‡³ utils.jsï¼‰ï¼Œæ–°å¢žå‚™è¨»èªªæ˜Ž
  - `systems/boss.js` å€å¡Šç§»é™¤ `drawBossArrow`ï¼ˆå·²åˆä½µè‡³ utils.jsï¼‰ï¼Œæ–°å¢žå‚™è¨»èªªæ˜Ž
  - æ–°å¢ž `systems/utils.js` å®Œæ•´å‡½å¼èªªæ˜Žå€å¡Šï¼Œå«å„å‡½å¼åƒæ•¸èˆ‡ç”¨é€”ã€ç¹ªè£½é †åºè¦ç¯„ï¼ˆåå­—â†’è¡€æ¢â†’æœ¬é«”ï¼Œå„å±¤ 4px é–“è·ï¼‰

---

## v0.18.0 - 2026-05-16

### æ–°å¢ž
- **`systems/utils.js`**ï¼šæ–°å¢ž 4 å€‹å…±ç”¨ç¹ªåœ–å·¥å…·å‡½å¼ï¼Œä¾›ç²¾è‹±æ€ªèˆ‡ Boss ç³»çµ±å…±äº«
  - `drawArrow(px, py, targetWorldX, targetWorldY, color, playerRadius)`ï¼šçµ±ä¸€ç®­é ­ç¹ªè£½ï¼Œè·é›¢å›ºå®šç‚º `playerRadius + 20px`ï¼Œæ¯ 0.5 ç§’åœ¨é€æ˜Žåº¦ 0.6â†”1.0 ä¹‹é–“é–ƒçˆ
  - `drawHealthBar(sx, sy, hp, maxHp, width, fillColor, bgColor, height)`ï¼šè¡€æ¢ç¹ªè£½
  - `drawNameTag(sx, sy, name, color, font)`ï¼šåå­—æ¨™ç±¤ç¹ªè£½
  - `drawGlowEffect(sx, sy, radius, fillColor, glowColor, glowBlur)`ï¼šå¸¶å…‰æšˆçš„åœ“å½¢ç¹ªè£½

### ä¿®å¾©
- **ç²¾è‹±æ€ªç¹ªè£½é †åº**ï¼ˆ`systems/elite.js`ï¼‰ï¼šä¿®æ­£é¡¯ç¤ºå±¤æ¬¡ç‚ºã€Œåå­—åœ¨ä¸Šã€è¡€æ¢åœ¨ä¸­ã€æœ¬é«”åœ¨ä¸‹ã€ï¼Œå„å±¤é–“è· 4pxï¼›æ”¹ç”¨ `drawGlowEffect`ã€`drawHealthBar`ã€`drawNameTag`
- **ç²¾è‹±æ€ªç®­é ­å„ªå…ˆæ¬Š**ï¼ˆ`systems/elite.js`ï¼‰ï¼šç•¶ç²¾è‹±æ€ªèˆ‡ Boss åŒæ™‚åœ¨èž¢å¹•å¤–æ™‚ï¼Œåªé¡¯ç¤º Boss ç®­é ­ï¼›æ”¹ç”¨ `drawArrow`
- **ç®­é ­è·é›¢çµ±ä¸€**ï¼šç²¾è‹±æ€ªèˆ‡ Boss ç®­é ­è·é›¢çµ±ä¸€ç‚º `playerRadius + 20px`ï¼ˆåŽŸç²¾è‹±æ€ªç‚ºå›ºå®šåç§»ã€åŽŸ Boss ç‚º `30px`ï¼‰
- **`systems/boss.js`**ï¼š`drawBossArrow` æ”¹ç”¨ `drawArrow`

---

## v0.17.0 - 2026-05-16

### é‡æ§‹
- **å®Œæ•´æ¨¡çµ„åŒ–**ï¼šå°‡ `index.html` å…§åµŒçš„ ~4000 è¡Œ JavaScript å…¨æ•¸æ‹†åˆ†ç‚º 19 å€‹ç¨ç«‹ JS æ¨¡çµ„ï¼Œindex.html ç²¾ç°¡è‡³ç´” HTML + CSS + `<script>` æ¨™ç±¤ï¼ˆ205 è¡Œï¼‰
  - `config/`ï¼š`gameConfig.js` / `organs.js` / `creatures.js` / `evolution.js`ï¼ˆéœæ…‹è³‡æ–™å¸¸æ•¸ï¼‰
  - `lang.js` + `lang/zh-TW.js` + `lang/en.js`ï¼ˆå¤šèªžç³»ï¼‰
  - `systems/`ï¼š`gameState` / `audio` / `camera` / `input` / `spawning` / `player` / `combat` / `organs` / `evolution` / `creatures` / `elite` / `boss` / `daynight` / `ui`ï¼ˆå…± 14 å€‹ç³»çµ±æ¨¡çµ„ï¼‰
  - `main.js`ï¼š`isGamePaused` / `gameLoop` / `initializeGame` / `window.onload`
- **æ–°å¢ž `MAIN.md`**ï¼šè¨˜éŒ„å®Œæ•´æ¨¡çµ„æž¶æ§‹ã€è¼‰å…¥é †åºã€è·¨æ¨¡çµ„ä¾è³´é—œä¿‚èˆ‡é‡è¦è¨­è¨ˆæ³¨æ„äº‹é …

---

## v0.16.0 - 2026-05-15

### æ–°å¢ž
- **å¤šèªžç³»ç³»çµ±**ï¼šæ–°å¢žç¹é«”ä¸­æ–‡ / English åˆ‡æ›ï¼Œæ‰€æœ‰ UIã€å™¨å®˜ã€æŠ€èƒ½ã€é€²åŒ–ã€çµ„åˆã€Bossã€ç²¾è‹±ã€Guide å…§å®¹çš†æ”¯æ´é›™èªž
  - æ–°å¢ž `lang.js` ç¨ç«‹æª”æ¡ˆï¼Œé›†ä¸­æ”¶ç´ `LANG_LIST`ã€`LANG` å­—å…¸èˆ‡ `applyLanguage()`ã€`t(key, params?)` å·¥å…·ï¼›å¯å¤–åŒ…çµ¦è­¯è€…ç›´æŽ¥ç·¨è¼¯
  - `applyLanguage(lang)` æŠŠç•¶å‰èªžè¨€å¯«å›ž `ORGANS / HIDDEN_ORGANS / SKILLS / EVOLUTION_PATHS / COMBOS / ELITE_CONFIG / BOSS_CONFIG`ï¼Œæ—¢æœ‰ `.name`/`.desc` è®€å–è‡ªå‹•è·Ÿè‘—åˆ‡æ›
  - `t(key, params?)` æä¾› UI å­—ä¸²æŸ¥æ‰¾ï¼Œæ”¯æ´ `{token}` æ›¿æ›ï¼ˆå¦‚ `bossAppeared` çš„ `{name}`ã€`rerollBtn` çš„ `{n}`ï¼‰
  - ç¼ºéµæ™‚è‡ªå‹• fallback å›ž zh-TWï¼Œé¿å…æ–°å¢ž key å»å¿˜è¨˜ç¿»å…¶ä»–èªžè¨€æ™‚æ•´æ®µç©ºç™½
- **èªžè¨€è¨­å®š**ï¼šè¨­å®šé¢æ¿æœ€ä¸Šæ–¹æ–°å¢žã€Œèªžè¨€è¨­å®šã€å€å¡Šï¼Œæä¾›ã€Œç¹é«”ä¸­æ–‡ / Englishã€æŒ‰éˆ•ï¼›ç•¶å‰èªžè¨€ä»¥é‡‘è‰²é«˜äº®
  - åˆ‡æ›å¾Œå³æ™‚åˆ·æ–°æ‰€æœ‰é–‹å•Ÿä¸­çš„ä»‹é¢ï¼ˆé¦–é  / è¨­å®š / Guide / æŠ€èƒ½æ¨¹ï¼‰ï¼Œç„¡éœ€é‡æ•´
  - èªžè¨€å¯«å…¥ `gameSettings.language`ï¼Œä¸‹æ¬¡å•Ÿå‹•è‡ªå‹•è¼‰å…¥
- **éŠæˆ²èªªæ˜Ž (Guide) ä»‹é¢**ï¼šé¦–é ã€ŒðŸ“– éŠæˆ²èªªæ˜Žã€æŒ‰éˆ•é€²å…¥ï¼ŒåŠé€æ˜Žé»‘è‰²é®ç½©ã€3 é åˆ†é 
  - ä¸Šæ–¹é¡¯ç¤ºã€Œ{cur} / {total}ã€é ç¢¼èˆ‡é é¢å‰¯æ¨™é¡Œï¼›å·¦å³ç®­é ­åˆ‡æ›é é¢ï¼ˆé¦–å°¾è‡ªå‹•ç¦ç”¨ï¼‰ï¼›åº•éƒ¨ã€Œé—œé–‰ã€å›žé¦–é 
  - ç¬¬ 1 é ã€ŒåŸºæœ¬æ“ä½œã€ã€ç¬¬ 2 é ã€Œå™¨å®˜ç³»çµ±ã€ã€ç¬¬ 3 é ã€Œé€²åŒ–ç³»çµ±ã€å…§å®¹é›™èªž

### èª¿æ•´
- **é¦–é æŒ‰éˆ•é †åº**ï¼šé–‹å§‹éŠæˆ² â†’ æŠ€èƒ½æ¨¹ â†’ éŠæˆ²èªªæ˜Ž â†’ è¨­å®šï¼ˆæ–°å¢ž Guide å…¥å£ï¼‰
- **`gameState`** æ–°å¢ž `language` æ¬„ä½ï¼Œé è¨­ `zh-TW`ï¼›`DEFAULT_SETTINGS` åŒæ­¥åŠ å…¥ `language`
- **`loadSettings()`** è¼‰å…¥èªžè¨€ä¸¦å‘¼å« `applyLanguage()`ï¼Œç¢ºä¿è³‡æ–™è¡¨åˆå§‹åŒ–å³ç‚ºä½¿ç”¨è€…é¸çš„èªžè¨€
- **`updateUI()` HUD æ–‡å­—**æ”¹ç”¨ `t()`ï¼šæ™‚é–“ã€æ—¥å¤œç‹€æ…‹ã€åœ°å½¢ã€é–‹ç™¼è€…çµ±è¨ˆ
- **è¨­å®š / æŠ€èƒ½æ¨¹ / å™¨å®˜é¸æ“‡ / éš±è—å™¨å®˜é¸æ“‡ / å‹åˆ© / æ­»äº¡ / æ™‚é–“è€—ç›¡ / Day-Night åˆ‡æ› / ç²¾è‹± / Boss / å‡ç´š / é‡é¸ / Tooltip / HUD å™¨å®˜æ¡†** ç­‰æ‰€æœ‰å¯è¦‹æ–‡å­—å…¨é¢æ”¹ç”¨ `t()` èˆ‡ `LANG` å­—å…¸
- **`_keyDisplay()`** ã€Œæ»‘é¼ å·¦éµã€æ”¹ç”¨ `t('mouseLeft')`ï¼Œè·Ÿéš¨èªžè¨€é¡¯ç¤º

### æ–‡ä»¶
- **`lang.js` é–‹é ­åŠ å…¥ç¿»è­¯å¤–åŒ…èªªæ˜Ž**ï¼šæ­¥é©Ÿã€{token} è¦å‰‡ã€å¿…é ˆç¶­æŒ key çµæ§‹ã€ä¸å¯æ”¹å‹•åº•éƒ¨å·¥å…·å‡½å¼
- **`gameConfig.js` é–‹é ­åŠ å…¥å¤šèªžç³»èªªæ˜Ž**ï¼šè³‡æ–™è¡¨ä¿ç•™ä¸­æ–‡é è¨­å€¼ï¼Œåˆ‡æ›èªžè¨€æ™‚ç”± `applyLanguage()` è¦†å¯«

---

## v0.15.3 - 2026-05-14

### ä¿®å¾©
- **éš±è—å™¨å®˜é¸å®Œå¾ŒéŠæˆ²å¡æ­»ã€æœªè·³å‡ºæŽ’éšŠä¸­çš„æ™®é€šå™¨å®˜é¸æ“‡**ï¼šv0.15.1 å°‡ `showHiddenOrganSelection` çš„ `closeOverlay` æ”¹ç‚ºåœ¨ `pending > 0` æ™‚ä¿ç•™ `organSelectionActive = true` ä¸¦ç›´æŽ¥å‘¼å« `showOrganSelection()`ï¼Œä½† `showOrganSelection` å…¥å£æœƒæª¢æŸ¥ `organSelectionActive`ï¼Œçœ‹åˆ° true ä¾¿å†æ¬¡ `pendingOrganSelections++` ä¸¦ returnï¼Œå°Žè‡´ active=true ä½†ç„¡ overlay è€Œå¡æ­»ã€‚ä¿®æ­£ç‚ºå…ˆè¨­ `organSelectionActive = false` ä¸¦é‡ç½® `lastTimeTick`ï¼Œå†å‘¼å« `showOrganSelection()` é–‹å•Ÿä¸‹ä¸€å€‹ overlayï¼ˆæ•´æ®µåŒæ­¥åŸ·è¡Œï¼Œç„¡ç•«é¢å¹€ç©ºéš™è®“éŠæˆ²æ„å¤–æ¢å¾©è·‘ï¼‰

---

## v0.15.2 - 2026-05-14

### ä¿®å¾©
- **ç²¾è‹±æ“Šæ®ºæ™‚éš±è—å™¨å®˜èˆ‡å‡ç´šé¸æ“‡ç–Šå±¤**ï¼š`handleEliteKill` åŽŸæœ¬å…ˆå‘¼å« `addXP()`ï¼Œè‹¥æ­¤æ™‚è§¸ç™¼å‡ç´šæœƒç›´æŽ¥é–‹å•Ÿå™¨å®˜é¸æ“‡ç•«é¢ï¼ˆ`organSelectionActive` æ­¤æ™‚ç‚º falseï¼‰ï¼Œå†å‘¼å« `showHiddenOrganSelection()` ä¾¿é€ æˆå…©å€‹ overlay åŒæ™‚å­˜åœ¨ã€`pendingOrganSelections` æœªæ­£ç¢ºéžå¢žçš„å•é¡Œã€‚ä¿®æ­£ç‚ºï¼šå…ˆè¨ˆç®—ä¸¦å‘¼å« `showHiddenOrganSelection()`ï¼ˆè¨­ `organSelectionActive = true`ï¼‰ï¼Œä¹‹å¾Œ `addXP()` è‹¥è§¸ç™¼å‡ç´šæœƒæ­£ç¢ºèµ° `pendingOrganSelections++` æŽ’éšŠï¼Œç¢ºä¿å…©è€…ä¾åºé¡¯ç¤ºè€Œéžç–Šå±¤

---

## v0.15.1 - 2026-05-14

### ä¿®å¾©
- **éš±è—å™¨å®˜é¸æ“‡å¾ŒéŠæˆ²çŸ­æš«æ¢å¾©**ï¼š`showHiddenOrganSelection` çš„ `closeOverlay` åŽŸæœ¬å…ˆå°‡ `organSelectionActive = false` å†æª¢æŸ¥ `pendingOrganSelections`ï¼Œå°Žè‡´æœ‰ä¸€å¹€ç©ºéš™è®“éŠæˆ²ç¹¼çºŒé‹è¡Œã€‚ä¿®æ­£ç‚ºï¼šæœ‰ pending æ™‚ç›´æŽ¥ `pendingOrganSelections--` ä¸¦å‘¼å« `showOrganSelection()`ï¼Œä¿æŒ `organSelectionActive = true` ä¸ä¸­æ–·ï¼›ç„¡ pending æ™‚æ‰è¨­ `organSelectionActive = false` ä¸¦é‡ç½® `lastTimeTick`

---

## v0.15.0 - 2026-05-14

### æ–°å¢ž
- **Tooltip å·¥å…·æç¤ºç³»çµ±**ï¼šæ»‘é¼ ç§»åˆ°å™¨å®˜/æŠ€èƒ½/é€²åŒ–é¸é …ä¸Šæ™‚ï¼Œé¡¯ç¤ºåŠé€æ˜Žæ·±è‰²æµ®å‹•æç¤ºæ¡†ï¼ˆ`position:fixed`ï¼Œè·Ÿéš¨æ»‘é¼ ï¼Œé è¿‘å³é‚Šç•Œè‡ªå‹•ç¿»è‡³å·¦å´ï¼‰
  - **å·¦ä¸‹è§’ HUD å™¨å®˜æ¸…å–®ï¼ˆcanvasï¼‰**ï¼šé€éŽ `_organHitRegions` é™£åˆ—æ¯å¹€è¨˜éŒ„å„åˆ—ç¯„åœï¼Œcanvas `mousemove` å‘½ä¸­å¾Œé¡¯ç¤ºå™¨å®˜åç¨±ã€ç•¶å‰ç­‰ç´š/æœ€å¤§ç­‰ç´šã€åŸºç¤Žæ•ˆæžœèªªæ˜Žï¼›éš±è—å™¨å®˜æ¨™ç¤ºã€Œâœ¨ éš±è—å™¨å®˜ã€ï¼›è‹¥å·²èˆ‡çµ„åˆæ­æ“‹åŒæ™‚è£å‚™å‰‡é¡¯ç¤ºã€Œâš¡ çµ„åˆæ•ˆæžœã€ï¼›é€²åŒ–è·¯ç·šåŒæ¨£é¡¯ç¤ºç•¶å‰ç­‰ç´šèªªæ˜Ž
  - **å™¨å®˜é¸æ“‡ç•«é¢**ï¼šæ‡¸åœæ™®é€šå™¨å®˜/å‡ç´šé¸é …æ™‚é¡¯ç¤ºæœ¬æ¬¡å‡ç´šèªªæ˜Žèˆ‡çµ„åˆæ•ˆæžœæç¤ºï¼›æ‡¸åœé€²åŒ–è·¯ç·šæ™‚é¡¯ç¤ºè©²ç­‰ç´šèªªæ˜Ž
  - **éš±è—å™¨å®˜æŽ‰è½é¸æ“‡ç•«é¢**ï¼šæ‡¸åœé¸é …æ™‚é¡¯ç¤ºéš±è—å™¨å®˜åç¨±èˆ‡æ•ˆæžœèªªæ˜Ž
  - **æŠ€èƒ½æ¨¹ä»‹é¢**ï¼šæ‡¸åœæŠ€èƒ½å¡ç‰‡æ™‚é¡¯ç¤ºæŠ€èƒ½èªªæ˜Žï¼›æ‡¸åœæ­»äº¡å¾Œ/é¦–é çš„å™¨å®˜ä¿ç•™å¡ç‰‡æ™‚é¡¯ç¤ºå™¨å®˜æ•ˆæžœèªªæ˜Žï¼›æ‡¸åœéš±è—å™¨å®˜å¡ç‰‡æ™‚é¡¯ç¤ºé‡‘è‰²ã€Œâœ¨ éš±è—å™¨å®˜ã€æ¨™ç¤º
  - é—œé–‰æ‰€æœ‰ overlay æ™‚è‡ªå‹•å‘¼å« `hideTooltip()` é˜²æ­¢æ®˜ç•™

---

## v0.14.1 - 2026-05-14

### èª¿æ•´
- **é¦–é æŠ€èƒ½æ¨¹ä¸Šå±€å™¨å®˜å€å¡Š**ï¼šç”±ç´”åƒè€ƒé¡¯ç¤ºæ”¹ç‚ºå®Œæ•´äº’å‹•é¸æ“‡ä»‹é¢ï¼›å¾ž `lastRunOrgans` è¼‰å…¥ä¸Šå±€å™¨å®˜ï¼Œæ™®é€šå™¨å®˜ä¾ `organMemory` æŠ€èƒ½ç­‰ç´šé™åˆ¶å¯é¸æ•¸é‡ï¼Œéš±è—å™¨å®˜æœ€å¤šé¸1å€‹ï¼›é¸ä¸­é¡¯ç¤ºé‡‘è‰²é«˜äº®ï¼Œå³æ™‚å¯«å…¥ `savedOrgans`/`savedHiddenOrgans`ï¼›æ¨™é¡Œæ”¹ç‚ºã€ŒðŸ“¦ é¸æ“‡ç¹¼æ‰¿ä¸Šå±€å™¨å®˜ï¼ˆæœ€å¤š N å€‹ï¼‰ã€ï¼›é¦–é é–‹å•ŸæŠ€èƒ½æ¨¹æ™‚åŒæ­¥å¾ž localStorage è¼‰å…¥æ­£ç¢ºçš„æŠ€èƒ½ç­‰ç´šèˆ‡æŠ€èƒ½é»žæ•¸
- **è¨­å®šã€Œé‡å•ŸéŠæˆ²ã€ä¿ç•™å™¨å®˜è¨˜éŒ„**ï¼šä¸­é€”é‡å•Ÿå‰å‘¼å« `saveLastRunOrgans()` å­˜å…¥ `lastRunOrgans`ï¼Œä¸¦ç¢ºä¿ `skillPoints` å·²å¯«å…¥ localStorageï¼Œé˜²æ­¢ä¸­é€”çµæŸæå¤±è¨˜éŒ„

---

## v0.14.0 - 2026-05-14

### èª¿æ•´
- **é¦–é ç§»é™¤éµç›¤é€²å…¥**ï¼šé¦–é ä¸å†ç›£è½ keydown äº‹ä»¶ï¼Œåªæœ‰é»žæ“Šã€Œâ–¶ é–‹å§‹éŠæˆ²ã€æŒ‰éˆ•æ‰èƒ½é€²å…¥éŠæˆ²
- **é¦–é ä¸‰æŒ‰éˆ•é¸å–®**ï¼šã€Œâ–¶ é–‹å§‹éŠæˆ²ã€ã€ã€ŒðŸŒ¿ æŠ€èƒ½æ¨¹ã€ã€ã€Œâš™ï¸ è¨­å®šã€ç”±ä¸Šåˆ°ä¸‹æŽ’åˆ—

### æ–°å¢ž
- **é¦–é æŠ€èƒ½æ¨¹**ï¼šé»žæ“Šã€ŒðŸŒ¿ æŠ€èƒ½æ¨¹ã€å‘¼å« `buildSkillTreeOverlay(null, true)`ï¼›fromHome æ¨¡å¼ä¸‹éš±è—å™¨å®˜ä¿ç•™å€å¡Šã€é¡¯ç¤ºã€ŒðŸŒ¿ æŠ€èƒ½æ¨¹ã€æ¨™é¡Œã€åº•éƒ¨æ”¹ç‚ºã€Œé—œé–‰ã€æŒ‰éˆ•ï¼ˆé»žæ“Šå¾Œç§»é™¤ overlay å›žåˆ°é¦–é ï¼‰ï¼›overlay z-index 210ï¼Œç–Šåœ¨é¦–é ä¹‹ä¸Šï¼›å‡ç´šå’Œé‡ç½®æŒ‰éˆ•é€éŽ `_skillTreeFromHome` å…¨åŸŸæ——æ¨™ä¿ç•™èªžå¢ƒ
- **é¦–é è¨­å®š**ï¼šé»žæ“Šã€Œâš™ï¸ è¨­å®šã€å‘¼å« `showSettings(true)`ï¼›fromHome æ¨¡å¼ä¸‹ overlay z-index 210ï¼Œåº•éƒ¨æŒ‰éˆ•æ–‡å­—æ”¹ç‚ºã€Œé—œé–‰ã€ï¼ˆåŠŸèƒ½ç›¸åŒï¼šå„²å­˜ä¸¦é—œé–‰ overlayï¼‰ï¼›é—œé–‰å¾Œå›žåˆ°é¦–é 

---

## v0.13.9 - 2026-05-14

### æ–°å¢ž
- **ä¸Šå±€å™¨å®˜è‡ªå‹•å„²å­˜**ï¼šçŽ©å®¶æ­»äº¡æˆ–å‹åˆ©æ™‚ï¼Œé€éŽ `saveLastRunOrgans()` æŠŠæœ¬å±€æ‰€æœ‰æ™®é€šå™¨å®˜ï¼ˆå«ç­‰ç´šï¼‰å’Œéš±è—å™¨å®˜å­˜å…¥ `localStorage.lastRunOrgans`ï¼›ä¸å— `SAVE_VERSION` æ¸…é™¤å½±éŸ¿ï¼Œæ°¸ä¹…ä¿ç•™
- **æŠ€èƒ½æ¨¹ã€Œä¸Šå±€éºç•™å™¨å®˜ã€å€å¡Š**ï¼šæŠ€èƒ½æ¨¹ä»‹é¢æœ€ä¸‹æ–¹æ–°å¢žç°è‰²ç´”é–±è®€å€å¡Šï¼Œåˆ—å‡ºä¸Šå±€æ‰€æœ‰å™¨å®˜åç¨±èˆ‡ç­‰ç´šï¼›ç„¡è¨˜éŒ„æ™‚é¡¯ç¤ºã€Œå°šç„¡è¨˜éŒ„ã€
- **ã€ŒðŸ  å›žåˆ°é¦–é ã€+ã€Œâš”ï¸ å†ä¾†ä¸€å ´ã€é›™æŒ‰éˆ•**ï¼šæ­»äº¡æŠ€èƒ½æ¨¹å’Œå‹åˆ©ç•«é¢åº•éƒ¨çš„ã€Œé‡æ–°é–‹å§‹ã€å‡æ›æˆå…©å€‹ä¸¦æŽ’æŒ‰éˆ•ï¼›ã€Œå›žåˆ°é¦–é ã€è¿”å›žèµ·å§‹ç•«é¢ï¼Œã€Œå†ä¾†ä¸€å ´ã€é€éŽ `sessionStorage` æ¨™è¨˜å¾Œ reload è‡ªå‹•è·³éŽé¦–é ç›´æŽ¥é–‹å§‹æ–°ä¸€å±€

---

## v0.13.8 - 2026-05-14

### èª¿æ•´
- **ç²¾è‹±æ€ªåµæ¸¬ç¯„åœ**ï¼š`aggroRange` 250 â†’ 1000
- **Boss å…¨åœ–è¿½æ“Š**ï¼šä¸‰å€‹ Boss çš„ `aggroRange` çµ±ä¸€æ”¹ç‚º `99999`ï¼ˆç­‰åŒå…¨åœ°åœ–è¿½æ“Šï¼‰ï¼Œå®šç¾©æ–¼ `gameConfig.js` çš„ `BOSS_CONFIG`ï¼Œæ–°å¢ž Boss è‡ªå‹•ç¹¼æ‰¿

### æ–°å¢ž
- **Boss æ–¹å‘ç®­é ­**ï¼šBoss ä¸åœ¨è¦–é‡Žæ™‚ï¼ŒçŽ©å®¶å‘¨åœ 30px è™•é¡¯ç¤ºæŒ‡å‘ Boss çš„é–ƒçˆç®­é ­ï¼ˆ500ms é–“éš” 0.6â†”1.0 é€æ˜Žåº¦ï¼‰ï¼›é€²å…¥è¦–é‡Žå¾Œè‡ªå‹•æ¶ˆå¤±ã€‚å„ Boss ç®­é ­é¡è‰²æ²¿ç”¨ `glowColor`ï¼šé»‘ç†Š `#8B4513`ã€å¤§ç™½é¯Š `#1a3a5c`ã€æ²™æ¼ è çŽ‹ `#8B6914`

---

## v0.13.7 - 2026-05-14

### ä¿®å¾©
- **éš±è—å™¨å®˜é¸æ“‡å¾ŒéŠæˆ²æœªæš«åœ**ï¼š`showHiddenOrganSelection` çš„ `closeOverlay` è£œä¸Š `pendingOrganSelections` æª¢æŸ¥â€”â€”é—œé–‰éš±è—å™¨å®˜ç•«é¢å¾Œè‹¥æœ‰å¾…è™•ç†çš„å‡ç´šé¸æ“‡ï¼Œç«‹åˆ»å‘¼å« `showOrganSelection()`ï¼ˆåŒæ­¥åŸ·è¡Œï¼Œä¸æœƒæœ‰ä»»ä½•ä¸€å¹€è®“éŠæˆ²ç¹¼çºŒé‹è¡Œï¼‰

---

## v0.13.6 - 2026-05-14

### èª¿æ•´
- **éŠæˆ²è¦–çª—æ”¾å¤§**ï¼šç•«å¸ƒå¾ž 800Ã—600 æ“´å¤§è‡³ 1600Ã—900ï¼›`#game-container` CSSã€`<canvas>` å±¬æ€§ã€`gameState.canvasWidth/Height`ã€`VIEW_W/VIEW_H` å¸¸æ•¸åŒæ­¥æ›´æ–°
- **è¦–è§’è§¸ç™¼é‚Šç•Œæ›´æ–°**ï¼šæ°´å¹³é‚Šç•Œ 25% = 400pxï¼Œåž‚ç›´é‚Šç•Œ 25% = 225pxï¼ˆç”± `VIEW_W/VIEW_H` è‡ªå‹•è¨ˆç®—ï¼Œç„¡éœ€æ‰‹å‹•ä¿®æ”¹ `updateCamera`ï¼‰
- **ç›¸æ©Ÿåˆå§‹ä½ç½®æ›´æ–°**ï¼š`camera.x` 3600 â†’ 3200ï¼ˆ4000 - 1600/2ï¼‰ï¼Œ`camera.y` 3700 â†’ 3550ï¼ˆ4000 - 900/2ï¼‰ï¼Œç¢ºä¿çŽ©å®¶å‡ºç”Ÿæ–¼åœ°åœ–æ­£ä¸­å¤®

---

## v0.13.5 - 2026-05-14

### ä¿®å¾©
- **Bug 1 â€” è¨­å®šä»‹é¢é–‹å•ŸæœŸé–“æ™‚é–“ç¹¼çºŒå€’æ•¸**ï¼š`hideSettings()` é—œé–‰è¨­å®šæ™‚é‡ç½® `gameState.lastTimeTick`ï¼Œé˜²æ­¢é—œé–‰å¾Œè£œç®—æš«åœæœŸé–“çš„æ™‚é–“
- **Bug 2 â€” æŒ‰éµé‡æ–°ç¶å®šç„¡åæ‡‰**ï¼šå®Œå…¨é‡å¯«ç¶å®šç³»çµ±ï¼šhandler ä»¥å…¨åŸŸè®Šæ•¸ï¼ˆ`_settingsKeyHandler`ã€`_settingsMouseHandler`ï¼‰å„²å­˜ç¢ºä¿å¯æ¸…é™¤ï¼›æ•ç²éšŽæ®µæ””æˆª Esc ä»¥å–æ¶ˆç¶å®šè€Œéžé—œé–‰è¨­å®šï¼›æ–°å¢ž 350ms é–ƒçˆå‹•ç•«ï¼ˆ`_rebindBlink`ï¼‰ï¼›5 ç§’ç„¡æ“ä½œè‡ªå‹•å–æ¶ˆï¼ˆ`_rebindTimeout`ï¼‰ï¼›æˆåŠŸç¶å®šæ’­æ”¾ç¢ºèªéŸ³æ•ˆ
- **Bug 3 â€” é¸æ“‡ç•«é¢é–‹å•Ÿæ™‚éŠæˆ²æœªå®Œå…¨æš«åœ**ï¼šæ–°å¢ž `isGamePaused()` çµ±ä¸€æš«åœåˆ¤æ–·ï¼Œ`gameLoop` æ”¹ç”¨æ­¤å‡½å¼ï¼›`showSkillTree()` è¨­å®š `gameState.skillTreeOpen = true`ï¼Œ`showVictory()` è¨­å®š `gameState.victory = true`ï¼Œç¢ºä¿æŠ€èƒ½æ¨¹èˆ‡å‹åˆ©ç•«é¢é–‹å•Ÿæ™‚éŠæˆ²é‚è¼¯å®Œå…¨åœæ­¢

---

## v0.13.4 - 2026-05-14

### æ–°å¢ž
- **éŸ³æ•ˆç³»çµ±**ï¼šæ–°å¢ž `AudioManager` ç‰©ä»¶ï¼Œçµ±ä¸€ç®¡ç†æ‰€æœ‰éŸ³æ•ˆèˆ‡èƒŒæ™¯éŸ³æ¨‚ï¼›éŸ³æ•ˆæª”æ¡ˆè·¯å¾‘å®šç¾©æ–¼ `gameConfig.js` çš„ `AUDIO_FILES` å¸¸æ•¸
- **èƒŒæ™¯éŸ³æ¨‚**ï¼šç™½å¤©/ç„¡ç²¾è‹±æ€ªå¤œæ™šæ’­æ”¾ `Morning Theme`ï¼Œç²¾è‹±æ€ªå¤œæ™šèˆ‡ Boss å‡ºç¾å¾Œåˆ‡æ› `Boss Theme`ï¼Œåˆ‡æ›æ™‚æ·¡å‡ºæ·¡å…¥ 0.5 ç§’
- **Boss å‡ºç¾å‰éˆ´è²**ï¼šè· Boss å‡ºç¾ç´„ 5 ç§’å‰ï¼ˆtimeRemaining â‰¤ 80ï¼‰æ’­æ”¾ `Boss_bell1.mp3`
- **éŸ³æ•ˆè§¸ç™¼**ï¼šæ”»æ“Šï¼ˆæ™®é€š/æš´æ“Šå„è‡ªéŸ³æ•ˆï¼Œå¤šç›®æ¨™ä»»ä¸€æš´æ“Š=æš´æ“ŠéŸ³æ•ˆï¼‰ã€å—å‚·ã€æ­»äº¡ã€å‡ç´šã€åƒæžœå­ã€å‹åˆ©
- **è¨­å®šä»‹é¢**ï¼šæŒ‰ `Esc` é–‹å•Ÿ/é—œé–‰ï¼ŒéŠæˆ²æš«åœï¼›åŠé€æ˜Žé®ç½©è¦†è“‹ç•«é¢
  - **éŸ³é‡è¨­å®š**ï¼šç¸½éŸ³é‡ã€éŸ³æ¨‚éŸ³é‡ã€éŸ³æ•ˆéŸ³é‡å„æœ‰æ»‘æ¡¿ï¼ˆ0-100ï¼Œæ­¥é€²10ï¼‰èˆ‡é–‹é—œ Toggleï¼Œå³æ™‚ç”Ÿæ•ˆ
  - **æŒ‰éµè¨­å®š**ï¼šç§»å‹•ä¸Š/ä¸‹/å·¦/å³ã€æ”»æ“Šéµå„å¯é»žæ“Šé‡æ–°ç¶å®šï¼ˆéµç›¤æˆ–æ»‘é¼ å·¦éµï¼‰ï¼Œç®­é ­éµ/æ»‘é¼ å·¦éµç‚ºå¸¸é§å‚™ç”¨
  - **å…¶ä»–è¨­å®š**ï¼šé‡å•ŸéŠæˆ²æŒ‰éˆ•ï¼ˆç¢ºèªå°è©±æ¡†ï¼‰ã€æ¢å¾©åŽŸå» è¨­å®šæŒ‰éˆ•
  - **åº•éƒ¨**ï¼šã€Œå„²å­˜ä¸¦è¿”å›žã€é—œé–‰ä»‹é¢ç¹¼çºŒéŠæˆ²
- **è¨­å®šæŒä¹…åŒ–**ï¼šéŸ³é‡èˆ‡æŒ‰éµè¨­å®šå­˜æ–¼ `localStorage.gameSettings`ï¼Œä¸å— `SAVE_VERSION` æ¸…é™¤å½±éŸ¿
- **æŒ‰éµç³»çµ±**ï¼šç§»å‹•æŒ‰éµæ”¹ç‚ºè®€å– `gameState.settings.keys`ï¼Œæ”¯æ´ä½¿ç”¨è€…è‡ªè¨‚ä¸»è¦æŒ‰éµ

---

## v0.13.3 - 2026-05-12

### èª¿æ•´
- **ç²¾è‹±æ€ªç®­é ­è·é›¢**ï¼šç®­é ­å¾žçŽ©å®¶ä¸­å¿ƒè·é›¢ 20px â†’ 50pxï¼›çŽ©å®¶åŠå¾‘æ¯è¶…å‡ºåŸºç¤Žå€¼ï¼ˆ10ï¼‰1pxï¼Œç®­é ­è·é›¢é¡å¤– +1pxï¼Œç¢ºä¿æ°¸é é¡¯ç¤ºåœ¨çŽ©å®¶åœ“åœˆå¤–å´

### æ–°å¢ž
- **å­˜æª”ç‰ˆæœ¬è™Ÿç³»çµ±**ï¼š`GAME_INFO` æ–°å¢ž `SAVE_VERSION: "1.0"`ï¼›éŠæˆ²å•Ÿå‹•æ™‚æ¯”å° localStorage å­˜æª”ç‰ˆæœ¬ï¼Œç‰ˆæœ¬ä¸ä¸€è‡´æˆ–ä¸å­˜åœ¨æ™‚è‡ªå‹•æ¸…é™¤æ‰€æœ‰å­˜æª”ï¼ˆ`playerSkills`ã€`skillPoints`ã€`savedOrgans`ã€`savedHiddenOrgans`ï¼‰ï¼Œä¸¦å¯«å…¥ç•¶å‰ç‰ˆæœ¬è™Ÿ

---

## v0.13.2 - 2026-05-12

### ä¿®å¾©
- **Bug1 éš±è—å™¨å®˜ç¹¼æ‰¿æ”¹ç‚ºä¸»å‹•é¸æ“‡**ï¼šéŠæˆ²çµæŸå¾Œä¸å†è‡ªå‹•ç¹¼æ‰¿å…¨éƒ¨éš±è—å™¨å®˜ï¼›æŠ€èƒ½æ¨¹ä»‹é¢æ–°å¢žã€Œâœ¨ é¸æ“‡ä¿ç•™ä¸€å€‹éš±è—å™¨å®˜ï¼ˆå¯ä¸é¸ï¼‰ã€å€å¡Šï¼ŒçŽ©å®¶é»žæ“Šé¸å®š 1 å€‹æˆ–è·³éŽï¼›æ™®é€šå™¨å®˜èˆ‡éš±è—å™¨å®˜å„è‡ªç¨ç«‹é¸æ“‡

### èª¿æ•´
- **ç›¸æ©Ÿè§¸ç™¼è·é›¢**ï¼šé‚Šç•Œè§¸ç™¼æ¯”ä¾‹ 20% â†’ 25%ï¼Œè¦–è§’è·Ÿéš¨æ›´ç©æ¥µ
- **ç”Ÿç‰©åç¨±é¡¯ç¤º**ï¼šæ‰€æœ‰å¸¶æœ‰ `name` å±¬æ€§çš„ç”Ÿç‰©ï¼ˆå« Bossï¼‰åœ¨è¡€æ¢æ­£ä¸Šæ–¹ä»¥ 12px ç™½è‰²æ–‡å­— + é»‘è‰²é™°å½±é¡¯ç¤ºåç¨±
- **Boss ç™¼å…‰æ•ˆæžœ**ï¼šBoss ç¹ªè£½æ”¹ç”¨ `shadowBlur` é–ƒçˆç™¼å…‰ï¼Œå„åœ°å½¢ Boss å°ˆå±¬ç™¼å…‰é¡è‰²ï¼ˆé»‘ç†Š `#8B4513`ã€å¤§ç™½é¯Š `#1a3a5c`ã€è çŽ‹ `#8B6914`ï¼‰ï¼›`BOSS_CONFIG` æ–°å¢ž `glowColor` æ¬„ä½
- **é«”åž‹èˆ‡æ”»æ“Šç¯„åœ 1:1 åŒæ­¥**ï¼šä¿®æ­£ `applyOrganEffects` å’Œ `applyHiddenOrganEffects` çš„ `radiusAdd` å…¬å¼ï¼Œæ”¹ç‚ºå…ˆä»¥èˆŠåŠå¾‘è¨ˆç®—æ¯”ä¾‹å¢žé‡å†åŠ åŠå¾‘ï¼Œç¢ºä¿æ”»æ“Šç¯„åœèˆ‡é«”åž‹ç­‰æ¯”ä¾‹å¢žåŠ 
- **åŽšçš® Lv2/Lv3**ï¼š`radiusAdd` ç”± 1 æ”¹ç‚º 2ï¼ˆå°æ‡‰é«”åž‹+20%ï¼‰ï¼ŒåŒæ™‚æ›´æ–°æè¿°æ–‡å­—
- **å¼·å¤§çš„å¿ƒè‡Ÿ**ï¼šç§»é™¤ `attackRangeAdd: 5` é¡å¤–åŠ æˆï¼Œæ”»æ“Šç¯„åœæ”¹ç”± `radiusAdd` ç­‰æ¯”ä¾‹å…¬å¼è¨ˆç®—ï¼›æ›´æ–°æè¿°
- **å¼·å¤§çš„æ‰‹è‡‚**ï¼šç§»é™¤ `attackRangeAdd: 5` é¡å¤–åŠ æˆï¼Œæ”»æ“Šç¯„åœæ”¹ç”± `radiusAdd` ç­‰æ¯”ä¾‹å…¬å¼è¨ˆç®—ï¼›æ›´æ–°æè¿°

---

## v0.13.1 - 2026-05-12

### ä¿®å¾©
- **Bug1 æŠ€èƒ½æ¨¹æ»¾è¼ª**ï¼šæŠ€èƒ½æ¨¹ overlay åŠ å…¥ `wheel` äº‹ä»¶ `stopPropagation`ï¼Œä¸¦æ”¹ç”¨ `overflow-y:scroll` ç¢ºä¿æ²å‹•ä¸å¤–æº¢è‡³é é¢
- **Bug2 å¹¸é‹é‡é¸æ¬¡æ•¸**ï¼šé‡é¸æ¬¡æ•¸æ”¹ç‚ºå…¨å±€è¨ˆæ•¸ `gameState.player.rerollsRemaining`ï¼Œæ•´å ´éŠæˆ²å…±ç”¨ï¼ˆè€Œéžæ¯æ¬¡é¸æ“‡ç•«é¢é‡ç½®ï¼‰ï¼›æ¬¡æ•¸è€—ç›¡å¾ŒæŒ‰éˆ•è®Šç°ä¸å¯é»žæ“Š
- **Bug3 éš±è—å™¨å®˜ç¹¼æ‰¿é¡¯ç¤º**ï¼šæŠ€èƒ½æ¨¹ä»‹é¢æ–°å¢žã€Œâœ¨ ä»¥ä¸‹éš±è—å™¨å®˜å°‡è‡ªå‹•ç¹¼æ‰¿ã€å€å¡Šï¼Œä»¥é‡‘è‰²é‚Šæ¡†åˆ—å‡ºæ‰€æœ‰æŒæœ‰çš„éš±è—å™¨å®˜ï¼Œè®“çŽ©å®¶çœ‹åˆ°ç¹¼æ‰¿æ¸…å–®
- **Bug4 è¨˜æ†¶å™¨å®˜ä¿ç•™æ•¸é‡**ï¼šç§»é™¤ä¿ç•™æ•¸ä¸Šé™ `Math.min(3,â€¦)`ï¼ŒLv3 ç¾å¯æ­£ç¢ºä¿ç•™ 4 å€‹å™¨å®˜ï¼ˆ0ç´š=1å€‹ï¼Œ1ç´š=2å€‹ï¼Œ2ç´š=3å€‹ï¼Œ3ç´š=4å€‹ï¼‰ï¼›æ›´æ–° `gameConfig.js` èªªæ˜Žæ–‡å­—

---

## v0.13.0 - 2026-05-12

### ä¿®å¾©
- **å™¨å®˜å‡ç´šæ§½ä½è¨ˆç®—**ï¼š`organSlotsUsed` æ”¹ç‚ºæ‰€æœ‰å™¨å®˜ç­‰ç´šç¸½å’Œï¼ˆLv.3 ä½”3æ§½ã€Lv.2 ä½”2æ§½ã€Lv.1 ä½”1æ§½ï¼‰ï¼Œé€²åŒ–è§¸ç™¼æ¢ä»¶æ”¹ç‚º `organSlotsUsed >= organSlots`

### æ–°å¢ž
- **æŠ€èƒ½æ¨¹é‡ç½®æŒ‰éˆ•**ï¼šæŠ€èƒ½æ¨¹ä»‹é¢æ–°å¢žã€Œé‡ç½®æŠ€èƒ½é»žã€æŒ‰éˆ•ï¼Œå½ˆå‡ºç¢ºèªå°è©±æ¡†å¾Œæ­¸é›¶å…¨éƒ¨æŠ€èƒ½ï¼Œè¿”é‚„å·²èŠ±è²»é»žæ•¸
- **æŠ€èƒ½ï¼šå¹¸é‹é‡é¸**ï¼ˆMax 3 ç´šï¼‰ï¼šå™¨å®˜é¸æ“‡ç•«é¢æ–°å¢žã€Œé‡æ–°éš¨æ©Ÿã€æŒ‰éˆ•ï¼Œæ¯å±€æ¯æ¬¡é¸æ“‡å¯ç”¨æ¬¡æ•¸=æŠ€èƒ½ç­‰ç´š
- **æŠ€èƒ½ï¼šæ”¶é›†æˆç™®**ï¼ˆMax 3 ç´šï¼‰ï¼šæ¯ç´šå¢žåŠ  10px æ”¶é›†ç¯„åœï¼ˆæžœå­å’Œå±é«”ï¼‰
- **æŠ€èƒ½ï¼šææ€–ä¹‹ç‰™**ï¼ˆMax 5 ç´šï¼‰ï¼šæ¯ç´šå¢žåŠ  2 é»žæ”»æ“ŠåŠ›ï¼›ç¬¬ 5 ç´šæ™‚é–‹å±€ç›´æŽ¥ç²å¾—ç ç‰™ Lv.1
- **æ¯’åˆºä¸»å‹•æ”»æ“Š**ï¼šæ¯’åˆº Lv.1 æ–°å¢žåŸºç¤Žæ”»æ“ŠåŠ› +1ï¼Œå¯è§¸ç™¼çŽ©å®¶ä¸»å‹•æ”»æ“Šï¼Œæ”»æ“Šæ™‚é™„åŠ ä¸­æ¯’æ•ˆæžœï¼›æ–°æ‰‹ä¿è­·é‚è¼¯è¦–ç‚ºæ”»æ“Šå™¨å®˜ï¼ˆåŽŸæœ¬å°±æ˜¯ attack é¡žåž‹ï¼‰
- **éš±è—å™¨å®˜ç³»çµ±**ï¼šæ“Šæ•—ç²¾è‹±æ€ªå¾Œæ¯å€‹éš±è—å™¨å®˜æœ‰ 50% æ©ŸçŽ‡æŽ‰è½ï¼Œä»¥é‡‘è‰²é‚Šæ¡†é¸æ“‡ä»‹é¢å‘ˆç¾ï¼ˆæ¨™é¡Œã€Œâœ¨ éš±è—å™¨å®˜æŽ‰è½ï¼ã€ï¼‰ï¼›å¤šå€‹åŒæ™‚æŽ‰è½åªèƒ½é¸ 1 å€‹ï¼›ä¸ä½”æ™®é€šå™¨å®˜æ§½ä½ï¼›æ­»äº¡å¾Œè‡ªå‹•ç¹¼æ‰¿è‡³ä¸‹ä¸€å±€
- **éš±è—å™¨å®˜ - å¼·å¤§çš„å¿ƒè‡Ÿ**ï¼šç§»é€Ÿ+0.2ã€æ”»æ“Š+5ã€HPä¸Šé™+100ã€é«”åž‹+20%ã€æ”»æ“Šç¯„åœ+10%
- **éš±è—å™¨å®˜ - å¼·å¤§çš„å¤§è…¿**ï¼šç§»é€Ÿ+1ã€é«”åž‹+20%
- **éš±è—å™¨å®˜ - å¼·å¤§çš„æ‰‹è‡‚**ï¼šæ”¶é›†ç¯„åœ+15pxã€æ”»æ“Šç¯„åœ+10%ã€é«”åž‹+20%
- `gameConfig.js` æ–°å¢ž `HIDDEN_ORGANS` å¸¸æ•¸å®šç¾©ä¸‰å€‹éš±è—å™¨å®˜
- å™¨å®˜æ¸…å–®å·¦ä¸‹è§’æœ€åº•éƒ¨ä»¥é‡‘è‰²æ–‡å­—é¡¯ç¤ºå·²æŒæœ‰çš„éš±è—å™¨å®˜ï¼ˆã€Œâœ¨ å™¨å®˜åç¨±ã€ï¼‰

---

## v0.12.0 - 2026-05-11

### æ–°å¢ž
- ç„¡ç¸«å¾ªç’°åœ°åœ–ï¼ˆç’°å½¢ä¸–ç•Œï¼‰ï¼šçŽ©å®¶èµ°åˆ°é‚Šç•Œè‡ªå‹•å¾žå°å´å‡ºç¾
- `wrappedDistance(x1,y1,x2,y2)` â€” è¨ˆç®—ç’°ç¹žä¸–ç•Œä¸­çš„æœ€çŸ­è·é›¢
- `wrappedDelta(ax,ay,bx,by)` â€” å›žå‚³æœ€çŸ­è·¯å¾‘æ–¹å‘å‘é‡ï¼ˆdx/dyï¼‰
- `worldToScreen` åŠ å…¥ç’°ç¹žä¿®æ­£ï¼Œè·¨é‚Šç•Œç‰©ä»¶æ­£ç¢ºé¡¯ç¤ºæ–¼èž¢å¹•

### èª¿æ•´
- çŽ©å®¶ç§»å‹•æ”¹ç‚ºç’°ç¹žï¼ˆæ¨¡é‹ç®—ï¼‰ï¼Œä¸å†è¢«é‚Šç•Œé˜»æ“‹
- `moveCreature` æ”¹ç‚ºç’°ç¹žï¼Œæ‰€æœ‰ç”Ÿç‰©ï¼ˆä¸­ç«‹/æ•µæ„/ç²¾è‹±/Bossï¼‰éƒ½èƒ½ç©¿è¶Šé‚Šç•Œ
- ç›¸æ©Ÿè¿½è¹¤æ”¹ç‚ºç’°ç¹žæ„ŸçŸ¥ï¼Œè·¨é‚Šç•Œæ™‚å¹³æ»‘éŽæ¸¡
- æ‰€æœ‰ AI çš„è·é›¢åµæ¸¬ï¼ˆaggroã€æ”»æ“Šç¯„åœã€é€ƒè·‘ï¼‰æ”¹ç”¨ `wrappedDistance`
- æ‰€æœ‰ AI ç§»å‹•æ–¹å‘æ”¹ç”¨ `wrappedDelta` å–æœ€çŸ­è·¯å¾‘
- æžœå­æ‹¾å–ã€å¯¶ç‰©ç¢°æ’žã€å¤§è…¦æ³¢ã€åƒå±é«”ç­‰çŽ©å®¶è¡Œå‹•æ”¹ç”¨ `wrappedDistance`
- ç²¾è‹±æ€ªæ–¹å‘ç®­é ­æ”¹ç”¨ `wrappedDelta` è¨ˆç®—æ­£ç¢ºæ–¹å‘

---

## v0.11.1 - 2026-05-11

### æ–°å¢ž
- ç²¾è‹±æ€ªæ–¹å‘æŒ‡ç¤ºç®­é ­ï¼šç²¾è‹±æ€ªåœ¨èž¢å¹•å¤–æ™‚ï¼Œæ–¼çŽ©å®¶åœ“å½¢å¤–åœ 20px è™•é¡¯ç¤ºæœå‘ç®­é ­
- ç®­é ­é¡è‰²ï¼šè‰é£Ÿæ€§ç²¾è‹±é‡‘è‰²ï¼ˆ#FFD700ï¼‰ï¼Œè‚‰é£Ÿæ€§ç²¾è‹±ç´«è‰²ï¼ˆ#9B59B6ï¼‰
- ç®­é ­æ¯ 0.5 ç§’åœ¨é€æ˜Žåº¦ 0.6â†”1.0 ä¹‹é–“é–ƒçˆï¼Œç²¾è‹±é€²å…¥èž¢å¹•ç¯„åœå¾Œè‡ªå‹•æ¶ˆå¤±
- ç²¾è‹±æ€ªç”Ÿæˆæ™‚éš¨æ©Ÿåˆ†é… `diet`ï¼ˆherbivore / carnivoreï¼‰æ¬„ä½

---

## v0.11.0 - 2026-05-11

### ä¿®å¾©
- Bug 1ï¼šå™¨å®˜æ§½ä½æ”¹ç”¨ `organs.length` è¨ˆç®—ï¼Œå‡ç´šå™¨å®˜ä¸å†ä½”ç”¨é¡å¤–æ§½ä½
- Bug 2ï¼šæµ·æ´‹æ•µæ„ç”Ÿç‰©é¡è‰²æ”¹ç‚º `#CC4466`ï¼ˆç²‰ç´…ï¼‰ã€æ²™æ¼ æ”¹ç‚º `#CC8800`ï¼ˆæ©™é»ƒï¼‰ï¼Œé¿å…èˆ‡èƒŒæ™¯æ··è‰²
- Bug 3ï¼šç§»é™¤å…¨åŸŸæžœå­æ•¸é‡ä¸Šé™ï¼ˆåŽŸ 80 é¡†ï¼‰ï¼Œæ¯æ£µæ¨¹åƒ…å—è‡ªèº«ä¸Šé™ï¼ˆå¤§æ¨¹5/å°æ¨¹3ï¼‰æŽ§åˆ¶ï¼›æ¯å¹€å‹•æ…‹æŽƒæé™„è¿‘æžœå­æ•¸

### æ–°å¢ž
- é–‹ç™¼è€…æ¨¡å¼é¢æ¿é ‚éƒ¨æ–°å¢žå³æ™‚çµ±è¨ˆï¼šæžœå­ç¸½æ•¸ã€ä¸­ç«‹/æ•µæ„ç”Ÿç‰©æ•¸é‡èˆ‡ä¸Šé™ï¼Œæ¯å¹€æ›´æ–°
- `gameConfig.js` æ–°å¢ž `GAME_TIMING` å¸¸æ•¸è¨˜éŒ„æ™‚æ®µé‚Šç•Œ

### èª¿æ•´
- éŠæˆ²æ™‚é–“å¾ž 20 åˆ†é˜ç¸®çŸ­ç‚º **10 åˆ†é˜**ï¼ˆ1200 ç§’ â†’ 600 ç§’ï¼‰
- æ—¥å¤œå¾ªç’°ï¼šæ¯æ®µå¾ž 150 ç§’ç¸®çŸ­ç‚º **75 ç§’**ï¼ˆ1 åˆ† 15 ç§’ï¼‰ï¼Œå…± 8 æ®µ
- ç”Ÿç‰©å¼·åŒ–å€çŽ‡è¨ˆç®—é€±æœŸå°æ‡‰æ›´æ–°ï¼ˆæ¯ 150 ç§’ä¸€ç´šï¼‰

---

## v0.10.2 - 2026-05-11

### ä¿®å¾©
- æ¨¹æœ¨æžœå­è¨ˆæ™‚å™¨æ”¹ç‚º `deltaTime` ç´¯åŠ ï¼ˆ`tree.fruitTimer += dt`ï¼‰ï¼Œç”Ÿç”¢å¾Œé‡ç½®ç‚º 0ï¼Œé¿å…è·³å¹€èª¤å·®
- Dev æ¨¡å¼æ–¼æ¯æ£µæ¨¹ä¸Šæ–¹é¡¯ç¤ºã€Œé™„è¿‘æžœå­æ•¸/æœ€å¤§ä¸Šé™ã€ï¼ˆé‡‘è‰²æ–‡å­—ï¼‰
- `initializeGame` ç¢ºä¿ `fruitTimer: 0` èˆ‡ `treeSize: 'large'/'small'` æ­£ç¢ºåˆå§‹åŒ–

### èª¿æ•´
- ç”Ÿç‰©åˆ†æ•£æ ¼å¾ž 4Ã—4ï¼ˆæ¯æ ¼ 2000pxï¼‰æ“´å¤§ç‚º **5Ã—5ï¼ˆæ¯æ ¼ 1600pxï¼‰**ï¼Œè¦†è“‹ 8000Ã—8000 å…¨åœ–
- åˆå§‹ç”Ÿæˆï¼šä¸­ç«‹ç”Ÿç‰© 50 éš»ï¼ˆ25 æ ¼ Ã— 2ï¼‰ã€æ•µæ„ç”Ÿç‰© 25 éš»ï¼ˆ25 æ ¼ Ã— 1ï¼‰
- æœ€å¤§ä¸Šé™ï¼šä¸­ç«‹ç”Ÿç‰© **50 éš»**ï¼ˆåŽŸ 30ï¼‰ã€æ•µæ„ç”Ÿç‰© **35 éš»**ï¼ˆåŽŸ 20ï¼‰
- `spawnCreatureAtEdge()` åŠ æ¬Šæ ¼é¸æ©Ÿåˆ¶åŒæ­¥æ›´æ–°ç‚º 5Ã—5 é…ç½®

---

## v0.10.1 - 2026-05-11

### æ–°å¢ž
- æ¨¹æœ¨åˆ†å¤§/å°å…©ç¨®ï¼šå¤§æ¨¹ï¼ˆåŠå¾‘ 25â€“35pxï¼Œä½” 40%ï¼‰å’Œå°æ¨¹ï¼ˆ12â€“20pxï¼Œä½” 60%ï¼‰
- æ¯æ£µæ¨¹ç¨ç«‹ç®¡ç†é™„è¿‘æžœå­ç”Ÿç”¢ï¼ˆ`tree.fruitTimer` / `tree.fruitCount`ï¼‰ï¼Œå–ä»£å…¨åŸŸ `manageFruitSpawning`
- å¤§æ¨¹ï¼šé™„è¿‘ 80px æœ€å¤š 5 é¡†ï¼Œå°æ¨¹ï¼š60px æœ€å¤š 3 é¡†ï¼›æžœå­é–“éš” 9s/19.5s/30sï¼ˆä¾é™„è¿‘ 0/1/2+é¡†æ±ºå®šï¼‰
- `spawnFruitFromTree(tree)` å‡½å¼ï¼šåœ¨æ¨¹åŠå¾‘+20px ç¯„åœå…§ç”Ÿæˆæžœå­
- ç”Ÿç‰©åˆå§‹ç”ŸæˆæŽ¡ç”¨ 4Ã—4 æ ¼ï¼ˆæ¯æ ¼ 2000Ã—2000pxï¼‰åˆ†æ•£æ©Ÿåˆ¶ï¼Œæ¯æ ¼è‡³å°‘ 1 éš»
- `spawnCreatureAtEdge()` æ”¹ç‚ºåŠ æ¬Šéš¨æ©Ÿé¸æ ¼ç¹æ®–ï¼šå­˜æ´»è¶Šå°‘çš„æ ¼å­è¢«é¸ä¸­æ©ŸçŽ‡è¶Šé«˜

### èª¿æ•´
- åˆå§‹ç”Ÿæˆï¼šæ¨¹æœ¨ 150 æ£µã€æžœå­ 80 é¡†ï¼ˆå¾žå„æ£µæ¨¹åˆ†æ•£ç”Ÿæˆï¼‰ã€ä¸­ç«‹ç”Ÿç‰© 20 éš»ï¼ˆ4Ã—4 æ ¼ï¼‰ã€æ•µæ„ç”Ÿç‰© 10 éš»
- æœ€å¤§ä¸Šé™ï¼šä¸­ç«‹ç”Ÿç‰© 30 éš»ã€æ•µæ„ç”Ÿç‰© 20 éš»

---

## v0.10.0 - 2026-05-11

### æ–°å¢ž
- å¤§åœ°åœ–ç¬¬äºŒéšŽæ®µï¼šåœ°åœ–å¾ž 2400Ã—1800 æ“´å¤§è‡³ 8000Ã—8000ï¼Œè¦–çª—ä»ç¶­æŒ 800Ã—600
- ä¸‰ç¨®åœ°å½¢å€åŸŸï¼šæ£®æž—ï¼ˆä¸­å¤® 2000px åŠå¾‘ï¼‰ã€æµ·æ´‹ï¼ˆx>5000 æˆ– y>5000ï¼‰ã€æ²™æ¼ ï¼ˆå…¶é¤˜ï¼‰
- `getBiome(x, y)` å‡½å¼ï¼šæ ¹æ“šä¸–ç•Œåº§æ¨™å›žå‚³åœ°å½¢ 'forest' / 'ocean' / 'desert'
- `getBgColor()` å‡½å¼ï¼šä¾çŽ©å®¶ä½ç½®è¨ˆç®—èƒŒæ™¯é¡è‰²ï¼Œåœ°å½¢é‚Šç•Œ 200px éŽæ¸¡æ¼¸è®Š
- åœ°å½¢è¦–è¦ºï¼šæ£®æž—ç¶ ã€æµ·æ´‹è—ã€æ²™æ¼ æ²™è‰²ï¼Œå¤œæ™šå„æœ‰å°æ‡‰æ·±è‰²ç‰ˆæœ¬
- åœ°å½¢å°ˆå±¬æ¨¹æœ¨é¡è‰²ï¼šæ£®æž—æ·±ç¶ ã€æµ·æ´‹æ·±è—ï¼ˆçŠç‘šï¼‰ã€æ²™æ¼ æ©„æ¬–è‰²ï¼ˆä»™äººæŽŒï¼‰
- åœ°å½¢å°ˆå±¬æžœå­é¡è‰²ï¼šæ£®æž—ç´…ã€æµ·æ´‹è—ï¼ˆè—»é¡žï¼‰ã€æ²™æ¼ æ©™
- åœ°å½¢å°ˆå±¬ç”Ÿç‰©é¡è‰²ï¼šä¸­ç«‹/æ•µæ„ç”Ÿç‰©ä¾æ‰€åœ¨åœ°å½¢å¥—ç”¨è—/é»ƒè‰²èª¿
- ä¸‰ç¨®åœ°å½¢ Bossï¼ˆç”±çŽ©å®¶æ‰€åœ¨åœ°å½¢æ±ºå®šï¼‰ï¼šæ£®æž—é»‘ç†Šï¼ˆç¾æœ‰ï¼‰ã€æµ·æ´‹å¤§ç™½é¯Šï¼ˆHP 600ã€é€Ÿåº¦ 1.3ã€å‚·å®³ 18ï¼‰ã€æ²™æ¼ è çŽ‹ï¼ˆHP 550ã€é€Ÿåº¦ 1.2ã€å‚·å®³ 20ï¼‰ï¼›Boss é…ç½®ç§»è‡³ `BOSS_CONFIG`ï¼ˆ`gameConfig.js`ï¼‰
- å³ä¸Šè§’æ–°å¢žåœ°å½¢é¡¯ç¤ºï¼šã€ŒðŸŒ² æ£®æž—ã€/ã€ŒðŸŒŠ æµ·æ´‹ã€/ã€ŒðŸœï¸ æ²™æ¼ ã€

### èª¿æ•´
- çŽ©å®¶å‡ºç”Ÿé»žæ”¹ç‚ºåœ°åœ–ä¸­å¤® (4000, 4000)ï¼Œåˆå§‹æ”å½±æ©Ÿå°é½Š (3600, 3700)
- æ¨¹æœ¨å¢žè‡³ 100 æ£µï¼›åˆå§‹æžœå­ 50 é¡†ï¼ŒMAX_FRUITS 80
- åˆå§‹ä¸­ç«‹ç”Ÿç‰© 8 éš»ï¼ˆæœ€å¤š 20ï¼‰ï¼Œåˆå§‹æ•µæ„ç”Ÿç‰© 5 éš»ï¼ˆæœ€å¤š 15ï¼‰
- å‹åˆ©ç•«é¢ Boss åç¨±å‹•æ…‹é¡¯ç¤ºï¼ˆä¾æ“Šæ®ºçš„ Boss ç¨®é¡žï¼‰

### ä¿®å¾©
- `updateNeutralCreatures()` æ”»æ“Šåž‹ç”Ÿç‰©è¿½æ“Š/æ¼«éŠå’Œé€ƒè·‘ç§»å‹•é‚Šç•Œä»ä½¿ç”¨èˆŠçš„ 800Ã—600 é™åˆ¶ï¼Œæ”¹ç‚º MAP_WIDTH/MAP_HEIGHT
- `devSpawnNeutral/devSpawnHostile` ç”Ÿæˆé‚Šç•ŒåŒæ­¥ä¿®æ­£ç‚º MAP_WIDTH/MAP_HEIGHT

---

## v0.9.4 - 2026-05-11

### æ–°å¢ž
- å¤§åœ°åœ–ç¬¬ä¸€éšŽæ®µï¼šåœ°åœ–å¯¦éš›å°ºå¯¸å¾ž 800Ã—600 æ“´å¤§è‡³ 2400Ã—1800ï¼Œè¦–çª—é¡¯ç¤ºç¶­æŒ 800Ã—600
- æ–°å¢ž `MAP_WIDTH / MAP_HEIGHT / VIEW_W / VIEW_H` å¸¸æ•¸ï¼Œ`gameState.camera { x, y }` è¦–è§’åç§»
- `worldToScreen(wx, wy)` å‡½å¼ï¼šç¹ªè£½æ™‚çµ±ä¸€æ›ç®—ä¸–ç•Œâ†’èž¢å¹•åº§æ¨™
- `updateCamera()` å¹³æ»‘è¦–è§’è·Ÿéš¨ï¼šçŽ©å®¶é€²å…¥è¦–çª—é‚Šç•Œ 20%ï¼ˆ160px / 120pxï¼‰æ‰é–‹å§‹ç§»å‹•ï¼ŒLerp ä¿‚æ•¸ 0.15ï¼Œè¦–è§’å¤¾åœ¨åœ°åœ–é‚Šç•Œå…§
- çŽ©å®¶å‡ºç”Ÿé»žæ”¹ç‚ºåœ°åœ–ä¸­å¤® (1200, 900)ï¼Œåˆå§‹æ”å½±æ©Ÿå°é½ŠçŽ©å®¶ (800, 600)

### èª¿æ•´
- æ‰€æœ‰ draw å‡½å¼ï¼ˆæ¨¹æœ¨ã€æžœå­ã€å±é«”ã€ç”Ÿç‰©ã€å¯¶ç‰©ã€Bossã€ç²¾è‹±æ€ªã€çŽ©å®¶ï¼‰å¥—ç”¨ worldToScreen + cullingï¼Œèž¢å¹•å¤– Â±50px ä¸ç¹ªè£½
- `showFloatingText` / `showXPPopup` æ”¹ç‚ºå‚³å…¥ä¸–ç•Œåº§æ¨™ï¼Œè½‰æ›å¾Œè²¼åˆ° DOM
- æ‰€æœ‰ç”Ÿç‰©ç”Ÿæˆã€wander target æ”¹ç”¨ MAP_WIDTH/HEIGHTï¼›æ¨¹æœ¨å¢žè‡³ 60 æ£µï¼ŒMAX_FRUITS å¢žè‡³ 60
- `gameLoop` åŠ å…¥ `updateCamera()` å‘¼å«ï¼ˆåœ¨ `updatePlayerMovement` ä¹‹å¾Œï¼‰
- UIï¼ˆHP/XP åˆ—ã€æ™‚é–“æ¬„ã€å™¨å®˜æ¸…å–®ã€è¨Šæ¯æç¤ºï¼‰å›ºå®šèž¢å¹•åº§æ¨™ï¼Œä¸è·Ÿéš¨ camera

---

## v0.9.3 - 2026-05-10

### èª¿æ•´
- çŽ©å®¶è§’è‰²è¼ªå»“ï¼šç§»é™¤ç™½å¤©è¼ªå»“ï¼Œå¤œæ™šç¶­æŒèž¢å…‰ç¶ ï¼ˆ#00ff88ï¼ŒåŠå¾‘+3pxï¼Œé€æ˜Žåº¦ 0.9ï¼‰

---

## v0.9.2 - 2026-05-10

### æ–°å¢ž
- çŽ©å®¶è§’è‰²è¼ªå»“ï¼šç™½å¤©é¡¯ç¤ºç™½è‰²è¼ªå»“ï¼ˆåŠå¾‘+2pxï¼Œé€æ˜Žåº¦ 0.8ï¼‰ï¼Œå¤œæ™šé¡¯ç¤ºèž¢å…‰ç¶ è¼ªå»“ï¼ˆ#00ff88ï¼ŒåŠå¾‘+3pxï¼Œé€æ˜Žåº¦ 0.9ï¼‰ï¼Œæå‡å¤œé–“å¯è¦‹åº¦

---

## v0.9.1 - 2026-05-10

### ä¿®å¾©
- ç²¾è‹±æ€ªæ“Šæ®ºå¾Œæœªè·³åˆ°ç™½å¤©ï¼š`handleEliteKill()` ä¾ç•¶å‰å¤œæ™šç›¸ä½è¨ˆç®—ä¸‹ä¸€å€‹ç™½å¤©æ™‚é–“é»žï¼ˆ`1200 - (phaseIndex + 1) * 150`ï¼‰ï¼Œè¨­å®š `timeRemaining` å¾Œç«‹å³å‘¼å« `updateDayNightCycle()`ï¼Œå†è¦†å¯«è¨Šæ¯ç‚ºã€Œâ˜€ï¸ ç²¾è‹±å·²æ»…ï¼é»Žæ˜Žæå‰åˆ°ä¾†ï¼ã€

### æ–°å¢ž
- å·¦ä¸‹è§’å™¨å®˜æ¸…å–®é ‚éƒ¨æ–°å¢žæ§½ä½è¡Œã€Œå™¨å®˜ï¼šX / Yã€ï¼Œæ§½ä½å·²æ»¿æ™‚ä»¥é‡‘è‰²é¡¯ç¤ºã€Œâœ¨å¯é€²åŒ–ã€ï¼›å™¨å®˜æ¡†é«˜åº¦å›ºå®šåŒ…å«æ­¤è¡Œï¼ˆå³ä½¿å™¨å®˜æ¸…å–®ç‚ºç©ºä¹Ÿé¡¯ç¤ºï¼‰

---

## v0.9.0 - 2026-05-10

### æ–°å¢ž
- ç²¾è‹±æ€ªç³»çµ±ï¼šæ¯æ™šï¼ˆç¬¬ 1ï½ž3 å¤œï¼‰é»‘å¤œé–‹å§‹æ™‚å¾žåœ°åœ–é‚Šç·£ç”Ÿæˆä¸€éš»ç²¾è‹±æ€ªï¼Œå…±ä¸‰å€‹ç­‰ç´šï¼ˆâ˜…/â˜…â˜…/â˜…â˜…â˜…ï¼‰ï¼Œæ•¸å€¼éš¨å¤œæ™šéžå¢žï¼ˆHPÃ—5/7.5/10ã€é€Ÿåº¦ 1.3/1.5/1.7ã€å‚·å®³ 12/15/18ï¼‰
- æ“Šæ®ºç²¾è‹±æ€ªï¼šçµ¦äºˆ 150/225/300 XP å’Œ 1 å€‹æŠ€èƒ½é»žï¼Œèž¢å¹•è¨Šæ¯æç¤ºï¼›æ­»äº¡ç”± `handleEliteKill()` çµ±ä¸€è™•ç†ï¼ˆæ”¯æ´ç›´æŽ¥æ”»æ“Šã€åˆºç”²åå‚·ã€æµè¡€ã€ä¸­æ¯’å››æ¢è·¯å¾‘ï¼‰
- ç²¾è‹±æ€ªå­˜æ´»è‡³é»Žæ˜Žæ™‚è‡ªå‹•æ’¤é€€ï¼Œè¨Šæ¯é¡¯ç¤ºã€Œç²¾è‹±æ€ªæ’¤é€€äº†ã€
- è¦–è¦ºï¼šé‡‘è‰²å…‰æšˆï¼ˆshadowBlurï¼‰ã€ç´«è‰² HP æ¢ã€é‡‘è‰²æ˜Ÿè™Ÿæ¨™ç±¤
- `ELITE_CONFIG` åŠ å…¥ `gameConfig.js`ï¼Œçµ±ä¸€ç®¡ç†ä¸‰å€‹ç­‰ç´šçš„æ•¸å€¼èˆ‡æ¨™ç±¤

---

## v0.8.6 - 2026-05-10

### èª¿æ•´
- å·¦ä¸‹è§’é€²åŒ–ç‹€æ…‹æ”¹ç‚ºé¡¯ç¤ºæ‰€æœ‰å·²è§£éŽ–è·¯ç·šï¼ˆæ¯æ¢å„ä½”ä¸€è¡Œï¼‰ï¼Œæ ¼å¼ç‚ºã€ŒðŸŒ¿ è‰é£Ÿæ€§ Lv.Xã€ï¼Œæœªè§£éŽ–çš„è·¯ç·šï¼ˆç­‰ç´š 0ï¼‰ä¸é¡¯ç¤ºï¼›é€²åŒ–æ¡†é«˜åº¦å‹•æ…‹éš¨è§£éŽ–æ•¸é‡èª¿æ•´ï¼Œèˆ‡å™¨å®˜æ¡†å’Œç‰ˆæœ¬è³‡è¨Šä¸é‡ç–Š

---

## v0.8.5 - 2026-05-10

### ä¿®å¾©
- HP é¡¯ç¤ºå°æ•¸é»žï¼š`updateUI()` æ”¹ç”¨ `Math.round()` å–æ•´
- é€£çºŒå‡å¤šç´šå°Žè‡´å™¨å®˜é‡è¤‡ï¼šæ–°å¢ž `pendingOrganSelections` è¨ˆæ•¸å™¨ï¼Œé¸æ“‡ç•«é¢é–‹å•Ÿä¸­æ™‚æŽ’éšŠç­‰å¾…ï¼Œé—œé–‰å¾Œä¾åºé¡¯ç¤ºä¸‹ä¸€å€‹
- æ™‚é–“è€—ç›¡ç„¡æ³•é€²å…¥æŠ€èƒ½æ¨¹ï¼š`updateTimer()` æ”¹å‘¼å« `showSkillTree('timeout')`ï¼Œèµ°èˆ‡æ­»äº¡ç›¸åŒçš„å™¨å®˜ä¿ç•™â†’æŠ€èƒ½æ¨¹æµç¨‹ï¼›æŠ€èƒ½æ¨¹æ¨™é¡Œå‹•æ…‹é¡¯ç¤ºã€Œâ° æ™‚é–“è€—ç›¡ã€æˆ–ã€ŒðŸ’€ ä½ æ­»äº†ã€
- åˆºç”²åå½ˆå‚·å®³è‡´æ­»ä¸çµ¦ç¶“é©—ï¼š`applyDamageToPlayer()` çš„åå½ˆå‚·å®³å¾ŒåŠ å…¥æ­»äº¡åˆ¤å®šï¼Œå‘¼å« `handleKill()` çµ¦äºˆ XPï¼›Boss è¢«åå‚·æ“Šæ®ºåŒæ¨£è§¸ç™¼å‹åˆ©ç•«é¢

---

## v0.8.4 - 2026-05-10

### ä¿®å¾©
- å·¦ä¸‹è§’ UI é‡ç–Šï¼šå™¨å®˜æ¡†åº•éƒ¨é‚Šç•Œæ”¹ç‚ºå‹•æ…‹è¨ˆç®—ï¼Œå›ºå®šç‚ºç‰ˆæœ¬è³‡è¨Šå€åŸŸï¼ˆ46pxï¼‰ä¸Šæ–¹ï¼Œç”±ä¸Šåˆ°ä¸‹é †åºç‚ºé€²åŒ–ç‹€æ…‹â†’å™¨å®˜æ¸…å–®â†’ç©ºè¡Œâ†’Â© Goblinnestâ†’v0.8.4

---

## v0.8.3 - 2026-05-10

### æ–°å¢ž
- Boss ç³»çµ±ï¼šå‰©é¤˜ 150 ç§’æ™‚åœ°åœ–é‚Šç·£ç”Ÿæˆé»‘ç†Šï¼ˆHP 500ï¼Œå‚·å®³ 15ï¼‰ï¼Œæ“Šæ•—å¾Œé¡¯ç¤ºå‹åˆ©ç•«é¢ä¸¦çµ¦äºˆ 500 XP å’Œ 1 å€‹æŠ€èƒ½é»ž
- é–‹å§‹ç•«é¢ï¼šéŠæˆ²è¼‰å…¥å¾Œå…ˆé¡¯ç¤ºæ¨™é¡Œç•«é¢ï¼ŒæŒ‰ä»»æ„éµæˆ–é»žæ“ŠæŒ‰éˆ•é€²å…¥éŠæˆ²
- ä½œè€…èˆ‡ç‰ˆæœ¬è³‡è¨Šï¼šç•«å¸ƒå·¦ä¸‹è§’ã€éŠæˆ²çµæŸç•«é¢ã€å‹åˆ©ç•«é¢å‡é¡¯ç¤º Â© Goblinnest å’Œç‰ˆæœ¬è™Ÿ
- `GAME_INFO` å¸¸æ•¸åŠ å…¥ `gameConfig.js`ï¼Œçµ±ä¸€ç®¡ç†æ¨™é¡Œã€å‰¯æ¨™é¡Œã€ä½œè€…ã€ç‰ˆæœ¬è™Ÿ

### ä¿®å¾©
- å™¨å®˜é¸æ“‡æœŸé–“æ™‚é–“ç¹¼çºŒæµé€ï¼ˆé—œé–‰é¸æ“‡ç•«é¢å¾Œè£œç®—æš«åœæ™‚é•·ï¼‰
- éŠæˆ²çµæŸé‡æ–°é–‹å§‹æŒ‰éˆ•ç„¡æ³•é»žæ“Šï¼ˆ`#ui-overlay` æœ‰ `pointer-events:none` å°Žè‡´ï¼‰
- å¤§è…¦å™¨å®˜æ‹¾å–ç¯„åœæœªå¥—ç”¨è‡³å±é«”é€²é£Ÿè·é›¢åˆ¤æ–·
- æ¯’å‚·èˆ‡æµè¡€è‡´æ­»çš„ç”Ÿç‰©ä¸çµ¦äºˆæ“Šæ®º XP åŠ `showXPPopup` è¦–è¦ºæç¤º
- è‚‰é£Ÿé«˜ç­‰ç´šåŠ å¿«é€²é£Ÿä½†ç¸½ XP èˆ‡å›žè¡€åŒæ­¥æ¸›å°‘ï¼ˆæ”¹ç‚ºå›ºå®šç¸½é‡ï¼Œåƒ…é€Ÿåº¦éš¨ç­‰ç´šæå‡ï¼‰

### èª¿æ•´
- æå–å…±ç”¨ `handleKill()` å‡½å¼ï¼Œçµ±ä¸€ç›´æŽ¥æ”»æ“Šã€æµè¡€ã€ä¸­æ¯’ä¸‰æ¢æ­»äº¡è·¯å¾‘çš„æ“Šæ®ºé‚è¼¯

---

## v0.8.2 - 2026-05-10

### æ–°å¢ž
- åˆ†æ®µåƒå±é«”ç³»çµ±ï¼šæ¯ 0.5 ç§’ä¸€å€‹ tickï¼Œé€²åº¦æ¢å¾žæ©™è‰²æ¼¸è®Šæ·±ç´…ï¼Œé›¢é–‹ç¯„åœé€²åº¦ä¿ç•™
- æµ®å‹•æ–‡å­—æç¤ºï¼šå±é«”é€²é£Ÿé¡¯ç¤º +XPï¼ˆç¶ ï¼‰å’Œ +HPï¼ˆç²‰ï¼‰ï¼›æµè¡€é¡¯ç¤ºã€Œè¡€ -Xã€ï¼ˆæ·±ç´… 11pxï¼‰ï¼›ä¸­æ¯’é¡¯ç¤ºã€Œæ¯’ -Xã€ï¼ˆç´« 11pxï¼‰
- æ•µæ„ç”Ÿç‰©èˆ‡æžœå­ç”Ÿæˆé€Ÿåº¦åŠ é€Ÿé‚è¼¯ï¼šå ´ä¸Šæ•¸é‡ç‚º 0 æ™‚é–“éš”ç¸®çŸ­ 70%
- ä¸­ç«‹ç”Ÿç‰©åƒæžœå­å¾Œæˆé•·ï¼šæ¯é¡† hp/maxHp +3ã€é€Ÿåº¦ +0.05ï¼Œåƒæ»¿ 5 é¡†å¾Œè½‰ç‚ºæ”»æ“Šåž‹ï¼ˆæ©™ç´…è‰²ï¼‰
- æ–°æ‰‹ä¿è­·ï¼šç­‰ç´š 1â€“3 ä¸”ç„¡æ”»æ“Šå™¨å®˜æ™‚ï¼Œå¼·åˆ¶è‡³å°‘ä¸€å€‹å™¨å®˜é¸é …ç‚ºæ”»æ“Šé¡ž

### ä¿®å¾©
- ä¸­ç«‹ç”Ÿç‰©ç¼ºå°‘ `diet` å±¬æ€§å°Žè‡´å¾žæœªè§¸ç™¼è‰é£Ÿè¡Œç‚º
- æ•µæ„ç”Ÿç‰©æ“Šæ®ºä¸­ç«‹ç”Ÿç‰©å¾Œæœªæ­£ç¢ºå›žåˆ°å·¡é‚ç‹€æ…‹

---

## v0.8.1 - 2026-05-10

### æ–°å¢ž
- å™¨å®˜å‡ç´šç³»çµ±ï¼šæ¯å€‹å™¨å®˜æœ€å¤šå‡è‡³ 3 ç´šï¼Œå‡ç´šä½”ç”¨å™¨å®˜æ§½ä½ï¼Œæ•ˆæžœç‚ºå¢žé‡ç–ŠåŠ 
- çµ„åˆæ•ˆæžœæç¤ºï¼šé¸æ“‡å™¨å®˜æ™‚è‹¥å·²æŒæœ‰çµ„åˆæ‰€éœ€å¤¥ä¼´ï¼Œé¡¯ç¤ºçµ„åˆæ•ˆæžœæç¤ºæ–‡å­—
- `gameConfig.js` å¤–éƒ¨é…ç½®æª”ï¼šå°‡æ‰€æœ‰ç”Ÿç‰©æ•¸å€¼ã€å™¨å®˜è³‡æ–™ã€çµ„åˆæ•ˆæžœã€æŠ€èƒ½ã€é€²åŒ–è·¯ç·šæå–è‡³ç¨ç«‹æª”æ¡ˆ
- äº”ç¨®å™¨å®˜çµ„åˆæ•ˆæžœï¼šèŸ¹é‰—+æ¯’åˆºã€é¾œæ®¼+åˆºç”²ã€å¤§è…¦+çœŸè¦–ä¹‹çœ¼ã€åŽšçš®+è¶…è‡ªç„¶å›žå¾©ã€çœŸè¦–ä¹‹çœ¼+ç ç‰™

### ä¿®å¾©
- XP é–€æª»èˆ‡ç­‰ç´šå‡ç´šä½¿ç”¨å…©å¥—ç¨ç«‹è¨ˆæ•¸å™¨ï¼Œåˆä½µç‚ºä»¥ç­‰ç´šå‡ç´šè§¸ç™¼å™¨å®˜é¸æ“‡
- æ•µæ„ç”Ÿç‰©é€Ÿåº¦èˆ‡å‚·å®³æœªå¥—ç”¨ä¸Šé™ï¼ˆé€Ÿåº¦ä¸Šé™ 2.5ã€å‚·å®³ä¸Šé™ 20ï¼‰
- é€²åŒ–é¸é …ä¸å‡ºç¾ï¼š`organSlots += 3` ä½ç½®éŒ¯èª¤ï¼Œç§»è‡³ `applyEvolutionLevelEffect()`

---

## v0.8.0 - 2026-05-10

### æ–°å¢ž
- æŠ€èƒ½æ¨¹ç³»çµ±ï¼šæ­»äº¡å¾Œé¡¯ç¤ºæŠ€èƒ½æ¨¹ï¼Œå¯å‡ç´šå…­ç¨®æ°¸ä¹…æŠ€èƒ½ï¼ˆå¼·å£¯é«”é­„ã€æ•æ·èº«æ‰‹ã€æŽ¡é›†å°ˆå®¶ã€çµäººæœ¬èƒ½ã€é ‘å¼·æ„å¿—ã€è¨˜æ†¶å™¨å®˜ï¼‰
- æŠ€èƒ½é»žæ•¸ç³»çµ±ï¼šæ¯æ¬¡æ­»äº¡ç²å¾— 1 é»žï¼ŒæŠ€èƒ½é»žæ•¸è·¨å±€ä¿å­˜è‡³ localStorage
- æ­»äº¡ä¿ç•™å™¨å®˜ï¼šæ­»äº¡å¾Œå¯é¸æ“‡æœ€å¤š 1 å€‹å™¨å®˜å¸¶å…¥ä¸‹ä¸€å±€ï¼ˆè¨˜æ†¶å™¨å®˜æŠ€èƒ½å¯å¢žåŠ ä¸Šé™è‡³ 3 å€‹ï¼‰
- é€²åŒ–ç³»çµ±ï¼šè‰é£Ÿæ€§ / è‚‰é£Ÿæ€§ / é›œé£Ÿæ€§ä¸‰æ¢è·¯ç·šï¼Œå„ 3 ç´šï¼Œå™¨å®˜æ§½ä½æ»¿æ™‚è§¸ç™¼é€²åŒ–é¸æ“‡
- é ‘å¼·æ„å¿—ï¼šæ¯å±€è§¸ç™¼ä¸€æ¬¡ï¼Œæ­»äº¡æ™‚ä¿ç•™ 10%Ã—ç­‰ç´šçš„ HP

---

## v0.7.0 - 2026-05-10

### æ–°å¢ž
- æ—¥å¤œå¾ªç’°ï¼šæ¯ 150 ç§’äº¤æ›¿ç™½å¤©/å¤œæ™šï¼Œå¤œæ™šæ•µæ„ç”Ÿç‰©é€Ÿåº¦èˆ‡å‚·å®³æå‡
- å€’æ•¸è¨ˆæ™‚ï¼š20 åˆ†é˜éŠæˆ²æ™‚é™ï¼Œæ™‚é–“è€—ç›¡é¡¯ç¤ºéŠæˆ²çµæŸç•«é¢
- ç”Ÿç‰©ç¹æ®–ç³»çµ±ï¼šä¸­ç«‹å’Œæ•µæ„ç”Ÿç‰©ä¾æ™‚é–“é–“éš”åœ¨åœ°åœ–é‚Šç·£è£œå……ç”Ÿæˆ
- ç”Ÿç‰©å¼·åº¦éš¨æ™‚é–“æå‡ï¼ˆ`creatureStrengthMultiplier`ï¼‰

---

## v0.6.0 - 2026-05-10

### æ–°å¢ž
- çŽ©å®¶æ”»æ“Šç³»çµ±ï¼šé»žæ“Šæ”»æ“Šï¼Œç¯„åœå…§æ‰€æœ‰ç”Ÿç‰©å—åˆ°å‚·å®³ï¼›æ”¯æ´æ”»é€Ÿã€æš´æ“Šã€æµè¡€ã€ä¸­æ¯’ã€æšˆçœ©æ•ˆæžœ
- åˆºç”²åå‚·æ©Ÿåˆ¶
- å¿µåŠ›æ³¢ï¼ˆå¤§è…¦å™¨å®˜ï¼‰ç¯„åœå‚·å®³
- å¯¶ç‰©ç³»çµ±ï¼šæ“Šæ®ºç”Ÿç‰©æœ‰æ©ŸçŽ‡æŽ‰è½å¯¶ç‰©ï¼ŒçŽ©å®¶æŽ¥è§¸å¾Œç²å¾— XP
- é–‹ç™¼è€…æ¨¡å¼ï¼šéš±è—é¢æ¿ï¼Œå¯å¿«é€Ÿç”Ÿæˆæžœå­ã€ç”Ÿç‰©ï¼Œå¿«é€²æ™‚é–“ã€è£œå…… HP/XP

---

## v0.5.0 - 2026-05-10

### æ–°å¢ž
- å™¨å®˜ç³»çµ±ï¼šå‡ç´šæ™‚æä¾›ä¸‰å€‹éš¨æ©Ÿå™¨å®˜é¸é …ï¼ˆæ”»æ“Š / é˜²ç¦¦ / éˆåŠ›ä¸‰é¡žå…± 12 ç¨®ï¼‰
- å™¨å®˜æ•ˆæžœå³æ™‚å¥—ç”¨è‡³çŽ©å®¶å±¬æ€§ï¼ˆæ”»æ“ŠåŠ›ã€é€Ÿåº¦ã€HPä¸Šé™ã€å‚·å®³æ¸›å…ç­‰ï¼‰
- å™¨å®˜æ¸…å–®é¡¯ç¤ºæ–¼ç•«å¸ƒå·¦ä¸‹è§’

---

## v0.4.0 - 2026-05-10

### æ–°å¢ž
- æ•µæ„ç”Ÿç‰© AIï¼šå·¡é‚ã€è¿½æ“Šã€æ”»æ“ŠçŽ©å®¶å’Œä¸­ç«‹ç”Ÿç‰©ä¸‰ç¨®ç‹€æ…‹
- æ•µæ„ç”Ÿç‰©æ„ŸçŸ¥ç¯„åœï¼ˆ`aggroRange`ï¼‰ã€æ”»æ“Šç¯„åœã€æ”»æ“Šå†·å»
- æ“Šæ®ºç”Ÿç‰©æŽ‰è½å±é«”ï¼Œè‚‰é£Ÿåž‹æ•µæ„ç”Ÿç‰©æœƒé£Ÿç”¨å±é«”å¼·åŒ–å±¬æ€§
- `applyDamageToPlayer()` å‚·å®³è¨ˆç®—ï¼ˆå«å‚·å®³æ¸›å…èˆ‡åå‚·ï¼‰
- çŽ©å®¶æ­»äº¡å¾Œé€²å…¥æ­»äº¡ç•«é¢ï¼ˆå‰æœŸç‰ˆæœ¬ç‚ºç©ºç™½é ï¼‰

---

## v0.3.0 - 2026-05-10

### æ–°å¢ž
- ä¸­ç«‹ç”Ÿç‰© AIï¼šè‰é£Ÿæ€§èˆ‡é›œé£Ÿæ€§ï¼Œä¾æ“šé£Ÿæ€§åœ¨åœ°åœ–ä¸Šå°‹æ‰¾æžœå­
- ä¸­ç«‹ç”Ÿç‰©é€ƒè·‘èˆ‡åæ“Šè¡Œç‚ºï¼ˆ`fleeRange`ã€`fightBackRange`ã€`canFight`ï¼‰
- ä¸­ç«‹ç”Ÿç‰©è¡€æ¢é¡¯ç¤º

---

## v0.2.0 - 2026-05-10

### æ–°å¢ž
- æžœå­ç³»çµ±ï¼šåœ°åœ–éš¨æ©Ÿç”Ÿæˆæžœå­ï¼ŒçŽ©å®¶æŽ¥è§¸å¾Œç²å¾— XP
- æžœå­å®šæ™‚è£œå……ï¼ˆç™½å¤© 8 ç§’ã€å¤œæ™š 16 ç§’ï¼‰
- XP é”åˆ°é–€æª»å¾Œå‡ç´šï¼Œé¡¯ç¤ºå‡ç´šæç¤ºæ–‡å­—

---

## v0.1.0 - 2026-05-10

### æ–°å¢ž
- 800Ã—600 ç•«å¸ƒåœ°åœ–ï¼Œéš¨æ©Ÿç”Ÿæˆæ¨¹æœ¨ä½œç‚ºè£é£¾
- çŽ©å®¶è§’è‰²ï¼ˆé»‘è‰²åœ“å½¢ï¼‰ï¼ŒWASD éµç›¤ç§»å‹•
- ç•«é¢ UIï¼šHP æ¢ã€XP æ¢ã€æ™‚é–“é¡¯ç¤ºã€æ—¥å¤œç‹€æ…‹
- `gameState` å…¨å±€ç‹€æ…‹ç®¡ç†ç‰©ä»¶
- `requestAnimationFrame` ä¸»éŠæˆ²å¾ªç’°
