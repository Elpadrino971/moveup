/**
 * MoovUp Now - Types Index
 *
 * Central export for all TypeScript types
 */

export * from './user';
export * from './session';
export * from './coaching';
export * from './shop';

// Common types
export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

export type Notification = {
  id: string;
  userId: string;
  type:
    | 'session-match'
    | 'session-reminder'
    | 'session-cancelled'
    | 'new-message'
    | 'achievement'
    | 'report-update'
    | 'shop-order';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
};

export type AppError = {
  code: string;
  message: string;
  details?: any;
};
