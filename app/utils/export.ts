  // Fonction pour exporter la base de données
  export const exportDatabase = async () => {
    try {
      const response = await $fetch('/api/export/database', {
        method: 'GET'
      })
      
      // Créer le fichier de téléchargement
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('Export réussi!')
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
    }
  }

  // Fonction pour exporter les jeux en CSV
  export const exportGamesCSV = async () => {
    try {
      const response = await $fetch('/api/export/games-csv', {
        method: 'GET'
      })
      
      // Créer le fichier de téléchargement CSV
      const blob = new Blob([response], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mes_jeux_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('Export CSV réussi!')
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error)
    }
  }