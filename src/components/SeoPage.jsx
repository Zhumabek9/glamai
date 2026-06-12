import React, { useEffect, useState } from 'react';
import { Upload, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { t } from '../utils/i18n';
import SliderComparison from './SliderComparison';
import Pricing from './Pricing';

const SEO_PAGES_CONFIG = {
  '/ai-hairstyle-changer': {
    title: 'AI Hairstyle Changer Online — Try On 100+ Haircuts Instantly',
    metaDescription: 'Try on 100+ hairstyles, colors, and cuts instantly with GlamAI. The ultimate virtual AI hair changer. Upload your portrait and get salon-grade results in seconds.',
    h1: 'AI Hairstyle Changer Online',
    subtitle: 'Try on 100+ haircut designs and find your perfect look in seconds using advanced AI technology.',
    tab: 'playground',
    examples: [
      { before: '/model_before.png', after: '/model_after.png', title: 'Classic Waves Transformation' },
      { before: '/trending_bob_before.png', after: '/trending_bob_after.png', title: 'Caramel Bob Cut' },
      { before: '/trending_pixie_before.png', after: '/trending_pixie.png', title: 'Sleek Pixie Cut' },
      { before: '/trending_hair_before.png', after: '/trending_hair.png', title: 'Textured Long Waves' },
      { before: '/trending_siren_before.png', after: '/trending_siren_after.png', title: 'Glamorous Siren Transformation' },
      { before: '/trending_bob_before.png', after: '/styles/female_bubble-braid.webp', title: 'Bubble Braids' }
    ],
    faqs: [
      { q: 'How does the AI hairstyle changer work?', a: 'Our advanced AI analyzes your facial shape and features, then maps and overlays the new hairstyle onto your portrait with photorealistic blending and lighting.' },
      { q: 'Are the hairstyle mockups realistic?', a: 'Yes, our model generates professional-grade hair textures, volume, and shadows to match your original photo\'s lighting.' },
      { q: 'Can I try different hair lengths?', a: 'Absolutely! You can experiment with short pixie cuts, structured bobs, shoulder-length lobs, or long flowing waves.' }
    ]
  },
  '/ai-hair-color-changer': {
    title: 'AI Hair Color Changer — Virtual Hair Color Simulator & Try-On',
    metaDescription: 'Simulate hair colors on your photo with AI. Try on blonde, brunette, ginger, neon, and pastel shades. Free to start, instant high-quality results.',
    h1: 'AI Hair Color Changer',
    subtitle: 'Simulate hair colors on your photo with AI. Try golden blonde, rich brunette, copper, or vivid neons.',
    tab: 'playground',
    examples: [
      { before: '/model_before.png', after: '/model_after.png', title: 'Platinum Blonde' },
      { before: '/trending_bob_before.png', after: '/trending_bob_after.png', title: 'Rich Warm Chocolate' },
      { before: '/trending_hair_before.png', after: '/trending_hair.png', title: 'Sunset Copper Glow' },
      { before: '/trending_pixie_before.png', after: '/trending_pixie.png', title: 'Soft Lavender Frost' },
      { before: '/trending_siren_before.png', after: '/trending_siren_after.png', title: 'Slick Split-Dye' },
      { before: '/trending_bob_before.png', after: '/styles/female_ombre.webp', title: 'Premium Ombré' }
    ],
    faqs: [
      { q: 'Will the color simulator work on dark hair?', a: 'Yes! Our advanced AI hair dye engine handles dark brown and black hair beautifully, accurately simulating bright shades like platinum blonde or vibrant red.' },
      { q: 'Can I try highlights or multi-tonal hair colors?', a: 'Yes, we support ombre, balayage, split-dye, and custom highlights configurations.' },
      { q: 'Is the color mapping precise around my face?', a: 'Yes, the AI analyzes individual hair strands to apply the color naturally without bleeding onto your skin or background.' }
    ]
  },
  '/try-bangs-online': {
    title: 'Try Bangs Online — Virtual Fringe & Bangs Simulator',
    metaDescription: 'Wondering how you would look with bangs? Try bangs online instantly with our AI fringe simulator. Try curtain bangs, blunt bangs, and wispy fringes.',
    h1: 'Try Bangs Online',
    subtitle: 'Wondering how you would look with a fringe? Try curtain bangs, blunt bangs, and wispy styles with AI.',
    tab: 'playground',
    examples: [
      { before: '/model_before.png', after: '/model_after.png', title: 'Ash Blonde Blunt Bangs' },
      { before: '/trending_bob_before.png', after: '/trending_bob_after.png', title: 'Wispy Curtain Bangs' },
      { before: '/trending_hair_before.png', after: '/styles/female_side-swept-bangs.webp', title: 'Side-Swept Bangs' },
      { before: '/trending_pixie_before.png', after: '/trending_pixie.png', title: 'Short Pixie with Bangs' },
      { before: '/trending_siren_before.png', after: '/trending_siren_after.png', title: 'Face-Framing Fringe' },
      { before: '/model_before.png', after: '/styles/female_blunt-bangs.webp', title: 'Thick Blunt Fringe' }
    ],
    faqs: [
      { q: 'What types of bangs can I try?', a: 'You can try curtain bangs, classic blunt bangs, side-swept bangs, wispy fringes, and micro-bangs.' },
      { q: 'Will it show how bangs match my face shape?', a: 'Yes, the AI adjusts the framing and draping of the bangs to fit your forehead height and facial structure.' },
      { q: 'Can I choose the color of the bangs?', a: 'The bangs will automatically match your selected hair color or your natural shade for a seamless look.' }
    ]
  },
  '/short-hair-filter': {
    title: 'Short Hair Filter — Virtual Short Haircuts & Cuts Try-On',
    metaDescription: 'Thinking of cutting your hair short? Try short hair filters online. Try on pixie cuts, undercuts, fades, and short crops on your photo with AI.',
    h1: 'Short Hair Filter',
    subtitle: 'Thinking of going short? Preview pixie cuts, bob styles, crops, and fades risk-free in high definition.',
    tab: 'playground',
    examples: [
      { before: '/trending_pixie_before.png', after: '/trending_pixie.png', title: 'Sleek Pixie Cut' },
      { before: '/trending_bob_before.png', after: '/trending_bob_after.png', title: 'Classic Parisian Bob' },
      { before: '/model_before.png', after: '/styles/female_shag.webp', title: 'Layered Shag Cut' },
      { before: '/trending_hair_before.png', after: '/styles/male_low-fade.webp', title: 'Low Fade Cut' },
      { before: '/trending_siren_before.png', after: '/styles/male_crew-cut.webp', title: 'Textured Crew Cut' },
      { before: '/model_before.png', after: '/styles/female_pageboy.webp', title: 'Vintage Pageboy Cut' }
    ],
    faqs: [
      { q: 'Can I try extreme short cuts like a buzz cut?', a: 'Yes! Our short hair filter includes classic buzz cuts, crew cuts, undercuts, pixies, and fades.' },
      { q: 'Does the filter support all genders?', a: 'Yes, our short hair category contains a wide range of styles tailored for both men and women.' },
      { q: 'Will it help me decide before going to the salon?', a: 'Definitely. That\'s the primary goal! You can test multiple short hair lengths to see what suits your jawline best.' }
    ]
  },
  '/bob-haircut-filter': {
    title: 'Bob Haircut Filter — Try On Classic, Angled & French Bobs',
    metaDescription: 'Try on bob and lob hairstyles online with our AI Bob Haircut Filter. Preview French bobs, lob cuts, layered bobs, and asymmetrical bobs on your face.',
    h1: 'Bob Haircut Filter',
    subtitle: 'Try on bob and lob hairstyles online. Preview French bobs, lob cuts, layered bobs, and asymmetrical styles.',
    tab: 'playground',
    examples: [
      { before: '/trending_bob_before.png', after: '/trending_bob_after.png', title: 'Caramel Bob Cut' },
      { before: '/model_before.png', after: '/styles/female_lob.webp', title: 'Long Lob Cut' },
      { before: '/trending_pixie_before.png', after: '/styles/female_angled-bob.webp', title: 'Angled Bob' },
      { before: '/trending_hair_before.png', after: '/styles/female_asymmetrical-bob.webp', title: 'Asymmetrical Bob' },
      { before: '/trending_siren_before.png', after: '/styles/female_inverted-bob.webp', title: 'Inverted Bob' },
      { before: '/model_before.png', after: '/styles/female_graduated-bob.webp', title: 'Graduated Bob' }
    ],
    faqs: [
      { q: 'What\'s the difference between a bob and a lob?', a: 'A bob is typically chin-length, while a lob (long bob) rests between the chin and collarbone. You can try both styles in our filter.' },
      { q: 'Can I see how a bob haircut looks with different colors?', a: 'Yes, you can pair any bob cut with any hair color shade, from warm brunette to platinum blonde.' },
      { q: 'Is the volume of the bob hair realistic?', a: 'Yes, our AI models hair volume, density, and natural movement so it looks realistic on your head.' }
    ]
  },
  '/blonde-hair-filter': {
    title: 'Blonde Hair Filter — Try Platinum, Honey & Golden Blonde Online',
    metaDescription: 'Instantly see yourself with blonde hair. Try golden blonde, platinum white, honey blonde, and ash blonde hair filters on your photo using AI.',
    h1: 'Blonde Hair Filter',
    subtitle: 'Instantly see yourself with blonde hair. Try golden blonde, platinum white, honey blonde, and ash blonde.',
    tab: 'playground',
    examples: [
      { before: '/model_before.png', after: '/model_after.png', title: 'Golden Ash Blonde' },
      { before: '/trending_bob_before.png', after: '/trending_bob_after.png', title: 'Caramel Honey Blonde' },
      { before: '/trending_hair_before.png', after: '/trending_hair.png', title: 'Platinum Silver Blonde' },
      { before: '/trending_pixie_before.png', after: '/styles/female_ombre.webp', title: 'Blonde Balayage' },
      { before: '/trending_siren_before.png', after: '/trending_siren_after.png', title: 'Sun-Kissed Blonde' },
      { before: '/model_before.png', after: '/styles/female_straightened.webp', title: 'Honey Platinum' }
    ],
    faqs: [
      { q: 'Can I try platinum blonde?', a: 'Yes, we support bright platinum blonde, silver-blonde, and ice-blonde tones.' },
      { q: 'How do I choose the best blonde tone for my skin?', a: 'Our filter lets you compare warm tones (golden, honey) and cool tones (ash, platinum) side-by-side to find the perfect match for your skin tone.' },
      { q: 'Will the transition at the roots look smooth?', a: 'Yes, the AI blends the new color seamlessly with your natural roots, ensuring natural depth.' }
    ]
  },
  '/brunette-hair-filter': {
    title: 'Brunette Hair Filter — Try Chocolate, Chestnut & Caramel Brown',
    metaDescription: 'Explore rich brown hair colors. Try dark chocolate, golden caramel, chestnut, and mahogany brunette filters on your photo with AI.',
    h1: 'Brunette Hair Filter',
    subtitle: 'Explore rich brown hair colors. Try dark chocolate, golden caramel, chestnut, and mahogany brunette.',
    tab: 'playground',
    examples: [
      { before: '/trending_bob_before.png', after: '/trending_bob_after.png', title: 'Chocolate Brown Bob' },
      { before: '/model_before.png', after: '/model_after.png', title: 'Golden Chestnut Brown' },
      { before: '/trending_hair_before.png', after: '/trending_hair.png', title: 'Dark Espresso Brunette' },
      { before: '/trending_pixie_before.png', after: '/styles/female_wavy.webp', title: 'Caramel Highlighted Brown' },
      { before: '/trending_siren_before.png', after: '/trending_siren_after.png', title: 'Warm Auburn Brunette' },
      { before: '/model_before.png', after: '/styles/female_straight.webp', title: 'Ash Brown Gloss' }
    ],
    faqs: [
      { q: 'What brunette shades are available?', a: 'You can try warm chocolate, golden caramel, dark espresso, ash brown, chestnut, and mahogany.' },
      { q: 'Can I try highlights on brunette hair?', a: 'Yes, highlight options like caramel balayage are supported in our simulator.' },
      { q: 'Will it look natural on naturally blonde hair?', a: 'Yes, the AI adds realistic shading and depth to dark tones, preventing the color from looking flat.' }
    ]
  },
  '/makeup-ai-filter': {
    title: 'Makeup AI Filter — Try Lips, Eyeshadow & Blush Online',
    metaDescription: 'Apply professional makeup filters to your photo with AI. Try on lipsticks, eyeshadow designs, blush, and colored lenses instantly.',
    h1: 'Makeup AI Filter',
    subtitle: 'Apply professional makeup filters to your photo. Try on lipsticks, eyeshadow, blush, and colored lenses.',
    tab: 'makeup',
    examples: [
      { before: '/trending_makeup_before.png', after: '/trending_makeup.png', title: 'Glam Makeup Look' },
      { before: '/trending_siren_before.png', after: '/trending_siren_after.png', title: 'Siren Eyes Look' },
      { before: '/model_before.png', after: '/styles/makeup_strawberry.webp', title: 'Strawberry Blush Preset' },
      { before: '/trending_bob_before.png', after: '/styles/makeup_korean.png', title: 'Korean Glass Skin' },
      { before: '/trending_pixie_before.png', after: '/styles/makeup_y2k.webp', title: 'Y2K Sparkle Eyeshadow' },
      { before: '/model_before.png', after: '/styles/makeup_bridal.png', title: 'Classic Bridal Glam' }
    ],
    faqs: [
      { q: 'Can I try complete makeup looks?', a: 'Yes, we offer complete preset looks like Glam, Natural, Siren Eyes, Korean Glass Skin, and Y2K.' },
      { q: 'Is it possible to customize individual products?', a: 'Yes, you can customize specific lipstick shades, eyeshadow styles, blush tones, and contact lens colors.' },
      { q: 'Does it map precisely to my lips and eyes?', a: 'Yes, the AI detects your facial landmarks to apply makeup exactly where it belongs with professional accuracy.' }
    ]
  },
  '/nail-design-generator': {
    title: 'AI Nail Design Generator — Virtual Nail Art & Polish Try-On',
    metaDescription: 'Generate and try on custom nail designs with AI. Preview french manicure, chrome nails, aura gradients, and custom patterns on your hands.',
    h1: 'AI Nail Design Generator',
    subtitle: 'Generate and try on custom nail designs. Preview french manicure, chrome, aura, and custom patterns.',
    tab: 'nails',
    examples: [
      { before: '/trending_nails_before.png', after: '/trending_nails.png', title: 'Aurora Gloss Nails' },
      { before: '/trending_nails_before.png', after: '/styles/nails_chrome_french.png', title: 'Chrome French Manicure' },
      { before: '/trending_nails_before.png', after: '/styles/nails_black.png', title: 'Glossy Black Polish' },
      { before: '/trending_nails_before.png', after: '/styles/nails_french.png', title: 'Classic French Tips' },
      { before: '/trending_nails_before.png', after: '/styles/nails_aura_gradient.png', title: 'Aura Gradient Art' },
      { before: '/trending_nails_before.png', after: '/styles/nails_acrylic.png', title: 'Coffin-Shape Acrylics' }
    ],
    faqs: [
      { q: 'How does the AI apply nails to my hand photo?', a: 'Our AI detects your hand and fingers, then seamlessly overlays the nail shape, color, and art design over your natural nails.' },
      { q: 'Can I customize the color of each finger?', a: 'Yes, you can choose to apply one color globally or design each finger individually.' },
      { q: 'What nail shapes can I preview?', a: 'You can preview classic almond, square, coffin, and stiletto nail shapes.' }
    ]
  },
  '/virtual-makeover': {
    title: 'Virtual Makeover AI — Try Hairstyle, Makeup & Nails Together',
    metaDescription: 'Transform your entire look. Combine hairstyle changes, professional makeup designs, beard styles, and nail art in one virtual makeover session.',
    h1: 'Virtual Makeover AI',
    subtitle: 'Transform your entire look. Combine hairstyle changes, professional makeup designs, and nail art.',
    tab: 'playground',
    examples: [
      { before: '/model_before.png', after: '/model_after.png', title: 'Full Glam Makeover' },
      { before: '/trending_bob_before.png', after: '/trending_bob_after.png', title: 'Caramel Lob & Warm Makeup' },
      { before: '/trending_pixie_before.png', after: '/trending_pixie.png', title: 'Pixie Cut & Bold Lips' },
      { before: '/trending_hair_before.png', after: '/trending_hair.png', title: 'Long Layers & Natural Shimmer' },
      { before: '/trending_siren_before.png', after: '/trending_siren_after.png', title: 'Siren Eyes & Soft Curls' },
      { before: '/trending_makeup_before.png', after: '/trending_makeup.png', title: 'Bridal Makeover' }
    ],
    faqs: [
      { q: 'Can I change my hair and makeup at the same time?', a: 'Yes! You can combine a new haircut, a trendy lipstick shade, colored contact lenses, and nail art for a complete transformation.' },
      { q: 'Is there a limit to how many styles I can combine?', a: 'No, you can experiment and build custom makeovers with as many changes as you like.' },
      { q: 'Can I save my makeover results?', a: 'Yes, you can download your makeover photos or add them to your history and favorites.' }
    ]
  }
};

export default function SeoPage({ path, user, onSelectPlan, onOpenAuth, navigateToTab, setPreloadedImage }) {
  const [openFaq, setOpenFaq] = useState(null);
  const config = SEO_PAGES_CONFIG[path];

  if (!config) return null;

  useEffect(() => {
    document.title = config.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', config.metaDescription);
    }
  }, [config]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (setPreloadedImage) {
      setPreloadedImage({ url, file });
    }
    navigateToTab(config.tab);
  };

  return (
    <div className="seo-page-container animate-fade-in" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* 1. HERO HEADER AREA */}
      <section className="seo-hero" style={{ padding: '6rem 1rem 4rem', textAlign: 'center', borderBottom: '1px solid rgba(255,46,147,0.1)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="hero-badge animate-slide-up" style={{ display: 'inline-flex', gap: '6px', background: 'rgba(255,46,147,0.08)', color: 'var(--color-pink-primary)', padding: '6px 16px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(255,46,147,0.15)' }}>
            <Sparkles size={14} />
            <span>AI Beauty Studio</span>
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, background: 'var(--gradient-pink-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 1.5rem', lineHeight: 1.2 }} className="animate-slide-up">
            {config.h1}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '640px', margin: '0 auto 2.5rem' }} className="animate-slide-up">
            {config.subtitle}
          </p>

          {/* Privacy & Safety Badge (Highly visible for Europe/US users) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(255,46,147,0.15)',
            padding: '12px 24px',
            borderRadius: '12px',
            marginBottom: '2.5rem',
            textAlign: 'left',
            maxWidth: '520px',
            boxShadow: 'var(--shadow-sm)'
          }} className="animate-slide-up glass-panel">
            <ShieldCheck size={28} color="#10b981" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Your photo is private</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>We do not sell your images. You can delete your photos anytime. We strictly comply with data privacy policies.</div>
            </div>
          </div>

          {/* Upload Photo Button Portal */}
          <div className="seo-upload-action animate-slide-up" style={{ marginBottom: '1rem' }}>
            <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700, gap: '10px', margin: '0 auto' }}>
              <Upload size={20} />
              <span>Upload Photo to Try On</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </div>
      </section>

      {/* 2. BEFORE/AFTER GALLERY GRID */}
      <section className="seo-gallery" style={{ padding: '4rem 1rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-badge" style={{ display: 'inline-block', background: 'rgba(255,46,147,0.08)', color: 'var(--color-pink-primary)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid rgba(255,46,147,0.12)' }}>Showcase Gallery</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>See the Magic in Action</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>Drag the sliders below to check the stunning before and after transformations created by our artificial intelligence.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem 2rem'
          }}>
            {config.examples.map((ex, index) => (
              <div key={index} className="seo-gallery-item glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-primary)' }}>
                <SliderComparison 
                  beforeSrc={ex.before} 
                  afterSrc={ex.after} 
                  title={ex.title} 
                  hideActions={true} 
                />
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '1rem', textAlign: 'center' }}>
                  {ex.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE FAQ ACCORDION */}
      <section className="seo-faq" style={{ padding: '5rem 1rem 4rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-badge" style={{ display: 'inline-block', background: 'rgba(255,46,147,0.08)', color: 'var(--color-pink-primary)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid rgba(255,46,147,0.12)' }}>Frequently Asked Questions</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Got Questions? We Have Answers</h2>
          </div>

          <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {config.faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="faq-item glass-panel" 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid rgba(255,46,147,0.06)' 
                  }}
                >
                  <button 
                    onClick={() => toggleFaq(index)} 
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1.25rem 1.5rem', 
                      background: 'none', 
                      border: 'none', 
                      outline: 'none', 
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{faq.q}</span>
                    <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6 }} className="animate-slide-down">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section className="seo-pricing" style={{ padding: '4rem 0 6rem', borderTop: '1px solid rgba(255,46,147,0.1)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-badge" style={{ display: 'inline-block', background: 'rgba(255,46,147,0.08)', color: 'var(--color-pink-primary)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid rgba(255,46,147,0.12)' }}>Pricing Plans</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Simple, Transparent Pricing</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>Choose the perfect plan to generate high-resolution virtual makeovers with priority speed and styling.</p>
          </div>
          <Pricing 
            user={user} 
            onSelectPlan={onSelectPlan} 
            onOpenAuth={onOpenAuth} 
          />
        </div>
      </section>
    </div>
  );
}
