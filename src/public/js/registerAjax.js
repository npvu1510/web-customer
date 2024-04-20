function checkUsername(e) {
    fetch('/api/auth/username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: e.value
        })
    }).then(r => r.json()).then(r => {
        if (r.check) $('#error').html('<span class="text-danger">Username already taken</span>');
        else $('#error').html('');
    });
}

function checkGmail(e) {
    fetch('/api/auth/email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: e.value
        })
    }).then(r => r.json()).then(r => {
        if (r.check) $('#error').html('<span class="text-danger">Gmail already taken</span>');
        else $('#error').html('');
    });
}

function checkPassword(e) {
    let pass =  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    if(!e.value.match(pass))
        $('#error').html('<span class="text-danger">Password must be 8-15 characters long, contain at least one lowercase letter, one uppercase letter, one number, and one special character</span>');
    else $('#error').html('');
}

function signUp() {
    if ($('#username').val() === '' || $('#passwd').val() === '' || $('#gmail').val() === '') {
        $('#error').html('<p class="text-danger">Please fill all fields</p>');
        return;
    }
    let pass =  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    if($('#passwd').val().match(pass)) {
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: $('#username').val(),
                password: $('#passwd').val(),
                email: $('#gmail').val()
            })
        }).then(r => r.json()).then(function (data) {
            if (data.state)
                $('#error').html(`<span style="color:green;" > ${data.message} </span>`)
            else {
                $('#error').html(`<span  style="color:red;"> ${data.message} </span>`)
            }
        })
    } else {
        $('#error').html('<span class="text-danger">Password not complexity enough</span>');
    }

}