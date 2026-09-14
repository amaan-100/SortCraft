import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { ThemeProvider } from "@/context/ThemeContext";
import LandingPage from "@/pages/LandingPage";
import VisualizerPage from "@/pages/VisualizerPage";
import ComparePage from "@/pages/ComparePage";
import LevelsPage from "@/pages/LevelsPage";
import LevelDetailPage from "@/pages/LevelDetailPage";
import DashboardPage from "@/pages/DashboardPage";
import ProgressPage from "@/pages/ProgressPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          {/*
            HashRouter keeps deep links working on static hosts without extra
            rewrite rules. Swap to BrowserRouter + a Vercel rewrite if preferred.
          */}
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="visualizer" element={<VisualizerPage />} />
                <Route path="compare" element={<ComparePage />} />
                <Route path="levels" element={<LevelsPage />} />
                <Route path="levels/:levelId" element={<LevelDetailPage />} />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="progress"
                  element={
                    <ProtectedRoute>
                      <ProgressPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignUpPage />} />
                <Route path="home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
