// This page is queried by annemunition.tv/armory and is used to inject the live sub info ito the DOM

/* global $, document, XMLHttpRequest, window */
let liveSubs;
const server =
  window.location.href.includes('127.0.0.1') || window.location.href.includes('localhost')
    ? 'http://127.0.0.1:3000/api/live'
    : 'https://command.annemunition.tv/api/live';

$(document).ready(() => {
  httpGetAsync(server, (data) => {
    if (!data) return;
    liveSubs = JSON.parse(data);
    $('#live_subs > div').empty();
    const sortable = [];
    for (const i in liveSubs) {
      if (liveSubs.hasOwnProperty(i)) {
        sortable.push([i, liveSubs[i]]);
      }
    }
    while (sortable.length > 0) {
      const a = sortable.splice(getRandomInt(0, sortable.length), 1);
      addLiveDiv(a[0][0]);
    }
  });
});

function httpGetAsync(theUrl, callback) {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) return callback(xmlHttp.responseText);
  };
  xmlHttp.open('GET', theUrl, true);
  xmlHttp.send(null);
}

function addLiveDiv(index) {
  const stream = liveSubs[index];
  const name = displayName(stream.user_login, stream.user_name);
  const newDiv = document.createElement('div');
  newDiv.setAttribute('class', 'live');
  newDiv.setAttribute('data-name', name);
  $('#live_subs > div').append(newDiv);
  const link = `https://twitch.tv/${stream.user_login}`;
  const gameImg = stream.box_art_url
    ? stream.box_art_url.replace('{width}', 72).replace('{height}', 100)
    : 'https://static-cdn.jtvnw.net/ttv-boxart/Corruption-80x112.jpg';
  const gameLink = stream.game_name
    ? encodeURI(`https://www.twitch.tv/directory/game/${stream.game_name}`)
    : 'https://twitch.tv';
  const previewUrl = stream.thumbnail_url.replace('{width}', 640).replace('{height}', 360);
  $(`.live[data-name=${name}]`).html(
    `<div class="top"><a href="${link}" target="_blank"><img src="${previewUrl}"></a>` +
      `<div class="game"><div class="tooltip_c"><div class="tooltip">${stream.game_name}</div></div>` +
      `<div class="game_img"><a href="${gameLink}" target="_blank"><img src="${gameImg}"></a></div>` +
      `</div>` +
      `</div>` +
      `<div class="title"><a href="${link}">${stream.title}</a></div>` +
      `<div class="info">${stream.viewer_count} viewers on <span class="channel"><a href="${link}">` +
      `${name}</a></span></div>`,
  );
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function displayName(name, displayName) {
  if (!displayName) return name;
  if (name.toLowerCase() !== displayName.toLowerCase()) {
    return name;
  } else {
    return displayName;
  }
}
