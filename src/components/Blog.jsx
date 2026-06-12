import t from '../utils/i18n';
import React, { useState, useEffect } from 'react';
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
  },
  {
    id: 8,
    slug: 'makeup-trends-2025',
    category: 'Makeup',
    title: 'Top 10 Makeup Trends Dominating 2025: From Latte Makeup to Siren Eyes',
    excerpt: 'The beauty world moves fast. Here are the 10 makeup trends every beauty lover should know this year — from glass skin to bold editorial eye art.',
    minRead: 7,
    date: 'June 5, 2025',
    image: '/blog/makeup-trends.png',
    tags: ['Makeup', 'Trends', '2025'],
    content: [
      {
        type: 'intro',
        text: '2025 is redefining beauty standards. Makeup this year is all about expressing personality — whether that means a barely-there "your skin but better" look or a dramatic editorial moment. We\'ve rounded up the 10 biggest makeup trends taking over social media and runways.'
      },
      {
        type: 'h2', text: '1. ☕ Latte Makeup'
      },
      {
        type: 'p', text: 'The trend that swept TikTok and Instagram: warm brown tones across the entire face. Think caramel eyeshadow, brown liner, coffee-toned blush, and a nude-brown lip. The result is a cozy, effortlessly chic look that flatters every skin tone and works for both daytime and evening.'
      },
      {
        type: 'h2', text: '2. 🧊 Glass Skin'
      },
      {
        type: 'p', text: 'Borrowed from K-beauty, glass skin focuses on achieving a dewy, translucent glow. The technique layers hydrating primers, luminous foundations, and cream highlighters to create skin that looks lit from within. Skip the powder — this look is all about moisture and reflection.'
      },
      {
        type: 'tip', text: 'GlamAI Tip: Try our Glass Skin preset in the Makeup tab — it applies dewy highlighter, soft blush, and natural lip color to your photo instantly!'
      },
      {
        type: 'h2', text: '3. 🔥 Siren Eyes'
      },
      {
        type: 'p', text: 'The siren eye technique elongates the eyes using strategic liner and shadow placement. Dark shadow is concentrated at the outer corner and pulled upward, while the inner corner gets a clean highlight. The result: sultry, feline eyes that look dangerously glamorous.'
      },
      {
        type: 'h2', text: '4. 🌸 Soft-Girl Blush'
      },
      {
        type: 'p', text: 'Blush is the star product of 2025. Applied generously across cheeks, nose bridge, and even eyelids, it creates a youthful, sun-kissed flush. Cream and liquid blush formulas in peachy-pink and coral shades are the top picks.'
      },
      {
        type: 'h2', text: '5. 💎 Y2K Sparkle Revival'
      },
      {
        type: 'p', text: 'Glitter is back — but elevated. Think micro-shimmer eyeshadows, crystal accents near the eyes, and iridescent highlighters. The 2000s nostalgia wave brings body glitter, glossy lids, and metallic lip toppers back into the spotlight.'
      },
      {
        type: 'h2', text: '6. 🍓 Strawberry Girl Makeup'
      },
      {
        type: 'p', text: 'Fresh, fruity, and playful. This trend combines dewy skin with rosy-pink blush concentrated on the apples of the cheeks, a berry-tinted lip balm, and minimal eye makeup. It\'s the embodiment of effortless summer beauty.'
      },
      {
        type: 'h2', text: '7. 🎭 Bold Lip Comebacks'
      },
      {
        type: 'p', text: 'After years of nude lip dominance, bold lips are reclaiming their throne. Deep burgundy, classic red, and unexpected shades like chocolate brown and tangerine are trending. The key is a precise, clean lip line paired with minimal eye makeup.'
      },
      {
        type: 'h2', text: '8. 👁️ Colored Contact Lenses'
      },
      {
        type: 'p', text: 'Colored lenses have become a mainstream beauty accessory. Hazel, emerald green, and ice blue are the most requested shades. They instantly change the mood of any makeup look and are a game-changer for photoshoots.'
      },
      {
        type: 'h2', text: '9. 🌿 Clean Girl Aesthetic'
      },
      {
        type: 'p', text: 'Minimalism reigns. Concealer only where needed, groomed brows, a swipe of clear brow gel, neutral lip balm, and a touch of cream blush. The focus is on flawless skin prep and that "I woke up like this" perfection.'
      },
      {
        type: 'h2', text: '10. 💜 Euphoria-Inspired Art'
      },
      {
        type: 'p', text: 'For those who love to push boundaries: editorial eye art with graphic liner, colored mascara, rhinestones, and unconventional color palettes (think lilac, tangerine, and electric blue). Self-expression meets artistry.'
      },
      {
        type: 'cta', text: 'Want to try Latte Makeup, Siren Eyes, or Glass Skin on your face? Upload your photo to GlamAI and experiment with all these looks instantly!'
      }
    ]
  },
  {
    id: 9,
    slug: 'virtual-makeup-try-on-guide',
    category: 'Makeup',
    title: 'How to Use AI Makeup Try-On: The Ultimate Guide to Virtual Beauty',
    excerpt: 'AI makeup tools let you test lipstick, eyeshadow, blush, and lenses before buying. Here is your complete guide to getting the most realistic virtual makeup results.',
    minRead: 6,
    date: 'May 28, 2025',
    image: '/blog/virtual-makeup.png',
    tags: ['Makeup', 'AI Tech', 'Guide'],
    content: [
      {
        type: 'intro',
        text: 'Virtual makeup try-on technology has revolutionized how we shop for beauty products and plan our looks. No more buying a lipstick only to discover it clashes with your skin tone. With AI, you can test hundreds of products and combinations in minutes — for free.'
      },
      {
        type: 'h2', text: '💄 What Can AI Makeup Try-On Do?'
      },
      {
        type: 'p', text: 'Modern AI makeup tools like GlamAI can apply a wide range of products to your photo with impressive accuracy:\n\n• **Lipstick** — Try on matte, glossy, satin, and ombre lip looks in dozens of shades\n• **Eyeshadow** — Preview smokey eyes, cut creases, glitter looks, and natural nude tones\n• **Blush** — Test placement, intensity, and shade (peachy, rose, coral)\n• **Eyeliner** — Classic, winged, graphic, and smokey liner styles\n• **Colored Lenses** — See yourself with hazel, blue, green, or violet eyes\n• **Full Presets** — Complete curated looks like Glam, Natural, Korean Glass Skin, and Bridal'
      },
      {
        type: 'h2', text: '📸 How to Get the Best Results'
      },
      {
        type: 'p', text: 'The quality of your source photo directly impacts how realistic the result looks. Here are the golden rules:\n\n**1. Face the camera directly** — A straight-on, front-facing selfie gives the AI the clearest facial landmarks to work with.\n\n**2. Use even, natural lighting** — Avoid harsh shadows, backlighting, or yellow-tinted indoor light. Soft natural daylight from a window is ideal.\n\n**3. Remove glasses and accessories** — Glasses, hats, and headbands can interfere with the AI\'s ability to precisely map the eye area and forehead.\n\n**4. Start with a clean face** — Upload a photo without any makeup for the most accurate preview of how the virtual products will look on you.'
      },
      {
        type: 'tip', text: 'GlamAI Tip: Our batch generation feature lets you try multiple makeup looks simultaneously! Select several presets and compare them side by side.'
      },
      {
        type: 'h2', text: '🛍️ Smart Shopping with Virtual Try-On'
      },
      {
        type: 'p', text: 'Virtual makeup try-on is not just fun — it saves money. Beauty products are expensive and often non-returnable once opened. By previewing shades digitally, you can confidently purchase products that actually suit your complexion. This is especially valuable for online shoppers who can\'t test products in-store.'
      },
      {
        type: 'h2', text: '💡 Perfect Use Cases'
      },
      {
        type: 'p', text: '**Wedding Planning** — Brides-to-be can test dozens of bridal makeup styles and share the results with their makeup artist to ensure perfect communication.\n\n**Event Looks** — Planning a prom, gala, or party look? Test bold options you normally wouldn\'t dare to try — risk-free.\n\n**Product Discovery** — Curious about a TikTok-viral lipstick shade? Try it on yourself before adding it to cart.\n\n**Seasonal Updates** — Refresh your everyday look with new seasonal colors as trends change.'
      },
      {
        type: 'h2', text: '🔐 Privacy & Safety'
      },
      {
        type: 'p', text: 'A common concern with AI beauty tools is photo privacy. At GlamAI, your photos are processed securely and are never used for AI training. You can delete your data at any time. We believe beautiful technology should also be trustworthy.'
      },
      {
        type: 'cta', text: 'Ready to discover your perfect makeup look? Upload your photo to GlamAI and try on lipsticks, eyeshadows, and complete beauty presets in seconds!'
      }
    ]
  },
  {
    id: 10,
    slug: 'trending-nail-designs-2025',
    category: 'Nails',
    title: 'The Hottest Nail Trends of 2025: Chrome, Aura, and Beyond',
    excerpt: 'From chrome French tips to mesmerizing aura gradients and 3D water drop art — here are the nail designs dominating salons and Instagram feeds in 2025.',
    minRead: 7,
    date: 'May 20, 2025',
    image: '/blog/nail-trends.png',
    tags: ['Nails', 'Trends', '2025'],
    content: [
      {
        type: 'intro',
        text: 'Nail art has evolved from simple polish into a true form of self-expression. In 2025, nails are bolder, more creative, and more personal than ever. Whether you prefer minimalist elegance or avant-garde art, there is a trend for you.'
      },
      {
        type: 'h2', text: '1. 🪞 Chrome & Metallic Finishes'
      },
      {
        type: 'p', text: 'Chrome nails continue to dominate. The liquid metal finish creates a futuristic, high-fashion look. In 2025, variations include silver chrome, gold chrome, rose gold chrome, and even holographic chrome. The effect is achieved with chrome powder applied over a gel base and cured under UV light.'
      },
      {
        type: 'h2', text: '2. ✨ Glazed Donut Nails'
      },
      {
        type: 'p', text: 'Popularized by Hailey Bieber, this pearlescent shimmer look isn\'t going anywhere. It uses a sheer milky base with a fine iridescent powder that gives nails a soft, luminous glow — like a freshly glazed donut. Elegant, understated, and universally flattering.'
      },
      {
        type: 'tip', text: 'GlamAI Tip: Try our "Glazed Donut" texture preset in the Nails Studio! Pair it with any nail shape to see the effect on your hands.'
      },
      {
        type: 'h2', text: '3. 🌈 Aura Gradient Nails'
      },
      {
        type: 'p', text: 'The aura nail trend features a soft, airbrushed gradient circle in the center of each nail, resembling a glowing aura. Popular color combos include pink-to-purple, blue-to-green, and peach-to-yellow. The dreamy, ethereal effect is achieved with an airbrush or sponge technique.'
      },
      {
        type: 'h2', text: '4. 🐚 3D Embellishments & Water Drops'
      },
      {
        type: 'p', text: 'Textured nails are huge in 2025. 3D gel drops ("water drop nails"), pearls, bows, and sculpted flowers add dimension and tactile interest. The water drop technique uses clear gel to create realistic dewdrop effects on the nail surface.'
      },
      {
        type: 'h2', text: '5. 🐆 Tortoiseshell & Animal Prints'
      },
      {
        type: 'p', text: 'Tortoiseshell nails mimic the warm amber-and-brown patterns of actual tortoise shell. The translucent effect is achieved by layering warm brown, amber, and black gel over a clear base. Other animal prints like cow print, snake, and leopard are also trending.'
      },
      {
        type: 'h2', text: '6. 💅 Chrome French Tips'
      },
      {
        type: 'p', text: 'The classic French manicure gets a 2025 upgrade with chrome or metallic tips. Instead of traditional white, the tips are finished with silver, gold, or copper chrome powder. The combination of a clean nude base with metallic tips is both elegant and modern.'
      },
      {
        type: 'h2', text: '7. 🌸 Soft Pastel & "Milk Bath" Nails'
      },
      {
        type: 'p', text: 'Sheer, milky pastels are the perfect everyday nail. Think translucent pink, lavender, baby blue, and mint. "Milk bath" nails add dried flower petals suspended in a clear gel layer for a romantic, spa-like effect.'
      },
      {
        type: 'h2', text: '8. 🖤 Dark Luxe: Oxblood, Navy & Black'
      },
      {
        type: 'p', text: 'Deep, moody shades make a sophisticated statement. Oxblood burgundy, midnight navy, and glossy jet black are the go-to choices for fall and winter. Pair them with a high-shine top coat for maximum drama.'
      },
      {
        type: 'h2', text: '9. 🎨 Mix-and-Match Accent Nails'
      },
      {
        type: 'p', text: 'Why choose one design when you can have several? The mix-and-match trend pairs different designs on each finger — one chrome, one French tip, one aura, one solid. It\'s personalized nail art at its finest.'
      },
      {
        type: 'h2', text: '10. 💠 Geometric & Negative Space Art'
      },
      {
        type: 'p', text: 'Clean lines, shapes, and deliberate bare spots create a modern, architectural look. Thin tape or stencils are used to create sharp geometric patterns — triangles, stripes, and abstract blocks — with sections of bare nail peeking through.'
      },
      {
        type: 'cta', text: 'Ready to try chrome, aura, or 3D nails on your hands? Upload your photo to GlamAI\'s Nail Studio and preview any design risk-free!'
      }
    ]
  },
  {
    id: 11,
    slug: 'nail-care-healthy-strong-nails',
    category: 'Nails',
    title: 'Complete Nail Care Guide: How to Grow Healthy, Strong & Beautiful Nails',
    excerpt: 'Beautiful nails start with proper care. From cuticle health to the best vitamins, here is everything you need to know about maintaining strong, gorgeous nails.',
    minRead: 8,
    date: 'May 12, 2025',
    image: '/blog/nail-care.png',
    tags: ['Nails', 'Nail Care', 'Guide'],
    content: [
      {
        type: 'intro',
        text: 'Stunning nail art and salon manicures look best on healthy, well-maintained nails. Whether you wear gel extensions, dip powder, or prefer natural nails, these care fundamentals will keep your nails strong, flexible, and beautiful.'
      },
      {
        type: 'h2', text: '1. 💧 Hydrate Your Cuticles Daily'
      },
      {
        type: 'p', text: 'Dry, cracked cuticles are the #1 enemy of beautiful nails. Apply cuticle oil (jojoba, vitamin E, or almond oil) at least once a day. Massage it into the cuticle and nail bed to promote blood flow and healthy nail growth. Keep a small cuticle oil pen in your bag for on-the-go application.'
      },
      {
        type: 'h2', text: '2. 🧤 Protect Your Hands'
      },
      {
        type: 'p', text: 'Household cleaning products, dish soap, and even prolonged water exposure weaken nails. Always wear rubber gloves when doing dishes or cleaning. Apply hand cream after every hand wash. In cold weather, wear warm gloves to prevent brittle, flaking nails.'
      },
      {
        type: 'tip', text: 'GlamAI Tip: Worried about how gel or acrylic might look on your natural nails? Preview any nail design virtually before committing to a salon appointment!'
      },
      {
        type: 'h2', text: '3. 🥗 Feed Your Nails from Within'
      },
      {
        type: 'p', text: 'Strong nails need proper nutrition. Key nutrients for nail health include:\n\n**Biotin (Vitamin B7)** — The gold standard for nail strength. Found in eggs, almonds, and salmon.\n**Iron** — Deficiency causes spoon-shaped, brittle nails. Eat lean red meat, spinach, and lentils.\n**Zinc** — Essential for nail cell growth. Sources: pumpkin seeds, chickpeas, and yogurt.\n**Protein** — Nails are made of keratin protein. Ensure adequate protein intake daily.\n**Omega-3 Fatty Acids** — Keep nails moisturized and flexible. Found in fish, walnuts, and flax seeds.'
      },
      {
        type: 'h2', text: '4. ✂️ File Correctly'
      },
      {
        type: 'p', text: 'Never saw back and forth — this causes micro-fractures and splitting. Always file in one direction, from the outer edge toward the center, using a fine-grit glass or crystal file. Avoid metal files on natural nails. Shape your nails to follow your natural cuticle line for the most flattering look.'
      },
      {
        type: 'h2', text: '5. 🚫 Skip the Nail Hardeners'
      },
      {
        type: 'p', text: 'Counterintuitive, but true: most nail hardeners contain formaldehyde, which makes nails rigid and more prone to snapping. Flexible nails are strong nails. Instead, use a nourishing base coat with keratin, calcium, or bamboo extract.'
      },
      {
        type: 'h2', text: '6. 💅 Give Your Nails Breaks Between Manicures'
      },
      {
        type: 'p', text: 'Continuous gel or acrylic wear without breaks thins the nail plate. After every 3–4 gel sessions, take a 2-week break. During this time, apply a strengthening treatment and keep nails hydrated. Your nails will thank you with faster, healthier growth.'
      },
      {
        type: 'h2', text: '7. 🧴 The Perfect At-Home Manicure Routine'
      },
      {
        type: 'p', text: '**Step 1**: Remove old polish with an acetone-free remover.\n**Step 2**: Soak hands in warm water with a drop of olive oil for 5 minutes.\n**Step 3**: Gently push back cuticles with a wooden orange stick — never cut them.\n**Step 4**: Shape nails with a glass file (one direction only).\n**Step 5**: Buff the surface lightly for smoothness.\n**Step 6**: Apply base coat, two coats of color, and a top coat.\n**Step 7**: Finish with cuticle oil and hand cream.'
      },
      {
        type: 'h2', text: '8. 🌙 Overnight Nail Treatment'
      },
      {
        type: 'p', text: 'Before bed, apply a thick layer of cuticle oil and hand cream, then wear cotton gloves overnight. This "overnight mask" deeply penetrates and restores dry, damaged nails and cuticles. You will wake up with noticeably softer, more supple hands and nails.'
      },
      {
        type: 'cta', text: 'Looking for nail design inspiration while you grow your dream nails? Try on stunning designs in GlamAI\'s Nail Studio — completely free!'
      }
    ]
  }
];

const CATEGORIES = ['All', 'Guides', 'Trends', 'AI Tools', 'Styles', 'Hair Care', 'Makeup', 'Nails', 'About Us'];

const parseMarkdownBold = (text) => {
  if (!text) return '';
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{part}</strong>;
    }
    return part;
  });
};

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
            <ArrowLeft size={16} /> {t('audit.blog.backToBlogBtn')}
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
            <Clock size={13} /> <span>{article.minRead} {t('audit.blog.minRead')}</span>
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
                {parseMarkdownBold(block.text)}
              </p>
            );
            if (block.type === 'h2') return (
              <h2 key={i} style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2.25rem 0 0.85rem' }}>
                {parseMarkdownBold(block.text)}
              </h2>
            );
            if (block.type === 'p') return (
              <p key={i} style={{ fontSize: '0.97rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
                {parseMarkdownBold(block.text)}
              </p>
            );
            if (block.type === 'tip') return (
              <div key={i} style={{ margin: '1.75rem 0', padding: '1.1rem 1.4rem', background: 'rgba(255,46,147,0.07)', border: '1px solid rgba(255,46,147,0.2)', borderRadius: '14px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Sparkles size={18} color="var(--color-pink-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6 }}>{parseMarkdownBold(block.text)}</p>
              </div>
            );
            if (block.type === 'cta') return (
              <div key={i} style={{ margin: '3rem 0 0', padding: '2rem', background: 'linear-gradient(135deg, rgba(255,46,147,0.08) 0%, rgba(138,43,226,0.08) 100%)', borderRadius: '20px', border: '1px solid rgba(255,46,147,0.15)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, si) => <Star key={si} size={16} fill="var(--color-pink-primary)" color="var(--color-pink-primary)" />)}
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.6rem' }}>{t('audit.blog.readyToTryItYourself')}</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>{parseMarkdownBold(block.text)}</p>
                <button className="btn btn-primary" onClick={onStartClick} style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
                  <Sparkles size={16} /> {t('audit.blog.tryGlamaiFreeBtn')}
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

  const handleOpenArticle = (article) => {
    setOpenArticle(article);
    window.history.pushState({ articleSlug: article.slug }, '', `/blog/${article.slug}`);
    document.title = `${article.title} | GlamAI`;
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.articleSlug) {
      window.history.back();
    } else {
      setOpenArticle(null);
      window.history.pushState(null, '', '/blog');
      document.title = 'GlamAI Magazine — Hairstyle Tips, Trends & Expert Advice';
    }
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/blog/')) {
      const slug = path.split('/blog/')[1];
      const article = BLOG_ARTICLES.find(a => a.slug === slug);
      if (article) {
        setOpenArticle(article);
        document.title = `${article.title} | GlamAI`;
        window.history.replaceState({ articleSlug: slug }, '', path);
      }
    }

    const handlePopState = (e) => {
      if (e.state && e.state.articleSlug) {
        const article = BLOG_ARTICLES.find(a => a.slug === e.state.articleSlug);
        if (article) {
          setOpenArticle(article);
          document.title = `${article.title} | GlamAI`;
        }
      } else {
        setOpenArticle(null);
        document.title = 'GlamAI Magazine — Hairstyle Tips, Trends & Expert Advice';
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const filtered = activeCategory === 'All'
    ? BLOG_ARTICLES
    : BLOG_ARTICLES.filter(a => a.category === activeCategory);

  if (openArticle) {
    return <ArticlePage article={openArticle} onBack={handleBack} onStartClick={() => { handleBack(); onStartClick(); }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Blog Hero */}
      <section style={{ padding: '4rem 0 3rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,46,147,0.05) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,46,147,0.06)' }}>
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="section-badge" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            ✨ {t('blog.magazineTitle')}
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800, background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem', lineHeight: 1.15 }}>
            {t('blog.inspiration')}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div style={{ padding: '2rem 0', borderBottom: '1px solid rgba(255,46,147,0.06)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => {
              const catKeys = {
                'All': 'blog.category.all',
                'Guides': 'blog.category.guides',
                'Trends': 'blog.category.trends',
                'AI Tools': 'blog.category.aiTools',
                'Styles': 'blog.category.styles',
                'Hair Care': 'blog.category.hairCare',
                'Makeup': 'blog.category.makeup',
                'Nails': 'blog.category.nails',
                'About Us': 'blog.category.aboutUs'
              };
              return (
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
                  {t(catKeys[cat] || cat)}
                </button>
              );
            })}
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
                onClick={() => handleOpenArticle(article)}
              >
                {/* Cover image */}
                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transition: 'transform 0.4s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    loading="lazy"
                    decoding="async"
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
                  <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--gradient-pink-purple)', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t({
                      'All': 'blog.category.all',
                      'Guides': 'blog.category.guides',
                      'Trends': 'blog.category.trends',
                      'AI Tools': 'blog.category.aiTools',
                      'Styles': 'blog.category.styles',
                      'Hair Care': 'blog.category.hairCare',
                      'Makeup': 'blog.category.makeup',
                      'Nails': 'blog.category.nails',
                      'About Us': 'blog.category.aboutUs'
                    }[article.category] || article.category)}
                  </span>
                </div>

                {/* Card body */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <span>{article.date}</span>
                    <span>·</span>
                    <Clock size={12} />
                    <span>{article.minRead} {t('audit.blog.minRead')}</span>
                  </div>

                  <h2 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)', 
                    lineHeight: 1.35, 
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '2.7em' /* Ensure consistent height for all title areas (2 lines of 1.35 line-height) */
                  }}>
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
                    {t('audit.blog.readArticleBtn')} <ArrowRight size={14} />
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
            {t('audit.blog.ctaTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            {t('audit.blog.ctaDesc')}
          </p>
          <button className="btn btn-primary" onClick={onStartClick} style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
            <Sparkles size={16} /> {t('audit.blog.tryGlamaiFreeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
