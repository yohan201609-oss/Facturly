import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { Plus, Search, FileText, MoreVertical, Edit2, Trash2, Copy, Eye, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusStyles = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-300 text-gray-600',
};

const statusLabels = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
  CANCELLED: 'Cancelada',
};

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/invoices');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      toast.success('Factura eliminada');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => api.post(`/invoices/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      toast.success('Factura duplicada');
    },
  });

  const filteredInvoices = invoices?.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Crea y gestiona tus facturas y estados de pago.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/invoices/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </div>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
          placeholder="Buscar por número o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando facturas...</div>
        ) : filteredInvoices?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron facturas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices?.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inv.client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(inv.issueDate), 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: inv.currency }).format(inv.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[inv.status]}`}>
                        {statusLabels[inv.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/invoices/${inv.id}/view`} className="text-gray-400 hover:text-gray-600">
                          <Eye className="h-5 w-5" />
                        </Link>
                        {inv.status === 'DRAFT' && (
                          <Link to={`/invoices/${inv.id}/edit`} className="text-gray-400 hover:text-brand-600">
                            <Edit2 className="h-5 w-5" />
                          </Link>
                        )}
                        <button 
                          onClick={() => duplicateMutation.mutate(inv.id)}
                          className="text-gray-400 hover:text-brand-600"
                        >
                          <Copy className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => deleteMutation.mutate(inv.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
