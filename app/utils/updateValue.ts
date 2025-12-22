interface ModificationEntry {
  elemId: string;
  value: any; // conserver le type réel (string | number | boolean | date...)
  label: {
    table: string;
    field: string;
    type?: 'string' | 'number' | 'decimal' | 'boolean' | 'date';
  };
  cible: string;
  timestamp: number;
  originalElem: any;
  status: 'pending' | 'sending' | 'sent' | 'failed'; // Track l'état de chaque modif
  retryCount: number;
}

const pendingModifications = new Map<string, ModificationEntry>();
const debounceTimers = new Map<string, NodeJS.Timeout>();
let globalSaveTimer: NodeJS.Timeout | null = null;
let isSending = false; // Flag pour éviter les envois concurrents
const DEBOUNCE_DELAY = 600;
const GLOBAL_SAVE_DELAY = 2000; // 2 secondes au lieu de 900ms
const MAX_RETRIES = 3;

// Timer global qui reset à chaque nouvelle modif
function ensureGlobalTimer() {
  // Arrêter le timer existant
  if (globalSaveTimer) {
    clearTimeout(globalSaveTimer);
  }
  
  // Relancer un nouveau timer
  globalSaveTimer = setTimeout(async () => {
    globalSaveTimer = null;
    await saveAllModifications();
  }, GLOBAL_SAVE_DELAY);
}

export const updateValue = async (
  elem: any, 
  value: any, 
  label: any,
  cible: string,
  updateLocalDataFn?: (elemId: string, field: string, value: any, table: string) => void
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
  
  // Ne JAMAIS garder le status 'sending'/'sent' si on change la valeur
  // Toujours remettre à 'pending' pour les modifications
  pendingModifications.set(key, {
    elemId: elem.id,
    value,
    label: normalizedLabel,
    cible,
    timestamp: Date.now(),
    originalElem: elem,
    status: 'pending', // Toujours pending pour une nouvelle valeur
    retryCount: 0
  });
  
  // Mise à jour immédiate dans le composable si fourni
  if (updateLocalDataFn) {
    try {
      updateLocalDataFn(elem.id, normalizedLabel.field, value, normalizedLabel.table);
    } catch (error) {
      console.log('⚠️ Erreur lors de la mise à jour locale:', error);
    }
  }
  
  // console.log(`📝 Modification enregistrée: ${elem.id}.${cible}.${normalizedLabel.field} = "${value}"`);
  // console.log(`📊 Total modifications en attente (pending): ${Array.from(pendingModifications.values()).filter(m => m.status === 'pending').length}`);
  
  const existingTimer = debounceTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  const timer = setTimeout(() => {
    debounceTimers.delete(key);
  }, DEBOUNCE_DELAY);
  
  debounceTimers.set(key, timer);
  
  // Assurer que le timer global tourne (pas le relancer à chaque modif)
  ensureGlobalTimer();
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
    clearTimeout(globalSaveTimer); // Maintenant c'est clearTimeout (pas clearInterval)
    globalSaveTimer = null;
  }
  
  pendingModifications.clear();
  isSending = false; // Reset le flag d'envoi
  // console.log('🧹 Toutes les modifications ont été effacées');
}

export const saveAllModifications = async () => {
  // Éviter les envois concurrents
  if (isSending) {
    // console.log('⏳ Envoi déjà en cours, abandon de la sauvegarde');
    return [];
  }
  
  if (globalSaveTimer) {
    clearTimeout(globalSaveTimer);
    globalSaveTimer = null;
  }
  
  // Récupérer les modifications PENDING (pas sending/sent)
  const pendingModifications_filtered = Array.from(pendingModifications.values())
    .filter(m => m.status === 'pending');
  
  // console.log(`💾 Sauvegarde de ${pendingModifications_filtered.length} modification(s) en base de données (${pendingModifications.size} total, dont en cours)`);
  
  if (pendingModifications_filtered.length === 0) {
    // console.log('ℹ️  Aucune modification à sauvegarder');
    return [];
  }
  
  // Marquer toutes les modifs pending comme "sending"
  pendingModifications_filtered.forEach(m => {
    const key = `${m.elemId}:${m.cible}:${m.label.field}`;
    const mod = pendingModifications.get(key);
    if (mod) {
      mod.status = 'sending';
    }
  });
  
  // Nettoyer les timers locaux des modifs qu'on va envoyer
  const pendingKeys = Array.from(debounceTimers.keys());
  for (const key of pendingKeys) {
    const [elemId, cible, field] = key.split(':');
    const modKey = `${elemId}:${cible}:${field}`;
    if (pendingModifications.has(modKey) && 
        pendingModifications.get(modKey)?.status === 'sending') {
      const timer = debounceTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        debounceTimers.delete(key);
      }
    }
  }
  
  isSending = true;
  
  try {
    const modificationsByTable = new Map<string, ModificationEntry[]>();
    
    pendingModifications_filtered.forEach(mod => {
      const tableName = mod.label.table;
      if (!modificationsByTable.has(tableName)) {
        modificationsByTable.set(tableName, []);
      }
      modificationsByTable.get(tableName)!.push(mod);
    });
    
    const results: any[] = [];
    for (const [table, mods] of modificationsByTable) {
      const result = await updateTableBatch(table, mods);
      if (result && result.ok) {
        // Marquer les modifications comme "sent" si succès
        mods.forEach(m => {
          const key = `${m.elemId}:${m.cible}:${m.label.field}`;
          const mod = pendingModifications.get(key);
          if (mod) {
            mod.status = 'sent';
          }
        });
        results.push(...(result.results || []));
      } else {
        // Marquer comme "failed" et incrémenter retryCount
        mods.forEach(m => {
          const key = `${m.elemId}:${m.cible}:${m.label.field}`;
          const mod = pendingModifications.get(key);
          if (mod) {
            mod.status = 'failed';
            mod.retryCount++;
          }
        });
      }
    }
    
    console.log('✅ Envoi terminé avec succès');
    
    // Nettoyer les modifs envoyées avec succès
    const keysToDelete = Array.from(pendingModifications.keys())
      .filter(key => pendingModifications.get(key)?.status === 'sent');
    
    keysToDelete.forEach(key => pendingModifications.delete(key));
    
    // Reouvrir une sauvegarde si des modifs failed/pending restent
    if (Array.from(pendingModifications.values()).some(m => m.status === 'failed' || m.status === 'pending')) {
      // console.log('🔄 Des modifications en attente ou échouées restent, relance le timer');
      ensureGlobalTimer();
    }
    
    isSending = false;
    return results;
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    
    // Marquer toutes les modifs "sending" comme "failed" pour retry
    Array.from(pendingModifications.values())
      .filter(m => m.status === 'sending')
      .forEach(m => {
        m.status = 'failed';
        m.retryCount++;
      });
    
    isSending = false;
    ensureGlobalTimer(); // Relancer le timer pour les failed
    throw error;
  }
}

// Envoi synchronisé juste avant fermeture/refresh (navigator.sendBeacon)
export const saveAllModificationsBeacon = () => {
  const modifications = getPendingModifications();
  if (modifications.length === 0) return;

  const modsByTable = new Map<string, ModificationEntry[]>();
  for (const mod of modifications) {
    const tableName = mod.label.table;
    if (!modsByTable.has(tableName)) modsByTable.set(tableName, []);
    modsByTable.get(tableName)!.push(mod);
  }

  for (const [table, mods] of modsByTable) {
    const payload = {
      table,
      mods: mods.map(m => ({
        elemId: m.elemId,
        value: m.value,
        label: m.label,
        cible: m.cible,
        timestamp: m.timestamp
      }))
    };

    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      // Ignorer le résultat; sendBeacon est fire-and-forget
      navigator.sendBeacon('/api/actions/updateElem', blob);
    } catch (e) {
      // Fallback silencieux, rien d'autre à faire ici
    }
  }

  // On purge localement pour éviter doublons au prochain chargement
  clearAllModifications();
}

export const getPendingCount = (): number => {
  return pendingModifications.size;
}

export const hasPendingModifications = (): boolean => {
  return pendingModifications.size > 0 || debounceTimers.size > 0;
}

// Fonction de diagnostic pour déboguer
export const getDiagnostics = () => {
  const allMods = Array.from(pendingModifications.values());
  return {
    totalModifications: allMods.length,
    byStatus: {
      pending: allMods.filter(m => m.status === 'pending').length,
      sending: allMods.filter(m => m.status === 'sending').length,
      sent: allMods.filter(m => m.status === 'sent').length,
      failed: allMods.filter(m => m.status === 'failed').length
    },
    activeTimers: debounceTimers.size,
    isSending,
    details: allMods.map(m => ({
      elemId: m.elemId,
      field: m.label.field,
      table: m.label.table,
      status: m.status,
      retryCount: m.retryCount,
      value: m.value
    }))
  };
}

export const updateTableBatch = async(table: any, mods: any) => {
  try {
    const payload = { 
      table, 
      mods: mods.map((mod: any) => ({
        elemId: mod.elemId,
        value: mod.value,
        label: mod.label,
        cible: mod.cible,
        timestamp: mod.timestamp
      }))
    };
    
    const elemIds = Array.from(new Set(payload.mods.map((m: any) => m.elemId)));
    const fields = Array.from(new Set(payload.mods.map((m: any) => m.label?.field)));
    
    console.log('🚚 Envoi batch modifications:', {
      table,
      count: payload.mods.length,
      elemCount: elemIds.length,
      fields: fields.join(', '),
      elemIds: elemIds.slice(0, 3)
    });

    const response = await fetch('/api/actions/updateElem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Réponse API (batch):', {
      table,
      ok: response.ok,
      status: response.status,
      elemCount: elemIds.length,
      fieldCount: fields.length,
      modificationsCount: result?.modificationsCount,
      batchCount: result?.batchCount,
      results: result?.results?.map((r: any) => ({ 
        id: r.id, 
        table: r.table, 
        fields: r.fields, 
        ok: r.ok 
      }))
    });
    return { ...result, ok: result?.success !== false && response.ok };
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  }
}