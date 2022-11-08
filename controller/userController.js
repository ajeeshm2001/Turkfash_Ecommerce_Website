var producthelpers = require("../helpers/product_helpers");
var userhelpers = require("../helpers/user_helpers");
var categoryhelpers = require("../helpers/category_helpers");
var bannerhelpers = require("../helpers/banner_helpers");
const { CART_HELPERS } = require("../config/collection");
const coupon_helpers = require("../helpers/coupon_helpers");

const client = require("twilio")(
  process.env.TWILIO_SID_KEY,
  process.env.TWILIO_SECRET_KEY
);
let ad
let s;
let otp;
let verify;
const userSession = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};


module.exports.userHomepage= async function (req, res, next) {
  let cartCount = 0;
  if (req.session.user) {
    cartCount = await userhelpers.getCartCount(req.session.user._id);
    wishlistCount = await userhelpers.getWishCount(req.session.user._id);
  }
  producthelpers.getAllProducts().then(async (products) => {
    // let offer =await producthelpers.offerManagement()
    console.log('fdggddhdhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
    let banner = await bannerhelpers.getAllbanners();
    categoryhelpers.getAllCategories().then((category) => {
      let user = req.session.user;
      console.log(user);
      res.render("user/user-homepage2", {
        category,
        products,
        user,
        s,
        cartCount,
        banner,
        wishlistCount,
      });
    });
  });
}


module.exports.userLoginPage=(req,res)=>{
    if(req.session.loggedIn){
      res.redirect('/')
    }else{
      res.render('user/user-login',{err:req.session.loggErr})
      req.session.loggErr=""
    }
    
  }


module.exports.userLoginPagePost=(req, res) => {
  userhelpers.doLogin(req.body).then((response) => {
    console.log(response);
    console.log(";;;;;;;;;;;;;;;;;;;;;;;;;;;");
    if (response.status && response.user.userstatus) {
      req.session.loggedIn = true;
      s = req.session.loggedIn;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loggErr = "Invalid Credentials";
      res.redirect("/login");
    }
  });
}



module.exports.userSignUpPage=(req, res) => {
  res.render("user/user-signup",{err:req.session.signuperr});
  req.session.signuperr=""
}


module.exports.userSignUpPagePost= (req, res) => {
  userhelpers.doSignup(req.body).then((data) => {
    console.log(data);
    if(data.status){
      res.redirect("/login");

    }else{
      req.session.signuperr=data.message
      res.redirect('/signup')
    }
  })
}


module.exports.userLogOut= (req, res) => {
  req.session.loggedIn = false;
  req.session.user = null;
  s = false;
  res.redirect("/login");
}

module.exports.userOtpLogin=(req, res) => {
  res.render("user/user-otplogin", { otperr: req.session.otperr });
  req.session.otperr = "";
}


module.exports.userOtpSendCode= (req, res) => {
  userhelpers.otpLogin(req.body.phonenumber).then((response, otpuser) => {
    if (response.otpstatus) {
      otp = req.body.phonenumber;
      client.verify
        .services(process.env.TWILIO_SERVICEID)
        .verifications.create({
          to: `+91${req.body.phonenumber}`,
          channel: "sms",
        })
        .then((data) => {
          req.session.user = response.otpuser;
          res.redirect("/otpverification");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      req.session.otperr = "User Does Not Exist";
      res.redirect("/otplogin");
    }
  });
}


module.exports.userOtpVerificationPage=(req, res) => {
  res.render("user/user-otpverification", { otpver: req.session.otpver });
  req.session.otpver = "";
}


module.exports.userOtpVerification=(req, res) => {
  client.verify
    .services(process.env.TWILIO_SERVICEID)
    .verificationChecks.create({
      to: `+91${otp}`,
      code: req.body.code,
    })
    .then((data) => {
      if (data.status === "approved") {
        req.session.loggedIn = true;
        s = req.session.loggedIn;
        res.redirect("/");
      } else {
        req.session.otpver = "Invalid Otp";
        res.redirect("/otpverification");
      }
    })
    .catch((err) => {
    });
}


module.exports.userProductDetails=async (req, res) => {
  let product = await producthelpers.getProductdetail(req.params.id);
  producthelpers.getAllProductsCa(product.Category).then((cate) => {
    let user = req.session.user;
    res.render("user/user-product", {users:true, product, user, cate });
  });
}


module.exports.userViewCategory=(req, res) => {
  producthelpers.getAllProductsCa(req.params.id).then((cate) => {
    res.render("user/user-viewcategory", {users:true, cate });
  });
}


module.exports.userDashboard=async (req, res) => {
  let address = await userhelpers.getAllAddress(req.session.user._id)
  let wallet = await userhelpers.getUserWallet(req.session.user._id)
  let wallets = wallet[0].balance
  console.log(address);
  userhelpers.getallOrders(req.session.user._id).then((orders) => {
    res.render("user/user-dashboard", { users:true,user: req.session.user, orders,address,wallet,wallets});
  });
}


module.exports.userProfileUpdate=(req,res)=>{
  userhelpers.updateDetails(req.body,req.session.user._id).then((response)=>{
    console.log(response);
    res.json(response)
  })
}


module.exports.userPasswordUpdate=(req,res)=>{
  userhelpers.updatePassword(req.body,req.session.user._id).then((data)=>{
    res.json(data)
  })
}


module.exports.userAddAddress=(req,res)=>{
  userhelpers.addAddress(req.body,req.session.user._id).then((data)=>{
    res.json(data)
  })
}


module.exports.userAddressDelete=(req,res)=>{
  userhelpers.deleteAddress(req.params.id).then((response)=>{
    res.json({status:true})
  })
}


module.exports.userCoupons=(req,res)=>{
  coupon_helpers.findCoupon(req.body,req.session.user._id).then((response)=>{
   res.json(response)
  })
 }


 module.exports.viewUsers=(req,res)=>{
  if(req.session.Adminlogg){
    userhelpers.getAllUsers().then((users)=>{
      res.render('admin/admin_viewusers',{admin:true,users,ad})
    })
  }else{
    res.redirect('/admin/adminlogin')
  }
}


module.exports.userBlock=(req,res)=>{
  let userId=req.params.id
  userhelpers.blockUser(userId).then((response)=>{
    res.json(response)
  })
}


module.exports.userUnblock=(req,res)=>{
  let unblock=req.params.id
  userhelpers.unblockUser(unblock).then((response)=>{
    res.json(response)
  })
}


module.exports.searchProduct=(req,res)=>{
  try{
    console.log(req.body);
    userhelpers.searchProduct(req.body.q).then((products)=>{
      console.log(products);
      res.render('user/user-searchproduct',{users:true,products})
    })
  }catch(err){
      res.send(err)
  }
}