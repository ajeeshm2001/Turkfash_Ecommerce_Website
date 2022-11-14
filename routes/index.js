var express = require("express");
var router = express.Router();
var userhelpers = require("../helpers/user_helpers");
const { userLoginPage, userSignUpPage, userSignUpPagePost, userLoginPagePost, userLogOut, userOtpLogin, userOtpSendCode, userOtpVerificationPage, userOtpVerification, userProductDetails, userViewCategory, userHomepage, userDashboard, userProfileUpdate, userPasswordUpdate, userAddAddress, userAddressDelete, userCoupons, searchProduct } = require("../controller/userController");
const paypal = require("paypal-rest-sdk");
const { addToCart, viewCart, changeProductQuantity, deleteCartProduct, userCartCount } = require("../controller/cartController");
const { viewWishlist, addProductsToWishlist, addProductToCartWishlist, orderSuccess } = require("../controller/wishlistController");
const { userPlaceOrder, userPlaceOrderPost, getOrderProduct, viewOrderProduct, returnProducts, returnOrderProduct, returnOrderProductPost, cancelOrderedProduct } = require("../controller/orderController");
const { razorpayPayment, paypalPayment, paypalPaymentSuccess, retryPayment, walletBalance } = require("../controller/paymentController");
const { response } = require("../app");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    process.env.PAYPAL_CLIENTID,
  client_secret:
    process.env.PAYPAL_SECRET,
});
const userSession = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};


/*... USER HOMEPAGE ...*/
router.get("/",userSession,userHomepage);

/*...  USER LOGIN PAGE ...*/
router.route("/login").get(userLoginPage).post(userLoginPagePost)

/*...  USER SIGNUP PAGE ...*/
router.route('/signup').get(userSignUpPage).post(userSignUpPagePost)

/*...  USER LOGOUT ...*/
router.get("/logout",userLogOut);

/*...  USER OTP LOGIN PAGE ...*/
router.get("/otplogin",userOtpLogin);

/*...  USER OTP SEND CODE ...*/
router.post("/sendcode",userOtpSendCode);

/*...  USER OTP VERIFICATION PAGE ...*/
router.get("/otpverification",userOtpVerificationPage);

/*...  USER OTP VERIFICATION PAGE ...*/
router.post("/verify",userOtpVerification);

/*...  USER PRODUCT DETAILS ...*/
router.get("/userproduct/:id",userProductDetails);

/*...  USER VIEW CATEGORY ...*/
router.get("/viewcategory/:id",userViewCategory);

/*...  USER ADD PRODUCT TO WISHLIST ...*/
router.get("/wishlist/:id",addProductsToWishlist);

/*...  USER WISHLIST ...*/
router.get("/wishlist", userSession,viewWishlist);

/*...  USER MOVE PRODUCT FROM WISHLIST TO CART ...*/
router.get("/addTocartwishlist/:id", userSession,addProductToCartWishlist);

/*...  DELETE WISHLIST PRODUCT ...*/
router.delete("/removewishlist",(req,res)=>{
  userhelpers.deleteWishlist(req.body.proId,req.session.user._id).then(()=>{
    res.json({status:true})
  })
  
});

/*...  USER ADD PRODUCT TO CART ...*/
router.get("/addtocart/:id",userSession,addToCart);

/*...  USER VIEW CART ...*/
router.get("/viewcart", userSession,viewCart);

/*...  CHANGE PRODUCT QUANTITY IN CART ...*/
router.put("/changequantity",changeProductQuantity);

/*...  DELETE CART PRODUCT ...*/
router.delete("/removeproduct",deleteCartProduct);

/*...  USER PLACE ORDER ...*/
router.get("/placeorder", userSession,userPlaceOrder);

/*...  USER PLACE ORDER POST ...*/
router.post("/placeorder/:total",userPlaceOrderPost);

/*...  USER DASHBOARD ...*/
router.get("/dashboard", userSession,userDashboard);

/*...  RAZORPAY PAYMENT ...*/
router.post("/verify-payment",razorpayPayment);

/*...  PAYPAL PAYMENT ...*/
router.post("/pay",paypalPayment );

/*...  PAYPAL PAYMENT SUCCESS ...*/
router.get('/success/:orderid',paypalPaymentSuccess);

/*...  USER PROFILE UPDATE ...*/
router.put('/profilechanges',userProfileUpdate)

/*...  USER PASSWORD UPDATE ...*/
router.patch('/updatepassword',userPasswordUpdate)

/*...  USER ADD ADDRESS ...*/
router.post('/addaddress',userAddAddress)

/*...  USER ADDRESS DELETE ...*/
router.delete('/deleteaddress/:id',userAddressDelete)

/*...  USER COUPONS ...*/
router.post('/coupon',userCoupons)

/*...  USER SEARCH PRODUCT ...*/
router.post('/search',searchProduct)

/*...  USER CART COUNT ...*/
router.get('/countcart',userCartCount)

/*...  USER ORDER SUCCESS PAGE ...*/
router.get('/ordersuccess',orderSuccess)


router.get("/getorderproduct/:id",getOrderProduct); 


router.get('/vieworderproducts/:id',viewOrderProduct)


router.get('/returnproduct/:id',returnProducts)


router.post('/retrypayment',retryPayment)


router.post('/walletbalance',walletBalance)


router.get('/returnorder/:orderId/:proId',returnOrderProduct)


router.post('/returnproduct',returnOrderProductPost)


router.post('/cancelorder',userSession,cancelOrderedProduct)


router.get('/hi',(req,res)=>{
  res.json(response)
})

module.exports = router;
