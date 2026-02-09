import type { Collector } from '../../types'
import { apiRequest } from '../client'

export const getCollectors = async () => {
  return apiRequest<Collector[]>('/api/v1/collectors')
}

