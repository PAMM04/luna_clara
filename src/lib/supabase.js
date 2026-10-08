import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
export const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '59176019221';
export const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Luna Clara';

// Verifica si las credenciales de Supabase han sido configuradas
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('tu-proyecto') &&
    !supabaseAnonKey.includes('tu-anon-key')
  );
};

// Cliente oficial de Supabase
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Clave para almacenamiento de demostración local si Supabase no está conectado
const LOCAL_STORAGE_KEY = 'luna_clara_demo_products_v1';
const LOCAL_AUTH_KEY = 'luna_clara_demo_auth_session';

// Productos iniciales de alta costura para demostración
export const INITIAL_DEMO_PRODUCTS = [
  {
    id: 'prod-001',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    nombre: 'Vestido Midi Seda Champagne',
    descripcion: 'Vestido midi confeccionado en satén de seda pura con escote fluido y espalda descubierta. Corte al bies para una caída perfecta y elegante.',
    precio: 220.00,
    tallas: ['XS', 'S', 'M', 'L'],
    colores: ['Champagne', 'Negro Noche', 'Verde Esmeralda'],
    cantidad_disponible: 6,
    disponible: true,
    imagen_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'prod-002',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    nombre: 'Blazer Sastrero Oversized Crema',
    descripcion: 'Blazer estructurado con solapas de pico, doble botonadura y forro satinado suave. Confección sastrera contemporánea que eleva cualquier conjunto.',
    precio: 285.50,
    tallas: ['S', 'M', 'L'],
    colores: ['Crema Marfil', 'Camel', 'Negro'],
    cantidad_disponible: 4,
    disponible: true,
    imagen_url: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'prod-003',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    nombre: 'Pantalón Palazzo Lino Orgánico',
    descripcion: 'Pantalón de tiro alto con pretina estilizada y bolsillos laterales invisibles. Confeccionado en 100% lino orgánico suave y transpirable.',
    precio: 165.00,
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Beige Arena', 'Blanco Crudo', 'Terracota'],
    cantidad_disponible: 9,
    disponible: true,
    imagen_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'prod-004',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    nombre: 'Conjunto Top & Falda Plisada Noir',
    descripcion: 'Conjunto de dos piezas en gasa plisada premium. Top con escote cruzado y falda midi con movimiento fluido y cintura elástica delicada.',
    precio: 310.00,
    tallas: ['XS', 'S', 'M'],
    colores: ['Negro Noir', 'Azul Zafiro'],
    cantidad_disponible: 2,
    disponible: true,
    imagen_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'prod-005',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    nombre: 'Blusa de Gasa & Mangas Obispo',
    descripcion: 'Delicada blusa con transparencias sutiles, botonadura oculta y mangas voluminosas con puños ajustados. Una prenda romántica y atemporal.',
    precio: 145.00,
    tallas: ['S', 'M', 'L'],
    colores: ['Blanco Perla', 'Rosa Palo'],
    cantidad_disponible: 5,
    disponible: true,
    imagen_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'prod-006',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    nombre: 'Top Asimétrico en Rib Fino',
    descripcion: 'Top de un solo hombro en canalé de algodón peinado. Textura suave con ajuste anatómico que brinda soporte y estilo moderno.',
    precio: 89.00,
    tallas: ['Única', 'S', 'M'],
    colores: ['Caramelo', 'Blanco', 'Negro'],
    cantidad_disponible: 0,
    disponible: false,
    imagen_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80'
  }
];

// Helper para obtener productos locales
const getLocalProducts = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
      return INITIAL_DEMO_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local demo products:', err);
    return INITIAL_DEMO_PRODUCTS;
  }
};

const setLocalProducts = (products) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving local demo products:', err);
  }
};

// ============================================================
// FUNCIONES DE PRODUCTOS (CRUD)
// ============================================================

/**
 * Obtener todos los productos ordenados por fecha descendente
 */
export async function getProducts() {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products from Supabase:', error);
      throw error;
    }
    return data || [];
  } else {
    // Modo demostración local
    return getLocalProducts();
  }
}

/**
 * Subir imagen al Storage de Supabase
 */
export async function uploadProductImage(file) {
  if (!file) throw new Error('No se ha proporcionado ningún archivo');

  if (isSupabaseConfigured() && supabase) {
    // Sanitizar nombre de archivo y generar nombre único
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
    const filePath = `prendas/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagenes-productos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image to Supabase:', uploadError);
      throw new Error(`Error al subir la imagen: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('imagenes-productos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } else {
    // Si estamos en demo local, convertimos a DataURL para que se vea inmediatamente
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error al procesar la imagen localmente'));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Crear un nuevo producto
 */
export async function createProduct(productData, imageFile = null) {
  let finalImageUrl = productData.imagen_url || '';

  if (imageFile) {
    finalImageUrl = await uploadProductImage(imageFile);
  }

  if (!finalImageUrl) {
    throw new Error('La imagen del producto es obligatoria');
  }

  const payload = {
    nombre: productData.nombre.trim(),
    descripcion: productData.descripcion ? productData.descripcion.trim() : '',
    precio: parseFloat(productData.precio) || 0,
    tallas: Array.isArray(productData.tallas) ? productData.tallas : [],
    colores: Array.isArray(productData.colores) ? productData.colores : [],
    cantidad_disponible: parseInt(productData.cantidad_disponible, 10) || 0,
    disponible: Boolean(productData.disponible),
    imagen_url: finalImageUrl
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('productos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error);
      throw error;
    }
    return data;
  } else {
    const newProduct = {
      id: 'demo-' + Date.now(),
      created_at: new Date().toISOString(),
      ...payload
    };
    const list = getLocalProducts();
    const updated = [newProduct, ...list];
    setLocalProducts(updated);
    return newProduct;
  }
}

/**
 * Actualizar una prenda existente
 */
export async function updateProduct(id, productData, newImageFile = null) {
  let finalImageUrl = productData.imagen_url;

  if (newImageFile) {
    finalImageUrl = await uploadProductImage(newImageFile);
  }

  const payload = {
    nombre: productData.nombre.trim(),
    descripcion: productData.descripcion ? productData.descripcion.trim() : '',
    precio: parseFloat(productData.precio) || 0,
    tallas: Array.isArray(productData.tallas) ? productData.tallas : [],
    colores: Array.isArray(productData.colores) ? productData.colores : [],
    cantidad_disponible: parseInt(productData.cantidad_disponible, 10) || 0,
    disponible: Boolean(productData.disponible),
    imagen_url: finalImageUrl
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('productos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product in Supabase:', error);
      throw error;
    }
    return data;
  } else {
    const list = getLocalProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');

    const updatedProduct = { ...list[index], ...payload };
    list[index] = updatedProduct;
    setLocalProducts(list);
    return updatedProduct;
  }
}

/**
 * Alternar rápidamente la disponibilidad de un producto
 */
export async function toggleProductAvailability(id, currentStatus) {
  const newStatus = !currentStatus;

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('productos')
      .update({ disponible: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const list = getLocalProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index !== -1) {
      list[index].disponible = newStatus;
      setLocalProducts(list);
      return list[index];
    }
    throw new Error('Producto no encontrado');
  }
}

/**
 * Eliminar una prenda
 */
export async function deleteProduct(id, imageUrl = null) {
  if (isSupabaseConfigured() && supabase) {
    // Si la imagen proviene de Supabase Storage, intentar removerla
    if (imageUrl && imageUrl.includes('imagenes-productos')) {
      try {
        const parts = imageUrl.split('imagenes-productos/');
        if (parts.length > 1) {
          const path = parts[1];
          await supabase.storage.from('imagenes-productos').remove([path]);
        }
      } catch (err) {
        console.warn('No se pudo eliminar el archivo físico en Storage:', err);
      }
    }

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalProducts();
    const updated = list.filter((p) => p.id !== id);
    setLocalProducts(updated);
    return true;
  }
}

// ============================================================
// FUNCIONES DE AUTENTICACIÓN (ADMIN)
// ============================================================

/**
 * Iniciar sesión como administrador
 */
export async function adminLogin(email, password) {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } else {
    // Demostración sin Supabase configurado
    if (email === 'admin@lunaclara.com' && password === 'admin123') {
      const demoUser = {
        id: 'demo-admin-user',
        email: 'admin@lunaclara.com',
        user_metadata: { role: 'admin', name: 'Administrador Demo' }
      };
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(demoUser));
      return { user: demoUser, session: { access_token: 'demo-token' } };
    } else {
      throw new Error('Credenciales inválidas. En modo demo usa: admin@lunaclara.com / admin123 o conecta tu Supabase en .env');
    }
  }
}

/**
 * Cerrar sesión
 */
export async function adminLogout() {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } else {
    localStorage.removeItem(LOCAL_AUTH_KEY);
    return true;
  }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentAdmin() {
  if (isSupabaseConfigured() && supabase) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } else {
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

/**
 * Escuchar cambios en la sesión de autenticación
 */
export function onAdminAuthStateChange(callback) {
  if (isSupabaseConfigured() && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session ? session.user : null);
    });
    return () => subscription.unsubscribe();
  } else {
    const user = getCurrentAdmin();
    callback(user);
    // Escuchar cambios locales de storage
    const handler = () => {
      callback(getCurrentAdmin());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
}

/**
 * Formateador unificado de precios para Luna Clara en Bolivianos (Bs.)
 */
export function formatPrice(price) {
  const num = Number(price) || 0;
  return `Bs. ${num.toFixed(2)}`;
}

/**
 * Generador de enlace directo a WhatsApp según especificaciones del documento:
 * https://wa.me/<NUMERO_TELEFONO>?text=Hola!%20Deseo%20comprar%20la%20siguiente%20prenda:%0A*Producto:*%20{nombre}%0A*Precio:*%20Bs.%20{precio}%0A*Tallas:*%20{tallas_seleccionadas}
 */
export function generateWhatsAppOrderUrl(product, selectedSize = '', selectedColor = '') {
  const phone = WHATSAPP_PHONE.replace(/[^0-9]/g, '');
  
  let text = `¡Hola! Deseo comprar la siguiente prenda de ${STORE_NAME}:\n`;
  text += `*Producto:* ${product.nombre}\n`;
  text += `*Precio:* Bs. ${Number(product.precio).toFixed(2)}\n`;
  
  if (selectedSize) {
    text += `*Talla seleccionada:* ${selectedSize}\n`;
  } else if (product.tallas && product.tallas.length > 0) {
    text += `*Tallas disponibles:* ${product.tallas.join(', ')}\n`;
  }
  
  if (selectedColor) {
    text += `*Color seleccionado:* ${selectedColor}\n`;
  } else if (product.colores && product.colores.length > 0) {
    text += `*Colores disponibles:* ${product.colores.join(', ')}\n`;
  }

  text += `\n¿Tienen disponibilidad para envío inmediato? Muchas gracias.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

