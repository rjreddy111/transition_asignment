const express = require("express");
const path = require("path")



const app = express()

app.set("view engine", "ejs");

app.set('views', path.join(__dirname, 'views'));



const url = "http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639"

// calculating LVT
const calculateLVT = (loanRequired,purchasePrice) => (loanRequired/purchasePrice)*100


//checklist rules
const checkRulesSet = [

    {
        name : "Valuation Fee Paid", 
        condition : (data)=> data.isValuationFeePaid===true 
    },
    
     {
        name :"UK Resident", 
        condition:(data)=> data.isUkResident===true 
     }, 

     {
        name:"Risk Rating Medium", 
        condition : (data)=>data.riskRating==="Medium"
     },

     {
        name : "LVT Below 60%", 
        condition: (data) => calculateLVT(data.loanRequired,data.purchasePrice) < 60
     }
]

app.get("/", async(req,res)=> {
    
    try {
    const resData = await fetch (url)
    const data = await resData.json()
    console.log(data)

    //Checking each rule
    const outputResults = checkRulesSet.map((rules)=> ({
        name : rules.name , 
        currentStatus : rules.condition(data)? "Passed" : "Failed"
    })
)
    res.render("index", {outputResults})
    }
    
    catch(error) {
        console.log("Error")
        res.status(500).send("Error occured while fetching Data")
    }
})

app.listen(5001,()=> {
    console.log("server is running on 5001")

})



module.exports = app