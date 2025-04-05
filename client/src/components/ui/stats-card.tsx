import { cn } from '@/lib/utils';
import { ChevronsUp, ChevronsDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    isIncrease: boolean;
  };
  icon: React.ReactNode;
  iconBgColor: string;
}

export default function StatsCard({ title, value, change, icon, iconBgColor }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{title}</p>
          <h3 className="text-2xl font-semibold mt-1 text-neutral-700">{value}</h3>
          <p className={cn(
            "text-xs mt-1 flex items-center",
            change.isIncrease ? "text-[#107C10]" : "text-[#A80000]"
          )}>
            {change.isIncrease ? <ChevronsUp className="mr-1 h-3 w-3" /> : <ChevronsDown className="mr-1 h-3 w-3" />}
            <span>{change.value}</span> from last period
          </p>
        </div>
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center",
          iconBgColor
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
