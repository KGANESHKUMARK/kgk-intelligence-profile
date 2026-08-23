import type { Variants } from 'motion/react';

/** Shared motion vocabulary — restrained, fast, never bouncy. */

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease: EASE } },
};

export const stagger = (delayChildren = 0.04, staggerChildren = 0.05): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Standard viewport config so sections animate once, early enough to feel instant. */
export const viewportOnce = { once: true, amount: 0.15, margin: '0px 0px -80px 0px' } as const;
