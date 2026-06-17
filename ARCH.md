## v0.1.26.0

# ARCH â€” æž¶æ§‹èªªæ˜Žï¼ˆä»£ç¢¼å„ªå…ˆæ–‡ä»¶ï¼‰

> æ­¤æ–‡ä»¶æè¿°éŠæˆ²å¯¦éš›é‹ä½œï¼Œä»¥ä»£ç¢¼ç‚ºæº–ã€‚ç™¼ç¾æè¿°èˆ‡ä»£ç¢¼ä¸ç¬¦æ™‚ï¼Œä¿®æ­£æœ¬æ–‡ä»¶ã€‚
> åŸºæº–ï¼šv0.1.11.0 ä»£ç¢¼æŽƒæ

---

## 1. å°ˆæ¡ˆæ¦‚è¿°

ç´” HTML5 Canvas 2D ç”Ÿå­˜éŠæˆ²ã€Œåªå«ä¸åƒçš„å™ªéµ‘ã€ï¼Œç„¡æ¡†æž¶ï¼Œä½¿ç”¨ ES Modulesï¼ˆESMï¼‰çµ„ç¹”ä»£ç¢¼ï¼Œå–®ä¸€å…¥å£ `main.js`ã€‚

---

## 2. æ¨¡çµ„æ¸…å–®

### æ ¹ç›®éŒ„
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `index.html` | HTML çµæ§‹ã€CSSã€å”¯ä¸€ `<script type="module" src="./main.js">` |
| `main.js` | ESM å…¥å£ï¼šgameLoopã€initializeGameã€startGameWithLoadingã€startGame event listenerï¼›re-export pausePlayTimer/resumePlayTimer |
| `lang.js` | LANG å­—å…¸ã€applyLanguage()ã€t() ç¿»è­¯å‡½å¼ |
| `vite.config.js` | Vite æ‰“åŒ…è¨­å®šï¼Œè¼¸å‡º `dist/` èˆ‡å–®ä¸€å…¥å£ bundle |

### scripts/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `copy-sounds.js` | `npm run build` å¾Œè¤‡è£½ `sounds/` åˆ° `dist/sounds/` |
| `pack-itch.js` | å°‡ `dist/` æ‰“åŒ…ç‚º `silent-koel-itch.zip` ä¾› itch.io ä¸Šå‚³ |

### config/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `gameConfig.js` | GAME_INFOï¼ˆç‰ˆæœ¬è™Ÿï¼‰ã€GAME_TIMINGã€AUDIO_FILESã€FIXED_DELTA |
| `characters.js` | CHARACTERS è§’è‰²å®šç¾©å¸¸æ•¸ |
| `organs.js` | ORGANSï¼ˆ15ç¨®ï¼‰ã€HIDDEN_ORGANSï¼ˆ4ç¨®ï¼‰ã€COMBOSã€poisonSac |
| `creatures.js` | CREATURE_CONFIG、CREATURE_AI_CONFIG、ELITE_CONFIG、BOSS_CONFIG、HUNTER_ELITE_REWARDS、HUNTER_ELITE_POISON_RESIST |
| `evolution.js` | EVOLUTION_PATHSï¼ˆå„è·¯ç·š Lv1~5ï¼‰ã€SKILLSï¼ˆ9ç¨®ï¼‰ã€COMBOSï¼ˆ5ç¨®ï¼‰ |
| `patchnotes.js` | PATCH_NOTES é™£åˆ—ï¼Œæœ€æ–°ç‰ˆæœ¬ç½®é ‚ï¼›v0.1.25.3 èµ·ä¿ç•™ v0.1.22.1 ä»¥ä¸Šå…¬å‘Š |
| `supabase.js` | Supabase APIï¼ˆæŽ’è¡Œæ¦œã€é›²ç«¯å­˜æª”ï¼‰ |
| `compendium_data.js` | COMPENDIUM_DATA åœ–é‘‘è³‡æ–™ |
| `achievements.js` | ACHIEVEMENTS é™£åˆ—ï¼ˆ36 å€‹æˆå°±å®šç¾©ï¼Œv0.1.22.0ï¼›16 å€‹æ–°å¢ž condition æ¬„ä½ï¼Œv0.1.24.4ï¼‰ |
| `combatConfig.js` | COMBAT_CONFIGï¼ˆæ”»æ“Šé–“éš”å…¬å¼åŸºåº•ï¼Œv0.1.24.4ï¼‰ |
| `mutationConfig.js` | MUTATION_CONFIGï¼ˆæŠ€èƒ½é»žæ›è®Šç•°é»žå¸¸æ•¸ï¼Œv0.1.25.0ï¼‰ |
| `attributes.js` | ATTRIBUTES é™£åˆ—ï¼ˆ5 å€‹å±¬æ€§ç´”è³‡æ–™ï¼ŒAttribute Design v1ï¼Œv0.1.22.0ï¼‰ |
| `playerStatsFormula.js` | `calcPlayerStats(charId, skills, organs, hiddenOrgans, mutationLevels, unlockedAchievements)` â†’ 12 å±¬æ€§å¿«ç…§ï¼ˆå« attackSpeed çš„ final/baseIntervalMs/intervalMs èˆ‡ corpseXP å®Œæ•´ final/base/evoLevel/mutMultiplier/achPercentï¼‰ï¼›ç¬¬ 6 åƒæ•¸å‚³å·²è§£éŽ–æˆå°± mapï¼Œè®“é¢æ¿èˆ‡ runtime åŒæ­¥ï¼›ä¸ä¾è³´ä»»ä½• systems/ï¼›è©³è¦‹ docs/PLAYER_STATS_FORMULA.mdï¼ˆv0.1.25.2ï¼‰ |

### lang/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `zh-TW.js` | ç¹é«”ä¸­æ–‡èªžè¨€åŒ… |
| `en.js` | è‹±æ–‡èªžè¨€åŒ…ï¼ˆfallbackï¼‰ |

### storage/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `index.js` | localStorage key å¸¸æ•¸ã€å‹•æ…‹ key ç”¢ç”Ÿå™¨ã€å­—ä¸²/JSON è®€å¯« helper |

### stats/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `index.js` | sessionStats çµ±ä¸€è®€å¯«å…¥å£ï¼šreset/get/increment/max çµ±è¨ˆ |

### systems/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `gameState.js` | DEFAULT_SETTINGSã€gameState ç‰©ä»¶ã€canvas/ctx export |
| `gameFlow.js` | pausePlayTimer / resumePlayTimerï¼›Stage F æ‰¹æ¬¡ 1 å¾ž main.js æŠ½å‡ºï¼Œä¾› boss/organs/evolution/tutorial ä½¿ç”¨ |
| `map.js` | åœ°å½¢ç”Ÿæˆã€biome ç³»çµ±ã€drawTerrain |
| `utils.js` | ç¹ªè£½å·¥å…·ï¼šdrawArrowã€drawHealthBarã€drawNameTagã€drawGlowEffectã€spawnLootCircle |
| `audio.js` | AudioManagerã€initAudioã€preloadAllSfxBuffers |
| `camera.js` | worldToScreenã€updateCameraã€wrappedDistanceã€wrappedDelta |
| `input.js` | handleKeyDownã€handleKeyUpã€_updateMouseWorld |
| `spawning.js` | ç”Ÿç‰©/æžœå­ç”Ÿæˆé‚è¼¯ã€moveCreature |
| `player.js` | çŽ©å®¶ç§»å‹•ã€ç¢°æ’žã€æ”»æ“Šï¼ˆå«é˜¿å¥‡çˆ¾å°„æ°´ï¼‰ã€Boss æ­»äº¡äº‹ä»¶ dispatch |
| `feedback.js` | showFloatingTextï¼ˆCanvas æµ®å‹•æ–‡å­—ï¼‰ã€showXPPopupï¼ˆå¾ž combat.js / player.js æŠ½å‡ºï¼Œv0.1.20.0ï¼‰ |
| `reward.js` | addXPã€checkLevelUpï¼ˆå‡ç´š dispatch CustomEvent('levelUp')ï¼‰ï¼ˆå¾ž player.js æŠ½å‡ºï¼Œv0.1.20.1ï¼‰ |
| `loot.js` | _spawnBoneï¼ˆpush ç™½éª¨åˆ° gameState.bonesï¼‰ï¼ˆå¾ž combat.js æŠ½å‡ºï¼Œv0.1.20.1ï¼‰ |
| `damage.js` | applyDamageToPlayerã€handleKillã€handleGiantKillï¼ˆå¾ž combat.js æŠ½å‡ºï¼Œv0.1.21.0ï¼‰ |
| `combat.js` | playerAttackã€updateStatusEffectsã€ç™½éª¨ç³»çµ±ã€æ¯’å‚·ç–ŠåŠ ï¼ˆpoisonStacksï¼‰ï¼ˆå‚·å®³/æ“Šæ®ºæœå‹™å·²ç§»è‡³ damage.jsï¼‰ |
| `organs.js` | å™¨å®˜é¸æ“‡ã€handleEliteKillã€applyOrganEffects |
| `evolution.js` | æŠ€èƒ½æ¨¹ã€é€²åŒ–æ•ˆæžœã€buildSkillTreeOverlay |
| `mutation.js` | è®Šç•°ç³»çµ±ï¼ˆè·¨å±€æ°¸ä¹…ä¿ç•™ï¼‰ |
| `creatures.js` | updateNeutralCreaturesã€updateHostileCreaturesã€Alpha/å·¨äººç³»çµ±ã€é€šç”¨ç”Ÿç‰©åˆ†é›¢èˆ‡è¿‘æˆ°å‰å¾Œæ– |
| `elite.js` | spawnEliteCreatureã€updateEliteCreatureã€æ¯’éœ§éš¼é›™æŠ€èƒ½ç³»çµ± |
| `boss.js` | spawnBossã€updateBossã€é»‘è‰²çµäººå¤šç®¡è¡€æ¢ |
| `daynight.js` | getDayNightPhaseIndexã€updateDayNightCycle |
| `hud.js` | drawGame ä¸»æ¸²æŸ“ã€updateUIã€å°åœ°åœ–ã€Boss è¡€æ¢ UI |
| `ui.js` | é¢æ¿ç³»çµ±ã€showSettingsã€showCompendiumã€showPatchNotes |
| `tutorial.js` | æ–°æ‰‹æ•™å­¸ã€spawnTutorialStump |
| `chat.js` | èŠå¤©å®¤ã€å¸³è™Ÿç™»å…¥ã€Realtimeã€GM æŒ‡ä»¤ï¼ˆusername å°å¯«æ­£è¦åŒ– + GOBLINNEST éŽæ¿¾ï¼Œv0.1.22.0ï¼‰ |
| `achievements.js` | æˆå°±ç³»çµ±è®€å¯«å…¥å£ï¼šunlockAchievement / isUnlocked / getUnlockedAchievements / getActiveTitle / setActiveTitleï¼ˆv0.1.22.0ï¼‰ |
| `achievementTriggers.js` | Phase D æˆå°±è§¸ç™¼æŽ¥å…¥ï¼š`initAchievementTriggers()` ç›£è½ 20+ å€‹ CustomEventï¼ˆgameVictory / levelUp / killCountUpdated ç­‰ï¼‰ï¼Œå‘¼å« unlockAchievement(id)ï¼›æž¶æ§‹åŽŸå‰‡ï¼šä¸ import ä»»ä½• SCC æ¨¡çµ„ï¼ˆv0.1.23.0ï¼‰ |
| `achievementBonus.js` | æˆå°±æ°¸ä¹…åŠ æˆï¼š`getAchievementBonusTotals(unlockedIds)` / `applyAchievementStatBonuses()`ï¼›ç´”è³‡æ–™èšåˆ + runtime å¥—ç”¨ï¼Œä¸ä¾è³´ SCC æ¨¡çµ„ï¼ˆv0.1.25.0ï¼‰ |
| `leaderboard.js` | æŽ’è¡Œæ¦œé¢æ¿ã€åˆ†æ•¸æäº¤ |
| `mobile.js` | è£ç½®åµæ¸¬ã€æ–æ¡¿ã€æ”»æ“Šå€ã€è§¸æŽ§ç–ŠåŠ å±¤ |

### map/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `easymap.js` | EASY_MAP é…ç½® |
| `normalmap.js` | NORMAL_MAP é…ç½® |
| `hardmap.js` | HARD_MAP é…ç½® |

### tests/
| æª”æ¡ˆ | è·è²¬ |
|------|------|
| `tests/config/creatures.test.js` | ç”Ÿç‰© config æ¸¬è©¦ |
| `tests/config/gameConfig.test.js` | GAME_INFO / GAME_TIMING ç­‰æ ¸å¿ƒ config æ¸¬è©¦ |
| `tests/config/organs.test.js` | å™¨å®˜ config æ¸¬è©¦ |
| `tests/helpers/mockCanvas.js` | æ¸¬è©¦ç”¨ canvas mock |
| `tests/helpers/mockGameState.js` | æ¸¬è©¦ç”¨ gameState mock |
| `tests/helpers/mockStorage.js` | æ¸¬è©¦ç”¨ localStorage mock |
| `tests/performance/perf-baseline.test.js` | æ•ˆèƒ½ baseline æ¸¬è©¦ |
| `tests/stats/stats.test.js` | stats/index.js sessionStats æ¸¬è©¦ |
| `tests/storage/storage.test.js` | storage/index.js localStorage helper æ¸¬è©¦ |
| `tests/systems/camera.test.js` | camera ç³»çµ±æ¸¬è©¦ |
| `tests/systems/hud-font.test.js` | HUD å­—é«”èˆ‡é¡¯ç¤ºæ¸¬è©¦ |
| `tests/systems/map.test.js` | map ç³»çµ±æ¸¬è©¦ |
| `tests/systems/daynight.test.js` | daynight.js ç´”å‡½å¼æ¸¬è©¦ï¼ˆgetDayNightPhaseIndexï¼‰ |
| `tests/systems/creatures.test.js` | creatures.js ç´”å‡½å¼æ¸¬è©¦ï¼ˆ_effSpeedã€_shouldFleeFromGiantã€_getHyenaPackBonusã€_hyenaWheelPositionï¼‰ |
| `tests/systems/audio.test.js` | audio.js ç´”å‡½å¼æ¸¬è©¦ï¼ˆ_mobileFadeScaleã€_playSfxBufferï¼‰ |
| `tests/systems/damage.test.js` | damage/combat å›žæ­¸æ¸¬è©¦ï¼ˆhandleKillã€CustomEvent dispatchã€çŽ©å®¶å—å‚·ã€ranged callbackï¼‰ |

---

## 3. ESM çµæ§‹

### å…¥å£
```
index.html
  â””â”€ <script type="module" src="./main.js">
       â””â”€ main.js  â† æ‰€æœ‰ç³»çµ±çš„é ‚å±¤ import é»ž
```

### main.js ä¸»è¦ import éˆ
```
main.js
  â”œâ”€ config/gameConfig.js
  â”œâ”€ config/characters.js, organs.js, evolution.js, patchnotes.js, compendium_data.js
  â”œâ”€ lang.js â†’ lang/zh-TW.js, lang/en.js
  â”œâ”€ map/easymap.js, normalmap.js, hardmap.js
  â”œâ”€ systems/gameState.js
  â”œâ”€ systems/gameFlow.js
  â”œâ”€ systems/map.js
  â”œâ”€ systems/utils.js
  â”œâ”€ systems/audio.js
  â”œâ”€ systems/camera.js
  â”œâ”€ systems/input.js
  â”œâ”€ systems/spawning.js
  â”œâ”€ systems/player.js  â”€â”
  â”œâ”€ systems/feedback.js
  â”œâ”€ systems/reward.js
  â”œâ”€ systems/loot.js
  â”œâ”€ systems/combat.js  â”€â”¤â† å¾ªç’°ä¾è³´å¢ï¼ˆè¦‹ç¬¬ 6 ç¯€ï¼‰
  â”œâ”€ systems/organs.js  â”€â”˜
  â”œâ”€ systems/evolution.js
  â”œâ”€ systems/mutation.js
  â”œâ”€ systems/creatures.js
  â”œâ”€ systems/elite.js
  â”œâ”€ systems/boss.js
  â”œâ”€ systems/daynight.js
  â”œâ”€ systems/hud.js
  â”œâ”€ systems/ui.js
  â”œâ”€ systems/tutorial.js
  â”œâ”€ systems/chat.js
  â”œâ”€ systems/achievements.js
  â”œâ”€ systems/achievementTriggers.js
  â”œâ”€ systems/leaderboard.js
  â””â”€ systems/mobile.js
```

---

## 4. gameState é ‚å±¤çµæ§‹

å®šç¾©æ–¼ `systems/gameState.js`ï¼Œä»¥ `export const gameState = { ... }` åŒ¯å‡ºã€‚

| æ¬„ä½ | é¡žåž‹ | ç”¨é€” |
|------|------|------|
| `canvasWidth / canvasHeight` | number | é‚è¼¯è§£æžåº¦ï¼ˆæ¡Œæ©Ÿ 1600Ã—900ï¼‰ |
| `player` | object | çŽ©å®¶å®Œæ•´ç‹€æ…‹ï¼ˆä½ç½®ã€å™¨å®˜ã€é€²åŒ–ã€æŠ€èƒ½ã€é˜¿å¥‡çˆ¾å°ˆç”¨æ¬„ä½ç­‰ï¼‰ |
| `trees / fruits` | array | åœ°åœ–ç‰©ä»¶ |
| `neutralCreatures / hostileCreatures / corpses / bones` | array | ç”Ÿç‰© |
| `projectiles` | array | å­å½ˆï¼ˆé˜¿å¥‡çˆ¾å°„æ°´ï¼‰ |
| `floatTexts` | array | Canvas æ‰¹æ¬¡æµ®å‹•æ–‡å­— |
| `brainShockwaves` | array | è…¦å™¨å®˜è¡æ“Šæ³¢ |
| `stats` | object | hpMax / hpCurrent / xpCurrent / timeStatus / dayCycle |
| `keys` | object | WASD éµç›¤ç‹€æ…‹ |
| `boss / bossSpawned / bossBellPlayed` | mixed | Boss ç‹€æ…‹ |
| `eliteCreature / eliteOrder / eliteJustKilled` | mixed | ç²¾è‹±æ€ªç‹€æ…‹ |
| `alphaCreature` | object\|null | ç•¶å‰ Alpha ç”Ÿç‰© |
| `camera` | object | é¡é ­ä¸–ç•Œåº§æ¨™ {x, y} |
| `isNight / currentPhaseIndex` | boolean / number | æ—¥å¤œé€±æœŸ |
| `timeRemaining / lastTimeTick` | number | å€’è¨ˆæ™‚ï¼ˆç§’ï¼‰ |
| `gameOver / victory / gameStarted` | boolean | éŠæˆ²æµç¨‹ç‹€æ…‹ |
| `isMobile / orientation / forceMode` | mixed | è£ç½®ç‹€æ…‹ |
| `mobileInput` | object | æ–æ¡¿æ–¹å‘å‘é‡ {dx, dy} |
| `mutationData / mutationSkills / mutationSkillPoints` | mixed | è®Šç•°ç³»çµ±ï¼ˆè·¨å±€æ°¸ä¹…ï¼‰ |
| `skillPoints / playerSkills` | mixed | æŠ€èƒ½æ¨¹ |
| `organSelectionActive / pendingOrganSelections` | boolean / number | å™¨å®˜é¸æ“‡ç‹€æ…‹ |
| `spawnTimers` | object | å„ biome ç”Ÿç‰©è£œå……è¨ˆæ™‚å™¨ |
| `settingsOpen / skillTreeOpen / mutationPanelOpen / tutorialOpen` | boolean | UI é¢æ¿ç‹€æ…‹ |
| `realPlayTime / _playTimerStart / _playTimerPaused` | mixed | å¯¦éš›éŠæˆ²æ™‚é–“è¨ˆæ™‚ |
| `selectedCharacter` | string | ç•¶å‰è§’è‰² ID |
| `cameraZoom` | number | è¦–é‡Žç¸®æ”¾ï¼ˆæ‰‹æ©Ÿè‡ªå‹•èª¿æ•´ï¼Œæ¡Œæ©Ÿå›ºå®š 1.0ï¼‰ |
| `settings` | object | ä½¿ç”¨è€…è¨­å®šï¼ˆè¤‡è£½è‡ª DEFAULT_SETTINGSï¼‰ |
| `mouseWorld / mouseScreen` | object | æ»‘é¼ ä¸–ç•Œ / èž¢å¹•åº§æ¨™ |
| `dashEffect` | object\|null | é–ƒç¾ç‰¹æ•ˆç‹€æ…‹ |
| `mapSeed / terrainMap / fogMap / currentMap` | mixed | åœ°åœ–è³‡æ–™ |

---

## 5. ä¸»è¦ç³»çµ±é‹ä½œ

### Day/Nightï¼ˆdaynight.jsï¼‰
- æ¯å±€å€’è¨ˆæ™‚ 600 ç§’ï¼ˆ`gameState.timeRemaining`ï¼‰
- `getDayNightPhaseIndex(timeRemaining)` ä¾å‰©é¤˜æ™‚é–“æ±ºå®šç•¶å‰éšŽæ®µï¼ˆç´”å‡½å¼ï¼Œåƒæ•¸æ³¨å…¥ï¼‰
- `updateDayNightCycle()` æ¯å¹€å‘¼å«ï¼Œè§¸ç™¼ `applyNightTransition / applyDayTransition`

### Elite ç³»çµ±ï¼ˆelite.jsï¼‰
- `initEliteOrder()` é–‹å±€å¾ž config æ±ºå®šç²¾è‹±æ€ªå‡ºå ´é †åº
- `spawnEliteCreature()` ä¾é›£åº¦ç”Ÿæˆå°æ‡‰ç²¾è‹±æ€ª
- æ¯’éœ§éš¼é›™æŠ€èƒ½ï¼ˆv0.1.11.0ï¼‰ï¼šæ¯’ç‰†ï¼ˆ3000+500ms CDï¼‰ã€æ¯’ç‰™å›žæ—‹ï¼ˆ2500+500ms CDï¼‰ï¼ŒåŒæ™‚ ready æ™‚æ¯’ç‰†å„ªå…ˆ
- `_updateEliteVenomPuddle()` ç®¡ç†æ¯’éœ§è½åœ° puddle

### Combat ç³»çµ±ï¼ˆcombat.jsï¼‰
- `playerAttack()` çµ±ä¸€çŽ©å®¶æ”»æ“Šå…¥å£
- `applyDamageToPlayer()` è™•ç†æ‰€æœ‰å°çŽ©å®¶å‚·å®³
- `poisonStacks` æ¯’å‚·ç–ŠåŠ ï¼šæ¯å±¤ç¨ç«‹è¨ˆæ™‚ï¼Œæ¯ç§’ç¨ç«‹é¡¯ç¤ºæµ®å‹•æ–‡å­—ï¼Œæ–°æ¯’ä¸è¦†è“‹èˆŠæ¯’ï¼ˆv0.1.11.0ï¼‰
- ç™½éª¨ç³»çµ±ï¼š`updateBoneEating` / `_addBoneMaterial` / `_spawnBone`
- `showFloatingText()` æŽ¨å…¥ `gameState.floatTexts`ï¼Œç”± `hud.js` æ‰¹æ¬¡ç¹ªè£½

### Audioï¼ˆaudio.jsï¼‰
- `AudioManager` ç®¡ç†éŸ³æ¨‚/éŸ³æ•ˆæ’­æ”¾
- `preloadAllSfxBuffers()` å•Ÿå‹•æ™‚é è¼‰å…¨éƒ¨éŸ³æ•ˆ
- `stopIntroTheme() / playIntroTheme()` é¦–é èƒŒæ™¯éŸ³æ¨‚

### HUDï¼ˆhud.jsï¼‰
- `drawGame()` æ¯å¹€ä¸»æ¸²æŸ“ï¼ˆå…ˆ canvas ä¸–ç•Œï¼Œå¾Œ HTML overlayï¼‰
- `updateUI()` æ›´æ–° HTML div overlay
- Boss è¡€æ¢ UI é‡å¯«ï¼ˆv0.1.11.0ï¼‰ï¼š`drawTopBarUI()` ç®¡ç† topBarTarget / topBarFadeTimer
- `drawMinimap()` + `updateMinimapFog()` å°åœ°åœ–èˆ‡éœ§æ•ˆ

### Creature ç³»çµ±ï¼ˆcreatures.jsï¼‰
- `updateNeutralCreatures()` ä¸‰æ…‹ç§»å‹•ï¼ˆbiome ç”Ÿç‰© / éž biome èˆŠé‚è¼¯ï¼‰ï¼Œå« Alpha ç¹¼æ‰¿æŽƒæ
- `updateHostileCreatures()` æ•µå°ç”Ÿç‰© AI
- å·¨äºº/Alphaï¼ˆv0.1.10.0ï¼‰ï¼šç„¡éšŠä¼ç¨ç«‹å·¨äººç›¸é‡å‡æ ¼ Alphaï¼Œæ¯ 3 ç§’æŽƒæ
- é¬£ç‹—è»Šè¼ªæˆ°ï¼ˆv0.1.11.0ï¼‰ï¼šä¸‰åœ‹æ­¦å°‡åç¨±æ±  + è»Šè¼ªæˆ° AI

---

## 6. å·²çŸ¥æž¶æ§‹å•é¡Œ

### å¾ªç’°ä¾è³´ï¼ˆStage F è™•ç†ä¸­ï¼‰

åŸºæ–¼ v0.1.20.1 å…¨åŸŸ import é‡æŽƒï¼ˆæŽ’é™¤ `dist/`ã€`node_modules/`ã€`tests/`ï¼‰ï¼Œä¸Šæ¬¡ 1 å€‹ 18 æª”æ¡ˆå¤§åž‹ SCC å·²ç¸®å°ç‚º 1 å€‹ 12 æª”æ¡ˆ SCCï¼š

`systems/boss.js`, `systems/chat.js`, `systems/combat.js`, `systems/creatures.js`, `systems/daynight.js`, `systems/elite.js`, `systems/evolution.js`, `systems/leaderboard.js`, `systems/mobile.js`, `systems/organs.js`, `systems/player.js`, `systems/ui.js`

`main.js`ã€`systems/hud.js`ã€`systems/input.js`ã€`systems/mutation.js`ã€`systems/tutorial.js`ã€`systems/utils.js` å·²ä¸åœ¨å¤§åž‹ SCC å…§ã€‚æ–°å»ºä½Žå±¤æ¨¡çµ„ `systems/gameFlow.js`ã€`systems/feedback.js`ã€`systems/reward.js`ã€`systems/loot.js` å‡æœªé€²å…¥ä»»ä½•å¾ªç’°ã€‚

#### Stage F å·²è§£é™¤å¾ªç’°

| ç·¨è™Ÿ | åŽŸå¾ªç’° | ç‹€æ…‹ |
|------|--------|------|
| #1 | `main.js` â†” `systems/boss.js` | âœ… å·²è§£é™¤ v0.1.19.0 |
| #2 | `main.js` â†” `systems/evolution.js` | âœ… å·²è§£é™¤ v0.1.19.0 |
| #3 | `main.js` â†” `systems/organs.js` | âœ… å·²è§£é™¤ v0.1.19.0 |
| #4 | `main.js` â†” `systems/tutorial.js` | âœ… å·²è§£é™¤ v0.1.19.0 |
| #5 | `main.js` â†” `systems/ui.js` | âœ… å·²è§£é™¤ v0.1.19.0 |
| #13 | `systems/combat.js` â†” `systems/mutation.js` | âœ… å·²è§£é™¤ v0.1.20.0ï¼ˆfeedback å´æ‹†å‡ºï¼‰ |
| #14 | `systems/combat.js` â†” `systems/utils.js` | âœ… å·²è§£é™¤ v0.1.20.1ï¼ˆ_spawnBone æ”¹ç”± loot.js æä¾›ï¼‰ |
| #11 | `systems/boss.js` â†” `systems/combat.js` | âœ… å·²è§£é™¤ v0.1.21.0ï¼ˆdamage.js æŠ½å‡º + bossKilled äº‹ä»¶åŒ–ï¼‰ |
| #6 | `systems/combat.js` â†” `systems/player.js` | âœ… å·²è§£é™¤ v0.1.21.0ï¼ˆdamage.js æŠ½å‡º + callback injectionï¼‰ |

#### ä»å­˜åœ¨æˆ–éƒ¨åˆ†å­˜åœ¨å¾ªç’°

| ç·¨è™Ÿ | åŽŸå¾ªç’° | v0.1.20.1 ç‹€æ…‹ | èªªæ˜Ž |
|------|--------|----------------|------|
| #6 | `systems/combat.js` â†” `systems/player.js` | âœ… å®Œå…¨è§£é™¤ v0.1.21.0 | `applyDamageToPlayer`/`handleKill`/`handleGiantKill` ç§»è‡³ `damage.js`ï¼›`_archerAttack` æ”¹ callback injectionï¼Œç›´æŽ¥é›™å‘ import å…¨æ¶ˆé™¤ã€‚ |
| #7 | `systems/organs.js` â†” `systems/player.js` | âš ï¸ éƒ¨åˆ†ä»å­˜åœ¨ | `addXP` å´å·²æ‹†å‡ºï¼›`player.js` ä» import `organs.js`ï¼Œä¸”å…©è€…ä»åœ¨åŒä¸€ SCCï¼Œéœ€è™•ç†å™¨å®˜æ•ˆæžœèˆ‡çŽ©å®¶ç‹€æ…‹è€¦åˆã€‚ |
| #8 | `systems/combat.js` â†” `systems/organs.js` | âš ï¸ éƒ¨åˆ†ä»å­˜åœ¨ | `organs.js` å·²ä¸ç›´æŽ¥ import `combat.js`ï¼Œä½†å…©è€…ä»å¯é€éŽ SCC äº’ç›¸æŠµé”ï¼›æˆ°é¬¥èˆ‡å™¨å®˜è¦å‰‡ä»è€¦åˆã€‚ |
| #9 | `systems/combat.js` â†” `systems/evolution.js` | âš ï¸ éƒ¨åˆ†ä»å­˜åœ¨ | ç›´æŽ¥é›™å‘ import å·²è§£é™¤ï¼Œä½†ä»åœ¨åŒä¸€ SCCï¼Œé€éŽ boss/organs/ui ç­‰è·¯å¾‘äº’ç›¸æŠµé”ã€‚ |
| #10 | `systems/evolution.js` â†” `systems/organs.js` | âŒ ä»å­˜åœ¨ | å…©è€…ä»ç›´æŽ¥é›™å‘ importï¼Œæ˜¯æ‰¹æ¬¡ 3 çš„æ ¸å¿ƒç›®æ¨™ä¹‹ä¸€ã€‚ |
| #11 | `systems/boss.js` â†” `systems/combat.js` | âœ… å®Œå…¨è§£é™¤ v0.1.21.0 | `applyDamageToPlayer` ç§»è‡³ `damage.js`ï¼ˆboss æ”¹ import damage.jsï¼‰ï¼›combatâ†’boss `handleBossKill` æ”¹ dispatch `bossKilled` äº‹ä»¶ã€‚ |
| #12 | `systems/boss.js` â†” `systems/player.js` | âš ï¸ éƒ¨åˆ†ä»å­˜åœ¨ | ç›´æŽ¥é›™å‘ import å·²è§£é™¤ï¼Œä½†ä»åœ¨åŒä¸€ SCCï¼Œé€éŽ combat/mobile/organs ç­‰è·¯å¾‘äº’ç›¸æŠµé”ã€‚ |
| #15 | `systems/mobile.js` â†” `systems/player.js` | âŒ ä»å­˜åœ¨ | ä»ç›´æŽ¥é›™å‘ importï¼Œå±¬ä½Žåš´é‡åº¦è¼¸å…¥/çŽ©å®¶è€¦åˆã€‚ |
| #16 | `systems/mobile.js` â†” `systems/ui.js` | âŒ ä»å­˜åœ¨ | ä»ç›´æŽ¥é›™å‘ importï¼Œå±¬ä½Žåš´é‡åº¦è£ç½®/UI è€¦åˆã€‚ |
| #17 | `systems/evolution.js` â†” `systems/ui.js` | âŒ ä»å­˜åœ¨ | ä»ç›´æŽ¥é›™å‘ importï¼ŒæŠ€èƒ½æ¨¹ overlay èˆ‡ UI builder è€¦åˆã€‚ |

#### æ–°æ¨¡çµ„ä¾è³´ç¢ºèª

| æ¨¡çµ„ | import æ¸…å–® | å¾ªç’°ç‹€æ…‹ |
|------|-------------|----------|
| `systems/gameFlow.js` | `systems/gameState.js` | ç„¡æ–°å¾ªç’° âœ… |
| `systems/feedback.js` | `systems/camera.js`, `systems/gameState.js`, `systems/map.js` | ç„¡æ–°å¾ªç’° âœ… |
| `systems/reward.js` | `lang.js`, `systems/audio.js`, `systems/gameState.js` | ç„¡æ–°å¾ªç’° âœ… |
| `systems/loot.js` | `systems/gameState.js` | ç„¡æ–°å¾ªç’° âœ… |
| `systems/damage.js` | `systems/gameState.js`, `systems/audio.js`, `systems/feedback.js`, `systems/reward.js`, `stats/index.js`, `systems/utils.js`, `lang.js`, `systems/mutation.js` | ç„¡æ–°å¾ªç’° âœ…ï¼ˆv0.1.21.1 ç§»é™¤ organs.js importï¼Œæ”¹ dispatch eliteKilled äº‹ä»¶ï¼‰ |

**æ‰¹æ¬¡ 1 å·²å®Œæˆï¼ˆv0.1.19.0ï¼‰**ï¼šè§£é™¤ #1~#5ï¼Œ`main.js` åå‘ä¾è³´å…¨éƒ¨æ¶ˆå¤±ã€‚  
**æ‰¹æ¬¡ 2 å·²å®Œæˆï¼ˆv0.1.20.0~v0.1.20.1ï¼‰**ï¼šå®Œå…¨è§£é™¤ #13ã€#14ï¼›#6 ç­‰éƒ¨åˆ†è§£é™¤ã€‚  
**æ‰¹æ¬¡ 3a å·²å®Œæˆï¼ˆv0.1.21.0ï¼‰**ï¼šå®Œå…¨è§£é™¤ #11ï¼ˆboss â†” combatï¼‰ã€#6ï¼ˆcombat â†” playerï¼‰ï¼Œæ–°å»º `damage.js`ï¼ŒbossKilled äº‹ä»¶åŒ–ï¼Œ_archerAttack callback æ³¨å…¥ã€‚  
**æ‰¹æ¬¡ 3b / 3c å¾…è™•ç†**ï¼š#10ï¼ˆevolution â†” organsï¼‰ã€#17ï¼ˆevolution â†” uiï¼‰ã€#15ï¼ˆmobile â†” playerï¼‰ã€#16ï¼ˆmobile â†” uiï¼‰ã€‚

### ä¸ä¸€è‡´æ¨¡å¼
- `hud.js` åŒæ™‚è² è²¬ Canvas æ¸²æŸ“ï¼ˆ`drawGame`ï¼‰å’Œ HTML overlay æ›´æ–°ï¼ˆ`updateUI`ï¼‰ï¼Œè·è²¬æ··åˆ

### Dead codeï¼ˆå·²æ¸…ç† v0.1.13.0ï¼‰
- `systems/combat.js`ï¼š`addMutationPoints` stub å·²ç§»é™¤ï¼Œæ”¹ç‚ºæ­£å¼å‘¼å« mutation.js
- `systems/hud.js`ï¼š`console.log && false` dead code å·²ç§»é™¤
- `systems/creatures.js`ï¼š`_drawDirectionArrow()` æ¸¬è©¦å‡½å¼å·²ç§»é™¤

*æœ€å¾Œæ›´æ–°ï¼šv0.1.26.0ï¼Œæ–°å¢žç”Ÿç‰©åˆ†é›¢ã€è¿‘æˆ°å‰æ–/å‘½ä¸­/å¾Œæ–å…±ç”¨æµç¨‹ã€é¬£ç‹—åŒ…åœèˆ‡å·¨äºº/Alpha regroup è¡Œç‚º*

