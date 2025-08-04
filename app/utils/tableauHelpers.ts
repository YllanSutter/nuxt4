/**
 * Utilitaires pour la gestion des tableaux
 */

/**
 * Récupère les jeux d'un bundle spécifique ou de tous les bundles
 */
export function getUserGamesForBundle(
  bundleGameMap: Map<string, any[]>, 
  bundle: any
): any[] {
  if (bundle?.id) {
    return bundleGameMap.get(bundle.id) || [];
  } else if (Array.isArray(bundle)) {
    // Mode "tous les bundles"
    let aggregateBundleCalc: any[] = [];
    for (let i = 0; i < bundle.length; i++) {
      aggregateBundleCalc.push(...(bundleGameMap.get(bundle[i].id) || []));
    }
    return aggregateBundleCalc;
  }
  return [];
}

/**
 * Gère la mise à jour des valeurs avec updateElem
 */
export function handleValueUpdate(
  userGame: any,
  newValue: any,
  label: any,
  updateElem: Function,
  updateLocalData: Function,
  getOptionsForLabel: Function
) {
  if (newValue !== null && newValue !== undefined) {
    let valueToSave = newValue;
    
    // Pour les champs ID, convertir le nom en ID
    if (label.key.includes('_id') || label.key.includes('Id')) {
      const option = getOptionsForLabel(label.key).find((opt: any) => opt.name === newValue);
      valueToSave = option ? option.id : newValue;
    }
    
    userGame[label.key] = valueToSave;
    updateElem(userGame, String(valueToSave), label, 'userGame', updateLocalData);
  }
}

/**
 * Gère la mise à jour directe des valeurs dans le modèle
 */
export function handleModelUpdate(userGame: any, newValue: any, labelKey: string) {
  if (newValue !== null && newValue !== undefined) {
    userGame[labelKey] = newValue;
  }
}

/**
 * Types pour les props du tableau
 */
export interface TableauDataProps {
  bundles: any[];
  mainLabels: any[];
  calcLabels: any[];
  showAll: boolean;
  activeTabIndex: number;
  filteredBundles: any[];
  bundleGameMap: Map<string, any[]>;
  getUserGameValue: Function;
  getOptionsForLabel: Function;
  updateElem: Function;
  updateLocalData: Function;
  onLineDeleted: Function;
  onBundleDeleted: Function;
}

/**
 * Configuration pour les modes d'affichage
 */
export const DISPLAY_MODES = {
  SHOW_ALL: 'showAll',
  SINGLE_BUNDLE: 'singleBundle'
} as const;

export type DisplayMode = typeof DISPLAY_MODES[keyof typeof DISPLAY_MODES];
