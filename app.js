const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userModel = require('./models/userModel');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require("swagger-ui-express")
const path = require("path")
const app = express();

const expect = {
definition:{
    openapi:"3.0.0",
    info:{
        title:"chatbot",
        version:"1.0.0"
    },
    servers:[
        {
            url:"http://localhost:3000"
        }
    ]
},
apis:[`${path.join(__dirname,"./routes/*.js")}`]
}

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use("/doc", swaggerUi.serve,swaggerUi.setup(swaggerJsdoc(expect)))
app.use('/', userRoutes);
app.use('/', chatRoutes);

// Crear tabla de usuarios si no existe
userModel.createTableIfNotExists();

module.exports = app;
