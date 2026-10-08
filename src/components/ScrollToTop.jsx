import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop({ isAdmin = false, bottomOffset = null }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 260) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  // En catálogo, el botón flotante de WhatsApp está en bottom: 1.5rem (58px).
  // Por lo tanto, posicionamos ScrollToTop en bottom: 5.8rem para no solaparse en celulares.
  // En el panel de admin (sin WhatsApp), va directamente en bottom: 1.5rem.
  const resolvedBottom = bottomOffset || (isAdmin ? '1.5rem' : '5.8rem');

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="scroll-to-top-btn"
      style={{
        position: 'fixed',
        bottom: resolvedBottom,
        right: '1.5rem',
        zIndex: 89,
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: 'var(--color-noir)',
        color: 'var(--gold-light)',
        border: '1.5px solid var(--gold-primary)',
        boxShadow: '0 4px 16px rgba(18, 16, 14, 0.35)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeInUp 0.25s ease-out'
      }}
      title="Volver al inicio"
      aria-label="Volver arriba"
    >
      <ArrowUp size={20} strokeWidth={2.4} />
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .scroll-to-top-btn:hover {
          background: var(--gold-primary) !important;
          color: var(--color-noir) !important;
          transform: translateY(-3px) scale(1.05) !important;
          box-shadow: 0 8px 24px rgba(197, 160, 89, 0.45) !important;
        }
        .scroll-to-top-btn:active {
          transform: translateY(0) scale(0.96) !important;
        }
      `}</style>
    </button>
  );
}
