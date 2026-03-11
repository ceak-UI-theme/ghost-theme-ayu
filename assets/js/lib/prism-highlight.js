function highlightPostCodeBlocks(root) {
    'use strict';

    var scope = root || document;
    if (!scope || !scope.querySelectorAll) {
        return;
    }

    if (!document.body || !document.body.classList.contains('post-template')) {
        return;
    }

    if (typeof Prism === 'undefined' || !Prism || !Prism.highlightElement) {
        return;
    }

    var aliases = {
        shell: 'bash',
        sh: 'bash',
        zsh: 'bash',
        js: 'javascript',
        ts: 'typescript',
        yml: 'yaml',
        text: 'none',
        plaintext: 'none',
        plain: 'none'
    };

    var codeNodes = Array.prototype.slice.call(scope.querySelectorAll('.post-content pre > code'));
    codeNodes.forEach(function (codeNode) {
        if (codeNode.getAttribute('data-prism-processed') === 'true') {
            return;
        }

        var classNames = (codeNode.className || '').split(/\s+/);
        var languageClass = classNames.find(function (name) {
            return /^language-/i.test(name);
        });

        if (languageClass) {
            var language = languageClass.replace(/^language-/i, '').toLowerCase();
            var normalized = aliases[language] || language;
            if (normalized !== language) {
                codeNode.classList.remove(languageClass);
                codeNode.classList.add('language-' + normalized);
            }

            if (normalized === 'none' || normalized === 'code') {
                codeNode.setAttribute('data-prism-processed', 'true');
                return;
            }
        }

        Prism.highlightElement(codeNode, false);
        codeNode.setAttribute('data-prism-processed', 'true');
    });
}
