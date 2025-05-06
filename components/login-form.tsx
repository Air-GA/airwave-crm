"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to authenticate
      // For demo purposes, we'll use hardcoded credentials
      const role = authenticateUser(username, password)

      if (role) {
        // Store authentication in localStorage for demo purposes
        localStorage.setItem(
          "airGeorgiaAuth",
          JSON.stringify({
            isAuthenticated: true,
            role,
            username,
          }),
        )

        toast({
          title: "Login successful",
          description: `Welcome back, ${username}!`,
        })

        // Redirect based on role
        router.push(`/dashboard/${role}`)
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mock authentication function
  const authenticateUser = (username: string, password: string) => {
    // In a real app, this would verify credentials against a database
    const users = {
      // Example accounts for each role
      "customer@example.com": { password: "customer123", role: "customer" },
      "tech@example.com": { password: "tech123", role: "tech" },
      "accounting@example.com": { password: "accounting123", role: "accounting" },
      "admin@example.com": { password: "admin123", role: "admin" },
    }

    const user = users[username as keyof typeof users]

    if (user && user.password === password) {
      return user.role
    }

    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
      <div className="mt-4 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Example accounts:</p>
        <ul className="space-y-1">
          <li>Customer: customer@example.com / customer123</li>
          <li>Technician: tech@example.com / tech123</li>
          <li>Accounting: accounting@example.com / accounting123</li>
          <li>Admin: admin@example.com / admin123</li>
        </ul>
      </div>
    </form>
  )
}
