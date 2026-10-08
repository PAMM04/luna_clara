import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ product, onClose, onConfirm, deleting }) {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '440px', padding: '1.75rem', textAlign: 'center' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'var(--status-soldout-bg)',
          color: 'var(--status-soldout)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <AlertTriangle size={28} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'var(--color-noir)' }}>
          ¿Eliminar esta prenda?
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Estás por eliminar permanentemente <strong>"{product.nombre}"</strong>. Esta acción no se puede deshacer y retirará la prenda del catálogo.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="btn btn-outline"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => onConfirm(product)}
            disabled={deleting}
            style={{
              background: 'var(--status-soldout)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            {deleting ? (
              <span>Eliminando...</span>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Sí, eliminar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
