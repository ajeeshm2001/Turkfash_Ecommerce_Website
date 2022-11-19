var db = require('../config/connection')
var collection = require('../config/collection')
const { reject, resolve } = require('promise');
const objectid = require('mongodb').ObjectId
module.exports={
    addCategory:(category,callback)=>{
        db.get().collection(collection.CATEGORY_HELPERS).insertOne(category).then(()=>{
            callback()
        })
    },
    getAllCategories:()=>{
        return new Promise((resolve,reject)=>{
            let category = db.get().collection(collection.CATEGORY_HELPERS).find().toArray()
            console.log(category);
            resolve(category)
        })
    },
    deleteCategory:(categoryid)=>{
        let catid=objectid(categoryid)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_HELPERS).deleteOne({_id:catid}).then((response)=>{
                resolve(response)
            })
        })
    },
    getCategorydetail:(categoryid)=>{
        let catid=objectid(categoryid)
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.CATEGORY_HELPERS).findOne({_id:catid}).then((cat)=>{
            resolve(cat)
           })
           
        })
    },
    updateCategory:(catid,category)=>{
        let categoryid=objectid(catid)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_HELPERS).updateOne({_id:categoryid},{$set:{
                Name:category.Name,
                img:category.img

            }}).then((response)=>{
                resolve(response)
            })
        })
    },
    addCategoryOffer:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_HELPERS).updateOne({_id:objectid(category.catId)},{$set:{categoryoffer:parseInt(category.catOffer)}}).then(()=>{
                resolve()
            })
        })
    },
    addBrand:(brand)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).insertOne(brand).then(()=>{
                resolve()
            })
        })
    },
    getAllBrand:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BRAND_COLLECTION).find().toArray().then((data)=>{
                resolve(data)
            })
        })
    },
    getBrandProducts:(brand)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_HELPERS).find({brand:brand}).toArray().then((data)=>{
                resolve(data)
            })
        })
    }
}