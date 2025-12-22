import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ModificationEntry {
  elemId: string;
  value: string;
  label: {
    table: string;
    field: string;
    type?: 'string' | 'number' | 'decimal' | 'boolean' | 'date';
  };
  cible: string;
  timestamp: number;
}

export default defineEventHandler(async (event) => {
  try {
    const { table, mods } = await readBody(event) as { 
      table: string; 
      mods: ModificationEntry[] 
    };

    console.log(`🔧 Mise à jour ${table}:`, {
      count: mods.length,
      elemCount: new Set(mods.map(m => m.elemId)).size,
      fields: Array.from(new Set(mods.map(m => m.label.field)))
    });

    if (!mods || mods.length === 0) {
      return { success: true, ok: true, message: 'Aucune modification à traiter', modificationsCount: 0, batchCount: 0, results: [] };
    }

    // Regrouper par element pour mettre à jour plusieurs champs d'un coup
    const modsByElem = new Map<string, ModificationEntry[]>();
    for (const m of mods) {
      if (!modsByElem.has(m.elemId)) modsByElem.set(m.elemId, []);
      modsByElem.get(m.elemId)!.push(m);
    }

    const results: any[] = [];
    let totalModifications = 0;

    for (const [elemId, elemMods] of modsByElem) {
      // Regrouper par table (en pratique homogène)
      const tables = Array.from(new Set(elemMods.map(m => m.label.table)));
      for (const tableName of tables) {
        const modsForTable = elemMods.filter(m => m.label.table === tableName);
        const data: Record<string, any> = {};

        for (const m of modsForTable) {
          const converted = convertValueForType(m.label.field, m.value, m.label.type);
          data[m.label.field] = converted;
        }

        const model = getModelForTable(tableName);
        if (!model) {
          console.warn(`⚠️  Table non supportée: ${tableName}`);
          continue;
        }

        if (Object.keys(data).length === 0) {
          console.warn(`⚠️  Aucun champ à mettre à jour pour ${tableName} id=${elemId}`);
          continue;
        }

        console.log(`🛠️ Update - Table: ${tableName}, id: ${elemId}, fields: ${Object.keys(data).join(', ')}`);
        try {
          const result = await model.update({
            where: { id: elemId },
            data
          });
          results.push({ 
            table: tableName, 
            id: elemId, 
            fields: Object.keys(data), 
            ok: true 
          });
          totalModifications += Object.keys(data).length;
        } catch (e: any) {
          console.error(`❌ Update failed (first attempt) ${tableName} id=${elemId}:`, e?.message || e);
          // Fallback: updateMany pour éviter l'exception P2025 si l'ID est introuvable
          try {
            const fallback = await model.updateMany({ 
              where: { id: elemId }, 
              data 
            });
            if (fallback.count > 0) {
              results.push({ 
                table: tableName, 
                id: elemId, 
                fields: Object.keys(data), 
                ok: true, 
                fallback: true 
              });
              totalModifications += Object.keys(data).length;
            } else {
              results.push({ 
                table: tableName, 
                id: elemId, 
                fields: Object.keys(data), 
                ok: false, 
                error: 'Element not found (updateMany returned 0)' 
              });
            }
          } catch (e2: any) {
            console.error(`💥 Update failed (fallback updateMany) ${tableName} id=${elemId}:`, e2?.message || e2);
            results.push({ 
              table: tableName, 
              id: elemId, 
              fields: Object.keys(data), 
              ok: false, 
              error: e2?.message || String(e2) 
            });
          }
        }
      }
    }

    const successCount = results.filter(r => r.ok).length;
    const failureCount = results.filter(r => !r.ok).length;

    console.log(`✅ Modifications terminées: ${successCount} succès, ${failureCount} échecs - Total champs: ${totalModifications}/${mods.length}`);
    
    return {
      success: failureCount === 0,
      ok: failureCount === 0,
      modificationsCount: totalModifications,
      batchCount: results.length,
      results,
      summary: {
        total: mods.length,
        successful: successCount,
        failed: failureCount
      }
    };

  } catch (error) {
    console.error('❌ Erreur updateElem:', error);
    return {
      success: false,
      ok: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
});

// Fonction universelle pour mettre à jour n'importe quelle table
function getModelForTable(tableName: string) {
  const tableModels: Record<string, any> = {
    'UserGame': prisma.userGame,
    'Bundle': prisma.bundle,
    'User': prisma.user,
    'BaseGame': prisma.baseGame,
    'Platform': prisma.platform,
    'Tag': prisma.tag,
    'Rating': prisma.rating,
    'Label': prisma.label,
    'State': prisma.state,
    'Month': prisma.month,
    'Year': prisma.year,
  };
  return tableModels[tableName];
}

function convertValueForType(fieldName: string, value: string, fieldType: string = 'string') {
  if (fieldName === 'rating_id') return value;
  switch (fieldType) {
    case 'number':
      return parseFloat(value) || 0;
    case 'decimal':
      return parseFloat(value) || 0;
    case 'boolean':
      return value === 'true' || value === '1';
    case 'date':
      return value ? new Date(value) : null;
    default:
      return value;
  }
}