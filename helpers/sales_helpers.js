var db = require('../config/connection')
var collection = require('../config/collection')
const { resolve, reject } = require('promise')
const { response } = require('../app')
const objectid = require('mongodb').ObjectId

module.exports={
    dailySalesReport:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                        $match:{
                            status:{$ne:"pending"},
                            trackOrder:{$ne:'Cancelled'}
                        }
                },
                {
                    $group:{
                            _id:"$date",
                            dailySaleAmount:{$sum:"$totalamount"},
                            count:{$sum:1}
                    }
                },
                {
                    $project:{
                        _id:1,
                        dailySaleAmount:1,
                        count:1,
                        
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                }
            ]).toArray().then((dailysales)=>{
                let totalamount =0
                dailysales.forEach(element => {
                    totalamount += element.dailySaleAmount
                });
                dailysales.totalamount=totalamount
                resolve(dailysales)
            })
        })
    },
    totalCustomers:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_HELPERS).find().count().then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    topSellingProducts:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:"$products"
                },
                {
                    $group:{_id:"$products.item","count":{$sum:"$products.quantity"}}
                },
                {
                    $sort:{"count":-1}
                },
                {
                    $limit:5
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_HELPERS,
                        localField:"_id",
                        foreignField:"_id",
                        as:"productdetails"
                    }
                }
            ]).toArray().then((response)=>{
               
                resolve(response)
            })
        })
    },
    monthlySalesreport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{
                        _id:"$month",
                        monthlysaleamount:{$sum:"$totalamount"},
                        count:{$sum:1}
                    }
                },
                {
                    $project:{
                        _id:1,
                        monthlysaleamount:1,
                        count:1
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                }
            ]).toArray().then((monthlysales)=>{
                let totalamount=0
                monthlysales.forEach(element=>{
                    totalamount+=element.monthlysaleamount
                })
                console.log(totalamount);
                monthlysales.totalamount=totalamount
                resolve(monthlysales)
            })
        })
    },
    yearlySalesReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{
                        _id:"$year",
                        yearlysalesreport:{$sum:"$totalamount"},
                        count:{$sum:1}
                    }
                },
                {
                    $project:{
                        _id:1,
                        yearlysalesreport:1,
                        count:1
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                }
            ]).toArray().then((yearlysales)=>{
                let totalamount=0;
                yearlysales.forEach(element=>{
                    totalamount+=element.yearlysalesreport
                })
                yearlysales.totalamount=totalamount
                resolve(yearlysales)
            })
        })
    }
}