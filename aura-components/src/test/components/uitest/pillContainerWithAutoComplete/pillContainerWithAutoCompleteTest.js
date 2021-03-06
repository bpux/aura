/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    PILLS: [{id:'pill01',label:"Test Pill 01"},{id:'pill02',label:"Test Pill 02"},{id:'pill03',label:"Test Pill 03"}],
    browsers: ["GOOGLECHROME", "IPHONE", "IPAD", "FIREFOX", "IE9", "IE10", "SAFARI", "ANDROID_PHONE", "ANDROID_TABLET"],
    doNotWrapInAuraRun: true,
    
    ENTER_KEY: 13,

    testEnterCreatesPill: {
        test: function (cmp) {
            this._inputPill(this._getInput(cmp), this.PILLS[0].label);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
        }
    },

    testEnterWithNoTextDoesNotCreatePill: {
        test: function (cmp) {
            this._fireKeydownEvent(this._getInput(cmp), this.ENTER_KEY);
            $A.test.assertEquals(0, $A.test.select(".pill").length, "Pill should not have been created");
        }
    },

    testEnterClearsInput: {
        test: function (cmp) {
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals(0, textInput.getElement().value.length, "input should be empty");
        }
    },

    testEnterWithDuplicateTextDoesNotCreatePill: {
        test: function (cmp) {
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "There should only be one pill");
        }
    },

    testFocusKeptAfterItemInput: {
        test: function (cmp) {
            var textInput = this._getInput(cmp);
            textInput.getElement().focus();
            this._inputPill(textInput, this.PILLS[0].label);
            $A.test.assertEquals(document.activeElement, textInput.getElement(), "input should be focused");
        }
    },

    BACKSPACE_KEY: 8,
    testBackspaceOnEmpty: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);

            var firstPill = pillContainer.find("pill");
            $A.test.assertEquals(document.activeElement, firstPill.getElement(), "pill should be focused");
        }
    },

    testFocusOnInputAfterDelete: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);

            var firstPill = pillContainer.find("pill");
            this._fireKeydownEvent(firstPill, this.BACKSPACE_KEY);

            $A.test.addWaitForWithFailureMessage(true, function() {
                return document.activeElement === textInput.getElement();
            }, "input should be focused");
        }
    },

    testFocusOnPillAfterDelete: {
        test: function (cmp) {
            var pillContainer = cmp.find("pillContainer");
            var textInput = this._getInput(cmp);
            this._inputPill(textInput, this.PILLS[0].label);
            this._inputPill(textInput, this.PILLS[1].label);

            this._fireKeydownEvent(textInput, this.BACKSPACE_KEY);

            var secondPill = pillContainer.find("pill")[1];
            this._fireKeydownEvent(secondPill, this.BACKSPACE_KEY);


            $A.test.addWaitForWithFailureMessage(true, function() {
                var firstPill = pillContainer.find("pill")[0];
                return document.activeElement === firstPill.getElement();
            }, "first pill should be focused");
        }
    },

    DOWNARROW_KEY: 40,
    testEnterOnAutoCompleteItemCreatesPill: {
        test: function (cmp) {
            this._createPillByAutoComplete(cmp);
            $A.test.assertEquals(1, $A.test.select(".pill").length, "Pill was not created");
            $A.test.assertTrue($A.test.select(".pill")[0].innerText.indexOf(this.PILLS[0].label) > -1, "The wrong pill was created");
        }
    },

    testEnterOnAutoCompleteItemClearsInput: {
        test: function (cmp) {
            var textInput = this._createPillByAutoComplete(cmp);
            $A.test.assertEquals(0, textInput.getElement().value.length, "input should be empty");
        }
    },

    testEnterOnAutoCompleteItemHidesList: {
        test: function (cmp) {
            this._createPillByAutoComplete(cmp);
            var list = cmp.find("autocomplete").getSuper().find("list");
            $A.test.assertFalse(list.get("v.visible"), "list should be hidden");
        }
    },

    testAllowNewFalse: {
        test: function (cmp) {
            cmp.find("autocomplete").set("v.allowNew", false);
            this._inputPill(this._getInput(cmp), this.PILLS[2].label);
            $A.test.assertEquals(0, $A.test.select(".pill").length, "Pill should not have been created");
        }
    },

    testIconExistsInPill: {
        test: function (cmp) {
            this._createPillByAutoComplete(cmp);
            $A.test.assertEquals(1, $A.test.select(".pillIcon").length, "Pill icon is not present");
        }
    },

    _getInput: function(cmp) {
        return cmp.find("autocomplete").getSuper().find("input");
    },

    _fireKeydownEvent: function(cmp, keycode) {
        cmp.getEvent("keydown").setParams({
            keyCode: keycode,
            domEvent: {
                type: "keydown",
                preventDefault: function(){}
            }
        }).fire();
    },

    _inputPill: function(textInput, text) {
        textInput.set("v.value", text);
        this._fireKeydownEvent(textInput, this.ENTER_KEY);
    },

    _fireInputchange: function(cmp, value) {
        var inputChangeEvt = cmp.get("e.inputChange");
        if (inputChangeEvt) {
            inputChangeEvt.setParams({
                value: value
            });
            inputChangeEvt.fire();
        }
    },

    _createPillByAutoComplete: function (cmp) {
        var textInput = this._getInput(cmp);
        var autocomplete = cmp.find("autocomplete");
        var value = this.PILLS[0].label.substring(0, 4);
        this._getInput(cmp).set("v.value", value);
        this._fireInputchange(autocomplete, value);

        this._fireKeydownEvent(textInput, this.DOWNARROW_KEY);
        this._fireKeydownEvent(textInput, this.ENTER_KEY);
        return textInput;
    }

})