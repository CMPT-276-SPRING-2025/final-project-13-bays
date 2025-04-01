"use client"

import { ref, uploadBytesResumable } from "firebase/storage"
import { storage } from "../firebase-config.js"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function uploadProjectToFirebase({ userId, projectData, onSuccess = () => {}, onError = () => {} }) {
    try {
        // Convert project data to a JSON blob
        const projectBlob = new Blob([JSON.stringify(projectData)], {type: "application/json"})
        
        // Create reference in Firebase Storage
        const storageRef = ref(storage, `projects/${userId}/${projectData.id}.json`)

        // Upload the JSON file to Firebase Storage
        const uploadTask = uploadBytesResumable(storageRef, projectBlob)

        // Track upload progress and reset, close modal after finished
        uploadTask.on(
            "state_changed",
            //Upload progress
            (snapshot) => {
                const progress = (snapshot.bytesTransferred/snapshot.totalBytes)
                console.log(`Upload progress: ${progress.toFixed(2)}%`)
            },          
            // Errors
            (error) => {
                console.error("Error uploading project:", error);
                toast.error("Failed to save project. Please try again.");
                if (onError) onError(error);
            },
            // Saved succesfuly
            () => {
                toast.success("Project saved sucessfully!")
                console.log(`Project is saved!`)
                if (onSuccess) onSuccess()
            }
        )
    } catch (error) {
        console.error("Error saving project:", error)
        toast.error("Failed to save project. Please try again.")
        if (onError) onError(error);
    }
}