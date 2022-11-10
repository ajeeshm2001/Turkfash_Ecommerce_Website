var producthelpers = require("../helpers/product_helpers");
var userhelpers = require("../helpers/user_helpers");
var categoryhelpers = require("../helpers/category_helpers");
var bannerhelpers = require("../helpers/banner_helpers");
const coupon_helpers = require("../helpers/coupon_helpers");
const { CART_HELPERS } = require("../config/collection");
const { response } = require("../app");



module.exports.userPlaceOrder= async (req, res) => {
  
    let getallcoupon = await coupon_helpers.getAllcoupon()
    let address = await userhelpers.getAllAddress(req.session.user._id)
    let cartproducts = await userhelpers.getCartproducts(req.session.user._id);
    let total = await userhelpers.getTotalAmount(req.session.user._id);
    if(req.body.coupon){

    }
    if(cartproducts.length!=0){
      res.render("user/user-placeorder", {
        users:true,
        cartproducts,
        total,
        user: req.session.user,
        address,getallcoupon
      });
    }else{
      res.redirect('/')
    }
  }


  module.exports.userPlaceOrderPost=async (req, res) => {
    let products = await userhelpers.getCartproductdetails(req.session.user._id);               
    let totalAmount = await userhelpers.getTotalAmount(req.session.user._id,req.body.coupon);
    if(req.body.coupon){
      let coupon =await coupon_helpers.userCouponPush(req.body.coupon,req.session.user._id)
    }
    userhelpers.placeOrder(req.body, products, totalAmount).then((orderId) => {
      if (req.body["paymentmethod"] == "COD") {
        res.json({ codPayment: true });
      } else if (req.body.paymentmethod == "Razorpay") {
        console.log('...........................ddddddddddddddddddddddddd');
        console.log(totalAmount);
        userhelpers.generateRazorpay(orderId, totalAmount).then((response) => {
          res.json(response);
        });
      }
      else if(req.body['paymentmethod']=="wallet"){
        
        userhelpers.updateWallet(req.session.user._id,totalAmount).then((response)=>{
          res.json(response)
        })
      }
       else {
        res.json({ orderId,totalAmount,paypal: true });
      }
    });
  }


  module.exports.adminViewOrder=(req,res)=>{
    userhelpers.getallorderlist().then((order)=>{
      res.render('admin/admin_vieworders',{admin:true,order})
    })
  }


  module.exports.adminEditOrder=(req,res)=>{
    userhelpers.editorderlist(req.params.value,req.params.id).then((response)=>{
      res.redirect('/admin/viewallorders')
    })
  }