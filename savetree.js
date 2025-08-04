// THIS CODE IS MY OWN WORK, IT WAS WRITTEN WITHOUT CONSULTING CODE WRITTEN BY OTHER STUDENTS OR COPIED FROM ONLINE RESOURCES.
// Zia Dawood

let nodeRadius = '15';

// set in setup, represents the svg canvas element that the tree gets drawn to
let svgCanvas = null;
// the map that maps clickable circle elements with Node objects that contain info about their parents and children
let map = null;
// the textarea
let workspace = null;
// the node that the user is currently working within
let currentNode = null;
// store the root node of the tree
let rootNode = null;

// variables for the testing
let testState = null;
let testCount = 0;
let initTime = null;
let original = null;
let remix = null;
let remake = null;
let tool = null;
let testId = null;
// a class that represents the state of the document at a given time and maintains a list of children and parents for the
// tree
class Node {
    constructor(text, children, parent, svgNode) {
        this.text = text;
        this.children = children;
        this.parent = parent;
        this.svgNode = svgNode;
    }
}

phrases = [
    ["my watch fell in the water", "my water fell in the watch"],
    ["prevailing wind from the east", "prevailing wind from the west"],
    ["never too rich and never too thin", "always too rich and often too thin"],
    ["breathing is difficult", "trying is difficult"],
    ["i can see the rings on Saturn", "i can see the storm on Saturn"]];

// create a new node below the current one and set it to be the new current node
function save(e){
    console.log("save");
    currentNode.text = workspace.value;
    saveHelper()
}

// handle the textarea displaying the text of the node that's mouseovered
function mouseEnterHandler(event){
    currentNode.text = workspace.value;
    workspace.value = map.get(event.target).text;
}

// handle setting the textarea back after the mouse leaves the node
function mouseLeaveHandler(event){
    workspace.value = currentNode.text;
}

// recursively draws the save tree. Updates every time a new save is made because changing an earlier node will change
// the position of a later node (ef if a new sibling node is made for the current node's parent, then the parent may shift
// and the current node will shift by the same amount to accomodate that - keep the simmetry)
function drawTree(parent){
    // stop recursing when hitting a leaf node
    if (parent.children.length === 0){
        return;
    }
    // This for loop is a bit strange because it basically draws the first child node to the farthest left and the last
    // to the farthest right so I ended up needing to basically work from the outside in from both sides, which is
    // why two child nodes get set here
    for (let i = Math.floor(parent.children.length / 2) - 1; i >= 0; i--) {
        parent.children[i].svgNode.setAttribute("cx", "" + (parseInt(parent.svgNode.getAttribute("cx"))-(i + 1) * 35));
        parent.children[i].svgNode.setAttribute("cy", "" + (parseInt(parent.svgNode.getAttribute("cy")) + 35));
        // draw a line between the parent and child node and then go recurse though the child's children
        addLine(parent.svgNode.getAttribute("cx"), parent.children[i].svgNode.getAttribute("cx"), "" + (parseInt(parent.svgNode.getAttribute("cy")) + parseInt(nodeRadius)), "" +  (parseInt(parent.children[i].svgNode.getAttribute("cy")) - parseInt(nodeRadius)));
        drawTree(parent.children[i]);
        parent.children[parent.children.length - i - 1].svgNode.setAttribute("cx", "" + (parseInt(parent.svgNode.getAttribute("cx"))+ (i + 1) * 35));
        parent.children[parent.children.length - i - 1].svgNode.setAttribute("cy", "" + (parseInt(parent.svgNode.getAttribute("cy")) + 35));
        addLine(parent.svgNode.getAttribute("cx"), parent.children[parent.children.length - i - 1].svgNode.getAttribute("cx"), "" + (parseInt(parent.svgNode.getAttribute("cy")) + parseInt(nodeRadius)), ""  +  (parseInt(parent.children[parent.children.length - i - 1].svgNode.getAttribute("cy")) - parseInt(nodeRadius)));
        drawTree(parent.children[parent.children.length - i - 1]);
    }
    // handle the case where the parent has an odd number of children. This middle child goes right under them
    if(parent.children.length % 2 !== 0) {
        parent.children[Math.floor(parent.children.length /2)].svgNode.setAttribute("cx", "" + (parseInt(parent.svgNode.getAttribute("cx"))));
        parent.children[Math.floor(parent.children.length /2)].svgNode.setAttribute("cy", "" + (parseInt(parent.svgNode.getAttribute("cy")) + 35));
        addLine(parent.svgNode.getAttribute("cx"), parent.children[Math.floor(parent.children.length /2)].svgNode.getAttribute("cx"), "" + (parseInt(parent.svgNode.getAttribute("cy")) + parseInt(nodeRadius)), "" + (parseInt(parent.children[Math.floor(parent.children.length /2)].svgNode.getAttribute("cy")) - parseInt(nodeRadius)));
        drawTree(parent.children[Math.floor(parent.children.length /2)]);
    }
}

// just draws and places a line between two points
function addLine(x1, x2, y1, y2){
    let newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    newLine.setAttribute("x1", x1);
    newLine.setAttribute("y1", y1);
    newLine.setAttribute("y2", y2);
    newLine.setAttribute("x2", x2);
    newLine.setAttribute("stroke", 'black');
    svgCanvas.appendChild(newLine);

}

// does the hard work of allocating a new node and a new svg object ot correspond to it, then calls the drawing methods
// and sets the event handlers for the current node (that's now going to become a parent node if it was a leaf node previously)
function saveHelper() {
    let newNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    let newNodeObj = new Node(workspace.value, [], currentNode, newNode);
    currentNode.children.push(newNodeObj);
    // remove the lines for when they get redrawn in the drawTree method
    let lines = svgCanvas.getElementsByTagName('line');
    for (let i = lines.length - 1; i >= 0; i--) {
        lines[i].remove();
    }
    addLine('100', '100', '0', "" + (50 - parseInt(nodeRadius)))

    drawTree(rootNode);

    newNode.setAttribute('r', nodeRadius);
    svgCanvas.appendChild(newNode);
    // add the new node as a new entry to the map
    map.set(newNode, newNodeObj);
    // make the new node the current node
    currentNode.svgNode.classList.toggle("currentNode");
    newNode.classList.toggle("currentNode");
    // add appropriate event handlers (we remove them to prevent duplicate handers because a node may be the currentNode
    // multiple times if it is clicked and triggers the parentNode function
    currentNode.svgNode.removeEventListener("click", parentNode);
    currentNode.svgNode.removeEventListener("click", leafNode);
    currentNode.svgNode.addEventListener("click", parentNode);
    currentNode = newNodeObj;
    currentNode.svgNode.addEventListener("click", leafNode);
    currentNode.svgNode.addEventListener("mouseenter", mouseEnterHandler);
    currentNode.svgNode.addEventListener("mouseleave", mouseLeaveHandler);
}

// this is the onclick function for a parent node. It sets the clicked node to the current node and then goes through
// the savehelper method, creating a new child
function parentNode(event){
    // this undoes the effect of the mouseenter event because a click means there's no mouseexit to undo it
    workspace.value = currentNode.text;

    let targetNode = map.get(event.target);
    currentNode.text = workspace.value;
    workspace.value = targetNode.text;
    currentNode.svgNode.classList.toggle("currentNode");
    currentNode = targetNode;
    currentNode.svgNode.classList.toggle("currentNode");
    saveHelper();
}

// if a leaf node is clicked, we just store the value of the text area in the current leaf node's text field and then
// switch to the newly-clicked leaf node for the user to begin adding more text
function leafNode(event) {
    workspace.value = currentNode.text;
    currentNode.text = workspace.value;
    workspace.value = map.get(event.target).text;
    currentNode.svgNode.classList.toggle("currentNode");
    currentNode = map.get(event.target);
    currentNode.svgNode.classList.toggle("currentNode");
}

// recursive removal function - cuts all svg circles from the canvas unless its one of the ones we're going to keep
// (parent or current node)
function remove(parent){
    if (!(parent === currentNode || parent === currentNode.parent)){
        parent.svgNode.remove();
    }
    for (let i = parent.children.length - 1; i >= 0; i--) {
        remove(parent.children[i]);
    }
}

// consolidating gets rid of all nodes except the current node and its parent (if it has one), allowing the tree to
// start over. We remove the lines, run the remove function, and then set the root node's only child to the current node
// if it's not already
function consolidate(e){
    let lines = svgCanvas.getElementsByTagName('line');
    for (let i = lines.length - 1; i >= 0; i--) {
        lines[i].remove();
    }
    remove(rootNode);
    map = new Map();
    if (rootNode !== currentNode){
        currentNode.parent.children = [currentNode];
        currentNode.parent.parent = null;
        rootNode = currentNode.parent;
        map.set(currentNode.svgNode, currentNode);
        currentNode.svgNode.setAttribute("cx", "100");
        currentNode.svgNode.setAttribute("cy", "85");
        addLine("100", "100", "65", "70")
    } else {
        currentNode.children = [];
        currentNode.parent = null;
    }
    map.set(rootNode.svgNode, rootNode);
    rootNode.svgNode.setAttribute("cx", "100");
    rootNode.svgNode.setAttribute("cy", "50");
    addLine("100", "100", "0", "35")
}

function setup(){
    // set values after interactive
    svgCanvas = document.getElementById("tree");
    document.getElementById("save").addEventListener("click", save)
    document.getElementById("consolidate").addEventListener("click", consolidate);
    workspace = document.getElementById("workspace");
    map = new Map();

    // set up initial node and line, add the node to the map so we can access the data from events
    let newNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    addLine('100', '100', '0', "" + (50 - parseInt(nodeRadius)))
    newNode.setAttribute('cx', '100');
    newNode.setAttribute('cy', '50');
    newNode.setAttribute('r', nodeRadius);
    newNode.classList.toggle("currentNode")
    svgCanvas.appendChild(newNode);
    let newNodeObj = new Node("", [], null, newNode);
    map.set(newNode, newNodeObj);
    currentNode = newNodeObj;
    rootNode = newNodeObj;
    currentNode.svgNode.addEventListener("mouseenter", mouseEnterHandler);
    currentNode.svgNode.addEventListener("mouseleave", mouseLeaveHandler);

    // set up the test - attach a handler to the start button for it to start the test and send the signal to the server to create a new csv file for the
    // test
    testState = "Not started"
    document.getElementById("start").addEventListener("click", function(e){
        // get a random id for the test (the numbers after the decimal in a random number)
        testId = Math.random().toString().slice(2, -1);
        fetch("http://localhost:3000/newcsv", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({testid: testId}),
        });
        startTest();
    });
}
// this function and the ones below it handle a single trial. They set up the environment (blank textarea and consolidate the tree)
// determine if the save tree should be used (so we can compare results not using the save tree with results that did use the save tree)
// andt then give the first prompt, starting the timer
function startTest(){
    consolidate();
    workspace.value = "";
    testState = "started";
    let useToolString;
    if (Math.random() < 0.5){
        tool = true;
        useToolString = "Please use the save tree throughout this trial."
    } else {
        tool = false;
        useToolString = "Please do NOT use the save tree throughout this trial."
    }
    document.getElementById("prompt").innerText = "Please type \"" + phrases[testCount][0] + "\" and hit enter when you're done. " + useToolString
    initTime = Date.now();
    workspace.addEventListener("keyup", startEnterHandler);
}

// give the variant prompt after the user hits enter from the original prompt
function startEnterHandler(e){
    if(e.code === "Enter"){
        original = workspace.value.slice(0,workspace.value.length-1);
        workspace.value = "";
        workspace.removeEventListener("keyup", startEnterHandler);
        workspace.addEventListener("keyup", remixTest);
        document.getElementById("prompt").innerText = "Please type \"" + phrases[testCount][1] + "\" and hit enter when you're done. "
    }
}

// give the original prompt for the user to reproduce, either with the tool or without it. Set the workspace back to blank
function remixTest(e){
    if (e.code === "Enter"){
        remix = workspace.value.slice(0,workspace.value.length-1);
        workspace.value = "";
        workspace.removeEventListener("keyup", remixTest);
        workspace.addEventListener("keyup", remakeTest);
        document.getElementById("prompt").innerText = "Please reproduce \"" + phrases[testCount][0] + "\" and hit enter when you're done. You may use the tool if you were told to do so earlier this trial. "
    }
}
// after the original is reproduced, post to the csv file with the time information, what the user typed, and distance between the original and reproduced prompt
// then set up the next trial if there are more trials to go. Otherwise, thank the user for participating 
function remakeTest(e){
    if (e.code === "Enter"){
        remake = workspace.value.slice(0,workspace.value.length-1);
        console.log("" + testCount + "," + original + "," + remake + "," + (Date.now() - initTime) + "," + distance(original, remake) + "," + tool);
        testCount++;
        fetch("http://localhost:3000/trial", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({testid: testId, testcount : testCount, orig : original, re : remake , time : Date.now() - initTime, err : distance(original, remake), to : tool}),
        });
        if (testCount < 5){
            startTest();
            workspace.removeEventListener("keyup", remakeTest);
            workspace.addEventListener("keyup", startEnterHandler);
        } else {
            document.getElementById("prompt").innerText = "All done! Thank you!"
        }
    }
}

// the Levenshtein distance, which we use to determine how close the original and remade strings were.
function distance(first, second) {
    let d = [];
    for (let j = 0; j <= first.length; j++) {
        d.push([]);
        for (let k = 0; k <= second.length; k++) {
            d[j].push(0);
        }
    }

    for (let j = 1; j <= first.length; j++) {
        d[j][0] = j;
    }

    for (let j = 1; j <= second.length; j++) {
        d[0][j] = j;
    }

    for (let k = 1; k <= second.length; k++) {
        for (let j = 1; j <= first.length; j++) {
            let subcost = 0;
            if (first[j-1] === second[k-1]) {
                subcost = 0;
            } else {
                subcost = 1;
            }
            d[j][k] = Math.min(d[j-1][k] + 1, d[j][k-1]+1, d[j-1][k-1] + subcost);
        }
    }

    return d[first.length][second.length];
}

document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        console.log("interactive");
        setup()
    }
}