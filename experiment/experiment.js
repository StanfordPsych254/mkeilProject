// I'm implementing the experiment using a data structure that I call a **sequence**. The insight behind sequences is that many experiments consist of a sequence of largely homogeneous trials that vary based on a parameter. For instance, in this example experiment, a lot stays the same from trial to trial - we always have to present some number, the subject always has to make a response, and we always want to record that response. Of course, the trials do differ - we're displaying a different number every time. The idea behind the sequence is to separate what stays the same from what differs - to **separate code from data**. This results in **parametric code**, which is much easier to maintain - it's simple to add, remove, or change conditions, do randomization, and do testing.

// ## High-level overview
// Things happen in this order:

//1. Display directions for what to do in the experiment.
//2. Randomize experimental condition for file A size (2 or 8 words)
//3. Randomize if save or no-save trial(1 each for first two rounds of practice)
//4. Display two files, file 1A and File 1B, and file 1A can only be clicked first, if file 1B is clicked, pop-up will say must first study file A
//5. (Display?) 15 second timer runs out, and have the ability to save file or just leaves window and disappears
//6. Click on FileB and appears, 15s timer begins
//7. After 15s timer, 20s distractor task of subtraction problems. tree then must press enter, Eric will send code
//8. Immediately sent to recall test for testB(20s with input box)
//8B. If save condition, can reclick on fileA and study for another 15s after B test
//9. Tested on FileA for 20s, input box for words
//10. 1 min long game in between (tetris.js file or jump game, create file folder for tetris)

//need to have 1 min game in between trials
//need to retain data info and input every trial

// Shows slides. We're using jQuery here - the **$** is the jQuery selector function, which takes as input either a DOM element or a CSS selector string.
function showSlide(id) {
  // Hide all slides
	$(".slide").hide();
	// Show just the slide we want to show
	$("#"+id).show();
}

// Get a random integer less than n.
function randomInteger(n) {
	return Math.floor(Math.random()*n);
}

// Get a random element from an array (e.g., <code>random_element([4,8,7])</code> could return 4, 8, or 7). This is useful for condition randomization.
function randomElement(array) {
// I need to test this function more.
  var randomIndex = randomInteger(array.length);
  var returnString = array[randomIndex];
  array.splice(randomIndex, 1);

  return returnString;
}

// ## Configuration settings
var PDF1A = ["bear","insect","dinner","crib","hobby","thumb","knot","blade"],
    PDF1B = ["bikes","hate","waste","lip","form","jeans","match","rat"],
    PDF2A = ["doll","skate","toad","collar","powder","sense","shoe","system"],
    PDF2B = ["cannon","zoo","attack","brick","plate","crown","cat","board"],
    PDF3A = ["chess","curtain", "time","plant","pies","geese","jar","word"],
    PDF3B = ["horse","space","cent","meal","candy","army","expert","wash"],
    PDF4A = ["clam","mice","guide","key","note","river","pen","earth"],
    PDF4B = ["title","tub","letter","cellar","offer","planes","knee","hope"],
    PDF5A = ["flag","eggs","boy","rail","party","snow","button","wine"],
    PDF5B = ["moth","steel","lumber","suit","sound","trip","sign","junk"],
    PDF6A = ["stage","duck","rifle","fang","shirt","bulb","fruit","yarn"],
    PDF6B = ["toy","glove","roll","scene","fowl","lace","son","field"],
    PDF7A = ["cup","street","paper","bank","voyage","fuel","swing","bag"],
    PDF7B = ["laugh","whip","land","thing","car","walk","sink","camp"],
    PDF8A = ["crow","office","drink","war","design","legs","death","frame"],
    PDF8B = ["top","animal","stream","test","meat","chair","store","bead"],
    PDF1A2 = ["bear","crib"],
    PDF2A2 = ["toad,system"],
    PDF3A2 = ["time","jar"],
    PDF4A2 = ["key","river"],
    PDF5A2 = ["eggs","snow"],
    PDF6A2 = ["rifle","shirt"],
    PDF7A2 = ["cup","fuel"],
    PDF8A2 = ["office","war"],
    trialsaves = ["save","nosave","save","nosave","save","nosave"],
    PDFAs = [PDF3A,PDF4A,PDF5A,PDF6A,PDF7A,PDF8B],
    PDFBs = [PDF3B,PDF4B,PDF5B,PDF6B,PDF7B,PDF8B],
    PDFA2s = [PDF3A2,PDF4A2,PDF5A2,PDF6A2,PDF7A2,PDF8A2],
    instructionCount = 0,
    pdfA = "",
    pdfB = "",
    savetrial = "",
    startTime = "",
    endTime = "",
    recallDigs = "",
    recallwordsA = "",
    recallwordsB = "",
    start_number = "",
    trialnum = 0,
    savechoice = "";

// Show the instructions slide -- this is what we want subjects to see first.
showSlide("instructions");

//randomize 2 or 8 word fileB, how to make this split among the 48, or should I just do random?
var randomcon = randomInteger(2);
  if (randomcon == 0){
      condition = 2;
  }
  else{
      condition = 8;
  }

//nothings changed
// ## The main event
// I implement the sequence as an object with properties and methods. The benefit of encapsulating everything in an object is that it's conceptually coherent (i.e. the <code>data</code> variable belongs to this particular sequence and not any other) and allows you to **compose** sequences to build more complicated experiments. For instance, if you wanted an experiment with, say, a survey, a reaction time test, and a memory test presented in a number of different orders, you could easily do so by creating three separate sequences and dynamically setting the <code>end()</code> function for each sequence so that it points to the next. **More practically, you should stick everything in an object and submit that whole object so that you don't lose data (e.g. randomization parameters, what condition the subject is in, etc). Don't worry about the fact that some of the object properties are functions -- mmturkey (the Turk submission library) will strip these out.**
var experiment = {
  //Randomize the conditions


  // Parameters for this sequence.
  trials: 16,
  // An array to store the data that we're collecting.
  data: [],
  //Cycle through instructions
  nextInstruction: function(){
    instructionCount++;
    if(instructionCount == 1){
      if(condition == 2){
          $('#eight').hide();
          $('#eightpic').hide();
      }
      else{
          $('#two').hide();
          $('#twopic').hide();
      }
    }
    showSlide("instructions" + instructionCount);
  },

  message: function(message) {
    if(message == "display_trial"){
      showSlide("trialintro");
      trialnum++;
      $("#intro1").text("Trial "+ trialnum);
    }
    if(message == "display_distractor"){
      $('body').css('background-color', 'white');
      showSlide("distractorintro");
      $( "#intro2" ).text("Backwards Subtraction Test");
      $( "#time2" ).text("(20 seconds)");
    }
    if(message == "display_recallA"){
      showSlide("recallintroA");
      $( "#intro3" ).text("Test of Recall for File A words");
      $( "#time3" ).text("(20 seconds)");
    }
    if(message == "display_recallB"){
      showSlide("recallintroB");
      $( "#intro4" ).text("Test of Recall for File B words");
      $( "#time4" ).text("(20 seconds)");
    }
  },

  practiceA: function() {
    experiment.startTime = (new Date()).getTime();
    //randomize if saving trial
    if(experiment.trials == 16){
          experiment.savetrial = "nosave";
        }
        else if(experiment.trials == 14){
          experiment.savetrial = "save";
        }
        else{
          experiment.savetrial = randomElement(trialsaves).toString();
        }

    //reset changes
    $( "#pdfA" ).show();
    $( "#pdfB" ).show();
    $("#saving").text("");

    showSlide("stage");
    $('#table').show();
    $("#pdfA").text("File A");
    $("#pdfA").append('<img src="images/pdf.png" id = "pdfimage"/>');
    $("#pdfB").text("File B");
    $("#pdfB").append('<img src="images/pdf.png" id = "pdfimage"/>');

    var table = document.getElementById("pdfA");
    table.onclick = function () {
      $('#table').hide();
      if (condition == 2){
        if(experiment.trials == 16){
          PDFA = PDF1A2.toString();
        }
        else if(experiment.trials == 14){
          PDFA = PDF2A2.toString();
        }
        else{
          PDFA = randomElement(PDFA2s).toString();
        }
      }
      else if (condition == 8){
        if(experiment.trials == 16){
          PDFA = PDF1A.toString();
        }
        else if(experiment.trials == 14){
          PDFA = PDF2A.toString();
        }
        else{
          PDFA = randomElement(PDFAs).toString();
        }
      }
      experiment.pdfA = PDFA;
      PDFA = PDFA.replace(/,/g, '<br>');
      var div = document.getElementById("doc");
      div.style.display="block";
      div.innerHTML = PDFA;
      $('#doc').css('background-color', 'white');
      $('body').css('background-color', 'gray');
      //go to saving screen
      setTimeout(function(){
        $('#doc').html("");
        experiment.save();
      }, 15000);
    };

    // Display warning to choose file A first
    var table2 = document.getElementById("pdfB");
    table2.onclick = function () {
      var div = document.getElementById("warning");
      div.style.display="block";
      div.innerHTML = "You must study File A before studying File B";
    };
  },

  practiceB: function(word) {
    experiment.savechoice = word;
    $('body').css('background-color', 'white');
    $('#doc').hide();
    $('#warning').hide();
    experiment.trials--;
    experiment.trials--;

    showSlide("stage");
    $('#table').show();
    $("#pdfA").text("File A");
    $("#pdfA").append('<img src="images/pdf.png" id = "pdfimage"/>');
    $("#pdfB").text("File B");
    $("#pdfB").append('<img src="images/pdf.png" id = "pdfimage"/>');

    if(word == "save"){
      var div = document.getElementById("saving");
      div.style.display="block";
      div.innerHTML = "File A has been saved";
    }
    else{
      var div = document.getElementById("saving");
      div.style.display="block";
      div.innerHTML = "File A has been deleted. Please study File B now.";
      $( "#pdfA" ).hide();
    }

    var table = document.getElementById("pdfB");
    table.onclick = function () {
      $('#table').hide();

      if(experiment.trials == 14){
          PDFB = PDF1B.toString();
      }
      else if(experiment.trials == 12){
          PDFB = PDF2B.toString();
      }
      else{
          PDFB = randomElement(PDFBs).toString();
      }

      experiment.pdfB = PDFB;
      PDFB = PDFB.replace(/,/g, '<br>');
      var div = document.getElementById("doc");
      div.style.display="block";
      div.innerHTML = PDFB;
      $('#doc').css('background-color', 'white');
      $('body').css('background-color', 'gray');
      //go to saving screen

      setTimeout(function(){
        $('#doc').hide();
        $('#warning').hide();
        experiment.saveB();
      }, 15000);
    };

    // Display warning to choose file B first
    var table2 = document.getElementById("pdfA");
    table2.onclick = function () {
      var div = document.getElementById("warning");
      div.style.display="block";
      div.innerHTML = "You must now study File B, before returning to File A";
    };
  },

  distractor: function() {
      $("#recall-digits").val("");
      showSlide("distractor");
      // time = new Date().getTime();
      // countdownCounter1 = setInterval(function(){experiment.CountdownTime(20,time,1)}, 1000);
      starter = Math.floor(Math.random() * 800) + 200; 
      experiment.start_number = starter;
      $("#directions").text("Subtract 3 from " + starter +  " as many times as possible. Press 'Enter' or 'Return' between numbers.");
      setTimeout(function(){
        var recallDigits = $("#recall-digits").val();
        experiment.recallDigs = recallDigits;
        $('#space-warn3').hide();
        experiment.message("display_recallB");
      }, 20000);
  },

  save: function() {
    showSlide("save_screen");
    var div = document.getElementById("save-instruct");
    if (experiment.savetrial == "save"){
      div.innerHTML = "Please Save File A";
    }
    else{
      div.innerHTML = "Please Delete File A";
    }
  },

  saveB: function(){
    showSlide("save_screenB")
    var div = document.getElementById("save-instructB");
    div.innerHTML = "Please Delete File B";
  },

  recallB: function() {
      showSlide("recallB");
      // time = new Date().getTime();
      // countdownCounter2 = setInterval(function(){experiment.CountdownTime(20,time,2)}, 1000);
      $("#recall-text").val("");
        setTimeout(function(){
          var recallText = $("#recall-text").val();
          experiment.recallwordsB = recallText;
          $('#space-warn1').hide();
          if(experiment.savetrial == "save"){
            experiment.restudyA();
          }
          else{
            experiment.message("display_recallA");
          }
        }, 20000);
  },

  recallA: function() {
      showSlide("recallA");
      // time = new Date().getTime();
      // countdownCounter3 = setInterval(function(){experiment.CountdownTime(20,time,3)}, 1000);
      $("#recall-text2").val(""); 
        setTimeout(function(){
          var recallText = $("#recall-text2").val();
          experiment.recallwordsA = recallText;
          $('#space-warn2').hide();
          experiment.endTime = (new Date()).getTime();
          totalTime = (experiment.endTime - experiment.startTime);
          //input trial data
          data = {
              time: totalTime, 
              word_condition: condition,
              save_condition: experiment.savetrial,
              save_choice: experiment.savechoice,
              FileA: experiment.pdfA ,
              FileB: experiment.pdfB,
              start_number: experiment.start_number,
              digits: experiment.recallDigs,
              A_Recall: experiment.recallwordsA,
              B_Recall: experiment.recallwordsB
             };
          experiment.data.push(data);
          experiment.tetris();   
        }, 20000);
  },

  tetris: function() {
    showSlide("tetris");
    // time = new Date().getTime();
    // countdownCounter4 = setInterval(function(){experiment.CountdownTime(60,time,4)}, 1000);
    if(trialnum <2){
      $('.game').blockrain();
    }
    else{
      $('.game').blockrain('resume');
      // $('.game').blockrain('controls', true);
    }
    setTimeout(function(){
      if (experiment.trials == 0) {
        showSlide("debriefing");
        return
      }
      $('.game').blockrain('pause');
      // $('.game').blockrain('controls', false);
      experiment.message("display_trial");
    }, 60000);
  },

  restudyA: function() {
    showSlide("stage");
    $("#saving").text("Restudy File A");
    $('#table').show();
    $("#pdfA").text("File A");
    $("#pdfA").append('<img src="images/pdf.png" id = "pdfimage"/>');
    $("#pdfA").show();
    $("#pdfB").text("File B");
    $("#pdfB").append('<img src="images/pdf.png" id = "pdfimage"/>');
    $( "#pdfB" ).hide();
    var table = document.getElementById("pdfA");
    table.onclick = function () {
      $('#table').hide();
      var div = document.getElementById("doc");
      div.style.display="block";
      PDFA = experiment.pdfA;
      PDFA = PDFA.replace(/,/g, '<br>');
      div.innerHTML = PDFA;
      $('#doc').css('background-color', 'white');
      $('body').css('background-color', 'gray');

      setTimeout(function(){
        $('#doc').html("");
        $('body').css('background-color', 'white');
        $('#doc').hide();
        experiment.message("display_recallA");
      }, 15000);
    };
  },

  submit_comments: function() {
    data = {
          age: document.getElementById("age").value, 
          gender: document.getElementById("gender").value,
          homelang: document.getElementById("homelang").value,
          race: document.getElementById("race").value,
          comment: document.getElementById("comment").value,
             };
    experiment.data.push(data);
    experiment.end();
  },
  // CountdownTime: function(count,time,num) {
  //   var countDown = count;
  //   var currentTime = new Date().getTime();
  //   var diff = currentTime - time;
  //   var seconds = countDown - Math.floor(diff / 1000);
  //   if (seconds >= 0) {
  //     $("#seconds").text(seconds);
  //     console.log(seconds);
  //   } 
  //   else {
  //     clearInterval("CountdownCounter"+"num");
  //   }
  // },

  // The function that gets called when the sequence is finished.
  end: function() {
    // Show the finish slide.
    showSlide("finished");
    // Wait 1.5 seconds and then submit the whole experiment object to Mechanical Turk (mmturkey filters out the functions so we know we're just submitting properties [i.e. data])
    setTimeout(function() { turk.submit(experiment.data) }, 1500);
  },
 }; 
    

$('#recall-text').keypress(function(e) {
  if (e.which == 32 || e.which == 188 || e.which == 44  ) {
    $('#space-warn1').css("display", "block");
    return false;
  }
  if (e.which == 13) {
    setTimeout(function() {
        $('#space-warn1').slideUp('slow');
    }, 1000);
  }
});

$('#recall-text2').keypress(function(e) {
  if (e.which == 32 || e.which == 188 || e.which == 44  ) {
    $('#space-warn2').css("display", "block");
    return false;
  }
  if (e.which == 13) {
    setTimeout(function() {
        $('#space-warn2').slideUp('slow');
    }, 1000);
  }
});

$('#recall-digits').keypress(function(e) {
  if (e.which == 32 || e.which == 188 || e.which == 44  ) {
    $('#space-warn3').css("display", "block");
    return false;
  }
  if (e.which == 13) {
    setTimeout(function() {
        $('#space-warn3').slideUp('slow');
    }, 1000);
  }
});


