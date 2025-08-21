import { ReactNode } from "react";
import medicalHero from "@/assets/medical-hero.jpg";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={medicalHero} 
          alt="Medical healthcare" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-primary/20"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-3xl font-bold">Ser-Vir-HC</h2>
          <p className="text-lg opacity-90">Sistema de Gestión de Historias Clínicas</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};