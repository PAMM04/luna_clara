import React, { useState, useEffect } from 'react';
import { generateWhatsAppOrderUrl } from '../lib/supabase';
import { X, MessageCircle, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, Check } from 'lucide-react';

export default function ProductModal({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (product) {
      if (product.tallas && product.tallas.length > 0) {
        setSelectedSize(product.tallas[0]);
      } else {
        setSelectedSize('');
      }

      if (product.colores && product.colores.length > 0) {
        setSelectedColor(product.colores[0]);
      } else {
        setSelectedColor('');
      }
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = !product.disponible || (product.cantidad_disponible !== undefined && product.cantidad_disponible <= 0);

  const orderUrl = isOutOfStock
    ? '#'
    : generateWhatsAppOrderUrl(product, selectedSize, selectedColor);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(price).replace('BOB', '$');
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Botón cerrar flotante */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid var(--color-sand)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          title="Cerrar ventana"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="modal-inner-grid">
          
          {/* Imagen de la prenda */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1.1',
            background: '#F5F2EB',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
          }} className="modal-img-container">
            <img
              src={product.imagen_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80'}
              alt={product.nombre}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2 }}>
              {isOutOfStock ? (
                <span className="badge badge-soldout">
                  <AlertCircle size={13} />
                  <span>Agotado</span>
                </span>
              ) : (
                <span className="badge badge-available">
                  <CheckCircle2 size={13} />
                  <span>Disponible ({product.cantidad_disponible} en stock)</span>
                </span>
              )}
            </div>
          </div>

          {/* Información y Selectores */}
          <div style={{ padding: '0 1.5rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
            
            {/* Título y Precio */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Sparkles size={15} color="var(--gold-primary)" />
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', fontWeight: 600 }}>
                  Prenda de Catálogo
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-noir)', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>
                {product.nombre}
              </h2>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-noir)' }}>
                {formatPrice(product.precio)}
              </div>
            </div>

            {/* Descripción */}
            {product.descripcion && (
              <div style={{
                background: 'var(--color-cream)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--color-sand)'
              }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.35rem' }}>
                  Detalles y Confección:
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {product.descripcion}
                </p>
              </div>
            )}

            {/* Selector interactivo de Tallas */}
            {product.tallas && product.tallas.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-noir)', marginBottom: '0.5rem' }}>
                  Selecciona tu Talla: <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{selectedSize}</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.tallas.map((talla, idx) => {
                    const isSelected = selectedSize === talla;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(talla)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                          background: isSelected ? 'var(--gold-subtle)' : 'var(--color-white)',
                          color: isSelected ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={14} color="var(--gold-dark)" />}
                        <span>{talla}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector interactivo de Colores */}
            {product.colores && product.colores.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-noir)', marginBottom: '0.5rem' }}>
                  Color preferido: <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{selectedColor}</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.colores.map((color, idx) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                          background: isSelected ? 'var(--gold-subtle)' : 'var(--color-white)',
                          color: isSelected ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={14} color="var(--gold-dark)" />}
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botón Principal WhatsApp */}
            <div style={{ marginTop: 'auto' }}>
              {isOutOfStock ? (
                <div style={{
                  padding: '1rem',
                  background: 'var(--status-soldout-bg)',
                  border: '1px solid rgba(225, 29, 72, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--status-soldout)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                    Esta prenda está agotada
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    Puedes escribirnos a WhatsApp para consultar reposición de stock.
                  </div>
                </div>
              ) : (
                <a
                  href={orderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', justifyContent: 'center' }}
                >
                  <MessageCircle size={20} />
                  <span>Pedir esta prenda por WhatsApp</span>
                </a>
              )}

              <p style={{
                fontSize: '0.76rem',
                color: 'var(--color-muted)',
                textAlign: 'center',
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}>
                <ShieldCheck size={14} color="var(--gold-primary)" />
                <span>Atención directa, coordinamos pago y envío a tu conveniencia.</span>
              </p>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (min-width: 640px) {
          .modal-inner-grid {
            grid-template-columns: 1fr 1.15fr !important;
          }
          .modal-img-container {
            border-radius: var(--radius-lg) 0 0 var(--radius-lg) !important;
            height: 100% !important;
            aspect-ratio: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
