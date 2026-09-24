import React, { useState, useRef, useEffect } from 'react';
import { Currency, ProductItem, CartItem } from '../types';
import { PRODUCT_ITEMS, getProductById } from '../data/coffeeData';
import { formatPrice } from '../utils/formatCurrency';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Coffee,
  RotateCcw,
  ArrowRight,
  Plus,
  Check,
  Zap,
  ShoppingBag
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  recommendedProductIds?: string[];
  timestamp: Date;
}

interface CoffeeMasterChatProps {
  currency: Currency;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (item: CartItem) => void;
}

const INITIAL_PROMPTS = [
  { label: '☕ Strong & Bold (High Caffeine)', query: 'I want something very strong and high caffeine for morning energy' },
  { label: '🍫 Chocolate & Cacao notes', query: 'I love dark chocolate and rich cocoa flavours' },
  { label: '🍳 Hà Nội Egg Coffee Custard', query: 'How can I make authentic Vietnamese Egg Coffee?' },
  { label: '🥥 Sweet Coconut Iced Coffee', query: 'I prefer creamy, sweet toasted coconut iced coffee' },
  { label: '⚡ Fast Instant Sachets', query: 'I need quick gourmet instant coffee sachets for work' },
  { label: '🫖 Phin Filter & Traditional Drip', query: 'Recommend a traditional Phin drip kit and coffee powder' },
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

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: "Xin chào! I am **Coffee Master**, your personal Vietnamese coffee sommelier. ☕\n\nTell me about your taste preferences — do you prefer intense high-caffeine brews, dessert-style chocolate or coconut notes, traditional slow-drip Phin powders, or instant 3-in-1 sachets?",
      recommendedProductIds: [
        'culi-highland-dark-roast-powder',
        'saigon-artisan-dark-chocolate-cacao-powder',
      ],
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat when new messages appear
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
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
      // Build conversation history for API
      const history = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/coffee-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "Here are our roaster's personal recommendations for you:",
        recommendedProductIds: Array.isArray(data.recommendedProductIds) ? data.recommendedProductIds : [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error('Coffee Master Chat request failed:', e);

      // Local fallback recommendation if network is unavailable
      const lower = text.toLowerCase();
      let fallbackIds = ['culi-highland-dark-roast-powder', 'saigon-artisan-dark-chocolate-cacao-powder'];
      let fallbackReply = "Xin chào! Based on your preference, here are authentic direct-trade Vietnamese roasts handpicked for you:";

      if (lower.includes('choc') || lower.includes('mocha') || lower.includes('sweet')) {
        fallbackIds = ['saigon-artisan-dark-chocolate-cacao-powder', 'saigon-dark-chocolate-mocha-instant-box'];
        fallbackReply = "You will adore our **Saigon Artisan Chocolate Phin Powder** co-roasted with Mekong dark cacao, or our instant **Dark Chocolate Mocha Sachets**!";
      } else if (lower.includes('egg') || lower.includes('custard')) {
        fallbackIds = ['hanoi-egg-coffee-heritage-ground-powder', 'hanoi-instant-egg-crema-latte-box'];
        fallbackReply = "For Hanoi's historic egg coffee, our **Hà Nội Heritage Egg Custard Powder** provides the thick, caramel crema foundation for fluffy whipped egg foam.";
      } else if (lower.includes('strong') || lower.includes('dark') || lower.includes('energy')) {
        fallbackIds = ['buon-ma-thuot-peaberry-robusta-cui', 'culi-highland-dark-roast-powder'];
        fallbackReply = "For maximum energy and bold crema, our **Buôn Ma Thuột Peaberry (Culi) Robusta** packs an intense 5/5 caffeine kick.";
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

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: "Xin chào! Chat reset. Let's find your dream Vietnamese coffee! Are you craving dark chocolate roasts, ultra-strong Robusta, smooth Arabica, or instant convenience?",
        recommendedProductIds: ['buon-ma-thuot-peaberry-robusta-cui', 'saigon-artisan-dark-chocolate-cacao-powder'],
        timestamp: new Date(),
      },
    ]);
  };

  const handleQuickAdd = (product: ProductItem) => {
    const defaultSize = product.availableSizes[0];
    const defaultGrind = product.availableGrinds ? product.availableGrinds[0] : undefined;

    onAddToCart({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      vietnameseName: product.vietnameseName,
      unitPriceINR: product.basePriceINR,
      quantity: 1,
      imageUrl: product.imageUrl,
      selectedSize: defaultSize.size,
      selectedGrind: defaultGrind,
      category: product.category,
    });

    setAddedItemNotice(product.id);
    setTimeout(() => {
      setAddedItemNotice((prev) => (prev === product.id ? null : prev));
    }, 2200);
  };

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
            <span>Ask <strong>Coffee Master</strong></span>
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
              <Sparkles className="w-3.5 h-3.5 text-[#fff] absolute -top-1.5 -right-2 animate-bounce" />
            </div>
            {/* Status dot */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#271310] rounded-full" />
          </button>
        </div>
      )}

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div
          id="coffee-master-chat-window"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-80px)] bg-[#fff8f6] border border-[#d3c3c0] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Chat Header */}
          <div className="bg-[#271310] text-white p-3.5 px-4 flex items-center justify-between border-b border-[#feca4d]/30 shrink-0">
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
                  Online • Vietnamese Roastery Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart Sommelier Chat"
                className="p-1.5 text-[#ae8d87] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
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

          {/* Quick Filter Prompt Chips (Top Carousel) */}
          <div className="bg-[#faf2f0] px-3 py-2 border-b border-[#d3c3c0]/40 overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5">
            {INITIAL_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt.query)}
                className="whitespace-nowrap shrink-0 text-[11px] bg-white hover:bg-[#271310] hover:text-[#feca4d] text-[#504442] border border-[#d3c3c0]/70 px-2.5 py-1 rounded-full font-medium transition-colors shadow-2xs cursor-pointer"
              >
                {prompt.label}
              </button>
            ))}
          </div>

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
                    className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#271310] text-[#f4eceb] rounded-tr-xs shadow-sm'
                        : 'bg-white border border-[#d3c3c0]/70 text-[#271310] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">
                      {msg.text.split('\n').map((paragraph, pIdx) => {
                        // Highlight bold markdown like **text**
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

                  {/* Recommended Product Cards (if any attached to bot message) */}
                  {!isUser && msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="mt-2 w-full max-w-[95%] space-y-2">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#785a00] pl-1">
                        <Sparkles className="w-3 h-3 text-[#feca4d]" />
                        <span>Sommelier Recommendations:</span>
                      </div>

                      {msg.recommendedProductIds.map((prodId) => {
                        const product = getProductById(prodId);
                        if (!product) return null;
                        const isAdded = addedItemNotice === product.id;

                        return (
                          <div
                            key={product.id}
                            className="bg-white border border-[#d3c3c0] rounded-xl p-2.5 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between gap-2.5"
                          >
                            {/* Product Thumbnail */}
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-13 h-13 rounded-lg object-cover bg-[#eee] shrink-0 border border-[#d3c3c0]/40"
                            />

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4
                                onClick={() => {
                                  onSelectProduct(product);
                                  setIsOpen(false);
                                }}
                                className="text-xs font-bold text-[#271310] truncate hover:text-[#785a00] transition-colors cursor-pointer"
                              >
                                {product.name}
                              </h4>
                              <p className="text-[10px] text-[#785a00] italic truncate">
                                {product.vietnameseName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-[#271310] font-serif">
                                  {formatPrice(product.basePriceINR, currency)}
                                </span>
                                {product.caffeineScore && (
                                  <span className="text-[9px] bg-[#faf2f0] text-[#785a00] px-1.5 py-0.2 rounded font-semibold border border-[#d3c3c0]/40 flex items-center gap-0.5">
                                    <Zap className="w-2.5 h-2.5 fill-[#feca4d] text-[#feca4d]" />
                                    {product.caffeineScore}/5
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectProduct(product);
                                  setIsOpen(false);
                                }}
                                className="px-2 py-1 rounded bg-[#faf2f0] hover:bg-[#eee3e1] text-[#271310] text-[10px] font-bold border border-[#d3c3c0] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                title="View dedicated product page"
                              >
                                <span>View</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleQuickAdd(product)}
                                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-[#785a00] hover:bg-[#8e6b00] text-white active:scale-95'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-2.5 h-2.5" />
                                    <span>Order</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
              <div className="flex items-center gap-2 text-xs text-[#785a00] bg-white border border-[#d3c3c0]/60 rounded-2xl p-2.5 px-3 max-w-[70%] shadow-2xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#785a00] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#785a00] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#785a00] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] font-medium italic">Coffee Master is brewing advice...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-2.5 bg-white border-t border-[#d3c3c0] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about roasts, egg coffee, strength..."
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
              <span>Cà Phê Vietnam AI Master Sommelier</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
