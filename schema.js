const joi = require("joi");


//Creatting schema for validating form data using external package
module.exports.listingSchema = joi.object({
    listing : joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location: joi.string().required(),
        country:  joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.object({
            url: joi.string().allow("", null)
        })
    }).required()
})