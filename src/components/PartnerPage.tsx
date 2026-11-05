import React, { useState, useEffect } from 'react';
import { SiteSettings, ActiveTab } from '../types.ts';
import {
  Mail,
  Phone,
  Globe,
  FileDown,
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  Handshake,
  Layers,
  Sparkles,
  Coffee,
  Boxes,
  ClipboardList
} from 'lucide-react';

interface PartnerPageProps {
  siteSettings?: SiteSettings;
  onSelectTab?: (tab: ActiveTab) => void;
}

export const PartnerPage: React.FC<PartnerPageProps> = ({
  siteSettings,
  onSelectTab,
}) => {
  const [companyIntroPdfAvailable, setCompanyIntroPdfAvailable] = useState(false);
  const [brandPresentationPdfAvailable, setBrandPresentationPdfAvailable] = useState(false);

  useEffect(() => {
    // Check if company introduction PDF is available on the server and is not empty
    fetch('/downloads/CaPhe_Company_Introduction_India_Vietnam.pdf', { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) {
          setCompanyIntroPdfAvailable(false);
          return;
        }
        const len = res.headers.get('content-length');
        if (len !== null && parseInt(len, 10) <= 0) {
          setCompanyIntroPdfAvailable(false);
        } else {
          setCompanyIntroPdfAvailable(true);
        }
      })
      .catch(() => setCompanyIntroPdfAvailable(false));

    // Check if brand presentation PDF is available on the server and is not empty
    fetch('/downloads/CaPhe_Brand_Presentation.pdf', { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) {
          setBrandPresentationPdfAvailable(false);
          return;
        }
        const len = res.headers.get('content-length');
        if (len !== null && parseInt(len, 10) <= 0) {
          setBrandPresentationPdfAvailable(false);
        } else {
          setBrandPresentationPdfAvailable(true);
        }
      })
      .catch(() => setBrandPresentationPdfAvailable(false));
  }, []);

  const mailtoSubject = encodeURIComponent('Inquiry: Partnering with Cà Phê');
  const mailtoBody = encodeURIComponent(
    'Xin chào Mritunjay,\n\nWe are interested in discussing partnership opportunities with Cà Phê Vietnam.\n\nCompany Name:\nLocation / Country:\nArea of Interest (Distribution / OEM / Sourcing / Bulk):\nContact Number:\n\nLooking forward to speaking soon.'
  );
  const mailtoHref = `mailto:mritunjay.bhardwaj@caphevietnam.in?subject=${mailtoSubject}&body=${mailtoBody}`;

  const hasAnyComplianceNumber = Boolean(
    siteSettings?.cin || siteSettings?.gstin || siteSettings?.iec
  );

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#140d09] selection:bg-[#c5a880]/30 selection:text-[#140d09]">
      {/* SECTION 1: HERO */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 bg-[#140d09] text-[#fcfbf7] border-b border-[#c5a880]/30 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c5a880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 border border-[#c5a880]/40 px-3.5 py-1 text-[10px] uppercase tracking-[0.25em] text-[#c5a880]">
            <Sparkles className="w-3 h-3" />
            <span>Supplier & Institutional Partnerships</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-[#fcfbf7] tracking-tight leading-tight">
            Partner with Cà Phê
          </h1>

          <p className="text-sm sm:text-base md:text-lg font-serif italic text-[#c5a880] max-w-2xl mx-auto leading-relaxed">
            &ldquo;To build a premium Indian brand that connects consumers with authentic Vietnamese coffee.&rdquo;
          </p>

          {/* Action Links */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contact"
              className="px-6 py-3 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 inline-flex items-center gap-2"
            >
              <span>Initiate Conversation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {companyIntroPdfAvailable && (
              <a
                href="/downloads/CaPhe_Company_Introduction_India_Vietnam.pdf"
                download="CaPhe_Company_Introduction_India_Vietnam.pdf"
                className="px-6 py-3 border border-[#c5a880]/60 hover:bg-[#c5a880]/10 text-[#fcfbf7] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 inline-flex items-center gap-2"
              >
                <FileDown className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Download company introduction (PDF)</span>
              </a>
            )}

            {brandPresentationPdfAvailable && (
              <a
                href="/downloads/CaPhe_Brand_Presentation.pdf"
                download="CaPhe_Brand_Presentation.pdf"
                className="px-6 py-3 border border-[#c5a880]/60 hover:bg-[#c5a880]/10 text-[#fcfbf7] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 inline-flex items-center gap-2"
              >
                <FileDown className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Download brand presentation (PDF)</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: WHO WE ARE */}
      <section className="py-16 md:py-24 border-b border-[#c5a880]/20 bg-[#f8f5ee]">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-5">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c827a] block">
            01 / Identity
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09] font-normal">
            Who We Are
          </h2>
          <p className="text-sm sm:text-base text-[#4a3f37] font-light leading-relaxed">
            SuleVina Global Ventures (OPC) Private Limited (incorporation in progress) is an India-focused venture developing premium consumer product opportunities through thoughtful international sourcing and brand building. Through Cà Phê, we are exploring the introduction of Vietnamese-origin coffee products to the Indian market.
          </p>
        </div>
      </section>

      {/* SECTION 3: THREE WAYS TO WORK TOGETHER */}
      <section className="py-16 md:py-24 border-b border-[#c5a880]/20 bg-white">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c827a] block">
              02 / Collaboration Models
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09] font-normal">
              Three Ways to Work Together
            </h2>
            <p className="text-xs text-[#8c827a] font-light max-w-lg mx-auto">
              Flexible structures designed for long-term commercial harmony and mutual growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Model 1 */}
            <div className="border border-[#c5a880]/30 p-7 bg-[#fcfbf7] space-y-4 hover:border-[#c5a880] transition-colors duration-300">
              <div className="w-10 h-10 border border-[#c5a880]/60 flex items-center justify-center text-[#c5a880]">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c827a] block">
                Model I
              </span>
              <h3 className="font-serif text-lg text-[#140d09] font-normal">
                Existing-Product Distribution
              </h3>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Sourcing and distributing suitable Vietnamese coffee products in India, subject to mutually agreed commercial and regulatory arrangements.
              </p>
            </div>

            {/* Model 2 */}
            <div className="border border-[#c5a880]/30 p-7 bg-[#fcfbf7] space-y-4 hover:border-[#c5a880] transition-colors duration-300">
              <div className="w-10 h-10 border border-[#c5a880]/60 flex items-center justify-center text-[#c5a880]">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c827a] block">
                Model II
              </span>
              <h3 className="font-serif text-lg text-[#140d09] font-normal">
                OEM & Private Label
              </h3>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Exploring products manufactured to agreed specifications under the Cà Phê brand, with formats and minimum order quantities aligned to market requirements.
              </p>
            </div>

            {/* Model 3 */}
            <div className="border border-[#c5a880]/30 p-7 bg-[#fcfbf7] space-y-4 hover:border-[#c5a880] transition-colors duration-300">
              <div className="w-10 h-10 border border-[#c5a880]/60 flex items-center justify-center text-[#c5a880]">
                <Handshake className="w-5 h-5" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c827a] block">
                Model III
              </span>
              <h3 className="font-serif text-lg text-[#140d09] font-normal">
                Long-Term Sourcing
              </h3>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Building a dependable relationship based on product quality, consistency, transparent communication, reliable supply and commercially sustainable terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: OUR PRODUCT INTERESTS */}
      <section className="py-16 md:py-24 border-b border-[#c5a880]/20 bg-[#f8f5ee]">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c827a] block">
              03 / Catalog Scope
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09] font-normal">
              Our Product Interests
            </h2>
            <p className="text-xs text-[#8c827a] font-light max-w-md mx-auto">
              Our initial market entry focuses on high-convenience, distinctive Vietnamese coffee formats:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-[#c5a880]/30 space-y-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block">01 / Instant</span>
              <h4 className="font-serif text-base text-[#140d09]">Vietnamese 3-in-1 Instant Coffee</h4>
              <p className="text-xs text-[#6e635d] font-light">A convenient instant coffee format.</p>
            </div>

            <div className="p-5 bg-white border border-[#c5a880]/30 space-y-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block">02 / Pure Black</span>
              <h4 className="font-serif text-base text-[#140d09]">Pure Vietnamese Instant Black Coffee</h4>
              <p className="text-xs text-[#6e635d] font-light">A straightforward coffee-led option.</p>
            </div>

            <div className="p-5 bg-white border border-[#c5a880]/30 space-y-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block">03 / Flavoured</span>
              <h4 className="font-serif text-base text-[#140d09]">Coconut Coffee</h4>
              <p className="text-xs text-[#6e635d] font-light">A distinctive flavour direction.</p>
            </div>

            <div className="p-5 bg-white border border-[#c5a880]/30 space-y-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block">04 / Flavoured</span>
              <h4 className="font-serif text-base text-[#140d09]">Chocolate Coffee</h4>
              <p className="text-xs text-[#6e635d] font-light">A familiar flavour paired with Vietnamese coffee.</p>
            </div>

            <div className="p-5 bg-white border border-[#c5a880]/30 space-y-1.5">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block">05 / Cold Special</span>
              <h4 className="font-serif text-base text-[#140d09]">Iced Mocha</h4>
              <p className="text-xs text-[#6e635d] font-light">Additional varieties are being assessed.</p>
            </div>

            <div className="p-5 bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block">06 / Horizon</span>
                <h4 className="font-serif text-base text-[#fcfbf7]">Other Flavoured Varieties</h4>
                <p className="text-xs text-[#a3978f] font-light">Salted caramel, botanicals, and seasonal blends.</p>
              </div>
              <span className="text-[9px] text-[#c5a880] uppercase tracking-widest pt-2">Open to Evaluation</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: POTENTIAL SACHET SIZES */}
      <section className="py-16 md:py-24 border-b border-[#c5a880]/20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c827a] block">
            04 / Technical Packaging
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09] font-normal">
            Potential Sachet Sizes
          </h2>

          <div className="flex items-center justify-center gap-6 sm:gap-10 pt-4">
            <div className="w-24 h-24 border border-[#c5a880]/50 flex flex-col items-center justify-center bg-[#fcfbf7]">
              <span className="text-2xl font-serif text-[#140d09]">2g</span>
              <span className="text-[9px] uppercase tracking-wider text-[#8c827a]">Single Pure</span>
            </div>
            <div className="w-24 h-24 border border-[#c5a880]/50 flex flex-col items-center justify-center bg-[#fcfbf7]">
              <span className="text-2xl font-serif text-[#140d09]">5g</span>
              <span className="text-[9px] uppercase tracking-wider text-[#8c827a]">Intense Cup</span>
            </div>
            <div className="w-24 h-24 border border-[#c5a880]/50 flex flex-col items-center justify-center bg-[#fcfbf7]">
              <span className="text-2xl font-serif text-[#140d09]">10g</span>
              <span className="text-[9px] uppercase tracking-wider text-[#8c827a]">3-in-1 / Latte</span>
            </div>
          </div>

          <p className="text-xs text-[#6e635d] font-light italic max-w-lg mx-auto pt-2">
            These sachet sizes serve as starting points for technical and commercial discussion, not final specifications. Custom packaging configurations and multi-serve boxes will be finalised collaboratively.
          </p>
        </div>
      </section>

      {/* SECTION 6: WHAT WE WOULD LIKE TO RECEIVE */}
      <section className="py-16 md:py-24 border-b border-[#c5a880]/20 bg-[#f8f5ee]">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c827a] block">
              05 / Submission Checklist
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09] font-normal">
              What We Would Like to Receive
            </h2>
            <p className="text-xs text-[#8c827a] font-light max-w-md mx-auto">
              To expedite introductory appraisal and technical alignment, prospective partners are invited to share:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {[
              { title: 'Product Samples', desc: 'Pre-production or retail samples for sensory appraisal' },
              { title: 'Wholesale Price List', desc: 'FOB / CIF or EXW commercial pricing matrices' },
              { title: 'Minimum Order Quantities (MOQ)', desc: 'Standard production runs & tiered thresholds' },
              { title: 'Trial-Order Options', desc: 'Pilot batch terms for initial market testing' },
              { title: 'Certificates & Accreditations', desc: 'ISO, HACCP, GMP, or equivalent compliance' },
              { title: 'Export Documentation', desc: 'Phytosanitary, Certificate of Origin, and lab tests' },
              { title: 'Ingredients & Allergens', desc: 'Complete nutritional declarations and allergen profiles' },
              { title: 'Shelf Life & Stability', desc: 'Expiry validation and ambient storage guidelines' },
              { title: 'Packaging & Lead Time', desc: 'Primary/secondary packaging specs and production cycles' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-white border border-[#c5a880]/30 space-y-1">
                <div className="flex items-center gap-2 text-[#c5a880]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-serif text-sm text-[#140d09]">{item.title}</span>
                </div>
                <p className="text-[11px] text-[#6e635d] font-light pl-5.5">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#140d09] text-[#c5a880] text-center border border-[#c5a880]/30 text-xs tracking-wide">
            Note: Quotation basis and payment terms are open for discussion.
          </div>
        </div>
      </section>

      {/* SECTION 7: PARTNER FIT */}
      <section className="py-16 md:py-24 border-b border-[#c5a880]/20 bg-white">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c827a] block">
              06 / Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09] font-normal">
              Partner Fit
            </h2>
            <p className="text-xs text-[#8c827a] font-light max-w-md mx-auto">
              We look for enduring relationships built upon six fundamental operational values:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-5 border-l-2 border-[#c5a880] bg-[#fcfbf7]">
              <h4 className="font-serif text-base text-[#140d09]">Product & Consistency</h4>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Disciplined batch-to-batch taste, aroma, and solubility consistency that honors the integrity of Vietnamese coffee.
              </p>
            </div>

            <div className="space-y-2 p-5 border-l-2 border-[#c5a880] bg-[#fcfbf7]">
              <h4 className="font-serif text-base text-[#140d09]">Manufacturing & Traceability</h4>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Clear ingredient pedigree, clean facility standards, and documented processing trails from source to sachet.
              </p>
            </div>

            <div className="space-y-2 p-5 border-l-2 border-[#c5a880] bg-[#fcfbf7]">
              <h4 className="font-serif text-base text-[#140d09]">Export Readiness</h4>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Experience in international freight, export compliance, documentation, and seamless port dispatch.
              </p>
            </div>

            <div className="space-y-2 p-5 border-l-2 border-[#c5a880] bg-[#fcfbf7]">
              <h4 className="font-serif text-base text-[#140d09]">Commercial Flexibility</h4>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Openness to scale in phases, pilot new SKU formats, and adjust commercial terms as market adoption accelerates.
              </p>
            </div>

            <div className="space-y-2 p-5 border-l-2 border-[#c5a880] bg-[#fcfbf7]">
              <h4 className="font-serif text-base text-[#140d09]">Quality & Compliance</h4>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Strict adherence to Indian food safety standards (FSSAI norms), packaging mandates, and testing rigor.
              </p>
            </div>

            <div className="space-y-2 p-5 border-l-2 border-[#c5a880] bg-[#fcfbf7]">
              <h4 className="font-serif text-base text-[#140d09]">Partnership Mindset</h4>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Direct, transparent communication and a collaborative problem-solving approach to cross-border brand building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: BUSINESS AND BULK ENQUIRIES */}
      <section className="py-16 md:py-20 border-b border-[#c5a880]/20 bg-[#140d09] text-[#fcfbf7]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 border border-[#c5a880]/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#c5a880]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Institutional & Commercial</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif text-[#fcfbf7] font-normal">
            Business Enquiries
          </h2>

          <p className="text-xs sm:text-sm text-[#dcd4cb] font-light leading-relaxed max-w-2xl mx-auto">
            We welcome enquiries from hotels, cafés, resorts and corporate gifting teams.
          </p>

          <div className="pt-2">
            <a
              href={mailtoHref}
              className="px-6 py-3 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-xs uppercase tracking-[0.2em] font-medium transition-all inline-flex items-center gap-2"
            >
              <span>Submit Institutional Inquiry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 9: CONTACT BLOCK */}
      <section id="contact" className="py-16 md:py-24 border-b border-[#c5a880]/20 bg-[#f8f5ee]">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c827a] block">
              07 / Direct Communication
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09] font-normal">
              Direct Contact
            </h2>
            <p className="text-xs text-[#8c827a] font-light">
              Connect directly with our leadership team:
            </p>
          </div>

          <div className="border border-[#c5a880]/40 bg-white p-7 sm:p-9 space-y-6">
            <div className="border-b border-[#c5a880]/20 pb-5">
              <h3 className="font-serif text-2xl text-[#140d09] font-normal">
                Mritunjay Bhardwaj
              </h3>
              <p className="text-xs uppercase tracking-[0.2em] text-[#c5a880] font-medium mt-1">
                Founder
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#8c827a] block">Email</span>
                  <a
                    href={mailtoHref}
                    className="text-xs sm:text-sm font-medium text-[#140d09] hover:text-[#c5a880] transition-colors underline"
                  >
                    mritunjay.bhardwaj@caphevietnam.in
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#8c827a] block">Phone / WhatsApp</span>
                  <a
                    href="tel:+918764001534"
                    className="text-xs sm:text-sm font-medium text-[#140d09] hover:text-[#c5a880] transition-colors"
                  >
                    +91 87640 01534
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#8c827a] block">Website</span>
                  <span className="text-xs sm:text-sm text-[#140d09]">
                    www.caphevietnam.in
                  </span>
                </div>
              </div>

              {/* SECTION 10: SHOW POSTAL ADDRESS ONLY IF OWNER SETTING IS ON */}
              {siteSettings?.showPartnerAddressPublicly && siteSettings?.partnerAddress && (
                <div className="pt-3 border-t border-[#c5a880]/20 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.15em] text-[#8c827a] block">Registered Address</span>
                    <p className="text-xs text-[#4a3f37] font-light leading-relaxed whitespace-pre-line">
                      {siteSettings.partnerAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <a
                href={mailtoHref}
                className="w-full py-3 bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] hover:text-[#c5a880] text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center gap-2 border border-[#c5a880]/40"
              >
                <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Send Email to Founder</span>
              </a>
            </div>

            {/* SECTION 11: NDA STATEMENT */}
            <div className="pt-2 text-center">
              <p className="text-xs text-[#6e635d] font-light italic">
                A non-disclosure agreement (NDA) is available on request.
              </p>
            </div>

            {/* SECTION 12: STATUTORY COMPLIANCE NUMBERS (CIN, GSTIN, IEC) - SHOW ONLY IF ENTERED */}
            {hasAnyComplianceNumber && (
              <div className="pt-4 border-t border-[#c5a880]/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                {siteSettings?.cin && (
                  <div className="p-2.5 bg-[#fcfbf7] border border-[#c5a880]/20">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-[#8c827a] block">CIN</span>
                    <span className="text-xs font-mono font-medium text-[#140d09]">{siteSettings.cin}</span>
                  </div>
                )}
                {siteSettings?.gstin && (
                  <div className="p-2.5 bg-[#fcfbf7] border border-[#c5a880]/20">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-[#8c827a] block">GSTIN</span>
                    <span className="text-xs font-mono font-medium text-[#140d09]">{siteSettings.gstin}</span>
                  </div>
                )}
                {siteSettings?.iec && (
                  <div className="p-2.5 bg-[#fcfbf7] border border-[#c5a880]/20">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-[#8c827a] block">IEC</span>
                    <span className="text-xs font-mono font-medium text-[#140d09]">{siteSettings.iec}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 13: DOWNLOAD PDF BUTTONS (HIDDEN IF FILE MISSING OR EMPTY) */}
      {(companyIntroPdfAvailable || brandPresentationPdfAvailable) && (
        <section className="py-12 bg-white text-center border-b border-[#c5a880]/20">
          <div className="max-w-xl mx-auto px-6 space-y-4">
            <h3 className="font-serif text-xl text-[#140d09]">
              Institutional Dossier
            </h3>
            <p className="text-xs text-[#6e635d] font-light leading-relaxed">
              Download our comprehensive briefing documents outlining corporate vision, commercial scope, and import timelines.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {companyIntroPdfAvailable && (
                <a
                  href="/downloads/CaPhe_Company_Introduction_India_Vietnam.pdf"
                  download="CaPhe_Company_Introduction_India_Vietnam.pdf"
                  className="px-6 py-3 border border-[#140d09] bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] text-xs uppercase tracking-[0.2em] font-medium transition-all inline-flex items-center gap-2"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Download company introduction (PDF)</span>
                </a>
              )}
              {brandPresentationPdfAvailable && (
                <a
                  href="/downloads/CaPhe_Brand_Presentation.pdf"
                  download="CaPhe_Brand_Presentation.pdf"
                  className="px-6 py-3 border border-[#140d09] bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] text-xs uppercase tracking-[0.2em] font-medium transition-all inline-flex items-center gap-2"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Download brand presentation (PDF)</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER RETURN STRIP */}
      <div className="py-8 bg-[#140d09] text-center text-[#a3978f] text-xs">
        <button
          type="button"
          onClick={() => {
            if (onSelectTab) onSelectTab('shop');
            else window.location.href = '/';
          }}
          className="text-[#c5a880] hover:underline uppercase tracking-[0.15em] cursor-pointer"
        >
          &larr; Return to Main Shop
        </button>
      </div>
    </div>
  );
};
