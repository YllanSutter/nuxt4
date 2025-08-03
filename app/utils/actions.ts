// Composable pour la gestion des bundles
export const useBundleActions = () => {
  const userCookie = useCookie('user');
  const user = computed(() => {
    try {
      return typeof userCookie.value === 'string'
        ? JSON.parse(userCookie.value)
        : userCookie.value;
    } catch {
      return {};
    }
  });
  const userId = computed(() => user.value?.id);

  const nameBundle = ref('');
  const numberGames = ref<number | undefined>(undefined);
  const priceBundle = ref<number | undefined>(undefined);

  const addMultipleElem = async (name: string, number: number, cible: string, price?: number, activeBundleId?: string) => {
    const elems: any[] = [];
    const currentDate = new Date().toISOString();
    
    for (let i = 0; i < number; i++) {
      elems.push({
        user_id: userId.value,
        name: name,
        price: price || 0,
        link: '',
        platform_id: 'platform-4',
        state_id: 'private-state-id',
        month_id: 'month-8',
        year_id: 'year-3',
        created_at: currentDate,
        updated_at: currentDate
      });
    }

    let bundleData;
    
    if(cible == "line" && activeBundleId) {
      console.log('test');
      bundleData = {
        existingBundleId: activeBundleId,
        isNewBundle: false
      };
    } else {
      bundleData = {
        name: nameBundle.value || name,
        price: priceBundle.value || price || 0,
        numberGames: number,
        user_id: userId.value,
        isNewBundle: true
      };
    }
    
    try {
      const response = await $fetch('/api/actions/addElem', {
        method: 'POST',
        body: { 
          elems,
          bundleData
        }
      });
      
      console.log('✅ Bundle et éléments créés avec succès:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout:', error);
      throw error;
    }
  };

  const createElem = async (cible: string, activeBundleId?: string) => {
    const nameBundleVal = nameBundle.value;
    const numberGamesVal = numberGames.value;
    const priceVal = priceBundle.value;
    
    if (cible === "line" && activeBundleId) {
      if (numberGamesVal) {
        return await addMultipleElem('', numberGamesVal, cible, priceVal || 0, activeBundleId);
      } else {
        console.warn('⚠️ Le nombre est requis pour ajouter une ligne');
        return null;
      }
    } else {
      if (nameBundleVal && numberGamesVal && priceVal) {
        return await addMultipleElem(nameBundleVal, numberGamesVal, cible, priceVal);
      } else {
        console.warn('⚠️ Tous les champs requis ne sont pas remplis');
        return null;
      }
    }
  };


  const validateBundleData = () => {
    const errors: string[] = [];
    
    if (!nameBundle.value.trim()) {
      errors.push('Le nom du bundle est requis');
    }
    if (!numberGames.value || numberGames.value <= 0) {
      errors.push('Le nombre de jeux doit être supérieur à 0');
    }
    if (!priceBundle.value || priceBundle.value < 0) {
      errors.push('Le prix doit être supérieur ou égal à 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const resetForm = () => {
    nameBundle.value = '';
    numberGames.value = undefined;
    priceBundle.value = undefined;
  };

  // Fonctions de suppression
  const deleteBundle = async (bundleId: string) => {
    try {
      const response = await $fetch('/api/actions/deleteElem', {
        method: 'DELETE',
        body: { 
          type: 'bundle',
          bundleId: bundleId
        }
      });
      
      console.log('✅ Bundle supprimé avec succès:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du bundle:', error);
      throw error;
    }
  };

  const deleteLine = async (userGameId: string) => {
    try {
      const response = await $fetch('/api/actions/deleteElem', {
        method: 'DELETE',
        body: { 
          type: 'line',
          userGameId: userGameId
        }
      });
      
      console.log('✅ Ligne supprimée avec succès:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la ligne:', error);
      throw error;
    }
  };

  return {
    nameBundle,
    numberGames,
    priceBundle,
    user,
    userId,
    
    createElem,
    addMultipleElem,
    validateBundleData,
    resetForm,
    deleteBundle,
    deleteLine
  };
};