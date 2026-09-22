// Default Space Presets
export const SPACE_PRESETS = [
  { id: 'dormitorio-p', name: 'Dormitorio Principal', icon: 'Bed', defaultLength: 3.5, defaultWidth: 3.2, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'dormitorio-2', name: 'Dormitorio 2', icon: 'BedDouble', defaultLength: 3.0, defaultWidth: 2.8, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'dormitorio-3', name: 'Dormitorio 3', icon: 'BedSingle', defaultLength: 2.8, defaultWidth: 2.5, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'living-comedor', name: 'Living / Comedor', icon: 'Sofa', defaultLength: 5.5, defaultWidth: 3.8, defaultHeight: 2.4, defaultDoors: 2, defaultWindows: 2 },
  { id: 'cocina', name: 'Cocina', icon: 'ChefHat', defaultLength: 3.2, defaultWidth: 2.2, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'logia-calefont', name: 'Logia / Traslado Calefont', icon: 'Flame', defaultLength: 2.4, defaultWidth: 1.6, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'bano-p', name: 'Baño Principal', icon: 'Bath', defaultLength: 2.2, defaultWidth: 1.8, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
  { id: 'bano-visita', name: 'Baño de Visitas', icon: 'Droplets', defaultLength: 1.8, defaultWidth: 1.4, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 0 },
  { id: 'pasillo', name: 'Pasillo / Hall', icon: 'Footprints', defaultLength: 4.0, defaultWidth: 1.1, defaultHeight: 2.4, defaultDoors: 4, defaultWindows: 0 },
  { id: 'terraza', name: 'Terraza / Balcón', icon: 'Sun', defaultLength: 3.5, defaultWidth: 1.8, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 0 },
  { id: 'personalizado', name: 'Espacio Personalizado', icon: 'Maximize', defaultLength: 3.0, defaultWidth: 3.0, defaultHeight: 2.4, defaultDoors: 1, defaultWindows: 1 },
];

// Catalog of Standard Work Items for Minor Works
export const WORK_CATEGORIES = {
  GAS_CALEFONT: 'Calefont, Gas y Gasfitería',
  ELECTRICIDAD: 'Instalaciones Eléctricas',
  ALBANILERIA: 'Albañilería y Obras Civiles',
  PINTURA: 'Pintura y Terminaciones',
  PISOS: 'Pisos y Revestimientos',
  CARPINTERIA: 'Mobiliario, Closets y Carpintería',
  REPARACIONES: 'Reparaciones, Mantenciones y Gasfitería',
  INSTALACIONES: 'Albañilería e Instalaciones'
};

export const DEFAULT_PRICE_CATALOG = [
  // Calefont, Gas y Gasfitería
  {
    id: 'desmontaje_calefont',
    name: 'Desmontaje Seguro de Calefont Existente',
    category: WORK_CATEGORIES.GAS_CALEFONT,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 25000,
    description: 'Desconexión de redes de agua y gas con corte preventivo, retiro de anclajes y sellado.',
    includesMaterials: false
  },
  {
    id: 'extension_gas_cobre',
    name: 'Extensión de Red de Gas en Cobre Tipo L',
    category: WORK_CATEGORIES.GAS_CALEFONT,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 65000,
    description: 'Trazado en tubería cobre, uniones en soldadura fuerte (plata), llave de paso de corte certificada y abrazaderas normadas.',
    includesMaterials: false
  },
  {
    id: 'extension_agua_fria_caliente',
    name: 'Extensión de Redes de Agua Fría y Caliente (PPR / Cobre)',
    category: WORK_CATEGORIES.GAS_CALEFONT,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 55000,
    description: 'Canalización en tubería PPR termofusión o cobre, llaves de paso de corte angulares y terminales con hilo.',
    includesMaterials: false
  },
  {
    id: 'montaje_calefont_conexion',
    name: 'Montaje, Fijación y Conexión de Calefont en Nueva Ubicación',
    category: WORK_CATEGORIES.GAS_CALEFONT,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 42000,
    description: 'Fijación sólida a plomo en muro, instalación de flexibles certificados de agua y gas, y sellado antivibración.',
    includesMaterials: false
  },
  {
    id: 'ducto_evacuacion_calefont',
    name: 'Instalación de Ducto de Evacuación de Gases y Sombrerete',
    category: WORK_CATEGORIES.GAS_CALEFONT,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 35000,
    description: 'Instalación de tubo de evacuación de gases al exterior (tiro natural o forzado), sombrerete y sellado perimetral contra intemperie.',
    includesMaterials: false
  },
  {
    id: 'prueba_hermeticidad_gas',
    name: 'Prueba de Hermeticidad, Detección de Fugas y Puesta en Marcha',
    category: WORK_CATEGORIES.GAS_CALEFONT,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 25000,
    description: 'Verificación manométrica/agua jabonosa de estanqueidad en circuito de gas, purga de cañerías y regulación de llama.',
    includesMaterials: true
  },

  // Instalaciones Eléctricas
  {
    id: 'punto_enchufe_calefont',
    name: 'Circuito y Enchufe Dedicado para Calefont (Tiro Forzado/Ionizado)',
    category: WORK_CATEGORIES.ELECTRICIDAD,
    unit: 'pto',
    unitType: 'fixed',
    unitPrice: 28000,
    description: 'Canalización conduit/legrand, cableado EVA 2.5mm² libre de halógeno con tierra de protección y caja de enchufe certificada.',
    includesMaterials: false
  },
  {
    id: 'renovacion_puntos_electricos',
    name: 'Renovación / Reemplazo de Puntos Eléctricos (Enchufes / Interruptores)',
    category: WORK_CATEGORIES.ELECTRICIDAD,
    unit: 'pto',
    unitType: 'fixed',
    unitPrice: 18000,
    description: 'Retiro de módulos antiguos, revisión de continuidad/fase/neutro y montaje de nuevas placas y módulos normalizados.',
    includesMaterials: false
  },
  {
    id: 'adecuacion_tablero_tda',
    name: 'Instalación de Disyuntor Automático y Diferencial en Tablero (TDA)',
    category: WORK_CATEGORIES.ELECTRICIDAD,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 38000,
    description: 'Montaje en riel DIN de interruptor termomagnético (10A/16A) y protector diferencial 25A 30mA certificado SEC.',
    includesMaterials: false
  },
  {
    id: 'canalizacion_cableado_electrico',
    name: 'Canalización y Cableado Eléctrico Normalizado',
    category: WORK_CATEGORIES.ELECTRICIDAD,
    unit: 'ml',
    unitType: 'fixed',
    unitPrice: 12000,
    description: 'Tendido de tubería conduit o moldura plástica Legrand con conductores F+N+Tierra certificados SEC.',
    includesMaterials: false
  },

  // Albañilería y Obras Civiles
  {
    id: 'picado_regatas_muro',
    name: 'Picado y Regatas en Muro para Embutir Tuberías',
    category: WORK_CATEGORIES.ALBANILERIA,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 32000,
    description: 'Ranurado en albañilería o tabiquería para embutir redes de agua, gas y canalizaciones eléctricas.',
    includesMaterials: false
  },
  {
    id: 'tapado_regatas_enlucido',
    name: 'Tapado de Regatas con Mortero, Yeso y Enlucido de Parches',
    category: WORK_CATEGORIES.ALBANILERIA,
    unit: 'global',
    unitType: 'fixed',
    unitPrice: 28000,
    description: 'Relleno de mortero de pega, puente de adherencia y empaste liso listo para recibir acabado de pintura.',
    includesMaterials: true
  },
  {
    id: 'perforacion_pasamuro_ducto',
    name: 'Perforación de Muro / Corona para Salida de Ducto al Exterior',
    category: WORK_CATEGORIES.ALBANILERIA,
    unit: 'un',
    unitType: 'fixed',
    unitPrice: 24000,
    description: 'Perforación circular limpia en ladrillo/mampostería para paso de cañón de evacuación con pendiente hacia el exterior.',
    includesMaterials: false
  },

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
  estimatedWorkDays: 5,
  workDaysType: 'hábiles'
};

export const DEFAULT_EXCLUSIONS = [
  'Materiales de terminación fina (cerámicas, artefactos, griferías o lámparas a suministrar por el cliente)',
  'Retiro de escombros o basura ajena a los trabajos aquí especificados',
  'Modificaciones estructurales, permisos municipales o proyectos de cálculo',
  'Reparaciones por vicios ocultos no detectables en la visita técnica previa'
];

export const SUGGESTED_EXCLUSIONS = [
  'Materiales de terminación (cerámicas, artefactos, griferías)',
  'Suministro del artefacto calefont (proporcionado por el cliente)',
  'Trámites o pago de derechos por Certificación Sello Verde o Declaración SEC (TE1 / TC6)',
  'Aumento de capacidad de empalme eléctrico general o medidor ante distribuidora eléctrica',
  'Retiro de escombros de obras o demoliciones anteriores',
  'Modificaciones estructurales o cálculo de ingeniería',
  'Permisos municipales y trámites de edificación',
  'Reparación de filtraciones o daños ocultos en muros/cañerías',
  'Movimiento y protección de mobiliario delicado o línea blanca',
  'Trabajos en horarios nocturnos, festivos o fines de semana',
  'Pintura o terminaciones exteriores no especificadas'
];

