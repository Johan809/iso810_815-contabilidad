
import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 h-16 flex items-center px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      
      <div className="hidden md:flex items-center gap-2 ml-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] md:w-[260px] pl-8 rounded-full bg-background"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-auto md:ml-4">
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 ml-2">
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-muted overflow-hidden">
            <span className="font-medium text-sm">JD</span>
          </span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
