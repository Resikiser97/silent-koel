# 地圖設計文件

## 地圖系統說明
- 地圖大小：8000x8000
- 地形格子大小：20x20px（TILE_SIZE 常數）
- 每局 Noise seed 完全隨機
- 中心點（4000,4000）往外 400px 保護區強制為森林

## 地形類型
- 森林（forest）：#549954，安全地形，開局起點
- 海洋（ocean）：#1a4a6b，中等危險
- 沙漠（desert）：#c4a35a，高危險

## 難度地圖檔案
- easymap.js：簡單難度
- normalmap.js：普通難度（待製作）
- hardmap.js：困難難度（待製作）
- hellmap.js：地獄難度（待製作）

## 新增難度地圖步驟
1. 複製 easymap.js 改名
2. 修改各項數值
3. 在首頁難度選擇頁面新增對應選項

## 地形生成規則（所有地圖必須遵守）

### 規則一：Tileable Noise（無縫地圖）
- 地圖左右邊界和上下邊界的 Noise 值必須連續
- 玩家從右邊走出去從左邊進來，地形不會突然跳變
- 實現方式：使用 4D Noise 投影到 2D 圓柱面
  - x 軸：cos(2π * x/W) 和 sin(2π * x/W) 投影
  - y 軸：cos(2π * y/H) 和 sin(2π * y/H) 投影

### 規則二：最小生態格數（MIN_BIOME_TILES）
- 每個獨立生態區塊必須大於等於 MIN_BIOME_TILES 格
- 預設值：250 格（每格 20x20px）
- 各地圖可在自己的配置檔案覆蓋此值
- 低於門檻的孤島按以下邏輯同化：
  1. 找出所有小於 MIN_BIOME_TILES 的孤島，從最小的開始處理
  2. 找出該孤島所有相鄰的不同地形區塊
  3. 找出合併後大於等於 MIN_BIOME_TILES 的相鄰區塊（valid 選項）
  4. 從 valid 選項中選最小的；若有相同大小，選最靠近上方的；若仍相同，選最靠近左方的
  5. 孤島變成該地形
  6. 如果周圍全部是孤島（無 valid 選項），把當前相鄰最大的孤島合併，組成更大的孤島後重新判斷
  7. 重複直到所有區塊都大於等於 MIN_BIOME_TILES

### 規則三：強制生態完整性（REQUIRED_BIOMES）
- 地圖配置檔案裡定義 requiredBiomes 陣列，列出該地圖必須同時存在的所有生態
- 例如：easymap 需要 ['forest','ocean','desert']，未來困難地圖可能需要 4 種生態
- 生成後如果缺少任何一種 requiredBiomes 裡的生態，重新生成整個地圖直到全部存在
- 保護區的強制森林算在 forest 生態的存在判斷內
- 重新生成時使用新的隨機 seed，最多重試 10 次，超過則放寬 MIN_BIOME_TILES 為原本的一半再試

### 保護區規則
- 中心點（4000,4000）往外 forestCenterRadius 範圍強制為森林
- 保護區不參與同化邏輯，永遠存在
- 如果保護區附近的森林孤島不足 MIN_BIOME_TILES，優先與保護區連接

## 變量位置規範
- MAP_RULES（全域預設值）：systems/map.js
- 個別地圖的 requiredBiomes 和 minBiomeTiles：各地圖配置檔案的 terrain 區塊
- 未來新增生態只需要在地圖配置檔案的 requiredBiomes 加入新生態名稱
