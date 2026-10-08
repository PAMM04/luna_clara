import React, { useState } from 'react';
import { adminLogin, isSupabaseConfigured, STORE_NAME } from '../lib/supabase';
import { Lock, Mail, ArrowLeft, ShieldCheck, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onBackToCatalog, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isConfigured = isSupabaseConfigured();

  const handleFillDemo = () => {
    setEmail('admin@lunaclara.com');
    setPassword('admin123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Por favor ingresa tanto el correo como la contraseña.');
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(email.trim(), password);
      addToast({
        type: 'success',
        title: '¡Bienvenido Administrador!',
        message: 'Has iniciado sesión correctamente en el panel de control.'
      });
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('Error during login:', err);
      setErrorMsg(err.message || 'Error al iniciar sesión. Revisa tus credenciales.');
      addToast({
        type: 'error',
        title: 'Error de acceso',
        message: err.message || 'Credenciales incorrectas.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      background: 'linear-gradient(180deg, var(--color-ivory) 0%, #EDE9E1 100%)'
    }}>
      <div style={{
        background: 'var(--color-white)',
        width: '100%',
        maxWidth: '440px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(197, 160, 89, 0.3)',
        boxShadow: 'var(--shadow-lg)',
        padding: '2.5rem 2rem',
        position: 'relative'
      }}>
        
        {/* Botón volver */}
        <button
          onClick={onBackToCatalog}
          style={{
            position: 'absolute',
            top: '1.25rem',
            left: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          <span>Volver a vitrina</span>
        </button>

        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #24201B 0%, #12100E 100%)',
            border: '1px solid var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 20px rgba(197, 160, 89, 0.25)'
          }}>
            <Lock size={24} color="var(--gold-light)" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-noir)', marginBottom: '0.35rem', fontFamily: 'var(--font-serif)' }}>
            Acceso Administrativo
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-muted)' }}>
            Gestión y catálogo de prendas {STORE_NAME}
          </p>
        </div>

        {/* Alerta de Error */}
        {errorMsg && (
          <div style={{
            background: 'var(--status-soldout-bg)',
            border: '1px solid rgba(225, 29, 72, 0.25)',
            color: 'var(--status-soldout)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            marginBottom: '1.25rem'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Demo Mode Notice */}
        {!isConfigured && (
          <div style={{
            background: 'var(--gold-subtle)',
            border: '1px solid rgba(197, 160, 89, 0.35)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'var(--color-charcoal)',
            marginBottom: '1.5rem',
            lineHeight: 1.45
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--gold-dark)', marginBottom: '0.25rem' }}>
              <KeyRound size={15} />
              <span>Modo Demostración Activo</span>
            </div>
            <span>Puedes ingresar con: <code>admin@lunaclara.com</code> / <code>admin123</code></span>
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  background: 'white',
                  border: '1px solid var(--gold-primary)',
                  color: 'var(--gold-dark)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Autocompletar credenciales demo
              </button>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} color="var(--color-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lunaclara.com"
                required
                className="input-field"
                style={{ paddingLeft: '2.6rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} color="var(--color-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field"
                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  padding: '0'
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
