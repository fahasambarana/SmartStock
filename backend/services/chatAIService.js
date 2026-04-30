// services/chatAIService.js - Version sans API (100% locale)
const { Product, Zone, Movement, User } = require("../models/associations");
const { Sequelize } = require("sequelize");

class ChatAIService {
  constructor() {
    console.log("🤖 Chat IA démarré en mode local (sans API Gemini)");
  }

  /**
   * Récupère les données contextuelles pour l'IA
   */
  async getContextData() {
    try {
      const [
        totalProducts,
        lowStockProducts,
        totalZones,
        recentMovements,
        topProducts,
        expiringProducts,
        zones
      ] = await Promise.all([
        Product.count(),
        Product.count({ where: { quantity: { [Sequelize.Op.lte]: 10 } } }),
        Zone.count(),
        Movement.findAll({
          limit: 10,
          order: [['movementDate', 'DESC']],
          attributes: ['productName', 'type', 'quantity', 'movementDate', 'id']
        }),
        Product.findAll({
          order: [['quantity', 'DESC']],
          limit: 5,
          attributes: ['name', 'quantity']
        }),
        Product.count({
          where: {
            category: 'Food',
            expirationDate: {
              [Sequelize.Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              [Sequelize.Op.not]: null
            }
          }
        }),
        Zone.findAll({ attributes: ['name', 'capacite_actuelle', 'capacite_max'] })
      ]);

      return {
        totalProducts,
        lowStockProducts,
        totalZones,
        expiringProducts,
        zones,
        recentMovements: recentMovements.map(m => ({
          product: m.productName,
          type: m.type === 'in' ? 'entrée' : m.type === 'out' ? 'sortie' : 'transfert',
          quantity: m.quantity,
          date: m.movementDate
        })),
        topProducts: topProducts.map(p => ({ name: p.name, stock: p.quantity }))
      };
    } catch (error) {
      console.error("Erreur getContextData:", error);
      return {
        totalProducts: 0,
        lowStockProducts: 0,
        totalZones: 0,
        expiringProducts: 0,
        zones: [],
        recentMovements: [],
        topProducts: []
      };
    }
  }

  /**
   * Analyse la question et retourne une réponse
   */
  async askQuestion(userMessage, userId = null, userName = null) {
    try {
      const context = await this.getContextData();
      const msg = userMessage.toLowerCase().trim();
      
      // Analyser la question et retourner la réponse appropriée
      let response = await this.getIntentResponse(msg, context);
      
      // Journaliser la conversation
      if (userId) {
        await this.logConversation(userId, userMessage, response);
      }
      
      return { success: true, response: response, source: 'local' };

    } catch (error) {
      console.error("Erreur Chat IA:", error);
      return { 
        success: false, 
        response: "❌ Désolé, je rencontre une difficulté technique. Veuillez réessayer dans un instant.",
        source: 'error'
      };
    }
  }

  /**
   * Détecte l'intention et retourne la réponse appropriée
   */
  async getIntentResponse(msg, context) {
    // 1. SALUTATIONS
    if (msg.match(/^(bonjour|salut|coucou|hello|hi|hey)/i)) {
      return `👋 Bonjour ! Je suis votre assistant IA de gestion de stock. 

💡 Voici ce que je peux faire pour vous :
• 📦 Voir les produits en stock bas
• 📊 Statistiques générales
• 🏭 Occupation des zones
• 🔄 Derniers mouvements
• ⚠️ Alertes importantes
• 🍎 Produits qui expirent

Posez-moi une question ou dites "aide" pour plus d'options !`;
    }

    // 2. AIDE
    if (msg.match(/^(aide|help|commandes|que faire|tutoriel)/i)) {
      return `🤖 **Commandes disponibles :**

📊 **INFORMATIONS GÉNÉRALES**
• "stock bas" ou "rupture" - Produits en stock faible
• "total produits" - Nombre de produits
• "statistiques" ou "résumé" - Vue d'ensemble

🏭 **ZONES**
• "zones" ou "occupation" - État des zones
• "zone [nom]" - Détail d'une zone spécifique

🔄 **MOUVEMENTS**
• "derniers mouvements" - Activité récente
• "mouvements entrées" / "mouvements sorties"

⚠️ **ALERTES**
• "alertes" ou "urgences" - Problèmes critiques
• "expiration" ou "périmé" - Produits périssables

📦 **PRODUITS**
• "top produits" - Produits avec le plus de stock
• "produit [nom]" - Rechercher un produit spécifique

💡 **Exemples :** "Quels sont les produits en stock bas ?", "Occupation des zones", "Statistiques"`;
    }

    // 3. STOCK BAS / RUPTURE
    if (msg.match(/stock bas|rupture|produit manquant|produits manquants|faible stock|alerte stock/i)) {
      if (context.lowStockProducts > 0) {
        const lowStockProducts = await Product.findAll({
          where: { quantity: { [Sequelize.Op.lte]: 10 } },
          attributes: ['name', 'quantity', 'category'],
          order: [['quantity', 'ASC']],
          limit: 10
        });
        
        let response = `⚠️ **${context.lowStockProducts} produit(s) en stock faible :**\n\n`;
        lowStockProducts.forEach(p => {
          const emoji = p.quantity <= 3 ? '🔴' : p.quantity <= 5 ? '🟠' : '🟡';
          response += `${emoji} **${p.name}** : ${p.quantity} unités (${p.category})\n`;
        });
        response += `\n💡 **Actions recommandées :**\n`;
        response += `• Réapprovisionner les produits 🔴 en priorité\n`;
        response += `• Consulter l'historique des ventes pour ajuster les quantités\n`;
        response += `• Vérifier la page "Mouvements" pour les entrées récentes`;
        return response;
      }
      return "✅ **Bonne nouvelle !** Aucun produit n'est en rupture ou en stock faible. Tous les niveaux sont satisfaisants.";
    }

    // 4. TOTAL PRODUITS
    if (msg.match(/combien de produit|total produit|nombre de produit|nb produits|combien de références/i)) {
      return `📊 **Inventaire** : ${context.totalProducts} produit(s) référencé(s) dans votre stock.`;
    }

    // 5. ZONES
    if (msg.match(/zone|occupation|capacité|emplacement|stockage/i)) {
      if (context.zones.length === 0) {
        return "🏭 Aucune zone de stockage n'a été configurée pour le moment. Créez des zones dans l'onglet dédié.";
      }
      
      let response = `🏭 **État des zones de stockage :**\n\n`;
      let warningZones = [];
      
      for (const zone of context.zones) {
        const percent = zone.capacite_max > 0 ? ((zone.capacite_actuelle / zone.capacite_max) * 100).toFixed(0) : 0;
        const emoji = percent >= 90 ? '🔴' : percent >= 75 ? '🟠' : percent >= 50 ? '🟡' : '🟢';
        response += `${emoji} **${zone.name}** : ${percent}% d'occupation (${zone.capacite_actuelle}/${zone.capacite_max})\n`;
        
        if (percent >= 85) {
          warningZones.push(`• ${zone.name} (${percent}%)`);
        }
      }
      
      if (warningZones.length > 0) {
        response += `\n⚠️ **Zones saturées :**\n${warningZones.join('\n')}\n`;
        response += `💡 Pensez à optimiser l'espace ou à créer de nouvelles zones.`;
      }
      
      return response;
    }

    // 6. STATISTIQUES / RÉSUMÉ
    if (msg.match(/statistique|résumé|vue d'ensemble|dashboard|synthèse|bilan/i)) {
      // Calculer l'occupation moyenne
      let totalPercent = 0;
      context.zones.forEach(z => {
        if (z.capacite_max > 0) {
          totalPercent += (z.capacite_actuelle / z.capacite_max) * 100;
        }
      });
      const avgOccupation = context.zones.length > 0 ? totalPercent / context.zones.length : 0;
      
      // Valeur totale du stock (estimation)
      const products = await Product.findAll({ attributes: ['price', 'quantity'] });
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      
      return `📈 **RÉSUMÉ DE VOTRE STOCK** 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 **Produits** : ${context.totalProducts}
⚠️ **Stock faible** : ${context.lowStockProducts}
🍎 **À expirer (7j)** : ${context.expiringProducts}

🏭 **Zones** : ${context.totalZones}
📊 **Occupation moyenne** : ${avgOccupation.toFixed(0)}%

💰 **Valeur estimée** : ${totalValue.toLocaleString('fr-FR')} €

🔄 **Derniers mouvements** : ${context.recentMovements.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Que souhaitez-vous approfondir ? (zones, alertes, détails produit...)`;
    }

    // 7. PRODUITS EXPIRANTS
    if (msg.match(/expire|périmé|périssable|date limite|dlc|expiration/i)) {
      const expiringProducts = await Product.findAll({
        where: {
          category: 'Food',
          expirationDate: {
            [Sequelize.Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            [Sequelize.Op.not]: null
          }
        },
        attributes: ['name', 'expirationDate', 'quantity'],
        order: [['expirationDate', 'ASC']]
      });
      
      if (expiringProducts.length > 0) {
        let response = `⚠️ **PRODUITS PÉRISSABLES**\n\n`;
        for (const p of expiringProducts) {
          const daysLeft = Math.ceil((new Date(p.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
          const emoji = daysLeft <= 3 ? '🔴' : daysLeft <= 7 ? '🟠' : '🟡';
          response += `${emoji} **${p.name}** : ${daysLeft} jours (${p.quantity} unités)\n`;
        }
        response += `\n💡 **Actions recommandées :**\n`;
        response += `• Placer ces produits en avant-première\n`;
        response += `• Organiser une promotion pour écouler les stocks\n`;
        response += `• Vérifier la chaîne du froid si nécessaire`;
        return response;
      }
      return "✅ **Aucun produit périssable n'expire dans les 7 prochains jours.** Le stock est frais !";
    }

    // 8. ALERTES / URGENCES
    if (msg.match(/alerte|urgence|problème|attention incident|critique/i)) {
      let alerts = [];
      
      // Stock critique
      const criticalStock = await Product.findAll({
        where: { quantity: { [Sequelize.Op.lte]: 3 } },
        attributes: ['name', 'quantity']
      });
      if (criticalStock.length > 0) {
        alerts.push(`🔴 **Stock critique** : ${criticalStock.map(p => p.name).join(', ')}`);
      }
      
      // Zones saturées
      for (const zone of context.zones) {
        if (zone.capacite_max > 0 && (zone.capacite_actuelle / zone.capacite_max) > 0.85) {
          const percent = ((zone.capacite_actuelle / zone.capacite_max) * 100).toFixed(0);
          alerts.push(`🟠 **Zone saturée** : ${zone.name} (${percent}%)`);
        }
      }
      
      // Produits expirés
      const expiredProducts = await Product.count({
        where: {
          category: 'Food',
          expirationDate: { [Sequelize.Op.lt]: new Date() }
        }
      });
      if (expiredProducts > 0) {
        alerts.push(`🔴 **Produits EXPIRÉS** : ${expiredProducts} produit(s) à retirer immédiatement`);
      }
      
      if (alerts.length > 0) {
        return `🔔 **ALERTES ACTIVES**\n\n${alerts.join('\n')}\n\n💡 Je vous recommande de traiter ces alertes en priorité.`;
      }
      return "✅ **Aucune alerte active** - Votre gestion de stock est optimale ! 🎉";
    }

    // 9. MOUVEMENTS RÉCENTS
    if (msg.match(/dernier mouvement|mouvement récent|activité récente|historique récent|mouvements/i)) {
      if (context.recentMovements.length === 0) {
        return "🔄 Aucun mouvement de stock n'a été enregistré récemment.";
      }
      
      let response = `🔄 **${context.recentMovements.length} DERNIERS MOUVEMENTS**\n\n`;
      context.recentMovements.slice(0, 5).forEach((m, i) => {
        const emoji = m.type === 'entrée' ? '📥' : m.type === 'sortie' ? '📤' : '🔄';
        const date = new Date(m.date).toLocaleString('fr-FR');
        response += `${i+1}. ${emoji} **${m.type}** : ${m.quantity} x "${m.product}" (${date})\n`;
      });
      response += `\n💡 Consultez l'onglet "Mouvements" pour voir l'historique complet.`;
      return response;
    }

    // 10. TOP PRODUITS
    if (msg.match(/top produit|meilleur produit|plus de stock|stock élevé|produit phare/i)) {
      if (context.topProducts.length === 0) {
        return "Aucun produit trouvé dans l'inventaire.";
      }
      
      let response = `🏆 **TOP PRODUITS (par quantité en stock)**\n\n`;
      context.topProducts.forEach((p, i) => {
        response += `${i+1}. **${p.name}** : ${p.stock} unités\n`;
      });
      response += `\n💡 Ces produits représentent votre stock le plus important.`;
      return response;
    }

    // 11. RECHERCHE DE PRODUIT SPÉCIFIQUE
    const productMatch = msg.match(/produit (\w+)|recherche (\w+)|trouver (\w+)|info (\w+)/i);
    if (productMatch) {
      const searchTerm = (productMatch[1] || productMatch[2] || productMatch[3] || productMatch[4]).toLowerCase();
      const product = await Product.findOne({
        where: { name: { [Sequelize.Op.like]: `%${searchTerm}%` } },
        include: [{ model: Zone, attributes: ['name'] }]
      });
      
      if (product) {
        const daysUntilExpiry = product.expirationDate ? 
          Math.ceil((new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        
        let response = `📦 **${product.name}**\n`;
        response += `• Stock : ${product.quantity} unités\n`;
        response += `• Catégorie : ${product.category}\n`;
        response += `• Prix : ${product.price} €\n`;
        response += `• Zone : ${product.Zone?.name || 'Non assigné'}\n`;
        if (daysUntilExpiry) {
          response += `• Expiration : dans ${daysUntilExpiry} jours\n`;
        }
        return response;
      }
      return `❌ Aucun produit trouvé avec le nom "${searchTerm}". Vérifiez l'orthographe ou consultez la liste complète des produits.`;
    }

    // 12. RECHERCHE DE ZONE SPÉCIFIQUE
    const zoneMatch = msg.match(/zone (\w+)/i);
    if (zoneMatch) {
      const zoneName = zoneMatch[1].toLowerCase();
      const zone = await Zone.findOne({
        where: { name: { [Sequelize.Op.like]: `%${zoneName}%` } }
      });
      
      if (zone) {
        const percent = zone.capacite_max > 0 ? ((zone.capacite_actuelle / zone.capacite_max) * 100).toFixed(0) : 0;
        const productsInZone = await Product.count({ where: { ZoneId: zone.id } });
        
        return `🏭 **${zone.name}**\n
• Occupation : ${percent}% (${zone.capacite_actuelle}/${zone.capacite_max})
• Type : ${zone.type || 'Standard'}
• Produits stockés : ${productsInZone}
• Emplacement : ${zone.location || 'Non spécifié'}

💡 Capacité ${percent >= 85 ? 'CRITIQUE - Nécessite une attention immédiate' : percent >= 70 ? 'ÉLEVÉE - Surveiller' : 'SUFFISANTE'}`;
      }
      return `❌ Zone "${zoneName}" non trouvée. Voici les zones disponibles : ${context.zones.map(z => z.name).join(', ')}`;
    }

    // 13. REMERCIEMENTS
    if (msg.match(/merci|thanks|thank you|grazie/i)) {
      return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions sur votre gestion de stock. Je suis là pour vous aider !";
    }

    // 14. RÉPONSE PAR DÉFAUT
    return `🤔 Je n'ai pas bien compris votre question : "${userMessage.substring(0, 50)}..."

💡 **Essayez plutôt :**
• "Quels sont les produits en stock bas ?"
• "Occupation des zones"
• "Statistiques du stock"
• "Alertes importantes"
• "Derniers mouvements"
• "Aide" pour voir toutes les commandes

Ou reformulez votre question plus précisément.`;
  }

  /**
   * Journalisation des conversations
   */
  async logConversation(userId, question, answer) {
    try {
      console.log(`[CHAT] User ${userId}: "${question.substring(0, 100)}" -> Réponse envoyée (${answer.length} caractères)`);
    } catch (error) {
      // Ignorer les erreurs de logging
    }
  }
}

module.exports = new ChatAIService();