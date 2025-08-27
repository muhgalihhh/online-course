<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HelpSupportController extends Controller
{
    /**
     * Display the help and support page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $faqs = [
            [
                'category' => 'User Management',
                'questions' => [
                    [
                        'question' => 'How do I add a new user?',
                        'answer' => 'Navigate to Users menu and click on "Add New User" button. Fill in the required information and click Save.',
                    ],
                    [
                        'question' => 'How can I change user roles?',
                        'answer' => 'Go to Users menu, click on the user you want to edit, and change the role from the dropdown menu.',
                    ],
                    [
                        'question' => 'How to reset a user password?',
                        'answer' => 'In the Users menu, click on the user and select "Reset Password" option. The user will receive an email with reset instructions.',
                    ],
                ],
            ],
            [
                'category' => 'Course Management',
                'questions' => [
                    [
                        'question' => 'How do I create a new course?',
                        'answer' => 'Go to Courses menu and click "Create Course". Fill in course details, add chapters and materials, then publish.',
                    ],
                    [
                        'question' => 'How to add chapters to a course?',
                        'answer' => 'Open the course you want to edit, go to the Chapters tab, and click "Add Chapter".',
                    ],
                    [
                        'question' => 'How to manage course materials?',
                        'answer' => 'Navigate to the course, select the chapter, and use the Materials section to upload videos, documents, or other resources.',
                    ],
                ],
            ],
            [
                'category' => 'Transaction & Payments',
                'questions' => [
                    [
                        'question' => 'How to view all transactions?',
                        'answer' => 'Go to Transactions menu to see all payment records. You can filter by status, date, or user.',
                    ],
                    [
                        'question' => 'How to approve pending payments?',
                        'answer' => 'In Transactions menu, filter by "Pending" status, review the payment proof, and click "Approve" or "Reject".',
                    ],
                    [
                        'question' => 'How to export transaction reports?',
                        'answer' => 'Go to Transactions or Analytics page and click the "Export" button to download reports in CSV or Excel format.',
                    ],
                ],
            ],
            [
                'category' => 'Analytics & Reports',
                'questions' => [
                    [
                        'question' => 'How to view platform statistics?',
                        'answer' => 'The Dashboard provides an overview of key metrics. For detailed analytics, go to the Analytics menu.',
                    ],
                    [
                        'question' => 'How to generate custom reports?',
                        'answer' => 'In Analytics menu, use the date range selector and filters to customize your report, then click "Generate Report".',
                    ],
                    [
                        'question' => 'How to track course performance?',
                        'answer' => 'Go to Analytics > Course Performance to see enrollment numbers, completion rates, and student feedback.',
                    ],
                ],
            ],
            [
                'category' => 'Settings & Configuration',
                'questions' => [
                    [
                        'question' => 'How to update institution profile?',
                        'answer' => 'Go to Institution menu and click "Edit Profile" to update institution name, logo, and other details.',
                    ],
                    [
                        'question' => 'How to change my admin password?',
                        'answer' => 'Go to Settings > Security tab and use the "Change Password" form.',
                    ],
                    [
                        'question' => 'How to manage email notifications?',
                        'answer' => 'In Settings > Notifications, you can configure which emails to receive and their frequency.',
                    ],
                ],
            ],
        ];

        $contactInfo = [
            'email' => 'support@lms-platform.com',
            'phone' => '+62 21 1234 5678',
            'hours' => 'Monday - Friday, 9:00 AM - 6:00 PM (WIB)',
            'response_time' => '24-48 hours',
        ];

        $resources = [
            [
                'title' => 'User Manual',
                'description' => 'Complete guide for using the admin panel',
                'icon' => 'book',
                'link' => '#',
            ],
            [
                'title' => 'Video Tutorials',
                'description' => 'Step-by-step video guides',
                'icon' => 'play-circle',
                'link' => '#',
            ],
            [
                'title' => 'API Documentation',
                'description' => 'Technical documentation for developers',
                'icon' => 'code',
                'link' => '#',
            ],
            [
                'title' => 'Best Practices',
                'description' => 'Tips for managing your LMS effectively',
                'icon' => 'star',
                'link' => '#',
            ],
        ];

        return Inertia::render('admin/help-support', [
            'faqs' => $faqs,
            'contactInfo' => $contactInfo,
            'resources' => $resources,
        ]);
    }

    /**
     * Submit a support ticket.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function submitTicket(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string|in:technical,billing,general,feature_request',
            'priority' => 'required|string|in:low,medium,high,urgent',
            'message' => 'required|string|min:10',
        ]);

        // Here you would typically save the ticket to database
        // For now, we'll just return a success message
        
        return redirect()->back()->with('success', 'Your support ticket has been submitted. We will respond within 24-48 hours.');
    }
}