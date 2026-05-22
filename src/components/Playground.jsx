import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Scissors, Check, HelpCircle } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';

const HAIRSTYLES = [
  
  {"id": "no_change", "name": "No Change", "category": "all", "isSpecial": true},
  {"id": "straight", "name": "Straight", "category": "Straight & Smooth", "image": "/styles/female_straight.webp", "gender": "female"},
  {"id": "straightened", "name": "Straightened", "category": "Straight & Smooth", "image": "/styles/female_straightened.webp", "gender": "female"},
  {"id": "blunt-bangs", "name": "Blunt Bangs", "category": "Straight & Smooth", "image": "/styles/female_blunt-bangs.webp", "gender": "female"},
  {"id": "side-swept-bangs", "name": "Side-Swept Bangs", "category": "Straight & Smooth", "image": "/styles/female_side-swept-bangs.webp", "gender": "female"},
  {"id": "bob", "name": "Bob", "category": "Bob & Lob", "image": "/styles/female_bob.webp", "gender": "female"},
  {"id": "lob", "name": "Lob", "category": "Bob & Lob", "image": "/styles/female_lob.webp", "gender": "female"},
  {"id": "angled-bob", "name": "Angled Bob", "category": "Bob & Lob", "image": "/styles/female_angled-bob.webp", "gender": "female"},
  {"id": "a-line-bob", "name": "A-Line Bob", "category": "Bob & Lob", "image": "/styles/female_a-line-bob.webp", "gender": "female"},
  {"id": "asymmetrical-bob", "name": "Asymmetrical Bob", "category": "Bob & Lob", "image": "/styles/female_asymmetrical-bob.webp", "gender": "female"},
  {"id": "graduated-bob", "name": "Graduated Bob", "category": "Bob & Lob", "image": "/styles/female_graduated-bob.webp", "gender": "female"},
  {"id": "inverted-bob", "name": "Inverted Bob", "category": "Bob & Lob", "image": "/styles/female_inverted-bob.webp", "gender": "female"},
  {"id": "pixie-cut", "name": "Pixie Cut", "category": "Short Cuts", "image": "/styles/female_pixie-cut.webp", "gender": "female"},
  {"id": "pageboy", "name": "Pageboy", "category": "Short Cuts", "image": "/styles/female_pageboy.webp", "gender": "female"},
  {"id": "shag", "name": "Shag", "category": "Short Cuts", "image": "/styles/female_shag.webp", "gender": "female"},
  {"id": "layered-shag", "name": "Layered Shag", "category": "Short Cuts", "image": "/styles/female_layered-shag.webp", "gender": "female"},
  {"id": "choppy-layers", "name": "Choppy Layers", "category": "Short Cuts", "image": "/styles/female_choppy-layers.webp", "gender": "female"},
  {"id": "razor-cut", "name": "Razor Cut", "category": "Short Cuts", "image": "/styles/female_razor-cut.webp", "gender": "female"},
  {"id": "layered", "name": "Layered", "category": "Layered & Wavy", "image": "/styles/female_layered.webp", "gender": "female"},
  {"id": "wavy", "name": "Wavy", "category": "Layered & Wavy", "image": "/styles/female_wavy.webp", "gender": "female"},
  {"id": "soft-waves", "name": "Soft Waves", "category": "Layered & Wavy", "image": "/styles/female_soft-waves.webp", "gender": "female"},
  {"id": "glamorous-waves", "name": "Glamorous Waves", "category": "Layered & Wavy", "image": "/styles/female_glamorous-waves.webp", "gender": "female"},
  {"id": "hollywood-waves", "name": "Hollywood Waves", "category": "Layered & Wavy", "image": "/styles/female_hollywood-waves.webp", "gender": "female"},
  {"id": "finger-waves", "name": "Finger Waves", "category": "Layered & Wavy", "image": "/styles/female_finger-waves.webp", "gender": "female"},
  {"id": "tousled", "name": "Tousled", "category": "Layered & Wavy", "image": "/styles/female_tousled.webp", "gender": "female"},
  {"id": "feathered", "name": "Feathered", "category": "Layered & Wavy", "image": "/styles/female_feathered.webp", "gender": "female"},
  {"id": "curly", "name": "Curly", "category": "Curly & Textured", "image": "/styles/female_curly.webp", "gender": "female"},
  {"id": "perm", "name": "Perm", "category": "Curly & Textured", "image": "/styles/female_perm.webp", "gender": "female"},
  {"id": "pin-curls", "name": "Pin Curls", "category": "Curly & Textured", "image": "/styles/female_pin-curls.webp", "gender": "female"},
  {"id": "twist-out", "name": "Twist Out", "category": "Curly & Textured", "image": "/styles/female_twist-out.webp", "gender": "female"},
  {"id": "high-ponytail", "name": "High Ponytail", "category": "Ponytails & Buns", "image": "/styles/female_high-ponytail.webp", "gender": "female"},
  {"id": "low-ponytail", "name": "Low Ponytail", "category": "Ponytails & Buns", "image": "/styles/female_low-ponytail.webp", "gender": "female"},
  {"id": "bubble-ponytail", "name": "Bubble Ponytail", "category": "Ponytails & Buns", "image": "/styles/female_bubble-ponytail.webp", "gender": "female"},
  {"id": "messy-bun", "name": "Messy Bun", "category": "Ponytails & Buns", "image": "/styles/female_messy-bun.webp", "gender": "female"},
  {"id": "top-knot", "name": "Top Knot", "category": "Ponytails & Buns", "image": "/styles/female_top-knot.webp", "gender": "female"},
  {"id": "ballerina-bun", "name": "Ballerina Bun", "category": "Ponytails & Buns", "image": "/styles/female_ballerina-bun.webp", "gender": "female"},
  {"id": "half-up-top-knot", "name": "Half-Up Top Knot", "category": "Ponytails & Buns", "image": "/styles/female_half-up-top-knot.webp", "gender": "female"},
  {"id": "messy-bun-headband", "name": "Messy Bun with Headband", "category": "Ponytails & Buns", "image": "/styles/female_messy-bun-headband.webp", "gender": "female"},
  {"id": "half-up-half-down", "name": "Half-Up Half-Down", "category": "Half-Up Styles", "image": "/styles/female_half-up-half-down.webp", "gender": "female"},
  {"id": "space-buns", "name": "Space Buns", "category": "Half-Up Styles", "image": "/styles/female_space-buns.webp", "gender": "female"},
  {"id": "pigtails", "name": "Pigtails", "category": "Half-Up Styles", "image": "/styles/female_pigtails.webp", "gender": "female"},
  {"id": "hair-bow", "name": "Hair Bow", "category": "Half-Up Styles", "image": "/styles/female_hair-bow.webp", "gender": "female"},
  {"id": "dutch-braid", "name": "Dutch Braid", "category": "Braids", "image": "/styles/female_dutch-braid.webp", "gender": "female"},
  {"id": "french-braid", "name": "French Braid", "category": "Braids", "image": "/styles/female_french-braid.webp", "gender": "female"},
  {"id": "fishtail-braid", "name": "Fishtail Braid", "category": "Braids", "image": "/styles/female_fishtail-braid.webp", "gender": "female"},
  {"id": "french-fishtail-braid", "name": "French Fishtail Braid", "category": "Braids", "image": "/styles/female_french-fishtail-braid.webp", "gender": "female"},
  {"id": "waterfall-braid", "name": "Waterfall Braid", "category": "Braids", "image": "/styles/female_waterfall-braid.webp", "gender": "female"},
  {"id": "rope-braid", "name": "Rope Braid", "category": "Braids", "image": "/styles/female_rope-braid.webp", "gender": "female"},
  {"id": "halo-braid", "name": "Halo Braid", "category": "Braids", "image": "/styles/female_halo-braid.webp", "gender": "female"},
  {"id": "crown-braid", "name": "Crown Braid", "category": "Braids", "image": "/styles/female_crown-braid.webp", "gender": "female"},
  {"id": "braided-crown", "name": "Braided Crown", "category": "Braids", "image": "/styles/female_braided-crown.webp", "gender": "female"},
  {"id": "bubble-braid", "name": "Bubble Braid", "category": "Braids", "image": "/styles/female_bubble-braid.webp", "gender": "female"},
  {"id": "ballerina-braids", "name": "Ballerina Braids", "category": "Braids", "image": "/styles/female_ballerina-braids.webp", "gender": "female"},
  {"id": "milkmaid-braids", "name": "Milkmaid Braids", "category": "Braids", "image": "/styles/female_milkmaid-braids.webp", "gender": "female"},
  {"id": "bohemian-braids", "name": "Bohemian Braids", "category": "Braids", "image": "/styles/female_bohemian-braids.webp", "gender": "female"},
  {"id": "double-dutch-braids", "name": "Double Dutch Braids", "category": "Braids", "image": "/styles/female_double-dutch-braids.webp", "gender": "female"},
  {"id": "box-braids", "name": "Box Braids", "category": "Braids", "image": "/styles/female_box-braids.webp", "gender": "female"},
  {"id": "crochet-braids", "name": "Crochet Braids", "category": "Braids", "image": "/styles/female_crochet-braids.webp", "gender": "female"},
  {"id": "cornrows", "name": "Cornrows", "category": "Braids", "image": "/styles/female_cornrows.webp", "gender": "female"},
  {"id": "bantu-knots", "name": "Bantu Knots", "category": "Braids", "image": "/styles/female_bantu-knots.webp", "gender": "female"},
  {"id": "dreadlocks", "name": "Dreadlocks", "category": "Braids", "image": "/styles/female_dreadlocks.webp", "gender": "female"},
  {"id": "messy-chignon", "name": "Messy Chignon", "category": "Updos", "image": "/styles/female_messy-chignon.webp", "gender": "female"},
  {"id": "french-twist-updo", "name": "French Twist Updo", "category": "Updos", "image": "/styles/female_french-twist-updo.webp", "gender": "female"},
  {"id": "french-roll", "name": "French Roll", "category": "Updos", "image": "/styles/female_french-roll.webp", "gender": "female"},
  {"id": "messy-updo", "name": "Messy Updo", "category": "Updos", "image": "/styles/female_messy-updo.webp", "gender": "female"},
  {"id": "knotted-updo", "name": "Knotted Updo", "category": "Updos", "image": "/styles/female_knotted-updo.webp", "gender": "female"},
  {"id": "twisted-bun", "name": "Twisted Bun", "category": "Updos", "image": "/styles/female_twisted-bun.webp", "gender": "female"},
  {"id": "twisted-half-updo", "name": "Twisted Half-Updo", "category": "Updos", "image": "/styles/female_twisted-half-updo.webp", "gender": "female"},
  {"id": "twist-pin-updo", "name": "Twist and Pin Updo", "category": "Updos", "image": "/styles/female_twist-pin-updo.webp", "gender": "female"},
  {"id": "flat-twist", "name": "Flat Twist", "category": "Updos", "image": "/styles/female_flat-twist.webp", "gender": "female"},
  {"id": "crown-twist", "name": "Crown Twist", "category": "Updos", "image": "/styles/female_crown-twist.webp", "gender": "female"},
  {"id": "beehive", "name": "Beehive", "category": "Vintage & Statement", "image": "/styles/female_beehive.webp", "gender": "female"},
  {"id": "bouffant", "name": "Bouffant", "category": "Vintage & Statement", "image": "/styles/female_bouffant.webp", "gender": "female"},
  {"id": "victory-rolls", "name": "Victory Rolls", "category": "Vintage & Statement", "image": "/styles/female_victory-rolls.webp", "gender": "female"},
  {"id": "ombre", "name": "Ombré", "category": "Color Treatments", "image": "/styles/female_ombre.webp", "gender": "female"},
  {"id": "messy-fishtail-braid", "name": "Messy Fishtail Braid", "category": "Braids", "image": "/styles/female_messy-fishtail-braid.webp", "gender": "female"},
  {"id": "messy-bun-scarf", "name": "Messy Bun with Scarf", "category": "Ponytails & Buns", "image": "/styles/female_messy-bun-scarf.webp", "gender": "female"},
  {"id": "crew-cut", "name": "Crew Cut", "category": "Short & Classic", "image": "/styles/male_crew-cut.webp", "gender": "male"},
  {"id": "buzz-cut", "name": "Buzz Cut", "category": "Short & Classic", "image": "/styles/male_buzz-cut.webp", "gender": "male"},
  {"id": "ivy-league", "name": "Ivy League", "category": "Short & Classic", "image": "/styles/male_ivy-league.webp", "gender": "male"},
  {"id": "side-part", "name": "Side Part", "category": "Short & Classic", "image": "/styles/male_side-part.webp", "gender": "male"},
  {"id": "caesar-cut", "name": "Caesar Cut", "category": "Short & Classic", "image": "/styles/male_caesar-cut.webp", "gender": "male"},
  {"id": "french-crop", "name": "French Crop", "category": "Short & Classic", "image": "/styles/male_french-crop.webp", "gender": "male"},
  {"id": "textured-crop", "name": "Textured Crop", "category": "Short & Classic", "image": "/styles/male_textured-crop.webp", "gender": "male"},
  {"id": "flat-top", "name": "Flat Top", "category": "Short & Classic", "image": "/styles/male_flat-top.webp", "gender": "male"},
  {"id": "skin-fade", "name": "Skin Fade", "category": "Fade & Taper", "image": "/styles/male_skin-fade.webp", "gender": "male"},
  {"id": "high-fade", "name": "High Fade", "category": "Fade & Taper", "image": "/styles/male_high-fade.webp", "gender": "male"},
  {"id": "mid-fade", "name": "Mid Fade", "category": "Fade & Taper", "image": "/styles/male_mid-fade.webp", "gender": "male"},
  {"id": "low-fade", "name": "Low Fade", "category": "Fade & Taper", "image": "/styles/male_low-fade.webp", "gender": "male"},
  {"id": "taper-fade", "name": "Taper Fade", "category": "Fade & Taper", "image": "/styles/male_taper-fade.webp", "gender": "male"},
  {"id": "drop-fade", "name": "Drop Fade", "category": "Fade & Taper", "image": "/styles/male_drop-fade.webp", "gender": "male"},
  {"id": "burst-fade", "name": "Burst Fade", "category": "Fade & Taper", "image": "/styles/male_burst-fade.webp", "gender": "male"},
  {"id": "quiff", "name": "Quiff", "category": "Medium Length", "image": "/styles/male_quiff.webp", "gender": "male"},
  {"id": "pompadour", "name": "Pompadour", "category": "Medium Length", "image": "/styles/male_pompadour.webp", "gender": "male"},
  {"id": "slick-back", "name": "Slick Back", "category": "Medium Length", "image": "/styles/male_slick-back.webp", "gender": "male"},
  {"id": "comb-over", "name": "Comb Over", "category": "Medium Length", "image": "/styles/male_comb-over.webp", "gender": "male"},
  {"id": "undercut", "name": "Undercut", "category": "Medium Length", "image": "/styles/male_undercut.webp", "gender": "male"},
  {"id": "disconnected-undercut", "name": "Disconnected Undercut", "category": "Medium Length", "image": "/styles/male_disconnected-undercut.webp", "gender": "male"},
  {"id": "faux-hawk", "name": "Faux Hawk", "category": "Medium Length", "image": "/styles/male_faux-hawk.webp", "gender": "male"},
  {"id": "mohawk", "name": "Mohawk", "category": "Medium Length", "image": "/styles/male_mohawk.webp", "gender": "male"},
  {"id": "textured-waves", "name": "Textured Waves", "category": "Medium Length", "image": "/styles/male_textured-waves.webp", "gender": "male"},
  {"id": "man-bun", "name": "Man Bun", "category": "Long", "image": "/styles/male_man-bun.webp", "gender": "male"},
  {"id": "half-up-man-bun", "name": "Half-Up Man Bun", "category": "Long", "image": "/styles/male_half-up-man-bun.webp", "gender": "male"},
  {"id": "long-straight", "name": "Long Straight", "category": "Long", "image": "/styles/male_long-straight.webp", "gender": "male"},
  {"id": "long-wavy", "name": "Long Wavy", "category": "Long", "image": "/styles/male_long-wavy.webp", "gender": "male"},
  {"id": "curtains", "name": "Curtains", "category": "Long", "image": "/styles/male_curtains.webp", "gender": "male"},
  {"id": "flow", "name": "Flow", "category": "Long", "image": "/styles/male_flow.webp", "gender": "male"},
  {"id": "curly-top", "name": "Curly Top", "category": "Curly & Textured", "image": "/styles/male_curly-top.webp", "gender": "male"},
  {"id": "afro", "name": "Afro", "category": "Curly & Textured", "image": "/styles/male_afro.webp", "gender": "male"},
  {"id": "twist-out-male", "name": "Twist Out", "category": "Curly & Textured", "image": "/styles/male_twist-out-male.webp", "gender": "male"},
  {"id": "dreadlocks-male", "name": "Dreadlocks", "category": "Curly & Textured", "image": "/styles/male_dreadlocks-male.webp", "gender": "male"},
  {"id": "cornrows-male", "name": "Cornrows", "category": "Curly & Textured", "image": "/styles/male_cornrows-male.webp", "gender": "male"},
  {"id": "box-braids-male", "name": "Box Braids", "category": "Curly & Textured", "image": "/styles/male_box-braids-male.webp", "gender": "male"},
  {"id": "ducktail", "name": "Ducktail", "category": "Vintage & Statement", "image": "/styles/male_ducktail.webp", "gender": "male"},
  {"id": "rockabilly", "name": "Rockabilly", "category": "Vintage & Statement", "image": "/styles/male_rockabilly.webp", "gender": "male"},
  {"id": "liberty-spikes", "name": "Liberty Spikes", "category": "Vintage & Statement", "image": "/styles/male_liberty-spikes.webp", "gender": "male"},
  {"id": "spiky", "name": "Spiky", "category": "Vintage & Statement", "image": "/styles/male_spiky.webp", "gender": "male"},
  {"id": "bald", "name": "Bald", "category": "Short & Classic", "image": "/styles/male_bald.webp", "gender": "male"},

];

const FEMALE_CATEGORIES = [
  'All',
  'Straight & Smooth',
  'Bob & Lob',
  'Short Cuts',
  'Layered & Wavy',
  'Curly & Textured',
  'Ponytails & Buns',
  'Half-Up Styles',
  'Braids',
  'Updos',
  'Vintage & Statement',
  'Color Treatments',
];

const MALE_CATEGORIES = [
  'All',
  'Short & Classic',
  'Fade & Taper',
  'Medium Length',
  'Long',
  'Curly & Textured',
  'Vintage & Statement',
];

const COLORS = [
  { id: "ai-recommended", name: "AI Recommended", hex: "linear-gradient(135deg, #f9d423, #e040fb, #00b4db)", hot: true, hue: 0, saturate: 100, brightness: 100 },
  { id: "no-change", name: "No Change", hex: "#888888", hue: 0, saturate: 100, brightness: 100 },
  { id: "jet-black", name: "Jet Black", hex: "#0a0a0a", hue: 0, saturate: 10, brightness: 25 },
  { id: "blonde", name: "Blonde", hex: "#f5d376", hot: true, hue: 0, saturate: 110, brightness: 130 },
  { id: "blue-highlights", name: "Blue Highlights", hex: "#4a90d9", hot: true, hue: 165, saturate: 150, brightness: 90 },
  { id: "pastel-pink", name: "Pastel Pink", hex: "#f4a7b9", hot: true, hue: 295, saturate: 110, brightness: 120 },
  { id: "black", name: "Black", hex: "#1a1a1a", hue: 0, saturate: 10, brightness: 40 },
  { id: "blue-black", name: "Blue-Black", hex: "#1a1a2e", hue: 175, saturate: 25, brightness: 35 },
  { id: "dark-brown", name: "Dark Brown", hex: "#3b1f0e", hue: 340, saturate: 70, brightness: 50 },
  { id: "medium-brown", name: "Medium Brown", hex: "#7b4a2d", hue: 340, saturate: 90, brightness: 75 },
  { id: "light-brown", name: "Light Brown", hex: "#b07d56", hue: 340, saturate: 85, brightness: 105 },
  { id: "chestnut", name: "Chestnut", hex: "#954535", hue: 330, saturate: 90, brightness: 80 },
  { id: "mahogany", name: "Mahogany", hex: "#6b2737", hue: 305, saturate: 80, brightness: 70 },
  { id: "ash-brown", name: "Ash Brown", hex: "#7a6a5a", hue: 345, saturate: 35, brightness: 85 },
  { id: "brunette", name: "Brunette", hex: "#4a3728", hue: 340, saturate: 60, brightness: 60 },
  { id: "caramel", name: "Caramel", hex: "#c68642", hue: 350, saturate: 110, brightness: 100 },
  { id: "golden-blonde", name: "Golden Blonde", hex: "#e8c84a", hue: 0, saturate: 120, brightness: 120 },
  { id: "honey-blonde", name: "Honey Blonde", hex: "#d4a853", hue: 355, saturate: 100, brightness: 110 },
  { id: "strawberry-blonde", name: "Strawberry Blonde", hex: "#e8a87c", hue: 340, saturate: 95, brightness: 115 },
  { id: "platinum-blonde", name: "Platinum Blonde", hex: "#e8e4d8", hue: 355, saturate: 25, brightness: 145 },
  { id: "ash-blonde", name: "Ash Blonde", hex: "#c4b99a", hue: 355, saturate: 40, brightness: 110 },
  { id: "auburn", name: "Auburn", hex: "#922b21", hue: 325, saturate: 120, brightness: 75 },
  { id: "copper", name: "Copper", hex: "#b87333", hue: 335, saturate: 130, brightness: 90 },
  { id: "burgundy", name: "Burgundy", hex: "#800020", hue: 300, saturate: 140, brightness: 60 },
  { id: "silver", name: "Silver", hex: "#c0c0c0", hue: 0, saturate: 0, brightness: 130 },
  { id: "white", name: "White", hex: "#f5f5f5", hue: 0, saturate: 0, brightness: 165 },
  { id: "titanium", name: "Titanium", hex: "#878681", hue: 155, saturate: 10, brightness: 95 },
  { id: "rose-gold", name: "Rose Gold", hex: "#e8a598", hue: 335, saturate: 70, brightness: 120 },
  { id: "red", name: "Red", hex: "#e8192c", hue: 315, saturate: 180, brightness: 90 },
  { id: "blue", name: "Blue", hex: "#0066cc", hue: 165, saturate: 160, brightness: 90 },
  { id: "purple", name: "Purple", hex: "#6600cc", hue: 225, saturate: 150, brightness: 80 },
  { id: "pink", name: "Pink", hex: "#ff69b4", hue: 285, saturate: 160, brightness: 110 },
  { id: "green", name: "Green", hex: "#22aa22", hue: 75, saturate: 140, brightness: 95 }
];

const GENDERS = [
  { id: 'female', name: 'Female' },
  { id: 'male', name: 'Male' }
];

export default function Playground({ user, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedGender, setSelectedGender] = useState('female');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStyles, setSelectedStyles] = useState(['no_change']);
  const [selectedColor, setSelectedColor] = useState('ai-recommended');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [resultImages, setResultImages] = useState([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const resultImage = resultImages.length > 0 ? resultImages[activeResultIndex]?.result : null;

  const handleSelectStyle = (styleId) => {
    if (styleId === 'no_change') {
      setSelectedStyles(['no_change']);
      return;
    }

    setSelectedStyles(prev => {
      const filtered = prev.filter(id => id !== 'no_change');
      
      if (filtered.includes(styleId)) {
        const next = filtered.filter(id => id !== styleId);
        return next.length === 0 ? ['no_change'] : next;
      } else {
        if (filtered.length >= 10) {
          toast.error("You can select up to 10 hairstyles at once!");
          return prev;
        }
        return [...filtered, styleId];
      }
    });
  };

  const activeColorObj = COLORS.find(c => c.id === selectedColor);
  const colorFilterStyle = {};


  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setResultImages([]);
      setActiveResultIndex(0);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  const handleGenerate = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    const tokenCost = selectedStyles.length * 10;

    if (user.tokens < tokenCost) {
      toast.error(`You need at least ${tokenCost} token${tokenCost > 1 ? 's' : ''} to generate these styles!`);
      setActiveTab('pricing');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading portrait to AI engine...');

    const steps = [
      { prg: 10, txt: 'Uploading portrait to AI engine...' },
      { prg: 25, txt: 'Analyzing facial features...' },
      { prg: 45, txt: 'Removing existing hair layers...' },
      { prg: 70, txt: 'Running Replicate hair transformation...' },
      { prg: 85, txt: 'Dyeing hair & matching lighting...' },
      { prg: 95, txt: 'Refining details and upscaling...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const nextVal = prev + 1;
        if (currentStep < steps.length && nextVal >= steps[currentStep].prg) {
          setLoadingText(steps[currentStep].txt);
          currentStep++;
        }
        if (nextVal >= 95) {
          return 95;
        }
        return nextVal;
      });
    }, 150);

    try {
      const colorObj = COLORS.find(c => c.id === selectedColor);
      const colorFilterVal = (colorObj && colorObj.id !== 'ai-recommended' && colorObj.id !== 'no-change') ? {
        hue: colorObj.hue,
        saturate: colorObj.saturate,
        brightness: colorObj.brightness
      } : null;

      const promises = selectedStyles.map(async (styleId) => {
        const styleObj = HAIRSTYLES.find(h => h.id === styleId);
        const styleName = styleObj ? styleObj.name : 'Custom Style';

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('style', styleName);
        formData.append('color', colorObj ? colorObj.name : 'Custom Color');
        formData.append('gender', selectedGender);

        const res = await authFetch('/api/generate', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to generate style "${styleName}"`);
        }

        const data = await res.json();
        return {
          styleId,
          styleName,
          result: data.imageUrl,
          creditsRemaining: data.creditsRemaining
        };
      });

      const responses = await Promise.all(promises);

      clearInterval(interval);
      setProgress(100);
      setLoadingText('Generation complete!');

      setTimeout(() => {
        const newResults = responses.map((resp, index) => {
          return {
            id: `${Date.now()}-${index}`,
            styleId: resp.styleId,
            styleName: resp.styleName,
            result: resp.result,
            original: image,
            colorName: colorObj ? colorObj.name : 'Custom Color',
            colorFilter: colorFilterVal
          };
        });

        setResultImages(newResults);
        setActiveResultIndex(0);
        setIsGenerating(false);

        const lastCredits = responses[responses.length - 1].creditsRemaining;
        if (typeof lastCredits === 'number') {
          onDeductToken(user.tokens - lastCredits);
        } else {
          onDeductToken(tokenCost);
        }

        newResults.forEach(item => {
          const newHistoryItem = {
            id: item.id,
            original: item.original,
            result: item.result,
            style: item.styleName,
            color: item.colorName,
            colorFilter: item.colorFilter,
            date: new Date().toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          };
          onAddHistory(newHistoryItem);
        });

        toast.success("AI Hairstyle rendering successful!");
      }, 800);

    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      console.error(err);
      toast.error(err.message || "Failed to generate hairstyles. Please try again.");
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setResultImages([]);
    setActiveResultIndex(0);
  };


  const activeCategories = selectedGender === 'female' ? FEMALE_CATEGORIES : MALE_CATEGORIES;

  const filteredHairstyles = HAIRSTYLES.filter(h =>
    h.isSpecial ||
    (h.gender === selectedGender &&
      (selectedCategory === 'All' || h.category === selectedCategory))
  );

  return (
    <section className="playground-section container">
      <div className="playground-grid">
        {/* Left Side: Customizer Controls */}
        <div className="control-panel glass-panel">
          <div>
            <h2 className="section-title">
              <Scissors size={20} color="var(--color-pink-primary)" />
              <span>AI Hairstyle Customizer</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select your desired hair template and color. Every generation uses 10 tokens.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }} />

          {/* GENDER selection */}
          <div className="selector-group">
            <span className="selector-title">GENDER</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {GENDERS.map(g => (
                <button
                  key={g.id}
                  className={`btn ${selectedGender === g.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  onClick={() => {
                    setSelectedGender(g.id);
                    setSelectedCategory('All');
                    setSelectedStyles(['no_change']);
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORY filter */}
          <div className="selector-group">
            <span className="selector-title">CATEGORY</span>
            <div className="category-chips">
              {activeCategories.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Hairstyle options */}
          <div className="selector-group">
            <span className="selector-title">Hairstyle Selection ({filteredHairstyles.length})</span>
            <div className="style-cards-grid">
              {filteredHairstyles.map(h => {
                const isSelected = selectedStyles.includes(h.id);
                return (
                  <div
                    key={h.id}
                    className={`style-card ${h.isSpecial ? 'no-change-card' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectStyle(h.id)}
                  >
                    {isSelected && (
                      <div className="selected-badge">
                        {h.id === 'no_change' ? <Check size={12} /> : (selectedStyles.indexOf(h.id) + 1)}
                      </div>
                    )}
                    <div className="style-card-image-wrapper">
                      {h.isSpecial ? (
                        <div className="no-change-graphic">
                          <span className="no-change-dot" style={{ background: '#ff5e5c' }}></span>
                          <span className="no-change-dot" style={{ background: '#ffd02b' }}></span>
                          <span className="no-change-dot" style={{ background: '#54d37a' }}></span>
                          <span className="no-change-dot" style={{ background: '#4894ff' }}></span>
                          <span className="no-change-dot" style={{ background: '#b37eff' }}></span>
                          <span className="no-change-dot" style={{ background: '#ff8e25' }}></span>
                          <span className="no-change-dot" style={{ background: '#26d1be' }}></span>
                          <span className="no-change-dot" style={{ background: '#161e31' }}></span>
                        </div>
                      ) : (
                        <img src={h.image} className="style-card-image" alt={h.name} />
                      )}
                    </div>
                    <div className="style-card-footer">
                      {h.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color options */}
          <div className="selector-group">
            <span className="selector-title">Color Shade Selection</span>
            <div className="pill-grid">
              {COLORS.map(c => (
                <div
                  key={c.id}
                  className={`pill-option ${selectedColor === c.id ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(c.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', position: 'relative' }}
                >
                  {c.hot && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-4px',
                        background: 'var(--color-pink-primary)',
                        color: '#fff',
                        fontSize: '7px',
                        lineHeight: '1',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        boxShadow: '0 0 4px rgba(255, 46, 147, 0.4)',
                        zIndex: 10
                      }}
                    >
                      hot
                    </span>
                  )}
                  <span 
                    style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: c.hex,
                      boxShadow: c.hex.startsWith('linear-gradient') ? '0 0 6px #e040fb' : `0 0 6px ${c.hex}` 
                    }} 
                  />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.9rem' }}
              disabled={!image || isGenerating}
              onClick={handleGenerate}
            >
              <Sparkles size={18} />
              <span>Render AI Hairstyle</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '0.25rem' }}>
                (-{selectedStyles.length * 10} Token{selectedStyles.length * 10 > 1 ? 's' : ''})
              </span>
            </button>
          </div>
        </div>

        {/* Right Side: Upload and Result Viewer */}
        <div className="preview-panel glass-panel">
          {isGenerating && (
            <div className="loading-overlay">
              <div className="spinner-outer">
                <div className="spinner-inner"></div>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="loading-text">{loadingText}</span>
              <span className="loading-subtext">{progress}% Completed</span>
            </div>
          )}

          {!image ? (
            /* Empty State: File Upload */
            <div 
              className="dropzone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerUpload}
            >
              <div className="dropzone-icon">
                <Upload size={24} />
              </div>
              <h3>Upload Your Portrait</h3>
              <p>Drag & drop a front-facing selfie here, or click to browse files.</p>
              <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); triggerUpload(); }}>
                Browse Files
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                className="file-input" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            /* Active State: Preview & Result */
            <div style={{ width: '100%' }}>
              <div className="preview-container">
                <img 
                  src={resultImage || image} 
                  alt="Hairstyle Preview"
                  style={colorFilterStyle}
                />
                
                {!isGenerating && !resultImage && (
                  <button className="delete-preview-btn" onClick={handleReset} title="Remove image">
                    <RefreshCw size={16} />
                  </button>
                )}

                {resultImage && (
                  <div className="slider-label after" style={{ top: '1rem', bottom: 'auto' }}>AI GENERATED</div>
                )}
              </div>

              {/* Batch Preview Thumbnails */}
              {resultImages.length > 0 && (
                <div className="batch-thumbnails-container">
                  <div className="batch-thumbnails-title">
                    Generated Styles ({resultImages.length})
                  </div>
                  <div className="batch-thumbnails-grid">
                    {resultImages.map((res, index) => {
                      const isActive = index === activeResultIndex;
                      const thumbColorFilter = {};
                      return (
                        <div
                          key={res.id}
                          className={`batch-thumbnail-wrapper ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveResultIndex(index)}
                        >
                          <img
                            src={res.result}
                            alt={res.styleName}
                            style={thumbColorFilter}
                            className="batch-thumbnail-img"
                          />
                          <span className="batch-thumbnail-label">
                            {res.styleName === 'No Change' ? res.colorName : res.styleName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons under image */}
              <div className="preview-controls">
                {resultImage ? (
                  <>
                    <a 
                      href={resultImage} 
                      download={`glamai_${(resultImages[activeResultIndex]?.styleName === 'No Change' ? resultImages[activeResultIndex]?.colorName : resultImages[activeResultIndex]?.styleName) || 'hairstyle'}.png`} 
                      className="btn btn-primary"
                    >
                      <Download size={16} />
                      <span>Download HD Render</span>
                    </a>
                    <button className="btn btn-secondary" onClick={handleReset}>
                      <RefreshCw size={16} />
                      <span>Try Another Style</span>
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <HelpCircle size={12} />
                    <span>Ready to render. Click the 'Render AI Hairstyle' button on the left.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
