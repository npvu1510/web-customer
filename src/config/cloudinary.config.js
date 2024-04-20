require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config(process.env.CLOUDINARY_URL);

module.exports.upload = async (file, directory) => {
    let result;
    if (file) {
        result = await cloudinary.uploader.upload(file, {
            folder: directory,
            use_filename: true,
        });
    }
    // get image url
    let { url } = result ?? "";
    if (url === undefined || url === "") {
        // default avatar
        url = 'https://res.cloudinary.com/web-hcmus/image/upload/v1648341181/Default_avatar/default-avtar_wmf6yf.jpg';
    }
    return url;
};
