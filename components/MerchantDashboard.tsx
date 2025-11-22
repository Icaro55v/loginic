import React, { useEffect, useState } from 'react';
import { Store, Product, StoreStatus } from '../types';
import { StoreService, ProductService, ConfigService } from '../services/mockFirebase';
import { Button } from './Button';
import { useToast } from '../contexts/ToastContext';
import { 
  Package, CreditCard, Settings, Plus, Trash2, 
  ExternalLink, Lock, AlertCircle, Copy, Store as StoreIcon, 
  Image as ImageIcon, TrendingUp, Edit3, CheckCircle2, DollarSign, Box
} from 'lucide-react';

interface MerchantDashboardProps {
  user: { uid: string };
  onLogout: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ user, onLogout }) => {
  const { addToast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'subscription' | 'settings'>('products');
  const [loading, setLoading] = useState(true);
  const [pixKey, setPixKey] = useState('');

  // Product Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState<Partial<Product>>({});
  
  // Settings Form State
  const [settings, setSettings] = useState({ name: '', whatsapp: '', color: '' });

  useEffect(() => { loadStoreData(); }, [user]);

  const loadStoreData = async () => {
    setLoading(true);
    const s = await StoreService.getMyStore(user.uid);
    const config = await ConfigService.getConfig();
    setPixKey(config.adminPixKey);
    if (s) {
      setStore(s);
      setSettings({ name: s.name, whatsapp: s.whatsapp, color: s.color });
      const p = await ProductService.getProducts(s.id);
      setProducts(p);
      if (s.status !== StoreStatus.ACTIVE) setActiveTab('subscription');
    }
    setLoading(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    const productData = {
      storeId: store.id,
      name: prodForm.name || 'Produto Sem Nome',
      price: Number(prodForm.price) || 0,
      imageUrl: prodForm.imageUrl || `https://source.unsplash.com/random/300x300/?product`,
      featured: !!prodForm.featured,
      description: prodForm.description || ''
    };

    try {
      if (editingId) {
        await ProductService.updateProduct(editingId, productData);
        addToast("Produto atualizado com sucesso!", 'success');
      } else {
        await ProductService.addProduct(productData);
        addToast("Produto adicionado ao catálogo!", 'success');
      }
      resetForm();
      loadStoreData();
    } catch (error) {
      addToast("Erro ao salvar produto.", 'error');
    }
  };

  const handleEditClick = (p: Product) => {
    setProdForm(p);
    setEditingId(p.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await ProductService.deleteProduct(id);
      addToast("Produto removido.", 'info');
      loadStoreData();
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setProdForm({});
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    await StoreService.updateStore(store.id, settings);
    loadStoreData();
    addToast("Configurações da loja salvas.", 'success');
  };

  const handleSimulatePayment = async () => {
    if (!store) return;
    if(confirm("Simular envio de comprovante e aprovação automática? (Modo Demo)")) {
      await StoreService.updateStore(store.id, { status: StoreStatus.ACTIVE });
      loadStoreData();
      setActiveTab('products');
      addToast("Pagamento aprovado! Loja liberada.", 'success');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-brandBg"><div className="w-8 h-8 border-2 border-brandPrimary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!store) return <div className="min-h-screen bg-brandBg flex items-center justify-center text-brandTextSecondary">Erro ao carregar loja. <button onClick={onLogout} className="text-brandPrimary underline ml-2">Sair</button></div>;

  const isLocked = store.status !== StoreStatus.ACTIVE;

  // Calculated Stats
  const totalValue = products.reduce((acc, p) => acc + p.price, 0);
  const totalFeatured = products.filter(p => p.featured).length;

  return (
    <div className="min-h-screen bg-brandBg font-sans text-brandTextPrimary pb-20">
      {/* Top Bar */}
      <header className="bg-brandSurface border-b border-brandBorder sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brandSurfaceLight border border-brandBorder rounded-lg flex items-center justify-center text-brandPrimary shadow-glow">
               <StoreIcon className="w-4 h-4" />
             </div>
             <div>
                <h1 className="font-bold text-sm tracking-wide text-white">{store.name}</h1>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span className={`text-[10px] font-bold uppercase ${isLocked ? 'text-amber-500' : 'text-brandTextSecondary'}`}>{isLocked ? 'Aguardando Pagamento' : 'Operacional'}</span>
                </div>
             </div>
          </div>
          <div className="flex gap-3">
            {!isLocked && (
              <a href={`?store=${store.id}`} target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-brandPrimary bg-brandPrimary/10 hover:bg-brandPrimary/20 rounded transition-colors border border-brandPrimary/20">
                <ExternalLink className="w-3 h-3" /> <span className="hidden md:inline">Ver Loja Online</span>
              </a>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* Stats Row */}
        {!isLocked && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
            <StatCard label="Total Produtos" value={products.length.toString()} icon={<Package className="w-4 h-4 text-brandPrimary"/>} />
            <StatCard label="Em Estoque (R$)" value={totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} icon={<DollarSign className="w-4 h-4 text-emerald-400"/>} />
            <StatCard label="Destaques" value={totalFeatured.toString()} icon={<TrendingUp className="w-4 h-4 text-amber-400"/>} />
            <StatCard label="Plano Ativo" value={store.plan} icon={<CreditCard className="w-4 h-4 text-purple-400"/>} capitalize />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-brandBorder mb-8 flex gap-6 overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} label="Catálogo" />
          <TabButton active={activeTab === 'subscription'} onClick={() => setActiveTab('subscription')} label="Assinatura" alert={isLocked} />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Configurações" />
        </div>

        {/* Content */}
        <div className="animate-slide-up">
          {activeTab === 'products' && (
            isLocked ? <LockedState /> : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white">Gerenciar Inventário</h2>
                  <Button onClick={() => { resetForm(); setIsAdding(!isAdding); }} icon={!isAdding && <Plus className="w-4 h-4"/>} variant={isAdding ? 'secondary' : 'primary'} size="sm">
                    {isAdding ? 'Cancelar Edição' : 'Novo Produto'}
                  </Button>
                </div>

                {isAdding && (
                  <div className="bg-brandSurface border border-brandBorder rounded-xl p-6 animate-fade-in shadow-lg">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-brandBorder pb-2">
                      {editingId ? 'Editar Produto' : 'Adicionar Produto'}
                    </h3>
                    <form onSubmit={handleSaveProduct}>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                         <div className="space-y-4">
                           <InputGroup label="Nome do Produto" value={prodForm.name} onChange={(v: string) => setProdForm({...prodForm, name: v})} placeholder="Ex: Camiseta Preta Premium" required />
                           <InputGroup label="Preço (R$)" value={prodForm.price} onChange={(v: string) => setProdForm({...prodForm, price: Number(v)})} placeholder="0.00" type="number" required />
                           <div>
                             <label className="block text-xs font-bold text-brandTextSecondary uppercase mb-1.5">Descrição</label>
                             <textarea 
                                className="w-full px-4 py-2.5 bg-brandBg border border-brandBorder rounded text-sm text-white focus:border-brandPrimary transition-all h-24 resize-none placeholder:text-brandTextSecondary/50 focus:ring-1 focus:ring-brandPrimary outline-none"
                                placeholder="Detalhes do produto..."
                                value={prodForm.description || ''}
                                onChange={e => setProdForm({...prodForm, description: e.target.value})}
                             />
                           </div>
                         </div>
                         <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-brandTextSecondary uppercase mb-1.5">URL da Imagem</label>
                              <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                  <div className="w-10 h-10 rounded bg-brandBg border border-brandBorder flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-5 h-5 text-brandTextSecondary" />
                                  </div>
                                  <input className="flex-1 bg-brandBg border border-brandBorder rounded px-3 text-sm text-white focus:border-brandPrimary transition-all placeholder:text-brandTextSecondary/50 focus:ring-1 focus:ring-brandPrimary outline-none" value={prodForm.imageUrl || ''} onChange={e => setProdForm({...prodForm, imageUrl: e.target.value})} placeholder="https://..." />
                                </div>
                                {/* Image Preview */}
                                {prodForm.imageUrl && (
                                  <div className="w-full h-32 rounded-lg bg-brandBg border border-brandBorder overflow-hidden relative">
                                    <img src={prodForm.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-2 py-1 rounded text-white backdrop-blur">Preview</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="bg-brandBg p-3 rounded border border-brandBorder flex items-center gap-3 mt-2 hover:border-brandPrimary/50 transition-colors cursor-pointer group" onClick={() => setProdForm({...prodForm, featured: !prodForm.featured})}>
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${prodForm.featured ? 'bg-brandPrimary border-brandPrimary' : 'border-brandBorder group-hover:border-brandTextSecondary'}`}>
                                {prodForm.featured && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <label className="text-sm text-brandTextSecondary cursor-pointer select-none group-hover:text-brandTextPrimary transition-colors">Destacar na Loja</label>
                            </div>
                         </div>
                      </div>
                      <div className="flex justify-end pt-4 border-t border-brandBorder gap-3">
                        <Button type="button" variant="ghost" onClick={resetForm}>Cancelar</Button>
                        <Button type="submit">{editingId ? 'Atualizar Produto' : 'Salvar no Catálogo'}</Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => handleEditClick(p)}
                      className="group bg-brandSurface border border-brandBorder p-3 rounded-xl hover:border-brandPrimary/50 transition-all flex gap-4 items-center relative overflow-hidden cursor-pointer hover:bg-brandSurfaceLight/50 shadow-sm"
                    >
                       <div className="w-16 h-16 rounded-lg bg-brandBg overflow-hidden shrink-0 border border-brandBorder relative">
                         <img src={p.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={p.name} />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-brandTextPrimary truncate text-sm mb-1">{p.name}</h3>
                         <div className="flex items-center gap-2">
                            <div className="text-brandPrimary font-mono font-bold text-sm">R$ {p.price.toFixed(2)}</div>
                            {p.featured && <span className="text-[9px] bg-brandAccent/10 text-brandAccent px-1.5 rounded uppercase font-bold border border-brandAccent/20">Destaque</span>}
                         </div>
                       </div>
                       <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-brandSurface shadow-lg rounded-lg border border-brandBorder p-1">
                         <button onClick={(e) => handleDeleteProduct(p.id, e)} className="p-1.5 text-red-500 hover:bg-red-900/20 rounded transition-colors">
                           <Trash2 size={14} />
                         </button>
                         <button className="p-1.5 text-brandPrimary hover:bg-blue-900/20 rounded transition-colors">
                           <Edit3 size={14} />
                         </button>
                       </div>
                    </div>
                  ))}
                  {products.length === 0 && !isAdding && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-brandTextSecondary border border-dashed border-brandBorder rounded-xl bg-brandSurface/20">
                      <Box size={40} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Seu catálogo está vazio.</p>
                      <p className="text-xs mt-1 opacity-70">Adicione seu primeiro produto para começar a vender.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {activeTab === 'subscription' && (
            <div className="max-w-lg mx-auto animate-fade-in">
              <div className="bg-brandSurface border border-brandBorder rounded-xl overflow-hidden shadow-2xl shadow-black/40">
                <div className="bg-brandSurfaceLight p-6 border-b border-brandBorder text-center">
                   <div className="w-12 h-12 bg-brandBg rounded-full flex items-center justify-center mx-auto mb-3 border border-brandBorder">
                      <CreditCard className="w-6 h-6 text-brandAccent" />
                   </div>
                   <h2 className="text-lg font-bold text-white">Assinatura {store.plan === 'mensal' ? 'Mensal' : 'Anual'}</h2>
                   <p className="text-brandTextSecondary text-xs mt-1">Status Atual: <span className={`font-bold uppercase ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>{isLocked ? 'Pendente' : 'Ativo'}</span></p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center p-4 bg-brandBg rounded-lg border border-brandBorder">
                    <span className="text-sm text-brandTextSecondary font-medium">Valor do Plano</span>
                    <span className="text-2xl font-bold text-white">{store.plan === 'mensal' ? 'R$ 25,00' : 'R$ 300,00'}</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-brandTextSecondary uppercase mb-2 block">Chave Pix para Pagamento</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-brandBg border border-brandBorder p-3 rounded text-sm font-mono text-brandAccent truncate select-all">{pixKey}</code>
                      <Button variant="secondary" onClick={() => {navigator.clipboard.writeText(pixKey); addToast("Chave Pix copiada!", "info")}}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="space-y-3">
                        <div className="flex gap-3 p-3 bg-amber-900/10 text-amber-500 rounded border border-amber-900/30 text-xs leading-relaxed">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Após o pagamento, envie o comprovante para o suporte. Sua loja será liberada em instantes.</p>
                        </div>
                        <Button fullWidth variant="success" onClick={handleSimulatePayment}>
                            <CheckCircle2 className="w-4 h-4 mr-2"/> Simular Pagamento (Demo)
                        </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3 p-3 bg-emerald-900/10 text-emerald-500 rounded border border-emerald-900/30 text-xs leading-relaxed items-center">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <p className="font-bold">Sua loja está ativa e pronta para vender!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto">
               {isLocked ? <LockedState /> : (
                 <div className="bg-brandSurface border border-brandBorder rounded-xl p-6 shadow-xl animate-fade-in">
                   <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                     <Settings className="w-4 h-4 text-brandTextSecondary" /> Configurações da Loja
                   </h2>
                   <form onSubmit={handleSaveSettings} className="space-y-5">
                     <InputGroup label="Nome da Loja" value={settings.name} onChange={(v: string) => setSettings({...settings, name: v})} />
                     
                     <div>
                        <label className="block text-xs font-bold text-brandTextSecondary uppercase mb-1.5">WhatsApp Comercial</label>
                        <div className="relative">
                            <input className="w-full px-4 py-3 pl-12 bg-brandBg border border-brandBorder rounded text-sm text-white focus:border-brandPrimary transition-all placeholder:text-brandTextSecondary/50 focus:ring-1 focus:ring-brandPrimary outline-none" placeholder="5511999999999" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value.replace(/\D/g,'')})} />
                            <div className="absolute left-4 top-3.5 text-brandTextSecondary font-bold text-xs">Tel:</div>
                        </div>
                        <p className="text-[10px] text-brandTextSecondary mt-1">Necessário incluir DDD e código do país (Ex: 55).</p>
                     </div>

                     <div>
                       <label className="block text-xs font-bold text-brandTextSecondary uppercase mb-1.5">Cor da Marca</label>
                       <div className="flex gap-3 items-center p-2 border border-brandBorder rounded bg-brandBg">
                         <input type="color" className="h-8 w-8 rounded cursor-pointer border-0 p-0 bg-transparent" value={settings.color} onChange={e => setSettings({...settings, color: e.target.value})} />
                         <div className="font-mono text-xs text-brandTextSecondary uppercase">{settings.color}</div>
                       </div>
                     </div>

                     <div className="pt-4">
                       <Button type="submit" fullWidth>Salvar Alterações</Button>
                     </div>
                   </form>
                 </div>
               )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Components
const StatCard = ({ label, value, icon, capitalize }: any) => (
  <div className="bg-brandSurface p-4 rounded-xl border border-brandBorder shadow-sm hover:border-brandPrimary/30 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-bold text-brandTextSecondary uppercase tracking-wider">{label}</span>
      {icon}
    </div>
    <div className={`text-2xl font-bold text-white ${capitalize ? 'capitalize' : ''}`}>{value}</div>
  </div>
);

const TabButton = ({ active, onClick, label, alert }: any) => (
  <button 
    onClick={onClick}
    className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
      active 
        ? 'text-brandPrimary' 
        : 'text-brandTextSecondary hover:text-brandTextPrimary'
    }`}
  >
    {label}
    {active && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brandPrimary rounded-t-full shadow-glow"></span>}
    {alert && <span className="ml-2 w-1.5 h-1.5 bg-amber-500 rounded-full inline-block animate-pulse"></span>}
  </button>
);

const InputGroup = ({ label, value, onChange, type = "text", required, placeholder }: any) => (
  <div>
    <label className="block text-xs font-bold text-brandTextSecondary uppercase mb-1.5">{label}</label>
    <input 
      type={type}
      required={required}
      className="w-full px-4 py-2.5 bg-brandBg border border-brandBorder rounded text-sm text-white focus:border-brandPrimary transition-all placeholder:text-brandTextSecondary/50 focus:ring-1 focus:ring-brandPrimary outline-none"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const LockedState = () => (
  <div className="text-center py-16 border border-dashed border-brandBorder rounded-xl bg-brandSurface/50 animate-pulse-slow">
    <Lock className="w-8 h-8 text-amber-500 mx-auto mb-4 opacity-80" />
    <h3 className="text-lg font-bold text-white mb-1">Acesso Restrito</h3>
    <p className="text-brandTextSecondary text-sm">Regularize sua assinatura para gerenciar produtos.</p>
  </div>
);