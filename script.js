// ==UserScript==
// @name         Steamunlocked script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Script that notices you if there are new games on the site
// @author       NOED
// @match        https://steamunlocked.net/all-games/
// @grant        none
// ==/UserScript==

window.onload=function() {
    'use strict';

    var numprev=window.localStorage.getItem("numprev"); //numero di giochi precedenti all'esecuzione di questo script;
    var elements=document.getElementsByClassName("blog-content")[1].children[0].children; //lista di elementi (giochi presenti)
    var numactual=elements.length; //numero di giochi presenti nella pagina appena caricata
    var pos=document.getElementsByClassName("blog-content")[0]; //banner "All Games (A-Z)"

    if(numprev!=null){
        var nnew=numactual-numprev;
        if(nnew!=0){
            pos.insertAdjacentHTML("beforeend","<h1>"+nnew+" NUOVI GIOCHI! </h1>");
        }
        pos.insertAdjacentHTML("beforeend","<div>"+numactual+" giochi presenti</div>");

        var popgamescolumn=document.getElementsByClassName("col-lg-4")[0]; //elemento colonna "popular games"
        var infocolumn=document.createElement("div"); //elemento colonna "informazioni" da aggiungere per i nuovi giochi inseriti
        infocolumn.className="col-lg-4";
        infocolumn.id="infocolumn";
        var listnew=document.createElement("ul"); //lista nuova da inserire. per aggiungere elementi alla lista basta fare listnew.appendchild(li), dove li è una entry da creare
        listnew.className="listanuovi";

        infocolumn.textContent=""+nnew+" nuovi giochi";
        //e poi cerco
        for(let element of elements){
            let link=element.children[0].href; //prende i link
            let text=element.children[0].text; //prende il testo
            if(window.localStorage.getItem(text)==null){ //se non si trova nel local storage
                let entry=document.createElement("li"); //lo aggiungo alla lista info
                let content=document.createElement("a");
                content.text=text;
                content.href=link;
                entry.appendChild(content);
                listnew.appendChild(entry);
            }
        }
        infocolumn.appendChild(listnew); //listnew contiene tutti i giochi nuovi: verrà utilizzata alla pressione del tasto UPDATE (successivo)
        popgamescolumn.insertAdjacentElement("beforebegin",infocolumn); //inserisco "informazioni" sopra a "popular games"

        //aggiungere un button che permette di aggiungere i giochi nuovi al local storage e modificare di conseguenza il numero totale dei giochi

        //codice per inserire le chiavi nel localStorage
        /*
        var elements=document.getElementsByClassName("blog-content")[1].children[0].children;
        for(let element of elements){
           let link=element.children[0].href;
           let text=element.children[0].text;
           window.localStorage.setItem(text,link);
        }
        */

        var btn=document.createElement("button");
        btn.innerHTML="UPDATE";
        btn.style.backgroundColor='#000000';
        if(nnew==0){
            btn.style.visibility = "hidden";
        }
        btn.onclick=function(){
            window.localStorage.setItem("numprev",numactual); //lo setto direttamente nel local storage, poichè appena lo script parte la prima cosa che controlla è questa variabile nel local storage
            //scelgo di rifare le stesse operaioni fatte per trovare i giochi nuovi, poichè scandire listnew è oneroso. CONTROLLARE IN FUTURO.
            for(let element of elements){
                let link=element.children[0].href; //prende i link
                let text=element.children[0].text; //prende il testo
                if(window.localStorage.getItem(text)==null){ //se non si trova nel local storage
                    window.localStorage.setItem(text,link); //lo aggiungo al local storage (mentre prima lo aggiungevo alla lista da mostrare a schermo)
            }
            window.alert("New games added in the local storage!");
        }
        }
        popgamescolumn.insertAdjacentElement("beforebegin",btn); //inserisco un button
     }
    else{ //se non ci sono le entry nel local storage
        numprev=numactual;//se il  numero di giochi precedente non c'è, lo calcolo ora. Questo è il momento 0: da ora in poi il codice mostrerà i giochi nuovi
        let confirm=window.confirm("No entries in the local storage.\nAdd entries?"); //chiedo prima di aggiungere le entry, anche per permettere una eventuale verifica manuale dell'utente (F12->Application->LocalStorage)
            if(confirm==true){ //se l'utente conferma
                for(let element of elements){ //le aggiungo
                    let link=element.children[0].href;
                    let text=element.children[0].text;
                    window.localStorage.setItem(text,link);
                }
                window.localStorage.setItem("numprev",numprev);
            }
    }

}();
