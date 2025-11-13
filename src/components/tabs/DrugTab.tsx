import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calculator, Plus, Trash2 } from "lucide-react";

interface DataPoint {
  dose: number;
  effect: number;
}

const DrugTab = () => {
  const [data, setData] = useState<DataPoint[]>([
    { dose: 1, effect: 5 },
    { dose: 5, effect: 25 },
    { dose: 10, effect: 50 },
    { dose: 50, effect: 85 },
    { dose: 100, effect: 95 },
  ]);
  const [targetDose, setTargetDose] = useState(20);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [ec50, setEc50] = useState(0);
  const [eMax, setEMax] = useState(0);

  const addDataPoint = () => {
    setData([...data, { dose: 25, effect: 60 }]);
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
    if (data.length < 3) return;

    // Simplified Hill equation fitting: E = E_max * D / (K + D)
    // Using approximations for demonstration
    const maxEffect = Math.max(...data.map(d => d.effect));
    setEMax(maxEffect);
    
    // Estimate EC50 as the dose where effect ≈ 50% of max
    const halfMax = maxEffect / 2;
    const closestPoint = data.reduce((prev, curr) => 
      Math.abs(curr.effect - halfMax) < Math.abs(prev.effect - halfMax) ? curr : prev
    );
    const estimatedK = closestPoint.dose;
    setEc50(estimatedK);

    // Calculate prediction
    const predictedEffect = (maxEffect * targetDose) / (estimatedK + targetDose);
    setPrediction(predictedEffect);
  };

  const generateCurve = () => {
    const curve = [];
    for (let dose = 0; dose <= Math.max(100, targetDose); dose += 5) {
      const effect = (eMax * dose) / (ec50 + dose);
      curve.push({ dose, fitted: effect, actual: null });
    }
    
    data.forEach(point => {
      const closest = curve.find(c => Math.abs(c.dose - point.dose) < 2.5);
      if (closest) {
        closest.actual = point.effect;
      } else {
        curve.push({ dose: point.dose, fitted: null, actual: point.effect });
      }
    });
    
    return curve.sort((a, b) => a.dose - b.dose);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Dose-Response Data
          </CardTitle>
          <CardDescription>
            Model: E = E_max·D / (K + D)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.map((point, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Dose (mg)</Label>
                  <Input
                    type="number"
                    value={point.dose}
                    onChange={(e) => updateDataPoint(index, "dose", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Effect (%)</Label>
                  <Input
                    type="number"
                    value={point.effect}
                    onChange={(e) => updateDataPoint(index, "effect", Number(e.target.value))}
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

          <div className="pt-4 border-t">
            <Label htmlFor="target-dose">Target Dose (mg)</Label>
            <Input
              id="target-dose"
              type="number"
              value={targetDose}
              onChange={(e) => setTargetDose(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <Button onClick={calculateRegression} className="w-full" disabled={data.length < 3}>
            Calculate Effect Prediction
          </Button>

          {prediction !== null && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm font-medium">Drug Parameters:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>E_max = {eMax.toFixed(2)}%</p>
                <p>EC₅₀ (K) = {ec50.toFixed(2)} mg</p>
              </div>
              <p className="text-lg font-bold text-primary mt-3">
                Predicted Effect at {targetDose}mg: {prediction.toFixed(1)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Dose-Response Curve</CardTitle>
          <CardDescription>Sigmoid curve fitting visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={eMax > 0 ? generateCurve() : data.map(d => ({ dose: d.dose, actual: d.effect, fitted: null }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="dose" 
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
                label={{ value: 'Dose (mg)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
                label={{ value: 'Effect (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--chart-5))" 
                strokeWidth={0}
                dot={{ fill: "hsl(var(--chart-5))", r: 5 }}
                name="Observed"
              />
              <Line 
                type="monotone" 
                dataKey="fitted" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={false}
                name="Fitted Curve"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrugTab;
