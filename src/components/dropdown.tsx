import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownProps {
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
}

export function Dropdown({ value, options, onChange, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleOtherDropdownClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const clickedDropdown = target.closest('[data-dropdown]')
      
      if (clickedDropdown && clickedDropdown !== dropdownRef.current) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('click', handleOtherDropdownClick)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('click', handleOtherDropdownClick)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef} data-dropdown>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors",
          className
        )}
      >
        <span className="text-sm">{value}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[200px]">
          {options.map((option, index) => (
            <button
              key={option}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors",
                value === option && "bg-accent",
                index === 0 && "rounded-t-lg",
                index === options.length - 1 && "rounded-b-lg"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}