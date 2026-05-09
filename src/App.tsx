/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  Plus, 
  Minus,
  Check,
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  Download,
  Menu,
  X,
  TrendingUp,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  ImageOff,
  Settings,
  LogOut,
  User as UserIcon,
  Shield,
  Key,
  Zap,
  CreditCard,
  Printer,
  FileDown,
  Image as ImageIcon,
  Phone,
  MapPin,
  Calendar,
  CreditCard as CardIcon,
  Share2,
  ExternalLink,
  Trophy,
  Medal,
  Activity,
  UserCheck,
  UserX,
  History,
  Award,
  Gem,
  Minimize2,
  Maximize2,
  ArrowLeft,
  Edit3,
  Upload,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Cloud,
  CloudOff,
  Bell,
  Megaphone,
  Pin,
  CheckCircle2,
  CalendarDays,
  Package,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  format, 
  startOfMonth, 
  isSameMonth, 
  isAfter, 
  isBefore, 
  addMonths, 
  subMonths,
  parseISO,
  endOfMonth,
  eachMonthOfInterval,
  differenceInMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as htmlToImage from 'html-to-image';

// Links fixos para os selos do Hall da Fama (Substitua pelos links PNG transparentes aqui)
const LINK_OURO = "https://i.postimg.cc/QtXbfNJN/IMG-9498-removebg-preview.png";
const LINK_PRATA = "https://i.postimg.cc/CKC7CnDr/IMG-9499-removebg-preview.png";
const LINK_MAESTRO = "https://i.postimg.cc/fLwK8Wf8/IMG-9500-removebg-preview.png";
const LINK_GOLEIRO = "https://i.postimg.cc/W3X7CR9V/IMG-9501-removebg-preview.png";
const LINK_CLUB_LOGO = "https://i.postimg.cc/8zWqPsrR/Whats-App-Image-2026-05-06-at-10-39-54-removebg-preview.png"; // Novo link do Escudo Gavião Futebol Clube (PNG)

import { AppState, Member, Payment, Expense, OtherIncome, OtherIncomeCategory, MemberStatus, PaymentStatus, PaymentMethod, ExpenseCategory, AssociationInfo, User, UserRole, LoggedUser, Training, MatchPlayer, FinesConfig, OuvidoriaMessage, GalleryPhoto, Notice, NoticeCategory, InventoryCategory, InventoryCondition, InventoryHistory, InventoryItem } from './types';
import { cn, getSecondSaturday, formatCurrency, toCamelCase, toSnakeCase, mapMemberFromDB, mapMemberToDB, mapTrainingFromDB, mapTrainingToDB } from './lib/utils';
import { supabase } from './lib/supabase';

function StatStepper({ label, value, onChange, max = 99 }: { label: string; value: number; onChange: (v: number) => void; max?: number; key?: any }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">{label}</label>
      <div className="flex items-center justify-between bg-slate-900 rounded-xl p-1 border border-slate-700">
        <button 
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <Minus size={14} />
        </button>
        <span className="text-sm font-black text-white w-8 text-center">{value}</span>
        <button 
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function StatCardTablet({ label, value, onChange, max = 99, color = 'blue', size = 'md' }: { label: string; value: number; onChange: (v: number) => void; max?: number; color?: 'blue' | 'emerald' | 'yellow' | 'red'; size?: 'md' | 'lg' }) {
  const colorClasses = {
    blue: 'bg-blue-600/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400',
    yellow: 'bg-yellow-600/10 border-yellow-500/20 text-yellow-500',
    red: 'bg-red-600/10 border-red-500/20 text-red-500'
  };

  const btnClasses = {
    blue: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/50',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/50',
    yellow: 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-yellow-500/50',
    red: 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/50'
  };

  const isLarge = size === 'lg';

  return (
    <div className={cn(
      "flex flex-col gap-2 p-3 rounded-xl border transition-all", 
      colorClasses[color],
      isLarge && "p-4 gap-4"
    )}>
      <span className={cn("font-black uppercase tracking-widest text-center", isLarge ? "text-xs" : "text-[10px]")}>{label}</span>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className={cn(
            "rounded-lg flex items-center justify-center transition-all bg-slate-800 active:scale-95", 
            btnClasses[color],
            isLarge ? "w-14 h-14" : "w-10 h-10"
          )}
        >
          <Minus size={isLarge ? 24 : 20} />
        </button>
        <span className={cn("font-black text-white", isLarge ? "text-3xl" : "text-xl")}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className={cn(
            "rounded-lg flex items-center justify-center transition-all bg-slate-800 active:scale-95", 
            btnClasses[color],
            isLarge ? "w-14 h-14" : "w-10 h-10"
          )}
        >
          <Plus size={isLarge ? 24 : 20} />
        </button>
      </div>
    </div>
  );
}

function RankingCard({ 
  rank, 
  name, 
  value, 
  label, 
  color = 'amber',
  onClick 
}: { 
  rank: number; 
  name: string; 
  value: number; 
  label: string; 
  color?: 'amber' | 'blue'; 
  key?: any;
  onClick?: () => void;
}) {
  const isTop3 = rank <= 3;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-between p-4 rounded-2xl border transition-all",
        onClick && "cursor-pointer hover:scale-[1.02] hover:border-slate-500",
        isTop3 
          ? (color === 'amber' ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5" : "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5")
          : "bg-slate-800/50 border-slate-700/50"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-black text-lg",
          rank === 1 ? "bg-yellow-400 text-slate-900 shadow-xl shadow-yellow-400/20" :
          rank === 2 ? "bg-slate-300 text-slate-900 shadow-xl shadow-slate-300/20" :
          rank === 3 ? "bg-amber-600 text-white shadow-xl shadow-amber-600/20" :
          "bg-slate-700 text-slate-400"
        )}>
          {rank}
        </div>
        <div>
          <p className={cn("font-bold", isTop3 ? "text-white" : "text-slate-300")}>{name}</p>
          {rank === 1 && <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Destaque do Ano</p>}
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-2xl font-black leading-none", color === 'amber' ? "text-amber-400" : "text-blue-400")}>{value}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
      </div>
    </motion.div>
  );
}

// --- Utils ---

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

const DEFAULT_ASSOCIATION_INFO: AssociationInfo = {
  nome: "GAVIÃO FUTEBOL CLUBE",
  cnpj: "10.248.558/0001-44",
  endereco: "R Floriano Peixoto, S/N, 58.801-450, Areias, Sousa-PB",
  contato: "(83) 99117-9648"
};

const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Administrador', role: 'Admin', createdAt: new Date().toISOString() }
];

const INITIAL_PASSWORD = "GV050501#";

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-[#1e293b] rounded-xl border border-slate-700/50 shadow-lg overflow-hidden", className)}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled = false,
  type = 'button',
  id
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
}) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white"
  };

  return (
    <button 
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'neutral', className }: { children: React.ReactNode; variant?: 'neutral' | 'success' | 'danger' | 'warning'; className?: string }) => {
  const variants = {
    neutral: "bg-slate-700 text-slate-300",
    success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20",
    warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20"
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap", variants[variant], className)}>
      {children}
    </span>
  );
};

function ResponsiveTable<T>({ 
  data, 
  columns, 
  renderCard, 
  emptyMessage = "Nenhum registro encontrado." 
}: { 
  data: T[]; 
  columns: { header: string; key?: string; className?: string; render?: (item: T) => React.ReactNode }[];
  renderCard: (item: T) => React.ReactNode;
  emptyMessage?: string;
}) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700">
              {columns.map((col, i) => (
                <th key={i} className={cn("px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.length > 0 ? (
              data.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className={cn("px-6 py-4", col.className)}>
                      {col.render ? col.render(item) : (col.key ? (item[col.key as keyof T] as any) : null)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-700/50">
        {data.length > 0 ? (
          data.map((item, i) => (
            <div key={i} className="p-4 space-y-3">
              {renderCard(item)}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </>
  );
}

// --- Main App ---

export default function App() {
  const [loggedUser, setLoggedUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoggedUser(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid: string) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', uid).single();
      if (error) throw error;
      setLoggedUser(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setAuthLoading(false);
    }
  }

  const [state, setState] = useState<AppState>({
    members: [],
    payments: [],
    expenses: [],
    otherIncome: [],
    trainings: [],
    finesConfig: { yellowCardValue: 5, redCardValue: 10 },
    users: DEFAULT_USERS,
    systemPassword: INITIAL_PASSWORD,
    lastAutomationRun: new Date().toISOString(),
    associationInfo: DEFAULT_ASSOCIATION_INFO,
    notices: [],
    initialBalance: 0,
    inventory: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: membersData },
          { data: paymentsData },
          { data: expensesData },
          { data: otherIncomeData },
          { data: trainingsData },
          { data: trainingPlayersData },
          { data: noticesData },
          { data: inventoryData },
          { data: usersData },
          { data: settingsData }
        ] = await Promise.all([
          supabase.from('members').select('*'),
          supabase.from('payments').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('other_incomes').select('*'),
          supabase.from('trainings').select('*'),
          supabase.from('training_players').select('*'),
          supabase.from('notices').select('*'),
          supabase.from('inventory_items').select('*'),
          supabase.from('users').select('*'),
          supabase.from('system_settings').select('*').eq('id', 'default').single()
        ]);

        const mergedTrainings = trainingsData ? trainingsData.map(t => {
          const tPlayers = trainingPlayersData 
            ? trainingPlayersData.filter(p => p.training_id === t.id)
            : [];
          return mapTrainingFromDB(t, tPlayers);
        }) : [];

        setState(prev => ({
          ...prev,
          members: membersData ? membersData.map(mapMemberFromDB) : [],
          payments: paymentsData ? toCamelCase(paymentsData) : [],
          expenses: expensesData ? toCamelCase(expensesData) : [],
          otherIncome: otherIncomeData ? toCamelCase(otherIncomeData) : [],
          trainings: mergedTrainings,
          notices: noticesData ? toCamelCase(noticesData) : [],
          inventory: inventoryData ? toCamelCase(inventoryData) : [],
          users: usersData?.length ? toCamelCase(usersData) : DEFAULT_USERS,
          initialBalance: settingsData?.initial_balance || 0,
          finesConfig: {
            yellowCardValue: settingsData?.fines_yellow_card_value || 5,
            redCardValue: settingsData?.fines_red_card_value || 10
          },
          associationInfo: {
            nome: settingsData?.association_name || DEFAULT_ASSOCIATION_INFO.nome,
            cnpj: settingsData?.association_cnpj || DEFAULT_ASSOCIATION_INFO.cnpj,
            endereco: settingsData?.association_address || DEFAULT_ASSOCIATION_INFO.endereco,
            contato: settingsData?.association_contact || DEFAULT_ASSOCIATION_INFO.contato
          }
        }));
      } catch (err) {
        console.error("Erro ao carregar do Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'financial' | 'reports' | 'settings' | 'arena' | 'ranking' | 'ouvidoria' | 'gallery' | 'mural' | 'inventory'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  
  useEffect(() => {
    // Forçar limpeza de dados antigos do banco de dados e registros se solicitado pelo reset
    const hasReset = localStorage.getItem('APP_RESET_V2');
    if (!hasReset) {
      localStorage.clear();
      localStorage.setItem('APP_RESET_V2', 'true');
      window.location.reload();
    }
  }, []);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showFeedback('success', 'Conexão restabelecida! Sincronizando dados...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showFeedback('error', 'Modo Offline Ativo. As alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [ouvidoriaMessages, setOuvidoriaMessages] = useState<OuvidoriaMessage[]>([]);

  useEffect(() => {
    async function loadOuvidoria() {
      const { data } = await supabase.from('ouvidoria_messages').select('*');
      if (data) setOuvidoriaMessages(toCamelCase(data));
    }
    loadOuvidoria();
  }, []);

  const saveOuvidoriaMessage = async (assunto: string, mensagem: string) => {
    const newMessage: OuvidoriaMessage = {
      id: Date.now(),
      assunto,
      mensagem,
      autor: currentUser || "Desconhecido",
      data: new Date().toISOString(),
      resolvido: false
    };
    try {
      const { error } = await supabase.from('ouvidoria_messages').insert([toSnakeCase(newMessage)]);
      if (error) throw error;
      setOuvidoriaMessages([newMessage, ...ouvidoriaMessages]);
      showFeedback('success', 'Mensagem enviada com sucesso!');
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao enviar mensagem: ${err.message}`);
    }
  };

  const resolveOuvidoriaMessage = async (id: number) => {
    const msg = ouvidoriaMessages.find(m => m.id === id);
    if (!msg) return;
    try {
      const { error } = await supabase.from('ouvidoria_messages').update({ resolvido: !msg.resolvido }).eq('id', id);
      if (error) throw error;
      setOuvidoriaMessages(prev => prev.map(m => 
        m.id === id ? { ...m, resolvido: !m.resolvido } : m
      ));
      showFeedback('success', 'Status da mensagem atualizado!');
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao atualizar mensagem: ${err.message}`);
    }
  };

  const deleteOuvidoriaMessage = async (id: number) => {
    if (!window.confirm("Deseja excluir esta mensagem?")) return;
    try {
      const { error } = await supabase.from('ouvidoria_messages').delete().eq('id', id);
      if (error) throw error;
      setOuvidoriaMessages(prev => prev.filter(msg => String(msg.id).trim() !== String(id).trim()));
      alert("Excluído!");
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao excluir mensagem: ${err.message}`);
    }
  };

  const clearAllOuvidoriaMessages = async () => {
    try {
      const { error } = await supabase.from('ouvidoria_messages').delete().neq('id', 0);
      if (error) throw error;
      setOuvidoriaMessages([]);
      showFeedback('success', 'Ouvidoria limpa com sucesso!');
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao limpar ouvidoria: ${err.message}`);
    }
  };

  const clearAllGalleryPhotos = async () => {
    if (!window.confirm("ATENÇÃO: Deseja apagar todas as fotos da galeria permanentemente?")) return;
    try {
      const { error } = await supabase.from('gallery_photos').delete().neq('id', '0');
      if (error) throw error;
      window.location.reload(); 
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao limpar galeria: ${err.message}`);
    }
  };

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
  };

  const currentUser = loggedUser?.name || loggedUser?.email?.split('@')[0] || 'Usuário';
  const isAdmin = loggedUser?.role === 'admin';
  const isSocio = !!loggedUser && !isAdmin;
  const isVisitor = !loggedUser;
  const isAuthenticated = !!loggedUser;

  // --- Automation Logic (Local Only) ---
  useEffect(() => {
    if (!isAdmin) return;

    const runAutomation = () => {
      const now = new Date();
      const lastRun = parseISO(state.lastAutomationRun);
      
      if (!isSameMonth(now, lastRun)) {
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const activeMembers = state.members.filter(m => m.status === 'Ativo');
        const newPayments: Payment[] = [];

        for (const member of activeMembers) {
          const exists = state.payments.some(p => 
            p.memberId === member.id && 
            p.month === currentMonth && 
            p.year === currentYear
          );

          if (!exists) {
            const dueDate = getSecondSaturday(currentMonth, currentYear);
            const paymentId = crypto.randomUUID();
            newPayments.push({
              id: paymentId,
              memberId: member.id,
              memberName: member.name,
              month: currentMonth,
              year: currentYear,
              amount: member.monthlyFee,
              status: 'Pendente',
              dueDate: dueDate.toISOString(),
              createdAt: new Date().toISOString(),
              createdBy: 'Sistema'
            });
          }
        }

        if (newPayments.length > 0) {
          setState(prev => ({
            ...prev,
            payments: [...prev.payments, ...newPayments],
            lastAutomationRun: now.toISOString()
          }));
        } else {
          setState(prev => ({
            ...prev,
            lastAutomationRun: now.toISOString()
          }));
        }
      }
    };

    runAutomation();
  }, [isAdmin, state.members, state.payments, state.lastAutomationRun]);

  // --- Handlers (100% Local) ---
  
  const addMember = async (memberData: Omit<Member, 'id' | 'createdAt' | 'createdBy'>) => {
    const memberId = crypto.randomUUID();
    const newMember: Member = {
      id: memberId,
      ...memberData,
      createdAt: new Date().toISOString(),
      createdBy: currentUser || 'Sistema'
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newPayments: Payment[] = [];

    if (memberData.status === 'Ativo') {
      const dueDate = getSecondSaturday(currentMonth, currentYear);
      const paymentId = crypto.randomUUID();
      newPayments.push({
        id: paymentId,
        memberId: memberId,
        memberName: memberData.name,
        month: currentMonth,
        year: currentYear,
        amount: memberData.monthlyFee,
        status: 'Pendente',
        dueDate: dueDate.toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'Sistema'
      });
    }

    try {
      const { error: membersError } = await supabase.from('members').insert([mapMemberToDB(newMember)]);
      if (membersError) throw membersError;
      if (newPayments.length > 0) {
        const { error: paymentsError } = await supabase.from('payments').insert(toSnakeCase(newPayments));
        if (paymentsError) throw paymentsError;
      }
      setState(prev => ({
        ...prev,
        members: [...prev.members, newMember],
        payments: [...prev.payments, ...newPayments]
      }));
      showFeedback('success', 'Sócio salvo com sucesso!');
    } catch (err: any) {
      console.error('Supabase AddMember Error:', err);
      showFeedback('error', `Erro ao salvar no banco: ${err.message || err.details || JSON.stringify(err)}`);
    }
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    try {
      const { error } = await supabase.from('members').update(mapMemberToDB(updates)).eq('id', id);
      if (error) throw error;
      setState(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m)
      }));
      showFeedback('success', 'Sócio atualizado!');
    } catch (err: any) {
      console.error('Supabase UpdateMember Error:', err);
      showFeedback('error', `Erro ao atualizar no banco: ${err.message || err.details || JSON.stringify(err)}`);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await supabase.from('payments').delete().eq('member_id', id);
      await supabase.from('members').delete().eq('id', id);
      setState(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== id),
        payments: prev.payments.filter(p => p.memberId !== id)
      }));
      showFeedback('success', 'Sócio excluído!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao excluir no banco.');
    }
  };

  const addTraining = async (trainingData: Omit<Training, 'id' | 'createdAt' | 'createdBy'>) => {
    const trainingId = crypto.randomUUID();
    const newTraining: Training = {
      id: trainingId,
      ...trainingData,
      createdAt: new Date().toISOString(),
      createdBy: currentUser || 'Sistema'
    };

    try {
      const { players } = newTraining;
      await supabase.from('trainings').insert([mapTrainingToDB(newTraining)]);
      
      if (players && players.length > 0) {
        const playersToInsert = players.map(p => ({
          ...p,
          training_id: trainingId
        }));
        await supabase.from('training_players').insert(toSnakeCase(playersToInsert));
      }

      setState(prev => ({
        ...prev,
        trainings: [newTraining, ...(prev.trainings || [])]
      }));
      showFeedback('success', 'Treino registrado!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao salvar o treino no banco.');
    }
  };

  const updateTraining = async (id: string, trainingData: Partial<Training>) => {
    try {
      const { players, ...trainingDetails } = trainingData;
      if (Object.keys(trainingDetails).length > 0) {
        await supabase.from('trainings').update(mapTrainingToDB(trainingData)).eq('id', id);
      }

      if (players) {
        await supabase.from('training_players').delete().eq('training_id', id);
        if (players.length > 0) {
          const playersToInsert = players.map(p => ({
            ...p,
            training_id: id
          }));
          await supabase.from('training_players').insert(toSnakeCase(playersToInsert));
        }
      }

      setState(prev => ({
        ...prev,
        trainings: (prev.trainings || []).map(t => t.id === id ? { ...t, ...trainingData } : t)
      }));
      showFeedback('success', 'Treino atualizado!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao atualizar o treino no banco.');
    }
  };

  const deleteTraining = async (id: string) => {
    try {
      await supabase.from('training_players').delete().eq('training_id', id);
      await supabase.from('trainings').delete().eq('id', id);
      setState(prev => ({
        ...prev,
        trainings: (prev.trainings || []).filter(t => t.id !== id)
      }));
      showFeedback('success', 'Treino excluído!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao excluir o treino no banco.');
    }
  };

  const updateFinesConfig = async (config: FinesConfig) => {
    try {
      const { error } = await supabase.from('system_settings').update({
        fines_yellow_card_value: config.yellowCardValue,
        fines_red_card_value: config.redCardValue
      }).eq('id', 'default');
      if (error) throw error;
      setState(prev => ({ ...prev, finesConfig: config }));
      showFeedback('success', 'Configuração de multas atualizada!');
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao atualizar multas: ${err.message}`);
    }
  };

  const getPlayerStats = (memberId: string) => {
    const allTrainings = state.trainings || [];
    const playerTrainings = allTrainings
      .filter(t => t.players.some(p => p.memberId === memberId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let totalGoals = 0;
    let totalAssists = 0;
    let totalYellows = 0;
    let totalReds = 0;
    let mvps = 0;

    allTrainings.forEach(t => {
      const p = t.players.find(p => p.memberId === memberId);
      if (p) {
        totalGoals += p.goals;
        totalAssists += p.assists;
        totalYellows += p.yellowCards;
        totalReds += p.redCards;
        if (p.isMvp) mvps++;
      }
    });

    const lastMatch = playerTrainings[0];
    const lastPlayerStats = lastMatch?.players.find(p => p.memberId === memberId);
    
    // Calculate total yellows up to the last match played
    let yellowsUpToLastMatch = 0;
    if (lastMatch) {
      allTrainings.forEach(t => {
        if (new Date(t.date) <= new Date(lastMatch.date)) {
          const p = t.players.find(p => p.memberId === memberId);
          if (p) yellowsUpToLastMatch += p.yellowCards;
        }
      });
    }

    const isSuspendedByRed = lastPlayerStats ? lastPlayerStats.redCards > 0 : false;
    const isSuspendedByYellow = lastPlayerStats ? (lastPlayerStats.yellowCards > 0 && yellowsUpToLastMatch > 0 && yellowsUpToLastMatch % 3 === 0) : false;
    
    const globalLastTraining = allTrainings[0];
    const isSuspended = (isSuspendedByRed || isSuspendedByYellow) && (lastMatch?.id === globalLastTraining?.id);

    const yellowFine = (state.finesConfig?.yellowCardValue || 0) * totalYellows;
    const redFine = (state.finesConfig?.redCardValue || 0) * totalReds;
    const totalDebt = yellowFine + redFine;

    return {
      totalGoals,
      totalAssists,
      totalYellows,
      totalReds,
      mvps,
      isSuspended,
      totalDebt
    };
  };

  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    const payment = state.payments.find(p => p.id === paymentId);
    if (!payment) return;

    const isEdited = updates.amount !== undefined && updates.amount !== (payment.originalAmount || payment.amount);
    const finalUpdates = {
      ...updates,
      originalAmount: payment.originalAmount || payment.amount,
      isEdited: isEdited || payment.isEdited,
      updatedBy: currentUser || 'Sistema'
    };

    try {
      await supabase.from('payments').update(toSnakeCase(finalUpdates)).eq('id', paymentId);
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(p => p.id === paymentId ? { ...p, ...finalUpdates } : p)
      }));
      showFeedback('success', 'Pagamento atualizado!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao atualizar pagamento no banco.');
    }
  };

  const togglePaymentStatus = async (paymentId: string, amount?: number, method?: PaymentMethod) => {
    const p = state.payments.find(p => p.id === paymentId);
    if (!p) return;

    const newStatus: PaymentStatus = p.status === 'Pago' ? 'Pendente' : 'Pago';
    const finalAmount = amount !== undefined ? amount : p.amount;
    const isEdited = amount !== undefined && amount !== (p.originalAmount || p.amount);
    
    const updates: Partial<Payment> = {
      status: newStatus,
      amount: finalAmount,
      originalAmount: p.originalAmount || p.amount,
      isEdited: isEdited || p.isEdited,
      paymentMethod: method || p.paymentMethod,
      paidAt: newStatus === 'Pago' ? new Date().toISOString() : undefined,
      updatedBy: currentUser || 'Sistema'
    };

    try {
      await supabase.from('payments').update(toSnakeCase(updates)).eq('id', paymentId);
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(pay => pay.id === paymentId ? { ...pay, ...updates } : pay)
      }));
      showFeedback('success', `Status alterado para ${newStatus}`);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao alterar status no banco.');
    }
  };

  const registerRetroactivePayment = async (memberId: string, month: number, year: number, amount: number, paymentMethod: PaymentMethod, date: string, notes?: string, status: PaymentStatus = 'Pago', origem?: string) => {
    const member = state.members.find(m => m.id === memberId);
    if (!member) return;

    const existing = state.payments.find(p => p.memberId === memberId && p.month === month && p.year === year);
    
    const paymentId = existing ? existing.id : crypto.randomUUID();
    const paymentData: Payment = {
      id: paymentId,
      memberId,
      memberName: member.name,
      month,
      year,
      amount,
      status,
      dueDate: getSecondSaturday(month, year).toISOString(),
      paidAt: status === 'Pago' ? date : undefined,
      paymentMethod: status === 'Pago' ? paymentMethod : undefined,
      origem: origem || (existing ? existing.origem : undefined),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      createdBy: existing ? existing.createdBy : (currentUser || 'Sistema'),
      updatedBy: currentUser || 'Sistema',
      notes
    };

    try {
      if (existing) {
        await supabase.from('payments').update(toSnakeCase(paymentData)).eq('id', paymentId);
      } else {
        await supabase.from('payments').insert([toSnakeCase(paymentData)]);
      }
      setState(prev => {
        const filtered = prev.payments.filter(p => p.id !== paymentId);
        return { ...prev, payments: [...filtered, paymentData] };
      });
      showFeedback('success', 'Pagamento registrado no banco!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao registrar pagamento.');
    }
  };

  const generateMassDebts = async () => {
    const now = new Date();
    const newPayments: Payment[] = [];
    let count = 0;

    state.members.filter(m => m.status === 'Ativo').forEach(member => {
      const joinDate = parseISO(member.createdAt);
      const months = eachMonthOfInterval({
        start: startOfMonth(joinDate),
        end: startOfMonth(now)
      });

      months.forEach(monthDate => {
        const m = monthDate.getMonth();
        const y = monthDate.getFullYear();
        const exists = state.payments.some(p => p.memberId === member.id && p.month === m && p.year === y);
        
        if (!exists) {
          newPayments.push({
            id: crypto.randomUUID(),
            memberId: member.id,
            memberName: member.name,
            month: m,
            year: y,
            amount: member.monthlyFee,
            status: 'Pendente',
            dueDate: getSecondSaturday(m, y).toISOString(),
            createdAt: new Date().toISOString(),
            createdBy: currentUser || 'Sistema',
            origem: 'automacao_massa'
          });
          count++;
        }
      });
    });

    if (count === 0) {
      showFeedback('success', 'Todos os débitos já estão em dia!');
      return;
    }

    try {
      await supabase.from('payments').insert(toSnakeCase(newPayments));
      setState(prev => ({
        ...prev,
        payments: [...prev.payments, ...newPayments]
      }));
      showFeedback('success', `${count} novos débitos gerados no banco!`);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao gerar débitos no banco.');
    }
  };

  const addExpense = async (description: string, amount: number, date: string, category: ExpenseCategory, notes?: string) => {
    const expenseId = crypto.randomUUID();
    const newExpense: Expense = {
      id: expenseId,
      description,
      amount,
      date,
      category,
      notes,
      createdBy: currentUser || 'Sistema'
    };

    try {
      await supabase.from('expenses').insert([toSnakeCase(newExpense)]);
      setState(prev => ({
        ...prev,
        expenses: [...(prev.expenses || []), newExpense]
      }));
      showFeedback('success', 'Despesa salva no banco!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao salvar despesa.');
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      await supabase.from('expenses').update(toSnakeCase(updates)).eq('id', id);
      setState(prev => ({
        ...prev,
        expenses: (prev.expenses || []).map(e => e.id === id ? { ...e, ...updates } : e)
      }));
      showFeedback('success', 'Despesa atualizada!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao atualizar despesa.');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', id);
      setState(prev => ({
        ...prev,
        expenses: (prev.expenses || []).filter(e => e.id !== id)
      }));
      showFeedback('success', 'Despesa excluída!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao excluir despesa.');
    }
  };

  const addOtherIncome = async (description: string, amount: number, date: string, category: OtherIncomeCategory, paymentMethod: PaymentMethod, notes?: string) => {
    const incomeId = crypto.randomUUID();
    const newIncome: OtherIncome = {
      id: incomeId,
      description,
      amount,
      date,
      category,
      paymentMethod,
      notes,
      createdBy: currentUser || 'Sistema'
    };

    try {
      await supabase.from('other_incomes').insert([toSnakeCase(newIncome)]);
      setState(prev => ({
        ...prev,
        otherIncome: [...(prev.otherIncome || []), newIncome]
      }));
      showFeedback('success', 'Receita salva no banco!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao salvar receita.');
    }
  };

  const deleteOtherIncome = async (id: string) => {
    try {
      await supabase.from('other_incomes').delete().eq('id', id);
      setState(prev => ({
        ...prev,
        otherIncome: (prev.otherIncome || []).filter(i => i.id !== id)
      }));
      showFeedback('success', 'Receita excluída!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao excluir receita.');
    }
  };

  const updateInitialBalance = async (val: number) => {
    try {
      const { error } = await supabase.from('system_settings').update({ initial_balance: val }).eq('id', 'default');
      if (error) throw error;
      setState(prev => ({ ...prev, initialBalance: val }));
      showFeedback('success', 'Saldo inicial atualizado no banco!');
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao atualizar saldo: ${err.message}`);
    }
  };

  // --- Inventory Handlers ---
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'createdBy' | 'history'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser || 'Sistema',
      history: []
    };
    try {
      const { history, ...itemDetails } = newItem;
      await supabase.from('inventory_items').insert([toSnakeCase(itemDetails)]);
      setState(prev => ({
        ...prev,
        inventory: [...(prev.inventory || []), newItem]
      }));
      showFeedback('success', 'Item adicionado ao almoxarifado!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao adicionar item.');
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { history, ...itemDetails } = updates;
      if (Object.keys(itemDetails).length > 0) {
        await supabase.from('inventory_items').update(toSnakeCase(itemDetails)).eq('id', id);
      }
      setState(prev => ({
        ...prev,
        inventory: (prev.inventory || []).map(item => item.id === id ? { ...item, ...updates } : item)
      }));
      showFeedback('success', 'Item atualizado!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao atualizar item.');
    }
  };

  const deleteInventoryItem = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este item do almoxarifado?")) return;
    try {
      await supabase.from('inventory_history').delete().eq('item_id', id);
      await supabase.from('inventory_items').delete().eq('id', id);
      setState(prev => ({
        ...prev,
        inventory: (prev.inventory || []).filter(item => item.id !== id)
      }));
      showFeedback('success', 'Item removido!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao remover item.');
    }
  };

  const registerInventoryOutflow = async (id: string, quantity: number, reason: string, observations?: string) => {
    const historyEntry: InventoryHistory = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      description: reason,
      type: 'Saída',
      quantityDelta: -quantity,
      observations,
      createdBy: currentUser || 'Sistema'
    };

    try {
      const item = state.inventory.find(i => i.id === id);
      if (!item) return;
      
      const newQty = Math.max(0, item.quantity - quantity);
      await supabase.from('inventory_items').update({ quantity: newQty }).eq('id', id);
      await supabase.from('inventory_history').insert([{ ...toSnakeCase(historyEntry), item_id: id }]);

      setState(prev => {
        const inventory = (prev.inventory || []).map(i => {
          if (i.id === id) {
            return {
              ...i,
              quantity: newQty,
              history: [...(i.history || []), historyEntry]
            };
          }
          return i;
        });
        return { ...prev, inventory };
      });
      showFeedback('success', 'Saída de estoque registrada no banco!');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Erro ao registrar saída de estoque.');
    }
  };


  // --- Computed Stats ---

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const validMemberIds = new Set(state.members.map(m => m.id));

    const currentMonthPayments = state.payments.filter(p => 
      p.month === currentMonth && p.year === currentYear && validMemberIds.has(p.memberId)
    );
    
    const revenue = currentMonthPayments
      .filter(p => p.status === 'Pago')
      .reduce((acc, p) => acc + p.amount, 0);

    const currentMonthOtherIncome = (state.otherIncome || []).filter(i => {
      const d = parseISO(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, i) => acc + i.amount, 0);

    const pending = currentMonthPayments
      .filter(p => p.status === 'Pendente')
      .reduce((acc, p) => acc + p.amount, 0);

    const currentMonthExpenses = (state.expenses || []).filter(e => {
      const d = parseISO(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, e) => acc + e.amount, 0);

    const activeMembers = state.members.filter(m => m.status === 'Ativo').length;

    const pendingPayments = state.payments.filter(p => 
      p.status?.toLowerCase() === 'pendente' && validMemberIds.has(p.memberId)
    );
    
    const delinquencyMap: Record<string, any> = {};
    pendingPayments.forEach(p => {
      const memberId = p.memberId;
      if (!delinquencyMap[memberId]) {
        delinquencyMap[memberId] = {
          id: memberId,
          name: p.memberName || 'Sócio Desconhecido',
          pendingMonths: [],
          totalDebt: 0,
          severity: 'nenhum'
        };
      }
      delinquencyMap[memberId].pendingMonths.push({
        month: p.month,
        year: p.year,
        amount: p.amount,
        id: p.id
      });
      delinquencyMap[memberId].totalDebt += p.amount;
    });

    const fullDelinquentList = Object.values(delinquencyMap).map(m => {
      const count = m.pendingMonths.length;
      m.pendingMonths.sort((a: any, b: any) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
      return {
        ...m,
        severity: count >= 4 ? 'grave' : count >= 2 ? 'médio' : count === 1 ? 'leve' : 'nenhum'
      };
    }).sort((a, b) => b.totalDebt - a.totalDebt); 

    const delinquentMembers = fullDelinquentList.length;

    const totalMembershipIncome = state.payments
      .filter(p => p.status === 'Pago' && validMemberIds.has(p.memberId))
      .reduce((acc, p) => acc + p.amount, 0);
    
    const totalOtherIncome = (state.otherIncome || [])
      .reduce((acc, i) => acc + i.amount, 0);

    const totalIncome = totalMembershipIncome + totalOtherIncome;
    
    const totalExpenses = (state.expenses || [])
      .reduce((acc, e) => acc + e.amount, 0);

    const initialBalance = state.initialBalance || 0;
    const totalBalance = initialBalance + totalIncome - totalExpenses;

    return { 
      revenue: revenue + currentMonthOtherIncome, 
      membershipRevenue: revenue,
      otherRevenue: currentMonthOtherIncome,
      pending, 
      expenses: currentMonthExpenses, 
      activeMembers, 
      delinquentMembers, 
      fullDelinquentList,
      totalBalance, 
      totalIncome, 
      totalExpenses, 
      initialBalance,
      totalMembershipIncome,
      totalOtherIncome
    };
  }, [state.members, state.payments, state.expenses, state.otherIncome, state.initialBalance]);

  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), i);
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: format(d, 'MMM', { locale: ptBR })
      };
    }).reverse();

    return last6Months.map(m => {
      const monthPayments = state.payments.filter(p => 
        p.month === m.month && p.year === m.year && state.members.some(mem => mem.id === p.memberId)
      );
      const monthOtherIncome = (state.otherIncome || []).filter(i => {
        const d = parseISO(i.date);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      }).reduce((acc, i) => acc + i.amount, 0);

      const monthExpenses = (state.expenses || []).filter(e => {
        const d = parseISO(e.date);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      }).reduce((acc, e) => acc + e.amount, 0);

      return {
        name: m.label,
        pago: monthPayments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) + monthOtherIncome,
        pendente: monthPayments.filter(p => p.status === 'Pendente').reduce((acc, p) => acc + p.amount, 0),
        despesas: monthExpenses
      };
    });
  }, [state.payments, state.expenses, state.otherIncome]);


  const loginImageUrl = LINK_CLUB_LOGO;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: username, password });
      if (error) throw error;
      showFeedback('success', 'Bem-vindo!');
    } catch (err: any) {
      setLoginError(err.message === 'Invalid login credentials' ? 'Dados inválidos.' : err.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signUp({ 
        email: username, 
        password,
        options: {
          data: {
            name: fullName
          }
        }
      });
      if (error) throw error;
      showFeedback('success', 'Cadastro realizado! Confirme seu e-mail.');
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('dashboard');
  };

  // Notice actions
  const addNotice = async (notice: Omit<Notice, 'id' | 'createdAt' | 'readBy'>) => {
    const newNotice: Notice = {
      ...notice,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      readBy: []
    };
    try {
      const { error } = await supabase.from('notices').insert([toSnakeCase(newNotice)]);
      if (error) throw error;
      setState(prev => ({
        ...prev,
        notices: [newNotice, ...(prev.notices || [])]
      }));
      showFeedback('success', 'Aviso publicado no mural!');
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao publicar aviso: ${err.message}`);
    }
  };

  const markNoticeAsRead = async (id: string) => {
    const userDisplayName = currentUser || 'Anônimo';
    const notice = state.notices.find(n => n.id === id);
    if (!notice || notice.readBy.includes(userDisplayName)) return;

    const newReadBy = [...notice.readBy, userDisplayName];
    try {
      const { error } = await supabase.from('notices').update({ read_by: newReadBy }).eq('id', id);
      if (error) throw error;
      setState(prev => ({
        ...prev,
        notices: (prev.notices || []).map(n => 
          n.id === id ? { ...n, readBy: newReadBy } : n
        )
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({
        ...prev,
        notices: (prev.notices || []).filter(n => n.id !== id)
      }));
      showFeedback('success', 'Aviso removido!');
    } catch (err: any) {
      console.error(err);
      showFeedback('error', `Erro ao excluir aviso: ${err.message}`);
    }
  };

  const hasUnreadNotices = (state.notices || []).some(n => !n.readBy.includes(currentUser || ''));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
          <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="w-40 h-40 mx-auto mb-6 relative flex items-center justify-center"
            >
              <img src={loginImageUrl} alt="Associação Gavião FC" className="w-full h-full object-contain" />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-1">ASSOCIAÇÃO GAVIÃO FC</h1>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest opacity-80">
              {isSigningUp ? 'Criar Nova Conta' : 'Sistema de Gestão Administrativa'}
            </p>
          </div>

          <Card className="p-8 border-slate-700/50 bg-[#1e293b]/90 backdrop-blur-2xl shadow-2xl">
            <form onSubmit={isSigningUp ? handleSignUp : handleLogin} className="space-y-6">
              <div className="space-y-4">
                {isSigningUp && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <UserIcon size={14} />
                      Nome Completo
                    </label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <UserIcon size={14} />
                    E-mail
                  </label>
                  <input 
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={14} />
                    Senha
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha..."
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {loginError}
                </div>
              )}

              <Button type="submit" className="w-full py-4 text-lg font-bold uppercase tracking-wider">
                {isSigningUp ? 'Registrar' : 'Entrar no Sistema'}
              </Button>

              <button 
                type="button"
                onClick={() => { setIsSigningUp(!isSigningUp); setLoginError(null); }}
                className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-bold"
              >
                {isSigningUp ? 'Já tenho conta? Entrar' : 'Não tem conta? Criar agora'}
              </button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex">
      {/* SVG Filter to remove white background */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter id="remove-white" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            -1.5 -1.5 -1.5 1 3.5
          " />
        </filter>
      </svg>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] border-r border-slate-700/50 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 overflow-y-auto",
        !isSidebarOpen && "-translate-x-full lg:translate-x-0"
      )}>
        <div className="min-h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white leading-tight">Gavião FC</h1>
              <p className="text-xs text-slate-400">Sistema de Gestão</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={<Users size={20} />} 
              label="Sócios" 
              active={activeTab === 'members'} 
              onClick={() => setActiveTab('members')} 
            />
            <SidebarItem 
              icon={<DollarSign size={20} />} 
              label="Financeiro" 
              active={activeTab === 'financial'} 
              onClick={() => setActiveTab('financial')} 
            />
            <SidebarItem 
              icon={<Trophy size={20} />} 
              label="Hall da Fama" 
              active={activeTab === 'hallfame'} 
              onClick={() => setActiveTab('hallfame')} 
            />
            <SidebarItem 
              icon={<Activity size={20} />} 
              label="Arena Gavião" 
              active={activeTab === 'arena' || activeTab === 'ranking'} 
              onClick={() => setActiveTab('arena')} 
            />
            <SidebarItem 
              icon={<FileText size={20} />} 
              label="Relatórios" 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')} 
            />
            <SidebarItem 
              icon={<MessageSquare size={20} />} 
              label="Ouvidoria" 
              active={activeTab === 'ouvidoria'} 
              onClick={() => setActiveTab('ouvidoria')} 
            />
            <SidebarItem 
              icon={<Package size={20} />} 
              label="Almoxarifado" 
              active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')} 
            />
            <SidebarItem 
              icon={
                <div className="relative">
                  <Megaphone size={20} />
                  {hasUnreadNotices && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                  )}
                </div>
              } 
              label="Mural de Avisos" 
              active={activeTab === 'mural'} 
              onClick={() => setActiveTab('mural')} 
            />
            <SidebarItem 
              icon={<ImageIcon size={20} />} 
              label="Galeria de Fotos" 
              active={activeTab === 'gallery'} 
              onClick={() => setActiveTab('gallery')} 
            />
            <SidebarItem 
              icon={<Settings size={20} />} 
              label="Configurações" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
          </nav>

          <div className="p-4 border-t border-slate-700/50 space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg",
                isAdmin ? "bg-emerald-600 shadow-emerald-600/20" : "bg-slate-600 shadow-slate-600/20"
              )}>
                {currentUser?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentUser || 'Usuário'}</p>
                <p className={cn(
                  "text-[10px] truncate uppercase tracking-wider font-bold",
                  isAdmin ? "text-emerald-400" : (isSocio ? "text-blue-400" : "text-slate-400")
                )}>
                  {isAdmin ? 'Administrador' : (isSocio ? 'Sócio' : 'Visitante')}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut size={18} />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-[0.1] pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop" 
            alt="Stadium Background" 
            className="w-full h-full object-cover grayscale"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Header */}
        <header className="h-16 bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg text-slate-400 active:scale-95 transition-transform"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-semibold text-white leading-tight truncate max-w-[150px] sm:max-w-none">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'members' && 'Gestão de Sócios'}
                {activeTab === 'arena' && 'Arena Gavião'}
                {activeTab === 'ranking' && 'Arena Gavião'}
                {activeTab === 'financial' && 'Controle Financeiro'}
                {activeTab === 'reports' && 'Relatórios e Exportação'}
                {activeTab === 'ouvidoria' && 'Ouvidoria Semi-Anônima'}
                {activeTab === 'inventory' && 'Almoxarifado'}
                {activeTab === 'gallery' && 'Galeria de Fotos'}
                {activeTab === 'mural' && 'Mural de Avisos'}
                {activeTab === 'settings' && 'Configurações'}
              </h2>
              {isSocio && (
                <span className="text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase tracking-widest">Bem-vindo, {currentUser} - Perfil: Sócio</span>
              )}
              {isVisitor && (
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 uppercase tracking-widest">Modo Visualização</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-white leading-none">Olá, {currentUser}</span>
              <span className={cn(
                "text-[10px] uppercase tracking-widest font-bold",
                isAdmin ? "text-emerald-400" : (isSocio ? "text-blue-400" : "text-slate-400")
              )}>
                {isAdmin ? 'Acesso Total' : (isSocio ? 'Perfil: Sócio' : 'Somente Leitura')}
              </span>
            </div>
            <div className="hidden xs:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isAdmin ? "bg-emerald-500" : (isSocio ? "bg-blue-500" : "bg-slate-500")
              )} />
              <span className="text-[10px] sm:text-xs font-medium text-slate-300">
                {isAdmin ? 'Admin' : (isSocio ? 'Sócio' : 'Visitante')}
              </span>
            </div>
            
            <img 
              src="https://lh3.googleusercontent.com/d/1A6hPCCMQ78jBYjr1RfT3Gjo5fNEhvJmi=w100" 
              alt="Mascote" 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-blue-500/50 object-cover"
              style={{ 
                filter: 'url(#remove-white)',
                clipPath: 'circle(45%)'
              }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/mascot/100/100";
              }}
            />
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isAdmin && (
            <div className="mb-6 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-slate-500" />
                <div>
                  <p className="text-sm font-bold text-slate-300">Modo de Consulta (Somente Leitura)</p>
                  <p className="text-[11px] text-slate-500">Você possui acesso de visualização aos dados e relatórios da associação.</p>
                </div>
              </div>
              <Badge variant="neutral" className="bg-slate-700 text-slate-300 border-none">Acesso Limitado</Badge>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  stats={stats} 
                  chartData={chartData} 
                  payments={state.payments} 
                  members={state.members} 
                  onToggleStatus={togglePaymentStatus}
                  onRegisterRetroactive={registerRetroactivePayment}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === 'hallfame' && (
                <HallOfFameView 
                  members={state.members} 
                  trainings={state.trainings || []}
                  getPlayerStats={getPlayerStats}
                  isAdmin={isAdmin}
                />
              )}
              {activeTab === 'members' && (
                <MembersView 
                  members={state.members} 
                  trainings={state.trainings || []}
                  onAdd={addMember} 
                  onUpdate={updateMember} 
                  onDelete={deleteMember} 
                  isAdmin={isAdmin}
                  associationInfo={state.associationInfo || DEFAULT_ASSOCIATION_INFO}
                  getPlayerStats={getPlayerStats}
                />
              )}
              {activeTab === 'financial' && (
                <FinancialView 
                  payments={state.payments} 
                  members={state.members} 
                  expenses={state.expenses}
                  otherIncome={state.otherIncome || []}
                  initialBalance={state.initialBalance || 0}
                  stats={stats}
                  onToggleStatus={togglePaymentStatus} 
                  onUpdatePayment={updatePayment}
                  onAddExpense={addExpense}
                  onUpdateExpense={updateExpense}
                  onDeleteExpense={deleteExpense}
                  onAddOtherIncome={addOtherIncome}
                  onDeleteOtherIncome={deleteOtherIncome}
                  onUpdateInitialBalance={updateInitialBalance}
                  onRegisterRetroactive={registerRetroactivePayment}
                  onGenerateMassDebts={generateMassDebts}
                  isAdmin={isAdmin}
                  associationInfo={state.associationInfo || DEFAULT_ASSOCIATION_INFO}
                />
              )}
              {activeTab === 'arena' && (
                <ArenaModule 
                  members={state.members}
                  trainings={state.trainings || []}
                  finesConfig={state.finesConfig || { yellowCardValue: 5, redCardValue: 10 }}
                  onAddTraining={addTraining}
                  onUpdateTraining={updateTraining}
                  onDeleteTraining={deleteTraining}
                  onUpdateFinesConfig={updateFinesConfig}
                  isAdmin={isAdmin}
                  getPlayerStats={getPlayerStats}
                  isOnline={isOnline}
                  initialTab="treinos"
                />
              )}
              {activeTab === 'ranking' && (
                <ArenaModule 
                  members={state.members}
                  trainings={state.trainings || []}
                  finesConfig={state.finesConfig || { yellowCardValue: 5, redCardValue: 10 }}
                  onAddTraining={addTraining}
                  onUpdateTraining={updateTraining}
                  onDeleteTraining={deleteTraining}
                  onUpdateFinesConfig={updateFinesConfig}
                  isAdmin={isAdmin}
                  getPlayerStats={getPlayerStats}
                  isOnline={isOnline}
                  initialTab="hall-fama"
                />
              )}
              {activeTab === 'reports' && (
                <ReportsView state={state} stats={stats} currentUser={currentUser} isAdmin={isAdmin} />
              )}
              {activeTab === 'settings' && (
                <SettingsView 
                  state={state} 
                  setState={setState} 
                  isAdmin={isAdmin} 
                  currentUser={currentUser} 
                  loggedUser={loggedUser}
                  setLoggedUser={setLoggedUser}
                />
              )}
              {activeTab === 'ouvidoria' && (
                <OuvidoriaView 
                  messages={ouvidoriaMessages}
                  isAdmin={isAdmin || currentUser === "Gil Santos - Tesoureiro"}
                  onSave={saveOuvidoriaMessage}
                  onResolve={resolveOuvidoriaMessage}
                  onDelete={deleteOuvidoriaMessage}
                  onClearAll={clearAllOuvidoriaMessages}
                />
              )}
              {activeTab === 'gallery' && (
                <GalleryView isAdmin={isAdmin} onClearAll={clearAllGalleryPhotos} />
              )}
              {activeTab === 'mural' && (
                <MuralView
                  notices={state.notices || []}
                  members={state.members}
                  onAddNotice={addNotice}
                  onMarkAsRead={markNoticeAsRead}
                  onDeleteNotice={deleteNotice}
                  isAdmin={isAdmin}
                  currentUser={currentUser || 'Visitante'}
                />
              )}
              {activeTab === 'inventory' && (
                <InventoryView 
                  inventory={state.inventory || []}
                  onAddItem={addInventoryItem}
                  onUpdateItem={updateInventoryItem}
                  onDeleteItem={deleteInventoryItem}
                  onRegisterOutflow={registerInventoryOutflow}
                  isAdmin={isAdmin}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 font-bold",
              feedback.type === 'success' 
                ? "bg-emerald-500 text-white border-emerald-400" 
                : "bg-red-500 text-white border-red-400"
            )}
          >
            {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- View Components ---

function ImageLightbox({ 
  src, 
  title, 
  category,
  isOpen, 
  onClose,
  downloadUrl
}: { 
  src: string | null; 
  title?: string;
  category?: string;
  isOpen: boolean; 
  onClose: () => void;
  downloadUrl?: string;
}) {
  if (!isOpen || !src) return null;

  const handleDownload = () => {
    if (!src) return;
    const url = downloadUrl || src;
    const link = document.createElement("a");
    link.href = url;
    link.download = `gaviao_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-5xl w-full relative flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute -top-14 right-0 flex gap-4 z-50">
              {downloadUrl && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors shadow-xl"
                  title="Baixar Foto"
                >
                  <Download size={24} />
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm shadow-xl"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative w-full flex flex-col items-center">
              <img 
                src={src} 
                alt={title || ''} 
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(245,158,11,0.15)] border border-white/5"
              />
              
              {(title || category) && (
                <div className="mt-6 text-center bg-slate-900/80 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-xl shadow-2xl max-w-2xl w-full">
                  {title && <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">{title}</h4>}
                  {category && <p className="text-xs sm:text-sm text-amber-500 font-bold uppercase tracking-[0.2em] opacity-80">{category}</p>}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GalleryView({ isAdmin, onClearAll }: { isAdmin: boolean, onClearAll: () => void }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, {status: string, progress: number}>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      const { data } = await supabase.from('gallery_photos').select('*');
      if (data) setPhotos(data.map(toCamelCase));
      const timer = setTimeout(() => setIsLoading(false), 1200);
      return () => clearTimeout(timer);
    }
    loadGallery();
  }, []);

  const totalSize = useMemo(() => photos.reduce((acc, photo) => acc + (photo.size || photo.url.length), 0), [photos]);
  const storageLimit = 4.5 * 1024 * 1024; // 4.5MB (margem de segurança do LocalStorage)
  const usagePercentage = (totalSize / storageLimit) * 100;
  const isNearLimit = usagePercentage > 85;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList: File[] = Array.from(files);
    
    for (const file of fileList) {
      const fileId = Math.random().toString(36).substring(7);
      
      try {
        // Status: 1. Lendo arquivo
        setUploadProgress(prev => ({ ...prev, [fileId]: { status: 'Lendo...', progress: 20 } }));
        
        const photoData = await new Promise<{url: string, size: number}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              // Status: 2. Redimensionando e Comprimindo
              setUploadProgress(prev => ({ ...prev, [fileId]: { status: 'Otimizando...', progress: 60 } }));
              
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const maxDim = 800;

              if (width > height) {
                if (width > maxDim) {
                  height *= maxDim / width;
                  width = maxDim;
                }
              } else {
                if (height > maxDim) {
                  width *= maxDim / height;
                  height = maxDim;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);

              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              // Status: 3. Finalizando
              setUploadProgress(prev => ({ ...prev, [fileId]: { status: 'Processando...', progress: 90 } }));
              resolve({ url: dataUrl, size: dataUrl.length });
            };
            img.src = (event.target?.result as string) || '';
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Adicionar à galeria
        const newPhoto: GalleryPhoto = {
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          url: photoData.url,
          date: new Date().toISOString(),
          size: photoData.size
        };

        const { error } = await supabase.from('gallery_photos').insert([toSnakeCase(newPhoto)]);
        if (error) throw error;

        setPhotos(prev => [newPhoto, ...prev]);
        setUploadProgress(prev => ({ ...prev, [fileId]: { status: 'Concluído!', progress: 100 } }));
        
        // Limpar feedback após delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[fileId];
            return next;
          });
        }, 3000);

      } catch (err: any) {
        console.error("Erro no upload:", err);
        setUploadProgress(prev => ({ ...prev, [fileId]: { status: `Erro: ${err.message || 'Falha'}`, progress: 0 } }));
      }
    }
  };

  const deletePhoto = async (id: string) => {
    if (!window.confirm("Deseja excluir esta foto permanentemente?")) return;
    try {
      const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
      if (error) throw error;
      setPhotos(prev => prev.filter(p => p.id !== id));
      if (selectedPhoto?.id === id) setSelectedPhoto(null);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao excluir foto: " + err.message);
    }
  };

  const downloadPhoto = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `gaviao-fc-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <ImageIcon className="text-blue-500" size={24} />
            Mural de Recordações
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Fotos registradas: <span className="text-white">{photos.length}</span>
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Clear All Button */}
            {photos.length > 0 && (
              <Button 
                onClick={onClearAll}
                variant="danger"
                className="border-red-500/20 text-red-500 hover:bg-red-500/10 text-[10px] uppercase tracking-widest font-black h-10 mb-2"
              >
                Limpar Galeria
              </Button>
            )}
            {/* Storage Warning */}
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest">
                <span className={cn(isNearLimit ? "text-amber-500" : "text-slate-500")}>
                  {isNearLimit ? '⚠️ Memória de fotos quase cheia' : 'Espaço em Galeria'}
                </span>
                <span className="text-slate-400">{Math.round(usagePercentage)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                  className={cn(
                    "h-full transition-all duration-1000",
                    usagePercentage > 90 ? "bg-red-500" : (usagePercentage > 70 ? "bg-amber-500" : "bg-blue-500")
                  )}
                />
              </div>
            </div>

            <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 text-xs">
              <Upload size={16} />
              Enviar Novas Fotos
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        )}
      </div>

      {/* Upload Progress Feed */}
      <AnimatePresence>
        {Object.entries(uploadProgress).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {Object.entries(uploadProgress).map(([id, info]: [string, {status: string, progress: number}]) => (
              <div key={id} className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  {info.progress === 100 ? (
                    <CheckCircle className="text-emerald-500" size={24} />
                  ) : (
                    <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline de Upload</span>
                    <span className="text-[10px] font-black text-blue-500">{info.progress}%</span>
                  </div>
                  <p className="text-white text-xs font-black uppercase tracking-tighter truncate">{info.status}</p>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${info.progress}%` }} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de Fotos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
        {isLoading ? (
          // Skeleton Screens
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-800/50 rounded-xl border border-slate-700/30 animate-pulse relative overflow-hidden" />
          ))
        ) : photos.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-800/10 rounded-3xl border border-dashed border-slate-700/50">
             <ImageOff size={64} className="text-slate-700 mb-6 opacity-30" />
             <p className="text-slate-500 font-black uppercase tracking-widest text-sm">A galeria está vazia.</p>
             {isAdmin && <p className="text-slate-600 text-xs mt-2 uppercase font-bold">Clique em "Enviar Fotos" para começar.</p>}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                className="group relative aspect-square bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/30 shadow-lg cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.url} 
                  alt="Recordação Gavião FC" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                   <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-white">
                      <Maximize2 size={20} />
                   </div>
                   {isAdmin && (
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         deletePhoto(photo.id);
                       }}
                       className="bg-red-600 hover:bg-red-500 p-2 rounded-xl text-white shadow-lg shadow-red-900/40"
                     >
                       <Trash2 size={20} />
                     </button>
                   )}
                </div>

                {/* Date Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-tighter">
                  {new Date(photo.date).toLocaleDateString('pt-BR')}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12"
          >
            {/* Blurred Backdrop */}
            <div 
              className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-2xl" 
              onClick={() => setSelectedPhoto(null)} 
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-5xl h-full flex flex-col gap-6"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <p className="text-white font-black text-sm uppercase tracking-tight">Recordação do Gavião FC</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{new Date(selectedPhoto.date).toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => downloadPhoto(selectedPhoto.url)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button 
                    onClick={() => setSelectedPhoto(null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Image View */}
              <div className="flex-1 flex items-center justify-center overflow-hidden rounded-3xl bg-black/40 border border-slate-800 shadow-2xl relative">
                 <img 
                   src={selectedPhoto.url} 
                   alt="Zoom" 
                   className="max-w-full max-h-full object-contain"
                   referrerPolicy="no-referrer"
                 />
                 
                 {/* Admin Controls in Modal */}
                 {isAdmin && (
                   <button 
                    onClick={() => deletePhoto(selectedPhoto.id)}
                    className="absolute bottom-6 right-6 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-2xl shadow-red-900/50"
                   >
                     <Trash2 size={18} />
                     Excluir Foto
                   </button>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MuralView({
  notices,
  members,
  onAddNotice,
  onMarkAsRead,
  onDeleteNotice,
  isAdmin,
  currentUser
}: {
  notices: Notice[];
  members: Member[];
  onAddNotice: (notice: Omit<Notice, 'id' | 'createdAt' | 'readBy'>) => void;
  onMarkAsRead: (noticeId: string) => void;
  onDeleteNotice: (noticeId: string) => void;
  isAdmin: boolean;
  currentUser: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const categories: { value: NoticeCategory; label: string; icon: any; color: string }[] = [
    { value: 'Treino', label: 'Treino', icon: Activity, color: 'text-blue-400' },
    { value: 'Financeiro', label: 'Financeiro', icon: FileText, color: 'text-emerald-400' },
    { value: 'Evento', label: 'Evento', icon: CalendarDays, color: 'text-amber-400' },
    { value: 'Urgente', label: 'Urgente', icon: AlertTriangle, color: 'text-red-400' },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onAddNotice({
      title: formData.get('title') as string,
      category: formData.get('category') as NoticeCategory,
      message: formData.get('message') as string,
      expiresAt: formData.get('expiresAt') as string || undefined,
      isPinned: formData.get('isPinned') === 'on',
      createdBy: currentUser,
    });

    setIsModalOpen(false);
  };

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Megaphone className="text-blue-500" />
            MURAL DE AVISOS
          </h2>
          <p className="text-slate-400 text-sm font-medium">Comunicados oficiais da diretoria do Gavião FC</p>
        </div>

        {isAdmin && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white gap-2 h-11 px-6 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            <Bell size={18} />
            Novo Aviso
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNotices.length > 0 ? (
          sortedNotices.map((notice) => {
            const isRead = notice.readBy.includes(currentUser);
            const categoryInfo = categories.find(c => c.value === notice.category);
            const Icon = categoryInfo?.icon || Megaphone;

            return (
              <motion.div
                key={notice.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group relative bg-slate-900/50 rounded-3xl border transition-all duration-300",
                  notice.category === 'Urgente' 
                    ? "border-red-500/50 shadow-lg shadow-red-900/10 animate-pulse-subtle" 
                    : "border-slate-800 hover:border-slate-700",
                  notice.isPinned && "ring-1 ring-amber-500/30"
                )}
              >
                {/* Status Bar */}
                <div className={cn(
                  "h-1.5 w-full rounded-t-3xl",
                  notice.category === 'Urgente' ? "bg-red-500" : 
                  notice.category === 'Financeiro' ? "bg-emerald-500" :
                  notice.category === 'Treino' ? "bg-blue-500" : "bg-amber-500"
                )} />

                {notice.isPinned && (
                  <div className="absolute -top-2 -right-2 p-1.5 bg-amber-500 rounded-full shadow-lg z-10">
                    <Pin size={12} className="text-white fill-white" />
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl bg-slate-800 border border-slate-700",
                      categoryInfo?.color
                    )}>
                      <Icon size={24} />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {format(new Date(notice.createdAt), "dd 'de' MMM", { locale: ptBR })}
                      </span>
                      <div className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block",
                        notice.category === 'Urgente' ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-slate-400"
                      )}>
                        {notice.category}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="mt-2 text-slate-400 text-sm leading-relaxed line-clamp-4">
                      {notice.message}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between gap-4">
                    {isAdmin ? (
                      <button 
                        onClick={() => setSelectedNotice(notice)}
                        className="text-[10px] font-black uppercase tracking-tighter text-slate-500 hover:text-white transition-colors"
                      >
                        Visualizado por {notice.readBy.length} sócios
                      </button>
                    ) : (
                      <div />
                    )}

                    {!isRead ? (
                      <button 
                        onClick={() => onMarkAsRead(notice.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl border border-blue-600/20 transition-all text-xs font-bold"
                      >
                        <CheckCircle2 size={14} />
                        Li o comunicado
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                        <CheckCircle2 size={14} className="fill-emerald-500/20" />
                        Lido
                      </div>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => onDeleteNotice(notice.id)}
                    className="absolute bottom-4 left-6 text-red-500/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center px-6">
            <div className="p-6 rounded-full bg-slate-800 mb-4">
              <Megaphone size={48} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-300">Nenhum aviso no momento</h3>
            <p className="text-slate-500 text-sm max-w-xs mt-2">
              A diretoria ainda não publicou comunicados oficiais. Fique atento às notificações!
            </p>
          </div>
        )}
      </div>

      {/* New Notice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Novo Comunicado</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Diretoria Gavião FC</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</label>
                    <select 
                      name="category"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                    >
                      {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expira em (Opcional)</label>
                    <input 
                      name="expiresAt"
                      type="date"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título do Aviso</label>
                  <input 
                    name="title"
                    type="text"
                    required
                    placeholder="Ex: Novo Horário de Treino"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mensagem</label>
                  <textarea 
                    name="message"
                    required
                    rows={4}
                    placeholder="Escreva aqui o comunicado oficial..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input 
                    name="isPinned"
                    type="checkbox"
                    id="isPinned"
                    className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50 cursor-pointer"
                  />
                  <label htmlFor="isPinned" className="text-sm font-bold text-slate-300 cursor-pointer select-none">
                    Fixar no topo do mural
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold h-12 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest h-12 rounded-xl"
                  >
                    Publicar Aviso
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Reads Modal (Admin) */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              onClick={() => setSelectedNotice(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-black text-white uppercase flex items-center justify-between">
                  QUEM LEU ESTE AVISO
                  <button onClick={() => setSelectedNotice(null)} className="text-slate-400 hover:text-white">
                    <X size={20} />
                  </button>
                </h3>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">
                  {selectedNotice.readBy.length} de {members.filter(m => m.status === 'Ativo').length} sócios ativos
                </p>
              </div>

              <div className="p-4 max-h-[400px] overflow-y-auto">
                {selectedNotice.readBy.length > 0 ? (
                  <div className="space-y-2">
                    {selectedNotice.readBy.map((reader, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                          {reader.substring(0, 2)}
                        </div>
                        <span className="text-sm font-bold text-white">{reader}</span>
                        <Check size={14} className="text-emerald-500 ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-500">
                    <p className="text-sm font-bold">Nenhum sócio marcou como lido ainda.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OuvidoriaView({ 
  messages, 
  isAdmin, 
  onSave,
  onResolve,
  onDelete,
  onClearAll
}: { 
  messages: OuvidoriaMessage[]; 
  isAdmin: boolean;
  onSave: (assunto: string, mensagem: string) => void;
  onResolve: (id: number) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}) {
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assunto.trim() || !mensagem.trim()) {
      alert("Preencha todos os campos.");
      return;
    }
    onSave(assunto, mensagem);
    setAssunto('');
    setMensagem('');
  };

  return (
    <div id="aba-ouvidoria" className="max-w-4xl mx-auto space-y-8">
      {/* Form Section */}
      <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
         {/* Decorative Background */}
         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
         
        <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2 relative z-10">
          <MessageSquare className="text-blue-500" />
          Nova Manifestação
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assunto da Mensagem</label>
              <input 
                type="text" 
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Ex: Sugestão para o campo ou reclamação"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua Mensagem Detalhada</label>
              <textarea 
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva aqui sua sugestão ou reclamação de forma clara..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all h-40 resize-none placeholder:text-slate-600"
              />
            </div>
          </div>
          
          <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-700/50 pt-6">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <ShieldAlert className="text-amber-500" size={18} />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                <span className="font-bold text-amber-500 uppercase tracking-wider">Atenção Sócio:</span> Sua identidade será preservada no mural público. Apenas a diretoria financeira (Administrador) poderá identificar o autor para retorno.
              </p>
            </div>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest px-10 py-4 rounded-xl transition-all shadow-xl shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Enviar Mensagem
            </button>
          </div>
        </form>
      </section>

      {/* Admin Section (If Admin) */}
      {isAdmin && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" />
              Painel do Ouvidor <small className="text-[10px] text-slate-500 ml-2 font-normal">(Visibilidade Exclusiva)</small>
            </h3>
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button 
                  onClick={onClearAll}
                  className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Limpar Todas
                </button>
              )}
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                Acesso Total
              </span>
            </div>
          </div>
          
          <div className="grid gap-4">
            {messages.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/10 rounded-2xl border border-dashed border-slate-700">
                <MessageSquare size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                <p className="text-slate-500 font-bold">Nenhuma mensagem recebida na ouvidoria.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={cn(
                  "p-6 rounded-2xl border-l-[6px] transition-all flex flex-col md:flex-row justify-between gap-6",
                  msg.resolvido ? "bg-slate-800/30 border-emerald-900/50 grayscale-[0.5]" : "bg-slate-800 border-amber-500 shadow-2xl shadow-black/40"
                )}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <span className="font-black text-lg text-white uppercase tracking-tight truncate max-w-md">{msg.assunto}</span>
                       {msg.resolvido ? (
                         <span className="text-[9px] bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded font-black uppercase tracking-tighter">Resolvido ✔</span>
                       ) : (
                         <span className="text-[9px] bg-amber-500 text-amber-950 px-2 py-0.5 rounded font-black uppercase tracking-tighter">Pendente ⚠</span>
                       )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <UserIcon size={12} />
                        Autor: <span className="text-white bg-blue-600/20 px-1.5 py-0.5 rounded">{msg.autor}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        {new Date(msg.data).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.mensagem}</p>
                    </div>
                  </div>
                  
                    <div className="flex md:flex-col items-center justify-center gap-3 md:w-48">
                    <button 
                      type="button"
                      onClick={() => onResolve(msg.id)}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg relative z-[999]",
                        msg.resolvido 
                          ? "bg-slate-700 text-slate-400 hover:bg-slate-600" 
                          : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20"
                      )}
                    >
                      {msg.resolvido ? "Reabrir Caso" : "Confirmar Resolução"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => onDelete(msg.id)}
                      className="w-full md:w-auto p-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all border border-red-500/20 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest relative z-[999]"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Public List Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
          <MessageSquare className="text-slate-400 opacity-50" />
          Mural Público de Transparência
        </h3>
        <div className="grid gap-6">
          {messages.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
              <p className="text-slate-600 italic">O mural da ouvidoria está aguardando as primeiras manifestações.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm hover:border-slate-700 transition-colors relative overflow-hidden group">
                {msg.resolvido && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-emerald-600 text-white text-[8px] font-black uppercase tracking-tighter py-1 px-4 rotate-45 translate-x-3 -translate-y-1 shadow-lg">
                      Resolvido
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg leading-tight mb-1">{msg.assunto}</h4>
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                       <span className="flex items-center gap-1"><UserX size={12} className="text-slate-600" /> Enviado Anônimo</span>
                       <span className="w-1 h-1 bg-slate-700 rounded-full" />
                       <span>{new Date(msg.data).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 rounded-full" />
                  <p className="text-slate-400 text-sm pl-5 leading-relaxed whitespace-pre-wrap">{msg.mensagem}</p>
                </div>
                
                {msg.resolvido && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                    <CheckCircle size={14} /> Esta manifestação foi analisada e concluída pela diretoria.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      )}
    >
      <span className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
        />
      )}
    </button>
  );
}

function DashboardView({ stats, chartData, payments, members, onToggleStatus, onRegisterRetroactive, isAdmin }: { stats: any; chartData: any[]; payments: Payment[]; members: Member[]; onToggleStatus: any; onRegisterRetroactive: any; isAdmin: boolean }) {
  const [delinquencyFilter, setDelinquencyFilter] = useState<'all' | 'leve' | 'médio' | 'grave'>('all');
  
  const filteredDelinquentList = stats.fullDelinquentList.filter((m: any) => 
    delinquencyFilter === 'all' || m.severity === delinquencyFilter
  );

  const netBalance = stats.revenue - stats.expenses;

  return (
    <div className="space-y-6 relative">
      {/* Mascot Background Watermark */}
      <div className="fixed bottom-0 right-0 opacity-[0.08] pointer-events-none z-0 hidden lg:block">
        <img 
          src="https://lh3.googleusercontent.com/d/1A6hPCCMQ78jBYjr1RfT3Gjo5fNEhvJmi=w1000" 
          alt="Mascot Watermark" 
          className="w-[600px] h-auto grayscale"
          style={{ 
            filter: 'url(#remove-white)',
            clipPath: 'inset(5%)'
          }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback if the specific URL doesn't work
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?q=80&w=1000&auto=format&fit=crop";
          }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
        <StatCard 
          title="Receita (Mês)" 
          value={formatCurrency(stats.revenue)} 
          icon={<DollarSign className="text-emerald-500" />}
          trend={`Mensalidades: ${formatCurrency(stats.membershipRevenue)} | Outras: ${formatCurrency(stats.otherRevenue)}`}
          color="emerald"
        />
        <StatCard 
          title="Despesas (Mês)" 
          value={formatCurrency(stats.expenses)} 
          icon={<DollarSign className="text-red-500" />}
          trend="Saídas registradas"
          color="red"
        />
        <StatCard 
          title="Saldo Líquido" 
          value={formatCurrency(netBalance)} 
          icon={<TrendingUp className={netBalance >= 0 ? "text-emerald-500" : "text-red-500"} />}
          trend={netBalance >= 0 ? "Resultado positivo" : "Resultado negativo"}
          color={netBalance >= 0 ? "emerald" : "red"}
        />
        <StatCard 
          title="Saldo em Caixa" 
          value={formatCurrency(stats.totalBalance)} 
          icon={<DollarSign className={stats.totalBalance >= 0 ? "text-blue-500" : "text-red-500"} />}
          trend="Saldo total acumulado"
          color={stats.totalBalance >= 0 ? "blue" : "red"}
        />
        <StatCard 
          title="Inadimplentes" 
          value={stats.delinquentMembers} 
          icon={<AlertTriangle className="text-red-500" />}
          trend="Membros com pendências"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composition Card */}
        <Card className="p-6">
          <h3 className="font-bold text-white mb-4">Composição da Receita (Mês)</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-400">Mensalidades</span>
              </div>
              <span className="text-white font-bold">{formatCurrency(stats.membershipRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Outras Receitas</span>
              </div>
              <span className="text-white font-bold">{formatCurrency(stats.otherRevenue)}</span>
            </div>
            <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
              <span className="text-slate-400 font-bold">Total</span>
              <span className="text-emerald-500 font-black text-lg">{formatCurrency(stats.revenue)}</span>
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white">Desempenho Financeiro</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-400">Receita</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-400">Despesas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="text-slate-400">Pendente</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="pago" name="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="pendente" name="Pendente" fill="#334155" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Delinquency List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Inadimplentes
            </h3>
            <select 
              value={delinquencyFilter}
              onChange={(e) => setDelinquencyFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="leve">Leve (1)</option>
              <option value="médio">Médio (2-3)</option>
              <option value="grave">Grave (4+)</option>
            </select>
          </div>
          <div id="listaInadimplentes" className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredDelinquentList.length > 0 ? (
              filteredDelinquentList.map((member: any) => (
                <div key={member.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{member.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {member.pendingMonths.length} {member.pendingMonths.length === 1 ? 'mês em atraso' : 'meses em atraso'}
                      </p>
                    </div>
                    <Badge variant={member.severity === 'grave' ? 'danger' : member.severity === 'médio' ? 'warning' : 'neutral'}>
                      {member.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {member.pendingMonths.map((m: any, idx: number) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded border border-slate-600/30">
                        {format(new Date(m.year, m.month, 1), 'MMM/yy', { locale: ptBR })}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <p className="text-xs font-bold text-red-400">Total: {formatCurrency(member.totalDebt)}</p>
                    {isAdmin && (
                      <Button 
                        variant="success" 
                        className="h-7 px-2 text-[10px]"
                        onClick={() => {
                          member.pendingMonths.forEach((m: any) => {
                            if (m.id) {
                              onToggleStatus(m.id, m.amount, 'PIX');
                            } else {
                              onRegisterRetroactive(member.id, m.month, m.year, m.amount, 'PIX', new Date().toISOString(), 'Quitação via Dashboard');
                            }
                          });
                        }}
                      >
                        Quitar Tudo
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2 opacity-20" />
                <p className="text-sm text-slate-500">Nenhum inadimplente</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string; value: string | number; icon: React.ReactNode; trend: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10",
    amber: "bg-amber-500/10",
    blue: "bg-blue-500/10",
    red: "bg-red-500/10"
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg", colors[color])}>
          {icon}
        </div>
        <span className="text-xs text-slate-400 font-medium">{trend}</span>
      </div>
      <h4 className="text-slate-400 text-sm font-medium mb-1">{title}</h4>
      <p className="text-2xl font-bold text-white">{value}</p>
    </Card>
  );
}

function PlayerBadges({ memberId, trainings }: { memberId: string | null, trainings: Training[] }) {
  const badges = useMemo(() => {
    if (!memberId) return [];
    
    // Sort trainings by date descending to find history
    const allBadges: any[] = [];
    const trainingDates = trainings.map(t => parseISO(t.date));
    if (trainingDates.length === 0) return [];

    const minDate = new Date(Math.min(...trainingDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...trainingDates.map(d => d.getTime())));
    
    const intervalMonths = eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate)
    });

    intervalMonths.forEach(m => {
      const monthIndex = m.getMonth();
      const yearIndex = m.getFullYear();
      
      const monthlyTrainings = trainings.filter(t => {
        const d = parseISO(t.date);
        return d.getMonth() === monthIndex && d.getFullYear() === yearIndex;
      });

      if (monthlyTrainings.length === 0) return;

      const playerStats: Record<string, { goals: number, games: number, conceded: number, isGK: boolean, gkGames: number }> = {};
      monthlyTrainings.forEach(t => {
        t.players.forEach(p => {
          if (!playerStats[p.memberId]) playerStats[p.memberId] = { goals: 0, games: 0, conceded: 0, isGK: false, gkGames: 0 };
          playerStats[p.memberId].goals += p.goals;
          playerStats[p.memberId].games += 1;
          if (p.isGoalkeeper) {
            playerStats[p.memberId].isGK = true;
            playerStats[p.memberId].gkGames += 1;
            const trainingScore = t.score as { azul: number, amarelo: number };
            if (p.team === 'azul') playerStats[p.memberId].conceded += trainingScore.amarelo;
            else if (p.team === 'amarelo') playerStats[p.memberId].conceded += trainingScore.azul;
          }
        });
      });

      // Top 3 Artilharia
      const topScorers = Object.entries(playerStats)
        .filter(([_, stats]) => stats.goals > 0)
        .sort((a, b) => b[1].goals - a[1].goals || b[1].games - a[1].games)
        .slice(0, 3);
      
      const userRankIndex = topScorers.findIndex(s => s[0] === memberId);
      if (userRankIndex !== -1) {
        const type = userRankIndex === 0 ? 'diamante' : userRankIndex === 1 ? 'ouro' : 'bronze';
        const label = userRankIndex === 0 ? 'Artilheiro do Mês' : userRankIndex === 1 ? 'Vice-Artilheiro' : '3º Colocado';
        allBadges.push({ type, label, month: monthIndex, year: yearIndex, position: userRankIndex + 1 });
      }

      // Paredão
      const bestGK = Object.entries(playerStats)
        .filter(([_, stats]) => stats.gkGames > 0)
        .sort((a, b) => a[1].conceded - b[1].conceded || b[1].gkGames - a[1].gkGames)
        .shift();
      if (bestGK && bestGK[0] === memberId) {
        allBadges.push({ type: 'paredao', label: 'Paredão do Mês', month: monthIndex, year: yearIndex, position: 1 });
      }
    });

    return allBadges.reverse();
  }, [trainings, memberId]);

  if (badges.length === 0) return null;

  return (
    <div className="space-y-3 md:col-span-2">
      <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] border-b border-yellow-500/30 pb-2 flex items-center gap-2">
        <Trophy size={14} />
        Mural de Conquistas 🏆
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {badges.map((b, i) => {
          const badgeColors: Record<string, string> = {
            diamante: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
            ouro: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
            bronze: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
            paredao: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          };
          
          const iconColors: Record<string, string> = {
            diamante: 'bg-blue-400',
            ouro: 'bg-amber-400',
            bronze: 'bg-orange-400',
            paredao: 'bg-emerald-500'
          };

          return (
            <div key={i} className={cn("flex items-center gap-3 p-3 border rounded-xl group transition-all hover:scale-[1.02]", badgeColors[b.type] || "bg-yellow-500/5 border-yellow-500/20 text-yellow-500")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-lg shrink-0", iconColors[b.type] || "bg-yellow-400")}>
                 {b.type === 'paredao' ? <Shield className="text-white" size={16} /> : 
                  b.type === 'diamante' ? <Gem className="text-white" size={16} /> :
                  <Medal className="text-slate-900" size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest">{b.label}</p>
                <p className="text-[10px] opacity-60 font-bold uppercase">{format(new Date(b.year, b.month, 1), 'MMMM yyyy', { locale: ptBR })}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MembershipCard({ member, associationInfo }: { member: Member; associationInfo: AssociationInfo }) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const logoUrl = "https://lh3.googleusercontent.com/d/1A6hPCCMQ78jBYjr1RfT3Gjo5fNEhvJmi=w400";

  const generateCardImage = async () => {
    if (!cardRef.current) return null;
    
    try {
      setIsProcessing(true);
      setProcessingStatus("Processando imagem...");
      
      // html-to-image usually works better than html2canvas for SVG/QR codes/Complex layouts
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 4,
        cacheBust: true,
        backgroundColor: "#0f172a",
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      setIsProcessing(false);
      return dataUrl;
    } catch (err) {
      console.error("Error generating card image:", err);
      setIsProcessing(false);
      alert("Erro ao processar imagem: " + (err instanceof Error ? err.message : String(err)));
      return null;
    }
  };

  const exportAsImage = async () => {
    const dataUrl = await generateCardImage();
    if (!dataUrl) return;

    try {
      const link = document.createElement('a');
      link.download = `carteirinha_${member.name.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading image:", err);
      alert("Erro ao baixar imagem.");
    }
  };

  const exportAsPDF = async () => {
    const dataUrl = await generateCardImage();
    if (!dataUrl) return;

    try {
      setProcessingStatus("Gerando PDF...");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85, 54]
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, 85, 54);
      pdf.save(`carteirinha_${member.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Erro ao gerar PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    const dataUrl = await generateCardImage();
    if (!dataUrl) return;

    try {
      setProcessingStatus("Abrindo impressão...");
      const win = window.open("", "_blank");
      if (!win) {
        alert("O bloqueador de popups impediu a impressão. Por favor, habilite popups para este site.");
        return;
      }
      
      win.document.write(`
        <html>
          <head>
            <title>Imprimir Carteirinha - ${member.name}</title>
            <style>
              @page { size: 85mm 54mm; margin: 0; }
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #000; }
              img { width: 85mm; height: 54mm; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      win.document.close();
    } catch (err) {
      console.error("Error printing card:", err);
      alert("Erro ao preparar impressão.");
    } finally {
      setIsProcessing(false);
    }
  };

  const shareOnWhatsApp = () => {
    setIsShareModalOpen(true);
  };

  const executeWhatsAppShare = async () => {
    setIsShareModalOpen(false);
    const text = "Olá! Sua carteirinha foi gerada com sucesso. 📎\nAnexe a imagem que acabou de ser baixada e envie.";
    
    try {
      setProcessingStatus("Sincronizando...");
      setIsProcessing(true);

      if (!cardRef.current) {
        throw new Error("Elemento carteirinha não encontrado");
      }

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#0f172a"
      });

      const blob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) throw new Error("Falha ao gerar blob da imagem");

      // Baixa imagem automaticamente
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carteirinha_${member.name.replace(/\s+/g, '_').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Abre WhatsApp
      const rawPhone = member.phone.replace(/\D/g, '');
      let phonePath = "";
      if (rawPhone) {
        let phone = rawPhone;
        if (phone.length >= 10 && phone.length <= 11 && !phone.startsWith('55')) {
          phone = '55' + phone;
        }
        phonePath = phone;
      }

      const waUrl = phonePath 
        ? `https://wa.me/${phonePath}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;

      window.open(waUrl, "_blank");
      
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    } catch (error) {
      console.error("WhatsApp Share Error:", error);
      alert("Houve um erro ao processar a carteirinha.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-bold text-sm uppercase tracking-widest animate-pulse">{processingStatus}</p>
        </div>
      )}

      {/* WhatsApp Instruction Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-4">Compartilhar Carteirinha</h3>
              <div className="space-y-4 text-slate-400 text-sm leading-relaxed mb-8">
                <p>A imagem será baixada automaticamente.</p>
                <p>Em seguida, o WhatsApp será aberto.</p>
                <p className="font-bold text-white">Basta anexar a imagem e enviar.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={executeWhatsAppShare} variant="success" className="w-full h-12 text-sm uppercase font-black tracking-widest">
                  Continuar
                </Button>
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-xs text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-widest py-2"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-400/50"
          >
            <Phone size={18} />
            <p className="text-sm font-black uppercase tracking-widest whitespace-nowrap">
              Imagem pronta para envio no WhatsApp 📲
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Instruction Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-4">Compartilhar Carteirinha</h3>
              <div className="space-y-4 text-slate-400 text-sm leading-relaxed mb-8">
                <p>A imagem será baixada automaticamente.</p>
                <p>Em seguida, o WhatsApp será aberto.</p>
                <p className="font-bold text-white">Basta anexar a imagem e enviar.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={executeWhatsAppShare} variant="success" className="w-full h-12 text-sm uppercase font-black tracking-widest">
                  Continuar
                </Button>
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-xs text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-widest py-2"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-400/50"
          >
            <Phone size={18} />
            <p className="text-sm font-black uppercase tracking-widest whitespace-nowrap">
              Imagem pronta para envio no WhatsApp 📲
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center">
        <div 
          ref={cardRef}
          id="carteirinha"
          className="relative w-[350px] h-[210px] bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] border-[40px] border-slate-500 rounded-full rotate-12" />
          </div>

          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50 relative z-10">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" crossOrigin="anonymous" />
              <div className="leading-tight">
                <p className="text-[10px] font-black text-yellow-400 uppercase tracking-tighter">Associação</p>
                <p className="text-xs font-black text-white uppercase tracking-tighter">Gavião FC</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-500 uppercase">Sócio Digital</p>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">#{member.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 flex gap-4 relative z-10">
            {/* Athlete Photo */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-yellow-400/30 bg-slate-800 shrink-0 shadow-lg">
              {member.photo ? (
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <UserIcon size={32} />
                  <p className="text-[6px] font-bold uppercase mt-1">Sem Foto</p>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Nome do Sócio</p>
                <p className="text-sm font-black text-white uppercase truncate">{member.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Nascimento</p>
                  <p className="text-[10px] font-bold text-slate-200">{member.birthDate ? format(parseISO(member.birthDate), 'dd/MM/yyyy') : '-'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                  <p className={cn(
                    "text-[10px] font-black uppercase",
                    member.status === 'Ativo' ? "text-emerald-400" : "text-amber-400"
                  )}>{member.status}</p>
                </div>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Membro Desde</p>
                <p className="text-[10px] font-bold text-slate-200">{format(parseISO(member.createdAt), 'MMMM yyyy', { locale: ptBR })}</p>
              </div>
            </div>

            <div className="w-20 flex flex-col items-center justify-center gap-2 shrink-0">
              <div className="p-1.5 bg-white rounded-lg shadow-xl">
                <QRCodeCanvas value={`GAVIAOFC:${member.id}`} size={56} level="H" />
              </div>
              <p className="text-[6px] font-black text-slate-400 uppercase text-center tracking-tighter">Validação Clube</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-yellow-400 flex items-center justify-between relative z-10">
            <p className="text-[8px] font-black text-slate-900 uppercase">Documento Oficial de Identificação do Sócio</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button onClick={exportAsImage} variant="secondary" className="text-xs py-2 h-11" disabled={isProcessing}>
          <ImageIcon size={14} />
          Imagem
        </Button>
        <Button onClick={exportAsPDF} variant="secondary" className="text-xs py-2 h-11" disabled={isProcessing}>
          <FileDown size={14} />
          PDF
        </Button>
        <Button onClick={handlePrint} variant="secondary" className="text-xs py-2 h-11" disabled={isProcessing}>
          <Printer size={14} />
          Imprimir
        </Button>
        <Button onClick={shareOnWhatsApp} variant="success" className="text-xs py-2 h-11" disabled={isProcessing}>
          <Share2 size={14} />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}

function MembersView({ 
  members, 
  trainings,
  onAdd, 
  onUpdate, 
  onDelete, 
  isAdmin, 
  associationInfo, 
  getPlayerStats 
}: { 
  members: Member[]; 
  trainings: Training[];
  onAdd: any; 
  onUpdate: any; 
  onDelete: any; 
  isAdmin: boolean; 
  associationInfo: AssociationInfo; 
  getPlayerStats: (id: string) => any 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const selectedMember = useMemo(() => 
    members.find(m => m.id === selectedMemberId) || null
  , [members, selectedMemberId]);

  // Update values when editing starts
  useEffect(() => {
    if (editingMember) {
      setNameValue(editingMember.name);
      setPhotoBase64(editingMember.photo || null);
    } else {
      setNameValue('');
      setPhotoBase64(null);
    }
  }, [editingMember, isModalOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A foto deve ter no máximo 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetail = (member: Member) => {
    setSelectedMemberId(member.id);
    setIsDetailModalOpen(true);
    setShowCard(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar sócio..." 
            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditingMember(null); setIsModalOpen(true); }}>
            <UserPlus size={18} />
            Novo Sócio
          </Button>
        )}
      </div>

      <Card>
        <ResponsiveTable
          data={filteredMembers}
          emptyMessage="Nenhum sócio encontrado."
          columns={[
            { 
              header: "Nome", 
              render: (member) => (
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => handleOpenDetail(member)}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-blue-600 transition-colors">
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{member.name}</span>
                </div>
              )
            },
            { 
              header: "Mensalidade", 
              render: (member) => <span className="text-slate-300">{formatCurrency(member.monthlyFee)}</span>
            },
            { 
              header: "Status", 
              render: (member) => (
                <Badge variant={
                  member.status === 'Ativo' ? 'success' : 
                  member.status === 'Afastado' ? 'warning' : 'danger'
                }>
                  {member.status}
                </Badge>
              )
            },
            { 
              header: "Ações", 
              className: "text-right",
              render: (member) => (
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleOpenDetail(member)}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Ver Detalhes"
                  >
                    <Eye size={16} />
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => { setEditingMember(member); setIsModalOpen(true); }}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => { setMemberToDelete(member); setIsConfirmOpen(true); }}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              )
            }
          ]}
          renderCard={(member) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleOpenDetail(member)}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{member.name}</p>
                    <p className="text-xs text-slate-400">Mensalidade: {formatCurrency(member.monthlyFee)}</p>
                  </div>
                </div>
                <Badge variant={
                  member.status === 'Ativo' ? 'success' : 
                  member.status === 'Afastado' ? 'warning' : 'danger'
                }>
                  {member.status}
                </Badge>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                <Button 
                  variant="secondary" 
                  className="flex-1 h-11"
                  onClick={() => handleOpenDetail(member)}
                >
                  <Eye size={16} />
                  Detalhes
                </Button>
                {isAdmin && (
                  <>
                    <Button 
                      variant="secondary" 
                      className="flex-1 h-11"
                      onClick={() => { setEditingMember(member); setIsModalOpen(true); }}
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                    <Button 
                      variant="danger" 
                      className="flex-1 h-11"
                      onClick={() => { setMemberToDelete(member); setIsConfirmOpen(true); }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        />
      </Card>

      {/* Modal de Cadastro/Edição */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingMember ? 'Editar Sócio' : 'Novo Sócio'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                const memberData = {
                  name: (formData.get('name') as string).trim(),
                  email: (formData.get('email') as string || '').trim(),
                  senha: null,
                  cpf: formData.get('cpf') as string || '',
                  birthDate: formData.get('birthDate') as string || '',
                  phone: formData.get('phone') as string || '',
                  address: {
                    cep: formData.get('cep') as string || '',
                    street: formData.get('street') as string || '',
                    number: formData.get('number') as string || '',
                    neighborhood: formData.get('neighborhood') as string || '',
                    city: formData.get('city') as string || '',
                  },
                  monthlyFee: formData.get('monthlyFee') ? Number(formData.get('monthlyFee')) : 50,
                  status: formData.get('status') as MemberStatus,
                  photo: photoBase64 || undefined
                };
                
                if (editingMember) {
                  onUpdate(editingMember.id, memberData);
                } else {
                  onAdd(memberData);
                }
                setIsModalOpen(false);
              }} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                      <UserIcon size={14} />
                      Dados Pessoais
                    </h4>
                    
                    {/* Photo Upload Component */}
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
                          {photoBase64 ? (
                            <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="text-slate-600" size={20} />
                          )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                          <ImageIcon className="text-white" size={14} />
                          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-white uppercase leading-none">Foto Atleta</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">JPG ou PNG</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Nome Completo <span className="text-blue-500 text-[10px] lowercase italic">(Obrigatório)</span></label>
                      <input 
                        name="name"
                        required
                        defaultValue={editingMember?.name}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Email <span className="text-slate-500 text-[10px] lowercase italic">(Opcional para login)</span></label>
                      <input 
                        name="email"
                        type="email"
                        defaultValue={editingMember?.email}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="exemplo@email.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">CPF <span className="text-slate-500 text-[10px] lowercase italic">(Opcional)</span></label>
                      <input 
                        name="cpf"
                        defaultValue={editingMember?.cpf}
                        onChange={(e) => e.target.value = maskCPF(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Data de Nascimento <span className="text-slate-500 text-[10px] lowercase italic">(Opcional)</span></label>
                      <input 
                        name="birthDate"
                        type="date"
                        defaultValue={editingMember?.birthDate}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Telefone <span className="text-slate-500 text-[10px] lowercase italic">(Opcional)</span></label>
                      <input 
                        name="phone"
                        defaultValue={editingMember?.phone}
                        onChange={(e) => e.target.value = maskPhone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} />
                    Endereço <span className="text-slate-500 text-[10px] lowercase italic normal-case">(Opcional)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">CEP</label>
                      <input 
                        name="cep"
                        defaultValue={editingMember?.address?.cep}
                        onChange={(e) => e.target.value = maskCEP(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Rua</label>
                      <input 
                        name="street"
                        defaultValue={editingMember?.address?.street}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Número</label>
                      <input 
                        name="number"
                        defaultValue={editingMember?.address?.number}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="123"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Bairro</label>
                      <input 
                        name="neighborhood"
                        defaultValue={editingMember?.address?.neighborhood}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Bairro"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Cidade</label>
                      <input 
                        name="city"
                        defaultValue={editingMember?.address?.city}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Cidade"
                      />
                    </div>
                  </div>
                </div>

                {/* Informações Financeiras */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} />
                    Informações Financeiras
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Mensalidade (R$)</label>
                      <input 
                        name="monthlyFee"
                        type="number"
                        defaultValue={editingMember?.monthlyFee || 50}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Status</label>
                      <select 
                        name="status"
                        defaultValue={editingMember?.status || 'Ativo'}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Afastado">Afastado</option>
                        <option value="Desligado">Desligado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-3 sticky bottom-0 bg-[#1e293b] py-4 border-t border-slate-700">
                  <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  {isAdmin && <Button type="submit" className="flex-1" disabled={!nameValue.trim()}>Salvar Sócio</Button>}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Sócio */}
      <AnimatePresence>
        {isDetailModalOpen && selectedMember && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedMember.name}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Sócio #{selectedMember.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowCard(!showCard)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      showCard ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                    )}
                    title="Carteirinha"
                  >
                    <CardIcon size={20} />
                  </button>
                  <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white p-2">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {showCard ? (
                  <MembershipCard member={selectedMember} associationInfo={associationInfo} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-700 pb-2">Dados Pessoais</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><UserIcon size={16} /></div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">CPF</p>
                            <p className="text-sm text-white font-medium">{selectedMember.cpf || 'Não informado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><Calendar size={16} /></div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Nascimento</p>
                            <p className="text-sm text-white font-medium">{selectedMember.birthDate ? format(parseISO(selectedMember.birthDate), 'dd/MM/yyyy') : 'Não informada'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><Phone size={16} /></div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Telefone</p>
                            <p className="text-sm text-white font-medium">{selectedMember.phone || 'Não informado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><FileText size={16} /></div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
                            <p className="text-sm text-white font-medium">{selectedMember.email || 'Não informado'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-700 pb-2">Endereço</h4>
                      <div className="space-y-3">
                        {selectedMember.address?.street || selectedMember.address?.city || selectedMember.address?.cep ? (
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg text-blue-400"><MapPin size={16} /></div>
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">Localização</p>
                              <p className="text-sm text-white font-medium">
                                {selectedMember.address?.street ? `${selectedMember.address.street}${selectedMember.address.number ? `, ${selectedMember.address.number}` : ''}` : 'Endereço não informado'}
                              </p>
                              {(selectedMember.address?.neighborhood || selectedMember.address?.city) && (
                                <p className="text-xs text-slate-400">
                                  {selectedMember.address?.neighborhood || ''}{selectedMember.address?.neighborhood && selectedMember.address?.city ? ' - ' : ''}{selectedMember.address?.city || ''}
                                </p>
                              )}
                              {selectedMember.address?.cep && <p className="text-xs text-slate-400">CEP: {selectedMember.address.cep}</p>}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">Endereço não cadastrado</p>
                        )}
                      </div>
                    </div>

                    {/* Financeiro */}
                    <div className="space-y-4 md:col-span-2">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-700 pb-2">Informações Financeiras</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Mensalidade</p>
                          <p className="text-xl font-black text-white">{formatCurrency(selectedMember.monthlyFee)}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status do Plano</p>
                          <Badge variant={
                            selectedMember.status === 'Ativo' ? 'success' : 
                            selectedMember.status === 'Afastado' ? 'warning' : 'danger'
                          }>
                            {selectedMember.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Arena Gavião Stats */}
                    <div className="space-y-4 md:col-span-2">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-700 pb-2">Arena Gavião</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Gols</p>
                          <p className="text-lg font-black text-white">{getPlayerStats(selectedMember.id).totalGoals}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Assists</p>
                          <p className="text-lg font-black text-white">{getPlayerStats(selectedMember.id).totalAssists}</p>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Cartões</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-3 h-4 bg-yellow-400 rounded-sm" />
                            <span className="text-sm font-bold text-white">{getPlayerStats(selectedMember.id).totalYellows}</span>
                            <span className="w-3 h-4 bg-red-500 rounded-sm" />
                            <span className="text-sm font-bold text-white">{getPlayerStats(selectedMember.id).totalReds}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Dívida Arena</p>
                          <p className="text-lg font-black text-red-400">{formatCurrency(getPlayerStats(selectedMember.id).totalDebt)}</p>
                        </div>
                      </div>
                      {getPlayerStats(selectedMember.id).isSuspended && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                          <UserX size={14} />
                          Sócio Suspenso para o Próximo Treino
                        </div>
                      )}
                    </div>

                    {/* Badge History */}
                    <PlayerBadges memberId={selectedMember.id} trainings={trainings} />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-900/30 flex gap-3">
                {isAdmin && (
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => {
                      setEditingMember(selectedMember);
                      setIsDetailModalOpen(false);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={16} />
                    Editar Cadastro
                  </Button>
                )}
                <Button 
                  variant={isAdmin ? "ghost" : "secondary"}
                  className="flex-1"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Excluir Sócio?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Tem certeza que deseja excluir <strong>{memberToDelete?.name}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" onClick={() => {
                  if (memberToDelete) onDelete(memberToDelete.id);
                  setIsConfirmOpen(false);
                  setMemberToDelete(null);
                }}>Excluir</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Arena Module Components ---

function ArenaModule({ 
  members, 
  trainings, 
  finesConfig, 
  onAddTraining, 
  onUpdateTraining,
  onDeleteTraining,
  onUpdateFinesConfig, 
  isAdmin,
  getPlayerStats,
  isOnline,
  initialTab = 'treinos',
}: { 
  members: Member[]; 
  trainings: Training[]; 
  finesConfig: FinesConfig; 
  onAddTraining: any; 
  onUpdateTraining: any;
  onDeleteTraining: any;
  onUpdateFinesConfig: any; 
  isAdmin: boolean;
  getPlayerStats: (id: string) => any;
  isOnline: boolean;
  initialTab?: 'treinos' | 'hall-fama' | 'conquistas';
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-700/50 overflow-x-auto custom-scrollbar whitespace-nowrap">
        <button 
          onClick={() => setActiveSubTab('treinos')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeSubTab === 'treinos' ? "text-blue-500" : "text-slate-400 hover:text-slate-200"
          )}
        >
          Treinos
          {activeSubTab === 'treinos' && (
            <motion.div layoutId="arenasubtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('hall-fama')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeSubTab === 'hall-fama' ? "text-amber-500" : "text-slate-400 hover:text-slate-200"
          )}
        >
          Hall da Fama
          {activeSubTab === 'hall-fama' && (
            <motion.div layoutId="arenasubtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('conquistas')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeSubTab === 'conquistas' ? "text-yellow-500" : "text-slate-400 hover:text-slate-200"
          )}
        >
          🏆 Conquistas
          {activeSubTab === 'conquistas' && (
            <motion.div layoutId="arenasubtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('ranking')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeSubTab === 'ranking' ? "text-emerald-500" : "text-slate-400 hover:text-slate-200"
          )}
        >
          📊 Ranking Geral
          {activeSubTab === 'ranking' && (
            <motion.div layoutId="arenasubtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSubTab === 'treinos' && (
            <ArenaView 
              members={members}
              trainings={trainings}
              finesConfig={finesConfig}
              onAddTraining={onAddTraining}
              onUpdateTraining={onUpdateTraining}
              onDeleteTraining={onDeleteTraining}
              onUpdateFinesConfig={onUpdateFinesConfig}
              isAdmin={isAdmin}
              getPlayerStats={getPlayerStats}
              isOnline={isOnline}
            />
          )}
          {activeSubTab === 'hall-fama' && (
            <HallOfFameView 
              members={members}
              trainings={trainings}
              getPlayerStats={getPlayerStats}
              isAdmin={isAdmin}
            />
          )}
          {activeSubTab === 'conquistas' && (
            <ConquistasView 
              members={members}
              trainings={trainings}
            />
          )}
          {activeSubTab === 'ranking' && (
            <RankingView 
              members={members}
              trainings={trainings}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function RankingView({ members, trainings }: { members: Member[]; trainings: Training[] }) {
  const [filter, setFilter] = useState<'month' | 'season'>('season');
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const ranking = useMemo(() => {
    const filteredTrainings = trainings.filter(t => {
      const d = parseISO(t.date);
      if (filter === 'month') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      return d.getFullYear() === currentYear;
    });

    const stats: Record<string, { goals: number; assists: number; games: number; ga: number }> = {};

    members.forEach(m => {
      stats[m.id] = { goals: 0, assists: 0, games: 0, ga: 0 };
    });

    filteredTrainings.forEach(t => {
      if (t.players) {
        t.players.forEach(p => {
          if (stats[p.memberId]) {
            stats[p.memberId].goals += (p.goals || 0);
            stats[p.memberId].assists += (p.assists || 0);
            stats[p.memberId].games += 1;
            stats[p.memberId].ga = stats[p.memberId].goals + stats[p.memberId].assists;
          }
        });
      }
    });

    return Object.entries(stats)
      .map(([memberId, data]) => ({
        member: members.find(m => m.id === memberId),
        ...data
      }))
      .filter(item => item.member && item.games > 0)
      .sort((a, b) => {
        if (b.ga !== a.ga) return b.ga - a.ga;
        return a.games - b.games;
      });
  }, [members, trainings, filter, currentMonth, currentYear]);

  const top3 = ranking.slice(0, 3);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="text-emerald-500" />
            RANKING DA TEMPORADA
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Liga Profissional Gavião FC</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setFilter('month')}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              filter === 'month' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Mês Atual
          </button>
          <button 
            onClick={() => setFilter('season')}
            className={cn(
              "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              filter === 'season' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Temporada
          </button>
        </div>
      </div>

      {top3.length > 0 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-12">
          {top3[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full md:w-48"
            >
              <div className="relative group mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-slate-700 overflow-hidden bg-slate-800 shadow-xl group-hover:scale-105 transition-transform">
                  {top3[1].member?.photo ? (
                    <img src={top3[1].member.photo} alt={top3[1].member.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-full h-full p-4 text-slate-600" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-slate-900 font-black text-sm border-2 border-slate-900 shadow-lg">
                  2º
                </div>
              </div>
              <div className="text-center bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 w-full h-32 flex flex-col justify-center">
                <p className="text-xs font-black text-white uppercase truncate">{top3[1].member?.name}</p>
                <p className="text-2xl font-black text-slate-400 mt-1">{top3[1].ga}</p>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Participações G+A</p>
              </div>
            </motion.div>
          )}

          {top3[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 0, scale: 0.9 }}
              animate={{ opacity: 1, y: -20, scale: 1.1 }}
              className="flex flex-col items-center w-full md:w-56 z-10"
            >
              <div className="relative group mb-4">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Trophy className="text-yellow-500" size={32} />
                  </motion.div>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-yellow-500 overflow-hidden bg-slate-800 shadow-2xl shadow-yellow-500/20 group-hover:scale-105 transition-transform">
                  {top3[0].member?.photo ? (
                    <img src={top3[0].member.photo} alt={top3[0].member.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-full h-full p-4 text-slate-600" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-slate-950 font-black text-lg border-2 border-slate-900 shadow-xl">
                  1º
                </div>
              </div>
              <div className="text-center bg-gradient-to-b from-yellow-500/10 to-slate-900 p-6 rounded-3xl border border-yellow-500/30 w-full h-40 flex flex-col justify-center shadow-2xl">
                <p className="text-sm font-black text-white uppercase truncate">{top3[0].member?.name}</p>
                <p className="text-4xl font-black text-yellow-500 mt-1">{top3[0].ga}</p>
                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Participações G+A</p>
              </div>
            </motion.div>
          )}

          {top3[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full md:w-48"
            >
              <div className="relative group mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-orange-700/50 overflow-hidden bg-slate-800 shadow-xl group-hover:scale-105 transition-transform">
                  {top3[2].member?.photo ? (
                    <img src={top3[2].member.photo} alt={top3[2].member.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-full h-full p-4 text-slate-600" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center text-white font-black text-sm border-2 border-slate-900 shadow-lg">
                  3º
                </div>
              </div>
              <div className="text-center bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 w-full h-32 flex flex-col justify-center">
                <p className="text-xs font-black text-white uppercase truncate">{top3[2].member?.name}</p>
                <p className="text-2xl font-black text-orange-600 mt-1">{top3[2].ga}</p>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Participações G+A</p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="bg-slate-900/80 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-16">Pos</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Jogador</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gols</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ass</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-white uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-500">Total G+A</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Jogos</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Média</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {ranking.map((item, index) => (
                <motion.tr 
                  key={item.member?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-black text-xs",
                      index === 0 ? "bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20" :
                      index === 1 ? "bg-slate-400 text-slate-900" :
                      index === 2 ? "bg-orange-700 text-white" : "text-slate-500"
                    )}>
                      {index + 1}º
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                        {item.member?.photo ? (
                          <img src={item.member.photo} alt={item.member.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-full h-full p-2 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{item.member?.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Sócio Ativo</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-300">{item.goals}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-300">{item.assists}</td>
                  <td className="px-6 py-4 text-center text-base font-black text-emerald-500 bg-emerald-500/5">{item.ga}</td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-300">{item.games}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{(item.ga / item.games).toFixed(2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function ConquistasView({ members, trainings }: { members: Member[]; trainings: Training[] }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const badges = useMemo(() => {
    const monthlyTrainings = trainings.filter(t => {
      const d = parseISO(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    if (monthlyTrainings.length === 0) return [];

    const playerStats: Record<string, { goals: number, games: number, conceded: number, isGK: boolean, gkGames: number }> = {};

    members.forEach(m => {
      playerStats[m.id] = { goals: 0, games: 0, conceded: 0, isGK: false, gkGames: 0 };
    });

    monthlyTrainings.forEach(t => {
      t.players.forEach(p => {
        if (!playerStats[p.memberId]) return;
        playerStats[p.memberId].goals += p.goals;
        playerStats[p.memberId].games += 1;
        
        if (p.isGoalkeeper) {
          playerStats[p.memberId].isGK = true;
          playerStats[p.memberId].gkGames += 1;
          const trainingScore = t.score as { azul: number, amarelo: number };
          if (p.team === 'azul') {
            playerStats[p.memberId].conceded += trainingScore.amarelo;
          } else if (p.team === 'amarelo') {
            playerStats[p.memberId].conceded += trainingScore.azul;
          }
        }
      });
    });

    const calculatedBadges: any[] = [];

    // Ranking de Artilharia (TOP 3)
    const goalscorerRanking = Object.entries(playerStats)
      .filter(([_, stats]) => stats.goals > 0)
      .sort((a, b) => b[1].goals - a[1].goals || b[1].games - a[1].games)
      .slice(0, 3);

    goalscorerRanking.forEach((rank, index) => {
      const memberId = rank[0];
      const stats = rank[1];
      let type: 'diamante' | 'ouro' | 'bronze' = 'diamante';
      let label = 'Artilheiro do Mês';
      
      if (index === 0) {
        type = 'diamante';
        label = 'Artilheiro do Mês';
      } else if (index === 1) {
        type = 'ouro';
        label = 'Vice-Artilheiro';
      } else if (index === 2) {
        type = 'bronze';
        label = '3º Colocado';
      }

      calculatedBadges.push({
        memberId,
        type,
        label,
        score: stats.goals,
        extraLabel: `${stats.goals} gols em ${stats.games} jogos`,
        position: index + 1
      });
    });

    // Paredão do Mês
    const bestGK = Object.entries(playerStats)
      .filter(([_, stats]) => stats.gkGames > 0)
      .sort((a, b) => a[1].conceded - b[1].conceded || b[1].gkGames - a[1].gkGames)
      .shift();

    if (bestGK) {
      calculatedBadges.push({
        memberId: bestGK[0],
        type: 'paredao' as const,
        label: 'Paredão do Mês',
        score: bestGK[1].conceded,
        extraLabel: `${bestGK[1].conceded} gols sofridos em ${bestGK[1].gkGames} jogos`,
        position: 1
      });
    }

    return calculatedBadges;
  }, [month, year, trainings, members]);

  // Calculate historical badges for the year
  const historicalBadges = useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfMonth(new Date(year, 0, 1)),
      end: endOfMonth(new Date(year, month, 1))
    });

    const allHistorical: any[] = [];

    months.forEach(m => {
      const targetMonth = m.getMonth();
      const targetYear = m.getFullYear();
      
      const monthlyTrainings = trainings.filter(t => {
        const d = parseISO(t.date);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
      });

      if (monthlyTrainings.length === 0) return;

      const playerStats: Record<string, { goals: number, games: number, conceded: number, isGK: boolean, gkGames: number }> = {};
      monthlyTrainings.forEach(t => {
        t.players.forEach(p => {
          if (!playerStats[p.memberId]) playerStats[p.memberId] = { goals: 0, games: 0, conceded: 0, isGK: false, gkGames: 0 };
          playerStats[p.memberId].goals += p.goals;
          playerStats[p.memberId].games += 1;
          if (p.isGoalkeeper) {
            playerStats[p.memberId].isGK = true;
            playerStats[p.memberId].gkGames += 1;
            const trainingScore = t.score as { azul: number, amarelo: number };
            if (p.team === 'azul') playerStats[p.memberId].conceded += trainingScore.amarelo;
            else if (p.team === 'amarelo') playerStats[p.memberId].conceded += trainingScore.azul;
          }
        });
      });

      // Top 3 Goalscorers
      const topScorers = Object.entries(playerStats)
        .filter(([_, stats]) => stats.goals > 0)
        .sort((a, b) => b[1].goals - a[1].goals || b[1].games - a[1].games)
        .slice(0, 3);

      topScorers.forEach((rank, index) => {
        const type = index === 0 ? 'diamante' : index === 1 ? 'ouro' : 'bronze';
        const label = index === 0 ? 'Artilheiro do Mês' : index === 1 ? 'Vice-Artilheiro' : '3º Colocado';
        allHistorical.push({ memberId: rank[0], type, month: targetMonth, year: targetYear, label, position: index + 1 });
      });

      // Paredão
      const bestGK = Object.entries(playerStats)
        .filter(([_, stats]) => stats.gkGames > 0)
        .sort((a, b) => a[1].conceded - b[1].conceded || b[1].gkGames - a[1].gkGames)
        .shift();
      if (bestGK) allHistorical.push({ memberId: bestGK[0], type: 'paredao', month: targetMonth, year: targetYear, label: 'Paredão do Mês', position: 1 });
    });

    return allHistorical.reverse();
  }, [year, month, trainings]);

  const artilheirosPodium = badges.filter(b => ['diamante', 'ouro', 'bronze'].includes(b.type)).sort((a, b) => a.position - b.position);
  const paredaoBadge = badges.find(b => b.type === 'paredao');

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500 rounded-lg shadow-lg shadow-yellow-500/20">
            <Trophy className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Conquistas Mensais</h3>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Reconhecimento de Performance Automático</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-bold focus:ring-2 focus:ring-yellow-500/50"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
              </option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-bold focus:ring-2 focus:ring-yellow-500/50"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {artilheirosPodium.length > 0 ? (
        <div className="space-y-6">
          <div className="relative pt-20 pb-10 bg-slate-950/40 rounded-[3rem] border border-slate-800/50 overflow-hidden">
            {/* Spotlight Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
            
            <h4 className="text-sm font-black text-amber-500 uppercase tracking-[0.3em] mb-16 text-center relative z-10">Pódio de Artilharia</h4>
            
            <ThreeDPodium 
              gold={artilheirosPodium[0] ? { ...artilheirosPodium[0], member: members.find(m => m.id === artilheirosPodium[0].memberId) } : undefined}
              silver={artilheirosPodium[1] ? { ...artilheirosPodium[1], member: members.find(m => m.id === artilheirosPodium[1].memberId) } : undefined}
              bronze={artilheirosPodium[2] ? { ...artilheirosPodium[2], member: members.find(m => m.id === artilheirosPodium[2].memberId) } : undefined}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-700/50">
          <Trophy size={64} className="mx-auto mb-4 text-slate-700 opacity-30" />
          <p className="text-slate-500 font-bold uppercase tracking-widest">Nenhuma conquista neste período</p>
          <p className="text-xs text-slate-600 mt-2">Os registros de treinos deste mês ainda não geraram destaques.</p>
        </div>
      )}

      {paredaoBadge && (
        <div className="max-w-2xl mx-auto">
          <h4 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 text-center">Goleiro Destaque</h4>
          <ConquestCard badge={paredaoBadge} member={members.find(m => m.id === paredaoBadge.memberId)} month={month} year={year} />
        </div>
      )}

      {/* Hall of Records / Historical Badges */}
      <div className="mt-12 space-y-4">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 px-4 border-b border-slate-700/50 pb-2">
          <History size={14} />
          Mural Histórico ({year})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {historicalBadges.map((h, i) => {
            const member = members.find(m => m.id === h.memberId);
            const badgeColors: Record<string, string> = {
              diamante: 'text-blue-400',
              ouro: 'text-amber-400',
              bronze: 'text-orange-400',
              paredao: 'text-emerald-400'
            };
            return (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                  {member?.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={16} className="text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[10px] font-black uppercase tracking-tighter truncate", badgeColors[h.type] || 'text-yellow-500')}>{h.label}</p>
                  <p className="text-xs font-bold text-white truncate">{member?.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase">{format(new Date(h.year, h.month, 1), 'MMM yyyy', { locale: ptBR })}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ThreeDPodium({ gold, silver, bronze }: { gold?: any, silver?: any, bronze?: any }) {
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8 max-w-4xl mx-auto px-4 relative z-10">
      {/* Silver Column */}
      {silver && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col items-center group max-w-[150px]"
        >
          <div className="mb-4 relative">
             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-slate-300 overflow-hidden shadow-xl bg-slate-800">
              {silver.member?.photo ? (
                <img src={silver.member.photo} alt={silver.member.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-full h-full p-3 text-slate-500" />
              )}
            </div>
            <div className="absolute -top-2 -right-2 bg-slate-300 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg border border-white">2º</div>
          </div>
          <div className="text-center mb-2 px-1">
            <p className="text-[10px] font-black text-white uppercase truncate max-w-full">{silver.member?.name}</p>
            <p className="text-lg font-black text-slate-300">{silver.score} <span className="text-[10px]">GOLS</span></p>
          </div>
          <div className="w-full h-32 sm:h-40 bg-gradient-to-t from-slate-600 via-slate-400 to-slate-200 rounded-t-2xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_10px_30px_rgba(0,0,0,0.5)] flex items-start justify-center pt-4">
            <span className="text-slate-700/30 font-black text-4xl sm:text-6xl tracking-tighter italic">2</span>
          </div>
        </motion.div>
      )}

      {/* Gold Column */}
      {gold && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center group z-10 max-w-[180px]"
        >
          <div className="mb-4 relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              </motion.div>
            </div>
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 overflow-hidden shadow-2xl shadow-yellow-500/20 bg-slate-800 ring-4 ring-yellow-400/20">
              {gold.member?.photo ? (
                <img src={gold.member.photo} alt={gold.member.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-full h-full p-4 text-slate-500" />
              )}
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-950 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-white animate-pulse">1º</div>
          </div>
          <div className="text-center mb-2 px-1">
            <p className="text-xs font-black text-white uppercase truncate max-w-full">{gold.member?.name}</p>
            <p className="text-2xl font-black text-yellow-400 drop-shadow-sm">{gold.score} <span className="text-xs">GOLS</span></p>
          </div>
          <div className="w-full h-48 sm:h-64 bg-gradient-to-t from-orange-600 via-yellow-500 to-yellow-200 rounded-t-3xl shadow-[inset_0_2px_15px_rgba(255,255,255,0.6),0_15px_40px_rgba(0,0,0,0.6)] flex items-start justify-center pt-6">
            <span className="text-orange-900/20 font-black text-6xl sm:text-8xl tracking-tighter italic">1</span>
          </div>
        </motion.div>
      )}

      {/* Bronze Column */}
      {bronze && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex flex-col items-center group max-w-[150px]"
        >
          <div className="mb-4 relative">
             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-amber-700/50 overflow-hidden shadow-xl bg-slate-800">
              {bronze.member?.photo ? (
                <img src={bronze.member.photo} alt={bronze.member.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-full h-full p-3 text-slate-500" />
              )}
            </div>
            <div className="absolute -top-2 -right-2 bg-amber-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-lg border border-white">3º</div>
          </div>
          <div className="text-center mb-2 px-1">
            <p className="text-[10px] font-black text-white uppercase truncate max-w-full">{bronze.member?.name}</p>
            <p className="text-lg font-black text-amber-600">{bronze.score} <span className="text-[10px]">GOLS</span></p>
          </div>
          <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-stone-800 via-amber-800 to-amber-600 rounded-t-2xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_10px_20px_rgba(0,0,0,0.4)] flex items-start justify-center pt-3">
            <span className="text-black/20 font-black text-4xl sm:text-5xl tracking-tighter italic">3</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PodiumCard({ badge, member, position, month, year }: { badge: any, member?: Member, position: 1 | 2 | 3, month: number, year: number }) {
  if (!member) return null;

  const config = {
    1: {
      containerClass: "md:h-[380px] z-20 md:-mx-2",
      cardClass: "bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-blue-500/20",
      icon: <Gem className="text-blue-400" size={32} />,
      badge: "Diamante",
      badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      medalClass: "bg-blue-500 text-white shadow-blue-500/50",
      animation: { scale: 1.05, y: -20 }
    },
    2: {
      containerClass: "md:h-[320px] z-10",
      cardClass: "bg-gradient-to-b from-amber-900/20 to-slate-900 border-amber-500/50 shadow-amber-500/10",
      icon: <Trophy className="text-amber-400" size={24} />,
      badge: "Ouro",
      badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/20",
      medalClass: "bg-amber-500 text-slate-900 shadow-amber-500/50",
      animation: { scale: 1, y: 0 }
    },
    3: {
      containerClass: "md:h-[280px] z-10",
      cardClass: "bg-gradient-to-b from-orange-900/20 to-slate-900 border-orange-500/50 shadow-orange-500/10",
      icon: <Award className="text-orange-400" size={20} />,
      badge: "Bronze",
      badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/20",
      medalClass: "bg-orange-500 text-white shadow-orange-500/50",
      animation: { scale: 0.95, y: 10 }
    }
  };

  const style = config[position];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={style.animation}
      transition={{ type: "spring", stiffness: 100, delay: position * 0.1 }}
      className={cn("w-full md:w-64 flex flex-col justify-end", style.containerClass)}
    >
      <div className={cn("relative p-6 rounded-t-[40px] border-t-2 border-x-2 h-full flex flex-col items-center justify-center text-center", style.cardClass)}>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
           <div className={cn("w-20 h-20 rounded-full border-4 border-slate-900 overflow-hidden shadow-2xl relative group", style.cardClass.split(' ')[2])}>
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                <UserIcon size={32} />
              </div>
            )}
            <div className={cn("absolute inset-0 bg-blue-500/10 mix-blend-overlay")}></div>
          </div>
          <div className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg", style.medalClass)}>
            {position}º
          </div>
        </div>

        <div className="mt-12 space-y-2">
          <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", style.badgeClass)}>
            {style.icon}
            {badge.label}
          </div>
          <h5 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{member.name}</h5>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{format(new Date(year, month, 1), 'MMMM yyyy', { locale: ptBR })}</p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/50 w-full">
          <p className="text-lg font-black text-white">{badge.score} <span className="text-xs text-slate-500 uppercase font-bold tracking-widest ml-1">Gols</span></p>
          <div className="flex items-center justify-center gap-1 mt-1">
             <Activity size={10} className="text-slate-600" />
             <p className="text-[10px] text-slate-500 font-bold uppercase">{badge.extraLabel.split(' gols em ')[1]}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ConquestCard({ badge, member, month, year }: { badge: any, member?: Member, month: number, year: number }) {
  if (!member) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-gradient-to-br from-emerald-900/20 to-slate-900 border-2 border-emerald-500/30 rounded-3xl overflow-hidden p-6 shadow-xl shadow-emerald-500/5 group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 -mr-4 -mt-4 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
        <Shield size={120} className="text-emerald-400" />
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                <UserIcon size={32} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
            <Shield className="text-white" size={20} />
          </div>
        </div>

        <div>
           <div className="mb-2">
            <Badge variant="success">Paredão do Mês</Badge>
          </div>
          <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{member.name}</h4>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Em {format(new Date(year, month, 1), 'MMMM yyyy', { locale: ptBR })}</p>
          <div className="mt-4 flex items-center gap-2">
             <p className="text-xs font-black text-emerald-400">{badge.extraLabel}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ArenaView({ 
  members, 
  trainings, 
  finesConfig, 
  onAddTraining, 
  onUpdateTraining,
  onDeleteTraining,
  onUpdateFinesConfig, 
  isAdmin,
  getPlayerStats,
  isOnline
}: { 
  members: Member[]; 
  trainings: Training[]; 
  finesConfig: FinesConfig; 
  onAddTraining: any; 
  onUpdateTraining: any;
  onDeleteTraining: any;
  onUpdateFinesConfig: any; 
  isAdmin: boolean;
  getPlayerStats: (id: string) => any;
  isOnline: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [matchStats, setMatchStats] = useState<Record<string, MatchPlayer>>({});

  const activeMembers = members.filter(m => m.status === 'Ativo');

  const handleTogglePlayer = (memberId: string) => {
    if (selectedPlayers.includes(memberId)) {
      setSelectedPlayers(prev => prev.filter(id => id !== memberId));
      setMatchStats(prev => {
        const newStats = { ...prev };
        delete newStats[memberId];
        return newStats;
      });
    } else {
      const member = members.find(m => m.id === memberId);
      if (member) {
        setSelectedPlayers(prev => [...prev, memberId]);
        setMatchStats(prev => ({
          ...prev,
          [memberId]: {
            memberId,
            name: member.name,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            isMvp: false,
            isGoalkeeper: false,
            team: 'azul'
          }
        }));
      }
    }
  };

  const handleSelectAll = () => {
    const unSuspendedMembers = activeMembers.filter(m => !getPlayerStats(m.id).isSuspended);
    const newSelected = unSuspendedMembers.map(m => m.id);
    setSelectedPlayers(newSelected);
    
    const newStats: Record<string, MatchPlayer> = {};
    unSuspendedMembers.forEach(member => {
      newStats[member.id] = {
        memberId: member.id,
        name: member.name,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        isMvp: false,
        isGoalkeeper: false,
        team: 'azul'
      };
    });
    setMatchStats(newStats);
  };

  const handleDeselectAll = () => {
    setSelectedPlayers([]);
    setMatchStats({});
  };

  const updateStat = (memberId: string, field: keyof MatchPlayer, value: number | boolean | string) => {
    setMatchStats(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [headerValues, setHeaderValues] = useState({
    date: '',
    time: '',
    location: '',
    azul: 0,
    amarelo: 0
  });

  // Sync header state when modal opens or editing starts
  useEffect(() => {
    if (isModalOpen) {
      if (editingTraining) {
        setHeaderValues({
          date: editingTraining.date.split('T')[0],
          time: editingTraining.time || '',
          location: editingTraining.location || '',
          azul: typeof editingTraining.score === 'object' ? editingTraining.score.azul : 0,
          amarelo: typeof editingTraining.score === 'object' ? editingTraining.score.amarelo : 0,
        });
      } else {
        setHeaderValues({
          date: getNextSaturday(),
          time: '',
          location: '',
          azul: 0,
          amarelo: 0
        });
      }
    }
  }, [isModalOpen, editingTraining]);

  // Badge URL Constants for Hall of Fame
  const URL_ARTILHEIRO = "https://ais-pre-eoi7regcvhwnfof4hjd6zw-125213501829.us-east1.run.app/artilheiro.png";
  const URL_VICE = "https://ais-pre-eoi7regcvhwnfof4hjd6zw-125213501829.us-east1.run.app/vice-artilheiro.png";
  const URL_ASSISTENCIA = "https://ais-pre-eoi7regcvhwnfof4hjd6zw-125213501829.us-east1.run.app/lider-de-assistencia.png";
  const URL_GOLEIRO = "https://ais-pre-eoi7regcvhwnfof4hjd6zw-125213501829.us-east1.run.app/goleiro-menos-vazado.png";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const trainingData = {
      date: headerValues.date,
      time: headerValues.time || undefined,
      location: headerValues.location || undefined,
      score: { azul: headerValues.azul, amarelo: headerValues.amarelo },
      players: Object.values(matchStats)
    };

    if (editingTraining) {
      onUpdateTraining(editingTraining.id, trainingData);
    } else {
      onAddTraining(trainingData);
    }

    setIsModalOpen(false);
    setEditingTraining(null);
    setSelectedPlayers([]);
    setMatchStats({});
    setIsExpanded(false);
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    
    // Fill match stats
    const stats: Record<string, MatchPlayer> = {};
    training.players.forEach(p => {
      stats[p.memberId] = { ...p };
    });
    setMatchStats(stats);
    setSelectedPlayers(training.players.map(p => p.memberId));
    setIsModalOpen(true);
  };

  // Get next Saturday
  const getNextSaturday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay()));
    return d.toISOString().split('T')[0];
  };

  const exportTrainingReport = (training: Training) => {
    const doc = new jsPDF();
    const dateFormatted = format(parseISO(training.date), 'dd/MM/yyyy');
    const title = `Súmula de Jogo - ${dateFormatted}`;
    
    doc.setFontSize(18);
    doc.text('Associação Gavião Futebol Clube', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(title, 105, 30, { align: 'center' });
    
    const scoreText = typeof training.score === 'string' 
      ? training.score 
      : `Azul ${training.score.azul} x ${training.score.amarelo} Amarelo`;
    
    doc.text(`Placar: ${scoreText}`, 105, 40, { align: 'center' });

    let yPos = 50;
    doc.setFontSize(10);
    if (training.location) {
      doc.text(`Local: ${training.location}`, 105, yPos, { align: 'center' });
      yPos += 7;
    }
    if (training.time) {
      doc.text(`Horário: ${training.time}`, 105, yPos, { align: 'center' });
      yPos += 7;
    }

    const tableData = training.players.map(p => [
      p.name,
      p.goals.toString(),
      p.assists.toString(),
      p.yellowCards.toString(),
      p.redCards.toString(),
      p.isMvp ? 'Sim' : 'Não'
    ]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Jogador', 'Gols', 'Assists', 'Amarelo', 'Vermelho', 'MVP']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`sumula_${training.date}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Arena Gavião</h3>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Gestão de Treinos e Súmulas</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="secondary" onClick={() => setIsConfigOpen(true)}>
              <Settings size={18} />
              Multas
            </Button>
          )}
          {isAdmin && (
            <Button onClick={() => {
              setEditingTraining(null);
              setSelectedPlayers([]);
              setMatchStats({});
              setIsModalOpen(true);
            }}>
              <Plus size={18} />
              Novo Treino
            </Button>
          )}
          {!isAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
               <Shield size={14} className="text-slate-500" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Painel de Observação</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <History size={16} className="text-blue-400" />
                Histórico de Treinos
              </h4>
            </div>
            <div className="divide-y divide-slate-700/50">
              {trainings.length > 0 ? (
                trainings.map((training) => (
                  <div key={training.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg text-slate-400">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight">
                            {format(parseISO(training.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            <span className="text-slate-500 font-normal">
                              {training.time ? ` - ${training.time}` : ' - Horário não informado'}
                            </span>
                          </p>
                          <p className={cn(
                            "text-[10px] flex items-center gap-1 mt-0.5 uppercase tracking-wider font-bold",
                            training.location ? "text-slate-400" : "text-slate-500 italic"
                          )}>
                            <MapPin size={10} className={training.location ? "text-blue-400" : "text-slate-600"} />
                            Local: {training.location || 'Não informado'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Placar:</p>
                            {typeof training.score === 'string' ? (
                              <span className="text-xs font-black text-blue-400">{training.score}</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-600/10 border border-blue-600/20 rounded text-[10px] font-black text-blue-400">
                                  AZUL {training.score.azul}
                                </div>
                                <span className="text-slate-600 font-bold text-[10px]">x</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] font-black text-yellow-500">
                                  AMARELO {training.score.amarelo}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => handleEdit(training)}
                              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                              title="Editar Treino"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setTrainingToDelete(training);
                                setIsConfirmDeleteOpen(true);
                              }}
                              className="p-2 bg-slate-700 hover:bg-red-500/20 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                              title="Excluir Treino"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => exportTrainingReport(training)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
                          title="Exportar PDF"
                        >
                          <Download size={16} />
                        </button>
                        <Badge variant="neutral">{training.players.length} Jogadores</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {training.players.filter(p => p.goals > 0 || p.isMvp).map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
                          <span className="text-[10px] font-bold text-slate-300">{p.name}</span>
                          {p.goals > 0 && <span className="text-[10px] font-black text-emerald-400">{p.goals}⚽</span>}
                          {p.isMvp && <Award size={10} className="text-yellow-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <Activity size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhum treino registrado ainda.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-600/10 to-transparent">
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Configuração de Multas</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-4 bg-yellow-400 rounded-sm" />
                  <span className="text-sm font-bold text-slate-300">Cartão Amarelo</span>
                </div>
                <span className="text-lg font-black text-white">{formatCurrency(finesConfig.yellowCardValue)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-4 bg-red-500 rounded-sm" />
                  <span className="text-sm font-bold text-slate-300">Cartão Vermelho</span>
                </div>
                <span className="text-lg font-black text-white">{formatCurrency(finesConfig.redCardValue)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <AlertTriangle size={14} />
              Suspensões Ativas
            </h4>
            <div className="space-y-3">
              {members.filter(m => getPlayerStats(m.id).isSuspended).length > 0 ? (
                members.filter(m => getPlayerStats(m.id).isSuspended).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserX size={14} className="text-red-500" />
                      <span className="text-xs font-bold text-slate-200">{m.name}</span>
                    </div>
                    <Badge variant="danger">SUSPENSO</Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4 italic">Nenhuma suspensão ativa.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão de Treino */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Excluir Treino?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir o treino de <strong>{trainingToDelete ? format(parseISO(trainingToDelete.date), "dd/MM/yyyy") : ''}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmDeleteOpen(false)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" onClick={() => {
                  if (trainingToDelete) onDeleteTraining(trainingToDelete.id);
                  setIsConfirmDeleteOpen(false);
                  setTrainingToDelete(null);
                }}>Excluir</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Novo Treino */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "relative w-full bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col transition-all duration-300",
                isExpanded ? "max-w-7xl h-[95vh] max-h-[95vh]" : "max-w-5xl h-[90vh] max-h-[90vh]"
              )}
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="text-blue-400" />
                  {editingTraining ? 'Editar Súmula do Treino' : 'Registrar Súmula do Treino'}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 transition-colors flex items-center gap-2"
                    title={isExpanded ? "Recolher Painel" : "Ampliar Painel"}
                  >
                    {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    <span className="text-xs font-bold uppercase hidden sm:inline">
                      {isExpanded ? "Recolher" : "Ampliar"}
                    </span>
                  </button>
                  <button onClick={() => { setIsModalOpen(false); setEditingTraining(null); setSelectedPlayers([]); setMatchStats({}); setIsExpanded(false); }} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>
              </div>

              {!isOnline && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center gap-3">
                  <CloudOff size={16} className="text-amber-500" />
                  <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                    Modo Offline Ativo - Seus dados serão salvos localmente e sincronizados ao detectar sinal.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col relative">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {!isExpanded && (
                    <motion.div 
                      key="training-header"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-4 md:p-6 space-y-4 md:space-y-6 border-b border-slate-700 bg-slate-800/30 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data do Treino</label>
                          <input 
                            name="date" 
                            type="date" 
                            required 
                            value={headerValues.date}
                            onChange={(e) => setHeaderValues(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horário <span className="text-[10px] lowercase italic font-normal">(Opcional)</span></label>
                          <input 
                            name="time" 
                            type="time" 
                            value={headerValues.time}
                            onChange={(e) => setHeaderValues(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Local <span className="text-[10px] lowercase italic font-normal">(Opcional)</span></label>
                          <input 
                            name="location" 
                            placeholder="Ex: Arena Gavião" 
                            value={headerValues.location}
                            onChange={(e) => setHeaderValues(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50" 
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] block text-center">Placar por Equipe</label>
                        <div className="flex items-center justify-center gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <div className="px-3 py-1 bg-blue-600 rounded text-[10px] font-black text-white uppercase tracking-widest">Time Azul</div>
                            <input 
                              name="azul" 
                              type="number" 
                              min="0"
                              value={headerValues.azul}
                              onChange={(e) => setHeaderValues(prev => ({ ...prev, azul: Number(e.target.value) }))}
                              className="w-16 md:w-20 bg-slate-900 border border-slate-700 rounded-xl px-2 md:px-4 py-2 md:py-3 text-center text-lg md:text-xl font-black text-white focus:ring-2 focus:ring-blue-500" 
                            />
                          </div>
                          <div className="text-slate-600 font-black text-2xl mt-6">x</div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="px-3 py-1 bg-yellow-500 rounded text-[10px] font-black text-slate-900 uppercase tracking-widest">Time Amarelo</div>
                            <input 
                              name="amarelo" 
                              type="number" 
                              min="0"
                              value={headerValues.amarelo}
                              onChange={(e) => setHeaderValues(prev => ({ ...prev, amarelo: Number(e.target.value) }))}
                              className="w-16 md:w-20 bg-slate-900 border border-slate-700 rounded-xl px-2 md:px-4 py-2 md:py-3 text-center text-lg md:text-xl font-black text-white focus:ring-2 focus:ring-yellow-500" 
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col md:flex-row md:flex-1 md:overflow-hidden">
                  {/* Player Selection */}
                  <div className={cn(
                    "border-r border-slate-700 flex flex-col bg-slate-900/10 transition-all duration-300",
                    isExpanded ? "hidden md:flex md:w-0 border-none opacity-0" : "w-full flex-1 md:flex-none md:w-80 opacity-100 max-h-[60vh] md:max-h-none"
                  )}>
                    <div className="p-4 bg-slate-900/50 border-b border-slate-700 sticky top-0 z-10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jogadores ({activeMembers.length})</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-blue-400">Sel: {selectedPlayers.length}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-colors border border-slate-700"
                        >
                          <CheckCircle size={12} className="text-emerald-500" />
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-colors border border-slate-700"
                        >
                          <X size={12} className="text-red-500" />
                          Nenhum
                        </button>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {activeMembers.map(m => {
                        const stats = getPlayerStats(m.id);
                        const isSelected = selectedPlayers.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            disabled={stats.isSuspended}
                            onClick={() => handleTogglePlayer(m.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                              isSelected 
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                                : "bg-slate-800/40 text-slate-400 hover:bg-slate-800 border border-transparent",
                              stats.isSuspended && "opacity-50 grayscale cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                isSelected ? "bg-white border-white" : "bg-slate-900 border-slate-700"
                              )}>
                                {isSelected && <Check size={12} className="text-blue-600" />}
                              </div>
                              <span className="text-sm font-bold truncate">{m.name}</span>
                            </div>
                            {stats.isSuspended && <UserX size={14} className="text-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stats Input */}
                  <div className="flex-1 flex flex-col bg-slate-900/5">
                    <div className="p-4 bg-slate-900/50 border-b border-slate-700 sticky top-0 z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded && (
                          <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white"
                          >
                            <ArrowLeft size={18} />
                          </button>
                        )}
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Súmula Detalhada</h4>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Azul</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Amarelo</div>
                        {isExpanded && <div className="ml-4 px-3 py-1 bg-slate-800 rounded-full text-slate-300">{selectedPlayers.length} Jogadores Selecionados</div>}
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {selectedPlayers.length > 0 ? (
                        selectedPlayers.map(id => (
                          <div 
                            key={id} 
                            className={cn(
                              "p-4 rounded-xl border transition-all duration-300",
                              matchStats[id]?.team === 'azul' 
                                ? "bg-blue-600/5 border-blue-500/20" 
                                : "bg-yellow-500/5 border-yellow-500/20",
                              isExpanded && "p-8 mb-6"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "rounded-full flex items-center justify-center font-black transition-all",
                                  matchStats[id]?.team === 'azul' ? "bg-blue-600 text-white" : "bg-yellow-500 text-slate-900",
                                  isExpanded ? "w-16 h-16 text-3xl" : "w-10 h-10 text-lg"
                                )}>
                                  {matchStats[id]?.name?.charAt(0)}
                                </div>
                                <div>
                                  <span className={cn(
                                    "font-black text-white uppercase tracking-tight block",
                                    isExpanded ? "text-2xl" : "text-base"
                                  )}>
                                    {matchStats[id]?.name}
                                  </span>
                                  <div className="flex gap-2 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => updateStat(id, 'team', 'azul')}
                                      className={cn(
                                        "px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                                        matchStats[id]?.team === 'azul' ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500 hover:text-slate-300"
                                      )}
                                    >
                                      Azul
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateStat(id, 'team', 'amarelo')}
                                      className={cn(
                                        "px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all",
                                        matchStats[id]?.team === 'amarelo' ? "bg-yellow-500 text-slate-900" : "bg-slate-800 text-slate-500 hover:text-slate-300"
                                      )}
                                    >
                                      Amarelo
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => updateStat(id, 'isGoalkeeper', !matchStats[id]?.isGoalkeeper)}
                                  className={cn(
                                    "flex items-center justify-center gap-2 px-6 rounded-xl text-[10px] font-black uppercase transition-all border",
                                    isExpanded ? "h-14 min-w-[140px] text-xs" : "h-10",
                                    matchStats[id]?.isGoalkeeper ? "bg-emerald-500 border-emerald-400 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                                  )}
                                >
                                  <Shield size={isExpanded ? 20 : 14} />
                                  Goleiro
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => updateStat(id, 'isMvp', !matchStats[id]?.isMvp)}
                                  className={cn(
                                    "flex items-center justify-center gap-2 px-6 rounded-xl text-[10px] font-black uppercase transition-all border",
                                    isExpanded ? "h-14 min-w-[140px] text-xs" : "h-10",
                                    matchStats[id]?.isMvp ? "bg-yellow-400 border-yellow-300 text-slate-900" : "bg-slate-800 border-slate-700 text-slate-500"
                                  )}
                                >
                                  <Trophy size={isExpanded ? 20 : 14} />
                                  MVP
                                </button>
                              </div>
                            </div>
                            
                            <div className={cn(
                              "grid grid-cols-2 sm:grid-cols-4 gap-3",
                              isExpanded && "gap-6"
                            )}>
                              <StatCardTablet 
                                label="Gols" 
                                value={matchStats[id]?.goals || 0} 
                                onChange={(v) => updateStat(id, 'goals', v)} 
                                color="blue"
                                size={isExpanded ? 'lg' : 'md'}
                              />
                              <StatCardTablet 
                                label="Assists" 
                                value={matchStats[id]?.assists || 0} 
                                onChange={(v) => updateStat(id, 'assists', v)} 
                                color="emerald"
                                size={isExpanded ? 'lg' : 'md'}
                              />
                              <StatCardTablet 
                                label="🟨 Amarelo" 
                                value={matchStats[id]?.yellowCards || 0} 
                                onChange={(v) => updateStat(id, 'yellowCards', v)} 
                                max={2} 
                                color="yellow"
                                size={isExpanded ? 'lg' : 'md'}
                              />
                              <StatCardTablet 
                                label="🟥 Vermelho" 
                                value={matchStats[id]?.redCards || 0} 
                                onChange={(v) => updateStat(id, 'redCards', v)} 
                                max={1} 
                                color="red"
                                size={isExpanded ? 'lg' : 'md'}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="hidden md:flex h-full flex-col items-center justify-center text-slate-600 py-20">
                          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50 border-dashed">
                            <UserCheck size={32} className="opacity-20" />
                          </div>
                          <p className="text-sm font-bold uppercase tracking-widest opacity-40">Selecione os atletas para começar</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                </div>
                
                <div className="sticky bottom-0 p-6 border-t border-slate-700 bg-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                       {Object.values(matchStats).reduce((acc: number, p) => acc + ((p as MatchPlayer).goals || 0), 0)} Gols Total
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       {Object.values(matchStats).reduce((acc: number, p) => acc + ((p as MatchPlayer).assists || 0), 0)} Assists Total
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => { setIsModalOpen(false); setEditingTraining(null); setSelectedPlayers([]); setMatchStats({}); }}
                      className="flex-1 sm:flex-none h-12 px-8 uppercase font-black text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={selectedPlayers.length === 0}
                      className="flex-1 sm:flex-none h-12 px-8 uppercase font-black text-xs bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/50 shadow-lg shadow-emerald-600/20"
                    >
                      {editingTraining ? 'Salvar Alterações' : 'Salvar Súmula'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Configuração de Multas */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsConfigOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Configurar Multas</h3>
                <button onClick={() => setIsConfigOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onUpdateFinesConfig({
                  yellowCardValue: Number(formData.get('yellow')),
                  redCardValue: Number(formData.get('red'))
                });
                setIsConfigOpen(false);
              }} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Valor Cartão Amarelo (R$)</label>
                  <input name="yellow" type="number" required defaultValue={finesConfig.yellowCardValue} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Valor Cartão Vermelho (R$)</label>
                  <input name="red" type="number" required defaultValue={finesConfig.redCardValue} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white" />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setIsConfigOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1">Salvar</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HallOfFameView({ 
  members, 
  trainings,
}: { 
  members: Member[]; 
  trainings: Training[];
  getPlayerStats: (id: string) => any;
  isAdmin: boolean;
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<{ url: string, title: string, category: string } | null>(null);

  const filteredTrainings = trainings.filter(t => new Date(t.date).getFullYear() === year);

  const playerRanking = useMemo(() => {
    const stats: Record<string, { 
      name: string, 
      goals: number, 
      assists: number, 
      conceded: number, 
      isGK: boolean,
      gkGames: number,
      totalGames: number
    }> = {};

    members.forEach(m => {
      stats[m.id] = { 
        name: m.name, 
        goals: 0, 
        assists: 0, 
        conceded: 0, 
        isGK: false,
        gkGames: 0,
        totalGames: 0
      };
    });

    filteredTrainings.forEach(t => {
      t.players.forEach(p => {
        if (!stats[p.memberId]) return;
        
        stats[p.memberId].goals += (p.goals || 0);
        stats[p.memberId].assists += (p.assists || 0);
        stats[p.memberId].totalGames += 1;

        if (p.isGoalkeeper) {
          stats[p.memberId].isGK = true;
          stats[p.memberId].gkGames += 1;
          const score = typeof t.score === 'object' ? t.score : { azul: 0, amarelo: 0 };
          if (p.team === 'azul') {
            stats[p.memberId].conceded += (score.amarelo || 0);
          } else {
            stats[p.memberId].conceded += (score.azul || 0);
          }
        }
      });
    });

    return Object.entries(stats).map(([id, s]) => ({ id, ...s }));
  }, [filteredTrainings, members]);

  const winners = useMemo(() => {
    const artilharia = [...playerRanking].sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.totalGames - b.totalGames);
    const assistencias = [...playerRanking].sort((a, b) => b.assists - a.assists || b.goals - a.goals || a.totalGames - b.totalGames);
    const goleiros = playerRanking.filter(p => p.isGK && p.gkGames > 0)
      .sort((a, b) => (a.conceded / a.gkGames) - (b.conceded / b.gkGames) || b.gkGames - a.gkGames);

    return {
      artilheiro: artilharia[0]?.goals > 0 ? artilharia[0] : null,
      vice: (artilharia[1]?.goals > 0) ? artilharia[1] : null,
      assistente: assistencias[0]?.assists > 0 ? assistencias[0] : null,
      goleiro: goleiros[0] || null
    };
  }, [playerRanking]);

  const RewardBadge = ({ type, player, label, description, isLarge = false }: { 
    type: 'ouro' | 'prata' | 'maestro' | 'goleiro', 
    player: any, 
    label: string, 
    description: string,
    isLarge?: boolean 
  }) => {
    const badgeUrl = type === 'ouro' ? LINK_OURO : 
                     type === 'prata' ? LINK_PRATA : 
                     type === 'maestro' ? LINK_MAESTRO : LINK_GOLEIRO;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative flex flex-col items-center group",
          isLarge ? "z-20 scale-110" : "z-10"
        )}
      >
        <div 
          className="relative cursor-help"
          onMouseEnter={() => setActiveTooltip(type)}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <AnimatePresence>
            {activeTooltip === type && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-3 bg-slate-900 border border-amber-500/30 rounded-xl shadow-2xl z-[100] text-center pointer-events-none"
              >
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-[9px] text-slate-400 font-bold leading-tight">{description}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-amber-500/30 rotate-45 -mt-1" />
              </motion.div>
            )}
          </AnimatePresence>
  
          <div 
            className="relative transition-all duration-500 flex items-center justify-center bg-transparent cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBadge({ url: badgeUrl, title: label, category: player.name });
            }}
          >
            <img 
              src={badgeUrl} 
              alt="" 
              className={cn(
                "object-contain transition-transform group-hover:scale-110 h-auto bg-transparent",
                isLarge ? "w-[130px] drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]" : "w-[100px] opacity-90"
              )}
            />
          </div>
        </div>
  
        <div className="mt-4 text-center">
          <h4 className={cn(
            "font-black uppercase tracking-tight leading-none",
            isLarge ? "text-lg text-white" : "text-[10px] text-slate-300"
          )}>
            {player.name}
          </h4>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-0.5 bg-slate-800/80 rounded-full border border-slate-700">
            <span className="text-[10px] font-black text-white">
              {type === 'maestro' ? `${player.assists} Assistências` : 
               type === 'goleiro' ? `${(player.conceded / player.gkGames).toFixed(1)} Gols/Jogo` :
               `${player.goals} Gols`}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const years = Array.from(new Set(trainings.map(t => new Date(t.date).getFullYear()))).sort((a, b) => b - a);
  if (years.length === 0) years.push(new Date().getFullYear());

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 rotate-3">
            <Trophy className="text-white" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Hall da Fama</h3>
            <p className="text-xs text-amber-500 font-bold uppercase tracking-[0.3em]">Os Imortais do Gavião FC</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporada:</span>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-xl px-6 py-2.5 text-white font-black focus:ring-2 focus:ring-amber-500 shadow-xl"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Podium Display */}
      <div className="relative min-h-[400px] flex items-end justify-center px-4 pt-20">
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-amber-500/5 to-transparent rounded-full blur-3xl opacity-50" />
        
        <div className="flex items-end gap-2 sm:gap-8 max-w-5xl w-full">
          {/* Vice (Esquerda) */}
          <div className="flex-1 pb-4">
            {winners.vice && (
              <RewardBadge 
                type="prata" 
                player={winners.vice} 
                label="Chuteira de Prata" 
                description={`Vice-Artilheiro da Temporada ${year}`} 
              />
            )}
          </div>

          {/* Artilheiro (Centro) */}
          <div className="flex-1 pb-16">
            {winners.artilheiro && (
              <RewardBadge 
                type="ouro" 
                player={winners.artilheiro} 
                label="Chuteira de Ouro" 
                description={`Maior Artilheiro da Temporada ${year}`} 
                isLarge 
              />
            )}
          </div>

          {/* Assistente (Direita) */}
          <div className="flex-1 pb-4">
            {winners.assistente && (
              <RewardBadge 
                type="maestro" 
                player={winners.assistente} 
                label="Maestro da Elite" 
                description={`Líder de Assistências da Temporada ${year}`} 
              />
            )}
          </div>
        </div>

        {/* Goleiro Special Positioning */}
        {winners.goleiro && (
          <div className="absolute -top-4 right-4 sm:right-12">
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-red-500/30 shadow-2xl flex items-center gap-4 group cursor-help"
              onMouseEnter={() => setActiveTooltip('goleiro')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip(activeTooltip === 'goleiro' ? null : 'goleiro')}
            >
              <div 
                className="relative flex items-center justify-center bg-transparent cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBadge({ url: LINK_GOLEIRO, title: "Muralha Inabalável", category: winners.goleiro!.name });
                }}
              >
                <img 
                  src={LINK_GOLEIRO} 
                  alt="" 
                  className="w-[85px] h-auto object-contain transition-transform group-hover:scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" 
                />
                <AnimatePresence>
                  {activeTooltip === 'goleiro' && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-48 p-3 bg-slate-900 border border-red-500/30 rounded-xl shadow-2xl z-[100] text-right pointer-events-none"
                    >
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Muralha Inabalável</p>
                      <p className="text-[9px] text-slate-400 font-bold leading-tight">Goleiro com a menor média de gols sofridos em {year}.</p>
                      <div className="absolute left-full top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-t border-r border-red-500/30 rotate-45 -ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="pr-2">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">Melhor Goleiro</p>
                <h5 className="text-sm font-black text-white uppercase">{winners.goleiro.name}</h5>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">Média: {(winners.goleiro.conceded / winners.goleiro.gkGames).toFixed(1)}</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* General Ranking List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
          <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Users size={20} className="text-slate-400" />
            Quadro Estatístico {year}
          </h4>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{playerRanking.length} Jogadores Ativos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {playerRanking.sort((a, b) => b.goals - a.goals || b.assists - a.assists).map((p, idx) => {
            const isArtilheiro = p.id === winners.artilheiro?.id;
            const isVice = p.id === winners.vice?.id;
            const isAssistente = p.id === winners.assistente?.id;
            const isGoleiro = p.id === winners.goleiro?.id;

            let glowClass = "";
            let badgeInfo = null;

            if (isArtilheiro) {
              glowClass = "shadow-[0_0_15px_rgba(255,215,0,0.2)] border-amber-500/50 bg-amber-500/5";
              badgeInfo = { url: LINK_OURO, label: "Chuteira de Ouro" };
            } else if (isVice) {
              glowClass = "shadow-[0_0_15px_rgba(96,165,250,0.2)] border-blue-400/50 bg-blue-400/5";
              badgeInfo = { url: LINK_PRATA, label: "Chuteira de Prata" };
            } else if (isAssistente) {
              glowClass = "shadow-[0_0_15px_rgba(16,185,129,0.2)] border-emerald-500/50 bg-emerald-500/5";
              badgeInfo = { url: LINK_MAESTRO, label: "Maestro da Elite" };
            } else if (isGoleiro) {
              glowClass = "shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-500/50 bg-red-500/5";
              badgeInfo = { url: LINK_GOLEIRO, label: "Muralha Inabalável" };
            }

            return (
              <motion.div 
                key={p.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPlayerId(p.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl",
                  glowClass
                )}
              >
                <div className="relative">
                  {badgeInfo ? (
                    <div 
                      className="relative z-10 w-14 h-14 flex items-center justify-center cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBadge({ url: badgeInfo!.url, title: badgeInfo!.label, category: p.name });
                      }}
                    >
                      <img src={badgeInfo.url} className="w-12 h-12 object-contain" alt="Badge" title={badgeInfo.label} />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 font-black text-xl">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="font-black text-white uppercase truncate text-sm tracking-tight">{p.name}</h5>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <span className="text-amber-500">⚽</span> {p.goals}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <span className="text-emerald-500">🎯</span> {p.assists}
                    </span>
                    {p.gkGames > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <span className="text-red-500">🛡️</span> {p.conceded}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">MÉD.</p>
                  <p className="text-sm font-black text-white">
                    {p.totalGames > 0 ? (p.goals / p.totalGames).toFixed(1) : 0}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal Extrato de Performance */}
      <AnimatePresence>
        {selectedPlayerId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayerId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <TrendingUp className="text-amber-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Extrato de Performance</h3>
                    <p className="text-xs text-amber-500 font-bold uppercase tracking-widest truncate max-w-[200px]">
                      {members.find(m => m.id === selectedPlayerId)?.name} • {year}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedPlayerId(null)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              {(() => {
                const p = playerRanking.find(r => r.id === selectedPlayerId);
                const playerActivities = filteredTrainings.filter(t => 
                  t.players.some(p => p.memberId === selectedPlayerId && (p.goals > 0 || p.assists > 0 || p.isMvp))
                ).map(t => {
                  const playerStats = t.players.find(p => p.memberId === selectedPlayerId)!;
                  return {
                    date: t.date,
                    goals: playerStats.goals,
                    assists: playerStats.assists,
                    isMvp: playerStats.isMvp,
                    score: t.score
                  };
                }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                return (
                  <>
                    <div className="p-6 bg-slate-900/30 border-b border-slate-800 grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <p className="text-2xl font-black text-white">{p?.goals || 0}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total de Gols</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <p className="text-2xl font-black text-white">{p?.assists || 0}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total de Assistências</p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                      {/* Badges Section */}
                      <PlayerBadges memberId={selectedPlayerId} trainings={trainings} />

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-700 pb-2">Atividades Recentes</h4>
                        {playerActivities.length > 0 ? (
                          playerActivities.map((s, idx) => (
                            <div key={idx} className="group relative pl-4 border-l-2 border-slate-700 py-1">
                              <div className="absolute -left-[5px] top-2 w-2 h-2 bg-slate-700 rounded-full group-hover:bg-amber-500 transition-colors" />
                              <div className="flex items-center justify-between gap-4 mb-1">
                                <p className="text-xs font-black text-slate-400">
                                  {format(parseISO(s.date), "dd/MM/yyyy")}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {s.goals > 0 && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded border border-emerald-500/20">+{s.goals} Gols</span>}
                                  {s.assists > 0 && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded border border-blue-500/20">+{s.assists} Assists</span>}
                                  {s.isMvp && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded border border-amber-500/20">MVP</span>}
                                </div>
                              </div>
                              <div className="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/50">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[200px]">
                                  {s.goals > 0 && s.assists > 0 ? `${s.goals} Gols / ${s.assists} Assists` : 
                                   s.goals > 0 ? `${s.goals} Gols marcados` : 
                                   s.assists > 0 ? `${s.assists} Assistência(s)` : 
                                   s.isMvp ? "Destaque da partida" : "Participação"}
                                </p>
                                <div className="flex items-center gap-2">
                                  {typeof s.score === 'object' && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-blue-400 font-black text-[10px]">{s.score.azul}</span>
                                      <span className="text-slate-600 text-[10px]">x</span>
                                      <span className="text-yellow-500 font-black text-[10px]">{s.score.amarelo}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-slate-500 text-sm py-4">Nenhuma atividade registrada.</p>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImageLightbox 
        src={selectedBadge?.url || null}
        title={selectedBadge?.title}
        category={selectedBadge?.category}
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        downloadUrl={selectedBadge?.url}
      />
    </div>
  );
}

function FinancialView({ 
  payments, 
  members, 
  expenses,
  otherIncome,
  initialBalance,
  stats,
  onToggleStatus,
  onUpdatePayment,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddOtherIncome,
  onDeleteOtherIncome,
  onUpdateInitialBalance,
  onRegisterRetroactive,
  onGenerateMassDebts,
  isAdmin,
  associationInfo
}: { 
  payments: Payment[]; 
  members: Member[]; 
  expenses: Expense[];
  otherIncome: OtherIncome[];
  initialBalance: number;
  stats: any;
  onToggleStatus: (id: string, amount?: number, method?: PaymentMethod) => void;
  onUpdatePayment: (id: string, updates: Partial<Payment>) => void;
  onAddExpense: any;
  onUpdateExpense: any;
  onDeleteExpense: any;
  onAddOtherIncome: (description: string, amount: number, date: string, category: OtherIncomeCategory, paymentMethod: PaymentMethod, notes?: string) => void;
  onDeleteOtherIncome: (id: string) => void;
  onUpdateInitialBalance: (val: number) => void;
  onRegisterRetroactive: (memberId: string, month: number, year: number, amount: number, method: PaymentMethod, date: string, notes?: string, status?: PaymentStatus, origem?: string) => void;
  onGenerateMassDebts: () => void;
  isAdmin: boolean;
  associationInfo?: AssociationInfo;
}) {
  const [activeSubTab, setActiveSubTab] = useState<'payments' | 'expenses' | 'other' | 'settings'>('payments');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pago' | 'Pendente'>('Todos');
  const [methodFilter, setMethodFilter] = useState<'Todos' | PaymentMethod>('Todos');
  const [memberFilter, setMemberFilter] = useState<string>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<'Todos' | ExpenseCategory>('Todos');
  const [otherCategoryFilter, setOtherCategoryFilter] = useState<'Todos' | OtherIncomeCategory>('Todos');
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isOtherIncomeModalOpen, setIsOtherIncomeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRetroactiveModalOpen, setIsRetroactiveModalOpen] = useState(false);
  const [isRetroactiveDebtModalOpen, setIsRetroactiveDebtModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<OtherIncome | null>(null);
  const [isIncomeConfirmOpen, setIsIncomeConfirmOpen] = useState(false);
  const [tempInitialBalance, setTempInitialBalance] = useState(initialBalance.toString());

  const filteredPayments = useMemo(() => payments.filter(p => 
    (memberFilter === 'Todos' || p.memberId === memberFilter) &&
    (p.month === filterMonth && p.year === filterYear) &&
    (statusFilter === 'Todos' || p.status === statusFilter) &&
    (methodFilter === 'Todos' || p.paymentMethod === methodFilter)
  ), [payments, memberFilter, filterMonth, filterYear, statusFilter, methodFilter]);

  const filteredExpenses = useMemo(() => (expenses || []).filter(e => {
    const d = parseISO(e.date);
    return d.getMonth() === filterMonth && 
           d.getFullYear() === filterYear &&
           (categoryFilter === 'Todos' || e.category === categoryFilter);
  }), [expenses, filterMonth, filterYear, categoryFilter]);

  const filteredOtherIncome = useMemo(() => (otherIncome || []).filter(i => {
    const d = parseISO(i.date);
    return d.getMonth() === filterMonth && 
           d.getFullYear() === filterYear &&
           (otherCategoryFilter === 'Todos' || i.category === otherCategoryFilter) &&
           (methodFilter === 'Todos' || i.paymentMethod === methodFilter);
  }), [otherIncome, filterMonth, filterYear, otherCategoryFilter, methodFilter]);

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Desconhecido';

  // --- Strict Financial Calculations (Source of Truth) ---
  
  // 1. Current Month Totals
  const totalMembershipIncome = filteredPayments
    .filter(p => p.status === 'Pago')
    .reduce((acc, p) => acc + p.amount, 0);
    
  const totalOtherIncomeVal = filteredOtherIncome
    .reduce((acc, i) => acc + i.amount, 0);
    
  const currentMonthIncome = totalMembershipIncome + totalOtherIncomeVal;
  const currentMonthExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const currentMonthResult = currentMonthIncome - currentMonthExpenses;

  // 2. Accumulated History (Saldo Anterior)
  const previousBalance = useMemo(() => {
    const membershipIncomeBefore = payments
      .filter(p => p.status === 'Pago' && (
        p.year < filterYear || (p.year === filterYear && p.month < filterMonth)
      ))
      .reduce((acc, p) => acc + p.amount, 0);

    const otherIncomeBefore = (otherIncome || [])
      .filter(i => {
        const d = parseISO(i.date);
        return d.getFullYear() < filterYear || (d.getFullYear() === filterYear && d.getMonth() < filterMonth);
      })
      .reduce((acc, i) => acc + i.amount, 0);
      
    const expensesBefore = (expenses || [])
      .filter(e => {
        const d = parseISO(e.date);
        return d.getFullYear() < filterYear || (d.getFullYear() === filterYear && d.getMonth() < filterMonth);
      })
      .reduce((acc, e) => acc + e.amount, 0);

    return initialBalance + membershipIncomeBefore + otherIncomeBefore - expensesBefore;
  }, [payments, otherIncome, expenses, initialBalance, filterMonth, filterYear]);

  // 3. Current Total Balance
  const currentTotalBalance = previousBalance + currentMonthResult;

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [financialFeedback, setFinancialFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (financialFeedback) {
      const timer = setTimeout(() => setFinancialFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [financialFeedback]);

  const handleSaveInitialBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempInitialBalance);
    if (!isNaN(val)) {
      onUpdateInitialBalance(val);
      setFinancialFeedback({ type: 'success', message: 'Saldo inicial atualizado com sucesso!' });
    } else {
      setFinancialFeedback({ type: 'error', message: 'Por favor, insira um valor válido.' });
    }
  };

  const handleResetInitialBalance = () => {
    setTempInitialBalance('0');
    onUpdateInitialBalance(0);
    setIsResetConfirmOpen(false);
    setFinancialFeedback({ type: 'success', message: 'Saldo inicial zerado!' });
  };

  const handleExportPDF = () => {
    if (memberFilter === 'Todos') return;
    
    const member = members.find(m => m.id === memberFilter);
    if (!member) return;

    const doc = new jsPDF();
    const title = `Extrato de Mensalidades - ${member.name}`;
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    doc.text(`Status do Sócio: ${member.status}`, 14, 35);
    doc.text(`Valor Mensal: ${formatCurrency(member.monthlyFee)}`, 14, 40);

    const tableData = filteredPayments.map(p => [
      format(new Date(p.year, p.month, 1), 'MMMM yyyy', { locale: ptBR }),
      formatCurrency(p.amount),
      p.status,
      p.paidAt ? format(parseISO(p.paidAt), 'dd/MM/yyyy') : '-',
      p.paymentMethod || '-'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Mês de Referência', 'Valor', 'Status', 'Data Pagto', 'Forma']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [241, 245, 249] }
    });

    doc.save(`extrato-${member.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const handleGenerateAuditReport = () => {
    const doc = new jsPDF();
    const info = associationInfo || { nome: 'Gavião FC', cnpj: '', endereco: '', contato: '' };
    const monthName = format(new Date(filterYear, filterMonth, 1), 'MMMM yyyy', { locale: ptBR });

    // Cabeçalho Profissional com Logo
    doc.setFillColor(30, 41, 59); // Azul Marinho Slate-900
    doc.rect(0, 0, 210, 45, 'F');
    
    // Adicionar Logo
    const addLogoToPdf = (docInstance: any, x: number, y: number, w: number, h: number, isWatermark = false) => {
      try {
        if (isWatermark) {
          // Salva o estado atual, aplica transparência (8%) e depois restaura
          docInstance.saveGraphicsState();
          docInstance.setGState(new (docInstance as any).GState({ opacity: 0.08 }));
          docInstance.addImage(LINK_CLUB_LOGO, 'PNG', x, y, w, h, undefined, 'FAST');
          docInstance.restoreGraphicsState();
        } else {
          docInstance.addImage(LINK_CLUB_LOGO, 'PNG', x, y, w, h, undefined, 'MEDIUM');
        }
      } catch (e) {
        console.warn("Escudo não pôde ser carregado no PDF", e);
      }
    };

    addLogoToPdf(doc, 12, 8, 30, 30);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(info.nome.toUpperCase(), 48, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RELATÓRIO DE AUDITORIA FINANCEIRA PROFISSIONAL', 48, 30);
    doc.text(`MÊS DE REFERÊNCIA: ${monthName.toUpperCase()}`, 48, 37);
    
    doc.setFontSize(8);
    doc.text(`CNPJ: ${info.cnpj || 'Não Informado'}`, 150, 18);
    doc.text(`Endereço: ${info.endereco || 'Não Informado'}`, 150, 23);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 150, 28);

    // Marca d'água no fundo (Centralizada e grande)
    addLogoToPdf(doc, 55, 100, 100, 100, true);

    // 1. Resumo de Receitas
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. RESUMO DE RECEITAS', 14, 60);

    // Linha destacada Mensalidades
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 65, 182, 12, 'F');
    doc.setFontSize(10);
    doc.text('TOTAL DE MENSALIDADES (SÓCIOS):', 18, 73);
    doc.text(formatCurrency(totalMembershipIncome), 190, 73, { align: 'right' });

    // Outras Receitas
    doc.setFontSize(12);
    doc.text('DETALHAMENTO DE OUTRAS RECEITAS:', 14, 90);
    
    const otherIncomeData = filteredOtherIncome.map(i => [
      format(parseISO(i.date), 'dd/MM/yyyy'),
      i.description,
      i.category,
      formatCurrency(i.amount)
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Data', 'Descrição', 'Categoria', 'Valor']],
      body: otherIncomeData.length > 0 ? otherIncomeData : [['-', 'Nenhuma outra receita no período', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 8 },
    });

    // 2. Detalhamento de Despesas
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('2. DETALHAMENTO DE DESPESAS (AUDITORIA)', 14, finalY);

    const expenseData = filteredExpenses.map(e => [
      format(parseISO(e.date), 'dd/MM/yyyy'),
      e.description,
      e.category,
      formatCurrency(e.amount)
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Data', 'Descrição Detalhada', 'Categoria', 'Valor']],
      body: expenseData.length > 0 ? expenseData : [['-', 'Nenhuma despesa registrada no período', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [185, 28, 28] }, // Vermelho para despesas
      styles: { fontSize: 8 },
    });

    // 3. Fechamento do Mês
    const closingY = (doc as any).lastAutoTable.finalY + 20;
    
    const checkPageBreak = (yValue: number) => {
      if (yValue > 240) {
        doc.addPage();
        return 20;
      }
      return yValue;
    };

    const boxY = checkPageBreak(closingY);

    doc.setFillColor(30, 41, 59);
    doc.rect(14, boxY, 182, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FECHAMENTO DO MÊS', 18, boxY + 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`SALDO ANTERIOR AO MÊS:`, 18, boxY + 22);
    doc.text(formatCurrency(previousBalance), 190, boxY + 22, { align: 'right' });
    
    doc.text(`TOTAL DE ENTRADAS NO MÊS (+):`, 18, boxY + 28);
    doc.text(formatCurrency(currentMonthIncome), 190, boxY + 28, { align: 'right' });
    
    doc.text(`TOTAL DE SAÍDAS NO MÊS (-):`, 18, boxY + 34);
    doc.text(formatCurrency(currentMonthExpenses), 190, boxY + 34, { align: 'right' });
    
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(18, boxY + 38, 190, boxY + 38);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 211, 153); // Emerald-400
    doc.text(`SALDO ATUAL EM CAIXA:`, 18, boxY + 45);
    doc.text(formatCurrency(currentTotalBalance), 190, boxY + 45, { align: 'right' });

    doc.save(`auditoria-${monthName.replace(/\s+/g, '-')}.pdf`);
  };

  const handleGenerateReceipt = (payment: Payment, action: 'download' | 'whatsapp') => {
    const member = members.find(m => m.id === payment.memberId);
    if (!member) return;

    const info = associationInfo || { nome: 'Associação Gavião FC', cnpj: '', endereco: '', contato: '' };
    
    // Receipt dimensions: 100mm x 150mm (compact/mobile friendly)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150]
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Decorative border
    doc.setDrawColor(30, 41, 59); // Dark blue / Slate-900
    doc.setLineWidth(1.5);
    doc.rect(2, 2, pageWidth - 4, pageHeight - 4);
    
    doc.setDrawColor(218, 165, 32); // Gold / Goldenrod
    doc.setLineWidth(0.5);
    doc.rect(3.5, 3.5, pageWidth - 7, pageHeight - 7);

    // 2. Header
    try {
      doc.addImage(LINK_CLUB_LOGO, 'PNG', pageWidth / 2 - 12, 10, 24, 24);
    } catch (e) {
      console.warn("Logo could not be loaded");
    }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(info.nome.toUpperCase(), pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(184, 134, 11); // Dark Goldenrod
    doc.text('COMPROVANTE DE PAGAMENTO', pageWidth / 2, 48, { align: 'center' });

    // 3. Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(10, 52, pageWidth - 10, 52);

    // 4. Body Text
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const bodyText = `Recebemos de ${member.name}, a importância de ${formatCurrency(payment.amount)}, referente à mensalidade do mês de ${format(new Date(payment.year, payment.month, 1), 'MMMM yyyy', { locale: ptBR })}.`;
    const splitText = doc.splitTextToSize(bodyText, pageWidth - 20);
    doc.text(splitText, 10, 62);

    // 5. Details Table
    doc.setFillColor(248, 250, 252);
    doc.rect(10, 80, pageWidth - 20, 30, 'F');
    doc.setDrawColor(218, 165, 32);
    doc.line(10, 80, pageWidth - 10, 80);

    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO PAGAMENTO', 12, 85);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const paidDate = payment.paidAt ? format(parseISO(payment.paidAt), 'dd/MM/yyyy HH:mm') : format(new Date(), 'dd/MM/yyyy HH:mm');
    doc.text(`Data/Hora: ${paidDate}`, 12, 92);
    doc.text(`Forma de Pagto: ${payment.paymentMethod || 'Pix'}`, 12, 97);
    doc.text(`Recibo Nº: ${payment.id.substring(0, 8).toUpperCase()}`, 12, 102);
    doc.text(`Status: CONFIRMADO`, 12, 107);

    // 6. Signature
    doc.line(30, 130, pageWidth - 30, 130);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Gil Santos - Tesoureiro', pageWidth / 2, 135, { align: 'center' });
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Obrigado pela sua contribuição!', pageWidth / 2, 142, { align: 'center' });

    if (action === 'download') {
      doc.save(`recibo-${member.name.toLowerCase().replace(/\s+/g, '-')}-${payment.id.substring(0, 4)}.pdf`);
    } else {
      // WhatsApp Share
      const message = `Olá! Segue seu recibo de mensalidade da Gavião FC referente a ${format(new Date(payment.year, payment.month, 1), 'MMMM yyyy', { locale: ptBR })}.`;
      const phone = member.phone?.replace(/\D/g, '');
      if (!phone) {
        setFinancialFeedback({ type: 'error', message: 'Telefone do sócio não cadastrado!' });
        return;
      }
      
      // Since we can't directly attach PDF to WA API without a public URL, 
      // we share the link to download or just the message.
      // In a real web app, we might upload to cloud storage first.
      // For now, we'll download AND open WA with the message.
      doc.save(`recibo-${member.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (

    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-700/50">
        <button 
          onClick={() => setActiveSubTab('payments')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeSubTab === 'payments' ? "text-blue-500" : "text-slate-400 hover:text-slate-200"
          )}
        >
          Mensalidades
          {activeSubTab === 'payments' && (
            <motion.div layoutId="subtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('other')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeSubTab === 'other' ? "text-emerald-500" : "text-slate-400 hover:text-slate-200"
          )}
        >
          Outras Receitas
          {activeSubTab === 'other' && (
            <motion.div layoutId="subtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('expenses')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeSubTab === 'expenses' ? "text-red-500" : "text-slate-400 hover:text-slate-200"
          )}
        >
          Despesas
          {activeSubTab === 'expenses' && (
            <motion.div layoutId="subtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('settings')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            activeSubTab === 'settings' ? "text-amber-500" : "text-slate-400 hover:text-slate-200"
          )}
        >
          Configurações Financeiras
          {activeSubTab === 'settings' && (
            <motion.div layoutId="subtab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
      </div>

      {activeSubTab !== 'settings' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Exibindo dados de: {format(new Date(filterYear, filterMonth, 1), 'MMMM/yyyy', { locale: ptBR })}
                </p>
              </div>
              <select 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(Number(e.target.value))}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                  </option>
                ))}
              </select>
              <select 
                value={filterYear} 
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {isAdmin && (
                <Button 
                  onClick={handleGenerateAuditReport}
                  className="bg-blue-600 hover:bg-blue-500 text-white gap-2 h-10 px-4 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                  <FileDown size={18} />
                  Relatório de Auditoria (PDF)
                </Button>
              )}

              {activeSubTab === 'payments' && (
                <select 
                  value={memberFilter} 
                  onChange={(e) => setMemberFilter(e.target.value)}
                  className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none max-w-[200px]"
                >
                  <option value="Todos">Todos os Sócios</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}

              {activeSubTab === 'payments' ? (
                <div className="flex flex-wrap gap-2">
                  <div className="flex bg-[#1e293b] border border-slate-700 rounded-lg p-1">
                    {(['Todos', 'Pago', 'Pendente'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={cn(
                          "px-4 py-1 rounded-md text-xs font-medium transition-all",
                          statusFilter === s ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <select 
                    value={methodFilter} 
                    onChange={(e) => setMethodFilter(e.target.value as any)}
                    className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="Todos">Todas Formas</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              ) : activeSubTab === 'other' ? (
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={otherCategoryFilter} 
                    onChange={(e) => setOtherCategoryFilter(e.target.value as any)}
                    className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="Todos">Todas Categorias</option>
                    <option value="Patrocínio">Patrocínio</option>
                    <option value="Doação">Doação</option>
                    <option value="Evento">Evento</option>
                    <option value="Venda">Venda</option>
                    <option value="Contribuição">Contribuição</option>
                    <option value="Outros">Outros</option>
                  </select>
                  <select 
                    value={methodFilter} 
                    onChange={(e) => setMethodFilter(e.target.value as any)}
                    className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="Todos">Todas Formas</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              ) : (
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="Todos">Todas Categorias</option>
                  <option value="Campo">Campo</option>
                  <option value="Equipamento">Equipamento</option>
                  <option value="Staff">Staff</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Outros">Outros</option>
                </select>
              )}
            </div>

            {activeSubTab === 'payments' && isAdmin && (
              <div className="flex gap-2">
                <Button onClick={() => setIsRetroactiveModalOpen(true)} variant="secondary">
                  <Plus size={18} />
                  Lanço Retroativo
                </Button>
                <Button onClick={() => setIsRetroactiveDebtModalOpen(true)} variant="ghost" className="border border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <AlertTriangle size={18} />
                  Débito de Emergência
                </Button>
              </div>
            )}

            {activeSubTab === 'payments' && memberFilter !== 'Todos' && isAdmin && (
              <Button 
                variant="success" 
                onClick={() => {
                  const pending = filteredPayments.filter(p => p.status === 'Pendente');
                  if (pending.length > 0) {
                    pending.forEach(p => onToggleStatus(p.id, p.amount, 'PIX'));
                  }
                }}
                disabled={filteredPayments.filter(p => p.status === 'Pendente').length === 0}
              >
                <Zap size={18} />
                Quitar Tudo
              </Button>
            )}

            {activeSubTab === 'payments' && memberFilter !== 'Todos' && (
              <Button variant="ghost" onClick={handleExportPDF}>
                <FileDown size={18} />
                Exportar PDF
              </Button>
            )}

            {activeSubTab === 'expenses' && isAdmin && (
              <Button onClick={() => { setEditingExpense(null); setIsExpenseModalOpen(true); }} variant="danger">
                <Plus size={18} />
                Nova Despesa
              </Button>
            )}

            {activeSubTab === 'other' && isAdmin && (
              <Button onClick={() => setIsOtherIncomeModalOpen(true)} variant="success">
                <Plus size={18} />
                Nova Receita
              </Button>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-500">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Inicial</p>
                <p className="text-lg font-black text-white">{formatCurrency(initialBalance)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Shield className="text-blue-500" size={20} />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entradas no Mês</p>
                <p className="text-lg font-black text-emerald-500">{formatCurrency(currentMonthIncome)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="text-emerald-500" size={20} />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border-l-4 border-l-red-500">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saídas no Mês</p>
                <p className="text-lg font-black text-red-500">{formatCurrency(currentMonthExpenses)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrendingUp className="text-red-500 rotate-180" size={20} />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-600">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Final (Acumulado)</p>
                <p className={cn("text-lg font-black", currentTotalBalance >= 0 ? "text-blue-400" : "text-red-400")}>
                  {formatCurrency(currentTotalBalance)}
                </p>
              </div>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", currentTotalBalance >= 0 ? "bg-blue-600/10" : "bg-red-600/10")}>
                <DollarSign className={currentTotalBalance >= 0 ? "text-blue-600" : "text-red-600"} size={20} />
              </div>
            </Card>
          </div>

          {/* Monthly Breakdown Bonus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400">
                  <TrendingUp size={16} className="rotate-90" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saldo Anterior (Acumulado)</p>
                  <p className="text-sm font-bold text-slate-300">{formatCurrency(previousBalance)}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", currentMonthResult >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                  <TrendingUp size={16} className={currentMonthResult >= 0 ? "" : "rotate-180"} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resultado do Mês Atual</p>
                  <p className={cn("text-sm font-bold", currentMonthResult >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {currentMonthResult >= 0 ? '+' : ''}{formatCurrency(currentMonthResult)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Summary */}
          {(activeSubTab === 'payments' || activeSubTab === 'other') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['PIX', 'Cartão', 'Dinheiro', 'Cheque'].map((method) => {
                const membershipTotal = payments
                  .filter(p => p.month === filterMonth && p.year === filterYear && p.status === 'Pago' && p.paymentMethod === method)
                  .reduce((acc, p) => acc + p.amount, 0);
                
                const otherTotal = otherIncome
                  .filter(i => {
                    const d = parseISO(i.date);
                    return d.getMonth() === filterMonth && d.getFullYear() === filterYear && i.paymentMethod === method;
                  })
                  .reduce((acc, i) => acc + i.amount, 0);

                const total = membershipTotal + otherTotal;

                return (
                  <div key={method} className="p-3 bg-slate-800/20 rounded-lg border border-slate-700/30">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{method}</p>
                    <p className="text-sm font-bold text-slate-200">{formatCurrency(total)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeSubTab === 'settings' ? (
        <Card className="p-8 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6 relative">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <DollarSign className="text-amber-500" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Configurações Financeiras</h3>
              <p className="text-xs text-slate-400">Defina o saldo inicial do caixa da associação.</p>
            </div>

            {/* Feedback Toast */}
            <AnimatePresence>
              {financialFeedback && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "absolute right-0 top-0 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 z-50",
                    financialFeedback.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  )}
                >
                  {financialFeedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  {financialFeedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSaveInitialBalance} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Inicial em Caixa (R$)</label>
              <input 
                type="number"
                step="0.01"
                value={tempInitialBalance}
                onChange={(e) => setTempInitialBalance(e.target.value)}
                placeholder="0,00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <div className="pt-2 flex gap-3">
              {isAdmin && (
                <>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setIsResetConfirmOpen(true)}
                  >
                    Resetar
                  </Button>
                  <Button type="submit" className="flex-1">Salvar Saldo</Button>
                </>
              )}
              {!isAdmin && (
                <div className="w-full text-center p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                   <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Acesso Somente Leitura</p>
                </div>
              )}
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
            <AlertTriangle className="text-blue-500 shrink-0" size={20} />
            <p className="text-[11px] text-blue-200/70 leading-relaxed">
              O <strong>Saldo Inicial</strong> representa o dinheiro que a associação já possuía em caixa antes do início dos registros neste sistema. O Saldo Atual será calculado somando este valor a todas as mensalidades pagas e subtraindo todas as despesas registradas.
            </p>
          </div>
        </Card>
      ) : activeSubTab === 'other' ? (
        <Card>
          <ResponsiveTable<OtherIncome>
            data={filteredOtherIncome}
            emptyMessage="Nenhuma receita encontrada para este período."
            columns={[
              { header: "Data", render: (income: OtherIncome) => <span className="text-slate-400 text-sm">{format(parseISO(income.date), 'dd/MM/yyyy')}</span> },
              { 
                header: "Descrição", 
                render: (income: OtherIncome) => (
                  <div>
                    <p className="font-medium text-white">{income.description}</p>
                    {income.notes && <p className="text-xs text-slate-500 mt-0.5">{income.notes}</p>}
                  </div>
                )
              },
              { 
                header: "Categoria", 
                render: (income: OtherIncome) => (
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{income.category}</Badge>
                  </div>
                )
              },
              { header: "Valor", render: (income: OtherIncome) => <span className="text-emerald-400 font-bold">{formatCurrency(income.amount)}</span> },
              { 
                header: "Forma", 
                render: (income: OtherIncome) => (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    {income.paymentMethod}
                  </div>
                )
              },
              { header: "Usuário", render: (income: OtherIncome) => <span className="text-slate-400 text-xs">{income.createdBy}</span> },
              { 
                header: "Ações", 
                className: "text-right",
                render: (income: OtherIncome) => (
                  isAdmin && (
                    <button 
                      onClick={() => { setIncomeToDelete(income); setIsIncomeConfirmOpen(true); }}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )
                )
              }
            ]}
            renderCard={(income: OtherIncome) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{income.description}</p>
                    <p className="text-xs text-slate-400">{format(parseISO(income.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <Badge variant="neutral">{income.category}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{income.paymentMethod}</span>
                    <span>•</span>
                    <span>{income.createdBy}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{formatCurrency(income.amount)}</span>
                </div>
                {isAdmin && (
                  <Button 
                    variant="danger" 
                    className="w-full h-11"
                    onClick={() => { setIncomeToDelete(income); setIsIncomeConfirmOpen(true); }}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                )}
              </div>
            )}
          />
        </Card>
      ) : activeSubTab === 'payments' ? (
        <Card>
          <ResponsiveTable<Payment>
            data={filteredPayments}
            emptyMessage="Nenhum pagamento encontrado para este período."
            columns={[
              {
                header: "Sócio / Ref",
                render: (payment: Payment) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {getMemberName(payment.memberId).charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{getMemberName(payment.memberId)}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {format(new Date(payment.year, payment.month, 1), 'MMMM yyyy', { locale: ptBR })}
                        </p>
                        {payment.origem === 'debito_manual' && (
                          <span className="text-[8px] px-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded uppercase font-bold">Débito Retroativo</span>
                        )}
                        {payment.origem === 'automacao_massa' && (
                          <span className="text-[8px] px-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded uppercase font-bold">Gerado em Massa</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              },
              {
                header: "Vencimento",
                render: (payment: Payment) => <span className="text-slate-400 text-sm">{format(parseISO(payment.dueDate), 'dd/MM/yyyy')}</span>
              },
              {
                header: "Valor",
                render: (payment: Payment) => (
                  <span className={cn("text-slate-300 font-bold", payment.isEdited && "text-amber-400")}>
                    {formatCurrency(payment.amount)}
                  </span>
                )
              },
              {
                header: "Pagamento",
                render: (payment: Payment) => (
                  payment.status === 'Pago' ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                        {payment.paymentMethod === 'PIX' && <Zap size={12} className="text-emerald-500" />}
                        {payment.paymentMethod === 'Cartão' && <CreditCard size={12} className="text-blue-500" />}
                        {payment.paymentMethod === 'Dinheiro' && <DollarSign size={12} className="text-amber-500" />}
                        {payment.paymentMethod === 'Cheque' && <FileText size={12} className="text-slate-400" />}
                        <span>{payment.paymentMethod}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{payment.paidAt ? format(parseISO(payment.paidAt), 'dd/MM/yy HH:mm') : '-'}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">Aguardando...</span>
                  )
                )
              },
              {
                header: "Status",
                render: (payment: Payment) => (
                  <Badge variant={payment.status === 'Pago' ? 'success' : 'danger'}>
                    {payment.status}
                  </Badge>
                )
              },
              {
                header: "Ação",
                className: "text-right",
                render: (payment: Payment) => (
                  <div className="flex justify-end gap-2">
                    {payment.status === 'Pago' && (
                      <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/50">
                        <button 
                          onClick={() => handleGenerateReceipt(payment, 'download')}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                          title="Baixar Recibo"
                        >
                          <Printer size={16} />
                        </button>
                        <button 
                          onClick={() => handleGenerateReceipt(payment, 'whatsapp')}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    )}
                    {isAdmin && (

                      <>
                        <button 
                          onClick={() => { setSelectedPayment(payment); setIsPaymentModalOpen(true); }}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <Button 
                          variant={payment.status === 'Pago' ? 'secondary' : 'success'} 
                          className="text-xs py-1.5"
                          onClick={() => {
                            if (payment.status === 'Pendente') {
                              setSelectedPayment(payment);
                              setIsPaymentModalOpen(true);
                            } else {
                              onToggleStatus(payment.id);
                            }
                          }}
                        >
                          {payment.status === 'Pago' ? 'Estornar' : 'Marcar Pago'}
                        </Button>
                      </>
                    )}
                  </div>
                )
              }
            ]}
            renderCard={(payment: Payment) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {getMemberName(payment.memberId).charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{getMemberName(payment.memberId)}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {format(new Date(payment.year, payment.month, 1), 'MMMM yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={payment.status === 'Pago' ? 'success' : 'danger'}>
                    {payment.status}
                  </Badge>
                </div>
                
                {payment.status === 'Pago' && (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 h-10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => handleGenerateReceipt(payment, 'download')}
                    >
                      <Printer size={16} />
                      Recibo
                    </Button>
                    <Button 
                      variant="ghost"
                      className="flex-1 h-10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => handleGenerateReceipt(payment, 'whatsapp')}
                    >
                      <MessageSquare size={16} />
                      WhatsApp
                    </Button>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-700/50">

                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Vencimento</p>
                    <p className="text-xs text-slate-300">{format(parseISO(payment.dueDate), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">Valor</p>
                    <p className="text-xs font-bold text-white">{formatCurrency(payment.amount)}</p>
                  </div>
                  {payment.status === 'Pago' && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-500 uppercase">Pagamento</p>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span>{payment.paymentMethod}</span>
                        <span className="text-slate-500">•</span>
                        <span>{payment.paidAt ? format(parseISO(payment.paidAt), 'dd/MM/yy HH:mm') : '-'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      className="flex-1 h-11"
                      onClick={() => { setSelectedPayment(payment); setIsPaymentModalOpen(true); }}
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                    <Button 
                      variant={payment.status === 'Pago' ? 'secondary' : 'success'} 
                      className="flex-[2] h-11"
                      onClick={() => {
                        if (payment.status === 'Pendente') {
                          setSelectedPayment(payment);
                          setIsPaymentModalOpen(true);
                        } else {
                          onToggleStatus(payment.id);
                        }
                      }}
                    >
                      {payment.status === 'Pago' ? 'Estornar' : 'Marcar Pago'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          />
        </Card>
      ) : (
        <Card>
          <ResponsiveTable<Expense>
            data={filteredExpenses}
            emptyMessage="Nenhuma despesa encontrada para este período."
            columns={[
              { 
                header: "Descrição", 
                render: (expense: Expense) => (
                  <div>
                    <p className="font-medium text-white">{expense.description}</p>
                    {expense.notes && <p className="text-xs text-slate-500 mt-0.5">{expense.notes}</p>}
                  </div>
                )
              },
              { header: "Categoria", render: (expense: Expense) => <Badge variant="neutral">{expense.category}</Badge> },
              { header: "Data", render: (expense: Expense) => <span className="text-slate-400 text-sm">{format(parseISO(expense.date), 'dd/MM/yyyy')}</span> },
              { header: "Valor", render: (expense: Expense) => <span className="text-red-400 font-bold">{formatCurrency(expense.amount)}</span> },
              { 
                header: "Ações", 
                className: "text-right",
                render: (expense: Expense) => (
                  <div className="flex items-center justify-end gap-2">
                    {isAdmin && (
                      <>
                        <button 
                          onClick={() => { setEditingExpense(expense); setIsExpenseModalOpen(true); }}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )
              }
            ]}
            renderCard={(expense: Expense) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{expense.description}</p>
                    <p className="text-xs text-slate-400">{format(parseISO(expense.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <Badge variant="neutral">{expense.category}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500">Valor da Despesa</p>
                  <span className="text-red-400 font-bold">{formatCurrency(expense.amount)}</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      className="flex-1 h-11"
                      onClick={() => { setEditingExpense(expense); setIsExpenseModalOpen(true); }}
                    >
                      <Edit2 size={16} />
                      Editar
                    </Button>
                    <Button 
                      variant="danger" 
                      className="flex-1 h-11"
                      onClick={() => onDeleteExpense(expense.id)}
                    >
                      <Trash2 size={16} />
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            )}
          />
        </Card>
      )}

      {/* Retroactive Payment Modal */}
      <AnimatePresence>
        {isRetroactiveDebtModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={20} />
                  <h3 className="text-lg font-bold text-white">Lançar Débito Retroativo</h3>
                </div>
                <button onClick={() => setIsRetroactiveDebtModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const memberId = formData.get('memberId') as string;
                const month = Number(formData.get('month'));
                const year = Number(formData.get('year'));
                const amount = Number(formData.get('amount'));
                const notes = formData.get('notes') as string;
                
                onRegisterRetroactive(memberId, month, year, amount, 'Dinheiro', '', notes, 'Pendente', 'debito_manual');
                setIsRetroactiveDebtModalOpen(false);
              }} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sócio</label>
                  <select 
                    name="memberId"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Selecione o sócio</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mês</label>
                    <select 
                      name="month"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i}>{format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ano</label>
                    <select 
                      name="year"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor do Débito (R$)</label>
                  <input 
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Observação</label>
                  <textarea 
                    name="notes"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                    placeholder="Ex: Multa por atraso, taxa extra..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsRetroactiveDebtModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" variant="danger" className="flex-1">Lançar Débito</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {isRetroactiveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Registrar Pagamento Retroativo</h3>
                <button onClick={() => setIsRetroactiveModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const memberId = formData.get('memberId') as string;
                const month = Number(formData.get('month'));
                const year = Number(formData.get('year'));
                const amount = Number(formData.get('amount'));
                const method = formData.get('method') as PaymentMethod;
                const date = formData.get('date') as string;
                const notes = formData.get('notes') as string;
                
                onRegisterRetroactive(memberId, month, year, amount, method, date, notes);
                setIsRetroactiveModalOpen(false);
              }} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sócio</label>
                  <select 
                    name="memberId"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="">Selecione o sócio</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mês</label>
                    <select 
                      name="month"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i}>{format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ano</label>
                    <select 
                      name="year"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor (R$)</label>
                    <input 
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data do Pagamento</label>
                    <input 
                      name="date"
                      type="date"
                      required
                      defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Forma de Pagamento</label>
                  <select 
                    name="method"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsRetroactiveModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1">Registrar Pagamento</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  {selectedPayment.status === 'Pago' ? 'Editar Pagamento' : 'Confirmar Pagamento'}
                </h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const amount = parseFloat(formData.get('amount') as string);
                const method = formData.get('method') as PaymentMethod;
                
                if (selectedPayment.status === 'Pendente') {
                  onToggleStatus(selectedPayment.id, amount, method);
                } else {
                  onUpdatePayment(selectedPayment.id, { amount, paymentMethod: method });
                }
                
                setIsPaymentModalOpen(false);
                setSelectedPayment(null);
              }} className="p-6 space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Sócio</p>
                  <p className="text-sm font-bold text-white">{getMemberName(selectedPayment.memberId)}</p>
                  <p className="text-xs text-slate-400 mt-1">Ref: {format(new Date(selectedPayment.year, selectedPayment.month, 1), 'MMMM yyyy', { locale: ptBR })}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor do Pagamento (R$)</label>
                  <input 
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={selectedPayment.amount}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Forma de Pagamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['PIX', 'Cartão', 'Dinheiro', 'Cheque'] as const).map(m => (
                      <label key={m} className="relative cursor-pointer group">
                        <input 
                          type="radio" 
                          name="method" 
                          value={m} 
                          defaultChecked={selectedPayment.paymentMethod === m || (m === 'PIX' && !selectedPayment.paymentMethod)}
                          className="peer sr-only"
                        />
                        <div className="flex items-center gap-2 p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-400 transition-all hover:bg-slate-700/50">
                          {m === 'PIX' && <Zap size={16} />}
                          {m === 'Cartão' && <CreditCard size={16} />}
                          {m === 'Dinheiro' && <DollarSign size={16} />}
                          {m === 'Cheque' && <FileText size={16} />}
                          <span className="text-xs font-bold">{m}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1">
                    {selectedPayment.status === 'Pago' ? 'Salvar Alterações' : 'Confirmar Recebimento'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
                </h3>
                <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const description = formData.get('description') as string;
                const amount = Number(formData.get('amount'));
                const date = formData.get('date') as string;
                const category = formData.get('category') as ExpenseCategory;
                const notes = formData.get('notes') as string;
                
                if (editingExpense) {
                  onUpdateExpense(editingExpense.id, { description, amount, date, category, notes });
                } else {
                  onAddExpense(description, amount, date, category, notes);
                }
                setIsExpenseModalOpen(false);
              }} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Descrição</label>
                  <input 
                    name="description"
                    required
                    defaultValue={editingExpense?.description}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Ex: Aluguel do Campo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Valor (R$)</label>
                    <input 
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingExpense?.amount}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Data</label>
                    <input 
                      name="date"
                      type="date"
                      required
                      defaultValue={editingExpense ? format(parseISO(editingExpense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Categoria</label>
                  <select 
                    name="category"
                    defaultValue={editingExpense?.category || 'Campo'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Campo">Campo</option>
                    <option value="Equipamento">Equipamento</option>
                    <option value="Staff">Staff</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Observações (Opcional)</label>
                  <textarea 
                    name="notes"
                    defaultValue={editingExpense?.notes}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
                    placeholder="Detalhes adicionais..."
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setIsExpenseModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className={cn("flex-1", activeSubTab === 'expenses' ? "bg-red-600 hover:bg-red-500" : "")}>
                    Salvar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Other Income Modal */}
      <AnimatePresence>
        {isOtherIncomeModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOtherIncomeModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Nova Receita</h3>
                <button onClick={() => setIsOtherIncomeModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const description = formData.get('description') as string;
                const amount = Number(formData.get('amount'));
                const date = formData.get('date') as string;
                const category = formData.get('category') as OtherIncomeCategory;
                const method = formData.get('method') as PaymentMethod;
                const notes = formData.get('notes') as string;
                
                onAddOtherIncome(description, amount, date, category, method, notes);
                setIsOtherIncomeModalOpen(false);
              }} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Descrição</label>
                  <input 
                    name="description"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Ex: Patrocínio Empresa X"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Valor (R$)</label>
                    <input 
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Data</label>
                    <input 
                      name="date"
                      type="date"
                      required
                      defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Categoria</label>
                    <select 
                      name="category"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="Patrocínio">Patrocínio</option>
                      <option value="Doação">Doação</option>
                      <option value="Evento">Evento</option>
                      <option value="Venda">Venda</option>
                      <option value="Contribuição">Contribuição</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Forma de Pagamento</label>
                    <select 
                      name="method"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Observações (Opcional)</label>
                  <textarea 
                    name="notes"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
                    placeholder="Detalhes adicionais..."
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setIsOtherIncomeModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500">
                    Adicionar Receita
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão de Receita */}
      <AnimatePresence>
        {isIncomeConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIncomeConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Excluir Receita?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Tem certeza que deseja excluir a receita <strong>{incomeToDelete?.description}</strong>?
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setIsIncomeConfirmOpen(false)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" onClick={() => {
                  if (incomeToDelete) onDeleteOtherIncome(incomeToDelete.id);
                  setIsIncomeConfirmOpen(false);
                  setIncomeToDelete(null);
                }}>Excluir</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Reset de Saldo */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 p-6 text-center"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-amber-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Zerar Saldo Inicial?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Esta ação irá definir o saldo inicial como <span className="text-white font-bold">R$ 0,00</span>. Deseja continuar?
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setIsResetConfirmOpen(false)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" onClick={handleResetInitialBalance}>Zerar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsView({ 
  state, 
  setState, 
  isAdmin, 
  currentUser, 
  loggedUser,
  setLoggedUser
}: { 
  state: AppState; 
  setState: React.Dispatch<React.SetStateAction<AppState>>; 
  isAdmin: boolean; 
  currentUser: string | null;
  loggedUser: LoggedUser | null;
  setLoggedUser: React.Dispatch<React.SetStateAction<LoggedUser | null>>;
}) {
  const info = state.associationInfo || DEFAULT_ASSOCIATION_INFO;
  const [newUserName, setNewUserName] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    new: '',
    confirm: ''
  });
  const [personalNovaSenha, setPersonalNovaSenha] = useState('');
  const [personalConfirmarSenha, setPersonalConfirmarSenha] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newInfo: AssociationInfo = {
      nome: formData.get('nome') as string,
      cnpj: formData.get('cnpj') as string,
      endereco: formData.get('endereco') as string,
      contato: formData.get('contato') as string,
    };

    try {
      const { error } = await supabase.from('system_settings').update({
        association_name: newInfo.nome,
        association_cnpj: newInfo.cnpj,
        association_address: newInfo.endereco,
        association_contact: newInfo.contato
      }).eq('id', 'default');
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        associationInfo: newInfo
      }));

      setFeedback({ type: 'success', message: 'Configurações da associação salvas no banco!' });
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Erro ao salvar configurações: ' + err.message });
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newUser: User = {
      id: crypto.randomUUID(),
      name: newUserName.trim(),
      role: 'User',
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    setNewUserName('');
    setFeedback({ type: 'success', message: `Usuário ${newUser.name} cadastrado com sucesso!` });
  };

  const confirmDeleteUser = (id: string) => {
    const user = state.users.find(u => u.id === id);
    if (!user) return;

    // Proteção: Não permitir excluir o usuário logado
    if (user.name === currentUser) {
      setFeedback({ type: 'error', message: 'Não é possível excluir o usuário que está logado no momento.' });
      return;
    }

    // Proteção: Não permitir excluir o último administrador
    const adminUsers = state.users.filter(u => u.role === 'Admin');
    if (user.role === 'Admin' && adminUsers.length <= 1) {
      setFeedback({ type: 'error', message: 'Não é possível excluir o último administrador do sistema.' });
      return;
    }

    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;

    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userToDelete.id)
    }));
    
    setFeedback({ type: 'success', message: 'Usuário removido com sucesso!' });
    setIsConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      if (passwordForm.new !== passwordForm.confirm) {
        alert('As senhas não coincidem!');
        setIsUpdating(false);
        return;
      }

      if (passwordForm.new.length < 4) {
        alert('A nova senha deve ter pelo menos 4 caracteres.');
        setIsUpdating(false);
        return;
      }

      const novaSenha = passwordForm.new;

      // 1. FONTE ÚNICA DE VERDADE (Sincronização Total)
      if (isAdmin) {
        localStorage.setItem('GAVIAO_ADMIN_PASSWORD', JSON.stringify(novaSenha));
        localStorage.setItem('user_password', novaSenha);
        localStorage.setItem('SENHA_SISTEMA', novaSenha);
      } else {
        localStorage.setItem('SOCIO_LOCAL_PASSWORD', JSON.stringify(novaSenha));
      }

      // Sincronizar com AppState
      setState(prev => ({
        ...prev,
        systemPassword: novaSenha
      }));

      console.log('Nova senha gravada: ' + novaSenha);

      // 4. LOGOFF E REFRESH
      setTimeout(() => {
        alert('✅ Senha do sistema atualizada! Faça login novamente.');
        
        // Limpeza de Cache de Login
        localStorage.removeItem('usuario_logado');
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('isLoggedIn');
        
        // Forçar reload total do zero para ler nova senha
        window.location.href = window.location.origin;
      }, 500);

    } catch (error) {
      console.error('Erro ao atualizar senha global:', error);
      alert('Erro ao atualizar senha global.');
      setIsUpdating(false);
    }
  };

  const atualizarSenhaConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    
    try {
      console.log('🔥 NOVA FUNÇÃO DE SENHA EXECUTANDO');

      const novaSenha = personalNovaSenha.trim();
      const confirmarSenha = personalConfirmarSenha.trim();

      if (!novaSenha || !confirmarSenha) {
        alert('Preencha todos os campos!');
        setIsUpdating(false);
        return;
      }

      if (novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        setIsUpdating(false);
        return;
      }

      // 1. FONTE ÚNICA DE VERDADE
      if (isAdmin) {
        localStorage.setItem('GAVIAO_ADMIN_PASSWORD', JSON.stringify(novaSenha));
        localStorage.setItem('user_password', novaSenha);
      } else {
        localStorage.setItem('SOCIO_LOCAL_PASSWORD', JSON.stringify(novaSenha));
      }
      
      // 👤 ATUALIZA LISTA DE SÓCIOS PARA PERSISTÊNCIA FUTURA
      if (loggedUser && loggedUser.id) {
        // Sincronizar com AppState
        setState(prev => ({
          ...prev,
          members: prev.members.map(s => String(s.id) === String(loggedUser.id) ? { ...s, senha: novaSenha } : s)
        }));

        // Atualizar lista de sócios no LocalStorage (socios_lista)
        let lista = JSON.parse(localStorage.getItem("socios_lista") || "[]");
        lista = lista.map((s: any) => {
          if (String(s.id) === String(loggedUser.id)) {
            return { ...s, senha: novaSenha };
          }
          return s;
        });
        localStorage.setItem("socios_lista", JSON.stringify(lista));
      }

      console.log('Nova senha gravada: ' + novaSenha);

      // 4. LOGOFF E REFRESH
      setTimeout(() => {
        alert('✅ Senha pessoal atualizada! Faça login novamente com a nova senha.');
        
        // Limpeza de Cache de Login
        localStorage.removeItem('usuario_logado');
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('isLoggedIn');
        
        // Forçar reload total
        window.location.href = window.location.origin;
      }, 500);

    } catch (erro) {
      console.error('❌ ERRO REAL:', erro);
      alert('Erro ao atualizar senha');
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-3 mb-2 relative">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Settings className="text-blue-500" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Configurações do Sistema</h3>
          <p className="text-sm text-slate-400">Gerencie usuários, senhas e informações institucionais.</p>
        </div>

        {/* Feedback Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "absolute right-0 top-0 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 z-50",
                feedback.type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
              )}
            >
              {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Settings (For Members/Admin) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest">
            <Lock size={16} />
            {isAdmin ? 'Segurança Avançada' : 'Minha Segurança'}
          </div>
          <Card className="p-6 overflow-hidden relative border border-slate-700/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Lock size={14} className="text-blue-400" />
              {isAdmin ? 'Alterar Senha do Sistema (Admin)' : 'Alterar Minha Senha de Acesso'}
            </h4>
            <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
              {isAdmin 
                ? 'Defina a nova senha global para acesso total ao sistema.' 
                : 'Defina uma nova senha pessoal de acesso para o seu dispositivo.'}
            </p>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nova Senha</label>
                <div className="relative group">
                  <input 
                    type="password"
                    value={personalNovaSenha}
                    onChange={(e) => setPersonalNovaSenha(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600 group-hover:border-slate-600 font-mono"
                    placeholder="Nova senha..."
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmar Nova Senha</label>
                <div className="relative group">
                  <input 
                    type="password"
                    value={personalConfirmarSenha}
                    onChange={(e) => setPersonalConfirmarSenha(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600 group-hover:border-slate-600 font-mono"
                    placeholder="Repita a nova senha..."
                  />
                </div>
              </div>
              
              <Button 
                type="button" 
                disabled={isUpdating}
                onClick={atualizarSenhaConfig} 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black h-11 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-70 uppercase tracking-widest text-xs"
              >
                {isUpdating ? 'Processando...' : 'Salvar Nova Senha'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Association Info & User Management (ONLY ADMIN) */}
        {isAdmin && (
          <>
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest">
                <Shield size={16} />
                Dados da Associação
              </div>
              <Card className="p-6">
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome da Associação</label>
                    <input 
                      name="nome"
                      type="text"
                      required
                      defaultValue={info.nome}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">CNPJ</label>
                    <input 
                      name="cnpj"
                      type="text"
                      required
                      defaultValue={info.cnpj}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Endereço</label>
                    <input 
                      name="endereco"
                      type="text"
                      required
                      defaultValue={info.endereco}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contato</label>
                    <input 
                      name="contato"
                      type="text"
                      required
                      defaultValue={info.contato}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-2 uppercase font-black text-xs h-11 tracking-widest">Salvar Dados</Button>
                </form>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest">
                <UserIcon size={16} />
                Gerenciamento de Usuários
              </div>
              <Card className="p-6">
                <form onSubmit={handleAddUser} className="flex gap-2 mb-6">
                  <input 
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Nome do novo usuário..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <Button type="submit" className="font-bold">
                    <Plus size={18} />
                    Add
                  </Button>
                </form>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Usuários Cadastrados</h4>
                  {state.users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{user.role}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => confirmDeleteUser(user.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

      </div>

      {isAdmin && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-4">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <div className="text-sm text-amber-200/80 leading-relaxed">
            <p className="font-bold text-amber-400 mb-1">Atenção:</p>
            A senha do sistema é compartilhada entre todos os usuários cadastrados. Ao alterá-la, informe os demais membros da diretoria.
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Usuário */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
              <p className="text-slate-400 text-sm mb-6">
                Deseja realmente excluir o usuário <span className="text-white font-bold">"{userToDelete?.name}"</span>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
                <Button variant="danger" className="flex-1" onClick={handleDeleteUser}>Excluir</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InventoryView({ inventory, onAddItem, onUpdateItem, onDeleteItem, onRegisterOutflow, isAdmin }: { 
  inventory: InventoryItem[]; 
  onAddItem: (item: any) => void; 
  onUpdateItem: (id: string, updates: any) => void;
  onDeleteItem: (id: string) => void;
  onRegisterOutflow: (id: string, qty: number, reason: string, obs?: string) => void;
  isAdmin: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOutflowModalOpen, setIsOutflowModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalInvestment = inventory.reduce((acc, item) => acc + (item.purchaseValue || 0), 0);

  const getItemStatusColor = (expectancy: string) => {
    const today = new Date();
    const expDate = parseISO(expectancy);
    if (isBefore(expDate, today)) return 'bg-red-500/20 text-red-500 border-red-500/30';
    const nextMonth = addMonths(today, 2);
    if (isBefore(expDate, nextMonth)) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Patrimônio e Almoxarifado', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 28, { align: 'center' });

    autoTable(doc, {
      startY: 40,
      head: [['Item', 'Categoria', 'Qtd', 'Estado', 'Vlr. Compra', 'Exp. Troca']],
      body: inventory.map(item => [
        item.name,
        item.category,
        item.quantity.toString(),
        item.condition,
        formatCurrency(item.purchaseValue),
        format(parseISO(item.replacementExpectancy), 'MM/yyyy')
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(12);
    doc.text(`Valor Total Investido: ${formatCurrency(totalInvestment)}`, 14, finalY + 15);

    doc.save(`almoxarifado-${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/20">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <DollarSign className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Valor Patrimonial Total</p>
                <h3 className="text-2xl font-black text-white">{formatCurrency(totalInvestment)}</h3>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center">
                <Package className="text-slate-400 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total de Itens</p>
                <h3 className="text-2xl font-black text-white">{inventory.length}</h3>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50">
          <div className="p-6">
             <Button onClick={generatePDF} variant="secondary" className="w-full h-full py-4 bg-slate-700 hover:bg-slate-600 border border-slate-600">
                <FileText size={20} />
                Gerar Lista de Patrimônio (PDF)
             </Button>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="Todas">Todas Categorias</option>
            <option value="Material Esportivo">Esportivo</option>
            <option value="Eletrodomésticos">Eletrodomésticos</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto shadow-lg shadow-blue-600/20">
            <Plus size={20} />
            Novo Item
          </Button>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div key={item.id}>
            <Card className="group relative overflow-hidden flex flex-col h-full">
               <div className={cn("h-1 w-full shadow-inner", getItemStatusColor(item.replacementExpectancy).split(' ')[0])} />
               <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-xl", 
                      item.category === 'Material Esportivo' ? "bg-blue-500/10 text-blue-400" :
                      item.category === 'Eletrodomésticos' ? "bg-purple-500/10 text-purple-400" :
                      "bg-orange-500/10 text-orange-400"
                    )}>
                      {item.category === 'Material Esportivo' ? <Trophy size={18} /> : <Wrench size={18} />}
                    </div>
                    <Badge variant={item.condition === 'Danificado' ? 'danger' : item.condition === 'Desgastado' ? 'warning' : 'success'}>
                      {item.condition}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-white mb-1">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">{item.category}</p>

                  <div className="mt-auto space-y-4">
                     <div className="flex items-center justify-between">
                       <span className="text-xs text-slate-500">Qtd. em Estoque</span>
                       <span className="text-lg font-black text-white">{item.quantity}</span>
                     </div>
                     
                     <div className="p-3 bg-slate-900 rounded-xl space-y-2">
                       <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-500">
                         <span>Troca Prevista</span>
                         <span className={cn(getItemStatusColor(item.replacementExpectancy).split(' ')[1])}>
                           {format(parseISO(item.replacementExpectancy), 'MMM/yyyy', { locale: ptBR })}
                         </span>
                       </div>
                       {isBefore(parseISO(item.replacementExpectancy), new Date()) && (
                         <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 animate-pulse">
                           <AlertTriangle size={10} />
                           SUBSTITUIÇÃO ATRASADA
                         </div>
                       )}
                     </div>

                     {isAdmin && (
                       <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                          <button 
                            onClick={() => { setSelectedItem(item); setIsOutflowModalOpen(true); }}
                            className="flex-1 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <Minus size={14} /> Baixa
                          </button>
                          <button 
                            onClick={() => { setSelectedItem(item); setIsAddModalOpen(true); }}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => onDeleteItem(item.id)}
                            className="p-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                       </div>
                     )}
                  </div>
               </div>
            </Card>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <InventoryModal 
          isOpen={isAddModalOpen}
          onClose={() => { setIsAddModalOpen(false); setSelectedItem(null); }}
          item={selectedItem}
          onSave={selectedItem ? (updates: any) => onUpdateItem(selectedItem.id, updates) : onAddItem}
        />
      )}

      {isOutflowModalOpen && selectedItem && (
        <InventoryOutflowModal 
          isOpen={isOutflowModalOpen}
          onClose={() => { setIsOutflowModalOpen(false); setSelectedItem(null); }}
          item={selectedItem}
          onConfirm={(qty, reason, obs) => onRegisterOutflow(selectedItem.id, qty, reason, obs)}
        />
      )}
    </div>
  );
}

function InventoryModal({ isOpen, onClose, item, onSave }: { isOpen: boolean; onClose: () => void; item?: InventoryItem | null; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Material Esportivo' as InventoryCategory,
    quantity: item?.quantity || 1,
    condition: item?.condition || 'Novo' as InventoryCondition,
    purchaseValue: item?.purchaseValue || 0,
    acquisitionDate: item?.acquisitionDate ? item.acquisitionDate.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
    replacementExpectancy: item?.replacementExpectancy ? item.replacementExpectancy.split('T')[0] : format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
    observations: item?.observations || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      purchaseValue: Number(formData.purchaseValue),
      quantity: Number(formData.quantity),
      acquisitionDate: new Date(formData.acquisitionDate + "T12:00:00").toISOString(),
      replacementExpectancy: new Date(formData.replacementExpectancy + "T12:00:00").toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm shadow-2xl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
        <Card className="relative p-6 bg-slate-900 border-slate-700">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-slate-800 pb-4">{item ? 'Editar Item' : 'Novo Item no Almoxarifado'}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome do Item</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
                  <option value="Material Esportivo">Material Esportivo</option>
                  <option value="Eletrodomésticos">Eletrodomésticos</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="space-y-1.5">
                 <StatStepper label="Qtd Inicial" value={formData.quantity} onChange={v => setFormData({...formData, quantity: v})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</label>
                <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
                  <option value="Novo">Novo</option>
                  <option value="Bom">Bom</option>
                  <option value="Desgastado">Desgastado</option>
                  <option value="Danificado">Danificado</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor de Compra (R$)</label>
                <input type="number" step="0.01" value={formData.purchaseValue} onChange={e => setFormData({...formData, purchaseValue: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data de Aquisição</label>
                <input type="date" value={formData.acquisitionDate} onChange={e => setFormData({...formData, acquisitionDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expectativa de Troca</label>
                <input type="date" value={formData.replacementExpectancy} onChange={e => setFormData({...formData, replacementExpectancy: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer" />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
                <CheckCircle size={20} />
                {item ? 'Salvar Alterações' : 'Cadastrar Item'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

function InventoryOutflowModal({ isOpen, onClose, item, onConfirm }: { isOpen: boolean; onClose: () => void; item: InventoryItem; onConfirm: (qty: number, reason: string, obs: string) => void }) {
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('Dano/Quebra');
  const [obs, setObs] = useState('');

  const handleConfirm = () => {
    onConfirm(qty, reason, obs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
        <Card className="relative p-6 border-red-500/30 bg-slate-900 shadow-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
              <Minus size={20} />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Dar Baixa no Estoque</h3>
          </div>
          
          <div className="p-4 bg-slate-800/50 rounded-xl mb-6 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Item Selecionado</p>
            <p className="text-lg font-black text-white">{item.name}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Disponível agora</span>
              <span className="text-xl font-black text-blue-400">{item.quantity}</span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <StatStepper label="Quantidade para Baixa" value={qty} max={item.quantity} onChange={setQty} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motivo Principal</label>
              <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer">
                <option value="Dano/Quebra">Dano / Quebra / Estourou</option>
                <option value="Perda">Perda / Sumiço</option>
                <option value="Consumo/Uso">Consumo / Uso Contínuo</option>
                <option value="Doação">Doação Externa</option>
                <option value="Substituição">Substituição por Novo</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detalhes da Ocorrência</label>
              <textarea 
                value={obs} 
                onChange={e => setObs(e.target.value)}
                placeholder="Ex: Bola estourou durante o treino de sábado..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none h-24"
              />
            </div>

            <div className="pt-2">
              <Button onClick={handleConfirm} variant="danger" className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-red-600/20">
                Confirmar Baixa de Patrimônio
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ReportsView({ state, stats, currentUser, isAdmin }: { state: AppState; stats: any; currentUser: string | null; isAdmin: boolean }) {
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'financial' | 'members' | 'delinquency' | 'transactions'>('overview');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMember, setFilterMember] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const logoUrl = "https://lh3.googleusercontent.com/d/1A6hPCCMQ78jBYjr1RfT3Gjo5fNEhvJmi=w400";

  const filteredPayments = state.payments.filter(p => 
    p.month === filterMonth && 
    p.year === filterYear &&
    (filterMember === 'all' || p.memberId === filterMember)
  );

  const filteredExpenses = (state.expenses || []).filter(e => {
    const d = parseISO(e.date);
    return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
  });

  const filteredOtherIncome = (state.otherIncome || []).filter(i => {
    const d = parseISO(i.date);
    return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
  });

  const getMemberName = (id: string) => state.members.find(m => m.id === id)?.name || 'Desconhecido';

  const info = state.associationInfo || DEFAULT_ASSOCIATION_INFO;

  const exportToPDF = async (title: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("ASSOCIAÇÃO GAVIÃO FC", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(title, pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`CNPJ: ${info.cnpj} | Contato: ${info.contato}`, pageWidth / 2, 36, { align: 'center' });
    doc.text(info.endereco, pageWidth / 2, 41, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 49, { align: 'center' });
    doc.text(`Gerado por: ${currentUser || 'Sistema'}`, pageWidth / 2, 54, { align: 'center' });
    doc.text(`Período: ${format(new Date(filterYear, filterMonth, 1), 'MMMM yyyy', { locale: ptBR })}`, pageWidth / 2, 60, { align: 'center' });

    let yPos = 70;

    if (activeReportTab === 'financial') {
      const membershipIncome = filteredPayments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0);
      const otherIncomeVal = filteredOtherIncome.reduce((acc, i) => acc + i.amount, 0);
      const income = membershipIncome + otherIncomeVal;
      const expenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
      const net = income - expenses;

      const initialBalance = state.initialBalance || 0;
      const totalMembershipIncomeAllTime = state.payments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0);
      const totalOtherIncomeAllTime = (state.otherIncome || []).reduce((acc, i) => acc + i.amount, 0);
      const totalIncomeAllTime = totalMembershipIncomeAllTime + totalOtherIncomeAllTime;
      const totalExpensesAllTime = (state.expenses || []).reduce((acc, e) => acc + e.amount, 0);
      const finalBalance = initialBalance + totalIncomeAllTime - totalExpensesAllTime;

      autoTable(doc, {
        startY: yPos,
        head: [['Resumo do Período', 'Valor']],
        body: [
          ['Mensalidades Pagas', formatCurrency(membershipIncome)],
          ['Outras Receitas', formatCurrency(otherIncomeVal)],
          ['Total de Receitas', formatCurrency(income)],
          ['Total de Despesas', formatCurrency(expenses)],
          ['Saldo Líquido do Período', formatCurrency(net)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] }
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Resumo Geral do Caixa', 'Valor']],
        body: [
          ['Saldo Inicial em Caixa', formatCurrency(initialBalance)],
          ['Total de Entradas (Acumulado)', formatCurrency(totalIncomeAllTime)],
          ['Total de Saídas (Acumulado)', formatCurrency(totalExpensesAllTime)],
          ['Saldo Final em Caixa', formatCurrency(finalBalance)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });
    } else if (activeReportTab === 'members') {
      const active = state.members.filter(m => m.status === 'Ativo').length;
      const away = state.members.filter(m => m.status === 'Afastado').length;
      const off = state.members.filter(m => m.status === 'Desligado').length;

      autoTable(doc, {
        startY: yPos,
        head: [['Status', 'Quantidade']],
        body: [
          ['Ativos', active.toString()],
          ['Afastados', away.toString()],
          ['Desligados', off.toString()],
          ['Total Geral', state.members.length.toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] }
      });
    } else if (activeReportTab === 'delinquency') {
      const delinquentList = stats.fullDelinquentList.map((m: any) => [
        m.name, 
        m.pendingMonths.length.toString(), 
        m.pendingMonths.map((pm: any) => format(new Date(pm.year, pm.month, 1), 'MMM/yy', { locale: ptBR })).join(', '),
        formatCurrency(m.totalDebt)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Sócio', 'Qtd Meses', 'Meses Pendentes', 'Valor Total']],
        body: delinquentList,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] }
      });
    } else if (activeReportTab === 'transactions') {
      const transactions = [
        ...filteredPayments.map(p => ({ 
          date: p.paidAt || p.dueDate, 
          desc: `Mensalidade: ${getMemberName(p.memberId)}`, 
          type: 'Receita', 
          amount: p.amount, 
          status: p.status,
          method: p.paymentMethod || '-'
        })),
        ...filteredOtherIncome.map(i => ({
          date: i.date,
          desc: `${i.category}: ${i.description}`,
          type: 'Receita (Outra)',
          amount: i.amount,
          status: 'Pago',
          method: i.paymentMethod
        })),
        ...filteredExpenses.map(e => ({ 
          date: e.date, 
          desc: e.description, 
          type: 'Despesa', 
          amount: e.amount, 
          status: 'Pago',
          method: 'Dinheiro'
        }))
      ].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

      autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Descrição', 'Tipo', 'Valor', 'Forma', 'Status']],
        body: transactions.map(t => [
          format(parseISO(t.date), 'dd/MM/yyyy'),
          t.desc,
          t.type,
          formatCurrency(t.amount),
          (t as any).method,
          t.status
        ]),
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] }
      });
    }

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        "Gerado pelo Sistema de Gestão Gavião FC - Documento Oficial",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`relatorio_${activeReportTab}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const exportToImage = async () => {
    if (!reportRef.current) {
      alert("Erro: Container do relatório não encontrado.");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Add a small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await htmlToImage.toPng(reportRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          boxShadow: 'none',
          borderRadius: '0',
          margin: '0',
          display: 'block',
          visibility: 'visible',
        }
      });
      
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error("Falha ao gerar dados da imagem.");
      }

      const link = document.createElement('a');
      link.download = `relatorio_${activeReportTab}_${format(new Date(), 'yyyyMMdd')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert("Ocorreu um erro ao gerar a imagem. Por favor, tente novamente ou use a função de PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const printReport = () => {
    try {
      window.focus();
      window.print();
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      alert("Erro ao abrir diálogo de impressão.");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Filters & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1e293b] p-4 rounded-xl border border-slate-700/50">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
              </option>
            ))}
          </select>
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select 
            value={filterMember} 
            onChange={(e) => setFilterMember(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 max-w-[200px]"
          >
            <option value="all">Todos os Sócios</option>
            {state.members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          {(['overview', 'financial', 'members', 'delinquency', 'transactions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveReportTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wider",
                activeReportTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {tab === 'overview' && 'Geral'}
              {tab === 'financial' && 'Financeiro'}
              {tab === 'members' && 'Sócios'}
              {tab === 'delinquency' && 'Inadimplência'}
              {tab === 'transactions' && 'Transações'}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button onClick={printReport} variant="secondary" className="text-xs" disabled={isGenerating}>
          <Printer size={16} />
          Imprimir
        </Button>
        <Button onClick={exportToImage} variant="secondary" className="text-xs" disabled={isGenerating}>
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ImageIcon size={16} />
          )}
          {isGenerating ? 'Gerando...' : 'Imagem (PNG)'}
        </Button>
        <Button onClick={() => exportToPDF(`Relatório de ${activeReportTab.charAt(0).toUpperCase() + activeReportTab.slice(1)}`)} className="text-xs" disabled={isGenerating}>
          <FileDown size={16} />
          PDF Profissional
        </Button>
      </div>

      {/* Report Preview Container */}
      <div className="flex justify-center">
        <div 
          ref={reportRef}
          id="report-container"
          className="w-full max-w-[800px] bg-white text-slate-900 shadow-2xl rounded-sm overflow-hidden print:shadow-none print:rounded-none"
          style={{ minHeight: '1122px' }} // A4 aspect ratio approx
        >
          {/* Report Header */}
          <div className="p-10 border-b-4 border-blue-600 flex justify-between items-start">
            <div className="flex gap-6 items-center">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-24 h-24 object-contain"
                style={{ filter: 'url(#remove-white)' }}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Associação Gavião FC</h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Relatório Administrativo</p>
                <div className="mt-2 text-[10px] text-slate-400 font-medium uppercase space-y-0.5">
                  <p>CNPJ: {info.cnpj}</p>
                  <p>Endereço: {info.endereco}</p>
                  <p>Contato: {info.contato}</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-4">
              <div className="bg-slate-100 px-4 py-2 rounded-lg inline-block">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Data de Emissão</p>
                <p className="text-sm font-black text-slate-900">{format(new Date(), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Período de Referência</p>
                <p className="text-sm font-bold text-blue-600 uppercase">
                  {format(new Date(filterYear, filterMonth, 1), 'MMMM yyyy', { locale: ptBR })}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Gerado por</p>
                <p className="text-xs font-bold text-slate-700">{currentUser || 'Sistema'}</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">
                {activeReportTab === 'overview' && 'Visão Geral do Sistema'}
                {activeReportTab === 'financial' && 'Resumo Financeiro Detalhado'}
                {activeReportTab === 'members' && 'Estatísticas de Quadro Social'}
                {activeReportTab === 'delinquency' && 'Relatório de Inadimplência'}
                {activeReportTab === 'transactions' && 'Histórico de Transações'}
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {activeReportTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sócios</p>
                    <p className="text-xl font-black text-slate-900">{state.members.length}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase mb-1">Receita (Mês)</p>
                    <p className="text-xl font-black text-emerald-600">
                      {formatCurrency(
                        filteredPayments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) +
                        filteredOtherIncome.reduce((acc, i) => acc + i.amount, 0)
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-[10px] font-bold text-red-600/60 uppercase mb-1">Despesas (Mês)</p>
                    <p className="text-xl font-black text-red-600">{formatCurrency(filteredExpenses.reduce((acc, e) => acc + e.amount, 0))}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600/60 uppercase mb-1">Saldo Total</p>
                    <p className={cn("text-xl font-black", ((state.initialBalance || 0) + state.payments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) + (state.otherIncome || []).reduce((acc, i) => acc + i.amount, 0) - (state.expenses || []).reduce((acc, e) => acc + e.amount, 0)) >= 0 ? "text-blue-600" : "text-red-600")}>
                      {formatCurrency((state.initialBalance || 0) + state.payments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) + (state.otherIncome || []).reduce((acc, i) => acc + i.amount, 0) - (state.expenses || []).reduce((acc, e) => acc + e.amount, 0))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distribuição por Status</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Ativos', value: state.members.filter(m => m.status === 'Ativo').length },
                              { name: 'Afastados', value: state.members.filter(m => m.status === 'Afastado').length },
                              { name: 'Desligados', value: state.members.filter(m => m.status === 'Desligado').length }
                            ]}
                            cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categorias de Despesas</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Campo', value: state.expenses.filter(e => e.category === 'Campo').reduce((acc, e) => acc + e.amount, 0) },
                              { name: 'Equipamento', value: state.expenses.filter(e => e.category === 'Equipamento').reduce((acc, e) => acc + e.amount, 0) },
                              { name: 'Staff', value: state.expenses.filter(e => e.category === 'Staff').reduce((acc, e) => acc + e.amount, 0) },
                              { name: 'Outros', value: state.expenses.filter(e => e.category === 'Outros').reduce((acc, e) => acc + e.amount, 0) }
                            ].filter(v => v.value > 0)}
                            cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#ef4444" />
                            <Cell fill="#10b981" />
                            <Cell fill="#8b5cf6" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeReportTab === 'financial' && (
              <div className="space-y-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-4 text-left text-xs font-bold uppercase tracking-widest">Resumo do Período</th>
                      <th className="p-4 text-right text-xs font-bold uppercase tracking-widest">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-4 text-sm font-medium text-slate-600">Total de Mensalidades Recebidas</td>
                      <td className="p-4 text-right text-sm font-black text-emerald-600">
                        {formatCurrency(filteredPayments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0))}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-medium text-slate-600">Outras Receitas Recebidas</td>
                      <td className="p-4 text-right text-sm font-black text-emerald-600">
                        {formatCurrency(filteredOtherIncome.reduce((acc, i) => acc + i.amount, 0))}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-medium text-slate-600">Total de Despesas Operacionais</td>
                      <td className="p-4 text-right text-sm font-black text-red-600">
                        {formatCurrency(filteredExpenses.reduce((acc, e) => acc + e.amount, 0))}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-4 text-sm font-black text-slate-900 uppercase">Saldo Líquido do Período</td>
                      <td className={cn(
                        "p-4 text-right text-lg font-black",
                        (filteredPayments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) + filteredOtherIncome.reduce((acc, i) => acc + i.amount, 0) - filteredExpenses.reduce((acc, e) => acc + e.amount, 0)) >= 0 
                          ? "text-blue-600" 
                          : "text-red-600"
                      )}>
                        {formatCurrency(filteredPayments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) + filteredOtherIncome.reduce((acc, i) => acc + i.amount, 0) - filteredExpenses.reduce((acc, e) => acc + e.amount, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="p-4 text-left text-xs font-bold uppercase tracking-widest">Resumo Geral do Caixa</th>
                      <th className="p-4 text-right text-xs font-bold uppercase tracking-widest">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-4 text-sm font-medium text-slate-600">Saldo Inicial em Caixa</td>
                      <td className="p-4 text-right text-sm font-black text-slate-900">
                        {formatCurrency(state.initialBalance || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-medium text-slate-600">Total de Entradas (Acumulado)</td>
                      <td className="p-4 text-right text-sm font-black text-emerald-600">
                        {formatCurrency(state.payments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) + (state.otherIncome || []).reduce((acc, i) => acc + i.amount, 0))}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-medium text-slate-600">Total de Saídas (Acumulado)</td>
                      <td className="p-4 text-right text-sm font-black text-red-600">
                        {formatCurrency((state.expenses || []).reduce((acc, e) => acc + e.amount, 0))}
                      </td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="p-4 text-sm font-black text-blue-900 uppercase">Saldo Final em Caixa</td>
                      <td className={cn(
                        "p-4 text-right text-xl font-black",
                        ((state.initialBalance || 0) + state.payments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) + (state.otherIncome || []).reduce((acc, i) => acc + i.amount, 0) - (state.expenses || []).reduce((acc, e) => acc + e.amount, 0)) >= 0 
                          ? "text-blue-600" 
                          : "text-red-600"
                      )}>
                        {formatCurrency((state.initialBalance || 0) + state.payments.filter(p => p.status === 'Pago').reduce((acc, p) => acc + p.amount, 0) + (state.otherIncome || []).reduce((acc, i) => acc + i.amount, 0) - (state.expenses || []).reduce((acc, e) => acc + e.amount, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeReportTab === 'members' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-2">Sócios Ativos</p>
                    <p className="text-4xl font-black text-blue-600">{state.members.filter(m => m.status === 'Ativo').length}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total de Sócios</p>
                    <p className="text-4xl font-black text-slate-900">{state.members.length}</p>
                  </div>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-4 text-left text-xs font-bold uppercase tracking-widest">Nome do Sócio</th>
                      <th className="p-4 text-center text-xs font-bold uppercase tracking-widest">Status</th>
                      <th className="p-4 text-right text-xs font-bold uppercase tracking-widest">Mensalidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {state.members.map(member => (
                      <tr key={member.id}>
                        <td className="p-4 text-sm font-medium text-slate-700">{member.name}</td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-black uppercase",
                            member.status === 'Ativo' ? "bg-emerald-100 text-emerald-700" : 
                            member.status === 'Afastado' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}>
                            {member.status}
                          </span>
                        </td>
                        <td className="p-4 text-right text-sm font-bold text-slate-900">{formatCurrency(member.monthlyFee)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeReportTab === 'delinquency' && (
              <div className="space-y-6">
                <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase mb-1">Total em Atraso (Global)</p>
                    <p className="text-3xl font-black text-red-600">
                      {formatCurrency(stats.fullDelinquentList.reduce((acc: number, m: any) => acc + m.totalDebt, 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-400 uppercase mb-1">Sócios Inadimplentes</p>
                    <p className="text-3xl font-black text-red-600">
                      {stats.fullDelinquentList.length}
                    </p>
                  </div>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="p-4 text-left text-xs font-bold uppercase tracking-widest">Sócio Inadimplente</th>
                      <th className="p-4 text-center text-xs font-bold uppercase tracking-widest">Meses em Aberto</th>
                      <th className="p-4 text-right text-xs font-bold uppercase tracking-widest">Dívida Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stats.fullDelinquentList.map((member: any) => (
                      <tr key={member.id}>
                        <td className="p-4">
                          <p className="text-sm font-bold text-slate-700">{member.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {member.pendingMonths.map((pm: any) => format(new Date(pm.year, pm.month, 1), 'MMM/yy', { locale: ptBR })).join(', ')}
                          </p>
                        </td>
                        <td className="p-4 text-center text-sm font-medium text-slate-600">{member.pendingMonths.length}</td>
                        <td className="p-4 text-right text-sm font-black text-red-600">{formatCurrency(member.totalDebt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeReportTab === 'transactions' && (
              <div className="space-y-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-4 text-left text-xs font-bold uppercase tracking-widest">Data</th>
                      <th className="p-4 text-left text-xs font-bold uppercase tracking-widest">Descrição</th>
                      <th className="p-4 text-center text-xs font-bold uppercase tracking-widest">Tipo</th>
                      <th className="p-4 text-center text-xs font-bold uppercase tracking-widest">Forma</th>
                      <th className="p-4 text-right text-xs font-bold uppercase tracking-widest">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      ...filteredPayments.map(p => ({ 
                        date: p.paidAt || p.dueDate, 
                        desc: `Mensalidade: ${getMemberName(p.memberId)}`, 
                        type: 'Receita', 
                        amount: p.amount, 
                        status: p.status,
                        method: p.paymentMethod || '-'
                      })),
                      ...filteredExpenses.map(e => ({ 
                        date: e.date, 
                        desc: e.description, 
                        type: 'Despesa', 
                        amount: e.amount, 
                        status: 'Pago',
                        method: 'Dinheiro'
                      }))
                    ]
                    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
                    .map((t, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-4 text-xs font-medium text-slate-500">{format(parseISO(t.date), 'dd/MM/yyyy')}</td>
                        <td className="p-4 text-sm font-bold text-slate-700">{t.desc}</td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                            t.type === 'Receita' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {t.type}
                          </span>
                        </td>
                        <td className="p-4 text-center text-[10px] font-bold text-slate-500 uppercase">{t.method}</td>
                        <td className={cn(
                          "p-4 text-right text-sm font-black",
                          t.type === 'Receita' ? "text-emerald-600" : "text-red-600"
                        )}>
                          {t.type === 'Receita' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className="p-10 bg-slate-50 border-t border-slate-200 mt-auto">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Autenticação do Documento</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-slate-200 rounded" />
                  <div className="w-32 h-8 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Gerado por</p>
                <p className="text-xs font-black text-slate-900 uppercase">Sistema de Gestão Gavião FC</p>
                <p className="text-[9px] text-slate-400 mt-1">{format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

