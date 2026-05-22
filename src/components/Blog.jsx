import React, { useState } from 'react';
import { Clock, ArrowRight, ArrowLeft, Tag, Sparkles, Star, Users } from 'lucide-react';

const BLOG_ARTICLES = [
  {
    id: 1,
    slug: 'best-hairstyles-for-face-shapes',
    category: 'Guides',
    title: 'How to Choose the Perfect Hairstyle for Your Face Shape in 2025',
    excerpt: 'Finding the perfect haircut starts with understanding your face shape. Whether it is oval, round, square, or heart — there is a style for every type that will highlight your best features.',
    minRead: 7,
    date: 'May 14, 2025',
    image: '/blog/face-shapes.jpg',
    tags: ['Stylist Tips', 'Face Shape', 'Guide'],
    content: [
      {
        type: 'intro',
        text: 'Your face shape is the most important factor when choosing a new haircut. The right hairstyle can visually correct features, create balance, and completely transform you. A bad haircut, on the other hand, can ruin even the most trendy look. The good news: once you identify your face shape, choosing a style becomes a simple and enjoyable process.'
      },
      {
        type: 'h2', text: '🔍 How to Determine Your Face Shape'
      },
      {
        type: 'p', text: 'Stand in front of a mirror, pull your hair back. Trace the outline of your face with lipstick or a washable marker directly on the mirror. The resulting shape is your face shape. Alternatively, you can measure the width of your forehead, cheekbones, jawline, and the length of your face from the hairline to the chin.'
      },
      {
        type: 'h2', text: '✨ Oval Face — The Universal Canvas'
      },
      {
        type: 'p', text: 'An oval face shape is considered the golden standard of proportions: its length slightly exceeds its width, and the jaw is slightly narrower than the forehead. Absolutely anything suits this shape: from an ultra-short pixie to a classic bob, long layers, and bangs of any kind.'
      },
      {
        type: 'tip', text: 'GlamAI Tip: Feel free to experiment with an oval face! Use our AI tool to try on 5+ radically different looks at once.'
      },
      {
        type: 'h2', text: '💫 Round Face — Adding Volume and Angles'
      },
      {
        type: 'p', text: 'A round face features equal width and length, soft lines, and full cheeks. The goal of the haircut is to visually elongate the face and add definition. Ideal choices: a lob (long bob), layers starting below the chin, side-swept bangs, and high ponytails. Avoid chin-length blunt cuts and thick straight bangs, which will make the face look wider.'
      },
      {
        type: 'h2', text: '🔲 Square Face — Softening the Jawline'
      },
      {
        type: 'p', text: 'A square face is characterized by a forehead, cheekbones, and jawline of equal width, along with strong, sharp corners at the jaw. The haircut should soften these angles. Excellent choices: textured layers, soft waves, an asymmetrical bob, and long curtain bangs split down the middle. It is best to avoid blunt cuts and center parts.'
      },
      {
        type: 'h2', text: '💖 Heart-Shaped Face — Balancing Forehead and Chin'
      },
      {
        type: 'p', text: 'A heart-shaped face has a wide forehead and a narrow, pointed chin. Our goal is to add fullness around the jawline. Good options: a classic bob, styles with volume at the ends, a side part, and wispy bangs. Avoid short, voluminous styles that make the top of the face look even wider.'
      },
      {
        type: 'h2', text: '💎 Diamond Face — Smoothing the Cheekbones'
      },
      {
        type: 'p', text: 'A diamond face shape has a narrow forehead and jawline with wide, prominent cheekbones. We recommend adding volume at the roots and at the jawline level. Ideal styles: a pixie with volume at the crown, a shoulder-length bob with soft texture, and side-swept bangs. Avoid slicked-back styles.'
      },
      {
        type: 'cta', text: 'Not sure what your face shape is and what fits you best? Upload your photo to GlamAI and try on any of these hairstyles online in seconds!'
      }
    ]
  },
  {
    id: 2,
    slug: 'trending-hair-colors-2025',
    category: 'Trends',
    title: 'Top 10 Trending Hair Colors for 2025',
    excerpt: 'From deep multi-dimensional brunettes to bold pastel shades, individuality is the main trend in 2025. Here are the top colors dominating hair salons.',
    minRead: 5,
    date: 'May 8, 2025',
    image: '/blog/hair-colors.jpg',
    tags: ['Hair Color', 'Trends', '2025'],
    content: [
      {
        type: 'intro',
        text: '2025 has become the year of personalized hair coloring. The days of solid, flat colors are gone. Today\'s trends focus on depth, reflections, and shades that highlight your personality. Here are the 10 most popular shades of the year.'
      },
      {
        type: 'h2', text: '1. 🍯 Honey Glazed Brunette'
      },
      {
        type: 'p', text: 'The biggest trend of the year is the glazed effect. Warm honey and amber highlights are layered over a dark chocolate base, playing beautifully in the sun. This low-maintenance color doesn\'t require frequent root touch-ups and suits almost any skin tone.'
      },
      {
        type: 'h2', text: '2. 🌙 Deep Midnight Blue-Black'
      },
      {
        type: 'p', text: 'For dark hair lovers, blue-black is the ultimate upgrade this season. Under daylight, it reveals deep ink, indigo, or purple reflections. It looks mysterious and highly sophisticated.'
      },
      {
        type: 'h2', text: '3. ☁️ Platinum Cloud'
      },
      {
        type: 'p', text: 'Icy platinum blond remains popular, but in 2025 it became softer. Roots are now slightly shadowed to create a smooth transition to pastel ash tones. This looks more natural and refined.'
      },
      {
        type: 'tip', text: 'Expert Tip: Use GlamAI to try platinum, ash, or silver blond on yourself before committing to a full bleach at the salon.'
      },
      {
        type: 'h2', text: '4. 🌅 Copper Sunset'
      },
      {
        type: 'p', text: 'Coppers and reds are experiencing a massive boom. Vibrant, fiery shades ranging from golden ginger to deep terracotta are turning heads. They perfectly highlight warm skin undertones and green or brown eyes.'
      },
      {
        type: 'h2', text: '5. 🌸 Strawberry Blonde'
      },
      {
        type: 'p', text: 'The perfect balance between blonde and soft rose gold. In 2025, this shade became cooler — less orange, more of a soft rosy blush. It instantly refreshes the face.'
      },
      {
        type: 'h2', text: '6. 💜 Soft Lavender'
      },
      {
        type: 'p', text: 'Vibrant creative colors are giving way to pastel tones. Lilac, soft lavender, and dusty violet on a light base create a dreamlike yet highly wearable and stylish look.'
      },
      {
        type: 'h2', text: '7. 🤍 Dimensional Ash Silver'
      },
      {
        type: 'p', text: 'A sleek, clean, and elegant color. A combination of white, grey, and platinum tones creates an outstanding dimensional silver glow that looks incredibly expensive.'
      },
      {
        type: 'h2', text: '8. 🍂 Spicy Cinnamon'
      },
      {
        type: 'p', text: 'A warm, cozy shade combining chestnut, copper, and chocolate tones. Using the balayage technique achieves a beautiful sun-kissed effect.'
      },
      {
        type: 'h2', text: '9. 🖤 Glossy Black with Hidden Accents'
      },
      {
        type: 'p', text: 'The hidden coloring trend: strict dark or black hair on the outside, with vibrant strands (blue, magenta, or green) hiding underneath, visible only with movement or in updos.'
      },
      {
        type: 'h2', text: '10. 🌊 Deep Ocean Blue'
      },
      {
        type: 'p', text: 'Turquoise, cobalt, and deep sapphire tones have moved out of the underground. They look great both as accent strands and as a full-color look.'
      },
      {
        type: 'cta', text: 'Want to try these shades on your hair before visiting a colorist? Do it in GlamAI — instantly and completely free!'
      }
    ]
  },
  {
    id: 3,
    slug: 'ai-hair-try-on-guide',
    category: 'AI Tools',
    title: 'How to Use Virtual Hairstyle Try-On for the Perfect Results',
    excerpt: 'AI try-on technology has completely changed how we choose our style. Here are a few simple tips to help you get the most realistic results.',
    minRead: 6,
    date: 'April 30, 2025',
    image: '/blog/ai-tools.jpg',
    tags: ['AI Tech', 'Guide', 'Lifehacks'],
    content: [
      {
        type: 'intro',
        text: 'Virtual hairstyle try-on has saved millions of people from the fear of a bad haircut. No more guessing if a bob or bangs will look good on you. However, the quality of the result depends heavily on how you use the tool. Let\'s explore how to get the perfect result.'
      },
      {
        type: 'h2', text: '📸 Step 1: A Good Photo is Key'
      },
      {
        type: 'p', text: 'The performance of the neural network depends directly on the source image. Take a front-facing portrait photo with good, even lighting. Avoid deep shadows on your face, remove glasses (they interfere with the AI precisely identifying the hair boundaries), and do not use a harsh flash. Natural light from a window is ideal.'
      },
      {
        type: 'tip', text: 'GlamAI Tip: We recommend tying your hair back or pinning it up if you want to try on a short haircut. This allows the AI to overlay the new hair as naturally as possible.'
      },
      {
        type: 'h2', text: '🎨 Step 2: Choose the Correct Gender in Settings'
      },
      {
        type: 'p', text: 'Be sure to specify the correct gender in the settings panel. This affects the style database selection and the algorithms generating hair texture, volume, and thickness, making the result much more realistic.'
      },
      {
        type: 'h2', text: '✂️ Step 3: Try Multiple Styles at Once'
      },
      {
        type: 'p', text: 'GlamAI supports batch generation. You can select multiple hairstyles and run the generation simultaneously. This saves time and allows you to compare different options side by side on one screen.'
      },
      {
        type: 'h2', text: '🖥️ Step 4: Show the Result to Your Stylist'
      },
      {
        type: 'p', text: 'Instead of trying to explain what you want to your hairdresser with gestures or showing photos of celebrities, just save and show them your photo with the generated hairstyle. This eliminates any misunderstanding.'
      },
      {
        type: 'h2', text: '💡 Checklist for Best Results'
      },
      {
        type: 'p', text: '• The photo resolution should be high (clear facial features)\n• Look straight into the camera without tilting your head\n• The hairline on your forehead should be visible\n• Try the same style in different colors\n• If the result isn\'t perfect, try another photo — lighting is everything'
      },
      {
        type: 'cta', text: 'Ready to try? Upload your photo to GlamAI and find your new style in seconds. The first generation is free!'
      }
    ]
  },
  {
    id: 4,
    slug: 'wolf-cut-complete-guide',
    category: 'Styles',
    title: 'Wolf Cut Hairstyle: Complete Guide to the Main Trend',
    excerpt: 'The "wolf cut" continues to take the world by storm. A mix of shag and mullet — we explain who this bold look suits and how to style it.',
    minRead: 8,
    date: 'April 22, 2025',
    image: '/blog/wolf-cut.jpg',
    tags: ['Wolf Cut', 'Popular Styles', 'Trends'],
    content: [
      {
        type: 'intro',
        text: 'The Wolf Cut burst into trends a few years ago and is here to stay. In 2025, this haircut has evolved, becoming softer and highly adaptable to different hair types. Let\'s find out why this hairstyle is so popular.'
      },
      {
        type: 'h2', text: '🐺 What is a Wolf Cut?'
      },
      {
        type: 'p', text: 'It is a hybrid haircut that combines the rebellious spirit of a mullet (short volume on top, long layers in the back) with the effortless ease of a shag (lots of choppy layers). The main feature is pronounced volume at the crown, tapering into light, textured ends, along with bangs (straight, choppy, or curtain bangs).'
      },
      {
        type: 'h2', text: '✨ Why Does Everyone Love It?'
      },
      {
        type: 'p', text: 'The secret lies in the incredible movement of the hair. The Wolf Cut adds volume to thin hair and makes thick hair lighter and more manageable through thinning layers. The haircut looks lively, casual, and stylish even without complex styling.'
      },
      {
        type: 'tip', text: 'GlamAI\'s library includes the Wolf Cut for both women and men. Try this look online before your visit to the salon!'
      },
      {
        type: 'h2', text: '💇 Wolf Cut Variations in 2025'
      },
      {
        type: 'p', text: '**Short Wolf Cut**: Resembles a pixie-mullet. A bold, grungy, and highly stylish option.\n\n**Medium Length**: The most popular classic option. Layers start at the cheekbones, beautifully framing the face.\n\n**Long Version**: Preserves hair length while adding texture and volume at the crown.\n\n**Curly Wolf Cut**: On wavy and curly hair, this haircut looks incredibly voluminous and natural.'
      },
      {
        type: 'h2', text: '🙋 Who Suits the Haircut?'
      },
      {
        type: 'p', text: 'The haircut is ideal for oval, heart-shaped, and rectangular face shapes. For round faces, stylists recommend keeping longer layers around the face to visually elongate the oval. For square faces, the soft, choppy strands help soften the jawline.'
      },
      {
        type: 'h2', text: '💆 How to Style a Wolf Cut'
      },
      {
        type: 'p', text: 'For an everyday look, simply apply a texturizing spray or mousse to damp hair and blow-dry with a diffuser. For a more polished look, style the layers framing the face outward using a round brush, while lifting the crown at the roots.'
      },
      {
        type: 'cta', text: 'Want to know if a Wolf Cut suits you? Upload your photo to GlamAI and see yourself in this look right now!'
      }
    ]
  },
  {
    id: 5,
    slug: 'hair-care-tips-color-treated',
    category: 'Hair Care',
    title: '12 Rules for Color-Treated Hair Care',
    excerpt: 'Color-treated hair needs special attention. From choosing the right shampoo to heat protection, here are our tips to keep your color bright and your hair healthy.',
    minRead: 6,
    date: 'April 15, 2025',
    image: '/blog/hair-care.jpg',
    tags: ['Hair Care', 'Color-Treated', 'Tips'],
    content: [
      {
        type: 'intro',
        text: 'You have invested time and money into the perfect hair color. Now the main task is to keep it vibrant and glossy for as long as possible. Color-treated hair is porous and fragile, so it requires special care.'
      },
      {
        type: 'h2', text: '1. 🧴 Use Sulfate-Free Shampoo'
      },
      {
        type: 'p', text: 'Regular shampoos contain harsh sulfates that quickly wash out the dye pigment from the hair cuticle. Shampoos labeled "for color-treated hair" gently cleanse the scalp, seal the hair cuticles, and lock in the color.'
      },
      {
        type: 'h2', text: '2. 💧 Wait 72 Hours Before Washing'
      },
      {
        type: 'p', text: 'The dye needs time to settle in the hair structure. Washing your hair in the first two days after the salon is the leading cause of quick color fading. Wait three days.'
      },
      {
        type: 'tip', text: 'GlamAI Tip: Worried about damaging your hair quality with frequent coloring? Experiment with colors virtually in our app.'
      },
      {
        type: 'h2', text: '3. 🚿 Wash Hair with Lukewarm Water'
      },
      {
        type: 'p', text: 'Hot water opens up the hair cuticles, causing the pigment to wash out much faster. Use warm or cool water. At the end of the wash, rinse your hair with cold water for extra shine.'
      },
      {
        type: 'h2', text: '4. 🔥 Always Apply Heat Protection'
      },
      {
        type: 'p', text: 'High temperatures from blow dryers and curling irons literally burn out the color and dry out the hair. A heat protectant (spray, cream, or oil) must be a mandatory step before any heat styling.'
      },
      {
        type: 'h2', text: '5. 🎨 Use Toning Products'
      },
      {
        type: 'p', text: 'Purple and blue shampoos are essential for blondes to neutralize unwanted yellow brassiness. To maintain red or chocolate shades, use toning balms once a week.'
      },
      {
        type: 'h2', text: '6. 🌞 Protect Hair from the Sun'
      },
      {
        type: 'p', text: 'UV rays break down pigment and dry out hair. In summer, use leave-in products with SPF filters or wear hats, especially on the beach.'
      },
      {
        type: 'h2', text: '7. 💆 Use Nourishing Masks'
      },
      {
        type: 'p', text: 'Regular coloring damages the hair protein structure. Once a week, apply a deep restoring mask with keratin, amino acids, and natural oils (argan, coconut).'
      },
      {
        type: 'h2', text: '8. 🌙 Sleep on a Silk Pillowcase'
      },
      {
        type: 'p', text: 'Silk or satin reduces hair friction during sleep. This prevents breakage, split ends, and helps hair stay smooth and manageable.'
      },
      {
        type: 'cta', text: 'Thinking about a new color? Try it on in GlamAI before heading to the salon to be absolutely sure of your choice!'
      }
    ]
  },
  {
    id: 6,
    slug: 'pixie-cut-comeback-2025',
    category: 'Styles',
    title: 'The Pixie Comeback: Why Short Cuts Rule the World in 2025',
    excerpt: 'Short hair is experiencing an incredible boom. We explore the variety of stylish pixie options — from textured layers to daring undercuts.',
    minRead: 5,
    date: 'April 5, 2025',
    image: '/blog/pixie-cut.jpg',
    tags: ['Pixie Cut', 'Short Hair', 'Trends'],
    content: [
      {
        type: 'intro',
        text: 'In 2025, short haircuts have become a symbol of boldness and confidence. After years of long extension dominance, the pixie has made a grand comeback to the runways and city streets.'
      },
      {
        type: 'h2', text: '💇 The Pixie Revolution'
      },
      {
        type: 'p', text: 'A pixie is not just a haircut, it\'s a statement. By letting go of length, a woman opens up her face and declares her individuality. A short haircut highlights the neck and cheekbones, and makes the eyes look much more expressive.'
      },
      {
        type: 'h2', text: '✨ Trending Pixie Styles in 2025'
      },
      {
        type: 'p', text: '**Classic Pixie**: Short sides and back with slightly longer strands on top. An elegant classic.\n\n**Textured Pixie**: Choppy layers create an effortless, messy look. Looks extremely modern.\n\n**Pixie with Long Side Bangs**: Allows for styling experiments and beautifully frames the face.\n\n**Undercut Pixie**: Shaved or ultra-short sides combined with a voluminous top. A daring choice.'
      },
      {
        type: 'tip', text: 'Several pixie options are available in GlamAI. See how this haircut will transform your look, completely free!'
      },
      {
        type: 'h2', text: '🤔 Does a Short Cut Suit You?'
      },
      {
        type: 'p', text: 'The pixie looks gorgeous on oval and heart-shaped face shapes. If you have a round face, choose options with volume at the crown and asymmetrical bangs to visually narrow the face. For a square face, a soft textured pixie is the best option.'
      },
      {
        type: 'h2', text: '⏰ Minimal Styling Time'
      },
      {
        type: 'p', text: 'The practical side of the pixie is undeniable: blow-drying takes 3 minutes. For styling, a drop of texturizing clay or wax is enough to define individual strands. You will always look chic and put-together.'
      },
      {
        type: 'cta', text: 'Afraid of drastic changes? Check how you look with a pixie using GlamAI without any risk!'
      }
    ]
  },
  {
    id: 7,
    slug: 'glamai-brand-story',
    category: 'About Us',
    title: 'GlamAI: Our Mission and the Hair Care Revolution',
    excerpt: 'Discover the story behind GlamAI. From cutting-edge neural networks to our core mission — saving the world from bad salon trips and giving everyone style confidence.',
    minRead: 6,
    date: 'April 1, 2025',
    image: '/blog/glamai-brand.jpg',
    tags: ['GlamAI', 'Beauty Tech', 'Our Brand'],
    content: [
      {
        type: 'intro',
        text: 'Every one of us has walked out of a hair salon feeling disappointed at least once. At GlamAI, we decided to put an end to this. Our goal is to democratize beauty by combining advanced artificial intelligence technologies with the expertise of leading stylists.'
      },
      {
        type: 'h2', text: '💡 Why We Built This'
      },
      {
        type: 'p', text: 'The idea for GlamAI was born from a simple observation: people are afraid to change because they cannot predict the outcome. "Will this color suit me? Will bangs make me look older?" — these questions stop us from experimenting. GlamAI\'s virtual try-on allows you to test any look without risks to your hair or budget.'
      },
      {
        type: 'h2', text: '🧬 Technology Serving Beauty'
      },
      {
        type: 'p', text: 'At the core of GlamAI are advanced diffusion neural networks, which we specifically trained on hundreds of thousands of photos of professional hairstyles and colorings. Our algorithm doesn\'t just slap a "hair template" on top of your head. It analyzes your face shape, skin tone, and the lighting in the source photo, then seamlessly integrates the new hairstyle, preserving your individuality and creating a photo-realistic result.'
      },
      {
        type: 'h2', text: '🌱 Smart Consumption & Hair Health'
      },
      {
        type: 'p', text: 'We believe that a conscious approach to beauty helps protect hair health. By trying styles online, you avoid unnecessary bleaching and coloring processes that damage the hair structure. GlamAI stands for the health of your hair: make sure of your choice first, then confidently visit the salon for the perfect result.'
      },
      {
        type: 'h2', text: '🚀 What Lies Ahead?'
      },
      {
        type: 'p', text: 'We are constantly training our neural network on new trends and haircuts. Our plans include launching a smart recommendation system that will detect your face shape and color type from your photo and automatically suggest the best haircut options. We are also developing a hair condition analysis module to recommend personalized care products.'
      },
      {
        type: 'cta', text: 'Take a step toward your new look with GlamAI — use artificial intelligence to find your perfect hairstyle right now!'
      }
    ]
  }
];

const CATEGORIES = ['All', 'Guides', 'Trends', 'AI Tools', 'Styles', 'Hair Care', 'About Us'];

function ArticlePage({ article, onBack, onStartClick }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', animation: 'fadeIn 0.35s ease' }}>
      {/* Back button */}
      <div style={{ padding: '1.5rem 0', borderBottom: '1px solid rgba(255,46,147,0.06)', position: 'sticky', top: '0', zIndex: 50, background: 'var(--bg-primary)', backdropFilter: 'blur(12px)' }}>
        <div className="container">
          <button
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--color-pink-primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back to blog
          </button>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ width: '100%', height: '420px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={article.image}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(var(--bg-primary-rgb, 10,10,18),0.95) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '2.5rem', left: 0, right: 0 }}>
          <div className="container" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <span style={{ display: 'inline-block', background: 'var(--gradient-pink-purple)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '0.3rem 0.9rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>
              {article.category}
            </span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: 0, textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Meta bar */}
      <div style={{ borderBottom: '1px solid rgba(255,46,147,0.06)', padding: '1rem 0' }}>
        <div className="container" style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <Clock size={13} /> <span>{article.minRead} min read</span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{article.date}</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {article.tags.map(tag => (
              <span key={tag} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '20px', background: 'rgba(255,46,147,0.07)', color: 'var(--color-pink-primary)', border: '1px solid rgba(255,46,147,0.12)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Article body */}
      <article style={{ padding: '3rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '780px', margin: '0 auto' }}>
          {article.content.map((block, i) => {
            if (block.type === 'intro') return (
              <p key={i} style={{ fontSize: '1.12rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '2rem', fontWeight: 500, borderLeft: '3px solid var(--color-pink-primary)', paddingLeft: '1.25rem' }}>
                {block.text}
              </p>
            );
            if (block.type === 'h2') return (
              <h2 key={i} style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2.25rem 0 0.85rem' }}>
                {block.text}
              </h2>
            );
            if (block.type === 'p') return (
              <p key={i} style={{ fontSize: '0.97rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
                {block.text}
              </p>
            );
            if (block.type === 'tip') return (
              <div key={i} style={{ margin: '1.75rem 0', padding: '1.1rem 1.4rem', background: 'rgba(255,46,147,0.07)', border: '1px solid rgba(255,46,147,0.2)', borderRadius: '14px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Sparkles size={18} color="var(--color-pink-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6 }}>{block.text}</p>
              </div>
            );
            if (block.type === 'cta') return (
              <div key={i} style={{ margin: '3rem 0 0', padding: '2rem', background: 'linear-gradient(135deg, rgba(255,46,147,0.08) 0%, rgba(138,43,226,0.08) 100%)', borderRadius: '20px', border: '1px solid rgba(255,46,147,0.15)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, si) => <Star key={si} size={16} fill="var(--color-pink-primary)" color="var(--color-pink-primary)" />)}
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.6rem' }}>Ready to try it yourself?</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>{block.text}</p>
                <button className="btn btn-primary" onClick={onStartClick} style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
                  <Sparkles size={16} /> Try GlamAI for Free
                </button>
              </div>
            );
            return null;
          })}
        </div>
      </article>
    </div>
  );
}

export default function Blog({ onStartClick }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openArticle, setOpenArticle] = useState(null);

  const filtered = activeCategory === 'All'
    ? BLOG_ARTICLES
    : BLOG_ARTICLES.filter(a => a.category === activeCategory);

  if (openArticle) {
    return <ArticlePage article={openArticle} onBack={() => setOpenArticle(null)} onStartClick={() => { setOpenArticle(null); onStartClick(); }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Blog Hero */}
      <section style={{ padding: '4rem 0 3rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,46,147,0.05) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,46,147,0.06)' }}>
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="section-badge" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            ✨ GlamAI Magazine
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem', lineHeight: 1.15 }}>
            Inspiration & Expert Hair Care Advice
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Trends, guides, and tips to help you find your perfect look. Try any hairstyle online in seconds.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div style={{ padding: '2rem 0', borderBottom: '1px solid rgba(255,46,147,0.06)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: activeCategory === cat ? '1px solid var(--color-pink-primary)' : '1px solid rgba(255,46,147,0.15)',
                  background: activeCategory === cat ? 'var(--gradient-pink-purple)' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeCategory === cat ? '0 4px 12px rgba(255,46,147,0.2)' : 'none',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <section style={{ padding: '3.5rem 0 5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {filtered.map(article => (
              <article
                key={article.id}
                className="glass-panel"
                style={{ borderRadius: '20px', overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(255,46,147,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                onClick={() => setOpenArticle(article)}
              >
                {/* Cover image */}
                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
                  <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--gradient-pink-purple)', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {article.category}
                  </span>
                </div>

                {/* Card body */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <span>{article.date}</span>
                    <span>·</span>
                    <Clock size={12} />
                    <span>{article.minRead} min read</span>
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, margin: 0 }}>
                    {article.title}
                  </h2>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, flex: 1 }}>
                    {article.excerpt}
                  </p>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {article.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '20px', background: 'rgba(255,46,147,0.07)', color: 'var(--color-pink-primary)', border: '1px solid rgba(255,46,147,0.12)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    style={{ marginTop: '0.25rem', background: 'transparent', border: 'none', color: 'var(--color-pink-primary)', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    Read article <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, rgba(255,46,147,0.06) 0%, rgba(138,43,226,0.06) 100%)', borderTop: '1px solid rgba(255,46,147,0.08)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.75rem' }}>
            Stop imagining. Start seeing.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Any look from these articles is available to try on your photo in GlamAI. No salon visits, no risks — instant transformation with AI.
          </p>
          <button className="btn btn-primary" onClick={onStartClick} style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
            <Sparkles size={16} /> Try GlamAI for Free
          </button>
        </div>
      </div>
    </div>
  );
}
