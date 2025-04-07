import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { calculateTimeLeft } from "./CalculateTimeLeft"; // Import the utility function
import modifyProjectInFirestore from "./ModifyProject"; // Import the modify function

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
        const fetchedProjects = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const project = { id: docSnapshot.id, ...docSnapshot.data() };
            const timeLeft = calculateTimeLeft(project.dueDate); // Calculate timeLeft dynamically
            const alert = timeLeft === "Today"; // Set alert to true if timeLeft is "Today"

            // Determine the category based on timeLeft and archived
            let systemCategory = project.systemCategory; // Default category
            if (project.systemCategory !== "Completed") {
              if (timeLeft === "Today" || timeLeft === "Tomorrow" || timeLeft.includes("days left")) {
                systemCategory = "Urgent";
              } else if (timeLeft === "1 week left" || timeLeft.includes("weeks left") ) {
                systemCategory = "Upcoming";
              } else {
                systemCategory = "Trivial";
              } 
            }

            // Update Firestore if the category or alert has changed
            if (project.systemCategory !== systemCategory || project.alert !== alert) {
              await modifyProjectInFirestore({
                userId,
                projectId: project.id.toString(),
                updatedData: { systemCategory, alert },
                onSuccess: () => console.log(`Project ${project.id} updated successfully!`),
                onError: (error) => console.error(`Error updating project ${project.id}:`, error),
              });
            }

            return { ...project, timeLeft, systemCategory, alert }; // Add timeLeft, category, and alert to the project object
          })
        );

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