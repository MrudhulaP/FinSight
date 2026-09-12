import { Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import AppShell from "./components/AppShell";

import Dashboard from "./Dashboard";
import Overview from "./pages/Overview";
import Investigations from "./pages/Investigations";
import Transactions from "./pages/Transactions";
import CashFlow from "./pages/CashFlow";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/investigations" element={<Investigations />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/cash-flow" element={<CashFlow />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;