const http = require('http')
const fs = require('fs')


let html =''
fs.readFile('index.html','utf-8',(err,data)=>{
   
   console.log(data)
   http.createServer((req,res)=>{
    res.writeHead(200,{
        "content-type":"text/html"
    })
    res.write(data)
    res.end()
}).listen(3000)
})

