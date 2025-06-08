
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'>;
type VehicleInsert = TablesInsert<'vehicles'>;
type VehicleUpdate = TablesUpdate<'vehicles'>;

export const useVehicles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const createVehicle = useMutation({
    mutationFn: async (vehicle: Omit<VehicleInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vehicles')
        .insert({ ...vehicle, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', user?.id] });
      toast({
        title: "Veículo criado!",
        description: "Seu veículo foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateVehicle = useMutation({
    mutationFn: async ({ id, ...updates }: VehicleUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', user?.id] });
      toast({
        title: "Veículo atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', user?.id] });
      toast({
        title: "Veículo removido!",
        description: "O veículo foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    vehicles: vehiclesQuery.data || [],
    isLoading: vehiclesQuery.isLoading,
    error: vehiclesQuery.error,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
};
