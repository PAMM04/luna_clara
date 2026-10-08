# Luna Clara — Catálogo Web de Moda con Panel Admin

Plataforma web responsiva (Mobile-First) diseñada para la boutique de moda **Luna Clara**, con catálogo público interactivo, pedidos automáticos vía WhatsApp y Panel de Control Administrativo protegido con CRUD completo y subida de imágenes a Supabase.

---

## 🌟 Características Principales

### 1. Catálogo Público (Cliente)
* **Diseño Haute Boutique:** Estética de lujo con tonos champagne, marfil y pizarra, tipografía elegante (`Playfair Display` + `Plus Jakarta Sans`) y micro-animaciones.
* **Vitrina Responsiva:** Grilla adaptable para móviles (1 col), tablets (2 col) y pantallas de escritorio (3-4 col).
* **Filtros en Tiempo Real:** Búsqueda por nombre o descripción, filtrado por tallas, disponibilidad (todos, en stock, agotados) y ordenamiento por precio o fecha.
* **Ficha Detallada & Modal:** Selector interactivo de tallas (`XS`, `S`, `M`, `L`, etc.) y colores disponibles con actualización instantánea.
* **Integración WhatsApp Directa:** Botón con formato de mensaje codificado según requerimientos:
  ```
  https://wa.me/<NUMERO>?text=Hola!%20Deseo%20comprar%20la%20siguiente%20prenda:%0A*Producto:*%20{nombre}%0A*Precio:*%20${precio}%0A*Tallas:*%20{talla_seleccionada}%0A*Color:*%20{color_seleccionado}
  ```

### 2. Panel de Administración (`/admin` o `#/admin`)
* **Acceso Seguro:** Autenticación por correo y contraseña (`supabase.auth.signInWithPassword()`) y guardián de sesión.
* **Métricas de Inventario:** Tarjetas en tiempo real con Total de Prendas, Prendas en Vitrina, Agotadas y Unidades Totales en Stock.
* **CRUD Completo:**
  * **Crear Prenda:** Nombre, precio, stock, selector visual de tallas y colores, switch de disponibilidad, y subida de imagen con drag-and-drop o selección desde PC/celular.
  * **Editar Prenda:** Modificación de datos y sustitución de fotografía.
  * **Eliminar Prenda:** Modal de confirmación con borrado en base de datos y Storage.
  * **Interruptor Rápido:** Alterna disponibilidad ("Disponible" / "Agotado") con un solo clic directamente desde la tabla.
* **Modo Demostración Interactivo:** Si aún no has conectado las claves de Supabase, la app funciona en modo demo local (`admin@lunaclara.com` / `admin123`) para pruebas inmediatas.

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
* Node.js v18+ y npm instalados.

### Instalación y Ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción (GitHub Pages)
npm run build
```

El servidor local se iniciará en `http://localhost:5173`.

---

## 🗄️ Configuración con Supabase (Paso a Paso)

1. Ingresa a tu panel en [Supabase](https://supabase.com/dashboard).
2. Abre la sección **SQL Editor** y ejecuta el contenido completo del archivo [`supabase_setup.sql`](./supabase_setup.sql). Este script:
   - Crea la tabla `productos` con los tipos y campos especificados.
   - Habilita RLS con lectura pública para clientes y escritura exclusiva para administradores autenticados.
   - Crea el bucket público `imagenes-productos` con políticas de almacenamiento.
   - Inserta prendas de demostración iniciales.
3. En **Authentication -> Users**, crea el usuario de tu administrador (correo y contraseña).
4. Copia tus credenciales en el archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<tu-clave-anon>
   VITE_WHATSAPP_PHONE=59170000000
   VITE_STORE_NAME="Luna Clara"
   ```

---

## 🌐 Despliegue en GitHub Pages

1. El archivo `vite.config.js` ya cuenta con `base: './'` para compatibilidad estática.
2. Ejecuta `npm run build` para generar la carpeta optimizada `dist/`.
3. Sube tu repositorio a GitHub y configura GitHub Pages apuntando a la rama `main` o `gh-pages` con la carpeta de distribución.
