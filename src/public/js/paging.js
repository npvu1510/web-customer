// pagination function
module.exports.paging = (data, page, limit) => {
    // get the total number of pages
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = {};

    // check if there is a next page
    if (endIndex < data.length) {
        result.next = page + 1;
    } else {
        result.disableNext = 'pointer-events: none;';
        result.hiddenNext = 'hidden';
        result.numberNext = 'display: none;';
    }

    // check if there is a previous page
    if (startIndex > 0) {
        result.prev = page - 1;
    } else {
        result.disablePrev = 'pointer-events: none;';
        result.hiddenPrev = 'hidden';
        result.numberPrev = 'display: none;';
    }

    // get the data for the current page
    result.page = page;
    result.data = data.slice(startIndex, endIndex);
    result.start = startIndex + 1;

    if (data.length > endIndex) {
        result.end = endIndex;
    } else {
        result.end = data.length;
    }
    result.total = data.length;

    return result;
}

module.exports.reviewPaging = (data, page) => {
    const limit = 3
    let buffer = [];

    const totalPage=Math.ceil(data.length/limit);
    const productID = 0
    //slice within limit
    let start = (page - 1) * limit;
    let end = page * limit;

    if (end >= data.length)
        end = data.length
    data = Object.values(data)
    data = data.slice(start, end)

    //if not exceed a first page
    if (parseInt(page) == 1 && data.length < limit)
    {
        buffer =null
        return {buffer,data};
    }

    if (page <= totalPage) {
        buffer.push(`<a class="prev_page" onclick="displayReviewPage(${page - 1})">Prev</a>`);
        buffer.push(`<a onclick="displayReviewPage(1)">1</a>`);

        if (totalPage <= 4)
            for (let i = 2; i <= totalPage; i++)
                buffer.push(`<a onclick="displayReviewPage(${i})">${i}</a>`);

        else {
            if (page <= 3) {
                for (let i = 2; i <= Math.min(3, totalPage); i++)
                    buffer.push(`<a onclick="displayReviewPage(${i})">${i}</a>`);

                if (page === 3) {
                    if (totalPage > 3) {
                        buffer.push(`<a onclick="displayReviewPage(4)">4</a>`);
                    }
                }

                if (totalPage - 2 > 2) {
                    buffer.push(`<span>...</span>`);
                    buffer.push(`<a onclick="displayReviewPage(${totalPage})">${totalPage}</a>`);
                }
            } else if (page > 3) {
                buffer.push(`<span>...</span>`);

                if (totalPage - page > 2) {

                    for (let i = page - 1; i <= page; i++) {
                        buffer.push(`<a  onclick="displayReviewPage(${i})">${i}</a>`);
                    }
                    buffer.push(`<a  onclick="displayReviewPage(${page + 1})">${page + 1}</a>`);
                    buffer.push(`<span>...</span>`);
                    buffer.push(`<a onclick="displayReviewPage(${totalPage})">${totalPage}</a>`);
                } else {
                    if (page === totalPage - 2) {
                        buffer.push(`<a onclick="displayReviewPage(${page - 1} )">${page - 1}</a>`);
                    }

                    for (let i = totalPage - 2; i <= totalPage; i++) {
                        buffer.push(`<a onclick="displayReviewPage(${i})">${i}</a>`);
                    }
                }

            }
        }
        if (page < totalPage)
            buffer.push(`<a class="next_page" onclick="displayReviewPage(${page + 1})">Next</a>`);

        for (let i=0; i < buffer.length; i++)
        {
            const pos = buffer[i].indexOf(page)
            if (pos !=-1)
            {
                buffer[i] = buffer[i].slice(0,3) + 'class = "active"' + buffer[i].slice(2)
                return {buffer,data};
            }

        }

    }
}