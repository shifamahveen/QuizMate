// models/Question.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path to your database configuration

class Question extends Model {}

Question.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quizzes', // Name of the quizzes table
            key: 'id'
        }
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_a: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_b: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_c: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_d: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correct_answer: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Question',
    tableName: 'questions', // Adjust the table name if needed
    timestamps: true // Set to false if you don't want timestamps
});

module.exports = Question;
