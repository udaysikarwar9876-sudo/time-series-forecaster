import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ModelType = 'cpi' | 'gdp' | 'weather' | 'disease' | 'drug' | 'epidemiology' | 'agriculture' | 'climate' | 'gold' | 'silver';

interface ModelConfiguration {
  id: string;
  name: string;
  model_type: ModelType;
  configuration: any;
  prediction_result: any;
  created_at: string;
  updated_at: string;
}

export const useModelConfigurations = (modelType: ModelType) => {
  const [configurations, setConfigurations] = useState<ModelConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('model_configurations')
        .select('*')
        .eq('model_type', modelType)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConfigurations(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading configurations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, [modelType]);

  const saveConfiguration = async (name: string, configuration: any, predictionResult: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('model_configurations')
        .insert({
          user_id: user.id,
          name,
          model_type: modelType,
          configuration,
          prediction_result: predictionResult,
        });

      if (error) throw error;

      toast({
        title: "Configuration saved",
        description: `"${name}" has been saved successfully.`,
      });

      await fetchConfigurations();
    } catch (error: any) {
      toast({
        title: "Error saving configuration",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadConfiguration = (config: ModelConfiguration) => {
    return {
      configuration: config.configuration,
      predictionResult: config.prediction_result,
    };
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('model_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Configuration deleted",
        description: "The configuration has been deleted.",
      });

      await fetchConfigurations();
    } catch (error: any) {
      toast({
        title: "Error deleting configuration",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    configurations,
    loading,
    saveConfiguration,
    loadConfiguration,
    deleteConfiguration,
    refreshConfigurations: fetchConfigurations,
  };
};
