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
// import PostManagement from "./pages/Posts/PostManagement";
import PostManagementWithBulkDelete from "./pages/Posts/PostManagementWithBulkDelete";
import { PostEditPage } from "./pages/Posts/PostEditPage";
//category imports
import { CategoryManagement } from "./pages/Category/CategoryManagement";
import { CategoryCreate } from "./pages/Category/CategoryCreate";
import { CategoryEdit } from "./pages/Category/CategoryEdit";
import { CategoryProvider } from "./context/CategoryContext";
import { MainCategoryAllData } from "./pages/Category/MainCategoryAllData";
//subcategory imports
import { SubcategoryCreate } from "./pages/Subcategory/SubcategoryCreate";
import { SubcategoryEdit } from "./pages/Subcategory/SubcategoryEdit";
import { SubcategoryClone } from "./pages/Subcategory/SubcategoryClone";

// table structure imports
import { Tablestructure } from "./pages/Tablestructure/Tablestructure";
import { TableManagement } from "./pages/Tablestructure/TableManagement";
import { TablePostCreate } from "./pages/Tablestructure/TablePostCreate";
import { TablePostEdit } from "./pages/Tablestructure/TablePostEdit";
import { HeaderComponentCreate } from "./pages/HeaderComponent/HeaderComponentCreate";
import { HeaderComponentManagement } from "./pages/HeaderComponent/HeaderComponentManagement";
import { HeaderComponentEdit } from "./pages/HeaderComponent/HeaderComponentEdit";
import { HeaderComponentView } from "./pages/HeaderComponent/HeaderComponentView";

//Card Imports
import { CardManagement } from "./pages/Cards/CardManagement";
import { CardCreate } from "./pages/Cards/CardCreate";
import { CardEdit } from "./pages/Cards/CardEdit";

//Setting Imports
import { Setting, SettingsPage } from "./pages/Settings/Setting";
import { UserManagement } from "./pages/Settings/UserManagement";
import { AddUser } from "./pages/Settings/AddUser";

//File Imports
import { FilesUploader } from "./pages/FilesUploader/FilesUploader";

//social media links
import { SocialLinksManagement } from "./pages/Sociallinks/SocialLinksManagement";

import { ToastProvider } from "./context/ToastContext";
import { UserProvider } from "./context/UserContext";
import LoginPage from "./pages/Login/loginPage";
import { useUser } from "../src/context/UserContext";
import { SplashScreen } from "./pages/SplashScreen/SplashScreen";
import Cookies from "js-cookie";
import { HEADER_HEIGHT, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from "./constants/layout";

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const { user } = useUser();
  if (user === undefined) {
    // Show a loading spinner or splash screen while user is loading
    return <SplashScreen />;
  }

  if (!user) {
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
  const hideLayout =
    location.pathname === "/login" || location.pathname === "/";

  return (
    <UserProvider>
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
                marginLeft: !hideLayout
                  ? drawerOpen
                    ? SIDEBAR_EXPANDED_WIDTH
                    : SIDEBAR_COLLAPSED_WIDTH
                  : 0,
                transition: "margin-left 0.3s ease"
              }}
            >
              <Routes>
                <Route path="/" element={<LoginPage />} />
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
                      <PostManagementWithBulkDelete />
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
                  path="/main-category/:slug"
                  element={
                    <ProtectedRoute>
                      <MainCategoryAllData />
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
                  path="/category/:parentSlug/clone-subcategory/:slug"
                  element={
                    <ProtectedRoute>
                      <SubcategoryClone />
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
                  path="/header-component-create"
                  element={
                    <ProtectedRoute>
                      <HeaderComponentCreate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/header-component"
                  element={
                    <ProtectedRoute>
                      <HeaderComponentManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/header-component/edit/:id"
                  element={
                    <ProtectedRoute>
                      <HeaderComponentEdit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/header-component/view/:id"
                  element={
                    <ProtectedRoute>
                      <HeaderComponentView />
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
                  path="/card-edit/:slug"
                  element={
                    <ProtectedRoute>
                      <CardEdit />
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
                <Route
                  path="/files"
                  element={
                    <ProtectedRoute>
                      <FilesUploader />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social-links"
                  element={
                    <ProtectedRoute>
                      <SocialLinksManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-user"
                  element={
                    <ProtectedRoute>
                      <AddUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
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
    </UserProvider>
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
