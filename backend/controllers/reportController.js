// controllers/reportController.js
const inventoryAIService = require("../services/inventoryAIService");
const { Product, Movement } = require("../models/associations");
const { Sequelize } = require("sequelize");
const PDFDocument = require('pdfkit');

// Générer rapport d'inventaire PDF
exports.generateInventoryPDF = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    console.log(`📄 Génération PDF inventaire - période: ${period}`);
    
    const pdfBuffer = await inventoryAIService.generateInventoryReport(period, 'pdf');
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Buffer PDF vide');
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=inventaire_${period}_${Date.now()}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Erreur génération PDF inventaire:", error);
    
    // Fallback: générer un PDF simple
    try {
      const doc = new PDFDocument();
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=inventaire_fallback_${Date.now()}.pdf`);
        res.send(buffer);
      });
      
      doc.fontSize(20).text('RAPPORT D\'INVENTAIRE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });
      doc.text(`Période: ${req.query.period || 'month'}`, { align: 'center' });
      doc.moveDown();
      doc.text('Une erreur technique est survenue lors de la génération complète du rapport.', { color: 'red' });
      doc.text('Veuillez réessayer ultérieurement.');
      doc.end();
      
    } catch (fallbackError) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// Générer rapport des mouvements PDF
exports.generateMovementsPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    
    console.log(`📄 Génération PDF mouvements - du ${startDate || defaultStartDate} au ${endDate || new Date()}`);
    
    const pdfBuffer = await inventoryAIService.generateMovementsReport(
      startDate || defaultStartDate,
      endDate || new Date(),
      'pdf'
    );
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Buffer PDF vide');
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=mouvements_${Date.now()}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Erreur génération PDF mouvements:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Générer rapport des alertes PDF
exports.generateAlertsPDF = async (req, res) => {
  try {
    console.log(`📄 Génération PDF alertes`);
    
    const pdfBuffer = await inventoryAIService.generateAlertsReport('pdf');
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Buffer PDF vide');
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=alertes_${Date.now()}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Erreur génération PDF alertes:", error);
    
    // Fallback
    try {
      const products = await Product.findAll({
        where: { quantity: { [Sequelize.Op.lte]: 10 } }
      });
      
      const doc = new PDFDocument();
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=alertes_${Date.now()}.pdf`);
        res.send(buffer);
      });
      
      doc.fontSize(20).text('RAPPORT DES ALERTES', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`🟡 ${products.length} produit(s) en stock bas`, { underline: true });
      doc.moveDown();
      
      products.forEach(p => {
        doc.fontSize(10).text(`• ${p.name}: ${p.quantity} unités restantes`);
      });
      
      doc.end();
      
    } catch (fallbackError) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// Obtenir l'aperçu de l'inventaire (sans PDF)
exports.getInventoryPreview = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const inventory = await inventoryAIService.generateAutoInventory(period);
    res.json({ success: true, data: inventory });
  } catch (error) {
    console.error("Erreur preview inventaire:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir l'aperçu des mouvements
exports.getMovementsPreview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    
    const report = await inventoryAIService.getMovementsPreview(
      startDate || defaultStartDate,
      endDate || new Date()
    );
    res.json({ success: true, data: report });
  } catch (error) {
    console.error("Erreur preview mouvements:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir l'aperçu des alertes
exports.getAlertsPreview = async (req, res) => {
  try {
    const alerts = await inventoryAIService.getAlertsPreview();
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error("Erreur preview alertes:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// controllers/reportController.js - Ajouter ces méthodes

// Obtenir l'aperçu des mouvements
exports.getMovementsPreview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    
    const report = await inventoryAIService.getMovementsPreview(
      startDate || defaultStartDate,
      endDate || new Date()
    );
    res.json({ success: true, data: report });
  } catch (error) {
    console.error("Erreur preview mouvements:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir l'aperçu des alertes
exports.getAlertsPreview = async (req, res) => {
  try {
    const alerts = await inventoryAIService.getAlertsPreview();
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error("Erreur preview alertes:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};