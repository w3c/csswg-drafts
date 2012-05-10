(function(){ 
    
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
    
    // Bugzilla tracker
    var BugzillaTracker = (function(){ 
        
        var _cache = {},
            _config = { 
                bugSearchURL: "https://www.w3.org/Bugs/Public/buglist.cgi",
                scriptId: "BugzillaTracker",
                onSearch: _onSearch
            },
            _queryParams = {
                product: "CSS",
                component: "Regions",
                ctype: "js"
            };
        
        
        function _getScript(url){
             var script = document.createElement("script"),
                 oldScript = document.getElementById(_config.scriptId),
                 target = document.getElementsByTagName("script")[0]; 
             
             // Bugzilla returns results in the global namespace.
             // Remove old script references to avoid poluted results
             if (oldScript){
                 oldScript.parentNode.removeChild(oldScript)
             }                                             
             
             script.type = "text/javascript";
             script.src = url;
             script.id = _config.scriptId; 
             
             return target.parentNode.insertBefore(script, target);
         }
        
        /*
            Extend an object with the properties and value of other objects.
            Uses the function arguments as source objects. 
            Same-name properties will be overwritten if found in subsequent source objects.
            
            @param {Object} object The target object that will be extended
            @return {Object} an object containing all the keys and the values of the source objects
            
            @example 
            _extend({}, {value: "1"}, {isPublic: false }) 
        */
        function _extend(object){   
              
            // make arguments an array and get all the arguments, except the first one
            var sources = Array.prototype.slice.call(arguments, 1);
            
            if (sources && sources.length){
                sources.forEach(function(source){
                    for (var property in source){
                        object[property] = source[property]
                    }
                })
            }   
            
            return object;
        }  
        
        /*
            Convert an object with key/value pairs into a query string.
            Value entities are encoded for use in HTTP requests.
         
            @param {Object} object The object to be serialized.
            @return {String} The serialized object;
        */
        function _serialize(object){
            var pairs = [];
            for (var key in object){
                pairs.push( key + "=" + encodeURIComponent(object[key]) )
            }
           
            return pairs.join("&");
        } 
        
        /*   
            Convert the Bugzilla bug data array into an object. 
            To maintain consistency where Bugzilla didn't, the object keys are named as the ones returned by the Bugzilla API when requesting a single bug.
            
            When requesting bugLists as JavaScript Bugzilla returns each bug's data as an array of 7 values in this order:
            
            [
                bug severity, 
                bug priority, 
                operating system,
                username assigned to bug,
                bug status,
                bug resolution,
                bug description (title)
            ]
            
            @param {Array} array The bug details as values of a 7 items array;
            
            @return {Object} An object with keys an values describing the bug ( The way we like it in the real world! ) 
            
        */
        function _createBugObject(array){ 
            if (array.length !== 7){
                throw new Error("Invalid bug data. Expected array of 7 values.")
            }
            
            return {
                "bug_severity": array[0],
                "priority": array[1],
                "op_sys": array[2],  // operating system
                "assigned_to": array[3],
                "bug_status": array[4],
                "resolution": array[5], 
                "short_desc": array[6]
            }
        }
        
        function _onSearch(bugList){ 
            
        }
        
        function _getCallbackFn(){
            return function(bugList){  
                 
                // No bugs; Silent failure
                if (!bugList || !bugList.length){ 
                    return  
                } 
                 
                var bugObj,
                    bugs = {};
                
                bugList.forEach(function(bug, index){        
                    
                    var bugObj = _createBugObject(bug, index);
                               
                    if (bugObj){
                        bugObj["bug_id"] = index;   
                        bugs[index] = bugObj;
                    }    
                    
                })  
                
                // run user-provided callback with the bug list
                _config.onSearch.call(BugzillaTracker, bugs)
                
                // restore any previously buglistCallback function
                if (typeof _cache.buglistCallback == "function"){
                    window.buglistCallback = _cache.buglistCallback
                }
            }
        }  
        
        return { 
            
            /*
                Request bugs from Bugzilla based on seach query parameters.
                
                @param {Object} queryParams A map of query parameters for the Bugzilla API

                @example      
                {        
                    product: "CSS",
                    component: "Regions"
                }
            */
            search: function(queryParams, callbackFn){
                
                var params = _extend({}, _queryParams, queryParams),
                    queryString = _serialize(params),
                    url = _config.bugSearchURL + "?" + queryString;  
                    
                if (typeof callbackFn == "function"){  
                    _config.onSearch = callbackFn;
                }
                
                /* 
                   Bugzilla has a hardcoded callback function in the response when returning results as JavaScript (ctype=js).
                   It is window.buglistCallback(array); It receives a single paramter: an array of objects describing bugs.

                   Cache the reference to this callback if it already exists. 
                   Avoid collisions, replace with our own callback method, then restore the old function it other scripts may need it.
                */   
                if (typeof window.buglistCallback == "function"){
                    _cache.buglistCallback = window.buglistCallback;
                } 
                
                // Set our own handler. After running, it will replace itself with the original callback, if function was defined.
                window.buglistCallback = _getCallbackFn();
                
                _getScript(url);
            },  
            
            // overwrite default configuration (ex: Bugzilla buglist.cgi URL)
            setOptions: function(options){
                _config = _extend({}, _config, options)
            }
        }
    })();
    
    window.BugzillaTracker = BugzillaTracker;
    window.TemplateManager = TemplateManager;
})()
