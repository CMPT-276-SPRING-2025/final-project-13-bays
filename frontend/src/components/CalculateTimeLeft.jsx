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

    if (diffDays < 0) return `Past due (${diffDays} days )`
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 14) return "1 week left";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
    return `${Math.floor(diffDays / 30)} months left`;
  };

  export const calculateTimeSince = (completedDate) => {
    if (!completedDate) return "Invalid due date";
  
    const completion = new Date(completedDate);
    if (isNaN(completion.getTime())) return "Invalid due date";
  
    const now = new Date();
    const diffTime = now.getTime() - completion.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };