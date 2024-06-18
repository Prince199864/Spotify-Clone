let currentSong = new Audio();
let list0fSongs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const getSongs = async (folder) => {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    list0fSongs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            list0fSongs.push(element.href);
        }
    }
    //Show all the songs in PlayList
    let songList = document.querySelector(".songList");
    songList.innerHTML = "";
    for (const song of list0fSongs) {
        songList.innerHTML = songList.innerHTML + `<div class="songs flex align-center pointer">
        <img src="images/music.svg" alt="music icon" class="invert">
        <div class="PlaylistInfo flex">
            <span>${capitalize(song.split(`/${currFolder}/`)[1].split('.mp3')[0].replaceAll('-', ' '))}</span>
            <span>Spotify</span>
        </div>
        <!--<span class="playNow">Play Now</span>-->
        <img src="images/playsong.svg" alt="Play song" class="invert">
    </div>`
    }

    //Attach an event listener to the Songs of the Playlist
    Array.from(document.getElementsByClassName('songs')).forEach((e) => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector('.PlaylistInfo').firstElementChild.innerHTML);
        })
    })
    return list0fSongs;
}

const capitalize = (word) => {
    let str = word.charAt(0);
    str = str.toUpperCase().concat(word.slice(1));
    return str;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track.concat('.mp3').trim().replaceAll(' ', '-');
    if (!pause) {
        currentSong.play()
        play.src = "images/pause.svg";
    }
    document.querySelector('.songInfo').innerHTML = capitalize(track);
    document.querySelector('.songTime').innerHTML = "00:00/00:00";

}

const displayAlbums = async () => {
    let a1 = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a1.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector('.cardContainer');
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes('/songs/')) {
            let folder = e.href.split("/").splice(-1)[0].replaceAll("%20", ' ');
            let a2 = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a2.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card rounded pointer">
            <div class="playButton">
                <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 100 100">
                    <!-- Circle background -->
                    <circle cx="50" cy="50" r="45" fill="#1ed760" />

                    <!-- Smaller Play button -->
                    <polygon points="45,35 45,65 65,50" fill="#000" />
                </svg>
            </div>
            <img class="rounded" src="./songs/${folder}/cover.jpg" alt="playlists1">
            <h2>${response.title}</h2>
            <p>${response.description}..</p>
        </div>`
        }
    };
    //Loading the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener("click", async (item) => {
            //currentTarget instead of target because while clicking on the card , it gets clicked on card's children (either heading or image) so we used currentTarget as it is the element on which the event is called

            list0fSongs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
            //Plays the first music when the card is clicked
            playMusic(list0fSongs[0].split('/').slice(-1)[0].replaceAll('-'," ").replace('.mp3',''));

        })
    })
}

async function main() {

    //Get Songs from fetch api
    await getSongs('songs/Lofi');
    playMusic(list0fSongs[0].split(`/${currFolder}/`)[1].split('.mp3')[0].replaceAll('-', ' '), true);

    //Display all the albums
    displayAlbums();

    //Attach an event listener to play, next and previous buttons
    play.addEventListener("click", (element) => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "images/playButton.svg";

        }
    });

    //Attach an event listener to update the song duration
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circular").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circular").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    });

    //Add an event listener on hamburger
    document.querySelector(".hamburger").addEventListener("click", (e) => {
        document.querySelector('.left').style.left = 0;
    });

    //Add an event listener on cross 
    document.querySelector(".cross").addEventListener("click", (e) => {
        document.querySelector('.left').style.left = "-100%";
    })
    //Add an event Listener on Previous button
    //work needed
    previous.addEventListener("click", () => {
        let index = list0fSongs.indexOf(currentSong.src);
        if ((index - 1) >= 0) {
            playMusic(list0fSongs[index - 1].split(`/${currFolder}/`)[1].split('.mp3')[0].replaceAll('-', ' '));
        }
        else {
            // previous.style.visibility = "hidden";
            console.log('No next songs left');
        }
    });
    //Add an event Listener on Next button
    //work needed
    next.addEventListener("click", () => {
        let index = list0fSongs.indexOf(currentSong.src);
        if (index + 1 < list0fSongs.length) {
            playMusic(list0fSongs[index + 1].split(`/${currFolder}/`)[1].split('.mp3')[0].replaceAll('-', ' '));
        }
        else {
            // next.style.visibility = "hidden";
            console.log('No previous songs left');
        }
    });

    //Add event Listener on Volume Bar
    document.querySelector(".volumeRange").getElementsByTagName('input')[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    //Add an event Listener to mute the volume
    document.querySelector(".volumeImg").getElementsByTagName('img')[0].addEventListener("click", (e) => {
        if (e.target.src.includes("images/volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volumeRange").getElementsByTagName('input')[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .30;
            document.querySelector(".volumeRange").getElementsByTagName('input')[0].value = 30;
        }
    });

}

main();