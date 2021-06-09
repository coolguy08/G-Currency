const express=require("express");
const fetch=require("node-fetch")
const cheerio=require("cheerio");

const countries=require('./countries')

const app=express();


async function getrate(from,to){
    let url=`https://www.google.com/search?q=${from}+to+${to}`;
    const res=await fetch(url);
    const data=await res.text();
    const $=cheerio.load(data);
    const div=$('#main');
    const time=$(".hqAUc");

    const ratestring=div.text().split('|')[0];
    currencyrate=ratestring.split('=')[1].split(' ')[0];
    return currencyrate;

}


const rates={}

app.get("/",(req,res)=>{

    res.status(200).json({"msg":"Welcome to Currency Convertor API","Endpoints":["/usage","/getrates","/countries"],"About":"Free API for currency rates/conversions"})
})

app.get('/countries',(req,res)=>{
    res.json(countries)
})

app.get('/usage',(req,res)=>{

    res.json({
      data:[

            { endpoint:"/getrates",
              params:{from:"currencyId",to:"cureencyId"},
              example:"/getrates?from=USD&to=INR",
              response:{
                "base": "USD",
                "to": "INR",
                "rate": 72.97,
                "source": "API"
                }

            },
            { 
                endpoint:"/countries",
              example:"/countries",
              response:"get all the countries name with there currency codes"

            }
            

      ]
           

    })
})

app.get("/getrates",async(req,res)=>{
      const from=req.query.from;
      const to=req.query.to;
      const key=from+"_"+to;
 try {

     if(rates[key] && new Date()-rates[key].time<60*60*1000){//updates every hour
       res.json({"base":from,"to":to,"rate":rates[key].rate,source:"cache",lastUpdate:rates[key].time});
     }
     else{
        const rate=await getrate(from,to);
      
        rates[key]={
            rate:parseFloat(rate.replace(/,/g,'')),
            time:new Date(),
        }
        res.json({"base":from,"to":to,"rate":rates[key].rate,source:"API"});
     }
     
    
     
 } catch (error) {
     throw error;
 }
      

})




app.listen(3000,()=>{console.log("listnning on 3000")});

