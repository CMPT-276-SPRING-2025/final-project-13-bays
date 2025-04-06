import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

export default function FetchProjects({ userId, onProjectsFetched }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing. Please log in.");
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        // Reference to the Firestore collection
        const userProjectsRef = collection(db, `projects/${userId}/userProjects`);
        
        // Fetch all documents in the collection
        const querySnapshot = await getDocs(userProjectsRef);
        
        // Map the documents to an array of project data
        const fetchedProjects = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Pass the fetched projects to the parent component
        onProjectsFetched(fetchedProjects);
      } catch (err) {
        console.error("Error fetching projects from Firestore:", err);
        setError("Failed to fetch projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId, onProjectsFetched]);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>{error}</div>;
  return null;
}