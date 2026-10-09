import { 
  LayoutDashboard, 
  Crosshair,
  ShieldAlert, 
  TableProperties, 
  ActivitySquare, 
  Database,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Server
} from 'lucide-react';
import { useDashboard, DashboardPage } from '../context/DashboardContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: DashboardPage;
  label: string;
  icon: React.ElementType;
  badge?: string;
  isDemo?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { activePage, setActivePage, filteredIncidents, kpis } = useDashboard();

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'threat-analysis',
      label: 'Threat Analysis',
      icon: Crosshair,
    },
    {
      id: 'threat-intel',
      label: 'Threat Intelligence',
      icon: ShieldAlert,
      badge: `${kpis.confirmedThreats}`,
    },
    {
      id: 'explorer',
      label: 'Incident Explorer',
      icon: TableProperties,
      badge: `${filteredIncidents.length}`,
    },
    {
      id: 'response',
      label: 'Response Analytics',
      icon: ActivitySquare,
    },
    {
      id: 'data-mgmt',
      label: 'Data Management',
      icon: Database,
    },
  ];

  return (
    <aside 
      className={`relative z-20 flex flex-col bg-[#0D1525] border-r border-[#1E2D4A] transition-all duration-300 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header / Brand Mini */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1E2D4A]">
        {!collapsed && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Navigation SOC</span>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2D4A] transition-colors ml-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C2F]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                }`} 
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  item.isDemo
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-400/40 font-bold shadow-sm'
                    : isActive 
                    ? 'bg-cyan-500/20 text-cyan-300' 
                    : 'bg-[#1E2D4A] text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r shadow-[0_0_8px_#38BDF8]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer System Health */}
      <div className="p-3 border-t border-[#1E2D4A] bg-[#0A101D]">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                Pipeline Health
              </span>
              <span className="text-emerald-400 font-mono font-medium">100% OK</span>
            </div>
            <div className="w-full bg-[#1E2D4A] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full rounded-full"></div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Local Parser • Zero-Leakage
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Pipeline Status 100% Normal">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
        )}
      </div>
    </aside>
  );
};
