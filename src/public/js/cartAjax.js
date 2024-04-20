// window.onload = loadProduct();
window.addEventListener('load', loadProduct);

function loadProduct() {
    const url = '/api/cart/products';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(r => r.json()).then(data => {
        console.log("load data:", data);
        const $product_table = $("#cart-table");
        $product_table.html("");

        data.products.forEach((item, index) => {
            let c = item.color.replace("#", "");
            const html = `
            <tr>
                <td class="product__cart__item">
                    <div class="product__cart__item__pic">
                        <a href="/product/${item._id}">
                            <img src="${item.thumb || item.img[0]}" style="width: 150px; object-fit: contain;"
                                alt="thumbnail">
						</a>
                    </div>
                    <div class="product__cart__item__text">
                        <h6 class="mb-0">${item.name}</h6>
                        <h6 class='d-flex align-items-center '>
                            <div class="pt-1" style="font-weight:normal !important">
                                Size: ${item.size}
                            </div>
                            <span style="margin-left:5px; background-color:${item.color}; width:17px; height:17px; display: inline-block; border-radius: 50%;">                                
                            </span>
                        </h6>
                        <h4>$${item.price}</h4>
                    </div>
                </td>
        
                <td class="quantity__item">
                    <div class="quantity">
                        <div class="pro-qty-2 d-flex">
                            <button class="btn-minus" onclick="changeQuantity('${item._id}', '${item.color}', '${item.size}', 'minus')">-</button>
                            <input type="number"  name="quantity" id='${item._id}_${c}_${item.size}' value="${item.quantity}" onfocusout="changeQuantity('${item._id}', '${item.color}', '${item.size}')">
                            <button class="btn-plus"  onclick="changeQuantity('${item._id}', '${item.color}', '${item.size}', 'plus')">+</button>
                        </div>
                    </div>
                </td>
                <td class="cart__price" id='${item._id}_${c}_${item.size}_total'> $${item.total}</td>
                <td class="cart__close">
                    <a href="javascript:{}" onclick="deleteProductInCart('${item._id}', '${item.color}', '${item.size}')">
                        <i class="fa fa-close"></i>
                    </a>
        
                </td>
            </tr>`

            $product_table.append($.parseHTML(html));
        });

        $("#number-product-incart").html(data.number_products);
        $("#cart-total").html(data.total);
    });
}

function changeQuantity(productID, color, size, type) {
    console.log("--- change quantity ---");
    let pro_number = '#' + productID + '_' + color.replace("#", "") + '_' + size;
    let pro_total = '#' + productID + '_' + color.replace("#", "") + '_' + size + '_total';

    const url = '/api/cart/change-quantity/' + productID + '/' + type;
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: productID,
            color: color,
            size: size,
            type: type,
            quantity: $(pro_number).val()
        })
    }).then(r => r.json()).then(data => {
        console.log("data:", data);

        $("#number-product-incart").html(data.number_product);
        $("#cart-total").html(data.total);

        $(pro_number).val(data.product_quantity);
        $(pro_total).text("$" + data.product_total);
    });
}

function deleteProductInCart(productID, color, size) {
    const url = '/api/cart/delete/' + productID;
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: productID,
            color: color,
            size: size
        })
    }).then(r => r.json()).then(data => {
        console.log("del data:", data);
        const $product_table = $("#cart-table");

        // clear product table
        $product_table.html("");

        // load product again
        loadProduct();

    });
}

function checkInputCoupon() {
    console.log("check input")
    coupon = $('#input-coupon').val();
    console.log("coupon: " + coupon)

    if (coupon === "") {
        $("#discount").html(``);
        $("#coupon-announce").html(``);
    }
}

function applyCoupon() {
    console.log("apply coupon");
    const coupon = $("#input-coupon").val();
    const url = '/api/cart/apply-coupon/' + coupon;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(r => r.json()).then(data => {
        console.log("data:", data);

        if (data.stt === false) {
            $("#coupon-announce").css("color", "red");
            $("#discount").html(" ");

        } else {
            const html = `Discount <span id="">${data.total}</span>`;

            $("#coupon-announce").css("color", "green");
            $("#discount").html(html);
        }

        console.log("f:", coupon);

        $("#coupon-announce").text(data.msg);
    });
}
