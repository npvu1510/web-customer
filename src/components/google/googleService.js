const userModel = require("../user/userModel");

/**
 * register
 * @param profile {object}
 * @returns {Promise<user||false>}
 */
module.exports.verifyGoogle = async (profile) => {
    try {
        if (profile.id) {
            const user = await userModel.findOne({ googleId: profile.id })
            if (user) return user;
        }
        return false;
    } catch (err) {
        throw err;
    }
}

/**
 * register
 * @param profile {object}
 * @returns {Promise<*>}
 */
module.exports.addUserGoogle = async (profile) => {
    try {
        let check = await this.verifyGoogle(profile);

        if (!check) {
            const now = (new Date()).toString().split(" ");
            const user = {
                googleId: profile.id,
                username: profile.displayName,
                fullname: profile.name.familyName + ' ' + profile.name.givenName,
                email: profile.email,
                role: "User",
                employed: now[2] + ' ' + now[1] + ',' + now[3],
                address: profile.locale || "",
                phone: "",
                intro: "",
                total: 0,
                confirm: true,
                status: "Unbanned",
                avatar_url: profile.picture || "https://res.cloudinary.com/web-hcmus/image/upload/v1648341181/Default_avatar/default-avtar_wmf6yf.jpg", //default avatar
            }
            // insert
            const result = await userModel.insertMany(user)

            if (result) return "register: Create new account success&state=true";
            else return "register: Can not create new account&state=false";

        } else {
            return "register: This account already existed&state=false";
        }
    } catch (err) {
        throw err;
    }
}

