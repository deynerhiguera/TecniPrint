export interface Machine {
  id: string;
  type: string;
  brand: string;
  model: string;
  serialNumber?: string;
  copyCounter: number;
  specs?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  machines: Machine[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceCatalogItem {
  id: string;
  serviceType: string;
  basePrice: number;
  description?: string;
}

export interface ServicePart {
  id: string;
  name: string;
  cost: number;
  quantity: number;
}

export type ServiceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceRecord {
  id: string;
  clientId: string;
  machineId?: string;
  catalogItemId?: string;
  serviceType: string;
  description: string;
  errorCodes: string[];
  partsUsed: ServicePart[];
  materialsCost: number;
  laborCost: number;
  total: number;
  date: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReminderStatus = 'pending' | 'done' | 'dismissed';

export interface FollowUpReminder {
  id: string;
  serviceId: string;
  clientId: string;
  dueDate: string;
  status: ReminderStatus;
  notes?: string;
  createdAt: string;
}
