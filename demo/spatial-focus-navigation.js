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
  9 : "tab",
  37 : "left-arrow",
  38 : "up-arrow",
  39 : "right-arrow",
  40 : "down-arrow"
};

var flag = "Direction";

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
  if(direction == 37) {
    getLeftElement();
  } else if(direction == 38) {
    getUpElement();
  } else if(direction == 39) {
    getRightElement();
  } else if(direction == 40) {
    getDownElement()
  }
}

function getUpElement(){
  console.log("Up");
  candidateElements = new Array();
  //if Nearest Element
  if (flag == "Nearest"){

  } else if (flag == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height < focusedElement.position.y){
        if ((getPosition(allElements[i]).x >= focusedElement.position.x) &&
            (getPosition(allElements[i]).x < focusedElement.position.x + focusedElement.size.width)){

              var box = {
                id: null,
                edgeX: null,
                edgeY: null
              };

              box.id = allElements[i].id;
              box.edgeX = getPosition(allElements[i]).x;
              box.edgeY = getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height;

              candidateElements.push(box);
        }
      }
    }

    if(candidateElements) {
      candidateElements.sort(function(a, b) { // sorting with y position in decreasing order
        return a.edgeY > b.edgeY ? -1 : a.edgeY < b.edgeY ? 1 : 0;
      });

      for (var i = candidateElements.length-1; i > 0; i--){
        if (candidateElements[0].edgeY > candidateElements[i].edgeY)
          candidateElements.pop();
      }
    }
    if(candidateElements) {
      console.log("candidate: "+candidateElements.length+ ", first: "+candidateElements[0].id);

      candidateElements.sort(function(a, b) { // sorting with x position in increasing order
        return a.edgeX < a.edgeX ? -1 : a.edgeX > a.edgeX ? 1 : 0;
      });

      targetElement = document.getElementById(candidateElements[0].id);
    }

  } else if (flag == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height < focusedElement.position.y){
        var box = {
          id: null,
          edgeX: null,
          edgeY: null
        };

        box.id = allElements[i].id;
        box.edgeX = getPosition(allElements[i]).x;
        box.edgeY = getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height;

        candidateElements.push(box);
      }
    }

    if(candidateElements){
      candidateElements.sort(function(a, b) { // sorting with y position in decreasing order
        return a.edgeY > b.edgeY ? -1 : a.edgeY < b.edgeY ? 1 : 0;
      });

      for (var i = candidateElements.length-1; i > 0; i--){
        if (candidateElements[0].edgeY > candidateElements[i].edgeY)
          candidateElements.pop();
      }
    }

    if(candidateElements){
      console.log("candidate: "+candidateElements.length+ ", first: "+candidateElements[0].id);

      candidateElements.sort(function(a, b) { // sorting with x position in increasing order
        return a.edgeX < a.edgeX ? -1 : a.edgeX > a.edgeX ? 1 : 0;
      });

      targetElement = document.getElementById(candidateElements[0].id);
    }
  }

  if(targetElement)
    console.log("Target Element: "+targetElement.id);
}

function getDownElement(){
  console.log("Down");
  candidateElements = new Array();
  //if Nearest Element
  if (flag == "Nearest"){

  } else if (flag == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y > focusedElement.position.y + focusedElement.size.height){
        if ((getPosition(allElements[i]).x >= focusedElement.position.x) &&
            (getPosition(allElements[i]).x < focusedElement.position.x + focusedElement.size.width)){
          candidateElements.push(allElements[i]);
        }
      }
    }

    if (candidateElements){
      candidateElements.sort(function(a, b) { // sorting with y position in increasing order
        return getPosition(a).y < getPosition(b).y ? -1 : getPosition(a).y > getPosition(b).y ? 1 : 0;
      });

      for (var i = candidateElements.length-1; i > 0; i--){
        if (getPosition(candidateElements[0]).y < getPosition(candidateElements[i]).y)
          candidateElements.pop();
      }
    }

    if (candidateElements){
      console.log("candidate: "+candidateElements.length+ ", first: "+candidateElements[0].id);

      candidateElements.sort(function(a, b) { // sorting with y position in increasing order
        return getPosition(a).x < getPosition(b).x ? -1 : getPosition(a).x > getPosition(b).x ? 1 : 0;
      });

      targetElement = candidateElements[0];
    }

  } else if (flag == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y > focusedElement.position.y + focusedElement.size.height)
        candidateElements.push(allElements[i]);
    }

    if (candidateElements){
      candidateElements.sort(function(a, b) { // sorting with y position in increasing order
        return getPosition(a).y < getPosition(b).y ? -1 : getPosition(a).y > getPosition(b).y ? 1 : 0;
      });

      for (var i = candidateElements.length-1; i > 0; i--){
        if (getPosition(candidateElements[0]).y < getPosition(candidateElements[i]).y)
          candidateElements.pop();
      }
    }

    if (candidateElements){
      console.log("candidate: "+candidateElements.length+ ", first: "+candidateElements[0].id);

      candidateElements.sort(function(a, b) { // sorting with y position in increasing order
        return getPosition(a).x < getPosition(b).x ? -1 : getPosition(a).x > getPosition(b).x ? 1 : 0;
      });

      targetElement = candidateElements[0];
    }
  }

  if(targetElement)
    console.log("Target Element: "+targetElement.id);
}

function getLeftElement(){
  console.log("Left");
  candidateElements = new Array();

  //if Nearest Element
  if (flag == "Nearest"){

  } else if (flag == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width < focusedElement.position.x){
        if ((getPosition(allElements[i]).y >= focusedElement.position.y) &&
            (getPosition(allElements[i]).y < focusedElement.position.y + focusedElement.size.height)){
          candidateElements.push(allElements[i]);
        }
      }
    }

    if(candidateElements) {
      candidateElements.sort(function(a, b) { // sorting with x position in decreasing order
        return getPosition(a).x > getPosition(b).x ? -1 : getPosition(a).x < getPosition(b).x ? 1 : 0;
      });

      for (var i = candidateElements.length-1; i > 0; i--){
        if (getPosition(candidateElements[0]).x > getPosition(candidateElements[i]).x)
          candidateElements.pop();
      }
    }
    if(candidateElements) {
      console.log("candidate: "+candidateElements.length+ ", first: "+candidateElements[0].id);

      candidateElements.sort(function(a, b) { // sorting with y position in increasing order
        return getPosition(a).y < getPosition(b).y ? -1 : getPosition(a).y > getPosition(b).y ? 1 : 0;
      });

      targetElement = candidateElements[0];
    }

  } else if (flag == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width < focusedElement.position.x)
        candidateElements.push(allElements[i]);
    }

    if(candidateElements){
      candidateElements.sort(function(a, b) { // sorting with x position in decreasing order
        return getPosition(a).x > getPosition(b).x ? -1 : getPosition(a).x < getPosition(b).x ? 1 : 0;
      });

      for (var i = candidateElements.length-1; i > 0; i--){
        if (getPosition(candidateElements[0]).x > getPosition(candidateElements[i]).x)
          candidateElements.pop();
      }
    }

    if(candidateElements){
      console.log("candidate: "+candidateElements.length+ ", first: "+candidateElements[0].id);

      candidateElements.sort(function(a, b) { // sorting with y position in increasing order
        return getPosition(a).y < getPosition(b).y ? -1 : getPosition(a).y > getPosition(b).y ? 1 : 0;
      });

      targetElement = candidateElements[0];
    }
  }

  if(targetElement)
    console.log("Target Element: "+targetElement.id);
}

function getRightElement(){
  console.log("Right");
  candidateElements = new Array();

  //if Nearest Element
  if (flag == "Nearest"){

  } else if (flag == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x > focusedElement.position.x + focusedElement.size.width){
        if ((getPosition(allElements[i]).y >= focusedElement.position.y) &&
            (getPosition(allElements[i]).y < focusedElement.position.y + focusedElement.size.height)){
          candidateElements.push(allElements[i]);
        }
      }
    }

    if (candidateElements){
      candidateElements.sort(function(a, b) { // sorting with x position in increasing order
        return getPosition(a).x < getPosition(b).x ? -1 : getPosition(a).x > getPosition(b).x ? 1 : 0;
      });

      for (var i = candidateElements.length-1; i > 0; i--){
        if (getPosition(candidateElements[0]).x < getPosition(candidateElements[i]).x)
          candidateElements.pop();
      }
    }

    if (candidateElements){
      console.log("candidate: "+candidateElements.length+ ", first: "+candidateElements[0].id);

      candidateElements.sort(function(a, b) { // sorting with y position in increasing order
        return getPosition(a).y < getPosition(b).y ? -1 : getPosition(a).y > getPosition(b).y ? 1 : 0;
      });

      targetElement = candidateElements[0];
    }

  } else if (flag == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x > focusedElement.position.x + focusedElement.size.width)
        candidateElements.push(allElements[i]);
    }

    if (candidateElements){
      candidateElements.sort(function(a, b) { // sorting with x position in increasing order
        return getPosition(a).x < getPosition(b).x ? -1 : getPosition(a).x > getPosition(b).x ? 1 : 0;
      });

      for (var i = candidateElements.length-1; i > 0; i--){
        if (getPosition(candidateElements[0]).x < getPosition(candidateElements[i]).x)
          candidateElements.pop();
      }
    }

    if (candidateElements){
      console.log("candidate: "+candidateElements.length+ ", first: "+candidateElements[0].id);

      candidateElements.sort(function(a, b) { // sorting with y position in increasing order
        return getPosition(a).y < getPosition(b).y ? -1 : getPosition(a).y > getPosition(b).y ? 1 : 0;
      });

      targetElement = candidateElements[0];
    }
  }

  if(targetElement)
    console.log("Target Element: "+targetElement.id);
}

function getPressedKey(){

  document.querySelector('body').onkeydown = function (e) {
    if ( !e.metaKey ) {
      e.preventDefault();
    }

    getFocusedElement();

    pressedKey = e.keyCode;
    getNextFocusableElement(e.keyCode);

    if(targetElement)
      targetElement.focus();
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
