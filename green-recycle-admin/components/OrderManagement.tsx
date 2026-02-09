import React from 'react';
import { Filter, User, Truck, Calendar, ArrowLeft, Package, MapPin, DollarSign, Clock, Search } from 'lucide-react';
import type { Collector, Order, OrderStatus } from '../types';
import MapWidget from './MapWidget';
import { useOrders } from '../hooks/useOrders';
import { useCollectors } from '../hooks/useCollectors';
import { getCategoryLabel } from '../formatters';
import { getOrderTimeline, type TimelineStep } from '../api/services/orders';

// F5修复: 使用真实时间线数据的 hook
const useOrderTimeline = (orderId: string | undefined) => {
  const [timeline, setTimeline] = React.useState<TimelineStep[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    getOrderTimeline(orderId)
      .then(setTimeline)
      .catch(() => setTimeline([]))
      .finally(() => setLoading(false));
  }, [orderId]);

  return { timeline, loading };
};

// Sub-component for Details View
const OrderDetailsView = ({ order, collectors, onBack, getStatusBadge }: { order: Order, collectors: Collector[], onBack: () => void, getStatusBadge: (s: OrderStatus) => React.ReactNode }) => {
  const collector = collectors.find(c => c.id === order.collector_id);
  // F5修复: 从后端获取真实时间线数据
  const { timeline, loading: timelineLoading } = useOrderTimeline(order.id);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4">
        <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title="返回列表"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">订单详情</h2>
          <p className="text-slate-500 text-sm font-mono">{order.id}</p>
        </div>
        <div className="ml-auto">
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* 地图可视化组件 */}
      <MapWidget order={order} collector={collector} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-emerald-500" />
            基础信息
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-500">下单日期</span>
              <span className="font-medium text-slate-900 flex items-center gap-2">
                <Calendar size={14} /> {order.date}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-500">回收品类</span>
              <span className="font-medium text-slate-900">
                 {getCategoryLabel(order.category)}
              </span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-500">当前状态</span>
              <span className="font-medium capitalize text-slate-900">
                {order.status === 'pending' ? '待处理' : 
                 order.status === 'scheduled' ? '已调度' : 
                 order.status === 'cancelled' ? '已取消' : '已完成'}
              </span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-500" />
            用户信息
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <span className="text-slate-500">联系人</span>
              <span className="font-medium text-slate-900">{order.user_name}</span>
            </div>
             <div className="flex justify-between pb-1">
              <span className="text-slate-500">取货地址</span>
              <div className="text-right max-w-[60%]">
                 <span className="font-medium text-slate-900 flex items-center justify-end gap-1">
                    <MapPin size={14} className="text-slate-400" /> {order.address}
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collector Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Truck size={20} className="text-indigo-500" />
            回收员信息
          </h3>
          <div className="space-y-4">
             {collector ? (
              <>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-slate-500">姓名</span>
                  <span className="font-medium text-slate-900">{collector.name}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-500">联系电话</span>
                  <span className="font-medium text-slate-900">{collector.phone}</span>
                </div>
              </>
             ) : (
               <div className="text-slate-400 italic py-4 text-center bg-slate-50 rounded-lg">
                 暂未分配回收员
               </div>
             )}
          </div>
        </div>

        {/* F5修复: 从后端读取真实时间线数据 */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-slate-400" />
            订单进度
          </h3>
          {timelineLoading ? (
            <div className="text-slate-400 text-sm text-center py-4">加载中...</div>
          ) : (
          <div className="relative pl-4 ml-2 border-l-2 border-slate-100 space-y-8 pb-2">
            {timeline.map((item, idx) => (
              <div className="relative" key={idx}>
                <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ${item.done ? 'bg-emerald-500 ring-emerald-100' : 'bg-slate-200 ring-slate-100'}`}></div>
                <div className={`text-sm font-bold ${item.done ? 'text-slate-900' : 'text-slate-400'}`}>{item.label}</div>
                {item.time && <div className="text-xs text-slate-500 mt-1">{item.time}</div>}
              </div>
            ))}
          </div>
          )}
       </div>

        {/* Transaction Info (if completed) */}
        {order.status === 'completed' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-amber-500" />
              交易详情
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between border-b border-slate-50 pb-3 bg-slate-50/50 p-3 rounded">
                <span className="text-slate-500">实际称重</span>
                <span className="font-bold text-slate-900 text-lg">{order.weight_actual} 公斤</span>
              </div>
              <div className="flex justify-between pb-3 bg-emerald-50/50 p-3 rounded border border-emerald-100">
                <span className="text-emerald-700">最终金额</span>
                <span className="font-bold text-emerald-600 text-xl">¥{order.amount_final}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const OrderManagement: React.FC = () => {
  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    filteredOrders,
    selectedOrder,
    setSelectedOrder,
    handleAssignCollector,
    assignKey
  } = useOrders();
  const { collectors } = useCollectors();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">待处理</span>;
      case 'scheduled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">已调度</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">已完成</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">已取消</span>;
    }
  };

  // P3修复: 搜索过滤已统一在 useOrders hook 中处理
  const finalFilteredOrders = filteredOrders;

  // Render Details View if selected
  if (selectedOrder) {
    return <OrderDetailsView order={selectedOrder} collectors={collectors} onBack={() => setSelectedOrder(null)} getStatusBadge={getStatusBadge} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">订单管理中心</h2>
          <p className="text-slate-500 text-sm mt-1">查看和调度回收订单，实时掌握回收动态</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="搜索订单号、姓名或地址..."
              className="!pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm shrink-0">
            {(['all', 'pending', 'scheduled', 'completed', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filter === tab 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab === 'all' ? '全部' : 
                tab === 'pending' ? '待处理' :
                tab === 'scheduled' ? '调度中' : 
                tab === 'cancelled' ? '已取消' : '已完成'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">订单信息</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">位置 / 用户</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">回收员 (司机)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {finalFilteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{order.id}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <Calendar size={12} /> {order.date}
                      </span>
                      <span className="text-[10px] inline-flex mt-1.5 w-fit bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600 border border-slate-200/50">
                        {getCategoryLabel(order.category)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-[200px]">
                      <div className="text-sm text-slate-900 font-medium truncate" title={order.address}>{order.address}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <User size={12} /> {order.user_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     {order.collector_id ? (
                       <div className="flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-md w-fit">
                         <Truck size={14} />
                         {collectors.find(c => c.id === order.collector_id)?.name}
                       </div>
                     ) : (
                       <span className="text-slate-400 italic font-medium">未分配</span>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {order.status === 'pending' ? (
                      <select 
                        key={`assign-${order.id}-${assignKey}`}
                        className="w-40 ml-auto !py-1.5 text-xs font-bold border-emerald-100 hover:border-emerald-300 focus:border-emerald-500"
                        onChange={(e) => handleAssignCollector(order.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>选择指派人员</option>
                        {collectors.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-emerald-600 hover:text-emerald-700 font-bold px-3 py-1.5 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        详情
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {finalFilteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={24} className="text-slate-300" />
                      <span className="text-sm font-medium">没有找到符合条件的订单</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
