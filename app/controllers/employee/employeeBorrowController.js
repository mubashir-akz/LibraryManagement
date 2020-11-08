const moment = require('moment');
const db = require('../../config/mongoConnection');

function employeeBorrowController() {
  return {
    listBorrow(req, res) {
      db.get().collection('borrow').aggregate([
        {
          $match: { },
        },
        {
          $lookup: {
            from: 'books',
            localField: 'isbn',
            foreignField: 'ISBN',
            as: 'bookDetails',
          },
        },
        {
          $unwind: '$bookDetails',
        },
        {
          $lookup: {
            from: 'students',
            localField: 'studentID',
            foreignField: 'studentID',
            as: 'studentDetails',
          },
        },
        {
          $unwind: '$studentDetails',
        },
      ]).toArray((err, datas) => {
        res.render('employees/borrow', { datas });
      });
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
              resolve(checkIfBook(studentID));
            } else {
              reject();
            }
          });
        }).catch(() => {
          req.flash('error', 'Not a valid ISBN Number');
          res.redirect('/employee/borrow');
        });
      }
      function checkIfBook(id) {
        new Promise((resolve, reject) => {
          db.get().collection('students').findOne({ studentID: id }, (err, data) => {
            if (err) throw err;
            if (data.bookTaken) {
              reject();
            } else {
              resolve(checkAndUpdateBookNumber(isbn));
            }
          });
        }).catch(() => {
          req.flash('error', 'Student has already taken a book ! Please return to take a new one ');
          res.redirect('/employee/borrow');
        });
      }
      function checkAndUpdateBookNumber(isbn) {
        new Promise((resolve, reject) => {
          db.get().collection('books').findOne({ ISBN: isbn }, (err, data) => {
            if (err) throw err;
            let number = parseInt(data.number, 10);
            if (number > 0) {
              number -= 1;
              db.get().collection('books').updateOne({ ISBN: isbn }, { $set: { number } }, false, (err) => {
                if (err) throw err;
                console.log('Book number updated');
              });
              resolve(insertToStudent());
            } else {
              reject();
            }
          });
        }).catch(() => {
          req.flash('error', 'The Book is Unavailable right now');
          res.redirect('/employee/borrow');
        });
      }
      function insertToStudent() {
        new Promise((resolve, reject) => {
          const bookTaken = {
            isbn,
            issue: moment().format('DD/MM/YYYY'),
            due: moment().add(7, 'days').format('DD/MM/YYYY'),
          };
          db.get().collection('students').updateOne({ studentID }, { $set: { bookTaken } }, false, (err) => {
            if (err) reject();
            console.log('data inserted to students collection');
            resolve(insertToBorrow(bookTaken));
          });
        }).catch(() => {
          req.flash('error', 'Something went wrong');
          res.redirect('/employee/borrow');
        });
      }
      function insertToBorrow(datas) {
        const details = { ...datas, studentID, status: 'Not Returned' };
        db.get().collection('borrow').insertOne(details, (err) => {
          if (err) throw err;
          res.redirect('/employee/borrow');
        });
      }
      checkStudent(studentID);
    },
  };
}
module.exports = employeeBorrowController;
