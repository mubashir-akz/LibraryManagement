const db = require('../../config/mongoConnection');

function managerEmployeeController() {
  return {
    employees(req, res) {
      db.get().collection('employees').find({}).toArray((err, datas) => {
        if (err) throw err;
        res.render('manager/employees', { datas });
      });
    },
    addEmployee(req, res) {
      const newEmp = req.body;
      db.get().collection('employees').countDocuments({ EmpID: newEmp.EmpID }, { limit: 1 }, (err, data) => {
        if (err) throw err;
        if (data === 1) {
          req.flash('error', 'Employee already exits');
          res.redirect('/manager/employees');
        } else {
          db.get().collection('employees').insertOne(newEmp, (error) => {
            if (error) throw error;
            res.redirect('/manager/employees');
          });
        }
      });
    },
  };
}
module.exports = managerEmployeeController;
