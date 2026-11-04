import React from 'react';
import { ActiveTab } from '../types';
import { ArrowLeft, ShieldCheck, Award, AlertCircle } from 'lucide-react';

interface CircleTermsPageProps {
  onBackToCircle: () => void;
  onNavigateToShop: () => void;
}

export const CircleTermsPage: React.FC<CircleTermsPageProps> = ({
  onBackToCircle,
  onNavigateToShop,
}) => {
  return (
    <div className="w-full min-h-screen bg-[#fcfbf7] text-[#140d09] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-4">
          <button
            type="button"
            onClick={onBackToCircle}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6e635d] hover:text-[#140d09] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#c5a880]" />
            <span>Return to Cà Phê Circle</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToShop}
            className="text-xs uppercase tracking-[0.2em] text-[#c5a880] hover:text-[#140d09] transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#c5a880] font-medium block">
            Loyalty Charter & Policy
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#140d09] tracking-tight">
            Cà Phê Circle Terms & Conditions
          </h1>
          <p className="text-xs text-[#8c827a] font-light tracking-wider">
            Last Updated: January 2025 • Governed under the laws of the Republic of India
          </p>
        </div>

        {/* Important Notice Callout */}
        <div className="p-5 rounded-2xl bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#c5a880]">
            <AlertCircle className="w-4 h-4 text-[#c5a880]" />
            <span>Foundational Loyalty Principles</span>
          </div>
          <p className="text-xs text-[#d8cfca] font-light leading-relaxed">
            Cà Phê Beans represent private client loyalty points and have <strong>zero monetary cash value</strong>. Beans cannot be exchanged for cash, fiat currency, or transferred to bank accounts under any circumstances.
          </p>
        </div>

        {/* Core Articles */}
        <div className="space-y-8 text-xs text-[#3a312a] font-light leading-relaxed">
          {/* Article 1: Membership & Enrollment */}
          <section className="space-y-3 pb-6 border-b border-[#c5a880]/15">
            <h2 className="text-base font-serif text-[#140d09] tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center text-[11px] font-mono">
                1
              </span>
              <span>Eligibility & Account Enrollment</span>
            </h2>
            <p>
              Membership in the Cà Phê Circle is complimentary and available to individuals aged 18 and older residing in India. Accounts are indexed uniquely by verified email address and primary telephone number. Only one membership profile is permitted per client. Multiple accounts created by the same individual may be consolidated or terminated without notice.
            </p>
          </section>

          {/* Article 2: Earning Beans & Order Delivery Rule */}
          <section className="space-y-3 pb-6 border-b border-[#c5a880]/15">
            <h2 className="text-base font-serif text-[#140d09] tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center text-[11px] font-mono">
                2
              </span>
              <span>Earning Beans & The Delivery Verification Rule</span>
            </h2>
            <p>
              Members earn Beans on qualifying retail purchases at the rate corresponding to their tier:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#52463f]">
              <li><strong>Origin Tier:</strong> 1 Bean for every ₹10 spent.</li>
              <li><strong>Reserve Tier:</strong> 1.5 Beans for every ₹10 spent.</li>
              <li><strong>Grand Cru Tier:</strong> 2 Beans for every ₹10 spent.</li>
            </ul>
            <div className="p-3.5 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/20 text-[11px] text-[#2b201a]">
              <strong>Fraud Protection Safeguard:</strong> Beans are credited to your ledger exclusively upon verified delivery of your shipment by our integrated logistics carrier (status marked as <em>Delivered</em>). Pending, in-transit, cancelled, or returned orders do not accrue Beans.
            </div>
          </section>

          {/* Article 3: Cancellations, Returns & Clawbacks */}
          <section className="space-y-3 pb-6 border-b border-[#c5a880]/15">
            <h2 className="text-base font-serif text-[#140d09] tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center text-[11px] font-mono">
                3
              </span>
              <span>Cancellations, Returns & Bean Reversals</span>
            </h2>
            <p>
              If an order is cancelled or refunded for any reason, all Beans credited for that transaction are automatically reversed from the account ledger. In the event an account balance becomes negative due to subsequent redemptions prior to cancellation, the deficit will be offset against future purchases.
            </p>
          </section>

          {/* Article 4: Redemption & Checkout Value */}
          <section className="space-y-3 pb-6 border-b border-[#c5a880]/15">
            <h2 className="text-base font-serif text-[#140d09] tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center text-[11px] font-mono">
                4
              </span>
              <span>Redemption & Checkout Benefits</span>
            </h2>
            <p>
              Beans may be applied toward artisanal coffees and brewing accessories at a nominal valuation of 100 Beans = ₹50 discount. Redemptions are capped at a maximum of 30% of the cart subtotal per order to maintain sustainable economics. Beans cannot be combined with certain exclusive promotional clearance codes.
            </p>
          </section>

          {/* Article 5: Program Changes & Termination */}
          <section className="space-y-3 pb-6 border-b border-[#c5a880]/15">
            <h2 className="text-base font-serif text-[#140d09] tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center text-[11px] font-mono">
                5
              </span>
              <span>Modifications, Expiry & Program Rights</span>
            </h2>
            <p>
              Cà Phê Vietnam reserves the right to modify, adjust, suspend, or terminate the Cà Phê Circle structure, tier qualifications, or bean conversion rates upon providing 14 days prior notice via email to registered members or through an announcement on www.caphevietnam.in. Unredeemed Beans expire 12 months from the date of issuance if no qualifying purchase has been recorded within that rolling window.
            </p>
          </section>

          {/* Article 6: Contact & Support */}
          <section className="space-y-3">
            <h2 className="text-base font-serif text-[#140d09] tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center text-[11px] font-mono">
                6
              </span>
              <span>Member Inquiries & Support</span>
            </h2>
            <p>
              For balance discrepancies, tier assistance, or account inquiries, our customer care team is at your service:
            </p>
            <div className="font-mono text-xs text-[#140d09] bg-white p-3 rounded-lg border border-[#c5a880]/30 inline-block">
              mritunjay.bhardwaj@caphevietnam.in
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
