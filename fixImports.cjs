const fs = require('fs');
let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

content = content.replace(
  /import \{ Upload, Sparkles, RefreshCw, Check, Info, Lock, ArrowRight, Heart, X, Trash2, Sliders, Play, Camera, ChevronRight, ChevronLeft \} from 'lucide-react';/g,
  `import { Upload, Sparkles, RefreshCw, Check, Info, Lock, ArrowRight, Heart, X, Trash2, Sliders, Play, Camera, ChevronRight, ChevronLeft, Download, Share2 } from 'lucide-react';`
);

fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('fixImports.cjs executed');
