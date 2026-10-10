import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct, normalizeProductVariants } from '../lib/supabase';
import { 
  X, Upload, Plus, Trash2, Check, AlertCircle, 
  Camera, Image as ImageIcon, Star, Loader2, Zap 
} from 'lucide-react';
import { compressAndConvertToWebP, formatFileSize } from '../lib/imageOptimizer';


const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];
const SUGGESTED_COLORS = [
  'Rosa', 'Negro', 'Blanco', 'Beige', 'Champagne', 
  'Crema', 'Azul', 'Verde', 'Terracota', 'Rojo', 'Gris'
];

export default function ProductFormModal({ product, onClose, onSaveSuccess, addToast }) {
  const isEditing = Boolean(product && product.id);

  // Estados generales del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidadDisponible, setCantidadDisponible] = useState(1);
  const [disponible, setDisponible] = useState(true);
  const [tallas, setTallas] = useState(['S', 'M', 'L']);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Estados de variantes por color
  // Cada variante: { id: string, color: string, imagen_url: string, file: File|null, previewUrl: string, isCover: boolean, isUrlMode?: boolean, isOptimizing?: boolean, compressionStats?: object }
  const [variantes, setVariantes] = useState([]);
  const [customColorInput, setCustomColorInput] = useState('');

  // Fotografía de portada general opcional (si se quiere una foto de grupo/modelo aparte)
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [showCoverSection, setShowCoverSection] = useState(false);
  const [isOptimizingCover, setIsOptimizingCover] = useState(false);
  const [coverCompressionStats, setCoverCompressionStats] = useState(null);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setNombre(product.nombre || '');
      setDescripcion(product.descripcion || '');
      setPrecio(product.precio !== undefined ? String(product.precio) : '');
      setCantidadDisponible(product.cantidad_disponible !== undefined ? product.cantidad_disponible : 1);
      setDisponible(product.disponible !== undefined ? product.disponible : true);
      setTallas(Array.isArray(product.tallas) ? [...product.tallas] : []);

      // Cargar variantes normalizadas
      const normVariants = normalizeProductVariants(product);
      const productSizes = Array.isArray(product.tallas) && product.tallas.length > 0 ? [...product.tallas] : ['S', 'M', 'L'];

      if (normVariants && normVariants.length > 0) {
        setVariantes(normVariants.map((v, idx) => ({
          id: v.id || `var-${idx}-${Date.now()}`,
          color: v.color || 'Color',
          tallas: Array.isArray(v.tallas) && v.tallas.length > 0 ? [...v.tallas] : [...productSizes],
          imagen_url: v.imagen_url || '',
          file: null,
          previewUrl: v.imagen_url || '',
          isCover: idx === 0,
          isUrlMode: false,
          isOptimizing: false,
          compressionStats: null
        })));
      } else {
        setVariantes([{
          id: `var-0-${Date.now()}`,
          color: 'Único',
          tallas: [...productSizes],
          imagen_url: product.imagen_url || '',
          file: null,
          previewUrl: product.imagen_url || '',
          isCover: true,
          isUrlMode: false,
          isOptimizing: false,
          compressionStats: null
        }]);
      }

      setCoverPreview(product.imagen_url || '');
      setCoverUrlInput(product.imagen_url || '');
      setIsOptimizingCover(false);
      setCoverCompressionStats(null);
    } else {
      // Valores iniciales para creación de nueva prenda
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setCantidadDisponible(5);
      setDisponible(true);
      setTallas(['S', 'M', 'L']);
      
      // Una primera variante lista para capturar foto en móvil con tallas iniciales
      setVariantes([
        {
          id: `var-init-${Date.now()}`,
          color: 'Rosa',
          tallas: ['S', 'M', 'L'],
          imagen_url: '',
          file: null,
          previewUrl: '',
          isCover: true,
          isUrlMode: false,
          isOptimizing: false,
          compressionStats: null
        }
      ]);
      setCoverFile(null);
      setCoverPreview('');
      setCoverUrlInput('');
      setShowCoverSection(false);
      setIsOptimizingCover(false);
      setCoverCompressionStats(null);
    }
  }, [product]);

  // Manejo de Tallas Base
  const toggleSize = (size) => {
    let nextSizes;
    if (tallas.includes(size)) {
      nextSizes = tallas.filter((s) => s !== size);
    } else {
      nextSizes = [...tallas, size];
    }
    setTallas(nextSizes);
  };

  const handleAddCustomSize = (e) => {
    e.preventDefault();
    if (customSizeInput.trim() && !tallas.includes(customSizeInput.trim().toUpperCase())) {
      setTallas([...tallas, customSizeInput.trim().toUpperCase()]);
      setCustomSizeInput('');
    }
  };

  // Manejo de Tallas Específicas por Color/Variante
  const toggleVariantSize = (variantId, size) => {
    setVariantes((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const currentSizes = Array.isArray(v.tallas) ? v.tallas : [];
          const nextSizes = currentSizes.includes(size)
            ? currentSizes.filter((s) => s !== size)
            : [...currentSizes, size];
          return { ...v, tallas: nextSizes };
        }
        return v;
      })
    );
  };

  const addCustomSizeToVariant = (variantId, sizeName) => {
    const cleanSize = sizeName.trim().toUpperCase();
    if (!cleanSize) return;
    setVariantes((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const currentSizes = Array.isArray(v.tallas) ? v.tallas : [];
          if (!currentSizes.includes(cleanSize)) {
            return { ...v, tallas: [...currentSizes, cleanSize] };
          }
        }
        return v;
      })
    );
  };

  const copyVariantSizesToAll = (sourceVariantId) => {
    const source = variantes.find((v) => v.id === sourceVariantId);
    if (!source || !source.tallas || source.tallas.length === 0) {
      addToast({
        type: 'info',
        title: 'Sin tallas para copiar',
        message: 'Esta variante no tiene tallas seleccionadas.'
      });
      return;
    }
    setVariantes((prev) =>
      prev.map((v) => ({
        ...v,
        tallas: [...source.tallas]
      }))
    );
    addToast({
      type: 'success',
      title: 'Tallas sincronizadas',
      message: `Se aplicaron las tallas de "${source.color}" (${source.tallas.join(', ')}) a todas las variantes.`
    });
  };

  // Manejo de Variantes

  const addVariant = (colorName) => {
    const cleanName = colorName.trim();
    if (!cleanName) return;

    // Verificar si ya existe este color
    const exists = variantes.some((v) => v.color.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      addToast({
        type: 'info',
        title: 'Variante ya agregada',
        message: `El color "${cleanName}" ya está en la lista de variantes.`
      });
      return;
    }

    const newVar = {
      id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      color: cleanName,
      tallas: tallas.length > 0 ? [...tallas] : ['S', 'M', 'L'],
      imagen_url: '',
      file: null,
      previewUrl: '',
      isCover: variantes.length === 0,
      isUrlMode: false,
      isOptimizing: false,
      compressionStats: null
    };

    setVariantes((prev) => [...prev, newVar]);
  };

  const removeVariant = (id) => {
    if (variantes.length <= 1) {
      addToast({
        type: 'warning',
        title: 'Al menos una variante',
        message: 'La prenda debe tener al menos una variante de color.'
      });
      return;
    }
    const filtered = variantes.filter((v) => v.id !== id);
    // Si eliminamos la que era portada, asignar la primera como portada
    if (filtered.length > 0 && !filtered.some((v) => v.isCover)) {
      filtered[0].isCover = true;
    }
    setVariantes(filtered);
  };

  const setVariantAsCover = (id) => {
    setVariantes((prev) =>
      prev.map((v) => ({
        ...v,
        isCover: v.id === id
      }))
    );
    // Actualizar preview de portada
    const target = variantes.find((v) => v.id === id);
    if (target && target.previewUrl) {
      setCoverPreview(target.previewUrl);
    }
  };

  const updateVariantColorName = (id, newColor) => {
    setVariantes((prev) =>
      prev.map((v) => (v.id === id ? { ...v, color: newColor } : v))
    );
  };

  // Asignar archivo desde cámara o galería a una variante específica con compresión automática WebP
  const handleVariantFileChange = async (variantId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|avif)$/i)) {
      addToast({
        type: 'error',
        title: 'Formato no soportado',
        message: 'Por favor selecciona una imagen válida (JPG, PNG o WebP).'
      });
      return;
    }

    // 1. Mostrar preview temporal y activar indicador visual de procesamiento
    const tempPreviewUrl = URL.createObjectURL(file);
    setVariantes((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            previewUrl: tempPreviewUrl,
            imagen_url: tempPreviewUrl,
            isOptimizing: true,
            compressionStats: null
          };
        }
        return v;
      })
    );

    // Si es portada preliminarmente, actualizar vista previa
    const targetVar = variantes.find((v) => v.id === variantId);
    if (targetVar?.isCover || variantes[0]?.id === variantId) {
      setCoverPreview(tempPreviewUrl);
    }

    // 2. Ejecutar conversión y compresión automática a WebP (máx 1200px, 82% calidad)
    try {
      const optimized = await compressAndConvertToWebP(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.82
      });

      setVariantes((prev) =>
        prev.map((v) => {
          if (v.id === variantId) {
            return {
              ...v,
              file: optimized.file,
              previewUrl: optimized.previewUrl,
              imagen_url: optimized.previewUrl,
              isOptimizing: false,
              compressionStats: {
                originalSize: optimized.originalSize,
                compressedSize: optimized.compressedSize,
                savedPercent: optimized.savedPercent,
                width: optimized.width,
                height: optimized.height
              }
            };
          }
          return v;
        })
      );

      // Si es la portada designada, actualizar la vista previa con el WebP definitivo
      if (targetVar?.isCover || variantes[0]?.id === variantId) {
        setCoverPreview(optimized.previewUrl);
      }

      addToast({
        type: 'success',
        title: 'Imagen optimizada a WebP',
        message: `Foto para "${targetVar?.color || 'Variante'}" reducida de ${formatFileSize(optimized.originalSize)} a ${formatFileSize(optimized.compressedSize)} (-${optimized.savedPercent}%)`
      });
    } catch (err) {
      console.error('Error optimizando imagen a WebP:', err);
      // Fallback transparente: mantener archivo original para no bloquear al usuario
      setVariantes((prev) =>
        prev.map((v) => {
          if (v.id === variantId) {
            return {
              ...v,
              file,
              isOptimizing: false,
              compressionStats: null
            };
          }
          return v;
        })
      );
      addToast({
        type: 'warning',
        title: 'Aviso de imagen',
        message: 'No se pudo aplicar compresión WebP; se usará la imagen original.'
      });
    }
  };

  // Quitar foto de una variante
  const clearVariantPhoto = (variantId) => {
    setVariantes((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            file: null,
            previewUrl: '',
            imagen_url: '',
            isOptimizing: false,
            compressionStats: null
          };
        }
        return v;
      })
    );
  };

  // Actualizar URL directa de una variante
  const updateVariantUrl = (variantId, url) => {
    setVariantes((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            file: null,
            previewUrl: url,
            imagen_url: url,
            isOptimizing: false,
            compressionStats: null
          };
        }
        return v;
      })
    );
  };

  // Portada general opcional con compresión automática WebP
  const handleCoverFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|avif)$/i)) {
      addToast({
        type: 'error',
        title: 'Formato no soportado',
        message: 'Por favor selecciona una imagen válida (JPG, PNG o WebP).'
      });
      return;
    }

    const tempPreview = URL.createObjectURL(file);
    setCoverPreview(tempPreview);
    setIsOptimizingCover(true);
    setCoverCompressionStats(null);

    try {
      const optimized = await compressAndConvertToWebP(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.82
      });

      setCoverFile(optimized.file);
      setCoverPreview(optimized.previewUrl);
      setCoverCompressionStats({
        originalSize: optimized.originalSize,
        compressedSize: optimized.compressedSize,
        savedPercent: optimized.savedPercent,
        width: optimized.width,
        height: optimized.height
      });

      addToast({
        type: 'success',
        title: 'Portada optimizada a WebP',
        message: `Foto reducida de ${formatFileSize(optimized.originalSize)} a ${formatFileSize(optimized.compressedSize)} (-${optimized.savedPercent}%)`
      });
    } catch (err) {
      console.error('Error optimizando foto de portada:', err);
      setCoverFile(file);
    } finally {
      setIsOptimizingCover(false);
    }
  };

  // Indicador de si alguna foto está procesándose actualmente
  const isAnyOptimizing = Boolean(
    isOptimizingCover || variantes.some((v) => v.isOptimizing)
  );

  // Validación y guardado
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAnyOptimizing) {
      addToast({
        type: 'info',
        title: 'Optimizando imágenes',
        message: 'Por favor espera unos segundos mientras termina la compresión WebP.'
      });
      return;
    }

    const newErrors = {};

    if (!nombre.trim()) newErrors.nombre = 'El nombre de la prenda es obligatorio.';
    if (!precio || isNaN(Number(precio)) || Number(precio) <= 0) {
      newErrors.precio = 'Ingresa un precio válido en Bs. mayor a 0.';
    }
    if (variantes.length === 0) {
      newErrors.variantes = 'Debes tener al menos un color o variante.';
    }

    // Verificar si hay al menos una imagen (en alguna variante o en la portada)
    const hasAnyImage = 
      coverPreview || 
      coverFile || 
      coverUrlInput.trim() || 
      variantes.some((v) => v.previewUrl || v.imagen_url || v.file);

    if (!hasAnyImage) {
      newErrors.imagen = 'Debes tomar o subir al menos una fotografía (para una variante o como portada).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast({
        type: 'warning',
        title: 'Campos requeridos',
        message: Object.values(newErrors)[0]
      });
      return;
    }

    setSaving(true);
    try {
      // Ordenar las variantes para que la designada como Portada quede primera
      const sortedVariants = [...variantes].sort((a, b) => {
        if (a.isCover) return -1;
        if (b.isCover) return 1;
        return 0;
      });

      // Unión de tallas de todas las variantes para filtros globales
      const unionSizes = Array.from(new Set([
        ...tallas,
        ...sortedVariants.flatMap((v) => v.tallas || [])
      ])).filter(Boolean);

      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: parseFloat(precio),
        cantidad_disponible: parseInt(cantidadDisponible, 10) || 0,
        disponible,
        tallas: unionSizes.length > 0 ? unionSizes : ['S', 'M', 'L'],
        colores: sortedVariants.map((v) => v.color.trim()).filter(Boolean),
        variantes: sortedVariants.map((v) => ({
          ...v,
          tallas: Array.isArray(v.tallas) && v.tallas.length > 0 ? v.tallas : (unionSizes.length > 0 ? unionSizes : ['S', 'M', 'L'])
        })),
        imagen_url: coverPreview || ''
      };

      let result;
      if (isEditing) {
        result = await updateProduct(product.id, payload, coverFile);
        addToast({
          type: 'success',
          title: 'Prenda actualizada',
          message: `Se guardaron las variantes y fotos de "${nombre}".`
        });
      } else {
        result = await createProduct(payload, coverFile);
        addToast({
          type: 'success',
          title: 'Prenda publicada',
          message: `"${nombre}" fue añadida con éxito con ${sortedVariants.length} variante(s).`
        });
      }

      onSaveSuccess(result);
      onClose();
    } catch (err) {
      console.error('Error saving product with variants:', err);
      addToast({
        type: 'error',
        title: 'Error al guardar',
        message: err.message || 'No se pudo guardar la prenda. Verifica la conexión.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '720px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Cabecera del modal */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-sand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'var(--color-white)',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-noir)', margin: 0 }}>
              {isEditing ? 'Editar Prenda y Variantes' : 'Nueva Prenda para el Catálogo'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0.2rem 0 0' }}>
              Optimizado para móvil: asigna una fotografía por color sin repetir datos.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido / Formulario con Scroll */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem', overflowY: 'auto' }}>
          
          {/* 1. Nombre de la prenda */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
              Nombre de la Prenda *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) setErrors({ ...errors, nombre: null });
              }}
              placeholder="Ej: Pijama de Mujer 3 piezas"
              className="input-field"
              required
            />
            {errors.nombre && <div style={{ color: 'var(--status-soldout)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.nombre}</div>}
          </div>

          {/* 2. Precio en Bolivianos y Stock Total */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
                Precio en Bolivianos (Bs.) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => {
                  setPrecio(e.target.value);
                  if (errors.precio) setErrors({ ...errors, precio: null });
                }}
                placeholder="Ej: 60.00"
                className="input-field"
                required
              />
              {errors.precio && <div style={{ color: 'var(--status-soldout)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.precio}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
                Cantidad en Stock Total
              </label>
              <input
                type="number"
                min="0"
                value={cantidadDisponible}
                onChange={(e) => setCantidadDisponible(e.target.value)}
                placeholder="Ej: 10"
                className="input-field"
              />
            </div>
          </div>

          {/* 3. Tallas Disponibles (Multi-selector táctil) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                Tallas Base del Modelo (Plantilla general)
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                Personalizable por color más abajo
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              Define las tallas generales de la prenda. Más abajo puedes personalizar tallas únicas por cada color (ej: Negro M y 2, Verde XL y S).
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {COMMON_SIZES.map((size) => {
                const isSelected = tallas.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                      background: isSelected ? 'var(--gold-subtle)' : 'var(--color-white)',
                      color: isSelected ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Agregar talla personalizada */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                placeholder="Otra talla (ej. 38, 40)..."
                className="input-field"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSize(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                <Plus size={15} />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. SECCIÓN PRINCIPAL: VARIANTES POR COLOR Y FOTOGRAFÍAS */}
          {/* ============================================================== */}
          <div style={{
            background: 'var(--color-cream)',
            border: '1px solid var(--color-sand)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Camera size={18} color="var(--gold-primary)" />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-noir)' }}>
                  Variantes de Color y Fotografías *
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--gold-dark)', fontWeight: 600 }}>
                {variantes.length} variante(s) configurada(s)
              </span>
            </div>
            
            <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.6rem', lineHeight: 1.4 }}>
              Asocia una foto a cada color disponible. En la tienda, la imagen cambiará automáticamente cuando el cliente elija el color.
            </p>

            {/* Aviso visual de optimización automática WebP */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(197, 160, 89, 0.1)',
              border: '1px solid rgba(197, 160, 89, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem',
              marginBottom: '0.9rem',
              fontSize: '0.75rem',
              color: 'var(--color-charcoal)'
            }}>
              <Zap size={15} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--gold-dark)' }}>Compresión inteligente WebP activa:</strong> Cada foto se redimensiona a máx. 1200px y se comprime automáticamente en formato WebP (~82% calidad, peso &lt;150 KB) para cuidar la cuota de Supabase Storage y cargar ultra-rápido en móviles.
              </div>
            </div>

            {/* Chips de adición rápida de colores sugeridos */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.35rem' }}>
                Toca para añadir un color rápidamente:
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {SUGGESTED_COLORS.map((col) => {
                  const alreadyAdded = variantes.some((v) => v.color.toLowerCase() === col.toLowerCase());
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => addVariant(col)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: alreadyAdded ? '1px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                        background: alreadyAdded ? 'rgba(197, 160, 89, 0.15)' : 'var(--color-white)',
                        color: alreadyAdded ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                        fontSize: '0.76rem',
                        fontWeight: alreadyAdded ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {alreadyAdded && <Check size={12} />}
                      <span>{col}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input para color personalizado */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  placeholder="Escribe otro color (ej. Verde Menta, Rosa Viejo)..."
                  className="input-field"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customColorInput.trim()) {
                        addVariant(customColorInput);
                        setCustomColorInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customColorInput.trim()) {
                      addVariant(customColorInput);
                      setCustomColorInput('');
                    }
                  }}
                  className="btn btn-outline"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                >
                  <Plus size={15} />
                  <span>Añadir</span>
                </button>
              </div>
            </div>

            {errors.imagen && (
              <div style={{ 
                color: 'var(--status-soldout)', 
                fontSize: '0.78rem', 
                marginBottom: '0.75rem',
                padding: '0.5rem',
                background: 'var(--status-soldout-bg)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <AlertCircle size={15} />
                <span>{errors.imagen}</span>
              </div>
            )}

            {/* LISTA DE TARJETAS DE VARIANTES (Mobile-First Touch Cards) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {variantes.map((v, index) => {
                const isCover = v.isCover || index === 0;
                const hasPhoto = Boolean(v.previewUrl || v.imagen_url);

                return (
                  <div
                    key={v.id}
                    style={{
                      background: 'var(--color-white)',
                      border: isCover ? '2px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative'
                    }}
                  >
                    {/* Barra superior de la variante */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 200px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'var(--gold-primary)',
                          boxShadow: '0 0 0 2px rgba(197, 160, 89, 0.2)'
                        }} />
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => updateVariantColorName(v.id, e.target.value)}
                          placeholder="Nombre del color..."
                          style={{
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            color: 'var(--color-noir)',
                            border: '1px solid transparent',
                            background: 'transparent',
                            padding: '0.2rem 0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none',
                            maxWidth: '180px'
                          }}
                          onFocus={(e) => e.target.style.border = '1px solid var(--color-sand)'}
                          onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        />
                        {isCover && (
                          <span style={{
                            background: 'var(--color-noir)',
                            color: 'var(--gold-light)',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Star size={10} fill="var(--gold-light)" />
                            <span>Portada</span>
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => setVariantAsCover(v.id)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--color-sand)',
                              color: 'var(--color-muted)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Usar esta variante como foto principal del catálogo"
                          >
                            <Star size={11} />
                            <span>Hacer Portada</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '0.3rem',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Eliminar esta variante"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Zona de Fotografía de la Variante (Optimizado para Cámara / Galería en Celular) */}
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {hasPhoto ? (
                        <>
                          {/* Miniatura de la foto asignada con overlay de procesamiento */}
                          <div style={{
                            width: '75px',
                            height: '90px',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            border: '1px solid var(--color-sand)',
                            background: '#F5F2EB',
                            flexShrink: 0,
                            position: 'relative'
                          }}>
                            <img
                              src={v.previewUrl || v.imagen_url}
                              alt={`Variante ${v.color}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {v.isOptimizing && (
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(255, 255, 255, 0.88)',
                                backdropFilter: 'blur(2px)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.2rem'
                              }}>
                                <Loader2 size={18} className="spin-animation" color="var(--gold-primary)" />
                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold-dark)' }}>WebP</span>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                            {v.isOptimizing ? (
                              <div style={{ fontSize: '0.78rem', color: 'var(--gold-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Loader2 size={13} className="spin-animation" color="var(--gold-primary)" />
                                <span>Optimizando imagen a WebP (máx. 1200px)...</span>
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Check size={14} />
                                <span>Foto lista para {v.color}</span>
                              </div>
                            )}

                            {/* Indicador de compresión WebP y ahorro de peso */}
                            {v.compressionStats && !v.isOptimizing && (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.28)',
                                color: '#065F46',
                                padding: '0.2rem 0.55rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                width: 'fit-content'
                              }}>
                                <Zap size={11} color="#10B981" />
                                <span>WebP: {formatFileSize(v.compressionStats.compressedSize)}</span>
                                {v.compressionStats.savedPercent > 0 && (
                                  <span style={{ color: '#047857', opacity: 0.9 }}>
                                    (-{v.compressionStats.savedPercent}%)
                                  </span>
                                )}
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              {/* Botón táctil para cambiar foto */}
                              <label style={{
                                background: 'var(--color-cream)',
                                border: '1px solid var(--color-sand)',
                                color: 'var(--color-charcoal)',
                                padding: '0.4rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: v.isOptimizing ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                opacity: v.isOptimizing ? 0.6 : 1
                              }}>
                                <Camera size={14} color="var(--gold-primary)" />
                                <span>{v.isOptimizing ? 'Procesando...' : 'Cambiar foto'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={v.isOptimizing}
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleVariantFileChange(v.id, e)}
                                />
                              </label>

                              {/* Quitar foto */}
                              <button
                                type="button"
                                onClick={() => clearVariantPhoto(v.id)}
                                disabled={v.isOptimizing}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--color-muted)',
                                  fontSize: '0.75rem',
                                  cursor: v.isOptimizing ? 'not-allowed' : 'pointer',
                                  textDecoration: 'underline',
                                  opacity: v.isOptimizing ? 0.6 : 1
                                }}
                              >
                                Quitar foto
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Botón táctil grande para tomar foto con celular o elegir de galería */
                        <div style={{ width: '100%' }}>
                          {v.isOptimizing ? (
                            <div style={{
                              border: '2px solid var(--gold-primary)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.85rem 1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.65rem',
                              background: 'var(--gold-subtle)'
                            }}>
                              <Loader2 size={20} className="spin-animation" color="var(--gold-primary)" />
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-noir)' }}>
                                  Optimizando foto para "{v.color}"...
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--gold-dark)' }}>
                                  Redimensionando a máx. 1200px y convirtiendo a formato WebP ligero
                                </div>
                              </div>
                            </div>
                          ) : (
                            <label style={{
                              border: '2px dashed var(--color-sand)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.85rem 1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.6rem',
                              cursor: 'pointer',
                              background: 'rgba(247, 245, 240, 0.6)',
                              transition: 'all 0.15s ease'
                            }}>
                              <Camera size={20} color="var(--gold-primary)" />
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-noir)' }}>
                                  Tomar foto o elegir de galería para "{v.color}"
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                                  Toca aquí con tu celular para abrir cámara o fotos
                                </div>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleVariantFileChange(v.id, e)}
                              />
                            </label>
                          )}

                          {/* Alternativa: Enlace directo URL */}
                          <div style={{ marginTop: '0.35rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setVariantes((prev) =>
                                  prev.map((item) => (item.id === v.id ? { ...item, isUrlMode: !item.isUrlMode } : item))
                                );
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--gold-dark)',
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              {v.isUrlMode ? 'Cerrar entrada de URL' : 'O pegar enlace directo URL'}
                            </button>
                          </div>

                          {v.isUrlMode && (
                            <div style={{ marginTop: '0.35rem' }}>
                              <input
                                type="url"
                                placeholder="https://ejemplo.com/foto.jpg"
                                className="input-field"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                value={v.imagen_url || ''}
                                onChange={(e) => updateVariantUrl(v.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ============================================================== */}
                    {/* TALLAS ESPECÍFICAS PARA ESTA VARIANTE DE COLOR */}
                    {/* ============================================================== */}
                    <div style={{
                      marginTop: '0.4rem',
                      padding: '0.75rem',
                      background: 'rgba(247, 245, 240, 0.75)',
                      border: '1px solid var(--color-sand)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.45rem',
                        flexWrap: 'wrap',
                        gap: '0.35rem'
                      }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-noir)' }}>
                          Tallas disponibles para {v.color}:
                        </div>

                        {variantes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => copyVariantSizesToAll(v.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--gold-dark)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                            title="Copiar estas mismas tallas a todas las demás variantes de color"
                          >
                            Copiar estas tallas a todos los colores
                          </button>
                        )}
                      </div>

                      {/* Chips de tallas comunes para activar/desactivar al tacto */}
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                        {COMMON_SIZES.map((size) => {
                          const isSelected = (v.tallas || []).includes(size);
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleVariantSize(v.id, size)}
                              style={{
                                padding: '0.28rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                border: isSelected ? '1.5px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                                background: isSelected ? 'var(--gold-subtle)' : 'var(--color-white)',
                                color: isSelected ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: '0.76rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.12s ease'
                              }}
                            >
                              {isSelected && <Check size={11} color="var(--gold-dark)" />}
                              <span>{size}</span>
                            </button>
                          );
                        })}

                        {/* Tallas personalizadas específicas de esta variante que no están en COMMON_SIZES (ej. 2, 38) */}
                        {(v.tallas || [])
                          .filter((s) => !COMMON_SIZES.includes(s))
                          .map((customSize) => (
                            <button
                              key={customSize}
                              type="button"
                              onClick={() => toggleVariantSize(v.id, customSize)}
                              style={{
                                padding: '0.28rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1.5px solid var(--gold-primary)',
                                background: 'var(--gold-subtle)',
                                color: 'var(--gold-dark)',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              title="Toca para quitar esta talla personalizada"
                            >
                              <Check size={11} color="var(--gold-dark)" />
                              <span>{customSize}</span>
                              <span style={{ fontSize: '0.72rem', marginLeft: '2px', opacity: 0.7 }}>✕</span>
                            </button>
                          ))}
                      </div>

                      {/* Mini-input para añadir talla personalizada a este color (ej. "2", "38", "XL") */}
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder={`Otra talla para ${v.color} (ej. 2, 38)...`}
                          id={`input-size-${v.id}`}
                          className="input-field"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.76rem', flex: '1 1 150px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                addCustomSizeToVariant(v.id, val);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`input-size-${v.id}`);
                            if (input && input.value.trim()) {
                              addCustomSizeToVariant(v.id, input.value.trim());
                              input.value = '';
                            }
                          }}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                        >
                          <Plus size={12} />
                          <span>Añadir</span>
                        </button>
                      </div>

                      <div style={{ marginTop: '0.3rem', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                        Seleccionadas: <strong style={{ color: 'var(--gold-dark)' }}>{(v.tallas || []).length > 0 ? (v.tallas || []).join(', ') : 'Ninguna (el cliente no verá tallas para este color)'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botón grande para añadir otro color */}
            <button
              type="button"
              onClick={() => addVariant(`Color ${variantes.length + 1}`)}
              style={{
                marginTop: '0.85rem',
                width: '100%',
                padding: '0.75rem',
                border: '1px dashed var(--gold-primary)',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.8)',
                color: 'var(--gold-dark)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Plus size={16} />
              <span>Añadir otra variante de color</span>
            </button>
          </div>

          {/* 5. Fotografía de Portada General (Acordeón Opcional) */}
          <div style={{ borderTop: '1px solid var(--color-sand)', paddingTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setShowCoverSection(!showCoverSection)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-charcoal)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <ImageIcon size={15} color="var(--gold-primary)" />
              <span>{showCoverSection ? 'Ocultar foto de portada general' : 'Configurar una foto de portada general diferente (opcional)'}</span>
            </button>

            {showCoverSection && (
              <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--color-cream)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '0.76rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                  Por defecto se usará la foto de la variante marcada como Portada. Si deseas una foto de grupo o modelo diferente:
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label 
                    className="btn btn-outline" 
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.45rem 0.85rem', 
                      cursor: isOptimizingCover ? 'not-allowed' : 'pointer',
                      opacity: isOptimizingCover ? 0.6 : 1 
                    }}
                  >
                    {isOptimizingCover ? (
                      <>
                        <Loader2 size={14} className="spin-animation" color="var(--gold-primary)" />
                        <span>Optimizando portada...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Seleccionar foto de portada</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isOptimizingCover}
                      style={{ display: 'none' }} 
                      onChange={handleCoverFileChange} 
                    />
                  </label>

                  {coverPreview && (
                    <div style={{ position: 'relative', width: '40px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-sand)' }}>
                      <img src={coverPreview} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {isOptimizingCover && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Loader2 size={14} className="spin-animation" color="var(--gold-primary)" />
                        </div>
                      )}
                    </div>
                  )}

                  {coverCompressionStats && !isOptimizingCover && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.28)',
                      color: '#065F46',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}>
                      <Zap size={11} color="#10B981" />
                      <span>WebP: {formatFileSize(coverCompressionStats.compressedSize)} (-{coverCompressionStats.savedPercent}%)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 6. Descripción de la prenda */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
              Descripción / Detalles de la Confección
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles del tejido, caída, escote, ocasión de uso..."
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* 7. Switch de Disponibilidad */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            background: 'var(--color-cream)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-sand)'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-noir)' }}>
                Estado de Publicación en Vitrina
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)' }}>
                {disponible ? 'Aparece disponible con botón activo para pedidos por WhatsApp' : 'Aparece como "Agotado"'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDisponible(!disponible)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div className={`switch-track ${disponible ? 'active' : ''}`}>
                <div className="switch-thumb" />
              </div>
            </button>
          </div>

          {/* Botones de acción inferiores */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--color-sand)',
            paddingTop: '1.25rem',
            marginTop: '0.5rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn btn-outline"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || isAnyOptimizing}
              className="btn btn-gold"
              style={{ minWidth: '185px' }}
            >
              {isAnyOptimizing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center' }}>
                  <Loader2 size={16} className="spin-animation" />
                  <span>Optimizando imágenes...</span>
                </div>
              ) : saving ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center' }}>
                  <Loader2 size={16} className="spin-animation" />
                  <span>Subiendo fotos y guardando...</span>
                </div>
              ) : (
                <>
                  <Check size={18} />
                  <span>{isEditing ? 'Guardar Cambios' : 'Publicar Prenda'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
