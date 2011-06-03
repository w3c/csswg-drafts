/*******************************************************************************
 *
 *  Copyright © 2011 Hewlett-Packard Development Company, L.P. 
 *
 *  This work is distributed under the W3C® Software License [1] 
 *  in the hope that it will be useful, but WITHOUT ANY 
 *  WARRANTY; without even the implied warranty of 
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 *
 *  [1] http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231 
 *
 *  Adapted from the Mobile Test Harness
 *  Copyright © 2007 World Wide Web Consortium
 *  http://dev.w3.org/cvsweb/2007/mobile-test-harness/
 * 
 ******************************************************************************/

/**
  Data returned from server:
  
  response.testURI;
  response.resultsURI;
  response.detailsURI;
  response.rewriteURIs;
  response.clientEngineName;
  response.engines[];
  response.sections[];
  
  section.anchorName;
  section.section;
  section.testCount;
  section.engines[];

  engineInfo.title;       // human readable title
  engineInfo.name;        // string key for harness
  
  engine.index;
  engine.passCount;
  engine.failCount;

**/


var annotator = {
  // QUERY_URI:          "http://test.csswg.org/harness/status.php",
  QUERY_URI:          "/Style/CSS/Test/status",
  STYLESHEET_URI:     "style/annotate.css",
  NEED_TEST_ICON_URI: "images/please_help_32.png",

  mResponse: null,
  mClosed: false,
  
  buildURI: function(base, section) {
    if (section) {
      if (this.mResponse.rewriteURIs) {
        return base + 'section/' + section + '/';
      }
      else {
        return base + '&sec=' + section;
      }
    }
    return base;
  },
  
  removeAnnotation: function(anchorName) {
    try {
      var annotation = document.getElementById('annotation_' + ((0 < anchorName.length) ? anchorName : 'root_'));

      if (annotation) {
        annotation.parentNode.removeChild(annotation);
      }
    }
    catch (err) {
    }
  },
  
  removeAllAnnotations: function () {
    try {
      if (this.mResponse && this.mResponse.sections) {
        for (index in this.mResponse.sections) {
          this.removeAnnotation(this.mResponse.sections[index].anchorName);
        }
      }
    }
    catch (err) {
    }
  },
  
  toggleAnnotations: function() {
    this.mClosed = (! this.mClosed);
    this.removeAllAnnotations();
    this.addAnnotations();
  },
  
  addAnnotationTo: function(anchorElement, section, first) {
    try {
      var headings = {'h1':'', 'h2':'', 'h3':'', 'h4':'', 'h5':'', 'h6':'',
                      'H1':'', 'H2':'', 'H3':'', 'H4':'', 'H5':'', 'H6':''};
      var targetElement = anchorElement;
      
      while (targetElement && (Node.ELEMENT_NODE == targetElement.nodeType) && (! (targetElement.tagName in headings))) {
        targetElement = targetElement.parentNode;
      }
      if (targetElement && (Node.ELEMENT_NODE == targetElement.nodeType)) {
        var needCount = section.testCount;
        for (index in section.engines) {
          var engine = section.engines[index];
          if (this.mResponse.engines[engine.index].name == this.mResponse.clientEngineName) {
            needCount = section.testCount - (engine.passCount + engine.failCount);
            break;
          }
        }

        var annotation = document.createElement('div');
        annotation.setAttribute('id', 'annotation_' + ((0 == section.anchorName.length) ? 'root_' : section.anchorName));
        var annotationClass = 'annotation';
        if (first) {
          annotationClass += ' first';
        }
        if (0 < needCount) {
          annotationClass += ' need';
        }
        if (this.mClosed) {
          annotationClass += ' closed';
        }
        annotation.setAttribute('class', annotationClass);
        annotation.setAttribute('testCount', section.testCount);
        annotation.setAttribute('needCount', needCount);

        if (first) {
          var disclosure = document.createElement('div');
          disclosure.setAttribute('class', 'disclosureBox');
          disclosure.setAttribute('onclick', 'annotator.toggleAnnotations()');
          annotation.appendChild(disclosure);
        }
        
        var closeBox = document.createElement('div');
        closeBox.setAttribute('class', 'closeBox');
        if (first) {
          closeBox.setAttribute('onclick', 'annotator.removeAllAnnotations()');
        }
        else {
          closeBox.setAttribute('onclick', 'annotator.removeAnnotation("' + section.anchorName + '")');
        }
        annotation.appendChild(closeBox);
        
        var heading = document.createElement('div');
        heading.setAttribute('class', 'heading');
        
        var testLink = document.createElement('a');
        testLink.setAttribute('href', this.buildURI(this.mResponse.testURI, section.section));

        if (1 == section.testCount) {
          testLink.appendChild(document.createTextNode('1 Test'));
        }
        else {
          testLink.appendChild(document.createTextNode(section.testCount + ' Tests'));
        }
        if ((! this.mClosed) && (0 < needCount)) {
          var image = document.createElement('img');
          image.setAttribute('src', this.NEED_TEST_ICON_URI);
          image.setAttribute('class', 'need');
          testLink.appendChild(image);

          if (1 == needCount) {
            testLink.setAttribute('title', '1 test needs results from your client, please click here to run test');
          }
          else {
            testLink.setAttribute('title', needCount + ' tests need results from your client, please click here to run tests');
          }
          var untested = document.createElement('span');
          untested.appendChild(document.createTextNode(' ' + needCount + '\u00A0untested, please\u00A0test'));
          testLink.appendChild(untested);
        }
        heading.appendChild(testLink);
        annotation.appendChild(heading);

        if (! this.mClosed) {
          var engines = document.createElement('div');
          engines.setAttribute('class', 'engines');
          
          for (index in section.engines) {
            var engine = section.engines[index];
            var resultCount = (engine.passCount + engine.failCount);
            
            var toolTip = '';
            var engineClass = '';
            if (0 < resultCount) {
              if (engine.passCount == section.testCount) {
                toolTip = 'All tests pass';
                engineClass = 'pass';
              }
              else {
                if (engine.failCount == section.testCount) {
                  toolTip = 'All tests fail';
                  engineClass = 'fail';
                }
                else {
                  if (0 < engine.passCount) {
                    toolTip = engine.passCount + ' pass';
                  }
                  if (0 < engine.failCount) {
                    if (toolTip.length) {
                      toolTip += ', '
                    }
                    toolTip += engine.failCount + ' fail';
                  }
                  if (resultCount < section.testCount) {
                    if (toolTip.length) {
                      toolTip += ', '
                    }
                    toolTip += (section.testCount - resultCount) + ' untested';
                  }
                  if ((resultCount / section.testCount) < 0.95) {
                    engineClass = 'untested';
                  }
                  else {
                    engineClass = 'p' + Math.round((engine.passCount / section.testCount) * 10.0) + '0';
                  }
                }
              }
            }
            else {
              toolTip = 'No data';
            }
            
            if (0 < resultCount) {
              var engineNode = document.createElement('span');
              engineNode.setAttribute('title', toolTip);
              if (this.mResponse.engines[engine.index].name == this.mResponse.clientEngineName) {
                engineClass += ' active';
              }
              engineNode.setAttribute('class', this.mResponse.engines[engine.index].name + ' ' + engineClass);
              engineNode.setAttribute('passCount', engine.passCount);
              engineNode.setAttribute('failCount', engine.failCount);
              engineNode.setAttribute('needCount', section.testCount - resultCount);

              if (0 < resultCount) {
                var detailsLink = document.createElement('a');
                detailsLink.setAttribute('href', this.buildURI(this.mResponse.resultsURI, section.section));
                
                detailsLink.appendChild(document.createTextNode(this.mResponse.engines[engine.index].title));
                engineNode.appendChild(detailsLink);
              }
              else {
                engineNode.appendChild(document.createTextNode(this.mResponse.engines[engine.index].title));
              }
              
              engines.appendChild(engineNode);
              engines.appendChild(document.createTextNode(' '));
            }
          }
          annotation.appendChild(engines);
        }
        
        targetElement.insertBefore(annotation, targetElement.firstChild);
        return true;
      }
    }
    catch (err) {
//      document.body.innerHTML = 'EXCEPTION: ' + err.toString(); // DEBUG
    }
    return false;
  },
  
  addAnnotation: function(section, first) {
    try {
      var anchorName = section.anchorName;

      if (anchorName) { // find element that has anchor name or id
        var found = false;

        anchor = document.getElementById(anchorName);
        if (! (anchor && this.addAnnotationTo(anchor, section, first))) {
          var anchors = document.getElementsByName(anchorName);
          
          for (index in anchors) {
            var anchor = anchors[index];
            if (this.addAnnotationTo(anchor, section, first)) {
              break;
            }
          }
        }
      }
      else if (first) {  // find first h1
        var headings = document.getElementsByTagName('h1');
        
        if (headings && (0 < headings.length)) {
          this.addAnnotationTo(headings[0], section, first);
        }
      }
    }
    catch (err) {
    }
  },
  
  addAnnotations: function () {
    try {
      if (this.mResponse && this.mResponse.sections) {
        if (0 < this.mResponse.sections.length) {
          if (this.mClosed) {
            this.addAnnotation(this.mResponse.sections[0], true);
          }
          else {
            var first = true;
            for (index in this.mResponse.sections) {
              this.addAnnotation(this.mResponse.sections[index], first);
              first = false;
            }
          }
        }
      }
    }
    catch (err) {
    }
  },
  
  processResponse: function(contentType, responseText) {
    try {
      if (-1 < contentType.indexOf('application/json')) {
        var response = JSON.parse(responseText);
        
        if (response) {
          this.mResponse = response;
          this.addAnnotations();
        }
      }
    }
    catch (err) {
    }
  },
  
  annotate: function() {
    try {
      var testSuiteName = '';
      
      var scripts = document.getElementsByTagName('script');
      for (index in scripts) {
        if (scripts[index].hasAttribute('src')) {
          var scriptSource = scripts[index].getAttribute('src');
          if (-1 < scriptSource.indexOf('/annotate.js#')) {
            testSuiteName = scriptSource.substr(scriptSource.indexOf('#') + 1);
            if ('!' == testSuiteName[0]) {
              testSuiteName = testSuiteName.substr(1);
              this.mClosed = true;
            }
            break;
          }
        }
      }
      
      if (0 < testSuiteName.length) {
        var styleSheet = document.createElement('link');
        styleSheet.setAttribute('rel', 'stylesheet');
        styleSheet.setAttribute('type', 'text/css');
        styleSheet.setAttribute('href', this.STYLESHEET_URI);
        document.getElementsByTagName('head')[0].appendChild(styleSheet)

        var statusURI = this.QUERY_URI + '?s=' + encodeURIComponent(testSuiteName) + '&x=' + encodeURIComponent(document.URL);
        
        if (window.XDomainRequest) {  // The IE way...
          var xdr = new XDomainRequest();
          if (xdr) {
            xdr.onload = function () {
              annotator.processResponse(xdr.contentType, xdr.responseText);
            }
            xdr.open('GET', statusURI);
            xdr.send();
          }
        }
        else {  // The standard way
          var xhr = new XMLHttpRequest();
          
          xhr.onreadystatechange = function() {
            if (4 == xhr.readyState) {
              if (200 == xhr.status) {
                annotator.processResponse(xhr.getResponseHeader('Content-Type'), xhr.responseText);
              }
              else if (500 == xhr.status) {
//                document.documentElement.innerHTML = xhr.responseText;  // DEBUG
              }
              else {
//                document.body.innerHTML = 'error: ' + xhr.status + xhr.responseText; // DEBUG
              }
            }
          };
          
          xhr.open('GET', statusURI, true);
          xhr.setRequestHeader('Accept', 'application/json,text/html');
          xhr.send();
        }
      }
    }
    catch (err) {
//      document.body.innerHTML = 'EXCEPTION: ' + err.toString(); // DEBUG
    }
  },
  
  addLoadEvent: function() {
    try {
      var oldOnLoad = window.onload;
      if (typeof window.onload != 'function') {
        window.onload = this.annotate();
      }
      else {
        window.onload = function () {
          if (oldOnLoad) {
            oldOnLoad();
          }
          annotator.annotate();
        }
      }
    }
    catch (err) {
    }
  }
}


annotator.addLoadEvent();

