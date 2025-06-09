
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent as DrawerContentUI, DrawerDescription as DrawerDescriptionUI, DrawerFooter as DrawerFooterUI, DrawerHeader as DrawerHeaderUI, DrawerTitle as DrawerTitleUI } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVehicles } from '@/hooks/useVehicles';
import type { Tables } from '@/integrations/supabase/types';

type Refueling = Tables<'refuelings'>;

interface RefuelingFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (refueling: Omit<Refueling, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  refueling?: Refueling | null;
  isLoading?: boolean;
}

export const calculateTotal = (liters: number, pricePerLiter: number) => {
  return (liters * pricePerLiter).toFixed(2);
};

export const RefuelingForm = ({ isOpen, onOpenChange, onSubmit, refueling, isLoading }: RefuelingFormProps) => {
  const { vehicles } = useVehicles();
  const [formData, setFormData] = useState({
    vehicle_id: refueling?.vehicle_id || '',
    date: refueling?.date || new Date().toISOString().split('T')[0],
    liters: refueling?.liters || 0,
    price_per_liter: refueling?.price_per_liter || 0,
    total_cost: refueling?.total_cost || 0,
    odometer: refueling?.odometer || null,
    gas_station: refueling?.gas_station || '',
    notes: refueling?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      liters: Number(formData.liters),
      price_per_liter: Number(formData.price_per_liter),
      total_cost: Number(formData.total_cost),
    });
    if (!refueling) {
      setFormData({
        vehicle_id: '',
        date: new Date().toISOString().split('T')[0],
        liters: 0,
        price_per_liter: 0,
        total_cost: 0,
        odometer: null,
        gas_station: '',
        notes: '',
      });
    }
  };


  const handleLitersChange = (value: string) => {
    const liters = Number(value);
    const total = calculateTotal(liters, formData.price_per_liter);
    setFormData({ ...formData, liters, total_cost: Number(total) });
  };

  const handlePriceChange = (value: string) => {
    const price = Number(value);
    const total = calculateTotal(formData.liters, price);
    setFormData({ ...formData, price_per_liter: price, total_cost: Number(total) });
  };

  const isMobile = useIsMobile();
  const Modal = isMobile ? Drawer : Dialog;
  const ModalContent = isMobile ? DrawerContentUI : DialogContent;
  const ModalHeader = isMobile ? DrawerHeaderUI : DialogHeader;
  const ModalTitle = isMobile ? DrawerTitleUI : DialogTitle;
  const ModalDescription = isMobile ? DrawerDescriptionUI : DialogDescription;
  const ModalFooter = isMobile ? DrawerFooterUI : DialogFooter;

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="flex flex-col h-[90svh] p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-y-auto px-6 py-4 space-y-4">
          <ModalHeader>
            <ModalTitle>{refueling ? 'Editar Abastecimento' : 'Novo Abastecimento'}</ModalTitle>
            <ModalDescription>
              {refueling ? 'Edite as informações do abastecimento.' : 'Registre um novo abastecimento.'}
            </ModalDescription>
          </ModalHeader>
          </form>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">Veículo *</Label>
            <Select 
              value={formData.vehicle_id} 
              onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} {vehicle.brand && `- ${vehicle.brand}`} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liters">Litros *</Label>
              <Input
                id="liters"
                type="number"
                step="0.001"
                min="0"
                value={formData.liters || ''}
                onChange={(e) => handleLitersChange(e.target.value)}
                placeholder="0.000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_liter">Preço por Litro *</Label>
              <Input
                id="price_per_liter"
                type="number"
                step="0.001"
                min="0"
                value={formData.price_per_liter || ''}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0.000"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_cost">Total (R$)</Label>
            <Input
              id="total_cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.total_cost || ''}
              onChange={(e) => setFormData({ ...formData, total_cost: Number(e.target.value) })}
              placeholder="0.00"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="odometer">Quilometragem</Label>
            <Input
              id="odometer"
              type="number"
              min="0"
              value={formData.odometer || ''}
              onChange={(e) => setFormData({ ...formData, odometer: e.target.value ? Number(e.target.value) : null })}
              placeholder="Ex: 15000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gas_station">Posto</Label>
            <Input
              id="gas_station"
              value={formData.gas_station}
              onChange={(e) => setFormData({ ...formData, gas_station: e.target.value })}
              placeholder="Ex: Shell Centro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>
          <ModalFooter className="sticky bottom-0 left-0 z-10 bg-background border-t p-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
            </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
