const express = require("express");
const dbConnect = require("./configs/dbConnect")
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000
const bodyParser = require("body-parser");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoutes")
const blogRouter = require("./routes/blogRoutes")
const categoryRouter = require("./routes/categoryRoutes")
const { notfound, errorhandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const morgan = require("morgan")

dbConnect();

app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api/user', authRouter)
app.use('/api/product', productRouter)
app.use('/api/blog', blogRouter)
app.use('/api/category', categoryRouter)

app.use(notfound);
app.use(errorhandler);


app.listen(PORT, () => {
    console.log(`server is running at PORT ${PORT}`)
})