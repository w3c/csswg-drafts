var focusedElement = {
  box: null,
  position: null,
  size: null
};

var pressedKey = false;
var targetElement;
var allElements;
var candidateElements;

var keyCodes = {
  left: 37,
  up: 38,
  right: 39,
  down: 40
};

var flag = "Projection";

//var day = {"sun", "mon", "tue", "wed", "thu", "fri", "sat"};

function getPosition(el) {
  var xPos = 0;
  var yPos = 0;

  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}

function getNextFocusableElement(direction){
  if(direction == keyCodes.left) {
    getLeftElement();
  } else if(direction == keyCodes.up) {
    getUpElement();
  } else if(direction == keyCodes.right) {
    getRightElement();
  } else if(direction == keyCodes.down) {
    getDownElement();
  }
}

function getFirstCandidates(direction, index, candidateList){
  var box = {
    id: null,
    edgeX: null,
    edgeY: null
  };

  if (direction == keyCodes.up) {
    box.id = allElements[index].id;

    //get the bottom edge for measuring distance
    box.edgeX = getPosition(allElements[index]).x;
    box.edgeY = getPosition(allElements[index]).y + allElements[index].getBoundingClientRect().height;

    candidateList.push(box);
  }
  else if(direction == keyCodes.down){
    box.id = allElements[index].id;

    //get the upper edge for measuring distance
    box.edgeX = getPosition(allElements[index]).x;
    box.edgeY = getPosition(allElements[index]).y;

    candidateElements.push(box);
  }
  else if(direction == keyCodes.left){
    box.id = allElements[index].id;

    //get the right edge for measuring distance
    box.edgeX = getPosition(allElements[index]).x + allElements[index].getBoundingClientRect().width;
    box.edgeY = getPosition(allElements[index]).y;

    candidateList.push(box);
  }
  else if(direction == keyCodes.right){
    box.id = allElements[index].id;

    //get the left edge for measuring distance
    box.edgeX = getPosition(allElements[index]).x;
    box.edgeY = getPosition(allElements[index]).y;

    candidateList.push(box);
  }
}

function getFinalCandidate(direction, candidateList){
  if (candidateList.length == 0) //No focusable elements
    return;

  if (direction == keyCodes.up) {
    candidateList.sort(function(a, b) { // sorting with y position in decreasing order
      return a.edgeY > b.edgeY ? -1 : a.edgeY < b.edgeY ? 1 : 0;
    });

    for (var i = candidateList.length-1; i > 0; i--){
      if (candidateList[0].edgeY > candidateList[i].edgeY)
        candidateList.pop();
    }

    if (candidateList.length == 0){
      return;

    } else {
      console.log("candidate: "+candidateList.length+ ", first: "+candidateList[0].id);

      candidateList.sort(function(a, b) { // sorting with x position in increasing order
        return a.edgeX < b.edgeX ? -1 : a.edgeX > b.edgeX ? 1 : 0;
      });

      targetElement = document.getElementById(candidateList[0].id);
    }
  }
  else if(direction == keyCodes.down){
    candidateList.sort(function(a, b) { // sorting with y position in increasing order
      return a.edgeY < b.edgeY ? -1 : a.edgeY > b.edgeY ? 1 : 0;
    });

    for (var i = candidateList.length-1; i > 0; i--){
      if (candidateList[0].edgeY < candidateList[i].edgeY)
        candidateList.pop();
    }

    if (candidateList.length == 0){
      return;

    } else {
      console.log("candidate: "+candidateList.length + ", first: "+candidateList[0].id);

      candidateList.sort(function(a, b) { // sorting with y position in increasing order
        return a.edgeX < b.edgeX ? -1 : a.edgeX > b.edgeX ? 1 : 0;
      });

      targetElement = document.getElementById(candidateList[0].id);
    }
  }
  else if(direction == keyCodes.left){
    candidateList.sort(function(a, b) { // sorting with x position in decreasing order
      return a.edgeX > b.edgeX ? -1 : a.edgeX < b.edgeX ? 1 : 0;
    });

    for (var i = candidateList.length-1; i > 0; i--){
      if (candidateList[0].edgeX > candidateList[i].edgeX)
        candidateList.pop();
    }

    if (candidateList.length == 0){
      return;

    } else {
      console.log("candidate: "+candidateList.length+ ", first: "+candidateList[0].id);

      candidateList.sort(function(a, b) { // sorting with y position in increasing order
        return a.edgeY < b.edgeY ? -1 : a.edgeY > b.edgeY ? 1 : 0;
      });

      targetElement = document.getElementById(candidateList[0].id);
    }
  }
  else if(direction == keyCodes.right){
    candidateList.sort(function(a, b) { // sorting with x position in increasing order
      return a.edgeX < b.edgeX ? -1 : a.edgeX > b.edgeX ? 1 : 0;
    });

    for (var i = candidateList.length-1; i > 0; i--){
      if (candidateList[0].edgeX < candidateList[i].edgeX)
        candidateList.pop();
    }

    if (candidateList.length == 0){
      return;

    } else {
      console.log("candidate: "+candidateList.length+ ", first: "+candidateList[0].id);

      candidateList.sort(function(a, b) { // sorting with y position in increasing order
        return a.edgeY < b.edgeY ? -1 : a.edgeY > b.edgeY ? 1 : 0;
      });

      targetElement = document.getElementById(candidateList[0].id);
    }
  }

  if(targetElement){
    console.log("Target Element: "+targetElement.id);
  }
  else
    console.log("No focusable elements!");
}

function getUpElement(){
  console.log("Up");
  candidateElements = new Array();
  //if Nearest Element
  if (flag == "Nearest"){

  } else if (flag == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height < focusedElement.position.y){
        if ((getPosition(allElements[i]).x <= focusedElement.position.x + focusedElement.size.width) &&
              (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width >= focusedElement.position.x)){
              getFirstCandidates(keyCodes.up, i, candidateElements);
        }
      }
    }

    getFinalCandidate(keyCodes.up, candidateElements);

  } else if (flag == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height < focusedElement.position.y){
        getFirstCandidates(keyCodes.up, i, candidateElements);
      }
    }

    getFinalCandidate(keyCodes.up, candidateElements);
  }
}

function getDownElement(){
  console.log("Down");
  candidateElements = new Array();
  //if Nearest Element
  if (flag == "Nearest"){

  } else if (flag == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y > focusedElement.position.y + focusedElement.size.height){
        if ((getPosition(allElements[i]).x <= focusedElement.position.x + focusedElement.size.width) &&
              (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width >= focusedElement.position.x)){
          getFirstCandidates(keyCodes.down, i, candidateElements);
        }
      }
    }

    getFinalCandidate(keyCodes.down, candidateElements);

  } else if (flag == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y > focusedElement.position.y + focusedElement.size.height)
        getFirstCandidates(keyCodes.down, i, candidateElements);
    }

    getFinalCandidate(keyCodes.down, candidateElements);
  }
}

function getLeftElement(){
  console.log("Left");
  candidateElements = new Array();

  //if Nearest Element
  if (flag == "Nearest"){

  } else if (flag == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width < focusedElement.position.x){
        if ((getPosition(allElements[i]).y <= focusedElement.position.y + focusedElement.size.height) &&
              (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height >= focusedElement.position.y)){
          getFirstCandidates(keyCodes.up, i, candidateElements);
        }
      }
    }

    getFinalCandidate(keyCodes.left, candidateElements);

  } else if (flag == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width < focusedElement.position.x)
        getFirstCandidates(keyCodes.up, i, candidateElements);
    }

    getFinalCandidate(keyCodes.left, candidateElements);
  }
}

function getRightElement(){
  console.log("Right");
  candidateElements = new Array();

  //if Nearest Element
  if (flag == "Nearest"){

  } else if (flag == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x > focusedElement.position.x + focusedElement.size.width){
        if ((getPosition(allElements[i]).y <= focusedElement.position.y + focusedElement.size.height) &&
              (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height >= focusedElement.position.y)){
          getFirstCandidates(keyCodes.right, i, candidateElements);
        }
      }
    }

    getFinalCandidate(keyCodes.right, candidateElements);

  } else if (flag == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x > focusedElement.position.x + focusedElement.size.width)
        getFirstCandidates(keyCodes.right, i, candidateElements);
    }

    getFinalCandidate(keyCodes.right, candidateElements);
  }
}

function getPressedKey(){

  document.querySelector('body').onkeydown = function (e) {
    if ( !e.metaKey ) {
      e.preventDefault();
    }

    getFocusedElement();

    pressedKey = e.keyCode;
    getNextFocusableElement(e.keyCode);

    if(targetElement){
      targetElement.focus();
    }
  };
}

function getFocusedElement(){
  focusedElement.box = document.activeElement;
  focusedElement.position = getPosition(focusedElement.box);

  console.log("x: "+focusedElement.position.x + ", y: "+focusedElement.position.y);

  focusedElement.size = focusedElement.box.getBoundingClientRect();

  console.log("width: "+focusedElement.size.width + ", height: "+focusedElement.size.height);
}

function init() {
  allElements = document.querySelectorAll('.schedule');

  console.log("Num of all items: "+ allElements.length);

  getPressedKey();
}

window.onload = init;
