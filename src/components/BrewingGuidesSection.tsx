import React, { useState, useEffect, useRef } from 'react';
import { Currency, CartItem, ProductItem } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { PRODUCT_ITEMS } from '../data/coffeeData';
import {
  Coffee,
  Sparkles,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Flame,
  Droplets,
  Package,
  Plus,
  Volume2,
  VolumeX,
  Layers,
  Thermometer,
  ShieldCheck,
  Zap,
  Info,
  Lightbulb,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BrewingGuidesSectionProps {
  currency?: Currency;
  onAddToCart?: (item: CartItem) => void;
  onOpenProductModal?: (item: ProductItem) => void;
}

interface RecipeStep {
  stepNumber: number;
  title: string;
  vietnameseTitle: string;
  durationSeconds?: number;
  shortInstruction: string;
  detailedInstruction: string;
  proTip: string;
  iconType: 'prep' | 'bloom' | 'drip' | 'whisk' | 'layer' | 'ice';
  visualHint: string;
}

interface BrewingGuide {
  id: 'phin-sua-da' | 'egg-coffee' | 'sea-salt' | 'coconut-coffee';
  name: string;
  vietnameseName: string;
  subtitle: string;
  origin: string;
  difficulty: 'Easy' | 'Intermediate' | 'Artisan Craft';
  prepTime: string;
  brewTime: string;
  temperature: string;
  recommendedProductSlug: string;
  headerImage: string;
  equipment: string[];
  ingredients: { item: string; amount: string; note?: string }[];
  steps: RecipeStep[];
}

// Chime generator using Web Audio API
const playCompletionChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play warm dual-tone chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    // Ignore audio errors if context is blocked
    console.debug('Web audio tone prevented or unsupported', e);
  }
};

const BREWING_GUIDES: BrewingGuide[] = [
  {
    id: 'phin-sua-da',
    name: 'Traditional Iced Phin Coffee (Cà Phê Sữa Đá)',
    vietnameseName: 'Cà Phê Sữa Đá Pha Phin Truyền Thống',
    subtitle: 'The timeless Saigon street ritual: slow gravity drip over rich sweetened condensed milk and crushed ice.',
    origin: 'Saigon, South Vietnam (1950s)',
    difficulty: 'Easy',
    prepTime: '2 mins',
    brewTime: '5 mins',
    temperature: '92°C - 96°C (Just off the boil)',
    recommendedProductSlug: 'saigon-heritage-phin-powder',
    headerImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1000&q=80',
    equipment: [
      '1x Authentic Stainless Steel Vietnamese Phin Filter (6oz / 180ml)',
      '1x Heat-resistant glass tumbler',
      '1x Kettle with 94°C hot water',
      '1x Stirring spoon',
    ],
    ingredients: [
      { item: 'Vietnamese Ground Coffee (Phin Coarse Grind)', amount: '20g - 25g (approx. 2-3 heaped tbsp)' },
      { item: 'Sweetened Condensed Milk (e.g. Lon Sữa Đặc)', amount: '2 - 3 tbsp (30ml - 45ml)', note: 'Adjust to your sweet tooth' },
      { item: 'Fresh Boiling Water (94°C)', amount: '120ml total (20ml bloom + 100ml brew)' },
      { item: 'Dense Crushed Ice Cubes', amount: '1 full glass' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Prep Glass & Condensed Milk Layer',
        vietnameseTitle: 'Chuẩn Bị Sữa Đặc & Ly',
        shortInstruction: 'Spoon 2 to 3 tablespoons of sweetened condensed milk directly into the bottom of a transparent glass.',
        detailedInstruction: 'Pour 2–3 tbsp of condensed milk into the bottom of your clear glass. Warm the stainless steel Phin chamber by giving it a quick rinse with hot water, then set the perforated filter base atop the rim of the glass.',
        proTip: 'Warming your metal Phin beforehand prevents thermal shock and ensures optimal extraction temperature throughout the drip.',
        iconType: 'prep',
        visualHint: 'Golden layer of thick condensed milk resting in glass base',
      },
      {
        stepNumber: 2,
        title: 'Dose Coffee & Level the Bed',
        vietnameseTitle: 'Cho Cà Phê & Đặt Đĩa Nén',
        shortInstruction: 'Add 20g of coarse Phin-ground coffee into the Phin chamber and place the gravity damper screen on top.',
        detailedInstruction: 'Add 20g (about 2.5 rounded tablespoons) of coarse Phin powder into the metal chamber. Give it a gentle tap to level the dry bed, then place the gravity press (damper disk) on top. Press down lightly—do NOT compact too firmly, or water cannot permeate.',
        proTip: 'If your damper disk screws down, turn it until snug, then back it off a quarter-turn. If it is a gravity press, let gravity do the work.',
        iconType: 'prep',
        visualHint: 'Even flat bed of dark roast coffee powder topped by stainless damper',
      },
      {
        stepNumber: 3,
        title: 'The 45-Second Hydraulic Bloom (Ủ Cà Phê)',
        vietnameseTitle: 'Ủ Cà Phê Nở Đều (45 Giây)',
        durationSeconds: 45,
        shortInstruction: 'Pour 20ml of 94°C water over the damper to saturate the grounds and awaken the oils.',
        detailedInstruction: 'Carefully pour just 20ml of 94°C hot water directly onto the damper plate. Let the grounds absorb the water and expand (bloom) for 45 seconds without adding any more water. This releases trapped CO2 and blooms the aromatic caramelized cacao notes.',
        proTip: 'Never skip the bloom! Skipping this step leads to watery, under-extracted coffee with harsh bitterness instead of velvety fudge undertones.',
        iconType: 'bloom',
        visualHint: 'Grounds bubbling and expanding under the steam of hot water',
      },
      {
        stepNumber: 4,
        title: 'Slow Gravity Extraction (40–45 Drops/Min)',
        vietnameseTitle: 'Chiết Xuất Nhỏ Giọt Chậm',
        durationSeconds: 270, // 4.5 minutes
        shortInstruction: 'Fill the Phin chamber to the rim with 100ml hot water, cover with the lid, and watch the slow drip.',
        detailedInstruction: 'Gently pour 100ml of hot water into the Phin until full. Place the stainless lid on top to trap steam. The coffee should begin to drip at a steady cadence of 40 to 45 drops per minute. Total extraction should take between 4 to 5 minutes.',
        proTip: 'If it drips like a stream (too fast), grind finer or press damper slightly firmer. If it stops dripping (clogged), loosen the press.',
        iconType: 'drip',
        visualHint: 'Steady single drops falling in rhythm over the condensed milk',
      },
      {
        stepNumber: 5,
        title: 'Stir, Pour Over Crushed Ice & Enjoy',
        vietnameseTitle: 'Khuấy Đều & Thưởng Thức Cùng Đá',
        shortInstruction: 'Remove the Phin, stir the dark espresso into the milk until creamy caramel, and pour over ice.',
        detailedInstruction: 'Once the Phin stops dripping, invert the lid and use it as a coaster for the dripper. Use a long spoon to vigorously stir the dark coffee concentrate with the sweet condensed milk until silky and golden tan. Fill with crushed ice cubes and savor!',
        proTip: 'For the authentic sidewalk experience, use small solid ice cubes that melt slowly, preserving the bold coffee strength.',
        iconType: 'ice',
        visualHint: 'Silky caramel swirl iced coffee glistening with ice crystals',
      },
    ],
  },
  {
    id: 'egg-coffee',
    name: 'Hà Nội Golden Egg Custard Coffee (Cà Phê Trứng)',
    vietnameseName: 'Cà Phê Trứng Phố Cổ Hà Nội (Công Thức 1946)',
    subtitle: 'The legendary Old Quarter invention: dark piping-hot Phin coffee topped with an airy, cloud-like whipped egg yolk sabayon.',
    origin: 'Hà Nội Old Quarter (Giảng Café, 1946)',
    difficulty: 'Artisan Craft',
    prepTime: '5 mins',
    brewTime: '5 mins',
    temperature: '94°C Hot Black Coffee + Warm Bain-Marie Bath',
    recommendedProductSlug: 'hanoi-egg-coffee-heritage-ground-powder',
    headerImage: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1000&q=80',
    equipment: [
      '1x Electric hand whisk / milk frother or wire balloon whisk',
      '1x Deep mixing bowl (for whipping sabayon)',
      '1x Stainless Steel Phin Dripper',
      '1x Small transparent glass cup',
      '1x Shallow wide bowl filled with hot water (Bain-Marie warming bath)',
    ],
    ingredients: [
      { item: 'Fresh Farm Egg Yolks (Free-range/Pasteurized)', amount: '2 large egg yolks', note: 'Discard egg whites completely' },
      { item: 'Sweetened Condensed Milk', amount: '2 tbsp (30ml)' },
      { item: 'Wildflower Honey or Pure Vanilla Extract', amount: '1 tsp honey + 2 drops vanilla', note: 'Eliminates any raw egg aroma' },
      { item: 'Dark Roasted Ground Coffee (Hanoi Dark Roast)', amount: '20g (brewed into 60ml hot black coffee)' },
      { item: 'Fresh Boiling Water', amount: '80ml' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Separate Yolks & Add Sweeteners',
        vietnameseTitle: 'Tách Lòng Đỏ & Thêm Sữa Đặc, Mật Ong',
        shortInstruction: 'Carefully separate 2 fresh egg yolks into a clean mixing bowl and add condensed milk, honey & vanilla.',
        detailedInstruction: 'Ensure zero egg white remains. Place the 2 egg yolks in a deep glass or ceramic bowl. Add 2 tbsp sweetened condensed milk, 1 tsp honey, and 2 drops of vanilla extract. The honey and vanilla soften the egg yolk and create a dessert-like perfume.',
        proTip: 'Use eggs at room temperature! Cold eggs take much longer to froth and achieve less volume.',
        iconType: 'prep',
        visualHint: 'Bright yellow egg yolks with glistening honey and condensed milk',
      },
      {
        stepNumber: 2,
        title: 'High-Speed Whipping into Sabayon Cloud',
        vietnameseTitle: 'Đánh Bọt Kem Trứng Bông Xốp (3 Phút)',
        durationSeconds: 180, // 3 mins
        shortInstruction: 'Whisk vigorously on high speed for 3 to 4 minutes until the mixture turns pale ivory, silky, and triples in volume.',
        detailedInstruction: 'Use an electric hand mixer or frother on high speed. Whisk continuously for 3 to 4 minutes. Watch the color transform from deep orange-yellow to pale custard ivory. The foam is ready when it forms soft, velvety ribbons that hold shape for several seconds.',
        proTip: 'Test readiness by dropping a spoonful into plain water. If the foam floats on top without dissolving, your egg cream is perfection!',
        iconType: 'whisk',
        visualHint: 'Thick, glossy, pale-yellow sabayon cream holding ribbon trails',
      },
      {
        stepNumber: 3,
        title: 'Brew the Dark Concentrated Coffee Base',
        vietnameseTitle: 'Pha Cà Phê Phin Đen Đậm Đặc',
        durationSeconds: 240, // 4 mins
        shortInstruction: 'Drip a piping-hot, concentrated 60ml shot of Hanoi dark roast coffee through your Phin directly into your glass.',
        detailedInstruction: 'While your whipped cream rests, brew a strong, dark 60ml shot of coffee using your Phin filter with 20g of dark roast powder. The coffee must be piping hot (90°C+) to lightly cook the bottom of the egg sabayon when layered.',
        proTip: 'Do not add any milk to the coffee base here; the whipped egg cream above provides all the luscious sweetness.',
        iconType: 'drip',
        visualHint: 'Pitch-black smoky coffee dripping into the base of a small glass',
      },
      {
        stepNumber: 4,
        title: 'Spoon the Sabayon Layer atop Coffee',
        vietnameseTitle: 'Rót Lớp Kem Trứng Lên Mặt Cà Phê',
        shortInstruction: 'Gently float the thick whipped egg cream over the hot coffee, creating a dramatic 50/50 two-tone dessert.',
        detailedInstruction: 'Holding a spoon inverted against the inner edge of the glass, gently pour and ladle the fluffy egg sabayon on top of the black coffee. Because the whipped foam is so light, it floats seamlessly atop the coffee, creating a gorgeous two-tier golden crown.',
        proTip: 'Optional: Dust a pinch of raw dark cacao powder or cinnamon on top for an authentic Hanoi cafe aesthetic.',
        iconType: 'layer',
        visualHint: 'Crisp distinct boundary between pitch black coffee and golden custard cream',
      },
      {
        stepNumber: 5,
        title: 'The Hot Water Bath (Bain-Marie Ritual)',
        vietnameseTitle: 'Đặt Vào Bát Nước Nóng Giữ Ấm',
        durationSeconds: 120, // 2 min warming
        shortInstruction: 'Place the glass cup inside a shallow bowl filled with steaming hot water to keep the drink warm while sipping.',
        detailedInstruction: 'In Hanoi’s Old Quarter, Egg Coffee is served resting inside a shallow bowl filled with hot water. This bain-marie bath keeps the egg custard warm, airy, and silky until the final drop. Scoop the egg cream with a spoon first, then sip the dark coffee through the cream!',
        proTip: 'How to drink: First taste a spoonful of the warm egg cream like a dessert, then take a deep sip letting the hot bitter coffee pierce through the sweet foam.',
        iconType: 'ice',
        visualHint: 'Glass resting in hot steaming water bowl with spoon resting across rim',
      },
    ],
  },
  {
    id: 'sea-salt',
    name: 'Huế Imperial Sea Salted Coffee (Cà Phê Muối)',
    vietnameseName: 'Cà Phê Muối Xứ Huế Hoàng Cung',
    subtitle: 'The imperial Central Vietnam innovation: mineral Thuận An sea salt whipped into dairy cream atop slow-dripped Robusta.',
    origin: 'Huế Imperial Citadel, Central Vietnam (2010s)',
    difficulty: 'Intermediate',
    prepTime: '3 mins',
    brewTime: '4 mins',
    temperature: '94°C Phin Drip + Chilled Salted Velvet Cream',
    recommendedProductSlug: 'hue-sea-salted-caramel-phin-powder',
    headerImage: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=1000&q=80',
    equipment: [
      '1x Milk frother or small whisk',
      '1x Stainless Steel Phin Dripper',
      '1x Clear Rocks Glass',
    ],
    ingredients: [
      { item: 'Whipping Cream / Heavy Cream', amount: '50ml (chilled)' },
      { item: 'Sweetened Condensed Milk', amount: '1.5 tbsp (20ml)' },
      { item: 'Fine Sea Salt (preferably mineral pink or Thuận An salt)', amount: '1/4 tsp (approx. 1g)' },
      { item: 'Dark Roast Coffee Powder', amount: '20g' },
      { item: 'Crushed Ice Cubes', amount: '1 cup' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Brew the Bold Phin Coffee Base',
        vietnameseTitle: 'Pha Cà Phê Phin Đậm Vị',
        durationSeconds: 270,
        shortInstruction: 'Drip 60ml of dark Robusta coffee through your Phin over 1 tablespoon of condensed milk in your glass.',
        detailedInstruction: 'Add 1 tbsp of condensed milk to the base of your glass. Place the Phin with 20g ground coffee on top, bloom for 45s with 20ml hot water, then fill with 80ml water to drip a rich, dark base.',
        proTip: 'The slight condensed milk layer at the bottom provides caramel balance to the savory salted foam above.',
        iconType: 'drip',
        visualHint: 'Rich dark coffee dripping over condensed milk',
      },
      {
        stepNumber: 2,
        title: 'Whip the Sea Salt Cream Cloud',
        vietnameseTitle: 'Đánh Lớp Kem Sữa Muối Béo Ngậy',
        durationSeconds: 90,
        shortInstruction: 'Froth heavy whipping cream, 1 tbsp condensed milk, and 1/4 tsp fine sea salt until silky soft peaks form.',
        detailedInstruction: 'Combine 50ml cold heavy whipping cream, 1 tbsp condensed milk, and 1/4 tsp mineral sea salt in a frothing pitcher. Froth with a handheld milk frother for 60 to 90 seconds until it thickens into velvety melted soft-serve consistency (not stiff whipped butter).',
        proTip: 'Do not over-whip! You want the salted cream to be pourable so it slowly blends into the dark coffee beneath as you drink.',
        iconType: 'whisk',
        visualHint: 'Silky salted cream dripping smoothly from frother whisk',
      },
      {
        stepNumber: 3,
        title: 'Add Ice & Float the Salted Velvet Foam',
        vietnameseTitle: 'Thêm Đá & Rót Lớp Kem Muối Lên Trên',
        shortInstruction: 'Add crushed ice into the brewed coffee, then gently pour the sea salt cream on top.',
        detailedInstruction: 'Stir the coffee base with the condensed milk, add ice cubes to within 1 inch of the rim, and pour your salted cream foam gently over the top. The salt chemically suppresses tongue bitterness, triggering bursts of dark chocolate fudge!',
        proTip: 'Do not stir before sipping. Drink directly from the rim so the cool salted cream hits your lips followed immediately by the warm/chilled dark coffee.',
        iconType: 'layer',
        visualHint: 'White salted cream cascading like a waterfall over iced dark coffee',
      },
    ],
  },
  {
    id: 'coconut-coffee',
    name: 'Đà Nẵng Tropical Coconut Coffee (Cà Phê Cốt Dừa)',
    vietnameseName: 'Cà Phê Cốt Dừa Đá Tuyết Đà Nẵng',
    subtitle: 'The coastal Vietnamese refresher: rich coconut cream blended with ice into a tropical slushie, topped with hot dark espresso.',
    origin: 'Đà Nẵng & Central Coast Vietnam',
    difficulty: 'Easy',
    prepTime: '4 mins',
    brewTime: '3 mins',
    temperature: 'Sub-zero Coconut Snow + Hot Drip Shot',
    recommendedProductSlug: 'danang-toasted-coconut-coffee-powder',
    headerImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    equipment: [
      '1x Countertop blender or nutribullet',
      '1x Stainless Steel Phin Dripper',
      '1x Tall glass tumbler',
    ],
    ingredients: [
      { item: 'Canned Coconut Cream or Rich Coconut Milk', amount: '60ml' },
      { item: 'Sweetened Condensed Milk', amount: '2 tbsp (30ml)' },
      { item: 'Dense Crushed Ice Cubes', amount: '1.5 cups (for slushie snow)' },
      { item: 'Fresh Brewed Phin Coffee (or Instant Espresso)', amount: '50ml (piping hot)' },
      { item: 'Toasted Coconut Flakes (optional garnish)', amount: '1 tbsp' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Brew 50ml Concentrated Black Coffee',
        vietnameseTitle: 'Pha Cốt Cà Phê Phin Đậm Đặc',
        durationSeconds: 240,
        shortInstruction: 'Drip a short, concentrated 50ml shot of Vietnamese Robusta coffee and set aside.',
        detailedInstruction: 'Brew a potent 50ml shot using your Phin or dissolve 1 instant dark roast sachet in 50ml boiling water. You need high coffee concentration to stand up to the luscious coconut cream.',
        proTip: 'A medium-dark roasted bean with natural toasted coconut or vanilla notes pairs best here.',
        iconType: 'drip',
        visualHint: 'Small shot glass of dark aromatic coffee concentrate',
      },
      {
        stepNumber: 2,
        title: 'Blend the Coconut Snow Slushie',
        vietnameseTitle: 'Xay Đá Tuyết Cốt Dừa Bến Tre',
        durationSeconds: 45,
        shortInstruction: 'Blend coconut cream, condensed milk, and crushed ice in a blender on high speed until smooth snow forms.',
        detailedInstruction: 'Add 60ml coconut cream, 2 tbsp condensed milk, and 1.5 cups of ice to your blender. Pulse and blend on high for 30–45 seconds until it forms a creamy, ultra-thick white slushie texture reminiscent of fine snow.',
        proTip: 'If too runny, add 3-4 more ice cubes. You want a thick mountain peak that holds its shape in the glass.',
        iconType: 'whisk',
        visualHint: 'Fluffy white coconut snow piling into a tall glass',
      },
      {
        stepNumber: 3,
        title: 'Pour Hot Coffee Over Coconut Snow & Garnish',
        vietnameseTitle: 'Rót Cà Phê Lên Núi Tuyết & Thưởng Thức',
        shortInstruction: 'Spoon the coconut snow into your glass, drizzle the hot coffee on top, and sprinkle toasted coconut chips.',
        detailedInstruction: 'Fill your tall glass with the coconut snow mound. Slowly pour the dark hot coffee right over the peak. The dark espresso creates stunning marbling through the white coconut slush. Garnish with crunchy toasted coconut chips.',
        proTip: 'Enjoy with a straw and spoon: scoop the coconut ice cream first, then sip the marbled iced latte below.',
        iconType: 'ice',
        visualHint: 'Marbled dark espresso swirls melting through brilliant white coconut slush',
      },
    ],
  },
];

export const BrewingGuidesSection: React.FC<BrewingGuidesSectionProps> = ({
  currency = 'INR',
  onAddToCart,
  onOpenProductModal,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<'phin-sua-da' | 'egg-coffee' | 'sea-salt' | 'coconut-coffee'>('phin-sua-da');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  
  // Timer State for current step
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({
    'phin-sua-da': [],
    'egg-coffee': [],
    'sea-salt': [],
    'coconut-coffee': [],
  });

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentGuide = BREWING_GUIDES.find((g) => g.id === selectedGuideId) || BREWING_GUIDES[0];
  const currentStep = currentGuide.steps[activeStepIndex] || currentGuide.steps[0];
  const totalSteps = currentGuide.steps.length;

  // Find recommended product for quick shop
  const recommendedProduct = PRODUCT_ITEMS.find((p) => p.id === currentGuide.recommendedProductSlug) || PRODUCT_ITEMS[0];

  // Initialize or reset timer when switching steps
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsTimerRunning(false);

    if (currentStep.durationSeconds) {
      setTimerSecondsLeft(currentStep.durationSeconds);
    } else {
      setTimerSecondsLeft(null);
    }
  }, [selectedGuideId, activeStepIndex]);

  // Handle countdown timer execution
  useEffect(() => {
    if (!isTimerRunning || timerSecondsLeft === null) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setIsTimerRunning(false);
          
          // Trigger Chime & Confetti
          if (soundEnabled) {
            playCompletionChime();
          }
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#feca4d', '#785a00', '#271310', '#fff8f6'],
          });

          // Mark current step as completed
          markStepCompleted(selectedGuideId, currentStep.stepNumber);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerSecondsLeft, soundEnabled, selectedGuideId, currentStep.stepNumber]);

  const markStepCompleted = (guideId: string, stepNum: number) => {
    setCompletedSteps((prev) => {
      const existing = prev[guideId] || [];
      if (existing.includes(stepNum)) return prev;
      return {
        ...prev,
        [guideId]: [...existing, stepNum],
      };
    });
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    if (currentStep.durationSeconds) {
      setTimerSecondsLeft(currentStep.durationSeconds);
    }
  };

  const handleNextStep = () => {
    markStepCompleted(selectedGuideId, currentStep.stepNumber);
    if (activeStepIndex < totalSteps - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      // Finished all steps
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#feca4d', '#785a00', '#271310', '#fff8f6'],
      });
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const formatTimerDigits = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickAddProduct = (item: ProductItem) => {
    if (onAddToCart) {
      onAddToCart({
        id: `${item.id}-${Date.now()}`,
        productId: item.id,
        name: item.name,
        vietnameseName: item.vietnameseName,
        unitPriceINR: item.basePriceINR,
        quantity: 1,
        imageUrl: item.imageUrl,
        selectedSize: item.availableSizes[0].size,
        selectedGrind: item.availableGrinds ? item.availableGrinds[0] : undefined,
        category: item.category,
      });
    }
  };

  return (
    <section id="brewing-guides-section" className="py-12 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Section Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#785a00] bg-[#feca4d]/15 px-3 py-1 rounded-full border border-[#feca4d]/30 inline-block mb-3">
          Master Barista Guides • Living Craft
        </span>
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#271310] tracking-tight leading-tight font-serif"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Authentic Vietnamese Brewing Guides
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#504442] leading-relaxed">
          Step-by-step visual instructions with <strong>interactive timing controls</strong> for making Vietnam's most iconic coffee rituals at home: the gravity-extracted Phin drip, 1946 Hanoi Egg Coffee sabayon, Hue mineral sea salt cream, and coastal coconut snow.
        </p>
      </div>

      {/* Recipe Selection Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
        {BREWING_GUIDES.map((guide) => {
          const isSelected = selectedGuideId === guide.id;
          const completedCount = completedSteps[guide.id]?.length || 0;
          const isAllDone = completedCount >= guide.steps.length;

          return (
            <button
              key={guide.id}
              id={`brewing-guide-tab-${guide.id}`}
              onClick={() => {
                setSelectedGuideId(guide.id);
                setActiveStepIndex(0);
              }}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#271310] text-white border-[#271310] shadow-md ring-2 ring-[#785a00]/40'
                  : 'bg-[#faf2f0] text-[#271310] border-[#d3c3c0]/60 hover:bg-[#eee3e1]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isSelected ? 'bg-white/15 text-[#feca4d]' : 'bg-[#785a00]/10 text-[#785a00]'
                }`}>
                  {guide.difficulty}
                </span>
                {isAllDone && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle className="w-3 h-3" /> Done
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs sm:text-sm font-bold font-serif leading-tight">
                  {guide.name}
                </p>
                <p className={`text-[11px] italic mt-0.5 truncate ${isSelected ? 'text-[#feca4d]' : 'text-[#827472]'}`}>
                  {guide.vietnameseName}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] opacity-80">
                <span>⏱ {guide.brewTime}</span>
                <span>{guide.steps.length} Steps</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Guide Card */}
      <div className="bg-[#faf2f0] border border-[#d3c3c0]/60 rounded-3xl overflow-hidden shadow-md mb-12">
        {/* Guide Overview Banner */}
        <div className="bg-[#271310] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#feca4d] bg-white/10 px-2.5 py-0.5 rounded-full">
                  {currentGuide.origin}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d3c3c0] bg-white/10 px-2.5 py-0.5 rounded-full">
                  Prep: {currentGuide.prepTime} • Brew: {currentGuide.brewTime}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#feca4d] bg-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-[#feca4d]" /> {currentGuide.temperature}
                </span>
              </div>

              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {currentGuide.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#d3c3c0] leading-relaxed max-w-2xl">
                {currentGuide.subtitle}
              </p>
            </div>

            {/* Quick Recommended Blend Shortcut */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#feca4d]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Recommended Coffee:
                </span>
                <span>{formatPrice(recommendedProduct.basePriceINR, currency as Currency)}</span>
              </div>
              <p className="text-xs font-semibold text-white line-clamp-1">
                {recommendedProduct.name}
              </p>
              <p className="text-[10px] text-[#d3c3c0] line-clamp-2">
                {recommendedProduct.tagline}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickAddProduct(recommendedProduct)}
                  className="flex-1 py-1.5 px-3 bg-[#feca4d] hover:bg-[#ffc229] text-[#271310] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Coffee (₹{recommendedProduct.basePriceINR})
                </button>
                {onOpenProductModal && (
                  <button
                    type="button"
                    onClick={() => onOpenProductModal(recommendedProduct)}
                    className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                    title="View details"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Equipment & Ingredients Specs Bar */}
        <div className="p-6 sm:p-8 border-b border-[#d3c3c0]/40 bg-[#f4ecea]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#785a00] flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-[#785a00]" /> Ingredients Required
              </h4>
              <ul className="space-y-1.5 text-xs text-[#271310]">
                {currentGuide.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start justify-between bg-white/80 p-2 rounded-lg border border-[#d3c3c0]/30">
                    <span className="font-semibold">{ing.item}</span>
                    <span className="text-[#785a00] font-bold ml-2 text-right">
                      {ing.amount}
                      {ing.note && <span className="block text-[9px] text-[#827472] font-normal">{ing.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipment Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#785a00] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#785a00]" /> Barista Equipment Needed
              </h4>
              <ul className="space-y-1.5 text-xs text-[#271310]">
                {currentGuide.equipment.map((eq, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-[#d3c3c0]/30">
                    <CheckCircle className="w-3.5 h-3.5 text-[#785a00] flex-shrink-0" />
                    <span>{eq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step-by-Step Interactive Workflow */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Step Navigation Pill Tracker */}
          <div className="flex items-center justify-between border-b border-[#d3c3c0]/40 pb-4 overflow-x-auto no-scrollbar gap-2">
            {currentGuide.steps.map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              const isDone = completedSteps[selectedGuideId]?.includes(step.stepNumber);

              return (
                <button
                  key={idx}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'bg-[#785a00] text-white shadow-sm font-bold'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-white text-[#504442] border border-[#d3c3c0]/60 hover:bg-[#eee3e1]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent ? 'bg-white text-[#785a00]' : isDone ? 'bg-emerald-600 text-white' : 'bg-[#e4d7d5] text-[#271310]'
                  }`}>
                    {isDone ? '✓' : step.stepNumber}
                  </span>
                  <span>Step {step.stepNumber}: {step.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Current Step Detailed Stage Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Instructions & Pro Tips (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[#785a00]">
                  Step {currentStep.stepNumber} of {totalSteps}
                </span>
                <span className="text-xs text-[#827472] italic font-medium">
                  {currentStep.vietnameseTitle}
                </span>
              </div>

              <h3
                className="text-2xl sm:text-3xl font-bold text-[#271310] font-serif"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {currentStep.title}
              </h3>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#d3c3c0]/60 shadow-xs space-y-3">
                <p className="text-sm font-semibold text-[#271310] leading-snug">
                  {currentStep.shortInstruction}
                </p>
                <p className="text-xs sm:text-sm text-[#504442] leading-relaxed">
                  {currentStep.detailedInstruction}
                </p>
              </div>

              {/* Barista Pro Tip */}
              <div className="bg-[#fff8e7] border-l-4 border-[#785a00] p-4 rounded-r-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#785a00]">
                  <Lightbulb className="w-4 h-4 text-[#785a00]" />
                  <span>Barista Masterclass Tip</span>
                </div>
                <p className="text-xs text-[#504442] leading-relaxed">
                  {currentStep.proTip}
                </p>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#d3c3c0]/40">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={activeStepIndex === 0}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeStepIndex === 0
                      ? 'text-[#a39492] cursor-not-allowed'
                      : 'bg-white border border-[#d3c3c0] text-[#271310] hover:bg-[#eee3e1]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Step
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl bg-[#785a00] hover:bg-[#8e6b00] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  {activeStepIndex === totalSteps - 1 ? (
                    <>
                      <span>Complete Recipe Ritual</span>
                      <CheckCircle className="w-4 h-4 text-[#feca4d]" />
                    </>
                  ) : (
                    <>
                      <span>Next Step ({activeStepIndex + 2}/{totalSteps})</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step Visual Graphic & Interactive Live Timer (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Interactive Countdown Timer (if step requires timing) */}
              {currentStep.durationSeconds ? (
                <div className="bg-[#271310] text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden space-y-4 border border-[#3d201c]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#feca4d]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#feca4d]">
                        Live Step Timer
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        soundEnabled ? 'text-[#feca4d] bg-white/10' : 'text-[#827472] bg-white/5'
                      }`}
                      title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Circular / Large Timer Display */}
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-[#feca4d]">
                      {timerSecondsLeft !== null ? formatTimerDigits(timerSecondsLeft) : '00:00'}
                    </div>
                    <span className="text-[11px] text-[#d3c3c0] mt-2 text-center">
                      {isTimerRunning
                        ? '⏳ Countdown in progress • Follow the visual guide'
                        : timerSecondsLeft === 0
                        ? '🎉 Timing complete! Proceed to the next step.'
                        : 'Ready to begin • Press Play'}
                    </span>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#785a00] to-[#feca4d] h-full transition-all duration-1000 rounded-full"
                        style={{
                          width: `${
                            timerSecondsLeft !== null && currentStep.durationSeconds
                              ? ((currentStep.durationSeconds - timerSecondsLeft) / currentStep.durationSeconds) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {isTimerRunning ? (
                      <button
                        type="button"
                        onClick={handlePauseTimer}
                        className="py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Pause className="w-4 h-4" /> Pause Timer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartTimer}
                        className="py-2.5 px-3 bg-[#feca4d] hover:bg-[#ffc229] text-[#271310] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Play className="w-4 h-4" /> Start Timer ({Math.ceil(currentStep.durationSeconds / 60)}m)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetTimer}
                      className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-[#d3c3c0] hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#271310] text-white rounded-2xl p-6 text-center space-y-2 border border-[#3d201c]">
                  <CheckCircle className="w-8 h-8 text-[#feca4d] mx-auto" />
                  <h5 className="text-sm font-bold font-serif">Action-Based Step</h5>
                  <p className="text-xs text-[#d3c3c0]">
                    This step requires manual assembly without a strict timer. Take your time to position your ingredients accurately.
                  </p>
                </div>
              )}

              {/* Visual Cue Card */}
              <div className="bg-white p-4 rounded-xl border border-[#d3c3c0]/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#271310]">
                  <Sparkles className="w-3.5 h-3.5 text-[#785a00]" />
                  <span>Visual Texture Target</span>
                </div>
                <p className="text-xs text-[#504442] italic">
                  "{currentStep.visualHint}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
