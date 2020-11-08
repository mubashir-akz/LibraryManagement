const moment = require('moment');
const db = require('../../config/mongoConnection');

function employeeBorrowController() {
  return {
    listBorrow(req, res) {
      res.render('employees/borrow');
    },
    borrowBook(req, res) {
      const { studentID, ISBN } = req.body;
      function checkStudent(id) {
        new Promise((resolve, reject) => {
          db.get().collection('students').countDocuments({ studentID: id }, { limit: 1 }, (err, data) => {
            if (err) throw err;
            if (data === 1) {
              resolve(checkBook());
            } else {
              reject();
            }
          });
        }).catch(() => {
          req.flash('error', 'Not a valid StudentID');
          res.redirect('/employee/borrow');
        });
      }
      function checkBook() {
        new Promise((resolve, reject) => {
          db.get().collection('books').countDocuments({ ISBN }, { limit: 1 }, (err, data) => {
            if (err) throw err;
            if (data === 1) {
              resolve(insertToStudent());
            } else {
              reject();
            }
          });
        }).catch(() => {
          req.flash('error', 'Not a valid ISBN Number');
          res.redirect('/employee/borrow');
        });
      }
      function insertToStudent() {
        const bookTaken = {
          isbn: ISBN,
          issue: moment().format('L'),
          due: moment().add(7, 'days').calendar(),
        };
        db.get().collection('students').updateOne({ studentID }, { $set: { bookTaken } }, true, (err) => {
          if (err) throw err;
          console.log('data inserted to students collection');
        });
      }
      checkStudent(studentID);
    },
  };
}
module.exports = employeeBorrowController;
