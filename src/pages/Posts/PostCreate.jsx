/* eslint-disable no-unused-vars */
// Inside PostCreate.jsx

import { PostForm } from "../../components/PostForm/PostForm";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../config";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  } = methods;
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");

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

      // Append image file if present
      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await fetch(`${API_BASE_URL}/api/post/create-post`, {
        method: "POST",
        body: formData,
        credentials: "include", // if you need cookies/auth
      });

      const result = await response.json();

      if (result.success) {
        showToast("Post created successfully!", "success");
        navigate("/posts", { state: location.state });
      } else {
        showToast(result.message || "Failed to create post.", "error");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      showToast("Error submitting post: " + error.message, "error");
    }
    // Call your API here to post the data
  };

  return (
    <FormProvider {...methods}>
      <PostForm
        register={register}
        handleSubmit={handleSubmit}
        control={control}
        errors={errors}
        setValue={setValue}
        selectedCategory={watch("categoryslug")}
        setSelectedCategory={setSelectedCategory}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );
}
