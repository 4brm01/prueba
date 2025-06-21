# Backend - Sistema de Vacunación

Este es el backend del sistema de vacunación que incluye el fix para el error 400 en la actualización de usuarios.

## Fix Aplicado

- **Problema**: Error 400 al actualizar usuarios sin enviar contraseña
- **Solución**: Separación de validaciones CREATE/UPDATE
- **Estado**: ✅ Solucionado

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

## Variables de Entorno Requeridas

- `DB_SERVER`: Servidor de base de datos
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `NODE_ENV`: `production`

## Archivos Modificados

- `src/routes/users.js`: Validaciones separadas CREATE/UPDATE para solucionar error 400
