window.onload = loadCheckout();

function loadCheckout() {
    const url = '/api/order';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(r => r.json()).then(data => {
        console.log("order data:", data);

        $("#checkout-product").html("");

        if (data.user !== undefined) {
            $("#fullname").val(data.user.fullname);
            $("#address").val(data.user.address);
            $("#email").val(data.user.email);
            $("#phone").val(data.user.phone);
        }

        data.products.forEach(product => {
            var html = `
            	<li>
                    <div class="row">
                        <div class="col-10 ">
                            <div class="row">
                                <img class="checkout-img" src="${product.thumb || product.img[0]}" alt="checkout thumnail">
                                <div class="col ml-3">
                                    <div class="row" style="font-weight: 700;">
                                        ${product.name}
                                    </div>
                                    <div class="row mb-2 d-flex align-items-center">
                                        <div class="pt-1">
                                            Size: ${product.size}
                                        </div>
                                        <span style="margin-left:5px; background-color:${product.color}; width:17px; height:17px; display: inline-block; border-radius: 50%;"></span>
                                    </div>

                                    <div class="row">
                                        <div class="col-8">
                                            ${product.price}
                                        </div>
                                        <div class="col-4">
                                            x${product.quantity}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="product-total col-2 d-flex align-items-center pb-4">
                            ${product.total}
                        </div>
                    </div>
                </li>`

            $("#checkout-product").append(html);
        });

        if (data.discount !== undefined) {
            var html = `
            <div style="font-size:18px;">
                ${data.total}
            </div>
            <div style="color: gray;" id="discount">
                ${data.discount}
            </div>
            <div style="border: 0.2px solid lightgray; width:100%"></div>
            <div class="mt-3" style="font-weight: bold; font-size:20px; color: red;">
                ${data.result}
            </div>
            `

            $("#result-total").html(html);
        } else {
            var html = `
            <div style="font-size:120x; font-weight: bold; color: red;">
                ${data.total}
            </div>`

            $("#result-total").html(html);
        }
    });
}


function placeOrder() {
    const url = '/api/order/place-order';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fullname: $("#fullname").val(),
            address: $("#address").val(),
            email: $("#email").val(),
            phone: $("#phone").val()

        })
    }).then(r => r.json()).then(data => {
        if (data.signin) {
            $("#place-order-announce").text("Please sign in to place order");
            return
        }

        // check condition to order
        if (data.canCheckout === true) {
            location.replace("/?checkout=true")
        } else if (data.canCheckout === false) {
            $("#place-order-announce").text("Cart is empty - Can't checkout");
        } else {
            $("#place-order-announce").text("Please fill all fields");
        }


    });
}