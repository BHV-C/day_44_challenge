const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 20,
    },
    age: {
        type: Number,
        min:18,
        max: 99
    },
    email: {
        type: String,
        unique: true,
        validate: {
            validator: function(value) {
                return /\S+@\S+\.\S+/.test(value);
            },
            message: 'Invalid email format',
        },
    },
});


// const validator = function(value) {
//     return /red|white|gold/i.test(value);
//   };
// userSchema.path('color').validate(validator,
// 'Color `{VALUE}` not valid', 'Invalid color');

// userSchema.path('username').validate({
//     validator: async function (value) {
//     const user = await this.constructor.findOne({ username: value });
//     return !user;
//     },
//     message: 'Username must be unique',
// });
  
userSchema.path('username').validate(async function (value) {
        const user = await this.constructor.findOne({ username: value });
        return !user;
    },'Username must be unique, the {VALUE} already exist',);
  
const User = mongoose.model('User', userSchema);

module.exports = User;