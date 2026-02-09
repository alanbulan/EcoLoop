export const _isTypeFile = true;

export type MaterialType = 'Paper' | 'Plastic' | 'Metal' | 'Glass' | 'Clothes' | 'Appliance' | 'Other';

export interface Material {
  id: string;
  name: string;
  category: MaterialType;
  current_price: number; // Buying price
  market_price: number; // Selling price
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export interface Collector {
  id: string;
  name: string;
  phone: string;
}

export type OrderStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_name: string;
  address: string;
  contact_phone?: string;  // ⚠️5修复: 订单联系电话
  status: OrderStatus;
  weight_actual?: number;
  amount_final?: number;
  unit_price_snapshot?: number;
  collector_id?: string;
  date: string;
  category: MaterialType;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
  id: string;
  user_id: string;
  user_name: string;
  order_id?: string | null;
  amount: number;
  status: WithdrawalStatus;
  channel: string;
  request_date: string;
}

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  old_value?: string;
  new_value?: string;
  operator_type: string;
  operator_id?: number;
  created_at: string;
}

export type TabView = 'dashboard' | 'pricing' | 'orders' | 'finance' | 'audit';
