// Script de récupération rapide - créer des données de base
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createBasicData() {
  try {
    console.log('🔧 Création des données de base...')

    // 1. Créer un rôle admin
    const adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        description: 'Administrateur'
      }
    })

    // 2. Créer les emplacements
    const mainEmplacement = await prisma.emplacement.findFirst({
      where: { name: 'main' }
    }) || await prisma.emplacement.create({
      data: { name: 'main' }
    })

    const filtresEmplacement = await prisma.emplacement.findFirst({
      where: { name: 'filtres' }
    }) || await prisma.emplacement.create({
      data: { name: 'filtres' }
    })

    // 3. Créer des labels de base
    const labelsToCreate = [
      { key: 'name', name: 'Nom', type: 'input', image: 'mingcute:game-2-line', position: 1 },
      { key: 'tag_id', name: 'Tag', type: 'select', image: 'mingcute:tag-line', position: 2 },
      { key: 'price', name: 'Prix', type: 'input', image: 'mingcute:coin-line', position: 3 },
      { key: 'rating', name: 'Note', type: 'input', image: 'mingcute:star-line', position: 4 },
    ]

    for (const labelData of labelsToCreate) {
      const label = await prisma.label.create({
        data: {
          ...labelData,
          default_visible: true,
          color: 'blue'
        }
      })

      // Créer les relations avec les emplacements
      await prisma.labelEmplacement.create({
        data: {
          label_id: label.id,
          emplacement_id: mainEmplacement.id,
          position: labelData.position
        }
      })

      if (labelData.key === 'tag_id') {
        await prisma.labelEmplacement.create({
          data: {
            label_id: label.id,
            emplacement_id: filtresEmplacement.id,
            position: 1
          }
        })
      }
    }

    // 4. Créer quelques tags
    const tags = ['Action', 'RPG', 'Strategy', 'Puzzle']
    for (const tagName of tags) {
      await prisma.tag.create({
        data: {
          name: tagName,
          color: 'green'
        }
      })
    }

    // 5. Créer quelques platforms
    const platforms = ['Steam', 'Epic Games', 'GOG']
    for (const platformName of platforms) {
      await prisma.platform.create({
        data: {
          name: platformName,
          color: 'blue'
        }
      })
    }

    // 6. Créer des mois et années
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin']
    for (const monthName of months) {
      await prisma.month.create({
        data: { name: monthName }
      })
    }

    const years = ['2023', '2024', '2025']
    for (const yearName of years) {
      await prisma.year.create({
        data: { name: yearName }
      })
    }

    // 7. Créer un état
    await prisma.state.create({
      data: {
        name: 'Actif',
        description: 'Bundle actif'
      }
    })

    console.log('✅ Données de base créées!')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createBasicData()
