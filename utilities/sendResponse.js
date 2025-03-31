module.exports = (statusCode, dataProp, token = undefined) => {
  res.status(statusCode).json({
    status: `${statusCode}`.startsWith("2")
      ? "sucess"
      : `${statusCode}`.startsWith("4")
      ? "fail"
      : "error",
    data: {
      dataProp,
    },
    token,
  });
};
