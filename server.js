const express = require("express")
const cors = require("cors")
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoClient = mongodb.MongoClient;
const dotenv = require("dotenv").config()
const URL = process.env.DB;
const DB = "web_scraping"

const app = express();

//Middleware

app.use(express.json())

app.use(cors({
    origin: "http://localhost:3000"
}))




// let users = [
//     {
//         title: "Apple iPhone 13 Mini (128GB) - (Product) RED",
//         image: "https://m.media-amazon.com/images/I/61F7Xcyux0L._AC_UY218_.jpg",
//         discount: 64900,
//         price: 69900,
//         rating: 4.6,
//         id: "1"
//     },
//     {
//         title: "Apple iPhone 12 (128GB) - Blue",
//         image: "https://m.media-amazon.com/images/I/71ZOtNdaZCL._AC_UY218_.jpg",
//         discount: 54490,
//         price: 70900,
//         rating: 4.6,
//         id: "2"
//     },
//     {
//         title: "Apple iPhone 12 (64GB) - Black",
//         image: "https://m.media-amazon.com/images/I/71fVoqRC0wL._AC_UY218_.jpg",
//         discount: 47999,
//         price: 65900,
//         rating: 4.6,
//         id: "3"
//     },
//     {
//         title: "Apple iPhone 12 (128GB) - White",
//         image: "https://m.media-amazon.com/images/I/711wsjBtWeL._AC_UY218_.jpg",
//         discount: 54490,
//         price: 70900,
//         rating: 4.6,
//         id: "4"
//     },
//     {
//         title: "Apple iPhone 12 (128GB) - Purple",
//         image: "https://m.media-amazon.com/images/I/71hIfcIPyxS._AC_UY218_.jpg",
//         discount: 54490,
//         price: 70900,
//         rating: 4.6,
//         id: "5"
//     },
//     {
//         title: "Apple iPhone 13 Mini (128GB) - (Product) RED",
//         image: "https://m.media-amazon.com/images/I/61F7Xcyux0L._AC_UY218_.jpg",
//         discount: 64900,
//         price: 69900,
//         rating: 4.6,
//         id: "6"
//     },
//     {
//         title: "Apple iPhone 12 (128GB) - Blue",
//         image: "https://m.media-amazon.com/images/I/71ZOtNdaZCL._AC_UY218_.jpg",
//         discount: 54490,
//         price: 70900,
//         rating: 4.6,
//         id: "7"
//     },
//     {
//         title: "Apple iPhone 12 (64GB) - Black",
//         image: "https://m.media-amazon.com/images/I/71fVoqRC0wL._AC_UY218_.jpg",
//         discount: 47999,
//         price: 65900,
//         rating: 4.6,
//         id: "8"
//     },
//     {
//         title: "Apple iPhone 12 (128GB) - White",
//         image: "https://m.media-amazon.com/images/I/711wsjBtWeL._AC_UY218_.jpg",
//         discount: 54490,
//         price: 70900,
//         rating: 4.6,
//         id: "9"
//     },
//     {
//         title: "Apple iPhone 12 (128GB) - Purple",
//         image: "https://m.media-amazon.com/images/I/71hIfcIPyxS._AC_UY218_.jpg",
//         discount: 54490,
//         price: 70900,
//         rating: 4.6,
//         id: "10"
//     }
// ]

let authenticate = (req, res, next) => {
    if (req.headers.authorization) {
        try {
            let decode = jwt.verify(req.headers.authorization, process.env.SECRET)
            if (decode) {
                next()
            }
        } catch (error) {
            res.status(401).json({ message: "Unauthorized" })
        }

    } else {
        res.status(401).json({ message: "Unauthorized" })
    }
}

app.get("/iphone",authenticate, async function (req, res) {


    try {
        const connection = await mongoClient.connect(URL)

        const db = connection.db(DB)

        let productsData = await db.collection("products").find().toArray()

        await connection.close()

        res.json(productsData)

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }


    // res.json(users);
});

app.post("/iphone",authenticate, async function (req, res) {

    try {
        const connection = await mongoClient.connect(URL)

        const db = connection.db(DB)

        await db.collection("products").insertOne(req.body)

        await connection.close()

        res.json({ message: "Data inserted" })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }


    // req.body.id = users.length + 1
    // users.push(req.body)
    // console.log(req.body)
    // res.json({message : "Product created Successfully"})
});


app.post("/register", async function (req, res) {

    try {

        const connection = await mongoClient.connect(URL)

        const db = connection.db(DB)

        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt)

        req.body.password = hash

        await db.collection("users").insertOne(req.body)

        await connection.close()

        res.json({ message: "User registered successfully" })

    } catch (error) {
        res.status(401).json({ message: "Something went wrong" })
    }
});

app.post("/login", async function (req, res) {

    try {

        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        let user = await db.collection("users").findOne({ email: req.body.email });

        if (user) {
            let compare = await bcrypt.compare(req.body.password, user.password);
            if (compare) {
                let token = jwt.sign({ _id: user._id },process.env.SECRET, { expiresIn: "10m"});
                res.json({token});
            } else {
                res.status(401).json({ message: "Email/Password is incorrect" });
            }
        } else {
            res.status(401).json({ message: "Email/Password is incorrect" });
        }

        await connection.close()
    } 
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});



app.listen(process.env.PORT || 3001);