# Documento de Requerimientos: Catálogo Web de Ropa con Panel Admin (Supabase + GitHub Pages)

## 1. Visión General del Proyecto
Desarrollar una aplicación web responsiva (Mobile-First) para un catálogo de venta de ropa. La solución constará de dos interfaces principales:
1. **Catálogo Público:** Vista de vitrina para clientes con navegación por prendas, detalles completos y botón de compra directa redireccionando a WhatsApp con mensaje preconfigurado.
2. **Panel de Administración (`/admin`):** Interfaz protegida para un único usuario administrador que permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre los productos y subir imágenes directamente desde PC o celular.

---

## 2. Arquitectura y Stack Tecnológico

* **Frontend:** SPA (Single Page Application) construida en HTML5/CSS3/JavaScript moderno o React/Vite.
* **Diseño y Estilos:** Tailwind CSS (o CSS utilitario equivalente) con enfoque Mobile-First, altamente adaptable a smartphones, tablets y pantallas de escritorio.
* **Hosting Frontend:** GitHub Pages (distribución estática).
* **Backend as a Service (BaaS):** Supabase (PostgreSQL, Storage y Authentication).
  * **Auth:** Autenticación por correo y contraseña restringida exclusivamente al administrador.
  * **Database:** Tabla relacional `productos`.
  * **Storage:** Bucket público `imagenes-productos` para almacenamiento multimedia.

---

## 3. Modelo de Datos (Supabase PostgreSQL)

### Tabla: `productos`

| Campo | Tipo SQL | Restricciones / Default | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `DEFAULT gen_random_uuid() PRIMARY KEY` | Identificador único del producto |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Fecha de creación del registro |
| `nombre` | `TEXT` | `NOT NULL` | Nombre o título de la prenda |
| `descripcion` | `TEXT` | `NULL` | Detalle, material, cuidados o corte |
| `precio` | `NUMERIC(10,2)` | `NOT NULL` | Precio de venta |
| `tallas` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Array de tallas (ej. `["S", "M", "L", "XL"]`) |
| `colores` | `TEXT[]` | `NOT NULL DEFAULT '{}'` | Array de colores disponibles (ej. `["Negro", "Beige"]`) |
| `cantidad_disponible` | `INT` | `NOT NULL DEFAULT 0` | Stock numérico disponible |
| `disponible` | `BOOLEAN` | `NOT NULL DEFAULT true` | Interruptor rápido de disponibilidad |
| `imagen_url` | `TEXT` | `NOT NULL` | Enlace público de la imagen alojada en Storage |

### Políticas de Seguridad (Row Level Security - RLS)

1. **Lectura pública (Anon):**
   ```sql
   ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Lectura pública de productos"
   ON productos FOR SELECT
   USING (true);
   ```

2. **Escritura restringida (Solo Administrador Autenticado):**
   ```sql
   CREATE POLICY "Modificación solo para administrador autenticado"
   ON productos FOR ALL
   TO authenticated
   USING (true)
   WITH CHECK (true);
   ```

---

## 4. Requerimientos Funcionales

### 4.1 Catálogo Público (Cliente)
* **Grilla Responsiva:** Tarjetas de producto adaptables (1 columna en móvil, 2-3 en tablet, 3-4 en desktop).
* **Ficha de Producto:**
  * Foto de alta calidad optimizada.
  * Título, precio formateado y descripción.
  * Badges interactivos o visuales con tallas y colores disponibles.
  * Indicador de disponibilidad:
    * Si `disponible == false` o `cantidad_disponible <= 0`, mostrar insignia "Agotado" y deshabilitar o adaptar el botón de pedido.
* **Integración WhatsApp:**
  * Cada tarjeta/modal debe incluir un botón prominente: **"Pedir por WhatsApp"**.
  * Formato de URL dinámica:
    ```
    https://wa.me/<NUMERO_TELEFONO>?text=Hola!%20Deseo%20comprar%20la%20siguiente%20prenda:%0A*Producto:*%20{nombre}%0A*Precio:*%20${precio}%0A*Tallas:*%20{tallas_seleccionadas}
    ```
  * Codificación obligatoria con `encodeURIComponent` para caracteres especiales.

---

### 4.2 Panel de Control / Admin (`/admin`)
* **Acceso y Seguridad:**
  * Formulario de Login (Email y Contraseña) conectado a `supabase.auth.signInWithPassword()`.
  * Redirección automática si no hay sesión activa.
  * Botón de cierre de sesión (`Sign Out`).
* **Gestión de Prendas (CRUD):**
  * **Crear Prenda:** Formulario modal o vista dedicada con los siguientes campos:
    * Nombre / Título.
    * Precio (numérico con decimales).
    * Cantidad en Stock.
    * Selector/Tags de Tallas (ej. inputs múltiples o checkboxes).
    * Selector/Tags de Colores.
    * Switch o Checkbox de "Disponible".
    * Selector de archivo de imagen con previsualización inmediata.
  * **Subida de Archivos:**
    * Subir la foto al bucket `imagenes-productos` de Supabase Storage.
    * Obtener la URL pública e insertarla en la columna `imagen_url`.
  * **Editar Prenda:** Cargar datos existentes en el formulario para actualizar cualquiera de los campos o sustituir la fotografía.
  * **Eliminar Prenda:** Confirmación de seguridad previa y borrado del registro en la base de datos (y opcionalmente del archivo en Storage).

---

## 5. Parámetros de Configuración y Entorno

El proyecto debe consumir credenciales seguras mediante variables de entorno o archivo de configuración `config.js` / `.env`:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-clave-anon-publica>
VITE_WHATSAPP_PHONE=591XXXXXXXXX # Código de país + número, sin signos ni espacios
```

---

## 6. Criterios de Aceptación y UX/UI
* **Mobile-First:** La experiencia táctil en smartphones debe ser fluida (botones con área de tap suficiente, tipografía legible y navegación simplificada).
* **Carga Rápida:** Las imágenes deben cargarse con compresión adecuada y `loading="lazy"`.
* **Manejo de Errores:** Notificaciones claras (Toast/Alerts) en el panel admin si la subida falla, si faltan campos obligatorios o si las credenciales son incorrectas.