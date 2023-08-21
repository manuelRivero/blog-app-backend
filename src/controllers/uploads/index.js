
import cloudinary from "../../helpers/imageUpload/index.js";


export const uploadImage = {
    do:async(req, res) => {
        const {image} = req.files
        try {
            const imageUrl = await cloudinary.uploader.upload(
              image.tempFilePath,
              { folder: "blogs-uploads" }
            );
            res.status(200).json({
                url: imageUrl.secure_url
            })
          } catch (error) {
            res.status(400).json({ ok: false, error: "Error al subir la imagen" });
            console.log("error al subir la imagen", error);
          }
    }
}