import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000); // Auto dismiss
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const value = {
        success: (msg) => addToast('success', msg),
        error: (msg) => addToast('error', msg),
        warning: (msg) => addToast('warning', msg),
        info: (msg) => addToast('info', msg),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={cn(
                                "flex items-start p-4 rounded-lg shadow-lg border animate-in slide-in-from-right duration-300",
                                "bg-white backdrop-blur-md",
                                {
                                    "border-l-4 border-l-success": toast.type === 'success',
                                    "border-l-4 border-l-danger": toast.type === 'error',
                                    "border-l-4 border-l-warning": toast.type === 'warning',
                                    "border-l-4 border-l-primary": toast.type === 'info',
                                }
                            )}
                        >
                            <div className="flex-shrink-0 mr-3">
                                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-success" />}
                                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-danger" />}
                                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-warning" />}
                                {toast.type === 'info' && <Info className="w-5 h-5 text-primary" />}
                            </div>
                            <div className="flex-1 text-sm font-medium text-gray-900">{toast.message}</div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
