import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { 
    Book, 
    Clock, 
    Code, 
    FileText, 
    HelpCircle, 
    Mail, 
    MessageSquare, 
    Phone, 
    PlayCircle, 
    Search, 
    Send, 
    Star,
    ExternalLink,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Help & Support',
        href: route('admin.help-support'),
    },
];

interface FAQ {
    category: string;
    questions: Array<{
        question: string;
        answer: string;
    }>;
}

interface Resource {
    title: string;
    description: string;
    icon: string;
    link: string;
}

interface ContactInfo {
    email: string;
    phone: string;
    hours: string;
    response_time: string;
}

interface HelpSupportProps extends PageProps {
    faqs: FAQ[];
    contactInfo: ContactInfo;
    resources: Resource[];
}

export default function HelpSupport({ faqs, contactInfo, resources }: HelpSupportProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('faq');

    const ticketForm = useForm({
        subject: '',
        category: '',
        priority: '',
        message: '',
    });

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        ticketForm.post(route('admin.help-support.ticket'), {
            onSuccess: () => {
                toast.success('Support ticket submitted successfully!');
                ticketForm.reset();
            },
            onError: () => {
                toast.error('Failed to submit ticket. Please try again.');
            },
        });
    };

    const filteredFAQs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
            q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    })).filter(category => category.questions.length > 0);

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'book':
                return <Book className="h-5 w-5" />;
            case 'play-circle':
                return <PlayCircle className="h-5 w-5" />;
            case 'code':
                return <Code className="h-5 w-5" />;
            case 'star':
                return <Star className="h-5 w-5" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'destructive';
            case 'high':
                return 'warning';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'default';
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Help & Support" />

            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                        <p className="text-muted-foreground mt-2">
                            Find answers to your questions, access resources, and contact support
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('faq')}>
                        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">Browse FAQs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Find quick answers to common questions</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('ticket')}>
                        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">Submit Ticket</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Get help from our support team</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('contact')}>
                        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                            <Phone className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">Contact Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Direct contact information</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="faq">FAQs</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                        <TabsTrigger value="ticket">Submit Ticket</TabsTrigger>
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                    </TabsList>

                    {/* FAQ Tab */}
                    <TabsContent value="faq" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Frequently Asked Questions</CardTitle>
                                <CardDescription>
                                    Search through our comprehensive FAQ database
                                </CardDescription>
                                <div className="relative mt-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search FAQs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredFAQs.length > 0 ? (
                                    <Accordion type="single" collapsible className="w-full">
                                        {filteredFAQs.map((category, categoryIndex) => (
                                            <div key={categoryIndex} className="mb-6">
                                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                    <Badge variant="outline">{category.category}</Badge>
                                                </h3>
                                                {category.questions.map((qa, qaIndex) => (
                                                    <AccordionItem 
                                                        key={`${categoryIndex}-${qaIndex}`} 
                                                        value={`${categoryIndex}-${qaIndex}`}
                                                    >
                                                        <AccordionTrigger className="text-left hover:no-underline">
                                                            <div className="flex items-start gap-2">
                                                                <HelpCircle className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                                                                <span>{qa.question}</span>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            <div className="pl-6 text-muted-foreground">
                                                                {qa.answer}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </div>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No FAQs found matching your search.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Resources Tab */}
                    <TabsContent value="resources" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resources & Documentation</CardTitle>
                                <CardDescription>
                                    Access guides, tutorials, and documentation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {resources.map((resource, index) => (
                                        <Card 
                                            key={index} 
                                            className="hover:shadow-md transition-shadow cursor-pointer group"
                                        >
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                            {getIconComponent(resource.icon)}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base">{resource.title}</CardTitle>
                                                            <CardDescription className="text-sm mt-1">
                                                                {resource.description}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Submit Ticket Tab */}
                    <TabsContent value="ticket" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Support Ticket</CardTitle>
                                <CardDescription>
                                    Describe your issue and our team will respond within {contactInfo.response_time}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleTicketSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Select
                                                value={ticketForm.data.category}
                                                onValueChange={(value) => ticketForm.setData('category', value)}
                                            >
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="technical">Technical Issue</SelectItem>
                                                    <SelectItem value="billing">Billing & Payments</SelectItem>
                                                    <SelectItem value="general">General Inquiry</SelectItem>
                                                    <SelectItem value="feature_request">Feature Request</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {ticketForm.errors.category && (
                                                <p className="text-sm text-destructive">{ticketForm.errors.category}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select
                                                value={ticketForm.data.priority}
                                                onValueChange={(value) => ticketForm.setData('priority', value)}
                                            >
                                                <SelectTrigger id="priority">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="h-5">Low</Badge>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="medium">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="default" className="h-5">Medium</Badge>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="high">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="warning" className="h-5">High</Badge>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="urgent">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="destructive" className="h-5">Urgent</Badge>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {ticketForm.errors.priority && (
                                                <p className="text-sm text-destructive">{ticketForm.errors.priority}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Brief description of your issue"
                                            value={ticketForm.data.subject}
                                            onChange={(e) => ticketForm.setData('subject', e.target.value)}
                                        />
                                        {ticketForm.errors.subject && (
                                            <p className="text-sm text-destructive">{ticketForm.errors.subject}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Provide detailed information about your issue..."
                                            rows={6}
                                            value={ticketForm.data.message}
                                            onChange={(e) => ticketForm.setData('message', e.target.value)}
                                        />
                                        {ticketForm.errors.message && (
                                            <p className="text-sm text-destructive">{ticketForm.errors.message}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Expected response time: {contactInfo.response_time}
                                        </p>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={ticketForm.processing}
                                        className="w-full md:w-auto"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {ticketForm.processing ? 'Submitting...' : 'Submit Ticket'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contact Tab */}
                    <TabsContent value="contact" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>
                                        Get in touch with our support team directly
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Mail className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Email Support</p>
                                            <a 
                                                href={`mailto:${contactInfo.email}`} 
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {contactInfo.email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Phone className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Phone Support</p>
                                            <a 
                                                href={`tel:${contactInfo.phone}`} 
                                                className="text-sm text-primary hover:underline"
                                            >
                                                {contactInfo.phone}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Business Hours</p>
                                            <p className="text-sm text-muted-foreground">{contactInfo.hours}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Support Guidelines</CardTitle>
                                    <CardDescription>
                                        Tips for getting help quickly
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Check FAQs first for instant answers</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Include specific error messages or screenshots</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Provide steps to reproduce the issue</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">Mention affected users or courses if applicable</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">For urgent issues, use high priority and call support</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}