import React, { useState } from 'react';
import axios from 'axios';
import { userAxios } from '../../axios/UserAxios';

const ReviewModal = ({ doctorUsername, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const submitReview = async () => {
    if (!rating || !comment.trim()) {
      setError('Rating and comment are required.');
      return;
    }

    try {
       await userAxios.post(`/doctor-reviews/${doctor.username}/submit/`, {
              rating: reviewRating,
              comment: appointmentReason
            });
      

      onClose(); // close the modal after successful submission
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 space-y-4">
        <h2 className="text-xl font-semibold">Rate Your Doctor</h2>

        {error && <p className="text-red-500">{error}</p>}

        <div>
          <label className="block mb-1">Rating (1 to 5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={e => setRating(parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Comment</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows="3"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={submitReview} className="px-4 py-2 bg-blue-600 text-white rounded">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
