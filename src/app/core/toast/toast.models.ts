export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

export interface ToastShowOptions {
  variant?: ToastVariant;
  /** ms; 0 = no auto-dismiss */
  duration?: number;
}
