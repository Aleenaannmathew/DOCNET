import React from 'react';

const TestimonialCard = ({ text, author, role }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
      <div className="text-gray-800 italic">"{text}"</div>
      {author && (
        <div className="mt-4 flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            {author.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-800">{author}</p>
            {role && <p className="text-gray-500 text-sm">{role}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialCard;