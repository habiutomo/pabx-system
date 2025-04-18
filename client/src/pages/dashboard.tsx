import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Clock, DollarSign, Calculator } from 'lucide-react';
import { formatNumberWithCommas, formatHoursMinutes, formatPercentChange } from '@/lib/formatters';
import { getDateRange } from '@/lib/utils';
import StatsCard from '@/components/ui/stats-card';
import CallChart from '@/components/ui/call-chart';
import DistributionChart from '@/components/ui/distribution-chart';
import CallTable from '@/components/ui/call-table';
import DepartmentTable from '@/components/ui/department-table';
import DateRangeSelector from '@/components/ui/date-range-selector';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Set initial date range
  useEffect(() => {
    const { startDate: start, endDate: end } = getDateRange(29); // Last 30 days
    setStartDate(start);
    setEndDate(end);
  }, []);
  
  // Handle date range changes
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  // Format dates for the API
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  // Fetch call stats
  type CallStatsResponse = {
    totalCalls: number;
    totalDuration: number;
    totalCost: number;
    avgCostPerCall: number;
    callsByType: Record<string, number>;
  };

  const { data: callStats, isLoading: statsLoading } = useQuery<CallStatsResponse>({
    queryKey: ['/api/stats/calls', formattedStartDate, formattedEndDate],
    enabled: !!startDate && !!endDate
  });
  
  const handleGenerateInvoices = () => {
    toast({
      title: "Membuat Faktur",
      description: "Faktur sedang dibuat dan akan segera tersedia.",
      duration: 3000
    });
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-700 mb-4 sm:mb-0">Dasbor Penagihan</h1>
        
        <DateRangeSelector 
          value={dateRange}
          onChange={setDateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard 
          title="Total Panggilan"
          value={statsLoading ? "Memuat..." : formatNumberWithCommas(callStats?.totalCalls || 0)}
          change={{
            value: "12.5%",
            isIncrease: true
          }}
          icon={<Phone className="text-[#0078D4]" />}
          iconBgColor="bg-[#0078D4]/10"
        />
        
        <StatsCard 
          title="Total Durasi"
          value={statsLoading ? "Memuat..." : formatHoursMinutes(callStats?.totalDuration || 0)}
          change={{
            value: "8.3%",
            isIncrease: true
          }}
          icon={<Clock className="text-[#106EBE]" />}
          iconBgColor="bg-[#106EBE]/10"
        />
        
        <StatsCard 
          title="Total Biaya"
          value={statsLoading ? "Memuat..." : new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(callStats?.totalCost || 0)}
          change={{
            value: "15.2%",
            isIncrease: true
          }}
          icon={<DollarSign className="text-[#A80000]" />}
          iconBgColor="bg-[#A80000]/10"
        />
        
        <StatsCard 
          title="Rata-rata Biaya per Panggilan"
          value={statsLoading ? "Memuat..." : new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(callStats?.avgCostPerCall || 0)}
          change={{
            value: "2.1%",
            isIncrease: false
          }}
          icon={<Calculator className="text-[#FFB900]" />}
          iconBgColor="bg-[#FFB900]/10"
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CallChart startDate={startDate} endDate={endDate} />
        <DistributionChart startDate={startDate} endDate={endDate} />
      </div>
      
      {/* Calls Table */}
      <div className="mb-6">
        <CallTable startDate={startDate} endDate={endDate} />
      </div>
      
      {/* Department Table */}
      <div>
        <DepartmentTable 
          startDate={startDate} 
          endDate={endDate} 
          onGenerateInvoices={handleGenerateInvoices}
        />
      </div>
    </div>
  );
}
