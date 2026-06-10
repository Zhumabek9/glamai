const fs = require('fs');

let content = fs.readFileSync('src/components/Makeup.jsx', 'utf8');

const startPattern = "const handleGenerate = async () => {";
const endPattern = "  const handleFeedback = (type) => {";

const startIndex = content.indexOf(startPattern);
const endIndex = content.indexOf(endPattern);

if (startIndex !== -1 && endIndex !== -1) {
  const newHandleGenerate = `const handleGenerate = async () => {
    const isGuest = !user || user.isGuest;
    const availableTokens = isGuest ? (guestTokens ?? 0) : (user?.tokens ?? 0);
    const calculatedCost = selectedCombinations.length * 10;

    setFeedback(null);
    setFeedbackSubmitted(false);

    if (isGuest && availableTokens < calculatedCost) {
      toast.error('You have used your free generation! Sign up to get more tokens.');
      onOpenAuth();
      return;
    }

    const isUnlimited = false;
    if (!isGuest && !isUnlimited && availableTokens < calculatedCost) {
      toast.error(\`You need at least \${calculatedCost} tokens to generate makeup!\`);
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading selfie to AI engine...');
    setEtaRemaining(30 * selectedCombinations.length);

    setTimeout(() => {
      if (typeof window !== "undefined" && window.innerWidth < 1024 && previewPanelRef.current) {
        previewPanelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    const steps = [
      { prg: 25, txt: PROGRESS_STEPS[1] },
      { prg: 45, txt: PROGRESS_STEPS[2] },
      { prg: 70, txt: PROGRESS_STEPS[3] },
      { prg: 85, txt: PROGRESS_STEPS[4] },
      { prg: 95, txt: PROGRESS_STEPS[5] }
    ];

    const etaInterval = setInterval(() => {
      setEtaRemaining(prev => prev <= 1 ? 1 : prev - 1);
    }, 1000);

    try {
      const baseTime = Date.now();
      const initialResults = selectedCombinations.map((combo, idx) => {
        const presetObj = MAKEUP_PRESETS.find(p => p.id === combo.presetId);
        const lipstickObj = LIPSTICKS.find(l => l.id === combo.lipstickId);
        return {
          id: \`gen-\${baseTime}-\${idx}\`,
          comboId: combo.id,
          styleName: presetObj ? presetObj.name : 'Custom Makeup',
          colorName: lipstickObj ? lipstickObj.name : 'None',
          status: idx === 0 ? 'generating' : 'pending',
          result: null,
          original: image,
          combo
        };
      });

      setResultImages(initialResults);
      setActiveResultIndex(0);

      for (let i = 0; i < selectedCombinations.length; i++) {
        const combo = selectedCombinations[i];
        const presetObj = MAKEUP_PRESETS.find(p => p.id === combo.presetId);
        const lipstickObj = LIPSTICKS.find(l => l.id === combo.lipstickId);
        const eyelinerObj = EYELINERS.find(e => e.id === selectedEyeliner);
        const eyeshadowObj = EYESHADOWS.find(es => es.id === selectedEyeshadow);
        const blushObj = BLUSHES.find(b => b.id === selectedBlush);

        setResultImages(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'generating' } : item));

        setProgress(0);
        setLoadingText('Uploading selfie to AI engine...');
        let currentStep = 0;
        
        const styleInterval = setInterval(() => {
          setProgress(prev => {
            const nextVal = prev + 10;
            if (currentStep < steps.length && nextVal >= steps[currentStep].prg) {
              setLoadingText(steps[currentStep].txt);
              currentStep++;
            }
            if (nextVal >= 90) return 90;
            return nextVal;
          });
        }, 400);

        try {
          let makeupDesc = \`\${presetObj ? presetObj.name : 'Natural'} style.\`;
          if (lipstickObj && lipstickObj.id !== 'none') makeupDesc += \` Lipstick: \${lipstickObj.name}.\`;
          if (eyelinerObj && eyelinerObj.id !== 'none') makeupDesc += \` Eyeliner: \${eyelinerObj.name}.\`;
          if (eyeshadowObj && eyeshadowObj.id !== 'none') makeupDesc += \` Eyeshadow: \${eyeshadowObj.name}.\`;
          if (blushObj && blushObj.id !== 'none') makeupDesc += \` Blush: \${blushObj.name}.\`;

          const formData = new FormData();
          formData.append('image', imageFile);
          formData.append('taskType', 'makeup');
          formData.append('makeup', makeupDesc);
          formData.append('gender', 'female');

          const res = await authFetch('/api/generate', { method: 'POST', body: formData });
          clearInterval(styleInterval);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to render makeup');
          }

          const data = await res.json();
          
          if (data.success) {
            setResultImages(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'success', result: data.imageUrl } : item));
            
            if (!isUnlimited) onDeductToken(10);

            onAddHistory({
              original: image,
              result: data.imageUrl,
              style: presetObj ? presetObj.name : 'Makeup',
              color: lipstickObj ? lipstickObj.name : 'Lipstick',
              date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            });

            const newMatch = {
              id: \`match_\${Date.now()}_\${Math.floor(1000 + Math.random() * 9000)}\`,
              timestamp: Date.now(),
              date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
              code: combo.presetId,
              name: presetObj ? presetObj.name : 'Custom Makeup',
              matchRate: \`\${Math.floor(88 + Math.random() * 11)}%\`,
              img: data.imageUrl
            };
            const storageKey = user ? \`levante_matches_\${user.id}\` : "levante_matches";
            const existingMatches = JSON.parse(localStorage.getItem(storageKey) || "[]");
            const filteredMatches = existingMatches.filter(m => m.code !== newMatch.code);
            localStorage.setItem(storageKey, JSON.stringify([newMatch, ...filteredMatches].slice(0, 10)));
          } else {
            throw new Error(data.error || 'Failed to render makeup');
          }
        } catch (err) {
          clearInterval(styleInterval);
          setResultImages(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: err.message } : item));
          toast.error(err.message || 'AI Makeup generation failed.');
        }

        if (i < selectedCombinations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      setProgress(100);
      setSliderPosition(50);
      toast.success('AI Makeup batch rendered successfully!');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#6D28D9", "#EC4899", "#ffffff"]
      });

      scrollToPreview();

    } catch (err) {
      toast.error(err.message || 'AI Makeup generation failed.');
    } finally {
      setIsGenerating(false);
      clearInterval(etaInterval);
    }
  };

  const handleDownloadAll = async () => {
    const successImages = resultImages.filter(r => r.status === 'success');
    for (let i = 0; i < successImages.length; i++) {
      const img = successImages[i];
      const link = document.createElement('a');
      link.href = img.result;
      link.download = \`glamai_\${img.styleName}_\${img.colorName}.png\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (i < successImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

`;

  const newContent = content.substring(0, startIndex) + newHandleGenerate + content.substring(endIndex);
  fs.writeFileSync('src/components/Makeup.jsx', newContent);
  console.log('Replaced handleGenerate');
} else {
  console.log('Indexes not found', startIndex, endIndex);
}
