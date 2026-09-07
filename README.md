# WorshipFlow - Ministerio Musical RDD 🎶

Plataforma web integral para la gestión, biblioteca de partituras/cifrados y planificación de servicios dominicales del ministerio de alabanza.

---

## 🚀 Tecnologías

* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
* **Lenguaje:** TypeScript (Modo estricto)
* **Estilos:** Tailwind CSS con componentes estilo shadcn/ui
* **Backend & Auth:** Firebase Authentication (Google Auth)
* **Base de Datos:** Cloud Firestore
* **Almacenamiento:** Firebase Cloud Storage (PDFs de cifrados y partituras)
* **Íconos:** Lucide React

---

## 📋 Características Principales

1. **Biblioteca Centralizada de Canciones (`/songs`):**
   * Metadatos completos: Título, Artista, BPM, Compás, Tonalidad original, enlaces a YouTube y Spotify.
   * Carga y descarga de archivos PDF organizados por tono musical (Firebase Storage).
   * Visor embebido de partituras/cifrados sin salir de la plataforma.

2. **Planificador de Servicios & Setlists (`/services`):**
   * Creación de servicios con fecha, hora, tipo de evento y notas.
   * Tablero interactivo con reordenamiento de canciones y asignación de tono a ejecutar ese día.
   * Asignación de músicos por rol (Líder, Batería, Bajo, Guitarras, Voces, etc.) y confirmación de asistencia en tiempo real (`pending`, `confirmed`, `declined`).

3. **Vista de Atril / Impresión (`/services/[id]/print`):**
   * Diseño de alto contraste optimizado para imprimir o colocar en atril de músico en escenario.

4. **Gestión de Equipo y Roles (`/team`):**
   * Control de acceso basado en roles: `admin`, `leader` y `member`.

---

## 🛠️ Configuración Local

1. Clona este repositorio:
   ```bash
   git clone https://github.com/jdcha24/Ministerio-Musical-RDD.git
   cd Ministerio-Musical-RDD
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno en `.env.local` (utiliza `.env.example` como referencia):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔒 Reglas de Seguridad

El repositorio incluye las reglas de seguridad listas para Firebase:
* `firestore.rules`
* `storage.rules`
