import React from 'react';
import { X, Database, Copy } from 'lucide-react';

export default function ConfigModal({ isOpen, onClose, addToast }) {
  if (!isOpen) return null;

  const handleCopySql = () => {
    const sql = `ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS variantes JSONB NOT NULL DEFAULT '[]'::jsonb;`;
    navigator.clipboard.writeText(sql);
    addToast({
      type: 'success',
      title: 'Comando SQL copiado',
      message: 'Comando ALTER TABLE copiado al portapapeles para el SQL Editor de Supabase.'
    });
  };


  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', padding: '1.75rem' }}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={20} color="var(--gold-dark)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-noir)' }}>
              Conexión con Supabase
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              Pasos para conectar tu base de datos y almacenamiento real
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem', color: 'var(--color-charcoal)' }}>
          
          <div style={{ background: 'var(--color-cream)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-sand)' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-noir)', marginBottom: '0.35rem' }}>
              1. Ejecutar el script SQL en Supabase
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              Abre tu proyecto en <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>supabase.com</a>, ve a la sección <strong>SQL Editor</strong> y ejecuta el archivo:
            </p>
            <div style={{ background: 'var(--color-noir)', color: 'var(--gold-light)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>supabase_setup.sql</span>
              <button
                onClick={handleCopySql}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--color-cream)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-sand)' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-noir)', marginBottom: '0.35rem' }}>
              2. Crear tu usuario Administrador
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
              En tu panel de Supabase ve a <strong>Authentication -&gt; Users</strong> y haz clic en <strong>Add User</strong>. Asigna un correo y contraseña para ingresar a <code>/admin</code>.
            </p>
          </div>

          <div style={{ background: 'var(--color-cream)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-sand)' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-noir)', marginBottom: '0.35rem' }}>
              3. Configurar tus variables de entorno (.env)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              Copia tus credenciales de <strong>Project Settings -&gt; API</strong> en el archivo <code>.env</code>:
            </p>
            <pre style={{ background: 'var(--color-noir)', color: '#E5E7EB', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', overflowX: 'auto' }}>
{`VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
VITE_WHATSAPP_PHONE=591XXXXXXXXX`}
            </pre>
          </div>

        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button
            onClick={onClose}
            className="btn btn-gold"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
