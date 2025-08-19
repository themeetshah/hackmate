// ToastStack.jsx
import React from 'react';
import Toast from './Toast';

const ToastStack = ({
    toasts = [],
    position = 'top-right',
    onCloseToast
}) => {
    const gap = 16; // gap in px between toasts

    // Calculate vertical stacking using inline styles
    return (
        <div className={`fixed z-50 ${{
            'top-right': 'top-10 right-4',
            'top-left': 'top-4 left-4',
            'bottom-right': 'bottom-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
            'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
        }[position]}`} style={{ pointerEvents: 'none' }}>
            {toasts.map((toast, i) => (
                <div
                    key={toast.id}
                    style={{
                        marginBottom: toasts.length > 1 && position.startsWith("top") ? gap : 0,
                        marginTop: toasts.length > 1 && position.startsWith("bottom") ? gap : 0,
                        pointerEvents: 'auto'
                    }}
                >
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        isVisible={true}
                        onClose={() => onCloseToast(toast.id)}
                        duration={toast.duration}
                        position={position}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastStack;
