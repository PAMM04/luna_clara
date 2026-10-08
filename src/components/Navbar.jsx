import React, { useState } from 'react';
import { STORE_NAME, WHATSAPP_PHONE } from '../lib/supabase';
import { Sparkles, MessageCircle, ShieldCheck, Menu, X, ShoppingBag } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, adminUser, onOpenAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = WHATSAPP_PHONE.replace(/[^0-9]/g, '');
  const generalWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${STORE_NAME}! Me gustaría recibir información de su catálogo.`)}`;

  return (
    <nav className="navbar-glass">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('catalog')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #24201B 0%, #12100E 100%)',
            border: '1px solid var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(197, 160, 89, 0.2)'
          }}>
            <Sparkles size={20} color="var(--gold-light)" />
          </div>
          <div>
            <span style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.45rem', 
              fontWeight: 700, 
              color: 'var(--color-noir)',
              letterSpacing: '-0.02em',
              display: 'block',
              lineHeight: 1.1
            }}>
              {STORE_NAME}
            </span>
            <span style={{ 
              fontSize: '0.68rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.2em', 
              color: 'var(--gold-dark)', 
              fontWeight: 600,
              display: 'block'
            }}>
              Haute Boutique
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <button
            onClick={() => handleNavClick('catalog')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              fontWeight: currentView === 'catalog' ? 700 : 500,
              color: currentView === 'catalog' ? 'var(--gold-dark)' : 'var(--color-charcoal)',
              padding: '0.4rem 0.6rem',
              position: 'relative'
            }}
          >
            Catálogo
            {currentView === 'catalog' && (
              <span style={{
                position: 'absolute',
                bottom: -2,
                left: '10%',
                right: '10%',
                height: '2px',
                background: 'var(--gold-primary)',
                borderRadius: '2px'
              }} />
            )}
          </button>

          <a
            href={generalWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.84rem' }}
          >
            <MessageCircle size={17} />
            <span>Consultas WhatsApp</span>
          </a>

          <button
            onClick={onOpenAdmin}
            className="btn btn-dark"
            style={{ 
              padding: '0.55rem 1.1rem', 
              fontSize: '0.84rem',
              background: adminUser ? '#1C1917' : 'transparent',
              color: adminUser ? 'var(--gold-light)' : 'var(--color-muted)',
              borderColor: adminUser ? 'var(--gold-primary)' : 'var(--color-sand)'
            }}
            title="Acceso al Panel de Administración"
          >
            <ShieldCheck size={16} color={adminUser ? 'var(--gold-light)' : 'currentColor'} />
            <span>{adminUser ? 'Admin Conectado' : 'Panel Admin'}</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="mobile-toggle">
          <button
            onClick={onOpenAdmin}
            style={{
              background: adminUser ? 'var(--gold-subtle)' : 'transparent',
              border: '1px solid',
              borderColor: adminUser ? 'var(--gold-primary)' : 'var(--color-sand)',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              color: adminUser ? 'var(--gold-dark)' : 'var(--color-charcoal)',
              cursor: 'pointer'
            }}
            title="Panel Admin"
          >
            <ShieldCheck size={18} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-sand)',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-charcoal)',
              cursor: 'pointer'
            }}
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--color-white)',
          borderBottom: '1px solid var(--color-sand)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <button
            onClick={() => handleNavClick('catalog')}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <ShoppingBag size={18} color="var(--gold-dark)" />
            <span>Ver Catálogo de Prendas</span>
          </button>

          <a
            href={generalWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MessageCircle size={18} />
            <span>Escribir por WhatsApp</span>
          </a>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="btn btn-dark"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <ShieldCheck size={18} color="var(--gold-light)" />
            <span>{adminUser ? 'Gestionar Productos (Admin)' : 'Ingresar a Panel Admin'}</span>
          </button>
        </div>
      )}

      {/* Media queries inline for desktop/mobile toggle */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
