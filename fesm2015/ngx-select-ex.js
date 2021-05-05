import { Directive, TemplateRef, InjectionToken, EventEmitter, Component, ChangeDetectionStrategy, forwardRef, IterableDiffers, ChangeDetectorRef, Inject, Optional, Input, Output, ViewChild, ContentChild, HostListener, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Subject, combineLatest, merge, from, of, EMPTY } from 'rxjs';
import { map, distinctUntilChanged, share, mergeMap, toArray, debounceTime, filter, tap } from 'rxjs/operators';
import isEqual from 'lodash.isequal';
import * as escapeStringNs from 'escape-string-regexp';

const escapeString = escapeStringNs;
class NgxSelectOption {
    constructor(value, text, disabled, data, _parent = null) {
        this.value = value;
        this.text = text;
        this.disabled = disabled;
        this.data = data;
        this._parent = _parent;
        this.type = 'option';
        this.cacheRenderedText = null;
    }
    get parent() {
        return this._parent;
    }
    renderText(sanitizer, highlightText) {
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
    }
}
class NgxSelectOptGroup {
    constructor(label, options = []) {
        this.label = label;
        this.options = options;
        this.type = 'optgroup';
        this.filter(() => true);
    }
    filter(callbackFn) {
        this.optionsFiltered = this.options.filter((option) => callbackFn(option));
    }
}

class NgxSelectOptionDirective {
    constructor(template) {
        this.template = template;
    }
}
NgxSelectOptionDirective.decorators = [
    { type: Directive, args: [{ selector: '[ngx-select-option]' },] }
];
NgxSelectOptionDirective.ctorParameters = () => [
    { type: TemplateRef }
];
class NgxSelectOptionSelectedDirective {
    constructor(template) {
        this.template = template;
    }
}
NgxSelectOptionSelectedDirective.decorators = [
    { type: Directive, args: [{ selector: '[ngx-select-option-selected]' },] }
];
NgxSelectOptionSelectedDirective.ctorParameters = () => [
    { type: TemplateRef }
];
class NgxSelectOptionNotFoundDirective {
    constructor(template) {
        this.template = template;
    }
}
NgxSelectOptionNotFoundDirective.decorators = [
    { type: Directive, args: [{ selector: '[ngx-select-option-not-found]' },] }
];
NgxSelectOptionNotFoundDirective.ctorParameters = () => [
    { type: TemplateRef }
];

const escapeString$1 = escapeStringNs;
const NGX_SELECT_OPTIONS = new InjectionToken('NGX_SELECT_OPTIONS');
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
class NgxSelectComponent {
    constructor(iterableDiffers, sanitizer, cd, defaultOptions) {
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
        this.typed = new EventEmitter();
        this.focus = new EventEmitter();
        this.blur = new EventEmitter();
        this.open = new EventEmitter();
        this.close = new EventEmitter();
        this.select = new EventEmitter();
        this.remove = new EventEmitter();
        this.navigated = new EventEmitter();
        this.selectionChanges = new EventEmitter();
        this.optionsOpened = false;
        this.actualValue = [];
        this.subjOptions = new BehaviorSubject([]);
        this.subjSearchText = new BehaviorSubject('');
        this.subjOptionsSelected = new BehaviorSubject([]);
        this.subjExternalValue = new BehaviorSubject([]);
        this.subjDefaultValue = new BehaviorSubject([]);
        this.subjRegisterOnChange = new Subject();
        this._focusToInput = false;
        //////////// interface ControlValueAccessor ////////////
        this.onChange = (v) => v;
        this.onTouched = () => null;
        Object.assign(this, defaultOptions);
        // DIFFERS
        this.itemsDiffer = iterableDiffers.find([]).create(null);
        this.defaultValueDiffer = iterableDiffers.find([]).create(null);
        // OBSERVERS
        this.typed.subscribe((text) => this.subjSearchText.next(text));
        this.subjOptionsSelected.subscribe((options) => this.selectionChanges.emit(options));
        let cacheExternalValue;
        // Get actual value
        const subjActualValue = combineLatest([
            merge(this.subjExternalValue.pipe(map((v) => cacheExternalValue = v === null ? [] : [].concat(v))), this.subjOptionsSelected.pipe(map((options) => options.map((o) => o.value)))),
            this.subjDefaultValue,
        ]).pipe(map(([eVal, dVal]) => {
            const newVal = isEqual(eVal, dVal) ? [] : eVal;
            return newVal.length ? newVal : dVal;
        }), distinctUntilChanged((x, y) => isEqual(x, y)), share());
        // Export actual value
        combineLatest([subjActualValue, this.subjRegisterOnChange])
            .pipe(map(([actualValue]) => actualValue))
            .subscribe((actualValue) => {
            this.actualValue = actualValue;
            if (!isEqual(actualValue, cacheExternalValue)) {
                cacheExternalValue = actualValue;
                if (this.multiple) {
                    this.onChange(actualValue);
                }
                else {
                    this.onChange(actualValue.length ? actualValue[0] : null);
                }
            }
        });
        // Correct selected options when the options changed
        combineLatest([
            this.subjOptions.pipe(mergeMap((options) => from(options).pipe(mergeMap((option) => option instanceof NgxSelectOption
                ? of(option)
                : (option instanceof NgxSelectOptGroup ? from(option.options) : EMPTY)), toArray()))),
            subjActualValue,
        ]).pipe(debounceTime(0) // For a case when optionsFlat, actualValue came at the same time
        ).subscribe(([optionsFlat, actualValue]) => {
            const optionsSelected = [];
            actualValue.forEach((value) => {
                const selectedOption = optionsFlat.find((option) => option.value === value);
                if (selectedOption) {
                    optionsSelected.push(selectedOption);
                }
            });
            if (this.keepSelectedItems) {
                const optionValues = optionsSelected.map((option) => option.value);
                const keptSelectedOptions = this.subjOptionsSelected.value
                    .filter((selOption) => optionValues.indexOf(selOption.value) === -1);
                optionsSelected.push(...keptSelectedOptions);
            }
            if (!isEqual(optionsSelected, this.subjOptionsSelected.value)) {
                this.subjOptionsSelected.next(optionsSelected);
                this.cd.markForCheck();
            }
        });
        // Ensure working filter by a search text
        combineLatest([this.subjOptions, this.subjOptionsSelected, this.subjSearchText]).pipe(map(([options, selectedOptions, search]) => {
            this.optionsFiltered = this.filterOptions(search, options, selectedOptions).map(option => {
                if (option instanceof NgxSelectOption) {
                    option.highlightedText = this.highlightOption(option);
                }
                else if (option instanceof NgxSelectOptGroup) {
                    option.options.map(subOption => {
                        subOption.highlightedText = this.highlightOption(subOption);
                        return subOption;
                    });
                }
                return option;
            });
            this.cacheOptionsFilteredFlat = null;
            this.navigateOption(ENavigation.firstIfOptionActiveInvisible);
            this.cd.markForCheck();
            return selectedOptions;
        }), mergeMap((selectedOptions) => this.optionsFilteredFlat().pipe(filter((flatOptions) => this.autoSelectSingleOption && flatOptions.length === 1 && !selectedOptions.length)))).subscribe((flatOptions) => {
            this.subjOptionsSelected.next(flatOptions);
            this.cd.markForCheck();
        });
    }
    /** @internal */
    get inputText() {
        if (this.inputElRef && this.inputElRef.nativeElement) {
            return this.inputElRef.nativeElement.value;
        }
        return '';
    }
    setFormControlSize(otherClassNames = {}, useFormControl = true) {
        const formControlExtraClasses = useFormControl ? {
            'form-control-sm input-sm': this.size === 'small',
            'form-control-lg input-lg': this.size === 'large',
        } : {};
        return Object.assign(formControlExtraClasses, otherClassNames);
    }
    setBtnSize() {
        return { 'btn-sm': this.size === 'small', 'btn-lg': this.size === 'large' };
    }
    get optionsSelected() {
        return this.subjOptionsSelected.value;
    }
    mainClicked(event) {
        event.clickedSelectComponent = this;
        if (!this.isFocused) {
            this.isFocused = true;
            this.focus.emit();
        }
    }
    documentClick(event) {
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
    }
    optionsFilteredFlat() {
        if (this.cacheOptionsFilteredFlat) {
            return of(this.cacheOptionsFilteredFlat);
        }
        return from(this.optionsFiltered).pipe(mergeMap((option) => option instanceof NgxSelectOption ? of(option) :
            (option instanceof NgxSelectOptGroup ? from(option.optionsFiltered) : EMPTY)), filter((optionsFilteredFlat) => !optionsFilteredFlat.disabled), toArray(), tap((optionsFilteredFlat) => this.cacheOptionsFilteredFlat = optionsFilteredFlat));
    }
    navigateOption(navigation) {
        this.optionsFilteredFlat().pipe(map((options) => {
            const navigated = { index: -1, activeOption: null, filteredOptionList: options };
            let newActiveIdx;
            switch (navigation) {
                case ENavigation.first:
                    navigated.index = 0;
                    break;
                case ENavigation.previous:
                    newActiveIdx = options.indexOf(this.optionActive) - 1;
                    navigated.index = newActiveIdx >= 0 ? newActiveIdx : options.length - 1;
                    break;
                case ENavigation.next:
                    newActiveIdx = options.indexOf(this.optionActive) + 1;
                    navigated.index = newActiveIdx < options.length ? newActiveIdx : 0;
                    break;
                case ENavigation.last:
                    navigated.index = options.length - 1;
                    break;
                case ENavigation.firstSelected:
                    if (this.subjOptionsSelected.value.length) {
                        navigated.index = options.indexOf(this.subjOptionsSelected.value[0]);
                    }
                    break;
                case ENavigation.firstIfOptionActiveInvisible:
                    let idxOfOptionActive = -1;
                    if (this.optionActive) {
                        idxOfOptionActive = options.indexOf(options.find(x => x.value === this.optionActive.value));
                    }
                    navigated.index = idxOfOptionActive > 0 ? idxOfOptionActive : 0;
                    break;
            }
            navigated.activeOption = options[navigated.index];
            return navigated;
        })).subscribe((newNavigated) => this.optionActivate(newNavigated));
    }
    ngDoCheck() {
        if (this.itemsDiffer.diff(this.items)) {
            this.subjOptions.next(this.buildOptions(this.items));
        }
        const defVal = this.defaultValue ? [].concat(this.defaultValue) : [];
        if (this.defaultValueDiffer.diff(defVal)) {
            this.subjDefaultValue.next(defVal);
        }
    }
    ngAfterContentChecked() {
        if (this._focusToInput && this.checkInputVisibility() && this.inputElRef &&
            this.inputElRef.nativeElement !== document.activeElement) {
            this._focusToInput = false;
            this.inputElRef.nativeElement.focus();
        }
        if (this.choiceMenuElRef) {
            const ulElement = this.choiceMenuElRef.nativeElement;
            const element = ulElement.querySelector('a.ngx-select__item_active.active');
            if (element && element.offsetHeight > 0) {
                this.ensureVisibleElement(element);
            }
        }
    }
    ngOnDestroy() {
        this.cd.detach();
    }
    canClearNotMultiple() {
        return this.allowClear && !!this.subjOptionsSelected.value.length &&
            (!this.subjDefaultValue.value.length || this.subjDefaultValue.value[0] !== this.actualValue[0]);
    }
    focusToInput() {
        this._focusToInput = true;
    }
    inputKeyDown(event) {
        const keysForOpenedState = [].concat(this.keyCodeToOptionsSelect, this.keyCodeToNavigateFirst, this.keyCodeToNavigatePrevious, this.keyCodeToNavigateNext, this.keyCodeToNavigateLast);
        const keysForClosedState = [].concat(this.keyCodeToOptionsOpen, this.keyCodeToRemoveSelected);
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
    }
    trackByOption(index, option) {
        return option instanceof NgxSelectOption ? option.value :
            (option instanceof NgxSelectOptGroup ? option.label : option);
    }
    checkInputVisibility() {
        return (this.multiple === true) || (this.optionsOpened && !this.noAutoComplete);
    }
    /** @internal */
    inputKeyUp(value = '', event) {
        if (event.code === this.keyCodeToOptionsClose) {
            this.optionsClose( /*true*/);
        }
        else if (this.optionsOpened && (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowDown'].indexOf(event.code) === -1) /*ignore arrows*/) {
            this.typed.emit(value);
        }
        else if (!this.optionsOpened && value) {
            this.optionsOpen(value);
        }
    }
    /** @internal */
    inputClick(value = '') {
        if (!this.optionsOpened) {
            this.optionsOpen(value);
        }
    }
    /** @internal */
    sanitize(html) {
        if (this.noSanitize) {
            return html || null;
        }
        return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
    }
    /** @internal */
    highlightOption(option) {
        if (this.inputElRef) {
            return option.renderText(this.sanitizer, this.inputElRef.nativeElement.value);
        }
        return option.renderText(this.sanitizer, '');
    }
    /** @internal */
    optionSelect(option, event = null) {
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
    }
    /** @internal */
    optionRemove(option, event) {
        if (!this.disabled && option) {
            event.stopPropagation();
            this.subjOptionsSelected.next((this.multiple ? this.subjOptionsSelected.value : []).filter(o => o !== option));
            this.remove.emit(option.value);
        }
    }
    /** @internal */
    optionActivate(navigated) {
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
    }
    /** @internal */
    onMouseEnter(navigated) {
        if (this.autoActiveOnMouseEnter) {
            this.optionActivate(navigated);
        }
    }
    filterOptions(search, options, selectedOptions) {
        const regExp = new RegExp(escapeString$1(search), 'i');
        const filterOption = (option) => {
            if (this.searchCallback) {
                return this.searchCallback(search, option);
            }
            return (!search || regExp.test(option.text)) && (!this.multiple || selectedOptions.indexOf(option) === -1);
        };
        return options.filter((option) => {
            if (option instanceof NgxSelectOption) {
                return filterOption(option);
            }
            else if (option instanceof NgxSelectOptGroup) {
                const subOp = option;
                subOp.filter((subOption) => filterOption(subOption));
                return subOp.optionsFiltered.length;
            }
        });
    }
    ensureVisibleElement(element) {
        if (this.choiceMenuElRef && this.cacheElementOffsetTop !== element.offsetTop) {
            this.cacheElementOffsetTop = element.offsetTop;
            const container = this.choiceMenuElRef.nativeElement;
            if (this.cacheElementOffsetTop < container.scrollTop) {
                container.scrollTop = this.cacheElementOffsetTop;
            }
            else if (this.cacheElementOffsetTop + element.offsetHeight > container.scrollTop + container.clientHeight) {
                container.scrollTop = this.cacheElementOffsetTop + element.offsetHeight - container.clientHeight;
            }
        }
    }
    showChoiceMenu() {
        return this.optionsOpened && (!!this.subjOptions.value.length || this.showOptionNotFoundForEmptyItems);
    }
    optionsOpen(search = '') {
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
    }
    optionsClose( /*focusToHost: boolean = false*/) {
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
    }
    buildOptions(data) {
        const result = [];
        if (Array.isArray(data)) {
            data.forEach((item) => {
                const isOptGroup = typeof item === 'object' && item !== null &&
                    propertyExists(item, this.optGroupLabelField) && propertyExists(item, this.optGroupOptionsField) &&
                    Array.isArray(item[this.optGroupOptionsField]);
                if (isOptGroup) {
                    const optGroup = new NgxSelectOptGroup(item[this.optGroupLabelField]);
                    item[this.optGroupOptionsField].forEach((subOption) => {
                        const opt = this.buildOption(subOption, optGroup);
                        if (opt) {
                            optGroup.options.push(opt);
                        }
                    });
                    result.push(optGroup);
                }
                else {
                    const option = this.buildOption(item, null);
                    if (option) {
                        result.push(option);
                    }
                }
            });
        }
        return result;
    }
    buildOption(data, parent) {
        let value;
        let text;
        let disabled;
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
    }
    writeValue(obj) {
        this.subjExternalValue.next(obj);
    }
    registerOnChange(fn) {
        this.onChange = fn;
        this.subjRegisterOnChange.next();
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        this.cd.markForCheck();
    }
}
NgxSelectComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-select',
                template: "<div #main [tabindex]=\"disabled? -1: 0\" class=\"ngx-select dropdown\"\n     [ngClass]=\"setFormControlSize({\n        'ngx-select_multiple form-control': multiple === true,\n        'open show': optionsOpened && optionsFiltered.length\n     }, multiple === true)\"\n     (click)=\"mainClicked($event)\" (focusin)=\"mainClicked($event)\"\n     (focus)=\"focusToInput()\" (keydown)=\"inputKeyDown($event)\">\n    <div [ngClass]=\"{ 'ngx-select__disabled': disabled}\"></div>\n\n    <!-- single selected item -->\n    <div class=\"ngx-select__selected\"\n         *ngIf=\"(multiple === false) && (!optionsOpened || noAutoComplete)\">\n        <div class=\"ngx-select__toggle btn form-control\" [ngClass]=\"setFormControlSize(setBtnSize())\"\n             (click)=\"optionsOpen()\">\n\n            <span *ngIf=\"!optionsSelected.length\" class=\"ngx-select__placeholder text-muted\">\n                <span [innerHtml]=\"placeholder\"></span>\n            </span>\n            <span *ngIf=\"optionsSelected.length\"\n                  class=\"ngx-select__selected-single pull-left float-left\"\n                  [ngClass]=\"{'ngx-select__allow-clear': allowClear}\">\n                <ng-container [ngTemplateOutlet]=\"templateSelectedOption || defaultTemplateOption\"\n                              [ngTemplateOutletContext]=\"{$implicit: optionsSelected[0], index: 0,\n                                                          text: sanitize(optionsSelected[0].text)}\">\n                </ng-container>\n            </span>\n            <span class=\"ngx-select__toggle-buttons\">\n                <a class=\"ngx-select__clear btn btn-sm btn-link\" *ngIf=\"canClearNotMultiple()\"\n                   [ngClass]=\"setBtnSize()\"\n                   (click)=\"optionRemove(optionsSelected[0], $event)\">\n                    <i class=\"ngx-select__clear-icon\"></i>\n                </a>\n                <i class=\"dropdown-toggle\"></i>\n                <i class=\"ngx-select__toggle-caret caret\"></i>\n            </span>\n        </div>\n    </div>\n\n    <!-- multiple selected items -->\n    <div class=\"ngx-select__selected\" *ngIf=\"multiple === true\" (click)=\"inputClick(inputElRef && inputElRef['value'])\">\n        <span *ngFor=\"let option of optionsSelected; trackBy: trackByOption; let idx = index\">\n            <span tabindex=\"-1\" [ngClass]=\"setBtnSize()\" (click)=\"$event.stopPropagation()\"\n                  class=\"ngx-select__selected-plural btn btn-default btn-secondary btn-sm btn-xs\">\n\n                <ng-container [ngTemplateOutlet]=\"templateSelectedOption || defaultTemplateOption\"\n                              [ngTemplateOutletContext]=\"{$implicit: option, index: idx, text: sanitize(option.text)}\">\n                </ng-container>\n\n                <a class=\"ngx-select__clear btn btn-sm btn-link pull-right float-right\" [ngClass]=\"setBtnSize()\"\n                   (click)=\"optionRemove(option, $event)\">\n                    <i class=\"ngx-select__clear-icon\"></i>\n                </a>\n            </span>\n        </span>\n    </div>\n\n    <!-- live search an item from the list -->\n    <input #input type=\"text\" class=\"ngx-select__search form-control\" [ngClass]=\"setFormControlSize()\"\n           *ngIf=\"checkInputVisibility()\"\n           [tabindex]=\"multiple === false? -1: 0\"\n           (keyup)=\"inputKeyUp(input.value, $event)\"\n           [disabled]=\"disabled\"\n           [placeholder]=\"optionsSelected.length? '': placeholder\"\n           (click)=\"inputClick(input.value)\"\n           [autocomplete]=\"autocomplete\"\n           autocorrect=\"off\"\n           autocapitalize=\"off\"\n           spellcheck=\"false\"\n           role=\"combobox\">\n\n    <!-- options template -->\n    <ul #choiceMenu role=\"menu\" *ngIf=\"isFocused\" class=\"ngx-select__choices dropdown-menu\"\n        [ngClass]=\"dropDownMenuOtherClasses\"\n        [class.show]=\"showChoiceMenu()\">\n        <li class=\"ngx-select__item-group\" role=\"menuitem\"\n            *ngFor=\"let opt of optionsFiltered; trackBy: trackByOption; let idxGroup=index\">\n            <div class=\"divider dropdown-divider\" *ngIf=\"opt.type === 'optgroup' && (idxGroup > 0)\"></div>\n            <div class=\"dropdown-header\" *ngIf=\"opt.type === 'optgroup'\">{{opt.label}}</div>\n\n            <a href=\"#\" #choiceItem class=\"ngx-select__item dropdown-item\"\n               *ngFor=\"let option of (opt.optionsFiltered || [opt]); trackBy: trackByOption; let idxOption = index\"\n               [ngClass]=\"{\n                    'ngx-select__item_active active': option.active,\n                    'ngx-select__item_disabled disabled': option.disabled\n               }\"\n               (mouseenter)=\"onMouseEnter({\n                    activeOption: option,\n                    filteredOptionList: optionsFiltered,\n                    index: optionsFiltered.indexOf(option)\n               })\"\n               (click)=\"optionSelect(option, $event)\">\n                <ng-container [ngTemplateOutlet]=\"templateOption || defaultTemplateOption\"\n                              [ngTemplateOutletContext]=\"{$implicit: option, text: option.highlightedText,\n                              index: idxGroup, subIndex: idxOption}\"></ng-container>\n            </a>\n        </li>\n        <li class=\"ngx-select__item ngx-select__item_no-found dropdown-header\" *ngIf=\"!optionsFiltered.length\">\n            <ng-container [ngTemplateOutlet]=\"templateOptionNotFound || defaultTemplateOptionNotFound\"\n                          [ngTemplateOutletContext]=\"{$implicit: inputText}\"></ng-container>\n        </li>\n    </ul>\n\n    <!--Default templates-->\n    <ng-template #defaultTemplateOption let-text=\"text\">\n        <span [innerHtml]=\"text\"></span>\n    </ng-template>\n\n    <ng-template #defaultTemplateOptionNotFound>\n        {{noResultsFound}}\n    </ng-template>\n\n</div>\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                providers: [
                    {
                        provide: NG_VALUE_ACCESSOR,
                        useExisting: forwardRef(() => NgxSelectComponent),
                        multi: true,
                    },
                ],
                styles: [".ngx-select_multiple{height:auto;padding:3px 3px 0}.ngx-select_multiple .ngx-select__search{background-color:transparent!important;border:none;box-shadow:none;height:1.6666em;margin-bottom:3px;outline:none;padding:0}.ngx-select__disabled{background-color:#eceeef;border-radius:4px;cursor:not-allowed;height:100%;left:0;opacity:.6;position:absolute;top:0;width:100%;z-index:5}.ngx-select__toggle{align-items:stretch;background-color:#fff;border-color:#ccc;color:#333;display:inline-flex;justify-content:space-between;outline:0;position:relative;text-align:left!important}.ngx-select__toggle:hover{background-color:#e6e6e6;border-color:#adadad;color:#333}.ngx-select__toggle-buttons{align-items:center;display:flex;flex-shrink:0}.ngx-select__toggle-caret{height:10px;margin-top:-2px;position:absolute;right:10px;top:50%}.ngx-select__placeholder{float:left;max-width:100%;overflow:hidden;text-overflow:ellipsis}.ngx-select__clear{border:none;margin-right:10px;padding:0}.ngx-select_multiple .ngx-select__clear{color:#000;line-height:normal;margin-left:5px;margin-right:0;opacity:.5}.ngx-select__clear-icon{cursor:pointer;display:inline-block;font-size:inherit;height:.75em;padding:0;position:relative;width:1em}.ngx-select__clear-icon:after,.ngx-select__clear-icon:before{border-top:3px solid;content:\"\";left:0;margin-top:-1px;position:absolute;top:50%;width:100%}.ngx-select__clear-icon:before{transform:rotate(45deg)}.ngx-select__clear-icon:after{transform:rotate(-45deg)}.ngx-select__choices{height:auto;margin-top:0;max-height:200px;overflow-x:hidden;position:absolute;width:100%}.ngx-select_multiple .ngx-select__choices{margin-top:1px}.ngx-select__item{clear:both;cursor:pointer;display:block;font-weight:400;line-height:1.42857143;padding:3px 20px;text-decoration:none;white-space:nowrap}.ngx-select__item_disabled,.ngx-select__item_no-found{cursor:default}.ngx-select__item_active{background-color:#428bca;color:#fff;outline:0}.ngx-select__selected-plural,.ngx-select__selected-single{align-items:center;display:inline-flex;overflow:hidden}.ngx-select__selected-plural span,.ngx-select__selected-single span{overflow:hidden;text-overflow:ellipsis}.ngx-select__selected-plural{margin:0 3px 3px 0;outline:0}.input-group>.dropdown{position:static}"]
            },] }
];
NgxSelectComponent.ctorParameters = () => [
    { type: IterableDiffers },
    { type: DomSanitizer },
    { type: ChangeDetectorRef },
    { type: undefined, decorators: [{ type: Inject, args: [NGX_SELECT_OPTIONS,] }, { type: Optional }] }
];
NgxSelectComponent.propDecorators = {
    items: [{ type: Input }],
    optionValueField: [{ type: Input }],
    optionTextField: [{ type: Input }],
    optGroupLabelField: [{ type: Input }],
    optGroupOptionsField: [{ type: Input }],
    multiple: [{ type: Input }],
    allowClear: [{ type: Input }],
    placeholder: [{ type: Input }],
    noAutoComplete: [{ type: Input }],
    disabled: [{ type: Input }],
    defaultValue: [{ type: Input }],
    autoSelectSingleOption: [{ type: Input }],
    autoClearSearch: [{ type: Input }],
    noResultsFound: [{ type: Input }],
    keepSelectedItems: [{ type: Input }],
    size: [{ type: Input }],
    searchCallback: [{ type: Input }],
    autoActiveOnMouseEnter: [{ type: Input }],
    showOptionNotFoundForEmptyItems: [{ type: Input }],
    isFocused: [{ type: Input }],
    keepSelectMenuOpened: [{ type: Input }],
    autocomplete: [{ type: Input }],
    dropDownMenuOtherClasses: [{ type: Input }],
    noSanitize: [{ type: Input }],
    typed: [{ type: Output }],
    focus: [{ type: Output }],
    blur: [{ type: Output }],
    open: [{ type: Output }],
    close: [{ type: Output }],
    select: [{ type: Output }],
    remove: [{ type: Output }],
    navigated: [{ type: Output }],
    selectionChanges: [{ type: Output }],
    mainElRef: [{ type: ViewChild, args: ['main', { static: true },] }],
    inputElRef: [{ type: ViewChild, args: ['input',] }],
    choiceMenuElRef: [{ type: ViewChild, args: ['choiceMenu',] }],
    templateOption: [{ type: ContentChild, args: [NgxSelectOptionDirective, { read: TemplateRef, static: true },] }],
    templateSelectedOption: [{ type: ContentChild, args: [NgxSelectOptionSelectedDirective, { read: TemplateRef, static: true },] }],
    templateOptionNotFound: [{ type: ContentChild, args: [NgxSelectOptionNotFoundDirective, { read: TemplateRef, static: true },] }],
    documentClick: [{ type: HostListener, args: ['document:focusin', ['$event'],] }, { type: HostListener, args: ['document:click', ['$event'],] }]
};

class NgxSelectModule {
    static forRoot(options) {
        return {
            ngModule: NgxSelectModule,
            providers: [{ provide: NGX_SELECT_OPTIONS, useValue: options }],
        };
    }
}
NgxSelectModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
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

export { NGX_SELECT_OPTIONS, NgxSelectComponent, NgxSelectModule, NgxSelectOptGroup, NgxSelectOption, NgxSelectOptionDirective, NgxSelectOptionNotFoundDirective, NgxSelectOptionSelectedDirective };
//# sourceMappingURL=ngx-select-ex.js.map
