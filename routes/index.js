var express = require("express");
var router = express.Router();
var userhelpers = require("../helpers/user_helpers");
const { userLoginPage, userSignUpPage, userSignUpPagePost, userLoginPagePost, userLogOut, userOtpLogin, userOtpSendCode, userOtpVerificationPage, userOtpVerification, userProductDetails, userViewCategory, userHomepage, userDashboard, userProfileUpdate, userPasswordUpdate, userAddAddress, userAddressDelete, userCoupons, searchProduct } = require("../controller/userController");
const paypal = require("paypal-rest-sdk");
const { addToCart, viewCart, changeProductQuantity, deleteCartProduct, userCartCount } = require("../controller/cartController");
const { viewWishlist, addProductsToWishlist, addProductToCartWishlist, orderSuccess, deleteWishlistProducts } = require("../controller/wishlistController");
const { userPlaceOrder, userPlaceOrderPost, getOrderProduct, viewOrderProduct, returnProducts, returnOrderProduct, returnOrderProductPost, cancelOrderedProduct } = require("../controller/orderController");
const { razorpayPayment, paypalPayment, paypalPaymentSuccess, retryPayment, walletBalance } = require("../controller/paymentController");
const { response } = require("../app");
const category_helpers = require("../helpers/category_helpers");
const product_helpers = require("../helpers/product_helpers");

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
router.get("/viewcategory/:id",userSession,userViewCategory);

/*...  USER ADD PRODUCT TO WISHLIST ...*/
router.get("/wishlist/:id",addProductsToWishlist);

/*...  USER WISHLIST ...*/
router.get("/wishlist", userSession,viewWishlist);

/*...  USER MOVE PRODUCT FROM WISHLIST TO CART ...*/
router.get("/addTocartwishlist/:id", userSession,addProductToCartWishlist);

/*...  DELETE WISHLIST PRODUCT ...*/
router.delete("/removewishlist",deleteWishlistProducts);

/*...  USER ADD PRODUCT TO CART ...*/
router.get("/addtocart/:id",addToCart);

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
router.get("/dashboard/:url", userSession,userDashboard);

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
router.post('/search',userSession,searchProduct)

/*...  USER CART COUNT ...*/
router.get('/countcart',userCartCount)

/*...  USER ORDER SUCCESS PAGE ...*/
router.get('/ordersuccess',userSession,orderSuccess)

/*...  USER GET ORDER PRODUCTS ...*/
router.get("/getorderproduct/:id",getOrderProduct); 

/*...  USER VIEW ORDER PRODUCTS ...*/
router.get('/vieworderproducts/:id',viewOrderProduct)

/*...  USER RETURN ORDER PRODUCTS ...*/
router.get('/returnproduct/:id',returnProducts)

/*...  USER RETRY PAYMENT ...*/
router.post('/retrypayment',retryPayment)

/*...  USER WALLET BALANCE ...*/
router.post('/walletbalance',walletBalance)

/*...  USER RETURN ORDER PRODUCT ...*/
router.get('/returnorder/:orderId/:proId',returnOrderProduct)

/*...  USER RETURN ORDER PRODUCT POST ...*/
router.post('/returnproduct',returnOrderProductPost)

/*...  USER CANCEL PRODUCT ...*/
router.post('/cancelorder',userSession,cancelOrderedProduct)


router.get('/hi',(req,res)=>{
  res.json(response)
})


router.get('/viewbrandproduct/:name',userSession,(req,res)=>{
  category_helpers.getBrandProducts(req.params.name).then((products)=>{
    res.render('user/user-viewbrand',{products,length:products.length,users:true,userheadz:true,user:req.session.user})
  })
})


router.get('/pagination/',userSession,(req,res)=>{
  product_helpers.getAllProducts().then(async(data)=>{
    const page = parseInt(req.query.page)
    const limit = parseInt(5)
    const startIndex = (page-1)*limit
    const endIndex = page*limit
    const products={}
    if(endIndex<data.length){
      products.next={
        page:page+1,
        limit:limit
      }
    }
    
    if(startIndex>0){
      products.previous={
        page:page-1,
        limit:limit
      }
    }
    let length = data.length

    products.products=await product_helpers.getPaginatedProducts(limit,startIndex)
    products.pagecount=Math.ceil(parseInt(data.length)/limit)
    products.pages = Array.from({length:products.pagecount},(_,i)=>
      i+1
    )
    products.currentpage=page

    console.log(products.pages);

    let pagproducts=products.products
    let pages = products.pages
    
    res.render('user/user-paginationproducts',{userheadz:true,users:true,pagproducts,pages,products,length,limit,user:req.session.user})
  })
})
module.exports = router;
