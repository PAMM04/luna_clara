import React, { useState, useEffect, useCallback } from 'react';
import { 
  getProducts, 
  deleteProduct, 
  getCurrentAdmin, 
  onAdminAuthStateChange, 
  isSupabaseConfigured,
  WHATSAPP_PHONE,
  STORE_NAME 
} from './lib/supabase';

// Componentes
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import ProductModal from './components/ProductModal';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import ProductFormModal from './components/ProductFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ConfigModal from './components/ConfigModal';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';

import { MessageCircle, Info } from 'lucide-react';

export default function App() {
  // Vista actual: 'catalog' o 'admin'
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('admin') || window.location.pathname.includes('/admin')) {
      return 'admin';
    }
    return 'catalog';
  });

  // Estado de autenticación de Administrador
  const [adminUser, setAdminUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Lista de productos y carga
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Modales
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formProduct, setFormProduct] = useState(null); // null = crear, object = editar
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Notificaciones Toast
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title = '', message = '' }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-eliminar después de 4.5 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      addToast({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudieron cargar los productos. Verifica la configuración de Supabase.'
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [addToast]);

  // Efecto inicial: Cargar productos y verificar sesión de admin
  useEffect(() => {
    loadProducts();

    // Comprobar sesión de administrador
    getCurrentAdmin().then((user) => {
      setAdminUser(user);
      setAuthChecked(true);
    });

    // Suscripción a cambios en la autenticación
    const unsubscribe = onAdminAuthStateChange((user) => {
      setAdminUser(user);
    });

    // Listener para navegación por hash (#/admin)
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('catalog');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [loadProducts]);

  // Cambiar vista sincronizando el hash de la URL
  const handleSetCurrentView = (view) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '';
    }
  };

  // Manejo de eliminación confirmada
  const handleConfirmDelete = async (product) => {
    setIsDeleting(true);
    try {
      await deleteProduct(product.id, product.imagen_url);
      addToast({
        type: 'success',
        title: 'Prenda eliminada',
        message: `"${product.nombre}" ha sido eliminada del catálogo.`
      });
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      addToast({
        type: 'error',
        title: 'Error al eliminar',
        message: err.message || 'No se pudo eliminar la prenda.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfigured = isSupabaseConfigured();
  const cleanPhone = WHATSAPP_PHONE.replace(/[^0-9]/g, '');
  const floatingWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola ${STORE_NAME}! Me gustaría realizar una consulta sobre sus prendas.`)}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notifications System */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Barra de aviso si Supabase está en modo Demo */}
      {!isConfigured && currentView === 'catalog' && (
        <div style={{
          background: 'var(--color-noir)',
          color: 'var(--color-ivory)',
          padding: '0.45rem 1rem',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(197, 160, 89, 0.3)',
          textAlign: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Info size={14} color="var(--gold-light)" />
            <span>Catálogo activo en <strong>Modo Demostración</strong> interactivo.</span>
          </div>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gold-light)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.78rem'
            }}
          >
            Cómo conectar tu Supabase real (.env)
          </button>
        </div>
      )}

      {/* Renderizado Condicional de Vistas */}
      {currentView === 'admin' ? (
        authChecked && adminUser ? (
          /* Panel de Administración (Logueado) */
          <AdminPanel
            products={products}
            adminUser={adminUser}
            onLogoutSuccess={() => setAdminUser(null)}
            onBackToCatalog={() => handleSetCurrentView('catalog')}
            onOpenCreateModal={() => {
              setFormProduct(null);
              setIsFormModalOpen(true);
            }}
            onOpenEditModal={(product) => {
              setFormProduct(product);
              setIsFormModalOpen(true);
            }}
            onOpenDeleteModal={(product) => {
              setDeletingProduct(product);
              setIsDeleteModalOpen(true);
            }}
            onReloadProducts={loadProducts}
            addToast={addToast}
          />
        ) : (
          /* Login de Administrador */
          <AdminLogin
            onLoginSuccess={(user) => setAdminUser(user)}
            onBackToCatalog={() => handleSetCurrentView('catalog')}
            addToast={addToast}
          />
        )
      ) : (
        /* Vista de Cliente / Catálogo */
        <>
          <Navbar
            currentView={currentView}
            setCurrentView={handleSetCurrentView}
            adminUser={adminUser}
            onOpenAdmin={() => handleSetCurrentView('admin')}
          />

          <main style={{ flex: 1 }}>
            <Hero onExploreClick={() => {
              const el = document.getElementById('catalogo');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />

            <Catalog
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              loading={loadingProducts}
            />
          </main>

          <Footer onOpenAdmin={() => handleSetCurrentView('admin')} />

          {/* Botón flotante directo de WhatsApp */}
          <a
            href={floatingWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-whatsapp"
            title="Escribir por WhatsApp a Luna Clara"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle size={28} />
          </a>
        </>
      )}

      {/* Modal de Detalle de Prenda (Cliente) */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Modal de Formulario Crear/Editar Prenda (Admin) */}
      {isFormModalOpen && (
        <ProductFormModal
          product={formProduct}
          onClose={() => {
            setIsFormModalOpen(false);
            setFormProduct(null);
          }}
          onSaveSuccess={() => {
            loadProducts();
          }}
          addToast={addToast}
        />
      )}

      {/* Modal de Confirmación de Eliminación (Admin) */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          product={deletingProduct}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingProduct(null);
          }}
          onConfirm={handleConfirmDelete}
          deleting={isDeleting}
        />
      )}

      {/* Modal de Instrucciones de Configuración Supabase */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        addToast={addToast}
      />

    </div>
  );
}
