import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Dashboard } from "./pages/home/dashboard";
import { PostCreate } from "./pages/Posts/PostCreate";
import { Header } from "./components/Header/Header";
import { Sidebar } from "./components/SideBar/Sidebar";
import PostManagement from "./pages/Posts/PostManagement";
import { PostEditPage } from "./pages/Posts/PostEditPage";
//category imports
import { CategoryManagement } from "./pages/Category/CategoryManagement";
import { CategoryCreate } from "./pages/Category/CategoryCreate";
import { CategoryEdit } from "./pages/Category/CategoryEdit";
import { CategoryProvider } from "./context/CategoryContext";
//subcategory imports
import { SubcategoryCreate } from "./pages/Subcategory/SubcategoryCreate";
import { SubcategoryEdit } from "./pages/Subcategory/SubcategoryEdit";
// table structure imports
import { Tablestructure } from "./pages/Tablestructure/Tablestructure";
import { TableManagement } from "./pages/Tablestructure/TableManagement";
import { TablePostCreate } from "./pages/Tablestructure/TablePostCreate";
import { TablePostEdit } from "./pages/Tablestructure/TablePostEdit";

//Card Imports
import { CardManagement } from "./pages/Cards/CardManagement";
import { CardCreate } from "./pages/Cards/CardCreate";

import { ToastProvider } from "./context/ToastContext";
import LoginPage from "./pages/Login/loginPage";
import Cookies from "js-cookie";

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const token = Cookies.get("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const location = useLocation();

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  // Hide header/sidebar on login page
  const hideLayout = location.pathname === "/login";

  return (
    <div>
      <CategoryProvider>
        {!hideLayout && (
          <Header onMenuClick={toggleDrawer} isDrawerOpen={drawerOpen} />
        )}
        <div className="main d-flex">
          {!hideLayout && (
            <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          )}

          <div
            className="content"
            style={{
              marginLeft: !hideLayout ? (drawerOpen ? 240 : 60) : 0,
              transition: "margin-left 0.3s ease"
            }}
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/create-post"
                element={
                  <ProtectedRoute>
                    <PostCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/create-category"
                element={
                  <ProtectedRoute>
                    <CategoryCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts"
                element={
                  <ProtectedRoute>
                    <PostManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/edit/:id"
                element={
                  <ProtectedRoute>
                    <PostEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category"
                element={
                  <ProtectedRoute>
                    <CategoryManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category/edit-category/:slug"
                element={
                  <ProtectedRoute>
                    <CategoryEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category/:parentSlug/subcategory/create"
                element={
                  <ProtectedRoute>
                    <SubcategoryCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category/:parentSlug/edit-subcategory/:slug"
                element={
                  <ProtectedRoute>
                    <SubcategoryEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/table-structure"
                element={
                  <ProtectedRoute>
                    <Tablestructure />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/table-management"
                element={
                  <ProtectedRoute>
                    {/* Added for the temporary need to change it. */}
                    <TableManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/card-management"
                element={
                  <ProtectedRoute>
                    <CardManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/card-create"
                element={
                  <ProtectedRoute>
                    <CardCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/TablePostCreate"
                element={
                  <ProtectedRoute>
                    <TablePostCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/table-post/edit/:slug"
                element={
                  <ProtectedRoute>
                    <TablePostEdit />
                  </ProtectedRoute>
                }
              />
              {/* Add more protected routes here */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </CategoryProvider>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
