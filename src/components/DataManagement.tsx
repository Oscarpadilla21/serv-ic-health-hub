import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Database, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from "@/hooks/useDatabase";

export const DataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportData, importData } = useDatabase();
  const { toast } = useToast();

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ser-vir-hc-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "¡Éxito!",
        description: "Datos exportados correctamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al exportar los datos"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const success = await importData(text);
      
      if (success) {
        toast({
          title: "¡Éxito!",
          description: "Datos importados correctamente. Recargue la página para ver los cambios."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al importar los datos. Verifique el formato del archivo."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al leer el archivo"
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestión de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exportar datos */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Exportar Datos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Descargue una copia de seguridad de todos sus datos (pacientes, historias clínicas, citas) 
                para poder transferirlos a otro equipo o como respaldo.
              </p>
              <Button 
                onClick={handleExportData} 
                disabled={isExporting}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exportando...' : 'Exportar Datos'}
              </Button>
            </div>
          </div>

          {/* Importar datos */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Importar Datos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Importe datos de una copia de seguridad anterior. 
                <strong className="text-foreground"> Advertencia:</strong> Esta acción agregará los datos al sistema existente.
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="importFile">Seleccionar archivo de respaldo (.json)</Label>
                  <Input
                    ref={fileInputRef}
                    id="importFile"
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    disabled={isImporting}
                    className="mt-2"
                  />
                </div>
                
                {isImporting && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4 animate-spin" />
                    Importando datos...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-muted/50 p-4 rounded-lg border-t">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Información Importante
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Los archivos de respaldo contienen todos sus datos médicos</li>
              <li>• Mantenga los archivos de respaldo en un lugar seguro</li>
              <li>• Al importar, los datos se agregan a los existentes (no los reemplazan)</li>
              <li>• Para transferir datos a un nuevo equipo, exporte desde el equipo anterior e importe en el nuevo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};