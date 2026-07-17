import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  open:     boolean;
  onClose:  () => void;
  title:    string;
  children: ReactNode;
  size?:    'sm' | 'md' | 'lg' | 'xl';
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop separe — clic ferme */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        onClick={onClose}
      />

      {/* Conteneur scrollable au dessus du backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflowY: 'auto',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          minHeight: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '24px 16px',
        }}>
          {/* Modal content — pointerEvents: auto pour capturer les clics */}
          <div
            className={'bg-white rounded-2xl shadow-2xl w-full modal-animate ' + sizes[size]}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg font-bold"
              >
                x
              </button>
            </div>
            <div className="px-6 py-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}