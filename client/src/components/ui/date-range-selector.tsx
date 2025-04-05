import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDays, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export default function DateRangeSelector({ value, onChange, onDateRangeChange }: DateRangeSelectorProps) {
  // Handle selection and update date range
  const handleSelectionChange = (newValue: string) => {
    onChange(newValue);
    
    const today = new Date();
    
    switch (newValue) {
      case 'today':
        onDateRangeChange(today, today);
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        onDateRangeChange(yesterday, yesterday);
        break;
      case 'last7days':
        onDateRangeChange(subDays(today, 6), today);
        break;
      case 'last30days':
        onDateRangeChange(subDays(today, 29), today);
        break;
      case 'thisMonth':
        onDateRangeChange(startOfMonth(today), today);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        onDateRangeChange(startOfMonth(lastMonth), endOfMonth(lastMonth));
        break;
      // Add custom range handling later
      default:
        onDateRangeChange(subDays(today, 29), today);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-neutral-500">Date Range:</span>
      <Select value={value} onValueChange={handleSelectionChange}>
        <SelectTrigger className="px-3 py-2 rounded border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 days</SelectItem>
          <SelectItem value="last30days">Last 30 days</SelectItem>
          <SelectItem value="thisMonth">This month</SelectItem>
          <SelectItem value="lastMonth">Last month</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
