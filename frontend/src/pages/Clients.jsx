import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import { Plus, Search, MoreVertical, Edit2, Trash2, Mail, Phone, Users, ChevronRight, Globe } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ClientFormModal from '../components/ClientFormModal';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Clientes</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 transition-colors">
            Directorio de contactos y empresas para tu facturación.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 transition-colors">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm dark:text-gray-200"
            placeholder="Buscar por nombre, email o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse transition-colors"></div>
          ))}
        </div>
      ) : filteredClients?.length === 0 ? (
        <EmptyState 
          title={searchTerm ? "No se encontraron clientes" : "Tu lista de clientes está vacía"}
          description={searchTerm ? "Intenta con otro término de búsqueda." : "Agrega tu primer cliente para empezar a facturar más rápido."}
          icon={Users}
          actionLabel={searchTerm ? null : "Agregar Cliente"}
          onAction={handleAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredClients?.map((client) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={client.id}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl transition-colors">
                    {client.name?.[0].toUpperCase()}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-left">
                  {client.name}
                </h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    <Mail className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                    <span className="truncate">{client.email || 'Sin correo electrónico'}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
                      <Phone className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.taxId && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
                      <Globe className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                      <span>RNC/ID: {client.taxId}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center transition-colors">
                   <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Cliente Activo
                  </span>
                  <button 
                    onClick={() => handleEdit(client)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Detalles
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}


      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={editingClient}
      />
    </Layout>
  );
}

