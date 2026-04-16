// store/chronicleStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User, Tag, State, City, News, Comment,
  Role, NewsStatus, CommentStatus,
} from '@/types/admin';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// ─── Seed data ───────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  { id: '1', name: 'Admin Chronicle', email: 'admin@chronicle.com', role: 'superadmin', createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'João Silva', email: 'joao.silva@email.com', role: 'leitor', createdAt: '2026-01-02T00:00:00Z' },
  { id: '3', name: 'Maria Santos', email: 'maria.santos@email.com', role: 'autor', createdAt: '2026-01-03T00:00:00Z' },
  { id: '4', name: 'Pedro Editor', email: 'pedro.editor@email.com', role: 'editor', createdAt: '2026-01-04T00:00:00Z' },
  { id: '5', name: 'Ana Leitor', email: 'ana.leitor@email.com', role: 'leitor', createdAt: '2026-01-05T00:00:00Z' },
];

const SEED_TAGS: Tag[] = [
  { id: '1', name: 'Política', colorHex: '#dc2626', createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'Tecnologia', colorHex: '#2563eb', createdAt: '2026-01-01T00:00:00Z' },
  { id: '3', name: 'Esportes', colorHex: '#16a34a', createdAt: '2026-01-01T00:00:00Z' },
  { id: '4', name: 'Economia', colorHex: '#d97706', createdAt: '2026-01-01T00:00:00Z' },
  { id: '5', name: 'Cultura', colorHex: '#7c3aed', createdAt: '2026-01-01T00:00:00Z' },
];

const SEED_STATES: State[] = [
  { id: '1', name: 'São Paulo', acronym: 'SP' },
  { id: '2', name: 'Rio de Janeiro', acronym: 'RJ' },
  { id: '3', name: 'Minas Gerais', acronym: 'MG' },
];

const SEED_CITIES: City[] = [
  { id: '1', stateId: '1', name: 'São Paulo' },
  { id: '2', stateId: '1', name: 'Campinas' },
  { id: '3', stateId: '2', name: 'Rio de Janeiro' },
  { id: '4', stateId: '2', name: 'Niterói' },
  { id: '5', stateId: '3', name: 'Belo Horizonte' },
  { id: '6', stateId: '3', name: 'Uberlândia' },
];

const SEED_NEWS: News[] = [
  {
    id: '1', authorId: '3', title: 'Nova descoberta em inteligência artificial revoluciona o setor',
    status: 'publicada', tagIds: ['2'], contentBody: 'Pesquisadores anunciaram uma nova técnica...',
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: '2', authorId: '3', title: 'Eleições 2026: cenário político se define nas capitais',
    status: 'em_revisao', tagIds: ['1'], contentBody: 'Com as eleições se aproximando...',
    createdAt: '2026-04-11T09:00:00Z', updatedAt: '2026-04-11T09:00:00Z',
  },
  {
    id: '3', authorId: '3', title: 'Copa do Mundo: seleção intensifica preparação',
    status: 'rascunho', tagIds: ['3'], contentBody: 'A seleção brasileira realizou treino intenso...',
    createdAt: '2026-04-12T14:00:00Z', updatedAt: '2026-04-12T14:00:00Z',
  },
  {
    id: '4', authorId: '3', title: 'Mercado financeiro registra alta histórica',
    status: 'lixeira', tagIds: ['4'], contentBody: 'O Ibovespa registrou a maior alta...',
    createdAt: '2026-04-08T11:00:00Z', updatedAt: '2026-04-13T08:00:00Z',
  },
  {
    id: '5', authorId: '3', title: 'Festival de cinema traz grandes estreias internacionais',
    status: 'publicada', tagIds: ['5'], contentBody: 'O festival internacional de cinema...',
    createdAt: '2026-04-09T16:00:00Z', updatedAt: '2026-04-09T16:00:00Z',
  },
];

const SEED_COMMENTS: Comment[] = [
  { id: '1', newsId: '1', userId: '2', content: 'Excelente artigo! Muito informativo e bem escrito.', status: 'active', reportCount: 0, createdAt: '2026-04-10T11:00:00Z' },
  { id: '2', newsId: '1', userId: '5', content: 'Concordo plenamente com a análise apresentada.', status: 'active', reportCount: 0, createdAt: '2026-04-10T12:00:00Z' },
  { id: '3', newsId: '5', userId: '2', content: 'Não vejo a hora do festival começar!', status: 'active', reportCount: 0, createdAt: '2026-04-09T17:00:00Z' },
  { id: '4', newsId: '5', userId: '5', content: 'Ótima cobertura do evento!', status: 'active', reportCount: 0, createdAt: '2026-04-09T18:00:00Z' },
  { id: '5', newsId: '1', userId: '2', content: 'Conteúdo de baixa qualidade, absolutamente inaceitável.', status: 'active', reportCount: 2, createdAt: '2026-04-10T13:00:00Z' },
  { id: '6', newsId: '5', userId: '5', content: 'Isso é spam, não tem nada a ver com o artigo!', status: 'active', reportCount: 3, createdAt: '2026-04-09T19:00:00Z' },
];

// ─── Store interface ──────────────────────────────────────────────────────────

interface ChronicleState {
  currentUser: User | null;
  users: User[];
  tags: Tag[];
  states: State[];
  cities: City[];
  news: News[];
  comments: Comment[];
  // Auth
  setCurrentUser: (user: User | null) => void;
  // Users
  updateUserRole: (id: string, role: Role) => void;
  // Tags
  addTag: (data: { name: string; colorHex: string }) => void;
  updateTag: (id: string, data: { name: string; colorHex: string }) => void;
  removeTag: (id: string) => void;
  // States
  addState: (data: { name: string; acronym: string }) => void;
  updateState: (id: string, data: { name: string; acronym: string }) => void;
  removeState: (id: string) => void;
  // Cities
  addCity: (data: { stateId: string; name: string }) => void;
  updateCity: (id: string, data: { stateId: string; name: string }) => void;
  removeCity: (id: string) => void;
  // News
  updateNewsStatus: (id: string, status: NewsStatus) => void;
  // Comments
  updateCommentStatus: (id: string, status: CommentStatus) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChronicleStore = create<ChronicleState>()(
  persist(
    (set) => ({
      currentUser: null,
      users: SEED_USERS,
      tags: SEED_TAGS,
      states: SEED_STATES,
      cities: SEED_CITIES,
      news: SEED_NEWS,
      comments: SEED_COMMENTS,

      setCurrentUser: (user) => set({ currentUser: user }),

      updateUserRole: (id, role) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, role } : u)) })),

      addTag: ({ name, colorHex }) =>
        set((s) => ({
          tags: [
            ...s.tags,
            { id: uid(), name, colorHex, createdAt: new Date().toISOString() },
          ],
        })),

      updateTag: (id, { name, colorHex }) =>
        set((s) => ({ tags: s.tags.map((t) => (t.id === id ? { ...t, name, colorHex } : t)) })),

      removeTag: (id) =>
        set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),

      addState: ({ name, acronym }) =>
        set((s) => ({
          states: [...s.states, { id: uid(), name, acronym }],
        })),

      updateState: (id, { name, acronym }) =>
        set((s) => ({ states: s.states.map((st) => (st.id === id ? { ...st, name, acronym } : st)) })),

      removeState: (id) =>
        set((s) => ({
          states: s.states.filter((st) => st.id !== id),
          cities: s.cities.filter((c) => c.stateId !== id),
        })),

      addCity: ({ stateId, name }) =>
        set((s) => ({
          cities: [...s.cities, { id: uid(), stateId, name }],
        })),

      updateCity: (id, { stateId, name }) =>
        set((s) => ({ cities: s.cities.map((c) => (c.id === id ? { ...c, stateId, name } : c)) })),

      removeCity: (id) =>
        set((s) => ({ cities: s.cities.filter((c) => c.id !== id) })),

      updateNewsStatus: (id, status) =>
        set((s) => ({
          news: s.news.map((n) =>
            n.id === id ? { ...n, status, updatedAt: new Date().toISOString() } : n
          ),
        })),

      updateCommentStatus: (id, status) =>
        set((s) => ({ comments: s.comments.map((c) => (c.id === id ? { ...c, status } : c)) })),
    }),
    {
      name: 'chronicle_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
