import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmDialog {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const useNotifications = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    config: ConfirmDialog;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    config: { title: '', message: '' },
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const showConfirm = useCallback((config: ConfirmDialog): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        resolve(true);
      };

      const handleCancel = () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        resolve(false);
      };

      setConfirmDialog({
        isOpen: true,
        config,
        onConfirm: handleConfirm,
        onCancel: handleCancel
      });
    });
  }, []);

  const hideConfirm = useCallback(() => {
    confirmDialog.onCancel();
  }, [confirmDialog.onCancel]);

  return {
    toasts,
    confirmDialog,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    removeToast,
    hideConfirm
  };
}; 