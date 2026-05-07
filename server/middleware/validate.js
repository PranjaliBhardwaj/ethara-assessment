/**
 * Middleware factory for Zod schema validation
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Replace with parsed (cleaned) data
      next();
    } catch (error) {
      // Forward Zod error to the error handler
      error.name = 'ZodError';
      next(error);
    }
  };
};

module.exports = validate;
