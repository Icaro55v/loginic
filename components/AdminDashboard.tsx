import React, { useEffect, useState } from 'react';
import { Store, StoreStatus } from '../types';
import { StoreService, ConfigService } from '../services/mockFirebase';
import { Button } from './Button';
import { useToast } from '../contexts/ToastContext';
import { Shield, DollarSign, Search, CheckCircle, XCircle, LogOut, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { addToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const allStores = await StoreService.getAllStores();
    setStores(allStores);
    const config = await ConfigService.getConfig();
    setPixKey(config.adminPixKey);
    setLoading(false);
  };

  const handleSavePix = async () => {
    await ConfigService.updateConfig({ adminPixKey: pixKey });
    addToast('Chave Pix do sistema atualizada.', 'success');
  };

  const toggleStoreStatus = async (store: Store) => {
    const newStatus = store.status === StoreStatus.ACTIVE ? StoreStatus.PENDING : StoreStatus.ACTIVE;
    await StoreService.updateStore(store.id, { status: newStatus });
    addToast(`Loja ${store.name} agora está ${newStatus === 'active' ? 'ATIVA' : 'PENDENTE'}.`, newStatus === 'active' ? 'success' : 'warning');
    loadData();
  };

  const filteredStores = stores.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="h-screen flex items-center justify-center bg-brandBg text-brandTextSecondary">Carregando Sistema...</div>;

  return (
    <div className="min-h-screen bg-brandBg text-brandTextPrimary font-sans">
      <header className="border-b border-brandBorder bg-brandSurface sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
             <Shield className="text-brandPrimary" /> <span className="tracking-tight">ADMIN CONSOLE</span>
          </div>
          <Button variant="ghost" onClick={onLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Config */}
        <div className="space-y-6">
           {/* Stats */}
           <div className="bg-brandSurface p-6 rounded-xl border border-brandBorder shadow-sm">
             <h3 className="text-brandTextSecondary text-xs font-bold uppercase mb-4 flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Métricas Globais
             </h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-brandBg p-4 rounded border border-brandBorder text-center">
                 <div className="text-2xl font-bold text-white">{stores.length}</div>
                 <div className="text-[10px] uppercase font-bold text-brandTextSecondary">Lojas Totais</div>
               </div>
               <div className="bg-brandBg p-4 rounded border border-brandBorder text-center">
                 <div className="text-2xl font-bold text-emerald-400">{stores.filter(s => s.status === 'active').length}</div>
                 <div className="text-[10px] uppercase font-bold text-brandTextSecondary">Ativas</div>
               </div>
             </div>
           </div>

           {/* Pix Config */}
           <div className="bg-brandSurface p-6 rounded-xl border border-brandBorder shadow-sm">
             <h3 className="text-brandTextSecondary text-xs font-bold uppercase mb-4 flex items-center gap-2">
               <DollarSign className="w-4 h-4" /> Gateway Manual
             </h3>
             <label className="block text-xs text-brandTextSecondary mb-1">Chave Pix de Recebimento</label>
             <div className="flex gap-2">
               <input 
                 className="bg-brandBg border border-brandBorder rounded text-white p-2 flex-1 text-sm font-mono focus:border-brandPrimary focus:outline-none placeholder:text-brandTextSecondary/50 focus:ring-1 focus:ring-brandPrimary transition-all"
                 value={pixKey}
                 onChange={e => setPixKey(e.target.value)}
               />
               <Button onClick={handleSavePix} variant="secondary" size="sm">Salvar</Button>
             </div>
             <p className="text-[10px] text-brandTextSecondary mt-2 leading-tight">Esta chave é exibida para todos os lojistas pendentes.</p>
           </div>
        </div>

        {/* Right Column: Store List */}
        <div className="lg:col-span-2 bg-brandSurface rounded-xl border border-brandBorder flex flex-col overflow-hidden shadow-sm">
          <div className="p-6 border-b border-brandBorder flex justify-between items-center bg-brandSurfaceLight/20">
            <h2 className="font-bold text-lg text-white">Gestão de Clientes</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brandTextSecondary" />
              <input 
                className="bg-brandBg border border-brandBorder rounded pl-9 pr-4 py-2 text-sm text-white focus:border-brandPrimary outline-none placeholder:text-brandTextSecondary/50 focus:ring-1 focus:ring-brandPrimary transition-all"
                placeholder="Buscar loja..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
             {filteredStores.map(store => (
               <div key={store.id} className="bg-brandBg p-4 rounded border border-brandBorder flex items-center justify-between hover:border-brandTextSecondary/30 transition-colors">
                 <div>
                   <h4 className="font-bold text-white text-sm">{store.name}</h4>
                   <div className="flex items-center gap-3 text-xs mt-1">
                     <span className="text-brandTextSecondary capitalize bg-brandSurface px-2 rounded border border-brandBorder">{store.plan}</span>
                     <span className={`px-2 rounded font-bold border ${
                       store.status === 'active' ? 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50' : 'bg-amber-950/30 text-amber-500 border-amber-900/50'
                     }`}>
                       {store.status === 'active' ? 'ATIVO' : 'PENDENTE'}
                     </span>
                   </div>
                 </div>
                 
                 <Button 
                   size="sm" 
                   variant={store.status === 'active' ? 'danger' : 'success'}
                   onClick={() => toggleStoreStatus(store)}
                   className="min-w-[110px]"
                 >
                   {store.status === 'active' ? (
                     <><XCircle className="w-3 h-3 mr-2" /> Bloquear</>
                   ) : (
                     <><CheckCircle className="w-3 h-3 mr-2" /> Aprovar</>
                   )}
                 </Button>
               </div>
             ))}
             {filteredStores.length === 0 && <div className="text-center text-brandTextSecondary py-10 text-sm">Nenhum registro encontrado.</div>}
          </div>
        </div>

      </main>
    </div>
  );
};