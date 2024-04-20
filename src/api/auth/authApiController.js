const userService = require("../../components/user/userService");

/**
 * check if the user exists
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.checkUserName = async (req, res) => {
    try {
        const check = await userService.checkUserName(req.body.username);
        if (check) {
            res.json({ check: true });
        } else {
            res.json({ check: false });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * check if the email exists
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.checkEmail = async (req, res) => {
    try {
        const check = await userService.checkEmail(req.body.email);
        if (check) {
            res.json({ check: true });
        } else {
            res.json({ check: false });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * sign up a new user
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.register = async (req, res) => {
    try {
        const register = await userService.Register(req.body);
        await userService.confirmForm(req.body.username, req.body.email);
        let message = register.message;
        let state = register.state;
        if (register === "success") {
            message = "Please check your email to confirm your account";
            state = true;
        } else if (register === "existed") {
            message = "Account already exist";
            state = false;
        } else if (register === "err") {
            message = "Something wrong when create new account";
            state = false;
        } else if (register === "email_exist") {
            message = "Email already exist";
            state = false;
        } else if (register === "input_error") {
            message = "Please input all field";
            state = false;
        }

        res.send({ message, state });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * forgot password
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.forgotPassword = async (req, res) => {
    try {
        const user = await userService.checkUserName(req.body.username);
        await userService.resetPasswordForm(user.email);
        res.send({ message: "Send email success", state: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**
 * reset password
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
exports.resetPassword = async (req, res) => {
    try {
        const user = await userService.verifyUser(req.body.username, req.body.password);
        if (user) {
            await userService.resetPasswordForm(user.email);
            res.send({ state: true });
        } else {
            res.send({ state: false });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

