import mongoose,{Schema,Document,ObjectId} from "mongoose";


export interface IUser {
    _id: ObjectId | string | undefined;
    email:string
    password: string
    createAt:string
    updateAt:string
}

export interface IUserSchema extends Document {
    _doc: { [x: string]: any; password: any; };
    _id: ObjectId | string | undefined;
    email: string;
    password:string;
    createAt: string;
    updateAt: string;
}

const UserSchema: Schema = new Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        }
        
    },
    {
        versionKey:false,
        timestamps:true
    }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;