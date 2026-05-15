export type MemberStatus = 'Ativo' | 'Afastado' | 'Desligado';
export type PaymentStatus = 'Pago' | 'Pendente';
export type PaymentMethod = 'PIX' | 'Cartão' | 'Dinheiro' | 'Cheque';
export type ExpenseCategory = 'Campo' | 'Equipamento' | 'Staff' | 'Eventos' | 'Outros';
export type UserRole = 'admin' | 'socio' | 'visitante';

export interface AppNotification {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  modulo: string;
  criado_em: string;
}

export interface LoggedUser {
  id?: string;
  nome: string;
  email?: string;
  tipo: UserRole;
  senha?: string | null;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'User';
  createdAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string; // Denormalized name
  month: number; // 0-11 (internal) or 1-12 (requested) - we'll use 0-11 for JS compatibility
  year: number;
  amount: number;
  originalAmount?: number;
  isEdited?: boolean;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  dueDate: string; // ISO string
  paidAt?: string; // ISO string
  origem?: string;
  updatedBy?: string; // User name
  createdBy?: string; // User name
  createdAt: string; // ISO string
  notes?: string;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  senha?: string | null;
  cpf: string;
  birthDate: string;
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
  monthlyFee: number;
  status: MemberStatus;
  photo?: string; // Base64 string
  trainingUniformNumber?: string;
  createdAt: string;
  createdBy?: string; // User name
  badges?: Badge[];
}

export interface Badge {
  id: string;
  type: 'artilheiro' | 'paredao' | 'diamante' | 'ouro' | 'bronze' | 'vice' | 'terceiro';
  month: number; // 0-11
  year: number;
  label: string;
  earnedAt: string; // ISO string
  position?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string
  category: ExpenseCategory;
  notes?: string;
  createdBy?: string; // User name
}

export interface AssociationInfo {
  nome: string;
  cnpj: string;
  endereco: string;
  contato: string;
}

export type OtherIncomeCategory = 'Patrocínio' | 'Doação' | 'Evento' | 'Venda' | 'Contribuição' | 'Outros';

export interface OtherIncome {
  id: string;
  description: string;
  category: OtherIncomeCategory;
  amount: number;
  date: string; // ISO string
  paymentMethod: PaymentMethod;
  notes?: string;
  createdBy: string; // User name
}

export interface MatchPlayer {
  memberId: string;
  name: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  isMvp?: boolean;
  isGoalkeeper?: boolean;
  team?: 'azul' | 'amarelo';
}

export interface Training {
  id: string;
  date: string; // ISO string
  time?: string;
  location?: string;
  score: string | { azul: number; amarelo: number };
  players: MatchPlayer[];
  createdAt: string;
  createdBy: string;
}

export interface FinesConfig {
  yellowCardValue: number;
  redCardValue: number;
}

export interface OuvidoriaMessage {
  id: number;
  assunto: string;
  mensagem: string;
  autor: string;
  data: string;
  resolvido: boolean;
}

export interface GalleryPhoto {
  id: string;
  url: string; // Base64
  date: string; // ISO
  size: number;
}

export type NoticeCategory = 'Treino' | 'Financeiro' | 'Evento' | 'Urgente';
export type InventoryCategory = 'Material Esportivo' | 'Eletrodomésticos' | 'Manutenção' | 'Outros';
export type InventoryCondition = 'Novo' | 'Bom' | 'Desgastado' | 'Danificado';

export interface InventoryHistory {
  id: string;
  date: string;
  description: string;
  type: 'Entrada' | 'Saída' | 'Ajuste';
  quantityDelta: number;
  observations?: string;
  createdBy: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  condition: InventoryCondition;
  purchaseValue: number;
  acquisitionDate: string; // ISO string
  replacementExpectancy: string; // ISO string 
  observations?: string;
  history?: InventoryHistory[];
  createdAt: string;
  createdBy: string;
}

export interface Notice {
  id: string;
  title: string;
  category: NoticeCategory;
  message: string;
  expiresAt?: string;
  isPinned: boolean;
  createdAt: string;
  createdBy: string;
  readBy: string[]; // List of user names or IDs who read it
}

export interface AppState {
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  otherIncome?: OtherIncome[];
  trainings?: Training[];
  notices?: Notice[];
  finesConfig?: FinesConfig;
  users: User[];
  systemPassword?: string;
  lastAutomationRun: string; // ISO string
  associationInfo?: AssociationInfo;
  initialBalance?: number;
  ouvidoria?: OuvidoriaMessage[];
  hallOfFameBadges?: {
    artilheiro: string;
    vice: string;
    assistencias: string;
    goleiro: string;
  };
  inventory?: InventoryItem[];
}
