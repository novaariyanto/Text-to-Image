const express = require('express');
const path = require('path')
const router = express.Router();
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser');
// const nodeHtmlToImage = require('node-html-to-image');
const nodeHtmlToImage = require('./src/index.js')
const app = express()
const axios = require('axios');
const { response } = require('express');
app.set('views', path.join(__dirname, 'views'));
//set view engine
app.set('view engine', 'hbs');
//instead of app.engine('handlebars', handlebars({
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    //new configuration parameter
    extname: 'hbs'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets', express.static(__dirname + '/public'));
app.get('/gethtml', (req, res) => {
    // var d = req.body.text
    var d =req.headers.data
     // res.send(req.body) 
    res.render('body', {
        layout: 'index',
        text: d
    });
})
app.get('/gethtml2', (req, res) => {
    // var d = req.body.text
    var d =req.headers.data
    // var d ='test'
     // res.send(req.body) 
    res.render('body', {
        layout: 'index2',
        text: d
    });
})
app.post(`/api/generate/:id`, async function (req, res) {
    var text = req.body.text
    var number = req.body.number
    let code = makeid(5);
    const puppeteer = require('puppeteer');
    var id = req.params.id;
    var host = req.headers.host;
    var url = "";
    if(id == 1){
        url = `${host}/gethtml`;
    }else{
        url =  `${host}/gethtml2`;
    }
    
    async function run() {
        let browser = await puppeteer.launch({ headless: false });
        let page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {

            // Here, is where you change the request method and 
            // add your post data
            // var data = {
            //     'method': 'POST',
            //     'postData': `text=${d}`
            // };
            if (!interceptedRequest.isNavigationRequest()) {
                interceptedRequest.continue();
                return;
              }
              // Add a new header for navigation request.
              const headers = interceptedRequest.headers();
              headers['data'] = text;
              interceptedRequest.continue({ headers });
        });
        await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForSelector('.bbx')
        const element = await page.$('.bbx')
        await element.screenshot({
            path: `public/${number}_${code}.jpg`,
            type: "jpeg"
        });
        await browser.close();
      
    }
  run();  
  setTimeout(() => {
      var respons = {
          success : true,
          message : '',
          data : {
            imgurl : `${host}/assets/${number}_${code}.jpg`
          }
      }
    res.send(respons)
  }, 5000);


});
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 

app.listen(3032, (req, res) => {
    console.log('running in port 3032')
})