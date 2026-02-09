import { useState, useEffect } from 'react';
import type { Order, OrderStatus } from '../types';
import { assignOrder, getOrders } from '../api/services/orders';

export const useOrders = () => {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  // P3修复: searchTerm 统一收归 hook 管理，组件不再维护独立搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  // ⚠️7修复: 指派成功后递增 key，强制 select 重渲染回默认值
  const [assignKey, setAssignKey] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setOrders(await getOrders());
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 先按状态过滤，再按搜索词过滤
  const filteredOrders = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o =>
      !searchTerm ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAssignCollector = async (orderId: string, collectorId: string) => {
    try {
      await assignOrder(orderId, collectorId);
      // ⚠️7修复: 递增 key 强制 select 重置
      setAssignKey(k => k + 1);
      fetchOrders();
    } catch (e) {
      alert('指派失败');
    }
  };

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    filteredOrders,
    selectedOrder,
    setSelectedOrder,
    handleAssignCollector,
    assignKey,
    loading
  };
};
