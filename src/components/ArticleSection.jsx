import { SearchIcon } from "lucide-react";
import { BlogCard } from "./BlogCard";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPost";
import { selectData } from "@/data/select";
import { apiClient } from "@/api/client";

import { useState, useMemo, useEffect } from "react";

function ArticleSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedSearchQuery, setSelectedSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter posts for search results dropdown (only by search term, ignores category)
  // Shows results immediately as user types (like Google)
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const searchLower = search.toLowerCase();
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchLower) ||
      post.description.toLowerCase().includes(searchLower) ||
      post.author.toLowerCase().includes(searchLower) ||
      post.category.toLowerCase().includes(searchLower)
    );
  }, [search, posts]);

  // Filter posts for BlogCard grid (by both search and category)
  // Only shows results when user selects from dropdown
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Filter by category
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      // Filter by selected search term (only shows when user selects from dropdown)
      const searchLower = selectedSearchQuery.toLowerCase();
      const matchesSearch =
        selectedSearchQuery === "" ||
        post.title.toLowerCase().includes(searchLower) ||
        post.description.toLowerCase().includes(searchLower) ||
        post.author.toLowerCase().includes(searchLower) ||
        post.category.toLowerCase().includes(searchLower);
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedSearchQuery, selectedCategory, posts]);

  // Fetch posts from Supabase API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await apiClient.get("/posts", {
          params: { page: 1, limit: 100 }, // Get more posts for filtering
        });
        
        // Map API response to BlogCard format
        const mappedPosts = data.posts.map((post) => ({
          id: post.id,
          title: post.title || "Untitled",
          image: post.image || "",
          category: post.category || (post.category_id ? `Category ${post.category_id}` : "Uncategorized"),
          description: post.description || "",
          author: post.author || "Admin",
          date: post.created_at 
            ? new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            : new Date().toLocaleDateString(),
        }));
        
        setPosts(mappedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Showing fallback data.");
        // Use fallback data if API fails
        setPosts(blogPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Reset selectedSearchQuery when search is cleared to show all posts (highlight page)
  useEffect(() => {
    if (!search.trim()) {
      setSelectedSearchQuery("");
    }
  }, [search]);

  return (
    <>
      <div className=" my-10 lg:mx-20">
        <p className="text-2xl font-semibold pl-3 py-4">Latest articles</p>
        <div className="flex flex-col justify-center items-center w-full py-10  bg-brown-200 lg:flex-row-reverse lg:h-[80px] lg:rounded-2xl lg:px-5">
          <div className="grid w-full px-5 lg:w-[560px] relative">
            <InputGroup>
              <InputGroupInput
                placeholder="Search"
                className="text-sm font-medium text-brown-600 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
            
            {/* Search Results Dropdown */}
            {search.trim() && searchResults.length > 0 && (
              <div className="absolute top-full left-5 right-5 mt-2 bg-white rounded-lg shadow-lg border border-brown-300 z-50 max-h-[400px] overflow-y-auto">
                <div className="divide-y divide-brown-200">
                  {searchResults.map((post) => (
                    <button
                      key={post.id}
                      className="w-full text-left block px-4 py-3 hover:bg-brown-50 transition-colors"
                      onClick={() => {
                        // Set selected search query to show results in BlogCard grid
                        setSelectedSearchQuery(post.title);
                        setSearch(post.title);
                      }}
                    >
                      <p className="text-sm font-medium text-brown-600">
                        {post.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-start items-start w-full pl-3">
            <p className="text-sm font-medium text-brown-400 lg:hidden pt-3 pb-1">
              Category
            </p>
          </div>
          <div className="lg:hidden  w-full px-5">
            <Select
              value={selectedCategory === "All" ? "Highlight" : selectedCategory}
              onValueChange={(value) =>
                setSelectedCategory(value === "Highlight" ? "All" : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder="Highlight"
                  className="text-sm font-medium"
                />
              </SelectTrigger>
              <SelectContent>
                {selectData.map((item, index) => (
                  <SelectItem key={index} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex max-lg:hidden gap-2">
            {selectData.map((item, index) => (
              <Button
                key={index}
                className={`hover:bg-brown-300 text-brown-500 cursor-pointer ${
                  selectedCategory === item ||
                  (item === "Highlight" && selectedCategory === "All")
                    ? "bg-brown-300"
                    : ""
                }`}
                onClick={() =>
                  setSelectedCategory(item === "Highlight" ? "All" : item)
                }
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="px-3 py-10 text-center">
          <p className="text-brown-600">Loading articles...</p>
        </div>
      ) : error ? (
        <div className="px-3 py-10 text-center">
          <p className="text-orange-500 text-sm">{error}</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="px-3 py-10 text-center">
          <p className="text-brown-400">No articles found.</p>
        </div>
      ) : (
        <div className="px-3 py-3 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:px-20">
          {filteredPosts.map((post) => (
            <BlogCard
              key={post.id}
              id={post.id}
              image={post.image}
              category={post.category}
              title={post.title}
              description={post.description}
              author={post.author}
              date={post.date}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default ArticleSection;
