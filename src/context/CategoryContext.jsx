import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({}); // { [slug]: [...] }
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await axios.get(`${API_BASE_URL}/api/category/all`);
      setCategories(response.data.categories);
    };

    fetchCategories();
  }, []);

  const loadSubcategories = useCallback(
    async (categorySlug) => {
      if (subcategories[categorySlug]) return; // already fetched

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/category/all-subcategories/${categorySlug}`
        );
        setSubcategories((prev) => ({
          ...prev,
          [categorySlug]: response.data.subcategories
        }));
      } catch (error) {
        console.error("Failed to fetch subcategories:", error.message);
      }
    },
    [subcategories]
  );

  return (
    <CategoryContext.Provider
      value={{ categories, subcategories, loadSubcategories }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
