<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user'; // Pinia store to get user data
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore'; // Import updateDoc
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase storage imports
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { useNuxtApp } from '#app';

const toast = useToast();
const router = useRouter();
const { $auth } = useNuxtApp();

const userStore = useUserStore();
const user = ref(userStore.user);

// Retrieve user data from localStorage if it exists
onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    userStore.setUser(JSON.parse(storedUser)); // Set user data in Pinia store if it exists in localStorage
    user.value = userStore.user; // Ensure the ref gets updated with the user data from Pinia
  }
});

const newUsername = ref(user.value ? user.value.username : ''); // Initialize with current username or empty
const profileImage = ref(null); // Store the selected profile image
const profileImageUrl = ref(user.value?.photoURL); // Retrieve the existing photo URL if available

// Handle the username update
const updateUsername = async () => {
  console.log("Updating username...");

  // Check if user is not available
  if (!user.value) {
    toast.error('User not found. Please log in again.');
    console.log("User is not available.");
    return;
  }

  // Validate the new username
  if (!newUsername.value || newUsername.value.trim() === '') {
    toast.error('Username cannot be empty');
    console.log("Username is empty.");
    return;
  }

  try {
    const auth = getAuth();
    const db = getFirestore();

    // Check if the user is logged in
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    console.log("Updating Firebase Authentication...");
    // Update the username in Firebase Authentication
    await updateProfile(auth.currentUser, { displayName: newUsername.value });

    console.log("Updating Firestore...");
    // Reference the user document using `uid` as the document ID
    const userRef = doc(db, 'users', user.value.uid);

    // Update the user document in Firestore
    await updateDoc(userRef, {
      username: newUsername.value,
    });

    console.log("Updating Pinia store...");
    // Update the Pinia store with the new username
    userStore.setUser({ ...user.value, username: newUsername.value });

    // ✅ **Update localStorage to keep data consistent**
    localStorage.setItem('user', JSON.stringify(userStore.user));

    // Show a success toast
    toast.success('Username updated successfully!');
    console.log("Username updated successfully!");
  } catch (error) {
    toast.error('Failed to update username');
    console.error(error);
  }
};

// Handle file selection for profile image
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    profileImage.value = file; // Store the selected file
  }
};

// Upload profile image to Firebase Storage
const uploadImage = async () => {
  if (!profileImage.value) {
    toast.error('Please select an image first');
    return;
  }

  try {
    const auth = getAuth();
    const storage = getStorage();
    const db = getFirestore();

    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const fileRef = storageRef(storage, `profile_images/${auth.currentUser.uid}`);
    const uploadTask = uploadBytesResumable(fileRef, profileImage.value);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast.error('Failed to upload image');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref); // Corrected this part
        profileImageUrl.value = downloadURL; // Update the displayed image immediately

        // Update Firebase Authentication profile image
        await updateProfile(auth.currentUser, { photoURL: downloadURL });

        // Update Firestore with the image URL
        const userRef = doc(db, 'users', user.value.uid);
        await updateDoc(userRef, { photoURL: downloadURL });

        // Update Pinia store with the new photoURL
        userStore.setUser({ ...user.value, photoURL: downloadURL });

        // Update localStorage to keep data consistent
        localStorage.setItem('user', JSON.stringify(userStore.user));

        toast.success('Profile image uploaded successfully!');
      }
    );
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while uploading the image.');
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div class="w-full sm:w-96 p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold text-center text-stone-900 mb-6">
        Profile for {{ user?.username || 'User' }}
      </h1>

      <!-- Profile Image Section -->
      <div class="flex flex-col items-center mb-4">
        <img
          :src="profileImageUrl"
          alt="Profile"
          class="w-24 h-24 rounded-full object-cover mb-2 border border-gray-300 shadow-md"
        />
        <input type="file" @change="handleFileChange" class="mb-2">
        <button
          @click="uploadImage"
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Upload Profile Image
        </button>
      </div>

      <!-- Username Input -->
      <div class="mb-4">
        <label for="username" class="block text-stone-700 font-medium text-sm mb-2">Username</label>
        <input
          v-model="newUsername"
          type="text"
          id="username"
          placeholder="Enter your new username"
          class="w-full border border-stone-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Update Username Button -->
      <div class="flex justify-center">
        <button
          @click="updateUsername"
          class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        >
          Update Username
        </button>
      </div>

      <p class="text-center mt-4">
        <NuxtLink to="/" class="text-orange-500">Go back to home</NuxtLink>
      </p>
    </div>
  </div>
</template>
