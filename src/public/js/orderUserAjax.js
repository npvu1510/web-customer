window.onload = loadUserOrder();

function loadUserOrder() {
    const url = '/api/user/order';
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(r => r.json()).then(data => {
        console.log("-- load order --");
        console.log("data:", data);

        $("#show-orders").html("");

        if (data.length === 0) {
            var html = `
            <div class="text-center">
                <h2><b>No order</b></h2>
            </div>`

            $("#show-orders").html(html)
        }

        data.forEach((item) => {
            let order_cart = `
                <div class="card user-card-full">
                    <div class="row w-100">
                        <div class="col-10">
                            <div class="d-flex">
                                <img src="${item.thumb}" alt="order-thumnail"
                                    style="width: 150px; object-fit:cover" alt="logo">
                                <div class="ml-3 p-3">
                                    <h4 style="font-weight: bold;">${item.products[0].name},...</h4>`

            if (item.discount !== undefined) {
                let final_pricee = Math.round((item.total - item.discount) * 100) / 100;

                order_cart += `<div class="mb-2" id="item-total">$${final_pricee}</div>
                                    <div class="row">`
            } else {
                order_cart += `<div class="mb-2" id="item-total">$${item.total}</div>
                                    <div class="row">`
            }


            if (item.status === "Delivering") {
                order_cart += `<div class="status btn-secondary">${item.status}</div> 
                                <div class="delivery-time" style="margin-left: 20px">${item.start_delivery.split("T")[0]} - ${item.end_delivery.split("T")[0]}</div>`
            } else if (item.status === "Canceled") {
                order_cart += `<div class="status btn-danger">${item.status}</div>`
            } else if (item.status === "Completed") {
                order_cart += `<div class="status btn-success">${item.status}</div>`
            } else if (item.status === "Processing") {
                order_cart += `<div class="status btn-warning">${item.status}</div>`
            }


            if (item.status === "Processing") {
                order_cart += `
                        
                        <button style="border-radius: 7px;" class="ml-3 btn btn-danger btn-sm"
                            data-toggle="modal" data-target="#cancle-order-${item._id}">
                            &times; Cancel order
                        </button>
                        <!-- Modal -->
                        <div class="modal fade" id="cancle-order-${item._id}" tabindex="-1" role="dialog"
                            aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" style="font-weight: bold;">
                                            Confirm
                                        </h5>
                                        <button type="button" class="close" data-dismiss="modal"
                                            aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        Are you sure to <b style="color: red;">CANCLE</b> this
                                        order?
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary"
                                            data-dismiss="modal">Cancle</button>
                                        <button type="button" class="btn btn-danger"
                                            data-dismiss="modal"
                                            onmousedown="deleteOrder('${item._id}')">Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>`
            }

            order_cart +=
                `
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-2 d-flex align-items-center justify-content-center">
                            <button class="p-2 btn  btn-detail" data-toggle="modal"
                                data-target="#order-${item._id}">
                                Detail
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal fade" id="order-${item._id}" tabindex="-1" role="dialog"
                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3 class="modal-title" style="font-weight: bold;">Order detail</h3>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <h5 class="mb-2"><b>ID: </b>
                                    ${item._id}
                                </h5>
                                <div class="mb-1"><b>Create at:</b> ${item.create_date}</div>
                                <div class="mb-3">
                                    <b>Status:</b>  ${item.status}
                                </div>
                                <div class="custom-table p-3 mb-3">
                                    <div class="row">
                                        <div class="col-7 ">
                                            <b>Product</b>
                                        </div>
                                        <div class="col-3 ">
                                            <b>Quantity</b>
                                        </div>
                                        <div class="col-2">
                                            <b>Price</b>
                                        </div>
                                    </div>
                                    <hr>`
            item.products.forEach((product) => {
                order_cart += `
                                    <div class="row">
                                        <div class="col-7">
                                            <div class="row">
                                                <div class="col product-image">
                                                    <img src="${product.img}"
                                                        class="avatar avatar-sm" alt="thumnail">
                                                </div>
                                                <div class="col-9 d-flex flex-column justify-content-center">
                                                    <h6 class="mb-0 text-sm">${product.name}</h6>
                                                    <span
                                                        class="text-secondary text-xs font-weight-bold">${product._id}
                                                    </span>
                                                    <div class = "d-flex align-items-center">
                                                        <div class="pt-1">
                                                            Size: ${product.size}
                                                        </div>
                                                        <span style="margin-left:5px; background-color:${product.color}; width:17px; height:17px; display: inline-block; border-radius: 50%;"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-3 align-middle text-center">
                                            <span class="text-secondary text-xs font-weight-bold">x${product.quantity}</span>
                                        </div>
                                        <div class="col-2 align-middle">
                                            <span class="text-secondary text-xs font-weight-bold">$${product.total}</span>
                                        </div>
                                        <hr class="my-2">
                                    </div>
                                    <hr>`
            });

            if (item.discount !== undefined) {
                let final_price = Math.round((item.total - item.discount) * 100) / 100;

                order_cart += `
                                    <div class="row">
                                        <h6 class="col">Total:</h6>
                                        <div class="col-3">
                                            <h6 class="text-secondary font-weight-bold">
                                                $${item.total}
                                            </h6>
                                            <h6 class="text-secondary font-weight-bold">
                                                - $${item.discount}
                                            </h6>
                                            <hr>
                                            <h5 class="font-weight-bold">
                                                $${final_price}
                                            </h5>
                                        </div>
                                    </div>`

            } else {
                order_cart += `
                                    <div class="row">
                                        <h6 class="col">Total:</h6>
                                        <div class="col-3">
                                            <h6 class="text-secondary font-weight-bold">
                                                $${item.total}</h6>
                                        </div>
                                    </div>`
            }

            order_cart += `
                        </div>
                            </div>
                            <div class="m-3 d-flex justify-content-end">
                                <button type="button" class="btn btn-secondary" style="width: 120px;"
                                    data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                `;

            $("#show-orders").append(order_cart);
        });
    });
}

function deleteOrder(orderID) {
    const url = '/api/user/order/delete/' + orderID;
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then()

    console.log("-- delete order --");

    $(".modal-backdrop").remove();

    // reload order
    loadUserOrder();
}