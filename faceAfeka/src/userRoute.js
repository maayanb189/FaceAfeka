const emailServices = require('./emailService');

module.exports = (app) => {


app.post('/send_mail', (req, res) => {
    let email = req.body
    console.log('enter contact user', email);
    
    return emailServices.ContactUser(email)
    .then(result => res.json(result))
    .catch(err => res.json({ error: err }))
});

}