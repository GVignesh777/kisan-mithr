const Image = require('../../models/Image');

const getImages = async (req, res) => {
  try {
    const images = await Image.find({}).populate('farmerId', 'name phone').sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
};

const updateImageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    image.status = status;
    await image.save();
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: 'Error updating image status', error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

module.exports = {
  getImages,
  updateImageStatus,
  deleteImage
};
