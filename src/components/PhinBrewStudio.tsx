import React, { useState, useEffect, useRef } from 'react';
import { Currency, CartItem, ProductItem } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { HeritageDivider } from './HeritageDivider';
import { PRODUCT_ITEMS } from '../data/coffeeData';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Coffee,
  Droplets,
  CheckCircle,
  Flame,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface PhinBrewStudioProps {
  currency: Currency;
  onAddToCart: (item: CartItem) => void;
  onOpenProductModal?: (item: ProductItem) => void;
}

export const PhinBrewStudio: React.FC<PhinBrewStudioProps> = ({
  currency,
  onAddToCart,
  onOpenProductModal,
}) => {
  // Brew Parameters State
  const [milkType, setMilkType] = useState<'condensed' | 'coconut' | 'none'>('condensed');
  const [milkSpoons, setMilkSpoons] = useState<number>(2); // 1, 2, 3 tbsp
  const [coffeeGrams, setCoffeeGrams] = useState<number>(20); // 18g - 25g
  const [beanOrigin, setBeanOrigin] = useState<'buon-ma-thuot' | 'da-lat' | 'heritage-blend'>('heritage-blend');
  const [pressTightness, setPressTightness] = useState<'gentle' | 'medium' | 'firm'>('medium');

  // Brewing Simulation Stages:
  // 0: Prep (Ingredients selected)
  // 1: Bloom (30s countdown, wetting grounds with 20ml water)
  // 2: Drip Extraction (Slow gravity drip 40-45 drops/min)
  // 3: Complete
  const [brewStep, setBrewStep] = useState<0 | 1 | 2 | 3>(0);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [bloomSeconds, setBloomSeconds] = useState<number>(30);
  const [extractionProgress, setExtractionProgress] = useState<number>(0); // 0 to 100%
  const [dropCounter, setDropCounter] = useState<number>(0);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Bloom countdown & Extraction timer
  useEffect(() => {
    if (!isBrewing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (brewStep === 1) {
      // Blooming phase
      timerRef.current = setInterval(() => {
        setBloomSeconds((prev) => {
          if (prev <= 1) {
            setBrewStep(2);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (brewStep === 2) {
      // Extraction phase
      timerRef.current = setInterval(() => {
        setDropCounter((d) => d + 1);
        setExtractionProgress((prev) => {
          if (prev >= 100) {
            setIsBrewing(false);
            setBrewStep(3);
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#c5a880', '#e5d7c3', '#140d09'],
              });
            } catch {
              // Ignore confetti errors if blocked
            }
            return 100;
          }
          const speed = pressTightness === 'firm' ? 1.5 : pressTightness === 'medium' ? 2.5 : 3.5;
          return Math.min(100, prev + speed);
        });
      }, 350);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBrewing, brewStep, pressTightness]);

  const handleStartBrew = () => {
    setBrewStep(1);
    setBloomSeconds(30);
    setExtractionProgress(0);
    setDropCounter(0);
    setIsBrewing(true);
  };

  const handlePauseBrew = () => {
    setIsBrewing(false);
  };

  const handleResumeBrew = () => {
    setIsBrewing(true);
  };

  const handleResetBrew = () => {
    setIsBrewing(false);
    setBrewStep(0);
    setBloomSeconds(30);
    setExtractionProgress(0);
    setDropCounter(0);
  };

  const handleAddStarterKitToCart = () => {
    const kitProduct =
      PRODUCT_ITEMS.find((p) => p.id === 'vietnamese-barista-starter-bundle') || PRODUCT_ITEMS[0];

    const cartItem: CartItem = {
      id: `kit-${Date.now()}`,
      productId: kitProduct.id,
      name: kitProduct.name,
      vietnameseName: kitProduct.vietnameseName,
      unitPriceINR: kitProduct.basePriceINR,
      quantity: 1,
      imageUrl: kitProduct.imageUrl,
      selectedSize: 'Gift Bundle Box',
      selectedGrind: 'Authentic Phin Grind (Coarse)',
      category: 'brewing-gear',
    };

    onAddToCart(cartItem);
  };

  const handleAddPhinPowderToCart = () => {
    const powder =
      PRODUCT_ITEMS.find((p) => p.id === 'saigon-heritage-phin-powder') || PRODUCT_ITEMS[0];

    const cartItem: CartItem = {
      id: `powder-${Date.now()}`,
      productId: powder.id,
      name: powder.name,
      vietnameseName: powder.vietnameseName,
      unitPriceINR: 380,
      quantity: 1,
      imageUrl: powder.imageUrl,
      selectedSize: '250g Valve Pouch',
      selectedGrind: 'Authentic Phin Grind (Coarse)',
      category: 'coffee-powder',
    };

    onAddToCart(cartItem);
  };

  return (
    <section id="phin-brew-studio" className="w-full max-w-6xl mx-auto py-16 px-4 sm:px-6 font-sans">
      {/* Editorial Luxury Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#c5a880] block mb-3">
          The Ritual of Stillness • Gravity Extraction
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#140d09] tracking-tight font-serif">
          Master the Phin Ritual
        </h2>
        <div className="w-12 h-px bg-[#c5a880]/60 mx-auto my-4" />
        <p className="text-xs sm:text-sm text-[#6e635d] font-light leading-relaxed max-w-lg mx-auto">
          No electricity, no paper filters. Pure hydraulic pre-infusion and slow gravity filtration yielding an unhurried, viscous cup with deep chocolate undertones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Interactive Brewing Stage & Physics Graphic (7 cols) */}
        <div className="lg:col-span-7 bg-[#fbf9f5] border border-[#c5a880]/30 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Stage Progress Header */}
          <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-4">
            <div>
              <span className="text-[9px] uppercase font-semibold text-[#c5a880] tracking-[0.2em] block mb-0.5">
                Phase {brewStep + 1} of 4
              </span>
              <h3 className="text-lg sm:text-xl font-normal text-[#140d09] font-serif">
                {brewStep === 0 && 'I. Dosing & Layering'}
                {brewStep === 1 && 'II. Hydraulic Pre-Infusion Bloom'}
                {brewStep === 2 && 'III. Gravity Extraction (~42 drops/min)'}
                {brewStep === 3 && 'IV. Viscous Golden Pour'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isBrewing ? (
                <button
                  onClick={handlePauseBrew}
                  className="p-2.5 rounded-full bg-[#140d09] text-[#fcfbf7] hover:bg-[#2b1f1a] transition-colors cursor-pointer"
                  title="Pause brew"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : brewStep > 0 && brewStep < 3 ? (
                <button
                  onClick={handleResumeBrew}
                  className="p-2.5 rounded-full bg-[#c5a880] text-[#140d09] hover:bg-[#b89a70] transition-colors cursor-pointer"
                  title="Resume brew"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              ) : null}

              {brewStep > 0 && (
                <button
                  onClick={handleResetBrew}
                  className="p-2.5 rounded-full bg-white border border-[#c5a880]/30 text-[#6e635d] hover:text-[#140d09] transition-colors cursor-pointer"
                  title="Reset ritual"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Visual Glass & Phin Dripper with Framer Motion */}
          <div className="bg-gradient-to-b from-[#18110b] to-[#0f0a07] rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden text-white shadow-inner border border-white/5">
            {/* Ambient gold glow during bloom/extraction */}
            <AnimatePresence>
              {isBrewing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.15, 0.35, 0.15] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-radial from-[#c5a880]/15 via-transparent to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Phin Stainless Steel Chamber Illustration */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Hot Steam Wisps during Bloom (Framer Motion) */}
              <AnimatePresence>
                {brewStep === 1 && isBrewing && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-12 flex justify-around pointer-events-none">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 10, opacity: 0, scale: 0.6 }}
                        animate={{
                          y: [-4, -28],
                          opacity: [0, 0.65, 0],
                          scale: [0.7, 1.2, 1.6],
                          x: [0, (i - 1) * 6, (i - 1) * 12],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          delay: i * 0.6,
                          ease: 'easeOut',
                        }}
                        className="w-1.5 h-6 bg-gradient-to-t from-white/30 to-white/0 rounded-full blur-[1px]"
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Phin Lid */}
              <div className="w-24 h-4 bg-gradient-to-r from-[#948b85] via-[#e5ded8] to-[#807671] rounded-t-sm shadow-sm border-b border-black/40" />
              
              {/* Phin Body Chamber */}
              <div className="w-20 h-16 bg-gradient-to-r from-[#7a706b] via-[#c5bcb6] to-[#69605b] relative flex flex-col items-center justify-center border-x border-black/40 overflow-hidden">
                {/* Coffee Grounds Bed with Hydraulic Swelling during Bloom */}
                <motion.div
                  className="absolute bottom-0 inset-x-0 bg-[#23120b] border-t border-[#4a261a]"
                  animate={{
                    height:
                      brewStep === 0
                        ? '38%'
                        : brewStep === 1
                        ? ['38%', '48%', '45%']
                        : '42%',
                  }}
                  transition={{
                    duration: brewStep === 1 ? 2.5 : 0.5,
                    repeat: brewStep === 1 ? Infinity : 0,
                    repeatType: 'reverse',
                  }}
                >
                  {/* Subtle golden water saturation line */}
                  {brewStep >= 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="h-0.5 bg-[#c5a880]/70 w-full"
                    />
                  )}
                </motion.div>

                {/* Ground grams label */}
                <div className="relative z-10 text-[9px] uppercase tracking-widest font-mono text-[#fcfbf7] bg-[#140d09]/80 px-2 py-0.5 rounded border border-[#c5a880]/30">
                  {coffeeGrams}g Phin Grind
                </div>

                {/* Blooming Countdown Banner */}
                {brewStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-[#140d09]/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-[10px] text-[#c5a880] font-medium tracking-wider"
                  >
                    <span className="text-[8px] uppercase tracking-[0.2em] text-[#e5ded8]">Blooming</span>
                    <span className="font-mono text-sm font-semibold">{bloomSeconds}s</span>
                  </motion.div>
                )}
              </div>

              {/* Phin Filter Base Collar */}
              <div className="w-28 h-2.5 bg-gradient-to-r from-[#807671] via-[#e5ded8] to-[#69605b] rounded-full shadow-lg border-t border-white/20" />

              {/* Gravity Drips Falling Corridor (Framer Motion Animation) */}
              <div className="h-16 w-12 relative flex flex-col items-center justify-center">
                <AnimatePresence>
                  {brewStep === 2 && isBrewing && (
                    <>
                      {/* Droplet 1 */}
                      <motion.div
                        key="drip-1"
                        initial={{ y: 0, opacity: 0, scale: 0.8 }}
                        animate={{
                          y: [0, 8, 48],
                          opacity: [0, 1, 1, 0],
                          scale: [0.8, 1, 0.6],
                        }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          ease: [0.45, 0, 0.7, 1],
                        }}
                        className="absolute w-2 h-2.5 bg-gradient-to-b from-[#3a1d13] to-[#140d09] rounded-full shadow-xs"
                        style={{
                          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        }}
                      />
                      {/* Droplet 2 with slight offset */}
                      <motion.div
                        key="drip-2"
                        initial={{ y: 0, opacity: 0, scale: 0.7 }}
                        animate={{
                          y: [0, 8, 48],
                          opacity: [0, 1, 1, 0],
                          scale: [0.7, 0.9, 0.5],
                        }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          delay: 0.55,
                          ease: [0.45, 0, 0.7, 1],
                        }}
                        className="absolute w-1.5 h-2 bg-gradient-to-b from-[#3a1d13] to-[#140d09] rounded-full shadow-xs"
                        style={{
                          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        }}
                      />
                    </>
                  )}
                </AnimatePresence>

                {brewStep === 3 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#c5a880]"
                  >
                    ✓ Extracted
                  </motion.div>
                )}
              </div>

              {/* Glass Tumbler Layering Condensed Milk & Slow Espresso */}
              <div className="w-28 h-36 bg-white/5 backdrop-blur-xs border border-white/20 rounded-b-2xl relative overflow-hidden flex flex-col justify-end p-1 shadow-2xl">
                {/* Surface Drip Ripple Effect (Framer Motion) */}
                {brewStep === 2 && isBrewing && (
                  <motion.div
                    key="ripple"
                    initial={{ scale: 0.2, opacity: 0.8 }}
                    animate={{ scale: [0.2, 1.8], opacity: [0.8, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute left-1/2 -translate-x-1/2 w-6 h-1 rounded-full border border-[#c5a880]/60 pointer-events-none"
                    style={{
                      bottom:
                        milkType !== 'none'
                          ? `calc(${milkSpoons * 10 + 10}px + ${Math.max(8, extractionProgress * 0.55)}%)`
                          : `${Math.max(8, extractionProgress * 0.55)}%`,
                    }}
                  />
                )}

                {/* Extracted Coffee Layer (Rising Smoothly) */}
                <motion.div
                  className="bg-gradient-to-b from-[#361c14] to-[#1a0c08] rounded-b-xs relative"
                  animate={{
                    height:
                      brewStep === 3
                        ? '65%'
                        : brewStep === 2
                        ? `${Math.max(8, extractionProgress * 0.65)}%`
                        : '0%',
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {/* Crema foam line on top */}
                  <div className="h-1 bg-gradient-to-r from-[#9e744a] via-[#c5a880] to-[#8c643e] opacity-80" />
                </motion.div>

                {/* Condensed Milk Base */}
                {milkType !== 'none' && (
                  <div
                    className={`w-full rounded-b-xl transition-all duration-300 relative ${
                      milkType === 'condensed' ? 'bg-[#fff5d6]' : 'bg-[#f4f7f6]'
                    }`}
                    style={{ height: `${milkSpoons * 10 + 10}px` }}
                  >
                    <span className="text-[7.5px] font-medium tracking-wider text-[#140d09] block text-center pt-0.5 uppercase">
                      {milkType === 'condensed' ? 'Sweetened Condensed' : 'Coconut Cream'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Brewing Stats Bar */}
            <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[10px] tracking-wider text-[#d3c3c0] bg-black/50 px-3.5 py-1.5 rounded-lg border border-white/5 backdrop-blur-xs font-mono">
              <span>Gravity Drops: {dropCounter}</span>
              <span>Extraction: {extractionProgress}%</span>
              <span>Temp: 94°C</span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2">
            {brewStep === 0 && (
              <button
                onClick={handleStartBrew}
                className="w-full py-3.5 px-4 rounded-xl bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] font-medium text-xs uppercase tracking-[0.2em] transition-all border border-[#c5a880]/40 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <Play className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Begin 45-Second Hydraulic Bloom & Drip</span>
              </button>
            )}

            {brewStep === 3 && (
              <div className="w-full space-y-3">
                <div className="p-3.5 bg-[#fcfbf7] border border-[#c5a880]/40 rounded-xl text-xs text-[#140d09] flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#c5a880] flex-shrink-0" />
                  <span className="font-light">
                    Extraction complete. You have calibrated the authentic 1:4 Vietnamese Phin gravity ratio.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleAddStarterKitToCart}
                    className="py-3 px-3 rounded-xl bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] font-medium text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 border border-[#c5a880]/40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Get Phin Starter Kit</span>
                  </button>
                  <button
                    onClick={handleAddPhinPowderToCart}
                    className="py-3 px-3 rounded-xl bg-white hover:bg-[#fbf9f5] text-[#140d09] font-medium text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 border border-[#c5a880]/30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Get 250g Phin Powder (₹380)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Recipe Customization Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#c5a880]/30 rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="border-b border-[#c5a880]/20 pb-4">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block mb-0.5">
              Parameters Calibration
            </span>
            <h4 className="text-lg font-normal text-[#140d09] font-serif">
              Fine-Tune Your Brew
            </h4>
            <p className="text-xs text-[#6e635d] font-light mt-1">
              Adjust bean origin, dosage, and milk layer to taste traditional Saigon style.
            </p>
          </div>

          {/* Ground Coffee Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#140d09] block tracking-wide">
              1. Traditional Ground Coffee Roast:
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setBeanOrigin('buon-ma-thuot')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  beanOrigin === 'buon-ma-thuot'
                    ? 'border-[#c5a880] bg-[#fbf9f5]'
                    : 'border-[#c5a880]/20 hover:border-[#c5a880]/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-serif text-[#140d09]">
                  <span>Classic Bold Robusta</span>
                  <span className="text-[10px] font-sans text-[#c5a880] tracking-wider uppercase">Heavy Crema</span>
                </div>
                <p className="text-[11px] text-[#6e635d] font-light mt-0.5">
                  Dark chocolate notes, deep walnut finish, rich natural body.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBeanOrigin('heritage-blend')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  beanOrigin === 'heritage-blend'
                    ? 'border-[#c5a880] bg-[#fbf9f5]'
                    : 'border-[#c5a880]/20 hover:border-[#c5a880]/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-serif text-[#140d09]">
                  <span>Heritage Cafe Blend (80/20)</span>
                  <span className="text-[10px] font-sans text-[#c5a880] tracking-wider uppercase">Traditional</span>
                </div>
                <p className="text-[11px] text-[#6e635d] font-light mt-0.5">
                  Classic Vietnamese cafe balance with French butter roast aromatics.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBeanOrigin('da-lat')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  beanOrigin === 'da-lat'
                    ? 'border-[#c5a880] bg-[#fbf9f5]'
                    : 'border-[#c5a880]/20 hover:border-[#c5a880]/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-serif text-[#140d09]">
                  <span>High-Altitude Arabica Profile</span>
                  <span className="text-[10px] font-sans text-[#c5a880] tracking-wider uppercase">Floral</span>
                </div>
                <p className="text-[11px] text-[#6e635d] font-light mt-0.5">
                  Bright lemongrass, honey blossom, delicate stone fruit sweetness.
                </p>
              </button>
            </div>
          </div>

          {/* Dosage Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#140d09]">2. Coffee Dose:</span>
              <span className="font-mono text-[#c5a880] font-semibold">{coffeeGrams} grams</span>
            </div>
            <input
              type="range"
              min={18}
              max={25}
              value={coffeeGrams}
              disabled={isBrewing}
              onChange={(e) => setCoffeeGrams(Number(e.target.value))}
              className="w-full accent-[#c5a880] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8c827a] font-light">
              <span>18g (Balanced)</span>
              <span>20g (Recommended)</span>
              <span>25g (Saigon Strong)</span>
            </div>
          </div>

          {/* Milk Layering Option */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#140d09] block">
              3. Glass Base Sweetener:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'condensed', label: 'Condensed' },
                { key: 'coconut', label: 'Coconut' },
                { key: 'none', label: 'Pure Black' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMilkType(m.key as any)}
                  className={`py-2 px-1 text-center text-xs rounded-lg border transition-all cursor-pointer ${
                    milkType === m.key
                      ? 'border-[#c5a880] bg-[#fbf9f5] text-[#140d09] font-medium'
                      : 'border-[#c5a880]/20 text-[#6e635d] hover:border-[#c5a880]/50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {milkType !== 'none' && (
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[#6e635d] font-light">Quantity:</span>
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMilkSpoons(s)}
                      className={`w-7 h-7 rounded-full text-xs font-mono transition-all cursor-pointer ${
                        milkSpoons === s
                          ? 'bg-[#140d09] text-[#fcfbf7]'
                          : 'border border-[#c5a880]/30 text-[#6e635d]'
                      }`}
                    >
                      {s}T
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Press Tightness */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-[#140d09] block">
              4. Gravity Press Disc Calibration:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { key: 'gentle', label: 'Gentle (Fast)' },
                { key: 'medium', label: 'Medium (Ideal)' },
                { key: 'firm', label: 'Firm (Slow)' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPressTightness(p.key as any)}
                  className={`py-2 px-1 text-center text-[11px] rounded-lg border transition-all cursor-pointer ${
                    pressTightness === p.key
                      ? 'border-[#c5a880] bg-[#fbf9f5] text-[#140d09] font-medium'
                      : 'border-[#c5a880]/20 text-[#6e635d] hover:border-[#c5a880]/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HeritageDivider variant="lotus" />
    </section>
  );
};
