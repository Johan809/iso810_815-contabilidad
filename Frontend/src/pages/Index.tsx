import { ArrowRight, FileText, Layers, Shapes, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getConteoDashboard } from "@/api/dashboardApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Index = () => {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const conteo = await getConteoDashboard();

        setModules([
          {
            title: "Cuentas Contables",
            description:
              "Administración y gestión de cuentas contables registradas en el sistema.",
            icon: <FileText className="h-4 w-4" />,
            href: "/cuenta-contable",
            count: conteo.totalCuentasContables,
          },
          {
            title: "Tipos de Moneda",
            description:
              "Listado de monedas registradas con sus tasas de cambio actualizadas.",
            icon: <Wallet className="h-4 w-4" />,
            href: "/tipo-moneda",
            count: conteo.totalTipoMonedas,
          },
          {
            title: "Tipos de Cuenta",
            description:
              "Permiten clasificar las cuentas contables según su naturaleza y uso.",
            icon: <Shapes className="h-4 w-4" />,
            href: "/tipo-cuenta",
            count: conteo.totalTipoCuentas,
          },
          {
            title: "Sistemas Auxiliares",
            description:
              "Configuración y gestión de módulos auxiliares conectados al sistema.",
            icon: <Layers className="h-4 w-4" />,
            href: "/sistema-auxiliar",
            count: conteo.totalSistemasAuxiliares,
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visión general del rendimiento y la actividad reciente de su
            sistema.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">
          Módulos de gestión
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, i) => (
            <Card key={module.title} className="animate-scale-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {module.title}
                </CardTitle>
                <div className="bg-primary/10 text-primary p-2 rounded-full">
                  {module.icon}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
                <div className="mt-2 text-2xl font-bold">{module.count}</div>
              </CardContent>
              <CardFooter>
                <Link to={module.href} className="w-full">
                  <Button variant="ghost" className="w-full justify-between">
                    <span>Gestionar {module.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
