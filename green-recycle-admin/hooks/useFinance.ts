import { useEffect, useState } from 'react';
import type { Withdrawal } from '../types';
import { approveWithdrawal, getAdminWithdrawals, rejectWithdrawal } from '../api/services/admin';

// P3规范化: 将搜索和筛选状态统一收入 hook，与 OrderManagement 模式一致
export const useFinance = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      setWithdrawals(await getAdminWithdrawals());
    } catch (e) {
      console.error('Failed to fetch withdrawals', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveWithdrawal(id);
      } else {
        await rejectWithdrawal(id, 'rejected');
      }
      await fetchWithdrawals();
    } catch (e) {
      alert('操作失败');
    }
  };

  const pendingTotal = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  // 过滤后的提现列表
  const filteredWithdrawals = withdrawals.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.order_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    withdrawals,
    filteredWithdrawals,
    handleAction,
    pendingTotal,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
  };
};
