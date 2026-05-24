"use client";

import LocaleLink from "@/components/LocaleLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import { useTranslation } from "@/components/LanguageProvider";

const SHARE_URL = "https://romamission.eu";

export default function ThankYouPage() {
  const { t } = useTranslation();
  const shareText = t("thankYou.shareText");
  const shareTitle = t("thankYou.shareTitle");

  return (
    <main className="min-h-full bg-[var(--bg-primary)] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="flex flex-col items-center text-center gap-8 max-w-[540px]">
          {/* Icon */}
          <div className="w-16 h-16 border border-[var(--gold)] flex items-center justify-center">
            <span className="font-georgia text-[28px] text-[var(--gold)]">✦</span>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
              {t("thankYou.eyebrow")}
            </p>
            <h1 className="text-[36px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              {t("thankYou.headlineLine1")}<br />{t("thankYou.headlineLine2")}
            </h1>
            <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7]">
              {t("thankYou.intro")}
            </p>
          </div>

          {/* Tax notice */}
          <div className="w-full border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 flex gap-3 items-start text-left">
            <span className="text-[var(--gold)] text-[12px] flex-shrink-0 mt-0.5">ℹ</span>
            <p className="text-[11px] text-[var(--text-secondary)] leading-[1.6]">
              {t("thankYou.taxNoticeCountryPrefix")}
              <strong className="text-[var(--text-primary)] font-semibold">{t("thankYou.taxNoticeCountry")}</strong>
              {t("thankYou.taxNoticeCountrySuffix")}
              {t("thankYou.taxNoticeDeductPrefix")}
              <strong className="text-[var(--text-primary)] font-semibold">{t("thankYou.taxNoticeDeductBold")}</strong>
              {t("thankYou.taxNoticeDeductSuffix")}
            </p>
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-[var(--gold)] opacity-40" />

          {/* Scripture */}
          <p className="text-[14px] font-georgia italic text-[var(--text-muted)] leading-[1.8] max-w-[400px]">
            &ldquo;{t("thankYou.scripture")}&rdquo;
            <span className="block mt-2 not-italic text-[12px] tracking-[1px]">{t("thankYou.scriptureRef")}</span>
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-[var(--gold)] opacity-40" />

          {/* Share section */}
          <div className="w-full flex flex-col gap-5 bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8 text-left">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
                {t("thankYou.oneMoreThing")}
              </p>
              <h2 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
                {t("thankYou.helpSpread")}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                {t("thankYou.helpSpreadDesc")}
              </p>
            </div>

            {/* Share message preview */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] px-4 py-3 text-[12px] text-[var(--text-muted)] leading-[1.7] italic">
              &ldquo;{shareText}&rdquo;
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <ShareButton
                title={shareTitle}
                text={shareText}
                url={SHARE_URL}
                label={t("thankYou.shareCta")}
                className="w-full py-4 px-6 justify-center bg-[var(--gold)] text-[var(--on-accent)] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
              />
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + " " + SHARE_URL)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
                >
                  {t("thankYou.postX")}
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + SHARE_URL)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
                >
                  {t("thankYou.whatsapp")}
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
                >
                  {t("thankYou.facebook")}
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <LocaleLink
              routeKey="home"
              className="px-8 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
            >
              {t("thankYou.backHome")}
            </LocaleLink>
            <LocaleLink
              routeKey="mission"
              className="px-8 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
            >
              {t("thankYou.learnMission")}
            </LocaleLink>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
