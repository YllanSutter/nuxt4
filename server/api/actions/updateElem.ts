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

    console.log(`🔧 Mise à jour ${table}:`, mods);

    if (!mods || mods.length === 0) {
      return { success: true, message: 'Aucune modification à traiter' };
    }

    // Grouper par table.field.value pour optimiser
    const modsByFieldAndValue = new Map<string, string[]>();
    
    mods.forEach(mod => {
      const groupKey = `${mod.label.table}|${mod.label.field}|${mod.value}`;
      if (!modsByFieldAndValue.has(groupKey)) {
        modsByFieldAndValue.set(groupKey, []);
      }
      modsByFieldAndValue.get(groupKey)!.push(mod.elemId);
    });

    const results: any[] = [];
    
    // Exécuter updateMany pour chaque groupe
    for (const [groupKey, elemIds] of modsByFieldAndValue) {
      const [tableName, fieldName, value] = groupKey.split('|');
      const mod = mods.find(m => m.label.table === tableName && m.label.field === fieldName);
      
      if (!mod) continue;
      
      console.log(`🔍 Debug - Table: ${tableName}, Field: ${fieldName}, Value: "${value}", Type: "${mod.label.type}"`);
      
      const updateResult = await updateTable(tableName, fieldName, value, elemIds, mod.label.type);
      results.push(updateResult);
    }

    console.log(`✅ Modifications terminées:`, results);
    
    return {
      success: true,
      modificationsCount: mods.length,
      batchCount: results.length,
      results
    };

  } catch (error) {
    console.error('❌ Erreur updateElem:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
});

// Fonction universelle pour mettre à jour n'importe quelle table
async function updateTable(
  tableName: string, 
  fieldName: string, 
  value: string, 
  elemIds: string[], 
  fieldType: string = 'string'
) {
  // Conversion de valeur selon le type
  let convertedValue: any = value;
  // Pour rating_id, toujours stocker l'id (string), pas la valeur numérique
  if (fieldName === 'rating_id') {
    convertedValue = value;
  } else {
    switch (fieldType) {
      case 'number':
        convertedValue = parseFloat(value) || 0;
        break;
      case 'decimal':
        convertedValue = parseFloat(value) || 0;
        break;
      case 'boolean':
        convertedValue = value === 'true' || value === '1';
        break;
      case 'date':
        convertedValue = value ? new Date(value) : null;
        break;
      default:
        convertedValue = value;
    }
  }
  console.log(`🔧 Conversion - Output: "${convertedValue}" (${typeof convertedValue})`);

  const updateData = { [fieldName]: convertedValue };
  
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

  const model = tableModels[tableName];
  if (!model) {
    throw new Error(`Table non supportée: ${tableName}`);
  }

  const result = await model.updateMany({
    where: { id: { in: elemIds } },
    data: updateData
  });

  console.log(`📝 ${tableName}.${fieldName} = "${convertedValue}" | ${result.count} enregistrements`);
  
  return { 
    table: tableName,
    field: fieldName, 
    value: convertedValue,
    count: result.count 
  };
}