import { readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma;

  if (event.method === 'GET') {
    return await prisma.User.findMany({ 
      include: { 
        bundles: true,
        role: true,
        user_games: {
          include: {
            base_game: true,
            tag: true
          }
        }
      } 
    });
  }

  if (event.method === 'POST') {
    const body = await readBody(event);
    return await prisma.User.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        budget: body.budget ?? 0,
        role_id: body.role_id
      }
    });
  }
});