import Image from "next/image"
import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-800">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <Image src="/logo-transparent.png" alt="Air Georgia Logo" width={180} height={180} priority />
        </div>
        <div className="text-center">
          <h1 className="mb-1 text-xl font-medium text-gray-700">Welcome to Air Georgia</h1>
          <p className="mb-6 text-sm text-gray-500">Login with one of the example accounts to get started.</p>
        </div>
        <LoginForm />
        <div className="mt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Air Georgia
          <br />
          All Rights Reserved.
        </div>
      </div>
    </main>
  )
}
