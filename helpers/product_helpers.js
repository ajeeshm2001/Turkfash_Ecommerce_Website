var db = require('../config/connection')
var collection = require('../config/collection');
const { reject, resolve } = require('promise');
const { addCategoryOffer } = require('./category_helpers');
const { NumberInstance } = require('twilio/lib/rest/pricing/v2/number');
const objectid = require('mongodb').ObjectId
module.exports={
    addProduct:(product,callback)=>{
        product.NewPrice=parseInt(product.NewPrice)
        product.stock=parseInt(product.stock)
        db.get().collection(collection.PRODUCT_HELPERS).insertOne(product).then((data)=>{
           let cat= db.get().collection(collection.CATEGORY_HELPERS).find().toArray()
            callback(data.insertedId,cat)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCT_HELPERS).find().toArray().then((products)=>{
                resolve(products)
            })
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
           if(products.productoffer){
            let offer = products.OldPrice-(products.OldPrice*(b/100))
            offer = Math.round(offer)
            db.get().collection(collection.PRODUCT_HELPERS).updateOne({_id:objectid(product.productId)},{$set:{productoffer:parseInt(product.productOffer),NewPrice:parseInt(offer),OldPrice:parseInt(products.OldPrice)}
        
        }).then(()=>{
            
           resolve()
        })
           }else{
            let offer = products.NewPrice-(products.NewPrice*(b/100))
            offer = Math.round(offer)
            console.log(offer);
            db.get().collection(collection.PRODUCT_HELPERS).updateOne({_id:objectid(product.productId)},{$set:{productoffer:parseInt(product.productOffer),NewPrice:parseInt(offer),OldPrice:parseInt(products.NewPrice)}
        
        }).then(()=>{
            
           resolve()
        })
           }
          
            
    })},
    deleteProductOffer:(proId)=>{
        let response={}
        return new Promise(async(resolve,reject)=>{
            let product =await db.get().collection(collection.PRODUCT_HELPERS).findOne({_id:objectid(proId)})
            if(product.productoffer){
                db.get().collection(collection.PRODUCT_HELPERS).updateMany({_id:objectid(proId)},
            {
                $set:{NewPrice:product.OldPrice},
                $unset:{OldPrice:1,productoffer:1}
            }).then(()=>{
                response.status=true
                resolve(response)
            })
            }else{
                response.status=false
                resolve(response)
            }
            
        })
    },
    viewAllReturn:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.RETURN_COLLECTION).aggregate([
                {
                    $lookup:{
                        from:collection.ORDER_COLLECTION,
                        localField:'orderId',
                        foreignField:'_id',
                        as:'orderdetails'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_HELPERS,
                        localField:'productID',
                        foreignField:'_id',
                        as:'productdetails'
                    }
                },
                {
                    $unwind:'$orderdetails'
                },
        
                {
                    $unwind:'$productdetails'
                },
                {
                    $sort:{
                        time:-1
                    }
                }
               
               
            ]).toArray().then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    getPaginatedProducts:(limit,skip)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_HELPERS).find().limit(limit).skip(skip).toArray().then((data)=>{
                resolve(data)
            })
        })
    }

}