import { app } from "./app";
import ConnectToDB from "./db/db";
import { logger } from "./utils/winstonLogger";
import cloudinary from "cloudinary";


const port = process.env.PORT || 4000;

// Database
ConnectToDB(); 
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.listen(port, () => logger.info(`Server is running on port ${port}`));

