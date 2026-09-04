import { DEFAULT_CONTRACTOR, DEFAULT_CLIENT, DEFAULT_PRICE_CATALOG, DEFAULT_EXCLUSIONS, SPACE_PRESETS } from '../types/budget';

const STORAGE_KEYS = {
  CURRENT_BUDGET: 'pom_current_budget',
  SAVED_BUDGETS: 'pom_saved_budgets_list',
  CONTRACTOR_PROFILE: 'pom_contractor_profile',
  PRICE_CATALOG: 'pom_price_catalog'
};

// Initial spaces for a fresh project
export const getInitialSpaces = () => [
  {
    id: 'space_1',
    name: 'Pieza / Recinto 1',
    length: 3.5,
    width: 3.0,
    height: 2.4,
    doors: 1,
    windows: 1,
    customOpeningArea: 0,
    items: [
      {
        id: 'item_1_1',
        name: 'Pintura Látex/Esmalte al Agua en Muros (2 Manos)',
        unit: 'm²',
        unitType: 'area_muros_neta',
        unitPrice: 4500,
        description: 'Preparación de superficie y 2 manos de pintura'
      },
      {
        id: 'item_1_2',
        name: 'Instalación de Piso Flotante / Laminado + Espuma',
        unit: 'm²',
        unitType: 'area_piso',
        unitPrice: 6500,
        description: 'Colocación de piso con espuma niveladora'
      }
    ]
  }
];

export const getCleanStarterBudget = () => ({
  client: {
    name: '',
    rut: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    quoteNumber: `PTO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    date: new Date().toISOString().split('T')[0],
    validityDays: 15,
    estimatedWorkDays: 5,
    workDaysType: 'hábiles'
  },
  spaces: getInitialSpaces(),
  financialSettings: {
    overheadPercent: 10,
    discountPercent: 0,
    applyTax: false,
    taxRate: 19
  },
  exclusions: [...DEFAULT_EXCLUSIONS],
  notes: 'Presupuesto no incluye modificaciones estructurales no especificadas.'
});

export function loadContractorProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRACTOR_PROFILE);
    return data ? { ...DEFAULT_CONTRACTOR, ...JSON.parse(data) } : DEFAULT_CONTRACTOR;
  } catch (e) {
    console.error('Error loading contractor profile', e);
    return DEFAULT_CONTRACTOR;
  }
}

export function saveContractorProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTRACTOR_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving contractor profile', e);
  }
}

export function loadPriceCatalog() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRICE_CATALOG);
    if (data) {
      const stored = JSON.parse(data);
      const merged = [...stored];
      DEFAULT_PRICE_CATALOG.forEach(defaultItem => {
        if (!merged.some(m => m.id === defaultItem.id)) {
          merged.push(defaultItem);
        }
      });
      return merged;
    }
  } catch (e) {
    console.error('Error loading price catalog', e);
  }
  return DEFAULT_PRICE_CATALOG;
}

export function savePriceCatalog(catalog) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICE_CATALOG, JSON.stringify(catalog));
  } catch (e) {
    console.error('Error saving price catalog', e);
  }
}

export function loadCurrentBudget() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_BUDGET);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading current budget', e);
  }
  return getCleanStarterBudget();
}

export function saveCurrentBudget(budget) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BUDGET, JSON.stringify(budget));
  } catch (e) {
    console.error('Error saving current budget', e);
  }
}

export function getSavedBudgetsList() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_BUDGETS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading saved budgets list', e);
    return [];
  }
}

export function saveBudgetToHistory(budget) {
  try {
    const list = getSavedBudgetsList();
    const id = budget.id || `bud_${Date.now()}`;
    const budgetEntry = {
      ...budget,
      id,
      savedAt: new Date().toISOString(),
      clientName: budget.client?.name || 'Sin nombre',
      quoteNumber: budget.client?.quoteNumber || 'PTO-000',
      total: budget.financials?.grandTotal || 0
    };
    
    // Replace if exists, else append to top
    const existingIndex = list.findIndex(b => b.id === id || (b.client?.quoteNumber && b.client.quoteNumber === budget.client?.quoteNumber));
    if (existingIndex >= 0) {
      list[existingIndex] = budgetEntry;
    } else {
      list.unshift(budgetEntry);
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_BUDGETS, JSON.stringify(list.slice(0, 30))); // Keep last 30
    return budgetEntry;
  } catch (e) {
    console.error('Error saving budget to history', e);
  }
}

export function deleteBudgetFromHistory(id) {
  try {
    const list = getSavedBudgetsList().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_BUDGETS, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error('Error deleting budget from history', e);
    return [];
  }
}

/**
 * Exports a single budget as a downloadable .json file
 */
export function exportBudgetToJson(budget) {
  try {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(budget, null, 2));
    const downloadAnchor = document.createElement('a');
    const clientName = (budget.client?.name || 'Cliente').replace(/\s+/g, '_');
    const quoteNum = budget.client?.quoteNumber || 'PTO-000';
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Presupuesto_${quoteNum}_${clientName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (e) {
    console.error('Error exporting budget JSON', e);
    alert('Error al exportar el archivo JSON');
  }
}

/**
 * Exports a complete backup (.json) with all saved budgets, profile and prices
 */
export function exportFullBackup() {
  try {
    const current = loadCurrentBudget();
    const saved = getSavedBudgetsList();
    const contractor = loadContractorProfile();
    const catalog = loadPriceCatalog();

    const backupData = {
      version: '1.0',
      type: 'pom_full_backup',
      exportedAt: new Date().toISOString(),
      currentBudget: current,
      savedBudgets: saved,
      contractorProfile: contractor,
      priceCatalog: catalog
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Respaldo_Presupuestos_Completo_${date}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (e) {
    console.error('Error exporting full backup', e);
    alert('Error al exportar el respaldo completo');
  }
}

