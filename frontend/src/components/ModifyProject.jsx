import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { toast } from "react-toastify";

export default async function modifyProjectInFirestore({ userId, projectId, updatedData, onSuccess = () => {}, onError = () => {} }) {
  try {
    if (!userId || !projectId) {
      throw new Error("User ID or Project ID is missing.");
    }

    // Reference to the Firestore document
    const projectRef = doc(db, `projects/${userId}/userProjects`, projectId);

    // Update the document with the new data
    await updateDoc(projectRef, updatedData);

    toast.success("Project updated successfully!");
    console.log("Project updated in Firestore!");
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error updating project in Firestore:", error);
    toast.error("Failed to update project. Please try again.");
    if (onError) onError(error);
  }
}