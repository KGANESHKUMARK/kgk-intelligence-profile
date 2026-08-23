import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EASE } from '../../lib/motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Renders as a right-hand drawer on desktop instead of a centred dialog. */
  variant?: 'dialog' | 'drawer';
  labelledBy?: string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, subtitle, children, variant = 'drawer' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;

    const { style } = document.body;
    const prevOverflow = style.overflow;
    style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    // Focus the panel itself so screen readers announce the dialog title.
    const raf = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(raf);
      style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  const isDrawer = variant === 'drawer';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex" role="presentation">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={isDrawer ? { x: '100%' } : { opacity: 0, scale: 0.97, y: 12 }}
            animate={isDrawer ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isDrawer ? { x: '100%' } : { opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.32, ease: EASE }}
            className={cn(
              'relative flex flex-col bg-[var(--bg-elev)] outline-none',
              isDrawer
                ? 'ml-auto h-full w-full max-w-[min(680px,100vw)] border-l border-[var(--line-strong)] shadow-[var(--shadow-lift)]'
                : 'm-auto max-h-[88vh] w-[min(760px,94vw)] rounded-2xl border border-[var(--line-strong)] shadow-[var(--shadow-lift)]',
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4 md:px-7 md:py-5">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold tracking-tight md:text-xl">{title}</h2>
                {subtitle && <p className="mt-1 truncate text-sm text-[var(--text-2)]">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-1 shrink-0 rounded-lg border border-[var(--line)] p-2 text-[var(--text-2)] transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
