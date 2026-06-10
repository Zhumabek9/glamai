const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

// 1. In style context
content = content.replace(
  /setSelectedPreset\(matched\.id\);/g,
  `setSelectedCombinations([{ id: Date.now(), presetId: matched.id, lipstickId: 'none' }]);`
);

// 2. In handleApplyQuickPreset
content = content.replace(
  /setSelectedPreset\(qp\.preset\);/g,
  `setSelectedCombinations(prev => {
      if (prev.find(c => c.presetId === qp.preset)) return prev;
      return [...prev, { id: Date.now(), presetId: qp.preset, lipstickId: selectedLipstick }];
    });`
);

// 3. In the community feed
content = content.replace(
  /setSelectedPreset\(look\.id\);/g,
  `setSelectedCombinations(prev => {
      if (prev.find(c => c.presetId === look.id)) return prev;
      return [...prev, { id: Date.now(), presetId: look.id, lipstickId: selectedLipstick }];
    });`
);

// 4. Mobile Fixed CTA tokens (if not replaced already)
// Look for (-10 Tokens)
content = content.replace(
  /\(\-10 Tokens\)/g,
  `(-{selectedCombinations.length * 10} Tokens)`
);

// 5. Preset cards mapping 
//    const isSelected = selectedPreset === p.id;
content = content.replace(
  /const isSelected = selectedPreset === p\.id;/g,
  `const isSelected = selectedCombinations.some(c => c.presetId === p.id);`
);

//    onClick={() => { setSelectedPreset(p.id); setActiveQuickPreset(null); }}
content = content.replace(
  /onClick=\{\(\) \=\> \{ setSelectedPreset\(p\.id\); setActiveQuickPreset\(null\); \}\}/g,
  `onClick={() => {
                      setSelectedCombinations(prev => {
                        if (prev.some(c => c.presetId === p.id)) {
                          return prev.filter(c => c.presetId !== p.id);
                        } else {
                          if (prev.length >= 10) {
                            toast.error("You can select up to 10 makeups at once!");
                            return prev;
                          }
                          return [...prev, { id: Date.now(), presetId: p.id, lipstickId: selectedLipstick }];
                        }
                      });
                      setActiveQuickPreset(null);
                    }}`
);

fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('fixLeftovers.cjs executed');
