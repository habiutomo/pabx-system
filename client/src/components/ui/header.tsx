import { useLocation } from 'wouter';
import { Bell, Search, ChevronDown, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export default function Header({ toggleMobileMenu }: HeaderProps) {
  const [location] = useLocation();
  
  // Determine the title based on the current route
  let title = 'Dashboard';
  if (location === '/call-history') title = 'Call History';
  else if (location === '/billing') title = 'Billing & Invoices';
  else if (location === '/reports') title = 'Reports';
  else if (location === '/rate-config') title = 'Rate Configuration';
  else if (location === '/user-management') title = 'User Management';
  else if (location === '/settings') title = 'Settings';
  
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="flex items-center">
          <button 
            className="md:hidden text-neutral-600 mr-4"
            onClick={toggleMobileMenu}
          >
            <Menu />
          </button>
          <h2 className="text-xl font-semibold text-neutral-700">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 rounded-md bg-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          
          <div className="relative cursor-pointer">
            <Bell className="h-5 w-5 text-neutral-600" />
            <span className="absolute -top-1 -right-1 bg-[#A80000] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </div>
          
          <div className="flex items-center cursor-pointer">
            <Avatar className="h-8 w-8 bg-[#0078D4] text-white rounded-full">
              <span className="text-sm">JD</span>
            </Avatar>
            <span className="ml-2 hidden sm:inline-block">John Doe</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
