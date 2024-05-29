// not found error handler
const notFound = (req, res, next) => {
  const error = new Error(`not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// error handler middleware
const errorHandler = (err, req, res, next) => {
  const { message, stack } = err;
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: message,
    // stack to knowing the client where the error was act
    stack: process.env.NODE_ENV === "production" ? null : stack,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
