// services/inventoryAIService.js
const { Product, Zone, Movement } = require("../models/associations");
const { Sequelize } = require("sequelize");
const PDFDocument = require('pdfkit');

class InventoryAIService {
  
  /**
   * Nettoie le texte pour le PDF (supprime les caractères problématiques)
   */
  cleanText(text) {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ç]/g, 'c')
      .replace(/[œ]/g, 'oe');
  }

  /**
   * Génère un inventaire automatique (sans comptage manuel)
   */
  async generateAutoInventory(period = 'month') {
    const startDate = this.getPeriodStartDate(period);
    
    // Récupérer tous les produits
    const products = await Product.findAll({
      include: [{ model: Zone }]
    });
    
    const inventory = [];
    let totalValue = 0;
    let anomalies = [];
    
    for (const product of products) {
      // Calculer le stock théorique basé sur TOUS les mouvements (pas seulement depuis startDate)
      const calculatedStock = await this.calculateTheoreticalStock(product.id);
      
      // Différence entre stock actuel et stock calculé
      const difference = product.quantity - calculatedStock;
      const isAnomaly = Math.abs(difference) > 0;
      
      const productValue = product.price * product.quantity;
      totalValue += productValue;
      
      const inventoryItem = {
        productId: product.id,
        productName: product.name,
        category: product.category,
        zone: product.Zone?.name || 'Non assigne',
        currentStock: product.quantity,
        calculatedStock: calculatedStock,
        difference: difference,
        differencePercent: calculatedStock > 0 ? ((difference / calculatedStock) * 100).toFixed(1) : 0,
        isAnomaly: isAnomaly,
        value: productValue,
        lastMovement: await this.getLastMovementDate(product.id)
      };
      
      inventory.push(inventoryItem);
      
      if (isAnomaly) {
        anomalies.push({
          ...inventoryItem,
          severity: this.getAnomalySeverity(Math.abs(difference), product.quantity),
          recommendation: this.getAnomalyRecommendation(product, difference)
        });
      }
    }
    
    // Trier les anomalies par sévérité
    anomalies.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    const accuracyRate = inventory.length > 0 
      ? ((inventory.length - anomalies.length) / inventory.length * 100).toFixed(1)
      : 100;
    
    return {
      generatedAt: new Date(),
      period: period,
      periodStart: startDate,
      periodEnd: new Date(),
      summary: {
        totalProducts: inventory.length,
        totalValue: totalValue,
        anomaliesCount: anomalies.length,
        criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
        accuracyRate: accuracyRate
      },
      inventory: inventory,
      anomalies: anomalies,
      recommendations: this.generateRecommendations(anomalies, inventory)
    };
  }
  
  /**
   * Calcule le stock théorique basé sur l'historique COMPLET des mouvements
   */
  async calculateTheoreticalStock(productId) {
    // Récupérer TOUS les mouvements du produit
    const movements = await Movement.findAll({
      where: { productId: productId },
      order: [['movementDate', 'ASC']]
    });
    
    let calculatedStock = 0;
    
    for (const movement of movements) {
      if (movement.type === 'in') {
        calculatedStock += movement.quantity;
      } else if (movement.type === 'out') {
        calculatedStock -= movement.quantity;
      }
      // Les transferts ne changent pas le stock total
    }
    
    return Math.max(0, calculatedStock);
  }
  
  /**
   * Détermine la sévérité d'une anomalie
   */
  getAnomalySeverity(difference, currentStock) {
    if (difference > 10 || (currentStock > 0 && Math.abs(difference) > currentStock * 0.2)) {
      return 'critical';
    }
    if (difference > 5 || (currentStock > 0 && Math.abs(difference) > currentStock * 0.1)) {
      return 'high';
    }
    if (difference > 2) {
      return 'medium';
    }
    return 'low';
  }
  
  /**
   * Génère une recommandation pour une anomalie
   */
  getAnomalyRecommendation(product, difference) {
    if (difference > 0) {
      return `Stock excedentaire de ${difference} unite(s). Verifier les entrees en doublon.`;
    } else if (difference < 0) {
      return `Manque ${Math.abs(difference)} unite(s). Verifier les sorties non enregistrees.`;
    }
    return "Stock conforme";
  }
  
  /**
   * Génère des recommandations globales IA
   */
  generateRecommendations(anomalies, inventory) {
    const recommendations = [];
    
    if (anomalies.length > 0) {
      recommendations.push({
        type: "inventory_accuracy",
        message: `${anomalies.length} anomalie(s) detectee(s). Verifier les mouvements recents.`,
        priority: "high"
      });
    }
    
    const lowStockProducts = inventory.filter(p => p.currentStock < 10 && p.currentStock > 0);
    if (lowStockProducts.length > 0) {
      recommendations.push({
        type: "low_stock",
        message: `${lowStockProducts.length} produit(s) en stock bas. Planifier reaprovisionnement.`,
        priority: "high"
      });
    }
    
    const highValueProducts = inventory.filter(p => p.value > 10000);
    if (highValueProducts.length > 0) {
      recommendations.push({
        type: "high_value",
        message: `${highValueProducts.length} produit(s) de grande valeur. Surveillance renforcee recommandee.`,
        priority: "medium"
      });
    }
    
    const zeroStockProducts = inventory.filter(p => p.currentStock === 0 && p.calculatedStock > 0);
    if (zeroStockProducts.length > 0) {
      recommendations.push({
        type: "zero_stock",
        message: `${zeroStockProducts.length} produit(s) ont un stock a zero mais devraient avoir du stock. Verifier les sorties.`,
        priority: "high"
      });
    }
    
    return recommendations;
  }
  
  getPeriodStartDate(period) {
    const now = new Date();
    switch(period) {
      case 'week': return new Date(now.setDate(now.getDate() - 7));
      case 'month': return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarter': return new Date(now.setMonth(now.getMonth() - 3));
      case 'year': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(now.setMonth(now.getMonth() - 1));
    }
  }
  
  async getLastMovementDate(productId) {
    const lastMovement = await Movement.findOne({
      where: { productId: productId },
      order: [['movementDate', 'DESC']]
    });
    return lastMovement ? lastMovement.movementDate : null;
  }
  
  // ==================== METHODES POUR LE CONTROLLER ====================
  
  /**
   * Aperçu de l'inventaire (sans PDF)
   */
  async getInventoryPreview(period) {
    return await this.generateAutoInventory(period);
  }
  
  /**
   * Aperçu des mouvements (sans PDF)
   */
  async getMovementsPreview(startDate, endDate) {
    const movements = await Movement.findAll({
      where: {
        movementDate: {
          [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      order: [['movementDate', 'DESC']]
    });
    
    const stats = {
      totalIn: movements.filter(m => m.type === 'in').reduce((s, m) => s + m.quantity, 0),
      totalOut: movements.filter(m => m.type === 'out').reduce((s, m) => s + m.quantity, 0),
      totalTransfer: movements.filter(m => m.type === 'transfer').length,
      byProduct: this.groupByProduct(movements)
    };
    
    return {
      generatedAt: new Date(),
      startDate: startDate,
      endDate: endDate,
      totalMovements: movements.length,
      stats: stats,
      movements: movements.slice(0, 50)
    };
  }
  
  /**
   * Aperçu des alertes
   */
  async getAlertsPreview() {
    const products = await Product.findAll({
      where: {
        quantity: { [Sequelize.Op.lte]: 10 }
      }
    });
    
    const alerts = products.map(p => ({
      productId: p.id,
      productName: p.name,
      currentStock: p.quantity,
      alertLevel: p.quantity <= 3 ? 'critical' : 'high',
      recommendation: p.quantity <= 3 
        ? 'Reapprovisionnement IMMEDIAT necessaire'
        : 'Planifier reaprovisionnement sous 3 jours'
    }));
    
    return {
      generatedAt: new Date(),
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.alertLevel === 'critical').length,
      alerts: alerts
    };
  }
  
  // ==================== METHODES D'EXPORT PDF ====================
  
  /**
   * Génère un rapport d'inventaire
   */
  async generateInventoryReport(period = 'month', format = 'pdf') {
    const inventory = await this.generateAutoInventory(period);
    
    if (format === 'pdf') {
      return await this.exportToPDF(inventory);
    }
    
    return inventory;
  }
  
  /**
   * Génère un rapport des mouvements
   */
  async generateMovementsReport(startDate, endDate, format = 'pdf') {
    const report = await this.getMovementsPreview(startDate, endDate);
    
    if (format === 'pdf') {
      return await this.exportMovementsToPDF(report);
    }
    
    return report;
  }
  
  /**
   * Génère un rapport des alertes
   */
  async generateAlertsReport(format = 'pdf') {
    const alerts = await this.getAlertsPreview();
    
    if (format === 'pdf') {
      return await this.exportAlertsToPDF(alerts);
    }
    
    return alerts;
  }
  
  groupByUser(movements) {
    const grouped = {};
    movements.forEach(m => {
      if (!grouped[m.userName]) grouped[m.userName] = 0;
      grouped[m.userName]++;
    });
    return grouped;
  }
  
  groupByProduct(movements) {
    const grouped = {};
    movements.forEach(m => {
      if (!grouped[m.productName]) grouped[m.productName] = 0;
      grouped[m.productName] += m.quantity;
    });
    return Object.entries(grouped)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }
  
  // ==================== EXPORT PDF ====================
  
  /**
   * Exporte l'inventaire en PDF
   */
  async exportToPDF(inventory) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // En-tête
      doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT D\'INVENTAIRE AUTOMATISE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica');
      doc.text(`Genere le: ${new Date(inventory.generatedAt).toLocaleString('fr-FR')}`, { align: 'center' });
      doc.text(`Periode: ${inventory.period} (depuis le ${new Date(inventory.periodStart).toLocaleDateString('fr-FR')})`, { align: 'center' });
      doc.moveDown();
      
      this.drawLine(doc);
      doc.moveDown();
      
      // Résumé
      doc.fontSize(14).font('Helvetica-Bold').text('RESUME', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total produits: ${inventory.summary.totalProducts}`);
      doc.text(`Valeur totale: ${inventory.summary.totalValue.toLocaleString('fr-FR')} EUR`);
      doc.text(`Anomalies detectees: ${inventory.summary.anomaliesCount}`);
      doc.text(`Anomalies critiques: ${inventory.summary.criticalAnomalies}`);
      doc.text(`Taux de precision: ${inventory.summary.accuracyRate}%`);
      doc.moveDown();
      
      this.drawLine(doc);
      doc.moveDown();
      
      // Anomalies
      if (inventory.anomalies.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('ANOMALIES DETECTEES', { underline: true });
        doc.moveDown(0.5);
        
        inventory.anomalies.forEach((a) => {
          doc.fontSize(10).font('Helvetica-Bold');
          let severityText = '';
          if (a.severity === 'critical') severityText = 'CRITIQUE';
          else if (a.severity === 'high') severityText = 'HAUTE';
          else if (a.severity === 'medium') severityText = 'MOYENNE';
          else severityText = 'BASSE';
          
          doc.text(`[${severityText}] ${this.cleanText(a.productName)}: ${a.difference > 0 ? '+' : ''}${a.difference} unites`);
          doc.fontSize(9).font('Helvetica');
          doc.text(`   Action: ${this.cleanText(a.recommendation)}`, { indent: 10 });
          doc.moveDown(0.3);
        });
        doc.moveDown();
      }
      
      // Recommandations
      if (inventory.recommendations.length > 0) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('RECOMMANDATIONS IA', { underline: true });
        doc.moveDown(0.5);
        
        inventory.recommendations.forEach(rec => {
          doc.fontSize(10).font('Helvetica');
          const priorityText = rec.priority === 'high' ? 'HAUTE PRIORITE' : 'PRIORITE MOYENNE';
          doc.text(`[${priorityText}] ${this.cleanText(rec.message)}`);
          doc.moveDown(0.3);
        });
      }
      
      // Détail des produits
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('DETAIL DES PRODUITS', { underline: true });
      doc.moveDown(0.5);
      
      const startY = doc.y;
      const colPositions = { name: 50, stock: 200, zone: 270, status: 370 };
      
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Produit', colPositions.name, startY);
      doc.text('Stock', colPositions.stock, startY);
      doc.text('Zone', colPositions.zone, startY);
      doc.text('Statut', colPositions.status, startY);
      
      let y = startY + 20;
      doc.fontSize(8).font('Helvetica');
      
      for (const product of inventory.inventory.slice(0, 30)) {
        if (y > 750) {
          doc.addPage();
          y = 50;
          doc.fontSize(9).font('Helvetica-Bold');
          doc.text('Produit', colPositions.name, y);
          doc.text('Stock', colPositions.stock, y);
          doc.text('Zone', colPositions.zone, y);
          doc.text('Statut', colPositions.status, y);
          y += 20;
          doc.fontSize(8).font('Helvetica');
        }
        
        let status = 'OK';
        if (product.isAnomaly) {
          status = product.difference > 0 ? 'Excedent' : 'Manquant';
        }
        
        doc.text(this.cleanText(product.productName.substring(0, 25)), colPositions.name, y);
        doc.text(product.currentStock.toString(), colPositions.stock, y);
        doc.text(this.cleanText(product.zone), colPositions.zone, y);
        doc.text(status, colPositions.status, y);
        
        y += 18;
      }
      
      // Pied de page
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica');
        doc.text(
          `Page ${i + 1} / ${pageCount} - SMART-STOCK Inventory System`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }
      
      doc.end();
    });
  }
  
  /**
   * Exporte les mouvements en PDF
   */
  async exportMovementsToPDF(report) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // En-tête
      doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT DES MOUVEMENTS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica');
      doc.text(`Genere le: ${new Date(report.generatedAt).toLocaleString('fr-FR')}`, { align: 'center' });
      doc.text(`Periode: ${new Date(report.startDate).toLocaleDateString('fr-FR')} - ${new Date(report.endDate).toLocaleDateString('fr-FR')}`, { align: 'center' });
      doc.moveDown();
      
      this.drawLine(doc);
      doc.moveDown();
      
      // Statistiques
      doc.fontSize(14).font('Helvetica-Bold').text('STATISTIQUES', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total entrees: ${report.stats.totalIn} unites`);
      doc.text(`Total sorties: ${report.stats.totalOut} unites`);
      doc.text(`Total transferts: ${report.stats.totalTransfer}`);
      doc.text(`Variation nette: ${report.stats.totalIn - report.stats.totalOut} unites`);
      doc.moveDown();
      
      this.drawLine(doc);
      doc.moveDown();
      
      // Top produits
      if (report.stats.byProduct.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('TOP PRODUITS', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica');
        report.stats.byProduct.forEach(p => {
          doc.text(`• ${this.cleanText(p.name)}: ${p.quantity} unites`);
        });
        doc.moveDown();
      }
      
      // Liste des mouvements
      if (report.movements && report.movements.length > 0) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('LISTE DES MOUVEMENTS', { underline: true });
        doc.moveDown(0.5);
        
        const startY = doc.y;
        const colPositions = { date: 50, product: 160, type: 290, qty: 360, user: 410 };
        
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Date', colPositions.date, startY);
        doc.text('Produit', colPositions.product, startY);
        doc.text('Type', colPositions.type, startY);
        doc.text('Qte', colPositions.qty, startY);
        doc.text('Par', colPositions.user, startY);
        
        let y = startY + 15;
        doc.fontSize(8).font('Helvetica');
        
        for (const m of report.movements.slice(0, 100)) {
          if (y > 750) {
            doc.addPage();
            y = 50;
          }
          
          const typeText = m.type === 'in' ? 'Entree' : m.type === 'out' ? 'Sortie' : 'Transfert';
          doc.text(new Date(m.movementDate).toLocaleString('fr-FR'), colPositions.date, y);
          doc.text(this.cleanText(m.productName.substring(0, 25)), colPositions.product, y);
          doc.text(typeText, colPositions.type, y);
          doc.text(m.quantity.toString(), colPositions.qty, y);
          doc.text(this.cleanText(m.userName || 'N/A'), colPositions.user, y);
          
          y += 16;
        }
      }
      
      doc.end();
    });
  }
  
  /**
   * Exporte les alertes en PDF
   */
  async exportAlertsToPDF(alerts) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // En-tête
      doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT DES ALERTES', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica');
      doc.text(`Genere le: ${new Date(alerts.generatedAt).toLocaleString('fr-FR')}`, { align: 'center' });
      doc.moveDown();
      
      this.drawLine(doc);
      doc.moveDown();
      
      // Résumé
      doc.fontSize(14).font('Helvetica-Bold').text('RESUME', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total alertes: ${alerts.totalAlerts}`);
      doc.text(`Alertes critiques: ${alerts.criticalAlerts}`);
      doc.moveDown();
      
      this.drawLine(doc);
      doc.moveDown();
      
      // Liste des alertes
      if (alerts.alerts.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('LISTE DES ALERTES', { underline: true });
        doc.moveDown(0.5);
        
        alerts.alerts.forEach(alert => {
          const levelText = alert.alertLevel === 'critical' ? 'CRITIQUE' : 'HAUTE';
          doc.fontSize(10).font('Helvetica-Bold');
          doc.text(`[${levelText}] ${this.cleanText(alert.productName)}`);
          doc.fontSize(9).font('Helvetica');
          doc.text(`   Stock restant: ${alert.currentStock} unites`);
          doc.text(`   Action: ${this.cleanText(alert.recommendation)}`);
          doc.moveDown(0.5);
        });
      }
      
      doc.end();
    });
  }
  
  drawLine(doc) {
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  }
}

module.exports = new InventoryAIService();