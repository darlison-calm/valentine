"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MessageType = "text"

interface Message {
    id: string
    content: string
    type: MessageType
    sender: "me" | "her"
}

interface ConversationNode {
    message: Message
    responses?: {
        text: string
        next: string
    }[]
    nextId?: string
    gameOver?: boolean
    happyEnding?: boolean
}

export function ChatSimulator() {
    // State for the chat
    const [messages, setMessages] = useState<Message[]>([])
    const [currentOptions, setCurrentOptions] = useState<{ text: string; next: string }[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const [isGameOver, setIsGameOver] = useState(false)
    const [gameOverAudio, setGameOverAudio] = useState<string | null>(null)
    const gameOverAudioRef = useRef<HTMLAudioElement | null>(null)
    const [isHappyEnding, setIsHappyEnding] = useState(false)
    const [happyEndingAudio, setHappyEndingAudio] = useState<string | null>(null)
    const happyEndingAudioRef = useRef<HTMLAudioElement | null>(null)

    const conversationFlow: Record<string, ConversationNode> = {
        start: {
            message: {
                id: "1",
                content: "Oi amor tava pensando em você e vim te dar um oi ❤️",
                type: "text",
                sender: "me",
            },
            responses: [
                { text: "oi moo eu também estava pensando em você!", next: "response1" },
                { text: "quero ****", next: "happyResponse1" },
                { text: "Depois a gente se fala agora nao", next: "gameOver1" },
            ],
        },
        response1: {
            message: {
                id: "2",
                content: "Lembra quando eu falei que gostava de tu na praia? Eu tava tão nervoso!",
                type: "text",
                sender: "me",
            },
            responses: [
                { text: "Sim! A gente era tão fofo no começo", next: "response2" },
                { text: "Como eu poderia esquecer? Foi perfeito", next: "response2" },
                { text: "Não me lembro de nada disso", next: "gameOver2" },
            ],
        },
        response2: {
            message: {
                id: "3",
                content: "Quero contar algo para você...",
                type: "text",
                sender: "me",
            },
            responses: [
                { text: "O que é? CONTA LOGO!", next: "romanticMessage" },
                { text: "Não estou interessada", next: "gameOver3" },
            ],
        },
        romanticMessage: {
            message: {
                id: "4",
                content:
                    "Hoje uma mulher no meu trabalho recebeu flores... e isso me deixou um pouco triste,\nporque me lembrou que, dessa vez, não vou conseguir te dar flores.\n\nTalvez você nem ligue tanto pra flores, mas eu queria te presentear com elas.\nQueria, porque você é linda como uma flor.\n\nSei que soa clichê, infantil e CRINGE, mas é exatamente assim que me sinto.\nO papel que as flores cumprem na natureza, você cumpre na minha vida.\n\nMeu amor por você cresce a cada dia.\nVocê me faz querer ser alguém melhor, mais gentil e cheio de esperança, assim como você é.\n\nCada momento que a gente passa junto, por mais simples que pareça, é especial pra mim.\nTe amo muito.",
                type: "text",
                sender: "me",
            },
            nextId: "emojiMessage",
        },
        emojiMessage: {
            message: {
                id: "5",
                content: "❤️",
                type: "text",
                sender: "me",
            },
            responses: [
                { text: "AMOR EU TE AMOOOOOO DEMAAAIS!", next: "response3" },
                { text: "Você está me fazendo corar! ❤️", next: "response3" },
                { text: "Cringe...", next: "gameOver4" },
            ],
        },
        response3: {
            message: {
                id: "6",
                content: "Tenho pensado sobre nosso futuro juntos...",
                type: "text",
                sender: "me",
            },
            responses: [
                { text: "Eu também penso", next: "final" }
            ],
        },
        final: {
            message: {
                id: "7",
                content:
                    "Quero construir uma vida contigo, te amo minha estrela, que ilumina minha mente caótica kkkk. Te amo mais do que as palavras podem expressar.",
                type: "text",
                sender: "me",
            },
            nextId: "finalEmoji",
        },
        finalEmoji: {
            message: {
                id: "8",
                content: "❤️",
                type: "text",
                sender: "me",
            },
            nextId: "complete",
        },
        complete: {
            message: {
                id: "9",
                content: "Esta conversa foi feita com amor, só para você Nicole. Se achar algum bug desculpa eu tinha pouco tempo",
                type: "text",
                sender: "me",
            },
        },
        gameOver1: {
            message: {
                id: "go1",
                content: "Ah... entendo. Talvez seja melhor falarmos depois então... 😔",
                type: "text",
                sender: "me",
            },
            gameOver: true,
        },
        gameOver2: {
            message: {
                id: "go2",
                content: "Sério? Mas foi um momento tão especial para mim... 💔",
                type: "text",
                sender: "me",
            },
            gameOver: true,
        },
        gameOver3: {
            message: {
                id: "go3",
                content: "Oh... eu pensei que você gostaria... me desculpe por incomodar 😢",
                type: "text",
                sender: "me",
            },
            gameOver: true,
        },
        gameOver4: {
            message: {
                id: "go4",
                content: "beleza então",
                type: "text",
                sender: "me",
            },
            gameOver: true,
        },
        gameOver5: {
            message: {
                id: "go5",
                content: "Você tem razão... talvez eu esteja sonhando demais. Me desculpe... 😔",
                type: "text",
                sender: "me",
            },
            gameOver: true,
        },
        // Happy ending path
        happyResponse1: {
            message: {
                id: "happy1",
                content: "TO INDOOOO",
                type: "text",
                sender: "me",
            },
            nextId: "happyEnding",
        },
        happyEnding: {
            message: {
                id: "happyEnd",
                content: "😁",
                type: "text",
                sender: "me",
            },
            happyEnding: true,
        },
    }

    // Start the conversation
    useEffect(() => {
        startConversation()
    }, [])

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (gameOverAudio && gameOverAudioRef.current) {
            gameOverAudioRef.current.src = gameOverAudio
            gameOverAudioRef.current.play()
        }
    }, [gameOverAudio])

    useEffect(() => {
        if (happyEndingAudio && happyEndingAudioRef.current) {
            happyEndingAudioRef.current.src = happyEndingAudio
            happyEndingAudioRef.current.play()
        }
    }, [happyEndingAudio])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const startConversation = () => {
        const startNode = conversationFlow["start"]
        addMessage(startNode.message)

        if (startNode.responses) {
            setCurrentOptions(startNode.responses)
        } else if (startNode.nextId) {
            setTimeout(() => continueConversation(startNode.nextId!), 1000)
        }
    }

    const addMessage = (message: Message) => {
        setMessages((prev) => [...prev, message])
    }

    const handleResponseClick = (nextId: string) => {
        // Add user's response
        const selectedOption = currentOptions.find((opt) => opt.next === nextId)
        if (selectedOption) {
            const userResponse: Message = {
                id: `user-${Date.now()}`,
                content: selectedOption.text,
                type: "text",
                sender: "her",
            }
            addMessage(userResponse)
        }

        setCurrentOptions([])
        setIsTyping(true)

        // Simulate typing delay
        setTimeout(() => {
            setIsTyping(false)
            continueConversation(nextId)
        }, 1500)
    }

    const continueConversation = (nodeId: string) => {
        const node = conversationFlow[nodeId]
        if (!node) {
            setIsComplete(true)
            return
        }

        addMessage(node.message)

        // Check if this is a game over node
        if (node.gameOver) {
            setTimeout(() => {
                setIsGameOver(true)
                setGameOverAudio("/sad-ending.mp3")
            }, 2000)
            return
        }

        // Check if this is a happy ending node
        if (node.happyEnding) {
            setTimeout(() => {
                setIsHappyEnding(true)
                setHappyEndingAudio("/happy-ending.mp3")
            }, 2000)
            return
        }

        if (node.responses) {
            setCurrentOptions(node.responses)
        } else if (node.nextId) {
            setTimeout(() => continueConversation(node.nextId!), 2000)
        } else {
            setIsComplete(true)
        }
    }

    const resetConversation = () => {
        setMessages([])
        setCurrentOptions([])
        setIsTyping(false)
        setIsComplete(false)
        setIsGameOver(false)
        setGameOverAudio(null)
        setIsHappyEnding(false)
        setHappyEndingAudio(null)

        // Stop any playing audio
        if (gameOverAudioRef.current) {
            gameOverAudioRef.current.pause()
            gameOverAudioRef.current.currentTime = 0
        }
        if (happyEndingAudioRef.current) {
            happyEndingAudioRef.current.pause()
            happyEndingAudioRef.current.currentTime = 0
        }

        startConversation()
    }

    return (
        <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-lg overflow-hidden border-2 border-pink-200 relative">
            {/* Chat header */}
            <div className="bg-pink-500 text-white p-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                    <Heart className="h-6 w-6 text-pink-500" />
                </div>
                <div className="ml-3">
                    <p className="font-medium">Dairso💞💌💘</p>
                    <p className="text-xs opacity-80">Online para você</p>
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50">
                {messages.map((message) => (
                    <div key={message.id} className={cn("flex", message.sender === "me" ? "justify-start" : "justify-end")}>
                        <div
                            className={cn(
                                "max-w-[80%] rounded-2xl p-3",
                                message.sender === "me"
                                    ? "bg-pink-500 text-white rounded-bl-none"
                                    : "bg-white border border-pink-200 rounded-br-none",
                            )}
                        >
                            <p
                                className={cn(
                                    message.content.includes("💝✨🌹") || message.content.includes("💖👑💍")
                                        ? "text-center text-lg leading-relaxed"
                                        : "",
                                )}
                            >
                                {message.content}
                            </p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-2xl p-3 rounded-bl-none">
                            <div className="flex space-x-1">
                                <div
                                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                    style={{ animationDelay: "0ms" }}
                                ></div>
                                <div
                                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                    style={{ animationDelay: "150ms" }}
                                ></div>
                                <div
                                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                    style={{ animationDelay: "300ms" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Response options */}
            <div className="p-4 bg-white border-t border-pink-100">
                {currentOptions.length > 0 ? (
                    <div className="space-y-2">
                        {currentOptions.map((option, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="w-full justify-start text-left border-pink-200 hover:bg-pink-50"
                                onClick={() => handleResponseClick(option.next)}
                            >
                                {option.text}
                            </Button>
                        ))}
                    </div>
                ) : isComplete ? (
                    <div className="flex justify-center">
                        <Button onClick={resetConversation} className="bg-pink-500 hover:bg-pink-600">
                            Start Over
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center border rounded-full px-4 py-2 border-pink-200">
                        <input
                            type="text"
                            disabled
                            placeholder={isTyping ? "Waiting for response..." : "Choose a response option..."}
                            className="flex-1 outline-none bg-transparent text-gray-400"
                        />
                        <Send className="h-5 w-5 text-pink-300" />
                    </div>
                )}
            </div>

            {/* Game Over Overlay */}
            {isGameOver && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-400 bg-opacity-90 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-sm mx-4 text-center relative overflow-hidden">
                        <style>
                            {`
                @keyframes slowBlink {
                  0%, 100% { opacity: 0.1; }
                  50% { opacity: 0.5; }
                }
              `}
                        </style>

                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute text-red-300"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationName: "slowBlink",
                                        animationDuration: "3s",
                                        animationTimingFunction: "ease-in-out",
                                        animationIterationCount: "infinite",
                                        animationDelay: `${i * 0.5}s`,
                                        fontSize: `${Math.random() * 20 + 10}px`,
                                    }}
                                >
                                    💔
                                </div>
                            ))}
                        </div>

                        <div className="relative z-10">
                            <div className="text-6xl mb-4">💔</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Over</h2>
                            <p className="text-gray-600 mb-6">Ah nãooo...não me ama mais 😢</p>
                            <Button
                                onClick={resetConversation}
                                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full"
                            >
                                Tentar novamente 💖
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Happy Ending Overlay */}
            {isHappyEnding && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-400 bg-opacity-90 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-sm mx-4 text-center relative overflow-hidden border-4 border-pink-300">
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute text-red-300"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationName: "slowBlink",
                                        animationDuration: "3s",
                                        animationTimingFunction: "ease-in-out",
                                        animationIterationCount: "infinite",
                                        animationDelay: `${i * 0.5}s`,
                                        fontSize: `${Math.random() * 20 + 10}px`,
                                    }}
                                >
                                    {i % 2 === 0 ? "😘" : "❤️"}
                                </div>
                            ))}
                        </div>

                        <div className="relative z-10">
                            <div className="text-6xl mb-4 animate-pulse">❤️</div>
                            <h2 className="text-2xl font-bold text-pink-600 mb-4">Final feliz</h2>
                            <p className="text-gray-700 mb-6 font-medium">te amo</p>
                            <Button
                                onClick={resetConversation}
                                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all"
                            >
                                Jogar Novamente 💖
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <audio ref={gameOverAudioRef} />

            <audio ref={happyEndingAudioRef} />
        </div>
    )
}
