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

  // Fetch post data by ID
  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/post/posts/id/${id}`, {
          credentials: "include"
        });
        const data = await res.json();
        console.log("Fetched post data:", data);

        if (data.success) {
          setPost(data.post);
        } else {
          showToast(data.message || "Failed to fetch post.", "error");
        }
      } catch (error) {
        showToast("Error fetching post.", "error");
      }
      setLoading(false);
    }
    fetchPost();
    // eslint-disable-next-line
  }, [id]);

  // Set up react-hook-form with defaultValues from post
  const methods = useForm({
    defaultValues: {}
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
    reset
  } = methods;

  const [selectedCategory, setSelectedCategory] = useState(
    post?.categorySlug || ""
  );

  // Update selectedCategory when post loads
  useEffect(() => {
    if (post?.categorySlug) setSelectedCategory(post.categorySlug);
    // Optionally set other fields here if needed
  }, [post]);

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        slug: post.slug,
        content: post.content,
        description: post.description,
        category: post.category?._id || post.category,
        categorySlug: post.categorySlug,
        subCategory: post.subCategory?._id || post.subCategory,
        subCategorySlug: post.subCategorySlug,
        tags: post.tags,
        status: post.status,
        isVisibleInCarousel: post.isVisibleInCarousel,
        type: post.type,
        publishedAt: post.publishedAt,
        imageUrl: post.imageUrl
      });
    }
  }, [post, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          formData.append("image", value);
        } else {
          formData.append(key, value);
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/post/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include"
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
