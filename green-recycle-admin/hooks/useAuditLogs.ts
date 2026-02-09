import { useState, useEffect } from 'react';
import type { AuditLog } from '../types';
import { getAuditLogs } from '../api/services/admin';

/**
 * P3修复: 审计日志数据获取逻辑抽离为独立 hook
 * 与其他页面（Dashboard/Orders/Finance）保持一致的 hook 模式
 */
export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        setLogs(await getAuditLogs());
      } catch (e) {
        console.error('Failed to fetch audit logs', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // 组合过滤逻辑
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.operator_id?.toString() || '').includes(searchTerm);
    const matchesOperator = operatorFilter === 'all' || log.operator_type === operatorFilter;
    return matchesSearch && matchesOperator;
  });

  return {
    logs,
    loading,
    searchTerm,
    setSearchTerm,
    operatorFilter,
    setOperatorFilter,
    filteredLogs,
  };
};
