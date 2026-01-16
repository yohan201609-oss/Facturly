const prisma = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      res.status(400);
      throw new Error('El usuario ya existe');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400);
      throw new Error('Datos de usuario inválidos');
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      next(error);
    }
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await comparePassword(password, user.password))) {
      res.json({
        id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401);
      throw new Error('Email o contraseña incorrectos');
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      next(error);
    }
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        companyName: true,
        taxId: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phone: true,
        website: true,
        logoUrl: true,
        isPremium: true,
        invoicePrefix: true,
        invoiceCounter: true,
        defaultCurrency: true,
        brandColor: true,
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
