const db = require('../../config/mongoConnection');

function managerBookCategoryController() {
  return {
    listCategory(req, res) {
      res.render('manager/bookCategory');
    },
    addCategory(req, res) {
      const formData = Object.values(req.body);
      const newCategory = formData[0];
      formData.shift();
      console.log(newCategory);
      console.log(formData);
      db.get().collection('bookCategory').countDocuments({ category: newCategory }, { limit: 1 }, (err, data) => {
        if (err) throw err;
        if (data === 1) {
          req.flash('error', 'Category already exits');
          res.redirect('/manager/listCategory');
        } else {
          db.get().collection('bookCategory').insertOne({ category: newCategory }, (error) => {
            if (error) throw error;
          });
        }
      });
    },
  };
}
module.exports = managerBookCategoryController;
