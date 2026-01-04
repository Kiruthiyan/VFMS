'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFuelStore } from '@/store/fuelStore';
import { Upload, X } from 'lucide-react';

const fuelEntrySchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle must be selected'),
  fuelQuantity: z.number().positive('Fuel quantity must be positive'),
  cost: z.number().positive('Cost must be greater than zero'),
  date: z.string().min(1, 'Date must be selected'),
});

type FuelEntryFormData = z.infer<typeof fuelEntrySchema>;

// Mock vehicles - in real app, this would come from API
const mockVehicles = [
  { id: '1', name: 'Vehicle 1' },
  { id: '2', name: 'Vehicle 2' },
  { id: '3', name: 'Vehicle 3' },
];

export default function FuelEntryPage() {
  const router = useRouter();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const addFuelLog = useFuelStore((state) => state.addFuelLog);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FuelEntryFormData>({
    resolver: zodResolver(fuelEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setReceiptFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const onSubmit = async (data: FuelEntryFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('vehicleId', data.vehicleId);
      formData.append('fuelQuantity', data.fuelQuantity.toString());
      formData.append('cost', data.cost.toString());
      formData.append('date', data.date);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const { api } = await import('@/lib/api');
      const { useAuthStore } = await import('@/store/authStore');
      const token = useAuthStore.getState().token;
      await api.postFormData('/fuel', formData, token || undefined);

      // Refresh fuel logs
      await useFuelStore.getState().fetchFuelLogs();

      router.push('/fuel/history');
    } catch (err: any) {
      setError(err.message || 'Failed to add fuel entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add Fuel Entry
          </h1>
          <p className="text-muted-foreground mt-2">Record a new fuel purchase for a vehicle</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
          <Upload className="h-8 w-8 text-white" />
        </div>
      </div>

      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-600" />
            Fuel Purchase Details
          </CardTitle>
          <CardDescription className="text-base">Enter the fuel purchase information below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle *</Label>
              <Select
                id="vehicleId"
                {...register('vehicleId')}
                onChange={(e) => setValue('vehicleId', e.target.value)}
              >
                <option value="">Select a vehicle</option>
                {mockVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </Select>
              {errors.vehicleId && (
                <p className="text-sm text-destructive">{errors.vehicleId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuelQuantity">Fuel Quantity (Liters) *</Label>
                <Input
                  id="fuelQuantity"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('fuelQuantity', { valueAsNumber: true })}
                />
                {errors.fuelQuantity && (
                  <p className="text-sm text-destructive">{errors.fuelQuantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Cost (Rs) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('cost', { valueAsNumber: true })}
                />
                {errors.cost && (
                  <p className="text-sm text-destructive">{errors.cost.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Purchase Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Fuel Receipt (Optional)</Label>
              {!receiptFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors ${
                    isDragActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isDragActive
                      ? 'Drop the file here'
                      : 'Drag & drop a receipt here, or click to select'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports: PNG, JPG, PDF (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">{receiptFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setReceiptFile(null)}
                    className="hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Fuel Entry'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/fuel/history')}
                className="h-12 border-2"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

