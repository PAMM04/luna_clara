import React from 'react';
import { STORE_NAME, WHATSAPP_PHONE } from '../lib/supabase';
import { Sparkles, MessageCircle, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onOpenAdmin }) {
  const cleanPhone = WHATSAPP_PHONE.replace(/[^0-9]/g, '');
  const generalWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${STORE_NAME}! Quisiera consultar sobre sus prendas y envíos.`)}`;

  return (
    <footer style={{
      background: 'var(--color-noir)',
      color: 'var(--color-ivory)',
      borderTop: '1px solid rgba(197, 160, 89, 0.25)',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem'
    }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          
          {/* Columna Marca */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--gold-subtle)',
                border: '1px solid var(--gold-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={16} color="var(--gold-light)" />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-ivory)' }}>
                {STORE_NAME}
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#A8A29E', lineHeight: 1.6, maxWidth: '320px' }}>
              Boutique de moda con selección de prendas contemporáneas, telas selectas y asesoramiento personalizado para resaltar tu mejor versión.
            </p>
          </div>

          {/* Columna Atención al Cliente */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-light)', marginBottom: '1rem' }}>
              Atención Directa
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', color: '#D6D3D1' }}>
              <div>📱 WhatsApp: <a href={generalWhatsAppUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>+{cleanPhone}</a></div>
              <div>⏰ Horario: Lunes a Sábado de 09:00 a 19:30</div>
              <div>🚚 Envíos a todo el país coordinados en el día</div>
            </div>
          </div>

          {/* Columna Enlaces & Redes */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-light)', marginBottom: '1rem' }}>
              Conecta con Nosotros
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--color-ivory)',
                  textDecoration: 'none',
                  fontSize: '0.88rem'
                }}
              >
                <MessageCircle size={18} color="var(--whatsapp-color)" />
                <span>Escríbenos por WhatsApp</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--color-ivory)',
                  textDecoration: 'none',
                  fontSize: '0.88rem'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>Síguenos en Instagram</span>
              </a>

              <button
                onClick={onOpenAdmin}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#A8A29E',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  padding: 0,
                  marginTop: '0.5rem'
                }}
              >
                <ShieldCheck size={15} color="var(--gold-primary)" />
                <span>Acceso Administrador</span>
              </button>
            </div>
          </div>

        </div>

        {/* Barra inferior */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.78rem',
          color: '#78716C'
        }}>
          <div>
            © {new Date().getFullYear()} {STORE_NAME}. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Hecho con elegancia</span>
            <Heart size={13} color="var(--gold-light)" fill="var(--gold-light)" />
          </div>
        </div>

      </div>
    </footer>
  );
}
