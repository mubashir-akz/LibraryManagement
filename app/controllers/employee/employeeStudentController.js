const db = require('../../config/mongoConnection');

function employeeStudentController() {
  return {
    students(req, res) {
      db.get().collection('students').find({}).toArray((err, datas) => {
        if (err) throw err;
        res.render('employees/students', { datas });
      });
    },
    addStudent(req, res) {
      console.log(req.body);
      const newStudent = req.body;
      db.get().collection('students').countDocuments({ studentID: newStudent.studentID }, { limit: 1 }, (err, data) => {
        if (err) throw err;
        if (data === 1) {
          req.flash('error', 'Student already exits');
          res.redirect('/employee/students');
        } else {
          db.get().collection('students').insertOne(newStudent, (error) => {
            if (error) throw error;
            res.redirect('/employee/students');
          });
        }
      });
    },
    deleteStudent(req, res) {
      const { studentID } = req.body;
      db.get().collection('students').deleteOne({ studentID }, (err) => {
        if (err) throw err;
        res.redirect('/employee/students');
      });
    },
  };
}

module.exports = employeeStudentController;
