import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, HelpCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from "@/hooks/useDatabase";

interface PasswordRecoveryProps {
  onBackToLogin: () => void;
}

export const PasswordRecovery = ({ onBackToLogin }: PasswordRecoveryProps) => {
  const [step, setStep] = useState<'username' | 'security' | 'newPassword'>('username');
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { getSecurityQuestion, recoverPassword } = useDatabase();
  const { toast } = useToast();

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingrese su nombre de usuario"
      });
      return;
    }

    const question = await getSecurityQuestion(username);
    if (question) {
      setSecurityQuestion(question);
      setStep('security');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Usuario no encontrado"
      });
    }
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor responda la pregunta de seguridad"
      });
      return;
    }
    setStep('newPassword');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor complete todos los campos"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres"
      });
      return;
    }

    const success = await recoverPassword({
      username,
      securityAnswer,
      newPassword
    });

    if (success) {
      toast({
        title: "¡Éxito!",
        description: "Contraseña recuperada correctamente"
      });
      onBackToLogin();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Respuesta de seguridad incorrecta"
      });
      setStep('security');
      setSecurityAnswer('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-accent/10 rounded-full">
            <HelpCircle className="h-8 w-8 text-accent" />
          </div>
        </div>
        <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'username' && (
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Continuar
            </Button>
          </form>
        )}

        {step === 'security' && (
          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Pregunta de Seguridad</Label>
              <p className="text-sm text-foreground p-3 bg-muted rounded-md">
                {securityQuestion}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="securityAnswer">Respuesta</Label>
              <Input
                id="securityAnswer"
                type="text"
                placeholder="Ingrese su respuesta"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Verificar Respuesta
            </Button>
          </form>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Ingrese nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Cambiar Contraseña
            </Button>
          </form>
        )}

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-primary hover:underline text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </button>
        </div>
      </CardContent>
    </Card>
  );
};