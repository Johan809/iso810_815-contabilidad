import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import {
  getCuentasContables,
  createCuentaContable,
  updateCuentaContable,
  deleteCuentaContable,
} from "@/api/cuentaContableApi";
import { getTiposCuenta } from "@/api/tipoCuentaApi";
import { useToast } from "@/hooks/use-toast";

const CuentaContableForm = ({
  cuentaContable,
  tiposCuenta,
  cuentasContables,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    id: cuentaContable?.id || 0,
    descripcion: cuentaContable?.descripcion || "",
    tipoCuentaId: cuentaContable?.tipoCuentaId || "",
    permiteTransacciones: cuentaContable?.permiteTransacciones ?? true,
    nivel: cuentaContable?.nivel || 0,
    balance: cuentaContable?.balance || 0,
    cuentaMayorId: cuentaContable?.cuentaMayorId || "",
    estado: cuentaContable?.estado ?? true,
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
          title="Nombre de la Cuenta Contable"
          required
          onInvalid={(e) => {
            e.preventDefault();
            toast({
              title: "Advertencia",
              description: "La descripción es obligatoria.",
              variant: "warning",
            });
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipoCuentaId">Tipo de Cuenta</Label>
        <select
          id="tipoCuentaId"
          name="tipoCuentaId"
          value={formData.tipoCuentaId}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
          onInvalid={(e) => {
            e.preventDefault();
            toast({
              title: "Advertencia",
              description: "El Tipo de cuenta es obligatorio.",
              variant: "warning",
            });
          }}
        >
          <option value="">Seleccione un tipo de cuenta</option>
          {tiposCuenta.map((tc) => (
            <option key={tc.id} value={tc.id}>
              {tc.descripcion}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="nivel">Nivel</Label>
        <Input
          type="number"
          id="nivel"
          name="nivel"
          value={formData.nivel}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance">Balance</Label>
        <Input
          type="number"
          id="balance"
          name="balance"
          value={formData.balance}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cuentaMayorId">Cuenta Mayor</Label>
        <select
          id="cuentaMayorId"
          name="cuentaMayorId"
          value={formData.cuentaMayorId}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Seleccione una cuenta mayor</option>
          {cuentasContables
            .filter((cc) => cc.id !== formData.id) // Evita que una cuenta sea su propia cuenta mayor
            .map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.descripcion}
              </option>
            ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="permiteTransacciones"
          name="permiteTransacciones"
          checked={formData.permiteTransacciones}
          onChange={handleChange}
          className="h-5 w-5 accent-blue-500 cursor-pointer"
        />
        <Label htmlFor="permiteTransacciones">Permite Transacciones</Label>
      </div>
      {formData.id !== 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="estado"
            name="estado"
            checked={formData.estado}
            onChange={handleChange}
            className="h-5 w-5 accent-blue-500 cursor-pointer"
          />
          <span>{formData.estado ? "✅ Activo" : "❌ Inactivo"}</span>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {formData.id !== 0
            ? "Actualizar Cuenta Contable"
            : "Crear Cuenta Contable"}
        </Button>
      </div>
    </form>
  );
};

const CuentaContable = () => {
  const [cuentasContables, setCuentasContables] = useState([]);
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCuentaContable, setCurrentCuentaContable] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    getCuentasContables().then(setCuentasContables);
    getTiposCuenta().then(setTiposCuenta);
  }, []);

  const handleCreate = () => {
    setCurrentCuentaContable(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cuentaContable) => {
    setCurrentCuentaContable(cuentaContable);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteCuentaContable(id);
    setCuentasContables(cuentasContables.filter((cc) => cc.id !== id));
    toast({ title: "Cuenta Contable Eliminada" });
  };

  const validar = (
    cuentaContable: {
      descripcion: string;
      tipoCuentaId: string;
      cuentaMayorId?: string;
      nivel: number;
      balance: number;
    },
    cuentasContablesList: {
      id: string;
      objectId: string;
      nivel: number;
    }[]
  ): boolean => {
    if (!cuentaContable.descripcion.trim()) {
      toast({
        title: "Advertencia",
        description: "La descripción es obligatoria y no puede estar vacía.",
        variant: "warning",
      });
      return false;
    }

    if (!cuentaContable.tipoCuentaId) {
      toast({
        title: "Advertencia",
        description: "El Tipo de cuenta es obligatorio.",
        variant: "warning",
      });
      return false;
    }

    if (cuentaContable.nivel < 1 || cuentaContable.nivel > 3) {
      toast({
        title: "Advertencia",
        description: "El nivel debe estar entre 1 y 3.",
        variant: "warning",
      });
      return false;
    }

    if (cuentaContable.balance < 0) {
      toast({
        title: "Advertencia",
        description: "El balance no puede ser negativo.",
        variant: "warning",
      });
      return false;
    }

    if (cuentaContable.cuentaMayorId) {
      const cuentaMayor = cuentasContablesList.find(
        (c) => c.id == cuentaContable.cuentaMayorId
      );

      if (!cuentaMayor) {
        toast({
          title: "Advertencia",
          description: "La cuenta mayor no existe.",
          variant: "warning",
        });
        return false;
      }

      if (cuentaMayor.nivel >= cuentaContable.nivel) {
        toast({
          title: "Advertencia",
          description:
            "El nivel de la cuenta contable debe ser mayor al de su cuenta mayor.",
          variant: "warning",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (data) => {
    try {
      if (!validar(data, cuentasContables)) return;

      if (data.id === 0) {
        const newCuentaContable = await createCuentaContable(data);
        setCuentasContables([newCuentaContable, ...cuentasContables]);
      } else {
        if (data.tipoCuentaId)
          data.tipoCuentaId = Number.parseInt(data.tipoCuentaId);
        else data.tipoCuentaId = null;

        if (data.cuentaMayorId)
          data.cuentaMayorId = Number.parseInt(data.cuentaMayorId);
        else data.cuentaMayorId = null;

        const updatedCuentaContable = await updateCuentaContable(data.id, data);
        setCuentasContables(
          cuentasContables.map((cc) =>
            cc.id === updatedCuentaContable.id ? updatedCuentaContable : cc
          )
        );
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error en CuentaContableHandleSubmit", err);
    }
  };

  const columns = [
    { key: "descripcion", header: "Descripción" },
    {
      key: "tipoCuenta",
      header: "Tipo de Cuenta",
      render: (row) =>
        tiposCuenta.find((tc) => tc.id === row.tipoCuentaId)?.descripcion ||
        "N/A",
    },
    {
      key: "permiteTransacciones",
      header: "Permite Transacciones",
      render: (row) => (row.permiteTransacciones ? "✅ Sí" : "❌ No"),
    },
    { key: "nivel", header: "Nivel" },
    { key: "balance", header: "Balance" },
    {
      key: "cuentaMayor",
      header: "Cuenta Mayor",
      render: (row) =>
        cuentasContables.find((c) => c.id === row.cuentaMayorId)?.descripcion ||
        "N/A",
    },
    {
      key: "estado",
      header: "Estado",
      render: (row) => (row.estado ? "✅ Activo" : "❌ Inactivo"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Cuentas Contables</h1>
        <Button onClick={handleCreate}>+ Agregar Cuenta Contable</Button>
      </div>
      <DataTable
        columns={columns}
        data={cuentasContables}
        onEdit={handleEdit}
        onDelete={(cc) => handleDelete(cc.id)}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          currentCuentaContable
            ? "Editar Cuenta Contable"
            : "Nueva Cuenta Contable"
        }
      >
        <CuentaContableForm
          cuentaContable={currentCuentaContable}
          tiposCuenta={tiposCuenta}
          cuentasContables={cuentasContables}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default CuentaContable;
