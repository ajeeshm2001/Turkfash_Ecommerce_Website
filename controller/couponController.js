const coupon_helpers = require('../helpers/coupon_helpers')
var couponexist=""


module.exports.adminAddCoupon=(req,res)=>{
    res.render('admin/admin_addcoupon',{admin:true,couponexist})
    couponexist=""
  }

module.exports.adminAddCouponPost=(req,res)=>{
    coupon_helpers.addCoupon(req.body).then((response)=>{
      if(response.message){
        couponexist=response
        res.redirect('/admin/addcoupon')
      }else{
        couponexist=response
        res.redirect('/admin/addcoupon')
      }
    })
  
  }