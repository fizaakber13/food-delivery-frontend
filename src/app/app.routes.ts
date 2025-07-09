import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { AdminComponent } from './UI/admin/admin.component';
import { RestaurantManagementComponent } from './UI/admin/restaurant-management/restaurant-management.component';
import { MenuManagementComponent } from './UI/admin/menu-management/menu-management.component';
import { OrderManagementComponent } from './UI/admin/order-management/order-management.component';
import { UserManagementComponent } from './UI/admin/user-management/user-management.component';
import { CouponManagementComponent } from './UI/admin/coupon-management/coupon-management.component';


import { CustomerComponent } from './UI/customer/customer.component';
import { RestaurantListingComponent } from './UI/customer/restaurant-listing/restaurant-listing.component';
import { RestaurantMenuComponent } from './UI/customer/restaurant-menu/restaurant-menu.component';
import { ViewCartComponent } from './UI/customer/view-cart/view-cart.component';
import { ViewOrderComponent } from './UI/customer/view-order/view-order.component';
import { AccountComponent } from './UI/customer/account/account.component';


import { LoginComponent } from './UI/login/login.component';


import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'restaurant', component: RestaurantManagementComponent },
      { path: 'menu', component: MenuManagementComponent },
      { path: 'order', component: OrderManagementComponent },
      { path: 'user', component: UserManagementComponent },
      { path: 'coupon', component: CouponManagementComponent },
      { path: '', redirectTo: 'restaurant', pathMatch: 'full' }
    ]
  },

  
  {
    path: 'customer',
    component: CustomerComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'restaurants', component: RestaurantListingComponent },
      { path: 'menu/:id', component: RestaurantMenuComponent },
      { path: 'cart', component: ViewCartComponent },
      { path: 'orders', component: ViewOrderComponent },
      { path: 'account', component: AccountComponent },
      { path: '', redirectTo: 'restaurants', pathMatch: 'full' }
    ]
  },

  
  {
    path: 'restaurant-user/:id',
    loadComponent: () => import('./UI/restaurant-user/restaurant-user.component').then(m => m.RestaurantUserComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'edit-details',
        loadComponent: () =>
          import('./UI/restaurant-user/edit-details/edit-details.component').then(m => m.EditDetailsComponent)
      },
      {
        path: 'menu-items',
        loadComponent: () =>
          import('./UI/restaurant-user/menu-items/menu-items.component').then(m => m.MenuItemsComponent)
      },
      {
        path: 'order-details',
        loadComponent: () =>
          import('./UI/restaurant-user/order-details/order-details.component').then(m => m.OrderDetailsComponent)
      },
      { path: '', redirectTo: 'edit-details', pathMatch: 'full' }
    ]
  }
];

export const appConfig = {
  providers: [provideRouter(routes)]
};
