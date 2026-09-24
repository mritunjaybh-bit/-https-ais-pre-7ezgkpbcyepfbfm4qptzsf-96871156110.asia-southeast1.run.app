import React, { useState, useRef, useEffect } from 'react';
import { Currency, ProductItem, CartItem, PackageSize } from '../types';
import { PRODUCT_ITEMS, getProductById } from '../data/coffeeData';
import { formatPrice } from '../utils/formatCurrency';
import {
  X,
  Send,
  Sparkles,
  Coffee,
  RotateCcw,
  ArrowRight,
  Plus,
  Check,
  Zap,
  CheckCircle2,
  Package,
  Layers,
  Heart
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  recommendedProductIds?: string[];
  recommendedSizes?: { [productId: string]: PackageSize };
  flavorSubstitutionNote?: string;
  isQuizResult?: boolean;
  timestamp: Date;
}

interface QuizAnswers {
  format?: string;
  strength?: string;
  sweetness?: string;
  flavor?: string;
  brewMethod?: string;
  orderSize?: string;
  quantityNeeded?: string;
}

interface CoffeeMasterChatProps {
  currency: Currency;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (item: CartItem) => void;
}

// 7-Step Coffee Master Sommelier Flow Options
const STEP_1_FORMAT_OPTIONS = [
  'Ground Powder',
  'Instant Sachets/3-in-1',
  'Whole Beans',
  'Not sure / Show me everything',
];

const STEP_2_STRENGTH_OPTIONS = [
  'Mild & Smooth',
  'Medium/Balanced',
  'Strong & Bold',
];

const STEP_3_SWEETNESS_OPTIONS = [
  'Classic/Original (no added flavor)',
  'Sweetened (condensed milk style)',
  'Flavored',
];

const STEP_4_FLAVOR_OPTIONS = [
  'Chocolate',
  'Caramel',
  'Hazelnut',
  'Vanilla',
  'Coconut',
  'Other/Surprise Me',
];

const STEP_5_BREW_OPTIONS = [
  'Traditional Phin Filter',
  'Regular Drip Machine',
  'Instant/Just Add Water',
  "I don't have brewing equipment yet",
];

const STEP_6_SIZE_OPTIONS = [
  'Small (100g–150g) — Trial pack, first-time buyer',
  'Medium (250g) — Regular home use',
  'Large (500g–1kg) — Bulk/family use or gifting',
];

const STEP_7_QUANTITY_OPTIONS = [
  'Just for me',
  'For my household',
  'Buying as a gift',
];

export const CoffeeMasterChat: React.FC<CoffeeMasterChatProps> = ({
  currency,
  onSelectProduct,
  onAddToCart,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Active quiz state (currentStep: 1 to 7, or 'done')
  const [currentStep, setCurrentStep] = useState<number | 'done'>(1);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-intro',
      sender: 'bot',
      text: "Xin chào! I am **Coffee Master**, your personal Vietnamese coffee sommelier. ☕\n\nLet's find your dream roast in a few quick questions. Choose your preference below to begin!",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to latest messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, currentStep, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle quiz option selection
  const handleSelectQuizOption = (option: string) => {
    if (typeof currentStep !== 'number') return;

    // Record user bubble
    const userMsg: ChatMessage = {
      id: `quiz-user-${Date.now()}`,
      sender: 'user',
      text: option,
      timestamp: new Date(),
    };

    const updatedAnswers: QuizAnswers = { ...quizAnswers };

    if (currentStep === 1) {
      updatedAnswers.format = option;
      setQuizAnswers(updatedAnswers);
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot-step-2-${Date.now()}`,
          sender: 'bot',
          text: `Great choice! ${option} is wonderful for authentic brews.\n\n**Step 2: How do you like your coffee strength?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      updatedAnswers.strength = option;
      setQuizAnswers(updatedAnswers);
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot-step-3-${Date.now()}`,
          sender: 'bot',
          text: `Got it — ${option} roast profile.\n\n**Step 3: What sweetness & roast style do you prefer?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      updatedAnswers.sweetness = option;
      setQuizAnswers(updatedAnswers);

      if (option === 'Flavored') {
        // Step 4: Flavor selection
        setMessages((prev) => [
          ...prev,
          userMsg,
          {
            id: `bot-step-4-${Date.now()}`,
            sender: 'bot',
            text: `Artisan co-roasting! We infuse single-origin beans with natural Vietnamese ingredients.\n\n**Step 4: Which flavor profile would you like?**`,
            timestamp: new Date(),
          },
        ]);
        setCurrentStep(4);
      } else {
        // Skip Step 4 straight to Step 5
        setMessages((prev) => [
          ...prev,
          userMsg,
          {
            id: `bot-step-5-${Date.now()}`,
            sender: 'bot',
            text: `Pure classic heritage choice.\n\n**Step 5: What is your preferred brewing method?**`,
            timestamp: new Date(),
          },
        ]);
        setCurrentStep(5);
      }
    } else if (currentStep === 4) {
      updatedAnswers.flavor = option;
      setQuizAnswers(updatedAnswers);
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot-step-5-${Date.now()}`,
          sender: 'bot',
          text: `Delicious choice: ${option}!\n\n**Step 5: What is your preferred brewing method?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      updatedAnswers.brewMethod = option;
      setQuizAnswers(updatedAnswers);
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot-step-6-${Date.now()}`,
          sender: 'bot',
          text: `Brew method noted!\n\n**Step 6: What order size / pack weight are you looking for?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(6);
    } else if (currentStep === 6) {
      updatedAnswers.orderSize = option;
      setQuizAnswers(updatedAnswers);
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot-step-7-${Date.now()}`,
          sender: 'bot',
          text: `Almost done!\n\n**Step 7: Who is this coffee for?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(7);
    } else if (currentStep === 7) {
      updatedAnswers.quantityNeeded = option;
      setQuizAnswers(updatedAnswers);
      setCurrentStep('done');

      // Compute final recommendations
      generateFinalRecommendations(userMsg, updatedAnswers);
    }
  };

  // Generate recommendations based on the 7 answered questions
  const generateFinalRecommendations = (lastUserMsg: ChatMessage, answers: QuizAnswers) => {
    setIsLoading(true);

    setTimeout(() => {
      let recommendedIds: string[] = [];
      let flavorNote: string | undefined = undefined;
      const targetSizes: { [productId: string]: PackageSize } = {};

      const isInstantPref = answers.format === 'Instant Sachets/3-in-1' || answers.brewMethod === 'Instant/Just Add Water';
      const isBeansPref = answers.format === 'Whole Beans';
      const isSmallPref = answers.orderSize?.includes('Small');
      const isLargePref = answers.orderSize?.includes('Large');

      // Flavor-specific logic
      if (answers.sweetness === 'Flavored') {
        if (answers.flavor === 'Chocolate') {
          if (isInstantPref) {
            recommendedIds = ['saigon-dark-chocolate-mocha-instant-box', 'saigon-artisan-dark-chocolate-cacao-powder'];
          } else {
            recommendedIds = ['saigon-artisan-dark-chocolate-cacao-powder', 'saigon-dark-chocolate-mocha-instant-box'];
          }
        } else if (answers.flavor === 'Caramel') {
          recommendedIds = ['da-lat-salted-caramel-phin-powder', 'culi-highland-dark-roast-powder'];
        } else if (answers.flavor === 'Coconut') {
          if (isInstantPref) {
            recommendedIds = ['ben-tre-coconut-instant-latte-box', 'ben-tre-toasted-coconut-phin-powder'];
          } else {
            recommendedIds = ['ben-tre-toasted-coconut-phin-powder', 'ben-tre-coconut-instant-latte-box'];
          }
        } else if (answers.flavor === 'Hazelnut') {
          flavorNote = "We don't have Hazelnut yet, but you might love this Caramel blend — or our Saigon Cacao roast, which is co-roasted with French clarified butter and Bến Tre dark cacao nibs for rich roasted hazelnut and fudge notes!";
          recommendedIds = ['da-lat-salted-caramel-phin-powder', 'saigon-artisan-dark-chocolate-cacao-powder'];
        } else if (answers.flavor === 'Vanilla') {
          flavorNote = "We don't have a standalone Vanilla roast yet, but you might love our Hà Nội Heritage Egg Custard (notes of sweet vanilla-sabayon tiramisu) or our Đà Lạt Butter-Caramel blend!";
          recommendedIds = ['hanoi-egg-coffee-heritage-ground-powder', 'da-lat-salted-caramel-phin-powder'];
        } else {
          // Other/Surprise Me
          recommendedIds = ['hue-royal-lotus-scented-coffee-powder', 'hanoi-egg-coffee-heritage-ground-powder'];
        }
      } else if (answers.sweetness === 'Sweetened (condensed milk style)') {
        if (isInstantPref) {
          recommendedIds = ['saigon-dark-chocolate-mocha-instant-box', 'hanoi-instant-egg-crema-latte-box'];
        } else {
          recommendedIds = ['culi-highland-dark-roast-powder', 'hanoi-egg-coffee-heritage-ground-powder'];
        }
      } else {
        // Classic / Original
        if (answers.strength === 'Strong & Bold') {
          if (isInstantPref) {
            recommendedIds = ['vietnam-g7-style-gold-instant-jar', 'culi-highland-dark-roast-powder'];
          } else {
            recommendedIds = ['buon-ma-thuot-peaberry-robusta-cui', 'culi-highland-dark-roast-powder'];
          }
        } else if (answers.strength === 'Mild & Smooth') {
          recommendedIds = ['da-lat-langbiang-typica-arabica-powder', 'hue-royal-lotus-scented-coffee-powder'];
        } else {
          // Medium / Balanced
          recommendedIds = ['culi-highland-dark-roast-powder', 'da-lat-langbiang-typica-arabica-powder'];
        }
      }

      // If user has no equipment, add Phin Filter as complimentary hardware pairing
      if (
        (answers.brewMethod === "I don't have brewing equipment yet" || answers.brewMethod === 'Traditional Phin Filter') &&
        !isInstantPref &&
        !recommendedIds.includes('authentic-gravity-phin-filter-set')
      ) {
        if (recommendedIds.length >= 3) {
          recommendedIds = [recommendedIds[0], recommendedIds[1], 'authentic-gravity-phin-filter-set'];
        } else {
          recommendedIds.push('authentic-gravity-phin-filter-set');
        }
      }

      // Assign closest weight/size
      recommendedIds.forEach((id) => {
        const prod = getProductById(id);
        if (prod && prod.availableSizes && prod.availableSizes.length > 0) {
          if (isLargePref) {
            targetSizes[id] = prod.availableSizes.find((s) => s.size.includes('1kg') || s.size.includes('500g') || s.size.includes('50'))?.size || prod.availableSizes[0].size;
          } else if (isSmallPref) {
            targetSizes[id] = prod.availableSizes[0].size;
          } else {
            // Medium 250g
            targetSizes[id] = prod.availableSizes.find((s) => s.size.includes('250g') || s.size.includes('20'))?.size || prod.availableSizes[0].size;
          }
        }
      });

      // Craft personal summary text
      const summaryText = `🎉 **Your Personalized Sommelier Match is Ready!**\n\nBased on your profile (**${answers.format}**, **${answers.strength}**, **${answers.sweetness}${answers.flavor ? ` - ${answers.flavor}` : ''}**, **${answers.brewMethod}**, **${answers.orderSize?.split('—')[0].trim()}**):\n\nHere are the top direct-trade Vietnamese selections handpicked for you:`;

      const botFinalMsg: ChatMessage = {
        id: `bot-final-${Date.now()}`,
        sender: 'bot',
        text: summaryText,
        recommendedProductIds: recommendedIds,
        recommendedSizes: targetSizes,
        flavorSubstitutionNote: flavorNote,
        isQuizResult: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, lastUserMsg, botFinalMsg]);
      setIsLoading(false);
    }, 600);
  };

  // Free-text message handler (allows customer to ask follow-up questions at any time)
  const handleSendFreeText = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/coffee-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "Here are our roaster's recommendations for you:",
        recommendedProductIds: Array.isArray(data.recommendedProductIds) ? data.recommendedProductIds : [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error('Follow-up chat error:', e);

      // Intelligent local fallback
      const lower = text.toLowerCase();
      let fallbackIds = ['culi-highland-dark-roast-powder', 'saigon-artisan-dark-chocolate-cacao-powder'];
      let fallbackReply = "Xin chào! Based on your question, here are authentic direct-trade Vietnamese roasts handpicked for you:";

      if (lower.includes('hazelnut') || lower.includes('nutty')) {
        fallbackReply = "We don't have Hazelnut yet, but you might love this Caramel blend (Đà Lạt Salted Caramel) or our Saigon Cacao roast with natural roasted hazelnut notes!";
        fallbackIds = ['da-lat-salted-caramel-phin-powder', 'saigon-artisan-dark-chocolate-cacao-powder'];
      } else if (lower.includes('vanilla')) {
        fallbackReply = "We don't have a standalone Vanilla roast yet, but you might love our Hà Nội Heritage Egg Custard (delicate vanilla-sabayon tiramisu notes) or our Caramel blend!";
        fallbackIds = ['hanoi-egg-coffee-heritage-ground-powder', 'da-lat-salted-caramel-phin-powder'];
      } else if (lower.includes('choc') || lower.includes('mocha')) {
        fallbackReply = "Our Saigon Artisan Chocolate Phin Powder is slow-roasted with single-origin Bến Tre dark cacao nibs and French butter. For instant, try the 3-in-1 Dark Chocolate Mocha!";
        fallbackIds = ['saigon-artisan-dark-chocolate-cacao-powder', 'saigon-dark-chocolate-mocha-instant-box'];
      } else if (lower.includes('phin') || lower.includes('drip') || lower.includes('brew')) {
        fallbackReply = "To make traditional Vietnamese coffee, slow-drip through a stainless steel Phin filter over 2 tbsp of sweetened condensed milk, then pour over ice!";
        fallbackIds = ['culi-highland-dark-roast-powder', 'authentic-gravity-phin-filter-set'];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: fallbackReply,
          recommendedProductIds: fallbackIds,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentStep(1);
    setQuizAnswers({});
    setMessages([
      {
        id: `welcome-restart-${Date.now()}`,
        sender: 'bot',
        text: "Xin chào! Sommelier quiz restarted. Let's find your perfect roast!\n\n**Step 1: What coffee format do you prefer?**",
        timestamp: new Date(),
      },
    ]);
  };

  const handleQuickAdd = (product: ProductItem, chosenSizeName?: PackageSize) => {
    const sizeName = chosenSizeName || product.availableSizes[0].size;
    const sizeObj = product.availableSizes.find((s) => s.size === sizeName) || product.availableSizes[0];
    const unitPrice = Math.round(product.basePriceINR * (sizeObj?.priceMultiplier || 1));
    const defaultGrind = product.availableGrinds ? product.availableGrinds[0] : undefined;

    onAddToCart({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      vietnameseName: product.vietnameseName,
      unitPriceINR: unitPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
      selectedSize: sizeName,
      selectedGrind: defaultGrind,
      category: product.category,
    });

    setAddedItemNotice(product.id);
    setTimeout(() => {
      setAddedItemNotice((prev) => (prev === product.id ? null : prev));
    }, 2200);
  };

  // Get active options for the current step
  const getActiveStepOptions = (): { stepTitle: string; stepNumber: number; options: string[] } | null => {
    if (typeof currentStep !== 'number') return null;

    if (currentStep === 1) {
      return {
        stepTitle: 'Format Preference',
        stepNumber: 1,
        options: STEP_1_FORMAT_OPTIONS,
      };
    }
    if (currentStep === 2) {
      return {
        stepTitle: 'Coffee Strength',
        stepNumber: 2,
        options: STEP_2_STRENGTH_OPTIONS,
      };
    }
    if (currentStep === 3) {
      return {
        stepTitle: 'Sweetness & Style',
        stepNumber: 3,
        options: STEP_3_SWEETNESS_OPTIONS,
      };
    }
    if (currentStep === 4) {
      return {
        stepTitle: 'Artisan Flavor Profile',
        stepNumber: 4,
        options: STEP_4_FLAVOR_OPTIONS,
      };
    }
    if (currentStep === 5) {
      return {
        stepTitle: 'Brewing Method',
        stepNumber: 5,
        options: STEP_5_BREW_OPTIONS,
      };
    }
    if (currentStep === 6) {
      return {
        stepTitle: 'Order Size / Weight',
        stepNumber: 6,
        options: STEP_6_SIZE_OPTIONS,
      };
    }
    if (currentStep === 7) {
      return {
        stepTitle: 'Quantity Needed',
        stepNumber: 7,
        options: STEP_7_QUANTITY_OPTIONS,
      };
    }
    return null;
  };

  const activeStepData = getActiveStepOptions();

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
          {/* Helper hint pill */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 bg-[#271310] text-[#f4eceb] border border-[#feca4d]/40 px-3.5 py-2 rounded-full shadow-lg text-xs font-semibold hover:border-[#feca4d] transition-all cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#feca4d] animate-pulse" />
            <span>Taste Quiz • <strong>Coffee Master</strong></span>
          </button>

          {/* Main Round Floating Button */}
          <button
            id="coffee-master-floating-btn"
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Coffee Master AI Assistant"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1a0a08] via-[#2f140f] to-[#5a2a1e] text-[#feca4d] border-2 border-[#feca4d] shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group relative"
          >
            <div className="relative">
              <Coffee className="w-6 h-6 text-[#feca4d] group-hover:rotate-6 transition-transform" />
              <Sparkles className="w-3.5 h-3.5 text-white absolute -top-1.5 -right-2 animate-bounce" />
            </div>
            {/* Online status indicator */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#271310] rounded-full" />
          </button>
        </div>
      )}

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div
          id="coffee-master-chat-window"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[395px] max-w-[calc(100vw-32px)] h-[610px] max-h-[calc(100vh-70px)] bg-[#fff8f6] border border-[#d3c3c0] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Chat Header */}
          <div className="bg-[#271310] text-white p-3 px-4 flex items-center justify-between border-b border-[#feca4d]/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#785a00] to-[#feca4d] p-0.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#1e0d0b] flex items-center justify-center text-[#feca4d]">
                  <Coffee className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3
                    className="font-bold text-sm text-[#feca4d] tracking-wide"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Coffee Master
                  </h3>
                  <span className="bg-[#feca4d]/20 text-[#feca4d] text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded tracking-wider">
                    AI Sommelier
                  </span>
                </div>
                <p className="text-[10px] text-[#ae8d87] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Direct-Trade Vietnamese Roastery Matcher
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRestartQuiz}
                title="Restart Sommelier Taste Quiz"
                className="p-1.5 text-[#ae8d87] hover:text-[#feca4d] hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restart</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                className="p-1.5 text-[#ae8d87] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Step Progress Bar (when quiz is in progress) */}
          {typeof currentStep === 'number' && (
            <div className="bg-[#271310]/95 px-4 py-1.5 border-b border-[#feca4d]/20 flex items-center justify-between text-[11px] text-[#ae8d87] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[#feca4d] font-bold">Step {currentStep} of 7</span>
                <span className="text-[#d3c3c0]/60">•</span>
                <span className="text-white truncate max-w-[190px]">
                  {activeStepData?.stepTitle}
                </span>
              </div>
              {/* Progress mini indicator */}
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#feca4d] to-[#785a00] transition-all duration-300"
                  style={{ width: `${(currentStep / 7) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Chat Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#fdfaf8]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#271310] text-[#f4eceb] rounded-tr-xs shadow-sm'
                        : 'bg-white border border-[#d3c3c0]/80 text-[#271310] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">
                      {msg.text.split('\n').map((paragraph, pIdx) => {
                        const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <p key={pIdx} className={pIdx > 0 ? 'mt-1.5' : ''}>
                            {parts.map((part, partIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={partIdx} className="font-bold text-[#785a00]">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flavor Substitution Callout Note (if customer selected Hazelnut / Vanilla) */}
                  {msg.flavorSubstitutionNote && (
                    <div className="mt-2.5 max-w-[92%] bg-[#fff2d6] border border-[#feca4d]/80 rounded-xl p-3 text-xs text-[#271310] flex items-start gap-2 shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#785a00] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#785a00] block text-[11px] uppercase tracking-wider">
                          Roastery Pairing Note:
                        </span>
                        <p className="mt-0.5 leading-relaxed text-[11px] text-[#422006]">
                          {msg.flavorSubstitutionNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recommended Product Cards */}
                  {!isUser && msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="mt-3 w-full max-w-[98%] space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#785a00] pl-1">
                        <Coffee className="w-3.5 h-3.5 text-[#feca4d]" />
                        <span>Recommended Catalog Products:</span>
                      </div>

                      {msg.recommendedProductIds.map((prodId) => {
                        const product = getProductById(prodId);
                        if (!product) return null;
                        const isAdded = addedItemNotice === product.id;

                        // Target package size if identified from quiz
                        const assignedSizeName = msg.recommendedSizes?.[product.id] || product.availableSizes[0]?.size;
                        const assignedSizeObj = product.availableSizes?.find((s) => s.size === assignedSizeName) || product.availableSizes?.[0];
                        const displayPrice = Math.round(product.basePriceINR * (assignedSizeObj?.priceMultiplier || 1));

                        return (
                          <div
                            key={product.id}
                            className="bg-white border border-[#d3c3c0] rounded-xl p-3 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2.5"
                          >
                            <div className="flex items-center gap-3">
                              {/* Product Thumbnail */}
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-14 h-14 rounded-lg object-cover bg-[#eee] shrink-0 border border-[#d3c3c0]/40"
                              />

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <h4
                                  onClick={() => {
                                    onSelectProduct(product);
                                    setIsOpen(false);
                                  }}
                                  className="text-xs font-bold text-[#271310] leading-snug hover:text-[#785a00] transition-colors cursor-pointer line-clamp-1"
                                >
                                  {product.name}
                                </h4>
                                <p className="text-[10px] text-[#785a00] italic truncate mt-0.5">
                                  {product.vietnameseName}
                                </p>

                                <div className="flex items-center flex-wrap gap-2 mt-1">
                                  <span className="text-xs font-extrabold text-[#271310] font-serif">
                                    {formatPrice(displayPrice, currency)}
                                  </span>

                                  {assignedSizeName && (
                                    <span className="text-[9px] bg-[#faf2f0] text-[#504442] px-1.5 py-0.5 rounded border border-[#d3c3c0]/50 font-medium">
                                      {assignedSizeName}
                                    </span>
                                  )}

                                  {product.caffeineScore && (
                                    <span className="text-[9px] bg-[#faf2f0] text-[#785a00] px-1.5 py-0.5 rounded font-semibold border border-[#d3c3c0]/40 flex items-center gap-0.5">
                                      <Zap className="w-2.5 h-2.5 fill-[#feca4d] text-[#feca4d]" />
                                      {product.caffeineScore}/5
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Tasting notes snippet */}
                            {product.tastingNotes && product.tastingNotes.length > 0 && (
                              <div className="text-[10px] text-[#6d5d5a] bg-[#fbf7f6] px-2 py-1 rounded border border-[#d3c3c0]/30 line-clamp-1">
                                <strong>Notes:</strong> {product.tastingNotes.slice(0, 3).join(' • ')}
                              </div>
                            )}

                            {/* Direct Action Buttons */}
                            <div className="flex items-center gap-2 pt-1 border-t border-[#d3c3c0]/30">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectProduct(product);
                                  setIsOpen(false);
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-[#faf2f0] hover:bg-[#eee3e1] text-[#271310] text-[11px] font-bold border border-[#d3c3c0] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <span>View Product</span>
                                <ArrowRight className="w-3 h-3 text-[#785a00]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleQuickAdd(product, assignedSizeName)}
                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-[#785a00] hover:bg-[#8e6b00] text-white active:scale-95 shadow-2xs'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Added to Cart</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Add to Cart</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Post-Quiz Actions */}
                  {msg.isQuizResult && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRestartQuiz}
                        className="text-xs bg-white hover:bg-[#271310] hover:text-white text-[#271310] border border-[#d3c3c0] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retake Taste Quiz</span>
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] text-[#827472] mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {/* Live Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#785a00] bg-white border border-[#d3c3c0]/60 rounded-2xl p-2.5 px-3 max-w-[75%] shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#785a00] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#785a00] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#785a00] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] font-medium italic">Coffee Master is tailoring recommendations...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Active Step Tappable Buttons / Chips Container */}
          {activeStepData && (
            <div className="bg-[#faf2f0] p-3 border-t border-[#d3c3c0] shrink-0">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#785a00] mb-2 flex items-center justify-between">
                <span>Select an option for Step {activeStepData.stepNumber}:</span>
                <span className="text-[#827472] font-normal lowercase">{activeStepData.options.length} options</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {activeStepData.options.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuizOption(option)}
                    className="text-left text-xs bg-white hover:bg-[#271310] hover:text-[#feca4d] text-[#271310] border border-[#d3c3c0] px-3 py-1.5 rounded-xl font-medium transition-all shadow-2xs hover:scale-[1.01] active:scale-95 cursor-pointer leading-tight"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Free-Text Input Bar (Always accessible for questions/follow-ups) */}
          <div className="p-2.5 bg-white border-t border-[#d3c3c0] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFreeText();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  typeof currentStep === 'number'
                    ? `Tap an option above or ask a question...`
                    : `Ask Coffee Master a follow-up question...`
                }
                className="flex-1 bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] placeholder-[#827472] focus:outline-none focus:border-[#785a00] transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-[#785a00] hover:bg-[#8e6b00] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="text-[9px] text-center text-[#827472] mt-1.5 flex items-center justify-center gap-1">
              <span>Cà Phê Vietnam AI Master Sommelier • Ask anything</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
