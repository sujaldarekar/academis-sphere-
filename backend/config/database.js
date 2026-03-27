// Database Configuration
module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/student-hod-system',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    retryWrites: true,
  },
};
