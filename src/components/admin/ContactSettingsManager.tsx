'use client';

import { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import {
  PhoneCall,
  MessageCircle,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface ContactSettingsManagerProps {
  initialSettings?: StoreSettings | null;
}

export default function ContactSettingsManager({ initialSettings }: ContactSettingsManagerProps) {
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings || null);
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings?.whatsapp_number || '07041545267');
  const [telegramNumber, setTelegramNumber] = useState(initialSettings?.telegram_number || '07047673903');
  const [telegramUrl, setTelegramUrl] = useState(initialSettings?.telegram_url || 'https://t.me/ivarstore');
  const [sellMessage, setSellMessage] = useState(initialSettings?.sell_account_message || 'Hey, I want to sell my account...');

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const s = data.settings as StoreSettings;
        setSettings(s);
        setWhatsappNumber(s.whatsapp_number || '07041545267');
        setTelegramNumber(s.telegram_number || '07047673903');
        setTelegramUrl(s.telegram_url || 'https://t.me/ivarstore');
        setSellMessage(s.sell_account_message || 'Hey, I want to sell my account...');
      }
    } catch (err) {
      console.error('Failed to load contact settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSettings) {
      loadSettings();
    }
  }, [initialSettings]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_number: whatsappNumber.trim(),
          telegram_number: telegramNumber.trim(),
          telegram_url: telegramUrl.trim(),
          sell_account_message: sellMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update contact settings');

      showToast('success', 'Contact settings updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  const normalizedWhatsApp = normalizeWhatsAppNumber(whatsappNumber);
  const testWhatsAppUrl = `https://wa.me/${normalizedWhatsApp}`;
  const testSellUrl = `https://wa.me/${normalizedWhatsApp}?text=${encodeURIComponent(sellMessage)}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading contact configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold border ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/50'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2C4A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Contact Channels & WhatsApp Setup
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Update the official numbers and prefilled click-to-chat messages across the marketplace.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/20 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* WhatsApp Settings */}
        <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1E2C4A] pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">WhatsApp Official Channel</h3>
              <p className="text-xs text-[#94A3B8]">Purchases and sell inquiries will be sent to this number.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="07041545267"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter Nigerian format (e.g. 07041545267) or international format.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A] flex flex-col justify-between">
              <div>
                <span className="block text-xs text-slate-400 mb-1">
                  Normalized wa.me International Target
                </span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  +{normalizedWhatsApp}
                </span>
              </div>
              <div className="pt-3">
                <a
                  href={testWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A3FF] hover:underline"
                >
                  <span>Test wa.me link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Settings */}
        <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1E2C4A] pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#00A3FF]/10 flex items-center justify-center text-[#00A3FF]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Telegram Channel</h3>
              <p className="text-xs text-[#94A3B8]">Secondary support and community channel.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telegram Phone Number / Display Text
              </label>
              <input
                type="text"
                required
                value={telegramNumber}
                onChange={e => setTelegramNumber(e.target.value)}
                placeholder="07047673903"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm font-mono text-white focus:outline-none focus:border-[#00A3FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telegram Direct URL or Username
              </label>
              <input
                type="text"
                required
                value={telegramUrl}
                onChange={e => setTelegramUrl(e.target.value)}
                placeholder="https://t.me/ivarstore"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
              />
              <div className="pt-2">
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A3FF] hover:underline"
                >
                  <span>Test Telegram link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sell Account Default Message */}
        <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#1E2C4A] pb-3">
            <h3 className="text-base font-bold text-white">
              &quot;Want to Sell Your Account?&quot; Prefilled Message
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Customer WhatsApp Message
            </label>
            <input
              type="text"
              required
              value={sellMessage}
              onChange={e => setSellMessage(e.target.value)}
              placeholder="Hey, I want to sell my account..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A] flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span>Preview generated URL:</span>
              <span className="block font-mono text-emerald-400 text-[11px] truncate max-w-lg mt-0.5">
                {testSellUrl}
              </span>
            </div>
            <a
              href={testSellUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Test Chat</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/25 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
