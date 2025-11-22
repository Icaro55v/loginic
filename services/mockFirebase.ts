import { PlanType, Product, Store, StoreStatus, User, SystemConfig } from '../types';

// --- MOCK DATA & STORAGE HELPER ---
const STORAGE_KEYS = {
  USERS: 'lojinic_users',
  STORES: 'lojinic_stores',
  PRODUCTS: 'lojinic_products',
  CONFIG: 'lojinic_config',
  CURRENT_USER: 'lojinic_current_user',
};

// Helper to get data from local storage or defaults
const getStorage = <T,>(key: string, defaultVal: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStorage = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Mock Data
const INITIAL_STORES: Store[] = [];
const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_CONFIG: SystemConfig = {
  adminPixKey: '000.000.000-00 (PIX)',
};

// --- SERVICES ---

export const AuthService = {
  login: async (email: string, password: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 600)); // Simulate network
    
    const isAdmin = email.toLowerCase() === 'admin@lojinic.com';
    const user: User = {
      uid: isAdmin ? 'admin_uid' : `user_${email.split('@')[0]}`,
      email,
      isAdmin,
      displayName: email.split('@')[0],
    };
    
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },
  
  logout: async () => {
    await new Promise(r => setTimeout(r, 300));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }
};

export const StoreService = {
  createStore: async (ownerId: string, name: string, plan: PlanType): Promise<Store> => {
    await new Promise(r => setTimeout(r, 500));
    const stores = getStorage<Store[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
    
    // Prevent duplicate stores for same user in this simple mock
    const existing = stores.find(s => s.ownerId === ownerId);
    if (existing) return existing;

    const newStore: Store = {
      id: `store_${Date.now()}`,
      ownerId,
      name,
      whatsapp: '',
      color: '#2563eb', // Default Brand Blue
      status: StoreStatus.PENDING,
      plan,
      createdAt: Date.now(),
    };
    
    stores.push(newStore);
    setStorage(STORAGE_KEYS.STORES, stores);
    return newStore;
  },

  getMyStore: async (ownerId: string): Promise<Store | undefined> => {
    const stores = getStorage<Store[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
    return stores.find(s => s.ownerId === ownerId);
  },

  getStoreById: async (storeId: string): Promise<Store | undefined> => {
    await new Promise(r => setTimeout(r, 400));
    const stores = getStorage<Store[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
    return stores.find(s => s.id === storeId);
  },

  getAllStores: async (): Promise<Store[]> => {
    await new Promise(r => setTimeout(r, 400));
    return getStorage<Store[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
  },

  updateStore: async (storeId: string, data: Partial<Store>): Promise<void> => {
    await new Promise(r => setTimeout(r, 300));
    const stores = getStorage<Store[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
    const index = stores.findIndex(s => s.id === storeId);
    if (index !== -1) {
      stores[index] = { ...stores[index], ...data };
      setStorage(STORAGE_KEYS.STORES, stores);
    }
  }
};

export const ProductService = {
  getProducts: async (storeId: string): Promise<Product[]> => {
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.filter(p => p.storeId === storeId);
  },

  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await new Promise(r => setTimeout(r, 300));
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const newProduct: Product = { ...product, id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    products.push(newProduct);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  updateProduct: async (productId: string, data: Partial<Product>): Promise<void> => {
    await new Promise(r => setTimeout(r, 300));
    const products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index] = { ...products[index], ...data };
      setStorage(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  deleteProduct: async (productId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 200));
    let products = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    products = products.filter(p => p.id !== productId);
    setStorage(STORAGE_KEYS.PRODUCTS, products);
  }
};

export const ConfigService = {
  getConfig: async (): Promise<SystemConfig> => {
    return getStorage<SystemConfig>(STORAGE_KEYS.CONFIG, INITIAL_CONFIG);
  },
  updateConfig: async (config: SystemConfig): Promise<void> => {
    setStorage(STORAGE_KEYS.CONFIG, config);
  }
};