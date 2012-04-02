var express = require('express');
var fs = require('fs');
var path = require('path');
var db       = require('nano')('http://israbirding.iriscouch.com/test')
var app     = module.exports = express.createServer()


var port = process.env.PORT || 3000;

app.get("/ver1", function (request, response) {
    var filePath = '.' + request.url+ ".htm";
    var extname = path.extname(filePath);
    var contentType = setFileExtension(extname);

    path.exists(filePath, function(exists) {
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
});


app.get("/listPoints", function (request, response){
  var per_page = 10
  , params   = {include_docs: true, limit: per_page, descending: true};

    db.list(params, function(error,body,headers) {
        response.writeHead(200, { 'Content-Type': "application/json" });
        //Generate json for the documents contents;
        var body = JSON.stringify(body);
        response.end(body, 'utf-8');

    });
});

app.get("/setPoint?", function (request, response){

    x = request.param('x');
    y = request.param('y');
    console.log ("Adding new point: " + x + ", " + y);

    if(typeof x == "undefined" || typeof y == "undefined")
    {
                    response.writeHead(500);
                    response.end();
    }
    else
    {
        writeEntryToDb(response, x, y);
    }
    
})





app.get("/ver2", function (request, response) {
    var filePath = '.' + request.url+ ".htm";
    var extname = path.extname(filePath);
    var contentType = setFileExtension(extname);
    

    path.exists(filePath, function(exists) {
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
});

function setFileExtension(extname){
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        }
    return contentType;
}


function writeEntryToDb(response, x, y)
{

    console.log ("going to save document.");

    insert_doc({x:x, y:y}, 0);

    response.writeHead(200);
    response.end();
}

 function insert_doc(doc, tried) {
    db.insert(doc,
      function (error,http_body,http_headers) {
        if(error) {
            console.log(error);
          if(error.message === 'no_db_file'  && tried < 1) {
            // create database and retry
            return db.create("test", function () {
              insert_doc(doc, tried+1);
            });
          }
          else { return console.log(error); }
        }
        console.log(http_body);
    });
  }


app.listen(port);
