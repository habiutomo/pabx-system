import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertDepartmentSchema, 
  insertCallSchema, 
  insertRateSchema, 
  insertInvoiceSchema, 
  insertReportTemplateSchema,
  CallTypeEnum
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // All API routes prefixed with /api
  
  // Date range validation schema
  const dateRangeSchema = z.object({
    startDate: z.string().transform(val => new Date(val)),
    endDate: z.string().transform(val => new Date(val))
  });

  // Pagination schema
  const paginationSchema = z.object({
    limit: z.string().transform(val => parseInt(val, 10)).optional(),
    offset: z.string().transform(val => parseInt(val, 10)).optional()
  });

  // === User routes ===
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If username is being changed, make sure it's not taken
      if (userData.username && userData.username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(userData.username);
        if (userWithSameUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // === Department routes ===
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      
      // Check if department already exists
      const existingDepartment = await storage.getDepartmentByName(departmentData.name);
      if (existingDepartment) {
        return res.status(400).json({ message: "Department already exists" });
      }
      
      const department = await storage.createDepartment(departmentData);
      res.status(201).json(department);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const departmentData = insertDepartmentSchema.partial().parse(req.body);
      
      // Check if department exists
      const existingDepartment = await storage.getDepartment(id);
      if (!existingDepartment) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      // If name is being changed, make sure it's not taken
      if (departmentData.name && departmentData.name !== existingDepartment.name) {
        const deptWithSameName = await storage.getDepartmentByName(departmentData.name);
        if (deptWithSameName) {
          return res.status(400).json({ message: "Department name already exists" });
        }
      }
      
      const updatedDepartment = await storage.updateDepartment(id, departmentData);
      res.json(updatedDepartment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDepartment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // === Call routes ===
  app.get("/api/calls", async (req, res) => {
    try {
      const { limit, offset } = paginationSchema.parse(req.query);
      
      // Extract filter parameters
      const filters: Record<string, any> = {};
      if (req.query.callType) {
        filters.callType = CallTypeEnum.parse(req.query.callType);
      }
      if (req.query.sourceDepartment) {
        filters.sourceDepartment = req.query.sourceDepartment as string;
      }
      
      const { calls, total } = await storage.getCalls(limit, offset, filters);
      
      res.json({ calls, total });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to fetch calls" });
    }
  });

  app.get("/api/calls/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const call = await storage.getCall(id);
      
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      
      res.json(call);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch call" });
    }
  });

  app.post("/api/calls", async (req, res) => {
    try {
      const callData = insertCallSchema.parse(req.body);
      const call = await storage.createCall(callData);
      res.status(201).json(call);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create call" });
    }
  });

  app.get("/api/calls/date-range", async (req, res) => {
    try {
      const { startDate, endDate } = dateRangeSchema.parse(req.query);
      const calls = await storage.getCallsByDateRange(startDate, endDate);
      res.json(calls);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to fetch calls by date range" });
    }
  });

  app.get("/api/calls/department/:department", async (req, res) => {
    try {
      const department = req.params.department;
      let startDate, endDate;
      
      if (req.query.startDate && req.query.endDate) {
        const dateRange = dateRangeSchema.parse({
          startDate: req.query.startDate,
          endDate: req.query.endDate
        });
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      }
      
      const calls = await storage.getCallsByDepartment(department, startDate, endDate);
      res.json(calls);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to fetch department calls" });
    }
  });

  // === Rate routes ===
  app.get("/api/rates", async (req, res) => {
    try {
      const rates = await storage.getRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rates" });
    }
  });

  app.get("/api/rates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rate = await storage.getRate(id);
      
      if (!rate) {
        return res.status(404).json({ message: "Rate not found" });
      }
      
      res.json(rate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rate" });
    }
  });

  app.post("/api/rates", async (req, res) => {
    try {
      const rateData = insertRateSchema.parse(req.body);
      const rate = await storage.createRate(rateData);
      res.status(201).json(rate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create rate" });
    }
  });

  app.put("/api/rates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rateData = insertRateSchema.partial().parse(req.body);
      
      // Check if rate exists
      const existingRate = await storage.getRate(id);
      if (!existingRate) {
        return res.status(404).json({ message: "Rate not found" });
      }
      
      const updatedRate = await storage.updateRate(id, rateData);
      res.json(updatedRate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update rate" });
    }
  });

  app.delete("/api/rates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Rate not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete rate" });
    }
  });

  // === Invoice routes ===
  app.get("/api/invoices", async (req, res) => {
    try {
      const department = req.query.department as string | undefined;
      const invoices = await storage.getInvoices(department);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      
      // Check if invoice exists
      const existingInvoice = await storage.getInvoice(id);
      if (!existingInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const updatedInvoice = await storage.updateInvoice(id, invoiceData);
      res.json(updatedInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // === Report Template routes ===
  app.get("/api/report-templates", async (req, res) => {
    try {
      const templates = await storage.getReportTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report templates" });
    }
  });

  app.get("/api/report-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getReportTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Report template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report template" });
    }
  });

  app.post("/api/report-templates", async (req, res) => {
    try {
      const templateData = insertReportTemplateSchema.parse(req.body);
      const template = await storage.createReportTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create report template" });
    }
  });

  app.put("/api/report-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const templateData = insertReportTemplateSchema.partial().parse(req.body);
      
      // Check if template exists
      const existingTemplate = await storage.getReportTemplate(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Report template not found" });
      }
      
      const updatedTemplate = await storage.updateReportTemplate(id, templateData);
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update report template" });
    }
  });

  app.delete("/api/report-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReportTemplate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Report template not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete report template" });
    }
  });

  // === Statistics routes ===
  app.get("/api/stats/calls", async (req, res) => {
    try {
      let startDate, endDate;
      
      if (req.query.startDate && req.query.endDate) {
        const dateRange = dateRangeSchema.parse({
          startDate: req.query.startDate,
          endDate: req.query.endDate
        });
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      }
      
      const stats = await storage.getCallStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to fetch call statistics" });
    }
  });

  app.get("/api/stats/departments", async (req, res) => {
    try {
      let startDate, endDate;
      
      if (req.query.startDate && req.query.endDate) {
        const dateRange = dateRangeSchema.parse({
          startDate: req.query.startDate,
          endDate: req.query.endDate
        });
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      }
      
      const stats = await storage.getDepartmentStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to fetch department statistics" });
    }
  });

  app.get("/api/stats/daily-volume", async (req, res) => {
    try {
      const { startDate, endDate } = dateRangeSchema.parse(req.query);
      const data = await storage.getDailyCallVolume(startDate, endDate);
      res.json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to fetch daily call volume" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
