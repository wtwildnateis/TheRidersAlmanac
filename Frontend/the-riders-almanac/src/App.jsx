import { Routes, Route, Navigate } from "react-router-dom";
import SiteShell from "./layouts/SiteShell";
import HomeSections from "./pages/landing/HomeSections";
import EventsPage from "./pages/events";
import ResourcesPage from "./pages/resources";
import CommunityPage from "./pages/community";
import ForumDetail from "./pages/forum-detail"; 
import ContactPage from "./pages/contact";
import LoginPage from "./pages/login";
import AccountPage from "./pages/account";
import RegisterPage from "./pages/register";
import ChangePasswordPage from "./pages/ChangePassword";
import ChangeUsernamePage from "./pages/ChangeUsername";
import ChangeEmailPage from "./pages/ChangeEmail";

function App() {
  return (
    <>
    <Routes>


      <Route element={<SiteShell />}>
        <Route index element={<HomeSections />} />
        <Route path="home" element={<HomeSections />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="community/:id" element={<ForumDetail />} />
        <Route path="contact-us" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/change-username" element={<ChangeUsernamePage />} />
        <Route path="/change-email" element={<ChangeEmailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  );
}
export default App;