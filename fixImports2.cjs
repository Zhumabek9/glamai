const fs = require('fs');
let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

content = content.replace(
  "Heart } from 'lucide-react';",
  "Heart, Download, Share2 } from 'lucide-react';"
);

fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('fixImports2.cjs executed');
