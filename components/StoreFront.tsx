import React, { useEffect, useState } from 'react';
import { Store, Product, CartItem } from '../types';
import { StoreService, ProductService } from '../services/mockFirebase';
import { ShoppingBag, Search, X, Plus, Minus, MessageCircle, Trash2, ArrowRight, Sparkles, Check, Eye } from 'lucide-react';
import { Button } from './Button';
import { useToast } from '../contexts/ToastContext';

interface StoreFrontProps {
  storeId: string;
}

export const StoreFront: React.FC<StoreFrontProps> = ({ storeId }) => {
  const { addToast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form'>('cart');
  const [category, setCategory] = useState<'all' | 'featured'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Checkout
  const [customerName, setCustomerName] = useState('');
  const [payMethod, setPayMethod] = useState('Pix na Entrega');

  useEffect(() => {
    const load = async () => {
      const s = await StoreService.getStoreById(storeId);
      if (s) {
        setStore(s);
        const p = await ProductService.getProducts(storeId);
        setProducts(p);
      }
    };
    load();
  }, [storeId]);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
    addToast(`${p.name} adicionado à sacola`, 'success');
    setSelectedProduct(null);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) return { ...i, quantity: Math.max(1, i.quantity + delta) };
      return i;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const brandColor = store?.color || '#3b82f6';

  const handleCheckout = () => {
    if (!store?.whatsapp) return addToast('Loja indisponível (Sem WhatsApp configurado).', 'error');
    if (!customerName.trim()) return addToast('Por favor, informe seu nome para continuar.', 'warning');

    const itemsList = cart.map(i => `• ${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
    const msg = `*PEDIDO ONLINE - ${store.name}*\n\n👤 *Cliente:* ${customerName}\n📦 *Itens:*\n${itemsList}\n\n💰 *TOTAL: R$ ${total.toFixed(2)}*\n💳 *Pagamento:* ${payMethod}\n\n_Enviado via LojinIC_`;
    
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]);
    setIsCartOpen(false);
    setCheckoutStep('cart');
    addToast("Pedido enviado para o WhatsApp!", 'success');
  };

  if (!store) return <div className="h-screen flex items-center justify-center bg-brandBg text-brandTextSecondary animate-pulse">Carregando Vitrine...</div>;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || (category === 'featured' && p.featured);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-brandBg font-sans text-brandTextPrimary pb-24 selection:bg-brandPrimary selection:text-white">
      
      {/* Header */}
      <nav className="sticky top-0 z-30 bg-brandSurface/90 backdrop-blur-md border-b border-brandBorder shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-bold text-lg truncate tracking-tight text-white">{store.name}</h1>
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative p-2.5 bg-brandBg hover:bg-brandSurfaceLight rounded-full transition-colors border border-brandBorder"
          >
            <ShoppingBag className="w-5 h-5 text-brandTextPrimary" />
            {cart.length > 0 && (
              <span style={{ backgroundColor: brandColor }} className="absolute -top-1 -right-1 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm border-2 border-brandSurface animate-pulse">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
        
        {/* Search & Filters */}
        <div className="px-4 pb-4 max-w-5xl mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-brandTextSecondary" />
            <input 
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-brandBg border border-brandBorder focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-all text-white placeholder-brandTextSecondary/50 text-sm outline-none"
              placeholder="O que você procura?"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <CategoryPill label="Todos" active={category === 'all'} onClick={() => setCategory('all')} />
             <CategoryPill label="Destaques" active={category === 'featured'} onClick={() => setCategory('featured')} icon={<Sparkles className="w-3 h-3"/>} />
          </div>
        </div>
      </nav>

      {/* Product Grid */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onClick={() => setSelectedProduct(p)} 
              color={brandColor} 
            />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-brandTextSecondary">
            <Search className="w-10 h-10 mb-4 opacity-30" />
            <p className="text-sm font-medium">Nenhum produto encontrado.</p>
            <button onClick={() => {setSearch(''); setCategory('all')}} className="mt-2 text-xs text-brandPrimary hover:underline">Limpar filtros</button>
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)} />
           <div className="bg-brandSurface border border-brandBorder rounded-2xl w-full max-w-sm md:max-w-2xl overflow-hidden shadow-2xl relative animate-slide-up flex flex-col md:flex-row z-50">
              <button className="absolute top-3 right-3 p-2 bg-black/40 rounded-full text-white z-10 hover:bg-black/60 transition-colors backdrop-blur" onClick={() => setSelectedProduct(null)}>
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-brandBg relative">
                <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" alt={selectedProduct.name} />
                {selectedProduct.featured && (
                   <span className="absolute top-4 left-4 bg-brandAccent/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-brandBg shadow-sm border border-brandAccent/20">
                     DESTAQUE
                   </span>
                )}
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-1 bg-brandSurface">
                 <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">{selectedProduct.name}</h2>
                 <div className="text-2xl font-bold text-brandPrimary mb-4">R$ {selectedProduct.price.toFixed(2)}</div>
                 
                 <div className="flex-1 overflow-y-auto max-h-40 mb-6 custom-scrollbar">
                   <p className="text-sm text-brandTextSecondary leading-relaxed">
                     {selectedProduct.description || "Sem descrição disponível para este produto."}
                   </p>
                 </div>

                 <Button 
                    fullWidth 
                    size="lg" 
                    style={{ backgroundColor: brandColor }} 
                    onClick={() => addToCart(selectedProduct)}
                    className="mt-auto shadow-lg shadow-brandPrimary/20 border-transparent text-white"
                 >
                    Adicionar à Sacola
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-brandSurface shadow-2xl flex flex-col h-full animate-slide-in-right border-l border-brandBorder z-50">
            
            <div className="px-6 py-4 border-b border-brandBorder flex justify-between items-center bg-brandSurface z-10">
               <div>
                 <h2 className="font-bold text-white">{checkoutStep === 'cart' ? 'Sua Sacola' : 'Finalizar Pedido'}</h2>
                 <p className="text-xs text-brandTextSecondary">{cart.length} itens</p>
               </div>
               <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white">
                 <X className="w-5 h-5" />
               </button>
            </div>

            {checkoutStep === 'cart' ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-brandTextSecondary">
                      <ShoppingBag className="w-12 h-12 mb-4 opacity-30" />
                      <p className="text-sm">Sua sacola está vazia.</p>
                      <Button variant="ghost" onClick={() => setIsCartOpen(false)} className="mt-4">Voltar às compras</Button>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex gap-4 p-3 bg-brandBg rounded-xl border border-brandBorder">
                        <div className="w-16 h-16 rounded-lg bg-brandSurfaceLight overflow-hidden shrink-0 relative border border-brandBorder">
                           <img src={item.imageUrl} className="w-full h-full object-cover opacity-90" alt={item.name} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-brandTextPrimary line-clamp-2">{item.name}</h4>
                            <p className="text-xs font-bold text-brandPrimary mt-1">R$ {item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-3 bg-brandSurface rounded px-1 border border-brandBorder">
                                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-brandTextSecondary hover:text-white transition-colors"><Minus className="w-3 h-3"/></button>
                                <span className="text-xs font-mono w-4 text-center text-white">{item.quantity}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-brandTextSecondary hover:text-white transition-colors"><Plus className="w-3 h-3"/></button>
                             </div>
                             <button onClick={() => removeFromCart(item.id)} className="text-brandTextSecondary hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="p-6 bg-brandSurface border-t border-brandBorder">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-brandTextSecondary text-xs font-bold uppercase">Subtotal</span>
                      <span className="text-2xl font-bold text-white">R$ {total.toFixed(2)}</span>
                    </div>
                    <Button fullWidth onClick={() => setCheckoutStep('form')} size="lg" style={{ backgroundColor: brandColor }}>
                      Continuar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col p-6 bg-brandBg overflow-y-auto custom-scrollbar">
                 <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl mb-6 flex gap-3">
                   <div className="bg-emerald-500/20 p-1.5 rounded text-emerald-500 h-fit"><Check className="w-4 h-4"/></div>
                   <div className="text-xs text-brandTextSecondary">
                     <p className="font-bold text-emerald-400 mb-0.5">Pagamento Seguro</p>
                     Nenhum pagamento é feito agora. Você paga diretamente ao lojista na entrega/retirada.
                   </div>
                 </div>

                 <div className="space-y-5 flex-1">
                   <div>
                     <label className="block text-xs font-bold text-brandTextSecondary uppercase mb-1.5">Identificação</label>
                     <input className="w-full px-4 py-3 bg-brandSurface border border-brandBorder rounded-lg text-white focus:border-brandPrimary outline-none text-sm placeholder-slate-600 focus:ring-1 focus:ring-brandPrimary transition-all" placeholder="Seu nome completo" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-brandTextSecondary uppercase mb-1.5">Como prefere pagar?</label>
                     <div className="space-y-2">
                       {['Pix na Entrega', 'Dinheiro', 'Cartão de Crédito/Débito'].map(method => (
                         <div 
                           key={method}
                           onClick={() => setPayMethod(method)}
                           className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${payMethod === method ? 'bg-brandPrimary/10 border-brandPrimary' : 'bg-brandSurface border-brandBorder hover:border-brandTextSecondary'}`}
                         >
                           <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${payMethod === method ? 'border-brandPrimary' : 'border-brandTextSecondary'}`}>
                              {payMethod === method && <div className="w-2 h-2 rounded-full bg-brandPrimary" />}
                           </div>
                           <span className="text-sm font-medium text-slate-300">{method}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>

                 <div className="mt-auto space-y-3 pt-6">
                   <Button fullWidth onClick={handleCheckout} size="lg" style={{ backgroundColor: '#25D366' }} className="text-white hover:bg-green-600 border-transparent shadow-glow">
                      <MessageCircle className="w-4 h-4 mr-2" /> Finalizar no WhatsApp
                   </Button>
                   <Button fullWidth variant="ghost" onClick={() => setCheckoutStep('cart')}>Voltar ao Carrinho</Button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryPill = ({ label, active, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
      active 
        ? 'bg-brandSurfaceLight border-brandPrimary text-brandPrimary shadow-glow' 
        : 'bg-brandBg border-brandBorder text-brandTextSecondary hover:text-white hover:border-brandTextSecondary hover:bg-brandSurface'
    }`}
  >
    {icon} {label}
  </button>
);

const ProductCard = ({ product, onClick, color }: any) => (
  <div 
    onClick={onClick}
    className="group bg-brandSurface rounded-xl border border-brandBorder overflow-hidden hover:border-brandPrimary/40 transition-all duration-300 flex flex-col h-full cursor-pointer relative text-left shadow-sm hover:shadow-md hover:shadow-brandPrimary/5"
  >
    <div className="h-40 relative overflow-hidden bg-brandSurfaceLight">
      <img src={product.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition duration-500" alt={product.name} />
      {product.featured && (
        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur text-[9px] font-bold px-2 py-1 rounded text-brandAccent border border-white/10 shadow-sm">
          DESTAQUE
        </span>
      )}
    </div>
    <div className="p-3 flex flex-col flex-1">
      <h3 className="font-medium text-xs text-brandTextSecondary line-clamp-2 mb-2 min-h-[2.5em] group-hover:text-white transition-colors">{product.name}</h3>
      <div className="mt-auto flex justify-between items-center">
        <span className="text-sm font-bold text-white">R$ {product.price.toFixed(2)}</span>
        <div 
          style={{ backgroundColor: color }} 
          className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm"
        >
          <Eye className="w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
);