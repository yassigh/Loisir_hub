(function() {
  "use strict";

  /**
   * Countdown timer
   */
  var $codepopularCountdown = $('#codepopularCountdown');
  if($codepopularCountdown.length > 0){
    let codepopularCountdown = document.getElementById('codepopularCountdown');
    const output = codepopularCountdown.innerHTML;

    const countDownDate = function() {
      let timeleft = new Date(codepopularCountdown.getAttribute('data-countdown-codepopular')).getTime() - new Date().getTime();

      let days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      let hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

      codepopularCountdown.innerHTML = output.replace('%d', days).replace('%h', hours).replace('%m', minutes).replace('%s', seconds);
    }
    countDownDate();
    setInterval(countDownDate, 1000);
  }
  /**
   * Countdown timer
   */
  var $codepopularCountdown1 = $('#codepopularCountdown1');
  if($codepopularCountdown1.length > 0){
    let codepopularCountdown1 = document.getElementById('codepopularCountdown1');
    const output = codepopularCountdown1.innerHTML;

    const countDownDate = function() {
      let timeleft = new Date(codepopularCountdown1.getAttribute('data-countdown-codepopular')).getTime() - new Date().getTime();

      let days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      let hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

      codepopularCountdown1.innerHTML = output.replace('%d', days).replace('%h', hours).replace('%m', minutes).replace('%s', seconds);
    }
    countDownDate();
    setInterval(countDownDate, 1000);
  }

  /**
   * Countdown timer
   */
  var $codepopularCountdown2 = $('#codepopularCountdown2');
  if($codepopularCountdown2.length > 0){
    let codepopularCountdown2 = document.getElementById('codepopularCountdown2');
    const output = codepopularCountdown2.innerHTML;

    const countDownDate = function() {
      let timeleft = new Date(codepopularCountdown2.getAttribute('data-countdown-codepopular')).getTime() - new Date().getTime();

      let days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
      let hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

      codepopularCountdown2.innerHTML = output.replace('%d', days).replace('%h', hours).replace('%m', minutes).replace('%s', seconds);
    }
    countDownDate();
    setInterval(countDownDate, 1000);
  }

})()