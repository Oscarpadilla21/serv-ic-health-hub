import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  Calendar, 
  Search,
  Plus,
  LogOut,
  Stethoscope,
  ClipboardList,
  TrendingUp,
  Download,
  Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataManagement } from "@/components/DataManagement";

interface User {
  fullName: string;
  specialty: string;
  licenseNumber: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - En una app real vendría de la base de datos
  const recentPatients = [
    { id: 1, name: "María González", age: 45, lastVisit: "2024-01-15", status: "Activo" },
    { id: 2, name: "Carlos Rodríguez", age: 32, lastVisit: "2024-01-14", status: "Seguimiento" },
    { id: 3, name: "Ana López", age: 28, lastVisit: "2024-01-13", status: "Activo" },
  ];

  const stats = [
    { title: "Pacientes Activos", value: "142", icon: Users, color: "text-primary" },
    { title: "Historias Clínicas", value: "89", icon: FileText, color: "text-accent" },
    { title: "Citas Hoy", value: "12", icon: Calendar, color: "text-orange-600" },
    { title: "Pendientes", value: "5", icon: ClipboardList, color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Ser-Vir-HC</h1>
            </div>
            <Badge variant="secondary" className="ml-4">
              {user.specialty}
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium text-foreground">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">MP: {user.licenseNumber}</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="records">Historias</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Búsqueda y acciones rápidas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Búsqueda de Pacientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por nombre, documento o historia clínica..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Paciente
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pacientes recientes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pacientes Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPatients.map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                          <div>
                            <p className="font-medium text-foreground">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {patient.age} años • Última visita: {patient.lastVisit}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={patient.status === "Activo" ? "default" : "secondary"}>
                              {patient.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Panel lateral */}
              <div className="space-y-6">
                {/* Acciones rápidas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Historia Clínica
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Agenda
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Reportes
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Estadísticas
                    </Button>
                  </CardContent>
                </Card>

                {/* Resumen del día */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen del Día</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Citas programadas</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completadas</span>
                      <span className="text-sm font-medium">7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pendientes</span>
                      <span className="text-sm font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Canceladas</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidad de pacientes en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>Historias Clínicas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidad de historias clínicas en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <DataManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};