// src/components/dashboard/SummaryCard.jsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const Cards = ({ title, value, icon }) => {
  return (
    <Card
      sx={{ 
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderRadius: 3,
        boxShadow: 2,
        backgroundColor: "#fff"
      }}
    >
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Box sx={{ fontSize: 40, color: "#800000" }}>{icon}</Box>
    </Card>
  );
};

export default Cards;
