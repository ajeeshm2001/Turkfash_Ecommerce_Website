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
     var addresses=true
    if(address[0]==null){
      addresses=false
    }
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
        address,getallcoupon,
        userheadz:true,
        addresses
      });
    }else{
      res.redirect('/')
    }
  }


  module.exports.userPlaceOrderPost=async (req, res) => {
    let products = await userhelpers.getCartproductdetails(req.session.user._id,req.body.coupon,req.params.total); 
    console.log(products);
    let totalAmount = await userhelpers.getTotalAmount(req.session.user._id,req.body.coupon);
    if(req.body.coupon){
      let coupon =await coupon_helpers.userCouponPush(req.body.coupon,req.session.user._id)
    }
    userhelpers.placeOrder(req.body, products, totalAmount).then(async(orderId) => {
      if (req.body["paymentmethod"] == "COD") {
        res.json({ codPayment: true });
      } else if (req.body.paymentmethod == "Razorpay") {
        
        userhelpers.generateRazorpay(orderId, totalAmount).then((response) => {
          res.json(response);
        });
      }
      else if(req.body['paymentmethod']=="wallet"){
        let status = await userhelpers.changePaymentstatus(orderId,req.session.user._id)
        
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
    console.log('///<<<<<<<>>>>>>>>>>>>>>>>>>');
    console.log(req.body.value);
    userhelpers.editorderlist(req.body.value,req.body.orderId,req.body.proId).then((response)=>{
     res.json(response)
    })
  }


  module.exports.getOrderProduct= async (req, res) => {
    let orderproduct = await userhelpers.getallorderproduct(req.params.id);
    res.json(orderproduct);
  }


  module.exports.viewOrderProduct=(req,res)=>{
    userhelpers.getUserOrderedProducts(req.params.id).then((orderproducts)=>{
          res.render('user/user-vieworderedproducts',{users:true,orderproducts,userheadz:true})
    })
  }


  module.exports.returnProducts=async(req,res)=>{
    let products= await userhelpers.getallorderproducts(req.params.id)
   res.render('user/user-returnitem',{order:req.params.id})
  }

  module.exports.returnOrderProduct=(req,res)=>{
    userhelpers.getUserReturnProduct(req.params.orderId,req.params.proId).then((returnproducts)=>{
      console.log(returnproducts);
      res.render('user/user-returnproduct',{users:true,returnproducts})
    })
  }


  module.exports.returnOrderProductPost=async(req,res)=>{
    userhelpers.returnProduct(req.body,req.session.user._id).then(async()=>{
      let update=await userhelpers.updateReturnStatus(req.body.orderId,req.body.productID)
      res.redirect('/dashboard/order')
    })
  }


  module.exports.cancelOrderedProduct=(req,res)=>{
   
    userhelpers.cancelOrder(req.body.orderId,req.body.proId,req.session.user._id).then((response)=>{
      res.json(response)
    })
  }