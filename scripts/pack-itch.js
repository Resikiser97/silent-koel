import { createWriteStream, existsSync, cpSync, rmSync } from 'fs';
import { createRequire } from 'module';

const { ZipArchive } = createRequire(import.meta.url)('archiver');

if (!existsSync('dist')) {
    console.error('dist 資料夾不存在，請先執行 npm run build');
    process.exit(1);
}

console.log('🔊 複製音效資料夾...');
if (existsSync('dist/sounds')) rmSync('dist/sounds', { recursive: true });
cpSync('sounds', 'dist/sounds', { recursive: true });

const zipName = 'silent-koel-itch.zip';
if (existsSync(zipName)) rmSync(zipName);

console.log('📦 打包 itch.io zip...');
const output = createWriteStream(zipName);
const archive = new ZipArchive({ zlib: { level: 6 } });

await new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory('dist/', false);
    archive.finalize();
});

console.log(`✅ 完成：${zipName}（${(archive.pointer() / 1024 / 1024).toFixed(1)} MB）`);
