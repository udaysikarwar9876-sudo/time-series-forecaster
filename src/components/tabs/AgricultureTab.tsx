import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from "recharts";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { multipleLinearRegression } from "@/lib/regression";

interface DataPoint {
  rainfall: number;
  fertilizer: number;
  yield: number;
}

const AgricultureTab = () => {
  const [data, setData] = useState<DataPoint[]>([
    { rainfall: 600, fertilizer: 40, yield: 4.2 },
    { rainfall: 800, fertilizer: 50, yield: 6.5 },
    { rainfall: 1000, fertilizer: 60, yield: 7.8 },
    { rainfall: 700, fertilizer: 45, yield: 5.1 },
  ]);
  const [rainfall, setRainfall] = useState(850);
  const [fertilizer, setFertilizer] = useState(55);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [coefficients, setCoefficients] = useState({ a: 0, b: 0, c: 0 });

  const addDataPoint = () => {
    setData([...data, { rainfall: 800, fertilizer: 50, yield: 6 }]);
  };

  const removeDataPoint = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const updateDataPoint = (index: number, field: keyof DataPoint, value: number) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  const calculateRegression = () => {
    if (data.length < 2) return;

    // Prepare data for multiple linear regression: Y = a + b*R + c*F
    const X = data.map(d => [d.rainfall, d.fertilizer]);
    const y = data.map(d => d.yield);

    // Use least squares method
    const coef = multipleLinearRegression(X, y);
    
    // coef[0] is intercept, coef[1] is rainfall coefficient, coef[2] is fertilizer coefficient
    setCoefficients({ a: coef[0], b: coef[1], c: coef[2] });

    // Calculate prediction
    const predictedYield = coef[0] + coef[1] * rainfall + coef[2] * fertilizer;
    setPrediction(predictedYield);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Data Input & Prediction
          </CardTitle>
          <CardDescription>
            Model: Y = a + b·R + c·F
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.map((point, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Rainfall (mm)</Label>
                  <Input
                    type="number"
                    value={point.rainfall}
                    onChange={(e) => updateDataPoint(index, "rainfall", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Fertilizer (kg/ha)</Label>
                  <Input
                    type="number"
                    value={point.fertilizer}
                    onChange={(e) => updateDataPoint(index, "fertilizer", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Yield (tons/ha)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={point.yield}
                    onChange={(e) => updateDataPoint(index, "yield", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeDataPoint(index)}
                  disabled={data.length <= 2}
                  className="h-9 w-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={addDataPoint} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Data Point
          </Button>

          <div className="pt-4 border-t space-y-3">
            <div>
              <Label htmlFor="pred-rainfall">Rainfall (mm)</Label>
              <Input
                id="pred-rainfall"
                type="number"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pred-fertilizer">Fertilizer (kg/ha)</Label>
              <Input
                id="pred-fertilizer"
                type="number"
                value={fertilizer}
                onChange={(e) => setFertilizer(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <Button onClick={calculateRegression} className="w-full" disabled={data.length < 2}>
            Calculate Yield Prediction
          </Button>

          {prediction !== null && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm font-medium">Least Squares Coefficients:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>β₀ (intercept) = {coefficients.a.toFixed(4)}</p>
                <p>β₁ (rainfall) = {coefficients.b.toFixed(6)}</p>
                <p>β₂ (fertilizer) = {coefficients.c.toFixed(6)}</p>
              </div>
              <p className="text-lg font-bold text-primary mt-3">
                Predicted Yield: {prediction.toFixed(2)} tons/ha
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Yield Distribution</CardTitle>
          <CardDescription>Training data visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="rainfall" 
                name="Rainfall" 
                unit=" mm"
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis 
                dataKey="yield" 
                name="Yield" 
                unit=" t/ha"
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <ZAxis dataKey="fertilizer" range={[50, 400]} name="Fertilizer" unit=" kg/ha" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Legend />
              <Scatter 
                name="Crop Data" 
                data={data} 
                fill="hsl(var(--chart-3))"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgricultureTab;
