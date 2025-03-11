import { useEffect, useState } from "react";

import {
  createTipoCuenta,
  deleteTipoCuenta,
  getTiposCuenta,
  updateTipoCuenta,
} from "@/api/tipoCuentaApi";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const columns = [
  { key: "descripcion", header: "Descripción" },
  {
    key: "origen",
    header: "Origen",
    render: (row: { origen: string }) =>
      row.origen === "DB" ? "Débito" : "Crédito",
  },
  {
    key: "estado",
    header: "Estado",
    render: (row) => (row.estado ? "✅ Activo" : "❌ Inactivo"),
  },
];

const TipoCuentaForm = ({ tipoCuenta, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: tipoCuenta?.id || 0,
    descripcion: tipoCuenta?.descripcion || "",
    origen: tipoCuenta?.origen || "",
    estado: tipoCuenta?.estado ?? true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="origen">Origen</Label>
        <Select
          value={formData.origen}
          onValueChange={(value) =>
            handleChange({ target: { name: "origen", value } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CR">Crédito</SelectItem>
            <SelectItem value="DB">Débito</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.id !== 0 && (
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estado"
              name="estado"
              checked={formData.estado}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, estado: e.target.checked }))
              }
              className="h-5 w-5 accent-blue-500 cursor-pointer"
            />
            <span>{formData.estado ? "✅ Activo" : "❌ Inactivo"}</span>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {formData.id !== 0
            ? "Actualizar Tipo de Cuenta"
            : "Crear Tipo de Cuenta"}
        </Button>
      </div>
    </form>
  );
};

const TipoCuenta = () => {
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTipoCuenta, setCurrentTipoCuenta] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    getTiposCuenta().then(setTiposCuenta);
  }, []);

  const handleCreate = () => {
    setCurrentTipoCuenta(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tipoCuenta) => {
    setCurrentTipoCuenta(tipoCuenta);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteTipoCuenta(id);
    setTiposCuenta(tiposCuenta.filter((tc) => tc.id !== id));
    toast({ title: "Tipo de Cuenta Eliminado" });
  };

  const validar = (tipoCuenta: {
    descripcion: string;
    origen: string;
  }): boolean => {
    if (!tipoCuenta.descripcion.trim()) {
      toast({
        title: "Advertencia",
        description: "La descripción es obligatoria.",
        variant: "warning",
      });
      return false;
    }

    const ORIGEN_CREDITO = "CR";
    const ORIGEN_DEBITO = "DB";

    if (
      tipoCuenta.origen !== ORIGEN_CREDITO &&
      tipoCuenta.origen !== ORIGEN_DEBITO
    ) {
      toast({
        title: "Advertencia",
        description: "El origen no es válido.",
        variant: "warning",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (data: {
    id: number;
    descripcion: string;
    origen: string;
  }) => {
    if (!validar(data)) return;

    if (data.id === 0) {
      const newTipoCuenta = await createTipoCuenta(data);
      setTiposCuenta([newTipoCuenta, ...tiposCuenta]);
    } else {
      const updatedTipoCuenta = await updateTipoCuenta(data.id, data);
      setTiposCuenta(
        tiposCuenta.map((tc) =>
          tc.id === updatedTipoCuenta.id ? updatedTipoCuenta : tc
        )
      );
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tipos de Cuenta</h2>
        <Button onClick={handleCreate}>+ Agregar Tipo de Cuenta</Button>
      </div>
      <DataTable
        columns={columns}
        data={tiposCuenta}
        onEdit={handleEdit}
        onDelete={(tc) => handleDelete(tc.id)}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          currentTipoCuenta ? "Editar Tipo de Cuenta" : "Nuevo Tipo de Cuenta"
        }
      >
        <TipoCuentaForm
          tipoCuenta={currentTipoCuenta}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default TipoCuenta;
