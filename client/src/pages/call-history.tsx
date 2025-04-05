import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DownloadCloud, 
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from '@/components/ui/pagination';
import DateRangeSelector from '@/components/ui/date-range-selector';
import { formatDuration, formatDateTime, formatCallType } from '@/lib/formatters';
import { getDateRange } from '@/lib/utils';
import { Call } from '@shared/schema';

export default function CallHistory() {
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [callTypeFilter, setCallTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  
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
  
  // Fetch departments for filter
  const { data: departments } = useQuery({
    queryKey: ['/api/departments']
  });
  
  // Fetch calls with pagination and filters
  const { data, isLoading } = useQuery<{ calls: Call[], total: number }>({
    queryKey: ['/api/calls', formattedStartDate, formattedEndDate, currentPage, pageSize, searchTerm, callTypeFilter, departmentFilter],
    queryFn: async () => {
      const offset = (currentPage - 1) * pageSize;
      const queryParams = new URLSearchParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        limit: pageSize.toString(),
        offset: offset.toString()
      });
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (callTypeFilter !== 'all') {
        queryParams.append('callType', callTypeFilter);
      }
      
      if (departmentFilter !== 'all') {
        queryParams.append('sourceDepartment', departmentFilter);
      }
      
      const response = await fetch(`/api/calls?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }
      return response.json();
    }
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Searching will reset pagination
    setCurrentPage(1);
  };
  
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export calls to CSV');
  };
  
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-700 mb-4 sm:mb-0">Call History</h1>
        
        <DateRangeSelector 
          value={dateRange}
          onChange={setDateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
      
      <div className="bg-white rounded-md shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by extension, department, or phone number..."
                  className="pl-9 pr-4 py-2 rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  className="absolute inset-y-0 left-0 px-3"
                >
                  <Filter className="h-4 w-4 text-neutral-400" />
                </Button>
              </div>
            </form>
            
            <div className="flex gap-2">
              <Select value={callTypeFilter} onValueChange={setCallTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Call Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="long-distance">Long Distance</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleExport} className="flex items-center whitespace-nowrap">
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-100">
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading calls...
                  </TableCell>
                </TableRow>
              ) : data && data.calls.length > 0 ? (
                data.calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>{formatDateTime(call.timestamp)}</TableCell>
                    <TableCell>{call.sourceExtension} {call.sourceDepartment ? `(${call.sourceDepartment})` : ''}</TableCell>
                    <TableCell>{call.destinationNumber}</TableCell>
                    <TableCell>
                      <div className={`px-2 py-1 rounded-full text-xs inline-block ${formatCallType(call.callType).className}`}>
                        {formatCallType(call.callType).label}
                      </div>
                    </TableCell>
                    <TableCell>{formatDuration(call.duration)}</TableCell>
                    <TableCell>${Number(call.cost).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No calls found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {data && data.total > 0 && (
          <div className="p-4 border-t border-neutral-200 flex justify-between items-center">
            <div className="text-sm text-neutral-500">
              Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, data.total)}</span> of <span className="font-medium">{data.total}</span> calls
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
