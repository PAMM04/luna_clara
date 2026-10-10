/**
 * Utilidad de Optimización y Compresión de Imágenes en Frontend (WebP Nativo)
 * 
 * - Redimensiona imágenes a ancho/alto óptimo de catálogo (máx 1200px / 1600px).
 * - Respeta orientación EXIF en fotos tomadas con cámaras de smartphones.
 * - Convierte a formato WebP moderno con compresión visualmente sin pérdidas (~82% calidad).
 * - Preserva canal alfa de transparencia si la imagen original es PNG.
 * - Reduce fotografías de 3MB - 12MB a típicamente 50KB - 120KB (< 150KB).
 * - Provee métricas de ahorro (bytes y porcentaje) para feedback visual inmediato.
 */

const DEFAULT_OPTIONS = {
  maxWidth: 1200,      // Ancho máximo para catálogo de moda
  maxHeight: 1600,     // Alto máximo para catálogo de moda
  quality: 0.82,       // Calidad WebP óptima (82% conserva textura de telas y colores vivos)
  format: 'image/webp'
};

/**
 * Formatea un tamaño en bytes a representación legible (B, KB, MB)
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = (bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : (i === 1 ? 0 : 1));
  return `${val} ${sizes[i]}`;
}

/**
 * Valida si un archivo es una imagen soportada
 */
export function isImageFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  if (file.name && /\.(jpe?g|png|webp|gif|bmp|heic|avif)$/i.test(file.name)) return true;
  return false;
}

/**
 * Carga una imagen respetando su orientación EXIF móvil
 */
async function loadImageSource(file) {
  // Estrategia 1: createImageBitmap con orientación EXIF automática
  if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
    try {
      const bitmap = await window.createImageBitmap(file, { imageOrientation: 'from-image' });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => {
          if (typeof bitmap.close === 'function') {
            bitmap.close();
          }
        }
      };
    } catch {
      // Si falla en algún navegador o formato, continuar con fallback Image element
    }
  }

  // Estrategia 2: Elemento HTML Image tradicional
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => {
          URL.revokeObjectURL(objectUrl);
        }
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo decodificar la imagen seleccionada.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Calcula las nuevas dimensiones proporcionales sin sobre-escalar
 */
function calculateDimensions(width, height, maxWidth, maxHeight) {
  if (width <= maxWidth && height <= maxHeight) {
    return { targetWidth: width, targetHeight: height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  const targetWidth = Math.max(1, Math.round(width * ratio));
  const targetHeight = Math.max(1, Math.round(height * ratio));

  return { targetWidth, targetHeight };
}

/**
 * Comprime y convierte una imagen a WebP usando HTML5 Canvas nativo
 * 
 * @param {File|Blob} file - Archivo de imagen seleccionado
 * @param {Object} [customOptions] - Opciones de compresión personalizadas
 * @returns {Promise<Object>} Resultado con archivo WebP, Blob, previewUrl y estadísticas
 */
export async function compressAndConvertToWebP(file, customOptions = {}) {
  if (!file) {
    throw new Error('No se ha proporcionado ningún archivo para procesar.');
  }

  if (!isImageFile(file)) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  const options = { ...DEFAULT_OPTIONS, ...customOptions };

  // 1. Cargar imagen y dimensiones originales
  const { source, width: origWidth, height: origHeight, cleanup } = await loadImageSource(file);

  try {
    // 2. Calcular nuevas dimensiones para catálogo
    const { targetWidth, targetHeight } = calculateDimensions(
      origWidth,
      origHeight,
      options.maxWidth,
      options.maxHeight
    );

    // 3. Crear canvas y renderizar con suavizado de alta fidelidad
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) {
      throw new Error('No se pudo inicializar el motor de renderizado Canvas.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Dibujar la imagen escalada
    ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

    // 4. Exportar a Blob en formato WebP con calidad seleccionada
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (resultBlob) => {
          if (resultBlob && resultBlob.size > 0) {
            resolve(resultBlob);
          } else {
            // Fallback transparente a JPEG si el entorno no admite exportación WebP
            canvas.toBlob(
              (fallbackBlob) => {
                if (fallbackBlob && fallbackBlob.size > 0) resolve(fallbackBlob);
                else reject(new Error('Fallo al comprimir la imagen en Canvas.'));
              },
              'image/jpeg',
              options.quality
            );
          }
        },
        options.format,
        options.quality
      );
    });

    // 5. Crear objeto File definitivo con extensión .webp y nombre sanitizado
    const originalName = file.name || 'prenda';
    const nameWithoutExt = originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const isWebP = blob.type === 'image/webp';
    const cleanExtension = isWebP ? 'webp' : 'jpg';
    const cleanFileName = `${nameWithoutExt}.${cleanExtension}`;

    const optimizedFile = new File([blob], cleanFileName, {
      type: blob.type,
      lastModified: Date.now()
    });

    // 6. Calcular métricas de optimización
    const originalSize = file.size || 0;
    const compressedSize = blob.size;
    const savedBytes = Math.max(0, originalSize - compressedSize);
    const savedPercent = originalSize > 0 
      ? Math.round((savedBytes / originalSize) * 100) 
      : 0;

    const previewUrl = URL.createObjectURL(blob);

    return {
      file: optimizedFile,
      blob,
      previewUrl,
      originalSize,
      compressedSize,
      savedBytes,
      savedPercent,
      width: targetWidth,
      height: targetHeight,
      originalWidth: origWidth,
      originalHeight: origHeight,
      format: blob.type,
      formattedOriginalSize: formatFileSize(originalSize),
      formattedCompressedSize: formatFileSize(compressedSize)
    };
  } finally {
    // Liberar recursos de memoria
    cleanup();
  }
}
