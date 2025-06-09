"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Apple } from "lucide-react"
import Link from "next/link"

export default function Component() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/space-background.webp')",
        }}
      />

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Sign In Form */}
          <div className="backdrop-blur-md bg-black/30 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-semibold text-white">Sign In</h1>
                <p className="text-gray-300 text-sm">Keep it all together and you'll be fine</p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Email/Phone Input */}
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Email or Phone"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 rounded-lg focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2 relative">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 rounded-lg pr-16 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white h-auto p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="text-sm">Show</span>
                    </Button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-left">
                  <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Forgot Password
                  </Link>
                </div>

                {/* Sign In Button */}
                <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-200">
                  Sign In
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-transparent px-2 text-gray-400">or</span>
                  </div>
                </div>

                {/* Sign in with Apple */}
                <Button
                  variant="outline"
                  className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <Apple className="w-5 h-5 mr-2" />
                  Sign in with Apple
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center text-sm">
                <span className="text-gray-300">New to Atomz </span>
                <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
