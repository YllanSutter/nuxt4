import { readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma;

  if (event.method === 'GET') {
    return await prisma.user.findMany({ 
      include: { 
        bundles: true,
        role: true,
        UserLabelVisibility:true,
        user_games: {
          include: {
            base_game: true,
            tag: true,
          }
        }
      } 
    });
  }

  if (event.method === 'POST') {
    const body = await readBody(event);
    
    // Hash le mot de passe avant de l'enregistrer
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(body.password, 10);


    return await prisma.user.create({
  data: {
    name: body.name,
    email: body.email,
    password: hashedPassword,
    budget: body.budget ?? 0,
    role_id: body.role_id,
    user_label_visibility: {
      create: body.user_label_visibility
    }
  }
});
  }
});