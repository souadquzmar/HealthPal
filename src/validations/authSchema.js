import Joi from 'joi'

export const registerSchema = Joi.object({
    fullName: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).message("Password must contain uppercase, lowercase, a number and a special character").required(),
    role: Joi.string().valid('patient','doctor','donor','ngo','admin').default('patient')
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})