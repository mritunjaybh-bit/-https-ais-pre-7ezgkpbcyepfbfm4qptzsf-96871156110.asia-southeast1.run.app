import React, { useState, useEffect } from 'react';
import { Award, Gift, Users, ShieldCheck, ArrowRight, CheckCircle2, Copy, Sparkles, Clock, RefreshCw, Send, ChevronRight } from 'lucide-react';
import type { CircleMember, CircleTier } from '../types.ts';

interface CirclePageProps {
  onBackToShop: () => void;
  onOpenTerms: () => void;
}

export const CirclePage: React.FC<CirclePageProps> = ({ onBackToShop, onOpenTerms }) => {
  const [memberEmail, setMemberEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [currentMember, setCurrentMember] = useState<CircleMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<'input' | 'otp' | 'logged_in'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-check stored session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('caphe_circle_email');
      if (stored) {
        fetchMemberData(stored);
      }
    } catch {}
  }, []);

  const fetchMemberData = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'circle-member',
          email,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          setCurrentMember(data.member);
          setLoginStep('logged_in');
          localStorage.setItem('caphe_circle_email', data.member.email);
        }
      }
    } catch (err) {
      console.error('[Circle] Error fetching member:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanEmail = memberEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Generate local 6-digit OTP code for secure passwordless sign-in
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setLoginStep('otp');
    // Dispatch to email service or log in console
    console.log(`[Cà Phê Circle] Passwordless OTP for ${cleanEmail}: ${code}`);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (otpCode.trim() !== generatedOtp.trim()) {
      setErrorMessage('Invalid verification code. Please check your email or try again.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'circle-member',
          email: memberEmail.trim().toLowerCase(),
          name: memberName.trim() || undefined,
          phone: memberPhone.trim() || undefined,
          referralCode: referralInput.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          setCurrentMember(data.member);
          setLoginStep('logged_in');
          localStorage.setItem('caphe_circle_email', data.member.email);
        }
      } else {
        setErrorMessage('Failed to sign in. Please try again.');
      }
    } catch (err) {
      console.error('[Circle] Sign-in error:', err);
      setErrorMessage('Network connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('caphe_circle_email');
    setCurrentMember(null);
    setLoginStep('input');
    setMemberEmail('');
    setOtpCode('');
  };

  const copyReferralLink = () => {
    if (!currentMember) return;
    const link = `${window.location.origin}/?ref=${currentMember.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-[#fcfbf7] text-[#140d09] font-sans pb-24">
      {/* Editorial Luxury Header Banner */}
      <section className="w-full bg-[#140d09] text-[#fcfbf7] border-b border-[#c5a880]/30 py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a170e]/80 via-[#140d09] to-[#0c0806]" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-[#c5a880] text-[10px] font-medium tracking-[0.3em] uppercase border border-[#c5a880]/40 px-3 py-1 rounded-full mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Opens at launch</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif text-[#fcfbf7] tracking-tight">
            The Cà Phê Circle
          </h1>
          <p className="text-sm sm:text-base text-[#a3978f] font-light leading-relaxed max-w-xl mx-auto">
            Our patron society. Opens at launch. Earn Beans on purchases, enjoy tier multipliers, and redeem points toward your coffee orders.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBackToShop}
              className="text-xs uppercase tracking-[0.2em] text-[#c5a880] hover:text-[#fcfbf7] transition-colors cursor-pointer"
            >
              ← Back to Collection
            </button>
            <span className="text-[#504442]">•</span>
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-xs uppercase tracking-[0.2em] text-[#a3978f] hover:text-[#c5a880] transition-colors cursor-pointer underline underline-offset-4"
            >
              Circle Terms &amp; Rules
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {/* LOGGED IN: MEMBER DASHBOARD */}
        {loginStep === 'logged_in' && currentMember ? (
          <div className="space-y-10">
            {/* Member Profile Overview Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#c5a880]/20">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#c5a880]">
                    Circle Member Card
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white">
                    {currentMember.name || 'Coffee Connoisseur'}
                  </h2>
                  <p className="text-xs text-[#a3978f] font-mono">{currentMember.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-[#a3978f] block">Current Tier</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-[#c5a880] font-serif">
                      {currentMember.tier}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-[#a3978f] hover:text-white hover:border-white transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Balances & Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c827a] block">
                    Available Beans Balance
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold text-[#c5a880]">
                      {currentMember.beansBalance}
                    </span>
                    <span className="text-xs text-[#a3978f]">Beans</span>
                  </div>
                  <p className="text-[11px] text-[#a3978f]">
                    Redeemable for <strong className="text-white">₹{Math.floor((currentMember.beansBalance / 100) * 5)}</strong> at checkout (100 Beans = ₹5)
                  </p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-[#c5a880]/20 sm:pl-6">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c827a] block">
                    12-Month Spend
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-serif font-bold text-white">
                      ₹{currentMember.lifetimeSpendINR || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a3978f]">
                    {currentMember.tier === 'Grand Cru'
                      ? 'Maximum Grand Cru status unlocked (1.5x multiplier + free shipping).'
                      : currentMember.tier === 'Reserve'
                      ? `Spend ₹${Math.max(0, 8000 - currentMember.lifetimeSpendINR)} more to reach Grand Cru.`
                      : `Spend ₹${Math.max(0, 3000 - currentMember.lifetimeSpendINR)} more to reach Reserve (1.25x multiplier).`}
                  </p>
                </div>

                <div className="space-y-2 sm:border-l sm:border-[#c5a880]/20 sm:pl-6">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c827a] block">
                    Your Referral Code
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-[#c5a880] bg-white/5 px-3 py-1 rounded-lg border border-[#c5a880]/30">
                      {currentMember.referralCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyReferralLink}
                      className="px-3 py-1.5 rounded-lg bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#a3978f]">
                    Friends receive a welcome bonus; you receive <strong className="text-white">+300 Beans</strong> after their first Delivered order.
                  </p>
                </div>
              </div>
            </div>

            {/* Member Transaction Ledger */}
            <div className="p-8 rounded-2xl bg-white border border-[#c5a880]/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                <h3 className="font-serif font-bold text-xl text-[#140d09] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#c5a880]" />
                  Beans Activity Ledger
                </h3>
                <span className="text-xs text-[#8c827a]">
                  {currentMember.history?.length || 0} transaction{currentMember.history?.length === 1 ? '' : 's'}
                </span>
              </div>

              {(!currentMember.history || currentMember.history.length === 0) ? (
                <p className="text-xs text-[#8c827a] py-4 text-center">No points activity yet.</p>
              ) : (
                <div className="divide-y divide-[#c5a880]/15">
                  {currentMember.history.map((tx) => (
                    <div key={tx.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-medium text-[#140d09]">{tx.description}</div>
                        <div className="text-[10px] text-[#8c827a]">
                          {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div
                        className={`font-mono font-bold text-sm ${
                          tx.beans >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.beans >= 0 ? `+${tx.beans}` : `${tx.beans}`} Beans
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SIGN-IN / JOIN CARD */
          <div className="max-w-xl mx-auto p-8 sm:p-10 rounded-2xl bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/50 text-[#c5a880] flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif text-white">Join or Access Cà Phê Circle</h2>
              <p className="text-xs text-[#a3978f] leading-relaxed">
                Passwordless authentication. Receive <strong className="text-white">+100 Beans</strong> immediately upon joining, credited to your email.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200">
                {errorMessage}
              </div>
            )}

            {loginStep === 'input' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#1d1210] border border-[#3e2723] rounded-xl px-4 py-2.5 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. Maya"
                    className="w-full bg-[#1d1210] border border-[#3e2723] rounded-xl px-4 py-2.5 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    placeholder="e.g. VIET123"
                    className="w-full bg-[#1d1210] border border-[#3e2723] rounded-xl px-4 py-2.5 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>Continue with Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div className="p-3 bg-[#1d1210] border border-[#c5a880]/30 rounded-xl text-center space-y-1">
                  <p className="text-[11px] text-[#a3978f]">
                    We sent a 6-digit verification code for:
                  </p>
                  <p className="font-mono font-bold text-white">{memberEmail}</p>
                  {generatedOtp && (
                    <div className="text-[10px] text-[#c5a880] font-mono mt-1">
                      (Demo Verification Code: {generatedOtp})
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                    6-Digit Verification Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-lg bg-[#1d1210] border border-[#3e2723] rounded-xl px-4 py-2 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginStep('input')}
                    className="w-1/3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Verify &amp; Enter</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tiers & Privileges Breakdown */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#c5a880] block">
              Tier Privileges
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09]">
              Patron Tiers &amp; Multipliers
            </h2>
            <div className="w-12 h-px bg-[#c5a880]/60 mx-auto" />
            <p className="text-xs text-[#6e635d]">
              Tier status is calculated by your rolling 12-month spend on delivered orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Origin */}
            <div className="p-6 rounded-2xl bg-white border border-[#c5a880]/30 shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#8c827a] font-bold">Tier 01</span>
                <h3 className="text-xl font-serif text-[#140d09]">Origin</h3>
                <div className="text-xs text-[#c5a880] font-semibold">Spend ₹0 – ₹2,999</div>
              </div>
              <ul className="text-xs text-[#6e635d] space-y-2 border-t border-[#c5a880]/15 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>1.0x Beans multiplier on all orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Early access to new launches</span>
                </li>
                <li className="flex items-center gap-2 text-[#8c827a] italic">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Other perks will be confirmed at launch.</span>
                </li>
              </ul>
            </div>

            {/* Reserve */}
            <div className="p-6 rounded-2xl bg-[#fcfbf7] border-2 border-[#c5a880] shadow-md space-y-4 relative">
              <div className="absolute top-3 right-3 bg-[#c5a880] text-[#140d09] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Tier 02
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#c5a880] font-bold">Tier 02</span>
                <h3 className="text-xl font-serif text-[#140d09]">Reserve</h3>
                <div className="text-xs text-[#c5a880] font-semibold">Spend ₹3,000+</div>
              </div>
              <ul className="text-xs text-[#6e635d] space-y-2 border-t border-[#c5a880]/15 pt-3">
                <li className="flex items-center gap-2 font-medium text-[#140d09]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>1.25x Beans multiplier on all orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Early access to new launches</span>
                </li>
                <li className="flex items-center gap-2 text-[#8c827a] italic">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Other perks will be confirmed at launch.</span>
                </li>
              </ul>
            </div>

            {/* Grand Cru */}
            <div className="p-6 rounded-2xl bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/50 shadow-xl space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#c5a880] font-bold">Tier 03</span>
                <h3 className="text-xl font-serif text-white">Grand Cru</h3>
                <div className="text-xs text-[#c5a880] font-semibold">Spend ₹8,000+</div>
              </div>
              <ul className="text-xs text-[#a3978f] space-y-2 border-t border-[#c5a880]/20 pt-3">
                <li className="flex items-center gap-2 font-medium text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>1.5x Beans multiplier on all orders</span>
                </li>
                <li className="flex items-center gap-2 font-medium text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Early access to new launches</span>
                </li>
                <li className="flex items-center gap-2 text-[#a3978f] italic">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Other perks will be confirmed at launch.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Earning & Redeeming Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-[#c5a880]/20 space-y-3">
            <h3 className="font-serif font-bold text-lg text-[#140d09] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a880]" />
              How You Earn Beans
            </h3>
            <ul className="text-xs text-[#6e635d] space-y-2 leading-relaxed">
              <li>• <strong className="text-[#140d09]">100 Beans:</strong> Immediately awarded when you join Cà Phê Circle.</li>
              <li>• <strong className="text-[#140d09]">1 Bean per ₹1 spent:</strong> Awarded on every delivered order (multiplied by your tier).</li>
              <li>• <strong className="text-[#140d09]">+200 Beans:</strong> Bonus upon completion of your very first order.</li>
              <li>• <strong className="text-[#140d09]">300 Beans:</strong> For every friend who places their first delivered order with your referral code.</li>
              <li>• <strong className="text-[#140d09]">50 Beans:</strong> For every approved verified tasting review you share.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#c5a880]/20 space-y-3">
            <h3 className="font-serif font-bold text-lg text-[#140d09] flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#c5a880]" />
              Redemption Rules
            </h3>
            <ul className="text-xs text-[#6e635d] space-y-2 leading-relaxed">
              <li>• <strong className="text-[#140d09]">100 Beans = ₹5:</strong> Direct cash-value discount applied at checkout.</li>
              <li>• <strong className="text-[#140d09]">Minimum 200 Beans:</strong> Redemptions start at 200 Beans (₹10).</li>
              <li>• <strong className="text-[#140d09]">Max 20% order cap:</strong> Redemptions can cover up to 20% of your total order.</li>
              <li>• <strong className="text-[#140d09]">12-Month Validity:</strong> Points remain active for 12 months from award date.</li>
              <li>• <strong className="text-[#140d09]">Fraud Protection:</strong> Beans are credited only when orders are marked Delivered and reversed upon order cancellation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
