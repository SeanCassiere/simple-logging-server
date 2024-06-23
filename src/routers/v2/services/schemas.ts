import { z } from "zod";

/**
 * Fields
 */
const f = {
  id: z.string(),
  name: z.string(),
  isPersisted: z.boolean(),
  isAdmin: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
};

export const createServiceSchema = z.object({});

export const getServiceFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  page_size: z.coerce.number().min(1).default(50),
});

const serviceOutput = z.object({
  id: f.id,
  name: f.name,
  isPersisted: f.isPersisted,
  isAdmin: f.isAdmin,
  isActive: f.isActive,
  createdAt: f.createdAt,
});

export const getServicesOutputSchema = z.array(serviceOutput);

export const createServiceInputSchema = z.object({
  name: z.string(),
  isPersisted: z.boolean(),
  isAdmin: z.boolean(),
});
export const createServiceOutputSchema = serviceOutput;
export const getServiceOutputSchema = serviceOutput;
