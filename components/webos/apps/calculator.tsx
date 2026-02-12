"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function CalculatorApp() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (!display.includes(".")) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperator(null)
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = Number.parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operator) {
      const result = calculate(previousValue, inputValue, operator)
      setDisplay(String(result))
      setPreviousValue(result)
    }

    setWaitingForOperand(true)
    setOperator(nextOperator)
  }

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+":
        return a + b
      case "-":
        return a - b
      case "×":
        return a * b
      case "÷":
        return b !== 0 ? a / b : 0
      default:
        return b
    }
  }

  const equals = () => {
    if (operator && previousValue !== null) {
      const inputValue = Number.parseFloat(display)
      const result = calculate(previousValue, inputValue, operator)
      setDisplay(String(result))
      setPreviousValue(null)
      setOperator(null)
      setWaitingForOperand(true)
    }
  }

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ]

  const isOperator = (btn: string) => ["+", "-", "×", "÷"].includes(btn)

  return (
    <div className="h-full flex flex-col bg-[oklch(0.10_0.01_250)] p-4">
      {/* Display */}
      <div className="bg-black/40 rounded-xl p-4 mb-4">
        <div className="text-right text-4xl font-light text-white truncate">{display}</div>
      </div>

      {/* Buttons */}
      <div className="flex-1 grid grid-rows-5 gap-2">
        {buttons.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-2"
            style={{ gridTemplateColumns: row.length === 3 ? "2fr 1fr 1fr" : "repeat(4, 1fr)" }}
          >
            {row.map((btn) => (
              <button
                key={btn}
                className={cn(
                  "rounded-xl text-xl font-medium transition-all active:scale-95",
                  btn === "C" || btn === "±" || btn === "%"
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : isOperator(btn) || btn === "="
                      ? "bg-primary text-white hover:bg-primary/80"
                      : "bg-white/10 text-white hover:bg-white/20",
                )}
                onClick={() => {
                  if (btn === "C") clear()
                  else if (btn === "=") equals()
                  else if (btn === ".") inputDecimal()
                  else if (isOperator(btn)) performOperation(btn)
                  else if (btn === "±") setDisplay(String(-Number.parseFloat(display)))
                  else if (btn === "%") setDisplay(String(Number.parseFloat(display) / 100))
                  else inputDigit(btn)
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
