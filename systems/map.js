// =============================================================
// 地圖系統 - MAP 常數 / Simplex Noise / getBiome / getBgColor
//            generateTerrain / generateTrees
// =============================================================

const MAP_WIDTH  = 8000;
const MAP_HEIGHT = 8000;
const VIEW_W     = 1600;
const VIEW_H     = 900;

const TILE_SIZE   = 20;    // 地形格子大小，改這個數字可以調整解析度
const NOISE_SCALE = 0.003; // Noise 縮放比例，影響地形大小

// ---- Simplex Noise（純 JS，不依賴外部函式庫）----
const _SimplexNoise = (function() {
    const grad3 = [
        [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
        [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
        [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];

    function buildPerm(seed) {
        let s = seed | 0;
        const p = Array.from({length: 256}, (_, i) => i);
        for (let i = 255; i > 0; i--) {
            s = (s * 1664525 + 1013904223) | 0;
            const j = (s >>> 0) % (i + 1);
            const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
        }
        const perm = new Uint8Array(512);
        for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
        return perm;
    }

    function dot(g, x, y) { return g[0] * x + g[1] * y; }

    function noise2d(perm, xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const t = (i + j) * G2;
        const x0 = xin - (i - t), y0 = yin - (j - t);
        const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
        const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        const ii = i & 255, jj = j & 255;
        const gi0 = perm[ii + perm[jj]] % 12;
        const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
        const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        const n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * dot(grad3[gi0], x0, y0));
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        const n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * dot(grad3[gi1], x1, y1));
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        const n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * dot(grad3[gi2], x2, y2));
        return 70 * (n0 + n1 + n2);
    }

    return { buildPerm, noise2d };
})();

const BIOME_COLOR = { forest: '#549954', ocean: '#1a4a6b', desert: '#c4a35a' };

let _terrainCanvas = null;

// terrainMap 未就緒前 fallback 到舊公式，確保載入順序安全
function getBiome(x, y) {
    if (!gameState.terrainMap) {
        const dist = Math.sqrt((x - 4000) * (x - 4000) + (y - 4000) * (y - 4000));
        if (dist < 2000) return 'forest';
        if (x > 5000 || y > 5000) return 'ocean';
        return 'desert';
    }
    const cols = MAP_WIDTH  / TILE_SIZE;
    const rows = MAP_HEIGHT / TILE_SIZE;
    const gx = Math.max(0, Math.min(cols - 1, Math.floor(x / TILE_SIZE)));
    const gy = Math.max(0, Math.min(rows - 1, Math.floor(y / TILE_SIZE)));
    return gameState.terrainMap[gy][gx];
}

function getBgColor() {
    const p = gameState.player;
    const night = gameState.isNight;
    const C = {
        forest: night ? [26,46,26]  : [84,153,84],
        ocean:  night ? [10,31,48]  : [26,74,107],
        desert: night ? [92,61,10]  : [196,163,90]
    };
    const c = C[getBiome(p.x, p.y)];
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

function generateTerrain() {
    const cfg          = (gameState.currentMap && gameState.currentMap.terrain) || {};
    const noiseScale   = cfg.noiseScale         || NOISE_SCALE;
    const centerRadius = cfg.forestCenterRadius  || 400;
    const forestThr    = cfg.forestThreshold     || 0.2;
    const oceanThr     = cfg.oceanThreshold      || -0.2;

    const perm = _SimplexNoise.buildPerm(gameState.mapSeed | 0);
    const cols = MAP_WIDTH  / TILE_SIZE; // 400
    const rows = MAP_HEIGHT / TILE_SIZE; // 400
    const cx   = MAP_WIDTH  / 2;        // 4000
    const cy   = MAP_HEIGHT / 2;        // 4000
    gameState.terrainMap = [];
    for (let gy = 0; gy < rows; gy++) {
        const row = [];
        for (let gx = 0; gx < cols; gx++) {
            const wx = (gx + 0.5) * TILE_SIZE;
            const wy = (gy + 0.5) * TILE_SIZE;
            const dist = Math.sqrt((wx - cx) * (wx - cx) + (wy - cy) * (wy - cy));
            let biome;
            if (dist < centerRadius) {
                biome = 'forest';
            } else {
                const n = _SimplexNoise.noise2d(perm, wx * noiseScale, wy * noiseScale);
                if (n > forestThr)      biome = 'forest';
                else if (n < oceanThr)  biome = 'ocean';
                else                    biome = 'desert';
            }
            row.push(biome);
        }
        gameState.terrainMap.push(row);
    }
    console.log("--- 地形生成完成（seed=" + (gameState.mapSeed | 0) + "，" + cols + "x" + rows + " 格）---");
    buildTerrainCanvas();
}

// 將整張 terrainMap 預渲染到離屏 Canvas（8000x8000）
function buildTerrainCanvas() {
    const tc = document.createElement('canvas');
    tc.width  = MAP_WIDTH;
    tc.height = MAP_HEIGHT;
    const tctx = tc.getContext('2d');
    const cols = MAP_WIDTH  / TILE_SIZE; // 400
    const rows = MAP_HEIGHT / TILE_SIZE; // 400

    // 第一遍：填入各格地形顏色
    for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
            tctx.fillStyle = BIOME_COLOR[gameState.terrainMap[gy][gx]] || '#549954';
            tctx.fillRect(gx * TILE_SIZE, gy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // 第二遍：相鄰格地形不同時畫 2px 半透明白色邊界線
    tctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
            const cur = gameState.terrainMap[gy][gx];
            if (gx + 1 < cols && gameState.terrainMap[gy][gx + 1] !== cur) {
                tctx.fillRect((gx + 1) * TILE_SIZE - 1, gy * TILE_SIZE, 2, TILE_SIZE);
            }
            if (gy + 1 < rows && gameState.terrainMap[gy + 1][gx] !== cur) {
                tctx.fillRect(gx * TILE_SIZE, (gy + 1) * TILE_SIZE - 1, TILE_SIZE, 2);
            }
        }
    }

    _terrainCanvas = tc;
    console.log("--- 地形預渲染完成（" + MAP_WIDTH + "x" + MAP_HEIGHT + " px）---");
}

// 把離屏 Canvas 對應視窗的區域貼到主 Canvas，支援地圖環繞
function drawTerrain() {
    if (!_terrainCanvas) {
        ctx.fillStyle = getBgColor();
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
        return;
    }
    const camX = gameState.camera.x;
    const camY = gameState.camera.y;
    ctx.imageSmoothingEnabled = false;

    const wrapX = camX + VIEW_W > MAP_WIDTH;
    const wrapY = camY + VIEW_H > MAP_HEIGHT;

    if (!wrapX && !wrapY) {
        ctx.drawImage(_terrainCanvas, camX, camY, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
    } else if (wrapX && !wrapY) {
        const w1 = MAP_WIDTH - camX;
        ctx.drawImage(_terrainCanvas, camX, camY, w1,          VIEW_H, 0,  0, w1,          VIEW_H);
        ctx.drawImage(_terrainCanvas, 0,    camY, VIEW_W - w1, VIEW_H, w1, 0, VIEW_W - w1, VIEW_H);
    } else if (!wrapX && wrapY) {
        const h1 = MAP_HEIGHT - camY;
        ctx.drawImage(_terrainCanvas, camX, camY, VIEW_W, h1,          0, 0,  VIEW_W, h1);
        ctx.drawImage(_terrainCanvas, camX, 0,    VIEW_W, VIEW_H - h1, 0, h1, VIEW_W, VIEW_H - h1);
    } else {
        const w1 = MAP_WIDTH  - camX, w2 = VIEW_W  - w1;
        const h1 = MAP_HEIGHT - camY, h2 = VIEW_H - h1;
        ctx.drawImage(_terrainCanvas, camX, camY, w1, h1, 0,  0,  w1, h1);
        ctx.drawImage(_terrainCanvas, 0,    camY, w2, h1, w1, 0,  w2, h1);
        ctx.drawImage(_terrainCanvas, camX, 0,    w1, h2, 0,  h1, w1, h2);
        ctx.drawImage(_terrainCanvas, 0,    0,    w2, h2, w1, h1, w2, h2);
    }

    // 夜晚遮罩
    if (gameState.isNight) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
}

function generateTrees(count) {
    const trees = [];
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * (MAP_WIDTH  - 100)) + 50;
        const y = Math.floor(Math.random() * (MAP_HEIGHT - 100)) + 50;
        const isLarge = Math.random() < 0.4;
        const radius = isLarge
            ? Math.floor(Math.random() * 11 + 25)
            : Math.floor(Math.random() *  9 + 12);
        const biome = getBiome(x, y);
        const treeColor = biome === 'ocean' ? '#005599' : (biome === 'desert' ? '#7B6B00' : 'darkgreen');
        const treeSize = isLarge ? 'large' : 'small';
        trees.push({ x, y, radius, color: treeColor, isLarge, treeSize, fruitCount: 0, fruitTimer: 0 });
    }
    gameState.trees = trees;
    console.log("--- 初始化完成：共生成 " + gameState.trees.length + " 棵樹木（大/小各佔約4/6）---");
}
