const prisma = require('../config/db');
const { z } = require('zod');

const profileSchema = z.object({
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  invoicePrefix: z.string().max(10).optional(),
  defaultCurrency: z.string().optional(),
  brandColor: z.string().optional(),
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    console.log('--- ACTUALIZANDO PERFIL ---');
    console.log('ID Usuario:', req.user.id);
    console.log('Datos recibidos:', req.body);
    
    const validatedData = profileSchema.parse(req.body);
    console.log('Datos validados:', validatedData);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: validatedData,
    });

    console.log('Usuario actualizado correctamente');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error en updateProfile:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      next(error);
    }
  }
};

// @desc    Simulate upgrade to premium
// @route   POST /api/users/upgrade
// @access  Private
const upgradeToPremium = async (req, res, next) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
    });

    res.json({ message: '¡Gracias por elegir Premium!', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload user logo
// @route   POST /api/users/upload-logo
// @access  Private
const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Por favor sube una imagen');
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { logoUrl },
    });

    res.json({ message: 'Logo actualizado correctamente', logoUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, upgradeToPremium, uploadLogo };
