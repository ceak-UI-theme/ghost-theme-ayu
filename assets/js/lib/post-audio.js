var AYU_AUDIO_ASSET_CACHE = window.__ayuAudioAssetCache || (window.__ayuAudioAssetCache = {});
var AYU_AUDIO_VTT_CACHE = window.__ayuAudioVttCache || (window.__ayuAudioVttCache = {});

function fetchAudioAssetStatus(slug) {
    'use strict';

    var normalizedSlug = String(slug || '').trim().replace(/^\/+|\/+$/g, '');

    if (!normalizedSlug) {
        return Promise.resolve({
            hasAudio: false,
            hasSubtitles: false,
            audioUrl: '',
            subtitlesUrl: ''
        });
    }

    if (AYU_AUDIO_ASSET_CACHE[normalizedSlug]) {
        return AYU_AUDIO_ASSET_CACHE[normalizedSlug];
    }

    var basePath = '/content/media/audio/' + encodeURIComponent(normalizedSlug);
    var audioUrl = basePath + '.mp3';
    var subtitlesUrl = basePath + '.vtt';

    function checkExists(url) {
        return fetch(url, {
            method: 'HEAD',
            credentials: 'same-origin'
        }).then(function (response) {
            if (response.ok) {
                return true;
            }

            // Some Ghost media routes respond to GET but not HEAD for binary assets.
            if (response.status !== 404 && response.status !== 405) {
                return false;
            }

            return fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Range: 'bytes=0-0'
                }
            }).then(function (fallbackResponse) {
                return fallbackResponse.ok;
            }).catch(function () {
                return false;
            });
        }).catch(function () {
            return false;
        });
    }

    AYU_AUDIO_ASSET_CACHE[normalizedSlug] = checkExists(audioUrl).then(function (hasAudio) {
        if (!hasAudio) {
            return {
                hasAudio: false,
                hasSubtitles: false,
                audioUrl: audioUrl,
                subtitlesUrl: subtitlesUrl
            };
        }

        return checkExists(subtitlesUrl).then(function (hasSubtitles) {
            return {
                hasAudio: true,
                hasSubtitles: hasSubtitles,
                audioUrl: audioUrl,
                subtitlesUrl: subtitlesUrl
            };
        });
    });

    return AYU_AUDIO_ASSET_CACHE[normalizedSlug];
}

function renderPostAudioPlayers(root) {
    'use strict';

    var scope = root || document;
    if (!scope || !scope.querySelectorAll) {
        return;
    }

    var players = Array.prototype.slice.call(scope.querySelectorAll('[data-post-audio][data-slug]'));
    if (!players.length) {
        return;
    }

    players.forEach(function (playerRoot) {
        if (playerRoot.getAttribute('data-post-audio-ready') === 'true') {
            return;
        }

        playerRoot.setAttribute('data-post-audio-ready', 'true');

        fetchAudioAssetStatus(playerRoot.getAttribute('data-slug')).then(function (asset) {
            if (!asset.hasAudio) {
                return;
            }

            var trackMarkup = asset.hasSubtitles
                ? '<track kind="subtitles" srclang="ko" label="Subtitles" src="' + asset.subtitlesUrl + '">'
                : '';
            var captionsMarkup = asset.hasSubtitles
                ? '<div class="post-audio-captions" data-post-audio-captions aria-live="polite">자막 준비 중...</div><div class="post-audio-transcript-shell"><button class="post-audio-transcript-toggle" type="button" data-post-audio-transcript-toggle aria-expanded="false" aria-label="Show transcript"><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5.25 7.5 10 12.25 14.75 7.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"/></svg></button><div class="post-audio-transcript" data-post-audio-transcript-panel hidden aria-label="Transcript"><div class="post-audio-transcript-body" data-post-audio-transcript></div></div></div>'
                : '';
            var title = playerRoot.getAttribute('data-title') || document.title || 'Audio';

            playerRoot.innerHTML = [
                '<div class="post-audio-player-wrap">',
                '<media-player class="post-audio-player" view-type="audio" stream-type="on-demand" preload="metadata" title="', String(title).replace(/"/g, '&quot;'), '" src="', asset.audioUrl, '">',
                '<media-provider></media-provider>',
                trackMarkup,
                '<media-audio-layout></media-audio-layout>',
                '</media-player>',
                captionsMarkup,
                '</div>'
            ].join('');
            playerRoot.hidden = false;

            if (asset.hasSubtitles) {
                bindPostAudioCaptions(playerRoot, asset.subtitlesUrl);
            }
        });
    });
}

function renderPostAudioBadges(root) {
    'use strict';

    var scope = root || document;
    if (!scope || !scope.querySelectorAll) {
        return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll('.post-feed .post[data-slug]'));
    if (!cards.length) {
        return;
    }

    cards.forEach(function (card) {
        var badgeRow = card.querySelector('[data-post-badge-row]');
        var slug = card.getAttribute('data-slug');

        if (!badgeRow || badgeRow.getAttribute('data-post-audio-ready') === 'true') {
            return;
        }

        badgeRow.setAttribute('data-post-audio-ready', 'true');

        fetchAudioAssetStatus(slug).then(function (asset) {
            if (!asset.hasAudio) {
                return;
            }

            badgeRow.innerHTML = '<span class="post-audio-badge" data-post-audio-badge>AUDIO</span>';
        });
    });
}

function parseVttTimestamp(value) {
    'use strict';

    var parts = String(value || '').trim().split(':');
    var secondsPart;

    if (parts.length === 3) {
        secondsPart = parseFloat(parts[2].replace(',', '.')) || 0;
        return ((parseInt(parts[0], 10) || 0) * 3600) + ((parseInt(parts[1], 10) || 0) * 60) + secondsPart;
    }

    if (parts.length === 2) {
        secondsPart = parseFloat(parts[1].replace(',', '.')) || 0;
        return ((parseInt(parts[0], 10) || 0) * 60) + secondsPart;
    }

    return parseFloat(String(value || '').replace(',', '.')) || 0;
}

function parseVttCues(rawVtt) {
    'use strict';

    var blocks = String(rawVtt || '').replace(/\r/g, '').split('\n\n');
    var cues = [];

    blocks.forEach(function (block) {
        var lines = block.split('\n').map(function (line) {
            return line.trim();
        }).filter(Boolean);
        var timeLineIndex = lines.findIndex(function (line) {
            return line.indexOf('-->') !== -1;
        });

        if (timeLineIndex === -1) {
            return;
        }

        var timelineMatch = lines[timeLineIndex].match(/((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})\s+-->\s+((?:\d{2}:)?\d{2}:\d{2}[.,]\d{3})/);
        var text = lines.slice(timeLineIndex + 1).join(' ');

        if (!timelineMatch || !text) {
            return;
        }

        cues.push({
            start: parseVttTimestamp(timelineMatch[1]),
            end: parseVttTimestamp(timelineMatch[2]),
            text: text
        });
    });

    return cues;
}

function fetchVttCues(url) {
    'use strict';

    if (AYU_AUDIO_VTT_CACHE[url]) {
        return AYU_AUDIO_VTT_CACHE[url];
    }

    AYU_AUDIO_VTT_CACHE[url] = fetch(url, {
        credentials: 'same-origin'
    }).then(function (response) {
        if (!response.ok) {
            return [];
        }

        return response.text().then(parseVttCues);
    }).catch(function () {
        return [];
    });

    return AYU_AUDIO_VTT_CACHE[url];
}

function bindPostAudioCaptions(playerRoot, subtitlesUrl) {
    'use strict';

    var mediaEl = playerRoot.querySelector('media-player audio') || playerRoot.querySelector('.post-audio-player');
    var captionsRoot = playerRoot.querySelector('[data-post-audio-captions]');

    if (!captionsRoot) {
        return;
    }

    if (!mediaEl) {
        window.setTimeout(function () {
            bindPostAudioCaptions(playerRoot, subtitlesUrl);
        }, 250);
        return;
    }

    fetchVttCues(subtitlesUrl).then(function (cues) {
        if (!cues.length) {
            captionsRoot.textContent = '자막을 불러오지 못했습니다.';
            captionsRoot.classList.add('is-empty');
            return;
        }

        var transcriptRoot = playerRoot.querySelector('[data-post-audio-transcript]');
        var transcriptPanel = playerRoot.querySelector('[data-post-audio-transcript-panel]');
        var transcriptToggle = playerRoot.querySelector('[data-post-audio-transcript-toggle]');
        var lastCueText = '';
        var lastCueIndex = -1;
        var intervalId = 0;
        var allowTranscriptFollow = false;

        if (transcriptRoot) {
            transcriptRoot.innerHTML = cues.map(function (cue, index) {
                return '<p class="post-audio-transcript-line" data-cue-index="' + index + '">' + cue.text + '</p>';
            }).join('');
            transcriptRoot.scrollTop = 0;

            if (transcriptToggle && transcriptPanel) {
                transcriptToggle.addEventListener('click', function () {
                    var isOpen = transcriptToggle.getAttribute('aria-expanded') === 'true';

                    transcriptToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
                    transcriptToggle.setAttribute('aria-label', isOpen ? 'Show transcript' : 'Hide transcript');
                    transcriptPanel.hidden = isOpen;

                    if (!isOpen) {
                        transcriptRoot.scrollTop = 0;
                    }
                });
            }

            transcriptRoot.addEventListener('click', function (event) {
                var line = event.target.closest('.post-audio-transcript-line[data-cue-index]');
                var cueIndex;

                if (!line) {
                    return;
                }

                cueIndex = parseInt(line.getAttribute('data-cue-index'), 10);
                if (Number.isNaN(cueIndex) || !cues[cueIndex]) {
                    return;
                }

                allowTranscriptFollow = true;
                if (transcriptToggle && transcriptPanel && transcriptPanel.hidden) {
                    transcriptToggle.setAttribute('aria-expanded', 'true');
                    transcriptToggle.setAttribute('aria-label', 'Hide transcript');
                    transcriptPanel.hidden = false;
                }
                mediaEl.currentTime = Math.max(cues[cueIndex].start, 0);
                mediaEl.dispatchEvent(new Event('seeked'));
            });
        }

        function getLinePositionInTranscript(lineEl) {
            var rootRect = transcriptRoot.getBoundingClientRect();
            var lineRect = lineEl.getBoundingClientRect();

            return {
                top: (lineRect.top - rootRect.top) + transcriptRoot.scrollTop,
                bottom: (lineRect.bottom - rootRect.top) + transcriptRoot.scrollTop
            };
        }

        function renderActiveCue() {
            var currentTime = Number(mediaEl.currentTime) || 0;
            var activeCue = null;
            var activeCueIndex = -1;
            var i;

            for (i = 0; i < cues.length; i += 1) {
                if (currentTime >= cues[i].start && currentTime <= cues[i].end) {
                    activeCue = cues[i];
                    activeCueIndex = i;
                    break;
                }
            }

            var nextText = activeCue ? activeCue.text : '자막 대기 중';
            if (nextText !== lastCueText) {
                captionsRoot.textContent = nextText;
                lastCueText = nextText;
            }
            captionsRoot.classList.toggle('is-idle', !activeCue);

            if (transcriptRoot && activeCueIndex !== lastCueIndex) {
                var previousLine = transcriptRoot.querySelector('.post-audio-transcript-line.is-active');
                var activeLine = activeCueIndex === -1
                    ? null
                    : transcriptRoot.querySelector('[data-cue-index="' + activeCueIndex + '"]');

                if (previousLine) {
                    previousLine.classList.remove('is-active');
                }

                if (activeLine) {
                    activeLine.classList.add('is-active');

                    if (allowTranscriptFollow) {
                        var currentScrollTop = transcriptRoot.scrollTop;
                        var linePosition = getLinePositionInTranscript(activeLine);
                        var lineTop = linePosition.top;
                        var lineBottom = linePosition.bottom;
                        var viewportTop = currentScrollTop;
                        var viewportBottom = viewportTop + transcriptRoot.clientHeight;
                        var topBuffer = 48;
                        var bottomBuffer = 72;
                        var targetTop = currentScrollTop;

                        if (lineTop < viewportTop + topBuffer) {
                            targetTop = Math.max(0, lineTop - topBuffer);
                        } else if (lineBottom > viewportBottom - bottomBuffer) {
                            targetTop = Math.max(0, lineBottom - transcriptRoot.clientHeight + bottomBuffer);
                        }

                        if (Math.abs(targetTop - currentScrollTop) > 12) {
                            transcriptRoot.scrollTo({
                                top: targetTop,
                                behavior: 'smooth'
                            });
                        }
                    }
                }

                lastCueIndex = activeCueIndex;
            }
        }

        function startLoop() {
            if (intervalId) {
                return;
            }

            allowTranscriptFollow = true;
            intervalId = window.setInterval(function () {
                renderActiveCue();
            }, 200);
        }

        function stopLoop() {
            if (!intervalId) {
                return;
            }

            window.clearInterval(intervalId);
            intervalId = 0;
        }

        mediaEl.addEventListener('seeked', renderActiveCue);
        mediaEl.addEventListener('play', startLoop);
        mediaEl.addEventListener('pause', stopLoop);
        mediaEl.addEventListener('ended', stopLoop);
        mediaEl.addEventListener('canplay', renderActiveCue);
        renderActiveCue();
        if (transcriptRoot && !allowTranscriptFollow) {
            window.requestAnimationFrame(function () {
                transcriptRoot.scrollTop = 0;
            });
        }
        if (!mediaEl.paused) {
            startLoop();
        }
    });
}
