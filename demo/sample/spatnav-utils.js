window.addEventListener("load", function() {
  let list = document.querySelectorAll("meta");
  let application_name, application_author, application_description;
  // get the data such as name, author, and description
  for (let item of list) {
    if (item.name === "application-name") {
      application_name = item.content;
    } else if (item.name === "author") {
      application_author = item.content;
    } else if (item.name === "description") {
      application_description = item.content;
    }
  }
  if (typeof application_name !== "undefined") {
    // show the information panel
    let info_panel = document.createElement("div");
    info_panel.id = "info_panel";
    info_panel.innerHTML = application_name;
    // show the application author panel
    if (typeof application_author !== "undefined") {
      let author_panel = document.createElement("div");
      author_panel.id = "author_panel";
      author_panel.innerHTML = "written by " + application_author;
      info_panel.appendChild(author_panel);
    }
    // show the application description panel
    if (typeof application_description !== "undefined") {
      let description_panel = document.createElement("div");
      description_panel.id = "description_panel";
      description_panel.innerHTML = application_description;
      info_panel.appendChild(description_panel);
    }
    // show the folder figure
    let folder_btn = document.createElement("div");
    folder_btn.id = "folder_btn";
    folder_btn.innerText = ">";
    folder_btn.addEventListener("click", function() {
      if (folder_btn.innerText === ">") {
        folder_btn.innerText = "<";
        info_panel.setAttribute("style", "display: none;");
      } else {
        folder_btn.innerText = ">";
        info_panel.setAttribute("style", "display: block;");
      }
    });
    // attach the elements to body
    document.body.appendChild(info_panel);
    document.body.appendChild(folder_btn);
  }
});
