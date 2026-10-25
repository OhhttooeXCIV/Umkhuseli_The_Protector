import os from 'os';
import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.resolve(__dirname, '..');

// 1. Discover local network IPv4 addresses
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      // Skip internal/loopback and non-IPv4
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ iface: name, ip: net.address });
      }
    }
  }
  return addresses;
}

const networkIps = getLocalIpAddresses();
const defaultPort = 5173;
const primaryIp = networkIps.length > 0 ? networkIps[0].ip : 'localhost';
const targetUrl = `http://${primaryIp}:${defaultPort}`;

console.log('\n================================================================');
console.log('  🛡️  UMKHUSELI: THE PROTECTOR — iOS PWA INSTALLATION HELPER');
console.log('================================================================\n');

console.log('📍 Target iOS Access URL:');
console.log(`   👉  \x1b[36m\x1b[1m${targetUrl}\x1b[0m\n`);

if (networkIps.length > 0) {
  console.log('📶 Available Network Interfaces:');
  networkIps.forEach(({ iface, ip }) => {
    console.log(`   • ${iface}: http://${ip}:${defaultPort}`);
  });
  console.log('');
}

console.log('📱 HOW TO INSTALL ON YOUR IPHONE / IPAD:');
console.log('   1. Open \x1b[33mMobile Safari\x1b[0m on your iOS device (connected to this Wi-Fi network).');
console.log(`   2. Navigate to: \x1b[36m${targetUrl}\x1b[0m`);
console.log('   3. Tap the Safari \x1b[32mShare button\x1b[0m (the square icon with the arrow pointing up).');
console.log('   4. Scroll down and select \x1b[32m"Add to Home Screen"\x1b[0m (+ icon).');
console.log('   5. Tap \x1b[32m"Add"\x1b[0m in the top-right corner.');
console.log('   ✓ The app is now installed as an innocent "Prepaid Calc" standalone PWA!\n');

// 2. If running on a system with iOS Simulator (xcrun simctl), attempt auto-launch
try {
  const simctlCheck = execSync('which xcrun 2>/dev/null || where xcrun 2>nul', { stdio: 'pipe' })
    .toString()
    .trim();
  if (simctlCheck) {
    console.log('[iOS Simulator] xcrun detected. Attempting to open URL in booted simulator...');
    execSync(`xcrun simctl openurl booted "${targetUrl}"`, { stdio: 'inherit' });
    console.log('[iOS Simulator] Launched in Safari on booted simulator.');
  }
} catch {
  // Not on macOS or no simulator booted - normal for Windows/Linux
}

console.log('🚀 Starting Vite PWA server accessible to iOS Safari on the local network (host: 0.0.0.0)...\n');
console.log('Press Ctrl+C to stop the server.\n');

// 3. Spawn Vite dev/preview server bound to host 0.0.0.0
const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

const server = spawn(npxCmd, ['vite', '--host', '0.0.0.0', '--port', String(defaultPort)], {
  cwd: webDir,
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('[Error] Failed to start server:', err.message);
  process.exit(1);
});

server.on('close', (code) => {
  process.exit(code || 0);
});
