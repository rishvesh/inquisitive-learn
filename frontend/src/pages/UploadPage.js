import React, { useState } from 'react';
import Layout from '../components/Layout';
import { uploadFile } from '../api';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
    const [file, setFile] = useState(null);
    const [qType, setQType] = useState('SA');
    const [qAmt, setQAmt] = useState(5);
    const [additionalRequests, setAdditionalRequests] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        if (!file) {
            setError('Please upload a file.');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('q-type', qType);
        formData.append('q-amt', qAmt);
        formData.append('additional-requests', additionalRequests);
    
        try {
            // Ensure `uploadFile` sends FormData without manually setting headers
            await uploadFile(formData);
            navigate('/response');
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        }
    };

    return (
        <Layout title="Upload">
            <div className="container mt-5">
                <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-4">
                        <h2>
                            <label htmlFor="file">Chapter PDF</label>
                        </h2>
                        <input type="file" id="file" name="file" className="form-control mt-2" onChange={(e) => setFile(e.target.files[0])} required />
                    </div>

                    <div className="mb-4">
                        <h3>
                            <label htmlFor="customRange3" className="form-label">
                                How many questions?
                            </label>
                        </h3>
                        <input
                            type="range"
                            name="q-amt"
                            className="form-range"
                            min="1"
                            max="20"
                            step="1"
                            value={qAmt}
                            id="customRange3"
                            onChange={(e) => setQAmt(e.target.value)}
                        />
                        <div className="mt-2">Amount of Questions: {qAmt}</div>
                    </div>

                    <div className="mb-4">
                        <h3>Type of Question</h3>
                        <div className="btn-group d-flex justify-content-between" role="group" aria-label="Question type selection">
                            <input type="radio" className="btn-check" name="q-type" value="MCQ" id="btnradio1" autoComplete="off" checked={qType === 'MCQ'} onChange={() => setQType('MCQ')} />
                            <label className="btn btn-outline-primary flex-fill" htmlFor="btnradio1">MCQ</label>
                            <input type="radio" className="btn-check" name="q-type" value="VSA" id="btnradio2" autoComplete="off" checked={qType === 'VSA'} onChange={() => setQType('VSA')} />
                            <label className="btn btn-outline-primary flex-fill" htmlFor="btnradio2">Very Short Answer</label>
                            <input type="radio" className="btn-check" name="q-type" value="SA" id="btnradio3" autoComplete="off" checked={qType === 'SA'} onChange={() => setQType('SA')} />
                            <label className="btn btn-outline-primary flex-fill" htmlFor="btnradio3">Short Answer</label>
                            <input type="radio" className="btn-check" name="q-type" value="LA" id="btnradio4" autoComplete="off" checked={qType === 'LA'} onChange={() => setQType('LA')} />
                            <label className="btn btn-outline-primary flex-fill" htmlFor="btnradio4">Long Answer</label>
                            <input type="radio" className="btn-check" name="q-type" value="CB" id="btnradio5" autoComplete="off" checked={qType === 'CB'} onChange={() => setQType('CB')} />
                            <label className="btn btn-outline-primary flex-fill" htmlFor="btnradio5">Case Based</label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3>Additional Requests:</h3>
                        <input
                            className="form-control"
                            id="additional-requests"
                            name="additional-requests"
                            placeholder="Additional Requests..."
                            type="text"
                            value={additionalRequests}
                            onChange={(e) => setAdditionalRequests(e.target.value)}
                        />
                    </div>

                    <div className="text-center">
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

export default UploadPage;