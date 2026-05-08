# PropertysApp — CRM Inmobiliario Premium

CRM inmobiliario móvil de alto rendimiento diseñado para agentes en Panamá.

## 🚀 Desarrollo Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno:
   Crea un archivo `.env.local` con:
   ```env
   VITE_SUPABASE_URL=tu_url
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

3. Inicia el servidor:
   ```bash
   npm run dev
   ```

## 📱 Visualización en Móvil (Misma Red)

Para probar la app en tu celular mientras desarrollas:
1. Asegúrate de que el servidor esté corriendo con la opción `--host` (ya configurado por defecto en `vite.config.ts`).
2. Busca tu IP local (ej: `192.168.0.2`).
3. Abre en tu celular: `http://<tu-ip>:5173`.

## 🌐 Despliegue en Vercel

1. Sube este repositorio a GitHub.
2. En Vercel, importa el proyecto.
3. Configura las **Environment Variables** en Vercel con los mismos valores de `.env.local`.
4. El despliegue será automático en cada commit a `main`.

---
Desarrollado con React + TypeScript + Vite + Tailwind CSS + Supabase.
