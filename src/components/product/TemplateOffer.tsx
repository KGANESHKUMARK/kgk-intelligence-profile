import { motion } from 'motion/react';
import { Check, ExternalLink, FileText, Sparkles } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { LinkButton } from '../common/Button';
import { templateOffer } from '../../data/templateOffer';
import { fadeUp, viewportOnce } from '../../lib/motion';
import { trackEvent } from '../../lib/analytics';

const isPlaceholder = templateOffer.checkoutUrl.includes('REPLACE_WITH_YOUR_PRODUCT_URL');

export function TemplateOffer() {
  return (
    <Section id="template-offer" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute bottom-0 left-1/2 h-[380px] w-[760px] -translate-x-1/2 translate-y-1/3 rounded-full blur-[130px]"
          style={{ background: 'var(--glow)' }}
        />
      </div>

      <div className="relative">
        <SectionHeader
          index="14"
          eyebrow="Get the Template"
          title="Build Your Own Interactive Profile"
          description="Want this exact class of interactive engineering profile for yourself or your team? Buy the build template and rebuild it for any person, any domain, in a single AI coding session."
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* What it is + what's included */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="surface-card p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]">
                <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{templateOffer.productName}</h3>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                  {templateOffer.productBlurb}
                </p>
              </div>
            </div>

            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {templateOffer.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check
                    size={15}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-[var(--accent-text)]"
                    aria-hidden="true"
                  />
                  <span className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Buy card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="surface-card flex flex-col p-5"
          >
            <span className="mono-label">Digital product</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">{templateOffer.price}</span>
              <span className="text-[0.8125rem] text-[var(--text-3)]">one-time</span>
            </div>

            <ul className="mt-4 space-y-2 text-[0.8125rem] text-[var(--text-2)]">
              <li className="flex items-center gap-2">
                <Sparkles size={14} strokeWidth={1.75} className="text-[var(--accent-text)]" aria-hidden="true" />
                Instant download + email receipt
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={14} strokeWidth={1.75} className="text-[var(--accent-text)]" aria-hidden="true" />
                Card, Apple Pay &amp; Google Pay
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={14} strokeWidth={1.75} className="text-[var(--accent-text)]" aria-hidden="true" />
                No backend to run — pure markdown
              </li>
            </ul>

            <div className="mt-5 flex flex-col gap-2">
              <LinkButton
                href={templateOffer.checkoutUrl}
                external
                variant="primary"
                size="lg"
                aria-disabled={isPlaceholder}
                className={isPlaceholder ? 'pointer-events-none opacity-60' : ''}
                onClick={() => trackEvent('template_buy_clicked', { product: templateOffer.productName })}
              >
                <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
                {isPlaceholder ? 'Buy Now (link pending)' : `Buy Now · ${templateOffer.price}`}
              </LinkButton>
              {isPlaceholder && (
                <p className="text-center text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
                  Checkout link is a placeholder. Replace it in{' '}
                  <code className="font-mono">src/data/templateOffer.ts</code> once your Gumroad listing is live.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
