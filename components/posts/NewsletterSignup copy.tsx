"use client"

import React from 'react'

export default function NewsletterSignup copy() {
  return (
    <div>
      <h3>Prijavi se na e-novice</h3>
      <p>Prejmi nove objave in koristne vsebine direktno v svoj email.</p>
      <form>
        <input
          type="email"
          placeholder='Tvoj email naslov'
          required
        ></input>
        <button type="submit">Prijavi se</button>
      </form>

    </div>
  )
}
