import React, { useState } from 'react';
import { generateWhatsAppOrderUrl, formatPrice, normalizeProductVariants } from '../lib/supabase';
import { MessageCircle, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct }) {
  const variants = normalizeProductVariants(product);
  
  // Color activo mostrado en la tarjeta (por defecto el primero)
  const [activeColor, setActiveColor] = useState(() => {
    return variants[0]?.color || (product.colores?.[0]) || '';
  });

  // Buscar la variante que coincida con el color activo
  const activeVariant = variants.find(
    (v) => v.color?.toLowerCase() === activeColor?.toLowerCase() && v.imagen_url
  );

  const displayImage = activeVariant?.imagen_url || product.imagen_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80';

  const isOutOfStock = !product.disponible || (product.cantidad_disponible !== undefined && product.cantidad_disponible <= 0);

  // Generar link WhatsApp directo con el color actualmente activo
  const quickWhatsAppUrl = isOutOfStock
    ? '#'
    : generateWhatsAppOrderUrl(product, '', activeColor);

  const handleCardClick = () => {
    onSelectProduct({
      ...product,
      defaultSelectedColor: activeColor
    });
  };

  return (
    <article className="product-card">
      {/* Contenedor de la Imagen */}
      <div 
        className="product-image-wrap" 
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <img
          key={displayImage}
          src={displayImage}
          alt={`${product.nombre} - ${activeColor}`}
          className="product-image"
          loading="lazy"
        />

        {/* Badge de Disponibilidad */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          {isOutOfStock ? (
            <span className="badge badge-soldout">
              <AlertCircle size={12} />
              <span>Agotado</span>
            </span>
          ) : (
            <span className="badge badge-available">
              <CheckCircle2 size={12} />
              <span>Disponible</span>
            </span>
          )}
        </div>

        {/* Badge Stock si quedan pocas unidades */}
        {!isOutOfStock && product.cantidad_disponible > 0 && product.cantidad_disponible <= 3 && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
            <span style={{
              background: 'rgba(245, 158, 11, 0.9)',
              color: 'white',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.25rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
              ¡Solo {product.cantidad_disponible} unid.!
            </span>
          </div>
        )}

        {/* Overlay hover para ver detalles */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(18, 16, 14, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.25s ease',
          pointerEvents: 'none'
        }}
        className="card-hover-overlay"
        >
          <span style={{
            background: 'white',
            color: 'var(--color-noir)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Eye size={15} />
            <span>Ver Prenda</span>
          </span>
        </div>
      </div>

      {/* Contenido de la Ficha */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        
        {/* Título y Precio en Bs. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <h3 
            onClick={handleCardClick}
            style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-noir)',
              cursor: 'pointer',
              lineHeight: 1.3
            }}
          >
            {product.nombre}
          </h3>
          <span style={{
            fontWeight: 800,
            fontSize: '1.05rem',
            color: 'var(--color-noir)',
            whiteSpace: 'nowrap'
          }}>
            {formatPrice(product.precio)}
          </span>
        </div>

        {/* Descripción corta */}
        {product.descripcion && (
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--color-muted)',
            lineHeight: 1.5,
            marginBottom: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.descripcion}
          </p>
        )}

        {/* Tallas y Variantes de Color */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.1rem' }}>
          {/* Tallas */}
          {product.tallas && product.tallas.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Tallas:
              </span>
              {product.tallas.map((talla, idx) => (
                <span key={idx} className="badge-tag">
                  {talla}
                </span>
              ))}
            </div>
          )}

          {/* Colores interactivos en la tarjeta */}
          {variants.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Colores:
              </span>
              {variants.map((v, idx) => {
                const isSelected = v.color?.toLowerCase() === activeColor?.toLowerCase();
                const hasImg = Boolean(v.imagen_url);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveColor(v.color);
                    }}
                    style={{
                      fontSize: '0.72rem',
                      background: isSelected ? 'var(--gold-subtle)' : 'var(--color-cream)',
                      border: isSelected ? '1.5px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                      color: isSelected ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                      fontWeight: isSelected ? 700 : 500,
                      padding: hasImg ? '0.15rem 0.5rem 0.15rem 0.35rem' : '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Ver en ${v.color}`}
                  >
                    {/* Indicador o mini swatch */}
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--gold-primary)' : '#A8A29E'
                    }} />
                    <span>{v.color}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
          {isOutOfStock ? (
            <button
              disabled
              className="btn btn-whatsapp disabled"
              style={{ width: '100%', fontSize: '0.82rem', padding: '0.65rem 0.5rem' }}
            >
              <span>Agotado Temporalmente</span>
            </button>
          ) : (
            <a
              href={quickWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ width: '100%', fontSize: '0.82rem', padding: '0.65rem 0.5rem' }}
              title={`Pedir ${activeColor ? `en ${activeColor}` : ''} por WhatsApp`}
            >
              <MessageCircle size={16} />
              <span>Pedir {activeColor ? `(${activeColor})` : ''} por WhatsApp</span>
            </a>
          )}

          <button
            onClick={handleCardClick}
            className="btn btn-outline"
            style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)' }}
            title="Ver detalles completos y variantes"
            aria-label="Ver detalles"
          >
            <Eye size={17} />
          </button>
        </div>

      </div>

      <style>{`
        .product-card:hover .card-hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </article>
  );
}
