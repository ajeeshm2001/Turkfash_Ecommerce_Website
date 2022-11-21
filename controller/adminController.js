const saleshelpers = require('../helpers/sales_helpers');
const sales_helpers = require('../helpers/sales_helpers');
var producthelpers = require('../helpers/product_helpers')
const categoryhelpers = require('../helpers/category_helpers')
const product_helpers = require('../helpers/product_helpers')
const user_helpers = require('../helpers/user_helpers');
const { FlexFlowContext } = require('twilio/lib/rest/flexApi/v1/flexFlow');
let ad

const admin={
    email:"admin@gmail.com",
    password:"123"
  }

  module.exports.adminLogin=(req,res)=>{
    if(req.session.Adminlogg){
      res.redirect('/admin/adminpanel')
    }
    else{
      res.render('admin/admin_login',{aderr:req.session.logErr})
      req.session.logErr=""
    }
  }


  module.exports.adminLoginPost=(req,res)=>{
    console.log(req.body);
    if(admin.email===req.body.email&&admin.password===req.body.password){
      req.session.Adminlogg=true
      ad=req.session.Adminlogg
      res.redirect('/admin/adminpanel')
    }else{
      req.session.logErr="Invalid Username Or Password"
      res.redirect('/admin/adminlogin')
    }
  }


  module.exports.adminPanel=async function(req, res, next) {

    if(req.session.Adminlogg){
      let monthlysales = await saleshelpers.monthlySalesreport()
      let dailysales = await saleshelpers.dailySalesReport()
      let totalcustomers = await saleshelpers.totalCustomers()
      let topSelling = await saleshelpers.topSellingProducts()
      let yearlysales = await sales_helpers.yearlySalesReport()
      let todaycount
      let monthlyamount
      let todayamount
      if(dailysales[0]!=null&&monthlysales[0]!=null){
        todaycount = dailysales[0]
      monthlyamount = monthlysales[0].monthlysaleamount
      todayamount = dailysales[0].dailySaleAmount
      }else{
         todaycount = 0
        monthlyamount=0
        todayamount=0
      }
      
      
      res.render('admin/admin_dashboard',{admin:true,ad,dailysales,todaycount,totalcustomers,topSelling,monthlysales,yearlysales,monthlyamount,todayamount});
    }
    else{
      res.redirect('/admin/adminlogin')
    }
  }


  module.exports.adminViewProduct=(req,res)=>{
    if(req.session.Adminlogg){
      producthelpers.getAllProducts().then((products)=>{
        res.render('admin/admin_viewproducts',{admin:true,products,ad})
      })
    }
    else{
      res.redirect('/admin/adminlogin')
    } 
  }


  module.exports.adminAddProduct=async(req,res)=>{
    let brand = await categoryhelpers.getAllBrand()
    categoryhelpers.getAllCategories().then((cat)=>{
      res.render('admin/admin_addproduct',{admin:true,ad,cat,brand})
    })
    
  }


  module.exports.adminAddProductPost=(req,res)=>{
    const files =req.files
      const fileName = files.map((file)=>{
      return file.filename
    })
    const product = req.body
    product.img = fileName
    producthelpers.addProduct(product,(_id)=>{
      res.redirect('/admin/addproduct')    
    })
  }


  module.exports.deleteProducts=(req,res)=>{
    let productId=req.params.id
    producthelpers.deleteProduct(productId).then((response)=>{
      res.json(response)
    })
  }


  module.exports.editProductPage=async(req,res)=>{
    let product=await producthelpers.getProductdetail(req.params.id)
    let category = await categoryhelpers.getOneCategory(product.Category)
    let brand = await categoryhelpers.getOneBrand(product.brand)
    res.render('admin/admin_editproduct',{admin:true,product,category,brand})
  }


  module.exports.editProduct=(req,res)=>{
    producthelpers.getProductdetail(req.params.id).then((response)=>{
      if(req.files!=0){
        const files=req.files
        const fileName=files.map((file)=>{
          return file.filename
        })
        var product = req.body
        product.img=fileName
      }
      else{
        var product = req.body
        product.img=response.img
      }
      producthelpers.updateProduct(req.params.id,product).then((response)=>{
        res.redirect('/admin/viewproducts')
      })
    }) 
  }


  module.exports.adminLogOut=(req,res)=>{
    req.session.Adminlogg=false
    ad=false
    res.redirect('/admin/adminlogin')
  }

  module.exports.productOffer=async(req,res)=>{
    let products = await producthelpers.getAllProducts()
    res.render('admin/admin_productoffer',{admin:true,products})
  }


  module.exports.adminAddProductOffer=(req,res)=>{
    console.log(req.body);
    producthelpers.addProductOffer(req.body).then(()=>{
      res.json({status:true})
    })
  }


  module.exports.adminDeleteProductOffer=(req,res)=>{
    producthelpers.deleteProductOffer(req.body.productid).then((response)=>{
      res.json(response)
    })
  }


  module.exports.viewAllCategories=async(req,res)=>{
    let category = await categoryhelpers.getAllCategories()
     res.render('admin/admin_categoryoffer',{admin:true,category})
   }

   module.exports.addCategoryProductOffer=(req,res)=>{
    console.log(req.body);
    categoryhelpers.addCategoryOffer(req.body).then(()=>{
      res.json({status:true})
    })
  }

  module.exports.viewAllReturnOrder=(req,res)=>{
    product_helpers.viewAllReturn().then((orders)=>{
      res.render('admin/admin_returnorders',{admin:true,orders})
    })
  }


  module.exports.updateReturnOrder=(req,res)=>{
    user_helpers.approveReturn(req.body).then((data)=>{
      res.json(data)
    })
  }
