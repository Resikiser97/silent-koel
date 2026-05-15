// =============================================================
// 鏡頭與地形系統 - wrappedDistance / wrappedDelta / worldToScreen
//                  updateCamera / getBiome / getBgColor
// =============================================================

function wrappedDistance(x1, y1, x2, y2) {
    let dx = Math.abs(x2 - x1);
    if (dx > MAP_WIDTH  / 2) dx = MAP_WIDTH  - dx;
    let dy = Math.abs(y2 - y1);
    if (dy > MAP_HEIGHT / 2) dy = MAP_HEIGHT - dy;
    return Math.sqrt(dx * dx + dy * dy);
}

function wrappedDelta(ax, ay, bx, by) {
    let dx = bx - ax;
    let dy = by - ay;
    if (dx >  MAP_WIDTH  / 2) dx -= MAP_WIDTH;
    else if (dx < -MAP_WIDTH  / 2) dx += MAP_WIDTH;
    if (dy >  MAP_HEIGHT / 2) dy -= MAP_HEIGHT;
    else if (dy < -MAP_HEIGHT / 2) dy += MAP_HEIGHT;
    return { dx, dy };
}

function worldToScreen(wx, wy) {
    let sx = wx - gameState.camera.x;
    let sy = wy - gameState.camera.y;
    if (sx < -MAP_WIDTH  / 2) sx += MAP_WIDTH;
    else if (sx >  MAP_WIDTH  / 2) sx -= MAP_WIDTH;
    if (sy < -MAP_HEIGHT / 2) sy += MAP_HEIGHT;
    else if (sy >  MAP_HEIGHT / 2) sy -= MAP_HEIGHT;
    return { x: sx, y: sy };
}

function updateCamera() {
    const p = gameState.player;
    const cam = gameState.camera;
    const marginX = VIEW_W * 0.25;
    const marginY = VIEW_H * 0.25;
    let screenX = p.x - cam.x;
    let screenY = p.y - cam.y;
    if (screenX < -MAP_WIDTH  / 2) screenX += MAP_WIDTH;
    else if (screenX >  MAP_WIDTH  / 2) screenX -= MAP_WIDTH;
    if (screenY < -MAP_HEIGHT / 2) screenY += MAP_HEIGHT;
    else if (screenY >  MAP_HEIGHT / 2) screenY -= MAP_HEIGHT;
    let targetX = cam.x;
    let targetY = cam.y;
    if (screenX < marginX)               targetX = cam.x + (screenX - marginX);
    else if (screenX > VIEW_W - marginX) targetX = cam.x + (screenX - (VIEW_W - marginX));
    if (screenY < marginY)               targetY = cam.y + (screenY - marginY);
    else if (screenY > VIEW_H - marginY) targetY = cam.y + (screenY - (VIEW_H - marginY));
    cam.x += (targetX - cam.x) * 0.15;
    cam.y += (targetY - cam.y) * 0.15;
    cam.x = ((cam.x % MAP_WIDTH)  + MAP_WIDTH)  % MAP_WIDTH;
    cam.y = ((cam.y % MAP_HEIGHT) + MAP_HEIGHT) % MAP_HEIGHT;
}

function getBiome(x, y) {
    const dist = Math.sqrt((x - 4000) * (x - 4000) + (y - 4000) * (y - 4000));
    if (dist < 2000) return 'forest';
    if (x > 5000 || y > 5000) return 'ocean';
    return 'desert';
}

function getBgColor() {
    const p = gameState.player;
    const night = gameState.isNight;
    const C = {
        forest: night ? [26,46,26]    : [84,153,84],
        ocean:  night ? [10,31,48]    : [26,74,107],
        desert: night ? [92,61,10]    : [196,163,90]
    };
    const cx = 4000, cy = 4000;
    const dx = p.x - cx, dy = p.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const TRANS = 200;
    const mix = (a, b, t) => Math.round(a * (1 - t) + b * t);

    const toEdge = Math.abs(dist - 2000);
    if (toEdge < TRANS) {
        const t = (1 - toEdge / TRANS) * 0.45;
        const biome = getBiome(p.x, p.y);
        let other;
        if (biome === 'forest') {
            const od = dist > 0 ? 2200 / dist : 0;
            other = getBiome(cx + dx * od, cy + dy * od);
        } else {
            other = 'forest';
        }
        const a = C[biome], b = C[other];
        return 'rgb(' + mix(a[0],b[0],t) + ',' + mix(a[1],b[1],t) + ',' + mix(a[2],b[2],t) + ')';
    }

    if (dist >= 2000) {
        const biome = getBiome(p.x, p.y);
        const minD = Math.min(Math.abs(p.x - 5000), Math.abs(p.y - 5000));
        if (minD < TRANS) {
            const t = (1 - minD / TRANS) * 0.45;
            const other = biome === 'ocean' ? 'desert' : 'ocean';
            const a = C[biome], b = C[other];
            return 'rgb(' + mix(a[0],b[0],t) + ',' + mix(a[1],b[1],t) + ',' + mix(a[2],b[2],t) + ')';
        }
    }

    const c = C[getBiome(p.x, p.y)];
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}
