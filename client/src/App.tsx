import {BrowserRouter, Routes, Route} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "@/contexts/ThemeContext";
import {SidebarProvider} from "@/contexts/SidebarContext";
import AppLayout from "@/components/layout/AppLayout";
import {
  Dashboard,
  Clients,
  ClientDetail,
  Cases,
  CaseDetail,
  Tasks,
  Team,
  Settings,
} from "@/pages";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientDetail />} />
                <Route path="cases" element={<Cases />} />
                <Route path="cases/:id" element={<CaseDetail />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="team" element={<Team />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
