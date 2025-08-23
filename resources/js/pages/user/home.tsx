import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserLayout from '@/layouts/user-layout';
import {
    ArrowRight,
    Award,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    GraduationCap,
    Mail,
    PlayCircle,
    Quote,
    Shield,
    Sparkles,
    Star,
    Users,
    Video,
} from 'lucide-react';
import React, { useState } from 'react';

// Type definitions
interface Course {
    id: number;
    title: string;
    category: string;
    thumbnail: string;
    rating: number;
    students: number;
    price: number;
    originalPrice?: number;
    badge: string;
    duration: string;
    level: string;
    description: string;
}

interface Testimonial {
    id: number;
    name: string;
    role: string;
    company: string;
    avatar: string;
    content: string;
    rating: number;
    beforeAfter: {
        before: string;
        after: string;
    };
}

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface FAQ {
    question: string;
    answer: string;
}

const Home: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);

    // Featured courses by John Doe
    const courses: Course[] = [
        {
            id: 1,
            title: 'Complete Full-Stack Web Development',
            category: 'development',
            thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
            rating: 4.9,
            students: 3247,
            price: 199.99,
            originalPrice: 299.99,
            badge: 'Bestseller',
            duration: '52 hours',
            level: 'Beginner to Advanced',
            description: 'Master modern web development from basics to deployment with real projects',
        },
        {
            id: 2,
            title: 'Advanced React & TypeScript Mastery',
            category: 'development',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
            rating: 4.8,
            students: 2156,
            price: 149.99,
            originalPrice: 199.99,
            badge: 'Advanced',
            duration: '38 hours',
            level: 'Intermediate',
            description: 'Deep dive into React ecosystem with TypeScript, testing, and best practices',
        },
        {
            id: 3,
            title: 'UI/UX Design Psychology',
            category: 'design',
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
            rating: 4.9,
            students: 1834,
            price: 129.99,
            originalPrice: 179.99,
            badge: 'Popular',
            duration: '28 hours',
            level: 'All Levels',
            description: 'Learn the psychology behind great design and create user-centered experiences',
        },
        {
            id: 4,
            title: 'Personal Branding for Developers',
            category: 'business',
            thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
            rating: 4.7,
            students: 1542,
            price: 99.99,
            originalPrice: 149.99,
            badge: 'New',
            duration: '20 hours',
            level: 'All Levels',
            description: 'Build your professional brand and accelerate your tech career',
        },
    ];

    // Student success stories
    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Senior Frontend Developer',
            company: 'Google',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
            content:
                "John's teaching style is exceptional. His real-world approach helped me transition from a complete beginner to landing my dream job at Google. The projects we built were exactly what I needed in my portfolio.",
            rating: 5,
            beforeAfter: {
                before: 'Retail Manager',
                after: 'Senior Frontend Developer at Google',
            },
        },
        {
            id: 2,
            name: 'Marcus Chen',
            role: 'Full Stack Developer',
            company: 'Startup Founder',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            content:
                "The depth of knowledge John shares is incredible. Not just the technical skills, but the business insights that helped me launch my own SaaS product. It's generating $10K/month now!",
            rating: 5,
            beforeAfter: {
                before: 'Corporate Employee',
                after: 'SaaS Founder ($10K MRR)',
            },
        },
        {
            id: 3,
            name: 'Elena Rodriguez',
            role: 'UX Designer',
            company: 'Netflix',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
            content:
                "John's design psychology course completely changed how I approach user experience. The frameworks I learned helped me redesign a major feature at Netflix that increased engagement by 34%.",
            rating: 5,
            beforeAfter: {
                before: 'Junior Designer',
                after: 'Senior UX Designer at Netflix',
            },
        },
    ];

    // Why choose LearnCraft
    const features: Feature[] = [
        {
            icon: <GraduationCap className="h-6 w-6" />,
            title: 'Industry Expert',
            description: '10+ years building products at Fortune 500 companies and successful startups',
        },
        {
            icon: <Video className="h-6 w-6" />,
            title: 'Project-Based Learning',
            description: 'Build real applications that you can add to your portfolio and showcase to employers',
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: 'Personal Mentorship',
            description: 'Get direct feedback on your projects and career guidance from John personally',
        },
        {
            icon: <Award className="h-6 w-6" />,
            title: 'Job-Ready Skills',
            description: 'Learn the exact skills and technologies used by top tech companies today',
        },
        {
            icon: <Clock className="h-6 w-6" />,
            title: 'Lifetime Access',
            description: 'Keep access to all course materials forever, including future updates and bonuses',
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: '60-Day Guarantee',
            description: 'Not satisfied? Get a full refund within 60 days, no questions asked',
        },
    ];

    // FAQ
    const faqs: FAQ[] = [
        {
            question: 'Who is John Doe and why should I learn from him?',
            answer: "I'm a Senior Software Engineer with 10+ years of experience at companies like Google, Netflix, and successful startups. I've mentored 100+ developers and helped them land jobs at top tech companies. My teaching focuses on real-world skills that employers actually want.",
        },
        {
            question: 'What makes these courses different from other online courses?',
            answer: "Unlike generic courses, mine are based on actual projects I've built in my career. You'll learn the same tools, patterns, and best practices used at top tech companies. Plus, you get personal feedback and mentorship from me throughout your journey.",
        },
        {
            question: 'How long will it take to complete a course?',
            answer: 'It depends on your pace and schedule. Most students complete courses in 2-3 months studying 5-10 hours per week. But you have lifetime access, so you can learn at your own speed without any pressure.',
        },
        {
            question: 'Do I need prior experience to start?',
            answer: 'My courses cater to all levels. Complete beginners can start with the Full-Stack course, while experienced developers can jump into advanced topics. Each course clearly states the prerequisites.',
        },
        {
            question: 'Will I get help if Im stuck?',
            answer: 'Absolutely! You get access to our private Discord community where I personally answer questions. Plus, all students can book 1-on-1 mentorship calls with me for career guidance and code reviews.',
        },
        {
            question: 'What if I dont like the course?',
            answer: "I offer a 60-day money-back guarantee. If you're not satisfied for any reason, just email me and I'll refund your purchase immediately. I want you to be completely confident in your investment.",
        },
    ];

    const nextTestimonial = (): void => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = (): void => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const handleSubscribe = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        console.log('Subscribed:', email);
        setEmail('');
        // TODO: Implement newsletter subscription
    };

    return (
        <UserLayout>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
                <div className="bg-grid-white/[0.02] absolute inset-0 bg-[size:50px_50px]" />
                <div className="relative container mx-auto px-4 py-20 lg:py-28">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <Badge className="inline-flex items-center gap-2 px-4 py-2" variant="secondary">
                                <Sparkles className="h-4 w-4" />
                                <span>Trusted by 8,000+ Students Worldwide</span>
                            </Badge>

                            <div className="space-y-6">
                                <h1 className="text-4xl leading-tight font-bold lg:text-6xl">
                                    Master Tech Skills with a
                                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Real Expert</span>
                                </h1>

                                <p className="max-w-lg text-xl text-muted-foreground">
                                    Learn from John Doe, Senior Engineer at top tech companies. Get the exact skills that land jobs at Google,
                                    Netflix, and successful startups.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button size="lg" className="group px-8 py-6 text-lg">
                                    Browse Courses
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button size="lg" variant="outline" className="group px-8 py-6 text-lg">
                                    <PlayCircle className="mr-2 h-5 w-5" />
                                    Watch Free Preview
                                </Button>
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center gap-8 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {testimonials.slice(0, 3).map((testimonial) => (
                                            <Avatar key={testimonial.id} className="h-10 w-10 border-2 border-background">
                                                <AvatarImage src={testimonial.avatar} />
                                                <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">8K+ Happy Students</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="ml-2 text-sm text-muted-foreground">4.9/5 Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Instructor Profile */}
                        <div className="relative">
                            <Card className="border-2 border-primary/20 bg-card/50 p-6 backdrop-blur">
                                <div className="space-y-4 text-center">
                                    <Avatar className="mx-auto h-24 w-24">
                                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-2xl font-bold">John Doe</h3>
                                        <p className="text-muted-foreground">Senior Software Engineer</p>
                                        <p className="text-sm text-primary">Google • Netflix • Startup Founder</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-primary">10+</p>
                                            <p className="text-xs text-muted-foreground">Years Experience</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-primary">8K+</p>
                                            <p className="text-xs text-muted-foreground">Students Taught</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-primary">95%</p>
                                            <p className="text-xs text-muted-foreground">Job Success Rate</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-left text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Built products used by millions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Mentored 100+ successful developers</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Founded 2 successful startups</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="about" className="bg-muted/30 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold">Why Learn with John?</h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            Get the insider knowledge and mentorship that traditional courses can't provide
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                                <CardHeader>
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-4xl font-bold">Featured Courses</h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">Carefully crafted courses based on real industry experience</p>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="development">Development</TabsTrigger>
                            <TabsTrigger value="design">Design</TabsTrigger>
                            <TabsTrigger value="business">Business</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-0">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {courses.map((course) => (
                                    <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-xl">
                                        <div className="relative">
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <Badge className="absolute top-4 left-4" variant="secondary">
                                                {course.badge}
                                            </Badge>
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{course.description}</p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{course.level}</span>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{course.duration}</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold">{course.rating}</span>
                                                    <span className="text-sm text-muted-foreground">({course.students.toLocaleString()})</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold">${course.price}</span>
                                                    {course.originalPrice && (
                                                        <span className="text-sm text-muted-foreground line-through">${course.originalPrice}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button size="sm" className="group">
                                                Enroll Now
                                                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="development" className="mt-0">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {courses
                                    .filter((course) => course.category === 'development')
                                    .map((course) => (
                                        <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-xl">
                                            <div className="relative">
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <Badge className="absolute top-4 left-4" variant="secondary">
                                                    {course.badge}
                                                </Badge>
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{course.description}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-semibold">{course.rating}</span>
                                                        <span className="text-sm text-muted-foreground">({course.students.toLocaleString()})</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex items-center justify-between">
                                                <span className="text-2xl font-bold">${course.price}</span>
                                                <Button size="sm">Enroll Now</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="design" className="mt-0">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {courses
                                    .filter((course) => course.category === 'design')
                                    .map((course) => (
                                        <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-xl">
                                            <div className="relative">
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <Badge className="absolute top-4 left-4" variant="secondary">
                                                    {course.badge}
                                                </Badge>
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{course.description}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-semibold">{course.rating}</span>
                                                        <span className="text-sm text-muted-foreground">({course.students.toLocaleString()})</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex items-center justify-between">
                                                <span className="text-2xl font-bold">${course.price}</span>
                                                <Button size="sm">Enroll Now</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="business" className="mt-0">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {courses
                                    .filter((course) => course.category === 'business')
                                    .map((course) => (
                                        <Card key={course.id} className="group overflow-hidden transition-all hover:shadow-xl">
                                            <div className="relative">
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <Badge className="absolute top-4 left-4" variant="secondary">
                                                    {course.badge}
                                                </Badge>
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{course.description}</p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-semibold">{course.rating}</span>
                                                        <span className="text-sm text-muted-foreground">({course.students.toLocaleString()})</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex items-center justify-between">
                                                <span className="text-2xl font-bold">${course.price}</span>
                                                <Button size="sm">Enroll Now</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Success Stories Section */}
            <section id="testimonials" className="bg-muted/30 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold">Student Success Stories</h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            See how John's students transformed their careers and achieved their goals
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        <Card className="relative overflow-hidden border-2">
                            <CardContent className="p-8 md:p-12">
                                <div className="mb-6 flex items-center justify-between">
                                    <Quote className="h-12 w-12 text-primary/20" />
                                    <div className="text-right">
                                        <Badge variant="outline" className="mb-2">
                                            Success Story
                                        </Badge>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className="mb-8 text-lg leading-relaxed italic md:text-xl">"{testimonials[currentTestimonial].content}"</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={testimonials[currentTestimonial].avatar} />
                                            <AvatarFallback>{testimonials[currentTestimonial].name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-lg font-semibold">{testimonials[currentTestimonial].name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="hidden text-right md:block">
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <p className="mb-1 text-xs font-medium text-green-600">Career Transformation</p>
                                            <p className="text-sm text-green-800">
                                                <span className="block text-xs opacity-75">
                                                    {testimonials[currentTestimonial].beforeAfter.before}
                                                </span>
                                                <ArrowRight className="mx-1 inline h-3 w-3" />
                                                <span className="font-medium">{testimonials[currentTestimonial].beforeAfter.after}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 md:hidden">
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <p className="mb-1 text-xs font-medium text-green-600">Career Transformation</p>
                                        <p className="text-sm text-green-800">
                                            <span className="block text-xs opacity-75">{testimonials[currentTestimonial].beforeAfter.before}</span>
                                            <ArrowRight className="mx-1 inline h-3 w-3" />
                                            <span className="font-medium">{testimonials[currentTestimonial].beforeAfter.after}</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>

                            <div className="absolute right-4 bottom-4 flex gap-2">
                                <Button size="sm" variant="outline" onClick={prevTestimonial} className="h-10 w-10 p-0">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={nextTestimonial} className="h-10 w-10 p-0">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-4xl font-bold">Frequently Asked Questions</h2>
                        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                            Got questions? Here are the most common ones I get from students
                        </p>
                    </div>

                    <div className="mx-auto max-w-3xl">
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="rounded-lg border-2 px-6 transition-colors hover:border-primary/50"
                                >
                                    <AccordionTrigger className="py-6 text-left hover:no-underline">
                                        <span className="pr-4 font-semibold">{faq.question}</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 pb-6 leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-primary/5 py-20">
                <div className="container mx-auto px-4">
                    <Card className="mx-auto max-w-2xl border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardContent className="p-8 text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold">Join 5,000+ Developers</h3>
                            <p className="mb-6 text-muted-foreground">
                                Get free coding tips, career advice, and be the first to know about new courses and special discounts
                            </p>
                            <form onSubmit={handleSubscribe} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1"
                                    required
                                />
                                <Button type="submit" className="group">
                                    Subscribe Free
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </form>
                            <p className="mt-4 text-xs text-muted-foreground">
                                No spam ever. Unsubscribe anytime.
                                <span className="font-medium"> Free coding resources included!</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="mx-auto max-w-3xl space-y-6">
                        <h2 className="text-4xl font-bold">Ready to Transform Your Career?</h2>
                        <p className="text-xl text-muted-foreground">
                            Join thousands of students who've accelerated their careers with real-world skills and personal mentorship
                        </p>
                        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                            <Button size="lg" className="group px-8 py-6 text-lg">
                                Start Learning Today
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                                Schedule a Call
                            </Button>
                        </div>
                        <p className="pt-4 text-sm text-muted-foreground">
                            <span className="font-medium">60-day money-back guarantee</span> •
                            <span className="font-medium"> Personal mentorship included</span> •<span className="font-medium"> Lifetime access</span>
                        </p>
                    </div>
                </div>
            </section>
        </UserLayout>
    );
};

export default Home;
