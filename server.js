var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB

let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoscraperdb"
mongoose.connect(MONGODB_URI);




// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.theverge.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data, { xmlMode: true });

    // Now, we grab every h2 within an article tag, and do the following:
    $(".c-compact-river__entry").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find("h2").text();
      result.link = $(this).find("a").attr("href");
      result.img = $(this).find("noscript").children().first().attr("src");
      result.timeCreated = $(this).find("time").attr("datetime")

      
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          res.json(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({}).sort({timeCreated: -1})
  .then(function(dbArticle) {
    res.json(dbArticle)
  })
  .catch(function(err){
    res.json(err);
  })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findOne({"_id": req.params.id})
  .populate("note")
  .then(function(dbArticleNote){
    res.json(dbArticleNote)
  })
  .catch(function(err){
    res.json(err)
  })
});

app.delete("/notes/:id", function(req, res){
  console.log("this is the id: " + req.params.id)
  idArr = req.params.id.split(",");
  console.log("id Array: " + idArr)
  db.Note.remove({"_id": idArr[0]})
  .then(function(){
    return  db.Article.update({"_id": idArr[1]},{ $pull: {'note': idArr[0]}})
  })
  .then(function(dbArticle){
    res.json(dbArticle)
  })
  .catch(function(err){
    res.json(err);
  })
})

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.create(req.body)
  .then(function(dbNotes){
    
    return db.Article.findOneAndUpdate({"_id": req.params.id},{ $push: {'note': dbNotes.id}}, { new: true } );
  })
  .then(function(dbArticle){
    res.json(dbArticle)
  })
  .catch(function(err){
    res.json(err);
  })
});
//Route for getting all notes
app.get("/articleNotes/", function(req, res){
})

app.get("/", function(req, res){
  res.sendFile(path.join(__dirname, "index.html"));
})

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});





