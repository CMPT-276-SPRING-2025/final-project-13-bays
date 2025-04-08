const { getFirestore, doc, setDoc, getDoc } = require("firebase-admin/firestore");
const db = getFirestore();

// Save tabs to Firestore
exports.saveTabs = async (req, res) => {
  const { userId, projectId } = req.params;
  const { tabs } = req.body;

  try {
    const projectRef = doc(db, `projects/${userId}/userProjects/${projectId}`);
    await setDoc(projectRef, { tabs }, { merge: true });

    res.status(200).json({ message: "Tabs saved successfully." });
  } catch (error) {
    console.error("Error saving tabs:", error);
    res.status(500).json({ error: "Failed to save tabs." });
  }
};

// Retrieve tabs from Firestore
exports.getTabs = async (req, res) => {
  const { userId, projectId } = req.params;

  try {
    const projectRef = doc(db, `projects/${userId}/userProjects/${projectId}`);
    const projectDoc = await getDoc(projectRef);

    if (projectDoc.exists) {
      const projectData = projectDoc.data();
      res.status(200).json({ tabs: projectData.tabs || [] });
    } else {
      res.status(404).json({ error: "Project not found." });
    }
  } catch (error) {
    console.error("Error retrieving tabs:", error);
    res.status(500).json({ error: "Failed to retrieve tabs." });
  }
};