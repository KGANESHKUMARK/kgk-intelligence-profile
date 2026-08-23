import { motion } from 'motion/react';
import { ArrowDown, Download, Github, Linkedin, MapPin, Presentation, Share2 } from 'lucide-react';
import { Button, LinkButton } from '../common/Button';
import { CapabilityRadar } from './CapabilityRadar';
import { profile } from '../../data/profile';
import { useShare } from '../../hooks/useShare';
import { useAppState } from '../../hooks/useAppState';
import { scrollToSection } from '../../lib/utils';
import { EASE, fadeUp, stagger, viewportOnce } from '../../lib/motion';

export function Hero() {
  const { share } = useShare();
  const { setInterviewMode } = useAppState();

  return (
    <section id="overview" aria-labelledby="overview-heading" className="relative scroll-mt-24 outline-none">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-70" />
        <div
          className="absolute -top-40 left-1/2 h-[560px] w-[880px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: 'var(--glow)' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--bg)]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1240px] px-4 pt-24 pb-8 sm:px-6 md:pt-28 lg:px-8 lg:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-14">
          {/* ------------------------------------------------------------ left */}
          <motion.div variants={stagger(0.06, 0.07)} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-[var(--accent)]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              <span className="mono-label">Engineering Intelligence Profile</span>
              <span className="hidden h-px flex-1 bg-[var(--line)] sm:block" />
            </motion.div>

            <motion.h1
              id="overview-heading"
              variants={fadeUp}
              className="mt-5 text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]"
            >
              <span className="text-gradient">{profile.name}</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-3 text-lg font-medium tracking-tight text-[var(--accent-text)] sm:text-xl"
            >
              {profile.title}
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--text-2)] sm:text-base"
            >
              {profile.tagline}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-4 flex items-center gap-2 text-[0.8125rem] text-[var(--text-3)]">
              <MapPin size={13} strokeWidth={1.75} aria-hidden="true" />
              <span>
                {profile.currentRole} · {profile.currentCompany} · {profile.location}
              </span>
            </motion.div>

            {/* status badges */}
            <motion.ul variants={fadeUp} className="mt-6 flex flex-wrap gap-2" aria-label="Profile highlights">
              {profile.badges.map((b) => (
                <li
                  key={b}
                  className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--text-2)]"
                >
                  {b}
                </li>
              ))}
            </motion.ul>

            {/* actions */}
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center gap-2.5">
              <Button variant="primary" size="lg" onClick={() => scrollToSection('skills')}>
                Explore My Engineering Profile
                <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setInterviewMode(true)}>
                <Presentation size={16} strokeWidth={2} aria-hidden="true" />
                Interview Mode
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-3 flex flex-wrap items-center gap-2">
              <LinkButton href={profile.resumeFile} download variant="outline" size="sm">
                <Download size={14} strokeWidth={2} aria-hidden="true" />
                Download Resume
              </LinkButton>
              <Button variant="outline" size="sm" onClick={share}>
                <Share2 size={14} strokeWidth={2} aria-hidden="true" />
                Share Profile
              </Button>
              <span className="mx-1 hidden h-4 w-px bg-[var(--line)] sm:block" aria-hidden="true" />
              <LinkButton href={profile.social.github} external variant="ghost" size="sm">
                <Github size={14} strokeWidth={2} aria-hidden="true" />
                GitHub
              </LinkButton>
              <LinkButton href={profile.social.linkedin} external variant="ghost" size="sm">
                <Linkedin size={14} strokeWidth={2} aria-hidden="true" />
                LinkedIn
              </LinkButton>
            </motion.div>
          </motion.div>

          {/* ----------------------------------------------------------- right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="relative"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="mono-label">Capability Radar</span>
              <span className="mono-label hidden sm:block">Hover to inspect</span>
            </div>
            <CapabilityRadar />
          </motion.div>
        </div>
      </div>

      {/* Summary strip */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative mx-auto mt-2 w-full max-w-[1240px] px-4 sm:px-6 lg:px-8"
      >
        <div className="surface-card ticked p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-[auto_1fr] md:gap-7">
            <div className="md:w-40">
              <p className="mono-label">Professional Summary</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-[var(--accent-text)]">
                {profile.yearsExperience}
              </p>
              <p className="text-xs text-[var(--text-3)]">years engineering</p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-2)]">{profile.summary}</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
