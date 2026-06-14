// =============================================================
// Copy audio assets into dist/sounds for bundled deployments
// =============================================================
import { existsSync, cpSync, rmSync } from 'fs';

if (!existsSync('dist')) {
    console.error('dist folder does not exist. Run vite build first.');
    process.exit(1);
}

if (!existsSync('sounds')) {
    console.error('sounds folder does not exist.');
    process.exit(1);
}

if (existsSync('dist/sounds')) rmSync('dist/sounds', { recursive: true });
cpSync('sounds', 'dist/sounds', { recursive: true });

console.log('Copied sounds/ to dist/sounds/');
