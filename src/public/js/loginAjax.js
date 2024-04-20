function checkUsername(e) {
    $('#username-check').html('');
    fetch('/api/auth/username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: e.value
        })
    }).then(r => r.json()).then(r => {
        if (r.check) {
            $('#username-check').html('<i class="fas fa-check"></i>');
        } else {
            $('#username-check').html('<i class="fas fa-times"></i>');
        }
    });
}

function checkUsernameReset(e) {
    fetch('/api/auth/username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: e.value
        })
    }).then(r => r.json()).then(r => {
        if (r.check) {
            $('#username-check-rs').html('<i class="fas fa-check"></i>');
        } else {
            $('#username-check-rs').html('<i class="fas fa-times"></i>');
        }
    });
}

function resetPass() {
    fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: $('#username-rs').val()
        })
    }).then(r => r.json()).then(r => {
        $('#btn-rs').html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n');
        $('#body-rs').html('An email has been sent to ' + $('#username-rs').val() + ' with a link to reset your password.');
    });
}