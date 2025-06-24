# 📋 Sistema de Vacunación - Datos desde JSON

## 🎯 Resumen
El sistema ahora obtiene **TODOS** los datos desde el archivo `src/json_prueba.json`. No necesita una base de datos externa ni API backend para funcionar.

## 📁 Estructura de Datos Disponibles

### 🏥 Centros de Vacunación
- **2 centros registrados**
- Incluye ubicación, director, contacto
- Datos completos con coordenadas GPS

### 💉 Vacunas
- **2 tipos de vacunas** (Influenza, Sarampión)
- Información de fabricante y dosis requeridas
- Tipos: Inactivada, Viva atenuada

### 👶 Pacientes (Niños)
- **2 pacientes registrados**
- Datos completos: nombre, identificación, edad, género
- Asignados a centros de salud específicos

### 👨‍👩‍👧‍👦 Tutores
- **2 tutores registrados**
- Relacionados con los pacientes
- Información de contacto completa

### 🦠 Lotes de Vacunas
- **2 lotes disponibles**
- Control de inventario (cantidad total/disponible)
- Fechas de vencimiento y temperatura

### 👥 Usuarios del Sistema
- **4 usuarios de prueba** con diferentes roles:
  - `admin` - Administrador
  - `padre` - Padre/Tutor  
  - `director` - Director
  - `doctor` - Doctor

### 📅 Citas
- **2 citas programadas**
- Estados: Pendiente, Confirmada, Completada
- Asociadas a campañas de vacunación

### 📊 Historial de Vacunación
- **2 registros de vacunas aplicadas**
- Información detallada de cada aplicación
- Observaciones y personal responsable

### 🏢 Campañas de Vacunación
- **2 campañas activas** (Influenza 2025, Sarampión 2025)
- Fechas de inicio y fin
- Objetivos específicos

### 📦 Inventario de Suministros
- **2 tipos de suministros** (Jeringas, Algodón estéril)
- Control de stock y vencimientos
- Proveedores y condiciones de almacenamiento

## 🔧 Servicios Disponibles

### 1. 📡 jsonDataService
```javascript
import jsonDataService from './services/jsonDataService';

// Obtener todos los centros
const centros = jsonDataService.getCentros();

// Buscar pacientes
const pacientes = jsonDataService.buscarNinos('Juan');

// Autenticar usuario
const usuario = jsonDataService.authenticate('admin', 'admin123');
```

### 2. 🏥 centrosService
```javascript
import { centrosService } from './services/centrosService';

// Obtener centros con datos enriquecidos
const centros = await centrosService.getCentros();

// Obtener centro específico
const centro = await centrosService.getCentroById(id);
```

### 3. 👶 pacientesService
```javascript
import { getPacientesCentro, getCitasVacunas } from './services/pacientesService';

// Obtener pacientes de un centro
const pacientes = await getPacientesCentro(centroId);

// Obtener citas de un niño
const citas = await getCitasVacunas(ninoId);
```

### 4. 💉 vacunasService
```javascript
import { vacunasService } from './services/vacunasService';

// Obtener historial de vacunación
const historial = await vacunasService.getHistorialVacunas(ninoId);

// Obtener vacunas faltantes
const faltantes = await vacunasService.getVacunasFaltantes(ninoId);
```

### 5. 👥 usuariosService
```javascript
import usuariosService from './services/usuariosService';

// Validar login
const usuario = await usuariosService.validateLogin('admin', 'admin123');

// Obtener usuarios por centro
const usuarios = await usuariosService.getUsuariosPorCentro(centroId);
```

### 6. 📊 dashboardService
```javascript
import dashboardService from './services/dashboardService';

// Estadísticas generales
const estadisticas = await dashboardService.getEstadisticasGenerales();

// Actividad reciente
const actividad = await dashboardService.getActividadReciente();
```

### 7. 🏢 campanasService
```javascript
import campanasService from './services/campanasService';

// Obtener campañas
const campanas = await campanasService.getCampanas();

// Campañas por centro
const campanasDelCentro = await campanasService.getCampanasPorCentro(centroId);
```

### 8. 📦 inventarioService
```javascript
import inventarioService from './services/inventarioService';

// Inventario de suministros
const suministros = await inventarioService.getInventarioSuministros();

// Alertas de inventario
const alertas = await inventarioService.getAlertasInventario();
```

### 9. 📈 reportesService
```javascript
import reportesService from './services/reportesService';

// Reporte de vacunación
const reporte = await reportesService.getReporteVacunacion(filtros);

// Exportar reporte
const exportado = await reportesService.exportarReporte('vacunacion', 'json');
```

## 🎣 Hooks Personalizados

### useAllJsonData
```javascript
import { useAllJsonData } from './hooks/useJsonData';

function MiComponente() {
  const { 
    centros, 
    vacunas, 
    ninos, 
    usuarios, 
    loading, 
    estadisticas 
  } = useAllJsonData();
  
  if (loading) return <div>Cargando...</div>;
  
  return <div>{/* Mostrar datos */}</div>;
}
```

### useCentros
```javascript
import { useCentros } from './hooks/useJsonData';

function ListaCentros() {
  const { centros, loading, error, refresh } = useCentros();
  
  // Los centros incluyen datos de pacientes, usuarios y lotes
}
```

### useBusqueda
```javascript
import { useBusqueda } from './hooks/useJsonData';

function BuscadorPacientes() {
  const { resultados, loading, buscar, limpiar } = useBusqueda('pacientes');
  
  const handleBuscar = (termino) => {
    buscar(termino);
  };
}
```

## 👤 Usuarios de Prueba

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin` | `admin123` | Administrador | Acceso total al sistema |
| `padre` | `padre123` | Padre/Tutor | Gestión de hijos y citas |
| `director` | `director123` | Director | Administración de centro |
| `doctor` | `doctor123` | Doctor | Atención médica y vacunación |

## 🔍 Características Implementadas

### ✅ Autenticación
- Login con usuarios del JSON
- Manejo de sesiones
- Roles y permisos

### ✅ Gestión de Centros
- Lista completa con datos enriquecidos
- Filtrado y búsqueda
- Estadísticas por centro

### ✅ Gestión de Pacientes
- Pacientes por centro
- Historial de vacunación
- Citas programadas
- Búsqueda avanzada

### ✅ Gestión de Vacunas
- Inventario de lotes
- Control de vencimientos
- Aplicación de vacunas
- Seguimiento de dosis

### ✅ Dashboard Interactivo
- Estadísticas en tiempo real
- Actividad reciente
- Alertas y notificaciones
- Gráficos y métricas

### ✅ Campañas de Vacunación
- Gestión completa de campañas
- Asignación a centros
- Seguimiento de progreso
- Estadísticas de efectividad

### ✅ Inventario y Suministros
- Control de stock
- Alertas de vencimiento
- Gestión de proveedores
- Trazabilidad completa

### ✅ Reportes y Exportación
- Reportes detallados
- Filtros avanzados
- Exportación múltiple
- Análisis estadístico

## 🚀 Cómo Usar

1. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

2. **Hacer login:**
   - Usar cualquiera de los usuarios de prueba
   - Los datos se cargan automáticamente del JSON

3. **Explorar funcionalidades:**
   - Navegar por los diferentes módulos
   - Todos los datos provienen del JSON
   - Las modificaciones se simulan (no persisten)

4. **Ver demo de datos:**
   - Acceder al componente `JsonDataDemo`
   - Ver todos los datos cargados del JSON

## 🔧 Personalización

Para agregar más datos al sistema:

1. **Editar el archivo JSON:**
   ```bash
   src/json_prueba.json
   ```

2. **Seguir la estructura existente:**
   - Cada entidad tiene secciones GET, POST, PUT, DELETE
   - Mantener los IDs únicos en formato UUID
   - Respetar las relaciones entre entidades

3. **Los servicios se actualizarán automáticamente**

## 📝 Notas Importantes

- **Persistencia:** Los cambios no se guardan permanentemente
- **Relaciones:** Todas las relaciones entre entidades están implementadas
- **Rendimiento:** Los datos se cargan en memoria para máximo rendimiento
- **Escalabilidad:** Fácil migración a base de datos real cuando sea necesario

---

🎉 **¡El sistema está completamente funcional usando solo datos del JSON!**