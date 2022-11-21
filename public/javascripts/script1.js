

$('#addresss').submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/addaddress',
        method: 'post',
        data: $('#addresss').serialize(),
        success: (response) => {
            if (response) {
                document.getElementById("addd").value = ""
                document.getElementById("addd1").value = ""
                document.getElementById("addd2").value = ""
                document.getElementById("addd3").value = ""
                document.getElementById("addd4").value = ""
                document.getElementById("addd5").value = ""
                document.getElementById("addd6").value = ""
                document.getElementById("addd7").value = ""
                document.getElementById("addd8").value = ""
                location.reload()
            }
        }
    })
})



$('#checkoutform').submit((e) => {
    e.preventDefault()
    let value = document.getElementById('couponvalue').value
    let b  = document.getElementById('walletz').checked
    let subtotal = document.getElementById('subtotal').innerHTML
    console.log(b);
    if(b){
        
        $.ajax({
            url:'/walletbalance',
            method:'post',
            data:$('#checkoutform').serialize(),
            success:(response)=>{
                if(response.status){
                    $.ajax({
                        url: '/placeorder/'+subtotal,
                        method: 'post',
                        data: $('#checkoutform').serialize(),
                            
                        success: (response) => {
                            
                            if (response.codPayment) {
                                location.href = '/ordersuccess'
                            } else if (response.paypal) {
                                console.log(response)
                
                                paypalPayment(response)
                
                            }
                            else if(response.wallet){
                               
                                    location.href='/ordersuccess'
                                
                            }
                             else {
                                
                                razorPayment(response)
                            }
                        }
                    })
                }else{
                    alert("Insufficient Fund")
                }
            }
        })
    }else{
        $.ajax({
            url: '/placeorder/'+subtotal,
            method: 'post',
            data: $('#checkoutform').serialize(),
                
            success: (response) => {
                
                if (response.codPayment) {
                    alert('Order Placed Successfully')
                    location.href = '/ordersuccess'
                } else if (response.paypal) {
                    console.log(response)
    
                    paypalPayment(response)
    
                }
                else if(response.wallet){
                    if(response.status){
                        location.href='/ordersuccess'
                    }else{
                        alert("Insuficient Amount")
                    }
                }
                 else {
                    console.log(response)
                    razorPayment(response)
                }
            }
        })
    }
    

    
})

function paypalPayment(response) {
    orderId=response._id
    $.ajax({
        url: '/pay',
        data:{
            orderId:response.orderId,
            total:response.totalAmount
        },
        method: 'post',
        success: (response) => {
            console.log(response)
            location.href = response
        }
    })
}

function razorPayment(order) {
  
    
    var options = {
        "key": "rzp_test_8h8AtEo7U2mnNt", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "TurkFash",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();


}

function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            payment, order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = '/ordersuccess'
            }
            else {
                alert("Failed")
            }
        }
    })
}

function coupons() {
    let value = document.getElementById("couponvalue").value

    $.ajax({
        url: '/coupon',
        method: 'post',
        data: { 'coupon': value },
        success: (response) => {
            if (response.status === true) {
                if(response.couponoffer>40){
                    document.getElementById('couponapply').style.color = "green"
                document.getElementById('couponapply').innerHTML = response.message
                let total = document.getElementById('total').innerHTML
                let subtotal = document.getElementById('subtotal').innerHTML
                let offer = 40
                let v = subtotal * (offer / 100)
                document.getElementById('total').innerHTML = Math.round(subtotal - v) 
                }else{
                    document.getElementById('couponapply').style.color = "green"
                document.getElementById('couponapply').innerHTML = response.message
                let total = document.getElementById('total').innerHTML
                let subtotal = document.getElementById('subtotal').innerHTML
                let offer = response.couponoffer
                let v = subtotal * (offer / 100)
                document.getElementById('total').innerHTML = Math.round(subtotal - v) 
                }
                
            } else {
                document.getElementById('couponapply').style.color = "red"
                document.getElementById('couponapply').innerHTML = response.message
                let subtotal = document.getElementById('subtotal').innerHTML
                document.getElementById('total').innerHTML=subtotal
                


            }
        }
    })
}


function couponfunc(couponid) {
    let couponvalue = document.getElementById('couponvalues' + couponid).value
    console.log(couponvalue)
    document.getElementById('couponvalue').value = couponvalue
}



