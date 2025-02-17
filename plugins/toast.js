import { defineNuxtPlugin } from '#app'; // For Nuxt 3
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css'; // Import the default CSS

export default defineNuxtPlugin((nuxtApp) => {
    const options = {
        // You can set your default options here
        position: 'top-right',
        timeout: 3000,
        closeButton: true,
        // Add other options as needed
    };

    // Use the Toast plugin globally
    nuxtApp.vueApp.use(Toast, options);
});