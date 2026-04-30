// controllers/reportController.js
const inventoryAIService = require("../services/inventoryAIService");
const { Movement } = require("../models/associations");

// Générer rapport d'inventaire PDF
exports.generateInventoryPDF = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const pdfBuffer = await inventoryAIService.generateInventoryReport(period, 'pdf');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=inventaire_${period}_${Date.now()}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Erreur génération PDF inventaire:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Générer rapport des mouvements PDF
exports.generateMovementsPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    
    const pdfBuffer = await inventoryAIService.generateMovementsReport(
      startDate || defaultStartDate,
      endDate || new Date(),
      'pdf'
    );
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=mouvements_${Date.now()}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Erreur génération PDF mouvements:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Générer rapport des alertes PDF
exports.generateAlertsPDF = async (req, res) => {
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
    
  } catch (error) {
    console.error("Erreur génération PDF alertes:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir l'aperçu de l'inventaire (sans PDF)
exports.getInventoryPreview = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const inventory = await inventoryAIService.generateAutoInventory(period);
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};