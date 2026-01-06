import Link from 'next/link';
import styles from './CtaLab.module.css';

export const metadata = {
  title: 'CTA Lab (Mobile) | BM Wealth',
  robots: {
    index: false,
    follow: false,
  },
};

const HERO_BG_URL =
  'https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75';

const CTA_TEXT = 'Access Your Complimentary Wealth Blueprint';

export default function MobileCtaLabPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.bg} style={{ backgroundImage: `url(${HERO_BG_URL})` }} />
        <div className={styles.overlay} />

        <div className={styles.content}>
          <div className={styles.title}>Mobile CTA Lab</div>
          <div className={styles.sub}>
            Dummy route for choosing the mobile-only CTA style. Desktop homepage remains unchanged.
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Variant A — Shimmer text + slow underline sweep</div>
              <Link href="/tools" className={`gold-gradient-text ${styles.ctaBase} ${styles.ctaA}`}>
                {CTA_TEXT}
              </Link>
              <div className={styles.note}>Feels “alive” but stays subtle. No background block.</div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Variant B — Static underline (ultra minimal)</div>
              <Link href="/tools" className={`${styles.ctaBase} ${styles.ctaB}`}>
                {CTA_TEXT}
              </Link>
              <div className={styles.note}>Zero animation. Clean, quiet, premium.</div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Variant C — “Press glow” only (tap feedback)</div>
              <Link href="/tools" className={`${styles.ctaBase} ${styles.ctaC}`}>
                {CTA_TEXT}
              </Link>
              <div className={styles.note}>No idle animation; only reacts when tapped.</div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Variant D — Micro-breathe opacity (very subtle)</div>
              <Link href="/tools" className={`${styles.ctaBase} ${styles.ctaD}`}>
                {CTA_TEXT}
              </Link>
              <div className={styles.note}>Gentle presence; no lines moving across the image.</div>
            </div>
          </div>

          <div className={styles.note} style={{ marginTop: 18 }}>
            Pick A / B / C / D and I’ll apply only that variant to the real mobile hero CTA.
          </div>
        </div>
      </section>
    </div>
  );
}
