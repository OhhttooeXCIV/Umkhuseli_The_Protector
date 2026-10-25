import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Find all Umkhuseli_Safe APKs in root directory
const rootFiles = fs.existsSync(rootDir) ? fs.readdirSync(rootDir) : [];
const apks = rootFiles
  .filter((f) => f.startsWith('Umkhuseli_Safe_') && f.endsWith('.apk') && !f.includes('latest'))
  .map((f) => ({
    name: f,
    path: path.join(rootDir, f),
    mtime: fs.statSync(path.join(rootDir, f)).mtimeMs
  }));

let targetApk = '';

if (apks.length > 0) {
  // Sort descending by modified time so newest APK is first
  apks.sort((a, b) => b.mtime - a.mtime);
  targetApk = apks[0].path;
  console.log(`[Deploy] Selected newest versioned APK: ${apks[0].name}`);
} else {
  // Fallback to gradle build output
  const debugApk = path.join(rootDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (fs.existsSync(debugApk)) {
    targetApk = debugApk;
    console.log(`[Deploy] Using gradle build output APK: ${debugApk}`);
  }
}

if (!targetApk) {
  console.error('[Deploy Error] No Umkhuseli APK found. Please run ./gradlew assembleDebug first.');
  process.exit(1);
}

console.log(`[Deploy] Executing: adb install -r "${targetApk}"`);
try {
  execSync(`adb install -r "${targetApk}"`, { stdio: 'inherit' });
  console.log('[Deploy Success] APK installed successfully on target device/emulator.');
} catch (err) {
  console.error('[Deploy Error] adb install command failed:', err.message);
  process.exit(1);
}
