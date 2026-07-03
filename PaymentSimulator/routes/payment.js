const router = require("express").Router()
const axios = require("axios")
const path = require("path")

router.post('/pay-success', async (req , res)=>{
    const { paymentReference } = req.body

    res.json({
        message: "Processing Payment"
    });

    console.log("Receive : ",paymentReference)

    const status = 1

    setTimeout(async () => {
        try {
            await axios.post(process.env.WEBHOOK_URL,{
                paymentReference,
                status
            });

            console.log("Webhook sent");
        } catch(err){
            console.error(err.response?.status);
        }
    },5000);

})

router.post('/pay-fail', async (req , res)=>{
    const { paymentReference } = req.body

    res.json({
        message: "Processing Payment"
    });

    console.log("Receive : ",paymentReference)

    const status = 0

    setTimeout(async () => {
        try {
            await axios.post(process.env.WEBHOOK_URL,{
                paymentReference,
                status
            });

            console.log("Webhook sent");
        } catch(err){
            console.error(err.response?.status);
        }
    },5000);

})

router.get("/payment/:reference", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/payment.html"));
});

module.exports = router