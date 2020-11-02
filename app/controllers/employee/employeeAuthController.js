const axios = require('axios');
const FormData = require('form-data');
const db = require('../../config/mongoConnection');

let otpId; let empid;
function employeeAuthController() {
  return {
    login(req, res) {
      res.render('employees/login');
    },
    otpGet(req, res) {
      res.render('employees/loginOtp');
    },
    postLogin(req, res) {
      const { EmpIDs, password } = req.body;
      console.log(EmpIDs, password);
      db.get().collection('employees').find({ EmpID: EmpIDs }).toArray((err, data) => {
        if (err) throw err;
        if (EmpIDs === data[0].EmpID && password === data[0].password) {
          // eslint-disable-next-line no-underscore-dangle
          req.session.employee = data[0].EmpID;
          res.redirect('/employee/dash');
        } else {
          req.flash('error', 'Invalid username or password');
          res.redirect('/employee');
        }
      });
    },
    otpLogin(req, res) {
      empid = req.body.EmpIDs;
      const { EmpIDs, mobile } = req.body;
      db.get().collection('employees').findOne({ EmpID: EmpIDs }, (err, result) => {
        if (err) throw err;
        if (mobile !== result.mobile) {
          req.flash('error', 'Invalid or Unregistered mobile number');
          res.redirect('/employee');
        } else {
          const data = new FormData();
          data.append('mobile', `91${mobile}`);
          data.append('sender_id', 'SMSINFO');
          data.append('message', 'Your otp code is {code}');
          data.append('expiry', '900');

          const config = {
            method: 'post',
            url: 'https://d7networks.com/api/verifier/send',
            headers: {
              Authorization: 'Token cb379295f8f33aa1628850dcb432fa1d19dd1955',
              ...data.getHeaders(),
            },
            data,
          };

          axios(config)
            .then((response) => {
              // console.log(JSON.stringify(response.data));
              otpId = response.data.otp_id;
              res.redirect('/employee/otpget');
            })
            .catch(() => {
              req.flash('error', 'No user with this number');
              res.redirect('/employee');
            });
        }
      });
    },
    otpGetPost(req, res) {
      const { otp } = req.body;
      const data = new FormData();
      data.append('otp_id', otpId);
      data.append('otp_code', otp);

      const config = {
        method: 'post',
        url: 'https://d7networks.com/api/verifier/verify',
        headers: {
          Authorization: 'Token cb379295f8f33aa1628850dcb432fa1d19dd1955',
          ...data.getHeaders(),
        },
        data,
      };

      axios(config)
        .then((response) => {
          if (response.data.status === 'success') {
            db.get().collection('employees').findOne({ EmpID: empid }, (err, result) => {
              if (err) throw err;
              // eslint-disable-next-line no-underscore-dangle
              req.session.employee = result._id;
              res.redirect('/employee/dash');
            });
          }
        })
        .catch(() => {
          req.flash('error', 'Something went wrong');
          res.redirect('/employee/otpget');
        });
    },
    logout(req, res) {
      req.session.destroy();
      res.clearCookie('employeeCookie');
      res.redirect('/employee');
    },
  };
}
module.exports = employeeAuthController;
