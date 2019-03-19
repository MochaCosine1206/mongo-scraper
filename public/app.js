// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    let articleCard = $("<div>").addClass("card").attr("id", "articleCard");
    let articleImg = $("<img>").addClass("card-img-top");
    articleImg.attr("src", data[i].img);
    let articleCardBody = $("<div>").addClass("card-body");
    let articleCardTitle = $("<h5>").addClass("card-title");
    let articleCardText = $("<div>").addClass("card-text");
    articleCard.attr("data-id", data[i]._id);
    articleCardTitle.text(data[i].title);
    articleCardText.text(data[i].link);
    articleCardBody.append(articleImg, articleCardTitle, articleCardText);
    articleCard.append(articleCardBody);
    $("#articles").append(articleCard);
  }
});

$("#scrapeButton").click(function(){
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log("data scrapped: " + data);
    });
})
// Whenever someone clicks a articleCard
$(document).on("click", "#articleCard", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log("thisId: " + thisId)

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      let noteCard = $('<div>').addClass("card")
      let formGroup = $("<div>").addClass("form-group");
      formGroup.append("<h5>" + data.title + "</h5>");
      // An input to enter a new title
      formGroup.append("<input id='titleinput' name='title' placeholder='Title' ><br>");
      // A textarea to add a new note body
      formGroup.append("<textarea id='bodyinput' name='body' placeholder='note text'></textarea><br>");
      // A button to submit a new note, with the id of the article saved to it
      formGroup.append("<button data-id='" + data._id + "' id='savenote' class='btn btn-primary mb-2'>Save Note</button>");
      noteCard.append(formGroup)
      $("#notes").append(noteCard)

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
