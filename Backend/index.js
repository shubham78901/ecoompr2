const express = require('express')

require('./db/config')

const cors = require("cors")

const User = require("./db/Users")

const Product=require("./db/product")

const mongoose =require('mongoose');

const Jwt=require('jsonwebtoken')

const jwtkey='e-comm'

const app = express();

app.use(express.json())

app.use(cors());

app.post("/register", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  console.log(req.body);
  result = result.toObject();
  // delete result.password;
  Jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({ result: "something went wrong pls try after some time" });
    }
    console.log(JSON.stringify({ user, auth: token }));
    res.send(JSON.stringify({ user, auth: token }));
  });
});

app.get('/users',async(req,res)=>
{
   const list=await User.find();
   console.log(list)
   res.send(list)


})
app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");

    if (user) {
      Jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({ result: "something went wrong pls try after some time" });
        }
        console.log(JSON.stringify({ user, auth: token }));
        res.send(JSON.stringify({ user, auth: token }));
      });
      console.log(user);
      // res.send(user); // You may remove this line if not required
    } else {
      res.send({ result: "No user found" });
    }
  } else {
    res.send({ result: "No result found" });
  }
});


app.post("/add-product",verifyToken,async (req,res)=>
{

    let product=new Product(req.body);

    let result=await product.save();

    res.send(result)
})

app.get("/products",verifyToken,async (req,res)=>
{

    let products=await Product.find();
    if(products.length>0)
    {
        res.send(products);
    }
    else
    {
        res.send({result:"No product found"})
    }

})
app.delete("/product/:id",async (req,res)=>
{

   const result=await Product.deleteOne({_id:req.params.id})
   res.send(result)
})
app.get('/product/:id',verifyToken,async (req, res) => {
    console.log(req.params.id);
    console.log(typeof(req.params.id))
    
    try {
      let result = await Product.findOne({_id:req.params.id.trim()});
      console.log(result)
      if (result) {
        res.send(result);
      } else {
        res.send({ result: "No record found" });
      }
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  });
  app.put("/product/:id",verifyToken,async (req,res)=>
  {
        let result=await Product.updateOne({_id:req.params.id.trim()},{
                 $set:req.body


        })
  res.send(result)

  })

  app.get("/search/:key",verifyToken,async(req,res)=>
  {
  let result=await Product.find({
    "$or":
    [
        {name:{$regex:req.params.key}},
        {company:{$regex:req.params.key}},
        {category:{$regex:req.params.key}}
    ]
  })
  res.send(result)


  })
  function verifyToken(req,res,next)
  {
    let token =req.headers['authorization']
    if(token)
    {
           token=token.split(' ')[1]
            console.warn("middleware called",token)
            Jwt.verify(token,jwtkey,(err,valid)=>
            {
            if(err)
            {
              res.status(401).send({result:"please provide a valid token"})
            }
            next()
            })
    }
    else{
            res.status(403).send({result:"please add token with header"})
    }
   

  }
app.listen(3000)