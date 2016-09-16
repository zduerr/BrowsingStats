Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
});

//returns true if a video is playing on the active tab
function videoPlaying() {
    var video = document.querySelector(("video"));
    if (video) {
        return video.playing;
    }
}