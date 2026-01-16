import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  DollarSign, 
  Clock, 
  MapPin, 
  Printer,
  Copy,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function InvoiceView() {
  const { id } = useParams();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data } = await api.get(`/invoices/${id}`);
      return data;
    },
  });

  const handleDownload = async () => {
    const downloadPromise = async () => {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      
      // Crear un URL para el blob
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${invoice.invoiceNumber}.pdf`);
      
      // Simular clic para descargar
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    };

    toast.promise(downloadPromise(), {
      loading: 'Generando PDF profesional...',
      success: 'Factura descargada correctamente',
      error: 'Error al generar el PDF. Revisa tu conexión.',
    });
  };

  const handleShare = () => {
    const text = `Factura ${invoice.invoiceNumber} - Total: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(invoice.total)}`;
    navigator.clipboard.writeText(text);
    toast.success('Resumen de factura copiado al portapapeles');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-96 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"></div>
            <div className="h-96 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/invoices" 
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 hover:text-blue-600 transition-all shadow-sm group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Factura {invoice?.invoiceNumber}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {invoice.status}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Creada el {format(new Date(invoice.issueDate), 'dd MMM yyyy', { locale: es })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              <Copy className="h-4 w-4" />
              Compartir
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl p-8 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200 dark:shadow-none text-white">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Factura</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ref: {invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 dark:text-white uppercase text-[10px] tracking-widest mb-2">Facturado a:</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">{invoice.client.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.client.email}</p>
                  {invoice.client.taxId && <p className="text-xs text-gray-400 mt-1">ID/RNC: {invoice.client.taxId}</p>}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción</th>
                      <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20">Cant.</th>
                      <th className="px-4 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Precio</th>
                      <th className="px-4 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {invoice?.items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="px-4 py-5 text-sm font-bold text-gray-800 dark:text-gray-200">{item.description}</td>
                        <td className="px-4 py-5 text-sm text-gray-500 dark:text-gray-400 text-center">{item.quantity}</td>
                        <td className="px-4 py-5 text-sm text-gray-500 dark:text-gray-400 text-right">
                          {new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(item.unitPrice)}
                        </td>
                        <td className="px-4 py-5 text-sm font-bold text-gray-900 dark:text-white text-right">
                          {new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-gray-50 dark:border-gray-800 flex justify-end">
                <div className="w-full md:w-64 space-y-3">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Impuestos ({invoice.taxRate}%):</span>
                    <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(invoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span>Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(invoice.total)}</span>
                  </div>
                </div>
              </div>

              {(invoice?.notes || invoice?.terms) && (
                <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {invoice?.notes && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notas</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice?.terms && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Términos y Condiciones</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Vencimiento
              </h3>
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Fecha de pago</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                  {format(new Date(invoice.dueDate), 'dd MMMM, yyyy', { locale: es })}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 shadow-sm rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Datos del Cliente
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg h-fit text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{invoice.client.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.client.email}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg h-fit text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>{invoice.client.address}</p>
                    <p>{invoice.client.city}, {invoice.client.state}</p>
                    <p>{invoice.client.country}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
            >
              <Printer className="w-5 h-5" />
              Imprimir / PDF
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
