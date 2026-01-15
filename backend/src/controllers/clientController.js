const prisma = require('../config/db');
const { z } = require('zod');

const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

// @desc    Get all clients for a user
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res, next) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!client) {
      res.status(404);
      throw new Error('Cliente no encontrado');
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res, next) => {
  try {
    const validatedData = clientSchema.parse(req.body);

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        userId: req.user.id,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      next(error);
    }
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res, next) => {
  try {
    const validatedData = clientSchema.parse(req.body);

    const clientExists = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!clientExists) {
      res.status(404);
      throw new Error('Cliente no encontrado');
    }

    const updatedClient = await prisma.client.update({
      where: { id: req.params.id },
      data: validatedData,
    });

    res.json(updatedClient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      next(error);
    }
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res, next) => {
  try {
    const clientExists = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!clientExists) {
      res.status(404);
      throw new Error('Cliente no encontrado');
    }

    await prisma.client.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
