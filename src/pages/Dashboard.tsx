import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import { useRefuelings } from '@/hooks/useRefuelings';
import { useVehicleUsage } from '@/hooks/useVehicleUsage';
import { AuthButton } from '@/components/AuthButton';
import { VehicleForm } from '@/components/VehicleForm';
import { RefuelingForm } from '@/components/RefuelingForm';
import { VehicleUsageForm } from '@/components/VehicleUsageForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fuel, Car, TrendingUp, Calendar, Plus, Edit, Trash2, Route, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { vehicles, createVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const { refuelings, createRefueling, updateRefueling, deleteRefueling } = useRefuelings();
  const { vehicleUsage, createVehicleUsage, updateVehicleUsage, deleteVehicleUsage } = useVehicleUsage();
  
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [isRefuelingFormOpen, setIsRefuelingFormOpen] = useState(false);
  const [isUsageFormOpen, setIsUsageFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingRefueling, setEditingRefueling] = useState(null);
  const [editingUsage, setEditingUsage] = useState(null);

  // Cálculos do dashboard
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRefuelings = refuelings.filter(r => {
    const refuelingDate = new Date(r.date);
    return refuelingDate.getMonth() === currentMonth && refuelingDate.getFullYear() === currentYear;
  });

  const totalLitersThisMonth = monthlyRefuelings.reduce((sum, r) => sum + Number(r.liters), 0);
  const totalCostThisMonth = monthlyRefuelings.reduce((sum, r) => sum + Number(r.total_cost), 0);
  const lastRefueling = refuelings[0];

  // Calcular km pendentes (não pagos)
  const pendingUsage = vehicleUsage.filter(usage => !usage.is_paid);
  const totalPendingKm = pendingUsage.reduce((sum, usage) => sum + (usage.km_driven || 0), 0);

  const handleVehicleSubmit = async (vehicleData: any) => {
    if (editingVehicle) {
      await updateVehicle.mutateAsync({ id: editingVehicle.id, ...vehicleData });
      setEditingVehicle(null);
    } else {
      await createVehicle.mutateAsync(vehicleData);
    }
    setIsVehicleFormOpen(false);
  };

  const handleRefuelingSubmit = async (refuelingData: any) => {
    if (editingRefueling) {
      await updateRefueling.mutateAsync({ id: editingRefueling.id, ...refuelingData });
      setEditingRefueling(null);
    } else {
      await createRefueling.mutateAsync(refuelingData);
    }
    setIsRefuelingFormOpen(false);
  };

  const handleUsageSubmit = async (usageData: any) => {
    if (editingUsage) {
      await updateVehicleUsage.mutateAsync({ id: editingUsage.id, ...usageData });
      setEditingUsage(null);
    } else {
      await createVehicleUsage.mutateAsync(usageData);
    }
    setIsUsageFormOpen(false);
  };

  const getFuelTypeLabel = (type: string) => {
    const types = {
      gasoline: 'Gasolina',
      ethanol: 'Etanol',
      diesel: 'Diesel',
      flex: 'Flex',
      electric: 'Elétrico',
      hybrid: 'Híbrido'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Fuel className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-primary">Reabastece Aí</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Olá, {user?.user_metadata?.full_name || user?.email}!
          </h2>
          <p className="text-gray-600">
            Bem-vindo ao seu painel de controle de abastecimentos
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Abastecido</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLitersThisMonth.toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Km Pendente</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPendingKm}km</div>
              <p className="text-xs text-muted-foreground">
                {pendingUsage.length === 0 ? 'Nenhum pendente' : `${pendingUsage.length} registro${pendingUsage.length > 1 ? 's' : ''} não pago${pendingUsage.length > 1 ? 's' : ''}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalCostThisMonth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Abastecimento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastRefueling ? format(new Date(lastRefueling.date), 'dd/MM', { locale: ptBR }) : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastRefueling ? `${lastRefueling.liters}L` : 'Nenhum registro'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Veículos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Seus Veículos</CardTitle>
                <CardDescription>Gerencie seus veículos cadastrados</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsVehicleFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhum veículo cadastrado</p>
                  <p className="text-sm text-gray-400">Adicione seu primeiro veículo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-sm text-gray-600">
                          {vehicle.brand} {vehicle.model} {vehicle.year}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {getFuelTypeLabel(vehicle.fuel_type)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingVehicle(vehicle);
                            setIsVehicleFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteVehicle.mutate(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Abastecimentos Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Abastecimentos Recentes</CardTitle>
                <CardDescription>Seus últimos registros</CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => setIsRefuelingFormOpen(true)}
                disabled={vehicles.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar
              </Button>
            </CardHeader>
            <CardContent>
              {refuelings.length === 0 ? (
                <div className="text-center py-8">
                  <Fuel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhum abastecimento registrado</p>
                  <p className="text-sm text-gray-400">
                    {vehicles.length === 0 ? 'Cadastre um veículo primeiro' : 'Registre seu primeiro abastecimento'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {refuelings.slice(0, 5).map((refueling) => (
                    <div key={refueling.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{refueling.vehicle?.name}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(refueling.date), 'dd/MM/yyyy', { locale: ptBR })} • {refueling.liters}L
                        </p>
                        <p className="text-sm text-gray-600">R$ {Number(refueling.total_cost).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingRefueling(refueling);
                            setIsRefuelingFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteRefueling.mutate(refueling.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registro de Uso */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registro de Uso</CardTitle>
                <CardDescription>Acompanhe o uso dos seus veículos</CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => setIsUsageFormOpen(true)}
                disabled={vehicles.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar
              </Button>
            </CardHeader>
            <CardContent>
              {vehicleUsage.length === 0 ? (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhum uso registrado</p>
                  <p className="text-sm text-gray-400">
                    {vehicles.length === 0 ? 'Cadastre um veículo primeiro' : 'Registre o primeiro uso'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicleUsage.slice(0, 5).map((usage) => (
                    <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{usage.vehicle?.name}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(usage.date), 'dd/MM/yyyy', { locale: ptBR })} • 
                          {usage.km_driven ? ` ${usage.km_driven}km` : ''} • 
                          {getFuelTypeLabel(usage.fuel_type)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {usage.total_cost && (
                            <span className="text-sm text-gray-600">R$ {Number(usage.total_cost).toFixed(2)}</span>
                          )}
                          <Badge variant={usage.is_paid ? "default" : "secondary"}>
                            {usage.is_paid ? "Pago" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUsage(usage);
                            setIsUsageFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteVehicleUsage.mutate(usage.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <VehicleForm
        isOpen={isVehicleFormOpen}
        onOpenChange={(open) => {
          setIsVehicleFormOpen(open);
          if (!open) setEditingVehicle(null);
        }}
        onSubmit={handleVehicleSubmit}
        vehicle={editingVehicle}
        isLoading={createVehicle.isPending || updateVehicle.isPending}
      />

      <RefuelingForm
        isOpen={isRefuelingFormOpen}
        onOpenChange={(open) => {
          setIsRefuelingFormOpen(open);
          if (!open) setEditingRefueling(null);
        }}
        onSubmit={handleRefuelingSubmit}
        refueling={editingRefueling}
        isLoading={createRefueling.isPending || updateRefueling.isPending}
      />

      <VehicleUsageForm
        isOpen={isUsageFormOpen}
        onOpenChange={(open) => {
          setIsUsageFormOpen(open);
          if (!open) setEditingUsage(null);
        }}
        onSubmit={handleUsageSubmit}
        usage={editingUsage}
        isLoading={createVehicleUsage.isPending || updateVehicleUsage.isPending}
      />
    </div>
  );
};

export default Dashboard;
