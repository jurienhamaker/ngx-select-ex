import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NGX_SELECT_OPTIONS, NgxSelectComponent } from './ngx-select.component';
import { NgxSelectOptionDirective, NgxSelectOptionNotFoundDirective, NgxSelectOptionSelectedDirective } from './ngx-templates.directive';
export class NgxSelectModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXNlbGVjdC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vc3JjL2FwcC9saWIvIiwic291cmNlcyI6WyJuZ3gtc2VsZWN0L25neC1zZWxlY3QubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQWN6SSxNQUFNLE9BQU8sZUFBZTtJQUNqQixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQTBCO1FBQzVDLE9BQU87WUFDSCxRQUFRLEVBQUUsZUFBZTtZQUN6QixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUM7U0FDaEUsQ0FBQztJQUNOLENBQUM7OztZQWpCSixRQUFRLFNBQUM7Z0JBQ04sT0FBTyxFQUFFO29CQUNMLFlBQVk7aUJBQ2Y7Z0JBQ0QsWUFBWSxFQUFFLENBQUMsa0JBQWtCO29CQUM3Qix3QkFBd0IsRUFBRSxnQ0FBZ0MsRUFBRSxnQ0FBZ0M7aUJBQy9GO2dCQUNELE9BQU8sRUFBRSxDQUFDLGtCQUFrQjtvQkFDeEIsd0JBQXdCLEVBQUUsZ0NBQWdDLEVBQUUsZ0NBQWdDO2lCQUMvRjthQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9kdWxlV2l0aFByb3ZpZGVycywgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBOR1hfU0VMRUNUX09QVElPTlMsIE5neFNlbGVjdENvbXBvbmVudCB9IGZyb20gJy4vbmd4LXNlbGVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmd4U2VsZWN0T3B0aW9uRGlyZWN0aXZlLCBOZ3hTZWxlY3RPcHRpb25Ob3RGb3VuZERpcmVjdGl2ZSwgTmd4U2VsZWN0T3B0aW9uU2VsZWN0ZWREaXJlY3RpdmUgfSBmcm9tICcuL25neC10ZW1wbGF0ZXMuZGlyZWN0aXZlJztcbmltcG9ydCB7IElOZ3hTZWxlY3RPcHRpb25zIH0gZnJvbSAnLi9uZ3gtc2VsZWN0LmludGVyZmFjZXMnO1xuXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtcbiAgICAgICAgQ29tbW9uTW9kdWxlLFxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbTmd4U2VsZWN0Q29tcG9uZW50LFxuICAgICAgICBOZ3hTZWxlY3RPcHRpb25EaXJlY3RpdmUsIE5neFNlbGVjdE9wdGlvblNlbGVjdGVkRGlyZWN0aXZlLCBOZ3hTZWxlY3RPcHRpb25Ob3RGb3VuZERpcmVjdGl2ZSxcbiAgICBdLFxuICAgIGV4cG9ydHM6IFtOZ3hTZWxlY3RDb21wb25lbnQsXG4gICAgICAgIE5neFNlbGVjdE9wdGlvbkRpcmVjdGl2ZSwgTmd4U2VsZWN0T3B0aW9uU2VsZWN0ZWREaXJlY3RpdmUsIE5neFNlbGVjdE9wdGlvbk5vdEZvdW5kRGlyZWN0aXZlLFxuICAgIF0sXG59KVxuZXhwb3J0IGNsYXNzIE5neFNlbGVjdE1vZHVsZSB7XG4gICAgcHVibGljIHN0YXRpYyBmb3JSb290KG9wdGlvbnM6IElOZ3hTZWxlY3RPcHRpb25zKTogTW9kdWxlV2l0aFByb3ZpZGVyczxOZ3hTZWxlY3RNb2R1bGU+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5nTW9kdWxlOiBOZ3hTZWxlY3RNb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTkdYX1NFTEVDVF9PUFRJT05TLCB1c2VWYWx1ZTogb3B0aW9uc31dLFxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==