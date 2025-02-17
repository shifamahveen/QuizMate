# QuizMate: AI-Driven Group Assessment & Evaluation 📝🎯  

## 🚀 Introduction  
**QuizMate** is an AI-powered assessment platform designed to facilitate group quizzes, analyze performance, and provide insightful AI-driven evaluations. It enables users to take quizzes, track accuracy and completion scores, and offers intelligent feedback to improve performance. 📊🧠  

## 🎯 Features  
- **Admin Quiz Management** – Create, update, delete, and manage quizzes.  
- **AI-Powered Evaluation** – Analyzes quiz performance, highlighting strengths and weaknesses.  
- **User Analytics & Accuracy Metrics** – Tracks completion scores, quiz accuracy, and performance trends.  
- **Leaderboard System** – Ranks users based on their scores, fostering healthy competition.  
- **Reattempt Settings** – Admins can allow/disallow quiz reattempts.  
- **Email Notifications** – Sends automatic notifications when a new quiz is created.  
- **Sleek & Responsive UI** – Built using **Tailwind CSS** for a modern and intuitive experience.  

## 🛠️ Tech Stack  
- **Backend:** Node.js, Express.js  
- **Frontend:** Tailwind CSS, Alpine.js  
- **Database:** MySQL  
- **Authentication & Roles:** Csurf, Express Session  

## 🚀 Getting Started  

### 1️⃣ Clone the Repository  
```sh  
git clone https://github.com/yourusername/quizmate.git  
cd quizmate  
```

### 2️⃣ Setup Database Credentials  
```js  
const mysql = require('mysql2');

const db = mysql
  .createPool({
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'databasename',
  })
  .promise();

module.exports = db;
```

### 3️⃣ Setup Database  
```sql  
-- Create the 'users' table  
CREATE TABLE users (  
    id INT AUTO_INCREMENT PRIMARY KEY,  
    username VARCHAR(255) NULL,  
    email VARCHAR(255) NOT NULL UNIQUE,  
    password VARCHAR(255) NOT NULL,  
    phone VARCHAR(20) NULL,  
    location VARCHAR(255) NULL,  
    gender VARCHAR(20) NULL,  
    role VARCHAR(20) DEFAULT 'user'  
);

-- Create the 'quizzes' table  
CREATE TABLE quizzes (  
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,  
    quiz_name VARCHAR(255) NOT NULL,  
    description VARCHAR(255) NULL,  
    send_email TINYINT(1) NOT NULL DEFAULT 0,  
    reattempt TINYINT(1) NOT NULL DEFAULT 1  
);

-- Create the 'questions' table  
CREATE TABLE questions (  
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,  
    quiz_id INT NULL,  
    question TEXT NOT NULL,  
    option_a TEXT NULL,  
    option_b TEXT NULL,  
    option_c TEXT NULL,  
    option_d TEXT NULL,  
    correct_answer CHAR(1) NULL  
);

-- Create the 'quiz_attempts' table  
CREATE TABLE quiz_attempts (  
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,  
    user_id INT NULL,  
    quiz_id INT NULL,  
    score DECIMAL(5,2) NULL,  
    attempt_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP  
);
```

### 4️⃣ Start the Server  
```sh  
node app.js  
```  

Now you’re all set to use **QuizMate**! 🚀📊

