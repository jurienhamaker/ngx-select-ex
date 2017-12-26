import {
  Component, DoCheck, ElementRef, forwardRef, HostBinding, HostListener, Input, IterableDiffer, IterableDiffers, OnInit, QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { KeyboardEvent } from 'ngx-bootstrap/utils/facade/browser';
import { NgxSelectOptGroup, NgxSelectOption } from './ngx-select.classes';
import { escapeRegexp } from '../common/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ngx-select',
  templateUrl: './ngx-select.component.html',
  styleUrls: ['./ngx-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxSelectComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NgxSelectComponent),
      multi: true
    }
  ]
})
export class NgxSelectComponent implements OnInit, ControlValueAccessor, Validator, DoCheck {
  @Input() public items: any[];
  @Input() public valueField: string = 'id';
  @Input() public textField: string = 'text';
  @Input() public labelField: string = 'label';
  @Input() public optionsField: string = 'options';
  @Input() public multiple: boolean = false;
  @Input() public allowClear: boolean = false;
  @Input() public placeholder: string = '';
  @Input() public noAutoComplete: boolean = false;
  @Input() public disabled: boolean = false;

  @ViewChild('choiceMenu') choiceMenuElRef: ElementRef;
  @ViewChild('input') inputElRef: ElementRef;

  @HostBinding() tabindex = 0;

  @HostListener('focus', ['$event'])
  protected focusToInput(): void {
    if (this.inputElRef) {
      this.inputElRef.nativeElement.focus();
    }
  }

  protected optionsOpened: boolean = false;

  protected options: Array<NgxSelectOptGroup | NgxSelectOption> = [];
  protected optionsFiltered: Array<NgxSelectOptGroup | NgxSelectOption> = [];
  protected optionsSelected: Array<NgxSelectOption> = [];
  protected optionActive: NgxSelectOption;
  private itemsDiffer: IterableDiffer<any>;

  constructor(private sanitizer: DomSanitizer, iterableDiffers: IterableDiffers) {
    this.itemsDiffer = iterableDiffers.find([]).create<any>(null);
  }

  ngOnInit() {
  }

  ngDoCheck(): void {
    if (this.itemsDiffer.diff(this.items)) {
      this.options = this.buildOptions(this.items);
      this.optionsFilter();
    }
  }

  protected mainClickedOutside(): void {
    this.optionsClose();
  }

  protected mainKeyUp(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case 27: // escape
        this.optionsClose();
        break;
    }
  }

  protected inputKeyDown(event: KeyboardEvent) {
    if ([37, 38, 39, 40].includes(event.keyCode)) {
      event.preventDefault();
      event.stopPropagation();
    }
    switch (event.keyCode) {
      case 13: // enter
        if (this.optionsOpened) {
          this.optionSelect(this.optionActive);
          this.optionActivateNext();
        } else {
          this.optionsOpen();
        }
        break;
      case 37: // arrow left
        this.optionActivateFirst();
        break;
      case 38: // arrow up
        this.optionActivatePrevious();
        break;
      case 39: // arrow right
        this.optionActivateLast();
        break;
      case 40: // arrow down
        this.optionActivateNext();
        break;
    }
  }

  protected inputIsDisabled(): boolean {
    if (!this.disabled && this.optionsOpened) {
      this.focusToInput();
    }
    return this.disabled;
  }

  protected matchClick(e: any): void {
    this.optionsOpen();
  }

  protected optionSelect(option: NgxSelectOption, event: Event = null): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.multiple) {
      this.optionsSelected.length = 0;
    }
    this.optionsSelected.push(option);
    this.optionsClose();
  }

  protected optionRemove(option: NgxSelectOption, event: Event): void {
    if (!this.disabled) {
      event.stopPropagation();
      if (this.multiple) {
        const optionIndex = this.optionsSelected.indexOf(option);
        this.optionsSelected.splice(optionIndex, 1);
      } else {
        this.optionsSelected.length = 0;
      }
    }
  }

  protected isOptionActive(option: NgxSelectOption, element: HTMLElement) {
    if (this.optionActive === option) {
      this.ensureVisibleElement(element);
      return true;
    }
    return false;
  }

  protected optionActivate(option: NgxSelectOption): void {
    this.optionActive = option;
  }

  private optionActivateFirst(): void {
    for (let i = 0; i < this.optionsFiltered.length; i++) {
      const option = this.optionsFiltered[i];
      if (option instanceof NgxSelectOption) {
        this.optionActivate(option);
        return;
      } else if (option instanceof NgxSelectOptGroup && option.optionsFiltered.length) {
        this.optionActivate(option.optionsFiltered[0]);
        return;
      }
    }
  }

  protected highlightText(fullText: string) {
    if (this.inputElRef) {
      const highlightText = this.inputElRef.nativeElement.value;
      if (highlightText) {
        fullText = fullText.replace(new RegExp(highlightText, 'gi'), '<strong>$&</strong>');
      }
    }
    return this.sanitizer.bypassSecurityTrustHtml(fullText);
  }

  private optionActivateNext(): void {
    let option,
      i = this.optionsFiltered.indexOf(this.optionActive.parent || this.optionActive),
      ii = (this.optionActive.parent ? this.optionActive.parent.optionsFiltered.indexOf(this.optionActive) : 0) + 1;

    do {
      option = this.optionsFiltered[i];
      if ((option instanceof NgxSelectOptGroup) && (ii <= option.optionsFiltered.length - 1)) {
        this.optionActivate(option.optionsFiltered[ii === -2 ? 0 : ii]);
        return;
      }
      ii = -2;
      i++;
      option = this.optionsFiltered[i];
      if (option instanceof NgxSelectOption) {
        this.optionActivate(option);
        return;
      }
    } while (i < this.optionsFiltered.length);

    this.optionActivateFirst();
  }

  private optionActivatePrevious(): void {
    let option,
      i = this.optionsFiltered.indexOf(this.optionActive.parent || this.optionActive),
      ii = (this.optionActive.parent ? this.optionActive.parent.optionsFiltered.indexOf(this.optionActive) : 0) - 1;

    do {
      option = this.optionsFiltered[i];
      if ((option instanceof NgxSelectOptGroup) && (ii >= 0 || ii === -2)) {
        this.optionActivate(option.optionsFiltered[ii === -2 ? option.optionsFiltered.length - 1 : ii]);
        return;
      }
      ii = -2;
      i--;
      option = this.optionsFiltered[i];
      if (option instanceof NgxSelectOption) {
        this.optionActivate(option);
        return;
      }
    } while (i >= 0);

    this.optionActivateLast();
  }

  private optionActivateLast(): void {
    for (let i = this.optionsFiltered.length - 1; i >= 0; i--) {
      const option = this.optionsFiltered[i];
      if (option instanceof NgxSelectOption) {
        this.optionActivate(option);
        return;
      } else if (option instanceof NgxSelectOptGroup && option.optionsFiltered.length) {
        this.optionActivate(option.optionsFiltered[option.optionsFiltered.length - 1]);
        return;
      }
    }
  }

  private ensureVisibleElement(element: HTMLElement) {
    if (this.choiceMenuElRef) {
      const container: HTMLElement = this.choiceMenuElRef.nativeElement;
      if (element.offsetTop < container.scrollTop) {
        container.scrollTop = element.offsetTop;
      } else if (element.offsetTop + element.offsetHeight > container.scrollTop + container.clientHeight) {
        container.scrollTop = element.offsetTop + element.offsetHeight - container.clientHeight;
      }
    }
  }

  protected optionsFilter(search: string = ''): void {
    let activeIsFiltered = false;
    const regExp = new RegExp(search, 'gi'),
      filterOption = (option: NgxSelectOption) => {
        const filter = regExp.test(option.text) && (!this.multiple || !this.optionsSelected.includes(option));
        if (!filter && option === this.optionActive) {
          activeIsFiltered = true;
        }
        return filter;
      };

    this.optionsFiltered = this.options.filter((option: NgxSelectOptGroup | NgxSelectOption) => {
      if (option instanceof NgxSelectOption) {
        return filterOption(<NgxSelectOption>option);
      } else if (option instanceof NgxSelectOptGroup) {
        const subOp = <NgxSelectOptGroup>option;
        subOp.filter((subOption: NgxSelectOption) => filterOption(subOption));
        return subOp.optionsFiltered.length;
      }
    });

    if (activeIsFiltered) {
      this.optionActivateFirst();
    }
  }

  private optionsOpen() {
    this.optionsOpened = true;
    this.optionsFilter();
    if (!this.multiple && this.optionsSelected.length) {
      this.optionActivate(this.optionsSelected[0]);
    } else {
      this.optionActivateFirst();
    }
  }

  private optionsClose() {
    this.optionsOpened = false;
  }

  private buildOptions(data: any[]): Array<NgxSelectOption | NgxSelectOptGroup> {
    const result: Array<NgxSelectOption | NgxSelectOptGroup> = [];
    let option: NgxSelectOption;

    [].concat(data).forEach((item: any) => {
      const isOptGroup = typeof item === 'object' && item !== null &&
        item.hasOwnProperty(this.labelField) && item.hasOwnProperty(this.optionsField) &&
        Array.isArray(item[this.optionsField]);
      if (isOptGroup) {
        const optGroup = new NgxSelectOptGroup(item[this.labelField]);
        item[this.optionsField].forEach(subOption => {
          if (option = this.buildOption(subOption, optGroup)) {
            optGroup.options.push(option);
          }
        });
        result.push(optGroup);
      } else if (option = this.buildOption(item, null)) {
        result.push(option);
      }
    });

    return result;
  }

  private buildOption(data: any, parent: NgxSelectOptGroup): NgxSelectOption {
    let value, text;
    if (typeof data === 'string' || typeof data === 'number') {
      value = text = data;
    } else if (typeof data === 'object' && data !== null &&
      (data.hasOwnProperty(this.valueField) || data.hasOwnProperty(this.textField))) {
      value = data.hasOwnProperty(this.valueField) ? data[this.valueField] : data[this.textField];
      text = data.hasOwnProperty(this.textField) ? data[this.textField] : data[this.valueField];
    } else {
      return null;
    }
    return new NgxSelectOption(value, text, parent);
  }

  //////////// interface Validator ////////////
  validate(c: AbstractControl): { [key: string]: any; } {
    return null;
  }

  //////////// interface ControlValueAccessor ////////////
  public propagateChange = (_: any) => _;

  public onTouchedCallback: () => void = () => null;

  writeValue(obj: any): void {
  }

  public registerOnChange(fn: (_: any) => {}): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: () => {}): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }
}
