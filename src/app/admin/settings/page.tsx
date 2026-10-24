import { assertAdminOrRedirect } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { isClerkConfigured } from '@/lib/clerk-config';
import { ADMIN_EMAIL } from '@/lib/constants';
import {
  Settings,
  Shield,
  Database,
  CheckCircle2,
  AlertTriangle,
  Key,
  Server,
  FileCode,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  await assertAdminOrRedirect();

  const isSupabase = isSupabaseConfigured();
  const isClerk = isClerkConfigured();

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2C4A]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Store & Infrastructure Settings
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            System status, security enforcement, and database migration details.
          </p>
        </div>
      </div>

      {/* Security & Authorization Status */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#1E2C4A] pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Administrator Authorization</h3>
            <p className="text-xs text-[#94A3B8]">Enforced via Clerk Authentication & server-side verified email check.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A]">
            <span className="block text-xs text-slate-400 mb-1">Authorized Root Email</span>
            <span className="font-mono text-sm font-bold text-white">{ADMIN_EMAIL}</span>
            <span className="block text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active and locked
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A]">
            <span className="block text-xs text-slate-400 mb-1">Authentication Provider</span>
            <span className="font-mono text-sm font-bold text-white">Clerk Official SDK</span>
            <span className="block text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {isClerk ? 'Live Keys Configured' : 'Keys Needed in .env.local'}
            </span>
          </div>
        </div>
      </div>

      {/* Database Connection & Persistence Info */}
      <div className="rounded-2xl bg-[#111A2E] border border-[#1E2C4A] p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-[#1E2C4A] pb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#00A3FF]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Database Engine</h3>
            <p className="text-xs text-[#94A3B8]">PostgreSQL with Supabase cloud connection.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-[#00A3FF]" />
            <div>
              <span className="block text-xs font-bold text-white">
                {isSupabase ? 'Supabase PostgreSQL (Connected)' : 'Local File-Backed Database (Active)'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isSupabase
                  ? 'Cloud database is active. All listings and files are persisted directly in Supabase.'
                  : 'Currently persisting changes to src/lib/data/local-db.json. Connect Supabase keys in .env.local to switch to cloud.'}
              </span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${isSupabase
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                : 'bg-yellow-950/80 text-yellow-400 border border-yellow-500/50'
              }`}
          >
            {isSupabase ? 'Production Mode' : 'Local Dev Mode'}
          </span>
        </div>

        {/* Database Migration Guidance */}
        <div className="p-4 rounded-xl bg-[#080D1A] border border-[#1E2C4A] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <FileCode className="w-4 h-4 text-[#00A3FF]" />
            <span>Database Migration File Location</span>
          </div>
          <code className="block p-3 rounded-lg bg-[#050811] text-xs font-mono text-[#00A3FF] border border-[#1E2C4A]/80">
            supabase/migrations/001_initial_schema.sql
          </code>
          <p className="text-[11px] text-[#94A3B8]">
            Run this migration file inside your Supabase SQL Editor to initialize all tables, RLS security policies, and storage buckets.
          </p>
        </div>
      </div>
    </div>
  );
}
