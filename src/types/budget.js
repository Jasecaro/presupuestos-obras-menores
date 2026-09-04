// Default Space Presets
export const SPACE_PRESETS = [
  { id: 'dormitorio-p', name: 'Dormitorio Principal', icon: 'Bed', defaultLength: 3.5, defaultWidth: 3.2, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'dormitorio-2', name: 'Dormitorio 2', icon: 'BedDouble', defaultLength: 3.0, defaultWidth: 2.8, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'dormitorio-3', name: 'Dormitorio 3', icon: 'BedSingle', defaultLength: 2.8, defaultWidth: 2.5, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'living-comedor', name: 'Living / Comedor', icon: 'Sofa', defaultLength: 5.5, defaultWidth: 3.8, defaultHeight: 2.4, defaultDoors: 2, defaultWindows: 2 },
  { id: 'cocina', name: 'Cocina', icon: 'ChefHat', defaultLength: 3.2, defaultWidth: 2.2, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'bano-p', name: 'Baño Principal', icon: 'Bath', defaultLength: 2.2, defaultWidth: 1.8, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'bano-visita', name: 'Baño de Visitas', icon: 'Droplets', defaultLength: 1.8, defaultWidth: 1.4, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 0 },
  { id: 'pasillo', name: 'Pasillo / Hall', icon: 'Footprints', defaultLength: 4.0, defaultWidth: 1.1, defaultHeight: 2.4, defaultDoors: 4, defaultWindows: 0 },
  { id: 'terraza', name: 'Terraza / Balcón', icon: 'Sun', defaultLength: 3.5, defaultWidth: 1.8, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 0 },
  { id: 'personalizado', name: 'Espacio Personalizado', icon: 'Maximize', defaultLength: 3.0, defaultWidth: 3.0, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
];

// Catalog of Standard Work Items for Minor Works
export const WORK_CATEGORIES = {
  PINTURA: 'Pintura y Terminaciones',
  PISOS: 'Pisos y Revestimientos',
  CARPINTERIA: 'Mobiliario, Closets y Carpintería',
  REPARACIONES: 'Reparaciones, Mantenciones y Gasfitería',
  INSTALACIONES: 'Albañilería e Instalaciones'
};

export const DEFAULT_PRICE_CATALOG = [
  // Pinturas
  {
    id: 'pintura_muros_latex',
    name: 'Pintura Látex/Esmalte al Agua en Muros (2 Manos)',
    category: WORK_CATEGORIES.PINTURA,
    unit: 'm²',
    unitType: 'area_muros_neta',
    unitPrice: 4500,
    description: 'Preparación de superficie, lijado suave y aplicación de 2 manos de pintura.',
    includesMaterials: false
  },
  {
    id: 'pintura_cielo',
    name: 'Pintura de Cielos (Óleo Opaco / Látex Especial)',
    category: WORK_CATEGORIES.PINTURA,
    unit: 'm²',
    unitType: 'area_cielo',
    unitPrice: 5200,
    description: 'Tratamiento antihumedad base y 2 manos de pintura para cielos.',
    includesMaterials: false
  },
  {
    id: 'pasta_enlucido',
    name: 'Empaste / Enlucido Completo de Muros',
    category: WORK_CATEGORIES.PINTURA,
    unit: 'm²',
    unitType: 'area_muros_neta',
    unitPrice: 3800,
    description: 'Pasta muro en 2 manos y lijado fino para acabado liso.',
    includesMaterials: false
  },
  {
    id: 'reparacion_grietas',
    name: 'Reparación de Fisuras y Picados de Muro',
    category: WORK_CATEGORIES.PINTURA,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 25000,
    description: 'Apertura de fisuras, puente adherente, masilla elástica y cinta de fibra.',
    includesMaterials: true
  },

  // Pisos
  {
    id: 'piso_flotante',
    name: 'Instalación de Piso Flotante / Laminado + Espuma',
    category: WORK_CATEGORIES.PISOS,
    unit: 'm²',
    unitType: 'area_piso',
    unitPrice: 6500,
    description: 'Colocación de polietileno/espuma niveladora e instalación de tablas machihembradas.',
    includesMaterials: false
  },
  {
    id: 'piso_ceramica',
    name: 'Instalación de Cerámica / Baldosín en Piso',
    category: WORK_CATEGORIES.PISOS,
    unit: 'm²',
    unitType: 'area_piso',
    unitPrice: 11000,
    description: 'Nivelación previa, adhesivo cerámico, fraguado y limpieza.',
    includesMaterials: false
  },
  {
    id: 'piso_porcelanato',
    name: 'Instalación de Porcelanato Rectificado en Piso',
    category: WORK_CATEGORIES.PISOS,
    unit: 'm²',
    unitType: 'area_piso',
    unitPrice: 14500,
    description: 'Instalación con sistema de nivelación con cuñas, adhesivo doble contacto y fragüe.',
    includesMaterials: false
  },
  {
    id: 'piso_vinilico_spc',
    name: 'Instalación de Piso Vinílico / SPC Click',
    category: WORK_CATEGORIES.PISOS,
    unit: 'm²',
    unitType: 'area_piso',
    unitPrice: 7500,
    description: 'Colocación de piso vinílico rígido con manta acústica incorporada.',
    includesMaterials: false
  },
  {
    id: 'guardapolvos',
    name: 'Instalación de Guardapolvos / Zócalos',
    category: WORK_CATEGORIES.PISOS,
    unit: 'ml',
    unitType: 'perimetro_neto',
    unitPrice: 2800,
    description: 'Corte inglete a 45°, fijación adhesivo de montaje y puntillas, sellado superior.',
    includesMaterials: false
  },
  {
    id: 'retiro_piso_antiguo',
    name: 'Retiro y Demolición de Piso Existente',
    category: WORK_CATEGORIES.PISOS,
    unit: 'm²',
    unitType: 'area_piso',
    unitPrice: 4000,
    description: 'Levante de alfombra/cerámica antigua y raspado de adhesivo base.',
    includesMaterials: false
  },

  // Mobiliario, Closets y Carpintería
  {
    id: 'closet_a_medida',
    name: 'Fabricación e Instalación de Closet a Medida (Melamina)',
    category: WORK_CATEGORIES.CARPINTERIA,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 220000,
    description: 'Estructura en melamina 18mm, repisas, barra de colgar, cajoneras y puertas con tiradores.',
    includesMaterials: true
  },
  {
    id: 'armado_closet_comprado',
    name: 'Armado e Instalación de Closet / Mueble Modular Comprado',
    category: WORK_CATEGORIES.CARPINTERIA,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 35000,
    description: 'Armado completo según plano, escuadrado, anclaje a muro de seguridad y nivelación.',
    includesMaterials: false
  },
  {
    id: 'puerta_paso',
    name: 'Suministro e Instalación de Puerta de Paso con Marco y Chapa',
    category: WORK_CATEGORIES.CARPINTERIA,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 65000,
    description: 'Puerta estándar, marco, bisagras, cerradura embutida y colocación de pilastras.',
    includesMaterials: true
  },
  {
    id: 'arreglo_puertas_ajuste',
    name: 'Arreglo, Ajuste y Cepillado de Puertas / Bisagras',
    category: WORK_CATEGORIES.CARPINTERIA,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 15000,
    description: 'Rebaje, cepillado por roce o dilatación, ajuste o cambio de bisagras y lubricación.',
    includesMaterials: false
  },
  {
    id: 'muebles_cocina_vanitorio',
    name: 'Instalación de Muebles de Cocina o Vanitorio',
    category: WORK_CATEGORIES.CARPINTERIA,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 45000,
    description: 'Montaje de muebles base/aéreos o vanitorio, fijación a muro y nivelación.',
    includesMaterials: false
  },

  // Reparaciones, Mantenciones y Gasfitería
  {
    id: 'arreglo_goteras_techo',
    name: 'Arreglo de Techumbre / Sellado de Goteras y Bajadas',
    category: WORK_CATEGORIES.REPARACIONES,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 55000,
    description: 'Revisión de planchas/tejas, sellado con membrana asfáltica o silicona poliuretánica y limpieza de canaleta.',
    includesMaterials: true
  },
  {
    id: 'cambio_griferia',
    name: 'Arreglo / Cambio de Grifería y Llaves de Paso',
    category: WORK_CATEGORIES.REPARACIONES,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 22000,
    description: 'Desmontaje de grifería antigua, instalación de nueva grifería con flexibles y sellado antifugas.',
    includesMaterials: false
  },
  {
    id: 'reparacion_fuga_gasfiteria',
    name: 'Arreglo de Fuga de Agua / Filtración de Cañería o Desagüe',
    category: WORK_CATEGORIES.REPARACIONES,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 38000,
    description: 'Detección de filtración puntual, cambio de niple/fitting en PPR, cobre o PVC y prueba de presión.',
    includesMaterials: true
  },
  {
    id: 'arreglo_cerradura_chapa',
    name: 'Arreglo / Cambio de Chapa y Cerradura de Seguridad',
    category: WORK_CATEGORIES.REPARACIONES,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 25000,
    description: 'Calado, instalación de cerradura de sobreponer o embutir con juego de llaves.',
    includesMaterials: false
  },
  {
    id: 'cambio_sanitario_wc',
    name: 'Instalación / Cambio de Artefacto WC o Lavamanos',
    category: WORK_CATEGORIES.REPARACIONES,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 32000,
    description: 'Instalación de taza y estanque con cuello de cera, llave angular, flexible y sello silicona.',
    includesMaterials: false
  },

  // Albañilería e Instalaciones
  {
    id: 'punto_electrico',
    name: 'Nuevo Punto Eléctrico / Enchufe o Interruptor',
    category: WORK_CATEGORIES.INSTALACIONES,
    unit: 'pto',
    unitType: 'fixed',
    unitPrice: 18000,
    description: 'Canalización, cableado normalizado, módulo y placa.',
    includesMaterials: false
  },
  {
    id: 'retiro_escombros',
    name: 'Retiro de Escombros y Limpieza de Obra',
    category: WORK_CATEGORIES.INSTALACIONES,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 45000,
    description: 'Ensacado, carguío y traslado a botadero autorizado.',
    includesMaterials: true
  }
];

export const DEFAULT_CONTRACTOR = {
  name: 'Constructora & Remodelaciones Pro',
  contractorName: 'Juan Pérez Rodríguez',
  rut: '15.482.930-K',
  phone: '+56 9 8765 4321',
  email: 'contacto@obraspro.cl',
  address: 'Av. Providencia 1234, Of. 502, Santiago',
  notes: 'Presupuesto válido por 15 días hábiles a partir de la fecha de emisión. Precios sujetos a confirmación de estado de superficies tras despeje.',
  paymentTerms: '50% de anticipo al inicio de obras, 30% al avance intermedio y 20% contra entrega conforme.',
  warranty: 'Garantía de 6 meses en mano de obra sobre trabajos ejecutados.',
  currency: 'CLP',
  currencySymbol: '$'
};

export const DEFAULT_CLIENT = {
  name: '',
  rut: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  quoteNumber: `PTO-${new Date().getFullYear()}-001`,
  date: new Date().toISOString().split('T')[0],
  validityDays: 15,
  estimatedWorkDays: 5
};
