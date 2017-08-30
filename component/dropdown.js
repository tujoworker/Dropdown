/**
 * TH Dropdown Component
 * Written in Vanilla JavaScript
 * JavaScript is not needed to visualise the list, but to get a value selection function, You better bind the HTML to javascript
 *
 * @author Tobias Høegh <tobias@tujo.no>
 * @copyright 2017 tujo ANS
 */

var THDropdown = (function(document) {
    function DD(selectorName) {
        this._callbacks = [];

        this.renderHTML(selectorName);
        this.addListeners();
    }

    DD.prototype.renderHTML = function(selectorName) {
        this.rootEl = document.querySelectorAll(selectorName)[0];

        this.inputEl = this.rootEl.querySelectorAll('input:first-of-type')[0];
        this.buttonEl = this.rootEl.querySelectorAll('button:first-of-type')[0];
        //if there is an label, process it as well
        this.labelEl = this.rootEl.querySelectorAll('label:first-of-type')[0];
        this.ulEl = this.rootEl.querySelectorAll('ul:first-of-type')[0];
        this.listEls = this.rootEl.querySelectorAll(
            'ul:first-of-type li:not(.th-separator)'
        );

        this.value = this.inputEl.getAttribute('value');

        //prepare the HTML to make it valid
        if (!this.buttonEl) {
            this.ulEl.parentNode.insertBefore(
                (this.buttonEl = document.createElement('button')),
                this.ulEl.nextSibling
            );
        }
        if (!this.inputEl) {
            this.buttonEl.parentNode.insertBefore(
                (this.inputEl = document.createElement('input')),
                this.buttonEl.nextSibling
            );
        }
        if (!this.inputEl.hasAttribute('type')) {
            this.inputEl.setAttribute('type', 'checkbox');
        }
        this.id = 'th-dropdown-' + String(Math.round(Math.random() * 9999));
        this.inputEl.setAttribute('id', this.id);
        this.inputEl.setAttribute('hidden', 'hidden');
        this.inputEl.setAttribute('aria-label', 'Option Menu');
        this.buttonEl.setAttribute('hidden', 'hidden');
        this.buttonEl.setAttribute('tabindex', '-1');
        if (this.labelEl) this.labelEl.setAttribute('for', this.id);

        //prepare some values, if not set manually
        try {
            // console.log('this.inputEl', this.inputEl);
            if (String(this.buttonEl.innerHTML).length === 0) {
                if (String(this.value).length > 0) {
                    for (var i = 0, l = this.listEls.length; i < l; ++i) {
                        if (
                            String(
                                this.listEls[i].getAttribute('data-value')
                            ) === String(this.value)
                        ) {
                            this.buttonEl.innerHTML = this.listEls[i].innerHTML;
                            this.value = newValue;
                            break;
                        }
                    }
                } else {
                    this.buttonEl.innerHTML = this.listEls[0].innerHTML;
                }
                // this.listEls = this.rootEl.querySelectorAll(
                //     'ul:first-of-type li:not(.th-separator)'
                // )
            }
        } catch (e) {}
    };

    DD.prototype.getValue = function() {
        return this.value;
    };

    DD.prototype.getContent = function() {
        return this.buttonEl.innerHTML;
    };

    DD.prototype.setValue = function(listEl) {
        var newValue = listEl.getAttribute('data-value');
        var newContent = listEl.innerHTML;
        this.inputEl.setAttribute('value', newValue);
        this.inputEl.checked = false;
        this.buttonEl.innerHTML = newContent;
        this.value = newValue;

        console.log('newValue', newValue);

        for (var i = 0, l = this._callbacks.length; i < l; ++i) {
            if (typeof this._callbacks[i] === 'function') {
                this._callbacks[i].apply(this, [newValue, newContent]);
            }
        }
    };

    DD.prototype.addListeners = function() {
        var root = this;

        DD.prototype.clickListener = function(e) {
            // console.log('click checked', this.hasAttribute('checked'));
            if (!this.checked) {
                this.isClick = true;
            }
            // console.log(document.getElementsByClassName('uk-dropdown')[0]);
            // var style = document.getElementsByClassName('th-dropdown')[0].style;
            // style.display = 'none';
            // if (style.display === 'block') {
            // } else {
            //     style.display = 'block';
            // }
            // var attribute = this.getAttribute("data-myattribute");
            // alert(attribute);
        };

        DD.prototype.focusListener = function(e) {
            console.log('root id', root.id);
            // console.log('focus checked', this.checked);
            if (!this.checked && !this.isClick) {
                this.checked = true;
            }

            for (var i = 0, l = root.listEls.length; i < l; ++i) {
                root.listEls[i].removeAttribute('class', 'selected');
            }

            for (var i = 0, l = root.listEls.length; i < l; ++i) {
                if (
                    root.value === null ||
                    root.value === root.listEls[i].getAttribute('data-value')
                ) {
                    root.listEls[i].setAttribute('class', 'selected');
                    break;
                }
            }
        };

        DD.prototype.blurListener = function(e) {
            // console.log('blur checked', this.hasAttribute('checked'));
            var self = this;
            setTimeout(function() {
                try {
                    if (self.checked) {
                        self.checked = false;
                    }
                    if (self.isClick) {
                        delete self.isClick;
                    }
                } catch (e) {}
            }, 100);
        };

        DD.prototype.keydownListener = function(e) {
            //walk thou all list elements, and process them
            for (var i = 0, n = -1, l = root.listEls.length; i < l; ++i) {
                //mark prev og next as selected
                if (/selected/.test(root.listEls[i].getAttribute('class'))) {
                    //up
                    if (e.which === 38) {
                        n = i === 0 ? l - 1 : i - 1;
                    }
                    //down
                    if (e.which === 40) {
                        n = i > l - 2 ? 0 : i + 1;
                    }
                    if (n > -1) {
                        root.listEls[n].setAttribute('class', 'selected');
                        root.listEls[i].removeAttribute('class', 'selected');
                    }
                    break;
                }
            }

            switch (e.which) {
                case 13: //enter
                    if (!this.checked) {
                        this.checked = true;
                    } else {
                        root.setValue(
                            root.rootEl.querySelectorAll(
                                'li:not(.th-separator).selected'
                            )[0]
                        );
                        // root.inputEl.blur();//better solution to keep the focus, and only change checked
                        this.checked = false;
                    }
                    break;
            }
        };

        DD.prototype.listListener = function(e) {
            root.setValue(this);
        };

        //add all events
        try {
            this.inputEl.addEventListener(
                'mousedown',
                this.clickListener,
                false
            );
            this.inputEl.addEventListener('focus', this.focusListener, false);
            this.inputEl.addEventListener('blur', this.blurListener, false);
            this.inputEl.addEventListener('keydown', this.keydownListener);

            for (var i = 0, l = this.listEls.length; i < l; ++i) {
                this.listEls[i].addEventListener(
                    'mousedown',
                    this.listListener
                );
            }
        } catch (e) {}
    };

    DD.prototype.onOptionChange = function(callback) {
        this._callbacks.push(callback);
    };

    DD.prototype.cleanup = function() {
        //add all events
        try {
            inputEl.removeEventListener('mousedown', this.clickListener, false);
            inputEl.removeEventListener('focus', this.focusListener, false);
            inputEl.removeEventListener('blur', this.blurListener, false);
            inputEl.removeEventListener('keydown', this.keydownListener);
            // rootEl.querySelectorAll('li:not(.th-separator)').forEeach(function() {});

            for (var i = 0, l = listEls.length; i < l; ++i) {
                listEls[i].removeEventListener('mousedown', this.listListener);
            }
        } catch (e) {}
    };

    return DD;
})(document);
