import React, { useState } from 'react';
import { ProductItem, Currency } from '../types';
import { PRODUCT_ITEMS, getProductById } from '../data/coffeeData';
import { Sparkles, ArrowRight, RotateCcw, Check, Clock } from 'lucide-react';
import { WaitlistModal } from './WaitlistModal';

interface FlavorMatcherProps {
  currency: Currency;
  onOpenProductModal?: (item: ProductItem) => void;
  onQuickAddToCart?: (item: ProductItem) => void;
}

export const FlavorMatcher: React.FC<FlavorMatcherProps> = ({
  onOpenProductModal,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<{
    temperature?: string;
    strength?: string;
    sweetness?: string;
    flavor?: string;
  }>({});
  const [matchedProduct, setMatchedProduct] = useState<ProductItem | null>(null);
  const [waitlistOpen, setWaitlistOpen] = useState<boolean>(false);

  const questions = [
    {
      key: 'temperature',
      title: '1. How do you prefer to enjoy your coffee?',
      hint: 'Hot warmth or refreshing iced preparation',
      options: [
        {
          id: 'hot',
          label: 'Hot & Comforting',
          sub: 'Steaming cup for contemplative mornings',
          icon: '☕',
        },
        {
          id: 'iced',
          label: 'Iced & Refreshing',
          sub: 'Poured over ice for vibrant midday energy',
          icon: '🧊',
        },
      ],
    },
    {
      key: 'strength',
      title: '2. What coffee strength suits your palate?',
      hint: 'Intensity and roast profile preference',
      options: [
        {
          id: 'bold',
          label: 'Bold & Intense',
          sub: 'Deep dark roast with prominent punch',
          icon: '⚡',
        },
        {
          id: 'balanced',
          label: 'Balanced & Smooth',
          sub: 'Rich coffee presence with a rounded finish',
          icon: '⚖️',
        },
        {
          id: 'gentle',
          label: 'Smooth & Gentle',
          sub: 'Mellow character emphasizing dessert notes',
          icon: '✨',
        },
      ],
    },
    {
      key: 'sweetness',
      title: '3. What level of sweetness do you prefer?',
      hint: 'From pure black to creamy condensed milk style',
      options: [
        {
          id: 'unsweetened',
          label: 'Pure Unsweetened',
          sub: 'Zero sugar, 100% coffee-led taste',
          icon: '🖤',
        },
        {
          id: 'subtle',
          label: 'Delicately Sweet',
          sub: 'Gentle sweetness that lets cocoa and notes shine',
          icon: '🍯',
        },
        {
          id: 'creamy',
          label: 'Classic Sweet & Creamy',
          sub: 'Iconic Vietnamese milk coffee harmony',
          icon: '🥛',
        },
      ],
    },
    {
      key: 'flavor',
      title: '4. Which flavour profile appeals to you most?',
      hint: 'Your preferred taste direction',
      options: [
        {
          id: 'pure',
          label: 'Straightforward Coffee',
          sub: 'Pure unadulterated coffee flavour',
          icon: '☕',
        },
        {
          id: 'classic-3in1',
          label: 'Traditional 3-in-1',
          sub: 'Quintessential balanced Vietnamese cafe profile',
          icon: '✨',
        },
        {
          id: 'coconut',
          label: 'Toasted Coconut',
          sub: 'A distinctive tropical flavour direction',
          icon: '🥥',
        },
        {
          id: 'chocolate',
          label: 'Dark Chocolate Cacao',
          sub: 'Familiar bittersweet dark chocolate',
          icon: '🍫',
        },
        {
          id: 'mocha',
          label: 'Chilled Mocha',
          sub: 'Refreshing cold cacao latte infusion',
          icon: '🧊',
        },
      ],
    },
  ];

  const handleSelectOption = (questionKey: string, optionId: string) => {
    const updatedAnswers = { ...answers, [questionKey]: optionId };
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      calculateMatch(updatedAnswers);
    }
  };

  const calculateMatch = (finalAnswers: typeof answers) => {
    let targetId = 'vietnamese-3in1-instant-coffee';

    if (finalAnswers.flavor === 'pure' || finalAnswers.sweetness === 'unsweetened') {
      targetId = 'pure-vietnamese-instant-black-coffee';
    } else if (finalAnswers.flavor === 'coconut') {
      targetId = 'coconut-coffee';
    } else if (finalAnswers.flavor === 'mocha' || (finalAnswers.temperature === 'iced' && finalAnswers.flavor === 'chocolate')) {
      targetId = 'iced-mocha';
    } else if (finalAnswers.flavor === 'chocolate') {
      targetId = 'chocolate-coffee';
    } else {
      targetId = 'vietnamese-3in1-instant-coffee';
    }

    const matched = getProductById(targetId) || PRODUCT_ITEMS.find((p) => p.id === targetId) || PRODUCT_ITEMS[0];
    setMatchedProduct(matched);
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setMatchedProduct(null);
  };

  const q = questions[currentQuestion];
  const progressPercent = Math.round(((currentQuestion + (matchedProduct ? 1 : 0)) / questions.length) * 100);

  return (
    <section className="w-full max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 p-8 sm:p-12 shadow-2xl relative">
        {/* Header */}
        <div className="text-center space-y-3 pb-8 border-b border-[#c5a880]/20">
          <div className="inline-flex items-center gap-2 text-[#c5a880] text-[10px] uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Taste Sommelier Quiz</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#fcfbf7] font-normal">
            Find Your Vietnamese Coffee Match
          </h2>
          <p className="text-xs text-[#a3978f] font-light max-w-md mx-auto">
            Answer 4 quick questions (Hot or Iced, Strength, Sweetness, Flavour) to discover your ideal planned blend.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="py-6 border-b border-[#c5a880]/15">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#c5a880] mb-2">
            <span>{matchedProduct ? 'Match Discovered' : `Question ${currentQuestion + 1} of ${questions.length}`}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#c5a880] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quiz Body */}
        {!matchedProduct ? (
          <div className="py-8 space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl text-[#fcfbf7] font-normal">
                {q.title}
              </h3>
              <p className="text-xs text-[#a3978f] font-light">{q.hint}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(q.key, opt.id)}
                  className="p-5 text-left border border-[#c5a880]/30 hover:border-[#c5a880] bg-white/5 hover:bg-white/10 transition-all duration-300 group cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{opt.icon}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#a3978f] group-hover:text-[#c5a880] group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="font-serif text-base text-[#fcfbf7] group-hover:text-[#c5a880] transition-colors">
                    {opt.label}
                  </h4>
                  <p className="text-xs text-[#a3978f] font-light leading-relaxed">
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>

            {currentQuestion > 0 && (
              <div className="pt-4 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                  className="text-[#a3978f] hover:text-[#c5a880] transition-colors cursor-pointer uppercase tracking-wider"
                >
                  &larr; Previous Question
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[#8c827a] hover:text-[#fcfbf7] transition-colors cursor-pointer"
                >
                  Restart Quiz
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Match Result Screen */
          <div className="py-8 space-y-8 animate-in fade-in duration-300">
            <div className="p-6 bg-white/5 border border-[#c5a880]/40 flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 aspect-square shrink-0 overflow-hidden border border-[#c5a880]/30">
                <img
                  src={matchedProduct.imageUrl}
                  alt={matchedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 flex-1 text-center md:text-left">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] font-medium block">
                  Your Personalized Match • Coming Soon
                </span>
                <h3 className="font-serif text-2xl text-[#fcfbf7]">
                  {matchedProduct.name}
                </h3>
                <p className="text-xs text-[#c5a880] font-serif italic">
                  {matchedProduct.vietnameseName}
                </p>
                <p className="text-xs text-[#dcd4cb] font-light leading-relaxed">
                  {matchedProduct.description}
                </p>

                {matchedProduct.tastingNotes && matchedProduct.tastingNotes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 justify-center md:justify-start">
                    {matchedProduct.tastingNotes.map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-[#fcfbf7] bg-[#140d09] border border-[#c5a880]/30 px-2.5 py-0.5"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Packaging Note */}
            <p className="text-xs text-center text-[#a3978f] font-light italic">
              Pack sizes (2g, 5g, 10g sachets) are being evaluated and will be confirmed at launch.
            </p>

            {/* Actions: Join Waitlist */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setWaitlistOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Join the Waitlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3.5 border border-[#c5a880]/40 text-[#fcfbf7] hover:text-[#c5a880] text-xs uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        product={matchedProduct}
      />
    </section>
  );
};
