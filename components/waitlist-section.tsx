"use client"

import { useState } from "react"
import AnimatedCheck from "@/components/animated-check"
import FieldLabel from "@/components/forms/FieldLabel"
import TextInput from "@/components/forms/TextInput"

const API_URL = "https://mavscan-backend.onrender.com/api/leads"

export default function WaitlistSection() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const isValid = fullName.trim() && email.trim() && country.trim()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setErrors([])
    setIsSubmitting(true)
    try {
      const body: Record<string, string> = {
        fullName: fullName.trim(),
        email: email.trim(),
        country: country.trim(),
      }
      if (phone.trim()) body.phone = phone.trim()
      if (city.trim()) body.city = city.trim()
      if (honeypot) body._honeypot = honeypot

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.status === 429) {
        setErrors([data.message || "Too many submissions. Please try again later."])
        return
      }
      if (res.status === 400) {
        setErrors(Array.isArray(data.errors) ? data.errors : [data.message || "Invalid input."])
        return
      }
      if (!res.ok) {
        setErrors(["Something went wrong. Please try again."])
        return
      }

      setSubmittedEmail(email.trim())
      setSubmitted(true)
      setFullName("")
      setEmail("")
      setPhone("")
      setCountry("")
      setCity("")
    } catch {
      setErrors(["Something went wrong. Please try again."])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="waitlist" className="scroll-mt-20 border-b border-slate-200/60 bg-[#f5f5f5] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 space-y-2 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#007FCF]">
            Get early access
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            Leave your details
          </h2>
          <p className="text-slate-600">
            We&apos;ll send you the official waitlist when it&apos;s time.
          </p>
        </header>

        {submitted ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <div className="flex justify-center">
              <AnimatedCheck className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-[#007FCF]">
              You&apos;re in
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Thanks for your interest.</h3>
            <p className="mt-3 text-slate-600">
              We&apos;ll email you at <span className="font-medium text-[#007FCF]">{submittedEmail}</span> when
              the waitlist opens.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          >
            {/* Honeypot — hidden from real users, bots may fill it in */}
            <div style={{ display: "none" }} aria-hidden="true">
              <input
                type="text"
                name="_honeypot"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel>Full name</FieldLabel>
                <TextInput
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Email</FieldLabel>
                <TextInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Phone (optional)</FieldLabel>
                <TextInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                  type="tel"
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Country</FieldLabel>
                <TextInput
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Nigeria"
                  required
                  autoComplete="country-name"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>City (optional)</FieldLabel>
                <TextInput
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lagos"
                  autoComplete="address-level2"
                />
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errors.length === 1 ? (
                  <p className="text-center">{errors[0]}</p>
                ) : (
                  <ul className="list-inside list-disc space-y-1">
                    {errors.map((msg, i) => <li key={i}>{msg}</li>)}
                  </ul>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="mt-6 w-full rounded-lg bg-[#007FCF] py-3 text-sm font-semibold text-white transition hover:bg-[#0063a1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
