import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { toast } from "react-toastify";

export default async function deleteProjectFromFirestore({ userId, projectId, onSuccess = () => {}, onError = () => {} }) {
  try {
    if (!userId || !projectId) {
      throw new Error("User ID or Project ID is missing.");
    }

    // Reference to the Firestore document
    const projectRef = doc(db, `projects/${userId}/userProjects`, projectId)

    // Delete the document
    await deleteDoc(projectRef);

    toast.success("Project deleted successfully!");
    console.log("Project deleted from Firestore!");
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error deleting project from Firestore:", error);
    toast.error("Failed to delete project. Please try again.");
    if (onError) onError(error);
  }
}