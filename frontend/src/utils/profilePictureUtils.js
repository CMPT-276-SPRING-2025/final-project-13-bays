import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

/**
 * Handles the profile picture upload process.
 * @param {Event} e - The file input change event.
 * @param {Function} setProfilePicture - State setter for the profile picture.
 */
export const handleProfilePictureUpload = (e, setProfilePicture) => {
  const file = e.target.files[0];
  console.log("entered")
  if (!file) return;

  if (!file.type.match("image.*")) {
    toast.error("Please select an image file", {
      position: "top-center",
      autoClose: 3000,
      className: "font-passion-one text-xl",
      style: { backgroundColor: "#f44336", color: "white" },
    });
    console.log("wrong file selected")
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error("Profile picture must be less than 10MB", {
      position: "top-center",
      autoClose: 3000,
      className: "font-passion-one text-xl",
      style: { backgroundColor: "#f44336", color: "white" },
    });
    console.log("image file too big")
    return;
  }

  console.log("image set")
  setProfilePicture(file);
  uploadProfilePicture
  e.target.value = null; // Clear input value to allow re-uploads of the same file
};

/**
 * Uploads the profile picture to Firebase Storage.
 * @param {string} userId - The user's ID.
 * @param {File} file - The file to upload.
 * @param {Object} storage - Firebase storage instance.
 * @returns {Promise<string>} - The download URL of the uploaded file.
 */
export const uploadProfilePicture = async (userId, file, storage) => {
  if (!file) return null;

  const storageRef = ref(storage, `profileImages/${userId}/${Date.now()}-${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("File available at:", downloadURL);
        resolve(downloadURL);
      }
    );
  });
};

