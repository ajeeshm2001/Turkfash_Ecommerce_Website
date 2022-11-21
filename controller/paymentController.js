
var producthelpers = require("../helpers/product_helpers");
var userhelpers = require("../helpers/user_helpers");
var categoryhelpers = require("../helpers/category_helpers");
var bannerhelpers = require("../helpers/banner_helpers");
const paypal = require("paypal-rest-sdk");

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
      process.env.PROCESS_CLIENTID,
    client_secret:
      process.env.PROCESS_SECRETKEY,
  });



  module.exports.razorpayPayment= (req, res) => {
    userhelpers
      .verifyPayment(req.body)
      .then(() => {
        console.log('......................');
        console.log(req.body);
        userhelpers.changePaymentstatus(req.body["order[receipt]"],req.session.user._id).then(() => {
          res.json({ status: true });
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false });
      });
  }


  module.exports.paypalPayment=(req, res) => {
    let orderId = req.body.orderId
    let total = req.body.total
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://turkfash.online/success/"+orderId,
        cancel_url: "http://turkfash.online/cancel",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Red Sox Hat",
                sku: "001",
                price: "25.00",
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            "total":"25.00",
          },
          description: "Hat for the best team ever",
        },
      ],
    };
  
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.json(payment.links[i].href);
          }
        }
      }
    });
  }


  module.exports.paypalPaymentSuccess=(req, res) => {
    const orderId = req.params.orderid
    console.log(orderId);
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
   
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    };
   
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
        userhelpers.changePaymentstatus(orderId).then(()=>{
          console.log(JSON.stringify(payment));
          res.redirect('/ordersuccess');
        })
          
      }
  });
  }


  module.exports.retryPayment=(req,res)=>{
    req.body.totalAmount=parseInt(req.body.totalAmount)
    let orderId=req.body.order
    let totalAmount=req.body.totalAmount
    if(req.body.paymentmethod=="Razorpay"){
      userhelpers.generateRazorpay(req.body.order,req.body.totalAmount).then((response)=>{
        response.pay=true
        res.json(response)
      })
    }else{
      res.json({orderId,totalAmount,paypal:true})
    }
  }

  module.exports.walletBalance=async(req,res)=>{
    let totalAmount = await userhelpers.getTotalAmount(req.session.user._id,req.body.coupon)
    userhelpers.walletbalance(req.session.user._id,totalAmount).then((response)=>{
      res.json(response)
    })
  }