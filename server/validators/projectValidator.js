const { z } = require('zod');

const createProjectSchema = z.object({
  title: z
    .string({ required_error: 'Project title is required' })
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .default(''),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, 'Please provide a valid hex color')
    .optional()
    .default('#6366f1'),
});

const updateProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, 'Please provide a valid hex color')
    .optional(),
});

const addMemberSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).min(1),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
