# Guía de integración — Catálogo Muebles

## Estructura de archivos entregados

```
backend/
  index.js          → Servidor Express (API REST)
  package.json      → Dependencias Node
  .env.example      → Variables de entorno (copia como .env)

database.sql        → Script MySQL completo (4 tablas, 198 productos)

frontend/
  productos.service.ts   → Servicio Angular actualizado (usa HttpClient)
  producto.model.ts      → Modelo actualizado
  environment.ts         → Dev: apunta a localhost:3000
  environment.prod.ts    → Prod: apunta a tu dominio real
```

---

## 1. Base de datos MySQL

```bash
# Ejecuta el script en tu servidor MySQL
mysql -u root -p < database.sql
```

Esto crea la BD `catalogo_muebles` con las tablas `categorias` y `productos`.

---

## 2. Backend Node.js

```bash
cd backend
cp .env.example .env
# Edita .env con tu usuario/contraseña de MySQL
npm install
npm run dev          # desarrollo (nodemon)
npm start            # producción
```

**Endpoints disponibles:**

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/categorias` | Todas las categorías |
| GET | `/api/productos` | Todos los productos |
| GET | `/api/productos/:id` | Un producto por ID |
| GET | `/api/categorias/:id/productos` | Productos de una categoría |
| GET | `/api/categorias/:id/productos?subcategoria=camas` | Filtro por subcategoría |
| GET | `/api/health` | Health check |

---

## 3. Frontend Angular

### 3.1 Agregar HttpClient al app.config.ts

```typescript
// src/app/app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),   // ← agrega esta línea
  ],
};
```

### 3.2 Reemplaza archivos

- Copia `productos.service.ts` → `src/app/services/productos.service.ts`
- Copia `producto.model.ts` → `src/app/models/producto.model.ts`
- Copia `environment.ts` → `src/environments/environment.ts`
- Copia `environment.prod.ts` → `src/environments/environment.prod.ts`

### 3.3 Ajusta el modelo en tus templates

La BD devuelve `categoria_id` (snake_case). Tienes dos opciones:

**Opción A** — Mapear en el backend (recomendado):
En `index.js`, en cada query de productos agrega un mapeo:
```javascript
const mapped = rows.map(r => ({ ...r, categoriaId: r.categoria_id }));
res.json(mapped);
```

**Opción B** — Usar `categoria_id` directamente en los templates Angular:
```html
<!-- Donde usabas producto.categoriaId, usa: -->
{{ producto.categoria_id }}
```

### 3.4 Cambios en detalles.ts (ninguno necesario)

El componente `Detalles` ya funciona igual, el servicio devuelve el mismo tipo `Producto`. Solo verifica que `getProductoById` ahora retorna `Observable<Producto>` sin el `| undefined` (si el ID no existe el backend devuelve 404).

Puedes ajustar el manejo de error en `detalles.ts`:
```typescript
this.productosService.getProductoById(id).subscribe({
  next: prod => this.producto.set(prod),
  error: () => this.router.navigate(['/home']),
});
```

---

## 4. Notas importantes

- Las imágenes **siguen siendo las mismas URLs de Cloudinary**. No hay que mover nada.
- Si en el futuro quieres agregar/editar productos, lo haces directo en MySQL (ya no en el `.ts`).
- Para producción, cambia `FRONTEND_URL` en `.env` al dominio real de tu Angular.
