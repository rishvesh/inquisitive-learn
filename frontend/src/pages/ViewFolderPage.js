import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import QuestionAnswerCard from '../components/QuestionAnswerCard';
import FolderPopup from '../components/FolderPopup';
import { viewFolder } from '../api';
import '../ResponsePage.css'; // Ensure you have the CSS

function ViewFolderPage() {
    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentAnswer, setCurrentAnswer] = useState(null);

    const fetchFolderData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await viewFolder(id);
            setQuestions(response.data.questions.map((q, index) => ({
                id: index, // Add a temporary id for mapping
                question: q,
                answer: response.data.answers[index],
            })));
        } catch (error) {
            console.error("Error fetching folder data:", error);
            setError('Failed to load folder questions.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFolderData();
    }, [fetchFolderData]);

    const showPopup = useCallback((event, question, answer) => {
        const container = document.getElementById('view-folder-container');
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

    return (
        <Layout title="View Folder">
            <div id="view-folder-container" style={{ position: 'relative' }}>
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
}

export default ViewFolderPage;