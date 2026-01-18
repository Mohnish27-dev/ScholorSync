"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export default function AppleCardsCarouselDemo() {
    const cards = data.map((card, index) => (
        <Card key={card.src} card={card} index={index} />
    ));

    return (
        <div className="w-full h-full py-20">
            <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-slate-800 dark:text-white font-sans">
                Success Stories from ScholarSync
            </h2>
            <Carousel items={cards} />
        </div>
    );
}

const StoryContent = ({
    name,
    scholarship,
    amount,
    testimonial
}: {
    name: string;
    scholarship: string;
    amount: string;
    testimonial: string;
}) => {
    return (
        <>
            <div className="bg-slate-50 dark:bg-slate-800 p-8 md:p-14 rounded-3xl mb-4">
                <p className="text-slate-600 dark:text-slate-300 text-base md:text-2xl font-sans max-w-3xl mx-auto">
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                        {name}
                    </span>{" "}
                    secured {scholarship} worth {amount}.
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg mt-6 max-w-3xl mx-auto italic">
                    &quot;{testimonial}&quot;
                </p>
            </div>
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-8 md:p-14 rounded-3xl mb-4">
                <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                        <p className="text-white text-3xl md:text-5xl font-bold">{amount}</p>
                        <p className="text-teal-100 text-sm md:text-base mt-2">Scholarship Secured</p>
                    </div>
                </div>
            </div>
        </>
    );
};

const data = [
    {
        category: "PM YASASVI Scholarship",
        title: "₹75,000 awarded to Priya Sharma",
        src: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=2940&auto=format&fit=crop",
        content: (
            <StoryContent
                name="Priya Sharma"
                scholarship="PM YASASVI Scholarship"
                amount="₹75,000"
                testimonial="ScholarSync's AI matching found this scholarship I never knew existed. The auto-fill feature saved me hours of application work!"
            />
        ),
    },
    {
        category: "Merit-cum-Means",
        title: "Full tuition covered for Rahul K.",
        src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop",
        content: (
            <StoryContent
                name="Rahul Kumar"
                scholarship="Central Sector Scholarship"
                amount="₹1,20,000/year"
                testimonial="I was hesitant to apply because I thought I wouldn't qualify. ScholarSync showed me I had a 92% match!"
            />
        ),
    },
    // {
    //     category: "State Government",
    //     title: "Ananya got ₹50,000 for engineering",
    //     src: "https://images.unsplash.com/photo-1589156288859-f0cb0d3ade43?q=80&w=2940&auto=format&fit=crop",
    //     content: (
    //         <StoryContent
    //             name="Ananya Patel"
    //             scholarship="Gujarat State Merit Scholarship"
    //             amount="₹50,000"
    //             testimonial="The deadline reminder feature saved me! I almost missed the application window but got an alert 3 days before."
    //         />
    //     ),
    // },
    {
        category: "National Fellowship",
        title: "Research fellowship for Vikram",
        src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2940&auto=format&fit=crop",
        content: (
            <StoryContent
                name="Vikram Singh"
                scholarship="CSIR-UGC NET JRF"
                amount="₹31,000/month"
                testimonial="ScholarSync helped me understand exactly what documents I needed. The community tips were invaluable!"
            />
        ),
    },
    {
        category: "Private Foundation",
        title: "Tech scholarship for Meera",
        src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2940&auto=format&fit=crop",
        content: (
            <StoryContent
                name="Meera Nair"
                scholarship="Infosys Foundation Scholarship"
                amount="₹1,00,000"
                testimonial="I discovered 15 scholarships I could apply to, all matching my profile. Ended up getting 3 of them!"
            />
        ),
    },
    {
        category: "Micro-Fellowship",
        title: "Earned ₹25,000 solving real problems",
        src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2940&auto=format&fit=crop",
        content: (
            <StoryContent
                name="Arjun Reddy"
                scholarship="ScholarSync Micro-Fellowship"
                amount="₹25,000"
                testimonial="Not a scholarship, but I earned money while building my portfolio through the Micro-Fellowship program!"
            />
        ),
    },
];
