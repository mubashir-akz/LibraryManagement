function managerAuthController() {
  return {
    login(req, res) {
      res.render('manager/login');
    },
    postLogin(req, res) {
      console.log(req.body);
    },
  };
}
module.exports = managerAuthController;
