var db = require('../config/connection')
var collection = require('../config/collection')
const { reject, resolve } = require('promise');
const objectid = require('mongodb').ObjectId
module.exports={
    addBanner:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).insertOne(category).then(()=>{
                resolve()
            })
        })
    },
    getAllbanners:()=>{
        return new Promise(async(resolve,reject)=>{
           let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
           console.log(banner);
           resolve(banner)
        
        })
    }
}