import { createClient } from '@supabase/supabase-js';
import { compressAndConvertToWebP } from './imageOptimizer';

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

// Normalizador y extractor de variantes para garantizar compatibilidad retroactiva total
export function cleanProductDescription(description) {
  if (!description) return '';
  return description.replace(/<!--LC_VAR:.*?-->/gs, '').trim();
}

export function normalizeProductVariants(product) {
  if (!product) return [];

  const defaultSizes = Array.isArray(product.tallas) && product.tallas.length > 0 
    ? product.tallas 
    : ['S', 'M', 'L'];

  // 1. Si ya tiene variantes estructuradas válidas
  if (Array.isArray(product.variantes) && product.variantes.length > 0) {
    return product.variantes.map((v, idx) => ({
      id: v.id || `var-${idx}-${Date.now()}`,
      color: typeof v === 'string' ? v : (v.color || 'Color'),
      imagen_url: typeof v === 'string' ? (product.imagen_url || '') : (v.imagen_url || product.imagen_url || ''),
      stock: v.stock !== undefined ? v.stock : product.cantidad_disponible,
      tallas: Array.isArray(v.tallas) && v.tallas.length > 0 ? v.tallas : [...defaultSizes]
    }));
  }

  // 2. Si tiene metadatos incrustados en descripcion (estrategia de persistencia de respaldo)
  if (product.descripcion && product.descripcion.includes('<!--LC_VAR:')) {
    try {
      const match = product.descripcion.match(/<!--LC_VAR:(.*?)-->/s);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((v, idx) => ({
            id: v.id || `var-${idx}-${Date.now()}`,
            color: v.color || 'Color',
            imagen_url: v.imagen_url || product.imagen_url || '',
            stock: v.stock !== undefined ? v.stock : product.cantidad_disponible,
            tallas: Array.isArray(v.tallas) && v.tallas.length > 0 ? v.tallas : [...defaultSizes]
          }));
        }
      }
    } catch (e) {
      console.warn('Error parsing encoded variants:', e);
    }
  }

  // 3. Si solo tiene el array plano 'colores', sintetizar variantes usando la imagen_url principal
  if (Array.isArray(product.colores) && product.colores.length > 0) {
    return product.colores.map((color, idx) => ({
      id: `var-synthesized-${idx}`,
      color: color,
      imagen_url: product.imagen_url || '',
      stock: product.cantidad_disponible,
      tallas: [...defaultSizes]
    }));
  }

  // 4. Fallback si no hay colores especificados
  return [{
    id: 'var-default',
    color: 'Único',
    imagen_url: product.imagen_url || '',
    stock: product.cantidad_disponible,
    tallas: [...defaultSizes]
  }];
}

// Productos iniciales de alta costura para demostración
export const INITIAL_DEMO_PRODUCTS = [
  {
    id: 'prod-001',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    nombre: 'Vestido Midi Seda Champagne',
    descripcion: 'Vestido midi confeccionado en satén de seda pura con escote fluido y espalda descubierta. Corte al bies para una caída perfecta y elegante.',
    precio: 220.00,
    tallas: ['XS', 'S', 'M', 'L', 'XL', '2'],
    colores: ['Champagne', 'Negro Noche', 'Verde Esmeralda'],
    cantidad_disponible: 6,
    disponible: true,
    imagen_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
    variantes: [
      { id: 'v1-1', color: 'Champagne', tallas: ['XS', 'S', 'M'], imagen_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80' },
      { id: 'v1-2', color: 'Negro Noche', tallas: ['M', '2'], imagen_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80' },
      { id: 'v1-3', color: 'Verde Esmeralda', tallas: ['XL', 'S'], imagen_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80' }
    ]
  },
  {
    id: 'prod-002',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    nombre: 'Blazer Sastrero Oversized Crema',
    descripcion: 'Blazer estructurado con solapas de pico, doble botonadura y forro satinado suave. Confección sastrera contemporánea que eleva cualquier conjunto.',
    precio: 285.50,
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Crema Marfil', 'Camel', 'Negro'],
    cantidad_disponible: 4,
    disponible: true,
    imagen_url: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80',
    variantes: [
      { id: 'v2-1', color: 'Crema Marfil', tallas: ['S', 'M'], imagen_url: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=900&q=80' },
      { id: 'v2-2', color: 'Camel', tallas: ['M', 'L'], imagen_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80' },
      { id: 'v2-3', color: 'Negro', tallas: ['S', 'XL'], imagen_url: 'https://images.unsplash.com/photo-1548624149-f7b7cb2e8a15?auto=format&fit=crop&w=900&q=80' }
    ]
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
    imagen_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
    variantes: [
      { id: 'v3-1', color: 'Beige Arena', tallas: ['S', 'M', 'L'], imagen_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80' },
      { id: 'v3-2', color: 'Blanco Crudo', tallas: ['M', 'L'], imagen_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80' },
      { id: 'v3-3', color: 'Terracota', tallas: ['S', 'XL'], imagen_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80' }
    ]
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
    imagen_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
    variantes: [
      { id: 'v4-1', color: 'Negro Noir', tallas: ['XS', 'S', 'M'], imagen_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80' },
      { id: 'v4-2', color: 'Azul Zafiro', tallas: ['S', 'M'], imagen_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80' }
    ]
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
    imagen_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=900&q=80',
    variantes: [
      { id: 'v5-1', color: 'Blanco Perla', tallas: ['S', 'M', 'L'], imagen_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=900&q=80' },
      { id: 'v5-2', color: 'Rosa Palo', tallas: ['M', 'L'], imagen_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80' }
    ]
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
    imagen_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80',
    variantes: [
      { id: 'v6-1', color: 'Caramelo', tallas: ['Única', 'S'], imagen_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80' },
      { id: 'v6-2', color: 'Blanco', tallas: ['S', 'M'], imagen_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80' },
      { id: 'v6-3', color: 'Negro', tallas: ['Única', 'M'], imagen_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80' }
    ]
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
    return (data || []).map((p) => ({
      ...p,
      descripcion: cleanProductDescription(p.descripcion),
      variantes: normalizeProductVariants(p)
    }));
  } else {
    // Modo demostración local
    return getLocalProducts().map((p) => ({
      ...p,
      descripcion: cleanProductDescription(p.descripcion),
      variantes: normalizeProductVariants(p)
    }));
  }
}

/**
 * Subir imagen al Storage de Supabase garantizando formato WebP optimizado
 */
export async function uploadProductImage(file) {
  if (!file) throw new Error('No se ha proporcionado ningún archivo');

  // Asegurar que el archivo esté convertido y comprimido a formato WebP
  let fileToUpload = file;
  if (file instanceof File || file instanceof Blob) {
    const isAlreadyWebP = file.type === 'image/webp' || (file.name && file.name.toLowerCase().endsWith('.webp'));
    // Si no es WebP o si no se ha pre-optimizado, ejecutar optimización nativa
    if (!isAlreadyWebP) {
      try {
        const optimized = await compressAndConvertToWebP(file);
        fileToUpload = optimized.file;
      } catch (optErr) {
        console.warn('Aviso: Falló la pre-conversión automática en uploadProductImage, usando archivo recibido:', optErr);
      }
    }
  }

  if (isSupabaseConfigured() && supabase) {
    // Sanitizar nombre de archivo y garantizar extensión .webp
    const rawName = fileToUpload.name ? fileToUpload.name.replace(/\.[^/.]+$/, '') : 'variante';
    const cleanFileName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const isWebP = fileToUpload.type === 'image/webp' || (fileToUpload.name && fileToUpload.name.toLowerCase().endsWith('.webp'));
    const fileExt = isWebP ? 'webp' : (fileToUpload.name ? fileToUpload.name.split('.').pop() : 'webp');
    const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
    const filePath = `prendas/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagenes-productos')
      .upload(filePath, fileToUpload, {
        contentType: isWebP ? 'image/webp' : fileToUpload.type,
        cacheControl: '31536000, public', // Caché extendido de 1 año para assets estáticos
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image to Supabase:', uploadError);
      throw new Error(`Error al subir la imagen a Supabase Storage: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('imagenes-productos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } else {
    // Modo demostración local: DataURL legible inmediatamente en el navegador
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Error al procesar la imagen localmente'));
      reader.readAsDataURL(fileToUpload);
    });
  }
}

/**
 * Extrae la ruta relativa de un archivo dentro del bucket 'imagenes-productos'
 * ej: 'https://xyz.supabase.co/storage/v1/object/public/imagenes-productos/prendas/123.jpg'
 * -> 'prendas/123.jpg'
 */
export function extractStoragePath(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('imagenes-productos/')) return null;
  try {
    const parts = url.split('imagenes-productos/');
    if (parts.length > 1) {
      let relativePath = parts[1].split('?')[0]; // descartar parámetros query si hubieran
      relativePath = decodeURIComponent(relativePath).trim();
      return relativePath || null;
    }
  } catch (e) {
    console.warn('Error extrayendo ruta de storage:', e);
  }
  return null;
}

/**
 * Crear un nuevo producto con variantes de color, tallas por color y fotos
 */
export async function createProduct(productData, coverImageFile = null) {
  // 1. Procesar y subir imágenes de variantes si existen archivos pendientes
  const processedVariants = [];
  const incomingVariants = Array.isArray(productData.variantes) ? productData.variantes : [];
  const defaultSizes = Array.isArray(productData.tallas) && productData.tallas.length > 0 
    ? productData.tallas 
    : ['S', 'M', 'L'];

  for (let i = 0; i < incomingVariants.length; i++) {
    const v = incomingVariants[i];
    let variantImageUrl = v.imagen_url || '';

    // Si la variante tiene un archivo local nuevo para subir
    if (v.file) {
      variantImageUrl = await uploadProductImage(v.file);
    }

    const variantSizes = Array.isArray(v.tallas) && v.tallas.length > 0
      ? v.tallas
      : [...defaultSizes];

    processedVariants.push({
      id: v.id || `var-${i}-${Date.now()}`,
      color: (v.color || `Color ${i + 1}`).trim(),
      tallas: variantSizes,
      imagen_url: variantImageUrl,
      stock: v.stock !== undefined ? parseInt(v.stock, 10) : (parseInt(productData.cantidad_disponible, 10) || 0)
    });
  }

  // 2. Determinar la fotografía principal / portada
  let finalCoverUrl = productData.imagen_url || '';
  if (coverImageFile) {
    finalCoverUrl = await uploadProductImage(coverImageFile);
  } else if (!finalCoverUrl && processedVariants.length > 0) {
    // Si no se asignó portada separada, usar la primera variante con foto
    const firstWithPic = processedVariants.find((v) => v.imagen_url);
    if (firstWithPic) {
      finalCoverUrl = firstWithPic.imagen_url;
    }
  }

  // Si alguna variante no tiene foto propia, asignarle la portada para que no quede vacía
  processedVariants.forEach((v) => {
    if (!v.imagen_url && finalCoverUrl) {
      v.imagen_url = finalCoverUrl;
    }
  });

  if (!finalCoverUrl && processedVariants.length === 0) {
    throw new Error('Debes proporcionar al menos una fotografía para la prenda o para una de sus variantes.');
  }

  // Extraer lista de colores sincronizada
  const derivedColors = processedVariants.map((v) => v.color).filter(Boolean);
  const finalColores = derivedColors.length > 0 
    ? derivedColors 
    : (Array.isArray(productData.colores) && productData.colores.length > 0 ? productData.colores : ['Único']);

  // Extraer unión de tallas de todas las variantes para el catálogo y filtros generales
  const allVariantSizes = Array.from(new Set(
    processedVariants.flatMap((v) => v.tallas || [])
  ));
  const finalTallas = allVariantSizes.length > 0 ? allVariantSizes : defaultSizes;

  const baseDescription = cleanProductDescription(productData.descripcion || '');

  const payload = {
    nombre: productData.nombre.trim(),
    descripcion: baseDescription,
    precio: parseFloat(productData.precio) || 0,
    tallas: finalTallas,
    colores: finalColores,
    variantes: processedVariants,
    cantidad_disponible: parseInt(productData.cantidad_disponible, 10) || 0,
    disponible: Boolean(productData.disponible),
    imagen_url: finalCoverUrl || (processedVariants[0]?.imagen_url || '')
  };

  if (isSupabaseConfigured() && supabase) {
    // Intento 1: Guardar nativamente con columna 'variantes' JSONB
    let { data, error } = await supabase
      .from('productos')
      .insert([payload])
      .select()
      .single();

    // Si la columna 'variantes' aún no existe en Supabase (código 42703), usar respaldo resiliente
    if (error && error.code === '42703') {
      console.info('Aviso: La columna "variantes" no existe en Supabase aún. Guardando con respaldo transparente en descripción.');
      const fallbackPayload = { ...payload };
      delete fallbackPayload.variantes;
      
      const metaTag = `<!--LC_VAR:${JSON.stringify(processedVariants)}-->`;
      fallbackPayload.descripcion = fallbackPayload.descripcion 
        ? `${fallbackPayload.descripcion}\n\n${metaTag}` 
        : metaTag;

      const retryResult = await supabase
        .from('productos')
        .insert([fallbackPayload])
        .select()
        .single();

      if (retryResult.error) {
        console.error('Error insertando prenda con respaldo:', retryResult.error);
        throw retryResult.error;
      }
      data = retryResult.data;
    } else if (error) {
      console.error('Error creating product in Supabase:', error);
      throw error;
    }

    return {
      ...data,
      descripcion: cleanProductDescription(data.descripcion),
      variantes: normalizeProductVariants(data)
    };
  } else {
    // Modo local / demo
    const newProduct = {
      id: 'demo-' + Date.now(),
      created_at: new Date().toISOString(),
      ...payload
    };
    const list = getLocalProducts();
    const updated = [newProduct, ...list];
    setLocalProducts(updated);
    return {
      ...newProduct,
      variantes: normalizeProductVariants(newProduct)
    };
  }
}

/**
 * Actualizar una prenda existente con variantes de color, tallas y fotos
 */
export async function updateProduct(id, productData, newCoverImageFile = null) {
  // 1. Procesar variantes
  const processedVariants = [];
  const incomingVariants = Array.isArray(productData.variantes) ? productData.variantes : [];
  const defaultSizes = Array.isArray(productData.tallas) && productData.tallas.length > 0 
    ? productData.tallas 
    : ['S', 'M', 'L'];

  for (let i = 0; i < incomingVariants.length; i++) {
    const v = incomingVariants[i];
    let variantImageUrl = v.imagen_url || '';

    // Si tiene un archivo nuevo adjunto
    if (v.file) {
      variantImageUrl = await uploadProductImage(v.file);
    }

    const variantSizes = Array.isArray(v.tallas) && v.tallas.length > 0
      ? v.tallas
      : [...defaultSizes];

    processedVariants.push({
      id: v.id || `var-${i}-${Date.now()}`,
      color: (v.color || `Color ${i + 1}`).trim(),
      tallas: variantSizes,
      imagen_url: variantImageUrl,
      stock: v.stock !== undefined ? parseInt(v.stock, 10) : (parseInt(productData.cantidad_disponible, 10) || 0)
    });
  }

  // 2. Determinar la fotografía principal / portada
  let finalCoverUrl = productData.imagen_url || '';
  if (newCoverImageFile) {
    finalCoverUrl = await uploadProductImage(newCoverImageFile);
  } else if (!finalCoverUrl && processedVariants.length > 0) {
    const firstWithPic = processedVariants.find((v) => v.imagen_url);
    if (firstWithPic) finalCoverUrl = firstWithPic.imagen_url;
  }

  // Asegurar que ninguna variante quede sin imagen si hay una portada
  processedVariants.forEach((v) => {
    if (!v.imagen_url && finalCoverUrl) {
      v.imagen_url = finalCoverUrl;
    }
  });

  const derivedColors = processedVariants.map((v) => v.color).filter(Boolean);
  const finalColores = derivedColors.length > 0 
    ? derivedColors 
    : (Array.isArray(productData.colores) && productData.colores.length > 0 ? productData.colores : ['Único']);

  // Unión de todas las tallas de las variantes
  const allVariantSizes = Array.from(new Set(
    processedVariants.flatMap((v) => v.tallas || [])
  ));
  const finalTallas = allVariantSizes.length > 0 ? allVariantSizes : defaultSizes;

  const baseDescription = cleanProductDescription(productData.descripcion || '');

  const payload = {
    nombre: productData.nombre.trim(),
    descripcion: baseDescription,
    precio: parseFloat(productData.precio) || 0,
    tallas: finalTallas,
    colores: finalColores,
    variantes: processedVariants,
    cantidad_disponible: parseInt(productData.cantidad_disponible, 10) || 0,
    disponible: Boolean(productData.disponible),
    imagen_url: finalCoverUrl || (processedVariants[0]?.imagen_url || productData.imagen_url)
  };

  if (isSupabaseConfigured() && supabase) {
    // Intento 1: Guardar nativamente con columna 'variantes' JSONB
    let { data, error } = await supabase
      .from('productos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    // Si la columna 'variantes' no existe en Supabase (código 42703), usar respaldo transparente
    if (error && error.code === '42703') {
      console.info('Aviso: Guardando actualización con respaldo en descripción para variantes.');
      const fallbackPayload = { ...payload };
      delete fallbackPayload.variantes;
      
      const metaTag = `<!--LC_VAR:${JSON.stringify(processedVariants)}-->`;
      fallbackPayload.descripcion = fallbackPayload.descripcion 
        ? `${fallbackPayload.descripcion}\n\n${metaTag}` 
        : metaTag;

      const retryResult = await supabase
        .from('productos')
        .update(fallbackPayload)
        .eq('id', id)
        .select()
        .single();

      if (retryResult.error) {
        console.error('Error actualizando prenda con respaldo:', retryResult.error);
        throw retryResult.error;
      }
      data = retryResult.data;
    } else if (error) {
      console.error('Error updating product in Supabase:', error);
      throw error;
    }

    return {
      ...data,
      descripcion: cleanProductDescription(data.descripcion),
      variantes: normalizeProductVariants(data)
    };
  } else {
    // Modo local / demo
    const list = getLocalProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');

    const updatedProduct = { ...list[index], ...payload };
    list[index] = updatedProduct;
    setLocalProducts(list);
    return {
      ...updatedProduct,
      variantes: normalizeProductVariants(updatedProduct)
    };
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
 * Eliminar una prenda y todas las imágenes asociadas en Supabase Storage
 * (tanto la foto de portada como todas las fotos de variantes de color)
 */
export async function deleteProduct(id, productOrImages = null) {
  if (isSupabaseConfigured() && supabase) {
    const pathsToRemove = new Set();

    const collectUrls = (item) => {
      if (!item) return;
      if (typeof item === 'string') {
        const p = extractStoragePath(item);
        if (p) pathsToRemove.add(p);
      } else if (Array.isArray(item)) {
        item.forEach(collectUrls);
      } else if (typeof item === 'object') {
        if (item.imagen_url) {
          const p = extractStoragePath(item.imagen_url);
          if (p) pathsToRemove.add(p);
        }
        if (Array.isArray(item.variantes)) {
          item.variantes.forEach((v) => {
            if (v && v.imagen_url) {
              const p = extractStoragePath(v.imagen_url);
              if (p) pathsToRemove.add(p);
            }
          });
        }
      }
    };

    // 1. Recolectar rutas del parámetro pasado
    collectUrls(productOrImages);

    // 2. Si no se pasaron imágenes o producto completo, consultar la fila antes de eliminarla
    if (pathsToRemove.size === 0) {
      try {
        const { data: currentProduct } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single();
        if (currentProduct) {
          collectUrls(currentProduct);
          const normVars = normalizeProductVariants(currentProduct);
          collectUrls(normVars);
        }
      } catch (err) {
        console.warn('No se pudo precargar la prenda para extraer fotos antes de borrar:', err);
      }
    }

    // 3. Eliminar físicamente los archivos del Storage de Supabase
    const pathsArray = Array.from(pathsToRemove);
    if (pathsArray.length > 0) {
      try {
        console.info('Eliminando archivos físicos asociados en Supabase Storage:', pathsArray);
        const { data: removedData, error: removeError } = await supabase.storage
          .from('imagenes-productos')
          .remove(pathsArray);

        if (removeError) {
          console.warn('Advertencia al eliminar archivos en Storage:', removeError);
        } else {
          console.info('Archivos de imagen eliminados de Storage:', removedData);
        }
      } catch (err) {
        console.warn('No se pudo eliminar archivos físicos en Storage:', err);
      }
    }

    // 4. Eliminar el registro en la tabla 'productos'
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
  
  if (selectedColor) {
    text += `*Color / Variante:* ${selectedColor}\n`;
  } else if (product.colores && product.colores.length > 0) {
    text += `*Colores disponibles:* ${product.colores.join(', ')}\n`;
  }

  if (selectedSize) {
    text += `*Talla seleccionada:* ${selectedSize}\n`;
  } else if (product.tallas && product.tallas.length > 0) {
    text += `*Tallas disponibles:* ${product.tallas.join(', ')}\n`;
  }

  // Si la variante tiene fotografía propia, añadir el enlace para confirmación visual inmediata
  if (selectedColor && Array.isArray(product.variantes)) {
    const matched = product.variantes.find(
      (v) => v.color?.toLowerCase() === selectedColor.toLowerCase() && v.imagen_url
    );
    if (matched && matched.imagen_url && matched.imagen_url.startsWith('http')) {
      text += `*Foto de la variante:* ${matched.imagen_url}\n`;
    }
  }

  text += `\n¿Tienen disponibilidad para envío inmediato? Muchas gracias.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}


