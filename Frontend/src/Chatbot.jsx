
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot } from 'lucide-react';
import styles from './Chatbot.module.css';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API;


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleProductClick = (productId) => {
    if (productId && productId !== 'Không rõ') {
      navigate(`/detail/${productId}`);
      setIsOpen(false);
    } else {
      console.warn("Product ID is missing, cannot navigate.");
    }
  };

  // Hàm phân tích nội dung bot và tìm các mục sản phẩm
  const parseBotMessage = (content) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /PRODUCT_ITEM_START([\s\S]*?)PRODUCT_ITEM_END/g;
    let match;

    while ((match = regex.exec(content)) !== null) {

      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.substring(lastIndex, match.index).trim() });
      }


      const itemContent = match[1].trim();
      const productDetails = {};
      itemContent.split('\n').forEach(line => {
        const [keyWithColon, ...valueParts] = line.split(':');
        const key = keyWithColon.trim();
        const value = valueParts.join(':').trim();
        if (key === 'ID') productDetails.id = value;
        if (key === 'Tên') productDetails.name = value;
        if (key === 'Giá') productDetails.price = value;
        // if (key === 'Hình ảnh') productDetails.image = value;
      });

      if (productDetails.id && productDetails.name) {
        parts.push({ type: 'product', data: productDetails });
      } else {

        parts.push({ type: 'text', text: match[0] });
      }
      lastIndex = regex.lastIndex;
    }


    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex).trim();
      if (remainingText) {
        parts.push({ type: 'text', text: remainingText });
      }
    }

    // Nếu không có mục sản phẩm nào được tìm thấy, trả về toàn bộ nội dung dưới dạng văn bản
    if (parts.length === 0 && content) {
      parts.push({ type: 'text', text: content });
    }

    return parts;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/chatbot`, {
        question: userMessage
      });
      setChatHistory(prev => [...prev, { type: 'bot', content: res.data.answer }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      let errorMessage = 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.';
      if (error.response && error.response.data && error.response.data.answer) {
        errorMessage = error.response.data.answer;
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setChatHistory(prev => [...prev, {
        type: 'bot',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatbotWrapper}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      <div className={`${styles.chatbotContainer} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.chatHeader}>
          <Bot className={styles.headerIcon} />
          <h5 className={styles.headerTitle}>Trợ lý cửa hàng</h5>
        </div>

        <div ref={chatContainerRef} className={styles.chatMessages}>
          {chatHistory.length === 0 && !loading && (
            <div className={styles.welcomeMessage}>
              <Bot className={styles.welcomeIcon} />
              <p>Xin chào! Tôi là trợ lý bán hàng, tôi có thể giúp gì cho bạn?</p>
            </div>
          )}
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`${styles.messageRow} ${chat.type === 'user' ? styles.userMessageRow : styles.botMessageRow}`}
            >
              <div className={`${styles.messageContent} ${chat.type === 'user' ? styles.userMessageContent : styles.botMessageContent}`}>
                <div className={`${styles.avatar} ${chat.type === 'user' ? styles.userAvatar : styles.botAvatar}`}>
                  {chat.type === 'user' ? <User className={styles.avatarIcon} /> : <Bot className={styles.avatarIcon} />}
                </div>
                <div className={`${styles.messageBubble} ${chat.type === 'user' ? styles.userBubble : styles.botBubble}`}>
                  {chat.type === 'bot' ? (
                    parseBotMessage(chat.content).map((part, partIndex) => {
                      if (part.type === 'product' && part.data) {
                        return (
                          <div
                            key={`${index}-product-${partIndex}`}
                            className={styles.productCard}
                            onClick={() => handleProductClick(part.data.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleProductClick(part.data.id); }} // Accessibility
                          >
                            {/* {part.data.image && part.data.image !== 'Không rõ' && (
                                                            <img src={part.data.image} alt={part.data.name} className={styles.productImage} />
                                                        )} */}
                            <img className={styles.productImage} src="https://png.pngtree.com/png-clipart/20240314/original/pngtree-smartphone-mobile-phone-flat-style-cartoon-illustration-png-image_14588283.png" alt="" />
                            <div className={styles.productInfo}>
                              <p className={styles.productName}>{part.data.name}</p>
                              <p className={styles.productPrice}>
                                {parseFloat(part.data.price.replace(/[^\d]/g, '')).toLocaleString()}đ
                              </p>
                            </div>

                          </div>
                        );
                      } else if (part.type === 'text' && part.text) {
                        return <p key={`${index}-text-${partIndex}`} className={styles.messageText}>{part.text}</p>;
                      }
                      return null; // Trường hợp không có gì để hiển thị từ part
                    })
                  ) : (
                    <p className={styles.messageText}>{chat.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className={styles.botMessageRow}>
              <div className={styles.botMessageContent}>
                <div className={`${styles.avatar} ${styles.botAvatar}`}>
                  <Bot className={styles.avatarIcon} />
                </div>
                <div className={`${styles.messageBubble} ${styles.botBubble}`}>
                  <div className={styles.loadingDots}>
                    <div className={`${styles.dot} ${styles.dot1}`}></div>
                    <div className={`${styles.dot} ${styles.dot2}`}></div>
                    <div className={`${styles.dot} ${styles.dot3}`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className={styles.inputField}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className={`${styles.sendButton} ${(loading || !message.trim()) ? styles.buttonDisabled : ''}`}
          >
            <Send className={styles.buttonIcon} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;