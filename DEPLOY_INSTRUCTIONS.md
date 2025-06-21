# Deploy Script para Render.com

Este script automatiza el deployment a Render.com después de verificar que los cambios funcionan localmente.

## Pasos para hacer el deploy:

### 1. Verificar cambios localmente (YA HECHO ✅)
```bash
# Ejecutar servidor mock
node mock-server.js

# En otra terminal, ejecutar test
node test-local.js
```

### 2. Agregar archivos al repositorio
```bash
git add .
git commit -m "Fix: Solucionar error 400 en actualización de usuarios

- Separar validaciones CREATE/UPDATE en backend
- Password opcional en actualización de usuarios  
- Mejora en manejo de campos dinámicos
- Validación mejorada en frontend"
```

### 3. Subir a repositorio remoto
Si ya tienes un repositorio configurado:
```bash
git push origin main
```

Si necesitas configurar un repositorio remoto:
```bash
# Crear repositorio en GitHub/GitLab
# Luego agregar el remote:
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

### 4. Deploy automático en Render
Si tienes auto-deploy configurado, Render detectará automáticamente los cambios y hará el deploy.

Si no tienes auto-deploy:
1. Ve a tu dashboard de Render
2. Selecciona tu servicio de backend
3. Click en "Manual Deploy"
4. Selecciona "Deploy latest commit"

### 5. Verificar deployment
Una vez que el deploy termine, ejecuta:
```bash
node test-usuario-update.js
```

Este script debería mostrar "✅ Actualización exitosa!" en lugar del error 400.

## Archivos modificados en este fix:
- `Backend/src/routes/users.js` - Separación de validaciones CREATE/UPDATE
- `Frontend/src/services/usuariosService.jsx` - Mejora en manejo de estado

## Resultado esperado:
- ✅ Crear usuarios (con password requerido)
- ✅ Actualizar usuarios sin cambiar password
- ✅ Actualizar usuarios cambiando password
- ✅ Validación correcta de datos inválidos
