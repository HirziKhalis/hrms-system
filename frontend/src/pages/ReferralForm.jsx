import React, { useState } from "react";
import InputField from "../components/InputField";
import FadeTransition from "../components/FadeTransition";

const ReferralForm = () => {
  const [formData, setFormData] = useState({
    candidate_name: "",
    position: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit referral");

      setMessage("✅ Referral submitted successfully!");
      setFormData({ candidate_name: "", position: "" });
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <FadeTransition>
      <div className="max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Refer a Candidate</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Candidate's Full Name"
            type="text"
            name="candidate_name"
            value={formData.candidate_name}
            onChange={handleChange}
            placeholder="e.g., Jane Doe"
          />

          <InputField
            label="Position for Referral"
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="e.g., Software Engineer"
          />

          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Submit Referral
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm font-medium text-green-600">{message}</p>
        )}
      </div>
    </FadeTransition>
  );
};

export default ReferralForm;
