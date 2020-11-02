function employeeDashController() {
  return {
    dashboard(req, res) {
      res.render('employees/dashboard');
    },
  };
}
module.exports = employeeDashController;
