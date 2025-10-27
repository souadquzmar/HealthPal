import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .message("Password must contain uppercase, lowercase, a number and a special character")
    .required(),
  role: Joi.string().valid('patient', 'doctor', 'counselor', 'ngo', 'donor', 'admin').default('patient'),

  // Patient fields
  gender: Joi.string().valid('male', 'female').when('role', { is: 'patient', then: Joi.required() }),
  date_of_birth: Joi.date().when('role', { is: 'patient', then: Joi.required() }),
  medical_history: Joi.string().allow('').optional(),

  // Doctor fields
  specialty: Joi.string().when('role', { is: 'doctor', then: Joi.required() }),
  license_number: Joi.string().when('role', { is: 'doctor', then: Joi.required() }),

  // Counselor fields
  counselor_specialty: Joi.string().valid('PTSD','grief','stress','general').optional(),
  description: Joi.string().allow('').optional(),
  available: Joi.boolean().optional(),

  // NGO fields
  organization_name: Joi.string().when('role', { is: 'ngo', then: Joi.required() }),
  ngo_description: Joi.string().allow('').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
