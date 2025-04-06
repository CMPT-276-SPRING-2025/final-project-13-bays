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

            // Determine the category based on timeLeft and archived
            let category = project.category; // Default category
            if (project.category !== "Archived") {
              if (timeLeft === "Today" || timeLeft === "Tomorrow") {
                category = "Urgent";
              } else if (timeLeft.includes("days left") || timeLeft === "1 week left") {
                category = "Upcoming";
              } else {
                category = "Trivial";
              }
            }

            // Update Firestore if the category has changed
            if (project.category !== category) {
              await modifyProjectInFirestore({
                userId,
                projectId: project.id.toString(),
                updatedData: { category },
                onSuccess: () => console.log(`Category updated for project ${project.id}`),
                onError: (error) => console.error(`Error updating category for project ${project.id}:`, error),
              });
            }

            return { ...project, timeLeft, category }; // Add timeLeft and category to the project object
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