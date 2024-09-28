const Joi = require('joi');
module.exports.ListingSchema = Joi.object({
  
        title: Joi.string().required(),
        desc: Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        image: Joi.string().allow("",null)


   
}).required()
module.exports.reviewsSchema = Joi.object({
  
        rating: Joi.number().required(),
        comment: Joi.string().required()
        


   
}).required()