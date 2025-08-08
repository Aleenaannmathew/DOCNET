# DOCNET - Telehealth Platform

**DOCNET** is a secure, scalable, and AI-integrated telehealth platform that enables seamless interaction between healthcare professionals and patients. It offers end-to-end virtual healthcare solutions including doctor discovery, appointment booking, video consultations, real-time chat, and AI-based assistance—all from a unified digital environment.

---

## 🧩 Project Overview

DOCNET is designed to streamline virtual healthcare by providing a reliable platform for:

- Patients to connect with licensed medical professionals.
- Doctors to manage their consultations, schedules, and patient records.
- Admins to oversee the platform’s operations, analytics, and user management.

---

## 🌟 Key Features

- 🔍 **Doctor Profiles**: View detailed information including specialization, experience, availability, and ratings.
- 📅 **Booking System**: Real-time appointment scheduling with calendar integration.
- 🎥 **Live Streaming**: Secure, real-time video consultations.
- 💬 **Chat Integration**: Real-time messaging between doctors and patients.
- 🔐 **Secure Authentication**: JWT-based login/signup and protected routes.
- 🧠 **AI Assistance**: Intelligent assistant for symptom checking and appointment guidance.
- 🛠 **Admin Panel**: Role-based access for managing users, doctors, analytics, and content.
- 📊 **Analytics Dashboard**: Insightful metrics and platform usage statistics.

---

## 🛠 Tech Stack

### 🔙 Backend – **Django & Django REST Framework**

- RESTful API architecture
- JWT authentication
- Modular apps (Users, Doctors, Bookings, Chat, AI)
- PostgreSQL database
- Role-based permission system

### 🌐 Frontend – **React.js with Redux**

- Component-based architecture
- **Redux** for global state management
- **React Router** for dynamic routing/navigation
- **Axios** for API communication
- **Formik + Yup** for form validation
- **Tailwind CSS** for modern, responsive UI

---

## ⚙️ Installation & Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/your-username/docnet.git
cd docnet/backend

# Create a virtual environment and activate it
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

## 🧪 Sample `.env` Configuration

Create a `.env` file in the root of your backend and add the following:

```env
# SECURITY
SECRET_KEY=your-secret-key
DEBUG=True

# DATABASE
DATABASE_NAME=your-db-name
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# EMAIL
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password

# CLOUDINARY 
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# GOOGLE OAUTH
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# RAZORPAY
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# CASHFREE
CASHFREE_CLIENT_ID=your-cashfree-client-id
CASHFREE_CLIENT_SECRET=your-cashfree-client-secret
CASHFREE_PAYOUT_BASE_URL=https://sandbox.cashfree.com/payout

# Run migrations and start server
python manage.py migrate
python manage.py runserver
