// types/admin.ts
export type Role = 'leitor' | 'autor' | 'editor' | 'superadmin';
export type NewsStatus = 'rascunho' | 'em_revisao' | 'publicada' | 'lixeira';
export type CommentStatus = 'active' | 'deleted_by_user' | 'deleted_by_moderator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string;
  profilePictureUrl?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  colorHex: string;
  createdAt: string;
}

export interface State {
  id: string;
  name: string;
  acronym: string;
}

export interface City {
  id: string;
  stateId: string;
  name: string;
}

export interface News {
  id: string;
  authorId: string;
  title: string;
  status: NewsStatus;
  tagIds: string[];
  coverImageUrl?: string;
  contentBody: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  newsId: string;
  userId: string;
  content: string;
  status: CommentStatus;
  reportCount: number;
  createdAt: string;
}
