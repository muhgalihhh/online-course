window.route = (name, params, absolute, config) => {
    const routes = {
        'admin.analytics': '/admin/analytics',
        'admin.reviews': '/admin/reviews',
        'admin.reviews.update-status': '/admin/reviews/{review}/status',
        'admin.reviews.destroy': '/admin/reviews/{review}',
        'admin.settings': '/admin/settings',
        'admin.settings.update': '/admin/settings',
        // Add other existing routes as needed
        'admin.dashboard': '/admin/dashboard',
        'admin.users.index': '/admin/users',
        'admin.users.create': '/admin/users/create',
        'admin.users.edit': '/admin/users/{user}/edit',
        'admin.users.store': '/admin/users',
        'admin.users.update': '/admin/users/{user}',
        'admin.users.destroy': '/admin/users/{user}',
        'admin.courses.index': '/admin/courses',
        'admin.courses.create': '/admin/courses/create',
        'admin.courses.store': '/admin/courses',
        'admin.courses.show': '/admin/courses/{course}',
        'admin.courses.edit': '/admin/courses/{course}/edit',
        'admin.courses.update': '/admin/courses/{course}',
        'admin.courses.destroy': '/admin/courses/{course}',
        'admin.categories.index': '/admin/categories',
        'admin.categories.create': '/admin/categories/create',
        'admin.categories.store': '/admin/categories',
        'admin.categories.edit': '/admin/categories/{category}/edit',
        'admin.categories.update': '/admin/categories/{category}',
        'admin.categories.destroy': '/admin/categories/{category}',
        'admin.institutions.index': '/admin/institutions',
        'admin.institutions.create': '/admin/institutions/create',
        'admin.institutions.edit': '/admin/institutions/{institution}/edit',
        'admin.institutions.store': '/admin/institutions',
        'admin.institutions.update': '/admin/institutions/{institution}',
        'admin.transactions.index': '/admin/transactions',
        'admin.transactions.show': '/admin/transactions/{transaction}',
        'admin.transactions.update-status': '/admin/transactions/{transaction}/status',
        'admin.chapters.index': '/admin/chapters',
        'admin.chapters.create': '/admin/chapters/create',
        'admin.chapters.show': '/admin/chapters/{chapter}',
        'admin.chapters.edit': '/admin/chapters/{chapter}/edit',
        'admin.chapters.store': '/admin/chapters',
        'admin.chapters.update': '/admin/chapters/{chapter}',
        'admin.chapters.destroy': '/admin/chapters/{chapter}',
        'admin.materials.index': '/admin/materials',
        'admin.materials.create': '/admin/materials/create',
        'admin.materials.show': '/admin/materials/{material}',
        'admin.materials.edit': '/admin/materials/{material}/edit',
        'admin.materials.store': '/admin/materials',
        'admin.materials.update': '/admin/materials/{material}',
        'admin.materials.destroy': '/admin/materials/{material}',
        'admin.materials.upload': '/admin/materials/upload',
        'admin.materials.by-chapter': '/admin/chapters/{chapter}/materials',
        'admin.chapters.by-course': '/admin/courses/{course}/chapters',
        'profile.edit': '/settings/profile',
        'profile.update': '/settings/profile',
        'profile.destroy': '/settings/profile',
        'password.edit': '/settings/password',
        'password.update': '/settings/password',
        'appearance': '/settings/appearance',
        'verification.send': '/email/verification-notification',
        'verification.notice': '/verify-email',
        'verification.verify': '/verify-email/{id}/{hash}',
        'password.request': '/forgot-password',
        'password.email': '/forgot-password',
        'password.reset': '/reset-password/{token}',
        'password.store': '/reset-password',
        'password.confirm': '/confirm-password',
        'logout': '/logout',
        'home': '/',
        'dashboard': '/dashboard',
        'user.dashboard': '/user/dashboard',
        'user.profile': '/user/profile',
        'login': '/login',
        'register': '/register'
    };

    let url = routes[name];
    if (!url) {
        throw new Error(`Route '${name}' not found`);
    }

    if (params) {
        // Replace route parameters
        Object.keys(params).forEach(key => {
            url = url.replace(`{${key}}`, params[key]);
        });
    }

    if (absolute) {
        url = window.location.origin + url;
    }

    return url;
};