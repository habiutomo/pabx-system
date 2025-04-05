import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BarChart2, FileText } from 'lucide-react';

interface DepartmentTableProps {
  startDate: Date;
  endDate: Date;
  onGenerateInvoices: () => void;
}

export default function DepartmentTable({ startDate, endDate, onGenerateInvoices }: DepartmentTableProps) {
  // Format dates for the API
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/stats/departments', formattedStartDate, formattedEndDate],
    enabled: !!startDate && !!endDate
  });
  
  // Calculate totals for the footer
  const calculateTotals = () => {
    if (!data) return null;
    
    const totals = {
      totalCalls: 0,
      local: { count: 0, cost: 0 },
      longDistance: { count: 0, cost: 0 },
      international: { count: 0, cost: 0 },
      totalCost: 0
    };
    
    data.forEach(dept => {
      totals.totalCalls += dept.totalCalls;
      totals.local.count += dept.callsByType.local.count;
      totals.local.cost += dept.callsByType.local.cost;
      totals.longDistance.count += dept.callsByType['long-distance'].count;
      totals.longDistance.cost += dept.callsByType['long-distance'].cost;
      totals.international.count += dept.callsByType.international.count;
      totals.international.cost += dept.callsByType.international.cost;
      totals.totalCost += dept.totalCost;
    });
    
    return totals;
  };
  
  const totals = calculateTotals();
  
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="font-semibold text-neutral-700">Department Billing Summary</h3>
        
        <Button 
          variant="outline" 
          onClick={onGenerateInvoices}
          className="border-[#0078D4] text-[#0078D4] hover:bg-[#0078D4] hover:text-white transition-colors"
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Invoices
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-100">
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Total Calls</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Long Distance</TableHead>
              <TableHead>International</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading department data...
                </TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (
              data.map((dept, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell>{dept.totalCalls}</TableCell>
                  <TableCell>{dept.callsByType.local.count} (${dept.callsByType.local.cost.toFixed(2)})</TableCell>
                  <TableCell>{dept.callsByType['long-distance'].count} (${dept.callsByType['long-distance'].cost.toFixed(2)})</TableCell>
                  <TableCell>{dept.callsByType.international.count} (${dept.callsByType.international.cost.toFixed(2)})</TableCell>
                  <TableCell className="font-medium">${dept.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="text-[#0078D4] hover:text-[#106EBE]" title="View Details">
                        <BarChart2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-800" title="Download PDF">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No department data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {totals && (
            <TableFooter className="bg-neutral-100 font-semibold">
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>{totals.totalCalls}</TableCell>
                <TableCell>{totals.local.count} (${totals.local.cost.toFixed(2)})</TableCell>
                <TableCell>{totals.longDistance.count} (${totals.longDistance.cost.toFixed(2)})</TableCell>
                <TableCell>{totals.international.count} (${totals.international.cost.toFixed(2)})</TableCell>
                <TableCell>${totals.totalCost.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
}
