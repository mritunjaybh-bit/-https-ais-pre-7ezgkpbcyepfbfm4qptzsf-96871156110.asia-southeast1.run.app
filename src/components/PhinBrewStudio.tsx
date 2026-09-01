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
  Award,
  Plus,
  Package,
  Layers,
  Sparkle
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  // 3: Stir & Ice (Complete!)
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
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#feca4d', '#785a00', '#271310', '#fff8f6'],
            });
            return 100;
          }
          // Increments based on press tightness
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
    <section id="phin-brew-studio" className="py-12 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#785a00] bg-[#feca4d]/15 px-3 py-1 rounded-full border border-[#feca4d]/30 inline-block mb-3">
          Interactive Phin Brewing Lab • Home Barista Masterclass
        </span>
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#271310] tracking-tight leading-tight font-serif"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Master the Slow Phin Gravity Ritual
        </h2>
        <p className="mt-3 text-sm text-[#504442] leading-relaxed">
          The heart of Vietnamese coffee lies in the <em>Phin</em> gravity filter. No paper filters, no electricity—just slow hydraulic extraction delivering pure dark chocolate intensity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Brewing Stage & Physics Graphic (7 cols) */}
        <div className="lg:col-span-7 bg-[#faf2f0] border border-[#d3c3c0] rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          {/* Stage Progress Header */}
          <div className="flex items-center justify-between border-b border-[#d3c3c0]/40 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#785a00] tracking-widest block">
                Ritual Step {brewStep + 1} of 4
              </span>
              <h3 className="text-xl font-bold text-[#271310] font-serif">
                {brewStep === 0 && 'Step 1: Prep Dosing & Condensed Milk'}
                {brewStep === 1 && 'Step 2: The 45-Second Hydraulic Bloom'}
                {brewStep === 2 && 'Step 3: Slow Gravity Extraction (45 drops/min)'}
                {brewStep === 3 && 'Step 4: Golden Condensation Complete!'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isBrewing ? (
                <button
                  onClick={handlePauseBrew}
                  className="p-2 rounded-lg bg-[#271310] text-white hover:bg-[#3d201c] transition-colors"
                  title="Pause brew"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : brewStep > 0 && brewStep < 3 ? (
                <button
                  onClick={handleResumeBrew}
                  className="p-2 rounded-lg bg-[#785a00] text-white hover:bg-[#8e6b00] transition-colors"
                  title="Resume brew"
                >
                  <Play className="w-4 h-4" />
                </button>
              ) : null}

              {brewStep > 0 && (
                <button
                  onClick={handleResetBrew}
                  className="p-2 rounded-lg bg-white border border-[#d3c3c0] text-[#504442] hover:text-[#271310] transition-colors"
                  title="Restart experiment"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Visual Glass & Phin Dripper */}
          <div className="bg-[#271310] rounded-xl p-8 flex flex-col items-center justify-center relative min-h-[300px] overflow-hidden text-white shadow-inner">
            {/* Phin Stainless Steel Chamber Illustration */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Phin Lid & Chamber */}
              <div className="w-24 h-5 bg-gradient-to-r from-[#d3c3c0] via-[#faf2f0] to-[#b0a09d] rounded-t-sm shadow-md border-b border-black/30" />
              <div className="w-20 h-16 bg-gradient-to-r from-[#9e8f8c] via-[#d3c3c0] to-[#7f706d] relative flex items-center justify-center border-x border-[#504442]">
                <div className="text-[9px] uppercase tracking-tighter font-mono font-bold text-[#271310] bg-[#feca4d]/70 px-1.5 py-0.5 rounded">
                  {coffeeGrams}g Phin Grind
                </div>
                {brewStep === 1 && (
                  <div className="absolute inset-0 bg-[#feca4d]/25 animate-pulse flex items-center justify-center text-[10px] text-[#feca4d] font-bold">
                    Blooming: {bloomSeconds}s
                  </div>
                )}
              </div>
              {/* Phin Filter Plate Collar */}
              <div className="w-28 h-2.5 bg-gradient-to-r from-[#b0a09d] via-[#faf2f0] to-[#827472] rounded-full shadow-lg" />

              {/* Gravity Drips Falling */}
              <div className="h-14 w-1 relative flex items-center justify-center">
                {brewStep === 2 && isBrewing && (
                  <div className="w-2.5 h-3 bg-[#4a261f] rounded-full animate-bounce shadow-sm" />
                )}
                {brewStep === 3 && (
                  <div className="text-[10px] font-bold text-[#feca4d]">✓ Extracted</div>
                )}
              </div>

              {/* Glass Tumbler Layering Condensed Milk & Dark Espresso */}
              <div className="w-28 h-36 bg-white/10 backdrop-blur-xs border-2 border-white/30 rounded-b-2xl relative overflow-hidden flex flex-col justify-end p-1 shadow-2xl">
                {/* Extracted Coffee Layer */}
                <div
                  className="bg-[#2a130f] transition-all duration-300 rounded-b-sm"
                  style={{
                    height:
                      brewStep === 3
                        ? '65%'
                        : brewStep === 2
                        ? `${Math.max(10, extractionProgress * 0.65)}%`
                        : '0%',
                  }}
                />

                {/* Condensed Milk Base */}
                {milkType !== 'none' && (
                  <div
                    className={`w-full rounded-b-xl transition-all ${
                      milkType === 'condensed' ? 'bg-[#fff5d6]' : 'bg-[#f4f7f6]'
                    }`}
                    style={{ height: `${milkSpoons * 10 + 10}px` }}
                  >
                    <span className="text-[8px] font-bold text-[#271310] block text-center pt-0.5">
                      {milkType === 'condensed' ? 'Sweetened Milk' : 'Coconut Milk'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Brewing Stats Overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[11px] text-[#d3c3c0] bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <span>Hydraulic Drops: {dropCounter}</span>
              <span>Extraction: {extractionProgress}%</span>
              <span>Water Temp: 94°C</span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {brewStep === 0 && (
              <button
                onClick={handleStartBrew}
                className="w-full py-3.5 px-4 rounded-xl bg-[#785a00] hover:bg-[#8e6b00] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4" />
                <span>Begin 45-Second Phin Bloom & Drip</span>
              </button>
            )}

            {brewStep === 3 && (
              <div className="w-full space-y-2">
                <div className="p-3 bg-[#eef7ee] border border-[#bcdcbc] rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Extraction complete! You've mastered the 1:4 Phin extraction ratio.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleAddStarterKitToCart}
                    className="py-3 px-3 rounded-xl bg-[#785a00] hover:bg-[#8e6b00] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Get Home Phin Starter Kit</span>
                  </button>
                  <button
                    onClick={handleAddPhinPowderToCart}
                    className="py-3 px-3 rounded-xl bg-[#271310] hover:bg-[#3d201c] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Get 250g Phin Powder (₹380)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Recipe Customization Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#d3c3c0] rounded-2xl p-6 sm:p-7 shadow-md space-y-5">
          <div className="border-b border-[#d3c3c0]/40 pb-3">
            <h4 className="text-base font-bold text-[#271310] font-serif">
              Brew Parameter Controls
            </h4>
            <p className="text-xs text-[#504442]">
              Adjust dosage, bean origin, and milk layering to calibrate flavor intensity.
            </p>
          </div>

          {/* Bean Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#271310] block">
              1. Single-Origin Ground Powder:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => setBeanOrigin('buon-ma-thuot')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  beanOrigin === 'buon-ma-thuot'
                    ? 'bg-[#271310] text-white border-[#271310]'
                    : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0]'
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>Buôn Ma Thuột 100% Fine Robusta</span>
                  <span className="text-[#feca4d]">Dark Cacao</span>
                </div>
                <p className="text-[10px] opacity-80">Full body, intense creaminess, heavy caffeine</p>
              </button>

              <button
                type="button"
                onClick={() => setBeanOrigin('heritage-blend')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  beanOrigin === 'heritage-blend'
                    ? 'bg-[#271310] text-white border-[#271310]'
                    : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0]'
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>Saigon Heritage 70/30 Blend</span>
                  <span className="text-[#feca4d]">Hazelnut & Toffee</span>
                </div>
                <p className="text-[10px] opacity-80">Classic balanced Saigon street style</p>
              </button>

              <button
                type="button"
                onClick={() => setBeanOrigin('da-lat')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  beanOrigin === 'da-lat'
                    ? 'bg-[#271310] text-white border-[#271310]'
                    : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0]'
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>Đà Lạt Highland 100% Arabica</span>
                  <span className="text-[#feca4d]">Jasmine & Bergamot</span>
                </div>
                <p className="text-[10px] opacity-80">Crisp acidity, floral bouquet, gentle finish</p>
              </button>
            </div>
          </div>

          {/* Coffee Dose Slider */}
          <div className="space-y-1.5 bg-[#faf2f0] p-3.5 rounded-xl border border-[#d3c3c0]/60">
            <div className="flex justify-between text-xs font-bold text-[#271310]">
              <span>2. Coffee Powder Dose:</span>
              <span className="text-[#785a00] font-mono">{coffeeGrams} grams</span>
            </div>
            <input
              type="range"
              min="15"
              max="25"
              step="1"
              value={coffeeGrams}
              onChange={(e) => setCoffeeGrams(Number(e.target.value))}
              className="w-full accent-[#785a00] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#827472]">
              <span>15g (Lighter)</span>
              <span>20g (Standard Phin)</span>
              <span>25g (Double Strength)</span>
            </div>
          </div>

          {/* Milk Layering Option */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#271310] block">3. Dairy / Base Sweetener:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMilkType('condensed')}
                className={`p-2 rounded-lg border text-center text-xs font-semibold ${
                  milkType === 'condensed'
                    ? 'bg-[#785a00] text-white border-[#785a00]'
                    : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0]'
                }`}
              >
                Condensed Milk
              </button>
              <button
                type="button"
                onClick={() => setMilkType('coconut')}
                className={`p-2 rounded-lg border text-center text-xs font-semibold ${
                  milkType === 'coconut'
                    ? 'bg-[#785a00] text-white border-[#785a00]'
                    : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0]'
                }`}
              >
                Coconut Cream
              </button>
              <button
                type="button"
                onClick={() => setMilkType('none')}
                className={`p-2 rounded-lg border text-center text-xs font-semibold ${
                  milkType === 'none'
                    ? 'bg-[#785a00] text-white border-[#785a00]'
                    : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0]'
                }`}
              >
                Pure Black
              </button>
            </div>
          </div>

          {/* Ready-to-buy starter pack callout */}
          <div className="bg-[#f0e6e4] p-3.5 rounded-xl border border-[#d3c3c0] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#785a00]">
              <Package className="w-3.5 h-3.5" />
              <span>Need the Traditional Stainless Steel Phin?</span>
            </div>
            <p className="text-[11px] text-[#504442]">
              Order our Authentic 6oz Phin Gravity Dripper (₹320) or Complete Barista Starter Bundle (₹890).
            </p>
            <button
              onClick={handleAddStarterKitToCart}
              className="mt-1 text-xs font-bold text-[#271310] underline underline-offset-2 hover:text-[#785a00]"
            >
              Add Starter Bundle to Cart →
            </button>
          </div>
        </div>
      </div>

      <HeritageDivider variant="geometric" />
    </section>
  );
};
