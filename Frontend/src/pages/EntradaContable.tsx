import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DataTable, { Filter } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { getEntradaContable, getEntradaContableById} from "@/api/entradaContableApi";
import { getCuentasContables } from "@/api/cuentaContableApi";
import { getSistemasAuxiliares } from "@/api/sistemaAuxiliarApi";
import Modal from "@/components/Modal";

const EntradaContable = () => {
  const [entradas, setEntradas] = useState([]);
  const [sistemasAuxiliares, setSistemasAuxiliares] = useState([]);
  const [cuentasContables, setCuentasContables] = useState([]);
  const [selectedEntrada, setSelectedEntrada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

    

  useEffect(() => {
    getEntradaContable()
      .then(setEntradas)
      .catch(() =>
        toast({
            
          title: "Error",
          description: "No se pudieron cargar las entradas contables",
          variant: "destructive",
        })
      );

    getCuentasContables()
      .then(setCuentasContables)

    getSistemasAuxiliares()
      .then(setSistemasAuxiliares)
      .catch(() =>
        toast({
          title: "Error",
          description: "No se pudieron cargar los sistemas auxiliares",
          variant: "destructive",
        })
      ); 
      
      console.log("Sistemas Auxiliares:", sistemasAuxiliares);
  }, []);

  const openModal = async (id: number) => {
    const entrada = await getEntradaContableById(id);
    if (entrada) {
      setSelectedEntrada(entrada);
      setIsModalOpen(true);
    } else {
      toast({
        title: "Error",
        description: "No se pudo cargar el detalle de la entrada contable",
        variant: "destructive",
      });
    }
  };

  const columns = [
    { key: "descripcion", header: "Descripción" },
    {
      key: "fechaAsiento",
      header: "Fecha",
      render: (row) => new Date(row.fechaAsiento).toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    },
    {
        key: "sistemaAuxiliarId",
        header: "Sistema Auxiliar",
        render: (row) => {
          const sistema = sistemasAuxiliares.find(
            (sa) => sa.objectId === row.sistemaAuxiliarId
          );
          return sistema ? sistema.descripcion : "N/A";
        }
    },

    {
      key: "estadoDesc",
      header: "Estado",
    },
    
    {
      key: "acciones",
      header: "Acciones",
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => openModal(row.id)}>
          Ver
        </Button>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { label: "Registrado", value: "R" },
        { label: "Cancelado", value: "C" },
      ],
    },
    {
      key: "fechaAsiento",
      label: "Fecha de asiento",
      type: "date"
    },
    {
      key: "sistemaAuxiliarId",
      label: "Sistema Auxiliar",
      type: "select",
      options: sistemasAuxiliares.map((sistema) => ({
        label: sistema.descripcion,
        value: sistema.objectId,
      })),
    },

    {
      key: "cuentaId", // This is a custom key for our filter
      label: "Cuenta contable",
      type: "select",
      options: cuentasContables.map(cuenta => ({
        label: cuenta.descripcion,
        value: cuenta.objectId
      })),
      // This indicates it's a special filter for nested arrays
      customFilter: true
    }
  ];

  const customFilterFunction = (item, filters) => {
    // Handle the cuentaId filter specially
    const cuentaIdFilter = filters.cuentaId;
    
    if (cuentaIdFilter && cuentaIdFilter !== "") {
      // Check if any detail in the array has this cuentaId
      const hasMatchingCuenta = item.detalles?.some(
        detail => detail.cuentaId === cuentaIdFilter
      );
      
      if (!hasMatchingCuenta) {
        return false;
      }
    }
    
    // Item passed the custom filter
    return true;
  };
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Entradas Contables</h1>
        {/* Botón para futura implementación */}
        {/* <Button onClick={() => {}}>+ Nueva Entrada</Button> */}
      </div>

      <DataTable columns={columns} data={entradas}
      customFilterFunction={customFilterFunction}

        filters={filters} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalle de Entrada Contable"
      >
        {selectedEntrada && (
          <div className="space-y-3 text-sm">
            <p>
              <strong>Descripción:</strong> {selectedEntrada.descripcion}
            </p>
            <p>
              <strong>Sistema Auxiliar:</strong>{" "}
                {sistemasAuxiliares.find(
                    (sa) => sa.objectId === selectedEntrada.sistemaAuxiliarId
                )?.descripcion || "N/A"}
            </p>
            <p>
              <strong>Fecha del Asiento:</strong>{" "}
              {new Date(selectedEntrada.fechaAsiento).toLocaleDateString()}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
                {selectedEntrada.estadoDesc}
            </p>
            <div className="mt-4">
              <p className="font-medium"><strong>Detalles:</strong></p>
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                    <th className="px-4 py-2 text-left border-b">Cuenta</th>
                    <th className="px-4 py-2 text-left border-b">Movimiento</th>
                    <th className="px-4 py-2 text-left border-b">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedEntrada.detalles?.map((d, i) => {
                    const cuenta = cuentasContables.find((c) => c.objectId === d.cuentaId);
                    return (
                        <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">
                            {cuenta?.descripcion || "N/A"}
                        </td>
                        <td className="px-4 py-2 border-b">{d.tipoMovimientoDesc}</td>
                        <td className="px-4 py-2 border-b">${d.montoAsiento.toFixed(2)}</td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EntradaContable;

