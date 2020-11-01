function managerDashController() {
  return {
    dashboard(req, res) {
      res.render('manager/dashboard');
    },
  };
}
module.exports = managerDashController;
