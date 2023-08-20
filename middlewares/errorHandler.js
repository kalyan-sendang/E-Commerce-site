//not found

const notfound = (req, res, next) => {
    const error = new Error(`Not found: ${req.originalUrl}`)
    res.status(400);
    next(error)
}

//error handler

const errorhandler = (err, req, res, next) => {
    const statuscode = res.statusCode = 200 ? 500 : res.statuscode;
    res.status(statuscode);
    res.json({
        message: err?.message,
        stack: err?.stack,
    })
}

module.exports = {
    notfound,
    errorhandler,
}