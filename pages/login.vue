<script setup>
import { ref } from 'vue';
import { useNuxtApp } from '#app';  // Ensure you have access to $auth
import { useRouter } from 'vue-router'; // Import the router
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/store/user'; // Import the Pinia store

const email = ref('');
const password = ref('');
const error = ref('');
const toast = useToast();
const { $auth } = useNuxtApp(); // Access $auth that is provided by the Firebase plugin
const router = useRouter();  // Initialize the router
const userStore = useUserStore(); // Access the Pinia store

// Check if the user is already logged in, and if so, redirect
const auth = $auth;  // Using the injected $auth
if (auth.currentUser) {
  router.push('/'); // Redirect to home if user is already logged in
}

const login = async () => {
  try {
    // Perform login
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);

    // Get user data after successful login
    const user = userCredential.user;

    // Show success toast after successful login
    toast.success('Welcome back', {
      position: 'top-right',
      timeout: 3000,
    });

    // Update the Pinia store with the user data
    userStore.setUser({
      uid: user.uid,
      email: user.email,
      username: user.displayName,
      photoURL: user.photoURL,
    });

    // Store the user data in localStorage
    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      username: user.displayName,
      photoURL: user.photoURL,
    }));

    // Redirect to the homepage after successful login
    router.push('/');  // This will push the user to the homepage
  } catch (err) {
    console.error("Login failed:", err);

    let errorMessage = '';
    if (err.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email address.';
    } else if (err.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else {
      errorMessage = 'An error occurred. Please try again.';
    }

    error.value = errorMessage;  // Display an error message

    // Show error toast if login fails
    toast.error(errorMessage, {
      position: 'top-right',
      timeout: 3000,
    });
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full sm:w-96 p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold text-center text-stone-900 mb-6">Login</h1>

      <!-- Email Input -->
      <div class="mb-4">
        <label for="email" class="block text-stone-700 font-medium text-sm mb-2">Email</label>
        <input v-model="email" type="email" id="email" placeholder="Enter your email"
          class="w-full border border-stone-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <!-- Password Input -->
      <div class="mb-4">
        <label for="password" class="block text-stone-700 font-medium text-sm mb-2">Password</label>
        <input v-model="password" type="password" id="password" placeholder="Enter your password"
          class="w-full border border-stone-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>

      <div class="flex flex-col items-center">
        <!-- Login Button -->
        <button @click="login"
          class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
          Login
        </button>
      </div>
      <p class="text-center">Already got an account? <NuxtLink to="/register" class="text-orange-500">Signup</NuxtLink> here.</p>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
