function employeeAuthProtect(req, res, next) {
  if (!req.session.employee) {
    res.redirect('/employee');
  } else {
    next();
  }
}
module.exports = employeeAuthProtect;
