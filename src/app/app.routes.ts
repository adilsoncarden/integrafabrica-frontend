import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guards";

export const routes: Routes = [
    {
        path: "login",
        loadComponent: () =>
            import("./features/auth/login/login.component").then(
                (m) => m.LoginComponent,
            ),
    },
    {
        path: "admin/dashboard",
        canActivate: [authGuard],
        loadComponent: () =>
            import("./features/admin/dashboard/dashboard.component").then(
                (m) => m.DashboardComponent,
            ),
    },
    { path: "", redirectTo: "login", pathMatch: "full" },
];
