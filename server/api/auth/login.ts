import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email et mot de passe requis.',
    });
  }

  try {
    // Chercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email ou mot de passe incorrect.',
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email ou mot de passe incorrect.',
      });
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la connexion.',
    });
  }
});