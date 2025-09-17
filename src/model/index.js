const { string } = require('joi')
const {Schema, default: mongoose} = require('mongoose')

const oauthSchema = new Schema ({
    token: {
        type: String,
        required: true
    },
    user_id:{
        type: String,
        required: true,
        unique: true,
    },
    expire_in:{
        type: Date,
        required: true
    }
}, {timestamps: true})

const resetModel = new Schema({
    email:{
        required: true,
        type: String,
        lowercase: true
    },
    otp: {
        required: true,
        type:String,
        minlength: 6,
        maxlength: 6
    },
    expire_in:{
        required: true,
        type:Date
    }
}, {timestamps: true})

const incomeModel = new Schema({
    name:{
        type: String,
        required: true
    },
     user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status:{
        required: true,
        type: String,
        enum: ['successful', 'failed', 'pending']
    },
    source: {
        reuired: true,
        type: String, //e.g salary
    },
    description:{
        type: String,
        max_length: 300
    },
    amount: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const expensesModel = new Schema({
    name: {
        required: true,
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status:{
        required: true,
        type: String,
        enum: ['successful', 'failed', 'pending']
    },
    description:{
        type: String,
        max_length: 300
    },
    amount:{
        type: Number,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'expense_category'
    }
}, {timestamps: true})

const expensesCategory = new Schema(({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}))

const BudjetModel = new Schema(({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

}))
const profileModel = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    profile_pic: {
        required: true,
        type: String,
    }
}, {timestamps: true})
const Oauth = mongoose.model('Oauth_access_token', oauthSchema)
const Reset = mongoose.model('reset', resetModel)
const Profile = mongoose.model('profile', profileModel)
const Expenses = mongoose.model('expense', expensesModel)
const Income = mongoose.model('income', incomeModel)
const ExpenseCategory = mongoose.model('expense_category', expensesCategory)

module.exports = {
    Oauth,
    Reset,
    Profile,
    Expenses,
    Income,
    ExpenseCategory
}

