"use client"

// This file handles all the sound effects for the game

// A class to manage sound effects with volume control and caching
class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {}
  private muted: boolean = false
  private volume: number = 0.5

  constructor() {
    // Preload sounds if in browser environment
    if (typeof window !== "undefined") {
      this.preloadSounds()
    }
  }

  // Preload all game sounds
  private preloadSounds() {
    this.loadSound("place", "/sounds/place.mp3")
    this.loadSound("complete", "/sounds/complete.mp3")
    this.loadSound("error", "/sounds/error.mp3")
    this.loadSound("select", "/sounds/select.mp3")
    this.loadSound("win", "/sounds/win.mp3")
    this.loadSound("lose", "/sounds/lose.mp3")
    this.loadSound("computer-move", "/sounds/computer-move.mp3")
  }

  private loadSound(name: string, path: string) {
    // Create and configure audio element
    const audio = new Audio()
    audio.src = path
    audio.preload = "auto"
    audio.volume = this.volume
    this.sounds[name] = audio
  }

  public play(name: string) {
    if (this.muted || typeof window === "undefined") return

    const sound = this.sounds[name]
    if (sound) {
      // Create a clone to allow for overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement
      clone.volume = this.volume
      clone.play().catch(error => {
        // Ignore autoplay errors - they happen when the user hasn't interacted with the page
        console.log(`Sound error (${name}):`, error)
      })
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted
  }

  public toggleMute() {
    this.muted = !this.muted
    return this.muted
  }

  public setVolume(volume: number) {
    this.volume = Math.min(Math.max(volume, 0), 1)
    // Update volume of all loaded sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume
    })
  }

  public isMuted() {
    return this.muted
  }
}

// Export a singleton instance
export const soundManager = typeof window !== "undefined" ? new SoundManager() : null

// Helper functions to play specific sounds
export function playPlaceSound() {
  soundManager?.play("place")
}

export function playErrorSound() {
  soundManager?.play("error")
}

export function playCompleteSound() {
  soundManager?.play("complete")
}

export function playSelectSound() {
  soundManager?.play("select")
}

export function playWinSound() {
  soundManager?.play("win")
}

export function playLoseSound() {
  soundManager?.play("lose")
}

export function playComputerMoveSound() {
  soundManager?.play("computer-move")
} 