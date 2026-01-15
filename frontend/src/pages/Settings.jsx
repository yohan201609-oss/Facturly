import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { Save, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

const profileSchema = z.object({
  companyName: z.string().min(1, 'Requerido'),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  invoicePrefix: z.string().max(5, 'Máximo 5 caracteres').default('INV'),
  defaultCurrency: z.string().default('USD'),
  brandColor: z.string().default('#3B82F6'),
});

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: user || {},
  });

  useEffect(() => {
    if (user) reset(user);
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data) => api.put('/users/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Perfil actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar el perfil'),
  });

  const upgradeMutation = useMutation({
    mutationFn: () => api.post('/users/upgrade'),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('¡Ahora eres Premium!');
    },
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Configuración</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Perfil</h3>
              <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
                    <input {...register('companyName')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RFC / Tax ID</label>
                    <input {...register('taxId')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                    <input {...register('phone')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input {...register('address')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                    <input {...register('city')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <input {...register('state')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">C.P.</label>
                    <input {...register('zipCode')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
                  >
                    {mutation.isPending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Facturación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prefijo Facturas</label>
                  <input {...register('invoicePrefix')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Moneda por Defecto</label>
                  <select {...register('defaultCurrency')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                    <option value="USD">USD</option>
                    <option value="MXN">MXN</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2 flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6" />
                {user?.isPremium ? 'Plan Premium' : 'Plan Gratuito'}
              </h3>
              <p className="text-brand-100 text-sm mb-6">
                {user?.isPremium 
                  ? 'Disfrutas de todas las funcionalidades ilimitadas.' 
                  : 'Mejora tu plan para eliminar límites y obtener más funciones.'}
              </p>
              
              {!user?.isPremium && (
                <button
                  onClick={() => upgradeMutation.mutate()}
                  className="w-full bg-white text-brand-700 font-bold py-2 px-4 rounded-md hover:bg-brand-50 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Upgrade a Premium
                </button>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Límites de Uso</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Facturas (este mes)</span>
                    <span>{user?.isPremium ? '∞' : 'Max 5'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-600 h-2 rounded-full" style={{ width: user?.isPremium ? '100%' : '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Clientes</span>
                    <span>{user?.isPremium ? '∞' : 'Max 10'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-600 h-2 rounded-full" style={{ width: user?.isPremium ? '100%' : '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
