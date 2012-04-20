(function () {
    function getIssuesFromDocument () { 
        var list = {},
            issues = document.querySelectorAll(".issue-marker");

        if (issues) {
            // make issue an array
            issues = Array.prototype.slice.call(issues); 

            // pluck out the bug data from the DOM object
            issues.forEach(function (issue) { 

                var bugId = issue.dataset["bug_id"];

                if (bugId){
                    list[bugId] = {
                        "bug_status": issue.dataset["bug_status"],
                        "short_desc": issue.querySelector(".short-desc").innerText
                    }
                }  
                
            })
        }

        return list;
    } 
    
    // Decorate the issues received from the sever with their state related to the issues in the page (new, changed)
    function setIssueStates (serverIssues, documentIssues) {
        var serverIssue, documentIssue;
        
        if (!serverIssues){
            throw new TypeError("Missing 'serverIssues' from server. Expected Object, got "+ typeof serverIssues)
        }

        if (!documentIssues){
            throw new TypeError("Missing 'documentIssues' from document. Expected Object, got "+ typeof documentIssues)
        }

        for (var bugId in serverIssues){
            serverIssue = serverIssues[bugId];
            documentIssue = documentIssues[bugId];
            
            // is the bug in the doument?
            if (documentIssues[bugId]){

                // bug status has changed. it's an updated issue  
                if ( (documentIssue.bug_status !== serverIssue.bug_status) || 
                    (documentIssue.short_desc !== serverIssue.short_desc) ){  
                                                                                
                    // changes from NEW->ASSIGNED aren't noteworthy
                    if ( ! (documentIssue.bug_status == "NEW" &&
                         serverIssue.bug_status == "ASSIGNED") )
                    serverIssue.issue_state = "updated"; 
                }  
            }
            else{ 
                // not found in the document. it's a new issue if the bug_status
                // is not RESOLVED
                if (serverIssue.bug_status === "RESOLVED") {
                    //why do we want to show resolved issues that
                    //have already been removed from the spec?

                    //serverIssue.issue_state = 'resolved';
                } else {
                    serverIssue.issue_state = "new";
                }
            }
        }

        return serverIssues;    
    } 

    // "this" is bound to the "BugzillaTracker" instance
    function renderIssues (serverIssues) {  

        if (!serverIssues && !serverIssues.length){
            return;
        }     
        
        // get a list of bugs from the document  
        var documentIssues = getIssuesFromDocument();
        
        // get the bugs list with the updated state (not bug status) related to the bugs already in the page
        var issueList = setIssueStates(serverIssues, documentIssues);
        
        var fragment =  document.createDocumentFragment();
        
        for (var issueId in issueList){
            
            if (issueList[issueId]["issue_state"]){

                // bind the bug data to the bug template
                var issueFragment = this.renderIssue(issueList[issueId]);
                
                var wrapper = document.createElement("div"); 
                var trigger = document.createElement("a");
                trigger.className = "issue-markup-trigger";
                trigger.href = "#";          
                trigger.innerHTML = "toggle markup"
                
                wrapper.setAttribute("data-issue_state", issueList[issueId]["issue_state"]);
                
                wrapper.appendChild(trigger);
                wrapper.appendChild(issueFragment);
                fragment.appendChild(wrapper); 
            }     
        }
       
        var issueListContainer = document.querySelector("#issue-list"); 
        issueListContainer.appendChild(fragment);
         
        // show/hide the markup for a bug entry
        issueListContainer.addEventListener("click", toggleMarkup);
    } 
    
    function toggleMarkup (e) {
        if (e.target.className && e.target.classList.contains("issue-markup-trigger")){      
            e.preventDefault();       
            
            var parent = e.target.parentNode,
                issueEl = parent.querySelector(".issue-marker"),
                markup = issueEl.outerHTML;
                
           
            parent.classList.toggle("showMarkup");
            
            // already generated the markup
            if (parent.querySelector("pre")){   
                return
            }
            else{
                var pre = document.createElement("pre");
                pre.textContent = markup;

                parent.appendChild(pre);   
            }
        }
    }  
    
    function filterIssues (e) {
        if (e.target.name !== "issue-filter"){
            return
        } 
        
        var issueManager = document.querySelector("#issue-manager");
        
        switch(e.target.value){
            case "all": 
                issueManager.removeAttribute("data-view_state");
            break;
            
            case "new":
                issueManager.setAttribute("data-view_state", "new");
            break;
            
            case "updated":
                issueManager.setAttribute("data-view_state", "updated");
            break;
        }
    }   

    
    window.checkSpecificationIssues = function (product, component) {
        document.addEventListener("DOMContentLoaded", function(){  
        BugzillaTracker.setIssueTemplate(document.querySelector("#issue-template").innerHTML); 
        BugzillaTracker.sync({
                product: product, // e.g., 'CSS'
                component: component // e.g., "Regions",
            }, 
            renderIssues); 
               
        document.querySelector("#issue-manager form").addEventListener("change", filterIssues)   
    });
    };
})();
