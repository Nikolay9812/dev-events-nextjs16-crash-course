"use client";

import React, { useState } from "react";
import { createBooking } from "@/lib/action/booking.actions";
import posthog from "posthog-js";
const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { success } = await createBooking({ eventId, slug, email });

      if (success) {
        setSubmitted(true);
        posthog.capture("event_booked", { eventId, slug, email });
      } else {
        console.error("Booking creation failed");
        posthog.captureException("Booking creation failed");
      }
    } catch (error) {
      console.error("Booking creation failed", error);
      posthog.captureException(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p>Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            className="button-submit"
            disabled={isSubmitting}
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};
export default BookEvent;
