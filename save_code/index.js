const fs = require('fs');
const path = require('path');
const readline = require('readline');

const sourceFolder = './src';
const mergedOutputFile = './myfolder/all-code-merged.txt';
const recreateOutputFolder = './myfolder/restored';
const excludedFiles = ['package-lock.json', '.DS_Store'];
const outputFile = './myfolder/file-list.txt';
const excludedDirs = ['node_modules', 'dist', '.git'];

function getAllFilesRecursively(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFilesRecursively(fullPath));
    } else if (!excludedFiles.includes(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

function extractCodeFromFilesToSingleFile(filePaths = null) {

  const outputDir = path.dirname(mergedOutputFile);
  fs.mkdirSync(outputDir, { recursive: true }); // Ensure folder exists
  
  const files = filePaths || getAllFilesRecursively(sourceFolder);
  let output = '';

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative('.', filePath);

    output += `--- START: ${relativePath} ---\n`;
    output += content + '\n';
    output += `--- END: ${relativePath} ---\n\n`;

    console.log(`Extracted: ${relativePath}`);
  });

  fs.writeFileSync(mergedOutputFile, output, 'utf8');
  console.log(`Done! Extracted ${files.length} files into ${mergedOutputFile}`);
}

function extractCodeFromFilesToSingleFile(filePaths = null) {
  const outputDir = path.dirname(mergedOutputFile);
  const mergedHtmlOutputFile = path.join(outputDir, 'all-code-merged.html');
  fs.mkdirSync(outputDir, { recursive: true });

  const files = filePaths || getAllFilesRecursively(sourceFolder);
  let outputText = '';

  // HTML header with Prism.js and theme
  let outputHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>All Extracted Code</title>
  <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet"/>
  <style>
    body { font-family: Arial, sans-serif; background: #1e1e1e; color: #eee; padding: 20px; }
    h2 { color: #61dafb; border-bottom: 1px solid #444; padding-bottom: 5px; }
    pre { margin: 10px 0; border-radius: 6px; }
  </style>
</head>
<body>
<h1>Extracted Code Files</h1>
`;

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative('.', filePath);
    const ext = path.extname(filePath).toLowerCase();
    const lang = getPrismLanguage(ext);

    outputText += `--- START: ${relativePath} ---\n${content}\n--- END: ${relativePath} ---\n\n`;

    outputHtml += `<h2>${relativePath}</h2>\n`;
    outputHtml += `<pre><code class="language-${lang}">${escapeHtml(content)}</code></pre>\n`;

    console.log(`Extracted: ${relativePath}`);
  });

  outputHtml += `
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-json.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-tsx.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-java.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markup.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-properties.min.js"></script>
  </body>
  </html>
  `;
  

  fs.writeFileSync(mergedOutputFile, outputText, 'utf8');
  fs.writeFileSync(mergedHtmlOutputFile, outputHtml, 'utf8');

  console.log(`✅ Extracted ${files.length} files to:\n- ${mergedOutputFile}\n- ${mergedHtmlOutputFile}`);
}

/*
function extractCodeFromFilesToSingleFile(filePaths = null) {
  const outputDir = path.dirname(mergedOutputFile);
  const mergedHtmlOutputFile = path.join(outputDir, 'all-code-merged.html');
  fs.mkdirSync(outputDir, { recursive: true });

  const files = filePaths || getAllFilesRecursively(sourceFolder);
  let outputText = '';
  let outputHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>All Extracted Code</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; }
    h2 { background: #333; color: #fff; padding: 10px; }
    pre { background: #eee; padding: 15px; overflow-x: auto; border-left: 5px solid #333; }
    code { white-space: pre-wrap; font-family: Consolas, monospace; }
  </style>
</head>
<body>
<h1>Extracted Code Files</h1>
`;

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative('.', filePath);

    outputText += `--- START: ${relativePath} ---\n${content}\n--- END: ${relativePath} ---\n\n`;

    outputHtml += `<h2>${relativePath}</h2>\n<pre><code>${escapeHtml(content)}</code></pre>\n`;

    console.log(`Extracted: ${relativePath}`);
  });

  outputHtml += `</body></html>`;

  fs.writeFileSync(mergedOutputFile, outputText, 'utf8');
  fs.writeFileSync(mergedHtmlOutputFile, outputHtml, 'utf8');

  console.log(`✅ Extracted ${files.length} files to:\n- ${mergedOutputFile}\n- ${mergedHtmlOutputFile}`);
}
*/

function getPrismLanguage(ext) {
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
      return 'javascript';
    case '.json':
      return 'json';
    case '.html':
    case '.xml':
      return 'markup';
    case '.java':
      return 'java';
    case '.properties':
      return 'properties';
    case '.css':
    case '.scss':
      return 'css';
    default:
      return 'clike'; // fallback
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function recreateFilesFromMergedFile() {
  const content = fs.readFileSync(mergedOutputFile, 'utf8');
  const fileBlocks = content.split(/--- START: (.*?) ---\n([\s\S]*?)--- END: \1 ---/g);

  for (let i = 1; i < fileBlocks.length; i += 3) {
    const filePath = fileBlocks[i].trim();
    const fileContent = fileBlocks[i + 1];

    if (excludedFiles.includes(path.basename(filePath))) {
      continue;
    }

    const finalPath = path.join(recreateOutputFolder, filePath);
    const folderPath = path.dirname(finalPath);

    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(finalPath, fileContent, 'utf8');

    console.log(`Created: ${finalPath}`);
  }

  console.log(`All files recreated in ${recreateOutputFolder}`);
}

function logAllFileNames(dir, allFiles = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludedDirs.includes(entry.name)) {
        logAllFileNames(fullPath, allFiles); // Recurse
      }
    } else if (!excludedFiles.includes(entry.name)) {
      const relativePath = path.relative('.', fullPath);
      allFiles.push(relativePath);
    }
  });

  return allFiles;
}

function generateFileList() {
  const outputDir = path.dirname(outputFile);
  fs.mkdirSync(outputDir, { recursive: true });
  const files = logAllFileNames(sourceFolder);

  // Write to output file
  fs.writeFileSync(outputFile, files.join('\n'), 'utf8');

  // Log to console
  console.log(`Saved ${files.length} file paths to ${outputFile}`);
  files.forEach(file => console.log(file));
}

// extractCodeFromFilesToSingleFile([
//   "src/app/pages/journal/journal-list/journal-list.component.ts"
// ]);
// extractCodeFromFilesToSingleFile();
// recreateFilesFromMergedFile();
// generateFileList();

let filesToBeEstracted = [
  "src/app/pages/journal/journal-store/journal.actions.ts",
  "src/app/pages/journal/journal-store/journal.effect.ts",
  "src/app/pages/journal/journal-store/journal.reducer.ts",
  "src/app/pages/journal/journal-store/journal.selector.ts",
  "src/app/pages/journal/journal-list/journal-list.component.ts",
  "src/app/pages/journal/journal-layout/journal-layout.component.ts",
  "src/app/pages/journal/Journal.model.ts",
  "src/app/pages/journal/journal.service.ts",
  "src/app/app.config.ts",
  "src/main.ts"
]


// Interactive menu
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\nSelect an action:");
console.log("1 - Extract code from files into a single file");
console.log("2 - Recreate files from the merged file");
console.log("3 - Generate a file list");
console.log("4 - Exit");

rl.question("\nEnter the number of the action you want to perform: ", (answer) => {
  switch (answer.trim()) {
    case '1':
      extractCodeFromFilesToSingleFile();
      break;
    case '2':
      recreateFilesFromMergedFile();
      break;
    case '3':
      generateFileList();
      break;
    case '4':
      console.log("Exiting...");
      break;
    default:
      console.log("Invalid choice. Please enter a valid number.");
  }
  rl.close();
});