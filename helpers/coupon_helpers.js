var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { resolve, reject } = require("promise");
const { response } = require("../app");
const objectid = require("mongodb").ObjectId;

module.exports={
    addCoupon:(details)=>{
        Coupons={
            couponname:details.couponname,
            offer:parseInt(details.offer),
            users:[]

        }
        return new Promise(async(resolve,reject)=>{
            let couponfind=await db.get().collection(collection.COUPON_COLLECTION).findOne({couponname:details.couponname})
        console.log(couponfind);
            if(couponfind){
                let message="Coupon Name Already Exist"
                resolve(message)
                
            }else{
                db.get().collection(collection.COUPON_COLLECTION).insertOne(Coupons).then((response)=>{
                    let message=""
                    resolve(message)
                })
            }
            
        })
    },
    findCoupon:(coupon,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
           let couponname = await  db.get().collection(collection.COUPON_COLLECTION).findOne({couponname:coupon.coupon})

           if(couponname){
            
                let usercoupon = await db.get().collection(collection.COUPON_COLLECTION).find({couponname:coupon.coupon,users:{$in:[userId]}}).toArray()
                console.log('...........................');
                console.log(usercoupon);
                if(usercoupon[0]){
                    response.message="Coupon Already Applied"
                    response.status=false
                    resolve(response)
                }else{
                    // db.get().collection(collection.COUPON_COLLECTION).updateOne({couponname:coupon.coupon},{
                    //     $push:{users:userId}
                    // })
                    response.couponoffer=couponname.offer
                    response.message="Coupon Applied"
                    response.status=true
                    resolve(response)
                }
                
           }else{
            response.message="Invalid Coupon"
            response.status=false
            resolve(response)
           }
        })
    },
    getAllcoupon:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    userCouponPush:(coupon,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).updateOne({couponname:coupon},{
                $push:{users:userId}
            }).then(()=>{
                resolve()
            })
        })
    }
}