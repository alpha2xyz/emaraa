import {
  type User,
  type InsertUser,
  type Property,
  type InsertProperty,
  type Request,
  type InsertRequest,
} from "../shared/schema.js";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  deleteProperty(id: string): Promise<boolean>;

  getServiceRequests(): Promise<Request[]>;
  getServiceRequest(id: string): Promise<Request | undefined>;
  getServiceRequestsByProperty(propertyId: string): Promise<Request[]>;
  createServiceRequest(request: InsertRequest): Promise<Request>;
  updateServiceRequest(id: string, data: Partial<Request>): Promise<Request | undefined>;
  deleteServiceRequest(id: string): Promise<boolean>;
  deleteServiceRequestsByProperty(propertyId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private properties: Map<string, Property>;
  private serviceRequests: Map<string, Request>;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.serviceRequests = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, role: insertUser.role ?? "owner", name: insertUser.name ?? null, id, created_at: new Date() };
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
      building_type: insertProperty.building_type,
      address: insertProperty.address,
      city: insertProperty.city,
      units_count: insertProperty.units_count ?? 0,
      map_url: insertProperty.map_url ?? null,
      national_address: insertProperty.national_address ?? null,
      owner_id: insertProperty.owner_id!,
      created_at: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getServiceRequests(): Promise<Request[]> {
    return Array.from(this.serviceRequests.values());
  }

  async getServiceRequest(id: string): Promise<Request | undefined> {
    return this.serviceRequests.get(id);
  }

  async getServiceRequestsByProperty(propertyId: string): Promise<Request[]> {
    return Array.from(this.serviceRequests.values()).filter(
      (request) => request.property_id === propertyId
    );
  }

  async createServiceRequest(insertRequest: InsertRequest): Promise<Request> {
    const id = randomUUID();
    const request: Request = {
      id,
      owner_id: insertRequest.owner_id!,
      property_id: insertRequest.property_id,
      service_category: insertRequest.service_category ?? "standard",
      description: insertRequest.description ?? null,
      status: insertRequest.status ?? "pending",
      created_at: new Date(),
    };
    this.serviceRequests.set(id, request);
    return request;
  }

  async updateServiceRequest(id: string, data: Partial<Request>): Promise<Request | undefined> {
    const existing = this.serviceRequests.get(id);
    if (!existing) return undefined;
    
    const updated: Request = { ...existing, ...data, id };
    this.serviceRequests.set(id, updated);
    return updated;
  }

  async deleteServiceRequest(id: string): Promise<boolean> {
    return this.serviceRequests.delete(id);
  }

  async deleteServiceRequestsByProperty(propertyId: string): Promise<void> {
    const entries = Array.from(this.serviceRequests.entries());
    for (const [id, request] of entries) {
      if (request.property_id === propertyId) {
        this.serviceRequests.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
