
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface VehicleUsage {
  id: string;
  user_id: string;
  vehicle_id: string;
  fuel_type: string;
  initial_odometer?: number;
  final_odometer?: number;
  km_driven?: number;
  estimated_liters?: number;
  price_per_liter?: number;
  total_cost?: number;
  gas_station?: string;
  is_paid: boolean;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    gasoline_consumption?: number;
    ethanol_consumption?: number;
    diesel_consumption?: number;
    flex_consumption?: number;
    electric_consumption?: number;
    hybrid_consumption?: number;
  };
}

export const useVehicleUsage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicleUsage = [], isLoading } = useQuery({
    queryKey: ['vehicle-usage', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('vehicle_usage')
        .select(`
          *,
          vehicle:vehicles (
            id,
            name,
            brand,
            model,
            gasoline_consumption,
            ethanol_consumption,
            diesel_consumption,
            flex_consumption,
            electric_consumption,
            hybrid_consumption
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicle usage:', error);
        throw error;
      }

      return data as VehicleUsage[];
    },
    enabled: !!user?.id,
  });

  const createVehicleUsage = useMutation({
    mutationFn: async (usageData: Omit<VehicleUsage, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'vehicle'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vehicle_usage')
        .insert([{ ...usageData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-usage'] });
      toast({
        title: 'Sucesso!',
        description: 'Registro de uso criado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating vehicle usage:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar registro de uso.',
        variant: 'destructive',
      });
    },
  });

  const updateVehicleUsage = useMutation({
    mutationFn: async (usageData: Partial<VehicleUsage> & { id: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vehicle_usage')
        .update(usageData)
        .eq('id', usageData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-usage'] });
      toast({
        title: 'Sucesso!',
        description: 'Registro de uso atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating vehicle usage:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar registro de uso.',
        variant: 'destructive',
      });
    },
  });

  const deleteVehicleUsage = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('vehicle_usage')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-usage'] });
      toast({
        title: 'Sucesso!',
        description: 'Registro de uso deletado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting vehicle usage:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar registro de uso.',
        variant: 'destructive',
      });
    },
  });

  return {
    vehicleUsage,
    isLoading,
    createVehicleUsage,
    updateVehicleUsage,
    deleteVehicleUsage,
  };
};
