var express = require('express');
var router = express.Router();
const categoryhelpers = require('../helpers/category_helpers')
const {upload, upload2, upload3} = require('../public/javascripts/fileupload');
const { adminLogin, adminLoginPost, adminPanel, adminViewProduct, adminAddProduct, adminAddProductPost, deleteProducts, editProductPage, editProduct, adminLogOut, productOffer, adminAddProductOffer, adminDeleteProductOffer } = require('../controller/adminController');
const { viewUsers, userBlock, userUnblock } = require('../controller/userController');
const { addCategories, addCategoryPost, viewCategory, editCategory, editCategoryPost, deleteCategory } = require('../controller/categoryController');
const { adminAddBanner, adminAddBannerPost } = require('../controller/bannerController');
const { adminViewOrder, adminEditOrder } = require('../controller/orderController');
const { salesReport } = require('../controller/salesController');
const { adminAddCoupon, adminAddCouponPost } = require('../controller/couponController');
const product_helpers = require('../helpers/product_helpers');
const user_helpers = require('../helpers/user_helpers');

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




router.get('/categoryoffer',async(req,res)=>{
 let category = await categoryhelpers.getAllCategories()
  res.render('admin/admin_categoryoffer',{admin:true,category})
})


router.put('/addcategoryoffer',(req,res)=>{
  console.log(req.body);
  categoryhelpers.addCategoryOffer(req.body).then(()=>{
    res.json({status:true})
  })
})



router.get('/viewreturnorder',(req,res)=>{
  product_helpers.viewAllReturn().then((orders)=>{
    console.log(orders);
    res.render('admin/admin_returnorders',{admin:true,orders})
  })
})


router.post('/updatereturn',(req,res)=>{
  user_helpers.approveReturn(req.body).then((data)=>{
    res.redirect('/admin/viewreturnorder')
  })
})
  

router.get('/select',(req,res)=>{
  console.log(req.query.carlist);
})

  
module.exports = router;
