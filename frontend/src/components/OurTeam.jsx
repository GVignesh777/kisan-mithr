import React from "react";
import { Linkedin, Github, Mail, ExternalLink } from "lucide-react";
import useTranslation from "../hooks/useTranslation";

const TeamCard = ({ member }) => {
  return (
    <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-8 transition-all duration-500 hover:bg-zinc-800/80 hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.3)] overflow-hidden">
      {/* Glossy Overlay effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors duration-500"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Profile Image with Gradient Ring */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full animate-pulse opacity-20 blur-md group-hover:opacity-40 transition-opacity"></div>
          <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-green-500 to-emerald-400 shadow-xl overflow-hidden">
            <div className="w-full h-full rounded-full bg-zinc-950 p-1">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-green-400 text-3xl font-bold">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Founder Badge */}
          {member.badge && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/10 whitespace-nowrap">
              {member.badge}
            </div>
          )}
        </div>

        {/* Member Info */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
            {member.name}
          </h3>
          <p className="text-emerald-500/80 font-medium text-sm tracking-wide uppercase">
            {member.role}
          </p>
        </div>

        {/* Bio */}
        <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-[240px]">
          {member.description}
        </p>

        {/* Skills Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {member.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-zinc-950/50 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:border-green-500/30 hover:text-green-400 transition-all duration-300"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4 mt-auto">
          {member.socials.linkedin && (
            <a
              href={member.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all duration-300 hover:-translate-y-1"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          )}
          {member.socials.github && (
            <a
              href={member.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#24292e] hover:border-[#24292e] transition-all duration-300 hover:-translate-y-1"
              title="GitHub"
            >
              <Github size={18} />
            </a>
          )}
          {member.socials.email && (
            <a
              href={`mailto:${member.socials.email}`}
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-green-600 hover:border-green-600 transition-all duration-300 hover:-translate-y-1"
              title="Email"
            >
              <Mail size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const OurTeam = () => {
  const { t, language } = useTranslation();

  const teamMembers = [
    {
      name: "Vignesh",
      role: t("ourTeam.vigneshRole") || "Frontend Developer",
      badge: t("ourTeam.vigneshBadge") || "Founder",
      description:
        t("ourTeam.vigneshDesc") ||
        "Passionate about building modern, responsive, and user-friendly web applications.",
      skills: [
        "HTML",
        "JavaScript",
        "Tailwind CSS",
        "React JS",
        "Node.js",
        "PHP",
        "MySQL",
      ],
      socials: {
        linkedin: "https://www.linkedin.com/in/g-vignesh-b6b6a2361/",
        github: "https://github.com/GVignesh777",
        email: "gokamvigneshcse777@gmail.com",
      },
      image: null, // Placeholder will show initial 'V'
    },
    {
      name: "Rakshith",
      role: t("ourTeam.rahulRole") || "Backend Architect",
      description:
        t("ourTeam.rahulDesc") ||
        "Specializes in scalable cloud infrastructure and high-performance API design.",
      skills: ["Node.js", "Express", "MongoDB", "Redis", "Docker", "AWS"],
      socials: {
        linkedin: "#",
        github: "#",
        email: "rahul@kisanmithr.com",
      },
      image: null,
    },
    {
      name: "Murali Krishna",
      role: t("ourTeam.ananyaRole") || "UI/UX Designer",
      description:
        t("ourTeam.ananyaDesc") ||
        "Crafting intuitive digital experiences that simplify agriculture for everyone.",
      skills: [
        "Figma",
        "Adobe XD",
        "Prototyping",
        "Design Systems",
        "Framermotion",
      ],
      socials: {
        linkedin: "#",
        github: "#",
        email: "ananya@kisanmithr.com",
      },
      image: null,
    },
    {
      name: "Navadeep",
      role: t("ourTeam.arjunRole") || "AI/ML Engineer",
      description:
        t("ourTeam.arjunDesc") ||
        "Building intelligent models for crop disease detection and yield prediction.",
      skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision", "NLP"],
      socials: {
        linkedin: "#",
        github: "#",
        email: "arjun@kisanmithr.com",
      },
      image: null,
    },
  ];

  return (
    <section className="relative py-24 bg-zinc-950 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black uppercase tracking-widest mb-2 animate-fade-in">
            {t("ourTeam.meetVisionaries") || "Meet the Visionaries"}
          </div>
          <h2
            className={`${language === "te" ? "text-2xl md:text-5xl" : "text-3xl md:text-6xl"} font-black text-white tracking-tighter leading-[1.2] md:leading-none`}
          >
            {t("ourTeam.our") || "Our"}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              {t("ourTeam.team") || "Team"}
            </span>
          </h2>
          <p className="text-zinc-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium px-4">
            {t("ourTeam.subtitle") ||
              "Passionate developers & agriculture enthusiasts working to empower farmers and buyers."}
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <TeamCard key={idx} member={member} />
          ))}
        </div>

        {/* CTA/Trust Indicator */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center gap-6 px-8 py-4 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-md">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500`}
                >
                  M{i}
                </div>
              ))}
            </div>
            <p className="text-zinc-400 text-sm font-medium">
              {t("ourTeam.supportedBy") || "Supported by"}{" "}
              <span className="text-white font-bold">
                {t("ourTeam.contributors") || "10+ Contributors"}
              </span>{" "}
              {t("ourTeam.worldWide") || "world wide"}
            </p>
            <div className="w-[1px] h-8 bg-zinc-800 hidden sm:block"></div>
            <button className="text-green-400 text-sm font-bold flex items-center gap-2 hover:text-green-300 transition-colors hidden sm:flex">
              {t("ourTeam.joinMission") || "Join our mission"}{" "}
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
