import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { ActiveTab } from '../types';
import {
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Coffee,
  Flame,
  Layers,
  ArrowRight,
  ShieldCheck,
  Package,
  Sparkle
} from 'lucide-react';
import { ambientAudio } from '../utils/audioEngine';

interface HeroBannerProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMatcher: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectTab,
  onOpenMatcher,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Toggle synthesized ambient cafe soundtrack
  const toggleMusic = () => {
    if (isPlayingMusic) {
      ambientAudio.stop();
      setIsPlayingMusic(false);
    } else {
      ambientAudio.start();
      setIsPlayingMusic(true);
    }
  };

  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#180b09] text-white border-b border-[#3e2723] py-14 sm:py-20 md:py-24 transition-all duration-300">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isVideoMuted}
          playsInline
          poster="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1920&q=80"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.12] saturate-[1.15]"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-barista-making-a-drip-coffee-in-a-coffee-shop-42998-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#180b09]/95 via-[#180b09]/80 to-[#180b09]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#180b09] via-transparent to-[#180b09]/70" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Brand Story & CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Header Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="inline-flex items-center gap-2 bg-[#feca4d]/15 text-[#feca4d] border border-[#feca4d]/30 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md">
                <Package className="w-3.5 h-3.5 text-[#feca4d]" />
                <span>Authentic Packaged Coffee & Instant Mixes</span>
              </div>

              {/* Ambient Sound Toggle */}
              <button
                id="ambient-music-toggle-btn"
                type="button"
                onClick={toggleMusic}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
                title="Toggle ambient background sounds"
              >
                {isPlayingMusic ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#feca4d]" />
                    <span className="text-[#feca4d]">Sound On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-white/70" />
                    <span>Ambient Sound</span>
                  </>
                )}
              </button>
            </div>

            {/* Display Headline */}
            <div className="space-y-3">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] font-serif text-[#fff8f6]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Pure Vietnamese <br />
                <span className="text-[#feca4d] italic font-normal">Coffee Powders</span> & <br />
                Instant Blends
              </h1>
              <p
                className="text-base sm:text-lg text-[#d3c3c0] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Direct from the volcanic red earth of Buôn Ma Thuột & misty peaks of Đà Lạt. Freshly ground for Phin gravity filters, espresso & French press, plus 3-in-1 condensed milk instant sachets.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                id="hero-shop-coffee-btn"
                onClick={() => onSelectTab('shop')}
                className="px-6 py-3.5 rounded-xl bg-[#feca4d] hover:bg-[#ffda7a] text-[#271310] font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Shop Coffee Powders</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-instant-matcher-btn"
                onClick={onOpenMatcher}
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-xs transition-all backdrop-blur-sm flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#feca4d]" />
                <span>Coffee Powder Matcher</span>
              </button>
            </div>

            {/* Micro Highlights Pill Row */}
            <div className="pt-4 border-t border-white/15 grid grid-cols-3 gap-3 text-left">
              <div>
                <span className="text-[10px] text-[#feca4d] font-bold uppercase tracking-wider block">Origin</span>
                <p className="text-xs font-semibold text-white">Đắk Lắk & Lâm Đồng</p>
              </div>
              <div>
                <span className="text-[10px] text-[#feca4d] font-bold uppercase tracking-wider block">Grind Profiles</span>
                <p className="text-xs font-semibold text-white">Phin, Espresso, Beans</p>
              </div>
              <div>
                <span className="text-[10px] text-[#feca4d] font-bold uppercase tracking-wider block">Shipping</span>
                <p className="text-xs font-semibold text-white">All-India Fresh Dispatch</p>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Best-Selling Packaged Products Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#271310]/85 backdrop-blur-md rounded-2xl border border-[#feca4d]/30 p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#feca4d]" />
                  <h3 className="font-serif font-bold text-sm text-white">
                    Featured Fresh Roasts
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#feca4d] bg-[#feca4d]/20 px-2 py-0.5 rounded">
                  100% Sealed Valve
                </span>
              </div>

              {/* Product Mini Previews */}
              <div className="space-y-3">
                <div
                  onClick={() => onSelectTab('shop')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=200&q=80"
                    alt="Saigon Heritage Phin Coffee Powder"
                    className="w-12 h-12 rounded-lg object-cover bg-black/40"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate font-serif">
                      Saigon Heritage Phin Powder
                    </h4>
                    <p className="text-[10px] text-[#feca4d]">70% Fine Robusta • French Butter & Cocoa Roast</p>
                    <span className="text-[11px] font-bold text-white mt-0.5 block">From ₹380 (250g)</span>
                  </div>
                </div>

                <div
                  onClick={() => onSelectTab('shop')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80"
                    alt="Saigon 3-in-1 Instant Sachet Box"
                    className="w-12 h-12 rounded-lg object-cover bg-black/40"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate font-serif">
                      Saigon 3-in-1 Instant Box (20 Sachets)
                    </h4>
                    <p className="text-[10px] text-[#feca4d]">Real Condensed Milk + Microground Robusta</p>
                    <span className="text-[11px] font-bold text-white mt-0.5 block">₹340 / Box</span>
                  </div>
                </div>

                <div
                  onClick={() => onSelectTab('shop')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=200&q=80"
                    alt="Pure Freeze-Dried Robusta Jar"
                    className="w-12 h-12 rounded-lg object-cover bg-black/40"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate font-serif">
                      Pure Freeze-Dried Robusta (100g Jar)
                    </h4>
                    <p className="text-[10px] text-[#feca4d]">100% Pure Black Coffee Crystals (No Sugar)</p>
                    <span className="text-[11px] font-bold text-white mt-0.5 block">₹480 / Jar</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card CTA */}
              <button
                onClick={() => onSelectTab('brew-studio')}
                className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-[#feca4d] font-bold text-center border border-white/15 transition-colors flex items-center justify-center gap-1.5"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Interactive Phin Brewing Guide</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
