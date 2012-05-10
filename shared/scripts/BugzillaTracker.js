(function () {
    
    // helper methods for filling gaps less capable browsers
    var util = {
        getOuterHTML: function(el){

            if (el.outerHTML){
                return el.outerHTML
            }

            var outerHTML,
                temp = document.createElement("div")

            temp.appendChild(el.cloneNode(true))
            outerHTML = temp.innerHTML

            temp = null

            return outerHTML
        },
        
        getDataAttr: function(el, attr){ 
            return (el.dataset) ? el.dataset[attr] : el.getAttribute("data-" + attr)
        },
        
        toggleClass: function(el, className){
            if (el.classList){ 
                el.classList.toggle(className)
            }
            else{
                var classList = el.className.split(" "),
                    index = classList.indexOf(className)

                if (index > -1){      
                    classList.splice(index, 1)
                }
                else{                      
                    classList.push(className)
                }
                
                el.className = classList.join(" ")
            }
        }
    }
    
    function IssueDashboard(){
        var _dashboard = document.createElement("div"),
            _offlineIssues = {},
            _onlineIssues = {},
            _issueTemplate = null,
            _header = document.createElement("a"),
            _message = document.createElement("em")

        _header.href = "#"
        _header.className = "issue-dashboard-header"
        _header.textContent = "Issues Dashboard"
        _header.appendChild(_message)

        _header.addEventListener("click", toggleDashboard, false)

        _dashboard.id = "issue-dashboard"
        _dashboard.appendChild(_header)

        document.body.appendChild(_dashboard)

        function toggleDashboard(e){
            e.preventDefault()
            util.toggleClass(_dashboard, "open")
        }

        function getNewIssues(){
            var id, issues = []

            for (id in _onlineIssues){

                if (!_offlineIssues[id]){
                    // not found in the document.
                    // it's a new issue if the bug_status is not RESOLVED
                    if (_onlineIssues[id].bug_status !== "RESOLVED") {

                        _onlineIssues[id].issue_state = "new"
                        issues.push(_onlineIssues[id])
                    }
                }
            }

            return issues
        }

        function getChangedIssues(){
            var id, changed, issues = []

            for (id in _onlineIssues){

                // is the bug in the doument?
                if (_offlineIssues[id]){

                    changed = false

                    // bug description has changed
                    if (_offlineIssues[id].short_desc !== _onlineIssues[id].short_desc){
                        _onlineIssues[id].issue_state = "updated"
                        changed = true
                    }

                    // bug status has changed
                    if (_offlineIssues[id].bug_status !== _onlineIssues[id].bug_status){

                        // changes from NEW -> ASSIGNED aren't noteworthy
                        if ( !(_offlineIssues[id].bug_status == "NEW" && _onlineIssues[id].bug_status == "ASSIGNED") ){
                            _onlineIssues[id].issue_state = "updated";
                            changed = true
                        }
                    }

                    if (changed){
                        // the issue has been changed, collect it
                        issues.push(_onlineIssues[id])
                    }
                }
            }

            return issues
         }


        function renderIssues(issues){
            var issueItem,
                issueList = document.createElement("ul")

            issueList.className = "issue-list"

            issues.forEach(function(issue){
               issueItem = document.createElement("li")

               var meta = document.createElement("span")
               meta.className = "meta"
               meta.innerHTML =  issue["issue_state"]

               if (issue["bug_status"] == "RESOLVED"){
                   meta.innerHTML = issue["bug_status"]
               }
               var toggle = document.createElement("a")
               toggle.href = "#"
               toggle.className = "toggle"
               toggle.innerHTML = "toggle HTML"
               toggle.addEventListener("click", function(parent){

                   return function(e){
                       e.preventDefault() 
                       util.toggleClass(parent, "showMarkup")
                   }

               }(issueItem))

               // populate the issue template with data
               var issueDOM = _issueTemplate(issue)

               // container for issue markup
               var markup = document.createElement("pre")
               markup.textContent = util.getOuterHTML(issueDOM)

               issueItem.appendChild(meta)
               issueItem.appendChild(toggle)
               issueItem.appendChild(markup)
               issueItem.appendChild(issueDOM)

               issueList.appendChild(issueItem)
            })

            _dashboard.appendChild(issueList)
        }

        return {
            setOnlineIssues: function(issues){
                _onlineIssues = issues || []
            },

            setOfflineIssues: function(issues){
                _offlineIssues = issues || []
            },

            setIssueTemplate: function(string){
                _issueTemplate = TemplateManager.compile(string)
            },

            sync: function(){
                if (!_issueTemplate){
                    throw new Error("IssueDashboard is missing 'issueTemplate'. Expected String, got "+ typeof _issueTemplate)
                }

                if (!_onlineIssues){
                    throw new TypeError("Missing 'serverIssues' from server. Expected Object, got "+ typeof _onlineIssues)
                }

                if (!_offlineIssues){
                    throw new TypeError("Missing 'documentIssues' from document. Expected Object, got "+ typeof _offlineIssues)
                }

                var newIssues = getNewIssues(),
                    changedIssues = getChangedIssues(),
                    issues = newIssues.concat(changedIssues)
               
                // there's work to be done
                if (issues.length){

                    _dashboard.className = "warning"
                    renderIssues(issues)
                }
                else{
                    _dashboard.className = "ok"
                    _header.removeEventListener("click", toggleDashboard, false)
                }

                _message.textContent = issues.length

            }
        }
    }

    function getIssuesFromDocument() {
        var list = {},
            issues = document.querySelectorAll(".issue-marker");

        if (issues) {
            // make issue an array
            issues = Array.prototype.slice.call(issues);

            // pluck out the bug data from the DOM object
            issues.forEach(function (issue) {

                var bugId = util.getDataAttr(issue, "bug_id")

                if (bugId){
                    list[bugId] = {
                        "bug_status": util.getDataAttr(issue, "bug_status"),
                        "short_desc": issue.querySelector(".short-desc").textContent.replace(/\n?\s+/g, " ")
                    }
                }

            })
        }

        return list;
    }

    var dashboard = new IssueDashboard()
        dashboard.setIssueTemplate(document.querySelector("#issue-template").innerHTML)

    var docIssues = getIssuesFromDocument()
        dashboard.setOfflineIssues(docIssues)

    window.checkSpecificationIssues = function (product, component) {

        document.addEventListener("DOMContentLoaded", function(){

            BugzillaTracker.search({
                product: product, // e.g., 'CSS'
                component: component // e.g., "Regions",
            },

            function(issues){
                dashboard.setOnlineIssues(issues)
                dashboard.sync()
            });

        });
    };
})();
