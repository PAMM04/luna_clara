import React, { useState, useEffect, useMemo } from 'react';
import { 
  generateWhatsAppOrderUrl, formatPrice, normalizeProductVariants, 
  getSafeProductImageUrl, getProductThumbnailUrl, DEFAULT_PRODUCT_IMAGE 
} from '../lib/supabase';
import { X, MessageCircle, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, Check, Eye } from 'lucide-react';

export default function ProductModal({ product, onClose, isPreview = false }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Normalizar las variantes de la prenda
  const variants = useMemo(() => {
    return normalizeProductVariants(product);
  }, [product]);

  useEffect(() => {
    if (product) {
      // Color por defecto: si viene preseleccionado o el primer color disponible
      let initialColor = '';
      if (product.defaultSelectedColor) {
        initialColor = product.defaultSelectedColor;
      } else if (variants.length > 0 && variants[0].color) {
        initialColor = variants[0].color;
      } else if (product.colores && product.colores.length > 0) {
        initialColor = product.colores[0];
      }
      setSelectedColor(initialColor);

      // Calcular tallas para el color inicial
      const targetVariant = variants.find((v) => v.color?.toLowerCase() === initialColor?.toLowerCase()) || variants[0];
      const targetSizes = (targetVariant && Array.isArray(targetVariant.tallas) && targetVariant.tallas.length > 0)
        ? targetVariant.tallas
        : (product.tallas || []);

      if (targetSizes.length > 0) {
        setSelectedSize(targetSizes[0]);
      } else {
        setSelectedSize('');
      }
    }
  }, [product, variants]);

  // Encontrar la variante activa para el color seleccionado (o fallback a la primera)
  const activeVariant = useMemo(() => {
    return variants.find(
      (v) => v.color?.toLowerCase() === selectedColor?.toLowerCase()
    ) || variants[0];
  }, [variants, selectedColor]);

  // Tallas disponibles para el color actualmente seleccionado
  const availableSizes = useMemo(() => {
    if (activeVariant && Array.isArray(activeVariant.tallas) && activeVariant.tallas.length > 0) {
      return activeVariant.tallas;
    }
    if (Array.isArray(product?.tallas) && product.tallas.length > 0) {
      return product.tallas;
    }
    return [];
  }, [activeVariant, product]);

  const handleSelectColor = (colorName) => {
    setSelectedColor(colorName);
    const targetVariant = variants.find((v) => v.color?.toLowerCase() === colorName.toLowerCase());
    const targetSizes = (targetVariant && Array.isArray(targetVariant.tallas) && targetVariant.tallas.length > 0)
      ? targetVariant.tallas
      : (product?.tallas || []);

    if (targetSizes.length > 0 && (!selectedSize || !targetSizes.includes(selectedSize))) {
      setSelectedSize(targetSizes[0]);
    }
  };

  if (!product) return null;

  // Imagen activa a mostrar: si la variante tiene foto, se muestra; si no, la imagen principal resuelta
  const currentDisplayImage = activeVariant?.imagen_url 
    ? getSafeProductImageUrl(activeVariant.imagen_url) 
    : getProductThumbnailUrl(product);

  const isOutOfStock = !product.disponible || (product.cantidad_disponible !== undefined && product.cantidad_disponible <= 0);

  const orderUrl = isOutOfStock
    ? '#'
    : generateWhatsAppOrderUrl(product, selectedSize, selectedColor);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Banner informativo si está en modo visualización / administrador */}
        {isPreview && (
          <div style={{
            background: 'linear-gradient(135deg, var(--color-noir) 0%, #292524 100%)',
            color: 'var(--gold-light)',
            padding: '0.65rem 1.25rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(197, 160, 89, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={16} color="var(--gold-primary)" />
              <span>Vista previa de publicación: Así verán tus clientes esta prenda</span>
            </div>
            <span style={{
              background: 'rgba(197, 160, 89, 0.2)',
              color: 'var(--gold-light)',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Panel Administrador
            </span>
          </div>
        )}

        {/* Botón cerrar flotante */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: isPreview ? '3.2rem' : '1rem',
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
          
          {/* Columna Izquierda: Imagen reactiva y galería de variantes */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1.15',
              background: '#F5F2EB',
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
            }} className="modal-img-container">
              {/* Imagen activa con transición suave */}
              <img
                key={currentDisplayImage}
                src={currentDisplayImage}
                alt={`${product.nombre} - ${selectedColor}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                }}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  animation: 'fadeIn 0.25s ease-out'
                }}
              />

              {/* Badge de Disponibilidad */}
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

              {/* Badge que indica el color mostrado en la foto */}
              {selectedColor && (
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(18, 16, 14, 0.78)',
                  backdropFilter: 'blur(6px)',
                  color: 'var(--color-ivory)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  zIndex: 2
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--gold-primary)'
                  }} />
                  <span>Color: {selectedColor}</span>
                </div>
              )}
            </div>

            {/* Galería de miniaturas por variante de color (si hay más de 1 variante con foto) */}
            {variants.length > 1 && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--color-cream)',
                borderTop: '1px solid var(--color-sand)',
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Ver color:
                </span>
                {variants.map((v) => {
                  const isCur = v.color?.toLowerCase() === selectedColor?.toLowerCase();
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedColor(v.color)}
                      style={{
                        border: isCur ? '2px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px',
                        background: isCur ? 'var(--gold-primary)' : 'white',
                        cursor: 'pointer',
                        width: '44px',
                        height: '52px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Ver en color ${v.color}`}
                    >
                      <img
                        src={getSafeProductImageUrl(v.imagen_url || product.imagen_url, DEFAULT_PRODUCT_IMAGE)}
                        alt={v.color}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Información, Selectores y Pedido */}
          <div style={{ padding: '0 1.5rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
            
            {/* Título y Precio en Bolivianos */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Sparkles size={15} color="var(--gold-primary)" />
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', fontWeight: 600 }}>
                  Prenda de Catálogo Exclusivo
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
                <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
                  {product.descripcion}
                </p>
              </div>
            )}

            {/* 1. Selector interactivo de Colores con Miniaturas de Variante */}
            {((product.colores && product.colores.length > 0) || variants.length > 0) && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-noir)', marginBottom: '0.5rem' }}>
                  1. Selecciona Color: <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{selectedColor}</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
                    (Toca un color para cambiar la foto)
                  </span>
                </label>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(product.colores && product.colores.length > 0 ? product.colores : variants.map((v) => v.color)).map((color, idx) => {
                    const isSelected = selectedColor?.toLowerCase() === color?.toLowerCase();
                    const variantObj = variants.find((v) => v.color?.toLowerCase() === color?.toLowerCase());
                    const swatchImg = variantObj?.imagen_url;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectColor(color)}
                        style={{
                          padding: swatchImg ? '0.35rem 0.85rem 0.35rem 0.45rem' : '0.45rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                          background: isSelected ? 'var(--gold-subtle)' : 'var(--color-white)',
                          color: isSelected ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(197, 160, 89, 0.25)' : 'none'
                        }}
                      >
                        {/* Mini miniatura fotográfica del color */}
                        {swatchImg && (
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: isSelected ? '1px solid var(--gold-primary)' : '1px solid #D6D3D1',
                            flexShrink: 0
                          }}>
                            <img src={swatchImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}

                        {isSelected && !swatchImg && <Check size={14} color="var(--gold-dark)" />}
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Selector interactivo de Tallas específico para el color seleccionado */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-noir)' }}>
                  2. Talla disponible en {selectedColor || 'este color'}: <span style={{ color: 'var(--gold-dark)', fontWeight: 700 }}>{selectedSize || 'Por elegir'}</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                  {availableSizes.length > 0 ? `${availableSizes.length} talla(s) para este color` : 'Sin tallas específicas'}
                </span>
              </div>

              {availableSizes.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {availableSizes.map((talla, idx) => {
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
              ) : (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: 'var(--color-cream)',
                  border: '1px dashed var(--color-sand)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--color-muted)'
                }}>
                  Prenda de corte versátil / Consulta tallas disponibles al pedir por WhatsApp.
                </div>
              )}
            </div>

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
                  <span>Pedir {selectedColor ? `en ${selectedColor}` : 'esta prenda'} por WhatsApp</span>
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
                <span>Atención directa, coordinamos pago y envío a tu conveniencia en Bolivia.</span>
              </p>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (min-width: 680px) {
          .modal-inner-grid {
            grid-template-columns: 1fr 1.15fr !important;
          }
          .modal-img-container {
            border-radius: var(--radius-lg) 0 0 0 !important;
            height: 100% !important;
            aspect-ratio: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
