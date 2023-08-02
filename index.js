// @ts-nocheck
const express = require("express");
const cors = require("cors");
const app = express();

const http = require('http');
const bodyParser = require("body-parser");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const cookieparser = require("cookie-parser")
const { createTokens, verifyToken, docedToken } = require("./JWT");

//const Cookies = require("js-cookie")
const server = http.createServer(app);
// const io = require("socket.io")(server);
const io = require("socket.io")(server);


const fs = require('fs');
const session = require("express-session");
const multer = require('multer');

//const port = process.env.PORT || 8180;
const port = 8180;



// const db = mysql.createPool({
//   host: '127.0.0.1',
//   user: 'root',
//   password: '',
//   database: 'gunmarkte',
//   // port:3306,
//   // timezone: 'utc',
// });
const db = mysql.createConnection({
  host: 'freemarkate.com',
  user: 'u840548398_gunmarkte',
  password: 'Gunmarkte775227593',
  database: 'u840548398_gunmarkte',
  // port:3306,
  timezone: 'utc',
});

app.use(cookieparser());
app.use(cors());
app.use(express.json());
//app.use(fileUpload());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `upload/`;

    fs.access(dir, function (error) {
      if (error) {
        console.log("Directory does not exist.");
        return fs.mkdir(dir, error => cb(error, dir));
      } else {
        console.log("Directory exists.");
        return cb(null, dir);
      }
    });
  },


  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});




//const uploads = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });
const uploads = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/upload', express.static('upload'));
//app.use(express.static(path.join(__dirname, "upload")));

var data = {};
let outputfile = '';

var sessions = {};

app.use(
  session({
    // You could actually store your secret in your .env file - but to keep this example as simple as possible...
    secret: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzYWN0aW9uIjoi2LPZhNin2K0g2K7ZgdmK2YEiLCJwcmljZSI6Ijc1MDAiLCJkZXNjcmlwdGlvbiI6ImFzZGZhc2Rmc2RmIGRmIHMgc2Rmc2RmIGRnZGcgc2RkZmFzZGRmc2QgZWYgZ3NhZ2FzZGZzZGZkcyBkc3NkIGRzZmYgZHMgc2ZkIiwiaWF0IjoxNjc3ODUyNTAzLCJleHAiOjE2Nzc5Mzg5MDN9.QeCWuUg1CEW0W-4nTCQ1AYVf8vBlC50jUnI_n6u3vD5h8rIZ7gJ9Uz7db8VL1ODG0M7_RIYi40HYpWQBmalzOqlKQAyqetphOHs2qhSRghu_LzOIkxeEjLh-QXmGVrqz4ybyqN',
    cookie:{httpOnly:true},
    resave: false,
    saveUninitialized: false
  })
);
const sessioncook = {}

app.get('/api/get', (req, res) => {

  //console.log(password)
  const get = "SELECT * FROM binddata";
  db.query(get, (err, result) => {
    console.log(JSON.stringify(result[0]), 'blob data read');

    console.log('New file created');
    res
      .status(200)
      .send(result);


  });


});


app.post('/api/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
    console.log(password)
    const user = "SELECT * FROM userscont WHERE email='" + email + "'";
    db.query(user, (err, result) => {
      if (result) {
        const dbPassword = result[0].password;
        //  console.log(dbPassword);
        const accessToken = createTokens(result[0]);
        //res.cookie('token', accessToken, { httpOnly: true });
        bcrypt.compare(password, dbPassword).then((match, error) => {
          console.log(match)
          if (match) {
            res.send({ success: true, result, accessToken }).status(200);
      
            // res.send({ success: true, result, accessToken }).status(200);

          } else {
                  // res.sendStatus(400)
                  console.log(error)
          }
        });
        var verifyOptions = {
          maxAge: "30d",
          algorithm: ["RS256"]
        };
        var publickey = fs.readFileSync('./Public.Key', 'utf8');
        jwt.verify(accessToken, publickey, { httpOnly: true, sameSite: 'none', maxAge: 24 * 60 * 6 * 1000 }, (err, doced) => {
          {
            complete = true,
              sessions.userId = doced.userId;
            sessions.email = doced.email
          };
          console.log(JSON.stringify(doced));
        });
      } else {
        res.send({ success: true }).status(401)   ;
      }
    });
});

function isAuthenticated(req, res, next) {
  //const token = req.session.user;
  req.session.user = sessions
  if (req.session.user) next()
  else next('route')
}







//post and get user data indrction and uapdt
app.get("/api/profil", isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const user = "SELECT COUNT(imagposts.idimgpost) AS IDPSTCOUN,Saction,usecase,country,codcountry,Kind,Cdlass,image,season,pattren,Collar,stylePost,colorPost,filesav,idpost,Yurs,City,Done,Description,Prcado,Price,Phone,linkimag,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag WHERE posts.User='" + userSession.userId + "' GROUP BY imagposts.idLinkimag";
  db.query(user, (err, result) => {
    if (result) {
      // console.log(result)
      res.send(result).status(200);
    } else {
      console.log(err)
    }
  });
});
app.get("/api/profilimag", isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const user = "SELECT imagposts.image,imagposts.idimgpost,imagposts.idLinkimag,imagposts.filesav FROM imagposts INNER JOIN posts ON imagposts.idLinkimag = posts.linkimag WHERE posts.User='" + userSession.userId + "'";
  db.query(user, (err, result) => {
    if (result) {
      //      console.log(result)
      res.send(result).status(200);


    } else {
      console.log(err)
    }
  });
});



app.post("/api/insert", (req, res) => {
  const userName = req.body.userName
  const email = req.body.email
  const password = req.body.password
  const passwordconfrg = req.body.passwordconfrg
  const pirthDay = req.body.pirthDay
  const prithMath = req.body.prithMath
  const prithYurs = req.body.prithYurs
  const phone = req.body.phone

  console.log(userName);
  bcrypt.hash(password, 10).then((hash) => {
    const sqlInsert = "INSERT INTO userscont (userName,email,password,passwordconfrg,phone,pirthDay,prithMath,prithYurs,DATEDAY) VALUES ('" + userName + "','" + email + "','" + hash + "','" + passwordconfrg + "','" + phone + "','" + pirthDay + "','" + prithMath + "','" + prithYurs + "',CURRENT_DATE())"
    db.query(sqlInsert, (err, result) => {
      console.log(err);
      res.send(result)
    })
  });

});

app.put("/api/upadtuserimag", isAuthenticated, uploads.single('imagupdatuser'), (req, res) => {
  const userSession = req.session.user;
  const imagupdat = req.file.filename;
  console.log(`file name ${imagupdat}`);
  console.log(req.file.filename);
  db.query('UPDATE userscont SET imageusere="' + imagupdat + '"  WHERE 	id="' + userSession.userId + '"', function (err, data) {
    if (err) {
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
      console.log(result);
      const previousimag = req.body.previousimag;
      if (previousimag.length !== 0) {
        fs.unlink(`upload/${previousimag}`, (err) => {
          if (err) throw err;
          console.log('path/file.txt was deleted');
        })
      }
    }
  });
});




app.post("/api/insertviewuser", (req, res) => {
  const id_postuser_target = req.body.idpostwatch
  const id_user = req.body.iduser
  const userName = req.body.userName
  console.log(userName, id_postuser_target, id_user);
  const sqlInsert = "INSERT INTO view_user(id_viewuser,userNameview,Timmaint_viewuser,Timday_viewuser,id_countuser_targe) VALUES ('" + id_user + "','" + userName + "',CURRENT_TIME(),CURRENT_DATE(),'" + id_postuser_target + "' )"
  db.query(sqlInsert, (err, result) => {
    console.log(result);
    res.sendStatus(200);
  })
});

app.get('/api/viewuser', (req, res) => {
  const view = "SELECT * FROM view_user ";
  db.query(view, (err, result) => {
    if (result) {
      // console.log(result);
      //console.log(postpblec);
      res.send(result).status(200);
      console.log(result);
    } else {
      console.log(err)
    }
  });
})



app.get('/api/usersviewfrind', isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const view = "SELECT * FROM view_user INNER JOIN userscont ON userscont.id=view_user.id_countuser_targe  WHERE view_user.id_viewuser='" + userSession.userId + "' ";
  db.query(view, (err, result) => {
    if (result) {
      res.send(result).status(200);
      // console.log(result);
    } else {
      console.log(err)
    }
  });
});
app.get('/api/viewfrindthusermy', isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const view = "SELECT * FROM view_user INNER JOIN userscont ON userscont.id=view_user.id_viewuser  WHERE  view_user.id_countuser_targe='" + userSession.userId + "' ";
  db.query(view, (err, result) => {
    if (result) {
      res.send(result).status(200);
      // console.log(result);
    } else {
      console.log(err)
    }
  });
});


app.get('/api/viewpostpostsuser', isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const view = "SELECT * FROM view_post INNER JOIN posts ON posts.idpost=view_post.id_postuser_target WHERE posts.User='" + userSession.userId + "'";
  db.query(view, (err, result) => {
    if (result) {
      res.send(result).status(200);
      // console.log(result);
    } else {
      console.log(err)
    }
  });
});


app.get('/api/viewpostpostfrind', isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const view = "SELECT posts.idpost,posts.Saction,posts.Kind,posts.usecase,posts.country,posts.season,posts.pattren,posts.Collar,posts.stylePost,posts.colorPost,posts.codcountry,posts.Cdlass,posts.Yurs,posts.City,posts.Done,posts.Description,posts.Prcado,posts.Price,posts.Phone,posts.linkimag,posts.DATEDAY,view_post.id_user,view_post.userName AS userNamemy , userscont.userName, userscont.id, userscont.email,userscont.phone FROM posts INNER JOIN view_post ON view_post.id_postuser_target=posts.idpost LEFT JOIN userscont ON userscont.id=posts.User WHERE view_post.id_user='" + userSession.userId + "' ";
  db.query(view, (err, result) => {
    if (result) {
      res.send(result).status(200);
      // console.log(result);



    } else {
      console.log(err)
    }

  });
});


app.get('/api/usersfollowerfrind', isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const view = "SELECT * FROM follower INNER JOIN userscont ON userscont.id = follower.id_usertyp_follower  WHERE follower.id_userfollower='" + userSession.userId + "' ";
  db.query(view, (err, result) => {
    if (result) {
      res.send(result).status(200);
      // console.log(result);
    } else {
      console.log(err)
    }

  });
});

app.get('/api/followerfrindthusermy', isAuthenticated, (req, res) => {

  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const view = "SELECT * FROM follower INNER JOIN userscont ON userscont.id=follower.id_userfollower  WHERE  follower.id_usertyp_follower='" + userSession.userId + "' ";
  db.query(view, (err, result) => {
    if (result) {
      res.send(result).status(200);
      // console.log(result);
    } else {
      console.log(err)
    }
  });
});



app.get("/api/getusercoun", (req, res) => {
  try {
    const user = "SELECT * FROM userscont "
    db.query(user, (err, result) => {
      if (result) {
        res.send(result).status(200);
      } else {
        console.log(err)
      }
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(401);
  }
});






app.get('/api/favorepostpostsusers', isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const view = "SELECT * FROM favret INNER JOIN posts ON posts.idpost=favret.idfavret WHERE posts.User='" + userSession.userId + "' ";
  db.query(view, (err, result) => {
    if (result) {
      res.send(result).status(200);
    } else {
      console.log(err)
    }
  });
});

app.get('/api/favorepostsfrind', isAuthenticated, (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    res.status(401).send('Invalid session');
    console.log('Invalid session');
  }
  const iduser = req.body.idpost
  const view = "SELECT posts.idpost,posts.usecase,posts.country,posts.codcountry,posts.Saction,posts.User,posts.season,posts.pattren,posts.Collar,posts.stylePost,posts.colorPost,posts.Kind,posts.TimMinutes,posts.Cdlass,posts.Yurs,posts.City,posts.Done,posts.Description,favret.idfavorit,favret.idfavret,posts.Prcado,posts.Price,posts.Phone,posts.linkimag,posts.DATEDAY,favret.iduser,favret.timlike_day,favret.timlikuser,favret.userName AS userNamemy , userscont.userName, userscont.id, userscont.email,userscont.phone FROM posts INNER JOIN favret ON favret.idfavret=posts.idpost LEFT JOIN userscont ON userscont.id=posts.User WHERE favret.iduser='" + userSession.userId + "' ";
  db.query(view, (err, result) => {
    if (result) {
      res.send(result).status(200);
    } else {
      console.log(err)
    }
  });
})


























//publish post and getpost and updte post


app.post("/api/insertpost", (req, res) => {

  const Saction = req.body.Saction;
  const Cdlass = req.body.Cdlass;

  const Yurs = req.body.Yurs;
  const Kind = req.body.Kind;
  const City = req.body.City;
  const Done = req.body.Done;
  const Description = req.body.Description;
  const Price = req.body.Price;
  const Prcado = req.body.Prcado;
  const User = req.body.User;
  const Phone = req.body.Phone;
  const country = req.body.country;
  const codcountry = req.body.codcountry;
  const usecase = req.body.usecase;
  const season = req.body.season;
  const pattren = req.body.pattren;
  const Collar = req.body.Collar;
  const colorPost = req.body.colorPost;
  const stylePost = req.body.stylePost;


  var privatekey = fs.readFileSync('./mykey.pem', 'utf8');
  var paylod = {};


  paylod.saction = Saction;
  paylod.price = Price;
  paylod.description = Description;

  var exp = "24h";
  var signOptions = {
    expiresIn: exp,
    algorithm: "RS256",
  }
  const accessToken = jwt.sign(paylod, privatekey, signOptions);
  const idLinkimag = req.body.idLinkimag;
  console.log(idLinkimag, usecase,codcountry,Phone,Saction,User,season,Collar);

  const tasks = "INSERT INTO posts (Saction,Kind,Cdlass,usecase,season,pattren,Collar,stylePost,colorPost,Yurs,country,codcountry,City,Done,Description,Prcado,Price,Phone,linkimag,accessPost,User,TimMinutes,DATEDAY) VALUES ('" + Saction + "','" + Kind + "','" + Cdlass + "','" + usecase + "','"+season+"','"+pattren+"','"+Collar+"','"+stylePost+"','"+colorPost+"','" + Yurs + "','" + country + "','" + codcountry + "','" + City + "','" + Done + "','" + Description + "','" + Prcado + "','" + Price + "','" + Phone + "','" + idLinkimag + "','" + accessToken + "','" + User + "',CURRENT_TIME(),CURRENT_DATE())";
  db.query(tasks, (err, result) => {
    //if (err) throw err;
    console.log(err);
    console.log(result);
    res.sendStatus(200);
  });


  // const tasks = "INSERT INTO posts (Saction,Kind,Cdlass,usecase,season,pattren,Collar,stylePost,colorPost,Yurs,country,codcountry,City,Done,Description,Prcado,Price,Phone,linkimag,accessPost,User,TimMinutes,DATEDAY) VALUES ('Saction,Kind,Cdlass,usecase,season,pattren,Collar,stylePost,colorPost,Yurs,country,codcountry,City,Done,Description,Prcado,Price,Phone,linkimag,accessPost,User,TimMinutes,DATEDAY,CURRENT_TIME(),CURRENT_DATE())";
  // db.query(tasks, (err, result) => {
  //   //if (err) throw err;
  //   console.log(err);
  //   console.log(result);
  //   res.sendStatus(200);
  // });







});

app.post("/api/insertpostimag", uploads.any('profile'), (req, res) => {


  const idLinkimag = req.body.idLinkimag;


  console.log(`file name '${idLinkimag}'`)

  console.log(req.files);
  console.log(req.files.filename);

  const images = []
  for (image of req.files) {
    console.log(image);
    console.log(image.filename);
    images.push(image.filename);
    console.log(images);
  }
  images.forEach(imag => {

    db.query('INSERT INTO imagposts(image,idLinkimag,filesav) VALUES ("' + imag + '","' + idLinkimag + '","upload")', function (err, data) {


      res.sendStatus(200);
      console.log(JSON.stringify(err,data));

    });
  })
});
app.post("/api/insertpostimagsingl", uploads.single('profile'), (req, res) => {
  const idLinkimag = req.body.idLinkimag;
  console.log(`file name ${idLinkimag}`)
  console.log(req.files.filename);
  db.query('INSERT INTO imagposts(image,idLinkimag,filesav) VALUES ("' + req.file.filename + '","' + idLinkimag + '","upload")', function (err, data) {
    if (err) throw err;
    console.log(JSON.stringify(err))
  });
  res.send(result).status(200);
});
app.put("/api/insertpostupadte", (req, res) => {
  const Saction = req.body.Saction;
  const Cdlass = req.body.Cdlass;
  const Prcant = req.body.Prcant;
  const Yurs = req.body.Yurs;
  const Kind = req.body.Kind;
  const City = req.body.City;
  const Done = req.body.Done;
  const Description = req.body.Description;
  const Price = req.body.Price;
  const Prcado = req.body.Prcado;
  const User = req.body.User;
  const Phone = req.body.Phone;
  const country = req.body.country;
  const codcountry = req.body.codcountry;
  const usecase = req.body.usecase;
  const season = req.body.season;
  const pattren = req.body.pattren;
  const Collar = req.body.Collar;
  const colorPost = req.body.colorPost;
  const stylePost = req.body.stylePost;
  const idpost = req.body.idpost;
  console.log(idpost, Prcado, Price, Done, Saction);
  const tasks = 'UPDATE posts SET Saction="' + Saction + '", Kind="' + Kind + '", Cdlass="' + Cdlass + '",usecase= "' + usecase + '",season="' + season + '",pattren="' + pattren + '",Collar="' + Collar + '" ,stylePost="' + stylePost + '" ,colorPost="' + colorPost + '" , Yurs="' + Yurs + '" ,country="' + country + '",codcountry="' + codcountry + '" , City="' + City + '" , Done="' + Done + '", Description="' + Description + '" , Prcado="' + Prcado + '" , Price="' + Price + '" , Phone="' + Phone + '"  WHERE idpost="' + idpost + '"'
  db.query(tasks, (err, result) => {

    if (err) throw err;
    console.log(result);

  //  " UPDATE imagposts SET https='10.10.59.5:8180' WHERE filesav='upload'"

  });
  res.json({
    success: true,
    statusCode: 200,

  });


});

app.delete("/api/insertdelet/:idimgpost", (req, res) => {
  const deblet = "DELETE FROM imagposts WHERE idimgpost=?";
  const id = req.params.idimgpost;
  db.query(deblet, id, (err, result) => {
    console.log(result);

  });
  res.send('secssefil').status(200);
});

app.put("/api/insertdelet", (req, res) => {

  const previousimag = req.body.previousimag;
  fs.unlink(`upload/${previousimag}`, (err, data) => {
    if (err) throw err;
    res.send(data).status(200);
    console.log('path/file.txt was deleted');
  })







  const success = true;




});


app.put("/api/inserteditimag", uploads.single('profile'), (req, res) => {
  const id = req.body.idimppo;
  const imagupdat = req.file.filename;

  console.log(`file name ${imagupdat}`);

  db.query('UPDATE imagposts SET image="' + imagupdat + '"  WHERE 	idimgpost="' + id + '"', function (err, data) {

    if (data) {

      console.log(result);



    }


  });

  console.log(req.file);
  console.log(req.body);



  const previousimag = req.body.previousimag;
  fs.unlink(`upload/${previousimag}`, (err) => {
    if (err) throw err;
    res.send(data).status(200);
    console.log('path/file.txt was deleted');
  })



  const success = true;




});

// app.get('/api/getpost', (req, res) => {
//   //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

//   var postpblec = []

//   const user = "SELECT  Saction,Kind,Cdlass,usecase,country,codcountry,image,filesav,https,idpost,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ";


//   db.query(user, (err, result) => {
//     if (result) {


//       res.send(result).status(200);
//       //  console.log(result);

//   


//     } else {
//       console.log(err)
//     }

//   });



// });















/// according order by FILTER saction

app.get('/api/getpostORDERSaction', (req, res) => {
  //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

  var postpblec = []

  const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY Saction DESC";
  // const user = "SELECT  Saction,Kind,Cdlass,image,filesav,https,idpost,usecase,country,codcountry,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY Saction DESC";


  db.query(user, (err, result) => {
    if (result) {


      res.send(result).status(200);
      //  console.log(result);



    } else {
      console.log(err)
    }

  });



});
app.get('/api/getpostORDERCdlass', (req, res) => {
  //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

  var postpblec = []

  const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY Cdlass DESC";
  // const user = "SELECT Saction,Kind,Cdlass,image,filesav,https,idpost,usecase,country,codcountry,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY Cdlass DESC";


  db.query(user, (err, result) => {
    if (result) {


      res.send(result).status(200);
      //  console.log(result);



    } else {
      console.log(err)
    }

  });



});
app.get('/api/getpostORDERkind', (req, res) => {
  //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

  var postpblec = []

  // const user = "SELECT  Saction,Kind,Cdlass,image,filesav,https,idpost,usecase,country,codcountry,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY Kind DESC";
  const user = "SELECT  * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY Kind DESC";


  db.query(user, (err, result) => {
    if (result) {


      res.send(result).status(200);
      //  console.log(result);



    } else {
      console.log(err)
    }

  });



});
app.get('/api/getpostORDERYurs', (req, res) => {
  //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

  var postpblec = []

  const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY Yurs DESC";
  // const user = "SELECT  Saction,Kind,Cdlass,usecase,country,codcountry,image,filesav,https,idpost,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY Yurs DESC";


  db.query(user, (err, result) => {
    if (result) {


      res.send(result).status(200);
      //  console.log(result);



    } else {
      console.log(err)
    }

  });



});

app.get('/api/getpostORDERcountry', (req, res) => {
  //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

  var postpblec = []

  const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY country DESC";
  // const user = "SELECT  Saction,Kind,Cdlass,image,filesav,https,idpost,usecase,country,codcountry,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag  INNER JOIN userscont ON userscont.id = posts.User  GROUP BY imagposts.idLinkimag ORDER BY country DESC";


  db.query(user, (err, result) => {
    if (result) {


      res.send(result).status(200);
      //  console.log(result);



    } else {
      console.log(err)
    }

  });



});
app.get('/api/getpostORDERCity', (req, res) => {
  //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

  var postpblec = []

  const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag INNER JOIN userscont ON userscont.id = posts.User GROUP BY imagposts.idLinkimag ORDER BY City ASC";
  // const user = "SELECT Saction,Kind,Cdlass,image,filesav,https,idpost,usecase,country,codcountry,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag INNER JOIN userscont ON userscont.id = posts.User GROUP BY imagposts.idLinkimag ORDER BY City ASC";


  db.query(user, (err, result) => {
    if (result) {


      res.send(result).status(200);
      //  console.log(result);



    } else {
      console.log(err)
    }

  });



});
app.get('/api/getpostORDERPrcant', (req, res) => {
  //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

  var postpblec = []

  const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag INNER JOIN userscont ON userscont.id = posts.User GROUP BY imagposts.idLinkimag ORDER BY season ASC";
  // const user = "SELECT Saction,Kind,Cdlass,image,filesav,https,idpost,usecase,country,codcountry,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag INNER JOIN userscont ON userscont.id = posts.User GROUP BY imagposts.idLinkimag ORDER BY Prcant ASC";


  db.query(user, (err, result) => {
    if (result) {


      res.send(result).status(200);
      //  console.log(result);



    } else {
      console.log(err)
    }

  });



});
app.get('/api/getpostORDERTime', (req, res) => {
  //const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag ";

  var postpblec = []

  const user = "SELECT * FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag INNER JOIN userscont ON userscont.id = posts.User GROUP BY imagposts.idLinkimag ORDER BY TimMinutes ASC";

  // const user = "SELECT Saction,Kind,Cdlass,image,filesav,https,idpost,usecase,country,codcountry,Prcant,Yurs,City,Done,Description,Prcado,Price,userscont.imageusere,userscont.phone,linkimag,userscont.DATATIM,User,userscont.userName,userscont.email,TimMinutes,DATEDAY FROM posts INNER JOIN imagposts ON imagposts.idLinkimag = posts.linkimag INNER JOIN userscont ON userscont.id = posts.User GROUP BY imagposts.idLinkimag ORDER BY TimMinutes ASC";


  db.query(user, (err, result) => {
    if (result) {


      res.send(result).status(200);
      //  console.log(result);



    } else {
      console.log(err)
    }

  });



});

app.get("/api/postsimag", (req, res) => {

  const user = "SELECT imagposts.image,imagposts.idimgpost,imagposts.idLinkimag,imagposts.filesav FROM imagposts INNER JOIN posts ON imagposts.idLinkimag = posts.linkimag";
  //const user = "SELECT * FROM imagposts  INNER JOIN posts  posts.linkimag= imagposts.idLinkimag  WHERE posts.User='" + userSession.userId + "'";


  db.query(user, (err, result) => {
    if (result) {


      //  console.log(result)
      res.send(result).status(200);




    } else {
      console.log(err)
    }

  });





});


//










app.get('filterall', (req, res) => {
  const search =req.body.search
    const post = "SELECT * FROM posts WHERE Saction LIKE '%"+search+"%' OR Kind LIKE '%"+search+"%' OR Cdlass LIKE '%"+search+"%' OR usecase LIKE '%"+search+"%' OR season LIKE '%"+search+"%' OR pattren LIKE '%"+search+"%' OR Collar LIKE '%"+search+"%' OR stylePost LIKE '%"+search+"%' OR colorPost LIKE '%"+search+"%' OR Yurs LIKE '%"+search+"%' OR country LIKE '%"+search+"%' OR City LIKE '%"+search+"%' OR Description LIKE '%"+search+"%' OR Prcado LIKE '%"+search+"%' OR Price LIKE '%"+search+"%' OR Phone LIKE '%"+search+"%'";
  
    db.query(post,(err,reslt)=>{
      console.log(reslt)

    
    //'SELECT * FROM posts ORDER BY Kind DESC'
  })
})





///delet all post and dependencise...
app.delete("/api/idLinkimagdelet/:idLinkimag", (req, res) => {
  const deblet = "DELETE FROM imagposts WHERE idLinkimag='" + req.params.idLinkimag + "'";
  const id = req.params.idLinkimag;
  console.log(id);
  db.query(deblet, (err, result) => {
    console.log(result);
    console.log(err);

  });
  res.send('secssefil').status(200);
});

app.put("/api/idLinkimagdelet", uploads.any('profile'), (req, res) => {

  const previousimag = req.body.profile;

  console.log(previousimag)

  const images = []
  for (image of req.body.profile) {
    console.log(image);
    console.log(image);
    images.push(image);
    console.log(images);
  }
  images.forEach(imag => {
    fs.unlink(`upload/${imag}`, (err, data) => {
      if (err) throw err;
      res.send(data).status(200);
      console.log('path/file.txt was deleted');
    })

  });





  const success = true;




});




app.delete("/api/id_postviewdelet/:id_postuser_target", (req, res) => {
  const deblet = "DELETE FROM view_post WHERE id_postuser_target=?";
  const id = req.params.id_postuser_target;
  db.query(deblet, id, (err, result) => {
    console.log(result);

  });
  res.send('secssefil').status(200);
});
app.delete("/api/idfavretdelet/:idfavret", (req, res) => {
  const deblet = "DELETE FROM favret WHERE idfavret=?";
  const id = req.params.idfavret;
  db.query(deblet, id, (err, result) => {
    console.log(result);

  });
  res.send('secssefil').status(200);
});



app.delete("/api/idpostdelet/:idpostpo", (req, res) => {
  const deblet = "DELETE FROM posts WHERE idpost='" + req.params.idpostpo + "'";
  const id = req.params.idpost;
  console.log(id)
  db.query(deblet, (err, result) => {
    console.log(result);

  });
  res.send('secssefil').status(200);
});







//according match 
app.get('', (req, res) => {
  const post = 'SELECT * FROM `posts` ORDER BY Saction ASC'
})



//according of between yers and price

app.get('', (req, res) => {
  const post = 'SELECT * FROM `posts` WHERE price BETWEEN 400.00 AND 100.00'
})
app.get('', (req, res) => {
  const post = 'SELECT * FROM `posts` WHERE YERS BETWEEN 1990 AND 2020'
})


//according of between time publish

app.get('', (req, res) => {
  const post = 'SELECT * FROM `posts` WHERE time BETWEEN 09:19:12 AND 01:17:12'
})
app.get('', (req, res) => {
  const post = 'SELECT * FROM `posts` WHERE day >= CURRENT_DATE - INTERVAL 1 MONTH'
})





app.get('', (req, res) => {
  const post = 'SELECT * FROM posts WHERE DATEDAY >= CURRENT_DATE - INTERVAL 5 DAY ORDER BY Kind DESC; '
})













//favoritlik...
app.get('/api/favoritlik', (req, res) => {
  const favr = "SELECT * FROM favret ";


  db.query(favr, (err, result) => {
    if (result) {

      // console.log(result);
      //console.log(postpblec);SELECT id_postview,id_user,userName,Timmaint_view,Timday_view,id_postuser_target FROM view_post
      res.send(result).status(200);
      console.log(result);



    } else {
      console.log(err)
    }

  });
});


app.delete("/api/deletfavoret/:idfavorit", (req, res) => {
  const deblet = "DELETE FROM favret WHERE idfavorit=?";
  const id = req.params.idfavorit;
  db.query(deblet, id, (err, result) => {

  console.log(result);
  });

  res.sendStatus(200);

});
app.post("/api/insertfaverpost", (req, res) => {
  const idfavret = req.body.idfavret
  const iduser = req.body.iduser
  const userName = req.body.userName


  console.log(userName, idfavret, iduser);

  const sqlInsert = "INSERT INTO favret (iduser,userName,timlikuser,timlike_day,idfavret) VALUES ('" + iduser + "','" + userName + "',CURRENT_TIME(),CURRENT_DATE(),'" + idfavret + "' )"
  db.query(sqlInsert, (err, result) => {
    console.log(result);
    res.sendStatus(200);
  })


});








// viewpost
app.post('/api/viewpostpos', (req, res) => {
  const id_user = req.body.id_user
  console.log(id_user);
  const view = "SELECT * FROM view_post WHERE id_user='" + id_user + "' ";


  db.query(view, (err, result) => {
    if (result) {

      console.log(result);
      //console.log(postpblec);
      res.send(result).status(200);
      console.log(result);



    } else {
      console.log(err)
    }

  });
})
app.get('/api/viewpost', (req, res) => {

  const view = "SELECT * FROM view_post ";


  db.query(view, (err, result) => {
    if (result) {

      // console.log(result);
      //console.log(postpblec);
      res.send(result).status(200);
      console.log(result);



    } else {
      console.log(err)
    }

  });
})



app.post("/api/insertviewpost", (req, res) => {
  const id_postuser_target = req.body.idpostwatch
  const id_user = req.body.iduser
  const userName = req.body.userName


  console.log(userName, id_postuser_target, id_user);

  const sqlInsert = "INSERT INTO  view_post (id_user,userName,Timmaint_view,Timday_view,id_postuser_target) VALUES ('" + id_user + "','" + userName + "',CURRENT_TIME(),CURRENT_DATE(),'" + id_postuser_target + "' )"
  db.query(sqlInsert, (err, result) => {
    console.log(result);
    res.sendStatus(200);
  })


});






//flower...
app.get('/api/followerget', (req, res) => {
  const favr = "SELECT * FROM follower ";


  db.query(favr, (err, result) => {
    if (result) {

      // console.log(result);
      //console.log(postpblec);SELECT id_postview,id_user,userName,Timmaint_view,Timday_view,id_postuser_target FROM view_post
      res.send(result).status(200);
      console.log(result);



    } else {
      console.log(err)
    }

  });
});
app.delete("/api/deletfollower/:id_follower", (req, res) => {
  const deblet = "DELETE FROM follower WHERE id_follower=?";
  const id = req.params.id_follower;
  db.query(deblet, id, (err, result) => {

    //console.log(result);
  });

  res.sendStatus(200);

});


app.post("/api/insertfollower", (req, res) => {
  const id_usertyp_follower = req.body.id_usertyp_follower
  const id_userfollower = req.body.id_userfollower
  const userName = req.body.userName


  console.log(userName, id_usertyp_follower, id_userfollower);

  const sqlInsert = "INSERT INTO follower (id_userfollower,userName,Timmaint_follower,Timday_follower,id_usertyp_follower) VALUES ('" + id_userfollower + "','" + userName + "',CURRENT_TIME(),CURRENT_DATE(),'" + id_usertyp_follower + "' )"
  db.query(sqlInsert, (err, result) => {
    console.log(result);
    res.sendStatus(200);
  })


});










app.post("/api/massgecahtrom", (req, res) => {
  const receiber = req.body.email

  console.log(receiber)
  db.query("SELECT * FROM messageChat WHERE sender='" + receiber + "' OR receiver = '" + receiber + "'", (err, result) => {

      console.log({ "hlooo": result })
    res
      .send(result).status(200)

  })
})

// "SELECT * FROM messageChat WHERE timeminet>= CURRENT_TIME() - INTERVAL 30 SECOND OR timday>=CURRENT_DATE - INTERVAL 5 DAY AND sender='" + receiber + "' OR receiver = '" + receiber + "'
// SELECT * FROM messageChat WHERE sender='abrhman2011@gmail.com' OR receiver = 'abrhman2011@gmail.com 'GROUP BY messageChat.idrom ORDER BY timeminet
// "SELECT * FROM messageChat WHERE timeminet>= CURRENT_TIME() - INTERVAL 30 SECOND AND sender='" + receiber + "' OR receiver =  '" + receiber + "' GROUP BY messageChat.idrom"

app.post("/api/massgeimage",   uploads.any('imagemssg'), (req, res) => {

console.log(req.files);
const receiver = req.body.receiver;
const sender = req.body.sender;
const massage= req.body.massage;
const idrom= req.body.idrom;
const usernamereceriv= req.body.usernamereceriv;
const images = []

for(image of req.files){
  console.log(image);
  console.log(image.filename);
  images.push(image);
  console.log(images);
}

images.forEach(imag => {
  db.query("INSERT INTO messagechat(idrom,sender,receiver,usernamereceriv,massage,uri,type,timday,timeminet) VALUES ('"+idrom+"','" + sender + "','" + receiver + "','"+usernamereceriv+"','" + massage + "','" + imag.filename + "','" + imag.mimetype + "',CURRENT_DATE(),CURRENT_TIME())", (err, result) => {
    console.log(err);
    res.sendStatus(200)
  })
})
})





app.post("/api/massgeimagesingl",uploads.single('imagemssgsingl'), (req, res) => {

console.log(req.file);
  const receiver = req.body.receiver;
  const sender = req.body.sender;
  const massage= req.body.massage;
  const idrom= req.body.idrom;
  const usernamereceriv= req.body.usernamereceriv;
  // console.log(receiber, sender)
  // db.query("INSERT INTO messagechat(sender,receiver,massage,uri,name,type,timday,timeminet) VALUES ('" + sender + "','" + receiber + "','" + massage + "','"+req.file.filename+"','"+req.file.destination+"','"+req.file.mimetype+"',CURRENT_DATE(),CURRENT_TIME())", (err, result) => {
  //   console.log(err);
  //   res.send(result)
  // });
  db.query("INSERT INTO messagechat(idrom,sender,receiver,usernamereceriv,massage,uri,type,timday,timeminet) VALUES ('"+idrom+"','" + sender + "','" + receiver + "','"+usernamereceriv+"','" + massage + "','" + req.file.filename + "','" + req.file.mimetype + "',CURRENT_DATE(),CURRENT_TIME())", (err, result) => {
    console.log(err);
    res.sendStatus(200)
  })
})





  




io.on('connection', (Socket) => {

  console.log('a user connected');
  const generateID = () => Math.random().toString(36).substring(2, 10);

  // Socket.on('send_messageimags',(data) => {
  //   console.log("received message", data)

  // io.emit('received_message',data)
  // });
  Socket.on('send_message',(data) => {
    console.log("received message", data)



  db.query("INSERT INTO messagechat(idrom,sender,receiver,usernamereceriv,massage,uri,type,timday,timeminet) VALUES ('"+data.idrom+"','" + data.sender + "','" + data.receiver + "','"+ data.usernamereceriv +"','" + data.massage + "','" + data.uri + "','" + data.type + "',CURRENT_DATE(),CURRENT_TIME())", (err, result) => {
    console.log(result);
    // res.set(result)
  })
 
  io.emit('received_message',data)



  });

  Socket.on('disconnect', () => {
    console.log('user disconnected');
  });

})





app.listen(port, () => {

  // console.log(http.g);
});





