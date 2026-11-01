import React, { useState } from 'react';
import { X, ShieldCheck, FileText, RotateCcw, Truck, HelpCircle, Mail, BookOpen } from 'lucide-react';
import { SiteSettings } from '../types';

export type LegalDocType =
  | 'privacy'
  | 'terms'
  | 'refunds'
  | 'shipping'
  | 'contact'
  | 'faq'
  | 'about';

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
  siteSettings?: SiteSettings;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'privacy',
  siteSettings,
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  if (!isOpen) return null;

  const fssai = siteSettings?.fssaiNumber;
  const gstin = siteSettings?.gstin;
  const supportEmail = siteSettings?.supportEmail || 'support@caphevietnam.in';
  const whatsapp = siteSettings?.whatsappNumber;
  const dispatchWindow = siteSettings?.dispatchWindow || '24 to 48 business hours';
  const freeThreshold = siteSettings?.freeShippingThreshold || 799;

  const tabs: Array<{ id: LegalDocType; label: string; icon: any }> = [
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'refunds', label: 'Refunds & Returns', icon: RotateCcw },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'contact', label: 'Contact & Inquiries', icon: Mail },
    { id: 'faq', label: 'Knowledge & FAQ', icon: HelpCircle },
    { id: 'about', label: 'Our Story & Terroirs', icon: BookOpen },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="relative w-full max-w-4xl bg-[#fcfbf7] text-[#140d09] rounded-2xl shadow-2xl border border-[#c5a880]/30 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-[#140d09] text-[#fcfbf7] border-b border-[#c5a880]/20 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block font-medium">
              Legal & Roastery Transparency
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-[#fcfbf7] tracking-tight">
              Cà Phê Vietnam Policies & Information
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8c827a] hover:text-[#fcfbf7] rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="border-b border-[#c5a880]/20 bg-white/60 px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeDoc === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDoc(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#140d09] text-[#fcfbf7] font-medium shadow-xs'
                    : 'text-[#6e635d] hover:text-[#140d09] hover:bg-black/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#c5a880]' : 'text-[#8c827a]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-[#3a312a] font-light leading-relaxed">
          {/* 1. PRIVACY POLICY */}
          {activeDoc === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-[#c5a880]/20 pb-4">
                <h3 className="text-xl font-serif text-[#140d09]">Privacy Policy & Data Protection</h3>
                <p className="text-[11px] text-[#8c827a] mt-1">
                  Compliant with the Information Technology Act, 2000 and Digital Personal Data Protection Act (DPDPA).
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-serif text-[#140d09]">1. Information We Collect</h4>
                <p>
                  When you visit or place an order on <strong>www.caphevietnam.in</strong>, we collect personal information strictly necessary to fulfill your artisanal coffee orders, communicate tracking updates, and maintain our direct-trade relationship. This includes:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Identity & Contact:</strong> Full name, shipping address, landmark, PIN code, contact telephone/mobile number, and email address.</li>
                  <li><strong>Order History:</strong> Product items ordered, grind selections, package sizes, order totals, and payment status.</li>
                  <li><strong>Technical & Session Data:</strong> IP address, device browser type, and anonymous usage telemetry for optimal performance.</li>
                </ul>

                <h4 className="text-sm font-serif text-[#140d09]">2. Payment Processing Security</h4>
                <p>
                  We <strong>never store, inspect, or process your credit/debit card numbers, CVVs, or UPI PINs</strong>. All online transactions are handled through PCI-DSS Level 1 compliant secure gateways operated by <strong>Razorpay</strong>. Payment data is encrypted at transit via 256-bit SSL protocols.
                </p>

                <h4 className="text-sm font-serif text-[#140d09]">3. Direct-Trade Communications & Marketing Consent</h4>
                <p>
                  You are only enrolled in promotional communications if you affirmatively consent (e.g. by subscribing to the Roastery Dispatch or checking an opt-in box). You may unsubscribe at any time with a single click in any newsletter or by emailing <a href={`mailto:${supportEmail}`} className="text-[#c5a880] underline">{supportEmail}</a> with the subject line <em>"Unsubscribe"</em>.
                </p>

                <h4 className="text-sm font-serif text-[#140d09]">4. Cookie Policy & Advertising Analytics</h4>
                <p>
                  We utilize functional cookies strictly necessary to maintain your shopping bag and session state. Optional analytical pixels (such as Meta Pixel) are loaded strictly upon customer consent via our cookie banner and can be revoked at any time. We never sell or broker customer data to third-party ad networks.
                </p>

                <h4 className="text-sm font-serif text-[#140d09]">5. Data Retention & Deletion Requests</h4>
                <p>
                  Customers may request complete erasure of their account records or order history (subject to statutory Indian tax and accounting obligations) by reaching out to our Grievance Officer at <a href={`mailto:${supportEmail}`} className="text-[#c5a880] underline">{supportEmail}</a>.
                </p>
              </div>
            </div>
          )}

          {/* 2. TERMS OF SERVICE */}
          {activeDoc === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-[#c5a880]/20 pb-4">
                <h3 className="text-xl font-serif text-[#140d09]">Terms of Service</h3>
                <p className="text-[11px] text-[#8c827a] mt-1">
                  Agreement governing retail coffee orders placed through Cà Phê Vietnam.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-serif text-[#140d09]">1. Agreement to Terms</h4>
                <p>
                  By accessing <strong>www.caphevietnam.in</strong> or purchasing our coffees, you agree to be bound by these terms. Our coffees are artisanal perishable food commodities freshly roasted and packed for personal retail consumption.
                </p>

                <h4 className="text-sm font-serif text-[#140d09]">2. Product Availability & Pricing</h4>
                <p>
                  All prices listed on the website are in Indian Rupees (INR) and are <strong>inclusive of applicable Goods & Services Tax (GST)</strong>. In the event of a typographical error or harvest supply stock-out, we reserve the right to cancel an order and immediately refund the customer in full.
                </p>

                <h4 className="text-sm font-serif text-[#140d09]">3. Intellectual Property</h4>
                <p>
                  All photography, recipe instructions, brand trade dress, audio compositions, and written tasting notes are proprietary intellectual property of Cà Phê Vietnam and protected under Indian and international copyright laws.
                </p>

                <h4 className="text-sm font-serif text-[#140d09]">4. Governing Law & Dispute Resolution</h4>
                <p>
                  These terms are governed by the laws of India. Any legal dispute or claim arising shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
                </p>
              </div>
            </div>
          )}

          {/* 3. REFUNDS & RETURNS */}
          {activeDoc === 'refunds' && (
            <div className="space-y-6">
              <div className="border-b border-[#c5a880]/20 pb-4">
                <h3 className="text-xl font-serif text-[#140d09]">Refund & Cancellation Policy</h3>
                <p className="text-[11px] text-[#8c827a] mt-1">
                  Strict food safety standards for consumable roastery goods.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-serif text-[#140d09]">1. Perishable Food Safety Exemption</h4>
                <p>
                  In compliance with FSSAI regulations and global coffee safety standards, roasted whole beans, ground coffee powders, and sealed instant sachets are classified as perishable food products. For hygiene reasons, <strong>we cannot accept physical returns once the outer security degassing seal or pouch is opened</strong>.
                </p>

                <h4 className="text-sm font-serif text-[#140d09]">2. Damaged in Transit or Defective Shipments</h4>
                <p>
                  If your package arrives visibly torn, crushed, wet, or with broken seals:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[#52463f]">
                  <li>Please inspect package condition upon delivery and take clear photos or a short unboxing video.</li>
                  <li>Email your Order ID and photographic evidence to <a href={`mailto:${supportEmail}`} className="text-[#c5a880] underline">{supportEmail}</a> within <strong>48 hours of delivery</strong>.</li>
                  <li>Upon carrier verification, we will immediately dispatch a fresh replacement pouch at zero charge, or issue a 100% refund to your original payment method within 5-7 business days.</li>
                </ol>

                <h4 className="text-sm font-serif text-[#140d09]">3. Brewing Equipment & Stainless Steel Phin Filters</h4>
                <p>
                  Unused, non-food brewing accessories (such as our heavy-gauge Stainless Steel Phin Gravity Filters) may be returned within 7 calendar days of delivery in pristine, unwashed condition with all original packaging intact. Return shipping is arranged by our concierge.
                </p>

                <h4 className="text-sm font-serif text-[#140d09]">4. Order Cancellations Prior to Dispatch</h4>
                <p>
                  Orders can be cancelled free of charge provided they have not yet been packaged and handed over to our courier partner. Once the courier tracking number is generated (status updated to <em>In Transit</em>), cancellation is no longer possible.
                </p>
              </div>
            </div>
          )}

          {/* 4. SHIPPING & DELIVERY */}
          {activeDoc === 'shipping' && (
            <div className="space-y-6">
              <div className="border-b border-[#c5a880]/20 pb-4">
                <h3 className="text-xl font-serif text-[#140d09]">Shipping & Dispatch Policy</h3>
                <p className="text-[11px] text-[#8c827a] mt-1">
                  Air express and surface logistics across all serviceable Indian PIN codes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#c5a880]/30 bg-white/50 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#c5a880] font-medium block">
                      Dispatch Commitment
                    </span>
                    <p className="text-xs font-serif text-[#140d09]">
                      {dispatchWindow}
                    </p>
                    <p className="text-[10px] text-[#8c827a]">
                      Freshly roasted micro-lots roasted in batches to ensure peak aroma.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-[#c5a880]/30 bg-white/50 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#c5a880] font-medium block">
                      Complimentary Delivery
                    </span>
                    <p className="text-xs font-serif text-[#140d09]">
                      Free on orders above ₹{freeThreshold}
                    </p>
                    <p className="text-[10px] text-[#8c827a]">
                      Nominal ₹79 flat delivery fee applied on orders below the threshold.
                    </p>
                  </div>
                </div>

                <h4 className="text-sm font-serif text-[#140d09]">Logistics Partners & Transit Timelines</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Air Express (Metro Cities):</strong> 2 to 4 business days via BlueDart Air Express or Delhivery Air.</li>
                  <li><strong>Standard Surface (Rest of India):</strong> 4 to 6 business days via Delhivery or DTDC Express.</li>
                  <li><strong>Remote / North-East / J&K:</strong> 6 to 9 business days via India Post Speed Post / Delhivery.</li>
                </ul>

                <p className="text-[11px] text-[#8c827a]">
                  Real-time SMS and email tracking links are generated immediately upon dispatch. You can track your parcel anytime using the <strong>Track Order</strong> tab with your Order ID and phone/email.
                </p>
              </div>
            </div>
          )}

          {/* 5. CONTACT & INQUIRIES */}
          {activeDoc === 'contact' && (
            <div className="space-y-6">
              <div className="border-b border-[#c5a880]/20 pb-4">
                <h3 className="text-xl font-serif text-[#140d09]">Roastery Concierge & Corporate Inquiries</h3>
                <p className="text-[11px] text-[#8c827a] mt-1">
                  We are here to assist with brew recipes, corporate gifting, wholesale, and orders.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#c5a880]/20 bg-white space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] block font-medium">
                      Direct Email Support
                    </span>
                    <a href={`mailto:${supportEmail}`} className="text-xs font-mono text-[#140d09] hover:text-[#c5a880] block">
                      {supportEmail}
                    </a>
                    <p className="text-[10px] text-[#8c827a]">Inquiries answered within 4-8 business hours.</p>
                  </div>

                  {whatsapp && (
                    <div className="p-4 rounded-xl border border-[#c5a880]/20 bg-white space-y-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] block font-medium">
                        WhatsApp Concierge
                      </span>
                      <a
                        href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#140d09] hover:text-[#c5a880] block"
                      >
                        {whatsapp}
                      </a>
                      <p className="text-[10px] text-[#8c827a]">Direct messaging with our roastery team.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-[#140d09]/5 border border-[#c5a880]/20 space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] block font-medium">
                    Statutory Roastery Registry
                  </span>
                  <div className="space-y-1 text-xs">
                    <p><strong>Brand Entity:</strong> Cà Phê Vietnam Artisanal Roastery</p>
                    <p><strong>Registered Office:</strong> [Edit before launch: Registered Business Address, Karnataka, India - 560001]</p>
                    {fssai && <p><strong>FSSAI Central Licence:</strong> <span className="font-mono">{fssai}</span></p>}
                    {gstin && <p><strong>GST Identification Number (GSTIN):</strong> <span className="font-mono">{gstin}</span></p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. KNOWLEDGE & FAQ */}
          {activeDoc === 'faq' && (
            <div className="space-y-6">
              <div className="border-b border-[#c5a880]/20 pb-4">
                <h3 className="text-xl font-serif text-[#140d09]">Artisanal Brewing Knowledge & FAQ</h3>
                <p className="text-[11px] text-[#8c827a] mt-1">
                  Common questions on Vietnamese coffee, Phin brewing, and bean chemistry.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-serif text-[#140d09]">What makes authentic Vietnamese coffee different?</h4>
                  <p>
                    Vietnam's volcanic highland soils in Buôn Ma Thuột yield prized heirloom Robusta (Peaberry Culi) and Arabica cultivars with nearly twice the antioxidant density and bold caffeine punch of standard coffees. Traditionally slow-roasted with notes of dark cacao, caramelized butter, and hazelnut, it drips drop-by-drop through a gravity Phin filter.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-serif text-[#140d09]">How do I brew with a Phin filter?</h4>
                  <p>
                    Add 20g of coarse Phin-ground coffee into the chamber, gently place the gravity damper on top without pressing down excessively, bloom with 25ml hot water (92°C-96°C) for 45 seconds, then top with 70ml hot water and cover with the lid. The coffee should slowly drip over 4 to 5 minutes into your glass over 2 tablespoons of sweetened condensed milk.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-serif text-[#140d09]">What is the shelf life and freshness window?</h4>
                  <p>
                    All our pouches feature one-way degassing valves to expel CO2 while keeping oxygen out. Unopened pouches remain fresh for 12 months from the roast date. Once opened, store in a cool, dry cupboard in an airtight jar and consume within 6 to 8 weeks for peak aroma.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. ABOUT & OUR STORY */}
          {activeDoc === 'about' && (
            <div className="space-y-6">
              <div className="border-b border-[#c5a880]/20 pb-4">
                <h3 className="text-xl font-serif text-[#140d09]">Our Heritage & Terroirs</h3>
                <p className="text-[11px] text-[#8c827a] mt-1">
                  Direct-trade relationship with heirloom micro-lot producers in Buôn Ma Thuột & Đà Lạt.
                </p>
              </div>

              <div className="space-y-4">
                <p>
                  Cà Phê Vietnam was founded on a simple conviction: Vietnamese coffee culture is one of the most sublime and misunderstood brewing traditions in the world. Rather than mass-commodity beans, we travel directly to the misty red volcanic plateaus of the Central Highlands to partner with third-generation farming families.
                </p>
                <p>
                  From hand-picked Culi (rare single-rounded peaberry cherries) to high-altitude Langbiang Arabica processed with natural honey fermentation, every batch is slow-roasted in micro-lots and packed into triple-laminate pouches with one-way degassing valves.
                </p>
                <div className="p-4 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/30 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#c5a880] font-medium block">
                    Our Direct-Trade Pledge
                  </span>
                  <p className="text-xs text-[#2b201a]">
                    We pay our highland growers well above fair-trade floor benchmarks, ensuring sustainable agroforestry, shade-grown micro-climates, and uncompromising harvest quality.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-white/90 border-t border-[#c5a880]/20 flex items-center justify-between text-xs text-[#8c827a] shrink-0">
          <span>Cà Phê Vietnam • Direct-Trade Roastery</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
