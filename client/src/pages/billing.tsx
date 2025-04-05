import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DownloadCloud, 
  FileText,
  BarChart2,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import DateRangeSelector from '@/components/ui/date-range-selector';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { getDateRange } from '@/lib/utils';
import DepartmentTable from '@/components/ui/department-table';

export default function Billing() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('last30days');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('summary');
  const pageSize = 10;
  
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
  
  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices']
  });
  
  const handleGenerateInvoices = () => {
    toast({
      title: "Generating Invoices",
      description: "Invoices are being generated for all departments.",
      duration: 3000
    });
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  const totalPages = invoices ? Math.ceil(invoices.length / pageSize) : 0;
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-700 mb-4 sm:mb-0">Billing & Invoices</h1>
        
        <DateRangeSelector 
          value={dateRange}
          onChange={setDateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="summary">Billing Summary</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <DepartmentTable 
            startDate={startDate} 
            endDate={endDate} 
            onGenerateInvoices={handleGenerateInvoices}
          />
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between gap-4">
                <form onSubmit={handleSearch} className="relative max-w-md">
                  <Input
                    type="text"
                    placeholder="Search invoices..."
                    className="pl-9 pr-4 py-2 rounded-md w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    className="absolute inset-y-0 left-0 px-3"
                  >
                    <FileText className="h-4 w-4 text-neutral-400" />
                  </Button>
                </form>
                
                <div className="flex gap-2">
                  <Button onClick={handleGenerateInvoices} className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Invoices
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-neutral-100">
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Calls</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading invoices...
                        </TableCell>
                      </TableRow>
                    ) : invoices && invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>INV-{invoice.id.toString().padStart(5, '0')}</TableCell>
                          <TableCell>{invoice.department}</TableCell>
                          <TableCell>
                            {formatDate(invoice.fromDate)} - {formatDate(invoice.toDate)}
                          </TableCell>
                          <TableCell>{invoice.totalCalls}</TableCell>
                          <TableCell>${Number(invoice.totalCost).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                              invoice.status === 'paid' 
                                ? 'bg-[#107C10]/20 text-[#107C10]' 
                                : invoice.status === 'approved' 
                                  ? 'bg-[#0078D4]/20 text-[#0078D4]'
                                  : 'bg-[#FFB900]/20 text-[#FFB900]'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800" title="View Details">
                                <BarChart2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800" title="Download PDF">
                                <DownloadCloud className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {invoices && invoices.length > 0 && (
                <div className="p-4 border-t border-neutral-200 flex justify-between items-center">
                  <div className="text-sm text-neutral-500">
                    Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, invoices.length)}</span> of <span className="font-medium">{invoices.length}</span> invoices
                  </div>
                  
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
