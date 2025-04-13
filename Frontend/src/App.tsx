
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import TipoMoneda from "./pages/TipoMoneda";
import TipoCuenta from "./pages/TipoCuenta";
import SistemaAuxiliar from "./pages/SistemaAuxiliar";
import CuentaContable from "./pages/CuentaContable";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EntradaContable from "./pages/EntradaContable";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Authentication routes (outside of main layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Application routes (inside layout with sidebar) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products" element={<Products />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tipo-moneda" element={<TipoMoneda />} />
            <Route path="/tipo-cuenta" element={<TipoCuenta />} />
            <Route path="/sistema-auxiliar" element={<SistemaAuxiliar />} />
            <Route path="/cuenta-contable" element={<CuentaContable />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/entrada-contable" element={<EntradaContable />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
