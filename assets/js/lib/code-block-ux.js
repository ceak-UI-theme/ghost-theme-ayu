function enhancePostCodeBlocks(root) {
    'use strict';

    var scope = root || document;
    if (!scope || !scope.querySelectorAll) {
        return;
    }

    if (!document.body || !document.body.classList.contains('post-template')) {
        return;
    }

    var codeBlocks = Array.prototype.slice.call(scope.querySelectorAll('.post-content pre > code'));
    if (!codeBlocks.length) {
        return;
    }

    function normalizeLanguage(rawLanguage) {
        var language = String(rawLanguage || '').toLowerCase().trim();
        if (!language) {
            return 'code';
        }

        if (language === 'bash' || language === 'shell' || language === 'sh' || language === 'zsh') {
            return 'bash';
        }
        if (language === 'javascript' || language === 'js' || language === 'node') {
            return 'javascript';
        }
        if (language === 'typescript' || language === 'ts') {
            return 'typescript';
        }
        if (language === 'yml') {
            return 'yaml';
        }
        if (language === 'plaintext' || language === 'text' || language === 'plain' || language === 'none' || language === 'nohighlight') {
            return 'code';
        }

        return language;
    }

    function detectLanguage(codeNode) {
        var classNames = (codeNode.className || '').split(/\s+/);
        var languageClass = classNames.find(function (name) {
            return /^language-/i.test(name);
        });

        if (!languageClass) {
            return 'code';
        }

        return normalizeLanguage(languageClass.replace(/^language-/i, ''));
    }

    function getLineCount(codeText) {
        if (!codeText) {
            return 0;
        }

        return String(codeText).replace(/\r\n/g, '\n').split('\n').length;
    }

    function copyTextToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise(function (resolve, reject) {
            try {
                var textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.setAttribute('readonly', '');
                textArea.style.position = 'fixed';
                textArea.style.top = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                var copied = document.execCommand('copy');
                textArea.remove();
                if (!copied) {
                    reject(new Error('copy command failed'));
                    return;
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    codeBlocks.forEach(function (codeNode, index) {
        var pre = codeNode.parentElement;
        if (!pre || pre.tagName !== 'PRE') {
            return;
        }
        if (pre.closest('.code-block')) {
            return;
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'code-block';
        wrapper.setAttribute('data-code-block-enhanced', 'true');
        wrapper.setAttribute('data-code-block-id', String(index));

        var header = document.createElement('div');
        header.className = 'code-block__header';

        var languageBadge = document.createElement('span');
        languageBadge.className = 'code-block__lang';
        languageBadge.textContent = detectLanguage(codeNode);

        var copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'code-block__copy';
        copyButton.setAttribute('aria-label', 'Copy code');
        copyButton.textContent = 'Copy';

        header.appendChild(languageBadge);
        header.appendChild(copyButton);

        var body = document.createElement('div');
        body.className = 'code-block__body';

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(body);
        body.appendChild(pre);

        var codeText = codeNode.textContent || '';
        var lineCount = getLineCount(codeText);
        var canCollapse = lineCount > 30;
        var toggleButton = null;
        var collapsedHeight = 0;

        if (canCollapse) {
            var computed = window.getComputedStyle(pre);
            var lineHeight = parseFloat(computed.lineHeight) || 24;
            var paddingTop = parseFloat(computed.paddingTop) || 0;
            var paddingBottom = parseFloat(computed.paddingBottom) || 0;
            collapsedHeight = (lineHeight * 30) + paddingTop + paddingBottom;

            wrapper.classList.add('is-collapsible', 'is-collapsed');
            body.style.maxHeight = collapsedHeight + 'px';
            body.style.overflow = 'hidden';

            toggleButton = document.createElement('button');
            toggleButton.type = 'button';
            toggleButton.className = 'code-block__toggle';
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.textContent = 'Show more';
            wrapper.appendChild(toggleButton);

            toggleButton.addEventListener('click', function () {
                var isCollapsed = wrapper.classList.contains('is-collapsed');
                wrapper.classList.toggle('is-collapsed', !isCollapsed);
                toggleButton.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
                toggleButton.textContent = isCollapsed ? 'Show less' : 'Show more';
                body.style.maxHeight = isCollapsed ? 'none' : collapsedHeight + 'px';
            });
        }

        copyButton.addEventListener('click', function () {
            copyTextToClipboard(codeText).then(function () {
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('is-copied');
                window.setTimeout(function () {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('is-copied');
                }, 1400);
            }).catch(function () {
                copyButton.textContent = 'Failed';
                copyButton.classList.add('is-failed');
                window.setTimeout(function () {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('is-failed');
                }, 1400);
            });
        });
    });
}
