"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Code2, ExternalLink, ArrowRight } from "lucide-react"
import Badge from "@/components/ui/Badge"

export default function Hero() {
  return (
    <section className="max-w-[1100px] mx-auto px-6 pt-24 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0, ease: "easeOut" }}
        className="mb-6"
      >
        <Badge variant="available" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.07, ease: "easeOut" }}
        className="font-display text-5xl md:text-6xl lg:text-7xl text-[var(--text-primary)] leading-[1.1] mb-6 max-w-3xl"
      >
        I build the backend that makes SaaS scale.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14, ease: "easeOut" }}
        className="text-[var(--text-secondary)] text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
      >
        Senior software engineer specialising in distributed systems, multi-tenant SaaS,
        and cross-platform mobile apps — Lagos, Nigeria.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.21, ease: "easeOut" }}
        className="flex flex-wrap items-center gap-4"
      >
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[#0A0A0A] text-sm font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors"
        >
          View My Work <ArrowRight size={16} />
        </Link>
        <Link
          href="/writing"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent text-[var(--text-secondary)] text-sm font-medium rounded-md border border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
        >
          Read My Writing
        </Link>
        <div className="flex items-center gap-3 ml-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="GitHub"
          >
            <Code2 size={20} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="LinkedIn"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </motion.div>
    </section>
  )
}
