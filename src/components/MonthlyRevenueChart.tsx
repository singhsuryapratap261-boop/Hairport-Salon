import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, IndianRupee, BarChart3, LineChart, Users, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { VisitRecord } from '../types';

interface MonthlyRevenueChartProps {
  visits: VisitRecord[];
}

interface MonthData {
  key: string; // YYYY-MM
  monthName: string; // e.g. "May 2026"
  shortName: string; // e.g. "May"
  revenue: number;
  cash: number;
  upi: number;
  clients: number;
}

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ visits }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute the last 6 calendar months
  const monthlyData: MonthData[] = useMemo(() => {
    const months: MonthData[] = [];
    const now = new Date();

    // Generate last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;
      const monthName = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      const shortName = d.toLocaleDateString('en-IN', { month: 'short' });

      months.push({
        key,
        monthName,
        shortName,
        revenue: 0,
        cash: 0,
        upi: 0,
        clients: 0,
      });
    }

    // Populate data from visits
    visits.forEach((v) => {
      if (!v.visitDateTime) return;
      const monthKey = v.visitDateTime.substring(0, 7); // YYYY-MM
      const targetMonth = months.find((m) => m.key === monthKey);

      if (targetMonth) {
        const amount = v.paidAmount !== undefined ? v.paidAmount : v.finalAmount;
        targetMonth.revenue += amount;
        targetMonth.clients += 1;

        if (v.paymentMode === 'cash') {
          targetMonth.cash += amount;
        } else if (v.paymentMode === 'upi' || v.paymentMode === 'card') {
          targetMonth.upi += amount;
        } else {
          // If pending, track paid portion
          if (v.paidAmount > 0) {
            targetMonth.cash += v.paidAmount;
          }
        }
      }
    });

    return months;
  }, [visits]);

  // Summary figures
  const total6MonthRevenue = useMemo(
    () => monthlyData.reduce((sum, m) => sum + m.revenue, 0),
    [monthlyData]
  );

  const avgMonthlyRevenue = useMemo(
    () => Math.round(total6MonthRevenue / 6),
    [total6MonthRevenue]
  );

  const bestMonth = useMemo(() => {
    let top = monthlyData[0];
    monthlyData.forEach((m) => {
      if (m.revenue > (top?.revenue || 0)) {
        top = m;
      }
    });
    return top;
  }, [monthlyData]);

  const totalClientsServed = useMemo(
    () => monthlyData.reduce((sum, m) => sum + m.clients, 0),
    [monthlyData]
  );

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthData;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
          <div className="font-bold text-amber-400 text-sm border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{data.monthName}</span>
            <span className="text-[11px] font-medium text-slate-400">{data.clients} visits</span>
          </div>
          <div className="flex justify-between items-center text-slate-200">
            <span>Total Revenue:</span>
            <span className="font-extrabold text-amber-300">₹{data.revenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400 text-[11px]">
            <span>UPI / Digital:</span>
            <span className="font-semibold">₹{data.upi.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Cash:</span>
            <span className="font-semibold">₹{data.cash.toLocaleString('en-IN')}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md mb-6 relative overflow-hidden transition-all">
      
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/30 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Monthly Revenue Overview
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Last 6 Months
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Income analytics and financial trends based on customer visit records
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Chart type toggle */}
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                chartType === 'area'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Trend Curve"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Trend</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                chartType === 'bar'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cash vs UPI Split"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Cash vs UPI</span>
            </button>
          </div>

          {/* Collapse/Expand toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title={isCollapsed ? 'Expand chart' : 'Collapse chart'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Highlights metrics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block font-medium">6-Month Total</span>
          <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
            ₹{total6MonthRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block font-medium">Monthly Average</span>
          <div className="text-lg sm:text-xl font-bold text-white mt-0.5">
            ₹{avgMonthlyRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block font-medium">Peak Month</span>
          <div className="text-sm sm:text-base font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <span>{bestMonth?.shortName || '-'}</span>
            <span className="text-xs text-slate-400 font-normal">
              (₹{(bestMonth?.revenue || 0).toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block font-medium">Total Clients Served</span>
          <div className="text-lg sm:text-xl font-bold text-blue-400 mt-0.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-400/80" />
            <span>{totalClientsServed}</span>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      {!isCollapsed && (
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="upiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => (
                    <span className="text-slate-300 font-medium capitalize">{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Total Revenue (₹)"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                  dot={{ r: 4, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#fef08a' }}
                />
                <Area
                  type="monotone"
                  dataKey="upi"
                  name="UPI Online (₹)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#upiGrad)"
                  dot={{ r: 3, fill: '#10b981', stroke: '#0f172a' }}
                />
              </AreaChart>
            ) : (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => (
                    <span className="text-slate-300 font-medium capitalize">{value}</span>
                  )}
                />
                <Bar
                  dataKey="upi"
                  name="UPI / Digital"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="cash"
                  name="Cash"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};
