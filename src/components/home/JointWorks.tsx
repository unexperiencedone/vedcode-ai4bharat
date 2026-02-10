"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Project {
  title: string
  category: string
  image: string
  status?: "Live" | "Beta" | "Dev"
  contributors: string[]
}

const projects: Project[] = [
  {
    title: "FinTech Genesis",
    category: "DeFi Dashboard • React & Rust",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdJsEpSGk7cvQjveR5n2vxLsI1iJcURrAA-T3zKltXAar6mY6auuO-6Amh1CDUYmKvh0XfRueUop0QXw45UWMb5kXdOHJ7s9H5ewVW2XA02cbWXc39j32Xrp9jOoi_-VozpLEezrORjGdNW13ARXh8hSz1B5NLdqLt4VUUN-2HBMuz5LsYzkwfF0NTMCh2onk5D478fBWX8AywUYaxhyJra1RLH334N0g4zGlofTx5XHvbPvS0Pw0GClhdyeJXwfGLCQ0emgmgULGB",
    status: "Live",
    contributors: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDu5_PDkUcghiLurDxaOhcQ1pqdapFZvittJPitLl3cjRXN1BCAmBIOd59hb8SY7-W3CrZ5h5SBv-qgEkACQqyFjkoCzs_xqrvPHrmBo0Pd_DIgUlhbm8dvnQP0aWiXqxUeZrEBjyl0iHrxYSpqLcqxLIuYak4RKDukDsbHaAyqQyRkUD44oNizgGTgGRXRYIK7FfFeZUgrW3nVFCm7Lz2cn09MnmdQGq0m9Uiyl3QQd1I_Nu-grMNj_kIdUfwGoddshKmMZEQ2vJ-R", "https://lh3.googleusercontent.com/aida-public/AB6AXuBPBD7xPMcN1n-P-ZXmTM8msWMZiIFRn5RZn6dEprrMX861ZnhWR018XcvgehKZjSojhHe3HZyvAJPfwv0uMUm_2p7F_reJid3jTisA55Xeqa4eNLcBi0hv2HoL2zIF-1-T4Ueu_QowC2QyvCN1RYicfIhVMvJD8KRlgMTYOqLkhOHCaqCPEiYcCySjT9GIPJsIbVFCP6P_oCZcfUjT0PjCAoqiqf4ZaJ-ToGivQst8J5Zwl_WTfOkZf_qcy7H4tG00koCN8OvE9mo4"]
  },
  {
    title: "Prisma UI Kit",
    category: "Design System • Figma & Vue",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4mSFH87p846DIfTi4_7rxJV45d41R0uzApMUIJaWDZrO2qNVD0i125kxzWxhNoNn4zEdneMkq6PFnET5b9ScCnX2_bB-RNRUf1gthYmur7TI5AxnCztldZTqBf0xRuY5R4d8yoImo9kQh1MMldO6-P6d8PYgmOMxNqF94ATRNXSjWvZ3f-vRb1tSwGSDFUhBqYpcxNWzXwUJTQQakYQ_4syjhwtG4PrNOXMg7C0mPrX_LA2qePXcaGUcjSEwUgRB-3frMaNgqRBn3",
    status: "Beta",
    contributors: ["https://lh3.googleusercontent.com/aida-public/AB6AXuAVs2hLTJ-yKxMNyOUPzQGYz7i0bGLntQaK_mwvJtXWQmWGANPrkFBbJWznKG2gKTH4gtFe37ZfCAQwaXXWX_MqH0MZZNij39RckarsRDyEsqjt89-LHAk5U6MJs3qAxz0iBSGY_2v6xN5AjodNv4t2fYi8YHjZ4bXjGBgqPHok7DS-XaOID0IGa7ZxjxDKv3u1GZ1jBgdI-fUEZ5QEFaM0an3obYPwpCbZghz9hzCYclcmj1hmVY6s2j2ow_39xRuSbJbyy_LMi8zu"]
  },
    {
    title: "Nebula Stream",
    category: "Video Platform • WebGL",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBX2HFdT6Bzydl9WoJhE6aI9y_YhwlsaOunXKVYREsqV0MrozmqK11LqdaE33-zqMelxMEsLioKnPh_C80_UDRse4F79bvQevaamJM2WbVxW70JqRzjK2u0QYPKkqx-WmAP8YWIK4gNT094KLAK0tJIi6If4_bLDs_0UbBf5oLeHxCdAwfPin_hlHGH21JXMREmrZjuAwBYz1QpkkuosFrxB-IJLLCwPndQqY5iR8Trqb_qLG_aWh8qR03dURUB2vmbhdMIwbW12g7h",
    status: "Live",
    contributors: ["https://lh3.googleusercontent.com/aida-public/AB6AXuC147H2X-lzN7Dejc04ugRSJ5K9xhRvNuaVO7XPynLjzPsmaoIsZjoUbFxpE7VhDK1mveY9yjEchBpUR8Rpe7ZVXO2okgagpRQroMiTFniwEkowR1sN_DZtKllQpdXiwC7r7qbCAsa-5gmwFPOC0BW-grtUG7_pqaqxHkEKEFB5qCAtxNieV1QHcOMPACZEndhOy4bMBGlhmZpz9wPNprO7DtzIGk73cvORxiLrLmpf1iYTVDWahA3A_xyankWnsMFAgMykZouo6geW", "https://lh3.googleusercontent.com/aida-public/AB6AXuAehC7CeNAo1aYv4w1QewqH9Y5-L8JSjN65a_yR1oj2epqzj1q0pMvSGgdwe5wquNm_OcELh2nhxrcgPwytX_QiDUzpZuBRomf8nXCmb1kHGAd4MSeUdl7YdodfCQOub2tfcH2N_VsS5yCSUBCyLVyhmrnZf8TbF8bLn5fZXAPCFI5QtgA1CUFR_jXfETFH6QxKfvNbjTeKxs0yg7DMdkBTdlbz2nkTHGrZiF1TMtCtw4M_PyDsV4CEX-C4s32aNb3iKkMxqb9kW5kl", "https://lh3.googleusercontent.com/aida-public/AB6AXuAY2gyLcMQvDNk8vd4jNP31jKYE4MTwN-OFfIbt26AYmFHjhUEUv-yezck9-ySKhJYsds-5RbyzNnFjcQ7g4I-R9nLsKV6XwNdfFqcTI-NeCtHY2ZWOPKljK2d3dRkoprQdK-Uc1c6hwv3oDao96cFlK9nYV860EZ-dX-T93OPh1C5NVlIkI8QLo1EByaYCzo5eSv8D0YFrNOQSrbFYQILAC466ArXjXkhqvQcId1gWcFbN5Ez1-I6G2fq6du1UsI-N7_gDvnbrMtXF"]
  }
]

export function JointWorks() {
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { current } = scrollRef
            const scrollAmount = 600
            if (direction === "left") {
                current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
            } else {
                current.scrollBy({ left: scrollAmount, behavior: "smooth" })
            }
        }
    }

  return (
    <section className="border-b border-border/10 relative group bg-background">
      {/* Vertical Lines */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border/20 z-10 hidden md:block" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-border/20 z-10 hidden md:block" />

      {/* Header */}
      <div className="flex justify-between items-end px-6 py-8 border-b border-border/10 bg-background/50 backdrop-blur-sm sticky top-0 md:relative">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-foreground">
            Joint Works
          </h1>
          <p className="text-muted-foreground max-w-lg font-light text-sm md:text-base">
            Curated collaborative efforts pushing the boundaries of interface design and engineering.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")} className="border-border/30 hover:border-primary hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")} className="border-border/30 hover:border-primary hover:text-primary transition-colors">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrolling Content */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar py-12 px-6 gap-8 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {projects.map((project, index) => (
          <div key={index} className="flex-none w-[85vw] md:w-[600px] snap-center group/card cursor-pointer">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border/20 mb-5 bg-muted/20">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
              />
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-primary/50" />
              
              {project.status && (
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur border border-border/20 px-3 py-1 rounded-full flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    project.status === "Live" ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-emerald-500"
                  )} />
                  <span className="text-xs font-mono font-medium uppercase tracking-wider">
                    {project.status}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold group-hover/card:text-primary transition-colors mb-1">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {project.category}
                </p>
              </div>
              <div className="flex -space-x-2">
                {project.contributors.map((avatar, i) => (
                  <img 
                    key={i} 
                    src={avatar} 
                    alt="Contributor" 
                    className="w-8 h-8 rounded-full border-2 border-background"
                  />
                ))}
                {project.contributors.length > 2 && (
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                        +2
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Placeholder for "More" or spacing */}
        <div className="w-12 flex-none" />
      </div>
    </section>
  )
}
