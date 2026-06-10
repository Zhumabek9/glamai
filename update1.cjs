const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

// 1. States
content = content.replace(
  "const [selectedPreset, setSelectedPreset] = useState('bronze');",
  `const [selectedCombinations, setSelectedCombinations] = useState([{ id: 1, presetId: 'bronze', lipstickId: 'none' }]);`
);
content = content.replace(
  "const [resultImage, setResultImage] = useState(null);",
  `const [resultImages, setResultImages] = useState([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');`
);
content = content.replace(
  "observer.observe(sliderRef.current);\n    return () => observer.disconnect();\n  }, [resultImage]);",
  `observer.observe(sliderRef.current);\n    return () => observer.disconnect();\n  }, [resultImages, activeResultIndex]);`
);

// 2. useEffect for styleContext
content = content.replace(
  `      if (matched) {\n        setSelectedPreset(matched.id);\n        toast.success(\`Makeup preset pre-selected: \${matched.name}\`);`,
  `      if (matched) {\n        setSelectedCombinations([{ id: Date.now(), presetId: matched.id, lipstickId: 'none' }]);\n        toast.success(\`Makeup preset pre-selected: \${matched.name}\`);`
);

// 3. loadImage
content = content.replace(
  `      setImage(event.target.result);\n      setResultImage(null);`,
  `      setImage(event.target.result);\n      setResultImages([]);\n      setActiveResultIndex(0);`
);

// 4. handleApplyQuickPreset
content = content.replace(
  `  const handleApplyQuickPreset = (qp) => {\n    setActiveQuickPreset(qp.id);\n    setSelectedPreset(qp.preset);\n    toast.success(\`"\${qp.name}" preset applied!\`);\n    scrollToPreview();\n  };`,
  `  const handleApplyQuickPreset = (qp) => {\n    setActiveQuickPreset(qp.id);\n    setSelectedCombinations(prev => {\n      if (prev.find(c => c.presetId === qp.preset)) return prev;\n      return [...prev, { id: Date.now(), presetId: qp.preset, lipstickId: selectedLipstick }];\n    });\n    toast.success(\`"\${qp.name}" preset applied!\`);\n    scrollToPreview();\n  };`
);

// 5. handleReset
content = content.replace(
  `    setImageFile(null);\n    setResultImage(null);`,
  `    setImageFile(null);\n    setResultImages([]);\n    setActiveResultIndex(0);`
);

// 6. UI random preset
content = content.replace(
  `                  const random = MAKEUP_PRESETS[Math.floor(Math.random() * MAKEUP_PRESETS.length)];\n                  setSelectedPreset(random.id);\n                  setActiveQuickPreset(null);\n                  toast.success(\`🎲 \${t('audit.makeup.random')}: \${random.name}\`);`,
  `                  const random = MAKEUP_PRESETS[Math.floor(Math.random() * MAKEUP_PRESETS.length)];\n                  setSelectedCombinations(prev => [...prev, { id: Date.now(), presetId: random.id, lipstickId: selectedLipstick }]);\n                  setActiveQuickPreset(null);\n                  toast.success(\`🎲 \${t('audit.makeup.random')}: \${random.name}\`);`
);

// 7. Preset Cards isSelected and onClick
content = content.replace(
  `                const isSelected = selectedPreset === p.id;\n                return (\n                  <button\n                    type="button"\n                    key={p.id}\n                    className={\`style-card \${isSelected ? 'selected' : ''}\`}\n                    aria-pressed={isSelected}\n                    aria-label={\`Select: \${p.name}\`}\n                    onClick={() => { setSelectedPreset(p.id); setActiveQuickPreset(null); }}`,
  `                const isSelected = selectedCombinations.some(c => c.presetId === p.id);\n                return (\n                  <button\n                    type="button"\n                    key={p.id}\n                    className={\`style-card \${isSelected ? 'selected' : ''}\`}\n                    aria-pressed={isSelected}\n                    aria-label={\`Select: \${p.name}\`}\n                    onClick={() => {\n                      setSelectedCombinations(prev => {\n                        if (prev.some(c => c.presetId === p.id)) {\n                          return prev.filter(c => c.presetId !== p.id);\n                        } else {\n                          return [...prev, { id: Date.now(), presetId: p.id, lipstickId: selectedLipstick }];\n                        }\n                      });\n                      setActiveQuickPreset(null);\n                    }}`
);

// 8. Cost token in UI
content = content.replace(
  `(-10 Tokens)`,
  `(-{selectedCombinations.length * 10} Tokens)`
);

// Write it out for now to test replacements
fs.writeFileSync('src/components/Makeup.jsx', content);
console.log('Script updated parts 1-8');
