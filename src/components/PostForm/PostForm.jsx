/* eslint-disable no-unused-vars */
// /components/PostForm/PostForm.jsx
import { useForm, Controller } from "react-hook-form";
import { Box, Button, Paper } from "@mui/material";
import { PostFields } from "../PostFields/PostFields";
import { useToast } from "../../context/ToastContext";
import { API_BASE_URL } from "../../config";

export function PostForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  const { showToast } = useToast();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    try {
      const formData = new FormData();

      // Append all fields except image
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "image") {
          // if (key === "content") {
          //   formData.append(key, value);
          // }

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
        credentials: "include" // if you need cookies/auth
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
  };

  return (
    <Paper
      sx={{
        mt: 3,
        p: 3,
        backgroundColor: "#f4f0e4",
        borderRadius: "10px"
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <PostFields
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            type="submit"
            sx={{
              backgroundColor: "#800000",
              "&:hover": {
                backgroundColor: "#600000"
              }
            }}
          >
            Submit Post
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
