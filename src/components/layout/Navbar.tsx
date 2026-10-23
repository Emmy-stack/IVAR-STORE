'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Shield, MessageCircle, ExternalLink, Flame } from 'lucide-react';
import { getSellAccountWhatsAppUrl } from '@/lib/whatsapp';

interface NavbarProps {
  whatsappNumber?: string;
  telegramUrl?: string;
}

export default function Navbar({ whatsappNumber }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sellUrl = getSellAccountWhatsAppUrl(whatsappNumber);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E2C4A]/80 bg-[#080D1A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#2563FF] to-[#00A3FF] flex items-center justify-center p-[2px] shadow-lg shadow-[#00A3FF]/20 group-hover:shadow-[#00A3FF]/40 transition-all duration-300">
              <div className="w-full h-full bg-[#080D1A] rounded-[10px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#00A3FF] group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-wider text-white flex items-center gap-1.5">
                IVAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563FF] to-[#00A3FF]">STORE</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-[#94A3B8] uppercase -mt-1">
                Free Fire Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-slate-300 hover:text-[#00A3FF] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#accounts-section"
              className="text-sm font-medium text-slate-300 hover:text-[#00A3FF] transition-colors"
            >
              Available Accounts
            </Link>
            <Link
              href="/#contact-section"
              className="text-sm font-medium text-slate-300 hover:text-[#00A3FF] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Right CTA: Sell Your Account Button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={sellUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white overflow-hidden transition-all duration-300 bg-gradient-to-r from-[#2563FF] to-[#00A3FF] hover:from-[#1D4ED8] hover:to-[#0284C7] shadow-lg shadow-[#2563FF]/25 hover:shadow-[#00A3FF]/40 hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Want to Sell Your Account?</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#111A2E] focus:outline-none focus:ring-2 focus:ring-[#00A3FF]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E2C4A] bg-[#080D1A]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-200 hover:text-white hover:bg-[#111A2E]"
          >
            Home
          </Link>
          <Link
            href="/#accounts-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-200 hover:text-white hover:bg-[#111A2E]"
          >
            Available Accounts
          </Link>
          <Link
            href="/#contact-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-200 hover:text-white hover:bg-[#111A2E]"
          >
            Contact
          </Link>

          <div className="pt-2">
            <a
              href={sellUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#2563FF] to-[#00A3FF] shadow-lg shadow-[#00A3FF]/25"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Want to Sell Your Account?</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
