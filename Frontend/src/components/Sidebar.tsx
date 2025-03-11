
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Package, 
  CheckSquare, 
  Folders, 
  Home, 
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  Shapes,
  Wallet 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const mainItems: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'Cuenta contable', href: '/cuenta-contable' }, 
  { icon: Layers, label: "Sistema Auxiliar", href: "/sistema-auxiliar" }, 
  { icon: Shapes, label: "Tipo de cuenta", href: "/tipo-cuenta" }, 
  { icon: Wallet, label: "Moneda", href: "/tipo-moneda" }
];

const otherItems: SidebarItem[] = [
  { icon: Settings, label: 'Settings', href: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <span className="text-lg font-semibold tracking-tight animate-fade-in">Accounting</span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto h-8 w-8">
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1.5 px-2">
          <div className="mb-4">
            {!isCollapsed && (
              <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground animate-fade-in">
                Main
              </h3>
            )}
            {mainItems.map((item, index) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  isCollapsed && "justify-center px-0",
                  // Add slight animation delay based on index
                  `animate-slide-in [animation-delay:${index * 50}ms]`
                )}
              >
                <item.icon className={cn("h-5 w-5", isCollapsed && "h-5 w-5")} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
          
          <div className="mb-4">
            {!isCollapsed && (
              <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground animate-fade-in">
                Settings
              </h3>
            )}
            {otherItems.map((item, index) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  isCollapsed && "justify-center px-0",
                  // Add slight animation delay based on index
                  `animate-slide-in [animation-delay:${(mainItems.length + index) * 50}ms]`
                )}
              >
                <item.icon className={cn("h-5 w-5", isCollapsed && "h-5 w-5")} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
      
      {!isCollapsed && (
        <div className="sticky bottom-0 mt-auto border-t p-4 bg-card/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium">
                JD
              </span>
            </span>
            <div className="grid gap-0.5 text-sm">
              <span className="font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground">admin@acme.com</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
