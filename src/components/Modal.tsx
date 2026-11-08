import type { ReactNode } from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: 'normal' | 'wide';
  celebrate?: boolean;
}

export const Modal = ({
  kicker,
  title,
  subtitle,
  children,
  footer,
  onClose,
  size = 'normal',
  celebrate = false,
}: ModalProps) => (
  <div
    className={`modal-backdrop ${celebrate ? 'modal-backdrop--celebrate' : ''}`}
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div
      className={`modal-card ${size === 'wide' ? 'modal-card--wide' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button className="modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon size={20} />
      </button>
      <header className="modal-header">
        {kicker && <p className="modal-kicker">{kicker}</p>}
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
      </header>
      <div className="modal-body">{children}</div>
      {footer && <footer className="modal-footer">{footer}</footer>}
    </div>
  </div>
);
