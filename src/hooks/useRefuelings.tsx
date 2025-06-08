
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Refueling = Tables<'refuelings'>;
type RefuelingInsert = TablesInsert<'refuelings'>;
type RefuelingUpdate = TablesUpdate<'refuelings'>;

export const useRefuelings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refuelingsQuery = useQuery({
    queryKey: ['refuelings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('refuelings')
        .select(`
          *,
          vehicle:vehicles(id, name, brand, model)
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching refuelings:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const createRefueling = useMutation({
    mutationFn: async (refueling: Omit<RefuelingInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('refuelings')
        .insert({ ...refueling, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuelings'] });
      toast({
        title: "Abastecimento registrado!",
        description: "Seu abastecimento foi salvo com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar abastecimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRefueling = useMutation({
    mutationFn: async ({ id, ...updates }: RefuelingUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('refuelings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuelings'] });
      toast({
        title: "Abastecimento atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar abastecimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRefueling = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('refuelings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuelings'] });
      toast({
        title: "Abastecimento removido!",
        description: "O registro foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover abastecimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    refuelings: refuelingsQuery.data || [],
    isLoading: refuelingsQuery.isLoading,
    error: refuelingsQuery.error,
    createRefueling,
    updateRefueling,
    deleteRefueling,
  };
};
