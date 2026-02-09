import React from 'react';
import { Search } from 'lucide-react';
import { getActionLabel, getEntityTypeLabel, getOperatorTypeLabel } from '../formatters';
import { useAuditLogs } from '../hooks/useAuditLogs';

/**
 * P3修复: 数据获取逻辑已抽离至 useAuditLogs hook
 * 组件仅负责 UI 渲染，与其他管理页面保持一致的架构模式
 */
const AuditLogManagement: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    operatorFilter,
    setOperatorFilter,
    filteredLogs,
  } = useAuditLogs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">系统审计日志</h2>
          <p className="text-slate-500 text-sm mt-1">记录系统核心业务操作，确保数据可追溯性</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="搜索操作、对象或编号..."
              className="!pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="sm:w-40"
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
          >
            <option value="all">所有角色</option>
            <option value="admin">管理员</option>
            <option value="collector">回收员</option>
            <option value="user">普通用户</option>
            <option value="system">系统自动</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作员</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">对象</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">动作</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">详情</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.operator_type === 'admin' ? 'bg-purple-100 text-purple-700' :
                        log.operator_type === 'collector' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {getOperatorTypeLabel(log.operator_type)}
                      </span>
                      <span className="text-sm text-slate-700">编号: {log.operator_id || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-medium">{getEntityTypeLabel(log.entity_type)}</div>
                    <div className="text-xs text-slate-500">编号: {log.entity_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.action === 'completed' || log.action === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                    {log.new_value || '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    暂无审计记录
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

export default AuditLogManagement;
