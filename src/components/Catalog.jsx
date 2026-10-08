import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Search, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';

export default function Catalog({ products, onSelectProduct, loading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('ALL');
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState('ALL'); // 'ALL', 'AVAILABLE', 'SOLDOUT'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc'

  // Recolectar todas las tallas únicas presentes en los productos
  const availableSizes = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (Array.isArray(p.tallas)) {
        p.tallas.forEach((t) => set.add(t));
      }
    });
    return Array.from(set);
  }, [products]);

  // Filtrado y ordenamiento de prendas
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // Búsqueda por texto en nombre o descripción
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesName = item.nombre?.toLowerCase().includes(query);
          const matchesDesc = item.descripcion?.toLowerCase().includes(query);
          if (!matchesName && !matchesDesc) return false;
        }

        // Filtro por talla
        if (selectedSizeFilter !== 'ALL') {
          if (!item.tallas || !item.tallas.includes(selectedSizeFilter)) {
            return false;
          }
        }

        // Filtro por disponibilidad
        if (selectedAvailabilityFilter === 'AVAILABLE') {
          const isAvail = item.disponible && (item.cantidad_disponible === undefined || item.cantidad_disponible > 0);
          if (!isAvail) return false;
        } else if (selectedAvailabilityFilter === 'SOLDOUT') {
          const isSoldOut = !item.disponible || (item.cantidad_disponible !== undefined && item.cantidad_disponible <= 0);
          if (!isSoldOut) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.precio) - Number(b.precio);
        if (sortBy === 'price-desc') return Number(b.precio) - Number(a.precio);
        // 'newest' default
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [products, searchQuery, selectedSizeFilter, selectedAvailabilityFilter, sortBy]);

  const hasActiveFilters = searchQuery !== '' || selectedSizeFilter !== 'ALL' || selectedAvailabilityFilter !== 'ALL' || sortBy !== 'newest';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSizeFilter('ALL');
    setSelectedAvailabilityFilter('ALL');
    setSortBy('newest');
  };

  return (
    <section id="catalogo" style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container">
        
        {/* Encabezado de Sección */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-dark)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            <Sparkles size={14} />
            <span>Nuestra Vitrina</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, color: 'var(--color-noir)', marginBottom: '0.5rem' }}>
            Prendas Seleccionadas
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.98rem', maxWidth: '540px', margin: '0 auto' }}>
            Explora las piezas disponibles y contáctanos para asesorarte con tallas, medidas y entrega inmediata.
          </p>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div style={{
          background: 'var(--color-white)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-sand)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          
          {/* Fila superior: Input de búsqueda y selector de orden */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* Input de Búsqueda */}
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search size={18} color="var(--color-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por prenda, corte o material..."
                className="input-field"
                style={{ paddingLeft: '2.75rem' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Ordenar por */}
            <div style={{ flex: '0 1 200px' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value="newest">Más recientes</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </div>

            {/* Botón Restablecer si hay filtros */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-outline"
                style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', gap: '0.35rem' }}
                title="Limpiar todos los filtros"
              >
                <RotateCcw size={15} />
                <span>Restablecer</span>
              </button>
            )}

          </div>

          {/* Fila inferior: Filtros rápidos de Talla y Disponibilidad */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--color-sand)', paddingTop: '0.85rem' }}>
            
            {/* Filtro de Disponibilidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 600, marginRight: '0.2rem' }}>
                Estado:
              </span>
              <button
                type="button"
                onClick={() => setSelectedAvailabilityFilter('ALL')}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedAvailabilityFilter === 'ALL' ? '1px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                  background: selectedAvailabilityFilter === 'ALL' ? 'var(--gold-subtle)' : 'transparent',
                  color: selectedAvailabilityFilter === 'ALL' ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                  fontWeight: selectedAvailabilityFilter === 'ALL' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                Todos ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedAvailabilityFilter('AVAILABLE')}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedAvailabilityFilter === 'AVAILABLE' ? '1px solid #10B981' : '1px solid var(--color-sand)',
                  background: selectedAvailabilityFilter === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: selectedAvailabilityFilter === 'AVAILABLE' ? '#065F46' : 'var(--color-charcoal)',
                  fontWeight: selectedAvailabilityFilter === 'AVAILABLE' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                Disponibles
              </button>
              <button
                type="button"
                onClick={() => setSelectedAvailabilityFilter('SOLDOUT')}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedAvailabilityFilter === 'SOLDOUT' ? '1px solid #E11D48' : '1px solid var(--color-sand)',
                  background: selectedAvailabilityFilter === 'SOLDOUT' ? 'rgba(225, 29, 72, 0.1)' : 'transparent',
                  color: selectedAvailabilityFilter === 'SOLDOUT' ? '#E11D48' : 'var(--color-charcoal)',
                  fontWeight: selectedAvailabilityFilter === 'SOLDOUT' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                Agotados
              </button>
            </div>

            {/* Filtro de Tallas */}
            {availableSizes.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 600, marginRight: '0.2rem' }}>
                  Talla:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSizeFilter('ALL')}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedSizeFilter === 'ALL' ? '1px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                    background: selectedSizeFilter === 'ALL' ? 'var(--gold-subtle)' : 'transparent',
                    color: selectedSizeFilter === 'ALL' ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                    fontWeight: selectedSizeFilter === 'ALL' ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  Todas
                </button>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSizeFilter(size)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSizeFilter === size ? '1px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                      background: selectedSizeFilter === size ? 'var(--gold-subtle)' : 'transparent',
                      color: selectedSizeFilter === size ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                      fontWeight: selectedSizeFilter === size ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{
              width: '44px',
              height: '44px',
              border: '3px solid var(--color-sand)',
              borderTopColor: 'var(--gold-primary)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite'
            }} />
            <div style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Cargando catálogo exclusivo...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Grilla de Productos */}
        {!loading && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-sand)',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            <SlidersHorizontal size={40} color="var(--gold-primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
              No encontramos prendas con esos filtros
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Intenta cambiar los términos de búsqueda o selecciona otra talla.
            </p>
            <button
              onClick={resetFilters}
              className="btn btn-gold"
            >
              <span>Ver todas las prendas</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
