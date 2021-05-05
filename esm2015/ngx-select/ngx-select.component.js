import { Input, Output, ViewChild, Component, EventEmitter, forwardRef, HostListener, IterableDiffers, ChangeDetectorRef, ContentChild, TemplateRef, Optional, Inject, InjectionToken, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, BehaviorSubject, EMPTY, of, from, merge, combineLatest } from 'rxjs';
import { tap, filter, map, share, toArray, distinctUntilChanged, mergeMap, debounceTime } from 'rxjs/operators';
import isEqual from 'lodash.isequal';
import * as escapeStringNs from 'escape-string-regexp';
import { NgxSelectOptGroup, NgxSelectOption } from './ngx-select.classes';
import { NgxSelectOptionDirective, NgxSelectOptionNotFoundDirective, NgxSelectOptionSelectedDirective } from './ngx-templates.directive';
const escapeString = escapeStringNs;
export const NGX_SELECT_OPTIONS = new InjectionToken('NGX_SELECT_OPTIONS');
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
export class NgxSelectComponent {
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
        const regExp = new RegExp(escapeString(search), 'i');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXNlbGVjdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vc3JjL2FwcC9saWIvIiwic291cmNlcyI6WyJuZ3gtc2VsZWN0L25neC1zZWxlY3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFHSCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxTQUFTLEVBRVQsWUFBWSxFQUNaLFVBQVUsRUFDVixZQUFZLEVBRVosZUFBZSxFQUNmLGlCQUFpQixFQUNqQixZQUFZLEVBQ1osV0FBVyxFQUNYLFFBQVEsRUFDUixNQUFNLEVBQ04sY0FBYyxFQUNkLHVCQUF1QixFQUUxQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQXdCLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDekUsT0FBTyxFQUFFLFlBQVksRUFBWSxNQUFNLDJCQUEyQixDQUFDO0FBQ25FLE9BQU8sRUFBYyxPQUFPLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkcsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2hILE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sS0FBSyxjQUFjLE1BQU0sc0JBQXNCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBaUIsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RixPQUFPLEVBQ0gsd0JBQXdCLEVBQ3hCLGdDQUFnQyxFQUNoQyxnQ0FBZ0MsRUFDbkMsTUFBTSwyQkFBMkIsQ0FBQztBQUduQyxNQUFNLFlBQVksR0FBRyxjQUFjLENBQUM7QUFFcEMsTUFBTSxDQUFDLE1BQU0sa0JBQWtC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SUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDO3FDQUV4RSxZQUFZLFNBQUMsZ0NBQWdDLEVBQUUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUM7cUNBR2hGLFlBQVksU0FBQyxnQ0FBZ0MsRUFBRSxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQzs0QkF5S2hGLFlBQVksU0FBQyxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxjQUMzQyxZQUFZLFNBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEFmdGVyQ29udGVudENoZWNrZWQsXG4gICAgRG9DaGVjayxcbiAgICBJbnB1dCxcbiAgICBPdXRwdXQsXG4gICAgVmlld0NoaWxkLFxuICAgIENvbXBvbmVudCxcbiAgICBFbGVtZW50UmVmLFxuICAgIEV2ZW50RW1pdHRlcixcbiAgICBmb3J3YXJkUmVmLFxuICAgIEhvc3RMaXN0ZW5lcixcbiAgICBJdGVyYWJsZURpZmZlcixcbiAgICBJdGVyYWJsZURpZmZlcnMsXG4gICAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgQ29udGVudENoaWxkLFxuICAgIFRlbXBsYXRlUmVmLFxuICAgIE9wdGlvbmFsLFxuICAgIEluamVjdCxcbiAgICBJbmplY3Rpb25Ub2tlbixcbiAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICBPbkRlc3Ryb3lcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVIdG1sIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0LCBCZWhhdmlvclN1YmplY3QsIEVNUFRZLCBvZiwgZnJvbSwgbWVyZ2UsIGNvbWJpbmVMYXRlc3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHRhcCwgZmlsdGVyLCBtYXAsIHNoYXJlLCB0b0FycmF5LCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgbWVyZ2VNYXAsIGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCBpc0VxdWFsIGZyb20gJ2xvZGFzaC5pc2VxdWFsJztcbmltcG9ydCAqIGFzIGVzY2FwZVN0cmluZ05zIGZyb20gJ2VzY2FwZS1zdHJpbmctcmVnZXhwJztcbmltcG9ydCB7IE5neFNlbGVjdE9wdEdyb3VwLCBOZ3hTZWxlY3RPcHRpb24sIFRTZWxlY3RPcHRpb24gfSBmcm9tICcuL25neC1zZWxlY3QuY2xhc3Nlcyc7XG5pbXBvcnQge1xuICAgIE5neFNlbGVjdE9wdGlvbkRpcmVjdGl2ZSxcbiAgICBOZ3hTZWxlY3RPcHRpb25Ob3RGb3VuZERpcmVjdGl2ZSxcbiAgICBOZ3hTZWxlY3RPcHRpb25TZWxlY3RlZERpcmVjdGl2ZVxufSBmcm9tICcuL25neC10ZW1wbGF0ZXMuZGlyZWN0aXZlJztcbmltcG9ydCB7IElOZ3hPcHRpb25OYXZpZ2F0ZWQsIElOZ3hTZWxlY3RPcHRpb24sIElOZ3hTZWxlY3RPcHRpb25zIH0gZnJvbSAnLi9uZ3gtc2VsZWN0LmludGVyZmFjZXMnO1xuXG5jb25zdCBlc2NhcGVTdHJpbmcgPSBlc2NhcGVTdHJpbmdOcztcblxuZXhwb3J0IGNvbnN0IE5HWF9TRUxFQ1RfT1BUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxhbnk+KCdOR1hfU0VMRUNUX09QVElPTlMnKTtcblxuZXhwb3J0IGludGVyZmFjZSBJTmd4U2VsZWN0Q29tcG9uZW50TW91c2VFdmVudCBleHRlbmRzIE1vdXNlRXZlbnQge1xuICAgIGNsaWNrZWRTZWxlY3RDb21wb25lbnQ/OiBOZ3hTZWxlY3RDb21wb25lbnQ7XG59XG5cbmVudW0gRU5hdmlnYXRpb24ge1xuICAgIGZpcnN0LCBwcmV2aW91cywgbmV4dCwgbGFzdCxcbiAgICBmaXJzdFNlbGVjdGVkLCBmaXJzdElmT3B0aW9uQWN0aXZlSW52aXNpYmxlLFxufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUV4aXN0cyhvYmo6IG9iamVjdCwgcHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gcHJvcGVydHlOYW1lIGluIG9iajtcbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICduZ3gtc2VsZWN0JyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbmd4LXNlbGVjdC5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4vbmd4LXNlbGVjdC5jb21wb25lbnQuc2NzcyddLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7XG4gICAgICAgICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgICAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5neFNlbGVjdENvbXBvbmVudCksXG4gICAgICAgICAgICBtdWx0aTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICBdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hTZWxlY3RDb21wb25lbnQgaW1wbGVtZW50cyBJTmd4U2VsZWN0T3B0aW9ucywgQ29udHJvbFZhbHVlQWNjZXNzb3IsIERvQ2hlY2ssIEFmdGVyQ29udGVudENoZWNrZWQsIE9uRGVzdHJveSB7XG4gICAgQElucHV0KCkgcHVibGljIGl0ZW1zOiBhbnlbXTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb3B0aW9uVmFsdWVGaWVsZCA9ICdpZCc7XG4gICAgQElucHV0KCkgcHVibGljIG9wdGlvblRleHRGaWVsZCA9ICd0ZXh0JztcbiAgICBASW5wdXQoKSBwdWJsaWMgb3B0R3JvdXBMYWJlbEZpZWxkID0gJ2xhYmVsJztcbiAgICBASW5wdXQoKSBwdWJsaWMgb3B0R3JvdXBPcHRpb25zRmllbGQgPSAnb3B0aW9ucyc7XG4gICAgQElucHV0KCkgcHVibGljIG11bHRpcGxlID0gZmFsc2U7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93Q2xlYXIgPSBmYWxzZTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGxhY2Vob2xkZXIgPSAnJztcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9BdXRvQ29tcGxldGUgPSBmYWxzZTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdFZhbHVlOiBhbnlbXSA9IFtdO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2VsZWN0U2luZ2xlT3B0aW9uID0gZmFsc2U7XG4gICAgQElucHV0KCkgcHVibGljIGF1dG9DbGVhclNlYXJjaCA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jlc3VsdHNGb3VuZCA9ICdObyByZXN1bHRzIGZvdW5kJztcbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcFNlbGVjdGVkSXRlbXM6IGZhbHNlO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaXplOiAnc21hbGwnIHwgJ2RlZmF1bHQnIHwgJ2xhcmdlJyA9ICdkZWZhdWx0JztcbiAgICBASW5wdXQoKSBwdWJsaWMgc2VhcmNoQ2FsbGJhY2s6IChzZWFyY2g6IHN0cmluZywgaXRlbTogSU5neFNlbGVjdE9wdGlvbikgPT4gYm9vbGVhbjtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0FjdGl2ZU9uTW91c2VFbnRlciA9IHRydWU7XG4gICAgQElucHV0KCkgcHVibGljIHNob3dPcHRpb25Ob3RGb3VuZEZvckVtcHR5SXRlbXMgPSBmYWxzZTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGb2N1c2VkID0gZmFsc2U7XG4gICAgQElucHV0KCkgcHVibGljIGtlZXBTZWxlY3RNZW51T3BlbmVkID0gZmFsc2U7XG4gICAgQElucHV0KCkgcHVibGljIGF1dG9jb21wbGV0ZSA9ICdvZmYnO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkcm9wRG93bk1lbnVPdGhlckNsYXNzZXMgPSAnJztcbiAgICBASW5wdXQoKSBwdWJsaWMgbm9TYW5pdGl6ZSA9IGZhbHNlO1xuXG4gICAgcHVibGljIGtleUNvZGVUb1JlbW92ZVNlbGVjdGVkID0gJ0RlbGV0ZSc7XG4gICAgcHVibGljIGtleUNvZGVUb09wdGlvbnNPcGVuID0gWydFbnRlcicsICdOdW1wYWRFbnRlciddO1xuICAgIHB1YmxpYyBrZXlDb2RlVG9PcHRpb25zQ2xvc2UgPSAnRXNjYXBlJztcbiAgICBwdWJsaWMga2V5Q29kZVRvT3B0aW9uc1NlbGVjdCA9IFsnRW50ZXInLCAnTnVtcGFkRW50ZXInXTtcbiAgICBwdWJsaWMga2V5Q29kZVRvTmF2aWdhdGVGaXJzdCA9ICdBcnJvd0xlZnQnO1xuICAgIHB1YmxpYyBrZXlDb2RlVG9OYXZpZ2F0ZVByZXZpb3VzID0gJ0Fycm93VXAnO1xuICAgIHB1YmxpYyBrZXlDb2RlVG9OYXZpZ2F0ZU5leHQgPSAnQXJyb3dEb3duJztcbiAgICBwdWJsaWMga2V5Q29kZVRvTmF2aWdhdGVMYXN0ID0gJ0Fycm93UmlnaHQnO1xuXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0eXBlZCA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZm9jdXMgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBibHVyID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgb3BlbiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNsb3NlID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyByZW1vdmUgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIG5hdmlnYXRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SU5neE9wdGlvbk5hdmlnYXRlZD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIHNlbGVjdGlvbkNoYW5nZXMgPSBuZXcgRXZlbnRFbWl0dGVyPElOZ3hTZWxlY3RPcHRpb25bXT4oKTtcblxuICAgIEBWaWV3Q2hpbGQoJ21haW4nLCB7c3RhdGljOiB0cnVlfSkgcHJvdGVjdGVkIG1haW5FbFJlZjogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdpbnB1dCcpIHB1YmxpYyBpbnB1dEVsUmVmOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoJ2Nob2ljZU1lbnUnKSBwcm90ZWN0ZWQgY2hvaWNlTWVudUVsUmVmOiBFbGVtZW50UmVmO1xuXG4gICAgQENvbnRlbnRDaGlsZChOZ3hTZWxlY3RPcHRpb25EaXJlY3RpdmUsIHtyZWFkOiBUZW1wbGF0ZVJlZiwgc3RhdGljOiB0cnVlfSkgcHVibGljIHRlbXBsYXRlT3B0aW9uOiBOZ3hTZWxlY3RPcHRpb25EaXJlY3RpdmU7XG5cbiAgICBAQ29udGVudENoaWxkKE5neFNlbGVjdE9wdGlvblNlbGVjdGVkRGlyZWN0aXZlLCB7cmVhZDogVGVtcGxhdGVSZWYsIHN0YXRpYzogdHJ1ZX0pXG4gICAgcHVibGljIHRlbXBsYXRlU2VsZWN0ZWRPcHRpb246IE5neFNlbGVjdE9wdGlvblNlbGVjdGVkRGlyZWN0aXZlO1xuXG4gICAgQENvbnRlbnRDaGlsZChOZ3hTZWxlY3RPcHRpb25Ob3RGb3VuZERpcmVjdGl2ZSwge3JlYWQ6IFRlbXBsYXRlUmVmLCBzdGF0aWM6IHRydWV9KVxuICAgIHB1YmxpYyB0ZW1wbGF0ZU9wdGlvbk5vdEZvdW5kOiBOZ3hTZWxlY3RPcHRpb25Ob3RGb3VuZERpcmVjdGl2ZTtcblxuICAgIHB1YmxpYyBvcHRpb25zT3BlbmVkID0gZmFsc2U7XG4gICAgcHVibGljIG9wdGlvbnNGaWx0ZXJlZDogVFNlbGVjdE9wdGlvbltdO1xuXG4gICAgcHJpdmF0ZSBvcHRpb25BY3RpdmU6IE5neFNlbGVjdE9wdGlvbjtcbiAgICBwcml2YXRlIGl0ZW1zRGlmZmVyOiBJdGVyYWJsZURpZmZlcjxhbnk+O1xuICAgIHByaXZhdGUgZGVmYXVsdFZhbHVlRGlmZmVyOiBJdGVyYWJsZURpZmZlcjxhbnlbXT47XG4gICAgcHJpdmF0ZSBhY3R1YWxWYWx1ZTogYW55W10gPSBbXTtcblxuICAgIHB1YmxpYyBzdWJqT3B0aW9ucyA9IG5ldyBCZWhhdmlvclN1YmplY3Q8VFNlbGVjdE9wdGlvbltdPihbXSk7XG4gICAgcHJpdmF0ZSBzdWJqU2VhcmNoVGV4dCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8c3RyaW5nPignJyk7XG5cbiAgICBwcml2YXRlIHN1YmpPcHRpb25zU2VsZWN0ZWQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PE5neFNlbGVjdE9wdGlvbltdPihbXSk7XG4gICAgcHJpdmF0ZSBzdWJqRXh0ZXJuYWxWYWx1ZSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8YW55W10+KFtdKTtcbiAgICBwcml2YXRlIHN1YmpEZWZhdWx0VmFsdWUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGFueVtdPihbXSk7XG4gICAgcHJpdmF0ZSBzdWJqUmVnaXN0ZXJPbkNoYW5nZSA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICBwcml2YXRlIGNhY2hlT3B0aW9uc0ZpbHRlcmVkRmxhdDogTmd4U2VsZWN0T3B0aW9uW107XG4gICAgcHJpdmF0ZSBjYWNoZUVsZW1lbnRPZmZzZXRUb3A6IG51bWJlcjtcblxuICAgIHByaXZhdGUgX2ZvY3VzVG9JbnB1dCA9IGZhbHNlO1xuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHB1YmxpYyBnZXQgaW5wdXRUZXh0KCkge1xuICAgICAgICBpZiAodGhpcy5pbnB1dEVsUmVmICYmIHRoaXMuaW5wdXRFbFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnB1dEVsUmVmLm5hdGl2ZUVsZW1lbnQudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGl0ZXJhYmxlRGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwcml2YXRlIHNhbml0aXplcjogRG9tU2FuaXRpemVyLCBwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgICAgICAgICBASW5qZWN0KE5HWF9TRUxFQ1RfT1BUSU9OUykgQE9wdGlvbmFsKCkgZGVmYXVsdE9wdGlvbnM6IElOZ3hTZWxlY3RPcHRpb25zKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgZGVmYXVsdE9wdGlvbnMpO1xuXG4gICAgICAgIC8vIERJRkZFUlNcbiAgICAgICAgdGhpcy5pdGVtc0RpZmZlciA9IGl0ZXJhYmxlRGlmZmVycy5maW5kKFtdKS5jcmVhdGU8YW55PihudWxsKTtcbiAgICAgICAgdGhpcy5kZWZhdWx0VmFsdWVEaWZmZXIgPSBpdGVyYWJsZURpZmZlcnMuZmluZChbXSkuY3JlYXRlPGFueT4obnVsbCk7XG5cbiAgICAgICAgLy8gT0JTRVJWRVJTXG4gICAgICAgIHRoaXMudHlwZWQuc3Vic2NyaWJlKCh0ZXh0OiBzdHJpbmcpID0+IHRoaXMuc3VialNlYXJjaFRleHQubmV4dCh0ZXh0KSk7XG4gICAgICAgIHRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC5zdWJzY3JpYmUoKG9wdGlvbnM6IE5neFNlbGVjdE9wdGlvbltdKSA9PiB0aGlzLnNlbGVjdGlvbkNoYW5nZXMuZW1pdChvcHRpb25zKSk7XG4gICAgICAgIGxldCBjYWNoZUV4dGVybmFsVmFsdWU6IGFueVtdO1xuXG4gICAgICAgIC8vIEdldCBhY3R1YWwgdmFsdWVcbiAgICAgICAgY29uc3Qgc3ViakFjdHVhbFZhbHVlID0gY29tYmluZUxhdGVzdChbXG4gICAgICAgICAgICBtZXJnZShcbiAgICAgICAgICAgICAgICB0aGlzLnN1YmpFeHRlcm5hbFZhbHVlLnBpcGUobWFwKFxuICAgICAgICAgICAgICAgICAgICAodjogYW55W10pID0+IGNhY2hlRXh0ZXJuYWxWYWx1ZSA9IHYgPT09IG51bGwgPyBbXSA6IFtdLmNvbmNhdCh2KVxuICAgICAgICAgICAgICAgICkpLFxuICAgICAgICAgICAgICAgIHRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC5waXBlKG1hcChcbiAgICAgICAgICAgICAgICAgICAgKG9wdGlvbnM6IE5neFNlbGVjdE9wdGlvbltdKSA9PiBvcHRpb25zLm1hcCgobzogTmd4U2VsZWN0T3B0aW9uKSA9PiBvLnZhbHVlKVxuICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdGhpcy5zdWJqRGVmYXVsdFZhbHVlLFxuICAgICAgICBdKS5waXBlKFxuICAgICAgICAgICAgbWFwKChbZVZhbCwgZFZhbF06IFthbnlbXSwgYW55W11dKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VmFsID0gaXNFcXVhbChlVmFsLCBkVmFsKSA/IFtdIDogZVZhbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3VmFsLmxlbmd0aCA/IG5ld1ZhbCA6IGRWYWw7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCh4LCB5KSA9PiBpc0VxdWFsKHgsIHkpKSxcbiAgICAgICAgICAgIHNoYXJlKClcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBFeHBvcnQgYWN0dWFsIHZhbHVlXG4gICAgICAgIGNvbWJpbmVMYXRlc3QoW3N1YmpBY3R1YWxWYWx1ZSwgdGhpcy5zdWJqUmVnaXN0ZXJPbkNoYW5nZV0pXG4gICAgICAgICAgICAucGlwZShtYXAoKFthY3R1YWxWYWx1ZV06IFthbnlbXSwgYW55W11dKSA9PiBhY3R1YWxWYWx1ZSkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKChhY3R1YWxWYWx1ZTogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdHVhbFZhbHVlID0gYWN0dWFsVmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0VxdWFsKGFjdHVhbFZhbHVlLCBjYWNoZUV4dGVybmFsVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlRXh0ZXJuYWxWYWx1ZSA9IGFjdHVhbFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNoYW5nZShhY3R1YWxWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKGFjdHVhbFZhbHVlLmxlbmd0aCA/IGFjdHVhbFZhbHVlWzBdIDogbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBDb3JyZWN0IHNlbGVjdGVkIG9wdGlvbnMgd2hlbiB0aGUgb3B0aW9ucyBjaGFuZ2VkXG4gICAgICAgIGNvbWJpbmVMYXRlc3QoW1xuICAgICAgICAgICAgdGhpcy5zdWJqT3B0aW9ucy5waXBlKFxuICAgICAgICAgICAgICAgIG1lcmdlTWFwKChvcHRpb25zOiBUU2VsZWN0T3B0aW9uW10pID0+IGZyb20ob3B0aW9ucykucGlwZShcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VNYXAoKG9wdGlvbjogVFNlbGVjdE9wdGlvbikgPT4gb3B0aW9uIGluc3RhbmNlb2YgTmd4U2VsZWN0T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG9mKG9wdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIDogKG9wdGlvbiBpbnN0YW5jZW9mIE5neFNlbGVjdE9wdEdyb3VwID8gZnJvbShvcHRpb24ub3B0aW9ucykgOiBFTVBUWSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgdG9BcnJheSgpXG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBzdWJqQWN0dWFsVmFsdWUsXG4gICAgICAgIF0pLnBpcGUoXG4gICAgICAgICAgICBkZWJvdW5jZVRpbWUoMCkgLy8gRm9yIGEgY2FzZSB3aGVuIG9wdGlvbnNGbGF0LCBhY3R1YWxWYWx1ZSBjYW1lIGF0IHRoZSBzYW1lIHRpbWVcbiAgICAgICAgKS5zdWJzY3JpYmUoKFtvcHRpb25zRmxhdCwgYWN0dWFsVmFsdWVdOiBbTmd4U2VsZWN0T3B0aW9uW10sIGFueVtdXSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uc1NlbGVjdGVkID0gW107XG5cbiAgICAgICAgICAgIGFjdHVhbFZhbHVlLmZvckVhY2goKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IG9wdGlvbnNGbGF0LmZpbmQoKG9wdGlvbjogTmd4U2VsZWN0T3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1NlbGVjdGVkLnB1c2goc2VsZWN0ZWRPcHRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5rZWVwU2VsZWN0ZWRJdGVtcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvblZhbHVlcyA9IG9wdGlvbnNTZWxlY3RlZC5tYXAoKG9wdGlvbjogTmd4U2VsZWN0T3B0aW9uKSA9PiBvcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGtlcHRTZWxlY3RlZE9wdGlvbnMgPSB0aGlzLnN1YmpPcHRpb25zU2VsZWN0ZWQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoc2VsT3B0aW9uOiBOZ3hTZWxlY3RPcHRpb24pID0+IG9wdGlvblZhbHVlcy5pbmRleE9mKHNlbE9wdGlvbi52YWx1ZSkgPT09IC0xKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zU2VsZWN0ZWQucHVzaCguLi5rZXB0U2VsZWN0ZWRPcHRpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFpc0VxdWFsKG9wdGlvbnNTZWxlY3RlZCwgdGhpcy5zdWJqT3B0aW9uc1NlbGVjdGVkLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC5uZXh0KG9wdGlvbnNTZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRW5zdXJlIHdvcmtpbmcgZmlsdGVyIGJ5IGEgc2VhcmNoIHRleHRcbiAgICAgICAgY29tYmluZUxhdGVzdChbdGhpcy5zdWJqT3B0aW9ucywgdGhpcy5zdWJqT3B0aW9uc1NlbGVjdGVkLCB0aGlzLnN1YmpTZWFyY2hUZXh0XSkucGlwZShcbiAgICAgICAgICAgIG1hcCgoW29wdGlvbnMsIHNlbGVjdGVkT3B0aW9ucywgc2VhcmNoXTogW1RTZWxlY3RPcHRpb25bXSwgTmd4U2VsZWN0T3B0aW9uW10sIHN0cmluZ10pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNGaWx0ZXJlZCA9IHRoaXMuZmlsdGVyT3B0aW9ucyhzZWFyY2gsIG9wdGlvbnMsIHNlbGVjdGVkT3B0aW9ucykubWFwKG9wdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb24gaW5zdGFuY2VvZiBOZ3hTZWxlY3RPcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi5oaWdobGlnaHRlZFRleHQgPSB0aGlzLmhpZ2hsaWdodE9wdGlvbihvcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIE5neFNlbGVjdE9wdEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24ub3B0aW9ucy5tYXAoc3ViT3B0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJPcHRpb24uaGlnaGxpZ2h0ZWRUZXh0ID0gdGhpcy5oaWdobGlnaHRPcHRpb24oc3ViT3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3ViT3B0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlT3B0aW9uc0ZpbHRlcmVkRmxhdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZU9wdGlvbihFTmF2aWdhdGlvbi5maXJzdElmT3B0aW9uQWN0aXZlSW52aXNpYmxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZE9wdGlvbnM7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG1lcmdlTWFwKChzZWxlY3RlZE9wdGlvbnM6IE5neFNlbGVjdE9wdGlvbltdKSA9PiB0aGlzLm9wdGlvbnNGaWx0ZXJlZEZsYXQoKS5waXBlKGZpbHRlcihcbiAgICAgICAgICAgICAgICAoZmxhdE9wdGlvbnM6IE5neFNlbGVjdE9wdGlvbltdKSA9PiB0aGlzLmF1dG9TZWxlY3RTaW5nbGVPcHRpb24gJiYgZmxhdE9wdGlvbnMubGVuZ3RoID09PSAxICYmICFzZWxlY3RlZE9wdGlvbnMubGVuZ3RoXG4gICAgICAgICAgICApKSlcbiAgICAgICAgKS5zdWJzY3JpYmUoKGZsYXRPcHRpb25zOiBOZ3hTZWxlY3RPcHRpb25bXSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdWJqT3B0aW9uc1NlbGVjdGVkLm5leHQoZmxhdE9wdGlvbnMpO1xuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldEZvcm1Db250cm9sU2l6ZShvdGhlckNsYXNzTmFtZXM6IG9iamVjdCA9IHt9LCB1c2VGb3JtQ29udHJvbDogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgY29uc3QgZm9ybUNvbnRyb2xFeHRyYUNsYXNzZXMgPSB1c2VGb3JtQ29udHJvbCA/IHtcbiAgICAgICAgICAgICdmb3JtLWNvbnRyb2wtc20gaW5wdXQtc20nOiB0aGlzLnNpemUgPT09ICdzbWFsbCcsXG4gICAgICAgICAgICAnZm9ybS1jb250cm9sLWxnIGlucHV0LWxnJzogdGhpcy5zaXplID09PSAnbGFyZ2UnLFxuICAgICAgICB9IDoge307XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGZvcm1Db250cm9sRXh0cmFDbGFzc2VzLCBvdGhlckNsYXNzTmFtZXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRCdG5TaXplKCkge1xuICAgICAgICByZXR1cm4geydidG4tc20nOiB0aGlzLnNpemUgPT09ICdzbWFsbCcsICdidG4tbGcnOiB0aGlzLnNpemUgPT09ICdsYXJnZSd9O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgb3B0aW9uc1NlbGVjdGVkKCk6IE5neFNlbGVjdE9wdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC52YWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbWFpbkNsaWNrZWQoZXZlbnQ6IElOZ3hTZWxlY3RDb21wb25lbnRNb3VzZUV2ZW50KSB7XG4gICAgICAgIGV2ZW50LmNsaWNrZWRTZWxlY3RDb21wb25lbnQgPSB0aGlzO1xuICAgICAgICBpZiAoIXRoaXMuaXNGb2N1c2VkKSB7XG4gICAgICAgICAgICB0aGlzLmlzRm9jdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZvY3VzLmVtaXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmZvY3VzaW4nLCBbJyRldmVudCddKVxuICAgIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmNsaWNrJywgWyckZXZlbnQnXSlcbiAgICBwdWJsaWMgZG9jdW1lbnRDbGljayhldmVudDogSU5neFNlbGVjdENvbXBvbmVudE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmNsaWNrZWRTZWxlY3RDb21wb25lbnQgIT09IHRoaXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnNPcGVuZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNDbG9zZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpOyAvLyBmaXggZXJyb3IgYmVjYXVzZSBvZiBkZWxheSBiZXR3ZWVuIGRpZmZlcmVudCBldmVudHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmlzRm9jdXNlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNGb2N1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5ibHVyLmVtaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb3B0aW9uc0ZpbHRlcmVkRmxhdCgpOiBPYnNlcnZhYmxlPE5neFNlbGVjdE9wdGlvbltdPiB7XG4gICAgICAgIGlmICh0aGlzLmNhY2hlT3B0aW9uc0ZpbHRlcmVkRmxhdCkge1xuICAgICAgICAgICAgcmV0dXJuIG9mKHRoaXMuY2FjaGVPcHRpb25zRmlsdGVyZWRGbGF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmcm9tKHRoaXMub3B0aW9uc0ZpbHRlcmVkKS5waXBlKFxuICAgICAgICAgICAgbWVyZ2VNYXA8VFNlbGVjdE9wdGlvbiwgYW55Pigob3B0aW9uOiBUU2VsZWN0T3B0aW9uKSA9PlxuICAgICAgICAgICAgICAgIG9wdGlvbiBpbnN0YW5jZW9mIE5neFNlbGVjdE9wdGlvbiA/IG9mKG9wdGlvbikgOlxuICAgICAgICAgICAgICAgICAgICAob3B0aW9uIGluc3RhbmNlb2YgTmd4U2VsZWN0T3B0R3JvdXAgPyBmcm9tKG9wdGlvbi5vcHRpb25zRmlsdGVyZWQpIDogRU1QVFkpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgZmlsdGVyKChvcHRpb25zRmlsdGVyZWRGbGF0OiBOZ3hTZWxlY3RPcHRpb24pID0+ICFvcHRpb25zRmlsdGVyZWRGbGF0LmRpc2FibGVkKSxcbiAgICAgICAgICAgIHRvQXJyYXkoKSxcbiAgICAgICAgICAgIHRhcCgob3B0aW9uc0ZpbHRlcmVkRmxhdDogTmd4U2VsZWN0T3B0aW9uW10pID0+IHRoaXMuY2FjaGVPcHRpb25zRmlsdGVyZWRGbGF0ID0gb3B0aW9uc0ZpbHRlcmVkRmxhdClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG5hdmlnYXRlT3B0aW9uKG5hdmlnYXRpb246IEVOYXZpZ2F0aW9uKSB7XG4gICAgICAgIHRoaXMub3B0aW9uc0ZpbHRlcmVkRmxhdCgpLnBpcGUoXG4gICAgICAgICAgICBtYXA8Tmd4U2VsZWN0T3B0aW9uW10sIElOZ3hPcHRpb25OYXZpZ2F0ZWQ+KChvcHRpb25zOiBOZ3hTZWxlY3RPcHRpb25bXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hdmlnYXRlZDogSU5neE9wdGlvbk5hdmlnYXRlZCA9IHtpbmRleDogLTEsIGFjdGl2ZU9wdGlvbjogbnVsbCwgZmlsdGVyZWRPcHRpb25MaXN0OiBvcHRpb25zfTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3QWN0aXZlSWR4O1xuICAgICAgICAgICAgICAgIHN3aXRjaCAobmF2aWdhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEVOYXZpZ2F0aW9uLmZpcnN0OlxuICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdGVkLmluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEVOYXZpZ2F0aW9uLnByZXZpb3VzOlxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWN0aXZlSWR4ID0gb3B0aW9ucy5pbmRleE9mKHRoaXMub3B0aW9uQWN0aXZlKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0ZWQuaW5kZXggPSBuZXdBY3RpdmVJZHggPj0gMCA/IG5ld0FjdGl2ZUlkeCA6IG9wdGlvbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEVOYXZpZ2F0aW9uLm5leHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBY3RpdmVJZHggPSBvcHRpb25zLmluZGV4T2YodGhpcy5vcHRpb25BY3RpdmUpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRlZC5pbmRleCA9IG5ld0FjdGl2ZUlkeCA8IG9wdGlvbnMubGVuZ3RoID8gbmV3QWN0aXZlSWR4IDogMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEVOYXZpZ2F0aW9uLmxhc3Q6XG4gICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0ZWQuaW5kZXggPSBvcHRpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBFTmF2aWdhdGlvbi5maXJzdFNlbGVjdGVkOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC52YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0ZWQuaW5kZXggPSBvcHRpb25zLmluZGV4T2YodGhpcy5zdWJqT3B0aW9uc1NlbGVjdGVkLnZhbHVlWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEVOYXZpZ2F0aW9uLmZpcnN0SWZPcHRpb25BY3RpdmVJbnZpc2libGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWR4T2ZPcHRpb25BY3RpdmUgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbkFjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkeE9mT3B0aW9uQWN0aXZlID0gb3B0aW9ucy5pbmRleE9mKG9wdGlvbnMuZmluZCh4ID0+IHgudmFsdWUgPT09IHRoaXMub3B0aW9uQWN0aXZlLnZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0ZWQuaW5kZXggPSBpZHhPZk9wdGlvbkFjdGl2ZSA+IDAgPyBpZHhPZk9wdGlvbkFjdGl2ZSA6IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmF2aWdhdGVkLmFjdGl2ZU9wdGlvbiA9IG9wdGlvbnNbbmF2aWdhdGVkLmluZGV4XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmF2aWdhdGVkO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKS5zdWJzY3JpYmUoKG5ld05hdmlnYXRlZDogSU5neE9wdGlvbk5hdmlnYXRlZCkgPT4gdGhpcy5vcHRpb25BY3RpdmF0ZShuZXdOYXZpZ2F0ZWQpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pdGVtc0RpZmZlci5kaWZmKHRoaXMuaXRlbXMpKSB7XG4gICAgICAgICAgICB0aGlzLnN1YmpPcHRpb25zLm5leHQodGhpcy5idWlsZE9wdGlvbnModGhpcy5pdGVtcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVmVmFsID0gdGhpcy5kZWZhdWx0VmFsdWUgPyBbXS5jb25jYXQodGhpcy5kZWZhdWx0VmFsdWUpIDogW107XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRWYWx1ZURpZmZlci5kaWZmKGRlZlZhbCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3ViakRlZmF1bHRWYWx1ZS5uZXh0KGRlZlZhbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdBZnRlckNvbnRlbnRDaGVja2VkKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZm9jdXNUb0lucHV0ICYmIHRoaXMuY2hlY2tJbnB1dFZpc2liaWxpdHkoKSAmJiB0aGlzLmlucHV0RWxSZWYgJiZcbiAgICAgICAgICAgIHRoaXMuaW5wdXRFbFJlZi5uYXRpdmVFbGVtZW50ICE9PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9mb2N1c1RvSW5wdXQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRFbFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jaG9pY2VNZW51RWxSZWYpIHtcbiAgICAgICAgICAgIGNvbnN0IHVsRWxlbWVudCA9IHRoaXMuY2hvaWNlTWVudUVsUmVmLm5hdGl2ZUVsZW1lbnQgYXMgSFRNTFVMaXN0RWxlbWVudDtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB1bEVsZW1lbnQucXVlcnlTZWxlY3RvcignYS5uZ3gtc2VsZWN0X19pdGVtX2FjdGl2ZS5hY3RpdmUnKSBhcyBIVE1MTGlua0VsZW1lbnQ7XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQub2Zmc2V0SGVpZ2h0ID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5zdXJlVmlzaWJsZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jZC5kZXRhY2goKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2FuQ2xlYXJOb3RNdWx0aXBsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsb3dDbGVhciAmJiAhIXRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC52YWx1ZS5sZW5ndGggJiZcbiAgICAgICAgICAgICghdGhpcy5zdWJqRGVmYXVsdFZhbHVlLnZhbHVlLmxlbmd0aCB8fCB0aGlzLnN1YmpEZWZhdWx0VmFsdWUudmFsdWVbMF0gIT09IHRoaXMuYWN0dWFsVmFsdWVbMF0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBmb2N1c1RvSW5wdXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2ZvY3VzVG9JbnB1dCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIGlucHV0S2V5RG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBjb25zdCBrZXlzRm9yT3BlbmVkU3RhdGUgPSBbXS5jb25jYXQoXG4gICAgICAgICAgICB0aGlzLmtleUNvZGVUb09wdGlvbnNTZWxlY3QsXG4gICAgICAgICAgICB0aGlzLmtleUNvZGVUb05hdmlnYXRlRmlyc3QsXG4gICAgICAgICAgICB0aGlzLmtleUNvZGVUb05hdmlnYXRlUHJldmlvdXMsXG4gICAgICAgICAgICB0aGlzLmtleUNvZGVUb05hdmlnYXRlTmV4dCxcbiAgICAgICAgICAgIHRoaXMua2V5Q29kZVRvTmF2aWdhdGVMYXN0XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGtleXNGb3JDbG9zZWRTdGF0ZSA9IFtdLmNvbmNhdCh0aGlzLmtleUNvZGVUb09wdGlvbnNPcGVuLCB0aGlzLmtleUNvZGVUb1JlbW92ZVNlbGVjdGVkKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zT3BlbmVkICYmIGtleXNGb3JPcGVuZWRTdGF0ZS5pbmRleE9mKGV2ZW50LmNvZGUpICE9PSAtMSkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC5jb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAoW10uY29uY2F0KHRoaXMua2V5Q29kZVRvT3B0aW9uc1NlbGVjdCkuaW5kZXhPZihldmVudC5jb2RlKSArIDEpICYmIGV2ZW50LmNvZGU6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uU2VsZWN0KHRoaXMub3B0aW9uQWN0aXZlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZU9wdGlvbihFTmF2aWdhdGlvbi5uZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0aGlzLmtleUNvZGVUb05hdmlnYXRlRmlyc3Q6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGVPcHRpb24oRU5hdmlnYXRpb24uZmlyc3QpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRoaXMua2V5Q29kZVRvTmF2aWdhdGVQcmV2aW91czpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZU9wdGlvbihFTmF2aWdhdGlvbi5wcmV2aW91cyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5rZXlDb2RlVG9OYXZpZ2F0ZUxhc3Q6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGVPcHRpb24oRU5hdmlnYXRpb24ubGFzdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5rZXlDb2RlVG9OYXZpZ2F0ZU5leHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGVPcHRpb24oRU5hdmlnYXRpb24ubmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnNPcGVuZWQgJiYga2V5c0ZvckNsb3NlZFN0YXRlLmluZGV4T2YoZXZlbnQuY29kZSkgIT09IC0xKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmNvZGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIChbXS5jb25jYXQodGhpcy5rZXlDb2RlVG9PcHRpb25zT3BlbikuaW5kZXhPZihldmVudC5jb2RlKSArIDEpICYmIGV2ZW50LmNvZGU6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc09wZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0aGlzLmtleUNvZGVUb1JlbW92ZVNlbGVjdGVkOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tdWx0aXBsZSB8fCB0aGlzLmNhbkNsZWFyTm90TXVsdGlwbGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25SZW1vdmUodGhpcy5zdWJqT3B0aW9uc1NlbGVjdGVkLnZhbHVlW3RoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC52YWx1ZS5sZW5ndGggLSAxXSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHRyYWNrQnlPcHRpb24oaW5kZXg6IG51bWJlciwgb3B0aW9uOiBUU2VsZWN0T3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBvcHRpb24gaW5zdGFuY2VvZiBOZ3hTZWxlY3RPcHRpb24gPyBvcHRpb24udmFsdWUgOlxuICAgICAgICAgICAgKG9wdGlvbiBpbnN0YW5jZW9mIE5neFNlbGVjdE9wdEdyb3VwID8gb3B0aW9uLmxhYmVsIDogb3B0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2hlY2tJbnB1dFZpc2liaWxpdHkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAodGhpcy5tdWx0aXBsZSA9PT0gdHJ1ZSkgfHwgKHRoaXMub3B0aW9uc09wZW5lZCAmJiAhdGhpcy5ub0F1dG9Db21wbGV0ZSk7XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHB1YmxpYyBpbnB1dEtleVVwKHZhbHVlOiBzdHJpbmcgPSAnJywgZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmNvZGUgPT09IHRoaXMua2V5Q29kZVRvT3B0aW9uc0Nsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNDbG9zZSgvKnRydWUqLyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zT3BlbmVkICYmIChbJ0Fycm93RG93bicsICdBcnJvd1VwJywgJ0Fycm93TGVmdCcsICdBcnJvd0Rvd24nXS5pbmRleE9mKGV2ZW50LmNvZGUpID09PSAtMSkvKmlnbm9yZSBhcnJvd3MqLykge1xuICAgICAgICAgICAgdGhpcy50eXBlZC5lbWl0KHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zT3BlbmVkICYmIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNPcGVuKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwdWJsaWMgaW5wdXRDbGljayh2YWx1ZTogc3RyaW5nID0gJycpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnNPcGVuZWQpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc09wZW4odmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHB1YmxpYyBzYW5pdGl6ZShodG1sOiBzdHJpbmcpOiBTYWZlSHRtbCB7XG4gICAgICAgIGlmKHRoaXMubm9TYW5pdGl6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGh0bWwgfHwgbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBodG1sID8gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdEh0bWwoaHRtbCkgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwdWJsaWMgaGlnaGxpZ2h0T3B0aW9uKG9wdGlvbjogTmd4U2VsZWN0T3B0aW9uKTogU2FmZUh0bWwge1xuICAgICAgICBpZiAodGhpcy5pbnB1dEVsUmVmKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uLnJlbmRlclRleHQodGhpcy5zYW5pdGl6ZXIsIHRoaXMuaW5wdXRFbFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3B0aW9uLnJlbmRlclRleHQodGhpcy5zYW5pdGl6ZXIsICcnKTtcbiAgICB9XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHVibGljIG9wdGlvblNlbGVjdChvcHRpb246IE5neFNlbGVjdE9wdGlvbiwgZXZlbnQ6IEV2ZW50ID0gbnVsbCk6IHZvaWQge1xuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9uICYmICFvcHRpb24uZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC5uZXh0KCh0aGlzLm11bHRpcGxlID8gdGhpcy5zdWJqT3B0aW9uc1NlbGVjdGVkLnZhbHVlIDogW10pLmNvbmNhdChbb3B0aW9uXSkpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QuZW1pdChvcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmtlZXBTZWxlY3RNZW51T3BlbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zQ2xvc2UoLyp0cnVlKi8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vblRvdWNoZWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwdWJsaWMgb3B0aW9uUmVtb3ZlKG9wdGlvbjogTmd4U2VsZWN0T3B0aW9uLCBldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkICYmIG9wdGlvbikge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnN1YmpPcHRpb25zU2VsZWN0ZWQubmV4dCgodGhpcy5tdWx0aXBsZSA/IHRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC52YWx1ZSA6IFtdKS5maWx0ZXIobyA9PiBvICE9PSBvcHRpb24pKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlLmVtaXQob3B0aW9uLnZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwdWJsaWMgb3B0aW9uQWN0aXZhdGUobmF2aWdhdGVkOiBJTmd4T3B0aW9uTmF2aWdhdGVkKTogdm9pZCB7XG4gICAgICAgIGlmICgodGhpcy5vcHRpb25BY3RpdmUgIT09IG5hdmlnYXRlZC5hY3RpdmVPcHRpb24pICYmXG4gICAgICAgICAgICAoIW5hdmlnYXRlZC5hY3RpdmVPcHRpb24gfHwgIW5hdmlnYXRlZC5hY3RpdmVPcHRpb24uZGlzYWJsZWQpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25BY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbkFjdGl2ZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vcHRpb25BY3RpdmUgPSBuYXZpZ2F0ZWQuYWN0aXZlT3B0aW9uO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25BY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbkFjdGl2ZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZWQuZW1pdChuYXZpZ2F0ZWQpO1xuICAgICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHVibGljIG9uTW91c2VFbnRlcihuYXZpZ2F0ZWQ6IElOZ3hPcHRpb25OYXZpZ2F0ZWQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuYXV0b0FjdGl2ZU9uTW91c2VFbnRlcikge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25BY3RpdmF0ZShuYXZpZ2F0ZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaWx0ZXJPcHRpb25zKHNlYXJjaDogc3RyaW5nLCBvcHRpb25zOiBUU2VsZWN0T3B0aW9uW10sIHNlbGVjdGVkT3B0aW9uczogTmd4U2VsZWN0T3B0aW9uW10pOiBUU2VsZWN0T3B0aW9uW10ge1xuICAgICAgICBjb25zdCByZWdFeHAgPSBuZXcgUmVnRXhwKGVzY2FwZVN0cmluZyhzZWFyY2gpLCAnaScpO1xuICAgICAgICBjb25zdCBmaWx0ZXJPcHRpb24gPSAob3B0aW9uOiBOZ3hTZWxlY3RPcHRpb24pID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlYXJjaENhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoQ2FsbGJhY2soc2VhcmNoLCBvcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICghc2VhcmNoIHx8IHJlZ0V4cC50ZXN0KG9wdGlvbi50ZXh0KSkgJiYgKCF0aGlzLm11bHRpcGxlIHx8IHNlbGVjdGVkT3B0aW9ucy5pbmRleE9mKG9wdGlvbikgPT09IC0xKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gb3B0aW9ucy5maWx0ZXIoKG9wdGlvbjogVFNlbGVjdE9wdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIE5neFNlbGVjdE9wdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJPcHRpb24ob3B0aW9uIGFzIE5neFNlbGVjdE9wdGlvbik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIE5neFNlbGVjdE9wdEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViT3AgPSBvcHRpb24gYXMgTmd4U2VsZWN0T3B0R3JvdXA7XG4gICAgICAgICAgICAgICAgc3ViT3AuZmlsdGVyKChzdWJPcHRpb246IE5neFNlbGVjdE9wdGlvbikgPT4gZmlsdGVyT3B0aW9uKHN1Yk9wdGlvbikpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWJPcC5vcHRpb25zRmlsdGVyZWQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVuc3VyZVZpc2libGVFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmNob2ljZU1lbnVFbFJlZiAmJiB0aGlzLmNhY2hlRWxlbWVudE9mZnNldFRvcCAhPT0gZWxlbWVudC5vZmZzZXRUb3ApIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVFbGVtZW50T2Zmc2V0VG9wID0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXI6IEhUTUxFbGVtZW50ID0gdGhpcy5jaG9pY2VNZW51RWxSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgIGlmICh0aGlzLmNhY2hlRWxlbWVudE9mZnNldFRvcCA8IGNvbnRhaW5lci5zY3JvbGxUb3ApIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gdGhpcy5jYWNoZUVsZW1lbnRPZmZzZXRUb3A7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY2FjaGVFbGVtZW50T2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQgPiBjb250YWluZXIuc2Nyb2xsVG9wICsgY29udGFpbmVyLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSB0aGlzLmNhY2hlRWxlbWVudE9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzaG93Q2hvaWNlTWVudSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc09wZW5lZCAmJiAoISF0aGlzLnN1YmpPcHRpb25zLnZhbHVlLmxlbmd0aCB8fCB0aGlzLnNob3dPcHRpb25Ob3RGb3VuZEZvckVtcHR5SXRlbXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvcHRpb25zT3BlbihzZWFyY2g6IHN0cmluZyA9ICcnKSB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zT3BlbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3VialNlYXJjaFRleHQubmV4dChzZWFyY2gpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm11bHRpcGxlICYmIHRoaXMuc3Viak9wdGlvbnNTZWxlY3RlZC52YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRlT3B0aW9uKEVOYXZpZ2F0aW9uLmZpcnN0U2VsZWN0ZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRlT3B0aW9uKEVOYXZpZ2F0aW9uLmZpcnN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZm9jdXNUb0lucHV0KCk7XG4gICAgICAgICAgICB0aGlzLm9wZW4uZW1pdCgpO1xuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvcHRpb25zQ2xvc2UoLypmb2N1c1RvSG9zdDogYm9vbGVhbiA9IGZhbHNlKi8pIHtcbiAgICAgICAgdGhpcy5vcHRpb25zT3BlbmVkID0gZmFsc2U7XG4gICAgICAgIC8vIGlmIChmb2N1c1RvSG9zdCkge1xuICAgICAgICAvLyAgICAgY29uc3QgeCA9IHdpbmRvdy5zY3JvbGxYLCB5ID0gd2luZG93LnNjcm9sbFk7XG4gICAgICAgIC8vICAgICB0aGlzLm1haW5FbFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIC8vICAgICB3aW5kb3cuc2Nyb2xsVG8oeCwgeSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgdGhpcy5jbG9zZS5lbWl0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuYXV0b0NsZWFyU2VhcmNoICYmIHRoaXMubXVsdGlwbGUgJiYgdGhpcy5pbnB1dEVsUmVmKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0RWxSZWYubmF0aXZlRWxlbWVudC52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGJ1aWxkT3B0aW9ucyhkYXRhOiBhbnlbXSk6IEFycmF5PE5neFNlbGVjdE9wdGlvbiB8IE5neFNlbGVjdE9wdEdyb3VwPiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdDogQXJyYXk8Tmd4U2VsZWN0T3B0aW9uIHwgTmd4U2VsZWN0T3B0R3JvdXA+ID0gW107XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICBkYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzT3B0R3JvdXAgPSB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgaXRlbSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eUV4aXN0cyhpdGVtLCB0aGlzLm9wdEdyb3VwTGFiZWxGaWVsZCkgJiYgcHJvcGVydHlFeGlzdHMoaXRlbSwgdGhpcy5vcHRHcm91cE9wdGlvbnNGaWVsZCkgJiZcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkuaXNBcnJheShpdGVtW3RoaXMub3B0R3JvdXBPcHRpb25zRmllbGRdKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNPcHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcHRHcm91cCA9IG5ldyBOZ3hTZWxlY3RPcHRHcm91cChpdGVtW3RoaXMub3B0R3JvdXBMYWJlbEZpZWxkXSk7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1bdGhpcy5vcHRHcm91cE9wdGlvbnNGaWVsZF0uZm9yRWFjaCgoc3ViT3B0aW9uOiBOZ3hTZWxlY3RPcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wdCA9IHRoaXMuYnVpbGRPcHRpb24oc3ViT3B0aW9uLCBvcHRHcm91cCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0R3JvdXAub3B0aW9ucy5wdXNoKG9wdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChvcHRHcm91cCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5idWlsZE9wdGlvbihpdGVtLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gob3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBidWlsZE9wdGlvbihkYXRhOiBhbnksIHBhcmVudDogTmd4U2VsZWN0T3B0R3JvdXApOiBOZ3hTZWxlY3RPcHRpb24ge1xuICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgIGxldCB0ZXh0O1xuICAgICAgICBsZXQgZGlzYWJsZWQ7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGRhdGEgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRleHQgPSBkYXRhO1xuICAgICAgICAgICAgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgZGF0YSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgKHByb3BlcnR5RXhpc3RzKGRhdGEsIHRoaXMub3B0aW9uVmFsdWVGaWVsZCkgfHwgcHJvcGVydHlFeGlzdHMoZGF0YSwgdGhpcy5vcHRpb25UZXh0RmllbGQpKSkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcm9wZXJ0eUV4aXN0cyhkYXRhLCB0aGlzLm9wdGlvblZhbHVlRmllbGQpID8gZGF0YVt0aGlzLm9wdGlvblZhbHVlRmllbGRdIDogZGF0YVt0aGlzLm9wdGlvblRleHRGaWVsZF07XG4gICAgICAgICAgICB0ZXh0ID0gcHJvcGVydHlFeGlzdHMoZGF0YSwgdGhpcy5vcHRpb25UZXh0RmllbGQpID8gZGF0YVt0aGlzLm9wdGlvblRleHRGaWVsZF0gOiBkYXRhW3RoaXMub3B0aW9uVmFsdWVGaWVsZF07XG4gICAgICAgICAgICBkaXNhYmxlZCA9IHByb3BlcnR5RXhpc3RzKGRhdGEsICdkaXNhYmxlZCcpID8gZGF0YS5kaXNhYmxlZCA6IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBOZ3hTZWxlY3RPcHRpb24odmFsdWUsIHRleHQsIGRpc2FibGVkLCBkYXRhLCBwYXJlbnQpO1xuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLyBpbnRlcmZhY2UgQ29udHJvbFZhbHVlQWNjZXNzb3IgLy8vLy8vLy8vLy8vXG4gICAgcHVibGljIG9uQ2hhbmdlID0gKHY6IGFueSkgPT4gdjtcblxuICAgIHB1YmxpYyBvblRvdWNoZWQ6ICgpID0+IHZvaWQgPSAoKSA9PiBudWxsO1xuXG4gICAgcHVibGljIHdyaXRlVmFsdWUob2JqOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdWJqRXh0ZXJuYWxWYWx1ZS5uZXh0KG9iaik7XG4gICAgfVxuXG4gICAgcHVibGljIHJlZ2lzdGVyT25DaGFuZ2UoZm46IChfOiBhbnkpID0+IHt9KTogdm9pZCB7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSBmbjtcbiAgICAgICAgdGhpcy5zdWJqUmVnaXN0ZXJPbkNoYW5nZS5uZXh0KCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB7fSk6IHZvaWQge1xuICAgICAgICB0aGlzLm9uVG91Y2hlZCA9IGZuO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgfVxufVxuIl19