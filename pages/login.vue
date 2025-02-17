<script setup>
import { ref } from 'vue';
import { useNuxtApp } from '#app';
import { useRouter } from 'vue-router'; // Import the router
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from "vue-toastification";
const email = ref('');
const password = ref('');
const error = ref('');
const toast = useToast();
const { $auth } = useNuxtApp();
const router = useRouter();  // Initialize the router

const login = async () => {
    try {
        // Perform login
        await signInWithEmailAndPassword($auth, email.value, password.value);

        // Show success toast after successful login
        toast.success('Welcome back', {
            position: 'top-right',
            timeout: 3000,
        });

        // Redirect to the homepage after successful login
        router.push('/');  // This will push the user to the homepage
    } catch (err) {
        console.error("Login failed:", err);
        error.value = "Invalid email or password.";  // Display an error message

        // Show error toast if login fails
        toast.error('Invalid email or password.', {
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
