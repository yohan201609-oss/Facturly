import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect } from 'react';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Requerido'),
  quantity: z.number().min(0.01, 'Min 0.01'),
  unitPrice: z.number().min(0, 'Min 0'),
  discount: z.number().default(0),
  subtotal: z.number(),
});

const invoiceSchema = z.object({
  clientId: z.string().uuid('Selecciona un cliente'),
  invoiceNumber: z.string().min(1, 'Requerido'),
  issueDate: z.string().min(1, 'Requerido'),
  dueDate: z.string().min(1, 'Requerido'),
  currency: z.string().default('USD'),
  taxRate: z.number().min(0).max(100).default(0),
  discountAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.string().default('DRAFT'),
  items: z.array(invoiceItemSchema).min(1, 'Agrega al menos un ítem'),
});

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients');
      return data;
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
  });

  const { data: existingInvoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data } = await api.get(`/invoices/${id}`);
      return data;
    },
    enabled: isEditing,
  });

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      taxRate: 16,
      discountAmount: 0,
      items: [{ description: '', quantity: 1, unitPrice: 0, discount: 0, subtotal: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const taxRate = watch('taxRate');
  const discountAmount = watch('discountAmount');

  useEffect(() => {
    if (userProfile && !isEditing) {
      const nextNum = `${userProfile.invoicePrefix}-${String(userProfile.invoiceCounter).padStart(3, '0')}`;
      setValue('invoiceNumber', nextNum);
      setValue('currency', userProfile.defaultCurrency);
    }
  }, [userProfile, setValue, isEditing]);

  useEffect(() => {
    if (existingInvoice && isEditing) {
      reset({
        ...existingInvoice,
        issueDate: new Date(existingInvoice.issueDate).toISOString().split('T')[0],
        dueDate: new Date(existingInvoice.dueDate).toISOString().split('T')[0],
      });
    }
  }, [existingInvoice, reset, isEditing]);

  // Handle item subtotal calculation
  useEffect(() => {
    items.forEach((item, index) => {
      const subtotal = item.quantity * item.unitPrice - (item.discount || 0);
      if (item.subtotal !== subtotal) {
        setValue(`items.${index}.subtotal`, subtotal);
      }
    });
  }, [items, setValue]);

  const subtotalGeneral = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const taxAmount = subtotalGeneral * (taxRate / 100);
  const total = subtotalGeneral + taxAmount - discountAmount;
  const currentCurrency = watch('currency') || 'USD';

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) return api.put(`/invoices/${id}`, data);
      return api.post('/invoices', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      toast.success(isEditing ? 'Factura actualizada' : 'Factura creada');
      navigate('/invoices');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al guardar factura');
    },
  });

  if (isEditing && isLoadingInvoice) return <div className="p-8 text-center">Cargando factura...</div>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/invoices" className="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? `Editar Factura ${existingInvoice?.invoiceNumber}` : 'Nueva Factura'}
            </h1>
          </div>
          <button
            onClick={handleSubmit((data) => mutation.mutate(data))}
            disabled={mutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            Guardar Factura
          </button>
        </div>

        <form className="space-y-6">
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info General */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <select
                    {...register('clientId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Factura</label>
                  <input
                    {...register('invoiceNumber')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                  {errors.invoiceNumber && <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Emisión</label>
                  <input
                    type="date"
                    {...register('issueDate')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Vencimiento</label>
                  <input
                    type="date"
                    {...register('dueDate')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Moneda</label>
                  <select
                    {...register('currency')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  >
                    <option value="USD">USD - Dólar</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ítems de la Factura</h3>
            <div className="space-y-4">
              <div className="hidden md:grid md:grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                <div className="col-span-6">Descripción</div>
                <div className="col-span-1">Cant.</div>
                <div className="col-span-2">P. Unitario</div>
                <div className="col-span-2">Subtotal</div>
                <div className="col-span-1"></div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="col-span-6">
                    <input
                      {...register(`items.${index}.description`)}
                      placeholder="Descripción del servicio"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="py-2 px-3 bg-gray-50 rounded-md text-sm text-gray-700">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(watch(`items.${index}.subtotal`) || 0)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, discount: 0, subtotal: 0 })}
                className="mt-2 inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-500"
              >
                <Plus className="h-4 w-4 mr-1" /> Agregar Ítem
              </button>
            </div>
          </div>

          {/* Totals and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="Gracias por su negocio..."
                />
              </div>
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Términos y Condiciones</label>
                <textarea
                  {...register('terms')}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  placeholder="Pago neto en 30 días..."
                />
              </div>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(subtotalGeneral)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center">
                  <span>Impuestos (%)</span>
                  <input
                    type="number"
                    {...register('taxRate', { valueAsNumber: true })}
                    className="ml-2 w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                </div>
                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 border-b pb-4">
                <div className="flex items-center">
                  <span>Descuento Fijo</span>
                  <input
                    type="number"
                    {...register('discountAmount', { valueAsNumber: true })}
                    className="ml-2 w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                </div>
                <span>-{new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(discountAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(total)}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
