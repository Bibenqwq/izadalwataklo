import React, { useState } from 'react';
import JournalEditor from './components/JournalEditor';
import LanyardIdBadge from './components/LanyardIdBadge';
import './App.css';

const WRITER_PASSWORD = 'eliza2getherwithbeben';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'sulat' | 'basa'
  const [toastMessage, setToastMessage] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessStep, setAccessStep] = useState('role');
  const [writerPassword, setWriterPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const openRoleChooser = () => {
    setAccessStep('role');
    setWriterPassword('');
    setPasswordError('');
    setShowAccessModal(true);
  };

  const openReaderView = () => {
    setShowAccessModal(false);
    setCurrentView('basa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast('[Basa] Pumili ng sulat para i-preview...');
  };

  const submitWriterPassword = (event) => {
    event.preventDefault();
    if (writerPassword !== WRITER_PASSWORD) {
      setPasswordError('Mali ang password. Subukan muli.');
      return;
    }

    setShowAccessModal(false);
    setWriterPassword('');
    setPasswordError('');
    setCurrentView('sulat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerToast('[Sulat] Handa nang magsulat ng talaarawan...');
  };

  const closeAccessModal = () => {
    setShowAccessModal(false);
    setWriterPassword('');
    setPasswordError('');
  };

  const returnHome = (sectionId = null) => {
    setCurrentView('home');
    if (sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="app-container">
      {/* Film Grain Texture Overlay */}
      <div className="grain-overlay" aria-hidden="true"></div>

      {currentView === 'sulat' ? (
        /* ========================================================
           DEDICATED SULAT / JOURNAL VIEW
           Hindi kasama sa homepage/index layout!
           Nangangailangan lamang ng view state, walang bagong index o text file.
           ======================================================== */
        <JournalEditor
          mode="writer"
          onToast={triggerToast}
          onBackToHome={() => returnHome()}
        />
      ) : currentView === 'basa' ? (
        <JournalEditor
          mode="reader"
          onToast={triggerToast}
          onBackToHome={() => returnHome()}
        />
      ) : (
        /* ========================================================
           HOMEPAGE (INDEX VIEW)
           Malinis, orihinal, at hindi nakahalo rito ang journal section.
           ======================================================== */
        <>
          {/* Top Navigation */}
          <header className="top-nav-container">
            {/* Left Side: Nav Buttons */}
            <div className="nav-left-buttons">
              <button
                className="nav-action-btn"
                onClick={openRoleChooser}
              >
                sulat
              </button>
              <button
                className="nav-action-btn"
                onClick={() => {
                  document.getElementById('pag-alay-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                pag-alay
              </button>
              <button
                className="nav-action-btn"
                onClick={() => {
                  document.getElementById('social-media-bar')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                social media
              </button>
            </div>

            {/* Center: Brand Logo */}
            <div className="nav-center-logo">
              <button
                className="nav-brand-badge"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                iza.dalwa.taklo
              </button>
            </div>

            {/* Right Side Spacer to maintain centered logo */}
            <div className="nav-right-spacer" aria-hidden="true"></div>
          </header>

          {/* Hero Section Featuring home.jpg with single button */}
          <section className="hero-section">
            <img
              src="/img/home.jpg"
              alt="iza.dalwa.taklo Journal System Hero"
              className="hero-bg-media"
            />
            <div className="hero-overlay"></div>

            {/* Hero Lockup */}
            <div className="hero-lockup-row">
              <h1 className="hero-statement">
                <span className="statement-mono">ang sumulat ay</span>
                <span className="statement-script">paghinga</span>
              </h1>
            </div>
          </section>

          {/* ========================================================
              PAG-ALAY & SOCIAL MEDIAS SECTION (Zine / Editorial Layout)
              Exact Layout from User Reference: Dual typography, red duotone portrait,
              metadata, inline socmedias, and sticker gallery!
              ======================================================== */}
          <section className="zine-editorial-section" id="pag-alay-section">
            <div className="zine-container">

              {/* ================= UPPER BLOCK: PAG-ALAY & SOCMEDIAS ================= */}
              <div className="zine-upper-block">
                {/* Top Row: Dual Typography Title on Left, Narrative on Right */}
                <div className="zine-top-row">
                  <div className="zine-title-col">
                    <h2 className="zine-heading">
                      <span className="zine-head-condensed">PAG</span>
                      <span className="zine-head-script">alay</span>
                    </h2>
                  </div>

                  <div className="zine-narrative-col">
                    <p className="zine-narrative-p">
                      Hello! Ako si Steven, ang boyfriend ni Eliza.
                    </p>
                    <p className="zine-narrative-p">
                      Ginawa ko ang website na 'to upang bigyang alay ang mga sulat niya at mabasa ng tao ang kaniyang nararamdaman. Binigay ko ang buong puso ko at nagbigay ito ng kasiyahan sa akin habang binubuo ko ito.
                    </p>
                    <p className="zine-narrative-p">
                      Salamat sa 'yo, mahal ko. Nagkaroon ako ng oportunidad para mag-alay sa iyo sa ganitong paraan.
                    </p>
                    <p className="zine-narrative-p">
                      Ipagpatuloy mo ang pagsusulat mo. Mahal na mahal kita.
                    </p>
                  </div>
                </div>

                {/* Mga larawan */}
                <div className="zine-portrait-row">
                  <div className="zine-portrait-cards">
                    <article className="zine-portrait-card zine-portrait-card-steven">
                      <div className="zine-portrait-box">
                        <img
                          src="/img/steven.png"
                          alt="Portrait ni Steven"
                          className="zine-portrait-image"
                        />
                      </div>
                    </article>
                    <article className="zine-portrait-card zine-portrait-card-beben">
                      <div className="zine-portrait-box">
                        <img
                          src="/img/beben.jpg"
                          alt="Portrait ni Beben"
                          className="zine-portrait-image"
                        />
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              {/* ================= LOWER BLOCK: GALERIA WITH STICKERS & INTERACTIVE LANYARD ID ================= */}
              <div className="zine-gallery-block">
                {/* Gallery Left: Dual Header & Poetic Description */}
                <div className="zine-gallery-left">
                  <h3 className="zine-heading">
                    <span className="zine-head-condensed">Eliza</span>
                    <span className="zine-head-script">socmed</span>
                  </h3>
                  <p className="zine-gallery-desc">
                    Sundan ang mga kwento, tula, at eksena ni Eliza sa kanyang mga social media — kung saan ang bawat post ay isang pahina ng kanyang talaarawan.
                  </p>
                </div>

                {/* Gallery Right: Interactive 3D Lanyard ID Badge Showcase */}
                <div className="zine-gallery-cards-row lanyard-center-row">
                  {/* 3D Interactive Lanyard ID Badge hanging directly from line gap */}
                  <div className="zine-lanyard-stage-wrap">
                    <LanyardIdBadge onToast={triggerToast} />
                  </div>
                </div>
              </div>

              {/* ================= PINAKA FOOTER: INSTAGRAM AT FACEBOOK ================= */}
              <footer className="zine-bottom-footer" aria-label="Footer Social Media Links">
                <nav className="zine-footer-socmed-nav">
                  <a
                    href="https://www.instagram.com/iza.dalawa.taklo/"
                    target="_blank"
                    rel="noreferrer"
                    className="zine-footer-link"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerToast('[Instagram] @iza.dalwa.taklo — Ibinubukas...');
                    }}
                  >
                    INSTAGRAM
                  </a>
                  <span className="zine-footer-divider">/</span>
                  <a
                    href="https://www.instagram.com/iza.dalawa.taklo/"
                    target="_blank"
                    rel="noreferrer"
                    className="zine-footer-link"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerToast('[Facebook] facebook.com/izadalwataklo — Ibinubukas...');
                    }}
                  >
                    FACEBOOK
                  </a>
                </nav>
              </footer>

            </div>
          </section>
        </>
      )}

      {currentView === 'home' && showAccessModal && (
        <div className="access-modal-overlay" onClick={closeAccessModal}>
          <section
            className="access-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="access-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="access-modal-close"
              onClick={closeAccessModal}
              aria-label="Isara"
            >
              ×
            </button>
            {accessStep === 'role' ? (
              <>
                <span className="access-modal-eyebrow">IZA.DALWA.TAKLO</span>
                <h2 id="access-modal-title">Paano mo gustong pumasok?</h2>
                <p className="access-modal-description">
                  Piliin kung magbabasa ka ng mga sulat o magdadagdag ng bagong tala.
                </p>
                <div className="access-role-options">
                  <button
                    type="button"
                    className="access-role-button"
                    onClick={openReaderView}
                  >
                    <strong>Tagabasa</strong>
                    <span>Mag-browse at mag-preview lang ng mga sulat.</span>
                  </button>
                  <button
                    type="button"
                    className="access-role-button access-role-writer"
                    onClick={() => {
                      setAccessStep('password');
                      setPasswordError('');
                    }}
                  >
                    <strong>Tagasulat</strong>
                    <span>Kailangan ng password para makapagsulat.</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="access-modal-eyebrow">PARA SA TAGASULAT</span>
                <h2 id="access-modal-title">Ilagay ang password</h2>
                <p className="access-modal-description">
                  Kailangan ito bago buksan ang writing space.
                </p>
                <form className="access-password-form" onSubmit={submitWriterPassword}>
                  <label htmlFor="writer-password">Password</label>
                  <input
                    id="writer-password"
                    type="password"
                    value={writerPassword}
                    onChange={(event) => {
                      setWriterPassword(event.target.value);
                      setPasswordError('');
                    }}
                    autoComplete="current-password"
                    autoFocus
                    required
                  />
                  {passwordError && (
                    <p className="access-password-error" role="alert">
                      {passwordError}
                    </p>
                  )}
                  <div className="access-modal-actions">
                    <button
                      type="button"
                      className="access-back-button"
                      onClick={() => {
                        setAccessStep('role');
                        setWriterPassword('');
                        setPasswordError('');
                      }}
                    >
                      Bumalik
                    </button>
                    <button type="submit" className="access-submit-button">
                      Magpatuloy
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="cart-toast" role="status">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
