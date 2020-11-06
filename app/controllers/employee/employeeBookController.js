const db = require('../../config/mongoConnection');

function employeeBookController() {
  return {
    listBooks(req, res) {
      db.get().collection('books').find({}).toArray((err, books) => {
        if (err) throw err;
        res.render('employees/books', { books });
      });
    },
    getCategory(req, res) {
      const categories = [];
      db.get().collection('bookCategory').find({}, { projection: { _id: 0, category: 1 } }).toArray((err, datas) => {
        if (err) throw err;
        datas.forEach((data) => {
          categories.push(data.category);
        });
        if (req.xhr) {
          res.json(categories);
        }
      });
    },
    getSubject(req, res) {
      const category = Object.keys(req.body)[0];
      const subjects = [];
      db.get().collection('bookSubjects').find({ categoryName: category }, { projection: { _id: 0, subject: 1 } }).toArray((err, datas) => {
        if (err) throw err;
        datas.forEach((data) => {
          subjects.push(data.subject);
        });
        res.json(subjects);
      });
    },
    addBook(req, res) {
      const newBook = req.body;
      db.get().collection('books').countDocuments({ ISBN: newBook.ISBN }, { limit: 1 }, (err, data) => {
        if (err) throw err;
        if (data === 1) {
          req.flash('error', 'Book already exits');
          res.redirect('/employee/books');
        } else {
          db.get().collection('books').insertOne(newBook, (error) => {
            if (error) throw error;
            res.redirect('/employee/books');
          });
        }
      });
    },
    deleteBook(req, res) {
      db.get().collection('books').deleteOne({ ISBN: req.body.ISBN }, (error) => {
        if (error) throw error;
        res.redirect('/employee/books');
      });
    },
  };
}
module.exports = employeeBookController;
