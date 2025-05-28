/* eslint-disable no-unused-vars */
// Inside PostCreate.jsx

import { PostForm } from "../../components/PostForm/PostForm";
import { useForm } from "react-hook-form";
import { useState } from "react";

export function PostCreate() {
  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue
  } = methods;

  const [selectedCategory, setSelectedCategory] = useState("");
  console.log("PostCreate loaded");

  const onSubmit = (data) => {
    console.log("Post Submitted:", data);
    // Call your API here to post the data
  };

  return (
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
  );
}
