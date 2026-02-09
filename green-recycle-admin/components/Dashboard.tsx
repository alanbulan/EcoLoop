/**
 * T4: 数据统计大屏 — 增强版
 * 包含: 概览卡片、订单趋势折线图、收入趋势折线图、物料分布饼图、最近订单表格
 */
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Package, TrendingUp, Wallet, Clock, Users, UserCheck, ShoppingCart, Leaf,
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { getCategoryLabel, getUnitLabel } from '../formatters';

/** 饼图配色 */
const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6'];

/** 概览指标卡片 */
const StatCard: React.FC<{
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}> = ({ icon, label, value, sub, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
      <h3 className="text-xl font-bold text-slate-800">{value}</h3>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { dashboard, recentCompletedOrders, chartData, metrics, error, refetch } = useDashboardData();
  const ov = dashboard.overview;

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium">后端接口不可用</p>
            <p className="text-amber-600 break-words">{error}</p>
          </div>
          <button onClick={refetch} className="flex-shrink-0 px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors">
            重试
          </button>
        </div>
      )}

      {/* 概览指标卡片 — 2 行 4 列 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={20} />} label="总用户数" value={ov.total_users} sub={`近7日新增 ${ov.new_users_7d}`} color="bg-blue-100 text-blue-600" />
        <StatCard icon={<UserCheck size={20} />} label="回收员数" value={ov.total_collectors} color="bg-teal-100 text-teal-600" />
        <StatCard icon={<ShoppingCart size={20} />} label="总订单数" value={ov.total_orders} sub={`已完成 ${ov.completed_orders} | 待处理 ${ov.pending_orders}`} color="bg-indigo-100 text-indigo-600" />
        <StatCard icon={<Clock size={20} />} label="待审核提现" value={`${ov.pending_withdrawals} 笔`} color="bg-amber-100 text-amber-600" />
        <StatCard icon={<Wallet size={20} />} label={metrics.revenueLabel} value={`¥ ${ov.total_revenue.toLocaleString()}`} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={<Package size={20} />} label={metrics.weightLabel} value={`${ov.total_weight.toLocaleString()} ${getUnitLabel('kg')}`} color="bg-sky-100 text-sky-600" />
        <StatCard icon={<Leaf size={20} />} label="减碳量(估)" value={`${(ov.total_weight * 0.8).toFixed(1)} kg`} sub="按回收重量 x 0.8 估算" color="bg-green-100 text-green-600" />
        <StatCard icon={<TrendingUp size={20} />} label="完成率" value={ov.total_orders > 0 ? `${((ov.completed_orders / ov.total_orders) * 100).toFixed(1)}%` : '0%'} color="bg-purple-100 text-purple-600" />
      </div>

      {/* 趋势图表行 — 订单趋势 + 收入趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 订单趋势折线图 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            近30天订单趋势
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.order_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="total" name="总订单" stroke="#6366F1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completed" name="已完成" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 收入趋势折线图 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-emerald-500" />
            近30天收入趋势
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.revenue_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`¥${value.toFixed(2)}`, '收入']} />
                <Line type="monotone" dataKey="revenue" name="收入(元)" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 下方行 — 物料分布 + 最近订单 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 物料分布饼图 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-blue-500" />
            物料回收分布
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard.material_distribution.length > 0 ? dashboard.material_distribution : chartData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={3}
                  dataKey="weight"
                  nameKey="name"
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(dashboard.material_distribution.length > 0 ? dashboard.material_distribution : chartData).map((_: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)} kg`, '重量']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 最近完成订单 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingCart size={18} className="text-emerald-500" />
            最近完成订单
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3 text-slate-500 font-medium">订单号</th>
                  <th className="pb-3 text-slate-500 font-medium">类别</th>
                  <th className="pb-3 text-slate-500 font-medium text-right">重量</th>
                  <th className="pb-3 text-slate-500 font-medium text-right">金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCompletedOrders.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">暂无已完成订单</td></tr>
                )}
                {recentCompletedOrders.map((order: any) => (
                  <tr key={order.id} className="group hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-700">{order.id}</td>
                    <td className="py-3 text-slate-600">{getCategoryLabel(order.category)}</td>
                    <td className="py-3 text-right text-slate-600">{order.weight_actual} {getUnitLabel('kg')}</td>
                    <td className="py-3 text-right font-semibold text-emerald-600">¥{order.amount_final}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
