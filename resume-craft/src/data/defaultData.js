const defaultData = {
  personal: {
    name: "Alexandra Chen", title: "Senior Product Designer",
    email: "alex.chen@email.com", phone: "+1 (555) 234-5678",
    location: "San Francisco, CA", linkedin: "linkedin.com/in/alexchen",
    website: "alexchen.design", summary: "Results-driven product designer with 6+ years crafting user-centered digital experiences. Led design systems at Fortune 500 companies, improving conversion by 40%. Passionate about bridging business goals with intuitive interfaces."
  },
  experience: [
    { id: 1, title: "Lead Product Designer", company: "Stripe", location: "San Francisco, CA", startDate: "Jan 2022", endDate: "Present", description: "Led design for Stripe Dashboard redesign serving 2M+ merchants\nBuilt and maintained design system with 200+ components\nManaged team of 4 designers across 3 product areas" },
    { id: 2, title: "Product Designer", company: "Figma", location: "Remote", startDate: "Jun 2019", endDate: "Dec 2021", description: "Designed core editor features used by 4M+ designers daily\nConducted 50+ user interviews to inform product roadmap\nIncreased design-to-dev handoff efficiency by 35%" }
  ],
  education: [
    { id: 1, degree: "B.S. Human-Computer Interaction", school: "Carnegie Mellon University", year: "2019", gpa: "3.8" }
  ],
  skills: ["Figma", "Prototyping", "Design Systems", "User Research", "Sketch", "React", "CSS", "A/B Testing"],
  certifications: [{ id: 1, name: "Google UX Design Certificate", issuer: "Google", year: "2020" }]
};