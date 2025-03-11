import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { getSistemasAuxiliares, createSistemaAuxiliar, updateSistemaAuxiliar, deleteSistemaAuxiliar } from '@/api/sistemaAuxiliarApi';
import { useToast } from '@/hooks/use-toast';

const columns = [
  { key: 'descripcion', header: 'Descripción' },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) => (row.estado ? '✅ Activo' : '❌ Inactivo'),
  },
];

const SistemaAuxiliarForm = ({ sistemaAuxiliar, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: sistemaAuxiliar?.id || 0,
    descripcion: sistemaAuxiliar?.descripcion || '',
    estado: sistemaAuxiliar?.estado ?? true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} required />
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
              onChange={(e) => setFormData((prev) => ({ ...prev, estado: e.target.checked }))}
              className="h-5 w-5 accent-blue-500 cursor-pointer"
            />
            <span>{formData.estado ? '✅ Activo' : '❌ Inactivo'}</span>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{formData.id !== 0 ? 'Actualizar Sistema Auxiliar' : 'Crear Sistema Auxiliar'}</Button>
      </div>
    </form>
  );
};

const SistemaAuxiliar = () => {
  const [sistemasAuxiliares, setSistemasAuxiliares] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSistemaAuxiliar, setCurrentSistemaAuxiliar] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    getSistemasAuxiliares().then(setSistemasAuxiliares);
  }, []);

  const handleCreate = () => {
    setCurrentSistemaAuxiliar(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sistemaAuxiliar) => {
    setCurrentSistemaAuxiliar(sistemaAuxiliar);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteSistemaAuxiliar(id);
    setSistemasAuxiliares(sistemasAuxiliares.filter(sa => sa.id !== id));
    toast({ title: 'Sistema Auxiliar Eliminado' });
  };

  const handleSubmit = async (data) => {
    if (data.id === 0) {
      const newSistemaAuxiliar = await createSistemaAuxiliar(data);
      setSistemasAuxiliares([newSistemaAuxiliar, ...sistemasAuxiliares]);
    } else {
      const updatedSistemaAuxiliar = await updateSistemaAuxiliar(data.id, data);
      setSistemasAuxiliares(sistemasAuxiliares.map(sa => (sa.id === updatedSistemaAuxiliar.id ? updatedSistemaAuxiliar : sa)));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Sistemas Auxiliares</h2>
        <Button onClick={handleCreate}>+ Agregar Sistema Auxiliar</Button>
      </div>
      <DataTable columns={columns} data={sistemasAuxiliares} onEdit={handleEdit} onDelete={(sa) => handleDelete(sa.id)} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentSistemaAuxiliar ? 'Editar Sistema Auxiliar' : 'Nuevo Sistema Auxiliar'}>
        <SistemaAuxiliarForm sistemaAuxiliar={currentSistemaAuxiliar} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default SistemaAuxiliar;
