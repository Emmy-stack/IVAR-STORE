'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/types';
import {
  Video,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface HeroVideoManagerProps {
  initialSettings?: StoreSettings | null;
}

export default function HeroVideoManager({ initialSettings }: HeroVideoManagerProps) {
  const [isLoading, setIsLoading] = useState(!initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [heroTitle, setHeroTitle] = useState(initialSettings?.hero_title || 'Find Your Next Legendary FF Account.');
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings?.hero_subtitle || 'Discover rare bundles, exclusive skins, and legendary collections.');
  const [heroVideoUrl, setHeroVideoUrl] = useState(initialSettings?.hero_video_url || '');
  const [heroPosterUrl, setHeroPosterUrl] = useState(initialSettings?.hero_poster_url || '/images/hero-poster.jpg');
  const [heroVideoEnabled, setHeroVideoEnabled] = useState(initialSettings?.hero_video_enabled !== false);

  useEffect(() => {
    let ignore = false;
    if (!initialSettings) {
      fetch('/api/admin/settings')
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch'))))
        .then((data) => {
          if (!ignore && data?.settings) {
            const s = data.settings as StoreSettings;
            setHeroTitle(s.hero_title || 'Find Your Next Legendary FF Account.');
            setHeroSubtitle(s.hero_subtitle || 'Discover rare bundles, exclusive skins, and legendary collections.');
            setHeroVideoUrl(s.hero_video_url || '');
            setHeroPosterUrl(s.hero_poster_url || '/images/hero-poster.jpg');
            setHeroVideoEnabled(s.hero_video_enabled !== false);
          }
        })
        .catch((err) => {
          console.error('Failed to load settings:', err);
        })
        .finally(() => {
          if (!ignore) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [initialSettings]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Video File Upload Handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'hero-media');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video upload failed');

      setHeroVideoUrl(data.url);
      showToast('success', 'Hero video uploaded successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading video';
      showToast('error', msg);
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  // Poster File Upload Handler
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPoster(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'hero-media');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Poster upload failed');

      setHeroPosterUrl(data.url);
      showToast('success', 'Hero poster image uploaded successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading poster image';
      showToast('error', msg);
    } finally {
      setIsUploadingPoster(false);
      e.target.value = '';
    }
  };

  // Save Settings Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_title: heroTitle.trim(),
          hero_subtitle: heroSubtitle.trim(),
          hero_video_url: heroVideoUrl.trim(),
          hero_poster_url: heroPosterUrl.trim(),
          hero_video_enabled: heroVideoEnabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      showToast('success', 'Hero configuration published successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving settings';
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading hero video configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
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
            Hero Video & Banner Controls
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Upload Free Fire gameplay videos, fallback posters, and customize the hero text.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/20 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Publishing...' : 'Save & Publish Changes'}</span>
        </button>
      </div>

      {/* Live Preview Container */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#00A3FF]" /> Live Storefront Hero Preview
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {heroVideoEnabled && heroVideoUrl ? 'Video Mode Active' : 'Poster Mode Active'}
          </span>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#1E2C4A] shadow-2xl flex items-center justify-center text-center p-6">
          {/* Media Player */}
          {heroVideoEnabled && heroVideoUrl ? (
            <video
              key={heroVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              controls
              poster={heroPosterUrl}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
              <source src={heroVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 opacity-60">
              <Image
                src={heroPosterUrl || '/images/hero-poster.jpg'}
                alt="Hero preview poster"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Overlay Grid */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-[#080D1A]/60 to-transparent pointer-events-none" />

          {/* Preview Text */}
          <div className="relative z-10 max-w-xl">
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight mb-2 drop-shadow-lg">
              {heroTitle || 'Find Your Next Legendary FF Account.'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 drop-shadow">
              {heroSubtitle || 'Discover rare bundles, exclusive skins, and legendary collections.'}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-[#1E2C4A] pb-3">
            Hero Media Settings
          </h3>

          {/* Video Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A]">
            <div>
              <span className="block text-sm font-bold text-white">
                Enable Hero Gameplay Video
              </span>
              <span className="text-xs text-[#94A3B8]">
                If disabled, the fallback poster image will be displayed instead.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={heroVideoEnabled}
                onChange={e => setHeroVideoEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563FF]" />
            </label>
          </div>

          {/* Video Upload & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Hero Gameplay Video (MP4 / WebM)
              </label>
              <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1E2C4A] hover:border-[#00A3FF] rounded-xl bg-[#080D1A] transition-colors">
                <Video className="w-8 h-8 text-[#00A3FF] mb-2" />
                <span className="text-xs font-bold text-white">
                  {isUploadingVideo ? 'Uploading Video...' : 'Select Video File'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Upload up to 100MB video file
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  disabled={isUploadingVideo}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Poster / Fallback Image
              </label>
              <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1E2C4A] hover:border-[#00A3FF] rounded-xl bg-[#080D1A] transition-colors">
                <Upload className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-xs font-bold text-white">
                  {isUploadingPoster ? 'Uploading Poster...' : 'Select Poster Image'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  JPG or WebP fallback artwork
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePosterUpload}
                  disabled={isUploadingPoster}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Direct URLs (Optional Manual Input) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Video URL / Path
              </label>
              <input
                type="text"
                value={heroVideoUrl}
                onChange={e => setHeroVideoUrl(e.target.value)}
                placeholder="https://.../hero.mp4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-xs font-mono text-white focus:outline-none focus:border-[#00A3FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Poster URL / Path
              </label>
              <input
                type="text"
                value={heroPosterUrl}
                onChange={e => setHeroPosterUrl(e.target.value)}
                placeholder="/images/hero-poster.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-xs font-mono text-white focus:outline-none focus:border-[#00A3FF]"
              />
            </div>
          </div>
        </div>

        {/* Text Content Customization */}
        <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-[#1E2C4A] pb-3">
            Hero Heading & Copywriting
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Main Hero Heading
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={e => setHeroTitle(e.target.value)}
              placeholder="Find Your Next Legendary FF Account."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Supporting Subheading
            </label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={e => setHeroSubtitle(e.target.value)}
              placeholder="Discover rare bundles, exclusive skins, and legendary collections."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2C4A] text-sm text-white focus:outline-none focus:border-[#00A3FF]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#00A3FF]/25 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
