function managerDashProtect(req, res, next) {
  if (req.session.manager) {
    res.redirect('/manager/dash');
  } else {
    next();
  }
}
module.exports = managerDashProtect;
