(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('@angular/forms'), require('@angular/platform-browser'), require('rxjs'), require('rxjs/operators'), require('lodash.isequal'), require('escape-string-regexp')) :
    typeof define === 'function' && define.amd ? define('ngx-select-ex', ['exports', '@angular/core', '@angular/common', '@angular/forms', '@angular/platform-browser', 'rxjs', 'rxjs/operators', 'lodash.isequal', 'escape-string-regexp'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ngx-select-ex'] = {}, global.ng.core, global.ng.common, global.ng.forms, global.ng.platformBrowser, global.rxjs, global.rxjs.operators, global.isEqual, global.escapeString));
}(this, (function (exports, core, common, forms, platformBrowser, rxjs, operators, isEqual, escapeStringNs) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var isEqual__default = /*#__PURE__*/_interopDefaultLegacy(isEqual);
    var escapeStringNs__namespace = /*#__PURE__*/_interopNamespace(escapeStringNs);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var escapeString = escapeStringNs__namespace;
    var NgxSelectOption = /** @class */ (function () {
        function NgxSelectOption(value, text, disabled, data, _parent) {
            if (_parent === void 0) { _parent = null; }
            this.value = value;
            this.text = text;
            this.disabled = disabled;
            this.data = data;
            this._parent = _parent;
            this.type = 'option';
            this.cacheRenderedText = null;
        }
        Object.defineProperty(NgxSelectOption.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: false,
            configurable: true
        });
        NgxSelectOption.prototype.renderText = function (sanitizer, highlightText) {
            if (this.cacheHighlightText !== highlightText || this.cacheRenderedText === null) {
                this.cacheHighlightText = highlightText;
                if (this.cacheHighlightText) {
                    this.cacheRenderedText = sanitizer.bypassSecurityTrustHtml((this.text + '').replace(new RegExp(escapeString(this.cacheHighlightText), 'gi'), '<strong>$&</strong>'));
                }
                else {
                    this.cacheRenderedText = sanitizer.bypassSecurityTrustHtml(this.text);
                }
            }
            return this.cacheRenderedText;
        };
        return NgxSelectOption;
    }());
    var NgxSelectOptGroup = /** @class */ (function () {
        function NgxSelectOptGroup(label, options) {
            if (options === void 0) { options = []; }
            this.label = label;
            this.options = options;
            this.type = 'optgroup';
            this.filter(function () { return true; });
        }
        NgxSelectOptGroup.prototype.filter = function (callbackFn) {
            this.optionsFiltered = this.options.filter(function (option) { return callbackFn(option); });
        };
        return NgxSelectOptGroup;
    }());

    var NgxSelectOptionDirective = /** @class */ (function () {
        function NgxSelectOptionDirective(template) {
            this.template = template;
        }
        return NgxSelectOptionDirective;
    }());
    NgxSelectOptionDirective.decorators = [
        { type: core.Directive, args: [{ selector: '[ngx-select-option]' },] }
    ];
    NgxSelectOptionDirective.ctorParameters = function () { return [
        { type: core.TemplateRef }
    ]; };
    var NgxSelectOptionSelectedDirective = /** @class */ (function () {
        function NgxSelectOptionSelectedDirective(template) {
            this.template = template;
        }
        return NgxSelectOptionSelectedDirective;
    }());
    NgxSelectOptionSelectedDirective.decorators = [
        { type: core.Directive, args: [{ selector: '[ngx-select-option-selected]' },] }
    ];
    NgxSelectOptionSelectedDirective.ctorParameters = function () { return [
        { type: core.TemplateRef }
    ]; };
    var NgxSelectOptionNotFoundDirective = /** @class */ (function () {
        function NgxSelectOptionNotFoundDirective(template) {
            this.template = template;
        }
        return NgxSelectOptionNotFoundDirective;
    }());
    NgxSelectOptionNotFoundDirective.decorators = [
        { type: core.Directive, args: [{ selector: '[ngx-select-option-not-found]' },] }
    ];
    NgxSelectOptionNotFoundDirective.ctorParameters = function () { return [
        { type: core.TemplateRef }
    ]; };

    var escapeString$1 = escapeStringNs__namespace;
    var NGX_SELECT_OPTIONS = new core.InjectionToken('NGX_SELECT_OPTIONS');
    var ENavigation;
    (function (ENavigation) {
        ENavigation[ENavigation["first"] = 0] = "first";
        ENavigation[ENavigation["previous"] = 1] = "previous";
        ENavigation[ENavigation["next"] = 2] = "next";
        ENavigation[ENavigation["last"] = 3] = "last";
        ENavigation[ENavigation["firstSelected"] = 4] = "firstSelected";
        ENavigation[ENavigation["firstIfOptionActiveInvisible"] = 5] = "firstIfOptionActiveInvisible";
    })(ENavigation || (ENavigation = {}));
    function propertyExists(obj, propertyName) {
        return propertyName in obj;
    }
    var NgxSelectComponent = /** @class */ (function () {
        function NgxSelectComponent(iterableDiffers, sanitizer, cd, defaultOptions) {
            var _this = this;
            this.sanitizer = sanitizer;
            this.cd = cd;
            this.optionValueField = 'id';
            this.optionTextField = 'text';
            this.optGroupLabelField = 'label';
            this.optGroupOptionsField = 'options';
            this.multiple = false;
            this.allowClear = false;
            this.placeholder = '';
            this.noAutoComplete = false;
            this.disabled = false;
            this.defaultValue = [];
            this.autoSelectSingleOption = false;
            this.autoClearSearch = false;
            this.noResultsFound = 'No results found';
            this.size = 'default';
            this.autoActiveOnMouseEnter = true;
            this.showOptionNotFoundForEmptyItems = false;
            this.isFocused = false;
            this.keepSelectMenuOpened = false;
            this.autocomplete = 'off';
            this.dropDownMenuOtherClasses = '';
            this.noSanitize = false;
            this.keyCodeToRemoveSelected = 'Delete';
            this.keyCodeToOptionsOpen = ['Enter', 'NumpadEnter'];
            this.keyCodeToOptionsClose = 'Escape';
            this.keyCodeToOptionsSelect = ['Enter', 'NumpadEnter'];
            this.keyCodeToNavigateFirst = 'ArrowLeft';
            this.keyCodeToNavigatePrevious = 'ArrowUp';
            this.keyCodeToNavigateNext = 'ArrowDown';
            this.keyCodeToNavigateLast = 'ArrowRight';
            this.typed = new core.EventEmitter();
            this.focus = new core.EventEmitter();
            this.blur = new core.EventEmitter();
            this.open = new core.EventEmitter();
            this.close = new core.EventEmitter();
            this.select = new core.EventEmitter();
            this.remove = new core.EventEmitter();
            this.navigated = new core.EventEmitter();
            this.selectionChanges = new core.EventEmitter();
            this.optionsOpened = false;
            this.actualValue = [];
            this.subjOptions = new rxjs.BehaviorSubject([]);
            this.subjSearchText = new rxjs.BehaviorSubject('');
            this.subjOptionsSelected = new rxjs.BehaviorSubject([]);
            this.subjExternalValue = new rxjs.BehaviorSubject([]);
            this.subjDefaultValue = new rxjs.BehaviorSubject([]);
            this.subjRegisterOnChange = new rxjs.Subject();
            this._focusToInput = false;
            //////////// interface ControlValueAccessor ////////////
            this.onChange = function (v) { return v; };
            this.onTouched = function () { return null; };
            Object.assign(this, defaultOptions);
            // DIFFERS
            this.itemsDiffer = iterableDiffers.find([]).create(null);
            this.defaultValueDiffer = iterableDiffers.find([]).create(null);
            // OBSERVERS
            this.typed.subscribe(function (text) { return _this.subjSearchText.next(text); });
            this.subjOptionsSelected.subscribe(function (options) { return _this.selectionChanges.emit(options); });
            var cacheExternalValue;
            // Get actual value
            var subjActualValue = rxjs.combineLatest([
                rxjs.merge(this.subjExternalValue.pipe(operators.map(function (v) { return cacheExternalValue = v === null ? [] : [].concat(v); })), this.subjOptionsSelected.pipe(operators.map(function (options) { return options.map(function (o) { return o.value; }); }))),
                this.subjDefaultValue,
            ]).pipe(operators.map(function (_a) {
                var _b = __read(_a, 2), eVal = _b[0], dVal = _b[1];
                var newVal = isEqual__default['default'](eVal, dVal) ? [] : eVal;
                return newVal.length ? newVal : dVal;
            }), operators.distinctUntilChanged(function (x, y) { return isEqual__default['default'](x, y); }), operators.share());
            // Export actual value
            rxjs.combineLatest([subjActualValue, this.subjRegisterOnChange])
                .pipe(operators.map(function (_a) {
                var _b = __read(_a, 1), actualValue = _b[0];
                return actualValue;
            }))
                .subscribe(function (actualValue) {
                _this.actualValue = actualValue;
                if (!isEqual__default['default'](actualValue, cacheExternalValue)) {
                    cacheExternalValue = actualValue;
                    if (_this.multiple) {
                        _this.onChange(actualValue);
                    }
                    else {
                        _this.onChange(actualValue.length ? actualValue[0] : null);
                    }
                }
            });
            // Correct selected options when the options changed
            rxjs.combineLatest([
                this.subjOptions.pipe(operators.mergeMap(function (options) { return rxjs.from(options).pipe(operators.mergeMap(function (option) { return option instanceof NgxSelectOption
                    ? rxjs.of(option)
                    : (option instanceof NgxSelectOptGroup ? rxjs.from(option.options) : rxjs.EMPTY); }), operators.toArray()); })),
                subjActualValue,
            ]).pipe(operators.debounceTime(0) // For a case when optionsFlat, actualValue came at the same time
            ).subscribe(function (_a) {
                var _b = __read(_a, 2), optionsFlat = _b[0], actualValue = _b[1];
                var optionsSelected = [];
                actualValue.forEach(function (value) {
                    var selectedOption = optionsFlat.find(function (option) { return option.value === value; });
                    if (selectedOption) {
                        optionsSelected.push(selectedOption);
                    }
                });
                if (_this.keepSelectedItems) {
                    var optionValues_1 = optionsSelected.map(function (option) { return option.value; });
                    var keptSelectedOptions = _this.subjOptionsSelected.value
                        .filter(function (selOption) { return optionValues_1.indexOf(selOption.value) === -1; });
                    optionsSelected.push.apply(optionsSelected, __spread(keptSelectedOptions));
                }
                if (!isEqual__default['default'](optionsSelected, _this.subjOptionsSelected.value)) {
                    _this.subjOptionsSelected.next(optionsSelected);
                    _this.cd.markForCheck();
                }
            });
            // Ensure working filter by a search text
            rxjs.combineLatest([this.subjOptions, this.subjOptionsSelected, this.subjSearchText]).pipe(operators.map(function (_a) {
                var _b = __read(_a, 3), options = _b[0], selectedOptions = _b[1], search = _b[2];
                _this.optionsFiltered = _this.filterOptions(search, options, selectedOptions).map(function (option) {
                    if (option instanceof NgxSelectOption) {
                        option.highlightedText = _this.highlightOption(option);
                    }
                    else if (option instanceof NgxSelectOptGroup) {
                        option.options.map(function (subOption) {
                            subOption.highlightedText = _this.highlightOption(subOption);
                            return subOption;
                        });
                    }
                    return option;
                });
                _this.cacheOptionsFilteredFlat = null;
                _this.navigateOption(ENavigation.firstIfOptionActiveInvisible);
                _this.cd.markForCheck();
                return selectedOptions;
            }), operators.mergeMap(function (selectedOptions) { return _this.optionsFilteredFlat().pipe(operators.filter(function (flatOptions) { return _this.autoSelectSingleOption && flatOptions.length === 1 && !selectedOptions.length; })); })).subscribe(function (flatOptions) {
                _this.subjOptionsSelected.next(flatOptions);
                _this.cd.markForCheck();
            });
        }
        Object.defineProperty(NgxSelectComponent.prototype, "inputText", {
            /** @internal */
            get: function () {
                if (this.inputElRef && this.inputElRef.nativeElement) {
                    return this.inputElRef.nativeElement.value;
                }
                return '';
            },
            enumerable: false,
            configurable: true
        });
        NgxSelectComponent.prototype.setFormControlSize = function (otherClassNames, useFormControl) {
            if (otherClassNames === void 0) { otherClassNames = {}; }
            if (useFormControl === void 0) { useFormControl = true; }
            var formControlExtraClasses = useFormControl ? {
                'form-control-sm input-sm': this.size === 'small',
                'form-control-lg input-lg': this.size === 'large',
            } : {};
            return Object.assign(formControlExtraClasses, otherClassNames);
        };
        NgxSelectComponent.prototype.setBtnSize = function () {
            return { 'btn-sm': this.size === 'small', 'btn-lg': this.size === 'large' };
        };
        Object.defineProperty(NgxSelectComponent.prototype, "optionsSelected", {
            get: function () {
                return this.subjOptionsSelected.value;
            },
            enumerable: false,
            configurable: true
        });
        NgxSelectComponent.prototype.mainClicked = function (event) {
            event.clickedSelectComponent = this;
            if (!this.isFocused) {
                this.isFocused = true;
                this.focus.emit();
            }
        };
        NgxSelectComponent.prototype.documentClick = function (event) {
            if (event.clickedSelectComponent !== this) {
                if (this.optionsOpened) {
                    this.optionsClose();
                    this.cd.detectChanges(); // fix error because of delay between different events
                }
                if (this.isFocused) {
                    this.isFocused = false;
                    this.blur.emit();
                }
            }
        };
        NgxSelectComponent.prototype.optionsFilteredFlat = function () {
            var _this = this;
            if (this.cacheOptionsFilteredFlat) {
                return rxjs.of(this.cacheOptionsFilteredFlat);
            }
            return rxjs.from(this.optionsFiltered).pipe(operators.mergeMap(function (option) { return option instanceof NgxSelectOption ? rxjs.of(option) :
                (option instanceof NgxSelectOptGroup ? rxjs.from(option.optionsFiltered) : rxjs.EMPTY); }), operators.filter(function (optionsFilteredFlat) { return !optionsFilteredFlat.disabled; }), operators.toArray(), operators.tap(function (optionsFilteredFlat) { return _this.cacheOptionsFilteredFlat = optionsFilteredFlat; }));
        };
        NgxSelectComponent.prototype.navigateOption = function (navigation) {
            var _this = this;
            this.optionsFilteredFlat().pipe(operators.map(function (options) {
                var navigated = { index: -1, activeOption: null, filteredOptionList: options };
                var newActiveIdx;
                switch (navigation) {
                    case ENavigation.first:
                        navigated.index = 0;
                        break;
                    case ENavigation.previous:
                        newActiveIdx = options.indexOf(_this.optionActive) - 1;
                        navigated.index = newActiveIdx >= 0 ? newActiveIdx : options.length - 1;
                        break;
                    case ENavigation.next:
                        newActiveIdx = options.indexOf(_this.optionActive) + 1;
                        navigated.index = newActiveIdx < options.length ? newActiveIdx : 0;
                        break;
                    case ENavigation.last:
                        navigated.index = options.length - 1;
                        break;
                    case ENavigation.firstSelected:
                        if (_this.subjOptionsSelected.value.length) {
                            navigated.index = options.indexOf(_this.subjOptionsSelected.value[0]);
                        }
                        break;
                    case ENavigation.firstIfOptionActiveInvisible:
                        var idxOfOptionActive = -1;
                        if (_this.optionActive) {
                            idxOfOptionActive = options.indexOf(options.find(function (x) { return x.value === _this.optionActive.value; }));
                        }
                        navigated.index = idxOfOptionActive > 0 ? idxOfOptionActive : 0;
                        break;
                }
                navigated.activeOption = options[navigated.index];
                return navigated;
            })).subscribe(function (newNavigated) { return _this.optionActivate(newNavigated); });
        };
        NgxSelectComponent.prototype.ngDoCheck = function () {
            if (this.itemsDiffer.diff(this.items)) {
                this.subjOptions.next(this.buildOptions(this.items));
            }
            var defVal = this.defaultValue ? [].concat(this.defaultValue) : [];
            if (this.defaultValueDiffer.diff(defVal)) {
                this.subjDefaultValue.next(defVal);
            }
        };
        NgxSelectComponent.prototype.ngAfterContentChecked = function () {
            if (this._focusToInput && this.checkInputVisibility() && this.inputElRef &&
                this.inputElRef.nativeElement !== document.activeElement) {
                this._focusToInput = false;
                this.inputElRef.nativeElement.focus();
            }
            if (this.choiceMenuElRef) {
                var ulElement = this.choiceMenuElRef.nativeElement;
                var element = ulElement.querySelector('a.ngx-select__item_active.active');
                if (element && element.offsetHeight > 0) {
                    this.ensureVisibleElement(element);
                }
            }
        };
        NgxSelectComponent.prototype.ngOnDestroy = function () {
            this.cd.detach();
        };
        NgxSelectComponent.prototype.canClearNotMultiple = function () {
            return this.allowClear && !!this.subjOptionsSelected.value.length &&
                (!this.subjDefaultValue.value.length || this.subjDefaultValue.value[0] !== this.actualValue[0]);
        };
        NgxSelectComponent.prototype.focusToInput = function () {
            this._focusToInput = true;
        };
        NgxSelectComponent.prototype.inputKeyDown = function (event) {
            var keysForOpenedState = [].concat(this.keyCodeToOptionsSelect, this.keyCodeToNavigateFirst, this.keyCodeToNavigatePrevious, this.keyCodeToNavigateNext, this.keyCodeToNavigateLast);
            var keysForClosedState = [].concat(this.keyCodeToOptionsOpen, this.keyCodeToRemoveSelected);
            if (this.optionsOpened && keysForOpenedState.indexOf(event.code) !== -1) {
                event.preventDefault();
                event.stopPropagation();
                switch (event.code) {
                    case ([].concat(this.keyCodeToOptionsSelect).indexOf(event.code) + 1) && event.code:
                        this.optionSelect(this.optionActive);
                        this.navigateOption(ENavigation.next);
                        break;
                    case this.keyCodeToNavigateFirst:
                        this.navigateOption(ENavigation.first);
                        break;
                    case this.keyCodeToNavigatePrevious:
                        this.navigateOption(ENavigation.previous);
                        break;
                    case this.keyCodeToNavigateLast:
                        this.navigateOption(ENavigation.last);
                        break;
                    case this.keyCodeToNavigateNext:
                        this.navigateOption(ENavigation.next);
                        break;
                }
            }
            else if (!this.optionsOpened && keysForClosedState.indexOf(event.code) !== -1) {
                event.preventDefault();
                event.stopPropagation();
                switch (event.code) {
                    case ([].concat(this.keyCodeToOptionsOpen).indexOf(event.code) + 1) && event.code:
                        this.optionsOpen();
                        break;
                    case this.keyCodeToRemoveSelected:
                        if (this.multiple || this.canClearNotMultiple()) {
                            this.optionRemove(this.subjOptionsSelected.value[this.subjOptionsSelected.value.length - 1], event);
                        }
                        break;
                }
            }
        };
        NgxSelectComponent.prototype.trackByOption = function (index, option) {
            return option instanceof NgxSelectOption ? option.value :
                (option instanceof NgxSelectOptGroup ? option.label : option);
        };
        NgxSelectComponent.prototype.checkInputVisibility = function () {
            return (this.multiple === true) || (this.optionsOpened && !this.noAutoComplete);
        };
        /** @internal */
        NgxSelectComponent.prototype.inputKeyUp = function (value, event) {
            if (value === void 0) { value = ''; }
            if (event.code === this.keyCodeToOptionsClose) {
                this.optionsClose( /*true*/);
            }
            else if (this.optionsOpened && (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowDown'].indexOf(event.code) === -1) /*ignore arrows*/) {
                this.typed.emit(value);
            }
            else if (!this.optionsOpened && value) {
                this.optionsOpen(value);
            }
        };
        /** @internal */
        NgxSelectComponent.prototype.inputClick = function (value) {
            if (value === void 0) { value = ''; }
            if (!this.optionsOpened) {
                this.optionsOpen(value);
            }
        };
        /** @internal */
        NgxSelectComponent.prototype.sanitize = function (html) {
            if (this.noSanitize) {
                return html || null;
            }
            return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
        };
        /** @internal */
        NgxSelectComponent.prototype.highlightOption = function (option) {
            if (this.inputElRef) {
                return option.renderText(this.sanitizer, this.inputElRef.nativeElement.value);
            }
            return option.renderText(this.sanitizer, '');
        };
        /** @internal */
        NgxSelectComponent.prototype.optionSelect = function (option, event) {
            if (event === void 0) { event = null; }
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (option && !option.disabled) {
                this.subjOptionsSelected.next((this.multiple ? this.subjOptionsSelected.value : []).concat([option]));
                this.select.emit(option.value);
                if (!this.keepSelectMenuOpened) {
                    this.optionsClose( /*true*/);
                }
                this.onTouched();
            }
        };
        /** @internal */
        NgxSelectComponent.prototype.optionRemove = function (option, event) {
            if (!this.disabled && option) {
                event.stopPropagation();
                this.subjOptionsSelected.next((this.multiple ? this.subjOptionsSelected.value : []).filter(function (o) { return o !== option; }));
                this.remove.emit(option.value);
            }
        };
        /** @internal */
        NgxSelectComponent.prototype.optionActivate = function (navigated) {
            if ((this.optionActive !== navigated.activeOption) &&
                (!navigated.activeOption || !navigated.activeOption.disabled)) {
                if (this.optionActive) {
                    this.optionActive.active = false;
                }
                this.optionActive = navigated.activeOption;
                if (this.optionActive) {
                    this.optionActive.active = true;
                }
                this.navigated.emit(navigated);
                this.cd.detectChanges();
            }
        };
        /** @internal */
        NgxSelectComponent.prototype.onMouseEnter = function (navigated) {
            if (this.autoActiveOnMouseEnter) {
                this.optionActivate(navigated);
            }
        };
        NgxSelectComponent.prototype.filterOptions = function (search, options, selectedOptions) {
            var _this = this;
            var regExp = new RegExp(escapeString$1(search), 'i');
            var filterOption = function (option) {
                if (_this.searchCallback) {
                    return _this.searchCallback(search, option);
                }
                return (!search || regExp.test(option.text)) && (!_this.multiple || selectedOptions.indexOf(option) === -1);
            };
            return options.filter(function (option) {
                if (option instanceof NgxSelectOption) {
                    return filterOption(option);
                }
                else if (option instanceof NgxSelectOptGroup) {
                    var subOp = option;
                    subOp.filter(function (subOption) { return filterOption(subOption); });
                    return subOp.optionsFiltered.length;
                }
            });
        };
        NgxSelectComponent.prototype.ensureVisibleElement = function (element) {
            if (this.choiceMenuElRef && this.cacheElementOffsetTop !== element.offsetTop) {
                this.cacheElementOffsetTop = element.offsetTop;
                var container = this.choiceMenuElRef.nativeElement;
                if (this.cacheElementOffsetTop < container.scrollTop) {
                    container.scrollTop = this.cacheElementOffsetTop;
                }
                else if (this.cacheElementOffsetTop + element.offsetHeight > container.scrollTop + container.clientHeight) {
                    container.scrollTop = this.cacheElementOffsetTop + element.offsetHeight - container.clientHeight;
                }
            }
        };
        NgxSelectComponent.prototype.showChoiceMenu = function () {
            return this.optionsOpened && (!!this.subjOptions.value.length || this.showOptionNotFoundForEmptyItems);
        };
        NgxSelectComponent.prototype.optionsOpen = function (search) {
            if (search === void 0) { search = ''; }
            if (!this.disabled) {
                this.optionsOpened = true;
                this.subjSearchText.next(search);
                if (!this.multiple && this.subjOptionsSelected.value.length) {
                    this.navigateOption(ENavigation.firstSelected);
                }
                else {
                    this.navigateOption(ENavigation.first);
                }
                this.focusToInput();
                this.open.emit();
                this.cd.markForCheck();
            }
        };
        NgxSelectComponent.prototype.optionsClose = function ( /*focusToHost: boolean = false*/) {
            this.optionsOpened = false;
            // if (focusToHost) {
            //     const x = window.scrollX, y = window.scrollY;
            //     this.mainElRef.nativeElement.focus();
            //     window.scrollTo(x, y);
            // }
            this.close.emit();
            if (this.autoClearSearch && this.multiple && this.inputElRef) {
                this.inputElRef.nativeElement.value = null;
            }
        };
        NgxSelectComponent.prototype.buildOptions = function (data) {
            var _this = this;
            var result = [];
            if (Array.isArray(data)) {
                data.forEach(function (item) {
                    var isOptGroup = typeof item === 'object' && item !== null &&
                        propertyExists(item, _this.optGroupLabelField) && propertyExists(item, _this.optGroupOptionsField) &&
                        Array.isArray(item[_this.optGroupOptionsField]);
                    if (isOptGroup) {
                        var optGroup_1 = new NgxSelectOptGroup(item[_this.optGroupLabelField]);
                        item[_this.optGroupOptionsField].forEach(function (subOption) {
                            var opt = _this.buildOption(subOption, optGroup_1);
                            if (opt) {
                                optGroup_1.options.push(opt);
                            }
                        });
                        result.push(optGroup_1);
                    }
                    else {
                        var option = _this.buildOption(item, null);
                        if (option) {
                            result.push(option);
                        }
                    }
                });
            }
            return result;
        };
        NgxSelectComponent.prototype.buildOption = function (data, parent) {
            var value;
            var text;
            var disabled;
            if (typeof data === 'string' || typeof data === 'number') {
                value = text = data;
                disabled = false;
            }
            else if (typeof data === 'object' && data !== null &&
                (propertyExists(data, this.optionValueField) || propertyExists(data, this.optionTextField))) {
                value = propertyExists(data, this.optionValueField) ? data[this.optionValueField] : data[this.optionTextField];
                text = propertyExists(data, this.optionTextField) ? data[this.optionTextField] : data[this.optionValueField];
                disabled = propertyExists(data, 'disabled') ? data.disabled : false;
            }
            else {
                return null;
            }
            return new NgxSelectOption(value, text, disabled, data, parent);
        };
        NgxSelectComponent.prototype.writeValue = function (obj) {
            this.subjExternalValue.next(obj);
        };
        NgxSelectComponent.prototype.registerOnChange = function (fn) {
            this.onChange = fn;
            this.subjRegisterOnChange.next();
        };
        NgxSelectComponent.prototype.registerOnTouched = function (fn) {
            this.onTouched = fn;
        };
        NgxSelectComponent.prototype.setDisabledState = function (isDisabled) {
            this.disabled = isDisabled;
            this.cd.markForCheck();
        };
        return NgxSelectComponent;
    }());
    NgxSelectComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'ngx-select',
                    template: "<div #main [tabindex]=\"disabled? -1: 0\" class=\"ngx-select dropdown\"\n     [ngClass]=\"setFormControlSize({\n        'ngx-select_multiple form-control': multiple === true,\n        'open show': optionsOpened && optionsFiltered.length\n     }, multiple === true)\"\n     (click)=\"mainClicked($event)\" (focusin)=\"mainClicked($event)\"\n     (focus)=\"focusToInput()\" (keydown)=\"inputKeyDown($event)\">\n    <div [ngClass]=\"{ 'ngx-select__disabled': disabled}\"></div>\n\n    <!-- single selected item -->\n    <div class=\"ngx-select__selected\"\n         *ngIf=\"(multiple === false) && (!optionsOpened || noAutoComplete)\">\n        <div class=\"ngx-select__toggle btn form-control\" [ngClass]=\"setFormControlSize(setBtnSize())\"\n             (click)=\"optionsOpen()\">\n\n            <span *ngIf=\"!optionsSelected.length\" class=\"ngx-select__placeholder text-muted\">\n                <span [innerHtml]=\"placeholder\"></span>\n            </span>\n            <span *ngIf=\"optionsSelected.length\"\n                  class=\"ngx-select__selected-single pull-left float-left\"\n                  [ngClass]=\"{'ngx-select__allow-clear': allowClear}\">\n                <ng-container [ngTemplateOutlet]=\"templateSelectedOption || defaultTemplateOption\"\n                              [ngTemplateOutletContext]=\"{$implicit: optionsSelected[0], index: 0,\n                                                          text: sanitize(optionsSelected[0].text)}\">\n                </ng-container>\n            </span>\n            <span class=\"ngx-select__toggle-buttons\">\n                <a class=\"ngx-select__clear btn btn-sm btn-link\" *ngIf=\"canClearNotMultiple()\"\n                   [ngClass]=\"setBtnSize()\"\n                   (click)=\"optionRemove(optionsSelected[0], $event)\">\n                    <i class=\"ngx-select__clear-icon\"></i>\n                </a>\n                <i class=\"dropdown-toggle\"></i>\n                <i class=\"ngx-select__toggle-caret caret\"></i>\n            </span>\n        </div>\n    </div>\n\n    <!-- multiple selected items -->\n    <div class=\"ngx-select__selected\" *ngIf=\"multiple === true\" (click)=\"inputClick(inputElRef && inputElRef['value'])\">\n        <span *ngFor=\"let option of optionsSelected; trackBy: trackByOption; let idx = index\">\n            <span tabindex=\"-1\" [ngClass]=\"setBtnSize()\" (click)=\"$event.stopPropagation()\"\n                  class=\"ngx-select__selected-plural btn btn-default btn-secondary btn-sm btn-xs\">\n\n                <ng-container [ngTemplateOutlet]=\"templateSelectedOption || defaultTemplateOption\"\n                              [ngTemplateOutletContext]=\"{$implicit: option, index: idx, text: sanitize(option.text)}\">\n                </ng-container>\n\n                <a class=\"ngx-select__clear btn btn-sm btn-link pull-right float-right\" [ngClass]=\"setBtnSize()\"\n                   (click)=\"optionRemove(option, $event)\">\n                    <i class=\"ngx-select__clear-icon\"></i>\n                </a>\n            </span>\n        </span>\n    </div>\n\n    <!-- live search an item from the list -->\n    <input #input type=\"text\" class=\"ngx-select__search form-control\" [ngClass]=\"setFormControlSize()\"\n           *ngIf=\"checkInputVisibility()\"\n           [tabindex]=\"multiple === false? -1: 0\"\n           (keyup)=\"inputKeyUp(input.value, $event)\"\n           [disabled]=\"disabled\"\n           [placeholder]=\"optionsSelected.length? '': placeholder\"\n           (click)=\"inputClick(input.value)\"\n           [autocomplete]=\"autocomplete\"\n           autocorrect=\"off\"\n           autocapitalize=\"off\"\n           spellcheck=\"false\"\n           role=\"combobox\">\n\n    <!-- options template -->\n    <ul #choiceMenu role=\"menu\" *ngIf=\"isFocused\" class=\"ngx-select__choices dropdown-menu\"\n        [ngClass]=\"dropDownMenuOtherClasses\"\n        [class.show]=\"showChoiceMenu()\">\n        <li class=\"ngx-select__item-group\" role=\"menuitem\"\n            *ngFor=\"let opt of optionsFiltered; trackBy: trackByOption; let idxGroup=index\">\n            <div class=\"divider dropdown-divider\" *ngIf=\"opt.type === 'optgroup' && (idxGroup > 0)\"></div>\n            <div class=\"dropdown-header\" *ngIf=\"opt.type === 'optgroup'\">{{opt.label}}</div>\n\n            <a href=\"#\" #choiceItem class=\"ngx-select__item dropdown-item\"\n               *ngFor=\"let option of (opt.optionsFiltered || [opt]); trackBy: trackByOption; let idxOption = index\"\n               [ngClass]=\"{\n                    'ngx-select__item_active active': option.active,\n                    'ngx-select__item_disabled disabled': option.disabled\n               }\"\n               (mouseenter)=\"onMouseEnter({\n                    activeOption: option,\n                    filteredOptionList: optionsFiltered,\n                    index: optionsFiltered.indexOf(option)\n               })\"\n               (click)=\"optionSelect(option, $event)\">\n                <ng-container [ngTemplateOutlet]=\"templateOption || defaultTemplateOption\"\n                              [ngTemplateOutletContext]=\"{$implicit: option, text: option.highlightedText,\n                              index: idxGroup, subIndex: idxOption}\"></ng-container>\n            </a>\n        </li>\n        <li class=\"ngx-select__item ngx-select__item_no-found dropdown-header\" *ngIf=\"!optionsFiltered.length\">\n            <ng-container [ngTemplateOutlet]=\"templateOptionNotFound || defaultTemplateOptionNotFound\"\n                          [ngTemplateOutletContext]=\"{$implicit: inputText}\"></ng-container>\n        </li>\n    </ul>\n\n    <!--Default templates-->\n    <ng-template #defaultTemplateOption let-text=\"text\">\n        <span [innerHtml]=\"text\"></span>\n    </ng-template>\n\n    <ng-template #defaultTemplateOptionNotFound>\n        {{noResultsFound}}\n    </ng-template>\n\n</div>\n",
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    providers: [
                        {
                            provide: forms.NG_VALUE_ACCESSOR,
                            useExisting: core.forwardRef(function () { return NgxSelectComponent; }),
                            multi: true,
                        },
                    ],
                    styles: [".ngx-select_multiple{height:auto;padding:3px 3px 0}.ngx-select_multiple .ngx-select__search{background-color:transparent!important;border:none;box-shadow:none;height:1.6666em;margin-bottom:3px;outline:none;padding:0}.ngx-select__disabled{background-color:#eceeef;border-radius:4px;cursor:not-allowed;height:100%;left:0;opacity:.6;position:absolute;top:0;width:100%;z-index:5}.ngx-select__toggle{align-items:stretch;background-color:#fff;border-color:#ccc;color:#333;display:inline-flex;justify-content:space-between;outline:0;position:relative;text-align:left!important}.ngx-select__toggle:hover{background-color:#e6e6e6;border-color:#adadad;color:#333}.ngx-select__toggle-buttons{align-items:center;display:flex;flex-shrink:0}.ngx-select__toggle-caret{height:10px;margin-top:-2px;position:absolute;right:10px;top:50%}.ngx-select__placeholder{float:left;max-width:100%;overflow:hidden;text-overflow:ellipsis}.ngx-select__clear{border:none;margin-right:10px;padding:0}.ngx-select_multiple .ngx-select__clear{color:#000;line-height:normal;margin-left:5px;margin-right:0;opacity:.5}.ngx-select__clear-icon{cursor:pointer;display:inline-block;font-size:inherit;height:.75em;padding:0;position:relative;width:1em}.ngx-select__clear-icon:after,.ngx-select__clear-icon:before{border-top:3px solid;content:\"\";left:0;margin-top:-1px;position:absolute;top:50%;width:100%}.ngx-select__clear-icon:before{transform:rotate(45deg)}.ngx-select__clear-icon:after{transform:rotate(-45deg)}.ngx-select__choices{height:auto;margin-top:0;max-height:200px;overflow-x:hidden;position:absolute;width:100%}.ngx-select_multiple .ngx-select__choices{margin-top:1px}.ngx-select__item{clear:both;cursor:pointer;display:block;font-weight:400;line-height:1.42857143;padding:3px 20px;text-decoration:none;white-space:nowrap}.ngx-select__item_disabled,.ngx-select__item_no-found{cursor:default}.ngx-select__item_active{background-color:#428bca;color:#fff;outline:0}.ngx-select__selected-plural,.ngx-select__selected-single{align-items:center;display:inline-flex;overflow:hidden}.ngx-select__selected-plural span,.ngx-select__selected-single span{overflow:hidden;text-overflow:ellipsis}.ngx-select__selected-plural{margin:0 3px 3px 0;outline:0}.input-group>.dropdown{position:static}"]
                },] }
    ];
    NgxSelectComponent.ctorParameters = function () { return [
        { type: core.IterableDiffers },
        { type: platformBrowser.DomSanitizer },
        { type: core.ChangeDetectorRef },
        { type: undefined, decorators: [{ type: core.Inject, args: [NGX_SELECT_OPTIONS,] }, { type: core.Optional }] }
    ]; };
    NgxSelectComponent.propDecorators = {
        items: [{ type: core.Input }],
        optionValueField: [{ type: core.Input }],
        optionTextField: [{ type: core.Input }],
        optGroupLabelField: [{ type: core.Input }],
        optGroupOptionsField: [{ type: core.Input }],
        multiple: [{ type: core.Input }],
        allowClear: [{ type: core.Input }],
        placeholder: [{ type: core.Input }],
        noAutoComplete: [{ type: core.Input }],
        disabled: [{ type: core.Input }],
        defaultValue: [{ type: core.Input }],
        autoSelectSingleOption: [{ type: core.Input }],
        autoClearSearch: [{ type: core.Input }],
        noResultsFound: [{ type: core.Input }],
        keepSelectedItems: [{ type: core.Input }],
        size: [{ type: core.Input }],
        searchCallback: [{ type: core.Input }],
        autoActiveOnMouseEnter: [{ type: core.Input }],
        showOptionNotFoundForEmptyItems: [{ type: core.Input }],
        isFocused: [{ type: core.Input }],
        keepSelectMenuOpened: [{ type: core.Input }],
        autocomplete: [{ type: core.Input }],
        dropDownMenuOtherClasses: [{ type: core.Input }],
        noSanitize: [{ type: core.Input }],
        typed: [{ type: core.Output }],
        focus: [{ type: core.Output }],
        blur: [{ type: core.Output }],
        open: [{ type: core.Output }],
        close: [{ type: core.Output }],
        select: [{ type: core.Output }],
        remove: [{ type: core.Output }],
        navigated: [{ type: core.Output }],
        selectionChanges: [{ type: core.Output }],
        mainElRef: [{ type: core.ViewChild, args: ['main', { static: true },] }],
        inputElRef: [{ type: core.ViewChild, args: ['input',] }],
        choiceMenuElRef: [{ type: core.ViewChild, args: ['choiceMenu',] }],
        templateOption: [{ type: core.ContentChild, args: [NgxSelectOptionDirective, { read: core.TemplateRef, static: true },] }],
        templateSelectedOption: [{ type: core.ContentChild, args: [NgxSelectOptionSelectedDirective, { read: core.TemplateRef, static: true },] }],
        templateOptionNotFound: [{ type: core.ContentChild, args: [NgxSelectOptionNotFoundDirective, { read: core.TemplateRef, static: true },] }],
        documentClick: [{ type: core.HostListener, args: ['document:focusin', ['$event'],] }, { type: core.HostListener, args: ['document:click', ['$event'],] }]
    };

    var NgxSelectModule = /** @class */ (function () {
        function NgxSelectModule() {
        }
        NgxSelectModule.forRoot = function (options) {
            return {
                ngModule: NgxSelectModule,
                providers: [{ provide: NGX_SELECT_OPTIONS, useValue: options }],
            };
        };
        return NgxSelectModule;
    }());
    NgxSelectModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule,
                    ],
                    declarations: [NgxSelectComponent,
                        NgxSelectOptionDirective, NgxSelectOptionSelectedDirective, NgxSelectOptionNotFoundDirective,
                    ],
                    exports: [NgxSelectComponent,
                        NgxSelectOptionDirective, NgxSelectOptionSelectedDirective, NgxSelectOptionNotFoundDirective,
                    ],
                },] }
    ];

    /**
     * Generated bundle index. Do not edit.
     */

    exports.NGX_SELECT_OPTIONS = NGX_SELECT_OPTIONS;
    exports.NgxSelectComponent = NgxSelectComponent;
    exports.NgxSelectModule = NgxSelectModule;
    exports.NgxSelectOptGroup = NgxSelectOptGroup;
    exports.NgxSelectOption = NgxSelectOption;
    exports.NgxSelectOptionDirective = NgxSelectOptionDirective;
    exports.NgxSelectOptionNotFoundDirective = NgxSelectOptionNotFoundDirective;
    exports.NgxSelectOptionSelectedDirective = NgxSelectOptionSelectedDirective;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-select-ex.umd.js.map
