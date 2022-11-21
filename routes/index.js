var express = require("express");
var router = express.Router();
var userhelpers = require("../helpers/user_helpers");
const { userLoginPage, userSignUpPage, userSignUpPagePost, userLoginPagePost, userLogOut, userOtpLogin, userOtpSendCode, userOtpVerificationPage, userOtpVerification, userProductDetails, userViewCategory, userHomepage, userDashboard, userProfileUpdate, userPasswordUpdate, userAddAddress, userAddressDelete, userCoupons, searchProduct, paginationProduct } = require("../controller/userController");
const paypal = require("paypal-rest-sdk");
const { addToCart, viewCart, changeProductQuantity, deleteCartProduct, userCartCount } = require("../controller/cartController");
const { viewWishlist, addProductsToWishlist, addProductToCartWishlist, orderSuccess, deleteWishlistProducts } = require("../controller/wishlistController");
const { userPlaceOrder, userPlaceOrderPost, getOrderProduct, viewOrderProduct, returnProducts, returnOrderProduct, returnOrderProductPost, cancelOrderedProduct } = require("../controller/orderController");
const { razorpayPayment, paypalPayment, paypalPaymentSuccess, retryPayment, walletBalance } = require("../controller/paymentController");
const { response } = require("../app");
const { viewBrandProduct } = require("../controller/categoryController");

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

const cartSession =async (req,res,next)=>{
  if(req.session.loggedIn){
    let cartCount = await userhelpers.getCartCount(req.session.user._id);
    let wishlistCount = await userhelpers.getWishCount(req.session.user._id);
    res.locals.cartCount=cartCount
    res.locals.wishlistCount=wishlistCount
    next()
  }else{
    res.redirect('/login')
  }
}


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
router.get("/userproduct/:id",cartSession,userProductDetails);

/*...  USER VIEW CATEGORY ...*/
router.get("/viewcategory/:id",userSession,cartSession,userViewCategory);

/*...  USER ADD PRODUCT TO WISHLIST ...*/
router.get("/wishlist/:id",addProductsToWishlist);

/*...  USER WISHLIST ...*/
router.get("/wishlist", userSession,cartSession,viewWishlist);

/*...  USER MOVE PRODUCT FROM WISHLIST TO CART ...*/
router.get("/addTocartwishlist/:id", userSession,addProductToCartWishlist);

/*...  DELETE WISHLIST PRODUCT ...*/
router.delete("/removewishlist",deleteWishlistProducts);

/*...  USER ADD PRODUCT TO CART ...*/
router.get("/addtocart/:id",addToCart);

/*...  USER VIEW CART ...*/
router.get("/viewcart", userSession,cartSession,viewCart);

/*...  CHANGE PRODUCT QUANTITY IN CART ...*/
router.put("/changequantity",changeProductQuantity);

/*...  DELETE CART PRODUCT ...*/
router.delete("/removeproduct",deleteCartProduct);

/*...  USER PLACE ORDER ...*/
router.get("/placeorder", userSession,cartSession,userPlaceOrder);

/*...  USER PLACE ORDER POST ...*/
router.post("/placeorder/:total",cartSession,userPlaceOrderPost);

/*...  USER DASHBOARD ...*/
router.get("/dashboard/:url", userSession,cartSession,userDashboard);

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
router.post('/search',userSession,cartSession,searchProduct)

/*...  USER CART COUNT ...*/
router.get('/countcart',userCartCount)

/*...  USER ORDER SUCCESS PAGE ...*/
router.get('/ordersuccess',userSession,cartSession,orderSuccess)

/*...  USER GET ORDER PRODUCTS ...*/
router.get("/getorderproduct/:id",cartSession,getOrderProduct); 

/*...  USER VIEW ORDER PRODUCTS ...*/
router.get('/vieworderproducts/:id',cartSession,viewOrderProduct)

/*...  USER RETURN ORDER PRODUCTS ...*/
router.get('/returnproduct/:id',cartSession,returnProducts)

/*...  USER RETRY PAYMENT ...*/
router.post('/retrypayment',retryPayment)

/*...  USER WALLET BALANCE ...*/
router.post('/walletbalance',walletBalance)

/*...  USER RETURN ORDER PRODUCT ...*/
router.get('/returnorder/:orderId/:proId',cartSession,returnOrderProduct)

/*...  USER RETURN ORDER PRODUCT POST ...*/
router.post('/returnproduct',returnOrderProductPost)

/*...  USER CANCEL PRODUCT ...*/
router.post('/cancelorder',userSession,cancelOrderedProduct)

/*...  USER VIEW BRAND PRODUCT ...*/
router.get('/viewbrandproduct/:name',userSession,cartSession,viewBrandProduct)

/*...  USER PAGINATION VIEW ...*/
router.get('/pagination/',userSession,cartSession,paginationProduct)


router.get('/hi',(req,res)=>{
  res.json(response)
})
module.exports = router;
