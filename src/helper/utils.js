const siteName = 'ExpenseTracker'
const apiDomain = 'api.expenseTracker.com'
const bcrypt = require('bcrypt')
const config = require('../../config')
const { Oauth } = require('../model')
const jwt = require('jsonwebtoken')

const hashPassword = async (password) =>{
    const encrypetdPassword = await bcrypt.hash(password, 10)

    return encrypetdPassword
}

const comparePassord = async (password,dbPassword) =>{
    return await bcrypt.compare(password, dbPassword)
}
const  generateToken = (userdata) =>{
    return jwt.sign(userdata, config.jwt_secret);
}

const saveToken  = async (token,user_id, expire_in,save = null) =>{
    console.log(user_id)
    if(!token){
        return false
    }
    const check = await Oauth.findOne({user_id})
    console.log(check)
    if(check){
        const update = {
            expire_in,
            token
        }
        if(save){
            await Oauth.updateOne(
                {_id: check._id},
                {$set: update}
            )
        }
    }
    else{
        await Oauth.create({
            token,
            user_id,
            expire_in
        })
    }
    return token

}
const sendEmail = async (email, subject,content) =>{
    const mailOption = {
        from: siteName,
        to: email,
        subject: subject,
        html: content
    }

    try {
        const sendmail = await config.transporter.sendMail(mailOption);
        return sendmail.accepted.length > 0;
      } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
}


module.exports = {
    comparePassord,
    hashPassword,
    siteName,
    generateToken,
    saveToken,
    sendEmail
}