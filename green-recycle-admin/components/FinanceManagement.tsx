import React from 'react';
import { Check, X, CreditCard, Search, Filter } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { getChannelLabel } from '../formatters';

// P3规范化: searchTerm/statusFilter 已移入 useFinance hook
const FinanceManagement: React.FC = () => {
  const { filteredWithdrawals, handleAction, pendingTotal, searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useFinance();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
           <h2 className="text-2xl font-bold text-slate-800">财务提现审核</h2>
           <p className="text-slate-500 text-sm mt-1">处理回收员和用户的提现申请，管理资金流水</p>
        </div>
        
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-3 flex items-center gap-4 shadow-sm">
            <div className="bg-emerald-500 p-2 rounded-lg text-white">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">待审核总额</p>
              <h3 className="text-xl font-black text-emerald-700">¥ {pendingTotal.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 sm:max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="搜索流水号、用户或订单..."
            className="!pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm shrink-0">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusFilter === s 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? '全部' : 
               s === 'pending' ? '待审核' :
               s === 'approved' ? '已发放' : '已驳回'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">流水号 / 时间</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">关联订单</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">申请用户</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">提现渠道</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">金额</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredWithdrawals.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{item.id}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{item.request_date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                    {item.order_id || <span className="text-slate-300">---</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                    {item.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-slate-200">
                      {getChannelLabel(item.channel)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                    ¥{item.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.status === 'pending' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">待审核</span>}
                    {item.status === 'approved' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">已发放</span>}
                    {item.status === 'rejected' && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">已驳回</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {item.status === 'pending' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleAction(item.id, 'approve')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check size={14} /> 同意
                        </button>
                        <button 
                           onClick={() => handleAction(item.id, 'reject')}
                           className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <X size={14} /> 拒绝
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs font-medium italic">已处理</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={24} className="text-slate-300" />
                      <span className="text-sm font-medium">暂无相关的提现记录</span>
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

export default FinanceManagement;
