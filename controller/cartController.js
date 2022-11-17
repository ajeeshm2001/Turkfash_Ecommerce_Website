var producthelpers = require("../helpers/product_helpers");
var userhelpers = require("../helpers/user_helpers");
var categoryhelpers = require("../helpers/category_helpers");
var bannerhelpers = require("../helpers/banner_helpers");
let s;
let otp;
let verify;



module.exports.addToCart= (req, res) => {
    userhelpers
      .addTocart(req.params.id, req.session.user._id)
      .then((response) => {
        console.log(response);
        res.json({ status: true });
      });
  }


  module.exports.viewCart=async (req, res) => {
    console.log(req.session.user);
    let cartproducts = await userhelpers.getCartproducts(req.session.user._id);
    let total = await userhelpers.getTotalAmount(req.session.user._id);
    let carttotal;
    if (total == 0) {
      carttotal = true;
    }
    console.log(cartproducts);
    res.render("user/user-cart", {
      users:true,
      cartproducts,
      total,
      user: req.session.user,
      carttotal,
      userheadz:true
    });
  }


  module.exports.changeProductQuantity= (req, res) => {
    console.log(req.body);
    userhelpers.changeQuantity(req.body).then(async (response) => {
      response.total = await userhelpers.getTotalAmount(req.body.user);
      console.log(response);
      res.json(response);
    });
  }


  module.exports.deleteCartProduct= (req, res) => {
    userhelpers.removeProduct(req.body).then((response) => {
      res.json(response);
    });
  }


  module.exports.userCartCount=(req,res)=>{
    userhelpers.getCartCount(req.session.user._id).then((response)=>{
      res.json(response)
    })
  }