const { response } = require('../app')
const fs = require('fs')
const categoryhelpers = require('../helpers/category_helpers')


module.exports.addCategories=(req,res)=>{
    res.render('admin/admin_addcategory',{admin:true})
  }

module.exports.addCategoryPost=(req,res)=>{
    const category = req.body
    category.img = req.files[0].filename
    categoryhelpers.addCategory(category,()=>{
      res.redirect('/admin/addcategory')
    })
  }


  module.exports.viewCategory=(req,res)=>{
    categoryhelpers.getAllCategories().then((category)=>{
      res.render('admin/admin_viewcategories',{admin:true,category})
    })
  }


  module.exports.deleteCategory=async(req,res)=>{
  //   fs.unlink(req.files.path, function (err) {
  //     if (err) console.error(err);
  // });
    let categoryid=req.params.id
    categoryhelpers.deleteCategory(categoryid).then((response)=>{
      res.json(response)
    })
  }


  module.exports.editCategory=async(req,res)=>{
    let viewcategory=await categoryhelpers.getCategorydetail(req.params.id)
      res.render('admin/admin_editcategory',{admin:true,viewcategory})
  }


  module.exports.editCategoryPost=(req,res)=>{
    console.log(req.body);
    console.log(req.files);
    
    categoryhelpers.getCategorydetail(req.params.id).then((response)=>{
      let categorydetails
      if(req.files!=0){
        categorydetails = req.body
        categorydetails.img = req.files[0].filename
      }
      else{
        categorydetails = req.body
        categorydetails.img = response.img
      }

      categoryhelpers.updateCategory(req.params.id,categorydetails).then((response)=>{
        res.redirect('/admin/viewcategory')
        // if(req.files.file){
        //   let _id=req.params.id
        //   let image=req.files.file
        //   image.mv('public/category-images/'+_id+'.jpg')
          
        // }
      })
    })


    
  }