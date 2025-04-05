import { 
  users, type User, type InsertUser,
  departments, type Department, type InsertDepartment,
  calls, type Call, type InsertCall,
  rates, type Rate, type InsertRate,
  invoices, type Invoice, type InsertInvoice,
  reportTemplates, type ReportTemplate, type InsertReportTemplate,
  CallType 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Department operations
  getDepartment(id: number): Promise<Department | undefined>;
  getDepartmentByName(name: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  getDepartments(): Promise<Department[]>;
  deleteDepartment(id: number): Promise<boolean>;

  // Call operations
  getCall(id: number): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  getCalls(limit?: number, offset?: number, filters?: Partial<Call>): Promise<{ calls: Call[], total: number }>;
  getCallsByDateRange(startDate: Date, endDate: Date): Promise<Call[]>;
  getCallsByDepartment(department: string, startDate?: Date, endDate?: Date): Promise<Call[]>;
  
  // Rate operations
  getRate(id: number): Promise<Rate | undefined>;
  getRateByCallType(callType: CallType): Promise<Rate | undefined>;
  createRate(rate: InsertRate): Promise<Rate>;
  updateRate(id: number, rate: Partial<InsertRate>): Promise<Rate | undefined>;
  getRates(): Promise<Rate[]>;
  deleteRate(id: number): Promise<boolean>;

  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  getInvoices(department?: string): Promise<Invoice[]>;
  
  // Report Template operations
  getReportTemplate(id: number): Promise<ReportTemplate | undefined>;
  createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate>;
  updateReportTemplate(id: number, template: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined>;
  getReportTemplates(): Promise<ReportTemplate[]>;
  deleteReportTemplate(id: number): Promise<boolean>;

  // Statistics
  getCallStats(startDate?: Date, endDate?: Date): Promise<{
    totalCalls: number;
    totalDuration: number;
    totalCost: number;
    avgCostPerCall: number;
    callsByType: Record<CallType, number>;
  }>;
  
  getDepartmentStats(startDate?: Date, endDate?: Date): Promise<{
    department: string;
    totalCalls: number;
    callsByType: Record<CallType, { count: number, cost: number }>;
    totalCost: number;
  }[]>;
  
  getDailyCallVolume(startDate: Date, endDate: Date): Promise<Array<{ date: string; count: number }>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private departments: Map<number, Department>;
  private calls: Map<number, Call>;
  private rates: Map<number, Rate>;
  private invoices: Map<number, Invoice>;
  private reportTemplates: Map<number, ReportTemplate>;
  
  private userCurrentId: number;
  private departmentCurrentId: number;
  private callCurrentId: number;
  private rateCurrentId: number;
  private invoiceCurrentId: number;
  private reportTemplateCurrentId: number;

  constructor() {
    this.users = new Map();
    this.departments = new Map();
    this.calls = new Map();
    this.rates = new Map();
    this.invoices = new Map();
    this.reportTemplates = new Map();
    
    this.userCurrentId = 1;
    this.departmentCurrentId = 1;
    this.callCurrentId = 1;
    this.rateCurrentId = 1;
    this.invoiceCurrentId = 1;
    this.reportTemplateCurrentId = 1;
    
    // Initialize with default data
    this.initDefaultData();
  }

  private initDefaultData() {
    // Create default departments
    const departments: InsertDepartment[] = [
      { name: 'Sales', costCenter: 'CC001', manager: 'John Manager' },
      { name: 'Marketing', costCenter: 'CC002', manager: 'Sarah Manager' },
      { name: 'Support', costCenter: 'CC003', manager: 'Mike Manager' },
      { name: 'Finance', costCenter: 'CC004', manager: 'Lisa Manager' },
      { name: 'IT', costCenter: 'CC005', manager: 'David Manager' }
    ];
    
    departments.forEach(dept => this.createDepartment(dept));
    
    // Create default users
    const users: InsertUser[] = [
      { username: 'admin', password: 'admin123', displayName: 'Admin User', role: 'admin', extension: '1000' },
      { username: 'sales1', password: 'sales123', displayName: 'Sales User', department: 'Sales', role: 'user', extension: '1024' },
      { username: 'marketing1', password: 'mkt123', displayName: 'Marketing User', department: 'Marketing', role: 'user', extension: '1102' },
      { username: 'support1', password: 'support123', displayName: 'Support User', department: 'Support', role: 'user', extension: '1056' },
      { username: 'finance1', password: 'fin123', displayName: 'Finance User', department: 'Finance', role: 'user', extension: '1201' },
      { username: 'it1', password: 'it123', displayName: 'IT User', department: 'IT', role: 'user', extension: '1300' }
    ];
    
    users.forEach(user => this.createUser(user));
    
    // Create default rates
    const rates: InsertRate[] = [
      { name: 'Internal Calls', callType: 'internal', ratePerMinute: '0', connectionFee: '0', description: 'Free internal calls' },
      { name: 'Local Calls', callType: 'local', ratePerMinute: '0.15', connectionFee: '0.1', description: 'Local area calls' },
      { name: 'Long Distance', callType: 'long-distance', ratePerMinute: '0.25', connectionFee: '0.5', description: 'Long distance calls within country' },
      { name: 'International', callType: 'international', ratePerMinute: '0.75', connectionFee: '1.0', description: 'International calls', prefix: '+' }
    ];
    
    rates.forEach(rate => this.createRate(rate));
    
    // Create some sample calls (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Generate random calls for demonstration
    const callTypes: CallType[] = ['internal', 'local', 'long-distance', 'international'];
    const extensions = ['1024', '1102', '1056', '1201', '1300'];
    const departmentNames = ['Sales', 'Marketing', 'Support', 'Finance', 'IT'];
    
    for (let i = 0; i < 200; i++) {
      const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
      const sourceIndex = Math.floor(Math.random() * extensions.length);
      
      let destination = '';
      if (callType === 'internal') {
        // An extension different from source
        let destIndex = sourceIndex;
        while (destIndex === sourceIndex) {
          destIndex = Math.floor(Math.random() * extensions.length);
        }
        destination = `Ext. ${extensions[destIndex]}`;
      } else if (callType === 'local') {
        destination = `+1 (202) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
      } else if (callType === 'long-distance') {
        destination = `+1 (${Math.floor(200 + Math.random() * 800)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
      } else {
        // International
        const countryCodes = [44, 33, 49, 61, 81];
        destination = `+${countryCodes[Math.floor(Math.random() * countryCodes.length)]} ${Math.floor(10000000 + Math.random() * 90000000)}`;
      }
      
      // Random duration between 10 seconds and 30 minutes
      const duration = Math.floor(10 + Math.random() * 1800);
      
      // Get rate for this call type
      const rate = Array.from(this.rates.values()).find(r => r.callType === callType);
      
      if (rate) {
        // Calculate cost: connection fee + (duration in minutes * rate per minute)
        const durationInMinutes = duration / 60;
        const cost = Number(rate.connectionFee) + (durationInMinutes * Number(rate.ratePerMinute));
        
        // Random date in the last 30 days
        const randomDaysAgo = Math.floor(Math.random() * 30);
        const randomHours = Math.floor(Math.random() * 24);
        const randomMinutes = Math.floor(Math.random() * 60);
        const callDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000));
        
        const call: InsertCall = {
          timestamp: callDate,
          sourceExtension: `Ext. ${extensions[sourceIndex]}`,
          sourceDepartment: departmentNames[sourceIndex],
          destinationNumber: destination,
          destinationType: callType === 'internal' ? 'extension' : 'phone',
          callType,
          duration,
          cost: cost.toFixed(2)
        };
        
        this.createCall(call);
      }
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Department operations
  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async getDepartmentByName(name: string): Promise<Department | undefined> {
    return Array.from(this.departments.values()).find(
      (dept) => dept.name === name,
    );
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = this.departmentCurrentId++;
    const department: Department = { ...insertDepartment, id };
    this.departments.set(id, department);
    return department;
  }

  async updateDepartment(id: number, departmentData: Partial<InsertDepartment>): Promise<Department | undefined> {
    const department = this.departments.get(id);
    if (!department) return undefined;
    
    const updatedDepartment = { ...department, ...departmentData };
    this.departments.set(id, updatedDepartment);
    return updatedDepartment;
  }

  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async deleteDepartment(id: number): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Call operations
  async getCall(id: number): Promise<Call | undefined> {
    return this.calls.get(id);
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.callCurrentId++;
    const call: Call = { ...insertCall, id };
    this.calls.set(id, call);
    return call;
  }

  async getCalls(limit = 100, offset = 0, filters: Partial<Call> = {}): Promise<{ calls: Call[], total: number }> {
    let calls = Array.from(this.calls.values());
    
    // Apply filters if any
    if (Object.keys(filters).length > 0) {
      calls = calls.filter(call => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined) return true;
          // @ts-ignore - Dynamic key access
          return call[key] === value;
        });
      });
    }
    
    // Sort by timestamp descending
    calls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const total = calls.length;
    const paginatedCalls = calls.slice(offset, offset + limit);
    
    return { calls: paginatedCalls, total };
  }

  async getCallsByDateRange(startDate: Date, endDate: Date): Promise<Call[]> {
    const calls = Array.from(this.calls.values());
    return calls.filter(call => {
      const callDate = new Date(call.timestamp);
      return callDate >= startDate && callDate <= endDate;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getCallsByDepartment(department: string, startDate?: Date, endDate?: Date): Promise<Call[]> {
    const calls = Array.from(this.calls.values()).filter(call => call.sourceDepartment === department);
    
    if (startDate && endDate) {
      return calls.filter(call => {
        const callDate = new Date(call.timestamp);
        return callDate >= startDate && callDate <= endDate;
      });
    }
    
    return calls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Rate operations
  async getRate(id: number): Promise<Rate | undefined> {
    return this.rates.get(id);
  }

  async getRateByCallType(callType: CallType): Promise<Rate | undefined> {
    return Array.from(this.rates.values()).find(
      (rate) => rate.callType === callType,
    );
  }

  async createRate(insertRate: InsertRate): Promise<Rate> {
    const id = this.rateCurrentId++;
    const rate: Rate = { ...insertRate, id };
    this.rates.set(id, rate);
    return rate;
  }

  async updateRate(id: number, rateData: Partial<InsertRate>): Promise<Rate | undefined> {
    const rate = this.rates.get(id);
    if (!rate) return undefined;
    
    const updatedRate = { ...rate, ...rateData };
    this.rates.set(id, updatedRate);
    return updatedRate;
  }

  async getRates(): Promise<Rate[]> {
    return Array.from(this.rates.values());
  }

  async deleteRate(id: number): Promise<boolean> {
    return this.rates.delete(id);
  }

  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceCurrentId++;
    const invoice: Invoice = { ...insertInvoice, id, generatedAt: new Date() };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...invoiceData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async getInvoices(department?: string): Promise<Invoice[]> {
    const invoices = Array.from(this.invoices.values());
    if (department) {
      return invoices.filter(inv => inv.department === department);
    }
    return invoices;
  }

  // Report Template operations
  async getReportTemplate(id: number): Promise<ReportTemplate | undefined> {
    return this.reportTemplates.get(id);
  }

  async createReportTemplate(insertTemplate: InsertReportTemplate): Promise<ReportTemplate> {
    const id = this.reportTemplateCurrentId++;
    const template: ReportTemplate = { ...insertTemplate, id };
    this.reportTemplates.set(id, template);
    return template;
  }

  async updateReportTemplate(id: number, templateData: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    const template = this.reportTemplates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...templateData };
    this.reportTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async getReportTemplates(): Promise<ReportTemplate[]> {
    return Array.from(this.reportTemplates.values());
  }

  async deleteReportTemplate(id: number): Promise<boolean> {
    return this.reportTemplates.delete(id);
  }

  // Statistics
  async getCallStats(startDate?: Date, endDate?: Date): Promise<{
    totalCalls: number;
    totalDuration: number;
    totalCost: number;
    avgCostPerCall: number;
    callsByType: Record<CallType, number>;
  }> {
    let calls = Array.from(this.calls.values());
    
    if (startDate && endDate) {
      calls = calls.filter(call => {
        const callDate = new Date(call.timestamp);
        return callDate >= startDate && callDate <= endDate;
      });
    }
    
    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
    const totalCost = calls.reduce((sum, call) => sum + Number(call.cost), 0);
    const avgCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;
    
    const callsByType: Record<CallType, number> = {
      'internal': 0,
      'local': 0,
      'long-distance': 0,
      'international': 0
    };
    
    calls.forEach(call => {
      callsByType[call.callType as CallType]++;
    });
    
    return {
      totalCalls,
      totalDuration,
      totalCost,
      avgCostPerCall,
      callsByType
    };
  }
  
  async getDepartmentStats(startDate?: Date, endDate?: Date): Promise<{
    department: string;
    totalCalls: number;
    callsByType: Record<CallType, { count: number, cost: number }>;
    totalCost: number;
  }[]> {
    const departments = await this.getDepartments();
    const result = [];
    
    for (const dept of departments) {
      let calls = await this.getCallsByDepartment(dept.name);
      
      if (startDate && endDate) {
        calls = calls.filter(call => {
          const callDate = new Date(call.timestamp);
          return callDate >= startDate && callDate <= endDate;
        });
      }
      
      const callsByType: Record<CallType, { count: number, cost: number }> = {
        'internal': { count: 0, cost: 0 },
        'local': { count: 0, cost: 0 },
        'long-distance': { count: 0, cost: 0 },
        'international': { count: 0, cost: 0 }
      };
      
      calls.forEach(call => {
        const type = call.callType as CallType;
        callsByType[type].count++;
        callsByType[type].cost += Number(call.cost);
      });
      
      const totalCost = calls.reduce((sum, call) => sum + Number(call.cost), 0);
      
      result.push({
        department: dept.name,
        totalCalls: calls.length,
        callsByType,
        totalCost
      });
    }
    
    return result;
  }
  
  async getDailyCallVolume(startDate: Date, endDate: Date): Promise<Array<{ date: string; count: number }>> {
    const calls = await this.getCallsByDateRange(startDate, endDate);
    
    // Group calls by date
    const callsByDate: Record<string, number> = {};
    
    // Initialize all dates in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      callsByDate[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Count calls per date
    calls.forEach(call => {
      const dateStr = new Date(call.timestamp).toISOString().split('T')[0];
      if (callsByDate[dateStr] !== undefined) {
        callsByDate[dateStr]++;
      }
    });
    
    // Convert to array of { date, count } objects
    return Object.entries(callsByDate).map(([date, count]) => ({ date, count }));
  }
}

export const storage = new MemStorage();
