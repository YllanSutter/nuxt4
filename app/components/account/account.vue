<script setup>
const loading = ref(false);
const name = ref('');
const id = ref('');
const budget = ref(0);
const role = ref(0);
const active = ref(false);
const password = ref('');

// Utiliser le composable d'authentification
const { user, logout, updateProfile, fetchUserData } = useAuth();

// Charger les données utilisateur
const loadUser = async () => {
  try {
    loading.value = true;

    if (!user.value) {
      throw new Error('Utilisateur non connecté.');
    }

    const userData = await fetchUserData();

    if (userData) {
      id.value = userData.id || '';
      name.value = userData.name || '';
      budget.value = userData.budget || 0;
      role.value = userData.role_id === 'admin-role-id' ? 'Admin' : 'User';
      active.value = true; // Pas de champ active dans notre schéma
    }
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
};

// Mise à jour utilisateur
const updateUser = async () => {
  try {
    loading.value = true;

    const updates = {
      name: name.value,
      budget: budget.value,
      password: password.value ? password.value : undefined, // n'envoie que si rempli
    };

    await updateProfile(updates);
    
    alert('Profil mis à jour avec succès !');
    password.value = ''; // Vider le champ mot de passe après mise à jour
  } catch (error) {
    alert('Erreur lors de la mise à jour : ' + error.message);
  } finally {
    loading.value = false;
  }
};

// Déconnexion
const signOut = async () => {
  try {
    loading.value = true;
    
    // Utiliser la fonction logout du composable
    logout();
    
    
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
};

// Charger les données au montage du composant
onMounted(() => {
  if (user.value) {
    loadUser();
  }
});
</script>

<template>
  <div class="accountDiv z-[1] relative">
   <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline"> <Icon name="solar:shield-user-broken" />Account</Button>
          </PopoverTrigger>
          <PopoverContent class="w-[700px] flex gap-2 p-10 pl-5 pr-50">
            <form class="grid grid-cols-2 gap-3 max-w-md mx-auto" @submit.prevent="updateUser">
              <label class="col-span-2">Email
                <input type="text" :value="user?.email || ''" disabled class="w-full border-b border-[#ffffff20] bg-transparent mb-2" />
              </label>
              <label>Id
                <input type="text" v-model="id" disabled class="w-full border p-2 border-[#ffffff20] rounded-lg" />
              </label>
              <label>Nom
                <input type="text" v-model="name" class="w-full border p-2 border-[#ffffff20] rounded-lg" />
              </label>
              <label>Budget Max
                <input type="number" v-model="budget" class="w-full border p-2 border-[#ffffff20] rounded-lg" />
              </label>
              
              <label>Role
                <input type="text" v-model="role" class="w-full border p-2 border-[#ffffff20] rounded-lg" />
              </label>
              <label class="col-span-2">Nouveau mot de passe
                <input type="password" v-model="password" autocomplete="new-password" placeholder="Laisser vide pour ne pas changer" class="w-full border p-2 border-[#ffffff20] rounded-lg" />
              </label>
              <div class="button primary px-4 py-2 border-[20px] border-[#ffffff20] bg-greenSpe hover:bg-green-500   transition-all duration-200 cursor-pointer lg:absolute relative lg:right-10 lg:m-0 mx-auto -mb-[100px]  lg:top-1/2 lg:-translate-y-1/2 w-[150Px] h-[150Px] flex items-center justify-center rounded-full">
                  <input
                    type="submit"
                    class=" cursor-pointer"
                    :value="loading ? 'Loading ...' : 'Update'"
                    :disabled="loading"
                  />
                  <Icon name='mingcute:badge-fill' class="ml-2 top-[0.15em] relative " />
                  
                  <div class="absolute border-[1px] h-full w-full scale-[1.2] rounded-full pointer-events-none opacity-20"></div>
                </div>
            </form>
  
          </PopoverContent>
        </Popover>
         <button
      @click="signOut"
      :disabled="loading"
        class="absolute z-10 h-full w-full"
      >
      </button>
      <Icon
        name="solar:login-line-duotone"
        class="scale-[1.5] left-3 mr-2 relative transition-all duration-400 hover:scale-100 hover:left-0"
      />
    </div>
</template>

<style>
.beforeLeft
{
  clip-path: polygon(0 0, 100% 0, 100% 5%, 98% 5%, 98% 95%, 100% 95%, 100% 100%, 0 100%);
}
</style>