import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Find asset files in dist/client/assets
const assetsDir = path.join(projectRoot, 'dist', 'client', 'assets');
let cssFile = '';
let jsFile = '';

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  cssFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css')) || 'styles.css';
  jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js') && !f.includes('BSp')) || 'index.js';
}

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevScraper</title>
  <script type="module" crossorigin src="/assets/${jsFile}"></script>
  <link rel="stylesheet" crossorigin href="/assets/${cssFile}">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

const indexPath = path.join(projectRoot, 'dist', 'client', 'index.html');
fs.writeFileSync(indexPath, indexHtml);
console.log('Generated index.html with assets:', { css: cssFile, js: jsFile });
