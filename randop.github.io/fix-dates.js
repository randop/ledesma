const fs = require('fs');
const path = require('path');

// Find all markdown files in posts directory
function getMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile() && item.endsWith('.md')) {
      files.push(fullPath);
    }
  });
  
  return files;
}

const files = getMarkdownFiles('posts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Smart regex to handle spaces around "date:" - matches:
  // date: 2018-01-18 10:00:00 +0800
  // date:   2018-01-18 10:00:00 +0800  
  // date:2018-01-18 10:00:00 +0800
  content = content.replace(
    /date:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+\+0800/g,
    'date: $1T$2+08:00'
  );
  
  // Also handle other timezone formats if they exist
  content = content.replace(
    /date:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+\+(\d{2})(\d{2})/g,
    'date: $1T$2+$3:$4'
  );
  
  fs.writeFileSync(file, content);
  console.log(`Fixed dates in ${file}`);
});

console.log('Date format fixing complete!');
