import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

/**
 * Saves tabs to Firestore for a specific project.
 * @param {string} userId - The user's ID.
 * @param {string} projectId - The project's ID.
 * @param {Array} tabs - An array of tab objects (each with `url` and `title`).
 * @returns {Promise<void>}
 */
export async function saveTabsToFirestore(userId, projectId, tabs) {
  try {
    if (!userId || !projectId) {
      throw new Error("User ID or Project ID is missing.");
    }

    if (!Array.isArray(tabs)) {
      throw new TypeError("Tabs must be an array of objects with `url` and `title` properties.");
    }

    console.log("tabs: ",tabs)

    const projectRef = doc(db, `projects/${userId}/userProjects`, projectId.toString());

    // Update the tabs field in Firestore
    await updateDoc(projectRef, { tabs });

    console.log("Tabs saved successfully to Firestore!");
  } catch (error) {

    console.error("Error saving tabs to Firestore:", error);
    throw error;
  }
}
/**
 * Retrieves tabs from Firestore for a specific project.
 * @param {string} userId - The user's ID.
 * @param {string} projectId - The project's ID.
 * @returns {Promise<Array>} - An array of tab objects (each with `url` and `title`).
 */
export async function getTabsFromFirestore(userId, projectId) {
  try {
    if (!userId || !projectId) {
      throw new Error("User ID or Project ID is missing.");
    }

    const projectRef = doc(db, `projects/${userId}/userProjects`, projectId.toString());
    const projectDoc = await getDoc(projectRef);

    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      return projectData.tabs || [];
    } else {
      console.warn("Project not found in Firestore.");
      return [];
    }
  } catch (error) {
    console.error("Error retrieving tabs from Firestore:", error);
    throw error;
  }
}