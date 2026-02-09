import React from 'react';
import { Save, TrendingUp, TrendingDown, Minus, Plus, Trash2, X } from 'lucide-react';
import { useMaterialPrices } from '../hooks/useMaterialPrices';
import type { MaterialType } from '../types';
import { getCategoryLabel, getUnitLabel } from '../formatters';

const CATEGORIES: { value: MaterialType; label: string }[] = [
  { value: 'Paper', label: '废纸' },
  { value: 'Plastic', label: '塑料' },
  { value: 'Metal', label: '金属' },
  { value: 'Glass', label: '玻璃' },
  { value: 'Clothes', label: '衣物' },
  { value: 'Appliance', label: '家电' },
  { value: 'Other', label: '其他' },
];

const PriceManagement: React.FC = () => {
  const {
    materials,
    isModalOpen,
    setIsModalOpen,
    newMaterial,
    setNewMaterial,
    handlePriceChange,
    handleDelete,
    handleAddMaterial,
    handleBatchUpdate
  } = useMaterialPrices();

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">回收价格管理</h2>
          <p className="text-slate-500 text-sm mt-1">管理回收品类、计价单位及买入/卖出价格</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-secondary"
          >
            <Plus size={18} />
            <span>新增品类</span>
          </button>
          <button 
            onClick={handleBatchUpdate}
            className="btn-primary"
          >
            <Save size={18} />
            <span>发布生效</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">品类名称</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">单位</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">回收单价 (买入)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">市场指导价 (卖出)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">预估利润</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">趋势</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {materials.map((material) => {
                const margin = material.market_price - material.current_price;
                const marginPercent = material.current_price > 0 ? ((margin / material.current_price) * 100).toFixed(1) : '0.0';
                
                return (
                  <tr key={material.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                          {material.name[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{material.name}</div>
                          <div className="text-xs text-slate-500 font-medium">
                            {getCategoryLabel(material.category)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      /{getUnitLabel(material.unit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative max-w-[120px]">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-400 text-sm font-bold">¥</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={material.current_price}
                          onChange={(e) => handlePriceChange(material.id, 'current_price', e.target.value)}
                          className="pl-7 font-bold text-slate-900"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative max-w-[120px]">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-400 text-sm font-bold">¥</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={material.market_price}
                          onChange={(e) => handlePriceChange(material.id, 'market_price', e.target.value)}
                          className="pl-7 font-bold text-slate-700 bg-slate-50/50"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">¥{margin.toFixed(2)}</div>
                      <div className={`text-xs font-bold ${margin > 0 ? 'text-emerald-600' : margin < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {marginPercent}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {material.trend === 'up' && <TrendingUp size={18} className="text-red-500" />}
                      {material.trend === 'down' && <TrendingDown size={18} className="text-emerald-500" />}
                      {material.trend === 'stable' && <Minus size={18} className="text-slate-400" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        onClick={() => handleDelete(material.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="删除品类"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {materials.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Plus size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">暂无回收品类，请点击右上角新增</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-slate-800">新增回收品类</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">品类名称</label>
                <input 
                  type="text" 
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  placeholder="例如：废旧报纸"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">所属类别</label>
                  <select 
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value as MaterialType})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">计价单位</label>
                  <input 
                    type="text" 
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                    placeholder="公斤 / 个"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">回收价格 (¥)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newMaterial.current_price}
                    onChange={(e) => setNewMaterial({...newMaterial, current_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">市场价格 (¥)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newMaterial.market_price}
                    onChange={(e) => setNewMaterial({...newMaterial, market_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
              >
                取消
              </button>
              <button 
                onClick={handleAddMaterial}
                className="btn-primary text-sm px-6"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceManagement;
