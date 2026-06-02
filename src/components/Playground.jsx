import React, { useEffect, useState, useRef } from 'react';
import { Upload, Sparkles, Coins, Download, RefreshCw, Scissors, Check, HelpCircle, TrendingUp, Camera, Share2, Award, Briefcase, Heart, Flame, Leaf } from 'lucide-react';
import { useToast } from './Toast';
import { authFetch } from '../apiClient';
import { trackEvent } from '../utils/analytics';
import SliderComparison from './SliderComparison';
import { usePreferences } from '../utils/usePreferences';
import { useAchievements } from '../utils/useAchievements';

const POPULAR_STYLE_IDS = ['bob', 'pixie-cut', 'wavy', 'french-crop', 'skin-fade'];

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
  { id: "platinum-blonde", name: "Platinum Blonde", hex: "#e8e4d8", hue: 355, saturate: 25, brightness: 145 },
  { id: "dark-brown", name: "Dark Brown", hex: "#3b1f0e", hue: 340, saturate: 70, brightness: 50 },
  { id: "medium-brown", name: "Medium Brown", hex: "#7b4a2d", hue: 340, saturate: 90, brightness: 75 },
  { id: "light-brown", name: "Light Brown", hex: "#b07d56", hue: 340, saturate: 85, brightness: 105 },
  { id: "chestnut", name: "Chestnut", hex: "#954535", hue: 330, saturate: 90, brightness: 80 },
  { id: "caramel", name: "Caramel", hex: "#c68642", hue: 350, saturate: 110, brightness: 100 },
  { id: "golden-blonde", name: "Golden Blonde", hex: "#e8c84a", hue: 0, saturate: 120, brightness: 120 },
  { id: "honey-blonde", name: "Honey Blonde", hex: "#d4a853", hue: 355, saturate: 100, brightness: 110 },
  { id: "strawberry-blonde", name: "Strawberry Blonde", hex: "#e8a87c", hue: 340, saturate: 95, brightness: 115 },
  { id: "auburn", name: "Auburn", hex: "#922b21", hue: 325, saturate: 120, brightness: 75 },
  { id: "copper", name: "Copper", hex: "#b87333", hue: 335, saturate: 130, brightness: 90 },
  { id: "burgundy", name: "Burgundy", hex: "#800020", hue: 300, saturate: 140, brightness: 60 },
  { id: "rose-gold", name: "Rose Gold", hex: "#e8a598", hue: 335, saturate: 70, brightness: 120 },
  { id: "pastel-pink", name: "Pastel Pink", hex: "#f4a7b9", hot: true, hue: 295, saturate: 110, brightness: 120 },
  { id: "pastel-lilac", name: "Pastel Lilac", hex: "#d6cadd", hue: 0, saturate: 100, brightness: 100 },
  { id: "silver", name: "Silver", hex: "#c0c0c0", hue: 0, saturate: 0, brightness: 130 },
  { id: "red", name: "Red", hex: "#e8192c", hue: 315, saturate: 180, brightness: 90 },
  { id: "blue", name: "Blue", hex: "#0066cc", hue: 165, saturate: 160, brightness: 90 },
  { id: "balayage-blonde", name: "Balayage Blonde", hex: "linear-gradient(135deg, #4a3728, #f5d376)", hot: true, hue: 0, saturate: 100, brightness: 100 },
  { id: "split-pink-black", name: "Split-dye Pink & Black", hex: "linear-gradient(90deg, #ff69b4 50%, #1a1a1a 50%)", hot: true, hue: 0, saturate: 100, brightness: 100 },
  { id: "sunset-copper", name: "Sunset Copper", hex: "linear-gradient(135deg, #b87333, #e8192c)", hot: true, hue: 0, saturate: 100, brightness: 100 }
];

const GENDERS = [
  { id: 'female', name: 'Feminine' },
  { id: 'male', name: 'Masculine' }
];

const PRESETS = [
  {
    id: 'office',
    name: 'For Office',
    icon: '💼',
    female: { style: 'bob', color: 'no-change' },
    male: { style: 'side-part', color: 'no-change' }
  },
  {
    id: 'date',
    name: 'For a Date',
    icon: '💅',
    female: { style: 'wavy', color: 'caramel' },
    male: { style: 'quiff', color: 'medium-brown' }
  },
  {
    id: 'bold',
    name: 'Bold & Bright',
    icon: '🔥',
    female: { style: 'pixie-cut', color: 'sunset-copper' },
    male: { style: 'buzz-cut', color: 'platinum-blonde' }
  },
  {
    id: 'natural',
    name: 'Natural Look',
    icon: '🌸',
    female: { style: 'layered', color: 'medium-brown' },
    male: { style: 'textured-crop', color: 'no-change' }
  }
];

const TOP_STYLES = {
  female: ['wavy', 'bob', 'layered'],
  male: ['french-crop', 'skin-fade', 'crew-cut']
};

const PROGRESS_STEPS = [
  '⬆️ Uploading portrait...',
  '🔍 Analyzing facial features...',
  '✂️ Removing existing hair...',
  '🎨 Running style transformation...',
  '💇 Dyeing hair & matching lights...',
  '✨ Refining details & upscaling...'
];

export default function Playground({ user, guestTokens, onDeductToken, onOpenAuth, onAddHistory, setActiveTab }) {
  const toast = useToast();
  const isGuest = !user;
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
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [showUpsellBox, setShowUpsellBox] = useState(false);

  // Custom states for new UX requirements
  const [activePreset, setActivePreset] = useState(null);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [etaRemaining, setEtaRemaining] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [dislikeReason, setDislikeReason] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFixedCta, setShowFixedCta] = useState(true);

  // Hook integrations
  const { prefs, savePreference, saveLastStyle, saveLastColor } = usePreferences(user?.id || 'guest');
  const { trigger: triggerAchievement, pendingToast, clearToast } = useAchievements();

  // Load user last-used preferences on initialization
  useEffect(() => {
    if (prefs) {
      if (prefs.lastColor) setSelectedColor(prefs.lastColor);
      if (prefs.lastStyles && prefs.lastStyles.length > 0) setSelectedStyles(prefs.lastStyles);
    }
  }, [prefs]);

  // Handle achievement notifications via toast
  useEffect(() => {
    if (pendingToast) {
      toast.success(pendingToast);
      clearToast();
    }
  }, [pendingToast, clearToast, toast]);

  // Monitor scroll positioning to hide/show the mobile floating button appropriately
  useEffect(() => {
    const handleScroll = () => {
      if (!previewPanelRef.current) return;
      const rect = previewPanelRef.current.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight * 0.7) {
        setShowFixedCta(false);
      } else {
        setShowFixedCta(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeResult = resultImages.length > 0 ? resultImages[activeResultIndex] : null;
  const resultImage = activeResult && activeResult.status === 'success' ? activeResult.result : null;
  const tokenCost = selectedStyles.length * 10;

  const openPricingWithRecommendation = () => {
    const selectedCount = selectedStyles.filter((s) => s !== 'no_change').length;
    const isHeavyUse = selectedCount >= 3;
    const suggestedPlanId = isHeavyUse ? 'monthly-vip' : 'pro-onetime';
    trackEvent('recommended_plan_click', {
      source: 'playground_upsell',
      suggestedPlanId,
      selectedStyles: selectedCount,
      isGuest,
    });
    window.localStorage.setItem('glamai_recommended_plan', suggestedPlanId);
    setActiveTab('pricing');
  };

  useEffect(() => {
    if (!showUpsellBox) return;
    trackEvent('paywall_view', {
      source: 'playground_result',
      isGuest,
      selectedStyles: selectedStyles.filter((s) => s !== 'no_change').length,
      tokenCost,
      creditsLeft: isGuest ? (guestTokens ?? 0) : (user?.tokens ?? 0),
    });
  }, [showUpsellBox, isGuest, selectedStyles, tokenCost, guestTokens, user]);

  const handleSelectStyle = (styleId) => {
    setActivePreset(null); // Reset preset on manual style selection
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

    // Auto scroll up to generation preview on mobile when "applying" (selecting) a style
    scrollToPreview();
  };

  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    const genderPreset = preset[selectedGender];
    if (genderPreset) {
      setSelectedStyles([genderPreset.style]);
      setSelectedColor(genderPreset.color);
      
      // Select preset feedback
      toast.success(`Preset "${preset.name}" applied!`);

      // Auto scroll up to generation preview on mobile when applying a preset
      scrollToPreview();
    }
  };

  const handleQuickStartSelect = (styleId) => {
    setSelectedStyles([styleId]);
    setShowQuickStart(false);
    // Trigger generation instantly
    handleGenerate([styleId]);
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    if (type === 'like') {
      try {
        const feedbackLog = JSON.parse(localStorage.getItem('glamai_feedback') || '[]');
        feedbackLog.push({ style: selectedStyles[0], color: selectedColor, type: 'like', timestamp: Date.now() });
        localStorage.setItem('glamai_feedback', JSON.stringify(feedbackLog));
      } catch {}
      setFeedbackSubmitted(true);
      toast.success("Thank you for your rating!");
    }
  };

  const handleFeedbackReason = (reason) => {
    setDislikeReason(reason);
    try {
      const feedbackLog = JSON.parse(localStorage.getItem('glamai_feedback') || '[]');
      feedbackLog.push({ style: selectedStyles[0], color: selectedColor, type: 'dislike', reason, timestamp: Date.now() });
      localStorage.setItem('glamai_feedback', JSON.stringify(feedbackLog));
    } catch {}
    setFeedbackSubmitted(true);
    toast.success("Thank you for helping us improve!");
  };

  const activeColorObj = COLORS.find(c => c.id === selectedColor);
  const colorFilterStyle = {};
  if (activeColorObj && activeColorObj.id !== 'ai-recommended' && activeColorObj.id !== 'no-change') {
    colorFilterStyle.filter = `hue-rotate(${activeColorObj.hue}deg) saturate(${activeColorObj.saturate}%) brightness(${activeColorObj.brightness}%)`;
  }

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const previewPanelRef = useRef(null);

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
      setShowUpsellBox(false);
      // Auto-trigger Quick Start modal
      setShowQuickStart(true);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current.click();
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      loadImage(file);
    }
  };

  const handleShare = async (imgUrl) => {
    const shareData = {
      title: 'My AI Hairstyle — GlamAI',
      text: 'Check out my AI hairstyle transformation by GlamAI!',
      url: 'https://glamai.app'
    };
    if (navigator.share && imgUrl) {
      try {
        const response = await fetch(imgUrl);
        const blob = await response.blob();
        const file = new File([blob], 'glamai_hairstyle.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: shareData.title, text: shareData.text });
          return;
        }
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') toast.error('Sharing failed. Try downloading instead.');
      }
    } else {
      try { await navigator.clipboard.writeText('https://glamai.app'); toast.success('Link copied to clipboard!'); }
      catch { toast.error('Could not copy link.'); }
    }
  };

  const scrollToPreview = () => {
    if (window.innerWidth <= 900 && previewPanelRef.current) {
      setTimeout(() => {
        previewPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleGenerate = async (stylesToUse) => {
    const activeStyles = stylesToUse || selectedStyles;
    const availableTokens = isGuest ? (guestTokens ?? 0) : (user?.tokens ?? 0);
    const calculatedCost = activeStyles.length * 10;

    // Reset feedback
    setFeedback(null);
    setDislikeReason(null);
    setFeedbackSubmitted(false);

    // Guest with no tokens left — ask to sign up
    if (isGuest && availableTokens < calculatedCost) {
      toast.error('You have used your free generation! Sign up to get more tokens.');
      onOpenAuth();
      return;
    }

    // Logged-in user with no tokens — redirect to pricing
    if (!isGuest && availableTokens < calculatedCost) {
      toast.error(`You need at least ${calculatedCost} token${calculatedCost > 1 ? 's' : ''} to generate these styles!`);
      setActiveTab('pricing');
      return;
    }

    // Guest: only 1 style allowed per free generation
    if (isGuest && activeStyles.filter(s => s !== 'no_change').length > 1) {
      toast.error('Free generation allows only 1 style. Sign up to generate multiple!');
      openPricingWithRecommendation();
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLoadingText('Uploading portrait to AI engine...');
    setEtaRemaining(30 * activeStyles.length);

    const steps = [
      { prg: 10, txt: 'Uploading portrait to AI engine...' },
      { prg: 25, txt: 'Analyzing facial features...' },
      { prg: 45, txt: 'Removing existing hair layers...' },
      { prg: 70, txt: 'Running Replicate hair transformation...' },
      { prg: 85, txt: 'Dyeing hair & matching lighting...' },
      { prg: 95, txt: 'Refining details and upscaling...' }
    ];

    const etaInterval = setInterval(() => {
      setEtaRemaining(prev => {
        if (prev <= 1) return 1;
        return prev - 1;
      });
    }, 1000);

    try {
      const colorObj = COLORS.find(c => c.id === selectedColor);
      const colorFilterVal = (colorObj && colorObj.id !== 'ai-recommended' && colorObj.id !== 'no-change') ? {
        hue: colorObj.hue,
        saturate: colorObj.saturate,
        brightness: colorObj.brightness
      } : null;

      // Initialize progressive result list with 'pending' and first one as 'generating'
      const initialResults = activeStyles.map((styleId, idx) => {
        const styleObj = HAIRSTYLES.find(h => h.id === styleId);
        return {
          id: `gen-${Date.now()}-${idx}`,
          styleId,
          styleName: styleObj ? styleObj.name : 'Custom Style',
          status: idx === 0 ? 'generating' : 'pending',
          result: null,
          original: image,
          colorName: colorObj ? colorObj.name : 'Custom Color',
          colorFilter: colorFilterVal
        };
      });

      setResultImages(initialResults);
      setActiveResultIndex(0);

      for (let i = 0; i < activeStyles.length; i++) {
        const styleId = activeStyles[i];
        const styleObj = HAIRSTYLES.find(h => h.id === styleId);
        const styleName = styleObj ? styleObj.name : 'Custom Style';

        // Update the current item's status to generating
        setResultImages(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'generating' } : item));

        // Start progress animation for this style
        setProgress(0);
        setLoadingText('Uploading portrait to AI engine...');
        let currentStep = 0;
        const styleInterval = setInterval(() => {
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
        }, 120);

        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          formData.append('style', styleName);
          formData.append('styleId', styleId);
          formData.append('color', colorObj ? colorObj.name : 'Custom Color');
          formData.append('gender', selectedGender);

          const res = await authFetch('/api/generate', {
            method: 'POST',
            body: formData
          });

          clearInterval(styleInterval);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            // Guest trial exhausted on backend
            if (errData.code === 'LOGIN_REQUIRED') {
              toast.error('Your free generation is used up! Sign up to continue.');
              onOpenAuth();
              setIsGenerating(false);
              clearInterval(etaInterval);
              return;
            }
            throw new Error(errData.error || `Failed to generate style "${styleName}"`);
          }

          const data = await res.json();

          // Update result item to success
          setResultImages(prev => prev.map((item, idx) => idx === i ? {
            ...item,
            status: 'success',
            result: data.imageUrl,
            creditsRemaining: data.creditsRemaining
          } : item));

          // Deduct credits immediately
          onDeductToken(10);

          // Save personalized preferences and trigger win achievement
          saveLastStyle(styleId);
          saveLastColor(selectedColor);
          triggerAchievement('first_generation');

          // Add to history
          const newHistoryItem = {
            id: `history-${Date.now()}-${i}`,
            original: image,
            result: data.imageUrl,
            style: styleName,
            color: colorObj ? colorObj.name : 'Custom Color',
            colorFilter: colorFilterVal,
            date: new Date().toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          };
          onAddHistory(newHistoryItem);

        } catch (err) {
          clearInterval(styleInterval);
          // Update result item to error
          setResultImages(prev => prev.map((item, idx) => idx === i ? {
            ...item,
            status: 'error',
            error: err.message || `Failed to generate style "${styleName}"`
          } : item));
          toast.error(err.message || `Failed to generate style "${styleName}"`);
        }

        // Add 3.0s delay between requests to avoid burst rate limits (429) on Replicate
        if (i < activeStyles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      setIsGenerating(false);
      setProgress(100);
      setLoadingText('Generation complete!');
      toast.success("AI Hairstyle rendering finished!");
      if (isGuest || (!isGuest && (availableTokens - calculatedCost) <= 20)) {
        setShowUpsellBox(true);
      }

    } catch (err) {
      setIsGenerating(false);
      console.error(err);
      toast.error(err.message || "Failed to generate hairstyles. Please try again.");
    } finally {
      clearInterval(etaInterval);
    }
  };

  const handleDownloadAll = async () => {
    const successImages = resultImages.filter(r => r.status === 'success');
    for (let i = 0; i < successImages.length; i++) {
      const img = successImages[i];
      const link = document.createElement('a');
      link.href = img.result;
      link.download = `glamai_${img.styleName}_${img.colorName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (i < successImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setResultImages([]);
    setActiveResultIndex(0);
    setShowUpsellBox(false);
  };


  const activeCategories = selectedGender === 'female' ? FEMALE_CATEGORIES : MALE_CATEGORIES;

  const filteredHairstyles = HAIRSTYLES.filter(h =>
    h.isSpecial ||
    (h.gender === selectedGender &&
      (selectedCategory === 'All' || h.category === selectedCategory))
  );

  return (
    <section className="playground-section container">
      {/* Mobile-only header, rendered on top of the layout on mobile */}
      <div className="mobile-playground-header">
        <h2 className="section-title">
          <Scissors size={20} color="var(--color-pink-primary)" />
          <span>AI Hairstyle Customizer</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Select your desired hair template and color. Every generation uses 10 tokens.
        </p>
      </div>

      <div className="playground-grid">
        {/* Left Side: Customizer Controls */}
        <div className="control-panel glass-panel">
          <div className="desktop-playground-header">
            <h2 className="section-title">
              <Scissors size={20} color="var(--color-pink-primary)" />
              <span>AI Hairstyle Customizer</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Select your desired hair template and color. Every generation uses 10 tokens.
            </p>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }} />

          {/* COLLECTION selection */}
          <div className="selector-group">
            <span className="selector-title">COLLECTION</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {GENDERS.map(g => (
                <button
                  key={g.id}
                  className={`btn ${selectedGender === g.id ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={selectedGender === g.id}
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

          {/* SMART PRESETS */}
          <div className="selector-group">
            <span className="selector-title">⚡ QUICK PRESETS</span>
            <div className="smart-presets-row">
              {PRESETS.map(preset => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    className={`preset-chip ${isActive ? 'active' : ''}`}
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CATEGORY filter */}
          <div className="selector-group">
            <span className="selector-title">HAIRSTYLE CATEGORY</span>
            <div className="category-chips">
              {activeCategories.map(cat => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  aria-pressed={selectedCategory === cat}
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
            <span className="selector-title">HAIRSTYLE TEMPLATE ({filteredHairstyles.length})</span>
            {image && selectedStyles.every(s => s === 'no_change') && (
              <div className="onboarding-hint">
                <TrendingUp size={15} />
                <span>👆 Select a style template below to begin customizer render!</span>
              </div>
            )}
            <div className="style-cards-grid">
              {filteredHairstyles.map(h => {
                const isSelected = selectedStyles.includes(h.id);
                return (
                  <button
                    type="button"
                    key={h.id}
                    className={`style-card ${h.isSpecial ? 'no-change-card' : ''} ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    aria-label={`Select style: ${h.name}`}
                    onClick={() => handleSelectStyle(h.id)}
                    style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer', display: 'block', width: '100%' }}
                  >
                    {isSelected && (
                      <div className="selected-badge">
                        {h.id === 'no_change' ? <Check size={12} /> : (selectedStyles.indexOf(h.id) + 1)}
                      </div>
                    )}
                    {!h.isSpecial && POPULAR_STYLE_IDS.includes(h.id) && !isSelected && (
                      <div className="style-card-popular-badge">Popular</div>
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
                        <img src={h.image} className="style-card-image" alt={h.name} loading="lazy" decoding="async" />
                      )}
                    </div>
                    <div className="style-card-footer">
                      {h.name}
                    </div>
                  </button>

                );
              })}
            </div>
          </div>

          {/* Color Shade selection */}
          <div className="selector-group">
            <span className="selector-title">COLOR SHADE SELECTION</span>
            <div className="color-grid-4col">
              {COLORS.map(c => (
                <button
                  type="button"
                  key={c.id}
                  title={c.name}
                  className={`color-grid-item ${selectedColor === c.id ? 'selected' : ''}`}
                  aria-pressed={selectedColor === c.id}
                  aria-label={`Select color shade: ${c.name}`}
                  onClick={() => setSelectedColor(c.id)}
                >
                  {c.hot && <span className="color-grid-hot">HOT</span>}
                  <span
                    className="color-grid-dot"
                    style={{ background: c.hex }}
                  />
                  <span className="color-grid-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <div style={{ marginBottom: '0.85rem', padding: '0.75rem 0.85rem', borderRadius: '12px', border: '1px solid rgba(255,46,147,0.14)', background: 'rgba(255,46,147,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {isGuest ? `Free credits left: ${guestTokens ?? 0}` : `Credits left: ${user?.tokens ?? 0}`}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-pink-primary)', fontWeight: 700 }}>
                  This render: {selectedStyles.length * 10}
                </span>
              </div>
              {(isGuest || (user?.tokens ?? 0) < selectedStyles.length * 10) && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: '0.6rem', width: '100%', padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => setActiveTab('pricing')}
                >
                  Get more credits
                </button>
              )}
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.9rem' }}
              disabled={!image || isGenerating}
              onClick={() => { handleGenerate(); scrollToPreview(); }}
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
        <div className="preview-panel glass-panel" ref={previewPanelRef}>
          {isGenerating && resultImages.length <= 1 && (
            <div className="loading-overlay">
              <div className="spinner-outer">
                <div className="spinner-inner"></div>
              </div>
              
              <div className="eta-badge">
                <span>⏱️ Estimated time remaining: {etaRemaining}s</span>
              </div>

              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="progress-steps">
                {PROGRESS_STEPS.map((step, idx) => {
                  const isActive = Math.floor(progress / 17) === idx;
                  const isDone = Math.floor(progress / 17) > idx;
                  return (
                    <div key={idx} className={`progress-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                      <div className="step-dot"></div>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>

              <span className="loading-text">{loadingText}</span>
              <span className="loading-subtext">{progress}% Completed</span>
            </div>
          )}

          {!image ? (
            <div style={{ width: '100%' }}>
              {/* Empty State: File Upload */}
              <div 
                className="dropzone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="presentation"
                aria-label="Upload photo area"
              >
                <div className="dropzone-icon">
                  <Upload size={24} />
                </div>
                <h3>Upload Your Portrait</h3>
                <p>Take a selfie or upload a front-facing photo.</p>
                <div className="dropzone-actions">
                  <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); triggerCamera(); }}>
                    <Camera size={16} />
                    <span>Take Photo</span>
                  </button>
                  <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); triggerUpload(); }}>
                    <Upload size={16} />
                    <span>Upload File</span>
                  </button>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="file-input" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  className="file-input"
                  accept="image/*"
                  capture="user"
                  onChange={handleCameraCapture}
                />
              </div>

              {/* Horizontal Social Proof Cases */}
              <div className="social-proof-scroll">
                <div className="social-proof-card">
                  <span className="social-proof-stars">★★★★★</span>
                  <span className="social-proof-name">Julia K.</span>
                  <span className="social-proof-style">Bob / Caramel</span>
                  <p className="social-proof-text">"Matches my face shape perfectly! Saved me from a bad salon decision."</p>
                </div>
                <div className="social-proof-card">
                  <span className="social-proof-stars">★★★★★</span>
                  <span className="social-proof-name">Alex M.</span>
                  <span className="social-proof-style">French Crop / Blonde</span>
                  <p className="social-proof-text">"Fast, high quality, and looks very natural. Recommending to my friends!"</p>
                </div>
                <div className="social-proof-card">
                  <span className="social-proof-stars">★★★★★</span>
                  <span className="social-proof-name">Sarah L.</span>
                  <span className="social-proof-style">Wavy / Ash Blonde</span>
                  <p className="social-proof-text">"Love the interactive comparison slider. Excellent accuracy."</p>
                </div>
                <div className="social-proof-card">
                  <span className="social-proof-stars">★★★★★</span>
                  <span className="social-proof-name">Daniel T.</span>
                  <span className="social-proof-style">Buzz Cut / Titanium</span>
                  <p className="social-proof-text">"Insanely realistic render. Worth every token!"</p>
                </div>
              </div>

              {/* Privacy Trust Badge */}
              <div className="privacy-trust-badge" style={{ justifyContent: 'center' }}>
                <span>🔒 Your photo is fully secure. Auto-deleted within 1 hour.</span>
              </div>
            </div>
          ) : (
            /* Active State: Preview & Result */
            resultImages.length > 1 ? (
              <div style={{ width: '100%' }}>
                <div className="generation-grid">
                  {resultImages.map((res, index) => {
                    const isItemGenerating = res.status === 'generating';
                    const isItemSuccess = res.status === 'success';
                    const isItemPending = res.status === 'pending';
                    const isItemError = res.status === 'error';

                    return (
                      <div key={res.id} className="generation-card">
                        <div className="generation-card-badge">
                          {res.styleName}
                        </div>

                        <div className={`generation-card-status-badge ${res.status}`}>
                          {res.status === 'generating' ? 'rendering' : res.status}
                        </div>

                        <div className="generation-card-image-wrapper">
                          {isItemSuccess ? (
                            <img
                              src={res.result}
                              alt={res.styleName}
                              className="generation-card-image"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setLightboxImage(res.result);
                                setLightboxTitle(`${res.styleName} (${res.colorName})`);
                              }}
                            />
                          ) : (
                            <img
                              src={image}
                              alt="Original"
                              className="generation-card-image"
                              style={{
                                filter: isItemPending ? 'grayscale(0.5) blur(1px)' : 'none',
                                opacity: isItemPending ? 0.6 : 1
                              }}
                            />
                          )}

                          {isItemGenerating && (
                            <div className="generation-card-overlay">
                              <div className="generation-card-spinner"></div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-pink-primary)' }}>Rendering...</span>
                              <div className="progress-track" style={{ height: '4px', width: '80%', marginTop: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div className="progress-bar" style={{ width: `${progress}%`, height: '100%', background: 'var(--color-pink-primary)' }}></div>
                              </div>
                              <span className="generation-card-progress">{progress}%</span>
                            </div>
                          )}

                          {isItemPending && (
                            <div className="generation-card-overlay" style={{ background: 'rgba(0,0,0,0.6)' }}>
                              <RefreshCw size={24} className="animate-spin-slow" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Waiting...</span>
                            </div>
                          )}

                          {isItemError && (
                            <div className="generation-card-overlay" style={{ background: 'rgba(30,10,10,0.8)' }}>
                              <span style={{ color: '#ff4d4d', fontSize: '0.75rem', fontWeight: 600 }}>Failed</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', marginTop: '4px', maxWidth: '90%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {res.error || 'AI Server Error'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="generation-card-footer">
                          <div className="generation-card-info">
                            <span className="generation-card-title">{res.styleName}</span>
                            <span className="generation-card-subtitle">{res.colorName}</span>
                          </div>

                          {isItemSuccess && (
                            <div className="generation-card-actions">
                              <a
                                href={res.result}
                                download={`glamai_${res.styleName}_${res.colorName}.png`}
                                className="generation-card-btn"
                                title="Download HD Render"
                              >
                                <Download size={14} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="preview-controls" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  {resultImages.some(r => r.status === 'success') && (
                    <button
                      className="btn btn-primary"
                      onClick={handleDownloadAll}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Download size={16} />
                      <span>Download All</span>
                    </button>
                  )}
                  {!isGenerating && (
                    <button className="btn btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={16} />
                      <span>Try Another Batch</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                {resultImage ? (
                  <div style={{ width: '100%' }}>
                    <SliderComparison
                      beforeSrc={image}
                      afterSrc={resultImage}
                      title={(resultImages[activeResultIndex]?.styleName === 'No Change' ? resultImages[activeResultIndex]?.colorName : resultImages[activeResultIndex]?.styleName) || 'hairstyle'}
                      onShare={() => {
                        handleShare(resultImage);
                        triggerAchievement('share_result');
                      }}
                      onDownload={() => {
                        triggerAchievement('first_save');
                      }}
                      colorFilter={colorFilterStyle}
                    />

                    {/* 👍/👎 Feedback Panel */}
                    {!feedbackSubmitted ? (
                      <div className="feedback-panel">
                        <span className="feedback-title">Did you like the result?</span>
                        <div className="feedback-buttons">
                          <button
                            type="button"
                            className={`feedback-btn positive ${feedback === 'like' ? 'active' : ''}`}
                            onClick={() => handleFeedback('like')}
                          >
                            👍 Yes
                          </button>
                          <button
                            type="button"
                            className={`feedback-btn negative ${feedback === 'dislike' ? 'active' : ''}`}
                            onClick={() => handleFeedback('dislike')}
                          >
                            👎 No
                          </button>
                        </div>
                        {feedback === 'dislike' && (
                          <div className="feedback-reasons">
                            {[
                              "Style didn't fit",
                              "Poor image quality",
                              "Expected something else"
                            ].map(reason => (
                              <button
                                type="button"
                                key={reason}
                                className="feedback-reason-btn"
                                onClick={() => handleFeedbackReason(reason)}
                              >
                                {reason}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="feedback-panel">
                        <span className="feedback-thanks">Thank you for your feedback! ❤️</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="preview-container" style={{ maxWidth: '450px', margin: '0 auto' }}>
                      <img 
                        src={image} 
                        alt="Hairstyle Preview"
                      />
                      {!isGenerating && (
                        <button className="delete-preview-btn" onClick={handleReset} title="Remove image">
                          <RefreshCw size={16} />
                        </button>
                      )}
                    </div>
                    
                    {!isGenerating && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1.25rem', gap: '0.6rem', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); triggerCamera(); }} style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}>
                            <Camera size={14} style={{ marginRight: '0.25rem' }} />
                            <span>Retake Photo</span>
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); triggerUpload(); }} style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}>
                            <Upload size={14} style={{ marginRight: '0.25rem' }} />
                            <span>Change Photo</span>
                          </button>
                        </div>
                        
                        <div className="privacy-trust-badge" style={{ margin: 0 }}>
                          <span>🔒 Photo automatically deleted in 1 hour.</span>
                        </div>
                        <button type="button" className="btn btn-secondary" onClick={handleReset} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.2)' }}>
                          Delete Photo Now
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {resultImages.length > 0 && (
                  <div className="batch-thumbnails-container">
                    <div className="batch-thumbnails-title">
                      Generated Styles ({resultImages.length})
                    </div>
                    <div className="batch-thumbnails-grid">
                      {resultImages.map((res, index) => {
                        const isActive = index === activeResultIndex;
                        const thumbColorFilter = {};
                        if (res.colorFilter) {
                          thumbColorFilter.filter = `hue-rotate(${res.colorFilter.hue}deg) saturate(${res.colorFilter.saturate}%) brightness(${res.colorFilter.brightness}%)`;
                        }
                        return (
                          <div
                            key={res.id}
                            className={`batch-thumbnail-wrapper ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveResultIndex(index)}
                          >
                            {res.status === 'success' ? (
                              <img
                                src={res.result}
                                alt={res.styleName}
                                style={thumbColorFilter}
                                className="batch-thumbnail-img"
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                <RefreshCw size={16} className={res.status === 'generating' ? 'animate-spin' : ''} style={{ color: 'var(--text-muted)' }} />
                              </div>
                            )}
                            <span className="batch-thumbnail-label">
                              {res.styleName === 'No Change' ? res.colorName : res.styleName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="preview-controls">
                  {resultImage ? (
                    <button type="button" className="btn btn-secondary" onClick={handleReset} style={{ margin: '0 auto' }}>
                      <RefreshCw size={16} />
                      <span>Try another style</span>
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <HelpCircle size={12} />
                      <span>Ready to render. Click the 'Render AI Hairstyle' button on the left.</span>
                    </div>
                  )}
                </div>
                {showUpsellBox && (
                  <div style={{ marginTop: '1rem', border: '1px solid rgba(255,46,147,0.2)', background: 'rgba(255,46,147,0.04)', borderRadius: '14px', padding: '0.9rem' }}>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', lineHeight: 1.5 }}>
                      {isGuest
                        ? 'Like your result? Unlock multi-style batches, HD exports, and faster generation.'
                        : 'Keep creating without interruptions. Upgrade now to avoid running out of credits.'}
                    </p>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '0.7rem 0.9rem' }} onClick={openPricingWithRecommendation}>
                      View recommended plan
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
      {lightboxImage && (
        <div 
          className="lightbox-overlay" 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '2rem'
          }}
        >
          <div 
            style={{ 
              position: 'relative', 
              maxWidth: '90%', 
              maxHeight: '80%', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={lightboxImage} 
              alt={lightboxTitle} 
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '1rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(5px)'
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{lightboxTitle}</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generated by GlamAI</p>
              </div>
              <a 
                href={lightboxImage} 
                download={`glamai_${lightboxTitle}.png`}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                <Download size={14} />
                <span>Download</span>
              </a>
            </div>
            <button 
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Quick Start Modal */}
      {showQuickStart && (
        <div className="modal-backdrop" onClick={() => setShowQuickStart(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setShowQuickStart(false)} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 850, background: 'var(--gradient-pink-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                ⚡ Quick Start
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Select one of the top styles to render instantly!
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(selectedGender === 'female' ? TOP_STYLES.female : TOP_STYLES.male).map(id => HAIRSTYLES.find(h => h.id === id)).filter(Boolean).map(h => (
                <button
                  type="button"
                  key={h.id}
                  className="style-card"
                  onClick={() => handleQuickStartSelect(h.id)}
                  style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'center' }}
                >
                  <div className="style-card-image-wrapper" style={{ height: '90px' }}>
                    <img src={h.image} className="style-card-image" alt={h.name} style={{ height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="style-card-footer" style={{ fontSize: '0.7rem', padding: '0.4rem 0.2rem' }}>
                    {h.name}
                  </div>
                </button>
              ))}
            </div>
            
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.7rem' }}
              onClick={() => setShowQuickStart(false)}
            >
              Customize manually
            </button>
          </div>
        </div>
      )}

      {/* Mobile Fixed CTA */}
      {image && !isGenerating && showFixedCta && (
        <div className="mobile-generate-cta">
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => { handleGenerate(); scrollToPreview(); }}
          >
            <Sparkles size={18} style={{ marginRight: '0.5rem' }} />
            <span>Render AI Hairstyle</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '0.25rem' }}>
              (-{selectedStyles.length * 10} Tokens)
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
