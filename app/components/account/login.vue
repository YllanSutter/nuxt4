<script setup>
const loading = ref(false);
const showLogin = ref(true);
const signupForm = ref({ email: '', password: '', name: '', budget: 0 });
const loginForm = ref({ email: '', password: '' });
const errorMessage = ref('');
const router = useRouter();

// Utiliser le composable d'authentification
const { login, signup } = useAuth();


const {
  roles,
  labels
} = useTableauData(['role', 'label']);

const handleSignup = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    await signup({
      email: signupForm.value.email,
      password: signupForm.value.password,
      name: signupForm.value.name,
      budget: signupForm.value.budget,
      roles : roles,
      labels : labels
    });

    alert('Compte créé avec succès !');
    showLogin.value = true; 
    
    // Réinitialiser le formulaire
    signupForm.value = { email: '', password: '', name: '', budget: 0 };
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    await login(loginForm.value.email, loginForm.value.password);
    
    // Rediriger vers la page d'accueil
    router.push('/');
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bg-teal-950 h-svh grid items-center justify-center relative content-center">
    <div class="bgfond loginFond"></div>
    <div class="font-['Oswald'] wrapTitle lg:text-9xl md:text-5xl sm:text-4xl text-white font-bold text-center absolute top-1/3 left-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20">
      Steam Utilities
    </div>
    <div class="formWrap w-full max-w-lg mx-auto p-10 z-10">
      <div class="choix">
        <div class="flex gap-1">
            <button @click="showLogin = true" :class="['text-white px-4 py-2 rounded-lg rounded-b-none', showLogin ? 'bg-teal-900' : 'bg-transparent']">
              Connexion
              <Icon :name="showLogin ? 'mingcute:arrow-down-circle-fill' : 'mingcute:arrow-down-circle-line'" class="ml-2 top-[0.15em] relative text-white" />
            </button>
          <button @click="showLogin = false" :class="['text-white px-4 py-2 rounded-lg rounded-b-none', !showLogin? 'bg-teal-900':'bg-transparent']">
            Inscription
            <Icon :name="!showLogin ? 'mingcute:arrow-down-circle-fill' : 'mingcute:arrow-down-circle-line'" class="ml-2 top-[0.15em] relative text-white" />
          </button>
        </div>
      </div>
      <div class="wrapForm bg-teal-900 p-4 py-6 pr-10 rounded-lg rounded-t-none shadow-lg relative">
        <form @submit.prevent="handleSignup" v-if="!showLogin" class="grid grid-cols-2 gap-4">
          <input v-model="signupForm.email" type="email" placeholder="Email" required class="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] bg-transparent border-b border-[#ffffff30] px-4 py-1  text-white focus:outline-none focus:ring-0 focus:border-none  mr-1" />
          <input v-model="signupForm.password" type="password" placeholder="Mot de passe" required class="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] bg-transparent border-b border-[#ffffff30] px-4 py-1  text-white focus:outline-none focus:ring-0 focus:border-none  mr-1"/>
          <input v-model="signupForm.name" placeholder="Nom" class="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] bg-transparent border-b border-[#ffffff30] px-4 py-1  text-white focus:outline-none focus:ring-0 focus:border-none  mr-1"/>
          <input v-model.number="signupForm.budget" type="number" step="0.01" placeholder="Budget max" class="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] bg-transparent border-b border-[#ffffff30] px-4 py-1  text-white focus:outline-none focus:ring-0 focus:border-none  mr-1"/>

          <button :disabled="loading" class="absolute -right-[20px] top-1/2 -translate-y-1/2 bg-greenSpe rounded-full grid items-center justify-center text-center h-10 w-10 hover:bg-green-500 transition duration-200 ease-in-out">
            <Icon name="mingcute:arrow-right-up-fill" class="mr-1  text-white "/>
          </button>
        </form>

        <form @submit.prevent="handleLogin" class="grid grid-cols-2 gap-4" v-else>
          <input v-model="loginForm.email" type="email" placeholder="Email" required class="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] bg-transparent border-b border-[#ffffff30] px-4 py-1  text-white focus:outline-none focus:ring-0 focus:border-none  mr-1"/>
          <input v-model="loginForm.password" type="password" placeholder="Mot de passe" required class="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] bg-transparent border-b border-[#ffffff30] px-4 py-1  text-white focus:outline-none focus:ring-0 focus:border-none  mr-1"/>

          <button :disabled="loading" class="absolute -right-[20px] top-1/2 -translate-y-1/2 bg-greenSpe rounded-full grid items-center justify-center text-center h-10 w-10 hover:bg-green-500  transition duration-200 ease-in-out">
            <Icon name="mingcute:arrow-right-up-fill" class="mr-1  text-white "/>
          </button>
        </form>
      </div>
    </div>

  <p v-if="errorMessage" class="text-white z-20 text-center">{{ errorMessage }}</p>
</div>
</template>

<style scoped>
  .wrapForm,.choix button:not(.bg-transparent) {
    background: rgb(19 78 74 / 41%); 
    backdrop-filter: blur(10px); 
    -webkit-backdrop-filter: blur(10px); 
    border: 1px solid rgba(255, 255, 255, 0.2); 
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  }
  .choix button:not(.bg-transparent)
  {
    border-bottom: none;
  }
  .wrapTitle
  {
    max-width: 40vw;
    z-index: 2;
    background-image: url('/assets/images/leaves.jpg');
    background-size: 50%;
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2); 
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
    text-transform: uppercase;
    color: #ffffff20;
    -webkit-background-clip: text;
    background-clip: text;
    letter-spacing: 1vw;
    opacity: 0.35;
  }
</style>