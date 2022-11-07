const { response } = require("../../app");


function addTocart(proId,stock){
    console.log(stock);
    if(stock==0){
        swal("Stock Out","Item Out of Stock", "warning")
    }else{
        $.ajax({    
            url:'/addtocart/'+proId,
            method:'get',
            success:(response)=>{
                if(response.status){
                    $.ajax({
                        url:'/countcart',
                        method:'get',
                        success:(response)=>{
                            $('#cartcount').html(response)

                        }
                    })
                        
                    
                }
            }
        })
    }
    
}

function addTowishlist(proId){
    $.ajax({
       
        url:'/wishlist/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#wishlist-count').html()
                count=parseInt(count)+1
                $('#wishlist-count').html(count)
            }
        }
    })
}

function addTocartwishlist(proId){
    $.ajax({
        url:'/addTocartwishlist/'+proId,
        method:'get',
        success:(response)=>{
            console.log(proId);
            swal("", "Item Moved To Cart", "success").then(()=>{
                location.reload()
            })
             
            
            // document.getElementById('wishlist').style.display='none'
            
        }
    })
}

function removewishlist(wishId,proId){
    console.log('Helloo')
    $.ajax({
        url:'/removewishlist/',
        data:{
            wishlist:wishId,
            product:proId
        },
        method:'delete',
        success:(response)=>{
            alert('Product removed Successfully')
            location.reload()
        }
    })
}

function viewproduct(orderId){
    $.ajax({
        url:'/getorderproduct/'+orderId,
        method:'get',
        success:(response)=>{
            $('#exampleModal').modal('show')
        }
    })
}





