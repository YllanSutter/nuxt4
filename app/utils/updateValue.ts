interface ModificationEntry {
  elemId: string;
  value: string;
  label: {
    table: string;
    field: string;
    type?: 'string' | 'number' | 'decimal' | 'boolean' | 'date';
  };
  cible: string;
  timestamp: number;
  originalElem: any;
}

const pendingModifications = new Map<string, ModificationEntry>();
const debounceTimers = new Map<string, NodeJS.Timeout>();
let globalSaveTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 1000;
const GLOBAL_SAVE_DELAY = 2000;

export const updateValue = async (
  elem: any, 
  value: string, 
  label: any,
  cible: string,
  updateLocalDataFn?: (elemId: string, field: string, value: string, table: string) => void
) => {
  let normalizedLabel: { table: string; field: string; type?: 'string' | 'number' | 'decimal' | 'boolean' | 'date' };
  
  if (label.table && label.field) {
    normalizedLabel = label;
  } else {
    normalizedLabel = {
      table: getTableFromCible(cible),
      field: getFieldFromLabel(label),
      type: getTypeFromLabel(label)
    };
  }
  
  // Inclure le field dans la clé pour différencier les champs du même élément
  const key = `${elem.id}:${cible}:${normalizedLabel.field}`;
  
  pendingModifications.set(key, {
    elemId: elem.id,
    value,
    label: normalizedLabel,
    cible,
    timestamp: Date.now(),
    originalElem: elem
  });
  
  // Mise à jour immédiate dans le composable si fourni
  if (updateLocalDataFn) {
    try {
      updateLocalDataFn(elem.id, normalizedLabel.field, value, normalizedLabel.table);
    } catch (error) {
      //console.log('⚠️ Erreur lors de la mise à jour locale:', error);
    }
  }
  
  //console.log(`📝 Modification enregistrée: ${elem.id}.${cible} = "${value}"`);
  //console.log(`📊 Total modifications en attente: ${pendingModifications.size}`);
  
  const existingTimer = debounceTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  const timer = setTimeout(() => {
    //console.log(`⏰ Timer local déclenché pour ${key}`);
    debounceTimers.delete(key);
    //console.log(`🕐 Timers restants: ${debounceTimers.size}`);
  }, DEBOUNCE_DELAY);
  
  debounceTimers.set(key, timer);
  
  if (globalSaveTimer) {
    clearTimeout(globalSaveTimer);
  }
  
  globalSaveTimer = setTimeout(async () => {
    //console.log('🔄 Auto-sauvegarde globale déclenchée');
    await saveAllModifications();
    globalSaveTimer = null;
  }, GLOBAL_SAVE_DELAY);
}

function getTableFromCible(cible: string): string {
  const cibleToTable: Record<string, string> = {
    'userGame': 'UserGame',
    'bundle': 'Bundle',
    'user': 'User',
    'platform': 'Platform',
    'tag': 'Tag',
  };
  return cibleToTable[cible] || 'UserGame';
}

function getFieldFromLabel(label: any): string {
  if (label.key) return label.key;
  if (label.name) return label.name.toLowerCase();
  return 'name';
}

function getTypeFromLabel(label: any): 'string' | 'number' | 'decimal' | 'boolean' | 'date' {
  const inputTypeToDataType: Record<string, any> = {
    'input': 'string',
    'number': 'decimal',
    'checkbox': 'boolean',
    'date': 'date',
    'select': 'string',
  };
  
  if (label.type && inputTypeToDataType[label.type]) {
    return inputTypeToDataType[label.type];
  }
  
  if (label.key) {
    if (label.key.includes('price') || label.key.includes('rating')) return 'decimal';
    if (label.key.includes('count') || label.key.includes('order')) return 'number';
    if (label.key.includes('date') || label.key.includes('time')) return 'date';
    if (label.key.includes('is_') || label.key.includes('enabled')) return 'boolean';
  }
  
  return 'string';
}

export const updateElem = updateValue;

export const getPendingModifications = (): ModificationEntry[] => {
  return Array.from(pendingModifications.values());
}

export const clearAllModifications = () => {
  debounceTimers.forEach(timer => clearTimeout(timer));
  debounceTimers.clear();
  
  if (globalSaveTimer) {
    clearTimeout(globalSaveTimer);
    globalSaveTimer = null;
  }
  
  pendingModifications.clear();
  //console.log('🧹 Toutes les modifications ont été effacées');
}

export const saveAllModifications = async () => {
  if (globalSaveTimer) {
    clearTimeout(globalSaveTimer);
    globalSaveTimer = null;
  }
  
  const pendingKeys = Array.from(debounceTimers.keys());
  
  for (const key of pendingKeys) {
    const timer = debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.delete(key);
      const [elemId, cible, field] = key.split(':');
      //console.log(`⚡ Forçage sauvegarde: ${elemId}.${cible}.${field}`);
    }
  }
  
  const modifications = getPendingModifications();
  //console.log(`💾 Sauvegarde de ${modifications.length} modification(s) en base de données`);
  
  if (modifications.length === 0) {
    //console.log('ℹ️  Aucune modification à sauvegarder');
    return [];
  }
  
  try {
    const modificationsByTable = new Map<string, ModificationEntry[]>();
    
    modifications.forEach(mod => {
      const tableName = mod.label.table;
      if (!modificationsByTable.has(tableName)) {
        modificationsByTable.set(tableName, []);
      }
      modificationsByTable.get(tableName)!.push(mod);
    });
    
    for (const [table, mods] of modificationsByTable) {
      await updateTableBatch(table, mods);
    }
    
    //console.log('✅ Sauvegarde terminée avec succès');
    
    clearAllModifications();
    
    return modifications;
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    throw error;
  }
}

export const getPendingCount = (): number => {
  return pendingModifications.size;
}

export const hasPendingModifications = (): boolean => {
  return pendingModifications.size > 0 || debounceTimers.size > 0;
}

export const updateTableBatch = async(table: any, mods: any) => {
  try {
    const response = await fetch('/api/actions/updateElem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        table, 
        mods: mods.map((mod: any) => ({
          elemId: mod.elemId,
          value: mod.value,
          label: mod.label,
          cible: mod.cible,
          timestamp: mod.timestamp
        }))
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    //console.log('✅ Réponse API:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  }
}