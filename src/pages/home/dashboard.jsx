// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import SummaryCard from "../../components/SummaryCard/SummaryCard";
import { PostTable } from "../../components/PostTable/PostTable";
import { SectionHeader } from "../../components/SectionHeader/SectionHeader";
import { MdOutlineInsights, MdOutlinePostAdd } from "react-icons/md";
import { Article, Category, EventNote } from "@mui/icons-material";
import { BiCategory } from "react-icons/bi";
import axios from "axios";
import dayjs from "dayjs";
import { CategoryTable } from "../../components/CategoryTable/CategoryTable";
import { API_BASE_URL } from "../../config";

export function Dashboard() {
  const [totalPosts, setTotalPosts] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [monthlyPosts, setMonthlyPosts] = useState(0);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const postsRes = await axios.get(
          `${API_BASE_URL}/api/post/posts?status=published`
        );
        const categoriesRes = await axios.get(
          `${API_BASE_URL}/api/category/all`
        );

        const allPosts = postsRes.data.posts;
        const categories = categoriesRes.data.categories;
        console.log("categories : " + categories.length);

        setTotalPosts(allPosts.length);
        setCategoryCount(categories.length);

        const currentMonth = dayjs().month();
        const filtered = allPosts.filter((post) => {
          const month = dayjs(post.createdAt).month() + 1;
          return month == currentMonth;
        });
        console.log(filtered);

        setMonthlyPosts(filtered.length);
        setPosts(allPosts);
        setCategories(categories);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error.message);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <SectionHeader
            title="Summary Overview"
            subtitle="Snapshot of current content statistics"
            icon={<MdOutlineInsights />}
          />
        </Grid>
        <Grid size={4}>
          <SummaryCard
            title="Total Posts"
            value={totalPosts}
            icon={<Article sx={{ fontSize: 50 }} />}
          />
        </Grid>
        <Grid size={4}>
          <SummaryCard
            title="Total Categories"
            value={categoryCount}
            icon={<Category sx={{ fontSize: 50 }} />}
          />
        </Grid>
        <Grid size={4}>
          <SummaryCard
            title="Posts This Month"
            value={monthlyPosts}
            icon={<EventNote sx={{ fontSize: 50 }} />}
          />
        </Grid>
      </Grid>
      <SectionHeader
        title="Recent Posts"
        subtitle="All the recently published post"
        icon={<MdOutlinePostAdd />}
      />
      <PostTable
        posts={posts}
        onView={(post) => console.log("View:", post)}
        onEdit={(post) => console.log("Edit:", post)}
        onDelete={(post) => console.log("Delete:", post)}
        onAddPost={() => navigate("/dashboard/create-post")}
      />
      <SectionHeader
        title="Category Management"
        subtitle="Create or update main category."
        icon={<BiCategory />}
      />
      <CategoryTable
        categories={categories}
        onEdit={(post) => console.log("Clicked on Edit" + post)}
        onDelete={(post) => console.log("clicked on Delete" + post)}
        onCreateCategory={() => navigate("/dashboard/create-category")}
      />
    </>
  );
}
