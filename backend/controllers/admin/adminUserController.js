const User = require('../../models/User');

const getAllUsers = async (req, res) => {
  try {
    // Optionally add pagination and search queries here
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { phone: { $regex: req.query.keyword, $options: 'i' } }
          ],
        }
      : {};

    const users = await User.find({ ...keyword }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Assuming you have an 'isBlocked' field in User schema, if not we add one or repurpose status
    user.isBlocked = true; 
    await user.save();

    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isBlocked = false;
    await user.save();

    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser
};
