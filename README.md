# WorshipFlow - Ministerio Musical RDD

Plataforma web integral para la gestión, coordinación y planificación del ministerio de alabanza de la iglesia **Ministerio Musical RDD**.

Desarrollada con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS** y la suite de **Firebase (Auth, Firestore y Storage)**.

---

## Características Principales

* **Planificación de Servicios y Cultos Dominicales**:
  * Programación de servicios y ensayos con fecha, hora y notas para el equipo.
  * Estructuración interactiva del setlist de alabanza: orden dinámico, selección del tono específico a tocar ese día y notas operativas.
  * Convocatoria y alineación de músicos/voces por instrumento con confirmación de asistencia en tiempo real (`Confirmado`, `Pendiente`, `No asiste`).
  * Vista de alta legibilidad para atril de músico y versión lista para imprimir/exportar a PDF.

* **Biblioteca Centralizada de Canciones**:
  * Registro de temas con metadatos: autor, BPM, compás, tono original, enlaces a YouTube/Spotify y etiquetas.
  * Carga y almacenamiento seguro de archivos PDF (cifrados de acordes, partituras, lead sheets) en Firebase Storage organizados por tonalidad.
  * Visor de cifrados embebido para visualización directa en cualquier dispositivo.

* **Seguridad y Control de Acceso**:
  * Autenticación con Google.
  * Control de roles: `admin` (gestión total y asignación de roles), `leader` (creación de servicios y subida de cifrados) y `member` (consulta de repertorio y confirmación de asistencia).
  * Reglas de seguridad robustas en `firestore.rules` y `storage.rules`.

---

## Stack Tecnológico

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Lenguaje**: TypeScript (Strict Mode)
* **Estilos**: Tailwind CSS & Lucide Icons
* **Backend & Base de Datos**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
* **Autenticación**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Auth)
* **Almacenamiento de Cifrados**: [Firebase Storage](https://firebase.google.com/docs/storage)

---

## Configuración y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/jdcha24/Ministerio-Musical-RDD.git
cd Ministerio-Musical-RDD
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto tomando como base `.env.example`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ministerio-musical-rdd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ministerio-musical-rdd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ministerio-musical-rdd.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 4. Iniciar en desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Compilar para Producción
```bash
npm run build
```
