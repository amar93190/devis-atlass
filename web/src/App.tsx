import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@layouts/AppLayout";
import { ChatPage } from "@pages/ChatPage";
import { DashboardPage } from "@pages/DashboardPage";
import { SettingsPage } from "@pages/SettingsPage";
import { SubscriptionPage } from "@pages/SubscriptionPage";

const App = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subscriptions" element={<SubscriptionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
