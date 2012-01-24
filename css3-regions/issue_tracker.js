(function(){ 
    
    // Singleton used to generate unique, incremental tokens
    var TokenManager = (function(){
       
       var index = 0;

       return {
           getToken: function(prefix){                     
               index++;
               return (prefix)? prefix + index : index;
           }
       }
    })();
    
    
    // Templating engine
    var TemplateManager = (function(){ 
        
        /*                  
            Convert an HTML string into a valid node structure.
             
            @param {String} string The string HTML to be converted to nodes
            @return {DocumentFragment} a DocumentFragment with the node structure
       */
        var _convertStringToNode = function(string){
            // make a temporary container
            var temp = document.createElement("div");

            // let the parser turn the template into a valid node structure
            temp.innerHTML = string; 

            // create document fragment as payload container
            var fragment = document.createDocumentFragment();

            while(temp.firstChild){   

                // extract nodes from the temp container into the payload container
                fragment.appendChild(temp.firstChild)
            }  
        
            return fragment;       
        }  

        var _createTemplateFn = function(replaceVars, template){
       
            return function(data){  
                
                if (replaceVars.length && data !== null){
                    var templateClone = template; 
                    
                    for (var i = 0, len = replaceVars.length; i < len; i++){   

                        // extract just the variable name, without template markers
                        var key = replaceVars[i].replace("{{","").replace("}}","");

                        // do we have a value for this template variable?
                        if (data[key]){                          

                            // global regex pattern based on template variable 
                            var pattern =  new RegExp(replaceVars[i], "g"); 

                            // replace template variable with real data
                            templateClone = templateClone.replace(pattern, data[key]);  
                        }
                    }
                }    
            
                // return a nicely wrapped node structure to be appended to the document
                return _convertStringToNode(templateClone)
            }  
        }
    
    
        return { 
            
            /*  
                Create a template function from a string of HTML markup
                Extract template variables for quick reuse.
                
                @param {String} template A string of HTML with template variables marked as {{variable-name}}
                @return {Function} A function that expects a data object to populate the template
            */
            compile: function(template){  
        
                if (typeof template !== "string"){
                      throw new TypeError("Invalid templateString type. Expected 'String', got " + typeof templateString)
                }       
            
                // look for all the varialbes to be replaced. they look like {{varName}}
                var replaceVars = template.match(/{{[\w_-]*}}/g);  
            
                return _createTemplateFn(replaceVars, template) 
            }
        }  
    })(); 
    
    /*
        Attach a LINK element with a stylesheet to the current document
        
        @param {String} href The location of the stylesheet
        @return {Undefined}
    */
    var addStylesheet = function(href){
        var el =  document.createElement("link");
        el.rel = "stylesheet";
        el.type = "text/css";
        el.href = href;   
        
        document.head.appendChild(el);
    } 
    
    /*                                   
        Convert an object into an array. 
        Useful for treating NodeList or ClassList as arrays 
        
        @param {Object} list 
        @return {Array}
    */
    var arrayify = function(list){
        return [].slice.call(list);
    };
    
    var getXMLAsObject = function(url, callbackFn){

        // create a script element as a payload container for the YQL response
        var script = document.createElement("script"),
        
            // URL to YQL service used for cross-domain requests 
            // see http://developer.yahoo.com/yql/guide/
            baseURL = "http://query.yahooapis.com/v1/public/yql",
            
            // get an unique token for the script element (used to identify the callback and cleanup)
            temp = TokenManager.getToken("issue_tracker_"); 
            
        // create a public wrapper for the callback function because we are working in a private scope    
        window[temp] = function(fn){
           return function(response){               
               
               // run the callback within the private scope
               fn.call(this, response); 
                                             
               // cleanup
               var el = document.getElementById(temp);
               el.parentNode.removeChild(el);
               
               delete window[temp];
           }
        }(callbackFn);
        
        // data to be added to the URL request
        var data = { 
            // see http://developer.yahoo.com/yql/guide/select_statement.html  
            q: encodeURIComponent("select * from xml where url='" + url + "'"),
            format: "json",
            callback: temp
        }
         
        var paramArr = [];       
        for (var i in data){
            paramArr.push(i + "=" + data[i])
        }
         
        script.id = temp;    
        script.src = baseURL + "?" + paramArr.join("&");
        script.type = "text/javascript";    
       
        // trigger the JSONP request
        document.head.appendChild(script)
    };
    
    
    function getAllBugLinks(){
        var issueMarkers = document.querySelectorAll(".issue-marker");
        
        // container for links to bugs in Bugzilla
        var issueLinks = [];
        
        // convert NodeList to Array
        issueMarkers = arrayify(issueMarkers);
        
        // extract links to bugs in Bugzilla
        issueMarkers.forEach(function(item, index){
            
            // get all anchors from this issue maker
            var anchors = item.querySelectorAll("a");
             
            // convert NodeList to Array
            anchors = arrayify(anchors);
            
            anchors.forEach(function(item, index){
                issueLinks.push(item)
            }); 
        });
        
        return issueLinks;
    }
    
    
    document.addEventListener("DOMContentLoaded", function(){ 
        
        addStylesheet("issue_details.css");

        // template for issue details
        var issueTemplateString = '<div class="issue-details"> \
             <span class="status" title="Bug status in Bugzilla">{{bug_status}}</span> \
             <p>{{short_desc}}</p> \
         </div>';
        
        var issueTemplate = TemplateManager.compile(issueTemplateString);
        
        // get anchors with links to bugs in Bugzilla
        var issueLinks = getAllBugLinks();   
        
        // run through bug links and request details
        issueLinks.forEach(function(item, index){
            if (!item.href){
                return
            }     
            
            var url = item.href; 
            if (url.indexOf("&ctype=xml") < 0){
                url += "&ctype=xml";
            }
            
            getXMLAsObject(url, function(data){ 
                // validate response from the service       
                if (data && data.query && data.query.results && data.query.results.bugzilla && data.query.results.bugzilla.bug){
                                 
                    var bugData = data.query.results.bugzilla.bug;
                     
                    var node = issueTemplate(bugData);
                    
                    item.parentNode.insertBefore(node, item.nextSibling);
                }    
                     
            }); 
        })
         
    }, false)
    
})()