const { default: mongoose } = require("mongoose")

const dbConnect = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Database Connected successfully");
    } catch (error) {
        console.log(error);
    }
}

module.exports = dbConnect;