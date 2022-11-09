const saleshelpers = require('../helpers/sales_helpers');
const sales_helpers = require('../helpers/sales_helpers');
var producthelpers = require('../helpers/product_helpers')
const categoryhelpers = require('../helpers/category_helpers')
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
      let todaycount = dailysales[0]
      let monthlyamount = monthlysales[0].monthlysaleamount
      let todayamount = dailysales[0].dailySaleAmount
      console.log('......................................');
      console.log(topSelling[0].productdetails);
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


  module.exports.adminAddProduct=(req,res)=>{
    categoryhelpers.getAllCategories().then((cat)=>{
      res.render('admin/admin_addproduct',{admin:true,ad,cat})
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
    res.render('admin/admin_editproduct',{admin:true,product})
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