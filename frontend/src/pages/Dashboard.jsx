import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Download,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, description, trend, color = "blue" }) => {
  const colors = {
    blue: "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange: "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    purple: "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-blue-500 dark:border-blue-600"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
          {trend ? (
            <p className={`text-sm mt-1 flex items-center ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}% vs mes anterior
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${colors[color] || colors.blue}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    }
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ['dashboard-chart'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/chart');
      return data;
    }
  });

  if (isLoadingStats || isLoadingChart) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido de nuevo 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Aquí tienes un resumen de tu actividad comercial.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-sm font-medium">
            <Download className="w-4 h-4" />
            Exportar reporte
          </button>
          <Link 
            to="/invoices/new" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Nueva Factura
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Facturado este mes" 
          value={new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(stats?.totalMonth || 0)} 
          icon={TrendingUp}
          trend={12}
          color="blue"
        />
        <StatCard 
          title="Pendiente de cobro" 
          value={new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(stats?.totalPending || 0)} 
          icon={Clock}
          color="orange"
          description="Esperando pago"
        />
        <StatCard 
          title="Total Clientes" 
          value={stats?.clientCount || 0} 
          icon={Users}
          color="purple"
          description="Clientes activos"
        />
        <StatCard 
          title="Facturas Emitidas" 
          value={stats?.countMonth || 0} 
          icon={FileText}
          color="green"
          description="Este mes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ingresos (Últimos 6 meses)</h3>
            <select className="text-sm border-gray-200 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800 border p-1 dark:text-gray-300">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Facturas Recientes</h3>
            <Link to="/invoices" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center">
              Ver todas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.recentInvoices?.length > 0 ? (
              stats.recentInvoices.map((inv) => (
                <div key={inv.id} className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      inv.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                      inv.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{inv.client.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{inv.invoiceNumber} • {new Date(inv.issueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: inv.currency }).format(inv.total)}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      inv.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 
                      inv.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 
                      inv.status === 'DRAFT' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No hay facturas recientes</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

