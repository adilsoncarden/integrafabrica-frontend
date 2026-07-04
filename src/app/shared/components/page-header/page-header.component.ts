import { Component, input } from "@angular/core";

@Component({
    selector: "app-page-header",
    standalone: true,
    template: `
        <div class="page-header">
            <div>
                <h1 class="page-title">{{ title() }}</h1>
                @if (subtitle()) {
                    <p class="page-subtitle">{{ subtitle() }}</p>
                }
            </div>
            <div class="page-header-actions">
                <ng-content />
            </div>
        </div>
    `,
    styles: `
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        .page-header-actions {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
    `,
})
export class PageHeaderComponent {
    title = input.required<string>();
    subtitle = input<string>("");
}
