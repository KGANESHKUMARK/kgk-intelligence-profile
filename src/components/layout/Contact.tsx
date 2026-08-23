import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Download, Github, Linkedin, Mail, MapPin, Phone, Printer, Share2 } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { Button, LinkButton } from '../common/Button';
import { profile } from '../../data/profile';
import { useShare } from '../../hooks/useShare';
import { useAppState } from '../../hooks/useAppState';
import { useProfileUrl } from '../../hooks/useProfileUrl';
import { fadeUp, viewportOnce } from '../../lib/motion';

export function Contact() {
  const { share, message } = useShare();
  const { printResume } = useAppState();
  const url = useProfileUrl();

  const channels = [
    { icon: Mail, label: 'Email', value: profile.social.email, href: `mailto:${profile.social.email}` },
    { icon: Phone, label: 'Phone', value: profile.social.phone, href: `tel:${profile.social.phone.replace(/\s/g, '')}` },
    { icon: Linkedin, label: 'LinkedIn', value: profile.social.linkedin.replace(/^https:\/\/(www\.)?/, ''), href: profile.social.linkedin, external: true },
    { icon: Github, label: 'GitHub', value: profile.social.github.replace(/^https:\/\/(www\.)?/, ''), href: profile.social.github, external: true },
  ];

  return (
    <Section id="contact" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute bottom-0 left-1/2 h-[420px] w-[820px] -translate-x-1/2 translate-y-1/3 rounded-full blur-[130px]"
          style={{ background: 'var(--glow)' }}
        />
      </div>

      <div className="relative">
        <SectionHeader
          index="11"
          eyebrow="Contact"
          title="Let's Build Something Intelligent"
          description={profile.availability}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="surface-card ticked p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h3 className="text-xl font-semibold tracking-tight">{profile.name}</h3>
              <span className="text-sm text-[var(--accent-text)]">{profile.title}</span>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-[var(--text-3)]">
              <MapPin size={12} strokeWidth={1.75} aria-hidden="true" />
              {profile.currentRole} · {profile.currentCompany} · {profile.location}
            </p>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {channels.map(({ icon: Ico, label, value, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-line)]"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface)] text-[var(--text-3)] transition-colors group-hover:border-[var(--accent-line)] group-hover:text-[var(--accent-text)]">
                      <Ico size={14} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="mono-label block">{label}</span>
                      <span className="mt-0.5 block truncate text-[0.8125rem] text-[var(--text)]">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <LinkButton href={`mailto:${profile.social.email}`} variant="primary">
                <Mail size={15} strokeWidth={2} aria-hidden="true" />
                Contact Me
              </LinkButton>
              <LinkButton href={profile.social.linkedin} external variant="secondary">
                <Linkedin size={15} strokeWidth={2} aria-hidden="true" />
                LinkedIn
              </LinkButton>
              <LinkButton href={profile.social.github} external variant="secondary">
                <Github size={15} strokeWidth={2} aria-hidden="true" />
                GitHub
              </LinkButton>
              <LinkButton href={profile.resumeFile} download variant="outline">
                <Download size={15} strokeWidth={2} aria-hidden="true" />
                Download Resume
              </LinkButton>
              <Button variant="outline" onClick={printResume}>
                <Printer size={15} strokeWidth={2} aria-hidden="true" />
                Print Resume
              </Button>
              <Button variant="outline" onClick={share}>
                {message ? (
                  <Check size={15} strokeWidth={2} className="text-[var(--accent-text)]" aria-hidden="true" />
                ) : (
                  <Share2 size={15} strokeWidth={2} aria-hidden="true" />
                )}
                {message || 'Share Profile'}
              </Button>
            </div>
          </motion.div>

          {/* QR */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="surface-card flex flex-col items-center justify-center p-5 lg:w-[240px]"
          >
            <p className="mono-label mb-3">Scan to open</p>
            <div className="rounded-lg border border-[var(--line)] bg-white p-3">
              {url ? (
                <QRCodeSVG
                  value={url}
                  size={150}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#08090c"
                  aria-label="QR code linking to this profile"
                />
              ) : (
                <div className="h-[150px] w-[150px]" aria-hidden="true" />
              )}
            </div>
            <p className="mt-3 text-center text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
              Point a phone camera here to open this profile.
            </p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
