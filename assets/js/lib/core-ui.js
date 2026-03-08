function cover() {
    'use strict';

    var image = document.querySelector('.cover-image');
    var coverEl = document.querySelector('.site-cover');

    if (!image || !coverEl) {
        return;
    }

    function markInitialized() {
        coverEl.classList.add('initialized');
        image.removeAttribute('data-ayu-cover-bound');
    }

    if (image.complete) {
        markInitialized();
        return;
    }

    if (image.getAttribute('data-ayu-cover-bound') === 'true') {
        return;
    }
    image.setAttribute('data-ayu-cover-bound', 'true');

    image.addEventListener('load', markInitialized, { once: true });
    image.addEventListener('error', markInitialized, { once: true });
}

function renderAyuPagination() {
    'use strict';

    var paginations = document.querySelectorAll('.js-ayu-pagination');

    if (!paginations.length) {
        return;
    }

    paginations.forEach(function (paginationEl) {
        var currentPage = parseInt(paginationEl.getAttribute('data-current-page'), 10);
        var totalPages = parseInt(paginationEl.getAttribute('data-total-pages'), 10);

        if (!currentPage || !totalPages || totalPages < 2) {
            paginationEl.innerHTML = '';
            return;
        }

        var path = window.location.pathname;
        var basePath = path.replace(/\/page\/\d+\/?$/, '/');
        if (!basePath.endsWith('/')) {
            basePath += '/';
        }

        function pageUrl(page) {
            if (page === 1) {
                return basePath;
            }

            return basePath + 'page/' + page + '/';
        }

        var html = [];

        if (currentPage > 1) {
            html.push('<a class="ayu-page-link" href="' + pageUrl(currentPage - 1) + '">&lt;</a>');
        }

        for (var page = 1; page <= totalPages; page += 1) {
            if (page === currentPage) {
                html.push('<span class="ayu-page-link is-active" aria-current="page">' + page + '</span>');
            } else {
                html.push('<a class="ayu-page-link" href="' + pageUrl(page) + '">' + page + '</a>');
            }
        }

        if (currentPage < totalPages) {
            html.push('<a class="ayu-page-link" href="' + pageUrl(currentPage + 1) + '">&gt;</a>');
        }

        paginationEl.innerHTML = html.join('');
    });
}

function themeToggle() {
    'use strict';

    var root = document.documentElement;
    var toggles = document.querySelectorAll('.js-theme-toggle');
    var storageKey = 'theme-preference';

    if (!toggles.length) {
        return;
    }

    function setTheme(theme) {
        var nextTheme = theme === 'dark' ? 'dark' : 'light';
        var isDark = nextTheme === 'dark';

        root.setAttribute('data-theme', nextTheme);
        root.classList.toggle('theme-dark', isDark);

        toggles.forEach(function (toggle) {
            toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        });
    }

    var savedTheme = null;
    try {
        savedTheme = localStorage.getItem(storageKey);
    } catch (error) {
        savedTheme = null;
    }

    setTheme(savedTheme === 'dark' ? 'dark' : (root.getAttribute('data-theme') || 'light'));


    toggles.forEach(function (toggle) {
        if (toggle.getAttribute('data-ayu-theme-bound') === 'true') {
            return;
        }
        toggle.setAttribute('data-ayu-theme-bound', 'true');
        toggle.addEventListener('click', function () {
            var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(nextTheme);

            try {
                localStorage.setItem(storageKey, nextTheme);
            } catch (error) {
                // Ignore storage errors in restricted environments.
            }
        });
    });
}

function player() {
    'use strict';
    var player = document.querySelector('.player');
    var playerAudio = player ? player.querySelector('.player-audio') : null;
    var playerProgress = player ? player.querySelector('.player-progress') : null;
    var timeCurrent = player ? player.querySelector('.player-time-current') : null;
    var timeDuration = player ? player.querySelector('.player-time-duration') : null;
    var playButton = player ? player.querySelector('.button-play') : null;
    var backwardButton = player ? player.querySelector('.player-backward') : null;
    var forwardButton = player ? player.querySelector('.player-forward') : null;
    var playerSpeed = 1;
    var speedButton = player ? player.querySelector('.player-speed') : null;
    var site = document.querySelector('.site');

    if (!player || !playerAudio || !site) {
        return;
    }

    if (player.getAttribute('data-ayu-player-bound') === 'true') {
        return;
    }
    player.setAttribute('data-ayu-player-bound', 'true');

    function removePlayingFromPost(postId) {
        if (!postId) {
            return;
        }

        var selector = '.post[data-id="' + postId + '"] .post-play';
        var postPlay = document.querySelector(selector);
        if (postPlay) {
            postPlay.classList.remove('playing');
        }
    }

    function syncPlayerFromEpisode(episode) {
        if (!episode) {
            return;
        }

        var nextId = episode.getAttribute('data-id') || '';
        var currentId = player.getAttribute('data-playing') || '';

        if (currentId !== nextId) {
            removePlayingFromPost(currentId);
            player.setAttribute('data-playing', nextId);
        }

        var audioUrl = episode.getAttribute('data-url') || '';
        if (audioUrl) {
            playerAudio.setAttribute('src', audioUrl);
        }

        var episodeImage = episode.querySelector('.post-image');
        var playerImage = player.querySelector('.post-image');
        if (episodeImage && playerImage) {
            playerImage.setAttribute('src', episodeImage.getAttribute('src') || '');
        }

        var episodeTitle = episode.querySelector('.post-title');
        var playerTitle = player.querySelector('.post-title');
        if (episodeTitle && playerTitle) {
            playerTitle.textContent = episodeTitle.textContent || '';
        }

        var episodeTime = episode.querySelector('.post-meta-date time');
        var playerTime = player.querySelector('.post-meta time');
        if (episodeTime && playerTime) {
            playerTime.setAttribute('datetime', episodeTime.getAttribute('datetime') || '');
            playerTime.textContent = episodeTime.textContent || '';
        }
    }

    site.addEventListener('click', function (event) {
        var clicked = event.target.closest('.js-play');
        if (!clicked || !site.contains(clicked)) {
            return;
        }

        if (clicked.classList.contains('post-play')) {
            syncPlayerFromEpisode(clicked.closest('.post'));
        }

        if (playerAudio.paused) {
            var playPromise = playerAudio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(function () {
                        clicked.classList.add('playing');
                        if (playButton) {
                            playButton.classList.add('playing');
                        }

                        var activeId = player.getAttribute('data-playing') || '';
                        var activeSelector = '.post[data-id="' + activeId + '"] .post-play';
                        var activePostPlay = activeId ? document.querySelector(activeSelector) : null;
                        if (activePostPlay) {
                            activePostPlay.classList.add('playing');
                        }

                        document.body.classList.add('player-opened');
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        } else {
            playerAudio.pause();
            clicked.classList.remove('playing');
            if (playButton) {
                playButton.classList.remove('playing');
            }
            removePlayingFromPost(player.getAttribute('data-playing') || '');
        }
    });

    playerAudio.addEventListener('timeupdate', function () {
        var duration = isNaN(playerAudio.duration) ? 0 : playerAudio.duration;
        if (timeDuration) {
            timeDuration.textContent = new Date(duration * 1000).toISOString().substring(11, 19);
        }
        if (timeCurrent) {
            timeCurrent.textContent = new Date(playerAudio.currentTime * 1000).toISOString().substring(11, 19);
        }
        if (playerProgress) {
            var progress = playerAudio.duration ? (playerAudio.currentTime / playerAudio.duration) * 100 : 0;
            playerProgress.style.width = progress + '%';
        }
    });

    if (backwardButton) {
        backwardButton.addEventListener('click', function () {
            playerAudio.currentTime = playerAudio.currentTime - 10;
        });
    }

    if (forwardButton) {
        forwardButton.addEventListener('click', function () {
            playerAudio.currentTime = playerAudio.currentTime + 30;
        });
    }

    if (speedButton) {
        speedButton.addEventListener('click', function () {
            if (playerSpeed < 2) {
                playerSpeed += 0.5;
            } else {
                playerSpeed = 1;
            }

            playerAudio.playbackRate = playerSpeed;
            speedButton.textContent = playerSpeed + 'x';
        });
    }
}
