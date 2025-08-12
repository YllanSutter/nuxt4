<script setup lang="ts">
const userCookie = useCookie('user');
const user = computed(() => userCookie.value);
</script>

<template>
    <div>
      <ReglagesExport v-if="user"/>
      <Tableau v-if="user"/>
      <AccountLogin v-else />
    </div>
</template>