

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
                            Swal.fire({
                                icon: 'success',
                                title: 'Added Successfully',
                                text: ' Item Successfully added to cart',
                               
                            }).then(()=>{
                                document.getElementById('addtocart').style.display='none'
                                document.getElementById('gotocart').style.display='block'
                                $('#cartcount').html(response)

                            })

                           
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
                document.getElementById(proId).style.display='block'
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
            if(response.st){
                console.log(proId);
            swal("", "Item Moved To Cart", "success").then(()=>{
                $.ajax({
                    url:'/removewishlist',
                    data:{
                        proId:proId
                    },
                    method:'delete',
                    success:(response)=>{
                        location.reload()

                    }
                })
            })
            }
            
             
            
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
            proId:proId
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






