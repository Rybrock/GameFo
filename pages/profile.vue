<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import { useNuxtApp } from '#app';

const toast = useToast();
const router = useRouter();
const { $auth } = useNuxtApp();

const userStore = useUserStore();
const user = ref(userStore.user);

const newUsername = ref(user.value ? user.value.username : '');
const profileImage = ref(null);
const profileImageUrl = ref(user.value?.photoURL || '/default-avatar.png');
const userDocId = ref(null); // Store Firestore document ID

// Load user data when component mounts
onMounted(async () => {
  const auth = getAuth();
  if (!auth.currentUser) return;

  // Set profile image if exists in Firebase Auth
  if (auth.currentUser?.photoURL) {
    profileImageUrl.value = auth.currentUser.photoURL;
  }

  // Fetch Firestore user document
  const db = getFirestore();
  const userQueryRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userQueryRef);

  if (userDoc.exists()) {
    userDocId.value = userDoc.id; // Store correct Firestore document ID
    const userData = userDoc.data();
    newUsername.value = userData.username || '';
    profileImageUrl.value = userData.photoURL || '/default-avatar.png';
  }
});

// Handle file selection
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    profileImage.value = file;
  }
};

// Upload profile image
const uploadImage = async () => {
  if (!profileImage.value) {
    toast.error('Please select an image first');
    return;
  }

  try {
    const auth = getAuth();
    const storage = getStorage();
    const db = getFirestore();

    if (!auth.currentUser || !userDocId.value) {
      throw new Error('User not authenticated or Firestore document ID missing');
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
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        profileImageUrl.value = downloadURL; // Update the displayed image immediately

        await updateProfile(auth.currentUser, { photoURL: downloadURL });

        const userRef = doc(db, 'users', userDocId.value);
        await updateDoc(userRef, { photoURL: downloadURL });

        userStore.setUser({ ...user.value, photoURL: downloadURL });

        // Update localStorage to keep data consistent
        localStorage.setItem('user', JSON.stringify(userStore.user));

        toast.success('Profile image updated successfully!');
      }
    );
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while uploading the image.');
  }
};

// Update username and sync everywhere
const updateUsername = async () => {
  if (!newUsername.value.trim()) {
    toast.error('Username cannot be empty');
    return;
  }

  try {
    const auth = getAuth();
    const db = getFirestore();

    if (!auth.currentUser || !userDocId.value) {
      throw new Error('User not authenticated or Firestore document ID missing');
    }

    // Update Firebase Authentication username
    await updateProfile(auth.currentUser, { displayName: newUsername.value });

    // Update Firestore username
    const userRef = doc(db, 'users', userDocId.value);
    await updateDoc(userRef, { username: newUsername.value });

    // Update the Pinia store immediately
    userStore.setUser({ ...user.value, username: newUsername.value });

    // ✅ **Update localStorage to keep data consistent**
    localStorage.setItem('user', JSON.stringify(userStore.user));

    toast.success('Username updated successfully!');
  } catch (error) {
    console.error(error);
    toast.error('Failed to update username.');
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div class="w-full sm:w-96 p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold text-center text-stone-900 mb-6">
        Profile for {{ user?.username || 'User' }}
      </h1>

      <!-- Profile Image -->
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
