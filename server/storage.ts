import {
  type User,
  type InsertUser,
  type Property,
  type InsertProperty,
  type ServiceRequest,
  type InsertServiceRequest,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  deleteProperty(id: string): Promise<boolean>;

  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequest(id: string): Promise<ServiceRequest | undefined>;
  getServiceRequestsByProperty(propertyId: string): Promise<ServiceRequest[]>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest | undefined>;
  deleteServiceRequest(id: string): Promise<boolean>;
  deleteServiceRequestsByProperty(propertyId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private properties: Map<string, Property>;
  private serviceRequests: Map<string, ServiceRequest>;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.serviceRequests = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      id,
      name: insertProperty.name,
      address: insertProperty.address,
      type: insertProperty.type,
      units: insertProperty.units ?? 1,
    };
    this.properties.set(id, property);
    return property;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values());
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }

  async getServiceRequestsByProperty(propertyId: string): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).filter(
      (request) => request.propertyId === propertyId
    );
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const id = randomUUID();
    const request: ServiceRequest = {
      id,
      propertyId: insertRequest.propertyId,
      title: insertRequest.title,
      description: insertRequest.description,
      category: insertRequest.category,
      priority: insertRequest.priority,
      status: insertRequest.status ?? "open",
    };
    this.serviceRequests.set(id, request);
    return request;
  }

  async updateServiceRequest(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    const existing = this.serviceRequests.get(id);
    if (!existing) return undefined;
    
    const updated: ServiceRequest = { ...existing, ...data, id };
    this.serviceRequests.set(id, updated);
    return updated;
  }

  async deleteServiceRequest(id: string): Promise<boolean> {
    return this.serviceRequests.delete(id);
  }

  async deleteServiceRequestsByProperty(propertyId: string): Promise<void> {
    const entries = Array.from(this.serviceRequests.entries());
    for (const [id, request] of entries) {
      if (request.propertyId === propertyId) {
        this.serviceRequests.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
