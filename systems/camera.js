// =============================================================
// 鏡頭系統 - wrappedDistance / wrappedDelta / worldToScreen / updateCamera
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
    const marginX = VIEW_W * 0.30;
    const marginY = VIEW_H * 0.30;
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

