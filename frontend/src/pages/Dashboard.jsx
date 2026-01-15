import { useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import Layout from '../components/Layout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, description, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-brand-50 rounded-lg">
        <Icon className="h-6 w-6 text-brand-600" />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
  </div>
);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
          </div>
          <div className="h-80 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h1>
        <p className="text-sm text-gray-500">Aquí tienes un resumen de tu negocio este mes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Facturado este mes" 
          value={new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(stats?.totalMonth || 0)} 
          icon={TrendingUp}
          description={`${stats?.countMonth} facturas emitidas`}
        />
        <StatCard 
          title="Pendiente de cobro" 
          value={new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(stats?.totalPending || 0)} 
          icon={Clock}
        />
        <StatCard 
          title="Total Clientes" 
          value={stats?.clientCount || 0} 
          icon={Users}
        />
        <StatCard 
          title="Facturas Activas" 
          value={stats?.recentInvoices?.length || 0} 
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Ingresos (Últimos 6 meses)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Facturas Recientes</h3>
            <Link to="/invoices" className="text-sm font-medium text-brand-600 hover:text-brand-500">Ver todas</Link>
          </div>
          <div className="space-y-4">
            {stats?.recentInvoices?.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{inv.client.name}</p>
                  <p className="text-xs text-gray-500">{inv.invoiceNumber} • {new Date(inv.issueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: inv.currency }).format(inv.total)}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                    inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
