import { Navigate, Route, Routes } from "react-router-dom";
import LoadingPage from "./pages/LoadingPage";
import LoginPage from "./pages/LoginPage";
import ApplicationFormPage from "./pages/application/ApplicationFormPage";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoadingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/apply" element={<ApplicationFormPage />} />
      <Route path="/apply/:propertyId" element={<ApplicationFormPage />} />

      {/* Not built yet: replace each Placeholder as you build the page */}
      <Route path="/welcome" element={<Placeholder title="Onboarding" />} />
      <Route path="/signup" element={<Placeholder title="Create an account" />} />
      <Route path="/properties" element={<Placeholder title="Properties" />} />
      <Route path="/applications" element={<Placeholder title="Applications" />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
