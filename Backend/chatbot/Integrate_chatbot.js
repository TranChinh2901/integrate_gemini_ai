require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const productModel = require("../model/product.model");

const genAI = new GoogleGenerativeAI(process.env.CHATBOT_API_KEY)
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
});

async function chatbot(question) {
    try {
        const products = await productModel.find({}).lean();
        const productData = products.map(
            (item) => `ID: ${item._id}, Tên sản phẩm: ${item.name}, Giá: ${item.price || 'Không rõ'}`
        ).join('\n');

        const prompt = `
Bạn là một trợ lý thông minh chuyên nghiệp trong website bán điện thoại, đây là danh sách sản phẩm trong cửa hàng:
${productData}

Câu hỏi của người dùng: ${question}
Hãy trả lời một cách tự nhiên và thân thiện.
Lưu ý trả lời phải có dấu câu và ngữ điệu tự nhiên như một con người.
Nếu bạn đề cập đến một sản phẩm cụ thể từ danh sách trên, hãy trình bày thông tin sản phẩm đó bằng cách sử dụng định dạng SAU (có thể thêm giải thích chú thích nếu cần):
PRODUCT_ITEM_START
ID: [ID của sản phẩm]
Tên: [Tên sản phẩm]
Giá: [Giá sản phẩm]
Hình ảnh: https://png.pngtree.com/png-clipart/20240314/original/pngtree-smartphone-mobile-phone-flat-style-cartoon-illustration-png-image_14588283.png

PRODUCT_ITEM_END
`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();
        return answer;

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Loi roi !!!'
        })
    }
}

exports.chatbot = chatbot