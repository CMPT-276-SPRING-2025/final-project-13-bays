import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { calculateTimeLeft } from "./CalculateTimeLeft"; // Import the utility function

export default function FetchProjectsFromFirestore({ userId, onProjectsFetched }) {
  useEffect(() => {
    if (!userId) {
      console.error("User ID is missing. Please log in.");
      return;
    }

    const fetchProjects = async () => {
      try {
        // Reference to the Firestore collection
        const userProjectsRef = collection(db, `projects/${userId}/userProjects`);

        // Fetch all documents in the collection
        const querySnapshot = await getDocs(userProjectsRef);

        // Map the documents to an array of project data
        const fetchedProjects = querySnapshot.docs.map((docSnapshot) => {
          const project = { id: docSnapshot.id, ...docSnapshot.data() };
          const timeLeft = calculateTimeLeft(project.dueDate); // Calculate timeLeft dynamically
          return { ...project, timeLeft }; // Add timeLeft to the project object for UI
        });

        // Pass the fetched projects to the parent component
        onProjectsFetched(fetchedProjects);
      } catch (error) {
        console.error("Error fetching projects from Firestore:", error);
      }
    };

    fetchProjects();
  }, [userId, onProjectsFetched]);

  return null; // This component does not render anything
}