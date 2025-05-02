const fs = require('fs');
const path = require('path');

const OUTPUT = 'line_counts.txt';
const TARGET_DIR = './app';

function countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    let results = [];

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(scanDirectory(fullPath));
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
            const lines = countLines(fullPath);
            results.push(`${fullPath}: ${lines}`);
        }
    });

    return results;
}

const lineCounts = scanDirectory(TARGET_DIR);
fs.writeFileSync(OUTPUT, lineCounts.join('\n'));

console.log(`Line counts saved to ${OUTPUT}`);