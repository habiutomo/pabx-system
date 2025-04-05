import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2,
  ChevronsUpDown
} from 'lucide-react';
import { insertRateSchema, type Rate, type CallType } from '@shared/schema';

// Extended schema for the form with validation
const rateFormSchema = insertRateSchema.extend({
  ratePerMinute: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Rate per minute must be a positive number",
  }),
  connectionFee: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Connection fee must be a positive number",
  }),
});

type RateFormValues = z.infer<typeof rateFormSchema>;

export default function RateConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  
  // Fetch all rates
  const { data: rates, isLoading } = useQuery<Rate[]>({
    queryKey: ['/api/rates'],
  });
  
  // Create rate mutation
  const createRateMutation = useMutation({
    mutationFn: (rateData: RateFormValues) => {
      return apiRequest('POST', '/api/rates', rateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rates'] });
      toast({
        title: 'Rate Created',
        description: 'The rate configuration has been successfully created.',
        duration: 3000,
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create rate: ${error.message}`,
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
  
  // Update rate mutation
  const updateRateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RateFormValues }) => {
      return apiRequest('PUT', `/api/rates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rates'] });
      toast({
        title: 'Rate Updated',
        description: 'The rate configuration has been successfully updated.',
        duration: 3000,
      });
      setEditingRate(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update rate: ${error.message}`,
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
  
  // Delete rate mutation
  const deleteRateMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/rates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rates'] });
      toast({
        title: 'Rate Deleted',
        description: 'The rate configuration has been successfully deleted.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete rate: ${error.message}`,
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
  
  // Form for adding/editing rate
  const form = useForm<RateFormValues>({
    resolver: zodResolver(rateFormSchema),
    defaultValues: {
      name: '',
      callType: 'internal',
      ratePerMinute: '0',
      connectionFee: '0',
      description: '',
      prefix: '',
    },
  });
  
  // Handle form submission
  const onSubmit = (data: RateFormValues) => {
    if (editingRate) {
      updateRateMutation.mutate({ id: editingRate.id, data });
    } else {
      createRateMutation.mutate(data);
    }
  };
  
  // Open edit dialog with rate data
  const handleEditRate = (rate: Rate) => {
    setEditingRate(rate);
    form.reset({
      name: rate.name,
      callType: rate.callType as CallType,
      ratePerMinute: rate.ratePerMinute.toString(),
      connectionFee: rate.connectionFee.toString(),
      description: rate.description || '',
      prefix: rate.prefix || '',
    });
  };
  
  // Confirm delete rate
  const handleDeleteRate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this rate?')) {
      deleteRateMutation.mutate(id);
    }
  };
  
  // Reset form when opening add dialog
  const handleOpenAddDialog = () => {
    form.reset({
      name: '',
      callType: 'internal',
      ratePerMinute: '0',
      connectionFee: '0',
      description: '',
      prefix: '',
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-neutral-700">Rate Configuration</h1>
        
        <Button onClick={handleOpenAddDialog} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add New Rate
        </Button>
      </div>
      
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-700">Call Rates</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Configure the rates for different types of calls in your PABX system.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-100">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Call Type</TableHead>
                <TableHead>Rate per Minute</TableHead>
                <TableHead>Connection Fee</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading rate configurations...
                  </TableCell>
                </TableRow>
              ) : rates && rates.length > 0 ? (
                rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs inline-block ${
                        rate.callType === 'internal' 
                          ? 'bg-[#107C10]/20 text-[#107C10]' 
                          : rate.callType === 'local' 
                            ? 'bg-[#0078D4]/20 text-[#0078D4]' 
                            : rate.callType === 'long-distance' 
                              ? 'bg-[#FFB900]/20 text-[#FFB900]' 
                              : 'bg-[#A80000]/20 text-[#A80000]'
                      }`}>
                        {rate.callType === 'internal' 
                          ? 'Internal' 
                          : rate.callType === 'local' 
                            ? 'Local' 
                            : rate.callType === 'long-distance' 
                              ? 'Long Distance' 
                              : 'International'}
                      </span>
                    </TableCell>
                    <TableCell>${Number(rate.ratePerMinute).toFixed(4)}/min</TableCell>
                    <TableCell>${Number(rate.connectionFee).toFixed(2)}</TableCell>
                    <TableCell>{rate.description}</TableCell>
                    <TableCell>{rate.prefix || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleEditRate(rate)} variant="ghost" size="icon" className="text-[#0078D4] hover:text-[#106EBE]" title="Edit Rate">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDeleteRate(rate.id)} variant="ghost" size="icon" className="text-[#A80000] hover:text-[#A80000]/80" title="Delete Rate">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No rate configurations found. Click "Add New Rate" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Add Rate Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Rate</DialogTitle>
            <DialogDescription>
              Create a new rate configuration for call billing.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Local Calls" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="callType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select call type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="long-distance">Long Distance</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ratePerMinute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate per Minute ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="connectionFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Fee ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of this rate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefix (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +1 for US calls" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a prefix for matching this rate to specific call destinations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Save Rate
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Rate Dialog */}
      <Dialog open={!!editingRate} onOpenChange={(open) => !open && setEditingRate(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Rate</DialogTitle>
            <DialogDescription>
              Update the rate configuration details.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Local Calls" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="callType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select call type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="long-distance">Long Distance</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ratePerMinute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate per Minute ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="connectionFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Fee ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of this rate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefix (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +1 for US calls" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a prefix for matching this rate to specific call destinations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingRate(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex items-center"
                  disabled={updateRateMutation.isPending}
                >
                  {updateRateMutation.isPending ? (
                    <ChevronsUpDown className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <DollarSign className="mr-2 h-4 w-4" />
                  )}
                  Update Rate
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
