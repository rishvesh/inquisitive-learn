import React, { useState, useCallback, useEffect, useRef } from 'react';
import '../ResponsePage.css';

function QuestionAnswerCard({ question, answer, onShowPopup }) {
    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [cardHeight, setCardHeight] = useState(0);
    const questionRef = useRef(null);
    const answerRef = useRef(null);
    const cardRef = useRef(null);

    const toggleVisibility = useCallback(() => {
        setIsAnswerVisible(prevState => !prevState);
    }, []);

    useEffect(() => {
        const initialHeight = questionRef.current ? questionRef.current.offsetHeight + 30 : 100;
        setCardHeight(initialHeight);
    }, []);

    useEffect(() => {
        if (cardRef.current && questionRef.current && answerRef.current) {
            let newHeight;
            if (!isAnswerVisible) {
                newHeight = questionRef.current.offsetHeight + 30;
            } else {
                newHeight = answerRef.current.offsetHeight + 60;
            }
            setCardHeight(newHeight);
        }
    }, [isAnswerVisible]);

    const handleClickCard = useCallback((event) => {
        if (!event.target.classList.contains('add-to-folder')) {
            toggleVisibility();
        }
    }, [toggleVisibility]);

    return (
        <div
            className="q1"
            style={{ height: `${cardHeight}px` }}
            onClick={handleClickCard}
            onMouseOver={() => {
                const contentHeight = !isAnswerVisible ? questionRef.current?.offsetHeight : answerRef.current?.offsetHeight;
                setCardHeight(contentHeight + 60);
            }}
            onMouseOut={() => {
                const contentHeight = !isAnswerVisible ? questionRef.current?.offsetHeight : answerRef.current?.offsetHeight;
                setCardHeight(contentHeight + 30);
            }}
            ref={cardRef}
        >
            <div className="question" style={{ opacity: isAnswerVisible ? 0 : 1 }} dangerouslySetInnerHTML={{ __html: question }} ref={questionRef} />
            <div className="answer" style={{ opacity: isAnswerVisible ? 1 : 0 }} dangerouslySetInnerHTML={{ __html: answer }} ref={answerRef} />
            <button
                className="btn btn-primary btn-sm add-to-folder"
                onClick={onShowPopup}
            >
                Add to folder
            </button>
        </div>
    );
}

export default QuestionAnswerCard;