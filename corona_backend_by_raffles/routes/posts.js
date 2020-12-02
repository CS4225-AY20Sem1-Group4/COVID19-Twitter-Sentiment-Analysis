const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    console.log("req is ", req)
    res.send("we are on posts")
})

module.exports = router