// src/middlewares/globalErrorHandler.js

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    err.isOperational
      ? err.message
      : "Something went wrong. Please try again later.";

  // Log only unexpected errors
  if (!err.isOperational) {
    console.error("UNEXPECTED ERROR:", err);
  }

  // ---------- EJS / SSR FLOW ----------
  if (req.flash) {
    req.flash("error_msg", message);

    // user already exists → go to login
    if (statusCode === 409 || 200) {
      return res.redirect("/login");
    }

    // validation or others → back
    return res.redirect("back");
  }

  // ---------- API FALLBACK ----------
  return res.status(statusCode).json({
    status: "error",
    message
  });
};

export default globalErrorHandler;
