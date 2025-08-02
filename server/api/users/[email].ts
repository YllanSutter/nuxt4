export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma;
  const query = getQuery(event);

  if (event.method === 'GET') {
    if (!query.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email requis'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: query.email as string },
      include: {
        role: true,
        bundles: true,
        user_games: {
          include: {
            base_game: true,
            tag: true
          }
        }
      }
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur non trouvé'
      });
    }

    // Retourner sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  if (event.method === 'PUT') {
    const body = await readBody(event);
    
    if (!body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email requis'
      });
    }

    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.budget !== undefined) updateData.budget = body.budget;
    
    // Si un nouveau mot de passe est fourni, le hasher
    if (body.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { email: body.email },
      data: updateData,
      include: {
        role: true
      }
    });

    // Retourner sans le mot de passe
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
});
