const multer =  require('multer')

/*... PRODUCT IMAGE STORAGE ...*/
const storage = multer.diskStorage({
  destination:function(req,file,callback){
    callback(null,'public/pictures/productimages')
  },
  filename:function(req,file,cb){
    cb(null,file.originalname + '-' + Date.now())
  }
})

/*... BANNER IMAGE STRORAGE ...*/
const storage2 = multer.diskStorage({
  destination:function(req,file,callback){
    callback(null,'public/pictures/bannerimages')
  },
  filename:function(req,file,callback){
    callback(null,file.originalname + '-'+ Date.now())
  }
})

/*... CATEGORY IMAGE STORAGE ...*/
const storage3 = multer.diskStorage({
  destination:function(req,file,callback){
    callback(null,'public/pictures/categoryimages')
  },
  filename:function(req,file,callback){
    callback(null,file.originalname+ '-' +Date.now())
  }
})


/*... BANNER IMAGE STORAGE ...*/
const storage4=multer.diskStorage({
  destination:function(req,file,callback){
    callback(null,'public/pictures/brandimages')
  },
  filename:function(req,file,callback){
    callback(null,file.originalname+'-'+Date.now())
  }
  
})


const upload =multer({storage:storage})
const upload2 = multer({storage:storage2})
const upload3 = multer({storage:storage3})
const upload4 = multer({storage:storage4})

module.exports={
    upload,upload2,upload3,upload4
}