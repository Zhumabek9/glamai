const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

// Fix random button
const randomBtnRegex = /const random = MAKEUP_PRESETS\[Math\.floor\(Math\.random\(\) \* MAKEUP_PRESETS\.length\)\];\s+setSelectedPreset\(random\.id\);\s+setActiveQuickPreset\(null\);\s+toast\.success\(\`🎲 \$\{t\('audit\.makeup\.random'\)\}: \$\{random\.name\}\`\);\s+scrollToPreview\(\);/g;

content = content.replace(randomBtnRegex, `const random = MAKEUP_PRESETS[Math.floor(Math.random() * MAKEUP_PRESETS.length)];
                  setSelectedCombinations(prev => [...prev, { id: Date.now(), presetId: random.id, lipstickId: selectedLipstick }]);
                  setActiveQuickPreset(null);
                  toast.success(\`🎲 \${t('audit.makeup.random')}: \${random.name}\`);
                  scrollToPreview();`);

// Fix preset cards
const presetCardStart = `                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={\`style-card \${isSelected ? 'selected' : ''}\`}
                    aria-pressed={isSelected}
                    aria-label={\`Select: \${p.name}\`}
                    onClick={() => { setSelectedPreset(p.id); setActiveQuickPreset(null); }}`;

const presetCardReplacement = `                const isSelected = selectedCombinations.some(c => c.presetId === p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    className={\`style-card \${isSelected ? 'selected' : ''}\`}
                    aria-pressed={isSelected}
                    aria-label={\`Select: \${p.name}\`}
                    onClick={() => {
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
                    }}`;

content = content.replace(presetCardStart, presetCardReplacement);

// Fix the selected badge to show the number if multiple, or a Check
const badgeRegex = /\{isSelected && <div className="selected-badge"><Check size=\{12\} \/><\/div>\}/g;
const badgeReplacement = `{isSelected && (
                      <div className="selected-badge">
                        {(selectedCombinations.findIndex(c => c.presetId === p.id) + 1) || <Check size={12} />}
                      </div>
                    )}`;
content = content.replace(badgeRegex, badgeReplacement);


fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('Script 5 executed');
