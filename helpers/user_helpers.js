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
                        // walletObj={
                        //     credit:100,
                        //     debit:0,
                        // }
                        // let wallet=[walletObj]
                         let wallet = referral.wallet+100
                        db.get().collection(collection.USER_HELPERS).updateOne({_id:referral._id},{$set:{wallet:wallet}})
                        userData.password = await bcrypt.hash(userData.password, 10);
                    userData.referral=shortid.generate()
                    // let wallets={
                    //     credit:50,
                    //     debit:0,
                    // }
                    userData.wallet = 50
                    // userdatawallet=[wallets]
                    // userData.wallet=userdatawallet
                    userData.userstatus = true;
                    db.get()
                        .collection(collection.USER_HELPERS)
                        .insertOne(userData)
                        .then((data) => {
                            response.data=data
                            response.status=true
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
                userData.wallet=0
                db.get()
                    .collection(collection.USER_HELPERS)
                    .insertOne(userData)
                    .then((data) => {
                        response.data=data
                        response.status=true
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
            console.log(product)
            let userid = objectid(userId);
            console.log(userid);
            let prObject = {
                item: objectid(productId),
                quantity: 1,
                amount:parseInt(product.NewPrice)
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
                               
                                "products.item": objectid(productId),
                            },
                            {
                                $inc: { "products.$.quantity": 1 },
                               
                            },
                            
                        )
                        .then(() => {
                            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectid(userId)},
                                {
                                    $pull:{products:{item:objectid(productId)}}
                                }
                            );
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
                            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectid(userId)},
                                {
                                    $pull:{products:{item:objectid(productId)}}
                                }
                            );
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
                        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectid(userId)},
                                {
                                    $pull:{products:{item:objectid(productId)}}
                                }
                            );
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
                    let usercoupon=await db.get().collection(collection.COUPON_COLLECTION).find({couponname:coupon,users:{$in:[userId]}}).toArray()
                    
                    
                    if(usercoupon[0]){
                        let coupondiscount=totals-(totals*(usercoupon[0].offer/100))
                        coupondiscount=Math.round(coupondiscount)
                        resolve(coupondiscount)

                    }else{
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
    getCartproductdetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartitems = await db
                .get()
                .collection(collection.CART_HELPERS)
                .findOne({ user: objectid(userId) });
                console.log(cartitems);
            resolve(cartitems.products);
        });
    },
    placeOrder: (order, product, totalamount) => {
        return new Promise(async (resolve, reject) => {
            console.log('.........$$$$........');
            console.log(order, product, totalamount);
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id:objectid(order.deliverydetails)})
            let status = order["paymentmethod"] === "COD" ? "Placed" : "pending";
            let trackOrder = 'Ordered'
            let datez = new Date()
            day =datez.getDate()
            month =datez.getMonth()
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
                time:datez

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
        return new Promise((resolve,reject)=>{
            let orderlist=db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            console.log(orderlist);
            resolve(orderlist)
        })
    },
    editorderlist:(value,id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(id)},{$set:{trackOrder:value}}).then((response)=>{
                resolve(response)
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
            let  hmac = crypto.createHmac('sha256', process.env.CRYPTO_HMAC);
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
                        $regex:value
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
            let user =await db.get().collection(collection.USER_HELPERS).findOne({_id:objectid(userId)})
            if(totalAmount <= user.wallet){
                userwallet = user.wallet - totalAmount
                db.get().collection(collection.USER_HELPERS).updateOne({_id:objectid(userId)},{$set:{wallet:userwallet}})
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
    }
};
