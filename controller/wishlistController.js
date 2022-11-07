var producthelpers = require("../helpers/product_helpers");
var userhelpers = require("../helpers/user_helpers");
var categoryhelpers = require("../helpers/category_helpers");
var bannerhelpers = require("../helpers/banner_helpers");
let s;
let otp;
let verify;

module.exports.viewWishlist=async (req, res) => {
    let products = await userhelpers.getAllWishlistprod(req.session.user._id);
    console.log("....");
    console.log(products);
    res.render("user/user-wishlist", { products });
  }


  module.exports.addProductsToWishlist= (req, res) => {
    userhelpers
      .addToWishlist(req.params.id, req.session.user._id)
      .then((response) => {
        res.json(response);
      });
  }


  module.exports.addProductToCartWishlist= (req, res) => {
    userhelpers.addTocart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  }

  module.exports.deleteWishlistProduct= (req, res) => {
    userhelpers.removeWishlist(req.body).then((response) => {
      res.json(response);
    });
  }

  module.exports.orderSuccess=(req,res)=>{
    res.render('user/user-ordersuccess',{users:true})
  }