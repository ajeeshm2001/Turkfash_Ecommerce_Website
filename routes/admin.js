var express = require('express');
var router = express.Router();
const categoryhelpers = require('../helpers/category_helpers')
const {upload, upload2, upload3, upload4} = require('../public/javascripts/fileupload');
const { adminLogin, adminLoginPost, adminPanel, adminViewProduct, adminAddProduct, adminAddProductPost, deleteProducts, editProductPage, editProduct, adminLogOut, productOffer, adminAddProductOffer, adminDeleteProductOffer, viewAllCategories, addCategoryProductOffer, viewAllReturnOrder, updateReturnOrder } = require('../controller/adminController');
const { viewUsers, userBlock, userUnblock } = require('../controller/userController');
const { addCategories, addCategoryPost, viewCategory, editCategory, editCategoryPost, deleteCategory, adminAddBrand, adminAddBrandPost } = require('../controller/categoryController');
const { adminAddBanner, adminAddBannerPost, adminViewBanner } = require('../controller/bannerController');
const { adminViewOrder, adminEditOrder } = require('../controller/orderController');
const { salesReport } = require('../controller/salesController');
const { adminAddCoupon, adminAddCouponPost } = require('../controller/couponController');
const product_helpers = require('../helpers/product_helpers');
const user_helpers = require('../helpers/user_helpers');
const banner_helpers = require('../helpers/banner_helpers');

const adminSession=(req,res,next)=>{
  if (req.session.Adminlogg){
    next()
  }
  else{
    res.redirect('/admin/adminlogin')
  }
}

/*... ADMIN LOGIN ...*/
router.route('/adminlogin').get(adminLogin).post(adminLoginPost)

/*... ADMIN LOGOUT ...*/
router.get('/adminlogout',adminLogOut)

/*... ADMIN PANEL ...*/
router.get('/adminpanel',adminSession,adminPanel);

/*... ADMIN VIEW PRODUCT ...*/
router.get('/viewproducts',adminSession,adminViewProduct)

/*... ADMIN ADD PRODUCT ...*/
router.route('/addproduct').get(adminSession,adminAddProduct).post(upload.array('file'),adminAddProductPost)

/*... ADMIN DELETE PRODUCT ...*/
router.delete('/deleteproduct/:id',deleteProducts)

/*... ADMIN EDIT PRODUCT ...*/
router.route('/editproduct/:id').get(adminSession,editProductPage).post(upload.array('file'),editProduct)

/*... VIEW USERS ...*/
router.get('/viewusers',adminSession,viewUsers)

/*... USER BLOCK ...*/
router.put('/blockuser/:id',userBlock)

/*... USER UNBLOCK ...*/
router.put('/unblockuser/:id',userUnblock)

/*... ADMIN ADD CATEGORY ...*/
router.get('/addcategory',adminSession,addCategories)

/*... ADMIN ADD CATEGORY POST ...*/
router.post('/addcategory',upload3.any('file'),addCategoryPost)

/*... ADMIN VIEW CATEGORY ...*/
router.get('/viewcategory',adminSession,viewCategory)

/*... ADMIN DELETE  CATEGORY ...*/
router.delete('/deletecategory/:id',adminSession,deleteCategory)

/*... ADMIN EDIT CATEGORY ...*/
router.get('/editcategory/:id',adminSession,editCategory)

/*... ADMIN EDIT CATEGORY POST ...*/
router.post('/editcategory/:id',upload3.any('file'),editCategoryPost)

/*... ADMIN ADD BANNER ...*/
router.get('/addbanner',adminSession,adminAddBanner)

/*... ADMIN VIEW BANNER ...*/
router.get('/viewbanner',adminSession,adminViewBanner)

/*... ADMIN ADD BANNER POST...*/
router.post('/addbanner',upload2.any('file'),adminAddBannerPost)

/*... ADMIN VIEW ORDER...*/
router.get('/viewallorders',adminSession,adminViewOrder)

/*... ADMIN EDIT ORDER...*/
router.put('/editorder',adminSession,adminEditOrder)

/*... ADMIN SALES REPORT ...*/
router.get('/salesreport',adminSession,salesReport)

/*... ADMIN ADD COUPONS ...*/
router.route('/addcoupon').get(adminSession,adminAddCoupon).post(adminAddCouponPost)

/*... ADMIN  PRODUCT OFFER ...*/
router.get('/productoffer',adminSession,productOffer)

/*... ADMIN ADD PRODUCT OFFER ...*/
router.put('/addoffer',adminAddProductOffer)

/*... ADMIN DELETE PRODUCT OFFER ...*/
router.delete('/deleteoffer',adminDeleteProductOffer)

/*... ADMIN ADD CATEGORY OFFER ...*/
router.get('/categoryoffer',adminSession,viewAllCategories)

/*... ADMIN VIEW ALL RETURN ORDERS ...*/
router.put('/addcategoryoffer',adminSession,addCategoryProductOffer)

/*... ADMIN VIEW ALL RETURN ORDERS ...*/
router.get('/viewreturnorder',adminSession,viewAllReturnOrder)

/*... ADMIN UPDATE RETURN ORDER ...*/
router.post('/updatereturn',adminSession,updateReturnOrder) 

/*... ADMIN ADD BRAND ...*/
router.get('/addbrand',adminSession,adminAddBrand)

/*... ADMIN ADD BRAND POST ...*/
router.post('/addbrand',upload4.any('file'),adminAddBrandPost)


router.get('/select',(req,res)=>{
  console.log(req.query.carlist);
})
  
module.exports = router;
