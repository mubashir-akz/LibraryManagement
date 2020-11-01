function managerAuthProtect(req, res, next) {
  if (!req.session.manager) {
    res.redirect('/manager');
  } else {
    next();
  }
}
module.exports = managerAuthProtect;
