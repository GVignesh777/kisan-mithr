const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');
// Find instances like "${process.env.REACT_APP_API_URL}..." in double or single quotes
const pattern = /["'](\$\{process\.env\.REACT_APP_API_URL\})(.*?)["']/g;

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (pattern.test(content)) {
                console.log(`Fixing quotes in: ${fullPath}`);
                const newContent = content.replace(pattern, '`$1$2`');
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    });
}

walkDir(srcDir);
console.log('Done.');
