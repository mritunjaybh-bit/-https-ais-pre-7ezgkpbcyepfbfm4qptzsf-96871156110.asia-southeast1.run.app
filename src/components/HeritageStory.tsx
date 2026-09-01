import React, { useState } from 'react';
import { Currency, CartItem, ProductItem } from '../types';
import {
  HERITAGE_STORIES,
  VIETNAM_COFFEE_TIMELINE,
  REGIONAL_COFFEE_TRADITIONS,
} from '../data/coffeeData';
import { HeritageDivider } from './HeritageDivider';
import { BrewingGuidesSection } from './BrewingGuidesSection';
import {
  Compass,
  MapPin,
  Clock,
  Sparkles,
  Droplet,
  Flame,
  Coffee,
  Heart,
  ChevronRight,
  Quote,
  Layers,
  Leaf,
} from 'lucide-react';

interface HeritageStoryProps {
  currency?: Currency;
  onAddToCart?: (item: CartItem) => void;
  onOpenProductModal?: (item: ProductItem) => void;
}

export const HeritageStory: React.FC<HeritageStoryProps> = ({
  currency = 'INR',
  onAddToCart,
  onOpenProductModal,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('hanoi');

  const currentRegion =
    REGIONAL_COFFEE_TRADITIONS.find((r) => r.id === selectedRegion) ||
    REGIONAL_COFFEE_TRADITIONS[0];

  return (
    <section id="heritage-story-section" className="py-10 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#785a00] bg-[#feca4d]/15 px-3 py-1 rounded-full border border-[#feca4d]/30 inline-block mb-3">
          The Living Heritage • 1857 to The Modern Era
        </span>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#271310] tracking-tight leading-tight font-serif"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          The Soul of Vietnamese Coffee: Patience, Basalt Earth & Craft
        </h2>
        <p
          className="mt-4 text-base text-[#504442] leading-relaxed"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          From the mineral-dense volcanic soils of the Central Highlands to the buzzing sidewalk stools of Hanoi and Saigon, Vietnamese coffee is more than a beverage—it is a cultural ritual of mindful stillness, resilience, and culinary brilliance.
        </p>
      </div>

      {/* Featured Narrative Hero Block */}
      <div className="bg-[#faf2f0] rounded-2xl border border-[#d3c3c0]/40 overflow-hidden shadow-sm mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto">
            <img
              src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80"
              alt="Vietnamese Phin Drip Ritual"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
            <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#feca4d]">The 45-Drop Rhythm</span>
              <p className="text-sm font-serif font-bold">A Meditation in Every Cup</p>
            </div>
          </div>
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#785a00] uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>The Philosophy of Patience</span>
            </div>
            <h3
              className="text-2xl sm:text-3xl font-bold text-[#271310] font-serif leading-snug"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Why Vietnamese Coffee Demands You Slow Down
            </h3>
            <p className="text-xs sm:text-sm text-[#504442] leading-relaxed">
              In a world obsessed with instantaneous 20-second espresso shots, the Vietnamese Phin stands as an unapologetic celebration of time. Gravity does all the work: heated water gently permeates through a hand-pressed bed of dark-roasted Robusta, blooming the grounds and releasing heavy essential oils drop by single drop.
            </p>
            <p className="text-xs sm:text-sm text-[#504442] leading-relaxed">
              At a deliberate pace of <strong>40 to 45 drops per minute</strong>, watching the coffee drip over a bed of golden sweetened condensed milk is not a delay—it is a conscious pause in the day to reflect, breathe, and converse.
            </p>
            <div className="pt-2 border-t border-[#d3c3c0]/40 flex items-center justify-between text-xs text-[#785a00] font-semibold">
              <span>Zero Electricity • Zero Paper Filters</span>
              <span>100% Gravity Extraction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Regional Coffee Traditions */}
      <div className="mb-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#785a00] bg-[#feca4d]/15 px-2.5 py-0.5 rounded-full border border-[#feca4d]/30">
            Regional Alchemy
          </span>
          <h3
            className="text-2xl sm:text-3xl font-bold text-[#271310] font-serif mt-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Four Cities, Four Legendary Coffee Cultures
          </h3>
          <p className="text-xs text-[#504442] mt-1">
            Explore how climate, history, and terroir shaped iconic coffee rituals across Vietnam.
          </p>
        </div>

        {/* Region Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {REGIONAL_COFFEE_TRADITIONS.map((reg) => {
            const isSelected = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#271310] text-white border-[#271310] shadow-md'
                    : 'bg-[#faf2f0] text-[#271310] border-[#d3c3c0]/60 hover:bg-[#eee3e1]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                    {reg.id === 'hanoi' ? 'North' : reg.id === 'hue' ? 'Central' : reg.id === 'dalat' ? 'Highlands' : 'South'}
                  </span>
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#feca4d]' : 'text-[#785a00]'}`} />
                </div>
                <p className="text-xs sm:text-sm font-bold font-serif">{reg.city}</p>
                <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-[#feca4d]' : 'text-[#504442]'}`}>
                  {reg.specialty}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Region Showcase Card */}
        <div className="bg-[#faf2f0] border border-[#d3c3c0]/50 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden shadow-sm bg-[#eee6e5]">
              <img
                src={currentRegion.imageUrl}
                alt={currentRegion.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#feca4d]/20 text-[#785a00] text-xs font-bold px-3 py-1 rounded-full border border-[#feca4d]/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Specialty: {currentRegion.specialty}</span>
              </div>
              <h4
                className="text-2xl sm:text-3xl font-bold text-[#271310] font-serif"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {currentRegion.city}: {currentRegion.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#504442] leading-relaxed">
                {currentRegion.description}
              </p>
              <div className="bg-[#fff8f6] p-3.5 rounded-lg border-l-2 border-[#785a00] text-xs text-[#271310]">
                <strong>Atmosphere & Essence:</strong> {currentRegion.mood}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Historical Timeline (1857 - Present) */}
      <div className="mb-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#785a00] bg-[#feca4d]/15 px-2.5 py-0.5 rounded-full border border-[#feca4d]/30">
            Historical Milestones
          </span>
          <h3
            className="text-2xl sm:text-3xl font-bold text-[#271310] font-serif mt-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Chronicles of Vietnamese Coffee
          </h3>
          <p className="text-xs text-[#504442] mt-1">
            How a French botanist’s curiosity evolved into a 1.8-million-ton global coffee powerhouse.
          </p>
        </div>

        <div className="relative border-l-2 border-[#d3c3c0] ml-4 md:ml-32 space-y-8 pl-6 md:pl-8">
          {VIETNAM_COFFEE_TIMELINE.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Year Pill / Dot */}
              <div className="absolute -left-[31px] md:-left-[39px] top-0 w-6 h-6 rounded-full bg-[#785a00] border-4 border-[#fff8f6] flex items-center justify-center text-white" />
              <div className="md:absolute md:-left-32 md:top-0 text-xs font-bold text-[#785a00] uppercase tracking-wider mb-1 md:mb-0">
                {item.year}
              </div>
              <div className="bg-[#faf2f0] p-5 rounded-xl border border-[#d3c3c0]/40 shadow-2xs group-hover:border-[#785a00]/40 transition-colors">
                <h4
                  className="text-base font-bold text-[#271310] font-serif mb-1.5"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {item.title}
                </h4>
                <p className="text-xs text-[#504442] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terroirs Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Buon Ma Thuot Terroir Card */}
        <div className="bg-[#faf2f0] rounded-xl border border-[#d3c3c0]/40 overflow-hidden shadow-xs">
          <div className="aspect-[16/9] w-full bg-[#eee6e5] relative">
            <img
              src="https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80"
              alt="Buon Ma Thuot Coffee Estate"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#271310] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              Robusta Capital of the World
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#785a00]">
              <MapPin className="w-4 h-4" />
              <span>Buôn Ma Thuột, Đắk Lắk Province (850m)</span>
            </div>
            <h3
              className="text-2xl font-bold text-[#271310] font-serif"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              The Ancient Red Basalt Volcanic Soil
            </h3>
            <p className="text-xs sm:text-sm text-[#504442] leading-relaxed">
              Millions of years of volcanic activity blessed Buon Ma Thuot with rich, mineral-dense basalt earth (Đất Đỏ Bazan). This terroir produces Peaberry Culi Robusta with twice the caffeine of Arabica, thick syrupy body, zero sourness, and natural notes of Belgian dark chocolate, roasted hazelnuts, and cedar.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#d3c3c0]/40 text-center">
              <div className="bg-[#fff8f6] p-2 rounded">
                <p className="text-[10px] text-[#504442]">Elevation</p>
                <p className="text-xs font-bold text-[#271310]">800 - 950m</p>
              </div>
              <div className="bg-[#fff8f6] p-2 rounded">
                <p className="text-[10px] text-[#504442]">Soil Type</p>
                <p className="text-xs font-bold text-[#271310]">Volcanic Basalt</p>
              </div>
              <div className="bg-[#fff8f6] p-2 rounded">
                <p className="text-[10px] text-[#504442]">Caffeine</p>
                <p className="text-xs font-bold text-[#785a00]">2.5% - 2.8%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Da Lat Lang Biang Terroir Card */}
        <div className="bg-[#faf2f0] rounded-xl border border-[#d3c3c0]/40 overflow-hidden shadow-xs">
          <div className="aspect-[16/9] w-full bg-[#eee6e5] relative">
            <img
              src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"
              alt="Da Lat Misty Mountains"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#081c17] text-[#d0e8de] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              Highland Cloud Forest Arabica
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#785a00]">
              <MapPin className="w-4 h-4" />
              <span>Cầu Đất & Núi Lang Biang, Đà Lạt (1,650m)</span>
            </div>
            <h3
              className="text-2xl font-bold text-[#271310] font-serif"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Misty Mountain Spring Fermentation
            </h3>
            <p className="text-xs sm:text-sm text-[#504442] leading-relaxed">
              Shrouded in year-round mountain mist and crisp temperatures, Mount Lang Biang provides the slow cherry maturation required for rare Arabica Typica and Bourbon. Grown organically by indigenous K’Ho families with notes of wild jasmine blossom, bergamot, and crisp Fuji apple.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#d3c3c0]/40 text-center">
              <div className="bg-[#fff8f6] p-2 rounded">
                <p className="text-[10px] text-[#504442]">Elevation</p>
                <p className="text-xs font-bold text-[#271310]">1,500 - 1,650m</p>
              </div>
              <div className="bg-[#fff8f6] p-2 rounded">
                <p className="text-[10px] text-[#504442]">Microclimate</p>
                <p className="text-xs font-bold text-[#271310]">Misty Cloud Forest</p>
              </div>
              <div className="bg-[#fff8f6] p-2 rounded">
                <p className="text-[10px] text-[#504442]">Acidity</p>
                <p className="text-xs font-bold text-[#785a00]">Citrus & Floral</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Heritage Chapters */}
      <div className="space-y-12 mb-16">
        {HERITAGE_STORIES.map((story, idx) => (
          <div
            key={story.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <div className={`lg:col-span-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="aspect-[16/10] rounded-xl overflow-hidden shadow-sm bg-[#eee6e5]">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className={`lg:col-span-6 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#785a00]">
                {story.subtitle}
              </span>
              <h3
                className="text-2xl sm:text-3xl font-bold text-[#271310] font-serif leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {story.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#504442] leading-relaxed font-medium">
                {story.excerpt}
              </p>
              <p className="text-xs text-[#504442] leading-relaxed">
                {story.content}
              </p>
              <div className="bg-[#fff8f6] p-3.5 rounded-lg border-l-2 border-[#785a00] text-xs font-semibold text-[#271310] italic">
                “{story.highlight}”
              </div>
            </div>
          </div>
        ))}
      </div>

      <HeritageDivider variant="coffee-bean" />

      {/* Embedded Master Brewing Guides Section with Step-by-Step Timers */}
      <div className="mb-16">
        <BrewingGuidesSection
          currency={currency}
          onAddToCart={onAddToCart}
          onOpenProductModal={onOpenProductModal}
        />
      </div>

      <HeritageDivider variant="geometric" />

      {/* Sustainable Direct Trade Commitments */}
      <div className="bg-[#271310] text-[#f4eceb] rounded-2xl p-8 sm:p-12 shadow-lg">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#feca4d] bg-[#3e2723] px-3 py-1 rounded-full border border-[#feca4d]/30">
            <Leaf className="w-3.5 h-3.5 text-[#feca4d]" />
            <span>Regenerative Agriculture & Direct-Trade Pledge</span>
          </div>
          <h3
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-serif"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Honoring Vietnamese Farmers & Soil Health
          </h3>
          <p className="text-xs sm:text-sm text-[#ae8d87] leading-relaxed">
            We partner directly with multi-generational family estates in Dak Lak and Lam Dong, eliminating middlemen. By paying <strong>65% above fair-trade floor prices</strong>, we fund organic shade canopy tree planting (intercropping with avocado and black pepper), clean solar drying beds, and mountain spring bio-filtration.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#3e2723]">
            <div className="p-4 bg-[#3e2723]/60 rounded-xl text-center border border-[#5b403c]/40">
              <p className="text-2xl font-bold text-[#feca4d] font-serif">100%</p>
              <p className="text-[11px] text-white font-semibold mt-1">Shade-Canopy Grown</p>
              <p className="text-[10px] text-[#ae8d87] mt-0.5">Zero clear-cut monoculture</p>
            </div>
            <div className="p-4 bg-[#3e2723]/60 rounded-xl text-center border border-[#5b403c]/40">
              <p className="text-2xl font-bold text-[#feca4d] font-serif">+65%</p>
              <p className="text-[11px] text-white font-semibold mt-1">Above Fair-Trade Pay</p>
              <p className="text-[10px] text-[#ae8d87] mt-0.5">Direct to family estates</p>
            </div>
            <div className="p-4 bg-[#3e2723]/60 rounded-xl text-center border border-[#5b403c]/40">
              <p className="text-2xl font-bold text-[#feca4d] font-serif">0%</p>
              <p className="text-[11px] text-white font-semibold mt-1">Synthetic Additives</p>
              <p className="text-[10px] text-[#ae8d87] mt-0.5">Pure single-origin beans</p>
            </div>
          </div>
        </div>
      </div>

      <HeritageDivider variant="coffee-bean" />
    </section>
  );
};
