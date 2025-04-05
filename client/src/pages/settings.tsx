import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Building,
  Save,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { insertDepartmentSchema, type Department } from '@shared/schema';

const generalSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Invalid email address').optional(),
  companyLogo: z.string().optional(),
  currencySymbol: z.string().min(1, 'Currency symbol is required'),
  dateFormat: z.string().min(1, 'Date format is required'),
  showCostsToUsers: z.boolean().default(true),
  defaultInvoiceTemplate: z.string().min(1, 'Default invoice template is required'),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  
  // Fetch departments
  const { data: departments, isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });
  
  // Mutations for departments
  const createDepartmentMutation = useMutation({
    mutationFn: (departmentData: z.infer<typeof insertDepartmentSchema>) => {
      return apiRequest('POST', '/api/departments', departmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: 'Department Created',
        description: 'The department has been successfully created.',
        duration: 3000,
      });
      departmentForm.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create department: ${error.message}`,
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
  
  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: z.infer<typeof insertDepartmentSchema> }) => {
      return apiRequest('PUT', `/api/departments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: 'Department Updated',
        description: 'The department has been successfully updated.',
        duration: 3000,
      });
      setEditingDepartment(null);
      departmentForm.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update department: ${error.message}`,
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
  
  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: 'Department Deleted',
        description: 'The department has been successfully deleted.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete department: ${error.message}`,
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
  
  // General settings form
  const generalSettingsForm = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      companyName: 'My Company',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      companyLogo: '',
      currencySymbol: '$',
      dateFormat: 'MM/DD/YYYY',
      showCostsToUsers: true,
      defaultInvoiceTemplate: 'standard',
    },
  });
  
  // Department form
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  const departmentForm = useForm<z.infer<typeof insertDepartmentSchema>>({
    resolver: zodResolver(insertDepartmentSchema),
    defaultValues: {
      name: '',
      costCenter: '',
      manager: '',
    },
  });
  
  // Handle general settings submission
  const onSubmitGeneralSettings = (data: GeneralSettingsFormValues) => {
    // This would typically save to an API endpoint
    console.log('Saving general settings:', data);
    
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been successfully saved.',
      duration: 3000,
    });
  };
  
  // Handle department form submission
  const onSubmitDepartment = (data: z.infer<typeof insertDepartmentSchema>) => {
    if (editingDepartment) {
      updateDepartmentMutation.mutate({ id: editingDepartment.id, data });
    } else {
      createDepartmentMutation.mutate(data);
    }
  };
  
  // Handle edit department
  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    departmentForm.reset({
      name: department.name,
      costCenter: department.costCenter || '',
      manager: department.manager || '',
    });
  };
  
  // Handle delete department
  const handleDeleteDepartment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteDepartmentMutation.mutate(id);
    }
  };
  
  // Cancel editing department
  const cancelEditDepartment = () => {
    setEditingDepartment(null);
    departmentForm.reset();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-700 mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure the basic settings for the PABX billing system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalSettingsForm}>
                <form 
                  id="general-settings-form" 
                  onSubmit={generalSettingsForm.handleSubmit(onSubmitGeneralSettings)} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Company Information</h3>
                    
                    <FormField
                      control={generalSettingsForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalSettingsForm.control}
                      name="companyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter company address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalSettingsForm.control}
                        name="companyPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalSettingsForm.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-neutral-200">
                    <h3 className="text-lg font-medium">Display Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalSettingsForm.control}
                        name="currencySymbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Symbol</FormLabel>
                            <FormControl>
                              <Input placeholder="$" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalSettingsForm.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={generalSettingsForm.control}
                      name="showCostsToUsers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Show Costs to Regular Users</FormLabel>
                            <FormDescription>
                              If enabled, non-admin users will be able to see call costs.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-neutral-200">
                    <h3 className="text-lg font-medium">Invoice Settings</h3>
                    
                    <FormField
                      control={generalSettingsForm.control}
                      name="defaultInvoiceTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Invoice Template</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard Template</SelectItem>
                              <SelectItem value="detailed">Detailed Template</SelectItem>
                              <SelectItem value="simple">Simple Template</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t border-neutral-200 pt-4">
              <Button 
                type="submit" 
                form="general-settings-form" 
                className="flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>{editingDepartment ? 'Edit Department' : 'Add Department'}</CardTitle>
                  <CardDescription>
                    {editingDepartment 
                      ? `Update details for ${editingDepartment.name}` 
                      : 'Create a new department for billing purposes.'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...departmentForm}>
                    <form 
                      id="department-form" 
                      onSubmit={departmentForm.handleSubmit(onSubmitDepartment)} 
                      className="space-y-4"
                    >
                      <FormField
                        control={departmentForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sales, Marketing" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={departmentForm.control}
                        name="costCenter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Center (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. CC001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={departmentForm.control}
                        name="manager"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Manager (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Manager name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="border-t border-neutral-200 pt-4 flex justify-between">
                  {editingDepartment ? (
                    <>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={cancelEditDepartment}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        form="department-form" 
                        className="flex items-center"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Update
                      </Button>
                    </>
                  ) : (
                    <Button 
                      type="submit" 
                      form="department-form" 
                      className="flex items-center ml-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Department
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>
                    Manage departments for call cost allocation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentsLoading ? (
                      <p className="text-center py-4">Loading departments...</p>
                    ) : departments && departments.length > 0 ? (
                      departments.map((department) => (
                        <div 
                          key={department.id} 
                          className="border rounded-md p-4 flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-medium">{department.name}</h4>
                            <div className="text-sm text-neutral-500 flex flex-col sm:flex-row sm:gap-2">
                              <span>{department.costCenter ? `Cost Center: ${department.costCenter}` : 'No cost center'}</span>
                              {department.costCenter && department.manager && <span className="hidden sm:inline">•</span>}
                              <span>{department.manager ? `Manager: ${department.manager}` : 'No manager assigned'}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleEditDepartment(department)} 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#0078D4] hover:text-[#106EBE]" 
                              title="Edit Department"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDeleteDepartment(department.id)} 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#A80000] hover:text-[#A80000]/80" 
                              title="Delete Department"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <Building className="mx-auto h-12 w-12 text-neutral-300 mb-2" />
                        <p>No departments found. Add a department to get started.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>
                Manage your PABX billing system data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-6">
                <h3 className="text-lg font-medium mb-2">Backup Data</h3>
                <p className="text-neutral-500 mb-4">
                  Download a complete backup of your PABX billing system data.
                </p>
                <Button className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Download Backup
                </Button>
              </div>
              
              <div className="border rounded-md p-6">
                <h3 className="text-lg font-medium mb-2">Restore Data</h3>
                <p className="text-neutral-500 mb-4">
                  Restore from a previous backup file. This will overwrite all current data.
                </p>
                <div className="flex items-center gap-2">
                  <Input type="file" className="max-w-md" />
                  <Button variant="outline">Upload & Restore</Button>
                </div>
              </div>
              
              <div className="border rounded-md p-6 border-[#A80000]/20 bg-[#A80000]/5">
                <h3 className="text-lg font-medium mb-2 text-[#A80000]">Data Purge</h3>
                <p className="text-neutral-600 mb-4">
                  Permanently delete old data from the system.
                </p>
                <div className="flex items-center gap-2">
                  <Select defaultValue="90days">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">Older than 30 days</SelectItem>
                      <SelectItem value="90days">Older than 90 days</SelectItem>
                      <SelectItem value="6months">Older than 6 months</SelectItem>
                      <SelectItem value="1year">Older than 1 year</SelectItem>
                      <SelectItem value="all">All data</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="destructive">Purge Data</Button>
                </div>
                <p className="text-sm text-[#A80000] mt-2">
                  Warning: This action cannot be undone. Make sure to create a backup first.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
