const productModel = require("../model/product.model");


const createProduct = async (req, res) => {
    try {
        console.log('Dữ liệu nhận được:', req.body);
        const newProduct = new productModel(req.body);
        const savedProduct = await newProduct.save();
        res.status(200).json({
            message: 'Tạo sản phẩm mới thành công',
            savedProduct
        })
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({
            message: 'Lỗi khi tạo sản phẩm mới',
            error: error.message,
        })
    }
}
const getAllProduct = async (req, res) => {
    try {
        const products = await productModel.find();
        res.status(200).json(
            {
                success: true,
                message: 'Lấy danh sách sản phẩm thành công',
                products
            }
        )
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Loi roi !!!'
        })
    }
}
module.exports = {
    createProduct,
    getAllProduct
}