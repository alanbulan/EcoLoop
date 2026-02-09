export const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    Paper: '废纸',
    Plastic: '塑料',
    Metal: '金属',
    Glass: '玻璃',
    Clothes: '衣物',
    Appliance: '家电',
    Other: '其他',
  };
  return map[category] ?? category;
};

export const getUnitLabel = (unit: string) => {
  const map: Record<string, string> = {
    kg: '公斤',
    piece: '个',
    个: '个',
    公斤: '公斤',
  };
  return map[unit] ?? unit;
};

export const getChannelLabel = (channel: string) => {
  const map: Record<string, string> = {
    wechat: '微信',
    alipay: '支付宝',
    bank: '银行卡',
    card: '银行卡',
  };
  return map[channel] ?? channel;
};

export const getEntityTypeLabel = (entityType: string) => {
  const map: Record<string, string> = {
    order: '订单',
    withdrawal: '提现',
    inventory: '库存',
    material: '品类',
    pricing_rule: '计价规则',
    system_config: '系统配置',
  };
  return map[entityType] ?? entityType;
};

export const getOperatorTypeLabel = (operatorType: string) => {
  const map: Record<string, string> = {
    admin: '管理员',
    user: '用户',
    collector: '回收员',
    system: '系统',
  };
  return map[operatorType] ?? operatorType;
};

export const getActionLabel = (action: string) => {
  const map: Record<string, string> = {
    created: '创建',
    updated: '更新',
    completed: '完成',
    approved: '通过',
    rejected: '驳回',
    outbound: '出库',
    claimed: '接单',
  };
  return map[action] ?? action;
};

