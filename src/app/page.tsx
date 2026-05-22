"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Beef, 
  Calendar, 
  Pill, 
  DollarSign, 
  Plus, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  X,
  FileText,
  AlertTriangle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { getUser, type UserSession } from "@/lib/auth";

// Types for Simulator Data
interface Cattle {
  tagId: string;
  breed: string;
  age: string;
  status: "Milking" | "Dry" | "Calf";
  avgYield: string;
  health: "Healthy" | "Treatment" | "Quarantine";
}

interface MilkLog {
  date: string;
  totalYield: string;
  milkedCows: number;
  avgPerCow: string;
}

interface BreedingRecord {
  event: string;
  cowTag: string;
  details: string;
  date: string;
}

interface FinancialItem {
  name: string;
  type: "Income" | "Expense";
  amount: number;
  category: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"herd" | "milk" | "breeding" | "financials">("herd");
  const [statusFilter, setStatusFilter] = useState<"All" | "Milking" | "Dry" | "Calf">("All");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setUser(getUser());
    setCheckingAuth(false);
  }, []);

  const triggerAction = (actionName: string) => {
    setToastMessage(`Explore Mode: "${actionName}" is disabled. This demo portal is read-only. For full write access, contact our support team.`);
    setShowToast(true);
  };

  // Simulated Data
  const cattleList: Cattle[] = [
    { tagId: "CP-0104", breed: "Sahiwal", age: "4.2 Yrs", status: "Milking", avgYield: "22 L/day", health: "Healthy" },
    { tagId: "CP-0112", breed: "Friesian", age: "3.8 Yrs", status: "Milking", avgYield: "34 L/day", health: "Healthy" },
    { tagId: "CP-0125", breed: "Cholistani", age: "5.1 Yrs", status: "Dry", avgYield: "—", health: "Treatment" },
    { tagId: "CP-0133", breed: "Sahiwal", age: "1.5 Yrs", status: "Calf", avgYield: "—", health: "Healthy" },
    { tagId: "CP-0145", breed: "Friesian", age: "2.9 Yrs", status: "Milking", avgYield: "28 L/day", health: "Healthy" },
    { tagId: "CP-0158", breed: "Cholistani", age: "0.8 Yrs", status: "Calf", avgYield: "—", health: "Healthy" },
    { tagId: "CP-0160", breed: "Sahiwal", age: "6.0 Yrs", status: "Dry", avgYield: "—", health: "Healthy" },
    { tagId: "CP-0174", breed: "Friesian", age: "4.5 Yrs", status: "Milking", avgYield: "32 L/day", health: "Healthy" },
  ];

  const milkLogs: MilkLog[] = [
    { date: "Today", totalYield: "2,840 Liters", milkedCows: 142, avgPerCow: "20.0 L" },
    { date: "Yesterday", totalYield: "2,790 Liters", milkedCows: 141, avgPerCow: "19.8 L" },
    { date: "21 May 2026", totalYield: "2,810 Liters", milkedCows: 142, avgPerCow: "19.7 L" },
    { date: "20 May 2026", totalYield: "2,850 Liters", milkedCows: 143, avgPerCow: "19.9 L" },
    { date: "19 May 2026", totalYield: "2,780 Liters", milkedCows: 140, avgPerCow: "19.8 L" },
  ];

  const breedingRecords: BreedingRecord[] = [
    { event: "Pregnancy Check", cowTag: "CP-0104", details: "Positive (60 Days)", date: "25 May 2026" },
    { event: "Artificial Insemination", cowTag: "CP-0125", details: "Sire: Sahiwal Elite-9", date: "28 May 2026" },
    { event: "Expected Calving", cowTag: "CP-0145", details: "Due: 12 Jun 2026", date: "12 Jun 2026" },
    { event: "Dry-off Schedule", cowTag: "CP-0174", details: "Dry period prep", date: "18 Jun 2026" },
  ];

  const financials: FinancialItem[] = [
    { name: "Milk Sales Revenue", type: "Income", amount: 1420000, category: "Production" },
    { name: "Calf Sales Revenue", type: "Income", amount: 350000, category: "Breeding" },
    { name: "Feed & Silage Purchase", type: "Expense", amount: 820000, category: "Nutrition" },
    { name: "Veterinary Care & Vaccines", type: "Expense", amount: 120000, category: "Healthcare" },
    { name: "Salaries & Utilities", type: "Expense", amount: 280000, category: "Operations" },
  ];

  // Filtering Logic
  const filteredCattle = statusFilter === "All" 
    ? cattleList 
    : cattleList.filter(c => c.status === statusFilter);

  return (
    <div className="min-h-screen bg-brand-background relative pb-20">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-full px-6 animate-bounce">
          <div className="bg-brand-navy border border-brand-primary/30 text-white rounded-xl shadow-card p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                {toastMessage}
              </p>
              <a 
                href="https://animalcare360.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline mt-2"
              >
                Visit animalcare360.com <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            <button 
              type="button" 
              onClick={() => setShowToast(false)} 
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-brand-navy text-white border-b border-brand-border py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.12),_transparent_50%)]" />
        <div className="section-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1 text-brand-primary font-bold text-xs tracking-[0.2em] uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CattlePro ERP Portal
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
              Precision Livestock & <br />
              <span className="text-brand-primary">Herd Management</span> ERP
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              CattlePro coordinates feed formulation, individual lactation statistics, automated medical schedules, and financial operations. Explore the read-only demonstration portal below.
            </p>
            {!user ? (
              <div className="flex flex-wrap gap-4">
                <Link href="/login" className="btn-primary !px-8 !py-4 text-base flex items-center gap-2">
                  Sign In to Portal <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/register" className="btn-outline !text-white hover:!text-brand-primary !px-8 !py-4 text-base">
                  Register Account
                </Link>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl px-5 py-3 text-sm font-semibold text-brand-primary">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                Logged In as {user.username} (Demo Explorer Mode)
              </div>
            )}
          </div>
          <div className="lg:col-span-5 hidden lg:block">
            <div className="stat-tile bg-white/5 border-white/10 text-white p-6 space-y-4">
              <h3 className="font-bold text-sm text-brand-primary tracking-wider uppercase">Quick Indicators</h3>
              <div className="space-y-3">
                {[
                  { title: "Active Farm Locations", value: "3 Sites" },
                  { title: "Herd Synchronization", value: "Real-time" },
                  { title: "Tax Compliance", value: "FBR Ready (QR receipts)" },
                ].map(({ title, value }) => (
                  <div key={title} className="flex justify-between text-xs py-2 border-b border-white/5">
                    <span className="text-slate-400 font-medium">{title}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Exploration Section */}
      <section className="section-container -mt-8 relative z-10">
        
        {/* If Guest, Show Blurred Teaser with Lock Overlay */}
        {!user ? (
          <div className="relative">
            {/* Lock Teaser Mask */}
            <div className="absolute inset-0 bg-brand-background/40 backdrop-blur-[4px] rounded-2xl z-20 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-brand-border shadow-panel">
              <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-brand-primary" />
              </div>
              <h2 className="text-2xl font-bold text-brand-navy mb-2">Portal Access Locked</h2>
              <p className="text-brand-muted text-sm max-w-sm mb-6 leading-relaxed">
                Sign in or register for a free account to access the interactive CattlePro simulator and explore real-time herd telemetry.
              </p>
              <div className="flex gap-4">
                <Link href="/login" className="btn-primary flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/register" className="btn-outline">
                  Create Account
                </Link>
              </div>
            </div>

            {/* Dummy Static Preview beneath the blur */}
            <div className="opacity-30 pointer-events-none select-none select-all-none">
              <div className="industrial-card p-6 min-h-[400px]">
                <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded"></div>
                  ))}
                </div>
                <div className="h-48 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Interactive Simulator */
          <div className="space-y-6">
            
            {/* Header Telemetry row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { title: "Total Herd Size", value: "284 Head", sub: "142 Lactating Cows", icon: Beef },
                { title: "Today's Milk Yield", value: "2,840 Liters", sub: "Avg: 20 L / cow", icon: Activity },
                { title: "Active AI Breedings", value: "24 Pending", sub: "Pregnancies logged: 68", icon: Calendar },
                { title: "Monthly Expense", value: "PKR 1.22M", sub: "Net cash flow positive", icon: DollarSign },
              ].map(({ title, value, sub, icon: Icon }) => (
                <div key={title} className="stat-tile flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">{title}</p>
                    <p className="text-xl font-bold text-brand-navy mt-0.5">{value}</p>
                    <p className="text-[10px] text-brand-muted font-medium mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Workspace */}
            <div className="industrial-card overflow-hidden">
              {/* Simulator Navigation Bar */}
              <div className="bg-brand-navy text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 gap-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping" />
                    CattlePro Live Telemetry Simulator
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Read-Only Demonstration Environment</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button 
                    type="button" 
                    onClick={() => triggerAction("Synchronize Database")}
                    className="bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-lg font-bold transition-all"
                  >
                    Sync Database
                  </button>
                  <button 
                    type="button" 
                    onClick={() => triggerAction("Export Reports")}
                    className="bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="border-b border-brand-border bg-slate-50 flex overflow-x-auto">
                {[
                  { id: "herd", label: "Herd Register & Health", count: cattleList.length },
                  { id: "milk", label: "Milk Production Logs", count: milkLogs.length },
                  { id: "breeding", label: "Breeding Schedule & AI", count: breedingRecords.length },
                  { id: "financials", label: "Farm Financials Ledger", count: financials.length },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-6 py-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeTab === t.id
                        ? "border-brand-primary text-brand-primary bg-white"
                        : "border-transparent text-brand-muted hover:text-brand-navy hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      activeTab === t.id ? "bg-green-50 text-brand-primary" : "bg-slate-200 text-slate-500"
                    }`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content Panel */}
              <div className="p-6">
                
                {/* 1. HERD TAB */}
                {activeTab === "herd" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                      <div className="flex items-center gap-2">
                        {["All", "Milking", "Dry", "Calf"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              statusFilter === s
                                ? "bg-brand-navy text-white border-brand-navy"
                                : "bg-white text-brand-muted border-brand-border hover:bg-brand-background"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => triggerAction("Add New Cattle")}
                        className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Cattle
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-brand-border">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-brand-border text-xs font-bold text-brand-muted uppercase">
                            <th className="px-4 py-3">Tag ID</th>
                            <th className="px-4 py-3">Breed</th>
                            <th className="px-4 py-3">Age</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Yield Profile</th>
                            <th className="px-4 py-3">Health Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border text-sm">
                          {filteredCattle.map((c) => (
                            <tr key={c.tagId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3.5 font-bold text-brand-navy">{c.tagId}</td>
                              <td className="px-4 py-3.5 font-medium">{c.breed}</td>
                              <td className="px-4 py-3.5 text-brand-muted">{c.age}</td>
                              <td className="px-4 py-3.5">
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  c.status === "Milking" ? "bg-green-50 text-green-700 border border-green-100" :
                                  c.status === "Dry" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                  "bg-blue-50 text-blue-700 border border-blue-100"
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-bold text-brand-navy">{c.avgYield}</td>
                              <td className="px-4 py-3.5">
                                <span className="flex items-center gap-1.5 text-xs font-semibold">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    c.health === "Healthy" ? "bg-green-500" :
                                    c.health === "Treatment" ? "bg-amber-500" : "bg-red-500"
                                  }`} />
                                  {c.health}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button 
                                  onClick={() => triggerAction(`Edit ${c.tagId}`)} 
                                  className="text-xs text-brand-primary font-bold hover:underline"
                                >
                                  Modify
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. MILK TAB */}
                {activeTab === "milk" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-brand-navy text-sm">Recent Station Production Log</h3>
                      <button 
                        type="button" 
                        onClick={() => triggerAction("Log Daily Yield")}
                        className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Log Daily Milk
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 overflow-x-auto rounded-xl border border-brand-border">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-brand-border text-xs font-bold text-brand-muted uppercase">
                              <th className="px-4 py-3">Log Date</th>
                              <th className="px-4 py-3">Total Milk Yield</th>
                              <th className="px-4 py-3">Milked Herd</th>
                              <th className="px-4 py-3">Daily Efficiency</th>
                              <th className="px-4 py-3 text-right">FBR Code</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border text-sm">
                            {milkLogs.map((log, index) => (
                              <tr key={log.date} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3.5 font-bold text-brand-navy">{log.date}</td>
                                <td className="px-4 py-3.5 font-bold text-brand-primary">{log.totalYield}</td>
                                <td className="px-4 py-3.5 text-brand-muted">{log.milkedCows} Cows</td>
                                <td className="px-4 py-3.5 font-medium">{log.avgPerCow} / Cow</td>
                                <td className="px-4 py-3.5 text-right font-mono text-xs text-brand-muted">
                                  {index === 0 ? "FBR-LIVE-OK" : "FBR-SYNCED"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* CSS Yield Graph Visualization */}
                      <div className="stat-tile flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-brand-navy text-xs uppercase tracking-wider">Weekly Yield Curve</h4>
                          <p className="text-[10px] text-brand-muted mt-0.5">Average yield fluctuation</p>
                        </div>
                        <div className="h-32 flex items-end justify-between gap-2 pt-6 px-2">
                          {[55, 68, 62, 75, 78, 85, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                              <div className="w-full bg-slate-100 rounded-t-md h-24 relative flex items-end">
                                <div 
                                  className="w-full bg-brand-primary rounded-t-md group-hover:brightness-105 transition-all" 
                                  style={{ height: `${h}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-brand-muted">Day {i+1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BREEDING TAB */}
                {activeTab === "breeding" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-brand-navy text-sm">Genetic & Breeding Telemetry</h3>
                      <button 
                        type="button" 
                        onClick={() => triggerAction("Add Breeding Record")}
                        className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Log Event
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {breedingRecords.map((rec) => (
                        <div key={rec.cowTag} className="stat-tile flex justify-between items-start hover:border-brand-primary/45 transition-colors">
                          <div className="space-y-2">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-brand-primary bg-green-50 px-2 py-0.5 rounded border border-green-100">
                              {rec.event}
                            </span>
                            <h4 className="font-bold text-brand-navy text-sm">Cow Tag: {rec.cowTag}</h4>
                            <p className="text-xs text-brand-muted">{rec.details}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-brand-muted font-bold uppercase">Target Date</p>
                            <p className="text-sm font-bold text-brand-navy mt-1">{rec.date}</p>
                            <button 
                              onClick={() => triggerAction(`Schedule vet for ${rec.cowTag}`)}
                              className="text-[10px] text-brand-primary font-bold hover:underline mt-2 block"
                            >
                              Dispatch Alert
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. FINANCIALS TAB */}
                {activeTab === "financials" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-brand-navy text-sm">Cash Flow Ledger (Pakistan Rupees)</h3>
                      <button 
                        type="button" 
                        onClick={() => triggerAction("Add Ledger Entry")}
                        className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Record Entry
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 overflow-x-auto rounded-xl border border-brand-border">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-brand-border text-xs font-bold text-brand-muted uppercase">
                              <th className="px-4 py-3">Account Name</th>
                              <th className="px-4 py-3">Category</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border text-sm">
                            {financials.map((f) => (
                              <tr key={f.name} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3.5 font-bold text-brand-navy">{f.name}</td>
                                <td className="px-4 py-3.5 font-medium text-brand-muted">{f.category}</td>
                                <td className="px-4 py-3.5">
                                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                                    f.type === "Income" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                                  }`}>
                                    {f.type}
                                  </span>
                                </td>
                                <td className={`px-4 py-3.5 text-right font-bold ${
                                  f.type === "Income" ? "text-brand-primary" : "text-red-600"
                                }`}>
                                  PKR {f.amount.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Summary Card */}
                      <div className="panel-dark flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">Monthly Summary</p>
                          <h4 className="text-2xl font-bold mt-2">Net Cash Yield</h4>
                          <p className="text-slate-300 text-xs mt-1">Reflecting operations from May 1 to May 22</p>
                        </div>
                        <div className="space-y-3 py-6 border-y border-white/10 my-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Gross Income:</span>
                            <span className="font-semibold text-brand-primary">PKR 1,770,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Expenses:</span>
                            <span className="font-semibold text-red-400">PKR 1,220,000</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-semibold text-slate-400">Net Profit:</span>
                          <span className="text-xl font-bold text-white">PKR 550,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </section>

      {/* Feature Detailed Highlights */}
      <section className="section-container mt-8">
        <h2 className="text-2xl font-bold text-brand-navy mb-8 text-center">Comprehensive Cattle Farm ERP Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Livestock Lifecycle Records",
              desc: "From dry-off schedules to vaccination calendars. Each animal is logged with genetic pedigrees and lifetime medical charts."
            },
            {
              title: "Lactation & Feed Ratios",
              desc: "Correlate milk production with custom silage configurations. Track yield indicators daily to isolate low-performance herds."
            },
            {
              title: "Tax & Compliance Ready",
              desc: "Fully integrates FBR-compliant billing for livestock sales, milk retail outlets, and feed purchase bookkeeping records."
            }
          ].map((feat) => (
            <div key={feat.title} className="stat-tile space-y-3 border-t-4 border-t-brand-primary">
              <CheckCircle2 className="w-6 h-6 text-brand-primary" />
              <h3 className="font-bold text-brand-navy text-base">{feat.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
