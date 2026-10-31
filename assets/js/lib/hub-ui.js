// Hub UI language follows the theme setting; content names remain unchanged.
function ayuHubText(english, korean) {
    var hub = document.querySelector('[data-hub-locale]');
    return hub && hub.getAttribute('data-hub-locale') === 'ko' ? korean : english;
}
