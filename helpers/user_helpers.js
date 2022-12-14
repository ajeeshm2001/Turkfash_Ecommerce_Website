var db = require("../config/connection");
const shortid = require('shortid');
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { resolve, reject } = require("promise");
const { response } = require("../app");
const objectid = require("mongodb").ObjectId;
const Razorpay = require('razorpay');
const { timeStamp } = require("console");
const { rejects } = require("assert");
const { Transaction } = require("mongodb");
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret:process.env.RAZORPAY_SECRETKEY,
  });   
module.exports = {
    doSignup: (userData) => {
        let response={}
        return new Promise(async (resolve, reject) => {
            let useremail = await db.get().collection(collection.USER_HELPERS).findOne({email:userData.email})
            if(useremail){
                response.status=false
                response.message="Email Already Exist"
                resolve(response)
            }else{
                if(userData.referral){
                    let referral =await  db.get().collection(collection.USER_HELPERS).findOne({referral:userData.referral})
                    if(referral){
                        let datez = new Date()
                        let timez = datez.toLocaleTimeString('en-US')
                        day =datez.getDate()
            
                        month =datez.getMonth()+1
                        year = datez.getFullYear()
                        let date = `${day}-${month}-${year}`
                        let transaction={
                            credit:100,
                            debit:0,
                            message:"Refferral Amount",
                            date:new Date(),
                            datez:date,
                            time:timez
                        }
                        let wallet =await db.get().collection(collection.WALLET_COLLECTION).findOne({user:referral._id})
                        if(wallet){
                            let hello  = wallet.balance+100
                            db.get().collection(collection.WALLET_COLLECTION).updateOne({user:referral._id},
                                {
                                    $set:{
                                        balance:hello
                                        
                                            
                                        
                                    },
                                    $push:{
                                        transaction:transaction
                                    }
                                }
                                ,)
                        }else{
                            let wallet ={
                                user:referral._id,
                                balance:100,
                                transaction:[transaction]
                            }
                            db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet)

                        }
                        // let wallet=[walletObj]
                        //  let wallet = referral.wallet+100
                        // db.get().collection(collection.USER_HELPERS).updateOne({_id:referral._id},{$push:{wallet:walletObj}})
                        userData.password = await bcrypt.hash(userData.password, 10);
                    userData.referral=shortid.generate()
                 
                    let transactions={
                        credit:50,
                        debit:0,
                        datez:date,
                        date:new Date(),
                        time:timez,
                        message:"Refferral Amount"
                    }
                    
                    
                    // let rwallet={
                    //     credit:50,
                    //     debit:0,
                    //     date:new Date(),
                    //     newbalance:50
                    // }
                    // userData.wallet=[rwallet]
                    // userData.wallet = 50
                    // userdatawallet=[wallets]
                    // userData.wallet=userdatawallet
                    userData.userstatus = true;
                    db.get()
                        .collection(collection.USER_HELPERS)
                        .insertOne(userData)
                        .then((data) => {
                            response.data=data
                            response.status=true
                            db.get().collection(collection.USER_HELPERS).findOne({email:userData.email}).then(async(data)=>{
                                let wallet ={
                                    user:data._id,
                                    balance:50,
                                    transaction:[transactions]
                                }
                                db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet)
                                
                            })
                            resolve(response);
                        });
                        
                    }else{
                        response.message="Referral Code Doesn't Exist"
                        response.status=false
                        resolve(response)
                    }
                    
    
                }else{
                    userData.password = await bcrypt.hash(userData.password, 10);
                userData.referral=shortid.generate()
                userData.userstatus = true;
                db.get()
                    .collection(collection.USER_HELPERS)
                    .insertOne(userData)
                    .then((data) => {
                        
                        response.data=data
                        response.status=true
                        db.get().collection(collection.USER_HELPERS).findOne({email:userData.email}).then(async(data)=>{
                            let wallet ={
                                user:data._id,
                                balance:0,
                                transaction:[]
                            }
                            console.log(wallet);
                            let b = await db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet)
                            console.log('////////////...........,,,,,,,,,,');
                            console.log(b);
                        })
                       
                        resolve(response);
                    });
                }
            }
          

            
        });
    },
    doLogin: (userDetails) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db
                .get()
                .collection(collection.USER_HELPERS)
                .findOne({ email: userDetails.email });
            if (user) {
                console.log(user);
                bcrypt.compare(userDetails.password, user.password).then((status) => {
                    if (status) {
                        console.log("Login Success");
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        console.log("Login Failed");
                        resolve({ status: false });
                    }
                });
            } else {
                console.log("Login Faileddddd");
                resolve({ status: false });
            }
        });
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db
                .get()
                .collection(collection.USER_HELPERS)
                .find()
                .toArray();
            resolve(users);
        });
    },
    blockUser: (userId) => {
        let uid = objectid(userId);
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.USER_HELPERS)
                .updateOne({ _id: uid }, { $set: { userstatus: false } })
                .then((blockuser) => {
                    resolve(blockuser);
                });
        });
    },
    unblockUser: (unblock) => {
        let uuid = objectid(unblock);
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.USER_HELPERS)
                .updateOne({ _id: uuid }, { $set: { userstatus: true } })
                .then((unblockuser) => {
                    resolve(unblockuser);
                });
        });
    },
    otpLogin: (otpuserdetails) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let otpuser = await db
                .get()
                .collection(collection.USER_HELPERS)
                .findOne({ number: otpuserdetails });
            if (otpuser) {
                response.otpuser = otpuser;
                response.otpstatus = true;
                resolve({ otpuser, otpstatus: true });
            } else {
                resolve({ otpstatus: false });
            }
        });
    },
    addTocart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            let product=await db.get().collection(collection.PRODUCT_HELPERS).findOne({_id:objectid(productId)})
            let userid = objectid(userId);
            let prObject = {
                item: objectid(productId),
                quantity: 1,
                amount:parseInt(product.NewPrice),
                status:"Item Ready For Dispatch"
            };
            let userCart = await db
                .get()
                .collection(collection.CART_HELPERS)
                .findOne({ user: userid });
            console.log("....");
            console.log(userCart);
            if (userCart) {
                let proExist = userCart.products.findIndex(
                    products=> products.item == productId
                );
                console.log('..$4....');
                console.log(proExist);
                if (proExist != -1) {
                    db.get()
                        .collection(collection.CART_HELPERS)
                        .updateOne(
                            {
                               user:objectid(userId),
                                "products.item": objectid(productId),
                            },
                            {
                                $inc: { "products.$.quantity": 1 },
                               
                            },
                            
                        )
                        .then((response) => {
                            
                            // db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectid(userId)},
                            //     {
                            //         $pull:{products:{item:objectid(productId)}}
                            //     }
                            // );
                            resolve();
                        });
                } else {
                    db.get()
                        .collection(collection.CART_HELPERS)
                        .updateOne(
                            { user: userid },
                            {
                                $push: { products: prObject },
                            }
                        )
                        .then((response) => {
                            // db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectid(userId)},
                            //     {
                            //         $pull:{products:{item:objectid(productId)}}
                            //     }
                            // );
                            resolve();
                        });
                }
            } else {
                let cartobj = {
                    user: userid,
                    products: [prObject],
                };
                db.get()
                    .collection(collection.CART_HELPERS)
                    .insertOne(cartobj)
                    .then((response) => {
                        // db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectid(userId)},
                        //         {
                        //             $pull:{products:{item:objectid(productId)}}
                        //         }
                        //     );
                        resolve();
                    });
            }
        });
    },
    getCartproducts: (userId) => {
        let userid = objectid(userId);
        return new Promise(async (resolve, reject) => {
            let cartitems = await db
                .get()
                .collection(collection.CART_HELPERS)
                .aggregate([
                    {
                        $match: { user: userid },
                    },
                    {
                        $unwind: "$products",
                    },
                    {
                        $project: {
                            item: "$products.item",
                            quantity: "$products.quantity",
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_HELPERS,
                            localField: "item",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ["$product", 0] },
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: 1,
                            productTotal:{$sum:{$multiply:['$quantity','$product.NewPrice']}}
                        }
                    }
                    // {
                    //     $lookup:{
                    //         from:collection.PRODUCT_HELPERS,
                    //         let:{proList:"$products"},
                    //         pipeline:[
                    //             {
                    //                 $match:{
                    //                     $expr:{
                    //                         $in:['$_id','$$proList']
                    //                     }
                    //                 }
                    //             }
                    //         ],
                    //         as:"cartItems"
                    //     }
                    // }
                ])
                .toArray();
                console.log('......$$%5');
                console.log(cartitems);
            resolve(cartitems);
        });
    },
    getCartCount: (userId) => {
        let userid = objectid(userId);
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db
                .get()
                .collection(collection.CART_HELPERS)
                .findOne({ user: userid });
            if (cart) {
                count = cart.products.length;
            }
            resolve(count);
        });
    },
    changeQuantity: (details) => {
        let count = parseInt(details.count);
        let quantity = parseInt(details.quantity);
        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get()
                    .collection(collection.CART_HELPERS)
                    .updateOne(
                        { _id: objectid(details.cart) },
                        {
                            $pull: { products: { item: objectid(details.product) } },
                        }
                    )
                    .then((response) => {
                        resolve({ removeProduct: true });
                    });
            } else {
                db.get()
                    .collection(collection.CART_HELPERS)
                    .updateOne(
                        {
                            _id: objectid(details.cart),
                            "products.item": objectid(details.product),
                        },
                        {
                            $inc: { "products.$.quantity": count},
                        },
                        {
                            $set:{
                                'products.amount':'products.quantity'
                            }
                        }
                    )
                    .then((response) => {
                        resolve({ status: true });
                    });
            }
        });
    },
    removeProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.CART_HELPERS)
                .updateOne(
                    { _id: objectid(details.cart) },
                    {
                        $pull: { products: { item: objectid(details.product) } },
                    }
                )
                .then((response) => {
                    resolve({ response });
                });
        });
    },
    getTotalAmount: (userId,coupon) => {
        let userid = objectid(userId);
        let user = objectid(userId)
        return new Promise(async (resolve, reject) => {
            let product= await db.get().collection(collection.CART_HELPERS).findOne({user:objectid(userId)})
            console.log('........$$$');
            console.log(product);
            if(product==null){
                let total=0;
                resolve(total)
            }
            else{
                if(product.products[0]){
                    let total = await db
                    .get()
                    .collection(collection.CART_HELPERS)
                    .aggregate([
                        {
                            $match: { user: userid },
                        },
                        {
                            $unwind: "$products",
                        },
                        {
                            $project: {
                                item: "$products.item",
                                quantity: "$products.quantity",
                            },
                        },
                        {
                            $lookup: {
                                from: collection.PRODUCT_HELPERS,
                                localField: "item",
                                foreignField: "_id",
                                as: "product",
                            },
                        },
                        {
                            $project: {
                                item: 1,
                                quantity: 1,
                                product: { $arrayElemAt: ["$product", 0] },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                total: {
                                    $sum: {
                                        $multiply: [
                                            { $toInt: "$quantity" },
                                            { $toInt: "$product.NewPrice" },
                                        ],
                                    },
                                },
                            },
                        },
                    ])
                    .toArray();
                    let totals = total[0].total
                    console.log(userId,coupon);
                    let usercoupons = await db.get().collection(collection.COUPON_COLLECTION).findOne({couponname:coupon})
                    let usercoupon=await db.get().collection(collection.COUPON_COLLECTION).findOne({$and:[{couponname:coupon},{users:{$in:[userId.toString()]}}]})
                    console.log('coupon.................................................');
                    console.log(usercoupon);
                    console.log(usercoupon);
                    if(usercoupons){
                        if(usercoupon==null){
                            if(usercoupons.offer>40){
                                let coupondiscount=totals-(totals*(40/100))
                                coupondiscount=Math.round(coupondiscount)
                                
                            resolve(coupondiscount)
                            }else{
                                
                                let coupondiscount=totals-(totals*(usercoupons.offer/100))
                                coupondiscount=Math.round(coupondiscount)
                                
                            resolve(coupondiscount)
                            }
                            

                        }else{
                            console.log('hi');
                           
                                                        resolve(total[0].total);

                        }
                       
                        


                    }else{
                        
                        console.log('hoooooooo');
                        resolve(total[0].total);

                    }
                }
                else{
                    let total=0
                    resolve(total)
                }
            }
            
            
        });
    },
    getCartproductdetails: (userId,coupon,totals) => {
        return new Promise(async (resolve, reject) => {
            let cartitems = await db
                .get()
                .collection(collection.CART_HELPERS)
                .findOne({ user: objectid(userId) });
                console.log(cartitems);
                let usercoupons = await db.get().collection(collection.COUPON_COLLECTION).findOne({couponname:coupon})
                let usercoupon=await db.get().collection(collection.COUPON_COLLECTION).findOne({$and:[{couponname:coupon},{users:{$in:[userId.toString()]}}]})
                if(usercoupons){
                    if(usercoupon==null){
                        if(usercoupons.offer>40){
                            cartitems.products.forEach(element => {
                                element.quantityprice=element.amount*element.quantity
                            });

                            cartitems.products.forEach(element => {
                                element.offerprice = Math.ceil(element.quantityprice-(element.quantityprice*40/100))
                            });
                            
                        }else{
                            cartitems.products.forEach(element => {
                                element.quantityprice=element.amount*element.quantity
                            });
                            
                            cartitems.products.forEach(element => {
                                element.offerprice = Math.ceil(element.quantityprice-(element.quantityprice*usercoupons.offer/100))
                            });
                            
                        }
                        

                    }
                }
           
            resolve(cartitems.products);
        });
    },
    placeOrder: (order, product, totalamount) => {
        return new Promise(async (resolve, reject) => {
            product.forEach(element => {
                element.amount = element.amount*element.quantity
            });

            product.forEach(async(element)=>{
                let product = await db.get().collection(collection.PRODUCT_HELPERS).findOne({_id:element.item})
                db.get().collection(collection.PRODUCT_HELPERS).updateOne({_id:element.item},
                    {
                        $set:{
                            stock:product.stock-element.quantity
                        }
                    })
            })

            let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id:objectid(order.deliverydetails)})
            let status = order["paymentmethod"] === "COD" ? "Placed" : "pending";
            let trackOrder = 'Ordered'
            let datez = new Date()
            let timez = datez.toLocaleTimeString('en-US')
            day =datez.getDate()

            month =datez.getMonth()+1
            year = datez.getFullYear()
            date = `${year}-${month}-${day}`
            let orderObj = {

                deliveryDetails: {
                    name: address.fname,
                    address: address.address,
                    pincode: address.pincode,
                    mobile: address.phone,
                    email:address.email
                },
                userId: objectid(address.user),
                paymentmethod: order["paymentmethod"],
                products: product,
                totalamount: totalamount,
                status: status,        
                date:date ,
                month:month,
                year:year,
                trackOrder:trackOrder,
                time:datez,
                timez:timez

            };
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .insertOne(orderObj)
                .then((response) => {
                    console.log('..........................');
                    console.log(orderObj);
                    if(orderObj.status=='Placed'){
                        db.get()
                        .collection(collection.CART_HELPERS)
                        .deleteOne({ user: objectid(address.user) });
                    }
                    
                    
                    resolve(response.insertedId);
                });
        });
    },
    getallOrders: (userId) => {
        let userid = objectid(userId);
        return new Promise(async (resolve, reject) => {
           
            let orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({ userId: userid }).sort({time:-1})
                .toArray();
                console.log('...$$$$.....');
                resolve(orders);
        });
    },
    addToWishlist: (proId, userId) => {
        let prObject = {
            item: objectid(proId),
        };
        return new Promise(async (resolve, reject) => {
            let userwishlist = await db
                .get()
                .collection(collection.WISHLIST_COLLECTION)
                .findOne({ user: objectid(userId) });
            if (userwishlist) {
                let proExist = userwishlist.products.findIndex(
                    products=> products.item == proId   
                );
                if (proExist != -1) {
                    
                }else{
                    db.get()
                    .collection(collection.WISHLIST_COLLECTION)
                    .updateOne(
                        { user: objectid(userId) },
                        {
                            $push: {
                                products: prObject,
                            },
                        }
                    )
                    .then((response) => {
                        response.status = true;
                        resolve(response);
                    });
                }
                

            } else {
                let wishlist = {
                    user: objectid(userId),
                    products: [prObject],
                };
                db.get()
                    .collection(collection.WISHLIST_COLLECTION)
                    .insertOne(wishlist)
                    .then((response) => {
                        response.status = true;
                        resolve(response);
                    });
            }
        });
    },
    getAllWishlistprod: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlistItems = await db
                .get()
                .collection(collection.WISHLIST_COLLECTION)
                .aggregate([
                    {
                        $match:{user:objectid(userId)}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            item:'$products.item'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_HELPERS,
                            localField:'item',
                            foreignField:'_id',
                            as:'wishlist'
                        }
                    },
                    {
                        $project:{
                            item:1,
                            wishlist:{$arrayElemAt:['$wishlist',0]}
                        }
                    }
                    // {
                    
                    //     $lookup: {
                    //         from: collection.PRODUCT_HELPERS,
                    //         let: { proList: "$products" },
                    //         pipeline: [
                    //             {
                    //                 $match: {
                    //                     $expr: {
                    //                         $in: ["$_id", "$$proList"],
                    //                     },
                    //                 },
                    //             },
                    //         ],
                    //         as: "wishlistitems",
                    //     }
                    // },
                ])
                .toArray();
                console.log('.............444$$$..........');
                console.log(wishlistItems);
            resolve(wishlistItems);
        });
    },
    getWishCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let wishlist = await db
                .get()
                .collection(collection.WISHLIST_COLLECTION)
                .findOne({ user: objectid(userId) });
            console.log(wishlist);
            if (wishlist) {
                console.log("hi");
                count = wishlist.products.length;
            }
            resolve(count);
        });
    },
    removeWishlist:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({_id:objectid(details.wishlist)},
            {
                $pull:{
                    products:{item:objectid(details.product)
                }}
            }
            ).then((response)=>{
                resolve(response)
            })
        })
    },
    getallorderlist:()=>{
        return new Promise(async(resolve,reject)=>{
            let orderlist=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:'$products'
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_HELPERS,
                        localField:'products.item',
                        foreignField:'_id',
                        as:'productdetails'
                    }
                },
                {
                    $sort:{
                        time:-1
                    }
                }
            ]).toArray()
            console.log('......./////////////////////');
            console.log(orderlist);
            resolve(orderlist)
        })
    },
    editorderlist:(value,orderId,proId)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId),'products.item':objectid(proId)},
            {
                $set:{
                    'products.$.status':value
                }
            }).then((data)=>{
                resolve(data)
            })

        })
    },
    getallorderproduct:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderedproducts=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectid(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_HELPERS,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            resolve(orderedproducts)
        })
    },
    generateRazorpay:(orderId,totalAmount)=>{
        return new Promise((resolve,reject)=>{
            var options={
                amount:totalAmount*100,
                currency:"INR",
                receipt:orderId.toString()
            }
            instance.orders.create(options,function(err,order){
                resolve(order)
            })
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let  hmac = crypto.createHmac('sha256', "6DdQss8Ib2YASbCW2ZvHrCYC");
            hmac.update(details['payment[razorpay_order_id]']+"|"+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }
            else{
                reject()
            }
        })
    },
    changePaymentstatus:(orderId,userId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId)},{$set:{status:'Placed'}}).then(()=>{
                db.get().collection(collection.CART_HELPERS).deleteOne({user:objectid(userId)})
                resolve()
            })
        })
    },
    updatePassword:(pass,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user =await  db.get().collection(collection.USER_HELPERS).findOne({_id:objectid(userId)})
            let check=await bcrypt.compare(pass.currentpassword,user.password)
            if(check){
                password=await bcrypt.hash(pass.password, 10);
            db.get().collection(collection.USER_HELPERS).updateOne({_id:objectid(userId)},{$set:{password:password}}).then((response)=>{
                resolve({status:true})
            })
            }
            else{
                resolve({status:false})
            }
            

        })
    },
    updateDetails:(details,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_HELPERS).updateOne({_id:objectid(userId)},{$set:{name:details.name,number:details.number,email:details.email}}).then(()=>{
               let details = db.get().collection(collection.USER_HELPERS).findOne({_id:objectid(userId)})
                resolve(details)
            })
        })
    },
    addAddress:(address,userId)=>{
        return new Promise(async(resolve,reject)=>{
            
           address.user=objectid(userId)

           db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address).then((response)=>{
            resolve(response)
           })
            
        })
    },
    getAllAddress:(userId)=>{
        console.log(userId);
        return new Promise(async(resolve,reject)=>{
           let address=db.get().collection(collection.ADDRESS_COLLECTION).find({user:objectid(userId)}).toArray()
           resolve(address)
        })
    },
    deleteAddress:(addressId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({_id:objectid(addressId)}).then(()=>{
                resolve()
            })
        })
    },
    searchProduct:(value)=>{
        console.log(value);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_HELPERS).find({
                Name:{
                        $regex:'.*'+value+'.*',$options:'i'
                }
            }).toArray().then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    walletbalance:(userId,totalAmount)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user = await db.get().collection(collection.WALLET_COLLECTION).findOne({user:objectid(userId)})
            // let user =await db.get().collection(collection.USER_HELPERS).findOne({_id:objectid(userId)})
            if(totalAmount <= user.balance){
                
                response.status=true
                response.wallet=true
                resolve(response)
            }else{
                response.status=false
                response.wallet=true
                resolve(response)
            }
        })
    },
    getallorderproducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderproducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        _id:objectid(orderId)
                    }
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_HELPERS,
                        foreignField:'_id',
                        localField:'item',
                        as:'products'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        products:{$arrayElemAt:['$products',0]}
                    }
                }
            ]).toArray()
            console.log('.irde. ............');
            console.log(orderproducts);
            resolve(orderproducts)
        })
    },
    getUserWallet:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
                db.get().collection(collection.WALLET_COLLECTION).aggregate([
                    {
                        $match:{
                            user:objectid(userId)
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            user:1,
                            balance:1,
                            transaction:1
                        }
                    },
                    {
                        $unwind:'$transaction'
                    },{
                        $sort:{'transaction.date':-1}
                    }
                ]).toArray().then((data)=>{
                    console.log(data);
                    resolve(data)
                })
            
            
            // db.get().collection(collection.WALLET_COLLECTION).findOne({user:objectid(userId)}).sort({transaction:{date:-1}}).then((data)=>{
            //     resolve(data)
            // })
        })
    },
    deleteWishlist:(proId,userID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectid(userID)},{
                $pull:{
                    products:{item:objectid(proId)}
                }
            }).then((response)=>{
                console.log('.........kkkkkkkkkkk');
                console.log(response);
                resolve()
            })

        })
    },
    updateWallet:(userId,totalAmount)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.WALLET_COLLECTION).findOne({user:objectid(userId)})
           

            let userwallet = parseInt(user.balance) - parseInt(totalAmount)
            let datez = new Date()
                        let timez = datez.toLocaleTimeString('en-US')
                        day =datez.getDate()
            
                        month =datez.getMonth()+1
                        year = datez.getFullYear()
                        let date = `${day}-${month}-${year}`
                
            let transaction={
                credit:0,
                debit:totalAmount,
                datez:date,
                time:timez,
                message:"Product Purchase",
                date:new Date()
            }
            db.get().collection(collection.WALLET_COLLECTION).updateOne({user:objectid(userId)},{$set:{balance:userwallet},
            $push:{
                transaction:transaction
            }
        }).then((response)=>{
            response.wallet=true
            resolve(response)
        })

        })
    },
    getUserOrderedProducts:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        _id:objectid(orderId)
                    }
                },
                {
                    $unwind:'$products'
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_HELPERS,
                        localField:'products.item',
                        foreignField:'_id',
                        as:'productdetails'                    }
                },
                {
                    $unwind:'$productdetails'
                }
            ]).toArray().then((data)=>{
                resolve(data)
            })
        })
    },
    getUserReturnProduct:(orderId,proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        _id:objectid(orderId),
                    }
                },
                {
                    $unwind:'$products'
                },
                {
                    $match:{
                        'products.item':objectid(proId)

                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_HELPERS,
                        localField:'products.item',
                        foreignField:'_id',
                        as:'productdetails'
                    }
                },{
                    $unwind:'$productdetails'              }
            ]).toArray().then((data)=>{
                resolve(data[0])
            })
        })
    },
    returnProduct:(details,userId)=>{
        return new Promise(async(resolve,reject)=>{
            details.status="Return Requested"
            details.orderId=objectid(details.orderId)
            details.productID=objectid(details.productID)
            details.user=objectid(userId)
            details.time = new Date()
            let product = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        _id:objectid(details.orderId)
                    }
                },
                {
                    $unwind:'$products'
                },
                {
                    $match:{
                        'products.item':objectid(details.productID)
                    }
                },
               {
                $project:{
                    products:1
                }
               }
            ]).toArray()
            // let product =await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectid(details.orderId),'products.item':objectid(details.productID)})
            console.log(product);
            console.log('///////////................>>>>>>>');
            
            details.product=product[0].products
            db.get().collection(collection.RETURN_COLLECTION).insertOne(details).then((response)=>{
                resolve(response)
            })
        })
    },
    updateReturnStatus:(orderId,proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId),'products.item':objectid(proId)},
            {
                $set:{
                    'products.$.status':'Return Requested'
                }
            }
            ).then((response)=>{
                resolve()
            })
        })
    },
    approveReturn:(details)=>{
        console.log(details);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.RETURN_COLLECTION).updateOne({_id:objectid(details.returnid)},
            {
                $set:{
                    status:'Return Approved'
                }
            }
            ).then(async(data)=>{
               let b= await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(details.orderId),'products.item':objectid(details.proId)},
                {
                    $set:{
                        'products.$.status':'Return Approved'
                    }
                }
                )
                console.log(b);
                console.log(details.products);
                let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({user:objectid(details.user)})
                let newbalance = wallet.balance+parseInt(details.products)
                console.log(wallet.balance);
                console.log(newbalance);
                console.log(details.products);
                let datez = new Date()
                        let timez = datez.toLocaleTimeString('en-US')
                        day =datez.getDate()
            
                        month =datez.getMonth()+1
                        year = datez.getFullYear()
                        let date = `${day}-${month}-${year}`
                let transaction={
                    credit:parseInt(details.products),
                    debit:0,
                    datez:date,
                    time:timez,
                    message:"Product Return",
                    date:new Date()
                }
                db.get().collection(collection.WALLET_COLLECTION).updateOne({user:objectid(details.user)},{
                    $set:{
                            balance:newbalance
                    },
                    $push:{
                        transaction:transaction
                    }
                }
                )
                    console.log('...........');
                console.log(data);
                resolve(data)
            })
        })
    },
    cancelOrder:(orderId,proId,userId)=>{
        console.log('.....................///////////////');
        return new Promise(async(resolve,reject)=>{
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectid(orderId)})
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId),'products.item':objectid(proId)},
            {
                $set:{
                    'products.$.status':'Cancelled'
                }
            }).then(async(data)=>{
                if(order.paymentmethod!='COD'){
                    let pro = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {
                            $match:{
                                _id:objectid(orderId)
                            }
                        },
                        {
                            $unwind:'$products'
                        },
                        {
                            $match:{
                                'products.item':objectid(proId)
                            }
                        }
                    ]).toArray()
                    console.log(pro[0]);
                    let amount
                    if(pro[0].products.offerprice){
                        amount=pro[0].products.offerprice
                    }else{
                        amount=pro[0].products.amount
                    }
                    let datez = new Date()
                        let timez = datez.toLocaleTimeString('en-US')
                        day =datez.getDate()
            
                        month =datez.getMonth()+1
                        year = datez.getFullYear()
                        let date = `${day}-${month}-${year}`
                    let transaction={
                        credit:amount,
                        debit:0,
                        datez:date,
                        time:timez,
                        message:"Product Cancellation",
                        date:new Date()
                    }
                   
                    let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({user:objectid(userId)})

                    let balance = wallet.balance+amount
                    db.get().collection(collection.WALLET_COLLECTION).updateOne({user:objectid(userId)},
                    {
                        $set:{
                            balance:balance
                        },
                        $push:{
                            transaction:transaction
                        }
                    }
                    
                    )
                }
                resolve(data)
            })
        })
    }
};
