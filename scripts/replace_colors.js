const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src');

const replacements = {
  '\\[#25935f\\]': 'secondary',
  '\\[#1f7c50\\]': 'secondary-hover',
  '\\[#f9fbf9\\]': 'background',
  '\\[#fcfdfc\\]': 'background',
  '\\[#e8f3ec\\]': 'soft',
  '\\[#e4f1ea\\]': 'soft',
  '\\[#0f4772\\]': 'primary-dark',
  '\\[#107acc\\]': 'primary',
  '\\[#97c639\\]': 'accent',
  '\\[#a6cf5b\\]': 'accent-light',
  '\\[#4e9181\\]': 'secondary-light'
};

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;
      
      for (const [regex, replacement] of Object.entries(replacements)) {
        const re = new RegExp(regex, 'g');
        if (re.test(content)) {
          content = content.replace(re, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

walkDir(directoryPath);
