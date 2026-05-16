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

const MAP_RULES = {
    MIN_BIOME_TILES: 250,
};

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

    const grad4 = [
        [0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],
        [0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],
        [1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],
        [-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],
        [1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],
        [-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],
        [1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],
        [-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]
    ];

    function dot(g, x, y) { return g[0] * x + g[1] * y; }
    function dot4(g, x, y, z, w) { return g[0]*x + g[1]*y + g[2]*z + g[3]*w; }

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

    // 4D Simplex Noise — 用於 Tileable Noise 的核心計算
    function noise4d(perm, x, y, z, w) {
        const F4 = (Math.sqrt(5) - 1) / 4;
        const G4 = (5 - Math.sqrt(5)) / 20;
        const s = (x + y + z + w) * F4;
        const i = Math.floor(x + s), j = Math.floor(y + s);
        const k = Math.floor(z + s), l = Math.floor(w + s);
        const t = (i + j + k + l) * G4;
        const x0 = x - (i - t), y0 = y - (j - t);
        const z0 = z - (k - t), w0 = w - (l - t);

        // 依大小排序決定 simplex 路徑
        let rankx = 0, ranky = 0, rankz = 0, rankw = 0;
        if (x0 > y0) rankx++; else ranky++;
        if (x0 > z0) rankx++; else rankz++;
        if (x0 > w0) rankx++; else rankw++;
        if (y0 > z0) ranky++; else rankz++;
        if (y0 > w0) ranky++; else rankw++;
        if (z0 > w0) rankz++; else rankw++;

        const i1 = rankx >= 3 ? 1 : 0, j1 = ranky >= 3 ? 1 : 0;
        const k1 = rankz >= 3 ? 1 : 0, l1 = rankw >= 3 ? 1 : 0;
        const i2 = rankx >= 2 ? 1 : 0, j2 = ranky >= 2 ? 1 : 0;
        const k2 = rankz >= 2 ? 1 : 0, l2 = rankw >= 2 ? 1 : 0;
        const i3 = rankx >= 1 ? 1 : 0, j3 = ranky >= 1 ? 1 : 0;
        const k3 = rankz >= 1 ? 1 : 0, l3 = rankw >= 1 ? 1 : 0;

        const x1 = x0 - i1 + G4,     y1 = y0 - j1 + G4;
        const z1 = z0 - k1 + G4,     w1 = w0 - l1 + G4;
        const x2 = x0 - i2 + 2*G4,   y2 = y0 - j2 + 2*G4;
        const z2 = z0 - k2 + 2*G4,   w2 = w0 - l2 + 2*G4;
        const x3 = x0 - i3 + 3*G4,   y3 = y0 - j3 + 3*G4;
        const z3 = z0 - k3 + 3*G4,   w3 = w0 - l3 + 3*G4;
        const x4 = x0 - 1  + 4*G4,   y4 = y0 - 1  + 4*G4;
        const z4 = z0 - 1  + 4*G4,   w4 = w0 - 1  + 4*G4;

        const ii = i & 255, jj = j & 255, kk = k & 255, ll = l & 255;
        const gi0 = perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32;
        const gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32;
        const gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32;
        const gi3 = perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32;
        const gi4 = perm[ii + 1  + perm[jj + 1  + perm[kk + 1  + perm[ll + 1 ]]]] % 32;

        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0 - w0*w0;
        const n0 = t0 < 0 ? 0 : (t0 *= t0, t0 * t0 * dot4(grad4[gi0], x0, y0, z0, w0));
        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1 - w1*w1;
        const n1 = t1 < 0 ? 0 : (t1 *= t1, t1 * t1 * dot4(grad4[gi1], x1, y1, z1, w1));
        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2 - w2*w2;
        const n2 = t2 < 0 ? 0 : (t2 *= t2, t2 * t2 * dot4(grad4[gi2], x2, y2, z2, w2));
        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3 - w3*w3;
        const n3 = t3 < 0 ? 0 : (t3 *= t3, t3 * t3 * dot4(grad4[gi3], x3, y3, z3, w3));
        let t4 = 0.6 - x4*x4 - y4*y4 - z4*z4 - w4*w4;
        const n4 = t4 < 0 ? 0 : (t4 *= t4, t4 * t4 * dot4(grad4[gi4], x4, y4, z4, w4));

        return 27 * (n0 + n1 + n2 + n3 + n4);
    }

    // Tileable Noise：把 2D 座標投影到 4D 圓柱面，使邊界無縫連續
    function tileableNoise(perm, x, y, W, H) {
        const TWO_PI = 2 * Math.PI;
        const nx = Math.cos(TWO_PI * x / W);
        const ny = Math.cos(TWO_PI * y / H);
        const nz = Math.sin(TWO_PI * x / W);
        const nw = Math.sin(TWO_PI * y / H);
        return noise4d(perm, nx, ny, nz, nw);
    }

    return { buildPerm, noise2d, noise4d, tileableNoise };
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

// flood fill：回傳每格所屬 regionId 和 regions 陣列
function labelBiomeRegions(terrainMap, gridW, gridH) {
    const regionId = Array.from({length: gridH}, () => new Int32Array(gridW).fill(-1));
    const regions  = [];
    const DIRS     = [[-1,0],[1,0],[0,-1],[0,1]];
    let nextId = 0;

    for (let r = 0; r < gridH; r++) {
        for (let c = 0; c < gridW; c++) {
            if (regionId[r][c] !== -1) continue;
            const biome = terrainMap[r][c];
            const id    = nextId++;
            const cells = [];
            const stack = [[r, c]];
            regionId[r][c] = id;
            while (stack.length) {
                const [cr, cc] = stack.pop();
                cells.push({row: cr, col: cc});
                for (const [dr, dc] of DIRS) {
                    const nr = ((cr + dr) + gridH) % gridH;
                    const nc = ((cc + dc) + gridW) % gridW;
                    if (regionId[nr][nc] !== -1) continue;
                    if (terrainMap[nr][nc] !== biome) continue;
                    regionId[nr][nc] = id;
                    stack.push([nr, nc]);
                }
            }
            // (r,c) 是此區塊在行掃描中最先遇到的格，即最靠上左的格
            regions.push({id, biome, cells, size: cells.length, minRow: r, minCol: c});
        }
    }
    return {regionId, regions};
}

// 同化所有 size < minTiles 的孤島
function mergeSmallRegions(terrainMap, gridW, gridH, minTiles) {
    const {regionId, regions} = labelBiomeRegions(terrainMap, gridW, gridH);

    // 建立區塊鄰接圖（環形：四方向皆考慮邊界環繞）
    const adj = regions.map(() => new Set());
    const ADJ_DIRS = [[-1,0],[1,0],[0,-1],[0,1]];
    for (let r = 0; r < gridH; r++) {
        for (let c = 0; c < gridW; c++) {
            const id = regionId[r][c];
            for (const [dr, dc] of ADJ_DIRS) {
                const nr = ((r + dr) + gridH) % gridH;
                const nc = ((c + dc) + gridW) % gridW;
                const nid = regionId[nr][nc];
                if (nid !== id) { adj[id].add(nid); adj[nid].add(id); }
            }
        }
    }

    const alive = new Set(regions.map(reg => reg.id));

    let found = true;
    while (found) {
        found = false;

        // 找最小的孤島（tie: minRow → minCol）
        let candidate = null;
        for (const id of alive) {
            const reg = regions[id];
            if (reg.size >= minTiles) continue;
            if (candidate === null || reg.size < candidate.size ||
                (reg.size === candidate.size && (reg.minRow < candidate.minRow ||
                 (reg.minRow === candidate.minRow && reg.minCol < candidate.minCol)))) {
                candidate = reg;
            }
        }
        if (!candidate) break;

        const adjList = [...adj[candidate.id]]
            .filter(id => alive.has(id))
            .map(id => regions[id]);

        if (adjList.length === 0) break;

        // valid：合併後 >= minTiles 的相鄰區塊
        const valid = adjList.filter(r => r.size + candidate.size >= minTiles);

        let target;
        if (valid.length > 0) {
            valid.sort((a, b) => a.size - b.size || a.minRow - b.minRow || a.minCol - b.minCol);
            target = valid[0];
        } else {
            // 周圍全是孤島：合併最大的相鄰孤島後重新判斷
            adjList.sort((a, b) => b.size - a.size || a.minRow - b.minRow || a.minCol - b.minCol);
            target = adjList[0];
        }

        // 把 candidate 所有格子改成 target 的地形
        for (const {row, col} of candidate.cells) {
            terrainMap[row][col] = target.biome;
            regionId[row][col]   = target.id;
        }
        for (const cell of candidate.cells) target.cells.push(cell);
        target.size += candidate.size;

        // 更新鄰接圖：把 candidate 的鄰居轉移給 target
        for (const nid of adj[candidate.id]) {
            if (nid === target.id || !alive.has(nid)) continue;
            adj[target.id].add(nid);
            adj[nid].delete(candidate.id);
            adj[nid].add(target.id);
        }
        adj[target.id].delete(candidate.id);

        alive.delete(candidate.id);
        found = true;
    }
}

// 確認所有 requiredBiomes 都存在於 terrainMap，回傳 true/false
function ensureRequiredBiomes(terrainMap, gridW, gridH, requiredBiomes) {
    if (requiredBiomes.length === 0) return true;
    const existing = new Set();
    for (let r = 0; r < gridH; r++) {
        for (let c = 0; c < gridW; c++) {
            existing.add(terrainMap[r][c]);
        }
    }
    return requiredBiomes.every(b => existing.has(b));
}

function generateTerrain() {
    const cfg          = (gameState.currentMap && gameState.currentMap.terrain) || {};
    const centerRadius = cfg.forestCenterRadius  || 400;
    const forestThr    = cfg.forestThreshold     || 0.2;
    const oceanThr     = cfg.oceanThreshold      || -0.2;
    const requiredBiomes = cfg.requiredBiomes    || [];
    const cols = MAP_WIDTH  / TILE_SIZE; // 400
    const rows = MAP_HEIGHT / TILE_SIZE; // 400
    const cx   = MAP_WIDTH  / 2;
    const cy   = MAP_HEIGHT / 2;
    let minTiles = cfg.minBiomeTiles !== undefined ? cfg.minBiomeTiles : MAP_RULES.MIN_BIOME_TILES;

    function buildMap(seed, mt) {
        const perm = _SimplexNoise.buildPerm(seed | 0);
        const map  = [];
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
                    const n = _SimplexNoise.tileableNoise(perm, gx + 0.5, gy + 0.5, cols, rows);
                    if (n > forestThr)     biome = 'forest';
                    else if (n < oceanThr) biome = 'ocean';
                    else                   biome = 'desert';
                }
                row.push(biome);
            }
            map.push(row);
        }
        mergeSmallRegions(map, cols, rows, mt);
        return map;
    }

    let map, ok = false;
    for (let i = 0; i < 10 && !ok; i++) {
        if (i > 0) gameState.mapSeed = (Math.random() * 0x100000000) >>> 0;
        map = buildMap(gameState.mapSeed, minTiles);
        ok  = ensureRequiredBiomes(map, cols, rows, requiredBiomes);
    }
    if (!ok) {
        console.warn('--- 地形生成：10次嘗試仍缺少生態，改用 minTiles/2 ---');
        gameState.mapSeed = (Math.random() * 0x100000000) >>> 0;
        map = buildMap(gameState.mapSeed, Math.floor(minTiles / 2));
    }

    gameState.terrainMap = map;
    console.log('--- 地形生成完成（seed=' + (gameState.mapSeed | 0) + '，' + cols + 'x' + rows + ' 格，Tileable Noise）---');
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
            const nextGx = (gx + 1) % cols;
            const nextGy = (gy + 1) % rows;
            if (gameState.terrainMap[gy][nextGx] !== cur) {
                tctx.fillRect((gx + 1) * TILE_SIZE - 1, gy * TILE_SIZE, 2, TILE_SIZE);
            }
            if (gameState.terrainMap[nextGy][gx] !== cur) {
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
