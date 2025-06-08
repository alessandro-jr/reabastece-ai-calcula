
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Gerar dados aleatórios para o registro de atividade
    const randomActions = [
      'daily_heartbeat',
      'system_check',
      'maintenance_ping',
      'activity_log',
      'health_check'
    ];
    
    const randomAction = randomActions[Math.floor(Math.random() * randomActions.length)];
    const randomData = {
      source: 'automated_task',
      random_number: Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      environment: 'production'
    };

    // Inserir registro de atividade
    const { data, error } = await supabase
      .from('activity_log')
      .insert({
        action: randomAction,
        data: randomData
      });

    if (error) {
      console.error('Erro ao inserir registro de atividade:', error);
      throw error;
    }

    console.log('Registro de atividade inserido com sucesso:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Registro de atividade inserido com sucesso',
        action: randomAction,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na função daily-activity:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
