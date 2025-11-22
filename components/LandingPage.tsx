import React, { useState } from 'react';
import { AuthService, StoreService } from '../services/mockFirebase';
import { PlanType } from '../types';
import { Button } from './Button';
import { useToast } from '../contexts/ToastContext';
import { Dog, ArrowRight, Smartphone, ShieldCheck, Sparkles, LayoutDashboard } from 'lucide-react';

interface LandingPageProps {
  onLogin: (user: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const { addToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [plan, setPlan] = useState<PlanType>(PlanType.MONTHLY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await AuthService.login(email, password);
      if (isRegister) {
        if (!storeName.trim()) throw new Error("Nome da loja é obrigatório");
        await StoreService.createStore(user.uid, storeName, plan);
        addToast("Conta criada com sucesso!", 'success');
      } else {
        addToast("Bem-vindo de volta!", 'success');
      }
      onLogin(user);
    } catch (err) {
      addToast("Falha na autenticação. Verifique seus dados.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const scrollToAuth = (registerMode: boolean) => {
    setIsRegister(registerMode);
    const element = document.getElementById('auth-card');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const input = element.querySelector('input[type="email"]') as HTMLInputElement;
        if (input) input.focus();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brandBg text-brandTextPrimary font-sans overflow-hidden selection:bg-brandPrimary selection:text-white relative">
      
      {/* Subtle Dark Grid Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 border-b border-brandBorder bg-brandSurface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="bg-brandSurfaceLight border border-brandBorder p-2 rounded-lg group-hover:border-brandPrimary/50 transition-colors">
              <Dog className="w-5 h-5 text-brandPrimary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">LojinIC <span className="text-brandTextSecondary text-xs font-medium ml-1 bg-brandSurfaceLight px-1.5 py-0.5 rounded border border-brandBorder">PRO</span></span>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => scrollToAuth(false)}
               className="hidden sm:flex items-center gap-2 text-sm font-medium text-brandTextSecondary hover:text-brandTextPrimary transition-colors px-4 py-2"
             >
               <LayoutDashboard className="w-4 h-4" /> Login
             </button>
             <Button 
                size="sm" 
                variant="primary"
                onClick={() => scrollToAuth(true)}
             >
               Começar Agora
             </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 relative z-10 pt-24 lg:pt-0 min-h-screen">
        
        {/* Left: Value Prop */}
        <div className="lg:w-[55%] flex flex-col justify-center p-8 lg:p-20 xl:p-24">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brandSurface border border-brandBorder text-brandAccent text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
              <Sparkles className="w-3 h-3" /> Plataforma Enterprise
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
              Vendas online. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandPrimary to-brandAccent">
                Sem fricção.
              </span>
            </h1>
            
            <p className="text-lg text-brandTextSecondary mb-10 leading-relaxed max-w-lg border-l-2 border-brandPrimary pl-6">
              Infraestrutura robusta para catálogos digitais. Checkout direto no WhatsApp. Projetado para conversão máxima.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-12">
               <FeatureCard icon={<Smartphone/>} title="Mobile Native Feel" desc="UX otimizada para dispositivos móveis." />
               <FeatureCard icon={<ShieldCheck/>} title="Zero Login" desc="Checkout acelerado sem barreiras." />
            </div>

            <div className="flex items-center gap-4 opacity-60">
               <div className="h-px bg-brandBorder flex-1"></div>
               <span className="text-xs uppercase tracking-widest text-brandTextSecondary">Trusted by Entrepreneurs</span>
               <div className="h-px bg-brandBorder flex-1"></div>
            </div>
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="lg:w-[45%] flex items-center justify-center p-6 lg:p-12 bg-brandBg/50 lg:bg-brandSurface/30 border-l border-brandBorder backdrop-blur-sm" id="auth-card">
          <div className="w-full max-w-md animate-fade-in">
            
            <div className="bg-brandSurface border border-brandBorder rounded-2xl p-8 shadow-2xl shadow-black/50">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-2">
                  {isRegister ? 'Nova Conta Corporativa' : 'Acesso ao Painel'}
                </h2>
                <p className="text-brandTextSecondary text-sm">
                  {isRegister ? 'Configure sua loja em segundos.' : 'Gerencie seu catálogo e vendas.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {isRegister && (
                  <div className="animate-slide-up">
                    <InputLabel>Nome da Loja</InputLabel>
                    <DarkInput 
                      required
                      placeholder="Ex: LojinIC Tech"
                      value={storeName}
                      onChange={(e: any) => setStoreName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <InputLabel>E-mail Profissional</InputLabel>
                  <DarkInput 
                    required
                    type="email" 
                    placeholder="nome@empresa.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <InputLabel>Senha</InputLabel>
                    {!isRegister && <span className="text-xs text-brandPrimary cursor-pointer hover:underline">Esqueceu?</span>}
                  </div>
                  <DarkInput 
                    required
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                  />
                </div>

                {isRegister && (
                  <div className="grid grid-cols-2 gap-3 pt-2 animate-fade-in">
                    <PlanOption 
                      title="Mensal" 
                      price="25" 
                      active={plan === PlanType.MONTHLY} 
                      onClick={() => setPlan(PlanType.MONTHLY)} 
                    />
                    <PlanOption 
                      title="Anual" 
                      price="300" 
                      active={plan === PlanType.ANNUAL} 
                      onClick={() => setPlan(PlanType.ANNUAL)} 
                      tag="-15%"
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  size="lg" 
                  isLoading={loading}
                  className="mt-4"
                >
                  {isRegister ? 'Criar Loja' : 'Entrar'} <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-brandBorder text-center">
                <button 
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-brandTextSecondary hover:text-white transition-colors font-medium"
                >
                  {isRegister ? 'Já possui acesso? Login' : 'Não tem conta? Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="flex gap-4 p-4 rounded-xl bg-brandSurface border border-brandBorder hover:border-brandPrimary/40 hover:bg-brandSurfaceLight transition-all duration-300 group shadow-sm">
    <div className="w-10 h-10 rounded-lg bg-brandBg text-brandPrimary flex items-center justify-center shrink-0 border border-brandBorder group-hover:border-brandPrimary/30 transition-colors">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-brandTextPrimary text-sm mb-1">{title}</h3>
      <p className="text-xs text-brandTextSecondary leading-relaxed">{desc}</p>
    </div>
  </div>
);

const PlanOption = ({ title, price, active, onClick, tag }: any) => (
  <div 
    onClick={onClick}
    className={`cursor-pointer relative p-3 rounded-lg border transition-all duration-200 text-center ${
      active 
        ? 'border-brandPrimary bg-brandPrimary/10' 
        : 'border-brandBorder bg-brandBg hover:border-brandTextSecondary'
    }`}
  >
    {tag && <span className="absolute -top-2 -right-1 bg-brandAccent text-brandBg text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">{tag}</span>}
    <div className={`text-[10px] font-bold uppercase mb-1 ${active ? 'text-brandPrimary' : 'text-brandTextSecondary'}`}>{title}</div>
    <div className="text-lg font-bold text-white">R$ {price}</div>
  </div>
);

const InputLabel = ({ children }: {children: React.ReactNode}) => (
  <label className="block text-xs font-bold text-brandTextSecondary uppercase mb-1.5 tracking-wider">{children}</label>
);

const DarkInput = (props: any) => (
  <input 
    {...props}
    className="w-full px-4 py-3 rounded-lg bg-brandBg border border-brandBorder text-brandTextPrimary placeholder:text-brandTextSecondary/50 focus:border-brandPrimary focus:ring-1 focus:ring-brandPrimary transition-all text-sm shadow-inner outline-none"
  />
);