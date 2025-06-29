/* eslint-disable no-unused-vars */
// Inside PostCreate.jsx

import { PostForm } from "../../components/PostForm/PostForm";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../config";
import { useState } from "react";

export function PostCreate() {
  const methods = useForm();
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
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }

          console.log(`Appending ${key}:`, JSON.stringify(value));
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
      console.log("Response:", result);

      if (result.success) {
        showToast("Post created successfully!", "success");
        // Optionally reset form or redirect
      } else {
        showToast(result.message || "Failed to create post.", "error");
      }
    } catch (error) {
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
