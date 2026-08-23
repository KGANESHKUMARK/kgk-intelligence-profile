import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { fadeUp, viewportOnce } from '../../lib/motion';

interface SectionHeaderProps {
  index: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  children,
}: SectionHeaderProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn('mb-8 md:mb-10', align === 'center' && 'text-center', className)}
    >
      <div className={cn('flex items-center gap-3', align === 'center' && 'justify-center')}>
        <span className="mono-label text-[var(--accent-text)]">{index}</span>
        <span className="h-px w-8 bg-[var(--line-strong)]" aria-hidden="true" />
        {eyebrow && <span className="mono-label">{eyebrow}</span>}
      </div>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl md:text-[2rem]">{title}</h2>

      {description && (
        <p
          className={cn(
            'mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-2)] sm:text-[0.9375rem]',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}

      {children}
    </motion.div>
  );
}

/** Full-width section wrapper with consistent rhythm and a11y landmark. */
export function Section({
  id,
  children,
  className,
  bleed,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn('scroll-mt-24 py-14 outline-none md:py-20', className)}
    >
      <div className={cn(!bleed && 'mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8')}>{children}</div>
    </section>
  );
}
