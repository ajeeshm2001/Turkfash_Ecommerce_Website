const bannerhelpers = require('../helpers/banner_helpers')


module.exports.adminAddBanner=(req,res)=>{
    res.render('admin/admin_addbanner',{admin:true})
  }


module.exports.adminAddBannerPost=(req,res)=>{
    const bannerdetails = req.body
    bannerdetails.img = req.files[0].filename
    console.log(bannerdetails);
    bannerhelpers.addBanner(bannerdetails).then(()=>{
      res.redirect('/admin/addbanner')
    })
  }