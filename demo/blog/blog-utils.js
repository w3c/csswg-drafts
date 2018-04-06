/* JS Lib for Blog Demo
*
* Copyright 2018 LG Electronics Inc. All rights reserved.
*
*/
window.addEventListener("load", function() {
  // load SpatNav polyfill
  focusNavigationHeuristics();
});

function swapTabContents(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablink;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";

  }

  // Get all elements with class="tablink" and remove the class "active"
  tablink = document.getElementsByClassName("tablink");
  for (i = 0; i < tablink.length; i++) {
    tablink[i].children[0].style.fontWeight = "";
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
}
