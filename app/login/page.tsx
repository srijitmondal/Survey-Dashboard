"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost/sv_camera/api/user_login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const user = {
          id: String(data.id),
          name: data.name,
          role: data.role,
          email: identifier, // Assuming identifier is email
          phone_number: "", // API does not provide this
        }
        login(user)
        router.push("/dashboard/map")
      } else {
        setError(data.error || "Invalid identifier or password")
      }
    } catch (err) {
      setError("Login failed. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/space-background.webp')",
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md backdrop-blur-md bg-black/30 border border-white/10">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-semibold text-white">Sign In</CardTitle>
            <p className="text-gray-300 text-sm">Access your Survey dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Email or Phone Number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 pr-16"
                    required
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
