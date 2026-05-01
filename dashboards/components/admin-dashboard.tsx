"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { AdminSidebar, AdminSidebarContent } from "./admin-sidebar"
import { Check, X, TrendingUp, Users, FileText, ShoppingCart, CheckCircle2, ChevronDown, ChevronUp, Menu, RefreshCw, School, Search } from "lucide-react"
import { DASHBOARD_COLORS } from "@/lib/colors"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TestMerchantAlert } from "./test-merchant-alert"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { AdminKYC } from "./admin-kyc"
import { AdminMerchants } from "./admin-merchants"
import { AdminBranches } from "./admin-branches"
import { AdminOffers } from "./admin-offers"
import { AccountCreation } from "./account-creation"
import { AdminAuditLogs } from "./admin-audit-logs"
import { AdminNotifications } from "./admin-notifications"
import { AdminFinancials } from "./admin-financials"
import { AdminAccountDeletion } from "./admin-account-deletion"
import { AdminSystemConfig } from "./admin-system-config"
import { AdminAnalytics } from "./admin-analytics"
import { AdminRedemptionEngine } from "./admin-redemption-engine"
import { AdminBrandPortfolio } from "./admin-brand-portfolio"
import { getAdminDashboardStats, getTopPerformingMerchants, AdminDashboardStats } from "@/lib/api-client"

import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

// Top Performing Merchants Component
const TopPerformingMerchants = ({
  merchants: initialMerchants,
  isLoading: initialLoading,
}: {
  merchants: AdminDashboardStats['topPerformingMerchants'] | null,
  isLoading: boolean,
}) => {
  const [merchants, setMerchants] = useState<AdminDashboardStats['topPerformingMerchants'] | null>(initialMerchants);
  const [loading, setLoading] = useState(false);
  const [expandedMerchants, setExpandedMerchants] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const colors = DASHBOARD_COLORS("admin");

  // Sync initial data ONLY if we don't have a custom range selected (conceptually "All Time")
  // This prevents parent's auto-refresh from overwriting a specific date filter selection
  useEffect(() => {
    if (!dateRange?.from) {
      setMerchants(initialMerchants);
    }
  }, [initialMerchants, dateRange]);

  // Effect to trigger fetch when date range changes
  useEffect(() => {
    if (dateRange?.from) {
      // If we have at least a start date, fetch
      // Note: date-fns/react-day-picker might give undefined 'to' if only start is picked
      // We pass it anyway, backend/api handles logic
      fetchMerchants(dateRange.from, dateRange.to);
    } else {
      // If range was cleared, we can revert to initialMerchants if available, or fetch all time
      if (initialMerchants) {
        setMerchants(initialMerchants);
      } else {
        fetchMerchants(undefined, undefined);
      }
    }
  }, [dateRange]);

  const fetchMerchants = async (start?: Date, end?: Date) => {
    setLoading(true);
    try {
      const data = await getTopPerformingMerchants(start, end);
      setMerchants(data);
    } catch (error) {
      console.error('Failed to fetch top merchants:', error);
      toast.error('Failed to update top merchants');
    } finally {
      setLoading(false);
    }
  };

  const toggleMerchant = (merchantId: string) => {
    setExpandedMerchants(prev =>
      prev.includes(merchantId)
        ? prev.filter(id => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  // Only show loading state if:
  // 1. We are locally fetching data (loading is true)
  // 2. We are in "all" mode (no date range) and the parent is loading (initialLoading is true) AND we don't have data yet
  const isLoadingState = loading || (!dateRange?.from && initialLoading && !merchants);

  const [searchTerm, setSearchTerm] = useState("");

  const filtered = (merchants || [])
    .filter(m => m.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.redemptionCount - a.redemptionCount);

  const top3 = [...(merchants || [])].sort((a, b) => b.redemptionCount - a.redemptionCount).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((merchant, idx) => (
          <div key={merchant.id} className="relative group p-6 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
             <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                <ShoppingCart className="w-24 h-24 text-indigo-600" />
             </div>
             <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-100 dark:border-indigo-800">
                #{idx + 1}
             </div>
             
             <div className="flex items-center gap-4 mb-6 pr-10">
                <div className="relative shrink-0">
                  {merchant.logoPath ? (
                     <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                        <img src={merchant.logoPath} alt="" className="w-full h-full object-cover" />
                     </div>
                  ) : (
                     <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-black text-indigo-600 border border-indigo-100 dark:border-indigo-800">
                        {merchant.businessName.substring(0, 2).toUpperCase()}
                     </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                     <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                   <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">{merchant.businessName}</h3>
                   <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{merchant.category || 'Lifestyle'}</p>
                </div>
             </div>
             
             <div className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 group-hover:bg-indigo-500/10 transition-colors">
                <p className="text-4xl font-black text-indigo-600 tracking-tighter">{merchant.redemptionCount.toLocaleString()}</p>
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mt-1">Total Redemptions</p>
             </div>
          </div>
        ))}
      </div>

      {/* Detailed Searchable List */}
      <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
         <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Merchant Performance</h4>
               <div className="flex items-center gap-2 mt-1">
                 <Button
                    variant={!dateRange?.from ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                    className={`h-7 px-3 text-[10px] font-black uppercase rounded-full transition-all ${!dateRange?.from ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400'}`}
                  >
                    All Time
                  </Button>
                  <DatePickerWithRange
                    date={dateRange}
                    setDate={setDateRange}
                    className="h-7"
                  />
               </div>
            </div>
            <div className="relative w-full md:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search merchants..." 
                 className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
         <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {isLoadingState ? (
              <div className="p-8 space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((merchant, idx) => (
                <div key={merchant.id} className="group border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <div className="flex items-center gap-4 flex-1 min-w-0 mb-4 md:mb-0">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 shrink-0 text-xs border border-slate-200 dark:border-slate-700">
                              #{idx + 1}
                           </div>
                           <div className="relative">
                              {merchant.logoPath ? (
                                 <img src={merchant.logoPath} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                              ) : (
                                 <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 text-xs">
                                    {merchant.businessName.substring(0, 2).toUpperCase()}
                                 </div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="font-black text-slate-900 dark:text-white truncate text-base flex items-center gap-2">
                                 {merchant.businessName}
                                 <TestMerchantAlert merchantName={merchant.businessName} />
                              </p>
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{merchant.category || 'Partner'}</p>
                           </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12">
                           <div className="text-center md:text-right min-w-[100px]">
                              <p className="text-xl font-black text-indigo-600">{merchant.redemptionCount.toLocaleString()}</p>
                              <p className="text-[10px] font-bold uppercase text-slate-400">Redemptions</p>
                           </div>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className={`h-10 w-10 p-0 rounded-xl transition-all ${expandedMerchants.includes(merchant.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                             onClick={() => toggleMerchant(merchant.id)}
                           >
                             <ChevronDown className="h-5 w-5" />
                           </Button>
                        </div>
                    </div>
                    
                    {expandedMerchants.includes(merchant.id) && (
                       <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-2 mb-3 px-2">
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Branch Performance</h5>
                             </div>
                             <div className="space-y-2">
                                {merchant.branches && merchant.branches.length > 0 ? (
                                  merchant.branches.map(branch => (
                                    <div key={branch.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group/branch">
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {branch.branchName}
                                        <TestMerchantAlert merchantName={merchant.businessName} />
                                      </span>
                                      <span className="font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-xl text-xs border border-indigo-100 dark:border-indigo-800">
                                         {branch.redemptionCount} <span className="text-[9px] font-bold uppercase ml-1 opacity-60 text-slate-400">redemptions</span>
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">No branch data found</div>
                                )}
                             </div>
                          </div>
                       </div>
                    )}
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                 <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest">No matching merchants found</p>
              </div>
            )}
         </div>
      </Card>
    </div>
  );
};

// Enhanced University Insights Component
const UniversityInsights = ({ distribution }: { distribution: AdminDashboardStats['universityDistribution'] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const colors = DASHBOARD_COLORS("admin");
  
  const filtered = (distribution || [])
    .filter(u => u.university.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.studentCount - a.studentCount);

  const top3 = [...(distribution || [])].sort((a, b) => b.studentCount - a.studentCount).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((uni, idx) => (
          <div key={uni.university} className="relative group p-6 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
             <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                <School className="w-24 h-24 text-indigo-600" />
             </div>
             <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-100 dark:border-indigo-800">
                #{idx + 1}
             </div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-6 pr-10">{uni.university}</h3>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                   <p className="text-2xl font-black text-indigo-600">{uni.studentCount}</p>
                   <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Students</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                   <p className="text-2xl font-black text-emerald-600">{uni.redemptionCount || 0}</p>
                   <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Redeemed</p>
                </div>
             </div>
             
             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                   <span className="text-slate-400">Engagement Score</span>
                   <span className="text-indigo-600">{uni.engagementScore || 0}x</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" 
                     style={{ width: `${Math.min(100, (uni.engagementScore || 0) * 40)}%` }} 
                   />
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Detailed Searchable List */}
      <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
         <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">University Deep-Dive</h4>
               <p className="text-xs text-slate-500 font-medium">Performance metrics for {filtered.length} institutions</p>
            </div>
            <div className="relative w-full md:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search universities..." 
                 className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
         <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((uni) => (
                <div key={uni.university} className="group flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-white dark:hover:bg-slate-800 transition-all border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-4 flex-1 min-w-0 mb-4 md:mb-0">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-black text-indigo-600 shrink-0 uppercase border border-indigo-100 dark:border-indigo-800 group-hover:scale-110 transition-transform">
                          {uni.university.substring(0, 2)}
                       </div>
                       <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white text-base">{uni.university}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 tracking-tighter">
                                Share: {uni.percentage}%
                             </span>
                             {uni.engagementScore > 1 && (
                               <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 tracking-tighter flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> High Activity
                               </span>
                             )}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12">
                       <div className="text-center md:text-right min-w-[80px]">
                          <p className="text-lg font-black text-slate-900 dark:text-white">{uni.studentCount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Students</p>
                       </div>
                       <div className="text-center md:text-right min-w-[80px]">
                          <p className="text-lg font-black text-indigo-600">{(uni.redemptionCount || 0).toLocaleString()}</p>
                          <p className="text-[10px] font-bold uppercase text-slate-400">Redeemed</p>
                       </div>
                       <div className="min-w-[60px] flex flex-col items-end">
                          <div className={`text-[11px] font-black px-3 py-1.5 rounded-xl ${uni.engagementScore > 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                             {uni.engagementScore || 0}x
                          </div>
                          <p className="text-[9px] font-bold uppercase text-slate-400 mt-1">Score</p>
                       </div>
                    </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                 <School className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest">No matching universities found</p>
              </div>
            )}
         </div>
      </Card>
    </div>
  );
};

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<string>("overview")
  const colors = DASHBOARD_COLORS("admin")

  // Real-time dashboard statistics
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  // Fetch dashboard stats
  const fetchStats = async (start?: Date, end?: Date) => {
    // Only show loading state on initial load to prevent flashing skeletons on refresh
    if (!stats) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await getAdminDashboardStats(start, end)
      setStats(data)
      setLastUpdated(new Date())


    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch on mount and when date range changes
  useEffect(() => {
    fetchStats(dateRange?.from, dateRange?.to)
  }, [dateRange])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SheetTitle className="sr-only">Main Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigation</SheetDescription>
                  <AdminSidebarContent activeTab={activeTab} onTabChange={(tab) => {
                    setActiveTab(tab)
                    // The Sheet automatically closes on interaction if we don't control open state, 
                    // but usually we might need a controlled state to close it.
                    // For now relying on default behavior or user clicking overlay. 
                    // actually default sheet doesn't close on inner click unless we use DialogClose.
                    // Let's add a close wrapper or just let user click outside.
                    // A better UX is to close on selection. 
                    document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));
                  }} onLogout={onLogout} />
                </SheetContent>
              </Sheet>
              <img src="/ParchiFullTextNewBlue.svg" alt="Parchi" className="h-6 w-auto" />
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Platform management and oversight</p>
            </div>
          {/* Date Filter - Restricted to Analytics */}
          {activeTab === "analytics" && (
            <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-md hover:border-indigo-200/50 dark:hover:border-indigo-900/50 mr-20">
              <DatePickerWithRange 
                date={dateRange}
                setDate={setDateRange}
                className="w-[280px]"
              />
            </div>
          )}

          {/* Global Floating Refresh Button - Restricted to Overview & Analytics */}
          {(activeTab === "overview" || activeTab === "analytics") && (
            <div className="fixed top-6 right-6 z-[9999]">
              <Button 
                variant="default" 
                size="icon" 
                disabled={isLoading || isRefreshing}
                onClick={() => {
                  console.log('Manual refresh triggered');
                  toast.info('Refreshing data...')
                  fetchStats(dateRange?.from, dateRange?.to)
                }} 
                className="rounded-full shadow-2xl h-14 w-14 bg-white text-primary hover:bg-slate-50 border-2 border-primary group"
              >
                <RefreshCw className={`h-6 w-6 text-primary group-hover:rotate-180 transition-all duration-500 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}

          </div>

          {activeTab === "overview" && (
            <>
              {isLoading ? (
                <div className="flex h-[50vh] items-center justify-center">
                  <Spinner className="size-10" />
                </div>
              ) : !stats ? (
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                  <p className="text-muted-foreground">Failed to load dashboard data</p>
                  <Button onClick={() => fetchStats()}>Retry</Button>
                </div>
              ) : (
                <>
                  {/* Platform Overview */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>Platform Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Platform Overview - Real-time Data */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span>Total Active Students</span>
                            <Users className="w-4 h-4" style={{ color: colors.primary }} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {stats?.platformOverview.totalActiveStudents.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">+{stats?.platformOverview.totalActiveStudentsGrowth}% MoM</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span>Total Verified Merchants</span>
                            <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {stats?.platformOverview.totalVerifiedMerchants}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">+{stats?.platformOverview.totalVerifiedMerchantsGrowth}% this month</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span>Total Redemptions</span>
                            <CheckCircle2 className="w-4 h-4" style={{ color: colors.primary }} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {stats?.platformOverview.totalRedemptions.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{dateRange?.from ? 'Selected Period' : 'All Time'}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* User Management & Financial Oversight */}
                  <div className="mb-8">
                    {/* User Management */}
                    <div>
                      <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>User Management</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* User Management - Real-time Data */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                              <span>Verification Queue</span>
                              <Users className="w-4 h-4" style={{ color: colors.primary }} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stats?.userManagement.verificationQueue}</div>
                            <p className="text-xs text-muted-foreground mt-1">Pending Requests</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                              <span>Suspended/Rejected</span>
                              <X className="w-4 h-4" style={{ color: colors.primary }} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stats?.userManagement.suspendedRejected}</div>
                            <p className="text-xs text-muted-foreground mt-1">Accounts</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>


                    {/* Merchant Performance & Student Analytics */}
                    <div className="mb-8 mt-12">
                      {/* Merchant Performance */}
                      <div className="mb-8">
                        <TopPerformingMerchants
                          merchants={stats?.topPerformingMerchants || null}
                          isLoading={isLoading}
                        />
                      </div>
                      {/* Student Analytics */}
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle style={{ color: colors.primary }}>University Distribution</CardTitle>
                            <CardDescription>Student base by university</CardDescription>
                          </CardHeader>
                          <CardContent>
                             {stats?.universityDistribution && stats.universityDistribution.length > 0 ? (
<UniversityInsights distribution={stats.universityDistribution} />
                            ) : (
                              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                                No university data available
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Founders Club Members
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                                {stats?.foundersClubMembers ?? 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Exclusive Members</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "analytics" && (
            <AdminAnalytics stats={stats} isFiltered={!!dateRange?.from} key={lastUpdated.getTime()} />
          )}

          {activeTab === "redemption-engine" && <AdminRedemptionEngine />}

          {activeTab === "brand-portfolio" && <AdminBrandPortfolio />}

          {activeTab === "kyc" && <AdminKYC />}


          {activeTab === "merchants" && <AdminMerchants />}

          {activeTab === "branches" && <AdminBranches />}

          {activeTab === "offers" && <AdminOffers />}

          {activeTab === "logs" && <AdminAuditLogs />}



          {activeTab === "financials" && <AdminFinancials />}
          
          {activeTab === "account-creation" && <AccountCreation />}


          {activeTab === "notifications" && <AdminNotifications />}

          {activeTab === "account-deletions" && <AdminAccountDeletion />}

          {activeTab === "system-config" && <AdminSystemConfig />}
        </div>
      </main>
    </div>
  )
}
