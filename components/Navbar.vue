<script setup>
import { ref, onMounted } from 'vue';
import { useNuxtApp } from '#app';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const isOpen = ref(false);
const isDarkMode = ref(false);
const isLoggedIn = ref(false);  // Track if the user is logged in

// Access the Firebase auth service
const { $auth } = useNuxtApp();

// Load theme preference on mount
onMounted(() => {
    isDarkMode.value = localStorage.getItem('theme') === 'dark';
    document.documentElement.classList.toggle('dark', isDarkMode.value);

    // Check if the user is logged in
    onAuthStateChanged($auth, (user) => {
        isLoggedIn.value = !!user;  // Set isLoggedIn to true if user is authenticated
    });
});

// Toggle dark mode
const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// Logout function
const logout = async () => {
    try {
        await signOut($auth); // Sign out the user from Firebase
        console.log("Logged out successfully");
        // Redirect to login page or home after logout
        window.location.href = "/login";
    } catch (error) {
        console.error("Logout failed:", error);
    }
};
</script>

<template>
    <div class="flex justify-between p-2">
        <NuxtLink to="/">
            <p>GameFo</p>
        </NuxtLink>
        <div class="flex gap-3">

            <!-- Menu toggle -->
            <UIcon name="i-heroicons:list-bullet-16-solid"
                class="w-7 h-7 text-slate-900 dark:text-white font-bold cursor-pointer" @click="isOpen = true" />
        </div>

        <USlideover v-model="isOpen">
            <!-- Dark Mode toggle -->
            <div class="p-3 flex justify-between">
                <UIcon :name="isDarkMode ? 'i-heroicons:moon' : 'i-heroicons:sun'"
                    class="w-7 h-7 cursor-pointer text-slate-900 dark:text-white" @click="toggleDarkMode" />
            </div>
            <!-- Menu -->
            <div class="p-4 flex-1">
                <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-16-solid"
                    class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="isOpen = false" />
                <div class="flex flex-col gap-3">
                    <NuxtLink to="/" @click="isOpen = false"
                        class="flex items-center gap-2 hover:bg-orange-300 hover:text-slate-900 w-4/12 rounded-lg p-1">
                        <UIcon name="i-heroicons:home-20-solid"
                            class="w-7 h-7 cursor-pointer text-slate-900 dark:text-white" />
                        Home
                    </NuxtLink>
                    <NuxtLink v-if="isLoggedIn" to="/profile" @click="isOpen = false"
                    class="flex items-center gap-2 hover:bg-orange-300 hover:text-slate-900 w-8/12 rounded-lg p-1">
                    <UIcon name="i-heroicons:user-16-solid"
                        class="w-7 h-7 cursor-pointer text-slate-900 dark:text-white" />
                    Profile
                </NuxtLink>

                    <!-- Conditionally show these links based on if the user is logged in or not -->
                    <template v-if="!isLoggedIn">
                        <NuxtLink to="/register" @click="isOpen = false"
                            class="flex items-center gap-2 hover:bg-orange-300 hover:text-slate-900 w-4/12 rounded-lg p-1">
                            <UIcon name="i-heroicons:user-plus-16-solid"
                                class="w-7 h-7 cursor-pointer text-slate-900 dark:text-white" />
                            Signup
                        </NuxtLink>
                        <NuxtLink to="/login" @click="isOpen = false"
                            class="flex items-center gap-2 hover:bg-orange-300 hover:text-slate-900 w-8/12 rounded-lg p-1">
                            <UIcon name="i-heroicons:arrow-left-end-on-rectangle-20-solid"
                                class="w-7 h-7 cursor-pointer text-slate-900 dark:text-white" />
                            Login
                        </NuxtLink>
                      
                    </template>

                   
                </div>
                 
            </div>
            <!-- Show the logout link if the user is logged in -->
            <template v-if="isLoggedIn">
                <div class="flex justify-center">
                    <button @click="logout" class="flex items-center justify-center gap-2 bg-red-300 hover:bg-red-500 text-white rounded-lg p-2 mb-2">
                        <UIcon name="i-heroicons:arrow-left-start-on-rectangle-16-solid"
                            class="w-7 h-7 cursor-pointer text-white" />
                        Logout
                    </button>
                </div>
         
            </template>
            <!-- <p class="text-lg text-center p-2">Powered By <NuxtLink to="https://rawg.io/" target="blank"
                    class="font-bold">RAWG</NuxtLink>
            </p> -->
        </USlideover>
    </div>
</template>
