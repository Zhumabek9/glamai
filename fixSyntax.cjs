const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

// Fix the useState
content = content.replace(
  "const [resultImages[0].id, setCurrentResultId] = useState(null);",
  ""
);

// We also should remove any leftover `setCurrentResultId(null);` which became `setCurrentResultId(null);`
content = content.replace(
  "setCurrentResultId(null);",
  ""
);

fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('fixSyntax.cjs executed');
