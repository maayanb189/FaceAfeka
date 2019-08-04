

exports.ContactUser = function (data, res) {
    return new Promise((resolve, reject)=> {
      console.log('got data:',data)
      var nodemailer = require('nodemailer');
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false, // use SSL
        port: 25,
        auth: {
          // user: 'faceafekauser@gmail.com',
          // pass: 'Maayan18', //enter your gmail account password 
          user: 'faceafeka123@gmail.com',
          pass: '19931992fa', //enter your gmail account password 
        },
        tls: {
          rejectUnauthorized: false
        }
      });
  
      var mailOptions = {
        from: 'faceafeka123@gmail.com', //enter your gmail account email 
        to: data.email,
        subject: "You got invitation to FlappyBirds game",
        text: "http://localhost:2000"
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          reject()
        } else {
          console.log('Email sent: ' + info.response);
          // res.json(200);
          resolve(200)
        }
      });
    })
  }
  
  