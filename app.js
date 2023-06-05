var redirecturi = "https://johnson4500.github.io/bruhify/"
var clientid = "72232195509f438a9bb37a0a7f2dccf4"

const TOKEN = "https://accounts.spotify.com/api/token"
const AUTHORIZE = "https://accounts.spotify.com/authorize"
const ARTISTS = "https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const TRACKS = "https://api.spotify.com/v1/me/top/tracks";


function awesome(){
let codeVerifier = generateRandomString(128);
generateCodeChallenge(codeVerifier).then(codeChallenge => {
  let state = generateRandomString(16);
  let scope = "user-read-email user-modify-playback-state user-read-recently-played user-read-email user-top-read user-read-playback-state";;

  localStorage.setItem('code_verifier', codeVerifier);

  let args = new URLSearchParams({
    response_type: 'code',
    client_id: clientid,
    scope: scope,
    redirect_uri: redirecturi,
    state: state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  window.location = 'https://accounts.spotify.com/authorize?' + args;
});
}

function onPageLoad(){
    if (window.location.search.length > 0){
        handleRedirect();
    } else {
        access_token = localStorage.getItem("access_token");
        if (access_token != null){
            //Display elements once access token received
            document.getElementById("botton").style.display = 'none';  
            let bruhify = "your top artists";
            document.getElementById("canbruh").style.display = 'block';
            document.getElementById("artists").style.display = 'inline-block';
            document.getElementById("bruhify").innerHTML = bruhify.bold(); 
            document.getElementById("marg").style.marginTop= "0px";
    
            topArtists();
        }
    }
}

function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
  
    return base64encode(digest);
  }

  function handleRedirect(){
    let code = getCode();
    requestAccessToken(code);
    //Remove the parameters from the URL to have a clean URL each refresh.
    window.history.pushState("", "", redirecturi);
}

  function getCode(){
        let code = null;
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code');
        return code;
  }

    function requestAccessToken(code){
        let codeVerifier = localStorage.getItem('code_verifier');
        let body = "grant_type=authorization_code";
            body += "&code=" + code;
            body += "&redirect_uri=" + redirecturi;
            body += "&client_id=" + clientid;
            body += "&code_verifier=" + codeVerifier;
            console.log(body);
            callAuthorization(body);
    };


function callAuthorization(body){
        let bossRequest = new XMLHttpRequest();
        bossRequest.open("POST", TOKEN, true);
        // Content-Type in header required set to application/x-www-form-urlencoded.
        bossRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        //Send request to server.
        bossRequest.send(body);
        bossRequest.onload = authorizationResponseHandler;
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
    console.log(this.status);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + clientid;
    callAuthorization(body);
}

function topArtists(){
    url = ARTISTS;
    callApi("GET", ARTISTS, null, handleArtistsResponse);
}

function callApi(method, url, body, callback){
    let xBoss = new XMLHttpRequest();
    xBoss.open(method, url, true);
    xBoss.setRequestHeader('Content-Type', 'application/json');
    xBoss.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xBoss.send(body);
    xBoss.onload = callback;
}

let labels = [];
let artistName = [];
function handleArtistsResponse(){
    if (this.status == 200){
        var data = JSON.parse(this.responseText);
        console.log(data);
        data.items.forEach((item, index) => addArtist(item, index));
        genreFrequency(labels);
        createChart();
    }
    else if (this.status == 401){
       refreshAccessToken()
        }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }

    function createChart() {
        const data = {
            labels: topGenres,
            datasets:[{
                label:'bruh',
                data: topRatios || [],
                backgroundColor: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black', 'white', 'cyan', 'brown']
            }]  
        };
                
        const config = {
            type: 'doughnut',
            data: data,    
            options:{
                responsive: true,
                maintainAspectRatio: false,
                plugins:{
                    legend:{
                        display:true,
                        },
                    title: {
                        display:true,
                        text: 'ur top genres joughnut',
                        color: 'black',
                        font:{
                            size: 20,
                        }  
                        },
                    tooltip: {
                        callbacks: {
                            label: ((tooltipItem, ) => {   
                                let label = tooltipItem.label;
                                let index = tooltipItem.dataset.data[tooltipItem.dataIndex];
                                return label + ": " + index + "%";
                            })
                        }
                    },
                        cutout: '30%',
                        radius: '96%',
                    }
                }
            };

    const chartData = {
        type: 'doughnut',
        data: data,
        options: config.options,
        };
            
    const chart = new Chart(
        document.getElementById('myChart'),
        chartData
        );
    }
}



function addArtist(item, index){
    labels.push(item.genres);
    artistName.push(item.name);

    const newPara = document.createElement("span");
    newPara.setAttribute("id", item.name);

    const newContent = document.createTextNode(item.name.toLowerCase());
    newPara.appendChild(newContent);

    const br = document.createElement("br"); // Add a line break element

    const element = document.getElementById("artists");
    element.append(newPara);
    
    const spans = element.getElementsByTagName("span");
    for (let i = 0; i < spans.length; i++) {
        spans[i].style.display = "block"; // Set the display property to block
        spans[i].style.marginBottom = "10px"; // Adjust the margin size as needed
    }

    var clickableText = document.getElementById(item.name);

    // Resize the infoBox text dynamically
    function resizeInfoBox() {
        const infoBox = document.getElementById("infoBox");
        const maxWidth = infoBox.clientWidth;
        const maxHeight = infoBox.clientHeight;
      
        let fontSize = 16; // Initial font size
        let contentFits = false;
      
        while (!contentFits && fontSize > 0) {
          infoBox.style.fontSize = fontSize + "px";
      
          if (infoBox.scrollWidth <= maxWidth && infoBox.scrollHeight <= maxHeight) {
            contentFits = true;
          } else {
            fontSize--;
          }
        }
      }

    // Adjust the infoBox position when the window is resized
    window.addEventListener("resize", function() {
    const infoBoxContainer = document.getElementById("infoBoxContainer");
    infoBoxContainer.style.right = "25%"; // Adjust as needed
    });

    clickableText.addEventListener("mouseover", function() {
        clickableText.style.color = "red"; // Change text color on hover
        const infoBox = document.getElementById("infoBox");
        infoBox.innerHTML = item.name.toLowerCase() + "<br><br>genres: " + String(item.genres).replace(/,/g, ", ");
        infoBox.style.opacity = "1";
        resizeInfoBox();
    });

    clickableText.addEventListener("mouseout", function() {
        clickableText.style.color = ""; // Reset text color when mouse moves out
        infoBox.style.opacity = "0";
    });
}

let genrePopularity = {};
let topGenres = [];
let topRatios = [];
function genreFrequency(array){
    for (let i = 0; i < array.length; i++) {
        let row = array[i];
        
        // Iterate through each genre in the row
        for (let j = 0; j < row.length; j++) {
          let genre = row[j];
          
          // Check if the genre is already in the object
          if (genrePopularity.hasOwnProperty(genre)) {
            // If it is, increment the count by 1
            genrePopularity[genre] += 1;
          } else {
            // If it's not, add it to the object with a count of 1
            genrePopularity[genre] = 1;
          }
        }
      }
    
      // Sort genres by their ratios in descending order
      let sortedGenres = Object.keys(genrePopularity).sort((a, b) => genrePopularity[b] - genrePopularity[a]);
    
      // Extract the top ten genres and their ratios
      topGenres = sortedGenres.slice(0, 10);
      let totalCount = sortedGenres.slice(0, 10).reduce((sum, genre) => sum + genrePopularity[genre], 0);
      topRatios = topGenres.map(genre => Math.round((genrePopularity[genre] / totalCount) * 100));
    
      return [topGenres, topRatios];
}



// function getTracks(){
//     url = TRACKS;
//     callApi("GET", TRACKS, null, handleTracksResponse)
// }

// function handleTracksResponse(){
//     if (this.status == 200){
//         var data = JSON.parse(this.responseText);
//         console.log(data);
//     }
//     else if (this.status == 401){
//        refreshAccessToken()
       
//     }
//     else {
//         console.log(this.responseText);
//         alert(this.responseText);
//     }
// }
