const preventStatusModification = (req, res, next) => {
  // Nếu request body có status, xóa nó đi
  if (req.body.status) {
    delete req.body.status;
  }
  next();
};

module.exports = {
  preventStatusModification
};