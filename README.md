#  Sistema de Reporte de Incidentes — Universidad de la Amazonia
 
Aplicación web desarrollada como proyecto final de **Programación Web — Ingeniería de Sistemas 2026-I**, que permite a la comunidad universitaria reportar incidentes ocurridos dentro de las instalaciones de la Universidad de la Amazonia (fugas de agua, daños eléctricos, problemas de infraestructura, seguridad, entre otros).
 
🔗 **Repositorio:** [github.com/dialejo24/ProyectoFinalWeb](https://github.com/dialejo24/ProyectoFinalWeb)
🌐 **Live:** [proyecto-final-web-puce.vercel.app](https://proyecto-final-web-puce.vercel.app)
 
 Realizado por: Diego Alejandro Díaz y Jerson Orlando Chaguala
---
 
## ✨ Funcionalidades
 
- **Autenticación** — Registro e inicio de sesión con correo y contraseña
- **Roles** — Usuario (reporta incidentes) y Administrador (gestiona estados)
- **Reporte de incidentes** — Formulario con tipo, descripción, fotografía obligatoria y ubicación (texto + GPS opcional)
- **Listado de incidentes** — Con filtros por estado e indicador visual
- **Vista detallada** — Imagen, datos completos y cambio de estado para el admin
- **Agrupación de incidentes** — El admin puede seleccionar incidentes del mismo tipo y cambiar su estado de forma masiva
- **Estadísticas** — Totales por estado y por tipo con gráficos, filtrables por periodo e imprimibles
- **Panel de administración** — Gestión centralizada de todos los incidentes
---
 
## 🛠️ Stack Tecnológico
 
| Capa | Tecnología |
|---|---|
| Frontend | React.js + Vite |
| Estilos | Tailwind CSS v4 |
| Autenticación | Supabase Auth |
| Base de datos | Supabase PostgreSQL |
| Almacenamiento | Supabase Storage |
| Gráficos | Recharts |
| Despliegue | Vercel |

