📖 FitTrack
FitTrack is a comprehensive health and diet management web application developed using React, Bootstrap, Spring Boot, and PostgreSQL. The platform offers personalized health tracking, diet planning, and communication between users and dietitians, all under the supervision of an admin panel.

📌 Technologies Used
⚛️ React — Frontend framework

🎨 Bootstrap — Styling and responsive design

☕ Spring Boot — Backend REST API services

🐘 PostgreSQL — Relational database system

🎯 Features
👤 User Roles
There are three different roles in the system:

Admin

Dietitian

Patient (User)

📑 Role-Based Functionalities
🛡️ Admin Panel
View and manage all registered users

Approve or reject dietitian application requests from users

Manage system integrity and data consistency

🍏 Dietitian Dashboard
View a list of patients who selected them as their dietitian

Create and assign custom diet plans for patients

Chat and communicate with patients via an integrated messaging system

🧑‍⚕️ Patient (User) Panel
Register and log in to the system

Input personal data such as height, weight, and blood sugar levels

Calculate BMI (Body Mass Index)

Select a preferred diet type

Choose a dietitian for personalized guidance

Track daily calorie intake based on selected diet plan

Communicate directly with their dietitian

Submit a request to become a dietitian to the admin panel

📊 Key Functional Modules
Authentication & Authorization (role-based access control)

BMI Calculator

Calorie Calculator based on selected diet types

Dietitian Selection System

Diet Plan Management

Messaging Module between dietitians and patients

Admin Control Panel

📂 Project Structure
bash
Kopyala
Düzenle
/backend (Spring Boot)
/frontend (React + Bootstrap)
/database (PostgreSQL)
🚀 Getting Started
Backend Setup:
Navigate to /backend directory

Configure application.properties for PostgreSQL connection

Run:

bash
Kopyala
Düzenle
./mvnw spring-boot:run
Frontend Setup:
Navigate to /frontend directory

Install dependencies:

bash
Kopyala
Düzenle
npm install
Start the React development server:

bash
Kopyala
Düzenle
npm start
📌 Note
This project was built for academic and portfolio purposes and can be extended with additional features such as:

Appointment scheduling

Diet history tracking

Health analytics dashboards
