"use client";

import * as React from "react";
import { useState, useId, useEffect, useRef, useCallback } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TypewriterProps {
    text: string | string[];
    speed?: number;
    cursor?: string;
    loop?: boolean;
    deleteSpeed?: number;
    delay?: number;
    className?: string;
}

export function Typewriter({
    text,
    speed = 100,
    cursor = "|",
    loop = false,
    deleteSpeed = 50,
    delay = 1500,
    className,
}: TypewriterProps) {
    const [displayText, setDisplayText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const indexRef = useRef(0);
    const textIndexRef = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const textArray = Array.isArray(text) ? text : [text];

    const type = useCallback(() => {
        const currentText = textArray[textIndexRef.current] || "";

        if (isTyping) {
            if (indexRef.current < currentText.length) {
                setDisplayText(currentText.slice(0, indexRef.current + 1));
                indexRef.current++;
                timeoutRef.current = setTimeout(type, speed);
            } else if (loop) {
                timeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                    type();
                }, delay);
            }
        } else {
            if (indexRef.current > 0) {
                indexRef.current--;
                setDisplayText(textArray[textIndexRef.current].slice(0, indexRef.current));
                timeoutRef.current = setTimeout(type, deleteSpeed);
            } else {
                textIndexRef.current = (textIndexRef.current + 1) % textArray.length;
                setIsTyping(true);
                timeoutRef.current = setTimeout(type, speed);
            }
        }
    }, [textArray, isTyping, loop, speed, deleteSpeed, delay]);

    useEffect(() => {
        // Reset and start typing when text changes
        indexRef.current = 0;
        textIndexRef.current = 0;
        setDisplayText("");
        setIsTyping(true);

        // Start the animation
        timeoutRef.current = setTimeout(type, speed);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [text, speed]);

    // Restart typing when isTyping changes
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(type, isTyping ? speed : deleteSpeed);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isTyping]);

    return (
        <span className={className}>
            {displayText}
            <span className="animate-pulse">{cursor}</span>
        </span>
    );
}

const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const AuthLabel = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
));
AuthLabel.displayName = "AuthLabel";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary-foreground/60 underline-offset-4 hover:underline",
                teal: "bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-md hover:shadow-lg hover:shadow-teal-500/25",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-md px-6",
                icon: "h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
    }
);
AuthButton.displayName = "AuthButton";

const AuthInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
AuthInput.displayName = "AuthInput";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, label, ...props }, ref) => {
        const id = useId();
        const [showPassword, setShowPassword] = useState(false);
        const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
        return (
            <div className="grid w-full items-center gap-2">
                {label && <AuthLabel htmlFor={id}>{label}</AuthLabel>}
                <div className="relative">
                    <AuthInput
                        id={id}
                        type={showPassword ? "text" : "password"}
                        className={cn("pe-10", className)}
                        ref={ref}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-all duration-200 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:scale-110"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                            <Eye className="size-4" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";

export interface SignInFormProps {
    onSubmit?: (email: string, password: string) => void;
    loading?: boolean;
    error?: string | null;
}

export function SignInForm({ onSubmit, loading, error }: SignInFormProps) {
    const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        onSubmit?.(email, password);
    };

    return (
        <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        ScholarSync
                    </span>
                </div>
                <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Sign in to continue your scholarship journey
                </p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-100 border border-red-300 p-3 text-sm text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <AuthLabel htmlFor="email">Email</AuthLabel>
                    <AuthInput
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />
                </div>
                <PasswordInput
                    name="password"
                    label="Password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                />
                <AuthButton
                    type="submit"
                    variant="teal"
                    className="mt-2"
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </AuthButton>
            </div>
        </form>
    );
}

export interface SignUpFormProps {
    onSubmit?: (name: string, email: string, password: string) => void;
    loading?: boolean;
    error?: string | null;
}

export function SignUpForm({ onSubmit, loading, error }: SignUpFormProps) {
    const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        onSubmit?.(name, email, password);
    };

    return (
        <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        ScholarSync
                    </span>
                </div>
                <h1 className="text-2xl font-bold mt-4">Create an account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    Start your journey to securing scholarships
                </p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-100 border border-red-300 p-3 text-sm text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <AuthLabel htmlFor="name">Full Name</AuthLabel>
                    <AuthInput
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        autoComplete="name"
                    />
                </div>
                <div className="grid gap-2">
                    <AuthLabel htmlFor="email">Email</AuthLabel>
                    <AuthInput
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />
                </div>
                <PasswordInput
                    name="password"
                    label="Password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                />
                <AuthButton
                    type="submit"
                    variant="teal"
                    className="mt-2"
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Create Account"}
                </AuthButton>
            </div>
        </form>
    );
}

interface AuthFormContainerProps {
    isSignIn: boolean;
    onToggle: () => void;
    onSignIn?: (email: string, password: string) => void;
    onSignUp?: (name: string, email: string, password: string) => void;
    onGoogleSignIn?: () => void;
    loading?: boolean;
    error?: string | null;
}

function AuthFormContainer({
    isSignIn,
    onToggle,
    onSignIn,
    onSignUp,
    onGoogleSignIn,
    loading,
    error
}: AuthFormContainerProps) {
    return (
        <div className="mx-auto grid w-[380px] gap-4">
            {isSignIn ? (
                <SignInForm onSubmit={onSignIn} loading={loading} error={error} />
            ) : (
                <SignUpForm onSubmit={onSignUp} loading={loading} error={error} />
            )}

            <div className="text-center text-sm">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                    type="button"
                    className="text-teal-600 dark:text-teal-400 font-medium hover:underline cursor-pointer transition-colors duration-200 hover:text-teal-700 dark:hover:text-teal-300"
                    onClick={onToggle}
                >
                    {isSignIn ? "Sign up" : "Sign in"}
                </button>
            </div>

            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>

            <AuthButton
                variant="outline"
                type="button"
                onClick={onGoogleSignIn}
                disabled={loading}
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Continue with Google
            </AuthButton>
        </div>
    );
}

export interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    };
}

export interface AuthUIProps {
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
    onSignIn?: (email: string, password: string) => void;
    onSignUp?: (name: string, email: string, password: string) => void;
    onGoogleSignIn?: () => void;
    loading?: boolean;
    error?: string | null;
    defaultMode?: "signin" | "signup";
}

const defaultSignInContent: AuthContentProps = {
    image: {
        src: "https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png",
        alt: "ScholarSync Sign In"
    },
    quote: {
        text: "Your future starts here. Find the scholarships you deserve.",
        author: "ScholarSync"
    }
};

const defaultSignUpContent: AuthContentProps = {
    image: {
        src: "https://i.ibb.co/HTZ6DPsS/original-33b8479c324a5448d6145b3cad7c51e7-removebg-preview.png",
        alt: "ScholarSync Sign Up"
    },
    quote: {
        text: "Join thousands of students who found their perfect scholarship match.",
        author: "ScholarSync"
    }
};

export function AuthUI({
    signInContent = {},
    signUpContent = {},
    onSignIn,
    onSignUp,
    onGoogleSignIn,
    loading,
    error,
    defaultMode = "signin"
}: AuthUIProps) {
    const [isSignIn, setIsSignIn] = useState(defaultMode === "signin");
    const toggleForm = () => setIsSignIn((prev) => !prev);

    const finalSignInContent = {
        image: { ...defaultSignInContent.image, ...signInContent.image },
        quote: { ...defaultSignInContent.quote, ...signInContent.quote },
    };
    const finalSignUpContent = {
        image: { ...defaultSignUpContent.image, ...signUpContent.image },
        quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
    };

    const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

    return (
        <div className="w-full min-h-screen md:grid md:grid-cols-2">
            <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

            {/* Form Side */}
            <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12 bg-background">
                <AuthFormContainer
                    isSignIn={isSignIn}
                    onToggle={toggleForm}
                    onSignIn={onSignIn}
                    onSignUp={onSignUp}
                    onGoogleSignIn={onGoogleSignIn}
                    loading={loading}
                    error={error}
                />
            </div>

            {/* Image Side */}
            <div
                className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
                style={{ backgroundImage: `url(${currentContent.image?.src})` }}
            >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                <div className="relative z-10 flex h-full flex-col items-center justify-end p-8 pb-16">
                    <blockquote className="space-y-3 text-center max-w-md">
                        <p className="text-xl font-medium text-foreground">
                            &ldquo;<Typewriter
                                key={currentContent.quote?.text}
                                text={currentContent.quote?.text || ""}
                                speed={50}
                                loop={false}
                            />&rdquo;
                        </p>
                        <cite className="block text-sm font-light text-muted-foreground not-italic">
                            — {currentContent.quote?.author}
                        </cite>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}

export { AuthButton, AuthInput, AuthLabel, PasswordInput };
