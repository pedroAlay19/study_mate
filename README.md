# 📚 StudyMate - Organizador Académico Inteligente

<div align="center">

![StudyMate Banner](https://img.shields.io/badge/StudyMate-Academic%20Planner-blue?style=for-the-badge)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**Una aplicación web moderna y completa para la gestión académica, con técnica Pomodoro integrada, calendario inteligente y sistema de alertas automáticas.**

[🚀 Demo en Vivo](#) | [📖 Documentación](#características) | [🐛 Reportar Bug](../../issues) | [💡 Solicitar Feature](../../issues)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tech Stack](#-tech-stack)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎯 Gestión Académica Completa

- **📚 Gestión de Materias**: Crea, edita y organiza tus asignaturas con colores personalizados y descripción detallada
- **✅ Tareas Avanzadas**: Sistema completo de tareas con:
  - Estados: Pendiente, En Progreso, Completada, Cancelada
  - Prioridades: Alta, Media, Baja
  - Notas adicionales y descripciones
  - Fechas de inicio y entrega
  - Asociación con materias
- **📎 Adjuntos**: Sube archivos (PDF, Word, imágenes, ZIP) a tus tareas usando Supabase Storage
- **📅 Calendario Visual**: Visualiza todas tus tareas y entregas en un calendario interactivo

### ⏰ Productividad

- **🍅 Técnica Pomodoro**: 
  - Temporizador integrado con sesiones personalizables
  - Tracking de sesiones por tarea
  - Estadísticas de productividad
  - Pausas automáticas configurables
- **🔔 Sistema de Alertas**: 
  - Alertas automáticas para fechas de entrega próximas
  - Notificaciones en tiempo real
  - Generación programada de recordatorios

### 👥 Sistema de Usuarios

- **🔐 Autenticación JWT**: Sistema seguro de registro y login
- **👤 Roles de Usuario**: 
  - **Estudiante**: Acceso a todas las funcionalidades académicas
  - **Administrador**: Panel de gestión de usuarios
- **👨‍💼 Panel Administrativo**: CRUD completo de usuarios y permisos

### 🎨 Experiencia de Usuario

- **🌗 Modo Oscuro/Claro**: Tema configurable
- **📱 Progressive Web App (PWA)**: Instalable como app nativa
- **🎯 UI Moderna**: Interfaz limpia usando Radix UI y TailwindCSS
- **⚡ Performance Optimizada**: Lazy loading, code splitting, y caching inteligente

---

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React 19 + Vite + TailwindCSS + React Query                │
│                  (Progressive Web App)                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                         Backend                              │
│     NestJS 11 + TypeORM + PostgreSQL + JWT Auth            │
│                                                              │
│  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐       │
│  │  Users   │ │ Subjects│ │  Tasks  │ │ Pomodoro │       │
│  └──────────┘ └─────────┘ └─────────┘ └──────────┘       │
│  ┌──────────┐ ┌─────────┐ ┌─────────┐                     │
│  │ Alerts   │ │  Auth   │ │Attachmnt│                     │
│  └──────────┘ └─────────┘ └─────────┘                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐         ┌────────▼────────┐
│  PostgreSQL  │         │ Supabase Storage│
│   Database   │         │  (File Uploads) │
└──────────────┘         └─────────────────┘
```

**Patrones de Diseño Implementados:**
- Repository Pattern (TypeORM)
- Dependency Injection (NestJS)
- JWT Strategy para autenticación
- Guards y Decorators personalizados
- DTOs con validación automática (class-validator)
- Factory Pattern para entidades de prueba

---

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS 11.0
- **Lenguaje**: TypeScript 5.7
- **ORM**: TypeORM 0.3
- **Base de Datos**: PostgreSQL 16
- **Autenticación**: JWT (jsonwebtoken)
- **Validación**: class-validator + class-transformer
- **Testing**: Jest + Supertest (E2E)
- **Documentación**: TSDoc
- **Linting**: ESLint 9 + Prettier
- **Tareas Programadas**: @nestjs/schedule
- **Storage**: Supabase Client

### Frontend
- **Framework**: React 19.2
- **Build Tool**: Vite 7.2
- **Lenguaje**: TypeScript 5.9
- **Routing**: React Router DOM 7.9
- **State Management**: React Query (TanStack) 5.90
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: TailwindCSS 3.4 + tailwind-animate
- **Forms**: React Hook Form 7.66
- **HTTP Client**: Axios 1.13
- **Icons**: Lucide React 0.553
- **Date Handling**: date-fns 4.1
- **Notifications**: Sonner 2.0
- **PWA**: vite-plugin-pwa 1.1
- **Themes**: next-themes 0.4

### DevOps & Tools
- **Containerización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (preparado para Azure)
- **Web Server**: Nginx (producción)
- **Environment**: dotenv
- **Version Control**: Git

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 20.x ([Descargar](https://nodejs.org/))
- **npm** >= 10.x (incluido con Node.js)
- **PostgreSQL** >= 16.x ([Descargar](https://www.postgresql.org/download/))
- **Docker** >= 24.x (Opcional, [Descargar](https://www.docker.com/))
- **Git** ([Descargar](https://git-scm.com/))

### Servicios Externos

- **Supabase Account**: Para almacenamiento de archivos ([Crear cuenta](https://supabase.com/))
  - Necesitarás: `SUPABASE_URL` y `SUPABASE_KEY`
  - Configurar un bucket para archivos adjuntos

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/StudyMate.git
cd StudyMate
```

### 2️⃣ Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 3️⃣ Instalar Dependencias del Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuración

### Backend Configuration

1. **Crear archivo de variables de entorno**:

```bash
cd backend
cp .env.example .env
```

2. **Configurar variables en `.env`**:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studymate

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiame_en_produccion

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_publica_supabase

# Server
PORT=8080
NODE_ENV=development

# CORS (opcional, para producción)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

1. **Crear archivo de variables de entorno**:

```bash
cd frontend
cp .env.example .env
```

2. **Configurar variables en `.env`**:

```env
# Backend API
VITE_API_URL=http://localhost:8080

# Supabase (mismo que backend)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_supabase
```

### PostgreSQL Database Setup

#### Opción A: PostgreSQL Local

```bash
# Crear base de datos
createdb studymate

# O usando psql
psql -U postgres
CREATE DATABASE studymate;
```

#### Opción B: Docker (Recomendado para desarrollo)

```bash
cd backend
docker-compose up -d
```

Esto levantará PostgreSQL en el puerto `5434` con las credenciales:
- Usuario: `postgres`
- Contraseña: `postgres`
- Base de datos: `test`

### Supabase Storage Setup

1. Ir a [Supabase Dashboard](https://app.supabase.com/)
2. Crear un nuevo proyecto o usar uno existente
3. Ir a **Storage** → **Create Bucket**
4. Nombre del bucket: `attachments` (público o privado según tus necesidades)
5. Configurar políticas de seguridad (RLS) si es necesario
6. Copiar las credenciales del proyecto:
   - URL del proyecto
   - Anon/Public key

---

## 🏃 Ejecución

### Modo Desarrollo

#### 1. Iniciar Backend

```bash
cd backend
npm run start:dev
```

El servidor estará disponible en: `http://localhost:8080`

#### 2. Iniciar Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Credenciales de Administrador por Defecto

En el primer inicio, se crea automáticamente un usuario administrador:

- **Email**: `admin@studymate.com`
- **Password**: `Admin123!`

⚠️ **IMPORTANTE**: Cambia estas credenciales después del primer login.

### Modo Producción (Local)

#### Backend

```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Usando Docker Compose

#### Desarrollo

```bash
# Desde la raíz del proyecto
docker-compose -f backend/docker-compose.yml up
```

#### Producción

```bash
# Configurar variables de entorno primero
export AZURE_REGISTRY_NAME=tu_registry
export DATABASE_URL=postgresql://...
export JWT_SECRET=...
export SUPABASE_URL=...
export SUPABASE_KEY=...

# Levantar servicios
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🚢 Deployment

### Azure Container Instances (Configurado)

El proyecto está configurado para deployment en Azure con:

- Azure Container Registry
- Azure App Service
- PostgreSQL Azure Database

**Variables de entorno necesarias en Azure:**
- `DATABASE_URL`
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `ALLOWED_ORIGINS`
- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build de Imágenes Docker

```bash
# Backend
cd backend
docker build -t studymate-backend:latest .

# Frontend
cd frontend
docker build \
  --build-arg VITE_API_URL=https://tu-api.com \
  --build-arg VITE_SUPABASE_URL=https://tu-proyecto.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=tu_key \
  -t studymate-frontend:latest .
```

### Migraciones de Base de Datos

Las migraciones están en `backend/migrations/`:

```bash
# Ejecutar migraciones manualmente
psql -d studymate -f backend/migrations/add-subjectId-to-tasks.sql
```

**Nota**: TypeORM está configurado con `synchronize: false` para producción. En desarrollo, las tablas se crean automáticamente.

---

## 📚 API Documentation

### Base URL

```
http://localhost:8080
```

### Endpoints Principales

#### 🔐 Authentication (`/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/profile` | Obtener perfil del usuario | Sí |

#### 👥 Users (`/users`)

| Método | Endpoint | Descripción | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/users` | Listar todos los usuarios | Sí | Admin |
| GET | `/users/:id` | Obtener usuario por ID | Sí | Admin |
| PATCH | `/users/:id` | Actualizar usuario | Sí | Admin |
| DELETE | `/users/:id` | Eliminar usuario | Sí | Admin |

#### 📚 Subjects (`/subjects`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/subjects` | Listar materias del usuario | Sí |
| POST | `/subjects` | Crear nueva materia | Sí |
| GET | `/subjects/:id` | Obtener materia por ID | Sí |
| PATCH | `/subjects/:id` | Actualizar materia | Sí |
| DELETE | `/subjects/:id` | Eliminar materia | Sí |

#### ✅ Tasks (`/tasks`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/tasks` | Listar tareas del usuario | Sí |
| POST | `/tasks` | Crear nueva tarea | Sí |
| GET | `/tasks/:id` | Obtener tarea por ID | Sí |
| GET | `/tasks/subject/:subjectId` | Listar tareas por materia | Sí |
| PATCH | `/tasks/:id` | Actualizar tarea | Sí |
| DELETE | `/tasks/:id` | Eliminar tarea | Sí |

#### 🍅 Pomodoro (`/pomodoro`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/pomodoro` | Listar sesiones del usuario | Sí |
| POST | `/pomodoro` | Crear sesión Pomodoro | Sí |
| GET | `/pomodoro/:id` | Obtener sesión por ID | Sí |
| GET | `/pomodoro/task/:taskId` | Sesiones por tarea | Sí |
| GET | `/pomodoro/stats/:taskId` | Estadísticas por tarea | Sí |
| PATCH | `/pomodoro/:id` | Actualizar sesión | Sí |
| DELETE | `/pomodoro/:id` | Eliminar sesión | Sí |

#### 🔔 Alerts (`/alerts`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/alerts` | Listar alertas del usuario | Sí |
| POST | `/alerts/generate` | Generar alertas automáticas | Sí |

#### 📎 Attachments (`/attachments`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/attachments/upload/supabase/:taskId` | Subir archivo a tarea | Sí |
| GET | `/attachments/task/:taskId` | Listar adjuntos de tarea | Sí |
| DELETE | `/attachments/:id` | Eliminar adjunto | Sí |

### Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```http
Authorization: Bearer tu_token_jwt_aqui
```

### Ejemplo de Request

```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studymate.com",
    "password": "Admin123!"
  }'

# Crear Tarea
curl -X POST http://localhost:8080/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token" \
  -d '{
    "subjectId": "uuid-de-materia",
    "title": "Entregar proyecto final",
    "description": "Proyecto de backend con NestJS",
    "start_date": "2026-02-20",
    "delivery_date": "2026-03-15",
    "priority": "high",
    "state": "pending"
  }'
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

**Tests E2E disponibles:**
- `auth.e2e-spec.ts` - Autenticación
- `users.e2e-spec.ts` - Gestión de usuarios
- `subjects.e2e-spec.ts` - Materias
- `tasks.e2e-spec.ts` - Tareas
- `pomodoro.e2e-spec.ts` - Sesiones Pomodoro
- `alerts.e2e-spec.ts` - Sistema de alertas

### Frontend Tests

```bash
cd frontend

# Linting
npm run lint
```

**Nota**: Los tests unitarios del frontend están pendientes de implementación.

---

## 📁 Estructura del Proyecto

```
StudyMate/
├── backend/                          # Backend NestJS
│   ├── src/
│   │   ├── main.ts                  # Punto de entrada
│   │   ├── app.module.ts            # Módulo principal
│   │   ├── auth/                    # Módulo de autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── guard/               # Guards (AuthGuard)
│   │   │   ├── decorators/          # @ActiveUser, @Auth
│   │   │   ├── dto/                 # DTOs de login
│   │   │   └── interfaces/          # Interfaces JWT
│   │   ├── users/                   # Módulo de usuarios
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── seed.service.ts      # Seeder admin
│   │   │   ├── entities/            # User entity
│   │   │   └── dto/                 # DTOs
│   │   ├── subjects/                # Módulo de materias
│   │   │   ├── subjects.controller.ts
│   │   │   ├── subjects.service.ts
│   │   │   ├── entities/            # Subject entity
│   │   │   └── dto/
│   │   ├── tasks/                   # Módulo de tareas
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── entities/            # Task entity
│   │   │   └── dto/
│   │   ├── pomodoro/                # Módulo Pomodoro
│   │   │   ├── pomodoro.controller.ts
│   │   │   ├── pomodoro.service.ts
│   │   │   ├── entities/            # PomodoroSession entity
│   │   │   └── dto/
│   │   ├── alerts/                  # Módulo de alertas
│   │   │   ├── alerts.controller.ts
│   │   │   ├── alerts.service.ts
│   │   │   ├── entities/            # Alert entity
│   │   │   ├── factories/           # Alert factories
│   │   │   └── types/
│   │   ├── attachments/             # Módulo de adjuntos
│   │   │   ├── attachments.controller.ts
│   │   │   ├── attachments.service.ts
│   │   │   ├── entities/            # Attachment entity
│   │   │   └── dto/
│   │   └── supabase/                # Módulo Supabase
│   │       ├── supabase.module.ts
│   │       └── supabase.service.ts
│   ├── test/                        # Tests E2E
│   │   ├── e2e/                     # Tests por módulo
│   │   ├── jest-e2e.json
│   │   └── test-helpers.ts
│   ├── migrations/                  # Migraciones SQL
│   ├── Dockerfile                   # Multi-stage build
│   ├── docker-compose.yml           # PostgreSQL local
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── frontend/                        # Frontend React
│   ├── src/
│   │   ├── main.tsx                # Punto de entrada
│   │   ├── App.tsx                 # Componente principal + rutas
│   │   ├── pages/                  # Páginas
│   │   │   ├── Index.tsx           # Landing page
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx       # Dashboard principal
│   │   │   ├── Subjects.tsx        # Gestión de materias
│   │   │   ├── Tasks.tsx           # Gestión de tareas
│   │   │   ├── CalendarPage.tsx    # Calendario
│   │   │   ├── Pomodoro.tsx        # Timer Pomodoro
│   │   │   ├── AdminUsers.tsx      # Panel admin
│   │   │   ├── Stats.tsx           # Estadísticas
│   │   │   └── NotFound.tsx
│   │   ├── components/             # Componentes React
│   │   │   ├── Layout.tsx          # Layout principal
│   │   │   ├── AppSidebar.tsx      # Sidebar
│   │   │   ├── ProtectedRoute.tsx  # HOC autenticación
│   │   │   ├── AdminRoute.tsx      # HOC admin
│   │   │   ├── SubjectForm.tsx
│   │   │   ├── AttachmentsManager.tsx
│   │   │   ├── PomodoroSettings.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   └── ui/                 # Componentes UI (shadcn)
│   │   ├── contexts/               # React Contexts
│   │   │   └── PomodoroContext.tsx
│   │   ├── hooks/                  # Custom hooks
│   │   ├── services/               # API services
│   │   ├── lib/                    # Utilidades
│   │   └── assets/                 # Imágenes, iconos
│   ├── public/                     # Assets estáticos
│   ├── Dockerfile                  # Multi-stage build + Nginx
│   ├── nginx.conf                  # Configuración Nginx
│   ├── vite.config.ts              # Configuración Vite + PWA
│   ├── tailwind.config.cjs         # TailwindCSS config
│   └── package.json
│
├── docker-compose.prod.yml         # Docker compose producción
└── README.md                       # Este archivo
```

---

## 🎨 Capturas de Pantalla

### Dashboard Principal
Visualización general de tareas pendientes, próximas entregas y estadísticas de productividad.

### Gestión de Materias
Organiza tus asignaturas con colores personalizados y añade tareas específicas.

### Timer Pomodoro
Trabaja con sesiones de 25 minutos, rastrea tu productividad y toma descansos programados.

### Calendario de Tareas
Vista mensual de todas tus entregas y tareas planificadas.

### Panel de Administración
Gestiona usuarios, asigna roles y controla el acceso a la plataforma.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

1. **Fork** el proyecto
2. Crea tu **Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la branch (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Convenciones de Código

- **TypeScript** en todo el proyecto
- **ESLint + Prettier** para formateo
- **Commits semánticos**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Tests** para nuevas features
- **Documentación** actualizada

### Reportar Bugs

Si encuentras un bug, por favor abre un [issue](../../issues) con:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es relevante
- Información del entorno (OS, navegador, versión de Node, etc.)

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2026 StudyMate

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 👥 Autores

- **Equipo StudyMate** - *Desarrollo Inicial*

---

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) - Framework backend
- [React](https://reactjs.org/) - Librería UI
- [Radix UI](https://www.radix-ui.com/) - Componentes accesibles
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [Supabase](https://supabase.com/) - Storage y backend services
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- Comunidad open source

---

## 📞 Soporte

Si necesitas ayuda:

- 📧 Email: support@studymate.com
- 💬 [Discord Community](#)
- 📖 [Wiki del Proyecto](../../wiki)
- 🐛 [Issue Tracker](../../issues)

---

## 🗺 Roadmap

### v2.0 (Próximamente)

- [ ] 📊 Dashboard de analytics avanzado
- [ ] 🔔 Notificaciones push (PWA)
- [ ] 📱 App móvil nativa (React Native)
- [ ] 🌍 Internacionalización (i18n) completa
- [ ] 👥 Colaboración en tareas (equipos)
- [ ] 📈 Gráficos de progreso y métricas
- [ ] 🎯 Gamificación (logros, badges)
- [ ] 🔗 Integración con Google Calendar
- [ ] 🤖 Asistente IA para organización
- [ ] 📝 Editor de notas integrado (Markdown)
- [ ] 🎨 Temas personalizados
- [ ] 📦 Exportación de datos (PDF, CSV)

### v2.1

- [ ] 🔄 Sincronización offline-first
- [ ] 🎙 Notas de voz
- [ ] 📸 OCR para escaneo de documentos
- [ ] 🧠 Flashcards para estudio

---

<div align="center">

**⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub ⭐**

Made with ❤️ by StudyMate Team

[⬆ Volver arriba](#-studymate---organizador-académico-inteligente)

</div>
