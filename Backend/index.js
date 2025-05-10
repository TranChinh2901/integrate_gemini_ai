const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const productRouter = require('./router/product.router');
const { chatbot } = require('./chatbot/Integrate_chatbot');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot_gemini')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/v1', productRouter)

app.post('/api/chatbot', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Câu hỏi không được để trống'
            })
        }
        const answer = await chatbot(question);
        res.status(200).json({
            success: true,
            message: 'Trả lời thành công',
            answer
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Loi roi !!!'
        })
    }

})


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

