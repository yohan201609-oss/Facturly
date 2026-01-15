import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { Plus, Search, MoreVertical, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ClientFormModal from '../components/ClientFormModal';

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Cliente eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar el cliente');
    },
  });

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona la información de contacto de tus clientes.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando clientes...</div>
        ) : filteredClients?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron clientes.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredClients?.map((client) => (
              <li key={client.id}>
                <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm font-medium text-brand-600 truncate">
                        {client.name}
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500 mr-6">
                          <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {client.email || 'Sin email'}
                        </div>
                        {client.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-gray-400 hover:text-brand-600 transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={editingClient}
      />
    </Layout>
  );
}
