import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const prisma = event.context.prisma;
  const body = await readBody(event);



  // body attendu : { id: string, key: string, value: any }
  let { id, key, value } = body;
  console.log('[API] updateBundleField reçu:', { id, key, value });
  if (!id || !key) {
    return { error: 'id et key sont requis' };
  }
  // Si le champ est optionnel et la valeur est une chaîne vide, on envoie null
  const nullableFields = ['link', 'image'];
  if (nullableFields.includes(key) && (value === '' || value === undefined)) {
    value = null;
  }

  try {
    // On ne met à jour que le champ demandé
    const updated = await prisma.Bundle.update({
      where: { id },
      data: { [key]: value },
    });
    console.log('[API] updateBundleField MAJ OK:', updated);
    return { success: true, bundle: updated };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: String(error) };
    }
  }
});
