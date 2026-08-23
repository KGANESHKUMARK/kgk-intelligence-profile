import { motion } from 'motion/react';
import { Icon } from '../common/Icon';
import { snapshot, valueProps } from '../../data/profile';
import { toneStyle } from '../../lib/utils';
import { fadeUp, stagger, viewportOnce } from '../../lib/motion';
import { SectionHeader } from '../common/SectionHeader';

export function InterviewSnapshot() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="mono-label text-[var(--accent-text)]">00</span>
        <span className="h-px w-8 bg-[var(--line-strong)]" aria-hidden="true" />
        <h2 className="mono-label">Interview Snapshot</h2>
      </div>

      <motion.ul
        variants={stagger(0.02, 0.04)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
      >
        {snapshot.map((item) => (
          <motion.li
            key={item.label}
            variants={fadeUp}
            style={toneStyle(item.tone)}
            className="group surface-card relative overflow-hidden p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--t-line)] hover:shadow-[var(--shadow-lift)] sm:p-4"
          >
            <span
              className="absolute inset-x-0 top-0 h-px scale-x-0 bg-[var(--t-raw)] opacity-60 transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden="true"
            />
            <div className="flex items-start justify-between gap-2">
              <p className="mono-label">{item.label}</p>
              <Icon
                name={item.icon}
                size={15}
                className="shrink-0 text-[var(--text-3)] transition-colors duration-200 group-hover:text-[var(--t-fg)]"
              />
            </div>
            <p className="mt-2 text-[0.9375rem] leading-tight font-semibold tracking-tight">{item.value}</p>
            <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">{item.detail}</p>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export function WhatIBring() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 pb-14 sm:px-6 md:pb-16 lg:px-8">
      <SectionHeader
        index="00"
        eyebrow="Positioning"
        title="What I Bring"
        description="Six capability areas that describe how I contribute on day one."
      />

      <motion.ul
        variants={stagger(0.02, 0.05)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {valueProps.map((v) => (
          <motion.li
            key={v.title}
            variants={fadeUp}
            style={toneStyle(v.tone)}
            className="group surface-card relative p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--t-line)] hover:shadow-[var(--shadow-lift)]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--t-line)] bg-[var(--t-soft)] text-[var(--t-fg)] transition-transform duration-200 group-hover:-translate-y-0.5">
              <Icon name={v.icon} size={17} />
            </span>
            <h3 className="mt-3.5 text-[0.9375rem] font-semibold tracking-tight">{v.title}</h3>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{v.body}</p>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
