<script setup lang="ts">
const userCookie = useCookie('user');
const user = ref(userCookie.value);

// Watcher pour mettre à jour user quand le cookie change
watch(userCookie, (newValue) => {
  user.value = newValue;
}, { immediate: true });
</script>

<template>
    <div>
      <Tableau v-if="user"/>
      <AccountLogin v-else />
    </div>
</template>