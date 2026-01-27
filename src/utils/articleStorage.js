// Article storage utility using localStorage
const STORAGE_KEY = "admin_articles";

export const getArticles = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading articles from storage:", error);
  }
  return [];
};

export const saveArticle = (article) => {
  try {
    const articles = getArticles();
    const existingIndex = articles.findIndex((a) => a.id === article.id);
    
    if (existingIndex >= 0) {
      // Update existing article
      articles[existingIndex] = article;
    } else {
      // Add new article
      const newId = articles.length > 0 
        ? Math.max(...articles.map((a) => a.id)) + 1 
        : 1;
      articles.push({ ...article, id: newId });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    return article;
  } catch (error) {
    console.error("Error saving article:", error);
    throw error;
  }
};

export const deleteArticle = (id) => {
  try {
    const articles = getArticles();
    const filtered = articles.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
};

export const getArticleById = (id) => {
  const articles = getArticles();
  return articles.find((a) => a.id === parseInt(id));
};
