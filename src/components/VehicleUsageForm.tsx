
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent as DrawerContentUI,
  DrawerDescription as DrawerDescriptionUI,
  DrawerFooter as DrawerFooterUI,
  DrawerHeader as DrawerHeaderUI,
  DrawerTitle as DrawerTitleUI,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useVehicles } from '@/hooks/useVehicles';
import { VehicleUsage } from '@/hooks/useVehicleUsage';

const formSchema = z.object({
  vehicle_id: z.string().min(1, 'Veículo é obrigatório'),
  fuel_type: z.string().min(1, 'Tipo de combustível é obrigatório'),
  initial_odometer: z.number().optional(),
  final_odometer: z.number().optional(),
  km_driven: z.number().optional(),
  estimated_liters: z.number().optional(),
  price_per_liter: z.number().optional(),
  total_cost: z.number().optional(),
  gas_station: z.string().optional(),
  is_paid: z.boolean().default(false),
  date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface VehicleUsageFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  usage?: VehicleUsage | null;
  isLoading?: boolean;
}

export const VehicleUsageForm = ({
  isOpen,
  onOpenChange,
  onSubmit,
  usage,
  isLoading = false,
}: VehicleUsageFormProps) => {
  const { vehicles } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_id: '',
      fuel_type: '',
      initial_odometer: undefined,
      final_odometer: undefined,
      km_driven: undefined,
      estimated_liters: undefined,
      price_per_liter: undefined,
      total_cost: undefined,
      gas_station: '',
      is_paid: false,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const watchedValues = form.watch();

  // Atualizar formulário quando há edição
  useEffect(() => {
    if (usage) {
      form.reset({
        vehicle_id: usage.vehicle_id,
        fuel_type: usage.fuel_type,
        initial_odometer: usage.initial_odometer || undefined,
        final_odometer: usage.final_odometer || undefined,
        km_driven: usage.km_driven || undefined,
        estimated_liters: usage.estimated_liters || undefined,
        price_per_liter: usage.price_per_liter || undefined,
        total_cost: usage.total_cost || undefined,
        gas_station: usage.gas_station || '',
        is_paid: usage.is_paid,
        date: usage.date,
        notes: usage.notes || '',
      });
    } else {
      form.reset({
        vehicle_id: '',
        fuel_type: '',
        initial_odometer: undefined,
        final_odometer: undefined,
        km_driven: undefined,
        estimated_liters: undefined,
        price_per_liter: undefined,
        total_cost: undefined,
        gas_station: '',
        is_paid: false,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [usage, form]);

  // Encontrar veículo selecionado
  useEffect(() => {
    if (watchedValues.vehicle_id) {
      const vehicle = vehicles.find(v => v.id === watchedValues.vehicle_id);
      setSelectedVehicle(vehicle);
    }
  }, [watchedValues.vehicle_id, vehicles]);

  // Calcular km rodado automaticamente
  useEffect(() => {
    if (watchedValues.initial_odometer && watchedValues.final_odometer) {
      const kmDriven = watchedValues.final_odometer - watchedValues.initial_odometer;
      if (kmDriven > 0) {
        form.setValue('km_driven', kmDriven);
      }
    }
  }, [watchedValues.initial_odometer, watchedValues.final_odometer, form]);

  // Calcular litros estimados
  useEffect(() => {
    if (selectedVehicle && watchedValues.km_driven && watchedValues.fuel_type) {
      const consumptionKey = `${watchedValues.fuel_type}_consumption`;
      const consumption = selectedVehicle[consumptionKey];
      
      if (consumption && consumption > 0) {
        const estimatedLiters = watchedValues.km_driven / consumption;
        form.setValue('estimated_liters', Number(estimatedLiters.toFixed(2)));
      }
    }
  }, [selectedVehicle, watchedValues.km_driven, watchedValues.fuel_type, form]);

  // Calcular custo total
  useEffect(() => {
    if (watchedValues.estimated_liters && watchedValues.price_per_liter) {
      const totalCost = watchedValues.estimated_liters * watchedValues.price_per_liter;
      form.setValue('total_cost', Number(totalCost.toFixed(2)));
    }
  }, [watchedValues.estimated_liters, watchedValues.price_per_liter, form]);

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data);
    if (!usage) {
      form.reset();
    }
  };

  const getFuelTypeLabel = (type: string) => {
    const types = {
      gasoline: 'Gasolina',
      ethanol: 'Etanol',
      diesel: 'Diesel',
      flex: 'Flex',
      electric: 'Elétrico',
      hybrid: 'Híbrido'
    };
    return types[type] || type;
  };

  const costPerKm = watchedValues.total_cost && watchedValues.km_driven 
    ? (watchedValues.total_cost / watchedValues.km_driven).toFixed(3)
    : null;

  const consumptionComparison = selectedVehicle && watchedValues.fuel_type && watchedValues.km_driven && watchedValues.estimated_liters
    ? (() => {
        const consumptionKey = `${watchedValues.fuel_type}_consumption`;
        const expectedConsumption = selectedVehicle[consumptionKey];
        const actualConsumption = watchedValues.km_driven / watchedValues.estimated_liters;
        
        if (expectedConsumption) {
          const difference = ((actualConsumption - expectedConsumption) / expectedConsumption * 100);
          return {
            expected: expectedConsumption,
            actual: actualConsumption.toFixed(2),
            difference: difference.toFixed(1)
          };
        }
        return null;
      })()
    : null;

  const isMobile = useIsMobile();
  const Modal = isMobile ? Drawer : Dialog;
  const ModalContent = isMobile ? DrawerContentUI : DialogContent;
  const ModalHeader = isMobile ? DrawerHeaderUI : DialogHeader;
  const ModalTitle = isMobile ? DrawerTitleUI : DialogTitle;
  const ModalDescription = isMobile ? DrawerDescriptionUI : DialogDescription;
  const ModalFooter = isMobile ? DrawerFooterUI : DialogFooter;

  return (
    <Modal open={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className={`${isMobile ? '' : 'sm:max-w-[600px]'} max-h-[90vh] overflow-y-auto`}>
        <ModalHeader>
          <ModalTitle>
            {usage ? 'Editar Registro de Uso' : 'Novo Registro de Uso do Veículo'}
          </ModalTitle>
          <ModalDescription>
            Registre o uso do seu veículo e acompanhe consumo e custos automaticamente.
          </ModalDescription>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicle_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veículo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o veículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Combustível *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o combustível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gasoline">Gasolina</SelectItem>
                        <SelectItem value="ethanol">Etanol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="flex">Flex</SelectItem>
                        <SelectItem value="electric">Elétrico</SelectItem>
                        <SelectItem value="hybrid">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="initial_odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Km Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Km inicial"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="final_odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Km Final</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Km final"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="km_driven"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Km Rodado</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Km rodado"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estimated_liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Litros Estimados</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="Litros"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_per_liter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço por Litro</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="R$ 0,00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total a Pagar</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="R$ 0,00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Cálculos Automáticos */}
            {(costPerKm || consumptionComparison) && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-blue-900">Cálculos Automáticos:</h4>
                {costPerKm && (
                  <p className="text-blue-800">💰 Custo por km: R$ {costPerKm}</p>
                )}
                {consumptionComparison && (
                  <div className="text-blue-800">
                    <p>📊 Consumo esperado: {consumptionComparison.expected} km/l</p>
                    <p>📈 Consumo real: {consumptionComparison.actual} km/l</p>
                    <p className={`font-medium ${Number(consumptionComparison.difference) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(consumptionComparison.difference) >= 0 ? '↗️' : '↘️'} 
                      Diferença: {consumptionComparison.difference}%
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gas_station"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do posto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_paid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Abastecimento já foi pago *</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : usage ? 'Atualizar' : 'Salvar'}
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
