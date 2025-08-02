<script setup>
const loading = ref(false);
const name = ref('');
const id = ref('');
const budget = ref(0);
const active = ref(false);
const compteouvert = ref(false);
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
    
    // Fermer le panneau account
    compteouvert.value = false;
    
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
  <div class="buttonsAccount fixed top-0 right-2 z-40 transition-all duration-200 text-[11px] lg:text-[1em]">
    <div class="absolute bg-greenSpe  w-[160px] h-[160px] lg:w-[200px] lg:h-[200px] -top-[40px] -left-[15px] lg:-top-[70px] lg:-left-[30px] rounded-full"></div>
    <div class="absolute border-[1px] scale-110 z-10 w-[160px] h-[160px] lg:w-[200px] lg:h-[200px] -top-[40px] -left-[15px] lg:-top-[70px] lg:-left-[30px] rounded-full pointer-events-none opacity-40"></div>
    <div class="button primary flex items-center p-4 border-b-[1px] border-[#ffffff20]  min-w-full w-full transition-all duration-200 cursor-pointer relative group">
      <button
        @click="compteouvert = !compteouvert"
        :disabled="loading"
        class="absolute z-10 h-full w-full"
      >
      </button>
      <p class="mr-2 -left-1 group-hover:left-0 relative transition-all duration-400">Account</p> <Icon name='mingcute:badge-fill' class="scale-[1.5] left-3 group-hover:scale-[1] group-hover:left-[0] mr-2 relative  transition-all duration-400" />
    </div>

    <div class="button primary flex items-center p-4 border-none  min-w-full w-full transition-all duration-200 cursor-pointer relative group">
      <button
      @click="signOut"
      :disabled="loading"
        class="absolute z-10 h-full w-full"
      >
      </button>
      <Icon name='mingcute:exit-door-fill' class="scale-[1.5] left-3 group-hover:scale-[1] group-hover:left-[0] mr-2 relative  transition-all duration-400" />
      <p class="ml-2 left-2  group-hover:-left-2 relative transition-all duration-400">Sign Out</p>
    </div>
    
  </div>
  <form :class="['form-widget  bg-black text-white py-2 border-b border-[#ffffff20] fixed transition-all duration-200 z-30 h-svh w-full flex items-center justify-center',compteouvert? 'top-0':'-top-[120%] ']" @submit.prevent="updateUser">

    <div class="max-w-[1000px] mx-auto grid gap-3 px-8 justify-center lg:grid-cols-3 grid-cols-1  items-stretch">
      <div class="left col-span-2 grid lg:grid-cols-2 grid-cols-1 items-center content-center relative lg:pr-20">
        <div class="beforeLeft absolute h-full w-full scale-y-[1.2] scale-x-[1.3] left-10 border-[1px] border-[#ffffff50] rounded-xl lg:opacity-100 opacity-0"></div>
        <div class="beforeLeft absolute h-full w-[8Px] scale-y-[1] -left-[56px] bg-greenSpe skew-y-[40deg] lg:opacity-100 opacity-0"></div>
        <div class="relative lg:col-span-2 col-span-1 p-2">
          <label for="email" class="text-[11px]  absolute left-5 top-0 px-2 py-1 leading-none bg-greenSpe rounded-full inline-flex items-center z-[1]">Email</label>
          <input
            id="email"
            type="text"
            autocomplete="email"
            class="bg-transparent border-b border-t p-4 border-[#ffffff50] mb-2  min-w-full w-full"
            :value="user?.email || ''"
            disabled
          />
        </div>
        <div class="relative p-2">
          <label for="name" class="text-[11px]  absolute left-5 top-0 px-2 py-1 leading-none bg-greenSpe rounded-full inline-flex items-center z-[1]">Nom</label>
          <input
            id="name"
            autocomplete="username"
            type="text"
            class="bg-transparent border p-4 border-[#ffffff50] rounded-lg  min-w-full w-full"
            v-model="name"
          />
        </div>
        <div class="relative p-2">
          <label for="budget" class="text-[11px]  absolute left-5 top-0 px-2 py-1 leading-none bg-greenSpe rounded-full inline-flex items-center z-[1]">Budget Max</label>
          <input
            id="budget"
            type="number"
            class="bg-transparent border p-4 border-[#ffffff50] rounded-lg  min-w-full w-full"
            v-model="budget"
          />
        </div>
        <div class="relative p-2">
          <label for="password" class="text-[11px]  absolute left-5 top-0 px-2 py-1 leading-none bg-greenSpe rounded-full inline-flex items-center z-[1]">Nouveau mot de passe</label>
          <input
            id="password"
            type="password"
            class="bg-transparent border p-4 border-[#ffffff50] rounded-lg  min-w-full w-full"
            v-model="password"
            autocomplete="new-password"
            placeholder="Laisser vide pour ne pas changer"
          />
        </div>
        <div class="button primary px-4 py-2 border-[20px] border-black bg-greenSpe hover:bg-green-500   transition-all duration-200 cursor-pointer lg:absolute relative lg:-right-20 lg:m-0 mx-auto -mb-[100px]  lg:top-1/2 lg:-translate-y-1/2 w-[150Px] h-[150Px] flex items-center justify-center rounded-full">
          <input
            type="submit"
            class=" cursor-pointer"
            :value="loading ? 'Loading ...' : 'Update'"
            :disabled="loading"
          />
          <Icon name='mingcute:badge-fill' class="ml-2 top-[0.15em] relative " />
          
          <div class="absolute border-[1px] h-full w-full scale-[1.2] rounded-full pointer-events-none opacity-20"></div>
        </div>
      </div>
      <div class="rightImage ">
        <img src="../../assets/images/leaves.jpg" alt="leaves" class="object-cover lg:min-h-[400px] min-h-[200px] lg:h-full h-[200px] w-full ">
      </div>
    </div>
  </form>
</template>

<style>
.beforeLeft
{
  clip-path: polygon(0 0, 100% 0, 100% 5%, 98% 5%, 98% 95%, 100% 95%, 100% 100%, 0 100%);
}
</style>