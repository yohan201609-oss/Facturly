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
      status: 'DRAFT',
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
      const counter = userProfile.invoiceCounter || 1;
      const nextNum = `${userProfile.invoicePrefix}-${String(counter).padStart(3, '0')}`;
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

  const inputClasses = "mt-1 block w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all";
  const labelClasses = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1";
  const cardClasses = "bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 px-4 py-5 sm:rounded-2xl sm:p-6 transition-colors";

  if (isEditing && isLoadingInvoice) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/invoices" 
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-blue-600 transition-all shadow-sm group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? `Editar Factura ${existingInvoice?.invoiceNumber}` : 'Nueva Factura'}
            </h1>
          </div>
          <button
            onClick={handleSubmit((data) => mutation.mutate(data))}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
            Guardar Factura
          </button>
        </div>

        <form className="space-y-6">
          <div className={cardClasses}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Info General */}
              <div className="space-y-4 md:col-span-1">
                <div>
                  <label className={labelClasses}>Cliente</label>
                  <select {...register('clientId')} className={inputClasses}>
                    <option value="">Selecciona un cliente</option>
                    {clients?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Número de Factura</label>
                  <input {...register('invoiceNumber')} className={inputClasses} />
                  {errors.invoiceNumber && <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber.message}</p>}
                </div>
                <div>
                  <label className={labelClasses}>Estado</label>
                  <select {...register('status')} className={inputClasses}>
                    <option value="DRAFT">Borrador (Watermark)</option>
                    <option value="SENT">Enviada</option>
                    <option value="PAID">Pagada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className={labelClasses}>Fecha Emisión</label>
                  <input type="date" {...register('issueDate')} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Fecha Vencimiento</label>
                  <input type="date" {...register('dueDate')} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Moneda</label>
                  <select {...register('currency')} className={inputClasses}>
                    <option value="USD">USD - Dólar</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className={cardClasses}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ítems de la Factura</h3>
            <div className="space-y-4">
              <div className="hidden md:grid md:grid-cols-12 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                <div className="col-span-6">Descripción</div>
                <div className="col-span-1 text-center">Cant.</div>
                <div className="col-span-2 text-right">P. Unitario</div>
                <div className="col-span-2 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="col-span-6">
                    <input
                      {...register(`items.${index}.description`)}
                      placeholder="Descripción del servicio o producto"
                      className={inputClasses}
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className={`${inputClasses} text-center`}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      className={`${inputClasses} text-right`}
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 text-right h-[42px] flex items-center justify-end">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(watch(`items.${index}.subtotal`) || 0)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, discount: 0, subtotal: 0 })}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all"
              >
                <Plus className="h-4 w-4" /> Agregar Ítem
              </button>
            </div>
          </div>

          {/* Totals and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className={cardClasses}>
                <label className={labelClasses}>Notas Adicionales</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className={inputClasses}
                  placeholder="Gracias por su negocio..."
                />
              </div>
              <div className={cardClasses}>
                <label className={labelClasses}>Términos y Condiciones</label>
                <textarea
                  {...register('terms')}
                  rows={3}
                  className={inputClasses}
                  placeholder="Pago neto en 30 días..."
                />
              </div>
            </div>

            <div className={`${cardClasses} space-y-4 h-fit`}>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(subtotalGeneral)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span>Impuestos (%)</span>
                  <input
                    type="number"
                    {...register('taxRate', { valueAsNumber: true })}
                    className="w-16 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-bold"
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <span>Descuento Fijo</span>
                  <input
                    type="number"
                    {...register('discountAmount', { valueAsNumber: true })}
                    className="w-16 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-bold"
                  />
                </div>
                <span className="font-bold text-red-500">-{new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(discountAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: currentCurrency }).format(total)}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
