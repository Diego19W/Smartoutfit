import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Bell,
  Home
} from "lucide-react";
import { Overview } from "./admin/Overview";
import { Inventory } from "./admin/Inventory";
import { Orders } from "./admin/Orders";
import { Notifications } from "./admin/Notifications";

type TabType = 'overview' | 'inventory' | 'orders' | 'notifications';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-black/10 min-h-screen sticky top-0">
          <div className="p-6 border-b border-black/10">
            <h2 className="tracking-[0.2em]">DASHBOARD</h2>
            <p className="text-sm opacity-60 mt-1">Panel Administrativo</p>
          </div>
          
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="tracking-wider text-sm">Resumen</span>
            </button>
            
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === 'inventory' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="tracking-wider text-sm">Inventario</span>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="tracking-wider text-sm">Pedidos</span>
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors relative ${
                activeTab === 'notifications' ? 'bg-black text-white' : 'hover:bg-neutral-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="tracking-wider text-sm">Notificaciones</span>
              <span className="absolute right-4 top-3 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </nav>
          
          {/* Return to Home Button */}
          <div className="absolute bottom-0 inset-x-0 p-4 border-t border-black/10 bg-white">
            <button
              onClick={() => onNavigate('home')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white hover:bg-black/80 rounded transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="tracking-wider text-sm">VOLVER AL INICIO</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'notifications' && <Notifications />}
        </main>
      </div>
    </div>
  );
}
