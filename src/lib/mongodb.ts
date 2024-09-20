import mongoose from "mongoose";

const MONGO_URL = "mongodb://127.0.0.1/ferreteria";

export const connectMongoDB = async () => {
    try{
        await mongoose.connect(MONGO_URL);
        console.log("Conectado a MongoDB");
    }
    catch (error){
        console.log(error);
    }
};