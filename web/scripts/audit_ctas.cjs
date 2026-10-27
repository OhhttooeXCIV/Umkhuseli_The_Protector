const fs = require('fs');

const content = fs.readFileSync('web/src/components/SafeHavenDashboard.tsx', 'utf8');
const lines = content.split('\n');

// Find all onClick handlers in SafeHavenDashboard.tsx
const onClickMatches = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('onClick=')) {
    const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 5)).join('\n');
    onClickMatches.push({ line: i + 1, text: lines[i].trim(), context });
  }
}

console.log('Total onClick in SafeHavenDashboard:', onClickMatches.length);
onClickMatches.forEach(m => {
  // Check if it's very short or suspicious
  if (m.text.includes('console.') || m.text.length < 25 || m.text.includes('alert(')) {
    console.log(`Line ${m.line}: ${m.text}`);
  }
});
