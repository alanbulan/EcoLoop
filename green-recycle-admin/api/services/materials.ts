import type { Material } from '../../types'
import { apiRequest } from '../client'

export const getMaterials = async () => {
  return apiRequest<Material[]>('/api/v1/materials')
}

export const createMaterial = async (material: Partial<Material>) => {
  return apiRequest<Material>('/api/v1/materials', { method: 'POST', body: material })
}

export const updateMaterial = async (id: string, material: Material) => {
  return apiRequest<Material>(`/api/v1/materials/${id}`, { method: 'PUT', body: material })
}

export const deleteMaterial = async (id: string) => {
  return apiRequest<any>(`/api/v1/materials/${id}`, { method: 'DELETE' })
}

