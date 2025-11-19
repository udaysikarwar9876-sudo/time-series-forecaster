import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Save, FolderOpen } from "lucide-react";
import { multipleLinearRegression } from "@/lib/regression";
import { useModelConfigurations } from "@/hooks/useModelConfigurations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WeatherTab = () => {
  const [todayTemp, setTodayTemp] = useState(25);
  const [humidity, setHumidity] = useState(70);
  const [pressure, setPressure] = useState(1013);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [coefficients, setCoefficients] = useState<number[]>([2, 0.8, 0.02, -0.01]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState("");
  
  const { configurations, loading, saveConfiguration, loadConfiguration, deleteConfiguration } = 
    useModelConfigurations('weather');

  const calculatePrediction = () => {
    // Sample historical data for training (in real app, this would be actual historical data)
    const historicalData = [
      { temp: 20, humidity: 65, pressure: 1015, nextTemp: 21 },
      { temp: 22, humidity: 70, pressure: 1013, nextTemp: 23 },
      { temp: 25, humidity: 75, pressure: 1010, nextTemp: 24 },
      { temp: 28, humidity: 60, pressure: 1012, nextTemp: 27 },
      { temp: 18, humidity: 80, pressure: 1008, nextTemp: 19 },
      { temp: 24, humidity: 68, pressure: 1014, nextTemp: 25 },
      { temp: 26, humidity: 72, pressure: 1011, nextTemp: 26 },
      { temp: 23, humidity: 77, pressure: 1009, nextTemp: 22 },
    ];

    // Prepare data for multiple linear regression
    const X = historicalData.map(d => [d.temp, d.humidity, d.pressure]);
    const y = historicalData.map(d => d.nextTemp);

    // Calculate coefficients using least squares method
    const coef = multipleLinearRegression(X, y);
    setCoefficients(coef);

    // Predict using calculated coefficients
    const result = coef[0] + coef[1] * todayTemp + coef[2] * humidity + coef[3] * pressure;
    setPrediction(result);
  };

  const handleSave = async () => {
    if (!configName.trim()) return;
    
    const configuration = { todayTemp, humidity, pressure };
    const predictionResult = { prediction, coefficients };
    
    await saveConfiguration(configName, configuration, predictionResult);
    setSaveDialogOpen(false);
    setConfigName("");
  };

  const handleLoad = (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;

    const { configuration, predictionResult } = loadConfiguration(config);
    setTodayTemp(configuration.todayTemp);
    setHumidity(configuration.humidity);
    setPressure(configuration.pressure);
    setPrediction(predictionResult.prediction);
    setCoefficients(predictionResult.coefficients);
    setLoadDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Weather Parameters
          </CardTitle>
          <CardDescription>
            Model: T_next = a + b·T_today + c·H + d·P
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="today-temp">Today's Temperature (°C)</Label>
            <Input
              id="today-temp"
              type="number"
              value={todayTemp}
              onChange={(e) => setTodayTemp(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="humidity">Humidity (%)</Label>
            <Input
              id="humidity"
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pressure">Pressure (hPa)</Label>
            <Input
              id="pressure"
              type="number"
              value={pressure}
              onChange={(e) => setPressure(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={calculatePrediction} className="flex-1">
              Predict Tomorrow's Temperature
            </Button>
            <Button onClick={() => setSaveDialogOpen(true)} variant="outline" size="icon">
              <Save className="h-4 w-4" />
            </Button>
            <Button onClick={() => setLoadDialogOpen(true)} variant="outline" size="icon">
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>

          {prediction !== null && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm font-medium">Least Squares Coefficients:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>β₀ (intercept) = {coefficients[0].toFixed(4)}</p>
                <p>β₁ (temp factor) = {coefficients[1].toFixed(4)}</p>
                <p>β₂ (humidity factor) = {coefficients[2].toFixed(4)}</p>
                <p>β₃ (pressure factor) = {coefficients[3].toFixed(4)}</p>
              </div>
              <p className="text-lg font-bold text-primary mt-3">
                Tomorrow's Temperature: {prediction.toFixed(1)}°C
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>About Weather Prediction</CardTitle>
          <CardDescription>Understanding the multiple linear regression model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Model Explanation</h3>
            <p className="text-muted-foreground">
              This model uses multiple linear regression with the least squares method to predict tomorrow's temperature. 
              The coefficients are calculated by minimizing the sum of squared residuals from historical data.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Variables</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>β₁:</strong> How strongly today's temp influences tomorrow's</li>
              <li><strong>β₂:</strong> How humidity affects temperature (high humidity → warmer nights)</li>
              <li><strong>β₃:</strong> How air pressure relates (falling pressure → stormy weather)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Least Squares Method</h3>
            <p className="text-muted-foreground">
              The least squares method finds the best-fit line by minimizing the sum of squared differences between 
              observed and predicted values. This provides optimal coefficients based on historical data patterns.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Configuration</DialogTitle>
            <DialogDescription>
              Save your current weather model configuration
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Configuration name"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleSave} disabled={!configName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Configuration</DialogTitle>
            <DialogDescription>
              Select a saved configuration to load
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <p>Loading...</p>
          ) : configurations.length === 0 ? (
            <p className="text-muted-foreground">No saved configurations</p>
          ) : (
            <div className="space-y-2">
              {configurations.map((config) => (
                <div key={config.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{config.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(config.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleLoad(config.id)}>
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteConfiguration(config.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeatherTab;
