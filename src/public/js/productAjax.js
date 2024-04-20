let g_stock = 0;

function sendData(e) {
    const $searchResult = $('#myList');
    let match = e.value.match(/^[a-zA-Z0-9]*/);
    let match2 = e.value.match(/\s*/);
    if (match2[0] === e.value) {
        $searchResult.html('');
        return;
    }
    if (match[0] === e.value) {
        fetch('/api/products/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payload: e.value
            })
        }).then(r => r.json()).then(data => {
            let payload = data.payload;
            $searchResult.html('');
            if (payload.length < 1) {
                $searchResult.html('<h5>No results found</h5>');
                return;
            }
            payload.forEach((item, index) => {
                $searchResult
                    .append(`<li class="list-group-item text-black-20 small">
                                <form id="my-form" action="/product/${item._id}" method="get">
                                    <button class="text-black-50" onclick="document.getElementById('my-form').submit()"> ${item.name} </button> 
                                </form>
                            </li>`);
            })
        });
    }
}

function addProduct(productID, size, color, stock, quantity = 1) {

    if (!color) {
        alert('Please select a color')
        return;
    }

    console.log("add product");
    console.log("pro:", productID, "- color:", color, "- quan:", quantity, "- sz:", size, "- stock:", stock);

    const url = '/api/products/add/' + productID;
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: productID,
            quantity: quantity,
            color: color,
            size: size,
            stock: stock
        })
    }).then(r => r.json()).then(data => {
        console.log("--- add product ---");
        console.log(data);

        $("#number-product-incart").html(data.number);
    });

    alert(`Add ${productID} to cart successfully`);
}

function getProductByField(field, type, page) {
    const $product = $('#product-list');
    const $start = $('#stat-end');
    const $pagination = $('#pagination');
    $.ajax({
        url: '/api/products/field',
        type: 'GET',
        data: {
            field: field,
            type: type,
            page: page
        },
        dateType: "JSON",
        success: function (products) {
            console.log("--- getProductByField ---");
            console.log("pro:", products);

            $product.html('');
            $start.html('');
            $pagination.html('');
            if (products.length < 1) {
                $product.html('');
                return;
            }

            products.data.forEach((item) => {
                let add_to_cart = `<h5>$${item.price}</h5>`

                const url = `/api/products/load/${item._id}`
                $.get(url, function (data) {
                    const variations = data.variations
                    const status = isInStockProduct(variations)

                    if (status === 1) // coming soon
                        add_to_cart = `<span style="color: blue; font-style: italic">Coming soon</span>`
                    else if (status === 2) // out of stock
                        add_to_cart = `<span style="color: red; font-style: italic">Out of stock</span>`

                    const str = `
                            <div class="col-lg-4 col-md-6 col-sm-6">
                                <div class="card" style="width: 18rem;">
                                    <a href="/product/${item._id}">
                                        <img class="card-img-top" src="${item.thumb || item.img[0]}" alt="Card image cap">
                                    </a>
                                    <div class="card-body" id="card-body">
                                        <a href="/product/${item._id}">
                                            <h5 id="product-name"><b>${item.name}</b></h5>
                                        </a>
                                        <input type="hidden" name="id" value="${item._id}" />
                                        ${add_to_cart}
                                        
                                    </div>
                                </div>
                            </div>`;
                    const html = $.parseHTML(str);
                    $product.append(html);
                })
            });

            if (products.data.length < 1) {
                $pagination.html('');
                $start.html(
                    `<div class="row">
                        <div class="col-lg-6 col-md-6 col-sm-6">
                            <div class="shop__product__option__left">
                                <p>Showing 0 results</p>
                            </div>
                        </div>
                        <div class="col-lg-6 col-md-6 col-sm-6">
                            <div class="shop__product__option__right">
                                <p>Sort by:</p>
                                <select style="display: none;">
                                    <option>Random</option>
                                    <option>Low to High</option>
                                    <option>High to Low</option>
                                    <option>Oldest</option>
                                    <option>Newest</option>
                                </select>
                                <div class="nice-select" tabIndex="0">
                                    <span class="current">${products.field}</span>
                                    <ul class="list">
                                        <li data-value="" class="option"
                                            onClick="getProductByField('Random','',1)">Random
                                        </li>
                                        <li data-value="" class="option"
                                            onClick="getProductByField('Low to High','sort',1)">Low to High
                                        </li>
                                        <li data-value="" class="option"
                                            onClick="getProductByField('High to Low','sort',1)">High to Low
                                        </li>
                                        <li data-value="" class="option"
                                            onClick="getProductByField('Oldest','sort',1)">Oldest
                                        </li>
                                        <li data-value="" class="option"
                                            onClick="getProductByField('Newest','sort',1)">Newest
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>`
                );
                return;
            }

            $start.html(`
            <div class="row">
                <div class="col-lg-6 col-md-6 col-sm-6">
                    <div class="shop__product__option__left">
                        <p>Showing ${products.start}–${products.end} of ${products.total} results</p>
                    </div>
                </div>
                <div class="col-lg-6 col-md-6 col-sm-6">
                    <div class="shop__product__option__right">
                         <p>Sort by:</p>
                            <select style="display: none;">
                                <option>Random</option>
                                <option>Low to High</option>
                                <option>High to Low</option>
                                <option>Oldest</option>
                                <option>Newest</option>
                            </select><div class="nice-select" tabindex="0">
                            <span class="current">${products.field}</span>
                            <ul class="list">
                                <li data-value="" class="option" onclick="getProductByField('Random','',1)">Random</li>
                                <li data-value="" class="option" onclick="getProductByField('Low to High','sort',1)">Low to High</li>
                                <li data-value="" class="option" onclick="getProductByField('High to Low','sort',1)">High to Low</li>
                                <li data-value="" class="option" onclick="getProductByField('Oldest','sort',1)">Oldest</li>
                                <li data-value="" class="option" onclick="getProductByField('Newest','sort',1)">Newest</li>
                            </ul></div>
                    </div>
                </div>
            </div>`);

            $pagination.html(`
                    <button class="page-link" style="color: #0b0b0b" href="#"
                       aria-label="Previous" onclick="getProductByField('${products.field}','${products.type}','${products.prev}')">
                        <span aria-hidden="true">&laquo;</span>
                    </button>
                </li>
                <li class="page-item ${products.hiddenPrev}"
                    style="${products.disablePrev} ${products.numberPrev} color: #0b0b0b;">
                    <button class="page-link" style="color: #0b0b0b" onclick="getProductByField('${products.field}','${products.type}','${products.prev}')"> ${products.prev} </button>
                </li>
                <li class="page-item active" style="color: #0b0b0b;">
                    <button class="page-link" disabled style="color: #0b0b0b" onclick="getProductByField('${products.field}','${products.type}','${products.page}')"> ${products.page} </button>
                </li>
                <li class="page-item ${products.hiddenNext}"
                    style="${products.disableNext} ${products.numberNext} color: #0b0b0b">
                    <button class="page-link" style="color: #0b0b0b" onclick="getProductByField('${products.field}','${products.type}','${products.next}')""> ${products.next} </button>
                </li>
                <li class="page-item" style="${products.disableNext} color: #0b0b0b">
                    <button class="page-link" style="color: #0b0b0b" onclick="getProductByField('${products.field}','${products.type}','${products.next}')"
                       aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </button>
                </li>
            `);
        }
    });

}

function isInStockProduct(variations) {
    if (variations == undefined) //coming soon
        return 1

    for (let i = 0; i < variations.length; i++)
        if (variations[i].stock != 0)
            return 0 //in stock

    return 2 //out of stock
}

function isInstockSize(variations, size) {
    for (let i = 0; i < variations.length; i++)
        if (variations[i].size == size && variations[i].stock != 0)
            return true
    return false
}

function isInStockColor(variations, size, color) {
    for (let i = 0; i < variations.length; i++)
        if (variations[i].size == size && variations[i].color == color && variations[i].stock != 0)
            return true
    return false
}

function findValidSize(variations, size) {
    const color_series = []
    for (let k = 0; k < variations.length; k++) {
        if (variations[k].size == size && !color_series.includes(variations[k].color) && variations[k].stock != 0)
            color_series.push(variations[k].color)
    }

    for (let j = 0; j < color_series.length; j++) {
        if (!isInStockColor(variations, size, color_series[j]))
            continue
        return color_series[j]
    }
    return false
}


function displayVariance(variations, size, color, size_series, color_series, stock, field) {
    // set input quantity to 1
    change_quantity("none")

    console.log("size:", size, "color:", color, "size_series:", size_series, "color_series:", color_series, "stock:", stock, "field:", field);

    const product_detail_size = $(`#product-detail-size`)
    product_detail_size.children('label').remove()
    product_detail_size.html(`<span>Sizes:</span>`)

    for (let i = 0; i < size_series.length; i++) {
        if (size_series[i] !== undefined) {
            if (isInstockSize(variations, size_series[i])) {
                console.log("i:", i, ' - size_series[i]:', size_series[i]);
                product_detail_size.append(`
                      <label for="${size_series[i]}">${size_series[i]}
                        <input type="radio" id="${size_series[i]}" value="${size_series[i]}" name="size">
                      </label>`)
            }
            else
                product_detail_size.append(`
                      <label for="${size_series[i]}" style="pointer-events: none; opacity: 0.2">${size_series[i]}
                        <input type="radio" id="${size_series[i]}" value="${size_series[i]}" name="size">
                      </label>`)
        }
    }


    const product_detail_color = $(`#product-detail-color`)
    product_detail_color.children('label').remove()
    product_detail_color.html(`<span>Color:</span>`)

    let choose_color = undefined

    for (let i = 0; i < color_series.length; i++) {
        if (isInStockColor(variations, size, color_series[i]))
            product_detail_color.append(`  
                    <input type="radio" id="color${color_series[i]}" value="${color_series[i]}" name="color">
                    <label for="color${color_series[i]}" style="background-color: ${color_series[i]}"></label>
                `)
        else
            product_detail_color.append(`
                    <input type="radio" id="color${color_series[i]}" value="${color_series[i]}" name="color">
                    <label for="color${color_series[i]}"  style="pointer-events: none; background-color: ${color_series[i]}; opacity: 0.15"></label>
                `)

        // choose first color
        if (choose_color == undefined && isInStockColor(variations, size, color_series[i]) && field == "size") {
            choose_color = color_series[i]
            $("#color" + color_series[i]).prop("checked", true);
            $("input[name=color][value='" + color_series[i] + "']").prop("checked", true);
        } else {
            $("input[name=color][value='" + color + "']").prop("checked", true);
        }
    }

    $(`#product-detail-stock`).text(stock)

    //set active size
    const size_label = product_detail_size.children(`label[for=${size}]`)
    size_label.attr("class", "active")
    size_label.children(`input`).prop('checked', true)

    //set active color
    const color_label = product_detail_color.children(`label[for='${color}']`)
    color_label.attr("class", "active")
    color_label.children(`input`).prop('checked', true)
}

function run(field) {
    console.log("run:", field)
    const productID = $(`input[name=product-id]`).val()
    let size, color;

    const url = `/api/products/load/${productID}`
    $.get(url, function (data) {
        const variations = data.variations
        const size_series = []
        let color_series = []

        if (variations == null || variations.length == 0) {
            $(`.product__details__text`).html(`<h3>Coming soon...</h3>`)
            $(`#product-detail-review-section`).empty()
            return false;
        }

        for (let i = 0; i < variations.length; i++)
            if (!size_series.includes(variations[i].size))
                size_series.push(variations[i].size)

        size = $(`#product-detail-size input[name=size]:checked`).val()

        if (field == 'size') {
            for (let i = size_series.indexOf(size); i < size_series.length; i++) {
                size = size_series[i]
                color = findValidSize(variations, size)
                if (color != false)
                    break
            }
        } else
            color = $(`#product-detail-color input[name=color]:checked`).val()

        for (let i = 0; i < variations.length; i++)
            if (variations[i].size == size && !color_series.includes(variations[i].color))
                color_series.push(variations[i].color)

        let stock = 0
        for (let i = 0; i < variations.length; i++)
            if (variations[i].size == size && variations[i].color == color)
                stock = variations[i].stock

        console.log("size:", size, "color:", color, "stock:", stock);
        g_stock = stock;

        displayVariance(variations, size, color, size_series, color_series, stock, field)
    })
}

function postReview() {
    event.preventDefault()
    let stranger_name = null
    if ($('#review-stranger-name'))
        stranger_name = $('#review-stranger-name').val()
    const content = $('#review-content').val()

    const productID = $('#review-form input[type=hidden]').val()
    const url = `/api/products/review/${productID}`

    $.post(url, { stranger_name: stranger_name, content: content }, function (data) {
        const limit = 3

        //set empty for inputs
        $('#review-content').val('')
        $('#review-stranger-name').val('')

        const review_list = $('#review-list')
        const length = $('.review-box').length

        if (length === 0) {
            //clear sorry paragraph
            $('#empty-review-list').remove()

            //generate new pagination
            const pagination = $('#review-pagination')
            if (data.buffer)
                for (let i = 0; i < data.buffer.length; i++)
                    pagination.append(data.buffer[i])
        }

        if (length < limit) {
            //add review to list
            const date = new Date(data.reviews[0].createdAt)
            let name = data.reviews[0].fullname || stranger_name
            let avatar = data.reviews[0].avatar || "https://ssl.gstatic.com/docs/common/profile/nyancat_lg.png"

            review_list.prepend(`
            <div class="review-box">
                <div class="review-user-avatar">
                    <img src="${avatar}" alt="user's avatar"></img>
                </div>
                <div class="review-user-detail">
                    <h5>${name}</h5>
                    <span>${date}</span>
                    <p>${data.reviews[0].content}</p>
                </div>
            </div>
            <hr>`);


        } else if (length === limit) //prevent exceed page limit
            displayReviewPage(1)

    }).fail(function (data) {
        if (data.message === 401)
            window.location.href = '/auth/login/'
        else if (data.status === 400)
            alert(data.responseJSON.message)
    })
}

function displayReviewPage(page) {
    const productID = $('#review-form input[type=hidden]').val()

    const url = `/api/products/review/${productID}?page=${page}`
    $.get(url, function (data) {
        //get reference element

        const review_list = $('#review-list')
        const pagination = $('#review-pagination')

        review_list.empty()
        pagination.empty()

        //generate new review list
        for (let i = 0; i < data.reviews.length; i++) {
            const name = data.reviews[i].fullname || data.reviews[i].stranger_name
            const avatar = data.reviews[i].avatar || "https://ssl.gstatic.com/docs/common/profile/nyancat_lg.png"
            const date = new Date(data.reviews[i].createdAt)

            review_list.append(`                
            <div class="review-box">
                <div class="review-user-avatar">
                    <img src="${avatar}" alt="user's avatar"></img>
                </div>
                <div class="review-user-detail">
                    <h5>${name}</h5>
                    <span>${date}</span>
                    <p>${data.reviews[i].content}</p>
                </div>
            </div>
            <hr>`)
        }

        //generate new pagination
        for (let i = 0; i < data.buffer.length; i++)
            pagination.append(data.buffer[i])

    })
}

function change_quantity(type) {
    console.log("change_quantity:", type, ' - g_stock', g_stock);
    if (type == 'plus') {
        let value = parseInt($('#input-quantity').val()) + 1;
        if (value > g_stock)
            value = g_stock
        $('#input-quantity').val(value)
    }
    else if (type == 'sub') {
        let value = parseInt($('#input-quantity').val()) - 1;
        if (value < 1)
            value = 1

        $('#input-quantity').val(value)
    } else if (type == 'none') {
        $('#input-quantity').val(1)
    } else if (type == 'max') {
        let value = parseInt($('#input-quantity').val());
        if (value > g_stock)
            value = g_stock
        $('#input-quantity').val(value)
    }
}



window.onload = async function () {
    getProductByField('Random', '', 1);
    run('size')


}