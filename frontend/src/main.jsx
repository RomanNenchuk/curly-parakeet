import { createRoot } from "react-dom/client";
import "./config/firebase-config.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./i18n.js";
import "./main.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./components/App.jsx";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
