import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import { getGeneratedQuestions } from '../api';
import '../ResponsePage.css';
import QuestionAnswerCard from '../components/QuestionAnswerCard';
import FolderPopup from '../components/FolderPopup'; // Import the new component

const ResponsePage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentAnswer, setCurrentAnswer] = useState(null);

    const showPopup = useCallback((event, question, answer) => {
        const container = document.getElementById('questions-container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const rect = event.target.getBoundingClientRect();
            setPopupPosition({
                left: rect.left - containerRect.left,
                top: rect.bottom - containerRect.top,
            });
            setIsPopupVisible(true);
            setCurrentQuestion(question);
            setCurrentAnswer(answer);
        }
    }, []);

    const hidePopup = useCallback(() => {
        setIsPopupVisible(false);
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getGeneratedQuestions();
                setQuestions(response.data);
            } catch (error) {
                console.error("Error fetching generated questions:", error);
                setError("Error fetching generated questions.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    return (
        <Layout title="Response">
            <div id="questions-container" style={{ position: 'relative' }}>
                {loading && <p>Loading questions...</p>}
                {error && <p className="text-danger">{error}</p>}
                {questions.map((item) => (
                    <QuestionAnswerCard
                        key={item.id}
                        question={item.question}
                        answer={item.answer}
                        onShowPopup={(event) => showPopup(event, item.question, item.answer)}
                    />
                ))}
                <FolderPopup
                    isVisible={isPopupVisible}
                    position={popupPosition}
                    question={currentQuestion}
                    answer={currentAnswer}
                    onClose={hidePopup}
                />
            </div>
        </Layout>
    );
};

export default ResponsePage;