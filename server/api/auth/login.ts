import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email et mot de passe requis.',
    });
  }

  // Create a fresh Prisma client instance to avoid cached plan issues
  const prisma = new PrismaClient();

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
  } catch (error:any) {
    console.error('Erreur de connexion:', error);
    
    // Handle specific PostgreSQL cached plan error
    if (error.message && error.message.includes('cached plan must not change result type')) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur de cache de base de données. Veuillez réessayer.',
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la connexion.',
    });
  } finally {
    // Always disconnect the Prisma client to avoid connection leaks
    await prisma.$disconnect();
  }
});