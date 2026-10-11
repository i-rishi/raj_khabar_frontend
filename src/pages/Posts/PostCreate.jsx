/* eslint-disable no-unused-vars */
// Inside PostCreate.jsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PostForm } from "../../components/PostForm/PostForm";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../config";
import { useNavigate, useLocation, useBlocker } from "react-router-dom";
import { UnsavedChangesDialog } from "../../components/UnsavedChangesDialog/UnsavedChangesDialog";
import { Alert, Box, Button, Typography } from "@mui/material";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";

const LOCAL_STORAGE_DRAFT_KEY = "raj_khabar_post_create_draft";

export function PostCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = useForm({
    defaultValues: {
      categoryslug: location.state?.category || "",
      subcategoryslug: location.state?.subcategory || ""
    }
  });
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
    reset,
    getValues
  } = methods;
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [savedDraft, setSavedDraft] = useState(null);

  const isSubmittedRef = useRef(false);

  // Helper to check if the user has entered meaningful unsaved content
  const hasUnsavedChanges = useCallback(() => {
    if (isSubmittedRef.current) return false;
    const values = getValues();
    const hasTitle = Boolean(values.title && values.title.trim().length > 0);
    const hasDesc = Boolean(values.description && values.description.trim().length > 0);
    const hasContent = Boolean(
      values.content && (
        typeof values.content === "string"
          ? values.content.trim().length > 0 && values.content !== "<p></p>"
          : (values.content.content && values.content.content.length > 0)
      )
    );
    const hasCategory = Boolean(
      values.categoryslug && values.categoryslug !== (location.state?.category || "")
    );
    const hasSubcategory = Boolean(
      values.subcategoryslug && values.subcategoryslug !== (location.state?.subcategory || "")
    );
    const hasImage = Boolean(values.image);
    const hasTags = Array.isArray(values.tags) && values.tags.length > 0;

    return Boolean(hasTitle || hasDesc || hasContent || hasCategory || hasSubcategory || hasImage || hasTags);
  }, [getValues, location.state]);

  // Block route changes if there is unsaved work
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSubmittedRef.current &&
      hasUnsavedChanges() &&
      currentLocation.pathname !== nextLocation.pathname
  );

  // Protect against closing or reloading browser tab
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

  // Check localStorage for an unsaved draft from a previous session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.title || parsed.content)) {
          setSavedDraft(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load local draft:", e);
    }
  }, []);

  // Debounced auto-save to localStorage as backup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSubmittedRef.current && hasUnsavedChanges()) {
        try {
          const values = getValues();
          // Store stringifiable draft fields (exclude binary File)
          const draftToSave = {
            title: values.title || "",
            slug: values.slug || "",
            description: values.description || "",
            content: values.content || null,
            categoryslug: values.categoryslug || "",
            subcategoryslug: values.subcategoryslug || "",
            tags: values.tags || [],
            savedAt: new Date().toISOString()
          };
          localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draftToSave));
        } catch (e) {
          console.warn("Could not auto-save local draft:", e);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [watch, getValues, hasUnsavedChanges]);

  const handleRestoreDraft = () => {
    if (!savedDraft) return;
    reset({
      ...getValues(),
      title: savedDraft.title || "",
      slug: savedDraft.slug || "",
      description: savedDraft.description || "",
      content: savedDraft.content || null,
      categoryslug: savedDraft.categoryslug || "",
      subcategoryslug: savedDraft.subcategoryslug || "",
      tags: savedDraft.tags || []
    });
    setSavedDraft(null);
    showToast("Unsaved draft restored successfully!", "success");
  };

  const handleDismissDraft = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
    } catch (_) {}
    setSavedDraft(null);
  };

  // Save current work to backend as status: "draft"
  const handleSaveAsDraft = async () => {
    const data = getValues();
    const title = (data.title || "").trim();
    const content = data.content;
    const categoryslug = data.categoryslug;
    const subcategoryslug = data.subcategoryslug;

    // Validate required fields needed by backend createPost
    if (!title) {
      showToast("Please enter a Title to save this post as draft.", "warning");
      return false;
    }
    if (!categoryslug || !subcategoryslug) {
      showToast("Please select a Category and Subcategory to save this post as draft.", "warning");
      return false;
    }
    if (
      !content ||
      (typeof content === "string" && (!content.trim() || content === "<p></p>")) ||
      (typeof content === "object" && (!content.content || content.content.length === 0))
    ) {
      showToast("Please enter some Content to save this post as draft.", "warning");
      return false;
    }

    try {
      setIsSavingDraft(true);
      const formData = new FormData();

      const slug =
        (data.slug || "").trim() ||
        title
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "")
          .replace(/_+/g, "_")
          .replace(/^_+|_+$/g, "");

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

      // Explicitly set draft status and slug
      formData.set("status", "draft");
      formData.set("slug", slug);

      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await fetch(`${API_BASE_URL}/api/post/create-post`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const result = await response.json();

      if (result.success) {
        showToast("Post saved as draft successfully!", "success");
        isSubmittedRef.current = true;
        try {
          localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        } catch (_) {}

        if (blocker.state === "blocked") {
          blocker.proceed();
        } else {
          navigate("/posts", { state: location.state });
        }
        return true;
      } else {
        showToast(result.message || "Failed to save post as draft.", "error");
        return false;
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      showToast("Error saving draft: " + error.message, "error");
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDiscard = () => {
    isSubmittedRef.current = true;
    try {
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
    } catch (_) {}
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  const handleKeepEditing = () => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  const onSubmit = async (data) => {
    try {
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

      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await fetch(`${API_BASE_URL}/api/post/create-post`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const result = await response.json();

      if (result.success) {
        isSubmittedRef.current = true;
        try {
          localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
        } catch (_) {}
        showToast("Post created successfully!", "success");
        navigate("/posts", { state: location.state });
      } else {
        showToast(result.message || "Failed to create post.", "error");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      showToast("Error submitting post: " + error.message, "error");
    }
  };

  return (
    <FormProvider {...methods}>
      {savedDraft && (
        <Alert
          severity="info"
          icon={<RestoreRoundedIcon />}
          sx={{
            mt: 2,
            mb: 1,
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            alignItems: "center"
          }}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="info"
                size="small"
                variant="contained"
                onClick={handleRestoreDraft}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Restore Draft
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={handleDismissDraft}
                sx={{ textTransform: "none" }}
              >
                Dismiss
              </Button>
            </Box>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            You have an unsaved draft from a previous session:{" "}
            <strong>{savedDraft.title || "Untitled Post"}</strong>
          </Typography>
        </Alert>
      )}

      <PostForm
        register={register}
        handleSubmit={handleSubmit}
        control={control}
        errors={errors}
        setValue={setValue}
        selectedCategory={watch("categoryslug")}
        setSelectedCategory={setSelectedCategory}
        onSubmit={onSubmit}
        onSaveDraft={handleSaveAsDraft}
        isSavingDraft={isSavingDraft}
      />

      {/* Confirmation Dialog on Leaving with Unsaved Changes */}
      <UnsavedChangesDialog
        open={blocker.state === "blocked"}
        title="Save Post as Draft?"
        message="You have unsaved changes in this post. Would you like to save it as a draft before leaving?"
        onSaveDraft={handleSaveAsDraft}
        onDiscard={handleDiscard}
        onCancel={handleKeepEditing}
        isSaving={isSavingDraft}
      />
    </FormProvider>
  );
}

export default PostCreate;
