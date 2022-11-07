var db = require('../config/connection')
var collection = require('../config/collection');
const { reject, resolve } = require('promise');
const { addCategoryOffer } = require('./category_helpers');
const { NumberInstance } = require('twilio/lib/rest/pricing/v2/number');
const objectid = require('mongodb').ObjectId
module.exports={
    addProduct:(product,callback)=>{
        product.NewPrice=parseInt(product.NewPrice)
        console.log(product);
        db.get().collection(collection.PRODUCT_HELPERS).insertOne(product).then((data)=>{
           let cat= db.get().collection(collection.CATEGORY_HELPERS).find().toArray()
            // console.log(data);
          
            callback(data.insertedId,cat)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_HELPERS).find().toArray()
            
       
            resolve(products)
        })
    },
    deleteProduct:(productId)=>{
        let proid=objectid(productId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_HELPERS).deleteOne({_id:proid}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductdetail:(product)=>{
        let productid=objectid(product)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_HELPERS).findOne({_id:productid}).then((productdetail)=>{
                resolve(productdetail)
            })
        })
    },
    updateProduct:(proid,productdetails)=>{
        let productid=objectid(proid)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_HELPERS).updateOne({_id:productid},{$set:{
                Name:productdetails.Name,
                Description:productdetails.Description,
                Category:productdetails.Category,
                Size:productdetails.Size,
                Price:productdetails.Price,
                color:productdetails.color,
                img:productdetails.img
            }}).then((response)=>{
                resolve(response)
            })
        })
    },
    getAllProductsCa:(tshirt)=>{
        console.log(tshirt);
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_HELPERS).find({Category:tshirt}).toArray()
            console.log(products);
            resolve(products)
        })
    },
    addProductOffer:(product)=>{
        return new Promise(async(resolve,reject)=>{
            let b = parseInt(product.productOffer)
           let products  = await db.get().collection(collection.PRODUCT_HELPERS).findOne({_id:objectid(product.productId)})
           console.log(products);
           let offer = products.NewPrice-(products.NewPrice*(b/100))
           offer = Math.round(offer)
            db.get().collection(collection.PRODUCT_HELPERS).updateOne({_id:objectid(product.productId)},{$set:{productoffer:parseInt(product.productOffer),NewPrice:offer,OldPrice:parseInt(products.NewPrice)}
        
        }).then(()=>{
            
           resolve()
        })
    })},
    deleteProductOffer:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let product =await db.get().collection(collection.PRODUCT_HELPERS).findOne({_id:objectid(proId)})
            db.get().collection(collection.PRODUCT_HELPERS).updateMany({_id:objectid(proId)},
            {
                $set:{NewPrice:product.OldPrice},
                $unset:{OldPrice:1,productoffer:1}
            }).then(()=>{
                resolve()
            })
        })
    }
    // offerManagement:()=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collection.PRODUCT_HELPERS).aggregate([
    //             {
    //                 $lookup:{
    //                     from:collection.CATEGORY_HELPERS,
    //                     foreignField:'Name',
    //                     localField:'Category',
    //                     as:'discount'
    //                 }
    //             },
    //             {
    //                 $unwind:'$discount'
    //             },
    //             {
    //                 $addFields:{
    //                     discount:{
    //                         $cond:{
    //                             if:{
    //                                 $gt:[
    //                                     '$productoffer','$discount.categoryoffer'
    //                                 ]
    //                             },then:'$productoffer',else:'$discount.categoryoffer'
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $addFields:{
    //                     discountAmount:{
    //                         $round:{
    //                             $divide:[
    //                                 {
    //                                     $multiply:['$NewPrice','$discount']
    //                                 },100
    //                             ]
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $addFields:{
    //                     priceafterDiscount:{
    //                         $round:{
    //                             $subtract:['$NewPrice','$discountAmount']
    //                         }
    //                     }
    //                 }
    //             },
               
    //         ]).toArray().then((response)=>{
    //             if(response.discount!=0){
    //                 console.log("hello00000000000000000");
    //             }
    //             console.log(response);
    //             resolve(response)
    //         })
    //     })
    // }

}