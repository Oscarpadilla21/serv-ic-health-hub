import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDatabase } from "@/hooks/useDatabase";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { PasswordRecovery } from "@/components/PasswordRecovery";
import { Dashboard } from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthScreen = () => {
  const [screen, setScreen] = useState<'login' | 'register' | 'recovery'>('login');
  const { login, register } = useDatabase();
  const { toast } = useToast();

  const handleLogin = async (credentials: { username: string; password: string }) => {
    const success = await login(credentials);
    if (success) {
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

  const handleRegister = async (userData: any) => {
    const success = await register(userData);
    if (success) {
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

  const getScreenConfig = () => {
    switch (screen) {
      case 'register':
        return {
          title: "Crear Cuenta",
          subtitle: "Registre su cuenta profesional"
        };
      case 'recovery':
        return {
          title: "Recuperar Contraseña",
          subtitle: "Recupere el acceso a su cuenta"
        };
      default:
        return {
          title: "Iniciar Sesión",
          subtitle: "Acceda a su cuenta médica"
        };
    }
  };

  const { title, subtitle } = getScreenConfig();

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {screen === 'login' && (
        <LoginForm 
          onLogin={handleLogin}
          onSwitchToRegister={() => setScreen('register')}
          onSwitchToRecovery={() => setScreen('recovery')}
        />
      )}
      {screen === 'register' && (
        <RegisterForm 
          onRegister={handleRegister}
          onSwitchToLogin={() => setScreen('login')}
        />
      )}
      {screen === 'recovery' && (
        <PasswordRecovery 
          onBackToLogin={() => setScreen('login')}
        />
      )}
    </AuthLayout>
  );
};

const AppContent = () => {
  const { currentUser, isLoading, logout, isAuthenticated } = useDatabase();

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

  if (!isAuthenticated || !currentUser) {
    return <AuthScreen />;
  }

  return <Dashboard user={currentUser} onLogout={logout} />;
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
