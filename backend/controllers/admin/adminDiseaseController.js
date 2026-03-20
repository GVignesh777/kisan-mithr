const CropAnalysis = require('../../models/CropAnalysis');

const getCropReports = async (req, res) => {
  try {
    const reports = await CropAnalysis.find({})
      .populate('userId', 'name phone location')
      .sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await CropAnalysis.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Since CropAnalysis doesn't have a status field yet, we might need to add it or skip this
    // For now, let's assume we want to keep status tracking for the admin
    report.status = status;
    await report.save();
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await CropAnalysis.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    await CropAnalysis.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report', error: error.message });
  }
};

module.exports = {
  getCropReports,
  updateReportStatus,
  deleteReport
};
