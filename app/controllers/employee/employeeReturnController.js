const moment = require('moment');
const { ObjectId } = require('mongodb');
const db = require('../../config/mongoConnection');

function employeeReturnController() {
  return {
    listReturn(req, res) {
      res.render('employees/return');
    },
    returnBook(req, res) {
      const { studentID, isbn } = req.body;
      function checkBorrow(stdid, bkid) {
        new Promise((resolve, reject) => {
          db.get().collection('borrow').findOne({ studentID: stdid, isbn: bkid }, { sort: { _id: -1 } }, (err, result) => {
            if (err) throw err;
            if (result == null) {
              reject('notFound');
            } else if (result.status === 'Returned') {
              reject();
            } else {
              resolve(createReturn(result));
            }
          });
        }).catch((msg) => {
          if (msg === 'notFound') {
            req.flash('error', 'Not a valid StudentID or ISBN ! Please check it again');
            res.redirect('/employee/return');
          } else {
            req.flash('error', 'Sorry ! This book has already been returned');
            res.redirect('/employee/return');
          }
        });
      }
      function createReturn(datas) {
        new Promise((resolve, reject) => {
          let fine = 0;
          const start = moment().format('MM/DD/YYYY');
          const end = moment(datas.due, 'DD/MM/YYYY').format('MM/DD/YYYY');
          const num = moment(start).diff(moment(end), 'days');
          if (num > 0) {
            fine = num * 50;
          }
          const details = { ...datas, return: moment(start, 'MM/DD/YYYY').format('DD/MM/YYYY'), fine };
          db.get().collection('return').insertOne(details, (err) => {
            if (err) reject();
            // eslint-disable-next-line no-underscore-dangle
            resolve(updateStudent(details));
          });
        }).catch(() => {
          req.flash('error', 'Sorry ! Fine calculation failed');
          res.redirect('/employee/return');
        });
      }
      function updateStudent(details) {
        new Promise((resolve, reject) => {
          db.get().collection('students').updateOne({ studentID }, { $unset: { currentBook: 1 } }, (err) => {
            if (err) reject();
            console.log('current Book deleted');
            db.get().collection('students').updateOne({ studentID }, { $push: { bookTaken: details } }, (err) => {
              if (err) reject();
              console.log('book taken added');
              // eslint-disable-next-line no-underscore-dangle
              resolve(updateBorrow(details._id));
            });
          });
        }).catch(() => {
          req.flash('error', 'Student updation failed');
          res.redirect('/employee/return');
        });
      }
      function updateBorrow(id) {
        new Promise((resolve, reject) => {
          db.get().collection('borrow').updateOne({ _id: ObjectId(id) }, { $set: { status: 'Returned' } }, false, (err) => {
            if (err) reject();
            console.log('status updated in borrow collection');
            resolve(updateNumber());
          });
        }).catch(() => {
          req.flash('error', 'Status updation failed');
          res.redirect('/employee/return');
        });
      }
      function updateNumber() {
        db.get().collection('books').updateOne({ ISBN: isbn }, { $inc: { number: 1 } }, (err) => {
          if (err) throw err;
          console.log('Book number updated');
          res.redirect('/employee/return');
        });
      }

      checkBorrow(studentID, isbn);
    },
  };
}
module.exports = employeeReturnController;
