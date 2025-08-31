import { useState } from 'react';

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto remove toast after duration
        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }

        return id;
    };

    const hideToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const hideAllToasts = () => {
        setToasts([]);
    };

    return {
        toasts,
        showToast,
        hideToast,
        hideAllToasts,
        success: (message, duration) => showToast(message, 'success', duration),
        error: (message, duration) => showToast(message, 'error', duration),
        warning: (message, duration) => showToast(message, 'warning', duration),
        info: (message, duration) => showToast(message, 'info', duration),
    };
};
