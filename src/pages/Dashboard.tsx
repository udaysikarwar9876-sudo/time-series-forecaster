import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ModelType } from "@/hooks/useModelConfigurations";

interface ModelConfiguration {
  id: string;
  name: string;
  model_type: ModelType;
  configuration: any;
  prediction_result: any;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [configurations, setConfigurations] = useState<ModelConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated_at");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchConfigurations();
  }, [user, navigate]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("model_configurations")
        .select("*")
        .order("updated_at", { ascending: false });

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

  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("model_configurations")
        .delete()
        .eq("id", id);

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

  const getModelTypeLabel = (type: ModelType) => {
    const labels: Record<ModelType, string> = {
      cpi: "Consumer Price Index",
      gdp: "National GDP",
      weather: "Weather",
      disease: "Disease",
      drug: "Drug",
      epidemiology: "Epidemiology",
      agriculture: "Agriculture",
      climate: "Climate",
    };
    return labels[type];
  };

  const getModelTypeColor = (type: ModelType) => {
    const colors: Record<ModelType, string> = {
      cpi: "bg-blue-500",
      gdp: "bg-green-500",
      weather: "bg-cyan-500",
      disease: "bg-red-500",
      drug: "bg-purple-500",
      epidemiology: "bg-orange-500",
      agriculture: "bg-yellow-500",
      climate: "bg-teal-500",
    };
    return colors[type];
  };

  const filteredConfigurations = configurations
    .filter((config) => filterType === "all" || config.model_type === filterType)
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "created_at") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Model Configurations Dashboard</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Saved Configurations</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cpi">CPI</SelectItem>
                    <SelectItem value="gdp">GDP</SelectItem>
                    <SelectItem value="weather">Weather</SelectItem>
                    <SelectItem value="disease">Disease</SelectItem>
                    <SelectItem value="drug">Drug</SelectItem>
                    <SelectItem value="epidemiology">Epidemiology</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="climate">Climate</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at">Last Updated</SelectItem>
                    <SelectItem value="created_at">Date Created</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredConfigurations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {filterType === "all"
                  ? "No configurations saved yet."
                  : "No configurations found for this filter."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConfigurations.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell className="font-medium">{config.name}</TableCell>
                        <TableCell>
                          <Badge className={getModelTypeColor(config.model_type)}>
                            {getModelTypeLabel(config.model_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(config.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(config.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteConfiguration(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
