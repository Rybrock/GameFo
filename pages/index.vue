<script setup>
import { useUserStore } from '@/store/user'; // Import the Pinia store
import { computed, watch, onMounted } from 'vue';

const userStore = useUserStore(); // Access the Pinia store

// On mount, check if user data exists in localStorage and only set it if Pinia is empty
onMounted(() => {
  if (!userStore.user) {
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      userStore.setUser(JSON.parse(userFromStorage)); // Set user data in Pinia store
    }
  }
});

// Create a computed property for the username (reactive to Pinia state)
const username = computed(() => userStore.user?.username || null);
console.log(username)
// Watch for changes in the store and update localStorage
watch(username, (newUsername) => {
  if (newUsername) {
    localStorage.setItem('user', JSON.stringify(userStore.user)); // Keep storage in sync
  }
});
</script>

<template>
  <div class="flex justify-center">
    <!-- Only show the username if it exists -->
    <h1 v-if="username">Welcome, <span class="font-bold">{{ username }}</span></h1>
    <p v-else>Loading...</p> <!-- Show loading if username is not available -->
  </div>
</template>
