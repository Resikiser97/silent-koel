## v0.1.26.0

# The Silent Koel â€” æ¨¡çµ„æž¶æ§‹èªªæ˜Ž

## æ¨¡çµ„ä¾è³´é †åºï¼ˆESM import éˆï¼Œå…¥å£ç‚º main.jsï¼‰

```
config/gameConfig.js      GAME_INFO, GAME_TIMING, AUDIO_FILES, HARD_ELITE_CONFIG
config/organs.js          ORGANS, HIDDEN_ORGANS, COMBOS
config/creatures.js       CREATURE_CONFIG, CREATURE_AI_CONFIG, ELITE_CONFIG, BOSS_CONFIG（含 hunter 黑色獵人；生物分離/近戰前後搖/鬣狗 pack 數值集中於 CREATURE_AI_CONFIG）
                          HUNTER_ELITE_REWARDS, HUNTER_ELITE_POISON_RESIST（靜音獵隊獎勵與毒抗，v0.1.25.8）
config/evolution.js       EVOLUTION_PATHS, SKILLS
config/patchnotes.js      PATCH_NOTESï¼ˆv0.1.25.3 èµ·çŽ©å®¶å…¬å‘Šä¿ç•™ v0.1.22.1 ä»¥ä¸Šï¼‰
config/compendium_data.js COMPENDIUM_DATAï¼ˆå››å¤§åœ–é‘‘åˆ†é¡žï¼Œéœ€åœ¨ map/normalmap.js ä¹‹å¾Œè¼‰å…¥ï¼‰
config/characters.js      CHARACTERSï¼ˆè§’è‰²å®šç¾©å¸¸æ•¸ï¼Œv0.56.0ï¼‰
config/xpConfig.js        XP_CONFIGï¼šæŽ¡é›† XPï¼ˆfruit.base/foragerPerLevel/noHerbivoreBaseï¼‰ã€æ“Šæ®º XPï¼ˆkill.minCreatureBaseXP/hunterPerLevelï¼‰ã€hostile XP å…¬å¼ï¼ˆkill.hostile.*ï¼‰æ‰€æœ‰å¸¸æ•¸é›†ä¸­å®šç¾©ï¼ˆv0.1.24.5ï¼‰
config/combatConfig.js    COMBAT_CONFIG.baseAttackIntervalMsï¼ˆæ”»æ“Šé–“éš”å…¬å¼åŸºåº•ï¼Œv0.1.24.4ï¼‰
config/playerStatsFormula.js
                          calcPlayerStats(charId, skills, organs, hiddenOrgans, mutationLevels, unlockedAchievements)
                            â†’ { attack, attackSpeed, hpMax, speed, radius, attackRange, tenacity,
                                critChance, critMult, fruitXP, killXP, corpseXP }
                          ç¬¬ 6 åƒæ•¸ unlockedAchievementsï¼ˆobjectï½œnullï¼‰ï¼šå‚³å…¥å·²è§£éŽ–æˆå°± mapï¼Œè®“é¢æ¿é¡¯ç¤ºå€¼èˆ‡ runtime æˆå°±åŠ æˆåŒæ­¥ï¼ˆv0.1.25.0ï¼‰
                          attackSpeed è¿”å›žæ¬„ä½ï¼š{ final, baseIntervalMs, intervalMs, base, organAdd, achAdd }ï¼ŒPlayer Stats é¡¯ç¤ºè§’è‰²åŸºåº•æ”»é€Ÿèˆ‡æ”»æ“Šé–“éš”ï¼ˆv0.1.25.2ï¼‰
                          corpseXP è¿”å›žæ¬„ä½ï¼š{ final, base, evoLevel, mutMultiplier, achPercent }ï¼Œé è¨­è‚‰é£Ÿæ€§ Lv1 æ¼”ç¤ºï¼ˆv0.1.25.2ï¼‰
                          ç´”è³‡æ–™æ¨¡çµ„ï¼Œä¸ import ä»»ä½• systems/ï¼›ä¾è³´ config/characters.js / config/organs.js / config/evolution.js / config/xpConfig.js / config/achievements.js
                          æ”¯æ´ organs/hiddenOrgans array æˆ– object å…©ç¨®æ ¼å¼
                          è©³ç´°è¨ˆç®—è¦å‰‡èˆ‡é™åˆ¶è¦‹ docs/PLAYER_STATS_FORMULA.md
                          æ¸¬è©¦ï¼štests/config/playerStatsFormula.test.jsï¼ˆ168 å€‹æ¸¬è©¦ï¼Œv0.1.25.2ï¼‰

lang.js                   LANG_LIST, LANG={}, _langPack(), applyLanguage(), t()
lang/zh-TW.js             LANG['zh-TW']
lang/en.js                LANG['en']

systems/gameState.js      DEFAULT_SETTINGS, gameState, canvas, ctx, MAP å¸¸æ•¸
systems/gameFlow.js       pausePlayTimer, resumePlayTimerï¼ˆStage F æ‰¹æ¬¡ 1ï¼šå¾ž main.js æŠ½å‡ºï¼Œä¾› boss/organs/evolution/tutorial ä½¿ç”¨ï¼‰
systems/map.js            MAP_WIDTH/HEIGHT/VIEW_W/VIEW_H, TILE_SIZE, NOISE_SCALE, MAP_RULES
                          BIOME_COLOR
                          getBiome, getBgColor
                          labelBiomeRegions, mergeSmallRegions, ensureRequiredBiomes
                          generateTerrain, buildTerrainCanvas, drawTerrain
                          generateTrees
systems/utils.js          drawArrow, drawHealthBar, drawNameTag, drawGlowEffect
                          applyTenacityï¼ˆéŸŒæ€§ç¸®çŸ­CCæ™‚é–“ï¼Œv0.56.0ï¼‰
                          getGameFontï¼ˆcanvas å­—åž‹è¼”åŠ©ï¼Œä¾ fontLarge/fontBold è¨­å®šå‹•æ…‹ç”Ÿæˆï¼Œv0.0.66.1ï¼‰
                          spawnLootCircle
systems/audio.js          AudioManager, initAudio, preloadAllSfxBuffers
                          playIntroTheme, stopIntroThemeï¼ˆé¦–é èƒŒæ™¯éŸ³æ¨‚ï¼Œv0.1.0.1ï¼‰
systems/camera.js         wrappedDistance, wrappedDelta, worldToScreen, updateCamera
                          _updateCameraZoomï¼ˆè¦–é‡Žç¸®æ”¾ï¼Œé‡æ§‹è‡ª _updateMobileCameraZoomï¼Œv0.58.0ï¼‰
                          updateCameraï¼šalwaysCenter è¨­å®šç‚º true æ™‚ edgeThreshold=0.5ï¼Œè§’è‰²æ°¸é å±…ä¸­ï¼ˆv0.57.5ï¼‰
systems/input.js          handleKeyDown, handleKeyUp, _calcMouseWorld, _updateMouseWorldï¼ˆå«è¨­å®šä»‹é¢æŒ‰éµ handler refsï¼‰
systems/spawning.js       spawnFruitFromTree, spawnFruit, moveCreature
                          _randomPointInBiome, _makeHerbCreature, _makeCarnCreature
                          spawnBiomeCreaturesï¼ˆé–‹å±€è¨­ spawnProtectUntil +3sï¼Œä¸­å¿ƒä¿è­·å€ä¸ç”Ÿè‚‰é£Ÿæ€ªï¼Œv0.0.66.2ï¼‰
                          spawnCreatureAtEdgeBiome
                          updateCreatureSpawningï¼ˆspawnProtectUntil æœŸé–“è·³éŽè‚‰é£Ÿè£œå……ï¼Œv0.0.66.2ï¼‰
systems/feedback.js       showFloatingTextï¼ˆCanvas æµ®å‹•æ–‡å­—ï¼ŒæŽ¨å…¥ gameState.floatTextsï¼‰
                          showXPPopupï¼ˆXP å–å¾—æµ®å‹•æ–‡å­—ï¼‰
                          ï¼ˆStage F æ‰¹æ¬¡ 2ï¼šå¾ž combat.js / player.js æŠ½å‡ºï¼Œv0.1.20.0ï¼‰
systems/reward.js         addXPï¼ˆXP ç´¯åŠ ï¼Œå«æŠ€èƒ½åŠ æˆï¼‰
                          checkLevelUpï¼ˆå‡ç´šåˆ¤æ–·ï¼Œdispatch CustomEvent('levelUp')ï¼‰
                          ï¼ˆStage F æ‰¹æ¬¡ 2ï¼šå¾ž player.js æŠ½å‡ºï¼Œv0.1.20.1ï¼‰
systems/loot.js           _spawnBoneï¼ˆpush ç™½éª¨åˆ° gameState.bonesï¼‰
                          ï¼ˆStage F æ‰¹æ¬¡ 2ï¼šå¾ž combat.js æŠ½å‡ºï¼Œv0.1.20.1ï¼‰
systems/player.js         updatePlayerMovement, checkFruitCollision, updateTreeFruitProduction
                          updatePassiveOrgans, checkXPMilestone
                          findBestPerceptionPath
                          playerDashï¼ˆé–ƒç¾æŠ€èƒ½ï¼šçž¬ç§»+ç„¡æ•µ+å†·å»ï¼Œv0.53.0ï¼‰
                          _collectFruitï¼ˆæžœå­å¸æ”¶ XP å…±ç”¨å‡½å¼ï¼Œv0.54.0ï¼›v0.57.6 åŠ å…¥è‰é£Ÿæ€§åˆ¤æ–·ï¼šev.herbivore >= 1 æ‰å¥—æ­£å¸¸ XP è¨ˆç®—ï¼Œå¦å‰‡å›ºå®š 1 XPï¼‰
                          updateProjectiles, _checkProjectileHitï¼ˆå­å½ˆç³»çµ±ï¼Œv0.56.0ï¼›v0.57.5 è£œå…¥ tutorialStumpï¼‰
                          _archerAttack, _getArcherShootDir, _findArcherAutoTargetï¼ˆé˜¿å¥‡çˆ¾æ”»æ“Šï¼Œv0.56.0ï¼‰
systems/tutorial.js       showTutorialï¼ˆä¸‰æ­¥é©Ÿæ•™å­¸ä¸»å…¥å£ï¼‰ï¼ŒspawnTutorialStumpï¼ŒhandleTutorialStumpKill
                          showTutorialCombatHintï¼ŒshowTutorialCombatComplete
                          resetTutorialï¼ˆå¼·åˆ¶é‡ç½®æ•™å­¸ç‹€æ…‹ï¼Œä¾› initializeGame æ¯å±€å‘¼å«ï¼Œv0.1.3.6ï¼‰
                          ï¼ˆIIFE æ¨¡çµ„ï¼ŒæŽ›è‡³ windowï¼›v0.43.0 æ–°å¢žï¼Œv0.45.0 åŠ å…¥æˆ°é¬¥æ•™å­¸ï¼‰
systems/damage.js         applyDamageToPlayerï¼ˆçŽ©å®¶å—å‚·ã€åˆºç”²åå‚·ã€tenacity ä¿å‘½ï¼‰
                          handleKillï¼ˆæ™®é€š/æ•µå°ç”Ÿç‰©æ“Šæ®ºçŽå‹µï¼›ç§»é™¤å·²æ“Šæ®ºç”Ÿç‰©ï¼›dispatch eliteKilledï¼‰
                          handleGiantKillï¼ˆå·¨äºº/Alpha æ“Šæ®ºçŽå‹µï¼‰
                          ï¼ˆStage F 3aï¼šå¾ž combat.js æŠ½å‡ºï¼Œä¾› boss/player/creatures/elite å…±ç”¨ï¼Œv0.1.21.0ï¼‰
systems/combat.js         playerAttack, setRangedAttackCallback
                          updateStatusEffects, updateCorpseEating, drawCorpseEatingBars
                          updateBoneEating, _addBoneMaterial, _checkPoisonSacUpgrade
                          drawBones
                          ï¼ˆshowFloatingText / _spawnBone / applyDamageToPlayer / handleKill / handleGiantKill å·²ç§»è‡³ feedback.js / loot.js / damage.jsï¼‰
                          ï¼ˆplayerAttack() å°‡ tutorialStump åŠ å…¥æ”»æ“Šç›®æ¨™ï¼›v0.45.0ï¼‰
                          ï¼ˆplayerAttack() å«å˜´å™¨æ¸›é€Ÿ/é¯Šé­šå—…è‘‰å‚·å®³åŠ æˆ/Debuff StartTimeï¼›v0.56.0ï¼‰
systems/organs.js         getOrganLevel, getOrganCumulative, getComboHint, checkComboEffects
                          getOrganSlotsUsed, applyHiddenOrganEffects, applyOrganEffects
                          checkOrganUpgrade, showOrganSelection, drawOrganUI
                          handleEliteKill, showHiddenOrganSelection
                          _drawCompendiumBtnï¼ˆç¹ªè£½ ðŸ“– æŒ‰éˆ•ï¼Œè¨­å®š _compendiumBtnRegionï¼‰
                          ï¼ˆshowOrganSelection() åµæ¸¬ tutorialOrganPhaseï¼ŒéŽ–å®šç¬¬ä¸€å¼µæ”»æ“Šå™¨å®˜ï¼›v0.45.0ï¼‰
systems/mutation.js       initMutationData, saveMutationData, addMutationPoints
                          DEFAULT_MUTATION_SKILLS, initMutationSkills, _saveMutationSkills, _syncMutationSkillPointsï¼ˆè®Šç•°æŠ€èƒ½æ¨¹ï¼Œv0.0.69.0ï¼‰
                          _checkAndRepairMutationSkillsï¼ˆå•Ÿå‹•æ™‚é©—ç®—ä¸¦ä¿®å¾©ç•°å¸¸ï¼›ä¸åœ¨é¢æ¿é–‹å•Ÿæ™‚å‘¼å«ï¼Œv0.1.3.1/v0.1.3.3ï¼‰
                          getMutationUpgradeCost, upgradeMutation
                          applyMutationEffects, applyAllMutationBonuses
                          checkMutationCompensation, showMutationPanel
systems/evolution.js      checkEvolutionUnlock, applyEvolutionLevelEffect, applyEvolutionEffects
                          loadSavedOrgansï¼ˆç¨ç«‹å‡½å¼ï¼Œv0.57.5ï¼›initializeGame() åœ¨ applySkillBonuses() å‰å‘¼å«ç¢ºä¿å™¨å®˜ä¸ä¸Ÿå¤±ï¼›buildSkillTreeOverlay(fromHome) åªè®€ skillPoints ä¸å†é‡è¤‡å¥—ç”¨ï¼‰
                          applySkillBonuses, saveLastRunOrgans, showSkillTree
                          buildSkillTreeOverlay, upgradeSkill
                          _buildMutationSkillContent, _buildMutRightCol, _refreshMutContentRightï¼ˆè®Šç•°é¢æ¿å»ºç«‹èˆ‡æ›´æ–°ï¼Œv0.1.0.1 é‡æ§‹ï¼‰
                          _upgradeMutationSkillï¼ˆè®Šç•°æŠ€èƒ½æ¨¹å­é¢æ¿ï¼Œv0.0.69.0ï¼‰
                          buildSkillTreeOverlay æ¨¡å¼èªªæ˜Žï¼ˆv0.57.7ï¼‰ï¼š
                            fromHome / forceStart â†’ è®€ localStorage skillPoints/playerSkills + è®€ lastRunOrgans é¡¯ç¤ºç¹¼æ‰¿å™¨å®˜
                            postGame â†’ è®€è¨˜æ†¶é«” gameState.player.organsï¼ˆéŠæˆ²å‰›çµæŸï¼Œè³‡æ–™ä»å®Œæ•´ï¼‰
                          _grantPoisonSacï¼ˆé›œé£Ÿæ€§ Lv1 æ™‚è‡ªå‹•æŽˆäºˆæ¯’å›Šå™¨å®˜ï¼‰
systems/creatures.js      _PACK_NAMES / _usedPackNames / resetPackNames()ï¼ˆè‰é£Ÿå·¨äººéšŠä¼åç¨±æ± ï¼Œv0.0.66.2ï¼›v0.0.68.0 æ”¹ä»¿è£½è©žï¼‰
                          _HYENA_PACK_NAMES / _usedHyenaPackNames / _hyenaPackNameMapï¼ˆé¬£ç‹—ä¸‰åœ‹æ­¦å°‡åç¨±æ± ï¼Œv0.0.68.0ï¼‰
                          drawCreatureShapeï¼ˆç‰©ç¨®å½¢ç‹€ä¸»åˆ†æ´¾ï¼Œå«æ—‹è½‰/ç¿»è½‰é‚è¼¯ï¼‰
                          _tryMeleeAttack / _drawAttackTelegraphï¼ˆè¿‘æˆ°å‰æ–/å‘½ä¸­/å¾Œæ–å…±ç”¨æµç¨‹èˆ‡ Canvas æç¤ºåœˆï¼Œv0.1.26.0ï¼‰
                          _applyCreatureSeparationï¼ˆé€šç”¨ç”Ÿç‰©åˆ†é›¢ï¼šè‚‰é£Ÿé˜²é‡ç–Šã€è‰é£Ÿå¯è¿‘è·é›¢æŠ±åœ˜ã€å·¨äººé«˜æ¬Šé‡æŽ¨é–‹ï¼Œv0.1.26.0ï¼‰
                          updateNeutralCreaturesï¼ˆä¸‰æ…‹ç§»å‹•ï¼šbiome ç”Ÿç‰©ä¸‰æ…‹ / éž biome èˆŠé‚è¼¯ï¼›å«Alphaç¹¼æ‰¿æŽƒæCã€å·¨äººæŽ¨é–‹åŠ›Gï¼›è¿‘æˆ°æ”¹èµ° _tryMeleeAttackï¼‰
                          drawNeutralCreatures
                          updateHostileCreaturesï¼ˆä¸‰æ…‹ç§»å‹• + hostileEatMeat é–€æŽ§ï¼›è¿‘æˆ°æ”¹èµ° _tryMeleeAttackï¼Œé¬£ç‹— pack å¸¸æ•¸è®€ CREATURE_AI_CONFIGï¼‰
                          drawCorpses, drawHostileCreatures
                          _effSpeedï¼ˆå˜´å™¨æ¸›é€Ÿæœ‰æ•ˆé€Ÿåº¦è¨ˆç®—ï¼Œv0.56.0ï¼‰
systems/elite.js          spawnEliteCreature, updateEliteCreature, drawEliteCreature, drawEliteArrow
                          ä¸‰çŠ¬ç²¾è‹±è¿‘æˆ°å‰æ–/å‘½ä¸­/å¾Œæ–æç¤ºèˆ‡é«”åž‹å‘½ä¸­ç¯„åœï¼ˆv0.1.26.0ï¼‰
                          _getHunterEliteType, _spawnHunterElite, _handleHunterEliteKillï¼ˆéœéŸ³çµéšŠç²¾è‹±æ€ªï¼Œv0.1.0.0ï¼‰
                          _fireEliteFalconProjectile, _fireVenomFalconShot, _updateEliteVenomPuddle
                          _updateHunterEliteChase, _drawHunterElite
                          _HUNTER_ELITE_META, _HUNTER_ELITE_STARï¼ˆé¡¯ç¤ºå¸¸æ•¸ï¼›_HUNTER_ELITE_REWARDS å·²æ¬è‡³ config/creatures.jsï¼Œelite.js æ”¹ import ä½¿ç”¨ï¼‰
systems/boss.js           spawnBoss, updateBoss, showVictory
                          handleBossKillï¼ˆçµ±ä¸€ Boss æ­»äº¡è·¯ç”±ï¼Œæ”¯æ´é»‘è‰²çµäººå¤šç®¡è¡€æ¢ï¼Œv0.1.0.0ï¼‰
                          _spawnHunterBoss, _updateHunterBossï¼ˆé»‘è‰²çµäºº Boss ç³»çµ±ï¼Œv0.1.0.0ï¼‰
                          _triggerHunterPhaseCheck, _showHunterDialogueï¼ˆå½¢æ…‹åˆ‡æ›/å°è©žï¼Œv0.1.0.0ï¼‰
                          _fireHunterSniper, _fireHunterShotgunï¼ˆç‹™æ“Š/æ•£å½ˆæ”»æ“Šï¼Œv0.1.0.0ï¼‰
                          HUNTER_DIALOGUEï¼ˆå°è©žå¸¸æ•¸ï¼Œv0.1.0.0ï¼‰
                          _recordClearStats, _recordBossKillï¼ˆé€šé—œçµ±è¨ˆï¼Œv0.0.69.0ï¼‰
                          drawBoss, drawBossArrow
                          drawBossShape, _drawBear, _drawShark, _drawScorp, _drawHunter, BOSS_COLORS
                          _drawBossDebuffIconsï¼ˆè¡€æ¢ Debuff åœ–ç¤ºï¼Œv0.56.0ï¼‰
systems/daynight.js       getDayNightPhaseIndex, applyNightTransition, applyDayTransition
                          updateDayNightCycle
systems/leaderboard.js    _lbDifficulty, _top10Difficulty, _diffKey
                          showLeaderboard, showScoreSubmitPopup
                          showFunLeaderboardï¼ˆè¶£å‘³æŽ’è¡Œæ¦œï¼Œv0.47.0ï¼›ðŸ‘‘ æœ€é«˜ç­‰ç´šåˆ†é¡ž v0.51.0ï¼‰
systems/chat.js           _sha256, loadChatSettings, saveChatSettings
                          _calcProgressScore, _collectLocalData, _applyRemoteData
                          chatLoginï¼ˆæŸ¥å¸³/è‡ªå‹•è¨»å†Š/SHA-256/é€²åº¦æ¯”è¼ƒåŒæ­¥ï¼‰
                          chatSaveProgress, chatSyncData, chatLogout
                          initChat, disconnectChat, sendChatMessage
                          buildChatUI, _renderChatSettingsPanel, renderChat
                          showChat, hideChat
                          _saveChatPosition, _loadChatPosition, _makeDraggable
                          _handlePinCommand, _handleUnpinCommandï¼ˆGM ç½®é ‚/å–æ¶ˆç½®é ‚ï¼‰
                          _lvColorï¼ˆç­‰ç´šæ•¸å­— â†’ é¡è‰² CSS å­—ä¸²ï¼Œv0.0.66.0ï¼‰
                          _COLOR_MAPï¼ˆé¡è‰²ä»£ç¢¼â†’CSS è‰²ç¢¼å°ç…§ï¼Œv0.0.68.0ï¼‰
                          _parseColorTagsï¼ˆ[c=color]æ–‡å­—[/c] å½©è‰²å­—è§£æžï¼›v0.0.66.0ï¼›v0.0.68.0 åŠ å…¥ crimï¼‰
                          isVipPlayerï¼ˆå…ˆé©…è€…åˆ¤æ–· TODO ç´¢å¼•ï¼Œv0.0.66.0ï¼Œç›®å‰å›žå‚³ falseï¼‰
systems/mobile.js         detectMobile, getOrientation, applyDeviceMode
                          _attachJoystickListeners, _renderMobileOverlay, _getAttackBtnPos
                          _dashZoneï¼ˆé–ƒç¾æŒ‰éˆ•çŸ©å½¢ç¯„åœåˆ¤æ–·ï¼Œv0.53.0ï¼‰
                          _letterboxScaleï¼ˆç•¶å‰ç¸®æ”¾æ¯”ä¾‹ exportï¼Œv0.1.14.0ï¼‰
systems/hud.js            drawGame, updateUI, resetUICache, resetPerceptionCache, drawTopBarUI
                          drawMinimapï¼ˆå«æ‰€æœ‰ _minimap è®Šæ•¸ + _minimapAlpha/FadeTimer/StopTimer é€æ˜Žåº¦è¨ˆæ™‚å™¨ï¼Œv0.0.66.1ï¼‰
                          drawProjectilesï¼ˆå­å½ˆç¹ªè£½ï¼‰, updateMinimapFogï¼ˆå°åœ°åœ–éœ§æ•ˆæ›´æ–°ï¼‰
                          _drawArcherfishï¼ˆå¤œæ™šä¸‰è§’å…‰åœˆ + FæŠ€ç´…è‰²ä¸‰è§’æ¡†ï¼Œv0.57.4ï¼‰
systems/ui.js             showTooltip, hideTooltip, showMapSelect
                          buildEndGameOverlayï¼ˆæ­»äº¡/å‹åˆ©çµç®—ç•«é¢å…±ç”¨å¤–æ®¼ï¼Œä¿ç•™å„å‘¼å«é»žåŽŸæ¨£å¼èˆ‡äºŒæ®µå›žé¦–é è­¦å‘Šï¼‰
                          showSplashScreenï¼ˆé–‹ç™¼è€… Splash ç•«é¢ï¼Œv0.1.0.1ï¼‰
                          loadSettings, switchLanguage, saveSettings, showSettings, hideSettings
                          updateTimer, toggleDevMode, dev* å‡½å¼
                          showGuide, hideGuide, showStartScreen
                          showGuideStory, _getGuideStoryPages
                          showPatchNotes, checkPatchNotesPopup
                          buildEvoLevelDescï¼ˆå…¨åŸŸï¼Œå‹•æ…‹ç”Ÿæˆé€²åŒ–åœ–é‘‘æè¿°ï¼‰
                          showCompendium â†’ _renderGuide / _renderOrgans / _renderEvoï¼ˆä¸‰åˆ†é å‡ç‚ºæ¡Œæ©Ÿé›™æ¬„/æ‰‹æ©Ÿ Tab ç‰ˆé¢ï¼Œè®€ COMPENDIUM_DATA / ORGANS / EVOLUTION_PATHS / SKILLSï¼‰

systems/achievements.js   unlockAchievement(id), isUnlocked(id), getUnlockedAchievements()
                          getActiveTitle(), setActiveTitle(title), showAchievements(opts)
systems/achievementTriggers.js  initAchievementTriggers()ï¼ˆPhase Dï¼šç›£è½ CustomEvent è§£éŽ–æˆå°±ï¼‰

main.js                   isGamePaused, updateGameLogic, gameLoop, initializeGame
                          startGameWithLoading, startGame CustomEvent listener
                          pausePlayTimer / resumePlayTimer ç”± systems/gameFlow.js re-export
                          updateGameLogic, gameLoop, startGameWithLoading, initializeGame, window.onload
```

## Deployment Build Assets (v0.1.16.3)

- `npm run build`: runs Vite, then `scripts/copy-sounds.js` copies `sounds/` to `dist/sounds/`. Vercel uses this through `vercel.json`.
- `npm run build:itch`: runs `npm run build`, then `scripts/pack-itch.js` packages `dist/` into `silent-koel-itch.zip`.
- Audio paths stay shared in `config/gameConfig.js` as `sounds/...`; do not split paths for Vercel and itch.io.

## systems/utils.js

æ‰€æœ‰æ¨¡çµ„å…±ç”¨çš„å·¥å…·å‡½å¼ï¼Œåœ¨ `gameState.js` ä¹‹å¾Œã€`audio.js` ä¹‹å‰è¼‰å…¥ã€‚

### å‡½å¼åˆ—è¡¨

- `drawArrow(playerScreenX, playerScreenY, targetWorldX, targetWorldY, color, playerRadius)`
  â†’ åœ¨çŽ©å®¶èº«ä¸Šç¹ªè£½æŒ‡å‘ç›®æ¨™çš„ç®­é ­
  â†’ è·é›¢ï¼š`playerRadius + 20px`
  â†’ æœ‰é–ƒçˆæ•ˆæžœï¼ˆæ¯ 0.5 ç§’é€æ˜Žåº¦ 0.6â†”1.0ï¼‰
  â†’ ç²¾è‹±æ€ªå’Œ Boss åŒæ™‚åœ¨èž¢å¹•å¤–æ™‚åªé¡¯ç¤º Boss ç®­é ­ï¼ˆå„ªå…ˆæ¬Šé‚è¼¯åœ¨ `drawEliteArrow` å…§åˆ¤æ–·ï¼‰
  â†’ è¢« `elite.js` å’Œ `boss.js` å…±ç”¨

- `drawHealthBar(screenX, screenY, hp, maxHp, width, fillColor, bgColor, height)`
  â†’ ç¹ªè£½ç”Ÿç‰©è¡€æ¢ï¼Œ`bgColor` ç‚ºåº•è‰²ï¼Œç•¶å‰è¡€é‡ç”¨ `fillColor` é¡¯ç¤º

- `drawNameTag(screenX, screenY, name, color, font)`
  â†’ ç¹ªè£½ç”Ÿç‰©åå­—æ¨™ç±¤ï¼Œ`screenY` ç‚ºæ–‡å­—åŸºç·šä½ç½®

- `drawGlowEffect(screenX, screenY, radius, fillColor, glowColor, glowBlur)`
  â†’ ç¹ªè£½å¸¶å…‰æšˆçš„å¡«è‰²åœ“å½¢ï¼Œç²¾è‹±æ€ªå’Œ Boss å°ˆç”¨

- `spawnLootCircle(cx, cy, items)`
  â†’ ä»¥åœ“å½¢å¹³å‡è§’åº¦æ•£è½æŽ‰è½ç‰©ï¼ˆè©³è¦‹ä¸‹æ–¹å€å¡Šï¼‰

---

## Boss å‹•ç•«ç³»çµ±ï¼ˆv0.49.0ï¼‰

### æž¶æ§‹

| Boss | biome | å½¢ç‹€å‡½å¼ |
|------|-------|---------|
| é»‘ç†Š | forest | `_drawBear(ctx, r, t, boss)` |
| å¤§ç™½é¯Š | ocean | `_drawShark(ctx, r, t, boss)` |
| è çŽ‹ | desert | `_drawScorp(ctx, r, t, boss)` |

- ä¸»åˆ†æ´¾ï¼š`drawBossShape(ctx, boss, screenX, screenY)` ç”± `drawBoss()` å‘¼å«
- é¡è‰²å¸¸æ•¸ï¼š`BOSS_COLORS`ï¼ˆ`boss.js` é ‚éƒ¨ï¼Œ`bear.limbs = '#7a3d0c'` æ¯” body æ˜Žé¡¯æ·¡ï¼Œé¿å…åŒè‰²æ¶ˆå¤±ï¼‰
- å®Œæ•´æŠ€è¡“ç´°ç¯€ï¼š`docs/ANIMATION_GUIDE.md`

### é»‘ç†Šï¼ˆforestï¼‰â€” ä¸‰æ…‹è‡‚éƒ¨ç³»çµ±

- `boss.lastAttackLeg`ï¼ˆ`'left'`/`'right'`ï¼‰ï¼šæ”»æ“Šçž¬é–“è¨˜éŒ„ã€Œå“ªè…³åœ¨å‰ã€â†’ æ±ºå®šæ®å“ªæ‰‹
- `boss.lastAttackCrit`ï¼ˆ`boolean`ï¼‰ï¼šæ˜¯å¦æš´æ“Šï¼ˆ25% æ©ŸçŽ‡ï¼Œ`updateBoss()` æ”»æ“Šæ™‚è¨­å®šï¼‰
- ä¸‰æ…‹ï¼š**idle**ï¼ˆé›™è‡‚åž‚ä¸‹ï¼‰â†’ **chasing**ï¼ˆé«˜èˆ‰è“„åŠ›ï¼‰â†’ **attack**ï¼ˆæ®ä¸‹ï¼Œbell-curve `Math.sin(sinceAtk / 450 * Math.PI)`ï¼‰
- æ®˜å½±ï¼šç›¸åŒè‡‚åœ¨ `atkPhase - 0.22` / `atkPhase - 0.10` å…©å±¤ï¼Œalpha 10% / 22%
- çˆªç—•ï¼šæ™®æ”» 3 æ¢ç´…ç·šï¼ˆ`#dd2200`ï¼‰ï¼Œæš´æ“Š 6 æ¢æ©™ç·šï¼ˆ`#ff8800`ï¼‰ï¼Œç•«åœ¨ body è¡¨é¢ï¼ˆä¸ä¾è³´è‡‚ä½ç½®ï¼‰

### å¤§ç™½é¯Šï¼ˆoceanï¼‰â€” é¢å‘ç¿»è½‰

- `ctx.scale(-1, 1)` æ¢ä»¶ï¼š`player.x < boss.x`ï¼ˆçŽ©å®¶åœ¨å·¦å‰‡é¯Šé­šæœå·¦ï¼‰
- ç„¡éœ€ `_moveAngle`ï¼›æ‰€æœ‰å­éƒ¨ä»¶è·Ÿè‘—ç¿»è½‰

### è çŽ‹ï¼ˆdesertï¼‰â€” ä¸‰è¶³æ­¥æ…‹

- 6 æ¢è…¿åˆ†å…©çµ„ï¼ˆGroup Aï¼šå·¦å¾Œ/å³ä¸­/å·¦å‰ï¼›Group Bï¼šå³å¾Œ/å·¦ä¸­/å³å‰ï¼‰ï¼Œå…©çµ„ç›¸å·®åŠé€±æœŸï¼ˆÏ€ï¼‰
- çµ„å…§ç¬¬ 2/3 è…¿å„å»¶é² `step = Math.PI * 0.2`ï¼ˆ10% é€±æœŸåç§»ï¼‰
- ç«¯é»ž y åç§»å‹•ç•«ï¼š`swing = Math.sin(t / legPeriod + legPhase[i])`
  - `swing > 0`ï¼ˆè…³é›¢åœ°ï¼‰ï¼šç·šæ¢è¼ƒç´°ï¼ˆ`r Ã— 0.09`ï¼‰
  - `swing â‰¤ 0`ï¼ˆè…³è½åœ°ï¼‰ï¼šç·šæ¢è¼ƒç²—ï¼ˆ`r Ã— 0.14`ï¼‰
- é‰—å­å¤¾æ“Šï¼š`atkPhase = Math.sin(sinceAtk / 700 * Math.PI)`ï¼Œæœ€å¤§ Â±0.65 radï¼ˆâ‰ˆ 37Â°ï¼‰ï¼Œå…©é‰—åŒæ™‚å‘å…§å¤¾

### spawnBoss() æ–°å¢žæ¬„ä½

| æ¬„ä½ | åˆå€¼ | èªªæ˜Ž |
|------|------|------|
| `lastAttackCrit` | `false` | é»‘ç†Šæš´æ“Šæ——æ¨™ |
| `lastAttackLeg` | `'left'` | é»‘ç†Šæœ€å¾Œæ”»æ“Šè…³ï¼ˆæ±ºå®šæ®å“ªæ‰‹ï¼‰ |
| `_chargeArrow` | `null` | å¤§ç™½é¯Šè¡åˆºç®­é ­ `{ fromX, fromY, toX, toY }`ï¼ˆwarning çž¬é–“éŽ–å®šï¼Œcooldown æ¸…é™¤ï¼‰ |

### Boss æŠ€èƒ½è¦–è¦ºç‰¹æ•ˆï¼ˆv0.50.0 / v0.52.0 é‡è¨­è¨ˆï¼‰

**å¤§ç™½é¯Šè¡åˆºç®­é ­**ï¼ˆ`_drawSharkChargeArrow(boss)`ï¼‰
- `boss._chargeArrow = { angle, dist, fromX, fromY }`ï¼šwarning çž¬é–“éŽ–å®šæ–¹å‘å’Œè·é›¢
- `dist = boss.speed Ã— 4 Ã— 0.8 Ã— 60`ï¼ˆå¯¦éš›è¡åˆºè·é›¢ï¼Œä¸–ç•Œ pxï¼‰
- warning=é»ƒè‰²é–ƒçˆï¼Œcharging=ç´…è‰²ï¼›å¯¬åº¦ï¼`boss.radius Ã— 2`
- åœ¨ `drawBoss()` çš„ `drawBossShape` **å‰**å‘¼å«

**è çŽ‹æ¯’éœ§ï¼ˆv0.52.0 é‡è¨­è¨ˆï¼šå®šé»žæŠ•æ“²ï¼‰**ï¼ˆ`_drawVenomEffects(boss)`ï¼‰
- æ¯ 5 ç§’è§¸ç™¼ï¼Œç„¡è·é›¢é™åˆ¶
- `boss._venomWarning = { x, y, startTime, duration:600 }`ï¼šè­¦å‘Šå…‰åœˆï¼ˆé»ƒè‰²è™›ç·šé–ƒçˆåœ“ï¼‰
- `gameState.venomPuddles[]`ï¼šå®šé»žæ¯’éœ§é™£åˆ—ï¼Œæ¯å€‹ `{ x, y, radius:150, startTime, duration:4000, dmgPerSec, lastTick }`
- çŽ©å®¶è·‘å‡º `radius` åœæ­¢å—å‚·ï¼›`initializeGame()` åˆå§‹åŒ–ç‚º `[]`
- åœ¨ `drawBossShape` **å¾Œ**å‘¼å«

**è çŽ‹æ²™æš´**ï¼ˆ`_drawSandStormOverlay()`ï¼‰
- `boss._sandStormVisual { startTime, duration:6000 }`
- çŽ©å®¶ `getBiome(p.x, p.y) !== 'desert'` æ™‚ï¼š`_inSandstorm = false` + ä¸é¡¯ç¤ºé®ç½©
- `_drawSandStormOverlay()` åœ¨ `hud.js` `drawBossArrow()` å¾Œã€UI å‰å‘¼å«

**é»‘ç†Šæš´æ“Šæ–‡å­—**
- `isCrit === true` å‘½ä¸­æ™‚ï¼š`showFloatingText(p.x, p.y - 40, 'Xç†Šçˆªï¼', '#ff8800', 18)`ï¼ˆé¡¯ç¤ºåœ¨çŽ©å®¶ä½ç½®ï¼‰

---

## ç”Ÿç‰©è¦–è¦ºç³»çµ±ï¼ˆv0.48.0ï¼‰

### æ—‹è½‰æ¨¡å¼

| speciesId | æ—‹è½‰æ¨¡å¼ |
|---|---|
| moose  | å®Œæ•´æ—‹è½‰ï¼ˆè·Ÿ `_moveAngle`ï¼‰ |
| beetle | å®Œæ•´æ—‹è½‰ï¼ˆè·Ÿ `_moveAngle`ï¼‰ |
| croc   | å®Œæ•´æ—‹è½‰ï¼ˆè·Ÿ `_moveAngle`ï¼‰ |
| camel  | åªå·¦å³ç¿»è½‰ï¼ˆ`ctx.scale(-1,1)`ï¼Œcos æ­£æœå³ï¼Œcos è² æœå·¦ï¼‰ |
| lynx   | åªå·¦å³ç¿»è½‰ï¼ˆåŒé§±é§ï¼‰ |
| hyena  | å®Œå…¨ä¸æ—‹è½‰ï¼Œæ°¸é æœä¸Š |

- ä¸»åˆ†æ´¾å‡½å¼ `drawCreatureShape(ctx, creature, sx, sy)`ï¼šä»¥ `ctx.translate(sx,sy)` å®šä½ï¼Œå„ç‰©ç¨®ä¾æ—‹è½‰æ¨¡å¼å¥—ç”¨ `ctx.rotate(angle)` æˆ– `ctx.scale(-1,1)`ï¼Œå†å‘¼å«å°æ‡‰ç§æœ‰å½¢ç‹€å‡½å¼
- æ‰€æœ‰å½¢ç‹€ä»¥ `(0,0)` ç‚ºä¸­å¿ƒï¼Œ`angle=0` æ™‚é ­æœå³ï¼ˆ+xï¼‰ï¼Œå°¾æœå·¦ï¼ˆ-xï¼‰

### é¡è‰²å¸¸æ•¸ `CREATURE_COLORS`

| ç‰©ç¨® | é¡è‰²ç¢¼ | èªªæ˜Ž |
|------|--------|------|
| moose | `#8B4513` | æ·±æ£• |
| beetle | `#1ABC9C` | é’ç¶  |
| camel | `#E8C87A` | æ·ºæ²™ç™½ |
| lynx | `#A0826D` | ç°è¤ |
| croc | `#6B8E23` | æ©„æ¬–ç¶  |
| hyena | `#8B6914` | æ·±å’–å•¡ |
| giantized | `#FF8C00` | å·¨äººåŒ–å…‰æšˆæ©™ |
| alpha | `#FFD700` | Alpha å…‰æšˆé‡‘ |
| killerBase | `#CC2200` | æ®ºæ‰‹åŒ–å…‰æšˆæ·±ç´… |

### ç‰¹æ®Šç‹€æ…‹å…‰æšˆ `_drawCreatureGlow`

- åœ¨ `ctx.restore()` ä¹‹å¾Œä»¥ä¸–ç•Œåº§æ¨™ `(sx, sy)` ç¹ªè£½ï¼Œä¸è·Ÿæ—‹è½‰
- Alpha â†’ é‡‘è‰²å…‰åœˆï¼ˆradius+6ï¼‰
- å·¨äººåŒ– â†’ æ©™è‰²å…‰åœˆï¼ˆradius+4ï¼‰
- æ®ºæ‰‹åŒ– â†’ `killerLevel` è¶Šé«˜è¶Šæ·±ç´…ï¼ˆradius+2ï¼‰

### ç¹ªåœ–è¦æ ¼æ–‡ä»¶

- è©³è¦‹ `docs/creature_shapes.md`ï¼ˆå®Œæ•´ç¨‹å¼ç¢¼ + è¨­è¨ˆå‚™æ³¨ï¼‰
- è©³è¦‹ `docs/ANIMATION_GUIDE.md`ï¼ˆBoss / ç”Ÿç‰©å‹•ç•«å¯¦ä½œæŒ‡å—ï¼šè¸æ­¥ã€æ”»æ“Šã€ç‰¹æ•ˆã€Z è»¸é †åºã€æœªä¾†é–‹ç™¼è€…èªªæ˜Žï¼‰

---

## ç”Ÿæ…‹ç”Ÿç‰©ç³»çµ±ï¼ˆv0.36.0ï¼‰

### ç”Ÿç‰©å‘½å
| ç”Ÿæ…‹å€ | è‰ç³»             | è‚‰ç³»           |
|--------|-----------------|----------------|
| æ£®æž—   | é§é¹¿ (moose)    | çŒžçŒ (lynx)    |
| æ°´æ½­   | å·¨åž‹ç”²è™« (beetle)| é±·é­š (croc)    |
| æ²™æ¼    | é§±é§ (camel)    | é¬£ç‹— (hyena)   |

### ç”Ÿæˆè¦å‰‡
- è‰ç³»å’Œè‚‰ç³»åªåœ¨å°æ‡‰ç”Ÿæ…‹å€ç”Ÿæˆï¼ˆ`_randomPointInBiome` æ‹’çµ•æŽ¡æ¨£ï¼‰
- æ¯å€‹ç‰©ç¨®ç¨ç«‹è¨ˆç®—ï¼šä¸Šé™ï¼ˆè‰ç³» 20 / è‚‰ç³» 15ï¼‰ã€è¨ˆæ™‚å™¨ã€å°‘æ–¼ 3 éš»é–“éš” Ã—0.3ï¼ˆåŠ é€Ÿ 70%ï¼‰
- æ¯éš»ç”Ÿç‰©å¸¶ `biome` å’Œ `speciesId` å±¬æ€§

### ç”Ÿç‰©åŸºç¤Žå±¬æ€§
- **è‰ç³»**ï¼šradius 8ã€HP 30ã€speed 2.4ã€canFight 50%ï¼ˆtrue æ™‚ damage=3ï¼Œfalse æ™‚ damage=0ï¼‰ã€diet herbivore
- **è‚‰ç³»**ï¼šradius 10ã€HP 50ã€speed 3.6ã€damage 5ã€diet carnivore

### ä¸‰æ…‹ç§»å‹•ï¼ˆbiome ç”Ÿç‰©å°ˆå±¬ï¼‰
- **wandering**ï¼šæ¯å¹€è§’åº¦å°å¹…åç§»ï¼ˆÂ±0.12 radï¼Œæ¨¡æ“¬ Perlin Noise å¹³æ»‘ï¼‰
- **resting**ï¼šé€Ÿåº¦ 0~30%ï¼ŒæŒçºŒ 1.5sï¼›çŽ©å®¶ï¼ˆéžè¶…å‹å–„ï¼‰æˆ–æ•µæ„ç”Ÿç‰©é è¿‘ 150px å…§ä¸­æ–·
- **attacking / fleeing**ï¼šçŽ©å®¶äº’å‹•è§¸ç™¼ï¼ˆèˆ‡èˆŠé‚è¼¯ç›¸åŒï¼‰
- è‰ç³»æ¯ 5~15s æœ‰ 20% æ©ŸçŽ‡åˆ‡æ›ç‚º restingï¼Œ60% æ©ŸçŽ‡æŽ¢ç´¢æœ€è¿‘æžœå­ï¼ˆ800px å…§ï¼‰ï¼Œ20% ç¹¼çºŒæ¼«éŠï¼ˆv0.42.0 èª¿æ•´ï¼‰
- è‚‰ç³»æ¯ 5~15s æœ‰ 30% æ©ŸçŽ‡åˆ‡æ›ç‚º restingï¼Œ30% æ©ŸçŽ‡æŽ¢ç´¢æœ€è¿‘è‰ç³»ç”Ÿç‰©ï¼ˆ500px å…§ï¼‰

### ç°¡å–®åœ°åœ–é™åˆ¶
- `hostileEatMeat: false`ï¼ˆEASY_MAP ç„¡æ­¤ featureï¼‰â†’ è‚‰ç³»ä¸æœƒåƒå±é«”æˆé•·

---

## æ™®é€šåœ°åœ–ï¼ˆNORMAL_MAPï¼‰ï¼ˆv0.36.0 / aggroRange èª¿æ•´ v0.39.0ï¼‰
- åœ°å½¢ï¼šä¸­å¿ƒæ£®æž—ä¿è­·å€åŠå¾‘ 400pxï¼ˆç°¡å–®ç‚º 600pxï¼‰
- ç”Ÿç‰©å¼·åº¦å€çŽ‡å…¨éƒ¨ Ã—1.5
- `aggroRangeOverride: 400`ï¼ˆå…¨å±€è¿½æ“Šç¯„åœï¼Œv0.39.0 ç”± 2000 èª¿æ•´è‡³ 400ï¼‰
- `removeHostileCap: true`ï¼ˆç§»é™¤é€Ÿåº¦/å‚·å®³ä¸Šé™ï¼‰
- ç²¾è‹±æ€ªï¼šç¬¬1å¤œ Ã—5/+0.3/Ã—1.5ã€ç¬¬2å¤œ Ã—10/+0.7/Ã—2.1ã€ç¬¬3å¤œ Ã—20/+1.5/Ã—2.9
- Bossï¼šé»‘ç†Š HP1500/é€Ÿ9.0/å‚·30/r33ã€å¤§ç™½é¯Š HP1800/é€Ÿ11.7/å‚·36/r40ã€è çŽ‹ HP1650/é€Ÿ10.8/å‚·40/r37ï¼ˆv0.47.0 é€Ÿåº¦ç¿»å€ï¼‰
- å°ˆå±¬ featuresï¼š`giantization`ã€`killer`ã€`eliteRegen`ã€`bossRegen`ã€`hostileEatMeat`

---

## åœ“å½¢æ•£è½å…¨å±€å‡½å¼ spawnLootCircleï¼ˆv0.35.0ï¼‰

- **ä½ç½®**ï¼š`systems/utils.js`
- æ‰€æœ‰æŽ‰è½ç‰©çµ±ä¸€å¯ç¶“éŽæ­¤å‡½å¼æ•£è½ï¼Œåœ“å½¢å¹³å‡è§’åº¦ï¼Œè·ä¸­é»ž 10~25px éš¨æ©Ÿ
- å–®å€‹ç‰©å“æ™‚éš¨æ©Ÿè§’åº¦ï¼›å¤šå€‹ç‰©å“æ™‚ç­‰è§’å‡åˆ†
- **æ”¯æ´ type**ï¼š
  - `'corpse'`ï¼š`data = { multiplier }`ï¼Œradius æŒ‰ multiplier ç¸®æ”¾ï¼ˆ1å€=8pxï¼Œ>1å€=8Ã—1.5pxï¼‰
  - `'bone'`ï¼šç›´æŽ¥å‘¼å« `_spawnBone(x, y, 8)`
  - `'mutation'`ï¼šå¾… Phase 5 æ“´å……

---

## æ¯’å‚·æ¸›å…ç³»çµ±ï¼ˆv0.35.0ï¼‰

- **ç²¾è‹±æ€ª**ï¼š20% æ¸›å…
- **Boss é€šç”¨**ï¼š30% æ¸›å…
- **æ²™æ¼ è çŽ‹**ï¼š50% æ¸›å…ï¼ˆé€šç”¨ 30% + å°ˆå±¬ 20%ï¼‰
- æ¸›å…åœ¨ `updateStatusEffects()` çš„æ¯’å‚· tick æ‰£è¡€æ™‚è¨ˆç®—
- æµ®å‹•æ•¸å­—é¡¯ç¤ºæ¸›å…å¾Œå¯¦éš›æ‰£è¡€å€¼

---

## è‚‰ç³»åƒå±é«”ç³»çµ±ï¼ˆv0.38.0ï¼Œåƒ…æ™®é€šåœ°åœ–ï¼‰

### æ©Ÿåˆ¶
- è‚‰ç³»ç”Ÿç‰©ï¼ˆdiet='carnivore'ï¼‰åœ¨æ¼«éŠ/ä¼‘æ¯/å·¡é‚ç‹€æ…‹æ™‚ï¼Œåµæ¸¬ 60px å…§å±é«”é€²å…¥ `state: 'eating'`
- æ¯ 0.5 ç§’ä¸€ tickï¼ˆ`eatTickTimer` ç´¯è¨ˆ FIXED_DELTAï¼‰ï¼Œ6 ticksï¼ˆ3ç§’ï¼‰å®Œæˆä¸€å…·å±é«”
- åƒå±é«”æœŸé–“ aggroRangeÃ—1.5ï¼ˆ`eatBaseAggroRange` è¨˜éŒ„é€²å…¥æ™‚çš„å€¼ï¼‰ï¼›æœ‰çŽ©å®¶æˆ–ä¸­ç«‹ç”Ÿç‰©é€²å…¥è‡¨æ™‚ aggroRange â†’ ç«‹åˆ»ä¸­æ–·ï¼ˆé€²åº¦é‡ç½®ï¼‰ï¼Œå›žåˆ° `patrolling`
- åƒå®Œä¸€å…·ï¼š`_carnivoreEatCorpse(creature, corpse)`ï¼Œç§»é™¤å±é«”ï¼Œå›žå¾© 5% maxHP

### æˆé•·ï¼ˆä¸ç´¯ä¹˜ï¼ŒåŸºç¤Žå€¼è¨ˆç®—ï¼‰
- æ¯åƒ1å…·ï¼šHP/é€Ÿåº¦/æ”»æ“ŠåŠ›/é«”ç©å„ +10% åŸºç¤Žå€¼ï¼ˆ`corpseEaten` è¨ˆæ•¸ï¼‰
- `baseRadius` åœ¨ `_makeCarnCreature` ç”Ÿæˆæ™‚è¨˜éŒ„ï¼ˆèˆ‡ `baseHp`ã€`baseSpeed`ã€`baseDamage` ä¸€èµ·ï¼‰

---

## æ®ºæ‰‹åŒ–ç³»çµ±ï¼ˆv0.38.0ï¼Œåƒ…æ™®é€šåœ°åœ–ï¼‰

### è§¸ç™¼
- `corpseEaten >= 5` ä¸” `features.killer === true` æ™‚è§¸ç™¼ `_triggerKiller(creature)`
- `isKiller = true`ï¼Œ`killerCorpseEaten = 0`ï¼ˆæ®ºæ‰‹åŒ–å¾Œç¨ç«‹è¨ˆæ•¸ï¼‰

### æ®ºæ‰‹åŒ–æ•¸å€¼ï¼ˆåŸºç¤Žå€¼è¨ˆç®—ï¼Œä¸ç´¯ä¹˜ï¼‰
- aggroRange ç¿»å€
- æ”»æ“ŠåŠ›ï¼š`baseDamage * (1 + 0.5 + 0.1 * corpseEaten)`ï¼ˆ+50% + ä¹‹å‰10%ç´¯è¨ˆï¼‰
- é€Ÿåº¦ï¼š`baseSpeed * (1 + 0.3 + 0.1 * corpseEaten)`ï¼ˆ+30% + ä¹‹å‰10%ç´¯è¨ˆï¼‰
- æ¯ 5 ç§’å›žå¾© 1% maxHPï¼ˆ`killerRegenTimer` è¨ˆæ™‚ï¼‰

### æ®ºæ‰‹åŒ–å¾Œç¹¼çºŒåƒå±é«”
- æ¯å¤šåƒ 1 å…·ï¼šdamage/speed/maxHp/radius å„å† +10% åŸºç¤Žå€¼ï¼ˆ`killerCorpseEaten` è¨ˆæ•¸ï¼‰
- å…©å€‹è¨ˆæ•¸ç–ŠåŠ ï¼ˆ`corpseEaten + killerCorpseEaten`ï¼‰

### killerLevel è¨ˆæ•¸å™¨ï¼ˆv0.46.0ï¼‰
- æ®ºæ‰‹åŒ–è§¸ç™¼æ™‚ï¼š`killerLevel = 0`
- æ®ºæ‰‹åŒ–å¾Œæ¯åƒä¸€å…·å±é«”ï¼š`killerLevel++`
- `_getCreatureDisplayName` é¡¯ç¤ºã€Œ[ç‰©ç¨®å] æ®ºæ‰‹Lv[N]ã€ï¼ˆN â‰¥ 1 æ™‚é¡¯ç¤ºï¼‰

### æ“Šæ®ºçŽå‹µï¼ˆ`handleKillerKill`ï¼Œ`systems/damage.js`ï¼‰ï¼ˆv0.46.0 æ›´æ–°ï¼‰
- XPï¼š`100 + killerLevel Ã— 5 + çµäººæœ¬èƒ½ Ã— 10`
- `spawnLootCircle`ï¼š2 ä»½ 1 å€å±é«”ï¼ˆåŽŸç‚º 3 ä»½ï¼‰
- 100% æŽ‰è½ 1 å€‹è®Šç•°é»žï¼›`killerCorpseEaten = N` â†’ N% æ©ŸçŽ‡é¡å¤–æŽ‰ 1~N å€‹
- æ®ºæ‰‹æœ¬èº«å±é«”æ­£å¸¸ç”Ÿæˆ

### æ­»äº¡è·¯ç”±
- `handleKill(c, isHostile)` é–‹é ­æª¢æŸ¥ `c.isKiller`ï¼Œè‹¥æ˜¯å‰‡è·¯ç”±è‡³ `handleKillerKill(c)`

---

## ç”Ÿæ…‹ç‰¹æ€§ç³»çµ±ï¼ˆv0.46.0ï¼Œåƒ…æ™®é€šåœ°åœ–ï¼‰

æ¯å€‹ç”Ÿæ…‹å€è‚‰é£Ÿæ€§ç‰©ç¨®å„æœ‰å°ˆå±¬åŠ æˆï¼Œåœ¨ç”Ÿæ…‹å€å…§å¼·åŒ–ã€é›¢é–‹ç”Ÿæ…‹å€3ç§’å¾ŒåŠ æˆæ¶ˆå¤±ï¼ˆé±·é­šç‚ºç«‹å³å¤±åŽ»ï¼‰ã€‚

### çŒžçŒï¼ˆlynxï¼‰â€” æ£®æž—ç”Ÿæ…‹å€
| ç‹€æ…‹ | æš´æ“Šæ©ŸçŽ‡ | æš´æ“Šå€çŽ‡ | çŽ©å®¶æ¸›é€Ÿ | æ¸›é€ŸæŒçºŒ | ç§»å‹•é€Ÿåº¦ |
|------|----------|----------|----------|----------|----------|
| åœ¨æ£®æž— | 50% | Ã—2 baseDmg | -30% | 3 ç§’ | Ã—1.2 |
| é›¢æ£®æž— â‰¥3s | 25% | Ã—1.5 baseDmg | -15% | 1.5 ç§’ | Ã—1.0 |

- æš´æ“Šè§¸ç™¼ï¼š`_applyLynxBiomeBonus` è¨ˆç®— `_critChance`ï¼›å‘½ä¸­çŽ©å®¶æ™‚éš¨æ©Ÿåˆ¤å®šï¼Œå‘½ä¸­å¾Œè¨­å®š `p._lynxSlowUntil`ã€`p._lynxSlowAmt`
- çŽ©å®¶è¢«æ¸›é€ŸæœŸé–“ç§»å‹•é€Ÿåº¦ä¹˜ä»¥ `(1 - lynxSlowAmt)`ï¼ˆ`updatePlayerMovement()` åˆ¤æ–·ï¼‰

### é±·é­šï¼ˆcrocï¼‰â€” æ°´æ½­ç”Ÿæ…‹å€
| ç‹€æ…‹ | æ”»æ“ŠåŠ æˆ | ç§»å‹•é€Ÿåº¦ | æ­»äº¡ç¿»æ»¾æ©ŸçŽ‡ |
|------|----------|----------|-------------|
| åœ¨æ°´æ½­ | Ã—1.2 | Ã—1.3 | 20% |
| é›¢æ°´æ½­ | Ã—1.0 | Ã—1.0 | 0% |

- æ­»äº¡ç¿»æ»¾è§¸ç™¼ï¼šå°çŽ©å®¶æ–½åŠ  1 ç§’æšˆçœ©ï¼ˆ`p._stunUntil = now + 1000`ï¼‰ï¼ŒæœŸé–“ `updatePlayerMovement()` ç›´æŽ¥ return
- `_applyCrocBiomeBonus` åŒæ™‚è¨­å®š `_biomeAtkMult`ã€`_biomeSpeedMult`ã€`_deathRollChance`

### é¬£ç‹—ï¼ˆhyenaï¼‰â€” æ²™æ¼ ç”Ÿæ…‹å€
- ç”Ÿæˆæ™‚éš¨æ©Ÿåˆ†é… `packGroup`ï¼ˆ1~2ï¼‰ï¼Œ`packMates = []`ã€`packName = null`ï¼Œä¸å‡ºç”Ÿå³è‡ªå‹•åˆ†é…éšŠå
- `_updateHyenaPack`ï¼šæ¯å¹€æŽƒæ 300px å…§åŒ biome åŒ packGroup é¬£ç‹—ï¼Œç‰©ç†ç¢°é¢å¾Œåˆä½µéšŠåï¼Œä¸Šé™ 20 éš»
- `_nearestHyenaPackMate` / `_moveHyenaTowardPack`ï¼šéšŠå“¡è¶…å‡º 800px å¾Œå…ˆä»¥æ­¸éšŠç‚ºå„ªå…ˆè¡Œå‹•ï¼Œ3 ç§’å…§æ²’å›žåˆ° 800px æ‰é›¢éšŠ
- æ”»æ“ŠåŠ æˆï¼šæ¯å¤šä¸€éš»å­˜æ´» packMate â†’ æ”»æ“Š +20%ï¼Œé€Ÿåº¦ +5%
- `_alertHyenaPack`ï¼šé¬£ç‹—éŽ–å®šç›®æ¨™çž¬é–“ï¼Œé€šçŸ¥ 800px å…§åŒ biomeã€åŒ packGroup æˆå“¡åˆ‡æ›ç‚º chasing åŒä¸€ç›®æ¨™
- `_getHyenaAttackPack` / `_syncHyenaAttackTurn` / `_hyenaWheelPosition`ï¼šæ”»æ“ŠçŽ©å®¶æ™‚åŒéšŠé¬£ç‹—æŽ¡è»Šè¼ªæˆ°ï¼ŒåŒæ™‚åªæœ‰ 1 éš»é€²å…¥ attackingï¼Œè¼ªæ›¿ CD 600msï¼›1~3 éš»ç¶­æŒè©¦æŽ¢è¼ªæµï¼Œ4 éš»ä»¥ä¸Šæœƒå˜—è©¦åŒ…åœå·¦å³/å¾Œæ–¹ä¸¦ä¿ç•™çŽ©å®¶å‰æ–¹ç¼ºå£ï¼Œä¸¦ä¾ç›®å‰ä½ç½®é‡æ–°åˆ†é… Attackerï¼Œä½Žè¡€/é€€å›žä¸­çš„é¬£ç‹—å„ªå…ˆä¸ç•¶æ”»æ“Šè€…ï¼›éžæ”»æ“Šè€…é¸æœ€è¿‘å¤–åœˆ slotï¼Œé¿å…çŽ©å®¶è½‰å‘æ™‚ç©¿éŽçŽ©å®¶ä¸­å¿ƒæ›ä½

| ç‹€æ…‹ | åŸºç¤Žæ”»æ“Š | åŸºç¤Žé€Ÿåº¦ |
|------|----------|----------|
| åœ¨æ²™æ¼  | Ã—1.0 Ã— packBonus | Ã—1.1 Ã— packBonus |
| é›¢æ²™æ¼  â‰¥3s | Ã—0.5 Ã— packBonus | Ã—0.5 Ã— packBonus |

### è‚‰é£Ÿè€…é€ƒé›¢å·¨äººï¼ˆ`_shouldFleeFromGiant`ï¼‰
- **æ®ºæ‰‹åŒ–ç”Ÿç‰©**ï¼š`_shouldFleeFromGiant` ç›´æŽ¥è¿”å›ž `false`ï¼Œæ°¸é ä¸è¿´é¿å·¨äºº
- ç›®æ¨™ç‚º **Alpha**ï¼ˆéžæ®ºæ‰‹ï¼‰ï¼šä¸€å¾‹é€ƒè·‘
- ç›®æ¨™ç‚ºæ™®é€šå·¨äººï¼ˆéžæ®ºæ‰‹ï¼‰ï¼šå·¨äºº HP > è‚‰é£Ÿè€… HP Ã— 3 â†’ é€ƒè·‘
- é€ƒè·‘ç‹€æ…‹ `fleeing_giant`ï¼šå¾€é›¢æœ€è¿‘å·¨äººåæ–¹å‘è·‘ 3 ç§’ï¼Œä¹‹å¾Œåˆ‡æ› `_seekingPrey = true`ã€`_seekNonGiant = true`ï¼ˆåªå°‹æ‰¾éžå·¨äººåŒ–è‰é£Ÿæ€§ï¼‰

### æ®ºæ‰‹æˆ°è¡“é‚è¼¯ï¼ˆv0.51.0ï¼Œ`updateHostileCreatures`ï¼‰
- æ®ºæ‰‹åŒ–ç”Ÿç‰©é­é‡å·¨äºº/Alpha æ™‚é€²å…¥ç¨ç«‹æˆ°è¡“åˆ¤æ–·
- **æ’¤é€€æ¢ä»¶**ï¼šè‡ªèº« HP < 70% ä¸” å·¨äºº HP > 70%ï¼ˆé›™å‘ä¸åˆ©ï¼‰
  - è‹¥ aggroRange å…§æœ‰è½å–®éžå·¨äººåŒ–è‰é£Ÿæ€§ â†’ è½‰ç§»æ”»æ“Šç›®æ¨™
  - å¦å‰‡é€²å…¥ `fleeing_giant` æš«æ™‚æ’¤é€€
- **æ­£å¸¸æ”»æ“Š**ï¼šä¸æ»¿è¶³æ’¤é€€æ¢ä»¶æ™‚ï¼ˆæ®ºæ‰‹ç‹€æ…‹è‰¯å¥½ï¼‰â†’ ç¹¼çºŒæ”»æ“Šå·¨äºº

### ç”Ÿæ…‹å€å›žæ­¸ï¼ˆbiome home-returnï¼‰
- æ¯å¹€åµæ¸¬ `_isInHomeBiome(creature)`ï¼›ä¸åœ¨ç”Ÿæ…‹å€æ™‚ï¼š`_leftBiomeTime` é–‹å§‹è¨ˆæ™‚
- æ¯ 2 ç§’æ›´æ–°ä¸€å€‹å›žæ­¸ç›®æ¨™é»žï¼ˆ`_findNearestBiomePoint` éš¨æ©ŸæŽ¡æ¨£ 30 é»žï¼‰
- å›žæ­¸æ™‚ä»¥ 1.3 å€é€Ÿåº¦ç§»å‹•ï¼›å›žåˆ°ç”Ÿæ…‹å€å¾Œæ¸…é™¤ `_leftBiomeTime`ã€`_returnTarget`
- `_leftBiomeTime` åŒæ™‚ä½œç‚ºçŒžçŒ/é¬£ç‹—ç”Ÿæ…‹å€åŠ æˆçš„å¤±æ•ˆè¨ˆæ™‚å™¨

---

## ç²¾è‹±/Bosså›žè¡€ï¼ˆv0.38.0ï¼Œåƒ…æ™®é€šåœ°åœ–ï¼‰

### ç²¾è‹±æ€ªå›žè¡€ï¼ˆ`features.eliteRegen`ï¼‰
- `spawnEliteCreature` è¨˜éŒ„ `elite.tierIndex`ï¼ˆ0/1/2ï¼‰
- ç¬¬1å¤œï¼šæ¯ 5 ç§’ +1% maxHPï¼›ç¬¬2å¤œï¼š+2%ï¼›ç¬¬3å¤œï¼š+3%

### Bosså›žè¡€ï¼ˆ`features.bossRegen`ï¼‰
- æ¯ 3 ç§’ +2% maxHPï¼ˆv0.47.0 å¼·åŒ–ï¼›åŽŸç‚ºæ¯ 10 ç§’ +10%ï¼‰

---

## ç²¾è‹±æ€ªæ­»äº¡æŽ‰è½ï¼ˆv0.38.0ï¼Œå…©ç¨®é›£åº¦å‡é©ç”¨ï¼‰
- `handleEliteKill` å‘¼å« `spawnLootCircle`ï¼š1 å€‹ 1 å€å±é«” + 4 å…·ç™½éª¨

---

## å·¨äººåŒ–ç³»çµ±ï¼ˆv0.37.0 / v0.1.10.0 é‡å¯«ï¼Œåƒ…æ™®é€šåœ°åœ–ï¼‰

### è§¸ç™¼
- è‰ç³»ç”Ÿç‰© `_seekingFruit` åƒæ»¿5é¡†æžœå­ä¸” `features.giantization === true`
- ç§»é™¤èˆŠç‰ˆæ¿€é€²åŒ–ï¼ˆ`diet=aggressive`ï¼‰é‚è¼¯ï¼Œæ”¹ç”±å·¨äººåŒ–å–ä»£

### å·¨äººåŒ–æ•¸å€¼ï¼ˆåœ¨åŽŸæœ¬æ•¸å€¼åŸºç¤Žä¸Šä¿®æ”¹ï¼‰
- æ”»æ“ŠåŠ› +20ï¼Œè¡€é‡ Ã—10ï¼Œé«”ç© Ã—1.5ï¼ŒaggroRange 400ï¼ˆv0.46.0 ç”± 150 èª¿æ•´ï¼‰
- guardianRange 500ï¼ˆå®ˆè­·ç¯„åœï¼‰
- æ¯ç§’å›žå¾© 1% maxHPï¼ˆ`giantRegenTimer` è¨ˆæ™‚ï¼‰
- HP â‰¤ 30% æ™‚ï¼šä¸­æ–·è¿½æ“Šï¼Œé€ƒå¾€æœ€è¿‘æžœå­æ–¹å‘ï¼›æ¯åƒ1é¡†æžœå­å›žå¾© +10% maxHPï¼ˆ`_updateGiantFlee`ï¼‰
- å·¨äººåŒ–å¾Œç‚ºã€Œç„¡éšŠä¼ç¨ç«‹å·¨äººã€ï¼Œä¸å¼·åˆ¶æˆç‚ºéšŠé•·ï¼ˆv0.1.10.0 é‡å¯«ï¼‰
- _seekingFruit è¶…æ™‚ä¿è­·ï¼šé–‹å§‹è¨ˆæ™‚ 5 ç§’å¼·åˆ¶é€€å‡ºï¼›åƒæžœå­å¾Œ hp > maxHp * 0.5 ç«‹åˆ»é€€å‡ºï¼ˆv0.1.10.0ï¼‰

### çµ„éšŠï¼ˆåŒæ—åŒç”Ÿæ…‹ï¼ŒAlpha èª•ç”Ÿå¾Œæ‰æœ‰éšŠä¼ï¼‰
- å…©éš»ç„¡éšŠä¼ç¨ç«‹å·¨äººï¼ˆåŒæ—åŒç”Ÿæ…‹ï¼‰è·é›¢ â‰¤ 300px â†’ HP è¼ƒé«˜è€…å‡æ ¼ Alphaï¼Œå¦ä¸€éš»æˆç‚º packMemberï¼ˆæ¯3ç§’æŽƒæï¼Œv0.1.10.0ï¼‰
- å‡æ ¼ Alpha å¾Œæˆç‚ºéšŠé•·ï¼Œæ¯3ç§’å˜—è©¦æ‹›å‹Ÿ 800px å…§åŒæ—è‰é£Ÿæ€§ï¼Œ20% æˆåŠŸçŽ‡
- éšŠä¼ä¸Šé™å‹•æ…‹è¨ˆç®—ï¼š`base 5 + éšŠä¼å…§å·²å·¨äººåŒ–æˆå“¡æ•¸`ï¼Œä¸Šé™ 8 éš»ï¼ˆå«éšŠé•·ï¼‰
- è¶…å‡º 800px è‡ªå‹•æŽ‰éšŠï¼ŒéšŠå“¡è·é›¢ >600px æ™‚å·¨äººåŒ–æš«åœç§»å‹•ç­‰å¾…
- ä¸åŒéšŠä¼å·¨äººè·é›¢éŽè¿‘æ™‚äº’ç›¸æŽ¨é–‹ï¼ˆè·é›¢ < radius + å°æ–¹radius + 20 â†’ æŽ¨é–‹ 2pxï¼Œv0.1.10.0ï¼‰

### è¡Œç‚º
- å„ªå…ˆæ”»æ“Šï¼šguardianRange å…§å¨è„…çµ„å“¡çš„æ•µæ„ç”Ÿç‰©ï¼ˆæœ€å„ªå…ˆï¼‰â†’ aggroRange å…§çš„æ•µæ„ç”Ÿç‰© / çŽ©å®¶ï¼ˆè‰é£Ÿæ€§Lv4+é™¤å¤–ï¼‰
- ç„¡ç›®æ¨™æ™‚ï¼šæ¯3~5ç§’é¸æœ€è¿‘æžœå­ä½œç‚ºç§»å‹•ç›®æ¨™ï¼Œå¸¶é ˜éšŠä¼å‰é€²

### æ“Šæ®ºçŽå‹µï¼ˆ`handleGiantKill`ï¼Œ`systems/damage.js`ï¼‰
- XPï¼š100ï¼ˆ+çµäººæœ¬èƒ½åŠ æˆï¼‰
- `spawnLootCircle`ï¼š1å€‹2å€å±é«” + 1å…·ç™½éª¨
- 100% æŽ‰è½1å€‹è®Šç•°é»žï¼›é¡å¤–10%æ©ŸçŽ‡æŽ‰ 1~3å€‹

---

## Alphaç³»çµ±ï¼ˆv0.37.0 / v0.1.10.0 é‡å¯«ï¼Œåƒ…æ™®é€šåœ°åœ–ï¼‰

### è§¸ç™¼
- å…©éš»ç„¡éšŠä¼ç¨ç«‹å·¨äººï¼ˆåŒæ—åŒç”Ÿæ…‹ï¼‰è·é›¢ â‰¤ 300px ç›¸é‡ â†’ HP è¼ƒé«˜è€…å‡æ ¼ Alphaï¼ˆv0.1.10.0ï¼‰
- `gameState.alphaCreature`ï¼šå…¨åœ–åªæœ‰1éš» Alpha çš„å¼•ç”¨
- å·²æœ‰ Alpha æ™‚ä¸å†è§¸ç™¼æ–°çš„
- å–®äººéšŠä¼ï¼ˆéšŠé•·ç„¡ packMembersï¼‰ä¸èƒ½å‡æ ¼ Alphaï¼ˆv0.1.10.0ï¼‰

### Alpha æ­»å¾Œç¹¼æ‰¿ï¼ˆv0.1.10.0ï¼‰
- Alpha æ­»äº¡æ™‚ï¼š`gameState._pendingAlphaInherit = true`
- ä¸‹ä¸€å¹€ `updateNeutralCreatures` æŽƒæå…¨åœ–ï¼Œæ‰¾å‡º `packMembers >= 1` çš„å·¨äººéšŠé•·ï¼ˆéšŠä¼ â‰¥ 2 éš»ï¼‰
- å¾žä¸­é¸ HP æœ€é«˜è€…å‡æ ¼ç‚ºæ–° Alphaï¼›ç„¡ç¬¦åˆæ¢ä»¶è€…ä¸ç”¢ç”Ÿæ–° Alpha

### Alphaæ•¸å€¼ï¼ˆå·¨äººåŒ–åŸºç¤Žä¸Šå†è¨ˆç®—ï¼‰
- æ”»æ“ŠåŠ› Ã—2ï¼Œè¡€é‡ Ã—3ï¼Œé«”ç© Ã—1.5ï¼ŒaggroRange 600ï¼ˆv0.46.0 ç”± 300 èª¿æ•´ï¼‰
- guardianRange 1500ï¼ˆv0.46.0ï¼‰
- è·Ÿéš¨ç¯„åœ `packFollowRange: 1000`
- HP åˆ†äº«å›žè¡€ï¼ˆv0.46.0ï¼‰ï¼šè‡ªèº« HP â‰¥ 80% æ™‚æ¯ç§’åˆ†äº« 1% maxHP çµ¦ HP æœ€ä½Žçš„å—å‚·çµ„å“¡ï¼›è‡ªèº« HP < 80% æ™‚æ¯ç§’è‡ªå›ž 2% maxHPï¼ˆä¸åˆ†äº«ï¼‰

### èª•ç”Ÿå…¬å‘Š
- `showAlphaAnnouncement(name)`ï¼šå…¨å±é¡¯ç¤º3ç§’ï¼Œ2.5ç§’å¾Œæ·¡å‡º
- æ–‡å­—ï¼šã€Œâš ï¸ Alpha [ç‰©ç¨®å] èª•ç”Ÿäº†ï¼ã€

### æ“Šæ®ºçŽå‹µ
- XPï¼š200ï¼ˆ+çµäººæœ¬èƒ½åŠ æˆï¼‰
- `spawnLootCircle`ï¼š2å€‹2å€å±é«” + 3å…·ç™½éª¨
- 100% æŽ‰è½1å€‹è®Šç•°é»žï¼›é¡å¤–20%æ©ŸçŽ‡æŽ‰ 1~6å€‹

### Alpha å››æ¢æ­»äº¡è·¯å¾‘ï¼ˆv0.51.0 ç¢ºèªï¼‰
1. **çŽ©å®¶æ“Šæ®º** â†’ `handleGiantKill(c)` â†’ `if (c.isAlpha && gameState.alphaCreature === c) gameState.alphaCreature = null`
2. **æ¯’å‚·/æµè¡€ tick æ­»äº¡** â†’ `updateStatusEffects()` æ­£ç¢ºè·¯ç”±è‡³ `handleGiantKill(c)`
3. **`updateNeutralCreatures()` å·¨äººè¢«æ•µæ„ç”Ÿç‰©æ‰“æ­»** â†’ `updateHostileCreatures` ä¸­å·²æœ‰å®Œæ•´æ¸…ç†
4. **`updateHostileCreatures()` è‚‰é£Ÿè€…æ‰“æ­»ä¸­ç«‹å·¨äºº** â†’ `creature.targetType === 'neutral'` åˆ†æ”¯å·²æœ‰ `alphaCreature = null`

---

## ä¸Šæ–¹è¡€æ¢UIï¼ˆv0.37.0ï¼‰

### Boss HP UI ç¶­è­·è¦å‰‡

ã€ŒBoss HP UIã€æ˜¯ä¸Šæ–¹å¤§åž‹ç›®æ¨™è¡€æ¢ç³»çµ±çš„çµ±ç¨±ï¼ŒåŒ…å« Bossã€ç²¾è‹±æ€ªã€å·¨äººåŒ–ã€Alphaã€‚ä¹‹å¾Œä¿®æ”¹ä½ç½®ã€å°ºå¯¸ã€å­—é«”æ™‚ï¼Œå››è€…å¿…é ˆèµ°åŒä¸€å¥— `drawTopBarUI()` è¦å‰‡ï¼Œä¸å¯åªæ”¹ Boss ç‰¹ä¾‹ã€‚

- æ¡Œé¢ç‰ˆï¼šä¸€å¾‹å›ºå®šç•«é¢æ­£ä¸Šæ–¹ä¸­å¤®ï¼Œå¯¬ 400pxï¼Œ`topBarY = 10`ã€‚
- æ‰‹æ©Ÿç‰ˆï¼šä¸€å¾‹æ”¾åœ¨ `#top-left` UI æ­£ä¸‹æ–¹ï¼Œå¯¬åº¦ä½¿ç”¨ `#top-left.offsetWidth / scale`ï¼Œè¡€æ¢é«˜åº¦ 6pxï¼Œåç¨± 11pxï¼Œè¡€é‡æ•¸å­— 10pxã€‚

- **å‡½å¼**ï¼š`drawTopBarUI()`ï¼Œåœ¨ `drawGame()` æœ€æœ«å°¾å‘¼å«
- **é¡¯ç¤ºæ¢ä»¶**ï¼šçŽ©å®¶2000pxå…§å­˜åœ¨ç²¾è‹±/Boss/å·¨äººåŒ–/Alpha
- **è¿½è¹¤é‚è¼¯**ï¼š`gameState.topBarTarget` åœ¨ `playerAttack()` å‘½ä¸­ç‰¹æ®Šç›®æ¨™æ™‚è¨­å®šï¼Œæ¯’å‚·tickä¸æ›´æ–°
- **æ·¡å‡º**ï¼šç›®æ¨™æ­»äº¡æˆ–è¶…å‡º2000pxå¾Œ0.5ç§’æ·¡å‡ºï¼Œå®Œæˆå¾Œæ¸…ç©º `topBarTarget`
- **Y åº§æ¨™**ï¼šå‹•æ…‹åµæ¸¬ `#top-left` DOM å…ƒç´ é«˜åº¦ä¸¦æ›ç®— Canvas é‚è¼¯åº§æ¨™ï¼Œé¿å…æ‰‹æ©Ÿç‰ˆèˆ‡çŽ©å®¶è¡€æ¢é‡ç–Š
- **å¼·åˆ¶æ¸…é™¤**ï¼š`showVictory()` å‘¼å«æ™‚ç«‹å³è¨­å®š `topBarTarget = null`ã€`topBarFadeTimer = 0`ï¼Œç¢ºä¿å‹åˆ©ç•«é¢ä¸æ®˜ç•™è¡€æ¢
- **è¡€æ¢é¡è‰²**ï¼šç²¾è‹±ç´«è‰² `#AA22CC`ã€Bossæ·±ç´… `#CC2200`ã€å·¨äººåŒ–æ©™è‰² `#FF8800`ã€Alphaé‡‘è‰² `#FFD700`
- **gameState æ–°å¢žæ¬„ä½**ï¼š`alphaCreature`ã€`topBarTarget`ã€`topBarFadeTimer`

---

### ç¹ªè£½é †åºè¦ç¯„ï¼ˆæ‰€æœ‰ç”Ÿç‰©çµ±ä¸€ï¼‰

ç”±ä¸Šåˆ°ä¸‹ï¼šåå­— â†’ è¡€æ¢ â†’ æœ¬é«”ï¼ˆå«å…‰æšˆï¼‰
åå­—å’Œè¡€æ¢é–“è· 4pxï¼Œè¡€æ¢å’Œæœ¬é«”ä¸Šç·£é–“è· 4px

---

## map/ è³‡æ–™å¤¾

é›£åº¦åœ°åœ–é…ç½®è³‡æ–™ï¼Œå„æª”æ¡ˆå®šç¾©ä¸¦åŒ¯å‡ºä¸€å€‹ ESM å¸¸æ•¸ï¼ˆå¦‚ `export const EASY_MAP`ï¼‰ï¼Œç”± `main.js` é€éŽ ESM `import` å¼•å…¥ã€‚

| æª”æ¡ˆ | èªªæ˜Ž |
|------|------|
| `map.md` | åœ°åœ–è¨­è¨ˆæ–‡ä»¶ï¼Œè¨˜éŒ„åœ°å½¢è¦æ ¼èˆ‡æ–°å¢žé›£åº¦æ­¥é©Ÿ |
| `easymap.js` | ç°¡å–®é›£åº¦ï¼ˆ`EASY_MAP`ï¼‰ï¼šåœ°å½¢åƒæ•¸ã€ç”Ÿç‰©å€çŽ‡ã€ç²¾è‹±æ€ªé…ç½®ã€Boss é ç•™çµæ§‹ï¼›`dogElites: true` |
| `normalmap.js` | æ™®é€šé›£åº¦ï¼ˆ`NORMAL_MAP`ï¼‰ï¼šç”Ÿç‰©Ã—1.5ã€aggroRange 400ã€å·¨äººåŒ–/æ®ºæ‰‹åŒ–/Bosså›žè¡€/`dogElites: true` |
| `hardmap.js` | å›°é›£é›£åº¦ï¼ˆ`HARD_MAP`ï¼‰ï¼šç”Ÿç‰©Ã—2.5ã€aggroRange 600ã€`hardElites: true`ã€`hunterBoss: true`ï¼ˆv0.1.0.0ï¼‰ |

`generateTerrain()` è®€å– `gameState.currentMap.terrain` åƒæ•¸ï¼ˆforestCenterRadius / forestThreshold / oceanThreshold / minBiomeTiles / requiredBiomesï¼‰ï¼Œ`currentMap` ç”± `showMapSelect()` åœ¨é–‹å§‹éŠæˆ²æ™‚å¯«å…¥ã€‚

åœ°å½¢ç”Ÿæˆæµç¨‹ï¼š4D Tileable Noise â†’ ä¿è­·å€å¼·åˆ¶æ£®æž— â†’ `mergeSmallRegions`ï¼ˆåŒåŒ–å°æ–¼ `minBiomeTiles` çš„å­¤å³¶ï¼‰â†’ `ensureRequiredBiomes`ï¼ˆæœ€å¤š 10 æ¬¡é‡è©¦ï¼Œè¶…éŽå‰‡ minBiomeTiles æ¸›åŠï¼‰â†’ `buildTerrainCanvas`ã€‚

æ¨¡çµ„å±¤ç´šé è¨­å€¼ `MAP_RULES.MIN_BIOME_TILES = 250`ï¼ˆå®šç¾©æ–¼ `map.js`ï¼‰ï¼›å„åœ°åœ–å¯åœ¨ `terrain.minBiomeTiles` è¦†è“‹ã€‚

---

## æ‰‹æ©Ÿè§¸æŽ§ç³»çµ±ï¼ˆv0.23.0ï¼‰

### è£ç½®åµæ¸¬èˆ‡ç¸®æ”¾

- `detectMobile()` â€” `ontouchstart in window` æˆ– `innerWidth <= 768` è¦–ç‚ºæ‰‹æ©Ÿ
- `getOrientation()` â€” `innerHeight > innerWidth` ç‚ºè±Žå‘ï¼Œå¦å‰‡æ©«å‘
- `applyDeviceMode()` â€” åŒæ­¥ `gameState.forceMode/isMobile/orientation`ï¼Œå‘¼å« `_applyMobileScale()` + `_updateJoystickCanvas()` + `_updateOrientationBar()`
- `_applyMobileScale()` â€” ä¾è£ç½®åˆ†æ”¯ç¸®æ”¾ï¼ˆv0.1.14.1 ä¿®æ­£ï¼‰
  - **æ‰‹æ©Ÿç‰ˆ**ï¼šå¡«æ»¿èž¢å¹•ï¼Œ`scale = vw / logicW`ï¼›å‘¼å« `_setViewSize()` ä¾æ–¹å‘èª¿æ•´é‚è¼¯è§£æžåº¦ï¼ˆMOBILE_GAME_SCALE = 0.6ï¼‰ï¼›container å®šä½ `left:0, top:0`
  - **é›»è…¦ç‰ˆ**ï¼šLetterboxï¼Œ`scale = Math.min(vw/1600, vh/900)`ï¼›VIEW_W/VIEW_H å›ºå®š 1600Ã—900ï¼Œä¸å‘¼å« `_setViewSize()`ï¼›container ç½®ä¸­ç•™é»‘æ¡†
  - `_letterboxScale`ï¼ˆexport letï¼‰å…©å€‹åˆ†æ”¯æœ€å¾Œéƒ½æ›´æ–°ï¼Œä¾› chat.js ç­‰æ¨¡çµ„è®€å–ç•¶å‰ç¸®æ”¾æ¯”ä¾‹

### è¨­å®šä»‹é¢ã€Œè£ç½®æ¨¡å¼ã€å€å¡Š

`showSettings()` æ–°å¢žä¸‰é¡†åˆ‡æ›æŒ‰éˆ•ï¼šè‡ªå‹•åµæ¸¬ / ðŸ“± æ‰‹æ©Ÿæ¨¡å¼ / ðŸ–¥ï¸ é›»è…¦æ¨¡å¼ã€‚é¸æ“‡å³æ™‚å¥—ç”¨ä¸¦å­˜å…¥ `localStorage`ï¼ˆkeyï¼š`gameSettings.deviceMode`ï¼‰ã€‚

### æ–¹å‘æç¤ºæ¢

è±Žå‘æ‰‹æ©Ÿæ™‚åœ¨ `#game-container` é ‚éƒ¨æ’å…¥é»ƒè‰²åŠé€æ˜Žæç¤ºæ¢ï¼Œæœ‰ âœ• é—œé–‰éˆ•ã€‚æ©«å‘æ—‹è½‰å¾Œè‡ªå‹•éš±è—ä¸¦é‡ç½® dismissed ç‹€æ…‹ã€‚

### è™›æ“¬æ–æ¡¿

- **æ–æ¡¿ç•«å¸ƒ**ï¼š`#joystick-canvas`ï¼ˆ`position:fixed`ï¼Œå…¨èž¢å¹•ï¼Œ`pointer-events:none`ï¼Œç´”ç¹ªåœ–ï¼‰
- **äº‹ä»¶æŽ›è¼‰**ï¼š`touchstart/touchmove/touchend` æŽ›åœ¨ `document`ï¼Œ`_joyPaused()` ç¢ºä¿æš«åœç‹€æ…‹ä¸å•Ÿå‹•
- **å€åŸŸ**ï¼šæ©«å‘ = å³åŠèž¢å¹•ï¼›è±Žå‘ = å³åŠ + èž¢å¹•ä¸‹ 40%
- **è¼¸å‡º**ï¼š`gameState.mobileInput = { dx, dy }`ï¼ˆç¯„åœ âˆ’1~1ï¼Œä½ç§»æ¯”ä¾‹æ±ºå®šé€Ÿåº¦ï¼‰
- `updatePlayerMovement()` è®€å– `mobileInput` ä¸¦ç–ŠåŠ åœ¨éµç›¤è¼¸å…¥ä¸Šï¼Œé›»è…¦ç‰ˆæ†ç‚º 0

### æ”»æ“Šå€åŸŸ

- **æ©«å‘**ï¼šå·¦åŠèž¢å¹•æ•´å€ç‚ºæ”»æ“Šå€ï¼Œé¡¯ç¤º âš”ï¸ æç¤ºï¼ˆopacity 0.2ï¼‰ï¼Œtap â†’ `playerAttack()`
- **è±Žå‘**ï¼šå·¦åŠä¸‹æ–¹ 40% ä¸­å¤®ä¸€å€‹åŠå¾‘ 40px åœ“å½¢æŒ‰éˆ•ï¼Œé¡¯ç¤º âš”ï¸ï¼Œtap â†’ `playerAttack()`
- æ”»æ“Šå†·å»æ²¿ç”¨ `playerAttack()` å…§å»ºé‚è¼¯ï¼Œä¸å¦å¤–å¯¦ä½œ
- æ”»æ“Šå€èˆ‡æ–æ¡¿å€ä¸é‡ç–Šï¼Œæ”¯æ´å¤šæŒ‡åŒæ™‚æ“ä½œï¼ˆä¸€æ‰‹æ–æ¡¿ + ä¸€æ‰‹æ”»æ“Šï¼‰

### é—œéµ CSS æ³¨æ„

- `canvas { background-color }` å·²æ”¹ç‚º `#gameCanvas { background-color: #549954 }`ï¼Œé¿å… `#joystick-canvas` ç¹¼æ‰¿ç¶ è‰²èƒŒæ™¯è“‹ä½æ‰€æœ‰ overlay

---

## é–ƒç¾æŠ€èƒ½ç³»çµ±ï¼ˆv0.53.0ï¼‰

- **è§¸ç™¼**ï¼šæ¡Œæ©Ÿ `F` éµï¼ˆ`input.js handleKeyDown`ï¼‰ï¼›æ‰‹æ©Ÿç‰ˆé»žæ“Š `_dashZone()` çŸ©å½¢å€åŸŸï¼ˆæ”»æ“Šå€æ­£ä¸Šæ–¹ï¼‰
- **å‡½å¼**ï¼š`playerDash()`ã€`_collectFruit(p, fruit)`ï¼ˆ`systems/player.js`ï¼‰
- **æ•ˆæžœ**ï¼šæœ `lastMoveDir` æ–¹å‘çž¬ç§» `speed Ã— 50`ï¼ˆæœ€é  500pxï¼‰ï¼Œå¤¾åœ¨åœ°åœ–é‚Šç•Œå…§
- **ç„¡æ•µ**ï¼š`dashInvincible = true`ï¼ŒæŒçºŒ 500msï¼ˆ`dashInvincibleEnd = Date.now() + 500`ï¼‰ï¼Œ`applyDamageToPlayer` é–‹é ­è¿”å›žè·³éŽæ‰€æœ‰å¤–éƒ¨å‚·å®³
- **å†·å»**ï¼š`dashCooldown = 15000`ï¼ˆmsï¼‰ï¼Œæ¯å¹€æ‰£ `FIXED_DELTA`ï¼ˆâ‰ˆ16.67msï¼‰
- **æ–¹å‘å„ªå…ˆåº**ï¼šæ‰‹æ©Ÿæ–æ¡¿ `mobileInput` > `player.lastMoveDir`ï¼ˆç§»å‹•æ™‚æŒçºŒæ›´æ–°æ­£è¦åŒ–æ–¹å‘ï¼Œåˆå§‹å€¼ `{dx:0, dy:-1}` æœä¸Šï¼‰
- **ç‰¹æ•ˆ**ï¼šè§¸ç™¼å¾Œåœ¨ `gameState.dashEffect` è¨˜éŒ„èµ·çµ‚é»žï¼Œ`drawGame` æ­¥é©Ÿ 9f ç¹ªè£½ 150ms ä¸‰æ®µç‰¹æ•ˆï¼ˆé‡‘è‰²ç…™éœ§/ç™½è‰²å…‰çƒ/æµå…‰ç·šï¼‰
- **ç›´ç·šæžœå­å¸æ”¶**ï¼šé–ƒç¾è·¯å¾‘ Aâ†’B ç›´ç·šå¯¬åº¦ = `radius + pickupRange`ï¼Œè·¯å¾‘ä¸Šæžœå­å…¨éƒ¨å¸æ”¶ï¼ˆè¤‡ç”¨ `_collectFruit`ï¼‰
- **æŒ‰éµå¯è‡ªè¨‚**ï¼š`DEFAULT_SETTINGS.keys.dash = 'f'`ï¼›è¨­å®šä»‹é¢ã€Œç‰¹æ®ŠæŠ€èƒ½éµã€æ¬„ï¼Œ`input.js` è®€ `settings.keys.dash`

### player æ–°å¢žæ¬„ä½

| æ¬„ä½ | åˆå€¼ | èªªæ˜Ž |
|------|------|------|
| `dashCooldown` | `0` | é–ƒç¾å‰©é¤˜å†·å»æ¯«ç§’ï¼ˆæ¯å¹€ç”± `updatePlayerMovement` éžæ¸›ï¼‰ |
| `dashInvincible` | `false` | ç„¡æ•µæ——æ¨™ï¼ˆ`applyDamageToPlayer` é–‹é ­åˆ¤æ–·ï¼‰ |
| `dashInvincibleEnd` | `0` | ç„¡æ•µçµæŸæ™‚é–“æˆ³ï¼ˆmsï¼Œç”± `updatePlayerMovement` æª¢æŸ¥æ¸…é™¤ï¼‰ |
| `lastMoveDir` | `{dx:0, dy:-1}` | æœ€å¾Œç§»å‹•æ–¹å‘ï¼ˆæ­£è¦åŒ–ï¼Œæ¯å¹€ç§»å‹•æ™‚æ›´æ–°ï¼›é–ƒç¾æ–¹å‘ä¾æ“šï¼‰ |
| `dashEffect` | `null` | é–ƒç¾ç‰¹æ•ˆç‹€æ…‹ï¼ˆ`{ ax,ay,bx,by,startTime,duration:150 }`ï¼Œv0.54.0ï¼‰|

### æ¡Œæ©Ÿç‰ˆæŒ‡ç¤ºå™¨ï¼ˆ`hud.js drawGame` æ­¥é©Ÿ 12bï¼‰

- ä½ç½®ï¼šVIEW_W å³å´ 50%ã€VIEW_H 50%~75%ï¼ˆèˆ‡æ‰‹æ©Ÿç›´å‘é–ƒç¾å€å°æ‡‰ï¼‰
- æ­£å¸¸ï¼š`ðŸ’¨ F`ï¼ŒglobalAlpha 0.15ï¼Œå­—é«” 28px
- å†·å»ï¼š`ðŸ’¨ F` æš—ï¼ˆ0.08ï¼‰+ ç°è‰²é€²åº¦æ¢ + å€’æ•¸ç§’æ•¸ï¼ˆ20pxï¼Œç™½è‰² 0.7ï¼‰

### æ‰‹æ©Ÿç‰ˆæŒ‰éˆ•ï¼ˆ`mobile.js _renderMobileOverlay`ï¼‰

- **ç›´å‘**ï¼šå³å´ 50% å¯¬ï¼Œåº•éƒ¨ 50%~75% é«˜ï¼ˆæ”»æ“Šå€æ­£ä¸Šæ–¹ï¼‰
- **æ©«å‘**ï¼šå³å´ 25% å¯¬ï¼Œæ•´å€‹ä¸ŠåŠéƒ¨ï¼ˆåº•éƒ¨ 0%~50% é«˜ï¼‰
- æ­£å¸¸ï¼š`ðŸ’¨` globalAlpha 0.15ï¼›å†·å»ï¼šæš—åœ–ç¤º + é€²åº¦æ¢ + å€’æ•¸ç§’æ•¸

---

## æ–°å¢ž gameState æ¬„ä½ï¼ˆv0.31.0ï¼‰

| æ¬„ä½ | ä½ç½® | é¡žåž‹ | èªªæ˜Ž |
|------|------|------|------|
| `player.boneMaterial` | `gameState.player` | `number` | ç´¯ç©ç™½éª¨ç´ ï¼Œé”é–€æª»è‡ªå‹•å‡ç´šæ¯’å›Š |
| `player.perceptionRange` | `gameState.player` | `number` | éˆæ•çŸ¥è¦ºåµæ¸¬åŠå¾‘ï¼ˆpxï¼‰ |
| `player.naturalRegenHpMaxPercent` | `gameState.player` | `number` | è¶…è‡ªç„¶å›žå¾©æ¯æ¬¡é¡å¤–å›žå¾©çš„æœ€å¤§HPç™¾åˆ†æ¯” |
| `gameState.bones` | `gameState` | `Array` | ç™½éª¨ç‰©ä»¶é™£åˆ—ï¼Œ`{x, y, radius, spawnTime, eatTimer}` |
| `gameState.brainShockwaves` | `gameState` | `Array` | å¤§è…¦è¡æ“Šæ³¢è¦–è¦ºæ•ˆæžœé™£åˆ—ï¼Œ`{x, y, range, startTime}` |

### æ¯’å›Šï¼ˆpoisonSacï¼‰è¨­è¨ˆèªªæ˜Ž

- `noSelection: true` â€” ä¸å‡ºç¾åœ¨å™¨å®˜é¸æ“‡æ± 
- `noInherit: true` â€” æ­»å¾Œä¸å¯ç¹¼æ‰¿
- `thresholds: [5, 10, 20, 40, 60, 100, 120, 140, 160, 200]` â€” 10 å€‹ç­‰ç´šå°æ‡‰çš„ç™½éª¨ç´ é–€æª»
- Lv0 ç‚ºåˆå§‹ç„¡æ•ˆæžœç‹€æ…‹ï¼ˆ`applyOrganEffects` é‡åˆ° Lv0 ç›´æŽ¥ returnï¼‰
- é›œé£Ÿæ€§ Lv1 æ™‚ç”± `_grantPoisonSac()` è‡ªå‹•æŽ¨å…¥ player.organs

### ç™½éª¨ç³»çµ±æµç¨‹

1. å±é«” 60 ç§’å¾Œæˆ–è¢«åƒæŽ‰ â†’ `_spawnBone(x, y, radius)` æŽ¨å…¥ `gameState.bones[]`
2. ç™½éª¨åœ¨åœ°åœ–å­˜åœ¨ 180 ç§’å¾Œè‡ªå‹•æ¶ˆå¤±
3. é›œé£Ÿæ€§çŽ©å®¶é è¿‘ç™½éª¨ â†’ `updateBoneEating()` è¨ˆæ™‚ï¼ˆ`boneEatTime` æ¯«ç§’ï¼ŒLv3+ å³æ™‚ï¼‰
4. åžå™¬å®Œæˆ â†’ `_addBoneMaterial(boneMaterialAdd)` ç´¯åŠ ç™½éª¨ç´ 
5. `_checkPoisonSacUpgrade(p)` å°ç…§ `thresholds[]` è‡ªå‹•å‡ç´šæ¯’å›Šä¸¦å¥—ç”¨ delta æ•ˆæžœ

---

## æŠ€èƒ½é»žç²å¾—æ–¹å¼ï¼ˆv0.32.0 / v0.34.0ï¼‰

| ä¾†æº | æ™‚æ©Ÿ | æ•¸é‡ | ä½ç½® |
|------|------|------|------|
| ç²¾è‹±æ€ªæ“Šæ®º | éŠæˆ²ä¸­ï¼ˆæ¯å¤œï¼‰ | å¤œæ™š1=+1ã€å¤œæ™š2=+1ã€å¤œæ™š3=+2ï¼ˆv0.47.0ï¼‰ | `systems/organs.js` `handleEliteKill` |
| Bossæ“Šæ®º | å‹åˆ©çµç®—å‰ | +3ï¼ˆv0.47.0ï¼ŒåŽŸç‚º+5ï¼‰ | `systems/boss.js` `showVictory` |
| æ™‚é–“çŽå‹µ | æ­»äº¡/å‹åˆ©çµç®— | `Math.floor((600 - timeRemaining) / 180)` | `showSkillTree` / `showVictory` |
| ç­‰ç´šçŽå‹µ | æ­»äº¡/å‹åˆ©çµç®— | `Math.floor(player.level / 6)` | `showSkillTree` / `showVictory` |

### æŠ€èƒ½é»žè¿½è¹¤ï¼ˆv0.34.0ï¼‰
- `gameState.sessionSkillPoints = { elite: 0, boss: 0 }` åœ¨æ¯å±€é–‹å§‹æ™‚æ¸…é›¶ï¼ˆ`initializeGame()` çš„ç‹€æ…‹é‡è¨­å€å¡Šï¼‰
- `handleEliteKill` ç´¯åŠ  `sessionSkillPoints.elite += eliteSkillPts`ï¼ˆå…¬å¼ï¼š`[1,1,2][nightIndex] || 1`ï¼Œv0.47.0ï¼‰
- `showVictory` è¨­å®š `sessionSkillPoints.boss = 3`ï¼ˆv0.47.0ï¼‰
- çµç®—ç•«é¢ï¼ˆ`showDeathSettlement` / `doShowVictory`ï¼‰è®€å–æ­¤å€¼é¡¯ç¤ºè©³ç´°æ˜Žç´°

### æŠ€èƒ½å‡ç´šè²»ç”¨ï¼ˆ`upgradeSkill`ï¼‰
å‡è‡³ç¬¬ N ç´šè²» N æŠ€èƒ½é»žï¼šLv1=1é»žã€Lv2=2é»žã€Lv3=3é»žã€Lv4=4é»žã€Lv5=5é»žã€‚

---

## çµ„åˆæ•ˆæžœï¼ˆCOMBOSï¼‰ï¼ˆv0.34.0 èª¿æ•´ï¼‰

| key | è§¸ç™¼æ¢ä»¶ | æ•ˆæžœ |
|-----|----------|------|
| `comboCrabPoison` | æ¯’åˆºLv3 + æ“æœ‰æ¯’å›Šï¼ˆä»»æ„ç­‰ç´šï¼‰ | æ¯’å‚·ç¿»å€ |
| `comboCrabGloves` | èŸ¹é‰—Lv3 + ææ“Šæ‹³å¥—Lv3 | æµè¡€å‚·å®³ç¿»å€ï¼›å‘½ä¸­æ–½åŠ  `healReduction=0.5` |
| `comboShellArmor` | é¾œæ®¼Lv3 + åˆºç”²Lv3 | åå½ˆå‚·å®³ç¿»å€ |
| `comboBrainEye` | å¤§è…¦Lv3 + çœŸè¦–ä¹‹çœ¼Lv3 | å¿µåŠ›æ³¢å¯è§¸ç™¼æš´æ“Š |
| `comboSkinRegen` | åŽšçš®Lv3 + è¶…è‡ªç„¶å›žå¾©Lv3 | å›žå¾©+1HPï¼Œé–“éš”-1ç§’ |
| `comboEyeFang` | çœŸè¦–ä¹‹çœ¼Lv3 + ç ç‰™Lv3 | æš´æ“Šé™„åŠ æšˆçœ© |

`checkComboEffects()` å° `comboCrabPoison` æŽ¡ç”¨ç‰¹æ®Šé‚è¼¯ï¼ˆ`hasLv3('poisonStinger') && hasOrgan('poisonSac')`ï¼‰ï¼Œå…¶é¤˜çµ„åˆçµ±ä¸€ç”¨ `combo.ids.every(id => hasLv3(id))`ã€‚

`healReduction`ï¼š`combat.js` `playerAttack()` åœ¨ `comboCrabGloves` è§¸ç™¼æ™‚å°å‘½ä¸­ç›®æ¨™è¨­å®š `c.healReduction = 0.5`ï¼Œä½œç‚ºæœªä¾†å›žå¾©æ©Ÿåˆ¶çš„å‰ç½® debuffã€‚

---

## è®Šç•°å™¨å®˜ç³»çµ±ï¼ˆv0.39.0ï¼‰

### å„²å­˜
- localStorage keyï¼š`mutationData`ï¼ˆç¨ç«‹ï¼Œä¸å— SAVE_VERSION æ¸…é™¤ï¼‰
- çµæ§‹ï¼š`{ levels:{fang/tail/wing/eye}, points, totalPointsEarned, compensationVersion, skillPointsCompensated, hasNewPoints }`

### å››ç¨®è®Šç•°å™¨å®˜
| organId | åœ–æ¨™ | åç¨±           | æ•ˆæžœï¼ˆFinalå€¼ï¼‰    |
|---------|------|---------------|------------------|
| fang    | ðŸ¦·   | è®Šç•°-æ†¤æ€’çš„ç ç‰™ | æ¯ç´š+1%æ”»æ“ŠåŠ›     |
| tail    | ðŸ¾   | è®Šç•°-æ‡¦å¼±çš„å°¾å·´ | æ¯ç´š+1%æœ€å¤§HP     |
| wing    | ðŸª¶   | è®Šç•°-å‹‡æ•¢çš„ç¿…è†€ | æ¯ç´š+1%é€Ÿåº¦       |
| eye     | ðŸ‘ï¸   | è®Šç•°-å¥½å¥‡çš„çœ¼ç› | æ¯ç´š+1%XPå€æ•¸     |

### å‡ç´šè²»ç”¨
æ¯5ç´š+1è²»ï¼Œèµ·å§‹1è²»ï¼šLv0â†’1=1é»žï¼ŒLv5â†’6=2é»žï¼ŒLv10â†’11=3é»ž
`getMutationUpgradeCost(currentLevel) = Math.floor(currentLevel/5)+1`

### æ•ˆæžœå¥—ç”¨
- `applyAllMutationBonuses()`ï¼šéŠæˆ²åˆå§‹åŒ–ä¸€æ¬¡æ€§å¥—ç”¨ï¼ˆåœ¨ `applyEvolutionEffects()` ä¹‹å¾Œï¼‰
- `upgradeMutation(organId)`ï¼šmid-game å‡ç´šä½¿ç”¨ delta æ¯”å€¼ï¼ˆæ–°/èˆŠï¼‰ï¼Œé¿å…è¤‡åˆ©èª¤ç®—
- XP åŠ æˆåœ¨ `addXP()` è£¡å‹•æ…‹å¥—ç”¨ `mutationXpBonus`

### ç²å¾—æ–¹å¼
- æ“Šæ®ºå·¨äººåŒ–ï¼š100%+1ï¼Œ10%é¡å¤–1~3
- æ“Šæ®ºAlphaï¼š100%+1ï¼Œ20%é¡å¤–1~6
- æ“Šæ®ºæ®ºæ‰‹åŒ–ï¼š100%+1ï¼Œ`killerCorpseEaten=N` â†’ N%æ©ŸçŽ‡é¡å¤–1~Nï¼ˆæ­»äº¡æ™‚çµç®—ï¼‰

### è£œå„Ÿæ©Ÿåˆ¶
- `MUTATION_COMPENSATION_VERSION` æŽ§åˆ¶ç‰ˆæœ¬ï¼ˆæ”¹ç‚º '1' è§¸ç™¼ç¬¬ä¸€æ¬¡è£œå„Ÿï¼‰
- `MUTATION_COMPENSATION_CONFIG` è¨­å®šå„ç‰ˆæœ¬è£œå„Ÿæ¯”ä¾‹ï¼ˆmutationPointsRate / skillPointsRateï¼‰
- åŸ·è¡Œä¸€æ¬¡å¾Œè¨˜éŒ„ `compensationVersion` é¿å…é‡è¤‡
- å‘¼å«æ™‚æ©Ÿï¼š`initMutationData()` æœ«å°¾

### UI
- `_initTopLeftUI()` ç¬¬ä¸‰è¡Œï¼šâš—ï¸ Lv.X åœ–æ¨™ + ç´…é»žï¼ˆ`#mutation-icon-row`ï¼‰ï¼Œ`pointer-events:all`ï¼Œclick â†’ `showMutationPanel()`
- `updateUI()` æ¯å¹€æ›´æ–°ï¼š`#mutation-level-text` é¡¯ç¤ºå››å€‹å™¨å®˜ç­‰ç´šç¸½å’Œï¼Œ`#mutation-red-dot` é¡¯ç¤º/éš±è—
- `showMutationPanel()`ï¼šå½ˆå‡º z-index 120 é¢æ¿ï¼ŒéŠæˆ²æš«åœï¼ˆ`mutationPanelOpen=true`ï¼‰ï¼›é¢æ¿éª¨æž¶åªå»ºç«‹ä¸€æ¬¡ï¼Œå‡ç´š/å…Œæ›æŒ‰éˆ•å‘¼å«å…§éƒ¨ `refresh()` å°±åœ°æ›´æ–°æ•¸å€¼èˆ‡æŒ‰éˆ•ç‹€æ…‹ï¼Œä¸æœƒæ•´å€‹æ‘§æ¯€é‡å»ºï¼ˆv0.1.25.7 ä¿®å¾©æ²å‹•æ­¸é›¶å•é¡Œï¼‰
- `isGamePaused()` å’Œ `_joyPaused()` å‡åŠ å…¥ `mutationPanelOpen` åˆ¤æ–·

### åˆå§‹åŒ–æµç¨‹
`window.onload` â†’ `initMutationData()` â†’ `applyMutationEffects()` è¨­å®šå€çŽ‡
`initializeGame()` â†’ `applySkillBonuses()` â†’ `applyEvolutionEffects()` â†’ `applyAllMutationBonuses()` ä¸€æ¬¡æ€§å¥—ç”¨

---

## æ–°æ‰‹æ•™å­¸ç³»çµ±ï¼ˆv0.43.0 / v0.44.0 / v0.45.0ï¼‰

- **æª”æ¡ˆ**ï¼š`systems/tutorial.js`ï¼ˆIIFE æ¨¡çµ„ï¼ŒæŽ›è‡³ `window`ï¼‰
- **è¼‰å…¥æ™‚æ©Ÿ**ï¼šindex.html ä¸­ä½æ–¼ `combat.js` / `organs.js` ä¹‹å‰ï¼ˆv0.45.0 èª¿æ•´ï¼Œç¢ºä¿å…©è€…å¯å‘¼å«æ•™å­¸å‡½å¼ï¼‰

### ç¬¬ä¸€éšŽæ®µï¼šç§»å‹•æ•™å­¸ï¼ˆv0.43.0ï¼‰

è§¸ç™¼æ¢ä»¶ï¼š`initializeGame()` çµæŸå¾Œï¼Œè‹¥ localStorage ç„¡ `tutorialCompleted`ï¼Œå‘¼å« `showTutorial()`ã€‚

ä¸‰æ­¥é©Ÿæµç¨‹ï¼š

| æ­¥é©Ÿ | ç‹€æ…‹ | å…§å®¹ |
|------|------|------|
| 1 | å‡çµï¼ˆ`tutorialOpen = true`ï¼‰ | å…¨èž¢å¹•æš—è‰²é®ç½© + çŽ©å®¶ç™½è‰²å…‰åœˆè„ˆè¡ + æ­¡è¿Žæç¤ºæ¡† |
| 2 | è§£å‡ | é‡‘è‰²å…‰æšˆ + é–ƒçˆ â†“ ç®­é ­æ¨™è¨˜æœ€è¿‘æžœå­ï¼›ç´…è‰²è™›ç·šå¼•å°Žç·šï¼ˆå…¨ç¨‹é¡¯ç¤ºï¼‰ï¼›XP å¢žåŠ å³é€²å…¥æ­¥é©Ÿä¸‰ |
| 3 | å‡çµ | é®ç½©é‡ç¾ï¼›æ—¥å¤œæŒ‡ç¤ºå™¨é‡‘è‰²é‚Šæ¡†é–ƒçˆï¼›æ—¥å¤œæ©Ÿåˆ¶èˆ‡å‹åˆ©æ¢ä»¶èªªæ˜Žï¼›æŒ‰éˆ•çµæŸä¸¦å¯«å…¥ `localStorage.tutorialCompleted` |

- `gameState.tutorialOpen`ï¼šæ•´åˆè‡³ `isGamePaused()`ï¼Œæ•™å­¸æœŸé–“æš«åœéŠæˆ²é‚è¼¯

### æ•™å­¸è¨­å®šé–‹é—œï¼ˆv0.44.0ï¼‰

`showSettings()` è¼”åŠ©åŠŸèƒ½å€å¡Šæ–°å¢žã€Œæ–°æ‰‹æ•™å­¸ã€é–‹é—œï¼š
- é–‹å•Ÿï¼ˆç¶ è‰²ï¼‰= ç§»é™¤ `tutorialCompleted`ï¼Œä¸‹ä¸€å ´è§¸ç™¼æ•™å­¸
- é—œé–‰ï¼ˆç°è‰²ï¼‰= å¯«å…¥ `tutorialCompleted`ï¼Œæ•™å­¸ä¸å†è§¸ç™¼
- é–‹é—œç‹€æ…‹å³æ™‚åæ˜  localStorage ç¾æ³

### ç¬¬äºŒéšŽæ®µï¼šæˆ°é¬¥æ•™å­¸ï¼ˆv0.45.0ï¼‰

è§¸ç™¼æ¢ä»¶ï¼šçŽ©å®¶ç¬¬ä¸€æ¬¡å‡ç´šæ™‚ï¼ˆ`showOrganSelection()` åµæ¸¬åˆ° `tutorialCompleted` å­˜åœ¨ä¸” `tutorialCombatDone` ä¸å­˜åœ¨ï¼‰

æµç¨‹ï¼š
1. å™¨å®˜é¸æ“‡éŽ–å®šç¬¬ä¸€å¼µæ”»æ“Šå™¨å®˜ï¼ˆ`tutorialOrganPhase = true`ï¼‰ï¼Œå…¶ä»–å¡ç‰‡ç°æš—ç¦ç”¨
2. é¸å®Œå¾Œï¼š`spawnTutorialStump()` åœ¨çŽ©å®¶æ­£å‰æ–¹ 150px ç”Ÿæˆæ£•è‰²æœ¨æ¨ï¼ˆHP 30ï¼‰+ é¡¯ç¤ºæˆ°é¬¥æç¤ºæ¡†
3. æœ¨æ¨ç¹ªè£½æ–¼ `drawGame()` 7c æ­¥é©Ÿï¼›`playerAttack()` å°‡æœ¨æ¨åŠ å…¥æ”»æ“Šç›®æ¨™
4. æ“Šæ®ºæœ¨æ¨ â†’ `handleTutorialStumpKill()`ï¼šå‡çµ 0.5 ç§’ â†’ é¡¯ç¤ºã€Œâš”ï¸ æ”»æ“Šå­¸æœƒäº†ï¼ã€ï¼ˆ2 ç§’æ¶ˆå¤±ï¼‰â†’ å¯«å…¥ `localStorage.tutorialCombatDone`

**æ–°å¢ž gameState æ——æ¨™**ï¼ˆå‡åœ¨ `initializeGame()` é‡ç½®ï¼‰ï¼š

| æ——æ¨™ | èªªæ˜Ž |
|------|------|
| `tutorialOpen` | æ•™å­¸å‡çµä¸­ï¼ˆæ•´åˆè‡³ `isGamePaused()`ï¼‰ |
| `tutorialOrganPhase` | å™¨å®˜é¸æ“‡éŽ–å®šæ¨¡å¼ |
| `tutorialCombatActive` | æˆ°é¬¥æ•™å­¸é€²è¡Œä¸­ |
| `tutorialStump` | æ•™å­¸æœ¨æ¨ç‰©ä»¶ï¼ˆnull è¡¨ç¤ºä¸å­˜åœ¨ï¼‰ |

**å…¬é–‹å‡½å¼ï¼ˆæŽ›è‡³ windowï¼‰**ï¼š
- `showTutorial()` â€” ç¬¬ä¸€éšŽæ®µå…¥å£
- `spawnTutorialStump()` â€” ç”Ÿæˆæ•™å­¸æœ¨æ¨ + é¡¯ç¤ºæˆ°é¬¥æç¤ºæ¡†
- `handleTutorialStumpKill()` â€” æœ¨æ¨æ­»äº¡è™•ç†ï¼ˆæ¸…é™¤ â†’ å‡çµ â†’ å®Œæˆè¨Šæ¯ â†’ è§£å‡ï¼‰

---

## åœ–é‘‘ç³»çµ±ï¼ˆv0.31.0 / v0.47.1 æ“´å……ï¼‰

- **å…¥å£**ï¼šé¦–é ã€ŒðŸ“– åœ–é‘‘ã€æŒ‰éˆ•å‘¼å« `showCompendium('guide')`ï¼›éŠæˆ²å…§å³ä¸Šè§’ `_drawCompendiumBtn()` å‘¼å« `showCompendium('organs')`
- **ä¸‰åˆ†é **ï¼šéŠæˆ²èªªæ˜Žï¼ˆguideï¼‰ / å™¨å®˜åœ–é‘‘ï¼ˆorgansï¼‰ / é€²åŒ–ç³»çµ±ï¼ˆevoï¼‰
- **é–‹å•Ÿæ™‚æš«åœ**ï¼š`organSelectionActive = true`ï¼Œé—œé–‰æ™‚æ¢å¾©
- **æ¡Œæ©Ÿé¢æ¿å°ºå¯¸**ï¼š`width:82%; max-width:1040px; height:86%; max-height:86vh`ï¼ŒisMobile æ„ŸçŸ¥ï¼Œä¸æ²¿ç”¨æ‰‹æ©Ÿç‰ˆå°ºå¯¸ï¼ˆv0.1.25.7ï¼‰
- **æ¡Œæ©Ÿå·¦å´ç›®éŒ„æ²å‹•ä¿ç•™**ï¼š`_renderGuide` / `_renderOrgans` / `_renderEvo` æ¡Œæ©Ÿåˆ†æ”¯é‡ç¹ªå‰å¾Œå‘¼å« `_captureSidebarScroll(container)` / `_restoreSidebarScroll(sidebar, savedTop)`ï¼ˆæ¨™è¨˜å±¬æ€§ `data-comp-sidebar="1"`ï¼‰ï¼Œé¿å…é»žæ“Šç›®éŒ„æ¢ç›®æ™‚å›  `container.innerHTML=''` æ•´å€‹é‡å»ºå°Žè‡´ `scrollTop` æ­¸é›¶ã€ç•«é¢å›žå½ˆï¼ˆv0.1.25.7ï¼‰

### éŠæˆ²èªªæ˜Žåˆ†é ï¼ˆv0.47.1 æ“´å……è‡³ 5 é ï¼‰

| é ç¢¼ | å…§å®¹ |
|------|------|
| 1 | åŸºæœ¬æ“ä½œï¼ˆç§»å‹•/æ”»æ“Š/è¨­å®š/æžœå­/ç›®æ¨™/è‡ªå‹•æ”»æ“Šï¼‰ |
| 2 | å™¨å®˜ç³»çµ±èªªæ˜Ž |
| 3 | é€²åŒ–ç³»çµ±èªªæ˜Ž |
| 4 | **Boss åœ–é‘‘**ï¼ˆ`_buildBossPage()`ï¼‰ï¼šå‹•æ…‹å¼•ç”¨ EASY_MAP/NORMAL_MAP bossesï¼Œé¡¯ç¤ºç°¡å–®/æ™®é€šå…©å¥—æ•¸å€¼ã€æ™®é€šæŠ€èƒ½èªªæ˜Žã€é€šç”¨å›žè¡€ã€å¼±é»žæç¤º |
| 5 | **é›£åº¦ä»‹ç´¹**ï¼ˆ`_buildDifficultyPage()`ï¼‰ï¼šå‹•æ…‹å¼•ç”¨åœ°åœ– configï¼Œé¡¯ç¤ºç”Ÿç‰©å¼·åº¦å€çŽ‡ã€ç²¾è‹±/Boss çŽå‹µã€ç‰¹æ®Šæ©Ÿåˆ¶é–‹é—œ |

### buildEvoLevelDesc(pathId, upToLevel)ï¼ˆv0.47.1ï¼‰

- **ä½ç½®**ï¼š`systems/ui.js`ï¼Œç”± ui.js åŒ¯å‡ºçš„å‡½å¼ï¼Œå®šç¾©æ–¼ `showCompendium()` ä¹‹å‰
- å¾ž `EVOLUTION_PATHS[pathId].levels` å‹•æ…‹è¨ˆç®—ï¼Œ`config/evolution.js` æ”¹æ•¸å€¼å¾Œè‡ªå‹•åŒæ­¥
- **è‰é£Ÿæ€§**ï¼šHP / æžœå­XP ç´¯è¨ˆï¼Œé«”åž‹å–æœ€æ–°å€¼ï¼Œè¡Œç‚ºèªªæ˜Žä¾ç­‰ç´šå›ºå®šæ–‡å­—ï¼ˆæ’žåˆ°ä¸é€ƒè·‘/è¢«æ”»æ“Šä¸é€ƒè·‘ï¼‰
- **è‚‰é£Ÿæ€§**ï¼šæ”»æ“Š/å±é«”XP/åžå™¬æ™‚é–“/æ”»é€Ÿ å–ç•¶ç´šå›ºå®šå€¼ï¼ˆéžç´¯è¨ˆï¼‰
- **é›œé£Ÿæ€§**ï¼šé€Ÿåº¦ç´¯è¨ˆï¼Œç™½éª¨åžå™¬æ™‚é–“/ç™½éª¨ç´  å–ç•¶ç´šå›ºå®šå€¼

---

## ç‰ˆæœ¬æ›´æ–°å…¬å‘Šç³»çµ±ï¼ˆv0.42.0ï¼‰

- **è³‡æ–™æª”**ï¼š`config/patchnotes.js`ï¼Œå®šç¾©ä¸¦åŒ¯å‡º ESM å¸¸æ•¸ `PATCH_NOTES`ï¼ˆé™£åˆ—ï¼‰ï¼Œæœ€æ–°ç‰ˆæœ¬ç½®é ‚ï¼ˆindex 0ï¼‰
- **æ¬„ä½æ ¼å¼**ï¼š`{ version, date, added[], fixed[], changed[] }`ï¼Œæ²’æœ‰å…§å®¹çš„æ¬„ä½å¯çœç•¥
- **`showPatchNotes()`**ï¼ˆ`systems/ui.js`ï¼‰ï¼šå½ˆå‡ºå…¬å‘Šé¢æ¿ï¼ˆz-index 210ï¼‰ï¼Œå·¦å´åž‚ç›´ Tab åˆ‡æ›ç‰ˆæœ¬ï¼Œå³å´é¡¯ç¤ºåˆ†é¡žå…§å®¹ï¼›æœªè®€ç‹€æ…‹å¯«å…¥ `readPatchNotes`ï¼Œé»žé–‹å–®ä¸€ç‰ˆæœ¬å³æ¸…é™¤è©²ç‰ˆæœ¬ç´…é»žï¼ˆv0.1.25.2ï¼‰
- **`checkPatchNotesPopup()`**ï¼ˆ`systems/ui.js`ï¼‰ï¼šåœ¨ `showStartScreen()` æœ«å°¾å‘¼å«ï¼›æ–°çŽ©å®¶ï¼ˆç„¡ `hasPlayedBefore`ï¼‰è·³éŽï¼›`readPatchNotes` ä»æœ‰æœªè®€ç‰ˆæœ¬æ™‚è‡ªå‹• setTimeout 400ms å½ˆå‡º
- **æœªè®€æ¨™è¨˜**ï¼šæœªè®€ç‰ˆæœ¬åœ¨ Tab åˆ—é¡¯ç¤ºç´…é»žï¼ˆ`#FF4444`ï¼Œclass `pn-tab-dot`ï¼‰ï¼›é¦–é æŒ‰éˆ•ç´…é»ž id `patch-red-dot`ï¼›ç›¸å®¹èˆŠ `lastSeenPatchVersion`
- **é¦–é æŒ‰éˆ•**ï¼š`#patch-notes-btn`ï¼Œä½ç½® `top:96px left:20px`ï¼ˆæ•…äº‹æ›¸æŒ‰éˆ•æ­£ä¸‹æ–¹ï¼‰ï¼Œé»žæ“Šå‘¼å« `showPatchNotes()`
- **æˆå°±ç´…é»ž**ï¼šå·²è§£éŽ–ä½†å°šæœªé»žé–‹çš„æˆå°±å¯«å…¥ `readAchievements` åˆ¤æ–·ï¼›é¦–é æˆå°±æŒ‰éˆ•ç´…é»ž id `achievement-red-dot`ï¼Œæˆå°±æ ¼å­é€æ ¼é»žé–‹å¾Œæ¸…é™¤ï¼ˆv0.1.25.2ï¼‰
- **æˆå°±è©³æƒ…çŽå‹µ**ï¼šå³å´è©³æƒ…æœƒé¡¯ç¤ºæ¯å€‹æˆå°±çš„ `bonus` æ•¸å€¼ï¼›æœªè§£éŽ–èˆ‡ hidden é¡¯ç¤º `???` çš„æˆå°±ä¹Ÿé¡¯ç¤ºå¯å–å¾—çŽå‹µï¼ˆv0.1.25.2ï¼‰

---

## æŽ’è¡Œæ¦œç³»çµ±ï¼ˆsystems/leaderboard.jsï¼‰

### showScoreSubmitPopup â€” è¶£å‘³æ¦œåˆ†é¡žç¶­è­·è¦å‰‡ï¼ˆv0.47.0 èµ·ï¼‰

`showScoreSubmitPopup()` å…§éƒ¨çš„ `funCategories` é™£åˆ—å®šç¾©äº†æ‰€æœ‰è¶£å‘³æ¦œåˆ†é¡žçš„æŸ¥è©¢é‚è¼¯ã€‚
**æ¯æ¬¡æ–°å¢žè¶£å‘³æ¦œåˆ†é¡žï¼Œå¿…é ˆåŒæ­¥åœ¨ `funCategories` é™£åˆ—æ–°å¢žå°æ‡‰é …ç›®**ï¼ŒåŒ…å«ï¼š

| æ¬„ä½ | èªªæ˜Ž |
|------|------|
| `label` | é¡¯ç¤ºåç¨±ï¼ˆå« emojiï¼‰ |
| `fetchFn` | å°æ‡‰çš„ fetch å‡½å¼ï¼ˆæŽ¥å— `difficulty` é–‰åŒ…è®Šæ•¸ï¼‰ |
| `colName` | Supabase æ¬„ä½åç¨± |
| `myValue` | æœ¬å±€å°æ‡‰çš„æ•¸å€¼ï¼ˆä¸é©ç”¨æ™‚å¡« `null`ï¼‰ |
| `ascending` | `true` = è¶Šå°è¶Šå¥½ï¼ˆæ™‚é–“é¡žï¼‰ï¼›`false` = è¶Šå¤§è¶Šå¥½ï¼ˆæ•¸é‡é¡žï¼‰ |

### è¶£å‘³æ¦œ Supabase fetch å‡½å¼ä¸€è¦½ï¼ˆconfig/supabase.jsï¼‰

| å‡½å¼ | èªªæ˜Ž |
|------|------|
| `fetchFunSpeedVictory(difficulty)` | æœ€é€Ÿé€šé—œ |
| `fetchFunSpeedDeath(difficulty)` | æœ€é€Ÿæ­»äº¡ |
| `fetchFunGiantKills(difficulty)` | å·¨äººçµäººï¼ˆgiant_kills æœ€å¤šï¼‰ |
| `fetchFunKillerKills(difficulty)` | æ®ºæ‰‹çµäººï¼ˆkiller_kills æœ€å¤šï¼‰ |
| `fetchFunKillerMaxLevel(difficulty)` | æ®ºæ‰‹å…‹æ˜Ÿï¼ˆkiller_max_level æœ€é«˜ï¼‰ |
| `fetchFunBossKillSpeed(difficulty)` | æœ€å¿«æ“Šæ®º Boss |
| `fetchFunMaxLevel(difficulty)` | æœ€é«˜ç­‰ç´š TOP10 |
| `fetchFunHunterKill(difficulty)` | æœ€å¿«æ“Šæ®ºé»‘è‰²çµäººï¼ˆå›°é›£åœ°åœ–ï¼‰ |
| `fetchFunFruitsEaten(difficulty)` | æœ€ä½³æžœçŽ‹ï¼ˆfruits_eaten æœ€å¤šï¼Œv0.1.3.0ï¼‰ |
| `fetchFunNormalKills(difficulty)` | æœ€å¼·çµæˆ¶ï¼ˆnormal_kills æœ€å¤šï¼Œv0.1.3.0ï¼‰ |
| `fetchFunBoneCount(difficulty)` | ç™½éª¨ç²¾ï¼ˆbone_count æœ€å¤šï¼‰ |

### sessionStats æ¬„ä½ï¼ˆgameState.sessionStatsï¼‰

| æ¬„ä½ | èªªæ˜Ž |
|------|------|
| `giantKills` | å–®å±€å·¨äººåŒ–æ“Šæ®ºæ•¸ |
| `killerKills` | å–®å±€æ®ºæ‰‹åŒ–æ“Šæ®ºæ•¸ |
| `killerMaxLevel` | å–®å±€æ“Šæ®ºæœ€é«˜æ®ºæ‰‹ç­‰ç´š |
| `fruitsEaten` | å–®å±€åƒæžœå­ç¸½æ•¸ï¼ˆv0.1.3.0ï¼‰ |
| `normalKills` | å–®å±€æ™®é€šç”Ÿç‰©æ“Šæ®ºæ•¸ï¼ˆè‰é£Ÿ+è‚‰é£Ÿï¼Œä¸å«ç²¾è‹±/Boss/å·¨äºº/æ®ºæ‰‹ï¼Œv0.1.3.0ï¼‰ |

### Submit å‰åæ¬¡é è¦½ï¼ˆv0.54.1ï¼‰

é¢æ¿é–‹å•Ÿæ™‚ç«‹å³ä¸¦è¡ŒæŸ¥è©¢ï¼ˆ`Promise.all`ï¼‰ï¼š
- **ä¸€èˆ¬æ¦œ**ï¼ˆ`_fetchGeneralRank()`ï¼‰ï¼šèˆ‡ç¾æœ‰è¨˜éŒ„é€ç­†æ¯”å° `play_time`ï¼Œå›žå‚³é è¨ˆåæ¬¡ï¼›`null` ä»£è¡¨æ–·ç·š
- **è¶£å‘³æ¦œ**ï¼ˆ`_fetchFunRanks()`ï¼‰ï¼šéæ­· `funCategories`ï¼Œåƒ…é¡¯ç¤ºæŽ’é€² TOP3 çš„åˆ†é¡žï¼›æŸ¥è©¢å¤±æ•—éœé»˜è·³éŽ
- çµæžœé¡¯ç¤ºåœ¨è¼¸å…¥æ¡†**ä¸Šæ–¹** `rankPreview` å€å¡Šï¼›æ–·ç·šæ™‚é¡¯ç¤ºç´…è‰²é€£ç·šç•°å¸¸æç¤º

---

## è§’è‰²ç³»çµ±ï¼ˆv0.56.0ï¼‰

### è§’è‰²å®šç¾©
- ä½ç½®ï¼š`config/characters.js`ï¼Œ`CHARACTERS` å¸¸æ•¸
- æ¬„ä½ï¼š`id, name, nameEn, icon, color, unlocked, stats, startOrgans, startEvolution, specialSkill, isRanged`
- `gameState.selectedCharacter`ï¼šç•¶å‰é¸æ“‡çš„è§’è‰² idï¼ˆé è¨­ `'koel'`ï¼‰ï¼›ç”± `showMapSelect` å¯«å…¥ï¼Œ`initializeGame` å¥—ç”¨

### ç¾æœ‰è§’è‰²
| id | åç¨± | å¤–è§€ | ç‰¹è‰² |
|---|---|---|---|
| koel | å™ªéµ‘ | ç´…è‰²åœ“å½¢ | ç¾æœ‰çŽ©å®¶ï¼ŒF æŠ€é–ƒç¾ |
| archerfish | é˜¿å¥‡çˆ¾ | è—è‰²ä¸‰è§’å½¢ï¼ˆå·¦å³ç¿»è½‰ï¼‰ | é ç¨‹æ”»æ“Šï¼ŒF æŠ€è¡åˆºï¼Œæ°´ä¸­+50% é€Ÿåº¦ |

### è§’è‰²é¸æ“‡ UI
- æ™‚æ©Ÿï¼šé›£åº¦é¸æ“‡å¾Œã€`initializeGame()` å‰
- æ ¼å­ï¼šå™ªéµ‘/é˜¿å¥‡çˆ¾å¯é¸ï¼Œã€Œï¼Ÿå³å°‡æŽ¨å‡ºðŸ”’ã€ä¸å¯é¸
- æ¨£å¼ï¼šé¸ä¸­é»ƒè‰²é‚Šæ¡†ï¼ŒéŽ–å®šç°è‰²
- å¯¦ä½œï¼š`systems/ui.js` `showMapSelect()`

---

## é˜¿å¥‡çˆ¾æ”»æ“Šç³»çµ±ï¼ˆv0.56.0ï¼‰

### Reload å……èƒ½
- ä¸æ”»æ“Šæ™‚æ¯ 1.0 ç§’ï¼ˆå—æ”»é€Ÿå½±éŸ¿ï¼‰+1 æ ¼ï¼Œä¸Šé™ 3 æ ¼
- ä»»ä½•æ”»æ“Šç™¼å‡ºå¾Œï¼šè¨ˆæ™‚å™¨é‡ç½®ï¼Œæ¶ˆè€— 1 æ ¼
- `player.reloadCharges`ï¼ˆ0~3ï¼‰ã€`player.reloadTimer`ï¼ˆmsï¼‰

### å­å½ˆç³»çµ±
- `gameState.projectiles[]`ï¼š`{ x, y, vx, vy, damage, maxRange, distTraveled, radius:5, ownerId:'player', hasCrit }`
- é€Ÿåº¦ 9px/å¹€ï¼Œè¶…å‡º `attackRange Ã— 1.2` æ¶ˆå¤±
- `updateProjectiles()` æ¯å¹€å‘¼å«
- å‘½ä¸­åˆ¤å®šï¼š`_checkProjectileHit()`ï¼Œå‘½ä¸­å¾Œå­å½ˆæ¶ˆå¤±
- å«å˜´å™¨æ¸›é€Ÿã€é¯Šé­šå—…è‘‰å‚·å®³åŠ æˆã€Debuff StartTime è¨˜éŒ„

### æ”»æ“Šç›®æ¨™é¸æ“‡ï¼ˆ`_findArcherAutoTarget`ï¼‰
- P1ï¼šç§»å‹•æ–¹å‘ Â±45Â° æ‰‡å½¢ + æ”»æ“Šç¯„åœå…§ â†’ æœ€è¿‘ç›®æ¨™ï¼ˆè¿Žé¢å„ªå…ˆï¼‰
- P2ï¼šç„¡ P1 ç›®æ¨™ â†’ å…¨å ´æœ€è¿‘ç›®æ¨™
- åŒæ™‚ç”¨æ–¼è¦–è¦ºéŽ–å®šæŒ‡ç¤ºï¼ˆ`_drawArcherLockOn`ï¼‰å’Œå¯¦éš›æ”»æ“Šï¼Œç¢ºä¿ä¸€è‡´

### æ”»æ“Šæ¨¡å¼
- **è‡ªå‹•**ï¼šP1 â†’ P2 â†’ ç©ºå­å½ˆï¼ˆç„¡ç›®æ¨™ï¼‰
- **æ‰‹å‹•é›»è…¦**ï¼šæ»‘é¼ æ–¹å‘ + æŒ‰ä½è“„åŠ›ï¼ˆæœ€å¤š 3 æ ¼ï¼‰ï¼Œæ”¾é–‹ç™¼å°„
- **æ‰‹å‹•æ‰‹æ©Ÿ**ï¼šæ”»æ“Šå€æ”¹ç‚ºæ–¹å‘éˆ•ï¼Œæ‹–å‹•æ±ºå®šæ–¹å‘ï¼Œæ”¾æ‰‹ç™¼å°„

### F æŠ€è¡åˆºï¼ˆarcherfishDashï¼‰
- é™¸åœ° +3 é€Ÿï¼Œæ°´ä¸­ +5 é€Ÿï¼ŒæŒçºŒ 3 ç§’ï¼Œå†·å» 15 ç§’
- è¡åˆºæœŸé–“æ’žæ€ªï¼šæšˆçœ© 0.5 ç§’ + é™„åŠ æ”»æ“Šå‚·å®³ï¼ˆä¸é‡è¤‡æšˆçœ©ï¼‰
- `player.archerDashActive` / `archerDashEnd` / `archerDashSpeed`

---

## éŸŒæ€§å±¬æ€§ï¼ˆv0.56.0ï¼‰
- `player.tenacity`ï¼ˆ0~1ï¼‰ï¼Œç”±é­šé±—å™¨å®˜ç´¯è¨ˆæä¾›ï¼ˆLv1=5%/Lv2=15%/Lv3=30%ï¼‰
- `applyTenacity(durationMs, target)`ï¼šå›žå‚³ `durationMs Ã— (1 - target.tenacity)`
- é©ç”¨æ‰€æœ‰æŽ§åˆ¶æ•ˆæžœæŒçºŒæ™‚é–“ï¼ˆæšˆçœ©/ç¡¬æŽ§/æ¸›é€Ÿï¼‰ï¼Œ**ä¸å½±éŸ¿æ¸›é€Ÿå¹…åº¦**
- ä½ç½®ï¼š`systems/utils.js`

---

## è¦–é‡Žç¸®æ”¾ï¼ˆv0.58.0ï¼Œé‡æ§‹è‡ª v0.56.0 æ‰‹æ©Ÿè¦–é‡Žç¸®æ”¾ï¼‰
- `gameState.cameraZoom`ï¼ˆé è¨­ 1.0ï¼Œæ¡Œæ©Ÿèˆ‡æ‰‹æ©Ÿå‡ç”Ÿæ•ˆï¼‰
- `gameState.settings.cameraZoomLevel`ï¼ˆ1~10ï¼Œæ±ºå®š baseZoomï¼›å…¬å¼ï¼š`baseZoom = level/10 * 0.4 + 0.6`ï¼‰
- `gameState.settings.cameraMode`ï¼ˆ`'smart'` é«”åž‹è‡ªå‹•ç¸®æ”¾ / `'manual'` å›ºå®š baseZoomï¼‰
- æ™ºèƒ½æ¨¡å¼å…¬å¼ï¼š`cameraZoom = max(0.3, baseZoom - increaseRatio * 0.25)`
- `worldToScreen()` / `drawTerrain()`ï¼šzoom æ¢ä»¶ç§»é™¤ `isMobile` é™åˆ¶ï¼Œçµ±ä¸€ä½¿ç”¨ `cameraZoom`
- `_updateCameraZoom()` æ¯å¹€å‘¼å«ï¼ˆ`updateGameLogic` å…§ï¼‰

---

## Boss è¡€æ¢ Debuff åœ–ç¤ºï¼ˆv0.56.0ï¼‰
- `_drawBossDebuffIcons(boss, barX, barY, barW)` â€” åœ¨ `drawBoss()` è¡€æ¢å¾Œå‘¼å«
- é¡è‰²ï¼šæ¯’å‚· `#33FF66` / æµè¡€ `#FF4444` / æ¸›é€Ÿ `#4488FF` / æšˆçœ© `#FFE533`
- æ¯å€‹åœ–ç¤ºï¼šæ·±è‰²èƒŒæ™¯æ–¹å¡Š + å½©è‰²é‚Šæ¡† + ç¸®å¯«æ¨™ç±¤ + é€†æ™‚é‡å‰©é¤˜æ™‚é–“å¼§
- éœ€è¨˜éŒ„ Debuff æ–½åŠ æ™‚é–“ï¼š`boss._poisonStartTime` / `_bleedStartTime` / `_slowStartTime` / `_stunStartTime`
- **æ–½åŠ  Debuff æ™‚å‹™å¿…åŒæ­¥è¨˜éŒ„ StartTime**ï¼ˆcombat.js / player.js æ‰€æœ‰æ–½åŠ é»žï¼‰

---

## CC æ•ˆæžœé–‹ç™¼è¦ç¯„ï¼ˆv0.56.0ï¼‰

> **æ¯æ¬¡åœ¨ç¨‹å¼ä¸­æ–°å¢žæŽ§åˆ¶æ•ˆæžœï¼ˆæšˆçœ©/æ¸›é€Ÿ/ç¡¬æŽ§ï¼‰ï¼Œå¿…é ˆç¢ºèªä»¥ä¸‹æ‰€æœ‰ä½ç½®éƒ½æœ‰å¥—ç”¨ï¼š**

| ä½ç½® | èªªæ˜Ž |
|------|------|
| `updateNeutralCreatures` | ä¸­ç«‹ç”Ÿç‰©ç§»å‹•è·¯å¾‘ |
| `updateHostileCreatures` | æ•µæ„ç”Ÿç‰©ç§»å‹•è·¯å¾‘ |
| `updateEliteCreature` (`elite.js`) | ç²¾è‹±æ€ªç§»å‹•è·¯å¾‘ |
| `updateBoss` (`boss.js`) | Boss ç§»å‹•è·¯å¾‘ |

- æšˆçœ©ï¼šå„æ›´æ–°å‡½å¼é–‹é ­çš„ `stunnedUntil` æª¢æŸ¥ï¼ˆ4 å€‹ä½ç½®ï¼‰
- æ¸›é€Ÿï¼šå„ç§»å‹•å‘¼å«æ”¹ç”¨ `_effSpeed(c)` æˆ–åœ¨ `chaseSpeed`/`wanderSpeed` å¾Œä¹˜ä»¥ `_slowMult`
- æ–° CC é¡žåž‹ï¼šä¾ä¸Šè¿°è¦ç¯„åœ¨ 4 å€‹ä½ç½®åŒæ­¥å¯¦ä½œ

---

## é‡è¦è¨­è¨ˆæ³¨æ„äº‹é …

### handleEliteKill åŸ·è¡Œé †åºï¼ˆv0.15.2 ä¿®å¾©ï¼‰
`showHiddenOrganSelection()` **å¿…é ˆåœ¨** `addXP()` ä¹‹å‰å‘¼å«ï¼Œå¦å‰‡å™¨å®˜é¸æ“‡èˆ‡å‡ç´šç•Œé¢æœƒç–Šå±¤ã€‚

### showHiddenOrganSelection closeOverlay é †åºï¼ˆv0.15.3 ä¿®å¾©ï¼‰
`gameState.organSelectionActive = false` **å¿…é ˆåœ¨** `showOrganSelection()` ä¹‹å‰è¨­å®šï¼Œ
å¦å‰‡é¸æ“‡éš±è—å™¨å®˜å¾Œé—œé–‰ overlay æ™‚éŠæˆ²æœƒçŸ­æš«æ¢å¾©ã€‚

### æ¨¡çµ„è¼‰å…¥æ–¹å¼
å°ˆæ¡ˆä½¿ç”¨ **ES Modules**ï¼Œæ‰€æœ‰æª”æ¡ˆé€éŽ `import`/`export` äº’ç›¸ä¾è³´ï¼Œ`main.js` ç‚ºä¸»è¦å…¥å£ã€‚
è·¨æª”æ¡ˆå‘¼å«å¿…é ˆé€éŽ `import` æ˜Žç¢ºå¼•å…¥ï¼Œä¸å­˜åœ¨å…¨åŸŸä½œç”¨åŸŸè‡ªå‹•å…±äº«ã€‚

### script æ¨™ç±¤ä½ç½®
`main.js` ä»¥ `<script type="module" src="./main.js">` å–®ä¸€æ¨™ç±¤è¼‰å…¥ï¼ˆä½æ–¼ `index.html` body æœ«ç«¯ï¼‰ã€‚
å…¶é¤˜æ‰€æœ‰æª”æ¡ˆé€éŽ ESM `import` å¼•å…¥ï¼Œä¸ä½¿ç”¨ç¨ç«‹ `<script src>` æ¨™ç±¤ã€‚

