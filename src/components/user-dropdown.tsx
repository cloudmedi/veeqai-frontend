import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import React from "react"

interface DropdownItem {
  label: string
  icon?: React.ComponentType<any>
  onClick: () => void
  disabled?: boolean
  className?: string
}

interface UserDropdownProps {
  trigger: React.ReactNode
  items: (DropdownItem | "separator")[]
}

export function UserDropdown({ trigger, items }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-background dark:bg-black/90 dark:backdrop-blur-xl border border-border dark:border-white/10 rounded-lg shadow-lg z-50 min-w-[200px] py-1">
          {items.map((item, index) => {
            if (item === "separator") {
              return <div key={index} className="h-px bg-border dark:bg-white/10 my-1" />
            }
            
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick()
                    setIsOpen(false)
                  }
                }}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                  item.disabled 
                    ? "cursor-default"
                    : "hover:bg-accent cursor-pointer",
                  item.className
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}