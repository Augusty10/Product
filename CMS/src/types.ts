import { Timestamp } from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'editor';
  photoURL?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published';
  categoryId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}
