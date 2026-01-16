import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { Save, Loader2, CreditCard, ShieldCheck, Moon, Sun, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

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
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

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

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Configuración</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona tus datos personales y preferencias de la aplicación.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Información del Negocio</h3>
              <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nombre / Razón Social</label>
                    <input {...register('companyName')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200" />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">RFC / Tax ID</label>
                    <input {...register('taxId')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                    <input {...register('phone')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Dirección Fiscal</label>
                  <input {...register('address')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ciudad</label>
                    <input {...register('city')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                    <input {...register('state')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">C.P.</label>
                    <input {...register('zipCode')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50 active:scale-95"
                  >
                    {mutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                Preferencias de la Interfaz
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                      {isDarkMode ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-orange-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors">Modo Oscuro</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Reduce el cansancio visual en entornos oscuros.</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Prefijo Facturas</label>
                    <input {...register('invoicePrefix')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Moneda por Defecto</label>
                    <select {...register('defaultCurrency')} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200 appearance-none">
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="DOP">DOP - Peso Dominicano</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none p-6 text-white border border-blue-500 dark:border-blue-800">
              <div className="flex items-center justify-between mb-6">
                 <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {user?.isPremium ? 'PRO' : 'Free'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">
                {user?.isPremium ? 'Plan Premium Activo' : 'Mejora tu Plan'}
              </h3>
              <p className="text-blue-100 text-sm mb-8 leading-relaxed">
                {user?.isPremium 
                  ? 'Disfrutas de todas las funcionalidades ilimitadas y soporte prioritario.' 
                  : 'Desbloquea facturas ilimitadas, reportes avanzados y más clientes.'}
              </p>
              
              {!user?.isPremium && (
                <button
                  onClick={() => upgradeMutation.mutate()}
                  className="w-full bg-white text-blue-700 font-bold py-3 px-4 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                >
                  <CreditCard className="h-5 w-5" />
                  Actualizar a Premium
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-colors">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Límites de Uso</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 dark:text-gray-300">
                    <span className="text-gray-500">Facturas este mes</span>
                    <span className="text-blue-600 dark:text-blue-400">{user?.isPremium ? 'Ilimitado' : '2 / 5'}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden transition-colors">
                    <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all" style={{ width: user?.isPremium ? '100%' : '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 dark:text-gray-300">
                    <span className="text-gray-500">Clientes registrados</span>
                    <span className="text-blue-600 dark:text-blue-400">{user?.isPremium ? 'Ilimitado' : '4 / 10'}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden transition-colors">
                    <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all" style={{ width: user?.isPremium ? '100%' : '20%' }}></div>
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

