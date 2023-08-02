// @ts-nocheck
var fs = require('fs')
const {sign,verify,decode} = require("jsonwebtoken");
const createTokens = (user)=> {
    var privatekey = fs.readFileSync('./Private.Key', 'utf8');
var paylod ={};
paylod.email= user.email;
paylod.userId = user.id;
paylod.firstName = user.firstName;
let exp = '1d';
var signOptions ={
  expiresIn : '1d',
  algorithm: "RS256",
}
    const accessToken = sign({ userId: user.id },privatekey,signOptions);
const virfied=  JSON.stringify(accessToken)
console.log(virfied)
fs.readFileSync('./Public.Key', 'utf8');
return accessToken;
};





const verifyToken = (req,res,next,cokoe) => {
    var publickey = fs.readFileSync('./Public.Key', 'utf8');


if(!req.headers && req.headers.authorization){
return res.status(400).json({error:"user not Authenticated!"})
}
const token = req.headers.authorization.split(' ')[1];
if (token){
    console.log("docod: "+token);
    var verifyOptions = {
      maxAge: "20m",
      algorithm: ["RS256"]
    };

    if (typeof accessToken !== 'string') {
        console.log('jwt must be a string');
      }
    verify(token,publickey,verifyOptions);

    req.authenticated = true; 
        return next()
    }
}
const docedToken = (req,res) => {
try{
  const docod = req.cookies['stok-data'];
  if (docod){
    console.log("noooooooooooooooooooooooooooo")
  }else{
    
  console.log("Docoded Header: " + JSON.stringify(decoded.payload))
return decode; 

}

}catch(eror){}
}

module.exports={createTokens,verifyToken,docedToken };

