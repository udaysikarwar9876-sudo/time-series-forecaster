import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from "recharts";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { multipleLinearRegression } from "@/lib/regression";

interface DataPoint {
  investment: number;
  consumption: number;
  exports: number;
  gdp: number;
}

const NationalGDPTab = () => {
  const [data, setData] = useState<DataPoint[]>([
    { investment: 500, consumption: 3000, exports: 800, gdp: 4500 },
    { investment: 600, consumption: 3200, exports: 900, gdp: 4900 },
    { investment: 550, consumption: 3100, exports: 850, gdp: 4650 },
    { investment: 700, consumption: 3400, exports: 1000, gdp: 5300 },
  ]);
  const [investment, setInvestment] = useState(650);
  const [consumption, setConsumption] = useState(3300);
  const [exports, setExports] = useState(950);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [coefficients, setCoefficients] = useState({ a: 0, b: 0, c: 0, d: 0 });

  const addDataPoint = () => {
    setData([...data, { investment: 600, consumption: 3200, exports: 900, gdp: 5000 }]);
  };

  const removeDataPoint = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const updateDataPoint = (index: number, field: keyof DataPoint, value: number) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  const calculatePrediction = () => {
    if (data.length < 2) return;

    // Prepare data for multiple linear least squares: GDP = a + b*I + c*C + d*E
    const X = data.map(d => [d.investment, d.consumption, d.exports]);
    const y = data.map(d => d.gdp);

    // Use least squares method
    const coef = multipleLinearRegression(X, y);
    
    // coef[0] is intercept, coef[1] is investment, coef[2] is consumption, coef[3] is exports
    setCoefficients({ a: coef[0], b: coef[1], c: coef[2], d: coef[3] });

    // Calculate prediction
    const predictedGDP = coef[0] + coef[1] * investment + coef[2] * consumption + coef[3] * exports;
    setPrediction(predictedGDP);
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
            Model: GDP = a + b·I + c·C + d·E (Least Squares Method)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.map((point, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Investment (B)</Label>
                  <Input
                    type="number"
                    value={point.investment}
                    onChange={(e) => updateDataPoint(index, "investment", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Consumption (B)</Label>
                  <Input
                    type="number"
                    value={point.consumption}
                    onChange={(e) => updateDataPoint(index, "consumption", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Exports (B)</Label>
                  <Input
                    type="number"
                    value={point.exports}
                    onChange={(e) => updateDataPoint(index, "exports", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">GDP (B)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={point.gdp}
                    onChange={(e) => updateDataPoint(index, "gdp", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeDataPoint(index)}
                  className="h-9"
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

          <div className="border-t pt-4 space-y-3">
            <div>
              <Label>Investment (Billions)</Label>
              <Input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Consumption (Billions)</Label>
              <Input
                type="number"
                value={consumption}
                onChange={(e) => setConsumption(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Exports (Billions)</Label>
              <Input
                type="number"
                value={exports}
                onChange={(e) => setExports(Number(e.target.value))}
              />
            </div>

            <Button onClick={calculatePrediction} className="w-full">
              Calculate GDP
            </Button>

            {prediction !== null && (
              <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Least Squares Coefficients:</p>
                <p className="text-xs">a (intercept) = {coefficients.a.toFixed(2)}</p>
                <p className="text-xs">b (investment) = {coefficients.b.toFixed(4)}</p>
                <p className="text-xs">c (consumption) = {coefficients.c.toFixed(4)}</p>
                <p className="text-xs">d (exports) = {coefficients.d.toFixed(4)}</p>
                <div className="border-t pt-2 mt-2">
                  <p className="text-sm font-semibold">
                    Predicted GDP: ${prediction.toFixed(2)} Billion
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>GDP Distribution</CardTitle>
          <CardDescription>
            Scatter plot of GDP vs Investment (bubble size = consumption)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                dataKey="investment" 
                name="Investment" 
                unit="B"
                className="text-xs" 
              />
              <YAxis 
                type="number" 
                dataKey="gdp" 
                name="GDP" 
                unit="B"
                className="text-xs" 
              />
              <ZAxis 
                type="number" 
                dataKey="consumption" 
                range={[100, 1000]} 
                name="Consumption"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Scatter 
                name="Historical GDP Data" 
                data={data} 
                fill="hsl(var(--chart-5))"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About Least Squares Method:</p>
            <p>
              Uses multiple linear least squares to model GDP = a + b·Investment + c·Consumption + d·Exports.
              The method minimizes the sum of squared errors to find the best-fit hyperplane.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NationalGDPTab;
