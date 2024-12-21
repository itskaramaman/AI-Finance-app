import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import { Label } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Hero />

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((data, index) => (
              <div key={index} className="text-center">
                <Label className="text-4xl font-bold text-blue-500 mb-2">
                  {data.value}
                </Label>
                <Label className="text-gray-600">{data.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6">
                  <CardContent className="space-y-4 pt-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            How It Works?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            What Our Users Say?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => {
              return (
                <Card key={index} className="p-6">
                  <CardContent className="pt-4">
                    <div className="flex items-center mb-4">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        height={40}
                        width={40}
                        className="rounded-full"
                      />
                      <div className="ml-4">
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600">{testimonial.quote}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-center p-20">
        <div className="space-y-4 text-white">
          <h1 className="text-3xl font-semibold tracking-tight">
            Ready to Take Control of Your Finances?
          </h1>
          <p className="text-sm">
            Join thousand of users who are already managing their finances
            smarter with Welth
          </p>
          <p>
            <Link href="/dashboard">
              <Button className="bg-white hover:bg-white/95 text-blue-500 animate-bounce">
                Start Free Trial
              </Button>
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
