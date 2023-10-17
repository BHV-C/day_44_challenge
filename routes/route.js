const mongoose = require('mongoose');


const express = require('express');
const route = express.Router();
const Product = require('../databases/models/ProductsModel');
const User = require('../databases/models/UserModel');
// const products = require('../databases/models/products');
const app = express();
const uuid = require('uuid');
require('../db');

const passport = require('passport');

const assert = require('assert');

// route.get('/', async (req, res) => {
//   res.status(200).send("Welcome to the basic server");
//   // Find all users with a specific username
//   try{
//       // res.send('welcome to my basic server');
//       const Products = await Product.find();
//       res.status(200).json(Products);
//     }catch(err){
//       res.status(500).json({ error: 'An error occurred while fetching data.' });
//     }
// });

app.set("view engine", "ejs");
// app.set("/views", __dirname+"/views");

// route.get("/", (req, res, next) => {
//   console.log(Products);
//   // const products = 
//   res.render("home", { products: Products });
// });

/************************************ product routes ************************************/

route.get('/', async (req, res) => {
  try {
      const products = await Product.find();
      res.render('home', { products });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving products');
  }
});

route.get("/products/:id", async (req, res, next) => {
  try {
    const products = await Product.findOne({id: req.params.id});

    // const products = await Product.find({ id: req.params.id }, 'username email', (err, user) => {
    //   if (err) {
    //     console.error('Error querying users:', err);
    //     return;
    //   }
    //   console.log(`User with id ${req.params.id} (selected fields):`, user);
    // });

    console.log(products);
    res.render('productDetails', { product: products });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving products');
  }
});

// Serve the "Advanced Search" page
route.get('/advanced-search', (req, res) => {
  res.render('advanced-search')
});

// Handle the advanced search query
route.post('/advanced-search', async (req, res) => {
  // res.render('search')

  const { keyword, minPrice, maxPrice } = req.body;

  const query = {};//{name: {$regex: /iphone/i}, price: {$gt: 9000,$lte: 10000}};
  console.log(keyword);
  console.log(minPrice);
  console.log(maxPrice);
  if (keyword) {
      query.name = { $regex: new RegExp(keyword, 'i') };
  }
  

  if (minPrice && maxPrice) {
      query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
  } else if (minPrice) {
      query.price = { $gte: parseFloat(minPrice) };
  } else if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
  }
   
  try {
    console.log(req.body);
    console.log(query);
    const products = await Product.find(query).sort({id:1}).limit(3).skip(1)/*.exec((err, users) => {
      if (err) {
        console.error('Error querying users:', err);
        return;
      }
      console.log('Limited and skipped users:', users);
    })*/;//.toArray();
    if (products.length == 0){
      res.send("No products match the specified criteria.")
    }else{
        res.json({ products });
    }
  } catch (err) {
      console.error(err);
      res.status(500).send(`'Internal Server Error': ${err.message}`);
  }
});

// adding products

route.post("/add", async (req,res)=>{ 

  
const userSchema1 = new mongoose.Schema({
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


userSchema1.path('username').validate(async function (value) {
      const user = await this.constructor.findOne({ username: value });
      return !user;
  },'Username must be unique, the {VALUE} already exist',);

const User1 = mongoose.model('User', userSchema1);


  const {id, name, price, description, image,username,email,age} = req.body;

  const newProduct = new Product({
    id,
    name,
    price,
    description,
    image
  });
  const newUser = new User1({
    username,
    age,
    email
  });

  let error;
  try {
    await newUser.save();
  } catch (err) {
    error = err;
  }
  // assert.equal(error.errors.username.message, 'Color `Green` not valid');
  // assert.equal(error.errors.username.kind, 'Invalid color');
  // assert.equal(error.errors.username.path, 'color');
  // assert.equal(error.errors.username.value, 'Green');

//   User.path('username').validate(async function (value) {
//     const user = await this.constructor.findOne({ username: value });
//     console.log(user);
//     console.log(!user);
//     return !user;
// },'Username must be unique, the {VALUE} already exist',);
  assert.equal(error.errors.name.message,
    'Enter a none existing name');
  assert.equal(error.errors.name.value, name);
  // If your validator threw an error, the `reason` property will contain
  // the original error thrown, including the original stack trace.
  assert.equal(error.errors.name.reason.message,
    'Need to Enter a none existing username');
  
  assert.equal(error.name, 'ValidationError');

  console.log(error);
  // newProduct.save()
  // .then((product) => {
  //   console.log("Product added successfully:", product);
  //   // res.status(201).json(product);
  // })
  // .catch((err) => {
  //   console.error("Error adding product:", err);
  //   res.status(500).json({ error: 'An error occurred while adding the product.' });
  // });
  const products = await Product.find().sort({ id: 1 });
  res.status(201).json(products);

});
route.put("/update/:id", async (req,res)=>{
  Product.findOneAndUpdate({id:req.params.id}, {$set:{name,description,price,image }=req.body})
  .then(function(){
    console.log("Data updated"); // Success
  }).catch(function(error){
      console.log(error); // Failure
  }); // doesn't work
  // console.log(req.body.description);
  // const doc = await Product.findOne({id:req.params.id});
  // doc.description = req.body.description;
  // await doc.save();
  const products = await Product.find().sort({ id: 1 });
  console.log(await Product.find({id:req.params.id}));

  // res.status(200).render('home', {products});
  res.send(products);
});

route.delete("/delete/:id", async (req,res)=> {
  Product.deleteOne({id:req.params.id}).then(function(){
      console.log("Data deleted"); // Success
    }).catch(function(error){
        console.log(error); // Failure
    });
  console.log(await Product.find());
  const products = await Product.find().sort({ id: 1});
  res.send(products);
});

/************************************ user's authentication routes ************************************/


module.exports = route;