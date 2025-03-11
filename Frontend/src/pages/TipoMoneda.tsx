import React, { useState, useEffect } from 'react';
import { PackagePlus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { getTiposMoneda, createTipoMoneda, updateTipoMoneda, deleteTipoMoneda } from '@/api/tipoMonedaApi';


const columns = [
    { key: "codigoISO", header: "Código ISO" },
    { key: "descripcion", header: "Descripción" },
    { key: "ultimaTasaCambiaria", header: "Última Tasa Cambiaria" },
    { 
      key: "estado", 
      header: "Estado", 
      render: (row: any) => {
        return row.estado ? "✅ Activo" : "❌ Inactivo";
      }
    }
];
  

const MonedaForm = ({ moneda, onSubmit, onCancel }: { moneda: any, onSubmit: any, onCancel: any }) => {
  const [formData, setFormData] = useState({
    id: moneda?.id || 0,
    codigoISO: moneda?.codigoISO || '',
    descripcion: moneda?.descripcion || '',
    ultimaTasaCambiaria: moneda?.ultimaTasaCambiaria || '',
    estado: moneda?.estado || true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codigoISO">Código ISO</Label>
        <Input id="codigoISO" name="codigoISO" value={formData.codigoISO} onChange={handleChange} placeholder="Ej: USD, EUR" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Nombre de la moneda" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ultimaTasaCambiaria">Última Tasa Cambiaria</Label>
        <Input id="ultimaTasaCambiaria" name="ultimaTasaCambiaria" type="number" value={formData.ultimaTasaCambiaria} onChange={handleChange} placeholder="Ej: 57.5" required />
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
          onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.checked }))}
          className="h-5 w-5 accent-blue-500 cursor-pointer"
        />
        <span>{formData.estado ? "✅ Activo" : "❌ Inactivo"}</span>
      </div>
    </div>
  )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{moneda ? 'Actualizar Moneda' : 'Crear Moneda'}</Button>
      </div>
    </form>
  );
};

const TipoMoneda = () => {
  const [monedas, setMonedas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMoneda, setCurrentMoneda] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTiposMoneda();
      setMonedas(data);
    };
    fetchData();
  }, []);

  const handleCreateMoneda = () => {
    setCurrentMoneda(null);
    setIsModalOpen(true);
  };

  const handleEditMoneda = (moneda: any) => {
    setCurrentMoneda(moneda);
    setIsModalOpen(true);
  };

  const handleSubmitMoneda = async (monedaData: any) => {
    try {
      if (monedaData.id === 0) {
        const newMoneda = await createTipoMoneda(monedaData);
        setMonedas([newMoneda, ...monedas]);
        toast({ title: "Moneda Creada", description: `${newMoneda.descripcion} fue agregada correctamente.` });
      } else {
        const updatedMoneda = await updateTipoMoneda(monedaData.id, monedaData);
        setMonedas(monedas.map(m => (m.id === updatedMoneda.id ? updatedMoneda : m)));
        toast({ title: "Moneda Actualizada", description: `${updatedMoneda.descripcion} fue actualizada correctamente.` });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la moneda.", variant: "destructive" });
    }
  };

  const handleDeleteMoneda = async (id: number) => {
    try {
      await deleteTipoMoneda(id);
      setMonedas(monedas.filter(m => m.id !== id));
      toast({ title: "Moneda Eliminada", description: "Se eliminó correctamente.", variant: "destructive" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Tipos de Moneda</h2>
        <Button onClick={handleCreateMoneda}>
          <PackagePlus className="mr-2 h-4 w-4" /> Agregar Moneda
        </Button>
      </div>

      <DataTable columns={columns} data={monedas} onEdit={handleEditMoneda} onDelete={(moneda: any) => handleDeleteMoneda(moneda.id)} />
      


      {/* Modal for Adding/Editing Moneda */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Gestionar Tipo de Moneda">
        <MonedaForm moneda={currentMoneda} onSubmit={handleSubmitMoneda} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default TipoMoneda;
