import React from 'react';
import { STORE_NAME } from '../lib/supabase';
import { Sparkles, ArrowDown, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="hero-luxury" style={{ padding: '3.5rem 0 4rem', position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        
        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Eyebrow badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(197, 160, 89, 0.15)',
            border: '1px solid rgba(223, 190, 125, 0.35)',
            color: 'var(--gold-light)',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={14} />
            <span>Nueva Colección Exclusiva</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 700,
            color: 'var(--color-ivory)',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em'
          }}>
            Elegancia que trasciende, estilo que <span style={{ 
              background: 'linear-gradient(135deg, #E5C378 0%, #DFBE7D 50%, #C5A059 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontStyle: 'italic'
            }}>define tu presencia</span>.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: '#D6D3D1',
            maxWidth: '620px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.65,
            fontWeight: 300
          }}>
            En <strong>{STORE_NAME}</strong> confeccionamos y seleccionamos prendas con acabados impecables. Explora nuestro catálogo y ordena tu prenda favorita directamente por WhatsApp con asesoría inmediata.
          </p>

          {/* Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onExploreClick}
              className="btn btn-gold"
              style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
            >
              <span>Explorar Catálogo</span>
              <ArrowDown size={18} />
            </button>
          </div>

        </div>

        {/* Feature Highlights Pills */}
        <div style={{
          marginTop: '3.5rem',
          paddingTop: '2.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} color="var(--gold-light)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ivory)' }}>Envíos Seguros</div>
              <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>Coordinación rápida a domicilio</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartHandshake size={18} color="var(--gold-light)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ivory)' }}>Atención Personalizada</div>
              <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>Asesoría directa por WhatsApp</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="var(--gold-light)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ivory)' }}>Prendas Exclusivas</div>
              <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>Telas seleccionadas y stock limitado</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
