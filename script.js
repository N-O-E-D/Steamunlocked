// ==UserScript==
// @name         Steamunlocked script newver
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Script that notices you if there are new games on the site
// @author       NOED
// @match        https://steamunlocked.net/all-games/
// @run-at       document-start
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
    document.getElementsByClassName("blog-content-title")[0].children[0].insertAdjacentText("beforeend"," ("+numactual+" games)");

    if(numprev!=null){

        var popgamescolumn=document.getElementsByClassName("col-lg-4")[0]; //"popular games" column element
        var infocolumn=document.createElement("div"); //new element for new games, to be inserted above "popular games" column
        infocolumn.className="col-lg-4";
        infocolumn.id="infocolumn";

        var listnew=document.createElement("ul"); //new list to be inserted. to add new elements to the list: listnew.appendchild(li), where li is an entry
        listnew.className="newgameslist";

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
                fetchImageAndAttachOverlib(link,content);
                entry.appendChild(content);
                listnew.appendChild(entry);
                nnew++; //increment # of new games
            }
        }
        infocolumn.appendChild(listnew); //listnew contains all new games: useful at the pressure of the UPDATE button 
        popgamescolumn.insertAdjacentElement("beforebegin",infocolumn); //add the new list above "popular games"

        infocolumn.insertAdjacentHTML("beforebegin",""+nnew+" new entries");

        //now let's handle the the local storage update...
        var updatebtn=document.createElement("button");
        updatebtn.innerHTML="UPDATE";
        updatebtn.style.backgroundColor='#000000';
        if(nnew==0){
            updatebtn.style.visibility = "hidden";
        }
        updatebtn.onclick=function(){
            let confirm=window.confirm("Are you sure you want to update the tracked games list?");
            if(confirm==true){ // if the user confirms...
                window.localStorage.setItem("numprev",numactual); //insert it into the local storage -> this script will check this variable every time
                insertElementsIntoLocalstorage();
                window.alert("New games added in the local storage!");
                location.reload();
            }
        }
        listnew.insertAdjacentElement("afterend",updatebtn); //add the button

        //...and the cleaning of the local storage
        var clearbtn=document.createElement("button");
        clearbtn.innerHTML="CLEAR";
        clearbtn.style.backgroundColor='#000000';

        clearbtn.onclick=function(){
            let confirm=window.confirm("Are you sure you want to clear the local storage (and don't want to track new games anymore)?");
            if(confirm==true){ // if the user confirms...
                window.localStorage.clear();
            window.alert("Local storage cleared!");
            location.reload();
            }
        }
        if(nnew==0){
            updatebtn.insertAdjacentElement("beforebegin",clearbtn); //add the button
        }
        else{
            updatebtn.insertAdjacentElement("afterend",clearbtn); //add a button
        }
     }
    else{ //no entries in the local storage = running this script the first time or entries deleted
        numprev=numactual; //if previous # games is not present, calculate it now.
        let confirm=window.confirm("No entries in the local storage.\nAdd entries?"); //ask before add entries, also for a manual verification by the user (F12->Application->localStorage)
            if(confirm==true){ // if the user confirms...
                insertElementsIntoLocalstorage(); //...add entries in the local storage
                window.localStorage.setItem("numprev",numprev);
            }
    }

    function insertElementsIntoLocalstorage(){
         for(let element of elements){
                let link=element.children[0].href;
                let text=element.children[0].text;
                window.localStorage.setItem(text,link); //add it into the local storage -> value updated if key already exists
            }
    }

    function fetchImageAndAttachOverlib(link,content){
        fetch(link).then(function(response){return response.text();})
                           .then(function(html){
                               let parser = new DOMParser();
                               let doc = parser.parseFromString(html, 'text/html');
                               let overImage = doc.getElementsByClassName("blog-content")[0].querySelector("img");

                               if(overImage.src.startsWith("http")){
                                   overImage = "<img src="+overImage.src+">"; //it just works: if src is of type "http...";
                               }
                               else if(overImage.src.startsWith("data")){
                                   overImage = "<img src="+overImage.getAttribute("data-src")+">"; //it just works: if src is of type "data.." (so take data-src)
                               }
                               else overImage="cannot retrieve image"; //else show an error

                               //... add other cases in future...

                               content.onmouseover = function(){overlib(overImage, WIDTH, 500, LEFT, VAUTO)}; //...and inflate it as overlib (first param of overlib(...) wants an img string element, not the src string
                               content.onmouseout = function(){nd()};
                            })
                           .catch(function (err) {console.warn('Something went wrong.', err);});
    }

};
