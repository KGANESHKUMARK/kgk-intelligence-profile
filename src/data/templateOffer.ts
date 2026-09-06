/**
 * TEMPLATE OFFER — product configuration for the Gumroad checkout.
 *
 * This is the ONE place to edit once your Gumroad product listing is live:
 *   1. Replace `checkoutUrl` with your real Gumroad "Buy" URL.
 *   2. Replace `price` with your real price (must match the Gumroad listing).
 *   3. Replace `productName` / `productBlurb` if you want different copy.
 *
 * Until then the section renders with clearly-marked placeholders so the
 * layout is testable, but the Buy button links to a safe placeholder.
 */

export interface TemplateOfferConfig {
  /** Display name of the digital product. */
  productName: string;
  /** One-line positioning shown under the title. */
  productBlurb: string;
  /** Display price — must match the live Gumroad listing once set. */
  price: string;
  /**
   * Gumroad hosted checkout URL. Replace the placeholder with your real
   * "Buy" link from the Gumroad product dashboard.
   */
  checkoutUrl: string;
  /** What the buyer receives, as a list of bullet points. */
  includes: string[];
}

export const templateOffer: TemplateOfferConfig = {
  productName: 'Engineering Intelligence Profile — Build Template',
  productBlurb:
    'The complete prompt + architecture blueprint used to generate this interactive interview resume. Drop it into any AI coding session (Devin, Claude, Cursor) and rebuild this class of product for any person, any domain.',
  // PLACEHOLDER price — update to match your Gumroad listing.
  price: '$19',
  // PLACEHOLDER — replace with your real Gumroad checkout URL.
  checkoutUrl: 'https://app.gumroad.com/REPLACE_WITH_YOUR_PRODUCT_URL',
  includes: [
    'The full BUILD_PROMPT_TEMPLATE.md — design system, data architecture, every section spec',
    'Data-driven architecture: edit src/data/*.ts to change all content, no component edits',
    'The "Ion" design system tokens, motion vocabulary and accessibility patterns',
    'Interactive features spec: command palette, interview mode, print resume, scrollspy',
    'Suggested build order so an AI agent reproduces it correctly end-to-end',
  ],
};
