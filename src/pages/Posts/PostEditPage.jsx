import { useEffect, useState, useRef, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useParams, useNavigate, useLocation, useBlocker } from "react-router-dom";
import { PostForm } from "../../components/PostForm/PostForm";
import { API_BASE_URL } from "../../config";
import { CircularProgress, Box } from "@mui/material";
import { useToast } from "../../context/ToastContext";
import { UnsavedChangesDialog } from "../../components/UnsavedChangesDialog/UnsavedChangesDialog";

export function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const isSubmittedRef = useRef(false);

  // Set up react-hook-form
  const methods = useForm();
  const { reset, getValues } = methods;

  // Helper to check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (isSubmittedRef.current || !post) return false;
    return methods.formState.isDirty;
  }, [methods.formState.isDirty, post]);

  // Block route transitions when dirty
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSubmittedRef.current &&
      hasUnsavedChanges() &&
      currentLocation.pathname !== nextLocation.pathname
  );

  // Protect against tab closing / reload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmittedRef.current && hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
          let content = data.post.content;
          if (typeof content === "string") {
            try {
              content = JSON.parse(content);
            } catch (e) {
              console.error("Failed to parse content JSON:", e);
            }
          }
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
            sendNotification: data.post.sendNotification || false,
            isPageBlockEnabled: data.post.isPageBlockEnabled || false,
            pageBlockPercentage: data.post.pageBlockPercentage || "",
            type: data.post.type || "",
            publishedAt: data.post.publishedAt || "",
            imageUrl: data.post.imageUrl || "",
            image: null,
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

  const handleSaveAsDraft = async () => {
    try {
      setIsSavingDraft(true);
      const data = getValues();
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "image") {
          if (key === "tags") {
            const tagsVal = Array.isArray(value) ? value : [];
            formData.append(key, JSON.stringify(tagsVal));
          } else if (value === null || value === undefined) {
            formData.append(key, "");
          } else if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      formData.set("status", "draft");

      const imageFile = data.image || getValues("image");
      if (imageFile && imageFile instanceof File) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/post/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        showToast("Post saved as draft successfully!", "success");
        isSubmittedRef.current = true;
        if (blocker.state === "blocked") {
          blocker.proceed();
        } else {
          navigate("/posts", { state: location.state });
        }
      } else {
        showToast(result.message || "Failed to save post as draft.", "error");
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      showToast("Error saving draft: " + err.message, "error");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      // Append all fields except image
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "image") {
          if (key === "tags") {
            const tagsVal = Array.isArray(value) ? value : [];
            formData.append(key, JSON.stringify(tagsVal));
          } else if (value === null || value === undefined) {
            formData.append(key, "");
          } else if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      // Ensure image file is properly extracted from data or form values
      const imageFile = data.image || getValues("image");
      if (imageFile && imageFile instanceof File) {
        formData.append("image", imageFile);
      } else if (data.imageUrl === "" || !data.imageUrl) {
        formData.append("removeImage", "true");
      }

      if (post?.isVisibleInCarousel === true && !data.isVisibleInCarousel) {
        formData.append("skipTimestampUpdate", "true");
      }

      const res = await fetch(`${API_BASE_URL}/api/post/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        isSubmittedRef.current = true;
        showToast("Post updated successfully!", "success");
        navigate("/posts", { state: location.state });
      } else {
        showToast(result.message || "Failed to update post.", "error");
      }
    } catch (err) {
      console.error("Error updating post:", err);
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
        onSubmit={onSubmit}
        onSaveDraft={handleSaveAsDraft}
        isSavingDraft={isSavingDraft}
        post={post}
      />

      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        title="Save Post as Draft?"
        message="You have unsaved changes in this post. Would you like to save it as a draft before leaving?"
        onSaveDraft={handleSaveAsDraft}
        onDiscard={() => {
          isSubmittedRef.current = true;
          if (blocker.state === "blocked") blocker.proceed();
        }}
        onCancel={() => {
          if (blocker.state === "blocked") blocker.reset();
        }}
        isSaving={isSavingDraft}
      />
    </FormProvider>
  );
}

export default PostEditPage;
