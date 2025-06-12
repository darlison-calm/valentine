import { ChatSimulator } from "@/components/chat-simulator";


export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-red-50">
      <div className="container mx-auto max-w-md pt-8 pb-20 px-4">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Nosso conversa especial</h1>
        <ChatSimulator />
      </div>
    </main>
  )
}
