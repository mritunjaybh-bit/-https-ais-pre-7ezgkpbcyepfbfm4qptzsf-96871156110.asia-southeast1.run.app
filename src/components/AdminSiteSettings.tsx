import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, AlertCircle, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import type { SiteSettings } from '../types.ts';

interface AdminSiteSettingsProps {
  token: string | null;
  onSettingsSaved?: (settings: SiteSettings) => void;
  showToast: (msg: string) => void;
}

export const AdminSiteSettings: React.FC<AdminSiteSettingsProps> = ({
  token,
  onSettingsSaved,
  showToast,
}) => {
  const [settings, setSettings] = useState<SiteSettings>({
    preOrderMode: false,
    directCheckoutEnabled: false,
    dispatchWindow: 'Batches prepared upon official launch',
    fssaiNumber: '',
    gstin: '',
    whatsappNumber: '+91 87640 01534',
    announcementBarText: 'A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.',
    freeShippingThreshold: 0,
    supportEmail: 'mritunjay.bhardwaj@caphevietnam.in',
    publicContactEmail: 'mritunjay.bhardwaj@caphevietnam.in',
    metaPixelId: '',
    footerLegalLine: 'Cà Phê is a brand of SuleVina Global Ventures (OPC) Private Limited (incorporation in progress).',
    showPartnerAddressPublicly: false,
    partnerAddress: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin?action=site-settings', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        setError('Failed to fetch site settings from server.');
      }
    } catch (err: any) {
      console.error('[AdminSiteSettings] Fetch error:', err);
      setError('Network error connecting to roastery database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'site-settings',
          settings,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Site Settings saved successfully!');
        if (onSettingsSaved) onSettingsSaved(data.settings);
        // Dispatch event for live storefront to re-sync
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('caphe_settings_updated', { detail: data.settings }));
        }
      } else {
        setError(data.error || 'Failed to save settings.');
      }
    } catch (err: any) {
      console.error('[AdminSiteSettings] Save error:', err);
      setError('Network error while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-3 text-[#a8928e]">
        <RefreshCw className="w-6 h-6 animate-spin text-[#c5a880]" />
        <p className="text-xs">Loading roastery site settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#3e2723] pb-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#c5a880]" />
            Roastery Site Settings
          </h2>
          <p className="text-xs text-[#a8928e] mt-1">
            Global controls for the storefront. Empty values automatically hide their respective UI elements on the live site.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSettings}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#c5a880] flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Pre-Order / Waitlist Switch */}
        <div className="p-5 rounded-2xl bg-[#1d1210] border border-[#3e2723] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Pre-Order & Waitlist Mode</span>
                {settings.preOrderMode ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/40">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#a8928e] text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    Standard Store
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a8928e] mt-1">
                When activated, product cards switch from &quot;Add to Cart&quot; to &quot;Pre-Order&quot; or &quot;Join Waitlist&quot;, taking zero online payment and capturing reservations directly into the Pre-Orders log.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preOrderMode}
                onChange={(e) => setSettings({ ...settings, preOrderMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a880]"></div>
            </label>
          </div>
        </div>

        {/* Direct Online Checkout Switch */}
        <div className="p-5 rounded-2xl bg-[#1d1210] border border-[#3e2723] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Direct Online Checkout (Razorpay & COD)</span>
                {settings.directCheckoutEnabled ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/40">
                    Live Checkout
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/40">
                    Waitlist Mode Active (Default)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a8928e] mt-1">
                When switched OFF (default), checkout operates safely in Waitlist Mode with zero payments charged. When switched ON at launch, Razorpay and COD processing activate immediately.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.directCheckoutEnabled)}
                onChange={(e) => setSettings({ ...settings, directCheckoutEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Footer Legal Entity Line */}
        <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
            Footer Legal Line (Editable Entity Notice)
          </label>
          <input
            type="text"
            value={settings.footerLegalLine ?? 'Cà Phê is a brand of SuleVina Global Ventures (OPC) Private Limited (incorporation in progress).'}
            onChange={(e) => setSettings({ ...settings, footerLegalLine: e.target.value })}
            placeholder="Cà Phê is a brand of SuleVina Global Ventures (OPC) Private Limited (incorporation in progress)."
            className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
          />
          <p className="text-[10px] text-[#827472]">Displayed in the storefront footer copyright notice.</p>
        </div>

        {/* Operational & Legal Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dispatch Window */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              Roastery Dispatch Window Text
            </label>
            <input
              type="text"
              value={settings.dispatchWindow}
              onChange={(e) => setSettings({ ...settings, dispatchWindow: e.target.value })}
              placeholder="e.g. Batches prepared upon official launch"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">Displayed on product detail pages and checkout estimates.</p>
          </div>

          {/* Announcement Bar */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              Top Announcement Bar Text
            </label>
            <input
              type="text"
              value={settings.announcementBarText}
              onChange={(e) => setSettings({ ...settings, announcementBarText: e.target.value })}
              placeholder="e.g. A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon."
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">Leave blank to completely hide the announcement bar.</p>
          </div>

          {/* FSSAI Licence Number */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              FSSAI Licence Number (Strict: hidden until set)
            </label>
            <input
              type="text"
              value={settings.fssaiNumber}
              onChange={(e) => setSettings({ ...settings, fssaiNumber: e.target.value })}
              placeholder="Enter your registered 14-digit FSSAI number"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">
              Strictly invisible on storefront footer until entered.
            </p>
          </div>

          {/* GSTIN */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              GSTIN (Tax Identification)
            </label>
            <input
              type="text"
              value={settings.gstin}
              onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
              placeholder="e.g. 29ABCDE1234F1Z5"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">
              Strictly hidden on storefront footer until entered.
            </p>
          </div>

          {/* CIN (Corporate Identification Number) */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              CIN (Corporate Identification Number)
            </label>
            <input
              type="text"
              value={settings.cin || ''}
              onChange={(e) => setSettings({ ...settings, cin: e.target.value })}
              placeholder="e.g. U15400KA2026OPC123456"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">
              Strictly hidden on partner page and footer until entered.
            </p>
          </div>

          {/* IEC (Import Export Code) */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              IEC (Import Export Code)
            </label>
            <input
              type="text"
              value={settings.iec || ''}
              onChange={(e) => setSettings({ ...settings, iec: e.target.value })}
              placeholder="e.g. 0517001234"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">
              Strictly hidden on partner page and footer until entered.
            </p>
          </div>

          {/* Partner Address */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
                Registered Postal Address (for Partner Page)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#a8928e]">
                <input
                  type="checkbox"
                  checked={Boolean(settings.showPartnerAddressPublicly)}
                  onChange={(e) => setSettings({ ...settings, showPartnerAddressPublicly: e.target.checked })}
                  className="rounded-sm border-white/20 bg-white/10 text-[#c5a880] focus:ring-0 accent-[#c5a880]"
                />
                <span>Show Address Publicly on /partner</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={settings.partnerAddress || ''}
              onChange={(e) => setSettings({ ...settings, partnerAddress: e.target.value })}
              placeholder="Enter company registered postal address"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">
              Hidden on /partner unless the &quot;Show Address Publicly&quot; checkbox is ticked.
            </p>
          </div>

          {/* WhatsApp Support Number */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              WhatsApp Support Number (Floating Chat Button)
            </label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="e.g. +91 9876543210 (with country code)"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">
              Floating WhatsApp bubble is completely hidden until a valid number is entered.
            </p>
          </div>

          {/* Free Shipping Threshold */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              Free Shipping Threshold (₹ INR)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) || 0 })}
              placeholder="799"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">Orders at or above this cart value qualify for complimentary delivery.</p>
          </div>

          {/* Public Contact Email */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              Public contact email
            </label>
            <input
              type="email"
              value={settings.publicContactEmail || settings.supportEmail || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  publicContactEmail: e.target.value,
                  supportEmail: e.target.value,
                })
              }
              placeholder="mritunjay.bhardwaj@caphevietnam.in"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">Centralised public contact email used across footer, announcement bar, Circle policies, partner page, and legal documents.</p>
          </div>

          {/* Meta Pixel ID */}
          <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block">
              Meta (Facebook) Pixel ID
            </label>
            <input
              type="text"
              value={settings.metaPixelId}
              onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
              placeholder="e.g. 123456789012345"
              className="w-full bg-[#140b09] border border-[#3e2723] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
            />
            <p className="text-[10px] text-[#827472]">
              Loaded dynamically only after customer grants cookie consent. Leave blank to disable.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#d4b992] text-[#140b09] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Site Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
