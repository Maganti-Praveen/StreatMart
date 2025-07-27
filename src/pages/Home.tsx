import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Users, ShoppingCart, Star, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connecting Street Food Vendors
              <span className="block text-orange-500">with Quality Suppliers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your street food business with our digital supply chain platform. 
              Find reliable suppliers, compare prices, and get fresh ingredients delivered to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center justify-center"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Source Raw Materials
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform addresses all the challenges faced by street food vendors in India
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Suppliers</h3>
              <p className="text-gray-600">Connect with trusted suppliers in your area with quality ratings and reviews</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Ordering</h3>
              <p className="text-gray-600">Browse materials, compare prices, and place orders with just a few clicks</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">Track your orders in real-time from confirmation to delivery</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-600">Rate and review suppliers to ensure consistent quality for everyone</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to transform your supply chain</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* For Vendors */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">For Vendors</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-lg">Register & Setup Profile</h4>
                    <p className="text-gray-600">Create your vendor account with business details and location</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-lg">Browse & Compare</h4>
                    <p className="text-gray-600">Search for raw materials, compare prices and supplier ratings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-lg">Place Orders</h4>
                    <p className="text-gray-600">Add items to cart and place orders with preferred suppliers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-lg">Track & Review</h4>
                    <p className="text-gray-600">Monitor delivery status and rate your experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Suppliers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">For Suppliers</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-lg">Register Business</h4>
                    <p className="text-gray-600">Sign up with your business details and delivery areas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-lg">List Products</h4>
                    <p className="text-gray-600">Add your raw materials with prices, stock, and descriptions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-lg">Manage Orders</h4>
                    <p className="text-gray-600">Receive and confirm orders from vendors in your area</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-lg">Deliver & Grow</h4>
                    <p className="text-gray-600">Update delivery status and build your reputation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of vendors and suppliers already using our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start as Vendor
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors"
            >
              Join as Supplier
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}