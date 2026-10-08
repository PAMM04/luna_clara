import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../lib/supabase';
import { X, Upload, Plus, Trash2, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];
const COMMON_COLORS = ['Negro', 'Blanco', 'Beige', 'Champagne', 'Crema', 'Rosa', 'Azul', 'Terracota', 'Verde'];

export default function ProductFormModal({ product, onClose, onSaveSuccess, addToast }) {
  const isEditing = Boolean(product && product.id);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidadDisponible, setCantidadDisponible] = useState(1);
  const [disponible, setDisponible] = useState(true);
  const [tallas, setTallas] = useState(['S', 'M', 'L']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colores, setColores] = useState(['Negro', 'Beige']);
  const [customColorInput, setCustomColorInput] = useState('');
  
  // Imagen
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);

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
      setColores(Array.isArray(product.colores) ? [...product.colores] : []);
      setImagePreview(product.imagen_url || '');
      setImageUrlInput(product.imagen_url || '');
    } else {
      // Valores por defecto para nueva prenda
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setCantidadDisponible(5);
      setDisponible(true);
      setTallas(['S', 'M', 'L']);
      setColores(['Negro']);
      setImageFile(null);
      setImagePreview('');
      setImageUrlInput('');
    }
  }, [product]);

  // Manejador de selección de archivo de imagen
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast({
          type: 'error',
          title: 'Archivo no válido',
          message: 'Por favor selecciona un archivo de imagen (JPG, PNG, WebP).'
        });
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Toggle de Tallas
  const toggleSize = (size) => {
    if (tallas.includes(size)) {
      setTallas(tallas.filter((s) => s !== size));
    } else {
      setTallas([...tallas, size]);
    }
  };

  const handleAddCustomSize = (e) => {
    e.preventDefault();
    if (customSizeInput.trim() && !tallas.includes(customSizeInput.trim().toUpperCase())) {
      setTallas([...tallas, customSizeInput.trim().toUpperCase()]);
      setCustomSizeInput('');
    }
  };

  const removeSize = (sizeToRemove) => {
    setTallas(tallas.filter((s) => s !== sizeToRemove));
  };

  // Toggle de Colores
  const toggleColor = (color) => {
    if (colores.includes(color)) {
      setColores(colores.filter((c) => c !== color));
    } else {
      setColores([...colores, color]);
    }
  };

  const handleAddCustomColor = (e) => {
    e.preventDefault();
    if (customColorInput.trim() && !colores.includes(customColorInput.trim())) {
      setColores([...colores, customColorInput.trim()]);
      setCustomColorInput('');
    }
  };

  const removeColor = (colorToRemove) => {
    setColores(colores.filter((c) => c !== colorToRemove));
  };

  // Validación y envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!nombre.trim()) newErrors.nombre = 'El nombre de la prenda es obligatorio.';
    if (!precio || isNaN(Number(precio)) || Number(precio) <= 0) {
      newErrors.precio = 'Ingresa un precio válido mayor a 0.';
    }
    if (!imagePreview && !imageFile && !imageUrlInput.trim()) {
      newErrors.imagen = 'Debes subir o asignar una fotografía a la prenda.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Por favor completa todos los campos obligatorios del formulario.'
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: parseFloat(precio),
        cantidad_disponible: parseInt(cantidadDisponible, 10) || 0,
        disponible,
        tallas,
        colores,
        imagen_url: isUrlMode ? imageUrlInput.trim() : (imagePreview.startsWith('http') ? imagePreview : '')
      };

      let result;
      if (isEditing) {
        result = await updateProduct(product.id, payload, isUrlMode ? null : imageFile);
        addToast({
          type: 'success',
          title: 'Prenda actualizada',
          message: `Se han guardado los cambios para "${nombre}".`
        });
      } else {
        result = await createProduct(payload, isUrlMode ? null : imageFile);
        addToast({
          type: 'success',
          title: 'Prenda publicada',
          message: `"${nombre}" ha sido agregada exitosamente al catálogo.`
        });
      }

      onSaveSuccess(result);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      addToast({
        type: 'error',
        title: 'Error al guardar',
        message: err.message || 'No se pudo guardar la prenda. Verifica la conexión con Supabase.'
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
        style={{ maxWidth: '680px', maxHeight: '92vh' }}
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
          zIndex: 5
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-noir)' }}>
              {isEditing ? 'Editar Prenda' : 'Nueva Prenda para el Catálogo'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              {isEditing ? 'Modifica los datos o sustituye la fotografía' : 'Ingresa la información para mostrar en la vitrina'}
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
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido / Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Nombre */}
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
              placeholder="Ej: Vestido Midi Seda Champagne"
              className="input-field"
              required
            />
            {errors.nombre && <div style={{ color: 'var(--status-soldout)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.nombre}</div>}
          </div>

          {/* Precio y Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
                Precio (Bs.) *
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
                placeholder="Ej: 180.00"
                className="input-field"
                required
              />
              {errors.precio && <div style={{ color: 'var(--status-soldout)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{errors.precio}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
                Cantidad en Stock
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

          {/* Switch rápido de Disponibilidad */}
          <div style={{
            background: 'var(--color-cream)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-sand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-noir)' }}>
                Disponible para Venta
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                {disponible ? 'Aparece como Disponible con botón de WhatsApp activo' : 'Aparece como "Agotado" en la vitrina'}
              </div>
            </div>

            <label className="switch-label">
              <input
                type="checkbox"
                checked={disponible}
                onChange={(e) => setDisponible(e.target.checked)}
                style={{ display: 'none' }}
              />
              <div className={`switch-track ${disponible ? 'active' : ''}`}>
                <div className="switch-thumb" />
              </div>
            </label>
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
              Descripción / Confección y Cuidados
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalla el tipo de tela, escote, ocasión o recomendaciones de lavado..."
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Selector de Tallas */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
              Tallas Disponibles
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              {COMMON_SIZES.map((size) => {
                const isSelected = tallas.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                      background: isSelected ? 'var(--gold-subtle)' : 'var(--color-white)',
                      color: isSelected ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Tallas personalizadas */}
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

            {/* Tags seleccionados */}
            {tallas.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {tallas.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: 'var(--color-noir)',
                      color: 'var(--color-ivory)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(t)}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Selector de Colores */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '0.4rem' }}>
              Colores Disponibles
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              {COMMON_COLORS.map((col) => {
                const isSelected = colores.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => toggleColor(col)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--gold-primary)' : '1px solid var(--color-sand)',
                      background: isSelected ? 'var(--gold-subtle)' : 'var(--color-white)',
                      color: isSelected ? 'var(--gold-dark)' : 'var(--color-charcoal)',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    {col}
                  </button>
                );
              })}
            </div>

            {/* Color personalizado */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                placeholder="Otro color (ej. Azul Marino)..."
                className="input-field"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomColor(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                <Plus size={15} />
                <span>Agregar</span>
              </button>
            </div>

            {/* Tags seleccionados */}
            {colores.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {colores.map((c) => (
                  <span
                    key={c}
                    style={{
                      background: 'var(--color-cream)',
                      border: '1px solid var(--color-sand)',
                      color: 'var(--color-charcoal)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(c)}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subida de Imagen con Previsualización Inmediata */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                Fotografía de la Prenda *
              </label>
              <button
                type="button"
                onClick={() => setIsUrlMode(!isUrlMode)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold-dark)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isUrlMode ? 'Subir desde dispositivo' : 'O usar URL directa'}
              </button>
            </div>

            {isUrlMode ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field"
                />
              </div>
            ) : (
              <div style={{
                border: '2px dashed var(--color-sand)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--color-cream)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <Upload size={32} color="var(--gold-primary)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-noir)' }}>
                  Haz clic o arrastra una foto aquí
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  Sube directamente desde tu PC o celular (JPG, PNG, WebP)
                </div>
              </div>
            )}

            {errors.imagen && (
              <div style={{ color: 'var(--status-soldout)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                {errors.imagen}
              </div>
            )}

            {/* Previsualización Inmediata */}
            {imagePreview && (
              <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '90px',
                  height: '110px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-sand)',
                  background: '#F0ECE4'
                }}>
                  <img
                    src={imagePreview}
                    alt="Previsualización"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-noir)', marginBottom: '0.2rem' }}>
                    Previsualización lista
                  </div>
                  {imageFile && <div>Archivo: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)</div>}
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                      setImageUrlInput('');
                    }}
                    style={{
                      marginTop: '0.35rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--status-soldout)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Quitar foto</span>
                  </button>
                </div>
              </div>
            )}
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
              disabled={saving}
              className="btn btn-gold"
              style={{ minWidth: '150px' }}
            >
              {saving ? (
                <span>Guardando...</span>
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
