/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { PostForm } from "../../components/PostForm/PostForm";
import { API_BASE_URL } from "../../config";
import { CircularProgress, Box } from "@mui/material";
import { useToast } from "../../context/ToastContext";
import { FormProvider } from "react-hook-form";

export function PostEditPage() {
  const { id } = useParams();

  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  // Set up react-hook-form
  const methods = useForm();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
    reset,
  } = methods;

  const [selectedCategory, setSelectedCategory] = useState(
    post?.categorySlug || ""
  );

  // Update selectedCategory when post loads
  useEffect(() => {
    if (post?.categorySlug) setSelectedCategory(post.categorySlug);
    // Optionally set other fields here if needed
  }, [post]);

  // Fetch post data by ID
  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/post/posts/id/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setPost(data.post);
          console.log("Fetched post data:", data.post);
          let content = data.post.content;
          if (typeof content === "string") {
            try {
              content = JSON.parse(content);
            } catch (e) {
              // If parsing fails, keep it as string or handle error
              console.error("Failed to parse content JSON:", e);
            }
          }
          // Call reset here with the correct field mapping
          reset({
            title: data.post.title || "",
            slug: data.post.slug || "",
            content: content || "",
            description: data.post.description || "",
            category: data.post.category?._id || data.post.category || "",
            categoryslug: data.post.categorySlug || "",
            subCategory:
              data.post.subCategory?._id || data.post.subCategory || "",
            subcategoryslug: data.post.subCategorySlug || "",
            tags: data.post.tags || "",
            status: data.post.status || "",
            isVisibleInCarousel: data.post.isVisibleInCarousel || false,
            showAdOnLinks: data.post.showAdOnLinks || false,
            type: data.post.type || "",
            publishedAt: data.post.publishedAt || "",
            imageUrl: data.post.imageUrl || "",
          });
        } else {
          showToast(data.message || "Failed to fetch post.", "error");
        }
      } catch (error) {
        showToast("Error fetching post.", "error");
        console.log("Post not found or error:", error);
      }
      setLoading(false);
    }
    fetchPost();
    // eslint-disable-next-line
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      // Append all fields except image
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "image") {
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }

          console.log(`Appending ${key}:`, JSON.stringify(value));
        }
      });

      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
      }

      const res = await fetch(`${API_BASE_URL}/api/post/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        showToast("Post updated successfully!", "success");
        // Optionally redirect or update UI
      } else {
        showToast(result.message || "Failed to update post.", "error");
      }
    } catch (err) {
      showToast("Error updating post.", "error");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <PostForm
        selectedCategory={watch("categorySlug")}
        setSelectedCategory={setSelectedCategory}
        onSubmit={onSubmit}
        post={post}
      />
    </FormProvider>
  );
}

export default PostEditPage;
