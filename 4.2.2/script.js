var mainBody = document.body;
var raw = mainBody.innerHTML;

// Remove the script from the input file
var lastScript = findLastScript(raw);
raw = raw.substring(0, lastScript);
// Erase page text to start over
mainBody.innerHTML = "";
var title;
var headings = [];
var bodies = [];
var subheadings = [];

setHead();
readPage();
writePage();

function findLastScript(input) {
    var index = 0;
    while (input.indexOf("<script") >= 0) {
        index = input.indexOf("<script");
        input = input.substring(index + 1);
    }
    return index;
}

function setHead() {
    var head = document.head;
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "style.css";
    head.appendChild(link);
}

function readPage() {
    var headingFound = false;
    var bodyFound = false;
    var subHeadingFound = false; // Track if a subheading is found
    while (raw.indexOf("::") > -1) {
        var index = raw.indexOf("::"); // initial index of marker
        var endColon = raw.indexOf("::", index + 2); // end index of marker
        var type = raw.substring(index + 2, endColon); // read which mark up

        // The body of the markup goes to the next marker or the end of the file
        var endBody = raw.indexOf("::", endColon + 2);
        if (endBody == -1) {
            endBody = raw.length;
        }
        // Now the text to mark up is defined
        var text = raw.substring(endColon + 2, endBody);

        if (type.toUpperCase().trim() == "TICKET") {
            title = text.trim();
            document.title = title;
        } else if (type.toUpperCase().trim() == "HEADING") {
            // Second heading found without a body
            if (bodyFound == false && headingFound == true) {
                bodies.push("");
            }
            headings.push(text.trim());
            headingFound = true;
            bodyFound = false;
        } else if (type.toUpperCase().trim() == "BODY") {
            // second body found without a heading
            if (bodyFound == true && headingFound == false) {
                headings.push("");
            }
            bodies.push(text.trim());
            bodyFound = true;
            headingFound = false;
        } else if (type.toUpperCase().trim() == "SUBHEADING") { // Handle subheadings
            if (subHeadingFound == true) { // If a subheading is found without a body
                bodies.push(""); // Add an empty body
            }
            subheadings.push(text.trim()); // Push the subheading text
            subHeadingFound = true;
        }

        // cut off the part we just read
        raw = raw.substring(endBody);
    }
}

function writePage() {
    // Create the overall class
    var main = document.createElement("div");
    main.className = "OnePager";
    mainBody.appendChild(main);

    // Find out how many boxes. Number of boxes
    // is the max of number of headings and bodies
    // This does not include the title
    //var numBoxes = Math.max(headings.length/*, subheadings.length*/, bodies.length);
    var numBoxes = Math.max(headings.length, bodies.length);
    if (numBoxes == 4) {
        create4Box(main);
    } else {
        createGeneric(main, numBoxes);
    }
}

function createTitle() {
    var row = document.createElement("div");
    row.className = "row";
    var titleEl = document.createElement("div");
    titleEl.className = "title";
    var titleText = document.createElement("p");
    titleText.innerHTML ="<h2>Support Ticket</h1><hr>" +
    "<br><b>Open Date:</b> <input placeholder=\"02/14/2024\" id=\"od\" type=date>" +
    "<br><br><b>Close Date:</b> <input type=\"date\">" +
    "<br><br><b>IT Professional:</b> <input placeholder=\"Mylz McCullough\"type=\"text\">" +
    "<br><br><b>Subject:</b> Bad Signal Strength" +
    "<br><br><b>Request Detail:</b> Hello, the sales department " +
    "is having a hard time finding a good signal from our " + 
    "wireless access point. It seems to be working " +
    "fine for the marketing department who is in the same " +
    "room as the Wireless Access Point. The sales department is in a different " +
    "room. Please help! Thank you" +
    "<br><br><b>Summary of Solution: </b>" +
    title;
    titleEl.appendChild(titleText);
    row.appendChild(titleEl);
    return row;
}

function createGeneric(main, numBoxes) {
    // Add title at top
    main.appendChild(createTitle());
    // If num of boxes is odd, first box is full length and remainder
    // are half size
        for (var i = 0; i < numBoxes; i ++) {
            main.appendChild(createRow(i));
        }
}

function createRow(index) {
    var row = document.createElement("div");
    row.className = "row";
    row.appendChild(createBox(index, "full"));
    return row;
}

function create4Box(main) {
    var titleEl = createTitle();
    for (var i = 0; i < 4; i += 2) {
        // Add title before the 3rd element
        if (i == 2) {
            main.appendChild(titleEl);
        }
        main.appendChild(createRow(i));
    }
}

function createBox(index, size) {
    var holder = document.createElement("div");
    if (size == "full") {
        holder.className = "item_full";
    } else {
        holder.className = "item_full";
    }

    holder.appendChild(createHeading(index)); // Add heading
    holder.appendChild(createSubHeading(index)); // Add subheading
    holder.appendChild(createBody(index)); // Add body

    return holder;
}

function createHeading(index) {
    var headingEl;
    headingEl = document.createElement("h2");

    if (headings.length > index) {
        headingEl.innerHTML = headings[index];
    }
    return headingEl;
}

// Implement the addSubHeading function
function createSubHeading(index) {
    var subheadingEl = document.createElement("h3");

    if (subheadings.length > index) {
        subheadingEl.innerHTML = subheadings[index];
    }
    return subheadingEl;
}

/*
function createSubHeading(index) {
    var subheading;
    subheading = document.createElement("h3")

    if (subheadings.length > index) {
        subheading.innerHTML = subheadings[index];
    }
    return subheading;
}
*/
function createBody(index) {
    var bodyEl = document.createElement("div");
    if (bodies.length > index) {
        var bodyLines = bodies[index].split("\n");
        for (var j = 0; j < bodyLines.length; j++) {
            if (bodyLines[j].indexOf("[[") > -1) {
                if (bodyLines[j].indexOf("|") > -1) {
                    bodyEl.appendChild(addURL(bodyLines[j])); // Handle URL
                } else {
                    bodyEl.appendChild(addImage(bodyLines[j])); // Handle image
                }
            } else if (bodyLines[j].indexOf("**") > -1) {
                bodyEl.appendChild(addBullet(bodyLines[j])); // Handle bullet
            } else {
                bodyEl.appendChild(addLine(bodyLines[j])); // Handle regular line
            }
        }
    }
    return bodyEl;
}
function addImage(line) {
    var start = line.indexOf("[[") + 2;
    var end = line.indexOf("]]");
    var src = line.substring(start, end);
    var imgContainer = document.createElement("div");
    imgContainer.className = "img-container";
    var imgEl = document.createElement("img");
    imgEl.setAttribute("src", src);
    imgContainer.appendChild(imgEl);
    return imgContainer;
}

function addURL(line) {
    var start = line.indexOf("[[") + 2;
    var end = line.indexOf("|");
    var url = line.substring(start, end);
    var text = line.substring(end + 1, line.indexOf("]]"));
    
    var linkEl = document.createElement("a");
    linkEl.setAttribute("href", url);
    linkEl.textContent = text;
    
    return linkEl;
}

function addBullet(line) {
    var start = line.indexOf("**") + 2;
    var bulletEl = document.createElement("li");
    bulletEl.innerHTML = line.substring(start);
    return bulletEl;
}

function addLine(line) {
    var lineEl = document.createElement("p");
    lineEl.innerHTML = line;
    return lineEl;
}