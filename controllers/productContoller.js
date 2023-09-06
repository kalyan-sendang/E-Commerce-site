const Product = require("../models/productModel")
const User = require("../models/userModel")
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");


//create Product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
})

//update product

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.title) {
        req.body.slug = slugify(req.body.title)
    }
    try {
        const update = await Product.findByIdAndUpdate(
            id, req.body,
            {
                new: true,
            })
        res.json(update);
    } catch (error) {
        throw new Error(error);
    }
})

//delete product


const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id)
        res.json(deletedProduct)
        if (deletedProduct) {
            res.json("The product is deletes successfully");
        } else {
            throw new Error("The Product is not deleted");
        }
    } catch (error) {
        throw new Error(error);
    }
})

//get a single product
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id)
        res.json(findProduct);
    } catch (error) {
        throw new Error(error)
    }
})

// get all product
const getallProduct = asyncHandler(async (req, res) => {
    try {

        //filtering according to price
        const queryObj = { ...req.query }
        const excludeFields = ["page", "sort", "limit", "fields"]
        excludeFields.forEach((el) => delete queryObj[el])
        let queryStr = JSON.stringify(queryObj);//object to string
        queryStr = queryStr.replace(/\b gte|gt|lte|lt\b/g, (match) => `$${match}`);//changes normal gte/gt/lte/lt to $gte/$gt/$lte/$lt

        let query = Product.find(JSON.parse(queryStr))//changes back to js object

        //sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy)
        } else {
            query = query.sort("createdAt")
        }

        //limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields)
        } else {
            query = query.select('-__v')
        }

        //pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);//pagination is done to skip req no.. of product and limit no. of page to be shown
        if (req.query.page) {
            const productCount = await Product.countDocuments();//counts total no. of products
            if (skip >= productCount) throw new Error("This page doesnot exist")
        }
        console.log(page, limit, skip)

        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error(error)
    }
})

//add to wishlist

const addToWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId)
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: {
                        wishlist: prodId
                    },
                },
                {
                    new: true
                },
            )
            res.json(user)
        } else {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $push: {
                        wishlist: prodId
                    },
                },
                {
                    new: true
                }
            )
            res.json(user)
        }

    } catch (error) {
        throw new Error(error)
    }
})
 //rating

 const rating = asyncHandler(async(req, res)=>{

 })
module.exports = {
    createProduct,
    getaProduct,
    getallProduct,
    updateProduct,
    deleteProduct,
    addToWishList,
    rating,
}