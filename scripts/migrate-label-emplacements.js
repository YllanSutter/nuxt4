// Script pour migrer les données vers la relation many-to-many Label <-> Emplacement
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateData() {
  try {
    console.log('🚀 Début de la migration des données...')

    // 1. Récupérer tous les emplacements
    const emplacements = await prisma.emplacement.findMany()
    console.log(`📍 Trouvé ${emplacements.length} emplacements`)

    // 2. Créer les emplacements de base s'ils n'existent pas
    const requiredEmplacements = ['main', 'filtres']
    
    for (const empName of requiredEmplacements) {
      const existing = await prisma.emplacement.findFirst({
        where: { name: empName }
      })
      
      if (!existing) {
        await prisma.emplacement.create({
          data: { name: empName }
        })
        console.log(`✅ Emplacement '${empName}' créé`)
      }
    }

    // 3. Récupérer les emplacements mis à jour
    const mainEmplacement = await prisma.emplacement.findFirst({
      where: { name: 'main' }
    })
    
    const filtresEmplacement = await prisma.emplacement.findFirst({
      where: { name: 'filtres' }
    })

    if (!mainEmplacement || !filtresEmplacement) {
      throw new Error('Impossible de trouver les emplacements requis')
    }

    // 4. Récupérer tous les labels
    const labels = await prisma.label.findMany()
    console.log(`📝 Trouvé ${labels.length} labels`)

    // 5. Créer les relations par défaut
    const defaultMappings = [
      // Tags dans main et filtres
      { key: 'tag_id', emplacements: ['main', 'filtres'] },
      { key: 'tagId', emplacements: ['main', 'filtres'] },
      
      // Autres dans main seulement pour commencer
      { key: 'month_id', emplacements: ['filtres'] },
      { key: 'monthId', emplacements: ['filtres'] },
      { key: 'year_id', emplacements: ['filtres'] },
      { key: 'yearId', emplacements: ['filtres'] },
      { key: 'platform_id', emplacements: ['filtres'] },
      { key: 'plateformeId', emplacements: ['filtres'] },
      { key: 'bundle_id', emplacements: ['filtres'] },
      { key: 'bundleId', emplacements: ['filtres'] },
      
      // Champs d'affichage dans main
      { key: 'name', emplacements: ['main'] },
      { key: 'price', emplacements: ['main'] },
      { key: 'rating', emplacements: ['main'] },
      { key: 'playtime_hours', emplacements: ['main'] },
    ]

    for (const mapping of defaultMappings) {
      const label = labels.find(l => l.key === mapping.key)
      if (!label) continue

      for (const empName of mapping.emplacements) {
        const emplacement = empName === 'main' ? mainEmplacement : filtresEmplacement
        
        // Vérifier si la relation existe déjà
        const existing = await prisma.labelEmplacement.findFirst({
          where: {
            label_id: label.id,
            emplacement_id: emplacement.id
          }
        })

        if (!existing) {
          await prisma.labelEmplacement.create({
            data: {
              label_id: label.id,
              emplacement_id: emplacement.id,
              position: label.position || 0
            }
          })
          console.log(`🔗 Relation créée: ${label.key} -> ${empName}`)
        }
      }
    }

    console.log('✅ Migration terminée avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
migrateData()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
