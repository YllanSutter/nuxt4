import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '~/assets/css/style.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['shadcn-nuxt', '@nuxtjs/color-mode', '@nuxt/icon'],
  colorMode: {
    preference: 'system', 
    fallback: 'light', 
    classSuffix: '', 
  },
  shadcn: {
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './app/components/ui'
  },
  runtimeConfig: {
    ITAD_CLIENT_ID: process.env.ITAD_CLIENT_ID,
    ITAD_CLIENT_SECRET: process.env.ITAD_CLIENT_SECRET,
    ITAD_API_KEY: process.env.ITAD_API_KEY,
  }
})