import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  BarChart2,
  Phone,
  FileText,
  DollarSign,
  Users,
  Settings,
  X,
  LineChart 
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  active: boolean;
}

const SidebarItem = ({ icon, text, href, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center px-4 py-3 text-neutral-700 cursor-pointer",
        active ? "bg-[#DEECF9]" : "hover:bg-[#EEF4FA]"
      )}>
        <span className={cn("w-6 text-center mr-3", active ? "text-[#0078D4]" : "")}>
          {icon}
        </span>
        <span>{text}</span>
      </a>
    </Link>
  );
};

interface SidebarProps {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export default function Sidebar({ mobileMenuOpen, toggleMobileMenu }: SidebarProps) {
  const [location] = useLocation();
  
  const sidebarContent = (
    <nav className="mt-2">
      <SidebarItem 
        icon={<BarChart2 />} 
        text="Dashboard" 
        href="/" 
        active={location === '/'}
      />
      <SidebarItem 
        icon={<Phone />} 
        text="Call History" 
        href="/call-history" 
        active={location === '/call-history'}
      />
      <SidebarItem 
        icon={<FileText />} 
        text="Billing & Invoices" 
        href="/billing" 
        active={location === '/billing'}
      />
      <SidebarItem 
        icon={<LineChart />} 
        text="Reports" 
        href="/reports" 
        active={location === '/reports'}
      />
      <SidebarItem 
        icon={<DollarSign />} 
        text="Rate Configuration" 
        href="/rate-config" 
        active={location === '/rate-config'}
      />
      <SidebarItem 
        icon={<Users />} 
        text="User Management" 
        href="/user-management" 
        active={location === '/user-management'}
      />
      <SidebarItem 
        icon={<Settings />} 
        text="Settings" 
        href="/settings" 
        active={location === '/settings'}
      />
    </nav>
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 hidden md:block bg-white border-r border-neutral-200 flex-shrink-0 h-full overflow-y-auto">
        <div className="px-4 py-6">
          <h1 className="text-xl font-semibold text-neutral-700 flex items-center">
            <Phone className="mr-2 text-[#0078D4]" />
            PABX Billing
          </h1>
        </div>
        {sidebarContent}
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="bg-white w-64 h-full overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-neutral-700 flex items-center">
              <Phone className="mr-2 text-[#0078D4]" />
              PABX Billing
            </h1>
            <button onClick={toggleMobileMenu}>
              <X className="text-neutral-600" />
            </button>
          </div>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
