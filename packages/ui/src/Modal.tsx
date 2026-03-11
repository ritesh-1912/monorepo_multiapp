/**
 * Modal dialog with overlay. Use for confirmations or forms. No built-in open state; control from parent.
 */
import * as React from 'react';

export interface ModalProps {
  /** When false, render nothing. */
  open: boolean;
  onClose: () => void;
  /** Modal content. */
  children: React.ReactNode;
  /** Optional title for accessibility. */
  title?: string;
  /** Optional class for the content panel. */
  className?: string;
}

export function Modal({ open, onClose, children, title, className = '' }: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg border border-border bg-card p-6 shadow-lg ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id="modal-title" className="mb-4 text-lg font-semibold text-card-foreground">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
