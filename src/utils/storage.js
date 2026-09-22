import { DEFAULT_CONTRACTOR, DEFAULT_CLIENT, DEFAULT_PRICE_CATALOG, DEFAULT_EXCLUSIONS, SPACE_PRESETS } from '../types/budget';
import { RECOVERED_PROJECT } from './recoveredProject';
import { triggerFileDownload } from './downloader';

const STORAGE_KEYS = {
  CURRENT_BUDGET: 'pom_current_budget',
  SAVED_BUDGETS: 'pom_saved_budgets_list',
  CONTRACTOR_PROFILE: 'pom_contractor_profile',
  CONTRACTOR_DRAFT: 'pom_contractor_profile_draft',
  LAST_BUDGET_BACKUP: 'pom_last_budget_backup',
  PRICE_CATALOG: 'pom_price_catalog'
};

// Initial spaces for a fresh project (clean empty slate)
export const getInitialSpaces = () => [];

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
  spaces: [],
  financialSettings: {
    overheadPercent: 10,
    discountPercent: 0,
    applyTax: false,
    taxRate: 19
  },
  exclusions: [...DEFAULT_EXCLUSIONS],
  notes: ''
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

export function loadContractorDraft() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRACTOR_DRAFT);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function saveContractorDraft(draft) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTRACTOR_DRAFT, JSON.stringify(draft));
  } catch (e) {
    console.error('Error saving contractor draft', e);
  }
}

export function clearContractorDraft() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONTRACTOR_DRAFT);
  } catch (e) {
    console.error('Error clearing contractor draft', e);
  }
}

export function saveBudgetAutoBackup(budget) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_BUDGET_BACKUP, JSON.stringify({
      timestamp: new Date().toISOString(),
      budget
    }));
  } catch (e) {
    console.error('Error saving auto backup', e);
  }
}

export function loadPriceCatalog() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRICE_CATALOG);
    if (data) {
      const stored = JSON.parse(data);
      const merged = [...stored];
      let hasNew = false;
      DEFAULT_PRICE_CATALOG.forEach(defaultItem => {
        if (!merged.some(m => m.id === defaultItem.id)) {
          merged.push(defaultItem);
          hasNew = true;
        }
      });
      if (hasNew) {
        localStorage.setItem(STORAGE_KEYS.PRICE_CATALOG, JSON.stringify(merged));
      }
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
      const parsed = JSON.parse(data);
      // If María Luz Camus Romo is already the active budget, return it
      if (parsed?.client?.name === 'María Luz Camus Romo' && Array.isArray(parsed?.spaces) && parsed.spaces.length > 0) {
        return parsed;
      }
      // If there was another budget, preserve it in history
      if (parsed && parsed.spaces && parsed.spaces.length > 0 && parsed.client?.name && parsed.client.name !== 'María Luz Camus Romo') {
        saveBudgetToHistory(parsed);
      }
    }
  } catch (e) {
    console.error('Error loading current budget', e);
  }

  // Load María Luz Camus Romo project into current budget
  if (RECOVERED_PROJECT && Array.isArray(RECOVERED_PROJECT.spaces) && RECOVERED_PROJECT.spaces.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_BUDGET, JSON.stringify(RECOVERED_PROJECT));
    } catch (e) {}
    return RECOVERED_PROJECT;
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
    const list = data ? JSON.parse(data) : [];

    // Ensure the recovered project is accessible in history across all browsers
    if (RECOVERED_PROJECT && !list.some(b => b.client?.quoteNumber === RECOVERED_PROJECT.client?.quoteNumber)) {
      list.unshift({
        ...RECOVERED_PROJECT,
        id: 'recov_maria_luz_camus',
        savedAt: new Date().toISOString(),
        clientName: RECOVERED_PROJECT.client?.name || 'María Luz Camus Romo',
        quoteNumber: RECOVERED_PROJECT.client?.quoteNumber || 'PTO-2026-078',
        total: 10425000
      });
    }

    return list;
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
    const clientName = (budget.client?.name || 'Cliente')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const quoteNum = (budget.client?.quoteNumber || 'PTO-000').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Presupuesto_${quoteNum}_${clientName}.json`;
    const jsonStr = JSON.stringify(budget, null, 2);
    triggerFileDownload(jsonStr, fileName, 'application/json');
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

    const date = new Date().toISOString().split('T')[0];
    const fileName = `Respaldo_Presupuestos_Completo_${date}.json`;
    const jsonStr = JSON.stringify(backupData, null, 2);
    triggerFileDownload(jsonStr, fileName, 'application/json');
  } catch (e) {
    console.error('Error exporting full backup', e);
    alert('Error al exportar el respaldo completo');
  }
}

