import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  adminLogout, toggleProductAvailability, isSupabaseConfigured, STORE_NAME,
  getSafeProductImageUrl, DEFAULT_PRODUCT_IMAGE, resetLocalProducts 
} from '../lib/supabase';
import ScrollToTop from './ScrollToTop';
import { 
  Plus, LogOut, Search, Edit3, Trash2, CheckCircle2, 
  AlertCircle, Package, Layers, ArrowLeft, RefreshCw, Eye, ChevronDown
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function AdminPanel({ 
  products, 
  adminUser, 
  onLogoutSuccess, 
  onBackToCatalog, 
  onOpenCreateModal, 
  onOpenEditModal, 
  onOpenDeleteModal, 
  onPreviewProduct,
  onReloadProducts, 
  addToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('ALL'); // 'ALL', 'AVAILABLE', 'SOLDOUT'
  const [togglingId, setTogglingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const isConfigured = isSupabaseConfigured();

  // Estadísticas del inventario
  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.disponible && (p.cantidad_disponible === undefined || p.cantidad_disponible > 0)).length;
    const soldOut = total - available;
    const totalStock = products.reduce((acc, p) => acc + (parseInt(p.cantidad_disponible, 10) || 0), 0);
    return { total, available, soldOut, totalStock };
  }, [products]);

  // Filtrado de prendas
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = p.nombre?.toLowerCase().includes(query);
        const matchDesc = p.descripcion?.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      if (filterState === 'AVAILABLE') {
        const isAvail = p.disponible && (p.cantidad_disponible === undefined || p.cantidad_disponible > 0);
        if (!isAvail) return false;
      } else if (filterState === 'SOLDOUT') {
        const isSold = !p.disponible || (p.cantidad_disponible !== undefined && p.cantidad_disponible <= 0);
        if (!isSold) return false;
      }

      return true;
    });
  }, [products, searchQuery, filterState]);

  // Reiniciar a 10 elementos cuando cambie la búsqueda o filtro
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, filterState]);

  // Slice paginado progresivamente
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  // Detección de scroll para cargar de 10 en 10 al aproximarse al final
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length));
        }
      },
      { rootMargin: '250px 0px', threshold: 0.05 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasMore, filteredProducts.length]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length));
  };

  // Manejo de Cerrar Sesión
  const handleLogout = async () => {
    try {
      await adminLogout();
      addToast({
        type: 'info',
        title: 'Sesión finalizada',
        message: 'Has salido del panel administrativo de forma segura.'
      });
      onLogoutSuccess();
    } catch (err) {
      console.error('Error logging out:', err);
      addToast({
        type: 'error',
        title: 'Error al salir',
        message: err.message
      });
    }
  };

  // Toggle rápido de disponibilidad
  const handleToggleAvailability = async (product) => {
    setTogglingId(product.id);
    try {
      await toggleProductAvailability(product.id, product.disponible);
      const newStatus = !product.disponible;
      addToast({
        type: 'success',
        title: 'Estado actualizado',
        message: `"${product.nombre}" ahora está ${newStatus ? 'Disponible' : 'Agotada'}.`
      });
      onReloadProducts();
    } catch (err) {
      console.error('Error toggling status:', err);
      addToast({
        type: 'error',
        title: 'Error al cambiar estado',
        message: err.message
      });
    } finally {
      setTogglingId(null);
    }
  };

  const formatPrice = (price) => {
    return `Bs. ${Number(price || 0).toFixed(2)}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-cream)', paddingBottom: '5rem' }}>
      
      {/* Barra superior de administración */}
      <header style={{
        background: 'var(--color-noir)',
        color: 'var(--color-ivory)',
        borderBottom: '1px solid rgba(197, 160, 89, 0.3)',
        padding: '1rem 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onBackToCatalog}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--color-ivory)',
                padding: '0.45rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem'
              }}
              title="Ir a vitrina de clientes"
            >
              <ArrowLeft size={16} />
              <span>Ver Tienda</span>
            </button>

            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ivory)', margin: 0, fontFamily: 'var(--font-serif)' }}>
                Panel de Control — {STORE_NAME}
              </h1>
              <div style={{ fontSize: '0.75rem', color: '#A8A29E' }}>
                Administrador: <span style={{ color: 'var(--gold-light)' }}>{adminUser?.email || 'admin@lunaclara.com'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onReloadProducts}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--color-ivory)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
              title="Recargar datos"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                padding: '0.5rem 1rem',
                fontSize: '0.84rem'
              }}
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="container" style={{ marginTop: '2rem' }}>
        
        {/* Banner de estado de Supabase */}
        {!isConfigured && (
          <div style={{
            background: 'var(--gold-subtle)',
            border: '1px solid var(--gold-primary)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--gold-dark)' }}>
                Trabajando en Modo Demostración Local
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-charcoal)' }}>
                Las prendas se guardan en el navegador. Para conectar PostgreSQL y Storage de Supabase en vivo, añade tus credenciales en el archivo <code>.env</code>.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas restablecer las prendas iniciales de demostración con todas sus fotografías originales?')) {
                  resetLocalProducts();
                  if (onReloadProducts) onReloadProducts();
                  addToast({
                    type: 'success',
                    title: 'Datos restablecidos',
                    message: 'Se cargaron los 6 modelos iniciales de demostración con sus imágenes originales.'
                  });
                }
              }}
              className="btn btn-outline"
              style={{
                fontSize: '0.78rem',
                padding: '0.45rem 0.85rem',
                background: 'var(--color-white)',
                borderColor: 'var(--gold-primary)',
                color: 'var(--gold-dark)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <RefreshCw size={13} />
              <span>Restablecer Prendas de Demo</span>
            </button>
          </div>
        )}

        {/* Tarjetas de Métricas / Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          
          <div style={{
            background: 'var(--color-white)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-sand)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Total Prendas</span>
              <Layers size={18} color="var(--gold-primary)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-noir)' }}>
              {stats.total}
            </div>
          </div>

          <div style={{
            background: 'var(--color-white)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-sand)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>En Vitrina (Activas)</span>
              <CheckCircle2 size={18} color="#10B981" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065F46' }}>
              {stats.available}
            </div>
          </div>

          <div style={{
            background: 'var(--color-white)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-sand)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Agotadas</span>
              <AlertCircle size={18} color="#E11D48" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#E11D48' }}>
              {stats.soldOut}
            </div>
          </div>

          <div style={{
            background: 'var(--color-white)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-sand)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Stock Total Unidades</span>
              <Package size={18} color="var(--gold-primary)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-noir)' }}>
              {stats.totalStock}
            </div>
          </div>

        </div>

        {/* Acciones de Cabecera: Buscador y Botón Crear */}
        <div style={{
          background: 'var(--color-white)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-sand)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          
          {/* Búsqueda y Filtros de Estado */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: '1 1 320px' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={17} color="var(--color-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prenda..."
                className="input-field"
                style={{ paddingLeft: '2.5rem', paddingRight: '1rem', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => setFilterState('ALL')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: filterState === 'ALL' ? '1px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                  background: filterState === 'ALL' ? 'var(--gold-subtle)' : 'transparent',
                  color: filterState === 'ALL' ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Todas ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterState('AVAILABLE')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: filterState === 'AVAILABLE' ? '1px solid #10B981' : '1px solid var(--color-sand)',
                  background: filterState === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: filterState === 'AVAILABLE' ? '#065F46' : 'var(--color-charcoal)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Disponibles
              </button>
              <button
                type="button"
                onClick={() => setFilterState('SOLDOUT')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: filterState === 'SOLDOUT' ? '1px solid #E11D48' : '1px solid var(--color-sand)',
                  background: filterState === 'SOLDOUT' ? 'rgba(225, 29, 72, 0.1)' : 'transparent',
                  color: filterState === 'SOLDOUT' ? '#E11D48' : 'var(--color-charcoal)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Agotadas
              </button>
            </div>
          </div>

          {/* Botón Crear Prenda */}
          <button
            onClick={onOpenCreateModal}
            className="btn btn-gold"
            style={{ padding: '0.75rem 1.4rem' }}
          >
            <Plus size={18} />
            <span>Agregar Nueva Prenda</span>
          </button>

        </div>

        {/* Tabla / Lista de Productos */}
        <div style={{
          background: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-sand)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          
          {filteredProducts.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <Package size={36} color="var(--gold-primary)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-noir)' }}>
                No hay prendas que coincidan
              </div>
              <div style={{ fontSize: '0.84rem', marginTop: '0.25rem' }}>
                Crea una nueva prenda o ajusta los filtros de búsqueda.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: 'var(--color-cream)', borderBottom: '1px solid var(--color-sand)' }}>
                    <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Foto</th>
                    <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Nombre y Detalle</th>
                    <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Precio</th>
                    <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Tallas / Colores</th>
                    <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Stock</th>
                    <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Disponible</th>
                    <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((p) => {
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-sand)' }}>
                        
                        {/* Foto */}
                        <td style={{ padding: '0.9rem 1rem', width: '70px' }}>
                          <div style={{
                            width: '56px',
                            height: '68px',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            background: '#EAE6DF',
                            border: '1px solid var(--color-sand)'
                          }}>
                            <img
                              src={getSafeProductImageUrl(p.imagen_url)}
                              alt={p.nombre}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        </td>

                        {/* Nombre y descripción */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-noir)', marginBottom: '0.2rem' }}>
                            {p.nombre}
                          </div>
                          {p.descripcion && (
                            <div style={{
                              fontSize: '0.78rem',
                              color: 'var(--color-muted)',
                              maxWidth: '320px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {p.descripcion}
                            </div>
                          )}
                        </td>

                        {/* Precio */}
                        <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-noir)' }}>
                            {formatPrice(p.precio)}
                          </span>
                        </td>

                        {/* Tallas y Colores */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {p.tallas && p.tallas.length > 0 && (
                              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                {p.tallas.map((t, idx) => (
                                  <span key={idx} className="badge-tag" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-charcoal)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <span>{p.colores?.join(', ') || 'Único'}</span>
                              {p.variantes && p.variantes.length > 1 && (
                                <span style={{
                                  background: 'rgba(197, 160, 89, 0.18)',
                                  color: 'var(--gold-dark)',
                                  fontSize: '0.66rem',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '3px',
                                  fontWeight: 700
                                }}>
                                  {p.variantes.length} colores con foto
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Stock */}
                        <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontWeight: 700,
                            color: p.cantidad_disponible > 0 ? 'var(--color-charcoal)' : 'var(--status-soldout)'
                          }}>
                            {p.cantidad_disponible ?? 0} unid.
                          </span>
                        </td>

                        {/* Switch de Disponibilidad */}
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(p)}
                            disabled={togglingId === p.id}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: togglingId === p.id ? 'wait' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              opacity: togglingId === p.id ? 0.6 : 1
                            }}
                            title="Alternar disponibilidad"
                          >
                            <div className={`switch-track ${p.disponible ? 'active' : ''}`} style={{ transform: 'scale(0.85)' }}>
                              <div className="switch-thumb" />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: p.disponible ? '#065F46' : 'var(--status-soldout)' }}>
                              {p.disponible ? 'Activo' : 'Agotado'}
                            </span>
                          </button>
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              onClick={() => onPreviewProduct && onPreviewProduct(p)}
                              style={{
                                background: 'var(--color-cream)',
                                border: '1px solid var(--color-sand)',
                                color: 'var(--color-charcoal)',
                                padding: '0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              title="Visualizar publicación"
                              aria-label="Ver cómo queda la publicación"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => onOpenEditModal(p)}
                              style={{
                                background: 'var(--color-cream)',
                                border: '1px solid var(--color-sand)',
                                color: 'var(--color-charcoal)',
                                padding: '0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Editar prenda"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              onClick={() => onOpenDeleteModal(p)}
                              style={{
                                background: 'rgba(225, 29, 72, 0.08)',
                                border: '1px solid rgba(225, 29, 72, 0.25)',
                                color: 'var(--status-soldout)',
                                padding: '0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Eliminar prenda"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Elemento centinela para detectar scroll en Admin */}
        <div 
          ref={sentinelRef} 
          style={{ height: '8px', width: '100%', margin: '0.5rem 0', pointerEvents: 'none', opacity: 0 }} 
          aria-hidden="true" 
        />

        {/* Barra de paginación progresiva y botón táctil */}
        {filteredProducts.length > 0 && (
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              fontSize: '0.82rem',
              color: 'var(--color-muted)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'var(--color-white)',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-sand)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Layers size={15} color="var(--gold-primary)" />
              <span>Mostrando <strong>{visibleProducts.length}</strong> de <strong>{filteredProducts.length}</strong> prendas en inventario</span>
            </div>

            {hasMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                className="btn btn-outline"
                style={{
                  padding: '0.7rem 1.6rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-white)',
                  boxShadow: 'var(--shadow-sm)',
                  fontWeight: 600,
                  gap: '0.45rem'
                }}
              >
                <ChevronDown size={17} />
                <span>Cargar 10 prendas más</span>
              </button>
            ) : filteredProducts.length > PAGE_SIZE ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                ✓ Has llegado al final del inventario
              </span>
            ) : null}
          </div>
        )}

      </main>

      {/* Botón flotante Volver Arriba para el panel de administración */}
      <ScrollToTop isAdmin={true} bottomOffset="1.5rem" />

    </div>
  );
}
