import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// 1. Locate adb binary (check PATH and standard Android SDK locations)
function resolveAdbPath() {
  try {
    execSync('adb version', { stdio: 'ignore' });
    return 'adb';
  } catch (e) {
    // Check LOCALAPPDATA / ANDROID_HOME / ANDROID_SDK_ROOT
    const localAppData = process.env.LOCALAPPDATA || '';
    const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '';
    const candidatePaths = [
      path.join(localAppData, 'Android', 'Sdk', 'platform-tools', 'adb.exe'),
      path.join(androidHome, 'platform-tools', 'adb.exe'),
      path.join(localAppData, 'Android', 'platform-tools', 'adb.exe')
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return `"${p}"`;
      }
    }
    return 'adb';
  }
}

// 2. Find all Umkhuseli_Safe APKs in root directory
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
  // Sort descending by modified time so newest APK is selected
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

const adbCmd = resolveAdbPath();
console.log(`[Deploy] Executing: ${adbCmd} install -r "${targetApk}"`);

try {
  execSync(`${adbCmd} install -r "${targetApk}"`, { stdio: 'inherit' });
  console.log('[Deploy Success] APK installed successfully on target device/emulator.');
} catch (err) {
  console.error('[Deploy Error] adb install command failed:', err.message);
  process.exit(1);
}
