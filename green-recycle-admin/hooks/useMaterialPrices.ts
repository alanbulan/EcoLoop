import { useState, useEffect } from 'react';
import type { Material, MaterialType } from '../types';
import { createMaterial, deleteMaterial, getMaterials, updateMaterial } from '../api/services/materials';

export const useMaterialPrices = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 新增品类的表单状态
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: '',
    category: 'Paper',
    unit: '公斤',
    current_price: 0,
    market_price: 0,
    trend: 'stable'
  });

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      setMaterials(await getMaterials());
    } catch (e) {
      console.error('Failed to fetch materials', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handlePriceChange = (id: string, field: 'current_price' | 'market_price', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, [field]: numValue };
      }
      return m;
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个回收品类吗？删除后用户端将不再显示。')) {
      try {
        await deleteMaterial(id);
        setMaterials(prev => prev.filter(m => m.id !== id));
      } catch (e) {
        alert('删除失败');
      }
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || newMaterial.current_price === undefined || newMaterial.market_price === undefined) {
      alert("请填写完整的品类信息");
      return;
    }

    try {
      const data = await createMaterial(newMaterial);
      setMaterials([...materials, data]);
      setIsModalOpen(false);
      // 重置表单
      setNewMaterial({
        name: '',
        category: 'Paper',
        unit: '公斤',
        current_price: 0,
        market_price: 0,
        trend: 'stable'
      });
    } catch (e) {
      alert('添加失败');
    }
  };

  const handleBatchUpdate = async () => {
    setLoading(true);
    try {
      await Promise.all(materials.map(m => updateMaterial(m.id, m)));
      alert("价格模板已更新，并成功推送到所有用户端！");
    } catch (e) {
      alert('更新失败');
    } finally {
      setLoading(false);
    }
  };

  return {
    materials,
    isModalOpen,
    setIsModalOpen,
    newMaterial,
    setNewMaterial,
    handlePriceChange,
    handleDelete,
    handleAddMaterial,
    handleBatchUpdate,
    loading
  };
};
