import express from 'express';
import authRoute from './modules/auth/auth.routes.js';
import workspaceRoute from './modules/workspace/workspace.routes.js';
import onboardingRoute from './modules/onboarding/onboarding.routes.js';
import contactsRoute from './modules/contacts/contacts.routes.js';
import bookingsRoute from './modules/bookings/bookings.routes.js';
import formsRoute from './modules/forms/forms.routes.js';
import inventoryRoute from './modules/inventory/inventory.routes.js';
import inboxRoute from './modules/inbox/inbox.routes.js';
import dashboardRoute from './modules/dashboard/dashboard.routes.js';
import staffRoute from './modules/staff/staff.routes.js';
import alertsRoute from './modules/alerts/alerts.routes.js';

import publicRoute from './modules/public/public.routes.js';
import servicesRoute from './modules/services/services.routes.js';
import integrationsRoute from './modules/integrations/integrations.routes.js';
import uploadRoute from './modules/upload/upload.routes.js';

const router = express.Router();

const defaultRoutes = [
    { path: '/auth', route: authRoute },
    { path: '/workspace', route: workspaceRoute },
    { path: '/workspaces', route: workspaceRoute },

    { path: '/onboarding', route: onboardingRoute },
    { path: '/contacts', route: contactsRoute },
    { path: '/bookings', route: bookingsRoute },
    { path: '/forms', route: formsRoute },
    { path: '/inventory', route: inventoryRoute },
    { path: '/inbox', route: inboxRoute },
    { path: '/dashboard', route: dashboardRoute },
    { path: '/staff', route: staffRoute },
    { path: '/alerts', route: alertsRoute },
    { path: '/public', route: publicRoute },
    { path: '/services', route: servicesRoute },
    { path: '/integrations', route: integrationsRoute },
    { path: '/upload', route: uploadRoute },
];
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
export default router;
