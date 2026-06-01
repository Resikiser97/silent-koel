// =============================================================
// 共用繪圖工具 - drawArrow / drawHealthBar / drawNameTag / drawGlowEffect
// 韌性計算      - applyTenacity
// =============================================================

/**
 * 韌性計算：用目標自身的韌性縮短控制效果持續時間。
 * @param {number} durationMs  原始持續毫秒
 * @param {object} target      被控制的目標（player 或 creature）
 * @returns {number} 縮短後的毫秒數（最小值 0）
 *
 * 範例：
 *   玩家被暈眩 1000ms，魚鱗韌性 30% → applyTenacity(1000, p) = 700ms
 *   敵人被嘴器減速 2000ms，c.tenacity 目前為 0 → 仍為 2000ms
 */
function getGameFont(baseSize, baseBold) {
    const size = gameState.settings.fontLarge ? baseSize + 5 : baseSize;
    const bold = (gameState.settings.fontBold || baseBold) ? 'bold ' : '';
    return bold + size + 'px Arial';
}

function applyTenacity(durationMs, target) {
    const t = (target && target.tenacity) || 0;
    return Math.max(0, Math.round(durationMs * (1 - t)));
}

// 在玩家螢幕座標 (px, py) 周圍，朝世界座標 (targetWorldX, targetWorldY) 畫一個指向箭頭
// 距離 = playerRadius + 20px；透明度每 0.5 秒在 0.6↔1.0 之間閃爍
function drawArrow(px, py, targetWorldX, targetWorldY, color, playerRadius) {
    const { dx, dy } = wrappedDelta(gameState.player.x, gameState.player.y, targetWorldX, targetWorldY);
    const angle = Math.atan2(dy, dx);
    const dist = playerRadius + 20;
    const ax = px + Math.cos(angle) * dist;
    const ay = py + Math.sin(angle) * dist;
    const alpha = Math.floor(Date.now() / 500) % 2 === 0 ? 0.6 : 1.0;
    const cx = Math.cos(angle), cy = Math.sin(angle);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - cx * 10 - cy * 3, ay - cy * 10 + cx * 3);
    ctx.lineTo(ax - cx * 10 + cy * 3, ay - cy * 10 - cx * 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// 在 (sx, sy) 為血條頂端左角畫一條血條；sx 為水平中心點
function drawHealthBar(sx, sy, hp, maxHp, width, fillColor, bgColor, height) {
    const bX = sx - width / 2;
    ctx.fillStyle = bgColor;
    ctx.fillRect(bX, sy, width, height);
    ctx.fillStyle = fillColor;
    ctx.fillRect(bX, sy, width * (hp / maxHp), height);
}

// 在 (sx, sy) 畫名字標籤，sy 為文字基線位置
function drawNameTag(sx, sy, name, color, font) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.fillText(name, sx, sy);
    ctx.restore();
}

// 在 (sx, sy) 畫一個帶光暈的填色圓形
function drawGlowEffect(sx, sy, radius, fillColor, glowColor, glowBlur) {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// =============================================================
// 圓形平均角度散落函式
// spawnLootCircle(cx, cy, items)
//   cx, cy  — 散落中心點（死亡位置）
//   items   — [{ type, data }, ...]
//     type 'corpse': data = { multiplier }，radius 按 multiplier 縮放
//     type 'bone'  : data = {}，直接呼叫 _spawnBone
//     （未來 Phase 可新增 mutation 等 type）
// =============================================================
function spawnLootCircle(cx, cy, items) {
    if (!items || items.length === 0) return;
    const count = items.length;
    const now = Date.now();
    items.forEach((item, index) => {
        // 單個物品隨機角度；多個物品平均分配
        const angle = count === 1
            ? Math.random() * Math.PI * 2
            : (2 * Math.PI / count) * index;
        const dist = 10 + Math.random() * 15; // 10~25px
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        if (item.type === 'corpse') {
            const multiplier = (item.data && item.data.multiplier != null) ? item.data.multiplier : 1;
            const baseRadius = 8;
            const radius = multiplier > 1 ? baseRadius * 1.5 : baseRadius;
            gameState.corpses.push({ x, y, radius, spawnTime: now });
        } else if (item.type === 'bone') {
            _spawnBone(x, y, 8);
        }
    });
}
