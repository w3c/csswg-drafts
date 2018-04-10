var focusedElement = {
  box: null,
  position: null,
  centerX: null,
  centerY: null,
  size: null
};

var targetElement;
var allElements;
var candidateElements;

var keyCodes = {
  left: 37,
  up: 38,
  right: 39,
  down: 40
};

var navRule;
var navloop;

function getOption() {
  navRule = document.getElementById('ruleType').options[document.getElementById('ruleType').selectedIndex].value;
  console.log('Default Navigation Rule: '+ navRule);

  navloop = document.getElementById('loopType').checked;
  console.log('Default Navigation Loop: '+ navloop);

  document.getElementById('ruleType').addEventListener('change', function(){
  	navRule = this.options[this.selectedIndex].value;

    console.log('Navigation Rule: '+ navRule);
  });

  document.getElementById('loopType').addEventListener('change', function(){
    navloop = this.checked;

    console.log('Navigation Loop: '+ navloop);
  });
}

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
    edgeY: null,
    distance: null,
    centerX: null,
    centerY: null
  };

  box.id = allElements[index].id;
  box.centerX = getPosition(allElements[index]).x + allElements[index].getBoundingClientRect().width/2;
  box.centerY = getPosition(allElements[index]).y + allElements[index].getBoundingClientRect().height/2;

  if (direction == keyCodes.up) {
    //get the bottom edge for measuring distance
    box.edgeX = getPosition(allElements[index]).x;
    box.edgeY = getPosition(allElements[index]).y + allElements[index].getBoundingClientRect().height;
  }
  else if(direction == keyCodes.down){
    //get the upper edge for measuring distance
    box.edgeX = getPosition(allElements[index]).x;
    box.edgeY = getPosition(allElements[index]).y;
  }
  else if(direction == keyCodes.left){
    //get the right edge for measuring distance
    box.edgeX = getPosition(allElements[index]).x + allElements[index].getBoundingClientRect().width;
    box.edgeY = getPosition(allElements[index]).y;
  }
  else if(direction == keyCodes.right){
    //get the left edge for measuring distance
    box.edgeX = getPosition(allElements[index]).x;
    box.edgeY = getPosition(allElements[index]).y;
  }

  candidateList.push(box);
}

function getNearestCandidate(candidateList){
  if (candidateList.length == 0) //No focusable elements
    return;

  for (var i = 0; i < candidateList.length; i++){
    candidateList[i].distance = Math.sqrt(Math.pow(Math.abs(candidateList[i].centerX-focusedElement.centerX),2)
                                          + Math.pow(Math.abs(candidateList[i].centerY-focusedElement.centerY),2));
  }

  candidateList.sort(function(a, b) { // sorting with distance in increasing order
    return a.distance < b.distance ? -1 : a.distance > b.distance ? 1 : 0;
  });

  for (var i = candidateList.length-1; i > 0; i--){
    if (candidateList[0].distance < candidateList[i].distance)
      candidateList.pop();
  }

  candidateList.sort(function(a, b) { // sorting with y position in increasing order
    return a.edgeY < b.edgeY ? -1 : a.edgeY > b.edgeY ? 1 : 0;
  });

  candidateList.sort(function(a, b) { // sorting with x position in increasing order
    return a.edgeX < b.edgeX ? -1 : a.edgeX > b.edgeX ? 1 : 0;
  });

  targetElement = document.getElementById(candidateList[0].id);

  if(targetElement){
    console.log("Target Element: "+targetElement.id);
  }
  else
    console.log("No focusable elements!");
}

function getFinalCandidate(direction, candidateList){
  if (candidateList.length == 0) { //No focusable elements
    if(navloop)
      getLoopedElement(direction);
    else
      return;
  }

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
      candidateList.sort(function(a, b) { // sorting with y position in increasing order
        return a.edgeY < b.edgeY ? -1 : a.edgeY > b.edgeY ? 1 : 0;
      });

      targetElement = document.getElementById(candidateList[0].id);
    }
  }

  if(targetElement){
    console.log("Current Element: "+focusedElement.box.id);
    console.log("Target Element: "+targetElement.id);
  }
  else
    console.log("No focusable elements!");
}

function getUpElement(){
  console.log("Up");
  candidateElements = new Array();
  //if Nearest Element
  if (navRule == "Nearest"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height < focusedElement.position.y){
        getFirstCandidates(keyCodes.up, i, candidateElements);
      }
    }
    getNearestCandidate(candidateElements);

  } else if (navRule == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height < focusedElement.position.y){
        if ((getPosition(allElements[i]).x <= focusedElement.position.x + focusedElement.size.width) &&
              (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width >= focusedElement.position.x)){
              getFirstCandidates(keyCodes.up, i, candidateElements);
        }
      }
    }

    getFinalCandidate(keyCodes.up, candidateElements);

  } else if (navRule == "Direction"){
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
  if (navRule == "Nearest"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y > focusedElement.position.y + focusedElement.size.height)
        getFirstCandidates(keyCodes.down, i, candidateElements);
    }
    getNearestCandidate(candidateElements);

  } else if (navRule == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).y > focusedElement.position.y + focusedElement.size.height){
        if ((getPosition(allElements[i]).x <= focusedElement.position.x + focusedElement.size.width) &&
              (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width >= focusedElement.position.x)){
          getFirstCandidates(keyCodes.down, i, candidateElements);
        }
      }
    }

    getFinalCandidate(keyCodes.down, candidateElements);

  } else if (navRule == "Direction"){
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
  if (navRule == "Nearest"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width < focusedElement.position.x)
        getFirstCandidates(keyCodes.up, i, candidateElements);
    }
    getNearestCandidate(candidateElements);

  } else if (navRule == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x + allElements[i].getBoundingClientRect().width < focusedElement.position.x){
        if ((getPosition(allElements[i]).y <= focusedElement.position.y + focusedElement.size.height) &&
              (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height >= focusedElement.position.y)){
          getFirstCandidates(keyCodes.up, i, candidateElements);
        }
      }
    }

    getFinalCandidate(keyCodes.left, candidateElements);

  } else if (navRule == "Direction"){
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
  if (navRule == "Nearest"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x > focusedElement.position.x + focusedElement.size.width)
        getFirstCandidates(keyCodes.right, i, candidateElements);
    }
    getNearestCandidate(candidateElements);

  } else if (navRule == "Projection"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x > focusedElement.position.x + focusedElement.size.width){
        if ((getPosition(allElements[i]).y <= focusedElement.position.y + focusedElement.size.height) &&
              (getPosition(allElements[i]).y + allElements[i].getBoundingClientRect().height >= focusedElement.position.y)){
          getFirstCandidates(keyCodes.right, i, candidateElements);
        }
      }
    }

    getFinalCandidate(keyCodes.right, candidateElements);

  } else if (navRule == "Direction"){
    for (var i = 0; i < allElements.length; i++){
      if (getPosition(allElements[i]).x > focusedElement.position.x + focusedElement.size.width)
        getFirstCandidates(keyCodes.right, i, candidateElements);
    }

    getFinalCandidate(keyCodes.right, candidateElements);
  }
}

function getLoopedElement(direction){
  candidateElements = new Array();

  if (direction == keyCodes.down || direction == keyCodes.up){
    for (var i = 0; i < allElements.length-1; i++){
      if ((focusedElement.position.x == getPosition(allElements[i]).x) &&
            (focusedElement.box.id != allElements[i].id))
        candidateElements.push(allElements[i]);
    }

    candidateElements.sort(function(a, b) { // sorting with y position in increasing order
      return getPosition(a).y < getPosition(b).y ? -1 : getPosition(a).y > getPosition(b).y ? 1 : 0;
    });

    if (direction == keyCodes.down)
      targetElement = candidateElements[0];
    else if (direction == keyCodes.up)
      targetElement = candidateElements[candidateElements.length-1];
  }
  else if (direction == keyCodes.left || direction == keyCodes.right){
    for (var i = 0; i < allElements.length-1; i++){
      if ((focusedElement.position.y == getPosition(allElements[i]).y) &&
            (focusedElement.box.id != allElements[i].id))
        candidateElements.push(allElements[i]);
    }

    candidateElements.sort(function(a, b) { // sorting with x position in increasing order
      return getPosition(a).x < getPosition(b).x ? -1 : getPosition(a).x > getPosition(b).x ? 1 : 0;
    });

    if (direction == keyCodes.right)
      targetElement = candidateElements[0];
    else if (direction == keyCodes.left)
      targetElement = candidateElements[candidateElements.length-1];
  }

  console.log("Target Element: "+targetElement.id);
}

function getPressedKey(){

  document.querySelector('body').onkeydown = function (e) {
    if ( !e.metaKey ) {
      e.preventDefault();
    }

    getFocusedElement();
    getNextFocusableElement(e.keyCode);

    if(targetElement){
      targetElement.focus();
    }
  };
}

function getFocusedElement(){
  focusedElement.box = document.activeElement;
  focusedElement.position = getPosition(focusedElement.box);

  focusedElement.size = focusedElement.box.getBoundingClientRect();
  focusedElement.centerX = focusedElement.position.x + focusedElement.size.width/2;
  focusedElement.centerY = focusedElement.position.y + focusedElement.size.height/2;
}

function setInitialFocus(){
  var initialFocusCandidates = Array.from(allElements);

  // select most upper element
  initialFocusCandidates.sort(function(a, b) {
    return getPosition(a).y < getPosition(b).y ? -1 : getPosition(a).y > getPosition(b).y ? 1 : 0;
  });

  for (var i= initialFocusCandidates.length-1; i > 0; i--){
    if (getPosition(initialFocusCandidates[i]).y > getPosition(initialFocusCandidates[0]).y)
      initialFocusCandidates.pop();
  }

  if (initialFocusCandidates.length == 0){
    return;
  }
  else {
    //select most left side element
    initialFocusCandidates.sort(function(a, b) {
      return getPosition(a).x < getPosition(b).x ? -1 : getPosition(a).x > getPosition(b).x ? 1 : 0;
    });

    initialFocusCandidates[0].focus();
    console.log("Initial focused element = id: " + initialFocusCandidates[0].id +
                ", x: "+getPosition(initialFocusCandidates[0]).x +
                ", y: "+getPosition(initialFocusCandidates[0]).y);
  }
}

function init() {
  allElements = document.querySelectorAll('.schedule');
  setInitialFocus();

  getPressedKey();
  getOption();
}

window.onload = init;
