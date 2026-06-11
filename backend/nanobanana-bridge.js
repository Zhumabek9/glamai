'use strict';

const fs = require('fs');
const Replicate = require('replicate');

// Initialize Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    useFileOutput: false
});

const HAIRCUT_MAP = {
    // --- MAP BY UNIQUE STYLE ID ---
    "no-change": "keep the exact same hairstyle, only change the hair color",
    "no_change": "keep the exact same hairstyle, only change the hair color",
    "straight": "long straight hair: sleek and smooth, no waves or curls, hair falls naturally down past the shoulders, center part, preserve the original hair color exactly",
    "straightened": "freshly flat-ironed straight hair: glossy and sleek, perfectly smooth from roots to ends, no waves or frizz, preserve the original hair color exactly",
    "blunt-bangs": "shoulder-length straight hair with thick blunt-cut bangs: the bangs are cut in a perfectly straight horizontal line just above the eyebrows, covering the full width of the forehead, hair length ends at the collarbone/shoulder, smooth and sleek",
    "side-swept-bangs": "hairstyle with clearly visible side-swept bangs: thick fringe bangs swept diagonally across the forehead to one side, bangs cover the forehead and sweep past one eyebrow, medium-length straight hair falling to the shoulders, deep side part, the bangs are the defining feature — prominent and clearly visible swept across the forehead",
    "bob": "classic chin-length bob haircut: hair is CUT SHORT ending precisely at the jawline, blunt straight ends all around, smooth rounded shape, the hair length stops at the jaw and does NOT go past the chin — this is a SHORT haircut, full rounded bob silhouette framing the face, hair above the shoulders",
    "lob": "long bob (lob) haircut: hair is cut to collarbone length, ending right at the collarbone, slightly layered with natural movement, side part, blunt ends — hair does NOT go past the collarbone, this is a medium-length cut shorter than shoulder-length, the ends are clearly visible at collarbone level",
    "angled-bob": "dramatic angled bob haircut: back of hair is cut extremely short at the nape (above the collar), front pieces are noticeably longer reaching the jaw/chin level, very strong visible diagonal angle — the back is clearly much shorter than the front, sleek straight hair, the dramatic length difference between short back and longer front jaw-length pieces is the key feature, hair is SHORT overall",
    "a-line-bob": "A-line bob haircut: hair forms an A-shape — shorter at the back nape area and gradually longer toward the front reaching chin/jaw level, smooth straight hair, center or side part, front pieces reach the chin creating the A-line shape, overall hair length is SHORT — hair ends at chin level in front, NOT long hair, hair is above the shoulders",
    "asymmetrical-bob": "asymmetrical bob haircut: dramatically uneven bob — LEFT side is cut very short above the ear or at ear level, RIGHT side is noticeably longer reaching the jaw or chin level, the two sides are clearly different lengths creating a bold asymmetrical look, sleek straight hair, short overall, the extreme length difference between the two sides is the defining feature",
    "graduated-bob": "graduated bob haircut: SHORT haircut — hair at the back is stacked with graduated layers creating a rounded full shape, front pieces slightly longer reaching the chin/jaw level, smooth and polished, the back has volume from stacked layers, overall hair length is SHORT ending at chin level, classic rounded bob silhouette, hair is above the shoulders",
    "inverted-bob": "inverted bob haircut: SHORT chin-length bob with a dramatic inverted shape — back of hair is stacked and very short (above the nape), front pieces are longer reaching the chin/jaw level, the back is rounded and full from stacked layers, smooth straight hair with a deep side part, overall a clean sleek short bob silhouette, hair does NOT go past the chin",
    "pixie-cut": "Transform the hair into a classic short pixie cut like Audrey Hepburn or Halle Berry. The hair must be dramatically short: sides and back are cropped very close to the head (about 1-2cm), the top is slightly longer (2-4cm) with a textured wispy finish. Both ears must be fully visible and exposed. The nape of the neck is clean and short. There may be a very short wispy fringe on the forehead but it must NOT reach the eyebrows. This is a bold, dramatic short cut — the overall silhouette should show the shape of the head clearly. The hair should look nothing like the original length. The person's face, skin tone, expression, clothing and background remain completely unchanged. Maintain the same face angle and head pose as the original photo.",
    "pageboy": "pageboy haircut: chin-length rounded bob with thick straight blunt-cut bangs across the forehead, the hair forms a smooth rounded bowl shape curving under at the ends, dark smooth straight hair, the bangs are cut straight across just above the eyebrows, hair length ends at the chin all around in a uniform rounded shape, classic mushroom/bowl silhouette",
    "shag": "shag haircut: medium-length hair (collarbone to shoulder length) with heavy choppy layers throughout, curtain bangs parted in the middle falling on either side of the forehead, lots of texture and movement, feathered choppy ends, layered throughout with the shortest layers framing the face, 70s-inspired textured shag",
    "layered-shag": "layered shag haircut: collarbone-length hair with extensive layering throughout, curtain bangs parted in the middle, multiple visible layers from face to ends, feathered choppy textured ends, high-movement layered shag with lots of volume and texture, face-framing shortest layers",
    "choppy-layers": "choppy layers haircut: collarbone-length hair with dramatically uneven choppy layers, curtain bangs parted in the middle, the ends are cut in irregular choppy pieces creating a textured edgy look, multiple layers of different lengths throughout, high-texture choppy finish",
    "razor-cut": "razor cut hairstyle: collarbone-length hair with soft wispy feathered ends created by razor blade technique, curtain bangs or side-swept bangs, the ends are very soft and wispy (not blunt), layers throughout with feathered texture, light and airy movement",
    "layered": "long layered haircut: shoulder to mid-chest length hair with multiple visible layers throughout, face-framing layers around the front, layers add volume and movement, smooth straight-to-wavy texture, natural-looking layers cascading down, preserve the original hair color exactly",
    "wavy": "natural wavy hair: long chest-length hair with beautiful loose S-shaped waves throughout, voluminous and full, beachy natural waves, no bangs, hair falls in soft flowing waves past the chest, preserve the original hair color exactly",
    "soft-waves": "soft waves with curtain bangs: shoulder-length hair with soft loose S-shaped waves throughout, curtain bangs parted in the middle falling softly on either side of the forehead framing the face, the bangs are a key feature of this style, romantic beachy wave texture, the waves are gentle and flowing (not tight curls), hair ends at or just below the shoulders, preserve the original hair color exactly, maintain the same face angle and head pose as the original photo",
    "glamorous-waves": "glamorous waves: long hair (past shoulders) with large voluminous barrel-curl waves, deep side part, very polished and elegant finish, high volume and shine, the waves are large and dramatic, preserve the original hair color exactly",
    "hollywood-waves": "classic old Hollywood waves: long hair with structured deep S-shaped waves that sweep to one side, deep side part, waves are set close to the head and very defined, retro vintage glamour look from the 1940s-50s, smooth and polished finish, preserve the original hair color exactly",
    "finger-waves": "1920s finger waves: short hair (chin to ear length) with very tight defined S-shaped waves pressed close to the scalp, the waves are sculpted flat against the head in a precise pattern, vintage 1920s flapper style, very polished and structured, preserve the original hair color exactly",
    "tousled": "tousled hair: shoulder-length hair with a deliberately messy, undone texture — disheveled waves that look casually effortless, not polished or styled, lived-in look with natural movement and slight frizz, casual beachy feel, preserve the original hair color exactly",
    "feathered": "feathered hair: shoulder-length hair with long layers swept back from the face on both sides creating distinctive 'wings', 70s Farrah Fawcett style, the sides are blown out and feathered away from the face, voluminous and full, center part, feathered wispy ends throughout",
    "curly": "naturally curly hair: shoulder-length hair with defined spiral curls throughout, full and bouncy volume, natural curl pattern, no heat styling, preserve the original hair color exactly",
    "perm": "permed hair: shoulder-length hair with uniform medium curls all over from a chemical perm, curtain bangs parted in the middle, the curls are consistent and even throughout, voluminous and full, chemically curled texture, preserve the original hair color exactly",
    "pin-curls": "pin curls hairstyle: short hair with tight small curls pinned very close to the head in a vintage updo style, the curls are set and pinned flat against the scalp, 1940s retro vintage look, very structured and polished, preserve the original hair color exactly",
    "twist-out": "twist-out hairstyle: defined coily spiral curls from two-strand twists, natural hair texture, full and voluminous, preserve the original hair color exactly",
    "high-ponytail": "high ponytail: all hair pulled up and tied at the very top/crown of the head, sleek smooth sides, long hair falling down from the high point, maintain the same face angle and head pose as the original photo",
    "low-ponytail": "low ponytail: hair gathered and tied at the nape of the neck, sleek smooth sides, natural center part, long hair falling down from the low tie point, maintain the same face angle and head pose as the original photo",
    "bubble-ponytail": "bubble ponytail: high ponytail starting at the crown, divided into multiple sections tied with elastics creating large bubble/sphere shapes down the length, long hair with 3-5 bubble sections, maintain the same face angle and head pose as the original photo",
    "messy-bun": "messy bun: hair loosely gathered and twisted into a casual undone bun placed high on top of the head, intentionally messy with loose strands and flyaways framing the face, relaxed effortless look, maintain the same face angle and head pose as the original photo",
    "top-knot": "top knot: all hair pulled up to the very top of the head and twisted into a neat smooth knot/bun, sleek sides with no loose strands, clean and polished look, maintain the same face angle and head pose as the original photo",
    "ballerina-bun": "classic ballerina bun: all hair pulled back tightly and completely smooth into a perfectly round neat bun sitting high on top of the head at the crown, the bun is a large smooth round ball shape (like a donut bun), hair is slicked back from the forehead and temples with zero flyaways, no loose strands, the neck and ears are fully exposed, clean polished ballet dancer look, maintain the same face angle and head pose as the original photo",
    "half-up-top-knot": "half-up top knot: top section of hair pulled up and twisted into a small casual bun on top of the head, lower half of hair left loose and flowing down (wavy or straight), casual and relaxed style, maintain the same face angle and head pose as the original photo",
    "messy-bun-headband": "messy bun with headband: hair in a casual messy bun on top of the head, with a wide decorative headband placed across the top of the head/forehead, loose strands framing the face, casual and stylish, maintain the same face angle and head pose as the original photo",
    "half-up-half-down": "half-up half-down hairstyle: top half of hair pulled back and secured with a clip or tie, bottom half left loose and flowing down with natural waves, natural center part, romantic and casual, maintain the same face angle and head pose as the original photo",
    "space-buns": "space buns: hair divided by a center part into two sections, each twisted into a small round bun placed symmetrically on top of the head on either side, playful and fun Y2K style, maintain the same face angle and head pose as the original photo",
    "pigtails": "Transform the hair into classic double pigtails (twin ponytails). The hair is parted in the center. On each side of the head, ALL the hair is gathered and tied into a ponytail with a visible hair elastic. The left ponytail hangs down over the left shoulder, and the right ponytail hangs down over the right shoulder. Each ponytail is thick and full, starting at about ear level. The two ponytails are clearly separated and symmetrical. There should be NO loose hair hanging down — everything is pulled into the two ponytails. The overall look is youthful and playful with two distinct, bouncy ponytails clearly visible from the front. Do NOT create braids — these are simple tied ponytails. The person's face, skin tone, expression, clothing and background remain completely unchanged. Maintain the same face angle and head pose as the original photo.",
    "hair-bow": "hair bow bun hairstyle: the hair on top of the head is styled into a large decorative bow shape made entirely from the person's own hair — two large rounded loops of hair form the two sides of the bow, with a small wrapped section in the center, the bow sits prominently on top of the head like a hair accessory but made of real hair, the bow is large and clearly visible, the rest of the hair hangs down, maintain the same face angle and head pose as the original photo",
    "dutch-braid": "double Dutch braids: two Dutch braids (reverse French braids) on either side of a center part, each braid starts at the hairline and goes straight back, strands cross under creating raised 3D braids that sit on top of the hair, tight and neat, maintain the same face angle and head pose as the original photo",
    "french-braid": "A highly realistic photo of the SAME person from the input image. STRICT IDENTITY PRESERVATION: Keep the exact same face, identity, facial structure, skin tone, and expression. Do NOT change age, gender, or ethnicity. Keep original camera angle, lighting, and background. HAIRSTYLE (CRITICAL): Apply ONLY a French braid. The hairstyle must exactly replicate a real French braid: starts from the crown (top of the head), tightly woven along the scalp, symmetrical structure, clean and neat braiding pattern. The braid must follow natural hair direction and physics. No loose reinterpretation, no creative variation. Do NOT mix with other hairstyles. The hairstyle must exactly replicate the selected hairstyle, not just a similar or inspired version. STYLE: Photorealistic. Natural skin texture. No beauty filter, no makeup changes. HARD CONSTRAINT: The hairstyle must match the expected French braid structure with high fidelity. Any deviation (loose braid, messy braid, partial braid, or different braid type) is NOT allowed. NEGATIVE: different person, different face, extra hair accessories, unrealistic hair volume, stylized or cartoon look.",
    "fishtail-braid": "fishtail braid: single long braid with intricate herringbone pattern, two sections with small strands crossed alternately, braid falls over one shoulder, slightly loose and relaxed, maintain the same face angle and head pose as the original photo",
    "french-fishtail-braid": "A highly realistic photo of the SAME person from the input image. STRICT IDENTITY PRESERVATION: Keep the exact same face, identity, facial structure, skin tone, and expression. Do NOT change age, gender, or ethnicity. Keep original camera angle, lighting, and background. HAIR COLOR: Preserve the person's ORIGINAL hair color exactly — do NOT change it to blonde, brown, red, or any other color. HAIRSTYLE (CRITICAL): Apply ONLY a French fishtail braid. STRUCTURAL REQUIREMENTS: Starting from the crown of the head, hair is gathered and incorporated from the scalp in a French-braid style as the braid progresses downward. Once all hair is incorporated, the braid continues as a fishtail braid — two sections with thin alternating strands crossed from each side creating a herringbone/fishtail pattern. The finished braid falls over one shoulder, is thick and full, reaches past the chest, and is slightly loose. The top portion shows scalp-incorporated French-braid structure; the lower portion shows the fishtail herringbone weave. STYLE: Photorealistic. Natural lighting. No beautification. HARD CONSTRAINT: The braid must start from the crown incorporating scalp hair (French-style top) AND show the fishtail herringbone pattern in the body of the braid. NEGATIVE: simple side ponytail, loose hair, hair color changed, braid not starting from crown, no herringbone pattern visible.",
    "waterfall-braid": "A highly realistic photo of the SAME person from the input image. STRICT IDENTITY PRESERVATION: Keep the exact same face, identity, facial structure, skin tone, and expression. Do NOT change age, gender, or ethnicity. Keep original camera angle, lighting, and background. HAIR COLOR: Preserve the person's ORIGINAL hair color exactly — do NOT change it to blonde, brown, red, or any other color. HAIRSTYLE (CRITICAL): Apply ONLY a waterfall braid. STRUCTURAL REQUIREMENTS: A three-strand braid runs horizontally along one side of the head, starting above one ear and going toward the back of the head. As the braid progresses, the BOTTOM strand of each stitch is NOT woven back in — instead it is released and falls freely downward, creating cascading strands that hang through the braid like a waterfall. A new strand of hair is picked up from the top of the head to replace each dropped strand, so the braid continues horizontally. The result: a horizontal braid running along the side of the head with multiple strands of hair visibly cascading downward through it. The remaining hair below hangs loose and flowing. STYLE: Photorealistic. Natural lighting. HARD CONSTRAINT: The cascading dropped strands falling through the braid must be clearly visible — they are the signature feature. The braid runs horizontally, not vertically. NEGATIVE: regular French braid going straight back, full braid with no dropped strands, all hair braided, ponytail, updo, hair color changed.",
    "rope-braid": "rope braid: two sections of hair twisted in the same direction then wrapped around each other creating a rope-like pattern, falls over one shoulder, maintain the same face angle and head pose as the original photo",
    "halo-braid": "halo braid: a single braid wrapped all the way around the circumference of the head like a halo or crown, loose face-framing wisps, elegant and romantic, maintain the same face angle and head pose as the original photo",
    "crown-braid": "crown braid: braids wrapped around the top of the head forming a crown/wreath shape, elegant updo style, maintain the same face angle and head pose as the original photo",
    "braided-crown": "braided crown: two braids starting from each side, pinned across the top of the head to form a crown shape, elegant and romantic, maintain the same face angle and head pose as the original photo",
    "bubble-braid": "bubble braid: a single braid or ponytail with multiple sections tied off with elastics creating large bubble/sphere shapes along the length, the bubbles are puffed out between each elastic, maintain the same face angle and head pose as the original photo",
    "ballerina-braids": "ballerina braids: two neat braids pinned up and crossed at the back of the head, elegant and polished, maintain the same face angle and head pose as the original photo",
    "milkmaid-braids": "milkmaid braids: two braids (one from each side) wrapped across the top of the head and pinned in place, creating a braided crown effect with two distinct braids, romantic and feminine, maintain the same face angle and head pose as the original photo",
    "bohemian-braids": "A highly realistic photo of the SAME person from the input image. STRICT IDENTITY PRESERVATION: Keep the exact same face, identity, facial structure, skin tone, and expression. Do NOT change age, gender, or ethnicity. Keep original camera angle, lighting, and background. HAIR COLOR: Preserve the person's ORIGINAL hair color exactly — do NOT change it to blonde, brown, red, or any other color. HAIRSTYLE (CRITICAL): Apply ONLY a Bohemian Braids hairstyle. STRUCTURAL REQUIREMENTS: Two or three loosely woven three-strand braids, starting from the crown or sides and falling down past the shoulders. The braids are intentionally relaxed and imperfect — NOT tight, NOT neat. Small wisps and flyaway strands escape from the braids throughout. The braids are slightly undone with pieces pulled out for a lived-in, effortless look. Some sections between or around the braids may be left slightly loose or wavy. The overall silhouette is full and romantic. STYLE: Photorealistic. Natural lighting. HARD CONSTRAINT: The braids must be clearly visible as braids (three-strand woven structure), but loose and messy — not tight or polished. Wisps and flyaways must be visible. NEGATIVE: tight neat braids, cornrows, box braids, single braid, no visible braid structure, all hair loose with no braids, hair color changed, formal or polished updo.",
    "double-dutch-braids": "double Dutch braids: two raised 3D Dutch braids (reverse French braids) going straight back from the hairline on either side of a center part, tight and neat, braids end in two ponytails at the back, sporty and clean, maintain the same face angle and head pose as the original photo",
    "box-braids": "box braids: individual protective braids divided into square sections, long length, hanging down naturally, maintain the same face angle and head pose as the original photo",
    "crochet-braids": "crochet braids: hair extensions looped through cornrows creating full voluminous braids, long and full, maintain the same face angle and head pose as the original photo",
    "cornrows": "cornrows: tight braids braided very close to the scalp in neat straight parallel rows going back, rest of hair in a ponytail at the back, maintain the same face angle and head pose as the original photo",
    "bantu-knots": "Bantu knots: small coiled knots of hair twisted and pinned tightly against the scalp in sections all over the head, maintain the same face angle and head pose as the original photo",
    "dreadlocks": "dreadlocks: matted rope-like strands of hair, long and thick, hanging down naturally",
    "messy-chignon": "messy chignon: low loose bun placed at the nape of the neck, intentionally undone with wispy pieces framing the face, romantic and effortless, soft and feminine updo, maintain the same face angle and head pose as the original photo",
    "french-twist-updo": "French twist updo: hair gathered and twisted vertically at the back of the head, tucked into itself and pinned, smooth sleek sides, elegant and sophisticated classic updo, maintain the same face angle and head pose as the original photo",
    "french-roll": "French roll: hair rolled vertically and pinned at the back of the head, smooth and polished, sophisticated elegant updo, similar to French twist but more rolled, maintain the same face angle and head pose as the original photo",
    "messy-updo": "messy updo: hair loosely gathered and pinned up in a casual undone style, intentional flyaways and loose pieces, relaxed and effortless, maintain the same face angle and head pose as the original photo",
    "knotted-updo": "knotted updo: hair twisted into elegant knots and pinned up at the back of the head, polished and sophisticated, maintain the same face angle and head pose as the original photo",
    "twisted-bun": "twisted bun: hair twisted and coiled into a neat bun at the back of the head, smooth and polished, elegant updo, maintain the same face angle and head pose as the original photo",
    "twisted-half-updo": "twisted half-updo: top sections of hair twisted back and pinned at the back of the head, remaining hair left flowing down, romantic and feminine, maintain the same face angle and head pose as the original photo",
    "twist-pin-updo": "twist and pin updo: multiple sections of hair twisted and pinned up creating an elegant textured updo, sophisticated and polished, maintain the same face angle and head pose as the original photo",
    "flat-twist": "flat twists natural hairstyle: short natural afro hair styled into neat flat two-strand twists that are pressed completely flat against the scalp, the twists do NOT hang or dangle — they stay glued to the scalp surface, multiple rows of flat twists going from front to back covering the entire head, each twist is only 1-2 inches long and lies flat, the overall look is a neat close-cropped geometric pattern on the scalp, no dangling extensions, no box braids hanging down, just short flat scalp-hugging twists, maintain the same face angle and head pose as the original photo",
    "crown-twist": "crown twist updo on natural hair: a single thick rope braid or twist wrapped all the way around the perimeter of the head forming a crown/halo shape, the twist sits close to the head following the hairline, creating a neat circular crown, natural hair texture with tight coils, the defining feature is the braided/twisted crown encircling the entire head like a wreath, maintain the same face angle and head pose as the original photo",
    "beehive": "beehive updo: all hair swept upward and piled high on top of the head forming a tall smooth oval dome shape, the sides are smooth and sleek, side-swept bangs framing the face, the hair at the top is teased and shaped into a tall rounded beehive silhouette, 1960s vintage glamour style, the defining feature is the tall smooth dome of hair on top of the head, maintain the same face angle and head pose as the original photo",
    "bouffant": "bouffant updo: hair swept back and up into a large smooth rounded dome shape at the crown and back of the head, side-swept bangs framing the face, the back is very full and voluminous creating a rounded silhouette, 1960s vintage glamour, the defining feature is the large smooth rounded volume at the crown and back (rounder and lower than beehive), maintain the same face angle and head pose as the original photo",
    "victory-rolls": "victory rolls: 1940s pin-up hairstyle with two large cylindrical barrel rolls stacked on top of the crown of the head, the rolls are very tall and prominent sitting upright on the very top of the head like two large cylinders side by side, the rest of the hair is neatly pinned up at the back, very retro 1940s glamour style, the defining feature is the two large prominent rolls sitting tall on top of the head, maintain the same face angle and head pose as the original photo",
    "ombre": "ombré hair color treatment: keep the exact same hairstyle and length as the original photo, only change the hair color to create an ombré effect with dark brown roots that gradually transition to warm golden caramel blonde ends, the color transition happens naturally in the lower 40-50% of the hair, the roots remain dark and the tips become light golden blonde, natural sun-kissed effect, do not change the hairstyle shape or length",
    "messy-fishtail-braid": "messy fishtail braid: a thick loose fishtail braid falling over one shoulder reaching mid-chest, the braid has many pieces pulled out creating a very relaxed and undone look, the top of the hair is slightly wavy and textured before the braid starts at the nape, the fishtail pattern is visible but loose and imperfect, very natural bohemian style, maintain the same face angle and head pose as the original photo",
    "messy-bun-scarf": "messy bun with silk scarf: casual messy bun on top of the head with a colorful silk scarf tied around the bun, chic and stylish, maintain the same face angle and head pose as the original photo",
    "crew-cut": "crew cut: very short hair on top about 1-2 inches, tapered sides and back, classic military-inspired cut, maintain the same face angle and head pose as the original photo",
    "buzz-cut": "buzz cut: hair clipped uniformly very short all over the head with clippers, no styling, maintain the same face angle and head pose as the original photo",
    "ivy-league": "Ivy League haircut: longer crew cut with enough length on top to part and comb to the side, preppy classic style, maintain the same face angle and head pose as the original photo",
    "side-part": "side part haircut: hair neatly combed and parted to one side, short on the sides, longer on top, clean and polished, maintain the same face angle and head pose as the original photo",
    "caesar-cut": "Caesar cut: short hair with horizontal fringe bangs cut straight across the forehead, uniform short length all over, maintain the same face angle and head pose as the original photo",
    "french-crop": "French crop haircut: short faded sides with textured crop on top and short fringe across the forehead, modern and clean, maintain the same face angle and head pose as the original photo",
    "textured-crop": "textured crop haircut: short faded sides with messy textured top, choppy and modern, maintain the same face angle and head pose as the original photo",
    "flat-top": "flat top haircut: short low-profile flat top, hair on top trimmed very short only about 1 to 2 centimeters tall and cut perfectly level, close-cropped natural-looking flat top without exaggerated height, tight faded sides, maintain the same face angle and head pose as the original photo",
    "skin-fade": "skin fade haircut: sides and back faded down to bare skin, gradual fade from skin to longer hair on top, maintain the same face angle and head pose as the original photo",
    "high-fade": "high fade haircut: fade starts high on the sides near the temples, dramatic contrast between sides and top, maintain the same face angle and head pose as the original photo",
    "mid-fade": "mid fade haircut: fade begins at the mid-point of the sides, balanced and versatile, maintain the same face angle and head pose as the original photo",
    "low-fade": "low fade haircut: subtle fade starting just above the ears and neckline, clean and conservative, maintain the same face angle and head pose as the original photo",
    "taper-fade": "taper fade haircut: hair gradually tapers shorter toward the neck and ears, clean neckline, maintain the same face angle and head pose as the original photo",
    "drop-fade": "drop fade haircut: fade line drops down behind the ear following the natural curve of the head, maintain the same face angle and head pose as the original photo",
    "burst-fade": "burst fade haircut: fade radiates outward in a semicircle around the ear creating a burst effect, maintain the same face angle and head pose as the original photo",
    "quiff": "quiff hairstyle: hair on top brushed upward and forward into a voluminous peak at the front, short faded sides, prominent height at the front, maintain the same face angle and head pose as the original photo",
    "pompadour": "pompadour hairstyle: hair swept upward and back from the forehead into a large voluminous wave, short sides, maintain the same face angle and head pose as the original photo",
    "slick-back": "slick back hairstyle: hair combed straight back from the forehead with pomade, sleek and polished, maintain the same face angle and head pose as the original photo",
    "comb-over": "comb over hairstyle: hair combed to one side with a defined part, short faded sides, maintain the same face angle and head pose as the original photo",
    "undercut": "undercut hairstyle: shaved or very short sides and back with significantly longer hair on top, sharp contrast, maintain the same face angle and head pose as the original photo",
    "disconnected-undercut": "disconnected undercut: extremely shaved sides with no blending into the long top, dramatic hard line between sides and top, maintain the same face angle and head pose as the original photo",
    "faux-hawk": "faux hawk hairstyle: hair styled upward in the center to mimic a mohawk, sides shorter but not shaved, maintain the same face angle and head pose as the original photo",
    "mohawk": "mohawk hairstyle: strip of hair down the center of the head styled upright, sides completely shaved, maintain the same face angle and head pose as the original photo",
    "textured-waves": "textured waves hairstyle: medium length hair with defined wave pattern and texture, casual and stylish, maintain the same face angle and head pose as the original photo",
    "man-bun": "man bun: long hair pulled back and tied into a bun at the back or top of the head, maintain the same face angle and head pose as the original photo",
    "half-up-man-bun": "half-up man bun: top half of long hair tied into a small bun on top, bottom half left down, maintain the same face angle and head pose as the original photo",
    "long-straight": "long straight hair for men: shoulder length or longer, sleek and smooth, preserve the original hair color exactly",
    "long-wavy": "long wavy hair for men: shoulder length or longer with natural waves, preserve the original hair color exactly",
    "curtains": "curtains hairstyle: medium length hair parted in the middle and swept to both sides framing the face, 90s style, maintain the same face angle and head pose as the original photo",
    "flow": "flow hairstyle: medium to long hair that flows naturally past the ears and collar, effortless and relaxed, preserve the original hair color exactly",
    "curly-top": "curly top hairstyle: natural curls on top with faded sides, curls defined and voluminous, preserve the original hair color exactly",
    "afro": "afro hairstyle: large rounded natural hair growing outward from the head in all directions, full and voluminous, preserve the original hair color exactly",
    "twist-out-male": "twist-out hairstyle: defined coily curls from two-strand twists, natural textured hair, full and voluminous, preserve the original hair color exactly",
    "dreadlocks-male": "dreadlocks: rope-like matted strands of hair, medium to long length, hanging down naturally",
    "cornrows-male": "cornrows: tight braids braided flat against the scalp in neat straight parallel rows going back, maintain the same face angle and head pose as the original photo",
    "box-braids-male": "box braids: individual braids divided into square sections, medium length, hanging down naturally, maintain the same face angle and head pose as the original photo",
    "ducktail": "ducktail haircut (DA cut): hair combed back on both sides meeting at the center back like a duck's tail, 1950s style, maintain the same face angle and head pose as the original photo",
    "rockabilly": "rockabilly hairstyle: large pompadour with sides slicked back, 1950s greaser style, maintain the same face angle and head pose as the original photo",
    "liberty-spikes": "liberty spikes: very long stiff spikes standing straight up all over the head, punk rock style, maintain the same face angle and head pose as the original photo",
    "spiky": "spiky hairstyle: hair spiked upward with gel or wax in multiple points, maintain the same face angle and head pose as the original photo",
    "bald": "completely bald head, all hair shaved off down to bare scalp, clean shaved head with no hair at all",

    // --- MAP BY STYLE NAME (FALLBACK) ---
    "No Change": "keep the exact same hairstyle, only change the hair color",
    "Straight": "long straight hair: sleek and smooth, no waves or curls, hair falls naturally down past the shoulders, center part, preserve the original hair color exactly",
    "Straightened": "freshly flat-ironed straight hair: glossy and sleek, perfectly smooth from roots to ends, no waves or frizz, preserve the original hair color exactly",
    "Blunt Bangs": "shoulder-length straight hair with thick blunt-cut bangs: the bangs are cut in a perfectly straight horizontal line just above the eyebrows, covering the full width of the forehead, hair length ends at the collarbone/shoulder, smooth and sleek",
    "Side-Swept Bangs": "hairstyle with clearly visible side-swept bangs: thick fringe bangs swept diagonally across the forehead to one side, bangs cover the forehead and sweep past one eyebrow, medium-length straight hair falling to the shoulders, deep side part, the bangs are the defining feature — prominent and clearly visible swept across the forehead",
    "Bob": "classic chin-length bob haircut: hair is CUT SHORT ending precisely at the jawline, blunt straight ends all around, smooth rounded shape, the hair length stops at the jaw and does NOT go past the chin — this is a SHORT haircut, full rounded bob silhouette framing the face, hair above the shoulders",
    "Lob": "long bob (lob) haircut: hair is cut to collarbone length, ending right at the collarbone, slightly layered with natural movement, side part, blunt ends — hair does NOT go past the collarbone, this is a medium-length cut shorter than shoulder-length, the ends are clearly visible at collarbone level",
    "Angled Bob": "dramatic angled bob haircut: back of hair is cut extremely short at the nape (above the collar), front pieces are noticeably longer reaching the jaw/chin level, very strong visible diagonal angle — the back is clearly much shorter than the front, sleek straight hair, the dramatic length difference between short back and longer front jaw-length pieces is the key feature, hair is SHORT overall",
    "A-Line Bob": "A-line bob haircut: hair forms an A-shape — shorter at the back nape area and gradually longer toward the front reaching chin/jaw level, smooth straight hair, center or side part, front pieces reach the chin creating the A-line shape, overall hair length is SHORT — hair ends at chin level in front, NOT long hair, hair is above the shoulders",
    "Asymmetrical Bob": "asymmetrical bob haircut: dramatically uneven bob — LEFT side is cut very short above the ear or at ear level, RIGHT side is noticeably longer reaching the jaw or chin level, the two sides are clearly different lengths creating a bold asymmetrical look, sleek straight hair, short overall, the extreme length difference between the two sides is the defining feature",
    "Graduated Bob": "graduated bob haircut: SHORT haircut — hair at the back is stacked with graduated layers creating a rounded full shape, front pieces slightly longer reaching the chin/jaw level, smooth and polished, the back has volume from stacked layers, overall hair length is SHORT ending at chin level, classic rounded bob silhouette, hair is above the shoulders",
    "Inverted Bob": "inverted bob haircut: SHORT chin-length bob with a dramatic inverted shape — back of hair is stacked and very short (above the nape), front pieces are longer reaching the chin/jaw level, the back is rounded and full from stacked layers, smooth straight hair with a deep side part, overall a clean sleek short bob silhouette, hair does NOT go past the chin",
    "Pixie Cut": "Transform the hair into a classic short pixie cut like Audrey Hepburn or Halle Berry. The hair must be dramatically short: sides and back are cropped very close to the head (about 1-2cm), the top is slightly longer (2-4cm) with a textured wispy finish. Both ears must be fully visible and exposed. The nape of the neck is clean and short. There may be a very short wispy fringe on the forehead but it must NOT reach the eyebrows. This is a bold, dramatic short cut — the overall silhouette should show the shape of the head clearly. The hair should look nothing like the original length. The person's face, skin tone, expression, clothing and background remain completely unchanged. Maintain the same face angle and head pose as the original photo.",
    "Pageboy": "pageboy haircut: chin-length rounded bob with thick straight blunt-cut bangs across the forehead, the hair forms a smooth rounded bowl shape curving under at the ends, dark smooth straight hair, the bangs are cut straight across just above the eyebrows, hair length ends at the chin all around in a uniform rounded shape, classic mushroom/bowl silhouette",
    "Shag": "shag haircut: medium-length hair (collarbone to shoulder length) with heavy choppy layers throughout, curtain bangs parted in the middle falling on either side of the forehead, lots of texture and movement, feathered choppy ends, layered throughout with the shortest layers framing the face, 70s-inspired textured shag",
    "Layered Shag": "layered shag haircut: collarbone-length hair with extensive layering throughout, curtain bangs parted in the middle, multiple visible layers from face to ends, feathered choppy textured ends, high-movement layered shag with lots of volume and texture, face-framing shortest layers",
    "Choppy Layers": "choppy layers haircut: collarbone-length hair with dramatically uneven choppy layers, curtain bangs parted in the middle, the ends are cut in irregular choppy pieces creating a textured edgy look, multiple layers of different lengths throughout, high-texture choppy finish",
    "Razor Cut": "razor cut hairstyle: collarbone-length hair with soft wispy feathered ends created by razor blade technique, curtain bangs or side-swept bangs, the ends are very soft and wispy (not blunt), layers throughout with feathered texture, light and airy movement",
    "Layered": "long layered haircut: shoulder to mid-chest length hair with multiple visible layers throughout, face-framing layers around the front, layers add volume and movement, smooth straight-to-wavy texture, natural-looking layers cascading down, preserve the original hair color exactly",
    "Wavy": "natural wavy hair: long chest-length hair with beautiful loose S-shaped waves throughout, voluminous and full, beachy natural waves, no bangs, hair falls in soft flowing waves past the chest, preserve the original hair color exactly",
    "Soft Waves": "soft waves with curtain bangs: shoulder-length hair with soft loose S-shaped waves throughout, curtain bangs parted in the middle falling softly on either side of the forehead framing the face, the bangs are a key feature of this style, romantic beachy wave texture, the waves are gentle and flowing (not tight curls), hair ends at or just below the shoulders, preserve the original hair color exactly, maintain the same face angle and head pose as the original photo",
    "Glamorous Waves": "glamorous waves: long hair (past shoulders) with large voluminous barrel-curl waves, deep side part, very polished and elegant finish, high volume and shine, the waves are large and dramatic, preserve the original hair color exactly",
    "Hollywood Waves": "classic old Hollywood waves: long hair with structured deep S-shaped waves that sweep to one side, deep side part, waves are set close to the head and very defined, retro vintage glamour look from the 1940s-50s, smooth and polished finish, preserve the original hair color exactly",
    "Finger Waves": "1920s finger waves: short hair (chin to ear length) with very tight defined S-shaped waves pressed close to the scalp, the waves are sculpted flat against the head in a precise pattern, vintage 1920s flapper style, very polished and structured, preserve the original hair color exactly",
    "Tousled": "tousled hair: shoulder-length hair with a deliberately messy, undone texture — disheveled waves that look casually effortless, not polished or styled, lived-in look with natural movement and slight frizz, casual beachy feel, preserve the original hair color exactly",
    "Feathered": "feathered hair: shoulder-length hair with long layers swept back from the face on both sides creating distinctive 'wings', 70s Farrah Fawcett style, the sides are blown out and feathered away from the face, voluminous and full, center part, feathered wispy ends throughout",
    "Curly": "naturally curly hair: shoulder-length hair with defined spiral curls throughout, full and bouncy volume, natural curl pattern, no heat styling, preserve the original hair color exactly",
    "Perm": "permed hair: shoulder-length hair with uniform medium curls all over from a chemical perm, curtain bangs parted in the middle, the curls are consistent and even throughout, voluminous and full, chemically curled texture, preserve the original hair color exactly",
    "Pin Curls": "pin curls hairstyle: short hair with tight small curls pinned very close to the head in a vintage updo style, the curls are set and pinned flat against the scalp, 1940s retro vintage look, very structured and polished, preserve the original hair color exactly",
    "Twist Out": "twist-out hairstyle: defined coily spiral curls from two-strand twists, natural hair texture, full and voluminous, preserve the original hair color exactly",
    "High Ponytail": "high ponytail: all hair pulled up and tied at the very top/crown of the head, sleek smooth sides, long hair falling down from the high point, maintain the same face angle and head pose as the original photo",
    "Low Ponytail": "low ponytail: hair gathered and tied at the nape of the neck, sleek smooth sides, natural center part, long hair falling down from the low tie point, maintain the same face angle and head pose as the original photo",
    "Bubble Ponytail": "bubble ponytail: high ponytail starting at the crown, divided into multiple sections tied with elastics creating large bubble/sphere shapes down the length, long hair with 3-5 bubble sections, maintain the same face angle and head pose as the original photo",
    "Messy Bun": "messy bun: hair loosely gathered and twisted into a casual undone bun placed high on top of the head, intentionally messy with loose strands and flyaways framing the face, relaxed effortless look, maintain the same face angle and head pose as the original photo",
    "Top Knot": "top knot: all hair pulled up to the very top of the head and twisted into a neat smooth knot/bun, sleek sides with no loose strands, clean and polished look, maintain the same face angle and head pose as the original photo",
    "Ballerina Bun": "classic ballerina bun: all hair pulled back tightly and completely smooth into a perfectly round neat bun sitting high on top of the head at the crown, the bun is a large smooth round ball shape (like a donut bun), hair is slicked back from the forehead and temples with zero flyaways, no loose strands, the neck and ears are fully exposed, clean polished ballet dancer look, maintain the same face angle and head pose as the original photo",
    "Half-Up Top Knot": "half-up top knot: top section of hair pulled up and twisted into a small casual bun on top of the head, lower half of hair left loose and flowing down (wavy or straight), casual and relaxed style, maintain the same face angle and head pose as the original photo",
    "Messy Bun with Headband": "messy bun with headband: hair in a casual messy bun on top of the head, with a wide decorative headband placed across the top of the head/forehead, loose strands framing the face, casual and stylish, maintain the same face angle and head pose as the original photo",
    "Half-Up Half-Down": "half-up half-down hairstyle: top half of hair pulled back and secured with a clip or tie, bottom half left loose and flowing down with natural waves, natural center part, romantic and casual, maintain the same face angle and head pose as the original photo",
    "Space Buns": "space buns: hair divided by a center part into two sections, each twisted into a small round bun placed symmetrically on top of the head on either side, playful and fun Y2K style, maintain the same face angle and head pose as the original photo",
    "Pigtails": "Transform the hair into classic double pigtails (twin ponytails). The hair is parted in the center. On each side of the head, ALL the hair is gathered and tied into a ponytail with a visible hair elastic. The left ponytail hangs down over the left shoulder, and the right ponytail hangs down over the right shoulder. Each ponytail is thick and full, starting at about ear level. The two ponytails are clearly separated and symmetrical. There should be NO loose hair hanging down — everything is pulled into the two ponytails. The overall look is youthful and playful with two distinct, bouncy ponytails clearly visible from the front. Do NOT create braids — these are simple tied ponytails. The person's face, skin tone, expression, clothing and background remain completely unchanged. Maintain the same face angle and head pose as the original photo.",
    "Hair Bow": "hair bow bun hairstyle: the hair on top of the head is styled into a large decorative bow shape made entirely from the person's own hair — two large rounded loops of hair form the two sides of the bow, with a small wrapped section in the center, the bow sits prominently on top of the head like a hair accessory but made of real hair, the bow is large and clearly visible, the rest of the hair hangs down, maintain the same face angle and head pose as the original photo",
    "Dutch Braid": "double Dutch braids: two Dutch braids (reverse French braids) on either side of a center part, each braid starts at the hairline and goes straight back, strands cross under creating raised 3D braids that sit on top of the hair, tight and neat, maintain the same face angle and head pose as the original photo",
    "French Braid": "A highly realistic photo of the SAME person from the input image. STRICT IDENTITY PRESERVATION: Keep the exact same face, identity, facial structure, skin tone, and expression. Do NOT change age, gender, or ethnicity. Keep original camera angle, lighting, and background. HAIRSTYLE (CRITICAL): Apply ONLY a French braid. The hairstyle must exactly replicate a real French braid: starts from the crown (top of the head), tightly woven along the scalp, symmetrical structure, clean and neat braiding pattern. The braid must follow natural hair direction and physics. No loose reinterpretation, no creative variation. Do NOT mix with other hairstyles. The hairstyle must exactly replicate the selected hairstyle, not just a similar or inspired version. STYLE: Photorealistic. Natural skin texture. No beauty filter, no makeup changes. HARD CONSTRAINT: The hairstyle must match the expected French braid structure with high fidelity. Any deviation (loose braid, messy braid, partial braid, or different braid type) is NOT allowed. NEGATIVE: different person, different face, extra hair accessories, unrealistic hair volume, stylized or cartoon look.",
    "Fishtail Braid": "fishtail braid: single long braid with intricate herringbone pattern, two sections with small strands crossed alternately, braid falls over one shoulder, slightly loose and relaxed, maintain the same face angle and head pose as the original photo",
    "French Fishtail Braid": "A highly realistic photo of the SAME person from the input image. STRICT IDENTITY PRESERVATION: Keep the exact same face, identity, facial structure, skin tone, and expression. Do NOT change age, gender, or ethnicity. Keep original camera angle, lighting, and background. HAIR COLOR: Preserve the person's ORIGINAL hair color exactly — do NOT change it to blonde, brown, red, or any other color. HAIRSTYLE (CRITICAL): Apply ONLY a French fishtail braid. STRUCTURAL REQUIREMENTS: Starting from the crown of the head, hair is gathered and incorporated from the scalp in a French-braid style as the braid progresses downward. Once all hair is incorporated, the braid continues as a fishtail braid — two sections with thin alternating strands crossed from each side creating a herringbone/fishtail pattern. The finished braid falls over one shoulder, is thick and full, reaches past the chest, and is slightly loose. The top portion shows scalp-incorporated French-braid structure; the lower portion shows the fishtail herringbone weave. STYLE: Photorealistic. Natural lighting. No beautification. HARD CONSTRAINT: The braid must start from the crown incorporating scalp hair (French-style top) AND show the fishtail herringbone pattern in the body of the braid. NEGATIVE: simple side ponytail, loose hair, hair color changed, braid not starting from crown, no herringbone pattern visible.",
    "Waterfall Braid": "A highly realistic photo of the SAME person from the input image. STRICT IDENTITY PRESERVATION: Keep the exact same face, identity, facial structure, skin tone, and expression. Do NOT change age, gender, or ethnicity. Keep original camera angle, lighting, and background. HAIR COLOR: Preserve the person's ORIGINAL hair color exactly — do NOT change it to blonde, brown, red, or any other color. HAIRSTYLE (CRITICAL): Apply ONLY a waterfall braid. STRUCTURAL REQUIREMENTS: A three-strand braid runs horizontally along one side of the head, starting above one ear and going toward the back of the head. As the braid progresses, the BOTTOM strand of each stitch is NOT woven back in — instead it is released and falls freely downward, creating cascading strands that hang through the braid like a waterfall. A new strand of hair is picked up from the top of the head to replace each dropped strand, so the braid continues horizontally. The result: a horizontal braid running along the side of the head with multiple strands of hair visibly cascading downward through it. The remaining hair below hangs loose and flowing. STYLE: Photorealistic. Natural lighting. HARD CONSTRAINT: The cascading dropped strands falling through the braid must be clearly visible — they are the signature feature. The braid runs horizontally, not vertically. NEGATIVE: regular French braid going straight back, full braid with no dropped strands, all hair braided, ponytail, updo, hair color changed.",
    "Rope Braid": "rope braid: two sections of hair twisted in the same direction then wrapped around each other creating a rope-like pattern, falls over one shoulder, maintain the same face angle and head pose as the original photo",
    "Halo Braid": "halo braid: a single braid wrapped all the way around the circumference of the head like a halo or crown, loose face-framing wisps, elegant and romantic, maintain the same face angle and head pose as the original photo",
    "Crown Braid": "crown braid: braids wrapped around the top of the head forming a crown/wreath shape, elegant updo style, maintain the same face angle and head pose as the original photo",
    "Braided Crown": "braided crown: two braids starting from each side, pinned across the top of the head to form a crown shape, elegant and romantic, maintain the same face angle and head pose as the original photo",
    "Bubble Braid": "bubble braid: a single braid or ponytail with multiple sections tied off with elastics creating large bubble/sphere shapes along the length, the bubbles are puffed out between each elastic, maintain the same face angle and head pose as the original photo",
    "Ballerina Braids": "ballerina braids: two neat braids pinned up and crossed at the back of the head, elegant and polished, maintain the same face angle and head pose as the original photo",
    "Milkmaid Braids": "milkmaid braids: two braids (one from each side) wrapped across the top of the head and pinned in place, creating a braided crown effect with two distinct braids, romantic and feminine, maintain the same face angle and head pose as the original photo",
    "Bohemian Braids": "A highly realistic photo of the SAME person from the input image. STRICT IDENTITY PRESERVATION: Keep the exact same face, identity, facial structure, skin tone, and expression. Do NOT change age, gender, or ethnicity. Keep original camera angle, lighting, and background. HAIR COLOR: Preserve the person's ORIGINAL hair color exactly — do NOT change it to blonde, brown, red, or any other color. HAIRSTYLE (CRITICAL): Apply ONLY a Bohemian Braids hairstyle. STRUCTURAL REQUIREMENTS: Two or three loosely woven three-strand braids, starting from the crown or sides and falling down past the shoulders. The braids are intentionally relaxed and imperfect — NOT tight, NOT neat. Small wisps and flyaway strands escape from the braids throughout. The braids are slightly undone with pieces pulled out for a lived-in, effortless look. Some sections between or around the braids may be left slightly loose or wavy. The overall silhouette is full and romantic. STYLE: Photorealistic. Natural lighting. HARD CONSTRAINT: The braids must be clearly visible as braids (three-strand woven structure), but loose and messy — not tight or polished. Wisps and flyaways must be visible. NEGATIVE: tight neat braids, cornrows, box braids, single braid, no visible braid structure, all hair loose with no braids, hair color changed, formal or polished updo.",
    "Double Dutch Braids": "double Dutch braids: two raised 3D Dutch braids (reverse French braids) going straight back from the hairline on either side of a center part, tight and neat, braids end in two ponytails at the back, sporty and clean, maintain the same face angle and head pose as the original photo",
    "Box Braids": "box braids: individual protective braids divided into square sections, long length, hanging down naturally, maintain the same face angle and head pose as the original photo",
    "Crochet Braids": "crochet braids: hair extensions looped through cornrows creating full voluminous braids, long and full, maintain the same face angle and head pose as the original photo",
    "Cornrows": "cornrows: tight braids braided very close to the scalp in neat straight parallel rows going back, rest of hair in a ponytail at the back, maintain the same face angle and head pose as the original photo",
    "Bantu Knots": "Bantu knots: small coiled knots of hair twisted and pinned tightly against the scalp in sections all over the head, maintain the same face angle and head pose as the original photo",
    "Dreadlocks": "dreadlocks: matted rope-like strands of hair, long and thick, hanging down naturally",
    "Messy Chignon": "messy chignon: low loose bun placed at the nape of the neck, intentionally undone with wispy pieces framing the face, romantic and effortless, soft and feminine updo, maintain the same face angle and head pose as the original photo",
    "French Twist Updo": "French twist updo: hair gathered and twisted vertically at the back of the head, tucked into itself and pinned, smooth sleek sides, elegant and sophisticated classic updo, maintain the same face angle and head pose as the original photo",
    "French Roll": "French roll: hair rolled vertically and pinned at the back of the head, smooth and polished, sophisticated elegant updo, similar to French twist but more rolled, maintain the same face angle and head pose as the original photo",
    "Messy Updo": "messy updo: hair loosely gathered and pinned up in a casual undone style, intentional flyaways and loose pieces, relaxed and effortless, maintain the same face angle and head pose as the original photo",
    "Knotted Updo": "knotted updo: hair twisted into elegant knots and pinned up at the back of the head, polished and sophisticated, maintain the same face angle and head pose as the original photo",
    "Twisted Bun": "twisted bun: hair twisted and coiled into a neat bun at the back of the head, smooth and polished, elegant updo, maintain the same face angle and head pose as the original photo",
    "Twisted Half-Updo": "twisted half-updo: top sections of hair twisted back and pinned at the back of the head, remaining hair left flowing down, romantic and feminine, maintain the same face angle and head pose as the original photo",
    "Twist and Pin Updo": "twist and pin updo: multiple sections of hair twisted and pinned up creating an elegant textured updo, sophisticated and polished, maintain the same face angle and head pose as the original photo",
    "Flat Twist": "flat twists natural hairstyle: short natural afro hair styled into neat flat two-strand twists that are pressed completely flat against the scalp, the twists do NOT hang or dangle — they stay glued to the scalp surface, multiple rows of flat twists going from front to back covering the entire head, each twist is only 1-2 inches long and lies flat, the overall look is a neat close-cropped geometric pattern on the scalp, no dangling extensions, no box braids hanging down, just short flat scalp-hugging twists, maintain the same face angle and head pose as the original photo",
    "Crown Twist": "crown twist updo on natural hair: a single thick rope braid or twist wrapped all the way around the perimeter of the head forming a crown/halo shape, the twist sits close to the head following the hairline, creating a neat circular crown, natural hair texture with tight coils, the defining feature is the braided/twisted crown encircling the entire head like a wreath, maintain the same face angle and head pose as the original photo",
    "Beehive": "beehive updo: all hair swept upward and piled high on top of the head forming a tall smooth oval dome shape, the sides are smooth and sleek, side-swept bangs framing the face, the hair at the top is teased and shaped into a tall rounded beehive silhouette, 1960s vintage glamour style, the defining feature is the tall smooth dome of hair on top of the head, maintain the same face angle and head pose as the original photo",
    "Bouffant": "bouffant updo: hair swept back and up into a large smooth rounded dome shape at the crown and back of the head, side-swept bangs framing the face, the back is very full and voluminous creating a rounded silhouette, 1960s vintage glamour, the defining feature is the large smooth rounded volume at the crown and back (rounder and lower than beehive), maintain the same face angle and head pose as the original photo",
    "Victory Rolls": "victory rolls: 1940s pin-up hairstyle with two large cylindrical barrel rolls stacked on top of the crown of the head, the rolls are very tall and prominent sitting upright on the very top of the head like two large cylinders side by side, the rest of the hair is neatly pinned up at the back, very retro 1940s glamour style, the defining feature is the two large prominent rolls sitting tall on top of the head, maintain the same face angle and head pose as the original photo",
    "Ombré": "ombré hair color treatment: keep the exact same hairstyle and length as the original photo, only change the hair color to create an ombré effect with dark brown roots that gradually transition to warm golden caramel blonde ends, the color transition happens naturally in the lower 40-50% of the hair, the roots remain dark and the tips become light golden blonde, natural sun-kissed effect, do not change the hairstyle shape or length",
    "Messy Fishtail Braid": "messy fishtail braid: a thick loose fishtail braid falling over one shoulder reaching mid-chest, the braid has many pieces pulled out creating a very relaxed and undone look, the top of the hair is slightly wavy and textured before the braid starts at the nape, the fishtail pattern is visible but loose and imperfect, very natural bohemian style, maintain the same face angle and head pose as the original photo",
    "Messy Bun with Scarf": "messy bun with silk scarf: casual messy bun on top of the head with a colorful silk scarf tied around the bun, chic and stylish, maintain the same face angle and head pose as the original photo",
    "Crew Cut": "crew cut: very short hair on top about 1-2 inches, tapered sides and back, classic military-inspired cut, maintain the same face angle and head pose as the original photo",
    "Buzz Cut": "buzz cut: hair clipped uniformly very short all over the head with clippers, no styling, maintain the same face angle and head pose as the original photo",
    "Ivy League": "Ivy League haircut: longer crew cut with enough length on top to part and comb to the side, preppy classic style, maintain the same face angle and head pose as the original photo",
    "Side Part": "side part haircut: hair neatly combed and parted to one side, short on the sides, longer on top, clean and polished, maintain the same face angle and head pose as the original photo",
    "Caesar Cut": "Caesar cut: short hair with horizontal fringe bangs cut straight across the forehead, uniform short length all over, maintain the same face angle and head pose as the original photo",
    "French Crop": "French crop haircut: short faded sides with textured crop on top and short fringe across the forehead, modern and clean, maintain the same face angle and head pose as the original photo",
    "Textured Crop": "textured crop haircut: short faded sides with messy textured top, choppy and modern, maintain the same face angle and head pose as the original photo",
    "Flat Top": "flat top haircut: short low-profile flat top, hair on top trimmed very short only about 1 to 2 centimeters tall and cut perfectly level, close-cropped natural-looking flat top without exaggerated height, tight faded sides, maintain the same face angle and head pose as the original photo",
    "Skin Fade": "skin fade haircut: sides and back faded down to bare skin, gradual fade from skin to longer hair on top, maintain the same face angle and head pose as the original photo",
    "High Fade": "high fade haircut: fade starts high on the sides near the temples, dramatic contrast between sides and top, maintain the same face angle and head pose as the original photo",
    "Mid Fade": "mid fade haircut: fade begins at the mid-point of the sides, balanced and versatile, maintain the same face angle and head pose as the original photo",
    "Low Fade": "low fade haircut: subtle fade starting just above the ears and neckline, clean and conservative, maintain the same face angle and head pose as the original photo",
    "Taper Fade": "taper fade haircut: hair gradually tapers shorter toward the neck and ears, clean neckline, maintain the same face angle and head pose as the original photo",
    "Drop Fade": "drop fade haircut: fade line drops down behind the ear following the natural curve of the head, maintain the same face angle and head pose as the original photo",
    "Burst Fade": "burst fade haircut: fade radiates outward in a semicircle around the ear creating a burst effect, maintain the same face angle and head pose as the original photo",
    "Quiff": "quiff hairstyle: hair on top brushed upward and forward into a voluminous peak at the front, short faded sides, prominent height at the front, maintain the same face angle and head pose as the original photo",
    "Pompadour": "pompadour hairstyle: hair swept upward and back from the forehead into a large voluminous wave, short sides, maintain the same face angle and head pose as the original photo",
    "Slick Back": "slick back hairstyle: hair combed straight back from the forehead with pomade, sleek and polished, maintain the same face angle and head pose as the original photo",
    "Comb Over": "comb over hairstyle: hair combed to one side with a defined part, short faded sides, maintain the same face angle and head pose as the original photo",
    "Undercut": "undercut hairstyle: shaved or very short sides and back with significantly longer hair on top, sharp contrast, maintain the same face angle and head pose as the original photo",
    "Disconnected Undercut": "disconnected undercut: extremely shaved sides with no blending into the long top, dramatic hard line between sides and top, maintain the same face angle and head pose as the original photo",
    "Faux Hawk": "faux hawk hairstyle: hair styled upward in the center to mimic a mohawk, sides shorter but not shaved, maintain the same face angle and head pose as the original photo",
    "Mohawk": "mohawk hairstyle: strip of hair down the center of the head styled upright, sides completely shaved, maintain the same face angle and head pose as the original photo",
    "Textured Waves": "textured waves hairstyle: medium length hair with defined wave pattern and texture, casual and stylish, maintain the same face angle and head pose as the original photo",
    "Man Bun": "man bun: long hair pulled back and tied into a bun at the back or top of the head, maintain the same face angle and head pose as the original photo",
    "Half-Up Man Bun": "half-up man bun: top half of long hair tied into a small bun on top, bottom half left down, maintain the same face angle and head pose as the original photo",
    "Long Straight": "long straight hair for men: shoulder length or longer, sleek and smooth, preserve the original hair color exactly",
    "Long Wavy": "long wavy hair for men: shoulder length or longer with natural waves, preserve the original hair color exactly",
    "Curtains": "curtains hairstyle: medium length hair parted in the middle and swept to both sides framing the face, 90s style, maintain the same face angle and head pose as the original photo",
    "Flow": "flow hairstyle: medium to long hair that flows naturally past the ears and collar, effortless and relaxed, preserve the original hair color exactly",
    "Curly Top": "curly top hairstyle: natural curls on top with faded sides, curls defined and voluminous, preserve the original hair color exactly",
    "Afro": "afro hairstyle: large rounded natural hair growing outward from the head in all directions, full and voluminous, preserve the original hair color exactly",
    "Ducktail": "ducktail haircut (DA cut): hair combed back on both sides meeting at the center back like a duck's tail, 1950s style, maintain the same face angle and head pose as the original photo",
    "Rockabilly": "rockabilly hairstyle: large pompadour with sides slicked back, 1950s greaser style, maintain the same face angle and head pose as the original photo",
    "Liberty Spikes": "liberty spikes: very long stiff spikes standing straight up all over the head, punk rock style, maintain the same face angle and head pose as the original photo",
    "Spiky": "spiky hairstyle: hair spiked upward with gel or wax in multiple points, maintain the same face angle and head pose as the original photo",
    "Bald": "completely bald head, all hair shaved off down to bare scalp, clean shaved head with no hair at all",
};

const COLOR_MAP = {
    "AI Recommended": "Random",
    "No Change": "No change",
    "No change": "No change",
    "no_change": "No change",
    "no-change": "No change",
    "Jet Black": "Jet Black",
    "Blonde": "Blonde",
    "Blue Highlights": "Blue",
    "Pastel Pink": "Pink",
    "Black": "Black",
    "Blue-Black": "Blue-Black",
    "Dark Brown": "Dark Brown",
    "Medium Brown": "Medium Brown",
    "Light Brown": "Light Brown",
    "Chestnut": "Chestnut",
    "Mahogany": "Mahogany",
    "Ash Brown": "Ash Brown",
    "Brunette": "Brunette",
    "Caramel": "Caramel",
    "Golden Blonde": "Golden Blonde",
    "Honey Blonde": "Honey Blonde",
    "Strawberry Blonde": "Strawberry Blonde",
    "Platinum Blonde": "Platinum Blonde",
    "Ash Blonde": "Ash Blonde",
    "Auburn": "Auburn",
    "Copper": "Copper",
    "Burgundy": "Burgundy",
    "Silver": "Silver",
    "White": "White",
    "Titanium": "Titanium",
    "Rose Gold": "Rose Gold",
    "Red": "Red",
    "Blue": "Blue",
    "Purple": "Purple",
    "Pink": "Pink",
    "Green": "Green",
    "balayage-blonde": "a beautiful balayage blonde paint job with darker roots transitioning to soft golden blonde highlights",
    "Balayage Blonde": "a beautiful balayage blonde paint job with darker roots transitioning to soft golden blonde highlights",
    "rose-gold-highlights": "delicate metallic rose-gold highlights woven through the hair",
    "sunset-copper": "sunset copper, vibrant fiery orange-red with warm gold undertones",
    "Sunset Copper": "sunset copper, vibrant fiery orange-red with warm gold undertones",
    "Pastel Lilac": "pastel lilac, a soft and delicate light lavender-purple shade",
    "pastel-lilac": "pastel lilac, a soft and delicate light lavender-purple shade",
    "Split-dye Pink & Black": "split-dye hair color, with one half of the head colored pastel pink and the other half colored pitch black",
    "split-dye-pink-black": "split-dye hair color, with one half of the head colored pastel pink and the other half colored pitch black"
};

function parseMakeupDescription(makeupStyle) {
    if (!makeupStyle) return "no-makeup makeup look, very natural skin texture";
    const styleLower = makeupStyle.toLowerCase();
    
    // 1. Detect Preset/Style
    let presetDesc = "";
    if (styleLower.includes('bronze')) {
        presetDesc = "bronze goddess makeup look, warm sun-kissed skin tone, golden highlights, soft bronzed contoured cheeks";
    } else if (styleLower.includes('clean girl') || styleLower.includes('clean-girl')) {
        presetDesc = "clean girl aesthetic makeup, minimalist look, fresh dewy glass skin, groomed natural eyebrows, clean face";
    } else if (styleLower.includes('y2k')) {
        presetDesc = "Y2K aesthetic makeup, frosty pastel eyeshadow hints, hyper-glossy wet-look lips, thin clean eyebrows, early 2000s beauty style";
    } else if (styleLower.includes('beige')) {
        presetDesc = "neutral monochrome beige makeup, soft earthy brown contours, soft sandy beige eyeshadow, matte nude lips";
    } else if (styleLower.includes('soft glam') || styleLower.includes('soft-glam')) {
        presetDesc = "soft glam makeup, blended warm brown and champagne eyeshadow, long eyelashes, neutral lips, radiant airbrushed skin finish";
    } else if (styleLower.includes('doll-like') || styleLower.includes('doll_like')) {
        presetDesc = "doll-like baby doll makeup, flushed pink cheeks, dramatic long dolly eyelashes, round pink glossy lips";
    } else if (styleLower.includes('elegant')) {
        presetDesc = "sophisticated elegant makeup, subtle thin classic black eyeliner, soft rosewood satin lips, polished skin texture, timeless clean beauty";
    } else if (styleLower.includes('girlish')) {
        presetDesc = "girlish K-beauty style makeup, soft baby-pink blush, wet-look glossy pink gradient lips, bright open eyes";
    } else if (styleLower.includes('grunge rock') || styleLower.includes('grunge-rock')) {
        presetDesc = "grunge rock makeup, dark smoky charcoal smudge eyeshadow, messy smudged dark eyeliner, deep matte plum lips, edgy bold look";
    } else if (styleLower.includes('matte')) {
        presetDesc = "matte makeup, high-coverage velvet matte foundation, no-shine face powder, matte nude lips, structured eyebrows";
    } else if (styleLower.includes('seductive')) {
        presetDesc = "seductive makeup, sharp winged black cat-eye eyeliner, dramatic deep contours, bold defined dark lips";
    } else if (styleLower.includes('glossy lips') || styleLower.includes('glossy_lips') || styleLower.includes('glossy-lips')) {
        presetDesc = "glossy lips focus makeup, minimalist face, extreme high-shine wet-look lip gloss, clean fresh skin";
    } else if (styleLower.includes('euphoria')) {
        presetDesc = "Euphoria style makeup, glittery rhinestones around eyes, colorful graphic eyeliner, glossy lip gloss, artistic bold aesthetic";
    } else if (styleLower.includes('bridal')) {
        presetDesc = "bridal makeup, soft champagne gold eyes, long fluttery eyelashes, nude-pink lipstick, soft contour, glowing skin, romantic classic aesthetic";
    } else if (styleLower.includes('glam')) {
        presetDesc = "glamorous makeup, dramatic smokey eyeshadow, bold defined winged black eyeliner, contoured cheekbones, full matte nude lips, glowing highlight";
    } else if (styleLower.includes('korean')) {
        presetDesc = "Korean style glass skin makeup, gradient cherry lips, subtle puppy eyeliner, soft coral blush, clean straight eyebrows, youthful aesthetic";
    } else if (styleLower.includes('soft girl') || styleLower.includes('soft_girl')) {
        presetDesc = "soft girl makeup look, pink tones, rosy cheeks, cute faux freckles, glossy pink lips, fluffy brows";
    } else if (styleLower.includes('douyin')) {
        presetDesc = "Douyin makeup style, doll-like manga lashes, glittering shimmery eyeshadow under eyes, blurred gradient lips, soft Asian beauty look";
    } else if (styleLower.includes('strawberry')) {
        presetDesc = "Strawberry makeup look, glowing natural skin, heavy pink blush across the nose and cheeks, faux freckles, juicy glossy lips";
    } else if (styleLower.includes('espresso')) {
        presetDesc = "Espresso makeup look, deep dark roasted brown smokey eyes, brown lip contour with nude center, rich monochromatic brown tones";
    } else if (styleLower.includes('vampy')) {
        presetDesc = "Vampy chic makeup, dark gothic pale skin, deep black or dark cherry matte lips, subtle contour, bold dark aesthetic";
    } else if (styleLower.includes('natural')) {
        presetDesc = "no-makeup makeup look, very natural skin texture, light mascara, sheer nude lip gloss, subtle dewy skin glow, clean natural eyebrows";
    }

    // 2. Detect Lipstick
    let lipstickDesc = "";
    if (styleLower.includes('glazed donut') || styleLower.includes('glazed-donut')) {
        lipstickDesc = "ultra-glossy high-shine glazed donut clear lip gloss, wet-look lips";
    } else if (styleLower.includes('velvet matte red') || styleLower.includes('velvet-red') || styleLower.includes('velvet matte red')) {
        lipstickDesc = "bold velvet matte crimson red lipstick, perfectly defined clean lip lines";
    } else if (styleLower.includes('satin rosewood') || styleLower.includes('satin-rosewood')) {
        lipstickDesc = "soft satin rosewood dusty-rose lipstick, natural cream finish";
    } else if (styleLower.includes('metallic berry') || styleLower.includes('metallic-berry')) {
        lipstickDesc = "shimmering metallic berry plum lipstick, rich deep tone";
    } else if (styleLower.includes('soft coral glow') || styleLower.includes('soft-coral')) {
        lipstickDesc = "sheer soft coral peach cream lipstick with a subtle glow";
    } else if (styleLower.includes('rose pink')) {
        lipstickDesc = "soft rose pink creamy lipstick, natural finish";
    } else {
        const match = makeupStyle.match(/Lipstick:\s*([^.]+)/i);
        if (match && match[1] && match[1].trim().toLowerCase() !== 'none') {
            lipstickDesc = `${match[1].trim()} lipstick`;
        }
    }

    // 3. Detect Eyeliner
    let eyelinerDesc = "";
    if (styleLower.includes('classic eyeliner') || styleLower.includes('classic')) {
        eyelinerDesc = "clean classic black gel eyeliner along the upper lash line";
    } else if (styleLower.includes('winged cat eye') || styleLower.includes('winged') || styleLower.includes('cat eye')) {
        eyelinerDesc = "sharp winged black cat-eye eyeliner, clean flick";
    } else if (styleLower.includes('smokey smudge') || styleLower.includes('smokey') || styleLower.includes('smudge')) {
        eyelinerDesc = "smudged smoky black kohl eyeliner, soft blended eyeliner look";
    } else {
        const match = makeupStyle.match(/Eyeliner:\s*([^.]+)/i);
        if (match && match[1] && match[1].trim().toLowerCase() !== 'none') {
            eyelinerDesc = `${match[1].trim()} eyeliner`;
        }
    }

    // 4. Detect Eyeshadow
    let eyeshadowDesc = "";
    if (styleLower.includes('smoky sunset') || styleLower.includes('smoky-sunset')) {
        eyeshadowDesc = "smoky sunset eyeshadow with warm gold, burnt orange, and terracotta shades beautifully blended";
    } else if (styleLower.includes('glitter euphoria') || styleLower.includes('glitter-euphoria')) {
        eyeshadowDesc = "Euphoria-inspired glittering iridescent rhinestones and sparkly silver eyeshadow around the eyes";
    } else if (styleLower.includes('nude silhouette') || styleLower.includes('nude-silhouette')) {
        eyeshadowDesc = "soft matte nude and taupe silhouette eyeshadow, subtle crease definition";
    } else if (styleLower.includes('emerald envy') || styleLower.includes('emerald-envy')) {
        eyeshadowDesc = "rich metallic emerald green envy eyeshadow with gold shimmer highlights";
    } else {
        const match = makeupStyle.match(/Eyeshadow:\s*([^.]+)/i);
        if (match && match[1] && match[1].trim().toLowerCase() !== 'none') {
            eyeshadowDesc = `${match[1].trim()} eyeshadow`;
        }
    }

    // 5. Detect Blush
    let blushDesc = "";
    if (styleLower.includes('glass skin glow') || styleLower.includes('glass skin')) {
        blushDesc = "reflective glass skin liquid highlighter and dewy glow on cheekbones";
    } else if (styleLower.includes('sun-kissed peach') || styleLower.includes('sunkissed-peach')) {
        blushDesc = "warm sun-kissed peach blush swept across cheeks and nose bridge";
    } else if (styleLower.includes('soft lavender tint') || styleLower.includes('soft-lavender') || styleLower.includes('soft lavender')) {
        blushDesc = "cool-toned soft lavender blush tint, bright fresh complexion";
    } else {
        const match = makeupStyle.match(/Blush:\s*([^.]+)/i);
        if (match && match[1] && match[1].trim().toLowerCase() !== 'none') {
            blushDesc = `${match[1].trim()} blush`;
        }
    }

    // 6. Detect EyeColor and Freckles
    let eyeColorDesc = "";
    const eyeMatch = makeupStyle.match(/EyeColor:\s*([^.,]+)/i);
    if (eyeMatch && eyeMatch[1] && eyeMatch[1].trim().toLowerCase() !== 'none') {
        eyeColorDesc = `${eyeMatch[1].trim()} colored contact lenses, intensely colored irises`;
    }
    
    let frecklesDesc = "";
    if (makeupStyle.match(/Freckles:\s*true/i) || styleLower.includes('with freckles')) {
        frecklesDesc = "cute natural looking faux freckles across the nose and cheeks";
    }

    // Combine them intelligently
    let details = [];
    if (presetDesc) details.push(presetDesc);
    if (lipstickDesc) details.push(`lips: ${lipstickDesc}`);
    if (eyelinerDesc) details.push(`eyeliner: ${eyelinerDesc}`);
    if (eyeshadowDesc) details.push(`eyeshadow: ${eyeshadowDesc}`);
    if (blushDesc) details.push(`cheeks: ${blushDesc}`);
    if (eyeColorDesc) details.push(`eyes: ${eyeColorDesc}`);
    if (frecklesDesc) details.push(frecklesDesc);
    
    if (details.length === 0) {
        return `custom makeup style: ${makeupStyle}`;
    }
    
    return details.join(', ');
}

function parseBeardDescription(beardStyle) {
    if (!beardStyle) return "light rugged stubble beard, neatly trimmed";
    const beardLower = beardStyle.toLowerCase();
    
    // 1. Detect Style
    let styleDesc = "";
    if (beardLower.includes('stubble') || beardLower.includes("5 o'clock") || beardLower.includes("5 o’clock")) {
        styleDesc = "a light stubble beard, rugged 5 o'clock stubble style, 3-day stubble growth, neatly trimmed along the jawline and upper lip";
    } else if (beardLower.includes('full beard') || beardLower.includes('full-beard') || beardLower.includes('full groomed')) {
        styleDesc = "a thick full groomed beard, well-maintained and shaped, covering the jaw, chin, and cheeks, with a matching mustache";
    } else if (beardLower.includes('viking')) {
        styleDesc = "a long thick rugged Viking-style beard, full and long, extending down below the chin, warrior style";
    } else if (beardLower.includes('goatee')) {
        styleDesc = "a neat classic goatee beard on the chin, with a disconnected mustache";
    } else if (beardLower.includes('mustache') && !beardLower.includes('imperial')) {
        styleDesc = "completely clean-shaven cheeks and chin, with a prominent neatly styled classic chevron mustache on the upper lip";
    } else if (beardLower.includes('clean shave') || beardLower.includes('clean_shave') || beardLower.includes('clean-shave')) {
        styleDesc = "completely clean-shaven face, smooth skin on cheeks, jaw, and chin, no stubble or facial hair whatsoever";
    } else if (beardLower.includes('imperial')) {
        styleDesc = "a styled groomed imperial handlebar mustache on the upper lip with elegant curled ends, cheeks and chin clean-shaven";
    } else if (beardLower.includes('anchor')) {
        styleDesc = "a pointed anchor-shaped beard along the chin and jawline, paired with a thin pencil mustache";
    } else if (beardLower.includes('van dyke') || beardLower.includes('vandyke')) {
        styleDesc = "a Van Dyke style facial hair consisting of a short pointed chin beard and a styled mustache, cheek areas clean-shaven";
    } else if (beardLower.includes('balbo')) {
        styleDesc = "a Balbo beard style featuring a floating mustache, chin beard, and soul patch with no sideburns";
    } else {
        const match = beardStyle.match(/^([^.,]+)/);
        if (match && match[1]) {
            styleDesc = match[1].trim();
        } else {
            styleDesc = "facial hair";
        }
    }

    // 2. Detect Color
    let colorDesc = "";
    if (beardLower.includes('salt & pepper') || beardLower.includes('salt-pepper') || beardLower.includes('salt and pepper')) {
        colorDesc = "salt and pepper color, realistic blend of grey, white, and black hair follicles";
    } else if (beardLower.includes('auburn') || beardLower.includes('classic auburn')) {
        colorDesc = "classic auburn red-brown hair color";
    } else if (beardLower.includes('grizzly brown') || beardLower.includes('grizzly-brown')) {
        colorDesc = "rich grizzly dark brown hair color";
    } else if (beardLower.includes('nordic blonde') || beardLower.includes('nordic-blonde')) {
        colorDesc = "Nordic light blonde hair color";
    } else if (beardLower.includes('jet black') || beardLower.includes('jet-black') || beardLower.includes('black')) {
        colorDesc = "deep jet black hair color";
    } else {
        const match = beardStyle.match(/Color:\s*([^.]+)/i) || beardStyle.match(/Color tint:\s*([^.]+)/i);
        if (match && match[1] && match[1].trim().toLowerCase() !== 'natural' && match[1].trim().toLowerCase() !== 'natural shade') {
            colorDesc = `${match[1].trim()} hair color`;
        }
    }

    let finalDesc = styleDesc;
    if (colorDesc && !beardLower.includes('clean shave') && !beardLower.includes('clean_shave') && !beardLower.includes('clean-shave')) {
        finalDesc += ` in a ${colorDesc}`;
    }

    // Parse density slider
    if (beardLower.includes('density:')) {
        const densityMatch = beardStyle.match(/density:\s*([^,]+)/i);
        if (densityMatch && !beardLower.includes('clean shave') && !beardLower.includes('clean_shave') && !beardLower.includes('clean-shave')) {
            finalDesc += `, beard density is ${densityMatch[1].trim()}`;
        }
    }

    return finalDesc;
}

function parseNailsDescription(nailStyle) {
    if (!nailStyle) return "classic neat manicure with a glossy finish";
    const nailLower = nailStyle.toLowerCase();

    // Helper to get descriptive text for a finger design
    function getSingleFingerDescription(presetName, colorName) {
        const presetLower = presetName.toLowerCase();
        const colorLower = colorName.toLowerCase();
        const colorVal = (colorLower === 'matching shade' || colorLower === 'default') ? '' : colorName;

        if (presetLower.includes('french tip') || presetLower.includes('french')) {
            if (presetLower.includes('chrome')) {
                return `French tip design with ${colorVal || 'metallic silver'} chrome tips`;
            }
            return `classic French tip manicure with a nude base and clean ${colorVal || 'white'} crescent tips`;
        }
        if (presetLower.includes('chrome')) {
            return `mirror chrome liquid metal finish with ${colorVal || 'silver'} metallic glaze`;
        }
        if (presetLower.includes('marble') || presetLower.includes('acrylic')) {
            return `${colorVal || 'pink-and-white'} marble design with swirling veins and gold flakes`;
        }
        if (presetLower.includes('gold foil') || presetLower.includes('luxury')) {
            return `gold leaf flakes and tiny gemstone accents over ${colorVal || 'nude'} base`;
        }
        if (presetLower.includes('minimal') || presetLower.includes('nude')) {
            return `minimalist sheer glossy ${colorVal || 'nude'} gel polish`;
        }
        if (presetLower.includes('blush') || presetLower.includes('pink')) {
            return `solid ${colorVal || 'soft candy pink'} gel polish`;
        }
        if (presetLower.includes('black') || presetLower.includes('goth')) {
            return `solid glossy ${colorVal || 'obsidian black'} lacquer`;
        }
        if (presetLower.includes('cat-eye') || presetLower.includes('cat eye')) {
            return `magnetic ${colorVal || 'velvet'} cat-eye polish with a dimensional light stripe`;
        }
        if (presetLower.includes('aurora')) {
            return `iridescent ${colorVal || 'pearl'} aurora glass finish with holographic reflections`;
        }
        if (presetLower.includes('aura')) {
            return `soft gradient aura glow circle design with a ${colorVal || 'pink'} center`;
        }
        if (presetLower.includes('tortoiseshell')) {
            return `translucent tortoiseshell print with amber and ${colorVal || 'brown'} spots`;
        }
        if (presetLower.includes('water drop') || presetLower.includes('3d water')) {
            return `clear 3D water droplets over a glossy ${colorVal || 'nude'} base`;
        }
        // Classic or default
        return `solid ${colorVal || 'glossy'} color nail polish`;
    }

    // Check if this is a multi-finger custom description
    if (nailLower.startsWith('custom multi-finger')) {
        const shapeMatch = nailStyle.match(/Shape:\s*([^.]+)/i);
        const textureMatch = nailStyle.match(/Texture:\s*([^.]+)/i);
        const shape = shapeMatch ? shapeMatch[1].trim() : '';
        const texture = textureMatch ? textureMatch[1].trim() : '';

        const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
        const fingerDescriptions = [];
        
        fingers.forEach(f => {
            // Match pattern like: "thumb finger has French Tip design in Candy Pink"
            const regex = new RegExp(`${f}\\s+finger\\s+has\\s+(.+?)\\s+design\\s+in\\s+(.+?)(?:,|$|\\.)`, 'i');
            const match = nailStyle.match(regex);
            if (match) {
                const presetName = match[1].trim();
                const colorName = match[2].trim();
                const desc = getSingleFingerDescription(presetName, colorName);
                fingerDescriptions.push(`the ${f} finger has a ${desc}`);
            }
        });

        let finalDesc = "a highly customized manicure where: " + fingerDescriptions.join(', ') + ".";
        
        if (shape) {
            let shapeDesc = "";
            const shapeLower = shape.toLowerCase();
            if (shapeLower.includes('almond')) shapeDesc = "elegant tapered almond-shaped nails";
            else if (shapeLower.includes('coffin')) shapeDesc = "long flat-tipped coffin-shaped square-ended acrylic nails";
            else if (shapeLower.includes('stiletto')) shapeDesc = "long sharp pointed stiletto-shaped nails";
            else if (shapeLower.includes('square') && !shapeLower.includes('squoval')) shapeDesc = "neat straight-edged flat square-shaped nails";
            else if (shapeLower.includes('squoval')) shapeDesc = "soft squoval-shaped nails (square with rounded corners)";
            else if (shapeLower.includes('round')) shapeDesc = "natural looking short round-shaped nails";
            else shapeDesc = `${shape} shaped nails`;
            
            finalDesc += ` All fingernails are shaped as ${shapeDesc}.`;
        }

        if (texture) {
            let textureDesc = "";
            const textureLower = texture.toLowerCase();
            if (textureLower.includes('liquid chrome') || textureLower.includes('liquid-chrome')) textureDesc = "ultra-reflective high-shine liquid metallic chrome finish";
            else if (textureLower.includes('glazed donut') || textureLower.includes('glazed-donut')) textureDesc = "pearly iridescent glazed donut shimmer top coat finish";
            else if (textureLower.includes('marble foil') || textureLower.includes('marble-foil')) textureDesc = "swirled multi-tonal marble texture with metallic foil accents";
            else if (textureLower.includes('glossy gel') || textureLower.includes('glossy-gel')) textureDesc = "plump high-gloss gel top coat shine finish";
            else if (textureLower.includes('velvet matte') || textureLower.includes('velvet-matte')) textureDesc = "velvety soft-touch matte finish with zero shine";
            else if (textureLower.includes('pearl') || textureLower.includes('pearl powder')) textureDesc = "luminous pearl powder shimmer finish";
            else textureDesc = `${texture} finish`;

            finalDesc += ` All nails have a ${textureDesc}.`;
        }

        return finalDesc;
    }

    // Extract explicit color from "in [Color Name]" pattern
    let explicitColor = "";
    const colorMatch = nailStyle.match(/\bin\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|$)/);
    if (colorMatch && colorMatch[1]) {
        const colorName = colorMatch[1].trim();
        // Don't treat common words as colors
        const skipWords = ['the', 'a', 'an', 'classic', 'default', 'matching'];
        if (!skipWords.includes(colorName.toLowerCase()) && colorName.toLowerCase() !== 'default color') {
            explicitColor = colorName;
        }
    }

    // 1. Detect Design with color injection
    let designDesc = "";
    const colorVal = (explicitColor && explicitColor.toLowerCase() !== 'default') ? explicitColor : "";

    if (nailLower.includes('french')) {
        if (nailLower.includes('chrome')) {
            designDesc = `French tip nail design with ${colorVal || 'metallic silver'} chrome tip finish`;
        } else {
            designDesc = `classic French manicure nails with pink bases and clean ${colorVal || 'white'} tips`;
        }
    } else if (nailLower.includes('chrome') && !nailLower.includes('chrome french')) {
        designDesc = `mirror chrome nail art design, futuristic ${colorVal || 'silver'} metallic glaze`;
    } else if (nailLower.includes('acrylic') || nailLower.includes('marble acrylic') || nailLower.includes('marble')) {
        designDesc = `elegant ${colorVal || 'pink'} marble acrylic nail art design with swirling veins and gold flakes`;
    } else if (nailLower.includes('luxury') || nailLower.includes('gold foil')) {
        designDesc = `luxury nail art design decorated with gold foil leafing and tiny subtle gemstone accents over ${colorVal || 'nude'} base color`;
    } else if (nailLower.includes('minimal') || nailLower.includes('minimalist') || nailLower.includes('nude')) {
        designDesc = `minimalist sheer ${colorVal || 'nude'} gel nail design, clean polished look`;
    } else if (nailLower.includes('cat-eye') || nailLower.includes('cat eye')) {
        designDesc = `magnetic ${colorVal || 'velvet'} cat-eye nail design with a dimensional light stripe effect`;
    } else if (nailLower.includes('aurora') || nailLower.includes('aurora glass')) {
        designDesc = `iridescent ${colorVal || 'pearl'} aurora glass nail design with shifting holographic reflections`;
    } else if (nailLower.includes('aura') || nailLower.includes('aura gradient')) {
        designDesc = `soft gradient aura glow circle nail design with ${colorVal || 'dreamy color'} blend center`;
    } else if (nailLower.includes('tortoiseshell')) {
        designDesc = `translucent tortoiseshell animal print nail design with ${colorVal || 'amber'} and brown spots`;
    } else if (nailLower.includes('water drop') || nailLower.includes('3d water')) {
        designDesc = `clear 3D water droplet gel nail design over ${colorVal || 'glossy'} base`;
    } else if (nailLower.includes('pink') || nailLower.includes('blush pink') || nailLower.includes('soft blush')) {
        designDesc = `${colorVal || 'sweet blush cotton candy pink'} solid color nail design`;
    } else if (nailLower.includes('black') || nailLower.includes('goth')) {
        designDesc = `${colorVal || 'edgy glossy solid jet black'} nail design`;
    } else {
        const match = nailStyle.match(/^([^.,]+)/);
        if (match && match[1]) {
            designDesc = `${match[1].trim()} nail design`;
        } else {
            designDesc = "manicure nail design";
        }
        if (colorVal) {
            designDesc += ` in ${colorVal} color`;
        }
    }

    // 2. Detect Shape
    let shapeDesc = "";
    if (nailLower.includes('almond')) {
        shapeDesc = "elegant tapered almond-shaped nails";
    } else if (nailLower.includes('coffin')) {
        shapeDesc = "long flat-tipped coffin-shaped square-ended acrylic nails";
    } else if (nailLower.includes('stiletto')) {
        shapeDesc = "long sharp pointed stiletto-shaped nails";
    } else if (nailLower.includes('square') && !nailLower.includes('squoval')) {
        shapeDesc = "neat straight-edged flat square-shaped nails";
    } else if (nailLower.includes('squoval')) {
        shapeDesc = "soft squoval-shaped nails (square with rounded corners)";
    } else if (nailLower.includes('round')) {
        shapeDesc = "natural looking short round-shaped nails";
    } else {
        const match = nailStyle.match(/Shape:\s*([^.]+)/i);
        if (match && match[1] && match[1].trim().toLowerCase() !== 'none') {
            shapeDesc = `${match[1].trim()} nails`;
        }
    }

    // 3. Detect Texture/Finish
    let textureDesc = "";
    if (nailLower.includes('liquid chrome') || nailLower.includes('liquid-chrome')) {
        textureDesc = "ultra-reflective high-shine liquid metallic chrome finish";
    } else if (nailLower.includes('glazed donut') || nailLower.includes('glazed-donut')) {
        textureDesc = "pearly iridescent glazed donut shimmer top coat finish";
    } else if (nailLower.includes('marble foil') || nailLower.includes('marble-foil')) {
        textureDesc = "swirled multi-tonal marble texture with metallic foil accents";
    } else if (nailLower.includes('glossy gel') || nailLower.includes('glossy-gel')) {
        textureDesc = "plump high-gloss gel top coat shine finish";
    } else if (nailLower.includes('velvet matte') || nailLower.includes('velvet-matte')) {
        textureDesc = "velvety soft-touch matte finish with zero shine";
    } else if (nailLower.includes('pearl') || nailLower.includes('pearl powder')) {
        textureDesc = "luminous pearl powder shimmer finish";
    } else {
        const match = nailStyle.match(/Texture:\s*([^.]+)/i);
        if (match && match[1] && match[1].trim().toLowerCase() !== 'none') {
            textureDesc = `${match[1].trim()} finish`;
        }
    }

    let finalDesc = designDesc;
    if (shapeDesc) {
        finalDesc += ` on ${shapeDesc}`;
    }
    if (textureDesc) {
        finalDesc += ` with a ${textureDesc}`;
    }
    return finalDesc;
}


async function callNanoBanana(imagePath, options) {
    // Read local file into base64 data URI
    const fileBuffer = fs.readFileSync(imagePath);
    let mimeType = 'image/jpeg';
    if (imagePath.endsWith('.png')) mimeType = 'image/png';
    else if (imagePath.endsWith('.webp')) mimeType = 'image/webp';
    
    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    if (!process.env.REPLICATE_API_TOKEN) {
        console.log(`[Replicate] Token missing. Running mock pipeline for task '${options.taskType || 'hairstyle'}'...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            success: true,
            url: dataUri
        };
    }

    const genderWord = options.gender === 'male' ? 'man' : (options.gender === 'female' ? 'woman' : 'person');
    let promptText = '';

    if (options.taskType === 'makeup') {
        const makeupStyle = options.makeup || 'Natural';
        const makeupPrompt = parseMakeupDescription(makeupStyle);
        promptText = `A highly realistic photo of the exact same ${genderWord} from the input image.
Strict identity preservation: Keep the exact same face, identity, skin tone, clothing, background, and lighting.
Modify only the makeup: apply ${makeupPrompt}.
Ensure the makeup looks professionally applied and blends naturally.
CRITICAL INSTRUCTION: Do NOT apply any color filters, tints, or atmospheric overlays to the photo. The original image lighting and overall color temperature MUST remain 100% identical.`;

    } else if (options.taskType === 'beard') {
        const beardStyle = options.beard || 'stubble';
        const beardPrompt = parseBeardDescription(beardStyle);
        promptText = `A highly realistic photo of the exact same ${genderWord} from the input image.
Strict identity preservation: Keep the exact same face, identity, skin tone, clothing, background, and lighting.
Modify only the facial hair: add or modify to ${beardPrompt}.
Ensure the facial hair looks natural and realistic.
CRITICAL INSTRUCTION: Do NOT apply any color filters, tints, or atmospheric overlays to the photo. The original image lighting and overall color temperature MUST remain 100% identical.`;

    } else if (options.taskType === 'nails') {
        const nailStyle = options.nails || 'French nails';
        const nailsPrompt = parseNailsDescription(nailStyle);
        promptText = `A highly realistic photo of the exact same hands from the input image.
Strict identity preservation: Keep the exact same skin tone, clothing, background, and lighting.
Modify only the fingernails: apply ${nailsPrompt}.
CRITICAL INSTRUCTION: Do NOT apply any color filters, tints, or atmospheric overlays to the photo. The original image lighting and overall color temperature MUST remain 100% identical.`;

    } else if (options.taskType === 'retouch') {
        let retouchDetails = [];
        try {
            const sliders = typeof options.retouch === 'string' ? JSON.parse(options.retouch) : options.retouch;
            if (sliders.smoothSkin > 20) retouchDetails.push("smooth clear skin with blemishes and wrinkles reduced while preserving natural skin pores");
            if (sliders.teethWhitening > 20) retouchDetails.push("naturally whitened bright teeth");
            if (sliders.eyeEnhancement > 20) retouchDetails.push("slightly brighter and clearer eyes with enhanced iris details");
            if (sliders.faceSymmetry > 20) retouchDetails.push("perfectly balanced and symmetric facial features");
            if (sliders.acneRemoval) retouchDetails.push("complete removal of temporary acne, spots, and skin blemishes");
            if (sliders.skinGlow > 20) retouchDetails.push("radiant dewy skin glow with subtle highlighting");
            if (sliders.skinTexturePreservation > 30) retouchDetails.push(`high preservation of natural skin pores and realistic skin texture (strength: ${sliders.skinTexturePreservation}%)`);
            if (sliders.poreRefiner) retouchDetails.push("smart pore refining to smooth skin without any plastic look");
        } catch (_) {
            retouchDetails.push("smooth clear skin, blemishes removed, teeth whitened, eyes enhanced, radiant skin glow");
        }
        
        if (retouchDetails.length === 0) {
            retouchDetails.push("smooth clear skin, natural skin pore texture, balanced highlight");
        }
        
        const retouchPrompt = retouchDetails.join(', ');
        promptText = `A highly realistic photo of the exact same ${genderWord} from the input image.
Strict identity preservation: Keep the exact same face, identity, skin tone, clothing, background, and lighting.
Modify only with professional beauty retouching: ${retouchPrompt}.
CRITICAL INSTRUCTION: Do NOT apply any color filters, tints, or atmospheric overlays to the photo. The original image lighting and overall color temperature MUST remain 100% identical.`;

    } else {
        let mappedHaircut = HAIRCUT_MAP[options.styleId] || HAIRCUT_MAP[options.style] || options.style || 'keep the exact same hairstyle, only change the hair color';
        
        // Parse and append dynamic slider modifiers for Grok prompts
        if (options.style && typeof options.style === 'string') {
            if (options.style.includes(', length:')) {
                const lengthMatch = options.style.match(/length:\s*([^,]+)/);
                const volumeMatch = options.style.match(/volume:\s*([^,]+)/);
                if (lengthMatch) {
                    mappedHaircut += `, hair length is ${lengthMatch[1].trim()}`;
                }
                if (volumeMatch) {
                    mappedHaircut += `, hair volume is ${volumeMatch[1].trim()}`;
                }
            } else if (options.style.includes(', density:')) {
                const densityMatch = options.style.match(/density:\s*([^,]+)/);
                if (densityMatch) {
                    mappedHaircut += `, beard density is ${densityMatch[1].trim()}`;
                }
            }
        }
        
        const mappedColor = COLOR_MAP[options.color] || options.color || 'No change';

        const hasNoHaircutChange = !mappedHaircut || mappedHaircut.toLowerCase().includes('keep the exact same hairstyle') || mappedHaircut.toLowerCase().includes('no change');
        const hasNoColorChange = !mappedColor || mappedColor.toLowerCase() === 'no change' || mappedColor.toLowerCase() === 'random';

        if (hasNoHaircutChange && hasNoColorChange) {
            promptText = `A highly realistic photo of the exact same ${genderWord} from the input image. Keep the exact same hairstyle, hair color, face, expression, clothing, lighting, camera angle, and background as the input image. Absolutely no changes.`;
        } else {
            const hairColorInstruction = hasNoColorChange ? 'their original hair color' : mappedColor;
            promptText = `A highly realistic photo of the exact same ${genderWord} from the input image.
Strict identity preservation: Keep the exact same face, identity, skin tone, clothing, background, and lighting.
Hair modification (CRITICAL):
- Hairstyle: Change the hair to ${mappedHaircut}.
- Hair color: Change the hair color to ${hairColorInstruction}.
Ensure the transition between the head and the new hair looks completely natural, clean, and photorealistic.
CRITICAL INSTRUCTION: Do NOT apply any color filters, tints, or atmospheric overlays to the photo. The original image lighting and overall color temperature MUST remain 100% identical.`;
        }
    }
    console.log(`[Replicate] Calling Image-to-Image model for task '${options.taskType || 'hairstyle'}' with prompt:\n${promptText}`);

    try {
        const modelString = "xai/grok-imagine-image";
        const modelInput = {
            image: dataUri,
            prompt: promptText
        };

        const output = await replicate.run(
            modelString,
            { input: modelInput }
        );

        const finalUrl = Array.isArray(output) ? output[0] : (typeof output === 'string' ? output : (output && output.toString ? output.toString() : ''));
        console.log(`[Replicate] Success! Generated image URL: ${finalUrl}`);
        return {
            success: true,
            url: finalUrl
        };
    } catch (err) {
        console.error("[Replicate] API Error:", err);
        return {
            success: false,
            error: err.message
        };
    }
}


module.exports = { callNanoBanana };
