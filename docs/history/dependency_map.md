# Dependency Map

> Stage 1 dependency audit. Scope: 37 local JavaScript files loaded by `index.html`; includes files not listed in the older context document: `config/compendium_data.js`, `systems/mobile.js`, `systems/hud.js`, `systems/chat.js`.

## 全域變數依賴表
| 名稱 | 類型 | 定義在 | 被哪些檔案使用 |
|------|------|--------|--------------|
| ARCHER_BULLET_SPEED | const | config/gameConfig.js:24 | systems/player.js |
| ATK_RADIUS | const | systems/mobile.js:137 | （未見跨檔使用） |
| AUDIO_FILES | const | config/gameConfig.js:36 | systems/audio.js |
| AudioManager | const | systems/audio.js:30 | main.js, systems/boss.js, systems/combat.js, systems/daynight.js, systems/elite.js, systems/evolution.js, systems/input.js, systems/mobile.js, systems/player.js, systems/ui.js |
| BIOME_COLOR | const | systems/map.js:148 | systems/hud.js |
| BIOME_CREATURES | const | config/creatures.js:30 | systems/spawning.js |
| BONE_EXPIRE_MS | const | config/gameConfig.js:23 | systems/combat.js |
| BOSS_COLORS | const | systems/boss.js:7 | （未見跨檔使用） |
| BOSS_CONFIG | const | config/creatures.js:45 | config/compendium_data.js, lang.js, systems/boss.js |
| CHARACTERS | const | config/characters.js:6 | main.js, systems/ui.js |
| CHARACTERS_COMING_SOON | const | config/characters.js:55 | systems/ui.js |
| CHAT_IDLE_MS | const | systems/chat.js:71 | （未見跨檔使用） |
| CHAT_POLL_MS | const | systems/chat.js:72 | （未見跨檔使用） |
| COMBOS | const | config/organs.js:221 | lang.js, systems/organs.js, systems/ui.js |
| COMPENDIUM_DATA | const | config/compendium_data.js:9 | systems/ui.js |
| CORPSE_BONE_EAT_TICK | const | config/gameConfig.js:21 | systems/combat.js |
| CORPSE_EAT_HP | const | config/gameConfig.js:20 | systems/combat.js |
| CORPSE_EXPIRE_MS | const | config/gameConfig.js:22 | systems/combat.js |
| CREATURE_COLORS | const | systems/creatures.js:27 | （未見跨檔使用） |
| CREATURE_CONFIG | const | config/creatures.js:6 | （未見跨檔使用） |
| DEFAULT_MUTATION_DATA | const | systems/mutation.js:10 | （未見跨檔使用） |
| DEFAULT_MUTATION_SKILLS | const | systems/mutation.js:405 | （未見跨檔使用） |
| DEFAULT_SETTINGS | const | systems/gameState.js:5 | systems/audio.js, systems/ui.js |
| EASY_MAP | const | map/easymap.js:5 | config/compendium_data.js, main.js, systems/ui.js |
| ELITE_CONFIG | const | config/creatures.js:17 | config/compendium_data.js, lang.js, systems/elite.js |
| EVOLUTION_PATHS | const | config/evolution.js:6 | config/compendium_data.js, lang.js, systems/combat.js, systems/evolution.js, systems/organs.js, systems/player.js, systems/ui.js |
| FIXED_DELTA | const | main.js:7 | systems/creatures.js, systems/hud.js, systems/player.js |
| FIXED_FPS | const | main.js:6 | （未見跨檔使用） |
| GAME_INFO | const | config/gameConfig.js:5 | main.js, systems/boss.js, systems/chat.js, systems/daynight.js, systems/evolution.js, systems/hud.js, systems/leaderboard.js, systems/ui.js |
| GAME_TIMING | const | config/gameConfig.js:13 | （未見跨檔使用） |
| HARD_ELITE_CONFIG | const | config/gameConfig.js:27 | systems/elite.js |
| HARD_MAP | const | map/hardmap.js:5 | config/compendium_data.js, systems/ui.js |
| HIDDEN_ORGANS | const | config/organs.js:198 | lang.js, systems/evolution.js, systems/organs.js, systems/ui.js |
| HUNTER_DIALOGUE | const | systems/boss.js:871 | （未見跨檔使用） |
| JOY_INNER | const | systems/mobile.js:136 | （未見跨檔使用） |
| JOY_OUTER | const | systems/mobile.js:135 | （未見跨檔使用） |
| LANG | const | lang.js:21 | lang/en.js, lang/zh-TW.js, systems/ui.js |
| LANG_LIST | const | lang.js:15 | systems/ui.js |
| MAP_HEIGHT | const | systems/map.js:8 | main.js, systems/boss.js, systems/camera.js, systems/creatures.js, systems/elite.js, systems/hud.js, systems/input.js, systems/player.js, systems/spawning.js, systems/ui.js |
| MAP_RULES | const | systems/map.js:15 | （未見跨檔使用） |
| MAP_WIDTH | const | systems/map.js:7 | main.js, systems/boss.js, systems/camera.js, systems/creatures.js, systems/elite.js, systems/hud.js, systems/input.js, systems/player.js, systems/spawning.js, systems/ui.js |
| MOBILE_GAME_SCALE | const | systems/mobile.js:51 | （未見跨檔使用） |
| MUTATION_COMPENSATION_CONFIG | const | systems/mutation.js:22 | （未見跨檔使用） |
| MUTATION_COMPENSATION_VERSION | const | systems/mutation.js:20 | （未見跨檔使用） |
| NOISE_SCALE | const | systems/map.js:13 | （未見跨檔使用） |
| NORMAL_MAP | const | map/normalmap.js:5 | config/compendium_data.js, main.js, systems/ui.js |
| ORGANS | const | config/organs.js:6 | lang.js, main.js, systems/combat.js, systems/evolution.js, systems/organs.js, systems/player.js, systems/ui.js |
| PATCH_NOTES | const | config/patchnotes.js:8 | systems/ui.js |
| SKILLS | const | config/evolution.js:39 | lang.js, systems/evolution.js, systems/ui.js |
| SUPABASE_KEY | const | config/supabase.js:32 | systems/chat.js |
| SUPABASE_URL | const | config/supabase.js:31 | systems/chat.js |
| TILE_SIZE | const | systems/map.js:12 | main.js, systems/hud.js |
| VIEW_H | let | systems/map.js:10 | systems/boss.js, systems/camera.js, systems/combat.js, systems/creatures.js, systems/elite.js, systems/hud.js, systems/mobile.js, systems/organs.js, systems/player.js |
| VIEW_W | let | systems/map.js:9 | systems/boss.js, systems/camera.js, systems/combat.js, systems/creatures.js, systems/elite.js, systems/hud.js, systems/mobile.js, systems/player.js, systems/tutorial.js |
| _COLOR_MAP | const | systems/chat.js:1428 | （未見跨檔使用） |
| _HUNTER_ELITE_META | const | systems/elite.js:8 | （未見跨檔使用） |
| _HUNTER_ELITE_REWARDS | const | systems/elite.js:22 | （未見跨檔使用） |
| _HUNTER_ELITE_STAR | const | systems/elite.js:17 | （未見跨檔使用） |
| _HYENA_PACK_NAMES | const | systems/creatures.js:18 | （未見跨檔使用） |
| _PACK_NAMES | const | systems/creatures.js:8 | （未見跨檔使用） |
| _SimplexNoise | const | systems/map.js:20 | （未見跨檔使用） |
| _XP_POOL_SIZE | const | systems/player.js:248 | （未見跨檔使用） |
| _addBoneMaterial | function | systems/combat.js:496 | （未見跨檔使用） |
| _alertHyenaPack | function | systems/creatures.js:735 | （未見跨檔使用） |
| _applyCharacterStats | function | main.js:91 | （未見跨檔使用） |
| _applyCrocBiomeBonus | function | systems/creatures.js:677 | （未見跨檔使用） |
| _applyHyenaBiomeBonus | function | systems/creatures.js:722 | （未見跨檔使用） |
| _applyLynxBiomeBonus | function | systems/creatures.js:655 | （未見跨檔使用） |
| _applyMobileScale | function | systems/mobile.js:53 | （未見跨檔使用） |
| _applyRemoteData | function | systems/chat.js:147 | （未見跨檔使用） |
| _archerAttack | function | systems/player.js:193 | systems/combat.js |
| _archerDirCurX | let | systems/mobile.js:147 | （未見跨檔使用） |
| _archerDirCurY | let | systems/mobile.js:148 | （未見跨檔使用） |
| _archerDirStartX | let | systems/mobile.js:145 | （未見跨檔使用） |
| _archerDirStartY | let | systems/mobile.js:146 | （未見跨檔使用） |
| _archerDirTouchId | let | systems/mobile.js:144 | （未見跨檔使用） |
| _atkFeedbackTime | let | systems/mobile.js:139 | （未見跨檔使用） |
| _atkFeedbackX | let | systems/mobile.js:140 | （未見跨檔使用） |
| _atkFeedbackY | let | systems/mobile.js:141 | （未見跨檔使用） |
| _attachJoystickListeners | function | systems/mobile.js:354 | （未見跨檔使用） |
| _attackZone | function | systems/mobile.js:165 | （未見跨檔使用） |
| _buildFogCloudTexture | function | systems/hud.js:60 | （未見跨檔使用） |
| _buildMinimapTerrainCanvas | function | systems/hud.js:430 | （未見跨檔使用） |
| _buildMsgHTML | function | systems/chat.js:1302 | （未見跨檔使用） |
| _buildMsgText | function | systems/chat.js:1313 | （未見跨檔使用） |
| _buildMutLeftColContent | function | systems/evolution.js:782 | （未見跨檔使用） |
| _buildMutRightCol | function | systems/evolution.js:898 | （未見跨檔使用） |
| _buildMutationSkillContent | function | systems/evolution.js:865 | （未見跨檔使用） |
| _buildSettingsSection | function | systems/ui.js:209 | （未見跨檔使用） |
| _calcProgressScore | function | systems/chat.js:121 | （未見跨檔使用） |
| _carnivoreEatCorpse | function | systems/creatures.js:400 | （未見跨檔使用） |
| _chatChannel | let | systems/chat.js:64 | （未見跨檔使用） |
| _chatDragState | const | systems/chat.js:75 | （未見跨檔使用） |
| _chatExpanded | let | systems/chat.js:77 | systems/input.js |
| _chatIdleTimer | let | systems/chat.js:66 | （未見跨檔使用） |
| _chatLastFetchTime | let | systems/chat.js:69 | （未見跨檔使用） |
| _chatMessages | let | systems/chat.js:67 | （未見跨檔使用） |
| _chatPollTimer | let | systems/chat.js:65 | （未見跨檔使用） |
| _checkAndRepairMutationSkills | function / window property（重複定義） | systems/mutation.js:471, systems/mutation.js:509 | （未見跨檔使用） |
| _checkGiantFleeCondition | function | systems/creatures.js:558 | （未見跨檔使用） |
| _checkGuardianRange | function | systems/creatures.js:512 | （未見跨檔使用） |
| _checkPoisonSacUpgrade | function | systems/combat.js:503 | （未見跨檔使用） |
| _checkProjectileHit | function | systems/player.js:50 | （未見跨檔使用） |
| _collapseChat | function | systems/chat.js:691 | systems/input.js |
| _collectFruit | function | systems/player.js:266 | （未見跨檔使用） |
| _collectLocalData | function | systems/chat.js:133 | （未見跨檔使用） |
| _compendiumBtnRegion | let | systems/organs.js:481 | main.js |
| _compendiumPaused | let | systems/ui.js:1060 | （未見跨檔使用） |
| _dashZone | function | systems/mobile.js:175 | （未見跨檔使用） |
| _deleteOldMessages | async function | systems/chat.js:348 | （未見跨檔使用） |
| _detachJoystickListeners | function | systems/mobile.js:546 | （未見跨檔使用） |
| _diffKey | function | systems/leaderboard.js:22 | systems/ui.js |
| _drawArcherChargeVisual | function | systems/hud.js:258 | （未見跨檔使用） |
| _drawArcherLockOn | function | systems/hud.js:309 | （未見跨檔使用） |
| _drawArcherfish | function | systems/hud.js:91 | （未見跨檔使用） |
| _drawBear | function | systems/boss.js:62 | （未見跨檔使用） |
| _drawBeetle | function | systems/creatures.js:134 | （未見跨檔使用） |
| _drawBossDebuffIcons | function | systems/boss.js:768 | （未見跨檔使用） |
| _drawCamel | function | systems/creatures.js:198 | （未見跨檔使用） |
| _drawCompendiumBtn | function | systems/organs.js:466 | （未見跨檔使用） |
| _drawCreatureGlow | function | systems/creatures.js:52 | （未見跨檔使用） |
| _drawCroc | function | systems/creatures.js:166 | （未見跨檔使用） |
| _drawDirectionArrow | function | systems/creatures.js:367 | （未見跨檔使用） |
| _drawHpHearts | function | systems/hud.js:1263 | （未見跨檔使用） |
| _drawHunter | function | systems/boss.js:425 | （未見跨檔使用） |
| _drawHunterAimingWarning | function | systems/boss.js:634 | （未見跨檔使用） |
| _drawHunterElite | function | systems/elite.js:407 | （未見跨檔使用） |
| _drawHyena | function | systems/creatures.js:275 | （未見跨檔使用） |
| _drawLynx | function | systems/creatures.js:234 | （未見跨檔使用） |
| _drawMinimapEntities | function | systems/hud.js:447 | （未見跨檔使用） |
| _drawMinimapFog | function | systems/hud.js:378 | （未見跨檔使用） |
| _drawMoose | function | systems/creatures.js:88 | （未見跨檔使用） |
| _drawSandStormOverlay | function | systems/boss.js:599 | systems/hud.js |
| _drawScorp | function | systems/boss.js:289 | （未見跨檔使用） |
| _drawShark | function | systems/boss.js:216 | （未見跨檔使用） |
| _drawSharkChargeArrow | function | systems/boss.js:505 | （未見跨檔使用） |
| _drawSunMoonIndicator | function | systems/hud.js:599 | （未見跨檔使用） |
| _drawVenomEffects | function | systems/boss.js:557 | （未見跨檔使用） |
| _drawVenomFalconEffects | function | systems/hud.js:145 | （未見跨檔使用） |
| _effSpeed | function | systems/creatures.js:46 | systems/boss.js, systems/elite.js |
| _effectiveMobile | function | systems/mobile.js:36 | systems/ui.js |
| _esc | function | systems/chat.js:1417 | systems/ui.js |
| _escH | function | systems/ui.js:58 | （未見跨檔使用） |
| _expandChat | function | systems/chat.js:675 | （未見跨檔使用） |
| _findArcherAutoTarget | function | systems/player.js:130 | systems/hud.js |
| _findNearestBiomePoint | function | systems/creatures.js:633 | （未見跨檔使用） |
| _fireEliteFalconProjectile | function | systems/elite.js:186 | （未見跨檔使用） |
| _fireHunterShotgun | function | systems/boss.js:1151 | （未見跨檔使用） |
| _fireHunterSniper | function | systems/boss.js:1135 | （未見跨檔使用） |
| _fireVenomFalconShot | function | systems/elite.js:205 | （未見跨檔使用） |
| _fogCloudCanvas | let | systems/hud.js:51 | （未見跨檔使用） |
| _fontCacheMap | let | systems/utils.js:9 | （未見跨檔使用） |
| _fontCacheOn | let | systems/utils.js:8 | （未見跨檔使用） |
| _formatChatTime | function | systems/chat.js:1288 | （未見跨檔使用） |
| _getAllAttackTargets | function | systems/player.js:120 | （未見跨檔使用） |
| _getArcherShootDir | function | systems/player.js:162 | main.js, systems/input.js |
| _getAttackBtnPos | function | systems/mobile.js:157 | （未見跨檔使用） |
| _getCreatureColor | function | systems/creatures.js:41 | （未見跨檔使用） |
| _getCreatureDisplayName | function | systems/creatures.js:617 | systems/hud.js |
| _getGuideStoryPages | function | systems/ui.js:2646 | （未見跨檔使用） |
| _getHunterEliteType | function | systems/elite.js:51 | （未見跨檔使用） |
| _getHyenaPackBonus | function | systems/creatures.js:713 | （未見跨檔使用） |
| _getPackLimit | function | systems/creatures.js:545 | （未見跨檔使用） |
| _getTotalCorpseXP | function | systems/combat.js:370 | （未見跨檔使用） |
| _grantPoisonSac | function | systems/evolution.js:67 | （未見跨檔使用） |
| _guideKeyHandler | let | systems/ui.js:883 | （未見跨檔使用） |
| _handleHunterEliteKill | function | systems/elite.js:167 | systems/organs.js |
| _handlePinCommand | async function | systems/chat.js:477 | （未見跨檔使用） |
| _handleUnpinCommand | async function | systems/chat.js:515 | （未見跨檔使用） |
| _hasGiantizedNearby | function | systems/creatures.js:389 | （未見跨檔使用） |
| _heartPath | function | systems/hud.js:1252 | （未見跨檔使用） |
| _hyenaPackNameMap | let | systems/creatures.js:24 | main.js |
| _initTopLeftUI | function | systems/hud.js:1297 | （未見跨檔使用） |
| _initXpPool | function | systems/player.js:252 | main.js |
| _introThemeAudio | let | systems/audio.js:6 | （未見跨檔使用） |
| _isAtBottom | function | systems/chat.js:1282 | （未見跨檔使用） |
| _isInHomeBiome | function | systems/creatures.js:627 | （未見跨檔使用） |
| _joyActive | let | systems/mobile.js:129 | （未見跨檔使用） |
| _joyBaseX | let | systems/mobile.js:131 | （未見跨檔使用） |
| _joyBaseY | let | systems/mobile.js:132 | （未見跨檔使用） |
| _joyDocListeners | let | systems/mobile.js:345 | （未見跨檔使用） |
| _joyKnobX | let | systems/mobile.js:133 | （未見跨檔使用） |
| _joyKnobY | let | systems/mobile.js:134 | （未見跨檔使用） |
| _joyPaused | function | systems/mobile.js:347 | main.js, systems/player.js |
| _joyTouchId | let | systems/mobile.js:130 | （未見跨檔使用） |
| _joyZone | function | systems/mobile.js:153 | （未見跨檔使用） |
| _keyDisplay | function | systems/ui.js:203 | （未見跨檔使用） |
| _langPack | function | lang.js:27 | （未見跨檔使用） |
| _lastMinimapSize | let | systems/ui.js:21 | （未見跨檔使用） |
| _lbDifficulty | let | systems/leaderboard.js:19 | systems/ui.js |
| _loadChatPosition | function | systems/chat.js:87 | （未見跨檔使用） |
| _lvColor | function | systems/chat.js:1385 | （未見跨檔使用） |
| _makeCarnCreature | function | systems/spawning.js:84 | （未見跨檔使用） |
| _makeDraggable | function | systems/chat.js:589 | （未見跨檔使用） |
| _makeHerbCreature | function | systems/spawning.js:49 | （未見跨檔使用） |
| _minimapAlpha | let | systems/hud.js:52 | （未見跨檔使用） |
| _minimapCanvas | let | systems/hud.js:42 | （未見跨檔使用） |
| _minimapCtx | let | systems/hud.js:43 | （未見跨檔使用） |
| _minimapFadeTimer | let | systems/hud.js:53 | （未見跨檔使用） |
| _minimapFogCanvas | let | systems/hud.js:46 | （未見跨檔使用） |
| _minimapFogCtx | let | systems/hud.js:47 | （未見跨檔使用） |
| _minimapFogImageData | let | systems/hud.js:48 | （未見跨檔使用） |
| _minimapFogRenderCanvas | let | systems/hud.js:49 | （未見跨檔使用） |
| _minimapFogRenderCtx | let | systems/hud.js:50 | （未見跨檔使用） |
| _minimapStopTimer | let | systems/hud.js:54 | （未見跨檔使用） |
| _minimapTerrainCanvas | let | systems/hud.js:40 | （未見跨檔使用） |
| _minimapTerrainSeed | let | systems/hud.js:41 | （未見跨檔使用） |
| _mmSize | function | systems/hud.js:372 | （未見跨檔使用） |
| _mobileAtkTouchId | let | systems/mobile.js:151 | （未見跨檔使用） |
| _moveTooltip | function | systems/ui.js:46 | （未見跨檔使用） |
| _onViewportResize | function | systems/chat.js:705 | （未見跨檔使用） |
| _organHitRegions | let | systems/ui.js:19 | main.js, systems/mobile.js, systems/organs.js |
| _orientationBarDismissed | let | systems/mobile.js:26 | （未見跨檔使用） |
| _parseColorTags | function | systems/chat.js:1435 | （未見跨檔使用） |
| _parseName | function | systems/chat.js:1398 | （未見跨檔使用） |
| _pinnedMessage | let | systems/chat.js:68 | （未見跨檔使用） |
| _pollNewMessages | async function | systems/chat.js:390 | （未見跨檔使用） |
| _randomPointInBiome | function | systems/spawning.js:38 | （未見跨檔使用） |
| _rebindBlink | let | systems/input.js:8 | systems/ui.js |
| _rebindTimeout | let | systems/input.js:9 | systems/ui.js |
| _recordBossKill | function | systems/boss.js:1374 | （未見跨檔使用） |
| _recordClearStats | function | systems/boss.js:1365 | （未見跨檔使用） |
| _refreshMutContentLeft | function | systems/evolution.js:857 | （未見跨檔使用） |
| _refreshMutContentRight | function | systems/evolution.js:939 | （未見跨檔使用） |
| _renderChatSettingsPanel | function | systems/chat.js:715 | （未見跨檔使用） |
| _renderMobileOverlay | function | systems/mobile.js:194 | systems/hud.js |
| _resetIdleTimer | function | systems/chat.js:422 | （未見跨檔使用） |
| _saveChatPosition | function | systems/chat.js:83 | （未見跨檔使用） |
| _saveMutationSkills | function | systems/mutation.js:440 | systems/evolution.js |
| _sbClient | let | systems/chat.js:48 | （未見跨檔使用） |
| _setFangLevel | function | systems/evolution.js:105 | （未見跨檔使用） |
| _setViewSize | function | systems/mobile.js:42 | （未見跨檔使用） |
| _settingsKeyHandler | let | systems/input.js:6 | systems/ui.js |
| _settingsMouseHandler | let | systems/input.js:7 | systems/ui.js |
| _sha256 | async function | systems/chat.js:34 | （未見跨檔使用） |
| _shouldFleeFromGiant | function | systems/creatures.js:646 | （未見跨檔使用） |
| _showHunterDialogue | function | systems/boss.js:881 | （未見跨檔使用） |
| _skillTreeFromHome | let | systems/input.js:10 | systems/evolution.js, systems/ui.js |
| _skillTreeMode | let | systems/input.js:11 | systems/evolution.js |
| _spawnBone | function | systems/combat.js:380 | systems/utils.js |
| _spawnHunterBoss | function | systems/boss.js:900 | （未見跨檔使用） |
| _spawnHunterElite | function | systems/elite.js:55 | （未見跨檔使用） |
| _subscribeChat | function | systems/chat.js:366 | （未見跨檔使用） |
| _sunmoonCanvas | let | systems/hud.js:44 | （未見跨檔使用） |
| _sunmoonCtx | let | systems/hud.js:45 | （未見跨檔使用） |
| _syncMutationSkillPoints | function | systems/mutation.js:448 | systems/evolution.js |
| _terrainCanvas | let | systems/map.js:150 | （未見跨檔使用） |
| _top10Difficulty | let | systems/leaderboard.js:20 | systems/ui.js |
| _triggerAlpha | function | systems/creatures.js:497 | （未見跨檔使用） |
| _triggerGiantization | function | systems/creatures.js:461 | （未見跨檔使用） |
| _triggerHunterPhaseCheck | function | systems/boss.js:943 | （未見跨檔使用） |
| _triggerKiller | function | systems/creatures.js:451 | （未見跨檔使用） |
| _ttEl | const | systems/ui.js:22 | （未見跨檔使用） |
| _updateCameraZoom | function | systems/camera.js:41 | main.js, systems/ui.js |
| _updateEliteVenomPuddle | function | systems/elite.js:224 | （未見跨檔使用） |
| _updateGiantFlee | function | systems/creatures.js:584 | （未見跨檔使用） |
| _updateHunterBoss | function | systems/boss.js:1003 | （未見跨檔使用） |
| _updateHunterEliteChase | function | systems/elite.js:322 | （未見跨檔使用） |
| _updateHyenaPack | function | systems/creatures.js:688 | （未見跨檔使用） |
| _updateJoystickCanvas | function | systems/mobile.js:556 | （未見跨檔使用） |
| _updateMouseWorld | function | systems/input.js:109 | main.js |
| _updateOrientationBar | function | systems/mobile.js:105 | （未見跨檔使用） |
| _upgradeMutationSkill | function | systems/evolution.js:944 | （未見跨檔使用） |
| _usedHyenaPackNames | let | systems/creatures.js:23 | main.js |
| _usedPackNames | let | systems/creatures.js:13 | （未見跨檔使用） |
| _wasPaused | let | main.js:10 | （未見跨檔使用） |
| _xpPoolReady | let | systems/player.js:250 | （未見跨檔使用） |
| _xpPopupPool | let | systems/player.js:249 | （未見跨檔使用） |
| accumulator | let | main.js:8 | （未見跨檔使用） |
| addMutationPoints | function（重複定義） | systems/combat.js:66, systems/mutation.js:74 | （未見跨檔使用） |
| addXP | function | systems/player.js:620 | systems/boss.js, systems/combat.js, systems/organs.js, systems/ui.js |
| applyAllMutationBonuses | function | systems/mutation.js:159 | main.js |
| applyDamageToPlayer | function | systems/combat.js:26 | systems/boss.js, systems/creatures.js, systems/elite.js, systems/player.js |
| applyDayTransition | function | systems/daynight.js:28 | （未見跨檔使用） |
| applyDeviceMode | function | systems/mobile.js:96 | systems/evolution.js, systems/leaderboard.js, systems/ui.js |
| applyEvolutionEffects | function | systems/evolution.js:72 | main.js |
| applyEvolutionLevelEffect | function | systems/evolution.js:24 | systems/organs.js |
| applyHiddenOrganEffects | function | systems/organs.js:53 | systems/evolution.js |
| applyLanguage | function | lang.js:31 | systems/ui.js |
| applyMutationEffects | function | systems/mutation.js:145 | systems/organs.js |
| applyNightTransition | function | systems/daynight.js:11 | （未見跨檔使用） |
| applyOrganEffects | function | systems/organs.js:73 | main.js, systems/combat.js, systems/evolution.js |
| applySkillBonuses | function | systems/evolution.js:158 | main.js |
| applyTenacity | function | systems/utils.js:27 | systems/combat.js, systems/creatures.js, systems/player.js |
| buildChatUI | function | systems/chat.js:881 | systems/ui.js |
| buildEvoLevelDesc | function | systems/ui.js:1070 | （未見跨檔使用） |
| buildSkillTreeOverlay | function | systems/evolution.js:279 | systems/boss.js, systems/mutation.js, systems/ui.js |
| buildTerrainCanvas | function | systems/map.js:360 | （未見跨檔使用） |
| canvas | const | systems/gameState.js:149 | main.js, systems/hud.js, systems/tutorial.js |
| chatLogin | async function | systems/chat.js:155 | （未見跨檔使用） |
| chatLogout | function | systems/chat.js:298 | （未見跨檔使用） |
| chatSaveProgress | async function | systems/chat.js:234 | systems/boss.js, systems/daynight.js |
| chatSyncData | async function | systems/chat.js:254 | （未見跨檔使用） |
| checkComboEffects | function | systems/organs.js:29 | （未見跨檔使用） |
| checkEvolutionUnlock | function | systems/evolution.js:8 | systems/organs.js |
| checkFruitCollision | function | systems/player.js:494 | main.js |
| checkLevelUp | function | systems/player.js:629 | （未見跨檔使用） |
| checkMutationCompensation | function | systems/mutation.js:180 | （未見跨檔使用） |
| checkOrganUpgrade | function | systems/organs.js:121 | （未見跨檔使用） |
| checkPatchNotesPopup | function | systems/ui.js:2383 | （未見跨檔使用） |
| checkTreasureCollision | function | systems/player.js:557 | main.js |
| checkXPMilestone | function | systems/player.js:613 | （未見跨檔使用） |
| ctx | const | systems/gameState.js:150 | systems/boss.js, systems/combat.js, systems/creatures.js, systems/elite.js, systems/hud.js, systems/map.js, systems/organs.js, systems/tutorial.js, systems/utils.js |
| detectMobile | function | systems/mobile.js:28 | （未見跨檔使用） |
| devAddHP | function | systems/ui.js:804 | （未見跨檔使用） |
| devAddXP | function | systems/ui.js:800 | （未見跨檔使用） |
| devFastForward | function | systems/ui.js:862 | （未見跨檔使用） |
| devFullHP | function | systems/ui.js:808 | （未見跨檔使用） |
| devKillHostiles | function | systems/ui.js:816 | （未見跨檔使用） |
| devRewind | function | systems/ui.js:867 | （未見跨檔使用） |
| devSpawnFruits | function | systems/ui.js:812 | （未見跨檔使用） |
| devSpawnHostile | function | systems/ui.js:843 | （未見跨檔使用） |
| devSpawnNeutral | function | systems/ui.js:826 | （未見跨檔使用） |
| devToggleDayNight | function | systems/ui.js:872 | （未見跨檔使用） |
| disconnectChat | function | systems/chat.js:409 | main.js |
| drawArrow | function | systems/utils.js:34 | systems/boss.js, systems/elite.js |
| drawBones | function | systems/combat.js:539 | systems/hud.js |
| drawBoss | function | systems/boss.js:683 | systems/hud.js |
| drawBossArrow | function | systems/boss.js:1508 | systems/hud.js |
| drawBossShape | function | systems/boss.js:47 | （未見跨檔使用） |
| drawCorpseEatingBars | function | systems/combat.js:521 | systems/hud.js |
| drawCorpses | function | systems/creatures.js:1620 | systems/hud.js |
| drawCreatureShape | function | systems/creatures.js:302 | （未見跨檔使用） |
| drawEliteArrow | function | systems/elite.js:483 | systems/hud.js |
| drawEliteCreature | function | systems/elite.js:384 | systems/hud.js |
| drawGame | function | systems/hud.js:810 | main.js |
| drawGlowEffect | function | systems/utils.js:79 | systems/elite.js |
| drawHealthBar | function | systems/utils.js:55 | systems/elite.js |
| drawHostileCreatures | function | systems/creatures.js:1631 | systems/hud.js |
| drawMinimap | function | systems/hud.js:521 | （未見跨檔使用） |
| drawNameTag | function | systems/utils.js:64 | systems/elite.js |
| drawNeutralCreatures | function | systems/creatures.js:1152 | systems/hud.js |
| drawOrganUI | function | systems/organs.js:323 | systems/hud.js |
| drawProjectiles | function | systems/hud.js:205 | （未見跨檔使用） |
| drawTerrain | function | systems/map.js:399 | systems/hud.js |
| drawTopBarUI | function | systems/hud.js:655 | （未見跨檔使用） |
| drawTreasures | function | systems/hud.js:1462 | （未見跨檔使用） |
| ensureRequiredBiomes | function | systems/map.js:293 | （未見跨檔使用） |
| fetchAvailableDifficulties | async function | config/supabase.js:180 | systems/leaderboard.js |
| fetchDefeatRecords | async function | config/supabase.js:76 | systems/leaderboard.js |
| fetchFunBossKillSpeed | async function | config/supabase.js:134 | systems/leaderboard.js |
| fetchFunFruitsEaten | async function | config/supabase.js:161 | systems/leaderboard.js |
| fetchFunGiantKills | async function | config/supabase.js:110 | systems/leaderboard.js |
| fetchFunHunterKill | async function | config/supabase.js:154 | systems/leaderboard.js |
| fetchFunKillerKills | async function | config/supabase.js:118 | systems/leaderboard.js |
| fetchFunKillerMaxLevel | async function | config/supabase.js:126 | systems/leaderboard.js |
| fetchFunMaxLevel | async function | config/supabase.js:144 | systems/leaderboard.js |
| fetchFunNormalKills | async function | config/supabase.js:170 | systems/leaderboard.js |
| fetchFunSpeedDeath | async function | config/supabase.js:102 | systems/leaderboard.js |
| fetchFunSpeedVictory | async function | config/supabase.js:94 | systems/leaderboard.js |
| fetchTop10 | async function | config/supabase.js:84 | systems/ui.js |
| fetchVictoryRecords | async function | config/supabase.js:68 | systems/leaderboard.js |
| findBestPerceptionPath | function | systems/player.js:645 | systems/hud.js |
| gameLoop | function | main.js:62 | （未見跨檔使用） |
| gameState | const | systems/gameState.js:20 | config/supabase.js, lang.js, main.js, systems/audio.js, systems/boss.js, systems/camera.js, systems/chat.js, systems/combat.js, systems/creatures.js, systems/daynight.js, systems/elite.js, systems/evolution.js, systems/hud.js, systems/input.js, systems/leaderboard.js, systems/map.js, systems/mobile.js, systems/mutation.js, systems/organs.js, systems/player.js, systems/spawning.js, systems/tutorial.js, systems/ui.js, systems/utils.js |
| generateTerrain | function | systems/map.js:304 | main.js |
| generateTrees | function | systems/map.js:461 | main.js |
| getBgColor | function | systems/map.js:167 | （未見跨檔使用） |
| getBiome | function | systems/map.js:153 | systems/boss.js, systems/creatures.js, systems/hud.js, systems/player.js, systems/spawning.js |
| getComboHint | function | systems/organs.js:20 | main.js |
| getDayNightPhaseIndex | function | systems/daynight.js:6 | systems/ui.js |
| getGameFont | function | systems/utils.js:11 | systems/creatures.js, systems/hud.js |
| getMutationUpgradeCost | function | systems/mutation.js:91 | systems/evolution.js |
| getOrganCumulative | function | systems/organs.js:14 | systems/combat.js |
| getOrganDisplayName | function | systems/ui.js:1062 | （未見跨檔使用） |
| getOrganLevel | function | systems/organs.js:9 | systems/combat.js, systems/player.js |
| getOrganSlotsUsed | function | systems/organs.js:47 | （未見跨檔使用） |
| getOrientation | function | systems/mobile.js:32 | （未見跨檔使用） |
| handleBossKill | function | systems/boss.js:967 | systems/combat.js, systems/player.js |
| handleEliteKill | function | systems/organs.js:483 | systems/combat.js, systems/player.js |
| handleGiantKill | function | systems/combat.js:71 | systems/player.js |
| handleKeyDown | function | systems/input.js:13 | main.js |
| handleKeyUp | function | systems/input.js:66 | main.js |
| handleKill | function | systems/combat.js:146 | systems/creatures.js, systems/player.js |
| handleKillerKill | function | systems/combat.js:110 | （未見跨檔使用） |
| handleTutorialStumpKill | window property | systems/tutorial.js:635 | systems/combat.js, systems/player.js |
| hideChat | function | systems/chat.js:580 | main.js, systems/ui.js |
| hideGuide | function | systems/ui.js:1047 | （未見跨檔使用） |
| hideSettings | function | systems/ui.js:754 | systems/input.js |
| hideTooltip | function | systems/ui.js:42 | main.js, systems/evolution.js, systems/mobile.js, systems/organs.js |
| initAudio | function | systems/audio.js:124 | main.js |
| initChat | async function | systems/chat.js:312 | systems/ui.js |
| initEliteOrder | function | systems/elite.js:28 | main.js |
| initMutationData | function | systems/mutation.js:35 | main.js |
| initMutationSkills | function | systems/mutation.js:412 | systems/evolution.js |
| initializeGame | function | main.js:147 | systems/evolution.js, systems/ui.js |
| isGamePaused | function | main.js:25 | （未見跨檔使用） |
| isVipPlayer | function | systems/chat.js:1458 | （未見跨檔使用） |
| labelBiomeRegions | function | systems/map.js:180 | （未見跨檔使用） |
| lastTimestamp | let | main.js:9 | （未見跨檔使用） |
| loadChatSettings | function | systems/chat.js:98 | systems/boss.js, systems/daynight.js |
| loadSavedOrgans | function / window property（重複定義） | systems/evolution.js:129, systems/evolution.js:156 | main.js |
| loadSettings | function | systems/ui.js:95 | main.js |
| mergeSmallRegions | function | systems/map.js:214 | （未見跨檔使用） |
| moveCreature | function | systems/spawning.js:161 | systems/boss.js, systems/creatures.js, systems/elite.js |
| onload | window property | main.js:419 | （未見跨檔使用） |
| pausePlayTimer | function | main.js:12 | systems/boss.js, systems/evolution.js, systems/organs.js, systems/tutorial.js |
| playIntroTheme | function | systems/audio.js:8 | systems/ui.js |
| playerAttack | function | systems/combat.js:160 | main.js, systems/input.js, systems/mobile.js |
| playerDash | function | systems/player.js:288 | systems/input.js, systems/mobile.js |
| renderChat | function | systems/chat.js:1319 | （未見跨檔使用） |
| resetPackNames | function | systems/creatures.js:15 | main.js |
| resumePlayTimer | function | main.js:20 | systems/organs.js, systems/tutorial.js |
| saveChatSettings | function | systems/chat.js:113 | （未見跨檔使用） |
| saveLastRunOrgans | function | systems/evolution.js:178 | systems/boss.js, systems/ui.js |
| saveMutationData | function | systems/mutation.js:62 | systems/evolution.js |
| saveSettings | function | systems/ui.js:199 | systems/boss.js, systems/evolution.js, systems/input.js |
| sendChatMessage | async function | systems/chat.js:427 | （未見跨檔使用） |
| showAlphaAnnouncement | function | systems/ui.js:71 | systems/creatures.js |
| showChat | function | systems/chat.js:573 | systems/evolution.js, systems/leaderboard.js, systems/ui.js |
| showCompendium | function | systems/ui.js:1129 | main.js |
| showFloatingText | function | systems/combat.js:9 | systems/boss.js, systems/creatures.js, systems/elite.js, systems/mutation.js, systems/player.js |
| showFunLeaderboard | function | systems/leaderboard.js:518 | （未見跨檔使用） |
| showGameOver | function | systems/daynight.js:56 | （未見跨檔使用） |
| showGuide | function | systems/ui.js:885 | （未見跨檔使用） |
| showGuideStory | function | systems/ui.js:2393 | main.js |
| showHiddenOrganSelection | function | systems/organs.js:542 | （未見跨檔使用） |
| showLeaderboard | function | systems/leaderboard.js:24 | systems/ui.js |
| showMapSelect | function | systems/ui.js:1718 | （未見跨檔使用） |
| showMutationPanel | function | systems/mutation.js:220 | systems/hud.js |
| showOrganSelection | function | systems/organs.js:130 | systems/player.js |
| showPatchNotes | function | systems/ui.js:2188 | （未見跨檔使用） |
| showScoreSubmitPopup | function | systems/leaderboard.js:227 | systems/boss.js, systems/daynight.js, systems/evolution.js |
| showSettings | function | systems/ui.js:219 | systems/hud.js, systems/input.js |
| showSkillTree | function | systems/evolution.js:187 | systems/combat.js, systems/ui.js |
| showSplashScreen | function | systems/ui.js:2140 | main.js |
| showStartScreen | function | systems/ui.js:1858 | （未見跨檔使用） |
| showTooltip | function | systems/ui.js:27 | main.js, systems/evolution.js, systems/mobile.js, systems/organs.js |
| showTutorial | window property | systems/tutorial.js:633 | main.js |
| showVictory | function | systems/boss.js:1379 | （未見跨檔使用） |
| showXPPopup | function | systems/player.js:530 | systems/combat.js, systems/organs.js |
| spawnBiomeCreatures | function | systems/spawning.js:136 | main.js |
| spawnBoss | function | systems/boss.js:820 | systems/daynight.js |
| spawnCreatureAtEdgeBiome | function | systems/spawning.js:175 | （未見跨檔使用） |
| spawnEliteCreature | function | systems/elite.js:125 | systems/daynight.js |
| spawnFruit | function | systems/spawning.js:31 | systems/ui.js |
| spawnFruitFromTree | function | systems/spawning.js:9 | main.js, systems/player.js |
| spawnLootCircle | function | systems/utils.js:99 | systems/combat.js, systems/organs.js |
| spawnTreasure | function | systems/spawning.js:166 | （未見跨檔使用） |
| spawnTutorialStump | window property | systems/tutorial.js:634 | systems/organs.js |
| stopIntroTheme | function | systems/audio.js:23 | main.js |
| submitScore | async function | config/supabase.js:58 | systems/leaderboard.js |
| supabaseQuery | async function | config/supabase.js:34 | systems/chat.js |
| switchLanguage | function | systems/ui.js:166 | （未見跨檔使用） |
| t | function | lang.js:70 | systems/boss.js, systems/chat.js, systems/combat.js, systems/creatures.js, systems/daynight.js, systems/elite.js, systems/evolution.js, systems/hud.js, systems/leaderboard.js, systems/map.js, systems/mobile.js, systems/mutation.js, systems/organs.js, systems/player.js, systems/ui.js, systems/utils.js |
| toggleDevMode | function | systems/ui.js:793 | systems/input.js |
| updateBoneEating | function | systems/combat.js:445 | main.js |
| updateBoss | function | systems/boss.js:1172 | main.js |
| updateCamera | function | systems/camera.js:65 | main.js |
| updateCorpseEating | function | systems/combat.js:384 | main.js |
| updateCreatureSpawning | function | systems/spawning.js:188 | main.js |
| updateDayNightCycle | function | systems/daynight.js:44 | main.js, systems/organs.js |
| updateEliteCreature | function | systems/elite.js:250 | main.js |
| updateGameLogic | function | main.js:31 | （未見跨檔使用） |
| updateHostileCreatures | function | systems/creatures.js:1231 | main.js |
| updateMinimapFog | function | systems/hud.js:354 | main.js |
| updateNeutralCreatures | function | systems/creatures.js:747 | main.js |
| updatePassiveOrgans | function | systems/player.js:569 | main.js |
| updatePlayerMovement | function | systems/player.js:374 | main.js |
| updateProjectiles | function | systems/player.js:15 | main.js |
| updateStatusEffects | function | systems/combat.js:312 | main.js |
| updateTimer | function | systems/ui.js:772 | main.js |
| updateTreeFruitProduction | function | systems/player.js:510 | main.js |
| updateUI | function | systems/hud.js:1391 | main.js |
| upgradeMutation | function | systems/mutation.js:101 | systems/evolution.js |
| upgradeSkill | function | systems/evolution.js:767 | （未見跨檔使用） |
| verifyGM | async function | systems/chat.js:540 | （未見跨檔使用） |
| worldToScreen | function | systems/camera.js:23 | systems/boss.js, systems/combat.js, systems/creatures.js, systems/elite.js, systems/hud.js, systems/player.js, systems/tutorial.js |
| wrappedDelta | function | systems/camera.js:13 | systems/boss.js, systems/creatures.js, systems/elite.js, systems/player.js, systems/utils.js |
| wrappedDistance | function | systems/camera.js:5 | systems/boss.js, systems/combat.js, systems/creatures.js, systems/hud.js, systems/player.js, systems/tutorial.js |

## 檔案別全域定義與跨檔使用
| 檔案 | 定義 | 使用其他檔案的全域名稱 |
|------|------|----------------------|
| config/gameConfig.js | GAME_INFO (const), GAME_TIMING (const), CORPSE_EAT_HP (const), CORPSE_BONE_EAT_TICK (const), CORPSE_EXPIRE_MS (const), BONE_EXPIRE_MS (const), ARCHER_BULLET_SPEED (const), HARD_ELITE_CONFIG (const), AUDIO_FILES (const) | （未見跨檔使用） |
| config/patchnotes.js | PATCH_NOTES (const) | （未見跨檔使用） |
| config/supabase.js | SUPABASE_URL (const), SUPABASE_KEY (const), supabaseQuery (async function), submitScore (async function), fetchVictoryRecords (async function), fetchDefeatRecords (async function), fetchTop10 (async function), fetchFunSpeedVictory (async function), fetchFunSpeedDeath (async function), fetchFunGiantKills (async function), fetchFunKillerKills (async function), fetchFunKillerMaxLevel (async function), fetchFunBossKillSpeed (async function), fetchFunMaxLevel (async function), fetchFunHunterKill (async function), fetchFunFruitsEaten (async function), fetchFunNormalKills (async function), fetchAvailableDifficulties (async function) | gameState |
| config/organs.js | ORGANS (const), HIDDEN_ORGANS (const), COMBOS (const) | （未見跨檔使用） |
| config/characters.js | CHARACTERS (const), CHARACTERS_COMING_SOON (const) | （未見跨檔使用） |
| config/creatures.js | CREATURE_CONFIG (const), ELITE_CONFIG (const), BIOME_CREATURES (const), BOSS_CONFIG (const) | （未見跨檔使用） |
| config/evolution.js | EVOLUTION_PATHS (const), SKILLS (const) | （未見跨檔使用） |
| map/easymap.js | EASY_MAP (const) | （未見跨檔使用） |
| map/normalmap.js | NORMAL_MAP (const) | （未見跨檔使用） |
| map/hardmap.js | HARD_MAP (const) | （未見跨檔使用） |
| config/compendium_data.js | COMPENDIUM_DATA (const) | BOSS_CONFIG, EASY_MAP, ELITE_CONFIG, EVOLUTION_PATHS, HARD_MAP, NORMAL_MAP |
| lang.js | LANG_LIST (const), LANG (const), _langPack (function), applyLanguage (function), t (function) | BOSS_CONFIG, COMBOS, ELITE_CONFIG, EVOLUTION_PATHS, HIDDEN_ORGANS, ORGANS, SKILLS, gameState |
| lang/zh-TW.js | （未見跨檔使用） | LANG |
| lang/en.js | （未見跨檔使用） | LANG |
| systems/gameState.js | DEFAULT_SETTINGS (const), gameState (const), canvas (const), ctx (const) | （未見跨檔使用） |
| systems/map.js | MAP_WIDTH (const), MAP_HEIGHT (const), VIEW_W (let), VIEW_H (let), TILE_SIZE (const), NOISE_SCALE (const), MAP_RULES (const), _SimplexNoise (const), BIOME_COLOR (const), _terrainCanvas (let), getBiome (function), getBgColor (function), labelBiomeRegions (function), mergeSmallRegions (function), ensureRequiredBiomes (function), generateTerrain (function), buildTerrainCanvas (function), drawTerrain (function), generateTrees (function) | ctx, gameState, t |
| systems/utils.js | _fontCacheOn (let), _fontCacheMap (let), getGameFont (function), applyTenacity (function), drawArrow (function), drawHealthBar (function), drawNameTag (function), drawGlowEffect (function), spawnLootCircle (function) | _spawnBone, ctx, gameState, t, wrappedDelta |
| systems/audio.js | _introThemeAudio (let), playIntroTheme (function), stopIntroTheme (function), AudioManager (const), initAudio (function) | AUDIO_FILES, DEFAULT_SETTINGS, gameState |
| systems/camera.js | wrappedDistance (function), wrappedDelta (function), worldToScreen (function), _updateCameraZoom (function), updateCamera (function) | MAP_HEIGHT, MAP_WIDTH, VIEW_H, VIEW_W, gameState |
| systems/input.js | _settingsKeyHandler (let), _settingsMouseHandler (let), _rebindBlink (let), _rebindTimeout (let), _skillTreeFromHome (let), _skillTreeMode (let), handleKeyDown (function), handleKeyUp (function), _updateMouseWorld (function) | AudioManager, MAP_HEIGHT, MAP_WIDTH, _chatExpanded, _collapseChat, _getArcherShootDir, gameState, hideSettings, playerAttack, playerDash, saveSettings, showSettings, toggleDevMode |
| systems/spawning.js | spawnFruitFromTree (function), spawnFruit (function), _randomPointInBiome (function), _makeHerbCreature (function), _makeCarnCreature (function), spawnBiomeCreatures (function), moveCreature (function), spawnTreasure (function), spawnCreatureAtEdgeBiome (function), updateCreatureSpawning (function) | BIOME_CREATURES, MAP_HEIGHT, MAP_WIDTH, gameState, getBiome |
| systems/player.js | updateProjectiles (function), _checkProjectileHit (function), _getAllAttackTargets (function), _findArcherAutoTarget (function), _getArcherShootDir (function), _archerAttack (function), _XP_POOL_SIZE (const), _xpPopupPool (let), _xpPoolReady (let), _initXpPool (function), _collectFruit (function), playerDash (function), updatePlayerMovement (function), checkFruitCollision (function), updateTreeFruitProduction (function), showXPPopup (function), checkTreasureCollision (function), updatePassiveOrgans (function), checkXPMilestone (function), addXP (function), checkLevelUp (function), findBestPerceptionPath (function) | ARCHER_BULLET_SPEED, AudioManager, EVOLUTION_PATHS, FIXED_DELTA, MAP_HEIGHT, MAP_WIDTH, ORGANS, VIEW_H, VIEW_W, _joyPaused, applyDamageToPlayer, applyTenacity, gameState, getBiome, getOrganLevel, handleBossKill, handleEliteKill, handleGiantKill, handleKill, handleTutorialStumpKill, showFloatingText, showOrganSelection, spawnFruitFromTree, t, worldToScreen, wrappedDelta, wrappedDistance |
| systems/tutorial.js | showTutorial (window property), spawnTutorialStump (window property), handleTutorialStumpKill (window property) | VIEW_W, canvas, ctx, gameState, pausePlayTimer, resumePlayTimer, worldToScreen, wrappedDistance |
| systems/combat.js | showFloatingText (function), applyDamageToPlayer (function), addMutationPoints (function), handleGiantKill (function), handleKillerKill (function), handleKill (function), playerAttack (function), updateStatusEffects (function), _getTotalCorpseXP (function), _spawnBone (function), updateCorpseEating (function), updateBoneEating (function), _addBoneMaterial (function), _checkPoisonSacUpgrade (function), drawCorpseEatingBars (function), drawBones (function) | AudioManager, BONE_EXPIRE_MS, CORPSE_BONE_EAT_TICK, CORPSE_EAT_HP, CORPSE_EXPIRE_MS, EVOLUTION_PATHS, ORGANS, VIEW_H, VIEW_W, _archerAttack, addXP, applyOrganEffects, applyTenacity, ctx, gameState, getOrganCumulative, getOrganLevel, handleBossKill, handleEliteKill, handleTutorialStumpKill, showSkillTree, showXPPopup, spawnLootCircle, t, worldToScreen, wrappedDistance |
| systems/organs.js | getOrganLevel (function), getOrganCumulative (function), getComboHint (function), checkComboEffects (function), getOrganSlotsUsed (function), applyHiddenOrganEffects (function), applyOrganEffects (function), checkOrganUpgrade (function), showOrganSelection (function), drawOrganUI (function), _drawCompendiumBtn (function), _compendiumBtnRegion (let), handleEliteKill (function), showHiddenOrganSelection (function) | COMBOS, EVOLUTION_PATHS, HIDDEN_ORGANS, ORGANS, VIEW_H, _handleHunterEliteKill, _organHitRegions, addXP, applyEvolutionLevelEffect, applyMutationEffects, checkEvolutionUnlock, ctx, gameState, hideTooltip, pausePlayTimer, resumePlayTimer, showTooltip, showXPPopup, spawnLootCircle, spawnTutorialStump, t, updateDayNightCycle |
| systems/mutation.js | DEFAULT_MUTATION_DATA (const), MUTATION_COMPENSATION_VERSION (const), MUTATION_COMPENSATION_CONFIG (const), initMutationData (function), saveMutationData (function), addMutationPoints (function), getMutationUpgradeCost (function), upgradeMutation (function), applyMutationEffects (function), applyAllMutationBonuses (function), checkMutationCompensation (function), showMutationPanel (function), DEFAULT_MUTATION_SKILLS (const), initMutationSkills (function), _saveMutationSkills (function), _syncMutationSkillPoints (function), _checkAndRepairMutationSkills (function), _checkAndRepairMutationSkills (window property) | buildSkillTreeOverlay, gameState, showFloatingText, t |
| systems/evolution.js | checkEvolutionUnlock (function), applyEvolutionLevelEffect (function), _grantPoisonSac (function), applyEvolutionEffects (function), _setFangLevel (function), loadSavedOrgans (function), loadSavedOrgans (window property), applySkillBonuses (function), saveLastRunOrgans (function), showSkillTree (function), buildSkillTreeOverlay (function), upgradeSkill (function), _buildMutLeftColContent (function), _refreshMutContentLeft (function), _buildMutationSkillContent (function), _buildMutRightCol (function), _refreshMutContentRight (function), _upgradeMutationSkill (function) | AudioManager, EVOLUTION_PATHS, GAME_INFO, HIDDEN_ORGANS, ORGANS, SKILLS, _saveMutationSkills, _skillTreeFromHome, _skillTreeMode, _syncMutationSkillPoints, applyDeviceMode, applyHiddenOrganEffects, applyOrganEffects, gameState, getMutationUpgradeCost, hideTooltip, initMutationSkills, initializeGame, pausePlayTimer, saveMutationData, saveSettings, showChat, showScoreSubmitPopup, showTooltip, t, upgradeMutation |
| systems/creatures.js | _PACK_NAMES (const), _usedPackNames (let), resetPackNames (function), _HYENA_PACK_NAMES (const), _usedHyenaPackNames (let), _hyenaPackNameMap (let), CREATURE_COLORS (const), _getCreatureColor (function), _effSpeed (function), _drawCreatureGlow (function), _drawMoose (function), _drawBeetle (function), _drawCroc (function), _drawCamel (function), _drawLynx (function), _drawHyena (function), drawCreatureShape (function), _drawDirectionArrow (function), _hasGiantizedNearby (function), _carnivoreEatCorpse (function), _triggerKiller (function), _triggerGiantization (function), _triggerAlpha (function), _checkGuardianRange (function), _getPackLimit (function), _checkGiantFleeCondition (function), _updateGiantFlee (function), _getCreatureDisplayName (function), _isInHomeBiome (function), _findNearestBiomePoint (function), _shouldFleeFromGiant (function), _applyLynxBiomeBonus (function), _applyCrocBiomeBonus (function), _updateHyenaPack (function), _getHyenaPackBonus (function), _applyHyenaBiomeBonus (function), _alertHyenaPack (function), updateNeutralCreatures (function), drawNeutralCreatures (function), updateHostileCreatures (function), drawCorpses (function), drawHostileCreatures (function) | FIXED_DELTA, MAP_HEIGHT, MAP_WIDTH, VIEW_H, VIEW_W, applyDamageToPlayer, applyTenacity, ctx, gameState, getBiome, getGameFont, handleKill, moveCreature, showAlphaAnnouncement, showFloatingText, t, worldToScreen, wrappedDelta, wrappedDistance |
| systems/elite.js | _HUNTER_ELITE_META (const), _HUNTER_ELITE_STAR (const), _HUNTER_ELITE_REWARDS (const), initEliteOrder (function), _getHunterEliteType (function), _spawnHunterElite (function), spawnEliteCreature (function), _handleHunterEliteKill (function), _fireEliteFalconProjectile (function), _fireVenomFalconShot (function), _updateEliteVenomPuddle (function), updateEliteCreature (function), _updateHunterEliteChase (function), drawEliteCreature (function), _drawHunterElite (function), drawEliteArrow (function) | AudioManager, ELITE_CONFIG, HARD_ELITE_CONFIG, MAP_HEIGHT, MAP_WIDTH, VIEW_H, VIEW_W, _effSpeed, applyDamageToPlayer, ctx, drawArrow, drawGlowEffect, drawHealthBar, drawNameTag, gameState, moveCreature, showFloatingText, t, worldToScreen, wrappedDelta |
| systems/boss.js | BOSS_COLORS (const), drawBossShape (function), _drawBear (function), _drawShark (function), _drawScorp (function), _drawHunter (function), _drawSharkChargeArrow (function), _drawVenomEffects (function), _drawSandStormOverlay (function), _drawHunterAimingWarning (function), drawBoss (function), _drawBossDebuffIcons (function), spawnBoss (function), HUNTER_DIALOGUE (const), _showHunterDialogue (function), _spawnHunterBoss (function), _triggerHunterPhaseCheck (function), handleBossKill (function), _updateHunterBoss (function), _fireHunterSniper (function), _fireHunterShotgun (function), updateBoss (function), _recordClearStats (function), _recordBossKill (function), showVictory (function), drawBossArrow (function) | AudioManager, BOSS_CONFIG, GAME_INFO, MAP_HEIGHT, MAP_WIDTH, VIEW_H, VIEW_W, _effSpeed, addXP, applyDamageToPlayer, buildSkillTreeOverlay, chatSaveProgress, ctx, drawArrow, gameState, getBiome, loadChatSettings, moveCreature, pausePlayTimer, saveLastRunOrgans, saveSettings, showFloatingText, showScoreSubmitPopup, t, worldToScreen, wrappedDelta, wrappedDistance |
| systems/daynight.js | getDayNightPhaseIndex (function), applyNightTransition (function), applyDayTransition (function), updateDayNightCycle (function), showGameOver (function) | AudioManager, GAME_INFO, chatSaveProgress, gameState, loadChatSettings, showScoreSubmitPopup, spawnBoss, spawnEliteCreature, t |
| systems/leaderboard.js | _lbDifficulty (let), _top10Difficulty (let), _diffKey (function), showLeaderboard (function), showScoreSubmitPopup (function), showFunLeaderboard (function) | GAME_INFO, applyDeviceMode, fetchAvailableDifficulties, fetchDefeatRecords, fetchFunBossKillSpeed, fetchFunFruitsEaten, fetchFunGiantKills, fetchFunHunterKill, fetchFunKillerKills, fetchFunKillerMaxLevel, fetchFunMaxLevel, fetchFunNormalKills, fetchFunSpeedDeath, fetchFunSpeedVictory, fetchVictoryRecords, gameState, showChat, submitScore, t |
| systems/mobile.js | _orientationBarDismissed (let), detectMobile (function), getOrientation (function), _effectiveMobile (function), _setViewSize (function), MOBILE_GAME_SCALE (const), _applyMobileScale (function), applyDeviceMode (function), _updateOrientationBar (function), _joyActive (let), _joyTouchId (let), _joyBaseX (let), _joyBaseY (let), _joyKnobX (let), _joyKnobY (let), JOY_OUTER (const), JOY_INNER (const), ATK_RADIUS (const), _atkFeedbackTime (let), _atkFeedbackX (let), _atkFeedbackY (let), _archerDirTouchId (let), _archerDirStartX (let), _archerDirStartY (let), _archerDirCurX (let), _archerDirCurY (let), _mobileAtkTouchId (let), _joyZone (function), _getAttackBtnPos (function), _attackZone (function), _dashZone (function), _renderMobileOverlay (function), _joyDocListeners (let), _joyPaused (function), _attachJoystickListeners (function), _detachJoystickListeners (function), _updateJoystickCanvas (function) | AudioManager, VIEW_H, VIEW_W, _organHitRegions, gameState, hideTooltip, playerAttack, playerDash, showTooltip, t |
| systems/hud.js | _minimapTerrainCanvas (let), _minimapTerrainSeed (let), _minimapCanvas (let), _minimapCtx (let), _sunmoonCanvas (let), _sunmoonCtx (let), _minimapFogCanvas (let), _minimapFogCtx (let), _minimapFogImageData (let), _minimapFogRenderCanvas (let), _minimapFogRenderCtx (let), _fogCloudCanvas (let), _minimapAlpha (let), _minimapFadeTimer (let), _minimapStopTimer (let), _buildFogCloudTexture (function), _drawArcherfish (function), _drawVenomFalconEffects (function), drawProjectiles (function), _drawArcherChargeVisual (function), _drawArcherLockOn (function), updateMinimapFog (function), _mmSize (function), _drawMinimapFog (function), _buildMinimapTerrainCanvas (function), _drawMinimapEntities (function), drawMinimap (function), _drawSunMoonIndicator (function), drawTopBarUI (function), drawGame (function), _heartPath (function), _drawHpHearts (function), _initTopLeftUI (function), updateUI (function), drawTreasures (function) | BIOME_COLOR, FIXED_DELTA, GAME_INFO, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE, VIEW_H, VIEW_W, _drawSandStormOverlay, _findArcherAutoTarget, _getCreatureDisplayName, _renderMobileOverlay, canvas, ctx, drawBones, drawBoss, drawBossArrow, drawCorpseEatingBars, drawCorpses, drawEliteArrow, drawEliteCreature, drawHostileCreatures, drawNeutralCreatures, drawOrganUI, drawTerrain, findBestPerceptionPath, gameState, getBiome, getGameFont, showMutationPanel, showSettings, t, worldToScreen, wrappedDistance |
| systems/ui.js | _organHitRegions (let), _lastMinimapSize (let), _ttEl (const), showTooltip (function), hideTooltip (function), _moveTooltip (function), _escH (function), showAlphaAnnouncement (function), loadSettings (function), switchLanguage (function), saveSettings (function), _keyDisplay (function), _buildSettingsSection (function), showSettings (function), hideSettings (function), updateTimer (function), toggleDevMode (function), devAddXP (function), devAddHP (function), devFullHP (function), devSpawnFruits (function), devKillHostiles (function), devSpawnNeutral (function), devSpawnHostile (function), devFastForward (function), devRewind (function), devToggleDayNight (function), _guideKeyHandler (let), showGuide (function), hideGuide (function), _compendiumPaused (let), getOrganDisplayName (function), buildEvoLevelDesc (function), showCompendium (function), showMapSelect (function), showStartScreen (function), showSplashScreen (function), showPatchNotes (function), checkPatchNotesPopup (function), showGuideStory (function), _getGuideStoryPages (function) | AudioManager, CHARACTERS, CHARACTERS_COMING_SOON, COMBOS, COMPENDIUM_DATA, DEFAULT_SETTINGS, EASY_MAP, EVOLUTION_PATHS, GAME_INFO, HARD_MAP, HIDDEN_ORGANS, LANG, LANG_LIST, MAP_HEIGHT, MAP_WIDTH, NORMAL_MAP, ORGANS, PATCH_NOTES, SKILLS, _diffKey, _effectiveMobile, _esc, _lbDifficulty, _rebindBlink, _rebindTimeout, _settingsKeyHandler, _settingsMouseHandler, _skillTreeFromHome, _top10Difficulty, _updateCameraZoom, addXP, applyDeviceMode, applyLanguage, buildChatUI, buildSkillTreeOverlay, fetchTop10, gameState, getDayNightPhaseIndex, hideChat, initChat, initializeGame, playIntroTheme, saveLastRunOrgans, showChat, showLeaderboard, showSkillTree, spawnFruit, t |
| systems/chat.js | _sha256 (async function), _sbClient (let), _chatChannel (let), _chatPollTimer (let), _chatIdleTimer (let), _chatMessages (let), _pinnedMessage (let), _chatLastFetchTime (let), CHAT_IDLE_MS (const), CHAT_POLL_MS (const), _chatDragState (const), _chatExpanded (let), _saveChatPosition (function), _loadChatPosition (function), loadChatSettings (function), saveChatSettings (function), _calcProgressScore (function), _collectLocalData (function), _applyRemoteData (function), chatLogin (async function), chatSaveProgress (async function), chatSyncData (async function), chatLogout (function), initChat (async function), _deleteOldMessages (async function), _subscribeChat (function), _pollNewMessages (async function), disconnectChat (function), _resetIdleTimer (function), sendChatMessage (async function), _handlePinCommand (async function), _handleUnpinCommand (async function), verifyGM (async function), showChat (function), hideChat (function), _makeDraggable (function), _expandChat (function), _collapseChat (function), _onViewportResize (function), _renderChatSettingsPanel (function), buildChatUI (function), _isAtBottom (function), _formatChatTime (function), _buildMsgHTML (function), _buildMsgText (function), renderChat (function), _lvColor (function), _parseName (function), _esc (function), _COLOR_MAP (const), _parseColorTags (function), isVipPlayer (function) | GAME_INFO, SUPABASE_KEY, SUPABASE_URL, gameState, supabaseQuery, t |
| main.js | FIXED_FPS (const), FIXED_DELTA (const), accumulator (let), lastTimestamp (let), _wasPaused (let), pausePlayTimer (function), resumePlayTimer (function), isGamePaused (function), updateGameLogic (function), gameLoop (function), _applyCharacterStats (function), initializeGame (function), onload (window property) | AudioManager, CHARACTERS, EASY_MAP, GAME_INFO, MAP_HEIGHT, MAP_WIDTH, NORMAL_MAP, ORGANS, TILE_SIZE, _compendiumBtnRegion, _getArcherShootDir, _hyenaPackNameMap, _initXpPool, _joyPaused, _organHitRegions, _updateCameraZoom, _updateMouseWorld, _usedHyenaPackNames, applyAllMutationBonuses, applyEvolutionEffects, applyOrganEffects, applySkillBonuses, canvas, checkFruitCollision, checkTreasureCollision, disconnectChat, drawGame, gameState, generateTerrain, generateTrees, getComboHint, handleKeyDown, handleKeyUp, hideChat, hideTooltip, initAudio, initEliteOrder, initMutationData, loadSavedOrgans, loadSettings, playerAttack, resetPackNames, showCompendium, showGuideStory, showSplashScreen, showTooltip, showTutorial, spawnBiomeCreatures, spawnFruitFromTree, stopIntroTheme, updateBoneEating, updateBoss, updateCamera, updateCorpseEating, updateCreatureSpawning, updateDayNightCycle, updateEliteCreature, updateHostileCreatures, updateMinimapFog, updateNeutralCreatures, updatePassiveOrgans, updatePlayerMovement, updateProjectiles, updateStatusEffects, updateTimer, updateTreeFruitProduction, updateUI |

## 高風險依賴（循環依賴或複雜互依）
- `addMutationPoints` is defined in both `systems/combat.js` and `systems/mutation.js`. In the current script order, the later `systems/mutation.js` declaration wins for the shared global binding; ESM migration should rename or split these exports explicitly.
- `systems/player.js` and `systems/combat.js` are mutually dependent: player uses combat kill/damage handlers, while combat uses player helpers such as `_archerAttack`, `addXP`, and `showXPPopup`.
- `systems/combat.js`, `systems/organs.js`, and `systems/evolution.js` form a complex cycle around organ effects, evolution unlocks, XP rewards, and UI prompts.
- `systems/evolution.js`, `systems/ui.js`, and `main.js` are tied through lifecycle/UI entry points such as `initializeGame`, `showSkillTree`, `buildSkillTreeOverlay`, `showChat`, and `showScoreSubmitPopup`.
- `systems/boss.js` and `systems/daynight.js` depend on each other through boss spawning, score submission, chat progress saving, and end-of-run flow.
- `systems/hud.js` is a rendering aggregator that depends on map, combat, creatures, elite, boss, organs, mobile, and UI helpers; import it late or split pure draw helpers before ESM conversion.
- Many underscore-prefixed names are still true globals, including `_organHitRegions`, `_joyPaused`, `_getArcherShootDir`, `_drawSandStormOverlay`, and `_renderMobileOverlay`. Do not treat them as private until they are module-scoped.
- `config/supabase.js` reads `gameState` inside async submission logic even though it is loaded before `systems/gameState.js`; this is a delayed runtime dependency and should become explicit under ESM.
- `lang.js` reads several config globals to compose translation data; `lang/zh-TW.js` and `lang/en.js` depend on `LANG` and only populate language packs.

## 建議的 ESM import 順序
1. `config/gameConfig.js`
2. `config/patchnotes.js`
3. `config/organs.js`
4. `config/characters.js`
5. `config/creatures.js`
6. `config/evolution.js`
7. `map/easymap.js`, `map/normalmap.js`, `map/hardmap.js`
8. `config/compendium_data.js` (depends on creatures/evolution/map config)
9. `lang.js`, then `lang/zh-TW.js` and `lang/en.js`
10. `systems/gameState.js`
11. `systems/map.js`, `systems/utils.js`, `systems/audio.js`, `systems/camera.js`
12. `systems/spawning.js`, `systems/mobile.js`, `systems/chat.js`
13. `systems/player.js`, `systems/combat.js`, `systems/organs.js`, `systems/mutation.js`, `systems/evolution.js` (currently cyclic; split shared API or use an app-level composition module)
14. `systems/creatures.js`, `systems/elite.js`, `systems/boss.js`, `systems/daynight.js`
15. `systems/leaderboard.js`, `systems/hud.js`, `systems/ui.js`
16. `systems/tutorial.js` (currently exposes `window.*`; convert to named exports for `main.js`)
17. `main.js` as the only startup entry

> Note: layers 13-15 are not a clean DAG yet. Direct one-file-at-a-time imports will encounter cycles; isolate pure data/helpers and lifecycle/UI entry points before Stage 2.
