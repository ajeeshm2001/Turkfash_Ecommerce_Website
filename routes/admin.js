var express = require('express');
var router = express.Router();
const categoryhelpers = require('../helpers/category_helpers')
const {upload, upload2, upload3, upload4} = require('../public/javascripts/fileupload');
const { adminLogin, adminLoginPost, adminPanel, adminViewProduct, adminAddProduct, adminAddProductPost, deleteProducts, editProductPage, editProduct, adminLogOut, productOffer, adminAddProductOffer, adminDeleteProductOffer, viewAllCategories, addCategoryProductOffer, viewAllReturnOrder, updateReturnOrder } = require('../controller/adminController');
const { viewUsers, userBlock, userUnblock } = require('../controller/userController');
const { addCategories, addCategoryPost, viewCategory, editCategory, editCategoryPost, deleteCategory } = require('../controller/categoryController');
const { adminAddBanner, adminAddBannerPost } = require('../controller/bannerController');
const { adminViewOrder, adminEditOrder } = require('../controller/orderController');
const { salesReport } = require('../controller/salesController');
const { adminAddCoupon, adminAddCouponPost } = require('../controller/couponController');
const product_helpers = require('../helpers/product_helpers');
const user_helpers = require('../helpers/user_helpers');
const banner_helpers = require('../helpers/banner_helpers');

/*... ADMIN LOGIN ...*/
router.route('/adminlogin').get(adminLogin).post(adminLoginPost)

/*... ADMIN LOGOUT ...*/
router.get('/adminlogout',adminLogOut)

/*... ADMIN PANEL ...*/
router.get('/adminpanel',adminPanel);

/*... ADMIN VIEW PRODUCT ...*/
router.get('/viewproducts',adminViewProduct)

/*... ADMIN ADD PRODUCT ...*/
router.route('/addproduct').get(adminAddProduct).post(upload.array('file'),adminAddProductPost)

/*... ADMIN DELETE PRODUCT ...*/
router.delete('/deleteproduct/:id',deleteProducts)

/*... ADMIN EDIT PRODUCT ...*/
router.route('/editproduct/:id').get(editProductPage).post(upload.array('file'),editProduct)

/*... VIEW USERS ...*/
router.get('/viewusers',viewUsers)

/*... USER BLOCK ...*/
router.put('/blockuser/:id',userBlock)

/*... USER UNBLOCK ...*/
router.put('/unblockuser/:id',userUnblock)

/*... ADMIN ADD CATEGORY ...*/
router.get('/addcategory',addCategories)

/*... ADMIN ADD CATEGORY POST ...*/
router.post('/addcategory',upload3.any('file'),addCategoryPost)

/*... ADMIN VIEW CATEGORY ...*/
router.get('/viewcategory',viewCategory)

/*... ADMIN DELETE  CATEGORY ...*/
router.delete('/deletecategory/:id',deleteCategory)

/*... ADMIN EDIT CATEGORY ...*/
router.get('/editcategory/:id',editCategory)

/*... ADMIN EDIT CATEGORY POST ...*/
router.post('/editcategory/:id',upload3.any('file'),editCategoryPost)

/*... ADMIN ADD BANNER ...*/
router.get('/addbanner',adminAddBanner)


router.get('/viewbanner',async(req,res)=>{
  let banner = await banner_helpers.getAllbanners()
  banners=banner[0]
  res.render('admin/admin_viewbanner',{admin:true,banner,banners})
})

/*... ADMIN ADD BANNER POST...*/
router.post('/addbanner',upload2.any('file'),adminAddBannerPost)

/*... ADMIN VIEW ORDER...*/
router.get('/viewallorders',adminViewOrder)

/*... ADMIN EDIT ORDER...*/
router.put('/editorder',adminEditOrder)

/*... ADMIN SALES REPORT ...*/
router.get('/salesreport',salesReport)

/*... ADMIN ADD COUPONS ...*/
router.route('/addcoupon').get(adminAddCoupon).post(adminAddCouponPost)

/*... ADMIN  PRODUCT OFFER ...*/
router.get('/productoffer',productOffer)

/*... ADMIN ADD PRODUCT OFFER ...*/
router.put('/addoffer',adminAddProductOffer)

/*... ADMIN DELETE PRODUCT OFFER ...*/
router.delete('/deleteoffer',adminDeleteProductOffer)


router.get('/categoryoffer',viewAllCategories)


router.put('/addcategoryoffer',addCategoryProductOffer)


router.get('/viewreturnorder',viewAllReturnOrder)


router.post('/updatereturn',updateReturnOrder)
  

router.get('/select',(req,res)=>{
  console.log(req.query.carlist);
})


router.get('/addbrand',(req,res)=>{
  res.render('admin/admin_addbrand',{admin:true})
})

router.post('/addbrand',upload4.any('file'),(req,res)=>{
  const brand = req.body
    brand.img = req.files[0].filename
  categoryhelpers.addBrand(brand).then(()=>{
    res.redirect('/admin/addbrand')

  })
})
  
module.exports = router;
