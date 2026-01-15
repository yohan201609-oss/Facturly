import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Calendar, User, Mail, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    window.open(`/api/invoices/${id}/pdf`, '_blank');
  };

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/invoices" className="mr-4 p-2 text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalle de Factura {invoice?.invoiceNumber}
            </h1>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Descargar PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Detalle de Ítems</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">P. Unitario</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice?.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 text-center">{item.quantity}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 text-right">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(item.unitPrice)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 border-t pt-4 space-y-2">
                <div className="flex justify-end text-sm text-gray-500">
                  <span className="mr-8">Subtotal:</span>
                  <span className="w-32 text-right">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-end text-sm text-gray-500">
                  <span className="mr-8">Impuestos ({invoice.taxRate}%):</span>
                  <span className="w-32 text-right">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-end text-lg font-bold text-gray-900">
                  <span className="mr-8">Total:</span>
                  <span className="w-32 text-right">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: invoice.currency }).format(invoice.total)}</span>
                </div>
              </div>
            </div>

            {(invoice?.notes || invoice?.terms) && (
              <div className="bg-white shadow rounded-lg p-6 space-y-4">
                {invoice?.notes && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Notas</h4>
                    <p className="text-sm text-gray-500 mt-1">{invoice.notes}</p>
                  </div>
                )}
                {invoice?.terms && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Términos</h4>
                    <p className="text-sm text-gray-500 mt-1">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 h-4 w-4 text-brand-500" />
                Resumen
              </h3>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-3 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Emisión</p>
                    <p className="font-medium">{format(new Date(invoice.issueDate), 'PPP', { locale: es })}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-3 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Vencimiento</p>
                    <p className="font-medium text-red-600">{format(new Date(invoice.dueDate), 'PPP', { locale: es })}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="mr-3 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Estado</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-4 w-4 text-brand-500" />
                Cliente
              </h3>
              <p className="text-sm font-bold">{invoice.client.name}</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Mail className="mr-2 h-4 w-4" />
                {invoice.client.email || 'Sin email'}
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                <p>{invoice.client.address}</p>
                <p>{invoice.client.city}, {invoice.client.state}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
