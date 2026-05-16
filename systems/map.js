// =============================================================
// 地圖系統 - MAP 常數 / getBiome / getBgColor / generateTrees
// =============================================================

const MAP_WIDTH  = 8000;
const MAP_HEIGHT = 8000;
const VIEW_W     = 1600;
const VIEW_H     = 900;

const TILE_SIZE   = 20;    // 地形格子大小，改這個數字可以調整解析度
const NOISE_SCALE = 0.003; // Noise 縮放比例，影響地形大小

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
