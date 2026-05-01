"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { AdminDashboardStats } from "@/lib/api-client"
import { TrendingUp, Users, Smartphone, Target, ArrowDownRight, Info, Apple, Download, UserPlus, ShieldCheck, Ticket } from "lucide-react"

interface AdminAnalyticsProps {
  stats: AdminDashboardStats | null
}

export function AdminAnalytics({ stats }: AdminAnalyticsProps) {
  const colors = DASHBOARD_COLORS("admin")

  if (!stats) return null

  // Process data with safety checks
  const funnelData = stats.funnelStats || []
  const dropoffData = stats.onboardingDropoff || []
  const platformData = stats.platformDistribution || []

  // Calculate key metrics
  const appOpens = funnelData.find(s => s.step === 'App Opened')?.count || 0
  const signupStarted = funnelData.find(s => s.step === 'Student Info Started')?.count || 0
  const kycSubmitted = funnelData.find(s => s.step === 'Kyc Submitted')?.count || 0
  const accountVerified = funnelData.find(s => s.step === 'Account Verified')?.count || 0
  const firstRedemptions = funnelData.find(s => s.step === 'First Redemption')?.count || 0
  const overallConversion = appOpens > 0 ? ((firstRedemptions / appOpens) * 100).toFixed(1) : "0"

  // Find biggest drop-off point
  let maxDropoffStep = "N/A"
  let maxDropoffPct = 0
  for (let i = 0; i < dropoffData.length - 1; i++) {
    const current = dropoffData[i].count
    const next = dropoffData[i+1].count
    if (current > 0) {
      const dropPct = ((current - next) / current) * 100
      if (dropPct > maxDropoffPct) {
        maxDropoffPct = dropPct
        maxDropoffStep = dropoffData[i].step.replace(/signup_/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
    }
  }

  const PIE_COLORS = [colors.primary, "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-xl backdrop-blur-md bg-opacity-80">
          <p className="font-bold text-sm mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
            <span className="text-sm font-medium">{payload[0].value} Users</span>
          </div>
          {appOpens > 0 && (
             <p className="text-[10px] text-muted-foreground mt-1">
               {((payload[0].value / appOpens) * 100).toFixed(1)}% of total traffic
             </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 pb-10">
      {/* --- Key Performance Indicators --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Overall Success</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{overallConversion}%</div>
            <p className="text-xs text-muted-foreground mt-1">Conversion: Open → Redeem</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Reach</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{appOpens}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique App Sessions</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ArrowDownRight className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Critical Drop-off</span>
            </div>
            <div className="text-lg font-bold truncate">{maxDropoffStep}</div>
            <p className="text-xs text-muted-foreground mt-1">{maxDropoffPct.toFixed(0)}% users lost here</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Smartphone className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Lead Device</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">
                {platformData.length > 0 ? platformData.sort((a,b) => b.count - a.count)[0].platform : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Primary user platform</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Main Funnel Analysis --- */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-xl font-bold">Acquisition Funnel</CardTitle>
            <CardDescription>Visualizing the user journey from discovery to loyalty</CardDescription>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium">
             <Info className="w-3.5 h-3.5" />
             <span>Percentages show retention from initial app open</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={funnelData} 
                layout="vertical" 
                margin={{ left: 50, right: 80, top: 20, bottom: 20 }}
                barGap={20}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="step" 
                  type="category" 
                  width={150} 
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={40}>
                  {funnelData.map((entry, index) => {
                    const retention = appOpens > 0 ? (entry.count / appOpens) * 100 : 0
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors.primary} 
                        fillOpacity={Math.max(0.2, retention / 100)} 
                      />
                    )
                  })}
                </Bar>
                {/* Labels on top of bars */}
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Detail */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Detailed Signup Drop-off</CardTitle>
            <CardDescription>Granular view of the registration form completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                    data={dropoffData.map(s => ({
                        name: s.step.replace(/signup_/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        count: s.count
                    }))}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke={colors.primary} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Platform Activity */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Daily Download activity</CardTitle>
            <CardDescription>iOS vs Android growth trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyPlatformDistribution || []}>
                   <defs>
                    <linearGradient id="colorIos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAndroid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    content={(props) => {
                        const { payload } = props;
                        return (
                          <div className="flex items-center justify-center gap-6 text-[10px] uppercase font-bold tracking-wider mb-4">
                            {payload?.map((entry: any, index: number) => (
                              <div key={`item-${index}`} className="flex items-center gap-2">
                                {entry.value === 'iOS' ? (
                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <Apple className="w-3.5 h-3.5" style={{ color: entry.color }} />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Smartphone className="w-3.5 h-3.5" style={{ color: entry.color }} />
                                    </div>
                                )}
                                <span style={{ color: entry.color }}>{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                    }}
                  />
                  <Area type="monotone" dataKey="ios" name="iOS" stroke={colors.primary} fillOpacity={1} fill="url(#colorIos)" />
                  <Area type="monotone" dataKey="android" name="Android" stroke="#10B981" fillOpacity={1} fill="url(#colorAndroid)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Platform Split Pie --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Platform Split</CardTitle>
                <CardDescription>Total device distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="count"
                        nameKey="platform"
                    >
                        {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2 w-full">
                    {platformData.map((item, idx) => (
                        <div key={item.platform} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                <span className="text-xs font-medium">{item.platform}</span>
                            </div>
                            <span className="text-xs text-muted-foreground font-bold">{item.count}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>

          {/* Conversion Rates Card */}
          <Card className="md:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Onboarding Efficiency</CardTitle>
                        <CardDescription>Step-by-step funnel conversion analysis</CardDescription>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Real-time Data</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* Step 1: Install to Signup */}
                    <div className="group relative p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 1</h4>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">App Install → Signup</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-indigo-600">
                                    {appOpens > 0 ? Math.min(100, (signupStarted / appOpens * 100)).toFixed(1) : "0"}%
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{signupStarted} / {appOpens} students</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-indigo-500">CONVERSION RATE</span>
                                <span className="text-slate-400">SUCCESS</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${appOpens > 0 ? Math.min(100, (signupStarted / appOpens * 100)) : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Signup to KYC */}
                    <div className="group relative p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 2</h4>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Signup → KYC Submit</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-emerald-600">
                                    {signupStarted > 0 ? Math.min(100, (kycSubmitted / signupStarted * 100)).toFixed(1) : "0"}%
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{kycSubmitted} / {signupStarted} students</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-emerald-500">CONVERSION RATE</span>
                                <span className="text-slate-400">SUCCESS</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${signupStarted > 0 ? Math.min(100, (kycSubmitted / signupStarted * 100)) : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 3: KYC to Redemption */}
                    <div className="group relative p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 3</h4>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">KYC Verify → First Use</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-amber-600">
                                    {accountVerified > 0 ? Math.min(100, (firstRedemptions / accountVerified * 100)).toFixed(1) : "0"}%
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{firstRedemptions} / {accountVerified} students</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-amber-500">CONVERSION RATE</span>
                                <span className="text-slate-400">SUCCESS</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${accountVerified > 0 ? Math.min(100, (firstRedemptions / accountVerified * 100)) : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Final Step: Retention */}
                    <div className="group relative p-5 bg-indigo-600 rounded-2xl border border-indigo-500 shadow-xl shadow-indigo-500/10 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">Final Goal</h4>
                                    <p className="text-sm font-bold text-white">End-to-End Retention</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">
                                    {overallConversion}%
                                </div>
                                <p className="text-[10px] text-indigo-200 font-medium">Platform Utility Rate</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-indigo-200">TOTAL EFFICIENCY</span>
                                <span className="text-indigo-200">NORTH STAR</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${overallConversion}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
      </div>

      {/* --- Admin Insights Card --- */}
      <Card className="border-none shadow-sm bg-slate-900 text-slate-50 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Admin Intelligence Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bottleneck Analysis */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-sm font-bold text-blue-400">Bottleneck Analysis</h4>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase">Critical</span>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed min-h-[40px]">
                        The highest drop-off rate of <strong className="text-white">{maxDropoffPct.toFixed(0)}%</strong> occurs at <strong className="text-white">{maxDropoffStep}</strong>.
                    </p>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart 
                                data={dropoffData.slice(0, 6).map(s => ({ count: s.count, name: s.step }))} 
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="bottleneckGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#3B82F6" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#bottleneckGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Conversion Health */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-sm font-bold text-emerald-400">Conversion Health</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">Success Rate</span>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed min-h-[40px]">
                        Measures the percentage of users who successfully complete the journey from initial app download to their <strong className="text-white">first redemption</strong>.
                    </p>
                    <div className="h-32 w-full flex items-center justify-center">

                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { value: parseFloat(overallConversion), name: 'Converted' },
                                        { value: 100 - parseFloat(overallConversion), name: 'Remaining' }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={45}
                                    paddingAngle={5}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <Cell fill="#10B981" />
                                    <Cell fill="#1e293b" />
                                </Pie>
                                <text 
                                    x="50%" 
                                    y="50%" 
                                    textAnchor="middle" 
                                    dominantBaseline="middle" 
                                    className="fill-white font-bold text-xs"
                                >
                                    {overallConversion}%
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* KYC Momentum */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-sm font-bold text-indigo-400">KYC Momentum</h4>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase">Efficiency</span>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed min-h-[40px]">
                        Median: <strong className="text-white">{stats.kycPerformance?.medianDaysToFirstRedemption ?? "N/A"} days</strong> to first redemption.
                    </p>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { d: 10 }, { d: 8 }, { d: 7 }, { d: 6 }, 
                                { d: stats.kycPerformance?.medianDaysToFirstRedemption ?? 6 }
                            ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area 
                                    type="monotone" 
                                    dataKey="d" 
                                    stroke="#818CF8" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#momentumGradient)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
