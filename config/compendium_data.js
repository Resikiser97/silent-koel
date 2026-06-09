// =============================================================
// 遊戲圖鑑資料 — COMPENDIUM_DATA
// 定義四大分類：遊戲機制 / Biome / Boss / 生物百科
// 此檔案必須在 map/normalmap.js 之後、systems/ui.js 之前載入
// 數值動態引用 BOSS_CONFIG / ELITE_CONFIG / EVOLUTION_PATHS /
//              EASY_MAP / NORMAL_MAP（需先載入）
// =============================================================

export const COMPENDIUM_DATA = (function () {

    // ── 安全取得 config 全域常數
    const _boss = (typeof BOSS_CONFIG !== 'undefined') ? BOSS_CONFIG : {};
    const _ec   = (typeof ELITE_CONFIG !== 'undefined') ? ELITE_CONFIG
                : { nights: [{},{},{}], base: { hp: 50, poisonResist: 0.2 } };
    const _ev   = (typeof EVOLUTION_PATHS !== 'undefined') ? EVOLUTION_PATHS : {};
    const _easyBosses   = (typeof EASY_MAP   !== 'undefined' && EASY_MAP.bosses)   ? EASY_MAP.bosses   : [];
    const _normalBosses = (typeof NORMAL_MAP !== 'undefined' && NORMAL_MAP.bosses) ? NORMAL_MAP.bosses : [];
    const _hardBosses   = (typeof HARD_MAP   !== 'undefined' && HARD_MAP.bosses)   ? HARD_MAP.bosses   : [];

    // 取得指定 biome 的 Easy / Normal / Hard boss config
    function _eb(biome) {
        const b = _easyBosses.find(function (x) { return x.biome === biome; });
        if (b && b.hp) return b;
        return _boss[biome] || {};
    }
    function _nb(biome) {
        const b = _normalBosses.find(function (x) { return x.biome === biome; });
        if (b && b.hp) return b;
        const fb = { forest: { hp: 1500, speed: 9.0, damage: 30 }, ocean: { hp: 1800, speed: 11.7, damage: 36 }, desert: { hp: 1650, speed: 10.8, damage: 40 } };
        return fb[biome] || {};
    }

    const _base = _ec.base || { hp: 50, poisonResist: 0.2 };
    const n1 = _ec.nights[0] || {}, n2 = _ec.nights[1] || {}, n3 = _ec.nights[2] || {};
    const bHp = _base.hp || 50;
    const bPr = Math.round((_base.poisonResist || 0.2) * 100);
    const evMaxLv = (_ev.herbivore && _ev.herbivore.maxLevel) ? _ev.herbivore.maxLevel : 5;

    return {
        sections: [

            // ════════════════════════════════════════
            // 遊戲機制
            // ════════════════════════════════════════
            {
                id: 'mechanics',
                color: '#4a8a4a',
                label: { 'zh-TW': '遊戲機制', 'en': 'Game Mechanics' },
                entries: [
                    {
                        id: 'basic_controls',
                        title: { 'zh-TW': '基本操作', 'en': 'Basic Controls' },
                        content: {
                            'zh-TW': '移動使用 WASD 或方向鍵，攻擊使用空白鍵或滑鼠左鍵，按 Esc 開啟設定。走過果子即可自動吸收 XP。按 Z 鍵切換自動攻擊模式（需先裝備攻擊器官）。按 F 鍵（可自訂）使用閃現技能，瞬間位移並獲得短暫無敵。手機玩家以搖桿移動、右下角攻擊按鈕進行攻擊，攻擊區正上方為閃現按鈕。',
                            'en': 'Move with WASD or Arrow Keys, attack with Space or Left Click, and open Settings with Esc. Walk over fruits to collect XP automatically. Press Z to toggle Auto Attack (requires an attack organ). Press F (customizable) to use the Dash skill — an instant teleport with brief invincibility. Mobile players use the joystick to move and the attack zone button to attack; the dash button sits just above the attack zone.'
                        }
                    },
                    {
                        id: 'game_goal',
                        title: { 'zh-TW': '遊戲目標', 'en': 'Game Goal' },
                        content: {
                            'zh-TW': '你有 10 分鐘（600 秒）在 8000×8000 的無縫循環世界中生存並擊敗最終 Boss。世界分為白天與夜晚，每 75 秒交替一次，共 8 個時段（4 白天、4 夜晚）。每個夜晚出現一隻精英怪，擊敗後立即迎來黎明。第四個夜晚為 Boss 夜，剩餘 150 秒時 Boss 降臨並全圖追擊，擊敗即獲勝。時間歸零或死亡則遊戲結束，可前往技能樹保留成果。',
                            'en': 'You have 10 minutes (600 seconds) to survive and defeat the final Boss in an 8000×8000 seamlessly looping world. Day and night alternate every 75 seconds across 8 phases (4 days, 4 nights). Each night spawns one Elite — defeating it ends the night early. The 4th night is Boss Night: the Boss spawns with 150 seconds remaining and hunts you across the entire map. Defeat it to win. Running out of time or dying ends the run; visit the Skill Tree to keep your progress.'
                        }
                    },
                    {
                        id: 'xp_and_level',
                        title: { 'zh-TW': 'XP 與升級', 'en': 'XP & Leveling' },
                        content: {
                            'zh-TW': '吃果子是初期主要的 XP 來源（草食性 Lv1 前每顆只得 1 XP，升上 Lv1 後大幅提升）。擊殺生物、吃屍體（肉食性路線）也能獲得 XP。累積足夠 XP 後自動升級，升級時從三張器官卡中選一張放入器官槽位。初始擁有 5 個槽位，槽位滿後觸發進化路線選擇，每次進化後槽位 +3。',
                            'en': 'Eating fruits is the primary early XP source (only 1 XP per fruit before Herbivore Lv1 — XP grows substantially once you reach it). Killing creatures and eating corpses (Carnivore path) also grants XP. Accumulate enough XP to level up and pick one of three organ cards. You start with 5 organ slots; when they fill, an evolution path selection triggers and 3 more slots are added each time.'
                        }
                    },
                    {
                        id: 'organ_system',
                        title: { 'zh-TW': '器官系統', 'en': 'Organ System' },
                        content: {
                            'zh-TW': '器官分為攻擊⚔️、防禦🛡️、靈力🔮三大類，共 15 種普通器官，各有 Lv1~3，每級各佔一個槽位。擊敗精英怪有 50% 機率掉落隱藏器官（不佔普通槽位）。兩種器官同時達到 Lv3 可觸發「組合效果」，大幅強化能力。死亡後依「記憶器官」技能等級可保留 0~3 個器官到下一局。體型類器官增加半徑，半徑越大攻擊範圍越廣。',
                            'en': 'Organs come in three types: Attack ⚔️, Defense 🛡️, and Spirit 🔮 — 15 standard organs total, each with Lv1~3, and each level occupying one slot. Defeating Elites has a 50% chance to drop a Hidden Organ (no slot cost). Two organs both at Lv3 can trigger a "Combo Effect" for a major power boost. After death, the Organ Memory skill lets you keep 0~3 organs into the next run. Size organs raise your radius, which directly increases your attack range.'
                        }
                    },
                    {
                        id: 'evolution_paths',
                        title: { 'zh-TW': '進化路線', 'en': 'Evolution Paths' },
                        content: {
                            'zh-TW': '器官槽位滿時觸發進化路線選擇，每條路線最高 ' + evMaxLv + ' 級，每局重置不繼承。\n🌿 草食性：提升 HP 與體型，Lv2 起果子 XP 增加，Lv4 後中立生物完全友善；Lv4 巨人化傷害 -15%，Lv5 再降至 -30%。\n🥩 肉食性：解鎖吃屍體獲得 XP，大幅強化攻擊力與攻速（Lv3 起）。\n⚖️ 雜食性：需草食性 Lv1 + 肉食性 Lv1 才能解鎖，提升速度；Lv1 自動獲得毒囊，可吞噬白骨累積白骨素強化毒囊。',
                            'en': 'When organ slots are full an evolution selection triggers. Each path goes up to Lv' + evMaxLv + ' and resets every run.\n🌿 Herbivore: boosts HP and size; fruit XP increases from Lv2; neutral creatures become fully friendly at Lv4; Lv4 reduces Giantized damage by 15%, Lv5 by 30%.\n🥩 Carnivore: unlocks corpse eating for XP and greatly boosts attack power and attack speed (Lv3+).\n⚖️ Omnivore: requires Herbivore Lv1 + Carnivore Lv1; boosts speed and grants a Poison Sac at Lv1 — devour bones to keep upgrading it.'
                        }
                    },
                    {
                        id: 'day_night_cycle',
                        title: { 'zh-TW': '日夜循環', 'en': 'Day/Night Cycle' },
                        content: {
                            'zh-TW': '遊戲共 8 個時段，每 75 秒交替日夜。\n★ 夜晚一：精英怪 ' + n1.hpMult + '× HP（共 ' + (bHp * n1.hpMult) + '）、傷害 ' + n1.damage + '，擊殺 +' + n1.xp + ' XP，+1 技能點。\n★★ 夜晚二：' + n2.hpMult + '× HP（共 ' + (bHp * n2.hpMult) + '）、傷害 ' + n2.damage + '，+' + n2.xp + ' XP，+1 技能點。\n★★★ 夜晚三：' + n3.hpMult + '× HP（共 ' + (bHp * n3.hpMult) + '）、傷害 ' + n3.damage + '，+' + n3.xp + ' XP，+2 技能點。\n第四夜為 Boss 夜，剩餘 150 秒時 Boss 全圖追擊。擊敗精英怪可立即結束當夜。',
                            'en': 'The game has 8 phases, alternating day and night every 75 seconds.\n★ Night 1: Elite ' + n1.hpMult + '× HP (total ' + (bHp * n1.hpMult) + '), damage ' + n1.damage + ', kill XP +' + n1.xp + ', +1 skill point.\n★★ Night 2: ' + n2.hpMult + '× HP (total ' + (bHp * n2.hpMult) + '), dmg ' + n2.damage + ', +' + n2.xp + ' XP, +1 pt.\n★★★ Night 3: ' + n3.hpMult + '× HP (total ' + (bHp * n3.hpMult) + '), dmg ' + n3.damage + ', +' + n3.xp + ' XP, +2 pts.\nNight 4 is Boss Night — the Boss spawns with 150 seconds left and pursues you everywhere. Defeating an Elite always ends the current night early.'
                        }
                    },
                    {
                        id: 'bone_system',
                        title: { 'zh-TW': '白骨系統', 'en': 'Bone System' },
                        content: {
                            'zh-TW': '屍體在地圖上放置 60 秒，或被肉食生物吃完後，會變成白骨；白骨存在 180 秒後自動消失。擁有雜食性 Lv1 的玩家可靠近白骨進行吞噬，累積白骨素。白骨素達到門檻（5→10→20→40→60→100→120→140→160→200）後自動升級毒囊，最高 Lv10。毒囊每升一級都提升攻擊力與毒傷，是雜食性路線的核心成長引擎。注意：毒囊無法選擇也無法繼承，只能靠白骨素自動升級。',
                            'en': 'Corpses left on the ground for 60 seconds, or fully consumed by carnivore creatures, turn into bones; bones disappear after 180 seconds. Players with Omnivore Lv1 can devour nearby bones to accumulate Bone Material. When Bone Material crosses thresholds (5→10→20→40→60→100→120→140→160→200) the Poison Sac auto-upgrades up to Lv10, gaining attack and poison damage at every level — the core growth engine of the Omnivore path. Note: the Poison Sac cannot be selected or inherited; it only grows through Bone Material.'
                        }
                    },
                    {
                        id: 'skill_tree',
                        title: { 'zh-TW': '技能樹', 'en': 'Skill Tree' },
                        content: {
                            'zh-TW': '技能樹跨局持久保存，是遊戲的長期成長核心。技能點來源：精英怪擊殺（第 1/2/3 夜各 +1/+1/+2）、Boss 擊殺（+3）、存活時間獎勵與等級獎勵（結算時計算）。共 9 種技能，升至第 N 級費 N 點。推薦新手優先升：強壯體魄（起始 HP+）、採集專家（果子 XP+）、記憶器官（死亡保留器官數）。技能點可重置，不需擔心選錯。',
                            'en': 'The Skill Tree persists between runs and is the foundation of long-term progression. Skill points come from Elite kills (+1/+1/+2 across Nights 1~3), Boss kill (+3), survival time bonus, and level bonus (both calculated at the end screen). There are 9 skills; reaching level N costs N points. Beginners should prioritize Vitality (starting HP), Forager (fruit XP), and Organ Memory (keep organs after death). Points can be fully reset at any time.'
                        }
                    },
                    {
                        id: 'difficulty_system',
                        title: { 'zh-TW': '難度系統', 'en': 'Difficulty System' },
                        content: {
                            'zh-TW': '遊戲提供三個難度。\n🌿 簡單：生物強度正常、Boss 較為溫和，適合熟悉遊戲機制的入門選擇；每夜出現三犬精英（靜音獵隊）。\n⚔️ 普通：生物全面強化（HP/速度/傷害均提升）、追擊範圍更廣，並開放巨人化、殺手化、精英/Boss 回血等特殊機制；Boss 擁有各自獨特技能；每夜出現三犬精英。\n🗡️ 困難：生物強度 ×2.5、追擊範圍 600px，精英/Boss 不回血，精英怪改為靜音獵隊三隼（幽靈隼/暗影隼/毒霧隼），第四夜 Boss 為困難專屬的黑色獵人（5管血條制）。建議先通關普通難度再挑戰。',
                            'en': 'Three difficulty modes are available.\n🌿 Easy: standard creature stats and milder Bosses — ideal for learning the game. Silent Hunter dog Elites appear each night.\n⚔️ Normal: all creatures are stronger (HP, speed, damage boosted), aggro range wider, and special mechanics are unlocked: Giantization, Killer-mode, and Elite/Boss HP regeneration. Bosses have unique skills. Silent Hunter dog Elites appear each night.\n🗡️ Hard: creature strength ×2.5, aggro range 600px, no Elite/Boss regeneration. Elites are replaced by the Silent Hunter Falcon squad (Specter / Shadow / Venom Falcon). The Night 4 Boss is the exclusive Black Hunter (5 health bars). Recommended: clear Normal before attempting Hard.'
                        }
                    },
                    {
                        id: 'mutation_organs',
                        title: { 'zh-TW': '變異器官', 'en': 'Mutation Organs' },
                        content: {
                            'zh-TW': '變異器官是跨局永久保存的成長系統，共四種器官，各自強化攻擊力（憤怒的獠牙）、HP上限（懦弱的尾巴）、速度（勇敢的翅膀）及XP倍率（好奇的眼睛），每升一級各+1%。\n擊殺巨人化生物、Alpha、殺手化生物可獲得變異點數，升級費用起始1費，每5級+1費。\n首頁左上角的⚗️圖示可查看並升級，效果永久跨局保留，不受局數重置。',
                            'en': 'Mutation Organs are a permanent progression system that carries over between runs. Four organs — Raging Fang, Cowardly Tail, Brave Wing, and Curious Eye — each boost Attack, Max HP, Speed, or XP multiplier by 1% per level.\nEarn Mutation Points by defeating Giantized creatures, Alpha, and Killers. Upgrade cost starts at 1 point and increases by 1 every 5 levels.\nOpen the ⚗️ icon on the home screen to upgrade. Effects are permanent and never reset between runs.'
                        }
                    },
                    {
                        id: 'mutation_skill_tree',
                        title: { 'zh-TW': '變異技能樹', 'en': 'Mutation Skill Tree' },
                        content: {
                            'zh-TW': '變異技能樹是變異器官系統的進階分頁，在技能樹面板右上角點擊「⚗️ 變異」按鈕開啟。\n目前含一項技能：\n★ 回憶器官（最高 Lv3）：每升一級讓死亡後可多保留一個隱藏器官（Lv0 保留 1 個、Lv3 保留 4 個）。\n技能點來源：每累積 50 變異器官總等級獲得 1 點。費用從 1 點起，每升一級多 1 點（Lv1=1點、Lv2=2點、Lv3=3點）。\n效果跨局永久保留，不受遊戲重置影響。',
                            'en': 'The Mutation Skill Tree is an advanced panel within the Mutation Organ system — open it by clicking the "⚗️ Mutation" button in the top-right corner of the Skill Tree panel.\nCurrent skill:\n★ Organ Memory (max Lv3): each level lets you keep one additional Hidden Organ after death (Lv0 keeps 1, Lv3 keeps 4).\nSkill point source: gain 1 point per 50 total Mutation Organ levels accumulated. Cost starts at 1 point per level and increases by 1 each level (Lv1=1pt, Lv2=2pts, Lv3=3pts).\nEffects persist permanently across all runs.'
                        }
                    }
                ]
            },

            // ════════════════════════════════════════
            // Biome
            // ════════════════════════════════════════
            {
                id: 'biome',
                color: '#4a7aaa',
                label: { 'zh-TW': 'Biome', 'en': 'Biome' },
                entries: [
                    {
                        id: 'forest',
                        title: { 'zh-TW': '🌿 森林', 'en': '🌿 Forest' },
                        content: {
                            'zh-TW': '森林是地圖中心區域，也是遊戲的起始地點，樹木密集、果子充足，適合初期快速升級。\n原住民：草食性🌿駝鹿個性溫和；肉食性🌿猞猁在森林內擁有 50% 暴擊率（×2 傷害），命中使玩家減速 -30% 持續 3 秒，移速也提升 ×1.2。離開森林 3 秒後加成減弱。\n在普通難度中，駝鹿吃飽 5 顆果子後會巨人化，組成最多 8 隻的護衛隊。\nBoss：🌿 黑熊守護此地，擁有狂暴化技能（HP < 40% 時觸發），建議提早強化 HP 器官再交戰。',
                            'en': 'The Forest covers the center of the map and is your starting zone — dense trees and abundant fruits make it great for fast early leveling.\nNatives: herbivore 🌿Moose are docile; carnivore 🌿Lynx gain 50% crit chance (×2 damage) in the forest, slow you by -30% for 3 seconds on hit, and move 20% faster. These bonuses fade 3 seconds after leaving the forest.\nIn Normal mode, Moose that eat 5 fruits Giantize, forming escort packs of up to 8.\nBoss: 🌿 Black Bear guards this zone with an Enrage ability (triggers below 40% HP). Build up HP organs before engaging.'
                        }
                    },
                    {
                        id: 'ocean',
                        title: { 'zh-TW': '🌊 海洋', 'en': '🌊 Ocean' },
                        content: {
                            'zh-TW': '海洋在地圖上呈現藍色水潭地形，擁有獨特的生態環境。\n原住民：草食性🌊巨型甲蟲在水邊覓食；肉食性🌊鱷魚在水中攻擊 ×1.2、移速 ×1.3，且有 20% 機率觸發「死亡翻滾」使玩家暈眩 1 秒（韌性器官可縮短）。離開水潭後加成立即消失。\n阿奇爾角色在海洋中速度提升 50%，有天然優勢。\nBoss：🌊 大白鯊每 4 秒發動衝鋒（傷害 ×1.5），衝鋒前有黃色箭頭警告，可橫移躲開。',
                            'en': 'The Ocean appears as blue water terrain on the map with its own unique ecosystem.\nNatives: herbivore 🌊Giant Beetles forage near the water; carnivore 🌊Crocodiles gain ×1.2 attack and ×1.3 speed inside the water, with a 20% chance to trigger Death Roll (stuns you for 1 second; tenacity organs reduce this). Bonuses vanish instantly on leaving.\nThe Archerfish character gains +50% speed in the ocean.\nBoss: 🌊 Great White Shark charges every 4 seconds (1.5× damage) — a yellow arrow warns you just before; sidestep to dodge.'
                        }
                    },
                    {
                        id: 'desert',
                        title: { 'zh-TW': '🏜️ 沙漠', 'en': '🏜️ Desert' },
                        content: {
                            'zh-TW': '沙漠位於地圖邊緣，沙黃色地形辨識度高，是三種生態中危險性最高的區域。\n原住民：草食性🏜️駱駝在沙地漫遊；肉食性🏜️鬣狗以群體戰術著稱——每隻存活夥伴提供 +20% 攻擊、+5% 速度，且任一成員鎖定目標時立刻通報 600px 內所有夥伴同時出動。沙漠內移速額外 ×1.1；離開沙漠 3 秒後攻擊與速度各降至 ×0.5。\nBoss：🏜️ 沙漠蠍王每 5 秒投擲毒霧（半徑 150px、持續 4 秒），HP < 40% 觸發沙暴（玩家移速 -40%），但離開沙漠立即解除沙暴。',
                            'en': 'The Desert covers the map\'s edges with sandy terrain and is the most dangerous of the three biomes.\nNatives: herbivore 🏜️Camels wander the dunes; carnivore 🏜️Hyenas hunt in packs — each surviving packmate grants +20% attack and +5% speed, and any member spotting you immediately alerts all allies within 600px. In-desert speed bonus ×1.1; 3 seconds after leaving, attack and speed halve.\nBoss: 🏜️ Desert Scorpion King hurls a venom puddle every 5 seconds (150px radius, 4s), and below 40% HP triggers a Sandstorm (-40% player speed) — but leaving the desert removes the Sandstorm instantly.'
                        }
                    }
                ]
            },

            // ════════════════════════════════════════
            // Boss
            // ════════════════════════════════════════
            {
                id: 'boss',
                color: '#aa6a2a',
                label: { 'zh-TW': 'Boss', 'en': 'Boss' },
                entries: [
                    {
                        id: 'black_bear',
                        title: { 'zh-TW': '🌿 黑熊', 'en': '🌿 Black Bear' },
                        content: {
                            'zh-TW': '黑熊守護森林生態區，在第四夜剩餘 150 秒時降臨，全圖追擊。\n🌿 簡單：HP ' + _eb('forest').hp + '／速度 ' + _eb('forest').speed + '／傷害 ' + _eb('forest').damage + '。\n⚔️ 普通：HP ' + _nb('forest').hp + '／速度 ' + _nb('forest').speed + '／傷害 ' + _nb('forest').damage + '，每 3 秒回復 2% 最大 HP。\n普通技能：HP < 40% 觸發狂暴化（速度 ×1.5、傷害 ×1.3）；在森林內有 50% 暴擊率（×2 傷害）。\n建議應對：保持移動避免正面對決；毒刺或流血提供穩定輸出；引至森林外可降低暴擊率。',
                            'en': 'The Black Bear guards the Forest biome, descending when 150 seconds remain in the final night and hunting across the entire map.\n🌿 Easy: HP ' + _eb('forest').hp + ' / Speed ' + _eb('forest').speed + ' / Damage ' + _eb('forest').damage + '.\n⚔️ Normal: HP ' + _nb('forest').hp + ' / Speed ' + _nb('forest').speed + ' / Damage ' + _nb('forest').damage + ', regenerates 2% max HP every 3s.\nNormal ability: below 40% HP it Enrages (Speed ×1.5, Damage ×1.3); has 50% crit chance (×2 damage) inside the forest.\nTips: stay mobile to avoid face-tanking; Poison Stinger or Bleed provides consistent damage; lure it out of the forest to cut its crit rate.'
                        }
                    },
                    {
                        id: 'great_white_shark',
                        title: { 'zh-TW': '🌊 大白鯊', 'en': '🌊 Great White Shark' },
                        content: {
                            'zh-TW': '大白鯊棲息於海洋生態區，在第四夜剩餘 150 秒時現身，全圖追擊。\n🌿 簡單：HP ' + _eb('ocean').hp + '／速度 ' + _eb('ocean').speed + '／傷害 ' + _eb('ocean').damage + '。\n⚔️ 普通：HP ' + _nb('ocean').hp + '／速度 ' + _nb('ocean').speed + '／傷害 ' + _nb('ocean').damage + '，每 3 秒回復 2% 最大 HP。\n普通技能：每 4 秒發動衝鋒撕咬（傷害 ×1.5），衝鋒前有黃色箭頭警告；在海洋中速度額外加成。\n建議應對：看到黃色箭頭立刻橫移躲開衝鋒路徑；在海洋外交戰可削弱其速度優勢。',
                            'en': 'The Great White Shark lurks in the Ocean biome and appears when 150 seconds remain in the final night.\n🌿 Easy: HP ' + _eb('ocean').hp + ' / Speed ' + _eb('ocean').speed + ' / Damage ' + _eb('ocean').damage + '.\n⚔️ Normal: HP ' + _nb('ocean').hp + ' / Speed ' + _nb('ocean').speed + ' / Damage ' + _nb('ocean').damage + ', regenerates 2% max HP every 3s.\nNormal ability: charges every 4 seconds (1.5× damage) with a yellow arrow warning — sidestep immediately. Gains extra speed in the ocean.\nTips: watch for the charge arrow and dodge sideways; fighting outside the ocean reduces its speed advantage.'
                        }
                    },
                    {
                        id: 'scorpion_king',
                        title: { 'zh-TW': '🏜️ 沙漠蠍王', 'en': '🏜️ Desert Scorpion King' },
                        content: {
                            'zh-TW': '沙漠蠍王潛伏於沙漠生態區，在第四夜剩餘 150 秒時登場，全圖追擊。\n🌿 簡單：HP ' + _eb('desert').hp + '／速度 ' + _eb('desert').speed + '／傷害 ' + _eb('desert').damage + '。\n⚔️ 普通：HP ' + _nb('desert').hp + '／速度 ' + _nb('desert').speed + '／傷害 ' + _nb('desert').damage + '，每 3 秒回復 2% 最大 HP。\n普通技能：每 5 秒向玩家當前位置投擲毒霧（半徑 150px、持續 4 秒）；HP < 40% 觸發沙暴（玩家在沙漠中移速 -40%）。對毒傷有 ' + ((_boss.desert || {}).poisonResist ? Math.round((_boss.desert.poisonResist) * 100) : 50) + '% 減免，毒刺流玩家效果受限。\n建議應對：觀察黃色警告圈後及時走開；沙暴觸發後立即離開沙漠解除減速。',
                            'en': 'The Desert Scorpion King lurks in the Desert biome and appears when 150 seconds remain in the final night.\n🌿 Easy: HP ' + _eb('desert').hp + ' / Speed ' + _eb('desert').speed + ' / Damage ' + _eb('desert').damage + '.\n⚔️ Normal: HP ' + _nb('desert').hp + ' / Speed ' + _nb('desert').speed + ' / Damage ' + _nb('desert').damage + ', regenerates 2% max HP every 3s.\nNormal ability: hurls a venom puddle at your position every 5 seconds (150px radius, 4s duration); below 40% HP triggers a Sandstorm (-40% player speed in desert). Has ' + ((_boss.desert || {}).poisonResist ? Math.round((_boss.desert.poisonResist) * 100) : 50) + '% poison resistance — Poison builds are less effective here.\nTips: step away from the yellow warning circle before venom lands; when Sandstorm triggers, exit the desert immediately to remove the slow.'
                        }
                    },
                    {
                        id: 'black_hunter',
                        title: { 'zh-TW': '🎯 黑色獵人（困難專屬）', 'en': '🎯 Black Hunter (Hard Only)' },
                        content: {
                            'zh-TW': (function() {
                                const hb = (_hardBosses || []).find(function(x){ return x.biome === 'hunter'; }) || {};
                                const perBar = (_boss.hunter && _boss.hunter.maxHpPerBar) || (hb.hp || 800);
                                const bars   = (_boss.hunter && _boss.hunter.totalBars)   || 5;
                                return '🎯 黑色獵人是困難難度專屬 Boss，5 管血條制（每管 HP ' + perBar + '，共 ' + (perBar * bars) + '），以獵人主題曲登場，全圖追擊。\n三形態：\n- 形態一（狙擊）：遠距精確射擊，留意彈道及時橫移閃避。\n- 形態二（散彈）：近距散彈爆發，盡量保持距離。\n- 形態三（融合技）：同時使用狙擊與散彈，強度大幅提升，需全力輸出。\n每管血條被打破 +30 秒遊戲時間（最多 +120 秒），擊殺獎勵：+1000 XP、+5 技能點、+5 變異點。\n建議先在普通難度充分強化後再挑戰；毒傷、持續傷害類器官可提供穩定輸出。';
                            })(),
                            'en': (function() {
                                const hb = (_hardBosses || []).find(function(x){ return x.biome === 'hunter'; }) || {};
                                const perBar = (_boss.hunter && _boss.hunter.maxHpPerBar) || (hb.hp || 800);
                                const bars   = (_boss.hunter && _boss.hunter.totalBars)   || 5;
                                return '🎯 The Black Hunter is the Hard mode exclusive Boss — ' + bars + ' health bars (' + perBar + ' HP each, ' + (perBar * bars) + ' total), arrives with a dedicated boss theme and pursues you across the entire map.\nThree phases:\n- Phase 1 (Sniper): long-range precision shots — sidestep the bullet trajectory.\n- Phase 2 (Shotgun): close-range burst fire — maintain distance.\n- Phase 3 (Fusion): combines both attack modes simultaneously for maximum intensity.\nBreaking each health bar grants +30 seconds (up to +120 seconds total). Kill rewards: +1000 XP, +5 skill points, +5 mutation points.\nRecommended: fully build your character in Normal mode before attempting; DoT and sustained damage organs provide reliable output.';
                            })()
                        }
                    }
                ]
            },

            // ════════════════════════════════════════
            // 生物百科
            // ════════════════════════════════════════
            {
                id: 'bestiary',
                color: '#8a4a8a',
                label: { 'zh-TW': '生物百科', 'en': 'Bestiary' },
                entries: [
                    {
                        id: 'elite',
                        title: { 'zh-TW': '精英怪', 'en': 'Elite Creatures' },
                        content: {
                            'zh-TW': '精英怪是每個夜晚出現的特殊強敵，對毒傷有 ' + bPr + '% 減免。擊殺後立即結束當夜，並有 50% 機率獲得隱藏器官，畫面頂部顯示血條與方向箭頭。\n【簡單/普通難度】每夜出現靜音獵隊犬族成員：\n★ 幽靈犬（第一夜）：近戰、HP ' + (bHp * n1.hpMult) + '，擊殺 +' + n1.xp + ' XP、+1 技能點、+1 變異點。\n★★ 暗影犬（第二夜）：近戰、HP ' + (bHp * n2.hpMult) + '，+' + n2.xp + ' XP、+1 技能點、+2 變異點。\n★★★ 毒霧犬（第三夜）：近戰+毒霧、HP ' + (bHp * n3.hpMult) + '，+' + n3.xp + ' XP、+2 技能點、+3 變異點。\n普通難度下精英怪具備回血特性。\n【困難難度】每夜隨機出現隼族（幽靈隼/暗影隼/毒霧隼），均為遠程攻擊且數值更高；精英不回血。',
                            'en': 'Elites are powerful special enemies that appear each night, with ' + bPr + '% poison resistance. Defeating one ends the current night early with a 50% chance to drop a Hidden Organ; a health bar and direction arrow appear on screen.\n[Easy / Normal] The Silent Hunter dog squad appears each night:\n★ Specter Dog (Night 1): melee, HP ' + (bHp * n1.hpMult) + ', kill rewards +' + n1.xp + ' XP, +1 skill pt, +1 mutation pt.\n★★ Shadow Dog (Night 2): melee, HP ' + (bHp * n2.hpMult) + ', +' + n2.xp + ' XP, +1 skill pt, +2 mutation pts.\n★★★ Venom Dog (Night 3): melee + poison fog, HP ' + (bHp * n3.hpMult) + ', +' + n3.xp + ' XP, +2 skill pts, +3 mutation pts.\nIn Normal mode Elites regenerate HP over time.\n[Hard] A falcon-type Elite (Specter / Shadow / Venom Falcon) appears each night — all ranged, higher stats, and no HP regeneration.'
                        }
                    },
                    {
                        id: 'moose',
                        title: { 'zh-TW': '🌿 駝鹿（草食性）', 'en': '🌿 Moose (Herbivore)' },
                        content: {
                            'zh-TW': '駝鹿是森林生態區的草食性生物，體型小（半徑 8）、HP 30、移速 2.4。個性溫和，遇到玩家通常逃跑（草食性 Lv2 後不再逃跑）。有 50% 機率具備戰鬥能力（傷害 3）。危險等級：低。\n在普通難度中，吃飽 5 顆果子後觸發巨人化：HP ×10、體型 ×1.5、攻擊 +20，並會召集同族組成護衛隊（最多 8 隻）。血量低時會逃向果子回血，不要主動挑釁正在護隊的巨人駝鹿。',
                            'en': 'Moose are the Forest biome\'s herbivore creature — small (radius 8), HP 30, speed 2.4. Docile by nature; they flee from players unless you reach Herbivore Lv2+. Half of them can fight (damage 3). Danger: Low.\nIn Normal mode, a Moose that eats 5 fruits Giantizes — HP ×10, size ×1.5, attack +20 — and recruits a protective pack of up to 8 members. At low HP they flee to fruits to heal. Don\'t provoke a Giantized pack carelessly.'
                        }
                    },
                    {
                        id: 'lynx',
                        title: { 'zh-TW': '🌿 猞猁（肉食性）', 'en': '🌿 Lynx (Carnivore)' },
                        content: {
                            'zh-TW': '猞猁是森林生態區的肉食性生物，體型中等（半徑 10）、HP 50、移速 3.6、傷害 5。在森林內明顯強化：50% 暴擊率（×2 傷害）、命中使玩家移速 -30% 持續 3 秒、自身移速 ×1.2。離開森林 3 秒後降至 25% 暴擊、-15% 速度 1.5 秒。危險等級：中高。\n在普通難度中可能觸發殺手化（吃 5 具屍體），成為更強大的威脅。遭遇時注意暴擊+減速疊加，可先引至森林外降低威脅。',
                            'en': 'Lynx are the Forest biome\'s carnivore creature — medium (radius 10), HP 50, speed 3.6, damage 5. In the forest they gain 50% crit chance (×2 damage), slow you by -30% for 3 seconds on hit, and move 20% faster. After 3 seconds outside the forest these drop to 25% crit and -15% slow for 1.5s. Danger: Medium-High.\nIn Normal mode they can enter Killer-mode (after eating 5 corpses), becoming far more dangerous. Watch for the crit+slow chain; lure them out of the forest to reduce their power.'
                        }
                    },
                    {
                        id: 'beetle',
                        title: { 'zh-TW': '🌊 巨型甲蟲（草食性）', 'en': '🌊 Giant Beetle (Herbivore)' },
                        content: {
                            'zh-TW': '巨型甲蟲是海洋生態區的草食性生物，體型小（半徑 8）、HP 30、移速 2.4。行為與駝鹿類似，通常在水邊覓食。高等級草食性玩家靠近時甲蟲不會逃跑，甚至完全友善。危險等級：低。\n在普通難度中也可能巨人化，形成水邊防衛隊。需注意：海洋中的鱷魚會捕食甲蟲，吃夠屍體後鱷魚持續成長壯大，間接使你的戰場更危險。',
                            'en': 'Giant Beetles are the Ocean biome\'s herbivore creature — small (radius 8), HP 30, speed 2.4. Similar behavior to Moose, foraging near the water. High-level Herbivore players can approach safely. Danger: Low.\nIn Normal mode they can also Giantize, forming a waterside defense pack. Note: in Normal mode, Crocodiles hunt Beetles and grow stronger from their corpses — this indirectly makes the ocean area more hazardous over time.'
                        }
                    },
                    {
                        id: 'croc',
                        title: { 'zh-TW': '🌊 鱷魚（肉食性）', 'en': '🌊 Crocodile (Carnivore)' },
                        content: {
                            'zh-TW': '鱷魚是海洋生態區的肉食性生物，體型中等（半徑 10）、HP 50、移速 3.6、傷害 5。在水潭生態區內攻擊 ×1.2、移速 ×1.3，有 20% 機率觸發「死亡翻滾」使玩家暈眩 1 秒（魚鱗韌性器官可縮短）。離開水潭後加成立即消失。危險等級：中高（暈眩在複雜戰況中極為致命）。\n在普通難度中可吃屍體成長，並可能觸發殺手化。',
                            'en': 'Crocodiles are the Ocean biome\'s carnivore creature — medium (radius 10), HP 50, speed 3.6, damage 5. In the ocean they gain ×1.2 attack and ×1.3 speed, with a 20% chance to trigger Death Roll (stuns you for 1 second; Fish Scale\'s tenacity reduces stun duration). Bonuses vanish instantly on leaving. Danger: Medium-High (the stun is especially lethal in chaotic fights).\nIn Normal mode they eat corpses to grow and may enter Killer-mode.'
                        }
                    },
                    {
                        id: 'camel',
                        title: { 'zh-TW': '🏜️ 駱駝（草食性）', 'en': '🏜️ Camel (Herbivore)' },
                        content: {
                            'zh-TW': '駱駝是沙漠生態區的草食性生物，體型小（半徑 8）、HP 30、移速 2.4。外觀呈淺沙黃色，在沙漠地形中有視覺融合感。危險等級：低。\n在普通難度中可能巨人化，組成沙漠護衛隊。值得注意：鬣狗以群體戰術著稱，玩家在沙漠移動時要留意，駱駝屍體可能吸引附近的鬣狗群前來，讓局面迅速惡化。',
                            'en': 'Camels are the Desert biome\'s herbivore creature — small (radius 8), HP 30, speed 2.4. Their sandy yellow color blends naturally with the desert. Danger: Low.\nIn Normal mode they can Giantize, forming desert escort packs. Note: Hyenas hunt in packs, and Camel corpses in the desert can draw nearby Hyena groups toward you — situations can escalate quickly.'
                        }
                    },
                    {
                        id: 'hyena',
                        title: { 'zh-TW': '🏜️ 鬣狗（肉食性）', 'en': '🏜️ Hyena (Carnivore)' },
                        content: {
                            'zh-TW': '鬣狗是沙漠生態區的肉食性生物，體型中等（半徑 10）、HP 50、移速 3.6、傷害 5。最大特色是群體戰術：每隻存活夥伴提供 +20% 攻擊、+5% 速度；任一成員鎖定目標後立刻通報 600px 內所有夥伴出動。沙漠內移速 ×1.1；離開沙漠 3 秒後攻擊與速度各降至 ×0.5。危險等級：高（群體戰術）。\n在普通難度中可吃屍體並觸發殺手化。獨遇時尚可應付，多隻同時出現時極為致命。',
                            'en': 'Hyenas are the Desert biome\'s carnivore creature — medium (radius 10), HP 50, speed 3.6, damage 5. Their defining trait is pack tactics: each surviving packmate grants +20% attack and +5% speed, and any member locking onto you alerts all packmates within 600px instantly. In-desert speed bonus ×1.1; 3 seconds after leaving, attack and speed both halve. Danger: High (pack tactics).\nIn Normal mode they eat corpses and can enter Killer-mode. A lone Hyena is manageable; multiple together are lethal.'
                        }
                    }
                ]
            }
        ]
    };
})();
