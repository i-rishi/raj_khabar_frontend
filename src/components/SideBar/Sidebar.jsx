/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Tooltip,
  Box
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineDashboard, MdOutlinePostAdd } from "react-icons/md";
import { FiLayers } from "react-icons/fi";
import { TbCategoryPlus } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { TbTableOptions, TbTableDashed } from "react-icons/tb";
import { LuCreditCard } from "react-icons/lu";
import { GrCloudUpload } from "react-icons/gr";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useCategories } from "../../context/CategoryContext";

export function Sidebar({ open }) {
  //fetch the category data
  const { categories } = useCategories();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [hovered, setHovered] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});

  const isSidebarOpen = open || hovered;

  const handleToggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const menuItems = [
    {
      icon: <MdOutlineDashboard />,
      label: "Dashboard",
      path: "/dashboard"
    },
    {
      icon: <FiLayers />,
      label: "Main Category",
      path: "/main-category",
      children: categories.map((cat) => ({
        label: cat.name,
        path: `/main-category/${cat.slug}`
      }))
    },
    { icon: <MdOutlinePostAdd />, label: "Post Management", path: "/posts" },
    {
      icon: <TbTableDashed />,
      label: "Table Management",
      path: "/table-management"
    },
    {
      icon: <LuCreditCard />,
      label: "Card Management",
      path: "/card-management"
    },
    { icon: <TbCategoryPlus />, label: "Categories", path: "/category" },
    {
      icon: <TbTableOptions />,
      label: "Table Structure",
      path: "/table-structure"
    },
    {
      icon: <GrCloudUpload />,
      label: "File Uploader",
      path: "/files"
    },
    { icon: <IoSettingsOutline />, label: "Settings", path: "/settings" }
  ];

  // Auto-expand submenu if any child route is active
  useEffect(() => {
    const newOpenSubmenus = {};
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          currentPath.startsWith(child.path)
        );
        newOpenSubmenus[item.label] = isChildActive;
      }
    });
    setOpenSubmenus(newOpenSubmenus);
  }, [currentPath]);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        sx: {
          top: 70,
          backgroundColor: "#f4f0e4",
          overflowX: "hidden",
          width: isSidebarOpen ? 240 : 70,
          transition: "width 0.3s",
          whiteSpace: "nowrap",
          borderRight: "1px solid #ddd"
        }
      }}
    >
      <List>
        {menuItems.map((item, index) => {
          const isActive = currentPath.startsWith(item.path);
          const hasChildren = Array.isArray(item.children);
          const isSubmenuOpen = openSubmenus[item.label];

          const itemContent = (
            <Box display="flex" alignItems="center" width="100%">
              <Box
                sx={{
                  minWidth: 32,
                  color: isActive ? "#f4f0e4" : "#800000",
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                {React.cloneElement(item.icon, { size: 20 })}
              </Box>
              {isSidebarOpen && (
                <ListItemText
                  primary={item.label}
                  sx={{
                    color: isActive ? "#f4f0e4" : "#800000",
                    fontSize: "16px"
                  }}
                />
              )}
              {isSidebarOpen &&
                hasChildren &&
                (isSubmenuOpen ? (
                  <ExpandLess sx={{ color: "#800000" }} />
                ) : (
                  <ExpandMore sx={{ color: "#800000" }} />
                ))}
            </Box>
          );

          return (
            <Box key={index}>
              <Tooltip
                title={!isSidebarOpen ? item.label : ""}
                placement="right"
              >
                <ListItem
                  onClick={() =>
                    hasChildren
                      ? handleToggleSubmenu(item.label)
                      : navigate(item.path)
                  }
                  component={hasChildren ? "div" : Link}
                  to={!hasChildren ? item.path : undefined}
                  selected={isActive}
                  sx={{
                    borderRadius: "10px",
                    mx: 1,
                    my: 0.5,
                    backgroundColor: isActive ? "#800000" : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(128, 0, 0, 0.2)"
                    }
                  }}
                >
                  {itemContent}
                </ListItem>
              </Tooltip>

              {/* Submenu */}
              {isSidebarOpen && hasChildren && (
                <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child, idx) => (
                      <ListItem
                        key={idx}
                        component={Link}
                        to={child.path}
                        selected={currentPath === child.path}
                        sx={{
                          pl: 6,
                          mx: 1,
                          borderRadius: "10px",
                          backgroundColor:
                            currentPath === child.path
                              ? "rgba(128,0,0,0.1)"
                              : "transparent",
                          "&:hover": {
                            backgroundColor: "rgba(128, 0, 0, 0.15)"
                          }
                        }}
                      >
                        <ListItemText
                          primary={child.label}
                          sx={{
                            color:
                              currentPath === child.path ? "#800000" : "#800000"
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
}
