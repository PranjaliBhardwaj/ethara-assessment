const { z } = require('zod');

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .default(''),
  status: z.enum(['todo', 'in-progress', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  assignedTo: z.string().nullable().optional().default(null),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .default(null)
    .transform((val) => (val ? new Date(val) : null)),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().nullable().optional(),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
});

const updateStatusSchema = z.object({
  status: z.enum(['todo', 'in-progress', 'done'], {
    required_error: 'Status is required',
  }),
  order: z.number().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema, updateStatusSchema };
