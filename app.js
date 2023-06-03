var redirect_uri = "https://johnson4500.github.io/"
var client_id = ""
var client_secret = ""


const TOKEN = "https://accounts.spotify.com/api/token"
const AUTHORIZE = "https://accounts.spotify.com/authorize"
const ARTISTS = "https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const TRACKS = "https://api.spotify.com/v1/me/top/tracks";

//If the querystring part of the URL is valid, handle redirects.
function onPageLoad(){
    client_id = localStorage.getItem("client_id");
    client_secret = localStorage.getItem("client_secret");
    if (window.location.search.length > 0){
        handleRedirect();
    } else {
        access_token = localStorage.getItem("access_token");
        if (access_token == null){
            // Display token section if no valid token
            document.getElementById("tokenSection").style.display = 'block';  
        }
        else {
            // Upon valid token, display the graph
            let bruhify = "Your Top Artists";
            document.getElementById("canbruh").style.display = 'block';
            document.getElementById("bruhify").innerHTML = bruhify.bold(); 
            document.getElementById("marg").style.marginTop= "0px";
    
            topArtists();
            getTracks();
        }
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken(code);
    // Remove the parameters from the URL to have a clean URL each refresh.
    window.history.pushState("", "", redirect_uri);
}

/* When the authorization code is received, we must exchange it with an access token
by making a POST request to the Spotify Accounts Service. */
function fetchAccessToken(code){
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorization(body);
}

// The XMLHttpRequest object can be used to request data from a web server.
function callAuthorization(body){
    let bossRequest = new XMLHttpRequest();
    bossRequest.open("POST", TOKEN, true);
    // Content-Type in header required set to application/x-www-form-urlencoded.
    bossRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    /* The authorization requires a Base 64 encoded string containing the client ID and 
    client secret key, hence the btoa method. Authorization: Basic <base64 encoded client_id:client_secret>*/
    bossRequest.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    //Send request to server.
    bossRequest.send(body);
    bossRequest.onload = authorizationResponseHandler;
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorization(body);
}

// 200,	OK - The request has succeeded. The client can read the result of the request in the body and the headers of the response.//
function authorizationResponseHandler(){
    if (this.status == 200){
        var data = JSON.parse(this.responseText);
        //Display for debugging purposes.
        console.log(data);
        var data = JSON.parse(this.responseText);
        if (data.access_token != undefined){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if (data.refresh_token != undefined){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


// After authorization, a unique code is returned in the query string of our URL. 
function getCode(){
    let code = null;
    const query = window.location.search;
    if (query.length > 0){
        // URLSearchParams method allows us to get the code within the query string.
        const urlParameters = new URLSearchParams(query);
        //Search for code parameter within query string.
        code = urlParameters.get('code');
    }
    return code;
}

function requestAuthorization(){
    //Store client ID and secret ID in the respective variables.
    client_id = document.getElementById("client_id").value;
    client_secret = document.getElementById("client_secret").value;
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);

    //The url variable will be concatenated with these IDs.
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-email user-modify-playback-state user-read-recently-played user-read-email user-top-read user-read-playback-state";

    //Redirect user to the Spotify authorization page with the completed URL.
    window.location.href = url;
}



function handleDevicesResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
    }
    else if ( this.status == 401 ){
       refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


function callApi(method, url, body, callback){
    let xBoss = new XMLHttpRequest();
    xBoss.open(method, url, true);
    xBoss.setRequestHeader('Content-Type', 'application/json');
    xBoss.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xBoss.send(body);
    xBoss.onload = callback;
}



function topArtists(){
    url = ARTISTS;
    callApi("GET", ARTISTS, null, handleArtistsResponse);
}

let labels = [];
let artistData = [];
function handleArtistsResponse(){
        if (this.status == 200){
            var data = JSON.parse(this.responseText);
            console.log(data);
            data.items.forEach((item, index) => addArtist(item, index));
            createChart();
        }
        else if (this.status == 401){
           refreshAccessToken()
        }
        else {
            console.log(this.responseText);
            alert(this.responseText);
        }
}

function addArtist(item, index){
    labels.push(item.name);
    artistData.push(item.popularity);
}

function getTracks(){
    url = TRACKS;
    callApi("GET", TRACKS, null, handleTracksResponse)
}

function handleTracksResponse(){
    if (this.status == 200){
        var data = JSON.parse(this.responseText);
        console.log(data);
    }
    else if (this.status == 401){
       refreshAccessToken()
       
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

