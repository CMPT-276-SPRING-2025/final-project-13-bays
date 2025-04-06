"use client"

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config.js"; // Ensure Firestore is initialized in firebase-config.js
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default async function uploadProjectToFirestore({ userId, projectData, onSuccess = () => {}, onError = () => {} }) {
    try {
        if (!userId) {
            throw new Error("User ID is missing. Please log in.");
        }

        // Reference to the Firestore document
        const projectRef = doc(db, `projects/${userId}/userProjects`, projectData.id.toString());

        // Save the project data to Firestore
        await setDoc(projectRef, projectData);

        toast.success("Project saved successfully!");
        console.log("Project is saved to Firestore!");
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error("Error saving project to Firestore:", error);
        toast.error("Failed to save project. Please try again.");
        if (onError) onError(error);
    }
}