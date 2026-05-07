// store/chronicleStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User, Tag, State, City, News, Comment,
  Role, NewsStatus, CommentStatus, ReadingFontSize, ReadingBackground,
} from '@/types/admin';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// ─── Seed data ───────────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  { id: '1', name: 'Admin Chronicle', email: 'admin@chronicle.com', role: 'superadmin', createdAt: '2026-01-01T00:00:00Z', followedTagIds: [], followedAuthorIds: [], savedNewsIds: [], readingFontSize: 'md', readingBackground: 'white' },
  { id: '2', name: 'João Silva', email: 'joao.silva@email.com', role: 'leitor', createdAt: '2026-01-02T00:00:00Z', followedTagIds: [], followedAuthorIds: [], savedNewsIds: [], readingFontSize: 'md', readingBackground: 'white' },
  { id: '3', name: 'Maria Santos', email: 'maria.santos@email.com', role: 'autor', createdAt: '2026-01-03T00:00:00Z', followedTagIds: [], followedAuthorIds: [], savedNewsIds: [], readingFontSize: 'md', readingBackground: 'white' },
  { id: '4', name: 'Pedro Editor', email: 'pedro.editor@email.com', role: 'editor', createdAt: '2026-01-04T00:00:00Z', followedTagIds: [], followedAuthorIds: [], savedNewsIds: [], readingFontSize: 'md', readingBackground: 'white' },
  { id: '5', name: 'Ana Leitor', email: 'ana.leitor@email.com', role: 'leitor', createdAt: '2026-01-05T00:00:00Z', followedTagIds: [], followedAuthorIds: [], savedNewsIds: [], readingFontSize: 'md', readingBackground: 'white' },
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
    id: '1', authorId: '3', cityId: '1',
    title: 'Nova descoberta em inteligência artificial revoluciona o setor',
    status: 'publicada', tagIds: ['2'], viewsCount: 1240,
    contentBody: 'Pesquisadores anunciaram uma nova técnica de aprendizado profundo que promete transformar como as máquinas entendem linguagem natural. O modelo, desenvolvido ao longo de três anos, supera benchmarks anteriores em mais de 40% nas tarefas de compreensão textual.\n\nEspecialistas da área consideram o avanço um marco para a inteligência artificial aplicada. A técnica, denominada Sparse Contextual Attention, permite que modelos de linguagem processem textos longos com uma fração do custo computacional anterior.\n\nAs aplicações práticas já estão sendo exploradas em diagnóstico médico, análise jurídica e sistemas de recomendação de conteúdo. Empresas do setor estimam que a tecnologia estará disponível comercialmente ainda este ano.',
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: '2', authorId: '3', cityId: '3',
    title: 'Eleições 2026: cenário político se define nas capitais',
    status: 'em_revisao', tagIds: ['1'], viewsCount: 0,
    contentBody: 'Com as eleições se aproximando, os principais partidos finalizam suas alianças nas capitais brasileiras. Pesquisas de intenção de voto mostram cenário disputado em São Paulo, Rio de Janeiro e Minas Gerais.',
    createdAt: '2026-04-11T09:00:00Z', updatedAt: '2026-04-11T09:00:00Z',
  },
  {
    id: '3', authorId: '3',
    title: 'Copa do Mundo: seleção intensifica preparação',
    status: 'rascunho', tagIds: ['3'], viewsCount: 0,
    contentBody: 'A seleção brasileira realizou treino intenso visando o torneio internacional. O técnico convocou 26 jogadores para o período de preparação.',
    createdAt: '2026-04-12T14:00:00Z', updatedAt: '2026-04-12T14:00:00Z',
  },
  {
    id: '4', authorId: '3', cityId: '1',
    title: 'Mercado financeiro registra alta histórica',
    status: 'lixeira', tagIds: ['4'], viewsCount: 0,
    contentBody: 'O Ibovespa registrou a maior alta em cinco anos, impulsionado por resultados positivos do setor de commodities.',
    createdAt: '2026-04-08T11:00:00Z', updatedAt: '2026-04-13T08:00:00Z',
  },
  {
    id: '5', authorId: '3', cityId: '5',
    title: 'Festival de cinema traz grandes estreias internacionais',
    status: 'publicada', tagIds: ['5'], viewsCount: 892,
    contentBody: 'O festival internacional de cinema abre suas portas com mais de 80 filmes de 40 países. A curadoria deste ano destaca produções latino-americanas e documentários sobre mudanças climáticas.\n\nEntre os destaques está a retrospectiva do diretor argentino Pablo Larraín, com sessões especiais seguidas de debate com os realizadores. Ingressos disponíveis no site oficial do evento.\n\nO festival terá ainda uma seção dedicada a produções brasileiras inéditas, consolidando o país como referência no cinema independente mundial.',
    createdAt: '2026-04-09T16:00:00Z', updatedAt: '2026-04-09T16:00:00Z',
  },
  {
    id: '6', authorId: '3', cityId: '2',
    title: 'Startup paulista levanta R$ 50 milhões em rodada série B',
    status: 'publicada', tagIds: ['2', '4'], viewsCount: 456,
    contentBody: 'A fintech Chronicle Pay anunciou hoje o fechamento de uma rodada série B de R$ 50 milhões liderada por fundo de venture capital americano.\n\nOs recursos serão usados para expansão para o mercado latinoamericano e contratação de 200 novos funcionários até o final do ano.',
    createdAt: '2026-04-14T08:00:00Z', updatedAt: '2026-04-14T08:00:00Z',
  },
  {
    id: '7', authorId: '3', cityId: '3',
    title: 'Rio sedia conferência internacional de sustentabilidade',
    status: 'publicada', tagIds: ['1', '5'], viewsCount: 234,
    contentBody: 'O Rio de Janeiro recebe esta semana a maior conferência de sustentabilidade da América Latina, reunindo líderes empresariais, governamentais e da sociedade civil.\n\nEntre os temas centrais estão a transição energética, a economia circular e os impactos das mudanças climáticas nas cidades costeiras.',
    createdAt: '2026-04-15T10:00:00Z', updatedAt: '2026-04-15T10:00:00Z',
  },
];

const SEED_COMMENTS: Comment[] = [
  { id: '1', newsId: '1', userId: '2', content: 'Excelente artigo! Muito informativo e bem escrito.', status: 'active', reportCount: 0, createdAt: '2026-04-10T11:00:00Z', likeCount: 0, likedByIds: [], reportedByIds: [] },
  { id: '2', newsId: '1', userId: '5', content: 'Concordo plenamente com a análise apresentada.', status: 'active', reportCount: 0, createdAt: '2026-04-10T12:00:00Z', likeCount: 0, likedByIds: [], reportedByIds: [] },
  { id: '3', newsId: '5', userId: '2', content: 'Não vejo a hora do festival começar!', status: 'active', reportCount: 0, createdAt: '2026-04-09T17:00:00Z', likeCount: 0, likedByIds: [], reportedByIds: [] },
  { id: '4', newsId: '5', userId: '5', content: 'Ótima cobertura do evento!', status: 'active', reportCount: 0, createdAt: '2026-04-09T18:00:00Z', likeCount: 0, likedByIds: [], reportedByIds: [] },
  { id: '5', newsId: '1', userId: '2', content: 'Conteúdo de baixa qualidade, absolutamente inaceitável.', status: 'active', reportCount: 2, createdAt: '2026-04-10T13:00:00Z', likeCount: 0, likedByIds: [], reportedByIds: ['4', '5'] },
  { id: '6', newsId: '5', userId: '5', content: 'Isso é spam, não tem nada a ver com o artigo!', status: 'active', reportCount: 3, createdAt: '2026-04-09T19:00:00Z', likeCount: 0, likedByIds: [], reportedByIds: ['1', '2', '3'] },
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
  // News (admin)
  updateNewsStatus: (id: string, status: NewsStatus) => void;
  // News (author)
  addNews: (payload: { title: string; contentBody: string; tagIds: string[]; cityId?: string; coverImageUrl?: string }) => void;
  updateNews: (id: string, data: { title: string; contentBody: string; tagIds: string[]; cityId?: string; coverImageUrl?: string }) => void;
  deleteNews: (id: string) => void;
  submitForReview: (id: string) => void;
  rejectNews: (id: string, reason: string) => void;
  // Comments (admin)
  updateCommentStatus: (id: string, status: CommentStatus) => void;
  // Comments (reader)
  addComment: (payload: { newsId: string; userId: string; content: string; parentId?: string }) => void;
  likeComment: (commentId: string, userId: string) => void;
  reportComment: (commentId: string, userId: string) => void;
  // News (reader)
  toggleSaveNews: (newsId: string, userId: string) => void;
  // Follows
  toggleFollowTag: (tagId: string, userId: string) => void;
  toggleFollowAuthor: (authorId: string, userId: string) => void;
  // Reading preferences
  updateReadingPrefs: (userId: string, prefs: Partial<Pick<User, 'readingFontSize' | 'readingBackground'>>) => void;
  incrementViews: (newsId: string) => void;
  updateUserProfile: (userId: string, data: { name: string; bio?: string }) => void;
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
          tags: [...s.tags, { id: uid(), name, colorHex, createdAt: new Date().toISOString() }],
        })),

      updateTag: (id, { name, colorHex }) =>
        set((s) => ({ tags: s.tags.map((t) => (t.id === id ? { ...t, name, colorHex } : t)) })),

      removeTag: (id) =>
        set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),

      addState: ({ name, acronym }) =>
        set((s) => ({ states: [...s.states, { id: uid(), name, acronym }] })),

      updateState: (id, { name, acronym }) =>
        set((s) => ({ states: s.states.map((st) => (st.id === id ? { ...st, name, acronym } : st)) })),

      removeState: (id) =>
        set((s) => ({
          states: s.states.filter((st) => st.id !== id),
          cities: s.cities.filter((c) => c.stateId !== id),
        })),

      addCity: ({ stateId, name }) =>
        set((s) => ({ cities: [...s.cities, { id: uid(), stateId, name }] })),

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

      addNews: ({ title, contentBody, tagIds, cityId, coverImageUrl }) =>
        set((s) => ({
          news: [
            ...s.news,
            {
              id: uid(),
              authorId: s.currentUser!.id,
              title,
              contentBody,
              tagIds,
              cityId,
              coverImageUrl,
              status: 'rascunho' as const,
              viewsCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateNews: (id, data) =>
        set((s) => ({
          news: s.news.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNews: (id) =>
        set((s) => ({ news: s.news.filter((n) => n.id !== id) })),

      submitForReview: (id) =>
        set((s) => ({
          news: s.news.map((n) =>
            n.id === id ? { ...n, status: 'em_revisao' as const, updatedAt: new Date().toISOString() } : n
          ),
        })),

      rejectNews: (id, reason) =>
        set((s) => ({
          news: s.news.map((n) =>
            n.id === id
              ? { ...n, status: 'lixeira' as const, rejectionReason: reason, updatedAt: new Date().toISOString() }
              : n
          ),
        })),

      updateCommentStatus: (id, status) =>
        set((s) => ({ comments: s.comments.map((c) => (c.id === id ? { ...c, status } : c)) })),

      addComment: ({ newsId, userId, content, parentId }) =>
        set((s) => ({
          comments: [
            ...s.comments,
            {
              id: uid(),
              newsId,
              userId,
              content,
              status: 'active',
              reportCount: 0,
              createdAt: new Date().toISOString(),
              parentId,
              likeCount: 0,
              likedByIds: [],
              reportedByIds: [],
            },
          ],
        })),

      likeComment: (commentId, userId) =>
        set((s) => ({
          comments: s.comments.map((c) => {
            if (c.id !== commentId) return c;
            const liked = c.likedByIds.includes(userId);
            return {
              ...c,
              likeCount: liked ? c.likeCount - 1 : c.likeCount + 1,
              likedByIds: liked
                ? c.likedByIds.filter((id) => id !== userId)
                : [...c.likedByIds, userId],
            };
          }),
        })),

      reportComment: (commentId, userId) =>
        set((s) => ({
          comments: s.comments.map((c) => {
            if (c.id !== commentId || c.reportedByIds.includes(userId)) return c;
            return {
              ...c,
              reportCount: c.reportCount + 1,
              reportedByIds: [...c.reportedByIds, userId],
            };
          }),
        })),

      toggleSaveNews: (newsId, userId) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const saved = u.savedNewsIds.includes(newsId);
            return {
              ...u,
              savedNewsIds: saved
                ? u.savedNewsIds.filter((id) => id !== newsId)
                : [...u.savedNewsIds, newsId],
            };
          }),
          currentUser:
            s.currentUser?.id === userId
              ? (() => {
                  const saved = s.currentUser.savedNewsIds.includes(newsId);
                  return {
                    ...s.currentUser,
                    savedNewsIds: saved
                      ? s.currentUser.savedNewsIds.filter((id) => id !== newsId)
                      : [...s.currentUser.savedNewsIds, newsId],
                  };
                })()
              : s.currentUser,
        })),

      toggleFollowTag: (tagId, userId) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const following = u.followedTagIds.includes(tagId);
            return {
              ...u,
              followedTagIds: following
                ? u.followedTagIds.filter((id) => id !== tagId)
                : [...u.followedTagIds, tagId],
            };
          }),
          currentUser:
            s.currentUser?.id === userId
              ? (() => {
                  const following = s.currentUser.followedTagIds.includes(tagId);
                  return {
                    ...s.currentUser,
                    followedTagIds: following
                      ? s.currentUser.followedTagIds.filter((id) => id !== tagId)
                      : [...s.currentUser.followedTagIds, tagId],
                  };
                })()
              : s.currentUser,
        })),

      toggleFollowAuthor: (authorId, userId) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const following = u.followedAuthorIds.includes(authorId);
            return {
              ...u,
              followedAuthorIds: following
                ? u.followedAuthorIds.filter((id) => id !== authorId)
                : [...u.followedAuthorIds, authorId],
            };
          }),
          currentUser:
            s.currentUser?.id === userId
              ? (() => {
                  const following = s.currentUser.followedAuthorIds.includes(authorId);
                  return {
                    ...s.currentUser,
                    followedAuthorIds: following
                      ? s.currentUser.followedAuthorIds.filter((id) => id !== authorId)
                      : [...s.currentUser.followedAuthorIds, authorId],
                  };
                })()
              : s.currentUser,
        })),

      updateReadingPrefs: (userId, prefs) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, ...prefs } : u)),
          currentUser:
            s.currentUser?.id === userId
              ? { ...s.currentUser, ...prefs }
              : s.currentUser,
        })),

      incrementViews: (newsId) =>
        set((s) => ({
          news: s.news.map((n) =>
            n.id === newsId
              ? { ...n, viewsCount: n.viewsCount + 1, updatedAt: new Date().toISOString() }
              : n
          ),
        })),

      updateUserProfile: (userId, data) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, ...data } : u)),
          currentUser:
            s.currentUser?.id === userId
              ? { ...s.currentUser, ...data }
              : s.currentUser,
        })),
    }),
    {
      name: 'chronicle_store_v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
