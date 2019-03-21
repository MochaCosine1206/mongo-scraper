// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {

    // Display the apropos information on the page
    let articleCard = $("<div>").addClass("card").attr("id", "articleCard").attr("saved", "false");
    let articleImg = $("<img>").addClass("card-img-top");
    articleImg.attr("src", data[i].img);
    let articleCardBody = $("<div>").addClass("card-body");
    let articleCardTitle = $("<h5>").addClass("card-title");
    let articleCardLink = $("<a>").addClass("card-link");
    articleCard.attr("data-id", data[i]._id);
    articleCardTitle.text(data[i].title);
    articleCardLink.attr("href", data[i].link);
    articleCardLink.text(data[i].link);
    articleCardBody.append(articleImg, articleCardTitle, articleCardLink);
    articleCard.append(articleCardBody);
    $("#articles").append(articleCard);
  }
});

$("#scrapeButton").click(function () {
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data)
      alert(data.articles.length + " articles scraped!");
    });
  location.reload();
})

// Whenever someone clicks a articleCard
$(document).on("click", "#articleCard", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log("thisId: " + thisId)
  getNotes(thisId)
});

$(document).on("click", "#deleteButton", function () {
  
  // Save the id from the p tag
  var dataID = $(this).attr("dataID");
  console.log("the data ID is: " + dataID)
  $(this).closest("div").remove();
  deleteNote(dataID)
})

// When you click the savenote button
$(document).on("click", "#savenote", function () {
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
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

function getNotes(thisId) {
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article
      let noteCard = $('<div>').addClass("card")
      let notesCard;

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
      if (data.note) {
        for (let i = 0; i < data.note.length; i++) {
          let notesCardBody = $("<div>").addClass("card-body");
          let notesCardTitle = $('<h5>').attr("id", "cardTitle").addClass("card-title");;
          let notesCardComment = $('<p>').attr("id", "cardComments").addClass("card-text");;
          let notesCardDeleteButton = $('<button>').addClass("btn btn-danger").attr("dataID", data.note[i]._id + "," + thisId).attr("id", "deleteButton").text("X")
          console.log("Note " + [i] + " :" + data.note[i].title)
          notesCardTitle.text(data.note[i].title)
          notesCardComment.text(data.note[i].body)
          notesCard = $('<div>').addClass("card")
          notesCardBody.append(notesCardTitle, notesCardComment, notesCardDeleteButton)
          notesCard.append(notesCardBody)
          $("#notes").append(notesCard)
        }
      }
    });
}

function deleteNote(dataID) {
  $.ajax({
    method: "DELETE",
    url: "/notes/" + dataID
  })
}
