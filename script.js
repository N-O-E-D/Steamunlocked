// ==UserScript==
// @name         Steamunlocked script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Script that notices you if there are new games on the site
// @author       NOED
// @match        https://steamunlocked.net/all-games/
// @grant        none
// @require      https://raw.githubusercontent.com/overlib/overlib/master/overlib.js
// ==/UserScript==


window.onload=function() {

    'use strict';

    var numprev=window.localStorage.getItem("numprev"); //number of games before the execution of this script;
    var elements=document.getElementsByClassName("blog-content")[0].children[0].children; //list of elements (all games)
    var numactual=elements.length; //length of the list (# all games)
    var pos=document.getElementsByClassName("blog-content")[0]; //"All Games (A-Z)" banner
    console.log("#games before: " + numprev)
    console.log("#games now: " + numactual)

    if(numprev!=null){

        var popgamescolumn=document.getElementsByClassName("col-lg-4")[0]; //"popular games" column element
        var infocolumn=document.createElement("div"); //new element for new games, to be inserted above "popular games" column
        infocolumn.className="col-lg-4";
        infocolumn.id="infocolumn";

        var listnew=document.createElement("ul"); //new list to be inserted. to add new elements to the list: listnew.appendchild(li), where li is an entry
        listnew.className="listanuovi";

        var nnew=0;

        //search:
        for(let element of elements){ //for each item of the global list (the "all games" one)...
            let link=element.children[0].href; //...take the link...
            let text=element.children[0].text; //...take the text...
            if(window.localStorage.getItem(text)==null){ //if it's not present in the local storage
                let entry=document.createElement("li"); //...add it to the list
                let content=document.createElement("a");
                content.text=text;
                content.href=link;
                content.style.color='#C6C6C6';
                fetch(link).then(function(response){return response.text();})
                           .then(function(html){
                               var parser = new DOMParser();
                               var doc = parser.parseFromString(html, 'text/html');
                               var overImage = doc.getElementsByClassName("blog-content")[0].querySelector("img");
                               if(overImage.src.startsWith("http")){
                                   overImage = "<img src="+overImage.src+">"; //it just works: if src is of type "http...";
                               }
                               else if(overImage.src.startsWith("data")){
                                   overImage = "<img src="+overImage.getAttribute("data-src")+">"; //it just works: if src is of type "data.." (so take data-src)
                               }
                               else overImage="cannot retrieve image"; //else show an error
                               //console.log(overImage);
                               content.onmouseover = function(){overlib(overImage, WIDTH, 500, LEFT, VAUTO)}; //...and inflate it as overlib (first param of overlib(...) wants an img string element, not the src string
                               content.onmouseout = function(){nd()};
                            })
                           .catch(function (err) {console.warn('Something went wrong.', err);});
                entry.appendChild(content);
                listnew.appendChild(entry);
                nnew++; //increment # of new games
            }
        }
        infocolumn.appendChild(listnew); //listnew contains all new games: useful at the pressure of the UPDATE button  (in future)
        popgamescolumn.insertAdjacentElement("beforebegin",infocolumn); //add the new list above "popular games"

       if(nnew!=0){
            pos.insertAdjacentHTML("beforeend","<h1>"+nnew+" NEW GAMES! </h1>");
        }
        pos.insertAdjacentHTML("beforeend","<div>"+numactual+" games present</div>");
        infocolumn.insertAdjacentHTML("beforebegin",""+nnew+" new games");

        //now let's handle the local storage update...
        var btn=document.createElement("button");
        btn.innerHTML="UPDATE";
        btn.style.backgroundColor='#000000';
        if(nnew==0){
            btn.style.visibility = "hidden";
        }
        btn.onclick=function(){
            window.localStorage.setItem("numprev",numactual); //insert it into the local storage -> this script will check this variable every time
            //same operations as before. CHECK THIS.
            for(let element of elements){
                let link=element.children[0].href; 
                let text=element.children[0].text; 
                if(window.localStorage.getItem(text)==null){
                    window.localStorage.setItem(text,link); //add it into the local storage
                }
            }
            window.alert("New games added in the local storage!");
            location.reload();
        }
        listnew.insertAdjacentElement("afterend",btn); //add a button
     }
    else{ //no entries in the local storage = running this script the first time or entries deleted
        numprev=numactual; //if previous # games is not present, calculate it now.
        let confirm=window.confirm("No entries in the local storage.\nAdd entries?"); //ask before add entries, also for a manual verification by the user (F12->Application->LocalStorage)
            if(confirm==true){ // if the user confirms...
                for(let element of elements){ //...add entries in the local storage
                    let link=element.children[0].href;
                    let text=element.children[0].text;
                    window.localStorage.setItem(text,link);
                }
                window.localStorage.setItem("numprev",numprev);
            }
    }

};
