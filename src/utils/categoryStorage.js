// Category storage utility using localStorage
const STORAGE_KEY = "admin_categories";

export const getCategories = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all categories are objects with id and name
      return parsed.map((cat, index) => {
        if (typeof cat === "string") {
          return { id: index + 1, name: cat };
        }
        return cat;
      });
    }
  } catch (error) {
    console.error("Error reading categories from storage:", error);
  }
  // Return default categories from blogPosts as objects
  return [
    { id: 1, name: "General" },
    { id: 2, name: "Cat" },
    { id: 3, name: "Inspiration" }
  ];
};

export const saveCategory = (category) => {
  try {
    const categories = getCategories();
    const existingIndex = categories.findIndex((c) => c.id === category.id);
    
    if (existingIndex >= 0) {
      // Update existing category
      categories[existingIndex] = category;
    } else {
      // Add new category
      const newId = categories.length > 0 
        ? Math.max(...categories.map((c) => c.id || 0)) + 1 
        : 1;
      categories.push({ 
        id: newId,
        name: category.name || category,
        createdAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    return category;
  } catch (error) {
    console.error("Error saving category:", error);
    throw error;
  }
};

export const deleteCategory = (id) => {
  try {
    const categories = getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

export const getCategoryById = (id) => {
  const categories = getCategories();
  return categories.find((c) => c.id === parseInt(id));
};
