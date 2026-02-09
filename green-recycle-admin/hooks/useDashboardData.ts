/**
 * T4: 数据大屏 Hook — 使用 /admin/dashboard 综合接口
 * 包含: 概览指标、订单趋势、收入趋势、物料分布
 */
import { useState, useEffect } from 'react';
import { getDashboardData, getAdminStats, getAdminChart, type DashboardData } from '../api/services/admin';
import { getOrders } from '../api/services/orders';

/** 默认空数据 */
const emptyDashboard: DashboardData = {
  overview: {
    total_users: 0, total_collectors: 0, total_orders: 0,
    completed_orders: 0, pending_orders: 0, pending_withdrawals: 0,
    total_revenue: 0, total_weight: 0, new_users_7d: 0,
  },
  order_trend: [],
  revenue_trend: [],
  material_distribution: [],
};

export const useDashboardData = () => {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [recentCompletedOrders, setRecentCompletedOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    revenue: 0, revenueLabel: '今日总营收',
    weight: 0, weightLabel: '今日回收总重',
    pendingCount: 0, pendingLabel: '待处理提现',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 并行请求: 大屏数据 + 旧接口（兼容卡片和图表）+ 最近订单
      const [dashData, stats, chart, allOrders] = await Promise.all([
        getDashboardData().catch(() => null),
        getAdminStats(),
        getAdminChart(),
        getOrders(),
      ]);

      // 大屏数据
      if (dashData) {
        setDashboard(dashData);
      }

      // 旧卡片指标（保持兼容）
      setMetrics(stats);

      // 物料分布图表
      setChartData(chart.length > 0 ? chart : [{ name: '暂无数据', weight: 0 }]);

      // 最近完成订单
      const completed = allOrders
        .filter((o: any) => o.status === 'completed')
        .slice(0, 5);
      setRecentCompletedOrders(completed);
    } catch (e) {
      const msg = e instanceof Error && e.message
        ? e.message
        : '无法获取仪表盘数据，请确认后端服务是否启动';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return {
    dashboard,
    recentCompletedOrders,
    chartData,
    metrics,
    loading,
    error,
    refetch: fetchData,
  };
};
