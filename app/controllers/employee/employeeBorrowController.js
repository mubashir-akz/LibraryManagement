const db = require('../../config/mongoConnection');

function employeeBorrowController() {
  return {
    listBorrow(req, res) {
      res.render('employees/borrow');
    },
    borrowBook(req, res) {
      const { studentID, isbn } = req.body;
      function checkStudent(id) {
        new Promise((resolve, reject) => {
          db.get().collection('students').countDocuments({ studentID: id }, { limit: 1 }, (err, data) => {
            if (err) throw err;
            if (data === 1) {
              resolve(checkBook(isbn));
            } else {
              reject();
            }
          });
        }).catch(() => {
          req.flash('error', 'Not a valid StudentID');
          res.redirect('/employee/borrow');
        });
      }
      function checkBook(isbn) {
        new Promise((resolve, reject) => {
          db.get().collection('books').countDocuments({ ISBN: isbn }, { limit: 1 }, (err, data) => {
            if (err) throw err;
            if (data === 1) {
              resolve(success());
            } else {
              reject();
            }
          });
        }).catch(() => {
          req.flash('error', 'Not a valid ISBN Number');
          res.redirect('/employee/borrow');
        });
      }
      function success() {
        console.log('success');
        req.flash('error', 'Success');
        res.redirect('/employee/borrow');
      }
      checkStudent(studentID);
    },
  };
}
module.exports = employeeBorrowController;
