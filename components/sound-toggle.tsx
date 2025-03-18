"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { soundManager } from "@/lib/sound-effects"

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(false)

  // Initialize mute state on component mount
  useEffect(() => {
    if (soundManager) {
      setIsMuted(soundManager.isMuted())
    }
  }, [])

  const toggleMute = () => {
    if (soundManager) {
      const newMutedState = soundManager.toggleMute()
      setIsMuted(newMutedState)
    }
  }

  return (
    <Button
      onClick={toggleMute}
      className="w-8 h-8 rounded-full flex items-center justify-center bg-white"
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
          <path d="M15 8a5 5 0 0 1 0 8"></path>
          <path d="M17.7 5a9 9 0 0 1 0 14"></path>
          <path d="M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 10 4v16a.8.8 0 0 1-1.5.5L5 16H4"></path>
        </svg>
      )}
    </Button>
  )
} 