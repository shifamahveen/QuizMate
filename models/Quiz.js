// models/Quiz.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path to your database configuration

class Quiz extends Model {}

Quiz.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quiz_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Quiz',
    tableName: 'quizzes', // Adjust the table name if needed
    timestamps: true // Set to false if you don't want timestamps
});

module.exports = Quiz;
