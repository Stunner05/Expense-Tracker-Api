
    const mongoose = require('mongoose')

    const Schema = mongoose.Schema

    const userSchema =  new Schema({
        email: {
            required: [true, 'email is required'],
            lowercase: true,
            type: String,
            unique: true
        },
        firstname: {
            required: [true, 'firstname is required'],
            type: String,
        },
        lastname:{
            required: [true, 'lastname is required'],
            type: String,
        },
        password:{
            required: [true, 'password is required'],
            type: String,
            minlenght: 6
        },
        verfied: {
            type: Boolean,
            default: false
        },
    },{timestamps: true});
    const User =  mongoose.model('user', userSchema);
    module.exports= User;