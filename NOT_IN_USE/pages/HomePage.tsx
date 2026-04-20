import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Search,
  FileCheck,
  CheckCircle2,
  Wrench,
  Globe,
  Phone,
  MapPin,
  Mail,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-500">EMARA</h1>
          </Link>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
              <Globe className="w-4 h-4" />
              العربية
            </button>
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-gray-800">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Register as Owner
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Your Building,
            <br />
            <span className="text-blue-600">Perfectly Managed</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            EMARA connects property owners with trusted cleaning and maintenance
            providers. Post your needs, receive competitive bids, and hire the
            best - all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
              >
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Finding the right service provider has never been easier. Get
              started in minutes and have professionals bidding on your project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">List Your Property</h3>
              <p className="text-gray-600">
                Add your building details and the services you need
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Get Matched</h3>
              <p className="text-gray-600">
                Qualified service providers bid on your requests
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compare & Choose</h3>
              <p className="text-gray-600">
                Review bids and select the best provider for you
              </p>
            </Card>

            {/* Step 4 */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sign & Start</h3>
              <p className="text-gray-600">
                E-sign contracts and get your building serviced
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Provider CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Are You a Service Provider?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join EMARA to find new clients, bid on projects, and grow your
            business. Access a steady stream of property management contracts.
          </p>
          <Link href="/provider/register">
            <Button size="lg" variant="outline" className="text-lg px-8">
              <Wrench className="w-5 h-5 mr-2" />
              Join as Service Provider
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-2">EMARA</h3>
              <p className="text-gray-600 text-sm">
                EMARA - Your Building, Perfectly Managed
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/contact" className="hover:text-blue-600">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/provider/register"
                    className="hover:text-blue-600"
                  >
                    Join as Provider
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@imara.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +966 11 1234 5678
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Riyadh, Saudi Arabia
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <p className="text-gray-600 text-sm mb-3">
                Stay updated with latest news
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                >
                  𝕏
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                >
                  in
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                >
                  ⓦ
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-gray-600 text-sm">
            <p>© 2025 EMARA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
