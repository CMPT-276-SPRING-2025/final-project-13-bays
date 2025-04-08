/**
 * Calculates the time left until a given due date.
 * @param {string} dueDate - The due date in string format (e.g., "YYYY-MM-DD").
 * @returns {string} - A human-readable string representing the time left.
 */
export const calculateTimeLeft = (dueDate) => {
    if (!dueDate) return "Invalid due date";
  
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return "Invalid due date";
  
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 14) return "1 week left";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
    return `${Math.floor(diffDays / 30)} months left`;
  };