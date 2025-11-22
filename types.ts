export enum PlanType {
  MONTHLY = 'mensal',
  ANNUAL = 'anual',
}

export enum StoreStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

export interface User {
  uid: string;
  email: string;
  isAdmin: boolean;
  displayName?: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  whatsapp: string;
  color: string;
  status: StoreStatus;
  plan: PlanType;
  createdAt: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  imageUrl: string;
  featured: boolean;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SystemConfig {
  adminPixKey: string;
}
