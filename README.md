# 🏗️ Presupuestos para Obras Menores y Remodelaciones

Aplicación web moderna e intuitiva para contratistas, maestros y profesionales de la construcción que permite cotizar y presupuestar obras menores, remodelaciones y terminaciones calculando automáticamente superficies por metro cuadrado ($m^2$), perímetros y partidas personalizadas, con exportación directa a un documento **PDF oficial y profesional**.

---

## 🚀 Características Principales

- 📐 **Gestión de Recintos Dinámica**: Agrega o elimina dormitorios, living-comedor, baños, cocinas, terrazas o espacios a medida.
- 🧮 **Cálculo de Superficies en Tiempo Real**:
  - Área de Piso ($m^2$)
  - Área Neta de Muros ($m^2$) descontando automáticamente puertas y ventanas
  - Perímetro para Guardapolvos / Zócalos ($ml$)
  - Área de Cielo ($m^2$)
- 🔨 **Catálogo Completo de Partidas ($/m²$, $/ml$, $/un, $/global)**:
  - **Pinturas**: Látex en muros, pintura de cielos, empastes y enlucidos, reparación de fisuras.
  - **Pisos**: Piso flotante, porcelanato rectificado, cerámica, vinílico SPC, guardapolvos, retiro de pisos antiguos.
  - **Mobiliario & Closets**: Fabricación de closets a medida en melamina, armado de muebles comprados, puertas de paso, muebles de cocina y vanitorios.
  - **Reparaciones & Gasfitería**: Arreglo de techumbres y goteras, cambio de grifería, reparación de fugas, cambio de cerraduras, instalación de artefactos sanitarios.
  - **Partidas Libres y Compras**: Agrega cualquier trabajo o compra de materiales con plantillas rápidas.
- 📄 **Generador de Presupuestos en PDF Profesional**:
  - Membrete con los datos de tu empresa/profesional y RUT.
  - Datos del cliente, dirección de la obra y plazo de ejecución.
  - Tablas detalladas y ordenadas por cada habitación.
  - Desglose financiero con Gastos Generales / Utilidad (%), Descuentos, Subtotal Neto e IVA (19%) opcional.
  - Condiciones comerciales, notas de garantía y líneas para firmas.
  - Vista previa interactiva antes de descargar.
- 💾 **Persistencia Local**: Guarda tus presupuestos en el historial y personaliza tus tarifas base $/m² que se guardan en el navegador.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Vite
- **Estilos**: Vanilla CSS moderno con diseño responsivo
- **Iconos**: Lucide React
- **Motor PDF**: jsPDF + jsPDF-AutoTable

---

## 💻 Instalación y Uso Local

1. **Clonar o descargar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd presupuestos-obras-menores
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre tu navegador en: [http://localhost:5173/](http://localhost:5173/)

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 📄 Licencia

MIT
