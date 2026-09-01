import React, { useState } from 'react';
import { ProductItem, Currency } from '../types';
import { PRODUCT_ITEMS } from '../data/coffeeData';
import { formatPrice } from '../utils/formatCurrency';
import { HeritageDivider } from './HeritageDivider';
import { Sparkles, Coffee, Package, ArrowRight, RotateCcw, Check, Plus, Zap, Layers } from 'lucide-react';

interface FlavorMatcherProps {
  currency: Currency;
  onOpenProductModal: (item: ProductItem) => void;
  onQuickAddToCart: (item: ProductItem) => void;
}

export const FlavorMatcher: React.FC<FlavorMatcherProps> = ({
  currency,
  onOpenProductModal,
  onQuickAddToCart,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<{
    prepType?: string;
    flavor?: string;
    caffeine?: string;
  }>({});
  const [matchedProduct, setMatchedProduct] = useState<ProductItem | null>(null);

  const questions = [
    {
      key: 'prepType',
      title: 'How do you plan to prepare your coffee?',
      hint: 'Choose your convenience & brewing preference',
      options: [
        {
          id: 'instant-convenient',
          label: 'Instant 10-Second Cups & Travel Sachets',
          sub: 'Dissolves instantly in hot or cold water with zero equipment',
          icon: '⚡',
        },
        {
          id: 'fresh-ground-phin',
          label: 'Authentic Fresh Ground Phin Drip Powder',
          sub: 'Slow gravity drip ritual with maximum chocolate aroma',
          icon: '☕',
        },
        {
          id: 'pure-black',
          label: 'Pure Black Coffee (Zero Sugar / Fillers)',
          sub: 'Cryo-freeze-dried pure Robusta crystals or single-origin beans',
          icon: '🖤',
        },
        {
          id: 'starter-kit',
          label: 'Complete Home Barista Kit with Phin Dripper',
          sub: 'Want the authentic metal dripper, coffee powder & condensed milk',
          icon: '🎁',
        },
      ],
    },
    {
      key: 'flavor',
      title: 'Which flavor profile excites your palate?',
      hint: 'Select your preferred flavor profile',
      options: [
        {
          id: 'condensed-chocolate',
          label: 'Rich Dark Chocolate & Mekong Cacao',
          sub: 'Single-origin Robusta roasted with artisan Ben Tre cacao nibs',
          icon: '🍫',
        },
        {
          id: 'egg-custard',
          label: 'Hà Nội Golden Egg Custard (Cà Phê Trứng)',
          sub: 'Silky whipped egg yolk sabayon cream with vanilla & caramelized honey',
          icon: '🍳',
        },
        {
          id: 'salted-caramel',
          label: 'Huế Imperial Sea Salt Caramel Cream (Cà Phê Muối)',
          sub: 'Mineral coastal pink salt cutting all bitterness into dark velvet',
          icon: '🧂',
        },
        {
          id: 'coconut-latte',
          label: 'Đà Nẵng Tropical Roasted Coconut (Cà Phê Cốt Dừa)',
          sub: 'Bến Tre coconut milk cream with smooth highland coffee',
          icon: '🥥',
        },
        {
          id: 'durian-exotic',
          label: 'Mekong King Durian (Cà Phê Sầu Riêng)',
          sub: 'Creamy custard-like Ri6 durian essence with rich dark coffee',
          icon: '👑',
        },
        {
          id: 'citrus-jasmine',
          label: 'Đà Lạt Highland Floral & Pandan Leaf',
          sub: 'Wild mountain jasmine, pandan vanilla sweetness, and citrus Arabica',
          icon: '🍃',
        },
      ],
    },
    {
      key: 'caffeine',
      title: 'What energy intensity do you desire?',
      hint: 'Select your ideal caffeine power level',
      options: [
        {
          id: 'ultra',
          label: 'Maximum Energy Robusta (High 2x Boost)',
          sub: 'Single-origin Buon Ma Thuot volcanic red earth harvest',
          icon: '⚡',
        },
        {
          id: 'balanced',
          label: 'Balanced Harmony (70/30 Blend)',
          sub: 'Smooth dark cacao body with a rounded, lingering finish',
          icon: '⚖️',
        },
        {
          id: 'smooth',
          label: 'Gentle & Creamy Dessert Coffee',
          sub: 'Velvety custard, coconut, or highland Arabica profiles',
          icon: '🍃',
        },
      ],
    },
  ];

  const handleSelectOption = (optionId: string) => {
    const currentKey = questions[currentQuestion].key as 'prepType' | 'flavor' | 'caffeine';
    const updatedAnswers = { ...answers, [currentKey]: optionId };
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMatch(updatedAnswers);
    }
  };

  const calculateMatch = (finalAnswers: typeof answers) => {
    // 1. Starter kit
    if (finalAnswers.prepType === 'starter-kit') {
      const kit = PRODUCT_ITEMS.find((p) => p.id === 'vietnamese-barista-starter-bundle');
      if (kit) {
        setMatchedProduct(kit);
        return;
      }
    }

    // 2. Pure Black
    if (finalAnswers.prepType === 'pure-black') {
      const blackJar = PRODUCT_ITEMS.find((p) => p.id === 'freeze-dried-pure-black-robusta-jar');
      if (blackJar) {
        setMatchedProduct(blackJar);
        return;
      }
    }

    // 3. Instant preferences
    if (finalAnswers.prepType === 'instant-convenient') {
      if (finalAnswers.flavor === 'condensed-chocolate') {
        const item = PRODUCT_ITEMS.find((p) => p.id === 'mekong-dark-chocolate-instant-mocha') ||
                     PRODUCT_ITEMS.find((p) => p.id === 'saigon-3in1-instant-sachets');
        if (item) {
          setMatchedProduct(item);
          return;
        }
      }
      if (finalAnswers.flavor === 'egg-custard') {
        const item = PRODUCT_ITEMS.find((p) => p.id === 'hanoi-egg-custard-instant-latte');
        if (item) {
          setMatchedProduct(item);
          return;
        }
      }
      if (finalAnswers.flavor === 'salted-caramel') {
        const item = PRODUCT_ITEMS.find((p) => p.id === 'hue-sea-salted-instant-caramel');
        if (item) {
          setMatchedProduct(item);
          return;
        }
      }
      if (finalAnswers.flavor === 'coconut-latte') {
        const item = PRODUCT_ITEMS.find((p) => p.id === 'danang-coconut-instant-latte');
        if (item) {
          setMatchedProduct(item);
          return;
        }
      }
      if (finalAnswers.flavor === 'durian-exotic') {
        const item = PRODUCT_ITEMS.find((p) => p.id === 'mekong-durian-creamy-instant-coffee');
        if (item) {
          setMatchedProduct(item);
          return;
        }
      }
      const saigon3in1 = PRODUCT_ITEMS.find((p) => p.id === 'saigon-3in1-instant-sachets');
      if (saigon3in1) {
        setMatchedProduct(saigon3in1);
        return;
      }
    }

    // 4. Ground Powder preferences
    if (finalAnswers.flavor === 'condensed-chocolate') {
      const chocoPowder = PRODUCT_ITEMS.find((p) => p.id === 'saigon-cacao-chocolate-powder');
      if (chocoPowder) {
        setMatchedProduct(chocoPowder);
        return;
      }
    }
    if (finalAnswers.flavor === 'egg-custard') {
      const eggPowder = PRODUCT_ITEMS.find((p) => p.id === 'hanoi-egg-custard-coffee-powder');
      if (eggPowder) {
        setMatchedProduct(eggPowder);
        return;
      }
    }
    if (finalAnswers.flavor === 'coconut-latte') {
      const coconutPowder = PRODUCT_ITEMS.find((p) => p.id === 'bentre-toasted-coconut-powder');
      if (coconutPowder) {
        setMatchedProduct(coconutPowder);
        return;
      }
    }
    if (finalAnswers.flavor === 'salted-caramel') {
      const saltPowder = PRODUCT_ITEMS.find((p) => p.id === 'hue-salted-caramel-powder');
      if (saltPowder) {
        setMatchedProduct(saltPowder);
        return;
      }
    }
    if (finalAnswers.flavor === 'durian-exotic') {
      const durianInstant = PRODUCT_ITEMS.find((p) => p.id === 'mekong-durian-creamy-instant-coffee');
      if (durianInstant) {
        setMatchedProduct(durianInstant);
        return;
      }
    }
    if (finalAnswers.flavor === 'citrus-jasmine') {
      const pandanPowder = PRODUCT_ITEMS.find((p) => p.id === 'pandan-vanilla-highland-powder') ||
                           PRODUCT_ITEMS.find((p) => p.id === 'dalat-highland-typica-powder');
      if (pandanPowder) {
        setMatchedProduct(pandanPowder);
        return;
      }
    }
    if (finalAnswers.caffeine === 'ultra') {
      const culi = PRODUCT_ITEMS.find((p) => p.id === 'buon-ma-thuot-peaberry-powder');
      if (culi) {
        setMatchedProduct(culi);
        return;
      }
    }

    // Default match
    const defaultItem =
      PRODUCT_ITEMS.find((p) => p.id === 'saigon-heritage-phin-powder') || PRODUCT_ITEMS[0];
    setMatchedProduct(defaultItem);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setMatchedProduct(null);
  };

  const currentQ = questions[currentQuestion];

  return (
    <section id="flavor-matcher-section" className="py-12 max-w-[900px] mx-auto px-4 sm:px-6">
      {/* Quiz Section Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#785a00] bg-[#feca4d]/20 px-3 py-1 rounded-full border border-[#feca4d]/40 inline-flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Coffee Matcher</span>
        </span>
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#271310] tracking-tight font-serif"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Find Your Perfect Vietnamese Roast
        </h2>
        <p className="mt-2 text-sm text-[#504442]">
          Answer 3 quick questions to discover your ideal ground coffee powder, instant sachet box, or heirloom Phin starter kit.
        </p>
      </div>

      {!matchedProduct ? (
        /* Quiz Active Step Card */
        <div className="bg-[#faf2f0] border border-[#d3c3c0] rounded-2xl p-6 sm:p-8 shadow-md">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6 border-b border-[#d3c3c0]/40 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#785a00]">
                Step {currentQuestion + 1} of {questions.length}
              </span>
              <h3
                className="text-xl font-bold text-[#271310] font-serif mt-0.5"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {currentQ.title}
              </h3>
              <p className="text-xs text-[#504442]">{currentQ.hint}</p>
            </div>
            <div className="flex gap-1.5">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentQuestion
                      ? 'bg-[#785a00]'
                      : idx < currentQuestion
                      ? 'bg-[#feca4d]'
                      : 'bg-[#d3c3c0]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className="bg-white hover:bg-[#fff8f6] border border-[#d3c3c0] hover:border-[#785a00] p-4 rounded-xl text-left transition-all duration-200 group flex items-start gap-3 shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <span className="text-2xl p-2 rounded-lg bg-[#faf2f0] group-hover:scale-110 transition-transform">
                  {opt.icon}
                </span>
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-[#271310] group-hover:text-[#785a00] transition-colors font-serif">
                    {opt.label}
                  </h4>
                  <p className="text-[11px] text-[#504442] mt-0.5 leading-relaxed">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {currentQuestion > 0 && (
            <div className="mt-6 pt-4 border-t border-[#d3c3c0]/40 flex justify-between items-center text-xs">
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="text-[#504442] hover:text-[#271310] font-semibold"
              >
                ← Previous Question
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Matched Result Card */
        <div className="bg-[#faf2f0] border-2 border-[#785a00]/30 rounded-2xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest font-bold text-[#785a00] bg-[#feca4d]/20 px-3 py-1 rounded-full border border-[#feca4d]/40 inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Match For You</span>
            </span>
            <h3
              className="text-2xl sm:text-3xl font-bold text-[#271310] font-serif"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {matchedProduct.name}
            </h3>
            <p className="text-xs text-[#785a00] italic font-medium mt-0.5">
              {matchedProduct.vietnameseName}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-5 rounded-xl border border-[#d3c3c0]/60">
            <div className="md:col-span-4 aspect-square rounded-lg overflow-hidden bg-[#eee3e1]">
              <img
                src={matchedProduct.imageUrl}
                alt={matchedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {matchedProduct.badge && (
                  <span className="bg-[#785a00] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {matchedProduct.badge}
                  </span>
                )}
                {matchedProduct.roastLevel && (
                  <span className="bg-[#f4ecea] text-[#271310] text-[10px] font-bold px-2 py-0.5 rounded border border-[#d3c3c0]">
                    {matchedProduct.roastLevel} Roast
                  </span>
                )}
                <span className="bg-[#feca4d]/20 text-[#785a00] text-[10px] font-bold px-2 py-0.5 rounded border border-[#feca4d]/40 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Energy {matchedProduct.caffeineScore}/5
                </span>
              </div>

              <p className="text-xs text-[#504442] leading-relaxed">
                {matchedProduct.description}
              </p>

              {/* Tasting Notes */}
              <div className="flex flex-wrap gap-1">
                {matchedProduct.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-[#faf2f0] border border-[#d3c3c0] text-[#504442] px-2 py-0.5 rounded-full font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#827472] block">
                    Starting From
                  </span>
                  <span className="text-xl font-bold text-[#271310] font-serif">
                    {formatPrice(matchedProduct.basePriceINR, currency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenProductModal(matchedProduct)}
                    className="px-3.5 py-2 rounded-lg border border-[#d3c3c0] text-xs font-bold text-[#504442] hover:bg-[#faf2f0]"
                  >
                    View Details & Grinds
                  </button>
                  <button
                    onClick={() => onQuickAddToCart(matchedProduct)}
                    className="px-4 py-2 rounded-lg bg-[#785a00] hover:bg-[#8e6b00] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 text-xs text-[#504442] hover:text-[#271310] font-semibold underline underline-offset-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Taste Matcher Quiz</span>
            </button>
          </div>
        </div>
      )}

      <HeritageDivider variant="lotus" />
    </section>
  );
};
