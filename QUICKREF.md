## v0.1.26.0

# QUICKREF â€” Claude Code å¿«é€Ÿåƒè€ƒç´¢å¼•

> æ­¤æª”æ¡ˆæ˜¯ Claude Code æ¯æ¬¡å•Ÿå‹•çš„å¿«æŸ¥æ‰‹å†Šã€‚
> éœ€è¦å‡½å¼ç´°ç¯€è«‹æŸ¥ MAIN.mdï¼›éœ€è¦è¨­è¨ˆæ±ºç­–è«‹æŸ¥ project_summary.mdã€‚

---

## ç•¶å‰ç‹€æ…‹
- 版本：**v0.1.26.0**
- SAVE_VERSIONï¼š`"1.1"`

---

## æŠ€è¡“æž¶æ§‹
```
èªžè¨€ï¼šç´” HTML + JavaScript + CSSï¼Œç„¡æ¡†æž¶
æ¸²æŸ“ï¼šHTML5 Canvas 2Dï¼ˆéŠæˆ²ä¸–ç•Œï¼‰+ HTML div overlayï¼ˆUIï¼‰
FPSï¼šFixed Timestep 60FPSï¼ˆFIXED_DELTA = 1000/60ï¼‰

é‚è¼¯è§£æžåº¦ï¼šæ°¸é  1600Ã—900ï¼ˆVIEW_W/VIEW_H ä¸å¯æ”¹å‹•ï¼‰

ç¸®æ”¾ï¼šCSS transform: scale()ï¼Œä¾è£ç½®åˆ†æ”¯
  é›»è…¦ç‰ˆï¼šLetterbox â€” scale = Math.min(vw/1600, vh/900)ï¼ŒVIEW_W/VIEW_H å›ºå®š 1600Ã—900
  æ‰‹æ©Ÿç‰ˆï¼šå¡«æ»¿èž¢å¹• â€” scale = vw/logicWï¼Œ_setViewSize() ä¾æ–¹å‘èª¿æ•´ï¼ˆMOBILE_GAME_SCALE = 0.6ï¼‰
  _letterboxScaleï¼ˆmobile.js exportï¼‰å…©å€‹åˆ†æ”¯éƒ½æ›´æ–°ï¼Œä¾›å…¶ä»–æ¨¡çµ„è®€å–

æ¨¡çµ„è¼‰å…¥ï¼šES Modulesï¼Œmain.js ç‚º <script type="module"> å”¯ä¸€å…¥å£
æ‰‹æ©Ÿåˆ¤æ–·ï¼šgameState.isMobile / gameState.orientation
```

---

## éƒ¨ç½²è³‡è¨Š
| ç’°å¢ƒ | ç¶²å€ / æŒ‡ä»¤ |
|------|-------------|
| GitHub | https://github.com/Resikiser97/silent-koel |
| Vercel Masterï¼ˆæ¸¬è©¦ï¼‰ | silent-koel.vercel.appï¼ˆ`vercel.json` ä½¿ç”¨ `npm run build`ï¼Œè¼¸å‡º `dist/`ï¼‰ |
| Vercel Stableï¼ˆç©©å®šï¼‰ | silent-koel-git-stable-goblinnest-s-projects.vercel.app |
| CC æŽ¨é€æŒ‡ä»¤ï¼ˆWindowsï¼‰ | `"C:\AI\Git\bin\git.exe" -C "c:\AI\VS CODE" push origin master` |
| itch.io æ‰“åŒ… | `npm run build:itch` â†’ ç”¢å‡º `silent-koel-itch.zip` ä¸Šå‚³ |

### itch.io æ³¨æ„äº‹é …ï¼ˆè©³è¦‹ `itch.md`ï¼‰
- ESM å­ç›®éŒ„ import åœ¨ itch.io CDN å…¨éƒ¨ 403 â†’ å¿…é ˆç”¨ Vite æ‰“åŒ…æˆå–®ä¸€ `index.js`
- è·¯å¾‘ä¸èƒ½æœ‰ç©ºæ ¼ï¼šéŸ³æ•ˆç›®éŒ„å·²æ”¹ç‚º `sounds/`ï¼ˆéž `Sound MP3/`ï¼‰ï¼Œå­ç›®éŒ„ `sounds/new/`
- itch.io ä¸Šå‚³è¨­å®šï¼šå‹¾é¸ã€ŒThis file will be played in the browserã€ï¼ŒFrame size 1600Ã—900

---

## æª”æ¡ˆåœ°åœ–

### æ ¹ç›®éŒ„
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `index.html` | HTML çµæ§‹ + CSS + å”¯ä¸€ `<script type="module" src="./main.js">` å…¥å£ |
| `main.js` | ESM å…¥å£ / isGamePaused / gameLoop / initializeGame / startGameWithLoading / startGame event listener / window.onload |
| `lang.js` | LANG_LISTã€LANG å­—å…¸ã€applyLanguage()ã€t(key, params?) |
| `vite.config.js` | Vite æ‰“åŒ…è¨­å®šï¼ˆitch.io ç”¨ï¼Œ`base: './'`ï¼Œè¼¸å‡º `index.js` åˆ°æ ¹ç›®éŒ„ï¼‰|
| `vercel.json` | Vercel éƒ¨ç½²è¨­å®šï¼š`buildCommand` = `npm run build`ï¼Œ`outputDirectory` = `dist` |
| `itch.md` | itch.io éƒ¨ç½² SOP èˆ‡è¸©å‘ç´€éŒ„ï¼ˆçµ¦ Claude Chat åƒè€ƒï¼‰ |
| `MAIN.md` | å®Œæ•´æ¨¡çµ„æž¶æ§‹ã€å‡½å¼åˆ—è¡¨ã€è·¨æ¨¡çµ„ä¾è³´ |
| `CHANGELOG.md` | æ‰€æœ‰ç‰ˆæœ¬ç´€éŒ„ï¼ˆæœ€æ–°åœ¨æœ€ä¸Šæ–¹ï¼‰ |
| `VERSION_RULES.md` | ç‰ˆæœ¬è™Ÿæ›´æ–°è¦å‰‡ |
| `.claude/instructions.md` | Claude Code è¡Œç‚ºè¦å‰‡èˆ‡ SOP |

### scripts/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `scripts/copy-sounds.js` | `npm run build` å¾Œè¤‡è£½ `sounds/` â†’ `dist/sounds/`ï¼Œä¾› Vercel / itch.io å…±ç”¨ |
| `scripts/pack-itch.js` | å°‡ `dist/` ç”¨ archiver æ‰“åŒ…æˆ `silent-koel-itch.zip` |

### sounds/
| è·¯å¾‘ | èªªæ˜Ž |
|------|------|
| `sounds/*.mp3` | ä¸»è¦éŸ³æ•ˆï¼ˆç„¡ç©ºæ ¼åç¨±ï¼Œå°æ‡‰ `AUDIO_FILES` è·¯å¾‘ï¼‰|
| `sounds/new/*.mp3` | æ–°å¢žéŸ³æ•ˆï¼ˆç²¾è‹±æ€ªã€Bossã€é˜¿å¥‡çˆ¾ç­‰ï¼‰|

### config/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `gameConfig.js` | GAME_INFOï¼ˆç‰ˆæœ¬è™Ÿã€SAVE_VERSIONï¼‰ã€GAME_TIMINGã€AUDIO_FILESã€FIXED_DELTA |
| `characters.js` | CHARACTERSï¼ˆè§’è‰²å®šç¾©å¸¸æ•¸ï¼‰ |
| `organs.js` | ORGANSï¼ˆ15ç¨®æ™®é€šï¼‰+ HIDDEN_ORGANSï¼ˆ4ç¨®ï¼‰+ poisonSac |
| `creatures.js` | CREATURE_CONFIGã€CREATURE_AI_CONFIGï¼ˆç”Ÿç‰©åˆ†é›¢ã€è¿‘æˆ°å‰å¾Œæ–ã€é¬£ç‹— pack æ•¸å€¼ï¼‰ã€ELITE_CONFIGã€BOSS_CONFIG |
| `evolution.js` | EVOLUTION_PATHSï¼ˆå„è·¯ç·š Lv1~5ï¼‰ã€SKILLSï¼ˆ9ç¨®ï¼‰ã€COMBOSï¼ˆ5ç¨®ï¼‰ |
| `patchnotes.js` | PATCH_NOTESï¼ˆç‰ˆæœ¬æ›´æ–°å…¬å‘Šï¼Œæœ€æ–°ç½®é ‚ï¼›v0.1.25.3 èµ·ä¿ç•™ v0.1.22.1 ä»¥ä¸Šï¼‰ |
| `supabase.js` | Supabase APIï¼ˆæŽ’è¡Œæ¦œã€é›²ç«¯å­˜æª”ï¼‰ |
| `achievements.js` | ACHIEVEMENTSï¼ˆ36 å€‹æˆå°±å®šç¾©ï¼Œä¸ƒé¡žï¼‰ |
| `attributes.js` | ATTRIBUTESï¼ˆ5 å€‹å±¬æ€§ç´”è³‡æ–™ï¼ŒAttribute Design v1ï¼‰ |
| `playerStatsFormula.js` | `calcPlayerStats(charId, skills, organs, hiddenOrgans, mutationLevels, unlockedAchievements)` â†’ 12 å±¬æ€§å¿«ç…§ï¼ˆå« attackSpeed çš„ final/baseIntervalMs/intervalMs èˆ‡ corpseXP å®Œæ•´ final/base/evoLevel/mutMultiplier/achPercentï¼‰ï¼›ç¬¬ 6 åƒæ•¸å‚³å…¥å·²è§£éŽ–æˆå°± mapï¼Œè®“é¢æ¿æ•¸å€¼èˆ‡ runtime åŒæ­¥ï¼ˆv0.1.25.2ï¼‰ï¼›è©³è¦‹ `docs/PLAYER_STATS_FORMULA.md` |
| `xpConfig.js` | `XP_CONFIG`ï¼šæŽ¡é›† XPï¼ˆfruit.base / foragerPerLevel / noHerbivoreBaseï¼‰ã€æ“Šæ®º XPï¼ˆkill.minCreatureBaseXP / hunterPerLevelï¼‰ã€hostile XP å…¬å¼ï¼ˆkill.hostile.base / hpDivisor / hpScale / cap / defaultHpï¼‰æ‰€æœ‰å¸¸æ•¸é›†ä¸­å®šç¾© |
| `combatConfig.js` | `COMBAT_CONFIG`ï¼ˆæ”»æ“Šé–“éš”å…¬å¼åŸºåº•ï¼Œv0.1.24.4ï¼‰ |
| `mutationConfig.js` | `MUTATION_CONFIG`ï¼ˆæŠ€èƒ½é»žæ›è®Šç•°é»žå¸¸æ•¸ï¼šskillPointCost/discountedSkillPointCost/mutationPointGainï¼Œv0.1.25.0ï¼‰ |

### lang/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `zh-TW.js` | ç¹é«”ä¸­æ–‡èªžè¨€åŒ… |
| `en.js` | è‹±æ–‡èªžè¨€åŒ…ï¼ˆfallbackï¼‰ |

### systems/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `gameState.js` | DEFAULT_SETTINGSã€gameState ç‰©ä»¶ã€canvas/ctx |
| `gameFlow.js` | pausePlayTimer / resumePlayTimerï¼ˆStage F æ‰¹æ¬¡ 1ï¼šè§£é™¤ main.js åå‘ä¾è³´ï¼‰ |
| `utils.js` | drawArrow / drawHealthBar / drawNameTag / drawGlowEffect / applyTenacity |
| `audio.js` | AudioManagerï¼ˆplay / playMusic / refreshMusicVolumeï¼‰/ preloadAllSfxBuffers |
| `camera.js` | updateCamera / worldToScreen / wrappedDistance / wrappedDelta / _updateCameraZoom |
| `input.js` | handleKeyDown / handleKeyUpï¼ˆå« Z éµè‡ªå‹•æ”»æ“Š toggleï¼‰ |
| `map.js` | MAP_WIDTH / MAP_HEIGHT / generateTerrain / buildTerrainCanvas / drawTerrain |
| `spawning.js` | ç”Ÿç‰©ï¼æžœå­ï¼æ¨¹æœ¨ç”Ÿæˆ |
| `feedback.js` | showFloatingText / showXPPopupï¼Œå¾ž combat.js / player.js æŠ½å‡ºï¼ˆv0.1.20.0ï¼‰ |
| `reward.js` | addXP / checkLevelUpï¼Œå¾ž player.js æŠ½å‡ºï¼ˆv0.1.20.1ï¼‰ |
| `loot.js` | _spawnBoneï¼Œå¾ž combat.js æŠ½å‡ºï¼ˆv0.1.20.1ï¼‰ |
| `player.js` | updatePlayerMovement / checkFruitCollision / éˆæ•çŸ¥è¦ºç®—æ³• |
| `tutorial.js` | showTutorial / spawnTutorialStump / handleTutorialStumpKill |
| `damage.js` | applyDamageToPlayer / handleKillï¼ˆç§»é™¤å·²æ“Šæ®ºç”Ÿç‰©ã€dispatch eliteKilledï¼‰/ handleGiantKillï¼Œå¾ž combat.js æŠ½å‡ºï¼ˆv0.1.21.0ï¼‰ |
| `combat.js` | playerAttack / setRangedAttackCallback / updateStatusEffects / ç™½éª¨ç³»çµ± |
| `organs.js` | showOrganSelection / handleEliteKill / applyOrganEffects |
| `evolution.js` | buildSkillTreeOverlay / upgradeSkill / applyEvolutionEffects |
| `creatures.js` | updateNeutralCreatures / updateHostileCreatures / _tryMeleeAttack / _applyCreatureSeparation |
| `elite.js` | spawnEliteCreature / updateEliteCreature |
| `boss.js` | spawnBoss / updateBoss / showVictory |
| `mutation.js` | initMutationData / applyMutationEffects / showMutationPanel |
| `daynight.js` | getDayNightPhaseIndex(timeRemaining) / updateDayNightCycle |
| `chat.js` | èŠå¤©å®¤ç³»çµ±ï¼ˆå¸³è™Ÿç™»å…¥ / Realtime / GMæŒ‡ä»¤ / å½©è‰²å­— / ç½®é ‚è¨Šæ¯ / username å°å¯«æ­£è¦åŒ–+GOBLINNEST éŽæ¿¾ï¼‰ |
| `achievements.js` | unlockAchievement(id) / isUnlocked(id) / getUnlockedAchievements() / getActiveTitle() / setActiveTitle(title) / showAchievements(opts) |
| `achievementTriggers.js` | initAchievementTriggers()ï¼ˆPhase Dï¼šç›£è½ CustomEvent è§¸ç™¼æˆå°±ï¼Œä¸ import SCC æ¨¡çµ„ï¼‰ |
| `achievementBonus.js` | getAchievementBonusTotals(unlockedIds) / applyAchievementStatBonuses()ï¼ˆæˆå°±æ°¸ä¹…åŠ æˆå¥—ç”¨ï¼Œv0.1.25.0ï¼‰ |
| `leaderboard.js` | æŽ’è¡Œæ¦œé¢æ¿ / åˆ†æ•¸æäº¤ / é›£åº¦ç‹€æ…‹ç®¡ç† |
| `mobile.js` | è£ç½®åµæ¸¬ / æ‰‹æ©Ÿç¸®æ”¾ / æ–æ¡¿ / æ”»æ“Šå€ / è§¸æŽ§ç–ŠåŠ å±¤ |
| `hud.js` | drawGame ä¸»æ¸²æŸ“ / HUD æ›´æ–° / å°åœ°åœ– / ä¸Šæ–¹è¡€æ¢ |
| `ui.js` | é¢æ¿ç³»çµ±ï¼ˆé¦–é /è¨­å®š/åœ°åœ–é¸æ“‡/åœ–é‘‘/æ•…äº‹æ›¸/ç‰ˆæœ¬å…¬å‘Šï¼‰/ Tooltip / èªžè¨€åˆ‡æ› / çµç®—ç•«é¢å…±ç”¨ builder |

### map/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `map.md` | åœ°å½¢è¨­è¨ˆæ–‡ä»¶ |
| `easymap.js` | EASY_MAPï¼ˆç°¡å–®é›£åº¦ï¼›dogElites ä¸‰çŠ¬ç²¾è‹±æ€ªé–‹å•Ÿï¼‰ |
| `normalmap.js` | NORMAL_MAPï¼ˆæ™®é€šé›£åº¦ï¼šç”Ÿç‰©Ã—1.5ã€aggroRange 400ã€å·¨äººåŒ–/æ®ºæ‰‹åŒ–/Bosså›žè¡€/dogElites é–‹å•Ÿï¼‰ |
| `hardmap.js` | HARD_MAPï¼ˆå›°é›£é›£åº¦ï¼šç”Ÿç‰©Ã—2.5ã€aggroRange 600ã€ä¸‰éš¼ç²¾è‹±æ€ª/é»‘è‰²çµäºº Boss é–‹å•Ÿï¼‰ |

---

## localStorage Key ä¸€è¦½
| Key | èªªæ˜Ž |
|-----|------|
| `playerSkills` | æŠ€èƒ½æ¨¹ç­‰ç´šï¼ˆå„æŠ€èƒ½ 0~5ï¼‰ |
| `skillPoints` | å¯ç”¨æŠ€èƒ½é»ž |
| `savedOrgans` | æ­»å¾Œä¿ç•™çš„æ™®é€šå™¨å®˜ |
| `savedHiddenOrgans` | æ­»å¾Œä¿ç•™çš„éš±è—å™¨å®˜ |
| `lastRunOrgans` | ä¸Šå±€æ‰€æœ‰å™¨å®˜è¨˜éŒ„ï¼ˆé¦–é è£œé¸ç”¨ï¼‰ |
| `gameSettings` | `{ language, volume, keys, deviceMode, autoAttack, showOrganTooltip, alwaysCenter, minimapFade, minimapSize, fontBoldLarge, cameraMode, cameraZoomLevel }` |
| `saveVersion` | ç›®å‰ `"1.1"`ï¼ˆä¸ä¸€è‡´æ™‚æ¸…é™¤æŠ€èƒ½/å™¨å®˜å­˜æª”ï¼‰ |
| `lastCharacter` | ä¸Šä¸€å±€é¸æ“‡è§’è‰² ID |
| `mutationData` | çªè®Šå™¨å®˜ç­‰ç´šå’Œé»žæ•¸ï¼ˆæ°¸ä¹…ä¿ç•™ï¼Œä¸å— `saveVersion` æ¸…é™¤ï¼‰ |
| `lastDifficulty` | ä¸Šä¸€å±€é›£åº¦ï¼ˆ`'easy'`/`'normal'`ï¼‰ |
| `tutorialCompleted` | ç§»å‹•æ•™å­¸æ˜¯å¦å®Œæˆ |
| `tutorialCombatDone` | æˆ°é¬¥æ•™å­¸æ˜¯å¦å®Œæˆ |
| `hasPlayedBefore` | æ˜¯å¦æ›¾éŠçŽ©éŽï¼ˆæŽ§åˆ¶åˆæ¬¡é€²å…¥æµç¨‹ï¼‰ |
| `mutationSkills` | è®Šç•°æŠ€èƒ½æ¨¹ç­‰ç´šèˆ‡æŠ€èƒ½é»žï¼ˆè·¨å±€æ°¸ä¹…ï¼Œv0.0.69.0ï¼‰ |
| `chapter2Unlocked` | æ•…äº‹æ›¸ç¬¬äºŒç« æ˜¯å¦è§£éŽ–ï¼ˆæ™®é€šé›£åº¦é€šé—œå¾Œ = `'true'`ï¼‰ |
| `clearCount_easy` / `clearCount_normal` / `clearCount_hard` | å„é›£åº¦é€šé—œæ¬¡æ•¸ |
| `clearCount_char_*` | å„è§’è‰²é€šé—œæ¬¡æ•¸ï¼ˆv0.0.69.0ï¼‰ |
| `killCount_bear` / `killCount_shark` / `killCount_scorpion` / `killCount_hunter` | Boss æ“Šæ®ºæ¬¡æ•¸ |
| `hunterSlayerUnlocked` | æ˜¯å¦æ›¾æ“Šæ®ºé»‘è‰²çµäººï¼ˆ`'true'`ï¼Œv0.1.0.0ï¼‰ |
| `zoomResetVersion` | é¡é ­ç¸®æ”¾é è¨­å€¼é‡ç½®ç‰ˆæœ¬ |
| `lastSeenPatchVersion` | å·²è®€å–çš„æœ€æ–°ç‰ˆæœ¬å…¬å‘Š |
| `readPatchNotes` | å·²é€ç‰ˆæœ¬é»žé–‹çš„å…¬å‘Š `{ [version]: true }`ï¼Œç”¨æ–¼é€ç‰ˆæœ¬ç´…é»žæ¸…é™¤ï¼ˆv0.1.25.2ï¼‰ |
| `chatPosition` / `chatSettings` | èŠå¤©å®¤ä½ç½®èˆ‡è¨­å®š |
| `achievements` | å·²è§£éŽ–æˆå°± `{ [id]: { unlockedAt: ISO string } }` |
| `readAchievements` | å·²é»žé–‹ç¢ºèªçš„æˆå°± `{ [id]: true }`ï¼Œé¦–é /æˆå°±æ ¼ç´…é»žä½¿ç”¨ï¼ˆv0.1.25.2ï¼‰ |
| `firstPlayDate` | é¦–æ¬¡éŠçŽ©æ—¥æœŸï¼ˆISO stringï¼ŒinitializeGame æ™‚å¯«å…¥ä¸€æ¬¡ï¼‰ |
| `activeTitle` | ç›®å‰å•Ÿç”¨çš„ç¨±è™Ÿå­—ä¸²ï¼ˆç”± achievements.js è®€å¯«ï¼‰ |
| `winStreak` | é€£å‹å±€æ•¸ï¼ˆæ­»äº¡æ™‚æ­¸é›¶ï¼Œå‹åˆ©æ™‚+1ï¼Œç”± achievementTriggers ç¶­è­·ï¼‰ |
| `killTotal` | ç´¯ç©æ“Šæ®ºæ™®é€šæ€ªæ•¸ï¼ˆç”± damage.js éžå¢žï¼‰ |
| `killKillerTotal` | ç´¯ç©æ“Šæ®ºæ®ºæ‰‹åŒ–æ€ªæ•¸ï¼ˆç”± damage.js éžå¢žï¼‰ |
| `killGiantTotal` | ç´¯ç©æ“Šæ®ºå·¨äººæ•¸ï¼ˆç”± damage.js éžå¢žï¼‰ |

---

## é—œéµæŠ€è¡“é™·é˜±
| é™·é˜± | è¦å‰‡ |
|------|------|
| `MOBILE_GAME_SCALE` | deprecatedï¼ˆLetterbox å–ä»£ï¼‰ï¼Œä¿ç•™ä»¥é˜²å¤–éƒ¨å¼•ç”¨ï¼Œå€¼ä»ç‚º 0.6 |
| `realPlayTime` | å–®ä½æ˜¯æ¯«ç§’ï¼Œä¸Šå‚³æŽ’è¡Œæ¦œç”¨ `Math.floor(realPlayTime / 1000)` è½‰ç§’ |
| `resumePlayTimer()` | ç„¡æ¢ä»¶å•Ÿå‹• |
| `pausePlayTimer()` | æœ‰æª¢æŸ¥ `_playTimerStart !== null` æ‰æš«åœ |
| `autoAttack` | ä»»ä½•ç‰ˆæœ¬æ›´æ–°éƒ½ä¸é‡ç½®ï¼Œä¸å— `saveVersion` æŽ§åˆ¶ |
| æ¯’å‚· tick | ç”¨ `c.lastPoisonTick += 1000`ï¼Œä¸æ˜¯ `= now`ï¼Œé¿å…ç´¯ç©èª¤å·® |
| å™¨å®˜é¸æ“‡é †åº | `showHiddenOrganSelection()` å¿…é ˆåœ¨ `addXP()` ä¹‹å‰å‘¼å«ï¼Œå¦å‰‡ç•Œé¢ç–Šå±¤ |
| organSelectionActive | `gameState.organSelectionActive = false` å¿…é ˆåœ¨ `showOrganSelection()` ä¹‹å‰è¨­å®š |
| é–‹ç™¼è€…æ¨¡å¼ | æš—è™Ÿ `77777778`ï¼Œä½¿ç”¨å¾Œ `gameState.devModeUsed = true`ï¼Œç¦æ­¢ä¸Šå‚³æŽ’è¡Œæ¦œ |
| CC æ•ˆæžœæ–°å¢ž | å¿…é ˆåŒæ­¥æ›´æ–° 4 å€‹ä½ç½®ï¼š`updateNeutralCreatures`ã€`updateHostileCreatures`ã€`updateEliteCreature`ï¼ˆelite.jsï¼‰ã€`updateBoss`ï¼ˆboss.jsï¼‰ |
| æ•¸å€¼ä¿®æ”¹ | åªèƒ½åœ¨ `config/` è³‡æ–™å¤¾ä¿®æ”¹ï¼Œä¸è¦åœ¨ systems/ å¯«æ­»æ•¸å€¼ |
| gameLoop | çµ•å°ä¸èƒ½å‡ºç¾å­—é¢ä¸Šçš„ `\n` å­—ç¬¦ |
| ç‰ˆæœ¬è™Ÿæ ¼å¼ | å››æ®µ `v0.x.y.z`ï¼›æŽ’è¡Œæ¦œ `version_order` å–ç¬¬äºŒæ®µ xï¼ŒåŒä¸€å€‹ x çš„è¨˜éŒ„äº’ç›¸ç«¶çˆ­ï¼ˆx å‡ç‰ˆæ™‚æŽ’è¡Œæ¦œé‡ç½®ï¼‰ |
| å®¹å™¨ `innerHTML = ''` é‡å»ºæœƒè®“æ²å‹•æ­¸é›¶ | ä»»ä½•å·¦å´ç›®éŒ„/åˆ—è¡¨é¡ž UI è‹¥æ¯æ¬¡äº’å‹•éƒ½æ•´å€‹æ¸…ç©ºé‡å»ºå®¹å™¨ï¼Œ`scrollTop` æœƒè¢«æ­¸é›¶é€ æˆç•«é¢å›žå½ˆï¼›æ­£ç¢ºåšæ³•æ˜¯é‡ç¹ªå‰ç”¨ `_captureSidebarScroll()` å­˜ `scrollTop`ï¼Œé‡ç¹ªå¾Œç”¨ `_restoreSidebarScroll()` é‚„åŽŸï¼ˆè¦‹ `systems/ui.js` åœ–é‘‘ä¸‰åˆ†é ï¼Œv0.1.25.7ï¼‰ï¼›åŒé¡žé¢æ¿æ›´å¥½çš„ä½œæ³•æ˜¯é¢æ¿éª¨æž¶åªå»ºç«‹ä¸€æ¬¡ï¼Œäº’å‹•æ™‚å‘¼å«å…§éƒ¨ `refresh()` å°±åœ°æ›´æ–°ï¼ˆè¦‹ `systems/mutation.js` `showMutationPanel()`ï¼‰ |

