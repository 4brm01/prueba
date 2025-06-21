# Instrucciones para Deploy del Backend

## Paso 1: Crear nuevo repositorio en GitHub

1. Ve a [GitHub.com](https://github.com)
2. Click "New repository"
3. Nombre: `sistema-vacunacion-backend`
4. Descripción: "Backend del Sistema de Vacunación con fix error 400"
5. Marca como "Private" (recomendado)
6. NO marcar "Add README" (ya tenemos)
7. Click "Create repository"

## Paso 2: Subir código a GitHub

Después de crear el repositorio, ejecuta estos comandos:

```bash
cd /Users/abraham/Desktop/sistema-vacunacion-backend
git remote add origin https://github.com/TU_USUARIO/sistema-vacunacion-backend.git
git branch -M main
git push -u origin main
```

**¡IMPORTANTE!** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

## Paso 3: Configurar Render

1. Ve a [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Selecciona "Build and deploy from a Git repository"
4. Conecta GitHub si no lo has hecho
5. Selecciona el repositorio: `sistema-vacunacion-backend`

### Configuración de Render:
- **Name**: `sistema-vacunacion-backend`
- **Region**: Closest to your users
- **Branch**: `main`
- **Root Directory**: (dejar VACÍO)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Variables de Entorno en Render:
- `DB_SERVER`: tu servidor de BD
- `DB_NAME`: nombre de la BD
- `DB_USER`: usuario de la BD
- `DB_PASSWORD`: contraseña de la BD
- `NODE_ENV`: `production`

## Paso 4: Deploy

1. Click "Create Web Service"
2. Render automáticamente hará el deploy
3. Espera a que termine (puede tomar 5-10 minutos)

## Paso 5: Verificar

Una vez que termine el deploy, ejecuta:

```bash
cd /Users/abraham/Desktop/RetoWeb
node verify-production.js
```

## ✅ Resultado Esperado

- El error 400 desaparecerá
- Las actualizaciones de usuarios funcionarán sin enviar contraseña
- El frontend podrá actualizar usuarios correctamente

## 🚨 Si hay problemas

- Revisa los logs en Render dashboard
- Verifica que las variables de entorno estén configuradas
- Asegúrate de que el deploy haya terminado completamente
