"use client";

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config.js"; // Ensure Firestore is initialized in firebase-config.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default async function uploadProjectToFirestore({ userId, userName, userMail, projectData, onSuccess = () => {}, onError = () => {},}) {
  try {
    if (!userId) {
      throw new Error("User ID is missing. Please log in.");
    }

    // Reference to the Firestore document
    const projectRef1 = doc(db, `projects/${userId}/userProjects`, projectData.id.toString());
    // Reference to the Firestore document
    const projectRef2 = doc(db, `projects/${userId}`,);

    // Data to upload
    const dataToUpload1 = {
      ...projectData,
    };
    const dataToUpload2 = {
        userName,
        userMail, 
      };

    // Save the data to Firestore
    await setDoc(projectRef1, dataToUpload1);
    await setDoc(projectRef2, dataToUpload2);

    console.log("Project is saved to Firestore!");
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error saving project to Firestore:", error);
    if (onError) onError(error);
  }
}