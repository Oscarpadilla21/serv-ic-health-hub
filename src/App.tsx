import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { Dashboard } from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = (credentials: { username: string; password: string }) => {
    if (login(credentials)) {
      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Credenciales inválidas",
      });
    }
  };

  const handleRegister = (userData: any) => {
    if (register(userData)) {
      toast({
        title: "¡Registro exitoso!",
        description: "Su cuenta ha sido creada correctamente",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El usuario o email ya existe",
      });
    }
  };

  return (
    <AuthLayout 
      title={isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
      subtitle={isLogin ? "Acceda a su cuenta médica" : "Registre su cuenta profesional"}
    >
      {isLogin ? (
        <LoginForm 
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <RegisterForm 
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </AuthLayout>
  );
};

const AppContent = () => {
  const { user, isLoading, logout, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando Ser-Vir-HC...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  return <Dashboard user={user} onLogout={logout} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
