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


  module.exports.adminViewBanner=async(req,res)=>{
    let banner = await bannerhelpers.getAllbanners()
    banners=banner[0]
    res.render('admin/admin_viewbanner',{admin:true,banner,banners})
  }