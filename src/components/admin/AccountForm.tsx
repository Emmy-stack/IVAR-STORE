'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Account, AccountImage, AccountStatus } from '@/types';
import { FF_RANKS } from '@/lib/constants';
import {
  Upload,
  Star,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Save,
} from 'lucide-react';

interface AccountFormProps {
  initialAccount?: Account;
  nextProductId?: string;
}

export default function AccountForm({
  initialAccount,
  nextProductId = 'IVAR-FF-0001',
}: AccountFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialAccount);

  // Form State
  const [productId, setProductId] = useState(initialAccount?.product_id || nextProductId);
  const [title, setTitle] = useState(initialAccount?.title || '');
  const [description, setDescription] = useState(initialAccount?.description || '');
  const [price, setPrice] = useState<string>(initialAccount ? String(initialAccount.price) : '');
  const [level, setLevel] = useState<string>(initialAccount?.level ? String(initialAccount.level) : '70');
  const [rank, setRank] = useState(initialAccount?.rank || 'Grandmaster');
  const [skinCount, setSkinCount] = useState<string>(initialAccount?.skin_count ? String(initialAccount.skin_count) : '0');
  const [bundleCount, setBundleCount] = useState<string>(initialAccount?.bundle_count ? String(initialAccount.bundle_count) : '0');
  const [status, setStatus] = useState<AccountStatus>(initialAccount?.status || 'available');
  const [published, setPublished] = useState(initialAccount?.published !== undefined ? initialAccount.published : true);
  const [featured, setFeatured] = useState(Boolean(initialAccount?.featured));

  // Arrays
  const [rareSkins, setRareSkins] = useState<string[]>(initialAccount?.rare_skins || []);
  const [rareBundles, setRareBundles] = useState<string[]>(initialAccount?.rare_bundles || []);
  const [emotes, setEmotes] = useState<string[]>(initialAccount?.emotes || []);
  const [weapons, setWeapons] = useState<string[]>(initialAccount?.weapons || []);
  const [tags, setTags] = useState<string[]>(initialAccount?.tags || []);

  // Image Gallery State
  const [images, setImages] = useState<{ storage_path: string; is_primary: boolean }[]>(
    initialAccount?.images?.map(img => ({
      storage_path: img.storage_path,
      is_primary: img.is_primary,
    })) || [
      { storage_path: '/images/sample-acc-1.jpg', is_primary: true },
      { storage_path: '/images/sample-acc-3.jpg', is_primary: false },
    ]
  );

  // Helpers for adding array items
  const [skinInput, setSkinInput] = useState('');
  const [bundleInput, setBundleInput] = useState('');
  const [emoteInput, setEmoteInput] = useState('');
  const [weaponInput, setWeaponInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // UI status
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Add Item to Array
  const addItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    val: string,
    setVal: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (val.trim()) {
      setList([...list, val.trim()]);
      setVal('');
    }
  };

  const removeItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  // Upload Screenshot Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'account-images');

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        const isFirst = images.length === 0;
        setImages(prev => [
          ...prev,
          { storage_path: data.url, is_primary: isFirst },
        ]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading file(s)');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const setPrimaryImage = (index: number) => {
    setImages(prev =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some(img => img.is_primary)) {
        next[0].is_primary = true;
      }
      return next;
    });
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim()) {
      setErrorMessage('Account Title is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage('Please enter a valid positive price in Naira');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Please provide at least one account screenshot');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      account: {
        product_id: productId.trim(),
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        level: Number(level) || 1,
        rank,
        skin_count: Number(skinCount) || 0,
        bundle_count: Number(bundleCount) || 0,
        rare_skins: rareSkins,
        rare_bundles: rareBundles,
        emotes,
        weapons,
        tags,
        status,
        published,
        featured,
      },
      images,
    };

    try {
      const url = isEditing
        ? `/api/admin/accounts/${initialAccount?.id}`
        : '/api/admin/accounts';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save account');
      }

      setSuccessMessage('Account saved successfully! Redirecting...');
      setTimeout(() => {
        router.push('/admin/accounts');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Basic Info Section */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-[#1E2C4A] pb-3">
          1. General Listing Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Unique Product ID *
            </label>
            <input
              type="text"
              required
              value={productId}
              onChange={e => setProductId(e.target.value)}
              placeholder="e.g. IVAR-FF-0001"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm font-mono text-[#00A3FF] focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Level 85 Grandmaster | AK47 Blue Flame Draco (Max) + Sakura"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Price in Naira (₦) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="85000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Level
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={level}
              onChange={e => setLevel(e.target.value)}
              placeholder="75"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Rank
            </label>
            <select
              value={rank}
              onChange={e => setRank(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            >
              {FF_RANKS.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Availability Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as AccountStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            >
              <option value="available">Available (Public can buy)</option>
              <option value="reserved">Reserved (Under escrow)</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Full Description & Locker Highlights
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detailed description of login method, clean binds, EVO gun levels, exclusive badges..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
          />
        </div>

        {/* Toggles: Featured & Published */}
        <div className="flex flex-wrap items-center gap-8 pt-2">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded bg-[#080D1A] border-[#1E2C4A] text-[#2563FF] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-300">
              Highlight as Featured on Homepage
            </span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="w-4 h-4 rounded bg-[#080D1A] border-[#1E2C4A] text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-300">
              Publish Listing (Uncheck to save as private Draft)
            </span>
          </label>
        </div>
      </div>

      {/* Account Screenshots & Gallery Management */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1E2C4A] pb-3">
          <div>
            <h3 className="text-base font-bold text-white">2. Account Screenshots & Gallery</h3>
            <p className="text-xs text-[#94A3B8]">Upload multiple screenshots. Select the primary showcase image.</p>
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00A3FF]/20 border border-[#00A3FF]/40 hover:bg-[#00A3FF]/30 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Upload Screenshot'}</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl overflow-hidden aspect-video border-2 bg-black group transition-all ${
                img.is_primary ? 'border-[#00A3FF] shadow-lg shadow-[#00A3FF]/20' : 'border-[#1E2C4A]'
              }`}
            >
              <Image
                src={img.storage_path}
                alt={`Screenshot ${idx + 1}`}
                fill
                sizes="200px"
                className="object-cover"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrimaryImage(idx)}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    img.is_primary ? 'bg-amber-500 text-black' : 'bg-black/70 text-white hover:bg-black'
                  }`}
                  title={img.is_primary ? 'Current primary image' : 'Set as primary showcase image'}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {img.is_primary && (
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  Primary
                </span>
              )}
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-full p-8 text-center border-2 border-dashed border-[#1E2C4A] rounded-xl text-xs text-slate-500">
              No screenshots uploaded yet. Tap &quot;Upload Screenshot&quot; above to add images.
            </div>
          )}
        </div>
      </div>

      {/* Item Breakdown (Rare Skins, Bundles, Weapons, Emotes, Tags) */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-[#1E2C4A] pb-3">
          3. Locker Breakdown & Keywords
        </h3>

        {/* Rare Skins */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Rare Gun Skins & Evo Weapons
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. AK47 Blue Flame Draco (Lv 7 Max)"
              value={skinInput}
              onChange={e => setSkinInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem(rareSkins, setRareSkins, skinInput, setSkinInput))}
              className="flex-1 px-3 py-2 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-xs text-white"
            />
            <button
              type="button"
              onClick={() => addItem(rareSkins, setRareSkins, skinInput, setSkinInput)}
              className="px-3 py-2 rounded-xl bg-[#1E2C4A] hover:bg-[#2563FF] text-white text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rareSkins.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080D1A] border border-[#1E2C4A] text-xs text-slate-200">
                <span>{item}</span>
                <button type="button" onClick={() => removeItem(rareSkins, setRareSkins, idx)} className="text-slate-500 hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Rare Bundles */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Rare Bundles & OG Outfits
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Season 1 Sakura Kimono Bundle"
              value={bundleInput}
              onChange={e => setBundleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem(rareBundles, setRareBundles, bundleInput, setBundleInput))}
              className="flex-1 px-3 py-2 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-xs text-white"
            />
            <button
              type="button"
              onClick={() => addItem(rareBundles, setRareBundles, bundleInput, setBundleInput)}
              className="px-3 py-2 rounded-xl bg-[#1E2C4A] hover:bg-[#2563FF] text-white text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rareBundles.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080D1A] border border-[#1E2C4A] text-xs text-purple-200">
                <span>{item}</span>
                <button type="button" onClick={() => removeItem(rareBundles, setRareBundles, idx)} className="text-slate-500 hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Emotes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Emotes
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Throne Emote, Flowers of Love"
              value={emoteInput}
              onChange={e => setEmoteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem(emotes, setEmotes, emoteInput, setEmoteInput))}
              className="flex-1 px-3 py-2 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-xs text-white"
            />
            <button
              type="button"
              onClick={() => addItem(emotes, setEmotes, emoteInput, setEmoteInput)}
              className="px-3 py-2 rounded-xl bg-[#1E2C4A] hover:bg-[#2563FF] text-white text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {emotes.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080D1A] border border-[#1E2C4A] text-xs text-slate-200">
                <span>{item}</span>
                <button type="button" onClick={() => removeItem(emotes, setEmotes, idx)} className="text-slate-500 hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Search Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Search Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Grandmaster, Max Evo, Clean Bind"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem(tags, setTags, tagInput, setTagInput))}
              className="flex-1 px-3 py-2 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-xs text-white"
            />
            <button
              type="button"
              onClick={() => addItem(tags, setTags, tagInput, setTagInput)}
              className="px-3 py-2 rounded-xl bg-[#1E2C4A] hover:bg-[#2563FF] text-white text-xs font-bold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#080D1A] border border-[#1E2C4A] text-xs text-[#00A3FF]">
                <span>#{item}</span>
                <button type="button" onClick={() => removeItem(tags, setTags, idx)} className="text-slate-500 hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form Submit Footer */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#1E2C4A]">
        <button
          type="button"
          onClick={() => router.push('/admin/accounts')}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#111A2E]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/25 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Account' : 'Publish Account'}</span>
        </button>
      </div>
    </form>
  );
}
