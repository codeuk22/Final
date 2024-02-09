import Joi from "joi";

const userRegisterSchema=Joi.object({

    username:Joi.string().required().trim(),
    fullName:Joi.string().required().trim(),
    email:Joi.string().email().required().trim(),
    password:Joi.string().required(),
    confirmPassword:Joi.string().valid(Joi.ref("password")).required(),
    avatar:Joi.string(),
    coverImage:Joi.string(),

})

const userLoginSchema=Joi.object({

    email:Joi.string().email().required().trim(),
    password:Joi.string().required().trim(),
})

const userUpdateSchema=Joi.object({

    fullName:Joi.string().required().trim(),
    username:Joi.string().required().trim(),
    email:Joi.string().email().required().trim(),
    avatar:Joi.string(),
    coverImage:Joi.string(),

})

export const validateUserRegister=(req:any,res:any,next:any)=>{

    const {error}=userRegisterSchema.validate(req.body)
    if(error){
        return res.status(400).json({
            error:error.details[0].message.split('\"').join("")
        })
    }
    next()
}

export const validateUserLogin=(req:any,res:any,next:any)=>{

    const {error}=userLoginSchema.validate(req.body)
    if(error){
        return res.status(400).json({
            error:error.details[0].message.split('\"').join("")
        })
    }
    next()
}

export const validateUserUpdate=(req:any,res:any,next:any)=>{

    const {error}=userUpdateSchema.validate(req.body)
    if(error){
        return res.status(400).json({
            error:error.details[0].message.split('\"').join("")
        })
    }
    next()
}