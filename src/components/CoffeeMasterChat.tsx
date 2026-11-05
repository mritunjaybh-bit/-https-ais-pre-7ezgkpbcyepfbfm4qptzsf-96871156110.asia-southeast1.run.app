import React, { useState, useRef, useEffect } from 'react';
import { Currency, ProductItem, CartItem } from '../types';
import { PRODUCT_ITEMS, getProductById } from '../data/coffeeData';
import {
  X,
  Send,
  Sparkles,
  Coffee,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { WaitlistModal } from './WaitlistModal';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  recommendedProductIds?: string[];
  isQuizResult?: boolean;
  timestamp: Date;
}

interface QuizAnswers {
  temperature?: string;
  strength?: string;
  sweetness?: string;
  flavor?: string;
}

interface CoffeeMasterChatProps {
  currency: Currency;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart?: (item: CartItem) => void;
}

// 4 Questions: Hot or Iced, Strength, Sweetness, Flavour
const STEP_1_TEMP_OPTIONS = [
  'Hot & Comforting',
  'Iced & Refreshing',
];

const STEP_2_STRENGTH_OPTIONS = [
  'Bold & Intense',
  'Balanced & Smooth',
  'Smooth & Gentle',
];

const STEP_3_SWEETNESS_OPTIONS = [
  'Pure Unsweetened (Black)',
  'Delicately Sweet',
  'Classic Sweet & Creamy',
];

const STEP_4_FLAVOR_OPTIONS = [
  'Straightforward Pure Coffee',
  'Classic Vietnamese 3-in-1',
  'Toasted Coconut',
  'Dark Chocolate',
  'Chilled Mocha',
];

export const CoffeeMasterChat: React.FC<CoffeeMasterChatProps> = ({
  currency,
  onSelectProduct,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [waitlistProduct, setWaitlistProduct] = useState<ProductItem | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          text: `Xin chào! I am your Cà Phê Sommelier.\n\nWe are developing a premium Vietnamese-origin coffee brand for India, launching soon. Let's find your ideal blend through 4 quick questions.\n\n**Step 1: Do you prefer your coffee hot or iced?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(1);
    }
  }, [isOpen]);

  const handleStepSelect = (option: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: option,
      timestamp: new Date(),
    };

    if (currentStep === 1) {
      setQuizAnswers((prev) => ({ ...prev, temperature: option }));
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot-2-${Date.now()}`,
          sender: 'bot',
          text: `**Step 2: What coffee strength do you prefer?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setQuizAnswers((prev) => ({ ...prev, strength: option }));
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot-3-${Date.now()}`,
          sender: 'bot',
          text: `**Step 3: What level of sweetness appeals to your palate?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setQuizAnswers((prev) => ({ ...prev, sweetness: option }));
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot-4-${Date.now()}`,
          sender: 'bot',
          text: `**Step 4: Which flavour profile sounds most enticing?**`,
          timestamp: new Date(),
        },
      ]);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      const finalAnswers = { ...quizAnswers, flavor: option };
      setQuizAnswers(finalAnswers);
      completeQuiz(finalAnswers, userMsg);
    }
  };

  const completeQuiz = (answers: QuizAnswers, lastUserMsg: ChatMessage) => {
    setIsLoading(true);
    setCurrentStep(5); // Quiz finished

    setTimeout(() => {
      let targetId = 'vietnamese-3in1-instant-coffee';

      if (answers.flavor?.includes('Pure') || answers.sweetness?.includes('Unsweetened')) {
        targetId = 'pure-vietnamese-instant-black-coffee';
      } else if (answers.flavor?.includes('Coconut')) {
        targetId = 'coconut-coffee';
      } else if (answers.flavor?.includes('Mocha') || answers.temperature?.includes('Iced')) {
        targetId = 'iced-mocha';
      } else if (answers.flavor?.includes('Chocolate')) {
        targetId = 'chocolate-coffee';
      } else {
        targetId = 'vietnamese-3in1-instant-coffee';
      }

      const summaryText = `🎉 **Your Sommelier Match is Ready!**\n\nBased on your preference for **${answers.temperature}**, **${answers.strength}**, **${answers.sweetness}**, and **${answers.flavor}**:\n\nHere is our recommended creation from our upcoming launch collection in India. Join the waitlist for priority invitation when batches release:`;

      const botFinalMsg: ChatMessage = {
        id: `bot-final-${Date.now()}`,
        sender: 'bot',
        text: summaryText,
        recommendedProductIds: [targetId],
        isQuizResult: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, lastUserMsg, botFinalMsg]);
      setIsLoading(false);
    }, 600);
  };

  // Free-text message handler
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
      const res = await fetch('/api/coffee-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            recommendedProductIds: data.recommendedProductIds || [],
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error('Fallback required');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: `Xin chào! We are developing a premium Vietnamese-origin coffee brand for the Indian market. Our planned range includes Vietnamese 3-in-1 Instant, Pure Black Instant, Coconut Coffee, Chocolate Coffee, and Iced Mocha. Join our waitlist to be among the first to taste them!`,
          recommendedProductIds: ['vietnamese-3in1-instant-coffee', 'coconut-coffee'],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentStep(1);
    setQuizAnswers({});
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'bot',
        text: `Xin chào! Let's find your ideal cup.\n\n**Step 1: Do you prefer your coffee hot or iced?**`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <aside aria-label="Sommelier Consultation Assistant">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] z-40 bg-[#140d09] hover:bg-[#221611] text-[#c5a880] w-12 h-12 md:w-auto md:h-12 md:px-5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 border border-[#c5a880]/60 cursor-pointer group active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
          aria-label="Open Coffee Sommelier Assistant"
        >
          <Sparkles className="w-5 h-5 text-[#c5a880] shrink-0" />
          <span className="text-xs uppercase tracking-[0.2em] font-medium hidden md:inline whitespace-nowrap">
            Taste Sommelier
          </span>
        </button>
      </aside>

      {/* Sommelier Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md h-[88vh] sm:h-[650px] bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 flex flex-col justify-between shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#1e1511] border-b border-[#c5a880]/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 border border-[#c5a880]/50 flex items-center justify-center text-[#c5a880]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-[#fcfbf7] font-normal">
                    Cà Phê Sommelier
                  </h3>
                  <p className="text-[10px] text-[#c5a880] uppercase tracking-wider">
                    Planned Range Guide
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  title="Restart Sommelier"
                  className="p-1.5 text-[#a3978f] hover:text-[#c5a880] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-[#a3978f] hover:text-[#c5a880] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-light">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-[#c5a880] text-[#140d09] font-medium'
                        : 'bg-[#1e1511] text-[#fcfbf7] border border-[#c5a880]/30'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>

                  {/* Recommended Products Card */}
                  {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="mt-2 w-full space-y-2">
                      {msg.recommendedProductIds.map((id) => {
                        const prod = getProductById(id);
                        if (!prod) return null;
                        return (
                          <div
                            key={id}
                            className="p-3 bg-white/5 border border-[#c5a880]/40 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-10 h-10 object-cover border border-[#c5a880]/30 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="font-serif text-xs text-[#fcfbf7] truncate">
                                  {prod.name}
                                </h4>
                                <span className="text-[9px] text-[#c5a880] uppercase tracking-wider block">
                                  Coming soon
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setWaitlistProduct(prod);
                                setIsWaitlistOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-[10px] uppercase tracking-wider font-medium transition-colors shrink-0 cursor-pointer"
                            >
                              Join Waitlist
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="p-3 bg-[#1e1511] border border-[#c5a880]/30 text-[#c5a880] text-xs inline-block animate-pulse">
                  Selecting your coffee match...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Step Options Selector (Quick replies) */}
            <div className="p-3 bg-[#1e1511] border-t border-[#c5a880]/20 space-y-2">
              {currentStep === 1 && (
                <div className="flex flex-wrap gap-2">
                  {STEP_1_TEMP_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleStepSelect(opt)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-[#c5a880] text-[#fcfbf7] hover:text-[#140d09] border border-[#c5a880]/40 text-xs transition-colors cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex flex-wrap gap-2">
                  {STEP_2_STRENGTH_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleStepSelect(opt)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-[#c5a880] text-[#fcfbf7] hover:text-[#140d09] border border-[#c5a880]/40 text-xs transition-colors cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex flex-wrap gap-2">
                  {STEP_3_SWEETNESS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleStepSelect(opt)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-[#c5a880] text-[#fcfbf7] hover:text-[#140d09] border border-[#c5a880]/40 text-xs transition-colors cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex flex-wrap gap-2">
                  {STEP_4_FLAVOR_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleStepSelect(opt)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-[#c5a880] text-[#fcfbf7] hover:text-[#140d09] border border-[#c5a880]/40 text-xs transition-colors cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Free Text Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendFreeText()}
                  placeholder="Ask a question about our planned coffees..."
                  className="flex-1 bg-[#140d09] border border-[#c5a880]/30 px-3 py-2 text-xs text-[#fcfbf7] placeholder-[#6e635d] focus:outline-none focus:border-[#c5a880]"
                />
                <button
                  type="button"
                  onClick={handleSendFreeText}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => {
          setIsWaitlistOpen(false);
          setWaitlistProduct(null);
        }}
        product={waitlistProduct}
      />
    </>
  );
};
