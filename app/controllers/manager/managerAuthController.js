const axios = require('axios');
const FormData = require('form-data');
const db = require('../../config/mongoConnection');

let otpId;
function managerAuthController() {
  return {
    login(req, res) {
      res.render('manager/login');
    },
    otpGet(req, res) {
      res.render('manager/loginOtp');
    },
    postLogin(req, res) {
      const { userName, password } = req.body;
      db.get().collection('managerAuth').findOne({}, (err, data) => {
        if (err) throw err;
        if (userName === data.username && password === data.password) {
          // eslint-disable-next-line no-underscore-dangle
          req.session.manager = data._id;
          res.redirect('/manager/dash');
        } else {
          req.flash('error', 'Invalid username or password');
          res.redirect('/manager');
        }
      });
    },
    otpLogin(req, res) {
      const { mobile } = req.body;
      db.get().collection('managerAuth').findOne({}, (err, result) => {
        if (err) throw err;
        if (mobile !== result.mobile) {
          req.flash('error', 'Invalid or Unregistered mobile number');
          res.redirect('/manager');
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
              res.redirect('/manager/otpget');
            })
            .catch(() => {
              req.flash('error', 'No user with this number');
              res.redirect('/manager');
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
          console.log(response.data.status);
          if (response.data.status === 'success') {
            db.get().collection('managerAuth').findOne({}, (err, result) => {
              if (err) throw err;
              // eslint-disable-next-line no-underscore-dangle
              req.session.manager = result._id;
              res.redirect('/manager/dash');
            });
          }
        })
        .catch(() => {
          req.flash('error', 'Something went wrong');
          res.redirect('/manager/otpget');
        });
    },
    logout(req, res) {
      req.session.destroy();
      res.clearCookie('managerCookie');
      res.redirect('/manager');
    },
  };
}
module.exports = managerAuthController;
