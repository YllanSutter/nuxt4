<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Header avec le bouton de mode couleur -->
    <header class="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center justify-between px-4">
        <ColorModeToggle />
      </div>
    </header>
    
    <!-- Contenu principal -->
    <main class="container mx-auto px-4 py-8">
      <NuxtPage />
    </main>
  </div>
</template>