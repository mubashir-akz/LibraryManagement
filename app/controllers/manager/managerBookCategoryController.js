let { ObjectID } = require('mongodb').ObjectID;
const db = require('../../config/mongoConnection');

function managerBookCategoryController() {
  return {
    async listCategory(req, res) {
      const lists = [];
      await db.get().collection('bookCategory').find({}).toArray((err, results) => {
        if (err) throw err;
        results.forEach(async (result) => {
          await db.get().collection('bookSubjects').aggregate([
            { $match: { categoryName: result.category } },
            { $group: { _id: '$subject' } },
          ]).toArray((error, datas) => {
            if (error) throw error;
            const sub = [];
            datas.forEach((data) => {
              // eslint-disable-next-line no-underscore-dangle
              sub.push(data._id);
            });
            lists.push({
              category: result.category,
              subjects: sub,
            });
          });
        });
      });
      setTimeout(() => {
        res.render('manager/bookCategory', { lists });
      }, 100);
    },
    addCategory(req, res) {
      const formData = Object.values(req.body);
      const newCategory = formData[0];
      formData.shift();
      function setCategory(category) {
        return new Promise((resolve, reject) => {
          db.get().collection('bookCategory').countDocuments({ category }, { limit: 1 }, (err, data) => {
            if (err) throw err;
            if (data === 1) {
              req.flash('error', 'Category already exits');
              res.redirect('/manager/listCategory');
              reject();
              return;
            }
            db.get().collection('bookCategory').insertOne({ category }, (error) => {
              if (error) throw error;
              // eslint-disable-next-line no-use-before-define
              resolve(setSubjects(newCategory, formData));
            });
          });
        });
      }
      function setSubjects(category, subjects) {
        setTimeout(async () => {
          await db.get().collection('bookCategory').findOne({ category }, (err, data) => {
            if (err) throw err;
            // eslint-disable-next-line no-underscore-dangle
            ObjectID = data._id;
            subjects.forEach((subject) => {
              db.get().collection('bookSubjects').insertOne({ categoryID: ObjectID, categoryName: category, subject }, (error) => {
                if (error) throw error;
              });
            });
          });
          res.redirect('/manager/listCategory');
        }, 100);
      }
      setCategory(newCategory).catch(() => {
        console.log('category already existed');
      }).then(() => {
        console.log('Subjects added to the Category');
      });
    },
    async deleteCatagory(req, res) {
      const { category } = req.body;
      await db.get().collection('bookCategory').deleteOne({ category }, async (err) => {
        if (err) throw err;
        await db.get().collection('bookSubjects').deleteMany({ categoryName: category }, (error) => {
          if (error) throw error;
        });
      });
      res.redirect('/manager/ListCategory');
    },
  };
}
module.exports = managerBookCategoryController;
