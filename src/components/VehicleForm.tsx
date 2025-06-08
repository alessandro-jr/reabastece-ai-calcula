
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;

interface VehicleFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  vehicle?: Vehicle | null;
  isLoading?: boolean;
}

export const VehicleForm = ({ isOpen, onOpenChange, onSubmit, vehicle, isLoading }: VehicleFormProps) => {
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    fuel_type: vehicle?.fuel_type || 'gasoline',
    gasoline_consumption: vehicle?.gasoline_consumption || null,
    ethanol_consumption: vehicle?.ethanol_consumption || null,
    diesel_consumption: vehicle?.diesel_consumption || null,
    flex_consumption: vehicle?.flex_consumption || null,
    electric_consumption: vehicle?.electric_consumption || null,
    hybrid_consumption: vehicle?.hybrid_consumption || null,
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        fuel_type: vehicle.fuel_type || 'gasoline',
        gasoline_consumption: vehicle.gasoline_consumption || null,
        ethanol_consumption: vehicle.ethanol_consumption || null,
        diesel_consumption: vehicle.diesel_consumption || null,
        flex_consumption: vehicle.flex_consumption || null,
        electric_consumption: vehicle.electric_consumption || null,
        hybrid_consumption: vehicle.hybrid_consumption || null,
      });
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!vehicle) {
      setFormData({
        name: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        fuel_type: 'gasoline',
        gasoline_consumption: null,
        ethanol_consumption: null,
        diesel_consumption: null,
        flex_consumption: null,
        electric_consumption: null,
        hybrid_consumption: null,
      });
    }
  };

  const getFuelConsumptionFields = () => {
    const fuelType = formData.fuel_type;
    const fields = [];

    if (fuelType === 'gasoline' || fuelType === 'flex') {
      fields.push(
        <div key="gasoline" className="space-y-2">
          <Label htmlFor="gasoline_consumption">Consumo Gasolina (km/l)</Label>
          <Input
            id="gasoline_consumption"
            type="number"
            step="0.1"
            value={formData.gasoline_consumption || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              gasoline_consumption: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="Ex: 12.5"
          />
        </div>
      );
    }

    if (fuelType === 'ethanol' || fuelType === 'flex') {
      fields.push(
        <div key="ethanol" className="space-y-2">
          <Label htmlFor="ethanol_consumption">Consumo Etanol (km/l)</Label>
          <Input
            id="ethanol_consumption"
            type="number"
            step="0.1"
            value={formData.ethanol_consumption || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              ethanol_consumption: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="Ex: 8.5"
          />
        </div>
      );
    }

    if (fuelType === 'diesel') {
      fields.push(
        <div key="diesel" className="space-y-2">
          <Label htmlFor="diesel_consumption">Consumo Diesel (km/l)</Label>
          <Input
            id="diesel_consumption"
            type="number"
            step="0.1"
            value={formData.diesel_consumption || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              diesel_consumption: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="Ex: 15.0"
          />
        </div>
      );
    }

    if (fuelType === 'electric') {
      fields.push(
        <div key="electric" className="space-y-2">
          <Label htmlFor="electric_consumption">Consumo Elétrico (km/kWh)</Label>
          <Input
            id="electric_consumption"
            type="number"
            step="0.1"
            value={formData.electric_consumption || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              electric_consumption: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="Ex: 5.2"
          />
        </div>
      );
    }

    if (fuelType === 'hybrid') {
      fields.push(
        <div key="hybrid" className="space-y-2">
          <Label htmlFor="hybrid_consumption">Consumo Híbrido (km/l)</Label>
          <Input
            id="hybrid_consumption"
            type="number"
            step="0.1"
            value={formData.hybrid_consumption || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              hybrid_consumption: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="Ex: 18.0"
          />
        </div>
      );
    }

    return fields;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
          <DialogDescription>
            {vehicle ? 'Edite as informações do seu veículo.' : 'Adicione um novo veículo ao seu cadastro.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Veículo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Meu Carro"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ex: Toyota"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Ex: Corolla"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Input
              id="year"
              type="number"
              value={formData.year || ''}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              placeholder="Ex: 2020"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuel_type">Tipo de Combustível</Label>
            <Select 
              value={formData.fuel_type} 
              onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o combustível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasolina</SelectItem>
                <SelectItem value="ethanol">Etanol</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="flex">Flex</SelectItem>
                <SelectItem value="electric">Elétrico</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {getFuelConsumptionFields()}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : vehicle ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
