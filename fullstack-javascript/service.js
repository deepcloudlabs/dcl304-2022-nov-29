import logger from "morgan";
import express from "express";
import bodyParser from "body-parser";

// Layered Architecture
// Database                   : MongoDB  ✔  Schema-less
// Persistence Layer          : Mongoose -> Schema -> Model ✔
//region Persistence Layer
import * as mongoose from "mongoose";
import {connect, model, mongo, Schema, Types} from "mongoose";
import util from "./utility";

// MongoDB: document (JSON, max: 16MB ) -> collection
//          binary large documents -> GridFS -> clustered, indexed
//          RabbitMQ (AMQP, plugin -> MQTT,WS,..., In-memory -> Low latency)
//                    IoT, Ultra Low-Latency (AlgoTrading, HFT)
//                    MongoDB
const employeeSchema = new Schema({
    "_id": {
        type: String
    },
    "fullname": {
        type: String,
        required: true,
        minLength: 5
    },
    "identityNo": {
        type: String,
        required: true,
        validate: [util.tcKimlikNoValidator, 'This is not a valid identity no.']
    },
    "photo": {
        type: String,
        required: false,
        default: util.NO_IMAGE
    },
    "salary": {
        type: Number,
        required: true,
        min: 3500,
        default: 3500
    },
    "iban": {
        type: String,
        required: true,
        validate: [util.ibanValidator, "This is not a valid iban."]
    },
    "department": {
        type: String,
        enum: ["IT", "SALES", "FINANCE", "HR"],
        default: "SALES"
    },
    "fulltime": {
        type: Boolean,
        required: true,
        default: true
    },
    "birthYear": {
        type: Number,
        required: true,
        default: 1990
    }
});
connect("mongodb://localhost:27017/hr")
const Employee = model('employees', employeeSchema);
//endregion

// REST over HTTP -- API Layer: Express
const port = 4001;
const app = express();

//region Configurations: CORS + HTTP Logging + JSON Document Size Limit
app.use(bodyParser.json({limit: '5mb'}))
app.use(logger('dev'));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "HEAD, GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
    next();
});
//endregion

//region Swagger UI Configuration
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//endregion

//region REST API
app.post("/employees", (req, res) => {
    let emp = req.body;
    emp._id = emp.identityNo;

    let employee = new Employee(emp);
    employee.save((err, new_emp) => {
        res.set("Content-Type", "application/json");
        if (err)
            res.status(400).send({"status": err})
        else{
            for (let socket of sockets){
                socket.emit("hire", employee);
            }
            res.status(200).send({"status": "ok"})
        }
    });
})
// http://localhost:4001/employees?page=10&size=25
// http://localhost:4001/employees

app.get("/employees", (req, res) => {
    let page = Number(req.query.page) || 1;
    let size = Number(req.query.size) || 10;
    let offset = (page - 1) * size;
    Employee.find({},
        {"__v": false, "_id": false},
        {skip: offset, limit: size},
        (err, employees) => {
            res.set("Content-Type: application/json");
            if (err)
                res.status(400).send({"status": err})
            else
                res.status(200).send(employees);
        })
})

app.get("/employees/:id", (req, res) => {
    let identityNo = req.params.id;
    Employee.findOne({'identityNo': identityNo},
        {"__v": false, "_id": false},
        (err, employee) => {
            res.set("Content-Type: application/json");
            if (err || employee === null)
                res.status(404).send({"status": "employee is not found!"})
            else
                res.status(200).send(employee);
        });
})
// 1) Updating a resource:
// i) PUT -> Full Resource
// ii) PATCH -> Difference: {salary: 25000, department: SALES}
//                          { photo: "....."}

// 2) Updatable Fields: Domain Expert -> ["salary", "iban", "department", "photo", "fulltime"]
// GET,PUT,PATCH, DELETE -> existing resource
// POST -> brand new resource
// GET, DELETE: you cannot put resource in request body
// GET, POST, PUT, PATCH, DELETE: response body
app.put("/employees/:id", (req, res) => {
    let identityNo = req.params.id;
    let emp = req.body;
    let updatableFields = [
        "salary", "iban", "department", "photo", "fulltime", "birthYear"
    ]
    let updatedFields = {}
    for (let field in emp) {
        if (updatableFields.includes(field)) {
            updatedFields[field] = emp[field];
        }
    }
    Employee.update({identityNo},
        {$set: updatedFields},
        {upsert: false},
        (err, employee) => {
            res.set("Content-Type: application/json");
            if (err)
                res.status(404).send({status: err});
            else res.status(200).send(employee);
        })
})

// pagination

app.delete("/employees/:id", (req,res)=>{
    let identityNo = req.params.id;
    Employee.findOneAndDelete(
        {identityNo},
        (err,employee) => {
            res.set("Content-Type: application/json");
            if (err)
                res.status(400).send({status: err});
            else if (employee===null)
                res.status(404).send({status: "cannot find employee to delete"});
            else{
                for (let socket of sockets){
                    socket.emit("fire", employee);
                }
                res.status(200).send(employee);
            }
        }
    );
});
// DELETE http://localhost:4001/employees?criteria=department&value=IT
//{ criteria: {"department": true, "salary": "$gt"}, "values": ["IT", "SALES"]}
//?identites=1,2,3,4,5,6
//["1","2","3"]
// Base64 Encode -> JSON.stringfy(["1","2","3"])
// req.body -> Base64Encoding+JSON.stringfy() -> URL -> query parameter
//endregion

let server = app.listen(port);
//region REST over WEBSOCKET API
let io=require("socket.io").listen(server);
io.set("origins", "*:*");
let sockets = [];

io.on("connect", socket => {
    sockets.push(socket);
    socket.on("disconnect", () => {
        let index = sockets.indexOf(socket);
        if (index >= 0){
            sockets.splice(index,1);
        }
    })
})
io.on("sample", msg => {

});
//endregion
console.log(`Server is running at ${port}`);
